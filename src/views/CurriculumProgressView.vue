<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { curriculumModuleById } from '../curriculum/catalog.ts'
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

function copy(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function localizedText(value: LocalizedCopy) {
  return value[currentLocale.value]
}

onMounted(() => {
  progress.value = migrateLearningProgressV2()
})

const continueTarget = computed(() => selectContinueLearning(progress.value))
const continueModule = computed(() =>
  continueTarget.value ? curriculumModuleById.get(continueTarget.value.moduleId) : undefined,
)
const completedCount = computed(
  () => Object.values(progress.value.modules).filter((moduleState) => moduleState.completed).length,
)
const attemptCount = computed(() =>
  Object.values(progress.value.modules).reduce(
    (total, moduleState) => total + moduleState.attempts.length,
    0,
  ),
)
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
        body: '这里会合并 Algorithm、Math Lab 和 Data Lab 的本地进度，并给出下一步建议。',
        continue: '继续学习',
        noTarget: '核心路线已完成',
        completed: '已完成模块',
        attempts: 'Checkpoint 记录',
        total: '课程模块',
        routes: '路线入口',
        recentEvidence: '最近实验证据',
        noEvidence: '完成一次互动实验后，这里会显示最近记录的观察指标。',
        capturedAt: '记录时间',
        observationRecorded: '已记录观察',
        explanationComplete: '解释已完成',
        needsExplanation: '待补充解释',
        checkpointComplete: 'checkpoint 已完成',
        checkpointMissing: 'checkpoint 待完成',
      }
    : {
        eyebrow: 'Progress',
        title: 'Continue through the unified learning route',
        body: 'This page merges local Algorithm, Math Lab, and Data Lab progress and recommends the next step.',
        continue: 'Continue Learning',
        noTarget: 'Core route complete',
        completed: 'Completed Modules',
        attempts: 'Checkpoint Records',
        total: 'Course Modules',
        routes: 'Route Entrypoints',
        recentEvidence: 'Recent Experiment Evidence',
        noEvidence: 'Complete an interactive lab and the latest observed metrics will appear here.',
        capturedAt: 'Captured',
        observationRecorded: 'Observation recorded',
        explanationComplete: 'Explanation complete',
        needsExplanation: 'Needs explanation',
        checkpointComplete: 'Checkpoint complete',
        checkpointMissing: 'Checkpoint pending',
      },
)

const nextLinks = [
  {
    id: 'core-learning-path',
    route: '/tracks/core-learning-path',
    label: copy('核心学习路径', 'Core Learning Path'),
  },
  {
    id: 'project-practice',
    route: '/tracks/project-practice',
    label: copy('项目实战', 'Project Practice'),
  },
]

function evidenceModuleTitle(moduleId: string) {
  return localizedText(curriculumModuleById.get(moduleId)?.title ?? copy(moduleId, moduleId))
}

function evidenceValueText(value: string | number | LocalizedCopy) {
  if (typeof value === 'string' || typeof value === 'number') return String(value)
  return localizedText(value)
}

function evidenceTaskStatuses(evidence: LearningProgressLabEvidence) {
  const moduleState = progress.value.modules[evidence.moduleId]
  return [
    pageCopy.value.observationRecorded,
    evidence.task?.completed ? pageCopy.value.explanationComplete : pageCopy.value.needsExplanation,
    moduleState?.completed ? pageCopy.value.checkpointComplete : pageCopy.value.checkpointMissing,
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
    <section class="curriculum-hero">
      <div>
        <span class="eyebrow">{{ pageCopy.eyebrow }}</span>
        <h1>{{ pageCopy.title }}</h1>
        <p>{{ pageCopy.body }}</p>
      </div>
      <div class="curriculum-hero__metrics">
        <article>
          <span>{{ pageCopy.completed }}</span>
          <strong>{{ completedCount }}</strong>
        </article>
        <article>
          <span>{{ pageCopy.attempts }}</span>
          <strong>{{ attemptCount }}</strong>
        </article>
        <article>
          <span>{{ pageCopy.total }}</span>
          <strong>{{ curriculumModuleById.size }}</strong>
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
