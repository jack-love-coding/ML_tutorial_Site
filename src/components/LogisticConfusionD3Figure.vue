<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as d3 from 'd3'
import type { TrainingSnapshot } from '../types/ml'
import { round } from '../utils/math'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  accent: string
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: '阈值与混淆矩阵',
        predictedPositive: '预测正类',
        predictedNegative: '预测负类',
        actualPositive: '真实正类',
        actualNegative: '真实负类',
        threshold: '阈值',
        precision: '精确率',
        recall: '召回率',
      }
    : {
        title: 'Threshold and confusion matrix',
        predictedPositive: 'Predicted positive',
        predictedNegative: 'Predicted negative',
        actualPositive: 'Actual positive',
        actualNegative: 'Actual negative',
        threshold: 'Threshold',
        precision: 'Precision',
        recall: 'Recall',
      },
)

function metric(key: string) {
  return Number(props.snapshot?.derivedMetrics?.[key] ?? 0)
}

const matrix = computed(() => [
  { id: 'tp', label: 'TP', value: metric('tp'), x: 218, y: 64 },
  { id: 'fn', label: 'FN', value: metric('fn'), x: 392, y: 64 },
  { id: 'fp', label: 'FP', value: metric('fp'), x: 218, y: 154 },
  { id: 'tn', label: 'TN', value: metric('tn'), x: 392, y: 154 },
])

const maxCell = computed(() => Math.max(1, ...matrix.value.map((cell) => cell.value)))
const colorScale = computed(() =>
  d3.scaleLinear<string>().domain([0, maxCell.value]).range(['#f7faf9', props.accent]),
)
</script>

<template>
  <figure class="logistic-d3-figure logistic-d3-figure--confusion">
    <figcaption>
      <span>{{ copy.title }}</span>
      <strong>
        {{ copy.threshold }} {{ round(metric('threshold'), 2) }} ·
        {{ copy.precision }} {{ round(metric('precision') * 100, 1) }}% ·
        {{ copy.recall }} {{ round(metric('recall') * 100, 1) }}%
      </strong>
    </figcaption>
    <svg viewBox="0 0 620 280" role="img" :aria-label="copy.title">
      <text x="218" y="34" class="logistic-chart-note">{{ copy.predictedPositive }}</text>
      <text x="392" y="34" class="logistic-chart-note">{{ copy.predictedNegative }}</text>
      <text x="40" y="110" class="logistic-chart-note">{{ copy.actualPositive }}</text>
      <text x="40" y="200" class="logistic-chart-note">{{ copy.actualNegative }}</text>
      <g v-for="cell in matrix" :key="cell.id">
        <rect
          :x="cell.x"
          :y="cell.y"
          width="146"
          height="72"
          rx="8"
          class="logistic-confusion-cell"
          :style="{ fill: colorScale(cell.value) }"
        />
        <text :x="cell.x + 18" :y="cell.y + 30" class="logistic-confusion-label">{{ cell.label }}</text>
        <text :x="cell.x + 18" :y="cell.y + 58" class="logistic-confusion-value">{{ cell.value }}</text>
      </g>
      <line x1="198" x2="558" y1="146" y2="146" class="logistic-reference" />
      <line x1="382" x2="382" y1="52" y2="238" class="logistic-reference" />
    </svg>
  </figure>
</template>
