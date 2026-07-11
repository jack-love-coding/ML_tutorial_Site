import test from 'node:test'
import assert from 'node:assert/strict'
import {
  DEFAULT_PARAMETERS,
  MATH_TO_CODE_SAMPLES,
} from '../src/modules/math-lab/data/mathToCode/sharedTask.ts'
import {
  centralDifference,
  evaluatePredictionTask,
  meanSquaredError,
  predictBatch,
  predictOne,
} from '../src/modules/math-lab/utils/mathToCode.ts'

test('shared task preserves formula-code-shape agreement', () => {
  assert.equal(predictOne([2, 3], [4, -1], 5), 10)
  assert.deepEqual(predictBatch([[2, 3], [1, 4]], [4, -1], 5), [10, 5])
  assert.equal(meanSquaredError([10, 5], [9, 7]), 2.5)
  assert.ok(Math.abs(centralDifference((x) => x * x, 3, 1e-4) - 6) < 1e-6)
})

test('shared task rejects non-finite and incompatible shapes', () => {
  assert.throws(() => predictOne([1], [1, 2], 0), /same length/)
  assert.throws(() => predictOne([Number.POSITIVE_INFINITY], [1], 0), /finite/)
  assert.throws(() => predictBatch([[1], [1, 2]], [1], 0), /same length/)
  assert.throws(() => predictBatch([[1]], [1], Number.NaN), /finite/)
  assert.throws(() => centralDifference((x) => x, 1, 0), /positive/)
  assert.throws(() => centralDifference(() => Number.NaN, 1, 1e-4), /finite/)
  assert.throws(() => meanSquaredError([Number.NaN], [1]), /finite/)
  assert.throws(() => meanSquaredError([1], [1, 2]), /same length/)
  assert.throws(() => meanSquaredError([], []), /at least one/)
})

test('shared constants reproduce the deterministic prediction task without mutable aliases', () => {
  const matrix = MATH_TO_CODE_SAMPLES.map((sample) => sample.features)
  const targets = MATH_TO_CODE_SAMPLES.map((sample) => sample.target)

  assert.deepEqual(predictBatch(matrix, DEFAULT_PARAMETERS.weights, DEFAULT_PARAMETERS.bias), [10, 5])
  assert.deepEqual(targets, [9, 7])
  assert.ok(Object.isFrozen(MATH_TO_CODE_SAMPLES))
  assert.ok(MATH_TO_CODE_SAMPLES.every((sample) => Object.isFrozen(sample) && Object.isFrozen(sample.features)))
  assert.ok(Object.isFrozen(DEFAULT_PARAMETERS))
  assert.ok(Object.isFrozen(DEFAULT_PARAMETERS.weights))
})

test('prediction task evaluation returns matrix, loss, and central-difference parameter sensitivities', () => {
  const evaluation = evaluatePredictionTask({
    samples: MATH_TO_CODE_SAMPLES,
    parameters: DEFAULT_PARAMETERS,
    derivativeStep: 1e-4,
  })

  assert.deepEqual(evaluation.matrix, [[2, 3], [1, 4]])
  assert.deepEqual(evaluation.targets, [9, 7])
  assert.deepEqual(evaluation.predictions, [10, 5])
  assert.equal(evaluation.mse, 2.5)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[0]) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.weights[1] + 5) < 1e-8)
  assert.ok(Math.abs(evaluation.parameterDerivatives.bias + 1) < 1e-8)

  assert.notEqual(evaluation.matrix, MATH_TO_CODE_SAMPLES.map((sample) => sample.features))
  assert.ok(evaluation.matrix.every((row, index) => row !== MATH_TO_CODE_SAMPLES[index]?.features))
})

test('prediction task evaluation validates every input number and task shape', () => {
  assert.throws(() => evaluatePredictionTask({
    samples: [{ features: [1], target: Number.NaN }],
    parameters: { weights: [1], bias: 0 },
  }), /finite/)
  assert.throws(() => evaluatePredictionTask({
    samples: [{ features: [1, 2], target: 1 }],
    parameters: { weights: [1], bias: 0 },
  }), /same length/)
  assert.throws(() => evaluatePredictionTask({
    samples: [],
    parameters: { weights: [1], bias: 0 },
  }), /at least one/)
  assert.throws(() => evaluatePredictionTask({
    samples: [{ features: [1], target: 1 }],
    parameters: { weights: [1], bias: 0 },
    derivativeStep: Number.POSITIVE_INFINITY,
  }), /finite/)
})
