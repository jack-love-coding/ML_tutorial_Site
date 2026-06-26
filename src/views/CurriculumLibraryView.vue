<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { curriculumCatalog } from '../curriculum/catalog.ts'
import { resolveCanonicalLearnRoute } from '../curriculum/routes.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import type { CurriculumDomain, CurriculumModule } from '../curriculum/types.ts'

const route = useRoute()
const { locale } = useI18n()

const currentLocale = computed(() => locale.value as AppLocale)
const libraryDomains: Array<{ id: CurriculumDomain; title: LocalizedCopy; summary: LocalizedCopy }> = [
  {
    id: 'math',
    title: { 'zh-CN': '数学专题库', en: 'Math Library' },
    summary: {
      'zh-CN': '把符号、几何、微积分、概率和数值稳定连接到模型行为。',
      en: 'Connect symbols, geometry, calculus, probability, and numerical stability to model behavior.',
    },
  },
  {
    id: 'data',
    title: { 'zh-CN': '数据专题库', en: 'Data Library' },
    summary: {
      'zh-CN': '从列、特征、清洗、划分和正则化理解输入协议。',
      en: 'Understand the input contract through columns, features, cleaning, splits, and regularization.',
    },
  },
  {
    id: 'model',
    title: { 'zh-CN': '模型与训练', en: 'Models and Training' },
    summary: {
      'zh-CN': '用损失、优化、边界和指标观察训练行为。',
      en: 'Observe training behavior through loss, optimization, boundaries, and metrics.',
    },
  },
  {
    id: 'deep-learning',
    title: { 'zh-CN': '深度学习专项', en: 'Deep Learning' },
    summary: {
      'zh-CN': '从 MLP 扩展到卷积、注意力、优化器和 RAG。',
      en: 'Extend from MLPs to convolution, attention, optimizers, and RAG.',
    },
  },
  {
    id: 'project',
    title: { 'zh-CN': '项目实战', en: 'Projects' },
    summary: {
      'zh-CN': '把数据处理、建模和复盘放进端到端任务。',
      en: 'Put preprocessing, modeling, and review into end-to-end tasks.',
    },
  },
]

const selectedDomain = computed(() => {
  const routeDomain = typeof route.params.domain === 'string' ? route.params.domain : 'math'
  return libraryDomains.find((domain) => domain.id === routeDomain) ?? libraryDomains[0]
})
const selectedModules = computed(() =>
  curriculumCatalog.filter((moduleDefinition) => moduleDefinition.domain === selectedDomain.value.id),
)

function localizedText(copy: LocalizedCopy) {
  return copy[currentLocale.value]
}

function moduleRoute(moduleDefinition: CurriculumModule) {
  return resolveCanonicalLearnRoute(moduleDefinition.id) ?? moduleDefinition.route
}

const labels = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: '专题库',
        open: '打开',
        minutes: '分钟',
      }
    : {
        eyebrow: 'Topic Library',
        open: 'Open',
        minutes: 'min',
      },
)
</script>

<template>
  <div class="curriculum-page">
    <section class="curriculum-hero">
      <div>
        <span class="eyebrow">{{ labels.eyebrow }}</span>
        <h1>{{ localizedText(selectedDomain.title) }}</h1>
        <p>{{ localizedText(selectedDomain.summary) }}</p>
      </div>
      <nav class="curriculum-tabs" :aria-label="labels.eyebrow">
        <router-link
          v-for="domain in libraryDomains"
          :key="domain.id"
          :to="`/library/${domain.id}`"
          :class="{ 'is-active': domain.id === selectedDomain.id }"
        >
          {{ localizedText(domain.title) }}
        </router-link>
      </nav>
    </section>

    <section class="curriculum-grid" :aria-label="localizedText(selectedDomain.title)">
      <article
        v-for="moduleDefinition in selectedModules"
        :key="moduleDefinition.id"
        class="curriculum-module-card"
      >
        <span>{{ moduleDefinition.estimatedMinutes }} {{ labels.minutes }}</span>
        <h2>{{ localizedText(moduleDefinition.title) }}</h2>
        <p>{{ localizedText(moduleDefinition.summary) }}</p>
        <router-link :to="moduleRoute(moduleDefinition)">
          {{ labels.open }}
        </router-link>
      </article>
    </section>
  </div>
</template>
