import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import {
  learningRouteById,
  routeNavigationForModule,
} from '../src/modules/math-lab/data/learningRoutes.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

const routeModuleIds = [
  'beginner-probability-distributions',
  'monte-carlo',
  'probability-likelihood-entropy',
  'markov-chains',
] as const

const expectedSectionIds: Record<(typeof routeModuleIds)[number], string[]> = {
  'beginner-probability-distributions': [
    'probability-route-beginner-handoff',
  ],
  'monte-carlo': [
    'probability-route-monte-estimator-ledger',
    'probability-route-monte-output',
    'probability-route-monte-handoff',
  ],
  'probability-likelihood-entropy': [
    'probability-route-model-bayes-anchor',
    'probability-route-model-output',
    'probability-route-model-handoff',
  ],
  'markov-chains': [
    'probability-route-markov-entry',
    'probability-route-markov-output',
    'probability-route-markov-summary',
  ],
}

function conceptOutput(moduleId: string, conceptId: string): string {
  const concept = mathLabModuleRegistry[moduleId]!.concepts.find(({ id }) => id === conceptId)
  assert.ok(concept, `${moduleId} should include ${conceptId}`)
  assert.ok(concept.codeExample, `${conceptId} should expose copyable code`)
  return concept.codeOutput?.en ?? ''
}

test('probability route preserves four existing modules in one teaching order', () => {
  const route = learningRouteById['probability-route']
  assert.deepEqual(route.chapterModuleIds, routeModuleIds)
  assert.equal(route.title['zh-CN'], '概率与不确定性路线')
  assert.equal(route.title.en, 'Probability and Uncertainty Route')

  assert.deepEqual(routeNavigationForModule('probability-route', 'monte-carlo'), {
    routeId: 'probability-route',
    displayOrder: 2,
    effectivePrerequisiteIds: undefined,
    entryAssumptions: undefined,
    previousModuleId: 'beginner-probability-distributions',
    nextModuleId: 'probability-likelihood-entropy',
  })
})

test('probability route chapters expose detailed bilingual content and mount each lab once', () => {
  for (const moduleId of routeModuleIds) {
    const moduleDefinition = mathLabModuleRegistry[moduleId]
    assert.ok(moduleDefinition.estimatedMinutes >= 65)
    assert.equal(moduleDefinition.toc.length, moduleDefinition.sections.length)
    assert.ok(moduleDefinition.concepts.some(({ codeExample, codeOutput }) => codeExample && codeOutput?.en))

    const sectionIds = moduleDefinition.sections.map(({ id }) => id)
    for (const expectedSectionId of expectedSectionIds[moduleId]) {
      assert.ok(sectionIds.includes(expectedSectionId), `${moduleId} should include ${expectedSectionId}`)
    }

    for (const labDefinition of moduleDefinition.labs) {
      const placementCount = moduleDefinition.sections.filter(({ labIds }) =>
        labIds?.includes(labDefinition.id)).length
      assert.equal(placementCount, 1, `${moduleId} should mount ${labDefinition.id} exactly once`)
    }

    assert.doesNotMatch(JSON.stringify(moduleDefinition), /证据/)
  }

  assert.equal(mathLabModuleRegistry['monte-carlo'].sections.some(({ id }) => id === 'monte-carlo-review'), false)
  assert.equal(mathLabModuleRegistry['markov-chains'].sections.some(({ id }) => id === 'markov-chains-review-questions'), false)
})

test('probability route code outputs preserve the fixed numeric anchors', () => {
  assert.match(
    conceptOutput('beginner-probability-distributions', 'beginner-distribution'),
    /empirical_frequency = 0\.75/,
  )
  assert.match(
    conceptOutput('monte-carlo', 'monte-carlo-estimator-core'),
    /10000 pi_hat = 3\.1644 abs_error = 0\.022807/,
  )
  assert.match(
    conceptOutput('probability-likelihood-entropy', 'softmax-cross-entropy'),
    /probabilities = \[0\.642616, 0\.261268, 0\.096115\]/,
  )
  assert.match(
    conceptOutput('probability-likelihood-entropy', 'softmax-cross-entropy'),
    /target_nll = 0\.442207[\s\S]*entropy = 0\.859968[\s\S]*kl_p_q = 0\.054711/,
  )
  assert.match(
    conceptOutput('markov-chains', 'markov-property-core'),
    /day_20 = \[0\.393443, 0\.245902, 0\.360656\]/,
  )
  assert.match(
    conceptOutput('markov-chains', 'markov-property-core'),
    /stationary_residual_l1 = 1\.819e-09/,
  )
})

test('probability route is visible from the Math Lab home and records its phase boundary', () => {
  const homeSource = readFileSync(
    new URL('../src/modules/math-lab/pages/MathLabHome.vue', import.meta.url),
    'utf8',
  )
  assert.match(homeSource, /learningRouteById\['probability-route'\]/)
  assert.match(homeSource, /:route="probabilityRoute"/)

  const contract = readFileSync(
    new URL('../docs/curriculum/v3/probability-uncertainty-four-chapter-contract.md', import.meta.url),
    'utf8',
  )
  assert.match(contract, /P\(spam \| signal\) = 0\.372727/)
  assert.match(contract, /N=10000  pi_hat=3\.1644/)
  assert.match(contract, /不新增后端采样内核/)
  assert.match(contract, /不新增大量练习/)
})
