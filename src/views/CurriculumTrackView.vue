<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { curriculumModuleById } from '../curriculum/catalog.ts'
import { resolveCanonicalLearnRoute } from '../curriculum/routes.ts'
import { curriculumTracks } from '../curriculum/tracks.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import type { CurriculumDomain, CurriculumModule } from '../curriculum/types.ts'

const route = useRoute()
const { locale } = useI18n()

const fallbackTrack = curriculumTracks[0]

const currentLocale = computed(() => locale.value as AppLocale)
const routeTrackId = computed(() =>
  typeof route.params.trackId === 'string' ? route.params.trackId : fallbackTrack.id,
)
const track = computed(
  () => curriculumTracks.find((candidate) => candidate.id === routeTrackId.value) ?? fallbackTrack,
)
const trackModules = computed(() =>
  track.value.moduleIds
    .map((moduleId) => curriculumModuleById.get(moduleId))
    .filter((moduleDefinition): moduleDefinition is CurriculumModule => Boolean(moduleDefinition)),
)
const totalMinutes = computed(() =>
  trackModules.value.reduce((total, moduleDefinition) => total + moduleDefinition.estimatedMinutes, 0),
)

function localizedText(copy: LocalizedCopy) {
  return copy[currentLocale.value]
}

function moduleRoute(moduleDefinition: CurriculumModule) {
  return resolveCanonicalLearnRoute(moduleDefinition.id) ?? moduleDefinition.route
}

function domainLabel(domain: CurriculumDomain) {
  const labels: Record<CurriculumDomain, LocalizedCopy> = {
    foundation: { 'zh-CN': '基础地图', en: 'Foundation' },
    math: { 'zh-CN': '数学直觉', en: 'Math' },
    data: { 'zh-CN': '数据处理', en: 'Data' },
    model: { 'zh-CN': '模型训练', en: 'Models' },
    'deep-learning': { 'zh-CN': '深度学习', en: 'Deep Learning' },
    project: { 'zh-CN': '项目实战', en: 'Project' },
  }

  return localizedText(labels[domain])
}

const labels = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: '课程路线',
        moduleCount: '模块数',
        duration: '预计时长',
        minutes: '分钟',
        open: '进入模块',
      }
    : {
        eyebrow: 'Curriculum Route',
        moduleCount: 'Modules',
        duration: 'Estimated Time',
        minutes: 'min',
        open: 'Open Module',
      },
)
</script>

<template>
  <div class="curriculum-page">
    <section class="curriculum-hero">
      <div>
        <span class="eyebrow">{{ labels.eyebrow }}</span>
        <h1>{{ localizedText(track.title) }}</h1>
        <p>{{ localizedText(track.description) }}</p>
      </div>
      <div class="curriculum-hero__metrics">
        <article>
          <span>{{ labels.moduleCount }}</span>
          <strong>{{ trackModules.length }}</strong>
        </article>
        <article>
          <span>{{ labels.duration }}</span>
          <strong>{{ totalMinutes }} {{ labels.minutes }}</strong>
        </article>
      </div>
    </section>

    <section class="curriculum-list" :aria-label="localizedText(track.title)">
      <article
        v-for="(moduleDefinition, index) in trackModules"
        :key="moduleDefinition.id"
        class="curriculum-module-row"
      >
        <span class="curriculum-module-row__step">{{ index + 1 }}</span>
        <div class="curriculum-module-row__copy">
          <span>{{ domainLabel(moduleDefinition.domain) }}</span>
          <h2>{{ localizedText(moduleDefinition.title) }}</h2>
          <p>{{ localizedText(moduleDefinition.summary) }}</p>
        </div>
        <router-link class="curriculum-module-row__action" :to="moduleRoute(moduleDefinition)">
          {{ labels.open }}
        </router-link>
      </article>
    </section>
  </div>
</template>
