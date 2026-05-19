<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MarkdownMathContent from './MarkdownMathContent.vue'
import type { AlgorithmCheckpointItem, AlgorithmQuizAttempt, AppLocale, ModuleSlug } from '../types/ml'
import { buildAlgorithmQuizAttempt, evaluateAlgorithmCheckpointAnswer } from '../utils/algorithmQuiz'

const props = defineProps<{
  moduleSlug: ModuleSlug
  moduleRoute: string
  checkpoints: AlgorithmCheckpointItem[]
  locale: AppLocale
  completed: boolean
}>()

const emit = defineEmits<{
  submit: [attempts: AlgorithmQuizAttempt[]]
}>()

const answers = reactive<Record<string, string>>({})
const submitted = ref(false)

const evaluations = computed(() =>
  Object.fromEntries(
    props.checkpoints.map((checkpoint) => [
      checkpoint.id,
      evaluateAlgorithmCheckpointAnswer(checkpoint, answers[checkpoint.id] ?? ''),
    ]),
  ),
)

const summary = computed(() => {
  const correct = props.checkpoints.filter((checkpoint) => evaluations.value[checkpoint.id]?.correct).length
  return {
    correct,
    total: props.checkpoints.length,
  }
})

function revisitRoute(checkpoint: AlgorithmCheckpointItem) {
  if (props.moduleSlug === 'linear-regression' || props.moduleSlug === 'logistic-regression') {
    return `/learn/${props.moduleSlug}/${checkpoint.revisitChapterId}`
  }

  return {
    path: props.moduleRoute,
    hash: `#${checkpoint.revisitChapterId}`,
  }
}

function submit() {
  submitted.value = true
  emit(
    'submit',
    props.checkpoints.map((checkpoint) =>
      buildAlgorithmQuizAttempt(props.moduleSlug, checkpoint, answers[checkpoint.id] ?? ''),
    ),
  )
}
</script>

<template>
  <section class="algorithm-checkpoint">
    <header class="algorithm-checkpoint__header">
      <div>
        <span>{{ locale === 'zh-CN' ? '模块 checkpoint' : 'Module checkpoint' }}</span>
        <h2>{{ locale === 'zh-CN' ? '完成前确认你真的看懂了' : 'Confirm the module clicked before moving on' }}</h2>
      </div>
      <strong :class="{ 'is-complete': completed }">
        {{
          completed
            ? locale === 'zh-CN'
              ? '算法已完成'
              : 'Completed'
            : submitted
              ? locale === 'zh-CN'
                ? `答对 ${summary.correct}/${summary.total}`
                : `${summary.correct}/${summary.total} correct`
              : locale === 'zh-CN'
                ? '提交后查看误区反馈'
                : 'Submit to get misconception feedback'
        }}
      </strong>
    </header>

    <div class="algorithm-checkpoint__list">
      <article v-for="checkpoint in checkpoints" :key="checkpoint.id" class="algorithm-checkpoint__item">
        <MarkdownMathContent :source="checkpoint.prompt[locale]" />

        <div class="algorithm-checkpoint__choices">
          <label v-for="choice in checkpoint.choices" :key="choice.id">
            <input v-model="answers[checkpoint.id]" type="radio" :name="checkpoint.id" :value="choice.id" />
            <MarkdownMathContent :source="choice.label[locale]" />
          </label>
        </div>

        <div
          v-if="submitted"
          class="algorithm-checkpoint__feedback"
          :class="{ 'is-correct': evaluations[checkpoint.id]?.correct }"
        >
          <div>
            <strong>
              {{
                evaluations[checkpoint.id]?.correct
                  ? locale === 'zh-CN'
                    ? '正确'
                    : 'Correct'
                  : locale === 'zh-CN'
                    ? '需要复看'
                    : 'Review needed'
              }}
            </strong>
            <router-link :to="revisitRoute(checkpoint)">
              {{ locale === 'zh-CN' ? '回看相关章节' : 'Revisit section' }}
            </router-link>
          </div>
          <MarkdownMathContent :source="checkpoint.explanation[locale]" />
        </div>
      </article>
    </div>

    <button type="button" class="action-button action-button--primary" @click="submit">
      {{ locale === 'zh-CN' ? '提交检测' : 'Submit checkpoint' }}
    </button>
  </section>
</template>
