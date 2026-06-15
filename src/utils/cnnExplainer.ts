import type * as tf from '@tensorflow/tfjs'
import { withPublicBase } from './publicPath.ts'

export type CnnLayerKind = 'input' | 'conv' | 'relu' | 'pool' | 'flatten' | 'dense'

export interface CnnLinkSnapshot {
  sourceLayerIndex: number
  sourceNodeIndex: number
  targetLayerIndex: number
  targetNodeIndex: number
  weight?: number | number[] | number[][]
  sourcePosition?: {
    row: number
    col: number
  }
}

export interface CnnNodeSnapshot {
  id: string
  layerName: string
  layerIndex: number
  index: number
  kind: CnnLayerKind
  output: number | number[][]
  bias: number
  logit?: number
  realIndex?: number
  inputLinks: CnnLinkSnapshot[]
  outputLinks: CnnLinkSnapshot[]
}

export interface CnnLayerSnapshot {
  id: string
  name: string
  index: number
  kind: CnnLayerKind
  inputShape: number[]
  outputShape: number[]
  parameterCount: number
  nodes: CnnNodeSnapshot[]
}

export interface CnnChannelContribution {
  channelIndex: number
  patch: number[][]
  kernel: number[][]
  products: number[][]
  sum: number
}

export interface CnnOperationDetail {
  kind: CnnLayerKind
  layerName: string
  nodeIndex: number
  row: number
  col: number
  formula: string
  channelContributions?: CnnChannelContribution[]
  bias?: number
  weightedSum?: number
  reluValue?: number
  poolWindow?: number[][]
  poolMax?: number
  poolMaxPosition?: { row: number; col: number }
  flattenSource?: { channelIndex: number; row: number; col: number }
  flattenIndex?: number
  logits?: number[]
  expScores?: number[]
  probabilities?: number[]
}

export interface CnnClassScore {
  id: string
  label: string
  logit: number
  probability: number
}

export interface TinyVggForwardPass {
  layers: CnnLayerSnapshot[]
  scores: CnnClassScore[]
  topPrediction: CnnClassScore
  inputShape: [number, number, number]
}

export interface SoftmaxScoreSummary {
  expScores: number[]
  probabilities: number[]
}

type TensorflowModule = typeof import('@tensorflow/tfjs')

const tinyVggModelPath = '/cnn-explainer/tiny-vgg/model.json'

export const tinyVggClassLabels = [
  'lifeboat',
  'ladybug',
  'pizza',
  'bell pepper',
  'school bus',
  'koala',
  'espresso',
  'red panda',
  'orange',
  'sport car',
] as const

let tinyVggModelPromise: Promise<tf.LayersModel> | undefined

export function roundCnnValue(value: number, digits = 4) {
  const factor = 10 ** digits
  return Math.round(value * factor) / factor
}

export function softmaxScores(logits: number[]): SoftmaxScoreSummary {
  if (!logits.length) return { expScores: [], probabilities: [] }

  const maxLogit = Math.max(...logits)
  const expScores = logits.map((logit) => Math.exp(logit - maxLogit))
  const denominator = expScores.reduce((sum, score) => sum + score, 0) || 1

  return {
    expScores,
    probabilities: expScores.map((score) => score / denominator),
  }
}

export function calculateConvCell(inputChannels: number[][][], kernels: number[][][], bias: number, row: number, col: number, stride = 1, padding = 0): CnnOperationDetail {
  const channelContributions = kernels.map((kernel, channelIndex) => {
    const source = inputChannels[channelIndex] ?? []
    const patch = kernel.map((kernelRow, kernelRowIndex) =>
      kernelRow.map((_kernelValue, kernelColIndex) => {
        const sourceRow = row * stride + kernelRowIndex - padding
        const sourceCol = col * stride + kernelColIndex - padding
        return source[sourceRow]?.[sourceCol] ?? 0
      }),
    )
    const products = patch.map((patchRow, patchRowIndex) =>
      patchRow.map((value, patchColIndex) => value * (kernel[patchRowIndex]?.[patchColIndex] ?? 0)),
    )
    const sum = products.reduce(
      (channelSum, productRow) => channelSum + productRow.reduce((rowSum, value) => rowSum + value, 0),
      0,
    )

    return {
      channelIndex,
      patch,
      kernel,
      products,
      sum,
    }
  })
  const weightedSum = channelContributions.reduce((sum, contribution) => sum + contribution.sum, bias)

  return {
    kind: 'conv',
    layerName: 'conv',
    nodeIndex: 0,
    row,
    col,
    formula: 'z = \\sum_c \\sum_i \\sum_j x_{c,i,j} k_{c,i,j} + b',
    channelContributions,
    bias,
    weightedSum,
  }
}

export function calculateMaxPoolCell(input: number[][], row: number, col: number, poolSize = 2, stride = 2): CnnOperationDetail {
  const sourceRow = row * stride
  const sourceCol = col * stride
  const poolWindow = Array.from({ length: poolSize }, (_rowValue, windowRow) =>
    Array.from({ length: poolSize }, (_colValue, windowCol) => input[sourceRow + windowRow]?.[sourceCol + windowCol] ?? Number.NEGATIVE_INFINITY),
  )
  let poolMax = Number.NEGATIVE_INFINITY
  let poolMaxPosition = { row: sourceRow, col: sourceCol }

  poolWindow.forEach((windowRow, windowRowIndex) => {
    windowRow.forEach((value, windowColIndex) => {
      if (value > poolMax) {
        poolMax = value
        poolMaxPosition = { row: sourceRow + windowRowIndex, col: sourceCol + windowColIndex }
      }
    })
  })

  return {
    kind: 'pool',
    layerName: 'pool',
    nodeIndex: 0,
    row,
    col,
    formula: 'y_{r,c} = \\max(x_{2r:2r+2, 2c:2c+2})',
    poolWindow,
    poolMax,
    poolMaxPosition,
  }
}

export function summarizeLayerShape(layer: Pick<CnnLayerSnapshot, 'kind' | 'outputShape' | 'parameterCount' | 'nodes'>) {
  const shapeText =
    layer.outputShape.length === 3
      ? `${layer.outputShape[0]}x${layer.outputShape[1]}x${layer.outputShape[2]}`
      : `${layer.outputShape[0]}`
  const parameterText = layer.parameterCount > 0 ? `${layer.parameterCount} params` : '0 params'

  return `${layer.kind}: ${shapeText}, ${layer.nodes.length} nodes, ${parameterText}`
}

export function buildCnnOperationDetail(layers: CnnLayerSnapshot[], layerIndex: number, nodeIndex: number, row = 0, col = 0): CnnOperationDetail | undefined {
  const layer = layers[layerIndex]
  const node = layer?.nodes[nodeIndex]
  if (!layer || !node) return undefined

  if (layer.kind === 'conv') {
    const inputLinks = node.inputLinks.filter((link) => Array.isArray(link.weight))
    const inputChannels = inputLinks
      .map((link) => layers[link.sourceLayerIndex]?.nodes[link.sourceNodeIndex]?.output)
      .filter(isMatrix)
    const kernels = inputLinks.map((link) => link.weight).filter(isMatrix)
    const detail = calculateConvCell(inputChannels, kernels, node.bias, row, col)
    return {
      ...detail,
      layerName: layer.name,
      nodeIndex,
      reluValue: Math.max(0, detail.weightedSum ?? 0),
    }
  }

  if (layer.kind === 'relu') {
    const inputNode = inputNodeFor(node, layers)
    const inputMap = isMatrix(inputNode?.output) ? inputNode.output : []
    const inputValue = inputMap[row]?.[col] ?? 0
    return {
      kind: 'relu',
      layerName: layer.name,
      nodeIndex,
      row,
      col,
      formula: 'a = \\max(0, z)',
      weightedSum: inputValue,
      reluValue: Math.max(0, inputValue),
    }
  }

  if (layer.kind === 'pool') {
    const inputNode = inputNodeFor(node, layers)
    const inputMap = isMatrix(inputNode?.output) ? inputNode.output : []
    return {
      ...calculateMaxPoolCell(inputMap, row, col),
      layerName: layer.name,
      nodeIndex,
    }
  }

  if (layer.kind === 'flatten') {
    const link = node.inputLinks[0]
    const sourcePosition = link?.sourcePosition ?? { row: 0, col: 0 }
    return {
      kind: 'flatten',
      layerName: layer.name,
      nodeIndex,
      row: sourcePosition.row,
      col: sourcePosition.col,
      formula: 'v_i = x_{channel,row,col}',
      flattenIndex: node.realIndex ?? node.index,
      flattenSource: {
        channelIndex: link?.sourceNodeIndex ?? 0,
        row: sourcePosition.row,
        col: sourcePosition.col,
      },
    }
  }

  if (layer.kind === 'dense') {
    const logits = layer.nodes.map((layerNode) => layerNode.logit ?? numberOutput(layerNode.output))
    const { expScores, probabilities } = softmaxScores(logits)
    return {
      kind: 'dense',
      layerName: layer.name,
      nodeIndex,
      row: 0,
      col: 0,
      formula: 'p_i = \\frac{e^{z_i}}{\\sum_j e^{z_j}}',
      logits,
      expScores,
      probabilities,
    }
  }

  return {
    kind: layer.kind,
    layerName: layer.name,
    nodeIndex,
    row,
    col,
    formula: 'x',
  }
}

export async function loadTinyVggModel(modelPath = withPublicBase(tinyVggModelPath)) {
  const tfModule = await import('@tensorflow/tfjs')
  await tfModule.ready()
  tinyVggModelPromise ??= tfModule.loadLayersModel(modelPath)
  return tinyVggModelPromise
}

export async function runTinyVggForwardPass(inputImageUrl: string, modelPath = withPublicBase(tinyVggModelPath)): Promise<TinyVggForwardPass> {
  const tfModule = await import('@tensorflow/tfjs')
  await tfModule.ready()
  const model = await loadTinyVggModel(modelPath)
  const inputTensor = await imageUrlToTensor(tfModule, inputImageUrl)
  const layers = await buildLayerSnapshots(tfModule, model, inputTensor)
  const denseLayer = layers.find((layer) => layer.kind === 'dense')
  const logits = denseLayer?.nodes.map((node) => node.logit ?? numberOutput(node.output)) ?? []
  const probabilities = softmaxScores(logits).probabilities
  const scores = tinyVggClassLabels.map((label, index) => ({
    id: `class-${index}`,
    label,
    logit: logits[index] ?? 0,
    probability: probabilities[index] ?? 0,
  }))
  const topPrediction = scores.reduce((best, score) => (score.probability > best.probability ? score : best), scores[0]!)

  return {
    layers,
    scores,
    topPrediction,
    inputShape: [64, 64, 3],
  }
}

async function buildLayerSnapshots(tfModule: TensorflowModule, model: tf.LayersModel, inputTensor: tf.Tensor3D): Promise<CnnLayerSnapshot[]> {
  const tensors: tf.Tensor[] = []
  const layers: CnnLayerSnapshot[] = []
  const inputLayerNodes = buildInputLayerNodes(inputTensor)
  const inputLayer: CnnLayerSnapshot = {
    id: 'input',
    name: 'input',
    index: 0,
    kind: 'input',
    inputShape: [64, 64, 3],
    outputShape: [64, 64, 3],
    parameterCount: 0,
    nodes: inputLayerNodes,
  }

  layers.push(inputLayer)
  tensors.push(inputTensor)
  let previousTensor: tf.Tensor = tfModule.stack([inputTensor])
  tensors.push(previousTensor)

  for (const [modelLayerIndex, modelLayer] of model.layers.entries()) {
    const layerIndex = modelLayerIndex + 1
    const currentTensor = modelLayer.apply(previousTensor) as tf.Tensor
    tensors.push(currentTensor)

    const squeezedTensor = currentTensor.squeeze()
    if (squeezedTensor !== currentTensor) tensors.push(squeezedTensor)
    const normalizedOutputTensor = squeezedTensor.shape.length === 3 ? squeezedTensor.transpose([2, 0, 1]) : squeezedTensor
    if (normalizedOutputTensor !== squeezedTensor) tensors.push(normalizedOutputTensor)
    const output = normalizedOutputTensor.arraySync() as number[] | number[][][]
    const kind = layerKindFor(modelLayer)
    const previousLayer = layers[layerIndex - 1]!
    const currentLayer = buildLayerSnapshot(modelLayer, kind, output, previousLayer, layerIndex)

    layers.push(currentLayer)
    previousTensor = currentTensor
  }

  for (const tensor of tensors) tensor.dispose()

  return layers
}

function buildInputLayerNodes(inputTensor: tf.Tensor3D): CnnNodeSnapshot[] {
  const transposedInput = inputTensor.transpose([2, 0, 1])
  const inputChannels = transposedInput.arraySync() as number[][][]
  transposedInput.dispose()

  return inputChannels.map((output, index) => ({
    id: `input-${index}`,
    layerName: 'input',
    layerIndex: 0,
    index,
    kind: 'input',
    output,
    bias: 0,
    inputLinks: [],
    outputLinks: [],
  }))
}

function buildLayerSnapshot(modelLayer: tf.layers.Layer, kind: CnnLayerKind, output: number[] | number[][][], previousLayer: CnnLayerSnapshot, layerIndex: number): CnnLayerSnapshot {
  const name = modelLayer.name
  const weights = modelLayer.getWeights()
  const nodes = buildNodesForLayer(modelLayer, kind, output, previousLayer, layerIndex, weights)
  for (const tensor of weights) tensor.dispose()
  const layer: CnnLayerSnapshot = {
    id: name,
    name,
    index: layerIndex,
    kind,
    inputShape: previousLayer.outputShape,
    outputShape: shapeForOutput(kind, output),
    parameterCount: parameterCountFor(kind, weights),
    nodes,
  }

  for (const node of nodes) {
    for (const link of node.inputLinks) {
      previousLayer.nodes[link.sourceNodeIndex]?.outputLinks.push(link)
    }
  }

  return layer
}

function buildNodesForLayer(modelLayer: tf.layers.Layer, kind: CnnLayerKind, output: number[] | number[][][], previousLayer: CnnLayerSnapshot, layerIndex: number, weights: tf.Tensor[]): CnnNodeSnapshot[] {
  if (kind === 'conv') {
    const [kernelTensor, biasTensor] = weights
    const transposedKernelTensor = kernelTensor?.transpose([3, 2, 0, 1])
    const kernels = transposedKernelTensor?.arraySync() as number[][][][] | undefined
    const biases = biasTensor?.arraySync() as number[] | undefined
    const outputChannels = Array.isArray(output[0]) ? (output as number[][][]) : []
    transposedKernelTensor?.dispose()

    return outputChannels.map((nodeOutput, nodeIndex) => ({
      id: `${modelLayer.name}-${nodeIndex}`,
      layerName: modelLayer.name,
      layerIndex,
      index: nodeIndex,
      kind,
      output: nodeOutput,
      bias: biases?.[nodeIndex] ?? 0,
      inputLinks: previousLayer.nodes.map((sourceNode) => ({
        sourceLayerIndex: previousLayer.index,
        sourceNodeIndex: sourceNode.index,
        targetLayerIndex: layerIndex,
        targetNodeIndex: nodeIndex,
        weight: kernels?.[nodeIndex]?.[sourceNode.index] ?? [],
      })),
      outputLinks: [],
    }))
  }

  if (kind === 'relu' || kind === 'pool') {
    const outputChannels = Array.isArray(output[0]) ? (output as number[][][]) : []

    return outputChannels.map((nodeOutput, nodeIndex) => ({
      id: `${modelLayer.name}-${nodeIndex}`,
      layerName: modelLayer.name,
      layerIndex,
      index: nodeIndex,
      kind,
      output: nodeOutput,
      bias: 0,
      inputLinks: [
        {
          sourceLayerIndex: previousLayer.index,
          sourceNodeIndex: nodeIndex,
          targetLayerIndex: layerIndex,
          targetNodeIndex: nodeIndex,
        },
      ],
      outputLinks: [],
    }))
  }

  if (kind === 'flatten') {
    const flattened = output as number[]
    const sourceWidth = mapWidth(previousLayer.nodes[0]?.output)
    const sourceNodeCount = previousLayer.nodes.length
    const nodes = flattened.map((nodeOutput, nodeIndex) => {
      const sourceNodeIndex = sourceNodeCount ? nodeIndex % sourceNodeCount : 0
      const sourceRow = sourceWidth ? Math.floor(Math.floor(nodeIndex / sourceNodeCount) / sourceWidth) : 0
      const sourceCol = sourceWidth ? Math.floor(nodeIndex / sourceNodeCount) % sourceWidth : 0
      const realIndex = sourceNodeIndex * sourceWidth * sourceWidth + sourceRow * sourceWidth + sourceCol

      return {
        id: `${modelLayer.name}-${nodeIndex}`,
        layerName: modelLayer.name,
        layerIndex,
        index: nodeIndex,
        kind,
        output: nodeOutput,
        bias: 0,
        realIndex,
        inputLinks: [
          {
            sourceLayerIndex: previousLayer.index,
            sourceNodeIndex,
            targetLayerIndex: layerIndex,
            targetNodeIndex: nodeIndex,
            sourcePosition: { row: sourceRow, col: sourceCol },
          },
        ],
        outputLinks: [],
      } satisfies CnnNodeSnapshot
    })

    return nodes.sort((left, right) => left.index - right.index)
  }

  const [kernelTensor, biasTensor] = weights
  const transposedKernelTensor = kernelTensor?.transpose([1, 0])
  const denseWeights = transposedKernelTensor?.arraySync() as number[][] | undefined
  const biases = biasTensor?.arraySync() as number[] | undefined
  const denseOutput = output as number[]
  transposedKernelTensor?.dispose()

  return denseOutput.map((nodeOutput, nodeIndex) => {
    const logit = previousLayer.nodes.reduce((sum, previousNode, previousNodeIndex) => {
      return sum + numberOutput(previousNode.output) * (denseWeights?.[nodeIndex]?.[previousNodeIndex] ?? 0)
    }, biases?.[nodeIndex] ?? 0)

    return {
      id: `${modelLayer.name}-${nodeIndex}`,
      layerName: modelLayer.name,
      layerIndex,
      index: nodeIndex,
      kind: 'dense',
      output: nodeOutput,
      bias: biases?.[nodeIndex] ?? 0,
      logit,
      inputLinks: previousLayer.nodes.map((sourceNode) => ({
        sourceLayerIndex: previousLayer.index,
        sourceNodeIndex: sourceNode.index,
        targetLayerIndex: layerIndex,
        targetNodeIndex: nodeIndex,
        weight: denseWeights?.[nodeIndex]?.[sourceNode.index] ?? 0,
      })),
      outputLinks: [],
    }
  })
}

function layerKindFor(layer: tf.layers.Layer): CnnLayerKind {
  const name = layer.name.toLowerCase()
  if (name.includes('conv')) return 'conv'
  if (name.includes('relu')) return 'relu'
  if (name.includes('pool')) return 'pool'
  if (name.includes('flatten')) return 'flatten'
  return 'dense'
}

function shapeForOutput(kind: CnnLayerKind, output: number[] | number[][][]) {
  if (kind === 'flatten' || kind === 'dense') return [(output as number[]).length]
  const maps = output as number[][][]
  return [maps[0]?.length ?? 0, maps[0]?.[0]?.length ?? 0, maps.length]
}

function parameterCountFor(kind: CnnLayerKind, weights: tf.Tensor[]) {
  if (kind !== 'conv' && kind !== 'dense') return 0
  return weights.reduce((sum, tensor) => sum + tensor.size, 0)
}

function numberOutput(output: number | number[][]) {
  return typeof output === 'number' ? output : 0
}

function mapWidth(output: number | number[][] | undefined) {
  return Array.isArray(output) ? output[0]?.length ?? 0 : 0
}

function isMatrix(value: unknown): value is number[][] {
  return Array.isArray(value) && Array.isArray(value[0])
}

function inputNodeFor(node: CnnNodeSnapshot, layers: CnnLayerSnapshot[]) {
  const inputLink = node.inputLinks[0]
  if (!inputLink) return undefined
  return layers[inputLink.sourceLayerIndex]?.nodes[inputLink.sourceNodeIndex]
}

async function imageUrlToTensor(tfModule: TensorflowModule, imageUrl: string): Promise<tf.Tensor3D> {
  const image = await loadImage(imageUrl)
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')

  if (!context) throw new Error('Canvas is not available for CNN input preprocessing.')

  const size = Math.min(image.naturalWidth || image.width, image.naturalHeight || image.height)
  const sourceX = Math.max(0, ((image.naturalWidth || image.width) - size) / 2)
  const sourceY = Math.max(0, ((image.naturalHeight || image.height) - size) / 2)
  canvas.width = 64
  canvas.height = 64
  context.drawImage(image, sourceX, sourceY, size, size, 0, 0, 64, 64)

  const imageData = context.getImageData(0, 0, 64, 64)
  const values = new Float32Array(64 * 64 * 3)

  for (let pixelIndex = 0; pixelIndex < 64 * 64; pixelIndex += 1) {
    values[pixelIndex * 3] = (imageData.data[pixelIndex * 4] ?? 0) / 255
    values[pixelIndex * 3 + 1] = (imageData.data[pixelIndex * 4 + 1] ?? 0) / 255
    values[pixelIndex * 3 + 2] = (imageData.data[pixelIndex * 4 + 2] ?? 0) / 255
  }

  return tfModule.tensor3d(values, [64, 64, 3])
}

function loadImage(imageUrl: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = 'anonymous'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Unable to load the CNN input image.'))
    image.src = imageUrl
  })
}
