<script setup lang="ts">
import ReferenceExample from '../../../components/ReferenceExample.vue'
import type { MathLabLocale, MathLabModuleId, QuizItem } from '../types/mathLab'

defineProps<{
  moduleId: MathLabModuleId
  quizzes: QuizItem[]
  locale: MathLabLocale
}>()

</script>

<template>
  <section class="reference-examples math-checkpoint">
    <h2>{{ locale === 'zh-CN' ? '例题与讲解' : 'Examples and explanations' }}</h2>
    <ReferenceExample v-for="quiz in quizzes" :key="quiz.id" :example="quiz" :locale="locale" :revisit="quiz.revisitVisualId ? `#${quiz.revisitVisualId}` : undefined" />
  </section>
</template>
