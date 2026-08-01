import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(import.meta.dirname, '..')
const packageRoot = resolve(root, 'public/linear-regression/phase-27a')
const summaryPath = resolve(packageRoot, 'linear-regression-course-summary.json')
const manifestPath = resolve(packageRoot, 'output-manifest.json')

function source(relativePath) {
  return readFileSync(resolve(root, relativePath), 'utf8')
}

function json(path) {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function sha256(path) {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function csvRows(path) {
  const [headerLine, ...lines] = readFileSync(path, 'utf8').trim().split(/\r?\n/)
  const headers = headerLine.split(',')
  return lines.map((line) => {
    const values = line.split(',')
    return Object.fromEntries(headers.map((header, index) => [header, values[index]]))
  })
}

function closeTo(actual, expected, tolerance) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`)
}

test('Phase 27A locks the exact chronological 60/20/20 split without overlap', () => {
  const summary = json(summaryPath)
  assert.equal(summary.contractVersion, 'linear-regression-phase-27a-summary-v2')
  assert.deepEqual(summary.split.train, {
    startRow: 0,
    endRowExclusive: 10427,
    rows: 10427,
    instantRange: [1, 10427],
  })
  assert.deepEqual(summary.split.validation, {
    startRow: 10427,
    endRowExclusive: 13903,
    rows: 3476,
    instantRange: [10428, 13903],
  })
  assert.deepEqual(summary.split.test, {
    startRow: 13903,
    endRowExclusive: 17379,
    rows: 3476,
    instantRange: [13904, 17379],
  })
  assert.equal(summary.split.mutuallyExclusive, true)
  assert.equal(summary.source.rows, 17379)
  assert.equal(summary.source.sha256, 'e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f')
})

test('all formal stages exclude leakage and fit selection preprocessing on training only', () => {
  const summary = json(summaryPath)
  const forbidden = new Set(['casual', 'registered', 'cnt'])
  for (const stage of summary.featureStages) {
    assert.equal(stage.features.some((feature) => forbidden.has(feature)), false, stage.id)
  }
  assert.deepEqual(summary.leakage.forbiddenFeatureColumns, ['casual', 'registered'])
  assert.equal(summary.leakage.preprocessorsFitOn, 'train-only-during-selection')
  assert.equal(summary.gradientDescent.scalerFitRows, 10427)
  assert.equal(summary.leakage.testUsage, 'single-final-evaluation-after-freeze')
  assert.equal(summary.finalTest.evaluationCount, 1)
  assert.equal(summary.selection.selectedStageId, 'calendar-weather-cycle')
})

test('published test residual CSV recomputes every final metric', () => {
  const summary = json(summaryPath)
  const rows = csvRows(resolve(packageRoot, 'test-residuals.csv')).map((row) => ({
    actual: Number(row.actual),
    prediction: Number(row.prediction),
    residual: Number(row.residual),
  }))
  assert.equal(rows.length, 3476)
  for (const row of rows) {
    assert.ok(Number.isFinite(row.actual))
    assert.ok(Number.isFinite(row.prediction))
    assert.ok(Number.isFinite(row.residual))
    closeTo(row.prediction - row.actual, row.residual, 1e-8)
  }
  const mse = rows.reduce((sum, row) => sum + row.residual ** 2, 0) / rows.length
  const mae = rows.reduce((sum, row) => sum + Math.abs(row.residual), 0) / rows.length
  const mean = rows.reduce((sum, row) => sum + row.actual, 0) / rows.length
  const baseline = rows.reduce((sum, row) => sum + (row.actual - mean) ** 2, 0)
  const r2 = 1 - rows.reduce((sum, row) => sum + row.residual ** 2, 0) / baseline
  closeTo(mse, summary.finalTest.metrics.mse, 1e-6)
  closeTo(Math.sqrt(mse), summary.finalTest.metrics.rmse, 1e-8)
  closeTo(mae, summary.finalTest.metrics.mae, 1e-8)
  closeTo(r2, summary.finalTest.metrics.r2, 1e-10)
})

test('NumPy gradient descent and sklearn agree on the same core design matrix', () => {
  const summary = json(summaryPath)
  assert.equal(summary.gradientDescent.features.join(','), 'temp,hum,windspeed,workingday,hr')
  assert.equal(summary.gradientDescent.updates, 765)
  assert.ok(summary.gradientDescent.maxParameterDeltaVsSklearn < 1e-7)
  assert.ok(Number.isFinite(summary.gradientDescent.finalMse))
  const trace = csvRows(resolve(packageRoot, 'gradient-descent-trace.csv'))
  assert.equal(Number(trace[0].update), 0)
  assert.equal(Number(trace.at(-1).update), 765)
  assert.ok(Number(trace.at(-1).mse) < Number(trace[0].mse))
})

test('manifest covers every published member with valid hashes and Pages-safe paths', () => {
  const manifest = json(manifestPath)
  assert.equal(manifest.contractVersion, 'linear-regression-phase-27a-manifest-v1')
  assert.ok(manifest.members.length >= 19)
  const paths = new Set()
  for (const member of manifest.members) {
    assert.equal(paths.has(member.relativePath), false, member.relativePath)
    paths.add(member.relativePath)
    const path = resolve(packageRoot, member.relativePath)
    assert.equal(existsSync(path), true, member.relativePath)
    assert.equal(statSync(path).size, member.bytes)
    assert.equal(sha256(path), member.sha256)
    assert.equal(member.publicPath, `/linear-regression/phase-27a/${member.relativePath}`)
    assert.equal(withPublicBase(member.publicPath, '/ML_tutorial_Site/'), `/ML_tutorial_Site/linear-regression/phase-27a/${member.relativePath}`)
  }
  for (const required of [
    'bike-linear-regression-course.zh-CN.ipynb',
    'bike-linear-regression-course.en.ipynb',
    'linear-regression-course-summary.json',
    'feature-stage-metrics.csv',
    'gradient-descent-trace.csv',
    'test-residuals.csv',
    'requirements.txt',
    'environment.json',
  ]) {
    assert.equal(paths.has(required), true, required)
  }
})

test('all eleven real-data figures bind a notebook cell and a readable fallback', () => {
  const summary = json(summaryPath)
  assert.equal(summary.figures.length, 11)
  for (const figure of summary.figures) {
    assert.match(figure.sourceCellId, /^[a-z][a-z0-9-]+$/)
    assert.ok(figure.title['zh-CN'] && figure.title.en)
    assert.ok(figure.alt['zh-CN'] && figure.alt.en)
    assert.ok(figure.caption['zh-CN'] && figure.caption.en)
    assert.ok(figure.readingHint['zh-CN'] && figure.readingHint.en)
    assert.equal(figure.loading, 'lazy')
    const path = resolve(root, `public${figure.publicPath}`)
    assert.equal(existsSync(path), true)
    assert.equal(sha256(path), figure.sha256)
    assert.deepEqual([...readFileSync(path).subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10])
    assert.ok(Object.keys(figure.fallback).length > 0)
  }
})

test('both notebooks are executed, bilingual, and bind all figure cell IDs', () => {
  const summary = json(summaryPath)
  const requiredCells = new Set(summary.figures.map((figure) => figure.sourceCellId))
  for (const locale of ['zh-CN', 'en']) {
    const notebook = json(resolve(packageRoot, `bike-linear-regression-course.${locale}.ipynb`))
    assert.equal(notebook.metadata.mlAtlas.locale, locale)
    const codeCells = notebook.cells.filter((cell) => cell.cell_type === 'code')
    assert.ok(codeCells.length >= 10)
    for (const cell of codeCells) {
      assert.equal(typeof cell.execution_count, 'number', cell.id)
      assert.equal(cell.outputs.some((entry) => entry.output_type === 'error'), false, cell.id)
    }
    const ids = new Set(notebook.cells.map((cell) => cell.id))
    for (const cellId of requiredCells) assert.equal(ids.has(cellId), true, cellId)
  }
  assert.match(source('public/linear-regression/phase-27a/requirements.txt'), /matplotlib==3\.10\.9/)
  assert.match(source('public/linear-regression/phase-27a/requirements.txt'), /ipykernel==7\.3\.0/)
})

test('typed lesson content preserves eight deep links and one vertical observation lab per chapter', () => {
  const lessonSource = source('src/data/linearRegressionLesson.ts')
  const typesSource = source('src/types/linearRegressionLesson.ts')
  const pageSource = source('src/components/LinearRegressionPagedLesson.vue')
  const blockSource = source('src/components/LinearRegressionLessonBlock.vue')
  const styleSource = source('src/styles/modules/linear-regression.css')

  for (const id of ['fit-line', 'multivariate', 'residual-loss', 'training-motion', 'polynomial', 'model-limits', 'overfitting', 'regularization']) {
    assert.match(lessonSource, new RegExp(`(?:'${id}'|${id}): \\{`))
  }
  for (const kind of ['explanation', 'formula', 'code', 'runtime-output', 'figure', 'table', 'observation-lab']) {
    assert.match(typesSource, new RegExp(`'${kind}'`))
  }
  assert.doesNotMatch(pageSource, /learning-grid|__workbench/)
  assert.match(pageSource, /linear-course-page__lesson-flow/)
  assert.match(pageSource, /block\.kind === 'observation-lab'/)
  assert.match(blockSource, /loading="lazy"/)
  assert.match(blockSource, /CodeLab/)
  assert.doesNotMatch(lessonSource, /### 来源参考|### Source References/)
  assert.match(styleSource, /@media \(min-width: 1440px\)/)
  assert.match(styleSource, /width: min\(100%, 1040px\)/)
})
