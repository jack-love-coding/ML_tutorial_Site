<script setup lang="ts">
import MarkdownMathContent from './MarkdownMathContent.vue'
import { referenceConclusion, type ExplainedQuestion } from '../utils/referenceExamples.ts'
import type { AppLocale } from '../types/ml.ts'
import type { RouteLocationRaw } from 'vue-router'

defineProps<{ example: ExplainedQuestion; locale: AppLocale; revisit?: RouteLocationRaw }>()
</script>

<template>
  <article :id="example.id" class="reference-example">
    <MarkdownMathContent :source="example.prompt[locale]" />
    <strong>{{ locale === 'zh-CN' ? '参考结论' : 'Reference conclusion' }}</strong>
    <MarkdownMathContent :source="referenceConclusion(example, locale)" />
    <MarkdownMathContent :source="example.explanation[locale]" />
    <router-link v-if="revisit" :to="revisit">{{ locale === 'zh-CN' ? '回看相关讲解' : 'Revisit the explanation' }}</router-link>
  </article>
</template>
