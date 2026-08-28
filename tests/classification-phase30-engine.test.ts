import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if ((specifier.startsWith('.') || specifier.startsWith('/')) && !/\.[cm]?[jt]sx?$/.test(specifier)) return nextResolve(`${specifier}.ts`, context)
      throw error
    }
  },
})

const root = new URL('../', import.meta.url)
const predictions = JSON.parse(readFileSync(new URL('public/classification/phase-30/outputs/validation-predictions.json', root), 'utf8'))
const publishedSweep = JSON.parse(readFileSync(new URL('public/classification/phase-30/outputs/threshold-sweep.json', root), 'utf8'))
const publishedRoc = JSON.parse(readFileSync(new URL('public/classification/phase-30/outputs/roc.json', root), 'utf8'))
const publishedDecision = JSON.parse(readFileSync(new URL('public/classification/phase-30/outputs/cost-selection.json', root), 'utf8'))

const {
  binaryMetrics,
  buildRocCurve,
  confusionMatrix,
  decisionRows,
  evaluateThreshold,
  selectCostAwareThreshold,
  thresholdSweep,
  validateFrozenPredictions,
} = await import('../src/modules/classification/engine.ts')

function close(actual: number, expected: number, tolerance = 1e-12) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`)
}

test('Phase 30 keeps score, probability, threshold, prediction, and actual label distinct', () => {
  validateFrozenPredictions(predictions)
  const source = predictions.find((row: { probability: number }) => row.probability >= 0.09)
  assert.ok(source)
  const [decision] = decisionRows([source], 0.09)
  assert.equal(decision.logit, source.logit)
  assert.equal(decision.probability, source.probability)
  assert.equal(decision.threshold, 0.09)
  assert.ok(decision.predicted === 0 || decision.predicted === 1)
  assert.equal(decision.label, source.label)
  assert.notEqual('predicted' in source, true, 'frozen model output must not bake in one decision threshold')
})

test('TypeScript reproduces the published validation threshold sweep and selected threshold', () => {
  const points = thresholdSweep(predictions, publishedSweep.thresholds, 1, 5)
  assert.equal(points.length, 99)
  for (const [index, point] of points.entries()) {
    const published = publishedSweep.points[index]
    assert.equal(point.threshold, published.threshold)
    assert.deepEqual(point.confusion, published.confusion)
    assert.equal(point.totalCost, published.totalCost)
    close(point.metrics.precision, published.metrics.precision)
    close(point.metrics.recall, published.metrics.recall)
    close(point.metrics.f1, published.metrics.f1)
  }
  const selected = selectCostAwareThreshold(points)
  assert.equal(selected.threshold, 0.09)
  assert.equal(selected.threshold, publishedDecision.selectedThreshold)
  assert.deepEqual(selected.confusion, { tp: 90, fp: 2, tn: 113, fn: 1 })
})

test('ROC and AUC reproduce validation ranking and remain separate from threshold selection', () => {
  const roc = buildRocCurve(predictions)
  assert.equal(roc.points.length, publishedRoc.points.length)
  close(roc.auc, publishedRoc.auc)
  assert.equal(publishedRoc.thresholdSelectionAllowed, false)
  assert.notEqual(publishedDecision.selectedThreshold, 0.5)
})

test('cost selection is validation-only and the locked test is reported once', () => {
  assert.equal(publishedDecision.selectionSplit, 'validation')
  assert.equal(publishedDecision.finalEvaluationSplit, 'test')
  assert.equal(publishedDecision.testEvaluations, 1)
  assert.equal(publishedDecision.reselectionAllowed, false)
  assert.deepEqual(publishedDecision.variation, { minimum: 0.01, maximum: 0.5 })
  assert.deepEqual(publishedDecision.lockedTest.confusion, { tp: 91, fp: 4, tn: 110, fn: 1 })
})

test('metric calculations handle empty predicted-positive cells without NaN', () => {
  const rows = decisionRows([
    { rowId: 1, split: 'validation', label: 1, logit: -1, probability: 0.2 },
    { rowId: 2, split: 'validation', label: 0, logit: -2, probability: 0.1 },
  ], 1)
  const matrix = confusionMatrix(rows)
  const metrics = binaryMetrics(matrix)
  assert.equal(metrics.precision, 0)
  for (const value of Object.values(metrics)) assert.ok(Number.isFinite(value))
  assert.throws(() => evaluateThreshold(predictions, Number.NaN, 1, 5), /finite/)
  assert.throws(() => validateFrozenPredictions([{ ...predictions[0], probability: 2 }]), /\[0, 1\]/)
})
