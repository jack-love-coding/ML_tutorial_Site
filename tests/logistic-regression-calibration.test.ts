import test from 'node:test'
import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'

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

test('Phase 29 analysis preserves ranking and default labels across controlled temperatures', () => {
  const result = spawnSync('python3', [
    '-c',
    [
      'from pathlib import Path',
      'import sys',
      "sys.path.insert(0, str(Path('scripts/logistic-regression').resolve()))",
      'from phase29_analysis import load_banknote_source, train_scratch_logistic, build_temperature_calibration',
      'source = load_banknote_source()',
      'calibration = build_temperature_calibration(source, train_scratch_logistic(source))',
      "assert calibration['orderingPreserved'] is True",
      "assert calibration['defaultLabelsInvariant'] is True",
      "assert len({entry['expectedCalibrationError'] for entry in calibration['modes']}) > 1",
    ].join('; '),
  ], { encoding: 'utf8' })
  assert.equal(result.status, 0, result.stderr)
})
