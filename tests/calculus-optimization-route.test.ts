import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { calculusOptimizationRouteModules } from '../src/modules/math-lab/data/calculusOptimizationRouteModules.ts'
import { mathLabModuleRegistry } from '../src/modules/math-lab/data/modules.ts'

const enhancedModuleIds = [
  'calculus-partial-derivatives-gradients',
  'calculus-gradient-descent',
  'calculus-sgd-batch-noise',
  'calculus-optimizer-comparison',
  'calculus-training-code-diagnostics',
] as const

const expectedSectionIds: Record<(typeof enhancedModuleIds)[number], string[]> = {
  'calculus-partial-derivatives-gradients': [
    'v3-gradient-shared-batch',
    'v3-gradient-shape-direction',
    'v3-gradient-numpy-output',
    'v3-gradient-summary',
  ],
  'calculus-gradient-descent': [
    'v3-descent-shared-update',
    'v3-descent-rate-comparison',
    'v3-descent-numpy-output',
    'v3-descent-summary',
  ],
  'calculus-sgd-batch-noise': [
    'v3-batch-shared-gradients',
    'v3-batch-noise-variance',
    'v3-batch-numpy-output',
    'v3-batch-training-clock',
    'v3-batch-summary',
  ],
  'calculus-optimizer-comparison': [
    'v3-optimizer-shared-slice',
    'v3-optimizer-state-ledger',
    'v3-optimizer-python-output',
    'v3-optimizer-boundaries',
    'v3-optimizer-summary',
  ],
  'calculus-training-code-diagnostics': [
    'v3-training-shared-loop',
    'v3-training-code-order',
    'v3-training-signal-table',
    'v3-training-numpy-output',
    'v3-training-summary',
  ],
}

test('calculus optimization adapter keeps seven chapters and enriches the five training chapters', () => {
  assert.equal(calculusOptimizationRouteModules.length, 7)

  for (const moduleId of enhancedModuleIds) {
    const moduleDefinition = mathLabModuleRegistry[moduleId]
    const sectionIds = moduleDefinition.sections.map(({ id }) => id)
    for (const sectionId of expectedSectionIds[moduleId]) {
      assert.ok(sectionIds.includes(sectionId), `${moduleId} should include ${sectionId}`)
    }
    assert.equal(moduleDefinition.toc.length, moduleDefinition.sections.length)
    assert.ok(moduleDefinition.estimatedMinutes >= 60)
    assert.ok(moduleDefinition.concepts.some(({ codeExample, codeOutput }) => codeExample && codeOutput?.['zh-CN']))

    for (const labDefinition of moduleDefinition.labs) {
      const placementCount = moduleDefinition.sections.filter(({ labIds }) => labIds?.includes(labDefinition.id)).length
      assert.equal(placementCount, 1, `${moduleId} should mount ${labDefinition.id} exactly once`)
    }
  }
})

test('calculus route reuses one numeric story from gradients through training code', () => {
  const gradient = mathLabModuleRegistry['calculus-partial-derivatives-gradients']
  const descent = mathLabModuleRegistry['calculus-gradient-descent']
  const batch = mathLabModuleRegistry['calculus-sgd-batch-noise']
  const optimizer = mathLabModuleRegistry['calculus-optimizer-comparison']
  const training = mathLabModuleRegistry['calculus-training-code-diagnostics']

  assert.match(gradient.concepts[0]?.codeOutput?.en ?? '', /grad_w = \[0\.0, -5\.0\]/)
  assert.match(gradient.concepts[0]?.codeOutput?.en ?? '', /grad_b = -1\.0/)
  assert.match(descent.concepts[0]?.codeOutput?.en ?? '', /lr = 0\.05.*loss = 2\.07125/)
  assert.match(descent.concepts[0]?.codeOutput?.en ?? '', /lr = 0\.1.*loss = 3\.385/)
  assert.match(batch.concepts[0]?.codeOutput?.en ?? '', /full_batch = \[0\.0, -5\.0, -1\.0\]/)
  assert.match(optimizer.concepts[0]?.codeOutput?.en ?? '', /sgd -0\.8 2\.0/)
  assert.match(training.concepts[0]?.codeOutput?.en ?? '', /0 2\.5 5\.09902/)
  assert.match(training.concepts[0]?.codeOutput?.en ?? '', /params = \[3\.85485, -0\.775054\] 5\.015959/)
})

test('enhanced calculus chapters use learner-facing language and remove retired short reviews', () => {
  for (const moduleId of enhancedModuleIds) {
    const moduleDefinition = mathLabModuleRegistry[moduleId]
    const chineseBody = moduleDefinition.sections
      .map(({ title, content }) => `${title['zh-CN']}\n${content['zh-CN']}`)
      .join('\n')
    assert.doesNotMatch(chineseBody, /证据/)
  }

  assert.equal(
    mathLabModuleRegistry['calculus-training-code-diagnostics'].sections.some(({ id }) => id === 'training-code-review'),
    false,
  )
})

test('calculus content contract records the route values and phase boundaries', () => {
  const contract = readFileSync(
    new URL('../docs/curriculum/v3/calculus-optimization-seven-chapter-contract.md', import.meta.url),
    'utf8',
  )
  assert.match(contract, /X = \[\[2, 3\]/)
  assert.match(contract, /grad_w = \[0, -5\]/)
  assert.match(contract, /2\.07125/)
  assert.match(contract, /3\.385/)
  assert.match(contract, /不新增大量练习/)
})
