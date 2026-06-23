<script setup lang="ts">
import type { MathLabLocale, ObservationPromptConfig } from '../types/mathLab'

defineProps<{
  prompt: ObservationPromptConfig
  locale: MathLabLocale
}>()
</script>

<template>
  <aside class="math-observation-prompt">
    <span>{{ locale === 'zh-CN' ? '观察任务' : 'Observation task' }}</span>
    <strong>{{ prompt.title[locale] }}</strong>
    <p>{{ prompt.body[locale] }}</p>
    <a :href="`#${prompt.targetLabId}`">
      {{ locale === 'zh-CN' ? '跳到对应实验' : 'Jump to the lab' }}
    </a>
  </aside>
</template>
