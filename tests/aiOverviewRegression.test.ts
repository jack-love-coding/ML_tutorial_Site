import test from 'node:test'
import assert from 'node:assert/strict'
import {
  meanSquaredError,
  predict,
  rankRegressionCandidates,
  regressionRows,
} from '../src/modules/ai-overview/utils/regression.ts'
import { createSeededRandom } from '../src/modules/ai-overview/utils/random.ts'

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

test('seeded random generators reproduce the same sequence and require integer seeds', () => {
  const first = createSeededRandom(3103)
  const second = createSeededRandom(3103)

  assert.deepEqual(
    Array.from({ length: 5 }, () => first()),
    Array.from({ length: 5 }, () => second()),
  )
  assert.throws(() => createSeededRandom(3.103), /integer/)
})
