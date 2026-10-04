<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { courseById, courseUnitsForStage } from '../curriculum/courses/catalog.ts'
import { courseUnitRoute, defaultCourseId } from '../curriculum/courses/routes.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml.ts'
const route = useRoute()
const { locale } = useI18n()
const zh = computed(() => locale.value === 'zh-CN')
const course = computed(() => courseById.get(String(route.params.courseId)) ?? courseById.get(defaultCourseId)!)
function text(copy: LocalizedCopy) { return copy[locale.value as AppLocale] }
</script>

<template>
  <div class="course-page">
    <header class="course-hero"><div class="course-hero__copy"><h1>{{ text(course.title) }}</h1><p>{{ zh ? '按教学大纲编排的参考资料。也可以从六单元学习路线开始，再按需查阅这里的详细内容。' : 'Reference material arranged by syllabus. Start with the six-unit learning route, then explore these detailed topics when needed.' }}</p><router-link class="course-primary-action" to="/spine">{{ zh ? '学习路线' : 'Learning route' }}</router-link></div></header>
    <section class="course-stage-list">
      <article v-for="stage in course.stages" :id="`stage-${stage.id}`" :key="stage.id" class="course-stage-card">
        <header class="course-stage-card__header"><div><span class="course-stage-card__code">{{ stage.code }}</span><h2>{{ text(stage.title) }}</h2><p>{{ text(stage.description) }}</p></div></header>
        <ol v-if="stage.publicationStatus === 'published'" class="course-unit-list">
          <li v-for="unit in courseUnitsForStage(course, stage.id)" :key="unit.id"><router-link :to="courseUnitRoute(course.id, unit.id)">{{ unit.order }} · {{ text(unit.title) }}</router-link><p>{{ text(unit.coreQuestion) }}</p></li>
        </ol>
        <p v-else>{{ zh ? '后续内容：现有相关讲解可在专题资源中查阅。' : 'Further material: existing related lessons are available in the topic library.' }}</p>
      </article>
    </section>
  </div>
</template>
