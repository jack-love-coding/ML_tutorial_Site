import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { aiOverviewModule } from '../src/data/aiOverviewModule.ts'
import { AI_OVERVIEW_CHAPTER_IDS, AI_OVERVIEW_SEEDS } from '../src/modules/ai-overview/data/experiments.ts'
import { lessonInteractionProtocols } from '../src/lessons/interactionProtocol.ts'

const courseUrl = new URL('../src/modules/ai-overview/data/course.ts', import.meta.url)

test('AI Overview contains the approved eight bilingual chapters', () => {
  assert.deepEqual(aiOverviewModule.chapters.map((chapter) => chapter.id), AI_OVERVIEW_CHAPTER_IDS)
  assert.equal(aiOverviewModule.chapters.reduce((sum, chapter) => sum + (chapter.estimatedMinutes ?? 0), 0), 135)
  for (const chapter of aiOverviewModule.chapters) {
    assert.ok(chapter.title?.['zh-CN'] && chapter.title.en)
    assert.ok(chapter.markdown['zh-CN'].length > 800, `${chapter.id} needs a detailed Chinese master`)
    assert.ok(chapter.markdown.en.length > 800, `${chapter.id} needs an equal-depth English adaptation`)
    assert.ok(chapter.callout['zh-CN'] && chapter.callout.en)
    assert.match(chapter.markdown['zh-CN'], /### Ref ID/)
    assert.match(chapter.markdown.en, /### Ref ID/)
    assert.doesNotMatch(`${chapter.markdown['zh-CN']} ${chapter.markdown.en}`, /https?:\/\//)
  }
})

test('AI Overview preserves the approved teaching numbers, variables, seeds, and route', async () => {
  assert.ok(existsSync(courseUrl), 'the rebuilt course data module should exist')
  const {
    aiOverviewScenarioCards,
    learningParadigmRows,
    llmRouteStages,
    traditionalAiMethods,
  } = await import('../src/modules/ai-overview/data/course.ts')
  const requiredTokens = ['x', 'y', 'ŷ', 'w', 'b', 'MSE', 'K=3', '4×4', '+10', '-1', '-3', '3103', '7107']
  for (const locale of ['zh-CN', 'en'] as const) {
    const localized = aiOverviewModule.chapters.map((chapter) => chapter.markdown[locale]).join('\n')
    for (const token of requiredTokens) {
      assert.match(localized, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${locale} missing ${token}`)
    }
    for (const token of ['w=6', 'b=47', 'MSE=0.6', '91.67', '32.67', '2+0.5×11.6=7.8']) {
      assert.match(localized, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${locale} missing ${token}`)
    }
    assert.match(localized, /\\sqrt\{/)
    assert.match(localized, /\\leftarrow/)
    assert.match(localized, /\\max_/)
  }
  assert.equal(AI_OVERVIEW_SEEDS.kmeans, 3103)
  assert.equal(AI_OVERVIEW_SEEDS.qLearning, 7107)
  assert.deepEqual(llmRouteStages.map((stage) => stage.id), [
    'python', 'math-numpy', 'probability', 'classical-ml', 'deep-learning', 'transformer', 'llm',
  ])
  assert.equal(aiOverviewScenarioCards.length, 3)
  assert.equal(traditionalAiMethods.length, 4)
  assert.equal(learningParadigmRows.length, 3)
  for (const row of learningParadigmRows) {
    assert.deepEqual(Object.keys(row), [
      'id', 'availableInfo', 'learningSignal', 'learnedObject', 'output', 'typicalProblem', 'applications',
    ])
    assert.equal(row.applications.length, 2)
    for (const field of ['availableInfo', 'learningSignal', 'learnedObject', 'output', 'typicalProblem'] as const) {
      assert.ok(row[field]['zh-CN'] && row[field].en)
    }
  }
  assert.match(learningParadigmRows.find((row) => row.id === 'supervised')!.learnedObject.en, /mapping/i)
  assert.match(learningParadigmRows.find((row) => row.id === 'unsupervised')!.learnedObject.en, /structure/i)
  assert.match(learningParadigmRows.find((row) => row.id === 'reinforcement')!.learnedObject.en, /policy/i)
  assert.deepEqual(
    learningParadigmRows.map((row) => row.applications.map((application) => application.en)),
    [
      ['Spam detection', 'Electricity-demand prediction'],
      ['News-topic grouping', 'Image color compression'],
      ['Robot-arm control', 'Traffic-signal scheduling'],
    ],
  )
  assert.deepEqual(
    learningParadigmRows.map((row) => row.applications.map((application) => application['zh-CN'])),
    [
      ['垃圾邮件检测', '电力需求预测'],
      ['新闻主题分组', '图像颜色压缩'],
      ['机器人手臂控制', '交通信号调度'],
    ],
  )

  for (const method of traditionalAiMethods) {
    assert.deepEqual(method.steps.map((step) => step.id), ['current-state', 'candidate-set', 'selected-step', 'result'])
    for (const step of method.steps) {
      assert.ok(step.label['zh-CN'] && step.label.en)
      assert.ok(step.description['zh-CN'] && step.description.en)
    }
  }
})

test('AI Overview checkpoints are formative and revisit real chapters', () => {
  assert.equal(aiOverviewModule.checkpoints.length, 5)
  assert.deepEqual(aiOverviewModule.checkpoints.map((item) => [item.id, item.revisitChapterId]), [
    ['ai-overview-training-loop-order', 'ml-common-language'],
    ['ai-overview-field-roles', 'ml-common-language'],
    ['ai-overview-paradigm-signal', 'learning-paradigms'],
    ['ai-overview-kmeans-direction', 'unsupervised-kmeans'],
    ['ai-overview-q-value-direction', 'reinforcement-q-learning'],
  ])
  const ids = new Set(aiOverviewModule.chapters.map((chapter) => chapter.id))
  for (const item of aiOverviewModule.checkpoints) {
    assert.ok(ids.has(item.revisitChapterId))
    assert.ok(item.misconceptionTags.length > 0)
    assert.match(item.explanation['zh-CN'], /误区/)
    assert.match(item.explanation.en, /misconception/i)
  }
  const combined = aiOverviewModule.checkpoints.find((item) => item.id === 'ai-overview-paradigm-signal')!
  const combinedCopy = [
    combined.prompt['zh-CN'], combined.prompt.en,
    ...combined.choices.flatMap((choice) => [choice.label['zh-CN'], choice.label.en]),
    combined.explanation['zh-CN'], combined.explanation.en,
  ].join(' ')
  for (const token of ['零件', '音乐', '通知', 'defect', 'music', 'notification', 'label', 'similarity', 'retention reward']) {
    assert.match(combinedCopy, new RegExp(token, 'i'))
  }
  for (const stale of ['电力', '新闻', '交通', 'electricity', 'news', 'traffic']) {
    assert.doesNotMatch(combinedCopy, new RegExp(stale, 'i'))
  }
})

test('AI Overview interaction protocols mount only on real algorithm labs and name real controls', () => {
  const protocols = lessonInteractionProtocols.filter((item) => item.moduleSlug === 'ai-overview')
  assert.deepEqual(protocols.map((item) => item.sectionIds), [
    ['supervised-linear-regression'],
    ['unsupervised-kmeans'],
    ['reinforcement-q-learning'],
  ])
  const copy = JSON.stringify(protocols)
  for (const token of [
    'preset', 'w', 'b', 'MSE', 'prediction', 'residual', 'current best',
    'K', 'seed', 'phase', 'within-group distance',
    'exploration', 'state', 'action', 'old Q value', 'reward', 'next-state max', 'target', 'correction', 'new Q value', 'policy',
  ]) assert.match(copy, new RegExp(token, 'i'))
  assert.doesNotMatch(copy, /scenario-card|highlighted task card|高亮任务卡|任务场景卡/i)
  assert.doesNotMatch(copy, /backend|upload|submit|submission|acceptance|grade|score|passed/i)
})
