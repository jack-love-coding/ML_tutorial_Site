<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import MarkdownMathContent from '../components/MarkdownMathContent.vue'
import { courseById, publishedCourseUnits } from '../curriculum/courses/catalog.ts'
import {
  createDefaultCourseProgress,
  loadCourseProgress,
  setCourseCriterionConfirmed,
  setCourseStepComplete,
  summarizeCourseUnitProgress,
  visitCourseUnit,
} from '../curriculum/courses/progress.ts'
import { courseOverviewRoute, courseUnitRoute, resolveCourseResourceRoute } from '../curriculum/courses/routes.ts'
import { createDefaultLearningProgressV2, migrateLearningProgressV2 } from '../curriculum/progress.ts'
import type { CourseResourceRef, CourseStudyStep } from '../curriculum/courses/types.ts'
import type { AppLocale, LocalizedCopy } from '../types/ml.ts'
import { withPublicBase } from '../utils/publicPath.ts'

const route = useRoute()
const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)
const course = computed(() => courseById.get(String(route.params.courseId))!)
const unit = computed(() => course.value.units.find((candidate) => candidate.id === String(route.params.unitId))!)
const courseProgress = ref(createDefaultCourseProgress())
const legacyProgress = ref(createDefaultLearningProgressV2())
const checkpointSelections = ref<Record<string, string>>({})
const checkpointSubmitted = ref<Record<string, boolean>>({})

function localizedText(value: LocalizedCopy) {
  return value[currentLocale.value]
}

function recordVisit() {
  if (!course.value || !unit.value) return
  courseProgress.value = visitCourseUnit(courseProgress.value, course.value.id, unit.value.id)
}

onMounted(() => {
  courseProgress.value = loadCourseProgress()
  legacyProgress.value = migrateLearningProgressV2()
  recordVisit()
})
watch(() => unit.value?.id, () => {
  checkpointSelections.value = {}
  checkpointSubmitted.value = {}
  recordVisit()
})

const summary = computed(() => summarizeCourseUnitProgress(unit.value, courseProgress.value, legacyProgress.value, course.value.id))
const unitState = computed(() => courseProgress.value.courses[course.value.id]?.units[unit.value.id])
const publishedUnits = computed(() => publishedCourseUnits(course.value))
const currentIndex = computed(() => publishedUnits.value.findIndex((candidate) => candidate.id === unit.value.id))
const previousUnit = computed(() => publishedUnits.value[currentIndex.value - 1])
const nextUnit = computed(() => publishedUnits.value[currentIndex.value + 1])
const prerequisiteUnits = computed(() => unit.value.prerequisiteUnitIds.flatMap((unitId) => {
  const found = course.value.units.find((candidate) => candidate.id === unitId)
  return found ? [found] : []
}))

const labels = computed(() => currentLocale.value === 'zh-CN'
  ? {
      back: '返回课程目录', coreQuestion: '核心问题', readiness: '准备度', ready: '建议先复看', readyBody: '前置不会锁住本单元；需要时可随时补课。',
      outcomes: '完成后你应能', hours: '参考学时', practice: '实践任务', datasets: '数据集', tools: '工具', steps: '学习闭环',
      mark: '这一步已完成', inherited: '已有学习证据已计入', resource: '打开资源', download: '下载', checkpointSubmit: '检查答案',
      choose: '先选择一个答案', correct: '回答正确，已记录这一步。', incorrect: '答案暂不成立。', deliverable: '课后产出',
      selfCheck: '验收自检', selfCheckBody: '只有你确认全部成果标准后，本单元才标记为完成；这不会锁定其他内容。',
      previous: '上一单元', next: '下一单元', status: '当前状态', evidence: '三类学习记录', moduleEvidence: '旧模块完成', quizEvidence: '正确 checkpoint', labEvidence: '实验记录', notStarted: '未开始', inProgress: '进行中', readyCheck: '待验收自检', completed: '已完成',
    }
  : {
      back: 'Back to course', coreQuestion: 'Core question', readiness: 'Readiness', ready: 'Review first if useful', readyBody: 'Prerequisites never lock this unit; revisit them whenever needed.',
      outcomes: 'By the end, you can', hours: 'Reference hours', practice: 'Practice', datasets: 'Dataset', tools: 'Tools', steps: 'Learning loop',
      mark: 'I completed this step', inherited: 'Existing learning evidence counted', resource: 'Open resource', download: 'Download', checkpointSubmit: 'Check answer',
      choose: 'Choose an answer first', correct: 'Correct. This step is recorded.', incorrect: 'That answer does not hold yet.', deliverable: 'Learning artifact',
      selfCheck: 'Acceptance self-check', selfCheckBody: 'The unit is complete only after you confirm every artifact criterion. This never locks other content.',
      previous: 'Previous unit', next: 'Next unit', status: 'Current status', evidence: 'Three evidence layers', moduleEvidence: 'Legacy modules', quizEvidence: 'Correct checkpoints', labEvidence: 'Lab records', notStarted: 'Not started', inProgress: 'In progress', readyCheck: 'Ready for self-check', completed: 'Completed',
    })

function stepComplete(stepId: string) {
  return summary.value.completedStepIds.has(stepId)
}

function toggleStep(step: CourseStudyStep, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  courseProgress.value = setCourseStepComplete(courseProgress.value, course.value.id, unit.value.id, step.id, checked)
}

function toggleCriterion(criterionId: string, event: Event) {
  const checked = (event.target as HTMLInputElement).checked
  courseProgress.value = setCourseCriterionConfirmed(courseProgress.value, course.value.id, unit.value.id, criterionId, checked)
}

function criterionConfirmed(criterionId: string) {
  return unitState.value?.confirmedCriterionIds.includes(criterionId) ?? false
}

function checkAnswer(step: CourseStudyStep) {
  if (!step.checkpoint || !checkpointSelections.value[step.id]) return
  checkpointSubmitted.value[step.id] = true
  const correct = checkpointSelections.value[step.id] === step.checkpoint.correctOptionId
  courseProgress.value = setCourseStepComplete(courseProgress.value, course.value.id, unit.value.id, step.id, correct)
}

function checkpointResult(step: CourseStudyStep) {
  if (!checkpointSubmitted.value[step.id]) return undefined
  const selected = checkpointSelections.value[step.id]
  if (!selected || !step.checkpoint) return undefined
  return selected === step.checkpoint.correctOptionId
}

const localizedStatus = computed(() => ({
  'not-started': labels.value.notStarted,
  'in-progress': labels.value.inProgress,
  'ready-for-self-check': labels.value.readyCheck,
  completed: labels.value.completed,
})[summary.value.status])

function internalResourceRoute(resource: CourseResourceRef) {
  return resolveCourseResourceRoute(resource)
}

function directResourceHref(resource: CourseResourceRef) {
  if (resource.kind === 'asset') return withPublicBase(resource.path)
  if (resource.kind === 'external') return resource.href
  return undefined
}
</script>

<template>
  <div class="course-page course-unit-page">
    <router-link class="course-back-link" :to="courseOverviewRoute(course.id)">← {{ labels.back }}</router-link>

    <header class="course-unit-hero">
      <div>
        <span class="eyebrow">{{ String(unit.order).padStart(2, '0') }} · {{ labels.hours }} {{ unit.estimatedHours }}h</span>
        <h1>{{ localizedText(unit.title) }}</h1>
        <p class="course-unit-hero__question"><strong>{{ labels.coreQuestion }}：</strong>{{ localizedText(unit.coreQuestion) }}</p>
      </div>
      <aside class="course-unit-status" aria-live="polite">
        <span>{{ labels.status }}</span><strong>{{ localizedStatus }}</strong>
        <small>{{ summary.completedStepCount }}/{{ summary.requiredStepCount }} steps · {{ summary.confirmedCriterionCount }}/{{ summary.criterionCount }} checks</small>
      </aside>
    </header>

    <section class="course-readiness">
      <div><span class="eyebrow">{{ labels.readiness }}</span><h2>{{ labels.ready }}</h2><p>{{ labels.readyBody }}</p></div>
      <ul v-if="prerequisiteUnits.length">
        <li v-for="prerequisite in prerequisiteUnits" :key="prerequisite.id">
          <router-link v-if="prerequisite.publicationStatus === 'published'" :to="courseUnitRoute(course.id, prerequisite.id)">{{ localizedText(prerequisite.title) }}</router-link>
          <span v-else>{{ localizedText(prerequisite.title) }}</span>
        </li>
      </ul>
    </section>

    <section class="course-unit-context">
      <article><h2>{{ labels.outcomes }}</h2><ul><li v-for="outcome in unit.outcomes" :key="outcome.en">{{ localizedText(outcome) }}</li></ul></article>
      <article><h2>{{ labels.practice }}</h2><p>{{ localizedText(unit.practice) }}</p></article>
      <article><h2>{{ labels.datasets }} / {{ labels.tools }}</h2><p>{{ localizedText(unit.datasets) }}</p><p>{{ localizedText(unit.tools) }}</p></article>
    </section>

    <section class="course-study-loop">
      <header><span class="eyebrow">{{ labels.steps }}</span><h2>{{ labels.steps }}</h2></header>
      <article v-for="(step, index) in unit.steps" :key="step.id" class="course-step" :class="{ 'is-complete': stepComplete(step.id) }">
        <div class="course-step__index">{{ index + 1 }}</div>
        <div class="course-step__body">
          <span class="course-step__kind">{{ step.kind }}</span>
          <h3>{{ localizedText(step.title) }}</h3>
          <MarkdownMathContent :source="localizedText(step.description)" />
          <MarkdownMathContent v-if="step.content" :source="localizedText(step.content)" />
          <pre v-if="step.code"><code>{{ localizedText(step.code.source) }}</code></pre>

          <div v-if="step.resourceRefs?.length" class="course-resource-list">
            <template v-for="resource in step.resourceRefs" :key="resource.label.en">
              <router-link v-if="internalResourceRoute(resource)" :to="internalResourceRoute(resource)!"><span>{{ labels.resource }}</span>{{ localizedText(resource.label) }}</router-link>
              <a v-else-if="directResourceHref(resource)" :href="directResourceHref(resource)" :download="resource.kind === 'asset' && resource.download ? '' : undefined" :target="resource.kind === 'external' ? '_blank' : undefined" rel="noopener noreferrer"><span>{{ resource.kind === 'asset' && resource.download ? labels.download : labels.resource }}</span>{{ localizedText(resource.label) }}</a>
            </template>
          </div>

          <fieldset v-if="step.checkpoint" class="course-checkpoint">
            <legend>{{ localizedText(step.checkpoint.question) }}</legend>
            <label v-for="option in step.checkpoint.options" :key="option.id">
              <input v-model="checkpointSelections[step.id]" type="radio" :name="step.id" :value="option.id" @change="checkpointSubmitted[step.id] = false">
              <span>{{ localizedText(option.label) }}</span>
            </label>
            <button type="button" @click="checkAnswer(step)">{{ labels.checkpointSubmit }}</button>
            <p v-if="checkpointResult(step) === true" class="course-feedback is-correct">{{ localizedText(step.checkpoint.correctFeedback) }} {{ labels.correct }}</p>
            <p v-else-if="checkpointResult(step) === false" class="course-feedback is-incorrect">{{ localizedText(step.checkpoint.incorrectFeedback) }} {{ labels.incorrect }}</p>
          </fieldset>

          <label v-if="!step.checkpoint" class="course-step-check">
            <input type="checkbox" :checked="stepComplete(step.id)" @change="toggleStep(step, $event)">
            <span>{{ labels.mark }}</span>
            <small v-if="stepComplete(step.id) && !unitState?.completedStepIds.includes(step.id)">{{ labels.inherited }}</small>
          </label>
        </div>
      </article>
    </section>

    <section class="course-evidence-summary">
      <div><span class="eyebrow">{{ labels.evidence }}</span><h2>{{ labels.evidence }}</h2></div>
      <dl>
        <div><dt>{{ labels.moduleEvidence }}</dt><dd>{{ summary.legacyModuleCount }}</dd></div>
        <div><dt>{{ labels.quizEvidence }}</dt><dd>{{ summary.correctCheckpointCount }}</dd></div>
        <div><dt>{{ labels.labEvidence }}</dt><dd>{{ summary.labEvidenceCount }}</dd></div>
      </dl>
    </section>

    <section class="course-self-check">
      <span class="eyebrow">{{ labels.selfCheck }}</span><h2>{{ labels.selfCheck }}</h2><p>{{ labels.selfCheckBody }}</p>
      <label v-for="criterion in unit.acceptanceCriteria" :key="criterion.id">
        <input type="checkbox" :checked="criterionConfirmed(criterion.id)" @change="toggleCriterion(criterion.id, $event)">
        <span>{{ localizedText(criterion.label) }}</span>
      </label>
      <div class="course-deliverable"><strong>{{ labels.deliverable }}</strong><p>{{ localizedText(unit.deliverables) }}</p></div>
    </section>

    <nav class="course-unit-pagination" :aria-label="labels.steps">
      <router-link v-if="previousUnit" :to="courseUnitRoute(course.id, previousUnit.id)">← {{ labels.previous }}<strong>{{ localizedText(previousUnit.title) }}</strong></router-link>
      <router-link v-else :to="courseOverviewRoute(course.id)">← {{ labels.back }}</router-link>
      <router-link v-if="nextUnit" :to="courseUnitRoute(course.id, nextUnit.id)">{{ labels.next }} →<strong>{{ localizedText(nextUnit.title) }}</strong></router-link>
      <router-link v-else :to="courseOverviewRoute(course.id)">{{ labels.back }} →</router-link>
    </nav>
  </div>
</template>
