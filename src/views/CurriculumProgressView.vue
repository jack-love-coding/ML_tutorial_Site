<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { curriculumMetadataById } from '../curriculum/catalogMetadata.ts'
import { aiFoundationCourse } from '../curriculum/courses/data/aiFoundation.ts'
import {
  createDefaultCourseProgress,
  loadCourseProgress,
  selectCourseContinueTarget,
  summarizeCourseCompletion,
  summarizeCourseUnitProgress,
} from '../curriculum/courses/progress.ts'
import {
  createDefaultLearningProgressV2,
  migrateLearningProgressV2,
  selectContinueLearning,
  type LearningProgressLabEvidence,
  type LearningProgressV2,
} from '../curriculum/progress.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml'

const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)
const progress = ref<LearningProgressV2>(createDefaultLearningProgressV2())
const courseProgress = ref(createDefaultCourseProgress())

function copy(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function localizedText(value: LocalizedCopy) {
  return value[currentLocale.value]
}

onMounted(() => {
  progress.value = migrateLearningProgressV2()
  courseProgress.value = loadCourseProgress()
})

const courseContinueTarget = computed(() => selectCourseContinueTarget(courseProgress.value, progress.value, aiFoundationCourse.id))
const courseContinueUnit = computed(() => aiFoundationCourse.units.find((unit) => unit.id === courseContinueTarget.value?.unitId))
const courseCompletion = computed(() => summarizeCourseCompletion(aiFoundationCourse, courseProgress.value, progress.value))
const currentCourseSummary = computed(() => courseContinueUnit.value
  ? summarizeCourseUnitProgress(courseContinueUnit.value, courseProgress.value, progress.value, aiFoundationCourse.id)
  : undefined)

const continueTarget = computed(() => selectContinueLearning(progress.value))
const continueModule = computed(() =>
  continueTarget.value ? curriculumMetadataById.get(continueTarget.value.moduleId) : undefined,
)
const visitedCount = computed(
  () => Object.values(progress.value.modules).filter((moduleState) => moduleState.lastVisitedAt).length,
)
const savedRecordCount = computed(() => progress.value.labEvidence.length)
const recentLabEvidence = computed(() =>
  [...progress.value.labEvidence]
    .sort((left, right) => right.capturedAt.localeCompare(left.capturedAt))
    .slice(0, 3),
)

const pageCopy = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        eyebrow: '学习进度',
        title: '继续沿着统一路线学习',
        body: '这里汇总最近浏览位置和实验记录，帮助你接着阅读；课程验收由老师或后续系统完成。',
        continue: '继续学习',
        noTarget: '暂无下一步推荐',
        visited: '浏览过的模块',
        records: '实验记录',
        total: '课程模块',
        routes: '路线入口',
        recentEvidence: '最近实验记录',
        noEvidence: '完成一次互动实验后，这里会显示最近保存的观察指标。',
        capturedAt: '记录时间',
        observationRecorded: '实验结果已记录',
        explanationComplete: '已保存预测或解释',
        needsExplanation: '可选：补充预测或解释',
        courseEyebrow: '主课程进度',
        courseTitle: 'AI 基础参考教材',
        courseBody: '先看四编、当前单元和三类学习记录，再按需回到旧专题模块与实验记录。',
        courseCompleted: '已完成单元',
        coursePublished: '已开放单元',
        courseContinue: '继续当前单元',
        courseCatalog: '课程目录',
        courseStages: '课程阶段',
        courseSteps: '单元步骤',
        courseChecks: '验收自检',
        legacyModules: '旧模块完成记录',
        correctChecks: '正确 checkpoint',
        labEvidence: '实验记录',
      }
    : {
        eyebrow: 'Progress',
        title: 'Continue through the unified learning route',
        body: 'This page combines recent locations and lab notes so you can continue reading; teachers or later systems handle assessment.',
        continue: 'Continue Learning',
        noTarget: 'No next recommendation yet',
        visited: 'Modules visited',
        records: 'Lab records',
        total: 'Course Modules',
        routes: 'Route Entrypoints',
        recentEvidence: 'Recent Lab Records',
        noEvidence: 'Complete an interactive lab and the latest observed metrics will appear here.',
        capturedAt: 'Captured',
        observationRecorded: 'Experiment results recorded',
        explanationComplete: 'Prediction or explanation saved',
        needsExplanation: 'Optional: add a prediction or explanation',
        courseEyebrow: 'Main course progress',
        courseTitle: 'AI Foundations Reference Course',
        courseBody: 'Review the four parts, current unit, and three evidence layers before returning to legacy topic modules and lab records as needed.',
        courseCompleted: 'Units completed',
        coursePublished: 'Units published',
        courseContinue: 'Continue current unit',
        courseCatalog: 'Course catalog',
        courseStages: 'Course stages',
        courseSteps: 'Unit steps',
        courseChecks: 'Acceptance checks',
        legacyModules: 'Legacy module evidence',
        correctChecks: 'Correct checkpoints',
        labEvidence: 'Lab records',
      },
)

const nextLinks = [
  {
    id: 'spine-stage-landing',
    route: '/spine',
    label: copy('主线阶段视图', 'Spine Stage View'),
  },
  {
    id: 'core-learning-path',
    route: '/tracks/core-learning-path',
    label: copy('平铺模块列表', 'Flat Module List'),
  },
  {
    id: 'project-practice',
    route: '/tracks/project-practice',
    label: copy('项目实战', 'Project Practice'),
  },
]

function evidenceModuleTitle(moduleId: string) {
  return localizedText(curriculumMetadataById.get(moduleId)?.title ?? copy(moduleId, moduleId))
}

function evidenceValueText(value: string | number | LocalizedCopy) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return localizedText(value)
}

function evidenceTaskStatuses(evidence: LearningProgressLabEvidence) {
  return [
    pageCopy.value.observationRecorded,
    evidence.task?.prediction || evidence.task?.explanation
      ? pageCopy.value.explanationComplete
      : pageCopy.value.needsExplanation,
  ]
}

function formattedEvidenceTime(capturedAt: string) {
  const date = new Date(capturedAt)
  if (Number.isNaN(date.getTime())) return capturedAt

  return new Intl.DateTimeFormat(currentLocale.value === 'zh-CN' ? 'zh-CN' : 'en', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}
</script>

<template>
  <div class="curriculum-page">
    <section class="course-hero curriculum-progress-course">
      <div class="course-hero__copy">
        <span class="eyebrow">{{ pageCopy.courseEyebrow }}</span>
        <h1>{{ pageCopy.courseTitle }}</h1>
        <p>{{ pageCopy.courseBody }}</p>
        <div class="course-hero__actions">
          <router-link v-if="courseContinueTarget" class="course-primary-action" :to="courseContinueTarget.route">
            {{ pageCopy.courseContinue }}<span v-if="courseContinueUnit">· {{ localizedText(courseContinueUnit.title) }}</span>
          </router-link>
          <router-link class="course-secondary-action" to="/courses/ai-foundation">{{ pageCopy.courseCatalog }}</router-link>
        </div>
      </div>
      <dl class="course-hero__metrics">
        <div><dt>{{ pageCopy.courseStages }}</dt><dd>4</dd></div>
        <div><dt>{{ pageCopy.courseCompleted }}</dt><dd>{{ courseCompletion.completed }}</dd></div>
        <div><dt>{{ pageCopy.coursePublished }}</dt><dd>{{ courseCompletion.published }}</dd></div>
        <div><dt>{{ pageCopy.total }}</dt><dd>25</dd></div>
      </dl>
    </section>

    <section v-if="currentCourseSummary" class="course-evidence-summary">
      <div>
        <span class="eyebrow">{{ pageCopy.courseContinue }}</span>
        <h2>{{ courseContinueUnit ? localizedText(courseContinueUnit.title) : pageCopy.courseTitle }}</h2>
        <p>{{ pageCopy.courseSteps }}: {{ currentCourseSummary.completedStepCount }}/{{ currentCourseSummary.requiredStepCount }} · {{ pageCopy.courseChecks }}: {{ currentCourseSummary.confirmedCriterionCount }}/{{ currentCourseSummary.criterionCount }}</p>
      </div>
      <dl>
        <div><dt>{{ pageCopy.legacyModules }}</dt><dd>{{ currentCourseSummary.legacyModuleCount }}</dd></div>
        <div><dt>{{ pageCopy.correctChecks }}</dt><dd>{{ currentCourseSummary.correctCheckpointCount }}</dd></div>
        <div><dt>{{ pageCopy.labEvidence }}</dt><dd>{{ currentCourseSummary.labEvidenceCount }}</dd></div>
      </dl>
    </section>

    <section class="curriculum-hero">
      <div>
        <span class="eyebrow">{{ pageCopy.eyebrow }}</span>
        <h1>{{ pageCopy.title }}</h1>
        <p>{{ pageCopy.body }}</p>
      </div>
      <div class="curriculum-hero__metrics">
        <article>
          <span>{{ pageCopy.visited }}</span>
          <strong>{{ visitedCount }}</strong>
        </article>
        <article>
          <span>{{ pageCopy.records }}</span>
          <strong>{{ savedRecordCount }}</strong>
        </article>
        <article>
          <span>{{ pageCopy.total }}</span>
          <strong>{{ curriculumMetadataById.size }}</strong>
        </article>
      </div>
    </section>

    <section class="curriculum-module-row" aria-live="polite">
      <span class="curriculum-module-row__step">→</span>
      <div class="curriculum-module-row__copy">
        <span>{{ pageCopy.continue }}</span>
        <h2>
          {{ continueModule ? localizedText(continueModule.title) : pageCopy.noTarget }}
        </h2>
        <p v-if="continueModule">{{ localizedText(continueModule.summary) }}</p>
      </div>
      <router-link
        v-if="continueTarget"
        class="curriculum-module-row__action"
        :to="continueTarget.route"
      >
        {{ pageCopy.continue }}
      </router-link>
    </section>

    <section class="curriculum-hero curriculum-hero--compact">
      <div>
        <span class="eyebrow">{{ pageCopy.recentEvidence }}</span>
        <h2>{{ pageCopy.recentEvidence }}</h2>
        <p>{{ recentLabEvidence.length ? localizedText(recentLabEvidence[0].summary) : pageCopy.noEvidence }}</p>
      </div>
    </section>

    <section v-if="recentLabEvidence.length" class="curriculum-grid" :aria-label="pageCopy.recentEvidence">
      <article
        v-for="evidence in recentLabEvidence"
        :key="evidence.id"
        class="curriculum-module-card"
      >
        <span>{{ evidenceModuleTitle(evidence.moduleId) }}</span>
        <h2>{{ localizedText(evidence.summary) }}</h2>
        <p>{{ pageCopy.capturedAt }}: {{ formattedEvidenceTime(evidence.capturedAt) }}</p>
        <ul class="curriculum-evidence-list">
          <li v-for="metric in evidence.metrics.slice(0, 3)" :key="metric.label.en">
            <strong>{{ localizedText(metric.label) }}</strong>
            <span>
              {{ evidenceValueText(metric.value) }}{{ metric.unit ? ` ${localizedText(metric.unit)}` : '' }}
            </span>
          </li>
        </ul>
        <div class="curriculum-evidence-statuses" :aria-label="localizedText(evidence.prompt)">
          <span v-for="status in evidenceTaskStatuses(evidence)" :key="status">
            {{ status }}
          </span>
        </div>
      </article>
    </section>

    <section class="curriculum-hero curriculum-hero--compact">
      <div>
        <span class="eyebrow">{{ pageCopy.routes }}</span>
        <h2>{{ pageCopy.routes }}</h2>
      </div>
      <div class="curriculum-actions" :aria-label="pageCopy.routes">
        <router-link v-for="link in nextLinks" :key="link.id" :to="link.route">
          {{ localizedText(link.label) }}
        </router-link>
      </div>
    </section>
  </div>
</template>
