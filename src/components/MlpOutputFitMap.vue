<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { contours, geoIdentity, geoPath, scaleLinear, ticks } from 'd3'
import type { MlpPlaygroundSnapshot, MlpPlaygroundState } from '../types/ml'

const props = defineProps<{
  snapshot: MlpPlaygroundSnapshot
  state: MlpPlaygroundState
  history: MlpPlaygroundSnapshot[]
  accent: string
}>()

const canvasRef = ref<HTMLCanvasElement>()
let resizeObserver: ResizeObserver | undefined

const axisTicks = computed(() => ({
  x: ticks(props.snapshot.xDomain[0], props.snapshot.xDomain[1], 5),
  y: ticks(props.snapshot.yDomain[0], props.snapshot.yDomain[1], 5),
}))

const visiblePoints = computed(() =>
  props.state.showTestData
    ? [...props.snapshot.trainData, ...props.snapshot.testData]
    : props.snapshot.trainData,
)

function mapX(x: number) {
  const scale = scaleLinear(props.snapshot.xDomain, [0, 100])
  return scale(x)
}

function mapY(y: number) {
  const scale = scaleLinear(props.snapshot.yDomain, [100, 0])
  return scale(y)
}

function colorForValue(rawValue: number) {
  const value = props.state.discretize ? (rawValue >= 0 ? 1 : -1) : Math.max(-1, Math.min(1, rawValue))
  const t = (value + 1) / 2
  const red = Math.round(241 - t * 176)
  const green = Math.round(130 + t * 58)
  const blue = Math.round(74 + t * 145)
  return `rgb(${red}, ${green}, ${blue})`
}

function contourPaths(snapshot: MlpPlaygroundSnapshot, thresholds: number[]) {
  if (!snapshot.outputGrid.length || snapshot.gridSize < 2) return []
  const projection = geoIdentity().scale(100 / Math.max(snapshot.gridSize - 1, 1))
  const path = geoPath(projection)

  return contours()
    .size([snapshot.gridSize, snapshot.gridSize])
    .thresholds(thresholds)(snapshot.outputGrid)
    .map((contour) => path(contour) ?? '')
    .filter(Boolean)
}

const supportContours = computed(() => contourPaths(props.snapshot, [-0.5, 0.5]))
const decisionContours = computed(() => contourPaths(props.snapshot, [0]))

const ghostContours = computed(() =>
  props.history
    .slice(0, -1)
    .slice(-4)
    .map((entry, index, entries) => ({
      id: `${entry.iteration}-${index}`,
      opacity: 0.13 + (index / Math.max(entries.length - 1, 1)) * 0.2,
      paths: contourPaths(entry, [0]),
    })),
)

function draw() {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  const current = props.snapshot
  if (!canvas || !context || !current.outputGrid.length) return

  const bounds = canvas.getBoundingClientRect()
  const cssSize = Math.max(320, Math.round(bounds.width || canvas.clientWidth || 420))
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
  const size = Math.round(cssSize * pixelRatio)

  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size
    canvas.height = size
  }

  context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
  context.clearRect(0, 0, cssSize, cssSize)

  const cell = cssSize / current.gridSize
  for (let row = 0; row < current.gridSize; row += 1) {
    for (let column = 0; column < current.gridSize; column += 1) {
      context.fillStyle = colorForValue(current.outputGrid[row * current.gridSize + column] ?? 0)
      context.fillRect(column * cell, row * cell, Math.ceil(cell), Math.ceil(cell))
    }
  }
}

onMounted(() => {
  draw()
  if (canvasRef.value) {
    resizeObserver = new ResizeObserver(draw)
    resizeObserver.observe(canvasRef.value)
  }
})

onBeforeUnmount(() => resizeObserver?.disconnect())

watch(
  () => [props.snapshot, props.state.discretize],
  draw,
  { deep: true },
)
</script>

<template>
  <div class="mlp-output-map" data-testid="mlp-output-fit-map">
    <canvas ref="canvasRef" class="mlp-output-map__canvas" data-testid="mlp-output-heatmap" />
    <svg viewBox="0 0 100 100" class="mlp-output-map__overlay" aria-hidden="true">
      <g class="mlp-output-grid">
        <line
          v-for="tick in axisTicks.x"
          :key="`x-${tick}`"
          :x1="mapX(tick)"
          :x2="mapX(tick)"
          y1="0"
          y2="100"
        />
        <line
          v-for="tick in axisTicks.y"
          :key="`y-${tick}`"
          x1="0"
          x2="100"
          :y1="mapY(tick)"
          :y2="mapY(tick)"
        />
      </g>

      <g class="mlp-output-contours mlp-output-contours--support">
        <path v-for="path in supportContours" :key="path" :d="path" />
      </g>

      <g
        v-for="ghost in ghostContours"
        :key="ghost.id"
        class="mlp-output-contours mlp-output-contours--ghost"
        :style="{ opacity: ghost.opacity }"
      >
        <path v-for="path in ghost.paths" :key="path" :d="path" />
      </g>

      <g class="mlp-output-contours mlp-output-contours--decision" data-testid="mlp-output-contour">
        <path v-for="path in decisionContours" :key="path" :d="path" />
      </g>

      <g class="mlp-output-points">
        <circle
          v-for="(point, index) in visiblePoints"
          :key="`${point.split}-${index}-${point.x}-${point.y}`"
          :cx="mapX(point.x)"
          :cy="mapY(point.y)"
          :r="point.split === 'test' ? 1.28 : 1.04"
          :class="[
            point.label >= 0 ? 'mlp-data-point mlp-data-point--positive' : 'mlp-data-point mlp-data-point--negative',
            point.split === 'test' ? 'mlp-data-point--test' : '',
          ]"
        />
      </g>
    </svg>
  </div>
</template>
