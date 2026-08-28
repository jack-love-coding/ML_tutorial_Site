import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { readStyleSource } from './helpers/styleSource.mjs'

const legacyLabPath = new URL('../src/components/LogisticRegressionLessonLab.vue', import.meta.url)
const pagedPath = new URL('../src/components/LogisticRegressionPagedLesson.vue', import.meta.url)
const chapterIds = ['linear-score', 'sigmoid-probability', 'threshold-decisions', 'log-loss', 'regularization', 'linear-limits']

test('Phase 29 preserves the legacy module, deep routes, catalog loader, and compatibility component', () => {
  const router = readFileSync(new URL('../src/router/index.ts', import.meta.url), 'utf8')
  const catalog = readFileSync(new URL('../src/data/moduleCatalog.ts', import.meta.url), 'utf8')
  const module = readFileSync(new URL('../src/data/logisticRegressionModule.ts', import.meta.url), 'utf8')
  assert.ok(existsSync(legacyLabPath), 'legacy component remains available for compatibility')
  assert.match(catalog, /defineModuleLoader\('logistic-regression'/)
  assert.match(catalog, /import\('\.\/logisticRegressionModule'\)/)
  assert.match(router, /path: '\/learn\/logistic-regression'/)
  assert.match(router, /path: '\/learn\/logistic-regression\/:chapterId'/)
  assert.match(router, /redirect: '\/learn\/logistic-regression\/linear-score'/)
  for (const id of chapterIds) assert.match(module, new RegExp(`id: '${id}'`))
})

test('Phase 29 paged lesson keeps TOC, pager, progress, and checkpoint while mounting one dedicated lab after content', () => {
  assert.ok(existsSync(pagedPath), 'paged component remains available')
  const source = readFileSync(pagedPath, 'utf8')
  assert.match(source, /data-testid="logistic-current-chapter"/)
  assert.match(source, /data-testid="logistic-course-sidebar"/)
  assert.match(source, /data-testid="logistic-mobile-toc"/)
  assert.match(source, /data-testid="logistic-course-pager"/)
  assert.match(source, /AlgorithmCheckpointQuiz/)
  assert.match(source, /LogisticLessonLab/)
  assert.doesNotMatch(source, /<LogisticRegressionLessonLab|LogisticRegressionLessonLab\s+from/)
  assert.doesNotMatch(source, /lesson-workbench--cockpit|ClassificationViz/)
  assert.doesNotMatch(source, /LogisticConfusionD3Figure|LogisticLossSurfaceView|logistic-course-results/)
  assert.match(source, /ChapteredMediaPlayer/)
  assert.match(source, /withPublicBase/)
  const contentIndex = source.indexOf('logistic-course-page__content')
  const labIndex = source.lastIndexOf('LogisticLessonLab')
  assert.ok(contentIndex >= 0 && labIndex > contentIndex, 'the current chapter lab follows teaching content')
})

test('Phase 29 keeps the logistic checkpoint and legacy results outside the generic AlgorithmView shell', () => {
  const source = readFileSync(new URL('../src/views/AlgorithmView.vue', import.meta.url), 'utf8')
  assert.match(source, /!isLogisticRegressionPage/)
  assert.match(source, /!isLogisticRegressionPage && !isHousingProjectPage/)
})

test('Phase 29 lesson is single-column while retaining responsive TOC fallbacks', () => {
  const source = readFileSync(pagedPath, 'utf8')
  const css = readStyleSource()
  assert.doesNotMatch(source, /learning-grid/)
  assert.match(source, /logistic-course-page__main/)
  assert.match(css, /\.logistic-course-page__sidebar\s*\{[^}]*position:\s*sticky/s)
  assert.match(css, /@media\s*\(max-width:\s*1439px\)/)
  assert.match(css, /\.logistic-course-page__main article\s*\{[^}]*1040px/s)
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/)
  assert.match(css, /\.logistic-course-page__code pre\s*\{[^}]*overflow:\s*auto/s)
})
