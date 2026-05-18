<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { moduleOrder } from '../data/moduleCatalog'

const { t, locale } = useI18n()

const primaryRoute = computed(() => '/math-lab')

const highlights = computed(() =>
  locale.value === 'zh-CN'
    ? ['Math Lab 建立数学直觉', 'Data Lab 连接表格和特征', 'ML Models 用实验理解训练行为']
    : [
        'Math Lab builds the math intuition',
        'Data Lab connects tables to features',
        'ML Models make training behavior visible',
      ],
)

const posterBody = computed(() =>
  locale.value === 'zh-CN'
    ? '先用 Math Lab 补数学直觉，再用 Data Lab 处理输入，之后进入可交互的 ML Models 和深度学习扩展。'
    : 'Start with Math Lab, move through Data Lab, then enter interactive ML Models and the deep-learning extension path.',
)

const modulesBody = computed(() =>
  locale.value === 'zh-CN'
    ? '站点主线不是单独堆章节，而是把 Math Lab、Data Lab、ML Models 和 Deep Learning 串成零基础学生能跟下去的学习闭环。'
    : 'The site connects Math Lab, Data Lab, ML Models, and Deep Learning into one beginner-friendly learning loop.',
)

const modulesNote = computed(() =>
  locale.value === 'zh-CN'
    ? '当前优先补齐自测、进度和继续学习入口，让学生每学完一章都能知道自己是否理解。'
    : 'The current priority is checkpoints, progress, and continue-learning entry points so students can verify understanding after each chapter.',
)

const pathBody = computed(() =>
  locale.value === 'zh-CN'
    ? '推荐顺序是数学直觉、数据处理、机器学习模型、深度学习扩展。每一段都保留可视化、互动实验和 checkpoint。'
    : 'The recommended order is math intuition, data processing, machine-learning models, and deep-learning extensions, each with visual labs and checkpoints.',
)

const learningPath = computed(() =>
  locale.value === 'zh-CN'
    ? [
        'Math Lab：向量、矩阵、Taylor、概率、优化、SVD/PCA、自动微分和深度结构数学',
        'Data Lab：数值特征、类别特征、清洗、EDA、划分、复杂度和正则化',
        'ML Models：loss、gradient descent、linear/logistic regression、classification 和 MLP',
        'Deep Learning：以 MLP 为入口，后续扩展 CNN、Attention、Transformer 和优化器对比',
      ]
    : [
        'Math Lab: vectors, matrices, Taylor series, probability, optimization, SVD/PCA, autodiff, and architecture math',
        'Data Lab: numeric features, categorical features, cleaning, EDA, splits, complexity, and regularization',
        'ML Models: loss, gradient descent, linear/logistic regression, classification, and MLP',
        'Deep Learning: start with MLP, then extend toward CNN, Attention, Transformers, and optimizer comparisons',
      ],
)

const footerText = computed(() =>
  locale.value === 'zh-CN'
    ? '从 Math Lab 开始，学生能先补齐直觉，再进入数据和模型实验。'
    : 'Start in Math Lab so students build intuition before moving into data and model labs.',
)
</script>

<template>
  <div class="home-view">
    <section class="hero home-hero">
      <div class="hero__copy">
        <span class="eyebrow">{{ t('home.eyebrow') }}</span>
        <h1>{{ t('home.title') }}</h1>
        <p>{{ t('home.subtitle') }}</p>
        <div class="hero__actions">
          <router-link class="action-button action-button--primary" :to="primaryRoute">
            {{ t('home.ctaPrimary') }}
          </router-link>
          <a class="action-button" href="#modules">
            {{ t('home.ctaSecondary') }}
          </a>
        </div>
      </div>

      <div class="hero__visual">
        <div class="hero__poster">
          <div class="hero__grid" />
          <div class="hero__poster-copy">
            <span>{{ t('home.posterTitle') }}</span>
            <p>{{ posterBody }}</p>
          </div>
        </div>

        <div class="hero__highlights">
          <article
            v-for="(highlight, index) in highlights"
            :key="`${highlight}-${index}`"
            class="hero-highlight"
          >
            <span>{{ `0${index + 1}` }}</span>
            <p>{{ highlight }}</p>
          </article>
        </div>
      </div>
    </section>

    <section id="modules" class="modules-section">
      <div class="modules-section__intro">
        <header class="section-header">
          <span class="eyebrow">{{ t('nav.modules') }}</span>
          <h2>{{ t('home.modulesTitle') }}</h2>
          <p>{{ modulesBody }}</p>
        </header>
        <p class="modules-section__note">{{ modulesNote }}</p>
      </div>

      <div class="module-gallery">
        <router-link
          v-for="(moduleDefinition, index) in moduleOrder"
          :key="moduleDefinition.slug"
          class="module-teaser"
          :style="{ '--teaser-accent': moduleDefinition.accent, '--teaser-bg': moduleDefinition.theme }"
          :to="moduleDefinition.route"
        >
          <div class="module-teaser__meta">
            <span>{{ t(moduleDefinition.kickerKey) }}</span>
            <em>{{ `0${index + 1}` }}</em>
          </div>
          <strong>{{ t(moduleDefinition.titleKey) }}</strong>
          <p>{{ t(moduleDefinition.summaryKey) }}</p>
          <small>{{ t('actions.openModule') }}</small>
        </router-link>
      </div>
    </section>

    <section class="path-section">
      <div class="path-layout">
        <header class="section-header">
          <span class="eyebrow">{{ t('common.overview') }}</span>
          <h2>{{ t('home.pathTitle') }}</h2>
          <p>{{ pathBody }}</p>
        </header>

        <div class="path-grid">
          <article v-for="(step, index) in learningPath" :key="index" class="path-step">
            <span>{{ `0${index + 1}` }}</span>
            <p>{{ step }}</p>
          </article>
        </div>
      </div>
    </section>

    <footer class="home-footer">
      <p>{{ footerText }}</p>
      <router-link class="action-button" :to="primaryRoute">
        {{ t('actions.launch') }}
      </router-link>
    </footer>
  </div>
</template>
