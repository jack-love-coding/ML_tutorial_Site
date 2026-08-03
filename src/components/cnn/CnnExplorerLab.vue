<script setup lang="ts">
import type { StorySection } from '../../types/ml'
import CnnExplorerWorkbench from './CnnExplorerWorkbench.vue'

defineProps<{
  section: StorySection
}>()
</script>

<template>
  <CnnExplorerWorkbench :section="section" />
</template>
