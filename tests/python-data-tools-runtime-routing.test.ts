import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import { pythonDataToolsContract } from '../src/data/pythonNotebookContract.ts'

const resolverUrl = new URL('../src/utils/pythonDataToolsRoutes.ts', import.meta.url)

const expectedLegacyMap = {
  'notebook-rhythm': 'notebook-workflow',
  'numpy-arrays': 'numpy-foundations',
  'pandas-tables': 'pandas-structures',
  'sklearn-small-model': 'pandas-analysis',
  'reproducible-handoff': 'analysis-report',
} as const

async function loadResolver() {
  assert.ok(
    existsSync(resolverUrl),
    'pythonDataToolsRoutes.ts should exist before the compatibility resolver can be used',
  )
  return import('../src/utils/pythonDataToolsRoutes.ts')
}

test('Python Data Tools resolves the five legacy chapter IDs to locked canonical IDs', async () => {
  const { legacyPythonDataToolsChapterMap, resolvePythonDataToolsChapter } = await loadResolver()

  assert.deepEqual(legacyPythonDataToolsChapterMap, expectedLegacyMap)
  for (const [legacyId, canonicalId] of Object.entries(expectedLegacyMap)) {
    assert.deepEqual(resolvePythonDataToolsChapter(legacyId), {
      kind: 'legacy',
      id: canonicalId,
    })
  }
})

test('Python Data Tools keeps every current contract chapter ID unchanged', async () => {
  const { resolvePythonDataToolsChapter } = await loadResolver()

  for (const { id } of pythonDataToolsContract.chapters) {
    assert.deepEqual(resolvePythonDataToolsChapter(id), { kind: 'current', id })
  }
})

test('Python Data Tools falls back from empty and unknown IDs to the first contract chapter', async () => {
  const { resolvePythonDataToolsChapter } = await loadResolver()
  const firstChapterId = pythonDataToolsContract.chapters[0].id

  assert.deepEqual(resolvePythonDataToolsChapter(''), {
    kind: 'unknown',
    id: firstChapterId,
  })
  assert.deepEqual(resolvePythonDataToolsChapter('does-not-exist'), {
    kind: 'unknown',
    id: firstChapterId,
  })
})

test('Python Data Tools resolution is stable for repeated and concurrent calls', async () => {
  const { resolvePythonDataToolsChapter } = await loadResolver()
  const inputs = [
    ...Object.keys(expectedLegacyMap),
    ...pythonDataToolsContract.chapters.map(({ id }) => id),
    '',
    'does-not-exist',
  ]
  const firstPass = inputs.map(resolvePythonDataToolsChapter)

  assert.deepEqual(inputs.map(resolvePythonDataToolsChapter), firstPass)
  assert.deepEqual(
    await Promise.all(inputs.map(async (id) => resolvePythonDataToolsChapter(id))),
    firstPass,
  )

  for (const result of firstPass) {
    assert.deepEqual(resolvePythonDataToolsChapter(result.id), {
      kind: 'current',
      id: result.id,
    })
  }
})

test('Python Data Tools resolver source stays independent from routing and Progress side effects', async () => {
  await loadResolver()
  const source = readFileSync(resolverUrl, 'utf8')

  assert.match(source, /pythonDataToolsContract\.chapters/)
  assert.doesNotMatch(source, /from ['"]vue(?:-router)?['"]|from ['"].*router|router\.|navigate|window\.|localStorage|sessionStorage|algorithmProgress|saveAlgorithmProgress|setLastVisited/i)
})
