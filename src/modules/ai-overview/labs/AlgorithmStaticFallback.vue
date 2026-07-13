<script lang="ts">
import type { AppLocale } from '../../../types/ml'
import type { KMeansPhase, StaticAlgorithmFrame } from '../types'
import { aiOverviewLabCopy } from '../data/course'
import { AI_OVERVIEW_SEEDS, learnerClusterPoints, qLearningEnvironment, regressionCandidates, regressionPresets } from '../data/experiments'
import { runKMeans } from '../utils/kmeans'
import { createQTable, evaluateGreedyPolicy, trainEpisodes } from '../utils/qLearning'
import { buildStaticQUpdateFrame } from '../utils/qLearningStatic'
import { meanSquaredError, rankRegressionCandidates } from '../utils/regression'

const regressionSamples = regressionPresets['clear-trend'].samples
const rankedRegression = rankRegressionCandidates(regressionSamples, [...regressionCandidates])
const regressionStates = [regressionCandidates[0], regressionCandidates[1], regressionCandidates[2], rankedRegression[0]]
const regressionFrameIds = ['initial', 'one-update', 'intermediate', 'converged'] as const

export const regressionFrames: StaticAlgorithmFrame[] = regressionStates.map((state, index) => ({
  id: regressionFrameIds[index],
  ...aiOverviewLabCopy.staticFrames.regression[regressionFrameIds[index]],
  values: { w: state.w, b: state.b, mse: Number(meanSquaredError(regressionSamples, state.w, state.b).toFixed(2)) },
}))

const kmeansResult = runKMeans(learnerClusterPoints, 3, AI_OVERVIEW_SEEDS.kmeans, 20)
const kmeansHistory = kmeansResult.history
const kmeansStates = [kmeansHistory[0], kmeansHistory[Math.min(2, kmeansHistory.length - 1)], kmeansHistory[Math.floor(kmeansHistory.length / 2)], kmeansHistory.at(-1)!]
const kmeansFrameIds = ['initial', 'one-update', 'intermediate', 'converged'] as const
export const kmeansFrames: StaticAlgorithmFrame[] = kmeansStates.map((state, index) => ({
  id: kmeansFrameIds[index],
  ...aiOverviewLabCopy.staticFrames.kmeans[kmeansFrameIds[index]],
  values: { iteration: state.iteration, phase: state.phase, distance: Number(state.withinGroupDistanceTotal.toFixed(1)) },
}))

const qLearningFrameIds = ['initial', 'one-update', 'intermediate', 'evaluated'] as const
function policyFrame(episodes: 0 | 12 | 40, id: 'initial' | 'intermediate' | 'evaluated'): StaticAlgorithmFrame {
  const qTable = episodes === 0 ? createQTable(qLearningEnvironment) : trainEpisodes(qLearningEnvironment, {
    episodes,
    seed: AI_OVERVIEW_SEEDS.qLearning,
    explorationRate: 0.3,
    learningRate: 0.5,
    discountFactor: 0.9,
  }).qTable
  const evaluated = evaluateGreedyPolicy(qLearningEnvironment, qTable, 32)
  return {
    id,
    ...aiOverviewLabCopy.staticFrames.qLearning[id],
    values: { episodes, steps: evaluated.steps, reward: evaluated.cumulativeReward, reachedGoal: evaluated.reachedGoal },
  }
}
export const qLearningFrames: StaticAlgorithmFrame[] = [
  policyFrame(0, 'initial'),
  {
    id: qLearningFrameIds[1],
    ...aiOverviewLabCopy.staticFrames.qLearning['one-update'],
    values: buildStaticQUpdateFrame(),
  },
  policyFrame(12, 'intermediate'),
  policyFrame(40, 'evaluated'),
]

export const staticAlgorithmFrames = { regression: regressionFrames, kmeans: kmeansFrames, qLearning: qLearningFrames }
</script>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { aiOverviewLabCopy as localizedLabCopy, aiOverviewVisualCopy } from '../data/course'

const props = defineProps<{ algorithm: 'regression' | 'kmeans' | 'qLearning' }>()
const { locale } = useI18n()
const frames = computed(() => staticAlgorithmFrames[props.algorithm])
if (frames.value.length !== 4) throw new Error('Static fallback frames.length === 4 is required')
type StaticValueKey = keyof typeof localizedLabCopy.staticValueLabels
function valueLabel(key: string) { return localizedLabCopy.staticValueLabels[key as StaticValueKey][locale.value as AppLocale] }
function localizedValue(key: string, value: string | number | boolean) {
  if (key === 'phase') return localizedLabCopy.phases[value as KMeansPhase][locale.value as AppLocale]
  if (key === 'reachedGoal') return localizedLabCopy.booleans[value ? 'yes' : 'no'][locale.value as AppLocale]
  if (key === 'action') return localizedLabCopy.actions[value as keyof typeof localizedLabCopy.actions][locale.value as AppLocale]
  return value
}
</script>

<template>
  <section class="static-fallback" :aria-label="aiOverviewVisualCopy.staticFallback[locale as AppLocale]">
    <h3>{{ aiOverviewVisualCopy.staticFallback[locale as AppLocale] }}</h3>
    <p class="static-fallback__desktop-note">{{ aiOverviewVisualCopy.desktopInteractiveNote[locale as AppLocale] }}</p>
    <ol>
      <li v-for="frame in frames.slice(0, 4)" :key="frame.id" :data-frame-id="frame.id">
        <strong>{{ frame.title[locale as AppLocale] }}</strong>
        <p>{{ frame.explanation[locale as AppLocale] }}</p>
        <dl><div v-for="(value, key) in frame.values" :key="key"><dt>{{ valueLabel(key) }}</dt><dd>{{ localizedValue(key, value) }}</dd></div></dl>
      </li>
    </ol>
  </section>
</template>

<style scoped>
.static-fallback ol { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.75rem; padding:0; list-style:none; counter-reset:frame; }
.static-fallback li { padding:1rem; border:1px solid #cbded8; border-radius:.75rem; background:#f7fbfa; counter-increment:frame; }
.static-fallback li::before { content:counter(frame); display:inline-grid; place-items:center; width:1.5rem; height:1.5rem; margin-right:.4rem; border-radius:50%; color:white; background:#0f9f8f; }
dl { display:flex; flex-wrap:wrap; gap:.6rem; } dl div { min-width:5rem; } dt { color:#597069; } dd { margin:0; font-weight:800; }
@media (max-width:520px) { .static-fallback ol { grid-template-columns:1fr; } }
</style>
