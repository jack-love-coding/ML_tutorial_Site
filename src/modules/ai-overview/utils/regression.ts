import type { RegressionSample } from '../types'

export type RegressionCandidate = { w: number; b: number }
export type RegressionVisitSource = 'initial' | 'manual' | 'path'
export type RegressionCandidateVisit = RegressionCandidate & {
  mse: number
  source: RegressionVisitSource
  sequence: number
}
export type RegressionSearchState = {
  path: Array<RegressionCandidate & { index: number; mse: number }>
  cursor: number
  current: RegressionCandidateVisit
  best: RegressionCandidateVisit
  history: RegressionCandidateVisit[]
}

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

function createCandidateVisit(
  samples: RegressionSample[],
  candidate: RegressionCandidate,
  source: RegressionVisitSource,
  sequence: number,
): RegressionCandidateVisit {
  return {
    w: candidate.w,
    b: candidate.b,
    mse: meanSquaredError(samples, candidate.w, candidate.b),
    source,
    sequence,
  }
}

export function initializeRegressionSearch(
  samples: RegressionSample[],
  candidates: RegressionCandidate[],
): RegressionSearchState {
  const path = [...rankRegressionCandidates(samples, candidates)].reverse()
  if (!path.length) throw new Error('regression candidate path must not be empty')
  const current = createCandidateVisit(samples, path[0], 'initial', 1)
  return { path, cursor: 1, current, best: current, history: [current] }
}

export function recordRegressionCandidate(
  state: RegressionSearchState,
  samples: RegressionSample[],
  candidate: RegressionCandidate,
  source: Exclude<RegressionVisitSource, 'initial'>,
): RegressionSearchState {
  const current = createCandidateVisit(samples, candidate, source, state.history.length + 1)
  const best = current.mse < state.best.mse ? current : state.best
  return { ...state, current, best, history: [...state.history, current] }
}

export function stepRegressionSearch(
  state: RegressionSearchState,
  samples: RegressionSample[],
): RegressionSearchState {
  if (state.cursor >= state.path.length) return state
  const candidate = state.path[state.cursor]
  const next = recordRegressionCandidate(state, samples, candidate, 'path')
  return { ...next, cursor: state.cursor + 1 }
}

function assertFinite(label: string, ...values: number[]) {
  if (values.some((value) => !Number.isFinite(value))) throw new Error(`${label} must be finite`)
}
