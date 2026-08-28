<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, shallowRef, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { loadLogisticInteraction } from '../assets.ts'
import type { LogisticChapterId, LogisticPublishedInteractionAsset } from '../types.ts'
import type { AppLocale } from '../../../types/ml.ts'

const props = defineProps<{ sceneId: LogisticChapterId }>()

const sceneComponents: Record<LogisticChapterId, Component> = {
  'linear-score': defineAsyncComponent(() => import('./LinearScoreScene.vue')),
  'sigmoid-probability': defineAsyncComponent(() => import('./SigmoidProbabilityScene.vue')),
  'threshold-decisions': defineAsyncComponent(() => import('./LikelihoodScene.vue')),
  'log-loss': defineAsyncComponent(() => import('./LogLossGradientScene.vue')),
  regularization: defineAsyncComponent(() => import('./TrainingParityScene.vue')),
  'linear-limits': defineAsyncComponent(() => import('./CalibrationLimitsScene.vue')),
}

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; asset: LogisticPublishedInteractionAsset }
  | { status: 'error'; message: string }

const { locale } = useI18n()
const state = shallowRef<LoadState>({ status: 'loading' })
const activeScene = computed(() => sceneComponents[props.sceneId])
const activeLocale = computed(() => locale.value as AppLocale)
const labels = computed(() => activeLocale.value === 'zh-CN' ? {
  loading: '正在读取本章经过校验的互动数据…',
  error: '互动数据暂时无法读取。你仍可使用本章的代码、运行结果和图表继续学习。',
  retry: '重新加载', fallback: '静态阅读提示：本章的互动计算使用已发布的本地数据；复杂训练结果不会在浏览器中重新拟合。',
} : {
  loading: 'Loading this chapter’s validated interaction data…',
  error: 'The interaction data is temporarily unavailable. You can still learn from this chapter’s code, runtime output, and figures.',
  retry: 'Retry', fallback: 'Static reading note: this chapter uses published local data; complex training results are not refit in the browser.',
})
let controller: AbortController | undefined

function aborted(error: unknown): boolean {
  return controller?.signal.aborted === true || (error instanceof Error && error.name === 'AbortError')
}

async function load(): Promise<void> {
  controller?.abort()
  const request = new AbortController()
  controller = request
  state.value = { status: 'loading' }
  try {
    const asset = await loadLogisticInteraction(props.sceneId, { signal: request.signal })
    if (!request.signal.aborted && controller === request) state.value = { status: 'ready', asset }
  } catch (error) {
    if (aborted(error) || request.signal.aborted) return
    if (controller === request) state.value = { status: 'error', message: error instanceof Error ? error.message : labels.value.error }
  }
}

watch(() => props.sceneId, () => void load(), { immediate: true })
onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <section class="logistic-lesson-lab" :data-scene-id="props.sceneId" :aria-label="labels.loading">
    <p v-if="state.status === 'loading'" class="logistic-lesson-lab__state" role="status">{{ labels.loading }}</p>
    <section v-else-if="state.status === 'error'" class="logistic-lesson-lab__state is-error" role="alert">
      <p>{{ labels.error }}</p><p class="logistic-lesson-lab__fallback">{{ labels.fallback }}</p>
      <button type="button" @click="load">{{ labels.retry }}</button>
    </section>
    <component :is="activeScene" v-else :key="props.sceneId" :asset="state.asset" :locale="activeLocale" />
  </section>
</template>
