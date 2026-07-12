<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import { aiOverviewLabCopy, aiOverviewVisualCopy } from '../data/course'
import { AI_OVERVIEW_SEEDS, learnerClusterPoints } from '../data/experiments'
import { normalizeK, normalizeSeed } from '../utils/labInputs'
import { runKMeans, withinGroupDistanceTotal } from '../utils/kmeans'

const { locale } = useI18n()
const copy = aiOverviewVisualCopy
const k = ref(3)
const seed = ref<number>(AI_OVERVIEW_SEEDS.kmeans)
const historyIndex = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
const colors = ['#0f9f8f', '#d45c43', '#6d5bd0', '#d89b13', '#2475b5']

const effectiveK = computed(() => normalizeK(k.value))
const effectiveSeed = computed(() => normalizeSeed(seed.value, AI_OVERVIEW_SEEDS.kmeans))
const result = computed(() => runKMeans(learnerClusterPoints, effectiveK.value, effectiveSeed.value, 20))
const history = computed(() => result.value.history)
const snapshot = computed(() => history.value[historyIndex.value] ?? history.value[0])
const distance = computed(() => snapshot.value.assignments.length
  ? withinGroupDistanceTotal(learnerClusterPoints, snapshot.value.assignments, snapshot.value.centers)
  : 0)
const currentValue = computed(() => `${copy.iteration[locale.value as AppLocale]} ${snapshot.value.iteration}; ${copy.phase[locale.value as AppLocale]}: ${copy[snapshot.value.phase][locale.value as AppLocale]}`)
const x = (value: number) => 24 + value * 3
const y = (value: number) => 320 - value * 3

function pause() {
  playing.value = false
  if (timer !== undefined) clearInterval(timer)
  timer = undefined
}
function next() {
  historyIndex.value = Math.min(history.value.length - 1, historyIndex.value + 1)
  if (historyIndex.value === history.value.length - 1) pause()
}
function previous() { historyIndex.value = Math.max(0, historyIndex.value - 1) }
function autoRun() {
  if (playing.value) return pause()
  playing.value = true
  timer = setInterval(next, 650)
}
function reset() {
  pause()
  k.value = 3
  seed.value = AI_OVERVIEW_SEEDS.kmeans
  historyIndex.value = 0
}
function commitInputs() {
  k.value = effectiveK.value
  seed.value = effectiveSeed.value
}
watch([k, seed], () => { pause(); historyIndex.value = 0 })
onBeforeUnmount(pause)
</script>

<template>
  <section class="algorithm-lab" :aria-label="copy.lab[locale as AppLocale]">
    <div class="algorithm-lab__controls">
      <label>{{ copy.clusterCount[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ effectiveK }}
        <input v-model.number="k" type="number" min="2" max="5" step="1" @change="commitInputs">
      </label>
      <label>{{ copy.seed[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ effectiveSeed }}
        <input v-model.number="seed" type="number" step="1" @change="commitInputs">
      </label>
      <p aria-live="polite"><strong>{{ currentValue }}</strong></p>
      <p>{{ copy.withinGroupDistance[locale as AppLocale] }}: <strong>{{ distance.toFixed(1) }}</strong></p>
      <div class="algorithm-lab__actions">
        <button type="button" :disabled="historyIndex === 0" @click="previous">{{ copy.previous[locale as AppLocale] }}</button>
        <button type="button" :disabled="historyIndex === history.length - 1" @click="next">{{ copy.singleStep[locale as AppLocale] }}</button>
        <button type="button" @click="autoRun">{{ playing ? copy.pause[locale as AppLocale] : copy.autoRun[locale as AppLocale] }}</button>
        <button type="button" @click="reset">{{ copy.reset[locale as AppLocale] }}</button>
      </div>
      <small>{{ copy.history[locale as AppLocale] }}: {{ historyIndex + 1 }}/{{ history.length }}</small>
    </div>
    <figure>
      <svg viewBox="0 0 340 340" role="img" :aria-label="currentValue">
        <g v-for="(point, index) in learnerClusterPoints" :key="point.id">
          <circle :cx="x(point.x)" :cy="y(point.y)" r="7" :fill="snapshot.assignments.length ? colors[snapshot.assignments[index]] : '#718078'" />
          <text :x="x(point.x) + 9" :y="y(point.y) + 4">{{ snapshot.assignments.length ? snapshot.assignments[index] + 1 : '–' }}</text>
        </g>
        <g v-for="(center, index) in snapshot.centers" :key="center.id">
          <path :transform="`translate(${x(center.x)} ${y(center.y)})`" d="M -9 -9 L 9 9 M 9 -9 L -9 9" :stroke="colors[index]" stroke-width="5"><title>{{ `${aiOverviewLabCopy.centerLabel[locale as AppLocale]} ${index + 1}` }}</title></path>
        </g>
      </svg>
      <figcaption>{{ copy.withinGroupDistance[locale as AppLocale] }}: {{ distance.toFixed(1) }}</figcaption>
    </figure>
  </section>
</template>

<style scoped>
.algorithm-lab { display:grid; grid-template-columns:minmax(15rem,.75fr) minmax(18rem,1.25fr); gap:1rem; }
.algorithm-lab__controls { display:grid; gap:.65rem; align-content:start; }
label { display:grid; gap:.25rem; font-weight:700; } .algorithm-lab__actions { display:flex; flex-wrap:wrap; gap:.5rem; }
figure { margin:0; } svg { width:100%; background:#f7fbfa; border-radius:.75rem; } text { font:700 11px system-ui; fill:#283631; }
@media (max-width:760px) { .algorithm-lab { grid-template-columns:1fr; } }
</style>
