<script setup lang="ts">
import { computed } from 'vue'
import type { PlotPoint } from '../types/ml'

interface CurveSpec {
  id: string
  label: string
  color: string
  points: PlotPoint[]
}

const props = defineProps<{
  curves: CurveSpec[]
  markerX?: number
  markerPoints?: Array<{ id: string; x: number; y: number; color: string }>
  width?: number
  height?: number
}>()

const width = computed(() => props.width ?? 520)
const height = computed(() => props.height ?? 240)
const padding = 24

const bounds = computed(() => {
  const allPoints = props.curves.flatMap((curve) => curve.points)
  if (!allPoints.length) {
    return {
      minX: 0,
      maxX: 1,
      minY: 0,
      maxY: 1,
    }
  }

  const xValues = allPoints.map((point) => point.x)
  const yValues = allPoints.map((point) => point.y)
  const minY = Math.min(...yValues)
  const maxY = Math.max(...yValues)
  const yPadding = (maxY - minY || 1) * 0.08

  return {
    minX: Math.min(...xValues),
    maxX: Math.max(...xValues),
    minY: minY - yPadding,
    maxY: maxY + yPadding,
  }
})

function mapX(value: number) {
  const range = bounds.value.maxX - bounds.value.minX || 1
  return padding + ((value - bounds.value.minX) / range) * (width.value - padding * 2)
}

function mapY(value: number) {
  const range = bounds.value.maxY - bounds.value.minY || 1
  return height.value - padding - ((value - bounds.value.minY) / range) * (height.value - padding * 2)
}

function buildPolyline(points: PlotPoint[]) {
  return points.map((point) => `${mapX(point.x)},${mapY(point.y)}`).join(' ')
}
</script>

<template>
  <div class="loss-curve-plot">
    <svg :viewBox="`0 0 ${width} ${height}`" class="loss-curve-plot__svg" role="img" aria-label="loss curve">
      <line :x1="padding" :x2="width - padding" :y1="height - padding" :y2="height - padding" class="chart-axis" />
      <line :x1="padding" :x2="padding" :y1="padding" :y2="height - padding" class="chart-axis" />

      <line
        v-if="props.markerX !== undefined"
        :x1="mapX(props.markerX)"
        :x2="mapX(props.markerX)"
        :y1="padding"
        :y2="height - padding"
        class="chart-cursor"
      />

      <polyline
        v-for="curve in props.curves"
        :key="curve.id"
        :points="buildPolyline(curve.points)"
        class="loss-curve-plot__line"
        :style="{ stroke: curve.color }"
      />

      <circle
        v-for="marker in props.markerPoints ?? []"
        :key="marker.id"
        :cx="mapX(marker.x)"
        :cy="mapY(marker.y)"
        r="5.5"
        class="loss-curve-plot__dot"
        :style="{ fill: marker.color }"
      />
    </svg>

    <div class="loss-curve-plot__legend">
      <span v-for="curve in props.curves" :key="curve.id">
        <i :style="{ background: curve.color }" />
        {{ curve.label }}
      </span>
    </div>
  </div>
</template>
