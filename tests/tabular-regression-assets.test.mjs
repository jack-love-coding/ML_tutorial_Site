import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { test } from 'node:test'

const root = new URL('../', import.meta.url)

function path(relative) {
  return new URL(relative, root)
}

function read(relative) {
  return readFileSync(path(relative), 'utf8')
}

function json(relative) {
  return JSON.parse(read(relative))
}

function sha256(relative) {
  return createHash('sha256').update(readFileSync(path(relative))).digest('hex')
}

function csv(relative) {
  const lines = read(relative).trim().split('\n')
  const columns = lines[0].split(',')
  return lines.slice(1).map((line) => {
    const values = line.split(',')
    return Object.fromEntries(columns.map((column, index) => [column, values[index]]))
  })
}

function close(actual, expected, tolerance = 1e-11) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`)
}

test('California Housing package has frozen provenance, schema, and split membership', () => {
  const manifest = json('public/datasets/tabular-regression/manifest.json')
  const rows = csv('public/datasets/tabular-regression/california-housing.csv')
  const expectedColumns = [
    'row_id',
    'MedInc',
    'HouseAge',
    'AveRooms',
    'AveBedrms',
    'Population',
    'AveOccup',
    'Latitude',
    'Longitude',
    'MedHouseVal',
    'split',
  ]

  assert.equal(manifest.contractVersion, 'tabular-regression-california-v1')
  assert.equal(manifest.source.archiveSha256, '8b18f0a01cf9c99a65174d18fa582aa31971dfe55a26ad794f3299937c3708d7')
  assert.match(manifest.source.licenseScopeNote, /not asserted as the dataset license/)
  assert.deepEqual(Object.keys(rows[0]), expectedColumns)
  assert.equal(rows.length, 20_640)
  assert.equal(new Set(rows.map((row) => row.row_id)).size, rows.length)
  assert.deepEqual(
    Object.fromEntries(
      ['train', 'validation', 'test'].map((split) => [split, rows.filter((row) => row.split === split).length]),
    ),
    { train: 12_384, validation: 4_128, test: 4_128 },
  )
  for (const row of rows) {
    for (const column of expectedColumns.slice(1, -1)) assert.equal(Number.isFinite(Number(row[column])), true)
  }
  assert.equal(manifest.file.sha256, sha256('public/datasets/tabular-regression/california-housing.csv'))
  assert.equal(manifest.file.bytes, statSync(path('public/datasets/tabular-regression/california-housing.csv')).size)
})

test('published residuals reproduce the one final test evaluation', () => {
  const summary = json('public/notebooks/tabular-regression/tabular-regression-summary.json')
  const residuals = csv('public/notebooks/tabular-regression/final-test-residuals.csv')
  assert.equal(summary.finalTestEvaluationCount, 1)
  assert.deepEqual(summary.finalRefitPartitions, ['train', 'validation'])
  assert.equal(summary.selectedModel, 'LinearRegression')
  assert.equal(summary.selectedAlpha, null)
  assert.equal(residuals.length, 4_128)

  const squared = residuals.map((row) => Number(row.residual) ** 2)
  const absolute = residuals.map((row) => Math.abs(Number(row.residual)))
  const actual = residuals.map((row) => Number(row.MedHouseVal))
  const prediction = residuals.map((row) => Number(row.prediction))
  const meanActual = actual.reduce((total, value) => total + value, 0) / actual.length
  const rmse = Math.sqrt(squared.reduce((total, value) => total + value, 0) / squared.length)
  const mae = absolute.reduce((total, value) => total + value, 0) / absolute.length
  const r2 = 1 - squared.reduce((total, value) => total + value, 0)
    / actual.reduce((total, value) => total + (value - meanActual) ** 2, 0)

  close(rmse, summary.finalTestMetrics.rmse)
  close(mae, summary.finalTestMetrics.mae)
  close(r2, summary.finalTestMetrics.r2)
  residuals.forEach((row, index) => {
    close(actual[index] - prediction[index], Number(row.residual))
    close(Math.abs(Number(row.residual)), Number(row.abs_error))
  })
})

test('validation selection stays isolated from final test results', () => {
  const summary = json('public/notebooks/tabular-regression/tabular-regression-summary.json')
  const metrics = csv('public/notebooks/tabular-regression/validation-metrics.csv')
  const interaction = json('public/tabular-regression/interactions/evaluation.json')

  assert.equal(metrics.length, 6)
  assert.deepEqual(metrics.slice(1).map((row) => Number(row.alpha)), [0.01, 0.1, 1, 10, 100])
  assert.equal(interaction.testLocked, true)
  assert.equal(interaction.selectedModel, summary.selectedModel)
  assert.equal(interaction.selectionThreshold, 0.01)
  assert.ok(interaction.relativeImprovement < interaction.selectionThreshold)
  assert.equal(JSON.stringify(interaction).includes('testMetrics'), false)
  assert.equal(JSON.stringify(interaction).includes('finalTestMetrics'), false)
})

test('interaction and figure manifests bind all six chapters to hashed local assets', () => {
  const interactionManifest = json('public/tabular-regression/interaction-manifest.json')
  const figureIndex = json('public/tabular-regression/figure-index.json')
  const chapters = [
    'csv-to-frame',
    'eda-first-pass',
    'cleaning-splits',
    'linear-baseline',
    'evaluation',
    'review-next-iteration',
  ]
  assert.deepEqual(Object.keys(interactionManifest.chapters).sort(), [...chapters].sort())
  for (const chapter of chapters) {
    const entry = interactionManifest.chapters[chapter]
    const relative = `public${entry.publicPath}`
    assert.equal(existsSync(path(relative)), true)
    assert.equal(sha256(relative), entry.sha256)
    const payload = json(relative)
    assert.equal(payload.chapterId, chapter)
    assert.equal(payload.sourceCellId, entry.sourceCellId)
  }
  assert.equal(figureIndex.figures.length, 7)
  for (const figure of figureIndex.figures) {
    assert.ok(chapters.includes(figure.chapterId))
    assert.equal(existsSync(path(`public${figure.publicPath}`)), true)
    assert.ok(figure.sourceCellId)
  }
})

test('both downloadable notebooks are executed and share the locked source cells', () => {
  for (const locale of ['zh-CN', 'en']) {
    const notebook = json(`public/notebooks/tabular-regression/california-housing-project.${locale}.ipynb`)
    assert.equal(notebook.metadata.mlAtlas.contractVersion, 'tabular-regression-california-v1')
    assert.equal(notebook.metadata.mlAtlas.locale, locale)
    const codeCells = notebook.cells.filter((cell) => cell.cell_type === 'code')
    assert.deepEqual(codeCells.map((cell) => cell.id), [
      'load-and-contract',
      'training-only-eda',
      'train-only-preprocessing',
      'linear-baseline',
      'ridge-validation-selection',
      'final-test-review',
    ])
    for (const cell of codeCells) {
      assert.ok(cell.execution_count > 0)
      assert.ok(cell.outputs.length > 0)
    }
  }
})

test('published manifests cover every output with valid hashes', () => {
  for (const [rootDir, manifestPath] of [
    ['public/notebooks/tabular-regression/', 'public/notebooks/tabular-regression/output-manifest.json'],
    ['public/tabular-regression/', 'public/tabular-regression/manifest.json'],
  ]) {
    const manifest = json(manifestPath)
    for (const entry of manifest.files) {
      const relative = `${rootDir}${entry.path}`
      assert.equal(existsSync(path(relative)), true)
      assert.equal(sha256(relative), entry.sha256)
      assert.equal(statSync(path(relative)).size, entry.bytes)
    }
  }
})
