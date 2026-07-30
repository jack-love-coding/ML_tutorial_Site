import type {
  ExperimentConfig,
  ModuleSimulation,
  MultivariateRegressionSample,
  RegressionMeta,
  TrainingSnapshot,
} from '../types/ml'
import {
  compareRegressionMethods,
  createPublishedHeldoutDiagnosticInput,
  createPublishedRegressionMethodComparison,
  createPublishedRegressionReferenceFit,
  deriveHeldoutDiagnostics,
} from './linearRegressionBike.ts'
import { LINEAR_REGRESSION_PUBLISHED_BASELINE } from './linearRegressionWorkbench.ts'

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

const BASELINE = LINEAR_REGRESSION_PUBLISHED_BASELINE
const REFERENCE_FIT = createPublishedRegressionReferenceFit()
const METHOD_COMPARISON = createPublishedRegressionMethodComparison()
const METHOD_AGREEMENT = compareRegressionMethods(METHOD_COMPARISON)
const HELDOUT_DIAGNOSTICS = deriveHeldoutDiagnostics(
  createPublishedHeldoutDiagnosticInput(),
)

const ORIGINAL_COEFFICIENT_VIEW = BASELINE.coefficientViews.find(
  ({ method, space }) =>
    method === 'numpy-lstsq' && space === 'original-dataset-unit',
)

if (!ORIGINAL_COEFFICIENT_VIEW) {
  throw new TypeError('Published original-unit coefficient view is missing.')
}

const ORIGINAL_INTERCEPT =
  ORIGINAL_COEFFICIENT_VIEW.rows.find(({ feature }) => feature === 'intercept')
    ?.coefficient
const ORIGINAL_HOUR_WEIGHT =
  ORIGINAL_COEFFICIENT_VIEW.rows.find(({ feature }) => feature === 'hr')
    ?.coefficient

if (
  ORIGINAL_INTERCEPT === undefined
  || ORIGINAL_HOUR_WEIGHT === undefined
) {
  throw new TypeError('Published original-unit intercept/hour coefficient is missing.')
}

const PUBLISHED_ORIGINAL_INTERCEPT: number = ORIGINAL_INTERCEPT
const PUBLISHED_ORIGINAL_HOUR_WEIGHT: number = ORIGINAL_HOUR_WEIGHT

const BIKE_REGRESSION_META: RegressionMeta = Object.freeze({
  xLabel: Object.freeze({ 'zh-CN': '小时', en: 'Hour' }),
  yLabel: Object.freeze({ 'zh-CN': '租车次数', en: 'Rental count' }),
  xUnit: Object.freeze({ 'zh-CN': '时', en: 'hour' }),
  yUnit: Object.freeze({ 'zh-CN': '次', en: 'rentals' }),
  sampleLabel: Object.freeze({ 'zh-CN': '小时记录', en: 'Hourly record' }),
  sourceName: 'UCI Bike Sharing Dataset',
  sourceUrl: 'https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset',
  featureName: BASELINE.featureOrder.join(', '),
  targetName: 'cnt',
  datasetSize: BASELINE.split.totalRows,
  featureCount: BASELINE.featureOrder.length,
})

const REGRESSION_SAMPLES = Object.freeze(
  BASELINE.displayRows.map((record) =>
    Object.freeze({
      x: record.hour,
      y: record.actual,
      split: record.partition === 'train' ? 'train' as const : 'validation' as const,
    })),
)

const VALIDATION_SAMPLES = Object.freeze(
  REGRESSION_SAMPLES.filter(({ split }) => split === 'validation'),
)

const FIT_CURVE = Object.freeze(
  BASELINE.displayRows.map((record) =>
    Object.freeze({
      x: record.hour,
      y: record.prediction,
    })),
)

const MULTIVARIATE_SAMPLES: readonly MultivariateRegressionSample[] =
  Object.freeze(
    BASELINE.displayRows.map((record) =>
      Object.freeze({
        area: record.rawFeatures.temp,
        age: record.rawFeatures.hum,
        price: record.actual,
        split:
          record.partition === 'train'
            ? 'train' as const
            : 'validation' as const,
      })),
  )

const MULTIVARIATE_RESIDUALS = Object.freeze(
  BASELINE.displayRows.map((record) =>
    Object.freeze({
      area: record.rawFeatures.temp,
      age: record.rawFeatures.hum,
      actualPrice: record.actual,
      predictedPrice: record.prediction,
      residual: record.residual,
    })),
)

function asScenario(
  value: ExperimentConfig[string],
): LinearRegressionScenario {
  const scenario = String(value ?? 'linear') as LinearRegressionScenario
  return LINEAR_REGRESSION_SCENARIOS.has(scenario) ? scenario : 'linear'
}

function commonMetrics(
  scenario: LinearRegressionScenario,
): Record<string, number | string | boolean | number[] | string[]> {
  return {
    scenario,
    dataSource: 'uci-bike-sharing',
    mse: BASELINE.metrics.test.mse,
    trainMse: BASELINE.metrics.train.mse,
    validationMse: BASELINE.metrics.test.mse,
    mae: BASELINE.metrics.test.mae,
    r2: BASELINE.metrics.test.r2,
    weights: [...REFERENCE_FIT.weights],
    intercept: REFERENCE_FIT.intercept,
    gradientNorm: METHOD_COMPARISON.gradientDescent.gradientNorm!,
    updates: METHOD_COMPARISON.gradientDescent.updates!,
    gdMaxCoefficientDelta:
      METHOD_COMPARISON.gradientDescent.maxCoefficientDelta,
    normalEquationMaxCoefficientDelta:
      METHOD_COMPARISON.normalEquation.maxCoefficientDelta,
    sklearnMaxCoefficientDelta:
      METHOD_COMPARISON.scikitLearn.maxCoefficientDelta,
    methodTolerance: METHOD_AGREEMENT.tolerance,
    methodsAgree: METHOD_AGREEMENT.agrees,
    modelComplexity: BASELINE.featureOrder.length,
    activeWeights: REFERENCE_FIT.weights.length,
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
      hourlyResidualHours: BASELINE.diagnostics.hourlyResiduals.map(
        ({ hour }) => hour,
      ),
      hourlyResidualMeans: BASELINE.diagnostics.hourlyResiduals.map(
        ({ meanResidual }) => meanResidual,
      ),
    }
  }

  if (stage === 'prediction-bin-spread') {
    return {
      ...metrics,
      predictionBinIds: BASELINE.diagnostics.predictionBins.map(
        ({ bin }) => bin,
      ),
      predictionBinLowerBounds: BASELINE.diagnostics.predictionBins.map(
        ({ lowerPrediction }) => lowerPrediction,
      ),
      predictionBinUpperBounds: BASELINE.diagnostics.predictionBins.map(
        ({ upperPrediction }) => upperPrediction,
      ),
      predictionBinRows: BASELINE.diagnostics.predictionBins.map(
        ({ rows }) => rows,
      ),
      predictionBinResidualStdDev: BASELINE.diagnostics.predictionBins.map(
        ({ residualStdDev }) => residualStdDev,
      ),
      predictionBinMae: BASELINE.diagnostics.predictionBins.map(
        ({ mae }) => mae,
      ),
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
      olsPerturbationL2: stability.olsPerturbationL2,
      ridgePerturbationL2: stability.ridgePerturbationL2,
      ridgeObjective: stability.ridgeObjective,
      lassoObjective: stability.lassoObjective,
    }
  }

  if (stage === 'named-heldout-cases') {
    return {
      ...metrics,
      namedCaseInstants: HELDOUT_DIAGNOSTICS.namedCases.map(
        ({ instant }) => instant,
      ),
      namedCaseRoles: HELDOUT_DIAGNOSTICS.namedCases.map(({ role }) => role),
      namedCasePredictions: HELDOUT_DIAGNOSTICS.namedCases.map(
        ({ prediction }) => prediction,
      ),
      namedCaseActuals: HELDOUT_DIAGNOSTICS.namedCases.map(
        ({ actual }) => actual,
      ),
      namedCaseResiduals: HELDOUT_DIAGNOSTICS.namedCases.map(
        ({ residual }) => residual,
      ),
    }
  }

  if (stage === 'log1p-comparison') {
    const log1p = BASELINE.diagnostics.log1pComparison as {
      readonly targetTransform: string
      readonly coefficientScale: string
      readonly inverseTransform: string
      readonly inverseTransformedCountMetrics: {
        readonly mae: number
        readonly mse: number
        readonly r2: number
      }
      readonly logSpaceMetrics: {
        readonly mae: number
        readonly mse: number
        readonly r2: number
      }
    }
    return {
      ...metrics,
      rawTargetScale: HELDOUT_DIAGNOSTICS.log1pComparison.rawTargetScale,
      transformedTargetScale:
        HELDOUT_DIAGNOSTICS.log1pComparison.transformedTargetScale,
      inverseTransformRequired:
        HELDOUT_DIAGNOSTICS.log1pComparison
          .inverseTransformRequiredForCountMetrics,
      log1pTransform: log1p.targetTransform,
      log1pCoefficientScale: log1p.coefficientScale,
      log1pInverseTransform: log1p.inverseTransform,
      log1pCountMse: log1p.inverseTransformedCountMetrics.mse,
      log1pCountMae: log1p.inverseTransformedCountMetrics.mae,
      log1pCountR2: log1p.inverseTransformedCountMetrics.r2,
      log1pSpaceMse: log1p.logSpaceMetrics.mse,
      log1pSpaceMae: log1p.logSpaceMetrics.mae,
      log1pSpaceR2: log1p.logSpaceMetrics.r2,
    }
  }

  return metrics
}

function buildSnapshot(
  scenario: LinearRegressionScenario,
  stage: (typeof HELDOUT_DIAGNOSTICS.stagedOrder)[number],
  step: number,
): TrainingSnapshot {
  const highlighted =
    BASELINE.displayRows[step % BASELINE.displayRows.length]
    ?? BASELINE.displayRows[0]!
  const loss =
    stage === 'optimization-complete'
      ? BASELINE.metrics.train.mse
      : BASELINE.metrics.test.mse

  return {
    step,
    loss,
    regressionSamples: [...REGRESSION_SAMPLES],
    regressionFit: {
      slope: PUBLISHED_ORIGINAL_HOUR_WEIGHT,
      intercept: PUBLISHED_ORIGINAL_INTERCEPT,
    },
    fitCurve: [...FIT_CURVE],
    validationSamples: [...VALIDATION_SAMPLES],
    multivariateSamples: [...MULTIVARIATE_SAMPLES],
    multivariatePlane: {
      weights: [REFERENCE_FIT.weights[0]!, REFERENCE_FIT.weights[1]!],
      intercept: REFERENCE_FIT.intercept,
    },
    multivariateResiduals: [...MULTIVARIATE_RESIDUALS],
    regressionMeta: BIKE_REGRESSION_META,
    derivedMetrics: stageMetrics(scenario, stage),
    selectedObservation: {
      instant: highlighted.instant,
      area: highlighted.hour,
      age: highlighted.rawFeatures.hum,
      actualPrice: highlighted.actual,
      predictedPrice: highlighted.prediction,
      residual: highlighted.residual,
    },
    sampleLossBreakdown: [
      {
        id: `bike-${BASELINE.representativeRow.instant}`,
        label: String(BASELINE.representativeRow.instant),
        target: BASELINE.representativeRow.actual as number,
        prediction: BASELINE.representativeRow.prediction as number,
        loss: BASELINE.representativeRow.lossContribution as number,
      },
    ],
  }
}

export function simulateLinearRegression(
  config: ExperimentConfig,
): ModuleSimulation {
  const scenario = asScenario(config.scenario)
  return {
    snapshots: HELDOUT_DIAGNOSTICS.stagedOrder.map((stage, index) =>
      buildSnapshot(scenario, stage, index)),
  }
}
