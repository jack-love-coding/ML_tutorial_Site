import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import {
  aiOverviewVisualCopy,
  aiWorldNodes,
  learningAssistantAlgorithms,
  mlProcessSteps,
  paradigmDecisionQuestions,
} from '../src/modules/ai-overview/data/course.ts'

const componentDirectory = join(process.cwd(), 'src/modules/ai-overview/components')
const typeSource = readFileSync(join(process.cwd(), 'src/modules/ai-overview/types.ts'), 'utf8')
const componentSource = (fileName: string) => readFileSync(join(componentDirectory, fileName), 'utf8')

const contracts = {
  'AiWorldMap.vue': ['<svg', 'v-for="node in aiWorldNodes"', 'node.label[locale]'],
  'TraditionalAiStepper.vue': ['type="button"', ':aria-current=', 'step.description[locale]'],
  'MlProcessTracer.vue': ['v-for="(stage, index) in mlProcessSteps"', 'stage.label[locale]', 'stage.description[locale]'],
  'ParadigmComparison.vue': ['<table', '<th', 'scope="col"'],
  'ParadigmDecisionTree.vue': ['v-for="question in paradigmDecisionQuestions"', 'question.question[locale]', 'branch-shape'],
  'LearningAssistantMap.vue': ['v-for="algorithm in learningAssistantAlgorithms"', 'algorithm.label[locale]', 'algorithm-shape'],
  'LlmRouteMap.vue': ['v-for="(stage, index) in llmRouteStages"', 'stage.label[locale]', 'route-shape'],
  'CourseKnowledgeMap.vue': ['ai-overview-knowledge-map', 'data-knowledge-section', 'printKnowledgeMap'],
  'OverviewMediaFigure.vue': ['withPublicBase', 'figcaption'],
} as const

for (const [fileName, tokens] of Object.entries(contracts)) {
  test(`${fileName} exposes its visual contract`, () => {
    const source = componentSource(fileName)

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

test('media figure consumes the shared AI overview media asset contract', () => {
  const source = componentSource('OverviewMediaFigure.vue')
  assert.match(typeSource, /export type AiOverviewMediaAsset/)
  assert.match(typeSource, /kind:\s*'imagegen'\s*\|\s*'manim-video'/)
  assert.match(typeSource, /publicPath:\s*string/)
  assert.match(typeSource, /chapterId:\s*AiOverviewChapterId/)
  assert.match(typeSource, /bilingualLabels:\s*readonly LocalizedCopy\[\]/)
  assert.match(source, /import type \{ AiOverviewMediaAsset \} from '\.\.\/types'/)
  assert.doesNotMatch(source, /interface AiOverviewMediaAsset/)
  assert.match(source, /withPublicBase\(props\.asset\.publicPath\)/)
  assert.match(source, /:aria-label="asset\.title\[locale\]"/)
})

test('learning assistant map renders centralized algorithm labels with labeled shapes', () => {
  const source = componentSource('LearningAssistantMap.vue')
  assert.match(source, /learningAssistantAlgorithms/)
  assert.match(source, /v-for="algorithm in learningAssistantAlgorithms"/)
  assert.match(source, /:data-algorithm-id="algorithm\.id"/)
  assert.match(source, /algorithm\.label\[locale\]/)
  assert.match(source, /class="algorithm-shape"/)
  assert.doesNotMatch(source, /const algorithms =/)
})

test('knowledge map renders all five printable source sections', () => {
  const source = componentSource('CourseKnowledgeMap.vue')
  for (const importedSource of [
    'mlProcessSteps',
    'learningParadigmRows',
    'learningAssistantAlgorithms',
    'paradigmDecisionQuestions',
    'llmRouteStages',
  ]) {
    assert.match(source, new RegExp(`\\b${importedSource}\\b`))
  }
  for (const section of ['common-loop', 'paradigm-comparison', 'representative-algorithms', 'decision-tree', 'llm-route']) {
    assert.match(source, new RegExp(`data-knowledge-section="${section}"`))
  }
})

test('knowledge map prints only through its explicit button handler', () => {
  const source = componentSource('CourseKnowledgeMap.vue')
  assert.match(source, /function printKnowledgeMap\(\) \{ window\.print\(\) \}/)
  assert.match(source, /<button type="button" @click="printKnowledgeMap">/)
  assert.equal(source.match(/window\.print\(\)/g)?.length, 1)
})

test('traditional AI stepper clamps navigation and exposes reset and current-total state', () => {
  const source = componentSource('TraditionalAiStepper.vue')
  assert.match(source, /Math\.max\(0, currentStep\.value - 1\)/)
  assert.match(source, /Math\.min\(currentMethod\.value\.steps\.length - 1, currentStep\.value \+ 1\)/)
  assert.match(source, /function reset\(\) \{ currentStep\.value = 0 \}/)
  assert.match(source, /:disabled="currentStep === 0"/)
  assert.match(source, /:disabled="currentStep === currentMethod\.steps\.length - 1"/)
  assert.match(source, /currentStep \+ 1\s*\}\}\/\{\{\s*currentMethod\.steps\.length/)
  assert.match(source, /:data-step-id="candidate\.id"/)
})

test('visuals bind localized accessible names and pair labels with shapes', () => {
  for (const fileName of ['AiWorldMap.vue', 'TraditionalAiStepper.vue', 'MlProcessTracer.vue', 'ParadigmDecisionTree.vue', 'LearningAssistantMap.vue', 'LlmRouteMap.vue', 'CourseKnowledgeMap.vue', 'OverviewMediaFigure.vue']) {
    assert.match(componentSource(fileName), /:aria-label="[^"]+\[locale\][^"]*"/, `${fileName} needs a localized aria-label binding`)
  }
  assert.match(componentSource('AiWorldMap.vue'), /:data-node-id="node\.id"/)
  assert.match(componentSource('ParadigmDecisionTree.vue'), /:data-question-id="question\.id"/)
  assert.match(componentSource('ParadigmDecisionTree.vue'), /aria-hidden="true"/)
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

test('learning assistant algorithms preserve exact IDs and complete bilingual teaching fields', () => {
  assert.deepEqual(learningAssistantAlgorithms.map((algorithm) => algorithm.id), [
    'linear-regression',
    'k-means',
    'q-learning',
  ])
  for (const algorithm of learningAssistantAlgorithms) {
    for (const field of [algorithm.label, algorithm.taskRole, algorithm.input, algorithm.learningSignal, algorithm.output]) {
      assert.ok(field['zh-CN'].trim())
      assert.ok(field.en.trim())
    }
  }
})
