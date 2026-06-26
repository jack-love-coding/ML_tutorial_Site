import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { algorithmProgressStorageKey } from '../src/utils/algorithmProgress.ts'
import { mathLabProgressStorageKey } from '../src/modules/math-lab/utils/progress.ts'
import { dataLabProgressStorageKey } from '../src/modules/data-lab/utils/progress.ts'
import {
  createDefaultLearningProgressV2,
  learningProgressV2MigrationKey,
  learningProgressV2StorageKey,
  loadLearningProgressV2,
  migrateLearningProgressV2,
  selectContinueLearning,
  type LearningProgressV2,
} from '../src/curriculum/progress.ts'

class MemoryStorage {
  private values = new Map<string, string>()

  constructor(initial: Record<string, string> = {}) {
    for (const [key, value] of Object.entries(initial)) {
      this.values.set(key, value)
    }
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  dump() {
    return Object.fromEntries(this.values)
  }
}

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function json(value: unknown) {
  return JSON.stringify(value)
}

test('progress v2 migration handles missing stores and writes a marker', () => {
  const storage = new MemoryStorage()
  const progress = migrateLearningProgressV2(storage, '2026-06-25T00:00:00.000Z')

  assert.equal(progress.schemaVersion, 1)
  assert.deepEqual(progress.modules, {})
  assert.equal(storage.getItem(algorithmProgressStorageKey), null)
  assert.equal(storage.getItem(mathLabProgressStorageKey), null)
  assert.equal(storage.getItem(dataLabProgressStorageKey), null)
  assert.ok(storage.getItem(learningProgressV2StorageKey))
  assert.ok(storage.getItem(learningProgressV2MigrationKey))
})

test('progress v2 migration merges algorithm, math lab, and data lab v1 stores', () => {
  const algorithmRaw = json({
    completedModuleSlugs: ['loss-functions'],
    lastVisitedModuleSlug: 'gradient-descent',
    quizAttempts: [
      {
        quizId: 'loss-rule',
        moduleSlug: 'loss-functions',
        selected: 'rule',
        correct: true,
        misconceptionTags: ['loss-vs-error'],
        attemptedAt: '2026-06-20T08:00:00.000Z',
      },
    ],
    updatedAt: '2026-06-20T09:00:00.000Z',
  })
  const mathRaw = json({
    completedModuleIds: ['beginner-linear-algebra'],
    lastVisitedModuleId: 'beginner-linear-algebra',
    weakConceptTags: ['vectors'],
    quizAttempts: [
      {
        quizId: 'vector-check',
        moduleId: 'beginner-linear-algebra',
        selected: 'dot',
        correct: false,
        misconceptionTags: ['dot-product'],
        attemptedAt: '2026-06-21T08:00:00.000Z',
      },
    ],
    mastery: [],
    updatedAt: '2026-06-21T09:00:00.000Z',
  })
  const dataRaw = json({
    completedModuleIds: ['numerical-data'],
    lastVisitedModuleId: 'numerical-data',
    quizAttempts: [
      {
        quizId: 'numeric-columns',
        moduleId: 'numerical-data',
        selected: 'scale',
        correct: true,
        attemptedAt: '2026-06-22T08:00:00.000Z',
      },
    ],
    updatedAt: '2026-06-22T09:00:00.000Z',
  })
  const storage = new MemoryStorage({
    [algorithmProgressStorageKey]: algorithmRaw,
    [mathLabProgressStorageKey]: mathRaw,
    [dataLabProgressStorageKey]: dataRaw,
  })

  const progress = migrateLearningProgressV2(storage, '2026-06-25T00:00:00.000Z')

  assert.equal(progress.modules['loss-functions']?.completed, true)
  assert.equal(progress.modules['beginner-linear-algebra']?.completed, true)
  assert.equal(progress.modules['numerical-data']?.completed, true)
  assert.equal(progress.modules['gradient-descent']?.lastVisitedAt, '2026-06-20T09:00:00.000Z')
  assert.equal(progress.lastVisited?.moduleId, 'numerical-data')
  assert.deepEqual(progress.weakConceptTags, ['vectors'])
  assert.equal(progress.modules['loss-functions']?.attempts[0]?.source, 'algorithm')
  assert.equal(progress.modules['beginner-linear-algebra']?.attempts[0]?.source, 'math-lab')
  assert.equal(progress.modules['numerical-data']?.attempts[0]?.source, 'data-lab')
  assert.equal(storage.getItem(algorithmProgressStorageKey), algorithmRaw)
  assert.equal(storage.getItem(mathLabProgressStorageKey), mathRaw)
  assert.equal(storage.getItem(dataLabProgressStorageKey), dataRaw)
})

test('progress v2 migration is idempotent when v1 input does not change', () => {
  const storage = new MemoryStorage({
    [algorithmProgressStorageKey]: json({
      completedModuleSlugs: ['ai-overview'],
      quizAttempts: [],
      lastVisitedModuleSlug: 'ai-overview',
      updatedAt: '2026-06-20T09:00:00.000Z',
    }),
  })

  const first = migrateLearningProgressV2(storage, '2026-06-25T00:00:00.000Z')
  const firstStored = storage.getItem(learningProgressV2StorageKey)
  const second = migrateLearningProgressV2(storage, '2026-07-01T00:00:00.000Z')

  assert.deepEqual(second, first)
  assert.equal(storage.getItem(learningProgressV2StorageKey), firstStored)
})

test('progress v2 migration tolerates corrupted v1 json and preserves raw data', () => {
  const storage = new MemoryStorage({
    [algorithmProgressStorageKey]: '{bad json',
    [mathLabProgressStorageKey]: 'null',
    [dataLabProgressStorageKey]: '[',
  })

  const progress = migrateLearningProgressV2(storage, '2026-06-25T00:00:00.000Z')

  assert.deepEqual(progress.modules, {})
  assert.equal(storage.getItem(algorithmProgressStorageKey), '{bad json')
  assert.equal(storage.getItem(mathLabProgressStorageKey), 'null')
  assert.equal(storage.getItem(dataLabProgressStorageKey), '[')
})

test('progress v2 migration keeps completed status and de-duplicates attempts during conflicts', () => {
  const existing: LearningProgressV2 = {
    schemaVersion: 1,
    modules: {
      'loss-functions': {
        moduleId: 'loss-functions',
        source: 'algorithm',
        completed: false,
        attempts: [
          {
            id: 'algorithm:loss-functions:loss-rule:2026-06-20T08:00:00.000Z',
            source: 'algorithm',
            moduleId: 'loss-functions',
            quizId: 'loss-rule',
            correct: true,
            attemptedAt: '2026-06-20T08:00:00.000Z',
            misconceptionTags: [],
          },
        ],
      },
    },
    weakConceptTags: [],
    updatedAt: '2026-06-20T10:00:00.000Z',
  }
  const storage = new MemoryStorage({
    [learningProgressV2StorageKey]: json(existing),
    [algorithmProgressStorageKey]: json({
      completedModuleSlugs: ['loss-functions'],
      quizAttempts: [
        {
          quizId: 'loss-rule',
          moduleSlug: 'loss-functions',
          selected: 'rule',
          correct: true,
          misconceptionTags: [],
          attemptedAt: '2026-06-20T08:00:00.000Z',
        },
      ],
      updatedAt: '2026-06-21T00:00:00.000Z',
    }),
  })

  const progress = migrateLearningProgressV2(storage, '2026-06-25T00:00:00.000Z')

  assert.equal(progress.modules['loss-functions']?.completed, true)
  assert.equal(progress.modules['loss-functions']?.attempts.length, 1)
})

test('continue-learning selects unfinished last visited module before first incomplete core lesson', () => {
  const progress = createDefaultLearningProgressV2('2026-06-25T00:00:00.000Z')
  progress.modules['ai-overview'] = {
    moduleId: 'ai-overview',
    source: 'algorithm',
    completed: true,
    attempts: [],
  }
  progress.modules['beginner-linear-algebra'] = {
    moduleId: 'beginner-linear-algebra',
    source: 'math-lab',
    completed: true,
    attempts: [],
  }
  progress.modules['gradient-descent'] = {
    moduleId: 'gradient-descent',
    source: 'algorithm',
    completed: false,
    attempts: [],
    lastVisitedAt: '2026-06-24T00:00:00.000Z',
  }
  progress.lastVisited = {
    moduleId: 'gradient-descent',
    source: 'algorithm',
    route: '/learn/gradient-descent',
    visitedAt: '2026-06-24T00:00:00.000Z',
  }

  const next = selectContinueLearning(progress)

  assert.equal(next?.moduleId, 'gradient-descent')
  assert.equal(next?.lessonId, 'loss-function')
  assert.equal(next?.route, '/learn/gradient-descent/loss-function')
  assert.equal(next?.reason, 'last-visited')
})

test('continue-learning falls back to the first incomplete core path module', () => {
  const progress = createDefaultLearningProgressV2('2026-06-25T00:00:00.000Z')
  for (const moduleId of ['ai-overview', 'beginner-linear-algebra', 'numerical-data', 'loss-functions']) {
    progress.modules[moduleId] = {
      moduleId,
      source: moduleId === 'beginner-linear-algebra' ? 'math-lab' : moduleId === 'numerical-data' ? 'data-lab' : 'algorithm',
      completed: true,
      attempts: [],
    }
  }

  const next = selectContinueLearning(progress)

  assert.equal(next?.moduleId, 'linear-regression')
  assert.equal(next?.lessonId, 'fit-line')
  assert.equal(next?.route, '/learn/linear-regression/fit-line')
  assert.equal(next?.reason, 'first-incomplete')
})

test('progress v2 source stays isolated from v1 progress storage helpers', () => {
  const progressSource = read('src/curriculum/progress.ts')

  assert.match(progressSource, /learningProgressV2StorageKey/)
  assert.match(progressSource, /learningProgressV2MigrationKey/)
  assert.doesNotMatch(progressSource, /clearAlgorithmProgress/)
  assert.doesNotMatch(progressSource, /clearMathLabProgress/)
  assert.doesNotMatch(progressSource, /clearDataLabProgress/)
})

test('progress route reads progress v2 and renders a continue-learning target', () => {
  const progressViewSource = read('src/views/CurriculumProgressView.vue')

  assert.match(progressViewSource, /migrateLearningProgressV2/)
  assert.match(progressViewSource, /selectContinueLearning/)
  assert.match(progressViewSource, /continueTarget/)
  assert.match(progressViewSource, /completedCount/)
  assert.doesNotMatch(progressViewSource, /Progress is moving onto the new curriculum route/)
})
