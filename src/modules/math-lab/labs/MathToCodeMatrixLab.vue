<script setup lang="ts">
import MatrixTransformLab from './MatrixTransformLab.vue'
import type { MathLabLocale } from '../types/mathLab'

defineProps<{
  locale?: MathLabLocale
}>()
</script>

<template>
  <MatrixTransformLab :locale="locale" symbol="A" :emit-evidence="false" />
</template>
