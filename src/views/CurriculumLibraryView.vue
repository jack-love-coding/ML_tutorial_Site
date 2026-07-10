<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { curriculumCatalog } from '../curriculum/catalog.ts'
import {
  curriculumLibraryDomains,
  resolveCurriculumLibraryDomain,
} from '../curriculum/library.ts'
import { curriculumRoleForModule } from '../curriculum/roles.ts'
import { resolveCanonicalLearnRoute } from '../curriculum/routes.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import type { CurriculumModule } from '../curriculum/types.ts'

const route = useRoute()
const { locale } = useI18n()

const currentLocale = computed(() => locale.value as AppLocale)
const selectedDomain = computed(() => {
  const routeDomain = resolveCurriculumLibraryDomain(route.params.domain)
  return curriculumLibraryDomains.find((domain) => domain.id === routeDomain)!
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

function roleLabel(moduleId: string) {
  const role = curriculumRoleForModule(moduleId)
  return role ? localizedText(role.label) : moduleId
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
          v-for="domain in curriculumLibraryDomains"
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
        <div class="curriculum-module-card__meta">
          <span>{{ moduleDefinition.estimatedMinutes }} {{ labels.minutes }}</span>
          <span class="curriculum-module-card__role">{{ roleLabel(moduleDefinition.id) }}</span>
        </div>
        <h2>{{ localizedText(moduleDefinition.title) }}</h2>
        <p>{{ localizedText(moduleDefinition.summary) }}</p>
        <router-link :to="moduleRoute(moduleDefinition)">
          {{ labels.open }}
        </router-link>
      </article>
    </section>
  </div>
</template>
