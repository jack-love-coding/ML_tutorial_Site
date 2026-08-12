import assert from 'node:assert/strict'
import test from 'node:test'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import { createRenderer, defineComponent, h, nextTick, ref } from 'vue'
import { createI18n } from 'vue-i18n'
import { createServer } from 'vite'
import { publishedOptimizerSnapshot } from '../src/modules/optimizer-comparison/labs/publishedSnapshot.ts'
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
const scenePaths = ['TrainingLedgerScene', 'BatchNoiseScene', 'MomentumRmspropScene', 'AdamDecayScene', 'ScheduleCadenceScene', 'CurveDiagnosisScene']

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
      await mounted.unmount()
    }
  }
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
