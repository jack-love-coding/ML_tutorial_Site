import { calculateCnnOutputSize } from '../utils/cnnExplainer.ts'

export type CnnShapeParameterScenarioId = 'same-padding-rgb' | 'valid-grayscale' | 'stride-downsample'
export type CnnParameterComparison = 'conv-fewer' | 'dense-fewer' | 'same'

export interface CnnShapeParameterPrediction {
  outputHeight: number
  outputWidth: number
  outputChannels: number
  convParameterCount: number
  comparison: CnnParameterComparison
}

export interface CnnShapeParameterChallengeInput {
  scenarioId: CnnShapeParameterScenarioId | string
  prediction: CnnShapeParameterPrediction
}

export interface CnnShapeParameterScenario {
  id: CnnShapeParameterScenarioId
  inputHeight: number
  inputWidth: number
  inputChannels: number
  kernelHeight: number
  kernelWidth: number
  stride: number
  padding: number
  outputChannels: number
  bias: boolean
  code: string
}

export interface CnnShapeParameterSnapshot {
  scenario: CnnShapeParameterScenario
  prediction: CnnShapeParameterPrediction
  expected: {
    outputHeight: number
    outputWidth: number
    outputChannels: number
    convParameterCount: number
    denseParameterCount: number
    denseToConvRatio: number
  }
  evidence: {
    heightNumerator: number
    widthNumerator: number
    convWeights: number
    convBiases: number
    denseInputUnits: number
    denseOutputUnits: number
    denseWeights: number
    denseBiases: number
  }
  result: {
    outputShapeCorrect: boolean
    outputChannelsCorrect: boolean
    convParameterCountCorrect: boolean
    comparisonCorrect: boolean
    allCorrect: boolean
  }
}

export const cnnShapeParameterScenarios: CnnShapeParameterScenario[] = [
  {
    id: 'same-padding-rgb',
    inputHeight: 32,
    inputWidth: 32,
    inputChannels: 3,
    kernelHeight: 3,
    kernelWidth: 3,
    stride: 1,
    padding: 1,
    outputChannels: 16,
    bias: true,
    code: 'nn.Conv2d(3, 16, kernel_size=3, padding=1, stride=1)',
  },
  {
    id: 'valid-grayscale',
    inputHeight: 28,
    inputWidth: 28,
    inputChannels: 1,
    kernelHeight: 5,
    kernelWidth: 5,
    stride: 1,
    padding: 0,
    outputChannels: 8,
    bias: true,
    code: 'nn.Conv2d(1, 8, kernel_size=5, padding=0, stride=1)',
  },
  {
    id: 'stride-downsample',
    inputHeight: 64,
    inputWidth: 64,
    inputChannels: 3,
    kernelHeight: 3,
    kernelWidth: 3,
    stride: 2,
    padding: 1,
    outputChannels: 32,
    bias: true,
    code: 'nn.Conv2d(3, 32, kernel_size=3, padding=1, stride=2)',
  },
]

function safeInteger(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

function safeComparison(value: CnnParameterComparison): CnnParameterComparison {
  return value === 'dense-fewer' || value === 'same' ? value : 'conv-fewer'
}

function findScenario(id: string) {
  return cnnShapeParameterScenarios.find((scenario) => scenario.id === id) ?? cnnShapeParameterScenarios[0]
}

function expectedComparison(convParameterCount: number, denseParameterCount: number): CnnParameterComparison {
  if (convParameterCount === denseParameterCount) return 'same'
  return convParameterCount < denseParameterCount ? 'conv-fewer' : 'dense-fewer'
}

export function evaluateCnnShapeParameterChallenge(input: CnnShapeParameterChallengeInput): CnnShapeParameterSnapshot {
  const scenario = findScenario(input.scenarioId)
  const prediction = {
    outputHeight: safeInteger(input.prediction.outputHeight),
    outputWidth: safeInteger(input.prediction.outputWidth),
    outputChannels: safeInteger(input.prediction.outputChannels),
    convParameterCount: safeInteger(input.prediction.convParameterCount),
    comparison: safeComparison(input.prediction.comparison),
  }
  const outputHeight = calculateCnnOutputSize(scenario.inputHeight, scenario.kernelHeight, scenario.stride, scenario.padding)
  const outputWidth = calculateCnnOutputSize(scenario.inputWidth, scenario.kernelWidth, scenario.stride, scenario.padding)
  const convWeights = scenario.kernelHeight * scenario.kernelWidth * scenario.inputChannels * scenario.outputChannels
  const convBiases = scenario.bias ? scenario.outputChannels : 0
  const convParameterCount = convWeights + convBiases
  const denseInputUnits = scenario.inputHeight * scenario.inputWidth * scenario.inputChannels
  const denseOutputUnits = outputHeight * outputWidth * scenario.outputChannels
  const denseWeights = denseInputUnits * denseOutputUnits
  const denseBiases = scenario.bias ? denseOutputUnits : 0
  const denseParameterCount = denseWeights + denseBiases
  const comparison = expectedComparison(convParameterCount, denseParameterCount)
  const outputShapeCorrect = prediction.outputHeight === outputHeight && prediction.outputWidth === outputWidth
  const outputChannelsCorrect = prediction.outputChannels === scenario.outputChannels
  const convParameterCountCorrect = prediction.convParameterCount === convParameterCount
  const comparisonCorrect = prediction.comparison === comparison

  return {
    scenario,
    prediction,
    expected: {
      outputHeight,
      outputWidth,
      outputChannels: scenario.outputChannels,
      convParameterCount,
      denseParameterCount,
      denseToConvRatio: convParameterCount > 0 ? denseParameterCount / convParameterCount : 0,
    },
    evidence: {
      heightNumerator: scenario.inputHeight + 2 * scenario.padding - scenario.kernelHeight,
      widthNumerator: scenario.inputWidth + 2 * scenario.padding - scenario.kernelWidth,
      convWeights,
      convBiases,
      denseInputUnits,
      denseOutputUnits,
      denseWeights,
      denseBiases,
    },
    result: {
      outputShapeCorrect,
      outputChannelsCorrect,
      convParameterCountCorrect,
      comparisonCorrect,
      allCorrect: outputShapeCorrect && outputChannelsCorrect && convParameterCountCorrect && comparisonCorrect,
    },
  }
}
