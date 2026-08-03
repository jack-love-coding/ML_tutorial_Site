import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  cnnLessonFocusConfigs,
  mlpLessonFocusConfigs,
} from '../src/lessons/neuralGuided.ts'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')
const mlpChapterIds = [
  'linearLimits',
  'neuronAffine',
  'activations',
  'hiddenRepresentation',
  'forwardOutput',
  'backprop',
  'trainingDynamics',
  'capacityGeneralization',
]
const cnnChapterIds = [
  'image-volume',
  'kernel-convolution',
  'padding-stride-shape',
  'channels-feature-maps',
  'pooling-classifier-head',
  'transfer-learning-review',
]

test('CI uses a bounded test concurrency and the canonical Pages build', () => {
  const packageSource = read('package.json')
  const workflow = read('.github/workflows/deploy-pages.yml')
  assert.match(packageSource, /"test:ci": "node --test --test-concurrency=2 tests\/\*\.test\.\*"/)
  assert.match(workflow, /run: npm run test:ci/)
  assert.match(workflow, /run: npm run build:pages/)
  assert.match(workflow, /pull_request:[\s\S]*branches:[\s\S]*- main/)
  assert.match(workflow, /deploy:[\s\S]*if: github\.event_name != 'pull_request'/)
  assert.doesNotMatch(workflow, /run: npm test\s/)
})

test('neural course renders full teaching before prediction and guided lab', () => {
  const source = read('src/lessons/NeuralGuidedLesson.vue')
  const lesson = source.indexOf('class="neural-lesson-content"')
  const prediction = source.indexOf('class="neural-experiment-prediction"')
  const lab = source.indexOf('<slot name="lab"')
  const conclusion = source.indexOf('class="neural-chapter-conclusion"')
  assert.ok(lesson > -1 && lesson < prediction && prediction < lab && lab < conclusion)
  assert.doesNotMatch(source, /<details|neural-mode-switch|mode === 'explore'/)
  assert.match(source, /path: explorerPath/)
  assert.match(source, /isLastChapter && courseSources\.length/)
})

test('standalone explorer routes are lazy, bounded, and declared before chapter routes', () => {
  const router = read('src/router/index.ts')
  const view = read('src/views/NeuralExplorerView.vue')
  for (const path of ['/learn/mlp/explore', '/learn/cnn-visualization/explore']) {
    assert.match(router, new RegExp(path.replaceAll('/', '\\/')))
  }
  assert.ok(router.indexOf("path: '/learn/cnn-visualization/explore'") < router.indexOf("path: '/learn/cnn-visualization/:chapterId'"))
  assert.ok(router.indexOf("path: '/learn/mlp/explore'") < router.indexOf("path: '/learn/:moduleId/:lessonId'"))
  assert.match(router, /component: \(\) => import\('\.\.\/views\/NeuralExplorerView\.vue'\)/)
  assert.match(view, /typeof value === 'string' \? value : ''/)
  assert.match(view, /chapters\.find\(\(section\) => section\.id === requestedChapterId\.value\) \?\? chapters\[0\]/)
  assert.doesNotMatch(view, /saveAlgorithmProgress|localStorage|markModuleComplete/)
})

test('MLP chapter contracts have deterministic finite initial states and a true zero-layer first chapter', () => {
  assert.equal(mlpLessonFocusConfigs.length, mlpChapterIds.length)
  const chapterIds = new Set(mlpChapterIds)
  for (const contract of mlpLessonFocusConfigs) {
    assert.equal(contract.kind, 'mlp')
    assert.ok(chapterIds.has(contract.chapterId))
    assert.ok(contract.guidedControls.length >= 1 && contract.guidedControls.length <= 3)
    assert.ok(contract.observation['zh-CN'] && contract.observation.en)
    for (const value of [
      contract.initialState.learningRate,
      contract.initialState.batchSize,
      contract.initialState.noise,
      contract.initialState.regularizationRate,
    ].filter((value): value is number => value !== undefined)) {
      assert.ok(Number.isFinite(value))
    }
    assert.ok(contract.initialState.networkShape?.every((width) => Number.isInteger(width) && width > 0) ?? true)
  }
  assert.equal(mlpLessonFocusConfigs[0]?.initialState.classificationDataset, 'xor')
  assert.deepEqual(mlpLessonFocusConfigs[0]?.initialState.networkShape, [])
})

test('CNN course and contracts bind the guided task to the real 64x64x3 runtime', () => {
  assert.equal(cnnLessonFocusConfigs.length, cnnChapterIds.length)
  const chapterIds = new Set(cnnChapterIds)
  for (const contract of cnnLessonFocusConfigs) {
    assert.equal(contract.kind, 'cnn')
    assert.ok(chapterIds.has(contract.chapterId))
    assert.ok(contract.guidedControls.length >= 1 && contract.guidedControls.length <= 5)
    assert.ok(contract.observation['zh-CN'] && contract.observation.en)
  }
  const moduleSource = read('src/data/cnnVisualizationModule.ts')
  assert.match(moduleSource, /实际使用的 64×64×3 图片张量/)
  assert.match(moduleSource, /actual 64×64×3 image tensor/)
  assert.doesNotMatch(moduleSource, /### Ref ID/)
  assert.match(moduleSource, /href: 'https:\/\//)
})

test('learner-facing neural UI uses observation language and localized accessible controls', () => {
  const sources = [
    read('src/components/MlpPlaygroundCockpit.vue'),
    read('src/components/cnn/CnnGuidedLab.vue'),
    read('src/lessons/NeuralGuidedLesson.vue'),
  ].join('\n')
  assert.doesNotMatch(sources, /观察证据|本章观察证据|Evidence to watch/)
  assert.match(sources, /观察重点/)
  assert.match(sources, /观察结果/)
  assert.match(sources, /MLP 训练控制/)
  assert.match(sources, /tabindex="-1"[\s\S]*aria-hidden="true"/)
})

test('safe Markdown component adds keyboard-native code copy with failure feedback', () => {
  const component = read('src/components/MarkdownMathContent.vue')
  const renderer = read('src/utils/markdownMath.ts')
  assert.match(component, /document\.createElement\('button'\)/)
  assert.match(component, /button\.type = 'button'/)
  assert.match(component, /navigator\.clipboard\?\.writeText/)
  assert.match(component, /复制代码/)
  assert.match(component, /复制失败/)
  assert.match(component, /@click="onClick"/)
  assert.match(renderer, /sanitizeHtml\(markdown\.render/)
  assert.doesNotMatch(component, /v-html="props\.source"/)
})
