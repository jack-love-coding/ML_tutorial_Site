export type ModuleSlug =
  | 'loss-functions'
  | 'gradient-descent'
  | 'linear-regression'
  | 'logistic-regression'
  | 'classification'
  | 'mlp'
export type AppLocale = 'zh-CN' | 'en'
export type ExperimentConfigValue = number | string | boolean
export type ExperimentConfig = Record<string, ExperimentConfigValue>
export type ControlCategory = 'optimization' | 'data' | 'architecture' | 'playback'
export type InsightTone = 'neutral' | 'positive' | 'caution'
export type MlpProblemType = 'classification' | 'regression'
export type MlpClassificationDataset = 'circle' | 'xor' | 'gauss' | 'spiral'
export type MlpRegressionDataset = 'plane' | 'gaussian'
export type MlpFeatureKey =
  | 'x1'
  | 'x2'
  | 'x1Squared'
  | 'x2Squared'
  | 'x1TimesX2'
  | 'sinX1'
  | 'sinX2'
export type MlpRegularizationType = 'none' | 'l1' | 'l2'
export type MlpActivationKind = 'tanh' | 'relu' | 'sigmoid' | 'linear'
export type MlpPlaygroundFocus =
  | 'dataset'
  | 'features'
  | 'network'
  | 'activations'
  | 'loss'
  | 'regularization'
  | 'generalization'
export type MlpNetworkShape = number[]
export type FocusTarget =
  | 'point'
  | 'gradient'
  | 'trajectory'
  | 'surface'
  | 'contour'
  | 'reference'
  | 'boundary'
  | 'background'
  | 'hidden'

export interface LocalizedCopy {
  'zh-CN': string
  en: string
}

export interface ModuleSourceReference {
  label: LocalizedCopy
  href: string
  license?: string
}

export interface ModuleVisualAsset {
  id: string
  type: 'image' | 'manim-video'
  title: LocalizedCopy
  caption: LocalizedCopy
  assetPath: string
  posterPath?: string
}

export interface PlotPoint {
  x: number
  y: number
  label?: number
  split?: 'train' | 'validation'
}

export interface MlpPlaygroundPoint {
  x: number
  y: number
  label: number
  split: 'train' | 'test'
}

export interface MlpPlaygroundState {
  problemType: MlpProblemType
  classificationDataset: MlpClassificationDataset
  regressionDataset: MlpRegressionDataset
  featureKeys: MlpFeatureKey[]
  networkShape: MlpNetworkShape
  activation: MlpActivationKind
  learningRate: number
  batchSize: number
  regularizationType: MlpRegularizationType
  regularizationRate: number
  noise: number
  trainRatio: number
  showTestData: boolean
  discretize: boolean
  seed: number
  iteration: number
}

export interface MlpNodeSnapshot {
  id: string
  label: string
  layerIndex: number
  nodeIndex: number
  layerKind: 'input' | 'hidden' | 'output'
  bias: number
  output: number
  outputGrid: number[]
}

export interface MlpLinkSnapshot {
  id: string
  sourceId: string
  targetId: string
  weight: number
  isDead: boolean
}

export interface MlpPlaygroundSnapshot {
  state: MlpPlaygroundState
  iteration: number
  gridSize: number
  xDomain: [number, number]
  yDomain: [number, number]
  trainData: MlpPlaygroundPoint[]
  testData: MlpPlaygroundPoint[]
  outputGrid: number[]
  layers: MlpNodeSnapshot[][]
  links: MlpLinkSnapshot[]
  trainLoss: number
  testLoss: number
  trainAccuracy?: number
  testAccuracy?: number
  trainScore?: number
  testScore?: number
  weightNorm: number
  activeWeights: number
  gradientNorm: number
  regularizationPenalty: number
  lossHistory: Array<{ iteration: number; trainLoss: number; testLoss: number }>
}

export interface MultivariateRegressionSample {
  area: number
  age: number
  price: number
  split?: 'train' | 'validation'
}

export interface MultivariateResidualSegment {
  area: number
  age: number
  actualPrice: number
  predictedPrice: number
  residual: number
}

export interface HiddenPoint extends PlotPoint {
  h1: number
  h2: number
}

export interface DecisionParams {
  weights: number[]
  bias: number
}

export interface GradientDomain {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
}

export interface GradientReferencePoint {
  id: string
  kind: 'global-minimum' | 'local-minimum' | 'saddle'
  point: PlotPoint
  label: LocalizedCopy
}

export interface GradientLossFunctionDefinition {
  id: string
  label: LocalizedCopy
  description: LocalizedCopy
  teachingGoal: LocalizedCopy
  formula: string
  domain: GradientDomain
  defaultStart: PlotPoint
  recommendedLearningRate: number
  traits: LocalizedCopy[]
  referencePoints?: GradientReferencePoint[]
  loss: (x: number, y: number) => number
  gradient: (x: number, y: number) => PlotPoint
}

export interface LikelihoodCandidate {
  label: string
  parameter: number
  likelihood: number
  nll: number
}

export interface WorkedExampleRow {
  id: string
  label: string
  input: number
  output: number
  contribution: number
  note?: string
}

export interface ClassificationExample {
  id: string
  label: number
  score: number
  probability: number
  predicted: number
  split?: 'train' | 'validation'
}

export interface ConfusionMatrix {
  tp: number
  fp: number
  tn: number
  fn: number
}

export interface ClassificationMetricSummary {
  accuracy: number
  precision: number
  recall: number
  specificity: number
  f1: number
  fpr: number
  tpr: number
  positiveRate: number
  labelRate: number
  predictionBias: number
  falsePositiveCost: number
  falseNegativeCost: number
  expectedCost: number
  auc: number
  macroF1: number
  microF1: number
}

export interface RocPoint {
  threshold: number
  tpr: number
  fpr: number
}

export interface CalibrationBin {
  id: string
  start: number
  end: number
  predicted: number
  observed: number
  count: number
}

export interface MulticlassMetricRow {
  id: string
  label: string
  logit: number
  probability: number
  predictedCount: number
  actualCount: number
  precision: number
  recall: number
  f1: number
}

export interface RegressionMeta {
  xLabel: LocalizedCopy
  yLabel: LocalizedCopy
  xUnit: LocalizedCopy
  yUnit: LocalizedCopy
  sampleLabel: LocalizedCopy
  sourceName: string
  sourceUrl: string
  featureName: string
  targetName: string
  datasetSize: number
  featureCount: number
}

export interface FitDiagnosticItem {
  id: 'underfit' | 'balanced' | 'overfit'
  degree: number
  label: LocalizedCopy
  cause: LocalizedCopy
  response: LocalizedCopy
  trainMse: number
  validationMse: number
  weightNorm: number
  activeWeights: number
  roughness: number
  curve: PlotPoint[]
}

export interface FitDiagnostics {
  items: FitDiagnosticItem[]
  sourceNote: LocalizedCopy
}

export interface TrainingSnapshot {
  step: number
  loss: number
  accuracy?: number
  point?: PlotPoint
  gradient?: { x: number; y: number }
  trajectory?: PlotPoint[]
  params?: DecisionParams
  boundaryGrid?: number[]
  gridSize?: number
  dataset?: PlotPoint[]
  hidden?: HiddenPoint[]
  extraMetric?: number
  functionId?: string
  referenceDistance?: number
  derivedMetrics?: Record<string, number | string | boolean | number[] | string[]>
  lossCurves?: Record<string, PlotPoint[]>
  regressionSamples?: PlotPoint[]
  regressionFit?: { slope: number; intercept: number }
  fitCurve?: PlotPoint[]
  validationSamples?: PlotPoint[]
  multivariateSamples?: MultivariateRegressionSample[]
  multivariatePlane?: { weights: number[]; intercept: number }
  multivariateResiduals?: MultivariateResidualSegment[]
  classificationSamples?: PlotPoint[]
  probabilityBars?: number[]
  likelihoodCurve?: PlotPoint[]
  likelihoodCandidates?: LikelihoodCandidate[]
  jointLikelihood?: number
  jointLogLikelihood?: number
  perSampleLikelihoods?: number[]
  regressionMeta?: RegressionMeta
  fitDiagnostics?: FitDiagnostics
  selectedObservation?: Record<string, number | string>
  sampleLossBreakdown?: Array<{
    id: string
    label: string
    target: number
    prediction: number
    loss: number
  }>
  workedExampleRows?: WorkedExampleRow[]
  classificationExamples?: ClassificationExample[]
  confusionMatrix?: ConfusionMatrix
  classificationMetrics?: ClassificationMetricSummary
  rocPoints?: RocPoint[]
  calibrationBins?: CalibrationBin[]
  multiclassRows?: MulticlassMetricRow[]
}

export interface ModuleSimulation {
  snapshots: TrainingSnapshot[]
}

export interface ControlOption {
  value: string
  labelKey: string
}

export interface ExperimentControl {
  key: string
  type: 'range' | 'select'
  labelKey: string
  category: ControlCategory
  descriptionKey?: string
  min?: number
  max?: number
  step?: number
  options?: ControlOption[]
  format?: 'number' | 'integer' | 'percent' | 'speed'
}

export interface StorySection {
  id: string
  eyebrowKey: string
  titleKey: string
  title?: LocalizedCopy
  pageSummary?: LocalizedCopy
  conceptVisualId?: string
  estimatedMinutes?: number
  markdown: LocalizedCopy
  teachingBlocks?: {
    concept: LocalizedCopy
    workedExample: LocalizedCopy
    formula: LocalizedCopy
    commonMistake: LocalizedCopy
    rememberThis: LocalizedCopy
  }
  callout: LocalizedCopy
  experimentPrompt?: LocalizedCopy
  layoutMode?: 'story' | 'embedded-lab'
  embeddedLabId?: string
  presetId?: string
  recommendedFunctionId?: string
  focusTarget?: FocusTarget
  linkedInsightIds?: string[]
  metricEmphasis?: string[]
  sources?: ModuleSourceReference[]
  visualIds?: string[]
  playgroundFocus?: MlpPlaygroundFocus
  media?: {
    title: LocalizedCopy
    body: LocalizedCopy
    assetPath: string
    posterPath?: string
  }
}

export interface ChapterLabDefinition {
  id: string
  title: LocalizedCopy
  description: LocalizedCopy
}

export interface ExperimentPreset {
  id: string
  label: LocalizedCopy
  description: LocalizedCopy
  config: Partial<ExperimentConfig>
}

export interface TeachingInsight {
  id: string
  tone: InsightTone
  titleKey: string
  bodyKey: string
}

export interface AlgorithmModuleDefinition {
  slug: ModuleSlug
  titleKey: string
  kickerKey: string
  introKey: string
  summaryKey: string
  route: string
  theme: string
  accent: string
  chapters: StorySection[]
  controls: ExperimentControl[]
  presets: ExperimentPreset[]
  visuals?: ModuleVisualAsset[]
  sourceNote?: LocalizedCopy
  createDefaultConfig: () => ExperimentConfig
  simulate: (config: ExperimentConfig) => ModuleSimulation
}

export interface ExperimentState {
  config: ExperimentConfig
  snapshots: TrainingSnapshot[]
  currentStep: number
  isPlaying: boolean
}
