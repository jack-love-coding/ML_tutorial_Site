import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path) => readFileSync(new URL(path, root), 'utf8')

test('housing project uses one current chapter, responsive TOC, and full-width lab', () => {
  const page = read('src/components/HousingProjectPagedLesson.vue')
  const css = read('src/styles/modules/housing-project.css')
  assert.match(page, /data-testid="housing-current-chapter"/)
  assert.match(page, /data-testid="housing-course-lab"/)
  assert.match(page, /HousingProjectObservationLab/)
  assert.doesNotMatch(page, /StoryScroller|learning-grid|cockpit/)
  assert.match(css, /width:\s*min\(100%, 1040px\)/)
  assert.match(css, /@media \(min-width: 1440px\)[\s\S]*housing-course-page__sidebar[\s\S]*position: sticky/)
  assert.match(css, /@media \(max-width: 767px\)[\s\S]*grid-template-columns: 1fr/)
  assert.match(css, /prefers-reduced-motion: reduce/)
})

test('bespoke routes precede generic routes and Pages emits all deep fallbacks', () => {
  const router = read('src/router/index.ts')
  const fallbacks = read('scripts/create-pages-fallbacks.mjs')
  const chapterIndex = router.indexOf("path: '/learn/housing-price-project/:chapterId'")
  const genericIndex = router.indexOf("path: '/learn/:moduleId/:lessonId'")
  assert.ok(chapterIndex >= 0 && chapterIndex < genericIndex)
  assert.match(router, /redirect: '\/learn\/housing-price-project\/csv-to-frame'/)
  for (const id of ['csv-to-frame', 'eda-first-pass', 'cleaning-splits', 'linear-baseline', 'evaluation', 'review-next-iteration']) {
    assert.match(fallbacks, new RegExp(id))
  }
})

test('AlgorithmView mounts the housing page outside the legacy workflow renderer', () => {
  const view = read('src/views/AlgorithmView.vue')
  assert.match(view, /HousingProjectPagedLesson/)
  assert.match(view, /isHousingProjectPage && activeSection/)
  const workflowContract = view.match(/const isWorkflowLessonPage = computed\([\s\S]*?\n\)/)?.[0] ?? ''
  assert.doesNotMatch(workflowContract, /isHousingProjectPage/)
})
