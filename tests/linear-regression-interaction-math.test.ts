import test from 'node:test'
import assert from 'node:assert/strict'
import {
  clampFinite,
  fitUnivariateFromStatistics,
  parseLinearRegressionInteractionAsset,
} from '../src/simulations/linearRegressionInteraction.ts'
import { LINEAR_REGRESSION_INTERACTION_CONTRACT } from '../src/types/linearRegressionInteraction.ts'

function statistics(points: Array<{ x: number; y: number }>) {
  return points.reduce(
    (result, point) => ({
      n: result.n + 1,
      sumX: result.sumX + point.x,
      sumY: result.sumY + point.y,
      sumXX: result.sumXX + point.x ** 2,
      sumXY: result.sumXY + point.x * point.y,
      sumYY: result.sumYY + point.y ** 2,
    }),
    { n: 0, sumX: 0, sumY: 0, sumXX: 0, sumXY: 0, sumYY: 0 },
  )
}

test('sufficient-statistic OLS matches an exact line and a direct added-point fit', () => {
  const source = [{ x: 0, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 5 }]
  const baseline = fitUnivariateFromStatistics(statistics(source))
  assert.ok(Math.abs(baseline.slope - 2) < 1e-12)
  assert.ok(Math.abs(baseline.intercept - 1) < 1e-12)
  assert.ok(baseline.mse < 1e-12)

  const teachingPoint = { x: 3, y: 20 }
  const fromStatistics = fitUnivariateFromStatistics(statistics(source), teachingPoint)
  const fromDirectRows = fitUnivariateFromStatistics(statistics([...source, teachingPoint]))
  assert.ok(Math.abs(fromStatistics.slope - fromDirectRows.slope) < 1e-12)
  assert.ok(Math.abs(fromStatistics.intercept - fromDirectRows.intercept) < 1e-12)
  assert.ok(Math.abs(fromStatistics.mse - fromDirectRows.mse) < 1e-12)
})

test('interactive numeric controls clamp invalid and out-of-range input', () => {
  assert.equal(clampFinite(Number.NaN, 0, 1, 0.5), 0.5)
  assert.equal(clampFinite(Infinity, 0, 1, 0.5), 0.5)
  assert.equal(clampFinite(-2, 0, 1, 0.5), 0)
  assert.equal(clampFinite(4, 0, 1, 0.5), 1)
})

test('interaction parser rejects scene drift and non-finite published data', () => {
  const valid = {
    contractVersion: LINEAR_REGRESSION_INTERACTION_CONTRACT,
    sceneId: 'fit-line',
    sourceCellId: 'phase27b-fit-line-interaction',
    points: [{ x: 0.2, y: 32 }],
    domain: { x: [0, 1], y: [0, 900] },
    baseline: { slope: 2, intercept: 1 },
  }
  assert.equal(parseLinearRegressionInteractionAsset(valid, 'fit-line').sceneId, 'fit-line')
  assert.throws(() => parseLinearRegressionInteractionAsset(valid, 'multivariate'), /scene mismatch/)
  assert.throws(
    () => parseLinearRegressionInteractionAsset(
      { ...valid, baseline: { slope: Number.NaN, intercept: 1 } },
      'fit-line',
    ),
    /must be finite/,
  )
})
