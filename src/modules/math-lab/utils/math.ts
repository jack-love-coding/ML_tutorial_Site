export interface Vector2 {
  x: number
  y: number
}

export type Matrix2x2 = readonly [readonly [number, number], readonly [number, number]]

export type VectorN = number[]
export type ColumnSpaceKind = 'point' | 'line' | 'plane'

function finiteOrZero(value: number) {
  return Number.isFinite(value) ? value : 0
}

export function sanitizeVector(values: readonly number[]): VectorN {
  return values.map(finiteOrZero)
}

export function vectorDifference(left: readonly number[], right: readonly number[]): VectorN {
  const length = Math.max(left.length, right.length)
  return Array.from({ length }, (_, index) => finiteOrZero(left[index] ?? 0) - finiteOrZero(right[index] ?? 0))
}

export function dotN(left: readonly number[], right: readonly number[]) {
  const length = Math.max(left.length, right.length)
  return Array.from({ length }, (_, index) => finiteOrZero(left[index] ?? 0) * finiteOrZero(right[index] ?? 0))
    .reduce((sum, value) => sum + value, 0)
}

export function l1Norm(values: readonly number[]) {
  return sanitizeVector(values).reduce((sum, value) => sum + Math.abs(value), 0)
}

export function l2NormN(values: readonly number[]) {
  return Math.hypot(...sanitizeVector(values))
}

export function infinityNorm(values: readonly number[]) {
  return sanitizeVector(values).reduce((maxValue, value) => Math.max(maxValue, Math.abs(value)), 0)
}

export function euclideanDistance(left: readonly number[], right: readonly number[]) {
  return l2NormN(vectorDifference(left, right))
}

export function cosineSimilarityN(left: readonly number[], right: readonly number[]) {
  const denominator = l2NormN(left) * l2NormN(right)
  if (denominator === 0) return 0
  return dotN(left, right) / denominator
}

export function matrixColumns2x2(matrix: Matrix2x2): [Vector2, Vector2] {
  return [
    { x: matrix[0][0], y: matrix[1][0] },
    { x: matrix[0][1], y: matrix[1][1] },
  ]
}

export function rank2x2(matrix: Matrix2x2, epsilon = 1e-8): 0 | 1 | 2 {
  if (Math.abs(determinant2x2(matrix)) > epsilon) return 2
  const hasNonZeroEntry = matrix.some((row) => row.some((value) => Math.abs(value) > epsilon))
  return hasNonZeroEntry ? 1 : 0
}

export function columnSpaceKind2x2(matrix: Matrix2x2, epsilon = 1e-8): ColumnSpaceKind {
  const rank = rank2x2(matrix, epsilon)
  if (rank === 2) return 'plane'
  if (rank === 1) return 'line'
  return 'point'
}

export function nullDirection2x2(matrix: Matrix2x2, epsilon = 1e-8): Vector2 | null {
  const rank = rank2x2(matrix, epsilon)
  if (rank === 2) return null
  if (rank === 0) return { x: 1, y: 0 }

  const firstRowNorm = Math.hypot(matrix[0][0], matrix[0][1])
  const secondRowNorm = Math.hypot(matrix[1][0], matrix[1][1])
  const row = firstRowNorm >= secondRowNorm ? matrix[0] : matrix[1]
  const direction = { x: -row[1], y: row[0] }
  const length = norm(direction)

  if (length <= epsilon) return { x: 1, y: 0 }
  return { x: direction.x / length, y: direction.y / length }
}

export function dot(left: Vector2, right: Vector2) {
  return left.x * right.x + left.y * right.y
}

export function norm(vector: Vector2) {
  return Math.hypot(vector.x, vector.y)
}

export function cosineSimilarity(left: Vector2, right: Vector2) {
  const denominator = norm(left) * norm(right)
  if (denominator === 0) return 0
  return dot(left, right) / denominator
}

export function angleBetween(left: Vector2, right: Vector2) {
  const cosine = Math.min(1, Math.max(-1, cosineSimilarity(left, right)))
  return (Math.acos(cosine) * 180) / Math.PI
}

export function projection(vector: Vector2, onto: Vector2): Vector2 {
  const denominator = dot(onto, onto)
  if (denominator === 0) return { x: 0, y: 0 }
  const scale = dot(vector, onto) / denominator
  return {
    x: onto.x * scale,
    y: onto.y * scale,
  }
}

export function matrixVectorMultiply(matrix: Matrix2x2, vector: Vector2): Vector2 {
  return {
    x: matrix[0][0] * vector.x + matrix[0][1] * vector.y,
    y: matrix[1][0] * vector.x + matrix[1][1] * vector.y,
  }
}

export function determinant2x2(matrix: Matrix2x2) {
  return matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0]
}

export function isInvertible2x2(matrix: Matrix2x2, epsilon = 1e-8) {
  return Math.abs(determinant2x2(matrix)) > epsilon
}

export function gradientDescentStep(params: Vector2, gradient: Vector2, learningRate: number): Vector2 {
  return {
    x: params.x - learningRate * gradient.x,
    y: params.y - learningRate * gradient.y,
  }
}

export function quadraticLoss(point: Vector2) {
  return 0.62 * point.x * point.x + 0.34 * point.y * point.y + 0.18 * point.x * point.y
}

export function quadraticGradient(point: Vector2): Vector2 {
  return {
    x: 1.24 * point.x + 0.18 * point.y,
    y: 0.68 * point.y + 0.18 * point.x,
  }
}

export function round(value: number, digits = 3) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}
