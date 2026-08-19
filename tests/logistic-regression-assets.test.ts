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
