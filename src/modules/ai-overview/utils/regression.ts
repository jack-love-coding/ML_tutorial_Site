import type { RegressionSample } from '../types'

export function predict(sample: RegressionSample, w: number, b: number) {
  assertFinite('sample coordinates and parameters', sample.x, sample.y, w, b)
  const weightedX = w * sample.x
  assertFinite('weighted sample value', weightedX)
  const predicted = weightedX + b
  assertFinite('prediction', predicted)
  return predicted
}

export function regressionRows(samples: RegressionSample[], w: number, b: number) {
  return samples.map((sample) => {
    const predicted = predict(sample, w, b)
    const residual = sample.y - predicted
    assertFinite('residual', residual)
    const squaredResidual = residual ** 2
    assertFinite('squared residual', squaredResidual)
    return { ...sample, predicted, residual, squaredResidual }
  })
}

export function meanSquaredError(samples: RegressionSample[], w: number, b: number) {
  if (!samples.length) throw new Error('samples must not be empty')
  const squaredResidualTotal = regressionRows(samples, w, b).reduce((sum, row) => {
    const nextSum = sum + row.squaredResidual
    assertFinite('squared residual accumulation', nextSum)
    return nextSum
  }, 0)
  const mse = squaredResidualTotal / samples.length
  assertFinite('mean squared error', mse)
  return mse
}

export function rankRegressionCandidates(
  samples: RegressionSample[],
  candidates: Array<{ w: number; b: number }>,
) {
  return candidates
    .map((item, index) => ({ ...item, index, mse: meanSquaredError(samples, item.w, item.b) }))
    .sort((a, b) => a.mse - b.mse || a.index - b.index)
}

function assertFinite(label: string, ...values: number[]) {
  if (values.some((value) => !Number.isFinite(value))) throw new Error(`${label} must be finite`)
}
