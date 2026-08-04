export interface RegressionTeachingSample {
  readonly id: string
  readonly x: number
  readonly y: number
}

/**
 * The single transparent regression dataset shared by AI Overview and the
 * beginner gradient-descent course. Keep this array immutable: published
 * notebooks and interaction assets bind their numerical anchors to it.
 */
export const STUDY_SCORE_CLEAR_TREND = Object.freeze([
  Object.freeze({ id: 's1', x: 1, y: 52 }),
  Object.freeze({ id: 's2', x: 2, y: 59 }),
  Object.freeze({ id: 's3', x: 3, y: 65 }),
  Object.freeze({ id: 's4', x: 4, y: 72 }),
  Object.freeze({ id: 's5', x: 5, y: 78 }),
] satisfies readonly RegressionTeachingSample[])

export const GRADIENT_DESCENT_ANCHOR = Object.freeze({
  weight: 6,
  bias: 47,
  learningRate: 0.02,
  leastSquaresWeight: 6.5,
  leastSquaresBias: 45.7,
  leastSquaresMse: 0.06,
  batchSeed: 2801,
  miniBatchSize: 2,
})
