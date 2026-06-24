<script setup lang="ts">
import { computed } from 'vue'
import type { LearningRoute, MathLabLocale, MathLabModuleId } from '../types/mathLab'
import type { LearningRouteSummaryModule } from '../data/learningRouteSummaryModules'
import { routeProgressSummary } from '../data/learningRoutes'

const props = defineProps<{
  route: LearningRoute
  modules: readonly LearningRouteSummaryModule[]
  completedModuleIds: MathLabModuleId[]
  locale: MathLabLocale
}>()

const moduleById = computed(() => new Map(props.modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition])))
const summary = computed(() => routeProgressSummary(props.route, props.completedModuleIds))
const nextModule = computed(() => summary.value.nextModuleId ? moduleById.value.get(summary.value.nextModuleId) : undefined)
const actionRoute = computed(() => nextModule.value ? `/math-lab/modules/${nextModule.value.id}` : '/math-lab')
const actionLabel = computed(() => {
  if (!nextModule.value) return props.locale === 'zh-CN' ? '回到路线' : 'Back to route'
  return props.locale === 'zh-CN' ? '继续下一章' : 'Continue next chapter'
})
</script>

<template>
  <article class="learning-route-summary">
    <span class="eyebrow">{{ locale === 'zh-CN' ? '学习路线' : 'Learning route' }}</span>
    <h3>{{ route.title[locale] }}</h3>
    <p>{{ route.description[locale] }}</p>
    <div class="learning-route-summary__meta">
      <strong>{{ summary.completedCount }} / {{ summary.totalCount }}</strong>
      <span>{{ locale === 'zh-CN' ? '已完成' : 'completed' }}</span>
    </div>
    <p v-if="nextModule" class="learning-route-summary__next">
      {{ locale === 'zh-CN' ? '下一章：' : 'Next: ' }}{{ nextModule.title[locale] }}
    </p>
    <p v-else class="learning-route-summary__next">
      {{ locale === 'zh-CN' ? '这条路线已完成。' : 'This route is complete.' }}
    </p>
    <router-link class="action-button action-button--primary" :to="actionRoute">
      {{ actionLabel }}
    </router-link>
  </article>
</template>
