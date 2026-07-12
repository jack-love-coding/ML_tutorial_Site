import type { RegressionSample } from '../types'

export function predict(sample: RegressionSample, w: number, b: number) {
  assertFinite(w, b)
  return w * sample.x + b
}

export function regressionRows(samples: RegressionSample[], w: number, b: number) {
  return samples.map((sample) => {
    const predicted = predict(sample, w, b)
    const residual = sample.y - predicted
    return { ...sample, predicted, residual, squaredResidual: residual ** 2 }
  })
}

export function meanSquaredError(samples: RegressionSample[], w: number, b: number) {
  if (!samples.length) throw new Error('samples must not be empty')
  return regressionRows(samples, w, b).reduce((sum, row) => sum + row.squaredResidual, 0) / samples.length
}

export function rankRegressionCandidates(
  samples: RegressionSample[],
  candidates: Array<{ w: number; b: number }>,
) {
  return candidates
    .map((item, index) => ({ ...item, index, mse: meanSquaredError(samples, item.w, item.b) }))
    .sort((a, b) => a.mse - b.mse || a.index - b.index)
}

function assertFinite(...values: number[]) {
  if (values.some((value) => !Number.isFinite(value))) throw new Error('parameters must be finite')
}
