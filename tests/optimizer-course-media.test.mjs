import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import { createRenderer, h, nextTick } from 'vue'
import { createI18n } from 'vue-i18n'
import { createServer } from 'vite'
import { optimizerMediaMetadataSha256, optimizerMediaRegistry } from '../src/modules/optimizer-comparison/data/media.ts'

const root = resolve(import.meta.dirname, '..')
const require = createRequire(import.meta.url)
const vueRuntimeUrl = pathToFileURL(require.resolve('vue/dist/vue.runtime.esm-bundler.js')).href
const i18nRuntimeUrl = pathToFileURL(require.resolve('vue-i18n/dist/vue-i18n.esm-bundler.js')).href
const exportHelperUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent('export default function exportSfc(component, props) { for (const [key, value] of props) component[key] = value; return component }')}`
const markdownStubUrl = `data:text/javascript;charset=utf-8,${encodeURIComponent("export default { props: ['source'], render() { return null } }")}`

function renderer() {
  return createRenderer({
    patchProp(el, key, _previous, next) { el.props[key] = next },
    insert(el, parent) { el.parent = parent; parent.children.push(el) },
    remove(el) { if (el.parent) el.parent.children = el.parent.children.filter((child) => child !== el) },
    createElement(type) { return { type, props: {}, children: [], parent: null, focus() {}, pause() {} } },
    createText(text) { return { type: '#text', text, props: {}, children: [], parent: null } },
    createComment(text) { return { type: '#comment', text, props: {}, children: [], parent: null } },
    setText(node, text) { node.text = text },
    setElementText(node, text) { node.text = text; node.children = [] },
    parentNode(node) { return node.parent }, nextSibling() { return null },
  })
}

async function loadPlayer(server) {
  const transformed = await server.transformRequest('/src/components/ChapteredMediaPlayer.vue')
  assert.ok(transformed?.code, 'ChapteredMediaPlayer transforms through Vite')
  let code = transformed.code
    .replace(/import\s+\{\s*createHotContext[\s\S]*?;\s*/, '')
    .replace(/import\.meta\.hot\s*=\s*__vite__createHotContext\([^;]+;\s*/, '')
    .replace(/\n_sfc_main\.__hmrId[\s\S]*?import _export_sfc/, '\nimport _export_sfc')
  const replacements = new Map()
  for (const match of code.matchAll(/(?:from\s+|import\s*)["']([^"']+)["']/g)) {
    const specifier = match[1]
    if (specifier.startsWith('/node_modules/.vite/deps/vue.js')) replacements.set(specifier, vueRuntimeUrl)
    else if (specifier.startsWith('/node_modules/.vite/deps/vue-i18n')) replacements.set(specifier, i18nRuntimeUrl)
    else if (specifier.startsWith('/@id/__x00__plugin-vue:export-helper')) replacements.set(specifier, exportHelperUrl)
    else if (specifier.includes('type=style')) replacements.set(specifier, 'data:text/javascript;charset=utf-8,export default {}')
    else if (specifier.includes('MarkdownMathContent.vue')) replacements.set(specifier, markdownStubUrl)
    else if (specifier.startsWith('/src/utils/publicPath.ts')) {
      replacements.set(specifier, `data:text/javascript;charset=utf-8,${encodeURIComponent('export const withPublicBase = (path) => path')}`)
    }
  }
  for (const [specifier, replacement] of replacements) code = code.replaceAll(JSON.stringify(specifier), JSON.stringify(replacement)).replaceAll(`'${specifier}'`, `'${replacement}'`)
  return (await import(`data:text/javascript;charset=utf-8,${encodeURIComponent(code)}`)).default
}

function nodes(node, output = []) { output.push(node); for (const child of node.children ?? []) nodes(child, output); return output }
function text(node) { return nodes(node).map((item) => item.text ?? '').join(' ') }
function event(node, name) {
  const handler = node.props?.[`on${name[0].toUpperCase()}${name.slice(1)}`]
  for (const listener of Array.isArray(handler) ? handler : [handler]) listener?.()
}

async function mountPlayer(component, config, locale, reducedMotion) {
  globalThis.window = { matchMedia: () => ({ matches: reducedMotion, addEventListener() {}, removeEventListener() {} }) }
  const container = { type: 'root', props: {}, children: [], parent: null }
  const app = renderer().createApp({ render: () => h(component, config) })
  app.use(createI18n({ legacy: false, locale, messages: {} }))
  app.mount(container)
  await nextTick(); await nextTick()
  return { container, async update() { await nextTick(); await nextTick() }, unmount() { app.unmount() } }
}

test('typed optimizer runtime registry mirrors every published media package and transcript source', () => {
  const metadataPath = resolve(root, 'public/manim/optimizer-comparison/metadata.json')
  assert.equal(createHash('sha256').update(readFileSync(metadataPath)).digest('hex'), optimizerMediaMetadataSha256)
  const metadata = JSON.parse(readFileSync(metadataPath, 'utf8'))
  assert.deepEqual(Object.keys(optimizerMediaRegistry), ['sgd', 'momentum', 'rmsprop', 'adam'])

  for (const [kind, config] of Object.entries(optimizerMediaRegistry)) {
    const asset = metadata.assets.find((item) => item.kind === kind)
    assert.ok(asset, `${kind} has published metadata`)
    assert.equal(config.assetPath, asset.assetPath)
    assert.equal(config.posterPath, asset.posterPath)
    assert.equal(config.package.assetId, asset.id)
    assert.equal(config.package.sha256, asset.sha256)
    assert.equal(config.package.posterSha256, asset.posterSha256)
    assert.deepEqual(config.chapterMarkers.map(({ id, startSeconds }) => ({ id, startSeconds })), asset.markers)
    assert.ok(config.title['zh-CN'].trim() && config.title.en.trim() && config.alt['zh-CN'].trim() && config.alt.en.trim())
    assert.ok(config.chapterMarkers.every((marker) => marker.title['zh-CN'].trim() && marker.title.en.trim()))
    assert.equal(config.package.transcriptZhCN.path, asset.transcriptZhCN)
    assert.equal(config.package.transcriptEn.path, asset.transcriptEn)
    for (const [locale, source] of [['zh-CN', config.package.transcriptZhCN], ['en', config.package.transcriptEn]]) {
      const published = readFileSync(resolve(root, source.path), 'utf8')
      assert.equal(createHash('sha256').update(published).digest('hex'), source.sha256)
      assert.equal(config.transcript[locale].trim(), published.trim(), `${kind} keeps the complete ${locale} transcript at runtime`)
    }
  }
})

test('every optimizer config keeps poster, localized markers, transcript, and explicit fallback controls in the shared player', async () => {
  const server = await createServer({ appType: 'custom', logLevel: 'silent', root, server: { middlewareMode: true } })
  try {
    const player = await loadPlayer(server)
    for (const [kind, config] of Object.entries(optimizerMediaRegistry)) {
      for (const locale of ['zh-CN', 'en']) {
        const normal = await mountPlayer(player, config, locale, false)
        const normalNodes = nodes(normal.container)
        const video = normalNodes.find((node) => node.type === 'video')
        const markers = normalNodes.filter((node) => node.type === 'button')
        assert.ok(video, `${kind}/${locale} renders a video when motion is allowed`)
        assert.equal(video.props.poster, config.posterPath)
        assert.equal(markers.length, config.chapterMarkers.length)
        assert.match(text(normal.container), new RegExp(config.chapterMarkers[2].title[locale]))
        event(markers[2], 'click')
        assert.equal(video.currentTime, config.chapterMarkers[2].startSeconds, `${kind}/${locale} marker seeks to its published timestamp`)
        event(video, 'error'); await normal.update()
        const failedNodes = nodes(normal.container)
        assert.ok(failedNodes.some((node) => node.type === 'img' && node.props.src === config.posterPath), `${kind}/${locale} keeps the poster after a video error`)
        assert.ok(failedNodes.filter((node) => node.type === 'button').every((node) => node.props.disabled), `${kind}/${locale} keeps non-video marker review visible after error`)
        assert.match(text(normal.container), locale === 'zh-CN' ? /视频暂时不可用/ : /video is unavailable/i)
        assert.ok(failedNodes.some((node) => node.type === 'details'), `${kind}/${locale} keeps transcript disclosure after error`)
        normal.unmount()

        const reduced = await mountPlayer(player, config, locale, true)
        const reducedNodes = nodes(reduced.container)
        assert.ok(reducedNodes.some((node) => node.type === 'img' && node.props.src === config.posterPath), `${kind}/${locale} leads with its poster for reduced motion`)
        const play = reducedNodes.find((node) => node.type === 'button' && !node.props.disabled)
        assert.ok(play, `${kind}/${locale} exposes an explicit user-controlled play action`)
        assert.ok(reducedNodes.some((node) => node.type === 'details'), `${kind}/${locale} retains the transcript for reduced motion`)
        reduced.unmount()
      }
    }
  } finally {
    await server.close()
    delete globalThis.window
  }
})
