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

    for (const point of dataset) {
      const score = weights[0] * point.x + weights[1] * point.y + bias
      const prediction = sigmoid(score)
      const label = point.label ?? 0
      const error = prediction - label
      const safePrediction = Math.min(1 - 1e-6, Math.max(1e-6, prediction))

      loss += -(label * Math.log(safePrediction) + (1 - label) * Math.log(1 - safePrediction))
      correct += (prediction >= 0.5 ? 1 : 0) === label ? 1 : 0
      gradX += error * point.x
      gradY += error * point.y
      gradBias += error
    }

    loss = loss / dataset.length + regularization * (weights[0] ** 2 + weights[1] ** 2)

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
      extraMetric: Math.abs(weights[0]) + Math.abs(weights[1]),
    })

    weights = [
      weights[0] - learningRate * (gradX / dataset.length + 2 * regularization * weights[0]),
      weights[1] - learningRate * (gradY / dataset.length + 2 * regularization * weights[1]),
    ]
    bias -= learningRate * (gradBias / dataset.length)
  }

  return { snapshots }
}
