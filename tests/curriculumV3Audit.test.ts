import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import {
  curriculumV3AuditByCurrentModuleId,
  curriculumV3AuditEntries,
} from '../src/curriculum/v3/audit.ts'
import { curriculumV3ModuleById } from '../src/curriculum/v3/inventory.ts'
import { curriculumV3Waves } from '../src/curriculum/v3/waves.ts'
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

test('V3 dependency validation reports unknown project references with a stable prefix', () => {
  const modules = [...curriculumV3ModuleById.values()].map((module) => ({
    ...module,
    projectIds: [...module.projectIds],
  }))
  modules[0]!.projectIds.push('project-does-not-exist')

  assert.ok(
    curriculumV3DependencyIssues(modules).includes(
      'unknown-project-reference:ai-overview:project-does-not-exist',
    ),
  )
})

test('V3 dependency validation rejects revisits before concept introduction', () => {
  const modules = [...curriculumV3ModuleById.values()].map((module) => ({
    ...module,
    revisits: [...module.revisits],
  }))
  modules.find((module) => module.id === 'numerical-data')!.revisits.push('never-introduced')

  assert.ok(
    curriculumV3DependencyIssues(modules).includes(
      'concept-revisit-before-introduction:numerical-data:never-introduced',
    ),
  )
})

test('V3 project revisits are concepts rather than prerequisite module IDs', () => {
  const modules = [...curriculumV3ModuleById.values()].map((module) => ({
    ...module,
    revisits: [...module.revisits],
  }))
  const project = modules.find((module) => module.id === 'project-tabular-regression')!
  project.revisits = ['linear-regression']

  assert.ok(
    curriculumV3DependencyIssues(modules).includes(
      'project-revisit-module-id:project-tabular-regression:linear-regression',
    ),
  )
})

const clonedWaves = () => curriculumV3Waves.map((wave) => ({
  ...wave,
  moduleIds: [...wave.moduleIds],
  exitCriteria: [...wave.exitCriteria],
}))

test('V3 wave validation diagnoses unknown module IDs and duplicate depth assignments', () => {
  const waves = clonedWaves()
  waves[0]!.moduleIds.push('unknown-wave-module')
  waves[1]!.moduleIds.push('linear-algebra-rank-null-space')

  const issues = curriculumV3WaveIssues(waves)
  assert.ok(issues.includes('wave-required-coverage:unknown-module:unknown-wave-module'))
  assert.ok(issues.includes('wave-required-coverage:duplicate:linear-algebra-rank-null-space'))
})

test('V3 wave validation requires at least 12 waves spanning V3.1 through V3.7', () => {
  const waves = clonedWaves().filter((wave) => !wave.id.startsWith('v3.7-'))

  const issues = curriculumV3WaveIssues(waves)
  assert.ok(issues.includes('wave-size:wave-count:11'))
  assert.ok(issues.includes('wave-required-coverage:missing-stage:v3.7'))
})

test('V3 wave validation diagnoses prerequisite wave inversions', () => {
  const waves = clonedWaves()
  const firstWave = waves[0]!
  const secondWave = waves[1]!
  firstWave.moduleIds = firstWave.moduleIds.filter((id) => id !== 'calculus-derivatives-local-change')
  secondWave.moduleIds.push('calculus-derivatives-local-change')
  firstWave.moduleIds.push('calculus-partial-derivatives-gradients')
  const linearSystemsWave = waves.find((wave) => wave.id === 'v3.2-linear-systems')!
  linearSystemsWave.moduleIds = linearSystemsWave.moduleIds.filter(
    (id) => id !== 'calculus-partial-derivatives-gradients',
  )

  assert.ok(
    curriculumV3WaveIssues(waves).includes(
      'prerequisite-after-consumer:wave:calculus-partial-derivatives-gradients:calculus-derivatives-local-change',
    ),
  )
})

test('V3 wave validation enforces approved stage responsibilities', () => {
  const waves = clonedWaves()
  const dataWave = waves.find((wave) => wave.moduleIds.includes('numerical-data'))!
  const classicalWave = waves.find((wave) => wave.moduleIds.includes('loss-functions'))!
  dataWave.moduleIds = dataWave.moduleIds.filter((id) => id !== 'numerical-data')
  classicalWave.moduleIds.push('numerical-data')

  assert.ok(
    curriculumV3WaveIssues(waves).includes(
      `wave-stage-responsibility:${classicalWave.id}:numerical-data`,
    ),
  )
})

test('V3 wave validation diagnoses non-contiguous instructional members', () => {
  const waves = clonedWaves()
  const vectorWave = waves.find((wave) => wave.id === 'v3.2-vector-matrix-language')!
  vectorWave.moduleIds = vectorWave.moduleIds.map((id) =>
    id === 'linear-algebra-rank-null-space' ? 'least-squares-fitting' : id)

  assert.ok(
    curriculumV3WaveIssues(waves).includes(
      'wave-instructional-contiguity:v3.2-vector-matrix-language:7,8,9,11',
    ),
  )
})

test('V3 wave validation diagnoses inventory-order regression across waves', () => {
  const waves = clonedWaves()
  const firstIndex = waves.findIndex((wave) => wave.id === 'v3.2-vector-matrix-language')
  const secondIndex = waves.findIndex((wave) => wave.id === 'v3.2-linear-systems')
  ;[waves[firstIndex], waves[secondIndex]] = [waves[secondIndex]!, waves[firstIndex]!]

  assert.ok(
    curriculumV3WaveIssues(waves).includes(
      'wave-inventory-order:v3.2-vector-matrix-language:7',
    ),
  )
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
    'calculus-functions-rate-change': ['prediction', 'w1', 'residual', 'Python'],
  } as const

  for (const [id, evidenceTerms] of Object.entries(representativeEvidence)) {
    const strength = curriculumV3AuditByCurrentModuleId.get(id)?.strengths.join(' ') ?? ''
    for (const term of evidenceTerms) {
      assert.match(strength, new RegExp(term, 'i'), `${id} strength must cite ${term}`)
    }
  }

  assert.match(
    curriculumV3AuditByCurrentModuleId.get('calculus-functions-rate-change')?.contractGaps.join(' ') ?? '',
    /multi-sample.*generalization.*derivative/i,
  )

  assert.match(
    curriculumV3AuditByCurrentModuleId.get('attention-transformer')?.contractGaps.join(' ') ?? '',
    /causal mask.*training.*decoding/i,
  )
  assert.match(
    curriculumV3AuditByCurrentModuleId.get('dataset-quality')?.contractGaps.join(' ') ?? '',
    /executable.*decision record.*group/i,
  )
})

test('V3 audit covers the two pilot additions exactly once with valid and specific targets', () => {
  const expected = {
    'numpy-mathematics-implementation': ['project-math-to-code'],
    'math-to-code-guided-studio': ['project-math-to-code'],
  }
  for (const [currentId, targetModuleIds] of Object.entries(expected)) {
    const entries = curriculumV3AuditEntries.filter((entry) => entry.currentModuleId === currentId)
    assert.equal(entries.length, 1, `${currentId} must occur exactly once`)
    assert.deepEqual(entries[0]!.targetModuleIds, targetModuleIds)
    assert.equal(entries[0]!.action, 'merge')
    assert.ok(entries[0]!.strengths.join(' ').length > 80)
    assert.ok(entries[0]!.contractGaps.join(' ').length > 80)
    for (const targetId of targetModuleIds) assert.ok(curriculumV3ModuleById.has(targetId))
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
  assert.deepEqual(
    [
      curriculumV3AuditByCurrentModuleId.get('complexity-regularization')?.targetModuleIds,
      curriculumV3AuditByCurrentModuleId.get('complexity-regularization')?.action,
      curriculumV3ModuleById.get('complexity-regularization')?.migrationAction,
    ],
    [['complexity-regularization'], 'rebuild', 'rebuild'],
  )
})

test('V3 audit locks the exact keep set and convergence classifications', () => {
  const idsFor = (action: (typeof curriculumV3AuditEntries)[number]['action']) => curriculumV3AuditEntries
    .filter((entry) => entry.action === action)
    .map((entry) => entry.currentModuleId)
    .sort()

  assert.deepEqual(idsFor('keep'), [
    'categorical-data',
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
    'math-to-code-guided-studio',
    'nonlinear-equations',
    'numpy-mathematics-implementation',
    'optimization',
    'optimizer-comparison',
    'pca',
    'sparse-matrices',
    'svd',
    'training-diagnostics',
  ])
})
