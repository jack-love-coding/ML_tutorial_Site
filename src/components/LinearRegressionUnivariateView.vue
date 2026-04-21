<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { PlotPoint, TrainingSnapshot } from '../types/ml'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  sectionId: string
}>()

const { locale } = useI18n()

const dataWidth = 660
const dataHeight = 360
const dataPadding = 46
const stateWidth = 360
const stateHeight = 220
const statePadding = 28

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        dataSpace: '数据空间',
        stateSpace: '训练状态',
        area: '面积',
        price: '房价',
        lossCurve: '损失曲线',
        parameterPath: '斜率 / 截距轨迹',
        train: '训练',
        validation: '验证',
        curve: '拟合曲线',
      }
    : {
        dataSpace: 'Data space',
        stateSpace: 'Training state',
        area: 'Area',
        price: 'Price',
        lossCurve: 'Loss curve',
        parameterPath: 'Slope / intercept path',
        train: 'Train',
        validation: 'Validation',
        curve: 'Fit curve',
      },
)

const samples = computed(() => props.snapshot?.regressionSamples ?? [])
const fit = computed(() => props.snapshot?.regressionFit)
const fitCurve = computed(() => props.snapshot?.fitCurve ?? [])
const highlightIndex = computed(() => Number(props.snapshot?.derivedMetrics?.highlightIndex ?? 0))
const showValidation = computed(() =>
  props.sectionId === 'overfitting' || props.sectionId === 'regularization',
)
const chartMode = computed(() =>
  props.sectionId === 'training-motion' && fit.value ? 'parameters' : 'loss',
)

const domain = computed(() => {
  const visiblePoints = [
    ...samples.value,
    ...fitCurve.value,
    ...(fit.value
      ? samples.value.map((sample) => ({
          x: sample.x,
          y: fit.value!.slope * sample.x + fit.value!.intercept,
        }))
      : []),
  ]
  const xValues = visiblePoints.map((sample) => sample.x)
  const yValues = visiblePoints.map((sample) => sample.y)

  return {
    xMin: Math.min(...xValues, 40) - 8,
    xMax: Math.max(...xValues, 190) + 8,
    yMin: Math.min(...yValues, 80) - 18,
    yMax: Math.max(...yValues, 340) + 18,
  }
})

const fitLine = computed(() => {
  if (!fit.value) return []
  return [
    {
      x: domain.value.xMin,
      y: fit.value.slope * domain.value.xMin + fit.value.intercept,
    },
    {
      x: domain.value.xMax,
      y: fit.value.slope * domain.value.xMax + fit.value.intercept,
    },
  ]
})

const visibleFitPoints = computed(() => (fitCurve.value.length ? fitCurve.value : fitLine.value))

const residualSegments = computed(() =>
  samples.value.map((sample, index) => {
    const prediction = predict(sample.x)
    return {
      id: `${sample.x}-${index}`,
      index,
      x: sample.x,
      actual: sample.y,
      prediction,
      split: sample.split ?? 'train',
    }
  }),
)

const lossValues = computed(() => props.snapshots.map((snapshot) => snapshot.loss))
const trainLossValues = computed(() =>
  props.snapshots.map((snapshot) => Number(snapshot.derivedMetrics?.trainMse ?? snapshot.loss)),
)
const validationLossValues = computed(() =>
  props.snapshots.map((snapshot) =>
    Number(snapshot.derivedMetrics?.validationMse ?? snapshot.derivedMetrics?.trainMse ?? snapshot.loss),
  ),
)
const lossPath = computed(() => buildStatePolyline(lossValues.value))
const trainPath = computed(() => buildStatePolyline(trainLossValues.value))
const validationPath = computed(() => buildStatePolyline(validationLossValues.value))
const lossDot = computed(() => pointOnStateLine(lossValues.value, props.currentStep))

const parameterPoints = computed(() =>
  props.snapshots.map((snapshot) => ({
    x: Number(snapshot.regressionFit?.slope ?? 0),
    y: Number(snapshot.regressionFit?.intercept ?? 0),
  })),
)

const parameterPath = computed(() => {
  if (!parameterPoints.value.length) return ''
  const xs = parameterPoints.value.map((point) => point.x)
  const ys = parameterPoints.value.map((point) => point.y)

  return parameterPoints.value
    .map((point) => {
      const x = scaleState(point.x, Math.min(...xs), Math.max(...xs))
      const y =
        stateHeight -
        statePadding -
        scaleState(point.y, Math.min(...ys), Math.max(...ys), stateHeight - statePadding * 2)
      return `${x},${y}`
    })
    .join(' ')
})

const parameterDot = computed(() => {
  if (!parameterPoints.value.length) return { x: statePadding, y: stateHeight - statePadding }
  const xs = parameterPoints.value.map((point) => point.x)
  const ys = parameterPoints.value.map((point) => point.y)
  const point = parameterPoints.value[Math.min(props.currentStep, parameterPoints.value.length - 1)]!
  return {
    x: scaleState(point.x, Math.min(...xs), Math.max(...xs)),
    y:
      stateHeight -
      statePadding -
      scaleState(point.y, Math.min(...ys), Math.max(...ys), stateHeight - statePadding * 2),
  }
})

function predict(area: number) {
  if (fitCurve.value.length) {
    const nearest = fitCurve.value.reduce((best, point) =>
      Math.abs(point.x - area) < Math.abs(best.x - area) ? point : best,
    )
    return nearest.y
  }
  if (fit.value) return fit.value.slope * area + fit.value.intercept
  return 0
}

function mapDataX(value: number) {
  return (
    dataPadding +
    ((value - domain.value.xMin) / (domain.value.xMax - domain.value.xMin || 1)) *
      (dataWidth - dataPadding * 2)
  )
}

function mapDataY(value: number) {
  return (
    dataHeight -
    dataPadding -
    ((value - domain.value.yMin) / (domain.value.yMax - domain.value.yMin || 1)) *
      (dataHeight - dataPadding * 2)
  )
}

function pointsToPolyline(points: PlotPoint[]) {
  return points.map((point) => `${mapDataX(point.x)},${mapDataY(point.y)}`).join(' ')
}

function scaleState(value: number, min: number, max: number, size = stateWidth - statePadding * 2) {
  return statePadding + ((value - min) / (max - min || 1)) * size
}

function buildStatePolyline(values: number[]) {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  return values
    .map((value, index) => {
      const x = statePadding + (index / Math.max(values.length - 1, 1)) * (stateWidth - statePadding * 2)
      const y = stateHeight - statePadding - ((value - min) / (max - min || 1)) * (stateHeight - statePadding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

function pointOnStateLine(values: number[], index: number) {
  if (!values.length) return { x: statePadding, y: stateHeight - statePadding }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const safeIndex = Math.min(index, values.length - 1)
  const value = values[safeIndex] ?? values[0]!
  return {
    x: statePadding + (safeIndex / Math.max(values.length - 1, 1)) * (stateWidth - statePadding * 2),
    y: stateHeight - statePadding - ((value - min) / (max - min || 1)) * (stateHeight - statePadding * 2),
  }
}
</script>

<template>
  <div class="linear-regression-lab__viz">
    <section class="linear-regression-lab__panel linear-regression-lab__panel--data">
      <div class="linear-regression-lab__heading">
        <span>{{ copy.dataSpace }}</span>
        <strong>{{ copy.area }} -> {{ copy.price }}</strong>
      </div>
      <svg
        :viewBox="`0 0 ${dataWidth} ${dataHeight}`"
        class="linear-regression-lab__data-svg"
        role="img"
        aria-label="linear regression data space"
      >
        <line
          :x1="dataPadding"
          :x2="dataWidth - dataPadding"
          :y1="dataHeight - dataPadding"
          :y2="dataHeight - dataPadding"
          class="linear-axis"
        />
        <line
          :x1="dataPadding"
          :x2="dataPadding"
          :y1="dataPadding"
          :y2="dataHeight - dataPadding"
          class="linear-axis"
        />
        <text :x="dataWidth - 118" :y="dataHeight - 16" class="linear-axis-label">
          {{ copy.area }} (m2)
        </text>
        <text :x="12" :y="32" class="linear-axis-label">{{ copy.price }} (w)</text>
        <line
          v-for="segment in residualSegments"
          :key="segment.id"
          :x1="mapDataX(segment.x)"
          :x2="mapDataX(segment.x)"
          :y1="mapDataY(segment.actual)"
          :y2="mapDataY(segment.prediction)"
          class="linear-residual"
          :class="{ 'is-emphasis': segment.index === highlightIndex || props.sectionId === 'residual-loss' }"
        />
        <polyline :points="pointsToPolyline(visibleFitPoints)" class="linear-fit-line" />
        <circle
          v-for="(sample, index) in samples"
          :key="`${sample.x}-${sample.y}-${index}`"
          :cx="mapDataX(sample.x)"
          :cy="mapDataY(sample.y)"
          :r="index === highlightIndex ? 7 : 5.6"
          class="linear-sample"
          :class="{
            'is-highlight': index === highlightIndex,
            'is-validation': showValidation && sample.split === 'validation',
          }"
        />
      </svg>
    </section>

    <section class="linear-regression-lab__panel linear-regression-lab__panel--state">
      <div class="linear-regression-lab__heading">
        <span>{{ copy.stateSpace }}</span>
        <strong>{{ chartMode === 'parameters' ? copy.parameterPath : copy.lossCurve }}</strong>
      </div>
      <svg
        :viewBox="`0 0 ${stateWidth} ${stateHeight}`"
        class="linear-regression-lab__state-svg"
        role="img"
        aria-label="linear regression training state"
      >
        <line
          :x1="statePadding"
          :x2="stateWidth - statePadding"
          :y1="stateHeight - statePadding"
          :y2="stateHeight - statePadding"
          class="linear-axis"
        />
        <line
          :x1="statePadding"
          :x2="statePadding"
          :y1="statePadding"
          :y2="stateHeight - statePadding"
          class="linear-axis"
        />
        <template v-if="chartMode === 'parameters'">
          <polyline :points="parameterPath" class="linear-state-line linear-state-line--parameter" />
          <circle :cx="parameterDot.x" :cy="parameterDot.y" r="6" class="linear-state-dot" />
        </template>
        <template v-else-if="showValidation">
          <polyline :points="trainPath" class="linear-state-line" />
          <polyline :points="validationPath" class="linear-state-line linear-state-line--validation" />
        </template>
        <template v-else>
          <polyline :points="lossPath" class="linear-state-line" />
          <circle :cx="lossDot.x" :cy="lossDot.y" r="6" class="linear-state-dot" />
        </template>
      </svg>
      <div v-if="showValidation" class="linear-state-legend">
        <span><i class="legend-dot legend-dot--train"></i>{{ copy.train }}</span>
        <span><i class="legend-dot legend-dot--validation"></i>{{ copy.validation }}</span>
      </div>
    </section>
  </div>
</template>
