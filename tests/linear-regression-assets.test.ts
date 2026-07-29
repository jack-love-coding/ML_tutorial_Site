import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(import.meta.dirname, '..')
const publicRoot = resolve(root, 'public')
const packageRoot = resolve(publicRoot, 'notebooks/linear-regression')

const expectedAssetIds = [
  'bike-linear-regression-notebook-zh-CN',
  'bike-linear-regression-notebook-en',
  'linear-regression-summary',
  'linear-regression-gradient-descent-trace',
  'linear-regression-coefficients',
  'linear-regression-heldout-residuals',
  'linear-regression-requirements',
  'linear-regression-environment',
  'linear-regression-output-manifest',
] as const

const expectedPublicPaths = [
  '/notebooks/linear-regression/bike-linear-regression.zh-CN.ipynb',
  '/notebooks/linear-regression/bike-linear-regression.en.ipynb',
  '/notebooks/linear-regression/linear-regression-summary.json',
  '/notebooks/linear-regression/gradient-descent-trace.csv',
  '/notebooks/linear-regression/coefficients.csv',
  '/notebooks/linear-regression/heldout-residuals.csv',
  '/notebooks/linear-regression/requirements.txt',
  '/notebooks/linear-regression/environment.json',
  '/notebooks/linear-regression/output-manifest.json',
] as const

const expectedChapterIds = [
  'fit-line',
  'multivariate',
  'residual-loss',
  'training-motion',
  'polynomial',
  'model-limits',
  'overfitting',
  'regularization',
] as const

const expectedFeatureOrder = [
  'temp',
  'hum',
  'windspeed',
  'workingday',
  'hr',
] as const

const expectedTeachingRows = [
  {
    instant: 11_550,
    partition: 'train',
    role: 'representative-training-row',
    rule: 'inclusive training cnt IQR, minimum absolute base-OLS residual, lowest instant tie-break',
  },
  {
    instant: 17_213,
    partition: 'held-out',
    role: 'negative-prediction',
    rule: 'minimum raw-count prediction, lowest instant tie-break',
  },
  {
    instant: 15_628,
    partition: 'held-out',
    role: 'morning-peak-underprediction',
    rule: 'hr 7-9, maximum positive actual - prediction, lowest instant tie-break',
  },
  {
    instant: 14_965,
    partition: 'held-out',
    role: 'evening-peak-underprediction',
    rule: 'hr 16-19, maximum positive actual - prediction, lowest instant tie-break',
  },
  {
    instant: 15_604,
    partition: 'held-out',
    role: 'large-residual',
    rule: 'exclude prior named rows, maximum absolute residual, lowest instant tie-break',
  },
] as const

const manifestPath = resolve(packageRoot, 'output-manifest.json')
const summaryPath = resolve(packageRoot, 'linear-regression-summary.json')
const tracePath = resolve(packageRoot, 'gradient-descent-trace.csv')
const coefficientsPath = resolve(packageRoot, 'coefficients.csv')
const residualsPath = resolve(packageRoot, 'heldout-residuals.csv')

function readJson(path: string): Record<string, any> {
  return JSON.parse(readFileSync(path, 'utf8'))
}

function clone<T>(value: T): T {
  return structuredClone(value)
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

async function runtimeAssets(): Promise<Record<string, any>> {
  return import('../src/data/linearRegressionAssets.ts')
}

function assertDeepFrozen(value: unknown, path = '$'): void {
  if (typeof value !== 'object' || value === null) return
  assert.equal(Object.isFrozen(value), true, `${path} must be frozen`)
  for (const [key, entry] of Object.entries(value)) {
    assertDeepFrozen(entry, `${path}.${key}`)
  }
}

test('linear-regression public inventory scaffold locks exact nine local members and manifest existence', () => {
  assert.equal(existsSync(manifestPath), true)
  const manifest = readJson(manifestPath)

  assert.equal(manifest.contractVersion, 'linear-regression-phase-27-candidate-v1')
  assert.equal(manifest.packageComplete, true)
  assert.equal(manifest.inventory.length, 9)
  assert.deepEqual(
    manifest.inventory.map(({ path }: { path: string }) => `/${path}`),
    expectedPublicPaths,
  )

  for (const [index, entry] of manifest.inventory.entries()) {
    const publicPath = expectedPublicPaths[index]
    assert.equal(entry.path, publicPath.slice(1))
    assert.doesNotMatch(publicPath, /^(?:https?:|file:)|\/\/|\/Users\//)
    const diskPath = resolve(publicRoot, entry.path)
    assert.equal(existsSync(diskPath), true, entry.path)
    if (entry.selfHashExcluded === true) {
      assert.equal(entry.bytes, null)
      assert.equal(entry.sha256, null)
    } else {
      assert.equal(statSync(diskPath).size, entry.bytes, entry.path)
      assert.equal(sha256(diskPath), entry.sha256, entry.path)
    }
  }
})

test('linear-regression base path resolves every public member for root and GitHub Pages', () => {
  for (const publicPath of expectedPublicPaths) {
    assert.equal(withPublicBase(publicPath, '/'), publicPath)
    assert.equal(
      withPublicBase(publicPath, '/ML_tutorial_Site/'),
      `/ML_tutorial_Site${publicPath}`,
    )
    assert.equal(existsSync(resolve(publicRoot, publicPath.slice(1))), true)
  }
})

test('typed registry exactly mirrors the manifest and paired notebook parity proof', async () => {
  const assets = await runtimeAssets()
  const manifest = readJson(manifestPath)

  assert.deepEqual(assets.linearRegressionAssetIds, expectedAssetIds)
  assert.deepEqual(
    assets.linearRegressionAssets.map(({ id }: { id: string }) => id),
    expectedAssetIds,
  )
  assert.deepEqual(
    assets.linearRegressionAssets.map(({ publicPath }: { publicPath: string }) => publicPath),
    expectedPublicPaths,
  )
  assert.deepEqual(
    assets.linearRegressionAssets.map(({ manifestRole }: { manifestRole: string }) =>
      manifestRole),
    manifest.inventory.map(({ role }: { role: string }) => role),
  )

  for (const asset of assets.linearRegressionAssets) {
    assert.match(asset.publicPath, /^\/notebooks\/linear-regression\//)
    assert.doesNotMatch(asset.publicPath, /^(?:https?:|file:)|\/\/|\/Users\//)
    assert.equal(existsSync(resolve(publicRoot, asset.publicPath.slice(1))), true)
    assert.strictEqual(assets.getLinearRegressionAsset(asset.id), asset)
  }
  assert.throws(
    () => assets.getLinearRegressionAsset('unknown-linear-regression-asset'),
    /asset id/i,
  )

  const notebooks = assets.linearRegressionAssets.filter(
    ({ kind }: { kind: string }) => kind === 'executed-notebook',
  )
  assert.deepEqual(notebooks.map(({ locale }: { locale: string }) => locale), ['zh-CN', 'en'])
  assert.equal(new Set(notebooks.map(({ topicId }: { topicId: string }) => topicId)).size, 1)
  assert.equal(new Set(notebooks.map(({ bundleId }: { bundleId: string }) => bundleId)).size, 1)
  assert.equal(manifest.executionProofs.length, 2)
  assert.equal(
    new Set(manifest.executionProofs.map(({ codeSha256 }: { codeSha256: string }) =>
      codeSha256)).size,
    1,
  )
  assert.equal(
    new Set(manifest.executionProofs.map(
      ({ normalizedOutputSha256 }: { normalizedOutputSha256: string }) =>
        normalizedOutputSha256,
    )).size,
    1,
  )
})

test('chapter bindings use only preserved chapters and registered semantic outputs and downloads', async () => {
  const assets = await runtimeAssets()
  assert.deepEqual(Object.keys(assets.linearRegressionChapterAssets), expectedChapterIds)

  const registered = new Set(assets.linearRegressionAssetIds)
  const exposedOutputs = new Set<string>()
  const exposedAssets = new Set<string>()
  for (const chapterId of expectedChapterIds) {
    const binding = assets.linearRegressionChapterAssets[chapterId]
    assert.equal(binding.summaryAssetId, 'linear-regression-summary')
    assert.ok(binding.outputIds.length > 0)
    assert.ok(binding.assetIds.length > 0)
    for (const outputId of binding.outputIds) exposedOutputs.add(outputId)
    for (const assetId of binding.assetIds) {
      assert.equal(registered.has(assetId), true, `${chapterId}: ${assetId}`)
      exposedAssets.add(assetId)
    }
  }

  for (const outputId of [
    'representative-training-row',
    'method-comparison',
    'coefficient-table',
    'heldout-diagnostics',
    'named-cases',
  ]) {
    assert.equal(exposedOutputs.has(outputId), true, outputId)
  }
  for (const assetId of [
    'linear-regression-gradient-descent-trace',
    'linear-regression-coefficients',
    'linear-regression-heldout-residuals',
    'bike-linear-regression-notebook-zh-CN',
    'bike-linear-regression-notebook-en',
  ]) {
    assert.equal(exposedAssets.has(assetId), true, assetId)
  }
})

test('strict summary parser accepts the published generation and returns detached readonly data', async () => {
  const assets = await runtimeAssets()
  const source = readJson(summaryPath)
  const parsed = assets.parseLinearRegressionSummary(source)

  assert.notStrictEqual(parsed, source)
  assert.notStrictEqual(parsed.features, source.features)
  assert.notStrictEqual(parsed.diagnostics.namedCases, source.diagnostics.namedCases)
  assert.deepEqual(parsed.features.order, expectedFeatureOrder)
  assert.equal(parsed.source.sha256, 'e03de4ee4ef4dc376ac6e04bf829673c6269e8eba5c60fa121640fa2f829504f')
  assert.equal(parsed.split.trainRows, 13_903)
  assert.equal(parsed.split.testRows, 3_476)
  assert.equal(parsed.representativeTrainingRow.instant, 11_550)
  assert.deepEqual(
    parsed.diagnostics.namedCases.map(({ instant }: { instant: number }) => instant),
    [17_213, 15_628, 14_965, 15_604],
  )
  assertDeepFrozen(parsed)

  source.features.order.reverse()
  source.diagnostics.namedCases[0].instant = 1
  assert.deepEqual(parsed.features.order, expectedFeatureOrder)
  assert.equal(parsed.diagnostics.namedCases[0].instant, 17_213)
  assert.throws(
    () => {
      parsed.diagnostics.namedCases.push({})
    },
    /read only|extensible|object is not extensible/i,
  )
})

test('strict summary parser rejects missing extra stale non-finite wrong-order and tolerance drift', async () => {
  const assets = await runtimeAssets()
  const published = readJson(summaryPath)
  const cases: Array<[string, (value: Record<string, any>) => void, RegExp]> = [
    ['missing root key', (value) => { delete value.source }, /keys|source/],
    ['extra root key', (value) => { value.unknown = true }, /keys|unknown/],
    ['wrong version', (value) => { value.contractVersion = 'stale' }, /contractVersion/],
    ['wrong source path', (value) => { value.source.path = 'remote.csv' }, /source\.path/],
    ['wrong source hash', (value) => { value.source.sha256 = '0'.repeat(64) }, /source\.sha256/],
    ['wrong source rows', (value) => { value.source.rows = 1 }, /source\.rows/],
    ['wrong target', (value) => { value.source.target = 'registered' }, /source\.target/],
    ['wrong feature order', (value) => { value.features.order.reverse() }, /features\.order/],
    ['extra leakage feature', (value) => { value.features.order.push('casual') }, /features\.order/],
    ['wrong continuous order', (value) => { value.features.continuous.reverse() }, /features\.continuous/],
    ['workingday scaled', (value) => {
      value.preprocessing.standardized.push('workingday')
      value.preprocessing.unscaled = []
    }, /preprocessing\.(standardized|unscaled)/],
    ['wrong split rows', (value) => { value.split.trainRows = 13_902 }, /split\.trainRows/],
    ['wrong split boundary', (value) => { value.split.testStart.instant = 13_905 }, /split\.testStart/],
    ['wrong residual sign', (value) => {
      value.diagnostics.residualSign = 'actual - prediction'
    }, /residualSign/],
    ['wrong method tolerance', (value) => { value.methods.tolerance = 1e-3 }, /tolerance/],
    ['agreement tolerance drift', (value) => {
      value.methods.agreement.maxCoefficientDelta = 2e-6
    }, /maxCoefficientDelta|tolerance/],
    ['unknown method', (value) => {
      value.methods.agreement.byMethod.unknown = value.methods.agreement.byMethod.numpyLstsq
    }, /byMethod|keys/],
    ['unknown optimization status', (value) => {
      value.optimization.result.reason = 'maybe-converged'
    }, /optimization\.result\.reason/],
    ['non-finite scalar', (value) => {
      value.metrics.test.mse = Number.POSITIVE_INFINITY
    }, /finite/],
    ['wrong representative instant', (value) => {
      value.representativeTrainingRow.instant = 11_551
    }, /representativeTrainingRow\.instant/],
    ['wrong named-case order', (value) => {
      value.diagnostics.namedCases.reverse()
    }, /namedCases/],
    ['wrong named-case role', (value) => {
      value.diagnostics.namedCases[0].role = 'unknown-case'
    }, /namedCases\[0\]\.role/],
    ['wrong staged diagnostic order', (value) => {
      value.diagnostics.stagedOrder.reverse()
    }, /stagedOrder/],
    ['oversized hourly array', (value) => {
      value.diagnostics.hourlyResiduals.push(clone(value.diagnostics.hourlyResiduals[0]))
    }, /hourlyResiduals/],
    ['malformed hour order', (value) => {
      value.diagnostics.hourlyResiduals[2].hour = 7
    }, /hourlyResiduals\[2\]\.hour/],
    ['oversized prediction bins', (value) => {
      value.diagnostics.predictionBins.push(clone(value.diagnostics.predictionBins[0]))
    }, /predictionBins/],
    ['malformed bin rows', (value) => {
      value.diagnostics.predictionBins[0].rows = 868
    }, /predictionBins\[0\]\.rows|testRows/],
    ['inconsistent representative residual', (value) => {
      value.representativeTrainingRow.residual += 1
    }, /representativeTrainingRow\.residual/],
    ['inconsistent named residual', (value) => {
      value.diagnostics.namedCases[0].residual += 1
    }, /namedCases\[0\]\.residual/],
  ]

  for (const [name, mutate, expected] of cases) {
    const corrupted = clone(published)
    mutate(corrupted)
    assert.throws(
      () => assets.parseLinearRegressionSummary(corrupted),
      expected,
      name,
    )
  }
})

test('manifest validator freezes exact inventory hashes parity and deterministic selection metadata', async () => {
  const assets = await runtimeAssets()
  const source = readJson(manifestPath)
  const parsed = assets.validateLinearRegressionManifestContract(source)

  assert.notStrictEqual(parsed, source)
  assertDeepFrozen(parsed)
  assert.deepEqual(parsed.resolvedInstants, [11_550, 17_213, 15_628, 14_965, 15_604])
  assert.deepEqual(parsed.teachingRows, expectedTeachingRows)
  assert.deepEqual(
    parsed.inventory.map(({ path }: { path: string }) => `/${path}`),
    expectedPublicPaths,
  )
})

test('manifest validator rejects cross-generation inventory parity hash and selection drift', async () => {
  const assets = await runtimeAssets()
  const published = readJson(manifestPath)
  const cases: Array<[string, (value: Record<string, any>) => void, RegExp]> = [
    ['missing inventory member', (value) => { value.inventory.pop() }, /inventory/],
    ['extra inventory member', (value) => {
      value.inventory.push({ path: 'notebooks/linear-regression/extra.txt' })
    }, /inventory/],
    ['wrong member path', (value) => { value.inventory[0].path = 'remote.ipynb' }, /inventory\[0\]\.path/],
    ['wrong member hash', (value) => { value.inventory[0].sha256 = '0'.repeat(64) }, /inventory\[0\]\.sha256/],
    ['wrong manifest source hash', (value) => { value.source.sha256 = '0'.repeat(64) }, /source\.sha256/],
    ['wrong manifest feature order', (value) => { value.contract.features.order.reverse() }, /features\.order/],
    ['wrong manifest split', (value) => { value.contract.split.index = 1 }, /split\.index/],
    ['wrong manifest tolerance', (value) => { value.contract.methodTolerance = 1e-3 }, /methodTolerance/],
    ['wrong code parity', (value) => {
      value.executionProofs[1].codeSha256 = '0'.repeat(64)
    }, /executionProofs|codeSha256/],
    ['wrong output parity', (value) => {
      value.localeParity.normalizedOutputSha256 = '0'.repeat(64)
    }, /localeParity|normalizedOutputSha256/],
    ['wrong resolved order', (value) => { value.resolvedInstants.reverse() }, /resolvedInstants/],
    ['wrong selection version', (value) => { value.selectionRuleVersion = 'stale' }, /selectionRuleVersion/],
    ['wrong representative partition', (value) => {
      value.teachingRows[0].partition = 'held-out'
    }, /teachingRows\[0\]\.partition/],
    ['wrong named instant', (value) => { value.teachingRows[2].instant = 1 }, /teachingRows\[2\]\.instant/],
    ['wrong selection rule', (value) => {
      value.teachingRows[4].rule = 'maximum residual, highest instant'
    }, /teachingRows\[4\]\.rule/],
    ['extra manifest key', (value) => { value.repaired = true }, /keys|repaired/],
  ]

  for (const [name, mutate, expected] of cases) {
    const corrupted = clone(published)
    mutate(corrupted)
    assert.throws(
      () => assets.validateLinearRegressionManifestContract(corrupted),
      expected,
      name,
    )
  }
})

test('strict CSV parsers accept complete published trace coefficients and held-out residuals', async () => {
  const assets = await runtimeAssets()
  const trace = assets.parseLinearRegressionOutput(
    'linear-regression-gradient-descent-trace',
    readFileSync(tracePath, 'utf8'),
  )
  const coefficients = assets.parseLinearRegressionOutput(
    'linear-regression-coefficients',
    readFileSync(coefficientsPath, 'utf8'),
  )
  const residuals = assets.parseLinearRegressionOutput(
    'linear-regression-heldout-residuals',
    readFileSync(residualsPath, 'utf8'),
  )

  assert.equal(trace.length, 773)
  assert.equal(trace[0].update, 0)
  assert.equal(trace.at(-1).update, 772)
  assert.equal(coefficients.length, 24)
  assert.equal(residuals.length, 3_476)
  assert.equal(residuals[0].instant, 13_904)
  assert.equal(residuals.at(-1).instant, 17_379)
  assertDeepFrozen(trace)
  assertDeepFrozen(coefficients)
  assertDeepFrozen(residuals)
})

test('strict CSV parsers reject malformed extra missing non-finite wrong-order and inconsistent rows', async () => {
  const assets = await runtimeAssets()
  const trace = readFileSync(tracePath, 'utf8').trimEnd().split('\n')
  const coefficients = readFileSync(coefficientsPath, 'utf8').trimEnd().split('\n')
  const residuals = readFileSync(residualsPath, 'utf8').trimEnd().split('\n')
  const corruptions: Array<[string, string, string, RegExp]> = [
    ['trace header', 'linear-regression-gradient-descent-trace', ['bad', ...trace.slice(1)].join('\n'), /header/],
    ['trace missing row', 'linear-regression-gradient-descent-trace', trace.slice(0, -1).join('\n'), /773|rows/],
    ['trace extra row', 'linear-regression-gradient-descent-trace', [...trace, trace.at(-1)!].join('\n'), /773|rows/],
    ['trace non-finite', 'linear-regression-gradient-descent-trace', trace.map((line, index) =>
      index === 1 ? line.replace(',58370.935337696901,', ',NaN,') : line).join('\n'), /finite/],
    ['trace wrong order', 'linear-regression-gradient-descent-trace', trace.map((line, index) =>
      index === 2 ? line.replace(/^1,/, '9,') : line).join('\n'), /update/],
    ['coefficient header', 'linear-regression-coefficients', ['bad', ...coefficients.slice(1)].join('\n'), /header/],
    ['coefficient missing row', 'linear-regression-coefficients', coefficients.slice(0, -1).join('\n'), /24|rows/],
    ['coefficient extra field', 'linear-regression-coefficients', coefficients.map((line, index) =>
      index === 1 ? `${line},extra` : line).join('\n'), /columns|shape/],
    ['coefficient unknown method', 'linear-regression-coefficients', coefficients.map((line, index) =>
      index === 1 ? line.replace('numpy-batch-gradient-descent', 'unknown') : line).join('\n'), /method|order/],
    ['coefficient non-finite', 'linear-regression-coefficients', coefficients.map((line, index) =>
      index === 1 ? line.replace(/,[^,]+$/, ',Infinity') : line).join('\n'), /finite/],
    ['residual header', 'linear-regression-heldout-residuals', ['bad', ...residuals.slice(1)].join('\n'), /header/],
    ['residual missing row', 'linear-regression-heldout-residuals', residuals.slice(0, -1).join('\n'), /3476|rows/],
    ['residual wrong order', 'linear-regression-heldout-residuals', residuals.map((line, index) =>
      index === 2 ? line.replace(/^13904,/, '13999,') : line).join('\n'), /instant/],
    ['residual non-finite', 'linear-regression-heldout-residuals', residuals.map((line, index) =>
      index === 1 ? line.replace(/,[^,]+$/, ',NaN') : line).join('\n'), /finite/],
    ['residual arithmetic', 'linear-regression-heldout-residuals', residuals.map((line, index) =>
      index === 1 ? line.replace(/,[^,]+$/, ',0') : line).join('\n'), /residual/],
  ]

  for (const [name, outputId, source, expected] of corruptions) {
    assert.throws(
      () => assets.parseLinearRegressionOutput(outputId, `${source}\n`),
      expected,
      name,
    )
  }
})

test('output dispatch accepts only registered JSON and CSV output IDs', async () => {
  const assets = await runtimeAssets()
  assert.equal(
    assets.parseLinearRegressionOutput(
      'linear-regression-summary',
      readJson(summaryPath),
    ).contractVersion,
    'linear-regression-phase-27-summary-v1',
  )
  assert.equal(
    assets.parseLinearRegressionOutput(
      'linear-regression-output-manifest',
      readJson(manifestPath),
    ).contractVersion,
    'linear-regression-phase-27-candidate-v1',
  )
  for (const outputId of [
    'linear-regression-environment',
    'bike-linear-regression-notebook-en',
    'unknown-output',
  ]) {
    assert.throws(
      () => assets.parseLinearRegressionOutput(outputId, {}),
      /output id/i,
    )
  }
})
