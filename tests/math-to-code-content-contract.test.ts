import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createSSRApp, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { createServer } from 'vite'
import { mathToCodeModules } from '../src/modules/math-lab/data/mathToCode/modules.ts'
import { DEFAULT_PARAMETERS, MATH_TO_CODE_SAMPLES } from '../src/modules/math-lab/data/mathToCode/sharedTask.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import {
  learningRouteById,
  mathToCodePilotModuleIds,
  routeNavigationForModule,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import {
  centralDifference,
  evaluatePredictionTask,
  meanSquaredError,
  predictBatch,
  predictOne,
} from '../src/modules/math-lab/utils/mathToCode.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = new URL('../', import.meta.url)
const moduleIds = [...mathToCodePilotModuleIds]

function assertGloballyUnique(
  category: string,
  entries: Array<{ moduleId: string, id: string }>,
) {
  const owners = new Map<string, string>()
  for (const entry of entries) {
    const previousOwner = owners.get(entry.id)
    assert.equal(previousOwner, undefined, `${category} id ${entry.id} is shared by ${previousOwner} and ${entry.moduleId}`)
    owners.set(entry.id, entry.moduleId)
  }
}

function combinedModuleText(module: (typeof mathToCodeModules)[number]) {
  return [
    ...module.sections.flatMap((section) => [section.content['zh-CN'], section.content.en]),
    ...module.concepts.flatMap((concept) => [concept.formulaLatex, concept.codeExample ?? '']),
  ].join('\n')
}

test('the pilot consumes exactly six registered modules with globally unique teaching IDs', () => {
  assert.equal(mathToCodeModules.length, 6)
  assert.deepEqual(mathToCodeModules.map(({ id }) => id), moduleIds)
  assert.deepEqual(learningRouteById['math-to-code-pilot'].chapterModuleIds, moduleIds)

  for (const module of mathToCodeModules) {
    const registered = mathLabModuleRegistry[module.id]
    assert.ok(registered, `${module.id} is not registered`)
    assert.equal(registered.sections, module.sections, `${module.id} does not expose the promoted section record`)
    assert.equal(registered.concepts, module.concepts, `${module.id} does not expose the promoted concept record`)
    assert.equal(registered.labs, module.labs, `${module.id} does not expose the promoted lab record`)
    assert.equal(registered.quizzes, module.quizzes, `${module.id} does not expose the promoted quiz record`)
    assert.equal(registered.misconceptions, module.misconceptions, `${module.id} does not expose the promoted misconception record`)
  }

  for (const [category, select] of [
    ['section', (module: (typeof mathToCodeModules)[number]) => module.sections],
    ['concept', (module: (typeof mathToCodeModules)[number]) => module.concepts],
    ['lab', (module: (typeof mathToCodeModules)[number]) => module.labs],
    ['quiz', (module: (typeof mathToCodeModules)[number]) => module.quizzes],
    ['misconception', (module: (typeof mathToCodeModules)[number]) => module.misconceptions],
  ] as const) {
    assertGloballyUnique(category, mathToCodeModules.flatMap((module) => (
      select(module).map(({ id }) => ({ moduleId: module.id, id }))
    )))
  }
})

test('module-local references and route-level prerequisite/next references all resolve', () => {
  for (const module of mathToCodeModules) {
    const sectionIds = new Set(module.sections.map(({ id }) => id))
    const labIds = new Set(module.labs.map(({ id }) => id))
    const visualIds = new Set(module.visuals.map(({ id }) => id))
    const misconceptionIds = new Set(module.misconceptions.map(({ id }) => id))
    const reviewIds = new Set([...sectionIds, ...labIds, ...visualIds])

    assert.deepEqual(module.toc.map(({ id }) => id), module.sections.map(({ id }) => id))
    for (const section of module.sections) {
      for (const labId of section.labIds ?? []) assert.ok(labIds.has(labId), `${module.id}/${section.id} references unknown lab ${labId}`)
      for (const visualId of section.visualIds ?? []) assert.ok(visualIds.has(visualId), `${module.id}/${section.id} references unknown visual ${visualId}`)
      for (const locale of ['zh-CN', 'en'] as const) {
        for (const match of section.content[locale].matchAll(/\]\(#([a-z0-9-]+)\)/g)) {
          assert.ok(sectionIds.has(match[1]!), `${module.id}/${section.id}/${locale} links to unknown section ${match[1]}`)
        }
      }
    }
    for (const quiz of module.quizzes) {
      assert.ok(quiz.misconceptionTags.length > 0, `${module.id}/${quiz.id} needs a misconception reference`)
      for (const tag of quiz.misconceptionTags) assert.ok(misconceptionIds.has(tag), `${module.id}/${quiz.id} references unknown misconception ${tag}`)
      assert.ok(quiz.revisitVisualId && reviewIds.has(quiz.revisitVisualId), `${module.id}/${quiz.id} has an invalid review reference`)
    }
    for (const dependency of [...module.prerequisites, ...module.nextModuleIds]) {
      assert.ok(mathLabModuleRegistry[dependency], `${module.id} references unknown module ${dependency}`)
    }
  }
})

test('all lessons preserve the shared x, w, b, y_hat, y, L formula-to-code vocabulary', () => {
  const vocabulary = {
    x: /(?:\bx\b|\\mathbf x|features|matrix X|输入矩阵 X)/i,
    w: /(?:\bw\b|\\mathbf w|weights|权重 w)/i,
    b: /(?:\bb\b|bias|偏置 b)/i,
    y_hat: /(?:y_hat|\\hat y|prediction|预测)/i,
    y: /(?:\by\b|targets?|目标 y)/i,
    L: /(?:\bL\b|MSE|loss|损失)/i,
  }

  for (const module of mathToCodeModules) {
    const text = combinedModuleText(module)
    for (const [symbol, pattern] of Object.entries(vocabulary)) {
      assert.match(text, pattern, `${module.id} lost shared vocabulary ${symbol}`)
    }
  }
})

test('Task 1 utilities remain the exact numerical oracle for outputs and derivatives', () => {
  assert.equal(predictOne([2, 3], [4, -1], 5), 10)
  assert.deepEqual(predictBatch([[2, 3], [1, 4]], [4, -1], 5), [10, 5])
  assert.equal(meanSquaredError([10, 5], [9, 7]), 2.5)
  assert.ok(Math.abs(centralDifference((value) => value * value, 3, 1e-4) - 6) < 1e-6)

  const evaluation = evaluatePredictionTask({ samples: MATH_TO_CODE_SAMPLES, parameters: DEFAULT_PARAMETERS })
  assert.deepEqual(evaluation.matrix, [[2, 3], [1, 4]])
  assert.deepEqual(evaluation.targets, [9, 7])
  assert.deepEqual(evaluation.predictions, [10, 5])
  assert.equal(evaluation.mse, 2.5)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[0]! - 0) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[1]! + 5) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.bias + 1) < 1e-8)
})

test('bilingual titles and bodies stay paired and render through the safe Markdown path', () => {
  for (const module of mathToCodeModules) {
    assert.ok(module.title['zh-CN'].trim() && module.title.en.trim())
    assert.equal(module.sections.length, module.toc.length)
    for (const [index, section] of module.sections.entries()) {
      const toc = module.toc[index]!
      assert.equal(toc.id, section.id)
      assert.deepEqual(toc.title, section.title)
      for (const locale of ['zh-CN', 'en'] as const) {
        assert.ok(section.title[locale].trim(), `${module.id}/${section.id}/${locale} has no title`)
        assert.ok(section.content[locale].trim(), `${module.id}/${section.id}/${locale} has no body`)
        const html = renderMarkdownWithMath(section.content[locale])
        assert.doesNotMatch(html, /<script|<iframe|<style|javascript:|onerror\s*=|onclick\s*=/i)
        assert.doesNotMatch(html, /katex-error|\$\$|\\\[|\\\]/)
      }
    }
  }

  const hostile = renderMarkdownWithMath('<script>alert(1)</script><img src="/safe.png" onerror="alert(2)"><a href="javascript:alert(3)">bad</a>')
  assert.doesNotMatch(hostile, /<script|onerror|javascript:/i)
})

test('public and source paths are deployable and GitHub Pages compatible', () => {
  for (const module of mathToCodeModules) {
    for (const asset of module.visuals) {
      for (const path of [asset.assetPath, asset.posterPath].filter((value): value is string => Boolean(value))) {
        assert.match(path, /^\//, `${module.id}/${asset.id} must use a public-root path`)
        assert.equal(withPublicBase(path, '/ML_tutorial_Site/'), `/ML_tutorial_Site${path}`)
      }
    }
    for (const path of module.importedAssetPaths ?? []) {
      assert.match(path, /^\//, `${module.id} imported asset must use a public-root path`)
      assert.equal(withPublicBase(path, '/ML_tutorial_Site/'), `/ML_tutorial_Site${path}`)
    }
    for (const reference of module.sourceReferences ?? []) {
      assert.match(reference.href, /^https:\/\//, `${module.id} source reference is not deployable`)
    }
  }
  assert.equal(withPublicBase('/manim/math-lab/example.mp4', '/ML_tutorial_Site/'), '/ML_tutorial_Site/manim/math-lab/example.mp4')
  assert.equal(withPublicBase('#shared-prediction-task', '/ML_tutorial_Site/'), '#shared-prediction-task')
})

test('interactive labs expose bounded controls, reset actions, static fallbacks, and no evidence contract', async () => {
  const functionsSource = readFileSync(new URL('../src/modules/math-lab/labs/PredictionMappingLab.vue', import.meta.url), 'utf8')
  const studioSource = readFileSync(new URL('../src/modules/math-lab/labs/MathToCodeStudioLab.vue', import.meta.url), 'utf8')
  for (const source of [functionsSource, studioSource]) {
    assert.match(source, /<button[^>]*type="button"[^>]*@click="reset"/)
    assert.match(source, /<table[\s>]/)
    assert.match(source, /prefers-reduced-motion/)
    assert.doesNotMatch(source, /evidence-change|ExperimentEvidence|defineEmits|recordLearningProgress|localStorage/i)
  }
  assert.match(functionsSource, /const MIN_W1 = 2/)
  assert.match(functionsSource, /const MAX_W1 = 6/)
  assert.match(functionsSource, /const STEP_W1 = 0\.5/)
  assert.match(functionsSource, /Number\.isFinite/)
  assert.match(studioSource, /const MAX_ABS_INPUT = 1_000_000/)
  assert.match(studioSource, /Number\.isFinite\(candidate\)/)
  assert.match(studioSource, /Math\.abs\(candidate\) > MAX_ABS_INPUT/)

  const server = await createServer({ root: new URL('.', root).pathname, appType: 'custom', logLevel: 'silent', server: { middlewareMode: true } })
  try {
    for (const [path, locale] of [
      ['/src/modules/math-lab/labs/PredictionMappingLab.vue', 'en'],
      ['/src/modules/math-lab/labs/MathToCodeStudioLab.vue', 'zh-CN'],
    ] as const) {
      const component = (await server.ssrLoadModule(path)).default
      const html = await renderToString(createSSRApp({ render: () => h(component, { locale }) }))
      assert.match(html, /<table[\s>]/)
      assert.match(html, /type="(?:range|number)"/)
      assert.match(html, /<button[^>]*type="button"/)
    }
  } finally {
    await server.close()
  }
})

test('self-paced completion and route query navigation remain route-scoped', () => {
  const studio = mathToCodeModules.at(-1)!
  assert.equal(studio.id, 'math-to-code-guided-studio')
  assert.equal(studio.completionMode, 'self-attested')
  assert.ok(mathToCodeModules.slice(0, -1).every(({ completionMode }) => completionMode === undefined))

  for (const [index, moduleId] of moduleIds.entries()) {
    assert.deepEqual(routeNavigationForModule('math-to-code-pilot', moduleId), {
      routeId: 'math-to-code-pilot',
      previousModuleId: moduleIds[index - 1],
      nextModuleId: moduleIds[index + 1],
    })
  }
  assert.equal(routeNavigationForModule('math-to-code-pilot', 'pca'), undefined)
  assert.equal(routeNavigationForModule('invalid-route', moduleIds[0]!), undefined)

  const page = readFileSync(new URL('../src/modules/math-lab/pages/MathLabModulePage.vue', import.meta.url), 'utf8')
  const completion = readFileSync(new URL('../src/modules/math-lab/components/SelfPacedCompletionButton.vue', import.meta.url), 'utf8')
  assert.match(page, /routeNavigationForModule\(route\.query\.route, moduleId\.value\)/)
  assert.match(page, /query:\s*\{\s*route:\s*routeNavigation\.value\.routeId\s*\}/)
  assert.match(page, /moduleDefinition\.completionMode === 'self-attested'/)
  assert.match(completion, /self-paced local navigation state, not a graded or formal acceptance/i)
})
