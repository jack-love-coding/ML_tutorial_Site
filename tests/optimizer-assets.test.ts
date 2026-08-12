import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve } from 'node:path'
import { assertOptimizerBenchmarkManifest } from '../src/types/optimizer.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(import.meta.dirname, '..')
const publicRoot = resolve(root, 'public')
const manifestPath = resolve(publicRoot, 'datasets/optimizer-comparison/benchmark-manifest.json')

test('optimizer assets are deterministic, hash-bound, and Pages-safe', () => {
  execFileSync(process.execPath, ['scripts/optimizer-comparison/build-assets.mjs', '--check'], { cwd: root, stdio: 'pipe' })
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  const notebook = JSON.parse(readFileSync(resolve(publicRoot, 'notebooks/optimizer-comparison/optimizer-comparison.zh-CN.ipynb'), 'utf8'))
  assertOptimizerBenchmarkManifest(manifest)
  assert.deepEqual(manifest.model.shape, [2, 4, 1])
  assert.equal(manifest.model.activation, 'tanh')
  assert.match(manifest.model.initialization.algorithm, /fixed-sine/)
  assert.equal(manifest.benchmarks.length, 2)
  assert.deepEqual(manifest.benchmarks.map((benchmark: { id: string }) => benchmark.id), [
    'circle-2-4-1-tanh-first-step-norm-matched',
    'circle-2-4-1-tanh-predeclared-practical',
  ])
  for (const benchmark of manifest.benchmarks) {
    assert.equal(benchmark.updates, 40)
    assert.deepEqual(benchmark.optimizers.map((optimizer: { kind: string }) => optimizer.kind), ['sgd', 'momentum', 'rmsprop', 'adam'])
  }
  const matched = Object.values(manifest.benchmarks[0].firstStepUpdateNorms) as number[]
  assert.ok(Math.max(...matched) - Math.min(...matched) < 1e-10)
  const executedCodeCells = notebook.cells.filter((cell: { cell_type: string }) => cell.cell_type === 'code')
  assert.ok(executedCodeCells.length >= 2)
  assert.ok(executedCodeCells.every((cell: { execution_count: number | null; outputs: unknown[] }) => Number.isInteger(cell.execution_count) && cell.outputs.length > 0))
  for (const path of Object.keys(manifest.files)) assert.match(withPublicBase(path, '/ML_tutorial_Site/')!, /^\/ML_tutorial_Site\//)
})

test('published trajectory CSV and JSON agree, while Banknote evaluation is frozen and test is recorded exactly once', () => {
  const payload = JSON.parse(readFileSync(resolve(publicRoot, 'notebooks/optimizer-comparison/optimizer-comparison-trajectories.json'), 'utf8'))
  const csv = readFileSync(resolve(publicRoot, 'notebooks/optimizer-comparison/optimizer-comparison-trajectories.csv'), 'utf8').trim().split('\n')
  const banknote = JSON.parse(readFileSync(resolve(publicRoot, 'datasets/optimizer-comparison/banknote-transfer.json'), 'utf8'))
  assert.equal(payload.rows.length, 328)
  assert.equal(csv.length - 1, payload.rows.length)
  assert.equal(payload.rows.filter((row: { update: number }) => row.update === 40).length, 8)
  assert.deepEqual(banknote.splitCounts, { train: 960, validation: 206, test: 206 })
  assert.equal(banknote.preprocessing.fitSplit, 'train')
  assert.equal(banknote.validationEvaluation.metrics.examples, 206)
  assert.equal(banknote.finalTestEvaluation.metrics.examples, 206)
  assert.equal(banknote.finalTestEvaluation.evaluationCount, 1)
  assert.equal(banknote.finalTestEvaluation.selectionUsedTest, false)
})

test('asset check rejects a Banknote source fixture whose hash, split contract, and train statistics drift', () => {
  const fixture = resolve(mkdtempSync(resolve(tmpdir(), 'optimizer-banknote-drift-')), 'banknote.csv')
  writeFileSync(fixture, `${readFileSync(resolve(publicRoot, 'datasets/numerical-methods/banknote-authentication.csv'), 'utf8')}\n`)
  assert.throws(() => execFileSync(process.execPath, [
    'scripts/optimizer-comparison/build-assets.mjs',
    '--check',
    `--banknote-source=${fixture}`,
  ], { cwd: root, stdio: 'pipe' }), /Banknote evaluation artifact drift/)
})

test('asset check rejects even hash-masked Banknote metric and parameter drift', () => {
  const original = JSON.parse(readFileSync(resolve(publicRoot, 'datasets/optimizer-comparison/banknote-transfer.json'), 'utf8'))
  const directory = mkdtempSync(resolve(tmpdir(), 'optimizer-banknote-artifact-'))
  for (const [name, mutate] of Object.entries({
    metric: (value: typeof original) => { value.validationEvaluation.metrics.accuracy -= 0.01 },
    parameters: (value: typeof original) => { value.training.parametersAfterTraining[0] += 0.01 },
  })) {
    const fixture = resolve(directory, `${name}.json`)
    const mutated = structuredClone(original)
    mutate(mutated)
    writeFileSync(fixture, `${JSON.stringify(mutated, null, 2)}\n`)
    assert.throws(() => execFileSync(process.execPath, [
      'scripts/optimizer-comparison/build-assets.mjs', '--check', `--banknote-artifact=${fixture}`,
    ], { cwd: root, stdio: 'pipe' }), /Banknote evaluation artifact drift/)
  }
})
