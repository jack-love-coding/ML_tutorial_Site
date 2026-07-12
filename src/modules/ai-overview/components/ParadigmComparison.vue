<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewScenarioCards, aiOverviewVisualCopy, learningParadigmRows } from '../data/course'

defineProps<{ locale: AppLocale }>()
</script>

<template>
  <div class="paradigm-comparison">
    <table>
      <caption>{{ aiOverviewVisualCopy.paradigmComparison[locale] }}</caption>
      <thead>
        <tr>
          <th scope="col">{{ aiOverviewVisualCopy.paradigmComparison[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.availableInformation[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.learningSignal[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.learnedObject[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.output[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.typicalProblem[locale] }}</th>
          <th scope="col">{{ aiOverviewVisualCopy.applications[locale] }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in learningParadigmRows" :key="row.id">
          <th scope="row">{{ aiOverviewScenarioCards.find((card) => card.id === row.id)!.title[locale] }}</th>
          <td>{{ row.availableInfo[locale] }}</td>
          <td>{{ row.learningSignal[locale] }}</td>
          <td>{{ row.learnedObject[locale] }}</td>
          <td>{{ row.output[locale] }}</td>
          <td>{{ row.typicalProblem[locale] }}</td>
          <td><ul><li v-for="application in row.applications" :key="application.en">{{ application[locale] }}</li></ul></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.paradigm-comparison { overflow-x: auto; }
table { width: 100%; border-collapse: collapse; }
caption { text-align: start; font-weight: 700; padding-block: .75rem; }
th, td { border: 1px solid currentColor; padding: .7rem; text-align: start; vertical-align: top; }
thead th { border-bottom-width: 3px; }
ul { margin: 0; padding-inline-start: 1.2rem; }
</style>
