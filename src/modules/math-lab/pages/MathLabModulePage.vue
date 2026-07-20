<script setup lang="ts">
import { computed, defineAsyncComponent, ref, watch, type Component } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import CheckpointQuiz from '../components/CheckpointQuiz.vue'
import CheckpointReportCard from '../components/CheckpointReportCard.vue'
import CodeLab from '../components/CodeLab.vue'
import LabTaskCard from '../components/LabTaskCard.vue'
import ManimPlayer from '../components/ManimPlayer.vue'
import MathLabNotebookCompanion from '../components/MathLabNotebookCompanion.vue'
import MisconceptionCard from '../components/MisconceptionCard.vue'
import ObservationPrompt from '../components/ObservationPrompt.vue'
import { conceptIllustrationFor, type ConceptIllustration } from '../data/conceptIllustrations'
import { amesNumericalNotebookForModule } from '../data/amesNumericalNotebook.ts'
import { numericalBatch2NotebookForModule } from '../data/numericalBatch2Notebook.ts'
import { checkpointReportForModule, observationPromptForModule } from '../data/checkpointReports'
import { routeNavigationForModule } from '../data/learningRoutes'
import { mathLabModuleRegistry, mathLabModules } from '../data/modules'
import type {
  ExperimentEvidence,
  LabConfig,
  MathLabComponentName,
  MathLabLocale,
  MathLabModuleId,
  MathLabSection,
  VisualAsset,
} from '../types/mathLab'
import { withPublicBase } from '../../../utils/publicPath.ts'
import {
  migrateLearningProgressV2,
  recordLearningProgressLabEvidence,
  type LearningProgressLabEvidence,
  type LearningProgressLabTaskInput,
} from '../../../curriculum/progress.ts'
import { resolveMathLabModuleId } from '../utils/continueRoute'
import {
  loadMathLabProgress,
  saveMathLabProgress,
  setLastVisitedModule,
} from '../utils/progress'

const route = useRoute()
const router = useRouter()
const { locale } = useI18n()
const progress = ref(loadMathLabProgress())
const learningProgress = ref(migrateLearningProgressV2())
const latestEvidence = ref<Record<string, ExperimentEvidence>>({})
const labComponentRegistry = {
  ArchitectureMathLab: defineAsyncComponent(() => import('../labs/ArchitectureMathLab.vue')),
  AutodiffGraphLab: defineAsyncComponent(() => import('../labs/AutodiffGraphLab.vue')),
  BackpropBlockLab: defineAsyncComponent(() => import('../labs/BackpropBlockLab.vue')),
  ConditionalBayesLab: defineAsyncComponent(() => import('../labs/ConditionalBayesLab.vue')),
  ConditionNumbersLab: defineAsyncComponent(() => import('../labs/ConditionNumbersLab.vue')),
  DistributionBuilderLab: defineAsyncComponent(() => import('../labs/DistributionBuilderLab.vue')),
  EigenDirectionLab: defineAsyncComponent(() => import('../labs/EigenDirectionLab.vue')),
  FeatureVectorStoryLab: defineAsyncComponent(() => import('../labs/FeatureVectorStoryLab.vue')),
  FiniteDifferenceLab: defineAsyncComponent(() => import('../labs/FiniteDifferenceLab.vue')),
  LocalChangeStoryLab: defineAsyncComponent(() => import('../labs/LocalChangeStoryLab.vue')),
  LuDecompositionLab: defineAsyncComponent(() => import('../labs/LuDecompositionLab.vue')),
  MarkovChainLab: defineAsyncComponent(() => import('../labs/MarkovChainLab.vue')),
  MathGradientLab: defineAsyncComponent(() => import('../labs/MathGradientLab.vue')),
  MatrixColumnSpaceLab: defineAsyncComponent(() => import('../labs/MatrixColumnSpaceLab.vue')),
  MatrixTransformLab: defineAsyncComponent(() => import('../labs/MatrixTransformLab.vue')),
  MathToCodeMatrixLab: defineAsyncComponent(() => import('../labs/MathToCodeMatrixLab.vue')),
  MathToCodeStudioLab: defineAsyncComponent(() => import('../labs/MathToCodeStudioLab.vue')),
  MonteCarloLab: defineAsyncComponent(() => import('../labs/MonteCarloLab.vue')),
  NonlinearEquationsLab: defineAsyncComponent(() => import('../labs/NonlinearEquationsLab.vue')),
  NumericalMiniLab: defineAsyncComponent(() => import('../labs/NumericalMiniLab.vue')),
  OptimizerRaceLab: defineAsyncComponent(() => import('../labs/OptimizerRaceLab.vue')),
  PartialDerivativeContourLab: defineAsyncComponent(() => import('../labs/PartialDerivativeContourLab.vue')),
  PcaProjectionLab: defineAsyncComponent(() => import('../labs/PcaProjectionLab.vue')),
  ProbabilityEntropyLab: defineAsyncComponent(() => import('../labs/ProbabilityEntropyLab.vue')),
  PredictionMappingLab: defineAsyncComponent(() => import('../labs/PredictionMappingLab.vue')),
  SparseMatrixLab: defineAsyncComponent(() => import('../labs/SparseMatrixLab.vue')),
  TaylorSeriesLab: defineAsyncComponent(() => import('../labs/TaylorSeriesLab.vue')),
  TensorShapeLab: defineAsyncComponent(() => import('../labs/TensorShapeLab.vue')),
  TrainingDiagnosticsLab: defineAsyncComponent(() => import('../labs/TrainingDiagnosticsLab.vue')),
  VectorDotProductLab: defineAsyncComponent(() => import('../labs/VectorDotProductLab.vue')),
  VectorSimilarityLab: defineAsyncComponent(() => import('../labs/VectorSimilarityLab.vue')),
  BatchGradientNoiseLab: defineAsyncComponent(() => import('../labs/BatchGradientNoiseLab.vue')),
} satisfies Record<MathLabComponentName, Component>

const currentLocale = computed(() => locale.value as MathLabLocale)
const moduleId = computed(() => route.params.moduleId as MathLabModuleId)
const moduleDefinition = computed(() => mathLabModuleRegistry[moduleId.value])
const notebookCompanion = computed(() =>
  amesNumericalNotebookForModule(moduleId.value) ?? numericalBatch2NotebookForModule(moduleId.value),
)
const moduleIndex = computed(() =>
  mathLabModules.findIndex((candidate) => candidate.id === moduleDefinition.value?.id),
)
const routeNavigation = computed(() => routeNavigationForModule(route.query.route, moduleId.value))
const displayOrder = computed(() => routeNavigation.value?.displayOrder ?? moduleDefinition.value?.order)
const effectivePrerequisiteIds = computed(() => routeNavigation.value
  ? routeNavigation.value.effectivePrerequisiteIds ?? moduleDefinition.value?.prerequisites ?? []
  : moduleDefinition.value?.prerequisites ?? [])
const effectivePrerequisites = computed(() => effectivePrerequisiteIds.value
  .map((id) => mathLabModuleRegistry[id])
  .filter((candidate) => Boolean(candidate)))
const routeEntryAssumptions = computed(() => routeNavigation.value?.entryAssumptions ?? [])
const previousModule = computed(() => {
  if (routeNavigation.value) return routeNavigation.value.previousModuleId
    ? mathLabModuleRegistry[routeNavigation.value.previousModuleId]
    : undefined
  return moduleIndex.value > 0 ? mathLabModules[moduleIndex.value - 1] : undefined
})
const nextModule = computed(() => {
  if (routeNavigation.value) return routeNavigation.value.nextModuleId
    ? mathLabModuleRegistry[routeNavigation.value.nextModuleId]
    : undefined
  return moduleDefinition.value?.nextModuleIds[0]
    ? mathLabModuleRegistry[moduleDefinition.value.nextModuleIds[0]]
    : undefined
})
function moduleRouteFor(targetModuleId: MathLabModuleId) {
  const path = `/math-lab/modules/${targetModuleId}`
  return routeNavigation.value
    ? { path, query: { route: routeNavigation.value.routeId } }
    : path
}
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
const firstInlineVisualSectionById = computed(() => {
  const sectionByVisualId = new Map<string, string>()
  for (const section of moduleDefinition.value?.sections ?? []) {
    for (const visualId of section.visualIds ?? []) {
      if (!sectionByVisualId.has(visualId)) sectionByVisualId.set(visualId, section.id)
    }
  }
  return sectionByVisualId
})
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
    learningProgress.value = migrateLearningProgressV2()
  },
  { immediate: true },
)

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
  learningProgress.value = recordLearningProgressLabEvidence(migrateLearningProgressV2(), evidence)
}

function latestEvidenceForLab(lab: LabConfig) {
  if (!lab.task) return undefined
  return latestEvidence.value[moduleDefinition.value?.id ?? moduleId.value]
}

function savedLabEvidenceFor(lab: LabConfig): LearningProgressLabEvidence | undefined {
  if (!lab.task) return undefined

  const activeModuleId = moduleDefinition.value?.id ?? moduleId.value
  const liveEvidence = latestEvidenceForLab(lab)
  return learningProgress.value.labEvidence.find((evidence) =>
    evidence.moduleId === activeModuleId &&
    (!liveEvidence || evidence.sourceId === liveEvidence.sourceId),
  ) ?? learningProgress.value.labEvidence.find((evidence) => evidence.moduleId === activeModuleId)
}

function onLabTaskSave(payload: {
  lab: LabConfig
  evidence: ExperimentEvidence
  task: LearningProgressLabTaskInput
}) {
  const nextEvidence = {
    ...latestEvidence.value,
    [payload.evidence.moduleId]: payload.evidence,
  }
  latestEvidence.value = nextEvidence
  learningProgress.value = recordLearningProgressLabEvidence(
    migrateLearningProgressV2(),
    {
      ...payload.evidence,
      task: payload.task,
    },
  )
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

function visualDomId(assetId: string, sectionId: string) {
  return firstInlineVisualSectionById.value.get(assetId) === sectionId
    ? assetId
    : `${assetId}--${sectionId}`
}

function labsForSection(section: MathLabSection): LabConfig[] {
  if (!section.labIds?.length) return []
  const sectionLabIds = new Set(section.labIds)
  return moduleDefinition.value?.labs.filter((lab) => sectionLabIds.has(lab.id)) ?? []
}

function labComponentFor(componentName: MathLabComponentName) {
  return labComponentRegistry[componentName]
}

function labPropsFor(lab: LabConfig) {
  if (lab.componentName === 'NumericalMiniLab') {
    return { moduleId: moduleDefinition.value?.id ?? moduleId.value, locale: currentLocale.value }
  }

  return { locale: currentLocale.value }
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
          {{ currentLocale === 'zh-CN' ? `第 ${displayOrder} 章` : `Chapter ${displayOrder}` }}
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

    <section v-if="routeNavigation" class="math-lab-panel math-route-prerequisites">
      <header class="section-header">
        <span class="eyebrow">{{ currentLocale === 'zh-CN' ? '当前路线' : 'Current route' }}</span>
        <h2>{{ currentLocale === 'zh-CN' ? '这一步实际使用的前置知识' : 'Effective prerequisites for this step' }}</h2>
      </header>
      <ul v-if="effectivePrerequisites.length">
        <li v-for="prerequisite in effectivePrerequisites" :key="prerequisite.id">
          {{ prerequisite.title[currentLocale] }}
        </li>
      </ul>
      <p v-else>{{ currentLocale === 'zh-CN' ? '无需先完成本路线中的其他章节。' : 'No earlier chapter in this route is required.' }}</p>
      <p v-if="routeEntryAssumptions.length">
        <strong>{{ currentLocale === 'zh-CN' ? '入门假设：' : 'Entry assumptions: ' }}</strong>
        {{ routeEntryAssumptions.map((assumption) => assumption.label[currentLocale]).join('；') }}
      </p>
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

        <MathLabNotebookCompanion
          v-if="notebookCompanion"
          :companion="notebookCompanion"
          :locale="currentLocale"
        />

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
          <CodeLab
            v-if="concept.codeExample"
            :title="concept.name[currentLocale]"
            :code="concept.codeExample"
            :output="concept.codeOutput?.[currentLocale]"
            :label="currentLocale === 'zh-CN' ? '代码示例' : 'Code example'"
            :copy-label="currentLocale === 'zh-CN' ? '复制代码' : 'Copy code'"
            :copied-label="currentLocale === 'zh-CN' ? '已复制' : 'Copied'"
            :output-label="currentLocale === 'zh-CN' ? '运行输出' : 'Output'"
          />
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
              :id="visualDomId(asset.id, section.id)"
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

            <div
              v-for="asset in manimAssetsForSection(section)"
              :id="visualDomId(asset.id, section.id)"
              :key="asset.id"
            >
              <ManimPlayer
                :asset="asset"
                :accent="moduleDefinition.accent"
                :locale="currentLocale"
              />
            </div>

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
                <LabTaskCard
                  v-if="lab.task"
                  :lab="lab"
                  :locale="currentLocale"
                  :evidence="latestEvidenceForLab(lab)"
                  :saved-evidence="savedLabEvidenceFor(lab)"
                  @task-save="onLabTaskSave"
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
            <figure v-if="asset.type === 'image'" :id="asset.id" class="math-visual-asset">
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
            <div v-else :id="asset.id">
              <ManimPlayer
                :asset="asset"
                :accent="moduleDefinition.accent"
                :locale="currentLocale"
              />
            </div>
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
              <LabTaskCard
                v-if="lab.task"
                :lab="lab"
                :locale="currentLocale"
                :evidence="latestEvidenceForLab(lab)"
                :saved-evidence="savedLabEvidenceFor(lab)"
                @task-save="onLabTaskSave"
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
            <strong>{{ currentLocale === 'zh-CN' ? '教学模块' : 'Learning module' }}</strong>
            <span>{{ currentLocale === 'zh-CN' ? '预计' : 'Estimated' }} {{ moduleDefinition.estimatedMinutes }} min</span>
          </div>

          <div class="math-article-nav__actions">
            <router-link v-if="previousModule" class="action-button" :to="moduleRouteFor(previousModule.id)">
              {{ currentLocale === 'zh-CN' ? '上一章' : 'Previous chapter' }}
            </router-link>
            <router-link v-if="nextModule" class="action-button action-button--primary" :to="moduleRouteFor(nextModule.id)">
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
