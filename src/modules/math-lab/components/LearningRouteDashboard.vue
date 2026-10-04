<script setup lang="ts">
import { computed } from 'vue'
import type { LearningRoute, MathLabLocale, MathLabModuleSummary, MathLabModuleId, MathLabProgress } from '../types/mathLab'

const props = defineProps<{
  route: LearningRoute
  modules: MathLabModuleSummary[]
  locale: MathLabLocale
  completedModuleIds?: MathLabModuleId[]
  progress?: MathLabProgress
  showReports?: boolean
}>()
const routeModules = computed(() => props.route.chapterModuleIds.flatMap((id) => {
  const module = props.modules.find((entry) => entry.id === id)
  return module ? [module] : []
}))
</script>

<template>
  <section :id="route.id" class="learning-route-dashboard" :aria-label="route.title[locale]">
    <header>
      <span class="eyebrow">{{ locale === 'zh-CN' ? '阅读顺序' : 'Reading order' }}</span>
      <h2>{{ route.title[locale] }}</h2>
      <p>{{ route.description[locale] }}</p>
    </header>
    <ol class="learning-route-dashboard__list">
      <li v-for="(module, index) in routeModules" :key="module.id">
        <router-link :to="`/math-lab/modules/${module.id}?route=${route.id}`">
          <span>{{ index + 1 }}</span><strong>{{ module.title[locale] }}</strong>
          <small>{{ module.estimatedMinutes }} min</small>
        </router-link>
      </li>
    </ol>
  </section>
</template>
