import test from 'node:test'
import assert from 'node:assert/strict'

const EXPECTED_FEATURE_ORDER = Object.freeze([
  'temp',
  'hum',
  'windspeed',
  'workingday',
  'hr',
] as const)

const EXPECTED_CONTINUOUS_FEATURES = Object.freeze([
  'temp',
  'hum',
  'windspeed',
  'hr',
] as const)

const HAND_ROWS = Object.freeze([
  Object.freeze({
    featureOrder: EXPECTED_FEATURE_ORDER,
    values: Object.freeze([1, 2, 0, 1, -1]),
  }),
  Object.freeze({
    featureOrder: EXPECTED_FEATURE_ORDER,
    values: Object.freeze([0, -1, 2, 0, 1]),
  }),
])

async function loadAuthority() {
  return import('../src/simulations/linearRegressionBike.ts')
}

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

test('feature order scaffold locks D-03 and D-04 without leakage columns', () => {
  assert.deepEqual(EXPECTED_FEATURE_ORDER, [
    'temp',
    'hum',
    'windspeed',
    'workingday',
    'hr',
  ])
  assert.deepEqual(EXPECTED_CONTINUOUS_FEATURES, ['temp', 'hum', 'windspeed', 'hr'])
  assert.equal(EXPECTED_FEATURE_ORDER.includes('atemp' as 'temp'), false)
  assert.equal(EXPECTED_FEATURE_ORDER.includes('casual' as 'temp'), false)
  assert.equal(EXPECTED_FEATURE_ORDER.includes('registered' as 'temp'), false)
})

test('split scaffold locks D-05 and D-14 chronological membership', () => {
  const split = {
    totalRows: 17_379,
    trainEndExclusive: 13_903,
    testStartInclusive: 13_903,
    trainBoundaryInstant: 13_903,
    testBoundaryInstant: 13_904,
  }

  assert.equal(split.trainEndExclusive, Math.floor(split.totalRows * 0.8))
  assert.equal(split.totalRows - split.testStartInclusive, 3_476)
  assert.equal(split.testBoundaryInstant - split.trainBoundaryInstant, 1)
})

test('hand-checkable formula scaffold locks residual sign and MSE divisor n from D-10', () => {
  const weights = [2, -1, 0.5, 3, -2]
  const intercept = 4
  const predictions = HAND_ROWS.map(({ values }) =>
    values.reduce((sum, value, index) => sum + value * weights[index]!, intercept),
  )
  const targets = [6, 5]
  const residuals = predictions.map((prediction, index) => prediction - targets[index]!)
  const mse = residuals.reduce((sum, residual) => sum + residual ** 2, 0) / residuals.length

  assert.deepEqual(predictions, [9, 4])
  assert.deepEqual(residuals, [3, -1])
  assert.equal(mse, 5)
})

test('guard scaffold enumerates D-03 D-04 T-27-01 and T-27-05 fail-closed inputs', () => {
  const rejectedInputClasses = Object.freeze([
    'empty batch',
    'mismatched targets',
    'wrong feature width',
    'wrong feature order',
    'leakage feature',
    'zero preprocessing scale',
    'NaN',
    'Infinity',
    'invalid learning rate',
    'invalid update cap',
    'malformed diagnostics',
  ])

  assert.equal(rejectedInputClasses.length, 11)
  assert.equal(Object.isFrozen(rejectedInputClasses), true)
})

test('prediction residual MSE MAE and R2 follow the D-10 batch fixture', async () => {
  const authority = await loadAuthority()
  const weights = [2, -1, 0.5, 3, -2]
  const intercept = 4

  assert.equal(authority.predictRegressionRow(HAND_ROWS[0]!, weights, intercept), 9)
  assert.deepEqual(
    authority.predictRegressionBatch(HAND_ROWS, weights, intercept),
    [9, 4],
  )

  const result = authority.evaluateRegressionBatch(HAND_ROWS, [6, 5], weights, intercept)
  assert.deepEqual(result.predictions, [9, 4])
  assert.deepEqual(result.residuals, [3, -1])
  assert.equal(result.mse, 5)
  assert.equal(result.mae, 2)
  closeTo(result.r2, -19)
  assert.equal(Object.isFrozen(result), true)
  assert.equal(Object.isFrozen(result.predictions), true)
  assert.equal(Object.isFrozen(result.residuals), true)
})

test('gradient and finite difference agree coordinate-wise under D-10 and D-27', async () => {
  const authority = await loadAuthority()
  const weights = [2, -1, 0.5, 3, -2]
  const intercept = 4
  const targets = [6, 5]
  const gradient = authority.computeMseGradient(HAND_ROWS, targets, weights, intercept)

  vectorCloseTo(gradient.weightGradient, [3, 7, -2, 3, -4])
  closeTo(gradient.interceptGradient, 2)

  const objective = (candidateWeights: readonly number[], candidateIntercept: number) =>
    authority.evaluateRegressionBatch(
      HAND_ROWS,
      targets,
      candidateWeights,
      candidateIntercept,
    ).mse
  const h = 1e-5

  weights.forEach((weight, index) => {
    const plus = [...weights]
    const minus = [...weights]
    plus[index] = weight + h
    minus[index] = weight - h
    const numerical = (objective(plus, intercept) - objective(minus, intercept)) / (2 * h)
    closeTo(numerical, gradient.weightGradient[index]!, 1e-9)
  })

  const interceptNumerical =
    (objective(weights, intercept + h) - objective(weights, intercept - h)) / (2 * h)
  closeTo(interceptNumerical, gradient.interceptGradient, 1e-9)

  const next = authority.batchGradientStep(HAND_ROWS, targets, weights, intercept, 0.1)
  vectorCloseTo(next.weights, [1.7, -1.7, 0.7, 2.7, -1.6])
  closeTo(next.intercept, 3.8)
})

test('coefficient conversion preserves workingday and shifts the intercept under D-15', async () => {
  const authority = await loadAuthority()
  const preprocessing = {
    featureOrder: EXPECTED_FEATURE_ORDER,
    continuousFeatures: EXPECTED_CONTINUOUS_FEATURES,
    means: {
      temp: 10,
      hum: 20,
      windspeed: 30,
      hr: 40,
    },
    scales: {
      temp: 2,
      hum: 4,
      windspeed: 5,
      hr: 8,
    },
  } as const

  const converted = authority.convertRegressionCoefficients(
    [4, 8, 10, 3, 16],
    100,
    preprocessing,
  )

  assert.deepEqual(converted.weights, [2, 2, 2, 3, 2])
  assert.equal(converted.intercept, -100)
  assert.equal(converted.weights[3], 3, 'workingday must remain unscaled')
  assert.equal(Object.isFrozen(converted), true)
  assert.equal(Object.isFrozen(converted.weights), true)
})

test('GD is finite deterministic bounded and reaches a smooth fixture optimum', async () => {
  const authority = await loadAuthority()
  const rows = [
    { featureOrder: EXPECTED_FEATURE_ORDER, values: [1, 0, 0, 0, 0] },
    { featureOrder: EXPECTED_FEATURE_ORDER, values: [-1, 0, 0, 0, 0] },
  ] as const
  const targets = [3, -1]
  const options = {
    learningRate: 0.1,
    maxUpdates: 5_000,
    gradientTolerance: 1e-8,
  } as const

  const first = authority.runBatchGradientDescent(rows, targets, options)
  const second = authority.runBatchGradientDescent(rows, targets, options)

  assert.deepEqual(first, second)
  assert.equal(first.reason, 'gradient-tolerance')
  assert.ok(first.updates > 0 && first.updates < options.maxUpdates)
  vectorCloseTo(first.weights, [2, 0, 0, 0, 0], 1e-7)
  closeTo(first.intercept, 1, 1e-7)
  assert.ok(first.gradientNorm <= options.gradientTolerance)
  assert.equal(first.trace.every((point) => Number.isFinite(point.mse)), true)
  assert.equal(Object.isFrozen(first.trace), true)
})

test('split and locked Bike GD anchors reproduce D-13 through D-17', async () => {
  const authority = await loadAuthority()

  assert.deepEqual(authority.LINEAR_REGRESSION_FEATURE_ORDER, EXPECTED_FEATURE_ORDER)
  assert.deepEqual(
    authority.LINEAR_REGRESSION_CONTINUOUS_FEATURES,
    EXPECTED_CONTINUOUS_FEATURES,
  )
  assert.deepEqual(authority.LINEAR_REGRESSION_SPLIT, {
    totalRows: 17_379,
    trainEndExclusive: 13_903,
    testStartInclusive: 13_903,
    trainBoundaryInstant: 13_903,
    trainBoundaryTimestamp: '2012-08-07 11:00',
    testBoundaryInstant: 13_904,
    testBoundaryTimestamp: '2012-08-07 12:00',
  })

  const { means, scales } = authority.LINEAR_REGRESSION_PREPROCESSING
  closeTo(means.temp, 0.4991699633)
  closeTo(means.hum, 0.6229957563)
  closeTo(means.windspeed, 0.1940965907)
  closeTo(means.hr, 11.5465726822)
  closeTo(scales.temp, 0.1977090288)
  closeTo(scales.hum, 0.1981871966)
  closeTo(scales.windspeed, 0.1230187786)
  closeTo(scales.hr, 6.911986604)
  assert.equal('workingday' in means, false)
  assert.equal('workingday' in scales, false)

  const fit = authority.LINEAR_REGRESSION_REFERENCE_FIT
  vectorCloseTo(
    fit.weights,
    [62.723890953, -37.1164156021, 0.8094458662, 2.3797186778, 47.9014338433],
    1e-10,
  )
  closeTo(fit.intercept, 173.0103284947, 1e-10)
  closeTo(fit.trainMetrics.mse, 18105.23654, 1e-6)
  closeTo(fit.trainMetrics.mae, 98.800052, 1e-6)
  closeTo(fit.trainMetrics.r2, 0.350417, 1e-6)
  closeTo(fit.testMetrics.mse, 40142.538619, 1e-6)
  closeTo(fit.testMetrics.mae, 135.29664, 1e-6)
  closeTo(fit.testMetrics.r2, 0.174252, 1e-6)

  const comparison = authority.LINEAR_REGRESSION_METHOD_COMPARISON
  assert.equal(comparison.gradientDescent.updates, 772)
  closeTo(comparison.gradientDescent.gradientNorm, 9.96e-9, 1e-12)
  assert.ok(comparison.gradientDescent.maxCoefficientDelta <= 1e-6)
  assert.ok(comparison.normalEquation.maxCoefficientDelta <= 1e-6)
  assert.ok(comparison.scikitLearn.maxCoefficientDelta <= 1e-6)
  assert.equal(authority.compareRegressionMethods(comparison).agrees, true)
})

test('prediction rejects malformed order leakage width and non-finite numeric states', async () => {
  const authority = await loadAuthority()
  const weights = [1, 1, 1, 1, 1]

  assert.throws(
    () => authority.predictRegressionBatch([], weights, 0),
    RangeError,
  )
  assert.throws(
    () => authority.predictRegressionBatch(
      Array.from({ length: 20_001 }, () => HAND_ROWS[0]!),
      weights,
      0,
    ),
    RangeError,
  )
  assert.throws(
    () => authority.predictRegressionRow(
      { featureOrder: EXPECTED_FEATURE_ORDER, values: [1, 2] },
      weights,
      0,
    ),
    RangeError,
  )
  assert.throws(
    () => authority.predictRegressionRow(
      {
        featureOrder: ['hum', 'temp', 'windspeed', 'workingday', 'hr'],
        values: [1, 2, 3, 0, 4],
      },
      weights,
      0,
    ),
    TypeError,
  )
  assert.throws(
    () => authority.predictRegressionRow(
      {
        featureOrder: ['temp', 'hum', 'windspeed', 'casual', 'hr'],
        values: [1, 2, 3, 4, 5],
      },
      weights,
      0,
    ),
    TypeError,
  )
  assert.throws(
    () => authority.predictRegressionRow(
      { featureOrder: EXPECTED_FEATURE_ORDER, values: [1, 2, 3, 0, Number.NaN] },
      weights,
      0,
    ),
    RangeError,
  )
  assert.throws(
    () => authority.predictRegressionRow(HAND_ROWS[0]!, weights, Number.POSITIVE_INFINITY),
    RangeError,
  )
  assert.throws(
    () => authority.convertRegressionCoefficients(
      weights,
      0,
      {
        featureOrder: EXPECTED_FEATURE_ORDER,
        continuousFeatures: EXPECTED_CONTINUOUS_FEATURES,
        means: { temp: 0, hum: 0, windspeed: 0, hr: 0 },
        scales: { temp: 1, hum: 1, windspeed: 0, hr: 1 },
      },
    ),
    RangeError,
  )
  assert.throws(
    () => authority.runBatchGradientDescent(HAND_ROWS, [1, 2], {
      learningRate: 0,
      maxUpdates: 10,
      gradientTolerance: 1e-8,
    }),
    RangeError,
  )
  assert.throws(
    () => authority.runBatchGradientDescent(HAND_ROWS, [1, 2], {
      learningRate: 0.1,
      maxUpdates: 0,
      gradientTolerance: 1e-8,
    }),
    RangeError,
  )
  assert.throws(
    () => authority.evaluateRegressionBatch(HAND_ROWS, [1], weights, 0),
    RangeError,
  )
  assert.throws(
    () => authority.evaluateRegressionBatch(HAND_ROWS, [1, 1], weights, 0),
    RangeError,
  )
  assert.throws(
    () => authority.deriveHeldoutDiagnostics({} as never),
    RangeError,
  )
})

test('diagnostic reducers retain D-19 through D-24 staged Bike meanings', async () => {
  const authority = await loadAuthority()
  const diagnostics = authority.deriveHeldoutDiagnostics(
    authority.LINEAR_REGRESSION_HELDOUT_DIAGNOSTIC_INPUT,
  )

  assert.deepEqual(
    diagnostics.hourlyResiduals
      .filter(({ hour }: { hour: number }) => [8, 17, 23].includes(hour))
      .map(({ hour, meanResidual }: { hour: number; meanResidual: number }) => [
        hour,
        Math.round(meanResidual * 10) / 10,
      ]),
    [[8, -367.4], [17, -366.6], [23, 118.1]],
  )
  assert.ok(
    diagnostics.predictionBins.at(-1)!.residualStdDev
      > diagnostics.predictionBins[0]!.residualStdDev,
  )
  closeTo(diagnostics.predictionBins[0]!.residualStdDev, 136, 1e-9)
  closeTo(diagnostics.predictionBins.at(-1)!.residualStdDev, 209.2, 1e-9)
  closeTo(diagnostics.predictionBins[0]!.mae, 78.4, 1e-9)
  closeTo(diagnostics.predictionBins.at(-1)!.mae, 181.7, 1e-9)
  assert.deepEqual(
    diagnostics.namedCases.map(({ instant }: { instant: number }) => instant),
    [17_213, 15_628, 14_965, 15_604],
  )
  closeTo(diagnostics.coefficientStability.baseTemp, 62.723890953, 1e-10)
  closeTo(diagnostics.coefficientStability.atempOlsTemp, 14.34, 1e-12)
  closeTo(diagnostics.coefficientStability.atempOlsAtemp, 48.8, 1e-12)
  assert.equal(diagnostics.coefficientStability.ridgeObjective, 'mse-plus-l2')
  assert.equal(diagnostics.coefficientStability.lassoObjective, 'mse-plus-l1')
  assert.equal(diagnostics.log1pComparison.rawTargetScale, 'rental-count')
  assert.equal(diagnostics.log1pComparison.transformedTargetScale, 'log1p-rental-count')
  assert.equal(Object.isFrozen(diagnostics), true)
})
