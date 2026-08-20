<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { courseById, courseUnitsForStage } from '../curriculum/courses/catalog.ts'
import {
  createDefaultCourseProgress,
  loadCourseProgress,
  selectCourseContinueTarget,
  summarizeCourseCompletion,
  summarizeCourseUnitProgress,
} from '../curriculum/courses/progress.ts'
import { courseUnitRoute, defaultCourseId } from '../curriculum/courses/routes.ts'
import { createDefaultLearningProgressV2, migrateLearningProgressV2 } from '../curriculum/progress.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml.ts'

const route = useRoute()
const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)
const course = computed(() => courseById.get(String(route.params.courseId)) ?? courseById.get(defaultCourseId)!)
const courseProgress = ref(createDefaultCourseProgress())
const legacyProgress = ref(createDefaultLearningProgressV2())

function localizedText(value: LocalizedCopy) {
  return value[currentLocale.value]
}

onMounted(() => {
  courseProgress.value = loadCourseProgress()
  legacyProgress.value = migrateLearningProgressV2()
})

const completion = computed(() => summarizeCourseCompletion(course.value, courseProgress.value, legacyProgress.value))
const continueTarget = computed(() => selectCourseContinueTarget(courseProgress.value, legacyProgress.value, course.value.id))
const continueUnit = computed(() => course.value.units.find((unit) => unit.id === continueTarget.value?.unitId))
const notice = computed(() => {
  if (route.query.notice === 'unknown-course') {
    return currentLocale.value === 'zh-CN' ? '未找到该课程，已返回 AI 基础参考教材。' : 'That course was not found. Showing AI Foundations instead.'
  }
  if (route.query.notice === 'planned-unit') {
    return currentLocale.value === 'zh-CN' ? '该单元仍在建设中，当前先展示所属阶段目标。' : 'That unit is still being built. Its stage goals are shown here for now.'
  }
  if (route.query.notice === 'unknown-unit') {
    return currentLocale.value === 'zh-CN' ? '未找到该单元，已返回课程目录。' : 'That unit was not found. Showing the course catalog instead.'
  }
  return ''
})

const labels = computed(() => currentLocale.value === 'zh-CN'
  ? {
      eyebrow: 'ML Atlas 主课程', start: '开始学习', continue: '继续学习', hours: '参考学时', units: '大纲单元', stages: '课程编目',
      published: '已开放', planned: '建设中', completed: '已完成', current: '当前已开放', stageGoal: '阶段目标', notStarted: '未开始', inProgress: '进行中', readyCheck: '待验收自检',
      noLinks: '本编只展示建设目标；整编达到教学闭环后再开放单元页面。', prerequisite: '前置', noPrerequisite: '从这里开始',
    }
  : {
      eyebrow: 'ML Atlas main course', start: 'Start learning', continue: 'Continue learning', hours: 'Reference hours', units: 'Syllabus units', stages: 'Course stages',
      published: 'Published', planned: 'In development', completed: 'Completed', current: 'Currently available', stageGoal: 'Stage goal', notStarted: 'Not started', inProgress: 'In progress', readyCheck: 'Ready for self-check',
      noLinks: 'This stage shows goals only. Unit pages open after the whole stage reaches a complete learning loop.', prerequisite: 'Prerequisite', noPrerequisite: 'Start here',
    })

function unitStatus(unitId: string) {
  const unit = course.value.units.find((candidate) => candidate.id === unitId)!
  const status = summarizeCourseUnitProgress(unit, courseProgress.value, legacyProgress.value, course.value.id).status
  return {
    'not-started': labels.value.notStarted,
    'in-progress': labels.value.inProgress,
    'ready-for-self-check': labels.value.readyCheck,
    completed: labels.value.completed,
  }[status]
}
</script>

<template>
  <div class="course-page">
    <p v-if="notice" class="course-notice" role="status">{{ notice }}</p>

    <section class="course-hero">
      <div class="course-hero__copy">
        <span class="eyebrow">{{ labels.eyebrow }}</span>
        <h1>{{ localizedText(course.title) }}</h1>
        <p class="course-hero__subtitle">{{ localizedText(course.subtitle) }}</p>
        <p>{{ localizedText(course.description) }}</p>
        <router-link v-if="continueTarget" class="course-primary-action" :to="continueTarget.route">
          {{ continueUnit && completion.completed > 0 ? labels.continue : labels.start }}
          <span v-if="continueUnit">· {{ localizedText(continueUnit.title) }}</span>
        </router-link>
      </div>
      <dl class="course-hero__metrics">
        <div><dt>{{ labels.stages }}</dt><dd>{{ course.stages.length }}</dd></div>
        <div><dt>{{ labels.units }}</dt><dd>{{ course.totalUnits }}</dd></div>
        <div><dt>{{ labels.hours }}</dt><dd>{{ course.totalHours }}</dd></div>
        <div><dt>{{ labels.completed }}</dt><dd>{{ completion.completed }}/{{ completion.published }}</dd></div>
      </dl>
    </section>

    <section class="course-stage-list" :aria-label="labels.stages">
      <article
        v-for="stage in course.stages"
        :id="`stage-${stage.id}`"
        :key="stage.id"
        class="course-stage-card"
        :class="`is-${stage.publicationStatus}`"
      >
        <header class="course-stage-card__header">
          <div>
            <span class="course-stage-card__code">{{ stage.code }}</span>
            <span class="course-status">{{ stage.publicationStatus === 'published' ? labels.published : labels.planned }}</span>
          </div>
          <div>
            <h2>{{ localizedText(stage.title) }}</h2>
            <p>{{ localizedText(stage.description) }}</p>
          </div>
        </header>

        <div class="course-stage-card__outcomes">
          <strong>{{ labels.stageGoal }}</strong>
          <ul><li v-for="outcome in stage.outcomes" :key="outcome.en">{{ localizedText(outcome) }}</li></ul>
        </div>

        <ol v-if="stage.publicationStatus === 'published'" class="course-unit-list">
          <li v-for="unit in courseUnitsForStage(course, stage.id)" :key="unit.id">
            <router-link :to="courseUnitRoute(course.id, unit.id)">
              <span class="course-unit-list__number">{{ String(unit.order).padStart(2, '0') }}</span>
              <span class="course-unit-list__copy">
                <strong>{{ localizedText(unit.title) }}</strong>
                <small>{{ localizedText(unit.coreQuestion) }}</small>
              </span>
              <span class="course-unit-list__status">{{ unitStatus(unit.id) }}</span>
            </router-link>
          </li>
        </ol>
        <p v-else class="course-stage-card__planned">{{ labels.noLinks }}</p>
      </article>
    </section>
  </div>
</template>
