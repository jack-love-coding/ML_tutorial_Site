<script setup lang="ts">
import type { StorySection } from '../../types/ml'
import MlpPlaygroundCockpit from '../MlpPlaygroundCockpit.vue'

defineProps<{
  accent: string
  section: StorySection
}>()
</script>

<template>
  <MlpPlaygroundCockpit :accent="accent" :section="section" mode="explore" />
</template>
