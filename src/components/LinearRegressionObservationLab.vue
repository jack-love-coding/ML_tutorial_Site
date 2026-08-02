<script setup lang="ts">
import {
  computed,
  defineAsyncComponent,
  onBeforeUnmount,
  shallowRef,
  watch,
  type Component,
} from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLinearRegressionInteractionAsset } from '../simulations/linearRegressionInteraction'
import type { LinearRegressionInteractionAsset } from '../types/linearRegressionInteraction'
import type {
  LinearRegressionObservationControl,
  LinearRegressionObservationSceneId,
} from '../types/linearRegressionLesson'

const props = defineProps<{
  sceneId: LinearRegressionObservationSceneId
  controls: LinearRegressionObservationControl[]
}>()

const sceneComponents: Record<LinearRegressionObservationSceneId, Component> = {
  'fit-line': defineAsyncComponent(() => import('./linear-regression/FitLineScene.vue')),
  multivariate: defineAsyncComponent(() => import('./linear-regression/MultivariateScene.vue')),
  'residual-loss': defineAsyncComponent(() => import('./linear-regression/ResidualLossScene.vue')),
  'training-motion': defineAsyncComponent(() => import('./linear-regression/TrainingMotionScene.vue')),
  polynomial: defineAsyncComponent(() => import('./linear-regression/PolynomialScene.vue')),
  'model-limits': defineAsyncComponent(() => import('./linear-regression/ModelLimitsScene.vue')),
  overfitting: defineAsyncComponent(() => import('./linear-regression/OverfittingScene.vue')),
  regularization: defineAsyncComponent(() => import('./linear-regression/RegularizationScene.vue')),
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; asset: LinearRegressionInteractionAsset }
  | { status: 'error' }

const { locale } = useI18n()
const state = shallowRef<LoadState>({ status: 'loading' })
const activeScene = computed(() => sceneComponents[props.sceneId])
const labels = computed(() => locale.value === 'zh-CN'
  ? {
      loading: '正在读取本章真实数据互动资产…',
      error: '互动资产暂时不可用。你仍可使用上方真实运行结果和图表继续学习。',
      retry: '重新加载',
    }
  : {
      loading: 'Loading this chapter’s real-data interaction asset…',
      error: 'The interaction asset is temporarily unavailable. The runtime output and real-data figure above remain available.',
      retry: 'Retry',
    })
let controller: AbortController | undefined

async function load(): Promise<void> {
  controller?.abort()
  controller = new AbortController()
  state.value = { status: 'loading' }
  try {
    const asset = await loadLinearRegressionInteractionAsset(props.sceneId, controller.signal)
    if (!controller.signal.aborted) state.value = { status: 'ready', asset }
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    if (!controller.signal.aborted) state.value = { status: 'error' }
  }
}

watch(() => props.sceneId, () => void load(), { immediate: true })
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <section
    class="linear-observation-lab linear-observation-lab--interactive"
    :data-scene-id="props.sceneId"
    :data-control-count="props.controls.length"
  >
    <p v-if="state.status === 'loading'" class="linear-observation-lab__state" role="status">
      {{ labels.loading }}
    </p>
    <section v-else-if="state.status === 'error'" class="linear-observation-lab__state is-error" role="alert">
      <p>{{ labels.error }}</p>
      <button type="button" class="linear-observation-lab__reset" @click="load">
        {{ labels.retry }}
      </button>
    </section>
    <component
      :is="activeScene"
      v-else
      :key="props.sceneId"
      :asset="state.asset"
    />
  </section>
</template>
