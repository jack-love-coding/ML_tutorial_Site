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
