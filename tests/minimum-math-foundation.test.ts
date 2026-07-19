import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'
import {
  learningRouteById,
  minimumFoundationModuleIds,
  routeNavigationForModule,
  validateLearningRoutes,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import { renderMarkdownWithMath } from '../src/utils/markdownMath.ts'

const expectedIds = [
  'calculus-functions-rate-change',
  'beginner-linear-algebra',
  'calculus-derivatives-local-change',
  'beginner-probability-distributions',
] as const

test('minimum foundation route keeps the approved four-chapter order and prerequisites', () => {
  const route = learningRouteById['minimum-foundation']
  assert.deepEqual(minimumFoundationModuleIds, expectedIds)
  assert.deepEqual(route.chapterModuleIds, expectedIds)
  assert.deepEqual(route.prerequisiteOverrides, {
    'calculus-functions-rate-change': [],
    'beginner-linear-algebra': ['calculus-functions-rate-change'],
    'calculus-derivatives-local-change': ['beginner-linear-algebra'],
    'beginner-probability-distributions': ['calculus-derivatives-local-change'],
  })
  assert.deepEqual(validateLearningRoutes([route]), [])

  assert.deepEqual(routeNavigationForModule('minimum-foundation', 'beginner-linear-algebra'), {
    routeId: 'minimum-foundation',
    displayOrder: 2,
    effectivePrerequisiteIds: ['calculus-functions-rate-change'],
    entryAssumptions: route.entryAssumptions,
    previousModuleId: 'calculus-functions-rate-change',
    nextModuleId: 'calculus-derivatives-local-change',
  })
})

test('four chapters share one numerical story and publish reproducible code output', () => {
  const expectedOutputs: Record<(typeof expectedIds)[number], RegExp[]> = {
    'calculus-functions-rate-change': [/contributions = \[8, -3\]/, /prediction = 10/, /residual = 1/],
    'beginner-linear-algebra': [/X\.shape = \(2, 2\)/, /predictions = \[10\.0, 5\.0\]/],
    'calculus-derivatives-local-change': [/baseline_mse = 2\.5/, /dL_dw2 = -5\.0/, /2\.45125/],
    'beginner-probability-distributions': [/samples = \[1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0\]/, /0\.75/],
  }

  for (const id of expectedIds) {
    const moduleDefinition = mathLabModuleRegistry[id]
    assert.ok(moduleDefinition, `${id} should be registered`)
    const codeConcept = moduleDefinition.concepts.find((concept) => concept.codeExample && concept.codeOutput)
    assert.ok(codeConcept?.codeExample, `${id} needs runnable reference code`)
    assert.ok(codeConcept.codeOutput, `${id} needs pasted reference output`)
    for (const pattern of expectedOutputs[id]) {
      assert.match(codeConcept.codeOutput.en, pattern, `${id} output should preserve ${pattern}`)
    }
  }

  const functionsBody = mathLabModuleRegistry['calculus-functions-rate-change'].sections.map((item) => item.content.en).join('\n')
  const linearBody = mathLabModuleRegistry['beginner-linear-algebra'].sections.map((item) => item.content.en).join('\n')
  const derivativeBody = mathLabModuleRegistry['calculus-derivatives-local-change'].sections.map((item) => item.content.en).join('\n')
  assert.match(functionsBody, /\[2, 3\].*\[4, -1\].*bias = 5.*target = 9/s)
  assert.match(linearBody, /X=\[\[2,3\],\[1,4\]\].*w=\[4,-1\].*b=5.*targets.*\[9,7\]/s)
  assert.match(derivativeBody, /MSE.*2\.5.*w_2.*-5.*2\.45125/s)
})

test('runtime teaching route omits exercise banks and safely renders the added formulas', () => {
  assert.equal(
    mathLabModuleRegistry['calculus-functions-rate-change'].sections.some(({ id }) => id === 'layered-practice'),
    false,
  )
  assert.equal(
    mathLabModuleRegistry['calculus-derivatives-local-change'].sections.some(({ id }) => id === 'derivatives-practice'),
    false,
  )

  for (const id of expectedIds) {
    for (const section of mathLabModuleRegistry[id].sections) {
      for (const locale of ['zh-CN', 'en'] as const) {
        const html = renderMarkdownWithMath(section.content[locale])
        assert.doesNotMatch(html, /katex-error|<script|javascript:|onerror\s*=/i, `${id}/${section.id}/${locale}`)
        assert.doesNotMatch(html, /\$\$/)
      }
    }
  }
})

test('four-chapter entry, copy control, output panel, and local teaching images are wired into the UI', () => {
  const home = readFileSync(new URL('../src/modules/math-lab/pages/MathLabHome.vue', import.meta.url), 'utf8')
  const page = readFileSync(new URL('../src/modules/math-lab/pages/MathLabModulePage.vue', import.meta.url), 'utf8')
  const codeLab = readFileSync(new URL('../src/modules/math-lab/components/CodeLab.vue', import.meta.url), 'utf8')

  for (const id of expectedIds) assert.match(home, new RegExp(`${id}\\?route=minimum-foundation`))
  assert.match(home, /:show-reports="false"/)
  assert.match(page, /:output="concept\.codeOutput\?\.\[currentLocale\]"/)
  assert.match(page, /:copy-label="currentLocale === 'zh-CN' \? '复制代码' : 'Copy code'"/)
  assert.match(codeLab, /navigator\.clipboard\.writeText/)
  assert.match(codeLab, /math-code-lab__output/)

  const requiredImages = [
    'beginner-function-machine-longform.png',
    'beginner-average-to-derivative-longform.png',
    'beginner-derivative-tangent-longform.png',
    'beginner-derivative-window-longform.png',
  ]
  for (const filename of requiredImages) {
    assert.equal(existsSync(new URL(`../public/math-lab/generated/${filename}`, import.meta.url)), true, filename)
  }
})
