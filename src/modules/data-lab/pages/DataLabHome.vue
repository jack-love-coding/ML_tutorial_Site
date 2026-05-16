<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { dataLabModules } from '../data/modules'
import type { DataLabLocale } from '../types/dataLab'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value as DataLabLocale)

const copy = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: 'Data Lab',
        title: '数据实验室',
        subtitle: '从列语义、清洗、探索、pandas 工作流到类别编码，把机器学习前的数据准备讲成可观察、可复现的过程。',
        start: '开始数据类型',
        path: '学习路径',
        note: '所有实验在浏览器中用 TypeScript 模拟 pandas 与编码行为，并展示等价的工程代码。',
        runtime: '运行方式',
        runtimeTitle: '无 Pyodide 依赖',
        runtimeNote: '实验结果由确定性 TypeScript 函数产生；pandas 与 scikit-learn 代码用于教学对照，后续可接 Colab Notebook。',
      }
    : {
        eyebrow: 'Data Lab',
        title: 'Data Lab',
        subtitle:
          'From column meaning and cleaning to EDA, pandas workflows, and categorical encoding, make pre-ML data preparation observable and reproducible.',
        start: 'Start data types',
        path: 'Learning path',
        note: 'All labs simulate pandas and encoding behavior in TypeScript while showing equivalent engineering code.',
        runtime: 'Runtime',
        runtimeTitle: 'No Pyodide dependency',
        runtimeNote:
          'Lab outputs come from deterministic TypeScript functions; pandas and scikit-learn code are shown as teaching equivalence and can later link to Colab notebooks.',
      },
)
</script>

<template>
  <div class="data-lab-page">
    <section class="data-lab-hero">
      <div class="data-lab-hero__copy">
        <span class="eyebrow">{{ copy.eyebrow }}</span>
        <h1>{{ copy.title }}</h1>
        <p>{{ copy.subtitle }}</p>
        <div class="hero__actions">
          <router-link class="action-button action-button--primary" to="/data-lab/modules/data-types-feature-vectors">
            {{ copy.start }}
          </router-link>
          <router-link class="action-button" to="/math-lab">
            Math Lab
          </router-link>
        </div>
      </div>

      <div class="data-lab-hero__visual" aria-hidden="true">
        <div class="data-lab-table-plane">
          <span v-for="column in ['type', 'clean', 'EDA', 'pandas', 'encode']" :key="column">{{ column }}</span>
        </div>
      </div>
    </section>

    <section class="data-lab-dashboard">
      <article class="data-lab-panel">
        <header class="section-header">
          <span class="eyebrow">{{ copy.path }}</span>
          <h2>{{ currentLocale === 'zh-CN' ? '五步进入可训练数据' : 'Five steps toward trainable data' }}</h2>
          <p>{{ copy.note }}</p>
        </header>

        <div class="data-lab-path">
          <router-link
            v-for="moduleDefinition in dataLabModules"
            :key="moduleDefinition.id"
            class="data-lab-path__node"
            :to="`/data-lab/modules/${moduleDefinition.id}`"
            :style="{ '--data-accent': moduleDefinition.accent, '--data-theme': moduleDefinition.theme }"
          >
            <span>{{ currentLocale === 'zh-CN' ? `第 ${moduleDefinition.order} 章` : `Chapter ${moduleDefinition.order}` }}</span>
            <strong>{{ moduleDefinition.title[currentLocale] }}</strong>
            <p>{{ moduleDefinition.subtitle[currentLocale] }}</p>
          </router-link>
        </div>
      </article>

      <aside class="data-lab-panel data-lab-panel--compact">
        <span>{{ copy.runtime }}</span>
        <strong>{{ copy.runtimeTitle }}</strong>
        <p>{{ copy.runtimeNote }}</p>
      </aside>
    </section>
  </div>
</template>
