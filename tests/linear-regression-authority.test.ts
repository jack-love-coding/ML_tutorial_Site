import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import test from 'node:test'
import {
  parseLinearRegressionOutput,
  type LinearRegressionCoefficientRow,
  type LinearRegressionGradientTraceRow,
  type LinearRegressionLockedSummary,
  type LinearRegressionResidualRow,
} from '../src/data/linearRegressionAssets.ts'
import {
  LINEAR_REGRESSION_PUBLISHED_BASELINE,
  createLinearRegressionWorkbenchPackage,
  selectAtempComparison,
  selectCoefficientResult,
  selectGradientTracePoint,
  selectHeldoutCase,
  selectMethodResult,
  selectRowBatchResult,
  type LinearRegressionWorkbenchPackage,
} from '../src/simulations/linearRegressionWorkbench.ts'
import { simulateLinearRegression } from '../src/simulations/linearRegression.ts'

const root = resolve(import.meta.dirname, '..')
const packageRoot = resolve(root, 'public/notebooks/linear-regression')
const sourcePath = resolve(
  root,
  'public/datasets/python-data-tools/bike-sharing-hour.csv',
)

const methodIds = [
  'numpy-batch-gradient-descent',
  'numpy-lstsq',
  'sklearn-linear-regression',
] as const
const namedRoles = [
  'negative-prediction',
  'morning-peak-underprediction',
  'evening-peak-underprediction',
  'large-residual',
] as const

function loadPublishedPackage(): LinearRegressionWorkbenchPackage {
  const summary = parseLinearRegressionOutput(
    'linear-regression-summary',
    JSON.parse(
      readFileSync(
        resolve(packageRoot, 'linear-regression-summary.json'),
        'utf8',
      ),
    ),
  ) as LinearRegressionLockedSummary
  const gradientTrace = parseLinearRegressionOutput(
    'linear-regression-gradient-descent-trace',
    readFileSync(resolve(packageRoot, 'gradient-descent-trace.csv'), 'utf8'),
  ) as readonly LinearRegressionGradientTraceRow[]
  const coefficients = parseLinearRegressionOutput(
    'linear-regression-coefficients',
    readFileSync(resolve(packageRoot, 'coefficients.csv'), 'utf8'),
  ) as readonly LinearRegressionCoefficientRow[]
  const heldoutResiduals = parseLinearRegressionOutput(
    'linear-regression-heldout-residuals',
    readFileSync(resolve(packageRoot, 'heldout-residuals.csv'), 'utf8'),
  ) as readonly LinearRegressionResidualRow[]

  return createLinearRegressionWorkbenchPackage({
    summary,
    gradientTrace,
    coefficients,
    heldoutResiduals,
  })
}

function sourceRows(): ReadonlyMap<number, Readonly<Record<string, string>>> {
  const lines = readFileSync(sourcePath, 'utf8').trimEnd().split(/\r?\n/)
  const header = lines[0]!.split(',')
  const rows = lines.slice(1).map((line) => {
    const cells = line.split(',')
    return Object.freeze(
      Object.fromEntries(
        header.map((column, index) => [column, cells[index]!]),
      ),
    )
  })
  assert.equal(rows.length, 17_379)
  return new Map(rows.map((row) => [Number(row.instant), row]))
}

function assertDeepFrozen(value: unknown, path = '$'): void {
  if (typeof value !== 'object' || value === null) return
  assert.equal(Object.isFrozen(value), true, `${path} must be frozen`)
  for (const [key, entry] of Object.entries(value)) {
    assertDeepFrozen(entry, `${path}.${key}`)
  }
}

function mutablePackageInput(
  published: LinearRegressionWorkbenchPackage,
): {
  summary: LinearRegressionLockedSummary
  gradientTrace: LinearRegressionGradientTraceRow[]
  coefficients: LinearRegressionCoefficientRow[]
  heldoutResiduals: LinearRegressionResidualRow[]
} {
  return {
    summary: structuredClone(published.summary),
    gradientTrace: structuredClone(published.gradientTrace),
    coefficients: structuredClone(published.coefficients),
    heldoutResiduals: structuredClone(published.heldoutResiduals),
  }
}

test('strict workbench constructor accepts only the complete cross-file-consistent package', () => {
  const published = loadPublishedPackage()

  assert.equal(published.gradientTrace.length, 773)
  assert.equal(published.coefficients.length, 24)
  assert.equal(published.heldoutResiduals.length, 3_476)
  assertDeepFrozen(published)

  const cases: Array<[
    string,
    (input: ReturnType<typeof mutablePackageInput>) => void,
    RegExp,
  ]> = [
    [
      'missing GD row',
      (input) => {
        input.gradientTrace.pop()
      },
      /773|gradient/i,
    ],
    [
      'duplicate or out-of-order GD update',
      (input) => {
        input.gradientTrace[2] = {
          ...input.gradientTrace[2]!,
          update: 1,
        }
      },
      /update|order/i,
    ],
    [
      'non-finite GD value',
      (input) => {
        input.gradientTrace[10] = {
          ...input.gradientTrace[10]!,
          mse: Number.NaN,
        }
      },
      /finite/i,
    ],
    [
      'missing coefficient key',
      (input) => {
        input.coefficients.pop()
      },
      /24|coefficient/i,
    ],
    [
      'duplicate coefficient key',
      (input) => {
        input.coefficients[1] = {
          ...input.coefficients[1]!,
          feature: 'intercept',
        }
      },
      /coefficient|feature|key/i,
    ],
    [
      'coefficient summary drift',
      (input) => {
        input.coefficients[7] = {
          ...input.coefficients[7]!,
          coefficient: input.coefficients[7]!.coefficient + 1,
        }
      },
      /coefficient|summary|cross-file/i,
    ],
    [
      'missing held-out row',
      (input) => {
        input.heldoutResiduals.pop()
      },
      /3476|held-out|residual/i,
    ],
    [
      'duplicate or out-of-order held-out instant',
      (input) => {
        input.heldoutResiduals[1] = {
          ...input.heldoutResiduals[1]!,
          instant: 13_904,
        }
      },
      /instant|order/i,
    ],
    [
      'out-of-range held-out hour',
      (input) => {
        input.heldoutResiduals[1] = {
          ...input.heldoutResiduals[1]!,
          hour: 24,
        }
      },
      /hour|range/i,
    ],
    [
      'named-case residual drift',
      (input) => {
        const index = input.heldoutResiduals.findIndex(
          ({ instant }) => instant === 17_213,
        )
        input.heldoutResiduals[index] = {
          ...input.heldoutResiduals[index]!,
          residual: input.heldoutResiduals[index]!.residual + 1,
        }
      },
      /residual|named|cross-file/i,
    ],
  ]

  for (const [name, mutate, expected] of cases) {
    const input = mutablePackageInput(published)
    mutate(input)
    assert.throws(
      () => createLinearRegressionWorkbenchPackage(input),
      expected,
      name,
    )
  }
})

test('six pure selectors expose exact bounded published rows methods coefficients cases and atemp comparison', () => {
  const published = loadPublishedPackage()
  const summary = published.summary

  const row = selectRowBatchResult(published, 'row')
  assert.equal(row.kind, 'row')
  assert.deepEqual(row.row, summary.representativeTrainingRow)
  const batch = selectRowBatchResult(published, 'batch')
  assert.equal(batch.kind, 'batch')
  assert.deepEqual(batch.featureOrder, summary.features.order)
  assert.deepEqual(batch.trainMetrics, summary.metrics.train)
  assert.deepEqual(batch.testMetrics, summary.metrics.test)
  assert.equal(batch.trainRows, 13_903)
  assert.equal(batch.testRows, 3_476)

  assert.deepEqual(
    selectGradientTracePoint(published, -10),
    published.gradientTrace[0],
  )
  assert.deepEqual(
    selectGradientTracePoint(published, 100),
    published.gradientTrace[100],
  )
  assert.deepEqual(
    selectGradientTracePoint(published, 10_000),
    published.gradientTrace[772],
  )
  assert.throws(
    () => selectGradientTracePoint(published, Number.NaN),
    /finite|integer/i,
  )
  assert.throws(
    () => selectGradientTracePoint(published, 1.5),
    /integer/i,
  )

  for (const method of methodIds) {
    const result = selectMethodResult(published, method)
    const rows = published.coefficients.filter(
      (entry) => entry.method === method && entry.space === 'model',
    )
    assert.deepEqual(
      [result.intercept, ...result.weights],
      rows.map(({ coefficient }) => coefficient),
    )
    assert.deepEqual(result.trainMetrics, summary.metrics.train)
    assert.deepEqual(result.testMetrics, summary.metrics.test)

    const coefficientResult = selectCoefficientResult(
      published,
      method,
      'model',
    )
    assert.deepEqual(coefficientResult.rows, rows)
  }

  const original = selectCoefficientResult(
    published,
    'numpy-lstsq',
    'original-dataset-unit',
  )
  assert.equal(original.rows.length, 6)
  assert.throws(
    () =>
      selectCoefficientResult(
        published,
        'sklearn-linear-regression',
        'original-dataset-unit',
      ),
    /not published|space/i,
  )

  for (const role of namedRoles) {
    const selected = selectHeldoutCase(published, role)
    const summaryCase = summary.diagnostics.namedCases.find(
      (entry) => entry.role === role,
    )!
    const residualRow = published.heldoutResiduals.find(
      (entry) => entry.instant === summaryCase.instant,
    )!
    assert.deepEqual(selected.summaryCase, summaryCase)
    assert.deepEqual(selected.row, residualRow)
  }

  const atemp = selectAtempComparison(published)
  assert.deepEqual(atemp.withoutAtemp.featureOrder, summary.features.order)
  assert.equal(
    atemp.withoutAtemp.tempCoefficient,
    summary.coefficients.modelSpace.weights[0],
  )
  assert.deepEqual(atemp.withoutAtemp.testMetrics, summary.metrics.test)
  assert.deepEqual(
    atemp.withAtemp,
    summary.diagnostics.collinearity.ols,
  )
  assert.deepEqual(atemp.ridge, summary.diagnostics.collinearity.ridge)
  assert.deepEqual(atemp.lasso, summary.diagnostics.collinearity.lasso)

  ;[
    row,
    batch,
    selectGradientTracePoint(published, 100),
    ...methodIds.map((method) => selectMethodResult(published, method)),
    original,
    ...namedRoles.map((role) => selectHeldoutCase(published, role)),
    atemp,
  ].forEach((value) => assertDeepFrozen(value))
})

test('source CSV, strict outputs, selectors, and compact baseline form one audited equality chain', () => {
  const published = loadPublishedPackage()
  const summary = published.summary
  const source = sourceRows()
  const baseline = LINEAR_REGRESSION_PUBLISHED_BASELINE

  assert.deepEqual(baseline.featureOrder, summary.features.order)
  assert.deepEqual(baseline.preprocessing, summary.preprocessing)
  assert.deepEqual(baseline.metrics, summary.metrics)
  assert.deepEqual(
    baseline.representativeRow,
    selectRowBatchResult(published, 'row').row,
  )
  assert.deepEqual(baseline.optimization.result, summary.optimization.result)
  assert.deepEqual(
    baseline.optimization.traceAnchors,
    [0, 100, 386, 772].map((step) =>
      selectGradientTracePoint(published, step)),
  )
  assert.deepEqual(
    baseline.methods,
    methodIds.map((method) => selectMethodResult(published, method)),
  )
  assert.deepEqual(
    baseline.coefficientViews,
    [
      ...methodIds.map((method) =>
        selectCoefficientResult(published, method, 'model')),
      selectCoefficientResult(
        published,
        'numpy-lstsq',
        'original-dataset-unit',
      ),
    ],
  )
  assert.deepEqual(
    baseline.diagnostics.hourlyResiduals,
    summary.diagnostics.hourlyResiduals,
  )
  assert.deepEqual(
    baseline.diagnostics.predictionBins,
    summary.diagnostics.predictionBins,
  )
  assert.deepEqual(
    baseline.diagnostics.namedCases,
    namedRoles.map((role) => selectHeldoutCase(published, role)),
  )
  assert.deepEqual(
    baseline.diagnostics.atempComparison,
    selectAtempComparison(published),
  )
  assert.deepEqual(
    baseline.diagnostics.log1pComparison,
    summary.diagnostics.log1p,
  )

  for (const displayRow of baseline.displayRows) {
    const sourceRow = source.get(displayRow.instant)
    assert.ok(sourceRow, `missing source instant ${displayRow.instant}`)
    assert.equal(displayRow.timestamp.slice(0, 10), sourceRow.dteday)
    assert.equal(displayRow.hour, Number(sourceRow.hr))
    assert.equal(displayRow.actual, Number(sourceRow.cnt))
    assert.deepEqual(displayRow.rawFeatures, {
      temp: Number(sourceRow.temp),
      hum: Number(sourceRow.hum),
      windspeed: Number(sourceRow.windspeed),
      workingday: Number(sourceRow.workingday),
      hr: Number(sourceRow.hr),
    })

    if (displayRow.partition === 'train') {
      assert.deepEqual(displayRow, {
        partition: 'train',
        role: 'representative-training-row',
        instant: summary.representativeTrainingRow.instant,
        timestamp: summary.representativeTrainingRow.timestamp,
        hour: summary.representativeTrainingRow.hour,
        rawFeatures: summary.representativeTrainingRow.rawFeatures,
        actual: summary.representativeTrainingRow.actual,
        prediction: summary.representativeTrainingRow.prediction,
        residual: summary.representativeTrainingRow.residual,
      })
    } else {
      const selected = selectHeldoutCase(published, displayRow.role)
      assert.deepEqual(
        {
          instant: displayRow.instant,
          timestamp: displayRow.timestamp,
          hour: displayRow.hour,
          actual: displayRow.actual,
          prediction: displayRow.prediction,
          residual: displayRow.residual,
        },
        selected.row,
      )
    }
  }

  assertDeepFrozen(baseline)
})

test('all seven synchronous facade snapshots remain numerically identical to the audited baseline', () => {
  const baseline = LINEAR_REGRESSION_PUBLISHED_BASELINE
  const snapshots = simulateLinearRegression({
    scenario: 'linear',
    learningRate: Number.NaN,
    epochs: Number.POSITIVE_INFINITY,
  }).snapshots
  const reference = baseline.methods.find(
    ({ method }) => method === 'numpy-lstsq',
  )!
  const gradientDescent = baseline.methods.find(
    ({ method }) => method === 'numpy-batch-gradient-descent',
  )!

  assert.equal(snapshots.length, 7)
  snapshots.forEach((snapshot, index) => {
    const display = baseline.displayRows[index % baseline.displayRows.length]!
    assert.equal(snapshot.step, index)
    assert.deepEqual(snapshot.derivedMetrics?.weights, reference.weights)
    assert.equal(snapshot.derivedMetrics?.intercept, reference.intercept)
    assert.equal(snapshot.derivedMetrics?.trainMse, baseline.metrics.train.mse)
    assert.equal(snapshot.derivedMetrics?.validationMse, baseline.metrics.test.mse)
    assert.equal(snapshot.derivedMetrics?.mae, baseline.metrics.test.mae)
    assert.equal(snapshot.derivedMetrics?.r2, baseline.metrics.test.r2)
    assert.equal(
      snapshot.derivedMetrics?.gradientNorm,
      gradientDescent.gradientNorm,
    )
    assert.deepEqual(snapshot.selectedObservation, {
      instant: display.instant,
      area: display.hour,
      age: display.rawFeatures.hum,
      actualPrice: display.actual,
      predictedPrice: display.prediction,
      residual: display.residual,
    })
  })

  assert.deepEqual(
    snapshots[1]!.derivedMetrics?.hourlyResidualMeans,
    baseline.diagnostics.hourlyResiduals.map(({ meanResidual }) => meanResidual),
  )
  assert.deepEqual(
    snapshots[2]!.derivedMetrics?.predictionBinResidualStdDev,
    baseline.diagnostics.predictionBins.map(
      ({ residualStdDev }) => residualStdDev,
    ),
  )
  assert.deepEqual(
    snapshots[3]!.derivedMetrics?.baseTempCoefficient,
    baseline.diagnostics.atempComparison.withoutAtemp.tempCoefficient,
  )
  assert.deepEqual(
    snapshots[4]!.derivedMetrics?.namedCaseInstants,
    baseline.diagnostics.namedCases.map(({ row }) => row.instant),
  )
})
