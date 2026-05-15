import type { ExperimentConfig, ModuleSimulation, TrainingSnapshot } from '../types/ml'
import { generateDataset } from '../utils/datasets'
import { sigmoid } from '../utils/math'

function computeBoundaryGrid(weights: number[], bias: number, gridSize: number) {
  const grid: number[] = []
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const x = -2.5 + (column / (gridSize - 1)) * 5
      const y = 2.5 - (row / (gridSize - 1)) * 5
      const score = weights[0] * x + weights[1] * y + bias
      grid.push(sigmoid(score))
    }
  }
  return grid
}

function clampThreshold(value: number) {
  if (!Number.isFinite(value)) return 0.5
  return Math.min(0.99, Math.max(0.01, value))
}

export function simulateLogisticRegression(config: ExperimentConfig): ModuleSimulation {
  const dataset = generateDataset({
    kind: String(config.datasetKind),
    sampleCount: 96,
    noise: Number(config.noise),
    seed: 11,
  })

  const learningRate = Number(config.learningRate)
  const regularization = Number(config.regularization)
  const epochs = Number(config.epochs)
  const threshold = clampThreshold(Number(config.threshold ?? 0.5))
  const thresholdLogit = Math.log(threshold / (1 - threshold))
  const gridSize = 42
  const snapshots: TrainingSnapshot[] = []

  let weights = [-0.35, 0.1]
  let bias = 0

  for (let step = 0; step <= epochs; step += 1) {
    let loss = 0
    let correct = 0
    let gradX = 0
    let gradY = 0
    let gradBias = 0
    let trueClassProbabilityTotal = 0
    let tp = 0
    let fp = 0
    let tn = 0
    let fn = 0

    for (const point of dataset) {
      const score = weights[0] * point.x + weights[1] * point.y + bias
      const prediction = sigmoid(score)
      const label = point.label ?? 0
      const error = prediction - label
      const safePrediction = Math.min(1 - 1e-6, Math.max(1e-6, prediction))
      const predictedLabel = prediction >= threshold ? 1 : 0

      loss += -(label * Math.log(safePrediction) + (1 - label) * Math.log(1 - safePrediction))
      correct += predictedLabel === label ? 1 : 0
      trueClassProbabilityTotal += label === 1 ? safePrediction : 1 - safePrediction
      if (predictedLabel === 1 && label === 1) tp += 1
      if (predictedLabel === 1 && label === 0) fp += 1
      if (predictedLabel === 0 && label === 0) tn += 1
      if (predictedLabel === 0 && label === 1) fn += 1
      gradX += error * point.x
      gradY += error * point.y
      gradBias += error
    }

    const weightNorm = Math.sqrt(weights[0] ** 2 + weights[1] ** 2)
    const regularizationPenalty = regularization * weightNorm ** 2
    loss = loss / dataset.length + regularizationPenalty

    snapshots.push({
      step,
      loss,
      accuracy: correct / dataset.length,
      dataset,
      params: {
        weights: [...weights],
        bias,
      },
      boundaryGrid: computeBoundaryGrid(weights, bias, gridSize),
      gridSize,
      extraMetric: weightNorm,
      derivedMetrics: {
        threshold,
        thresholdLogit,
        tp,
        fp,
        tn,
        fn,
        precision: tp + fp > 0 ? tp / (tp + fp) : 0,
        recall: tp + fn > 0 ? tp / (tp + fn) : 0,
        weightNorm,
        regularizationPenalty,
        meanTrueClassProbability: trueClassProbabilityTotal / dataset.length,
      },
    })

    weights = [
      weights[0] - learningRate * (gradX / dataset.length + 2 * regularization * weights[0]),
      weights[1] - learningRate * (gradY / dataset.length + 2 * regularization * weights[1]),
    ]
    bias -= learningRate * (gradBias / dataset.length)
  }

  return { snapshots }
}
