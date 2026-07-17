import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

import { pythonDataToolsContract } from '../src/data/pythonNotebookContract.ts'

const resolverUrl = new URL('../src/utils/pythonDataToolsRoutes.ts', import.meta.url)
const routerUrl = new URL('../src/router/index.ts', import.meta.url)
const pageUrl = new URL('../src/components/PythonDataToolsPagedLesson.vue', import.meta.url)

async function loadResolver() {
  assert.ok(
    existsSync(resolverUrl),
    'pythonDataToolsRoutes.ts should exist before the compatibility resolver can be used',
  )
  return import('../src/utils/pythonDataToolsRoutes.ts')
}

test('Python Data Tools resolves the five legacy chapter IDs to locked canonical IDs', async () => {
  const { legacyPythonDataToolsChapterMap, resolvePythonDataToolsChapter } = await loadResolver()

  assert.deepEqual(
    Object.entries(legacyPythonDataToolsChapterMap),
    [
      ['notebook-rhythm', 'notebook-workflow'],
      ['numpy-arrays', 'numpy-foundations'],
      ['pandas-tables', 'pandas-structures'],
      ['sklearn-small-model', 'pandas-analysis'],
      ['reproducible-handoff', 'analysis-report'],
    ],
    'legacy map own keys and canonical targets must match D-18 exactly',
  )
  assert.equal(Object.isFrozen(legacyPythonDataToolsChapterMap), true, 'legacy map must be readonly')

  assert.deepEqual(
    resolvePythonDataToolsChapter('notebook-rhythm'),
    { kind: 'legacy', id: 'notebook-workflow' },
    'legacy key "notebook-rhythm" must target "notebook-workflow"',
  )
  assert.deepEqual(
    resolvePythonDataToolsChapter('numpy-arrays'),
    { kind: 'legacy', id: 'numpy-foundations' },
    'legacy key "numpy-arrays" must target "numpy-foundations"',
  )
  assert.deepEqual(
    resolvePythonDataToolsChapter('pandas-tables'),
    { kind: 'legacy', id: 'pandas-structures' },
    'legacy key "pandas-tables" must target "pandas-structures"',
  )
  assert.deepEqual(
    resolvePythonDataToolsChapter('sklearn-small-model'),
    { kind: 'legacy', id: 'pandas-analysis' },
    'legacy key "sklearn-small-model" must target "pandas-analysis"',
  )
  assert.deepEqual(
    resolvePythonDataToolsChapter('reproducible-handoff'),
    { kind: 'legacy', id: 'analysis-report' },
    'legacy key "reproducible-handoff" must target "analysis-report"',
  )
})

test('Python Data Tools keeps every current contract chapter ID unchanged', async () => {
  const { resolvePythonDataToolsChapter } = await loadResolver()
  const currentIds = pythonDataToolsContract.chapters.map(({ id }) => id)
  const resolutions = currentIds.map(resolvePythonDataToolsChapter)

  assert.deepEqual(
    resolutions.map(({ id }) => id),
    currentIds,
    'current chapter order must remain the contract order without any rewrite',
  )
  assert.deepEqual(
    resolutions.map(({ kind }) => kind),
    currentIds.map(() => 'current'),
    'every current contract ID must be diagnosed as current',
  )

  const expectedLinks = currentIds.map((id) => `/learn/python-notebook/${id}`)
  assert.deepEqual(expectedLinks, [
    '/learn/python-notebook/notebook-workflow',
    '/learn/python-notebook/numpy-foundations',
    '/learn/python-notebook/pandas-structures',
    '/learn/python-notebook/pandas-analysis',
    '/learn/python-notebook/matplotlib-visualization',
    '/learn/python-notebook/seaborn-statistics',
    '/learn/python-notebook/plotly-exploration',
    '/learn/python-notebook/analysis-report',
  ])

  const pageSource = readFileSync(pageUrl, 'utf8')
  assert.match(pageSource, /return `\$\{props\.routeBase\}\/\$\{chapterEntry\.id\}`/)
  assert.doesNotMatch(pageSource, /legacyPythonDataToolsChapterMap|resolvePythonDataToolsChapter/)
})

test('Python Data Tools falls back from empty and unknown IDs to the first contract chapter', async () => {
  const { resolvePythonDataToolsChapter } = await loadResolver()
  const firstChapterId = pythonDataToolsContract.chapters[0].id

  assert.deepEqual(resolvePythonDataToolsChapter(''), {
    kind: 'unknown',
    id: firstChapterId,
  }, 'empty chapter ID must fall back to the first contract chapter')
  assert.deepEqual(resolvePythonDataToolsChapter('does-not-exist'), {
    kind: 'unknown',
    id: firstChapterId,
  }, 'unknown chapter ID must fall back to the first contract chapter')
})

test('Python Data Tools resolution is stable for repeated and concurrent calls', async () => {
  const { legacyPythonDataToolsChapterMap, resolvePythonDataToolsChapter } = await loadResolver()
  const inputs = [
    ...Object.keys(legacyPythonDataToolsChapterMap),
    ...pythonDataToolsContract.chapters.map(({ id }) => id),
    '',
    'does-not-exist',
  ]
  const firstPass = inputs.map(resolvePythonDataToolsChapter)

  assert.deepEqual(
    inputs.map(resolvePythonDataToolsChapter),
    firstPass,
    'repeated calls must return the same discriminated results',
  )
  assert.deepEqual(
    await Promise.all(inputs.map(async (id) => resolvePythonDataToolsChapter(id))),
    firstPass,
    'parallel calls must return the same ordered results as synchronous calls',
  )

  for (const result of firstPass) {
    assert.deepEqual(resolvePythonDataToolsChapter(result.id), {
      kind: 'current',
      id: result.id,
    }, `canonical target "${result.id}" must resolve once as current without a loop`)
  }
})

test('Python Data Tools resolver source stays independent from routing and Progress side effects', async () => {
  await loadResolver()
  const source = readFileSync(resolverUrl, 'utf8')

  assert.match(
    source,
    /pythonDataToolsContract\.chapters\.map/,
    'current-ID allowlist must derive from contract chapter order',
  )
  assert.match(
    source,
    /pythonDataToolsContract\.chapters\[0\]\.id/,
    'unknown fallback must derive from the first contract chapter',
  )
  assert.doesNotMatch(
    source,
    /from ['"]vue(?:-router)?['"]|from ['"][^'"]*router|from ['"][^'"]*(?:algorithmProgress|progressStorage)/i,
    'resolver must not import Vue, router, Progress, or storage modules',
  )
  assert.doesNotMatch(
    source,
    /\b(?:router|history|location)\.(?:push|replace|assign)|\bnavigate|\bwindow\.|\b(?:localStorage|sessionStorage)\.|\b(?:save|append|setLastVisited)[A-Z]|\bfetch\s*\(|XMLHttpRequest/i,
    'resolver must not navigate, write Progress/storage, or perform network side effects',
  )
  assert.doesNotMatch(
    source,
    /path:\s*['"]\/learn|beforeEnter|component:\s*\(\)\s*=>\s*import/,
    'resolver must not register or mount a live route',
  )
})

test('dedicated Python routes canonicalize before the generic lesson route can mount', () => {
  const source = readFileSync(routerUrl, 'utf8')
  const shortRootRouteIndex = source.indexOf("path: '/python'")
  const shortChapterRouteIndex = source.indexOf("path: '/python/:chapterId'")
  const rootRouteIndex = source.indexOf("path: '/learn/python-notebook'")
  const chapterRouteIndex = source.indexOf("path: '/learn/python-notebook/:chapterId'")
  const genericRouteIndex = source.indexOf("path: '/learn/:moduleId/:lessonId'")

  assert.ok(shortRootRouteIndex >= 0, 'short Python root route must be explicit')
  assert.ok(shortChapterRouteIndex > shortRootRouteIndex, 'short Python chapter route must follow its root route')
  assert.ok(rootRouteIndex > shortChapterRouteIndex, 'canonical Python routes must remain available after short routes')
  assert.ok(rootRouteIndex >= 0, 'Python root route must be explicit')
  assert.ok(chapterRouteIndex > rootRouteIndex, 'Python chapter route must follow its root route')
  assert.ok(genericRouteIndex > chapterRouteIndex, 'both Python routes must precede the generic route')
  assert.match(source, /resolvePythonDataToolsChapter/)
  assert.match(source, /beforeEnter:\s*redirectPythonDataToolsChapter/)
  assert.match(source, /beforeEnter:\s*redirectShortPythonDataToolsChapter/)
  assert.match(source, /replace:\s*true/)
  assert.match(source, /component:\s*\(\)\s*=>\s*import\('\.\.\/views\/PythonDataToolsCourseView\.vue'\)/)

  const guardIndex = source.indexOf('function redirectPythonDataToolsChapter')
  const viewImportIndex = source.indexOf("component: () => import('../views/PythonDataToolsCourseView.vue')", rootRouteIndex)
  assert.ok(guardIndex >= 0 && guardIndex < viewImportIndex, 'canonicalization guard must be defined before the page route')
  assert.doesNotMatch(
    source.slice(guardIndex, rootRouteIndex),
    /saveAlgorithmProgress|appendAlgorithmQuizAttempt|localStorage|sessionStorage/,
  )

  const rootRouteSource = source.slice(rootRouteIndex, chapterRouteIndex)
  assert.match(rootRouteSource, /beforeEnter:\s*redirectPythonDataToolsChapter/)
  assert.match(source.slice(chapterRouteIndex, genericRouteIndex), /beforeEnter:\s*redirectPythonDataToolsChapter/)
})

test('short Python routes remain visible in navigation, homepage, and Pages fallbacks', () => {
  const navigationSource = readFileSync(new URL('../src/data/navigationMenus.ts', import.meta.url), 'utf8')
  const homeSource = readFileSync(new URL('../src/views/HomeView.vue', import.meta.url), 'utf8')
  const fallbackSource = readFileSync(new URL('../scripts/create-pages-fallbacks.mjs', import.meta.url), 'utf8')
  const courseViewSource = readFileSync(new URL('../src/views/PythonDataToolsCourseView.vue', import.meta.url), 'utf8')

  assert.match(navigationSource, /id: 'python-data-tools'[\s\S]*?route: '\/python'/)
  assert.match(homeSource, /to="\/python"/)
  assert.match(fallbackSource, /'\/python'/)
  assert.match(courseViewSource, /route\.path\.startsWith\('\/python\/'\)/)
  assert.match(courseViewSource, /:route-base="courseRouteBase"/)
  assert.match(courseViewSource, /:chapter-route-base="courseRouteBase"/)
})
