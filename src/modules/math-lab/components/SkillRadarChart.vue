<script setup lang="ts">
import { computed } from 'vue'
import type { DiagnosticResult, MathLabLocale } from '../types/mathLab'

const props = defineProps<{
  result?: DiagnosticResult
  locale: MathLabLocale
}>()

const dimensions = computed(() => [
  {
    key: 'linearAlgebra',
    label: props.locale === 'zh-CN' ? '线性代数' : 'Linear algebra',
    value: props.result?.linearAlgebra ?? 0,
  },
  {
    key: 'calculus',
    label: props.locale === 'zh-CN' ? '微积分' : 'Calculus',
    value: props.result?.calculus ?? 0,
  },
  {
    key: 'probability',
    label: props.locale === 'zh-CN' ? '概率' : 'Probability',
    value: props.result?.probability ?? 0,
  },
  {
    key: 'optimization',
    label: props.locale === 'zh-CN' ? '优化' : 'Optimization',
    value: props.result?.optimization ?? 0,
  },
])

const polygon = computed(() =>
  dimensions.value
    .map((dimension, index) => {
      const angle = -Math.PI / 2 + (Math.PI * 2 * index) / dimensions.value.length
      const radius = 18 + dimension.value * 78
      return `${110 + Math.cos(angle) * radius},${110 + Math.sin(angle) * radius}`
    })
    .join(' '),
)
</script>

<template>
  <section class="math-skill-radar">
    <svg viewBox="0 0 220 220" role="img">
      <circle cx="110" cy="110" r="96" />
      <circle cx="110" cy="110" r="64" />
      <circle cx="110" cy="110" r="32" />
      <line x1="110" y1="14" x2="110" y2="206" />
      <line x1="14" y1="110" x2="206" y2="110" />
      <polygon :points="polygon" />
    </svg>

    <div class="math-skill-radar__legend">
      <article v-for="dimension in dimensions" :key="dimension.key">
        <span>{{ dimension.label }}</span>
        <strong>{{ Math.round(dimension.value * 100) }}%</strong>
      </article>
    </div>
  </section>
</template>
