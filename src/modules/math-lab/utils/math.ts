export interface Vector2 {
  x: number
  y: number
}

export type Matrix2x2 = [[number, number], [number, number]]

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
