<script setup lang="ts">
import { computed } from 'vue'
import type { LearningRoute, MathLabLocale, MathLabModule, MathLabModuleId } from '../types/mathLab'
import { checkpointReportForModule } from '../data/checkpointReports'
import { routeProgressSummary } from '../data/learningRoutes'
import { loadCheckpointReport } from '../utils/checkpointReports'

const props = defineProps<{
  route: LearningRoute
  modules: MathLabModule[]
  completedModuleIds: MathLabModuleId[]
  locale: MathLabLocale
}>()

const moduleById = computed(() => new Map(props.modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition])))
const summary = computed(() => routeProgressSummary(props.route, props.completedModuleIds))
const routeModules = computed(() => props.route.chapterModuleIds
  .map((id) => moduleById.value.get(id))
  .filter((moduleDefinition): moduleDefinition is MathLabModule => Boolean(moduleDefinition)))

function reportStatus(moduleId: MathLabModuleId) {
  const prompt = checkpointReportForModule(moduleId)
  if (!prompt) return props.locale === 'zh-CN' ? '无报告卡' : 'No report'
  const saved = loadCheckpointReport(moduleId)
  if (saved?.completed) return props.locale === 'zh-CN' ? '报告完成' : 'Report complete'
  if (saved) return props.locale === 'zh-CN' ? '报告草稿' : 'Report draft'
  return props.locale === 'zh-CN' ? '待填写' : 'Not started'
}
</script>

<template>
  <section class="learning-route-dashboard">
    <header>
      <span class="eyebrow">{{ locale === 'zh-CN' ? '路线地图' : 'Route map' }}</span>
      <h2>{{ route.title[locale] }}</h2>
      <p>{{ route.description[locale] }}</p>
      <strong>{{ summary.completedCount }} / {{ summary.totalCount }} {{ locale === 'zh-CN' ? '已完成' : 'completed' }}</strong>
    </header>

    <ol class="learning-route-dashboard__list">
      <li
        v-for="moduleDefinition in routeModules"
        :key="moduleDefinition.id"
        :class="{ 'is-complete': completedModuleIds.includes(moduleDefinition.id), 'is-next': summary.nextModuleId === moduleDefinition.id }"
      >
        <router-link :to="`/math-lab/modules/${moduleDefinition.id}`">
          <span>{{ moduleDefinition.order }}</span>
          <strong>{{ moduleDefinition.title[locale] }}</strong>
          <small>{{ reportStatus(moduleDefinition.id) }}</small>
        </router-link>
      </li>
    </ol>
  </section>
</template>
