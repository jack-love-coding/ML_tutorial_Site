import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import {
  aiOverviewVisualCopy,
  aiWorldNodes,
  mlProcessSteps,
  paradigmDecisionQuestions,
} from '../src/modules/ai-overview/data/course.ts'

const componentDirectory = join(process.cwd(), 'src/modules/ai-overview/components')

const contracts = {
  'AiWorldMap.vue': ['aria-label', 'generative-ai', 'llm'],
  'TraditionalAiStepper.vue': ['type="button"', 'currentStep', 'reset'],
  'MlProcessTracer.vue': ['learner-id', 'feature', 'target', 'unseen-data'],
  'ParadigmComparison.vue': ['<table', '<th', 'scope="col"'],
  'ParadigmDecisionTree.vue': ['decision-tree', 'learning-signal'],
  'LearningAssistantMap.vue': ['linear-regression', 'k-means', 'q-learning'],
  'LlmRouteMap.vue': ['Python', 'Transformer', 'LLM'],
  'CourseKnowledgeMap.vue': ['print', 'knowledge-map'],
  'OverviewMediaFigure.vue': ['withPublicBase', 'figcaption'],
} as const

for (const [fileName, tokens] of Object.entries(contracts)) {
  test(`${fileName} exposes its visual contract`, () => {
    const source = readFileSync(join(componentDirectory, fileName), 'utf8')

    for (const token of tokens) {
      assert.ok(source.includes(token), `${fileName} must include ${token}`)
    }
  })
}

test('AI world nodes preserve the approved nested parent chain', () => {
  assert.deepEqual(aiWorldNodes.map((node) => node.id), [
    'ai',
    'machine-learning',
    'deep-learning',
    'generative-ai',
    'llm',
  ])
  assert.deepEqual(aiWorldNodes.map((node) => node.parentId), [
    null,
    'ai',
    'machine-learning',
    'deep-learning',
    'generative-ai',
  ])
})

test('ML process steps preserve the approved teaching order', () => {
  assert.deepEqual(mlProcessSteps.map((step) => step.id), [
    'data',
    'roles',
    'model',
    'prediction',
    'error',
    'parameter-update',
    'unseen-evaluation',
  ])
})

test('visual copy is complete in both locales', () => {
  for (const copy of Object.values(aiOverviewVisualCopy)) {
    assert.ok(copy['zh-CN'].trim())
    assert.ok(copy.en.trim())
  }
})

test('decision questions preserve target, reward, then structure order', () => {
  assert.deepEqual(paradigmDecisionQuestions.map((question) => question.id), [
    'explicit-target',
    'sequential-reward',
    'structure-without-targets',
  ])
  for (const question of paradigmDecisionQuestions) {
    assert.ok(question.question['zh-CN'].trim())
    assert.ok(question.question.en.trim())
    assert.ok(question.yes['zh-CN'].trim())
    assert.ok(question.yes.en.trim())
    assert.ok(question.no['zh-CN'].trim())
    assert.ok(question.no.en.trim())
  }
})
