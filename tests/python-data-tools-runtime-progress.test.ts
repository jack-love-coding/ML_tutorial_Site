import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  algorithmProgressStorageKey,
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

test('legacy Python attempts remain unchanged through redirects and reload', () => {
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

  const progress = loadAlgorithmProgress(storage)
  const oldPrefix = structuredClone(progress.quizAttempts)
  saveAlgorithmProgress(progress, storage)

  const reloaded = loadAlgorithmProgress(storage)
  assert.deepEqual(reloaded.quizAttempts, oldPrefix)
  assert.deepEqual(
    reloaded.quizAttempts.slice(0, oldPrefix.length).map((attempt) => JSON.stringify(attempt)),
    oldPrefixBytes,
  )
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
