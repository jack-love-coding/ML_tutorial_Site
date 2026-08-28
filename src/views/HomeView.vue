<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { aiFoundationCourse } from '../curriculum/courses/data/aiFoundation.ts'
import {
  courseProgressV1StorageKey,
  createDefaultCourseProgress,
  loadCourseProgress,
  selectCourseContinueTarget,
  summarizeCourseCompletion,
} from '../curriculum/courses/progress.ts'
import { courseOverviewRoute, courseUnitRoute } from '../curriculum/courses/routes.ts'
import {
  createDefaultLearningProgressV2,
  learningProgressV2MigrationKey,
  learningProgressV2StorageKey,
  migrateLearningProgressV2,
} from '../curriculum/progress.ts'
import { dataLabProgressStorageKey } from '../modules/data-lab/utils/progress.ts'
import { mathLabProgressStorageKey } from '../modules/math-lab/utils/progress.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml.ts'
import { algorithmProgressStorageKey } from '../utils/algorithmProgress.ts'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)
const course = aiFoundationCourse
const courseProgress = ref(createDefaultCourseProgress())
const legacyProgress = ref(createDefaultLearningProgressV2())
const watchedKeys = new Set([
  courseProgressV1StorageKey,
  learningProgressV2StorageKey,
  learningProgressV2MigrationKey,
  algorithmProgressStorageKey,
  mathLabProgressStorageKey,
  dataLabProgressStorageKey,
])

function localizedText(value: LocalizedCopy) {
  return value[currentLocale.value]
}

function refreshProgress() {
  courseProgress.value = loadCourseProgress()
  legacyProgress.value = migrateLearningProgressV2()
}

function handleVisibility() {
  if (document.visibilityState === 'visible') refreshProgress()
}

function handleStorage(event: StorageEvent) {
  if (!event.key || watchedKeys.has(event.key)) refreshProgress()
}

onMounted(() => {
  refreshProgress()
  window.addEventListener('focus', refreshProgress)
  window.addEventListener('storage', handleStorage)
  document.addEventListener('visibilitychange', handleVisibility)
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', refreshProgress)
  window.removeEventListener('storage', handleStorage)
  document.removeEventListener('visibilitychange', handleVisibility)
})

const completion = computed(() => summarizeCourseCompletion(course, courseProgress.value, legacyProgress.value))
const continueTarget = computed(() => selectCourseContinueTarget(courseProgress.value, legacyProgress.value, course.id))
const continueUnit = computed(() => course.units.find((unit) => unit.id === continueTarget.value?.unitId))
const publishedStage = computed(() => course.stages.find((stage) => stage.publicationStatus === 'published')!)
const publishedUnits = computed(() => publishedStage.value.unitIds.map((unitId) => course.units.find((unit) => unit.id === unitId)!))

const labels = computed(() => currentLocale.value === 'zh-CN'
  ? {
      eyebrow: 'ML Atlas · 教学大纲配套学习工具',
      title: '沿一条完整路径，建立可复现的 AI 基础',
      body: '25 个大纲主题被组织为四编参考教材。每个已开放单元都连接核心问题、代码、现有实验、Notebook、误区反馈和成果验收；参考学时用于规划，不强迫固定节奏。',
      start: '从第一单元开始', continue: '继续学习', catalog: '查看完整课程目录', stageOpen: 'A 编已开放', stagePlanned: '整编建设中',
      stageBody: 'A 编六个单元已形成完整学习闭环；B—D 编先展示目标，不提供未完成页面链接。',
      stages: '四编课程路径', units: '大纲单元', hours: '参考学时', completed: '已完成',
      supportEyebrow: '深入阅读与实验', supportTitle: '主课程负责路径，实验室负责把概念看见',
      supportBody: '旧知识地图、Math Lab、Data Lab、算法讲解和项目仍全部保留，并作为课程单元里的深入资源使用。',
      python: 'Python 数据工具', math: '数学专题实验', data: '数据处理实验', topics: '专题资源库', projects: '项目实战', progress: '查看三层学习记录', legacy: '旧知识地图（兼容入口）',
      openUnit: '进入单元', plannedBody: '达到整编教学闭环后开放', courseArchitecture: '课程架构',
    }
  : {
      eyebrow: 'ML Atlas · Syllabus companion',
      title: 'Build reproducible AI foundations along one coherent path',
      body: 'The 25 syllabus topics form a four-part reference course. Every published unit connects a core question, code, existing labs, notebooks, misconception feedback, and artifact checks. Reference hours guide planning without forcing a fixed pace.',
      start: 'Start with unit one', continue: 'Continue learning', catalog: 'Open the full course catalog', stageOpen: 'Part A published', stagePlanned: 'Stage in development',
      stageBody: 'All six Part A units now form a complete learning loop. Parts B–D show goals without linking to unfinished pages.',
      stages: 'Course parts', units: 'Syllabus units', hours: 'Reference hours', completed: 'Completed',
      supportEyebrow: 'Deep dives and labs', supportTitle: 'The course owns the path; labs make the ideas visible',
      supportBody: 'The legacy map, Math Lab, Data Lab, algorithm lessons, and projects remain available and now serve as deep-dive resources inside course units.',
      python: 'Python Data Tools', math: 'Math topic labs', data: 'Data workflow labs', topics: 'Topic library', projects: 'Project practice', progress: 'Review three evidence layers', legacy: 'Legacy knowledge map',
      openUnit: 'Open unit', plannedBody: 'Opens after the full stage has a complete learning loop', courseArchitecture: 'Course architecture',
    })

const supportLinks = computed(() => [
  { route: '/python', label: labels.value.python, description: currentLocale.value === 'zh-CN' ? 'Notebook、NumPy、Pandas 与解释型 EDA。' : 'Notebooks, NumPy, pandas, and explanatory EDA.' },
  { route: '/math-lab', label: labels.value.math, description: currentLocale.value === 'zh-CN' ? '向量、微积分、概率、优化与深度结构数学。' : 'Vectors, calculus, probability, optimization, and deep-architecture mathematics.' },
  { route: '/data-lab', label: labels.value.data, description: currentLocale.value === 'zh-CN' ? '数据语义、质量、划分、泛化和正则化。' : 'Data semantics, quality, splits, generalization, and regularization.' },
  { route: '/library/model', label: labels.value.topics, description: currentLocale.value === 'zh-CN' ? '按主题查找算法讲解和交互实验。' : 'Find algorithm explanations and interactive labs by topic.' },
  { route: '/tracks/project-practice', label: labels.value.projects, description: currentLocale.value === 'zh-CN' ? '用端到端任务复查数据、模型和评价。' : 'Revisit data, models, and evaluation through end-to-end tasks.' },
  { route: '/progress', label: labels.value.progress, description: currentLocale.value === 'zh-CN' ? '课程步骤、验收自检和既有实验记录。' : 'Course steps, acceptance checks, and existing lab records.' },
  { route: '/spine', label: labels.value.legacy, description: currentLocale.value === 'zh-CN' ? '保留全部旧深链和原有知识地图。' : 'Preserves every legacy deep link and the original knowledge map.' },
])
</script>

<template>
  <div class="course-page home-course-page">
    <section class="course-hero home-course-hero">
      <div class="course-hero__copy">
        <span class="eyebrow">{{ labels.eyebrow }}</span>
        <h1>{{ labels.title }}</h1>
        <p class="course-hero__subtitle">{{ labels.body }}</p>
        <div class="course-hero__actions">
          <router-link class="course-primary-action" :to="continueTarget?.route ?? courseUnitRoute(course.id, publishedUnits[0].id)">
            {{ continueUnit && completion.completed > 0 ? labels.continue : labels.start }}
            <span v-if="continueUnit">· {{ localizedText(continueUnit.title) }}</span>
          </router-link>
          <router-link class="course-secondary-action" :to="courseOverviewRoute(course.id)">{{ labels.catalog }}</router-link>
        </div>
      </div>
      <dl class="course-hero__metrics">
        <div><dt>{{ labels.stages }}</dt><dd>{{ course.stages.length }}</dd></div>
        <div><dt>{{ labels.units }}</dt><dd>{{ course.totalUnits }}</dd></div>
        <div><dt>{{ labels.hours }}</dt><dd>{{ course.totalHours }}</dd></div>
        <div><dt>{{ labels.completed }}</dt><dd>{{ completion.completed }}/{{ completion.published }}</dd></div>
      </dl>
    </section>

    <section class="home-published-stage">
      <header>
        <div><span class="eyebrow">{{ labels.stageOpen }}</span><h2>{{ localizedText(publishedStage.title) }}</h2></div>
        <p>{{ labels.stageBody }}</p>
      </header>
      <ol class="home-unit-grid">
        <li v-for="unit in publishedUnits" :key="unit.id">
          <router-link :to="courseUnitRoute(course.id, unit.id)">
            <span>{{ String(unit.order).padStart(2, '0') }}</span>
            <strong>{{ localizedText(unit.title) }}</strong>
            <small>{{ localizedText(unit.coreQuestion) }}</small>
            <em>{{ labels.openUnit }} →</em>
          </router-link>
        </li>
      </ol>
    </section>

    <section class="home-stage-map">
      <header><span class="eyebrow">{{ labels.courseArchitecture }}</span><h2>{{ labels.stages }}</h2></header>
      <div class="home-stage-map__grid">
        <article v-for="stage in course.stages" :key="stage.id" :class="`is-${stage.publicationStatus}`">
          <span>{{ stage.code }}</span>
          <h3>{{ localizedText(stage.title) }}</h3>
          <p>{{ localizedText(stage.description) }}</p>
          <strong>{{ stage.unitIds.length }} {{ labels.units }}</strong>
          <small>{{ stage.publicationStatus === 'published' ? labels.stageOpen : `${labels.stagePlanned} · ${labels.plannedBody}` }}</small>
        </article>
      </div>
    </section>

    <section class="home-support-resources">
      <header><span class="eyebrow">{{ labels.supportEyebrow }}</span><h2>{{ labels.supportTitle }}</h2><p>{{ labels.supportBody }}</p></header>
      <div class="home-support-grid">
        <router-link v-for="link in supportLinks" :key="link.route" :to="link.route"><strong>{{ link.label }}</strong><span>{{ link.description }}</span><em>→</em></router-link>
      </div>
    </section>
  </div>
</template>
