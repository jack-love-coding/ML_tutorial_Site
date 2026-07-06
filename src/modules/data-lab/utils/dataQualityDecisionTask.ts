import {
  clipColumn,
  dropDuplicates,
  fillMissing,
  housingTeachingTable,
  isMissing,
  tableShape,
} from './tableTransforms.ts'

export const dataQualityDecisionScenarioIds = [
  'missing-rooms',
  'duplicate-listing',
  'price-outlier',
  'label-timing',
  'imbalance-baseline',
] as const

export const dataQualityIssueTypes = [
  'missingness',
  'duplicate',
  'outlier',
  'label-timing',
  'imbalance',
] as const

export const dataQualityTreatments = [
  'impute',
  'deduplicate',
  'clip-or-flag',
  'remove-leaky-signal',
  'use-baseline-and-metrics',
  'collect-more-data',
] as const

export const dataQualityRiskLevels = ['low', 'medium', 'high'] as const

export type DataQualityDecisionScenarioId = (typeof dataQualityDecisionScenarioIds)[number]
export type DataQualityIssueType = (typeof dataQualityIssueTypes)[number]
export type DataQualityTreatment = (typeof dataQualityTreatments)[number]
export type DataQualityRiskLevel = (typeof dataQualityRiskLevels)[number]

export interface DataQualityDecisionConfig {
  scenarioId: DataQualityDecisionScenarioId
  selectedIssue: DataQualityIssueType
  selectedTreatment: DataQualityTreatment
  selectedRisk: DataQualityRiskLevel
}

export interface DataQualityDecisionSnapshot {
  scenarioId: DataQualityDecisionScenarioId
  expectedIssue: DataQualityIssueType
  recommendedTreatments: DataQualityTreatment[]
  recommendedRisk: DataQualityRiskLevel
  safe: boolean
  warnings: string[]
  evidence: {
    check: string
    finding: string
    affectedRows: number
    affectedColumns: string[]
    metric: string
  }
  impact: {
    beforeShape: string
    afterShape: string
    projectRisk: string
  }
  decisionRecord: {
    issue: string
    evidence: string
    treatment: string
    risk: string
    projectImpact: string
  }
  codeLines: string[]
}

interface ScenarioDefinition {
  id: DataQualityDecisionScenarioId
  issue: DataQualityIssueType
  treatments: DataQualityTreatment[]
  risk: DataQualityRiskLevel
  evidence: DataQualityDecisionSnapshot['evidence']
  afterShape: string
  projectRisk: string
  codeLines: string[]
}

function includesValue<T extends readonly string[]>(values: T, candidate: string): candidate is T[number] {
  return values.includes(candidate)
}

function formatShape(rows: number, columns: number): string {
  return `[${rows},${columns}]`
}

function currentShape(): string {
  const shape = tableShape(housingTeachingTable)
  return formatShape(shape.rows, shape.columns)
}

function missingRoomsScenario(): ScenarioDefinition {
  const missingRows = housingTeachingTable.rows.filter((row) => isMissing(row.rooms)).length
  const afterShape = tableShape(fillMissing(housingTeachingTable, 'rooms', 3))

  return {
    id: 'missing-rooms',
    issue: 'missingness',
    treatments: ['impute', 'collect-more-data'],
    risk: 'medium',
    evidence: {
      check: "df['rooms'].isna().sum()",
      finding: `${missingRows} rows have missing room counts`,
      affectedRows: missingRows,
      affectedColumns: ['rooms'],
      metric: `missing rooms: ${missingRows}/${housingTeachingTable.rows.length}`,
    },
    afterShape: formatShape(afterShape.rows, afterShape.columns),
    projectRisk: 'The housing model can learn a biased room-price relationship if missing rows are dropped blindly.',
    codeLines: [
      "missing_rooms = df['rooms'].isna().sum()",
      "rooms_fill = train_df['rooms'].median()",
      "df['rooms'] = df['rooms'].fillna(rooms_fill)",
    ],
  }
}

function duplicateListingScenario(): ScenarioDefinition {
  const deduped = dropDuplicates(housingTeachingTable, ['id'])
  const beforeShape = tableShape(housingTeachingTable)
  const afterShape = tableShape(deduped)
  const duplicateRows = beforeShape.rows - afterShape.rows

  return {
    id: 'duplicate-listing',
    issue: 'duplicate',
    treatments: ['deduplicate'],
    risk: 'medium',
    evidence: {
      check: "df.duplicated(subset=['id']).sum()",
      finding: `${duplicateRows} duplicate listing repeats an existing record id`,
      affectedRows: duplicateRows,
      affectedColumns: ['id'],
      metric: `duplicate rows: ${duplicateRows}`,
    },
    afterShape: formatShape(afterShape.rows, afterShape.columns),
    projectRisk: 'Repeated listings can overweight one house and distort housing summary statistics before training.',
    codeLines: [
      "duplicate_count = df.duplicated(subset=['id']).sum()",
      "df = df.drop_duplicates(subset=['id'])",
      'audit_shape_change(before=df_before.shape, after=df.shape)',
    ],
  }
}

function priceOutlierScenario(): ScenarioDefinition {
  const clipped = clipColumn(housingTeachingTable, 'price', 100, 1200)
  const afterShape = tableShape(clipped)
  const outlierRows = housingTeachingTable.rows.filter((row) => Number(row.price) > 1200).length

  return {
    id: 'price-outlier',
    issue: 'outlier',
    treatments: ['clip-or-flag', 'collect-more-data'],
    risk: 'high',
    evidence: {
      check: "df['price'].max()",
      finding: `${outlierRows} price is far beyond the teaching range`,
      affectedRows: outlierRows,
      affectedColumns: ['price'],
      metric: 'max price: 9800',
    },
    afterShape: formatShape(afterShape.rows, afterShape.columns),
    projectRisk: 'Blindly deleting or clipping a luxury-house outlier can remove a real housing segment.',
    codeLines: [
      "price_max = df['price'].max()",
      "df['price_outlier_flag'] = df['price'] > 1200",
      "df['price'] = df['price'].clip(lower=100, upper=1200)  # only after review",
    ],
  }
}

function labelTimingScenario(): ScenarioDefinition {
  const shape = tableShape(housingTeachingTable)

  return {
    id: 'label-timing',
    issue: 'label-timing',
    treatments: ['remove-leaky-signal', 'collect-more-data'],
    risk: 'high',
    evidence: {
      check: 'feature_available_at <= prediction_time',
      finding: 'post_sale_review is only known after the sale outcome',
      affectedRows: shape.rows,
      affectedColumns: ['post_sale_review'],
      metric: 'availability: after prediction_time',
    },
    afterShape: formatShape(shape.rows, shape.columns),
    projectRisk: 'Future information can inflate validation scores and disappear when the housing model is served.',
    codeLines: [
      'prediction_time = listing_created_at',
      "leaky = features[features['available_at'] > prediction_time]",
      "features = features.drop(columns=['post_sale_review'])",
    ],
  }
}

function imbalanceBaselineScenario(): ScenarioDefinition {
  const labels = [false, false, false, false, false, true]
  const positiveCount = labels.filter(Boolean).length
  const share = (positiveCount / labels.length) * 100
  const shape = tableShape(housingTeachingTable)

  return {
    id: 'imbalance-baseline',
    issue: 'imbalance',
    treatments: ['use-baseline-and-metrics', 'collect-more-data'],
    risk: 'medium',
    evidence: {
      check: "df['sold_within_30d'].value_counts(normalize=True)",
      finding: `${positiveCount} positive label appears in ${labels.length} examples`,
      affectedRows: positiveCount,
      affectedColumns: ['sold_within_30d'],
      metric: `positive share: ${share.toFixed(1)}%`,
    },
    afterShape: formatShape(shape.rows, shape.columns),
    projectRisk: 'A majority baseline can make accuracy look high while the housing project misses rare positive cases.',
    codeLines: [
      "class_share = df['sold_within_30d'].value_counts(normalize=True)",
      'majority_baseline = class_share.max()',
      "report_metrics = ['recall', 'precision', 'confusion_matrix']",
    ],
  }
}

function scenarioDefinition(scenarioId: DataQualityDecisionScenarioId): ScenarioDefinition {
  if (scenarioId === 'duplicate-listing') return duplicateListingScenario()
  if (scenarioId === 'price-outlier') return priceOutlierScenario()
  if (scenarioId === 'label-timing') return labelTimingScenario()
  if (scenarioId === 'imbalance-baseline') return imbalanceBaselineScenario()
  return missingRoomsScenario()
}

function normalizeScenarioId(value: DataQualityDecisionConfig['scenarioId']): DataQualityDecisionScenarioId {
  return includesValue(dataQualityDecisionScenarioIds, String(value)) ? value : 'missing-rooms'
}

function riskRank(risk: DataQualityRiskLevel): number {
  return dataQualityRiskLevels.indexOf(risk)
}

function normalizeIssue(value: DataQualityDecisionConfig['selectedIssue'], fallback: DataQualityIssueType) {
  return includesValue(dataQualityIssueTypes, String(value)) ? value : fallback
}

function normalizeTreatment(value: DataQualityDecisionConfig['selectedTreatment'], fallback: DataQualityTreatment) {
  return includesValue(dataQualityTreatments, String(value)) ? value : fallback
}

function normalizeRisk(value: DataQualityDecisionConfig['selectedRisk'], fallback: DataQualityRiskLevel) {
  return includesValue(dataQualityRiskLevels, String(value)) ? value : fallback
}

function warningsForSelection(
  definition: ScenarioDefinition,
  selectedIssue: DataQualityIssueType,
  selectedTreatment: DataQualityTreatment,
  selectedRisk: DataQualityRiskLevel,
): string[] {
  const warnings: string[] = []

  if (selectedIssue !== definition.issue) {
    warnings.push(`expected ${definition.issue} issue, but selected ${selectedIssue}`)
  }

  if (!definition.treatments.includes(selectedTreatment)) {
    warnings.push(`recommended treatment is ${definition.treatments.join(' or ')}, not ${selectedTreatment}`)
  }

  if (riskRank(selectedRisk) < riskRank(definition.risk)) {
    warnings.push(`risk is understated: expected at least ${definition.risk}`)
  }

  return warnings
}

export function buildDataQualityDecisionSnapshot(config: DataQualityDecisionConfig): DataQualityDecisionSnapshot {
  const scenarioId = normalizeScenarioId(config.scenarioId)
  const definition = scenarioDefinition(scenarioId)
  const selectedIssue = normalizeIssue(config.selectedIssue, definition.issue)
  const selectedTreatment = normalizeTreatment(config.selectedTreatment, definition.treatments[0])
  const selectedRisk = normalizeRisk(config.selectedRisk, definition.risk)
  const warnings = warningsForSelection(definition, selectedIssue, selectedTreatment, selectedRisk)

  return {
    scenarioId,
    expectedIssue: definition.issue,
    recommendedTreatments: [...definition.treatments],
    recommendedRisk: definition.risk,
    safe: warnings.length === 0,
    warnings,
    evidence: { ...definition.evidence, affectedColumns: [...definition.evidence.affectedColumns] },
    impact: {
      beforeShape: currentShape(),
      afterShape: definition.afterShape,
      projectRisk: definition.projectRisk,
    },
    decisionRecord: {
      issue: selectedIssue,
      evidence: `${definition.evidence.finding}; ${definition.evidence.metric}`,
      treatment: selectedTreatment,
      risk: selectedRisk,
      projectImpact: definition.projectRisk,
    },
    codeLines: [...definition.codeLines],
  }
}
