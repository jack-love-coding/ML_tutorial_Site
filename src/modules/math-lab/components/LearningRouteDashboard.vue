<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { LearningRoute, MathLabLocale, MathLabModule, MathLabModuleId, MathLabProgress } from '../types/mathLab'
import { checkpointReportForModule } from '../data/checkpointReports'
import { completedModuleIdsForRoute, routeProgressSummary } from '../data/learningRoutes'
import {
  buildCheckpointReportMarkdown,
  checkpointReportStorageKey,
  createDefaultCheckpointReport,
  loadCheckpointReport,
} from '../utils/checkpointReports'

type ReportStatus = 'complete' | 'draft' | 'not-started' | 'unavailable'

const props = defineProps<{
  route: LearningRoute
  modules: MathLabModule[]
  completedModuleIds?: MathLabModuleId[]
  progress?: MathLabProgress
  locale: MathLabLocale
}>()

const moduleById = computed(() => new Map(props.modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition])))
const routeCompletedModuleIds = computed(() => props.progress
  ? completedModuleIdsForRoute(props.route, props.progress)
  : props.completedModuleIds ?? [])
const summary = computed(() => routeProgressSummary(props.route, routeCompletedModuleIds.value))
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

function exportRouteMarkdown() {
  const reports = props.route.chapterModuleIds.map((moduleId) =>
    loadCheckpointReport(moduleId) ?? createDefaultCheckpointReport(props.route.id, moduleId),
  )
  const markdown = buildCheckpointReportMarkdown(props.route.id, reports, props.modules, props.locale)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.route.id}-checkpoint-reports.md`
  link.hidden = true
  document.body.appendChild(link)
  link.click()
  queueMicrotask(() => {
    link.remove()
    URL.revokeObjectURL(url)
  })
}
</script>

<template>
  <section class="learning-route-dashboard" :aria-label="route.title[locale]">
    <header>
      <span class="eyebrow">{{ locale === 'zh-CN' ? '路线地图' : 'Route map' }}</span>
      <h2>{{ route.title[locale] }}</h2>
      <p>{{ route.description[locale] }}</p>
      <strong>{{ summary.completedCount }} / {{ summary.totalCount }} {{ locale === 'zh-CN' ? '已完成' : 'completed' }}</strong>
      <button class="action-button" type="button" @click="exportRouteMarkdown">
        {{ locale === 'zh-CN' ? '导出整条路线报告' : 'Export route report' }}
      </button>
    </header>

    <ol class="learning-route-dashboard__list">
      <li
        v-for="(moduleDefinition, routeIndex) in routeModules"
        :key="moduleDefinition.id"
        :class="{ 'is-complete': routeCompletedModuleIds.includes(moduleDefinition.id), 'is-next': summary.nextModuleId === moduleDefinition.id }"
      >
        <router-link :to="`/math-lab/modules/${moduleDefinition.id}?route=${route.id}`">
          <span>{{ routeIndex + 1 }}</span>
          <strong>{{ moduleDefinition.title[locale] }}</strong>
          <small>{{ reportStatus(moduleDefinition.id) }}</small>
        </router-link>
      </li>
    </ol>
  </section>
</template>
