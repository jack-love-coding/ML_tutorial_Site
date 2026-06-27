import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog, curriculumModuleById } from '../src/curriculum/catalog.ts'
import {
  curriculumSpineRequiredModuleIds,
  curriculumSpineStages,
  curriculumSpineValidationIssues,
} from '../src/curriculum/spine.ts'

test('curriculum spine defines a data-first route to deep-learning intro', () => {
  assert.ok(curriculumSpineStages.length >= 10)
  assert.equal(curriculumSpineStages.at(0)?.id, 'orientation')

  const requiredIds = curriculumSpineRequiredModuleIds()
  assert.equal(requiredIds[0], 'ai-overview')
  assert.equal(requiredIds[1], 'python-notebook')
  assert.equal(requiredIds[2], 'numerical-data')
  assert.equal(requiredIds[3], 'categorical-data')
  assert.equal(requiredIds[4], 'dataset-quality')
  assert.ok(requiredIds.indexOf('numerical-data') < requiredIds.indexOf('beginner-linear-algebra'))
  assert.ok(requiredIds.indexOf('dataset-quality') < requiredIds.indexOf('linear-algebra-feature-space'))
  assert.ok(requiredIds.indexOf('cnn-visualization') < requiredIds.indexOf('sequence-embedding-bridge'))
  assert.ok(requiredIds.indexOf('sequence-embedding-bridge') < requiredIds.indexOf('attention-transformer'))
  assert.equal(requiredIds.at(-1), 'attention-transformer')
  assert.ok(!requiredIds.includes('llm-rag'), 'LLM/RAG should remain outside Spine V1')
})

test('curriculum spine keeps optimizer comparison required and projects as validation capstones', () => {
  const requiredIds = curriculumSpineRequiredModuleIds()
  assert.ok(requiredIds.includes('optimizer-comparison'))
  assert.ok(requiredIds.indexOf('optimizer-comparison') < requiredIds.indexOf('cnn-visualization'))
  assert.ok(requiredIds.indexOf('optimizer-comparison') < requiredIds.indexOf('sequence-embedding-bridge'))
  assert.ok(requiredIds.indexOf('optimizer-comparison') < requiredIds.indexOf('attention-transformer'))
  assert.ok(!requiredIds.includes('housing-price-project'))
  assert.ok(!requiredIds.includes('classification-project'))

  const projectIds = curriculumSpineStages.flatMap((stage) => stage.projectModuleIds ?? [])
  assert.deepEqual(projectIds, ['housing-price-project', 'classification-project'])
})

test('curriculum spine stage records are localized and reference existing modules', () => {
  const catalogIds = new Set(curriculumCatalog.map((moduleDefinition) => moduleDefinition.id))

  for (const stage of curriculumSpineStages) {
    assert.ok(stage.title['zh-CN'], `${stage.id} should have zh-CN title`)
    assert.ok(stage.title.en, `${stage.id} should have en title`)
    assert.ok(stage.learnerQuestion['zh-CN'], `${stage.id} should have zh-CN learner question`)
    assert.ok(stage.learnerQuestion.en, `${stage.id} should have en learner question`)
    assert.ok(stage.bridge?.['zh-CN'], `${stage.id} should have zh-CN bridge copy`)
    assert.ok(stage.bridge?.en, `${stage.id} should have en bridge copy`)
    assert.ok(
      stage.bridge['zh-CN'].length <= 120,
      `${stage.id} zh-CN bridge copy should stay concise`,
    )
    assert.ok(stage.bridge.en.length <= 180, `${stage.id} en bridge copy should stay concise`)
    assert.ok(stage.requiredModuleIds.length > 0, `${stage.id} should have required modules`)
    assert.ok(stage.outcomes.length > 0, `${stage.id} should describe outcomes`)

    for (const moduleId of [
      ...stage.requiredModuleIds,
      ...stage.supportModuleIds,
      ...(stage.projectModuleIds ?? []),
    ]) {
      assert.ok(catalogIds.has(moduleId), `${stage.id} references unknown module ${moduleId}`)
    }
  }

  assert.deepEqual(curriculumSpineValidationIssues(), [])
  assert.equal(curriculumModuleById.has('sequence-embedding-bridge'), true)
  assert.match(
    curriculumSpineStages.find((stage) => stage.id === 'sequence-attention')?.bridge.en ?? '',
    /\[B,T,H\].*attention/i,
    'sequence stage bridge should explain the handoff into attention',
  )
  assert.equal(
    Boolean(
      curriculumSpineStages
        .find((stage) => stage.id === 'sequence-attention')
        ?.knownGaps?.some((gap) => gap.en.includes('sequence/embedding bridge')),
    ),
    false,
    'filled sequence/embedding bridge should remove the old known gap',
  )
})
