<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import type { RegressionPresetId } from '../types'
import { aiOverviewLabCopy, aiOverviewVisualCopy, regressionClassificationRows } from '../data/course'
import { regressionCandidates, regressionPresets } from '../data/experiments'
import {
  initializeRegressionSearch,
  predict,
  rankRegressionCandidates,
  recordRegressionCandidate,
  regressionRows,
  stepRegressionSearch,
} from '../utils/regression'

const { locale } = useI18n()
const copy = aiOverviewVisualCopy
const presetId = ref<RegressionPresetId>('clear-trend')
const initialSearch = initializeRegressionSearch(regressionPresets['clear-trend'].samples, [...regressionCandidates])
const searchState = ref(initialSearch)
const w = ref(initialSearch.current.w)
const b = ref(initialSearch.current.b)
const residual = ref(true)
const speed = ref(1)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const samples = computed(() => regressionPresets[presetId.value].samples)
const rows = computed(() => regressionRows(samples.value, w.value, b.value))
const ranked = computed(() => rankRegressionCandidates(samples.value, [...regressionCandidates]))
const currentCandidate = computed(() => searchState.value.current)
const currentBest = computed(() => searchState.value.best)
const candidateHistory = computed(() => searchState.value.history)
const currentValue = computed(() => `w=${w.value.toFixed(1)}, b=${b.value.toFixed(1)}, MSE=${currentCandidate.value.mse.toFixed(2)}`)
const x = (value: number) => 28 + value * 52
const y = (value: number) => 230 - (value - 40) * 3

function stop() {
  playing.value = false
  if (timer !== undefined) clearInterval(timer)
  timer = undefined
}

function step() {
  if (searchState.value.cursor >= searchState.value.path.length) return stop()
  searchState.value = stepRegressionSearch(searchState.value, samples.value)
  w.value = searchState.value.current.w
  b.value = searchState.value.current.b
  if (searchState.value.cursor >= searchState.value.path.length) stop()
}

function autoRun() {
  if (playing.value) return stop()
  playing.value = true
  timer = setInterval(step, Math.max(160, 900 / speed.value))
}

function reset() {
  stop()
  presetId.value = 'clear-trend'
  speed.value = 1
  residual.value = true
  initializeForPreset()
}

function initializeForPreset() {
  searchState.value = initializeRegressionSearch(samples.value, [...regressionCandidates])
  w.value = searchState.value.current.w
  b.value = searchState.value.current.b
}

function applyPreset() {
  stop()
  initializeForPreset()
}

function recordManualCandidate() {
  stop()
  searchState.value = recordRegressionCandidate(searchState.value, samples.value, { w: w.value, b: b.value }, 'manual')
}

watch(speed, () => {
  if (playing.value) {
    stop()
    autoRun()
  }
})
onBeforeUnmount(stop)
</script>

<template>
  <section class="algorithm-lab" :aria-label="copy.lab[locale as AppLocale]">
    <div class="algorithm-lab__controls">
      <label>{{ copy.preset[locale as AppLocale] }}
        <select v-model="presetId" @change="applyPreset">
          <option v-for="preset in regressionPresets" :key="preset.id" :value="preset.id">{{ preset.label[locale as AppLocale] }}</option>
        </select>
      </label>
      <label>{{ copy.slope[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ w.toFixed(1) }}
        <input v-model.number="w" type="range" min="0" max="12" step="0.1" @input="recordManualCandidate">
      </label>
      <label>{{ copy.intercept[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ b.toFixed(1) }}
        <input v-model.number="b" type="range" min="35" max="60" step="0.1" @input="recordManualCandidate">
      </label>
      <label>{{ copy.speed[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ speed }}×
        <input v-model.number="speed" type="range" min="0.5" max="3" step="0.5">
      </label>
      <label class="algorithm-lab__check"><input v-model="residual" type="checkbox"> {{ copy.residuals[locale as AppLocale] }}</label>
      <div class="algorithm-lab__actions">
        <button type="button" @click="step">{{ copy.singleStep[locale as AppLocale] }}</button>
        <button type="button" @click="autoRun">{{ playing ? copy.pause[locale as AppLocale] : copy.autoRun[locale as AppLocale] }}</button>
        <button type="button" @click="reset">{{ copy.reset[locale as AppLocale] }}</button>
      </div>
    </div>

    <div class="regression-lab__teaching-surface">
      <figure>
        <svg viewBox="0 0 360 250" role="img" :aria-label="currentValue">
          <line class="axis" x1="28" y1="230" x2="340" y2="230" />
          <line class="axis" x1="28" y1="20" x2="28" y2="230" />
          <line class="fit-line" :x1="x(0)" :y1="y(predict({ id: 'line-start', x: 0, y: 0 }, w, b))" :x2="x(6)" :y2="y(predict({ id: 'line-end', x: 6, y: 0 }, w, b))" />
          <g v-for="row in rows" :key="row.id">
            <line v-if="residual" class="residual" :x1="x(row.x)" :x2="x(row.x)" :y1="y(row.y)" :y2="y(row.predicted)" />
            <circle class="sample" :cx="x(row.x)" :cy="y(row.y)" r="5"><title>{{ `${row.id}: y=${row.y}, ŷ=${row.predicted.toFixed(1)}` }}</title></circle>
          </g>
        </svg>
        <figcaption>{{ currentValue }}</figcaption>
      </figure>

      <section>
        <h3>{{ copy.regressionRows[locale as AppLocale] }}</h3>
        <div class="regression-lab__table-wrap" tabindex="0" role="region" :aria-label="copy.regressionRows[locale as AppLocale]">
          <table data-table="regression-rows">
            <thead><tr><th>ID</th><th>x</th><th>y</th><th>{{ copy.prediction[locale as AppLocale] }}</th><th>residual</th><th>{{ copy.squaredError[locale as AppLocale] }}</th></tr></thead>
            <tbody><tr v-for="row in rows" :key="row.id"><th>{{ row.id }}</th><td>{{ row.x }}</td><td>{{ row.y }}</td><td>{{ row.predicted.toFixed(2) }}</td><td>{{ row.residual.toFixed(2) }}</td><td>{{ row.squaredResidual.toFixed(2) }}</td></tr></tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>{{ copy.candidateSearch[locale as AppLocale] }}</h3>
        <dl class="regression-lab__candidate-state">
          <div><dt>{{ copy.currentCandidate[locale as AppLocale] }}</dt><dd>w={{ currentCandidate.w.toFixed(1) }}, b={{ currentCandidate.b.toFixed(1) }}, MSE={{ currentCandidate.mse.toFixed(2) }}</dd></div>
          <div><dt>{{ copy.currentBest[locale as AppLocale] }}</dt><dd>w={{ currentBest.w.toFixed(1) }}, b={{ currentBest.b.toFixed(1) }}, MSE={{ currentBest.mse.toFixed(2) }}</dd></div>
        </dl>
        <div class="regression-lab__table-wrap" tabindex="0" role="region" :aria-label="copy.candidateSearch[locale as AppLocale]">
          <table data-table="candidate-search">
            <thead><tr><th>#</th><th>w</th><th>b</th><th>MSE</th></tr></thead>
            <tbody><tr v-for="(candidate, index) in ranked" :key="`${candidate.w}-${candidate.b}`" :aria-current="candidate.w === currentCandidate.w && candidate.b === currentCandidate.b ? 'true' : undefined"><th>{{ index + 1 }}</th><td>{{ candidate.w.toFixed(1) }}</td><td>{{ candidate.b.toFixed(1) }}</td><td>{{ candidate.mse.toFixed(2) }}</td></tr></tbody>
          </table>
        </div>
        <h4>{{ copy.candidateHistory[locale as AppLocale] }}</h4>
        <div class="regression-lab__table-wrap" tabindex="0" role="region" :aria-label="copy.candidateHistory[locale as AppLocale]">
          <table data-table="candidate-history">
            <thead><tr><th>#</th><th>{{ copy.visitSource[locale as AppLocale] }}</th><th>w</th><th>b</th><th>MSE</th></tr></thead>
            <tbody><tr v-for="visit in candidateHistory" :key="visit.sequence" :aria-current="visit.sequence === currentCandidate.sequence ? 'true' : undefined"><th>{{ visit.sequence }}</th><td>{{ aiOverviewLabCopy.candidateVisitSources[visit.source][locale as AppLocale] }}</td><td>{{ visit.w.toFixed(1) }}</td><td>{{ visit.b.toFixed(1) }}</td><td>{{ visit.mse.toFixed(2) }}</td></tr></tbody>
          </table>
        </div>
      </section>

      <section>
        <h3>{{ copy.regressionClassification[locale as AppLocale] }}</h3>
        <div class="regression-lab__table-wrap" tabindex="0" role="region" :aria-label="copy.regressionClassification[locale as AppLocale]">
          <table data-table="regression-classification">
            <thead><tr><th>{{ copy.modelTask[locale as AppLocale] }}</th><th>{{ copy.valueType[locale as AppLocale] }}</th><th>{{ copy.examples[locale as AppLocale] }}</th></tr></thead>
            <tbody><tr v-for="comparison in regressionClassificationRows" :key="comparison.id"><th>{{ comparison.modelTask[locale as AppLocale] }}</th><td>{{ comparison.outputType[locale as AppLocale] }}</td><td>{{ comparison.examples[locale as AppLocale] }}</td></tr></tbody>
          </table>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.algorithm-lab { display:grid; grid-template-columns:minmax(15rem, .65fr) minmax(18rem, 1.35fr); gap:1rem; }
.algorithm-lab__controls { display:grid; gap:.65rem; align-content:start; }
.regression-lab__teaching-surface { display:grid; gap:1rem; min-width:0; }
.regression-lab__teaching-surface section { min-width:0; }
.regression-lab__teaching-surface h3 { margin:.25rem 0 .5rem; }
.regression-lab__candidate-state { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.5rem; margin:0 0 .5rem; }
.regression-lab__candidate-state div { padding:.6rem; border-radius:.5rem; background:#f4f8f7; }
.regression-lab__candidate-state dd { margin:0; font-weight:800; }
.regression-lab__table-wrap { overflow-x:auto; max-width:100%; }
table { width:100%; min-width:36rem; border-collapse:collapse; font-variant-numeric:tabular-nums; }
th,td { padding:.45rem; border-bottom:1px solid #dce6e2; text-align:right; }
th:first-child,td:first-child { text-align:left; }
tr[aria-current='true'] { outline:2px solid #0f9f8f; outline-offset:-2px; }
label { display:grid; gap:.25rem; font-weight:700; }
.algorithm-lab__check { display:flex; align-items:center; }
.algorithm-lab__actions { display:flex; flex-wrap:wrap; gap:.5rem; }
figure { margin:0; } svg { width:100%; min-height:16rem; background:#f7fbfa; border-radius:.75rem; }
.axis { stroke:#688078; } .fit-line { stroke:#d45c43; stroke-width:3; } .residual { stroke:#8b5cf6; stroke-dasharray:4; } .sample { fill:#0f9f8f; stroke:white; stroke-width:2; }
@media (max-width:760px) { .algorithm-lab { grid-template-columns:1fr; } .regression-lab__candidate-state { grid-template-columns:1fr; } }
</style>
