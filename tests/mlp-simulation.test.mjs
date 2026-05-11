import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (
        (specifier.startsWith('.') || specifier.startsWith('/')) &&
        !/\.[cm]?[jt]sx?$/.test(specifier)
      ) {
        return nextResolve(`${specifier}.ts`, context)
      }
      throw error
    }
  },
})

const { simulateMLP } = await import('../src/simulations/mlp.ts')

test('MLP simulation exposes train, validation, hidden, and curve diagnostics', () => {
  const simulation = simulateMLP({
    hiddenUnits: 7,
    activation: 'tanh',
    learningRate: 0.12,
    epochs: 84,
    noise: 0.09,
    datasetKind: 'moons',
    validationSplit: 0.28,
    playbackMs: 120,
  })

  const first = simulation.snapshots[0]
  const last = simulation.snapshots.at(-1)

  assert.ok(last, 'expected final snapshot')
  assert.ok(last.loss < first.loss, 'training loss should decrease')
  assert.ok((last.accuracy ?? 0) >= (first.accuracy ?? 0), 'training accuracy should improve')
  assert.ok((last.validationSamples?.length ?? 0) > 0, 'validation samples should be exposed')
  assert.ok((last.hidden?.length ?? 0) >= (last.dataset?.length ?? 0), 'hidden projection should include train and validation points')
  assert.ok((last.boundaryGrid?.length ?? 0) > 0, 'decision boundary grid should be exposed')
  assert.ok(last.lossCurves?.trainLoss?.length, 'train loss curve should be exposed')
  assert.ok(last.lossCurves?.validationLoss?.length, 'validation loss curve should be exposed')

  for (const key of [
    'trainAccuracy',
    'validationAccuracy',
    'generalizationGap',
    'hiddenSeparation',
    'activationSaturation',
    'weightNorm',
    'gradientNorm',
  ]) {
    assert.equal(typeof last.derivedMetrics?.[key], 'number', `${key} should be numeric`)
  }
})

test('high-capacity noisy MLP exposes a train/validation gap signal', () => {
  const last = simulateMLP({
    hiddenUnits: 12,
    activation: 'tanh',
    learningRate: 0.15,
    epochs: 120,
    noise: 0.22,
    datasetKind: 'circles',
    validationSplit: 0.4,
    playbackMs: 120,
  }).snapshots.at(-1)

  assert.ok(last, 'expected final snapshot')
  assert.ok(
    Number(last.derivedMetrics?.generalizationGap ?? 0) > 0.02,
    'stress preset should expose a positive train/validation gap',
  )
  assert.ok(Number(last.derivedMetrics?.weightNorm ?? 0) > 0)
})
