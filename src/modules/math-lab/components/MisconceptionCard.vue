<script setup lang="ts">
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
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
    <MarkdownMathContent class="math-misconception-card__body" :source="misconception.correction[locale]" />
    <MarkdownMathContent class="math-misconception-card__example" :source="misconception.example[locale]" />
  </article>
</template>
