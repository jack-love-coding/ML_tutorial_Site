import test from 'node:test'
import assert from 'node:assert/strict'
import {
  coreExperimentNavigationGroups,
  dataLabNavigationGroups,
  mathLabNavigationGroups,
} from '../src/data/navigationMenus.ts'
import { learningRouteById } from '../src/modules/math-lab/data/learningRoutes.ts'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { curriculumRouteManifest } from '../src/curriculum/routeManifest.ts'
import { learningRouteSummaryModules } from '../src/modules/math-lab/data/learningRouteSummaryModules.ts'

const registeredCoreModuleSlugs = [
  'ai-overview',
  'python-notebook',
  'housing-price-project',
  'classification-project',
  'model-selection',
  'tree-forest',
  'cnn-visualization',
  'sequence-embedding-bridge',
  'attention-transformer',
  'optimizer-comparison',
  'llm-rag',
  'loss-functions',
  'gradient-descent',
  'linear-regression',
  'logistic-regression',
  'classification',
  'mlp',
]

function labelsAreLocalized(label: { 'zh-CN': string; en: string }) {
  assert.ok(label['zh-CN'].trim().length > 0)
  assert.ok(label.en.trim().length > 0)
}

test('core experiment navigation groups cover every registered module once', () => {
  const groupedSlugs = coreExperimentNavigationGroups.flatMap((group) => {
    labelsAreLocalized(group.label)
    return group.moduleSlugs
  })

  assert.equal(groupedSlugs.length, registeredCoreModuleSlugs.length)
  assert.equal(new Set(groupedSlugs).size, groupedSlugs.length)

  for (const slug of registeredCoreModuleSlugs) {
    assert.ok(groupedSlugs.includes(slug), `${slug} should appear in the core experiment menu`)
  }
})

test('math lab navigation menu covers all lab module routes with localized labels', () => {
  const routes = mathLabNavigationGroups.flatMap((group) => {
    labelsAreLocalized(group.label)

    return group.items.map((item) => {
      labelsAreLocalized(item.label)
      return item.route
    })
  })

  const linearAlgebraGroup = mathLabNavigationGroups.find((group) => group.id === 'linear-algebra')
  assert.ok(linearAlgebraGroup)
  assert.deepEqual(
    linearAlgebraGroup.items.map((item) => item.id),
    [
      'linear-algebra-feature-space',
      'linear-algebra-distance-similarity',
      'linear-algebra-matrix-transformations',
      'linear-algebra-rank-null-space',
      'eigenvalues-eigenvectors',
      'svd',
      'pca',
    ],
  )
  assert.deepEqual(
    learningRouteById['linear-algebra-route'].chapterModuleIds,
    linearAlgebraGroup.items.map((item) => item.id),
  )

  const calculusRouteGroup = mathLabNavigationGroups.find((group) => group.id === 'calculus-route')
  assert.ok(calculusRouteGroup)
  const goldTitle = { 'zh-CN': '函数与映射：输入怎样变成预测', en: 'Functions and Mappings: How Inputs Become Predictions' }
  assert.deepEqual(calculusRouteGroup.items.find((item) => item.id === 'calculus-functions-rate-change')?.label, goldTitle)
  assert.deepEqual(curriculumRouteManifest.find((item) => item.id === 'calculus-functions-rate-change')?.title, goldTitle)
  assert.deepEqual(learningRouteSummaryModules.find((item) => item.id === 'calculus-functions-rate-change')?.title, goldTitle)
  assert.deepEqual(
    calculusRouteGroup.items.map((item) => item.id),
    [
      'calculus-functions-rate-change',
      'calculus-derivatives-local-change',
      'calculus-partial-derivatives-gradients',
      'calculus-gradient-descent',
      'calculus-sgd-batch-noise',
      'calculus-optimizer-comparison',
      'calculus-training-code-diagnostics',
    ],
  )
  assert.deepEqual(
    learningRouteById['calculus-route']?.chapterModuleIds,
    calculusRouteGroup.items.map((item) => item.id),
  )

  const pilotGroup = mathLabNavigationGroups.find((group) => group.id === 'math-to-code-pilot')
  assert.ok(pilotGroup)
  assert.deepEqual(
    pilotGroup.items.map((item) => item.id),
    learningRouteById['math-to-code-pilot'].chapterModuleIds.slice(4),
  )

  assert.deepEqual(
    mathLabNavigationGroups.map((group) => group.id),
    [
      'zero-foundation',
      'linear-algebra',
      'linear-algebra-tools',
      'calculus-route',
      'math-to-code-pilot',
      'calculus-optimization',
      'probability-sampling',
      'data-geometry-architectures',
    ],
  )

  assert.deepEqual(routes, [
    '/math-lab/modules/beginner-linear-algebra',
    '/math-lab/modules/beginner-probability-distributions',
    '/math-lab/modules/linear-algebra-feature-space',
    '/math-lab/modules/linear-algebra-distance-similarity',
    '/math-lab/modules/linear-algebra-matrix-transformations',
    '/math-lab/modules/linear-algebra-rank-null-space',
    '/math-lab/modules/eigenvalues-eigenvectors',
    '/math-lab/modules/svd',
    '/math-lab/modules/pca',
    '/math-lab/modules/tensor-shapes-vectorization',
    '/math-lab/modules/lu-decomposition',
    '/math-lab/modules/sparse-matrices',
    '/math-lab/modules/condition-numbers',
    '/math-lab/modules/calculus-functions-rate-change',
    '/math-lab/modules/calculus-derivatives-local-change',
    '/math-lab/modules/calculus-partial-derivatives-gradients',
    '/math-lab/modules/calculus-gradient-descent',
    '/math-lab/modules/calculus-sgd-batch-noise',
    '/math-lab/modules/calculus-optimizer-comparison',
    '/math-lab/modules/calculus-training-code-diagnostics',
    '/math-lab/modules/numpy-mathematics-implementation',
    '/math-lab/modules/math-to-code-guided-studio',
    '/math-lab/modules/taylor-series',
    '/math-lab/modules/matrix-calculus-autodiff',
    '/math-lab/modules/finite-difference-methods',
    '/math-lab/modules/nonlinear-equations',
    '/math-lab/modules/optimization',
    '/math-lab/modules/training-diagnostics',
    '/math-lab/modules/monte-carlo',
    '/math-lab/modules/probability-likelihood-entropy',
    '/math-lab/modules/markov-chains',
    '/math-lab/modules/least-squares-fitting',
    '/math-lab/modules/deep-architecture-math',
  ])
  assert.equal(new Set(routes).size, routes.length, 'math lab navigation routes should not contain duplicates')

  const registeredRoutes = mathLabModules.map((moduleDefinition) => `/math-lab/modules/${moduleDefinition.id}`)
  assert.deepEqual(
    [...routes].sort(),
    [...registeredRoutes].sort(),
    'math lab navigation should cover every registered module route exactly once',
  )
})

test('data lab navigation menu covers all data lab module routes with localized labels', () => {
  const routes = dataLabNavigationGroups.flatMap((group) => {
    labelsAreLocalized(group.label)

    return group.items.map((item) => {
      labelsAreLocalized(item.label)
      return item.route
    })
  })

  assert.deepEqual(routes, [
    '/data-lab/modules/numerical-data',
    '/data-lab/modules/categorical-data',
    '/data-lab/modules/dataset-quality',
    '/data-lab/modules/splits-generalization',
    '/data-lab/modules/complexity-regularization',
  ])
  assert.equal(new Set(routes).size, routes.length)
})
