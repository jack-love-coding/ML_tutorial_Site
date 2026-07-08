import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  attentionQkvScenarios,
  evaluateAttentionQkvChallenge,
} from '../src/simulations/attentionQkvChallenge.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function closeTo(actual: number, expected: number, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be close to ${expected}`)
}

test('attention qkv challenge covers required deterministic scenarios', () => {
  assert.deepEqual(attentionQkvScenarios.map((scenario) => scenario.id), [
    'matching-key',
    'causal-mask',
    'padding-mask',
    'value-mixture',
  ])

  const matching = evaluateAttentionQkvChallenge({
    scenarioId: 'matching-key',
    prediction: { topKeyId: 'alpha', maskChangesTopKey: false },
  })
  assert.equal(matching.evidence.rawTopKeyId, 'alpha')
  assert.equal(matching.evidence.topKeyId, 'alpha')
  assert.equal(matching.result.allCorrect, true)
  closeTo(matching.evidence.rowWeightSum, 1)

  const causal = evaluateAttentionQkvChallenge({
    scenarioId: 'causal-mask',
    prediction: { topKeyId: 'current', maskChangesTopKey: true },
  })
  assert.equal(causal.evidence.rawTopKeyId, 'future')
  assert.equal(causal.evidence.topKeyId, 'current')
  assert.equal(causal.result.allCorrect, true)
  assert.equal(causal.evidence.maskedScores.find((score) => score.keyId === 'future')?.score, null)
  assert.equal(causal.evidence.weights.find((weight) => weight.keyId === 'future')?.weight, 0)
  closeTo(causal.evidence.rowWeightSum, 1)

  const padding = evaluateAttentionQkvChallenge({
    scenarioId: 'padding-mask',
    prediction: { topKeyId: 'real-a', maskChangesTopKey: true },
  })
  assert.equal(padding.evidence.rawTopKeyId, 'pad')
  assert.equal(padding.evidence.topKeyId, 'real-a')
  assert.equal(padding.result.allCorrect, true)
  assert.equal(padding.evidence.maskedScores.find((score) => score.keyId === 'pad')?.score, null)
  assert.equal(padding.evidence.weights.find((weight) => weight.keyId === 'pad')?.weight, 0)

  const mixture = evaluateAttentionQkvChallenge({
    scenarioId: 'value-mixture',
    prediction: { topKeyId: 'right-value', maskChangesTopKey: false },
  })
  const leftWeight = mixture.evidence.weights.find((weight) => weight.keyId === 'left-value')?.weight ?? 0
  const rightWeight = mixture.evidence.weights.find((weight) => weight.keyId === 'right-value')?.weight ?? 0
  assert.ok(leftWeight > 0.25)
  assert.ok(rightWeight > 0.25)
  assert.ok(mixture.evidence.weightedValue[0]! > 0.25)
  assert.ok(mixture.evidence.weightedValue[1]! > 0.25)
  assert.equal(mixture.result.allCorrect, true)
})

test('attention qkv challenge normalizes invalid inputs without throwing', () => {
  const snapshot = evaluateAttentionQkvChallenge({
    scenarioId: 'unknown-scenario',
    prediction: {
      topKeyId: 'not-a-token',
      maskChangesTopKey: 'not-a-boolean' as unknown as boolean,
    },
  })

  assert.equal(snapshot.scenario.id, 'matching-key')
  assert.equal(snapshot.result.topKeyCorrect, false)
  assert.equal(snapshot.result.maskEffectCorrect, true)
  assert.equal(snapshot.result.allCorrect, false)
  closeTo(snapshot.evidence.rowWeightSum, 1)
})

test('attention qkv challenge component gates evidence behind a check action', () => {
  const componentSource = read('src/components/AttentionQkvChallengeLab.vue')
  assert.match(componentSource, /attention-qkv-challenge/)
  assert.match(componentSource, /evaluateAttentionQkvChallenge/)
  assert.match(componentSource, /matching-key/)
  assert.match(componentSource, /causal-mask/)
  assert.match(componentSource, /padding-mask/)
  assert.match(componentSource, /value-mixture/)
  assert.match(componentSource, /hasChecked/)
  assert.match(componentSource, /revealEvidence/)
  assert.match(componentSource, /v-if="hasChecked"/)
  assert.match(componentSource, /maskChangesTopKey/)
  assert.match(componentSource, /weightedValue/)

  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  assert.match(workflowSource, /AttentionQkvChallengeLab/)
  assert.match(workflowSource, /moduleSlug === 'attention-transformer'/)
  assert.match(workflowSource, /section\.id === 'softmax-weighted-sum'/)

  const moduleSource = read('src/data/attentionTransformerModule.ts')
  assert.match(moduleSource, /预测.*key/)
  assert.match(moduleSource, /weighted value|value 加权|加权 value/)
})
