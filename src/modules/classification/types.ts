import type { LocalizedCopy } from '../../types/ml.ts'

export const CLASSIFICATION_PHASE_30_CONTRACT = 'classification-phase-30-v1' as const

export type ClassificationSplit = 'train' | 'validation' | 'test'

export interface ClassificationFrozenPrediction {
  rowId: number
  split: ClassificationSplit
  label: 0 | 1
  logit: number
  probability: number
}

export interface ClassificationDecisionRow extends ClassificationFrozenPrediction {
  threshold: number
  predicted: 0 | 1
  outcome: 'tp' | 'fp' | 'tn' | 'fn'
}

export interface ClassificationConfusionMatrix {
  tp: number
  fp: number
  tn: number
  fn: number
}

export interface ClassificationBinaryMetrics {
  accuracy: number
  precision: number
  recall: number
  specificity: number
  f1: number
  fpr: number
  tpr: number
  predictedPositiveRate: number
  actualPositiveRate: number
}

export interface ClassificationThresholdPoint {
  threshold: number
  confusion: ClassificationConfusionMatrix
  metrics: ClassificationBinaryMetrics
  totalCost: number
  costPerExample: number
}

export interface ClassificationRocPoint {
  threshold: number
  fpr: number
  tpr: number
}

export interface ClassificationRocOutput {
  split: 'validation'
  auc: number
  interpretation: LocalizedCopy
  thresholdSelectionAllowed: false
  points: ClassificationRocPoint[]
}

export interface ClassificationFoldDecision {
  fold: number
  rowCount: number
  selectedThreshold: number
  minimumCost: number
}

export interface ClassificationCostOutput {
  selectionSplit: 'validation'
  finalEvaluationSplit: 'test'
  falsePositiveCost: number
  falseNegativeCost: number
  tieBreak: 'closest-to-0.5-then-lower'
  selectedThreshold: number
  foldRule: 'row-id-modulo-5'
  folds: ClassificationFoldDecision[]
  variation: { minimum: number; maximum: number }
  validation: ClassificationThresholdPoint
  lockedTest: ClassificationThresholdPoint
  testEvaluations: 1
  reselectionAllowed: false
  interpretation: LocalizedCopy
}

export interface ClassificationFeatureValues {
  variance: number
  skewness: number
  curtosis: number
  entropy: number
}

export interface ClassificationNamedError extends ClassificationDecisionRow {
  features: ClassificationFeatureValues
  distanceFromThreshold: number
}

export interface ClassificationSubgroupResult {
  id: string
  label: LocalizedCopy
  definition: LocalizedCopy
  count: number
  positives: number
  confusion: ClassificationConfusionMatrix
  metrics: ClassificationBinaryMetrics
}

export interface ClassificationSubgroupOutput {
  split: 'validation'
  threshold: number
  protectedAttributeAnalysis: false
  limitation: LocalizedCopy
  groups: ClassificationSubgroupResult[]
  namedErrors: ClassificationNamedError[]
}

export interface ClassificationThresholdSweepOutput {
  split: 'validation'
  falsePositiveCost: number
  falseNegativeCost: number
  thresholds: number[]
  points: ClassificationThresholdPoint[]
}

export interface ClassificationPhase30ManifestFile {
  path: string
  sha256: string
}

export interface ClassificationPhase30Manifest {
  contractVersion: typeof CLASSIFICATION_PHASE_30_CONTRACT
  locales: readonly ['zh-CN', 'en']
  source: {
    datasetPath: string
    datasetSha256: string
    handoffPath: string
    handoffSha256: string
    handoffContractVersion: string
  }
  policy: {
    selectionSplit: 'validation'
    finalEvaluationSplit: 'test'
    testEvaluations: 1
    testReselectionAllowed: false
    subgroupSplit: 'validation'
  }
  outputs: {
    predictions: ClassificationPhase30ManifestFile
    thresholdSweep: ClassificationPhase30ManifestFile
    roc: ClassificationPhase30ManifestFile
    costSelection: ClassificationPhase30ManifestFile
    subgroupErrors: ClassificationPhase30ManifestFile
  }
  notebooks: Record<'zh-CN' | 'en', ClassificationPhase30ManifestFile>
}

export interface ClassificationStudyPackage {
  manifest: ClassificationPhase30Manifest
  predictions: ClassificationFrozenPrediction[]
  thresholdSweep: ClassificationThresholdSweepOutput
  roc: ClassificationRocOutput
  costSelection: ClassificationCostOutput
  subgroupErrors: ClassificationSubgroupOutput
}

export type ClassificationAssetLoadFailure = 'aborted' | 'http-error' | 'schema-error' | 'integrity-error'

export class ClassificationAssetLoadError extends Error {
  readonly reason: ClassificationAssetLoadFailure

  constructor(reason: ClassificationAssetLoadFailure, message: string) {
    super(message)
    this.name = 'ClassificationAssetLoadError'
    this.reason = reason
  }
}

export interface ClassificationAssetLoadOptions {
  signal?: AbortSignal
  baseUrl?: string
  fetch?: typeof fetch
}
