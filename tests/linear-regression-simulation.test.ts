import test from 'node:test'
import assert from 'node:assert/strict'
import { simulateLinearRegression } from '../src/simulations/linearRegression.ts'
import { LINEAR_REGRESSION_PUBLISHED_BASELINE } from '../src/simulations/linearRegressionWorkbench.ts'

const PRESERVED_SCENARIOS = Object.freeze([
  'linear',
  'curved',
  'multivariate',
  'polynomial',
  'overfit',
  'regularized',
] as const)

test('facade preservation keeps the existing simulation import and readonly snapshot contract', () => {
  assert.equal(typeof simulateLinearRegression, 'function')

  const result = simulateLinearRegression({
    scenario: 'linear',
    learningRate: 0.1,
    epochs: 4,
  })

  assert.ok(Array.isArray(result.snapshots))
  assert.equal(result.snapshots.length, 7)
  result.snapshots.forEach((snapshot) => {
    assert.equal(typeof snapshot.step, 'number')
    assert.equal(typeof snapshot.loss, 'number')
  })
})

test('facade preservation keeps all six public scenario IDs callable', () => {
  PRESERVED_SCENARIOS.forEach((scenario) => {
    const result = simulateLinearRegression({
      scenario,
      learningRate: 0.1,
      epochs: 4,
      polynomialDegree: 3,
    })

    assert.equal(result.snapshots.length, 7, `${scenario} should retain seven stages`)
  })
})

test('primary facade snapshots use exact full-precision published Bike values', () => {
  const snapshots = simulateLinearRegression({
    scenario: 'linear',
    learningRate: 0.1,
    epochs: 5_000,
  }).snapshots
  const snapshot = snapshots.at(-1)
  const baseline = LINEAR_REGRESSION_PUBLISHED_BASELINE
  const reference = baseline.methods.find(
    ({ method }) => method === 'numpy-lstsq',
  )!
  const gradientDescent = baseline.methods.find(
    ({ method }) => method === 'numpy-batch-gradient-descent',
  )!

  assert.ok(snapshot)
  assert.equal(snapshot.regressionMeta?.sourceName, 'UCI Bike Sharing Dataset')
  assert.equal(snapshot.regressionMeta?.datasetSize, 17_379)
  assert.equal(snapshot.regressionMeta?.featureCount, 5)
  assert.equal(snapshot.regressionMeta?.targetName, 'cnt')
  assert.doesNotMatch(JSON.stringify(snapshot), /california|MedInc|MedHouseVal/i)
  assert.deepEqual(snapshot.derivedMetrics?.weights, reference.weights)
  assert.equal(snapshot.derivedMetrics?.intercept, reference.intercept)
  assert.equal(snapshot.derivedMetrics?.mse, baseline.metrics.test.mse)
  assert.equal(snapshot.derivedMetrics?.mae, baseline.metrics.test.mae)
  assert.equal(snapshot.derivedMetrics?.r2, baseline.metrics.test.r2)
  assert.equal(snapshot.derivedMetrics?.updates, gradientDescent.updates)
  assert.equal(
    snapshot.derivedMetrics?.gradientNorm,
    gradientDescent.gradientNorm,
  )

  snapshots.forEach((entry, index) => {
    const display = baseline.displayRows[index % baseline.displayRows.length]!
    assert.deepEqual(entry.selectedObservation, {
      instant: display.instant,
      area: display.hour,
      age: display.rawFeatures.hum,
      actualPrice: display.actual,
      predictedPrice: display.prediction,
      residual: display.residual,
    })
    assert.deepEqual(
      entry.regressionSamples,
      baseline.displayRows.map((row) => ({
        x: row.hour,
        y: row.actual,
        split: row.partition === 'train' ? 'train' : 'validation',
      })),
    )
    assert.deepEqual(
      entry.fitCurve,
      baseline.displayRows.map((row) => ({
        x: row.hour,
        y: row.prediction,
      })),
    )
  })
})

test('optimizer completion precedes exact package-backed Bike diagnostic interpretation', () => {
  const snapshots = simulateLinearRegression({
    scenario: 'overfit',
    learningRate: 0.1,
    epochs: 5_000,
  }).snapshots
  const baseline = LINEAR_REGRESSION_PUBLISHED_BASELINE
  const gradientDescent = baseline.methods[0]!
  const stages = snapshots.map((snapshot) =>
    String(snapshot.derivedMetrics?.diagnosticStage ?? ''))

  assert.deepEqual(stages, [
    'optimization-complete',
    'hourly-residual-shape',
    'prediction-bin-spread',
    'coefficient-stability',
    'named-heldout-cases',
    'log1p-comparison',
    'combined-review',
  ])

  const optimization = snapshots[0]!
  assert.equal(optimization.derivedMetrics?.updates, gradientDescent.updates)
  assert.equal(
    optimization.derivedMetrics?.gradientNorm,
    gradientDescent.gradientNorm,
  )
  assert.equal(
    optimization.derivedMetrics?.gdMaxCoefficientDelta,
    gradientDescent.maxCoefficientDelta,
  )
  assert.equal(
    optimization.derivedMetrics?.normalEquationMaxCoefficientDelta,
    baseline.methods[1]!.maxCoefficientDelta,
  )
  assert.equal(
    optimization.derivedMetrics?.sklearnMaxCoefficientDelta,
    baseline.methods[2]!.maxCoefficientDelta,
  )

  const hourly = snapshots[1]!
  assert.deepEqual(
    hourly.derivedMetrics?.hourlyResidualHours,
    baseline.diagnostics.hourlyResiduals.map(({ hour }) => hour),
  )
  assert.deepEqual(
    hourly.derivedMetrics?.hourlyResidualMeans,
    baseline.diagnostics.hourlyResiduals.map(({ meanResidual }) => meanResidual),
  )

  const spread = snapshots[2]!
  assert.deepEqual(
    spread.derivedMetrics?.predictionBinIds,
    baseline.diagnostics.predictionBins.map(({ bin }) => bin),
  )
  assert.deepEqual(
    spread.derivedMetrics?.predictionBinResidualStdDev,
    baseline.diagnostics.predictionBins.map(
      ({ residualStdDev }) => residualStdDev,
    ),
  )
  assert.deepEqual(
    spread.derivedMetrics?.predictionBinMae,
    baseline.diagnostics.predictionBins.map(({ mae }) => mae),
  )

  const stability = snapshots[3]!
  const atemp = baseline.diagnostics.atempComparison
  assert.equal(
    stability.derivedMetrics?.baseTempCoefficient,
    atemp.withoutAtemp.tempCoefficient,
  )
  assert.equal(
    stability.derivedMetrics?.atempOlsTempCoefficient,
    atemp.withAtemp.tempCoefficient,
  )
  assert.equal(
    stability.derivedMetrics?.atempOlsAtempCoefficient,
    atemp.withAtemp.atempCoefficient,
  )
  assert.equal(
    stability.derivedMetrics?.baseTestMse,
    atemp.withoutAtemp.testMetrics.mse,
  )
  assert.equal(
    stability.derivedMetrics?.atempTestMse,
    (atemp.withAtemp.testMetrics as { mse: number }).mse,
  )
  assert.equal(stability.derivedMetrics?.ridgeObjective, 'mse-plus-l2')
  assert.equal(stability.derivedMetrics?.lassoObjective, 'mse-plus-l1')

  const named = snapshots[4]!
  assert.deepEqual(
    named.derivedMetrics?.namedCaseInstants,
    baseline.diagnostics.namedCases.map(({ row }) => row.instant),
  )

  const log1p = snapshots[5]!
  assert.equal(log1p.derivedMetrics?.rawTargetScale, 'rental-count')
  assert.equal(log1p.derivedMetrics?.transformedTargetScale, 'log1p-rental-count')
  assert.equal(log1p.derivedMetrics?.inverseTransformRequired, true)
})
