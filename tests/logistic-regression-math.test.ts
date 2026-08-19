import test from 'node:test'
import assert from 'node:assert/strict'

const enginePath = new URL('../src/modules/logistic-regression/engine.ts', import.meta.url)

async function loadMath(): Promise<Record<string, unknown>> {
  return import(enginePath.href) as Promise<Record<string, unknown>>
}

test('Phase 29 logistic math exports the stable score, sigmoid, BCE, and gradient contract', async () => {
  const math = await loadMath()
  for (const name of ['linearScore', 'sigmoidOddsTerms', 'stableMeanBce', 'logisticGradient']) {
    assert.equal(typeof math[name], 'function', `${name} must be a pure exported function`)
  }

  const terms = math.sigmoidOddsTerms as (value: number) => { probability: number }
  const bce = math.stableMeanBce as (logits: readonly number[], labels: readonly number[]) => number
  assert.equal(terms(-1000).probability, 0)
  assert.equal(terms(1000).probability, 1)
  assert.ok(Number.isFinite(bce([1000], [0])))
  assert.ok(Number.isFinite(bce([-1000], [1])))
})

test('Phase 29 finite-difference contract fixes every centered step and the h=1e-6 error boundary', async () => {
  const math = await loadMath()
  const contract = math.LOGISTIC_FINITE_DIFFERENCE_CONTRACT as {
    readonly centeredSteps: readonly number[]
    readonly selectedStep: number
    readonly maxComponentError: number
    readonly requireFullPrecision: boolean
    readonly claimMonotonicError: boolean
  }
  assert.deepEqual(contract.centeredSteps, [1e-1, 1e-2, 1e-3, 1e-4, 1e-5, 1e-6, 1e-7, 1e-8])
  assert.equal(contract.selectedStep, 1e-6)
  assert.equal(contract.maxComponentError, 2e-9)
  assert.equal(contract.requireFullPrecision, true)
  assert.equal(contract.claimMonotonicError, false)
})

test('Phase 29 logistic math rejects mismatched dimensions, invalid targets, and non-finite inputs', async () => {
  const math = await loadMath()
  const score = math.linearScore as (features: readonly number[], coefficients: readonly number[], intercept: number) => number
  const bce = math.stableMeanBce as (logits: readonly number[], labels: readonly number[]) => number
  assert.throws(() => score([1, 2], [0], 0), /dimension/i)
  assert.throws(() => score([1, Number.NaN], [0, 1], 0), /finite/i)
  assert.throws(() => bce([0], [0.5]), /label|target/i)
  assert.throws(() => bce([Number.POSITIVE_INFINITY], [1]), /finite/i)
})

test('Phase 29 canonical Banknote row keeps contributions, probability, BCE, and gradients on one trace', async () => {
  const math = await loadMath()
  const trace = math.oneRowLogisticTerms as (input: {
    features: readonly number[]
    parameters: readonly number[]
    target: number
  }) => {
    contributions: readonly { value: number }[]
    intercept: number
    logit: number
    probability: number
    bce: number
    featureGradient: readonly number[]
    interceptGradient: number
    defaultClass: number
  }
  const row = trace({ features: [1.125, 1.15, -0.975, 0.335], parameters: [-4.6, -4.56, -4.18, 0.3, -1.35], target: 0 })
  assert.ok(Math.abs(row.contributions.reduce((sum, item) => sum + item.value, row.intercept) - row.logit) < 1e-12)
  assert.ok(Number.isFinite(row.probability) && Number.isFinite(row.bce))
  assert.equal(row.featureGradient.length, 4)
  assert.equal(row.defaultClass, row.probability >= 0.5 ? 1 : 0)
})

test('Phase 29 score boundary keeps p = 0.5 and the documented default class bridge', async () => {
  const math = await loadMath()
  const terms = math.sigmoidOddsTerms as (value: number) => { probability: number; defaultClass: number }
  assert.ok(terms(-1e-12).probability < 0.5)
  assert.equal(terms(0).probability, 0.5)
  assert.ok(terms(1e-12).probability > 0.5)
  assert.equal(terms(0).defaultClass, 1)
})

test('Phase 29 batch gradient and central differences agree for all four weights and intercept', async () => {
  const math = await loadMath()
  const analytic = math.logisticGradient as (
    features: readonly (readonly number[])[], targets: readonly number[], parameters: readonly number[],
  ) => readonly number[]
  const numeric = math.centralDifferenceGradient as (
    features: readonly (readonly number[])[], targets: readonly number[], parameters: readonly number[], step?: number,
  ) => readonly number[]
  const features = [[-1, 0.5, 1.2, -0.1], [0.2, -1.4, 0.3, 2], [1.3, 0.1, -0.8, 0.4]]
  const labels = [0, 1, 1]
  const parameters = [0.2, -0.1, 0.05, 0.15, -0.3]
  const expected = analytic(features, labels, parameters)
  const measured = numeric(features, labels, parameters)
  assert.equal(expected.length, 5)
  expected.forEach((value, index) => assert.ok(Math.abs(value - measured[index]!) <= 2e-9, `component ${index}`))
})

test('Phase 29 likelihood, calibration, temperatures, and synthetic diagnostics remain finite and isolated', async () => {
  const math = await loadMath()
  const likelihood = math.bernoulliLogLikelihood as (logits: readonly number[], labels: readonly number[]) => {
    rawProductStatus: string; logLikelihood: number; meanBce: number
  }
  const bins = math.buildCalibrationBins as (probabilities: readonly number[], labels: readonly number[]) => {
    bins: readonly { count: number; observedRate: number | null }[]; expectedCalibrationError: number
  }
  const temperature = math.temperatureProbability as (logit: number, temperature: number) => number
  const circles = math.circleBoundaryDiagnostics as () => readonly { x: number; y: number; target: number }[]
  const result = likelihood(Array.from({ length: 32 }, () => 1000), Array.from({ length: 32 }, () => 0))
  assert.equal(result.rawProductStatus, 'underflowed')
  assert.ok(Number.isFinite(result.logLikelihood) && Number.isFinite(result.meanBce))
  const calibration = bins([0.01, 0.5, 0.99], [0, 1, 1])
  assert.equal(calibration.bins.length, 10)
  assert.ok(calibration.bins.some((bin) => bin.count === 0 && bin.observedRate === null))
  assert.ok(Number.isFinite(calibration.expectedCalibrationError))
  assert.ok(temperature(3, 0.5) > temperature(1, 0.5))
  assert.throws(() => temperature(1, 0), /positive/i)
  assert.ok(circles().every((point) => Number.isFinite(point.x) && Number.isFinite(point.y) && (point.target === 0 || point.target === 1)))
})
