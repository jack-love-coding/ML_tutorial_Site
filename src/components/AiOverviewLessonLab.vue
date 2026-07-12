<script setup lang="ts">
import type { StorySection } from '../types/ml'
import AiOverviewChapterLab from '../modules/ai-overview/labs/AiOverviewChapterLab.vue'

defineProps<{ section: StorySection }>()
</script>

<template>
  <AiOverviewChapterLab :section="section" />
</template>
