import type { RegressionTeachingSample } from '../data/sharedRegressionTeachingData.ts'

export type GradientBatchMode = 'full' | 'mini-batch' | 'stochastic'
export type GradientTrajectoryStatus =
  | 'running'
  | 'converged'
  | 'max-updates'
  | 'oscillating'
  | 'diverged-non-finite'
  | 'diverged-threshold'

export interface LinearParameters {
  readonly weight: number
  readonly bias: number
}

export interface LinearGradient {
  readonly weight: number
  readonly bias: number
}

export interface RegressionEvaluation {
  readonly parameters: LinearParameters
  readonly predictions: readonly number[]
  readonly residuals: readonly number[]
  readonly mse: number
  readonly gradient: LinearGradient
  readonly gradientNorm: number
}

export interface StandardizedRegressionData {
  readonly samples: readonly RegressionTeachingSample[]
  readonly mean: number
  readonly scale: number
}

export interface GradientBatch {
  readonly epoch: number
  readonly batchIndex: number
  readonly sampleIds: readonly string[]
  readonly sampleIndices: readonly number[]
}

export interface GradientUpdateSnapshot {
  readonly update: number
  readonly epoch: number
  readonly batchIndex: number
  readonly processedSamples: number
  readonly sampleIds: readonly string[]
  readonly before: LinearParameters
  readonly gradient: LinearGradient
  readonly gradientNorm: number
  readonly delta: LinearParameters
  readonly after: LinearParameters
  readonly fullMse: number
  readonly status: GradientTrajectoryStatus
}

export interface GradientTrajectoryOptions {
  readonly samples: readonly RegressionTeachingSample[]
  readonly initial: LinearParameters
  readonly learningRate: number
  readonly batchMode: GradientBatchMode
  readonly epochs: number
  readonly seed?: number
  readonly miniBatchSize?: number
  readonly convergenceTolerance?: number
  readonly divergenceThreshold?: number
}

export interface GradientTrajectory {
  readonly initial: RegressionEvaluation
  readonly updates: readonly GradientUpdateSnapshot[]
  readonly final: RegressionEvaluation
  readonly status: GradientTrajectoryStatus
  readonly stoppedReason: GradientTrajectoryStatus
}

function finiteNumber(value: number, label: string) {
  if (!Number.isFinite(value)) throw new RangeError(`${label} must be finite`)
  return value
}

function validateSamples(samples: readonly RegressionTeachingSample[]) {
  if (!samples.length) throw new RangeError('At least one sample is required')
  for (const sample of samples) {
    finiteNumber(sample.x, `${sample.id}.x`)
    finiteNumber(sample.y, `${sample.id}.y`)
  }
}

export function predictLinear(
  samples: readonly RegressionTeachingSample[],
  parameters: LinearParameters,
): readonly number[] {
  validateSamples(samples)
  const weight = finiteNumber(parameters.weight, 'weight')
  const bias = finiteNumber(parameters.bias, 'bias')
  return samples.map((sample) => weight * sample.x + bias)
}

export function evaluateLinearRegression(
  samples: readonly RegressionTeachingSample[],
  parameters: LinearParameters,
): RegressionEvaluation {
  const predictions = predictLinear(samples, parameters)
  const residuals = samples.map((sample, index) => sample.y - predictions[index])
  const count = samples.length
  const mse = residuals.reduce((sum, residual) => sum + residual ** 2, 0) / count
  const gradient = {
    weight: -(2 / count) * samples.reduce(
      (sum, sample, index) => sum + sample.x * residuals[index],
      0,
    ),
    bias: -(2 / count) * residuals.reduce((sum, residual) => sum + residual, 0),
  }
  return {
    parameters: { ...parameters },
    predictions,
    residuals,
    mse,
    gradient,
    gradientNorm: Math.hypot(gradient.weight, gradient.bias),
  }
}

export function meanSquaredError(
  samples: readonly RegressionTeachingSample[],
  parameters: LinearParameters,
) {
  return evaluateLinearRegression(samples, parameters).mse
}

export function centralDifferenceGradient(
  samples: readonly RegressionTeachingSample[],
  parameters: LinearParameters,
  step = 1e-5,
): LinearGradient {
  const h = finiteNumber(step, 'finite-difference step')
  if (h <= 0) throw new RangeError('finite-difference step must be positive')
  return {
    weight: (
      meanSquaredError(samples, { ...parameters, weight: parameters.weight + h })
      - meanSquaredError(samples, { ...parameters, weight: parameters.weight - h })
    ) / (2 * h),
    bias: (
      meanSquaredError(samples, { ...parameters, bias: parameters.bias + h })
      - meanSquaredError(samples, { ...parameters, bias: parameters.bias - h })
    ) / (2 * h),
  }
}

export function applyGradientUpdate(
  parameters: LinearParameters,
  gradient: LinearGradient,
  learningRate: number,
): LinearParameters {
  const rate = finiteNumber(learningRate, 'learning rate')
  if (rate < 0) throw new RangeError('learning rate must be non-negative')
  return {
    weight: parameters.weight - rate * finiteNumber(gradient.weight, 'weight gradient'),
    bias: parameters.bias - rate * finiteNumber(gradient.bias, 'bias gradient'),
  }
}

export function fitLeastSquares(
  samples: readonly RegressionTeachingSample[],
): LinearParameters {
  validateSamples(samples)
  const meanX = samples.reduce((sum, sample) => sum + sample.x, 0) / samples.length
  const meanY = samples.reduce((sum, sample) => sum + sample.y, 0) / samples.length
  const numerator = samples.reduce(
    (sum, sample) => sum + (sample.x - meanX) * (sample.y - meanY),
    0,
  )
  const denominator = samples.reduce((sum, sample) => sum + (sample.x - meanX) ** 2, 0)
  if (denominator === 0) throw new RangeError('Least squares requires non-constant x values')
  const weight = numerator / denominator
  return { weight, bias: meanY - weight * meanX }
}

export function standardizeRegressionInputs(
  samples: readonly RegressionTeachingSample[],
): StandardizedRegressionData {
  validateSamples(samples)
  const mean = samples.reduce((sum, sample) => sum + sample.x, 0) / samples.length
  const variance = samples.reduce((sum, sample) => sum + (sample.x - mean) ** 2, 0) / samples.length
  const scale = Math.sqrt(variance)
  if (scale === 0) throw new RangeError('Standardization requires non-constant x values')
  return {
    mean,
    scale,
    samples: samples.map((sample) => ({ ...sample, x: (sample.x - mean) / scale })),
  }
}

function createLcg(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function shuffledIndices(length: number, seed: number) {
  const indices = Array.from({ length }, (_, index) => index)
  const random = createLcg(seed)
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[indices[index], indices[target]] = [indices[target], indices[index]]
  }
  return indices
}

export function createEpochBatches(
  samples: readonly RegressionTeachingSample[],
  mode: GradientBatchMode,
  epoch: number,
  seed = 2801,
  miniBatchSize = 2,
): readonly GradientBatch[] {
  validateSamples(samples)
  if (!Number.isInteger(epoch) || epoch < 0) throw new RangeError('epoch must be a non-negative integer')
  if (!Number.isInteger(miniBatchSize) || miniBatchSize < 1) {
    throw new RangeError('mini-batch size must be a positive integer')
  }
  const size = mode === 'full' ? samples.length : mode === 'stochastic' ? 1 : miniBatchSize
  const indices = mode === 'full'
    ? Array.from({ length: samples.length }, (_, index) => index)
    : shuffledIndices(samples.length, (seed + Math.imul(epoch, 2654435761)) >>> 0)
  const batches: GradientBatch[] = []
  for (let offset = 0; offset < indices.length; offset += size) {
    const sampleIndices = indices.slice(offset, offset + size)
    batches.push({
      epoch,
      batchIndex: batches.length,
      sampleIndices,
      sampleIds: sampleIndices.map((index) => samples[index].id),
    })
  }
  return batches
}

function trajectoryStatus(
  evaluation: RegressionEvaluation,
  previousMse: number | undefined,
  convergenceTolerance: number,
  divergenceThreshold: number,
): GradientTrajectoryStatus {
  const values = [
    evaluation.parameters.weight,
    evaluation.parameters.bias,
    evaluation.mse,
    evaluation.gradient.weight,
    evaluation.gradient.bias,
  ]
  if (!values.every(Number.isFinite)) return 'diverged-non-finite'
  if (
    Math.abs(evaluation.parameters.weight) > divergenceThreshold
    || Math.abs(evaluation.parameters.bias) > divergenceThreshold
    || evaluation.mse > divergenceThreshold
  ) return 'diverged-threshold'
  if (evaluation.gradientNorm <= convergenceTolerance) return 'converged'
  if (previousMse !== undefined && evaluation.mse > previousMse * 1.02) return 'oscillating'
  return 'running'
}

export function simulateLinearGradientTrajectory(
  options: GradientTrajectoryOptions,
): GradientTrajectory {
  validateSamples(options.samples)
  const learningRate = finiteNumber(options.learningRate, 'learning rate')
  if (learningRate < 0) throw new RangeError('learning rate must be non-negative')
  if (!Number.isInteger(options.epochs) || options.epochs < 1) {
    throw new RangeError('epochs must be a positive integer')
  }
  const convergenceTolerance = options.convergenceTolerance ?? 1e-8
  const divergenceThreshold = options.divergenceThreshold ?? 1e12
  const initial = evaluateLinearRegression(options.samples, options.initial)
  let parameters = { ...options.initial }
  let processedSamples = 0
  let previousMse = initial.mse
  let terminalStatus: GradientTrajectoryStatus = 'max-updates'
  const updates: GradientUpdateSnapshot[] = []

  outer: for (let epoch = 0; epoch < options.epochs; epoch += 1) {
    const batches = createEpochBatches(
      options.samples,
      options.batchMode,
      epoch,
      options.seed,
      options.miniBatchSize,
    )
    for (const batch of batches) {
      const subset = batch.sampleIndices.map((index) => options.samples[index])
      const batchEvaluation = evaluateLinearRegression(subset, parameters)
      const candidate = applyGradientUpdate(parameters, batchEvaluation.gradient, learningRate)
      const fullEvaluation = evaluateLinearRegression(options.samples, candidate)
      const status = trajectoryStatus(
        fullEvaluation,
        previousMse,
        convergenceTolerance,
        divergenceThreshold,
      )
      processedSamples += subset.length
      updates.push({
        update: updates.length + 1,
        epoch,
        batchIndex: batch.batchIndex,
        processedSamples,
        sampleIds: batch.sampleIds,
        before: { ...parameters },
        gradient: batchEvaluation.gradient,
        gradientNorm: batchEvaluation.gradientNorm,
        delta: {
          weight: candidate.weight - parameters.weight,
          bias: candidate.bias - parameters.bias,
        },
        after: candidate,
        fullMse: fullEvaluation.mse,
        status,
      })
      parameters = candidate
      previousMse = fullEvaluation.mse
      if (status === 'converged' || status.startsWith('diverged')) {
        terminalStatus = status
        break outer
      }
      if (status === 'oscillating') terminalStatus = status
    }
  }

  const final = evaluateLinearRegression(options.samples, parameters)
  if (terminalStatus === 'oscillating' && final.mse <= initial.mse) terminalStatus = 'max-updates'
  return { initial, updates, final, status: terminalStatus, stoppedReason: terminalStatus }
}
