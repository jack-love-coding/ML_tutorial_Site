<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  classicalSupervisedCorridor,
  classicalSupervisedCorridorById,
  type ClassicalSupervisedCorridorModuleId,
} from '../curriculum/milestones/classicalSupervisedCorridor.ts'
import { courseUnitRoute } from '../curriculum/courses/routes.ts'
import type { AppLocale } from '../types/ml.ts'

const props = defineProps<{ moduleId: ClassicalSupervisedCorridorModuleId }>()
const { locale } = useI18n()
const currentLocale = computed(() => locale.value as AppLocale)
const currentStep = computed(() => classicalSupervisedCorridorById.get(props.moduleId)!)
const previousStep = computed(() => currentStep.value.previousModuleId
  ? classicalSupervisedCorridorById.get(currentStep.value.previousModuleId)
  : undefined)
const nextStep = computed(() => currentStep.value.nextModuleId
  ? classicalSupervisedCorridorById.get(currentStep.value.nextModuleId)
  : undefined)
const courseRoute = computed(() => courseUnitRoute('ai-foundation', currentStep.value.courseUnitIds[0]))

const localized = (value: { 'zh-CN': string; en: string }) => value[currentLocale.value]
const labels = computed(() => currentLocale.value === 'zh-CN'
  ? {
      eyebrow: 'v1.1 · 经典监督学习走廊',
      title: '从目标函数到可解释决策',
      progress: `第 ${currentStep.value.order} / ${classicalSupervisedCorridor.length} 步`,
      previous: '回到上一模块',
      next: '进入下一模块',
      course: '回到 AI 基础大纲单元',
      complete: '走廊终点：完成分类决策后，可回到大纲进行成果自检。',
    }
  : {
      eyebrow: 'v1.1 · Classical supervised corridor',
      title: 'From objectives to explainable decisions',
      progress: `Step ${currentStep.value.order} of ${classicalSupervisedCorridor.length}`,
      previous: 'Previous module',
      next: 'Next module',
      course: 'Return to the AI Foundations unit',
      complete: 'Corridor endpoint: return to the syllabus unit for artifact self-checks.',
    })
</script>

<template>
  <nav class="corridor-nav" :aria-label="labels.title">
    <header class="corridor-nav__header">
      <div>
        <span class="eyebrow">{{ labels.eyebrow }}</span>
        <h2>{{ labels.title }}</h2>
      </div>
      <strong>{{ labels.progress }}</strong>
    </header>

    <ol class="corridor-nav__steps">
      <li
        v-for="step in classicalSupervisedCorridor"
        :key="step.id"
        :class="{ 'is-current': step.id === moduleId }"
      >
        <router-link :to="step.route" :aria-current="step.id === moduleId ? 'step' : undefined">
          <span>{{ String(step.order).padStart(2, '0') }}</span>
          <strong>{{ localized(step.title) }}</strong>
          <small>{{ localized(step.role) }}</small>
        </router-link>
      </li>
    </ol>

    <div class="corridor-nav__actions">
      <router-link v-if="previousStep" :to="previousStep.route" class="corridor-nav__action">
        <span>{{ labels.previous }}</span>
        <strong>{{ localized(previousStep.title) }}</strong>
      </router-link>
      <p v-else class="corridor-nav__boundary">{{ localized(currentStep.role) }}</p>

      <router-link :to="courseRoute" class="corridor-nav__course-link">{{ labels.course }}</router-link>

      <router-link v-if="nextStep" :to="nextStep.route" class="corridor-nav__action corridor-nav__action--next">
        <span>{{ labels.next }}</span>
        <strong>{{ localized(nextStep.title) }}</strong>
      </router-link>
      <p v-else class="corridor-nav__boundary corridor-nav__boundary--complete">{{ labels.complete }}</p>
    </div>
  </nav>
</template>
