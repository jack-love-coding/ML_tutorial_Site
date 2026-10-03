<script setup lang="ts">
import ReferenceExample from '../../../components/ReferenceExample.vue'
import type { DataLabLocale, DataLabModuleId, DataQuizItem } from '../types/dataLab'

defineProps<{
  moduleId: DataLabModuleId
  quizzes: DataQuizItem[]
  locale: DataLabLocale
}>()

</script>

<template>
  <section class="reference-examples data-checkpoint">
    <h2>{{ locale === 'zh-CN' ? '例题与讲解' : 'Examples and explanations' }}</h2>
    <ReferenceExample v-for="quiz in quizzes" :key="quiz.id" :example="quiz" :locale="locale" />
  </section>
</template>
