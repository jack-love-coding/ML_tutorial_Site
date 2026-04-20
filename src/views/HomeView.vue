<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { moduleOrder } from '../data/moduleCatalog'

const { t, locale } = useI18n()

const primaryRoute = computed(() => moduleOrder[0]?.route ?? '/learn/loss-functions')

const highlights = computed(() =>
  locale.value === 'zh-CN'
    ? [
        '4 个互动课程模块',
        '回归、分类与 MLE 一起讲清',
        '全部在浏览器本地实时运行',
      ]
    : [
        '4 interactive lesson modules',
        'Regression, classification, and MLE in one path',
        'Runs entirely in the browser',
      ],
)

const posterBody = computed(() =>
  locale.value === 'zh-CN'
    ? '四节课程共用一套双语教学框架：公式讲解、章节实验、可重复的数据演示，以及从损失到模型的连续学习路径。'
    : 'Four lessons share one bilingual teaching frame: formula-first explanations, embedded labs, reproducible data demos, and a continuous path from loss to models.',
)

const modulesBody = computed(() =>
  locale.value === 'zh-CN'
    ? '从损失函数出发，依次进入优化、线性分类与浅层神经网络，把“模型为什么这样学”拆成连续的四节课。'
    : 'Start from loss functions, then move into optimization, linear classification, and shallow neural networks as one continuous sequence.',
)

const modulesNote = computed(() =>
  locale.value === 'zh-CN'
    ? '第一课现在单独讲损失函数与似然，其余模块继续承担优化、分类边界与表示学习的直觉训练。'
    : 'Lesson one now stands on its own as Loss Functions & Likelihood, while the later modules focus on optimization, decision boundaries, and representation learning.',
)

const pathBody = computed(() =>
  locale.value === 'zh-CN'
    ? '先理解误差如何变成损失，再看优化器怎样沿着目标函数移动，最后进入分类器和浅层网络。'
    : 'First learn how error becomes loss, then watch optimizers move across that objective, and finally carry the idea into classifiers and shallow networks.',
)

const learningPath = computed(() =>
  locale.value === 'zh-CN'
    ? [
        '损失函数与似然：先理解 MSE、MAE、交叉熵和 MLE 的关系',
        '梯度下降：观察优化器怎样在不同 loss 地形上移动',
        '逻辑回归：把交叉熵放进真实二分类边界里',
        '浅层 MLP：看隐藏层怎样重组空间并提升表达能力',
      ]
    : [
        'Loss Functions & Likelihood: connect MSE, MAE, cross-entropy, and MLE',
        'Gradient Descent: watch optimizers move across different loss landscapes',
        'Logistic Regression: place cross-entropy inside a real binary classifier',
        'Shallow MLP: see how hidden layers reorganize space and expand capacity',
      ],
)

const footerText = computed(() =>
  locale.value === 'zh-CN'
    ? '课程入口已经改成“损失函数与似然”，更适合从目标函数、概率解释和模型训练之间的关系开始学起。'
    : 'The course now opens with Loss Functions & Likelihood so students can start from objectives, probability, and training before moving into full models.',
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
          <article v-for="(highlight, index) in highlights" :key="`${highlight}-${index}`" class="hero-highlight">
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
