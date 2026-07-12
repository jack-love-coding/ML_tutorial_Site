<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewVisualCopy, llmRouteStages } from '../data/course'

defineProps<{ locale: AppLocale }>()
// Canonical route anchors: Python → Transformer → LLM.
</script>

<template>
  <nav class="llm-route-map" :aria-label="aiOverviewVisualCopy.llmRoute[locale]">
    <ol>
      <li v-for="(stage, index) in llmRouteStages" :key="stage.id">
        <span class="route-shape" aria-hidden="true">{{ index + 1 }}</span>
        <span>{{ stage.label[locale] }}</span>
      </li>
    </ol>
  </nav>
</template>

<style scoped>
ol { display: flex; align-items: stretch; gap: .5rem; padding: 0; list-style: none; }
li { display: flex; flex: 1; align-items: center; gap: .35rem; border-bottom: 3px solid currentColor; padding: .7rem .4rem; }
li:not(:last-child)::after { content: '→'; margin-inline-start: auto; }
.route-shape { display: grid; min-width: 1.65rem; height: 1.65rem; place-items: center; border: 1px solid currentColor; border-radius: 50%; }
@media (max-width: 760px) { ol { align-items: stretch; flex-direction: column; } li:not(:last-child)::after { content: '↓'; } }
</style>
