import test from 'node:test'
import assert from 'node:assert/strict'
import { dataLabModules } from '../src/modules/data-lab/data/modules.ts'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import {
  curriculumCatalog,
  curriculumModuleById,
  curriculumModulesBySource,
} from '../src/curriculum/catalog.ts'
import { validateUniqueCurriculumIds } from '../src/curriculum/validation.ts'

const expectedAlgorithmSlugs = [
  'ai-overview',
  'python-notebook',
  'housing-price-project',
  'classification-project',
  'model-selection',
  'tree-forest',
  'cnn-visualization',
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

test('curriculum catalog adapts every existing module exactly once', () => {
  const expectedCount = expectedAlgorithmSlugs.length + mathLabModules.length + dataLabModules.length

  assert.equal(curriculumCatalog.length, expectedCount)
  assert.deepEqual(validateUniqueCurriculumIds(curriculumCatalog), [])
  assert.equal(curriculumModuleById.size, expectedCount)

  for (const slug of expectedAlgorithmSlugs) {
    const adapted = curriculumModulesBySource.algorithm.get(slug)
    assert.ok(adapted, `${slug} should map from algorithm source`)
    assert.equal(curriculumModuleById.get(adapted.id), adapted)
  }

  for (const moduleDefinition of mathLabModules) {
    const adapted = curriculumModulesBySource.mathLab.get(moduleDefinition.id)
    assert.ok(adapted, `${moduleDefinition.id} should map from math lab source`)
    assert.equal(curriculumModuleById.get(adapted.id), adapted)
  }

  for (const moduleDefinition of dataLabModules) {
    const adapted = curriculumModulesBySource.dataLab.get(moduleDefinition.id)
    assert.ok(adapted, `${moduleDefinition.id} should map from data lab source`)
    assert.equal(curriculumModuleById.get(adapted.id), adapted)
  }
})

test('catalog records route, source namespace, lessons, and outcomes for every module', () => {
  for (const moduleDefinition of curriculumCatalog) {
    assert.ok(moduleDefinition.route.startsWith('/'), `${moduleDefinition.id} needs a public route`)
    assert.match(moduleDefinition.source.namespace, /^(algorithm|math-lab|data-lab)$/)
    assert.ok(moduleDefinition.source.id.length > 0)
    assert.ok(moduleDefinition.estimatedMinutes > 0, `${moduleDefinition.id} needs estimated minutes`)
    assert.ok(moduleDefinition.lessons.length > 0, `${moduleDefinition.id} needs at least one lesson`)
    assert.ok(moduleDefinition.outcomeIds.length > 0, `${moduleDefinition.id} needs outcome IDs`)
  }
})
