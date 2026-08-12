import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createRenderer, defineComponent, h, nextTick, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { createServer } from 'vite'
import { publishedOptimizerSnapshot } from '../src/modules/optimizer-comparison/labs/publishedSnapshot.ts'
import { batchNoiseModel, scheduleModel } from '../src/modules/optimizer-comparison/labs/sceneModels.ts'
import { useScenePlayback } from '../src/modules/optimizer-comparison/labs/useScenePlayback.ts'

const root = new URL('../', import.meta.url)
const require = createRequire(import.meta.url)
const vueRuntimeUrl = pathToFileURL(require.resolve('vue/dist/vue.runtime.esm-bundler.js')).href
const i18nRuntimeUrl = pathToFileURL(require.resolve('vue-i18n/dist/vue-i18n.esm-bundler.js')).href
const exportHelperUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent('export default function exportSfc(component, props) { for (const [key, value] of props) component[key] = value; return component }')}`
const emptyModuleUrl = 'data:text/javascript;charset=utf-8,export default {}'

function renderer() {
  return createRenderer({
    patchProp(el, key, _previous, next) { el.props[key] = next },
    insert(el, parent) { el.parent = parent; parent.children.push(el) },
    remove(el) { if (el.parent) el.parent.children = el.parent.children.filter((child) => child !== el) },
    createElement(type) { return { type, props: {}, children: [], parent: null, eventListeners: {}, addEventListener(name, fn) { (this.eventListeners[name] ??= []).push(fn) }, removeEventListener() {} } },
    createText(text) { return { type: '#text', text, props: {}, children: [], parent: null } },
    createComment(text) { return { type: '#comment', text, props: {}, children: [], parent: null } },
    setText(node, text) { node.text = text }, setElementText(node, text) { node.text = text; node.children = [] }, parentNode(node) { return node.parent }, nextSibling() { return null },
  })
}

async function loadClientModule(server, path, cache = new Map()) {
  if (cache.has(path)) return cache.get(path)
  const transformed = await server.transformRequest(path)
  assert.ok(transformed?.code, `${path} transforms through Vite`)
  let code = transformed.code.replace(/import\s+\{\s*createHotContext[\s\S]*?;\s*/, '').replace(/import\.meta\.hot\s*=\s*__vite__createHotContext\([^;]+;\s*/, '').replace(/\n_sfc_main\.__hmrId[\s\S]*?import _export_sfc/, '\nimport _export_sfc')
  const replacements = new Map()
  for (const match of code.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)) {
    const specifier = match[1]
    if (specifier.startsWith('/node_modules/.vite/deps/vue.js')) replacements.set(specifier, vueRuntimeUrl)
    else if (specifier.startsWith('/node_modules/.vite/deps/vue-i18n')) replacements.set(specifier, i18nRuntimeUrl)
    else if (specifier.startsWith('/@id/__x00__plugin-vue:export-helper')) replacements.set(specifier, exportHelperUrl)
    else if (specifier.startsWith('/@vite/client') || specifier.includes('type=style')) replacements.set(specifier, emptyModuleUrl)
    else if (specifier.startsWith('/src/')) replacements.set(specifier, await loadClientModule(server, specifier, cache))
  }
  for (const [specifier, replacement] of replacements) { code = code.replaceAll(JSON.stringify(specifier), JSON.stringify(replacement)).replaceAll(`'${specifier}'`, `'${replacement}'`) }
  const url = `data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`
  cache.set(path, url)
  return url
}

async function mountScene(path, locale = 'en') {
  const server = await createServer({ appType: 'custom', logLevel: 'silent', root: new URL('.', root).pathname, server: { middlewareMode: true } })
  const container = { type: 'root', props: {}, children: [], parent: null }
  try {
    const url = await loadClientModule(server, path)
    const component = (await import(url)).default
    const app = renderer().createApp({ render: () => h(component) })
    app.use(createI18n({ legacy: false, locale, messages: {} }))
    app.mount(container)
    await nextTick(); await nextTick()
    return { container, async update() { await nextTick(); await nextTick() }, async unmount() { app.unmount(); await server.close() } }
  } catch (error) { await server.close(); throw error }
}

function nodes(node, output = []) { output.push(node); for (const child of node.children ?? []) nodes(child, output); return output }
function text(node) { return nodes(node).map((item) => item.text ?? '').join(' ') }
function event(node, name, payload = {}) { const handler = node.props?.[`on${name[0].toUpperCase()}${name.slice(1)}`]; for (const item of Array.isArray(handler) ? handler : [handler]) item?.(payload) }
function semanticSignature(container) {
  return nodes(container).filter((node) => node.type === 'table' || node.type === 'ol').map((node) => {
    if (node.type === 'ol') return `log:${nodes(node).filter((item) => item.type === 'li').map((item) => `${item.props['data-status']}:${text(item)}`).join('|')}`
    return `table:${text(node)}`
  }).join('\n')
}
function buttons(container) { return nodes(container).filter((node) => node.type === 'button') }
function firstTableCells(container) { return nodes(nodes(container).find((node) => node.type === 'table')).filter((node) => node.type === 'td').map(text) }
function mockPublishedCurveFetch() {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async (url) => ({
    ok: true,
    async json() {
      return String(url).includes('optimizer-comparison-trajectories.json')
        ? { rows: publishedOptimizerSnapshot.trajectories }
        : publishedOptimizerSnapshot.banknote
    },
  })
  return () => { globalThis.fetch = originalFetch }
}
async function withDeterministicIntervals(run) {
  const originalSetInterval = globalThis.setInterval
  const originalClearInterval = globalThis.clearInterval
  const intervals = new Map()
  let nextId = 0
  globalThis.setInterval = (callback) => { const id = ++nextId; intervals.set(id, callback); return id }
  globalThis.clearInterval = (id) => { intervals.delete(id) }
  try {
    await run({
      tick() { for (const callback of [...intervals.values()]) callback() },
      active() { return intervals.size },
    })
  } finally {
    globalThis.setInterval = originalSetInterval
    globalThis.clearInterval = originalClearInterval
  }
}
const scenePaths = ['TrainingLedgerScene', 'BatchNoiseScene', 'MomentumRmspropScene', 'AdamDecayScene', 'ScheduleCadenceScene', 'CurveDiagnosisScene']
const sceneMaximums = { TrainingLedgerScene: 4, BatchNoiseScene: 12, MomentumRmspropScene: 8, AdamDecayScene: 8, ScheduleCadenceScene: 11, CurveDiagnosisScene: 40 }

test('every optimizer scene renders localized controls and a semantic fallback in both locales', async () => {
  globalThis.window = { matchMedia: () => ({ matches: false }) }
  for (const name of scenePaths) {
    for (const locale of ['zh-CN', 'en']) {
      const mounted = await mountScene(`/src/modules/optimizer-comparison/labs/${name}.vue`, locale)
      const rendered = text(mounted.container)
      assert.match(rendered, locale === 'zh-CN' ? /播放.*单步.*重置/ : /Play.*Step.*Reset/, `${name} renders ${locale} controls`)
      assert.ok(nodes(mounted.container).some((node) => node.type === 'table' || node.type === 'ol'), `${name} renders a semantic fallback`)
      const select = nodes(mounted.container).find((node) => node.type === 'select')
      if (select) assert.equal(select.props.onKeydown, undefined, `${name} leaves native select keyboard behavior intact`)
      if (name === 'CurveDiagnosisScene') {
        assert.match(rendered, locale === 'zh-CN'
          ? /学习率=.*批量大小=.*训练轮数=.*数据划分:.*测试评估次数=.*测试集用于选择=否/
          : /learning rate=.*batch size=.*epochs=.*split:.*test evaluation count=.*test used for selection=no/,
        `${name} localizes every Banknote configuration and evaluation label in ${locale}`)
        assert.doesNotMatch(rendered, /lr=|batch=|Split:|test count=|selectionUsedTest=/, `${name} does not leak implementation-oriented labels in ${locale}`)
      }
      await mounted.unmount()
    }
  }
})

test('every mounted optimizer scene binds bounded Play, Pause, Step, and Reset controls', async () => {
  globalThis.window = { matchMedia: () => ({ matches: false }) }
  await withDeterministicIntervals(async ({ tick, active }) => {
    for (const name of scenePaths) {
      const restoreFetch = name === 'CurveDiagnosisScene' ? mockPublishedCurveFetch() : undefined
      const mounted = await mountScene(`/src/modules/optimizer-comparison/labs/${name}.vue`)
      try {
        await new Promise((resolve) => setTimeout(resolve, 0)); await mounted.update()
        const [playPause, step, reset] = buttons(mounted.container)
        assert.ok(playPause && step && reset, `${name} mounts all playback controls`)
        const initial = semanticSignature(mounted.container)
        assert.ok(initial, `${name} begins with rendered table/log state`)

        event(playPause, 'click'); await mounted.update()
        assert.equal(text(playPause), 'Pause', `${name} bound Play control switches to Pause`)
        assert.equal(active(), 1, `${name} Play starts its bound timer`)
        tick(); await mounted.update()
        const advancedByPlay = semanticSignature(mounted.container)
        assert.notEqual(advancedByPlay, initial, `${name} Play changes rendered table/log state`)

        event(playPause, 'click'); await mounted.update()
        const paused = semanticSignature(mounted.container)
        assert.equal(text(playPause), 'Play', `${name} bound Pause control restores Play`)
        assert.equal(active(), 0, `${name} Pause clears its bound timer`)
        tick(); await mounted.update()
        assert.equal(semanticSignature(mounted.container), paused, `${name} Pause stops rendered state changes`)

        event(step, 'click'); await mounted.update()
        assert.notEqual(semanticSignature(mounted.container), paused, `${name} bound Step changes rendered table/log state`)
        event(reset, 'click'); await mounted.update()
        assert.equal(semanticSignature(mounted.container), initial, `${name} bound Reset restores the initial table/log state`)

        for (let index = 0; index < sceneMaximums[name] + 2; index += 1) { event(step, 'click'); await mounted.update() }
        const bounded = semanticSignature(mounted.container)
        assert.notEqual(bounded, initial, `${name} advances to a non-initial bounded state`)
        event(step, 'click'); await mounted.update()
        assert.equal(semanticSignature(mounted.container), bounded, `${name} Step remains bounded at its final state`)
      } finally {
        await mounted.unmount()
        restoreFetch?.()
      }
    }
  })
})

test('mounted Batch, Schedule, and Curve selects update their model/mode and reset their cursors', async () => {
  globalThis.window = { matchMedia: () => ({ matches: false }) }

  const batch = await mountScene('/src/modules/optimizer-comparison/labs/BatchNoiseScene.vue')
  try {
    event(buttons(batch.container)[1], 'click'); await batch.update()
    assert.equal(firstTableCells(batch.container)[0], '1', 'Batch Step advances its cursor before changing batch size')
    const batchSelect = nodes(batch.container).find((node) => node.type === 'select')
    event(batchSelect, 'change', { target: { value: '1' } }); await batch.update()
    assert.equal(batchSelect.props.value, 1, 'Batch select binds the chosen batch size')
    assert.equal(firstTableCells(batch.container)[0], '0', 'Batch select resets the update cursor')
    assert.equal(nodes(batch.container).filter((node) => node.type === 'meter')[0].props.value, batchNoiseModel(1, 0).gradient[0], 'Batch select renders the selected subset model')
  } finally { await batch.unmount() }

  const schedule = await mountScene('/src/modules/optimizer-comparison/labs/ScheduleCadenceScene.vue')
  try {
    event(buttons(schedule.container)[1], 'click'); await schedule.update()
    assert.equal(firstTableCells(schedule.container)[0], '1', 'Schedule Step advances its cursor before changing schedule')
    const scheduleSelect = nodes(schedule.container).find((node) => node.type === 'select')
    event(scheduleSelect, 'change', { target: { value: 'step' } }); await schedule.update()
    assert.equal(scheduleSelect.props.value, 'step', 'Schedule select binds the chosen mode')
    assert.equal(firstTableCells(schedule.container)[0], '0', 'Schedule select resets the update cursor')
    assert.equal(firstTableCells(schedule.container)[1], scheduleModel('step', 0).learningRate.toFixed(6), 'Schedule select renders the selected schedule model')
  } finally { await schedule.unmount() }

  const restoreCurveFetch = mockPublishedCurveFetch()
  const curve = await mountScene('/src/modules/optimizer-comparison/labs/CurveDiagnosisScene.vue')
  try {
    await new Promise((resolve) => setTimeout(resolve, 0)); await curve.update()
    event(buttons(curve.container)[1], 'click'); await curve.update()
    assert.match(text(nodes(curve.container).find((node) => node.type === 'table')), /at update 2/, 'Curve Step advances its cursor before changing comparison')
    const curveSelect = nodes(curve.container).find((node) => node.type === 'select')
    event(curveSelect, 'change', { target: { value: 'practical' } }); await curve.update()
    const curveTable = text(nodes(curve.container).find((node) => node.type === 'table'))
    const practicalRow = publishedOptimizerSnapshot.trajectories.find((row) => row.comparison === 'predeclared-practical' && row.update === 1)
    assert.equal(curveSelect.props.value, 'practical', 'Curve select binds the chosen comparison mode')
    assert.match(curveTable, /predeclared-practical MLP at update 1/, 'Curve select resets the cursor and renders the selected comparison caption')
    assert.ok(practicalRow && curveTable.includes(practicalRow.trainLoss.toFixed(6)), 'Curve select renders the selected trajectory model')
  } finally { await curve.unmount(); restoreCurveFetch() }
})

test('shared playback advances, pauses, and clears its timer on component unmount', async () => {
  globalThis.window = { matchMedia: () => ({ matches: false }) }
  let cursor
  const Harness = defineComponent({
    setup() {
      cursor = ref(0)
      const playback = useScenePlayback({ value: cursor, initial: 0, maximum: 4, cadence: 10 })
      return () => h('div', [h('button', { onClick: playback.play }, 'play'), h('button', { onClick: playback.pause }, 'pause'), h('output', String(cursor.value))])
    },
  })
  const container = { type: 'root', props: {}, children: [], parent: null }
  const app = renderer().createApp(Harness)
  app.mount(container); await nextTick()
  event(nodes(container).find((node) => node.type === 'button'), 'click')
  await new Promise((resolve) => setTimeout(resolve, 35)); await nextTick()
  assert.ok(cursor.value > 0, 'playing advances the bounded cursor')
  event(nodes(container).filter((node) => node.type === 'button')[1], 'click')
  const paused = cursor.value
  await new Promise((resolve) => setTimeout(resolve, 25)); assert.equal(cursor.value, paused, 'pause stops the deterministic cadence')
  app.unmount(); await new Promise((resolve) => setTimeout(resolve, 25)); assert.equal(cursor.value, paused, 'unmount cleanup clears the playback timer')
})

test('reduced motion keeps step/reset and fetch failures render the same hash-bound values', async () => {
  globalThis.window = { matchMedia: () => ({ matches: true }) }
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => { throw new Error('network unavailable') }
  try {
    const mounted = await mountScene('/src/modules/optimizer-comparison/labs/CurveDiagnosisScene.vue', 'en')
    await new Promise((resolve) => setTimeout(resolve, 0)); await mounted.update()
    const rendered = text(mounted.container)
    assert.match(rendered, /Reduced motion is enabled/)
    assert.match(rendered, /Published snapshot/)
    assert.match(rendered, new RegExp(publishedOptimizerSnapshot.banknote.finalTestEvaluation.metrics.loss.toFixed(6)))
    const play = nodes(mounted.container).find((node) => node.type === 'button')
    assert.equal(play.props.disabled, true, 'reduced motion disables only continuous playback')
    assert.equal(nodes(mounted.container).filter((node) => node.type === 'button').length, 3, 'step and reset stay available')
    await mounted.unmount()
  } finally { globalThis.fetch = originalFetch }
})
