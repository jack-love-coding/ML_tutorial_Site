<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import MarkdownMathContent from '../components/MarkdownMathContent.vue'
import ReferenceExample from '../components/ReferenceExample.vue'
import { courseById, publishedCourseUnits } from '../curriculum/courses/catalog.ts'
import { courseOverviewRoute, courseUnitRoute, resolveCourseResourceRoute } from '../curriculum/courses/routes.ts'
import type { CourseResourceRef } from '../curriculum/courses/types.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml.ts'
import { withPublicBase } from '../utils/publicPath.ts'
const route = useRoute()
const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => currentLocale.value === 'zh-CN')
const course = computed(() => courseById.get(String(route.params.courseId))!)
const unit = computed(() => course.value?.units.find((entry) => entry.id === String(route.params.unitId)))
const units = computed(() => publishedCourseUnits(course.value))
const index = computed(() => units.value.findIndex((entry) => entry.id === unit.value?.id))
const previous = computed(() => units.value[index.value - 1])
const next = computed(() => units.value[index.value + 1])
function text(copy: LocalizedCopy) { return copy[currentLocale.value] }
function href(resource: CourseResourceRef) {
  if (resource.kind === 'asset') return withPublicBase(resource.path)
  if (resource.kind === 'external') return resource.href
  return undefined
}
</script>

<template>
  <div v-if="unit" class="course-page course-unit-page">
    <router-link class="course-back-link" :to="courseOverviewRoute(course.id)">← {{ zh ? '参考教材目录' : 'Reference contents' }}</router-link>
    <header class="course-unit-hero"><div><span class="eyebrow">{{ unit.order }} · {{ unit.estimatedHours }}h</span><h1>{{ text(unit.title) }}</h1><p>{{ text(unit.coreQuestion) }}</p></div></header>
    <section class="course-unit-context">
      <article><h2>{{ zh ? '本节介绍' : 'In this unit' }}</h2><ul><li v-for="outcome in unit.outcomes" :key="outcome.en">{{ text(outcome) }}</li></ul></article>
      <article><h2>{{ zh ? '案例与操作' : 'Examples and operations' }}</h2><p>{{ text(unit.practice) }}</p></article>
      <article><h2>{{ zh ? '数据与工具' : 'Data and tools' }}</h2><p>{{ text(unit.datasets) }}</p><p>{{ text(unit.tools) }}</p></article>
    </section>
    <section class="course-study-loop">
      <article v-for="(step, stepIndex) in unit.steps" :id="step.id" :key="step.id" class="course-step">
        <div class="course-step__index">{{ stepIndex + 1 }}</div>
        <div class="course-step__body">
          <h2>{{ text(step.title) }}</h2>
          <MarkdownMathContent :source="text(step.description)" />
          <MarkdownMathContent v-if="step.content" :source="text(step.content)" />
          <pre v-if="step.code"><code>{{ text(step.code.source) }}</code></pre>
          <div v-if="step.resourceRefs?.length" class="course-resource-list">
            <template v-for="resource in step.resourceRefs" :key="resource.label.en">
              <router-link v-if="resolveCourseResourceRoute(resource)" :to="resolveCourseResourceRoute(resource)!">{{ text(resource.label) }}</router-link>
              <a v-else-if="href(resource)" :href="href(resource)" :download="resource.kind === 'asset' && resource.download ? '' : undefined" :target="resource.kind === 'external' ? '_blank' : undefined" rel="noopener noreferrer">{{ text(resource.label) }}</a>
            </template>
          </div>
          <ReferenceExample v-if="step.checkpoint" :example="{ id: `${step.id}-explanation`, prompt: step.checkpoint.question, choices: step.checkpoint.options, answer: step.checkpoint.correctOptionId, explanation: step.checkpoint.correctFeedback }" :locale="currentLocale" />
        </div>
      </article>
    </section>
    <nav class="hero__actions" :aria-label="zh ? '阅读导航' : 'Reading navigation'">
      <router-link v-if="previous" class="action-button" :to="courseUnitRoute(course.id, previous.id)">{{ zh ? '上一单元' : 'Previous unit' }}</router-link>
      <router-link v-if="next" class="action-button" :to="courseUnitRoute(course.id, next.id)">{{ zh ? '下一单元' : 'Next unit' }}</router-link>
    </nav>
  </div>
</template>
