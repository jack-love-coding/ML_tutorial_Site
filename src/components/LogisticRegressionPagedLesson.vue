<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AlgorithmModuleDefinition,
  AppLocale,
  ExperimentConfig,
  ModuleVisualAsset,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import { round } from '../utils/math'
import { withPublicBase } from '../utils/publicPath'
import MarkdownMathContent from './MarkdownMathContent.vue'
import LogisticRegressionLessonLab from './LogisticRegressionLessonLab.vue'
import LogisticSigmoidD3Figure from './LogisticSigmoidD3Figure.vue'
import LogisticLogLossD3Figure from './LogisticLogLossD3Figure.vue'
import LogisticConfusionD3Figure from './LogisticConfusionD3Figure.vue'
import LogisticLossSurfaceView from './LogisticLossSurfaceView.vue'

const props = defineProps<{
  moduleDefinition: AlgorithmModuleDefinition
  section: StorySection
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  isPlaying: boolean
}>()

const emit = defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'toggle-play': []
  step: []
  replay: []
  reset: []
  'apply-preset': [config: Partial<ExperimentConfig>]
}>()

const { locale } = useI18n()
const mobileMenuOpen = ref(false)

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        toc: '章节目录',
        mobileMenu: '目录',
        chapter: '章节',
        current: '当前',
        minutes: '分钟',
        previous: '上一页',
        next: '下一页',
        unavailable: '暂无',
        dataVisual: '数据与图解',
        experiment: '交互实验台',
        results: '结果复盘',
        readingGuide: '阅读提示',
        sources: '来源',
        attribution: '改写参考',
        nextLesson: '下一课',
        mlpTitle: '用隐藏层弯曲决策边界',
        mlpBody: '逻辑回归只能画单条线性边界，MLP 会先重组输入空间，再学习更灵活的边界。',
        mlpCta: '进入 MLP',
        visualFallback: '本页重点图解',
        progress: '进度',
        startLoss: '初始损失',
        currentLoss: '当前损失',
        accuracy: '准确率',
        precision: '精确率',
        recall: '召回率',
        trueProbability: '真实类概率',
        weightNorm: '权重范数',
      }
    : {
        toc: 'Contents',
        mobileMenu: 'Contents',
        chapter: 'Chapter',
        current: 'Current',
        minutes: 'min',
        previous: 'Previous',
        next: 'Next',
        unavailable: 'Unavailable',
        dataVisual: 'Data and diagram',
        experiment: 'Interactive lab',
        results: 'Results review',
        readingGuide: 'Reading guide',
        sources: 'Sources',
        attribution: 'Rewrite references',
        nextLesson: 'Next lesson',
        mlpTitle: 'Bend the boundary with hidden layers',
        mlpBody: 'Logistic regression draws one linear boundary; an MLP reshapes input space before learning a richer split.',
        mlpCta: 'Open MLP',
        visualFallback: 'Main diagram',
        progress: 'Progress',
        startLoss: 'Initial loss',
        currentLoss: 'Current loss',
        accuracy: 'Accuracy',
        precision: 'Precision',
        recall: 'Recall',
        trueProbability: 'True-class prob.',
        weightNorm: 'Weight norm',
      },
)

const activeLocale = computed(() => locale.value as AppLocale)
const currentIndex = computed(() => {
  const index = props.moduleDefinition.chapters.findIndex((section) => section.id === props.section.id)
  return index >= 0 ? index : 0
})
const previousSection = computed(() => props.moduleDefinition.chapters[currentIndex.value - 1])
const nextSection = computed(() => props.moduleDefinition.chapters[currentIndex.value + 1])
const progressPercent = computed(() =>
  Math.round(((currentIndex.value + 1) / Math.max(props.moduleDefinition.chapters.length, 1)) * 100),
)

const firstSnapshot = computed(() => props.snapshots[0])
const resultCards = computed(() => [
  { id: 'start-loss', label: copy.value.startLoss, value: round(firstSnapshot.value?.loss ?? 0, 3) },
  { id: 'current-loss', label: copy.value.currentLoss, value: round(props.snapshot?.loss ?? 0, 3) },
  { id: 'accuracy', label: copy.value.accuracy, value: `${round((props.snapshot?.accuracy ?? 0) * 100, 1)}%` },
  { id: 'precision', label: copy.value.precision, value: `${round(metric('precision') * 100, 1)}%` },
  { id: 'recall', label: copy.value.recall, value: `${round(metric('recall') * 100, 1)}%` },
  { id: 'true-prob', label: copy.value.trueProbability, value: round(metric('meanTrueClassProbability'), 3) },
  { id: 'weight-norm', label: copy.value.weightNorm, value: round(metric('weightNorm'), 3) },
  { id: 'progress', label: copy.value.progress, value: `${progressPercent.value}%` },
])

const sectionSummary = computed(
  () => localizedText(props.section.pageSummary) || localizedText(props.section.callout),
)
const currentVisuals = computed(() => visualAssetsFor(props.section))

function metric(key: string) {
  return Number(props.snapshot?.derivedMetrics?.[key] ?? 0)
}

function localizedText(text?: { 'zh-CN': string; en: string }) {
  if (!text) return ''
  return text[activeLocale.value]
}

function sectionTitle(section: StorySection) {
  return localizedText(section.title) || section.titleKey
}

function chapterRoute(section: StorySection) {
  return `/learn/logistic-regression/${section.id}`
}

function publicAsset(path?: string) {
  return withPublicBase(path)
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function visualAssetsFor(section?: StorySection): ModuleVisualAsset[] {
  if (!section?.visualIds?.length) return []
  const visualIds = new Set(section.visualIds)
  return props.moduleDefinition.visuals?.filter((asset) => visualIds.has(asset.id)) ?? []
}

function emitApplyPreset(config: Partial<ExperimentConfig>) {
  emit('apply-preset', config)
}

watch(
  () => props.section.id,
  () => {
    mobileMenuOpen.value = false
  },
)
</script>

<template>
  <section
    class="linear-course-page logistic-course-page"
    data-testid="logistic-course-page"
    :style="{ '--linear-accent': props.moduleDefinition.accent, '--logistic-accent': props.moduleDefinition.accent }"
  >
    <button
      type="button"
      class="linear-course-page__mobile-toggle"
      data-testid="logistic-mobile-toc"
      :aria-expanded="mobileMenuOpen"
      @click="mobileMenuOpen = !mobileMenuOpen"
    >
      <span>{{ copy.mobileMenu }}</span>
      <strong>{{ sectionTitle(props.section) }}</strong>
    </button>

    <div class="linear-course-page__grid">
      <aside
        class="linear-course-page__sidebar logistic-course-page__sidebar"
        :class="{ 'is-open': mobileMenuOpen }"
        data-testid="logistic-course-sidebar"
      >
        <div class="linear-course-page__toc-heading">
          <span>{{ copy.chapter }}</span>
          <strong>{{ copy.toc }}</strong>
        </div>
        <nav class="linear-course-page__nav" :aria-label="copy.toc">
          <router-link
            v-for="(chapter, index) in props.moduleDefinition.chapters"
            :key="chapter.id"
            class="linear-course-page__nav-item"
            :class="{ 'is-active': chapter.id === props.section.id }"
            :to="chapterRoute(chapter)"
            @click="closeMobileMenu"
          >
            <span class="linear-course-page__nav-index">{{ formatIndex(index) }}</span>
            <span class="linear-course-page__nav-copy">
              <strong>{{ sectionTitle(chapter) }}</strong>
              <small>
                {{ chapter.id === props.section.id ? copy.current : `${chapter.estimatedMinutes ?? 8} ${copy.minutes}` }}
              </small>
            </span>
          </router-link>
        </nav>
      </aside>

      <main class="linear-course-page__main">
        <article
          class="linear-course-page__article"
          data-testid="logistic-current-chapter"
          :data-section-id="props.section.id"
        >
          <header class="linear-course-page__header">
            <div class="linear-course-page__meta">
              <span>{{ copy.chapter }} {{ currentIndex + 1 }}</span>
              <strong>{{ progressPercent }}%</strong>
            </div>
            <h2>{{ sectionTitle(props.section) }}</h2>
            <p>{{ sectionSummary }}</p>
          </header>

          <MarkdownMathContent :source="localizedText(props.section.markdown)" />

          <section class="linear-course-page__visual logistic-course-page__visual" data-testid="logistic-concept-visual">
            <div class="linear-course-page__section-heading">
              <span>{{ copy.dataVisual }}</span>
              <strong>{{ localizedText(props.section.callout) || copy.visualFallback }}</strong>
            </div>

            <div class="logistic-course-page__visual-grid">
              <LogisticSigmoidD3Figure
                v-if="props.section.id === 'sigmoid-probability' || props.section.id === 'linear-score'"
                :snapshot="props.snapshot"
                :accent="props.moduleDefinition.accent"
              />
              <LogisticConfusionD3Figure
                v-if="props.section.id === 'threshold-decisions'"
                :snapshot="props.snapshot"
                :accent="props.moduleDefinition.accent"
              />
              <LogisticLogLossD3Figure
                v-if="props.section.id === 'log-loss'"
                :snapshot="props.snapshot"
                :accent="props.moduleDefinition.accent"
              />
              <LogisticLossSurfaceView
                v-if="props.section.id === 'regularization' || props.section.id === 'log-loss'"
                :snapshot="props.snapshot"
                :snapshots="props.snapshots"
                :accent="props.moduleDefinition.accent"
              />

              <figure
                v-for="asset in currentVisuals"
                :key="asset.id"
                class="logistic-course-page__asset"
                :class="`logistic-course-page__asset--${asset.type}`"
              >
                <video
                  v-if="asset.type === 'manim-video'"
                  controls
                  playsinline
                  preload="metadata"
                  :poster="publicAsset(asset.posterPath)"
                  :aria-label="localizedText(asset.title)"
                >
                  <source :src="publicAsset(asset.assetPath)" type="video/mp4" />
                </video>
                <img
                  v-else
                  :src="publicAsset(asset.assetPath)"
                  :alt="localizedText(asset.title)"
                  loading="lazy"
                />
                <figcaption>
                  <strong>{{ localizedText(asset.title) }}</strong>
                  <span>{{ localizedText(asset.caption) }}</span>
                </figcaption>
              </figure>
            </div>
          </section>

          <section class="linear-course-page__lab-block" data-testid="logistic-course-lab">
            <div class="linear-course-page__section-heading">
              <span>{{ copy.experiment }}</span>
              <strong>{{ localizedText(props.section.experimentPrompt) || sectionTitle(props.section) }}</strong>
            </div>
            <LogisticRegressionLessonLab
              :config="props.config"
              :snapshot="props.snapshot"
              :snapshots="props.snapshots"
              :current-step="props.currentStep"
              :is-playing="props.isPlaying"
              :accent="props.moduleDefinition.accent"
              :section="props.section"
              :presets="props.moduleDefinition.presets"
              @patch-config="(config) => emit('patch-config', config)"
              @toggle-play="emit('toggle-play')"
              @step="emit('step')"
              @replay="emit('replay')"
              @reset="emit('reset')"
              @apply-preset="emitApplyPreset"
            />
          </section>

          <section class="linear-course-page__review" data-testid="logistic-course-results">
            <section class="panel logistic-results">
              <div class="panel__heading">
                <span>{{ copy.results }}</span>
                <strong>{{ sectionTitle(props.section) }}</strong>
              </div>
              <div class="logistic-results__grid">
                <article v-for="card in resultCards" :key="card.id" class="chart-summary__item">
                  <span>{{ card.label }}</span>
                  <strong>{{ card.value }}</strong>
                </article>
              </div>
            </section>

            <section class="panel lesson-panel linear-course-page__guide-card">
              <div class="panel__heading">
                <span>{{ copy.readingGuide }}</span>
                <strong>{{ localizedText(props.section.callout) }}</strong>
              </div>
              <p v-if="localizedText(props.section.experimentPrompt)" class="lesson-panel__prompt">
                {{ localizedText(props.section.experimentPrompt) }}
              </p>

              <section v-if="props.section.sources?.length" class="logistic-source-block">
                <div class="panel__heading">
                  <span>{{ copy.sources }}</span>
                  <strong>{{ copy.attribution }}</strong>
                </div>
                <ul>
                  <li v-for="source in props.section.sources" :key="source.href">
                    <a :href="source.href" target="_blank" rel="noreferrer">{{ localizedText(source.label) }}</a>
                    <small v-if="source.license">{{ source.license }}</small>
                  </li>
                </ul>
              </section>

              <router-link
                v-if="!nextSection"
                class="lesson-bridge-card"
                to="/learn/mlp"
              >
                <span>{{ copy.nextLesson }}</span>
                <strong>{{ copy.mlpTitle }}</strong>
                <p>{{ copy.mlpBody }}</p>
                <small>{{ copy.mlpCta }}</small>
              </router-link>
            </section>
          </section>

          <nav class="linear-course-page__pager" data-testid="logistic-course-pager" :aria-label="copy.toc">
            <router-link
              v-if="previousSection"
              class="linear-course-page__pager-link"
              :to="chapterRoute(previousSection)"
            >
              <span>{{ copy.previous }}</span>
              <strong>{{ sectionTitle(previousSection) }}</strong>
            </router-link>
            <span v-else class="linear-course-page__pager-link is-disabled">
              <span>{{ copy.previous }}</span>
              <strong>{{ copy.unavailable }}</strong>
            </span>

            <router-link
              v-if="nextSection"
              class="linear-course-page__pager-link linear-course-page__pager-link--next"
              :to="chapterRoute(nextSection)"
            >
              <span>{{ copy.next }}</span>
              <strong>{{ sectionTitle(nextSection) }}</strong>
            </router-link>
            <router-link
              v-else
              class="linear-course-page__pager-link linear-course-page__pager-link--next"
              to="/learn/mlp"
            >
              <span>{{ copy.nextLesson }}</span>
              <strong>{{ copy.mlpTitle }}</strong>
            </router-link>
          </nav>
        </article>
      </main>
    </div>
  </section>
</template>
