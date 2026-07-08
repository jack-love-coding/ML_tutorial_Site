import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import {
  cnnShapeParameterScenarios,
  evaluateCnnShapeParameterChallenge,
  type CnnShapeParameterChallengeInput,
} from '../src/simulations/cnnShapeParameterChallenge.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('cnn shape parameter challenge computes same-padding RGB scenario', () => {
  const snapshot = evaluateCnnShapeParameterChallenge({
    scenarioId: 'same-padding-rgb',
    prediction: {
      outputHeight: 32,
      outputWidth: 32,
      outputChannels: 16,
      convParameterCount: 448,
      comparison: 'conv-fewer',
    },
  })

  assert.equal(snapshot.expected.outputHeight, 32)
  assert.equal(snapshot.expected.outputWidth, 32)
  assert.equal(snapshot.expected.outputChannels, 16)
  assert.equal(snapshot.expected.convParameterCount, 448)
  assert.equal(snapshot.expected.denseParameterCount, 50348032)
  assert.equal(snapshot.expected.denseToConvRatio, 112384)
  assert.equal(snapshot.result.allCorrect, true)
})

test('cnn shape parameter challenge covers valid and stride scenarios', () => {
  const valid = evaluateCnnShapeParameterChallenge({
    scenarioId: 'valid-grayscale',
    prediction: {
      outputHeight: 24,
      outputWidth: 24,
      outputChannels: 8,
      convParameterCount: 208,
      comparison: 'conv-fewer',
    },
  })
  const stride = evaluateCnnShapeParameterChallenge({
    scenarioId: 'stride-downsample',
    prediction: {
      outputHeight: 32,
      outputWidth: 32,
      outputChannels: 32,
      convParameterCount: 896,
      comparison: 'conv-fewer',
    },
  })

  assert.equal(valid.expected.denseParameterCount, 3617280)
  assert.equal(valid.result.allCorrect, true)
  assert.equal(stride.expected.denseParameterCount, 402685952)
  assert.equal(stride.result.allCorrect, true)
})

test('cnn shape parameter challenge normalizes invalid learner predictions', () => {
  const input: CnnShapeParameterChallengeInput = {
    scenarioId: 'missing-id',
    prediction: {
      outputHeight: Number.NaN,
      outputWidth: Number.POSITIVE_INFINITY,
      outputChannels: -2,
      convParameterCount: 447.8,
      comparison: 'dense-fewer',
    },
  }
  const snapshot = evaluateCnnShapeParameterChallenge(input)

  assert.equal(snapshot.scenario.id, cnnShapeParameterScenarios[0].id)
  assert.equal(snapshot.result.outputShapeCorrect, false)
  assert.equal(snapshot.result.outputChannelsCorrect, false)
  assert.equal(snapshot.result.convParameterCountCorrect, true)
  assert.equal(snapshot.result.comparisonCorrect, false)
})

test('cnn shape parameter challenge component renders prediction and evidence controls', () => {
  assert.ok(existsSync(new URL('src/components/CnnShapeParameterChallengeLab.vue', root)))
  const source = read('src/components/CnnShapeParameterChallengeLab.vue')

  assert.match(source, /evaluateCnnShapeParameterChallenge/)
  assert.match(source, /cnnShapeParameterScenarios/)
  assert.match(source, /hasChecked/)
  assert.match(source, /revealEvidence/)
  assert.match(source, /v-if="hasChecked"/)
  assert.match(source, /convParameterCount/)
  assert.match(source, /denseParameterCount/)
  assert.match(source, /outputHeight/)
  assert.match(source, /comparison/)
})

test('cnn shape parameter challenge is wired only into the CNN feature-map chapter', () => {
  const algorithmViewSource = read('src/views/AlgorithmView.vue')

  assert.match(algorithmViewSource, /import CnnShapeParameterChallengeLab/)
  assert.match(algorithmViewSource, /<CnnShapeParameterChallengeLab/)
  assert.match(algorithmViewSource, /section\.id === 'channels-feature-maps'/)
  assert.match(algorithmViewSource, /<CnnExplainerLab/)
})
