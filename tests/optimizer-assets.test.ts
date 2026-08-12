import assert from 'node:assert/strict'
import test from 'node:test'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(import.meta.dirname, '..')
const publicRoot = resolve(root, 'public')
const manifestPath = resolve(publicRoot, 'datasets/optimizer-comparison/benchmark-manifest.json')

test('optimizer assets are deterministic, hash-bound, and Pages-safe', () => {
  execFileSync(process.execPath, ['scripts/optimizer-comparison/build-assets.mjs', '--check'], { cwd: root, stdio: 'pipe' })
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  assert.deepEqual(manifest.model.shape, [2, 4, 1])
  assert.equal(manifest.model.activation, 'tanh')
  assert.deepEqual(manifest.optimizers, ['sgd', 'momentum', 'rmsprop', 'adam'])
  for (const path of Object.keys(manifest.files)) assert.match(withPublicBase(path, '/ML_tutorial_Site/')!, /^\/ML_tutorial_Site\//)
})

test('published trajectory CSV and JSON agree, while Banknote selection stays train/validation-only', () => {
  const payload = JSON.parse(readFileSync(resolve(publicRoot, 'notebooks/optimizer-comparison/optimizer-comparison-trajectories.json'), 'utf8'))
  const csv = readFileSync(resolve(publicRoot, 'notebooks/optimizer-comparison/optimizer-comparison-trajectories.csv'), 'utf8').trim().split('\n')
  const banknote = JSON.parse(readFileSync(resolve(publicRoot, 'datasets/optimizer-comparison/banknote-transfer.json'), 'utf8'))
  assert.equal(payload.rows.length, 164)
  assert.equal(csv.length - 1, payload.rows.length)
  assert.deepEqual(banknote.splitCounts, { train: 960, validation: 206, test: 206 })
  assert.equal(banknote.preprocessing.fitSplit, 'train')
  assert.equal(banknote.finalTestEvaluation.evaluatedInPr1, false)
})
