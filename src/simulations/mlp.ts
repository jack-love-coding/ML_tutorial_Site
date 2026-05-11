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

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function forwardPoint(
  point: PlotPoint,
  w1: number[][],
  b1: number[],
  w2: number[],
  b2: number,
  activation: ActivationKind,
) {
  const hiddenPre = w1.map((weights, index) => weights[0] * point.x + weights[1] * point.y + b1[index])
  const hidden = hiddenPre.map((value) => activate(activation, value))
  const outputPre = hidden.reduce((sum, hiddenValue, index) => sum + hiddenValue * w2[index], b2)
  const prediction = sigmoid(outputPre)

  return { hiddenPre, hidden, prediction }
}

function evaluateDataset(
  dataset: PlotPoint[],
  w1: number[][],
  b1: number[],
  w2: number[],
  b2: number,
  activation: ActivationKind,
) {
  let loss = 0
  let correct = 0

  for (const point of dataset) {
    const { prediction } = forwardPoint(point, w1, b1, w2, b2, activation)
    const label = point.label ?? 0
    const safePrediction = clamp(prediction, 1e-6, 1 - 1e-6)

    loss += -(label * Math.log(safePrediction) + (1 - label) * Math.log(1 - safePrediction))
    correct += (prediction >= 0.5 ? 1 : 0) === label ? 1 : 0
  }

  return {
    loss: loss / Math.max(dataset.length, 1),
    accuracy: correct / Math.max(dataset.length, 1),
  }
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

function computeHiddenSeparation(dataset: PlotPoint[], w1: number[][], b1: number[], activation: ActivationKind) {
  const classBuckets = [
    Array.from({ length: w1.length }, () => 0),
    Array.from({ length: w1.length }, () => 0),
  ]
  const counts = [0, 0]

  for (const point of dataset) {
    const label = point.label === 1 ? 1 : 0
    const { hidden } = forwardPoint(point, w1, b1, Array.from({ length: w1.length }, () => 0), 0, activation)
    counts[label] += 1
    hidden.forEach((value, index) => {
      classBuckets[label][index] += value
    })
  }

  if (!counts[0] || !counts[1]) return 0

  const left = classBuckets[0].map((value) => value / counts[0])
  const right = classBuckets[1].map((value) => value / counts[1])

  return Math.sqrt(
    left.reduce((sum, value, index) => sum + (value - (right[index] ?? 0)) ** 2, 0),
  )
}

function computeActivationSaturation(dataset: PlotPoint[], w1: number[][], b1: number[], activation: ActivationKind) {
  const activations = dataset.flatMap((point) => forwardPoint(point, w1, b1, Array.from({ length: w1.length }, () => 0), 0, activation).hidden)
  if (!activations.length) return 0

  if (activation === 'relu') {
    return activations.filter((value) => value <= 0).length / activations.length
  }

  if (activation === 'sigmoid') {
    return activations.filter((value) => value <= 0.08 || value >= 0.92).length / activations.length
  }

  return activations.filter((value) => Math.abs(value) >= 0.92).length / activations.length
}

function computeWeightNorm(w1: number[][], b1: number[], w2: number[], b2: number) {
  const weights = [...w1.flat(), ...b1, ...w2, b2]
  return Math.sqrt(weights.reduce((sum, value) => sum + value ** 2, 0))
}

export function simulateMLP(config: ExperimentConfig): ModuleSimulation {
  const activation = String(config.activation) as ActivationKind
  const hiddenUnits = Number(config.hiddenUnits)
  const learningRate = Number(config.learningRate)
  const epochs = Number(config.epochs)
  const validationSplit = clamp(Number(config.validationSplit ?? 0.28), 0.15, 0.45)
  const sampleCount = 140
  const validationCount = Math.round(sampleCount * validationSplit)
  const trainingCount = sampleCount - validationCount
  const trainDataset = generateDataset({
    kind: String(config.datasetKind),
    sampleCount: trainingCount,
    noise: Number(config.noise),
    seed: 23,
  }).map((point) => ({ ...point, split: 'train' as const }))
  const validationDataset = generateDataset({
    kind: String(config.datasetKind),
    sampleCount: validationCount,
    noise: Number(config.noise) * 1.08,
    seed: 59,
  }).map((point) => ({ ...point, split: 'validation' as const }))
  const random = createSeededRandom(31)
  const gridSize = 42
  const snapshots: TrainingSnapshot[] = []
  const trainLossHistory: PlotPoint[] = []
  const validationLossHistory: PlotPoint[] = []
  const trainAccuracyHistory: PlotPoint[] = []
  const validationAccuracyHistory: PlotPoint[] = []

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

    for (const point of trainDataset) {
      const { hiddenPre, hidden, prediction } = forwardPoint(point, w1, b1, w2, b2, activation)
      const label = point.label ?? 0

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

    const trainMetrics = evaluateDataset(trainDataset, w1, b1, w2, b2, activation)
    const validationMetrics = evaluateDataset(validationDataset, w1, b1, w2, b2, activation)
    const gradientNorm = Math.sqrt(
      [
        ...gradW1.flat(),
        ...gradB1,
        ...gradW2,
        gradB2,
      ].reduce((sum, value) => sum + (value / Math.max(trainDataset.length, 1)) ** 2, 0),
    )
    const generalizationGap = trainMetrics.accuracy - validationMetrics.accuracy
    const hiddenSeparation = computeHiddenSeparation([...trainDataset, ...validationDataset], w1, b1, activation)
    const activationSaturation = computeActivationSaturation(trainDataset, w1, b1, activation)
    const weightNorm = computeWeightNorm(w1, b1, w2, b2)

    trainLossHistory.push({ x: step, y: trainMetrics.loss })
    validationLossHistory.push({ x: step, y: validationMetrics.loss })
    trainAccuracyHistory.push({ x: step, y: trainMetrics.accuracy })
    validationAccuracyHistory.push({ x: step, y: validationMetrics.accuracy })

    snapshots.push({
      step,
      loss: trainMetrics.loss,
      accuracy: trainMetrics.accuracy,
      dataset: trainDataset,
      validationSamples: validationDataset,
      boundaryGrid: computeBoundaryGrid(w1, b1, w2, b2, activation, gridSize),
      gridSize,
      hidden: projectHidden([...trainDataset, ...validationDataset], w1, b1, activation),
      extraMetric: hiddenUnits,
      lossCurves: {
        trainLoss: [...trainLossHistory],
        validationLoss: [...validationLossHistory],
        trainAccuracy: [...trainAccuracyHistory],
        validationAccuracy: [...validationAccuracyHistory],
      },
      derivedMetrics: {
        trainAccuracy: trainMetrics.accuracy,
        validationAccuracy: validationMetrics.accuracy,
        validationLoss: validationMetrics.loss,
        generalizationGap,
        hiddenSeparation,
        activationSaturation,
        weightNorm,
        gradientNorm,
        hiddenUnits,
        activation,
      },
    })

    for (let unit = 0; unit < hiddenUnits; unit += 1) {
      w2[unit] -= learningRate * (gradW2[unit] / trainDataset.length)
      w1[unit][0] -= learningRate * (gradW1[unit][0] / trainDataset.length)
      w1[unit][1] -= learningRate * (gradW1[unit][1] / trainDataset.length)
      b1[unit] -= learningRate * (gradB1[unit] / trainDataset.length)
    }
    b2 -= learningRate * (gradB2 / trainDataset.length)
  }

  return { snapshots }
}
