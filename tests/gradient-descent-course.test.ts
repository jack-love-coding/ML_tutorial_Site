import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const lessonSource = read('src/data/gradientDescentLesson.ts')
const chapterIds = [
  'loss-function',
  'landscape',
  'gradient-rule',
  'learning-rate',
  'saddle-local-minima',
  'noise-and-batch',
] as const

test('gradient descent preserves six deep links and one typed lab per page', () => {
  for (const chapterId of chapterIds) {
    assert.match(lessonSource, new RegExp(`['\"]?${chapterId}['\"]?: \\{`), chapterId)
  }
  assert.match(lessonSource, /role: 'question'[\s\S]*role: 'concept'[\s\S]*role: 'example'[\s\S]*role: 'prediction'/)
  assert.match(lessonSource, /kind: 'observation-lab'[\s\S]*role: 'observation'[\s\S]*role: 'misconception'[\s\S]*role: 'conclusion'/)
  assert.match(lessonSource, /role: 'prediction'[\s\S]*body: extra\.prediction/)
  assert.match(lessonSource, /prompt: extra\.labPrompt/)
  assert.match(lessonSource, /sceneId: id/)
})

test('gradient lesson copy is bilingual and uses learner-facing result language', () => {
  assert.doesNotMatch(lessonSource, /观察证据|Evidence|Ref ID|katex-error|haty/)
  assert.match(lessonSource, /const loc = \(zhCN: string, en: string\): LocalizedCopy/)
  assert.ok((lessonSource.match(/loc\('/g) ?? []).length > 50)
})

test('gradient rule alone mounts the chaptered Manim lesson before its lab', () => {
  assert.match(lessonSource, /if \(id === 'gradient-rule'\) \{[\s\S]*kind: 'media'/)
  assert.match(lessonSource, /assetPath: '\/manim\/gradient-descent\/gradient-rule\.mp4'/)
  assert.match(lessonSource, /\[0, 12, 24, 36, 48, 60, 72\]/)
  assert.ok(lessonSource.indexOf("kind: 'media'") < lessonSource.indexOf("kind: 'observation-lab'"))
})

test('gradient course route is dedicated, lazy, and precedes the generic lesson route', () => {
  const router = read('src/router/index.ts')
  const page = read('src/views/AlgorithmView.vue')
  const fallbacks = read('scripts/create-pages-fallbacks.mjs')
  assert.ok(router.indexOf("path: '/learn/gradient-descent/:chapterId'") < router.indexOf("path: '/learn/:moduleId/:lessonId'"))
  assert.match(router, /redirect: '\/learn\/gradient-descent\/loss-function'/)
  assert.match(page, /defineAsyncComponent\([\s\S]*GradientDescentPagedLesson\.vue/)
  assert.match(page, /v-else-if="isGradientPage && activeSection"/)
  assert.match(page, /!isGradientPage \|\| activeSection\?\.id === 'noise-and-batch'/)
  assert.match(page, /!isNeuralGuidedPage && !isGradientPage/)
  for (const chapterId of chapterIds) assert.ok(fallbacks.includes(`'${chapterId}'`), chapterId)
})

test('course page uses a single reading column and lazy-loads six dedicated scenes', () => {
  const page = read('src/components/GradientDescentPagedLesson.vue')
  const shell = read('src/components/gradient-descent/GradientLessonLab.vue')
  const css = read('src/styles/modules/gradient-descent.css')
  assert.doesNotMatch(page, /learning-grid|GradientStickyLabRail|GradientDescentViz/)
  assert.match(page, /data-testid="gradient-current-chapter"/)
  assert.match(page, /data-testid="gradient-course-lab"/)
  for (const component of [
    'GradientLossFunctionLab',
    'GradientLandscapeLab',
    'GradientRuleLab',
    'GradientLearningRateLab',
    'GradientTerrainLab',
    'GradientBatchLab',
  ]) assert.match(shell, new RegExp(`import\\('./${component}\\.vue'\\)`), component)
  assert.match(css, /@media \(min-width: 1440px\)/)
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(css, /max-width: 1040px/)
})

test('all animated gradient labs retain single-step and clean up timers', () => {
  for (const file of ['GradientRuleLab.vue', 'GradientLearningRateLab.vue', 'GradientTerrainLab.vue', 'GradientBatchLab.vue']) {
    const source = read(`src/components/gradient-descent/${file}`)
    assert.match(source, /prefers-reduced-motion: reduce/, file)
    assert.match(source, /onBeforeUnmount\(stop\)/, file)
    assert.match(source, /@click="step"/, file)
    assert.match(source, /Number\.isFinite|toFixed|Math\.hypot/, file)
  }
})

test('references and downloads appear only in the final chapter', () => {
  assert.match(lessonSource, /if \(id !== 'noise-and-batch'\) return \{ id, blocks \}/)
  assert.match(lessonSource, /references: \[/)
  assert.match(lessonSource, /downloads: \[/)
  assert.match(lessonSource, /gradient-descent-from-scratch\.zh-CN\.ipynb/)
  const batchLab = read('src/components/gradient-descent/GradientBatchLab.vue')
  assert.match(batchLab, /payload\.bikeTrace\.preview/)
  assert.match(batchLab, /gd-bike-transfer/)
})
