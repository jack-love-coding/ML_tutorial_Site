import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import {
  curriculumRoleByModuleId,
  curriculumRoles,
  curriculumRoleForModule,
  validateCurriculumRoleCoverage,
} from '../src/curriculum/roles.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('curriculum roles classify every catalog module exactly once', () => {
  assert.equal(curriculumRoleByModuleId.size, curriculumCatalog.length)
  assert.deepEqual(validateCurriculumRoleCoverage(), [])

  for (const moduleDefinition of curriculumCatalog) {
    const role = curriculumRoleForModule(moduleDefinition.id)
    assert.ok(role, `${moduleDefinition.id} should have a curriculum role`)
    assert.equal(role.moduleId, moduleDefinition.id)
    assert.ok(role.label['zh-CN'].trim().length > 0)
    assert.ok(role.label.en.trim().length > 0)
  }
})

test('curriculum roles separate core, support, project, advanced, reference, and overlap modules', () => {
  assert.equal(curriculumRoleForModule('ai-overview')?.role, 'required-core')
  assert.equal(curriculumRoleForModule('linear-algebra-distance-similarity')?.role, 'just-in-time-support')
  assert.equal(curriculumRoleForModule('housing-price-project')?.role, 'project-validation')
  assert.equal(curriculumRoleForModule('llm-rag')?.role, 'advanced-extension')
  assert.equal(curriculumRoleForModule('taylor-series')?.role, 'reference-library')
  assert.equal(curriculumRoleForModule('calculus-optimizer-comparison')?.role, 'duplicate-or-overlap')

  assert.deepEqual(
    curriculumRoles.filter((entry) => entry.role === 'required-core').map((entry) => entry.moduleId),
    [
      'ai-overview',
      'python-notebook',
      'numerical-data',
      'categorical-data',
      'dataset-quality',
      'beginner-linear-algebra',
      'linear-algebra-feature-space',
      'loss-functions',
      'linear-regression',
      'gradient-descent',
      'logistic-regression',
      'beginner-probability-distributions',
      'probability-likelihood-entropy',
      'classification',
      'splits-generalization',
      'model-selection',
      'complexity-regularization',
      'tree-forest',
      'mlp',
      'optimizer-comparison',
      'tensor-shapes-vectorization',
      'cnn-visualization',
      'sequence-embedding-bridge',
      'attention-transformer',
    ],
  )
})

test('topic library renders curriculum role context for module cards', () => {
  const source = read('src/views/CurriculumLibraryView.vue')

  assert.match(source, /curriculumRoleForModule/)
  assert.match(source, /roleLabel/)
  assert.match(source, /curriculum-module-card__role/)
})

test('legacy algorithm order no longer places projects or advanced modules before foundations', () => {
  const source = read('src/data/moduleCatalog.ts')
  const orderStart = source.indexOf('export const moduleOrder')
  const registryStart = source.indexOf('export const moduleRegistry')
  assert.ok(orderStart >= 0, 'moduleOrder should be exported')
  assert.ok(registryStart > orderStart, 'moduleRegistry should follow moduleOrder')
  const moduleOrderSource = source.slice(orderStart, registryStart)
  const indexOf = (token: string) => {
    const index = moduleOrderSource.indexOf(token)
    assert.ok(index >= 0, `${token} should exist in moduleCatalog.ts`)
    return index
  }

  assert.ok(indexOf('lossFunctionsModule') < indexOf('housingPriceProjectModule'))
  assert.ok(indexOf('linearRegressionModule') < indexOf('housingPriceProjectModule'))
  assert.ok(indexOf('classificationModule') < indexOf('classificationProjectModule'))
  assert.ok(indexOf('optimizerComparisonModule') < indexOf('cnnVisualizationModule'))
  assert.ok(indexOf('attentionTransformerModule') < indexOf('llmRagModule'))
})
