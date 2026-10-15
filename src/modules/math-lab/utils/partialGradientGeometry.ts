import { defaultQuadraticLossCoefficients } from './calculus.ts'
import type { Vector2 } from './math.ts'

export const partialGradientStart = { point: { x: 1.4, y: -1.1 }, directionAngle: 35 }
// Equal units on both axes preserve angles. The controls stay inside [-3, 3],
// leaving room for the normalized arrows without clamping their endpoints.
export const partialGradientViewport = { width: 360, height: 360, xMin: -4, xMax: 4, yMin: -4, yMax: 4 }
export const partialGradientLevels = [0.45, 0.9, 1.4, 2.1, 3, 4.2, 5.7, 7.4]

/** Exact level sets of the same positive-definite quadratic used by the lab. */
export function quadraticContourPoints(level: number, segments = 240): Vector2[] {
  if (!Number.isFinite(level) || level <= 0) return []
  const count = Math.max(12, Math.min(720, Math.floor(Number.isFinite(segments) ? segments : 240)))
  const { a, b, c } = defaultQuadraticLossCoefficients
  return Array.from({ length: count + 1 }, (_, index) => {
    const angle = index * 2 * Math.PI / count
    const x = Math.cos(angle), y = Math.sin(angle)
    const radius = Math.sqrt(level / (a * x * x + b * x * y + c * y * y))
    return { x: radius * x, y: radius * y }
  })
}

export function projectPartialPoint(point: Vector2) {
  const { width, height, xMin, xMax, yMin, yMax } = partialGradientViewport
  return { x: (point.x - xMin) * width / (xMax - xMin), y: (yMax - point.y) * height / (yMax - yMin) }
}

export function partialContourPath(level: number) {
  return quadraticContourPoints(level).map((point, index) => {
    const { x, y } = projectPartialPoint(point)
    return `${index ? 'L' : 'M'}${x.toFixed(3)},${y.toFixed(3)}`
  }).join(' ') + (level > 0 && Number.isFinite(level) ? ' Z' : '')
}

export function partialVectorEnd(point: Vector2, vector: Vector2, length = 0.72): Vector2 {
  const norm = Math.hypot(vector.x, vector.y)
  if (!Number.isFinite(norm) || norm === 0) return { ...point }
  return { x: point.x + vector.x / norm * length, y: point.y + vector.y / norm * length }
}
