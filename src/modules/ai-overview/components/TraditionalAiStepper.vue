<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { AppLocale } from '../../../types/ml'
import { aiOverviewVisualCopy, traditionalAiMethods } from '../data/course'

defineProps<{ locale: AppLocale }>()
const currentMethodId = ref(traditionalAiMethods[0].id)
const currentStep = ref(0)
const currentMethod = computed(() => traditionalAiMethods.find((method) => method.id === currentMethodId.value)!)
const step = computed(() => currentMethod.value.steps[currentStep.value])

watch(currentMethodId, () => { currentStep.value = 0 })
function previous() { currentStep.value = Math.max(0, currentStep.value - 1) }
function next() { currentStep.value = Math.min(currentMethod.value.steps.length - 1, currentStep.value + 1) }
function reset() { currentStep.value = 0 }
</script>

<template>
  <section class="traditional-ai-stepper" :aria-label="aiOverviewVisualCopy.traditionalAi[locale]">
    <div class="method-tabs" role="group" :aria-label="aiOverviewVisualCopy.traditionalAi[locale]">
      <button
        v-for="method in traditionalAiMethods"
        :key="method.id"
        type="button"
        :aria-pressed="method.id === currentMethodId"
        @click="currentMethodId = method.id"
      >{{ method.label[locale] }}</button>
    </div>
    <p>{{ currentMethod.mechanism[locale] }}</p>
    <ol class="steps">
      <li
        v-for="(candidate, index) in currentMethod.steps"
        :key="candidate.id"
        :class="{ current: index === currentStep }"
        :aria-current="index === currentStep ? 'step' : undefined"
      >
        <span class="step-shape" aria-hidden="true">{{ index + 1 }}</span>
        <span>{{ candidate.label[locale] }}</span>
      </li>
    </ol>
    <article aria-live="polite">
      <strong>{{ step.label[locale] }}</strong>
      <p>{{ step.description[locale] }}</p>
      <p class="step-count">{{ aiOverviewVisualCopy.currentStep[locale] }} {{ currentStep + 1 }}/{{ currentMethod.steps.length }}</p>
    </article>
    <div class="step-controls">
      <button type="button" :disabled="currentStep === 0" @click="previous">{{ aiOverviewVisualCopy.previous[locale] }}</button>
      <button type="button" :disabled="currentStep === currentMethod.steps.length - 1" @click="next">{{ aiOverviewVisualCopy.next[locale] }}</button>
      <button type="button" @click="reset">{{ aiOverviewVisualCopy.reset[locale] }}</button>
    </div>
  </section>
</template>

<style scoped>
.method-tabs, .step-controls { display: flex; flex-wrap: wrap; gap: .5rem; }
button { min-height: 2.75rem; padding: .55rem .8rem; }
.steps { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: .65rem; padding: 0; list-style: none; }
.steps li { display: flex; align-items: center; gap: .4rem; border: 1px solid currentColor; border-radius: .5rem; padding: .65rem; }
.steps li.current { border-width: 3px; font-weight: 700; }
.step-shape { display: inline-grid; min-width: 1.75rem; min-height: 1.75rem; place-items: center; border: 1px solid currentColor; border-radius: 50%; }
.step-count { font-variant-numeric: tabular-nums; }
@media (max-width: 620px) { .steps { grid-template-columns: 1fr; } }
</style>
