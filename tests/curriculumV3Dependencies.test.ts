import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumV3FoundationModules } from '../src/curriculum/v3/modules/foundations.ts'
import {
  curriculumV3MachineLearningModules,
  v3MachineLearningOrder,
} from '../src/curriculum/v3/modules/machineLearning.ts'

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
