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
  const content = aiOverviewModule.chapters.map((chapter) => `${chapter.markdown['zh-CN']}\n${chapter.markdown.en}`).join('\n')
  for (const token of ['x', 'y', 'ŷ', 'w', 'b', 'MSE', 'K=3', '4×4', '+10', '-1', '-3', '3103', '7107']) {
    assert.match(content, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `missing ${token}`)
  }
  assert.equal(AI_OVERVIEW_SEEDS.kmeans, 3103)
  assert.equal(AI_OVERVIEW_SEEDS.qLearning, 7107)
  assert.deepEqual(llmRouteStages.map((stage) => stage.id), [
    'python', 'math-numpy', 'probability', 'classical-ml', 'deep-learning', 'transformer', 'llm',
  ])
  assert.equal(aiOverviewScenarioCards.length, 3)
  assert.equal(traditionalAiMethods.length, 4)
  assert.equal(learningParadigmRows.length, 3)
  for (const locale of ['zh-CN', 'en'] as const) {
    const localized = aiOverviewModule.chapters.map((chapter) => chapter.markdown[locale]).join('\n')
    assert.match(localized, /\\sqrt\{/)
    assert.match(localized, /\\leftarrow/)
    assert.match(localized, /\\max_/)
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
})

test('AI Overview interaction protocol remains local formative observation', () => {
  const protocol = lessonInteractionProtocols.find((item) => item.moduleSlug === 'ai-overview')
  assert.ok(protocol)
  assert.deepEqual([...new Set(protocol.evidence.map((item) => item.kind))].sort(), [
    'configuration', 'explanation', 'observation',
  ])
  const copy = JSON.stringify(protocol)
  assert.doesNotMatch(copy, /backend|upload|submit|submission|acceptance|grade|score|passed/i)
})
