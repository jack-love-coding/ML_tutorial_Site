import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog, curriculumModuleById } from '../src/curriculum/catalog.ts'
import {
  curriculumSpineRequiredModuleIds,
  curriculumSpineStages,
  curriculumSpineValidationIssues,
} from '../src/curriculum/spine.ts'

test('textbook spine keeps foundations before models and advanced topics in the library', () => {
  assert.equal(curriculumSpineStages.length, 6)
  const ids = curriculumSpineRequiredModuleIds()
  assert.equal(ids[0], 'ai-overview')
  assert.ok(ids.indexOf('splits-generalization') < ids.indexOf('dataset-quality'))
  assert.ok(ids.indexOf('gradient-descent') < ids.indexOf('linear-regression'))
  assert.ok(ids.indexOf('beginner-probability-distributions') < ids.indexOf('logistic-regression'))
  assert.equal(ids.at(-1), 'classification-project')
  assert.ok(!ids.includes('mlp'))
  assert.ok(curriculumModuleById.has('mlp'))
  assert.deepEqual(curriculumSpineValidationIssues(), [])
  for (const stage of curriculumSpineStages) for (const locale of ['zh-CN', 'en'] as const) {
    assert.ok(stage.title[locale] && stage.learnerQuestion[locale] && stage.bridge[locale])
  }
})
