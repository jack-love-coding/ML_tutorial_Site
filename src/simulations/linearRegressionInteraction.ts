import type {
  LinearRegressionInteractionAsset,
  LinearRegressionSufficientStatistics,
} from '../types/linearRegressionInteraction.ts'
import { LINEAR_REGRESSION_INTERACTION_CONTRACT } from '../types/linearRegressionInteraction.ts'
import type { LinearRegressionObservationSceneId } from '../types/linearRegressionLesson.ts'
import { withPublicBase } from '../utils/publicPath.ts'

export interface UnivariateFit {
  slope: number
  intercept: number
  mse: number
}

function finite(value: unknown, label: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new TypeError(`${label} must be finite`)
  }
  return value
}

function assertFiniteTree(value: unknown, path = '$'): void {
  if (typeof value === 'number') {
    finite(value, path)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => assertFiniteTree(entry, `${path}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => assertFiniteTree(entry, `${path}.${key}`))
  }
}

export function clampFinite(
  value: unknown,
  minimum: number,
  maximum: number,
  fallback: number,
): number {
  const numeric = Number(value)
  if (!Number.isFinite(numeric)) return fallback
  return Math.min(maximum, Math.max(minimum, numeric))
}

export function fitUnivariateFromStatistics(
  statistics: LinearRegressionSufficientStatistics,
  teachingPoint?: { x: number; y: number },
): UnivariateFit {
  const x = teachingPoint ? finite(teachingPoint.x, 'teaching point x') : 0
  const y = teachingPoint ? finite(teachingPoint.y, 'teaching point y') : 0
  const n = statistics.n + (teachingPoint ? 1 : 0)
  const sumX = statistics.sumX + (teachingPoint ? x : 0)
  const sumY = statistics.sumY + (teachingPoint ? y : 0)
  const sumXX = statistics.sumXX + (teachingPoint ? x * x : 0)
  const sumXY = statistics.sumXY + (teachingPoint ? x * y : 0)
  const sumYY = statistics.sumYY + (teachingPoint ? y * y : 0)
  const denominator = n * sumXX - sumX * sumX
  if (!Number.isFinite(denominator) || Math.abs(denominator) < 1e-12) {
    throw new RangeError('univariate fit is singular')
  }
  const slope = (n * sumXY - sumX * sumY) / denominator
  const intercept = (sumY - slope * sumX) / n
  const squaredError =
    sumYY
    + n * intercept * intercept
    + slope * slope * sumXX
    + 2 * intercept * slope * sumX
    - 2 * intercept * sumY
    - 2 * slope * sumXY
  const mse = Math.max(0, squaredError / n)
  assertFiniteTree({ slope, intercept, mse })
  return Object.freeze({ slope, intercept, mse })
}

export function parseLinearRegressionInteractionAsset(
  value: unknown,
  expectedSceneId: LinearRegressionObservationSceneId,
): LinearRegressionInteractionAsset {
  if (!value || typeof value !== 'object') throw new TypeError('interaction asset must be an object')
  const candidate = value as LinearRegressionInteractionAsset
  if (candidate.contractVersion !== LINEAR_REGRESSION_INTERACTION_CONTRACT) {
    throw new TypeError('interaction asset contract version mismatch')
  }
  if (candidate.sceneId !== expectedSceneId) {
    throw new TypeError(`interaction asset scene mismatch: expected ${expectedSceneId}`)
  }
  if (typeof candidate.sourceCellId !== 'string' || !candidate.sourceCellId) {
    throw new TypeError('interaction asset source cell is missing')
  }
  assertFiniteTree(candidate)
  return candidate
}

export async function loadLinearRegressionInteractionAsset(
  sceneId: LinearRegressionObservationSceneId,
  signal?: AbortSignal,
): Promise<LinearRegressionInteractionAsset> {
  const response = await fetch(
    withPublicBase(`/linear-regression/phase-27a/interactions/${sceneId}.json`),
    { signal, headers: { Accept: 'application/json' } },
  )
  if (!response.ok) throw new Error(`interaction asset request failed: ${response.status}`)
  return parseLinearRegressionInteractionAsset(await response.json(), sceneId)
}
