<script setup lang="ts">
import type { MathLabLocale, Misconception } from '../types/mathLab'

defineProps<{
  misconception: Misconception
  locale: MathLabLocale
}>()
</script>

<template>
  <article class="math-misconception-card">
    <span>{{ locale === 'zh-CN' ? '常见误区' : 'Common misconception' }}</span>
    <strong>{{ misconception.statement[locale] }}</strong>
    <p>{{ misconception.correction[locale] }}</p>
    <small>{{ misconception.example[locale] }}</small>
  </article>
</template>
