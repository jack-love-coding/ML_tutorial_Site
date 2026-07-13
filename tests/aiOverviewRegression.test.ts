import test from 'node:test'
import assert from 'node:assert/strict'
import * as regression from '../src/modules/ai-overview/utils/regression.ts'
import { createSeededRandom } from '../src/modules/ai-overview/utils/random.ts'

const {
  meanSquaredError,
  predict,
  rankRegressionCandidates,
  regressionRows,
} = regression

const samples = [
  { id: 'a', x: 1, y: 3 },
  { id: 'b', x: 2, y: 5 },
]

test('regression keeps prediction, residual, squared residual, and MSE consistent', () => {
  assert.equal(predict(samples[0], 2, 1), 3)
  assert.deepEqual(regressionRows(samples, 1, 1), [
    { id: 'a', x: 1, y: 3, predicted: 2, residual: 1, squaredResidual: 1 },
    { id: 'b', x: 2, y: 5, predicted: 3, residual: 2, squaredResidual: 4 },
  ])
  assert.equal(meanSquaredError(samples, 1, 1), 2.5)
})

test('candidate ranking is stable and rejects non-finite parameters', () => {
  assert.deepEqual(
    rankRegressionCandidates(samples, [
      { w: 1, b: 1 },
      { w: 2, b: 1 },
    ]).map(({ w, b }) => [w, b]),
    [
      [2, 1],
      [1, 1],
    ],
  )
  assert.throws(() => meanSquaredError(samples, Number.NaN, 0), /finite/)
})

test('prediction rejects non-finite sample coordinates', () => {
  for (const sample of [
    { id: 'nan-x', x: Number.NaN, y: 0 },
    { id: 'infinite-x', x: Number.POSITIVE_INFINITY, y: 0 },
    { id: 'nan-y', x: 0, y: Number.NaN },
    { id: 'infinite-y', x: 0, y: Number.NEGATIVE_INFINITY },
  ]) {
    assert.throws(() => predict(sample, 1, 0), /finite/)
  }
})

test('prediction rejects finite operands whose arithmetic overflows', () => {
  const sample = { id: 'large-x', x: Number.MAX_VALUE, y: 0 }

  assert.throws(() => predict(sample, 2, 0), /finite/)
  assert.throws(() => predict(sample, 1, Number.MAX_VALUE), /finite/)
})

test('regression rows and MSE reject overflow in derived values and accumulation', () => {
  assert.throws(
    () => regressionRows([{ id: 'residual-overflow', x: 0, y: Number.MAX_VALUE }], 0, -Number.MAX_VALUE),
    /finite/,
  )
  assert.throws(
    () => regressionRows([{ id: 'squared-residual-overflow', x: 0, y: 1e200 }], 0, 0),
    /finite/,
  )
  assert.throws(
    () =>
      meanSquaredError(
        [
          { id: 'sum-overflow-a', x: 0, y: 1e154 },
          { id: 'sum-overflow-b', x: 0, y: 1e154 },
        ],
        0,
        0,
      ),
    /finite/,
  )
})

test('equal-MSE candidate ranking preserves input order', () => {
  const tiedCandidates = [
    { w: 2, b: 2 },
    { w: 2, b: 0 },
  ]

  assert.deepEqual(
    rankRegressionCandidates(samples, tiedCandidates).map(({ w, b }) => ({ w, b })),
    tiedCandidates,
  )
})

test('manual regression candidates enter auditable history and can become current best', () => {
  assert.equal(typeof regression.initializeRegressionSearch, 'function')
  assert.equal(typeof regression.recordRegressionCandidate, 'function')
  const initial = regression.initializeRegressionSearch(samples, [{ w: 0, b: 0 }, { w: 1, b: 0 }])
  const improved = regression.recordRegressionCandidate(initial, samples, { w: 2, b: 1 }, 'manual')
  const worsened = regression.recordRegressionCandidate(improved, samples, { w: 0, b: 0 }, 'manual')

  assert.deepEqual(improved.current, improved.best)
  assert.ok(worsened.best.mse <= worsened.current.mse)
  assert.deepEqual(worsened.history.map((visit) => visit.source), ['initial', 'manual', 'manual'])
  assert.deepEqual(worsened.history.map((visit) => visit.sequence), [1, 2, 3])
})

test('initializing a different regression preset creates an isolated synchronized history', () => {
  assert.equal(typeof regression.initializeRegressionSearch, 'function')
  const first = regression.initializeRegressionSearch(samples, [{ w: 0, b: 0 }, { w: 2, b: 1 }])
  const changedSamples = samples.map((sample) => ({ ...sample, y: sample.y + 10 }))
  const second = regression.initializeRegressionSearch(changedSamples, [{ w: 0, b: 10 }, { w: 2, b: 11 }])

  assert.equal(second.cursor, 1)
  assert.equal(second.history.length, 1)
  assert.deepEqual(second.current, second.best)
  assert.deepEqual(second.history[0], second.current)
  assert.notDeepEqual(second.history, first.history)
})

test('candidate steps append one deterministic visit at a time', () => {
  assert.equal(typeof regression.initializeRegressionSearch, 'function')
  assert.equal(typeof regression.stepRegressionSearch, 'function')
  const candidates = [{ w: 0, b: 0 }, { w: 1, b: 0 }, { w: 2, b: 1 }]
  const run = () => {
    let state = regression.initializeRegressionSearch(samples, candidates)
    while (state.cursor < state.path.length) state = regression.stepRegressionSearch(state, samples)
    return state
  }
  const first = run()
  const replay = run()

  assert.deepEqual(replay, first)
  assert.equal(first.history.length, candidates.length)
  assert.deepEqual(first.history.map((visit) => visit.source), ['initial', 'path', 'path'])
  assert.deepEqual(
    first.history.map(({ w, b }) => ({ w, b })),
    first.path.map(({ w, b }) => ({ w, b })),
  )
  assert.ok(first.best.mse <= first.current.mse)
})

test('seeded random generators reproduce the same sequence and require integer seeds', () => {
  const first = createSeededRandom(3103)
  const second = createSeededRandom(3103)

  assert.deepEqual(
    Array.from({ length: 5 }, () => first()),
    Array.from({ length: 5 }, () => second()),
  )
  assert.throws(() => createSeededRandom(3.103), /integer/)
})
