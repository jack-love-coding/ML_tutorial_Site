import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const root = resolve(import.meta.dirname, '..')
const packageRoot = resolve(root, 'public/gradient-descent/v1')
const readJson = (path: string) => JSON.parse(readFileSync(resolve(packageRoot, path), 'utf8'))
const sha256 = (path: string) => createHash('sha256').update(readFileSync(path)).digest('hex')

test('gradient-descent asset manifest binds every published file', () => {
  const manifest = readJson('output-manifest.json')
  assert.equal(manifest.schemaVersion, 1)
  assert.equal(manifest.generatedBy, 'scripts/gradient-descent/build-assets.py')
  assert.ok(manifest.files.length >= 13)
  for (const entry of manifest.files) {
    const path = resolve(root, 'public', entry.path)
    assert.equal(sha256(path), entry.sha256, entry.path)
    assert.equal(statSync(path).size, entry.bytes, entry.path)
  }
})

test('summary locks the shared five-row numerical authority', () => {
  const summary = readJson('gradient-descent-summary.json')
  assert.deepEqual(summary.anchor.predictions, [53, 59, 65, 71, 77])
  assert.deepEqual(summary.anchor.residuals, [-1, 0, 0, 1, 1])
  assert.equal(summary.anchor.mse, 0.6)
  assert.deepEqual(summary.anchor.gradient, { weight: -3.2, bias: -0.4 })
  assert.deepEqual(summary.oneUpdate.parameters, { weight: 6.064, bias: 47.008 })
  assert.ok(Math.abs(summary.oneUpdate.evaluation.mse - 0.440192) < 1e-12)
  assert.equal(summary.leastSquares.weight, 6.5)
  assert.equal(summary.leastSquares.bias, 45.7)
  assert.ok(Math.abs(summary.leastSquares.mse - 0.06) < 1e-12)
})

test('interaction manifest covers exactly six old chapter ids and notebook cells', () => {
  const manifest = readJson('interaction-manifest.json')
  const expected = [
    'loss-function', 'landscape', 'gradient-rule', 'learning-rate',
    'saddle-local-minima', 'noise-and-batch',
  ]
  assert.deepEqual(manifest.chapters.map((entry: { chapterId: string }) => entry.chapterId), expected)
  for (const entry of manifest.chapters) {
    const path = resolve(root, 'public', entry.path.replace(/^\//, ''))
    assert.equal(sha256(path), entry.sha256)
    const payload = JSON.parse(readFileSync(path, 'utf8'))
    assert.equal(payload.scene, entry.chapterId)
    assert.equal(payload.notebookCellId, entry.notebookCellId)
  }
})

test('batch interaction data uses real deterministic sample ids and keeps the final short batch', () => {
  const payload = readJson('interactions/noise-and-batch.json')
  assert.equal(payload.seed, 2801)
  assert.equal(payload.miniBatchSize, 2)
  const mini = payload.paths.find((path: { mode: string }) => path.mode === 'mini-batch')
  assert.deepEqual(mini.trajectory.updates.slice(0, 3).map((row: { sampleIds: string[] }) => row.sampleIds.length), [2, 2, 1])
  assert.equal(new Set(mini.trajectory.updates.slice(0, 3).flatMap((row: { sampleIds: string[] }) => row.sampleIds)).size, 5)
  assert.match(payload.bikeTrace.path, /^\/linear-regression\/phase-27a\//)
  assert.equal(payload.bikeTrace.preview.length, 96)
})

test('both notebooks are executed, bilingual, and bind all six cell ids', () => {
  const expectedCells = [
    'gd-load-data', 'gd-loss-anchor', 'gd-parameter-landscape', 'gd-one-update',
    'gd-learning-rate', 'gd-advanced-terrain', 'gd-real-batches',
  ]
  for (const locale of ['zh-CN', 'en']) {
    const notebook = readJson(`notebooks/gradient-descent-from-scratch.${locale}.ipynb`)
    assert.equal(notebook.metadata.course.locale, locale)
    const codeCells = notebook.cells.filter((cell: { cell_type: string }) => cell.cell_type === 'code')
    assert.deepEqual(codeCells.map((cell: { metadata: { cellId: string } }) => cell.metadata.cellId), expectedCells)
    assert.ok(codeCells.every((cell: { outputs: unknown[] }) => cell.outputs.length > 0))
    const text = JSON.stringify(notebook)
    assert.match(text, /MSE = 0\.600000/)
    assert.match(text, /new MSE = 0\.440192/)
    assert.doesNotMatch(text, /"output_type": "error"/)
  }
})

test('Pages installs the complete pinned Notebook drift-check environment', () => {
  const requirements = readFileSync(resolve(packageRoot, 'requirements.txt'), 'utf8')
  for (const dependency of ['numpy==', 'nbformat==', 'nbclient==', 'jupyter-client==', 'ipykernel==']) {
    assert.match(requirements, new RegExp(`^${dependency.replace('-', '\\-')}`, 'm'))
  }
  const workflow = readFileSync(resolve(root, '.github/workflows/deploy-pages.yml'), 'utf8')
  assert.match(workflow, /pip install --disable-pip-version-check -r public\/gradient-descent\/v1\/requirements\.txt/)
})

test('asset builder check mode reports no drift', () => {
  const result = spawnSync('python3', ['scripts/gradient-descent/build-assets.py', '--check'], {
    cwd: root,
    encoding: 'utf8',
  })
  assert.equal(result.status, 0, result.stderr)
  assert.match(result.stdout, /assets match notebooks, interactions, hashes, and numerical anchors/)
})
