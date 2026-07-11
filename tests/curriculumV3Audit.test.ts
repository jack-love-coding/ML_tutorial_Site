import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import {
  curriculumV3AuditByCurrentModuleId,
  curriculumV3AuditEntries,
} from '../src/curriculum/v3/audit.ts'
import { curriculumV3ModuleById } from '../src/curriculum/v3/inventory.ts'

test('V3 audit classifies every current Catalog module exactly once', () => {
  assert.equal(curriculumV3AuditEntries.length, curriculumCatalog.length)
  assert.equal(curriculumV3AuditByCurrentModuleId.size, curriculumCatalog.length)
  assert.deepEqual(
    [...curriculumV3AuditByCurrentModuleId.keys()].sort(),
    curriculumCatalog.map((module) => module.id).sort(),
  )
  for (const entry of curriculumV3AuditEntries) {
    assert.ok(entry.strengths.length > 0)
    assert.ok(entry.contractGaps.length > 0)
    for (const targetId of entry.targetModuleIds) assert.ok(curriculumV3ModuleById.has(targetId))
  }
})

test('V3 audit uses required non-obvious migration mappings and actions', () => {
  const expected = {
    'housing-price-project': ['project-tabular-regression'],
    'classification-project': ['project-classification-evaluation'],
    'attention-transformer': ['attention-qkv-multihead', 'transformer-blocks', 'small-transformer-training', 'decoding-sampling'],
    'llm-rag': ['llm-inference-context', 'peft-lora', 'retrieval-rag-systems', 'llm-evaluation-reliability'],
    svd: ['svd-pca-representation'],
    pca: ['svd-pca-representation'],
    'lu-decomposition': ['numerical-linear-algebra'],
    'sparse-matrices': ['numerical-linear-algebra'],
    'condition-numbers': ['numerical-linear-algebra'],
    'finite-difference-methods': ['numerical-differentiation-root-finding'],
    'nonlinear-equations': ['numerical-differentiation-root-finding'],
    'taylor-series': ['chain-rule-local-approximation'],
    'markov-chains': ['conditional-probability-markov'],
    'calculus-gradient-descent': ['gradient-descent'],
    'calculus-sgd-batch-noise': ['gradient-descent', 'optimizer-comparison'],
    'calculus-optimizer-comparison': ['optimizer-comparison'],
    'calculus-training-code-diagnostics': ['training-diagnostics'],
    optimization: ['gradient-descent'],
  } as const

  for (const [currentId, targetIds] of Object.entries(expected)) {
    assert.deepEqual(curriculumV3AuditByCurrentModuleId.get(currentId)?.targetModuleIds, targetIds)
  }
  assert.equal(curriculumV3AuditByCurrentModuleId.get('attention-transformer')?.action, 'split')
  assert.equal(curriculumV3AuditByCurrentModuleId.get('llm-rag')?.action, 'split')
  assert.equal(curriculumV3AuditByCurrentModuleId.get('lu-decomposition')?.action, 'merge')
  assert.equal(curriculumV3AuditByCurrentModuleId.get('finite-difference-methods')?.action, 'merge')
  assert.equal(curriculumV3AuditByCurrentModuleId.get('taylor-series')?.action, 'demote-to-depth')
})
