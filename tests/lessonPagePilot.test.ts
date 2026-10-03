import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('LessonPage pilot files define the shared skeleton and block renderer', () => {
  for (const path of [
    'src/lessons/LessonPage.vue',
    'src/lessons/LessonBlockRenderer.vue',
    'src/lessons/labRegistry.ts',
  ]) {
    assert.ok(existsSync(new URL(path, root)), `${path} should exist`)
  }

  const lessonPageSource = read('src/lessons/LessonPage.vue')
  const blockRendererSource = read('src/lessons/LessonBlockRenderer.vue')

  assert.match(lessonPageSource, /StoryScroller/)
  assert.match(lessonPageSource, /LessonBlockRenderer/)
  assert.match(lessonPageSource, /algorithm-layout--lesson-story/)
  assert.match(lessonPageSource, /variantClass/)
  assert.match(lessonPageSource, /slot name="before-story"/)
  assert.match(lessonPageSource, /slot name="lab"/)
  assert.match(lessonPageSource, /@change="\(id\) => emit\('change', id\)"/)

  assert.match(blockRendererSource, /MarkdownMathContent/)
  assert.match(blockRendererSource, /GradientTeachingBlocks/)
  assert.match(blockRendererSource, /withPublicBase/)
  assert.match(blockRendererSource, /renderMode === 'gradient'/)
  assert.match(blockRendererSource, /visualAssets/)
  assert.match(blockRendererSource, /props\.showSources/)
  assert.match(blockRendererSource, /mlp-source-list/)
  assert.match(blockRendererSource, /slot name="lab"/)
})

test('pilot compatibility metadata follows the current rendering registry', () => {
  const registry = read('src/lessons/labRegistry.ts')
  assert.match(registry, /algorithmTeaching\(moduleSlug\)/)
  assert.match(registry, /renderer: teaching.renderer/)
  assert.doesNotMatch(registry, /placement: 'top'|mlp-playground-cockpit/)
})

test('AlgorithmView selects actual teaching modes and keeps specialized labs lazy', () => {
  const page = read('src/views/AlgorithmView.vue')
  const renderers = read('src/lessons/algorithmRenderers.ts')
  assert.match(page, /algorithmTeaching\(slug.value\)/)
  assert.match(page, /pagedAlgorithmRenderers\[teaching.value.renderer\]/)
  assert.match(page, /v-else-if="pagedRenderer && activeSection"/)
  assert.match(page, /teaching.renderer === 'neural'/)
  assert.match(page, /<LessonPage\s+v-else-if="isBlockLesson"/)
  for (const component of ['AiOverviewLessonLab', 'CnnGuidedLab', 'MlpGuidedLab']) {
    assert.match(page, new RegExp(`const ${component} = defineAsyncComponent`))
  }
  for (const component of ['GradientDescentPagedLesson', 'LinearRegressionPagedLesson', 'LogisticRegressionPagedLesson']) {
    assert.match(renderers, new RegExp(`defineAsyncComponent.*${component}`))
  }
  assert.doesNotMatch(page, /isLessonPagePilotSlug|lessonLabRegistry/)
})
