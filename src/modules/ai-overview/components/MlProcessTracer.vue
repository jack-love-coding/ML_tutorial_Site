<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewScenarioCards, aiOverviewVisualCopy, mlProcessSteps } from '../data/course'

defineProps<{ locale: AppLocale }>()
const supervised = aiOverviewScenarioCards.find((card) => card.id === 'supervised')!
</script>

<template>
  <figure class="ml-process-tracer">
    <figcaption>{{ aiOverviewVisualCopy.processTrace[locale] }}</figcaption>
    <dl class="record-roles">
      <div id="learner-id"><dt>{{ aiOverviewVisualCopy.learnerId[locale] }}</dt><dd>{{ supervised.problem[locale] }}</dd></div>
      <div id="feature"><dt>{{ aiOverviewVisualCopy.feature[locale] }}</dt><dd>{{ supervised.availableInformation[locale] }}</dd></div>
      <div id="target"><dt>{{ aiOverviewVisualCopy.target[locale] }}</dt><dd>{{ supervised.learningSignal[locale] }}</dd></div>
      <div id="unseen-data"><dt>{{ aiOverviewVisualCopy.unseenData[locale] }}</dt><dd>{{ supervised.output[locale] }}</dd></div>
    </dl>
    <ol :aria-label="aiOverviewVisualCopy.processTrace[locale]">
      <li v-for="(stage, index) in mlProcessSteps" :key="stage.id">
        <span class="stage-marker" aria-hidden="true">{{ index + 1 }}</span>
        <strong>{{ stage.label[locale] }}</strong>
        <p>{{ stage.description[locale] }}</p>
      </li>
    </ol>
  </figure>
</template>

<style scoped>
.ml-process-tracer { margin: 0; }
figcaption { font-weight: 700; }
ol { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .75rem; padding: 0; list-style: none; }
li { border: 1px solid currentColor; border-radius: .6rem; padding: .8rem; }
.stage-marker { display: grid; width: 2rem; height: 2rem; place-items: center; border: 2px solid currentColor; transform: rotate(45deg); }
.stage-marker::first-line { transform: rotate(-45deg); }
.record-roles { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .5rem; }
.record-roles div { border-inline-start: 3px solid currentColor; padding-inline-start: .6rem; }
.record-roles dt { font-weight: 700; }
.record-roles dd { margin: .25rem 0 0; }
@media (max-width: 700px) { ol, .record-roles { grid-template-columns: 1fr; } }
</style>
