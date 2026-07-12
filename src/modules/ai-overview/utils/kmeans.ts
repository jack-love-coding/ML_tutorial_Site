import type { KMeansPhase, KMeansSnapshot, KMeansState, Point2D } from '../types'
import { createSeededRandom } from './random.ts'

export function squaredDistance(a: Point2D, b: Point2D) {
  assertFinitePoints([a, b])
  const deltaX = a.x - b.x
  const deltaY = a.y - b.y
  assertFinite('coordinate difference', deltaX, deltaY)
  const distance = deltaX ** 2 + deltaY ** 2
  assertFinite('squared distance', distance)
  return distance
}

export function initializeCenters(points: Point2D[], k: number, seed: number) {
  assertPoints(points)
  assertPositiveInteger('k', k)
  if (k > points.length) throw new Error('points must contain at least k items')

  const random = createSeededRandom(seed)
  const shuffled = points.map((_, index) => index)
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1))
    ;[shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]]
  }

  return shuffled.slice(0, k).map((pointIndex, centerIndex) => ({
    id: `center-${centerIndex}`,
    x: points[pointIndex].x,
    y: points[pointIndex].y,
  }))
}

export function assignPoints(points: Point2D[], centers: Point2D[]) {
  assertPoints(points)
  assertCenters(centers)

  return points.map((point) =>
    centers.reduce(
      (best, center, index) =>
        squaredDistance(point, center) < squaredDistance(point, centers[best]) ? index : best,
      0,
    ),
  )
}

export function recomputeCenters(
  points: Point2D[],
  assignments: number[],
  previousCenters: Point2D[],
) {
  assertPoints(points)
  assertCenters(previousCenters)
  assertAssignments(points, assignments, previousCenters)

  const totals = previousCenters.map(() => ({ x: 0, y: 0, count: 0 }))
  points.forEach((point, index) => {
    const total = totals[assignments[index]]
    total.x += point.x
    total.y += point.y
    total.count += 1
    assertFinite('cluster coordinate total', total.x, total.y)
  })

  return totals.map((total, index) => {
    if (total.count === 0) return { ...previousCenters[index] }
    const center = {
      id: `center-${index}`,
      x: total.x / total.count,
      y: total.y / total.count,
    }
    assertFinitePoints([center])
    return center
  })
}

export function withinGroupDistanceTotal(
  points: Point2D[],
  assignments: number[],
  centers: Point2D[],
) {
  assertPoints(points)
  assertCenters(centers)
  assertAssignments(points, assignments, centers)

  return points.reduce((sum, point, index) => {
    const nextSum = sum + squaredDistance(point, centers[assignments[index]])
    assertFinite('within-group distance total', nextSum)
    return nextSum
  }, 0)
}

export function runKMeans(points: Point2D[], k: number, seed: number, maxIterations: number): KMeansState {
  assertPoints(points)
  if (!Number.isInteger(k) || k < 2 || k > 5) throw new Error('k must be between 2 and 5')
  if (points.length < k) throw new Error('points must contain at least k items')
  assertPositiveInteger('maxIterations', maxIterations)

  let centers = initializeCenters(points, k, seed)
  let assignments: number[] = []
  let previousAssignments: number[] = []
  let phase: KMeansPhase = 'initialization'
  let iteration = 0
  const history: KMeansSnapshot[] = [snapshot(0, phase, centers, assignments, 0)]

  for (iteration = 1; iteration <= maxIterations; iteration += 1) {
    assignments = assignPoints(points, centers)
    phase = 'assignment'
    history.push(snapshot(iteration, phase, centers, assignments, withinGroupDistanceTotal(points, assignments, centers)))

    centers = recomputeCenters(points, assignments, centers)
    phase = 'recomputation'
    const distanceTotal = withinGroupDistanceTotal(points, assignments, centers)
    history.push(snapshot(iteration, phase, centers, assignments, distanceTotal))

    if (sameAssignments(assignments, previousAssignments)) {
      phase = 'converged'
      history.push(snapshot(iteration, phase, centers, assignments, distanceTotal))
      break
    }
    previousAssignments = [...assignments]
  }

  const completedIterations = Math.min(iteration, maxIterations)
  return {
    points: points.map((point) => ({ ...point })),
    k,
    seed,
    centers: centers.map((center) => ({ ...center })),
    assignments: [...assignments],
    phase,
    iteration: completedIterations,
    withinGroupDistanceTotal: withinGroupDistanceTotal(points, assignments, centers),
    history,
    playbackMode: 'idle',
    speed: 1,
  }
}

function snapshot(
  iteration: number,
  phase: KMeansPhase,
  centers: Point2D[],
  assignments: number[],
  distanceTotal: number,
): KMeansSnapshot {
  return {
    iteration,
    phase,
    centers: centers.map((center) => ({ ...center })),
    assignments: [...assignments],
    withinGroupDistanceTotal: distanceTotal,
  }
}

function sameAssignments(current: number[], previous: number[]) {
  return current.length === previous.length && current.every((assignment, index) => assignment === previous[index])
}

function assertPoints(points: Point2D[]) {
  if (!points.length) throw new Error('points must contain at least one item')
  assertFinitePoints(points)
}

function assertCenters(centers: Point2D[]) {
  if (!centers.length) throw new Error('centers must contain at least one item')
  assertFinitePoints(centers)
}

function assertFinitePoints(points: Point2D[]) {
  if (points.some((point) => !Number.isFinite(point.x) || !Number.isFinite(point.y))) {
    throw new Error('point coordinates must be finite')
  }
}

function assertAssignments(points: Point2D[], assignments: number[], centers: Point2D[]) {
  if (assignments.length !== points.length) throw new Error('assignments and points must have the same length')
  if (assignments.some((assignment) => !Number.isInteger(assignment) || assignment < 0 || assignment >= centers.length)) {
    throw new Error('assignment must identify an existing center')
  }
}

function assertPositiveInteger(label: string, value: number) {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${label} must be a positive integer`)
}

function assertFinite(label: string, ...values: number[]) {
  if (values.some((value) => !Number.isFinite(value))) throw new Error(`${label} must be finite`)
}
