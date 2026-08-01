import type { LinearRegressionObservationSceneId } from './linearRegressionLesson'

export const LINEAR_REGRESSION_INTERACTION_CONTRACT =
  'linear-regression-phase-27b-interaction-v1' as const

export interface LinearRegressionInteractionAssetBase {
  contractVersion: typeof LINEAR_REGRESSION_INTERACTION_CONTRACT
  sceneId: LinearRegressionObservationSceneId
  sourceCellId: string
}

export interface LinearRegressionPoint {
  x: number
  y: number
  instant?: number
  split?: 'train' | 'validation' | 'test'
}

export interface LinearRegressionSufficientStatistics {
  n: number
  sumX: number
  sumY: number
  sumXX: number
  sumXY: number
  sumYY: number
}

export interface LinearRegressionMetricSet {
  mse: number
  rmse: number
  mae: number
  r2: number
}

export interface FitLineInteractionAsset extends LinearRegressionInteractionAssetBase {
  sceneId: 'fit-line'
  points: LinearRegressionPoint[]
  domain: { x: [number, number]; y: [number, number] }
  baseline: { slope: number; intercept: number }
}

export interface MultivariateInteractionAsset extends LinearRegressionInteractionAssetBase {
  sceneId: 'multivariate'
  partitions: Array<{
    id: 'train' | 'validation' | 'test'
    start: number
    end: number
    rows: number
    targetMean: number
  }>
  sampleRows: Record<'train' | 'validation' | 'test', Array<Record<string, number>>>
  stages: Array<{
    id: string
    features: string[]
    trainRmse: number
    validationRmse: number
  }>
  forbiddenFeatures: string[]
}

export interface ResidualLossInteractionAsset extends LinearRegressionInteractionAssetBase {
  sceneId: 'residual-loss'
  points: LinearRegressionPoint[]
  domain: { x: [number, number]; y: [number, number] }
  statistics: LinearRegressionSufficientStatistics
  baseline: { slope: number; intercept: number; mse: number }
}

export interface GradientTracePoint {
  update: number
  mse: number
  gradientNorm: number
  intercept: number
  weightTemp: number
}

export interface TrainingMotionInteractionAsset extends LinearRegressionInteractionAssetBase {
  sceneId: 'training-motion'
  traces: Array<{
    learningRate: number
    status: 'converged' | 'max-updates' | 'diverged'
    points: GradientTracePoint[]
  }>
}

export interface PolynomialInteractionAsset extends LinearRegressionInteractionAssetBase {
  sceneId: 'polynomial'
  temperaturePoints: LinearRegressionPoint[]
  polynomialCurves: Array<{
    degree: number
    trainRmse: number
    validationRmse: number
    points: LinearRegressionPoint[]
  }>
  hourlyActual: LinearRegressionPoint[]
  stageHourlyPredictions: Array<{
    id: string
    trainRmse: number
    validationRmse: number
    points: LinearRegressionPoint[]
  }>
}

export interface ModelLimitsInteractionAsset extends LinearRegressionInteractionAssetBase {
  sceneId: 'model-limits'
  spaces: Record<'modelSpace' | 'rawContinuousUnits', {
    intercept: number
    rows: Array<{ feature: string; coefficient: number }>
  }>
  featureProfiles: Array<{
    feature: string
    domain: [number, number]
    reference: number
    marginal: LinearRegressionPoint[]
  }>
}

export interface OverfittingInteractionAsset extends LinearRegressionInteractionAssetBase {
  sceneId: 'overfitting'
  complexity: Array<{
    id: string
    trainRmse: number
    validationRmse: number
  }>
  hourlyResiduals: Array<{ hour: number; mean: number; mae: number }>
  predictionSample: Array<{ actual: number; prediction: number; residual: number; hour: number }>
  namedCases: Array<{
    role: string
    instant: number
    timestamp: string
    hour: number
    actual: number
    prediction: number
    residual: number
  }>
}

export interface RegularizationInteractionAsset extends LinearRegressionInteractionAssetBase {
  sceneId: 'regularization'
  correlation: number
  temperatureSample: Array<{ temp: number; atemp: number }>
  ols: { validationRmse: number; coefficients: Record<string, number> }
  paths: Array<{
    model: 'ridge' | 'lasso'
    alpha: number
    validationRmse: number
    coefficients: Record<string, number>
  }>
}

export type LinearRegressionInteractionAsset =
  | FitLineInteractionAsset
  | MultivariateInteractionAsset
  | ResidualLossInteractionAsset
  | TrainingMotionInteractionAsset
  | PolynomialInteractionAsset
  | ModelLimitsInteractionAsset
  | OverfittingInteractionAsset
  | RegularizationInteractionAsset

export interface LinearRegressionInteractionManifest {
  contractVersion: 'linear-regression-phase-27b-interaction-manifest-v1'
  datasetSha256: string
  assets: Array<{
    sceneId: LinearRegressionObservationSceneId
    publicPath: string
    sourceCellId: string
    sha256: string
    bytes: number
  }>
}
