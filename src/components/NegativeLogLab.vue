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
        tosses: '抛硬币次数',
        heads: '正面次数',
        probability: '候选概率 p',
        jointLikelihood: '联合似然',
        logLikelihood: '对数似然',
        nll: '负对数似然',
        termList: '每个样本项',
        translation: '概率到损失的翻译',
        note: '样本越多，联合似然通常会因为连乘而越来越小；取对数之后，比较会稳定得多。',
        success: '正面',
        failure: '反面',
      }
    : {
        observation: 'Observed data',
        tosses: 'Tosses',
        heads: 'Heads',
        probability: 'Candidate probability p',
        jointLikelihood: 'Joint likelihood',
        logLikelihood: 'Log-likelihood',
        nll: 'Negative log-likelihood',
        termList: 'Per-sample terms',
        translation: 'From probability to loss',
        note: 'As the number of samples grows, joint likelihood usually shrinks quickly because it is a product. After taking logs, the comparison becomes much more stable.',
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

const likelihoodCurve = computed(() => [
  {
    id: 'coin-likelihood',
    label: copy.value.jointLikelihood,
    color: '#1ea67a',
    points: props.snapshot?.lossCurves?.coinLikelihood ?? [],
  },
])

const nllCurve = computed(() => [
  {
    id: 'coin-nll',
    label: copy.value.nll,
    color: '#3f6dff',
    points: props.snapshot?.lossCurves?.coinNll ?? [],
  },
])

const likelihoodMarker = computed(() => [
  {
    id: 'likelihood-marker',
    x: candidateProbability.value,
    y: Number(props.snapshot?.selectedObservation?.coinLikelihood ?? 0),
    color: '#1ea67a',
  },
])

const nllMarker = computed(() => [
  {
    id: 'nll-marker',
    x: candidateProbability.value,
    y: Number(props.snapshot?.selectedObservation?.coinNll ?? 0),
    color: '#3f6dff',
  },
])

const termItems = computed(() =>
  (props.snapshot?.perSampleLikelihoods ?? []).map((value, index) => ({
    id: `term-${index}`,
    isSuccess: index < observedSuccesses.value,
    value,
  })),
)

const translationCards = computed(() => [
  {
    id: 'joint',
    label: copy.value.jointLikelihood,
    value: formatSmallNumber(Number(props.snapshot?.jointLikelihood ?? 0)),
  },
  {
    id: 'log',
    label: copy.value.logLikelihood,
    value: round(Number(props.snapshot?.jointLogLikelihood ?? 0)),
  },
  {
    id: 'nll',
    label: copy.value.nll,
    value: round(Number(props.snapshot?.selectedObservation?.coinNll ?? 0)),
  },
])

function onNumericInput(key: 'trialCount' | 'observedSuccesses' | 'candidateProbability', event: Event) {
  const target = event.target as HTMLInputElement
  emit('patch-config', {
    lossFamily: 'mle',
    [key]: Number(target.value),
  })
}

function formatSmallNumber(value: number) {
  if (value >= 0.001) return round(value)
  return value.toExponential(2)
}
</script>

<template>
  <section class="lesson-lab lesson-lab--negative-log">
    <div class="lesson-lab__controls">
      <div class="lesson-lab__heading">
        <span>{{ copy.observation }}</span>
        <strong>{{ observedSuccesses }} / {{ trialCount }}</strong>
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

    <div class="lesson-lab__visual lesson-lab__visual--stacked">
      <LossCurvePlot
        :curves="likelihoodCurve"
        :marker-x="candidateProbability"
        :marker-points="likelihoodMarker"
      />
      <LossCurvePlot
        :curves="nllCurve"
        :marker-x="candidateProbability"
        :marker-points="nllMarker"
      />
    </div>

    <div class="lesson-lab__summary">
      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.termList }}</span>
          <strong>{{ termItems.length }}</strong>
        </div>
        <div class="toss-grid">
          <article
            v-for="item in termItems"
            :key="item.id"
            class="toss-grid__item toss-grid__item--term"
            :class="{ 'is-success': item.isSuccess }"
          >
            <span>{{ item.isSuccess ? copy.success : copy.failure }}</span>
            <strong>{{ round(item.value, 2) }}</strong>
          </article>
        </div>
      </section>

      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.translation }}</span>
          <strong>{{ round(Number(props.snapshot?.selectedObservation?.coinNll ?? 0)) }}</strong>
        </div>
        <div class="process-chain">
          <article v-for="card in translationCards" :key="card.id" class="process-chain__step">
            <span>{{ card.label }}</span>
            <strong>{{ card.value }}</strong>
          </article>
        </div>
        <p class="lesson-lab__note">{{ copy.note }}</p>
      </section>
    </div>
  </section>
</template>
