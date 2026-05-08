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
        title: '数学直觉实验室',
        subtitle:
          '从泰勒级数到 PCA，完整迁移数值数学讲义，并配合本站的公式渲染、图片、本地实验和双语阅读体验。',
        diagnostic: '开始入门诊断',
        continue: '继续学习',
        pathTitle: '第 6-19 章完整学习路径',
        pathBody: '保留原讲义的教学内容、公式、代码、表格、图片、答案折叠区和复习问题；前 1-5 个预备主题不显示在本路径中。',
        radarTitle: '当前数学地基',
        radarEmpty: '完成诊断后，这里会显示线性代数、微积分、概率和优化的准备度。',
      }
    : {
        eyebrow: 'Math Intuition Lab',
        title: 'Numerical Math Notes',
        subtitle:
          'A full chapter path from Taylor series to PCA, adapted into this site with math rendering, local images, labs, and bilingual reading.',
        diagnostic: 'Start diagnostic',
        continue: 'Continue learning',
        pathTitle: 'Complete path: chapters 6-19',
        pathBody: 'The migrated notes preserve full teaching content, formulas, code, tables, figures, answer details, and review questions while omitting topics 1-5.',
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
