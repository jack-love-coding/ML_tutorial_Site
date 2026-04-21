<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { StorySection, TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  section?: StorySection
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: '训练回放结果',
        subtitle: '当前直线',
        startLoss: '初始 MSE',
        currentLoss: '当前 MSE',
        slope: '斜率',
        intercept: '截距',
        progress: '训练进度',
        note:
          props.section?.id === 'model-limits'
            ? '如果损失不再明显下降，但残差仍呈现结构性偏差，就说明问题更可能来自模型表达能力。'
            : '读数和实验卡同步更新；播放时优先观察损失下降是否和左侧直线移动一致。',
      }
    : {
        title: 'Training playback results',
        subtitle: 'Current line',
        startLoss: 'Initial MSE',
        currentLoss: 'Current MSE',
        slope: 'Slope',
        intercept: 'Intercept',
        progress: 'Progress',
        note:
          props.section?.id === 'model-limits'
            ? 'If loss stops falling while residuals keep a pattern, the problem is more likely model expressivity.'
            : 'These readings update with the main lab; while playing, connect loss decrease to the moving line.',
      },
)

const firstSnapshot = computed(() => props.snapshots[0])
const progress = computed(() =>
  Math.round((props.currentStep / Math.max(props.snapshots.length - 1, 1)) * 100),
)

const resultCards = computed(() => [
  {
    id: 'start-loss',
    label: copy.value.startLoss,
    value: round(firstSnapshot.value?.loss ?? 0, 2),
  },
  {
    id: 'current-loss',
    label: copy.value.currentLoss,
    value: round(props.snapshot?.loss ?? 0, 2),
  },
  {
    id: 'slope',
    label: copy.value.slope,
    value: round(Number(props.snapshot?.derivedMetrics?.slope ?? 0), 3),
  },
  {
    id: 'intercept',
    label: copy.value.intercept,
    value: round(Number(props.snapshot?.derivedMetrics?.intercept ?? 0), 2),
  },
  {
    id: 'progress',
    label: copy.value.progress,
    value: `${progress.value}%`,
  },
])
</script>

<template>
  <section class="panel linear-results">
    <div class="panel__heading">
      <span>{{ copy.title }}</span>
      <strong>{{ copy.subtitle }}</strong>
    </div>

    <div class="linear-results__grid">
      <article v-for="card in resultCards" :key="card.id" class="chart-summary__item">
        <span>{{ card.label }}</span>
        <strong>{{ card.value }}</strong>
      </article>
    </div>

    <p>{{ copy.note }}</p>
  </section>
</template>
