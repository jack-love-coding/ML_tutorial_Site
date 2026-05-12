<script setup lang="ts">
import { computed } from 'vue'
import { curveMonotoneX, line, scaleLinear } from 'd3'
import type { MlpPlaygroundSnapshot } from '../types/ml'

const props = defineProps<{
  snapshot: MlpPlaygroundSnapshot
  trainLabel: string
  testLabel: string
}>()

const width = 360
const height = 124
const padding = { top: 16, right: 14, bottom: 22, left: 28 }

const history = computed(() => props.snapshot.lossHistory.length ? props.snapshot.lossHistory : [{
  iteration: props.snapshot.iteration,
  trainLoss: props.snapshot.trainLoss,
  testLoss: props.snapshot.testLoss,
}])

const scales = computed(() => {
  const xValues = history.value.map((entry) => entry.iteration)
  const yValues = history.value.flatMap((entry) => [entry.trainLoss, entry.testLoss])
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  return {
    x: scaleLinear()
      .domain([xMin, xMax || xMin + 1])
      .range([padding.left, width - padding.right]),
    y: scaleLinear()
      .domain([yMin, yMax || yMin + 1])
      .nice()
      .range([height - padding.bottom, padding.top]),
  }
})

const pathBuilder = computed(() =>
  line<{ iteration: number; value: number }>()
    .x((point) => scales.value.x(point.iteration))
    .y((point) => scales.value.y(point.value))
    .curve(curveMonotoneX),
)

const trainPath = computed(() =>
  pathBuilder.value(history.value.map((entry) => ({ iteration: entry.iteration, value: entry.trainLoss }))) ?? '',
)

const testPath = computed(() =>
  pathBuilder.value(history.value.map((entry) => ({ iteration: entry.iteration, value: entry.testLoss }))) ?? '',
)

const cursorX = computed(() => scales.value.x(props.snapshot.iteration))
const yTicks = computed(() => scales.value.y.ticks(3))
</script>

<template>
  <div class="mlp-loss-chart" data-testid="mlp-training-timeline">
    <svg :viewBox="`0 0 ${width} ${height}`" role="img" aria-label="MLP train and test loss curves">
      <g class="mlp-loss-chart__grid">
        <line
          v-for="tick in yTicks"
          :key="tick"
          :x1="padding.left"
          :x2="width - padding.right"
          :y1="scales.y(tick)"
          :y2="scales.y(tick)"
        />
      </g>
      <line
        :x1="padding.left"
        :x2="width - padding.right"
        :y1="height - padding.bottom"
        :y2="height - padding.bottom"
        class="mlp-loss-chart__axis"
      />
      <path :d="trainPath" class="mlp-loss-chart__line mlp-loss-chart__line--train" />
      <path :d="testPath" class="mlp-loss-chart__line mlp-loss-chart__line--test" />
      <line
        :x1="cursorX"
        :x2="cursorX"
        :y1="padding.top"
        :y2="height - padding.bottom"
        class="mlp-loss-chart__cursor"
      />
    </svg>
    <div class="mlp-loss-chart__legend">
      <span><i class="mlp-loss-chart__dot mlp-loss-chart__dot--train" />{{ trainLabel }}</span>
      <span><i class="mlp-loss-chart__dot mlp-loss-chart__dot--test" />{{ testLabel }}</span>
    </div>
  </div>
</template>
