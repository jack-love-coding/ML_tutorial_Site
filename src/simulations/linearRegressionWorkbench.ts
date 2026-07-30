import type {
  LinearRegressionCoefficientRow,
  LinearRegressionGradientTraceRow,
  LinearRegressionLockedSummary,
  LinearRegressionMetricSet,
  LinearRegressionNamedCase,
  LinearRegressionNamedCaseRole,
  LinearRegressionResidualRow,
} from '../data/linearRegressionAssets.ts'

const FEATURE_ORDER = [
  'temp',
  'hum',
  'windspeed',
  'workingday',
  'hr',
] as const
const COEFFICIENT_FEATURES = ['intercept', ...FEATURE_ORDER] as const
const METHOD_IDS = [
  'numpy-batch-gradient-descent',
  'numpy-lstsq',
  'sklearn-linear-regression',
] as const
const NAMED_CASE_ROLES = [
  'negative-prediction',
  'morning-peak-underprediction',
  'evening-peak-underprediction',
  'large-residual',
] as const

export type LinearRegressionMethodId = (typeof METHOD_IDS)[number]
export type LinearRegressionCoefficientSpace =
  | 'model'
  | 'original-dataset-unit'

export interface LinearRegressionWorkbenchPackageInput {
  readonly summary: LinearRegressionLockedSummary
  readonly gradientTrace: readonly LinearRegressionGradientTraceRow[]
  readonly coefficients: readonly LinearRegressionCoefficientRow[]
  readonly heldoutResiduals: readonly LinearRegressionResidualRow[]
}

export interface LinearRegressionWorkbenchPackage {
  readonly summary: LinearRegressionLockedSummary
  readonly gradientTrace: readonly LinearRegressionGradientTraceRow[]
  readonly coefficients: readonly LinearRegressionCoefficientRow[]
  readonly heldoutResiduals: readonly LinearRegressionResidualRow[]
}

export interface LinearRegressionRowResult {
  readonly kind: 'row'
  readonly row: LinearRegressionLockedSummary['representativeTrainingRow']
}

export interface LinearRegressionBatchResult {
  readonly kind: 'batch'
  readonly featureOrder: typeof FEATURE_ORDER
  readonly trainRows: 13_903
  readonly testRows: 3_476
  readonly trainMetrics: LinearRegressionMetricSet
  readonly testMetrics: LinearRegressionMetricSet
}

export interface LinearRegressionMethodResult {
  readonly kind: 'method'
  readonly method: LinearRegressionMethodId
  readonly role: string
  readonly intercept: number
  readonly weights: readonly [number, number, number, number, number]
  readonly trainMetrics: LinearRegressionMetricSet
  readonly testMetrics: LinearRegressionMetricSet
  readonly maxCoefficientDelta: number
  readonly maxPredictionDelta: number
  readonly updates?: number
  readonly gradientNorm?: number
}

export interface LinearRegressionCoefficientResult {
  readonly kind: 'coefficient'
  readonly method: LinearRegressionMethodId
  readonly space: LinearRegressionCoefficientSpace
  readonly featureOrder: typeof COEFFICIENT_FEATURES
  readonly rows: readonly LinearRegressionCoefficientRow[]
}

export interface LinearRegressionHeldoutCaseResult {
  readonly kind: 'heldout-case'
  readonly role: LinearRegressionNamedCaseRole
  readonly summaryCase: LinearRegressionNamedCase
  readonly row: LinearRegressionResidualRow
}

export interface LinearRegressionAtempComparison {
  readonly kind: 'atemp-comparison'
  readonly addedFeature: 'atemp'
  readonly correlation: number
  readonly conditionNumber: number
  readonly withoutAtemp: {
    readonly featureOrder: typeof FEATURE_ORDER
    readonly tempCoefficient: number
    readonly testMetrics: LinearRegressionMetricSet
  }
  readonly withAtemp: Readonly<Record<string, unknown>>
  readonly ridge: Readonly<Record<string, unknown>>
  readonly lasso: Readonly<Record<string, unknown>>
}

export interface LinearRegressionPublishedDisplayRow {
  readonly partition: 'train' | 'held-out'
  readonly role: 'representative-training-row' | LinearRegressionNamedCaseRole
  readonly instant: number
  readonly timestamp: string
  readonly hour: number
  readonly rawFeatures: Readonly<Record<(typeof FEATURE_ORDER)[number], number>>
  readonly actual: number
  readonly prediction: number
  readonly residual: number
}

export interface LinearRegressionPublishedBaseline {
  readonly featureOrder: typeof FEATURE_ORDER
  readonly split: {
    readonly totalRows: 17_379
    readonly trainEndExclusive: 13_903
    readonly testStartInclusive: 13_903
    readonly trainBoundaryInstant: 13_903
    readonly trainBoundaryTimestamp: '2012-08-07 11:00'
    readonly testBoundaryInstant: 13_904
    readonly testBoundaryTimestamp: '2012-08-07 12:00'
  }
  readonly preprocessing: Readonly<Record<string, unknown>>
  readonly metrics: {
    readonly train: LinearRegressionMetricSet
    readonly test: LinearRegressionMetricSet
  }
  readonly representativeRow:
    LinearRegressionLockedSummary['representativeTrainingRow']
  readonly displayRows: readonly LinearRegressionPublishedDisplayRow[]
  readonly optimization: {
    readonly result: Readonly<Record<string, unknown>>
    readonly traceAnchors: readonly LinearRegressionGradientTraceRow[]
  }
  readonly methods: readonly LinearRegressionMethodResult[]
  readonly coefficientViews: readonly LinearRegressionCoefficientResult[]
  readonly diagnostics: {
    readonly hourlyResiduals:
      LinearRegressionLockedSummary['diagnostics']['hourlyResiduals']
    readonly predictionBins:
      LinearRegressionLockedSummary['diagnostics']['predictionBins']
    readonly namedCases: readonly LinearRegressionHeldoutCaseResult[]
    readonly atempComparison: LinearRegressionAtempComparison
    readonly log1pComparison: Readonly<Record<string, unknown>>
  }
}

function fail(message: string): never {
  throw new TypeError(`Invalid linear-regression workbench package: ${message}`)
}

function record(value: unknown, path: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    fail(`${path} must be an object`)
  }
  return value as Record<string, unknown>
}

function finite(value: unknown, path: string): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    fail(`${path} must be finite`)
  }
  return value
}

function integer(value: unknown, path: string): number {
  const parsed = finite(value, path)
  if (!Number.isInteger(parsed)) fail(`${path} must be an integer`)
  return parsed
}

function finiteTree(value: unknown, path = '$'): void {
  if (typeof value === 'number') {
    finite(value, path)
    return
  }
  if (Array.isArray(value)) {
    value.forEach((entry, index) => finiteTree(entry, `${path}[${index}]`))
    return
  }
  if (typeof value === 'object' && value !== null) {
    for (const [key, entry] of Object.entries(value)) {
      finiteTree(entry, `${path}.${key}`)
    }
  }
}

function frozenCopy<T>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => frozenCopy(entry))) as T
  }
  if (typeof value === 'object' && value !== null) {
    return Object.freeze(
      Object.fromEntries(
        Object.entries(value).map(([key, entry]) => [key, frozenCopy(entry)]),
      ),
    ) as T
  }
  return value
}

function exactArray(
  actual: readonly unknown[],
  expected: readonly unknown[],
  path: string,
): void {
  if (
    actual.length !== expected.length
    || actual.some((entry, index) => entry !== expected[index])
  ) {
    fail(`${path} has the wrong order or values`)
  }
}

function exactNumber(
  actual: unknown,
  expected: unknown,
  path: string,
): void {
  finite(actual, path)
  finite(expected, `${path} authority`)
  if (actual !== expected) fail(`${path} has cross-file drift`)
}

function numberArray(value: unknown, path: string, length: number): number[] {
  if (!Array.isArray(value) || value.length !== length) {
    fail(`${path} must contain ${length} values`)
  }
  return value.map((entry, index) => finite(entry, `${path}[${index}]`))
}

function methodAuthority(
  summary: LinearRegressionLockedSummary,
  method: LinearRegressionMethodId,
): {
  intercept: number
  weights: number[]
} {
  const methods = record(summary.methods, '$.summary.methods')
  if (method === 'numpy-batch-gradient-descent') {
    const result = record(
      methods.numpyBatchGradientDescent,
      '$.summary.methods.numpyBatchGradientDescent',
    )
    return {
      intercept: finite(result.intercept, '$.summary.methods.numpyBatchGradientDescent.intercept'),
      weights: numberArray(
        result.weights,
        '$.summary.methods.numpyBatchGradientDescent.weights',
        5,
      ),
    }
  }
  if (method === 'numpy-lstsq') {
    const result = record(
      methods.normalEquation,
      '$.summary.methods.normalEquation',
    )
    return {
      intercept: finite(result.intercept, '$.summary.methods.normalEquation.intercept'),
      weights: numberArray(
        result.weights,
        '$.summary.methods.normalEquation.weights',
        5,
      ),
    }
  }
  const result = record(
    methods.scikitLearnLinearRegression,
    '$.summary.methods.scikitLearnLinearRegression',
  )
  return {
    intercept: finite(
      result.intercept,
      '$.summary.methods.scikitLearnLinearRegression.intercept',
    ),
    weights: numberArray(
      result.weights,
      '$.summary.methods.scikitLearnLinearRegression.weights',
      5,
    ),
  }
}

function expectedCoefficientKeys(): readonly (
  readonly [
    LinearRegressionMethodId,
    LinearRegressionCoefficientSpace,
    (typeof COEFFICIENT_FEATURES)[number],
  ]
)[] {
  return [
    ...METHOD_IDS.flatMap((method) =>
      COEFFICIENT_FEATURES.map(
        (feature) => [method, 'model', feature] as const,
      )),
    ...COEFFICIENT_FEATURES.map(
      (feature) =>
        ['numpy-lstsq', 'original-dataset-unit', feature] as const,
    ),
  ]
}

function validateSummaryShape(summary: LinearRegressionLockedSummary): void {
  finiteTree(summary, '$.summary')
  exactArray(summary.features.order, FEATURE_ORDER, '$.summary.features.order')
  const split = record(summary.split, '$.summary.split')
  if (
    split.trainRows !== 13_903
    || split.testRows !== 3_476
    || split.index !== 13_903
  ) {
    fail('summary split must contain 13,903 training and 3,476 held-out rows')
  }
  if (
    summary.representativeTrainingRow.instant !== 11_550
    || summary.representativeTrainingRow.role
      !== 'representative-training-row'
  ) {
    fail('summary representative row must be instant 11550')
  }
  exactArray(
    summary.diagnostics.namedCases.map(({ role }) => role),
    NAMED_CASE_ROLES,
    '$.summary.diagnostics.namedCases roles',
  )
}

function validateGradientTrace(
  summary: LinearRegressionLockedSummary,
  rows: readonly LinearRegressionGradientTraceRow[],
): void {
  if (rows.length !== 773) fail('gradient trace must contain 773 rows')
  rows.forEach((row, index) => {
    if (integer(row.update, `gradient trace row ${index} update`) !== index) {
      fail(`gradient trace update ${index} is missing, duplicated, or out of order`)
    }
    finite(row.mse, `gradient trace row ${index} MSE`)
    finite(row.gradientNorm, `gradient trace row ${index} gradient norm`)
    finite(row.intercept, `gradient trace row ${index} intercept`)
    numberArray(row.weights, `gradient trace row ${index} weights`, 5)
  })
  const result = record(
    record(summary.optimization, '$.summary.optimization').result,
    '$.summary.optimization.result',
  )
  const last = rows[772]!
  exactNumber(last.mse, result.mse, 'final trace MSE')
  exactNumber(last.gradientNorm, result.gradientNorm, 'final trace gradient norm')
  exactNumber(last.intercept, result.intercept, 'final trace intercept')
  const expectedWeights = numberArray(
    result.weights,
    '$.summary.optimization.result.weights',
    5,
  )
  last.weights.forEach((value, index) =>
    exactNumber(value, expectedWeights[index], `final trace weight ${index}`),
  )
  if (result.updates !== 772) fail('summary optimization updates must equal 772')
}

function validateCoefficients(
  summary: LinearRegressionLockedSummary,
  rows: readonly LinearRegressionCoefficientRow[],
): void {
  if (rows.length !== 24) fail('coefficient table must contain 24 rows')
  const keys = expectedCoefficientKeys()
  rows.forEach((row, index) => {
    const expected = keys[index]!
    if (
      row.method !== expected[0]
      || row.space !== expected[1]
      || row.feature !== expected[2]
    ) {
      fail(`coefficient row ${index} has a missing, duplicate, or wrong key`)
    }
    finite(row.coefficient, `coefficient row ${index}`)
  })

  for (const method of METHOD_IDS) {
    const authority = methodAuthority(summary, method)
    const methodRows = rows.filter(
      (row) => row.method === method && row.space === 'model',
    )
    const expected = [authority.intercept, ...authority.weights]
    methodRows.forEach((row, index) =>
      exactNumber(
        row.coefficient,
        expected[index],
        `${method} model coefficient ${row.feature}`,
      ),
    )
  }

  const original = record(
    record(summary.coefficients, '$.summary.coefficients').originalDatasetUnits,
    '$.summary.coefficients.originalDatasetUnits',
  )
  const originalExpected = [
    finite(original.intercept, '$.summary.coefficients.originalDatasetUnits.intercept'),
    ...numberArray(
      original.weights,
      '$.summary.coefficients.originalDatasetUnits.weights',
      5,
    ),
  ]
  rows
    .filter((row) => row.space === 'original-dataset-unit')
    .forEach((row, index) =>
      exactNumber(
        row.coefficient,
        originalExpected[index],
        `original-unit coefficient ${row.feature}`,
      ),
    )
}

function validateHeldoutResiduals(
  summary: LinearRegressionLockedSummary,
  rows: readonly LinearRegressionResidualRow[],
): void {
  if (rows.length !== 3_476) fail('held-out residual table must contain 3476 rows')
  rows.forEach((row, index) => {
    if (integer(row.instant, `held-out row ${index} instant`) !== 13_904 + index) {
      fail(`held-out instant ${13_904 + index} is missing, duplicated, or out of order`)
    }
    const hour = integer(row.hour, `held-out row ${index} hour`)
    if (hour < 0 || hour > 23) fail(`held-out row ${index} hour is out of range`)
    finite(row.actual, `held-out row ${index} actual`)
    finite(row.prediction, `held-out row ${index} prediction`)
    finite(row.residual, `held-out row ${index} residual`)
    if (Math.abs(row.residual - (row.prediction - row.actual)) > 1e-9) {
      fail(`held-out row ${index} residual must equal prediction - actual`)
    }
  })

  summary.diagnostics.namedCases.forEach((summaryCase) => {
    const residual = rows[summaryCase.instant - 13_904]
    if (!residual) fail(`named case ${summaryCase.instant} is missing`)
    if (
      residual.instant !== summaryCase.instant
      || residual.timestamp !== summaryCase.timestamp
      || residual.hour !== summaryCase.hour
    ) {
      fail(`named case ${summaryCase.instant} identity has cross-file drift`)
    }
    exactNumber(
      residual.actual,
      summaryCase.actual,
      `named case ${summaryCase.instant} actual`,
    )
    exactNumber(
      residual.prediction,
      summaryCase.prediction,
      `named case ${summaryCase.instant} prediction`,
    )
    exactNumber(
      residual.residual,
      summaryCase.residual,
      `named case ${summaryCase.instant} residual`,
    )
  })
}

export function createLinearRegressionWorkbenchPackage(
  input: LinearRegressionWorkbenchPackageInput,
): LinearRegressionWorkbenchPackage {
  if (typeof input !== 'object' || input === null || Array.isArray(input)) {
    fail('input must be an object')
  }
  validateSummaryShape(input.summary)
  validateGradientTrace(input.summary, input.gradientTrace)
  validateCoefficients(input.summary, input.coefficients)
  validateHeldoutResiduals(input.summary, input.heldoutResiduals)

  return frozenCopy({
    summary: input.summary,
    gradientTrace: input.gradientTrace,
    coefficients: input.coefficients,
    heldoutResiduals: input.heldoutResiduals,
  })
}

export function selectRowBatchResult(
  workbench: LinearRegressionWorkbenchPackage,
  mode: 'row',
): LinearRegressionRowResult
export function selectRowBatchResult(
  workbench: LinearRegressionWorkbenchPackage,
  mode: 'batch',
): LinearRegressionBatchResult
export function selectRowBatchResult(
  workbench: LinearRegressionWorkbenchPackage,
  mode: 'row' | 'batch',
): LinearRegressionRowResult | LinearRegressionBatchResult {
  if (mode === 'row') {
    return frozenCopy({
      kind: 'row' as const,
      row: workbench.summary.representativeTrainingRow,
    })
  }
  if (mode !== 'batch') fail(`unknown row/batch mode ${String(mode)}`)
  return frozenCopy({
    kind: 'batch' as const,
    featureOrder: FEATURE_ORDER,
    trainRows: 13_903 as const,
    testRows: 3_476 as const,
    trainMetrics: workbench.summary.metrics.train,
    testMetrics: workbench.summary.metrics.test,
  })
}

export function selectGradientTracePoint(
  workbench: LinearRegressionWorkbenchPackage,
  step: number,
): LinearRegressionGradientTraceRow {
  if (!Number.isFinite(step) || !Number.isInteger(step)) {
    throw new RangeError('gradient trace step must be a finite integer')
  }
  const bounded = Math.max(0, Math.min(772, step))
  return frozenCopy(workbench.gradientTrace[bounded]!)
}

export function selectMethodResult(
  workbench: LinearRegressionWorkbenchPackage,
  method: LinearRegressionMethodId,
): LinearRegressionMethodResult {
  if (!METHOD_IDS.includes(method)) {
    fail(`unknown published method ${String(method)}`)
  }
  const summary = workbench.summary
  const authority = methodAuthority(summary, method)
  const methods = record(summary.methods, '$.summary.methods')
  const roles = record(methods.roles, '$.summary.methods.roles')
  const agreement = record(methods.agreement, '$.summary.methods.agreement')
  const byMethod = record(agreement.byMethod, '$.summary.methods.agreement.byMethod')
  const summaryKey =
    method === 'numpy-batch-gradient-descent'
      ? 'numpyBatchGradientDescent'
      : method === 'numpy-lstsq'
        ? 'numpyLstsq'
        : 'sklearnLinearRegression'
  const roleKey =
    method === 'numpy-batch-gradient-descent'
      ? 'numpyBatchGradientDescent'
      : method === 'numpy-lstsq'
        ? 'normalEquation'
        : 'scikitLearnLinearRegression'
  const deltas = record(byMethod[summaryKey], `$.summary.methods.agreement.byMethod.${summaryKey}`)
  const result: LinearRegressionMethodResult = {
    kind: 'method',
    method,
    role: String(roles[roleKey]),
    intercept: authority.intercept,
    weights: authority.weights as [number, number, number, number, number],
    trainMetrics: summary.metrics.train,
    testMetrics: summary.metrics.test,
    maxCoefficientDelta: finite(
      deltas.maxCoefficientDelta,
      `${method} max coefficient delta`,
    ),
    maxPredictionDelta: finite(
      deltas.maxPredictionDelta,
      `${method} max prediction delta`,
    ),
    ...(method === 'numpy-batch-gradient-descent'
      ? {
          updates: integer(
            record(
              record(summary.optimization, '$.summary.optimization').result,
              '$.summary.optimization.result',
            ).updates,
            '$.summary.optimization.result.updates',
          ),
          gradientNorm: finite(
            record(
              record(summary.optimization, '$.summary.optimization').result,
              '$.summary.optimization.result',
            ).gradientNorm,
            '$.summary.optimization.result.gradientNorm',
          ),
        }
      : {}),
  }
  return frozenCopy(result)
}

export function selectCoefficientResult(
  workbench: LinearRegressionWorkbenchPackage,
  method: LinearRegressionMethodId,
  space: LinearRegressionCoefficientSpace,
): LinearRegressionCoefficientResult {
  if (!METHOD_IDS.includes(method)) {
    fail(`unknown published method ${String(method)}`)
  }
  if (space !== 'model' && space !== 'original-dataset-unit') {
    fail(`unknown coefficient space ${String(space)}`)
  }
  if (space === 'original-dataset-unit' && method !== 'numpy-lstsq') {
    fail(`coefficient space ${space} is not published for ${method}`)
  }
  const rows = workbench.coefficients.filter(
    (row) => row.method === method && row.space === space,
  )
  if (rows.length !== 6) fail(`coefficient space ${space} is not published for ${method}`)
  return frozenCopy({
    kind: 'coefficient' as const,
    method,
    space,
    featureOrder: COEFFICIENT_FEATURES,
    rows,
  })
}

export function selectHeldoutCase(
  workbench: LinearRegressionWorkbenchPackage,
  role: LinearRegressionNamedCaseRole,
): LinearRegressionHeldoutCaseResult {
  if (!NAMED_CASE_ROLES.includes(role)) {
    fail(`unknown held-out case role ${String(role)}`)
  }
  const summaryCase = workbench.summary.diagnostics.namedCases.find(
    (entry) => entry.role === role,
  )
  if (!summaryCase) fail(`held-out case ${role} is not published`)
  const row = workbench.heldoutResiduals[summaryCase.instant - 13_904]
  if (!row || row.instant !== summaryCase.instant) {
    fail(`held-out case ${role} is not published`)
  }
  return frozenCopy({
    kind: 'heldout-case' as const,
    role,
    summaryCase,
    row,
  })
}

export function selectAtempComparison(
  workbench: LinearRegressionWorkbenchPackage,
): LinearRegressionAtempComparison {
  const summary = workbench.summary
  const collinearity = record(
    summary.diagnostics.collinearity,
    '$.summary.diagnostics.collinearity',
  )
  const baseCoefficients = record(
    record(summary.coefficients, '$.summary.coefficients').modelSpace,
    '$.summary.coefficients.modelSpace',
  )
  const weights = numberArray(
    baseCoefficients.weights,
    '$.summary.coefficients.modelSpace.weights',
    5,
  )
  return frozenCopy({
    kind: 'atemp-comparison' as const,
    addedFeature: 'atemp' as const,
    correlation: finite(
      collinearity.tempAtempTrainingCorrelation,
      '$.summary.diagnostics.collinearity.tempAtempTrainingCorrelation',
    ),
    conditionNumber: finite(
      collinearity.conditionNumber,
      '$.summary.diagnostics.collinearity.conditionNumber',
    ),
    withoutAtemp: {
      featureOrder: FEATURE_ORDER,
      tempCoefficient: weights[0]!,
      testMetrics: summary.metrics.test,
    },
    withAtemp: record(
      collinearity.ols,
      '$.summary.diagnostics.collinearity.ols',
    ),
    ridge: record(
      collinearity.ridge,
      '$.summary.diagnostics.collinearity.ridge',
    ),
    lasso: record(
      collinearity.lasso,
      '$.summary.diagnostics.collinearity.lasso',
    ),
  })
}

export const LINEAR_REGRESSION_PUBLISHED_BASELINE: LinearRegressionPublishedBaseline =
  frozenCopy({
    featureOrder: FEATURE_ORDER,
    split: {
      totalRows: 17_379,
      trainEndExclusive: 13_903,
      testStartInclusive: 13_903,
      trainBoundaryInstant: 13_903,
      trainBoundaryTimestamp: '2012-08-07 11:00',
      testBoundaryInstant: 13_904,
      testBoundaryTimestamp: '2012-08-07 12:00',
    },
    preprocessing: {
      ddof: 0,
      fitPartition: 'train-only',
      means: {
        hr: 11.546572682154931,
        hum: 0.6229957563115874,
        temp: 0.4991699633172697,
        windspeed: 0.1940965906638855,
      },
      scales: {
        hr: 6.911986603994767,
        hum: 0.19818719663596795,
        temp: 0.197709028770319,
        windspeed: 0.12301877862112308,
      },
      standardized: ['temp', 'hum', 'windspeed', 'hr'],
      unscaled: ['workingday'],
    },
    metrics: {
      train: {
        mae: 98.80005326431211,
        mse: 18105.236540017046,
        r2: 0.35041732905011236,
      },
      test: {
        mae: 135.2966403773854,
        mse: 40142.538618835824,
        r2: 0.17425214066245964,
      },
    },
    representativeRow: {
      actual: 174,
      explanationRole: {
        en: 'ordinary training row inside the inclusive target IQR',
        'zh-CN': '训练目标四分位区间内的普通训练行',
      },
      hour: 10,
      instant: 11550,
      lossContribution: 0.000033141687275224924,
      prediction: 173.9942431182681,
      rawFeatures: {
        hr: 10,
        hum: 0.78,
        temp: 0.62,
        windspeed: 0.2537,
        workingday: 1,
      },
      residual: -0.0057568817319122445,
      role: 'representative-training-row',
      timestamp: '2012-05-01 10:00',
      transformedValues: [
        0.6111508282360743,
        0.7922017484146537,
        0.4845065932550254,
        1,
        -0.22375226845218318,
      ],
      unaveragedInterceptGradientContribution: -0.011513763463824489,
      unaveragedWeightGradientContribution: [
        -0.007036646077030587,
        -0.00912122354687452,
        -0.0055784943114017835,
        -0.011513763463824489,
        0.002576230693452596,
      ],
    },
    displayRows: [
      {
        partition: 'train',
        role: 'representative-training-row',
        instant: 11550,
        timestamp: '2012-05-01 10:00',
        hour: 10,
        rawFeatures: {
          temp: 0.62,
          hum: 0.78,
          windspeed: 0.2537,
          workingday: 1,
          hr: 10,
        },
        actual: 174,
        prediction: 173.9942431182681,
        residual: -0.0057568817319122445,
      },
      {
        partition: 'held-out',
        role: 'negative-prediction',
        instant: 17213,
        timestamp: '2012-12-25 00:00',
        hour: 0,
        rawFeatures: {
          temp: 0.24,
          hum: 0.93,
          windspeed: 0.0896,
          workingday: 0,
          hr: 0,
        },
        actual: 13,
        prediction: -47.41549314522561,
        residual: -60.41549314522561,
      },
      {
        partition: 'held-out',
        role: 'morning-peak-underprediction',
        instant: 15628,
        timestamp: '2012-10-18 08:00',
        hour: 8,
        rawFeatures: {
          temp: 0.46,
          hum: 0.82,
          windspeed: 0.2537,
          workingday: 1,
          hr: 8,
        },
        actual: 834,
        prediction: 101.88209657050064,
        residual: -732.1179034294994,
      },
      {
        partition: 'held-out',
        role: 'evening-peak-underprediction',
        instant: 14965,
        timestamp: '2012-09-20 17:00',
        hour: 17,
        rawFeatures: {
          temp: 0.64,
          hum: 0.5,
          windspeed: 0.2239,
          workingday: 1,
          hr: 17,
        },
        actual: 976,
        prediction: 281.0929017808493,
        residual: -694.9070982191507,
      },
      {
        partition: 'held-out',
        role: 'large-residual',
        instant: 15604,
        timestamp: '2012-10-17 08:00',
        hour: 8,
        rawFeatures: {
          temp: 0.4,
          hum: 0.76,
          windspeed: 0,
          workingday: 1,
          hr: 8,
        },
        actual: 817,
        prediction: 92.41434915378804,
        residual: -724.5856508462119,
      },
    ],
    optimization: {
      result: {
        gradientNorm: 9.964423234025087e-9,
        intercept: 173.01032847247703,
        mse: 18105.236540017046,
        reason: 'gradient-tolerance',
        updates: 772,
        weights: [
          62.72389095222884,
          -37.11641560255006,
          0.8094458659955012,
          2.3797187057642537,
          47.90143384324225,
        ],
      },
      traceAnchors: [
        {
          update: 0,
          mse: 58370.9353376969,
          gradientNorm: 482.1558909149629,
          intercept: 0,
          weights: [0, 0, 0, 0, 0],
        },
        {
          update: 100,
          mse: 18110.808824970136,
          gradientNorm: 1.7622102048764967,
          intercept: 169.07529456603126,
          weights: [
            62.58363271903595,
            -37.19571205166403,
            0.7802091944935706,
            7.3278689082737625,
            47.89847458098204,
          ],
        },
        {
          update: 386,
          mse: 18105.23654054885,
          gradientNorm: 0.0005443977071649829,
          intercept: 173.00911284894244,
          weights: [
            62.72384762313346,
            -37.11644010042273,
            0.8094368332184656,
            2.3812473045135802,
            47.90143292836109,
          ],
        },
        {
          update: 772,
          mse: 18105.236540017046,
          gradientNorm: 9.964423234025087e-9,
          intercept: 173.01032847247703,
          weights: [
            62.72389095222884,
            -37.11641560255006,
            0.8094458659955012,
            2.3797187057642537,
            47.90143384324225,
          ],
        },
      ],
    },
    methods: [
      {
        kind: 'method',
        method: 'numpy-batch-gradient-descent',
        role: 'transparent iterative parameter learning',
        intercept: 173.01032847247703,
        weights: [
          62.72389095222884,
          -37.11641560255006,
          0.8094458659955012,
          2.3797187057642537,
          47.90143384324225,
        ],
        trainMetrics: {
          mae: 98.80005326431211,
          mse: 18105.236540017046,
          r2: 0.35041732905011236,
        },
        testMetrics: {
          mae: 135.2966403773854,
          mse: 40142.538618835824,
          r2: 0.17425214066245964,
        },
        maxCoefficientDelta: 2.7979374817022062e-8,
        maxPredictionDelta: 2.3821542072255397e-8,
        updates: 772,
        gradientNorm: 9.964423234025087e-9,
      },
      {
        kind: 'method',
        method: 'numpy-lstsq',
        role: 'non-iterative numerical reference',
        intercept: 173.01032849472756,
        weights: [
          62.72389095302256,
          -37.11641560210167,
          0.8094458661608451,
          2.379718677784879,
          47.90143384325898,
        ],
        trainMetrics: {
          mae: 98.80005326431211,
          mse: 18105.236540017046,
          r2: 0.35041732905011236,
        },
        testMetrics: {
          mae: 135.2966403773854,
          mse: 40142.538618835824,
          r2: 0.17425214066245964,
        },
        maxCoefficientDelta: 0,
        maxPredictionDelta: 0,
      },
      {
        kind: 'method',
        method: 'sklearn-linear-regression',
        role: 'practical API counterpart',
        intercept: 173.01032849472747,
        weights: [
          62.72389095302207,
          -37.11641560210158,
          0.8094458661608551,
          2.379718677784892,
          47.90143384325902,
        ],
        trainMetrics: {
          mae: 98.80005326431211,
          mse: 18105.236540017046,
          r2: 0.35041732905011236,
        },
        testMetrics: {
          mae: 135.2966403773854,
          mse: 40142.538618835824,
          r2: 0.17425214066245964,
        },
        maxCoefficientDelta: 4.902744876744691e-13,
        maxPredictionDelta: 1.1937117960769683e-12,
      },
    ],
    coefficientViews: [
      {
        kind: 'coefficient',
        method: 'numpy-batch-gradient-descent',
        space: 'model',
        featureOrder: COEFFICIENT_FEATURES,
        rows: [
          { method: 'numpy-batch-gradient-descent', space: 'model', feature: 'intercept', coefficient: 173.01032847247703 },
          { method: 'numpy-batch-gradient-descent', space: 'model', feature: 'temp', coefficient: 62.72389095222884 },
          { method: 'numpy-batch-gradient-descent', space: 'model', feature: 'hum', coefficient: -37.11641560255006 },
          { method: 'numpy-batch-gradient-descent', space: 'model', feature: 'windspeed', coefficient: 0.8094458659955012 },
          { method: 'numpy-batch-gradient-descent', space: 'model', feature: 'workingday', coefficient: 2.3797187057642537 },
          { method: 'numpy-batch-gradient-descent', space: 'model', feature: 'hr', coefficient: 47.90143384324225 },
        ],
      },
      {
        kind: 'coefficient',
        method: 'numpy-lstsq',
        space: 'model',
        featureOrder: COEFFICIENT_FEATURES,
        rows: [
          { method: 'numpy-lstsq', space: 'model', feature: 'intercept', coefficient: 173.01032849472756 },
          { method: 'numpy-lstsq', space: 'model', feature: 'temp', coefficient: 62.72389095302256 },
          { method: 'numpy-lstsq', space: 'model', feature: 'hum', coefficient: -37.11641560210167 },
          { method: 'numpy-lstsq', space: 'model', feature: 'windspeed', coefficient: 0.8094458661608451 },
          { method: 'numpy-lstsq', space: 'model', feature: 'workingday', coefficient: 2.379718677784879 },
          { method: 'numpy-lstsq', space: 'model', feature: 'hr', coefficient: 47.90143384325898 },
        ],
      },
      {
        kind: 'coefficient',
        method: 'sklearn-linear-regression',
        space: 'model',
        featureOrder: COEFFICIENT_FEATURES,
        rows: [
          { method: 'sklearn-linear-regression', space: 'model', feature: 'intercept', coefficient: 173.01032849472747 },
          { method: 'sklearn-linear-regression', space: 'model', feature: 'temp', coefficient: 62.72389095302207 },
          { method: 'sklearn-linear-regression', space: 'model', feature: 'hum', coefficient: -37.11641560210158 },
          { method: 'sklearn-linear-regression', space: 'model', feature: 'windspeed', coefficient: 0.8094458661608551 },
          { method: 'sklearn-linear-regression', space: 'model', feature: 'workingday', coefficient: 2.379718677784892 },
          { method: 'sklearn-linear-regression', space: 'model', feature: 'hr', coefficient: 47.90143384325902 },
        ],
      },
      {
        kind: 'coefficient',
        method: 'numpy-lstsq',
        space: 'original-dataset-unit',
        featureOrder: COEFFICIENT_FEATURES,
        rows: [
          { method: 'numpy-lstsq', space: 'original-dataset-unit', feature: 'intercept', coefficient: 50.024112570538804 },
          { method: 'numpy-lstsq', space: 'original-dataset-unit', feature: 'temp', coefficient: 317.2535485260497 },
          { method: 'numpy-lstsq', space: 'original-dataset-unit', feature: 'hum', coefficient: -187.27958330364518 },
          { method: 'numpy-lstsq', space: 'original-dataset-unit', feature: 'windspeed', coefficient: 6.579856142563411 },
          { method: 'numpy-lstsq', space: 'original-dataset-unit', feature: 'workingday', coefficient: 2.379718677784879 },
          { method: 'numpy-lstsq', space: 'original-dataset-unit', feature: 'hr', coefficient: 6.930197725726849 },
        ],
      },
    ],
    diagnostics: {
      hourlyResiduals: [
        { hour: 0, meanResidual: -3.2463370859235 },
        { hour: 1, meanResidual: 22.936304990011212 },
        { hour: 2, meanResidual: 41.94603712196218 },
        { hour: 3, meanResidual: 59.66158979626279 },
        { hour: 4, meanResidual: 68.67689561006367 },
        { hour: 5, meanResidual: 54.25567926484808 },
        { hour: 6, meanResidual: -13.214120130446865 },
        { hour: 7, meanResidual: -187.98396758214403 },
        { hour: 8, meanResidual: -367.4186505830957 },
        { hour: 9, meanResidual: -151.62692454370102 },
        { hour: 10, meanResidual: -68.78015398005495 },
        { hour: 11, meanResidual: -95.36522898884218 },
        { hour: 12, meanResidual: -140.83856461047577 },
        { hour: 13, meanResidual: -121.25896038613298 },
        { hour: 14, meanResidual: -90.13186764884213 },
        { hour: 15, meanResidual: -102.17404996557661 },
        { hour: 16, meanResidual: -181.23350542588165 },
        { hour: 17, meanResidual: -366.62932250017235 },
        { hour: 18, meanResidual: -309.9133738415724 },
        { hour: 19, meanResidual: -159.4391588846088 },
        { hour: 20, meanResidual: -49.898555874689656 },
        { hour: 21, meanResidual: 19.939028860317457 },
        { hour: 22, meanResidual: 70.74865584624081 },
        { hour: 23, meanResidual: 118.14198706242688 },
      ],
      predictionBins: [
        { bin: 1, lowerPrediction: -47.41549314522561, mae: 78.37824477958097, residualStdDev: 135.91482837639265, rows: 869, upperPrediction: 96.97911541513608 },
        { bin: 2, lowerPrediction: 96.97911541513608, mae: 133.92574957460522, residualStdDev: 185.60313200813465, rows: 869, upperPrediction: 167.16999158611748 },
        { bin: 3, lowerPrediction: 167.16999158611748, mae: 147.17724489009004, residualStdDev: 176.64915258125393, rows: 869, upperPrediction: 237.22183873773776 },
        { bin: 4, lowerPrediction: 237.22183873773776, mae: 181.70532226526527, residualStdDev: 209.11251335664963, rows: 869, upperPrediction: 399.9190105447821 },
      ],
      namedCases: [
        {
          kind: 'heldout-case',
          role: 'negative-prediction',
          summaryCase: {
            actual: 13,
            explanationRole: { en: 'lowest raw-count prediction', 'zh-CN': '最低原始租车数预测' },
            hour: 0,
            instant: 17213,
            prediction: -47.41549314522561,
            residual: -60.41549314522561,
            role: 'negative-prediction',
            timestamp: '2012-12-25 00:00',
          },
          row: {
            instant: 17213,
            timestamp: '2012-12-25 00:00',
            hour: 0,
            actual: 13,
            prediction: -47.41549314522561,
            residual: -60.41549314522561,
          },
        },
        {
          kind: 'heldout-case',
          role: 'morning-peak-underprediction',
          summaryCase: {
            actual: 834,
            explanationRole: { en: 'largest positive morning actual-minus-prediction gap', 'zh-CN': '早高峰最大的实际值减预测值正差距' },
            hour: 8,
            instant: 15628,
            prediction: 101.88209657050064,
            residual: -732.1179034294994,
            role: 'morning-peak-underprediction',
            timestamp: '2012-10-18 08:00',
          },
          row: {
            instant: 15628,
            timestamp: '2012-10-18 08:00',
            hour: 8,
            actual: 834,
            prediction: 101.88209657050064,
            residual: -732.1179034294994,
          },
        },
        {
          kind: 'heldout-case',
          role: 'evening-peak-underprediction',
          summaryCase: {
            actual: 976,
            explanationRole: { en: 'largest positive evening actual-minus-prediction gap', 'zh-CN': '晚高峰最大的实际值减预测值正差距' },
            hour: 17,
            instant: 14965,
            prediction: 281.0929017808493,
            residual: -694.9070982191507,
            role: 'evening-peak-underprediction',
            timestamp: '2012-09-20 17:00',
          },
          row: {
            instant: 14965,
            timestamp: '2012-09-20 17:00',
            hour: 17,
            actual: 976,
            prediction: 281.0929017808493,
            residual: -694.9070982191507,
          },
        },
        {
          kind: 'heldout-case',
          role: 'large-residual',
          summaryCase: {
            actual: 817,
            explanationRole: { en: 'largest remaining absolute residual', 'zh-CN': '排除前三行后的最大绝对残差' },
            hour: 8,
            instant: 15604,
            prediction: 92.41434915378804,
            residual: -724.5856508462119,
            role: 'large-residual',
            timestamp: '2012-10-17 08:00',
          },
          row: {
            instant: 15604,
            timestamp: '2012-10-17 08:00',
            hour: 8,
            actual: 817,
            prediction: 92.41434915378804,
            residual: -724.5856508462119,
          },
        },
      ],
      atempComparison: {
        kind: 'atemp-comparison',
        addedFeature: 'atemp',
        correlation: 0.9923834525986027,
        conditionNumber: 17.240661944055777,
        withoutAtemp: {
          featureOrder: FEATURE_ORDER,
          tempCoefficient: 62.72389095302256,
          testMetrics: {
            mae: 135.2966403773854,
            mse: 40142.538618835824,
            r2: 0.17425214066245964,
          },
        },
        withAtemp: {
          atempCoefficient: 48.79910362080849,
          baseTestMse: 40142.538618835824,
          intercept: 173.24875000976766,
          objective: 'mse',
          perturbationL2: 0.027800000019931593,
          tempCoefficient: 14.34341206288322,
          testMetrics: {
            mae: 134.94919421066695,
            mse: 40092.502084990534,
            r2: 0.17528141190770252,
          },
          weights: [
            14.34341206288322,
            48.79910362080849,
            -37.493405807939375,
            2.5456912679964874,
            2.0313817375153307,
            47.72922519993564,
          ],
        },
        ridge: {
          alpha: 300,
          intercept: 173.3023587222597,
          objective: 'mse-plus-l2',
          perturbationL2: 0.009139999925777954,
          testMetrics: {
            mae: 135.205290304801,
            mse: 40163.590785440996,
            r2: 0.17381908928836243,
          },
          weights: [
            27.24156234461552,
            35.36283275243259,
            -36.78111538500926,
            2.301706458671119,
            1.9530587100062409,
            46.95543100049867,
          ],
        },
        lasso: {
          alpha: 0.1,
          intercept: 173.56018336807387,
          objective: 'mse-plus-l1',
          sameObjectiveAsOls: false,
          testMetrics: {
            mae: 134.9779396858657,
            mse: 40103.63455273307,
            r2: 0.17505241265344929,
          },
          weights: [
            14.56277083657803,
            48.498629072342396,
            -37.43082425704814,
            2.45931991908017,
            1.5763735428403947,
            47.66884256805156,
          ],
        },
      },
      log1pComparison: {
        coefficientScale: 'log1p-rental-count',
        intercept: 4.5243866871376355,
        inverseTransform: 'expm1',
        inverseTransformedCountMetrics: {
          mae: 155.52129519755852,
          mse: 52330.26740534246,
          r2: -0.07645424966339065,
        },
        logSpaceMetrics: {
          mae: 0.9343322223193253,
          mse: 1.2691771381360377,
          r2: 0.3559768700481879,
        },
        rawTargetObjectiveComparable: false,
        targetTransform: 'log1p',
        weights: [
          0.45948715199351015,
          -0.2571503352331541,
          0.013913634032088007,
          -0.037467134459753595,
          0.6647188626577636,
        ],
      },
    },
  })
