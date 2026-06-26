import test from 'node:test'
import assert from 'node:assert/strict'
import { curriculumCatalog } from '../src/curriculum/catalog.ts'
import { validateCurriculumLocalization } from '../src/curriculum/validation.ts'

test('curriculum catalog exposes bilingual module and lesson copy', () => {
  assert.deepEqual(validateCurriculumLocalization(curriculumCatalog), [])

  for (const moduleDefinition of curriculumCatalog) {
    assert.ok(moduleDefinition.title['zh-CN'].trim().length > 0)
    assert.ok(moduleDefinition.title.en.trim().length > 0)
    assert.ok(moduleDefinition.summary['zh-CN'].trim().length > 0)
    assert.ok(moduleDefinition.summary.en.trim().length > 0)

    for (const lesson of moduleDefinition.lessons) {
      assert.ok(
        lesson.title['zh-CN'].trim().length > 0,
        `${moduleDefinition.id}/${lesson.id} needs zh-CN lesson title`,
      )
      assert.ok(lesson.title.en.trim().length > 0, `${moduleDefinition.id}/${lesson.id} needs en lesson title`)
      assert.ok(
        lesson.summary['zh-CN'].trim().length > 0,
        `${moduleDefinition.id}/${lesson.id} needs zh-CN lesson summary`,
      )
      assert.ok(
        lesson.summary.en.trim().length > 0,
        `${moduleDefinition.id}/${lesson.id} needs en lesson summary`,
      )
    }
  }
})

test('algorithm catalog titles resolve user-facing i18n messages', () => {
  const aiOverview = curriculumCatalog.find((moduleDefinition) => moduleDefinition.id === 'ai-overview')
  const gradientDescent = curriculumCatalog.find((moduleDefinition) => moduleDefinition.id === 'gradient-descent')

  assert.equal(aiOverview?.title['zh-CN'], 'AI 入门总览')
  assert.equal(aiOverview?.title.en, 'AI Overview')
  assert.equal(gradientDescent?.title['zh-CN'], '梯度下降')
  assert.equal(gradientDescent?.title.en, 'Gradient Descent')
})
