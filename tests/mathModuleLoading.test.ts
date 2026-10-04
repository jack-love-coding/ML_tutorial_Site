import '../scripts/register-ts-resolver.mjs'
import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { mathLabModuleSummaries } from '../src/curriculum/generated/mathSummaries.ts'
import { summarizeMathModule } from '../src/modules/math-lab/utils/moduleSummary.ts'
import { learningRoutes } from '../src/modules/math-lab/data/learningRoutes.ts'

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
