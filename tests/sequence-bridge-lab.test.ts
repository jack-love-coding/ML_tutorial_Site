import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { buildSequenceBridgeSnapshot } from '../src/simulations/sequenceBridgeLab.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('sequence bridge snapshot traces token ids to hidden states and qkv shapes', () => {
  const snapshot = buildSequenceBridgeSnapshot({
    batchSize: 2,
    tokenLength: 5,
    hiddenSize: 8,
    paddingTokens: 1,
    maskMode: 'padding',
    queryIndex: 2,
  })

  assert.equal(snapshot.tokenIdsShape, '[2,5]')
  assert.equal(snapshot.embeddingTableShape, '[V,8]')
  assert.equal(snapshot.hiddenStatesShape, '[2,5,8]')
  assert.equal(snapshot.qkvShape, '[2,5,8]')
  assert.equal(snapshot.attentionScoreShape, '[2,5,5]')
  assert.equal(snapshot.visibleTokenCount, 4)
  assert.equal(snapshot.blockedTokenCount, 1)
})

test('sequence bridge causal mask only exposes tokens up to the query position', () => {
  const snapshot = buildSequenceBridgeSnapshot({
    batchSize: 1,
    tokenLength: 6,
    hiddenSize: 16,
    paddingTokens: 0,
    maskMode: 'causal',
    queryIndex: 3,
  })

  assert.equal(snapshot.visibleTokenCount, 4)
  assert.equal(snapshot.blockedTokenCount, 2)
  assert.deepEqual(
    snapshot.maskCells.map((cell) => cell.state),
    ['visible', 'visible', 'visible', 'query', 'blocked', 'blocked'],
  )
})

test('sequence bridge workflow uses the dedicated shape lab component', () => {
  assert.ok(existsSync(new URL('src/components/SequenceBridgeShapeLab.vue', root)))

  const componentSource = read('src/components/SequenceBridgeShapeLab.vue')
  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  const styleSource = read('src/styles/modules/workflow-lessons.css')

  assert.match(componentSource, /buildSequenceBridgeSnapshot/)
  assert.match(componentSource, /sequence-shape-lab__controls/)
  assert.match(componentSource, /token_ids \[B,T\]/)
  assert.match(componentSource, /hidden states \[B,T,H\]/)
  assert.match(componentSource, /Q\/K\/V/)
  assert.match(componentSource, /Predict first/)
  assert.match(workflowSource, /import SequenceBridgeShapeLab/)
  assert.match(workflowSource, /<SequenceBridgeShapeLab/)
  assert.match(styleSource, /sequence-shape-lab/)
})
