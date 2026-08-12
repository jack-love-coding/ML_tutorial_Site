import type {
  AdamOptimizerConfig,
  LearningRateSchedule,
  MomentumOptimizerState,
  OptimizerConfig,
  OptimizerState,
  OptimizerStepTrace,
  RmspropOptimizerState,
  WeightDecayStrategy,
} from '../../types/optimizer.ts'

export * from '../../types/optimizer.ts'

const finite = (value: number, label: string) => {
  if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite`)
  return value
}

const unitInterval = (value: number, label: string, inclusiveZero = true) => {
  finite(value, label)
  if ((inclusiveZero ? value < 0 : value <= 0) || value >= 1) {
    throw new RangeError(`${label} must be ${inclusiveZero ? 'in [0, 1)' : 'in (0, 1)'}`)
  }
  return value
}

function assertVector(values: readonly number[], label: string) {
  if (!Array.isArray(values) || values.length === 0 || values.some((value) => !Number.isFinite(value))) {
    throw new RangeError(`${label} must be a non-empty finite vector`)
  }
}

function decayCoefficient(strategy: WeightDecayStrategy | undefined) {
  const coefficient = strategy?.coefficient ?? 0
  finite(coefficient, 'weight decay coefficient')
  if (coefficient < 0) throw new RangeError('weight decay coefficient must be non-negative')
  return coefficient
}

export function assertOptimizerConfig(config: OptimizerConfig) {
  if (!config || !['sgd', 'momentum', 'rmsprop', 'adam'].includes(config.kind)) {
    throw new RangeError('optimizer kind is invalid')
  }
  finite(config.learningRate, 'learning rate')
  if (config.learningRate <= 0) throw new RangeError('learning rate must be positive')
  const decay = config.weightDecay?.kind ?? 'none'
  if (!['none', 'l2', 'adamw'].includes(decay)) throw new RangeError('weight decay strategy is invalid')
  if (decay === 'adamw' && config.kind !== 'adam') throw new RangeError('AdamW decay requires Adam')
  decayCoefficient(config.weightDecay)
  if (config.kind === 'momentum') {
    unitInterval(config.momentum, 'momentum')
    unitInterval(config.dampening ?? 0, 'dampening')
  }
  if (config.kind === 'rmsprop') {
    unitInterval(config.alpha, 'RMSProp alpha', false)
    finite(config.epsilon, 'RMSProp epsilon')
    if (config.epsilon <= 0) throw new RangeError('RMSProp epsilon must be positive')
  }
  if (config.kind === 'adam') {
    unitInterval(config.beta1, 'Adam beta1')
    unitInterval(config.beta2, 'Adam beta2')
    finite(config.epsilon, 'Adam epsilon')
    if (config.epsilon <= 0) throw new RangeError('Adam epsilon must be positive')
  }
}

export function createOptimizerState(config: OptimizerConfig, parameterCount: number): OptimizerState {
  assertOptimizerConfig(config)
  if (!Number.isInteger(parameterCount) || parameterCount <= 0) throw new RangeError('parameter count must be a positive integer')
  if (config.kind === 'sgd') return { kind: 'sgd', step: 0 }
  if (config.kind === 'momentum') return { kind: 'momentum', step: 0, velocity: Array(parameterCount).fill(0), hasVelocity: false }
  if (config.kind === 'rmsprop') return { kind: 'rmsprop', step: 0, squareAverage: Array(parameterCount).fill(0) }
  return { kind: 'adam', step: 0, firstMoment: Array(parameterCount).fill(0), secondMoment: Array(parameterCount).fill(0) }
}

export function learningRateForStep(baseLearningRate: number, schedule: LearningRateSchedule = { kind: 'constant' }, updateIndex = 0) {
  finite(baseLearningRate, 'base learning rate')
  if (baseLearningRate <= 0 || !Number.isInteger(updateIndex) || updateIndex < 0) throw new RangeError('schedule input is invalid')
  if (schedule.kind === 'constant') return baseLearningRate
  if (schedule.kind === 'step') {
    if (!Number.isInteger(schedule.stepSize) || schedule.stepSize <= 0 || !(schedule.gamma > 0 && schedule.gamma <= 1)) throw new RangeError('step schedule is invalid')
    return baseLearningRate * schedule.gamma ** Math.floor(updateIndex / schedule.stepSize)
  }
  if (!Number.isInteger(schedule.warmupSteps) || schedule.warmupSteps < 0 || !Number.isInteger(schedule.totalSteps) || schedule.totalSteps <= schedule.warmupSteps) {
    throw new RangeError('warmup-cosine schedule is invalid')
  }
  const minScale = schedule.minScale ?? 0
  if (minScale < 0 || minScale > 1) throw new RangeError('warmup-cosine minimum scale is invalid')
  if (updateIndex < schedule.warmupSteps) return baseLearningRate * (updateIndex + 1) / Math.max(schedule.warmupSteps, 1)
  const progress = Math.min(1, (updateIndex - schedule.warmupSteps) / (schedule.totalSteps - schedule.warmupSteps))
  return baseLearningRate * (minScale + (1 - minScale) * 0.5 * (1 + Math.cos(Math.PI * progress)))
}

function clonedState(state: OptimizerState): OptimizerState {
  if (state.kind === 'sgd') return { ...state }
  if (state.kind === 'momentum') return { ...state, velocity: [...state.velocity] }
  if (state.kind === 'rmsprop') return { ...state, squareAverage: [...state.squareAverage] }
  return { ...state, firstMoment: [...state.firstMoment], secondMoment: [...state.secondMoment] }
}

function validateState(state: OptimizerState, config: OptimizerConfig, parameterCount: number) {
  if (state.kind !== config.kind || state.step < 0 || !Number.isInteger(state.step)) throw new RangeError('optimizer state does not match config')
  const vectors = state.kind === 'momentum' ? [state.velocity] : state.kind === 'rmsprop' ? [state.squareAverage] : state.kind === 'adam' ? [state.firstMoment, state.secondMoment] : []
  if (vectors.some((values) => values.length !== parameterCount || values.some((value) => !Number.isFinite(value)))) throw new RangeError('optimizer state vector is invalid')
}

function coupledGradient(parameters: readonly number[], gradients: readonly number[], strategy: WeightDecayStrategy | undefined) {
  const coefficient = decayCoefficient(strategy)
  if (strategy?.kind !== 'l2' || coefficient === 0) return [...gradients]
  return gradients.map((gradient, index) => gradient + coefficient * (parameters[index] ?? 0))
}

/** Performs one PyTorch-compatible parameter update and returns no mutable references. */
export function stepOptimizer(
  parameters: readonly number[],
  gradients: readonly number[],
  config: OptimizerConfig,
  previousState: OptimizerState,
  schedule: LearningRateSchedule = { kind: 'constant' },
): OptimizerStepTrace {
  assertOptimizerConfig(config)
  assertVector(parameters, 'parameters')
  assertVector(gradients, 'gradients')
  if (parameters.length !== gradients.length) throw new RangeError('parameters and gradients must have equal length')
  validateState(previousState, config, parameters.length)
  const learningRate = learningRateForStep(config.learningRate, schedule, previousState.step)
  const state = clonedState(previousState)
  const effectiveGradients = coupledGradient(parameters, gradients, config.weightDecay)
  let parametersAfter: number[]

  if (config.kind === 'sgd') {
    state.step += 1
    parametersAfter = parameters.map((parameter, index) => parameter - learningRate * (effectiveGradients[index] ?? 0))
  } else if (config.kind === 'momentum') {
    const momentumState = state as MomentumOptimizerState
    const dampening = config.dampening ?? 0
    const velocity = momentumState.velocity.map((previous, index) => momentumState.hasVelocity
      ? config.momentum * previous + (1 - dampening) * (effectiveGradients[index] ?? 0)
      : (effectiveGradients[index] ?? 0))
    momentumState.velocity = velocity
    momentumState.hasVelocity = true
    momentumState.step += 1
    parametersAfter = parameters.map((parameter, index) => parameter - learningRate * (velocity[index] ?? 0))
  } else if (config.kind === 'rmsprop') {
    const rmspropState = state as RmspropOptimizerState
    rmspropState.squareAverage = rmspropState.squareAverage.map((previous, index) => config.alpha * previous + (1 - config.alpha) * (effectiveGradients[index] ?? 0) ** 2)
    rmspropState.step += 1
    parametersAfter = parameters.map((parameter, index) => parameter - learningRate * (effectiveGradients[index] ?? 0) / (Math.sqrt(rmspropState.squareAverage[index] ?? 0) + config.epsilon))
  } else {
    const adam = config as AdamOptimizerConfig
    if (state.kind !== 'adam') throw new RangeError('optimizer state does not match Adam config')
    const decay = decayCoefficient(adam.weightDecay)
    const decoupled = adam.weightDecay?.kind === 'adamw' && decay > 0
    state.firstMoment = state.firstMoment.map((previous, index) => adam.beta1 * previous + (1 - adam.beta1) * (effectiveGradients[index] ?? 0))
    state.secondMoment = state.secondMoment.map((previous, index) => adam.beta2 * previous + (1 - adam.beta2) * (effectiveGradients[index] ?? 0) ** 2)
    state.step += 1
    const beta1Correction = 1 - adam.beta1 ** state.step
    const beta2Correction = 1 - adam.beta2 ** state.step
    parametersAfter = parameters.map((parameter, index) => {
      const correctedFirst = (state.firstMoment[index] ?? 0) / beta1Correction
      const correctedSecond = (state.secondMoment[index] ?? 0) / beta2Correction
      const decayed = decoupled ? parameter * (1 - learningRate * decay) : parameter
      return decayed - learningRate * correctedFirst / (Math.sqrt(correctedSecond) + adam.epsilon)
    })
  }

  if (parametersAfter.some((value) => !Number.isFinite(value))) throw new RangeError('optimizer update produced a non-finite parameter')
  return {
    step: state.step,
    learningRate,
    parametersBefore: [...parameters],
    parametersAfter,
    gradients: [...gradients],
    effectiveGradients,
    state,
  }
}
