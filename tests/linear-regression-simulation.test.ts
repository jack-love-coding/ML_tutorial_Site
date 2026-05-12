import test from 'node:test'
import assert from 'node:assert/strict'
import { simulateLinearRegression } from '../src/simulations/linearRegression.ts'

function sortedGaps(values: number[]) {
  const sorted = [...values].sort((left, right) => left - right)
  return sorted.slice(1).map((value, index) => value - sorted[index]!)
}

function assertClusteredDistribution(values: number[], message: string) {
  const gaps = sortedGaps(values)
  const tightGaps = gaps.filter((gap) => gap <= 8).length
  const wideGaps = gaps.filter((gap) => gap >= 22).length

  assert.ok(tightGaps >= 4, `${message}: expected several close samples inside local clusters`)
  assert.ok(wideGaps >= 2, `${message}: expected visible gaps between market segments`)
}

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

test('california housing overfit view exposes real-data diagnostics', () => {
  const snapshot = simulateLinearRegression({
    scenario: 'overfit',
    polynomialDegree: 7,
    epochs: 70,
  }).snapshots.at(-1)

  assert.ok(snapshot, 'expected a final overfit snapshot')
  assert.equal(snapshot.regressionMeta?.sourceName, 'scikit-learn California Housing')
  assert.equal(snapshot.regressionMeta?.datasetSize, 20640)
  assert.equal(snapshot.regressionMeta?.featureCount, 8)
  assert.equal(snapshot.regressionMeta?.featureName, 'MedInc')
  assert.equal(snapshot.regressionMeta?.targetName, 'MedHouseVal')

  const samples = snapshot.regressionSamples ?? []
  const trainCount = samples.filter((sample) => sample.split === 'train').length
  const validationCount = samples.filter((sample) => sample.split === 'validation').length
  assert.equal(samples.length, 27)
  assert.equal(trainCount, 18)
  assert.equal(validationCount, 9)

  const diagnostics = snapshot.fitDiagnostics?.items ?? []
  assert.equal(diagnostics.length, 3)
  const underfit = diagnostics.find((item) => item.id === 'underfit')
  const balanced = diagnostics.find((item) => item.id === 'balanced')
  const overfit = diagnostics.find((item) => item.id === 'overfit')

  assert.ok(underfit && balanced && overfit, 'expected underfit, balanced, and overfit diagnostics')
  assert.equal(underfit.degree, 1)
  assert.equal(balanced.degree, 3)
  assert.equal(overfit.degree, 7)
  assert.ok(underfit.validationMse > balanced.validationMse, 'degree 1 should underfit validation data')
  assert.ok(overfit.trainMse < balanced.trainMse, 'degree 7 should reduce training error')
  assert.ok(overfit.validationMse > balanced.validationMse, 'degree 7 should hurt validation error')
  assert.ok(overfit.weightNorm > balanced.weightNorm, 'overfit model should use larger weights')
  assert.ok(overfit.curve.length >= 64, 'diagnostic curves should be renderable')
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

  assertClusteredDistribution(
    simple.regressionSamples?.map((sample) => sample.x) ?? [],
    'single-feature housing data',
  )
  assertClusteredDistribution(
    polynomial.regressionSamples?.map((sample) => sample.x) ?? [],
    'polynomial housing data',
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
