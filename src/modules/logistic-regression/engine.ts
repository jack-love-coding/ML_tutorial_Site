import {
  stableBinaryCrossEntropy,
  stableSigmoid,
} from '../math-lab/utils/banknoteLogistic.ts'
import { BANKNOTE_FEATURES, type BanknoteFeature, type BanknoteTarget } from '../math-lab/utils/banknoteDataset.ts'

export type LogisticFeatureVector = readonly [number, number, number, number]
export type LogisticParameterVector = readonly [number, number, number, number, number]

export const LOGISTIC_PARAMETER_ORDER = [...BANKNOTE_FEATURES, 'intercept'] as const

export const LOGISTIC_FINITE_DIFFERENCE_CONTRACT = Object.freeze({
  centeredSteps: Object.freeze([1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8]),
  selectedStep: 1e-6,
  maxComponentError: 2e-9,
  requireFullPrecision: true,
  claimMonotonicError: false,
})

export const LOGISTIC_PARITY_CONTRACT = Object.freeze({
  featureOrder: Object.freeze([...BANKNOTE_FEATURES]),
  fitSplit: 'train',
  scalerDdof: 0,
  intercept: true,
  penalty: 'none',
  sklearnVersion: '1.9.0',
  sklearnSolver: 'lbfgs',
  scratchOptimizer: 'armijo',
  sklearnMaxIterations: 5000,
  scratchMaxIterations: 100000,
  gradientNormThreshold: 1e-8,
  relativeObjectiveThreshold: 1e-14,
  parameterStepNormThreshold: 1e-10,
  initialStep: 32,
  armijoC1: 1e-4,
  armijoShrinkFactor: 0.5,
  maxBacktracks: 30,
  minimumStep: 1e-12,
  warningPolicy: 'fail-on-warning',
  requiredTerminalFields: Object.freeze(['iterations', 'loss', 'gradientNorm', 'converged', 'stopReason']),
  coefficientTolerance: 2e-4,
  interceptTolerance: 2e-4,
  validationProbabilityTolerance: 1e-6,
  onMismatch: 'fail',
  allowToleranceRelaxation: false,
})

export const LOGISTIC_CALIBRATION_CONTRACT = Object.freeze({
  sourceSplit: 'validation',
  source: 'frozen-banknote-logits',
  transforms: Object.freeze(['original', 'softened', 'sharpened']),
  temperatureDomain: 'positive',
  preserveLogitOrdering: true,
  defaultThreshold: 0.5,
  defaultLabelsInvariant: true,
  binEdges: Object.freeze([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]),
  emptyBinBehavior: 'retain-with-null-observed-rate',
  eceStorage: 'full-precision',
  syntheticDiagnostics: 'isolated-xor-and-circles',
  syntheticUsedForBanknoteFit: false,
})

function assertFinite(value: number, name: string): void {
  if (!Number.isFinite(value)) throw new RangeError(`${name} must be finite.`)
}

function assertFiniteArray(values: readonly number[], name: string, length?: number): void {
  if (!Array.isArray(values) || (length !== undefined && values.length !== length)) {
    throw new RangeError(`${name} has an invalid dimension.`)
  }
  values.forEach((value, index) => assertFinite(value, `${name}[${index}]`))
}

function assertTarget(target: number, name = 'target'): asserts target is BanknoteTarget {
  if (target !== 0 && target !== 1) throw new RangeError(`${name} must be a class 0 or class 1 label.`)
}

function asParameterVector(parameters: readonly number[]): LogisticParameterVector {
  assertFiniteArray(parameters, 'parameters', 5)
  return [parameters[0]!, parameters[1]!, parameters[2]!, parameters[3]!, parameters[4]!]
}

function asFeatureVector(features: readonly number[]): LogisticFeatureVector {
  assertFiniteArray(features, 'features', 4)
  return [features[0]!, features[1]!, features[2]!, features[3]!]
}

export function linearScore(
  features: readonly number[],
  coefficients: readonly number[],
  intercept: number,
): number {
  assertFiniteArray(features, 'features')
  assertFiniteArray(coefficients, 'coefficients')
  assertFinite(intercept, 'intercept')
  if (features.length !== coefficients.length) {
    throw new RangeError('Feature and coefficient dimensions must match.')
  }
  const score = features.reduce((total, feature, index) => total + feature * coefficients[index]!, intercept)
  assertFinite(score, 'linear score')
  return score
}

export interface SigmoidOddsTerms {
  logit: number
  probability: number
  odds: number | null
  logOdds: number
  oddsStatus: 'finite' | 'outside-display-range'
  defaultClass: BanknoteTarget
}

export function sigmoidOddsTerms(logit: number): SigmoidOddsTerms {
  assertFinite(logit, 'logit')
  const probability = stableSigmoid(logit)
  const maxLog = Math.log(Number.MAX_VALUE)
  const odds = Math.abs(logit) > maxLog ? null : Math.exp(logit)
  return {
    logit,
    probability,
    odds,
    logOdds: logit,
    oddsStatus: odds === null ? 'outside-display-range' : 'finite',
    defaultClass: probability >= 0.5 ? 1 : 0,
  }
}

export interface OneRowLogisticTerms {
  featureOrder: readonly BanknoteFeature[]
  features: LogisticFeatureVector
  coefficients: LogisticFeatureVector
  target: BanknoteTarget
  contributions: readonly { feature: BanknoteFeature; value: number }[]
  intercept: number
  logit: number
  probability: number
  odds: number | null
  logOdds: number
  bce: number
  featureGradient: LogisticFeatureVector
  interceptGradient: number
  defaultClass: BanknoteTarget
}

export function oneRowLogisticTerms(input: {
  readonly features: readonly number[]
  readonly parameters: readonly number[]
  readonly target: number
}): OneRowLogisticTerms {
  const features = asFeatureVector(input.features)
  const parameters = asParameterVector(input.parameters)
  assertTarget(input.target)
  const coefficients: LogisticFeatureVector = [parameters[0], parameters[1], parameters[2], parameters[3]]
  const intercept = parameters[4]
  const contributions = BANKNOTE_FEATURES.map((feature, index) => ({
    feature,
    value: features[index]! * coefficients[index]!,
  }))
  contributions.forEach(({ value }, index) => assertFinite(value, `contribution ${index + 1}`))
  const logit = linearScore(features, coefficients, intercept)
  const sigmoid = sigmoidOddsTerms(logit)
  const residual = sigmoid.probability - input.target
  const featureGradient: LogisticFeatureVector = [
    features[0] * residual,
    features[1] * residual,
    features[2] * residual,
    features[3] * residual,
  ]
  const bce = stableBinaryCrossEntropy(logit, input.target)
  assertFinite(bce, 'binary cross entropy')
  assertFiniteArray(featureGradient, 'one-row gradient', 4)
  return {
    featureOrder: BANKNOTE_FEATURES,
    features,
    coefficients,
    target: input.target,
    contributions,
    intercept,
    logit,
    probability: sigmoid.probability,
    odds: sigmoid.odds,
    logOdds: sigmoid.logOdds,
    bce,
    featureGradient,
    interceptGradient: residual,
    defaultClass: sigmoid.defaultClass,
  }
}

export interface LogisticBatchTerms {
  logits: readonly number[]
  probabilities: readonly number[]
  meanBce: number
  gradient: LogisticParameterVector
}

function assertBatch(features: readonly (readonly number[])[], targets: readonly number[]): void {
  if (!Array.isArray(features) || features.length === 0 || features.length !== targets.length) {
    throw new RangeError('Features and targets must have the same non-zero batch dimension.')
  }
  features.forEach((row) => asFeatureVector(row))
  targets.forEach((target, index) => assertTarget(target, `target ${index + 1}`))
}

export function stableMeanBce(logits: readonly number[], labels: readonly number[]): number {
  if (!Array.isArray(logits) || logits.length === 0 || logits.length !== labels.length) {
    throw new RangeError('Logits and labels must have the same non-zero dimension.')
  }
  const total = logits.reduce((sum, logit, index) => {
    assertFinite(logit, `logit ${index + 1}`)
    const label = labels[index]!
    assertTarget(label, `label ${index + 1}`)
    return sum + stableBinaryCrossEntropy(logit, label)
  }, 0)
  const mean = total / logits.length
  assertFinite(mean, 'mean binary cross entropy')
  return mean
}

export function logisticGradient(
  features: readonly (readonly number[])[],
  targets: readonly number[],
  parameters: readonly number[],
): LogisticParameterVector {
  assertBatch(features, targets)
  const values = asParameterVector(parameters)
  const gradient = [0, 0, 0, 0, 0]
  features.forEach((row, rowIndex) => {
    const feature = asFeatureVector(row)
    const logit = linearScore(feature, values.slice(0, 4), values[4])
    const residual = stableSigmoid(logit) - targets[rowIndex]!
    feature.forEach((value, index) => { gradient[index]! += value * residual })
    gradient[4]! += residual
  })
  const mean = gradient.map((value) => value / features.length)
  assertFiniteArray(mean, 'batch gradient', 5)
  return [mean[0]!, mean[1]!, mean[2]!, mean[3]!, mean[4]!]
}

export function logisticBatchTerms(
  features: readonly (readonly number[])[],
  targets: readonly number[],
  parameters: readonly number[],
): LogisticBatchTerms {
  assertBatch(features, targets)
  const values = asParameterVector(parameters)
  const logits = features.map((row) => linearScore(row, values.slice(0, 4), values[4]))
  return {
    logits,
    probabilities: logits.map(stableSigmoid),
    meanBce: stableMeanBce(logits, targets),
    gradient: logisticGradient(features, targets, values),
  }
}

export function centralDifferenceGradient(
  features: readonly (readonly number[])[],
  targets: readonly number[],
  parameters: readonly number[],
  step: number = LOGISTIC_FINITE_DIFFERENCE_CONTRACT.selectedStep,
): LogisticParameterVector {
  assertBatch(features, targets)
  const values = asParameterVector(parameters)
  assertFinite(step, 'finite-difference step')
  if (step <= 0 || step > 1) throw new RangeError('Finite-difference step must be positive and no larger than one.')
  const valuesAt = (candidate: readonly number[]) => stableMeanBce(
    features.map((row) => linearScore(row, candidate.slice(0, 4), candidate[4]!)),
    targets,
  )
  const gradient = values.map((_, index) => {
    const plus = [...values]
    const minus = [...values]
    plus[index]! += step
    minus[index]! -= step
    return (valuesAt(plus) - valuesAt(minus)) / (2 * step)
  })
  assertFiniteArray(gradient, 'central difference gradient', 5)
  return [gradient[0]!, gradient[1]!, gradient[2]!, gradient[3]!, gradient[4]!]
}

export interface BernoulliLikelihoodTerms {
  perRow: readonly number[]
  rawProduct: number
  rawProductStatus: 'finite' | 'underflowed'
  logLikelihood: number
  meanBce: number
}

export function bernoulliLogLikelihood(logits: readonly number[], labels: readonly number[]): BernoulliLikelihoodTerms {
  if (!Array.isArray(logits) || logits.length === 0 || logits.length !== labels.length) {
    throw new RangeError('Logits and labels must have the same non-zero dimension.')
  }
  const perRow = logits.map((logit, index) => {
    assertFinite(logit, `logit ${index + 1}`)
    const label = labels[index]!
    assertTarget(label, `label ${index + 1}`)
    const probability = stableSigmoid(logit)
    return label === 1 ? probability : 1 - probability
  })
  const rawProduct = perRow.reduce((product, probability) => product * probability, 1)
  const logLikelihood = -logits.reduce((total, logit, index) => total + stableBinaryCrossEntropy(logit, labels[index]! as BanknoteTarget), 0)
  assertFinite(logLikelihood, 'log likelihood')
  return {
    perRow,
    rawProduct,
    rawProductStatus: rawProduct === 0 ? 'underflowed' : 'finite',
    logLikelihood,
    meanBce: -logLikelihood / logits.length,
  }
}

export function temperatureProbability(logit: number, temperature: number): number {
  assertFinite(logit, 'logit')
  assertFinite(temperature, 'temperature')
  if (temperature <= 0) throw new RangeError('Temperature must be positive.')
  return stableSigmoid(logit / temperature)
}

export interface CalibrationBin {
  lower: number
  upper: number
  count: number
  meanProbability: number | null
  observedRate: number | null
}

export interface CalibrationSummary {
  bins: readonly CalibrationBin[]
  expectedCalibrationError: number
}

export function buildCalibrationBins(
  probabilities: readonly number[],
  labels: readonly number[],
  edges: readonly number[] = LOGISTIC_CALIBRATION_CONTRACT.binEdges,
): CalibrationSummary {
  if (!Array.isArray(probabilities) || probabilities.length === 0 || probabilities.length !== labels.length) {
    throw new RangeError('Probabilities and labels must have the same non-zero dimension.')
  }
  if (!Array.isArray(edges) || edges.length < 2 || edges[0] !== 0 || edges.at(-1) !== 1) {
    throw new RangeError('Calibration bins must start at 0 and end at 1.')
  }
  edges.forEach((edge, index) => {
    assertFinite(edge, `bin edge ${index + 1}`)
    if (edge < 0 || edge > 1 || (index > 0 && edge <= edges[index - 1]!)) throw new RangeError('Calibration bin edges must increase within [0, 1].')
  })
  probabilities.forEach((probability, index) => {
    assertFinite(probability, `probability ${index + 1}`)
    if (probability < 0 || probability > 1) throw new RangeError('Probabilities must fall within [0, 1].')
    assertTarget(labels[index]!, `label ${index + 1}`)
  })
  const bins = edges.slice(0, -1).map((lower, index): CalibrationBin => {
    const upper = edges[index + 1]!
    const values = probabilities.filter((probability) => probability >= lower && (index === edges.length - 2 ? probability <= upper : probability < upper))
    const indexes = probabilities.flatMap((probability, probabilityIndex) => (
      probability >= lower && (index === edges.length - 2 ? probability <= upper : probability < upper) ? [probabilityIndex] : []
    ))
    if (!values.length) return { lower, upper, count: 0, meanProbability: null, observedRate: null }
    return {
      lower,
      upper,
      count: values.length,
      meanProbability: values.reduce((sum, value) => sum + value, 0) / values.length,
      observedRate: indexes.reduce((sum, valueIndex) => sum + labels[valueIndex]!, 0) / indexes.length,
    }
  })
  const expectedCalibrationError = bins.reduce((total, bin) => (
    bin.count === 0 ? total : total + (bin.count / probabilities.length) * Math.abs(bin.meanProbability! - bin.observedRate!)
  ), 0)
  assertFinite(expectedCalibrationError, 'expected calibration error')
  return { bins, expectedCalibrationError }
}

export const calibrationBins = buildCalibrationBins

export function xorContradiction(): readonly { x: number; y: number; target: BanknoteTarget }[] {
  return Object.freeze([
    { x: -1, y: -1, target: 0 },
    { x: -1, y: 1, target: 1 },
    { x: 1, y: -1, target: 1 },
    { x: 1, y: 1, target: 0 },
  ])
}

export function xorBoundaryDiagnostic() {
  return { kind: 'synthetic-xor' as const, points: xorContradiction() }
}

export function circleBoundaryDiagnostics(radius: number = 1): readonly { x: number; y: number; target: BanknoteTarget }[] {
  assertFinite(radius, 'circle radius')
  if (radius <= 0 || radius > 10) throw new RangeError('Circle radius must be within (0, 10].')
  return Object.freeze(Array.from({ length: 16 }, (_, index) => {
    const angle = (Math.PI * 2 * index) / 16
    const scale = index % 2 === 0 ? radius * 0.55 : radius * 1.45
    return { x: scale * Math.cos(angle), y: scale * Math.sin(angle), target: (index % 2 === 0 ? 0 : 1) as BanknoteTarget }
  }))
}

export function circleBoundaryDiagnostic(radius: number = 1) {
  return { kind: 'synthetic-circles' as const, radius, points: circleBoundaryDiagnostics(radius) }
}
