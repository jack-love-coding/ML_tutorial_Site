import test from 'node:test'
import assert from 'node:assert/strict'
import { simulateLinearRegression } from '../src/simulations/linearRegression.ts'

test('linear regression simulation reduces loss and updates parameters under the default config', () => {
  const simulation = simulateLinearRegression({
    learningRate: 0.1,
    epochs: 36,
    playbackMs: 120,
    datasetNoise: 0.1,
    outlierStrength: 48,
    includeOutlier: true,
    scenario: 'linear',
  })

  assert.ok(simulation.snapshots.length > 10, 'expected multiple training snapshots')

  const first = simulation.snapshots[0]
  const last = simulation.snapshots.at(-1)

  assert.ok(last, 'expected a final snapshot')
  assert.ok(last.loss < first.loss, 'loss should decrease across training')
  assert.notDeepEqual(last.regressionFit, first.regressionFit, 'fit parameters should update')
  assert.ok(Number(last.derivedMetrics?.mse ?? 0) < Number(first.derivedMetrics?.mse ?? 0))
})

test('advanced linear regression scenarios expose the intended teaching signals', () => {
  const multivariate = simulateLinearRegression({
    scenario: 'multivariate',
    learningRate: 0.08,
    epochs: 42,
    featureNoise: 0.1,
  })
  const firstMulti = multivariate.snapshots[0]
  const lastMulti = multivariate.snapshots.at(-1)

  assert.ok(lastMulti, 'expected multivariate final snapshot')
  assert.ok(lastMulti.loss < firstMulti.loss, 'multivariate plane should reduce loss')
  assert.ok(Array.isArray(lastMulti.derivedMetrics?.weights), 'multivariate snapshot should expose weights')
  assert.ok(Number(lastMulti.derivedMetrics?.modelComplexity ?? 0) >= 2)

  const lowDegree = simulateLinearRegression({
    scenario: 'polynomial',
    polynomialDegree: 2,
    learningRate: 0.07,
    epochs: 44,
  }).snapshots.at(-1)
  const highDegree = simulateLinearRegression({
    scenario: 'polynomial',
    polynomialDegree: 5,
    learningRate: 0.07,
    epochs: 44,
  }).snapshots.at(-1)

  assert.ok(lowDegree?.fitCurve?.length, 'polynomial snapshots should expose a fit curve')
  assert.ok(highDegree?.fitCurve?.length, 'high-degree polynomial snapshots should expose a fit curve')
  assert.notDeepEqual(
    highDegree?.fitCurve?.map((point) => point.y.toFixed(2)),
    lowDegree?.fitCurve?.map((point) => point.y.toFixed(2)),
    'different polynomial degrees should produce visibly different curves',
  )

  const overfit = simulateLinearRegression({
    scenario: 'overfit',
    polynomialDegree: 6,
    learningRate: 0.06,
    epochs: 70,
    validationSplit: 0.35,
  }).snapshots.at(-1)

  assert.ok(overfit, 'expected overfit final snapshot')
  assert.ok(Number(overfit.derivedMetrics?.trainMse ?? 0) < Number(overfit.derivedMetrics?.validationMse ?? 0))

  const unregularized = simulateLinearRegression({
    scenario: 'regularized',
    polynomialDegree: 6,
    regularizationType: 'none',
    lambda: 0,
    learningRate: 0.055,
    epochs: 70,
  }).snapshots.at(-1)
  const ridge = simulateLinearRegression({
    scenario: 'regularized',
    polynomialDegree: 6,
    regularizationType: 'l2',
    lambda: 0.35,
    learningRate: 0.055,
    epochs: 70,
  }).snapshots.at(-1)
  const lasso = simulateLinearRegression({
    scenario: 'regularized',
    polynomialDegree: 6,
    regularizationType: 'l1',
    lambda: 0.35,
    learningRate: 0.055,
    epochs: 70,
  }).snapshots.at(-1)

  assert.ok(unregularized && ridge && lasso, 'expected regularization snapshots')
  assert.ok(Number(ridge.derivedMetrics?.weightNorm ?? 0) < Number(unregularized.derivedMetrics?.weightNorm ?? 0))
  assert.ok(Number(lasso.derivedMetrics?.activeWeights ?? 0) <= Number(unregularized.derivedMetrics?.activeWeights ?? 0))
})

test('linear regression lessons use richer housing datasets for visual teaching', () => {
  const simple = simulateLinearRegression({
    scenario: 'linear',
    datasetNoise: 0.12,
  }).snapshots[0]
  const multivariate = simulateLinearRegression({
    scenario: 'multivariate',
    featureNoise: 0.12,
  }).snapshots[0]
  const polynomial = simulateLinearRegression({
    scenario: 'polynomial',
    polynomialDegree: 3,
    datasetNoise: 0.14,
  }).snapshots[0]

  assert.ok(
    (simple.regressionSamples?.length ?? 0) >= 14,
    'single-feature housing data should have enough points to avoid toy-looking fits',
  )
  assert.ok(
    (multivariate.multivariateSamples?.length ?? 0) >= 16,
    'multivariate plane should be supported by a richer point cloud',
  )
  assert.ok(
    (polynomial.regressionSamples?.length ?? 0) >= 18,
    'polynomial and overfitting views need enough train/validation samples',
  )
})

test('multivariate 3D lesson exposes uneven point clouds and residual segments', () => {
  const snapshot = simulateLinearRegression({
    scenario: 'multivariate',
    featureNoise: 0.18,
    epochs: 8,
  }).snapshots.at(-1)

  assert.ok(snapshot, 'expected a multivariate snapshot')
  assert.ok(
    (snapshot.multivariateResiduals?.length ?? 0) === (snapshot.multivariateSamples?.length ?? -1),
    'every 3D point should have a residual segment to the current plane',
  )

  const areas = (snapshot.multivariateSamples ?? [])
    .map((sample) => sample.area)
    .sort((left, right) => left - right)
  const gaps = areas.slice(1).map((area, index) => area - areas[index]!)
  const maxGap = Math.max(...gaps)
  const minGap = Math.min(...gaps)

  assert.ok(maxGap >= minGap * 2.5, 'area distribution should contain visible clusters and gaps')
  assert.ok(
    (snapshot.multivariateResiduals ?? []).some((segment) => Math.abs(segment.residual) > 5),
    'residual visualization should include visible non-zero errors during training',
  )
})
