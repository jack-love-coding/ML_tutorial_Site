<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import type { GradientDescentInteractionPayload, GradientDescentSceneId } from '../../types/gradientDescentLesson'
import { loadGradientInteraction } from '../../utils/gradientDescentAssets'

const props = defineProps<{ sceneId: GradientDescentSceneId }>()
const { locale } = useI18n()
const payload = ref<GradientDescentInteractionPayload>()
const error = ref(false)
let controller: AbortController | undefined

const scenes: Record<GradientDescentSceneId, Component> = {
  'loss-function': defineAsyncComponent(() => import('./GradientLossFunctionLab.vue')),
  landscape: defineAsyncComponent(() => import('./GradientLandscapeLab.vue')),
  'gradient-rule': defineAsyncComponent(() => import('./GradientRuleLab.vue')),
  'learning-rate': defineAsyncComponent(() => import('./GradientLearningRateLab.vue')),
  'saddle-local-minima': defineAsyncComponent(() => import('./GradientTerrainLab.vue')),
  'noise-and-batch': defineAsyncComponent(() => import('./GradientBatchLab.vue')),
}
const scene = computed(() => scenes[props.sceneId])

watch(() => props.sceneId, async (sceneId) => {
  controller?.abort()
  controller = new AbortController()
  payload.value = undefined
  error.value = false
  try {
    payload.value = await loadGradientInteraction(sceneId, controller.signal)
  } catch (reason) {
    if ((reason as Error).name !== 'AbortError') error.value = true
  }
}, { immediate: true })

onBeforeUnmount(() => controller?.abort())
</script>

<template>
  <div class="gradient-lesson-lab" :data-scene-id="sceneId">
    <p v-if="error" role="alert">{{ locale === 'zh-CN' ? '互动数据暂时无法加载，请使用下方文字说明继续学习。' : 'The interactive data could not load. Continue with the text explanation below.' }}</p>
    <div v-else-if="!payload" class="gradient-lesson-lab__loading" aria-live="polite">{{ locale === 'zh-CN' ? '正在加载本章真实数据…' : 'Loading this chapter’s real data…' }}</div>
    <component :is="scene" v-else :payload="payload" />
  </div>
</template>
