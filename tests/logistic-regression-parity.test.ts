import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

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
  assert.equal(LOGISTIC_PARITY_CONTRACT.warningPolicy, 'fail-on-every-captured-warning')
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

test('Phase 29 analysis reproduces the fixed scratch and sklearn parity contract', () => {
  const result = spawnSync('python3', [
    '-c',
    [
      'from pathlib import Path',
      'import sys',
      "sys.path.insert(0, str(Path('scripts/logistic-regression').resolve()))",
      'from phase29_analysis import load_banknote_source, train_scratch_logistic, compare_unregularized_sklearn',
      'source = load_banknote_source()',
      'scratch = train_scratch_logistic(source)',
      'parity = compare_unregularized_sklearn(source, scratch)',
      "assert parity['acceptance']['passed'] is True",
      "assert scratch['terminal']['reason'] in {'gradient-norm', 'loss-and-step'}",
      "assert parity['observed']['maxValidationProbabilityDelta'] <= 1e-6",
    ].join('; '),
  ], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})
