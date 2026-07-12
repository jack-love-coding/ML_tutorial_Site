<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import type { RegressionPresetId } from '../types'
import { aiOverviewVisualCopy } from '../data/course'
import { regressionCandidates, regressionPresets } from '../data/experiments'
import { meanSquaredError, predict, rankRegressionCandidates, regressionRows } from '../utils/regression'

const { locale } = useI18n()
const copy = aiOverviewVisualCopy
const presetId = ref<RegressionPresetId>('clear-trend')
const w = ref(4)
const b = ref(48)
const residual = ref(true)
const speed = ref(1)
const cursor = ref(1)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const samples = computed(() => regressionPresets[presetId.value].samples)
const rows = computed(() => regressionRows(samples.value, w.value, b.value))
const currentMse = computed(() => meanSquaredError(samples.value, w.value, b.value))
const ranked = computed(() => rankRegressionCandidates(samples.value, [...regressionCandidates]))
const searchPath = computed(() => [...ranked.value].reverse())
const currentValue = computed(() => `w=${w.value.toFixed(1)}, b=${b.value.toFixed(1)}, MSE=${currentMse.value.toFixed(2)}`)
const x = (value: number) => 28 + value * 52
const y = (value: number) => 230 - (value - 40) * 3

function stop() {
  playing.value = false
  if (timer !== undefined) clearInterval(timer)
  timer = undefined
}

function step() {
  if (cursor.value >= searchPath.value.length) return stop()
  const candidate = searchPath.value[cursor.value]
  w.value = candidate.w
  b.value = candidate.b
  cursor.value += 1
  if (cursor.value >= searchPath.value.length) stop()
}

function autoRun() {
  if (playing.value) return stop()
  playing.value = true
  timer = setInterval(step, Math.max(160, 900 / speed.value))
}

function reset() {
  stop()
  presetId.value = 'clear-trend'
  w.value = 4
  b.value = 48
  speed.value = 1
  residual.value = true
  cursor.value = 1
}

watch(speed, () => {
  if (playing.value) {
    stop()
    autoRun()
  }
})
watch(presetId, () => { cursor.value = 1 })
onBeforeUnmount(stop)
</script>

<template>
  <section class="algorithm-lab" :aria-label="copy.lab[locale as AppLocale]">
    <div class="algorithm-lab__controls">
      <label>{{ copy.preset[locale as AppLocale] }}
        <select v-model="presetId">
          <option v-for="preset in regressionPresets" :key="preset.id" :value="preset.id">{{ preset.label[locale as AppLocale] }}</option>
        </select>
      </label>
      <label>{{ copy.slope[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ w.toFixed(1) }}
        <input v-model.number="w" type="range" min="0" max="12" step="0.1">
      </label>
      <label>{{ copy.intercept[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ b.toFixed(1) }}
        <input v-model.number="b" type="range" min="35" max="60" step="0.1">
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
  </section>
</template>

<style scoped>
.algorithm-lab { display:grid; grid-template-columns:minmax(15rem, .8fr) minmax(18rem, 1.2fr); gap:1rem; }
.algorithm-lab__controls { display:grid; gap:.65rem; align-content:start; }
label { display:grid; gap:.25rem; font-weight:700; }
.algorithm-lab__check { display:flex; align-items:center; }
.algorithm-lab__actions { display:flex; flex-wrap:wrap; gap:.5rem; }
figure { margin:0; } svg { width:100%; min-height:16rem; background:#f7fbfa; border-radius:.75rem; }
.axis { stroke:#688078; } .fit-line { stroke:#d45c43; stroke-width:3; } .residual { stroke:#8b5cf6; stroke-dasharray:4; } .sample { fill:#0f9f8f; stroke:white; stroke-width:2; }
@media (max-width:760px) { .algorithm-lab { grid-template-columns:1fr; } }
</style>
