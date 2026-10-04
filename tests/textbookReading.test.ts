import test from 'node:test'
import assert from 'node:assert/strict'
import { teachingUnits, textbookReadings, textbookRouteId, expandReadingStep, readingContext, readingLocation, selectedReadingLessonIds, legacySpineUnitIds } from '../src/curriculum/reading.ts'
import { resolveCanonicalLearnRedirect } from '../src/curriculum/routes.ts'
import { pythonSyntaxBridge } from '../src/data/pythonSyntaxBridge.ts'

test('six units have bilingual guidance and only valid, unique selected lessons', () => {
  assert.equal(teachingUnits.length, 6)
  const seen = new Set<string>()
  for (const unit of teachingUnits) {
    for (const field of ['title', 'question', 'prerequisites', 'instructions', 'explanation'] as const) for (const language of ['zh-CN', 'en'] as const) assert.ok(unit[field][language].trim())
    for (const lesson of unit.readings.flatMap(step => expandReadingStep(step, unit.id))) {
      const key = `${lesson.moduleId}/${lesson.lessonId}`
      assert.ok(!seen.has(key), key)
      seen.add(key)
    }
    for (const step of unit.optional ?? []) assert.ok(expandReadingStep(step, unit.id).length)
  }
})
test('every previous and next link round-trips through canonical routes', () => {
  for (const [index, lesson] of textbookReadings.entries()) {
    const location = readingLocation(lesson)
    const context = readingContext(location.query.route, location.path, location.hash)
    assert.equal(context?.index, index)
    assert.equal(context?.previous, textbookReadings[index - 1])
    assert.equal(context?.next, textbookReadings[index + 1])
    const redirect = resolveCanonicalLearnRedirect(lesson.moduleId, lesson.lessonId)
    if (redirect) assert.equal(readingContext(textbookRouteId, redirect.path, redirect.hash)?.index, index)
  }
})
test('selected Python and regression loss chapters hand off into the next unit or bridge', () => {
  const python = readingContext(textbookRouteId, '/python/matplotlib-visualization')!
  assert.equal(python.next?.moduleId, 'splits-generalization')
  assert.equal(readingContext(textbookRouteId, '/learn/loss-functions/regression-losses')?.next?.moduleId, 'calculus-derivatives-local-change')
  assert.deepEqual(selectedReadingLessonIds(textbookRouteId, 'loss-functions', 'why-loss'), ['why-loss', 'regression-losses'])
  assert.ok(selectedReadingLessonIds(textbookRouteId, 'loss-functions', 'negative-log')?.includes('classification-losses'))
  assert.equal(readingContext('unknown', '/python/notebook-workflow'), undefined)
  assert.equal(readingContext(['core-learning-path'], '/python/notebook-workflow'), undefined)
  assert.equal(readingContext(textbookRouteId, '/python/seaborn-statistics'), undefined)
  assert.equal(selectedReadingLessonIds(undefined, 'loss-functions', 'why-loss'), undefined)
  assert.equal(Object.keys(legacySpineUnitIds).length, 12)
})
test('Python syntax bridge includes basic language constructs and expected outputs in both languages', () => {
  for (const language of ['zh-CN', 'en'] as const) {
    for (const token of ['counts[0]', 'len(counts)', 'import numpy as np', 'for count in counts:', 'if count >= 4:', 'def predict', '# 10', '# 12', 'NameError', 'TypeError', 'ModuleNotFoundError', 'Bike Sharing']) assert.ok(pythonSyntaxBridge[language].includes(token), token)
  }
})
