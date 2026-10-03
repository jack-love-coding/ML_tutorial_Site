<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
</script>

<template>
  <div class="course-page textbook-home">
    <section class="course-hero">
      <div class="course-hero__copy">
        <span class="eyebrow">ML Atlas</span>
        <h1>{{ zh ? '从看懂数据，到理解模型怎样学习' : 'From understanding data to seeing how models learn' }}</h1>
        <p class="course-hero__subtitle">{{ zh ? '面向初学者的 AI 辅助教材：双语讲解、可操作的实验，以及可复现的代码与结果。' : 'An AI companion for beginners: bilingual explanations, interactive experiments, and reproducible code and results.' }}</p>
        <div class="hero__actions">
          <router-link class="course-primary-action" to="/learn/ai-overview">{{ zh ? '开始学习' : 'Start reading' }}</router-link>
          <router-link class="action-button" to="/spine">{{ zh ? '查看学习路线' : 'View the learning route' }}</router-link>
        </div>
      </div>
    </section>
    <section class="course-unit-context">
      <article><h2>{{ zh ? '按顺序阅读' : 'Read in order' }}</h2><p>{{ zh ? '从 AI、Python 和数据开始，再学习损失、训练、回归与分类。需要的数学在使用之前补充。' : 'Start with AI, Python, and data; then explore loss, training, regression, and classification. Meet the mathematics when it becomes useful.' }}</p><router-link to="/spine">{{ zh ? '打开路线' : 'Open the route' }}</router-link></article>
      <article><h2>{{ zh ? '按需查阅专题' : 'Explore a topic' }}</h2><p>{{ zh ? '查阅数学推导、数据处理和深度学习，操作对应实验。' : 'Explore mathematical explanations, data processing, and deep learning through their experiments.' }}</p><router-link to="/library/math">{{ zh ? '专题资源' : 'Topic resources' }}</router-link></article>
      <article><h2>{{ zh ? '跟随完整案例' : 'Follow a worked project' }}</h2><p>{{ zh ? '对照数据、代码、运行结果和局限，复现一次完整的模型分析。' : 'Follow the data, code, results, and limitations of a complete model analysis.' }}</p><router-link to="/tracks/project-practice">{{ zh ? '项目案例' : 'Project examples' }}</router-link></article>
    </section>
  </div>
</template>
