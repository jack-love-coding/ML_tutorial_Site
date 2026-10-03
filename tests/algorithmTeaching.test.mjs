import '../scripts/register-ts-resolver.mjs'
import test from 'node:test'
import assert from 'node:assert/strict'
import { createRenderer, nextTick, reactive, ref } from 'vue'
import { moduleRegistry } from '../src/data/moduleCatalog.ts'
import { algorithmTeachingRegistry } from '../src/lessons/algorithmTeaching.ts'
import { lessonLabRegistry } from '../src/lessons/labRegistry.ts'
const { useAlgorithmCourse } = await import('../src/composables/useAlgorithmCourse.ts')
const { useAlgorithmChapterNavigation } = await import('../src/composables/useAlgorithmChapterNavigation.ts')

function mount(setup) {
  const renderer = createRenderer({
    createComment: () => ({}), insert() {}, remove() {}, createElement: () => ({}),
    createText: () => ({}), setText() {}, setElementText() {}, patchProp() {}, parentNode: () => null, nextSibling: () => null,
  })
  const app = renderer.createApp({ setup() { setup(); return () => null } })
  app.mount({})
  return () => app.unmount()
}
const flush = async () => { await new Promise(resolve => setImmediate(resolve)); await nextTick() }

test('every runtime course has one teaching mode and pilot metadata reflects actual renderers', () => {
  assert.deepEqual(Object.keys(algorithmTeachingRegistry).sort(), Object.keys(moduleRegistry).sort())
  assert.equal(lessonLabRegistry.mlp.renderer, 'neural')
  assert.equal(lessonLabRegistry.mlp.labId, 'mlp-guided-lab')
  assert.equal(lessonLabRegistry.mlp.placement, 'section')
  assert.equal(lessonLabRegistry['gradient-descent'].renderer, 'gradient')
  assert.equal(lessonLabRegistry['ai-overview'].renderer, 'blocks')
  assert.equal(algorithmTeachingRegistry.mlp.explorationRoute, '/learn/mlp/explore')
})

test('course loading rejects stale resolutions and pending work after unmount', async () => {
  const ids = ['loss-functions', 'mlp', 'classification']
  const originals = ids.map(id => moduleRegistry[id].load)
  const resolve = {}
  for (const id of ids) moduleRegistry[id].load = () => new Promise(done => { resolve[id] = done })
  const course = id => ({ slug: id, chapters: [{ id: 'first' }], presets: [] })
  const route = reactive({ path: '/learn/loss-functions', params: { moduleId: ids[0] }, query: {} })
  const ready = [], ensured = []
  let state
  const unmount = mount(() => {
    state = useAlgorithmCourse(route, { replace: async () => {} }, { ensureExperiment: id => ensured.push(id) }, (id, explicit) => ready.push([id, explicit]))
  })
  try {
    route.params.moduleId = 'mlp'
    await nextTick()
    resolve.mlp(course('mlp'))
    await flush()
    resolve['loss-functions'](course('loss-functions'))
    await flush()
    assert.equal(state.moduleDefinition.value.slug, 'mlp')
    assert.deepEqual(ensured, ['mlp'])
    assert.deepEqual(ready, [['first', false]])
    route.params.moduleId = 'classification'
    await nextTick()
    unmount()
    resolve.classification(course('classification'))
    await flush()
    assert.deepEqual(ensured, ['mlp'])
    assert.equal(state.moduleDefinition.value, undefined)
  } finally {
    ids.forEach((id, index) => { moduleRegistry[id].load = originals[index] })
  }
})

test('chapter navigation preserves reading context and cancels queued scroll work', async () => {
  const oldWindow = globalThis.window, oldDocument = globalThis.document
  const frames = new Map(), timers = new Map()
  let id = 0
  globalThis.window = {
    requestAnimationFrame(fn) { frames.set(++id, fn); return id }, cancelAnimationFrame(id) { frames.delete(id) },
    setTimeout(fn) { timers.set(++id, fn); return id }, clearTimeout(id) { timers.delete(id) },
  }
  globalThis.document = { getElementById: () => null, querySelector: () => null }
  const activeChapter = ref('first'), pushes = []
  const route = { path: '/learn/mlp/first', query: { route: 'core-learning-path' } }
  let navigation
  const unmount = mount(() => {
    navigation = useAlgorithmChapterNavigation({ route, router: { push: value => pushes.push(value) }, slug: ref('mlp'), isNeuralGuidedPage: ref(true), activeChapter, syncChapterPreset() {} })
  })
  try {
    navigation.onNeuralChapterChange('backprop')
    assert.deepEqual(pushes, [{ path: '/learn/mlp/backprop', query: route.query }])
    navigation.syncRouteChapterIntoView('backprop')
    navigation.onChapterChange('wrong-intersection')
    assert.equal(activeChapter.value, 'backprop')
    await nextTick()
    assert.equal(frames.size, 1)
    for (let iteration = 0; iteration < 2; iteration++) {
      const [id, run] = frames.entries().next().value
      frames.delete(id); run()
    }
    assert.equal(timers.size, 1)
    navigation.syncRouteChapterIntoView('another')
    unmount() // also invalidates a nextTick callback that has not scheduled its frame yet
    await nextTick()
    assert.equal(frames.size, 0)
    assert.equal(timers.size, 0)
  } finally { globalThis.window = oldWindow; globalThis.document = oldDocument }
})
