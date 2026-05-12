<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LearningPathMap from '../components/LearningPathMap.vue'
import SkillRadarChart from '../components/SkillRadarChart.vue'
import { mathLabModules } from '../data/modules'
import type { MathLabLocale, MathLabProgress } from '../types/mathLab'
import { loadMathLabProgress } from '../utils/progress'

const { locale } = useI18n()
const progress = ref<MathLabProgress>(loadMathLabProgress())
const currentLocale = computed(() => locale.value as MathLabLocale)

const copy = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: 'Math Intuition Lab',
        title: 'AI 数学直觉实验室',
        subtitle:
          '从向量矩阵到 Transformer，用双语讲解、公式渲染、可视化和互动实验串起 AI 前置数学直觉。',
        diagnostic: '开始入门诊断',
        continue: '继续学习',
        pathTitle: '第 6-24 章 AI 数学主线',
        pathBody: '路径把 shape、自动微分、概率损失、训练诊断和深度结构数学插入原数值计算地基中。',
        radarTitle: '当前数学地基',
        radarEmpty: '完成诊断后，这里会显示线性代数、微积分、概率和优化的准备度。',
      }
    : {
        eyebrow: 'Math Intuition Lab',
        title: 'AI Math Intuition Lab',
        subtitle:
          'A chapter path from vectors and matrices to Transformers, with bilingual explanations, math rendering, visualizations, and interactive labs.',
        diagnostic: 'Start diagnostic',
        continue: 'Continue learning',
        pathTitle: 'AI math path: chapters 6-24',
        pathBody: 'The path inserts shape, autodiff, probability losses, training diagnostics, and deep architecture math into the numerical foundation.',
        radarTitle: 'Current foundation',
        radarEmpty: 'After the diagnostic, this panel shows your linear algebra, calculus, probability, and optimization readiness.',
      },
)

const continueRoute = computed(() => {
  const preferred = progress.value.lastVisitedModuleId
    ?? progress.value.diagnosticResult?.recommendedStartModuleId
    ?? mathLabModules[0]?.id
    ?? 'taylor-series'
  return `/math-lab/modules/${preferred}`
})
</script>

<template>
  <div class="math-lab-page">
    <section class="math-lab-hero math-lab-hero--foundations">
      <div class="math-lab-hero__copy">
        <span class="eyebrow">{{ copy.eyebrow }}</span>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.subtitle }}</p>
        <div class="hero__actions">
          <router-link class="action-button action-button--primary" to="/math-lab/diagnostic">
            {{ copy.diagnostic }}
          </router-link>
          <router-link class="action-button" :to="continueRoute">
            {{ copy.continue }}
          </router-link>
        </div>
      </div>

      <div class="math-lab-hero__visual math-lab-hero__visual--course" aria-hidden="true">
        <div class="course-plane">
          <span v-for="moduleDefinition in mathLabModules.slice(0, 8)" :key="moduleDefinition.id">
            {{ moduleDefinition.order }}
          </span>
        </div>
      </div>
    </section>

    <section class="math-lab-dashboard">
      <article class="math-lab-panel">
        <header class="section-header">
          <span class="eyebrow">{{ currentLocale === 'zh-CN' ? '路径' : 'Path' }}</span>
          <h2>{{ copy.pathTitle }}</h2>
          <p>{{ copy.pathBody }}</p>
        </header>
        <LearningPathMap
          :modules="mathLabModules"
          :completed-module-ids="progress.completedModuleIds"
          :locale="currentLocale"
        />
      </article>

      <article class="math-lab-panel math-lab-panel--radar">
        <header>
          <span>{{ currentLocale === 'zh-CN' ? '诊断结果' : 'Diagnostic result' }}</span>
          <strong>{{ copy.radarTitle }}</strong>
        </header>
        <SkillRadarChart :result="progress.diagnosticResult" :locale="currentLocale" />
        <p v-if="!progress.diagnosticResult">{{ copy.radarEmpty }}</p>
      </article>
    </section>
  </div>
</template>
