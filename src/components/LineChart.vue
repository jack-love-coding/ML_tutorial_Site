<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ModuleSlug, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'

const props = defineProps<{
  slug: ModuleSlug
  snapshots: TrainingSnapshot[]
  currentStep: number
}>()

const { t } = useI18n()
const width = 540
const height = 220
const padding = 24

function buildLine(values: number[]) {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2)
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

const lossPoints = computed(() => buildLine(props.snapshots.map((snapshot) => snapshot.loss)))
const accuracyPoints = computed(() =>
  buildLine(props.snapshots.map((snapshot) => snapshot.accuracy ?? 0)),
)
const cursorX = computed(() => padding + (props.currentStep / Math.max(props.snapshots.length - 1, 1)) * (width - padding * 2))
const currentSnapshot = computed(() => props.snapshots[props.currentStep])

function pointAt(values: number[]) {
  if (!values.length) return { x: padding, y: height - padding }
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const value = values[Math.min(props.currentStep, values.length - 1)]
  const x = padding + (props.currentStep / Math.max(values.length - 1, 1)) * (width - padding * 2)
  const y = height - padding - ((value - min) / range) * (height - padding * 2)
  return { x, y }
}

const currentLossPoint = computed(() => pointAt(props.snapshots.map((snapshot) => snapshot.loss)))
const currentAccuracyPoint = computed(() => pointAt(props.snapshots.map((snapshot) => snapshot.accuracy ?? 0)))

const phaseKey = computed(() => {
  const progress = props.currentStep / Math.max(props.snapshots.length - 1, 1)
  const recent = props.snapshots.slice(Math.max(0, props.currentStep - 4), props.currentStep + 1)
  if (progress < 0.22) return 'chart.warmup'
  if (recent.length >= 2) {
    const delta = Math.abs(recent[0].loss - recent[recent.length - 1].loss)
    if (delta < 0.04) return 'chart.plateau'
  }
  return 'chart.settling'
})

const gradientStatusKey = computed(() => String(currentSnapshot.value?.derivedMetrics?.statusKey ?? 'observations.gradientStable'))
</script>

<template>
  <section class="panel chart-panel">
    <div class="panel__heading">
      <span>{{ t('chart.playback') }}</span>
      <strong>{{ t('chart.lossTrace') }}</strong>
    </div>

    <svg :viewBox="`0 0 ${width} ${height}`" class="chart-svg" role="img" aria-label="metric chart">
      <line :x1="padding" :x2="width - padding" :y1="height - padding" :y2="height - padding" class="chart-axis" />
      <line :x1="padding" :x2="padding" :y1="padding" :y2="height - padding" class="chart-axis" />
      <polyline :points="lossPoints" class="chart-line chart-line--loss" />
      <polyline
        v-if="props.slug !== 'gradient-descent'"
        :points="accuracyPoints"
        class="chart-line chart-line--accuracy"
      />
      <line :x1="cursorX" :x2="cursorX" :y1="padding" :y2="height - padding" class="chart-cursor" />
      <circle :cx="currentLossPoint.x" :cy="currentLossPoint.y" r="5.5" class="chart-dot chart-dot--loss" />
      <circle
        v-if="props.slug !== 'gradient-descent'"
        :cx="currentAccuracyPoint.x"
        :cy="currentAccuracyPoint.y"
        r="5.5"
        class="chart-dot chart-dot--accuracy"
      />
    </svg>

    <div class="chart-legend">
      <span><i class="legend-dot legend-dot--loss" />{{ t('chart.lossTrace') }}</span>
      <span v-if="props.slug !== 'gradient-descent'"><i class="legend-dot legend-dot--accuracy" />{{ t('chart.accuracyTrace') }}</span>
    </div>

    <div class="chart-summary">
      <article class="chart-summary__item">
        <span>{{ t('chart.phase') }}</span>
        <strong>{{ t(phaseKey) }}</strong>
      </article>
      <article class="chart-summary__item">
        <span>{{ t('chart.currentLoss') }}</span>
        <strong>{{ round(currentSnapshot?.loss ?? 0) }}</strong>
      </article>
      <article v-if="props.slug === 'gradient-descent'" class="chart-summary__item">
        <span>{{ t('chart.currentStepSize') }}</span>
        <strong>{{ round(Number(currentSnapshot?.derivedMetrics?.stepSize ?? 0)) }}</strong>
      </article>
      <article v-if="props.slug === 'gradient-descent'" class="chart-summary__item">
        <span>{{ t('chart.currentStatus') }}</span>
        <strong>{{ t(gradientStatusKey) }}</strong>
      </article>
      <article
        v-if="props.slug === 'gradient-descent' && currentSnapshot?.referenceDistance !== undefined"
        class="chart-summary__item"
      >
        <span>{{ t('chart.currentReferenceDistance') }}</span>
        <strong>{{ round(currentSnapshot?.referenceDistance ?? 0) }}</strong>
      </article>
      <article v-if="props.slug !== 'gradient-descent'" class="chart-summary__item">
        <span>{{ t('chart.currentAccuracy') }}</span>
        <strong>{{ Math.round((currentSnapshot?.accuracy ?? 0) * 100) }}%</strong>
      </article>
    </div>
  </section>
</template>
