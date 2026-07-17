<script setup lang="ts">
import { reactive } from 'vue'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import type { MathLabLocale, MathLabModuleId, QuizItem } from '../types/mathLab'

defineProps<{
  moduleId: MathLabModuleId
  quizzes: QuizItem[]
  locale: MathLabLocale
}>()

const answers = reactive<Record<string, string | number>>({})
</script>

<template>
  <section class="math-checkpoint">
    <header>
      <span>{{ locale === 'zh-CN' ? '理解回顾 · 不计分' : 'Concept review · Not graded' }}</span>
      <strong>{{ locale === 'zh-CN' ? '作答后立即对照讲解' : 'Compare with the explanation after answering' }}</strong>
    </header>

    <div class="math-checkpoint__list">
      <article v-for="quiz in quizzes" :key="quiz.id" class="math-checkpoint__item">
        <MarkdownMathContent :source="quiz.prompt[locale]" />

        <div v-if="quiz.choices?.length" class="math-checkpoint__choices">
          <label v-for="choice in quiz.choices" :key="choice.id">
            <input v-model="answers[quiz.id]" type="radio" :name="quiz.id" :value="choice.id" />
            <MarkdownMathContent :source="choice.label[locale]" />
          </label>
        </div>

        <label v-else class="math-checkpoint__numeric">
          <input
            v-model="answers[quiz.id]"
            type="number"
            step="0.001"
            :placeholder="locale === 'zh-CN' ? '输入你的结果' : 'Enter your result'"
          />
        </label>

        <div v-if="answers[quiz.id] !== undefined && answers[quiz.id] !== ''" class="math-checkpoint__feedback">
          <strong>{{ locale === 'zh-CN' ? '参考思路' : 'Reference explanation' }}</strong>
          <MarkdownMathContent :source="quiz.explanation[locale]" />
          <a v-if="quiz.revisitVisualId" :href="`#${quiz.revisitVisualId}`" class="math-checkpoint__revisit-link">
            {{ locale === 'zh-CN' ? '回看相关章节或实验' : 'Review the related section or lab' }}
          </a>
        </div>
      </article>
    </div>
  </section>
</template>
