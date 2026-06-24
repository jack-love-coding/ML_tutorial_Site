import { angleBetween, clamp, norm, round, type Vector2 } from './math.ts'

export interface GradientDatasetPoint {
  id: number
  feature: number
  target: number
}

export interface BatchGradientNoiseInput {
  datasetSize: number
  batchSize: number
  seed: number
  learningRate: number
  includeOutlier: boolean
  shuffle: boolean
  theta: Vector2
}

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

export function createSeededRandom(seed: number) {
  let state = Math.max(1, Math.floor(Math.abs(finiteOr(seed, 1)))) % 2_147_483_647
  return () => {
    state = (state * 48_271) % 2_147_483_647
    return state / 2_147_483_647
  }
}

export function createGradientDataset(size: number, seed: number, includeOutlier: boolean): GradientDatasetPoint[] {
  const sampleCount = Math.max(4, Math.min(96, Math.floor(finiteOr(size, 24))))
  const random = createSeededRandom(seed)
  const points = Array.from({ length: sampleCount }, (_, index) => {
    const feature = -2 + (4 * index) / Math.max(1, sampleCount - 1)
    const noise = (random() - 0.5) * 0.52
    return {
      id: index,
      feature,
      target: 1.45 * feature - 0.35 + noise,
    }
  })

  if (includeOutlier) {
    const outlier = points[points.length - 1]
    if (outlier) {
      outlier.target += 3.6
    }
  }

  return points
}

export function exampleGradient(point: GradientDatasetPoint, theta: Vector2): Vector2 {
  const prediction = theta.x * point.feature + theta.y
  const error = prediction - point.target
  return {
    x: error * point.feature,
    y: error,
  }
}

export function averageGradient(points: readonly GradientDatasetPoint[], theta: Vector2): Vector2 {
  if (!points.length) return { x: 0, y: 0 }
  const total = points.reduce(
    (sum, point) => {
      const gradient = exampleGradient(point, theta)
      return {
        x: sum.x + gradient.x,
        y: sum.y + gradient.y,
      }
    },
    { x: 0, y: 0 },
  )
  return {
    x: total.x / points.length,
    y: total.y / points.length,
  }
}

export function selectBatchIndices(datasetSize: number, batchSize: number, seed: number, shuffle: boolean) {
  const size = Math.max(1, Math.floor(finiteOr(datasetSize, 1)))
  const count = Math.max(1, Math.min(size, Math.floor(finiteOr(batchSize, 1))))
  const indices = Array.from({ length: size }, (_, index) => index)

  if (count === size) return indices
  if (!shuffle) return indices.slice(0, count)

  const random = createSeededRandom(seed + 101)
  for (let index = indices.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    ;[indices[index], indices[swapIndex]] = [indices[swapIndex]!, indices[index]!]
  }
  return indices.slice(0, count).sort((left, right) => left - right)
}

function gradientDifference(left: Vector2, right: Vector2): Vector2 {
  return {
    x: left.x - right.x,
    y: left.y - right.y,
  }
}

function takeStep(theta: Vector2, gradient: Vector2, learningRate: number): Vector2 {
  return {
    x: theta.x - learningRate * gradient.x,
    y: theta.y - learningRate * gradient.y,
  }
}

function buildPath(input: BatchGradientNoiseInput, dataset: GradientDatasetPoint[]) {
  const learningRate = clamp(finiteOr(input.learningRate, 0.08), 0.005, 0.4)
  let theta = {
    x: clamp(finiteOr(input.theta.x, 0), -3, 3),
    y: clamp(finiteOr(input.theta.y, 0), -3, 3),
  }
  const path = [theta]

  for (let step = 0; step < 8; step += 1) {
    const batchIndices = selectBatchIndices(dataset.length, input.batchSize, input.seed + step * 17, input.shuffle)
    const batchPoints = batchIndices.map((index) => dataset[index]!).filter(Boolean)
    const gradient = averageGradient(batchPoints, theta)
    theta = takeStep(theta, gradient, learningRate)
    path.push(theta)
  }

  return path
}

export function evaluateBatchGradientNoise(input: BatchGradientNoiseInput) {
  const dataset = createGradientDataset(input.datasetSize, input.seed, input.includeOutlier)
  const batchIndices = selectBatchIndices(dataset.length, input.batchSize, input.seed, input.shuffle)
  const batchPoints = batchIndices.map((index) => dataset[index]!).filter(Boolean)
  const theta = {
    x: clamp(finiteOr(input.theta.x, 0), -3, 3),
    y: clamp(finiteOr(input.theta.y, 0), -3, 3),
  }
  const learningRate = clamp(finiteOr(input.learningRate, 0.08), 0.005, 0.4)
  const fullGradient = averageGradient(dataset, theta)
  const batchGradient = averageGradient(batchPoints, theta)
  const delta = gradientDifference(batchGradient, fullGradient)
  const gradientError = norm(delta)
  const gradientAngle =
    gradientError < 1e-12 || norm(fullGradient) < 1e-12 || norm(batchGradient) < 1e-12
      ? 0
      : angleBetween(fullGradient, batchGradient)
  const nextTheta = takeStep(theta, batchGradient, learningRate)
  const gradientSamples = Array.from({ length: 18 }, (_, sampleIndex) => {
    const indices = selectBatchIndices(dataset.length, input.batchSize, input.seed + sampleIndex * 31, input.shuffle)
    return averageGradient(indices.map((index) => dataset[index]!).filter(Boolean), theta)
  })

  return {
    dataset,
    batchIndices,
    batchPoints,
    theta,
    learningRate,
    fullGradient,
    batchGradient,
    gradientError,
    gradientAngle: round(gradientAngle, 12),
    nextTheta,
    path: buildPath(input, dataset),
    gradientSamples,
  }
}
