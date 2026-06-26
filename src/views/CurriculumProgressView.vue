<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { curriculumModuleById } from '../curriculum/catalog.ts'
import {
  createDefaultLearningProgressV2,
  migrateLearningProgressV2,
  selectContinueLearning,
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
