import test from 'node:test'
import assert from 'node:assert/strict'
import { learnerClusterPoints } from '../src/modules/ai-overview/data/experiments.ts'
import {
  assignPoints,
  initializeCenters,
  recomputeCenters,
  runKMeans,
  squaredDistance,
  withinGroupDistanceTotal,
} from '../src/modules/ai-overview/utils/kmeans.ts'

test('K-means records initialization, assignment, recomputation, and convergence', () => {
  const result = runKMeans(learnerClusterPoints, 3, 3103, 50)

  assert.equal(result.history[0].phase, 'initialization')
  assert.ok(result.history.some((item) => item.phase === 'assignment'))
  assert.ok(result.history.some((item) => item.phase === 'recomputation'))
  assert.equal(result.history.at(-1)?.phase, 'converged')
  assert.equal(result.assignments.length, learnerClusterPoints.length)
  assert.deepEqual(runKMeans(learnerClusterPoints, 3, 3103, 50), result)
})

test('K-means supports K=2..5 and rejects invalid values', () => {
  for (const k of [2, 3, 4, 5]) {
    assert.equal(runKMeans(learnerClusterPoints, k, 3103, 50).centers.length, k)
  }

  assert.throws(() => runKMeans(learnerClusterPoints, 1, 3103, 50), /between 2 and 5/)
  assert.throws(() => runKMeans(learnerClusterPoints, 6, 3103, 50), /between 2 and 5/)
})

test('assignment uses squared distance and keeps the first center on a tie', () => {
  const centers = [
    { id: 'left', x: -1, y: 0 },
    { id: 'right', x: 1, y: 0 },
  ]

  assert.equal(squaredDistance({ id: 'point', x: 2, y: 3 }, { id: 'origin', x: 0, y: 0 }), 13)
  assert.deepEqual(assignPoints([{ id: 'tie', x: 0, y: 0 }], centers), [0])
})

test('recomputation uses arithmetic means and retains an empty cluster center', () => {
  const points = [
    { id: 'a', x: 0, y: 2 },
    { id: 'b', x: 2, y: 4 },
  ]
  const previousCenters = [
    { id: 'old-0', x: 99, y: 99 },
    { id: 'old-1', x: 8, y: 8 },
  ]

  assert.deepEqual(recomputeCenters(points, [0, 0], previousCenters), [
    { id: 'center-0', x: 1, y: 3 },
    previousCenters[1],
  ])
})

test('within-group distance total matches the recorded final metric', () => {
  const result = runKMeans(learnerClusterPoints, 3, 3103, 50)

  assert.equal(
    result.withinGroupDistanceTotal,
    withinGroupDistanceTotal(learnerClusterPoints, result.assignments, result.centers),
  )
})

test('K-means validates dimensions and rejects any non-finite result path', () => {
  const validCenters = [
    { id: 'c0', x: 0, y: 0 },
    { id: 'c1', x: 1, y: 1 },
  ]

  assert.throws(() => runKMeans([], 2, 3103, 50), /at least/)
  assert.throws(() => runKMeans(learnerClusterPoints.slice(0, 2), 3, 3103, 50), /at least/)
  assert.throws(() => runKMeans(learnerClusterPoints, 3, 3103, 0), /positive integer/)
  assert.throws(() => assignPoints([{ id: 'bad', x: Number.NaN, y: 0 }], validCenters), /finite/)
  assert.throws(
    () => squaredDistance({ id: 'large', x: Number.MAX_VALUE, y: 0 }, validCenters[0]),
    /finite/,
  )
  assert.throws(() => recomputeCenters(learnerClusterPoints.slice(0, 2), [0], validCenters), /same length/)
  assert.throws(() => withinGroupDistanceTotal(learnerClusterPoints.slice(0, 1), [2], validCenters), /assignment/)
})

test('max iterations omit a false convergence snapshot when assignments remain unstable', () => {
  const result = runKMeans(learnerClusterPoints, 3, 3103, 1)

  assert.notEqual(result.history.at(-1)?.phase, 'converged')
})

test('initialization returns seeded point copies without mutating input', () => {
  const pointsBefore = structuredClone(learnerClusterPoints)
  const first = initializeCenters(learnerClusterPoints, 3, 3103)

  assert.deepEqual(initializeCenters(learnerClusterPoints, 3, 3103), first)
  assert.deepEqual(learnerClusterPoints, pointsBefore)
  assert.equal(new Set(first.map((center) => center.id)).size, 3)
  assert.ok(first.every((center) => center.id.startsWith('center-')))
})
