<script setup lang="ts">
import { computed, defineAsyncComponent, onBeforeUnmount, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import type {
  AppLocale,
  ExperimentConfig,
  StorySection,
} from '../types/ml'
import { useExperimentStore } from '../stores/experiments'
import StoryScroller from '../components/StoryScroller.vue'
import LineChart from '../components/LineChart.vue'
import MarkdownMathContent from '../components/MarkdownMathContent.vue'
import CorridorNavigator from '../components/CorridorNavigator.vue'
import { algorithmTeaching } from '../lessons/algorithmTeaching'
import { sectionCompanionCopy, lessonBridgeFor } from '../lessons/lossReadingNotes'
import { pagedAlgorithmRenderers } from '../lessons/algorithmRenderers'
import { useAlgorithmCourse } from '../composables/useAlgorithmCourse'
import { useAlgorithmChapterNavigation } from '../composables/useAlgorithmChapterNavigation'
import {
  isClassicalSupervisedCorridorModule,
  type ClassicalSupervisedCorridorModuleId,
} from '../curriculum/milestones/classicalSupervisedCorridor.ts'
import { withPublicBase } from '../utils/publicPath'

const LossFunctionsLessonLab = defineAsyncComponent(
  () => import('../components/LossFunctionsLessonLab.vue'),
)
const LossFunctionsResults = defineAsyncComponent(
  () => import('../components/LossFunctionsResults.vue'),
)
const LossFunctionsDownloads = defineAsyncComponent(
  () => import('../components/LossFunctionsDownloads.vue'),
)
const AlgorithmCheckpointQuiz = defineAsyncComponent(
  () => import('../components/AlgorithmCheckpointQuiz.vue'),
)
const ClassificationLessonLab = defineAsyncComponent(
  () => import('../components/ClassificationLessonLab.vue'),
)
const AiOverviewLessonLab = defineAsyncComponent(
  () => import('../components/AiOverviewLessonLab.vue'),
)
const AppliedWorkflowLessonLab = defineAsyncComponent(
  () => import('../components/AppliedWorkflowLessonLab.vue'),
)
const CnnGuidedLab = defineAsyncComponent(() => import('../components/cnn/CnnGuidedLab.vue'))
const CnnShapeParameterChallengeLab = defineAsyncComponent(
  () => import('../components/CnnShapeParameterChallengeLab.vue'),
)
const MlpGuidedLab = defineAsyncComponent(
  () => import('../components/mlp/MlpGuidedLab.vue'),
)
const MlpBackpropGraphLab = defineAsyncComponent(
  () => import('../components/mlp/MlpBackpropGraphLab.vue'),
)
const LessonPage = defineAsyncComponent(() => import('../lessons/LessonPage.vue'))
const NeuralGuidedLesson = defineAsyncComponent(
  () => import('../lessons/NeuralGuidedLesson.vue'),
)

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const experimentStore = useExperimentStore()
const { experiments } = storeToRefs(experimentStore)

const activeChapter = ref('')
const { moduleDefinition, slug, loadFailed, retry } = useAlgorithmCourse(route, router, experimentStore, (chapterId, explicit) => {
  activeChapter.value = chapterId
  if (explicit) {
    syncChapterPreset(chapterId)
    syncRouteChapterIntoView(chapterId)
  }
})
const teaching = computed(() => algorithmTeaching(slug.value))
const pagedRenderer = computed(() => pagedAlgorithmRenderers[teaching.value.renderer])
const currentLocale = computed(() => locale.value as AppLocale)
const isGradientPage = computed(() => slug.value === 'gradient-descent')
const isLossFunctionsPage = computed(() => slug.value === 'loss-functions')
const isAiOverviewPage = computed(() => slug.value === 'ai-overview')
const isHousingProjectPage = computed(() => slug.value === 'housing-price-project')
const isCnnVisualizationPage = computed(() => slug.value === 'cnn-visualization')
const isOptimizerComparisonPage = computed(() => slug.value === 'optimizer-comparison')
const isWorkflowLessonPage = computed(() => teaching.value.renderer === 'workflow')
const isLinearRegressionPage = computed(() => slug.value === 'linear-regression')
const isLogisticRegressionPage = computed(() => slug.value === 'logistic-regression')
const isClassificationPage = computed(() => slug.value === 'classification')
const corridorModuleId = computed<ClassicalSupervisedCorridorModuleId | undefined>(() =>
  isClassicalSupervisedCorridorModule(slug.value) ? slug.value : undefined,
)
const isMlpPage = computed(() => slug.value === 'mlp')
const isNeuralGuidedPage = computed(() => teaching.value.mode === 'guided')
const isBlockLesson = computed(() => teaching.value.renderer === 'blocks')
const { syncRouteChapterIntoView, onChapterChange, onNeuralChapterChange } = useAlgorithmChapterNavigation({
  route, router, slug, isNeuralGuidedPage, activeChapter, syncChapterPreset,
})

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
  locale.value === 'zh-CN' ? '教学模块' : 'Learning module',
)

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

let timer: number | undefined

function stopTimer() {
  if (timer) {
    window.clearInterval(timer)
    timer = undefined
  }
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

function patchConfig(partialConfig: Partial<ExperimentConfig>) {
  experimentStore.patchConfig(slug.value, partialConfig)
}

</script>

<template>
  <div
    v-if="moduleDefinition && experiment && snapshot"
    class="algorithm-view"
    :data-teaching-mode="teaching.mode"
    :data-renderer="teaching.renderer"
    :class="{
      'algorithm-view--gradient': isGradientPage,
      'algorithm-view--loss': isLossFunctionsPage,
      'algorithm-view--ai-overview': isAiOverviewPage,
      'algorithm-view--workflow': isWorkflowLessonPage,
      'algorithm-view--housing': isHousingProjectPage,
      'algorithm-view--linear': isLinearRegressionPage,
      'algorithm-view--logistic': isLogisticRegressionPage,
      'algorithm-view--classification': isClassificationPage,
      'algorithm-view--mlp': isMlpPage,
      'algorithm-view--cnn': isCnnVisualizationPage,
      'algorithm-view--neural': isNeuralGuidedPage,
    }"
  >
    <section
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
        >
          <span>{{ moduleStatusLabel }}</span>
        </div>
        <div class="algorithm-hero__stats">
          <article v-for="item in heroStatItems" :key="item.id" class="algorithm-hero__stat">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </div>
    </section>

    <CorridorNavigator v-if="corridorModuleId" :module-id="corridorModuleId" />

    <NeuralGuidedLesson
      v-if="teaching.renderer === 'neural' && isMlpPage"
      :module-definition="moduleDefinition"
      :active-id="activeChapter"
      variant="mlp"
      @change="onNeuralChapterChange"
    >
      <template #lab="{ section }">
        <MlpBackpropGraphLab
          v-if="section.id === 'backprop'"
          :accent="moduleDefinition.accent"
        />

        <section v-else class="mlp-playground-stage">
          <MlpGuidedLab
            :accent="moduleDefinition.accent"
            :section="section"
          />
        </section>
      </template>
    </NeuralGuidedLesson>

    <NeuralGuidedLesson
      v-else-if="teaching.renderer === 'neural' && isCnnVisualizationPage"
      :module-definition="moduleDefinition"
      :active-id="activeChapter"
      variant="cnn-visualization"
      @change="onNeuralChapterChange"
    >
      <template #lab="{ section }">
        <CnnGuidedLab :section="section" />
        <CnnShapeParameterChallengeLab
          v-if="section.id === 'padding-stride-shape'"
          :accent="moduleDefinition.accent"
          class="cnn-guided-shape-challenge"
        />
      </template>
    </NeuralGuidedLesson>

    <component
      :is="pagedRenderer"
      v-else-if="pagedRenderer && activeSection"
      :module-definition="moduleDefinition"
      :section="activeSection"
      v-bind="teaching.experimentPager ? { config: experiment.config, snapshot, snapshots: experiment.snapshots, currentStep: experiment.currentStep, isPlaying: experiment.isPlaying } : {}"
      @patch-config="patchConfig"
      @toggle-play="experimentStore.togglePlayback(slug)"
      @step="experimentStore.advance(slug)"
      @replay="experimentStore.replay(slug)"
      @reset="experimentStore.reset(slug)"
      @apply-preset="(config: Partial<ExperimentConfig>) => experimentStore.applyPreset(slug, config)"
    />

    <LessonPage
      v-else-if="isBlockLesson"
      :module-definition="moduleDefinition"
      :active-id="activeChapter"
      :variant="slug"
      @change="onChapterChange"
    >
      <template #lab="{ section }">
        <AiOverviewLessonLab
          v-if="teaching.labId === 'ai-overview-task-lab'"
          :section="section"
        />

      </template>
    </LessonPage>

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

          <AppliedWorkflowLessonLab :module-slug="slug" :section="section" />
        </template>
      </StoryScroller>
    </section>

    <section
      v-else-if="teaching.renderer === 'loss'"
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

          <LossFunctionsResults
            :active-section="section"
            :snapshot="snapshot"
            :config="experiment.config"
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
              v-if="sectionCompanionCopy(currentLocale, section)"
              class="story-companion__panel story-companion__panel--meta"
            >
              <span>{{ sectionCompanionCopy(currentLocale, section)?.title }}</span>
              <p>{{ sectionCompanionCopy(currentLocale, section)?.body }}</p>
            </section>

            <router-link
              v-if="lessonBridgeFor(currentLocale, section)"
              class="story-companion__panel story-companion__panel--meta story-companion__link"
              :to="lessonBridgeFor(currentLocale, section)?.route || '/'"
            >
              <span>{{ lessonBridgeFor(currentLocale, section)?.eyebrow }}</span>
              <strong>{{ lessonBridgeFor(currentLocale, section)?.title }}</strong>
              <p>{{ lessonBridgeFor(currentLocale, section)?.body }}</p>
              <span class="action-button">{{ lessonBridgeFor(currentLocale, section)?.cta }}</span>
            </router-link>
          </div>
        </template>
      </StoryScroller>
    </section>

    <section
      v-else-if="teaching.renderer === 'classification'"
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

    <AlgorithmCheckpointQuiz
      v-if="moduleDefinition.checkpoints.length && !isLogisticRegressionPage && !isAiOverviewPage && !isOptimizerComparisonPage && (!isGradientPage || activeSection?.id === 'noise-and-batch')"
      :module-slug="moduleDefinition.slug"
      :module-route="moduleDefinition.route"
      :checkpoints="moduleDefinition.checkpoints"
      :locale="currentLocale"
    />

    <LossFunctionsDownloads v-if="isLossFunctionsPage" />

    <section
      v-if="!isLossFunctionsPage && !isLinearRegressionPage && !isLogisticRegressionPage && !isHousingProjectPage && !isWorkflowLessonPage && !isNeuralGuidedPage && !isGradientPage && !isOptimizerComparisonPage"
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

      </section>
    </section>
  </div>
  <section v-else-if="loadFailed" class="panel" role="alert">
    <p>{{ currentLocale === 'zh-CN' ? '课程暂时无法加载，请重试。' : 'The lesson could not load. Please retry.' }}</p>
    <button class="action-button" type="button" @click="retry">{{ currentLocale === 'zh-CN' ? '重试' : 'Retry' }}</button>
  </section>
</template>
