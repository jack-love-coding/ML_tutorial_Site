import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createServer } from 'vite'
import { curriculumModuleById } from '../src/curriculum/catalog.ts'
import { curriculumV3ProjectPrerequisites } from '../src/curriculum/v3/projects.ts'
import { mathToCodeModules } from '../src/modules/math-lab/data/mathToCode/modules.ts'
import {
  learningRouteById,
  nextModuleForRoute,
  routeProgressSummary,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const root = new URL('../', import.meta.url)
const routeIds = [
  'calculus-functions-rate-change',
  'linear-algebra-feature-space',
  'linear-algebra-matrix-transformations',
  'calculus-derivatives-local-change',
  'numpy-mathematics-implementation',
  'math-to-code-guided-studio',
] as const
const stageIds = [
  'studio-reproduce-task',
  'studio-scalar-baseline',
  'studio-vector-prediction',
  'studio-batch-prediction',
  'studio-error-comparison',
  'studio-numerical-sensitivity',
  'studio-probability-preview',
  'studio-failure-analysis',
  'studio-reflection',
] as const

test('pilot route has the exact six-module order and first-incomplete behavior', () => {
  const route = learningRouteById['math-to-code-pilot']
  assert.ok(route)
  assert.equal(route.nextStepRule, 'first-incomplete')
  assert.deepEqual(route.chapterModuleIds, routeIds)
  assert.equal(nextModuleForRoute(route, []), routeIds[0])
  assert.equal(nextModuleForRoute(route, routeIds.slice(0, 4)), routeIds[4])
  assert.equal(nextModuleForRoute(route, [routeIds[1], routeIds[0], routeIds[3]]), routeIds[2])
  assert.equal(nextModuleForRoute(route, routeIds), undefined)
  assert.deepEqual(routeProgressSummary(route, routeIds.slice(0, 5)), {
    routeId: 'math-to-code-pilot',
    completedCount: 5,
    totalCount: 6,
    completedModuleId: 'numpy-mathematics-implementation',
    nextModuleId: 'math-to-code-guided-studio',
  })
})

test('NumPy and studio are registered in the runtime registry and Curriculum Catalog', () => {
  for (const id of routeIds) assert.ok(mathLabModuleRegistry[id], `${id} missing from runtime registry`)
  for (const id of ['numpy-mathematics-implementation', 'math-to-code-guided-studio']) {
    assert.equal(curriculumModuleById.get(id)?.source.namespace, 'math-lab')
    assert.equal(curriculumModuleById.get(id)?.route, `/math-lab/modules/${id}`)
  }
})

test('guided studio is the exact full Chinese master plus equivalent complete English in nine notebook stages', () => {
  const module = mathToCodeModules.find(({ id }) => id === 'math-to-code-guided-studio')
  assert.ok(module)
  assert.deepEqual(module.sections.map(({ id }) => id), stageIds)
  assert.deepEqual(module.toc.map(({ id }) => id), stageIds)
  assert.equal(module.labs[0]?.componentName, 'MathToCodeStudioLab')

  const source = readFileSync(new URL('../docs/curriculum/v3/math-to-code/06-guided-studio.zh-CN.md', import.meta.url), 'utf8')
  const headings = [...source.matchAll(/^##\s+(.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)]
  const expected = headings.map((heading, index) => ({
    id: heading[2],
    title: heading[1],
    content: source.slice(heading.index + heading[0].length, headings[index + 1]?.index ?? source.length).trim(),
  }))
  assert.deepEqual(module.sections.map((section) => ({
    id: section.id,
    title: section.title['zh-CN'],
    content: section.content['zh-CN'],
  })), expected)

  for (const section of module.sections) {
    const zh = section.content['zh-CN']
    const en = section.content.en
    for (const token of ['本阶段目标', '前置输入', 'Starter code 与操作步骤', '预期中间结果', '观察提示', '常见失败与修复', '反思']) {
      assert.ok(zh.includes(token), `${section.id} missing ${token}`)
    }
    for (const token of ['Stage goal', 'Prior inputs', 'Starter code and steps', 'Expected intermediate results', 'Observation prompt', 'Common failures and repairs', 'Reflection']) {
      assert.ok(en.includes(token), `${section.id} missing ${token}`)
    }
    assert.ok(en.length >= zh.length * 0.55, `${section.id} English is summarized`)
    const html = renderMarkdownWithMath(en)
    assert.doesNotMatch(html, /katex-error|<script|javascript:|onerror\s*=/i)
  }

  const bilingual = module.sections.map((section) => `${section.title['zh-CN']}\n${section.title.en}\n${section.content['zh-CN']}\n${section.content.en}`).join('\n')
  for (const token of ['[10.0, 5.0]', '[1.0, -2.0]', '[1.0, 4.0]', '2.5', '[0.0, -5.0]', '2026']) {
    assert.ok(bilingual.includes(token), `studio missing ${token}`)
  }
  assert.match(bilingual, /概率预告.*非完整概率课程|Probability preview.*not a complete probability course/is)
  assert.match(bilingual, /project-math-to-code.*Gradient Descent.*Monte Carlo|Gradient Descent.*Monte Carlo.*project-math-to-code/is)
})

test('studio and lab stay local-only with no grading, upload, evidence, or progress contract', () => {
  const module = mathToCodeModules.find(({ id }) => id === 'math-to-code-guided-studio')!
  const labSource = readFileSync(new URL('../src/modules/math-lab/labs/MathToCodeStudioLab.vue', import.meta.url), 'utf8')
  const combined = `${JSON.stringify(module)}\n${labSource}`
  assert.doesNotMatch(combined, /evidence-change|ExperimentEvidence|defineEmits|recordLearningProgress|markModuleComplete|localStorage|upload|submit|score|grade|passed|正式评分|提交作业/i)
  assert.equal(module.labs[0]?.task, undefined)
})

test('studio lab is lazy registered once and SSR exposes full intermediate text fallback', async () => {
  const page = readFileSync(new URL('../src/modules/math-lab/pages/MathLabModulePage.vue', import.meta.url), 'utf8')
  assert.equal((page.match(/MathToCodeStudioLab:\s*defineAsyncComponent/g) ?? []).length, 1)
  assert.match(page, /import\('\.\.\/labs\/MathToCodeStudioLab\.vue'\)/)

  const server = await createServer({ root: new URL('.', root).pathname, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
  try {
    const component = (await server.ssrLoadModule('/src/modules/math-lab/labs/MathToCodeStudioLab.vue')).default
    const html = await renderToString(createSSRApp({ render: () => h(component, { locale: 'en' }) }))
    assert.match(html, /Input matrix X.*Targets y.*Predictions y_hat.*Residuals.*Squared errors.*MSE.*Parameter derivatives/s)
    assert.match(html, /\[\[2, 3\], \[1, 4\]\].*\[9, 7\].*\[10, 5\].*\[1, -2\].*\[1, 4\].*2\.5.*\[0, -5\].*-1/s)
    assert.match(html, /Reset inputs/)
    assert.match(html, /type="number"/)
    assert.match(html, /<table[\s>]/)
    assert.match(html, /prefers-reduced-motion/)
  } finally {
    await server.close()
  }
})

test('formal Project 1 prerequisites remain strictly Gradient Descent and Monte Carlo', () => {
  assert.deepEqual(curriculumV3ProjectPrerequisites['project-math-to-code'], ['gradient-descent', 'monte-carlo'])
})
