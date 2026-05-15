import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { readStyleSource } from './helpers/styleSource.mjs'

const componentPath = new URL('../src/components/LinearRegressionLessonLab.vue', import.meta.url)
const pagedComponentPath = new URL('../src/components/LinearRegressionPagedLesson.vue', import.meta.url)
const styleSource = readStyleSource()

test('linear regression module is inserted into the guided course flow', () => {
  const moduleCatalogSource = readFileSync(
    new URL('../src/data/moduleCatalog.ts', import.meta.url),
    'utf8',
  )

  assert.match(moduleCatalogSource, /linearRegressionModule/)

  const lossIndex = moduleCatalogSource.indexOf('lossFunctionsModule')
  const gradientIndex = moduleCatalogSource.indexOf('gradientDescentModule')
  const linearIndex = moduleCatalogSource.indexOf('linearRegressionModule')
  const legacyIndex = moduleCatalogSource.indexOf('...legacyModuleOrder.filter')

  assert.notEqual(lossIndex, -1)
  assert.notEqual(gradientIndex, -1)
  assert.notEqual(linearIndex, -1)
  assert.notEqual(legacyIndex, -1)
  assert.ok(lossIndex < gradientIndex, 'loss functions should stay first')
  assert.ok(gradientIndex < linearIndex, 'linear regression should follow gradient descent')
  assert.ok(linearIndex < legacyIndex, 'linear regression should come before the legacy modules')
})

test('algorithm view has a dedicated linear regression lesson branch', () => {
  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )

  assert.match(algorithmViewSource, /LinearRegressionPagedLesson/)
  assert.match(algorithmViewSource, /requestedChapterId/)
  assert.match(algorithmViewSource, /router\.replace\(`\/learn\/linear-regression\/\$\{firstChapterId\}`\)/)
  assert.match(algorithmViewSource, /slug\.value === 'linear-regression'/)
  assert.match(algorithmViewSource, /showLegacyLinearRegressionStory/)
  assert.doesNotMatch(algorithmViewSource, /false && isLinearRegressionPage/)
  assert.doesNotMatch(algorithmViewSource, /<template v-else-if="isLinearRegressionPage"\s*\/>/)
})

test('linear regression chapter routes are wired before the generic algorithm route', () => {
  const routerSource = readFileSync(
    new URL('../src/router/index.ts', import.meta.url),
    'utf8',
  )

  const redirectIndex = routerSource.indexOf("path: '/learn/linear-regression'")
  const chapterIndex = routerSource.indexOf("path: '/learn/linear-regression/:chapterId'")
  const genericIndex = routerSource.indexOf("path: '/learn/:slug'")

  assert.notEqual(redirectIndex, -1, 'base linear regression route should redirect to the first chapter')
  assert.notEqual(chapterIndex, -1, 'chapter route should be declared')
  assert.notEqual(genericIndex, -1, 'generic algorithm route should remain declared')
  assert.ok(redirectIndex < genericIndex, 'base linear regression route must come before generic route')
  assert.ok(chapterIndex < genericIndex, 'chapter route must come before generic route')
  assert.match(routerSource, /redirect: '\/learn\/linear-regression\/fit-line'/)
})

test('linear regression paged lesson renders one current chapter with sidebar and pager', () => {
  assert.ok(existsSync(pagedComponentPath), 'paged linear regression component should exist')

  const moduleSource = readFileSync(
    new URL('../src/data/linearRegressionModule.ts', import.meta.url),
    'utf8',
  )
  const pagedSource = readFileSync(pagedComponentPath, 'utf8')

  for (const id of [
    'fit-line',
    'residual-loss',
    'training-motion',
    'model-limits',
    'multivariate',
    'polynomial',
    'overfitting',
    'regularization',
  ]) {
    assert.match(moduleSource, new RegExp(`id: '${id}'`))
  }

  assert.match(pagedSource, /data-testid="linear-current-chapter"/)
  assert.match(pagedSource, /:data-section-id="props\.section\.id"/)
  assert.match(pagedSource, /data-testid="linear-course-sidebar"/)
  assert.match(pagedSource, /data-testid="linear-mobile-toc"/)
  assert.match(pagedSource, /data-testid="linear-course-pager"/)
  assert.match(pagedSource, /`\/learn\/linear-regression\/\$\{section\.id\}`/)
  assert.match(pagedSource, /v-for="\(\s*chapter,\s*index\s*\) in props\.moduleDefinition\.chapters"/)
  assert.doesNotMatch(pagedSource, /class="story-card"/)
  assert.match(styleSource, /\.linear-course-page__sidebar\s*\{[^}]*position: sticky/s)
  assert.match(styleSource, /\.linear-course-page__mobile-toggle/)
  assert.match(styleSource, /\.linear-course-page__pager/)
})

test('linear regression lesson lab uses a unified experiment card layout', () => {
  assert.ok(existsSync(componentPath), 'linear regression lesson lab component should exist')

  const componentSource = readFileSync(componentPath, 'utf8')
  assert.match(componentSource, /class="linear-regression-lab"/)
  assert.match(componentSource, /variant="cockpit"/)
  assert.match(componentSource, /class="linear-regression-lab__workspace"/)
  assert.match(componentSource, /class="linear-regression-lab__viz"/)
  assert.match(componentSource, /class="linear-regression-lab__controls"/)
  assert.match(componentSource, /class="linear-regression-lab__readout"/)
  assert.match(componentSource, /class="linear-regression-lab__details linear-regression-lab__details--teaching"/)
  assert.match(componentSource, /class="linear-regression-lab__details linear-regression-lab__details--presets"/)
  assert.match(styleSource, /\.linear-regression-lab__workspace\s*\{/)
  assert.match(styleSource, /\.lesson-workbench--cockpit/)
})

test('linear regression advanced chapters and subviews are wired', () => {
  const moduleSource = readFileSync(
    new URL('../src/data/linearRegressionModule.ts', import.meta.url),
    'utf8',
  )
  const componentSource = readFileSync(componentPath, 'utf8')

  assert.match(moduleSource, /id: 'multivariate'/)
  assert.match(moduleSource, /id: 'polynomial'/)
  assert.match(moduleSource, /id: 'overfitting'/)
  assert.match(moduleSource, /id: 'regularization'/)
  assert.match(moduleSource, /regularizationType/)
  assert.match(moduleSource, /polynomialDegree/)

  const chapterCount = [...moduleSource.matchAll(/eyebrowKey: 'common\.chapter'/g)].length
  assert.equal(chapterCount, 8, 'linear regression should have 8 guided chapters')

  assert.match(componentSource, /LinearRegressionMultivariateView/)
  assert.match(componentSource, /LinearRegressionUnivariateView/)
  assert.match(componentSource, /linear-regression-lab__advanced-controls/)
})

test('linear regression overfitting chapter uses real-data diagnostics and local video', () => {
  const moduleSource = readFileSync(
    new URL('../src/data/linearRegressionModule.ts', import.meta.url),
    'utf8',
  )
  const simulationSource = readFileSync(
    new URL('../src/simulations/linearRegression.ts', import.meta.url),
    'utf8',
  )
  const dataSource = readFileSync(
    new URL('../src/data/californiaHousingSubset.ts', import.meta.url),
    'utf8',
  )
  const componentSource = readFileSync(componentPath, 'utf8')
  const pagedSource = readFileSync(pagedComponentPath, 'utf8')
  const univariateSource = readFileSync(
    new URL('../src/components/LinearRegressionUnivariateView.vue', import.meta.url),
    'utf8',
  )
  const videoPath = new URL('../public/manim/linear-regression/fit-comparison.mp4', import.meta.url)
  const posterPath = new URL('../public/manim/linear-regression/fit-comparison.svg', import.meta.url)
  const regularizationVideoPath = new URL('../public/manim/linear-regression/regularization-geometry.mp4', import.meta.url)
  const regularizationPosterPath = new URL('../public/manim/linear-regression/regularization-geometry.svg', import.meta.url)

  assert.match(moduleSource, /California Housing/)
  assert.match(moduleSource, /fit-comparison\.mp4/)
  assert.match(moduleSource, /regularization-geometry\.mp4/)
  assert.match(moduleSource, /degree 1/)
  assert.match(moduleSource, /degree 3/)
  assert.match(moduleSource, /degree 7/)
  assert.match(dataSource, /datasetSize: 20640/)
  assert.match(dataSource, /featureCount: 8/)
  assert.match(dataSource, /MedInc/)
  assert.match(simulationSource, /fitDiagnostics/)
  assert.match(simulationSource, /regressionMeta/)
  assert.match(componentSource, /isRealCaliforniaFamily/)
  assert.match(univariateSource, /linear-regression-lab__diagnostic-grid/)
  assert.match(univariateSource, /fitDiagnostics/)
  assert.match(pagedSource, /story-media--linear/)
  assert.match(pagedSource, /<video/)
  assert.match(styleSource, /\.story-media/)
  assert.match(styleSource, /\.linear-regression-lab__diagnostic-grid/)
  assert.ok(existsSync(videoPath), 'fit comparison video should be generated')
  assert.ok(existsSync(posterPath), 'fit comparison poster should be generated')
  assert.ok(existsSync(regularizationVideoPath), 'regularization geometry video should be generated')
  assert.ok(existsSync(regularizationPosterPath), 'regularization geometry poster should be generated')
})

test('linear regression lecture adds the required teaching frame and animated diagrams', () => {
  const moduleSource = readFileSync(
    new URL('../src/data/linearRegressionModule.ts', import.meta.url),
    'utf8',
  )
  const componentSource = readFileSync(componentPath, 'utf8')
  for (const heading of [
    '### 核心问题',
    '### 概念直觉',
    '### 手算例子',
    '### 公式',
    '### 常见误解',
    '### 插图与动画',
    '### 交互实验设计',
    '### 来源参考',
  ]) {
    assert.match(moduleSource, new RegExp(heading))
  }

  assert.match(moduleSource, /withTeachingFrame/)
  assert.match(moduleSource, /linearRegressionTeachingFrames/)
  assert.match(moduleSource, /D2L/)
  assert.match(moduleSource, /CS357/)
  assert.match(componentSource, /linear-regression-lab__teaching-visual/)
  assert.match(componentSource, /linear-regression-lab__teaching-svg/)
  assert.match(componentSource, /linear-visual-residual/)
  assert.match(componentSource, /linear-visual-param-path/)
  assert.match(styleSource, /@keyframes linear-residual-pulse/)
  assert.match(styleSource, /@keyframes linear-path-flow/)
  assert.match(styleSource, /@keyframes linear-weight-shrink/)
})

test('linear regression paged lesson promotes data illustrations into visible content', () => {
  const pagedSource = readFileSync(pagedComponentPath, 'utf8')

  assert.match(pagedSource, /fuelRows/)
  assert.match(pagedSource, /weight: 3\.5/)
  assert.match(pagedSource, /mpg: 18/)
  assert.match(pagedSource, /linear-course-page__fuel-grid/)
  assert.match(pagedSource, /linear-course-page__equation-figure/)
  assert.match(pagedSource, /y' = b \+ w1x1/)
  assert.match(pagedSource, /linear-course-page__residual-grid/)
  assert.match(pagedSource, /linear-course-page__wide-figure/)
  assert.match(pagedSource, /LinearRegressionLessonLab/)
  assert.match(pagedSource, /LinearRegressionResults/)
})

test('linear regression cockpit keeps teaching diagrams and presets collapsed by default', () => {
  const componentSource = readFileSync(componentPath, 'utf8')

  const metricsIndex = componentSource.indexOf('<template #metrics>')
  const teachingDetailsIndex = componentSource.indexOf('linear-regression-lab__details--teaching')
  const presetsIndex = componentSource.indexOf('<template #presets>')
  const presetDetailsIndex = componentSource.indexOf('linear-regression-lab__details--presets')

  assert.notEqual(metricsIndex, -1)
  assert.notEqual(teachingDetailsIndex, -1)
  assert.notEqual(presetsIndex, -1)
  assert.notEqual(presetDetailsIndex, -1)
  assert.ok(metricsIndex < teachingDetailsIndex, 'teaching diagram should be inside a collapsed metrics detail')
  assert.ok(presetsIndex < presetDetailsIndex, 'preset list should be inside a collapsed lower detail')
  assert.doesNotMatch(componentSource, /<details[^>]*open/)
})

test('linear regression chapter navigation does not auto-reset an active experiment', () => {
  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )

  const onChapterChangeStart = algorithmViewSource.indexOf('function syncChapterPreset')
  const patchConfigStart = algorithmViewSource.indexOf('function patchConfig')
  assert.notEqual(onChapterChangeStart, -1, 'expected syncChapterPreset helper')
  assert.notEqual(patchConfigStart, -1, 'expected patchConfig handler after syncChapterPreset')

  const onChapterChangeBody = algorithmViewSource.slice(onChapterChangeStart, patchConfigStart)

  assert.match(
    onChapterChangeBody,
    /currentStep > 0|isPlaying/,
    'chapter preset sync must be guarded once a lab has started',
  )
  assert.match(onChapterChangeBody, /return/)
  assert.match(onChapterChangeBody, /applyPreset/)
})
