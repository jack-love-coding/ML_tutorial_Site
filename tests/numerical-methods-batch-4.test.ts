import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { resolve } from 'node:path'
import { curriculumRouteManifestById } from '../src/curriculum/routeManifest.ts'
import { mathLabModuleRegistry, mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { numericalDeepeningModuleIds } from '../src/modules/math-lab/data/mathCourseOrder.ts'
import { evaluateTrainingScenario, type TrainingScenario } from '../src/modules/math-lab/utils/aiBridgeMath.ts'
import { mathLabProgressStorageKey } from '../src/modules/math-lab/utils/progress.ts'
import { withPublicBase } from '../src/utils/publicPath.ts'

const root = resolve(import.meta.dirname, '..')
const contractVersion = 'numerical-methods-batch-4-v1'
const scalarTolerance = 1e-9
const parameterTolerance = 1e-8
const datasetPublicPath = '/datasets/numerical-methods/banknote-authentication.csv'
const datasetPath = absolutePublicPath(datasetPublicPath)
const datasetManifestPath = resolve(root, 'public/datasets/numerical-methods/banknote-authentication-manifest.json')
const dataDictionaryPath = resolve(root, 'public/datasets/numerical-methods/banknote-authentication-data-dictionary.json')
const contractPath = resolve(root, 'docs/curriculum-v3/numerical-methods/batch-4-contract.md')

type JsonObject = Record<string, any>

type DatasetRow = {
  banknoteId: number
  variance: number
  skewness: number
  curtosis: number
  entropy: number
  classValue: 0 | 1
  split: 'train' | 'validation' | 'test'
}

function absolutePublicPath(publicPath: string): string {
  assert.match(publicPath, /^\//)
  return resolve(root, 'public', publicPath.slice(1))
}

function readJson<T extends JsonObject = JsonObject>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf8')) as T
}

function sha256(path: string): string {
  return createHash('sha256').update(readFileSync(path)).digest('hex')
}

function assertBilingual(value: { 'zh-CN': string; en: string }, label: string): void {
  assert.match(value['zh-CN'], /[\u3400-\u9fff]/, `${label} needs Chinese copy`)
  assert.match(value.en, /[A-Za-z]/, `${label} needs English copy`)
}

function assertFiniteNumbers(value: unknown, path = 'root'): void {
  if (typeof value === 'number') {
    assert.equal(Number.isFinite(value), true, `${path} must be finite`)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => assertFiniteNumbers(item, `${path}[${index}]`))
    return
  }
  if (value && typeof value === 'object') {
    for (const [key, item] of Object.entries(value)) assertFiniteNumbers(item, `${path}.${key}`)
  }
}

function assertScalarClose(actual: number, expected: number, label: string): void {
  assert.ok(Math.abs(actual - expected) <= scalarTolerance, `${label}: ${actual} != ${expected}`)
}

function assertParametersClose(actual: readonly number[], expected: readonly number[], label: string): void {
  assert.equal(actual.length, expected.length, `${label} length`)
  actual.forEach((value, index) => {
    assert.ok(Math.abs(value - expected[index]!) <= parameterTolerance, `${label}[${index}] drifted`)
  })
}

function parseDataset(): DatasetRow[] {
  const lines = readFileSync(datasetPath, 'utf8').trimEnd().split(/\r?\n/)
  assert.equal(lines[0], 'banknote_id,variance,skewness,curtosis,entropy,class,split')
  return lines.slice(1).map((line, index) => {
    const fields = line.split(',')
    assert.equal(fields.length, 7, `row ${index + 2} width`)
    const [id, variance, skewness, curtosis, entropy, classValue, split] = fields
    const row = {
      banknoteId: Number(id),
      variance: Number(variance),
      skewness: Number(skewness),
      curtosis: Number(curtosis),
      entropy: Number(entropy),
      classValue: Number(classValue) as 0 | 1,
      split: split as DatasetRow['split'],
    }
    assert.equal(row.banknoteId, index + 1)
    assert.ok([row.variance, row.skewness, row.curtosis, row.entropy].every(Number.isFinite))
    assert.ok(row.classValue === 0 || row.classValue === 1)
    assert.ok(['train', 'validation', 'test'].includes(row.split))
    return row
  })
}

test('Batch 4 dataset provenance, schema, hashes, split counts, and train statistics are locked', () => {
  const manifest = readJson(datasetManifestPath)
  const dictionary = readJson(dataDictionaryPath)
  const rows = parseDataset()

  assert.equal(manifest.contractVersion, contractVersion)
  assert.equal(dictionary.contractVersion, contractVersion)
  assert.equal(rows.length, 1372)
  assert.equal(new Set(rows.map(({ banknoteId }) => banknoteId)).size, 1372)
  assert.deepEqual(
    Object.fromEntries([0, 1].map((value) => [value, rows.filter((row) => row.classValue === value).length])),
    { 0: 762, 1: 610 },
  )
  assert.deepEqual(
    Object.fromEntries(['train', 'validation', 'test'].map((split) => [split, rows.filter((row) => row.split === split).length])),
    { train: 960, validation: 206, test: 206 },
  )
  assert.deepEqual(manifest.split.classCounts, {
    train: { 0: 533, 1: 427 },
    validation: { 0: 115, 1: 91 },
    test: { 0: 114, 1: 92 },
  })
  assert.deepEqual(manifest.split.seeds, { trainHoldout: 20260725, validationTest: 20260726 })
  assert.deepEqual(manifest.normalizedDataset.schema, [
    'banknote_id', 'variance', 'skewness', 'curtosis', 'entropy', 'class', 'split',
  ])
  assert.equal(manifest.normalizedDataset.publicPath, datasetPublicPath)
  assert.equal(manifest.normalizedDataset.sha256, sha256(datasetPath))
  assert.equal(manifest.normalizedDataset.bytes, statSync(datasetPath).size)
  assert.equal(manifest.source.doi, '10.24432/C55P57')
  assert.equal(manifest.source.license, 'CC BY 4.0')
  assert.equal(manifest.source.zip.sha256, '1e2acd9a2085fadf3d8145c12d3d22af853320d52294a6590c2eaf75fdc05227')
  assert.deepEqual(manifest.source.member, {
    name: 'data_banknote_authentication.txt',
    bytes: 46400,
    sha256: 'd0539aaed2139ba7a587b3e34fb345ce503ff7d5d33dbf9912d8e195ce425cb9',
  })

  const train = rows.filter(({ split }) => split === 'train')
  const expected = {
    variance: [0.46886307781249986, 2.8049705227712813],
    skewness: [1.9775978456250036, 5.81400805653475],
    curtosis: [1.3202396866562518, 4.234924404032209],
    entropy: [-1.1418097847916664, 2.0726581960156034],
  } as const
  for (const [feature, [expectedMean, expectedScale]] of Object.entries(expected)) {
    const values = train.map((row) => row[feature as keyof Pick<DatasetRow, 'variance' | 'skewness' | 'curtosis' | 'entropy'>])
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length
    const scale = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length)
    assert.ok(Math.abs(mean - expectedMean) < 1e-12, `${feature} train mean`)
    assert.ok(Math.abs(scale - expectedScale) < 1e-12, `${feature} train population scale`)
    assert.equal(manifest.preprocessing.trainMeans[feature], expectedMean)
    assert.equal(manifest.preprocessing.trainScales[feature], expectedScale)
  }
  assert.equal(manifest.preprocessing.fitSplit, 'train')
  assert.equal(manifest.preprocessing.ddof, 0)
  assert.deepEqual(dictionary.fields.map(({ name }: { name: string }) => name), [
    'banknote_id', 'variance', 'skewness', 'curtosis', 'entropy', 'class', 'split',
  ])
  dictionary.fields.forEach((field: { name: string; 'zh-CN': string; en: string }) => assertBilingual(field, field.name))
  assert.match(dictionary.attribution.classMeaning, /does not define semantic meanings/)
})

test('Batch 4 contract and isolated environment boundary freeze every downstream constant', () => {
  const contract = readFileSync(contractPath, 'utf8')
  const requirements = readFileSync(resolve(root, 'public/notebooks/numerical-methods/requirements.txt'), 'utf8')
  const generator = readFileSync(resolve(root, 'scripts/numerical-methods/generate-batch-4-notebook.py'), 'utf8')

  assert.match(contract, /numerical-methods-batch-4-v1/)
  for (const decision of Array.from({ length: 29 }, (_, index) => `D-${String(index + 1).padStart(2, '0')}`)) {
    assert.match(contract, new RegExp(`\\*\\*${decision}:\\*\\*`))
  }
  assert.equal(requirements.split(/\r?\n/).filter((line) => line === 'scikit-learn==1.9.0').length, 1)
  assert.match(generator, /--bootstrap-environment-cache/)
  assert.match(generator, /--verify-environment/)
  assert.match(generator, /--refresh-source/)
  assert.match(generator, /PIP_NO_INDEX/)
  assert.match(generator, /--no-index/)
  assert.match(generator, /JUPYTER_PATH/)
  assert.match(generator, /JUPYTER_CONFIG_DIR/)
  assert.match(generator, /JUPYTER_RUNTIME_DIR/)
  assert.match(generator, /IPYTHONDIR/)
  assert.match(generator, /1e2acd9a2085fadf3d8145c12d3d22af853320d52294a6590c2eaf75fdc05227/)
  assert.match(generator, /d0539aaed2139ba7a587b3e34fb345ce503ff7d5d33dbf9912d8e195ce425cb9/)
  assert.equal(withPublicBase(datasetPublicPath, '/ML_tutorial_Site/'), '/ML_tutorial_Site/datasets/numerical-methods/banknote-authentication.csv')
})

test('Batch 4 preservation scaffold locks routes, labs, checkpoints, progress, and synthetic scenarios', () => {
  const moduleIds = mathLabModules.map(({ id }) => id)
  const optimizationIndex = moduleIds.indexOf('optimization')
  const diagnosticsIndex = moduleIds.indexOf('training-diagnostics')
  assert.equal(moduleIds.filter((id) => id === 'optimization').length, 1)
  assert.equal(moduleIds.filter((id) => id === 'training-diagnostics').length, 1)
  assert.ok(optimizationIndex >= 0 && diagnosticsIndex > optimizationIndex)
  assert.deepEqual(numericalDeepeningModuleIds.slice(-2), ['optimization', 'training-diagnostics'])
  assert.equal(curriculumRouteManifestById.get('optimization')?.route, '/math-lab/modules/optimization')
  assert.equal(curriculumRouteManifestById.get('training-diagnostics')?.route, '/math-lab/modules/training-diagnostics')

  const optimization = mathLabModuleRegistry.optimization
  const diagnostics = mathLabModuleRegistry['training-diagnostics']
  assert.deepEqual(optimization.labs.map(({ id }) => id), ['optimization-gradient-lab'])
  assert.deepEqual(diagnostics.labs.map(({ id }) => id), ['training-diagnostics-lab'])
  assert.equal(optimization.sections.filter(({ labIds }) => labIds?.includes('optimization-gradient-lab')).length, 1)
  assert.equal(diagnostics.sections.filter(({ labIds }) => labIds?.includes('training-diagnostics-lab')).length, 1)
  assert.deepEqual(optimization.quizzes.map(({ id }) => id), [
    'optimization-local-test-1d',
    'optimization-golden-bracket-length',
    'optimization-steepest-direction',
    'optimization-newton-nd-system',
  ])
  assert.deepEqual(diagnostics.quizzes.map(({ id }) => id), [
    'diagnostics-overfit', 'diagnostics-exploding', 'diagnostics-gap',
  ])
  assert.equal(mathLabProgressStorageKey, 'ml-atlas:math-lab-progress:v1')

  const scenarios: TrainingScenario[] = [
    'healthy', 'high-learning-rate', 'overfitting', 'vanishing-gradient', 'exploding-gradient',
  ]
  for (const scenario of scenarios) {
    const result = evaluateTrainingScenario(scenario, 12)
    assert.equal(result.scenario, scenario)
    assert.equal(result.series.length, 12)
    assertFiniteNumbers(result)
  }
})

test('[Plan 25-03] future P25-SC1/SC2/SC3: executed Notebook and complete finite traces are published', () => {
  const outputDirectory = resolve(root, 'public/notebooks/numerical-methods/batch-4-outputs')
  const paths = [
    resolve(root, 'public/notebooks/numerical-methods/banknote-logistic-optimization.zh-CN.ipynb'),
    resolve(outputDirectory, 'optimization-summary.json'),
    resolve(outputDirectory, 'training-diagnostics-summary.json'),
    resolve(outputDirectory, 'banknote-training-traces.json'),
    resolve(outputDirectory, 'banknote-training-traces.csv'),
    resolve(outputDirectory, 'manifest.json'),
  ]
  paths.forEach((path) => assert.equal(existsSync(path), true, `${path} is owned by Plan 25-03`))
  const traces = readJson(resolve(outputDirectory, 'banknote-training-traces.json'))
  assert.equal(traces.contractVersion, contractVersion)
  assert.deepEqual(traces.runs.map(({ runId }: { runId: string }) => runId), [
    'raw-fixed', 'standardized-too-small', 'standardized-stable', 'standardized-too-large', 'standardized-armijo',
  ])
  assertFiniteNumbers(traces)
})

test('[Plan 25-03] future P25-SC1/SC2: extreme BCE and gradient fixtures match locked anchors', () => {
  const optimization = readJson(resolve(root, 'public/notebooks/numerical-methods/batch-4-outputs/optimization-summary.json'))
  assert.equal(optimization.extremeLogitCheck.naiveFinite, false)
  assertScalarClose(optimization.extremeLogitCheck.stableWrongPositive, 1000, 'stable +1000 BCE')
  assertScalarClose(optimization.extremeLogitCheck.stableWrongNegative, 1000, 'stable -1000 BCE')
  assert.ok(optimization.gradientCheck.maxAbsoluteError <= 2e-9)
  assertScalarClose(optimization.gradientCheck.maxAbsoluteError, 9.095135755643469e-11, 'gradient check')
})

test('[Plan 25-04] future P25-SC3/SC4: TypeScript objective, Armijo, stopping, and parity are executable', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  assert.equal(engine.stableBinaryCrossEntropy(1000, 0), 1000)
  assert.equal(engine.stableBinaryCrossEntropy(-1000, 1), 1000)
  const result = await engine.runBanknotePreset('standardized-armijo')
  assert.equal(result.firstBacktrack.backtrackCount, 1)
  assertScalarClose(result.firstBacktrack.acceptedStepSize, 16, 'Armijo first accepted alpha')
  assert.equal(result.terminal.reason, 'gradient-norm')
  assert.equal(result.terminal.iteration, 48)
  const output = readJson(resolve(root, 'public/notebooks/numerical-methods/batch-4-outputs/optimization-summary.json'))
  assertParametersClose(result.bestValidation.parameters, output.runs['standardized-armijo'].bestValidation.parameters, 'Armijo parameters')
})

test('[Plan 25-04] future P25-SC3: all terminal fixtures preserve typed priority and last-finite state', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  const fixtures = engine.evaluateBatch4TerminalFixtures()
  assert.deepEqual(fixtures.map(({ terminal }: any) => terminal.reason), [
    'gradient-norm', 'loss-and-step', 'validation-patience', 'max-iterations', 'non-finite', 'line-search-failed',
  ])
  const nonFinite = fixtures.find(({ terminal }: any) => terminal.reason === 'non-finite')
  assert.equal(nonFinite.terminal.attemptedIteration, 1)
  assert.equal(nonFinite.trace.at(-1).iteration, 0)
})

test('[Plan 25-05] future P25-SC4/SC5: bilingual lessons and existing labs consume real runs without losing support modes', () => {
  const enhancerPath = resolve(root, 'src/modules/math-lab/data/numericalBatch4Modules.ts')
  const companionPath = resolve(root, 'src/modules/math-lab/data/numericalBatch4Notebook.ts')
  assert.equal(existsSync(enhancerPath), true, `${enhancerPath} is owned by Plan 25-05`)
  assert.equal(existsSync(companionPath), true, `${companionPath} is owned by Plan 25-05`)
  const optimization = mathLabModuleRegistry.optimization
  const diagnostics = mathLabModuleRegistry['training-diagnostics']
  assert.ok(optimization.sections.some(({ id }) => id.startsWith('v3-banknote-optimization')))
  assert.ok(diagnostics.sections.some(({ id }) => id.startsWith('v3-banknote-diagnostics')))
  assert.match(JSON.stringify(diagnostics), /synthetic support example/i)
})

test('[Plan 25-09] future P25-SC5: shared three-panel illustration exists and is locally bound', () => {
  const publicPath = '/math-lab/numerical-methods/banknote-optimization-diagnostics.png'
  assert.equal(existsSync(absolutePublicPath(publicPath)), true, `${publicPath} is owned by Plan 25-09`)
  for (const moduleId of ['optimization', 'training-diagnostics'] as const) {
    const moduleDefinition = mathLabModuleRegistry[moduleId]
    assert.equal(moduleDefinition.visuals.filter(({ assetPath }) => assetPath === publicPath).length, 1)
    assert.ok(moduleDefinition.importedAssetPaths.includes(publicPath))
  }
})
