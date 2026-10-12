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
  scalerStats: Array<{ feature: NumericFeature; mean: number; standardDeviation: number; validationValue: number; transformedValidation: number }>
  vocabulary: string[]
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

function buildCodeLines(fitSources: DataPipelineTaskSnapshot['fitSources'], numericFeatures: NumericFeature[]): string[] {
  const lines = ['# Pseudocode: inspect the fit boundary, not a standalone script.', `numeric = ${JSON.stringify(numericFeatures)}`]
  if (fitSources.scaler === 'all') lines.push('scaler.fit(raw_rows[numeric])  # leakage: before split')
  lines.push('X_train, X_validation, X_test = split(raw_rows)')
  if (fitSources.scaler === 'train') lines.push('scaler.fit(X_train[numeric])')
  if (fitSources.vocabulary !== 'none') {
    lines.push(`encoder.fit(${fitSources.vocabulary === 'train' ? 'X_train' : 'raw_rows'}[["district"]])${fitSources.vocabulary === 'all' ? '  # leakage: held-out categories' : ''}`)
  }
  lines.push('for X in [X_train, X_validation, X_test]:')
  if (fitSources.scaler !== 'none') lines.push('    numeric_output = scaler.transform(X[numeric])')
  if (fitSources.vocabulary !== 'none') lines.push('    category_output = encoder.transform(X[["district"]])  # unknown → all zeros')
  if (fitSources.scaler === 'none' && fitSources.vocabulary === 'none') lines.push('    output = empty_matrix(rows=len(X), columns=0)')
  else lines.push('    # Concatenate the enabled outputs in a fixed column order.')
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
  const fitRows = scaler === 'all' ? dataPipelineTeachingRows : dataPipelineTeachingRows.filter(row => row.split === 'train')
  const validation = dataPipelineTeachingRows.find(row => row.split === 'validation')!
  const scalerStats = numericFeatures.map(feature => {
    const mean = fitRows.reduce((total, row) => total + row[feature], 0) / fitRows.length
    // Population standard deviation matches StandardScaler (ddof=0).
    const standardDeviation = Math.sqrt(fitRows.reduce((total, row) => total + (row[feature] - mean) ** 2, 0) / fitRows.length)
    return { feature, mean, standardDeviation, validationValue: validation[feature], transformedValidation: (validation[feature] - mean) / (standardDeviation || 1) }
  })

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
    scalerStats,
    vocabulary: vocabulary === 'none' ? [] : [...new Set(dataPipelineTeachingRows.filter(row => vocabulary === 'all' || row.split === 'train').map(row => row.district))].sort(),
    codeLines: buildCodeLines(fitSources, numericFeatures),
  }
}
