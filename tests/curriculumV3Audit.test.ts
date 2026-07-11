import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import {
  curriculumV3AuditByCurrentModuleId,
  curriculumV3AuditEntries,
} from '../src/curriculum/v3/audit.ts'
import { curriculumV3ModuleById } from '../src/curriculum/v3/inventory.ts'
import {
  curriculumV3AuditIssues,
  curriculumV3CoverageIssues,
  curriculumV3DependencyIssues,
  curriculumV3WaveIssues,
} from '../src/curriculum/v3/validation.ts'

test('V3 validation helpers expose no blueprint issues', () => {
  assert.deepEqual(curriculumV3DependencyIssues(), [])
  assert.deepEqual(curriculumV3AuditIssues(), [])
  assert.deepEqual(curriculumV3CoverageIssues(), [])
  assert.deepEqual(curriculumV3WaveIssues(), [])
})

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
    assert.ok(entry.rationale['zh-CN'].trim())
    assert.ok(entry.rationale.en.trim())
    for (const targetId of entry.targetModuleIds) assert.ok(curriculumV3ModuleById.has(targetId))
  }
})

test('V3 audit records module-specific evidence instead of shared templates', () => {
  for (const entry of curriculumV3AuditEntries) {
    assert.doesNotMatch(entry.strengths.join(' '), /provides \d+ bilingual lessons? on a stable route/i)
    assert.doesNotMatch(
      entry.contractGaps.join(' '),
      /formula-to-code, controlled-experiment, failure-case, and checkpoint evidence contract/i,
    )
  }
  assert.equal(
    new Set(curriculumV3AuditEntries.map((entry) => JSON.stringify(entry.strengths))).size,
    curriculumCatalog.length,
  )
  assert.equal(
    new Set(curriculumV3AuditEntries.map((entry) => JSON.stringify(entry.contractGaps))).size,
    curriculumCatalog.length,
  )

  const representativeEvidence = {
    'housing-price-project': ['MAE', 'R²', 'leakage'],
    classification: ['threshold', 'ROC', 'calibration'],
    'gradient-descent': ['3D', 'contour', 'learning rate'],
    svd: ['pseudoinverse', 'low-rank'],
    'numerical-data': ['training data', 'column order', 'scaling'],
  } as const

  for (const [id, evidenceTerms] of Object.entries(representativeEvidence)) {
    const strength = curriculumV3AuditByCurrentModuleId.get(id)?.strengths.join(' ') ?? ''
    for (const term of evidenceTerms) {
      assert.match(strength, new RegExp(term, 'i'), `${id} strength must cite ${term}`)
    }
  }

  assert.match(
    curriculumV3AuditByCurrentModuleId.get('attention-transformer')?.contractGaps.join(' ') ?? '',
    /causal mask.*training.*decoding/i,
  )
  assert.match(
    curriculumV3AuditByCurrentModuleId.get('dataset-quality')?.contractGaps.join(' ') ?? '',
    /executable.*decision record.*group/i,
  )
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

test('V3 audit locks the exact keep set and convergence classifications', () => {
  const idsFor = (action: (typeof curriculumV3AuditEntries)[number]['action']) => curriculumV3AuditEntries
    .filter((entry) => entry.action === action)
    .map((entry) => entry.currentModuleId)
    .sort()

  assert.deepEqual(idsFor('keep'), [
    'categorical-data',
    'complexity-regularization',
    'dataset-quality',
    'numerical-data',
    'sequence-embedding-bridge',
    'splits-generalization',
  ])
  assert.deepEqual(idsFor('demote-to-depth'), [
    'deep-architecture-math',
    'markov-chains',
    'taylor-series',
  ])
  assert.deepEqual(idsFor('merge'), [
    'calculus-gradient-descent',
    'calculus-optimizer-comparison',
    'calculus-sgd-batch-noise',
    'calculus-training-code-diagnostics',
    'condition-numbers',
    'finite-difference-methods',
    'gradient-descent',
    'lu-decomposition',
    'nonlinear-equations',
    'optimization',
    'optimizer-comparison',
    'pca',
    'sparse-matrices',
    'svd',
    'training-diagnostics',
  ])
})
