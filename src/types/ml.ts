export type ModuleSlug =
  | 'loss-functions'
  | 'gradient-descent'
  | 'linear-regression'
  | 'logistic-regression'
  | 'mlp'
export type AppLocale = 'zh-CN' | 'en'
export type ExperimentConfigValue = number | string | boolean
export type ExperimentConfig = Record<string, ExperimentConfigValue>
export type ControlCategory = 'optimization' | 'data' | 'architecture' | 'playback'
export type InsightTone = 'neutral' | 'positive' | 'caution'
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

export interface PlotPoint {
  x: number
  y: number
  label?: number
  split?: 'train' | 'validation'
}

export interface MultivariateRegressionSample {
  area: number
  age: number
  price: number
  split?: 'train' | 'validation'
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
  classificationSamples?: PlotPoint[]
  probabilityBars?: number[]
  likelihoodCurve?: PlotPoint[]
  likelihoodCandidates?: LikelihoodCandidate[]
  jointLikelihood?: number
  jointLogLikelihood?: number
  perSampleLikelihoods?: number[]
  selectedObservation?: Record<string, number | string>
  sampleLossBreakdown?: Array<{
    id: string
    label: string
    target: number
    prediction: number
    loss: number
  }>
  workedExampleRows?: WorkedExampleRow[]
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
  createDefaultConfig: () => ExperimentConfig
  simulate: (config: ExperimentConfig) => ModuleSimulation
}

export interface ExperimentState {
  config: ExperimentConfig
  snapshots: TrainingSnapshot[]
  currentStep: number
  isPlaying: boolean
}
