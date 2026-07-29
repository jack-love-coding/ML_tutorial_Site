import test from 'node:test'
import assert from 'node:assert/strict'
import {
  BCE_STABILITY_LOGITS,
  LOCKED_FINITE_DIFFERENCE_STEPS,
  centralDifferenceCoordinate,
  evaluateBceStabilityProbe,
  evaluateClippedProbabilityBinaryCrossEntropy,
  evaluateLossGradient,
  evaluateStepSweep,
  logitFromProbability,
  probabilityBinaryCrossEntropy,
  stableBinaryCrossEntropy,
  stableSigmoid,
  stableSoftplus,
} from '../src/simulations/lossFunctionsMath.ts'

function closeTo(actual: number, expected: number, tolerance = 1e-12) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} should be within ${tolerance} of ${expected}`,
  )
}

function vectorCloseTo(
  actual: readonly number[],
  expected: readonly number[],
  tolerance = 1e-12,
) {
  assert.equal(actual.length, expected.length)
  actual.forEach((value, index) => closeTo(value, expected[index]!, tolerance))
}

test('MSE keeps per-element losses and gradients separate from the mean objective', () => {
  const result = evaluateLossGradient('mse', [1, -1, 2], [3, -2, 2])

  assert.equal(result.kind, 'mse')
  assert.deepEqual(result.perElementLosses, [4, 1, 0])
  closeTo(result.meanObjective, 5 / 3)
  assert.deepEqual(result.perElementGradients, [4, -2, 0])
  vectorCloseTo(result.meanObjectiveGradients, [4 / 3, -2 / 3, 0])
  assert.deepEqual(result.differentiable, [true, true, true])
  assert.deepEqual(result.gradientNotes, [null, null, null])
  assert.equal(Object.isFrozen(result), true)
  assert.equal(Object.isFrozen(result.perElementLosses), true)
  assert.equal(Object.isFrozen(result.meanObjectiveGradients), true)
})

test('MAE exposes the zero-residual kink and uses subgradient convention zero', () => {
  const result = evaluateLossGradient('mae', [1, -1, 2], [3, -2, 2])

  assert.equal(result.kind, 'mae')
  assert.deepEqual(result.perElementLosses, [2, 1, 0])
  assert.equal(result.meanObjective, 1)
  assert.deepEqual(result.perElementGradients, [1, -1, 0])
  vectorCloseTo(result.meanObjectiveGradients, [1 / 3, -1 / 3, 0])
  assert.deepEqual(result.differentiable, [true, true, false])
  assert.equal(result.gradientNotes[0], null)
  assert.match(result.gradientNotes[2] ?? '', /subdifferential.*\[-1, 1\].*convention 0/i)
})

test('BCE uses stable logit losses and exposes per-logit plus mean-objective gradients', () => {
  const result = evaluateLossGradient('bce', [0, 1, 1], [0, 0, 20])

  assert.equal(result.kind, 'bce')
  vectorCloseTo(result.perElementLosses, [
    Math.LN2,
    Math.LN2,
    stableSoftplus(20) - 20,
  ])
  closeTo(
    result.meanObjective,
    result.perElementLosses.reduce((sum, value) => sum + value, 0) / 3,
  )
  vectorCloseTo(result.perElementGradients, [0.5, -0.5, stableSigmoid(20) - 1])
  vectorCloseTo(
    result.meanObjectiveGradients,
    result.perElementGradients.map((value) => value / 3),
  )
  assert.deepEqual(result.differentiable, [true, true, true])
})

test('BCE stable sigmoid and softplus remain finite at fixed extreme logits', () => {
  for (const logit of BCE_STABILITY_LOGITS) {
    assert.equal(Number.isFinite(stableSigmoid(logit)), true)
    assert.equal(Number.isFinite(stableSoftplus(logit)), true)
    for (const label of [0, 1] as const) {
      assert.equal(Number.isFinite(stableBinaryCrossEntropy(logit, label)), true)
    }
  }

  assert.equal(stableSigmoid(-1000), 0)
  assert.equal(stableSigmoid(1000), 1)
  assert.equal(stableBinaryCrossEntropy(-1000, 0), 0)
  assert.equal(stableBinaryCrossEntropy(-1000, 1), 1000)
  assert.equal(stableBinaryCrossEntropy(1000, 0), 1000)
  assert.equal(stableBinaryCrossEntropy(1000, 1), 0)
})

test('BCE probability form agrees on ordinary inputs while clipping reports objective change', () => {
  const probability = 0.8
  const logit = Math.log(probability / (1 - probability))
  closeTo(
    probabilityBinaryCrossEntropy(probability, 1),
    stableBinaryCrossEntropy(logit, 1),
  )

  const ordinary = evaluateClippedProbabilityBinaryCrossEntropy(probability, 1, 1e-12)
  closeTo(ordinary.value, probabilityBinaryCrossEntropy(probability, 1))
  assert.equal(ordinary.epsilon, 1e-12)
  assert.equal(ordinary.objectiveChanged, false)
  assert.equal(ordinary.method, 'clipped-probability-bce')

  const boundary = evaluateClippedProbabilityBinaryCrossEntropy(1, 0, 1e-12)
  assert.equal(Number.isFinite(boundary.value), true)
  assert.equal(boundary.objectiveChanged, true)
})

test('BCE probe publishes ten typed naive, clipped, and stable comparisons', () => {
  const rows = evaluateBceStabilityProbe()

  assert.equal(rows.length, 10)
  assert.deepEqual(
    rows.map(({ logit, label }) => [logit, label]),
    BCE_STABILITY_LOGITS.flatMap((logit) => [[logit, 0], [logit, 1]]),
  )
  rows.forEach((row) => {
    assert.equal(row.source, 'synthetic-stability-probe')
    assert.equal(row.clipped.method, 'clipped-probability-bce')
    assert.equal(row.clipped.epsilon, 1e-12)
    assert.equal(row.stable.method, 'stable-logit-bce')
    assert.equal(row.stable.status, 'finite')
    assert.equal(Number.isFinite(row.stable.value), true)
    if (row.naive.status === 'finite') {
      assert.equal(Number.isFinite(row.naive.value), true)
    } else {
      assert.equal(row.naive.value, null)
      assert.match(row.naive.status, /infinite|nan/)
    }
  })

  const negativeExtreme = rows.filter(({ logit }) => logit === -1000)
  const positiveExtreme = rows.filter(({ logit }) => logit === 1000)
  assert.equal(negativeExtreme.every(({ clipped }) => clipped.objectiveChanged), true)
  assert.equal(positiveExtreme.every(({ clipped }) => clipped.objectiveChanged), true)
  assert.equal(Object.isFrozen(rows), true)
  assert.equal(Object.isFrozen(rows[0]), true)
})

test('loss guards reject empty, mismatched, non-finite, invalid-label, and overflowing inputs', () => {
  assert.throws(() => evaluateLossGradient('mse', [], []), RangeError)
  assert.throws(() => evaluateLossGradient('mae', [1], [1, 2]), RangeError)
  assert.throws(() => evaluateLossGradient('mse', [Number.NaN], [0]), RangeError)
  assert.throws(() => evaluateLossGradient('mse', [0], [Number.POSITIVE_INFINITY]), RangeError)
  assert.throws(() => evaluateLossGradient('mse', [-Number.MAX_VALUE], [Number.MAX_VALUE]), RangeError)
  assert.throws(
    () => evaluateLossGradient('bce', [2 as 0 | 1], [0]),
    /binary labels must contain only 0 or 1/i,
  )
  assert.throws(
    () => evaluateLossGradient('unknown' as 'mse', [0], [0]),
    TypeError,
  )
})

test('scalar BCE guards reject non-finite values, invalid labels, probabilities, and epsilon', () => {
  assert.throws(() => stableSigmoid(Number.NaN), RangeError)
  assert.throws(() => stableSoftplus(Number.POSITIVE_INFINITY), RangeError)
  assert.throws(() => stableBinaryCrossEntropy(0, 2 as 0 | 1), RangeError)
  assert.throws(() => probabilityBinaryCrossEntropy(0, 0), RangeError)
  assert.throws(() => probabilityBinaryCrossEntropy(1, 1), RangeError)
  assert.throws(
    () => evaluateClippedProbabilityBinaryCrossEntropy(Number.NaN, 0),
    RangeError,
  )
  assert.throws(
    () => evaluateClippedProbabilityBinaryCrossEntropy(0.5, 0, 0),
    RangeError,
  )
  assert.throws(
    () => evaluateClippedProbabilityBinaryCrossEntropy(0.5, 0, 0.5),
    RangeError,
  )
})

test('central difference perturbs copied vectors and guards coordinate plus step inputs', () => {
  const values = Object.freeze([1, 2, 3])
  const visited: number[][] = []
  const numerical = centralDifferenceCoordinate(
    (candidate) => {
      visited.push([...candidate])
      return candidate.reduce((sum, value) => sum + value ** 2, 0)
    },
    values,
    1,
    1e-5,
  )

  closeTo(numerical, 4, 1e-9)
  assert.deepEqual(values, [1, 2, 3])
  assert.deepEqual(visited, [
    [1, 2 + 1e-5, 3],
    [1, 2 - 1e-5, 3],
  ])
  assert.throws(() => centralDifferenceCoordinate((vector) => vector[0]!, [], 0, 1e-5), RangeError)
  assert.throws(
    () => centralDifferenceCoordinate((vector) => vector[0]!, [Number.NaN], 0, 1e-5),
    RangeError,
  )
  assert.throws(() => centralDifferenceCoordinate((vector) => vector[0]!, [1], -1, 1e-5), RangeError)
  assert.throws(() => centralDifferenceCoordinate((vector) => vector[0]!, [1], 1, 1e-5), RangeError)
  assert.throws(() => centralDifferenceCoordinate((vector) => vector[0]!, [1], 0, 0), RangeError)
  assert.throws(
    () => centralDifferenceCoordinate(() => Number.POSITIVE_INFINITY, [1], 0, 1e-5),
    RangeError,
  )
})

test('MSE MAE and BCE h sweeps expose locked diagnostics and pass at h=1e-5', () => {
  const cases = [
    {
      kind: 'mse' as const,
      targets: [1, 2],
      outputs: [1.5, 3],
      index: 1,
    },
    {
      kind: 'mae' as const,
      targets: [0, 2],
      outputs: [1, 3],
      index: 0,
    },
    {
      kind: 'bce' as const,
      targets: [0, 1],
      outputs: [0.2, -0.4],
      index: 1,
    },
  ]

  cases.forEach((input) => {
    const sweep = evaluateStepSweep(input)
    assert.deepEqual(sweep.map(({ step }) => step), LOCKED_FINITE_DIFFERENCE_STEPS)
    assert.equal(Object.isFrozen(sweep), true)
    sweep.forEach((row) => {
      assert.equal(row.kind, input.kind)
      assert.equal(row.coordinate, input.index)
      assert.equal(Number.isFinite(row.analyticValue), true)
      assert.equal(Number.isFinite(row.numericalValue), true)
      assert.equal(Number.isFinite(row.absoluteError), true)
      assert.equal(Number.isFinite(row.scaledRelativeError), true)
      assert.equal(row.tolerance, 5e-7)
      assert.equal(row.differentiable, true)
      assert.match(row.status, /pass|fail/)
    })
    const locked = sweep.find(({ step }) => step === 1e-5)
    assert.equal(locked?.status, 'pass')
    assert.ok((locked?.absoluteError ?? Number.POSITIVE_INFINITY) <= 5e-7)
  })
})

test('MAE h sweep reports a kink and never certifies zero residual as a derivative pass', () => {
  const sweep = evaluateStepSweep({
    kind: 'mae',
    targets: [1, 2],
    outputs: [1, 3],
    index: 0,
  })

  sweep.forEach((row) => {
    assert.equal(row.analyticValue, 0)
    closeTo(row.numericalValue, 0, 1e-7)
    assert.equal(row.differentiable, false)
    assert.equal(row.status, 'kink')
    assert.match(row.note ?? '', /not a unique derivative/i)
  })
  assert.equal(sweep.some(({ status }) => status === 'pass'), false)
})

test('finite-difference sweep guards labels, index, tolerance, and every locked step', () => {
  assert.throws(
    () => evaluateStepSweep({ kind: 'mse', targets: [1], outputs: [1], index: -1 }),
    RangeError,
  )
  assert.throws(
    () => evaluateStepSweep({ kind: 'bce', targets: [3], outputs: [0], index: 0 }),
    RangeError,
  )
  assert.throws(
    () => evaluateStepSweep({
      kind: 'mse',
      targets: [1],
      outputs: [1],
      index: 0,
      tolerance: Number.NaN,
    }),
    RangeError,
  )
  assert.deepEqual(
    LOCKED_FINITE_DIFFERENCE_STEPS,
    [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8, 1e-9],
  )
})

test('loss simulation preserves one deterministic snapshot while consuming the pure authority', async () => {
  const { simulateLossFunctions } = await import('../src/simulations/lossFunctions.ts')
  const config = {
    regressionLossKind: 'mse',
    targetValue: 1.2,
    predictionValue: -0.35,
    probability: 0.76,
    classificationLabel: 1,
    includeOutlier: true,
    outlierStrength: 2.2,
    datasetNoise: 0.12,
  }
  const first = simulateLossFunctions(config)
  const second = simulateLossFunctions(config)

  assert.deepEqual(first, second)
  assert.equal(first.snapshots.length, 1)
  const snapshot = first.snapshots[0]!
  closeTo(
    snapshot.loss,
    evaluateLossGradient('mse', [config.targetValue], [config.predictionValue])
      .meanObjective,
  )
  closeTo(
    snapshot.selectedObservation?.bce ?? Number.NaN,
    stableBinaryCrossEntropy(logitFromProbability(config.probability), 1),
  )
  assert.equal(snapshot.lossCurves?.mse?.length, 160)
  assert.equal(snapshot.lossCurves?.mae?.length, 160)
  assert.equal(snapshot.lossCurves?.bcePositive?.length, 160)
  assert.equal(snapshot.lossCurves?.bceNegative?.length, 160)
  assert.equal(snapshot.sampleLossBreakdown?.length, 3)
})
