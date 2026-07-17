import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { messages } from '../src/i18n/messages.ts'

const root = new URL('../', import.meta.url)

function read(path) {
  return readFileSync(new URL(path, root), 'utf8')
}

function escaped(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

test('Python notebook and housing project modules follow their curriculum roles', () => {
  const typesSource = read('src/types/ml.ts')
  const catalogSource = read('src/data/moduleCatalog.ts')
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const pythonCourseViewSource = read('src/views/PythonDataToolsCourseView.vue')
  const messagesSource = read('src/i18n/messages.ts')
  const orderStart = catalogSource.indexOf('export const moduleOrder')
  const registryStart = catalogSource.indexOf('export const moduleRegistry')
  assert.ok(orderStart >= 0, 'moduleOrder should be exported')
  assert.ok(registryStart > orderStart, 'moduleRegistry should follow moduleOrder')
  const moduleOrderSource = catalogSource.slice(orderStart, registryStart)

  assert.match(typesSource, /\| 'python-notebook'/)
  assert.match(typesSource, /\| 'housing-price-project'/)
  assert.match(catalogSource, /import\('\.\/pythonNotebookModule'\)/)
  assert.match(catalogSource, /import\('\.\/housingPriceProjectModule'\)/)
  assert.doesNotMatch(catalogSource, /import \{ pythonNotebookModule \}/)

  const aiIndex = moduleOrderSource.indexOf('aiOverviewModule,')
  const pythonIndex = moduleOrderSource.indexOf('pythonNotebookModule,')
  const housingIndex = moduleOrderSource.indexOf('housingPriceProjectModule,')
  const lossIndex = moduleOrderSource.indexOf('lossFunctionsModule,')
  const linearRegressionIndex = moduleOrderSource.indexOf('linearRegressionModule,')

  assert.ok(aiIndex >= 0)
  assert.ok(pythonIndex > aiIndex, 'python-notebook should follow AI overview')
  assert.ok(housingIndex > lossIndex, 'housing-price-project should follow loss functions')
  assert.ok(housingIndex > linearRegressionIndex, 'housing-price-project should follow linear regression')

  assert.match(algorithmViewSource, /AppliedWorkflowLessonLab/)
  assert.match(algorithmViewSource, /slug\.value === 'housing-price-project'/)
  assert.match(algorithmViewSource, /algorithm-view--workflow/)
  assert.doesNotMatch(algorithmViewSource, /PythonDataToolsPagedLesson|python-notebook/)
  assert.match(pythonCourseViewSource, /<PythonDataToolsPagedLesson/)
  assert.doesNotMatch(pythonCourseViewSource, /useExperimentStore|simulate|loss|accuracy/)
  assert.match(messagesSource, /pythonNotebook: \{/)
  assert.match(messagesSource, /housingPriceProject: \{/)
})

test('Python notebook module shallowly registers the generated eight-chapter data-tools course', () => {
  const modulePath = new URL('src/data/pythonNotebookModule.ts', root)
  assert.ok(existsSync(modulePath), 'src/data/pythonNotebookModule.ts should exist')

  const moduleSource = read('src/data/pythonNotebookModule.ts')

  assert.match(moduleSource, /slug: 'python-notebook'/)
  assert.match(moduleSource, /route: '\/learn\/python-notebook'/)
  assert.match(moduleSource, /pythonDataToolsRuntimeChapters\.map/)
  for (const id of [
    'notebook-workflow',
    'numpy-foundations',
    'pandas-structures',
    'pandas-analysis',
    'matplotlib-visualization',
    'seaborn-statistics',
    'plotly-exploration',
    'analysis-report',
  ]) {
    assert.match(moduleSource, new RegExp(escaped(id)))
  }

  assert.doesNotMatch(moduleSource, /sklearn|train_test_split|LinearRegression|mean_absolute_error/)
  assert.doesNotMatch(moduleSource, /https?:\/\//)
  assert.doesNotMatch(moduleSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})

test('Python notebook locale metadata publishes the exact eight current section labels', () => {
  const expectedKeys = [
    'notebookWorkflow',
    'numpyFoundations',
    'pandasStructures',
    'pandasAnalysis',
    'matplotlibVisualization',
    'seabornStatistics',
    'plotlyExploration',
    'analysisReport',
  ]

  for (const locale of ['zh-CN', 'en']) {
    const metadata = messages[locale].modules.pythonNotebook
    assert.deepEqual(Object.keys(metadata.sections), expectedKeys)
    assert.equal(metadata.title.trim().length > 0, true)
    assert.equal(metadata.kicker, 'Python Data Tools')
    assert.equal(metadata.intro.trim().length > 0, true)
    assert.equal(metadata.summary.trim().length > 0, true)
    for (const section of Object.values(metadata.sections)) {
      assert.equal(section.title.trim().length > 0, true)
    }
  }
})

test('Housing project module covers CSV to review workflow with centralized references', () => {
  const modulePath = new URL('src/data/housingPriceProjectModule.ts', root)
  assert.ok(existsSync(modulePath), 'src/data/housingPriceProjectModule.ts should exist')

  const moduleSource = read('src/data/housingPriceProjectModule.ts')

  assert.match(moduleSource, /slug: 'housing-price-project'/)
  assert.match(moduleSource, /route: '\/learn\/housing-price-project'/)
  assert.equal([...moduleSource.matchAll(/chapter\(\s*'/g)].length, 6)

  for (const id of ['csv-to-frame', 'eda-first-pass', 'cleaning-splits', 'linear-baseline', 'evaluation', 'review-next-iteration']) {
    assert.match(moduleSource, new RegExp(`chapter\\(\\s*'${id}'`))
  }

  for (const requiredConcept of [
    'CSV -> EDA -> 清洗 -> 线性回归 -> 评估 -> 复盘',
    '房价预测',
    'California housing',
    'ColumnTransformer',
    'Pipeline',
    'fit_transform',
    'transform',
    '数据泄漏',
    'LinearRegression',
    'R²',
    'MAE',
    '复盘',
    '老师会先问',
    '想一想',
  ]) {
    assert.match(moduleSource, new RegExp(escaped(requiredConcept)))
  }

  for (const refId of [
    'REF-INRIA-NUMERICAL-PIPELINE',
    'REF-SKLEARN-CALIFORNIA-HOUSING',
    'REF-SKLEARN-COLUMN-TRANSFORMER',
    'REF-SKLEARN-COMMON-PITFALLS',
    'REF-SKLEARN-LINEAR-MODELS',
  ]) {
    assert.match(moduleSource, new RegExp(refId))
  }

  assert.doesNotMatch(moduleSource, /https?:\/\//)
  assert.doesNotMatch(moduleSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})

test('New workflow chapters expose checkpoints, lab scaffolds, and reference entries', () => {
  const checkpointSource = read('src/data/algorithmCheckpoints.ts')
  const labSource = read('src/components/AppliedWorkflowLessonLab.vue')
  const styleIndexSource = read('src/styles/index.css')
  const referenceSource = read('docs/ml-atlas-references.md')

  for (const token of [
    "'python-notebook': [",
    'python-data-tools-grouped-analysis-interpretation',
    'python-data-tools-correlation-not-causation',
    "'housing-price-project': [",
    'housing-project-leakage',
    'housing-project-evaluation',
  ]) {
    assert.match(checkpointSource, new RegExp(escaped(token)))
  }

  for (const token of [
    'workflow-lab__notebook',
    'workflow-lab__pipeline',
    'notebookCells',
    'housingStages',
    'activeWorkflow',
  ]) {
    assert.match(labSource, new RegExp(token))
  }

  assert.match(styleIndexSource, /workflow-lessons\.css/)
  assert.match(referenceSource, /REF-SKLEARN-GETTING-STARTED/)
  assert.match(referenceSource, /REF-SKLEARN-CALIFORNIA-HOUSING/)
  assert.doesNotMatch(labSource, /鐩戠|鏃犵|娣卞|鐢熸垚寮|璁|鈥|�/)
})
