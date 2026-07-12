<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import {
  aiOverviewScenarioCards,
  aiOverviewVisualCopy,
  learningAssistantAlgorithms,
  learningParadigmRows,
  llmRouteStages,
  mlProcessSteps,
  paradigmDecisionQuestions,
} from '../data/course'

defineProps<{ locale: AppLocale }>()
function printKnowledgeMap() { window.print() }
</script>

<template>
  <section class="ai-overview-knowledge-map knowledge-map" :aria-label="aiOverviewVisualCopy.knowledgeMap[locale]">
    <header>
      <h2>{{ aiOverviewVisualCopy.knowledgeMap[locale] }}</h2>
      <button type="button" @click="printKnowledgeMap">{{ aiOverviewVisualCopy.print[locale] }}</button>
    </header>
    <section data-knowledge-section="common-loop">
      <h3>{{ aiOverviewVisualCopy.processTrace[locale] }}</h3>
      <ol class="loop-list"><li v-for="step in mlProcessSteps" :key="step.id"><strong>{{ step.label[locale] }}</strong><span>{{ step.description[locale] }}</span></li></ol>
    </section>
    <section data-knowledge-section="paradigm-comparison">
      <h3>{{ aiOverviewVisualCopy.paradigmComparison[locale] }}</h3>
      <table>
        <thead><tr>
          <th scope="col">{{ aiOverviewVisualCopy.paradigmComparison[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.availableInformation[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.learningSignal[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.learnedObject[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.output[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.typicalProblem[locale] }}</th>
        </tr></thead>
        <tbody><tr v-for="row in learningParadigmRows" :key="row.id">
          <th scope="row">{{ aiOverviewScenarioCards.find((card) => card.id === row.id)!.title[locale] }}</th>
          <td>{{ row.availableInfo[locale] }}</td><td>{{ row.learningSignal[locale] }}</td><td>{{ row.learnedObject[locale] }}</td><td>{{ row.output[locale] }}</td><td>{{ row.typicalProblem[locale] }}</td>
        </tr></tbody>
      </table>
    </section>
    <section data-knowledge-section="representative-algorithms">
      <h3>{{ aiOverviewVisualCopy.learningAssistantMap[locale] }}</h3>
      <ul class="algorithm-list"><li v-for="algorithm in learningAssistantAlgorithms" :key="algorithm.id"><strong>{{ algorithm.label[locale] }}</strong><span>{{ algorithm.taskRole[locale] }}</span><span>{{ algorithm.input[locale] }}</span><span>{{ algorithm.learningSignal[locale] }}</span><span>{{ algorithm.output[locale] }}</span></li></ul>
    </section>
    <section data-knowledge-section="decision-tree">
      <h3>{{ aiOverviewVisualCopy.decisionTree[locale] }}</h3>
      <ol><li v-for="question in paradigmDecisionQuestions" :key="question.id"><strong>{{ question.question[locale] }}</strong><span>{{ question.yes[locale] }}</span><span>{{ question.no[locale] }}</span></li></ol>
    </section>
    <section data-knowledge-section="llm-route">
      <h3>{{ aiOverviewVisualCopy.llmRoute[locale] }}</h3>
      <ol class="route-list"><li v-for="stage in llmRouteStages" :key="stage.id">{{ stage.label[locale] }}</li></ol>
    </section>
  </section>
</template>

<style scoped>
.knowledge-map { border: 2px solid currentColor; padding: 1rem; }
header { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 1rem; }
button { min-height: 2.75rem; }
.loop-list, .algorithm-list { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; padding: 0; list-style: none; }
.loop-list li, .algorithm-list li { display: grid; gap: .25rem; border: 1px solid currentColor; padding: .55rem; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid currentColor; padding: .55rem; text-align: start; }
.route-list { display: flex; flex-wrap: wrap; gap: .5rem; padding: 0; list-style: none; }
.route-list li { border: 1px solid currentColor; padding: .45rem; }
@media (max-width: 620px) { .loop-list, .algorithm-list { grid-template-columns: 1fr; } }
</style>
