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
  dataset: { id: string; splitPolicy: string; sha256?: string }
  model: { id: string; shape: readonly number[]; activation: string }
  optimizers: readonly OptimizerConfig[]
  updates: number
  selectionPolicy: string
  files: Record<string, { path: string; sha256: string }>
}
