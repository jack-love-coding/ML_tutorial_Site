<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, shallowRef, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadHousingProjectInteractionAsset } from '../simulations/housingProjectInteraction'
import type { HousingProjectInteractionAsset, HousingProjectSceneId } from '../types/housingProjectLesson'

const props = defineProps<{ sceneId: HousingProjectSceneId }>()
const scenes: Record<HousingProjectSceneId, Component> = {
  'data-contract': defineAsyncComponent(() => import('./housing-project-scenes/DataContractScene.vue')),
  'training-eda': defineAsyncComponent(() => import('./housing-project-scenes/TrainingEdaScene.vue')),
  'leakage-boundary': defineAsyncComponent(() => import('./housing-project-scenes/LeakageBoundaryScene.vue')),
  'baseline-contributions': defineAsyncComponent(() => import('./housing-project-scenes/BaselineContributionsScene.vue')),
  'ridge-selection': defineAsyncComponent(() => import('./housing-project-scenes/RidgeSelectionScene.vue')),
  'final-review': defineAsyncComponent(() => import('./housing-project-scenes/FinalReviewScene.vue')),
}
type LoadState = { status: 'loading' } | { status: 'ready'; asset: HousingProjectInteractionAsset } | { status: 'error' }
const { locale } = useI18n()
const state = shallowRef<LoadState>({ status: 'loading' })
const activeScene = computed(() => scenes[props.sceneId])
const copy = computed(() => locale.value === 'zh-CN' ? {
  loading: '正在读取本章真实运行数据…', error: '本章互动数据暂时不可用；上方代码、运行结果和图表仍可继续阅读。', retry: '重新加载',
} : {
  loading: 'Loading this chapter’s real runtime data…', error: 'This interaction is unavailable; the code, runtime output, and figures above remain readable.', retry: 'Retry',
})
let controller: AbortController | undefined
async function load() {
  controller?.abort()
  controller = new AbortController()
  state.value = { status: 'loading' }
  try {
    const asset = await loadHousingProjectInteractionAsset(props.sceneId, controller.signal)
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
  <section class="housing-observation" :data-scene-id="props.sceneId">
    <p v-if="state.status === 'loading'" class="housing-observation__state" role="status">{{ copy.loading }}</p>
    <div v-else-if="state.status === 'error'" class="housing-observation__state is-error" role="alert"><p>{{ copy.error }}</p><button type="button" @click="load">{{ copy.retry }}</button></div>
    <component :is="activeScene" v-else :key="props.sceneId" :asset="state.asset" />
  </section>
</template>
