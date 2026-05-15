import type {
  CalibrationBin,
  ClassificationExample,
  ClassificationMetricSummary,
  ConfusionMatrix,
  ExperimentConfig,
  ModuleSimulation,
  MulticlassMetricRow,
  RocPoint,
  TrainingSnapshot,
} from '../types/ml'
import { createSeededRandom, randomNormal } from '../utils/rng'
import { round, sigmoid } from '../utils/math'

const EPSILON = 1e-9

function safeDivide(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator
}

function clamp01(value: number) {
  return Math.max(0.001, Math.min(0.999, value))
}

function softmax(logits: number[], temperature: number) {
  const safeTemperature = Math.max(0.2, temperature)
  const scaled = logits.map((value) => value / safeTemperature)
  const maxLogit = Math.max(...scaled)
  const exps = scaled.map((value) => Math.exp(value - maxLogit))
  const denominator = exps.reduce((sum, value) => sum + value, 0)
  return exps.map((value) => value / denominator)
}

export function generateClassificationExamples(config: ExperimentConfig): ClassificationExample[] {
  const sampleCount = Number(config.sampleCount ?? 90)
  const prevalence = Number(config.prevalence ?? 0.36)
  const separability = Number(config.separability ?? 1.35)
  const calibrationShift = Number(config.calibrationShift ?? 0)
  const noise = Number(config.noise ?? 0.72)
  const rand = createSeededRandom(Number(config.seed ?? 37))
  const examples: ClassificationExample[] = []

  for (let index = 0; index < sampleCount; index += 1) {
    const label = rand() < prevalence ? 1 : 0
    const center = label === 1 ? separability : -separability
    const score = center + randomNormal(rand, 0, noise)
    const probability = clamp01(sigmoid(score + calibrationShift))

    examples.push({
      id: `example-${index}`,
      label,
      score,
      probability,
      predicted: 0,
      split: index % 5 === 0 ? 'validation' : 'train',
    })
  }

  return examples.sort((left, right) => left.probability - right.probability)
}

export function confusionFromExamples(
  examples: ClassificationExample[],
  threshold: number,
): { examples: ClassificationExample[]; matrix: ConfusionMatrix } {
  const matrix: ConfusionMatrix = { tp: 0, fp: 0, tn: 0, fn: 0 }
  const predictedExamples = examples.map((example) => {
    const predicted = example.probability >= threshold ? 1 : 0
    if (example.label === 1 && predicted === 1) matrix.tp += 1
    if (example.label === 0 && predicted === 1) matrix.fp += 1
    if (example.label === 0 && predicted === 0) matrix.tn += 1
    if (example.label === 1 && predicted === 0) matrix.fn += 1
    return { ...example, predicted }
  })

  return { examples: predictedExamples, matrix }
}

export function computeClassificationMetrics(
  matrix: ConfusionMatrix,
  _examples: ClassificationExample[],
  falsePositiveCost = 1,
  falseNegativeCost = 4,
  auc = 0,
  macroF1 = 0,
  microF1 = 0,
): ClassificationMetricSummary {
  const total = Math.max(1, matrix.tp + matrix.fp + matrix.tn + matrix.fn)
  const positivePredictions = matrix.tp + matrix.fp
  const actualPositives = matrix.tp + matrix.fn
  const predictedRate = positivePredictions / total
  const labelRate = actualPositives / total
  const precision = safeDivide(matrix.tp, matrix.tp + matrix.fp)
  const recall = safeDivide(matrix.tp, matrix.tp + matrix.fn)
  const specificity = safeDivide(matrix.tn, matrix.tn + matrix.fp)
  const f1 = safeDivide(2 * precision * recall, precision + recall)

  return {
    accuracy: safeDivide(matrix.tp + matrix.tn, total),
    precision,
    recall,
    specificity,
    f1,
    fpr: safeDivide(matrix.fp, matrix.fp + matrix.tn),
    tpr: recall,
    positiveRate: predictedRate,
    labelRate,
    predictionBias: predictedRate - labelRate,
    falsePositiveCost,
    falseNegativeCost,
    expectedCost: safeDivide(matrix.fp * falsePositiveCost + matrix.fn * falseNegativeCost, total),
    auc,
    macroF1,
    microF1,
  }
}

export function buildRocCurve(examples: ClassificationExample[]): { points: RocPoint[]; auc: number } {
  const thresholds = [
    1.001,
    ...Array.from(new Set(examples.map((example) => example.probability))).sort((left, right) => right - left),
    -0.001,
  ]
  const points = thresholds.map((threshold) => {
    const { matrix } = confusionFromExamples(examples, threshold)
    return {
      threshold,
      tpr: safeDivide(matrix.tp, matrix.tp + matrix.fn),
      fpr: safeDivide(matrix.fp, matrix.fp + matrix.tn),
    }
  })

  const sorted = [...points].sort((left, right) => left.fpr - right.fpr || left.tpr - right.tpr)
  let auc = 0
  for (let index = 1; index < sorted.length; index += 1) {
    const previous = sorted[index - 1]
    const current = sorted[index]
    auc += (current.fpr - previous.fpr) * (current.tpr + previous.tpr) * 0.5
  }

  return { points: sorted, auc: Math.max(0, Math.min(1, auc)) }
}

export function buildCalibrationBins(examples: ClassificationExample[]): CalibrationBin[] {
  return Array.from({ length: 5 }, (_, index) => {
    const start = index / 5
    const end = (index + 1) / 5
    const binExamples = examples.filter((example) => {
      if (index === 4) return example.probability >= start && example.probability <= end
      return example.probability >= start && example.probability < end
    })
    const count = binExamples.length

    return {
      id: `bin-${index}`,
      start,
      end,
      count,
      predicted: count
        ? binExamples.reduce((sum, example) => sum + example.probability, 0) / count
        : (start + end) / 2,
      observed: count
        ? binExamples.reduce((sum, example) => sum + example.label, 0) / count
        : 0,
    }
  })
}

export function buildMulticlassRows(config: ExperimentConfig): MulticlassMetricRow[] {
  const temperature = Number(config.temperature ?? 1)
  const logits = [
    Number(config.logitA ?? 2.2),
    Number(config.logitB ?? 1.1),
    Number(config.logitC ?? 0.2),
  ]
  const probabilities = softmax(logits, temperature)

  const counts = [
    { label: 'A', actual: 31, predicted: 28, truePositive: 24 },
    { label: 'B', actual: 25, predicted: 30, truePositive: 19 },
    { label: 'C', actual: 20, predicted: 18, truePositive: 14 },
  ]

  return counts.map((item, index) => {
    const precision = safeDivide(item.truePositive, item.predicted)
    const recall = safeDivide(item.truePositive, item.actual)
    return {
      id: `class-${item.label.toLowerCase()}`,
      label: item.label,
      logit: logits[index],
      probability: probabilities[index],
      predictedCount: item.predicted,
      actualCount: item.actual,
      precision,
      recall,
      f1: safeDivide(2 * precision * recall, precision + recall),
    }
  })
}

export function computeMulticlassAverages(rows: MulticlassMetricRow[]) {
  const totalTruePositive = rows.reduce((sum, row) => sum + row.actualCount * row.recall, 0)
  const totalPredicted = rows.reduce((sum, row) => sum + row.predictedCount, 0)
  const totalActual = rows.reduce((sum, row) => sum + row.actualCount, 0)
  const microPrecision = safeDivide(totalTruePositive, totalPredicted)
  const microRecall = safeDivide(totalTruePositive, totalActual)
  const microF1 = safeDivide(2 * microPrecision * microRecall, microPrecision + microRecall)

  return {
    macroF1: safeDivide(rows.reduce((sum, row) => sum + row.f1, 0), rows.length),
    microF1,
  }
}

function nearestRocPoint(points: RocPoint[], threshold: number) {
  return points.reduce((nearest, point) =>
    Math.abs(point.threshold - threshold) < Math.abs(nearest.threshold - threshold) ? point : nearest,
  )
}

function createSnapshot(
  step: number,
  threshold: number,
  config: ExperimentConfig,
  baseExamples: ClassificationExample[],
  roc: { points: RocPoint[]; auc: number },
  multiclassRows: MulticlassMetricRow[],
): TrainingSnapshot {
  const falsePositiveCost = Number(config.falsePositiveCost ?? 1)
  const falseNegativeCost = Number(config.falseNegativeCost ?? 4)
  const { examples, matrix } = confusionFromExamples(baseExamples, threshold)
  const averages = computeMulticlassAverages(multiclassRows)
  const metrics = computeClassificationMetrics(
    matrix,
    examples,
    falsePositiveCost,
    falseNegativeCost,
    roc.auc,
    averages.macroF1,
    averages.microF1,
  )
  const selected = nearestRocPoint(roc.points, threshold)

  return {
    step,
    loss: metrics.expectedCost,
    accuracy: metrics.accuracy,
    classificationExamples: examples,
    confusionMatrix: matrix,
    classificationMetrics: metrics,
    rocPoints: roc.points,
    calibrationBins: buildCalibrationBins(examples),
    multiclassRows,
    probabilityBars: multiclassRows.map((row) => row.probability),
    selectedObservation: {
      threshold: round(threshold, 2),
      selectedTpr: round(selected.tpr, 3),
      selectedFpr: round(selected.fpr, 3),
    },
    derivedMetrics: {
      threshold: round(threshold, 3),
      totalExamples: examples.length,
      predictedPositive: matrix.tp + matrix.fp,
      actualPositive: matrix.tp + matrix.fn,
    },
  }
}

export function simulateClassification(config: ExperimentConfig): ModuleSimulation {
  const threshold = Number(config.threshold ?? 0.5)
  const examples = generateClassificationExamples(config)
  const roc = buildRocCurve(examples)
  const multiclassRows = buildMulticlassRows(config)
  const thresholds = [
    threshold,
    ...Array.from({ length: 19 }, (_, index) => round(0.05 + index * 0.05, 2)),
  ].filter((value, index, all) => all.findIndex((candidate) => Math.abs(candidate - value) < EPSILON) === index)

  return {
    snapshots: thresholds.map((candidate, index) =>
      createSnapshot(index, candidate, config, examples, roc, multiclassRows),
    ),
  }
}
