import {
  createOptimizerState,
  learningRateForStep,
  stepOptimizer,
  type LearningRateSchedule,
  type OptimizerConfig,
} from '../../../simulations/optimizers/index.ts'

export interface NumericRow { label: string; values: Record<string, number | string> }

const round = (value: number) => Number(value.toFixed(6))
const vector = (values: readonly number[]) => values.map(round).join(', ')
const norm = (values: readonly number[]) => Math.sqrt(values.reduce((sum, value) => sum + value * value, 0))

const baseParameters = [1, -0.5]

/** One explicit scalar-regression example shared by forward, loss, backward, and update. */
export const trainingLedgerExample = {
  parameters: [...baseParameters],
  features: [0.5, -0.25],
  label: 1,
  learningRate: 0.1,
} as const

export function trainingLedgerModel(stage: number) {
  const bounded = Math.max(0, Math.min(4, stage))
  const { parameters, features, label, learningRate } = trainingLedgerExample
  const prediction = parameters.reduce((sum, parameter, index) => sum + parameter * features[index]!, 0)
  const error = prediction - label
  const loss = 0.5 * error ** 2
  const gradient = features.map((feature) => error * feature)
  const config: OptimizerConfig = { kind: 'sgd', learningRate }
  const trace = stepOptimizer(parameters, gradient, config, createOptimizerState(config, parameters.length))
  const operations = [
    { operation: 'forward', detail: 'ŷ = θ₀x₀ + θ₁x₁', value: round(prediction) },
    { operation: 'loss', detail: `½(ŷ − y)², y = ${label}`, value: round(loss) },
    { operation: 'zero_grad', detail: '∇θ ← [0, 0]', value: '[0, 0]' },
    { operation: 'backward', detail: '∇θ loss = (ŷ − y)x', value: vector(gradient) },
    { operation: 'optimizer.step', detail: 'θ ← θ − η∇θ', value: vector(trace.parametersAfter) },
  ]
  return {
    stage: bounded,
    example: { features: [...features], label, prediction: round(prediction), loss: round(loss), gradient: gradient.map(round) },
    operations: operations.map((operation, index) => ({ ...operation, status: index < bounded ? 'complete' : index === bounded ? 'current' : 'pending' })),
    trace,
  }
}

const populationGradients = Array.from({ length: 960 }, (_, index) => [
  0.45 + ((index * 37) % 17 - 8) * 0.015,
  -0.2 + ((index * 19) % 13 - 6) * 0.012,
])
const meanGradient = (rows: readonly number[][]) => rows[0]!.map((_, column) => rows.reduce((sum, row) => sum + (row[column] ?? 0), 0) / rows.length)

export function batchNoiseModel(batchSize: 1 | 64 | 960, update: number) {
  const boundedUpdate = Math.max(0, Math.min(12, update))
  const start = (boundedUpdate * 97) % populationGradients.length
  const indices = Array.from({ length: batchSize }, (_, offset) => (start + offset * 37) % populationGradients.length)
  const subset = indices.map((index) => populationGradients[index]!)
  const gradient = meanGradient(subset)
  const config: OptimizerConfig = { kind: 'sgd', learningRate: 0.08 }
  const trace = stepOptimizer(baseParameters, gradient, config, createOptimizerState(config, 2))
  return {
    batchSize,
    update: boundedUpdate,
    epoch: round((boundedUpdate * batchSize) / 960),
    indices,
    gradient: gradient.map(round),
    updateNorm: round(norm(trace.parametersAfter.map((value, index) => value - baseParameters[index]!))),
    trace,
  }
}

export function momentumRmspropModel(update: number) {
  const boundedUpdate = Math.max(1, Math.min(8, update))
  const momentum: OptimizerConfig = { kind: 'momentum', learningRate: 0.08, momentum: 0.9 }
  const rmsprop: OptimizerConfig = { kind: 'rmsprop', learningRate: 0.02, alpha: 0.95, epsilon: 1e-8 }
  const run = (config: OptimizerConfig) => {
    let parameters = [...baseParameters]
    let state = createOptimizerState(config, 2)
    let trace: ReturnType<typeof stepOptimizer> | undefined
    for (let index = 0; index < boundedUpdate; index += 1) {
      const gradients = [0.6 - index * 0.04, -0.25 + index * 0.02]
      trace = stepOptimizer(parameters, gradients, config, state)
      parameters = trace.parametersAfter
      state = trace.state
    }
    if (!trace) throw new Error('bounded optimizer run requires one update')
    return trace
  }
  const momentumTrace = run(momentum)
  const rmspropTrace = run(rmsprop)
  const squareAverage = rmspropTrace.state.kind === 'rmsprop' ? rmspropTrace.state.squareAverage : []
  return {
    update: boundedUpdate,
    momentum: momentumTrace,
    rmsprop: rmspropTrace,
    effectiveStep: rmspropTrace.gradients.map((gradient, index) => round(rmspropTrace.learningRate * gradient / (Math.sqrt(squareAverage[index] ?? 0) + 1e-8))),
  }
}

export function adamDecayModel(update: number) {
  const boundedUpdate = Math.max(1, Math.min(8, update))
  const variants: Record<'adam' | 'l2' | 'adamw', OptimizerConfig> = {
    adam: { kind: 'adam', learningRate: 0.02, beta1: 0.9, beta2: 0.999, epsilon: 1e-8 },
    l2: { kind: 'adam', learningRate: 0.02, beta1: 0.9, beta2: 0.999, epsilon: 1e-8, weightDecay: { kind: 'l2', coefficient: 0.1 } },
    adamw: { kind: 'adam', learningRate: 0.02, beta1: 0.9, beta2: 0.999, epsilon: 1e-8, weightDecay: { kind: 'adamw', coefficient: 0.1 } },
  }
  const run = (config: OptimizerConfig) => {
    let parameters = [...baseParameters]
    let state = createOptimizerState(config, 2)
    let trace: ReturnType<typeof stepOptimizer> | undefined
    for (let index = 0; index < boundedUpdate; index += 1) {
      trace = stepOptimizer(parameters, [0.6 - index * 0.03, -0.25 + index * 0.01], config, state)
      parameters = trace.parametersAfter
      state = trace.state
    }
    if (!trace) throw new Error('bounded Adam run requires one update')
    const adamState = trace.state.kind === 'adam' ? trace.state : undefined
    return {
      trace,
      t: adamState?.step ?? 0,
      m: adamState?.firstMoment.map(round) ?? [],
      v: adamState?.secondMoment.map(round) ?? [],
      mhat: adamState?.firstMoment.map((value) => round(value / (1 - 0.9 ** (adamState?.step ?? 1)))) ?? [],
      vhat: adamState?.secondMoment.map((value) => round(value / (1 - 0.999 ** (adamState?.step ?? 1)))) ?? [],
    }
  }
  return { update: boundedUpdate, adam: run(variants.adam), l2: run(variants.l2), adamw: run(variants.adamw) }
}

export type ScheduleKind = 'constant' | 'step' | 'warmup-cosine'
export function scheduleModel(kind: ScheduleKind, update: number) {
  const boundedUpdate = Math.max(0, Math.min(11, update))
  const schedule: LearningRateSchedule = kind === 'constant'
    ? { kind: 'constant' }
    : kind === 'step'
      ? { kind: 'step', stepSize: 4, gamma: 0.5 }
      : { kind: 'warmup-cosine', warmupSteps: 3, totalSteps: 12, minScale: 0.1 }
  const config: OptimizerConfig = { kind: 'sgd', learningRate: 0.08 }
  let parameters = [...baseParameters]
  let state = createOptimizerState(config, 2)
  const transitions = [] as { update: number; learningRate: number; parameters: number[] }[]
  for (let index = 0; index <= boundedUpdate; index += 1) {
    const trace = stepOptimizer(parameters, [parameters[0]! * 0.5, parameters[1]! * 0.5], config, state, schedule)
    parameters = trace.parametersAfter
    state = trace.state
    transitions.push({ update: index, learningRate: round(trace.learningRate), parameters: parameters.map(round) })
  }
  return { kind, update: boundedUpdate, schedulerOrder: 'optimizer.step() → scheduler.step()', transitions, learningRate: learningRateForStep(0.08, schedule, boundedUpdate) }
}

export const sceneNumber = { round, vector }
