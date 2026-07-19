import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mathToCodeModules } from '../src/modules/math-lab/data/mathToCode/modules.ts'
import {
  mathLabModuleProviderById,
  mathLabModuleRegistry,
} from '../src/modules/math-lab/data/modules.ts'
import {
  learningRouteById,
  linearAlgebraRouteModuleIds,
  routeNavigationForModule,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const fourChapterIds = [
  'linear-algebra-feature-space',
  'linear-algebra-distance-similarity',
  'linear-algebra-matrix-transformations',
  'linear-algebra-rank-null-space',
] as const

test('vector and matrix language keeps the approved four-chapter route order', () => {
  assert.deepEqual(linearAlgebraRouteModuleIds.slice(0, 4), fourChapterIds)
  assert.deepEqual(learningRouteById['linear-algebra-route'].chapterModuleIds.slice(0, 4), fourChapterIds)
  assert.deepEqual(routeNavigationForModule('linear-algebra-route', fourChapterIds[1]), {
    routeId: 'linear-algebra-route',
    displayOrder: 2,
    effectivePrerequisiteIds: undefined,
    entryAssumptions: undefined,
    previousModuleId: fourChapterIds[0],
    nextModuleId: fourChapterIds[2],
  })
  assert.equal(mathLabModuleProviderById[fourChapterIds[0]], 'mathToCodeModules')
  assert.equal(mathLabModuleProviderById[fourChapterIds[1]], 'linearAlgebraRouteModules')
  assert.equal(mathLabModuleProviderById[fourChapterIds[2]], 'mathToCodeModules')
  assert.equal(mathLabModuleProviderById[fourChapterIds[3]], 'linearAlgebraRouteModules')
})

test('all four runtime chapters share one profile case and publish exact NumPy output', () => {
  const expectedOutputs: Record<(typeof fourChapterIds)[number], RegExp[]> = {
    'linear-algebra-feature-space': [
      /profiles\.shape = \(3, 3\)/,
      /nearby - query = \[0\.0, 0\.0, 1\.0\]/,
    ],
    'linear-algebra-distance-similarity': [
      /same_direction distance = 2\.236068 cosine = 1\.0/,
      /nearby distance = 1\.0 cosine = 0\.912871/,
    ],
    'linear-algebra-matrix-transformations': [
      /first contributions = \[1\.2, 0\.3, 0\.0\]/,
      /scores = \[1\.7, 3\.2, 1\.8\]/,
    ],
    'linear-algebra-rank-null-space': [
      /rank = 2/,
      /W @ null_direction = \[0\.0, 0\.0\]/,
      /query output = \[4\.0, 0\.0\][\s\S]*shifted output = \[4\.0, 0\.0\]/,
    ],
  }

  for (const id of fourChapterIds) {
    const moduleDefinition = mathLabModuleRegistry[id]
    assert.ok(moduleDefinition, `${id} should be registered`)
    const codeConcept = moduleDefinition.concepts.find(({ codeExample, codeOutput }) => codeExample && codeOutput)
    assert.ok(codeConcept?.codeExample, `${id} needs runnable NumPy code`)
    assert.ok(codeConcept.codeOutput, `${id} needs pasted reference output`)
    assert.match(codeConcept.codeExample, /import numpy as np/)
    for (const pattern of expectedOutputs[id]) assert.match(codeConcept.codeOutput.en, pattern)

    const body = moduleDefinition.sections
      .flatMap(({ content }) => [content['zh-CN'], content.en])
      .join('\n')
    assert.match(body, /\[2,\s?1,\s?0\]/, `${id} should preserve the shared query profile`)
  }
})

test('runtime chapters keep detailed teaching, remove exercise banks, and preserve source manuscripts', () => {
  const expectedRuntimeSections: Record<(typeof fourChapterIds)[number], readonly string[]> = {
    'linear-algebra-feature-space': ['v3-vector-shared-profiles', 'v3-vector-units-scaling', 'v3-vector-summary'],
    'linear-algebra-distance-similarity': ['v3-distance-calculation-ledger', 'v3-distance-application-boundaries', 'v3-distance-failure-checklist'],
    'linear-algebra-matrix-transformations': ['v3-matrix-shared-batch', 'v3-matrix-row-column-readings', 'v3-matrix-summary'],
    'linear-algebra-rank-null-space': ['v3-rank-column-ledger', 'v3-rank-one-comparison', 'v3-rank-application-boundaries'],
  }

  for (const id of fourChapterIds) {
    const moduleDefinition = mathLabModuleRegistry[id]
    const sectionIds = new Set(moduleDefinition.sections.map(({ id: sectionId }) => sectionId))
    for (const sectionId of expectedRuntimeSections[id]) assert.ok(sectionIds.has(sectionId), `${id}/${sectionId}`)
    assert.ok(moduleDefinition.sections.length >= 12, `${id} needs a full teaching sequence`)
    assert.equal(moduleDefinition.toc.length, moduleDefinition.sections.length)
  }

  assert.equal(mathLabModuleRegistry[fourChapterIds[0]].sections.some(({ id }) => id === 'vectors-practice' || id === 'vectors-handoff'), false)
  assert.equal(mathLabModuleRegistry[fourChapterIds[2]].sections.some(({ id }) => id === 'matrices-practice' || id === 'matrices-handoff'), false)

  const rawFeature = mathToCodeModules.find(({ id }) => id === fourChapterIds[0])!
  const rawMatrix = mathToCodeModules.find(({ id }) => id === fourChapterIds[2])!
  assert.ok(rawFeature.sections.some(({ id }) => id === 'vectors-practice'))
  assert.ok(rawFeature.sections.some(({ id }) => id === 'vectors-handoff'))
  assert.ok(rawMatrix.sections.some(({ id }) => id === 'matrices-practice'))
  assert.ok(rawMatrix.sections.some(({ id }) => id === 'matrices-handoff'))
})

test('all referenced visuals, labs, local files, and bilingual Markdown are valid', () => {
  const componentNames = new Set<string>()

  for (const id of fourChapterIds) {
    const moduleDefinition = mathLabModuleRegistry[id]
    const visualIds = new Set(moduleDefinition.visuals.map(({ id: visualId }) => visualId))
    const labIds = new Set(moduleDefinition.labs.map(({ id: labId }) => labId))

    for (const visual of moduleDefinition.visuals) {
      assert.ok(visual.transcript['zh-CN'].trim() && visual.transcript.en.trim(), `${id}/${visual.id} transcript`)
      assert.ok(visual.alt?.['zh-CN'].trim() && visual.alt.en.trim(), `${id}/${visual.id} alt`)
      if (visual.assetPath) {
        assert.equal(existsSync(new URL(`../public${visual.assetPath}`, import.meta.url)), true, visual.assetPath)
      }
      if (visual.posterPath) {
        assert.equal(existsSync(new URL(`../public${visual.posterPath}`, import.meta.url)), true, visual.posterPath)
      }
    }
    for (const lab of moduleDefinition.labs) componentNames.add(lab.componentName)

    for (const section of moduleDefinition.sections) {
      for (const visualId of section.visualIds ?? []) assert.ok(visualIds.has(visualId), `${id}/${section.id}/${visualId}`)
      for (const labId of section.labIds ?? []) assert.ok(labIds.has(labId), `${id}/${section.id}/${labId}`)
      for (const locale of ['zh-CN', 'en'] as const) {
        assert.ok(section.title[locale].trim() && section.content[locale].trim(), `${id}/${section.id}/${locale}`)
        const html = renderMarkdownWithMath(section.content[locale])
        assert.doesNotMatch(html, /katex-error|<script|<iframe|javascript:|onerror\s*=|onclick\s*=/i)
        assert.doesNotMatch(html, /\$\$/)
      }
    }
  }

  assert.deepEqual(componentNames, new Set([
    'FeatureVectorStoryLab',
    'VectorSimilarityLab',
    'MathToCodeMatrixLab',
    'MatrixColumnSpaceLab',
  ]))
  assert.equal(
    existsSync(new URL('../docs/curriculum/v3/vector-matrix-language-four-chapter-contract.md', import.meta.url)),
    true,
  )
})
