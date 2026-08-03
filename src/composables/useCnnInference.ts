import { onBeforeUnmount, ref, shallowRef } from 'vue'
import {
  runTinyVggForwardPass,
  type CnnClassScore,
  type CnnLayerSnapshot,
  type TinyVggForwardPass,
} from '../utils/cnnExplainer'
import { assertFiniteCnnForwardPass } from '../utils/cnnGuided'
import { withPublicBase } from '../utils/publicPath'

export type CnnInferenceStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface CnnGuidedSample {
  id: string
  label: string
  url: string
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024
const ACCEPTED_IMAGE_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp'])
const sampleDefinitions = [
  ['lifeboat', 'lifeboat.png'], ['ladybug', 'ladybug.png'], ['pizza', 'pizza.png'],
  ['bell pepper', 'bell-pepper.png'], ['school bus', 'school-bus.png'], ['koala', 'koala.png'],
  ['espresso', 'espresso.png'], ['red panda', 'red-panda.png'], ['orange', 'orange.png'],
  ['sport car', 'sport-car.png'],
] as const

export function useCnnInference() {
  const status = ref<CnnInferenceStatus>('idle')
  const statusMessage = ref('')
  const fileError = ref('')
  const layers = shallowRef<CnnLayerSnapshot[]>([])
  const scores = shallowRef<CnnClassScore[]>([])
  const topPrediction = shallowRef<CnnClassScore>()
  const selectedImageUrl = ref('')
  const selectedImageName = ref('')
  const pendingImageName = ref('')
  const userObjectUrl = ref<string>()
  const samples: CnnGuidedSample[] = sampleDefinitions.map(([label, file], index) => ({
    id: `sample-${index}`,
    label,
    url: withPublicBase(`/cnn-explainer/samples/${file}`),
  }))
  let requestId = 0

  function revokeUserObjectUrl() {
    if (!userObjectUrl.value) return
    URL.revokeObjectURL(userObjectUrl.value)
    userObjectUrl.value = undefined
  }

  async function runInference(imageUrl: string, imageName: string): Promise<TinyVggForwardPass | undefined> {
    const activeRequest = ++requestId
    status.value = 'loading'
    statusMessage.value = ''
    fileError.value = ''
    pendingImageName.value = imageName
    try {
      const result = assertFiniteCnnForwardPass(await runTinyVggForwardPass(imageUrl))
      if (activeRequest !== requestId) return undefined
      layers.value = result.layers
      scores.value = result.scores
      topPrediction.value = result.topPrediction
      selectedImageUrl.value = imageUrl
      selectedImageName.value = imageName
      pendingImageName.value = ''
      status.value = 'ready'
      return result
    } catch (error) {
      if (activeRequest !== requestId) return undefined
      pendingImageName.value = ''
      status.value = 'error'
      statusMessage.value = error instanceof Error ? error.message : 'CNN inference failed'
      return undefined
    }
  }

  async function uploadFile(file?: File) {
    if (!file) return undefined
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      fileError.value = 'invalid-type'
      return undefined
    }
    if (!Number.isFinite(file.size) || file.size > MAX_UPLOAD_BYTES) {
      fileError.value = 'invalid-size'
      return undefined
    }
    revokeUserObjectUrl()
    const objectUrl = URL.createObjectURL(file)
    userObjectUrl.value = objectUrl
    return runInference(objectUrl, file.name)
  }

  function dispose() {
    requestId += 1
    revokeUserObjectUrl()
  }

  onBeforeUnmount(dispose)

  return {
    status, statusMessage, fileError, layers, scores, topPrediction,
    selectedImageUrl, selectedImageName, pendingImageName, samples,
    runInference, uploadFile, dispose,
  }
}
