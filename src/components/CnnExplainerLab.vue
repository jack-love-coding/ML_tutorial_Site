<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import type { StorySection } from '../types/ml'
import type { NeuralLabMode } from '../lessons/neuralGuided'

const CnnGuidedLab = defineAsyncComponent(() => import('./cnn/CnnGuidedLab.vue'))
const CnnExplorerWorkbench = defineAsyncComponent(() => import('./cnn/CnnExplorerWorkbench.vue'))

defineProps<{
  section: StorySection
  mode: NeuralLabMode
}>()
</script>

<template>
  <CnnGuidedLab v-if="mode === 'guided'" :section="section" />
  <CnnExplorerWorkbench v-else :section="section" />
</template>
