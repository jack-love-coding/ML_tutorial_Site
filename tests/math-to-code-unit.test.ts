import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { mathToCodeModules } from '../src/modules/math-lab/data/mathToCode/modules.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const cases = [
  {
    id: 'linear-algebra-feature-space', prefix: 'vectors', formula: /w\^\\mathsf T x\+b|w\^T x \+ b/,
    anchors: ['带单位线性泛函', 'unit-bearing linear functional', 'u = [3, 4]', 'v = [4, 0]', 'X = [[2, 3], [1, 4]]'],
    handoff: /matrix|矩阵/i,
  },
  {
    id: 'linear-algebra-matrix-transformations', prefix: 'matrices', formula: /Xw\+b/,
    anchors: ['(2,2) @ (2,) -> (2,)', '[10, 5]', '[[1, 0], [0, -1]]', 'axis 0', 'axis=0'],
    handoff: /derivative|导数/i,
  },
  {
    id: 'calculus-derivatives-local-change', prefix: 'derivatives', formula: /L\(\\theta\+h\)-L\(\\theta-h\)/,
    anchors: ['central difference', '中央差分', '[0, -5, -1]', 's(t) = t^2', 'slope_at_3 = 6', 'not gradient descent', '不等于梯度下降'],
    handoff: /NumPy/i,
  },
  {
    id: 'numpy-mathematics-implementation', prefix: 'numpy', formula: /X\s*@\s*w\s*\+\s*b/,
    anchors: ['np.asarray', 'np.isfinite', 'predictions = [10.0, 5.0]', 'MSE = 2.5', 'ValueError', 'broadcast'],
    handoff: /studio|项目|实验/i,
  },
] as const

const sectionSuffixes = [
  'opening', 'recap', 'shared-task', 'intuition', 'formal', 'worked-shared',
  'worked-auxiliary', 'code', 'experiment', 'misconceptions', 'practice', 'handoff',
] as const

const manuscriptFiles = [
  '02-vectors-samples.zh-CN.md',
  '03-matrices-batches.zh-CN.md',
  '04-derivatives-error.zh-CN.md',
  '05-numpy-implementation.zh-CN.md',
] as const

function copies(value: unknown): Array<{ 'zh-CN': string, en: string }> {
  if (!value || typeof value !== 'object') return []
  if ('zh-CN' in value && 'en' in value) return [value as { 'zh-CN': string, en: string }]
  return Object.values(value).flatMap(copies)
}

test('Task 6 lessons retain their exact promotion prefix after the guided studio is appended', () => {
  assert.deepEqual(mathToCodeModules.slice(0, 5).map((module) => module.id), [
    'calculus-functions-rate-change',
    ...cases.map(({ id }) => id),
  ])
  assert.equal(mathToCodeModules[5]?.id, 'math-to-code-guided-studio')

  for (const lesson of cases) {
    const module = mathToCodeModules.find(({ id }) => id === lesson.id)
    assert.ok(module, lesson.id)
    assert.deepEqual(module.sections.map(({ id }) => id), sectionSuffixes.map((suffix) => `${lesson.prefix}-${suffix}`))
    assert.deepEqual(module.toc.map(({ id }) => id), module.sections.map(({ id }) => id))
    assert.equal(module.sections.length, 12)
    assert.ok(module.sections.reduce((sum, section) => sum + section.content['zh-CN'].length, 0) >= 8_000)
    assert.ok(module.sections.reduce((sum, section) => sum + section.content.en.length, 0) >= 7_000)
    for (const localized of copies(module)) {
      assert.ok(localized['zh-CN'].trim())
      assert.ok(localized.en.trim())
    }
  }
})

test('runtime Chinese sections are exact full-text projections of all four approved manuscripts', () => {
  for (const [index, file] of manuscriptFiles.entries()) {
    const source = readFileSync(new URL(`../docs/curriculum/v3/math-to-code/${file}`, import.meta.url), 'utf8')
    const headings = [...source.matchAll(/^##\s+(.+?)\s+\{#([a-z0-9-]+)\}\s*$/gm)]
    const expected = headings.map((heading, headingIndex) => ({
      id: heading[2],
      title: heading[1],
      content: source.slice(heading.index + heading[0].length, headings[headingIndex + 1]?.index ?? source.length).trim(),
    }))
    const module = mathToCodeModules[index + 1]!
    assert.deepEqual(module.sections.map((section) => ({
      id: section.id,
      title: section.title['zh-CN'],
      content: section.content['zh-CN'],
    })), expected, file)
  }
})

test('three legacy IDs remain runtime replacements and Task 7 registers NumPy', () => {
  for (const { id } of cases.slice(0, 3)) {
    const promoted = mathToCodeModules.find((module) => module.id === id)!
    const runtime = mathLabModuleRegistry[id]!
    const omittedRuntimeSections: Readonly<Record<string, readonly string[]>> = {
      'linear-algebra-feature-space': ['vectors-practice', 'vectors-handoff'],
      'linear-algebra-matrix-transformations': ['matrices-practice', 'matrices-handoff'],
      'calculus-derivatives-local-change': ['derivatives-practice'],
    }
    const omitted = omittedRuntimeSections[id] ?? []
    if (omitted.length > 0) {
      for (const sectionId of omitted) {
        assert.equal(runtime.sections.some((section) => section.id === sectionId), false)
      }
      for (const sourceSection of promoted.sections.filter((section) => !omitted.includes(section.id))) {
        const runtimeSection = runtime.sections.find((section) => section.id === sourceSection.id)
        assert.ok(runtimeSection)
        assert.equal(runtimeSection.content, sourceSection.content)
      }
      assert.ok(runtime.concepts.some((concept) => concept.codeOutput), `${id} needs pasted reference output`)
    } else {
      assert.equal(runtime.sections, promoted.sections)
    }
    if (id === 'linear-algebra-feature-space') {
      assert.ok(runtime.sections.some((section) => section.id === 'v3-vector-shared-profiles'))
    } else if (id === 'linear-algebra-matrix-transformations') {
      assert.ok(runtime.sections.some((section) => section.id === 'v3-matrix-shared-batch'))
    } else if (id === 'calculus-derivatives-local-change') {
      assert.ok(runtime.sections.some((section) => section.id === 'minimum-derivative-local-approximation'))
    }
    assert.equal(mathLabModuleRegistry[id]?.title.en, promoted.title.en)
  }
  assert.equal(
    mathLabModuleRegistry['numpy-mathematics-implementation']?.sections,
    mathToCodeModules.find((module) => module.id === 'numpy-mathematics-implementation')?.sections,
  )
})

test('each lesson protects vocabulary, formulas, two examples, safe failures, experiment and handoff', () => {
  for (const lesson of cases) {
    const module = mathToCodeModules.find(({ id }) => id === lesson.id)!
    const body = module.sections.map((section) => `${section.content['zh-CN']}\n${section.content.en}`).join('\n')
    assert.match(body, lesson.formula, `${lesson.id} formula`)
    for (const anchor of lesson.anchors) assert.ok(body.includes(anchor), `${lesson.id} needs ${anchor}`)
    assert.match(module.sections[11]!.content['zh-CN'] + module.sections[11]!.content.en, lesson.handoff)
    assert.ok(module.concepts.length >= 2)
    assert.ok(module.misconceptions.length >= 4)
    assert.ok(module.quizzes.length >= 4)
    assert.match(module.sections[8]!.title['zh-CN'] + module.sections[8]!.content['zh-CN'], /控制实验|形成性反馈/)
    assert.match(module.sections[8]!.title.en + module.sections[8]!.content.en, /controlled experiment|formative feedback/i)
    for (const section of module.sections) {
      for (const locale of ['zh-CN', 'en'] as const) {
        const html = renderMarkdownWithMath(section.content[locale])
        assert.doesNotMatch(html, /<script|javascript:|onerror\s*=/i)
        assert.doesNotMatch(html, /katex-error|\$\$/)
      }
    }
  }
})

test('all 36 formative exercise blocks include hint, reference reasoning, and a real backlink', () => {
  const exerciseIds = ['1A', '1B', '1C', '2A', '2B', '2C', '3A', '3B', '3C']
  for (const lesson of cases) {
    const module = mathToCodeModules.find(({ id }) => id === lesson.id)!
    const practice = module.sections[10]!
    const sectionIds = new Set(module.sections.map(({ id }) => id))
    for (const locale of ['zh-CN', 'en'] as const) {
      const content = practice.content[locale]
      for (const [index, id] of exerciseIds.entries()) {
        const next = exerciseIds[index + 1]
        const block = content.match(new RegExp(`(?:练习|Exercise) ${id}[\\s\\S]*?${next ? `(?=(?:练习|Exercise) ${next})` : '$'}`))?.[0] ?? ''
        assert.ok(block, `${lesson.id}/${locale}/${id}`)
        assert.match(block, locale === 'zh-CN' ? /提示：/ : /Hint:/)
        assert.match(block, locale === 'zh-CN' ? /参考推理：/ : /Reference reasoning:/)
        const target = block.match(/\]\(#([a-z0-9-]+)\)/)?.[1]
        assert.ok(target && sectionIds.has(target), `${lesson.id}/${locale}/${id} backlink`)
      }
    }
  }
})

test('quiz tags and revisit targets are referentially valid and lessons stay formative-only', () => {
  for (const lesson of cases) {
    const module = mathToCodeModules.find(({ id }) => id === lesson.id)!
    const tags = new Set(module.misconceptions.map(({ id }) => id))
    const targets = new Set([...module.sections.map(({ id }) => id), ...module.labs.map(({ id }) => id), ...module.visuals.map(({ id }) => id)])
    for (const quiz of module.quizzes) {
      assert.ok(quiz.misconceptionTags.every((tag) => tags.has(tag)), `${lesson.id}/${quiz.id} tag`)
      assert.ok(quiz.revisitVisualId && targets.has(quiz.revisitVisualId), `${lesson.id}/${quiz.id} revisit`)
    }
    const serialized = JSON.stringify(module)
    assert.doesNotMatch(serialized, /ExperimentEvidence|recordLearningProgress|markModuleComplete|pass\/fail|正式评分/i)
  }
})

test('only the genuinely matching existing matrix lab is mounted', () => {
  const byId = Object.fromEntries(mathToCodeModules.map((module) => [module.id, module]))
  assert.deepEqual(byId['linear-algebra-feature-space']!.labs, [])
  assert.deepEqual(byId['calculus-derivatives-local-change']!.labs, [])
  assert.deepEqual(byId['numpy-mathematics-implementation']!.labs, [])
  assert.deepEqual(byId['linear-algebra-matrix-transformations']!.labs.map(({ componentName }) => componentName), ['MathToCodeMatrixLab'])
})
