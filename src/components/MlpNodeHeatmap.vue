<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'

const props = defineProps<{
  values: number[]
  gridSize: number
  discretize?: boolean
  compact?: boolean
}>()

const canvasRef = ref<HTMLCanvasElement>()

function colorForValue(rawValue: number) {
  const value = props.discretize ? (rawValue >= 0 ? 1 : -1) : Math.max(-1, Math.min(1, rawValue))
  const t = (value + 1) / 2
  const red = Math.round(244 - t * 172)
  const green = Math.round(132 + t * 44)
  const blue = Math.round(82 + t * 112)
  return `rgb(${red}, ${green}, ${blue})`
}

function draw() {
  const canvas = canvasRef.value
  const context = canvas?.getContext('2d')
  if (!canvas || !context || !props.values.length || !props.gridSize) return

  const size = props.compact ? 34 : 44
  if (canvas.width !== size || canvas.height !== size) {
    canvas.width = size
    canvas.height = size
  }

  context.clearRect(0, 0, size, size)
  const cell = size / props.gridSize

  for (let row = 0; row < props.gridSize; row += 1) {
    for (let column = 0; column < props.gridSize; column += 1) {
      context.fillStyle = colorForValue(props.values[row * props.gridSize + column] ?? 0)
      context.fillRect(column * cell, row * cell, Math.ceil(cell), Math.ceil(cell))
    }
  }
}

onMounted(draw)
watch(() => [props.values, props.gridSize, props.discretize, props.compact], draw, { deep: true })
</script>

<template>
  <canvas ref="canvasRef" class="mlp-node-heatmap" :class="{ 'mlp-node-heatmap--compact': props.compact }" />
</template>

