import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  architectureToolsScenarios,
  evaluateArchitectureToolsHandoffChallenge,
} from '../src/simulations/architectureToolsHandoffChallenge.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('architecture tools handoff challenge covers required deterministic scenarios', () => {
  assert.deepEqual(architectureToolsScenarios.map((scenario) => scenario.id), [
    'tokenizer-boundary',
    'mask-visibility',
    'block-hidden-state',
    'logits-ranking',
  ])

  const tokenizer = evaluateArchitectureToolsHandoffChallenge({
    scenarioId: 'tokenizer-boundary',
    prediction: { toolPart: 'tokenizer', concept: 'token-ids' },
  })
  assert.equal(tokenizer.result.allCorrect, true)
  assert.equal(tokenizer.evidence.expectedToolPart, 'tokenizer')
  assert.equal(tokenizer.evidence.expectedConcept, 'token-ids')
  assert.match(tokenizer.evidence.shapeOrValueEvidence, /token ids/i)
  assert.match(tokenizer.evidence.misconception.en, /semantic understanding/i)

  const mask = evaluateArchitectureToolsHandoffChallenge({
    scenarioId: 'mask-visibility',
    prediction: { toolPart: 'attention-mask', concept: 'visibility' },
  })
  assert.equal(mask.result.allCorrect, true)
  assert.equal(mask.evidence.expectedToolPart, 'attention-mask')
  assert.equal(mask.evidence.expectedConcept, 'visibility')
  assert.match(mask.evidence.shapeOrValueEvidence, /0, 1, 1, 0/)

  const blocks = evaluateArchitectureToolsHandoffChallenge({
    scenarioId: 'block-hidden-state',
    prediction: { toolPart: 'transformer-blocks', concept: 'hidden-state-update' },
  })
  assert.equal(blocks.result.allCorrect, true)
  assert.equal(blocks.evidence.expectedToolPart, 'transformer-blocks')
  assert.equal(blocks.evidence.expectedConcept, 'hidden-state-update')
  assert.equal(blocks.evidence.shapeOrValueEvidence, '[B,T,H] -> [B,T,H]')

  const logits = evaluateArchitectureToolsHandoffChallenge({
    scenarioId: 'logits-ranking',
    prediction: { toolPart: 'output-head-logits', concept: 'next-token-scores' },
  })
  assert.equal(logits.result.allCorrect, true)
  assert.equal(logits.evidence.expectedToolPart, 'output-head-logits')
  assert.equal(logits.evidence.expectedConcept, 'next-token-scores')
  assert.match(logits.evidence.shapeOrValueEvidence, /next-token/i)
})

test('architecture tools handoff challenge normalizes invalid inputs without throwing', () => {
  const snapshot = evaluateArchitectureToolsHandoffChallenge({
    scenarioId: 'unknown-scenario',
    prediction: { toolPart: 'unknown-tool', concept: 'unknown-concept' },
  })

  assert.equal(snapshot.scenario.id, 'tokenizer-boundary')
  assert.equal(snapshot.result.toolPartCorrect, false)
  assert.equal(snapshot.result.conceptCorrect, false)
  assert.equal(snapshot.result.allCorrect, false)
})

test('architecture tools handoff challenge component gates evidence behind a check action', () => {
  const componentSource = read('src/components/ArchitectureToolsHandoffChallengeLab.vue')
  assert.match(componentSource, /architecture-tools-challenge/)
  assert.match(componentSource, /evaluateArchitectureToolsHandoffChallenge/)
  assert.match(componentSource, /tokenizer-boundary/)
  assert.match(componentSource, /mask-visibility/)
  assert.match(componentSource, /block-hidden-state/)
  assert.match(componentSource, /logits-ranking/)
  assert.match(componentSource, /hasChecked/)
  assert.match(componentSource, /revealEvidence/)
  assert.match(componentSource, /v-if="hasChecked"/)
  assert.match(componentSource, /toolPart/)
  assert.match(componentSource, /concept/)

  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  assert.match(workflowSource, /ArchitectureToolsHandoffChallengeLab/)
  assert.match(workflowSource, /moduleSlug === 'attention-transformer'/)
  assert.match(workflowSource, /section\.id === 'architecture-to-tools'/)
  assert.match(workflowSource, /attentionStages/)

  const moduleSource = read('src/data/attentionTransformerModule.ts')
  assert.match(moduleSource, /tool.*challenge|tools.*challenge|工具.*挑战|工具链.*判断/i)
})
