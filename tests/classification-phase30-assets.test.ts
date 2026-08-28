import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if ((specifier.startsWith('.') || specifier.startsWith('/')) && !/\.[cm]?[jt]sx?$/.test(specifier)) return nextResolve(`${specifier}.ts`, context)
      throw error
    }
  },
})

const root = new URL('../', import.meta.url)
const publicRoot = new URL('public/', root)
const { loadClassificationStudyPackage, parseClassificationManifest } = await import('../src/modules/classification/assets.ts')

function readPublic(path: string) {
  return readFileSync(new URL(path.replace(/^\//, ''), publicRoot), 'utf8')
}

function hash(path: string) {
  return createHash('sha256').update(readPublic(path)).digest('hex')
}

function localFetch(path: string | URL | Request) {
  const url = String(path)
  const marker = '/ml-tutorial-site/'
  const publicPath = url.includes(marker) ? `/${url.split(marker)[1]}` : new URL(url, 'https://local.test').pathname
  const file = new URL(publicPath.replace(/^\//, ''), publicRoot)
  if (!existsSync(file)) return Promise.resolve(new Response('', { status: 404 }))
  return Promise.resolve(new Response(readFileSync(file), { status: 200 }))
}

test('Phase 30 manifest binds every local output and bilingual executed notebook', () => {
  const manifest = parseClassificationManifest(JSON.parse(readPublic('/classification/phase-30/manifest.json')))
  assert.equal(manifest.contractVersion, 'classification-phase-30-v1')
  assert.deepEqual(manifest.locales, ['zh-CN', 'en'])
  assert.deepEqual(manifest.policy, {
    selectionSplit: 'validation',
    finalEvaluationSplit: 'test',
    testEvaluations: 1,
    testReselectionAllowed: false,
    subgroupSplit: 'validation',
  })
  for (const file of [...Object.values(manifest.outputs), ...Object.values(manifest.notebooks)]) {
    assert.equal(hash(file.path), file.sha256, file.path)
  }
  for (const locale of ['zh-CN', 'en']) {
    const notebook = JSON.parse(readPublic(manifest.notebooks[locale].path))
    assert.equal(notebook.metadata.kernelspec.name, 'python3')
    const codeCell = notebook.cells.find((cell: { cell_type: string }) => cell.cell_type === 'code')
    assert.equal(codeCell.execution_count, 1)
    assert.ok(codeCell.outputs.length > 0)
    assert.doesNotMatch(JSON.stringify(notebook), /ml-atlas-phase30-kernel-|\/Users\//)
  }
})

test('Phase 30 loader supports GitHub Pages base path and validates the whole package', async () => {
  const study = await loadClassificationStudyPackage({ fetch: localFetch as typeof fetch, baseUrl: '/ml-tutorial-site/' })
  assert.equal(study.predictions.length, 206)
  assert.equal(study.thresholdSweep.points.length, 99)
  assert.equal(study.costSelection.selectedThreshold, 0.09)
  assert.equal(study.roc.thresholdSelectionAllowed, false)
  assert.equal(study.subgroupErrors.protectedAttributeAnalysis, false)
  assert.ok(study.subgroupErrors.namedErrors.some((row) => row.outcome === 'fp'))
  assert.ok(study.subgroupErrors.namedErrors.some((row) => row.outcome === 'fn'))
})

test('Phase 30 loader rejects hash drift and aborted requests', async () => {
  const manifestText = readPublic('/classification/phase-30/manifest.json')
  const manifest = JSON.parse(manifestText)
  const fetchWithDrift = async (path: string | URL | Request, init?: RequestInit) => {
    const response = await localFetch(path)
    if (String(path).includes('threshold-sweep.json')) return new Response(`${await response.text()} `, { status: 200 })
    return response
  }
  await assert.rejects(
    loadClassificationStudyPackage({ fetch: fetchWithDrift as typeof fetch }),
    (error: { reason?: string }) => error.reason === 'integrity-error',
  )

  const controller = new AbortController()
  controller.abort()
  await assert.rejects(
    loadClassificationStudyPackage({ fetch: localFetch as typeof fetch, signal: controller.signal }),
    (error: { reason?: string }) => error.reason === 'aborted',
  )
  assert.ok(manifestText.length > 0 && manifest.outputs.thresholdSweep.sha256)
})

test('Phase 30 publication excludes train and row-level test records', () => {
  const predictions = JSON.parse(readPublic('/classification/phase-30/outputs/validation-predictions.json'))
  assert.equal(predictions.length, 206)
  assert.ok(predictions.every((row: { split: string }) => row.split === 'validation'))
  const packageText = [
    '/classification/phase-30/outputs/threshold-sweep.json',
    '/classification/phase-30/outputs/roc.json',
    '/classification/phase-30/outputs/cost-selection.json',
    '/classification/phase-30/outputs/subgroup-errors.json',
  ].map(readPublic).join('\n')
  assert.doesNotMatch(packageText, /"split": "train"/)
  assert.doesNotMatch(packageText, /"split": "test"[\s\S]*"rowId"/)
})

test('Phase 30 source script locks the Phase 29 handoff and one-time test policy', () => {
  const source = readFileSync(new URL('scripts/classification/phase30_analysis.py', root), 'utf8')
  const builder = readFileSync(new URL('scripts/classification/build_phase30_assets.py', root), 'utf8')
  assert.match(source, /expected_handoff_hash/)
  assert.match(source, /expected_dataset_hash/)
  assert.match(source, /"testEvaluations": 1/)
  assert.match(source, /"reselectionAllowed": False/)
  assert.match(builder, /NotebookClient/)
  assert.match(builder, /TemporaryDirectory/)
})
