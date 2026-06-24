import { clamp, dot, norm, round, type Vector2 } from './math.ts'

export interface QuadraticLossCoefficients {
  a: number
  b: number
  c: number
}

export interface PartialDerivativeInput extends Vector2 {
  direction?: Vector2
  coefficients?: QuadraticLossCoefficients
}

export interface QuadraticSliceInput {
  point: Vector2
  axis: 'x' | 'y' | 'direction'
  radius?: number
  samples?: number
  direction?: Vector2
  coefficients?: QuadraticLossCoefficients
}

export const defaultQuadraticLossCoefficients: QuadraticLossCoefficients = {
  a: 0.72,
  b: 0.32,
  c: 0.52,
}

function finiteOr(value: number, fallback = 0) {
  return Number.isFinite(value) ? value : fallback
}

export function sanitizePoint(point: Vector2, limit = 3): Vector2 {
  return {
    x: round(clamp(finiteOr(point.x), -limit, limit), 3),
    y: round(clamp(finiteOr(point.y), -limit, limit), 3),
  }
}

export function normalizeDirection(direction: Vector2): Vector2 {
  const safe = {
    x: finiteOr(direction.x, 1),
    y: finiteOr(direction.y, 0),
  }
  const length = norm(safe)
  if (length === 0) return { x: 1, y: 0 }
  return { x: safe.x / length, y: safe.y / length }
}

export function quadraticLoss2D(point: Vector2, coefficients = defaultQuadraticLossCoefficients) {
  const safePoint = sanitizePoint(point, 10)
  return (
    coefficients.a * safePoint.x ** 2 +
    coefficients.b * safePoint.x * safePoint.y +
    coefficients.c * safePoint.y ** 2
  )
}

export function quadraticGradient2D(point: Vector2, coefficients = defaultQuadraticLossCoefficients): Vector2 {
  const safePoint = sanitizePoint(point, 10)
  return {
    x: 2 * coefficients.a * safePoint.x + coefficients.b * safePoint.y,
    y: coefficients.b * safePoint.x + 2 * coefficients.c * safePoint.y,
  }
}

export function directionalDerivative2D(
  point: Vector2,
  direction: Vector2,
  coefficients = defaultQuadraticLossCoefficients,
) {
  return dot(quadraticGradient2D(point, coefficients), normalizeDirection(direction))
}

export function evaluatePartialDerivativePoint(input: PartialDerivativeInput) {
  const point = sanitizePoint({ x: input.x, y: input.y })
  const direction = normalizeDirection(input.direction ?? { x: 1, y: 0 })
  const gradient = quadraticGradient2D(point, input.coefficients)
  return {
    point,
    loss: quadraticLoss2D(point, input.coefficients),
    partialX: gradient.x,
    partialY: gradient.y,
    gradient,
    gradientNorm: norm(gradient),
    direction,
    directionalDerivative: dot(gradient, direction),
    negativeGradient: { x: -gradient.x, y: -gradient.y },
  }
}

export function sampleQuadraticSlice(input: QuadraticSliceInput) {
  const samples = Math.max(2, Math.floor(finiteOr(input.samples ?? 25, 25)))
  const radius = Math.max(0.1, finiteOr(input.radius ?? 1.4, 1.4))
  const point = sanitizePoint(input.point, 10)
  const direction = normalizeDirection(input.direction ?? { x: 1, y: 0 })

  return Array.from({ length: samples }, (_, index) => {
    const offset = -radius + (index * radius * 2) / (samples - 1)
    const samplePoint =
      input.axis === 'x'
        ? { x: point.x + offset, y: point.y }
        : input.axis === 'y'
          ? { x: point.x, y: point.y + offset }
          : { x: point.x + direction.x * offset, y: point.y + direction.y * offset }

    return {
      x: round(samplePoint.x, 6),
      y: round(samplePoint.y, 6),
      offset: round(offset, 6),
      loss: quadraticLoss2D(samplePoint, input.coefficients),
    }
  })
}
