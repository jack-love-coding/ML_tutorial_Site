import { withPublicBase } from '../../utils/publicPath.ts'
import { validateFrozenPredictions } from './engine.ts'
import {
  CLASSIFICATION_PHASE_30_CONTRACT,
  ClassificationAssetLoadError,
  type ClassificationAssetLoadOptions,
  type ClassificationCostOutput,
  type ClassificationFrozenPrediction,
  type ClassificationPhase30Manifest,
  type ClassificationPhase30ManifestFile,
  type ClassificationRocOutput,
  type ClassificationStudyPackage,
  type ClassificationSubgroupOutput,
  type ClassificationThresholdSweepOutput,
} from './types.ts'

const ASSET_ROOT = '/classification/phase-30'
const MANIFEST_PATH = `${ASSET_ROOT}/manifest.json`
const SHA256 = /^[a-f0-9]{64}$/

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function assertExactKeys(value: Record<string, unknown>, keys: readonly string[], label: string): void {
  const received = Object.keys(value)
  if (received.length !== keys.length || received.some((key) => !keys.includes(key))) {
    throw new TypeError(`${label} has unknown or missing fields.`)
  }
}

function assertFiniteTree(value: unknown, label = '$', depth = 0): void {
  if (depth > 20) throw new TypeError(`${label} exceeds the asset nesting limit.`)
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`)
    return
  }
  if (typeof value === 'string' || typeof value === 'boolean') return
  if (Array.isArray(value)) {
    if (value.length > 10_000) throw new TypeError(`${label} exceeds the asset array limit.`)
    value.forEach((entry, index) => assertFiniteTree(entry, `${label}[${index}]`, depth + 1))
    return
  }
  if (isRecord(value)) {
    Object.entries(value).forEach(([key, entry]) => assertFiniteTree(entry, `${label}.${key}`, depth + 1))
    return
  }
  throw new TypeError(`${label} cannot be null or undefined.`)
}

function parseFile(value: unknown, expectedPath: string, label: string): ClassificationPhase30ManifestFile {
  if (!isRecord(value)) throw new TypeError(`${label} must be an object.`)
  assertExactKeys(value, ['path', 'sha256'], label)
  if (value.path !== expectedPath || typeof value.sha256 !== 'string' || !SHA256.test(value.sha256)) {
    throw new TypeError(`${label} path or integrity hash is invalid.`)
  }
  return { path: value.path, sha256: value.sha256 }
}

function localized(value: unknown, label: string): void {
  if (!isRecord(value) || Object.keys(value).length !== 2 || typeof value['zh-CN'] !== 'string' || typeof value.en !== 'string') {
    throw new TypeError(`${label} must contain zh-CN and en copy.`)
  }
}

function cloneFreeze<T>(value: T): T {
  const cloned = JSON.parse(JSON.stringify(value)) as T
  const freeze = (entry: unknown): void => {
    if (entry && typeof entry === 'object' && !Object.isFrozen(entry)) {
      Object.values(entry as Record<string, unknown>).forEach(freeze)
      Object.freeze(entry)
    }
  }
  freeze(cloned)
  return cloned
}

export function parseClassificationManifest(value: unknown): ClassificationPhase30Manifest {
  if (!isRecord(value) || value.contractVersion !== CLASSIFICATION_PHASE_30_CONTRACT) throw new TypeError('Classification manifest contract version mismatch.')
  assertExactKeys(value, ['contractVersion', 'locales', 'source', 'policy', 'outputs', 'notebooks'], 'Classification manifest')
  if (!Array.isArray(value.locales) || value.locales.length !== 2 || value.locales[0] !== 'zh-CN' || value.locales[1] !== 'en') throw new TypeError('Classification locales are invalid.')
  if (!isRecord(value.source)) throw new TypeError('Classification source must be an object.')
  assertExactKeys(value.source, ['datasetPath', 'datasetSha256', 'handoffPath', 'handoffSha256', 'handoffContractVersion'], 'Classification source')
  if (value.source.datasetPath !== '/datasets/numerical-methods/banknote-authentication.csv' || value.source.handoffPath !== '/logistic-regression/phase-29/frozen-predictions.json' || value.source.handoffContractVersion !== 'logistic-regression-phase-29-v1') throw new TypeError('Classification source binding is invalid.')
  if (!SHA256.test(String(value.source.datasetSha256)) || !SHA256.test(String(value.source.handoffSha256))) throw new TypeError('Classification source hashes are invalid.')
  if (!isRecord(value.policy)) throw new TypeError('Classification policy must be an object.')
  assertExactKeys(value.policy, ['selectionSplit', 'finalEvaluationSplit', 'testEvaluations', 'testReselectionAllowed', 'subgroupSplit'], 'Classification policy')
  if (value.policy.selectionSplit !== 'validation' || value.policy.finalEvaluationSplit !== 'test' || value.policy.subgroupSplit !== 'validation' || value.policy.testEvaluations !== 1 || value.policy.testReselectionAllowed !== false) throw new TypeError('Classification split policy is invalid.')
  if (!isRecord(value.outputs) || !isRecord(value.notebooks)) throw new TypeError('Classification manifest inventories are invalid.')
  const outputs = {
    predictions: parseFile(value.outputs.predictions, `${ASSET_ROOT}/outputs/validation-predictions.json`, 'outputs.predictions'),
    thresholdSweep: parseFile(value.outputs.thresholdSweep, `${ASSET_ROOT}/outputs/threshold-sweep.json`, 'outputs.thresholdSweep'),
    roc: parseFile(value.outputs.roc, `${ASSET_ROOT}/outputs/roc.json`, 'outputs.roc'),
    costSelection: parseFile(value.outputs.costSelection, `${ASSET_ROOT}/outputs/cost-selection.json`, 'outputs.costSelection'),
    subgroupErrors: parseFile(value.outputs.subgroupErrors, `${ASSET_ROOT}/outputs/subgroup-errors.json`, 'outputs.subgroupErrors'),
  }
  const notebooks = {
    'zh-CN': parseFile(value.notebooks['zh-CN'], `${ASSET_ROOT}/notebooks/classification-decisions.zh-CN.ipynb`, 'notebooks.zh-CN'),
    en: parseFile(value.notebooks.en, `${ASSET_ROOT}/notebooks/classification-decisions.en.ipynb`, 'notebooks.en'),
  }
  return cloneFreeze({ ...value, outputs, notebooks } as unknown as ClassificationPhase30Manifest)
}

function parsePredictions(value: unknown): ClassificationFrozenPrediction[] {
  if (!Array.isArray(value) || value.length !== 206) throw new TypeError('Validation prediction inventory must contain 206 rows.')
  const rows = value.map((entry, index) => {
    if (!isRecord(entry)) throw new TypeError(`predictions[${index}] must be an object.`)
    assertExactKeys(entry, ['rowId', 'split', 'label', 'logit', 'probability'], `predictions[${index}]`)
    return entry as unknown as ClassificationFrozenPrediction
  })
  validateFrozenPredictions(rows)
  if (rows.some((row) => row.split !== 'validation')) throw new TypeError('Learner-facing prediction rows must remain validation-only.')
  return cloneFreeze(rows)
}

function parseSweep(value: unknown): ClassificationThresholdSweepOutput {
  if (!isRecord(value)) throw new TypeError('Threshold sweep must be an object.')
  assertExactKeys(value, ['split', 'falsePositiveCost', 'falseNegativeCost', 'thresholds', 'points'], 'Threshold sweep')
  if (value.split !== 'validation' || value.falsePositiveCost !== 1 || value.falseNegativeCost !== 5 || !Array.isArray(value.thresholds) || value.thresholds.length !== 99 || !Array.isArray(value.points) || value.points.length !== 99) throw new TypeError('Threshold sweep contract is invalid.')
  assertFiniteTree(value)
  return cloneFreeze(value as unknown as ClassificationThresholdSweepOutput)
}

function parseRoc(value: unknown): ClassificationRocOutput {
  if (!isRecord(value)) throw new TypeError('ROC output must be an object.')
  assertExactKeys(value, ['split', 'auc', 'interpretation', 'thresholdSelectionAllowed', 'points'], 'ROC output')
  if (value.split !== 'validation' || value.thresholdSelectionAllowed !== false || !Array.isArray(value.points) || value.points.length < 3) throw new TypeError('ROC output contract is invalid.')
  localized(value.interpretation, 'ROC interpretation')
  assertFiniteTree(value)
  return cloneFreeze(value as unknown as ClassificationRocOutput)
}

function parseCost(value: unknown): ClassificationCostOutput {
  if (!isRecord(value)) throw new TypeError('Cost selection output must be an object.')
  assertExactKeys(value, ['selectionSplit', 'finalEvaluationSplit', 'falsePositiveCost', 'falseNegativeCost', 'tieBreak', 'selectedThreshold', 'foldRule', 'folds', 'variation', 'validation', 'lockedTest', 'testEvaluations', 'reselectionAllowed', 'interpretation'], 'Cost selection output')
  if (value.selectionSplit !== 'validation' || value.finalEvaluationSplit !== 'test' || value.falsePositiveCost !== 1 || value.falseNegativeCost !== 5 || value.tieBreak !== 'closest-to-0.5-then-lower' || value.foldRule !== 'row-id-modulo-5' || !Array.isArray(value.folds) || value.folds.length !== 5 || value.testEvaluations !== 1 || value.reselectionAllowed !== false) throw new TypeError('Cost selection policy is invalid.')
  localized(value.interpretation, 'Cost interpretation')
  assertFiniteTree(value)
  return cloneFreeze(value as unknown as ClassificationCostOutput)
}

function parseSubgroups(value: unknown): ClassificationSubgroupOutput {
  if (!isRecord(value)) throw new TypeError('Subgroup output must be an object.')
  assertExactKeys(value, ['split', 'threshold', 'protectedAttributeAnalysis', 'limitation', 'groups', 'namedErrors'], 'Subgroup output')
  if (value.split !== 'validation' || value.protectedAttributeAnalysis !== false || !Array.isArray(value.groups) || value.groups.length !== 4 || !Array.isArray(value.namedErrors)) throw new TypeError('Subgroup output contract is invalid.')
  localized(value.limitation, 'Subgroup limitation')
  for (const [index, group] of value.groups.entries()) {
    if (!isRecord(group)) throw new TypeError(`groups[${index}] must be an object.`)
    localized(group.label, `groups[${index}].label`)
    localized(group.definition, `groups[${index}].definition`)
  }
  assertFiniteTree(value)
  return cloneFreeze(value as unknown as ClassificationSubgroupOutput)
}

async function sha256Text(text: string): Promise<string> {
  if (!globalThis.crypto?.subtle) throw new ClassificationAssetLoadError('integrity-error', 'Web Crypto is required for classification asset validation.')
  const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
}

function isAbort(error: unknown, signal?: AbortSignal): boolean {
  return signal?.aborted === true || (isRecord(error) && error.name === 'AbortError')
}

async function fetchText(path: string, options: ClassificationAssetLoadOptions): Promise<string> {
  if (options.signal?.aborted) throw new ClassificationAssetLoadError('aborted', 'Classification asset loading was cancelled.')
  const fetchImplementation = options.fetch ?? globalThis.fetch
  if (typeof fetchImplementation !== 'function') throw new ClassificationAssetLoadError('http-error', 'No fetch implementation is available.')
  try {
    const response = await fetchImplementation(withPublicBase(path, options.baseUrl), { signal: options.signal, headers: { Accept: 'application/json' } })
    if (!response.ok) throw new ClassificationAssetLoadError('http-error', `Classification asset request failed with HTTP ${response.status}.`)
    return await response.text()
  } catch (error) {
    if (error instanceof ClassificationAssetLoadError) throw error
    if (isAbort(error, options.signal)) throw new ClassificationAssetLoadError('aborted', 'Classification asset loading was cancelled.')
    throw new ClassificationAssetLoadError('http-error', 'The local classification asset could not be loaded.')
  }
}

async function loadHashed<T>(file: ClassificationPhase30ManifestFile, parser: (value: unknown) => T, options: ClassificationAssetLoadOptions): Promise<T> {
  const text = await fetchText(file.path, options)
  if (await sha256Text(text) !== file.sha256) throw new ClassificationAssetLoadError('integrity-error', `Classification asset integrity mismatch for ${file.path}.`)
  try {
    return parser(JSON.parse(text) as unknown)
  } catch (error) {
    throw new ClassificationAssetLoadError('schema-error', error instanceof Error ? error.message : 'Classification asset is malformed.')
  }
}

export async function loadClassificationManifest(options: ClassificationAssetLoadOptions = {}): Promise<ClassificationPhase30Manifest> {
  const text = await fetchText(MANIFEST_PATH, options)
  try {
    return parseClassificationManifest(JSON.parse(text) as unknown)
  } catch (error) {
    throw new ClassificationAssetLoadError('schema-error', error instanceof Error ? error.message : 'Classification manifest is malformed.')
  }
}

export async function loadClassificationStudyPackage(options: ClassificationAssetLoadOptions = {}): Promise<ClassificationStudyPackage> {
  const manifest = await loadClassificationManifest(options)
  const [predictions, thresholdSweepOutput, rocOutput, costSelection, subgroupErrors] = await Promise.all([
    loadHashed(manifest.outputs.predictions, parsePredictions, options),
    loadHashed(manifest.outputs.thresholdSweep, parseSweep, options),
    loadHashed(manifest.outputs.roc, parseRoc, options),
    loadHashed(manifest.outputs.costSelection, parseCost, options),
    loadHashed(manifest.outputs.subgroupErrors, parseSubgroups, options),
  ])
  if (costSelection.selectedThreshold !== subgroupErrors.threshold || costSelection.selectedThreshold !== costSelection.validation.threshold || costSelection.selectedThreshold !== costSelection.lockedTest.threshold) {
    throw new ClassificationAssetLoadError('schema-error', 'Classification threshold identity drifted across published outputs.')
  }
  return cloneFreeze({ manifest, predictions, thresholdSweep: thresholdSweepOutput, roc: rocOutput, costSelection, subgroupErrors })
}
