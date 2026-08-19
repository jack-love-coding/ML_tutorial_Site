import test from 'node:test'
import assert from 'node:assert/strict'

const calibrationPath = new URL('../src/modules/logistic-regression/engine.ts', import.meta.url)

test('Phase 29 calibration uses frozen validation logits with explicit positive temperatures and default-label invariance', async () => {
  const { LOGISTIC_CALIBRATION_CONTRACT } = await import(calibrationPath.href) as {
    LOGISTIC_CALIBRATION_CONTRACT: Record<string, unknown>
  }
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.sourceSplit, 'validation')
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.source, 'frozen-banknote-logits')
  assert.deepEqual(LOGISTIC_CALIBRATION_CONTRACT.transforms, ['original', 'softened', 'sharpened'])
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.temperatureDomain, 'positive')
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.preserveLogitOrdering, true)
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.defaultThreshold, 0.5)
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.defaultLabelsInvariant, true)
})

test('Phase 29 calibration fixes bin edges, empty-bin behaviour, and full-precision ECE', async () => {
  const { LOGISTIC_CALIBRATION_CONTRACT } = await import(calibrationPath.href) as {
    LOGISTIC_CALIBRATION_CONTRACT: Record<string, unknown>
  }
  assert.deepEqual(LOGISTIC_CALIBRATION_CONTRACT.binEdges, [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1])
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.emptyBinBehavior, 'retain-with-null-observed-rate')
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.eceStorage, 'full-precision')
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.syntheticDiagnostics, 'isolated-xor-and-circles')
  assert.equal(LOGISTIC_CALIBRATION_CONTRACT.syntheticUsedForBanknoteFit, false)
})
