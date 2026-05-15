<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { FocusTarget, ModuleSlug, TrainingSnapshot } from '../types/ml'

const props = defineProps<{
  slug: ModuleSlug
  snapshot?: TrainingSnapshot
  accent: string
  focusTarget?: FocusTarget
  size?: number
}>()

const canvasRef = ref<HTMLCanvasElement>()
const canvasSize = computed(() => props.size ?? 420)

function map(value: number) {
  return ((value + 2.5) / 5) * canvasSize.value
}

function hiddenMap(value: number) {
  return ((value + 1.5) / 3) * 180
}

const dataset = computed(() => props.snapshot?.dataset ?? [])
const validationDataset = computed(() => props.snapshot?.validationSamples ?? [])
const hiddenPoints = computed(() => props.snapshot?.hidden ?? [])

const decisionLine = computed(() => {
  if (!props.snapshot?.params || props.slug !== 'logistic-regression') return null
  const [w0, w1] = props.snapshot.params.weights
  const bias = props.snapshot.params.bias
  const thresholdLogit =
    typeof props.snapshot.derivedMetrics?.thresholdLogit === 'number'
      ? props.snapshot.derivedMetrics.thresholdLogit
      : 0
  if (Math.abs(w1) < 1e-6) return null
  const x1 = -2.5
  const y1 = (thresholdLogit - w0 * x1 - bias) / w1
  const x2 = 2.5
  const y2 = (thresholdLogit - w0 * x2 - bias) / w1
  return {
    x1: map(x1),
    y1: canvasSize.value - map(y1),
    x2: map(x2),
    y2: canvasSize.value - map(y2),
  }
})

function draw() {
  const canvas = canvasRef.value
  if (!canvas || !props.snapshot?.boundaryGrid || !props.snapshot.gridSize) return
  const context = canvas.getContext('2d')
  if (!context) return

  context.clearRect(0, 0, canvasSize.value, canvasSize.value)
  const cell = canvasSize.value / props.snapshot.gridSize

  for (let row = 0; row < props.snapshot.gridSize; row += 1) {
    for (let column = 0; column < props.snapshot.gridSize; column += 1) {
      const confidence = props.snapshot.boundaryGrid[row * props.snapshot.gridSize + column]
      const blue = Math.round(210 + confidence * 30)
      const green = Math.round(145 + confidence * 45)
      const red = Math.round(255 - confidence * 115)
      const opacity = props.focusTarget === 'background' ? 1 : 0.92
      context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${opacity})`
      context.fillRect(column * cell, row * cell, cell + 1, cell + 1)
    }
  }

  context.strokeStyle = 'rgba(6, 11, 33, 0.16)'
  context.lineWidth = 1
  context.beginPath()
  context.moveTo(canvasSize.value / 2, 0)
  context.lineTo(canvasSize.value / 2, canvasSize.value)
  context.moveTo(0, canvasSize.value / 2)
  context.lineTo(canvasSize.value, canvasSize.value / 2)
  context.stroke()
}

onMounted(draw)
watch(() => props.snapshot, draw, { deep: true })
watch(canvasSize, draw)
</script>

<template>
  <div class="classifier-stack" :class="props.focusTarget ? `is-focused-${props.focusTarget}` : ''">
    <div class="viz-card">
      <canvas ref="canvasRef" :width="canvasSize" :height="canvasSize" class="viz-card__canvas" />
      <svg :viewBox="`0 0 ${canvasSize} ${canvasSize}`" class="viz-card__overlay">
        <line
          v-if="decisionLine"
          :x1="decisionLine.x1"
          :x2="decisionLine.x2"
          :y1="decisionLine.y1"
          :y2="decisionLine.y2"
          class="viz-separator"
          :class="{ 'is-emphasis': props.focusTarget === 'boundary' }"
        />

        <circle
          v-for="(point, index) in dataset"
          :key="`${point.x}-${point.y}-${index}`"
          :cx="map(point.x)"
          :cy="canvasSize - map(point.y)"
          r="5"
          :class="point.label === 1 ? 'dataset-point dataset-point--positive' : 'dataset-point dataset-point--negative'"
        />
        <circle
          v-for="(point, index) in validationDataset"
          :key="`validation-${point.x}-${point.y}-${index}`"
          :cx="map(point.x)"
          :cy="canvasSize - map(point.y)"
          r="5"
          :class="[
            point.label === 1 ? 'dataset-point dataset-point--positive' : 'dataset-point dataset-point--negative',
            'dataset-point--validation',
          ]"
        />
      </svg>
    </div>

    <div
      v-if="props.slug === 'mlp'"
      class="hidden-panel"
      :class="{ 'is-emphasis': props.focusTarget === 'hidden' }"
    >
      <header>
        <span>h1 / h2</span>
      </header>
      <svg viewBox="0 0 180 180" class="hidden-panel__svg">
        <line x1="90" x2="90" y1="0" y2="180" class="hidden-panel__axis" />
        <line x1="0" x2="180" y1="90" y2="90" class="hidden-panel__axis" />
        <circle
          v-for="(point, index) in hiddenPoints"
          :key="`${point.h1}-${point.h2}-${index}`"
          :cx="hiddenMap(point.h1)"
          :cy="180 - hiddenMap(point.h2)"
          r="4"
          :class="[
            point.label === 1 ? 'dataset-point dataset-point--positive' : 'dataset-point dataset-point--negative',
            point.split === 'validation' ? 'dataset-point--validation' : '',
          ]"
        />
      </svg>
    </div>
  </div>
</template>
