<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import CheckpointQuiz from '../components/CheckpointQuiz.vue'
import CodeLab from '../components/CodeLab.vue'
import ManimPlayer from '../components/ManimPlayer.vue'
import MisconceptionCard from '../components/MisconceptionCard.vue'
import FiniteDifferenceLab from '../labs/FiniteDifferenceLab.vue'
import MathGradientLab from '../labs/MathGradientLab.vue'
import MatrixTransformLab from '../labs/MatrixTransformLab.vue'
import MonteCarloLab from '../labs/MonteCarloLab.vue'
import ConditionNumbersLab from '../labs/ConditionNumbersLab.vue'
import LuDecompositionLab from '../labs/LuDecompositionLab.vue'
import MarkovChainLab from '../labs/MarkovChainLab.vue'
import NumericalMiniLab from '../labs/NumericalMiniLab.vue'
import SparseMatrixLab from '../labs/SparseMatrixLab.vue'
import TaylorSeriesLab from '../labs/TaylorSeriesLab.vue'
import VectorDotProductLab from '../labs/VectorDotProductLab.vue'
import { mathLabModuleRegistry, mathLabModules } from '../data/modules'
import type { LabConfig, MathLabLocale, MathLabModuleId, MathLabSection, QuizAttempt } from '../types/mathLab'
import {
  appendQuizAttempt,
  loadMathLabProgress,
  markModuleComplete,
  saveMathLabProgress,
  setLastVisitedModule,
} from '../utils/progress'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const progress = ref(loadMathLabProgress())

const currentLocale = computed(() => locale.value as MathLabLocale)
const moduleId = computed(() => route.params.moduleId as MathLabModuleId)
const moduleDefinition = computed(() => mathLabModuleRegistry[moduleId.value])
const moduleIndex = computed(() =>
  mathLabModules.findIndex((candidate) => candidate.id === moduleDefinition.value?.id),
)
const previousModule = computed(() => (moduleIndex.value > 0 ? mathLabModules[moduleIndex.value - 1] : undefined))
const nextModule = computed(() => moduleDefinition.value?.nextModuleIds[0]
  ? mathLabModuleRegistry[moduleDefinition.value.nextModuleIds[0]]
  : undefined)
const manimAssets = computed(() =>
  moduleDefinition.value?.visuals.filter((visual) => visual.type === 'manim-video') ?? [],
)
const inlineVisualIds = computed(
  () => new Set(moduleDefinition.value?.sections.flatMap((section) => section.visualIds ?? []) ?? []),
)
const inlineLabIds = computed(
  () => new Set(moduleDefinition.value?.sections.flatMap((section) => section.labIds ?? []) ?? []),
)
const remainingManimAssets = computed(() => manimAssets.value.filter((asset) => !inlineVisualIds.value.has(asset.id)))
const remainingLabs = computed(() =>
  moduleDefinition.value?.labs.filter((lab) => !inlineLabIds.value.has(lab.id)) ?? [],
)
const hasSupplements = computed(() => remainingManimAssets.value.length > 0 || remainingLabs.value.length > 0)

if (!moduleDefinition.value) {
  router.replace('/math-lab')
}

watch(
  moduleId,
  (nextModuleId) => {
    if (!mathLabModuleRegistry[nextModuleId]) {
      router.replace('/math-lab')
      return
    }
    progress.value = saveMathLabProgress(setLastVisitedModule(loadMathLabProgress(), nextModuleId))
  },
  { immediate: true },
)

function onQuizSubmit(attempts: QuizAttempt[]) {
  const correct = attempts.filter((attempt) => attempt.correct).length
  const enoughToComplete = attempts.length > 0 && correct / attempts.length >= 0.66
  let nextProgress = loadMathLabProgress()

  for (const attempt of attempts) {
    nextProgress = appendQuizAttempt(nextProgress, attempt)
  }

  if (enoughToComplete) {
    nextProgress = markModuleComplete(nextProgress, moduleId.value)
  }

  progress.value = saveMathLabProgress(nextProgress)
}

function manimAssetsForSection(section: MathLabSection) {
  if (!section.visualIds?.length) return []
  const sectionVisualIds = new Set(section.visualIds)
  return manimAssets.value.filter((asset) => sectionVisualIds.has(asset.id))
}

function labsForSection(section: MathLabSection): LabConfig[] {
  if (!section.labIds?.length) return []
  const sectionLabIds = new Set(section.labIds)
  return moduleDefinition.value?.labs.filter((lab) => sectionLabIds.has(lab.id)) ?? []
}
</script>

<template>
  <div v-if="moduleDefinition" class="math-lab-page">
    <section
      class="math-lab-module-hero math-lab-module-hero--article"
      :style="{ '--math-accent': moduleDefinition.accent, '--math-theme': moduleDefinition.theme }"
    >
      <div>
        <span class="eyebrow">
          {{ currentLocale === 'zh-CN' ? `第 ${moduleDefinition.order} 章` : `Chapter ${moduleDefinition.order}` }}
        </span>
        <h1>{{ moduleDefinition.title[currentLocale] }}</h1>
        <p>{{ moduleDefinition.subtitle[currentLocale] }}</p>
      </div>

      <aside v-if="moduleDefinition.aiModelConnections.length">
        <span>{{ currentLocale === 'zh-CN' ? '学习连接' : 'Learning connections' }}</span>
        <p v-for="connection in moduleDefinition.aiModelConnections" :key="connection.en">
          {{ connection[currentLocale] }}
        </p>
      </aside>
    </section>

    <section class="math-module-layout math-module-layout--article">
      <main class="math-module-main">
        <section v-if="moduleDefinition.learningObjectives.length" class="math-lab-panel">
          <header class="section-header">
            <span class="eyebrow">{{ currentLocale === 'zh-CN' ? '学习目标' : 'Learning goals' }}</span>
            <h2>{{ currentLocale === 'zh-CN' ? '本章读完后应该能做到' : 'What this chapter should unlock' }}</h2>
          </header>
          <div class="math-objective-list">
            <article v-for="objective in moduleDefinition.learningObjectives" :key="objective.en">
              <MarkdownMathContent :source="objective[currentLocale]" />
            </article>
          </div>
        </section>

        <section
          v-for="concept in moduleDefinition.concepts"
          :key="concept.id"
          class="math-lab-panel math-concept-section"
        >
          <span>{{ currentLocale === 'zh-CN' ? '公式焦点' : 'Formula focus' }}</span>
          <h2>{{ concept.name[currentLocale] }}</h2>
          <MarkdownMathContent :source="`$$${concept.formulaLatex}$$`" />
          <div class="math-explanation-grid">
            <article>
              <span>{{ currentLocale === 'zh-CN' ? '直觉' : 'Intuition' }}</span>
              <MarkdownMathContent :source="concept.plainExplanation[currentLocale]" />
            </article>
            <article>
              <span>{{ currentLocale === 'zh-CN' ? '模型连接' : 'Model link' }}</span>
              <MarkdownMathContent :source="concept.modelConnection[currentLocale]" />
            </article>
          </div>
          <CodeLab v-if="concept.codeExample" :title="concept.name[currentLocale]" :code="concept.codeExample" />
        </section>

        <template v-for="section in moduleDefinition.sections" :key="section.id">
          <article
            :id="section.id"
            class="math-lab-panel math-article-section"
          >
            <header>
              <span>{{ currentLocale === 'zh-CN' ? '章节内容' : 'Section' }}</span>
              <h2>{{ section.title[currentLocale] }}</h2>
            </header>
            <MarkdownMathContent :source="section.content[currentLocale]" />
          </article>

          <section
            v-if="manimAssetsForSection(section).length || labsForSection(section).length"
            class="math-inline-supplement-section"
          >
            <ManimPlayer
              v-for="asset in manimAssetsForSection(section)"
              :key="asset.id"
              :asset="asset"
              :accent="moduleDefinition.accent"
              :locale="currentLocale"
            />

            <section v-if="labsForSection(section).length" class="math-module-labs">
              <template v-for="lab in labsForSection(section)" :key="lab.id">
                <VectorDotProductLab
                  v-if="lab.componentName === 'VectorDotProductLab'"
                  :locale="currentLocale"
                />
                <MatrixTransformLab
                  v-else-if="lab.componentName === 'MatrixTransformLab'"
                  :locale="currentLocale"
                />
                <MathGradientLab
                  v-else-if="lab.componentName === 'MathGradientLab'"
                  :locale="currentLocale"
                />
                <TaylorSeriesLab
                  v-else-if="lab.componentName === 'TaylorSeriesLab'"
                  :locale="currentLocale"
                />
                <MonteCarloLab
                  v-else-if="lab.componentName === 'MonteCarloLab'"
                  :locale="currentLocale"
                />
                <LuDecompositionLab
                  v-else-if="lab.componentName === 'LuDecompositionLab'"
                  :locale="currentLocale"
                />
                <SparseMatrixLab
                  v-else-if="lab.componentName === 'SparseMatrixLab'"
                  :locale="currentLocale"
                />
                <ConditionNumbersLab
                  v-else-if="lab.componentName === 'ConditionNumbersLab'"
                  :locale="currentLocale"
                />
                <MarkovChainLab
                  v-else-if="lab.componentName === 'MarkovChainLab'"
                  :locale="currentLocale"
                />
                <FiniteDifferenceLab
                  v-else-if="lab.componentName === 'FiniteDifferenceLab'"
                  :locale="currentLocale"
                />
                <NumericalMiniLab
                  v-else
                  :module-id="moduleDefinition.id"
                  :locale="currentLocale"
                />
              </template>
            </section>
          </section>
        </template>

        <section v-if="hasSupplements" class="math-lab-panel math-supplement-section">
          <header>
            <span>{{ currentLocale === 'zh-CN' ? '补充实验' : 'Supplemental lab' }}</span>
            <h2>{{ currentLocale === 'zh-CN' ? '用现有互动实验巩固本章直觉' : 'Use the existing interactive labs to reinforce the note' }}</h2>
          </header>

          <ManimPlayer
            v-for="asset in remainingManimAssets"
            :key="asset.id"
            :asset="asset"
            :accent="moduleDefinition.accent"
            :locale="currentLocale"
          />

          <section v-if="remainingLabs.length" class="math-module-labs">
            <template v-for="lab in remainingLabs" :key="lab.id">
              <VectorDotProductLab
                v-if="lab.componentName === 'VectorDotProductLab'"
                :locale="currentLocale"
              />
              <MatrixTransformLab
                v-else-if="lab.componentName === 'MatrixTransformLab'"
                :locale="currentLocale"
              />
              <MathGradientLab
                v-else-if="lab.componentName === 'MathGradientLab'"
                :locale="currentLocale"
              />
              <TaylorSeriesLab
                v-else-if="lab.componentName === 'TaylorSeriesLab'"
                :locale="currentLocale"
              />
              <MonteCarloLab
                v-else-if="lab.componentName === 'MonteCarloLab'"
                :locale="currentLocale"
              />
              <LuDecompositionLab
                v-else-if="lab.componentName === 'LuDecompositionLab'"
                :locale="currentLocale"
              />
              <SparseMatrixLab
                v-else-if="lab.componentName === 'SparseMatrixLab'"
                :locale="currentLocale"
              />
              <ConditionNumbersLab
                v-else-if="lab.componentName === 'ConditionNumbersLab'"
                :locale="currentLocale"
              />
              <MarkovChainLab
                v-else-if="lab.componentName === 'MarkovChainLab'"
                :locale="currentLocale"
              />
              <FiniteDifferenceLab
                v-else-if="lab.componentName === 'FiniteDifferenceLab'"
                :locale="currentLocale"
              />
              <NumericalMiniLab
                v-else
                :module-id="moduleDefinition.id"
                :locale="currentLocale"
              />
            </template>
          </section>
        </section>

        <section v-if="moduleDefinition.misconceptions.length" class="math-misconception-grid">
          <MisconceptionCard
            v-for="misconception in moduleDefinition.misconceptions"
            :key="misconception.id"
            :misconception="misconception"
            :locale="currentLocale"
          />
        </section>

        <CheckpointQuiz
          v-if="moduleDefinition.quizzes.length"
          :module-id="moduleDefinition.id"
          :quizzes="moduleDefinition.quizzes"
          :locale="currentLocale"
          @submit="onQuizSubmit"
        />
      </main>

      <aside class="math-module-side">
        <div class="math-lab-panel math-lab-panel--sticky math-article-nav">
          <span>{{ currentLocale === 'zh-CN' ? '章节目录' : 'Chapter contents' }}</span>
          <nav>
            <a
              v-for="item in moduleDefinition.toc"
              :key="item.id"
              :href="`#${item.id}`"
              :class="`is-level-${item.level}`"
            >
              {{ item.title[currentLocale] }}
            </a>
          </nav>

          <div class="math-article-meta">
            <strong>
              {{
                progress.completedModuleIds.includes(moduleDefinition.id)
                  ? currentLocale === 'zh-CN'
                    ? '已完成'
                    : 'Completed'
                  : currentLocale === 'zh-CN'
                    ? '学习中'
                    : 'In progress'
              }}
            </strong>
            <span>{{ currentLocale === 'zh-CN' ? '预计' : 'Estimated' }} {{ moduleDefinition.estimatedMinutes }} min</span>
          </div>

          <div class="math-article-nav__actions">
            <router-link v-if="previousModule" class="action-button" :to="`/math-lab/modules/${previousModule.id}`">
              {{ currentLocale === 'zh-CN' ? '上一章' : 'Previous chapter' }}
            </router-link>
            <router-link v-if="nextModule" class="action-button action-button--primary" :to="`/math-lab/modules/${nextModule.id}`">
              {{ currentLocale === 'zh-CN' ? '下一章' : 'Next chapter' }}
            </router-link>
            <router-link v-else class="action-button action-button--primary" to="/math-lab">
              {{ currentLocale === 'zh-CN' ? '返回路径' : 'Back to path' }}
            </router-link>
          </div>
        </div>
      </aside>
    </section>
  </div>
</template>
