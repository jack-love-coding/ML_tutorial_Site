<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ExperimentConfig, ExperimentConfigValue, PlotPoint, TrainingSnapshot } from '../types/ml'
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
const size = 320
const padding = 28

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        singleSample: '单样本手算',
        regressionFit: '回归拟合',
        outlier: '离群点实验',
        outlierStrength: '离群点强度',
        datasetNoise: '样本噪声',
        target: '真实值',
        prediction: '预测值',
        residual: '残差',
        totalLoss: '数据集总损失',
        workedExample: '同一残差的两种惩罚',
        penaltyAmplifier: '残差放大器',
        rawResidual: '原始残差强度',
        activeFit: '当前拟合',
        mse: '平方误差',
        mae: '绝对误差',
        on: '开启',
        off: '关闭',
        sensitivity: '离群点一出现，MSE 会更愿意为了少数大误差而移动整条拟合线；MAE 则通常更稳健。',
      }
    : {
        singleSample: 'Single-sample calculation',
        regressionFit: 'Regression fit',
        outlier: 'Outlier experiment',
        outlierStrength: 'Outlier strength',
        datasetNoise: 'Sample noise',
        target: 'Target',
        prediction: 'Prediction',
        residual: 'Residual',
        totalLoss: 'Dataset loss',
        workedExample: 'Two penalties for the same residual',
        penaltyAmplifier: 'Residual amplifier',
        rawResidual: 'Raw residual strength',
        activeFit: 'Current fit',
        mse: 'Squared error',
        mae: 'Absolute error',
        on: 'On',
        off: 'Off',
        sensitivity:
          'Once the outlier appears, MSE is more willing to move the whole fit line for a few large mistakes, while MAE usually stays more robust.',
      },
)

const regressionLossKind = computed(() => String(props.config.regressionLossKind ?? 'mse'))
const targetValue = computed(() => Number(props.config.targetValue ?? 1.2))
const predictionValue = computed(() => Number(props.config.predictionValue ?? -0.35))
const residual = computed(() => Number(props.snapshot?.selectedObservation?.residual ?? 0))
const samples = computed(() => props.snapshot?.regressionSamples ?? [])
const fit = computed(() => props.snapshot?.regressionFit ?? { slope: 0.65, intercept: 0.4 })
const includeOutlier = computed(() => Boolean(props.config.includeOutlier ?? true))

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

const fitLine = computed(() => {
  const x1 = -2.5
  const x2 = 2.8
  return [
    { x: x1, y: fit.value.slope * x1 + fit.value.intercept },
    { x: x2, y: fit.value.slope * x2 + fit.value.intercept },
  ]
})

const workedExampleCards = computed(() => [
  {
    id: 'residual',
    label: copy.value.residual,
    value: round(residual.value),
  },
  {
    id: 'mse',
    label: copy.value.mse,
    value: round(Number(props.snapshot?.selectedObservation?.mse ?? 0)),
  },
  {
    id: 'mae',
    label: copy.value.mae,
    value: round(Number(props.snapshot?.selectedObservation?.mae ?? 0)),
  },
])

const amplifierBars = computed(() => {
  const residualMagnitude = Math.abs(residual.value)
  const mseValue = Number(props.snapshot?.selectedObservation?.mse ?? 0)
  const maeValue = Number(props.snapshot?.selectedObservation?.mae ?? 0)
  const maxValue = Math.max(residualMagnitude, mseValue, maeValue, 0.001)

  return [
    {
      id: 'raw',
      label: copy.value.rawResidual,
      value: residualMagnitude,
      width: `${Math.max(4, (residualMagnitude / maxValue) * 100)}%`,
    },
    {
      id: 'mae',
      label: copy.value.mae,
      value: maeValue,
      width: `${Math.max(4, (maeValue / maxValue) * 100)}%`,
    },
    {
      id: 'mse',
      label: copy.value.mse,
      value: mseValue,
      width: `${Math.max(4, (mseValue / maxValue) * 100)}%`,
    },
  ]
})

function mapX(value: number) {
  return padding + ((value + 2.8) / 5.6) * (size - padding * 2)
}

function mapY(value: number) {
  return size - padding - ((value + 2.2) / 5.8) * (size - padding * 2)
}

function setLossKind(kind: 'mse' | 'mae') {
  emit('patch-config', {
    lossFamily: 'regression',
    regressionLossKind: kind,
  })
}

function onNumericInput(
  key: 'targetValue' | 'predictionValue' | 'outlierStrength' | 'datasetNoise',
  event: Event,
) {
  const target = event.target as HTMLInputElement
  emit('patch-config', {
    lossFamily: 'regression',
    [key]: Number(target.value),
  })
}

function onOutlierToggle() {
  emit('patch-config', {
    lossFamily: 'regression',
    includeOutlier: !includeOutlier.value,
  })
}

function polyline(points: PlotPoint[]) {
  return points.map((point) => `${mapX(point.x)},${mapY(point.y)}`).join(' ')
}
</script>

<template>
  <section class="lesson-lab lesson-lab--regression">
    <div class="lesson-lab__controls">
      <div class="lesson-lab__heading">
        <span>{{ copy.singleSample }}</span>
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
        <span>{{ copy.workedExample }}</span>
        <strong>{{ copy.penaltyAmplifier }}</strong>
      </div>
      <div class="residual-amplifier" aria-label="residual penalty amplifier">
        <article
          v-for="bar in amplifierBars"
          :key="bar.id"
          class="residual-amplifier__item"
          :class="`residual-amplifier__item--${bar.id}`"
        >
          <span>{{ bar.label }}</span>
          <div class="residual-amplifier__track">
            <div class="residual-amplifier__fill" :style="{ width: bar.width }" />
          </div>
          <strong>{{ round(bar.value) }}</strong>
        </article>
      </div>
      <LossCurvePlot
        :curves="curveSpecs"
        :marker-x="predictionValue"
        :marker-points="markerPoints"
      />
      <div class="teaching-flow">
        <article v-for="card in workedExampleCards" :key="card.id" class="teaching-flow__card">
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>
      </div>
    </div>

    <div class="lesson-lab__summary">
      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.regressionFit }}</span>
          <strong>{{ copy.activeFit }}</strong>
        </div>

        <svg :viewBox="`0 0 ${size} ${size}`" class="regression-fit-viz" role="img" aria-label="regression fit">
          <line :x1="padding" :x2="size - padding" :y1="size - padding" :y2="size - padding" class="chart-axis" />
          <line :x1="padding" :x2="padding" :y1="padding" :y2="size - padding" class="chart-axis" />
          <polyline :points="polyline(fitLine)" class="regression-fit-viz__line" />
          <circle
            v-for="(sample, index) in samples"
            :key="`${sample.x}-${sample.y}-${index}`"
            :cx="mapX(sample.x)"
            :cy="mapY(sample.y)"
            r="5.5"
            class="regression-fit-viz__dot"
            :class="{ 'is-outlier': includeOutlier && index === samples.length - 1 }"
          />
        </svg>
      </section>

      <section class="lesson-lab__panel">
        <div class="lesson-lab__heading">
          <span>{{ copy.outlier }}</span>
          <strong>{{ includeOutlier ? copy.on : copy.off }}</strong>
        </div>

        <div class="control-group__grid">
          <label class="control control--toggle">
            <span class="control__row">
              <span>{{ copy.outlier }}</span>
            </span>
            <button type="button" class="toggle-strip__button is-active" @click="onOutlierToggle">
              {{ includeOutlier ? copy.on : copy.off }}
            </button>
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ copy.outlierStrength }}</span>
              <strong>{{ round(Number(props.config.outlierStrength ?? 2.2)) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0.8"
              max="3.4"
              step="0.05"
              :value="Number(props.config.outlierStrength ?? 2.2)"
              @input="onNumericInput('outlierStrength', $event)"
            />
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ copy.datasetNoise }}</span>
              <strong>{{ round(Number(props.config.datasetNoise ?? 0.12)) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0"
              max="0.35"
              step="0.01"
              :value="Number(props.config.datasetNoise ?? 0.12)"
              @input="onNumericInput('datasetNoise', $event)"
            />
          </label>
        </div>

        <div class="observation-grid">
          <article class="observation-card">
            <span>{{ copy.totalLoss }}</span>
            <strong>{{ round(Number(props.snapshot?.selectedObservation?.totalRegressionLoss ?? 0)) }}</strong>
          </article>
          <article class="observation-card">
            <span>{{ copy.workedExample }}</span>
            <strong>{{ round(Number(props.snapshot?.selectedObservation?.mse ?? 0)) }} / {{ round(Number(props.snapshot?.selectedObservation?.mae ?? 0)) }}</strong>
          </article>
        </div>
        <p class="lesson-lab__note">{{ copy.sensitivity }}</p>
      </section>
    </div>
  </section>
</template>
