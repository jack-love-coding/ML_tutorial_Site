<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LearningRoute, MathLabLocale, MathLabModule, MathLabModuleId } from '../types/mathLab'
import { checkpointReportForModule } from '../data/checkpointReports'
import { routeProgressSummary } from '../data/learningRoutes'
import { checkpointReportStorageKey, loadCheckpointReport } from '../utils/checkpointReports'

type ReportStatus = 'complete' | 'draft' | 'not-started' | 'unavailable'

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
const checkpointReportStates = ref<Record<MathLabModuleId, ReportStatus>>({})

function refreshCheckpointReports() {
  checkpointReportStates.value = Object.fromEntries(
    routeModules.value.map((moduleDefinition) => {
      const prompt = checkpointReportForModule(moduleDefinition.id)
      if (!prompt) return [moduleDefinition.id, 'unavailable' satisfies ReportStatus]

      const saved = loadCheckpointReport(moduleDefinition.id)
      if (saved?.completed) return [moduleDefinition.id, 'complete' satisfies ReportStatus]
      if (saved) return [moduleDefinition.id, 'draft' satisfies ReportStatus]
      return [moduleDefinition.id, 'not-started' satisfies ReportStatus]
    }),
  )
}

function handleReportVisibilityChange() {
  if (document.visibilityState === 'visible') refreshCheckpointReports()
}

function handleReportStorageEvent(event: StorageEvent) {
  if (
    event.key &&
    !routeModules.value.some((moduleDefinition) => event.key === checkpointReportStorageKey(moduleDefinition.id))
  ) {
    return
  }
  refreshCheckpointReports()
}

watch(routeModules, refreshCheckpointReports, { immediate: true })

onMounted(() => {
  refreshCheckpointReports()
  window.addEventListener('focus', refreshCheckpointReports)
  document.addEventListener('visibilitychange', handleReportVisibilityChange)
  window.addEventListener('storage', handleReportStorageEvent)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshCheckpointReports)
  document.removeEventListener('visibilitychange', handleReportVisibilityChange)
  window.removeEventListener('storage', handleReportStorageEvent)
})

function reportStatus(moduleId: MathLabModuleId) {
  const prompt = checkpointReportForModule(moduleId)
  if (!prompt) return props.locale === 'zh-CN' ? '无报告卡' : 'No report'
  const status = checkpointReportStates.value[moduleId] ?? 'not-started'
  if (status === 'complete') return props.locale === 'zh-CN' ? '报告完成' : 'Report complete'
  if (status === 'draft') return props.locale === 'zh-CN' ? '报告草稿' : 'Report draft'
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
