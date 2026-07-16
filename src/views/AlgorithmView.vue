<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { moduleRegistry } from '../data/moduleCatalog'
import type { AppLocale, ExperimentConfig, ModuleSlug, StorySection } from '../types/ml'
import { useExperimentStore } from '../stores/experiments'
import { getTeachingInsights } from '../utils/insights'
import StoryScroller from '../components/StoryScroller.vue'
import GradientDescentViz from '../components/GradientDescentViz.vue'
import ClassificationViz from '../components/ClassificationViz.vue'
import TeachingDashboard from '../components/TeachingDashboard.vue'
import LineChart from '../components/LineChart.vue'
import PlaybackDock from '../components/PlaybackDock.vue'
import MarkdownMathContent from '../components/MarkdownMathContent.vue'
import GradientChapterLab from '../components/GradientChapterLab.vue'
import LossFunctionsLessonLab from '../components/LossFunctionsLessonLab.vue'
import LossFunctionsResults from '../components/LossFunctionsResults.vue'
import AlgorithmCheckpointQuiz from '../components/AlgorithmCheckpointQuiz.vue'
import LinearRegressionPagedLesson from '../components/LinearRegressionPagedLesson.vue'
import LogisticRegressionPagedLesson from '../components/LogisticRegressionPagedLesson.vue'
import PythonDataToolsPagedLesson from '../components/PythonDataToolsPagedLesson.vue'
import { pythonDataToolsRuntimeChapters } from '../data/generated/pythonDataToolsRuntime.generated.ts'
import ClassificationLessonLab from '../components/ClassificationLessonLab.vue'
import AiOverviewLessonLab from '../components/AiOverviewLessonLab.vue'
import AppliedWorkflowLessonLab from '../components/AppliedWorkflowLessonLab.vue'
import CnnExplainerLab from '../components/CnnExplainerLab.vue'
import CnnShapeParameterChallengeLab from '../components/CnnShapeParameterChallengeLab.vue'
import MlpPlaygroundCockpit from '../components/MlpPlaygroundCockpit.vue'
import MlpBackpropBridgeLab from '../components/MlpBackpropBridgeLab.vue'
import LessonPage from '../lessons/LessonPage.vue'
import { isLessonPagePilotSlug, lessonLabRegistry } from '../lessons/labRegistry'
import { withPublicBase } from '../utils/publicPath'
import type { AlgorithmQuizAttempt } from '../types/ml'
import {
  appendAlgorithmQuizAttempt,
  loadAlgorithmProgress,
  markAlgorithmModuleComplete,
  saveAlgorithmProgress,
  setLastVisitedAlgorithmModule,
  shouldCompleteAlgorithmModule,
} from '../utils/algorithmProgress'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const experimentStore = useExperimentStore()
const { experiments } = storeToRefs(experimentStore)

const activeChapter = ref('')
const mlpPlaygroundRef = ref<HTMLElement | null>(null)
const progress = ref(loadAlgorithmProgress())
const routeChapterLock = ref('')
let routeChapterScrollFrame = 0
let routeChapterUnlockTimer: number | undefined

const slug = computed(() => {
  const routeSlug = route.params.slug
  const routeModuleId = route.params.moduleId
  if (typeof routeSlug === 'string') return routeSlug as ModuleSlug
  if (typeof routeModuleId === 'string') return routeModuleId as ModuleSlug
  if (route.path.startsWith('/learn/cnn-visualization')) return 'cnn-visualization' as ModuleSlug
  if (route.path.startsWith('/learn/logistic-regression')) return 'logistic-regression' as ModuleSlug
  if (route.path.startsWith('/learn/linear-regression')) return 'linear-regression' as ModuleSlug
  if (route.path.startsWith('/learn/python-notebook')) return 'python-notebook' as ModuleSlug
  return 'linear-regression' as ModuleSlug
})
const requestedChapterId = computed(() => {
  const routeChapterId = route.params.chapterId
  const routeLessonId = route.params.lessonId

  if (typeof routeChapterId === 'string') return routeChapterId
  return typeof routeLessonId === 'string' ? routeLessonId : ''
})
const moduleDefinition = computed(() => moduleRegistry[slug.value])
const currentLocale = computed(() => locale.value as AppLocale)
const lastVisitedModuleSlug = computed(() => progress.value.lastVisitedModuleSlug)
const isGradientPage = computed(() => slug.value === 'gradient-descent')
const isLossFunctionsPage = computed(() => slug.value === 'loss-functions')
const isAiOverviewPage = computed(() => slug.value === 'ai-overview')
const isPythonNotebookPage = computed(() => slug.value === 'python-notebook')
const isHousingProjectPage = computed(() => slug.value === 'housing-price-project')
const isClassificationProjectPage = computed(() => slug.value === 'classification-project')
const isModelSelectionPage = computed(() => slug.value === 'model-selection')
const isTreeForestPage = computed(() => slug.value === 'tree-forest')
const isCnnVisualizationPage = computed(() => slug.value === 'cnn-visualization')
const isSequenceEmbeddingBridgePage = computed(() => slug.value === 'sequence-embedding-bridge')
const isAttentionTransformerPage = computed(() => slug.value === 'attention-transformer')
const isOptimizerComparisonPage = computed(() => slug.value === 'optimizer-comparison')
const isLlmRagPage = computed(() => slug.value === 'llm-rag')
const isWorkflowLessonPage = computed(
  () =>
    isHousingProjectPage.value ||
    isClassificationProjectPage.value ||
    isModelSelectionPage.value ||
    isTreeForestPage.value ||
    isCnnVisualizationPage.value ||
    isSequenceEmbeddingBridgePage.value ||
    isAttentionTransformerPage.value ||
    isOptimizerComparisonPage.value ||
    isLlmRagPage.value,
)
const isLinearRegressionPage = computed(() => slug.value === 'linear-regression')
const isLogisticRegressionPage = computed(() => slug.value === 'logistic-regression')
const isClassificationPage = computed(() => slug.value === 'classification')
const isMlpPage = computed(() => slug.value === 'mlp')
const isLessonPagePilot = computed(() => isLessonPagePilotSlug(slug.value))
const activeLessonLab = computed(() =>
  isLessonPagePilotSlug(slug.value) ? lessonLabRegistry[slug.value] : undefined,
)

if (!moduleDefinition.value) {
  router.replace('/')
}

watch(
  () => [slug.value, requestedChapterId.value] as const,
  ([nextSlug, nextChapterId]) => {
    const nextModuleDefinition = moduleRegistry[nextSlug]
    if (!nextModuleDefinition) {
      router.replace('/')
      return
    }

    experimentStore.ensureExperiment(nextSlug)
    progress.value = saveAlgorithmProgress(
      setLastVisitedAlgorithmModule(loadAlgorithmProgress(), nextSlug),
    )
    const firstChapterId = nextModuleDefinition.chapters[0]?.id ?? ''
    if (nextChapterId) {
      const matchedChapter = nextModuleDefinition.chapters.find((chapter) => chapter.id === nextChapterId)

      if (!matchedChapter) {
        router.replace(`/learn/${nextSlug}/${firstChapterId}`)
        return
      }

      activeChapter.value = matchedChapter.id
      syncChapterPreset(matchedChapter.id)
      syncRouteChapterIntoView(matchedChapter.id)
      return
    }

    activeChapter.value = firstChapterId
  },
  { immediate: true },
)

const experiment = computed(() => experiments.value[slug.value])
const snapshot = computed(() => {
  const currentExperiment = experiment.value
  return currentExperiment?.snapshots[currentExperiment.currentStep]
})

const activeSection = computed(
  () =>
    moduleDefinition.value?.chapters.find((chapter) => chapter.id === activeChapter.value) ??
    moduleDefinition.value?.chapters[0],
)

const activePythonDataToolsChapter = computed(() => {
  if (!isPythonNotebookPage.value) return undefined
  return pythonDataToolsRuntimeChapters.find((chapter) => chapter.id === activeChapter.value)
})

const teachingInsights = computed(() =>
  getTeachingInsights(slug.value, snapshot.value, experiment.value?.config),
)

const emphasizedMetrics = computed(() => activeSection.value?.metricEmphasis ?? [])
const focusTarget = computed(() => activeSection.value?.focusTarget)

const heroStatItems = computed(() => [
  {
    id: 'chapters',
    label: t('common.chapterCount'),
    value: moduleDefinition.value?.chapters.length ?? 0,
  },
  {
    id: 'presets',
    label: t('common.presets'),
    value: moduleDefinition.value?.presets.length ?? 0,
  },
  { id: 'runtime', label: t('common.runtime'), value: t('common.localBrowser') },
])

const moduleStatusLabel = computed(() =>
  progress.value.completedModuleSlugs.includes(slug.value)
    ? locale.value === 'zh-CN'
      ? '算法已完成'
      : 'Completed'
    : locale.value === 'zh-CN'
      ? '学习中'
      : 'In progress',
)

const gradientSectionInsights = computed(() => {
  if (!isGradientPage.value) return teachingInsights.value

  const linkedIds = activeSection.value?.linkedInsightIds ?? []
  if (!linkedIds.length) return teachingInsights.value

  const priority = new Set(linkedIds)
  return [...teachingInsights.value].sort(
    (left, right) => Number(priority.has(right.id)) - Number(priority.has(left.id)),
  )
})

const gradientFeaturedInsights = computed(() => gradientSectionInsights.value.slice(0, 2))

function localizedText(copy?: { 'zh-CN': string; en: string }) {
  if (!copy) return ''
  return copy[locale.value as AppLocale]
}

function sectionTitle(section?: StorySection) {
  if (!section) return ''
  return localizedText(section.title) || t(section.titleKey)
}

function publicAsset(path?: string) {
  return withPublicBase(path)
}

function visualAssetsFor(section?: StorySection) {
  if (!section?.visualIds?.length) return []
  const visualIds = new Set(section.visualIds)
  return moduleDefinition.value?.visuals?.filter((asset) => visualIds.has(asset.id)) ?? []
}

function scrollToMlpPlayground() {
  mlpPlaygroundRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

function sectionCompanionCopy(section?: StorySection) {
  if (!section || !isLossFunctionsPage.value) return undefined

  if (locale.value === 'zh-CN') {
    const sectionNotes: Record<string, { title: string; body: string }> = {
      'why-loss': {
        title: '这一章要建立的直觉',
        body: '先把“误差”和“损失”分开。误差只是差距，损失是我们主动选择的评分规则；规则一变，后面的优化目标也会跟着变。',
      },
      'regression-losses': {
        title: '这一章要看的重点',
        body: '离群点是最好的放大镜。它会立刻暴露 MSE 和 MAE 在真实数据上会形成怎样不同的拟合偏好。',
      },
      'classification-losses': {
        title: '这一章要看的重点',
        body: '不要只盯着 0 和 1。交叉熵真正惩罚的是“错误时有多自信”，以及“正确时是否足够自信”。',
      },
      'likelihood-intuition': {
        title: '这一章要建立的直觉',
        body: '似然是在比较“哪个参数更能解释这批数据”。它不是在问参数本身有多可能，而是在给候选参数做解释力排名。',
      },
      'negative-log': {
        title: '这一章要看的重点',
        body: '把很多个小概率连乘之后，数字会迅速变得很小；取对数再加负号，是把这个概率比较问题翻译成稳定、可优化的损失。',
      },
      'mle-bridge': {
        title: '这一章要建立的桥梁',
        body: '把 loss 看成 negative log-likelihood 之后，损失函数就不再是凭经验挑的公式，而是有概率来源的建模假设。',
      },
    }

    return sectionNotes[section.id]
  }

  const sectionNotes: Record<string, { title: string; body: string }> = {
    'why-loss': {
      title: 'The intuition to build here',
      body: 'Separate error from loss. Error is the gap; loss is the scoring rule we choose for that gap, and the rule changes the objective.',
    },
    'regression-losses': {
      title: 'What to focus on here',
      body: 'Outliers are the fastest way to see the difference. They immediately expose how MSE and MAE prefer different fits on real data.',
    },
    'classification-losses': {
      title: 'What to focus on here',
      body: 'Do not stop at right versus wrong. Cross-entropy is really about how confident the model is when it is right or disastrously wrong.',
    },
    'likelihood-intuition': {
      title: 'The intuition to build here',
      body: 'Likelihood ranks parameter candidates by explanatory power. It is not asking how likely the parameter is by itself.',
    },
    'negative-log': {
      title: 'What to focus on here',
      body: 'Products of many small probabilities shrink quickly. Logs and the minus sign rewrite that comparison as a stable optimization objective.',
    },
    'mle-bridge': {
      title: 'The bridge to build here',
      body: 'Once loss becomes negative log-likelihood, the formula stops feeling arbitrary and starts feeling like a modeling choice.',
    },
  }

  return sectionNotes[section.id]
}

function lessonBridgeFor(section?: StorySection) {
  if (!isLossFunctionsPage.value || !section) return undefined
  if (section.id === 'likelihood-intuition' || section.id === 'negative-log') return undefined

  const isOptimizationBridge =
    section.id === 'why-loss' || section.id === 'regression-losses'

  return locale.value === 'zh-CN'
    ? isOptimizationBridge
      ? {
          route: '/learn/gradient-descent',
          eyebrow: '下一课',
          title: '把损失函数放进梯度下降的地形里',
          body: '当你已经知道误差如何被写成目标函数，下一步就是观察优化器怎样沿着这张地形往下走。',
          cta: '进入梯度下降',
        }
      : {
          route: '/learn/logistic-regression',
          eyebrow: '应用桥接',
          title: '在逻辑回归里看见交叉熵真正工作',
          body: '把这里的概率惩罚直觉带进分类模型，你会更容易理解为什么边界会这样移动。',
          cta: '进入逻辑回归',
        }
    : isOptimizationBridge
      ? {
          route: '/learn/gradient-descent',
          eyebrow: 'Next lesson',
          title: 'See loss functions become optimization landscapes',
          body: 'Once loss is concrete, the next step is watching an optimizer move across that surface.',
          cta: 'Open Gradient Descent',
        }
      : {
          route: '/learn/logistic-regression',
          eyebrow: 'Application bridge',
          title: 'Watch cross-entropy drive a real classifier',
          body: 'Carry this probability-penalty intuition into logistic regression and the boundary story becomes much clearer.',
          cta: 'Open Logistic Regression',
        }
}

let timer: number | undefined

function stopTimer() {
  if (timer) {
    window.clearInterval(timer)
    timer = undefined
  }
}

function stopRouteChapterSync() {
  if (routeChapterScrollFrame) {
    window.cancelAnimationFrame(routeChapterScrollFrame)
    routeChapterScrollFrame = 0
  }
  if (routeChapterUnlockTimer) {
    window.clearTimeout(routeChapterUnlockTimer)
    routeChapterUnlockTimer = undefined
  }
}

function syncRouteChapterIntoView(chapterId: string) {
  routeChapterLock.value = chapterId
  stopRouteChapterSync()
  nextTick(() => {
    routeChapterScrollFrame = window.requestAnimationFrame(() => {
      activeChapter.value = chapterId
      document.getElementById(chapterId)?.scrollIntoView({ behavior: 'auto', block: 'start' })
      routeChapterScrollFrame = window.requestAnimationFrame(() => {
        routeChapterScrollFrame = 0
        activeChapter.value = chapterId
        document.getElementById(chapterId)?.scrollIntoView({ behavior: 'auto', block: 'start' })
        routeChapterUnlockTimer = window.setTimeout(() => {
          if (routeChapterLock.value === chapterId) {
            activeChapter.value = chapterId
            document.getElementById(chapterId)?.scrollIntoView({ behavior: 'auto', block: 'start' })
            routeChapterLock.value = ''
          }
          routeChapterUnlockTimer = undefined
        }, 1200)
      })
    })
  })
}

watch(
  () => [experiment.value?.isPlaying, experiment.value?.config.playbackMs, slug.value],
  () => {
    stopTimer()
    if (!experiment.value?.isPlaying) return

    timer = window.setInterval(() => {
      experimentStore.advance(slug.value)
    }, Number(experiment.value.config.playbackMs))
  },
  { deep: true, immediate: true },
)

onBeforeUnmount(() => {
  stopTimer()
  stopRouteChapterSync()
})

function syncChapterPreset(nextChapter: string) {
  if (isLinearRegressionPage.value || isLogisticRegressionPage.value || isClassificationPage.value || isMlpPage.value) {
    const currentExperiment = experimentStore.ensureExperiment(slug.value)
    if (currentExperiment.isPlaying || Number(currentExperiment.currentStep ?? 0) > 0) return

    const section = moduleDefinition.value?.chapters.find((chapter) => chapter.id === nextChapter)
    const preset = moduleDefinition.value?.presets.find((item) => item.id === section?.presetId)
    if (preset) {
      experimentStore.applyPreset(slug.value, preset.config)
    }
  }
}

function onChapterChange(nextChapter: string) {
  if (routeChapterLock.value && nextChapter !== routeChapterLock.value) return
  activeChapter.value = nextChapter
  if (routeChapterLock.value === nextChapter) {
    routeChapterLock.value = ''
  }
  syncChapterPreset(nextChapter)
}

function patchConfig(partialConfig: Partial<ExperimentConfig>) {
  experimentStore.patchConfig(slug.value, partialConfig)
}

function updateGradientStartPoint(point: { startX: number; startY: number }) {
  experimentStore.pause(slug.value)
  experimentStore.patchConfig(slug.value, point)
}

function onAlgorithmQuizSubmit(attempts: AlgorithmQuizAttempt[]) {
  let nextProgress = loadAlgorithmProgress()

  for (const attempt of attempts) {
    nextProgress = appendAlgorithmQuizAttempt(nextProgress, attempt)
  }

  if (shouldCompleteAlgorithmModule(attempts)) {
    nextProgress = markAlgorithmModuleComplete(nextProgress, slug.value)
  }

  progress.value = saveAlgorithmProgress(nextProgress)
}
</script>

<template>
  <div
    v-if="moduleDefinition && experiment && snapshot"
    class="algorithm-view"
    :class="{
      'algorithm-view--gradient': isGradientPage,
      'algorithm-view--loss': isLossFunctionsPage,
      'algorithm-view--ai-overview': isAiOverviewPage,
      'algorithm-view--workflow': isWorkflowLessonPage,
      'algorithm-view--linear': isLinearRegressionPage,
      'algorithm-view--logistic': isLogisticRegressionPage,
      'algorithm-view--classification': isClassificationPage,
      'algorithm-view--mlp': isMlpPage,
    }"
  >
    <section
      v-if="!isPythonNotebookPage"
      class="algorithm-hero"
      :style="{ '--module-accent': moduleDefinition.accent, '--module-theme': moduleDefinition.theme }"
    >
      <div class="algorithm-hero__copy">
        <span class="eyebrow">{{ t(moduleDefinition.kickerKey) }}</span>
        <h1>{{ t(moduleDefinition.titleKey) }}</h1>
        <p>{{ t(moduleDefinition.introKey) }}</p>
      </div>

      <div class="algorithm-hero__summary">
        <p>{{ t(moduleDefinition.summaryKey) }}</p>
        <div
          class="algorithm-hero__status"
          :class="{ 'is-complete': progress.completedModuleSlugs.includes(moduleDefinition.slug) }"
        >
          <span>{{ moduleStatusLabel }}</span>
          <small v-if="lastVisitedModuleSlug === moduleDefinition.slug">
            {{ currentLocale === 'zh-CN' ? '最近学习' : 'Last visited' }}
          </small>
        </div>
        <div class="algorithm-hero__stats">
          <article v-for="item in heroStatItems" :key="item.id" class="algorithm-hero__stat">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </div>
    </section>

    <LessonPage
      v-if="isLessonPagePilot"
      :module-definition="moduleDefinition"
      :active-id="activeChapter"
      :variant="slug"
      :render-mode="activeLessonLab?.renderMode"
      :show-visuals="activeLessonLab?.showVisuals"
      :show-sources="activeLessonLab?.showSources"
      @change="onChapterChange"
    >
      <template #before-story>
        <template v-if="activeLessonLab?.placement === 'top' && isMlpPage">
          <section ref="mlpPlaygroundRef" class="mlp-playground-stage">
            <MlpPlaygroundCockpit
              :accent="moduleDefinition.accent"
              :section="activeSection"
            />
          </section>

          <button
            type="button"
            class="mlp-playground-jump"
            :aria-label="locale === 'zh-CN' ? '回到 MLP 实验台' : 'Back to MLP playground'"
            @click="scrollToMlpPlayground"
          >
            <span>{{ locale === 'zh-CN' ? '实验台' : 'Lab' }}</span>
            <strong>↑</strong>
          </button>
        </template>
      </template>

      <template #lab="{ section }">
        <AiOverviewLessonLab
          v-if="activeLessonLab?.labId === 'ai-overview-task-lab'"
          :section="section"
        />

        <GradientChapterLab
          v-else-if="activeLessonLab?.labId === 'gradient-chapter-lab'"
          :config="experiment.config"
          :snapshot="snapshot"
          :is-playing="experiment.isPlaying"
          :accent="moduleDefinition.accent"
          :section="section"
          :presets="moduleDefinition.presets"
          :insights="gradientSectionInsights"
          @update-config="(key, value) => experimentStore.updateConfig(slug, key, value)"
          @patch-config="patchConfig"
          @toggle-play="experimentStore.togglePlayback(slug)"
          @step="experimentStore.advance(slug)"
          @replay="experimentStore.replay(slug)"
          @reset="experimentStore.reset(slug)"
          @apply-preset="(config) => experimentStore.applyPreset(slug, config)"
          @update-start-point="updateGradientStartPoint"
        />

        <MlpBackpropBridgeLab
          v-else-if="isMlpPage && section.id === 'backprop'"
          :accent="moduleDefinition.accent"
        />
      </template>
    </LessonPage>

    <PythonDataToolsPagedLesson
      v-else-if="isPythonNotebookPage && activePythonDataToolsChapter"
      :chapter="activePythonDataToolsChapter"
      :locale="currentLocale"
    />

    <section
      v-else-if="isWorkflowLessonPage"
      class="algorithm-layout algorithm-layout--lesson-story algorithm-layout--workflow-story"
    >
      <StoryScroller
        :sections="moduleDefinition.chapters"
        :active-id="activeChapter"
        @change="onChapterChange"
      >
        <template #section="{ section, localizedText: slotLocalizedText }">
          <h3>{{ sectionTitle(section) }}</h3>
          <MarkdownMathContent :source="slotLocalizedText(section.markdown)" />

          <div class="story-companion story-companion--lesson">
            <section class="story-companion__panel story-companion__panel--guide">
              <div class="panel__heading">
                <span>{{ t('common.readingGuide') }}</span>
                <strong>{{ localizedText(section.callout) }}</strong>
              </div>
              <div v-if="localizedText(section.experimentPrompt)" class="guide-prompt">
                {{ localizedText(section.experimentPrompt) }}
              </div>
            </section>
          </div>

          <CnnShapeParameterChallengeLab
            v-if="isCnnVisualizationPage && section.id === 'channels-feature-maps'"
            :accent="moduleDefinition.accent"
          />
          <CnnExplainerLab v-if="isCnnVisualizationPage && section.id === activeChapter" :section="section" />
          <AppliedWorkflowLessonLab v-else-if="!isCnnVisualizationPage" :module-slug="slug" :section="section" />
        </template>
      </StoryScroller>
    </section>

    <section
      v-else-if="isLossFunctionsPage"
      class="algorithm-layout algorithm-layout--lesson-story"
    >
      <StoryScroller
        :sections="moduleDefinition.chapters"
        :active-id="activeChapter"
        @change="onChapterChange"
      >
        <template #section="{ section, localizedText: slotLocalizedText }">
          <h3>{{ t(section.titleKey) }}</h3>
          <MarkdownMathContent :source="slotLocalizedText(section.markdown)" />

          <LossFunctionsLessonLab
            v-if="section.layoutMode === 'embedded-lab'"
            :config="experiment.config"
            :snapshot="snapshot"
            :accent="moduleDefinition.accent"
            :section="section"
            @update-config="(key, value) => experimentStore.updateConfig(slug, key, value)"
            @patch-config="patchConfig"
          />

          <div class="story-companion story-companion--lesson">
            <section class="story-companion__panel story-companion__panel--guide">
              <div class="panel__heading">
                <span>{{ t('common.readingGuide') }}</span>
                <strong>{{ localizedText(section.callout) }}</strong>
              </div>
              <div v-if="localizedText(section.experimentPrompt)" class="guide-prompt">
                {{ localizedText(section.experimentPrompt) }}
              </div>
            </section>

            <section
              v-if="sectionCompanionCopy(section)"
              class="story-companion__panel story-companion__panel--meta"
            >
              <span>{{ sectionCompanionCopy(section)?.title }}</span>
              <p>{{ sectionCompanionCopy(section)?.body }}</p>
            </section>

            <router-link
              v-if="lessonBridgeFor(section)"
              class="story-companion__panel story-companion__panel--meta story-companion__link"
              :to="lessonBridgeFor(section)?.route || '/'"
            >
              <span>{{ lessonBridgeFor(section)?.eyebrow }}</span>
              <strong>{{ lessonBridgeFor(section)?.title }}</strong>
              <p>{{ lessonBridgeFor(section)?.body }}</p>
              <span class="action-button">{{ lessonBridgeFor(section)?.cta }}</span>
            </router-link>
          </div>
        </template>
      </StoryScroller>
    </section>

    <LinearRegressionPagedLesson
      v-else-if="isLinearRegressionPage && activeSection"
      :module-definition="moduleDefinition"
      :section="activeSection"
      :config="experiment.config"
      :snapshot="snapshot"
      :snapshots="experiment.snapshots"
      :current-step="experiment.currentStep"
      :is-playing="experiment.isPlaying"
      @patch-config="patchConfig"
      @toggle-play="experimentStore.togglePlayback(slug)"
      @step="experimentStore.advance(slug)"
      @replay="experimentStore.replay(slug)"
      @reset="experimentStore.reset(slug)"
      @apply-preset="(config) => experimentStore.applyPreset(slug, config)"
    />

    <LogisticRegressionPagedLesson
      v-else-if="isLogisticRegressionPage && activeSection"
      :module-definition="moduleDefinition"
      :section="activeSection"
      :config="experiment.config"
      :snapshot="snapshot"
      :snapshots="experiment.snapshots"
      :current-step="experiment.currentStep"
      :is-playing="experiment.isPlaying"
      @patch-config="patchConfig"
      @toggle-play="experimentStore.togglePlayback(slug)"
      @step="experimentStore.advance(slug)"
      @replay="experimentStore.replay(slug)"
      @reset="experimentStore.reset(slug)"
      @apply-preset="(config) => experimentStore.applyPreset(slug, config)"
    />

    <section
      v-else-if="isClassificationPage"
      class="algorithm-layout algorithm-layout--lesson-story algorithm-layout--classification-story"
    >
      <StoryScroller
        :sections="moduleDefinition.chapters"
        :active-id="activeChapter"
        @change="onChapterChange"
      >
        <template #section="{ section, localizedText: slotLocalizedText }">
          <h3>{{ sectionTitle(section) }}</h3>
          <MarkdownMathContent :source="slotLocalizedText(section.markdown)" />

          <div v-if="visualAssetsFor(section).length" class="classification-story-visuals">
            <figure
              v-for="asset in visualAssetsFor(section)"
              :key="asset.id"
              class="classification-story-visual"
              :class="`classification-story-visual--${asset.type}`"
            >
              <video
                v-if="asset.type === 'manim-video'"
                controls
                preload="metadata"
                playsinline
                :poster="publicAsset(asset.posterPath)"
              >
                <source :src="publicAsset(asset.assetPath)" type="video/mp4" />
              </video>
              <img v-else :src="publicAsset(asset.assetPath)" :alt="localizedText(asset.title)" loading="lazy" />
              <figcaption>
                <strong>{{ localizedText(asset.title) }}</strong>
                <span>{{ localizedText(asset.caption) }}</span>
              </figcaption>
            </figure>
          </div>

          <ClassificationLessonLab
            :config="experiment.config"
            :snapshot="snapshot"
            :snapshots="experiment.snapshots"
            :current-step="experiment.currentStep"
            :is-playing="experiment.isPlaying"
            :accent="moduleDefinition.accent"
            :section="section"
            :presets="moduleDefinition.presets"
            @patch-config="patchConfig"
            @toggle-play="experimentStore.togglePlayback(slug)"
            @step="experimentStore.advance(slug)"
            @replay="experimentStore.replay(slug)"
            @reset="experimentStore.reset(slug)"
            @apply-preset="(config) => experimentStore.applyPreset(slug, config)"
          />
        </template>
      </StoryScroller>
    </section>

    <section v-else class="algorithm-layout">
      <StoryScroller
        :sections="moduleDefinition.chapters"
        :active-id="activeChapter"
        @change="onChapterChange"
      />

      <aside class="lab-column">
        <div class="lab-column__sticky">
          <GradientDescentViz
            v-if="slug === 'gradient-descent'"
            :snapshot="snapshot"
            :config="experiment.config"
            :accent="moduleDefinition.accent"
            :focus-target="focusTarget"
            @update-start-point="updateGradientStartPoint"
          />
          <ClassificationViz
            v-else
            :slug="slug"
            :snapshot="snapshot"
            :accent="moduleDefinition.accent"
            :focus-target="focusTarget"
          />

          <PlaybackDock
            :slug="slug"
            :snapshot="snapshot"
            :is-playing="experiment.isPlaying"
            @toggle-play="experimentStore.togglePlayback(slug)"
            @step="experimentStore.advance(slug)"
            @replay="experimentStore.replay(slug)"
            @reset="experimentStore.reset(slug)"
          />

          <TeachingDashboard
            :slug="slug"
            :module-definition="moduleDefinition"
            :config="experiment.config"
            :snapshot="snapshot"
            :is-playing="experiment.isPlaying"
            :active-section="activeSection"
            :insights="teachingInsights"
            :emphasized-metrics="emphasizedMetrics"
            :key="activeSection?.id"
            @update-config="(key, value) => experimentStore.updateConfig(slug, key, value)"
            @patch-config="patchConfig"
            @toggle-play="experimentStore.togglePlayback(slug)"
            @step="experimentStore.advance(slug)"
            @replay="experimentStore.replay(slug)"
            @reset="experimentStore.reset(slug)"
            @apply-preset="(config) => experimentStore.applyPreset(slug, config)"
          />
        </div>
      </aside>
    </section>

    <AlgorithmCheckpointQuiz
      v-if="moduleDefinition.checkpoints.length && !isAiOverviewPage && (!isPythonNotebookPage || activeSection?.id === 'analysis-report')"
      :module-slug="moduleDefinition.slug"
      :module-route="moduleDefinition.route"
      :checkpoints="moduleDefinition.checkpoints"
      :locale="currentLocale"
      :completed="progress.completedModuleSlugs.includes(moduleDefinition.slug)"
      :mode="isPythonNotebookPage ? 'course-review' : 'scored'"
      @submit="onAlgorithmQuizSubmit"
    />

    <section v-if="isLossFunctionsPage" class="results-grid results-grid--loss">
      <LossFunctionsResults
        :active-section="activeSection"
        :snapshot="snapshot"
        :config="experiment.config"
      />

      <section class="panel lesson-panel lesson-panel--loss">
        <div class="panel__heading">
          <span>{{ t('common.readingGuide') }}</span>
          <strong>{{ activeSection ? t(activeSection.titleKey) : t(moduleDefinition.titleKey) }}</strong>
        </div>
        <p class="lesson-panel__callout">{{ localizedText(activeSection?.callout) }}</p>
        <div v-if="localizedText(activeSection?.experimentPrompt)" class="lesson-panel__prompt">
          {{ localizedText(activeSection?.experimentPrompt) }}
        </div>

        <router-link
          v-if="lessonBridgeFor(activeSection)"
          class="lesson-bridge-card"
          :to="lessonBridgeFor(activeSection)?.route || '/'"
        >
          <span>{{ lessonBridgeFor(activeSection)?.eyebrow }}</span>
          <strong>{{ lessonBridgeFor(activeSection)?.title }}</strong>
          <p>{{ lessonBridgeFor(activeSection)?.body }}</p>
          <small>{{ lessonBridgeFor(activeSection)?.cta }}</small>
        </router-link>
      </section>
    </section>

    <section
      v-else-if="!isLinearRegressionPage && !isWorkflowLessonPage && !isPythonNotebookPage"
      class="results-grid"
      :class="{ 'results-grid--gradient': isGradientPage }"
    >
      <LineChart :slug="slug" :snapshots="experiment.snapshots" :current-step="experiment.currentStep" />

      <section class="panel lesson-panel">
        <div class="panel__heading">
          <span>{{ t('common.results') }}</span>
          <strong>{{ activeSection ? sectionTitle(activeSection) : t('common.modelSignal') }}</strong>
        </div>
        <p class="lesson-panel__callout">{{ localizedText(activeSection?.callout) }}</p>
        <div v-if="localizedText(activeSection?.experimentPrompt)" class="lesson-panel__prompt">
          {{ localizedText(activeSection?.experimentPrompt) }}
        </div>

        <div v-if="isGradientPage && gradientFeaturedInsights.length" class="lesson-panel__signals">
          <article
            v-for="insight in gradientFeaturedInsights"
            :key="insight.id"
            class="insight-card"
            :class="`insight-card--${insight.tone}`"
          >
            <span>{{ t(insight.titleKey) }}</span>
            <p>{{ t(insight.bodyKey) }}</p>
          </article>
        </div>
      </section>
    </section>
  </div>
</template>
