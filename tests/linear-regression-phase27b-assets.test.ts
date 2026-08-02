import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(import.meta.dirname, '..')
const packageRoot = resolve(root, 'public/linear-regression/phase-27a')
const interactionRoot = resolve(packageRoot, 'interactions')
const manifestPath = resolve(packageRoot, 'interaction-manifest.json')
const sceneIds = [
  'fit-line',
  'multivariate',
  'residual-loss',
  'training-motion',
  'polynomial',
  'model-limits',
  'overfitting',
  'regularization',
] as const

function json(path: string): any {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function closeTo(actual: number, expected: number, tolerance: number): void {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`)
}

function assertFiniteTree(value: unknown, path = '$'): void {
  if (typeof value === 'number') assert.ok(Number.isFinite(value), `${path} must be finite`)
  if (Array.isArray(value)) value.forEach((entry, index) => assertFiniteTree(entry, `${path}[${index}]`))
  else if (value && typeof value === 'object') {
    Object.entries(value).forEach(([key, entry]) => assertFiniteTree(entry, `${path}.${key}`))
  }
}

test('Phase 27B interaction manifest covers exactly eight hashed Pages-safe assets', () => {
  const manifest = json(manifestPath)
  assert.equal(manifest.contractVersion, 'linear-regression-phase-27b-interaction-manifest-v1')
  assert.equal(manifest.datasetSha256, 'e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f')
  assert.deepEqual(manifest.assets.map((asset: any) => asset.sceneId), sceneIds)
  for (const asset of manifest.assets) {
    const path = resolve(root, `public${asset.publicPath}`)
    assert.equal(existsSync(path), true, asset.sceneId)
    assert.equal(path, resolve(interactionRoot, `${asset.sceneId}.json`))
    assert.equal(statSync(path).size, asset.bytes)
    assert.equal(sha256(path), asset.sha256)
    assert.equal(withPublicBase(asset.publicPath, '/ML_tutorial_Site/'), `/ML_tutorial_Site${asset.publicPath}`)
    assert.match(asset.sourceCellId, /^[a-z][a-z0-9-]+$/)
    const payload = json(path)
    assert.equal(payload.contractVersion, 'linear-regression-phase-27b-interaction-v1')
    assert.equal(payload.sceneId, asset.sceneId)
    assert.equal(payload.sourceCellId, asset.sourceCellId)
    assertFiniteTree(payload)
  }
})

test('outlier lab publishes full train sufficient statistics and exact OLS baseline', () => {
  const asset = json(resolve(interactionRoot, 'residual-loss.json'))
  const stats = asset.statistics
  assert.equal(stats.n, 10_427)
  assert.ok(stats.sumYY > 0)
  const denominator = stats.n * stats.sumXX - stats.sumX ** 2
  const slope = (stats.n * stats.sumXY - stats.sumX * stats.sumY) / denominator
  const intercept = (stats.sumY - slope * stats.sumX) / stats.n
  const sse = stats.sumYY
    + stats.n * intercept ** 2
    + slope ** 2 * stats.sumXX
    + 2 * intercept * slope * stats.sumX
    - 2 * intercept * stats.sumY
    - 2 * slope * stats.sumXY
  closeTo(slope, asset.baseline.slope, 1e-10)
  closeTo(intercept, asset.baseline.intercept, 1e-10)
  closeTo(sse / stats.n, asset.baseline.mse, 1e-8)
  assert.equal(asset.points.every((point: any) => point.split === 'train' && point.instant <= 10_427), true)
})

test('split, feature and hourly diagnostics remain selection-only and leakage-free', () => {
  const multivariate = json(resolve(interactionRoot, 'multivariate.json'))
  assert.deepEqual(multivariate.partitions.map((part: any) => [part.id, part.start, part.end, part.rows]), [
    ['train', 0, 10_427, 10_427],
    ['validation', 10_427, 13_903, 3_476],
    ['test', 13_903, 17_379, 3_476],
  ])
  assert.deepEqual(multivariate.forbiddenFeatures, ['casual', 'registered', 'cnt'])
  const declaredFeatures = [...new Set(multivariate.stages.flatMap((stage: any) => stage.features))]
  for (const partition of ['train', 'validation', 'test']) {
    for (const row of multivariate.sampleRows[partition]) {
      for (const feature of declaredFeatures) {
        assert.equal(Object.hasOwn(row, feature), true, `${partition} sample must include ${feature}`)
      }
    }
  }
  for (const stage of multivariate.stages) {
    assert.equal(stage.features.some((feature: string) => multivariate.forbiddenFeatures.includes(feature)), false)
    assert.ok(stage.trainRmse > 0 && stage.validationRmse > 0)
  }

  const polynomial = json(resolve(interactionRoot, 'polynomial.json'))
  assert.deepEqual(polynomial.polynomialCurves.map((curve: any) => curve.degree), [1, 2, 3, 5, 8])
  assert.equal(polynomial.hourlyActual.length, 24)
  assert.equal(polynomial.stageHourlyPredictions.length, multivariate.stages.length)
  assert.equal(polynomial.stageHourlyPredictions.every((stage: any) => stage.points.length === 24), true)

  const overfitting = json(resolve(interactionRoot, 'overfitting.json'))
  assert.equal(overfitting.hourlyResiduals.length, 24)
  assert.equal(overfitting.namedCases.length, 4)
  assert.equal(overfitting.predictionSample.every((row: any) => row.hour >= 0 && row.hour <= 23), true)
})

test('gradient and regularization paths expose exact finite model outputs', () => {
  const training = json(resolve(interactionRoot, 'training-motion.json'))
  assert.deepEqual(training.traces.map((trace: any) => trace.learningRate), [0.01, 0.1, 0.5])
  assert.deepEqual(training.traces.map((trace: any) => trace.status), ['max-updates', 'converged', 'converged'])
  for (const trace of training.traces) {
    assert.equal(trace.points[0].update, 0)
    assert.ok(trace.points.at(-1).update > 0)
    assert.ok(trace.points.at(-1).mse < trace.points[0].mse)
    assertFiniteTree(trace.points)
  }

  const regularization = json(resolve(interactionRoot, 'regularization.json'))
  assert.ok(regularization.correlation > 0.98)
  assert.equal(regularization.paths.length, 50)
  assert.deepEqual([...new Set(regularization.paths.map((row: any) => row.model))], ['ridge', 'lasso'])
  assert.equal(Object.keys(regularization.ols.coefficients).includes('temp'), true)
  assert.equal(Object.keys(regularization.ols.coefficients).includes('atemp'), true)
  for (const row of regularization.paths) {
    assert.ok(row.alpha > 0 && row.validationRmse > 0)
    assert.deepEqual(Object.keys(row.coefficients), Object.keys(regularization.ols.coefficients))
  }
})

test('interaction assets are bound to executed notebook cells and atomic output inventory', () => {
  const manifest = json(manifestPath)
  const outputManifest = json(resolve(packageRoot, 'output-manifest.json'))
  const outputPaths = new Set(outputManifest.members.map((member: any) => member.relativePath))
  assert.equal(outputPaths.has('interaction-manifest.json'), true)
  for (const sceneId of sceneIds) assert.equal(outputPaths.has(`interactions/${sceneId}.json`), true)

  for (const locale of ['zh-CN', 'en']) {
    const notebook = json(resolve(packageRoot, `bike-linear-regression-course.${locale}.ipynb`))
    const cellIds = new Set(notebook.cells.map((cell: any) => cell.id))
    for (const asset of manifest.assets) assert.equal(cellIds.has(asset.sourceCellId), true, `${locale}: ${asset.sourceCellId}`)
  }
  const summary = json(resolve(packageRoot, 'linear-regression-course-summary.json'))
  assert.equal(summary.contractVersion, 'linear-regression-phase-27a-summary-v2')
  assert.equal(summary.downloads.interactionManifest, '/linear-regression/phase-27a/interaction-manifest.json')
  assert.deepEqual(summary.interactions.sceneIds, sceneIds)
})
