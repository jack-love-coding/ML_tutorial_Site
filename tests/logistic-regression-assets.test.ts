import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { resolve } from 'node:path'

const root = resolve(new URL('..', import.meta.url).pathname)
const packageRoot = resolve(root, 'public/logistic-regression/phase-29')
const batch4Notebook = resolve(root, 'public/notebooks/numerical-methods/batch-4-banknote.ipynb')

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

test('Phase 29 publishes an independent bilingual Banknote package rather than Batch 4 learner outputs', () => {
  assert.ok(existsSync(packageRoot), 'missing Phase 29 public asset package')
  const manifestPath = resolve(packageRoot, 'manifest.json')
  assert.ok(existsSync(manifestPath), 'missing Phase 29 manifest')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as Record<string, unknown>
  assert.equal(manifest.contractVersion, 'logistic-regression-phase-29-v1')
  assert.deepEqual(manifest.locales, ['zh-CN', 'en'])
  assert.notEqual(manifest.notebookPath, batch4Notebook, 'Batch 4 final-test Notebook cannot become learner output')
  assert.equal(manifest.atomicPublication, true)
  assert.equal(manifest.rollbackOnFailure, true)
  assert.equal(manifest.rejectAssetDrift, true)
})

test('Phase 29 asset manifest binds hashes and source cells for notebook, figures, and the frozen handoff', () => {
  const manifestPath = resolve(packageRoot, 'manifest.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8')) as {
    assets: readonly { path: string; sha256: string; sourceCellId: string }[]
    predictionHandoff: { csv: string; json: string; sha256: Record<string, string>; fields: readonly string[] }
  }
  assert.ok(manifest.assets.length > 0)
  for (const asset of manifest.assets) {
    const absolutePath = resolve(packageRoot, asset.path)
    assert.match(asset.sha256, /^[a-f0-9]{64}$/)
    assert.match(asset.sourceCellId, /^phase29-/)
    assert.equal(sha256(absolutePath), asset.sha256, `${asset.path} hash`)
  }
  assert.deepEqual(manifest.predictionHandoff.fields, [
    'row_id', 'split', 'label', 'logit', 'probability', 'feature_contract_version', 'model_hash', 'config_hash',
  ])
  assert.ok(manifest.predictionHandoff.csv.startsWith('/logistic-regression/phase-29/'))
  assert.ok(manifest.predictionHandoff.json.startsWith('/logistic-regression/phase-29/'))
})

test('Phase 29 learner assets exclude reserved test records and retain a clean-kernel output declaration', () => {
  const manifest = JSON.parse(readFileSync(resolve(packageRoot, 'manifest.json'), 'utf8')) as Record<string, unknown>
  assert.equal(manifest.cleanKernelVerified, true)
  assert.equal(manifest.learnerFacingTestRecords, false)
  assert.equal(manifest.testLabelsDisclosed, false)
  assert.equal(manifest.testMetricsDisclosed, false)
})

test('Phase 29 manifest fixes the numerical contract and does not leak the held-out partition into scenes', () => {
  const manifest = JSON.parse(readFileSync(resolve(packageRoot, 'manifest.json'), 'utf8')) as {
    assets: readonly { path: string; sceneId: string }[]
    analysis: { parity: { scratch: Record<string, unknown>; sklearn: { constructor: Record<string, unknown> }; acceptance: Record<string, number> }; finiteDifference: { acceptance: { observed: number; maxComponentErrorLimit: number } } }
    fileHashes: Record<string, string>
  }
  assert.equal(manifest.analysis.parity.scratch.initialStep, 32)
  assert.equal(manifest.analysis.parity.scratch.maxIterations, 100000)
  assert.equal(manifest.analysis.parity.sklearn.constructor.C, 'infinity')
  assert.equal(manifest.analysis.parity.sklearn.constructor.tol, 1e-12)
  assert.equal(manifest.analysis.parity.acceptance.coefficientAndInterceptLimit, 2e-4)
  assert.equal(manifest.analysis.parity.acceptance.validationProbabilityLimit, 1e-6)
  assert.equal(manifest.analysis.finiteDifference.acceptance.maxComponentErrorLimit, 2e-9)
  assert.ok(manifest.analysis.finiteDifference.acceptance.observed <= 2e-9)
  for (const [relativePath, hash] of Object.entries(manifest.fileHashes)) {
    assert.equal(sha256(resolve(packageRoot, relativePath)), hash, `${relativePath} package hash`)
  }
  for (const asset of manifest.assets) {
    const payload = readFileSync(resolve(packageRoot, asset.path), 'utf8')
    assert.doesNotMatch(payload, /"split":\s*"test"/)
    assert.match(payload, new RegExp(`"sceneId":\\s*"${asset.sceneId}"`))
  }
})

test('Phase 29 bilingual notebooks retain identical code-cell ordering while localizing prose', () => {
  const readNotebook = (locale: string) => JSON.parse(readFileSync(resolve(packageRoot, `banknote-logistic-regression.${locale}.ipynb`), 'utf8')) as { cells: { cell_type: string; source: string | string[] }[] }
  const zh = readNotebook('zh-CN')
  const en = readNotebook('en')
  const code = (notebook: typeof zh) => notebook.cells.filter((cell) => cell.cell_type === 'code').map((cell) => Array.isArray(cell.source) ? cell.source.join('') : cell.source)
  assert.deepEqual(code(zh), code(en))
  assert.notDeepEqual(zh.cells[0]?.source, en.cells[0]?.source)
})

test('Phase 29 publishes bounded replay traces while recording the complete accepted-state count', () => {
  const regularization = JSON.parse(readFileSync(resolve(packageRoot, 'interactions/regularization.json'), 'utf8')) as {
    data: { scratch: { trace: readonly unknown[]; traceSampling: { acceptedStates: number; publishedStates: number } } }
  }
  const csvRows = readFileSync(resolve(packageRoot, 'outputs/training-trace.csv'), 'utf8').trim().split('\n')
  assert.ok(regularization.data.scratch.trace.length <= 800)
  assert.equal(regularization.data.scratch.trace.length, regularization.data.scratch.traceSampling.publishedStates)
  assert.ok(regularization.data.scratch.traceSampling.acceptedStates > regularization.data.scratch.trace.length)
  assert.ok(csvRows.length <= 801)
})
