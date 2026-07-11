export interface PredictionSample {
  readonly features: readonly number[]
  readonly target: number
}

export interface PredictionParameters {
  readonly weights: readonly number[]
  readonly bias: number
}

export interface PredictionTaskInput {
  readonly samples: readonly PredictionSample[]
  readonly parameters: PredictionParameters
  readonly derivativeStep?: number
}

export interface PredictionTaskEvaluation {
  readonly matrix: readonly (readonly number[])[]
  readonly targets: readonly number[]
  readonly predictions: readonly number[]
  readonly mse: number
  readonly parameterDerivatives: PredictionParameters
}

const FIRST_SAMPLE = Object.freeze({
  features: Object.freeze([2, 3] as const),
  target: 9,
}) satisfies PredictionSample

const SECOND_SAMPLE = Object.freeze({
  features: Object.freeze([1, 4] as const),
  target: 7,
}) satisfies PredictionSample

export const MATH_TO_CODE_SAMPLES: readonly PredictionSample[] = Object.freeze([
  FIRST_SAMPLE,
  SECOND_SAMPLE,
])

export const DEFAULT_PARAMETERS: PredictionParameters = Object.freeze({
  weights: Object.freeze([4, -1] as const),
  bias: 5,
})
