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
