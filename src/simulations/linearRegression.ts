import type {
  ExperimentConfig,
  ModuleSimulation,
  MultivariateRegressionSample,
  RegressionMeta,
  TrainingSnapshot,
} from '../types/ml'
import {
  LINEAR_REGRESSION_FEATURE_ORDER,
  LINEAR_REGRESSION_HELDOUT_DIAGNOSTIC_INPUT,
  LINEAR_REGRESSION_METHOD_COMPARISON,
  LINEAR_REGRESSION_REFERENCE_FIT,
  compareRegressionMethods,
  convertRegressionCoefficients,
  deriveHeldoutDiagnostics,
  predictRegressionRow,
  transformRegressionRow,
  type RegressionFeature,
} from './linearRegressionBike.ts'

type LinearRegressionScenario =
  | 'linear'
  | 'curved'
  | 'multivariate'
  | 'polynomial'
  | 'overfit'
  | 'regularized'

const LINEAR_REGRESSION_SCENARIOS = new Set<LinearRegressionScenario>([
  'linear',
  'curved',
  'multivariate',
  'polynomial',
  'overfit',
  'regularized',
])

const BIKE_REGRESSION_META: RegressionMeta = Object.freeze({
  xLabel: Object.freeze({ 'zh-CN': '小时', en: 'Hour' }),
  yLabel: Object.freeze({ 'zh-CN': '租车次数', en: 'Rental count' }),
  xUnit: Object.freeze({ 'zh-CN': '时', en: 'hour' }),
  yUnit: Object.freeze({ 'zh-CN': '次', en: 'rentals' }),
  sampleLabel: Object.freeze({ 'zh-CN': '小时记录', en: 'Hourly record' }),
  sourceName: 'UCI Bike Sharing Dataset',
  sourceUrl: 'https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset',
  featureName: LINEAR_REGRESSION_FEATURE_ORDER.join(', '),
  targetName: 'cnt',
  datasetSize: 17_379,
  featureCount: LINEAR_REGRESSION_FEATURE_ORDER.length,
})

interface BikeDisplayRecord extends Readonly<Record<RegressionFeature, number>> {
  readonly instant: number
  readonly cnt: number
}

const BIKE_DISPLAY_RECORDS: readonly BikeDisplayRecord[] = Object.freeze([
  Object.freeze({
    instant: 13_904,
    temp: 0.74,
    hum: 0.62,
    windspeed: 0.1642,
    workingday: 1,
    hr: 12,
    cnt: 445,
  }),
  Object.freeze({
    instant: 14_965,
    temp: 0.72,
    hum: 0.54,
    windspeed: 0.2239,
    workingday: 1,
    hr: 17,
    cnt: 700,
  }),
  Object.freeze({
    instant: 15_604,
    temp: 0.52,
    hum: 0.83,
    windspeed: 0.0896,
    workingday: 1,
    hr: 18,
    cnt: 900,
  }),
  Object.freeze({
    instant: 15_628,
    temp: 0.5,
    hum: 0.72,
    windspeed: 0.1343,
    workingday: 1,
    hr: 8,
    cnt: 600,
  }),
  Object.freeze({
    instant: 16_420,
    temp: 0.42,
    hum: 0.77,
    windspeed: 0.1045,
    workingday: 0,
    hr: 14,
    cnt: 281,
  }),
  Object.freeze({
    instant: 17_213,
    temp: 0.24,
    hum: 0.87,
    windspeed: 0.194,
    workingday: 1,
    hr: 4,
    cnt: 7,
  }),
])

const METHOD_AGREEMENT = compareRegressionMethods(
  LINEAR_REGRESSION_METHOD_COMPARISON,
)
const HELDOUT_DIAGNOSTICS = deriveHeldoutDiagnostics(
  LINEAR_REGRESSION_HELDOUT_DIAGNOSTIC_INPUT,
)
const ORIGINAL_COEFFICIENTS = convertRegressionCoefficients(
  LINEAR_REGRESSION_REFERENCE_FIT.weights,
  LINEAR_REGRESSION_REFERENCE_FIT.intercept,
)

const DISPLAY_ROWS = Object.freeze(
  BIKE_DISPLAY_RECORDS.map((record) => {
    const row = transformRegressionRow(record)
    const prediction = predictRegressionRow(
      row,
      LINEAR_REGRESSION_REFERENCE_FIT.weights,
      LINEAR_REGRESSION_REFERENCE_FIT.intercept,
    )
    return Object.freeze({
      ...record,
      row,
      prediction,
      residual: prediction - record.cnt,
    })
  }),
)

const REGRESSION_SAMPLES = Object.freeze(
  DISPLAY_ROWS.map((record) =>
    Object.freeze({
      x: record.hr,
      y: record.cnt,
      split: 'validation' as const,
    }),
  ),
)

const FIT_CURVE = Object.freeze(
  Array.from({ length: 24 }, (_value, hour) => {
    const row = transformRegressionRow({
      temp: 0.4991699633,
      hum: 0.6229957563,
      windspeed: 0.1940965907,
      workingday: 1,
      hr: hour,
    })
    return Object.freeze({
      x: hour,
      y: predictRegressionRow(
        row,
        LINEAR_REGRESSION_REFERENCE_FIT.weights,
        LINEAR_REGRESSION_REFERENCE_FIT.intercept,
      ),
    })
  }),
)

const MULTIVARIATE_SAMPLES: readonly MultivariateRegressionSample[] = Object.freeze(
  DISPLAY_ROWS.map((record) =>
    Object.freeze({
      area: record.temp,
      age: record.hum,
      price: record.cnt,
      split: 'validation' as const,
    }),
  ),
)

const MULTIVARIATE_RESIDUALS = Object.freeze(
  DISPLAY_ROWS.map((record) =>
    Object.freeze({
      area: record.temp,
      age: record.hum,
      actualPrice: record.cnt,
      predictedPrice: record.prediction,
      residual: record.residual,
    }),
  ),
)

function asScenario(value: ExperimentConfig[string]): LinearRegressionScenario {
  const scenario = String(value ?? 'linear') as LinearRegressionScenario
  return LINEAR_REGRESSION_SCENARIOS.has(scenario) ? scenario : 'linear'
}

function commonMetrics(
  scenario: LinearRegressionScenario,
): Record<string, number | string | boolean | number[] | string[]> {
  return {
    scenario,
    dataSource: 'uci-bike-sharing',
    mse: LINEAR_REGRESSION_REFERENCE_FIT.testMetrics.mse,
    trainMse: LINEAR_REGRESSION_REFERENCE_FIT.trainMetrics.mse,
    validationMse: LINEAR_REGRESSION_REFERENCE_FIT.testMetrics.mse,
    mae: LINEAR_REGRESSION_REFERENCE_FIT.testMetrics.mae,
    r2: LINEAR_REGRESSION_REFERENCE_FIT.testMetrics.r2,
    weights: [...LINEAR_REGRESSION_REFERENCE_FIT.weights],
    intercept: LINEAR_REGRESSION_REFERENCE_FIT.intercept,
    gradientNorm: LINEAR_REGRESSION_METHOD_COMPARISON.gradientDescent.gradientNorm ?? 0,
    updates: LINEAR_REGRESSION_METHOD_COMPARISON.gradientDescent.updates ?? 0,
    gdMaxCoefficientDelta:
      LINEAR_REGRESSION_METHOD_COMPARISON.gradientDescent.maxCoefficientDelta,
    normalEquationMaxCoefficientDelta:
      LINEAR_REGRESSION_METHOD_COMPARISON.normalEquation.maxCoefficientDelta,
    sklearnMaxCoefficientDelta:
      LINEAR_REGRESSION_METHOD_COMPARISON.scikitLearn.maxCoefficientDelta,
    methodTolerance: METHOD_AGREEMENT.tolerance,
    methodsAgree: METHOD_AGREEMENT.agrees,
    modelComplexity: LINEAR_REGRESSION_FEATURE_ORDER.length,
    weightNorm: Math.hypot(...LINEAR_REGRESSION_REFERENCE_FIT.weights),
    activeWeights: LINEAR_REGRESSION_REFERENCE_FIT.weights.length,
    regularizationPenalty: 0,
    regularizationType: scenario === 'regularized' ? 'l2' : 'none',
    statusKey: 'optimization-complete',
  }
}

function stageMetrics(
  scenario: LinearRegressionScenario,
  stage: (typeof HELDOUT_DIAGNOSTICS.stagedOrder)[number],
): Record<string, number | string | boolean | number[] | string[]> {
  const metrics = {
    ...commonMetrics(scenario),
    diagnosticStage: stage,
  }

  if (stage === 'hourly-residual-shape') {
    return {
      ...metrics,
      hourlyResidualHours: HELDOUT_DIAGNOSTICS.hourlyResiduals.map(({ hour }) => hour),
      hourlyResidualMeans: HELDOUT_DIAGNOSTICS.hourlyResiduals.map(
        ({ meanResidual }) => meanResidual,
      ),
    }
  }

  if (stage === 'prediction-bin-spread') {
    return {
      ...metrics,
      predictionBinIds: HELDOUT_DIAGNOSTICS.predictionBins.map(({ bin }) => bin),
      predictionBinResidualStdDev: HELDOUT_DIAGNOSTICS.predictionBins.map(
        ({ residualStdDev }) => residualStdDev,
      ),
      predictionBinMae: HELDOUT_DIAGNOSTICS.predictionBins.map(({ mae }) => mae),
    }
  }

  if (stage === 'coefficient-stability') {
    const stability = HELDOUT_DIAGNOSTICS.coefficientStability
    return {
      ...metrics,
      baseTempCoefficient: stability.baseTemp,
      atempOlsTempCoefficient: stability.atempOlsTemp,
      atempOlsAtempCoefficient: stability.atempOlsAtemp,
      baseTestMse: stability.baseTestMse,
      atempTestMse: stability.atempTestMse,
      ridgeAlpha: stability.ridgeAlpha,
      ridgeObjective: stability.ridgeObjective,
      lassoObjective: stability.lassoObjective,
    }
  }

  if (stage === 'named-heldout-cases') {
    return {
      ...metrics,
      namedCaseInstants: HELDOUT_DIAGNOSTICS.namedCases.map(({ instant }) => instant),
      namedCaseRoles: HELDOUT_DIAGNOSTICS.namedCases.map(({ role }) => role),
    }
  }

  if (stage === 'log1p-comparison') {
    return {
      ...metrics,
      rawTargetScale: HELDOUT_DIAGNOSTICS.log1pComparison.rawTargetScale,
      transformedTargetScale:
        HELDOUT_DIAGNOSTICS.log1pComparison.transformedTargetScale,
      inverseTransformRequired:
        HELDOUT_DIAGNOSTICS.log1pComparison.inverseTransformRequiredForCountMetrics,
    }
  }

  return metrics
}

function buildSnapshot(
  scenario: LinearRegressionScenario,
  stage: (typeof HELDOUT_DIAGNOSTICS.stagedOrder)[number],
  step: number,
): TrainingSnapshot {
  const highlighted = DISPLAY_ROWS[step % DISPLAY_ROWS.length] ?? DISPLAY_ROWS[0]!
  const loss =
    stage === 'optimization-complete'
      ? LINEAR_REGRESSION_REFERENCE_FIT.trainMetrics.mse
      : LINEAR_REGRESSION_REFERENCE_FIT.testMetrics.mse

  return {
    step,
    loss,
    regressionSamples: [...REGRESSION_SAMPLES],
    regressionFit: {
      slope: ORIGINAL_COEFFICIENTS.weights[4]!,
      intercept: ORIGINAL_COEFFICIENTS.intercept,
    },
    fitCurve: [...FIT_CURVE],
    validationSamples: [...REGRESSION_SAMPLES],
    multivariateSamples: [...MULTIVARIATE_SAMPLES],
    multivariatePlane: {
      weights: [
        LINEAR_REGRESSION_REFERENCE_FIT.weights[0]!,
        LINEAR_REGRESSION_REFERENCE_FIT.weights[1]!,
      ],
      intercept: LINEAR_REGRESSION_REFERENCE_FIT.intercept,
    },
    multivariateResiduals: [...MULTIVARIATE_RESIDUALS],
    regressionMeta: BIKE_REGRESSION_META,
    derivedMetrics: stageMetrics(scenario, stage),
    selectedObservation: {
      instant: highlighted.instant,
      area: highlighted.hr,
      age: highlighted.hum,
      actualPrice: highlighted.cnt,
      predictedPrice: highlighted.prediction,
      residual: highlighted.residual,
    },
    sampleLossBreakdown: DISPLAY_ROWS.slice(0, 4).map((record) => ({
      id: `bike-${record.instant}`,
      label: String(record.instant),
      target: record.cnt,
      prediction: record.prediction,
      loss: record.residual ** 2,
    })),
  }
}

export function simulateLinearRegression(config: ExperimentConfig): ModuleSimulation {
  const scenario = asScenario(config.scenario)
  return {
    snapshots: HELDOUT_DIAGNOSTICS.stagedOrder.map((stage, index) =>
      buildSnapshot(scenario, stage, index),
    ),
  }
}
