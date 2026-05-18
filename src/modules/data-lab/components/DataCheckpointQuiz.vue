<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import type {
  DataLabLocale,
  DataLabModuleId,
  DataQuizAttempt,
  DataQuizItem,
} from '../types/dataLab'
import { buildDataQuizAttempt, evaluateDataQuizAnswer } from '../utils/quiz'

const props = defineProps<{
  moduleId: DataLabModuleId
  quizzes: DataQuizItem[]
  locale: DataLabLocale
}>()

const emit = defineEmits<{
  submit: [attempts: DataQuizAttempt[]]
}>()

const answers = reactive<Record<string, string>>({})
const submitted = ref(false)

const evaluations = computed(() =>
  Object.fromEntries(
    props.quizzes.map((quiz) => [quiz.id, evaluateDataQuizAnswer(quiz, answers[quiz.id] ?? '')]),
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
    props.quizzes.map((quiz) => buildDataQuizAttempt(props.moduleId, quiz, answers[quiz.id] ?? '')),
  )
}
</script>

<template>
  <section class="data-lab-panel data-checkpoint">
    <header>
      <span>{{ locale === 'zh-CN' ? '即时检测' : 'Checkpoint' }}</span>
      <strong>
        {{
          submitted
            ? locale === 'zh-CN'
              ? `答对 ${summary.correct}/${summary.total}`
              : `${summary.correct}/${summary.total} correct`
            : locale === 'zh-CN'
              ? '提交后查看反馈'
              : 'Submit to get feedback'
        }}
      </strong>
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

        <div
          v-if="submitted"
          class="data-checkpoint__feedback"
          :class="{ 'is-correct': evaluations[quiz.id]?.correct }"
        >
          <strong>
            {{
              evaluations[quiz.id]?.correct
                ? locale === 'zh-CN'
                  ? '正确'
                  : 'Correct'
                : locale === 'zh-CN'
                  ? '需要复看'
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

