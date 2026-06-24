<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import CheckpointQuiz from '../components/CheckpointQuiz.vue'
import CheckpointReportCard from '../components/CheckpointReportCard.vue'
import CodeLab from '../components/CodeLab.vue'
import ManimPlayer from '../components/ManimPlayer.vue'
import MisconceptionCard from '../components/MisconceptionCard.vue'
import ObservationPrompt from '../components/ObservationPrompt.vue'
import { conceptIllustrationFor, type ConceptIllustration } from '../data/conceptIllustrations'
import { checkpointReportForModule, observationPromptForModule } from '../data/checkpointReports'
import { mathLabModuleRegistry, mathLabModules } from '../data/modules'
import type {
  ExperimentEvidence,
  LabConfig,
  MathLabLocale,
  MathLabModuleId,
  MathLabSection,
  QuizAttempt,
  VisualAsset,
} from '../types/mathLab'
import { withPublicBase } from '../../../utils/publicPath.ts'
import { resolveMathLabModuleId } from '../utils/continueRoute'
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
const latestEvidence = ref<Record<string, ExperimentEvidence>>({})
const fallbackLabComponent = defineAsyncComponent(() => import('../labs/NumericalMiniLab.vue'))
const labComponentRegistry = {
  ArchitectureMathLab: defineAsyncComponent(() => import('../labs/ArchitectureMathLab.vue')),
  AutodiffGraphLab: defineAsyncComponent(() => import('../labs/AutodiffGraphLab.vue')),
  BackpropBlockLab: defineAsyncComponent(() => import('../labs/BackpropBlockLab.vue')),
  ConditionalBayesLab: defineAsyncComponent(() => import('../labs/ConditionalBayesLab.vue')),
  ConditionNumbersLab: defineAsyncComponent(() => import('../labs/ConditionNumbersLab.vue')),
  DistributionBuilderLab: defineAsyncComponent(() => import('../labs/DistributionBuilderLab.vue')),
  FeatureVectorStoryLab: defineAsyncComponent(() => import('../labs/FeatureVectorStoryLab.vue')),
  FiniteDifferenceLab: defineAsyncComponent(() => import('../labs/FiniteDifferenceLab.vue')),
  LocalChangeStoryLab: defineAsyncComponent(() => import('../labs/LocalChangeStoryLab.vue')),
  LuDecompositionLab: defineAsyncComponent(() => import('../labs/LuDecompositionLab.vue')),
  MarkovChainLab: defineAsyncComponent(() => import('../labs/MarkovChainLab.vue')),
  MathGradientLab: defineAsyncComponent(() => import('../labs/MathGradientLab.vue')),
  MatrixColumnSpaceLab: defineAsyncComponent(() => import('../labs/MatrixColumnSpaceLab.vue')),
  MatrixTransformLab: defineAsyncComponent(() => import('../labs/MatrixTransformLab.vue')),
  MonteCarloLab: defineAsyncComponent(() => import('../labs/MonteCarloLab.vue')),
  NonlinearEquationsLab: defineAsyncComponent(() => import('../labs/NonlinearEquationsLab.vue')),
  PartialDerivativeContourLab: defineAsyncComponent(() => import('../labs/PartialDerivativeContourLab.vue')),
  PcaProjectionLab: defineAsyncComponent(() => import('../labs/PcaProjectionLab.vue')),
  ProbabilityEntropyLab: defineAsyncComponent(() => import('../labs/ProbabilityEntropyLab.vue')),
  SparseMatrixLab: defineAsyncComponent(() => import('../labs/SparseMatrixLab.vue')),
  TaylorSeriesLab: defineAsyncComponent(() => import('../labs/TaylorSeriesLab.vue')),
  TensorShapeLab: defineAsyncComponent(() => import('../labs/TensorShapeLab.vue')),
  TrainingDiagnosticsLab: defineAsyncComponent(() => import('../labs/TrainingDiagnosticsLab.vue')),
  VectorDotProductLab: defineAsyncComponent(() => import('../labs/VectorDotProductLab.vue')),
  VectorSimilarityLab: defineAsyncComponent(() => import('../labs/VectorSimilarityLab.vue')),
  BatchGradientNoiseLab: defineAsyncComponent(() => import('../labs/BatchGradientNoiseLab.vue')),
}

type RegisteredLabComponentName = keyof typeof labComponentRegistry

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
const imageAssets = computed(() =>
  moduleDefinition.value?.visuals.filter((visual) => visual.type === 'image') ?? [],
)
const displayAssets = computed(() =>
  moduleDefinition.value?.visuals.filter((visual) => visual.type === 'manim-video' || visual.type === 'image') ?? [],
)
const inlineVisualIds = computed(
  () => new Set(moduleDefinition.value?.sections.flatMap((section) => section.visualIds ?? []) ?? []),
)
const inlineLabIds = computed(
  () => new Set(moduleDefinition.value?.sections.flatMap((section) => section.labIds ?? []) ?? []),
)
const remainingDisplayAssets = computed(() =>
  displayAssets.value.filter((asset) => !inlineVisualIds.value.has(asset.id)),
)
const remainingLabs = computed(() =>
  moduleDefinition.value?.labs.filter((lab) => !inlineLabIds.value.has(lab.id)) ?? [],
)
const hasSupplements = computed(() => remainingDisplayAssets.value.length > 0 || remainingLabs.value.length > 0)
const checkpointReportPrompt = computed(() => checkpointReportForModule(moduleDefinition.value?.id ?? moduleId.value))
const observationPrompt = computed(() => observationPromptForModule(moduleDefinition.value?.id ?? moduleId.value))
const activeReportEvidence = computed(() => {
  const prompt = checkpointReportPrompt.value
  if (!prompt) return undefined
  return latestEvidence.value[prompt.moduleId]
})

watch(
  moduleId,
  (nextModuleId) => {
    const resolvedModuleId = resolveMathLabModuleId(nextModuleId)
    if (!resolvedModuleId) {
      router.replace('/math-lab')
      return
    }
    if (resolvedModuleId !== nextModuleId) {
      router.replace(`/math-lab/modules/${resolvedModuleId}`)
      return
    }
    progress.value = saveMathLabProgress(setLastVisitedModule(loadMathLabProgress(), resolvedModuleId))
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

function onExperimentEvidence(evidence: ExperimentEvidence | undefined) {
  const nextEvidence = {
    ...latestEvidence.value,
  }

  if (!evidence) {
    const prompt = checkpointReportPrompt.value
    if (prompt) {
      delete nextEvidence[prompt.moduleId]
    }
    latestEvidence.value = nextEvidence
    return
  }

  nextEvidence[evidence.moduleId] = evidence
  latestEvidence.value = nextEvidence
}

function manimAssetsForSection(section: MathLabSection) {
  if (!section.visualIds?.length) return []
  const sectionVisualIds = new Set(section.visualIds)
  return manimAssets.value.filter((asset) => sectionVisualIds.has(asset.id))
}

function imageAssetsForSection(section: MathLabSection) {
  if (!section.visualIds?.length) return []
  const sectionVisualIds = new Set(section.visualIds)
  return imageAssets.value.filter((asset) => sectionVisualIds.has(asset.id))
}

function labsForSection(section: MathLabSection): LabConfig[] {
  if (!section.labIds?.length) return []
  const sectionLabIds = new Set(section.labIds)
  return moduleDefinition.value?.labs.filter((lab) => sectionLabIds.has(lab.id)) ?? []
}

function isRegisteredLabComponent(componentName?: string): componentName is RegisteredLabComponentName {
  return Boolean(componentName && componentName in labComponentRegistry)
}

function labComponentFor(componentName?: string) {
  if (isRegisteredLabComponent(componentName)) {
    return labComponentRegistry[componentName]
  }

  return fallbackLabComponent
}

function labPropsFor(lab: LabConfig) {
  if (isRegisteredLabComponent(lab.componentName)) {
    return { locale: currentLocale.value }
  }

  return { moduleId: moduleDefinition.value?.id ?? moduleId.value, locale: currentLocale.value }
}

function imageSrc(asset: VisualAsset) {
  return withPublicBase(asset.assetPath)
}

function conceptIllustration(conceptId: string) {
  return conceptIllustrationFor(moduleDefinition.value?.id ?? moduleId.value, conceptId)
}

function conceptIllustrationSrc(asset?: ConceptIllustration) {
  return withPublicBase(asset?.assetPath)
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
          <figure
            v-if="conceptIllustration(concept.id)?.status === 'generated'"
            class="math-concept-illustration"
          >
            <img
              :src="conceptIllustrationSrc(conceptIllustration(concept.id))"
              :alt="conceptIllustration(concept.id)?.alt?.[currentLocale] ?? conceptIllustration(concept.id)?.title[currentLocale]"
              loading="lazy"
            />
            <figcaption>
              <strong>{{ conceptIllustration(concept.id)?.title[currentLocale] }}</strong>
              <MarkdownMathContent
                :source="conceptIllustration(concept.id)?.caption?.[currentLocale] ?? conceptIllustration(concept.id)?.transcript[currentLocale] ?? ''"
              />
            </figcaption>
          </figure>
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
            v-if="imageAssetsForSection(section).length || manimAssetsForSection(section).length || labsForSection(section).length"
            class="math-inline-supplement-section"
          >
            <figure
              v-for="asset in imageAssetsForSection(section)"
              :key="asset.id"
              class="math-visual-asset"
            >
              <img
                v-if="asset.assetPath"
                :src="imageSrc(asset)"
                :alt="asset.alt?.[currentLocale] ?? asset.title[currentLocale]"
                loading="lazy"
              />
              <figcaption>
                <strong>{{ asset.title[currentLocale] }}</strong>
                <MarkdownMathContent :source="asset.caption?.[currentLocale] ?? asset.transcript[currentLocale]" />
              </figcaption>
            </figure>

            <ManimPlayer
              v-for="asset in manimAssetsForSection(section)"
              :key="asset.id"
              :asset="asset"
              :accent="moduleDefinition.accent"
              :locale="currentLocale"
            />

            <section v-if="labsForSection(section).length" class="math-module-labs">
              <div
                v-for="lab in labsForSection(section)"
                :id="lab.id"
                :key="lab.id"
              >
                <component
                  :is="labComponentFor(lab.componentName)"
                  v-bind="labPropsFor(lab)"
                  @evidence-change="onExperimentEvidence"
                />
              </div>
            </section>
          </section>
        </template>

        <section v-if="hasSupplements" class="math-lab-panel math-supplement-section">
          <header>
            <span>{{ currentLocale === 'zh-CN' ? '补充实验' : 'Supplemental lab' }}</span>
            <h2>{{ currentLocale === 'zh-CN' ? '用现有互动实验巩固本章直觉' : 'Use the existing interactive labs to reinforce the note' }}</h2>
          </header>

          <template v-for="asset in remainingDisplayAssets" :key="asset.id">
            <figure v-if="asset.type === 'image'" class="math-visual-asset">
              <img
                v-if="asset.assetPath"
                :src="imageSrc(asset)"
                :alt="asset.alt?.[currentLocale] ?? asset.title[currentLocale]"
                loading="lazy"
              />
              <figcaption>
                <strong>{{ asset.title[currentLocale] }}</strong>
                <MarkdownMathContent :source="asset.caption?.[currentLocale] ?? asset.transcript[currentLocale]" />
              </figcaption>
            </figure>
            <ManimPlayer
              v-else
              :asset="asset"
              :accent="moduleDefinition.accent"
              :locale="currentLocale"
            />
          </template>

          <section v-if="remainingLabs.length" class="math-module-labs">
            <div
              v-for="lab in remainingLabs"
              :id="lab.id"
              :key="lab.id"
            >
              <component
                :is="labComponentFor(lab.componentName)"
                v-bind="labPropsFor(lab)"
                @evidence-change="onExperimentEvidence"
              />
            </div>
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

        <ObservationPrompt
          v-if="observationPrompt"
          :key="observationPrompt.id"
          :prompt="observationPrompt"
          :locale="currentLocale"
        />

        <CheckpointReportCard
          v-if="checkpointReportPrompt"
          :key="checkpointReportPrompt.id"
          :prompt="checkpointReportPrompt"
          :evidence="activeReportEvidence"
          :modules="mathLabModules"
          :locale="currentLocale"
        />

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
