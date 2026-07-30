import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')

function source(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

function scriptBlock(componentSource) {
  return componentSource.match(/<script setup lang="ts">([\s\S]*?)<\/script>/)?.[1] ?? ''
}

const chapterIds = [
  'fit-line',
  'multivariate',
  'residual-loss',
  'training-motion',
  'polynomial',
  'model-limits',
  'overfitting',
  'regularization',
]

test('lab scaffold preserves the typed workbench shell and all eight chapter identities', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')

  assert.match(lab, /<script setup lang="ts">/)
  assert.match(lab, /defineProps<\{/)
  assert.match(lab, /defineEmits<\{/)
  assert.match(lab, /<LessonWorkbench/)
  assert.match(lab, /<LinearRegression(?:Univariate|Multivariate)View/)
  for (const chapterId of chapterIds) {
    assert.match(lab, new RegExp(`['"]?${chapterId}['"]?\\s*:`))
  }
})

test('asset loading scaffold forbids unsafe rendering and raw public fetch paths', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')
  const results = source('src/components/LinearRegressionResults.vue')
  const combined = `${lab}\n${results}`

  assert.doesNotMatch(combined, /fetch\(\s*['"]\//)
  assert.doesNotMatch(combined, /v-html/)
  assert.doesNotMatch(combined, /<iframe/)
  assert.doesNotMatch(combined, /https?:\/\/[^'"]+\.(?:json|csv|ipynb)/)
})

test('pure math boundary scaffold keeps fitting and metric formulas out of Vue', () => {
  const labScript = scriptBlock(source('src/components/LinearRegressionLessonLab.vue'))
  const resultsScript = scriptBlock(source('src/components/LinearRegressionResults.vue'))
  const combined = `${labScript}\n${resultsScript}`

  assert.doesNotMatch(combined, /solveLinearSystem|matrixInverse|normalEquation\s*\(/)
  assert.doesNotMatch(
    combined,
    /(?:new\s+)?StandardScaler\s*\(|fit_intercept\s*=|numpy\.[A-Za-z_]+\s*\(|sklearn\.[A-Za-z_]+\s*\(/,
  )
  assert.doesNotMatch(combined, /reduce\([^)]*residual[^)]*=>[^)]*residual\s*\*\s*residual/)
  assert.doesNotMatch(combined, /weights\.map\([^)]*gradient|gradient.*weights\.map/s)
  assert.doesNotMatch(combined, /casual\s*\+\s*registered/)
})

test('accessibility scaffold keeps labeled controls current values reset and non-motion text', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')

  assert.match(lab, /<label[^>]*class="control"/)
  assert.match(lab, /<strong>\{\{[^}]+\}\}<\/strong>/)
  assert.match(lab, /type="range"/)
  assert.match(lab, /type="button"/)
  assert.match(lab, /emit\('reset'\)/)
  assert.match(lab, /<LinearRegression(?:Univariate|Multivariate)View/)
  assert.match(lab, /linear-regression-lab__static-note/)
})

test('registry maps every preserved chapter to one typed state and unknown IDs to a safe fixture', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')

  assert.match(lab, /activeChapterId/)
  assert.match(lab, /activeScenario/)
  assert.match(lab, /satisfies\s+Record<LinearRegressionChapterId/)
  for (const chapterId of chapterIds) {
    assert.match(lab, new RegExp(`['"]?${chapterId}['"]?\\s*:`))
  }
  assert.match(lab, /unknown-chapter|safe-chapter-fallback|teaching-fixture/)
  assert.doesNotMatch(lab, /(?:activeScenario|chapterState)[\s\S]{0,160}\?\?\s*(?:true|['"]fit-line['"])/)
})

test('loading assembles the strict four-file package with one base-safe abortable lifecycle', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')

  assert.match(lab, /linearRegressionAssetById/)
  for (const outputId of [
    'linear-regression-summary',
    'linear-regression-gradient-descent-trace',
    'linear-regression-coefficients',
    'linear-regression-heldout-residuals',
  ]) {
    assert.match(lab, new RegExp(outputId))
  }
  assert.match(lab, /parseLinearRegressionOutput/)
  assert.match(lab, /createLinearRegressionWorkbenchPackage/)
  assert.match(lab, /Promise\.all/)
  assert.match(lab, /withPublicBase\(.*\.publicPath\)/)
  assert.match(lab, /new AbortController\(\)/)
  assert.match(lab, /signal:\s*requestController\.signal/)
  assert.match(lab, /application\/json/)
  assert.match(lab, /text\/csv/)
  assert.match(lab, /if\s*\(!response\.ok\)/)
  assert.match(lab, /watch\(\s*\(\)\s*=>\s*props\.section\.id/)
  assert.match(lab, /onBeforeUnmount\(\(\)\s*=>\s*\{[\s\S]*abort\(\)/)
  assert.doesNotMatch(lab, /fetch\(\s*['"]\/notebooks\/linear-regression/)
  assert.doesNotMatch(lab, /parseLinearRegressionSummary/)
})

test('fallback states retain formulas and only the audited compact published baseline', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')
  const results = source('src/components/LinearRegressionResults.vue')
  const combined = `${lab}\n${results}`

  assert.match(combined, /workbenchState/)
  assert.match(combined, /loading|正在读取/)
  assert.match(combined, /invalid|无法读取|unavailable/)
  assert.match(combined, /LINEAR_REGRESSION_PUBLISHED_BASELINE/)
  assert.match(combined, /audited compact|审计过的精简/)
  assert.match(combined, /ŷ|prediction|预测/)
  assert.match(combined, /residual|残差/)
  assert.match(lab, /:disabled="workbenchState\.status !== 'ready'"/)
  assert.doesNotMatch(lab, /builtInTeachingFixture/)
})

test('controls are bounded finite keyboard-operable and reset to chapter defaults', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')

  assert.match(lab, /selectedTeachingRow/)
  assert.match(lab, /selectedHeldoutCase/)
  assert.match(lab, /diagnosticStage/)
  assert.match(lab, /Number\.isFinite/)
  assert.match(lab, /Math\.(?:min|max)/)
  assert.match(lab, /resetActiveLab/)
  assert.match(lab, /type="range"/)
  assert.match(lab, /<select/)
  assert.match(lab, /aria-label|aria-labelledby/)
  assert.match(lab, /@keydown/)
  assert.doesNotMatch(lab, /type="number"/)
})

test('row to batch results come from the pure Bike authority and preserve the locked row', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')
  const results = source('src/components/LinearRegressionResults.vue')
  const combined = `${lab}\n${results}`

  assert.match(lab, /selectRowBatchResult/)
  assert.match(combined, /representativeTrainingRow/)
  assert.match(combined, /11_?550/)
  assert.match(combined, /lossContribution/)
  assert.match(combined, /unaveragedWeightGradientContribution/)
  assert.match(lab, /13_?903/)
  assert.match(lab, /3_?476/)
  assert.match(combined, /row.*batch|batch.*row|单行.*批量|批量.*单行/s)
})

test('method comparison proves optimizer completion before model diagnosis', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')
  const results = source('src/components/LinearRegressionResults.vue')
  const combined = `${lab}\n${results}`

  assert.match(lab, /selectGradientTracePoint/)
  assert.match(lab, /selectMethodResult/)
  assert.match(combined, /optimizationGate/)
  assert.match(combined, /methodComparisonRows/)
  assert.match(combined, /gradient-descent/)
  assert.match(combined, /normal-equation/)
  assert.match(combined, /scikit-learn/)
  assert.match(combined, /gradientNorm/)
  assert.match(combined, /method.*delta|方法.*差异/s)
  assert.match(combined, /optimizationGate[\s\S]*diagnosticStage/)
})

test('coefficient view separates model and original spaces without component conversion', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')
  const results = source('src/components/LinearRegressionResults.vue')

  assert.match(lab, /selectCoefficientResult/)
  assert.match(results, /coefficientRows/)
  assert.match(results, /model-space|模型空间/)
  assert.match(results, /original-unit|原始单位/)
  assert.match(results, /workingday/)
  assert.match(results, /holding|保持其他|固定其他/)
  assert.doesNotMatch(scriptBlock(results), /\/\s*(?:mean|scale|sigma)|Math\.sqrt/)
})

test('diagnostic sequence covers hour spread atemp regularization log1p and combined review', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')
  const results = source('src/components/LinearRegressionResults.vue')
  const combined = `${lab}\n${results}`

  assert.match(lab, /selectHeldoutCase/)
  assert.match(lab, /selectAtempComparison/)
  assert.match(combined, /residualChartData/)
  assert.match(combined, /hourlyResiduals/)
  assert.match(combined, /predictionBins/)
  assert.match(combined, /atemp/)
  assert.match(combined, /Ridge/)
  assert.match(combined, /Lasso/)
  assert.match(combined, /objectives? differ|目标函数不同/)
  assert.match(combined, /log1p/)
  assert.match(combined, /combined-review/)
})

test('named held-out cases are expandable and keep text roles beyond color', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')
  const results = source('src/components/LinearRegressionResults.vue')
  const combined = `${lab}\n${results}`

  assert.match(results, /namedCases/)
  assert.match(results, /<details/)
  assert.match(combined, /negative-prediction/)
  assert.match(combined, /morning-peak-underprediction/)
  assert.match(combined, /evening-peak-underprediction/)
  assert.match(combined, /large-residual/)
  assert.match(results, /prediction - actual|预测值减真实值/)
})

test('Bike visuals are deterministic static SVG or tables with non-color cues', () => {
  const univariate = source('src/components/LinearRegressionUnivariateView.vue')
  const multivariate = source('src/components/LinearRegressionMultivariateView.vue')
  const combined = `${univariate}\n${multivariate}`

  assert.match(combined, /Bike|单车|自行车/)
  assert.match(combined, /role="img"|<table/)
  assert.match(combined, /aria-label/)
  assert.match(combined, /static|静态|motion|动画/)
  assert.match(combined, /pattern|dash|shape|形状|线型/)
  assert.doesNotMatch(combined, /California|fuel|housing|房价|燃油/)
  assert.doesNotMatch(scriptBlock(combined), /solveLinearSystem|StandardScaler|matrixInverse/)
})

test('each of the six controls owns a stable aria-live numerical output hook', () => {
  const lab = source('src/components/LinearRegressionLessonLab.vue')

  for (const hook of [
    'linear-output-row-batch',
    'linear-output-gd-trace',
    'linear-output-method',
    'linear-output-coefficient-space',
    'linear-output-heldout-case',
    'linear-output-atemp-comparison',
  ]) {
    assert.match(lab, new RegExp(`data-testid=["']${hook}["']`))
  }
  for (const field of [
    'rawFeatures',
    'trainMetrics',
    'testMetrics',
    'gradientNorm',
    'maxCoefficientDelta',
    'maxPredictionDelta',
    'timestamp',
    'correlation',
    'conditionNumber',
    'perturbationL2',
  ]) {
    assert.match(lab, new RegExp(field))
  }
  assert.match(lab, /aria-live="polite"/)
})

test('page composition places each chapter result beside its workbench', () => {
  const page = source('src/components/LinearRegressionPagedLesson.vue')

  assert.match(page, /data-testid="linear-course-lab"/)
  assert.match(page, /data-testid="linear-course-results"/)
  assert.match(page, /<LinearRegressionLessonLab[\s\S]*<LinearRegressionResults/)
})

test('downloads expose the complete registered local package once', () => {
  const downloads = source('src/components/LinearRegressionDownloads.vue')
  const algorithmView = source('src/views/AlgorithmView.vue')

  assert.match(downloads, /linearRegressionAssets/)
  assert.match(downloads, /withPublicBase\(asset\.publicPath\)/)
  assert.equal((algorithmView.match(/<LinearRegressionDownloads/g) ?? []).length, 1)
})

test('module styles prove mobile and reduced-motion layout', () => {
  const styles = [
    source('src/styles/modules/linear-regression.css'),
    source('src/styles/modules/linear-regression-responsive.css'),
  ].join('\n')

  assert.match(styles, /@media \(max-width: 390px\)/)
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/)
  assert.match(styles, /animation-duration:\s*0\.001ms/)
})

test('browser matrix covers bilingual root and eight deep links', () => {
  const matrix = source('scripts/qa/linearRegressionBrowserMatrix.js')

  assert.match(matrix, /expectedCaseCount\s*=\s*36/)
  assert.match(matrix, /locales\s*=\s*\[['"]zh-CN['"],\s*['"]en['"]\]/)
  assert.match(matrix, /width:\s*1440/)
  assert.match(matrix, /width:\s*390/)
  for (const chapterId of chapterIds) {
    assert.match(matrix, new RegExp(`['"]${chapterId}['"]`))
  }
})
