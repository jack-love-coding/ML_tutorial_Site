import type { CnnSemanticStage } from '../lessons/neuralGuided'
import type {
  CnnClassScore,
  CnnLayerSnapshot,
  TinyVggForwardPass,
} from './cnnExplainer'

export function cnnLayerIndexForStage(layers: CnnLayerSnapshot[], stage: CnnSemanticStage) {
  if (!layers.length) return 0
  if (stage === 'input') return layers.findIndex((layer) => layer.kind === 'input')
  if (stage === 'conv-block-1') return layers.findIndex((layer) => layer.kind === 'conv')
  if (stage === 'pool-1') return layers.findIndex((layer) => layer.kind === 'pool')
  if (stage === 'conv-block-2') {
    const firstPool = layers.findIndex((layer) => layer.kind === 'pool')
    return layers.findIndex((layer) => layer.kind === 'conv' && layer.index > firstPool)
  }
  if (stage === 'pool-2') {
    const pools = layers.filter((layer) => layer.kind === 'pool')
    return pools.at(-1)?.index ?? 0
  }
  return layers.findIndex((layer) => layer.kind === 'dense')
}

export function boundedCnnLayerIndex(layers: CnnLayerSnapshot[], requestedIndex: number) {
  if (!layers.length || !Number.isFinite(requestedIndex)) return 0
  const rounded = Math.round(requestedIndex)
  return Math.min(layers.length - 1, Math.max(0, rounded))
}

export function boundedCnnNodeIndex(layer: CnnLayerSnapshot | undefined, requestedIndex: number) {
  if (!layer?.nodes.length || !Number.isFinite(requestedIndex)) return 0
  return Math.min(layer.nodes.length - 1, Math.max(0, Math.round(requestedIndex)))
}

export function topScoreNodeIndex(scores: CnnClassScore[], topPrediction?: CnnClassScore) {
  const index = scores.findIndex((score) => score.id === topPrediction?.id)
  return index >= 0 ? index : 0
}

export function nextCnnLayerIndex(layers: CnnLayerSnapshot[], currentIndex: number) {
  if (!layers.length) return 0
  return (boundedCnnLayerIndex(layers, currentIndex) + 1) % layers.length
}

export function assertFiniteCnnForwardPass(result: TinyVggForwardPass) {
  if (result.inputShape.join('x') !== '64x64x3') throw new Error('Unexpected Tiny VGG input shape')
  if (!result.layers.length || !result.scores.length) throw new Error('Incomplete Tiny VGG forward pass')

  for (const layer of result.layers) {
    if (!layer.outputShape.every((value) => Number.isFinite(value) && value >= 0)) {
      throw new Error(`Invalid output shape for ${layer.name}`)
    }
    if (!Number.isFinite(layer.parameterCount) || layer.parameterCount < 0) {
      throw new Error(`Invalid parameter count for ${layer.name}`)
    }
  }

  for (const score of result.scores) {
    if (!Number.isFinite(score.logit) || !Number.isFinite(score.probability)) {
      throw new Error(`Invalid class score for ${score.label}`)
    }
    if (score.probability < 0 || score.probability > 1) {
      throw new Error(`Invalid class probability for ${score.label}`)
    }
  }

  const probabilitySum = result.scores.reduce((sum, score) => sum + score.probability, 0)
  if (Math.abs(probabilitySum - 1) > 1e-4) throw new Error('Class probabilities do not sum to one')
  return result
}
