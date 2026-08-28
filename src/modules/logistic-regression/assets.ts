import { withPublicBase } from '../../utils/publicPath.ts'
import {
  LOGISTIC_CHAPTER_IDS,
  LogisticAssetLoadError,
  type LogisticAssetLoadOptions,
  type LogisticLearnerAssetManifest,
  type LogisticInteractionAsset,
  type LogisticInteractionControl,
  type LogisticObservationSceneId,
  type LogisticPredictionHandoff,
  type LogisticPublishedInteractionAsset,
} from './types.ts'

const CONTRACT_VERSION = 'logistic-regression-phase-29-v1' as const
const ASSET_ROOT = '/logistic-regression/phase-29'
const MANIFEST_PATH = `${ASSET_ROOT}/manifest.json`
const SCENE_IDS = new Set<string>(LOGISTIC_CHAPTER_IDS)
const SHA256 = /^[a-f0-9]{64}$/
const MANIFEST_KEYS = new Set([
  'contractVersion', 'locales', 'notebookPath', 'notebooks', 'atomicPublication', 'rollbackOnFailure',
  'rejectAssetDrift', 'cleanKernelVerified', 'learnerFacingTestRecords', 'testLabelsDisclosed',
  'testMetricsDisclosed', 'assets', 'outputs', 'figures', 'predictionHandoff', 'analysis', 'fileHashes',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function assertExactKeys(value: Record<string, unknown>, keys: readonly string[], label: string): void {
  const received = Object.keys(value)
  if (received.length !== keys.length || received.some((key) => !keys.includes(key))) {
    throw new TypeError(`${label} has unknown or missing fields.`)
  }
}

function allowsNullableCalibrationRate(path: string): boolean {
  return /^\$\.data\.calibration\.modes\[\d+\]\.bins\[\d+\]\.(meanProbability|observedRate)$/.test(path)
}

function assertFiniteTree(value: unknown, path = '$', depth = 0): void {
  if (depth > 20) throw new TypeError(`${path} exceeds the asset nesting limit.`)
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${path} must be finite.`)
    return
  }
  if (typeof value === 'string' || typeof value === 'boolean') return
  if (Array.isArray(value)) {
    if (value.length > 100_000) throw new TypeError(`${path} exceeds the asset array limit.`)
    value.forEach((entry, index) => assertFiniteTree(entry, `${path}[${index}]`, depth + 1))
    return
  }
  if (isRecord(value)) {
    Object.entries(value).forEach(([key, entry]) => assertFiniteTree(entry, `${path}.${key}`, depth + 1))
    return
  }
  if (value === null && allowsNullableCalibrationRate(path)) return
  throw new TypeError(`${path} cannot be null or undefined.`)
}

function localized(value: unknown, label: string): void {
  if (!isRecord(value) || Object.keys(value).length !== 2 || typeof value['zh-CN'] !== 'string' || typeof value.en !== 'string') {
    throw new TypeError(`${label} must include zh-CN and en strings.`)
  }
}

function parseControls(value: unknown): readonly LogisticInteractionControl[] {
  if (!Array.isArray(value) || value.length > 3) throw new TypeError('Interaction controls must contain at most three entries.')
  return value.map((entry, index) => {
    if (!isRecord(entry) || typeof entry.id !== 'string' || !entry.id) throw new TypeError(`controls[${index}] has no id.`)
    localized(entry.label, `controls[${index}].label`)
    for (const key of ['minimum', 'maximum', 'step'] as const) {
      if (key in entry && (typeof entry[key] !== 'number' || !Number.isFinite(entry[key]))) throw new TypeError(`controls[${index}].${key} must be finite.`)
    }
    if ('options' in entry) {
      if (!Array.isArray(entry.options) || entry.options.length === 0 || entry.options.length > 8) throw new TypeError(`controls[${index}].options is invalid.`)
      entry.options.forEach((option, optionIndex) => {
        if (!isRecord(option) || (typeof option.value !== 'string' && typeof option.value !== 'number')) throw new TypeError(`controls[${index}].options[${optionIndex}] is invalid.`)
        localized(option.label, `controls[${index}].options[${optionIndex}].label`)
      })
    }
    return entry as unknown as LogisticInteractionControl
  })
}

function expectedDataKeys(sceneId: LogisticObservationSceneId): readonly string[] {
  switch (sceneId) {
    case 'linear-score': return ['teachingRows', 'oneRow']
    case 'sigmoid-probability': return ['oneRow', 'terms', 'extremeScores']
    case 'threshold-decisions': return ['likelihoodRows', 'probabilityProduct', 'logLikelihood']
    case 'log-loss': return ['oneRow', 'confidentMistake', 'batch', 'finiteDifference']
    case 'regularization': return ['scratch', 'sklearn', 'l2']
    case 'linear-limits': return ['calibration', 'xor', 'circles']
  }
}

function deepFreeze<T>(value: T): T {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    Object.values(value as Record<string, unknown>).forEach((entry) => deepFreeze(entry))
    Object.freeze(value)
  }
  return value
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function assertSceneId(value: unknown, label: string): asserts value is LogisticObservationSceneId {
  if (typeof value !== 'string' || !SCENE_IDS.has(value)) throw new TypeError(`${label} is not a known logistic scene.`)
}

function parsePredictionHandoff(value: unknown): LogisticPredictionHandoff {
  if (!isRecord(value)) throw new TypeError('predictionHandoff must be an object.')
  assertExactKeys(value, ['csv', 'json', 'sha256', 'fields', 'reservedFor'], 'predictionHandoff')
  if (typeof value.csv !== 'string' || typeof value.json !== 'string' || value.csv !== `${ASSET_ROOT}/frozen-predictions.csv` || value.json !== `${ASSET_ROOT}/frozen-predictions.json`) {
    throw new TypeError('predictionHandoff paths are invalid.')
  }
  if (!isRecord(value.sha256) || !SHA256.test(String(value.sha256.csv)) || !SHA256.test(String(value.sha256.json))) throw new TypeError('predictionHandoff hashes are invalid.')
  if (value.reservedFor !== 'phase-30') throw new TypeError('predictionHandoff must remain reserved for Phase 30.')
  const fields = ['row_id', 'split', 'label', 'logit', 'probability', 'feature_contract_version', 'model_hash', 'config_hash']
  if (!Array.isArray(value.fields) || value.fields.length !== fields.length || value.fields.some((field, index) => field !== fields[index])) throw new TypeError('predictionHandoff fields are invalid.')
  return value as unknown as LogisticPredictionHandoff
}

export function parseLogisticManifest(value: unknown): LogisticLearnerAssetManifest {
  if (!isRecord(value) || value.contractVersion !== CONTRACT_VERSION) throw new TypeError('Logistic manifest contract version mismatch.')
  const received = Object.keys(value)
  if (received.length !== MANIFEST_KEYS.size || received.some((key) => !MANIFEST_KEYS.has(key))) throw new TypeError('Logistic manifest has unknown or missing fields.')
  if (!Array.isArray(value.locales) || value.locales[0] !== 'zh-CN' || value.locales[1] !== 'en' || value.locales.length !== 2) throw new TypeError('Logistic manifest locales are invalid.')
  for (const key of ['atomicPublication', 'rollbackOnFailure', 'rejectAssetDrift', 'cleanKernelVerified'] as const) if (value[key] !== true) throw new TypeError(`Logistic manifest ${key} must be true.`)
  for (const key of ['learnerFacingTestRecords', 'testLabelsDisclosed', 'testMetricsDisclosed'] as const) if (value[key] !== false) throw new TypeError(`Logistic manifest ${key} must be false.`)
  if (!Array.isArray(value.assets) || value.assets.length !== LOGISTIC_CHAPTER_IDS.length) throw new TypeError('Logistic manifest scene inventory is invalid.')
  const seen = new Set<string>()
  value.assets.map((asset, index) => {
    if (!isRecord(asset)) throw new TypeError(`assets[${index}] must be an object.`)
    assertExactKeys(asset, ['id', 'chapterId', 'sceneId', 'controls', 'sourceCellId', 'path', 'sha256'], `assets[${index}]`)
    assertSceneId(asset.id, `assets[${index}].id`); assertSceneId(asset.chapterId, `assets[${index}].chapterId`); assertSceneId(asset.sceneId, `assets[${index}].sceneId`)
    if (asset.id !== asset.chapterId || asset.id !== asset.sceneId || seen.has(asset.id)) throw new TypeError(`assets[${index}] has an invalid identity.`)
    seen.add(asset.id)
    if (typeof asset.path !== 'string' || asset.path !== `interactions/${asset.id}.json` || !SHA256.test(String(asset.sha256)) || typeof asset.sourceCellId !== 'string' || !asset.sourceCellId.startsWith('phase29-')) throw new TypeError(`assets[${index}] has an invalid path or integrity binding.`)
    parseControls(asset.controls)
    return asset as unknown as LogisticInteractionAsset
  })
  if (seen.size !== LOGISTIC_CHAPTER_IDS.length) throw new TypeError('Logistic manifest is missing a scene.')
  if (!isRecord(value.fileHashes) || Object.values(value.fileHashes).some((hash) => typeof hash !== 'string' || !SHA256.test(hash))) throw new TypeError('Logistic manifest file hashes are invalid.')
  parsePredictionHandoff(value.predictionHandoff)
  assertFiniteTree(value.analysis, '$.analysis')
  // Validate the Phase 30 handoff in the raw package, but do not hand its path
  // or records to a Phase 29 lesson loader.
  return deepFreeze(clone({
    contractVersion: CONTRACT_VERSION,
    locales: ['zh-CN', 'en'],
    assets: value.assets,
  } as LogisticLearnerAssetManifest))
}

export function parseLogisticInteractionAsset(value: unknown, expectedSceneId: LogisticObservationSceneId): LogisticPublishedInteractionAsset {
  if (!isRecord(value)) throw new TypeError('Logistic interaction asset must be an object.')
  assertExactKeys(value, ['contractVersion', 'id', 'chapterId', 'sceneId', 'controls', 'sourceCellId', 'data'], 'Logistic interaction asset')
  if (value.contractVersion !== CONTRACT_VERSION) throw new TypeError('Logistic interaction contract version mismatch.')
  assertSceneId(value.id, 'Interaction id'); assertSceneId(value.chapterId, 'Interaction chapter id'); assertSceneId(value.sceneId, 'Interaction scene id')
  if (value.id !== expectedSceneId || value.chapterId !== expectedSceneId || value.sceneId !== expectedSceneId) throw new TypeError('Logistic interaction scene identity mismatch.')
  if (typeof value.sourceCellId !== 'string' || value.sourceCellId !== `phase29-${expectedSceneId}`) throw new TypeError('Logistic interaction source cell is invalid.')
  parseControls(value.controls)
  if (!isRecord(value.data)) throw new TypeError('Logistic interaction data must be an object.')
  assertExactKeys(value.data, expectedDataKeys(expectedSceneId), `Logistic interaction ${expectedSceneId} data`)
  assertFiniteTree(value.data, '$.data')
  return deepFreeze(clone(value as unknown as LogisticPublishedInteractionAsset))
}

async function sha256Text(text: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new LogisticAssetLoadError('integrity-error', 'Web Crypto is required for asset integrity validation.')
  const bytes = new TextEncoder().encode(text)
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes)
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function responseFailure(): LogisticAssetLoadError {
  return new LogisticAssetLoadError('aborted', 'Logistic asset loading was cancelled.')
}

function isAbort(error: unknown, signal?: AbortSignal): boolean {
  return signal?.aborted === true || (isRecord(error) && error.name === 'AbortError')
}

async function fetchText(path: string, options: LogisticAssetLoadOptions): Promise<string> {
  if (options.signal?.aborted) throw responseFailure()
  const fetchImplementation = options.fetch ?? globalThis.fetch
  if (typeof fetchImplementation !== 'function') throw new LogisticAssetLoadError('http-error', 'No fetch implementation is available for local logistic assets.')
  try {
    const response = await fetchImplementation(withPublicBase(path, options.baseUrl), { signal: options.signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new LogisticAssetLoadError('http-error', `Logistic asset request failed with HTTP ${response.status}.`)
    return await response.text()
  } catch (error) {
    if (error instanceof LogisticAssetLoadError) throw error
    if (isAbort(error, options.signal)) throw responseFailure()
    throw new LogisticAssetLoadError('http-error', 'The local logistic asset could not be loaded.')
  }
}

export async function loadLogisticManifest(options: LogisticAssetLoadOptions = {}): Promise<LogisticLearnerAssetManifest> {
  const text = await fetchText(MANIFEST_PATH, options)
  try { return parseLogisticManifest(JSON.parse(text) as unknown) } catch (error) {
    throw new LogisticAssetLoadError('schema-error', error instanceof Error ? error.message : 'Logistic manifest is malformed.')
  }
}

export async function loadLogisticInteraction(
  sceneId: LogisticObservationSceneId,
  options: LogisticAssetLoadOptions & { manifest?: LogisticLearnerAssetManifest } = {},
): Promise<LogisticPublishedInteractionAsset> {
  assertSceneId(sceneId, 'Requested scene')
  const manifest = options.manifest ? deepFreeze(clone(options.manifest)) : await loadLogisticManifest(options)
  const asset = manifest.assets.find((entry) => entry.sceneId === sceneId)
  if (!asset) throw new LogisticAssetLoadError('schema-error', 'Requested logistic scene is not in the approved manifest inventory.')
  const text = await fetchText(`${ASSET_ROOT}/${asset.path}`, options)
  const observedHash = await sha256Text(text)
  if (observedHash !== asset.sha256) throw new LogisticAssetLoadError('integrity-error', 'Logistic interaction integrity hash mismatch.')
  try { return parseLogisticInteractionAsset(JSON.parse(text) as unknown, sceneId) } catch (error) {
    throw new LogisticAssetLoadError('schema-error', error instanceof Error ? error.message : 'Logistic interaction payload is malformed.')
  }
}
