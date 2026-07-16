import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

import { pythonDataToolsRuntimeChapters } from '../src/data/generated/pythonDataToolsRuntime.generated.ts'
import {
  loadPythonDataToolsManifest,
  loadPythonDataToolsOutput,
  pythonDataToolsOutputRegistry,
} from '../src/utils/pythonDataToolsOutputs.ts'

const manifestPath = new URL('../public/notebooks/python-data-tools/outputs/manifest.json', import.meta.url)
const outputRoot = new URL('../public/notebooks/python-data-tools/outputs/', import.meta.url)

const readManifestFixture = async () => JSON.parse(await readFile(manifestPath, 'utf8'))

function responseFor(body: BodyInit, init?: ResponseInit) {
  return new Response(body, init)
}

function createPublicFileFetch(requests: string[] = []): typeof fetch {
  return (async (input: string | URL | Request) => {
    const url = String(input)
    requests.push(url)
    const logicalPath = new URL(url, 'https://ml-atlas.test').pathname
      .replace(/^\/ML_tutorial_Site/, '')

    if (logicalPath === '/notebooks/python-data-tools/outputs/manifest.json') {
      return responseFor(await readFile(manifestPath), {
        headers: { 'content-type': 'application/json' },
      })
    }

    const filename = logicalPath.split('/').at(-1)
    if (!filename) return responseFor('not found', { status: 404 })

    try {
      return responseFor(await readFile(new URL(filename, outputRoot)), {
        headers: {
          'content-type': filename.endsWith('.png') ? 'image/png' : 'application/json',
        },
      })
    } catch {
      return responseFor('not found', { status: 404 })
    }
  }) as typeof fetch
}

test('output registry owns eight unique ordered placements and only authoritative PNG fallbacks', () => {
  assert.deepEqual(
    pythonDataToolsOutputRegistry.map(({ id }) => id),
    [
      'dataset-shape-schema',
      'hourly-demand-profile',
      'workingday-comparison',
      'season-weather-distribution',
      'rider-composition',
      'pearson-correlation-matrix',
      'plotly-hourly-explorer',
      'final-analysis-evidence',
    ],
  )
  assert.deepEqual(
    pythonDataToolsOutputRegistry.map(({ primaryOrder }) => primaryOrder),
    [0, 1, 2, 3, 4, 5, 6, 7],
  )
  assert.equal(new Set(pythonDataToolsOutputRegistry.map(({ id }) => id)).size, 8)

  const pngFallbacks = pythonDataToolsOutputRegistry
    .filter(({ kind }) => kind === 'png')
    .flatMap(({ fallbackSourceIds }) => fallbackSourceIds)
  assert.ok(pngFallbacks.length > 0)
  assert.ok(pngFallbacks.every((id) => (
    id === 'workingday-comparison' || id === 'final-analysis-evidence'
  )))
})

test('manifest loader is strict, base-safe, and returns local bilingual errors', async (t) => {
  const requests: string[] = []
  const rootState = await loadPythonDataToolsManifest({
    fetch: createPublicFileFetch(requests),
    baseUrl: '/',
  })
  assert.equal(rootState.status, 'ready')
  if (rootState.status !== 'ready') return
  assert.equal(requests[0], '/notebooks/python-data-tools/outputs/manifest.json')
  assert.deepEqual(rootState.data.outputs.map(({ id }) => id), pythonDataToolsOutputRegistry.map(({ id }) => id))

  requests.length = 0
  const pagesState = await loadPythonDataToolsManifest({
    fetch: createPublicFileFetch(requests),
    baseUrl: '/ML_tutorial_Site/',
  })
  assert.equal(pagesState.status, 'ready')
  assert.equal(requests[0], '/ML_tutorial_Site/notebooks/python-data-tools/outputs/manifest.json')

  const valid = await readManifestFixture()
  const invalidCases = [
    { ...valid, contractVersion: 'future-version' },
    { ...valid, outputs: [...valid.outputs, valid.outputs[0]] },
    { ...valid, outputs: [...valid.outputs].reverse() },
    { ...valid, outputs: valid.outputs.map((entry: Record<string, unknown>, index: number) => (
      index === 0 ? { ...entry, id: 'unknown-output' } : entry
    )) },
    { ...valid, notebook: { publicPath: '', sha256: valid.notebook.sha256 } },
  ]

  for (const [index, fixture] of invalidCases.entries()) {
    await t.test(`invalid manifest ${index + 1}`, async () => {
      const state = await loadPythonDataToolsManifest({
        fetch: (async () => responseFor(JSON.stringify(fixture))) as typeof fetch,
      })
      assert.equal(state.status, 'error')
      if (state.status !== 'error') return
      assert.ok(state.message['zh-CN'].trim())
      assert.ok(state.message.en.trim())
    })
  }

  for (const fetcher of [
    (async () => responseFor('missing', { status: 404 })) as typeof fetch,
    (async () => responseFor('{not-json')) as typeof fetch,
  ]) {
    const state = await loadPythonDataToolsManifest({ fetch: fetcher })
    assert.equal(state.status, 'error')
  }
})

test('all authoritative outputs load independently into typed teaching view models', async () => {
  const fetcher = createPublicFileFetch()
  const manifestState = await loadPythonDataToolsManifest({ fetch: fetcher })
  assert.equal(manifestState.status, 'ready')
  if (manifestState.status !== 'ready') return

  for (const registryEntry of pythonDataToolsOutputRegistry) {
    const state = await loadPythonDataToolsOutput(manifestState.data, registryEntry.id, { fetch: fetcher })
    assert.equal(state.status, 'ready', registryEntry.id)
    if (state.status !== 'ready') continue
    assert.equal(state.data.id, registryEntry.id)
    assert.equal(state.data.kind, registryEntry.kind)
    if (state.data.kind === 'json') {
      assert.ok(state.data.tables.length + state.data.keyValues.length > 0)
      assert.ok(state.data.raw)
    }
    if (state.data.kind === 'png') {
      assert.match(state.data.imageUrl, /^\/notebooks\/python-data-tools\/outputs\/.+\.png$/)
      assert.ok(state.data.sourceAlt.trim())
      assert.deepEqual(state.data.fallbackSourceIds, registryEntry.fallbackSourceIds)
    }
    if (state.data.kind === 'plotly-json') {
      assert.ok(state.data.figure.data.length > 0)
      assert.equal(typeof state.data.figure.layout, 'object')
    }
  }
})

test('per-output failures stay local and reject schema drift, missing resources, and unknown IDs', async () => {
  const manifestState = await loadPythonDataToolsManifest({ fetch: createPublicFileFetch() })
  assert.equal(manifestState.status, 'ready')
  if (manifestState.status !== 'ready') return

  const unknownState = await loadPythonDataToolsOutput(
    manifestState.data,
    'not-an-output',
    { fetch: createPublicFileFetch() },
  )
  assert.equal(unknownState.status, 'error')

  const missingState = await loadPythonDataToolsOutput(
    manifestState.data,
    'dataset-shape-schema',
    { fetch: (async () => responseFor('missing', { status: 404 })) as typeof fetch },
  )
  assert.equal(missingState.status, 'error')

  const invalidJsonState = await loadPythonDataToolsOutput(
    manifestState.data,
    'workingday-comparison',
    { fetch: (async () => responseFor('{bad-json')) as typeof fetch },
  )
  assert.equal(invalidJsonState.status, 'error')

  const wrongSchemaState = await loadPythonDataToolsOutput(
    manifestState.data,
    'pearson-correlation-matrix',
    { fetch: (async () => responseFor(JSON.stringify({ contractVersion: 'python-data-tools-v1' }))) as typeof fetch },
  )
  assert.equal(wrongSchemaState.status, 'error')

  const unaffectedState = await loadPythonDataToolsOutput(
    manifestState.data,
    'final-analysis-evidence',
    { fetch: createPublicFileFetch() },
  )
  assert.equal(unaffectedState.status, 'ready')
})

test('output URLs use the supplied Pages base without mutating the manifest', async () => {
  const requests: string[] = []
  const fetcher = createPublicFileFetch(requests)
  const manifestState = await loadPythonDataToolsManifest({ fetch: fetcher })
  assert.equal(manifestState.status, 'ready')
  if (manifestState.status !== 'ready') return
  const before = structuredClone(manifestState.data)

  const state = await loadPythonDataToolsOutput(manifestState.data, 'dataset-shape-schema', {
    fetch: fetcher,
    baseUrl: '/ML_tutorial_Site/',
  })
  assert.equal(state.status, 'ready')
  assert.equal(requests.at(-1), '/ML_tutorial_Site/notebooks/python-data-tools/outputs/dataset-shape-schema.json')
  assert.deepEqual(manifestState.data, before)
})

test('repeat and concurrent reads are deterministic, abortable, and have no lifecycle or storage ownership', async () => {
  const fetcher = createPublicFileFetch()
  const manifestState = await loadPythonDataToolsManifest({ fetch: fetcher })
  assert.equal(manifestState.status, 'ready')
  if (manifestState.status !== 'ready') return

  const [first, second] = await Promise.all([
    loadPythonDataToolsOutput(manifestState.data, 'workingday-comparison', { fetch: fetcher }),
    loadPythonDataToolsOutput(manifestState.data, 'workingday-comparison', { fetch: fetcher }),
  ])
  assert.deepEqual(first, second)

  const controller = new AbortController()
  controller.abort()
  const aborted = await loadPythonDataToolsOutput(manifestState.data, 'workingday-comparison', {
    fetch: fetcher,
    signal: controller.signal,
  })
  assert.equal(aborted.status, 'error')
  if (aborted.status === 'error') assert.equal(aborted.code, 'aborted')

  const source = await readFile(new URL('../src/utils/pythonDataToolsOutputs.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /localStorage|sessionStorage|Progress|onMounted|onBeforeUnmount|setTimeout|setInterval/)
})

test('generated result presentations provide complete bilingual teaching copy for every result', () => {
  const presentations = pythonDataToolsRuntimeChapters.flatMap(({ blocks }) => (
    blocks.filter((block) => block.kind === 'result-presentation')
  ))
  assert.equal(presentations.length, 8)
  assert.deepEqual(
    presentations.map(({ outputId }) => outputId),
    [
      'dataset-shape-schema',
      'workingday-comparison',
      'hourly-demand-profile',
      'rider-composition',
      'season-weather-distribution',
      'pearson-correlation-matrix',
      'plotly-hourly-explorer',
      'final-analysis-evidence',
    ],
  )
  for (const presentation of presentations) {
    for (const field of [
      presentation.title,
      presentation.alt,
      presentation.interpretation,
      presentation.limitation,
      presentation.fallbackSummary,
    ]) {
      assert.ok(field['zh-CN'].trim(), `${presentation.outputId} missing zh-CN copy`)
      assert.ok(field.en.trim(), `${presentation.outputId} missing English copy`)
    }
    for (const translation of presentation.axisLegendTranslations) {
      assert.ok(translation.source.trim())
      assert.ok(translation.label['zh-CN'].trim())
      assert.ok(translation.label.en.trim())
    }
  }
})

test('result block consumes generated copy and keeps JSON, PNG, and local failures pedagogical', async () => {
  const source = await readFile(new URL('../src/components/PythonDataToolsResultBlock.vue', import.meta.url), 'utf8')
  assert.match(source, /presentation: PythonDataToolsResultPresentationBlock/)
  assert.match(source, /presentation\.title\[locale\]/)
  assert.match(source, /presentation\.alt\[locale\]/)
  assert.match(source, /presentation\.axisLegendTranslations/)
  assert.match(source, /presentation\.interpretation\[locale\]/)
  assert.match(source, /presentation\.limitation\[locale\]/)
  assert.match(source, /presentation\.fallbackSummary\[locale\]/)
  assert.match(source, /<MarkdownMathContent/)
  assert.match(source, /<details[^>]*class="python-data-tools-result__raw"/)
  assert.match(source, /<table>/)
  assert.match(source, /scope="col"/)
  assert.match(source, /fallbackResults/)
  assert.match(source, /@error="imageFailed = true"/)
  assert.match(source, /role="status"/)
  assert.doesNotMatch(source, /v-html|localStorage|sessionStorage|saveAlgorithmProgress/)
  assert.doesNotMatch(source, /dataset-shape-schema|hourly-demand-profile|workingday-comparison|season-weather-distribution|rider-composition|pearson-correlation-matrix|final-analysis-evidence/)
  assert.doesNotMatch(source, />[^<{]*(证据|manifest)[^<{]*</i)
})

test('Plotly result renderer owns constrained filters, lazy lifecycle, localization, and cleanup', async () => {
  const source = await readFile(new URL('../src/components/PythonDataToolsPlotlyFigure.vue', import.meta.url), 'utf8')

  assert.match(source, /result: PythonDataToolsPlotlyOutputViewModel/)
  assert.match(source, /presentation: PythonDataToolsResultPresentationBlock/)
  assert.match(source, /locale: AppLocale/)
  assert.match(source, /import\('plotly\.js-basic-dist-min'\)/)
  assert.match(source, /const figure = props\.result\.figure/)
  assert.doesNotMatch(source, /structuredClone\(props\.result\.figure/)
  assert.match(source, /Plotly\.react|plotly\.react/)
  assert.match(source, /\.Plots\.resize\(/)
  assert.match(source, /\.purge\(/)
  assert.match(source, /onBeforeUnmount/)
  assert.match(source, /ResizeObserver/)
  assert.match(source, /renderRequestId/)

  assert.match(source, /type="range"/)
  assert.match(source, /min="0"/)
  assert.match(source, /max="23"/)
  assert.match(source, /type="checkbox"/)
  assert.match(source, /Math\.min\(23/)
  assert.match(source, /Number\.isFinite/)
  assert.match(source, /resetFilters/)
  assert.match(source, /aria-live="polite"/)

  assert.match(source, /responsive:\s*true/)
  assert.match(source, /displaylogo:\s*false/)
  assert.match(source, /modeBarButtons:\s*\[\['zoom2d', 'resetScale2d'\]\]/)
  assert.match(source, /scrollZoom:\s*false/)
  assert.match(source, /doubleClick:\s*'reset'/)
  assert.doesNotMatch(source, /^import Plotly/m)
  assert.doesNotMatch(source, /localStorage|sessionStorage|setTimeout|setInterval|bdata|atob/)
})

test('result block wires one local Plotly renderer and keeps authoritative static equivalence on failure', async () => {
  const source = await readFile(new URL('../src/components/PythonDataToolsResultBlock.vue', import.meta.url), 'utf8')

  assert.match(source, /import PythonDataToolsPlotlyFigure from '\.\/PythonDataToolsPlotlyFigure\.vue'/)
  assert.match(source, /const plotlyFailed = ref\(false\)/)
  assert.match(source, /<PythonDataToolsPlotlyFigure/)
  assert.match(source, /:result="plotlyResult"/)
  assert.match(source, /:presentation="presentation"/)
  assert.match(source, /:locale="locale"/)
  assert.match(source, /@render-error="plotlyFailed = \$event"/)
  assert.match(source, /state\.status === 'error' \|\| imageFailed \|\| plotlyFailed/)
  assert.match(source, /fallbackResults/)
  assert.match(source, /等价数据表|Equivalent data table/)
  assert.doesNotMatch(source, /<slot name="plotly"|setTimeout|setInterval|localStorage|sessionStorage/)
})

test('page output session owns one automatic load, abort cleanup, typed distribution, and one manual allowance', async () => {
  const source = await readFile(new URL('../src/composables/usePythonDataToolsOutputSession.ts', import.meta.url), 'utf8')

  assert.match(source, /loadPythonDataToolsManifest/)
  assert.match(source, /loadPythonDataToolsOutput/)
  assert.match(source, /new AbortController\(\)/)
  assert.match(source, /requestToken/)
  assert.match(source, /activeController\?\.abort\(\)/)
  assert.match(source, /onMounted/)
  assert.match(source, /onBeforeUnmount/)
  assert.match(source, /manualReloadAvailable/)
  assert.match(source, /manualReloadConsumed/)
  assert.match(source, /readonly\(/)
  assert.doesNotMatch(source, /setTimeout|setInterval|watchEffect|localStorage|sessionStorage/)

  const { createPythonDataToolsOutputSession } = await import('../src/composables/usePythonDataToolsOutputSession.ts')
  const requests: string[] = []
  const session = createPythonDataToolsOutputSession({ fetch: createPublicFileFetch(requests) })

  await session.start()
  assert.equal(requests.filter((url) => url.endsWith('/manifest.json')).length, 1)
  assert.equal(session.manualReloadAvailable.value, false)
  assert.deepEqual(
    pythonDataToolsOutputRegistry.map(({ id }) => session.stateFor(id).status),
    pythonDataToolsOutputRegistry.map(() => 'ready'),
  )
  await session.start()
  assert.equal(requests.filter((url) => url.endsWith('/manifest.json')).length, 1)
  session.dispose()
})

test('session offers exactly one manual reload only after initial manifest failure', async () => {
  let requestCount = 0
  const fetcher = (async () => {
    requestCount += 1
    return responseFor('missing', { status: 503 })
  }) as typeof fetch
  const { createPythonDataToolsOutputSession } = await import('../src/composables/usePythonDataToolsOutputSession.ts')
  const session = createPythonDataToolsOutputSession({ fetch: fetcher })

  await session.start()
  assert.equal(requestCount, 1)
  assert.equal(session.manualReloadAvailable.value, true)
  await session.reloadRuntimeResults()
  assert.equal(requestCount, 2)
  assert.equal(session.manualReloadAvailable.value, false)
  await session.reloadRuntimeResults()
  assert.equal(requestCount, 2)
  session.dispose()
})

test('disposing an in-flight session aborts and prevents stale state replacement', async () => {
  let observedSignal: AbortSignal | undefined
  const fetcher = ((_input: string | URL | Request, init?: RequestInit) => new Promise<Response>((resolve) => {
    observedSignal = init?.signal ?? undefined
    observedSignal?.addEventListener('abort', () => resolve(responseFor('missing', { status: 499 })), { once: true })
  })) as typeof fetch
  const { createPythonDataToolsOutputSession } = await import('../src/composables/usePythonDataToolsOutputSession.ts')
  const session = createPythonDataToolsOutputSession({ fetch: fetcher })

  const pending = session.start()
  session.dispose()
  await pending
  assert.equal(observedSignal?.aborted, true)
  assert.equal(session.manualReloadAvailable.value, false)
  assert.deepEqual(
    pythonDataToolsOutputRegistry.map(({ id }) => session.stateFor(id).status),
    pythonDataToolsOutputRegistry.map(() => 'loading'),
  )
})
