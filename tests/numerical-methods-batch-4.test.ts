import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { existsSync, readFileSync, statSync } from 'node:fs'
import test from 'node:test'
import { resolve } from 'node:path'
import { curriculumRouteManifestById } from '../src/curriculum/routeManifest.ts'
import { mathLabModuleRegistry, mathLabModules } from '../src/modules/math-lab/data/modules.ts'
import { numericalDeepeningModuleIds } from '../src/modules/math-lab/data/mathCourseOrder.ts'
import {
  numericalBatch4ChapterIds,
  numericalBatch4NotebookForModule,
} from '../src/modules/math-lab/data/numericalBatch4Notebook.ts'
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
const generatorPath = resolve(root, 'scripts/numerical-methods/generate-batch-4-notebook.py')
const requirementsPath = resolve(root, 'public/notebooks/numerical-methods/requirements.txt')
const notebookPath = resolve(root, 'public/notebooks/numerical-methods/banknote-logistic-optimization.zh-CN.ipynb')
const outputDirectory = resolve(root, 'public/notebooks/numerical-methods/batch-4-outputs')
const optimizationSummaryPath = resolve(outputDirectory, 'optimization-summary.json')
const diagnosticsSummaryPath = resolve(outputDirectory, 'training-diagnostics-summary.json')
const traceJsonPath = resolve(outputDirectory, 'banknote-training-traces.json')
const traceCsvPath = resolve(outputDirectory, 'banknote-training-traces.csv')
const outputManifestPath = resolve(outputDirectory, 'manifest.json')
const traceCsvHeader = [
  'contract_version', 'run_id', 'iteration', 'feature_space', 'method', 'train_bce',
  'validation_bce', 'objective', 'gradient_norm', 'parameter_step_norm', 'accepted_step_size',
  'backtrack_count', 'relative_objective_change', 'is_best_validation', 'w_variance',
  'w_skewness', 'w_curtosis', 'w_entropy', 'intercept',
]

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

function parseTraceCsv(): JsonObject[] {
  const lines = readFileSync(traceCsvPath, 'utf8').trimEnd().split(/\r?\n/)
  assert.deepEqual(lines[0]?.split(','), traceCsvHeader)
  return lines.slice(1).map((line, index) => {
    const fields = line.split(',')
    assert.equal(fields.length, traceCsvHeader.length, `trace CSV row ${index + 2} width`)
    return Object.fromEntries(traceCsvHeader.map((field, fieldIndex) => [field, fields[fieldIndex]]))
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
  const paths = [
    notebookPath,
    optimizationSummaryPath,
    diagnosticsSummaryPath,
    traceJsonPath,
    traceCsvPath,
    outputManifestPath,
  ]
  paths.forEach((path) => assert.equal(existsSync(path), true, `${path} is owned by Plan 25-03`))
  const traces = readJson(traceJsonPath)
  assert.equal(traces.contractVersion, contractVersion)
  assert.deepEqual(traces.runs.map(({ runId }: { runId: string }) => runId), [
    'raw-fixed', 'standardized-too-small', 'standardized-stable', 'standardized-too-large', 'standardized-armijo',
  ])
  assertFiniteNumbers(traces)
})

test('[Plan 25-03] future P25-SC1/SC2: extreme BCE and gradient fixtures match locked anchors', () => {
  const optimization = readJson(optimizationSummaryPath)
  assert.equal(optimization.extremeLogitCheck.naiveFinite, false)
  assertScalarClose(optimization.extremeLogitCheck.stableWrongPositive, 1000, 'stable +1000 BCE')
  assertScalarClose(optimization.extremeLogitCheck.stableWrongNegative, 1000, 'stable -1000 BCE')
  assertScalarClose(optimization.extremeLogitCheck.stableCorrectPositive, 0, 'stable correct +1000 BCE')
  assertScalarClose(optimization.extremeLogitCheck.stableCorrectNegative, 0, 'stable correct -1000 BCE')
  assert.equal(optimization.extremeLogitCheck.scipyExpitAgreement, true)
  assert.ok(optimization.gradientCheck.maxAbsoluteError <= 2e-9)
  assertScalarClose(optimization.gradientCheck.maxAbsoluteError, 9.095135755643469e-11, 'gradient check')
  assert.equal(optimization.gradientCheck.interceptExcludedFromL2, true)
  assert.equal(optimization.gradientCheck.analytic.length, 5)
  assert.equal(optimization.gradientCheck.centeredDifference.length, 5)
})

test('[Plan 25-03] notebook uses Pandas for local schema-first loading and an isolated clean kernel', () => {
  const notebook = readJson(notebookPath)
  const manifest = readJson(outputManifestPath)
  const cells = notebook.cells as JsonObject[]
  const codeCells = cells.filter(({ cell_type }) => cell_type === 'code')
  const loaderCell = codeCells.find(({ id }) => id === 'banknote-load-local-csv')
  assert.ok(loaderCell, 'schema-first Pandas loader cell exists')
  const loaderSource = Array.isArray(loaderCell.source) ? loaderCell.source.join('') : loaderCell.source
  assert.match(loaderSource, /pandas\.read_csv\(dataset_path\)/)
  assert.match(loaderSource, /EXPECTED_SCHEMA = \["banknote_id", "variance", "skewness", "curtosis", "entropy", "class", "split"\]/)
  assert.ok(loaderSource.indexOf('list(frame.columns) == EXPECTED_SCHEMA') < loaderSource.indexOf('to_numpy(dtype=np.float64)'))
  assert.deepEqual(codeCells.map(({ execution_count }) => execution_count), Array.from({ length: codeCells.length }, (_, index) => index + 1))
  codeCells.forEach((cell) => {
    assert.deepEqual(cell.metadata?.execution ?? {}, {}, `${cell.id} has no timing metadata`)
    assert.equal(cell.outputs?.some(({ output_type }: JsonObject) => output_type === 'error'), false, `${cell.id} has no cell error`)
  })
  const combinedCode = codeCells.map(({ source }) => Array.isArray(source) ? source.join('') : source).join('\n')
  const symbols = ['stable_bce', 'loss_and_grad', 'armijo_step', 'should_stop', 'train_logistic']
  let previousPosition = -1
  for (const symbol of symbols) {
    const position = combinedCode.indexOf(`def ${symbol}`)
    assert.ok(position > previousPosition, `${symbol} follows the D-15 implementation order`)
    previousPosition = position
  }
  assert.deepEqual(manifest.loader, {
    library: 'pandas',
    call: 'pandas.read_csv',
    datasetPublicPath,
    datasetSha256: sha256(datasetPath),
    schema: ['banknote_id', 'variance', 'skewness', 'curtosis', 'entropy', 'class', 'split'],
    schemaValidatedBeforeNumpy: true,
    rowCount: 1372,
    splitCounts: { train: 960, validation: 206, test: 206 },
  })
  assert.equal(manifest.environment.exactPinImportCount, 8)
  assert.equal(manifest.environment.ambientThirdPartyPackagesUsed, false)
  assert.deepEqual(manifest.environment.packages, {
    ipykernel: '7.3.0',
    jupyterlab: '4.6.1',
    nbclient: '0.11.0',
    nbformat: '5.10.4',
    numpy: '2.4.6',
    pandas: '3.0.3',
    'scikit-learn': '1.9.0',
    scipy: '1.17.1',
  })
  assert.equal(manifest.environment.kernel.generatedNotebook, 'pass')
  assert.equal(manifest.environment.kernel.standaloneNotebook, 'pass')
  assert.deepEqual(manifest.standaloneRerun, {
    status: 'pass',
    source: 'copied download-form Notebook with local CSV beside it',
    sameIsolatedKernelContract: true,
    outputParity: true,
  })
  assert.doesNotMatch(JSON.stringify(manifest), /\/var\/folders|ml-atlas-batch4-[0-9a-f]{20,}/)
})

test('[Plan 25-03] output manifest locks all source bytes, hashes, constants, and output IDs', () => {
  const manifest = readJson(outputManifestPath)
  assert.equal(manifest.contractVersion, contractVersion)
  assert.equal(manifest.dataset.sha256, sha256(datasetPath))
  assert.equal(manifest.dataset.bytes, statSync(datasetPath).size)
  assert.equal(manifest.dataset.manifest.sha256, sha256(datasetManifestPath))
  assert.equal(manifest.dataset.manifest.bytes, statSync(datasetManifestPath).size)
  assert.equal(manifest.dataset.dataDictionary.sha256, sha256(dataDictionaryPath))
  assert.equal(manifest.generator.path, 'scripts/numerical-methods/generate-batch-4-notebook.py')
  assert.equal(manifest.generator.sha256, sha256(generatorPath))
  assert.equal(manifest.requirements.sha256, sha256(requirementsPath))
  assert.equal(manifest.wheelCacheAudit.requirementsSha256, sha256(requirementsPath))
  assert.match(manifest.wheelCacheAudit.manifestSha256, /^[0-9a-f]{64}$/)
  assert.ok(manifest.wheelCacheAudit.wheelCount > 8)
  assert.match(manifest.wheelCacheAudit.installation, /pip --no-index/)
  assert.equal(manifest.notebook.sha256, sha256(notebookPath))
  assert.equal(manifest.notebook.bytes, statSync(notebookPath).size)
  assert.deepEqual(manifest.notebook.moduleIds, ['optimization', 'training-diagnostics'])
  assert.equal(manifest.notebook.cleanKernel, true)
  assert.equal(manifest.notebook.cellErrors, 0)
  assert.equal(manifest.notebook.timingStripped, true)
  assert.deepEqual(manifest.outputs.map(({ outputId }: JsonObject) => outputId), [
    'banknote-logistic-optimization-summary',
    'banknote-training-diagnostics-summary',
    'banknote-training-traces-json',
    'banknote-training-traces-csv',
  ])
  manifest.outputs.forEach(({ publicPath, sha256: expectedHash, bytes }: JsonObject) => {
    const path = absolutePublicPath(publicPath)
    assert.equal(sha256(path), expectedHash)
    assert.equal(statSync(path).size, bytes)
  })
  assert.equal(manifest.mediaOutputsIncluded, false)
  assert.deepEqual(manifest.constants.parameterOrder, ['variance', 'skewness', 'curtosis', 'entropy', 'intercept'])
  assert.equal(manifest.constants.l2, 1e-3)
  assert.equal(manifest.constants.baselineC, 25 / 24)
  assert.match(manifest.constantsSha256, /^[0-9a-f]{64}$/)
})

test('[Plan 25-03] Armijo, terminal priority, last-finite safety, and final eligibility match locked anchors', () => {
  const optimization = readJson(optimizationSummaryPath)
  const diagnostics = readJson(diagnosticsSummaryPath)
  const traces = readJson(traceJsonPath)
  const anchors: Record<string, { reason: string; terminal: number; best: number; validationBce: number }> = {
    'raw-fixed': { reason: 'validation-patience', terminal: 112, best: 52, validationBce: 0.0319089202 },
    'standardized-too-small': { reason: 'max-iterations', terminal: 500, best: 500, validationBce: 0.2883435687 },
    'standardized-stable': { reason: 'gradient-norm', terminal: 484, best: 484, validationBce: 0.0682559267 },
    'standardized-too-large': { reason: 'validation-patience', terminal: 73, best: 13, validationBce: 0.0588531562 },
    'standardized-armijo': { reason: 'gradient-norm', terminal: 48, best: 48, validationBce: 0.0682469929 },
  }
  for (const run of traces.runs) {
    const expected = anchors[run.runId]!
    assert.equal(run.terminal.reason, expected.reason, `${run.runId} terminal reason`)
    assert.equal(run.terminal.iteration, expected.terminal, `${run.runId} terminal iteration`)
    assert.equal(run.trace.at(-1).iteration, expected.terminal, `${run.runId} last finite iteration`)
    assert.equal(run.bestValidation.iteration, expected.best, `${run.runId} best iteration`)
    assertScalarClose(run.bestValidation.bce, expected.validationBce, `${run.runId} validation BCE`)
    assert.equal(run.eligibleForFinalSelection, run.terminal.kind === 'mathematical-convergence')
  }
  const armijo = traces.runs.find(({ runId }: JsonObject) => runId === 'standardized-armijo')
  assert.deepEqual(
    [armijo.firstBacktrack.iteration, armijo.firstBacktrack.acceptedStepSize, armijo.firstBacktrack.backtrackCount],
    [1, 16, 1],
  )
  armijo.trace.slice(1).forEach((point: JsonObject, index: number) => {
    const previous = armijo.trace[index]
    const rightHandSide = previous.objective - 1e-4 * point.acceptedStepSize * previous.gradientNorm ** 2
    assert.ok(point.objective <= rightHandSide + 1e-12, `Armijo sufficient decrease at iteration ${point.iteration}`)
  })
  assert.equal(optimization.armijoCheck.initialTrialStep, 32)
  assert.equal(optimization.armijoCheck.initialTrialAccepted, false)
  assert.equal(optimization.armijoCheck.firstAcceptedStep, 16)
  assert.deepEqual(optimization.terminalFixtures.map(({ terminal }: JsonObject) => terminal.reason), [
    'gradient-norm', 'loss-and-step', 'validation-patience', 'max-iterations', 'non-finite', 'line-search-failed',
  ])
  optimization.terminalFixtures.slice(-2).forEach(({ terminal, lastFinite }: JsonObject) => {
    assert.equal(terminal.iteration, 0)
    assert.equal(terminal.attemptedIteration, 1)
    assert.equal(lastFinite.iteration, 0)
  })
  assert.equal(optimization.finalSelection.selectedRunId, 'standardized-armijo')
  assert.equal(optimization.finalSelection.transientUnstableMinimumCannotWin, true)
  assert.equal(diagnostics.selectedRunId, 'standardized-armijo')
})

test('[Plan 25-03] JSON and CSV traces have exact accepted-row parity and finite normalized values', () => {
  const traces = readJson(traceJsonPath)
  const csvRows = parseTraceCsv()
  const expectedRows = traces.runs.flatMap((run: JsonObject) => run.trace.map((point: JsonObject) => ({ run, point })))
  assert.equal(csvRows.length, expectedRows.length)
  csvRows.forEach((row, index) => {
    const { run, point } = expectedRows[index]!
    assert.equal(row.contract_version, contractVersion)
    assert.equal(row.run_id, run.runId)
    assert.equal(Number(row.iteration), point.iteration)
    assert.equal(row.feature_space, run.featureSpace)
    assert.equal(row.method, run.method)
    const numericPairs = [
      ['train_bce', 'trainBce'], ['validation_bce', 'validationBce'], ['objective', 'objective'],
      ['gradient_norm', 'gradientNorm'], ['parameter_step_norm', 'parameterStepNorm'],
      ['accepted_step_size', 'acceptedStepSize'],
    ] as const
    numericPairs.forEach(([csvKey, jsonKey]) => assert.equal(Number(row[csvKey]), point[jsonKey]))
    assert.equal(Number(row.backtrack_count), point.backtrackCount)
    assert.equal(row.relative_objective_change === '', point.relativeObjectiveChange === null)
    if (point.relativeObjectiveChange !== null) assert.equal(Number(row.relative_objective_change), point.relativeObjectiveChange)
    assert.equal(row.is_best_validation, point.isBestValidation ? 'true' : 'false')
    assert.deepEqual(
      [row.w_variance, row.w_skewness, row.w_curtosis, row.w_entropy, row.intercept].map(Number),
      point.parameters,
    )
  })
  assertFiniteNumbers(traces)
})

test('[Plan 25-03] baseline is endpoint-only and the compact report belongs only to standardized Armijo', () => {
  const optimization = readJson(optimizationSummaryPath)
  const diagnostics = readJson(diagnosticsSummaryPath)
  const traces = readJson(traceJsonPath)
  assert.equal('finalReport' in optimization, false)
  assert.equal(traces.runs.some(({ finalReport }: JsonObject) => finalReport !== undefined), false)
  assert.equal(diagnostics.finalReport.runId, 'standardized-armijo')
  assert.equal(diagnostics.finalReport.threshold, 0.5)
  assert.equal(diagnostics.finalReport.rocAucInput, 'probabilities')
  assertScalarClose(diagnostics.finalReport.manual.testBce, 0.0551101232, 'manual test BCE')
  assertScalarClose(diagnostics.finalReport.manual.accuracy, 0.9805825243, 'manual accuracy')
  assertScalarClose(diagnostics.finalReport.manual.rocAuc, 0.9994279176, 'manual ROC-AUC')
  assert.deepEqual(diagnostics.finalReport.manual.confusionMatrix, [[110, 4], [0, 92]])
  assert.equal(diagnostics.baseline.version, '1.9.0')
  assert.deepEqual(diagnostics.baseline.config, {
    C: 25 / 24,
    l1_ratio: 0,
    solver: 'lbfgs',
    fit_intercept: true,
    tol: 1e-12,
    max_iter: 5000,
  })
  assert.equal(diagnostics.baseline.reportedIterations, 17)
  assertScalarClose(diagnostics.baseline.metrics.testBce, 0.0550980756, 'baseline test BCE')
  assert.equal(diagnostics.comparison.predictionAgreement, 1)
  assertScalarClose(diagnostics.comparison.maxProbabilityDifference, 0.0001508618, 'maximum probability difference')
  assertScalarClose(diagnostics.comparison.meanProbabilityDifference, 0.0000125171, 'mean probability difference')
  assertScalarClose(diagnostics.comparison.coefficientDirectionCosine, 0.9999999991, 'coefficient cosine')
  assert.equal(diagnostics.comparison.endpointOnly, true)
  assert.equal(diagnostics.comparison.perIterationComparison, false)
  const serialized = JSON.stringify({ optimization, diagnostics, traces }).toLowerCase()
  assert.doesNotMatch(serialized, /pr-auc|threshold tuner|calibration report/)
})

test('[Plan 25-04] dataset parser accepts LF, CRLF, and BOM while enforcing the exact snapshot schema', async () => {
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const source = readFileSync(datasetPath, 'utf8')

  for (const candidate of [source, source.replace(/\n/g, '\r\n'), `\uFEFF${source}`]) {
    const rows = dataset.parseBanknoteDataset(candidate)
    assert.equal(rows.length, 1372)
    assert.deepEqual(rows[0], {
      banknoteId: 1,
      variance: 3.6216,
      skewness: 8.6661,
      curtosis: -2.8073,
      entropy: -0.44699,
      target: 0,
      split: 'train',
    })
    assert.deepEqual(
      Object.fromEntries(['train', 'validation', 'test'].map((split) => [
        split,
        rows.filter((row) => row.split === split).length,
      ])),
      { train: 960, validation: 206, test: 206 },
    )
    assert.deepEqual(
      Object.fromEntries([0, 1].map((target) => [
        target,
        rows.filter((row) => row.target === target).length,
      ])),
      { 0: 762, 1: 610 },
    )
  }
})

test('[Plan 25-04] dataset parser reports line and column for malformed, non-finite, or inconsistent rows', async () => {
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const source = readFileSync(datasetPath, 'utf8')
  const assertDatasetError = (
    candidate: string,
    expected: { code: 'parse-error' | 'schema-error'; line: number; column: number },
  ) => {
    assert.throws(
      () => dataset.parseBanknoteDataset(candidate),
      (error: unknown) => {
        assert.ok(error instanceof dataset.BanknoteDatasetError)
        assert.equal(error.code, expected.code)
        assert.equal(error.line, expected.line)
        assert.equal(error.column, expected.column)
        assert.match(error.message, new RegExp(`line ${expected.line}.*column ${expected.column}`, 'i'))
        return true
      },
    )
  }

  assertDatasetError(source.replace('variance,skewness', 'variance_bad,skewness'), {
    code: 'parse-error', line: 1, column: 2,
  })
  assertDatasetError(source.replace('1,3.6216,8.6661,-2.8073,-0.44699,0,train', '1,3.6216,8.6661'), {
    code: 'parse-error', line: 2, column: 4,
  })
  assertDatasetError(source.replace('1,3.6216,', '1,NaN,'), {
    code: 'schema-error', line: 2, column: 2,
  })
  assertDatasetError(source.replace('1,3.6216,', '2,3.6216,'), {
    code: 'schema-error', line: 2, column: 1,
  })
  assertDatasetError(source.replace(',-0.44699,0,train', ',-0.44699,2,train'), {
    code: 'schema-error', line: 2, column: 6,
  })
  assertDatasetError(source.replace(',-0.44699,0,train', ',-0.44699,0,holdout'), {
    code: 'schema-error', line: 2, column: 7,
  })
  assertDatasetError(source.split(/\r?\n/).slice(0, -2).join('\n'), {
    code: 'schema-error', line: 1372, column: 1,
  })
})

test('[Plan 25-04] train-only preprocessing is recomputed from parsed rows', async () => {
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const rows = dataset.parseBanknoteDataset(readFileSync(datasetPath, 'utf8'))
  const preprocessing = dataset.computeBanknotePreprocessing(rows)
  const manifest = readJson(datasetManifestPath)

  assert.equal(preprocessing.fitSplit, 'train')
  assert.equal(preprocessing.ddof, 0)
  assert.deepEqual(preprocessing.features, ['variance', 'skewness', 'curtosis', 'entropy'])
  for (const feature of preprocessing.features) {
    assert.ok(Math.abs(preprocessing.means[feature] - manifest.preprocessing.trainMeans[feature]) < 1e-12)
    assert.ok(Math.abs(preprocessing.scales[feature] - manifest.preprocessing.trainScales[feature]) < 1e-12)
    assert.ok(preprocessing.scales[feature] > 0)
  }

  const perturbed = rows.map((row) => row.split === 'test' ? { ...row, variance: row.variance + 1000 } : row)
  assert.deepEqual(dataset.computeBanknotePreprocessing(perturbed), preprocessing)
})

test('[Plan 25-04] dataset loader is injectable, abortable, base-safe, and preserves typed failure categories', async () => {
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const source = readFileSync(datasetPath, 'utf8')
  const observedUrls: string[] = []
  const successfulFetch = (async (input: string | URL | Request) => {
    observedUrls.push(String(input))
    return new Response(source, { status: 200 })
  }) as typeof fetch

  const rootResult = await dataset.loadBanknoteDataset({ fetch: successfulFetch, baseUrl: '/' })
  const pagesResult = await dataset.loadBanknoteDataset({ fetch: successfulFetch, baseUrl: '/ML_tutorial_Site/' })
  assert.equal(rootResult.status, 'ready')
  assert.equal(pagesResult.status, 'ready')
  assert.equal(rootResult.status === 'ready' ? rootResult.data.rows.length : 0, 1372)
  assert.deepEqual(observedUrls, [
    '/datasets/numerical-methods/banknote-authentication.csv',
    '/ML_tutorial_Site/datasets/numerical-methods/banknote-authentication.csv',
  ])

  const controller = new AbortController()
  controller.abort()
  const aborted = await dataset.loadBanknoteDataset({ fetch: successfulFetch, signal: controller.signal })
  assert.deepEqual({ status: aborted.status, code: aborted.status === 'error' ? aborted.code : undefined }, {
    status: 'error', code: 'aborted',
  })

  const httpError = await dataset.loadBanknoteDataset({
    fetch: (async () => new Response('unavailable', { status: 503 })) as typeof fetch,
  })
  assert.deepEqual({ status: httpError.status, code: httpError.status === 'error' ? httpError.code : undefined }, {
    status: 'error', code: 'http-error',
  })

  const parseError = await dataset.loadBanknoteDataset({
    fetch: (async () => new Response(source.replace('variance,skewness', 'bad,skewness'))) as typeof fetch,
  })
  assert.deepEqual({ status: parseError.status, code: parseError.status === 'error' ? parseError.code : undefined }, {
    status: 'error', code: 'parse-error',
  })

  const schemaError = await dataset.loadBanknoteDataset({
    fetch: (async () => new Response(source.replace('1,3.6216,', '1,Infinity,'))) as typeof fetch,
  })
  assert.deepEqual({ status: schemaError.status, code: schemaError.status === 'error' ? schemaError.code : undefined }, {
    status: 'error', code: 'schema-error',
  })
})

test('[Plan 25-04] stable BCE and analytic gradient stay finite and exclude the intercept from L2', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const rows = dataset.parseBanknoteDataset(readFileSync(datasetPath, 'utf8'))
  const prepared = engine.prepareBanknoteTrainingData(rows, 'standardized')

  assert.equal(engine.stableBinaryCrossEntropy(1000, 0), 1000)
  assert.equal(engine.stableBinaryCrossEntropy(-1000, 1), 1000)
  assert.equal(engine.stableBinaryCrossEntropy(1000, 1), 0)
  assert.equal(engine.stableBinaryCrossEntropy(-1000, 0), 0)
  assert.equal(engine.stableSigmoid(1000), 1)
  assert.equal(engine.stableSigmoid(-1000), 0)

  const parameters = [0.2, -0.1, 0.05, 0.15, -0.3] as const
  const analytic = engine.lossAndGrad(prepared.trainX, prepared.trainY, parameters, 1e-3)
  const h = 1e-6
  const centeredDifference = parameters.map((_, index) => {
    const plus = [...parameters]
    const minus = [...parameters]
    plus[index] += h
    minus[index] -= h
    return (
      engine.lossAndGrad(prepared.trainX, prepared.trainY, plus, 1e-3).objective
      - engine.lossAndGrad(prepared.trainX, prepared.trainY, minus, 1e-3).objective
    ) / (2 * h)
  })
  const maximumError = Math.max(...analytic.gradient.map((value, index) => Math.abs(value - centeredDifference[index]!)))
  assert.ok(maximumError <= 2e-9, `centered gradient error ${maximumError}`)

  const unregularized = engine.lossAndGrad(prepared.trainX, prepared.trainY, parameters, 0)
  assert.equal(analytic.gradient[4], unregularized.gradient[4], 'intercept gradient excludes L2')
  assert.ok(analytic.gradient.slice(0, 4).some((value, index) => value !== unregularized.gradient[index]))
})

test('[Plan 25-04] Armijo rejects 32, accepts 16, and every accepted row meets sufficient decrease', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const rows = dataset.parseBanknoteDataset(readFileSync(datasetPath, 'utf8'))
  const prepared = engine.prepareBanknoteTrainingData(rows, 'standardized')
  const parameters = [0, 0, 0, 0, 0] as const
  const current = engine.lossAndGrad(prepared.trainX, prepared.trainY, parameters, 1e-3)
  const firstStep = engine.armijoStep({
    features: prepared.trainX,
    targets: prepared.trainY,
    parameters,
    current,
    l2: 1e-3,
    config: engine.BANKNOTE_TRAINING_CONSTANTS.armijo,
  })
  assert.equal(firstStep.accepted, true)
  assert.equal(firstStep.accepted ? firstStep.backtrackCount : -1, 1)
  assert.equal(firstStep.accepted ? firstStep.stepSize : -1, 16)

  const result = engine.runBanknotePreset('standardized-armijo', rows)
  assert.equal(result.firstBacktrack?.backtrackCount, 1)
  assertScalarClose(result.firstBacktrack?.acceptedStepSize ?? Number.NaN, 16, 'Armijo first accepted alpha')
  for (let index = 1; index < result.trace.length; index += 1) {
    const previous = result.trace[index - 1]!
    const point = result.trace[index]!
    const rightHandSide = previous.objective
      - engine.BANKNOTE_TRAINING_CONSTANTS.armijo.c * point.acceptedStepSize * previous.gradientNorm ** 2
    assert.ok(point.objective <= rightHandSide + 1e-12, `Armijo iteration ${point.iteration}`)
  }
})

test('[Plan 25-04] stop priority produces six typed terminal reasons in the locked order', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  const fixtures = engine.evaluateBatch4TerminalFixtures()
  assert.deepEqual(fixtures.map(({ terminal }: any) => terminal.reason), [
    'gradient-norm', 'loss-and-step', 'validation-patience', 'max-iterations', 'non-finite', 'line-search-failed',
  ])
  assert.deepEqual(fixtures.map(({ terminal }: any) => terminal.kind), [
    'mathematical-convergence', 'mathematical-convergence', 'model-selection', 'safety', 'safety', 'safety',
  ])
  assert.equal(fixtures[0].terminal.iteration, 3)
  assert.equal(fixtures[1].terminal.iteration, 3)
  assert.equal(fixtures[2].terminal.iteration, 60)
  assert.equal(fixtures[3].terminal.iteration, 5)
  const nonFinite = fixtures.find(({ terminal }: any) => terminal.reason === 'non-finite')
  assert.equal(nonFinite.terminal.attemptedIteration, 1)
  assert.equal(nonFinite.trace.at(-1).iteration, 0)
})

test('[Plan 25-04] last finite state survives exact Number.MAX_VALUE and failed-line-search probes', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const rows = dataset.parseBanknoteDataset(readFileSync(datasetPath, 'utf8'))

  const nonFinite = engine.trainLogistic(rows, {
    ...engine.BANKNOTE_TRAINING_PRESETS['raw-fixed'].config,
    featureSpace: 'raw',
    method: 'fixed',
    step: Number.MAX_VALUE,
    maxIterations: 10,
  })
  assert.equal(nonFinite.status, 'complete')
  assert.equal(nonFinite.status === 'complete' ? nonFinite.terminal.reason : '', 'non-finite')
  assert.equal(nonFinite.status === 'complete' ? nonFinite.terminal.iteration : -1, 0)
  assert.equal(nonFinite.status === 'complete' ? nonFinite.terminal.attemptedIteration : -1, 1)
  assert.equal(nonFinite.status === 'complete' ? nonFinite.trace.length : -1, 1)
  assertFiniteNumbers(nonFinite.status === 'complete' ? nonFinite.trace : [])
  assert.equal(engine.terminalSuggestions['non-finite'].variable, 'learningRate')

  const failedSearch = engine.trainLogistic(rows, {
    ...engine.BANKNOTE_TRAINING_PRESETS['standardized-armijo'].config,
    armijo: {
      ...engine.BANKNOTE_TRAINING_CONSTANTS.armijo,
      maxBacktracks: 0,
    },
  })
  assert.equal(failedSearch.status, 'complete')
  assert.equal(failedSearch.status === 'complete' ? failedSearch.terminal.reason : '', 'line-search-failed')
  assert.equal(failedSearch.status === 'complete' ? failedSearch.terminal.attemptedIteration : -1, 1)
  assert.equal(failedSearch.status === 'complete' ? failedSearch.trace.at(-1)?.iteration : -1, 0)
})

test('[Plan 25-04] invalid training controls return explicit validation without silent replacement', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const rows = dataset.parseBanknoteDataset(readFileSync(datasetPath, 'utf8'))
  const invalid = engine.trainLogistic(rows, {
    ...engine.BANKNOTE_TRAINING_PRESETS['standardized-stable'].config,
    step: Number.NaN,
    maxIterations: 501,
  })
  assert.equal(invalid.status, 'invalid-config')
  assert.deepEqual(
    invalid.status === 'invalid-config' ? invalid.issues.map(({ field }) => field) : [],
    ['step', 'maxIterations'],
  )
  assert.match(invalid.status === 'invalid-config' ? invalid.message : '', /step|maxIterations/)
})

test('[Plan 25-04] five run parity matches every accepted Notebook trace within locked tolerances', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const rows = dataset.parseBanknoteDataset(readFileSync(datasetPath, 'utf8'))
  const notebook = readJson(traceJsonPath)

  assert.deepEqual(Object.keys(engine.BANKNOTE_TRAINING_PRESETS), [
    'raw-fixed', 'standardized-too-small', 'standardized-stable', 'standardized-too-large', 'standardized-armijo',
  ])
  for (const expected of notebook.runs) {
    const actual = engine.runBanknotePreset(expected.runId, rows)
    assert.equal(actual.status, 'complete')
    assert.equal(actual.runId, expected.runId)
    assert.equal(actual.trace.length, expected.trace.length, `${expected.runId} trace length`)
    assert.deepEqual(actual.terminal, expected.terminal, `${expected.runId} terminal`)
    assert.equal(actual.bestValidation.iteration, expected.bestValidation.iteration)
    assertScalarClose(actual.bestValidation.bce, expected.bestValidation.bce, `${expected.runId} best BCE`)
    assertParametersClose(actual.bestValidation.parameters, expected.bestValidation.parameters, `${expected.runId} best parameters`)

    actual.trace.forEach((point, index) => {
      const anchor = expected.trace[index]!
      assert.equal(point.iteration, anchor.iteration)
      assert.equal(point.backtrackCount, anchor.backtrackCount)
      assert.equal(point.isBestValidation, anchor.isBestValidation)
      for (const field of [
        'trainBce', 'validationBce', 'objective', 'gradientNorm', 'parameterStepNorm', 'acceptedStepSize',
      ] as const) {
        assertScalarClose(point[field], anchor[field], `${expected.runId} iteration ${point.iteration} ${field}`)
      }
      if (anchor.relativeObjectiveChange === null) {
        assert.equal(point.relativeObjectiveChange, null)
      } else {
        assertScalarClose(point.relativeObjectiveChange ?? Number.NaN, anchor.relativeObjectiveChange, `${expected.runId} relative objective`)
      }
      assertParametersClose(point.parameters, anchor.parameters, `${expected.runId} iteration ${point.iteration} parameters`)
    })
  }
})

test('[Plan 25-04] final selection excludes lower transient validation winners', async () => {
  const engine = await import('../src/modules/math-lab/utils/banknoteLogistic.ts')
  const dataset = await import('../src/modules/math-lab/utils/banknoteDataset.ts')
  const rows = dataset.parseBanknoteDataset(readFileSync(datasetPath, 'utf8'))
  const runs = Object.keys(engine.BANKNOTE_TRAINING_PRESETS).map((runId) => (
    engine.runBanknotePreset(runId as keyof typeof engine.BANKNOTE_TRAINING_PRESETS, rows)
  ))
  const selected = engine.selectFinalTrainingRun(runs)
  assert.equal(selected?.runId, 'standardized-armijo')
  assert.equal(selected?.terminal.kind, 'mathematical-convergence')
  assert.ok(
    runs.find(({ runId }) => runId === 'standardized-too-large')!.bestValidation.bce
      < selected!.bestValidation.bce,
    'the rejected unstable run really has the lower transient validation BCE',
  )
})

test('[Plan 25-05] module content and companions form two complete bilingual Banknote teaching loops', () => {
  const enhancerPath = resolve(root, 'src/modules/math-lab/data/numericalBatch4Modules.ts')
  const companionPath = resolve(root, 'src/modules/math-lab/data/numericalBatch4Notebook.ts')
  assert.equal(existsSync(enhancerPath), true)
  assert.equal(existsSync(companionPath), true)
  assert.deepEqual(numericalBatch4ChapterIds, ['optimization', 'training-diagnostics'])

  const optimization = mathLabModuleRegistry.optimization
  const diagnostics = mathLabModuleRegistry['training-diagnostics']
  const chapterSections = [
    ...optimization.sections.filter(({ id }) => id.startsWith('v3-banknote-optimization')),
    ...diagnostics.sections.filter(({ id }) => id.startsWith('v3-banknote-diagnostics')),
  ]
  assert.ok(chapterSections.length >= 11)
  chapterSections.forEach((item) => {
    assertBilingual(item.title, `${item.id} title`)
    assertBilingual(item.content, `${item.id} content`)
  })

  const optimizationContent = optimization.sections.map(({ content }) => content.en).join('\n')
  const diagnosticsContent = diagnostics.sections.map(({ content }) => content.en).join('\n')
  for (const term of [
    'stable_bce', 'loss_and_grad', 'armijo_step', 'should_stop', 'train_logistic',
    'raw-fixed', 'standardized-too-small', 'standardized-stable',
    'standardized-too-large', 'standardized-armijo', 'optimizer-comparison',
  ]) assert.match(optimizationContent, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')))
  for (const term of [
    'visible', 'plausible cause', 'one variable', 'expected next run',
    'test BCE 0.0551101232', 'prediction agreement 1.0',
  ]) assert.match(diagnosticsContent, new RegExp(term, 'i'))
  assert.match(diagnosticsContent, /deterministic synthetic support examples/i)
  assert.match(diagnosticsContent, /not Banknote results/i)

  const optimizationCompanion = numericalBatch4NotebookForModule('optimization')!
  const diagnosticsCompanion = numericalBatch4NotebookForModule('training-diagnostics')!
  assert.ok(optimizationCompanion)
  assert.ok(diagnosticsCompanion)
  assert.strictEqual(optimizationCompanion.notebook, diagnosticsCompanion.notebook)
  assert.strictEqual(optimizationCompanion.dataset, diagnosticsCompanion.dataset)
  assert.strictEqual(optimizationCompanion.requirements, diagnosticsCompanion.requirements)
  assert.equal(optimizationCompanion.outputId, 'banknote-logistic-optimization-summary')
  assert.equal(diagnosticsCompanion.outputId, 'banknote-training-diagnostics-summary')
  for (const companion of [optimizationCompanion, diagnosticsCompanion]) {
    assertBilingual(companion.title, `${companion.id} title`)
    assertBilingual(companion.description, `${companion.id} description`)
    assertBilingual(companion.codeTitle, `${companion.id} code title`)
    assertBilingual(companion.codeOutput, `${companion.id} code output`)
    assert.equal(companion.supportingDownloads.length, 4)
    for (const asset of [
      companion.notebook, companion.dataset, companion.requirements, ...companion.supportingDownloads,
    ]) {
      assert.match(asset.publicPath, /^\//)
      assert.equal(existsSync(absolutePublicPath(asset.publicPath)), true, asset.publicPath)
      assertBilingual(asset.label, `${asset.filename} label`)
      assertBilingual(asset.description, `${asset.filename} description`)
    }
  }
  assert.equal(numericalBatch4NotebookForModule('pca'), undefined)
})

test('[Plan 25-05] one primary lab, route order, checkpoints, progress, and synthetic provenance stay exact', () => {
  const optimization = mathLabModuleRegistry.optimization
  const diagnostics = mathLabModuleRegistry['training-diagnostics']
  assert.equal(optimization.sections.filter(({ labIds }) => labIds?.includes('optimization-gradient-lab')).length, 1)
  assert.equal(diagnostics.sections.filter(({ labIds }) => labIds?.includes('training-diagnostics-lab')).length, 1)
  assert.deepEqual(optimization.labs.map(({ id }) => id), ['optimization-gradient-lab'])
  assert.deepEqual(diagnostics.labs.map(({ id }) => id), ['training-diagnostics-lab'])
  assert.deepEqual(optimization.quizzes.map(({ id }) => id), [
    'optimization-local-test-1d',
    'optimization-golden-bracket-length',
    'optimization-steepest-direction',
    'optimization-newton-nd-system',
  ])
  assert.deepEqual(diagnostics.quizzes.map(({ id }) => id), [
    'diagnostics-overfit', 'diagnostics-exploding', 'diagnostics-gap',
  ])
  assert.deepEqual(numericalDeepeningModuleIds.slice(-2), ['optimization', 'training-diagnostics'])
  assert.equal(curriculumRouteManifestById.get('optimization')?.route, '/math-lab/modules/optimization')
  assert.equal(curriculumRouteManifestById.get('training-diagnostics')?.route, '/math-lab/modules/training-diagnostics')
  assert.equal(mathLabProgressStorageKey, 'ml-atlas:math-lab-progress:v1')

  const scenarios: TrainingScenario[] = [
    'healthy', 'high-learning-rate', 'overfitting', 'vanishing-gradient', 'exploding-gradient',
  ]
  assert.deepEqual(scenarios.map((scenario) => evaluateTrainingScenario(scenario, 16).scenario), scenarios)
  assert.match(JSON.stringify(diagnostics), /synthetic support example/i)
  assert.doesNotMatch(JSON.stringify(diagnostics), /banknote-optimization-diagnostics\.png/)
  assert.doesNotMatch(JSON.stringify(diagnostics), /banknote-training-diagnostics\.mp4/)
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
