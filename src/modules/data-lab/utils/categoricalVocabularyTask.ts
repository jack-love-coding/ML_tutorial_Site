import {
  activeSparseIndices,
  buildCategoryVocabulary,
  encodeOneHot,
  type CategoryVocabulary,
} from './tableTransforms.ts'

export const categoricalVocabularyScenarioIds = [
  'safe-train-vocab',
  'validation-recomputed',
  'all-data-vocab',
  'id-high-cardinality',
] as const

export type CategoricalVocabularyScenarioId = (typeof categoricalVocabularyScenarioIds)[number]
export type CategoricalVocabularyFitSource = 'train' | 'validation' | 'all'
export type CategoricalVocabularySplit = 'train' | 'validation' | 'test' | 'serving'
export type CategoricalVocabularyFeature = 'district' | 'propertyType' | 'recordId'

export interface CategoricalVocabularyTaskConfig {
  scenarioId: CategoricalVocabularyScenarioId
  includeDistrict: boolean
  includePropertyType: boolean
  includeRecordId: boolean
  rareThreshold: number
}

export interface CategoricalVocabularyTaskSnapshot {
  scenarioId: CategoricalVocabularyScenarioId
  safe: boolean
  warnings: string[]
  fitSource: CategoricalVocabularyFitSource
  trainVocabulary: Array<{
    feature: CategoricalVocabularyFeature
    tokens: string[]
    rareValues: string[]
  }>
  transformRows: Array<{
    split: CategoricalVocabularySplit
    raw: Record<string, string>
    mapped: Record<string, string>
    activeSlots: string[]
  }>
  featureCounts: {
    selectedFeatures: number
    categoricalSlots: number
    total: number
  }
  matrixShapes: {
    train: string
    validation: string
    test: string
    serving: string
  }
  slotAlignment: Array<{
    index: number
    trainSlot: string
    validationSlot: string
    aligned: boolean
  }>
  codeLines: string[]
}

interface CategoricalVocabularyTeachingRow {
  id: string
  split: CategoricalVocabularySplit
  district: string
  propertyType: string
  recordId: string
}

export const categoricalVocabularyTeachingRows: CategoricalVocabularyTeachingRow[] = [
  { id: 'A-01', split: 'train', district: 'north', propertyType: 'condo', recordId: 'listing-a-01' },
  { id: 'A-02', split: 'train', district: 'south', propertyType: 'apartment', recordId: 'listing-a-02' },
  { id: 'A-03', split: 'train', district: 'south', propertyType: 'condo', recordId: 'listing-a-03' },
  { id: 'A-04', split: 'train', district: 'west', propertyType: 'house', recordId: 'listing-a-04' },
  { id: 'A-05', split: 'train', district: 'north', propertyType: 'apartment', recordId: 'listing-a-05' },
  { id: 'V-01', split: 'validation', district: 'harbor', propertyType: 'loft', recordId: 'listing-v-01' },
  { id: 'T-01', split: 'test', district: 'airport', propertyType: 'condo', recordId: 'listing-t-01' },
  { id: 'S-01', split: 'serving', district: 'island', propertyType: 'townhouse', recordId: 'listing-s-01' },
]

function normalizeScenarioId(scenarioId: CategoricalVocabularyScenarioId): CategoricalVocabularyScenarioId {
  return (categoricalVocabularyScenarioIds as readonly string[]).includes(scenarioId)
    ? scenarioId
    : 'safe-train-vocab'
}

function normalizeRareThreshold(value: number): number {
  if (!Number.isFinite(value)) return 2
  return Math.min(3, Math.max(1, Math.round(value)))
}

function selectedFeatures(config: CategoricalVocabularyTaskConfig): CategoricalVocabularyFeature[] {
  const features: CategoricalVocabularyFeature[] = []
  if (config.includeDistrict) features.push('district')
  if (config.includePropertyType) features.push('propertyType')
  if (config.includeRecordId) features.push('recordId')
  return features.length ? features : ['district']
}

function rowsForSource(source: CategoricalVocabularyFitSource): CategoricalVocabularyTeachingRow[] {
  if (source === 'train') return categoricalVocabularyTeachingRows.filter((row) => row.split === 'train')
  if (source === 'validation') return categoricalVocabularyTeachingRows.filter((row) => row.split === 'validation')
  return categoricalVocabularyTeachingRows.filter((row) => row.split !== 'serving')
}

function fitSourceForScenario(scenarioId: CategoricalVocabularyScenarioId): CategoricalVocabularyFitSource {
  if (scenarioId === 'validation-recomputed') return 'validation'
  if (scenarioId === 'all-data-vocab') return 'all'
  return 'train'
}

function buildVocabulary(
  rows: CategoricalVocabularyTeachingRow[],
  feature: CategoricalVocabularyFeature,
  rareThreshold: number,
): CategoryVocabulary {
  return buildCategoryVocabulary(
    rows.map((row) => row[feature]),
    {
      minFrequency: feature === 'recordId' ? 1 : rareThreshold,
      includeOov: true,
    },
  )
}

function buildVocabularyMap(
  rows: CategoricalVocabularyTeachingRow[],
  features: CategoricalVocabularyFeature[],
  rareThreshold: number,
): Record<CategoricalVocabularyFeature, CategoryVocabulary> {
  return features.reduce(
    (vocabularies, feature) => {
      vocabularies[feature] = buildVocabulary(rows, feature, rareThreshold)
      return vocabularies
    },
    Object.create(null) as Record<CategoricalVocabularyFeature, CategoryVocabulary>,
  )
}

function matrixShape(rowCount: number, featureCount: number): string {
  return `[${rowCount},${featureCount}]`
}

function rowCounts() {
  return categoricalVocabularyTeachingRows.reduce(
    (counts, row) => {
      counts[row.split] += 1
      return counts
    },
    { train: 0, validation: 0, test: 0, serving: 0 },
  )
}

function vocabularyRows(
  vocabularies: Record<CategoricalVocabularyFeature, CategoryVocabulary>,
  features: CategoricalVocabularyFeature[],
): CategoricalVocabularyTaskSnapshot['trainVocabulary'] {
  return features.map((feature) => ({
    feature,
    tokens: [...vocabularies[feature].tokens],
    rareValues: [...vocabularies[feature].rareValues],
  }))
}

function slotLabels(
  vocabularies: Record<CategoricalVocabularyFeature, CategoryVocabulary>,
  features: CategoricalVocabularyFeature[],
): string[] {
  return features.flatMap((feature) => vocabularies[feature].tokens.map((token) => `${feature}:${token}`))
}

function buildSlotAlignment(
  trainVocabularies: Record<CategoricalVocabularyFeature, CategoryVocabulary>,
  validationVocabularies: Record<CategoricalVocabularyFeature, CategoryVocabulary>,
  features: CategoricalVocabularyFeature[],
): CategoricalVocabularyTaskSnapshot['slotAlignment'] {
  const trainSlots = slotLabels(trainVocabularies, features)
  const validationSlots = slotLabels(validationVocabularies, features)
  const length = Math.max(trainSlots.length, validationSlots.length)

  return Array.from({ length }, (_, index) => {
    const trainSlot = trainSlots[index] ?? '<missing>'
    const validationSlot = validationSlots[index] ?? '<missing>'
    return {
      index,
      trainSlot,
      validationSlot,
      aligned: trainSlot === validationSlot,
    }
  })
}

function transformRows(
  vocabularies: Record<CategoricalVocabularyFeature, CategoryVocabulary>,
  features: CategoricalVocabularyFeature[],
): CategoricalVocabularyTaskSnapshot['transformRows'] {
  return categoricalVocabularyTeachingRows.map((row) => {
    const raw = Object.fromEntries(features.map((feature) => [feature, row[feature]]))
    const mapped: Record<string, string> = Object.create(null)
    const activeSlots: string[] = []

    for (const feature of features) {
      const vocabulary = vocabularies[feature]
      const vector = encodeOneHot(row[feature], vocabulary)
      const activeIndex = activeSparseIndices(vector)[0]
      const token = activeIndex === undefined ? vocabulary.oovToken : vocabulary.tokens[activeIndex]
      mapped[feature] = token
      if (activeIndex !== undefined) activeSlots.push(`${feature}:${token}`)
    }

    return {
      split: row.split,
      raw,
      mapped,
      activeSlots,
    }
  })
}

function buildWarnings(scenarioId: CategoricalVocabularyScenarioId, features: CategoricalVocabularyFeature[]): string[] {
  const warnings: string[] = []

  if (scenarioId === 'validation-recomputed') {
    warnings.push('validation vocabulary recomputed separately; slot alignment can drift from train vocabulary')
  }

  if (scenarioId === 'all-data-vocab') {
    warnings.push('all-data vocabulary leaks validation/test categories into preprocessing rules')
  }

  if (scenarioId === 'id-high-cardinality' && features.includes('recordId')) {
    warnings.push('high-cardinality ID feature can memorize training rows and expand sparse [B,F] width')
  }

  return warnings
}

function buildCodeLines(fitSource: CategoricalVocabularyFitSource): string[] {
  if (fitSource === 'validation') {
    return [
      'train_vocab = fit_vocabulary(train_rows)',
      'validation_columns = get_dummies(validation_rows)  # unsafe: recomputed slots',
      'X_validation = align_or_fail(validation_columns, train_vocab)',
    ]
  }

  if (fitSource === 'all') {
    return [
      'train, validation, test = split(raw_rows)',
      'vocab = fit_vocabulary(train + validation + test)  # unsafe leakage',
      'X_train, X_validation, X_test = transform_with(vocab)',
    ]
  }

  return [
    'train, validation, test = split(raw_rows)',
    'vocab = fit_vocabulary(train)',
    'X_validation = transform_with_saved_slots(validation, vocab)',
    'X_serving = transform_with_saved_slots(new_rows, vocab)',
  ]
}

export function buildCategoricalVocabularyTaskSnapshot(
  config: CategoricalVocabularyTaskConfig,
): CategoricalVocabularyTaskSnapshot {
  const scenarioId = normalizeScenarioId(config.scenarioId)
  const rareThreshold = normalizeRareThreshold(config.rareThreshold)
  const features = selectedFeatures(config)
  const fitSource = fitSourceForScenario(scenarioId)
  const fitRows = rowsForSource(fitSource)
  const fitVocabularies = buildVocabularyMap(fitRows, features, rareThreshold)
  const trainVocabularies = buildVocabularyMap(rowsForSource('train'), features, rareThreshold)
  const validationVocabularies = buildVocabularyMap(rowsForSource('validation'), features, rareThreshold)
  const comparisonVocabularies =
    scenarioId === 'validation-recomputed'
      ? validationVocabularies
      : scenarioId === 'all-data-vocab'
        ? fitVocabularies
        : trainVocabularies
  const counts = rowCounts()
  const categoricalSlots = features.reduce((total, feature) => total + fitVocabularies[feature].tokens.length, 0)
  const warnings = buildWarnings(scenarioId, features)

  return {
    scenarioId,
    safe: warnings.length === 0,
    warnings,
    fitSource,
    trainVocabulary: vocabularyRows(fitVocabularies, features),
    transformRows: transformRows(fitVocabularies, features),
    featureCounts: {
      selectedFeatures: features.length,
      categoricalSlots,
      total: categoricalSlots,
    },
    matrixShapes: {
      train: matrixShape(counts.train, categoricalSlots),
      validation: matrixShape(counts.validation, categoricalSlots),
      test: matrixShape(counts.test, categoricalSlots),
      serving: matrixShape(counts.serving, categoricalSlots),
    },
    slotAlignment: buildSlotAlignment(trainVocabularies, comparisonVocabularies, features),
    codeLines: buildCodeLines(fitSource),
  }
}
