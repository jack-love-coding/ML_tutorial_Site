import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  evaluateTransformerBlockAssemblyChallenge,
  transformerBlockScenarios,
} from '../src/simulations/transformerBlockAssemblyChallenge.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('transformer block challenge covers required deterministic scenarios', () => {
  assert.deepEqual(transformerBlockScenarios.map((scenario) => scenario.id), [
    'missing-residual',
    'missing-layernorm',
    'missing-ffn',
    'attention-only',
  ])

  const residual = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'missing-residual',
    prediction: { part: 'residual', consequence: 'signal-path' },
  })
  assert.equal(residual.result.allCorrect, true)
  assert.equal(residual.evidence.shapeInvariant, '[B,T,H] -> [B,T,H]')
  assert.match(residual.evidence.failureConsequence.en, /direct signal path/i)

  const norm = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'missing-layernorm',
    prediction: { part: 'layernorm', consequence: 'normalization' },
  })
  assert.equal(norm.result.allCorrect, true)
  assert.match(norm.evidence.failureConsequence.en, /scale/i)

  const ffn = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'missing-ffn',
    prediction: { part: 'ffn', consequence: 'per-token-processing' },
  })
  assert.equal(ffn.result.allCorrect, true)
  assert.match(ffn.evidence.failureConsequence.en, /nonlinear/i)

  const attentionOnly = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'attention-only',
    prediction: { part: 'complete-block', consequence: 'token-mixing' },
  })
  assert.equal(attentionOnly.result.allCorrect, true)
  assert.ok(attentionOnly.evidence.blockTrace.some((step) => step.part === 'self-attention'))
})

test('transformer block challenge normalizes invalid inputs without throwing', () => {
  const snapshot = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'unknown',
    prediction: { part: 'unknown-part', consequence: 'unknown-consequence' },
  })

  assert.equal(snapshot.scenario.id, 'missing-residual')
  assert.equal(snapshot.result.partCorrect, false)
  assert.equal(snapshot.result.consequenceCorrect, false)
  assert.equal(snapshot.result.allCorrect, false)
})

test('transformer block challenge component gates evidence behind a check action', () => {
  const componentSource = read('src/components/TransformerBlockAssemblyChallengeLab.vue')
  assert.match(componentSource, /transformer-block-challenge/)
  assert.match(componentSource, /evaluateTransformerBlockAssemblyChallenge/)
  assert.match(componentSource, /missing-residual/)
  assert.match(componentSource, /missing-layernorm/)
  assert.match(componentSource, /missing-ffn/)
  assert.match(componentSource, /attention-only/)
  assert.match(componentSource, /hasChecked/)
  assert.match(componentSource, /revealEvidence/)
  assert.match(componentSource, /v-if="hasChecked"/)

  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  assert.match(workflowSource, /TransformerBlockAssemblyChallengeLab/)
  assert.match(workflowSource, /moduleSlug === 'attention-transformer'/)
  assert.match(workflowSource, /section\.id === 'transformer-block'/)

  const moduleSource = read('src/data/attentionTransformerModule.ts')
  assert.match(moduleSource, /block.*challenge|挑战.*block|assembly/i)
})
