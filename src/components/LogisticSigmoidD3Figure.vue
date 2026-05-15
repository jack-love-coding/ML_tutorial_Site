<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import * as d3 from 'd3'
import type { TrainingSnapshot } from '../types/ml'
import { round, sigmoid } from '../utils/math'

const props = defineProps<{
  snapshot?: TrainingSnapshot
  accent: string
}>()

const { locale } = useI18n()

const width = 620
const height = 280
const margin = { top: 22, right: 28, bottom: 42, left: 50 }

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: 'sigmoid 概率曲线',
        score: '当前 z',
        probability: '正类概率',
        midpoint: 'z = 0 对应 0.5',
      }
    : {
        title: 'Sigmoid probability curve',
        score: 'Current z',
        probability: 'Positive probability',
        midpoint: 'z = 0 maps to 0.5',
      },
)

const xScale = d3.scaleLinear().domain([-6, 6]).range([margin.left, width - margin.right])
const yScale = d3.scaleLinear().domain([0, 1]).range([height - margin.bottom, margin.top])

const curvePath = computed(() => {
  const line = d3
    .line<[number, number]>()
    .x((point) => xScale(point[0]))
    .y((point) => yScale(point[1]))
    .curve(d3.curveMonotoneX)

  return (
    line(
      d3.range(-6, 6.01, 0.12).map((value) => [value, sigmoid(value)] as [number, number]),
    ) ?? ''
  )
})

const currentScore = computed(() => {
  const point = props.snapshot?.dataset?.[0]
  const weights = props.snapshot?.params?.weights
  const bias = props.snapshot?.params?.bias ?? 0
  if (!point || !weights) return 0
  return weights[0] * point.x + weights[1] * point.y + bias
})

const currentProbability = computed(() => sigmoid(currentScore.value))
const cursor = computed(() => ({
  x: xScale(Math.max(-6, Math.min(6, currentScore.value))),
  y: yScale(currentProbability.value),
}))

const ticks = [-6, -3, 0, 3, 6]
</script>

<template>
  <figure class="logistic-d3-figure logistic-d3-figure--sigmoid">
    <figcaption>
      <span>{{ copy.title }}</span>
      <strong>{{ copy.score }} {{ round(currentScore, 2) }} · {{ copy.probability }} {{ round(currentProbability, 3) }}</strong>
    </figcaption>
    <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="copy.title">
      <line :x1="margin.left" :x2="width - margin.right" :y1="yScale(0)" :y2="yScale(0)" class="logistic-axis" />
      <line :x1="margin.left" :x2="margin.left" :y1="margin.top" :y2="height - margin.bottom" class="logistic-axis" />
      <line :x1="xScale(0)" :x2="xScale(0)" :y1="margin.top" :y2="height - margin.bottom" class="logistic-reference" />
      <line :x1="margin.left" :x2="width - margin.right" :y1="yScale(0.5)" :y2="yScale(0.5)" class="logistic-reference" />
      <path :d="curvePath" class="logistic-sigmoid-path" :style="{ stroke: props.accent }" />
      <line :x1="cursor.x" :x2="cursor.x" :y1="cursor.y" :y2="height - margin.bottom" class="logistic-cursor-line" />
      <circle :cx="cursor.x" :cy="cursor.y" r="8" class="logistic-cursor-dot" :style="{ fill: props.accent }" />
      <text v-for="tick in ticks" :key="tick" :x="xScale(tick)" :y="height - 14" class="logistic-chart-label">{{ tick }}</text>
      <text :x="xScale(0) + 8" :y="yScale(0.5) - 10" class="logistic-chart-note">{{ copy.midpoint }}</text>
    </svg>
  </figure>
</template>
