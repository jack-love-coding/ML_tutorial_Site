import '../scripts/register-ts-resolver.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync, readdirSync } from 'node:fs'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { mathLabModuleSummaries } from '../src/curriculum/generated/mathSummaries.ts'
import { summarizeMathModule } from '../src/modules/math-lab/utils/moduleSummary.ts'
import { learningRoutes } from '../src/modules/math-lab/data/learningRoutes.ts'
import { createMathModuleLoader } from '../src/modules/math-lab/utils/moduleLoader.ts'
import { createMathCourseRequest } from '../src/modules/math-lab/utils/courseRequest.ts'
import type { MathLabModule } from '../src/modules/math-lab/types/mathLab.ts'

test('math resource summaries preserve every card and route without course bodies', () => {
  assert.deepEqual(mathLabModuleSummaries, mathLabModules.map(summarizeMathModule))
  assert.equal(mathLabModuleSummaries.length, 33)
  assert.ok(Buffer.byteLength(JSON.stringify(mathLabModuleSummaries)) < 50000)
  const ids = new Set(mathLabModuleSummaries.map(module => module.id))
  for (const route of learningRoutes) for (const id of route.chapterModuleIds) assert.ok(ids.has(id), `${route.id}/${id}`)
  for (const module of mathLabModuleSummaries) {
    assert.ok(!('sections' in module) && !('labs' in module) && !('quizzes' in module))
  }
  const home = readFileSync(new URL('../src/modules/math-lab/pages/MathLabHome.vue', import.meta.url), 'utf8')
  assert.doesNotMatch(home, /from ['"]\.\.\/data\/modules/)
})

test('all generated math bodies match final providers field by field', () => {
  const directory = new URL('../src/curriculum/generated/mathCourses/', import.meta.url)
  assert.deepEqual(readdirSync(directory).sort(), mathLabModules.map(module => module.id + '.json').sort())
  for (const module of mathLabModules) {
    const body = readFileSync(new URL(module.id + '.json', directory), 'utf8')
    assert.deepEqual(JSON.parse(body), JSON.parse(JSON.stringify(module)), module.id)
    assert.ok(Buffer.byteLength(body) < 150000, module.id)
  }
  for (const path of ['pages/MathLabModulePage.vue', 'utils/continueRoute.ts']) {
    assert.doesNotMatch(readFileSync(new URL('../src/modules/math-lab/' + path, import.meta.url), 'utf8'), /from ['"]\.\.\/data\/modules/)
  }
})

test('math loader caches successful and in-flight courses, rejects wrong IDs and retries failures', async () => {
  const module = mathLabModules[0]!
  let calls = 0
  const loader = createMathModuleLoader({ [module.id]: async () => {
    calls++
    if (calls === 1) throw new Error('offline')
    if (calls === 2) return { ...module, id: 'wrong' }
    return module
  } })
  assert.equal(await loader('unknown'), undefined)
  assert.equal(await loader('__proto__'), undefined)
  await assert.rejects(loader(module.id), /offline/)
  await assert.rejects(loader(module.id), /mismatch/)
  const first = loader(module.id)
  assert.equal(first, loader(module.id))
  assert.equal(await first, module)
  assert.equal(await loader(module.id), module)
  assert.equal(calls, 3)
})

test('math page requests discard stale successes and errors, clear old content and stop on unmount', async () => {
  const pending = new Map<string, { resolve: (module: MathLabModule) => void; reject: (error: Error) => void }>()
  const state = createMathCourseRequest(id => new Promise<MathLabModule>((resolve, reject) => pending.set(id, { resolve, reject })))
  const [a, b] = mathLabModules as [MathLabModule, MathLabModule, ...MathLabModule[]]
  const old = state.request(a.id)
  const current = state.request(b.id)
  pending.get(b.id)!.resolve(b)
  await current
  pending.get(a.id)!.reject(new Error('late failure'))
  await old
  assert.equal(state.module.value, b)
  assert.equal(state.failed.value, false)
  const stale = state.request(a.id)
  assert.equal(state.module.value, undefined)
  const latest = state.request(b.id)
  pending.get(b.id)!.resolve(b)
  await latest
  pending.get(a.id)!.resolve(a)
  await stale
  assert.equal(state.module.value, b)
  const failed = state.request(a.id)
  pending.get(a.id)!.reject(new Error('offline'))
  await failed
  assert.equal(state.failed.value, true)
  const unmounted = state.request(a.id)
  assert.equal(state.failed.value, false)
  state.dispose()
  pending.get(a.id)!.resolve(a)
  await unmounted
  assert.equal(state.module.value, undefined)
})
