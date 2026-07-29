import test from 'node:test'
import assert from 'node:assert/strict'
import { simulateLinearRegression } from '../src/simulations/linearRegression.ts'

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
  assert.ok(result.snapshots.length > 0)
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

    assert.ok(result.snapshots.length > 0, `${scenario} should retain a snapshot adapter`)
  })
})

test('Task 27-01-03 RED: primary facade snapshots use only the locked Bike case', () => {
  const snapshot = simulateLinearRegression({
    scenario: 'linear',
    learningRate: 0.1,
    epochs: 5_000,
  }).snapshots.at(-1)

  assert.ok(snapshot)
  assert.equal(snapshot.regressionMeta?.sourceName, 'UCI Bike Sharing Dataset')
  assert.equal(snapshot.regressionMeta?.datasetSize, 17_379)
  assert.equal(snapshot.regressionMeta?.featureCount, 5)
  assert.equal(snapshot.regressionMeta?.targetName, 'cnt')
  assert.doesNotMatch(JSON.stringify(snapshot), /california|MedInc|MedHouseVal/i)
  assert.deepEqual(snapshot.derivedMetrics?.weights, [
    62.723890953,
    -37.1164156021,
    0.8094458662,
    2.3797186778,
    47.9014338433,
  ])
  assert.equal(snapshot.derivedMetrics?.intercept, 173.0103284947)
  assert.equal(snapshot.derivedMetrics?.updates, 772)
  assert.equal(snapshot.derivedMetrics?.gradientNorm, 9.96e-9)
})

test('Task 27-01-03 RED: optimizer completion precedes Bike diagnostic interpretation', () => {
  const snapshots = simulateLinearRegression({
    scenario: 'overfit',
    learningRate: 0.1,
    epochs: 5_000,
  }).snapshots
  const stages = snapshots.map((snapshot) => String(snapshot.derivedMetrics?.diagnosticStage ?? ''))

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
  assert.equal(optimization.derivedMetrics?.updates, 772)
  assert.equal(optimization.derivedMetrics?.gradientNorm, 9.96e-9)
  assert.ok(Number(optimization.derivedMetrics?.gdMaxCoefficientDelta) <= 1e-6)
  assert.ok(Number(optimization.derivedMetrics?.normalEquationMaxCoefficientDelta) <= 1e-6)
  assert.ok(Number(optimization.derivedMetrics?.sklearnMaxCoefficientDelta) <= 1e-6)

  const hourly = snapshots[1]!
  assert.deepEqual(hourly.derivedMetrics?.hourlyResiduals, [
    { hour: 8, meanResidual: -367.4 },
    { hour: 17, meanResidual: -366.6 },
    { hour: 23, meanResidual: 118.1 },
  ])

  const spread = snapshots[2]!
  assert.deepEqual(spread.derivedMetrics?.predictionBinSpread, [
    { bin: 1, residualStdDev: 136, mae: 78.4 },
    { bin: 4, residualStdDev: 209.2, mae: 181.7 },
  ])

  const stability = snapshots[3]!
  assert.deepEqual(stability.derivedMetrics?.atempComparison, {
    baseTemp: 62.723890953,
    atempOlsTemp: 14.34,
    atempOlsAtemp: 48.8,
    baseTestMse: 40142.538619,
    atempTestMse: 40092.5,
    ridgeObjective: 'mse-plus-l2',
    lassoObjective: 'mse-plus-l1',
  })

  const named = snapshots[4]!
  assert.deepEqual(named.derivedMetrics?.namedCaseInstants, [17_213, 15_628, 14_965, 15_604])

  const log1p = snapshots[5]!
  assert.deepEqual(log1p.derivedMetrics?.targetScaleLabels, {
    raw: 'rental-count',
    transformed: 'log1p-rental-count',
  })
})
