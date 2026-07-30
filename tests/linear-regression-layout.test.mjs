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

  assert.notEqual(lossIndex, -1)
  assert.notEqual(gradientIndex, -1)
  assert.notEqual(linearIndex, -1)
  assert.ok(lossIndex < gradientIndex, 'loss functions should stay first')
  assert.ok(gradientIndex < linearIndex, 'linear regression should follow gradient descent')
  assert.match(moduleCatalogSource, /import\('\.\/linearRegressionModule'\)/)
})

test('algorithm view has a dedicated linear regression lesson branch', () => {
  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )

  assert.match(algorithmViewSource, /LinearRegressionPagedLesson/)
  assert.match(algorithmViewSource, /requestedChapterId/)
  assert.match(algorithmViewSource, /route\.params\.moduleId/)
  assert.match(algorithmViewSource, /route\.params\.lessonId/)
  assert.match(algorithmViewSource, /router\.replace\(`\/learn\/\$\{nextSlug\}\/\$\{firstChapterId\}`\)/)
  assert.match(algorithmViewSource, /slug\.value === 'linear-regression'/)
  assert.doesNotMatch(algorithmViewSource, /showLegacyLinearRegressionStory/)
  assert.doesNotMatch(algorithmViewSource, /LinearRegressionResults = defineAsyncComponent/)
  assert.doesNotMatch(algorithmViewSource, /LinearRegressionLessonLab = defineAsyncComponent/)
  assert.doesNotMatch(algorithmViewSource, /false && isLinearRegressionPage/)
  assert.doesNotMatch(algorithmViewSource, /<template v-else-if="isLinearRegressionPage"\s*\/>/)
})

test('linear regression route preservation keeps lazy bespoke routes before generic algorithm routes', () => {
  const routerSource = readFileSync(
    new URL('../src/router/index.ts', import.meta.url),
    'utf8',
  )

  const redirectIndex = routerSource.indexOf("path: '/learn/linear-regression'")
  const chapterIndex = routerSource.indexOf("path: '/learn/linear-regression/:chapterId'")
  const genericLessonIndex = routerSource.indexOf("path: '/learn/:moduleId/:lessonId'")
  const genericIndex = routerSource.indexOf("path: '/learn/:moduleId',")

  assert.notEqual(redirectIndex, -1, 'base linear regression route should redirect to the first chapter')
  assert.notEqual(chapterIndex, -1, 'chapter route should be declared')
  assert.notEqual(genericIndex, -1, 'generic algorithm route should remain declared')
  assert.notEqual(genericLessonIndex, -1, 'generic lesson route should be declared')
  assert.ok(redirectIndex < genericIndex, 'base linear regression route must come before generic route')
  assert.ok(chapterIndex < genericLessonIndex, 'chapter route must come before generic lesson route')
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

test('linear regression course workbench contains the desktop cockpit within its column', () => {
  assert.match(
    styleSource,
    /\.linear-course-page__workbench\s+\.lesson-workbench--cockpit\s+\.lesson-workbench__grid\s*\{[^}]*grid-template-columns:\s*minmax\(0,\s*1fr\)/s,
    'the nested cockpit must use its course column width instead of the viewport desktop breakpoint',
  )
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

test('Plans 27-07/08 retain explicit page, result, typed asset, and fallback integration surfaces', () => {
  const moduleSource = readFileSync(
    new URL('../src/data/linearRegressionModule.ts', import.meta.url),
    'utf8',
  )
  const componentSource = readFileSync(componentPath, 'utf8')
  const pagedSource = readFileSync(pagedComponentPath, 'utf8')

  assert.doesNotMatch(moduleSource, /California Housing|MedHouseVal/)
  assert.match(componentSource, /LinearRegressionMultivariateView/)
  assert.match(componentSource, /LinearRegressionUnivariateView/)
  assert.match(pagedSource, /MarkdownMathContent/)
  assert.match(pagedSource, /withPublicBase/)
  assert.match(pagedSource, /LinearRegressionLessonLab/)
  assert.match(pagedSource, /LinearRegressionResults/)
  assert.match(pagedSource, /linearRegressionChapterAssets/)
  assert.match(pagedSource, /parseLinearRegressionSummary/)
  assert.match(pagedSource, /new AbortController\(\)/)
  assert.match(pagedSource, /linear-course-page__summary-state/)
  assert.doesNotMatch(pagedSource, /story-media--linear|<video/)
  assert.match(styleSource, /@media \(prefers-reduced-motion: reduce\)/)
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

test('linear regression paged lesson composes the locked Bike contract beside lab results', () => {
  const pagedSource = readFileSync(pagedComponentPath, 'utf8')

  assert.match(pagedSource, /Bike Sharing/)
  assert.match(pagedSource, /loadedSummary\.source\.target/)
  assert.match(pagedSource, /loadedSummary\.features\.order/)
  assert.match(pagedSource, /linear-course-page__learning-grid/)
  assert.match(pagedSource, /linear-course-page__contract/)
  assert.match(
    pagedSource,
    /LinearRegressionLessonLab[\s\S]*LinearRegressionResults/,
  )
  assert.doesNotMatch(pagedSource, /fuelRows|residualRows|California|MPG/)
  assert.doesNotMatch(
    pagedSource.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)?.[1] ?? '',
    /reduce\([^)]*residual|\*\*\s*2/,
  )
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
