<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
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
import GradientTeachingBlocks from '../components/GradientTeachingBlocks.vue'
import GradientChapterLab from '../components/GradientChapterLab.vue'
import LossFunctionsLessonLab from '../components/LossFunctionsLessonLab.vue'
import LossFunctionsResults from '../components/LossFunctionsResults.vue'
import LinearRegressionLessonLab from '../components/LinearRegressionLessonLab.vue'
import LinearRegressionResults from '../components/LinearRegressionResults.vue'

const route = useRoute()
const router = useRouter()
const { t, locale } = useI18n()
const experimentStore = useExperimentStore()
const { experiments } = storeToRefs(experimentStore)

const activeChapter = ref('')

const slug = computed(() => route.params.slug as ModuleSlug)
const moduleDefinition = computed(() => moduleRegistry[slug.value])
const isGradientPage = computed(() => slug.value === 'gradient-descent')
const isLossFunctionsPage = computed(() => slug.value === 'loss-functions')
const isLinearRegressionPage = computed(() => slug.value === 'linear-regression')

if (!moduleDefinition.value) {
  router.replace('/')
}

watch(
  slug,
  (nextSlug) => {
    if (!moduleRegistry[nextSlug]) {
      router.replace('/')
      return
    }

    experimentStore.ensureExperiment(nextSlug)
    activeChapter.value = moduleRegistry[nextSlug].chapters[0]?.id ?? ''
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

onBeforeUnmount(stopTimer)

function onChapterChange(nextChapter: string) {
  activeChapter.value = nextChapter
  if (isLinearRegressionPage.value) {
    if (experiment.value?.isPlaying || Number(experiment.value?.currentStep ?? 0) > 0) return

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

function updateGradientStartPoint(point: { startX: number; startY: number }) {
  experimentStore.pause(slug.value)
  experimentStore.patchConfig(slug.value, point)
}
</script>

<template>
  <div
    v-if="moduleDefinition && experiment && snapshot"
    class="algorithm-view"
    :class="{
      'algorithm-view--gradient': isGradientPage,
      'algorithm-view--loss': isLossFunctionsPage,
      'algorithm-view--linear': isLinearRegressionPage,
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
        <div class="algorithm-hero__stats">
          <article v-for="item in heroStatItems" :key="item.id" class="algorithm-hero__stat">
            <span>{{ item.label }}</span>
            <strong>{{ item.value }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section v-if="isGradientPage" class="algorithm-layout algorithm-layout--gradient-story">
      <StoryScroller
        :sections="moduleDefinition.chapters"
        :active-id="activeChapter"
        @change="onChapterChange"
      >
        <template #section="{ section, localizedText: slotLocalizedText }">
          <h3>{{ t(section.titleKey) }}</h3>

          <GradientTeachingBlocks v-if="section.teachingBlocks" :section="section" />
          <MarkdownMathContent v-else :source="slotLocalizedText(section.markdown)" />

          <section class="story-companion__panel story-companion__panel--guide gradient-story-guide">
            <div class="panel__heading">
              <span>{{ t('common.readingGuide') }}</span>
              <strong>{{ localizedText(section.callout) }}</strong>
            </div>
            <div v-if="localizedText(section.experimentPrompt)" class="guide-prompt">
              {{ localizedText(section.experimentPrompt) }}
            </div>
          </section>

          <GradientChapterLab
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

    <section
      v-else-if="isLinearRegressionPage"
      class="algorithm-layout algorithm-layout--lesson-story algorithm-layout--linear-story"
    >
      <StoryScroller
        :sections="moduleDefinition.chapters"
        :active-id="activeChapter"
        @change="onChapterChange"
      >
        <template #section="{ section, localizedText: slotLocalizedText }">
          <h3>{{ t(section.titleKey) }}</h3>
          <MarkdownMathContent :source="slotLocalizedText(section.markdown)" />

          <LinearRegressionLessonLab
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

            <router-link
              class="story-companion__panel story-companion__panel--meta story-companion__link"
              to="/learn/logistic-regression"
            >
              <span>{{ locale === 'zh-CN' ? '下一课' : 'Next lesson' }}</span>
              <strong>
                {{
                  locale === 'zh-CN'
                    ? '从连续值预测走向分类概率'
                    : 'From continuous prediction to class probability'
                }}
              </strong>
              <p>
                {{
                  locale === 'zh-CN'
                    ? '线性回归学的是连续房价；逻辑回归会把线性打分映射成概率，用来解释分类边界。'
                    : 'Linear regression predicts continuous prices; logistic regression maps a linear score into probability for classification.'
                }}
              </p>
              <span class="action-button">
                {{ locale === 'zh-CN' ? '进入逻辑回归' : 'Open Logistic Regression' }}
              </span>
            </router-link>
          </div>
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

    <section v-else-if="isLinearRegressionPage" class="results-grid results-grid--linear">
      <LinearRegressionResults
        :section="activeSection"
        :snapshot="snapshot"
        :snapshots="experiment.snapshots"
        :current-step="experiment.currentStep"
      />

      <section class="panel lesson-panel">
        <div class="panel__heading">
          <span>{{ t('common.results') }}</span>
          <strong>{{ activeSection ? t(activeSection.titleKey) : t(moduleDefinition.titleKey) }}</strong>
        </div>
        <p class="lesson-panel__callout">{{ localizedText(activeSection?.callout) }}</p>
        <div v-if="localizedText(activeSection?.experimentPrompt)" class="lesson-panel__prompt">
          {{ localizedText(activeSection?.experimentPrompt) }}
        </div>

        <router-link class="lesson-bridge-card" to="/learn/logistic-regression">
          <span>{{ locale === 'zh-CN' ? '逻辑回归预告' : 'Logistic bridge' }}</span>
          <strong>
            {{
              locale === 'zh-CN'
                ? '线性打分下一步会变成分类概率'
                : 'The linear score becomes a class probability next'
            }}
          </strong>
          <p>
            {{
              locale === 'zh-CN'
                ? '斜率和截距的直觉会保留，但输出从房价变成概率，损失也从 MSE 换成交叉熵。'
                : 'The slope-and-intercept intuition remains, but the output becomes probability and MSE gives way to cross-entropy.'
            }}
          </p>
          <small>{{ locale === 'zh-CN' ? '进入逻辑回归' : 'Open Logistic Regression' }}</small>
        </router-link>
      </section>
    </section>

    <section v-else class="results-grid" :class="{ 'results-grid--gradient': isGradientPage }">
      <LineChart :slug="slug" :snapshots="experiment.snapshots" :current-step="experiment.currentStep" />

      <section class="panel lesson-panel">
        <div class="panel__heading">
          <span>{{ t('common.results') }}</span>
          <strong>{{ activeSection ? t(activeSection.titleKey) : t('common.modelSignal') }}</strong>
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
