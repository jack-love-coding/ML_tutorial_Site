import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createServer } from 'vite'
import { mathToCodeModules } from '../src/modules/math-lab/data/mathToCode/modules.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const root = new URL('../', import.meta.url)
const sectionOrder = [
  'opening-question', 'prerequisite-recap', 'shared-prediction-task', 'mapping-intuition',
  'formal-definition', 'worked-prediction', 'worked-motion-example', 'python-translation',
  'controlled-experiment', 'misconceptions', 'layered-practice', 'lesson-handoff',
]

function allLocalizedCopies(value: unknown): Array<{ 'zh-CN': string, en: string }> {
  if (!value || typeof value !== 'object') return []
  if ('zh-CN' in value && 'en' in value) return [value as { 'zh-CN': string, en: string }]
  return Object.values(value).flatMap(allLocalizedCopies)
}

test('gold lesson replaces the existing runtime ID with a complete bilingual 12-section module', () => {
  const module = mathToCodeModules.find((candidate) => candidate.id === 'calculus-functions-rate-change')
  assert.ok(module)
  const runtimeModule = mathLabModuleRegistry[module.id]
  assert.equal(module.sourceNoteFile, 'math-lab-calculus-route-sources.md')
  assert.equal(runtimeModule.sourceNoteFile, module.sourceNoteFile)
  assert.equal(runtimeModule.title.en, module.title.en)
  assert.equal(runtimeModule.sections, module.sections)
  assert.deepEqual(runtimeModule.nextModuleIds, ['calculus-derivatives-local-change'])
  assert.deepEqual(module.sections.map((section) => section.id), sectionOrder)
  assert.deepEqual(module.toc.map((item) => item.id), sectionOrder)

  const copies = allLocalizedCopies(module)
  assert.ok(copies.length > 90)
  for (const copy of copies) {
    assert.ok(copy['zh-CN'].trim().length >= 1)
    assert.ok(copy.en.trim().length >= 1)
    assert.doesNotMatch(copy['zh-CN'], /<script|onerror\s*=|javascript:/i)
    assert.doesNotMatch(copy.en, /<script|onerror\s*=|javascript:/i)
  }
  assert.ok(module.sections.every((section) => section.content.en.length >= section.content['zh-CN'].length * 0.45))
})

test('lesson preserves the shared numbers, formulas, two examples, feedback, practice, and handoff', () => {
  const module = mathToCodeModules[0]!
  const body = (locale: 'zh-CN' | 'en') => module.sections.map((section) => section.content[locale]).join('\n')
  for (const locale of ['zh-CN', 'en'] as const) {
    const text = body(locale)
    for (const token of ['[2, 3]', '[4, -1]', 'bias = 5', 'target = 9', 'prediction = 10', '2w_1+2', '3.5', 's(4)', '14']) {
      assert.match(text, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
    }
    assert.match(text, /8\s*\+\s*\(-3\)\s*\+\s*5\s*=\s*10/)
    assert.match(text, /w_1x_1\+w_2x_2\+b/)
  }
  assert.equal(module.concepts.length, 2)
  assert.ok(module.misconceptions.length >= 4)
  assert.ok(module.quizzes.length >= 4)
  assert.ok(module.quizzes.every((quiz) => quiz.explanation['zh-CN'].length > 20 && quiz.explanation.en.length > 20))
  assert.match(module.sections[8]!.content['zh-CN'], /形成性反馈/)
  assert.match(module.sections[8]!.content.en, /Formative feedback/)
  assert.match(module.sections[10]!.content.en, /not graded/i)
  assert.match(module.sections[11]!.content.en, /vector|dot product/i)

  for (const section of module.sections) {
    for (const locale of ['zh-CN', 'en'] as const) {
      const html = renderMarkdownWithMath(section.content[locale])
      assert.doesNotMatch(html, /<script|onerror\s*=|javascript:/i)
      assert.doesNotMatch(html, /\$\$/)
      assert.doesNotMatch(html, /katex-error|\\<\/code>/)
    }
  }
})

test('focused lab is typed into the lesson and lazy-registered once', () => {
  const module = mathToCodeModules[0]!
  assert.deepEqual(module.labs.map((lab) => lab.componentName), ['PredictionMappingLab'])
  assert.deepEqual(module.sections.flatMap((section) => section.labIds ?? []), ['prediction-mapping-lab'])
  const page = readFileSync(new URL('../src/modules/math-lab/pages/MathLabModulePage.vue', import.meta.url), 'utf8')
  assert.equal((page.match(/PredictionMappingLab:\s*defineAsyncComponent/g) ?? []).length, 1)
  assert.match(page, /import\('\.\.\/labs\/PredictionMappingLab\.vue'\)/)
})

test('lab SSR exposes one bounded w1 control, reset, numeric readouts, and static table fallback', async () => {
  const server = await createServer({ root: new URL('.', root).pathname, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
  try {
    const component = (await server.ssrLoadModule('/src/modules/math-lab/labs/PredictionMappingLab.vue')).default
    const html = await renderToString(createSSRApp({ render: () => h(component, { locale: 'en' }) }))
    assert.equal((html.match(/type="range"/g) ?? []).length, 1)
    assert.match(html, /min="2"/)
    assert.match(html, /max="6"/)
    assert.match(html, /step="0\.5"/)
    assert.match(html, /First weight w1.*Current value/s)
    assert.match(html, /Reset to w1 = 4/)
    assert.match(html, /Prediction.*Residual.*MSE/s)
    assert.match(html, /<table[\s>].*w1.*Prediction.*Residual.*Squared error/s)
    assert.match(html, /Fixed: x = \[2, 3\], w2 = -1, bias = 5, target = 9/)
  } finally {
    await server.close()
  }
})

test('lab evidence is formative display only and never marks completion or grading', () => {
  const source = readFileSync(new URL('../src/modules/math-lab/labs/PredictionMappingLab.vue', import.meta.url), 'utf8')
  assert.match(source, /evaluatePredictionTask/)
  assert.match(source, /Number\.isFinite/)
  assert.match(source, /evidence-change/)
  assert.doesNotMatch(source, /markModuleComplete|correct:\s*true|score|grade|passed/i)
})
