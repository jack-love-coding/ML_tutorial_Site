import test from 'node:test'
import assert from 'node:assert/strict'
import { registerHooks } from 'node:module'
import {
  GRADIENT_DESCENT_ANCHOR,
  STUDY_SCORE_CLEAR_TREND,
} from '../src/data/sharedRegressionTeachingData.ts'
import {
  applyGradientUpdate,
  centralDifferenceGradient,
  createEpochBatches,
  evaluateLinearRegression,
  fitLeastSquares,
  simulateLinearGradientTrajectory,
  standardizeRegressionInputs,
} from '../src/simulations/gradientDescentLesson.ts'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if ((specifier.startsWith('.') || specifier.startsWith('/')) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context)
      }
      throw error
    }
  },
})

const close = (actual: number, expected: number, tolerance = 1e-9) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`)
}

test('locked five-row anchor reproduces predictions, residuals, loss, gradient, and update', () => {
  const initial = { weight: 6, bias: 47 }
  const evaluation = evaluateLinearRegression(STUDY_SCORE_CLEAR_TREND, initial)
  assert.deepEqual(evaluation.predictions, [53, 59, 65, 71, 77])
  assert.deepEqual(evaluation.residuals, [-1, 0, 0, 1, 1])
  close(evaluation.mse, 0.6)
  close(evaluation.gradient.weight, -3.2)
  close(evaluation.gradient.bias, -0.4)

  const next = applyGradientUpdate(initial, evaluation.gradient, GRADIENT_DESCENT_ANCHOR.learningRate)
  close(next.weight, 6.064)
  close(next.bias, 47.008)
  close(evaluateLinearRegression(STUDY_SCORE_CLEAR_TREND, next).mse, 0.440192)
})

test('analytic gradient agrees with central differences', () => {
  const evaluation = evaluateLinearRegression(STUDY_SCORE_CLEAR_TREND, { weight: 6, bias: 47 })
  const numerical = centralDifferenceGradient(STUDY_SCORE_CLEAR_TREND, { weight: 6, bias: 47 })
  close(numerical.weight, evaluation.gradient.weight, 1e-8)
  close(numerical.bias, evaluation.gradient.bias, 1e-8)
})

test('least-squares reference and standardization are exact', () => {
  const fit = fitLeastSquares(STUDY_SCORE_CLEAR_TREND)
  close(fit.weight, 6.5)
  close(fit.bias, 45.7)
  close(evaluateLinearRegression(STUDY_SCORE_CLEAR_TREND, fit).mse, 0.06)
  const standardized = standardizeRegressionInputs(STUDY_SCORE_CLEAR_TREND)
  close(standardized.mean, 3)
  close(standardized.scale, Math.sqrt(2))
  close(standardized.samples.reduce((sum, sample) => sum + sample.x, 0), 0)
})

test('mini-batch and SGD use deterministic real sample subsets', () => {
  const first = createEpochBatches(STUDY_SCORE_CLEAR_TREND, 'mini-batch', 0, 2801, 2)
  const replay = createEpochBatches(STUDY_SCORE_CLEAR_TREND, 'mini-batch', 0, 2801, 2)
  assert.deepEqual(first, replay)
  assert.deepEqual(first.map((batch) => batch.sampleIds.length), [2, 2, 1])
  assert.equal(new Set(first.flatMap((batch) => batch.sampleIds)).size, 5)
  assert.ok(first.flatMap((batch) => batch.sampleIds).every((id) => /^s[1-5]$/.test(id)))

  const stochastic = createEpochBatches(STUDY_SCORE_CLEAR_TREND, 'stochastic', 0, 2801)
  assert.equal(stochastic.length, 5)
  assert.ok(stochastic.every((batch) => batch.sampleIds.length === 1))
})

test('trajectory reports instability without clamping parameters', () => {
  const stable = simulateLinearGradientTrajectory({
    samples: STUDY_SCORE_CLEAR_TREND,
    initial: { weight: 6, bias: 47 },
    learningRate: 0.02,
    batchMode: 'full',
    epochs: 10,
  })
  assert.ok(stable.final.mse < stable.initial.mse)
  assert.deepEqual(stable.updates[0].sampleIds, ['s1', 's2', 's3', 's4', 's5'])

  const divergent = simulateLinearGradientTrajectory({
    samples: STUDY_SCORE_CLEAR_TREND,
    initial: { weight: 0, bias: 0 },
    learningRate: 100,
    batchMode: 'full',
    epochs: 100,
    divergenceThreshold: 1e8,
  })
  assert.match(divergent.status, /^diverged-/)
  assert.ok(divergent.updates.length < 100)
  assert.ok(Math.abs(divergent.final.parameters.weight) > 100)
})

test('all public inputs reject NaN and Infinity', () => {
  assert.throws(() => evaluateLinearRegression(STUDY_SCORE_CLEAR_TREND, { weight: Number.NaN, bias: 0 }), /finite/)
  assert.throws(() => applyGradientUpdate({ weight: 0, bias: 0 }, { weight: Infinity, bias: 0 }, 0.1), /finite/)
  assert.throws(() => centralDifferenceGradient(STUDY_SCORE_CLEAR_TREND, { weight: 0, bias: 0 }, 0), /positive/)
})
