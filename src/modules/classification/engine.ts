import type {
  ClassificationBinaryMetrics,
  ClassificationConfusionMatrix,
  ClassificationDecisionRow,
  ClassificationFrozenPrediction,
  ClassificationRocPoint,
  ClassificationThresholdPoint,
} from './types.ts'

const EPSILON = 1e-12

function safeDivide(numerator: number, denominator: number): number {
  return denominator === 0 ? 0 : numerator / denominator
}

function requireFinite(value: number, label: string): void {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`)
}

export function validateFrozenPredictions(rows: readonly ClassificationFrozenPrediction[]): void {
  if (!rows.length) throw new TypeError('Frozen predictions cannot be empty.')
  const ids = new Set<number>()
  for (const [index, row] of rows.entries()) {
    if (!Number.isInteger(row.rowId) || row.rowId <= 0 || ids.has(row.rowId)) throw new TypeError(`rows[${index}].rowId is invalid or duplicated.`)
    if (!['train', 'validation', 'test'].includes(row.split)) throw new TypeError(`rows[${index}].split is invalid.`)
    if (row.label !== 0 && row.label !== 1) throw new TypeError(`rows[${index}].label must be binary.`)
    requireFinite(row.logit, `rows[${index}].logit`)
    requireFinite(row.probability, `rows[${index}].probability`)
    if (row.probability < 0 || row.probability > 1) throw new RangeError(`rows[${index}].probability must be in [0, 1].`)
    ids.add(row.rowId)
  }
}

export function decisionRows(
  rows: readonly ClassificationFrozenPrediction[],
  threshold: number,
): ClassificationDecisionRow[] {
  requireFinite(threshold, 'threshold')
  if (threshold < 0 || threshold > 1) throw new RangeError('threshold must be in [0, 1].')
  return rows.map((row) => {
    const predicted = row.probability >= threshold ? 1 : 0
    const outcome = row.label === 1
      ? (predicted === 1 ? 'tp' : 'fn')
      : (predicted === 1 ? 'fp' : 'tn')
    return { ...row, threshold, predicted, outcome }
  })
}

export function confusionMatrix(rows: readonly ClassificationDecisionRow[]): ClassificationConfusionMatrix {
  return rows.reduce<ClassificationConfusionMatrix>((matrix, row) => {
    matrix[row.outcome] += 1
    return matrix
  }, { tp: 0, fp: 0, tn: 0, fn: 0 })
}

export function binaryMetrics(matrix: ClassificationConfusionMatrix): ClassificationBinaryMetrics {
  const total = matrix.tp + matrix.fp + matrix.tn + matrix.fn
  const precision = safeDivide(matrix.tp, matrix.tp + matrix.fp)
  const recall = safeDivide(matrix.tp, matrix.tp + matrix.fn)
  const specificity = safeDivide(matrix.tn, matrix.tn + matrix.fp)
  return {
    accuracy: safeDivide(matrix.tp + matrix.tn, total),
    precision,
    recall,
    specificity,
    f1: safeDivide(2 * precision * recall, precision + recall),
    fpr: safeDivide(matrix.fp, matrix.fp + matrix.tn),
    tpr: recall,
    predictedPositiveRate: safeDivide(matrix.tp + matrix.fp, total),
    actualPositiveRate: safeDivide(matrix.tp + matrix.fn, total),
  }
}

export function evaluateThreshold(
  rows: readonly ClassificationFrozenPrediction[],
  threshold: number,
  falsePositiveCost: number,
  falseNegativeCost: number,
): ClassificationThresholdPoint {
  requireFinite(falsePositiveCost, 'falsePositiveCost')
  requireFinite(falseNegativeCost, 'falseNegativeCost')
  if (falsePositiveCost < 0 || falseNegativeCost < 0) throw new RangeError('Error costs cannot be negative.')
  const matrix = confusionMatrix(decisionRows(rows, threshold))
  const totalCost = matrix.fp * falsePositiveCost + matrix.fn * falseNegativeCost
  const total = matrix.tp + matrix.fp + matrix.tn + matrix.fn
  return {
    threshold,
    confusion: matrix,
    metrics: binaryMetrics(matrix),
    totalCost,
    costPerExample: safeDivide(totalCost, total),
  }
}

export function thresholdSweep(
  rows: readonly ClassificationFrozenPrediction[],
  thresholds: readonly number[],
  falsePositiveCost: number,
  falseNegativeCost: number,
): ClassificationThresholdPoint[] {
  if (!thresholds.length) throw new TypeError('Threshold grid cannot be empty.')
  return thresholds.map((threshold) => evaluateThreshold(rows, threshold, falsePositiveCost, falseNegativeCost))
}

export function selectCostAwareThreshold(points: readonly ClassificationThresholdPoint[]): ClassificationThresholdPoint {
  if (!points.length) throw new TypeError('Threshold points cannot be empty.')
  return points.reduce((best, candidate) => {
    if (candidate.totalCost < best.totalCost - EPSILON) return candidate
    if (Math.abs(candidate.totalCost - best.totalCost) > EPSILON) return best
    const candidateDistance = Math.abs(candidate.threshold - 0.5)
    const bestDistance = Math.abs(best.threshold - 0.5)
    if (candidateDistance < bestDistance - EPSILON) return candidate
    if (Math.abs(candidateDistance - bestDistance) <= EPSILON && candidate.threshold < best.threshold) return candidate
    return best
  })
}

export function buildRocCurve(rows: readonly ClassificationFrozenPrediction[]): { points: ClassificationRocPoint[]; auc: number } {
  const thresholds = [
    1.001,
    ...Array.from(new Set(rows.map((row) => row.probability))).sort((left, right) => right - left),
    -0.001,
  ]
  const points = thresholds.map((threshold) => {
    const matrix = confusionMatrix(decisionRows(rows, Math.max(0, Math.min(1, threshold))))
    return {
      threshold,
      fpr: safeDivide(matrix.fp, matrix.fp + matrix.tn),
      tpr: safeDivide(matrix.tp, matrix.tp + matrix.fn),
    }
  })

  let auc = 0
  for (let index = 1; index < points.length; index += 1) {
    const previous = points[index - 1]
    const current = points[index]
    auc += (current.fpr - previous.fpr) * (current.tpr + previous.tpr) * 0.5
  }
  return { points, auc: Math.max(0, Math.min(1, auc)) }
}
