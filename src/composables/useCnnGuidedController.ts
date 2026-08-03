import { computed, onMounted, ref } from 'vue'
import type { CnnSemanticStage } from '../lessons/neuralGuided'
import { buildCnnOperationDetail, type CnnClassScore } from '../utils/cnnExplainer'
import {
  boundedCnnLayerIndex,
  boundedCnnNodeIndex,
  cnnLayerIndexForStage,
  nextCnnLayerIndex,
  topScoreNodeIndex,
} from '../utils/cnnGuided'
import { useCnnInference } from './useCnnInference'
import { useCnnPlayback } from './useCnnPlayback'

export function useCnnGuidedController(initialStage: CnnSemanticStage, initialSampleId = 'sample-0') {
  const inference = useCnnInference()
  const {
    status, statusMessage, fileError, layers, scores, topPrediction,
    selectedImageUrl, selectedImageName, pendingImageName, samples,
    runInference, uploadFile: inferUploadedFile,
  } = inference
  const selectedLayerIndex = ref(0)
  const selectedNodeIndex = ref(0)
  const selectedRow = ref(0)
  const selectedCol = ref(0)
  const currentStage = ref<CnnSemanticStage>(initialStage)
  const playback = useCnnPlayback(stepForward, () => status.value === 'ready')
  const { isPlaying, reducedMotion, togglePlayback, stopPlayback } = playback

  const selectedLayer = computed(() => layers.value[selectedLayerIndex.value])
  const selectedDetail = computed(() => buildCnnOperationDetail(
    layers.value,
    selectedLayerIndex.value,
    selectedNodeIndex.value,
    selectedRow.value,
    selectedCol.value,
  ))
  const sortedScores = computed(() => [...scores.value].sort((left, right) => right.probability - left.probability))
  const inputShape = computed(() => layers.value[0]?.outputShape ?? [64, 64, 3])

  function selectLayer(layerIndex: number, nodeIndex = 0) {
    const boundedLayer = boundedCnnLayerIndex(layers.value, layerIndex)
    selectedLayerIndex.value = boundedLayer
    selectedNodeIndex.value = boundedCnnNodeIndex(layers.value[boundedLayer], nodeIndex)
    const shape = layers.value[boundedLayer]?.outputShape ?? []
    selectedRow.value = shape.length === 3 ? Math.floor((shape[0] ?? 1) / 2) : 0
    selectedCol.value = shape.length === 3 ? Math.floor((shape[1] ?? 1) / 2) : 0
  }

  function selectStage(stage: CnnSemanticStage) {
    currentStage.value = stage
    const preferred = cnnLayerIndexForStage(layers.value, stage)
    const nodeIndex = stage === 'classifier' ? topScoreNodeIndex(scores.value, topPrediction.value) : 0
    selectLayer(preferred >= 0 ? preferred : 0, nodeIndex)
  }

  function stepForward() {
    if (status.value !== 'ready') return
    selectLayer(nextCnnLayerIndex(layers.value, selectedLayerIndex.value))
  }

  function resetSelection() {
    stopPlayback()
    selectStage(currentStage.value)
  }

  async function loadImage(imageUrl: string, imageName: string) {
    stopPlayback()
    const result = await runInference(imageUrl, imageName)
    if (result) selectStage(currentStage.value)
    return result
  }

  function selectSample(sampleId: string) {
    const sample = samples.find((item) => item.id === sampleId)
    if (sample) void loadImage(sample.url, sample.label)
  }

  function selectScore(score: CnnClassScore) {
    const denseIndex = layers.value.findIndex((layer) => layer.kind === 'dense')
    const scoreIndex = scores.value.findIndex((item) => item.id === score.id)
    if (denseIndex >= 0 && scoreIndex >= 0) selectLayer(denseIndex, scoreIndex)
  }

  async function uploadFile(file?: File) {
    stopPlayback()
    const result = await inferUploadedFile(file)
    if (result) selectStage(currentStage.value)
    return result
  }

  onMounted(() => {
    const sample = samples.find((item) => item.id === initialSampleId) ?? samples[0]
    if (sample) void loadImage(sample.url, sample.label)
  })

  return {
    status, statusMessage, fileError, layers, scores, sortedScores, topPrediction,
    selectedLayerIndex, selectedNodeIndex, selectedLayer, selectedDetail,
    selectedImageUrl, selectedImageName, pendingImageName, inputShape, samples,
    isPlaying, reducedMotion, selectLayer, selectStage, stepForward,
    togglePlayback, stopPlayback, resetSelection, selectSample, selectScore,
    uploadFile, runInference: loadImage,
  }
}
