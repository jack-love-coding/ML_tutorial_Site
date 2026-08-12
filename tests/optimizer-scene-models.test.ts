import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import {
  adamDecayModel,
  batchNoiseModel,
  momentumRmspropModel,
  scheduleModel,
  trainingLedgerExample,
  trainingLedgerModel,
} from '../src/modules/optimizer-comparison/labs/sceneModels.ts'
import { algorithmCheckpointsBySlug } from '../src/data/algorithmCheckpoints.ts'
import { resolveCheckpointRevisitRoute } from '../src/utils/checkpointRoutes.ts'

test('six optimizer learning surfaces derive distinct numerical models rather than a shared decorative trace', () => {
  const ledger = trainingLedgerModel(4)
  assert.deepEqual(ledger.operations.map((entry) => entry.operation), ['forward', 'loss', 'zero_grad', 'backward', 'optimizer.step'])
  const prediction = trainingLedgerExample.parameters.reduce((sum, parameter, index) => sum + parameter * trainingLedgerExample.features[index]!, 0)
  const error = prediction - trainingLedgerExample.label
  const gradient = trainingLedgerExample.features.map((feature) => error * feature)
  assert.equal(ledger.example.prediction, prediction)
  assert.equal(ledger.example.loss, Number((0.5 * error ** 2).toFixed(6)))
  assert.deepEqual(ledger.example.gradient, gradient.map((value) => Number(value.toFixed(6))))
  assert.deepEqual(ledger.trace.gradients, gradient)
  assert.deepEqual(ledger.trace.parametersAfter, trainingLedgerExample.parameters.map((parameter, index) => parameter - trainingLedgerExample.learningRate * gradient[index]!))

  const full = batchNoiseModel(960, 2)
  const mini = batchNoiseModel(64, 2)
  const stochastic = batchNoiseModel(1, 2)
  assert.notDeepEqual(full.gradient, mini.gradient)
  assert.notDeepEqual(mini.gradient, stochastic.gradient)
  assert.equal(stochastic.indices.length, 1)
  assert.equal(full.indices.length, 960)

  const state = momentumRmspropModel(3)
  assert.equal(state.momentum.state.kind, 'momentum')
  assert.equal(state.rmsprop.state.kind, 'rmsprop')
  assert.notDeepEqual(state.momentum.state.kind === 'momentum' ? state.momentum.state.velocity : [], state.rmsprop.state.kind === 'rmsprop' ? state.rmsprop.state.squareAverage : [])
  assert.ok(state.effectiveStep.every(Number.isFinite))

  const decay = adamDecayModel(3)
  assert.equal(decay.adam.t, 3)
  assert.notDeepEqual(decay.adam.trace.parametersAfter, decay.l2.trace.parametersAfter)
  assert.notDeepEqual(decay.l2.trace.parametersAfter, decay.adamw.trace.parametersAfter)

  const constant = scheduleModel('constant', 5)
  const step = scheduleModel('step', 5)
  const cosine = scheduleModel('warmup-cosine', 5)
  assert.equal(constant.transitions[5]?.learningRate, 0.08)
  assert.equal(step.transitions[5]?.learningRate, 0.04)
  assert.notEqual(cosine.transitions[5]?.learningRate, constant.transitions[5]?.learningRate)
  assert.equal(cosine.schedulerOrder, 'optimizer.step() → scheduler.step()')
})

test('frozen Banknote artifact exposes actual validation and exactly-one final test metrics bound by the manifest', () => {
  const root = resolve(import.meta.dirname, '..')
  const artifact = JSON.parse(readFileSync(resolve(root, 'public/datasets/optimizer-comparison/banknote-transfer.json'), 'utf8'))
  const manifest = JSON.parse(readFileSync(resolve(root, 'public/datasets/optimizer-comparison/benchmark-manifest.json'), 'utf8'))
  assert.deepEqual(artifact.splitCounts, { train: 960, validation: 206, test: 206 })
  assert.equal(artifact.preprocessing.fitSplit, 'train')
  assert.equal(artifact.training.updates, 240)
  assert.equal(artifact.validationEvaluation.metrics.examples, 206)
  assert.equal(artifact.finalTestEvaluation.metrics.examples, 206)
  assert.equal(artifact.finalTestEvaluation.evaluationCount, 1)
  assert.equal(artifact.finalTestEvaluation.selectionUsedTest, false)
  assert.equal(manifest.dataset.banknote.evaluationArtifact, '/datasets/optimizer-comparison/banknote-transfer.json')
  assert.equal(manifest.dataset.banknote.finalTestEvaluationCount, 1)
  assert.ok(manifest.files['/datasets/optimizer-comparison/banknote-transfer.json'].sha256)
})

test('both final checkpoint feedback links resolve real optimizer chapter routes instead of hash anchors', () => {
  const checkpoints = algorithmCheckpointsBySlug['optimizer-comparison']
  assert.deepEqual(checkpoints.map((item) => item.revisitChapterId), ['training-loop', 'learning-rate-schedules'])
  for (const checkpoint of checkpoints) {
    assert.equal(
      resolveCheckpointRevisitRoute('optimizer-comparison', '/learn/optimizer-comparison', checkpoint, '/learn/optimizer-comparison'),
      `/learn/optimizer-comparison/${checkpoint.revisitChapterId}`,
    )
  }
})
