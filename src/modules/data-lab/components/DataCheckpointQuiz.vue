<script setup lang="ts">
import { reactive } from 'vue'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import type { DataLabLocale, DataLabModuleId, DataQuizItem } from '../types/dataLab'

defineProps<{
  moduleId: DataLabModuleId
  quizzes: DataQuizItem[]
  locale: DataLabLocale
}>()

const answers = reactive<Record<string, string>>({})
</script>

<template>
  <section class="data-lab-panel data-checkpoint">
    <header>
      <span>{{ locale === 'zh-CN' ? '理解回顾 · 不计分' : 'Concept review · Not graded' }}</span>
      <strong>{{ locale === 'zh-CN' ? '选择后立即对照讲解' : 'Compare with the explanation after selection' }}</strong>
    </header>

    <div class="data-checkpoint__list">
      <article v-for="quiz in quizzes" :key="quiz.id" class="data-checkpoint__item">
        <MarkdownMathContent :source="quiz.prompt[locale]" />

        <div class="data-checkpoint__choices">
          <label v-for="choice in quiz.choices" :key="choice.id">
            <input v-model="answers[quiz.id]" type="radio" :name="quiz.id" :value="choice.id" />
            <MarkdownMathContent :source="choice.label[locale]" />
          </label>
        </div>

        <div v-if="answers[quiz.id]" class="data-checkpoint__feedback">
          <strong>{{ locale === 'zh-CN' ? '参考思路' : 'Reference explanation' }}</strong>
          <MarkdownMathContent :source="quiz.explanation[locale]" />
        </div>
      </article>
    </div>
  </section>
</template>
