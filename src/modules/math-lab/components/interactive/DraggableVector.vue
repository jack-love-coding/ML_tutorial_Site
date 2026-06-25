<script setup lang="ts">
import { computed } from 'vue'
import type { SvgPoint } from '../../composables/useCartesianViewport'
import type { Vector2 } from '../../utils/math'
import DraggablePoint from './DraggablePoint.vue'

const props = withDefaults(defineProps<{
  vector: Vector2
  label: string
  toSvg: (point: Vector2) => SvgPoint
  fromSvg: (point: SvgPoint) => Vector2
  origin?: Vector2
  markerId?: string
  className?: string
  nudgeStep?: number
}>(), {
  markerId: '',
  className: '',
  nudgeStep: 0.1,
})

const emit = defineEmits<{
  'update:vector': [vector: Vector2]
}>()

const origin = computed(() => props.origin ?? { x: 0, y: 0 })
const originSvg = computed(() => props.toSvg(origin.value))
const vectorSvg = computed(() => props.toSvg(props.vector))
const markerUrl = computed(() => (props.markerId ? `url(#${props.markerId})` : undefined))
</script>

<template>
  <g :class="['draggable-vector', className]">
    <line
      :x1="originSvg.x"
      :y1="originSvg.y"
      :x2="vectorSvg.x"
      :y2="vectorSvg.y"
      :marker-end="markerUrl"
    />
    <DraggablePoint
      :point="vector"
      :label="label"
      :to-svg="toSvg"
      :from-svg="fromSvg"
      :nudge-step="nudgeStep"
      class-name="draggable-vector__handle"
      @update:point="emit('update:vector', $event)"
    />
  </g>
</template>

<style scoped>
.draggable-vector line {
  stroke: currentColor;
  stroke-width: 3;
  stroke-linecap: round;
}

.draggable-vector {
  color: #3868ff;
}

.draggable-vector.basis--i {
  color: #3868ff;
}

.draggable-vector.basis--j {
  color: #0f9f7a;
}

.draggable-vector :deep(.draggable-vector__handle) {
  fill: #ffffff;
  stroke: currentColor;
}
</style>
