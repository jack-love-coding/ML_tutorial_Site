import test from 'node:test'
import assert from 'node:assert/strict'

import { registerHooks } from 'node:module'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if (
        (specifier.startsWith('.') || specifier.startsWith('/')) &&
        !/\.[cm]?[jt]sx?$/.test(specifier)
      ) {
        return nextResolve(`${specifier}.ts`, context)
      }
      throw error
    }
  },
})

const {
  buildRocCurve,
  computeClassificationMetrics,
  computeMulticlassAverages,
  confusionFromExamples,
  generateClassificationExamples,
  simulateClassification,
} = await import('../src/simulations/classification.ts')

test('classification simulation computes confusion matrix and binary metrics from threshold', () => {
  const examples = [
    { id: 'a', label: 1, score: 2, probability: 0.91, predicted: 0 },
    { id: 'b', label: 1, score: 1, probability: 0.74, predicted: 0 },
    { id: 'c', label: 0, score: 0, probability: 0.62, predicted: 0 },
    { id: 'd', label: 0, score: -1, probability: 0.24, predicted: 0 },
    { id: 'e', label: 1, score: -2, probability: 0.18, predicted: 0 },
  ]

  const { matrix, examples: predicted } = confusionFromExamples(examples, 0.5)
  assert.deepEqual(matrix, { tp: 2, fp: 1, tn: 1, fn: 1 })
  assert.equal(predicted.filter((example) => example.predicted === 1).length, 3)

  const metrics = computeClassificationMetrics(matrix, predicted, 1, 5, 0.75, 0.6, 0.7)
  assert.equal(metrics.accuracy, 0.6)
  assert.equal(metrics.precision, 2 / 3)
  assert.equal(metrics.recall, 2 / 3)
  assert.equal(metrics.f1, 2 / 3)
  assert.equal(metrics.expectedCost, (1 + 5) / 5)
  assert.equal(metrics.auc, 0.75)
  assert.equal(metrics.macroF1, 0.6)
  assert.equal(metrics.microF1, 0.7)
})

test('threshold changes trade predicted positives against recall', () => {
  const lowThreshold = simulateClassification({
    threshold: 0.3,
    prevalence: 0.32,
    separability: 1.25,
    sampleCount: 80,
    seed: 7,
  }).snapshots[0]
  const highThreshold = simulateClassification({
    threshold: 0.7,
    prevalence: 0.32,
    separability: 1.25,
    sampleCount: 80,
    seed: 7,
  }).snapshots[0]

  assert.ok(lowThreshold.confusionMatrix && highThreshold.confusionMatrix)
  assert.ok(
    Number(lowThreshold.derivedMetrics?.predictedPositive ?? 0) >
      Number(highThreshold.derivedMetrics?.predictedPositive ?? 0),
    'lower threshold should predict more positives',
  )
  assert.ok(
    (lowThreshold.classificationMetrics?.recall ?? 0) >= (highThreshold.classificationMetrics?.recall ?? 0),
    'lower threshold should not reduce recall on the same scores',
  )
})

test('ROC AUC improves when class scores are more separable', () => {
  const weak = generateClassificationExamples({
    prevalence: 0.4,
    separability: 0.35,
    sampleCount: 120,
    seed: 11,
  })
  const strong = generateClassificationExamples({
    prevalence: 0.4,
    separability: 2.1,
    sampleCount: 120,
    seed: 11,
  })

  const weakRoc = buildRocCurve(weak)
  const strongRoc = buildRocCurve(strong)

  assert.ok(weakRoc.points.length > 10)
  assert.ok(strongRoc.points.length > 10)
  assert.ok(strongRoc.auc > weakRoc.auc, 'more separable scores should have higher AUC')
  assert.ok(strongRoc.auc > 0.85, 'strong separation should produce a high AUC')
})

test('classification snapshots expose calibration bins and multiclass summaries', () => {
  const snapshot = simulateClassification({
    threshold: 0.5,
    prevalence: 0.36,
    separability: 1.3,
    sampleCount: 90,
    calibrationShift: 0.4,
    temperature: 0.8,
  }).snapshots[0]

  assert.equal(snapshot.calibrationBins?.length, 5)
  assert.equal(snapshot.multiclassRows?.length, 3)
  assert.ok(snapshot.probabilityBars?.length === 3)
  assert.ok(Math.abs((snapshot.probabilityBars ?? []).reduce((sum, value) => sum + value, 0) - 1) < 1e-9)
  assert.ok(Number.isFinite(snapshot.classificationMetrics?.predictionBias))
  assert.ok(Number(snapshot.classificationMetrics?.macroF1 ?? 0) > 0)
  assert.ok(Number(snapshot.classificationMetrics?.microF1 ?? 0) > 0)
})

test('multiclass averaging keeps macro and micro F1 distinct', () => {
  const rows = [
    { id: 'a', label: 'A', logit: 2, probability: 0.6, predictedCount: 10, actualCount: 8, precision: 0.7, recall: 0.875, f1: 0.7777777778 },
    { id: 'b', label: 'B', logit: 1, probability: 0.3, predictedCount: 7, actualCount: 9, precision: 0.5, recall: 0.3888888889, f1: 0.4375 },
    { id: 'c', label: 'C', logit: 0, probability: 0.1, predictedCount: 3, actualCount: 3, precision: 1, recall: 1, f1: 1 },
  ]

  const averages = computeMulticlassAverages(rows)
  assert.ok(averages.macroF1 > 0.7)
  assert.ok(averages.microF1 > 0.6)
  assert.notEqual(averages.macroF1.toFixed(4), averages.microF1.toFixed(4))
})
