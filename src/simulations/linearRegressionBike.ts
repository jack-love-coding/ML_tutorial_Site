import { LINEAR_REGRESSION_PUBLISHED_BASELINE } from './linearRegressionWorkbench.ts'

export const LINEAR_REGRESSION_FEATURE_ORDER = Object.freeze([
  'temp',
  'hum',
  'windspeed',
  'workingday',
  'hr',
] as const)

export const LINEAR_REGRESSION_CONTINUOUS_FEATURES = Object.freeze([
  'temp',
  'hum',
  'windspeed',
  'hr',
] as const)

export type RegressionFeature = (typeof LINEAR_REGRESSION_FEATURE_ORDER)[number]
export type RegressionContinuousFeature =
  (typeof LINEAR_REGRESSION_CONTINUOUS_FEATURES)[number]

export interface RegressionRow {
  readonly featureOrder: readonly string[]
  readonly values: readonly number[]
}

export interface RegressionPreprocessing {
  readonly featureOrder: readonly string[]
  readonly continuousFeatures: readonly string[]
  readonly means: Readonly<Record<RegressionContinuousFeature, number>>
  readonly scales: Readonly<Record<RegressionContinuousFeature, number>>
}

export interface RegressionMetrics {
  readonly mse: number
  readonly mae: number
  readonly r2: number
}

export interface RegressionBatchEvaluation extends RegressionMetrics {
  readonly predictions: readonly number[]
  readonly residuals: readonly number[]
}

export interface RegressionGradient {
  readonly mse: number
  readonly weightGradient: readonly number[]
  readonly interceptGradient: number
  readonly gradientNorm: number
}

export interface RegressionTracePoint {
  readonly update: number
  readonly mse: number
  readonly gradientNorm: number
  readonly weights: readonly number[]
  readonly intercept: number
}

export interface RegressionFit {
  readonly method: string
  readonly weights: readonly number[]
  readonly intercept: number
  readonly trainMetrics: RegressionMetrics
  readonly testMetrics: RegressionMetrics
}

export interface RegressionGradientDescentOptions {
  readonly learningRate?: number
  readonly maxUpdates?: number
  readonly gradientTolerance?: number
  readonly initialWeights?: readonly number[]
  readonly initialIntercept?: number
}

export interface RegressionGradientDescentResult {
  readonly method: 'batch-gradient-descent'
  readonly weights: readonly number[]
  readonly intercept: number
  readonly updates: number
  readonly mse: number
  readonly gradientNorm: number
  readonly reason: 'gradient-tolerance' | 'update-cap'
  readonly trace: readonly RegressionTracePoint[]
}

export interface RegressionMethodResult {
  readonly method: 'batch-gradient-descent' | 'normal-equation' | 'scikit-learn'
  readonly weights: readonly number[]
  readonly intercept: number
  readonly maxCoefficientDelta: number
  readonly maxPredictionDelta: number
  readonly updates?: number
  readonly gradientNorm?: number
}

export interface RegressionMethodComparison {
  readonly tolerance: number
  readonly gradientDescent: RegressionMethodResult
  readonly normalEquation: RegressionMethodResult
  readonly scikitLearn: RegressionMethodResult
}

export interface RegressionMethodAgreement {
  readonly agrees: boolean
  readonly tolerance: number
  readonly maxCoefficientDelta: number
  readonly maxPredictionDelta: number
}

export interface HourlyResidualSummary {
  readonly hour: number
  readonly meanResidual: number
}

export interface PredictionBinSpread {
  readonly bin: number
  readonly residualStdDev: number
  readonly mae: number
}

export type NamedHeldoutCaseRole =
  | 'negative-prediction'
  | 'morning-peak-underprediction'
  | 'evening-peak-underprediction'
  | 'large-residual'

export interface NamedHeldoutCase {
  readonly role: NamedHeldoutCaseRole
  readonly instant: number
  readonly hour: number
  readonly prediction: number
  readonly actual: number
  readonly residual: number
}

export interface CoefficientStabilitySummary {
  readonly baseTemp: number
  readonly atempOlsTemp: number
  readonly atempOlsAtemp: number
  readonly baseTestMse: number
  readonly atempTestMse: number
  readonly ridgeAlpha: number
  readonly olsPerturbationL2: number
  readonly ridgePerturbationL2: number
  readonly ridgeObjective: 'mse-plus-l2'
  readonly lassoObjective: 'mse-plus-l1'
}

export interface Log1pComparison {
  readonly rawTargetScale: 'rental-count'
  readonly transformedTargetScale: 'log1p-rental-count'
  readonly inverseTransformRequiredForCountMetrics: true
}

export interface HeldoutDiagnosticInput {
  readonly hourlyResiduals: readonly HourlyResidualSummary[]
  readonly predictionBins: readonly PredictionBinSpread[]
  readonly namedCases: readonly NamedHeldoutCase[]
  readonly coefficientStability: CoefficientStabilitySummary
  readonly log1pComparison: Log1pComparison
}

export interface HeldoutDiagnostics extends HeldoutDiagnosticInput {
  readonly stagedOrder: readonly [
    'optimization-complete',
    'hourly-residual-shape',
    'prediction-bin-spread',
    'coefficient-stability',
    'named-heldout-cases',
    'log1p-comparison',
    'combined-review',
  ]
}

const MAX_REGRESSION_ROWS = 20_000
const MAX_GD_UPDATES = 5_000

function immutableVector(values: readonly number[]): readonly number[] {
  return Object.freeze(values.map(Number))
}

function immutableMetrics(metrics: RegressionMetrics): RegressionMetrics {
  return Object.freeze({
    mse: metrics.mse,
    mae: metrics.mae,
    r2: metrics.r2,
  })
}

function assertFiniteNumber(value: number, name: string): void {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} must be finite.`)
  }
}

function assertFiniteResult(value: number, name: string): number {
  if (!Number.isFinite(value)) {
    throw new RangeError(`${name} is not finite for the supplied inputs.`)
  }
  return value
}

function assertPositiveFinite(value: number, name: string): void {
  assertFiniteNumber(value, name)
  if (value <= 0) {
    throw new RangeError(`${name} must be greater than zero.`)
  }
}

function assertExactOrder(
  actual: readonly string[],
  expected: readonly string[],
  name: string,
): void {
  if (!Array.isArray(actual)) {
    throw new TypeError(`${name} must be an array.`)
  }
  if (
    actual.length !== expected.length
    || actual.some((feature, index) => feature !== expected[index])
  ) {
    throw new TypeError(`${name} must be exactly ${expected.join(', ')}.`)
  }
}

function assertWeights(weights: readonly number[]): void {
  if (!Array.isArray(weights) || weights.length !== LINEAR_REGRESSION_FEATURE_ORDER.length) {
    throw new RangeError(
      `weights must contain ${LINEAR_REGRESSION_FEATURE_ORDER.length} values.`,
    )
  }
  weights.forEach((weight, index) => assertFiniteNumber(weight, `weight ${index}`))
}

function assertRegressionRow(row: RegressionRow, index?: number): void {
  const label = index === undefined ? 'row' : `row ${index}`
  if (row === null || typeof row !== 'object' || Array.isArray(row)) {
    throw new TypeError(`${label} must be a regression row object.`)
  }
  assertExactOrder(row.featureOrder, LINEAR_REGRESSION_FEATURE_ORDER, `${label} feature order`)
  if (!Array.isArray(row.values) || row.values.length !== LINEAR_REGRESSION_FEATURE_ORDER.length) {
    throw new RangeError(
      `${label} must contain ${LINEAR_REGRESSION_FEATURE_ORDER.length} values.`,
    )
  }
  row.values.forEach((value, valueIndex) =>
    assertFiniteNumber(value, `${label} value ${valueIndex}`),
  )
  if (row.values[3] !== 0 && row.values[3] !== 1) {
    throw new RangeError(`${label} workingday must be 0 or 1.`)
  }
}

function assertRegressionBatch(
  rows: readonly RegressionRow[],
  targets?: readonly number[],
): void {
  if (!Array.isArray(rows) || rows.length === 0) {
    throw new RangeError('regression rows must be a non-empty array.')
  }
  if (rows.length > MAX_REGRESSION_ROWS) {
    throw new RangeError(`regression rows cannot exceed ${MAX_REGRESSION_ROWS}.`)
  }
  rows.forEach((row, index) => assertRegressionRow(row, index))
  if (targets !== undefined) {
    if (!Array.isArray(targets) || targets.length !== rows.length) {
      throw new RangeError('targets must have the same non-empty length as rows.')
    }
    targets.forEach((target, index) => assertFiniteNumber(target, `target ${index}`))
  }
}

function finiteMean(values: readonly number[], name: string): number {
  return assertFiniteResult(
    values.reduce((sum, value) => assertFiniteResult(sum + value / values.length, name), 0),
    name,
  )
}

function immutableRow(row: RegressionRow): RegressionRow {
  return Object.freeze({
    featureOrder: Object.freeze([...row.featureOrder]),
    values: immutableVector(row.values),
  })
}

export const LINEAR_REGRESSION_SPLIT =
  LINEAR_REGRESSION_PUBLISHED_BASELINE.split

const PUBLISHED_PREPROCESSING =
  LINEAR_REGRESSION_PUBLISHED_BASELINE.preprocessing as {
    readonly means: Readonly<Record<RegressionContinuousFeature, number>>
    readonly scales: Readonly<Record<RegressionContinuousFeature, number>>
  }

export const LINEAR_REGRESSION_PREPROCESSING: RegressionPreprocessing = Object.freeze({
  featureOrder: LINEAR_REGRESSION_FEATURE_ORDER,
  continuousFeatures: LINEAR_REGRESSION_CONTINUOUS_FEATURES,
  means: PUBLISHED_PREPROCESSING.means,
  scales: PUBLISHED_PREPROCESSING.scales,
})

export function transformRegressionRow(
  rawValues: Readonly<Record<RegressionFeature, number>>,
  preprocessing: RegressionPreprocessing = LINEAR_REGRESSION_PREPROCESSING,
): RegressionRow {
  if (rawValues === null || typeof rawValues !== 'object' || Array.isArray(rawValues)) {
    throw new TypeError('raw regression values must be an object.')
  }
  assertPreprocessing(preprocessing)

  const values = LINEAR_REGRESSION_FEATURE_ORDER.map((feature) => {
    const value = rawValues[feature]
    assertFiniteNumber(value, feature)
    if (feature === 'workingday') {
      if (value !== 0 && value !== 1) {
        throw new RangeError('workingday must be 0 or 1.')
      }
      return value
    }
    const continuousFeature = feature as RegressionContinuousFeature
    return assertFiniteResult(
      (value - preprocessing.means[continuousFeature])
        / preprocessing.scales[continuousFeature],
      `${feature} standardized value`,
    )
  })

  return immutableRow({
    featureOrder: LINEAR_REGRESSION_FEATURE_ORDER,
    values,
  })
}

export function predictRegressionRow(
  row: RegressionRow,
  weights: readonly number[],
  intercept: number,
): number {
  assertRegressionRow(row)
  assertWeights(weights)
  assertFiniteNumber(intercept, 'intercept')

  return row.values.reduce(
    (prediction, value, index) =>
      assertFiniteResult(
        prediction + assertFiniteResult(value * weights[index]!, `row product ${index}`),
        'row prediction',
      ),
    intercept,
  )
}

export function predictRegressionBatch(
  rows: readonly RegressionRow[],
  weights: readonly number[],
  intercept: number,
): readonly number[] {
  assertRegressionBatch(rows)
  assertWeights(weights)
  assertFiniteNumber(intercept, 'intercept')
  return Object.freeze(
    rows.map((row) => predictRegressionRow(row, weights, intercept)),
  )
}

export function evaluateRegressionBatch(
  rows: readonly RegressionRow[],
  targets: readonly number[],
  weights: readonly number[],
  intercept: number,
): RegressionBatchEvaluation {
  assertRegressionBatch(rows, targets)
  const predictions = predictRegressionBatch(rows, weights, intercept)
  const residuals = predictions.map((prediction, index) =>
    assertFiniteResult(prediction - targets[index]!, `residual ${index}`),
  )
  const squaredResiduals = residuals.map((residual, index) =>
    assertFiniteResult(residual * residual, `squared residual ${index}`),
  )
  const mse = finiteMean(squaredResiduals, 'MSE')
  const mae = finiteMean(
    residuals.map((residual) => Math.abs(residual)),
    'MAE',
  )
  const targetMean = finiteMean(targets, 'target mean')
  const totalSquares = targets.reduce((sum, target, index) => {
    const centered = assertFiniteResult(target - targetMean, `centered target ${index}`)
    return assertFiniteResult(sum + centered * centered, 'target total squares')
  }, 0)
  if (totalSquares === 0) {
    throw new RangeError('R2 requires non-zero target variance.')
  }
  const residualSquares = squaredResiduals.reduce(
    (sum, value) => assertFiniteResult(sum + value, 'residual squares'),
    0,
  )
  const r2 = assertFiniteResult(1 - residualSquares / totalSquares, 'R2')

  return Object.freeze({
    predictions: Object.freeze([...predictions]),
    residuals: Object.freeze(residuals),
    mse,
    mae,
    r2,
  })
}

export function computeMseGradient(
  rows: readonly RegressionRow[],
  targets: readonly number[],
  weights: readonly number[],
  intercept: number,
): RegressionGradient {
  assertRegressionBatch(rows, targets)
  const predictions = predictRegressionBatch(rows, weights, intercept)
  const residuals = predictions.map((prediction, index) =>
    assertFiniteResult(prediction - targets[index]!, `residual ${index}`),
  )
  const scale = 2 / rows.length
  const weightGradient = weights.map((_, featureIndex) =>
    assertFiniteResult(
      scale * residuals.reduce(
        (sum, residual, rowIndex) =>
          assertFiniteResult(
            sum + residual * rows[rowIndex]!.values[featureIndex]!,
            `weight gradient ${featureIndex}`,
          ),
        0,
      ),
      `weight gradient ${featureIndex}`,
    ),
  )
  const interceptGradient = assertFiniteResult(
    scale * residuals.reduce(
      (sum, residual) => assertFiniteResult(sum + residual, 'intercept gradient'),
      0,
    ),
    'intercept gradient',
  )
  const mse = finiteMean(
    residuals.map((residual, index) =>
      assertFiniteResult(residual * residual, `squared residual ${index}`),
    ),
    'MSE',
  )
  const gradientNorm = assertFiniteResult(
    Math.hypot(...weightGradient, interceptGradient),
    'gradient norm',
  )

  return Object.freeze({
    mse,
    weightGradient: Object.freeze(weightGradient),
    interceptGradient,
    gradientNorm,
  })
}

export function batchGradientStep(
  rows: readonly RegressionRow[],
  targets: readonly number[],
  weights: readonly number[],
  intercept: number,
  learningRate: number,
): Readonly<{
  weights: readonly number[]
  intercept: number
  gradient: RegressionGradient
}> {
  assertPositiveFinite(learningRate, 'learning rate')
  const gradient = computeMseGradient(rows, targets, weights, intercept)
  const nextWeights = weights.map((weight, index) =>
    assertFiniteResult(
      weight - learningRate * gradient.weightGradient[index]!,
      `next weight ${index}`,
    ),
  )
  const nextIntercept = assertFiniteResult(
    intercept - learningRate * gradient.interceptGradient,
    'next intercept',
  )

  return Object.freeze({
    weights: Object.freeze(nextWeights),
    intercept: nextIntercept,
    gradient,
  })
}

export function runBatchGradientDescent(
  rows: readonly RegressionRow[],
  targets: readonly number[],
  options: RegressionGradientDescentOptions = {},
): RegressionGradientDescentResult {
  assertRegressionBatch(rows, targets)
  const learningRate = options.learningRate ?? 0.1
  const maxUpdates = options.maxUpdates ?? MAX_GD_UPDATES
  const gradientTolerance = options.gradientTolerance ?? 1e-8
  assertPositiveFinite(learningRate, 'learning rate')
  assertPositiveFinite(gradientTolerance, 'gradient tolerance')
  if (
    !Number.isInteger(maxUpdates)
    || maxUpdates <= 0
    || maxUpdates > MAX_GD_UPDATES
  ) {
    throw new RangeError(`max updates must be an integer from 1 to ${MAX_GD_UPDATES}.`)
  }

  let weights = options.initialWeights
    ? [...options.initialWeights]
    : LINEAR_REGRESSION_FEATURE_ORDER.map(() => 0)
  assertWeights(weights)
  let intercept = options.initialIntercept ?? 0
  assertFiniteNumber(intercept, 'initial intercept')
  const trace: RegressionTracePoint[] = []

  for (let update = 0; update <= maxUpdates; update += 1) {
    const gradient = computeMseGradient(rows, targets, weights, intercept)
    trace.push(Object.freeze({
      update,
      mse: gradient.mse,
      gradientNorm: gradient.gradientNorm,
      weights: immutableVector(weights),
      intercept,
    }))

    if (gradient.gradientNorm <= gradientTolerance) {
      return Object.freeze({
        method: 'batch-gradient-descent',
        weights: immutableVector(weights),
        intercept,
        updates: update,
        mse: gradient.mse,
        gradientNorm: gradient.gradientNorm,
        reason: 'gradient-tolerance',
        trace: Object.freeze(trace),
      })
    }

    if (update === maxUpdates) {
      return Object.freeze({
        method: 'batch-gradient-descent',
        weights: immutableVector(weights),
        intercept,
        updates: update,
        mse: gradient.mse,
        gradientNorm: gradient.gradientNorm,
        reason: 'update-cap',
        trace: Object.freeze(trace),
      })
    }

    const next = batchGradientStep(rows, targets, weights, intercept, learningRate)
    weights = [...next.weights]
    intercept = next.intercept
  }

  throw new RangeError('gradient descent reached an unreachable state.')
}

function assertPreprocessing(preprocessing: RegressionPreprocessing): void {
  if (
    preprocessing === null
    || typeof preprocessing !== 'object'
    || Array.isArray(preprocessing)
  ) {
    throw new TypeError('preprocessing must be an object.')
  }
  assertExactOrder(
    preprocessing.featureOrder,
    LINEAR_REGRESSION_FEATURE_ORDER,
    'preprocessing feature order',
  )
  assertExactOrder(
    preprocessing.continuousFeatures,
    LINEAR_REGRESSION_CONTINUOUS_FEATURES,
    'preprocessing continuous features',
  )
  LINEAR_REGRESSION_CONTINUOUS_FEATURES.forEach((feature) => {
    assertFiniteNumber(preprocessing.means[feature], `${feature} mean`)
    assertPositiveFinite(preprocessing.scales[feature], `${feature} scale`)
  })
  if (
    Object.hasOwn(preprocessing.means, 'workingday')
    || Object.hasOwn(preprocessing.scales, 'workingday')
  ) {
    throw new TypeError('workingday must not be standardized.')
  }
}

export function convertRegressionCoefficients(
  weights: readonly number[],
  intercept: number,
  preprocessing: RegressionPreprocessing = LINEAR_REGRESSION_PREPROCESSING,
): Readonly<{ weights: readonly number[]; intercept: number }> {
  assertWeights(weights)
  assertFiniteNumber(intercept, 'intercept')
  assertPreprocessing(preprocessing)

  let originalIntercept = intercept
  const originalWeights = LINEAR_REGRESSION_FEATURE_ORDER.map((feature, index) => {
    const weight = weights[index]!
    if (feature === 'workingday') return weight
    const continuousFeature = feature as RegressionContinuousFeature
    const scale = preprocessing.scales[continuousFeature]
    const converted = assertFiniteResult(weight / scale, `${feature} original coefficient`)
    originalIntercept = assertFiniteResult(
      originalIntercept - weight * preprocessing.means[continuousFeature] / scale,
      'original intercept',
    )
    return converted
  })

  return Object.freeze({
    weights: Object.freeze(originalWeights),
    intercept: originalIntercept,
  })
}

export function createPublishedRegressionReferenceFit(): RegressionFit {
  const reference = LINEAR_REGRESSION_PUBLISHED_BASELINE.methods.find(
    ({ method }) => method === 'numpy-lstsq',
  )
  if (!reference) {
    throw new TypeError('Published NumPy least-squares result is missing.')
  }
  return Object.freeze({
    method: 'numpy-lstsq-reference',
    weights: immutableVector(reference.weights),
    intercept: reference.intercept,
    trainMetrics: immutableMetrics(reference.trainMetrics),
    testMetrics: immutableMetrics(reference.testMetrics),
  })
}

export function createPublishedRegressionMethodComparison():
RegressionMethodComparison {
  const methods = LINEAR_REGRESSION_PUBLISHED_BASELINE.methods
  const gradientDescent = methods.find(
    ({ method }) => method === 'numpy-batch-gradient-descent',
  )
  const normalEquation = methods.find(
    ({ method }) => method === 'numpy-lstsq',
  )
  const scikitLearn = methods.find(
    ({ method }) => method === 'sklearn-linear-regression',
  )
  if (!gradientDescent || !normalEquation || !scikitLearn) {
    throw new TypeError('Published three-method comparison is incomplete.')
  }
  return Object.freeze({
    tolerance: 1e-6,
    gradientDescent: Object.freeze({
      method: 'batch-gradient-descent',
      weights: immutableVector(gradientDescent.weights),
      intercept: gradientDescent.intercept,
      updates: gradientDescent.updates,
      gradientNorm: gradientDescent.gradientNorm,
      maxCoefficientDelta: gradientDescent.maxCoefficientDelta,
      maxPredictionDelta: gradientDescent.maxPredictionDelta,
    }),
    normalEquation: Object.freeze({
      method: 'normal-equation',
      weights: immutableVector(normalEquation.weights),
      intercept: normalEquation.intercept,
      maxCoefficientDelta: normalEquation.maxCoefficientDelta,
      maxPredictionDelta: normalEquation.maxPredictionDelta,
    }),
    scikitLearn: Object.freeze({
      method: 'scikit-learn',
      weights: immutableVector(scikitLearn.weights),
      intercept: scikitLearn.intercept,
      maxCoefficientDelta: scikitLearn.maxCoefficientDelta,
      maxPredictionDelta: scikitLearn.maxPredictionDelta,
    }),
  })
}

function assertMethodResult(result: RegressionMethodResult, name: string): void {
  if (result === null || typeof result !== 'object' || Array.isArray(result)) {
    throw new TypeError(`${name} must be an object.`)
  }
  assertWeights(result.weights)
  assertFiniteNumber(result.intercept, `${name} intercept`)
  assertFiniteNumber(result.maxCoefficientDelta, `${name} coefficient delta`)
  assertFiniteNumber(result.maxPredictionDelta, `${name} prediction delta`)
  if (result.maxCoefficientDelta < 0 || result.maxPredictionDelta < 0) {
    throw new RangeError(`${name} deltas cannot be negative.`)
  }
  if (result.updates !== undefined) {
    if (!Number.isInteger(result.updates) || result.updates < 0 || result.updates > MAX_GD_UPDATES) {
      throw new RangeError(`${name} updates are invalid.`)
    }
  }
  if (result.gradientNorm !== undefined) {
    assertFiniteNumber(result.gradientNorm, `${name} gradient norm`)
    if (result.gradientNorm < 0) {
      throw new RangeError(`${name} gradient norm cannot be negative.`)
    }
  }
}

export function compareRegressionMethods(
  comparison: RegressionMethodComparison,
): RegressionMethodAgreement {
  if (comparison === null || typeof comparison !== 'object' || Array.isArray(comparison)) {
    throw new TypeError('method comparison must be an object.')
  }
  assertPositiveFinite(comparison.tolerance, 'method tolerance')
  assertMethodResult(comparison.gradientDescent, 'gradient descent')
  assertMethodResult(comparison.normalEquation, 'normal equation')
  assertMethodResult(comparison.scikitLearn, 'scikit-learn')
  const maxCoefficientDelta = Math.max(
    comparison.gradientDescent.maxCoefficientDelta,
    comparison.normalEquation.maxCoefficientDelta,
    comparison.scikitLearn.maxCoefficientDelta,
  )
  const maxPredictionDelta = Math.max(
    comparison.gradientDescent.maxPredictionDelta,
    comparison.normalEquation.maxPredictionDelta,
    comparison.scikitLearn.maxPredictionDelta,
  )

  return Object.freeze({
    agrees:
      maxCoefficientDelta <= comparison.tolerance
      && maxPredictionDelta <= comparison.tolerance,
    tolerance: comparison.tolerance,
    maxCoefficientDelta,
    maxPredictionDelta,
  })
}

const EXPECTED_CASE_ROLES = Object.freeze([
  'negative-prediction',
  'morning-peak-underprediction',
  'evening-peak-underprediction',
  'large-residual',
] as const)

export function createPublishedHeldoutDiagnosticInput(): HeldoutDiagnosticInput {
  const diagnostics = LINEAR_REGRESSION_PUBLISHED_BASELINE.diagnostics
  const atemp = diagnostics.atempComparison
  const withAtemp = atemp.withAtemp as {
    readonly tempCoefficient: number
    readonly atempCoefficient: number
    readonly perturbationL2: number
    readonly testMetrics: { readonly mse: number }
  }
  const ridge = atemp.ridge as {
    readonly alpha: number
    readonly perturbationL2: number
    readonly objective: 'mse-plus-l2'
  }
  const lasso = atemp.lasso as {
    readonly objective: 'mse-plus-l1'
  }

  return Object.freeze({
    hourlyResiduals: Object.freeze(
      diagnostics.hourlyResiduals.map(({ hour, meanResidual }) =>
        Object.freeze({ hour, meanResidual })),
    ),
    predictionBins: Object.freeze(
      diagnostics.predictionBins.map(({ bin, residualStdDev, mae }) =>
        Object.freeze({ bin, residualStdDev, mae })),
    ),
    namedCases: Object.freeze(
      diagnostics.namedCases.map(({ role, row }) =>
        Object.freeze({
          role,
          instant: row.instant,
          hour: row.hour,
          prediction: row.prediction,
          actual: row.actual,
          residual: row.residual,
        })),
    ),
    coefficientStability: Object.freeze({
      baseTemp: atemp.withoutAtemp.tempCoefficient,
      atempOlsTemp: withAtemp.tempCoefficient,
      atempOlsAtemp: withAtemp.atempCoefficient,
      baseTestMse: atemp.withoutAtemp.testMetrics.mse,
      atempTestMse: withAtemp.testMetrics.mse,
      ridgeAlpha: ridge.alpha,
      olsPerturbationL2: withAtemp.perturbationL2,
      ridgePerturbationL2: ridge.perturbationL2,
      ridgeObjective: ridge.objective,
      lassoObjective: lasso.objective,
    }),
    log1pComparison: Object.freeze({
      rawTargetScale: 'rental-count',
      transformedTargetScale: 'log1p-rental-count',
      inverseTransformRequiredForCountMetrics: true,
    }),
  })
}

function assertHeldoutDiagnosticInput(input: HeldoutDiagnosticInput): void {
  if (input === null || typeof input !== 'object' || Array.isArray(input)) {
    throw new TypeError('held-out diagnostic input must be an object.')
  }
  if (!Array.isArray(input.hourlyResiduals) || input.hourlyResiduals.length === 0) {
    throw new RangeError('hourly residual summaries must be non-empty.')
  }
  if (input.hourlyResiduals.length > 24) {
    throw new RangeError('hourly residual summaries cannot exceed 24 rows.')
  }
  const seenHours = new Set<number>()
  input.hourlyResiduals.forEach((summary, index) => {
    if (!Number.isInteger(summary.hour) || summary.hour < 0 || summary.hour > 23) {
      throw new RangeError(`hourly residual ${index} has an invalid hour.`)
    }
    if (seenHours.has(summary.hour)) {
      throw new RangeError(`hourly residual hour ${summary.hour} is duplicated.`)
    }
    seenHours.add(summary.hour)
    assertFiniteNumber(summary.meanResidual, `hourly residual ${index}`)
  })
  if (!Array.isArray(input.predictionBins) || input.predictionBins.length < 2) {
    throw new RangeError('prediction spread requires at least two bins.')
  }
  if (input.predictionBins.length > 20) {
    throw new RangeError('prediction spread cannot exceed 20 bins.')
  }
  input.predictionBins.forEach((summary, index) => {
    if (!Number.isInteger(summary.bin) || summary.bin !== index + 1) {
      throw new RangeError('prediction bins must be ordered consecutive integers from 1.')
    }
    assertFiniteNumber(summary.residualStdDev, `prediction bin ${index} standard deviation`)
    assertFiniteNumber(summary.mae, `prediction bin ${index} MAE`)
    if (summary.residualStdDev < 0 || summary.mae < 0) {
      throw new RangeError('prediction-bin spread values cannot be negative.')
    }
  })
  if (
    !Array.isArray(input.namedCases)
    || input.namedCases.length !== EXPECTED_CASE_ROLES.length
  ) {
    throw new RangeError(`named cases must contain ${EXPECTED_CASE_ROLES.length} rows.`)
  }
  input.namedCases.forEach((namedCase, index) => {
    if (namedCase.role !== EXPECTED_CASE_ROLES[index]) {
      throw new TypeError('named held-out case roles must use the locked order.')
    }
    if (!Number.isInteger(namedCase.instant) || namedCase.instant <= 0) {
      throw new RangeError(`named case ${index} instant is invalid.`)
    }
    if (!Number.isInteger(namedCase.hour) || namedCase.hour < 0 || namedCase.hour > 23) {
      throw new RangeError(`named case ${index} hour is invalid.`)
    }
    assertFiniteNumber(namedCase.prediction, `named case ${index} prediction`)
    assertFiniteNumber(namedCase.actual, `named case ${index} actual`)
    assertFiniteNumber(namedCase.residual, `named case ${index} residual`)
    const expectedResidual = assertFiniteResult(
      namedCase.prediction - namedCase.actual,
      `named case ${index} expected residual`,
    )
    if (Math.abs(expectedResidual - namedCase.residual) > 1e-12) {
      throw new RangeError(`named case ${index} residual must equal prediction minus actual.`)
    }
  })

  const stability = input.coefficientStability
  if (stability === null || typeof stability !== 'object' || Array.isArray(stability)) {
    throw new TypeError('coefficient stability must be an object.')
  }
  ;[
    stability.baseTemp,
    stability.atempOlsTemp,
    stability.atempOlsAtemp,
    stability.baseTestMse,
    stability.atempTestMse,
    stability.ridgeAlpha,
    stability.olsPerturbationL2,
    stability.ridgePerturbationL2,
  ].forEach((value, index) => assertFiniteNumber(value, `coefficient stability value ${index}`))
  if (stability.ridgeAlpha <= 0) {
    throw new RangeError('Ridge alpha must be positive.')
  }
  if (
    stability.ridgeObjective !== 'mse-plus-l2'
    || stability.lassoObjective !== 'mse-plus-l1'
  ) {
    throw new TypeError('Ridge and Lasso objectives must remain distinct from OLS.')
  }

  if (
    input.log1pComparison?.rawTargetScale !== 'rental-count'
    || input.log1pComparison.transformedTargetScale !== 'log1p-rental-count'
    || input.log1pComparison.inverseTransformRequiredForCountMetrics !== true
  ) {
    throw new TypeError('log1p comparison must preserve explicit target-scale labels.')
  }
}

export function deriveHeldoutDiagnostics(
  input: HeldoutDiagnosticInput,
): HeldoutDiagnostics {
  assertHeldoutDiagnosticInput(input)

  return Object.freeze({
    hourlyResiduals: Object.freeze(
      input.hourlyResiduals.map((summary) => Object.freeze({ ...summary })),
    ),
    predictionBins: Object.freeze(
      input.predictionBins.map((summary) => Object.freeze({ ...summary })),
    ),
    namedCases: Object.freeze(
      input.namedCases.map((namedCase) => Object.freeze({ ...namedCase })),
    ),
    coefficientStability: Object.freeze({ ...input.coefficientStability }),
    log1pComparison: Object.freeze({ ...input.log1pComparison }),
    stagedOrder: Object.freeze([
      'optimization-complete',
      'hourly-residual-shape',
      'prediction-bin-spread',
      'coefficient-stability',
      'named-heldout-cases',
      'log1p-comparison',
      'combined-review',
    ] as const),
  })
}
