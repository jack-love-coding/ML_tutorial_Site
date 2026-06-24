<script setup lang="ts">
import { computed } from 'vue'
import { useCartesianViewport } from '../../composables/useCartesianViewport'

const props = withDefaults(defineProps<{
  label: string
  width?: number
  height?: number
  xMin?: number
  xMax?: number
  yMin?: number
  yMax?: number
  showGrid?: boolean
}>(), {
  width: 420,
  height: 320,
  xMin: -3,
  xMax: 3,
  yMin: -3,
  yMax: 3,
  showGrid: true,
})

const viewportOptions = computed(() => ({
  width: props.width,
  height: props.height,
  xMin: props.xMin,
  xMax: props.xMax,
  yMin: props.yMin,
  yMax: props.yMax,
}))
const plane = useCartesianViewport(viewportOptions)
const viewBox = computed(() => `0 0 ${props.width} ${props.height}`)
const xTicks = plane.xTicks
const yTicks = plane.yTicks
const viewport = plane.viewport
</script>

<template>
  <svg
    class="interactive-plane"
    :viewBox="viewBox"
    role="img"
    :aria-label="label"
  >
    <g v-if="showGrid" class="interactive-plane__grid" aria-hidden="true">
      <line
        v-for="tick in xTicks"
        :key="`x-${tick}`"
        :x1="plane.toSvg({ x: tick, y: yMin }).x"
        :y1="plane.toSvg({ x: tick, y: yMin }).y"
        :x2="plane.toSvg({ x: tick, y: yMax }).x"
        :y2="plane.toSvg({ x: tick, y: yMax }).y"
      />
      <line
        v-for="tick in yTicks"
        :key="`y-${tick}`"
        :x1="plane.toSvg({ x: xMin, y: tick }).x"
        :y1="plane.toSvg({ x: xMin, y: tick }).y"
        :x2="plane.toSvg({ x: xMax, y: tick }).x"
        :y2="plane.toSvg({ x: xMax, y: tick }).y"
      />
    </g>

    <g class="interactive-plane__axes" aria-hidden="true">
      <line
        :x1="plane.toSvg({ x: xMin, y: 0 }).x"
        :y1="plane.toSvg({ x: xMin, y: 0 }).y"
        :x2="plane.toSvg({ x: xMax, y: 0 }).x"
        :y2="plane.toSvg({ x: xMax, y: 0 }).y"
      />
      <line
        :x1="plane.toSvg({ x: 0, y: yMin }).x"
        :y1="plane.toSvg({ x: 0, y: yMin }).y"
        :x2="plane.toSvg({ x: 0, y: yMax }).x"
        :y2="plane.toSvg({ x: 0, y: yMax }).y"
      />
    </g>

    <slot
      :to-svg="plane.toSvg"
      :from-svg="plane.fromSvg"
      :clamp-point="plane.clampPoint"
      :viewport="viewport"
    />
  </svg>
</template>

<style scoped>
.interactive-plane {
  display: block;
  width: 100%;
  min-height: 320px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
  touch-action: none;
}

.interactive-plane__grid line {
  stroke: rgba(16, 22, 47, 0.1);
  stroke-width: 1;
}

.interactive-plane__axes line {
  stroke: rgba(16, 22, 47, 0.32);
  stroke-width: 2;
}
</style>
