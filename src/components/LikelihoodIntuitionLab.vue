<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ExperimentConfig, ExperimentConfigValue, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'
import LossCurvePlot from './LossCurvePlot.vue'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
}>()

const emit = defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'update-config': [key: string, value: ExperimentConfigValue]
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        observation: '观测数据',
        hypothesis: '候选参数',
        heads: '正面次数',
        tosses: '抛硬币次数',
        probability: '当前假设 p',
        likelihood: '似然曲线',
        ranking: '候选排名',
        note: '似然越大，只表示这个参数更能解释当前数据，不代表它已经被证明绝对正确。',
        success: '正面',
        failure: '反面',
      }
    : {
        observation: 'Observed data',
        hypothesis: 'Parameter hypothesis',
        heads: 'Heads',
        tosses: 'Tosses',
        probability: 'Current hypothesis p',
        likelihood: 'Likelihood curve',
        ranking: 'Candidate ranking',
        note: 'A larger likelihood only means this parameter explains the current data better. It does not prove the parameter is absolutely correct.',
        success: 'Head',
        failure: 'Tail',
      },
)

const trialCount = computed(() => Number(props.snapshot?.selectedObservation?.trialCount ?? props.config.trialCount ?? 10))
const observedSuccesses = computed(() =>
  Number(props.snapshot?.selectedObservation?.observedSuccesses ?? props.config.observedSuccesses ?? 8),
)
const candidateProbability = computed(() =>
  Number(props.snapshot?.selectedObservation?.candidateProbability ?? props.config.candidateProbability ?? 0.8),
)

const curveSpecs = computed(() => [
  {
    id: 'coin-likelihood',
    label: copy.value.likelihood,
    color: '#1ea67a',
    points: props.snapshot?.lossCurves?.coinLikelihood ?? [],
  },
])

const markerPoints = computed(() => [
  {
    id: 'candidate',
    x: candidateProbability.value,
    y: Number(props.snapshot?.selectedObservation?.coinLikelihood ?? 0),
    color: '#1ea67a',
  },
])

const tossItems = computed(() =>
  Array.from({ length: trialCount.value }, (_, index) => ({
    id: `trial-${index}`,
    isSuccess: index < observedSuccesses.value,
  })),
)

const rankedCandidates = computed(() =>
  [...(props.snapshot?.likelihoodCandidates ?? [])].sort((left, right) => right.likelihood - left.likelihood),
)

function onNumericInput(key: 'trialCount' | 'observedSuccesses' | 'candidateProbability', event: Event) {
  const target = event.target as HTMLInputElement
  emit('patch-config', {
    lossFamily: 'mle',
    [key]: Number(target.value),
  })
}

function applyCandidate(probability: number) {
  emit('patch-config', {
    lossFamily: 'mle',
    candidateProbability: probability,
  })
}

function formatLikelihood(value: number) {
  if (value >= 0.001) return round(value)
  return value.toExponential(2)
}
</script>

<template>
  <section class="lesson-lab lesson-lab--likelihood">
    <div class="lesson-lab__controls">
      <div class="lesson-lab__heading">
        <span>{{ copy.observation }}</span>
        <strong>{{ observedSuccesses }} / {{ trialCount }}</strong>
      </div>

      <div class="toggle-strip">
        <button
          type="button"
          class="toggle-strip__button"
          :class="{ 'is-active': Math.abs(candidateProbability - 0.2) < 0.005 }"
          @click="applyCandidate(0.2)"
        >
          p = 0.20
        </button>
        <button
          type="button"
          class="toggle-strip__button"
          :class="{ 'is-active': Math.abs(candidateProbability - 0.5) < 0.005 }"
          @click="applyCandidate(0.5)"
        >
          p = 0.50
        </button>
        <button
          type="button"
          class="toggle-strip__button"
          :class="{ 'is-active': Math.abs(candidateProbability - 0.8) < 0.005 }"
          @click="applyCandidate(0.8)"
        >
          p = 0.80
        </button>
      </div>

      <div class="control-group__grid">
        <label class="control">
          <span class="control__row">
            <span>{{ copy.tosses }}</span>
            <strong>{{ trialCount }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="4"
            max="20"
            step="1"
            :value="trialCount"
            @input="onNumericInput('trialCount', $event)"
          />
        </label>

        <label class="control">
          <span class="control__row">
            <span>{{ copy.heads }}</span>
            <strong>{{ observedSuccesses }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="0"
            :max="trialCount"
            step="1"
            :value="observedSuccesses"
            @input="onNumericInput('observedSuccesses', $event)"
          />
        </label>

        <label class="control">
          <span class="control__row">
            <span>{{ copy.probability }}</span>
            <strong>{{ round(candidateProbability, 2) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="0.01"
            max="0.99"
            step="0.01"
            :value="candidateProbability"
            @input="onNumericInput('candidateProbability', $event)"
          />
        </label>
      </div>
    </div>

    <div class="lesson-lab__visual">
      <LossCurvePlot
        :curves="curveSpecs"
        :marker-x="candidateProbability"
        :marker-points="markerPoints"
      />
    </div>

    <div class="lesson-lab__summary">
      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.observation }}</span>
          <strong>{{ copy.hypothesis }}</strong>
        </div>
        <div class="toss-grid">
          <article
            v-for="item in tossItems"
            :key="item.id"
            class="toss-grid__item"
            :class="{ 'is-success': item.isSuccess }"
          >
            {{ item.isSuccess ? copy.success : copy.failure }}
          </article>
        </div>
        <div class="observation-grid">
          <article class="observation-card">
            <span>{{ copy.tosses }}</span>
            <strong>{{ trialCount }}</strong>
          </article>
          <article class="observation-card">
            <span>{{ copy.heads }}</span>
            <strong>{{ observedSuccesses }}</strong>
          </article>
          <article class="observation-card">
            <span>{{ copy.probability }}</span>
            <strong>{{ round(candidateProbability, 2) }}</strong>
          </article>
        </div>
      </section>

      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.ranking }}</span>
          <strong>{{ rankedCandidates[0]?.label }}</strong>
        </div>
        <div class="candidate-rank">
          <article
            v-for="candidate in rankedCandidates"
            :key="candidate.label"
            class="candidate-rank__item"
            :class="{ 'is-featured': Math.abs(candidate.parameter - candidateProbability) < 1e-6 }"
          >
            <span>{{ candidate.label }}</span>
            <strong>{{ formatLikelihood(candidate.likelihood) }}</strong>
            <small>NLL {{ round(candidate.nll) }}</small>
          </article>
        </div>
        <p class="lesson-lab__note">{{ copy.note }}</p>
      </section>
    </div>
  </section>
</template>
