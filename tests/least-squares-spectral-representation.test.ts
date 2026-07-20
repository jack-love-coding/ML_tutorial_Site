import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import {
  learningRouteById,
  linearAlgebraRouteModuleIds,
  routeNavigationForModule,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const chapterIds = [
  'least-squares-fitting',
  'eigenvalues-eigenvectors',
  'svd',
  'pca',
] as const

const codeConceptIds = {
  'least-squares-fitting': 'least-squares-residual-objective',
  'eigenvalues-eigenvectors': 'eigenpair',
  svd: 'singular-value-decomposition',
  pca: 'pca-centered-projection',
} as const

const outputAnchors = {
  'least-squares-fitting': [
    'weights = [2.0625, 0.8125]',
    'residual = [0.0, 0.5, 0.5, 0.0]',
    'SSE = 0.5',
    'X.T @ residual = [0.0, 0.0]',
  ],
  'eigenvalues-eigenvectors': [
    'eigenvalues = [10.666667, 2.666667]',
    'power direction = [0.709864, 0.704339]',
    'Rayleigh quotient = 10.666545',
  ],
  svd: [
    'singular values = [5.656854, 2.828427]',
    'energy ratio = [0.8, 0.2]',
    'Frobenius error = 2.828427',
  ],
  pca: [
    'mean = [0.0, 0.0]',
    'explained ratio = [0.8, 0.2]',
    'elementwise RMSE = 1.0',
  ],
} as const

test('linear algebra route hands rank to least squares before spectral representation', () => {
  assert.deepEqual(linearAlgebraRouteModuleIds.slice(3), [
    'linear-algebra-rank-null-space',
    'least-squares-fitting',
    'eigenvalues-eigenvectors',
    'svd',
    'pca',
  ])
  assert.deepEqual(
    learningRouteById['linear-algebra-route'].chapterModuleIds,
    linearAlgebraRouteModuleIds,
  )
  const leastSquaresNavigation = routeNavigationForModule('linear-algebra-route', 'least-squares-fitting')
  assert.equal(leastSquaresNavigation?.displayOrder, 5)
  assert.equal(leastSquaresNavigation?.previousModuleId, 'linear-algebra-rank-null-space')
  assert.equal(leastSquaresNavigation?.nextModuleId, 'eigenvalues-eigenvectors')

  const svdNavigation = routeNavigationForModule('linear-algebra-route', 'svd')
  assert.equal(svdNavigation?.displayOrder, 7)
  assert.equal(svdNavigation?.previousModuleId, 'eigenvalues-eigenvectors')
  assert.equal(svdNavigation?.nextModuleId, 'pca')
})

test('four chapters reuse one centered matrix and publish reproducible NumPy outputs', () => {
  for (const chapterId of chapterIds) {
    const moduleDefinition = mathLabModuleRegistry[chapterId]
    const concept = moduleDefinition.concepts.find(({ id }) => id === codeConceptIds[chapterId])
    assert.ok(concept, `${chapterId} should expose its shared-data code concept`)
    assert.match(concept.codeExample ?? '', /\[-3\.0, -1\.0\]/)
    assert.match(concept.codeExample ?? '', /\[ 3\.0,  1\.0\]/)
    assert.match(concept.codeExample ?? '', /np\.isfinite/)
    assert.ok(concept.codeOutput?.['zh-CN'])
    assert.equal(concept.codeOutput['zh-CN'], concept.codeOutput.en)

    for (const anchor of outputAnchors[chapterId]) {
      assert.match(concept.codeOutput.en, new RegExp(anchor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
  }

  assert.match(
    mathLabModuleRegistry.svd.concepts.find(({ id }) => id === codeConceptIds.svd)?.codeOutput?.en ?? '',
    /rank-1 reconstruction = \[\[-2\.0, -2\.0\].*\[2\.0, 2\.0\]\]/,
  )
  assert.match(
    mathLabModuleRegistry.pca.concepts.find(({ id }) => id === codeConceptIds.pca)?.codeOutput?.en ?? '',
    /rank-1 reconstruction = \[\[-2\.0, -2\.0\].*\[2\.0, 2\.0\]\]/,
  )
})

test('runtime enhancements keep long lessons while removing review-question banks', () => {
  const reviewIds = {
    'least-squares-fitting': 'least-squares-fitting-review-questions',
    'eigenvalues-eigenvectors': 'eigenvalues-eigenvectors-review-questions',
    svd: 'svd-review-questions',
    pca: 'pca-review-questions',
  } as const
  const minimumMinutes = {
    'least-squares-fitting': 70,
    'eigenvalues-eigenvectors': 65,
    svd: 65,
    pca: 75,
  } as const

  for (const chapterId of chapterIds) {
    const moduleDefinition = mathLabModuleRegistry[chapterId]
    const sectionIds = moduleDefinition.sections.map(({ id }) => id)
    assert.equal(sectionIds.includes(reviewIds[chapterId]), false)
    assert.equal(moduleDefinition.estimatedMinutes, minimumMinutes[chapterId])
    assert.equal(moduleDefinition.toc.length, moduleDefinition.sections.length)
    assert.deepEqual(
      moduleDefinition.toc.map(({ id }) => id),
      sectionIds,
    )

    const visualIds = new Set(moduleDefinition.visuals.map(({ id }) => id))
    const labIds = new Set(moduleDefinition.labs.map(({ id }) => id))
    for (const lessonSection of moduleDefinition.sections) {
      assert.ok(lessonSection.title['zh-CN'])
      assert.ok(lessonSection.title.en)
      assert.ok(lessonSection.content['zh-CN'])
      assert.ok(lessonSection.content.en)
      for (const visualId of lessonSection.visualIds ?? []) assert.ok(visualIds.has(visualId))
      for (const labId of lessonSection.labIds ?? []) assert.ok(labIds.has(labId))
    }

    const newSections = moduleDefinition.sections.filter(({ id }) => id.startsWith('v3-'))
    assert.equal(newSections.length, chapterId === 'pca' ? 7 : 3)
    assert.doesNotMatch(
      newSections.map(({ title, content }) => `${title['zh-CN']}\n${content['zh-CN']}`).join('\n'),
      /证据/,
    )

    const html = renderMarkdownWithMath(newSections.map(({ content }) => content['zh-CN']).join('\n\n'))
    assert.match(html, /katex/)
    assert.doesNotMatch(html, /<script|onerror=|javascript:/i)
    assert.doesNotMatch(html, /\$\$/)
  }

  const root = new URL('../', import.meta.url)
  for (const sourceFile of [
    'leastSquaresModule.ts',
    'eigenvaluesModule.ts',
    'svdModule.ts',
    'pcaModule.ts',
  ]) {
    const source = readFileSync(new URL(`src/modules/math-lab/data/${sourceFile}`, root), 'utf8')
    assert.match(source, /review-questions/)
  }
})

test('chapter prerequisites state the intended conceptual handoffs', () => {
  assert.deepEqual(mathLabModuleRegistry['least-squares-fitting'].prerequisites, [
    'linear-algebra-feature-space',
    'linear-algebra-matrix-transformations',
  ])
  assert.deepEqual(mathLabModuleRegistry.svd.prerequisites, [
    'least-squares-fitting',
    'eigenvalues-eigenvectors',
    'linear-algebra-rank-null-space',
  ])
  assert.deepEqual(mathLabModuleRegistry.pca.prerequisites, [
    'svd',
    'least-squares-fitting',
    'eigenvalues-eigenvectors',
    'linear-algebra-rank-null-space',
  ])
  assert.ok(mathLabModuleRegistry['least-squares-fitting'].sourceReferences?.length)
})
