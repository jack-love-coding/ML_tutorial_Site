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
  assert.ok(module.sections.reduce((total, section) => total + section.content['zh-CN'].length, 0) >= 12_000)
  assert.ok(module.sections.reduce((total, section) => total + section.content.en.length, 0) >= 16_000)

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

test('each gold section preserves the approved manuscript teaching contract instead of a summary', () => {
  const module = mathToCodeModules[0]!
  const contracts: Record<string, string[]> = {
    'opening-question': ['为什么两个输入', '先作预测', 'billions of parameters', 'Make a prediction first'],
    'prerequisite-recap': ['2.1', '2.2', '2.3', '索引 0', 'index 0', 'g(a)=4a-1'],
    'shared-prediction-task': ['分钟/基础任务', 'minutes/base task', '帽子符号', 'hat symbol', 'F(\\mathbf x;\\mathbf w,b)'],
    'mapping-intuition': ['多对一', 'Many-to-one', '函数组合', 'Function composition', 'r\\xrightarrow'],
    'formal-definition': ['定义域', '陪域', '值域', 'domain', 'codomain', 'range', 'features = [2, 3, 8]'],
    'worked-prediction': ['三栏账本', 'contribution ledger', '反向核验', 'Cross-check', 'r=\\hat y-y'],
    'worked-motion-example': ['t（秒）', 't (seconds)', '0 | 2', '4 | 14', '类比的边界', 'limits of the analogy'],
    'python-translation': ['def predict_one', 'raise ValueError', 'zip', '静默截', 'silently truncates', 'weights.shape', 'contributions.sum'],
    'controlled-experiment': ['candidate_w1', 'squared_error', '2 | 6 | -3 | 9', '6 | 14 | 5 | 25', '形成性反馈', 'Formative feedback'],
    misconceptions: ['为什么容易发生', 'Why it seems plausible', '本例诊断', 'Diagnosis in this example', '修复动作', 'Repair action'],
    'layered-practice': ['练习 1A', '练习 3C', 'Exercise 1A', 'Exercise 3C', '提示', 'Hint', '参考推理', 'Reference reasoning', '回看', 'Review'],
    'lesson-handoff': ['四件可观察的事', 'four observable abilities', '样本向量候选', 'candidate sample vector', 'w^T x = 4*2 + (-1)*3 = 5'],
  }

  for (const section of module.sections) {
    const combined = `${section.content['zh-CN']}\n${section.content.en}`
    for (const token of contracts[section.id] ?? []) {
      assert.ok(combined.includes(token), `${section.id} must preserve ${token}`)
    }
  }
})

test('runtime keeps all nine formative exercises with hint, reasoning, and section review links in both locales', () => {
  const practice = mathToCodeModules[0]!.sections.find((section) => section.id === 'layered-practice')!
  for (const locale of ['zh-CN', 'en'] as const) {
    const content = practice.content[locale]
    for (const id of ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C']) {
      const nextId = id === '3C' ? '$' : `(?=(?:\\*\\*)?(?:练习|Exercise)\\s+${['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C'][['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C'].indexOf(id) + 1]})`
      const block = content.match(new RegExp(`(?:\\*\\*)?(?:练习|Exercise)\\s+${id}[\\s\\S]*?${nextId}`))?.[0] ?? ''
      assert.ok(block, `${locale} must include exercise ${id}`)
      assert.match(block, locale === 'zh-CN' ? /提示/ : /Hint/)
      assert.match(block, locale === 'zh-CN' ? /参考推理/ : /Reference reasoning/)
      assert.match(block, locale === 'zh-CN' ? /\]\(#(?:shared-prediction-task|mapping-intuition|formal-definition|worked-prediction|python-translation|controlled-experiment|worked-motion-example)\)/ : /\]\(#(?:shared-prediction-task|mapping-intuition|formal-definition|worked-prediction|python-translation|controlled-experiment|worked-motion-example)\)/)
    }
  }
})

test('quiz feedback references real misconceptions and real review anchors', () => {
  const module = mathToCodeModules[0]!
  const misconceptionIds = new Set(module.misconceptions.map((item) => item.id))
  const reviewIds = new Set([
    ...module.sections.map((section) => section.id),
    ...module.labs.map((lab) => lab.id),
    ...module.visuals.map((visual) => visual.id),
  ])
  for (const quiz of module.quizzes) {
    assert.ok(quiz.misconceptionTags.length > 0)
    assert.ok(quiz.misconceptionTags.every((tag) => misconceptionIds.has(tag)), `${quiz.id} has an unknown misconception tag`)
    assert.ok(quiz.revisitVisualId && reviewIds.has(quiz.revisitVisualId), `${quiz.id} needs a real review anchor`)
  }
  const misconceptionById = new Map(module.misconceptions.map((item) => [item.id, item]))
  const parameterChange = misconceptionById.get('parameter-change-one-to-one')
  assert.ok(parameterChange)
  assert.match(`${parameterChange.statement.en} ${parameterChange.correction.en} ${parameterChange.example.en}`, /w1.*x1.*increase.*2/i)
  const largerIsBetter = misconceptionById.get('larger-is-better')
  assert.ok(largerIsBetter)
  assert.match(`${largerIsBetter.statement.en} ${largerIsBetter.correction.en} ${largerIsBetter.example.en}`, /larger.*target.*error.*25/i)
  assert.equal(module.quizzes.find((quiz) => quiz.id === 'mapping-control-check')?.misconceptionTags[0], 'parameter-change-one-to-one')
  assert.equal(module.quizzes.find((quiz) => quiz.id === 'mapping-error-check')?.misconceptionTags[0], 'larger-is-better')
})

test('NumPy translation preserves the complete named variable chain in both locales', () => {
  const section = mathToCodeModules[0]!.sections.find((item) => item.id === 'python-translation')!
  for (const locale of ['zh-CN', 'en'] as const) {
    const body = section.content[locale]
    for (const line of [
      'bias = 5.0',
      'target = 9.0',
      'weighted_sum = weights @ features',
      'prediction = weighted_sum + bias',
      'residual = prediction - target',
    ]) assert.ok(body.includes(line), `${locale} NumPy code needs ${line}`)
  }
})

test('calculus route source record names the gold lesson, local-only lab, and actual authorities', () => {
  const source = readFileSync(new URL('../docs/math-lab-calculus-route-sources.md', import.meta.url), 'utf8')
  assert.match(source, /Functions and Mappings: How Inputs Become Predictions/)
  assert.match(source, /PredictionMappingLab/)
  assert.match(source, /local-only formative readouts|本地形成性读数/i)
  assert.match(source, /3Blue1Brown.*Mathematics for Machine Learning/s)
  assert.doesNotMatch(source, /This pass does not add new Manim scenes/)
})

test('source references are deployable external authorities with specific usage', () => {
  const references = mathToCodeModules[0]!.sourceReferences ?? []
  assert.ok(references.length >= 2)
  for (const reference of references) {
    assert.match(reference.href, /^https:\/\//)
    assert.doesNotMatch(reference.href, /\/docs\/|localhost|127\.0\.0\.1/)
    assert.ok(reference.usage['zh-CN'].length > 15)
    assert.ok(reference.usage.en.length > 25)
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

test('lab is purely formative and exposes no evidence emission contract', () => {
  const source = readFileSync(new URL('../src/modules/math-lab/labs/PredictionMappingLab.vue', import.meta.url), 'utf8')
  assert.match(source, /evaluatePredictionTask/)
  assert.match(source, /Number\.isFinite/)
  assert.doesNotMatch(source, /evidence-change|ExperimentEvidence|defineEmits|recordLearningProgress|markModuleComplete|correct:\s*true|score|grade|passed/i)
})
