<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewScenarioCards, aiOverviewVisualCopy } from '../data/course'

defineProps<{ locale: AppLocale }>()
const algorithms = ['linear-regression', 'k-means', 'q-learning'] as const
</script>

<template>
  <section class="learning-assistant-map" :aria-label="aiOverviewVisualCopy.learningAssistantMap[locale]">
    <article v-for="(card, index) in aiOverviewScenarioCards" :id="algorithms[index]" :key="card.id">
      <span class="algorithm-shape" aria-hidden="true">{{ index === 0 ? '●' : index === 1 ? '■' : '▲' }}</span>
      <h3>{{ card.title[locale] }}</h3>
      <dl>
        <dt>{{ card.problem[locale] }}</dt><dd>{{ card.availableInformation[locale] }}</dd>
        <dt>{{ card.learningSignal[locale] }}</dt><dd>{{ card.output[locale] }}</dd>
      </dl>
    </article>
  </section>
</template>

<style scoped>
.learning-assistant-map { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .8rem; }
article { border: 1px solid currentColor; border-radius: .7rem; padding: 1rem; }
.algorithm-shape { font-size: 1.3rem; margin-inline-end: .35rem; }
dt { font-weight: 700; }
dd { margin: .25rem 0 .8rem; }
@media (max-width: 680px) { .learning-assistant-map { grid-template-columns: 1fr; } }
</style>
