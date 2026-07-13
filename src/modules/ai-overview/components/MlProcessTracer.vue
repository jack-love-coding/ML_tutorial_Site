<script setup lang="ts">
import type { AppLocale } from '../../../types/ml'
import { aiOverviewVisualCopy, mlProcessRecord, mlProcessSteps } from '../data/course'

defineProps<{ locale: AppLocale }>()
const recordFields = [
  ['identifier', mlProcessRecord.identifier],
  ['candidate-feature', mlProcessRecord.candidateFeature],
  ['selected-feature', mlProcessRecord.selectedFeature],
  ['target', mlProcessRecord.target],
] as const
</script>

<template>
  <figure class="ml-process-tracer">
    <figcaption>{{ aiOverviewVisualCopy.processTrace[locale] }}</figcaption>
    <dl class="record-roles">
      <div v-for="([role, field]) in recordFields" :key="role" :data-role="role">
        <dt>{{ field.label[locale] }}</dt>
        <dd><strong>{{ field.value[locale] }}</strong><small>{{ field.note[locale] }}</small></dd>
      </div>
    </dl>
    <p class="evaluation-boundary" data-role="unseen-evaluation">
      <strong>{{ aiOverviewVisualCopy.unseenData[locale] }}</strong>
      {{ mlProcessRecord.unseenEvaluation[locale] }}
    </p>
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
.record-roles dd { display: grid; gap: .25rem; }
.record-roles small { color: var(--muted); }
.evaluation-boundary { border: 1px dashed currentColor; border-radius: .6rem; padding: .75rem; }
@media (max-width: 700px) { ol, .record-roles { grid-template-columns: 1fr; } }
</style>
