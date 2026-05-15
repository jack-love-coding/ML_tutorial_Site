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
const margin = { top: 24, right: 30, bottom: 42, left: 54 }
const xScale = d3.scaleLinear().domain([0.01, 0.99]).range([margin.left, width - margin.right])
const yScale = d3.scaleLinear().domain([0, 4.6]).range([height - margin.bottom, margin.top])

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        title: 'log loss 曲线',
        positive: '真实标签为 1',
        negative: '真实标签为 0',
        sample: '近边界样本损失',
      }
    : {
        title: 'Log loss curves',
        positive: 'True label 1',
        negative: 'True label 0',
        sample: 'Near-boundary sample loss',
      },
)

const paths = computed(() => {
  const line = d3
    .line<[number, number]>()
    .x((point) => xScale(point[0]))
    .y((point) => yScale(point[1]))
    .curve(d3.curveMonotoneX)
  const probabilities = d3.range(0.01, 0.991, 0.01)
  return {
    positive: line(probabilities.map((p) => [p, -Math.log(p)] as [number, number])) ?? '',
    negative: line(probabilities.map((p) => [p, -Math.log(1 - p)] as [number, number])) ?? '',
  }
})

const sample = computed(() => {
  const dataset = props.snapshot?.dataset ?? []
  const params = props.snapshot?.params
  if (!dataset.length || !params) return { probability: 0.5, label: 1, loss: Math.log(2) }

  const selected = dataset
    .map((point) => {
      const score = params.weights[0] * point.x + params.weights[1] * point.y + params.bias
      return { point, score, probability: sigmoid(score) }
    })
    .sort((left, right) => Math.abs(left.score) - Math.abs(right.score))[0]

  const label = selected.point.label ?? 0
  const probability = Math.min(0.99, Math.max(0.01, selected.probability))
  const loss = label === 1 ? -Math.log(probability) : -Math.log(1 - probability)
  return { probability, label, loss }
})

const samplePoint = computed(() => ({
  x: xScale(sample.value.probability),
  y: yScale(Math.min(4.6, sample.value.loss)),
}))
</script>

<template>
  <figure class="logistic-d3-figure logistic-d3-figure--loss">
    <figcaption>
      <span>{{ copy.title }}</span>
      <strong>{{ copy.sample }} {{ round(sample.loss, 3) }}</strong>
    </figcaption>
    <svg :viewBox="`0 0 ${width} ${height}`" role="img" :aria-label="copy.title">
      <line :x1="margin.left" :x2="width - margin.right" :y1="height - margin.bottom" :y2="height - margin.bottom" class="logistic-axis" />
      <line :x1="margin.left" :x2="margin.left" :y1="margin.top" :y2="height - margin.bottom" class="logistic-axis" />
      <path :d="paths.positive" class="logistic-loss-path logistic-loss-path--positive" :style="{ stroke: props.accent }" />
      <path :d="paths.negative" class="logistic-loss-path logistic-loss-path--negative" />
      <line :x1="samplePoint.x" :x2="samplePoint.x" :y1="samplePoint.y" :y2="height - margin.bottom" class="logistic-cursor-line" />
      <circle :cx="samplePoint.x" :cy="samplePoint.y" r="8" class="logistic-cursor-dot" :class="{ 'is-negative': sample.label === 0 }" />
      <text x="96" y="44" class="logistic-chart-note">{{ copy.positive }}</text>
      <text x="392" y="44" class="logistic-chart-note">{{ copy.negative }}</text>
      <text :x="margin.left" :y="height - 14" class="logistic-chart-label">0</text>
      <text :x="width - margin.right - 12" :y="height - 14" class="logistic-chart-label">1</text>
    </svg>
  </figure>
</template>
