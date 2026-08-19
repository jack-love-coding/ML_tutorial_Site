import type { LocalizedCopy } from '../../types/ml'

export const LOGISTIC_CHAPTER_IDS = [
  'linear-score',
  'sigmoid-probability',
  'threshold-decisions',
  'log-loss',
  'regularization',
  'linear-limits',
] as const

export type LogisticChapterId = typeof LOGISTIC_CHAPTER_IDS[number]

export type LogisticCourseBlockKind =
  | 'question'
  | 'explanation'
  | 'formula'
  | 'code'
  | 'runtime-output'
  | 'prediction'
  | 'animation'
  | 'figure'
  | 'table'
  | 'observation-lab'
  | 'observation'
  | 'misconception'
  | 'conclusion'

export interface LogisticCourseBlock {
  kind: LogisticCourseBlockKind
  title: LocalizedCopy
  body: LocalizedCopy
  code?: string
  sceneId?: LogisticObservationSceneId
  assetId?: string
}

export interface LogisticCourseChapter {
  id: LogisticChapterId
  title: LocalizedCopy
  blocks: readonly LogisticCourseBlock[]
  media?: readonly string[]
}

export type LogisticObservationSceneId = LogisticChapterId

export interface LogisticControlOption {
  value: string | number
  label: LocalizedCopy
}

export interface LogisticInteractionControl {
  id: string
  label: LocalizedCopy
  minimum?: number
  maximum?: number
  step?: number
  options?: readonly LogisticControlOption[]
}

export interface LogisticInteractionAsset {
  id: string
  chapterId: LogisticChapterId
  sceneId: LogisticObservationSceneId
  controls: readonly LogisticInteractionControl[]
  sourceCellId: string
  path: string
  sha256: string
}

export type LogisticInteractionData =
  | { teachingRows: Record<string, unknown>; oneRow: Record<string, unknown> }
  | { oneRow: Record<string, unknown>; terms: Record<string, unknown>; extremeScores: readonly number[] }
  | { likelihoodRows: readonly Record<string, unknown>[]; probabilityProduct: number; logLikelihood: number }
  | { oneRow: Record<string, unknown>; batch: Record<string, unknown>; finiteDifference: Record<string, unknown> }
  | { scratch: Record<string, unknown>; sklearn: Record<string, unknown>; l2: Record<string, unknown> }
  | { calibration: Record<string, unknown>; xor: Record<string, unknown>; circles: Record<string, unknown> }

export interface LogisticPublishedInteractionAsset {
  contractVersion: 'logistic-regression-phase-29-v1'
  id: LogisticObservationSceneId
  chapterId: LogisticChapterId
  sceneId: LogisticObservationSceneId
  controls: readonly LogisticInteractionControl[]
  sourceCellId: string
  data: LogisticInteractionData
}

export interface LogisticPredictionHandoff {
  csv: string
  json: string
  sha256: Readonly<Record<'csv' | 'json', string>>
  fields: readonly [
    'row_id',
    'split',
    'label',
    'logit',
    'probability',
    'feature_contract_version',
    'model_hash',
    'config_hash',
  ]
  reservedFor?: 'phase-30'
}

export interface LogisticAssetManifest {
  contractVersion: 'logistic-regression-phase-29-v1'
  locales: readonly ['zh-CN', 'en']
  assets: readonly LogisticInteractionAsset[]
  predictionHandoff: LogisticPredictionHandoff
}

/** The only manifest shape that lesson code may receive.  The Phase 30 handoff
 * is validated in the raw package but deliberately omitted here. */
export interface LogisticLearnerAssetManifest {
  contractVersion: 'logistic-regression-phase-29-v1'
  locales: readonly ['zh-CN', 'en']
  assets: readonly LogisticInteractionAsset[]
}

export type LogisticAssetLoadFailureCode = 'aborted' | 'http-error' | 'schema-error' | 'integrity-error'

export class LogisticAssetLoadError extends Error {
  readonly code: LogisticAssetLoadFailureCode

  constructor(code: LogisticAssetLoadFailureCode, message: string) {
    super(message)
    this.name = 'LogisticAssetLoadError'
    this.code = code
  }
}

export interface LogisticAssetLoadOptions {
  fetch?: typeof fetch
  baseUrl?: string
  signal?: AbortSignal
}

export interface LogisticMediaAsset {
  assetPath: string
  posterPath: string
  alt: LocalizedCopy
  transcript: LocalizedCopy
  chapterMarkers: readonly { id: string; startSeconds: number; title: LocalizedCopy }[]
}
