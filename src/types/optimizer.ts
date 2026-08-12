/**
 * Pure numerical contracts shared by the optimizer course, Math Lab, and MLP
 * simulations. Parameters are flat on purpose: callers own their model shape
 * and the engine can remain deterministic and DOM-free.
 */
export type OptimizerKind = 'sgd' | 'momentum' | 'rmsprop' | 'adam'
export type WeightDecayKind = 'none' | 'l2' | 'adamw'

export interface WeightDecayStrategy {
  kind: WeightDecayKind
  coefficient?: number
}

interface OptimizerConfigBase {
  learningRate: number
  weightDecay?: WeightDecayStrategy
}

export interface SgdOptimizerConfig extends OptimizerConfigBase {
  kind: 'sgd'
}

export interface MomentumOptimizerConfig extends OptimizerConfigBase {
  kind: 'momentum'
  momentum: number
  dampening?: number
}

export interface RmspropOptimizerConfig extends OptimizerConfigBase {
  kind: 'rmsprop'
  alpha: number
  epsilon: number
}

export interface AdamOptimizerConfig extends OptimizerConfigBase {
  kind: 'adam'
  beta1: number
  beta2: number
  epsilon: number
}

export type OptimizerConfig = SgdOptimizerConfig | MomentumOptimizerConfig | RmspropOptimizerConfig | AdamOptimizerConfig

export interface SgdOptimizerState {
  kind: 'sgd'
  step: number
}

export interface MomentumOptimizerState {
  kind: 'momentum'
  step: number
  velocity: number[]
  hasVelocity: boolean
}

export interface RmspropOptimizerState {
  kind: 'rmsprop'
  step: number
  squareAverage: number[]
}

export interface AdamOptimizerState {
  kind: 'adam'
  step: number
  firstMoment: number[]
  secondMoment: number[]
}

export type OptimizerState = SgdOptimizerState | MomentumOptimizerState | RmspropOptimizerState | AdamOptimizerState

export type LearningRateSchedule =
  | { kind: 'constant' }
  | { kind: 'step'; stepSize: number; gamma: number }
  | { kind: 'warmup-cosine'; warmupSteps: number; totalSteps: number; minScale?: number }

export interface OptimizerStepTrace {
  step: number
  learningRate: number
  parametersBefore: number[]
  parametersAfter: number[]
  gradients: number[]
  effectiveGradients: number[]
  state: OptimizerState
}

export interface OptimizerBenchmarkManifest {
  version: string
  dataset: {
    id: string
    splitPolicy: string
    banknote: {
      sourceDataset: string
      sourceSha256: string
      splitCounts: { train: number; validation: number; test: number }
      preprocessing: { fitSplit: 'train'; ddof: 0; means: Record<string, number>; scales: Record<string, number> }
      evaluationArtifact: string
      finalTestEvaluationCount: 1
    }
  }
  model: {
    id: string
    shape: readonly number[]
    activation: string
    seed: number
    initialization: { algorithm: string; sha256: string }
    batchOrder: string
  }
  benchmarks: readonly {
    id: string
    label: string
    updates: number
    selectionPolicy: string
    optimizers: readonly OptimizerConfig[]
    firstStepUpdateNorms: Record<OptimizerKind, number>
  }[]
  files: Record<string, { path: string; sha256: string }>
}

const isFiniteRecord = (value: unknown): value is Record<string, number> =>
  !!value && typeof value === 'object' && Object.values(value).every((entry) => typeof entry === 'number' && Number.isFinite(entry))

/** Runtime guard for the JSON asset boundary; generation and tests share this contract. */
export function assertOptimizerBenchmarkManifest(value: unknown): asserts value is OptimizerBenchmarkManifest {
  const manifest = value as Partial<OptimizerBenchmarkManifest> | null
  if (!manifest || typeof manifest !== 'object' || typeof manifest.version !== 'string') throw new RangeError('benchmark manifest version is invalid')
  if (!manifest.dataset || !manifest.model || !Array.isArray(manifest.benchmarks) || !manifest.files) throw new RangeError('benchmark manifest is incomplete')
  const banknote = manifest.dataset.banknote
  if (!banknote || typeof banknote.sourceDataset !== 'string' || !/^[a-f0-9]{64}$/.test(banknote.sourceSha256)) throw new RangeError('benchmark manifest Banknote source is invalid')
  if (!banknote.splitCounts || !Object.values(banknote.splitCounts).every((count) => Number.isInteger(count) && count > 0)) throw new RangeError('benchmark manifest split counts are invalid')
  if (banknote.preprocessing?.fitSplit !== 'train' || banknote.preprocessing.ddof !== 0 || !isFiniteRecord(banknote.preprocessing.means) || !isFiniteRecord(banknote.preprocessing.scales)) {
    throw new RangeError('benchmark manifest preprocessing contract is invalid')
  }
  if (banknote.evaluationArtifact !== '/datasets/optimizer-comparison/banknote-transfer.json' || banknote.finalTestEvaluationCount !== 1) {
    throw new RangeError('benchmark manifest Banknote evaluation contract is invalid')
  }
  if (!Array.isArray(manifest.model.shape) || manifest.model.shape.join(',') !== '2,4,1' || manifest.model.activation !== 'tanh' || !Number.isInteger(manifest.model.seed) || !manifest.model.initialization) {
    throw new RangeError('benchmark manifest model contract is invalid')
  }
  if (!/^[a-f0-9]{64}$/.test(manifest.model.initialization.sha256)) throw new RangeError('benchmark manifest initialization hash is invalid')
  if (manifest.benchmarks.length < 2) throw new RangeError('benchmark manifest requires matched and practical comparisons')
  for (const benchmark of manifest.benchmarks) {
    if (!benchmark || !Number.isInteger(benchmark.updates) || benchmark.updates !== 40 || typeof benchmark.selectionPolicy !== 'string' || !Array.isArray(benchmark.optimizers) || benchmark.optimizers.length !== 4 || !isFiniteRecord(benchmark.firstStepUpdateNorms)) {
      throw new RangeError('benchmark manifest benchmark contract is invalid')
    }
  }
  for (const [path, detail] of Object.entries(manifest.files)) {
    if (!path.startsWith('/') || !detail || detail.path !== path || !/^[a-f0-9]{64}$/.test(detail.sha256)) throw new RangeError('benchmark manifest file contract is invalid')
  }
}
