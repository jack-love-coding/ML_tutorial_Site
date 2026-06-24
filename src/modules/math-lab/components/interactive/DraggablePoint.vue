<script setup lang="ts">
import { computed } from 'vue'
import { useKeyboardNudge } from '../../composables/useKeyboardNudge'
import { usePointerDrag } from '../../composables/usePointerDrag'
import type { SvgPoint } from '../../composables/useCartesianViewport'
import type { Vector2 } from '../../utils/math'

const props = withDefaults(defineProps<{
  point: Vector2
  label: string
  toSvg: (point: Vector2) => SvgPoint
  fromSvg: (point: SvgPoint) => Vector2
  radius?: number
  nudgeStep?: number
  className?: string
}>(), {
  radius: 8,
  nudgeStep: 0.1,
  className: '',
})

const emit = defineEmits<{
  'update:point': [point: Vector2]
}>()

const svgPoint = computed(() => props.toSvg(props.point))
const valueText = computed(() => `(${props.point.x.toFixed(2)}, ${props.point.y.toFixed(2)})`)

function eventToSvgPoint(event: PointerEvent): SvgPoint | null {
  const target = event.currentTarget as SVGGraphicsElement | null
  const svg = target?.ownerSVGElement
  if (!svg) return null

  const rect = svg.getBoundingClientRect()
  const viewBox = svg.viewBox.baseVal
  const x = viewBox.x + ((event.clientX - rect.left) / rect.width) * viewBox.width
  const y = viewBox.y + ((event.clientY - rect.top) / rect.height) * viewBox.height
  return { x, y }
}

const drag = usePointerDrag({
  onDrag(event) {
    const nextPoint = eventToSvgPoint(event)
    if (nextPoint) emit('update:point', props.fromSvg(nextPoint))
  },
})
const dragging = drag.dragging

const keyboard = useKeyboardNudge({
  step: props.nudgeStep,
  shiftStep: props.nudgeStep * 5,
  onNudge(delta) {
    emit('update:point', {
      x: props.point.x + delta.x,
      y: props.point.y + delta.y,
    })
  },
})
</script>

<template>
  <circle
    :class="['draggable-point', className, { 'is-dragging': dragging }]"
    :cx="svgPoint.x"
    :cy="svgPoint.y"
    :r="radius"
    tabindex="0"
    role="button"
    :aria-label="`${label} ${valueText}`"
    @pointerdown="drag.onPointerDown"
    @pointermove="drag.onPointerMove"
    @pointerup="drag.onPointerUp"
    @pointercancel="drag.onPointerCancel"
    @keydown="keyboard.onKeydown"
  >
    <title>{{ label }} {{ valueText }}</title>
  </circle>
</template>

<style scoped>
.draggable-point {
  cursor: grab;
  fill: #ffd84d;
  stroke: #10162f;
  stroke-width: 2.5;
  outline: none;
  touch-action: none;
}

.draggable-point:hover,
.draggable-point:focus-visible {
  stroke-width: 4;
}

.draggable-point.is-dragging {
  cursor: grabbing;
}
</style>
