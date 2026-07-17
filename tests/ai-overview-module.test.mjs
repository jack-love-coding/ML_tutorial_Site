import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('AI overview is the first registered learning module', () => {
  const typesSource = read('src/types/ml.ts')
  const catalogSource = read('src/data/moduleCatalog.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const messagesSource = read('src/i18n/messages.ts')

  assert.match(typesSource, /\| 'ai-overview'/)
  assert.match(catalogSource, /import\('\.\/aiOverviewModule'\)\)\.aiOverviewModule/)

  const aiIndex = catalogSource.indexOf('aiOverviewModule,')
  const lossIndex = catalogSource.indexOf('lossFunctionsModule,')
  assert.ok(aiIndex >= 0, 'ai-overview should be registered in moduleOrder')
  assert.ok(aiIndex < lossIndex, 'ai-overview should be the first ML Models module')

  assert.match(algorithmViewSource, /AiOverviewLessonLab/)
  assert.match(algorithmViewSource, /slug\.value === 'ai-overview'/)
  assert.match(algorithmViewSource, /algorithm-view--ai-overview/)
  assert.match(messagesSource, /aiOverview: \{/)
})

test('AI overview module covers beginner AI map and uses centralized references', () => {
  const modulePath = new URL('src/data/aiOverviewModule.ts', root)
  assert.ok(existsSync(modulePath), 'src/data/aiOverviewModule.ts should exist')

  const moduleSource = read('src/data/aiOverviewModule.ts')
  const courseSource = read('src/modules/ai-overview/data/course.ts')

  assert.match(moduleSource, /slug: 'ai-overview'/)
  assert.match(moduleSource, /route: '\/learn\/ai-overview'/)
  assert.match(moduleSource, /aiOverviewChapters/)

  for (const id of [
    'three-problems',
    'ai-world-map',
    'ml-common-language',
    'supervised-linear-regression',
    'learning-paradigms',
    'unsupervised-kmeans',
    'reinforcement-q-learning',
    'choose-learning-approach',
  ]) {
    assert.match(courseSource, new RegExp(`chapter\\(\\s*'${id}'`))
  }

  for (const requiredConcept of [
    '监督学习',
    '无监督学习',
    '深度学习',
    '生成式 AI',
    '训练数据',
    '未见测试数据',
    'data → feature/target → model → prediction → error → parameter update → evaluation on unseen data',
    'K-means',
    'Q-learning',
    '决策树',
  ]) {
    assert.match(courseSource, new RegExp(requiredConcept.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }

  for (const refId of [
    'REF-GOOGLE-MLCC',
    'REF-INRIA-SKLEARN-MOOC',
    'REF-D2L',
    'REF-SKLEARN-USER-GUIDE',
    'REF-HF-LLM-COURSE',
    'REF-HF-RAG-MILVUS',
  ]) {
    assert.match(moduleSource, new RegExp(refId))
  }

  assert.doesNotMatch(moduleSource, /https?:\/\//)
  assert.doesNotMatch(courseSource, /https?:\/\//)
  assert.doesNotMatch(moduleSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
  assert.doesNotMatch(courseSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})

test('AI overview includes task-style checkpoints and delegates chapter visuals', () => {
  const checkpointSource = read('src/data/algorithmCheckpoints.ts')
  const labSource = read('src/components/AiOverviewLessonLab.vue')
  const chapterLabSource = read('src/modules/ai-overview/labs/AiOverviewChapterLab.vue')
  const styleIndexSource = read('src/styles/index.css')

  assert.match(checkpointSource, /'ai-overview': \[/)
  assert.match(checkpointSource, /ai-overview-training-loop-order/)
  assert.match(checkpointSource, /ai-overview-field-roles/)
  assert.match(checkpointSource, /ai-overview-paradigm-signal/)
  assert.match(checkpointSource, /ai-overview-kmeans-direction/)
  assert.match(checkpointSource, /ai-overview-q-value-direction/)

  assert.match(labSource, /AiOverviewChapterLab/)
  assert.match(labSource, /<AiOverviewChapterLab :section="section"/)
  for (const chapterId of [
    'supervised-linear-regression',
    'unsupervised-kmeans',
    'reinforcement-q-learning',
  ]) {
    assert.match(chapterLabSource, new RegExp(chapterId))
  }

  assert.doesNotMatch(labSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
  assert.doesNotMatch(checkpointSource, /鈥|鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|�/)

  assert.match(styleIndexSource, /ai-overview\.css/)
})

test('AI overview publishes the exact runtime companion sequence for every chapter', async () => {
  const { chapterCompanionKinds } = await import('../src/data/aiOverviewModule.ts')

  assert.deepEqual(chapterCompanionKinds, {
    'three-problems': ['imagegen-task-cards'],
    'ai-world-map': ['ai-world-map', 'traditional-ai-stepper'],
    'ml-common-language': ['ml-process-tracer'],
    'supervised-linear-regression': ['linear-regression-video', 'regression-lab', 'house-price-card'],
    'learning-paradigms': ['paradigm-comparison', 'application-cards'],
    'unsupervised-kmeans': ['kmeans-video', 'kmeans-lab', 'user-segmentation-card'],
    'reinforcement-q-learning': ['q-learning-video', 'q-learning-lab'],
    'choose-learning-approach': ['decision-tree', 'assistant-map', 'llm-route', 'knowledge-map'],
  })

  const chapterLabSource = read('src/modules/ai-overview/labs/AiOverviewChapterLab.vue')
  assert.match(chapterLabSource, /chapterCompanionKinds/)
  assert.match(chapterLabSource, /OverviewMediaFigure/)
  assert.match(chapterLabSource, /aiOverviewRuntimeMediaAssets/)
  assert.match(chapterLabSource, /AlgorithmStaticFallback/)
})
