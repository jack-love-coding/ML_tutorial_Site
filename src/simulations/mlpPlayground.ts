import type {
  MlpActivationKind,
  MlpClassificationDataset,
  MlpFeatureKey,
  MlpLinkSnapshot,
  MlpNodeSnapshot,
  MlpPlaygroundPoint,
  MlpPlaygroundSnapshot,
  MlpPlaygroundState,
  MlpRegressionDataset,
  MlpRegularizationType,
} from '../types/ml'
import { clamp } from '../utils/math'
import { createSeededRandom, randomBetween, randomNormal } from '../utils/rng'

type RuntimeLayerKind = 'input' | 'hidden' | 'output'

interface RuntimeNode {
  id: string
  label: string
  layerIndex: number
  nodeIndex: number
  layerKind: RuntimeLayerKind
  bias: number
  activation: MlpActivationKind
  inputLinks: RuntimeLink[]
  outputLinks: RuntimeLink[]
  totalInput: number
  output: number
  outputDer: number
  inputDer: number
}

interface RuntimeLink {
  id: string
  source: RuntimeNode
  target: RuntimeNode
  weight: number
  isDead: boolean
  accDer: number
}

interface RuntimeNetwork {
  layers: RuntimeNode[][]
  links: RuntimeLink[]
}

interface Evaluation {
  loss: number
  accuracy?: number
  score?: number
}

const DOMAIN: [number, number] = [-6, 6]
const DEFAULT_GRID_SIZE = 56
const CLASSIFICATION_SAMPLES = 500
const REGRESSION_SAMPLES = 720

export const MLP_FEATURES: Array<{ key: MlpFeatureKey; label: string; evaluate: (x: number, y: number) => number }> = [
  { key: 'x1', label: 'X1', evaluate: (x) => x / 6 },
  { key: 'x2', label: 'X2', evaluate: (_x, y) => y / 6 },
  { key: 'x1Squared', label: 'X1^2', evaluate: (x) => (x * x) / 18 - 1 },
  { key: 'x2Squared', label: 'X2^2', evaluate: (_x, y) => (y * y) / 18 - 1 },
  { key: 'x1TimesX2', label: 'X1X2', evaluate: (x, y) => (x * y) / 18 },
  { key: 'sinX1', label: 'sin(X1)', evaluate: (x) => Math.sin(x) },
  { key: 'sinX2', label: 'sin(X2)', evaluate: (_x, y) => Math.sin(y) },
]

export const DEFAULT_MLP_PLAYGROUND_STATE: MlpPlaygroundState = {
  problemType: 'classification',
  classificationDataset: 'circle',
  regressionDataset: 'plane',
  featureKeys: ['x1', 'x2'],
  networkShape: [4, 2],
  activation: 'tanh',
  learningRate: 0.03,
  batchSize: 10,
  regularizationType: 'none',
  regularizationRate: 0,
  noise: 0.08,
  trainRatio: 0.5,
  showTestData: true,
  discretize: false,
  seed: 31415,
  iteration: 0,
}

function activationOutput(kind: MlpActivationKind, value: number) {
  if (kind === 'relu') return Math.max(0, value)
  if (kind === 'sigmoid') return 1 / (1 + Math.exp(-value))
  if (kind === 'linear') return value
  return Math.tanh(value)
}

function activationDerivative(kind: MlpActivationKind, totalInput: number, output: number) {
  if (kind === 'relu') return totalInput <= 0 ? 0 : 1
  if (kind === 'sigmoid') return output * (1 - output)
  if (kind === 'linear') return 1
  return 1 - output * output
}

function regularizationDerivative(type: MlpRegularizationType, weight: number) {
  if (type === 'l1') return weight < 0 ? -1 : weight > 0 ? 1 : 0
  if (type === 'l2') return weight
  return 0
}

function regularizationPenalty(type: MlpRegularizationType, weights: number[]) {
  if (type === 'l1') return weights.reduce((sum, weight) => sum + Math.abs(weight), 0)
  if (type === 'l2') return weights.reduce((sum, weight) => sum + 0.5 * weight * weight, 0)
  return 0
}

function featureDefinition(key: MlpFeatureKey) {
  return MLP_FEATURES.find((feature) => feature.key === key) ?? MLP_FEATURES[0]
}

function constructInput(state: MlpPlaygroundState, x: number, y: number) {
  return state.featureKeys.map((key) => featureDefinition(key).evaluate(x, y))
}

export function normalizeMlpPlaygroundState(partial: Partial<MlpPlaygroundState> = {}): MlpPlaygroundState {
  const merged = { ...DEFAULT_MLP_PLAYGROUND_STATE, ...partial }
  const featureKeys = merged.featureKeys.filter((key, index, values) =>
    MLP_FEATURES.some((feature) => feature.key === key) && values.indexOf(key) === index,
  )
  const networkShape = merged.networkShape
    .slice(0, 6)
    .map((count) => clamp(Math.round(count), 1, 8))

  return {
    ...merged,
    featureKeys: featureKeys.length ? featureKeys : ['x1', 'x2'],
    networkShape,
    learningRate: clamp(Number(merged.learningRate), 0.00001, 10),
    batchSize: clamp(Math.round(Number(merged.batchSize)), 1, 50),
    regularizationRate: clamp(Number(merged.regularizationRate), 0, 10),
    noise: clamp(Number(merged.noise), 0, 0.5),
    trainRatio: clamp(Number(merged.trainRatio), 0.1, 0.9),
    seed: Math.round(Number(merged.seed) || DEFAULT_MLP_PLAYGROUND_STATE.seed),
    iteration: Math.max(0, Math.round(Number(merged.iteration) || 0)),
  }
}

function labelFromPoint(kind: MlpClassificationDataset, x: number, y: number) {
  if (kind === 'circle') return Math.hypot(x, y) < 3 ? 1 : -1
  if (kind === 'xor') return x * y >= 0 ? 1 : -1
  if (kind === 'gauss') return x + y >= 0 ? 1 : -1
  return Math.sin(Math.atan2(y, x) * 2 + Math.hypot(x, y) * 1.15) >= 0 ? 1 : -1
}

function regressionLabel(kind: MlpRegressionDataset, x: number, y: number) {
  if (kind === 'plane') return clamp((x + y) / 10, -1, 1)
  const centers = [
    { x: -4, y: 2.5, sign: 1 },
    { x: 0, y: 2.5, sign: -1 },
    { x: 4, y: 2.5, sign: 1 },
    { x: -4, y: -2.5, sign: -1 },
    { x: 0, y: -2.5, sign: 1 },
    { x: 4, y: -2.5, sign: -1 },
  ]
  return centers.reduce((best, center) => {
    const distance = Math.hypot(x - center.x, y - center.y)
    const value = center.sign * clamp(1 - distance / 2.8, 0, 1)
    return Math.abs(value) > Math.abs(best) ? value : best
  }, 0)
}

export function generateMlpPlaygroundData(stateInput: Partial<MlpPlaygroundState> = {}): MlpPlaygroundPoint[] {
  const state = normalizeMlpPlaygroundState(stateInput)
  const random = createSeededRandom(state.seed)
  const points: Array<Omit<MlpPlaygroundPoint, 'split'>> = []
  const sampleCount = state.problemType === 'classification' ? CLASSIFICATION_SAMPLES : REGRESSION_SAMPLES

  if (state.problemType === 'classification' && state.classificationDataset === 'circle') {
    for (let index = 0; index < sampleCount / 2; index += 1) {
      const angle = randomBetween(random, 0, Math.PI * 2)
      const radius = randomBetween(random, 0, 2.65)
      const x = Math.sin(angle) * radius
      const y = Math.cos(angle) * radius
      const noisyX = x + randomNormal(random, 0, state.noise * 6)
      const noisyY = y + randomNormal(random, 0, state.noise * 6)
      points.push({ x, y, label: labelFromPoint('circle', noisyX, noisyY) })
    }
    for (let index = 0; index < sampleCount / 2; index += 1) {
      const angle = randomBetween(random, 0, Math.PI * 2)
      const radius = randomBetween(random, 3.8, 5.8)
      const x = Math.sin(angle) * radius
      const y = Math.cos(angle) * radius
      const noisyX = x + randomNormal(random, 0, state.noise * 6)
      const noisyY = y + randomNormal(random, 0, state.noise * 6)
      points.push({ x, y, label: labelFromPoint('circle', noisyX, noisyY) })
    }
  } else if (state.problemType === 'classification' && state.classificationDataset === 'gauss') {
    for (let index = 0; index < sampleCount / 2; index += 1) {
      points.push({
        x: randomNormal(random, 2.1, 0.72 + state.noise * 3.6),
        y: randomNormal(random, 2.1, 0.72 + state.noise * 3.6),
        label: 1,
      })
      points.push({
        x: randomNormal(random, -2.1, 0.72 + state.noise * 3.6),
        y: randomNormal(random, -2.1, 0.72 + state.noise * 3.6),
        label: -1,
      })
    }
  } else if (state.problemType === 'classification' && state.classificationDataset === 'spiral') {
    for (let index = 0; index < sampleCount / 2; index += 1) {
      const t = (index / (sampleCount / 2)) * 1.75 * Math.PI * 2
      const radius = (index / (sampleCount / 2)) * 5.2
      points.push({
        x: radius * Math.sin(t) + randomNormal(random, 0, state.noise * 6),
        y: radius * Math.cos(t) + randomNormal(random, 0, state.noise * 6),
        label: 1,
      })
      points.push({
        x: radius * Math.sin(t + Math.PI) + randomNormal(random, 0, state.noise * 6),
        y: radius * Math.cos(t + Math.PI) + randomNormal(random, 0, state.noise * 6),
        label: -1,
      })
    }
  } else if (state.problemType === 'classification') {
    for (let index = 0; index < sampleCount; index += 1) {
      let x = randomBetween(random, -5, 5)
      let y = randomBetween(random, -5, 5)
      x += x > 0 ? 0.35 : -0.35
      y += y > 0 ? 0.35 : -0.35
      const noisyX = x + randomNormal(random, 0, state.noise * 6)
      const noisyY = y + randomNormal(random, 0, state.noise * 6)
      points.push({ x, y, label: labelFromPoint('xor', noisyX, noisyY) })
    }
  } else {
    for (let index = 0; index < sampleCount; index += 1) {
      const x = randomBetween(random, DOMAIN[0], DOMAIN[1])
      const y = randomBetween(random, DOMAIN[0], DOMAIN[1])
      const label = clamp(
        regressionLabel(state.regressionDataset, x, y) + randomNormal(random, 0, state.noise * 0.7),
        -1,
        1,
      )
      points.push({ x, y, label })
    }
  }

  for (let index = points.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1))
    const next = points[index]
    points[index] = points[swapIndex]
    points[swapIndex] = next
  }

  const splitIndex = Math.max(1, Math.floor(points.length * state.trainRatio))
  return points.map((point, index) => ({
    ...point,
    split: index < splitIndex ? 'train' : 'test',
  }))
}

function buildNetwork(state: MlpPlaygroundState): RuntimeNetwork {
  const random = createSeededRandom(state.seed + 4099)
  const shape = [state.featureKeys.length, ...state.networkShape, 1]
  const layers: RuntimeNode[][] = []
  const links: RuntimeLink[] = []

  for (let layerIndex = 0; layerIndex < shape.length; layerIndex += 1) {
    const layerKind: RuntimeLayerKind =
      layerIndex === 0 ? 'input' : layerIndex === shape.length - 1 ? 'output' : 'hidden'
    const layer: RuntimeNode[] = []
    layers.push(layer)

    for (let nodeIndex = 0; nodeIndex < shape[layerIndex]; nodeIndex += 1) {
      const feature = layerKind === 'input' ? featureDefinition(state.featureKeys[nodeIndex]) : undefined
      const node: RuntimeNode = {
        id: layerKind === 'input' ? state.featureKeys[nodeIndex] : `${layerKind}-${layerIndex}-${nodeIndex}`,
        label: feature?.label ?? (layerKind === 'output' ? 'output' : `h${layerIndex}.${nodeIndex + 1}`),
        layerIndex,
        nodeIndex,
        layerKind,
        bias: layerKind === 'input' ? 0 : randomNormal(random, 0, 0.1),
        activation:
          layerKind === 'input' ? 'linear' : layerKind === 'output' && state.problemType === 'regression' ? 'linear' : layerKind === 'output' ? 'tanh' : state.activation,
        inputLinks: [],
        outputLinks: [],
        totalInput: 0,
        output: 0,
        outputDer: 0,
        inputDer: 0,
      }
      layer.push(node)
    }

    if (layerIndex > 0) {
      const previousLayer = layers[layerIndex - 1]
      for (const target of layer) {
        for (const source of previousLayer) {
          const link: RuntimeLink = {
            id: `${source.id}->${target.id}`,
            source,
            target,
            weight: randomNormal(random, 0, Math.sqrt(2 / Math.max(previousLayer.length, 1))),
            isDead: false,
            accDer: 0,
          }
          source.outputLinks.push(link)
          target.inputLinks.push(link)
          links.push(link)
        }
      }
    }
  }

  return { layers, links }
}

function forward(network: RuntimeNetwork, inputs: number[]) {
  const inputLayer = network.layers[0]
  inputLayer.forEach((node, index) => {
    node.output = inputs[index] ?? 0
    node.totalInput = node.output
  })

  for (let layerIndex = 1; layerIndex < network.layers.length; layerIndex += 1) {
    for (const node of network.layers[layerIndex]) {
      node.totalInput = node.bias + node.inputLinks.reduce((sum, link) => sum + link.weight * link.source.output, 0)
      node.output = activationOutput(node.activation, node.totalInput)
    }
  }

  return network.layers[network.layers.length - 1][0].output
}

function evaluate(network: RuntimeNetwork, state: MlpPlaygroundState, data: MlpPlaygroundPoint[]): Evaluation {
  if (!data.length) return { loss: 0, accuracy: state.problemType === 'classification' ? 0 : undefined }

  let loss = 0
  let correct = 0
  let sum = 0
  for (const point of data) {
    const output = forward(network, constructInput(state, point.x, point.y))
    const error = output - point.label
    loss += 0.5 * error * error
    correct += Math.sign(output || 1) === Math.sign(point.label) ? 1 : 0
    sum += point.label
  }

  if (state.problemType === 'classification') {
    return { loss: loss / data.length, accuracy: correct / data.length }
  }

  const mean = sum / data.length
  const variance = data.reduce((total, point) => total + (point.label - mean) ** 2, 0) / data.length || 1
  const mse = (loss * 2) / data.length
  return { loss: loss / data.length, score: 1 - mse / variance }
}

function resetDerivatives(network: RuntimeNetwork) {
  for (const layer of network.layers) {
    for (const node of layer) {
      node.outputDer = 0
      node.inputDer = 0
    }
  }
}

function backprop(network: RuntimeNetwork, target: number, accumBias: Map<string, number>) {
  resetDerivatives(network)
  const outputNode = network.layers[network.layers.length - 1][0]
  outputNode.outputDer = outputNode.output - target

  for (let layerIndex = network.layers.length - 1; layerIndex >= 1; layerIndex -= 1) {
    const layer = network.layers[layerIndex]

    for (const node of layer) {
      node.inputDer = node.outputDer * activationDerivative(node.activation, node.totalInput, node.output)
      accumBias.set(node.id, (accumBias.get(node.id) ?? 0) + node.inputDer)
      for (const link of node.inputLinks) {
        if (!link.isDead) {
          link.accDer += node.inputDer * link.source.output
        }
      }
    }

    if (layerIndex > 1) {
      for (const node of network.layers[layerIndex - 1]) {
        node.outputDer = node.outputLinks.reduce((sum, link) => sum + link.weight * link.target.inputDer, 0)
      }
    }
  }
}

function updateWeights(
  network: RuntimeNetwork,
  state: MlpPlaygroundState,
  accumBias: Map<string, number>,
  batchLength: number,
) {
  let gradientNorm = 0
  const divisor = Math.max(batchLength, 1)

  for (const layer of network.layers.slice(1)) {
    for (const node of layer) {
      const biasGradient = (accumBias.get(node.id) ?? 0) / divisor
      node.bias -= state.learningRate * biasGradient
      gradientNorm += biasGradient * biasGradient
    }
  }

  for (const link of network.links) {
    if (link.isDead) continue
    const dataGradient = link.accDer / divisor
    const regularizationGradient = regularizationDerivative(state.regularizationType, link.weight)
    const nextWeight =
      link.weight - state.learningRate * dataGradient - state.learningRate * state.regularizationRate * regularizationGradient

    if (state.regularizationType === 'l1' && link.weight * nextWeight < 0) {
      link.weight = 0
      link.isDead = true
    } else {
      link.weight = nextWeight
    }

    gradientNorm += dataGradient * dataGradient
    link.accDer = 0
  }

  accumBias.clear()
  return Math.sqrt(gradientNorm)
}

function snapshotNetwork(
  network: RuntimeNetwork,
  state: MlpPlaygroundState,
  gridSize: number,
): { layers: MlpNodeSnapshot[][]; outputGrid: number[] } {
  const nodeGridMap = new Map<string, number[]>()
  for (const layer of network.layers) {
    for (const node of layer) {
      nodeGridMap.set(node.id, [])
    }
  }

  for (let row = 0; row < gridSize; row += 1) {
    const y = DOMAIN[1] - (row / (gridSize - 1)) * (DOMAIN[1] - DOMAIN[0])
    for (let column = 0; column < gridSize; column += 1) {
      const x = DOMAIN[0] + (column / (gridSize - 1)) * (DOMAIN[1] - DOMAIN[0])
      forward(network, constructInput(state, x, y))
      for (const layer of network.layers) {
        for (const node of layer) {
          nodeGridMap.get(node.id)?.push(node.output)
        }
      }
    }
  }

  const layers = network.layers.map((layer) =>
    layer.map<MlpNodeSnapshot>((node) => ({
      id: node.id,
      label: node.label,
      layerIndex: node.layerIndex,
      nodeIndex: node.nodeIndex,
      layerKind: node.layerKind,
      bias: node.bias,
      output: node.output,
      outputGrid: nodeGridMap.get(node.id) ?? [],
    })),
  )
  const outputNode = network.layers[network.layers.length - 1][0]

  return {
    layers,
    outputGrid: nodeGridMap.get(outputNode.id) ?? [],
  }
}

function createSnapshot(
  network: RuntimeNetwork,
  state: MlpPlaygroundState,
  trainData: MlpPlaygroundPoint[],
  testData: MlpPlaygroundPoint[],
  lossHistory: Array<{ iteration: number; trainLoss: number; testLoss: number }>,
  gradientNorm: number,
  gridSize = DEFAULT_GRID_SIZE,
): MlpPlaygroundSnapshot {
  const trainEval = evaluate(network, state, trainData)
  const testEval = evaluate(network, state, testData)
  const weights = network.links.map((link) => link.weight)
  const regularization = regularizationPenalty(state.regularizationType, weights) * state.regularizationRate
  const history = [
    ...lossHistory,
    { iteration: state.iteration, trainLoss: trainEval.loss, testLoss: testEval.loss },
  ].slice(-220)
  const nodeSnapshot = snapshotNetwork(network, state, gridSize)

  return {
    state: { ...state, featureKeys: [...state.featureKeys], networkShape: [...state.networkShape] },
    iteration: state.iteration,
    gridSize,
    xDomain: DOMAIN,
    yDomain: DOMAIN,
    trainData: [...trainData],
    testData: [...testData],
    outputGrid: nodeSnapshot.outputGrid,
    layers: nodeSnapshot.layers,
    links: network.links.map<MlpLinkSnapshot>((link) => ({
      id: link.id,
      sourceId: link.source.id,
      targetId: link.target.id,
      weight: link.weight,
      isDead: link.isDead,
    })),
    trainLoss: trainEval.loss,
    testLoss: testEval.loss,
    trainAccuracy: trainEval.accuracy,
    testAccuracy: testEval.accuracy,
    trainScore: trainEval.score,
    testScore: testEval.score,
    weightNorm: Math.sqrt(weights.reduce((sum, weight) => sum + weight * weight, 0)),
    activeWeights: network.links.filter((link) => !link.isDead && Math.abs(link.weight) > 1e-6).length,
    gradientNorm,
    regularizationPenalty: regularization,
    lossHistory: history,
  }
}

export function createMlpPlaygroundSession(initialState: Partial<MlpPlaygroundState> = {}) {
  let state = normalizeMlpPlaygroundState(initialState)
  let data = generateMlpPlaygroundData(state)
  let trainData = data.filter((point) => point.split === 'train')
  let testData = data.filter((point) => point.split === 'test')
  let network = buildNetwork(state)
  let lossHistory: Array<{ iteration: number; trainLoss: number; testLoss: number }> = []
  let lastGradientNorm = 0

  function reset(nextState: Partial<MlpPlaygroundState> = {}) {
    state = normalizeMlpPlaygroundState({ ...state, ...nextState, iteration: 0 })
    data = generateMlpPlaygroundData(state)
    trainData = data.filter((point) => point.split === 'train')
    testData = data.filter((point) => point.split === 'test')
    network = buildNetwork(state)
    lossHistory = []
    lastGradientNorm = 0
    return snapshot()
  }

  function updateState(partial: Partial<MlpPlaygroundState>) {
    state = normalizeMlpPlaygroundState({ ...state, ...partial })
    return snapshot()
  }

  function regenerateData() {
    return reset({ seed: state.seed + 1 })
  }

  function step(count = 1) {
    for (let stepIndex = 0; stepIndex < count; stepIndex += 1) {
      const accumBias = new Map<string, number>()
      let batchLength = 0
      let gradientAccumulator = 0
      let updates = 0

      for (const point of trainData) {
        forward(network, constructInput(state, point.x, point.y))
        backprop(network, point.label, accumBias)
        batchLength += 1

        if (batchLength >= state.batchSize) {
          gradientAccumulator += updateWeights(network, state, accumBias, batchLength)
          updates += 1
          batchLength = 0
        }
      }

      if (batchLength > 0) {
        gradientAccumulator += updateWeights(network, state, accumBias, batchLength)
        updates += 1
      }

      state = { ...state, iteration: state.iteration + 1 }
      const trainEval = evaluate(network, state, trainData)
      const testEval = evaluate(network, state, testData)
      lossHistory = [...lossHistory, { iteration: state.iteration, trainLoss: trainEval.loss, testLoss: testEval.loss }].slice(-220)
      lastGradientNorm = gradientAccumulator / Math.max(updates, 1)
    }

    return snapshot()
  }

  function snapshot() {
    return createSnapshot(network, state, trainData, testData, lossHistory, lastGradientNorm)
  }

  return {
    snapshot,
    step,
    reset,
    updateState,
    regenerateData,
  }
}
