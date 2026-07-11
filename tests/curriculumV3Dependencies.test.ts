import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumV3FoundationModules } from '../src/curriculum/v3/modules/foundations.ts'
import {
  curriculumV3MachineLearningModules,
  v3MachineLearningOrder,
} from '../src/curriculum/v3/modules/machineLearning.ts'
import {
  curriculumV3DeepLearningModules,
  v3DeepLearningOrder,
} from '../src/curriculum/v3/modules/deepLearning.ts'
import { curriculumV3Modules } from '../src/curriculum/v3/inventory.ts'
import {
  curriculumV3EntryAssumptions,
  curriculumV3ExitCapabilities,
  reachableFromEntry,
} from '../src/curriculum/v3/coverage.ts'
import { curriculumV3Waves } from '../src/curriculum/v3/waves.ts'
import { validateCurriculumV3Blueprint } from '../src/curriculum/v3/validation.ts'

const expectedDependencies = [
  ['ai-overview', 'required-core', [], ['ai-overview'], 'rebuild'],
  ['python-notebook', 'required-core', ['ai-overview'], ['python-notebook'], 'rebuild'],
  ['calculus-functions-rate-change', 'required-core', ['python-notebook'], ['calculus-functions-rate-change'], 'rebuild'],
  ['beginner-linear-algebra', 'required-core', ['calculus-functions-rate-change'], ['beginner-linear-algebra'], 'rebuild'],
  ['calculus-derivatives-local-change', 'required-core', ['calculus-functions-rate-change'], ['calculus-derivatives-local-change'], 'rebuild'],
  ['beginner-probability-distributions', 'required-core', ['calculus-functions-rate-change'], ['beginner-probability-distributions'], 'rebuild'],
  ['linear-algebra-feature-space', 'required-core', ['beginner-linear-algebra'], ['linear-algebra-feature-space'], 'rebuild'],
  ['linear-algebra-distance-similarity', 'required-core', ['linear-algebra-feature-space'], ['linear-algebra-distance-similarity'], 'rebuild'],
  ['linear-algebra-matrix-transformations', 'required-core', ['beginner-linear-algebra'], ['linear-algebra-matrix-transformations'], 'rebuild'],
  ['linear-algebra-rank-null-space', 'depth-topic', ['linear-algebra-matrix-transformations'], ['linear-algebra-rank-null-space'], 'keep'],
  ['least-squares-fitting', 'required-core', ['linear-algebra-feature-space', 'linear-algebra-matrix-transformations'], ['least-squares-fitting'], 'rebuild'],
  ['eigenvalues-eigenvectors', 'depth-topic', ['linear-algebra-matrix-transformations'], ['eigenvalues-eigenvectors'], 'keep'],
  ['svd-pca-representation', 'depth-topic', ['least-squares-fitting', 'eigenvalues-eigenvectors'], ['svd', 'pca'], 'merge'],
  ['numerical-linear-algebra', 'depth-topic', ['linear-algebra-rank-null-space'], ['lu-decomposition', 'sparse-matrices', 'condition-numbers'], 'merge'],
  ['calculus-partial-derivatives-gradients', 'required-core', ['calculus-derivatives-local-change', 'beginner-linear-algebra'], ['calculus-partial-derivatives-gradients'], 'rebuild'],
  ['chain-rule-local-approximation', 'required-core', ['calculus-derivatives-local-change'], ['taylor-series'], 'merge'],
  ['numerical-differentiation-root-finding', 'depth-topic', ['calculus-derivatives-local-change', 'python-notebook'], ['finite-difference-methods', 'nonlinear-equations'], 'merge'],
  ['probability-expectation-variance', 'required-core', ['beginner-probability-distributions'], [], 'add'],
  ['conditional-probability-markov', 'depth-topic', ['probability-expectation-variance'], ['markov-chains'], 'merge'],
  ['probability-likelihood-entropy', 'required-core', ['probability-expectation-variance'], ['probability-likelihood-entropy'], 'rebuild'],
  ['monte-carlo', 'depth-topic', ['probability-expectation-variance', 'python-notebook'], ['monte-carlo'], 'keep'],
  ['gradient-descent', 'required-core', ['calculus-partial-derivatives-gradients', 'chain-rule-local-approximation'], ['gradient-descent', 'calculus-gradient-descent', 'optimization'], 'merge'],
] as const

test('V3 blueprint is acyclic, ordered, covered, and project-linked', () => {
  assert.deepEqual(validateCurriculumV3Blueprint(), [])
  assert.deepEqual(
    curriculumV3ExitCapabilities.map((capability) => [
      capability.id,
      capability.moduleIds,
      capability.projectIds,
    ]),
    [
      ['mathematics-to-computation', ['gradient-descent'], ['project-math-to-code']],
      ['data-to-honest-model', ['linear-regression'], ['project-tabular-regression']],
      ['classification-and-evaluation', ['model-selection'], ['project-classification-evaluation']],
      ['neural-training-diagnosis', ['optimizer-comparison'], ['project-neural-representation']],
      ['deep-representation-shapes', ['cnn-visualization', 'sequence-embedding-bridge'], []],
      ['small-transformer-language-model', ['decoding-sampling'], ['project-small-transformer']],
      ['llm-adaptation-and-rag', ['llm-evaluation-reliability'], ['project-llm-application']],
    ],
  )
  assert.ok(curriculumV3Waves.length >= 12)
  assert.ok(curriculumV3Waves.every((wave) => wave.moduleIds.length >= 4 && wave.moduleIds.length <= 6))
})

test('entry assumptions reach every required module', () => {
  assert.deepEqual(curriculumV3EntryAssumptions, [
    'high-school-algebra-functions',
    'basic-python-reading-editing',
  ])
  const required = curriculumV3Modules.filter((module) => module.role === 'required-core')
  assert.ok(required.length >= 40)
  for (const module of required) assert.ok(reachableFromEntry(module.id), `${module.id} is unreachable`)
})

test('a disconnected required root is not reachable from entry assumptions', () => {
  const disconnectedId = 'disconnected-required-root'
  const modules = new Map(curriculumV3Modules.map((module) => [module.id, module]))
  modules.set(disconnectedId, {
    ...curriculumV3Modules[0]!,
    id: disconnectedId,
    prerequisiteIds: [],
  })
  const pythonNotebook = modules.get('python-notebook')!
  modules.set('python-notebook', {
    ...pythonNotebook,
    prerequisiteIds: [disconnectedId],
  })

  assert.equal(reachableFromEntry('python-notebook', modules), false)
  assert.equal(
    reachableFromEntry('ai-overview', modules, ['high-school-algebra-functions']),
    false,
  )
})

test('foundation dependency metadata matches the approved inventory', () => {
  assert.deepEqual(
    curriculumV3FoundationModules.map((module) => [
      module.id,
      module.role,
      module.prerequisiteIds,
      module.sourceModuleIds,
      module.migrationAction,
    ]),
    expectedDependencies,
  )

  const orderById = new Map(
    curriculumV3FoundationModules.map((module) => [module.id, module.order]),
  )
  for (const module of curriculumV3FoundationModules) {
    for (const prerequisiteId of module.prerequisiteIds) {
      assert.ok((orderById.get(prerequisiteId) ?? Infinity) < module.order)
    }
  }
})

test('mathematics uses introduction then explicit revisit', () => {
  const byId = new Map(curriculumV3FoundationModules.map((module) => [module.id, module]))

  assert.ok(
    byId.get('linear-algebra-matrix-transformations')?.introduces.includes('matrix-multiplication'),
  )
  assert.ok(byId.get('gradient-descent')?.revisits.includes('gradient'))
  assert.ok(
    byId.get('probability-likelihood-entropy')?.revisits.includes('probability-distribution'),
  )
})

test('machine learning required core does not depend on an optional depth topic', () => {
  const depthIds = new Set(
    curriculumV3MachineLearningModules
      .filter((module) => module.role === 'depth-topic')
      .map((module) => module.id),
  )
  for (const module of curriculumV3MachineLearningModules) {
    if (module.role === 'required-core') {
      assert.equal(module.prerequisiteIds.some((id) => depthIds.has(id)), false)
    }
  }
})

test('machine learning dependency metadata matches the approved order', () => {
  assert.deepEqual(
    curriculumV3MachineLearningModules.map((module) => [module.id, module.prerequisiteIds]),
    v3MachineLearningOrder,
  )
})

test('deep learning dependency metadata matches the approved order', () => {
  assert.deepEqual(
    curriculumV3DeepLearningModules.map((module) => [module.id, module.prerequisiteIds]),
    v3DeepLearningOrder,
  )
})

test('required deep learning route does not depend on deep architecture math', () => {
  for (const module of curriculumV3DeepLearningModules) {
    if (module.role === 'required-core') {
      assert.equal(module.prerequisiteIds.includes('deep-architecture-math'), false)
    }
  }
  assert.equal(curriculumV3DeepLearningModules.find((module) => module.id === 'sequence-models-rnn')?.role, 'required-core')
})

test('deep learning roles, sources, and migration actions match the approved plan', () => {
  assert.deepEqual(
    curriculumV3DeepLearningModules.map((module) => [module.id, module.role, module.sourceModuleIds, module.migrationAction]),
    [
      ['neuron-activation-foundations', 'required-core', [], 'add'],
      ['mlp', 'required-core', ['mlp'], 'rebuild'],
      ['backpropagation-mechanism', 'required-core', [], 'add'],
      ['matrix-calculus-autodiff', 'required-core', ['matrix-calculus-autodiff'], 'rebuild'],
      ['initialization-normalization', 'required-core', [], 'add'],
      ['optimizer-comparison', 'required-core', ['optimizer-comparison'], 'rebuild'],
      ['deep-architecture-math', 'depth-topic', ['deep-architecture-math'], 'rebuild'],
      ['tensor-shapes-vectorization', 'required-core', ['tensor-shapes-vectorization'], 'rebuild'],
      ['cnn-visualization', 'required-core', ['cnn-visualization'], 'rebuild'],
      ['sequence-models-rnn', 'required-core', ['sequence-models-rnn'], 'rebuild'],
      ['sequence-embedding-bridge', 'required-core', ['sequence-embedding-bridge'], 'keep'],
      ['tokenization-language-modeling', 'required-core', [], 'add'],
      ...['attention-qkv-multihead', 'transformer-blocks', 'small-transformer-training', 'decoding-sampling'].map((id) => [id, 'required-core', ['attention-transformer'], 'split']),
      ...['llm-inference-context', 'peft-lora', 'retrieval-rag-systems', 'llm-evaluation-reliability'].map((id) => [id, 'required-core', ['llm-rag'], 'split']),
    ],
  )
})
