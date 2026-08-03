import type { LocalizedCopy } from './ml'

export const housingProjectChapterIds = [
  'csv-to-frame',
  'eda-first-pass',
  'cleaning-splits',
  'linear-baseline',
  'evaluation',
  'review-next-iteration',
] as const

export type HousingProjectChapterId = typeof housingProjectChapterIds[number]

export type HousingProjectSceneId =
  | 'data-contract'
  | 'training-eda'
  | 'leakage-boundary'
  | 'baseline-contributions'
  | 'ridge-selection'
  | 'final-review'

export type HousingProjectFigureId =
  | 'train-target-distribution'
  | 'train-income-target'
  | 'train-geography'
  | 'scaler-boundary'
  | 'validation-ridge-path'
  | 'final-predicted-actual'
  | 'final-residuals'

interface BlockBase {
  id: string
  title: LocalizedCopy
}

export interface HousingExplanationBlock extends BlockBase {
  kind: 'explanation'
  eyebrow: LocalizedCopy
  body: LocalizedCopy
  tone?: 'question' | 'default' | 'misconception' | 'conclusion' | 'leakage'
}

export interface HousingFormulaBlock extends BlockBase {
  kind: 'formula'
  formula: string
  explanation: LocalizedCopy
  variables: Array<{ symbol: string; meaning: LocalizedCopy }>
}

export interface HousingCodeBlock extends BlockBase {
  kind: 'code'
  language: 'python'
  code: string
  note?: LocalizedCopy
}

export interface HousingRuntimeOutputBlock extends BlockBase {
  kind: 'runtime-output'
  output: string
  interpretation: LocalizedCopy
}

export interface HousingFigureBlock extends BlockBase {
  kind: 'figure'
  figureId: HousingProjectFigureId
}

export interface HousingTableBlock extends BlockBase {
  kind: 'table'
  columns: LocalizedCopy[]
  rows: Array<{ id: string; cells: LocalizedCopy[] }>
  caption: LocalizedCopy
}

export interface HousingObservationLabBlock extends BlockBase {
  kind: 'observation-lab'
  sceneId: HousingProjectSceneId
  prompt: LocalizedCopy
}

export type HousingProjectLessonBlock =
  | HousingExplanationBlock
  | HousingFormulaBlock
  | HousingCodeBlock
  | HousingRuntimeOutputBlock
  | HousingFigureBlock
  | HousingTableBlock
  | HousingObservationLabBlock

export interface HousingProjectFigureDefinition {
  id: HousingProjectFigureId
  chapterId: HousingProjectChapterId
  publicPath: string
  sourceCellId: string
  title: LocalizedCopy
  alt: LocalizedCopy
  caption: LocalizedCopy
  readingHint: LocalizedCopy
  fallback: LocalizedCopy
}

export interface HousingProjectReference {
  label: LocalizedCopy
  href: string
  note: LocalizedCopy
}

export interface HousingProjectDownload {
  label: LocalizedCopy
  publicPath: string
  kind: 'dataset' | 'notebook' | 'csv' | 'json' | 'figures'
}

export interface HousingProjectChapterLesson {
  id: HousingProjectChapterId
  blocks: HousingProjectLessonBlock[]
  references?: HousingProjectReference[]
  downloads?: HousingProjectDownload[]
}

export interface DataContractAsset {
  kind: 'data-contract'
  chapterId: 'csv-to-frame'
  rowCount: number
  featureCount: number
  splitCounts: { train: number; validation: number; test: number }
  schema: Array<{ name: string; role: string; unit: string }>
  sampleRows: Array<Record<string, string | number>>
  sourceCellId: string
}

export interface TrainingEdaAsset {
  kind: 'training-eda'
  chapterId: 'eda-first-pass'
  relations: Record<string, Array<{ x: number; y: number; count: number }>>
  scatter: Array<Record<string, number | string>>
  targetCapCount: number
  trainingStats: Array<{
    feature: string
    min: number
    q25: number
    median: number
    mean: number
    q75: number
    max: number
    std: number
    correlationWithTarget: number
  }>
  sourceCellId: string
}

export interface LeakageBoundaryAsset {
  kind: 'leakage-boundary'
  chapterId: 'cleaning-splits'
  features: Array<{
    feature: string
    trainMean: number
    trainScale: number
    invalidFullMean: number
    invalidFullScale: number
  }>
  rules: string[]
  sourceCellId: string
}

export interface BaselineContributionsAsset {
  kind: 'baseline-contributions'
  chapterId: 'linear-baseline'
  intercept: number
  standardizedCoefficients: Record<string, number>
  validationMetrics: { rmse: number; mae: number; r2: number }
  samples: Array<{
    rowId: string
    actual: number
    prediction: number
    intercept: number
    contributions: Record<string, number>
  }>
  sourceCellId: string
}

export interface RidgeSelectionAsset {
  kind: 'ridge-selection'
  chapterId: 'evaluation'
  baseline: { model: string; alpha: string; rmse: number; mae: number; r2: number }
  ridgePath: Array<{ model: string; alpha: number; rmse: number; mae: number; r2: number }>
  bestRidgeAlpha: number
  relativeImprovement: number
  selectionThreshold: number
  selectedModel: string
  selectedAlpha: number | null
  testLocked: true
  sourceCellId: string
}

export interface FinalReviewAsset {
  kind: 'final-review'
  chapterId: 'review-next-iteration'
  selectedModel: string
  selectedAlpha: number | null
  testMetrics: { rmse: number; mae: number; r2: number }
  residualSample: Array<{
    row_id: string
    MedHouseVal: number
    prediction: number
    residual: number
    abs_error: number
    failure_group: string
  }>
  namedFailures: Array<{
    row_id: string
    Latitude: number
    Longitude: number
    MedHouseVal: number
    prediction: number
    residual: number
    abs_error: number
    failure_group: string
  }>
  groupMetrics: Array<{ group: string; count: number; mae: number; meanResidual: number }>
  limitations: string[]
  sourceCellId: string
}

export type HousingProjectInteractionAsset =
  | DataContractAsset
  | TrainingEdaAsset
  | LeakageBoundaryAsset
  | BaselineContributionsAsset
  | RidgeSelectionAsset
  | FinalReviewAsset
