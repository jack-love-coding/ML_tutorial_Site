export type LossKind = 'mse' | 'mae' | 'bce'
export type BinaryLabel = 0 | 1

export type NumericalStatus =
  | 'finite'
  | 'positive-infinite'
  | 'negative-infinite'
  | 'nan'

export interface LossGradientEvaluation {
  readonly kind: LossKind
  readonly perElementLosses: readonly number[]
  readonly meanObjective: number
  readonly perElementGradients: readonly number[]
  readonly meanObjectiveGradients: readonly number[]
  readonly differentiable: readonly boolean[]
  readonly gradientNotes: readonly (string | null)[]
}

export interface NumericalValue {
  readonly status: NumericalStatus
  readonly value: number | null
}

export interface ClippedProbabilityBceEvaluation {
  readonly method: 'clipped-probability-bce'
  readonly status: 'finite'
  readonly value: number
  readonly probability: number
  readonly clippedProbability: number
  readonly epsilon: number
  readonly objectiveChanged: boolean
}

export interface StableLogitBceEvaluation {
  readonly method: 'stable-logit-bce'
  readonly status: 'finite'
  readonly value: number
}

export interface BceStabilityProbeRow {
  readonly source: 'synthetic-stability-probe'
  readonly logit: number
  readonly label: BinaryLabel
  readonly probability: number
  readonly naive: NumericalValue
  readonly clipped: ClippedProbabilityBceEvaluation
  readonly stable: StableLogitBceEvaluation
}

export const BCE_STABILITY_LOGITS = Object.freeze([
  -1000,
  -20,
  0,
  20,
  1000,
]) as readonly number[]

const DEFAULT_CLIPPING_EPSILON = 1e-12
const MAE_SUBDIFFERENTIAL_NOTE =
  'Nondifferentiable at zero residual: subdifferential [-1, 1], implementation convention 0.'

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

function assertBinaryLabel(value: number, name = 'label'): asserts value is BinaryLabel {
  if (value !== 0 && value !== 1) {
    throw new RangeError(`${name} must be 0 or 1.`)
  }
}

function assertProbability(value: number, allowBoundary: boolean): void {
  assertFiniteNumber(value, 'probability')
  const valid = allowBoundary ? value >= 0 && value <= 1 : value > 0 && value < 1
  if (!valid) {
    throw new RangeError(
      allowBoundary
        ? 'probability must be between 0 and 1.'
        : 'probability must be strictly between 0 and 1.',
    )
  }
}

function assertLossInput(
  kind: LossKind,
  targets: readonly number[],
  outputs: readonly number[],
): void {
  if (kind !== 'mse' && kind !== 'mae' && kind !== 'bce') {
    throw new TypeError(`Unknown loss kind: ${String(kind)}`)
  }
  if (!Array.isArray(targets) || !Array.isArray(outputs)) {
    throw new TypeError('Targets and outputs must be arrays.')
  }
  if (targets.length === 0 || targets.length !== outputs.length) {
    throw new RangeError('Targets and outputs must have the same non-empty length.')
  }
  targets.forEach((value, index) => {
    assertFiniteNumber(value, `target ${index}`)
    if (kind === 'bce' && value !== 0 && value !== 1) {
      throw new RangeError('Binary labels must contain only 0 or 1.')
    }
  })
  outputs.forEach((value, index) => assertFiniteNumber(value, `output ${index}`))
}

function immutableVector<T>(values: T[]): readonly T[] {
  return Object.freeze(values)
}

function finiteMean(values: readonly number[]): number {
  const count = values.length
  return assertFiniteResult(
    values.reduce((sum, value) => sum + value / count, 0),
    'mean objective',
  )
}

export function stableSigmoid(logit: number): number {
  assertFiniteNumber(logit, 'logit')
  if (logit >= 0) {
    const exponential = Math.exp(-logit)
    return 1 / (1 + exponential)
  }
  const exponential = Math.exp(logit)
  return exponential / (1 + exponential)
}

export function stableSoftplus(logit: number): number {
  assertFiniteNumber(logit, 'logit')
  return assertFiniteResult(
    Math.max(logit, 0) + Math.log1p(Math.exp(-Math.abs(logit))),
    'softplus',
  )
}

export function stableBinaryCrossEntropy(
  logit: number,
  label: BinaryLabel,
): number {
  assertFiniteNumber(logit, 'logit')
  assertBinaryLabel(label)
  return assertFiniteResult(
    stableSoftplus(logit) - label * logit,
    'stable binary cross-entropy',
  )
}

export function probabilityBinaryCrossEntropy(
  probability: number,
  label: BinaryLabel,
): number {
  assertProbability(probability, false)
  assertBinaryLabel(label)
  return assertFiniteResult(
    -(label * Math.log(probability) + (1 - label) * Math.log1p(-probability)),
    'probability binary cross-entropy',
  )
}

export function evaluateClippedProbabilityBinaryCrossEntropy(
  probability: number,
  label: BinaryLabel,
  epsilon = DEFAULT_CLIPPING_EPSILON,
): ClippedProbabilityBceEvaluation {
  assertProbability(probability, true)
  assertBinaryLabel(label)
  assertFiniteNumber(epsilon, 'epsilon')
  if (epsilon <= 0 || epsilon >= 0.5) {
    throw new RangeError('epsilon must be greater than 0 and less than 0.5.')
  }
  const clippedProbability = Math.min(1 - epsilon, Math.max(epsilon, probability))
  return Object.freeze({
    method: 'clipped-probability-bce',
    status: 'finite',
    value: probabilityBinaryCrossEntropy(clippedProbability, label),
    probability,
    clippedProbability,
    epsilon,
    objectiveChanged: clippedProbability !== probability,
  })
}

export function evaluateLossGradient(
  kind: LossKind,
  targets: readonly number[],
  outputs: readonly number[],
): LossGradientEvaluation {
  assertLossInput(kind, targets, outputs)
  const perElementLosses: number[] = []
  const perElementGradients: number[] = []
  const differentiable: boolean[] = []
  const gradientNotes: Array<string | null> = []

  for (let index = 0; index < targets.length; index += 1) {
    const target = targets[index]!
    const output = outputs[index]!

    if (kind === 'bce') {
      const label = target as BinaryLabel
      perElementLosses.push(stableBinaryCrossEntropy(output, label))
      perElementGradients.push(
        assertFiniteResult(stableSigmoid(output) - label, `BCE gradient ${index}`),
      )
      differentiable.push(true)
      gradientNotes.push(null)
      continue
    }

    const residual = assertFiniteResult(output - target, `residual ${index}`)
    if (kind === 'mse') {
      perElementLosses.push(
        assertFiniteResult(residual * residual, `MSE loss ${index}`),
      )
      perElementGradients.push(
        assertFiniteResult(2 * residual, `MSE gradient ${index}`),
      )
      differentiable.push(true)
      gradientNotes.push(null)
      continue
    }

    perElementLosses.push(Math.abs(residual))
    if (residual === 0) {
      perElementGradients.push(0)
      differentiable.push(false)
      gradientNotes.push(MAE_SUBDIFFERENTIAL_NOTE)
    } else {
      perElementGradients.push(Math.sign(residual))
      differentiable.push(true)
      gradientNotes.push(null)
    }
  }

  const meanObjectiveGradients = perElementGradients.map((gradient, index) =>
    assertFiniteResult(gradient / targets.length, `mean gradient ${index}`),
  )
  return Object.freeze({
    kind,
    perElementLosses: immutableVector(perElementLosses),
    meanObjective: finiteMean(perElementLosses),
    perElementGradients: immutableVector(perElementGradients),
    meanObjectiveGradients: immutableVector(meanObjectiveGradients),
    differentiable: immutableVector(differentiable),
    gradientNotes: immutableVector(gradientNotes),
  })
}

function classifyNumericalValue(value: number): NumericalValue {
  if (Number.isFinite(value)) {
    return Object.freeze({ status: 'finite', value })
  }
  if (Number.isNaN(value)) {
    return Object.freeze({ status: 'nan', value: null })
  }
  return Object.freeze({
    status: value > 0 ? 'positive-infinite' : 'negative-infinite',
    value: null,
  })
}

function naiveProbabilityBinaryCrossEntropy(
  probability: number,
  label: BinaryLabel,
): NumericalValue {
  const value =
    -(label * Math.log(probability) + (1 - label) * Math.log1p(-probability))
  return classifyNumericalValue(value)
}

export function evaluateBceStabilityProbe(): readonly BceStabilityProbeRow[] {
  return Object.freeze(
    BCE_STABILITY_LOGITS.flatMap((logit) =>
      ([0, 1] as const).map((label): BceStabilityProbeRow => {
        const probability = stableSigmoid(logit)
        return Object.freeze({
          source: 'synthetic-stability-probe',
          logit,
          label,
          probability,
          naive: naiveProbabilityBinaryCrossEntropy(probability, label),
          clipped: evaluateClippedProbabilityBinaryCrossEntropy(
            probability,
            label,
            DEFAULT_CLIPPING_EPSILON,
          ),
          stable: Object.freeze({
            method: 'stable-logit-bce',
            status: 'finite',
            value: stableBinaryCrossEntropy(logit, label),
          }),
        })
      }),
    ),
  )
}
