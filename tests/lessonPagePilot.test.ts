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

test('lesson lab registry declares the Phase 5 pilot modules and placements', () => {
  const registrySource = read('src/lessons/labRegistry.ts')

  for (const token of [
    "'ai-overview'",
    "'gradient-descent'",
    "'mlp'",
    "labId: 'ai-overview-task-lab'",
    "labId: 'gradient-chapter-lab'",
    "labId: 'mlp-playground-cockpit'",
    "placement: 'section'",
    "placement: 'top'",
    "renderMode: 'gradient'",
    'isLessonPagePilotSlug',
  ]) {
    assert.match(registrySource, new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  }
})

test('AlgorithmView routes AI Overview, Gradient Descent, and MLP through LessonPage pilots', () => {
  const algorithmViewSource = read('src/views/AlgorithmView.vue')

  assert.match(algorithmViewSource, /const LessonPage = defineAsyncComponent\(\(\) => import\('\.\.\/lessons\/LessonPage\.vue'\)\)/)
  assert.match(algorithmViewSource, /isLessonPagePilotSlug/)
  assert.match(algorithmViewSource, /lessonLabRegistry/)
  assert.match(algorithmViewSource, /const isLessonPagePilot = computed/)
  assert.match(algorithmViewSource, /const activeLessonLab = computed/)
  assert.match(algorithmViewSource, /<LessonPage\s+v-if="isLessonPagePilot"/)
  assert.match(algorithmViewSource, /activeLessonLab\?\.labId === 'ai-overview-task-lab'/)
  assert.match(algorithmViewSource, /activeLessonLab\?\.labId === 'gradient-chapter-lab'/)
  assert.match(algorithmViewSource, /activeLessonLab\?\.placement === 'top' && isMlpPage/)
  assert.match(algorithmViewSource, /MlpPlaygroundCockpit/)
  assert.match(algorithmViewSource, /GradientChapterLab/)
  assert.match(algorithmViewSource, /AiOverviewLessonLab/)

  assert.doesNotMatch(algorithmViewSource, /v-if="isAiOverviewPage"\s+class="algorithm-layout algorithm-layout--lesson-story/)
  assert.doesNotMatch(algorithmViewSource, /v-else-if="isGradientPage"\s+class="algorithm-layout algorithm-layout--gradient-story/)
  assert.doesNotMatch(algorithmViewSource, /v-else-if="isMlpPage"\s+class="algorithm-layout algorithm-layout--lesson-story algorithm-layout--mlp-story/)
})
