import type {
  PredictionParameters,
  PredictionTaskEvaluation,
  PredictionTaskInput,
} from '../data/mathToCode/sharedTask.ts'

const DEFAULT_DERIVATIVE_STEP = 1e-4

function assertFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${label} must be finite`)
  }
}

function assertFiniteVector(values: readonly number[], label: string): void {
  values.forEach((value, index) => assertFinite(value, `${label}[${index}]`))
}

function assertSameLength(left: readonly unknown[], right: readonly unknown[], label: string): void {
  if (left.length !== right.length) {
    throw new RangeError(`${label} must have the same length`)
  }
}

export function predictOne(
  features: readonly number[],
  weights: readonly number[],
  bias: number,
): number {
  assertSameLength(features, weights, 'features and weights')
  assertFiniteVector(features, 'features')
  assertFiniteVector(weights, 'weights')
  assertFinite(bias, 'bias')

  const prediction = features.reduce((sum, feature, index) => sum + feature * weights[index]!, bias)
  assertFinite(prediction, 'prediction')
  return prediction
}

export function predictBatch(
  matrix: readonly (readonly number[])[],
  weights: readonly number[],
  bias: number,
): number[] {
  assertFiniteVector(weights, 'weights')
  assertFinite(bias, 'bias')
  return matrix.map((features) => predictOne(features, weights, bias))
}

export function meanSquaredError(
  predictions: readonly number[],
  targets: readonly number[],
): number {
  assertSameLength(predictions, targets, 'predictions and targets')
  if (predictions.length === 0) {
    throw new RangeError('predictions and targets must contain at least one value')
  }
  assertFiniteVector(predictions, 'predictions')
  assertFiniteVector(targets, 'targets')

  const totalSquaredError = predictions.reduce((sum, prediction, index) => {
    const error = prediction - targets[index]!
    return sum + error * error
  }, 0)
  const mse = totalSquaredError / predictions.length
  assertFinite(mse, 'mean squared error')
  return mse
}

export function centralDifference(
  fn: (value: number) => number,
  value: number,
  step: number,
): number {
  assertFinite(value, 'value')
  assertFinite(step, 'step')
  if (step <= 0) {
    throw new RangeError('step must be positive')
  }

  const upperValue = value + step
  const lowerValue = value - step
  assertFinite(upperValue, 'upper difference input')
  assertFinite(lowerValue, 'lower difference input')
  const upperResult = fn(upperValue)
  const lowerResult = fn(lowerValue)
  assertFinite(upperResult, 'upper function result')
  assertFinite(lowerResult, 'lower function result')

  const derivative = (upperResult - lowerResult) / (2 * step)
  assertFinite(derivative, 'central difference')
  return derivative
}

export function evaluatePredictionTask(input: PredictionTaskInput): PredictionTaskEvaluation {
  if (input.samples.length === 0) {
    throw new RangeError('samples must contain at least one item')
  }

  const matrix = input.samples.map((sample) => [...sample.features])
  const targets = input.samples.map((sample) => sample.target)
  const weights = [...input.parameters.weights]
  const bias = input.parameters.bias
  const derivativeStep = input.derivativeStep ?? DEFAULT_DERIVATIVE_STEP

  assertFiniteVector(targets, 'targets')
  assertFiniteVector(weights, 'weights')
  assertFinite(bias, 'bias')
  assertFinite(derivativeStep, 'derivative step')
  if (derivativeStep <= 0) {
    throw new RangeError('derivative step must be positive')
  }

  const lossFor = (candidateWeights: readonly number[], candidateBias: number): number => (
    meanSquaredError(predictBatch(matrix, candidateWeights, candidateBias), targets)
  )
  const predictions = predictBatch(matrix, weights, bias)
  const mse = meanSquaredError(predictions, targets)
  const weightDerivatives = weights.map((weight, weightIndex) => centralDifference((candidateWeight) => {
    const candidateWeights = [...weights]
    candidateWeights[weightIndex] = candidateWeight
    return lossFor(candidateWeights, bias)
  }, weight, derivativeStep))
  const parameterDerivatives: PredictionParameters = {
    weights: weightDerivatives,
    bias: centralDifference((candidateBias) => lossFor(weights, candidateBias), bias, derivativeStep),
  }

  return {
    matrix,
    targets,
    predictions,
    mse,
    parameterDerivatives,
  }
}
