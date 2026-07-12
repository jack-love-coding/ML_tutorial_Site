<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale } from '../../../types/ml'
import type { GridAction, GridCell, QTable } from '../types'
import { aiOverviewLabCopy, aiOverviewVisualCopy } from '../data/course'
import { AI_OVERVIEW_SEEDS, qLearningEnvironment } from '../data/experiments'
import { createSeededRandom } from '../utils/random'
import { normalizeSeed } from '../utils/labInputs'
import {
  Q_LEARNING_ACTIONS,
  createQTable,
  evaluateGreedyPolicy,
  runEpisode,
  selectAction,
  stateKey,
  stepQLearningSession,
} from '../utils/qLearning'

const { locale } = useI18n()
const copy = aiOverviewVisualCopy
const learningRate = 0.5
const discountFactor = 0.9
const seed = ref<number>(AI_OVERVIEW_SEEDS.qLearning)
const explorationRate = ref(0.3)
const speed = ref(1)
const episode = ref(0)
const qTable = ref<QTable>(createQTable(qLearningEnvironment))
const currentState = ref<GridCell>({ ...qLearningEnvironment.start })
const cumulativeReward = ref(0)
const playing = ref(false)
let timer: ReturnType<typeof setInterval> | undefined
let random = createSeededRandom(AI_OVERVIEW_SEEDS.qLearning)
const effectiveSeed = computed(() => normalizeSeed(seed.value, AI_OVERVIEW_SEEDS.qLearning))
const safeExplorationRate = computed(() => Number.isFinite(explorationRate.value) ? Math.min(1, Math.max(0, explorationRate.value)) : 0.3)

const actionSymbols: Record<GridAction, string> = { up: '↑', right: '→', down: '↓', left: '←' }
const qRows = computed(() => Object.entries(qTable.value))
const currentStateKey = computed(() => stateKey(currentState.value))
const currentValues = computed(() => qTable.value[currentStateKey.value] ?? qTable.value[stateKey(qLearningEnvironment.start)])
const policy = computed(() => Object.fromEntries(qRows.value.map(([key, values]) => {
  const [row, column] = key.split(',').map(Number)
  return [key, selectAction({ [key]: values }, { row, column }, 0, () => { throw new Error('greedy policy does not use randomness') })]
})))
const evaluation = computed(() => evaluateGreedyPolicy(qLearningEnvironment, qTable.value, 32))

function pause() {
  playing.value = false
  if (timer !== undefined) clearInterval(timer)
  timer = undefined
}
function oneAction() {
  const result = stepQLearningSession({
    environment: qLearningEnvironment,
    currentState: currentState.value,
    qTable: qTable.value,
    explorationRate: safeExplorationRate.value,
    learningRate,
    discountFactor,
    random,
  })
  qTable.value = result.qTable
  currentState.value = result.nextState
  cumulativeReward.value += result.reward
}
function oneEpisode() {
  const result = runEpisode(qLearningEnvironment, structuredClone(qTable.value), {
    explorationRate: safeExplorationRate.value,
    learningRate,
    discountFactor,
    random,
  })
  episode.value += 1
  qTable.value = result.qTable
  currentState.value = result.finalState
  cumulativeReward.value += result.cumulativeReward
}
function continuousTraining() {
  if (playing.value) return pause()
  playing.value = true
  timer = setInterval(oneEpisode, Math.max(160, 900 / speed.value))
}
function resetTraining() {
  pause()
  episode.value = 0
  qTable.value = createQTable(qLearningEnvironment)
  currentState.value = { ...qLearningEnvironment.start }
  cumulativeReward.value = 0
  random = createSeededRandom(effectiveSeed.value)
}
function reset() {
  seed.value = AI_OVERVIEW_SEEDS.qLearning
  explorationRate.value = 0.3
  speed.value = 1
  resetTraining()
}
function commitSeed() { seed.value = effectiveSeed.value }
watch(speed, () => { if (playing.value) { pause(); continuousTraining() } })
watch([seed, explorationRate], resetTraining)
onBeforeUnmount(pause)
</script>

<template>
  <section class="q-lab" :aria-label="copy.lab[locale as AppLocale]">
    <div class="q-lab__controls">
      <label>{{ copy.seed[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ effectiveSeed }}
        <input v-model.number="seed" type="number" step="1" @change="commitSeed">
      </label>
      <label>{{ copy.explorationRate[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ explorationRate.toFixed(2) }}
        <input v-model.number="explorationRate" type="range" min="0" max="1" step="0.05">
      </label>
      <label>{{ copy.speed[locale as AppLocale] }} — {{ copy.currentValue[locale as AppLocale] }}: {{ speed }}×
        <input v-model.number="speed" type="range" min="0.5" max="3" step="0.5">
      </label>
      <label>{{ copy.learningRate[locale as AppLocale] }}<input :value="learningRate" type="number" disabled></label>
      <label>{{ copy.discountFactor[locale as AppLocale] }}<input :value="discountFactor" type="number" disabled></label>
      <div class="q-lab__actions">
        <button type="button" @click="oneAction">{{ copy.oneAction[locale as AppLocale] }}</button>
        <button type="button" @click="oneEpisode">{{ copy.oneEpisode[locale as AppLocale] }}</button>
        <button type="button" @click="continuousTraining">{{ playing ? copy.pause[locale as AppLocale] : copy.autoRun[locale as AppLocale] }}</button>
        <button type="button" @click="reset">{{ copy.reset[locale as AppLocale] }}</button>
      </div>
    </div>

    <div class="q-lab__main">
      <dl class="q-lab__status">
        <div><dt>{{ copy.episode[locale as AppLocale] }}</dt><dd>{{ episode }}</dd></div>
        <div><dt>{{ copy.currentState[locale as AppLocale] }}</dt><dd>{{ currentStateKey }}</dd></div>
        <div><dt>{{ copy.cumulativeReward[locale as AppLocale] }}</dt><dd>{{ cumulativeReward }}</dd></div>
      </dl>
      <section :aria-label="copy.currentState[locale as AppLocale]" class="q-lab__values">
        <article v-for="action in Q_LEARNING_ACTIONS" :key="action">
          <span>{{ actionSymbols[action] }} {{ aiOverviewLabCopy.actions[action][locale as AppLocale] }}</span><strong>{{ currentValues[action].toFixed(2) }}</strong>
        </article>
      </section>
      <h3>{{ copy.policy[locale as AppLocale] }}</h3>
      <div class="q-grid" role="img" :aria-label="`${copy.policy[locale as AppLocale]}: ${evaluation.steps} steps`">
        <template v-for="row in qLearningEnvironment.height" :key="row">
          <div v-for="column in qLearningEnvironment.width" :key="`${row}-${column}`" class="q-grid__cell">
            <span v-if="qLearningEnvironment.obstacles.some((cell) => cell.row === row - 1 && cell.column === column - 1)">■</span>
            <span v-else-if="qLearningEnvironment.goal.row === row - 1 && qLearningEnvironment.goal.column === column - 1">★</span>
            <span v-else>{{ actionSymbols[policy[`${row - 1},${column - 1}`]] }}</span>
          </div>
        </template>
      </div>
      <details>
        <summary>{{ copy.fullQTable[locale as AppLocale] }}</summary>
        <table><thead><tr><th>{{ aiOverviewLabCopy.qTableState[locale as AppLocale] }}</th><th v-for="action in Q_LEARNING_ACTIONS" :key="action">{{ aiOverviewLabCopy.actions[action][locale as AppLocale] }}</th></tr></thead>
          <tbody><tr v-for="([key, values]) in qRows" :key="key"><th>{{ key }}</th><td v-for="action in Q_LEARNING_ACTIONS" :key="action">{{ values[action].toFixed(2) }}</td></tr></tbody>
        </table>
      </details>
    </div>
  </section>
</template>

<style scoped>
.q-lab { display:grid; grid-template-columns:minmax(15rem,.75fr) minmax(18rem,1.25fr); gap:1rem; }
.q-lab__controls { display:grid; gap:.6rem; align-content:start; } label { display:grid; gap:.2rem; font-weight:700; }
.q-lab__actions { display:flex; flex-wrap:wrap; gap:.5rem; }.q-lab__status,.q-lab__values { display:grid; grid-template-columns:repeat(3,1fr); gap:.5rem; }
.q-lab__status div,.q-lab__values article { padding:.65rem; background:#f4f8f7; border-radius:.6rem; }.q-lab__status dd { margin:0; font-weight:800; }
.q-lab__values { grid-template-columns:repeat(4,1fr); }.q-lab__values article { display:grid; }
.q-grid { display:grid; grid-template-columns:repeat(4,3rem); gap:.25rem; }.q-grid__cell { display:grid; place-items:center; aspect-ratio:1; background:#e6f5f1; font-size:1.5rem; border-radius:.3rem; }
table { width:100%; border-collapse:collapse; font-variant-numeric:tabular-nums; } th,td { padding:.3rem; text-align:right; border-bottom:1px solid #dce6e2; }
@media (max-width:760px) { .q-lab { grid-template-columns:1fr; } }
</style>
