<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewScenarioCards, aiOverviewVisualCopy, learningParadigmRows, paradigmDecisionQuestions } from '../data/course'

defineProps<{ locale: AppLocale }>()
</script>

<template>
  <nav class="decision-tree" :aria-label="aiOverviewVisualCopy.decisionTree[locale]">
    <ol>
      <li v-for="question in paradigmDecisionQuestions" :key="question.id">
        <strong>{{ question.question[locale] }}</strong>
        <p><span aria-hidden="true">●</span> {{ question.yes[locale] }}</p>
        <p><span aria-hidden="true">◇</span> {{ question.no[locale] }}</p>
      </li>
    </ol>
    <p id="learning-signal">{{ aiOverviewVisualCopy.learningSignal[locale] }}</p>
    <ul>
      <li v-for="row in learningParadigmRows" :key="row.id" :class="`branch branch--${row.id}`">
        <span class="branch-shape" aria-hidden="true">{{ row.id === 'supervised' ? '●' : row.id === 'unsupervised' ? '■' : '▲' }}</span>
        <strong>{{ aiOverviewScenarioCards.find((card) => card.id === row.id)!.title[locale] }}</strong>
        <p>{{ row.availableInfo[locale] }}</p>
        <p>{{ row.learningSignal[locale] }}</p>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.decision-tree > ul { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .8rem; padding: 0; list-style: none; }
.decision-tree > ol { padding-inline-start: 1.5rem; }
.branch { position: relative; border: 1px solid currentColor; border-radius: .65rem; padding: 1rem; }
.branch::before { content: ''; position: absolute; inset-block-start: -.8rem; inset-inline-start: 50%; height: .8rem; border-inline-start: 2px solid currentColor; }
.branch-shape { margin-inline-end: .4rem; font-size: 1.2rem; }
@media (max-width: 680px) { .decision-tree > ul { grid-template-columns: 1fr; } }
</style>
