<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import LearningRouteDashboard from '../components/LearningRouteDashboard.vue'
import LearningPathMap from '../components/LearningPathMap.vue'
import SkillRadarChart from '../components/SkillRadarChart.vue'
import { learningRouteById } from '../data/learningRoutes'
import { aiMathPathModuleIds, mathLabModules } from '../data/modules'
import type { MathLabLocale, MathLabProgress } from '../types/mathLab'
import { continueMathLabModuleId } from '../utils/continueRoute'
import { loadMathLabProgress } from '../utils/progress'
import { withPublicBase } from '../../../utils/publicPath.ts'

const { locale } = useI18n()
const progress = ref<MathLabProgress>(loadMathLabProgress())
const currentLocale = computed(() => locale.value as MathLabLocale)
const linearAlgebraRoute = computed(() => learningRouteById['linear-algebra-route'])
const mathToCodePilotRoute = computed(() => learningRouteById['math-to-code-pilot'])
const aiMathPathModules = computed(() => {
  const ids = new Set(aiMathPathModuleIds)
  return mathLabModules.filter((moduleDefinition) => ids.has(moduleDefinition.id))
})

const copy = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: 'Math Intuition Lab',
        title: 'AI 数学直觉实验室',
        subtitle:
          '从向量矩阵到 Transformer，用双语讲解、公式渲染、可视化和互动实验串起 AI 前置数学直觉。',
        diagnostic: '开始入门诊断',
        continue: '继续学习',
        pathTitle: '31 章 AI 数学主线',
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
        pathTitle: 'AI math path: 31 chapters',
        pathBody: 'The path starts with zero-base linear algebra, calculus, and probability distributions, then moves into shape, autodiff, training diagnostics, and deep architecture math.',
        radarTitle: 'Current foundation',
        radarEmpty: 'After the diagnostic, this panel shows your linear algebra, calculus, probability, and optimization readiness.',
      },
)

const continueRoute = computed(() => `/math-lab/modules/${continueMathLabModuleId(progress.value)}`)

const beginnerBridgeCopy = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: '零基础导学',
        title: '先用三张图建立 AI 数学直觉',
        body:
          '如果你还没有学过大学数学，先按这个顺序走：把数据看成箭头，理解“微小改变会怎样影响结果”，再把不确定性读成概率分布。',
      }
    : {
        eyebrow: 'Beginner bridge',
        title: 'Build AI math intuition with three visual stories first',
        body:
          'If you are new to higher math, start here: read data as arrows, understand how tiny changes affect outputs, then read uncertainty as probability distributions.',
      },
)

const beginnerCards = computed(() =>
  currentLocale.value === 'zh-CN'
    ? [
        {
          id: 'linear-algebra',
          title: '线性代数：数据变成箭头',
          body: '从图片、词语、用户特征出发，看懂向量、矩阵变换、距离和相似度。',
          imagePath: '/math-lab/generated/beginner-linear-algebra-story.png',
          alt: '线性代数入门插图：数据卡片变成向量、向量组合、矩阵变换和长度测量。',
          route: '/math-lab/modules/beginner-linear-algebra',
        },
        {
          id: 'calculus',
          title: '微积分：局部变化给出方向',
          body: '用小车、切线和下坡路径理解导数、梯度和训练时的参数更新。',
          imagePath: '/math-lab/generated/beginner-calculus-story.png',
          alt: '微积分入门插图：小车轨迹、切线斜率、局部变化和梯度下降路径。',
          route: '/math-lab/modules/calculus-functions-rate-change',
        },
        {
          id: 'probability',
          title: '概率分布：很多次结果形成规律',
          body: '从重复试验和直方图理解分布，再连接到分类器输出的概率条。',
          imagePath: '/math-lab/generated/beginner-probability-story.png',
          alt: '概率分布入门插图：随机样本进入分桶、形成分布曲线，并连接分类概率输出。',
          route: '/math-lab/modules/beginner-probability-distributions',
        },
      ]
    : [
        {
          id: 'linear-algebra',
          title: 'Linear algebra: data becomes arrows',
          body: 'Start from images, words, and user features, then read vectors, matrix transforms, distance, and similarity.',
          imagePath: '/math-lab/generated/beginner-linear-algebra-story.png',
          alt: 'Beginner linear algebra illustration showing data cards becoming vectors, vector combinations, matrix transforms, and length measurement.',
          route: '/math-lab/modules/beginner-linear-algebra',
        },
        {
          id: 'calculus',
          title: 'Calculus: local change gives direction',
          body: 'Use a moving car, tangent lines, and a downhill path to understand derivatives, gradients, and training updates.',
          imagePath: '/math-lab/generated/beginner-calculus-story.png',
          alt: 'Beginner calculus illustration showing a car path, tangent slope, local change, and a gradient descent path.',
          route: '/math-lab/modules/calculus-functions-rate-change',
        },
        {
          id: 'probability',
          title: 'Probability: many trials form a pattern',
          body: 'Move from repeated trials and histograms to distributions, then connect them to classifier probability bars.',
          imagePath: '/math-lab/generated/beginner-probability-story.png',
          alt: 'Beginner probability illustration showing random samples entering bins, forming a distribution curve, and connecting to class probability outputs.',
          route: '/math-lab/modules/beginner-probability-distributions',
        },
      ],
)
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

    <section class="math-beginner-bridge math-lab-panel">
      <header class="section-header">
        <span class="eyebrow">{{ beginnerBridgeCopy.eyebrow }}</span>
        <h2>{{ beginnerBridgeCopy.title }}</h2>
        <p>{{ beginnerBridgeCopy.body }}</p>
      </header>

      <div class="math-beginner-card-grid">
        <router-link
          v-for="card in beginnerCards"
          :key="card.id"
          class="math-beginner-card"
          :to="card.route"
        >
          <img :src="withPublicBase(card.imagePath)" :alt="card.alt" loading="lazy" />
          <span>{{ card.title }}</span>
          <p>{{ card.body }}</p>
        </router-link>
      </div>
    </section>

    <LearningRouteDashboard
      :route="linearAlgebraRoute"
      :modules="mathLabModules"
      :completed-module-ids="progress.completedModuleIds"
      :locale="currentLocale"
    />

    <LearningRouteDashboard
      :route="mathToCodePilotRoute"
      :modules="mathLabModules"
      :completed-module-ids="progress.completedModuleIds"
      :locale="currentLocale"
    />

    <section class="math-lab-dashboard">
      <article class="math-lab-panel">
        <header class="section-header">
          <span class="eyebrow">{{ currentLocale === 'zh-CN' ? '路径' : 'Path' }}</span>
          <h2>{{ copy.pathTitle }}</h2>
          <p>{{ copy.pathBody }}</p>
        </header>
        <LearningPathMap
          :modules="aiMathPathModules"
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
