import {
  clamp,
  round,
  type Vector2,
} from './math.ts'

export type OptimizerKind = 'sgd' | 'momentum' | 'rmsprop' | 'adam'
export type OptimizerPresetId = 'narrow-ravine' | 'tilted-bowl' | 'steep-valley'

export interface OptimizerPreset {
  id: OptimizerPresetId
  label: {
    'zh-CN': string
    en: string
  }
  hessian: readonly [readonly [number, number], readonly [number, number]]
  start: Vector2
}

export interface OptimizerRaceInput {
  preset: OptimizerPresetId
  start?: Vector2
  learningRate: number
  steps: number
  momentumBeta: number
  beta2: number
  epsilon: number
}

export interface SgdState {
  currentGradient: Vector2
}

export interface MomentumState {
  velocity: Vector2
}

export interface RmspropState {
  squareAverage: Vector2
}

export interface AdamState {
  firstMoment: Vector2
  secondMoment: Vector2
  biasCorrection: {
    t: number
    beta1Correction: number
    beta2Correction: number
  }
}

export interface OptimizerRun<State> {
  kind: OptimizerKind
  path: Vector2[]
  losses: number[]
  finalLoss: number
  state: State
}

export interface OptimizerRuns {
  sgd: OptimizerRun<SgdState>
  momentum: OptimizerRun<MomentumState>
  rmsprop: OptimizerRun<RmspropState>
  adam: OptimizerRun<AdamState>
}

export interface OptimizerRaceEvaluation {
  preset: OptimizerPreset
  optimizerOrder: OptimizerKind[]
  runs: OptimizerRuns
}

export const optimizerRacePresets: OptimizerPreset[] = [
  {
    id: 'narrow-ravine',
    label: { 'zh-CN': '狭长谷底', en: 'narrow ravine' },
    hessian: [[8, 1.2], [1.2, 0.8]],
    start: { x: 2.4, y: -1.6 },
  },
  {
    id: 'tilted-bowl',
    label: { 'zh-CN': '倾斜碗面', en: 'tilted bowl' },
    hessian: [[2.2, 0.9], [0.9, 1.4]],
    start: { x: -2.2, y: 1.8 },
  },
  {
    id: 'steep-valley',
    label: { 'zh-CN': '陡峭峡谷', en: 'steep valley' },
    hessian: [[12, 0], [0, 0.55]],
    start: { x: 2, y: 2.2 },
  },
]

function presetFor(id: OptimizerPresetId) {
  return optimizerRacePresets.find((preset) => preset.id === id) ?? optimizerRacePresets[0]!
}

function finiteOr(value: number | undefined, fallback: number) {
  return Number.isFinite(value) ? value! : fallback
}

function safeVector(vector: Vector2 | undefined, fallback: Vector2): Vector2 {
  return {
    x: clamp(finiteOr(vector?.x, fallback.x), -3, 3),
    y: clamp(finiteOr(vector?.y, fallback.y), -3, 3),
  }
}

function add(left: Vector2, right: Vector2): Vector2 {
  return { x: left.x + right.x, y: left.y + right.y }
}

function scale(vector: Vector2, scalar: number): Vector2 {
  return { x: vector.x * scalar, y: vector.y * scalar }
}

function subtract(left: Vector2, right: Vector2): Vector2 {
  return { x: left.x - right.x, y: left.y - right.y }
}

function square(vector: Vector2): Vector2 {
  return { x: vector.x * vector.x, y: vector.y * vector.y }
}

function divideByRoot(vector: Vector2, squareAverage: Vector2, epsilon: number): Vector2 {
  return {
    x: vector.x / (Math.sqrt(squareAverage.x) + epsilon),
    y: vector.y / (Math.sqrt(squareAverage.y) + epsilon),
  }
}

export function optimizerLoss(point: Vector2, preset: OptimizerPreset) {
  const [[a, b], [, d]] = preset.hessian
  return 0.5 * (a * point.x * point.x + 2 * b * point.x * point.y + d * point.y * point.y)
}

export function optimizerGradient(point: Vector2, preset: OptimizerPreset): Vector2 {
  const [[a, b], [, d]] = preset.hessian
  return {
    x: a * point.x + b * point.y,
    y: b * point.x + d * point.y,
  }
}

function makeBaseRun<State>(kind: OptimizerKind, start: Vector2, initialLoss: number, state: State): OptimizerRun<State> {
  return {
    kind,
    path: [start],
    losses: [initialLoss],
    finalLoss: initialLoss,
    state,
  }
}

function pushStep<State>(run: OptimizerRun<State>, point: Vector2, preset: OptimizerPreset) {
  run.path.push(point)
  const loss = optimizerLoss(point, preset)
  run.losses.push(loss)
  run.finalLoss = loss
}

export function evaluateOptimizerRace(input: OptimizerRaceInput): OptimizerRaceEvaluation {
  const preset = presetFor(input.preset)
  const start = safeVector(input.start, preset.start)
  const steps = Math.max(0, Math.min(60, Math.floor(finiteOr(input.steps, 20))))
  const learningRate = clamp(finiteOr(input.learningRate, 0.08), 0.001, 0.35)
  const beta1 = clamp(finiteOr(input.momentumBeta, 0.85), 0, 0.99)
  const beta2 = clamp(finiteOr(input.beta2, 0.95), 0, 0.999)
  const epsilon = Math.max(1e-12, finiteOr(input.epsilon, 1e-8))
  const initialLoss = optimizerLoss(start, preset)

  const runs: OptimizerRuns = {
    sgd: makeBaseRun('sgd', start, initialLoss, { currentGradient: { x: 0, y: 0 } }),
    momentum: makeBaseRun('momentum', start, initialLoss, { velocity: { x: 0, y: 0 } }),
    rmsprop: makeBaseRun('rmsprop', start, initialLoss, { squareAverage: { x: 0, y: 0 } }),
    adam: makeBaseRun('adam', start, initialLoss, {
      firstMoment: { x: 0, y: 0 },
      secondMoment: { x: 0, y: 0 },
      biasCorrection: { t: 0, beta1Correction: 0, beta2Correction: 0 },
    }),
  }

  for (let step = 1; step <= steps; step += 1) {
    const sgdPoint = runs.sgd.path.at(-1)!
    const sgdGradient = optimizerGradient(sgdPoint, preset)
    runs.sgd.state.currentGradient = sgdGradient
    pushStep(runs.sgd, subtract(sgdPoint, scale(sgdGradient, learningRate)), preset)

    const momentumPoint = runs.momentum.path.at(-1)!
    const momentumGradient = optimizerGradient(momentumPoint, preset)
    runs.momentum.state.velocity = add(scale(runs.momentum.state.velocity, beta1), momentumGradient)
    pushStep(runs.momentum, subtract(momentumPoint, scale(runs.momentum.state.velocity, learningRate)), preset)

    const rmspropPoint = runs.rmsprop.path.at(-1)!
    const rmspropGradient = optimizerGradient(rmspropPoint, preset)
    runs.rmsprop.state.squareAverage = add(
      scale(runs.rmsprop.state.squareAverage, beta2),
      scale(square(rmspropGradient), 1 - beta2),
    )
    pushStep(
      runs.rmsprop,
      subtract(rmspropPoint, scale(divideByRoot(rmspropGradient, runs.rmsprop.state.squareAverage, epsilon), learningRate)),
      preset,
    )

    const adamPoint = runs.adam.path.at(-1)!
    const adamGradient = optimizerGradient(adamPoint, preset)
    runs.adam.state.firstMoment = add(scale(runs.adam.state.firstMoment, beta1), scale(adamGradient, 1 - beta1))
    runs.adam.state.secondMoment = add(scale(runs.adam.state.secondMoment, beta2), scale(square(adamGradient), 1 - beta2))
    const beta1Correction = 1 - beta1 ** step
    const beta2Correction = 1 - beta2 ** step
    const correctedFirst = scale(runs.adam.state.firstMoment, 1 / beta1Correction)
    const correctedSecond = scale(runs.adam.state.secondMoment, 1 / beta2Correction)
    runs.adam.state.biasCorrection = { t: step, beta1Correction, beta2Correction }
    pushStep(
      runs.adam,
      subtract(adamPoint, scale(divideByRoot(correctedFirst, correctedSecond, epsilon), learningRate)),
      preset,
    )
  }

  for (const run of Object.values(runs)) {
    run.finalLoss = round(run.finalLoss, 8)
  }

  return {
    preset,
    optimizerOrder: ['sgd', 'momentum', 'rmsprop', 'adam'],
    runs,
  }
}
