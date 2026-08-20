import test from 'node:test'
import assert from 'node:assert/strict'
import { aiFoundationCourse } from '../src/curriculum/courses/data/aiFoundation.ts'
import {
  courseProgressV1StorageKey,
  createDefaultCourseProgress,
  loadCourseProgress,
  saveCourseProgress,
  selectCourseContinueTarget,
  setCourseCriterionConfirmed,
  setCourseStepComplete,
  summarizeCourseUnitProgress,
  visitCourseUnit,
} from '../src/curriculum/courses/progress.ts'
import { createDefaultLearningProgressV2 } from '../src/curriculum/progress.ts'
import type { StorageLike } from '../src/utils/progressStorage.ts'

function memoryStorage(initial: Record<string, string> = {}): StorageLike & { data: Map<string, string> } {
  const data = new Map(Object.entries(initial))
  return {
    data,
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => { data.set(key, value) },
    removeItem: (key) => { data.delete(key) },
  }
}

const courseId = aiFoundationCourse.id
const firstUnit = aiFoundationCourse.units[0]

test('course progress uses one new storage key without changing legacy bytes', () => {
  const legacy = {
    'ml-atlas:algorithm-progress:v1': '{"raw":"algorithm"}',
    'ml-atlas:math-lab-progress:v1': '{broken-math',
    'ml-atlas:data-lab-progress:v1': 'raw-data-lab',
    'ml-atlas:learning-progress:v2': '{"raw":"v2"}',
  }
  const storage = memoryStorage(legacy)
  let progress = createDefaultCourseProgress('2026-08-20T00:00:00.000Z')
  progress = visitCourseUnit(progress, courseId, firstUnit.id, storage, '2026-08-20T01:00:00.000Z')
  assert.ok(storage.getItem(courseProgressV1StorageKey))
  for (const [key, value] of Object.entries(legacy)) assert.equal(storage.getItem(key), value)
  assert.equal(loadCourseProgress(storage).courses[courseId].lastVisitedUnitId, firstUnit.id)
})

test('course progress tolerates corrupted and unavailable local storage', () => {
  const corrupted = memoryStorage({ [courseProgressV1StorageKey]: '{not-json' })
  assert.deepEqual(loadCourseProgress(corrupted, 'fixed'), createDefaultCourseProgress('fixed'))
  const denied: StorageLike = {
    getItem: () => null,
    setItem: () => { throw new Error('denied') },
    removeItem: () => { throw new Error('denied') },
  }
  assert.doesNotThrow(() => saveCourseProgress(createDefaultCourseProgress(), denied))
})

test('unit status moves through the four states without locking content', () => {
  let progress = createDefaultCourseProgress('t0')
  assert.equal(summarizeCourseUnitProgress(firstUnit, progress).status, 'not-started')
  progress = visitCourseUnit(progress, courseId, firstUnit.id, undefined, 't1')
  assert.equal(summarizeCourseUnitProgress(firstUnit, progress).status, 'in-progress')
  for (const step of firstUnit.steps) {
    progress = setCourseStepComplete(progress, courseId, firstUnit.id, step.id, true, undefined, `s-${step.id}`)
  }
  assert.equal(summarizeCourseUnitProgress(firstUnit, progress).status, 'ready-for-self-check')
  for (const criterion of firstUnit.acceptanceCriteria) {
    progress = setCourseCriterionConfirmed(progress, courseId, firstUnit.id, criterion.id, true, undefined, `c-${criterion.id}`)
  }
  assert.equal(summarizeCourseUnitProgress(firstUnit, progress).status, 'completed')
})

test('existing module completion, correct checkpoints, and lab records aggregate without copying raw records', () => {
  const legacy = createDefaultLearningProgressV2('t0')
  legacy.modules['ai-overview'] = {
    moduleId: 'ai-overview', source: 'algorithm', completed: true,
    attempts: [{ id: 'attempt', source: 'algorithm', moduleId: 'ai-overview', quizId: 'q1', correct: true, attemptedAt: 't1', misconceptionTags: [] }],
  }
  legacy.labEvidence.push({
    id: 'lab', source: 'algorithm', moduleId: 'ai-overview', sourceId: 'lab-1', capturedAt: 't2',
    summary: { 'zh-CN': '结果', en: 'Result' }, metrics: [], prompt: { 'zh-CN': '观察', en: 'Observe' },
  })
  const summary = summarizeCourseUnitProgress(firstUnit, createDefaultCourseProgress(), legacy)
  assert.equal(summary.legacyModuleCount, 1)
  assert.equal(summary.correctCheckpointCount, 1)
  assert.equal(summary.labEvidenceCount, 1)
  assert.ok(summary.completedStepCount >= 3)
  assert.equal(JSON.stringify(createDefaultCourseProgress()).includes('attempt'), false)
})

test('continue selection prefers last unit, then related legacy module, then first published incomplete unit', () => {
  const empty = createDefaultCourseProgress('t0')
  assert.equal(selectCourseContinueTarget(empty)?.unitId, '01-ai-map-python')

  const legacy = createDefaultLearningProgressV2('t0')
  legacy.lastVisited = { moduleId: 'dataset-quality', source: 'data-lab', route: '/data-lab/modules/dataset-quality', visitedAt: 't1' }
  assert.equal(selectCourseContinueTarget(empty, legacy)?.unitId, '04-pandas-inspection')
  assert.equal(selectCourseContinueTarget(empty, legacy)?.reason, 'related-module')

  const visited = visitCourseUnit(empty, courseId, '02-python-functions-debugging', undefined, 't2')
  assert.equal(selectCourseContinueTarget(visited, legacy)?.unitId, '02-python-functions-debugging')
  assert.equal(selectCourseContinueTarget(visited, legacy)?.reason, 'last-visited')
})
