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
const minimumFoundationRoute = computed(() => learningRouteById['minimum-foundation'])
const linearAlgebraRoute = computed(() => learningRouteById['linear-algebra-route'])
const calculusRoute = computed(() => learningRouteById['calculus-route'])
const probabilityRoute = computed(() => learningRouteById['probability-route'])
const numericalDeepeningRoute = computed(() => learningRouteById['numerical-deepening-path'])
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
        title: '用四章建立第一层 AI 数学语言',
        body:
          '沿同一个可手算例子，依次理解函数映射、向量与矩阵、局部导数和概率分布。每章都给出 Python/NumPy 代码与运行结果。',
      }
    : {
        eyebrow: 'Beginner bridge',
        title: 'Build the first layer of AI mathematics in four chapters',
        body:
          'Follow one hand-checkable example through function mappings, vectors and matrices, local derivatives, and probability distributions, with Python/NumPy code and outputs in every chapter.',
      },
)

const beginnerCards = computed(() =>
  currentLocale.value === 'zh-CN'
    ? [
        {
          id: 'functions',
          title: '函数与映射：输入怎样变成预测',
          body: '区分输入、参数、预测和目标，并用平均变化率描述输出怎样改变。',
          imagePath: '/math-lab/generated/beginner-function-machine-longform.png',
          alt: '函数映射教学插图：输入经过确定规则得到输出，并把参数与目标分开。',
          route: '/math-lab/modules/calculus-functions-rate-change?route=minimum-foundation',
        },
        {
          id: 'linear-algebra',
          title: '向量与矩阵：样本怎样组成批次',
          body: '把一行特征写成向量，把多行样本写成矩阵，并读懂每条轴和 shape。',
          imagePath: '/math-lab/generated/beginner-linear-algebra-story.png',
          alt: '线性代数入门插图：数据卡片变成向量、向量组合、矩阵变换和长度测量。',
          route: '/math-lab/modules/beginner-linear-algebra?route=minimum-foundation',
        },
        {
          id: 'derivatives',
          title: '导数：当前点附近怎样变化',
          body: '从割线走到局部斜率，用中央差分核对损失对参数的敏感度。',
          imagePath: '/math-lab/generated/beginner-calculus-story.png',
          alt: '微积分入门插图：小车轨迹、切线斜率、局部变化和梯度下降路径。',
          route: '/math-lab/modules/calculus-derivatives-local-change?route=minimum-foundation',
        },
        {
          id: 'probability',
          title: '概率分布：很多次结果形成规律',
          body: '从重复试验和直方图理解分布，再连接到分类器输出的概率条。',
          imagePath: '/math-lab/generated/beginner-probability-story.png',
          alt: '概率分布入门插图：随机样本进入分桶、形成分布曲线，并连接分类概率输出。',
          route: '/math-lab/modules/beginner-probability-distributions?route=minimum-foundation',
        },
      ]
    : [
        {
          id: 'functions',
          title: 'Functions and mappings: inputs become predictions',
          body: 'Separate inputs, parameters, predictions, and targets, then describe output change with an average rate.',
          imagePath: '/math-lab/generated/beginner-function-machine-longform.png',
          alt: 'Function mapping illustration showing an input following a deterministic rule to an output, with parameters separate from the target.',
          route: '/math-lab/modules/calculus-functions-rate-change?route=minimum-foundation',
        },
        {
          id: 'linear-algebra',
          title: 'Vectors and matrices: examples become batches',
          body: 'Write one feature row as a vector, stack examples into a matrix, and read every axis and shape.',
          imagePath: '/math-lab/generated/beginner-linear-algebra-story.png',
          alt: 'Beginner linear algebra illustration showing data cards becoming vectors, vector combinations, matrix transforms, and length measurement.',
          route: '/math-lab/modules/beginner-linear-algebra?route=minimum-foundation',
        },
        {
          id: 'derivatives',
          title: 'Derivatives: change near the current point',
          body: 'Move from secants to a local slope and use central differences to check loss sensitivity.',
          imagePath: '/math-lab/generated/beginner-calculus-story.png',
          alt: 'Beginner calculus illustration showing a car path, tangent slope, local change, and a gradient descent path.',
          route: '/math-lab/modules/calculus-derivatives-local-change?route=minimum-foundation',
        },
        {
          id: 'probability',
          title: 'Probability: many trials form a pattern',
          body: 'Move from repeated trials and histograms to distributions, then connect them to classifier probability bars.',
          imagePath: '/math-lab/generated/beginner-probability-story.png',
          alt: 'Beginner probability illustration showing random samples entering bins, forming a distribution curve, and connecting to class probability outputs.',
          route: '/math-lab/modules/beginner-probability-distributions?route=minimum-foundation',
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
      :route="minimumFoundationRoute"
      :modules="mathLabModules"
      :progress="progress"
      :locale="currentLocale"
      :show-reports="false"
    />

    <LearningRouteDashboard
      :route="linearAlgebraRoute"
      :modules="mathLabModules"
      :progress="progress"
      :locale="currentLocale"
    />

    <LearningRouteDashboard
      :route="calculusRoute"
      :modules="mathLabModules"
      :progress="progress"
      :locale="currentLocale"
      :show-reports="false"
    />

    <LearningRouteDashboard
      :route="probabilityRoute"
      :modules="mathLabModules"
      :progress="progress"
      :locale="currentLocale"
      :show-reports="false"
    />

    <LearningRouteDashboard
      :route="numericalDeepeningRoute"
      :modules="mathLabModules"
      :progress="progress"
      :locale="currentLocale"
      :show-reports="false"
    />

    <LearningRouteDashboard
      :route="mathToCodePilotRoute"
      :modules="mathLabModules"
      :progress="progress"
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
