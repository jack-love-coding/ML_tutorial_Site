import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { readStyleSource } from './helpers/styleSource.mjs'

const componentPath = new URL('../src/components/LogisticRegressionLessonLab.vue', import.meta.url)
const pagedComponentPath = new URL('../src/components/LogisticRegressionPagedLesson.vue', import.meta.url)
const styleSource = readStyleSource()

test('logistic regression has a dedicated cockpit lesson lab', () => {
  assert.ok(existsSync(componentPath), 'logistic regression lesson lab component should exist')

  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )
  const componentSource = readFileSync(componentPath, 'utf8')
  const pagedSource = readFileSync(pagedComponentPath, 'utf8')

  assert.match(algorithmViewSource, /LogisticRegressionPagedLesson/)
  assert.doesNotMatch(algorithmViewSource, /showLegacyLogisticRegressionStory/)
  assert.doesNotMatch(algorithmViewSource, /LogisticRegressionLessonLab = defineAsyncComponent/)
  assert.match(algorithmViewSource, /slug\.value === 'logistic-regression'/)
  assert.match(algorithmViewSource, /algorithm-view--logistic/)
  assert.match(pagedSource, /LogisticRegressionLessonLab/)

  assert.match(componentSource, /class="logistic-regression-lab"/)
  assert.match(componentSource, /variant="cockpit"/)
  assert.match(componentSource, /ClassificationViz/)
  assert.match(componentSource, /#visual/)
  assert.match(componentSource, /#controls/)
  assert.match(componentSource, /#metrics/)
  assert.match(componentSource, /logistic-regression-lab__control-grid/)
  assert.match(componentSource, /logistic-regression-lab__readout/)
  assert.match(componentSource, /logistic-regression-lab__details logistic-regression-lab__details--teaching/)
  assert.match(componentSource, /logistic-regression-lab__details logistic-regression-lab__details--presets/)
  assert.match(styleSource, /\.logistic-regression-lab__visual\s*\{/)
  assert.match(styleSource, /\.logistic-regression-lab__control-grid\s*\{/)
  assert.match(styleSource, /\.lesson-workbench--cockpit/)
})

test('logistic regression cockpit keeps long teaching content collapsed by default', () => {
  const componentSource = readFileSync(componentPath, 'utf8')

  const metricsIndex = componentSource.indexOf('<template #metrics>')
  const teachingDetailsIndex = componentSource.indexOf('logistic-regression-lab__details--teaching')
  const presetsIndex = componentSource.indexOf('<template #presets>')
  const presetDetailsIndex = componentSource.indexOf('logistic-regression-lab__details--presets')

  assert.notEqual(metricsIndex, -1)
  assert.notEqual(teachingDetailsIndex, -1)
  assert.notEqual(presetsIndex, -1)
  assert.notEqual(presetDetailsIndex, -1)
  assert.ok(metricsIndex < teachingDetailsIndex, 'formula details should be behind the metrics strip')
  assert.ok(presetsIndex < presetDetailsIndex, 'preset list should be behind a lower detail section')
  assert.doesNotMatch(componentSource, /<details[^>]*open/)
})

test('logistic regression chapter changes preserve an active experiment', () => {
  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )

  const onChapterChangeStart = algorithmViewSource.indexOf('function syncChapterPreset')
  const patchConfigStart = algorithmViewSource.indexOf('function patchConfig')
  assert.notEqual(onChapterChangeStart, -1)
  assert.notEqual(patchConfigStart, -1)

  const onChapterChangeBody = algorithmViewSource.slice(onChapterChangeStart, patchConfigStart)
  assert.match(onChapterChangeBody, /isLogisticRegressionPage\.value/)
  assert.match(onChapterChangeBody, /currentStep > 0|isPlaying/)
  assert.match(onChapterChangeBody, /return/)
  assert.match(onChapterChangeBody, /applyPreset/)
})

test('logistic regression module is loaded through the asynchronous catalog', () => {
  const moduleCatalogSource = readFileSync(
    new URL('../src/data/moduleCatalog.ts', import.meta.url),
    'utf8',
  )

  assert.match(moduleCatalogSource, /defineModuleLoader\('logistic-regression'/)
  assert.match(moduleCatalogSource, /import\('\.\/logisticRegressionModule'\)/)
  assert.match(moduleCatalogSource, /loadAlgorithmModule/)
  assert.doesNotMatch(moduleCatalogSource, /import \{ logisticRegressionModule \}/)
})

test('logistic regression chapter routes are wired before the generic algorithm route', () => {
  const routerSource = readFileSync(
    new URL('../src/router/index.ts', import.meta.url),
    'utf8',
  )

  const redirectIndex = routerSource.indexOf("path: '/learn/logistic-regression'")
  const chapterIndex = routerSource.indexOf("path: '/learn/logistic-regression/:chapterId'")
  const genericLessonIndex = routerSource.indexOf("path: '/learn/:moduleId/:lessonId'")
  const genericIndex = routerSource.indexOf("path: '/learn/:moduleId',")

  assert.notEqual(redirectIndex, -1, 'base logistic regression route should redirect to the first chapter')
  assert.notEqual(chapterIndex, -1, 'chapter route should be declared')
  assert.notEqual(genericIndex, -1, 'generic algorithm route should remain declared')
  assert.notEqual(genericLessonIndex, -1, 'generic lesson route should be declared')
  assert.ok(redirectIndex < genericIndex, 'base logistic regression route must come before generic route')
  assert.ok(chapterIndex < genericLessonIndex, 'chapter route must come before generic lesson route')
  assert.match(routerSource, /redirect: '\/learn\/logistic-regression\/linear-score'/)
})

test('logistic regression paged lesson renders sidebar, mobile toc, current chapter, and pager', () => {
  assert.ok(existsSync(pagedComponentPath), 'paged logistic regression component should exist')

  const moduleSource = readFileSync(
    new URL('../src/data/logisticRegressionModule.ts', import.meta.url),
    'utf8',
  )
  const pagedSource = readFileSync(pagedComponentPath, 'utf8')

  for (const id of [
    'linear-score',
    'sigmoid-probability',
    'threshold-decisions',
    'log-loss',
    'regularization',
    'linear-limits',
  ]) {
    assert.match(moduleSource, new RegExp(`id: '${id}'`))
  }

  assert.match(pagedSource, /data-testid="logistic-current-chapter"/)
  assert.match(pagedSource, /:data-section-id="props\.section\.id"/)
  assert.match(pagedSource, /data-testid="logistic-course-sidebar"/)
  assert.match(pagedSource, /data-testid="logistic-mobile-toc"/)
  assert.match(pagedSource, /data-testid="logistic-course-pager"/)
  assert.match(pagedSource, /`\/learn\/logistic-regression\/\$\{section\.id\}`/)
  assert.match(pagedSource, /LogisticSigmoidD3Figure/)
  assert.match(pagedSource, /LogisticLogLossD3Figure/)
  assert.match(pagedSource, /LogisticConfusionD3Figure/)
  assert.match(pagedSource, /LogisticLossSurfaceView/)
  assert.match(pagedSource, /logistic-course-page__sidebar/)
  assert.match(styleSource, /\.linear-course-page__sidebar\s*\{[^}]*position: sticky/s)
  assert.match(styleSource, /\.logistic-d3-figure/)
  assert.match(styleSource, /\.logistic-three-surface/)
})

test('logistic regression teaching assets and sources are wired', () => {
  const moduleSource = readFileSync(
    new URL('../src/data/logisticRegressionModule.ts', import.meta.url),
    'utf8',
  )

  assert.match(moduleSource, /developers\.google\.com\/machine-learning\/crash-course\/logistic-regression/)
  assert.match(moduleSource, /sigmoid-function/)
  assert.match(moduleSource, /loss-regularization/)
  assert.match(moduleSource, /probability-field-context\.png/)
  assert.match(moduleSource, /regularization-confidence-context\.png/)
  assert.match(moduleSource, /linear-score-to-sigmoid\.mp4/)
  assert.match(moduleSource, /log-loss-confident-mistake\.mp4/)
  assert.match(moduleSource, /regularization-confidence-field\.mp4/)

  for (const assetPath of [
    '../public/logistic-regression/generated/probability-field-context.png',
    '../public/logistic-regression/generated/regularization-confidence-context.png',
    '../public/manim/logistic-regression/linear-score-to-sigmoid.mp4',
    '../public/manim/logistic-regression/linear-score-to-sigmoid.svg',
    '../public/manim/logistic-regression/log-loss-confident-mistake.mp4',
    '../public/manim/logistic-regression/log-loss-confident-mistake.svg',
    '../public/manim/logistic-regression/regularization-confidence-field.mp4',
    '../public/manim/logistic-regression/regularization-confidence-field.svg',
  ]) {
    assert.ok(existsSync(new URL(assetPath, import.meta.url)), `${assetPath} should exist`)
  }
})

test('logistic regression simulation exposes threshold-aware metrics', () => {
  const simulationSource = readFileSync(
    new URL('../src/simulations/logisticRegression.ts', import.meta.url),
    'utf8',
  )
  const vizSource = readFileSync(
    new URL('../src/components/ClassificationViz.vue', import.meta.url),
    'utf8',
  )

  assert.match(simulationSource, /config\.threshold \?\? 0\.5/)
  assert.match(simulationSource, /thresholdLogit = Math\.log/)
  assert.match(simulationSource, /prediction >= threshold/)
  assert.match(simulationSource, /precision:/)
  assert.match(simulationSource, /recall:/)
  assert.match(simulationSource, /weightNorm/)
  assert.match(simulationSource, /regularizationPenalty/)
  assert.match(simulationSource, /meanTrueClassProbability/)
  assert.match(vizSource, /thresholdLogit/)
  assert.match(vizSource, /thresholdLogit - w0 \* x1 - bias/)
})
