import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'

const componentPath = new URL('../src/components/LinearRegressionLessonLab.vue', import.meta.url)

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

  assert.match(algorithmViewSource, /LinearRegressionLessonLab/)
  assert.match(algorithmViewSource, /LinearRegressionResults/)
  assert.match(algorithmViewSource, /slug\.value === 'linear-regression'/)
})

test('linear regression lesson lab uses a unified experiment card layout', () => {
  assert.ok(existsSync(componentPath), 'linear regression lesson lab component should exist')

  const componentSource = readFileSync(componentPath, 'utf8')
  const styleSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

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
  const univariateSource = readFileSync(
    new URL('../src/components/LinearRegressionUnivariateView.vue', import.meta.url),
    'utf8',
  )
  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )
  const styleSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')
  const videoPath = new URL('../public/manim/linear-regression/fit-comparison.mp4', import.meta.url)
  const posterPath = new URL('../public/manim/linear-regression/fit-comparison.svg', import.meta.url)

  assert.match(moduleSource, /California Housing/)
  assert.match(moduleSource, /fit-comparison\.mp4/)
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
  assert.match(algorithmViewSource, /story-media--linear/)
  assert.match(algorithmViewSource, /<video/)
  assert.match(styleSource, /\.story-media/)
  assert.match(styleSource, /\.linear-regression-lab__diagnostic-grid/)
  assert.ok(existsSync(videoPath), 'fit comparison video should be generated')
  assert.ok(existsSync(posterPath), 'fit comparison poster should be generated')
})

test('linear regression lecture adds the required teaching frame and animated diagrams', () => {
  const moduleSource = readFileSync(
    new URL('../src/data/linearRegressionModule.ts', import.meta.url),
    'utf8',
  )
  const componentSource = readFileSync(componentPath, 'utf8')
  const styleSource = readFileSync(new URL('../src/style.css', import.meta.url), 'utf8')

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

test('linear regression chapter scroll does not auto-reset an active experiment', () => {
  const algorithmViewSource = readFileSync(
    new URL('../src/views/AlgorithmView.vue', import.meta.url),
    'utf8',
  )

  const onChapterChangeStart = algorithmViewSource.indexOf('function onChapterChange')
  const patchConfigStart = algorithmViewSource.indexOf('function patchConfig')
  assert.notEqual(onChapterChangeStart, -1, 'expected onChapterChange handler')
  assert.notEqual(patchConfigStart, -1, 'expected patchConfig handler after onChapterChange')

  const onChapterChangeBody = algorithmViewSource.slice(onChapterChangeStart, patchConfigStart)

  assert.match(onChapterChangeBody, /activeChapter\.value = nextChapter/)
  assert.match(
    onChapterChangeBody,
    /currentStep > 0|isPlaying/,
    'chapter preset sync must be guarded once a lab has started',
  )
  assert.match(onChapterChangeBody, /return/)
  assert.match(onChapterChangeBody, /applyPreset/)
})
