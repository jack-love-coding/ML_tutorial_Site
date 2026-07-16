import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { algorithmCheckpointsBySlug } from '../src/data/algorithmCheckpoints.ts'
import { buildAlgorithmQuizAttempt } from '../src/utils/algorithmQuiz.ts'
import {
  algorithmProgressStorageKey,
  appendAlgorithmQuizAttempt,
  loadAlgorithmProgress,
  saveAlgorithmProgress,
} from '../src/utils/algorithmProgress.ts'
import { resolvePythonDataToolsChapter } from '../src/utils/pythonDataToolsRoutes.ts'

class MemoryStorage {
  data: Record<string, string>

  constructor(data: Record<string, string>) {
    this.data = { ...data }
  }

  getItem(key: string) { return this.data[key] ?? null }
  setItem(key: string, value: string) { this.data[key] = value }
  removeItem(key: string) { delete this.data[key] }
}

test('legacy Python attempts remain an unchanged prefix through redirects, new submissions, and reload', () => {
  const oldAttempts = [
    {
      quizId: 'python-notebook-array-shape',
      moduleSlug: 'python-notebook' as const,
      selected: 'samples-features',
      correct: true,
      misconceptionTags: [],
      createdAt: '2026-07-01T00:00:00.000Z',
    },
    {
      quizId: 'python-notebook-sklearn-split',
      moduleSlug: 'python-notebook' as const,
      selected: 'fit-first',
      correct: false,
      misconceptionTags: ['split-after-fit'],
      createdAt: '2026-07-01T00:01:00.000Z',
    },
  ]
  const oldPrefixBytes = oldAttempts.map((attempt) => JSON.stringify(attempt))
  const storage = new MemoryStorage({
    [algorithmProgressStorageKey]: JSON.stringify({
      completedModuleSlugs: [],
      quizAttempts: oldAttempts,
      lastVisitedModuleSlug: 'python-notebook',
      updatedAt: '2026-07-01T00:01:00.000Z',
    }),
  })

  assert.deepEqual(resolvePythonDataToolsChapter('numpy-arrays'), {
    kind: 'legacy',
    id: 'numpy-foundations',
  })
  assert.deepEqual(resolvePythonDataToolsChapter('sklearn-small-model'), {
    kind: 'legacy',
    id: 'pandas-analysis',
  })

  let progress = loadAlgorithmProgress(storage)
  const oldPrefix = structuredClone(progress.quizAttempts)
  for (const checkpoint of algorithmCheckpointsBySlug['python-notebook']) {
    progress = appendAlgorithmQuizAttempt(
      progress,
      buildAlgorithmQuizAttempt(
        'python-notebook',
        checkpoint,
        checkpoint.answer,
        `2026-07-02T00:0${progress.quizAttempts.length}:00.000Z`,
      ),
    )
  }
  saveAlgorithmProgress(progress, storage)

  const reloaded = loadAlgorithmProgress(storage)
  assert.deepEqual(reloaded.quizAttempts.slice(0, oldPrefix.length), oldPrefix)
  assert.deepEqual(
    reloaded.quizAttempts.slice(0, oldPrefix.length).map((attempt) => JSON.stringify(attempt)),
    oldPrefixBytes,
  )
  assert.deepEqual(reloaded.quizAttempts.slice(oldPrefix.length).map(({ quizId }) => quizId), [
    'python-data-tools-grouped-analysis-interpretation',
    'python-data-tools-correlation-not-causation',
  ])
})

test('the V1 progress loader keeps stored attempts without a current-checkpoint allowlist', () => {
  const source = readFileSync(new URL('../src/utils/algorithmProgress.ts', import.meta.url), 'utf8')
  const loaderSource = source.slice(
    source.indexOf('export function loadAlgorithmProgress'),
    source.indexOf('export function saveAlgorithmProgress'),
  )

  assert.equal(algorithmProgressStorageKey, 'ml-atlas:algorithm-progress:v1')
  assert.match(loaderSource, /quizAttempts:\s*parsed\.quizAttempts \?\? \[\]/)
  assert.doesNotMatch(loaderSource, /\.filter\(|algorithmCheckpointsBySlug|python-data-tools-/)
})
