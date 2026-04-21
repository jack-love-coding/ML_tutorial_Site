<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  ExperimentConfig,
  ExperimentPreset,
  PlotPoint,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import { round } from '../utils/math'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  isPlaying: boolean
  accent: string
  section: StorySection
  presets: ExperimentPreset[]
}>()

const emit = defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'toggle-play': []
  step: []
  replay: []
  reset: []
  'apply-preset': [config: Partial<ExperimentConfig>]
}>()

const { t, locale } = useI18n()

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
        predicted: '预测',
        actual: '真实',
        residual: '残差',
        loss: 'MSE',
        mae: 'MAE',
        slope: '斜率',
        intercept: '截距',
        gradient: '梯度强度',
        status: '状态',
        selectedHouse: '当前样本',
        controls: '实验控制',
        presets: '章节预设',
        focus: '本章看什么',
        lossCurve: '损失曲线',
        parameterPath: '斜率 / 截距轨迹',
        outlierOn: '离群点开启',
        outlierOff: '离群点关闭',
        units: {
          area: 'm²',
          price: '万',
        },
        statusText: {
          initializing: '初始直线',
          'coarse-search': '大步校正',
          settling: '快速下降',
          refining: '细调参数',
          'capacity-limit': '表达受限',
          plateau: '接近收敛',
        },
        focusText: {
          'fit-line': '先看散点和直线的相对位置，把斜率和截距理解成模型语言。',
          'residual-loss': '重点看竖直残差线，以及少数大误差如何影响 MSE。',
          'training-motion': '把左侧直线移动和右侧参数轨迹连起来读。',
          'model-limits': '观察弯曲趋势和离群点如何暴露“一条线”的表达边界。',
        },
      }
    : {
        dataSpace: 'Data space',
        stateSpace: 'Training state',
        area: 'Area',
        price: 'Price',
        predicted: 'Predicted',
        actual: 'Actual',
        residual: 'Residual',
        loss: 'MSE',
        mae: 'MAE',
        slope: 'Slope',
        intercept: 'Intercept',
        gradient: 'Gradient norm',
        status: 'Status',
        selectedHouse: 'Selected house',
        controls: 'Experiment controls',
        presets: 'Chapter presets',
        focus: 'What to watch',
        lossCurve: 'Loss curve',
        parameterPath: 'Slope / intercept path',
        outlierOn: 'Outlier on',
        outlierOff: 'Outlier off',
        units: {
          area: 'm²',
          price: 'w',
        },
        statusText: {
          initializing: 'Initial line',
          'coarse-search': 'Coarse correction',
          settling: 'Falling quickly',
          refining: 'Fine tuning',
          'capacity-limit': 'Capacity limit',
          plateau: 'Near convergence',
        },
        focusText: {
          'fit-line': 'Read the scatter and line first, then connect slope and intercept to model language.',
          'residual-loss': 'Watch the vertical residuals and how a few large errors influence MSE.',
          'training-motion': 'Connect the moving line on the left to the parameter path on the right.',
          'model-limits': 'Use curvature and outliers to see the expressive limit of one line.',
        },
      },
)

const samples = computed(() => props.snapshot?.regressionSamples ?? [])
const fit = computed(() => props.snapshot?.regressionFit ?? { slope: 1.35, intercept: 55 })
const highlightIndex = computed(() => Number(props.snapshot?.derivedMetrics?.highlightIndex ?? 0))
const chartMode = computed(() =>
  props.section.id === 'training-motion' ? 'parameters' : 'loss',
)

const domain = computed(() => {
  const xValues = samples.value.map((sample) => sample.x)
  const yValues = samples.value.flatMap((sample) => [
    sample.y,
    fit.value.slope * sample.x + fit.value.intercept,
  ])

  return {
    xMin: Math.min(...xValues, 40) - 8,
    xMax: Math.max(...xValues, 170) + 8,
    yMin: Math.min(...yValues, 90) - 18,
    yMax: Math.max(...yValues, 320) + 18,
  }
})

const fitLine = computed(() => [
  {
    x: domain.value.xMin,
    y: fit.value.slope * domain.value.xMin + fit.value.intercept,
  },
  {
    x: domain.value.xMax,
    y: fit.value.slope * domain.value.xMax + fit.value.intercept,
  },
])

const residualSegments = computed(() =>
  samples.value.map((sample, index) => {
    const prediction = fit.value.slope * sample.x + fit.value.intercept
    return {
      id: `${sample.x}-${index}`,
      index,
      x: sample.x,
      actual: sample.y,
      prediction,
    }
  }),
)

const readoutCards = computed(() => [
  {
    id: 'loss',
    label: copy.value.loss,
    value: round(Number(props.snapshot?.derivedMetrics?.mse ?? props.snapshot?.loss ?? 0), 2),
  },
  {
    id: 'mae',
    label: copy.value.mae,
    value: round(Number(props.snapshot?.derivedMetrics?.mae ?? 0), 2),
  },
  {
    id: 'slope',
    label: copy.value.slope,
    value: round(Number(props.snapshot?.derivedMetrics?.slope ?? fit.value.slope), 3),
  },
  {
    id: 'intercept',
    label: copy.value.intercept,
    value: round(Number(props.snapshot?.derivedMetrics?.intercept ?? fit.value.intercept), 2),
  },
  {
    id: 'gradient',
    label: copy.value.gradient,
    value: round(Number(props.snapshot?.derivedMetrics?.gradientNorm ?? 0), 3),
  },
  {
    id: 'status',
    label: copy.value.status,
    value:
      copy.value.statusText[
        String(props.snapshot?.derivedMetrics?.statusKey ?? 'initializing') as keyof typeof copy.value.statusText
      ],
  },
])

const selectedObservation = computed(() => props.snapshot?.selectedObservation ?? {})
const selectedSummary = computed(() => [
  {
    label: copy.value.area,
    value: `${round(Number(selectedObservation.value.area ?? 0), 1)} ${copy.value.units.area}`,
  },
  {
    label: copy.value.actual,
    value: `${round(Number(selectedObservation.value.actualPrice ?? 0), 1)} ${copy.value.units.price}`,
  },
  {
    label: copy.value.predicted,
    value: `${round(Number(selectedObservation.value.predictedPrice ?? 0), 1)} ${copy.value.units.price}`,
  },
  {
    label: copy.value.residual,
    value: `${round(Number(selectedObservation.value.residual ?? 0), 1)} ${copy.value.units.price}`,
  },
])

const lossPath = computed(() =>
  buildStatePolyline(props.snapshots.map((snapshot) => snapshot.loss)),
)

const lossDot = computed(() =>
  pointOnStateLine(props.snapshots.map((snapshot) => snapshot.loss), props.currentStep),
)

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
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)

  return parameterPoints.value
    .map((point) => {
      const x = scaleState(point.x, minX, maxX)
      const y = stateHeight - statePadding - scaleState(point.y, minY, maxY, stateHeight - statePadding * 2)
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

function fitLinePoints(points: PlotPoint[]) {
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
  const value = values[safeIndex] ?? values[0]
  return {
    x: statePadding + (safeIndex / Math.max(values.length - 1, 1)) * (stateWidth - statePadding * 2),
    y: stateHeight - statePadding - ((value - min) / (max - min || 1)) * (stateHeight - statePadding * 2),
  }
}

function configNumber(key: string, fallback: number) {
  return Number(props.config[key] ?? fallback)
}

function onRangeInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('patch-config', { [key]: Number(target.value) })
}

function toggleOutlier() {
  emit('patch-config', { includeOutlier: !Boolean(props.config.includeOutlier) })
}
</script>

<template>
  <section
    class="linear-regression-lab"
    :style="{ '--linear-accent': props.accent }"
  >
    <div class="linear-regression-lab__workspace">
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
              {{ copy.area }} ({{ copy.units.area }})
            </text>
            <text :x="12" :y="32" class="linear-axis-label">
              {{ copy.price }} ({{ copy.units.price }})
            </text>
            <line
              v-for="segment in residualSegments"
              :key="segment.id"
              :x1="mapDataX(segment.x)"
              :x2="mapDataX(segment.x)"
              :y1="mapDataY(segment.actual)"
              :y2="mapDataY(segment.prediction)"
              class="linear-residual"
              :class="{ 'is-emphasis': segment.index === highlightIndex || props.section.id === 'residual-loss' }"
            />
            <polyline :points="fitLinePoints(fitLine)" class="linear-fit-line" />
            <circle
              v-for="(sample, index) in samples"
              :key="`${sample.x}-${sample.y}-${index}`"
              :cx="mapDataX(sample.x)"
              :cy="mapDataY(sample.y)"
              :r="index === highlightIndex ? 7 : 5.6"
              class="linear-sample"
              :class="{ 'is-highlight': index === highlightIndex }"
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
              <polyline
                :points="parameterPath"
                class="linear-state-line linear-state-line--parameter"
              />
              <circle
                :cx="parameterDot.x"
                :cy="parameterDot.y"
                r="6"
                class="linear-state-dot"
              />
            </template>
            <template v-else>
              <polyline :points="lossPath" class="linear-state-line" />
              <circle
                :cx="lossDot.x"
                :cy="lossDot.y"
                r="6"
                class="linear-state-dot"
              />
            </template>
          </svg>
        </section>
      </div>

      <div class="linear-regression-lab__controls">
        <div class="linear-regression-lab__actions">
          <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
            {{ props.isPlaying ? t('actions.pause') : t('actions.play') }}
          </button>
          <button type="button" class="action-button" @click="emit('step')">
            {{ t('actions.step') }}
          </button>
          <button type="button" class="action-button" @click="emit('replay')">
            {{ t('actions.replay') }}
          </button>
          <button type="button" class="action-button" @click="emit('reset')">
            {{ t('actions.reset') }}
          </button>
        </div>

        <div class="linear-regression-lab__control-grid">
          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.learningRate') }}</span>
              <strong>{{ round(configNumber('learningRate', 0.11), 2) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0.02"
              max="0.24"
              step="0.01"
              :value="configNumber('learningRate', 0.11)"
              @input="onRangeInput('learningRate', $event)"
            />
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.epochs') }}</span>
              <strong>{{ configNumber('epochs', 36) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="16"
              max="72"
              step="2"
              :value="configNumber('epochs', 36)"
              @input="onRangeInput('epochs', $event)"
            />
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.animationSpeed') }}</span>
              <strong>{{ configNumber('playbackMs', 120) }}ms</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="70"
              max="260"
              step="10"
              :value="configNumber('playbackMs', 120)"
              @input="onRangeInput('playbackMs', $event)"
            />
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.datasetNoise') }}</span>
              <strong>{{ round(configNumber('datasetNoise', 0.05), 2) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0"
              max="0.35"
              step="0.01"
              :value="configNumber('datasetNoise', 0.05)"
              @input="onRangeInput('datasetNoise', $event)"
            />
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.outlierStrength') }}</span>
              <strong>{{ round(configNumber('outlierStrength', 36), 0) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0"
              max="120"
              step="2"
              :value="configNumber('outlierStrength', 36)"
              @input="onRangeInput('outlierStrength', $event)"
            />
          </label>

          <label class="control control--toggle">
            <span class="control__row">
              <span>{{ t('controls.includeOutlier') }}</span>
              <strong>{{ Boolean(props.config.includeOutlier) ? copy.outlierOn : copy.outlierOff }}</strong>
            </span>
            <button type="button" class="toggle-strip__button is-active" @click="toggleOutlier">
              {{ Boolean(props.config.includeOutlier) ? t('controls.options.on') : t('controls.options.off') }}
            </button>
          </label>
        </div>
      </div>

      <div class="linear-regression-lab__readout">
        <article
          v-for="card in readoutCards"
          :key="card.id"
          class="linear-regression-lab__metric"
        >
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>

        <section class="linear-regression-lab__selected">
          <div class="linear-regression-lab__heading">
            <span>{{ copy.selectedHouse }}</span>
            <strong>{{ copy.predicted }} vs {{ copy.actual }}</strong>
          </div>
          <div class="linear-regression-lab__mini-grid">
            <article v-for="item in selectedSummary" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </section>

        <section class="linear-regression-lab__focus">
          <span>{{ copy.focus }}</span>
          <p>{{ copy.focusText[props.section.id as keyof typeof copy.focusText] }}</p>
        </section>

        <section class="linear-regression-lab__presets">
          <div class="linear-regression-lab__heading">
            <span>{{ copy.presets }}</span>
            <strong>{{ t('common.presets') }}</strong>
          </div>
          <div class="linear-regression-lab__preset-list">
            <button
              v-for="preset in props.presets"
              :key="preset.id"
              type="button"
              class="preset-card"
              :class="{ 'is-linked': preset.id === props.section.presetId }"
              @click="emit('apply-preset', preset.config)"
            >
              <span>{{ preset.id === props.section.presetId ? t('common.tryThis') : t('actions.applyPreset') }}</span>
              <strong>{{ preset.label[locale as 'zh-CN' | 'en'] }}</strong>
              <p>{{ preset.description[locale as 'zh-CN' | 'en'] }}</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  </section>
</template>
