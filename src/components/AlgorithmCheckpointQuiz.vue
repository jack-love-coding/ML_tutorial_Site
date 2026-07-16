<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import MarkdownMathContent from './MarkdownMathContent.vue'
import type { AlgorithmCheckpointItem, AlgorithmQuizAttempt, AppLocale, ModuleSlug } from '../types/ml'
import { buildAlgorithmQuizAttempt, evaluateAlgorithmCheckpointAnswer } from '../utils/algorithmQuiz'

const props = withDefaults(defineProps<{
  moduleSlug: ModuleSlug
  moduleRoute: string
  checkpoints: AlgorithmCheckpointItem[]
  locale: AppLocale
  completed: boolean
  mode?: 'scored' | 'formative' | 'course-review'
}>(), {
  mode: 'scored',
})

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
  if (
    props.moduleSlug === 'linear-regression'
    || props.moduleSlug === 'logistic-regression'
    || props.moduleSlug === 'python-notebook'
  ) {
    return `/learn/${props.moduleSlug}/${checkpoint.revisitChapterId}`
  }

  return {
    path: props.moduleRoute,
    hash: `#${checkpoint.revisitChapterId}`,
  }
}

function submit() {
  if (props.mode === 'formative') return
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
        <span>
          {{
            mode === 'course-review'
              ? locale === 'zh-CN' ? '课程回顾' : 'Course Review'
              : mode === 'formative'
              ? locale === 'zh-CN' ? '形成性 checkpoint' : 'Formative checkpoint'
              : locale === 'zh-CN' ? '模块 checkpoint' : 'Module checkpoint'
          }}
        </span>
        <h2>
          {{
            mode === 'course-review'
              ? locale === 'zh-CN' ? '回看分组分析与相关性的解释边界' : 'Review grouped analysis and the limits of correlation'
              : mode === 'formative'
              ? locale === 'zh-CN' ? '选择后立即查看解释与易混误区' : 'Choose an answer to reveal the explanation and misconceptions'
              : locale === 'zh-CN' ? '完成前确认你真的看懂了' : 'Confirm the module clicked before moving on'
          }}
        </h2>
      </div>
      <strong v-if="mode === 'scored'" :class="{ 'is-complete': completed }">
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
          v-if="submitted || (mode === 'formative' && answers[checkpoint.id])"
          class="algorithm-checkpoint__feedback"
          :class="{ 'is-correct': mode === 'scored' && evaluations[checkpoint.id]?.correct }"
        >
          <div>
            <strong>
              {{
                mode === 'course-review'
                  ? locale === 'zh-CN' ? '参考解释' : 'Explanation'
                  : mode === 'formative'
                  ? locale === 'zh-CN' ? '解释与误区' : 'Explanation and misconceptions'
                  : evaluations[checkpoint.id]?.correct
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
          <ul v-if="mode === 'formative'" class="algorithm-checkpoint__misconception-tags" aria-label="Misconception tags">
            <li v-for="tag in checkpoint.misconceptionTags" :key="tag">{{ tag }}</li>
          </ul>
        </div>
      </article>
    </div>

    <button v-if="mode !== 'formative'" type="button" class="action-button action-button--primary" @click="submit">
      {{
        mode === 'course-review'
          ? locale === 'zh-CN' ? '提交回顾' : 'Submit review'
          : locale === 'zh-CN' ? '提交检测' : 'Submit checkpoint'
      }}
    </button>
  </section>
</template>
