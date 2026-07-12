<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewVisualCopy, learningAssistantAlgorithms } from '../data/course'

defineProps<{ locale: AppLocale }>()
const algorithmShape = (id: string) => id === 'linear-regression' ? '●' : id === 'k-means' ? '■' : '▲'
</script>

<template>
  <section class="learning-assistant-map" :aria-label="aiOverviewVisualCopy.learningAssistantMap[locale]">
    <article v-for="algorithm in learningAssistantAlgorithms" :key="algorithm.id" :data-algorithm-id="algorithm.id">
      <span class="algorithm-shape" aria-hidden="true">{{ algorithmShape(algorithm.id) }}</span>
      <h3>{{ algorithm.label[locale] }}</h3>
      <dl>
        <dt>{{ aiOverviewVisualCopy.typicalProblem[locale] }}</dt><dd>{{ algorithm.taskRole[locale] }}</dd>
        <dt>{{ aiOverviewVisualCopy.availableInformation[locale] }}</dt><dd>{{ algorithm.input[locale] }}</dd>
        <dt>{{ aiOverviewVisualCopy.learningSignal[locale] }}</dt><dd>{{ algorithm.learningSignal[locale] }}</dd>
        <dt>{{ aiOverviewVisualCopy.output[locale] }}</dt><dd>{{ algorithm.output[locale] }}</dd>
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
