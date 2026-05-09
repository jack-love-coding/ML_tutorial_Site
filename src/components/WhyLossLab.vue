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
  'update-config': [key: string, value: ExperimentConfigValue]
  'patch-config': [config: Partial<ExperimentConfig>]
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        lessonFocus: '误差如何变成目标',
        lossRule: '评分规则',
        target: '真实值',
        prediction: '预测值',
        residual: '误差',
        currentPenalty: '单样本损失',
        objective: '平均目标',
        sampleCards: '三条样本记录',
        flow: '从误差到目标',
        pipelineInput: '样本输入',
        mse: '平方误差',
        mae: '绝对误差',
        samplePrefix: '房价样本',
        objectiveNote:
          '误差本身还不是训练目标。只有当我们用损失规则给每个样本打分，并把这些分数合并起来之后，模型才知道自己要往哪里改。',
      }
    : {
        lessonFocus: 'How error becomes an objective',
        lossRule: 'Scoring rule',
        target: 'Target',
        prediction: 'Prediction',
        residual: 'Error',
        currentPenalty: 'Single-sample loss',
        objective: 'Average objective',
        sampleCards: 'Three sample records',
        flow: 'From error to objective',
        pipelineInput: 'Sample input',
        mse: 'Squared error',
        mae: 'Absolute error',
        samplePrefix: 'House sample',
        objectiveNote:
          'Error alone is not yet the training target. The model only knows what to improve after each sample is scored by a loss rule and those scores are merged into one objective.',
      },
)

const regressionLossKind = computed(() => String(props.config.regressionLossKind ?? 'mse'))
const targetValue = computed(() => Number(props.config.targetValue ?? 1.2))
const predictionValue = computed(() => Number(props.config.predictionValue ?? -0.35))
const residual = computed(() => Number(props.snapshot?.selectedObservation?.residual ?? 0))
const currentPenalty = computed(() =>
  Number(
    props.snapshot?.selectedObservation?.[
      regressionLossKind.value === 'mse' ? 'mse' : 'mae'
    ] ?? 0,
  ),
)
const sampleBreakdown = computed(() => props.snapshot?.sampleLossBreakdown ?? [])
const objectiveValue = computed(() => {
  if (!sampleBreakdown.value.length) return 0
  return sampleBreakdown.value.reduce((sum, sample) => sum + sample.loss, 0) / sampleBreakdown.value.length
})

const curveSpecs = computed(() => [
  {
    id: 'mse',
    label: copy.value.mse,
    color: '#ff7d4d',
    points: props.snapshot?.lossCurves?.mse ?? [],
  },
  {
    id: 'mae',
    label: copy.value.mae,
    color: '#3f6dff',
    points: props.snapshot?.lossCurves?.mae ?? [],
  },
])

const markerPoints = computed(() => [
  {
    id: 'mse-marker',
    x: predictionValue.value,
    y: Number(props.snapshot?.selectedObservation?.mse ?? 0),
    color: '#ff7d4d',
  },
  {
    id: 'mae-marker',
    x: predictionValue.value,
    y: Number(props.snapshot?.selectedObservation?.mae ?? 0),
    color: '#3f6dff',
  },
])

const flowCards = computed(() => [
  {
    id: 'error',
    label: copy.value.residual,
    value: round(residual.value),
  },
  {
    id: 'penalty',
    label: copy.value.currentPenalty,
    value: round(currentPenalty.value),
  },
  {
    id: 'objective',
    label: copy.value.objective,
    value: round(objectiveValue.value),
  },
])

function setLossKind(kind: 'mse' | 'mae') {
  emit('patch-config', {
    lossFamily: 'regression',
    regressionLossKind: kind,
  })
}

function onNumericInput(key: 'targetValue' | 'predictionValue', event: Event) {
  const target = event.target as HTMLInputElement
  emit('patch-config', {
    lossFamily: 'regression',
    [key]: Number(target.value),
  })
}

function localizedSampleLabel(label: string) {
  return `${copy.value.samplePrefix} ${label}`
}
</script>

<template>
  <section class="lesson-lab lesson-lab--overview">
    <div class="lesson-lab__controls">
      <div class="lesson-lab__heading">
        <span>{{ copy.lossRule }}</span>
        <strong>{{ regressionLossKind === 'mse' ? copy.mse : copy.mae }}</strong>
      </div>

      <div class="toggle-strip">
        <button
          type="button"
          class="toggle-strip__button"
          :class="{ 'is-active': regressionLossKind === 'mse' }"
          @click="setLossKind('mse')"
        >
          MSE
        </button>
        <button
          type="button"
          class="toggle-strip__button"
          :class="{ 'is-active': regressionLossKind === 'mae' }"
          @click="setLossKind('mae')"
        >
          MAE
        </button>
      </div>

      <div class="control-group__grid">
        <label class="control">
          <span class="control__row">
            <span>{{ copy.target }}</span>
            <strong>{{ round(targetValue) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="-2.5"
            max="2.5"
            step="0.05"
            :value="targetValue"
            @input="onNumericInput('targetValue', $event)"
          />
        </label>

        <label class="control">
          <span class="control__row">
            <span>{{ copy.prediction }}</span>
            <strong>{{ round(predictionValue) }}</strong>
          </span>
          <input
            class="control__range"
            type="range"
            min="-2.5"
            max="2.5"
            step="0.05"
            :value="predictionValue"
            @input="onNumericInput('predictionValue', $event)"
          />
        </label>
      </div>
    </div>

    <div class="lesson-lab__visual">
      <div class="lesson-lab__heading">
        <span>{{ copy.lessonFocus }}</span>
        <strong>{{ copy.flow }}</strong>
      </div>
      <div class="loss-pipeline-illustration" aria-label="error to objective pipeline">
        <div class="loss-pipeline-illustration__track" aria-hidden="true">
          <span />
        </div>
        <article class="loss-pipeline-illustration__node">
          <span>{{ copy.pipelineInput }}</span>
          <strong>{{ copy.target }} {{ round(targetValue) }} · {{ copy.prediction }} {{ round(predictionValue) }}</strong>
        </article>
        <article
          v-for="card in flowCards"
          :key="`pipeline-${card.id}`"
          class="loss-pipeline-illustration__node"
        >
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>
      </div>
      <LossCurvePlot
        :curves="curveSpecs"
        :marker-x="predictionValue"
        :marker-points="markerPoints"
      />
      <div class="teaching-flow">
        <article v-for="card in flowCards" :key="card.id" class="teaching-flow__card">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>
      </div>
    </div>

    <div class="lesson-lab__summary">
      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.sampleCards }}</span>
          <strong>{{ sampleBreakdown.length }}</strong>
        </div>
        <div class="sample-loss-grid">
          <article v-for="sample in sampleBreakdown" :key="sample.id" class="sample-loss-card">
            <span>{{ localizedSampleLabel(sample.label) }}</span>
            <strong>{{ round(sample.loss) }}</strong>
            <p>
              {{ copy.target }} {{ round(sample.target) }} · {{ copy.prediction }}
              {{ round(sample.prediction) }}
            </p>
          </article>
        </div>
      </section>

      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.flow }}</span>
          <strong>{{ round(objectiveValue) }}</strong>
        </div>
        <div class="observation-grid">
          <article class="observation-card">
            <span>{{ copy.residual }}</span>
            <strong>{{ round(residual) }}</strong>
          </article>
          <article class="observation-card">
            <span>{{ copy.currentPenalty }}</span>
            <strong>{{ round(currentPenalty) }}</strong>
          </article>
          <article class="observation-card">
            <span>{{ copy.objective }}</span>
            <strong>{{ round(objectiveValue) }}</strong>
          </article>
        </div>
        <p class="lesson-lab__note">{{ copy.objectiveNote }}</p>
      </section>
    </div>
  </section>
</template>
