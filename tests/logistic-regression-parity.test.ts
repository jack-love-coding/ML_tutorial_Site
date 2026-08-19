import test from 'node:test'
import assert from 'node:assert/strict'

const contractPath = new URL('../src/modules/logistic-regression/engine.ts', import.meta.url)

test('Phase 29 pins the exact scratch Armijo and sklearn 1.9 parity configuration', async () => {
  const { LOGISTIC_PARITY_CONTRACT } = await import(contractPath.href) as {
    LOGISTIC_PARITY_CONTRACT: Record<string, unknown>
  }
  assert.deepEqual(LOGISTIC_PARITY_CONTRACT.featureOrder, ['variance', 'skewness', 'curtosis', 'entropy'])
  assert.equal(LOGISTIC_PARITY_CONTRACT.fitSplit, 'train')
  assert.equal(LOGISTIC_PARITY_CONTRACT.scalerDdof, 0)
  assert.equal(LOGISTIC_PARITY_CONTRACT.intercept, true)
  assert.equal(LOGISTIC_PARITY_CONTRACT.penalty, 'none')
  assert.equal(LOGISTIC_PARITY_CONTRACT.sklearnVersion, '1.9.0')
  assert.equal(LOGISTIC_PARITY_CONTRACT.sklearnSolver, 'lbfgs')
  assert.equal(LOGISTIC_PARITY_CONTRACT.scratchOptimizer, 'armijo')
  assert.equal(LOGISTIC_PARITY_CONTRACT.sklearnMaxIterations, 5000)
  assert.equal(LOGISTIC_PARITY_CONTRACT.scratchMaxIterations, 100000)
  assert.equal(LOGISTIC_PARITY_CONTRACT.gradientNormThreshold, 1e-8)
  assert.equal(LOGISTIC_PARITY_CONTRACT.relativeObjectiveThreshold, 1e-14)
  assert.equal(LOGISTIC_PARITY_CONTRACT.parameterStepNormThreshold, 1e-10)
  assert.equal(LOGISTIC_PARITY_CONTRACT.initialStep, 32)
  assert.equal(LOGISTIC_PARITY_CONTRACT.armijoC1, 1e-4)
  assert.equal(LOGISTIC_PARITY_CONTRACT.armijoShrinkFactor, 0.5)
  assert.equal(LOGISTIC_PARITY_CONTRACT.maxBacktracks, 30)
  assert.equal(LOGISTIC_PARITY_CONTRACT.minimumStep, 1e-12)
  assert.equal(LOGISTIC_PARITY_CONTRACT.warningPolicy, 'fail-on-warning')
  assert.deepEqual(LOGISTIC_PARITY_CONTRACT.requiredTerminalFields, [
    'iterations', 'loss', 'gradientNorm', 'converged', 'stopReason',
  ])
})

test('Phase 29 parity tolerances are immutable and fail instead of being relaxed', async () => {
  const { LOGISTIC_PARITY_CONTRACT } = await import(contractPath.href) as {
    LOGISTIC_PARITY_CONTRACT: Record<string, unknown>
  }
  assert.equal(LOGISTIC_PARITY_CONTRACT.coefficientTolerance, 2e-4)
  assert.equal(LOGISTIC_PARITY_CONTRACT.interceptTolerance, 2e-4)
  assert.equal(LOGISTIC_PARITY_CONTRACT.validationProbabilityTolerance, 1e-6)
  assert.equal(LOGISTIC_PARITY_CONTRACT.onMismatch, 'fail')
  assert.equal(LOGISTIC_PARITY_CONTRACT.allowToleranceRelaxation, false)
})
