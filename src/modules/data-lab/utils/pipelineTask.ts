export const dataPipelineScenarioIds = ['safe', 'fit-before-split', 'vocab-on-all'] as const

export type PipelineScenarioId = (typeof dataPipelineScenarioIds)[number]
export type PipelineFitSource = 'train' | 'all' | 'none'

export interface DataPipelineTaskConfig {
  scenarioId: PipelineScenarioId
  includeRooms: boolean
  includePrice: boolean
  includeDistrict: boolean
}

export interface DataPipelineTaskSnapshot {
  scenarioId: PipelineScenarioId
  safe: boolean
  leakageReasons: string[]
  splitCounts: { train: number; validation: number; test: number }
  fitSources: { scaler: PipelineFitSource; vocabulary: PipelineFitSource }
  featureCounts: { numeric: number; categoricalSlots: number; total: number }
  matrixShapes: { train: string; validation: string; test: string }
  codeLines: string[]
}

type PipelineSplit = 'train' | 'validation' | 'test'
type NumericFeature = 'rooms' | 'price'

export interface PipelineTeachingRow {
  id: string
  split: PipelineSplit
  rooms: number
  price: number
  district: string
}

export const dataPipelineTeachingRows: PipelineTeachingRow[] = [
  { id: 'A-01', split: 'train', rooms: 3, price: 420, district: 'north' },
  { id: 'A-02', split: 'train', rooms: 2, price: 310, district: 'south' },
  { id: 'B-03', split: 'train', rooms: 4, price: 530, district: 'west' },
  { id: 'C-04', split: 'train', rooms: 1, price: 280, district: 'north' },
  { id: 'V-01', split: 'validation', rooms: 3, price: 390, district: 'east' },
  { id: 'T-01', split: 'test', rooms: 5, price: 610, district: 'south' },
]

function selectedNumericFeatures(config: DataPipelineTaskConfig): NumericFeature[] {
  const features: NumericFeature[] = []
  if (config.includeRooms) features.push('rooms')
  if (config.includePrice) features.push('price')
  return features
}

function countBySplit(rows: PipelineTeachingRow[]) {
  return rows.reduce(
    (counts, row) => {
      counts[row.split] += 1
      return counts
    },
    { train: 0, validation: 0, test: 0 },
  )
}

function uniqueDistrictCount(source: PipelineFitSource): number {
  if (source === 'none') return 0
  const rows =
    source === 'train' ? dataPipelineTeachingRows.filter((row) => row.split === 'train') : dataPipelineTeachingRows
  return new Set(rows.map((row) => row.district)).size
}

function matrixShape(rowCount: number, featureCount: number): string {
  return `[${rowCount},${featureCount}]`
}

function normalizeScenarioId(scenarioId: PipelineScenarioId): PipelineScenarioId {
  return (dataPipelineScenarioIds as readonly string[]).includes(scenarioId) ? scenarioId : 'safe'
}

function buildCodeLines(fitSources: DataPipelineTaskSnapshot['fitSources']): string[] {
  const lines = ['train, validation, test = split(raw_rows)']

  if (fitSources.scaler === 'all' || fitSources.vocabulary === 'all') {
    lines.push('preprocess.fit(raw_rows)  # unsafe: validation/test are visible')
  } else if (fitSources.scaler === 'train' || fitSources.vocabulary === 'train') {
    lines.push('preprocess.fit(X_train)')
  } else {
    lines.push('preprocess = identity_transform()')
  }

  lines.push('X_train = preprocess.transform(train)')
  lines.push('X_validation = preprocess.transform(validation)')
  lines.push('X_test = preprocess.transform(test)')

  return lines
}

export function buildDataPipelineTaskSnapshot(config: DataPipelineTaskConfig): DataPipelineTaskSnapshot {
  const scenarioId = normalizeScenarioId(config.scenarioId)
  const numericFeatures = selectedNumericFeatures(config)
  const splitCounts = countBySplit(dataPipelineTeachingRows)
  const scaler: PipelineFitSource = numericFeatures.length === 0 ? 'none' : scenarioId === 'fit-before-split' ? 'all' : 'train'
  const vocabulary: PipelineFitSource = config.includeDistrict ? (scenarioId === 'vocab-on-all' ? 'all' : 'train') : 'none'
  const categoricalSlots = uniqueDistrictCount(vocabulary)
  const totalFeatureCount = numericFeatures.length + categoricalSlots
  const leakageReasons: string[] = []

  if (scaler === 'all') {
    leakageReasons.push('scaler fit on all rows before split leaks validation/test statistics')
  }

  if (vocabulary === 'all') {
    leakageReasons.push('vocabulary fit on all rows leaks validation/test categories')
  }

  const fitSources = { scaler, vocabulary }

  return {
    scenarioId,
    safe: leakageReasons.length === 0,
    leakageReasons,
    splitCounts,
    fitSources,
    featureCounts: {
      numeric: numericFeatures.length,
      categoricalSlots,
      total: totalFeatureCount,
    },
    matrixShapes: {
      train: matrixShape(splitCounts.train, totalFeatureCount),
      validation: matrixShape(splitCounts.validation, totalFeatureCount),
      test: matrixShape(splitCounts.test, totalFeatureCount),
    },
    codeLines: buildCodeLines(fitSources),
  }
}
