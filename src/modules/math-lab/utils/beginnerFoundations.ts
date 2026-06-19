import { clamp } from './math.ts'

export type DistributionKind = 'uniform' | 'normal' | 'binomial'

export interface FeatureVectorStoryInput {
  left: number[]
  right: number[]
  matrix: [[number, number], [number, number]]
}

export interface LocalChangeStoryInput {
  x: number
  h: number
  learningRate: number
}

export interface BackpropBlockStoryInput {
  x: number
  weight: number
  bias: number
  target: number
}

export interface DistributionBuilderInput {
  kind: DistributionKind
  sampleCount: number
  seed: number
  targetBin: number
}

function vectorDot(left: number[], right: number[]) {
  const length = Math.min(left.length, right.length)
  let total = 0
  for (let index = 0; index < length; index += 1) {
    total += (left[index] ?? 0) * (right[index] ?? 0)
  }
  return total
}

function vectorNorm(values: number[]) {
  return Math.sqrt(values.reduce((sum, value) => sum + value * value, 0))
}

function lcg(seed: number) {
  let state = Math.max(1, Math.floor(Math.abs(seed))) % 2_147_483_647
  return () => {
    state = (state * 48_271) % 2_147_483_647
    return state / 2_147_483_647
  }
}

function teachingCurve(x: number) {
  return 0.5 * x * x
}

function teachingCurveDerivative(x: number) {
  return x
}

function sigmoid(value: number) {
  return 1 / (1 + Math.exp(-value))
}

function backpropLoss(input: BackpropBlockStoryInput) {
  const prediction = sigmoid(input.weight * input.x + input.bias)
  return 0.5 * (prediction - input.target) ** 2
}

function finiteDifferenceWeight(input: BackpropBlockStoryInput, epsilon = 1e-4) {
  const plus = backpropLoss({ ...input, weight: input.weight + epsilon })
  const minus = backpropLoss({ ...input, weight: input.weight - epsilon })
  return (plus - minus) / (2 * epsilon)
}

export function beginnerLocalLoss(x: number) {
  return teachingCurve(x)
}

export function beginnerLocalLossDerivative(x: number) {
  return teachingCurveDerivative(x)
}

function sampleNormalBin(random: () => number) {
  const u1 = Math.max(1e-12, random())
  const u2 = random()
  const gaussian = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
  return clamp(Math.round(2.5 + gaussian * 0.92), 0, 5)
}

function sampleBinomial(random: () => number) {
  let successes = 0
  for (let trial = 0; trial < 8; trial += 1) {
    if (random() < 0.65) successes += 1
  }
  return successes
}

function sampleUniform(random: () => number) {
  return Math.min(5, Math.floor(random() * 6))
}

export function evaluateFeatureVectorStory(input: FeatureVectorStoryInput) {
  const difference = input.right.map((value, index) => value - (input.left[index] ?? 0))
  const distance = vectorNorm(difference)
  const leftNorm = vectorNorm(input.left)
  const rightNorm = vectorNorm(input.right)
  const cosine = leftNorm === 0 || rightNorm === 0 ? 0 : vectorDot(input.left, input.right) / (leftNorm * rightNorm)
  const [x = 0, y = 0] = input.left
  const projectedLeft = [
    input.matrix[0][0] * x + input.matrix[0][1] * y,
    input.matrix[1][0] * x + input.matrix[1][1] * y,
  ]

  return {
    difference,
    distance,
    cosine,
    dot: vectorDot(input.left, input.right),
    leftNorm,
    rightNorm,
    projectedLeft,
  }
}

export function evaluateLocalChangeStory(input: LocalChangeStoryInput) {
  const x = clamp(input.x, -2.5, 2.5)
  const h = Math.max(0.01, Math.abs(input.h))
  const learningRate = clamp(input.learningRate, 0.01, 2.4)
  const y = teachingCurve(x)
  const nextY = teachingCurve(x + h)
  const secantSlope = (nextY - y) / h
  const derivative = teachingCurveDerivative(x)
  const nextX = x - learningRate * derivative
  const currentLoss = y
  const nextLoss = teachingCurve(nextX)
  const hRows = [1, 0.5, 0.1, 0.01].map((window) => {
    const windowSlope = (teachingCurve(x + window) - y) / window
    return {
      h: window,
      secantSlope: windowSlope,
      error: Math.abs(windowSlope - derivative),
    }
  })
  const learningRateScenarios = [
    { id: 'small', learningRate: 0.15 },
    { id: 'steady', learningRate: 0.75 },
    { id: 'large', learningRate: 2.1 },
  ].map((scenario) => {
    let position = x
    const points = Array.from({ length: 7 }, () => {
      const point = {
        x: position,
        loss: teachingCurve(position),
      }
      position -= scenario.learningRate * teachingCurveDerivative(position)
      return point
    })
    return { ...scenario, points }
  })

  return {
    x,
    h,
    y,
    nextY,
    secantSlope,
    derivative,
    secantError: Math.abs(secantSlope - derivative),
    learningRate,
    nextX,
    currentLoss,
    nextLoss,
    hRows,
    learningRateScenarios,
  }
}

export function evaluateBackpropBlockStory(input: BackpropBlockStoryInput) {
  const x = clamp(input.x, -3, 3)
  const weight = clamp(input.weight, -4, 4)
  const bias = clamp(input.bias, -4, 4)
  const target = clamp(input.target, 0, 1)
  const z = weight * x + bias
  const prediction = sigmoid(z)
  const loss = 0.5 * (prediction - target) ** 2
  const dLossDPrediction = prediction - target
  const dPredictionDZ = prediction * (1 - prediction)
  const dLossDZ = dLossDPrediction * dPredictionDZ
  const dLossDWeight = dLossDZ * x
  const dLossDBias = dLossDZ
  const dLossDX = dLossDZ * weight
  const numericalWeightGradient = finiteDifferenceWeight({ x, weight, bias, target })

  return {
    x,
    weight,
    bias,
    target,
    z,
    prediction,
    loss,
    dLossDPrediction,
    dPredictionDZ,
    dLossDZ,
    dLossDWeight,
    dLossDBias,
    dLossDX,
    numericalWeightGradient,
  }
}

export function evaluateDistributionBuilder(input: DistributionBuilderInput) {
  const sampleCount = Math.max(1, Math.round(input.sampleCount))
  const random = lcg(input.seed)
  const maxBin = input.kind === 'binomial' ? 8 : 5
  const samples = Array.from({ length: sampleCount }, () => {
    if (input.kind === 'normal') return sampleNormalBin(random)
    if (input.kind === 'binomial') return sampleBinomial(random)
    return sampleUniform(random)
  })
  const bins = Array.from({ length: maxBin + 1 }, (_, value) => ({
    value,
    count: samples.filter((sample) => sample === value).length,
  }))
  const probabilities = bins.map((bin) => bin.count / sampleCount)
  const mean = samples.reduce((sum, value) => sum + value, 0) / sampleCount
  const variance = samples.reduce((sum, value) => sum + (value - mean) ** 2, 0) / sampleCount
  const targetBin = clamp(Math.round(input.targetBin), 0, maxBin)
  const targetFrequency = probabilities[targetBin] ?? 0

  return {
    kind: input.kind,
    sampleCount,
    samples,
    bins,
    probabilities,
    mean,
    variance,
    targetBin,
    targetFrequency,
  }
}
