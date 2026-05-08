<script setup lang="ts" generic="TParams">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { ThreeSceneController } from '../types/mathLab'

const props = defineProps<{
  controller: ThreeSceneController<TParams>
  params?: TParams
  label: string
}>()

const containerRef = ref<HTMLElement | null>(null)

onMounted(() => {
  if (containerRef.value) {
    props.controller.mount(containerRef.value)
    props.controller.update?.(props.params as TParams)
  }
})

watch(
  () => props.params,
  (value) => props.controller.update?.(value as TParams),
  { deep: true },
)

onBeforeUnmount(() => {
  props.controller.dispose()
})
</script>

<template>
  <div ref="containerRef" class="three-scene-shell" :aria-label="label" />
</template>
