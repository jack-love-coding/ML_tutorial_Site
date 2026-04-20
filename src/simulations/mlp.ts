import type { ExperimentConfig, HiddenPoint, ModuleSimulation, PlotPoint, TrainingSnapshot } from '../types/ml'
import { generateDataset } from '../utils/datasets'
import { sigmoid } from '../utils/math'
import { createSeededRandom, randomNormal } from '../utils/rng'

type ActivationKind = 'relu' | 'sigmoid' | 'tanh'

function activate(kind: ActivationKind, value: number) {
  if (kind === 'relu') return Math.max(0, value)
  if (kind === 'sigmoid') return sigmoid(value)
  return Math.tanh(value)
}

function activateDerivative(kind: ActivationKind, preActivation: number, activated: number) {
  if (kind === 'relu') return preActivation > 0 ? 1 : 0
  if (kind === 'sigmoid') return activated * (1 - activated)
  return 1 - activated * activated
}

function computeBoundaryGrid(
  w1: number[][],
  b1: number[],
  w2: number[],
  b2: number,
  activation: ActivationKind,
  gridSize: number,
) {
  const grid: number[] = []
  for (let row = 0; row < gridSize; row += 1) {
    for (let column = 0; column < gridSize; column += 1) {
      const x = -2.5 + (column / (gridSize - 1)) * 5
      const y = 2.5 - (row / (gridSize - 1)) * 5
      const hidden = w1.map((weights, index) => activate(activation, weights[0] * x + weights[1] * y + b1[index]))
      const output = hidden.reduce((sum, hiddenValue, index) => sum + hiddenValue * w2[index], b2)
      grid.push(sigmoid(output))
    }
  }
  return grid
}

function projectHidden(dataset: PlotPoint[], w1: number[][], b1: number[], activation: ActivationKind): HiddenPoint[] {
  return dataset.map((point) => {
    const firstWeights = w1[0]
    const secondWeights = w1[1] ?? w1[0]
    const firstBias = b1[0]
    const secondBias = b1[1] ?? b1[0]

    return {
      ...point,
      h1: activate(activation, firstWeights[0] * point.x + firstWeights[1] * point.y + firstBias),
      h2: activate(activation, secondWeights[0] * point.x + secondWeights[1] * point.y + secondBias),
    }
  })
}

export function simulateMLP(config: ExperimentConfig): ModuleSimulation {
  const activation = String(config.activation) as ActivationKind
  const hiddenUnits = Number(config.hiddenUnits)
  const learningRate = Number(config.learningRate)
  const epochs = Number(config.epochs)
  const dataset = generateDataset({
    kind: String(config.datasetKind),
    sampleCount: 120,
    noise: Number(config.noise),
    seed: 23,
  })
  const random = createSeededRandom(31)
  const gridSize = 42
  const snapshots: TrainingSnapshot[] = []

  let w1 = Array.from({ length: hiddenUnits }, () => [
    randomNormal(random, 0, 0.45),
    randomNormal(random, 0, 0.45),
  ])
  let b1 = Array.from({ length: hiddenUnits }, () => randomNormal(random, 0, 0.08))
  let w2 = Array.from({ length: hiddenUnits }, () => randomNormal(random, 0, 0.4))
  let b2 = 0

  for (let step = 0; step <= epochs; step += 1) {
    const gradW1 = Array.from({ length: hiddenUnits }, () => [0, 0])
    const gradB1 = Array.from({ length: hiddenUnits }, () => 0)
    const gradW2 = Array.from({ length: hiddenUnits }, () => 0)
    let gradB2 = 0
    let loss = 0
    let correct = 0

    for (const point of dataset) {
      const hiddenPre = w1.map((weights, index) => weights[0] * point.x + weights[1] * point.y + b1[index])
      const hidden = hiddenPre.map((value) => activate(activation, value))
      const outputPre = hidden.reduce((sum, hiddenValue, index) => sum + hiddenValue * w2[index], b2)
      const prediction = sigmoid(outputPre)
      const label = point.label ?? 0
      const safePrediction = Math.min(1 - 1e-6, Math.max(1e-6, prediction))

      loss += -(label * Math.log(safePrediction) + (1 - label) * Math.log(1 - safePrediction))
      correct += (prediction >= 0.5 ? 1 : 0) === label ? 1 : 0

      const outputError = prediction - label
      gradB2 += outputError

      for (let unit = 0; unit < hiddenUnits; unit += 1) {
        gradW2[unit] += outputError * hidden[unit]
        const hiddenError = outputError * w2[unit] * activateDerivative(activation, hiddenPre[unit], hidden[unit])
        gradW1[unit][0] += hiddenError * point.x
        gradW1[unit][1] += hiddenError * point.y
        gradB1[unit] += hiddenError
      }
    }

    snapshots.push({
      step,
      loss: loss / dataset.length,
      accuracy: correct / dataset.length,
      dataset,
      boundaryGrid: computeBoundaryGrid(w1, b1, w2, b2, activation, gridSize),
      gridSize,
      hidden: projectHidden(dataset, w1, b1, activation),
      extraMetric: hiddenUnits,
    })

    for (let unit = 0; unit < hiddenUnits; unit += 1) {
      w2[unit] -= learningRate * (gradW2[unit] / dataset.length)
      w1[unit][0] -= learningRate * (gradW1[unit][0] / dataset.length)
      w1[unit][1] -= learningRate * (gradW1[unit][1] / dataset.length)
      b1[unit] -= learningRate * (gradB1[unit] / dataset.length)
    }
    b2 -= learningRate * (gradB2 / dataset.length)
  }

  return { snapshots }
}
