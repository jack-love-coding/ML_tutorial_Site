<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import type { MathLabLocale, MathLabModuleId, QuizAttempt, QuizItem } from '../types/mathLab'
import { buildQuizAttempt, evaluateQuizAnswer } from '../utils/quiz'

const props = defineProps<{
  moduleId: MathLabModuleId
  quizzes: QuizItem[]
  locale: MathLabLocale
}>()

const emit = defineEmits<{
  submit: [attempts: QuizAttempt[]]
}>()

const answers = reactive<Record<string, string | number>>({})
const submitted = ref(false)

const evaluations = computed(() =>
  Object.fromEntries(
    props.quizzes.map((quiz) => [quiz.id, evaluateQuizAnswer(quiz, answers[quiz.id] ?? '')]),
  ),
)

const summary = computed(() => {
  const correct = props.quizzes.filter((quiz) => evaluations.value[quiz.id]?.correct).length
  return {
    correct,
    total: props.quizzes.length,
  }
})

function submit() {
  submitted.value = true
  emit(
    'submit',
    props.quizzes.map((quiz) => buildQuizAttempt(props.moduleId, quiz, answers[quiz.id] ?? '')),
  )
}
</script>

<template>
  <section class="math-checkpoint">
    <header>
      <span>{{ locale === 'zh-CN' ? '即时检测' : 'Checkpoint' }}</span>
      <strong>
        {{
          submitted
            ? locale === 'zh-CN'
              ? `答对 ${summary.correct}/${summary.total}`
              : `${summary.correct}/${summary.total} correct`
            : locale === 'zh-CN'
              ? '提交后查看误区反馈'
              : 'Submit to get misconception feedback'
        }}
      </strong>
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
            :placeholder="locale === 'zh-CN' ? '输入数值' : 'Enter value'"
          />
        </label>

        <div
          v-if="submitted"
          class="math-checkpoint__feedback"
          :class="{ 'is-correct': evaluations[quiz.id]?.correct }"
        >
          <strong>
            {{
              evaluations[quiz.id]?.correct
                ? locale === 'zh-CN'
                  ? '正确'
                  : 'Correct'
                : locale === 'zh-CN'
                  ? '需要回看'
                  : 'Review needed'
            }}
          </strong>
          <MarkdownMathContent :source="quiz.explanation[locale]" />
        </div>
      </article>
    </div>

    <button type="button" class="action-button action-button--primary" @click="submit">
      {{ locale === 'zh-CN' ? '提交检测' : 'Submit checkpoint' }}
    </button>
  </section>
</template>
