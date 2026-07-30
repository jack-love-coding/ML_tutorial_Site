<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MultivariateRegressionSample, TrainingSnapshot } from '../types/ml'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  accent: string
}>()

const { locale } = useI18n()

const featureWidth = 660
const featureHeight = 360
const featurePadding = 54
const stateWidth = 420
const stateHeight = 240
const statePadding = 34

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: 'Bike 多特征测试切片',
        mapping: '温度 + 湿度 → 租赁数量',
        temp: '标准化温度（temp）',
        humidity: '湿度（hum）',
        count: '真实租赁量（cnt）',
        prediction: '预测租赁量',
        residual: '残差（预测值 − 真实值）',
        featureMap: '二维特征投影',
        positive: '正残差：三角形 △',
        negative: '负残差：方形 □',
        selected: '当前行：加粗轮廓',
        staticNote: '这是确定性静态 SVG；不依赖 WebGL，数据表是等价的无动画 fallback。',
        state: '优化状态',
        loss: 'MSE：实线',
        mae: 'MAE：虚线',
        row: '行',
        cue: '形状 / 线型',
      }
    : {
        title: 'Bike multifeature test slice',
        mapping: 'temperature + humidity → rental count',
        temp: 'Normalized temperature (temp)',
        humidity: 'Humidity (hum)',
        count: 'Actual rentals (cnt)',
        prediction: 'Predicted rentals',
        residual: 'Residual (prediction − actual)',
        featureMap: 'Two-dimensional feature projection',
        positive: 'Positive residual: triangle △',
        negative: 'Negative residual: square □',
        selected: 'Current row: heavy outline',
        staticNote: 'This deterministic static SVG needs no WebGL; the data table is an equivalent motion-free fallback.',
        state: 'Optimization state',
        loss: 'MSE: solid line',
        mae: 'MAE: dashed line',
        row: 'Row',
        cue: 'Shape / line pattern',
      },
)

const currentSnapshot = computed(
  () =>
    props.snapshot
    ?? props.snapshots[Math.min(Math.max(props.currentStep, 0), Math.max(props.snapshots.length - 1, 0))],
)
const samples = computed(() => currentSnapshot.value?.multivariateSamples ?? [])
const residuals = computed(() => currentSnapshot.value?.multivariateResiduals ?? [])

const displayRows = computed(() =>
  samples.value.map((sample, index) => ({
    id: `${index}-${sample.area}-${sample.age}`,
    sample,
    prediction: residuals.value[index]?.predictedPrice,
    residual: residuals.value[index]?.residual,
    cue: (residuals.value[index]?.residual ?? 0) >= 0 ? 'triangle' : 'square',
  })),
)

const featureDomain = computed(() => {
  if (!samples.value.length) return { xMin: 0, xMax: 1, yMin: 0, yMax: 1 }
  const xs = samples.value.map((sample) => sample.area)
  const ys = samples.value.map((sample) => sample.age)
  const xMin = Math.min(...xs)
  const xMax = Math.max(...xs)
  const yMin = Math.min(...ys)
  const yMax = Math.max(...ys)
  const xGap = Math.max((xMax - xMin) * 0.12, 0.02)
  const yGap = Math.max((yMax - yMin) * 0.12, 0.02)
  return { xMin: xMin - xGap, xMax: xMax + xGap, yMin: yMin - yGap, yMax: yMax + yGap }
})

const lossValues = computed(() => props.snapshots.map((snapshot) => snapshot.loss))
const maeValues = computed(() =>
  props.snapshots.map((snapshot) => {
    const value = snapshot.derivedMetrics?.mae
    return typeof value === 'number' && Number.isFinite(value) ? value : 0
  }),
)
const lossPath = computed(() => statePolyline(lossValues.value))
const maePath = computed(() => statePolyline(maeValues.value))
const activeStatePoint = computed(() =>
  pointOnStateLine(lossValues.value, Math.min(props.currentStep, Math.max(props.snapshots.length - 1, 0))),
)

function mapFeatureX(value: number): number {
  return (
    featurePadding
    + ((value - featureDomain.value.xMin) / (featureDomain.value.xMax - featureDomain.value.xMin || 1))
      * (featureWidth - featurePadding * 2)
  )
}

function mapFeatureY(value: number): number {
  return (
    featureHeight
    - featurePadding
    - ((value - featureDomain.value.yMin) / (featureDomain.value.yMax - featureDomain.value.yMin || 1))
      * (featureHeight - featurePadding * 2)
  )
}

function trianglePoints(sample: MultivariateRegressionSample): string {
  const x = mapFeatureX(sample.area)
  const y = mapFeatureY(sample.age)
  return `${x},${y - 8} ${x - 8},${y + 7} ${x + 8},${y + 7}`
}

function statePolyline(values: number[]): string {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  return values
    .map((value, index) => {
      const x =
        statePadding
        + (index / Math.max(values.length - 1, 1)) * (stateWidth - statePadding * 2)
      const y =
        stateHeight
        - statePadding
        - ((value - min) / (max - min || 1)) * (stateHeight - statePadding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

function pointOnStateLine(values: number[], index: number): { x: number; y: number } {
  if (!values.length) return { x: statePadding, y: stateHeight - statePadding }
  const safeIndex = Math.min(Math.max(index, 0), values.length - 1)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const value = values[safeIndex] ?? values[0]!
  return {
    x:
      statePadding
      + (safeIndex / Math.max(values.length - 1, 1)) * (stateWidth - statePadding * 2),
    y:
      stateHeight
      - statePadding
      - ((value - min) / (max - min || 1)) * (stateHeight - statePadding * 2),
  }
}

function formatNumber(value: unknown): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return '—'
  return value.toLocaleString(locale.value, { maximumFractionDigits: 3 })
}
</script>

<template>
  <div
    class="linear-regression-lab__viz linear-regression-lab__viz--multivariate"
    :style="{ '--linear-accent': props.accent }"
  >
    <section class="linear-regression-lab__panel linear-regression-lab__panel--data">
      <div class="linear-regression-lab__heading">
        <span>{{ copy.title }}</span>
        <strong>{{ copy.mapping }}</strong>
      </div>
      <svg
        :viewBox="`0 0 ${featureWidth} ${featureHeight}`"
        class="linear-regression-lab__data-svg"
        role="img"
        :aria-label="`${copy.featureMap}; ${copy.positive}; ${copy.negative}; ${copy.selected}`"
      >
        <line
          :x1="featurePadding"
          :x2="featureWidth - featurePadding"
          :y1="featureHeight - featurePadding"
          :y2="featureHeight - featurePadding"
          class="linear-axis"
        />
        <line
          :x1="featurePadding"
          :x2="featurePadding"
          :y1="featurePadding"
          :y2="featureHeight - featurePadding"
          class="linear-axis"
        />
        <text :x="featureWidth - 12" :y="featureHeight - 14" class="linear-axis-label" text-anchor="end">
          {{ copy.temp }}
        </text>
        <text x="12" y="28" class="linear-axis-label">{{ copy.humidity }}</text>
        <template v-for="(row, index) in displayRows" :key="row.id">
          <polygon
            v-if="row.cue === 'triangle'"
            :points="trianglePoints(row.sample)"
            class="linear-sample"
            :class="{ 'is-highlight': index === props.currentStep % Math.max(displayRows.length, 1) }"
            :stroke-width="index === props.currentStep % Math.max(displayRows.length, 1) ? 5 : 2.5"
          />
          <rect
            v-else
            :x="mapFeatureX(row.sample.area) - 7"
            :y="mapFeatureY(row.sample.age) - 7"
            width="14"
            height="14"
            class="linear-sample"
            :class="{ 'is-highlight': index === props.currentStep % Math.max(displayRows.length, 1) }"
            :stroke-width="index === props.currentStep % Math.max(displayRows.length, 1) ? 5 : 2.5"
          />
        </template>
      </svg>
      <div class="linear-state-legend">
        <span>△ {{ copy.positive }}</span>
        <span>□ {{ copy.negative }}</span>
      </div>
      <p class="linear-regression-lab__source-note">{{ copy.staticNote }}</p>
      <table class="linear-regression-results__table">
        <thead>
          <tr>
            <th scope="col">{{ copy.row }}</th>
            <th scope="col">temp</th>
            <th scope="col">hum</th>
            <th scope="col">{{ copy.count }}</th>
            <th scope="col">{{ copy.prediction }}</th>
            <th scope="col">{{ copy.residual }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(row, index) in displayRows" :key="`table-${row.id}`">
            <th scope="row">{{ row.cue === 'triangle' ? '△' : '□' }} {{ index + 1 }}</th>
            <td>{{ formatNumber(row.sample.area) }}</td>
            <td>{{ formatNumber(row.sample.age) }}</td>
            <td>{{ formatNumber(row.sample.price) }}</td>
            <td>{{ formatNumber(row.prediction) }}</td>
            <td>{{ formatNumber(row.residual) }}</td>
          </tr>
        </tbody>
      </table>
    </section>

    <section class="linear-regression-lab__panel linear-regression-lab__panel--state">
      <div class="linear-regression-lab__heading">
        <span>{{ copy.state }}</span>
        <strong>{{ copy.loss }} / {{ copy.mae }}</strong>
      </div>
      <svg
        :viewBox="`0 0 ${stateWidth} ${stateHeight}`"
        class="linear-regression-lab__state-svg"
        role="img"
        :aria-label="`${copy.state}; ${copy.loss}; ${copy.mae}; ${copy.cue}`"
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
        <polyline :points="lossPath" class="linear-state-line" />
        <polyline
          :points="maePath"
          class="linear-state-line linear-state-line--error"
          stroke-dasharray="7 5"
        />
        <circle :cx="activeStatePoint.x" :cy="activeStatePoint.y" r="7" class="linear-state-dot" />
      </svg>
      <div class="linear-state-legend">
        <span>━ {{ copy.loss }}</span>
        <span>┈ {{ copy.mae }}</span>
      </div>
    </section>
  </div>
</template>
