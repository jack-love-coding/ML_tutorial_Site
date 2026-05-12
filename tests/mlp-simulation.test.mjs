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
const {
  createMlpPlaygroundSession,
  generateMlpPlaygroundData,
  DEFAULT_MLP_PLAYGROUND_STATE,
} = await import('../src/simulations/mlpPlayground.ts')

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

test('playground engine generates classification and regression datasets', () => {
  const classification = generateMlpPlaygroundData({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    problemType: 'classification',
    classificationDataset: 'xor',
  })
  const regression = generateMlpPlaygroundData({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    problemType: 'regression',
    regressionDataset: 'gaussian',
  })

  assert.ok(classification.some((point) => point.label === 1))
  assert.ok(classification.some((point) => point.label === -1))
  assert.ok(regression.some((point) => point.label > 0))
  assert.ok(regression.some((point) => point.label < 0))
  assert.ok(classification.some((point) => point.split === 'train'))
  assert.ok(classification.some((point) => point.split === 'test'))
})

test('playground engine trains, exposes node heatmaps, and supports regularization', () => {
  const session = createMlpPlaygroundSession({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    problemType: 'classification',
    classificationDataset: 'circle',
    networkShape: [4, 2],
    featureKeys: ['x1', 'x2', 'x1Squared', 'x2Squared'],
    learningRate: 0.03,
    batchSize: 10,
  })
  const first = session.snapshot()
  const last = session.step(20)

  assert.ok(last.trainLoss < first.trainLoss, 'playground training should reduce train loss')
  assert.equal(last.layers.length, 4, 'input, two hidden layers, and output should be exposed')
  assert.ok(last.layers.flat().every((node) => node.outputGrid.length === last.gridSize * last.gridSize))
  assert.ok(last.links.length > 0)
  assert.ok(last.outputGrid.length === last.gridSize * last.gridSize)

  const regularized = createMlpPlaygroundSession({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    problemType: 'classification',
    regularizationType: 'l2',
    regularizationRate: 0.05,
  }).step(3)
  assert.ok(regularized.regularizationPenalty > 0)
})
