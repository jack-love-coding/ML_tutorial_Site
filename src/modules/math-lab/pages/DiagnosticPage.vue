<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import SkillRadarChart from '../components/SkillRadarChart.vue'
import { diagnosticQuestions, scoreDiagnostic } from '../data/diagnostic'
import { mathLabModuleRegistry } from '../data/modules'
import type { DiagnosticDimension, DiagnosticResult, MathLabLocale } from '../types/mathLab'
import {
  loadMathLabProgress,
  saveMathLabProgress,
  setDiagnosticResult,
} from '../utils/progress'

const router = useRouter()
const { locale } = useI18n()
const currentLocale = computed(() => locale.value as MathLabLocale)
const answers = reactive<Record<string, string>>({})
const result = ref<DiagnosticResult>()
const dimensionLabels: Record<DiagnosticDimension, Record<MathLabLocale, string>> = {
  linearAlgebra: { 'zh-CN': '线性代数', en: 'Linear algebra' },
  calculus: { 'zh-CN': '微积分', en: 'Calculus' },
  probability: { 'zh-CN': '概率', en: 'Probability' },
  optimization: { 'zh-CN': '优化', en: 'Optimization' },
}

const copy = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: 'Diagnostic',
        title: '入门诊断',
        subtitle: '这不是考试。目标是决定你该从泰勒级数、蒙特卡洛、线性代数还是优化章节开始补地基。',
        submit: '生成推荐路径',
        start: '进入推荐章节',
        result: '诊断结果',
        waiting: '等待答题',
        recommendPrefix: '建议从',
        recommendSuffix: '开始',
      }
    : {
        eyebrow: 'Diagnostic',
        title: 'Entry Diagnostic',
        subtitle: 'This is not an exam. The goal is to decide whether you should start with Taylor series, Monte Carlo, linear algebra, or optimization.',
        submit: 'Generate recommendation',
        start: 'Open recommended chapter',
        result: 'Diagnostic result',
        waiting: 'Waiting for answers',
        recommendPrefix: 'Start with',
        recommendSuffix: '',
      },
)

function submit() {
  result.value = scoreDiagnostic(answers)
  const progress = setDiagnosticResult(loadMathLabProgress(), result.value)
  saveMathLabProgress(progress)
}

function openRecommended() {
  if (!result.value) return
  router.push(`/math-lab/modules/${result.value.recommendedStartModuleId}`)
}

const recommendedModuleTitle = computed(() => {
  if (!result.value) return ''
  return mathLabModuleRegistry[result.value.recommendedStartModuleId]?.title[currentLocale.value] ?? ''
})
</script>

<template>
  <div class="math-lab-page">
    <section class="math-lab-compact-hero">
      <span class="eyebrow">{{ copy.eyebrow }}</span>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.subtitle }}</p>
    </section>

    <section class="math-diagnostic-layout">
      <form class="math-diagnostic-form" @submit.prevent="submit">
        <article v-for="question in diagnosticQuestions" :key="question.id" class="math-diagnostic-question">
          <span>{{ dimensionLabels[question.dimension][currentLocale] }}</span>
          <strong>{{ question.prompt[currentLocale] }}</strong>
          <label v-for="choice in question.choices" :key="choice.id">
            <input v-model="answers[question.id]" type="radio" :name="question.id" :value="choice.id" />
            <span>{{ choice.label[currentLocale] }}</span>
          </label>
        </article>

        <button type="submit" class="action-button action-button--primary">
          {{ copy.submit }}
        </button>
      </form>

      <aside class="math-lab-panel math-lab-panel--sticky">
        <header>
          <span>{{ copy.result }}</span>
          <strong>
            {{
              result
                ? currentLocale === 'zh-CN'
                  ? `${copy.recommendPrefix} ${recommendedModuleTitle} ${copy.recommendSuffix}`
                  : `${copy.recommendPrefix} ${recommendedModuleTitle}`
                : copy.waiting
            }}
          </strong>
        </header>
        <SkillRadarChart :result="result" :locale="currentLocale" />
        <button
          v-if="result"
          type="button"
          class="action-button action-button--primary"
          @click="openRecommended"
        >
          {{ copy.start }}
        </button>
      </aside>
    </section>
  </div>
</template>
