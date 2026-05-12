import { clamp } from './math.ts'

export type TrainingScenario =
  | 'healthy'
  | 'high-learning-rate'
  | 'overfitting'
  | 'vanishing-gradient'
  | 'exploding-gradient'

export interface TensorShapeInput {
  batchSize: number
  inputDim: number
  hiddenDim: number
  biasDim: number
}

export function evaluateTensorShape(input: TensorShapeInput) {
  const batchSize = Math.max(1, Math.round(input.batchSize))
  const inputDim = Math.max(1, Math.round(input.inputDim))
  const hiddenDim = Math.max(1, Math.round(input.hiddenDim))
  const biasDim = Math.max(1, Math.round(input.biasDim))
  const biasCompatible = biasDim === 1 || biasDim === hiddenDim
  const parameterCount = inputDim * hiddenDim + biasDim
  const multiplyAdds = batchSize * inputDim * hiddenDim
  const activationBytes = batchSize * hiddenDim * 4

  return {
    inputShape: [batchSize, inputDim] as const,
    weightShape: [inputDim, hiddenDim] as const,
    biasShape: [biasDim] as const,
    outputShape: biasCompatible ? ([batchSize, hiddenDim] as const) : undefined,
    biasCompatible,
    parameterCount,
    multiplyAdds,
    activationBytes,
  }
}

export function lossForScalarLinearModel(w: number, x: number, b: number, y: number) {
  const prediction = w * x + b
  const residual = prediction - y
  return residual * residual
}

export function evaluateAutodiffGraph(input: {
  w: number
  x: number
  b: number
  y: number
  epsilon?: number
}) {
  const { w, x, b, y } = input
  const epsilon = input.epsilon ?? 1e-4
  const prediction = w * x + b
  const residual = prediction - y
  const loss = residual * residual
  const dLossDPrediction = 2 * residual
  const gradients = {
    w: dLossDPrediction * x,
    b: dLossDPrediction,
    x: dLossDPrediction * w,
  }
  const finiteDifferenceW =
    (lossForScalarLinearModel(w + epsilon, x, b, y) - lossForScalarLinearModel(w - epsilon, x, b, y))
    / (2 * epsilon)

  return {
    prediction,
    residual,
    loss,
    dLossDPrediction,
    gradients,
    finiteDifferenceW,
    gradientCheckError: Math.abs(gradients.w - finiteDifferenceW),
  }
}

export function softmax(logits: number[], temperature = 1) {
  const safeTemperature = Math.max(0.05, temperature)
  const scaled = logits.map((value) => value / safeTemperature)
  const maxLogit = Math.max(...scaled)
  const exponentials = scaled.map((value) => Math.exp(value - maxLogit))
  const total = exponentials.reduce((sum, value) => sum + value, 0)
  return exponentials.map((value) => value / total)
}

export function entropy(probabilities: number[]) {
  return -probabilities.reduce((sum, probability) => {
    if (probability <= 0) return sum
    return sum + probability * Math.log(probability)
  }, 0)
}

export function crossEntropy(probabilities: number[], targetIndex: number) {
  const probability = probabilities[clamp(Math.round(targetIndex), 0, probabilities.length - 1)] ?? 0
  return -Math.log(Math.max(probability, 1e-12))
}

export function klDivergence(left: number[], right: number[]) {
  return left.reduce((sum, probability, index) => {
    if (probability <= 0) return sum
    return sum + probability * Math.log(probability / Math.max(right[index] ?? 0, 1e-12))
  }, 0)
}

export function evaluateProbabilityLab(input: {
  logits: number[]
  temperature: number
  targetIndex: number
}) {
  const probabilities = softmax(input.logits, input.temperature)
  const uniform = probabilities.map(() => 1 / probabilities.length)
  return {
    probabilities,
    crossEntropy: crossEntropy(probabilities, input.targetIndex),
    entropy: entropy(probabilities),
    klToUniform: klDivergence(probabilities, uniform),
    targetProbability: probabilities[clamp(Math.round(input.targetIndex), 0, probabilities.length - 1)] ?? 0,
  }
}

export function evaluateTrainingScenario(scenario: TrainingScenario, steps = 40) {
  const count = Math.max(8, Math.round(steps))
  const series = Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1)

    if (scenario === 'high-learning-rate') {
      const wave = Math.sin(t * Math.PI * 9)
      const trainLoss = 1.2 - 0.25 * t + Math.abs(wave) * (0.25 + t * 0.8)
      return {
        step: index,
        trainLoss,
        valLoss: trainLoss + 0.18 + 0.2 * t,
        gradientNorm: 0.9 + Math.abs(wave) * (1.4 + 1.2 * t),
      }
    }

    if (scenario === 'overfitting') {
      return {
        step: index,
        trainLoss: 1.05 * Math.exp(-3.1 * t) + 0.05,
        valLoss: 0.52 * Math.exp(-1.5 * t) + 0.22 + 1.1 * Math.max(0, t - 0.45) ** 2,
        gradientNorm: 0.65 * Math.exp(-1.2 * t) + 0.08,
      }
    }

    if (scenario === 'vanishing-gradient') {
      return {
        step: index,
        trainLoss: 0.95 - 0.18 * (1 - Math.exp(-1.4 * t)),
        valLoss: 1.02 - 0.14 * (1 - Math.exp(-1.2 * t)),
        gradientNorm: 0.6 * Math.exp(-5.5 * t) + 0.006,
      }
    }

    if (scenario === 'exploding-gradient') {
      const growth = Math.exp(3.1 * t)
      return {
        step: index,
        trainLoss: 0.75 + 0.08 * growth + 0.03 * Math.sin(t * Math.PI * 8),
        valLoss: 0.82 + 0.1 * growth,
        gradientNorm: 0.18 * growth,
      }
    }

    return {
      step: index,
      trainLoss: 1.05 * Math.exp(-3.2 * t) + 0.06,
      valLoss: 1.0 * Math.exp(-2.7 * t) + 0.1,
      gradientNorm: 0.85 * Math.exp(-2.4 * t) + 0.04,
    }
  })

  const first = series[0]
  const last = series[series.length - 1]
  const bestVal = series.reduce((best, point) => (point.valLoss < best.valLoss ? point : best), first)

  return {
    scenario,
    series,
    first,
    last,
    bestVal,
  }
}

export function convolutionOutputSize(inputSize: number, kernelSize: number, stride: number, padding: number) {
  return Math.floor((inputSize + 2 * padding - kernelSize) / stride) + 1
}

export function evaluateAttention(query: number[], keys: number[][], temperature = Math.sqrt(query.length)) {
  const scores = keys.map((key) =>
    key.reduce((sum, value, index) => sum + value * (query[index] ?? 0), 0) / Math.max(0.05, temperature),
  )
  return {
    scores,
    weights: softmax(scores, 1),
  }
}

export function normalizeVector(values: number[]) {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length
  const variance = values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length
  const std = Math.sqrt(variance + 1e-5)

  return {
    mean,
    std,
    normalized: values.map((value) => (value - mean) / std),
  }
}
