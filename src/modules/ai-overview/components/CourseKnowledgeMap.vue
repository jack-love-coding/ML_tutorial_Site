<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewChapters, aiOverviewVisualCopy, learningParadigmRows, llmRouteStages } from '../data/course'

defineProps<{ locale: AppLocale }>()
function printKnowledgeMap() { window.print() }
</script>

<template>
  <section class="ai-overview-knowledge-map knowledge-map" :aria-label="aiOverviewVisualCopy.knowledgeMap[locale]">
    <header>
      <h2>{{ aiOverviewVisualCopy.knowledgeMap[locale] }}</h2>
      <button type="button" @click="printKnowledgeMap">{{ aiOverviewVisualCopy.print[locale] }}</button>
    </header>
    <ol class="chapter-list">
      <li v-for="chapter in aiOverviewChapters" :key="chapter.id">
        <strong>{{ (chapter.title ?? chapter.callout)[locale] }}</strong>
        <p>{{ chapter.callout[locale] }}</p>
      </li>
    </ol>
    <table>
      <thead><tr><th scope="col">{{ aiOverviewVisualCopy.typicalProblem[locale] }}</th><th scope="col">{{ aiOverviewVisualCopy.learningSignal[locale] }}</th></tr></thead>
      <tbody><tr v-for="row in learningParadigmRows" :key="row.id"><th scope="row">{{ row.typicalProblem[locale] }}</th><td>{{ row.learningSignal[locale] }}</td></tr></tbody>
    </table>
    <ol class="route-list">
      <li v-for="stage in llmRouteStages" :key="stage.id">{{ stage.label[locale] }}</li>
    </ol>
  </section>
</template>

<style scoped>
.knowledge-map { border: 2px solid currentColor; padding: 1rem; }
header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
button { min-height: 2.75rem; }
.chapter-list { columns: 2; }
.chapter-list li { break-inside: avoid; margin-block-end: .8rem; }
.chapter-list p { margin: .25rem 0; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid currentColor; padding: .55rem; text-align: start; }
.route-list { display: flex; flex-wrap: wrap; gap: .5rem; padding: 0; list-style: none; }
.route-list li { border: 1px solid currentColor; padding: .45rem; }
@media (max-width: 620px) { .chapter-list { columns: 1; } }
</style>
