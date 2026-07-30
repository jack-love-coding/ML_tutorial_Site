<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  linearRegressionAssetById,
  linearRegressionChapterAssets,
  linearRegressionChapterIds,
  parseLinearRegressionSummary,
  type LinearRegressionChapterId,
  type LinearRegressionChapterOutputId,
  type LinearRegressionLockedSummary,
} from '../data/linearRegressionAssets'
import type {
  AlgorithmModuleDefinition,
  AppLocale,
  ExperimentConfig,
  LocalizedCopy,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import CodeLab from '../modules/math-lab/components/CodeLab.vue'
import LinearRegressionLessonLab from './LinearRegressionLessonLab.vue'
import LinearRegressionResults from './LinearRegressionResults.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'

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

type SummaryLoadState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly summary: LinearRegressionLockedSummary }
  | { readonly status: 'invalid' }

const outputLabels: Readonly<Record<LinearRegressionChapterOutputId, LocalizedCopy>> = {
  'representative-training-row': {
    'zh-CN': '代表训练行与单行预测',
    en: 'Representative training row and one-row prediction',
  },
  'batch-contract': {
    'zh-CN': '固定特征顺序与批量矩阵契约',
    en: 'Locked feature order and batch-matrix contract',
  },
  'residuals-and-metrics': {
    'zh-CN': '留出残差与训练/测试指标',
    en: 'Held-out residuals and train/test metrics',
  },
  'gradient-descent-result': {
    'zh-CN': '完整梯度下降收敛结果',
    en: 'Complete gradient-descent convergence result',
  },
  'method-comparison': {
    'zh-CN': '三种 OLS 方法一致性',
    en: 'Three-method OLS agreement',
  },
  'coefficient-table': {
    'zh-CN': '模型空间与原始单位系数',
    en: 'Model-space and original-unit coefficients',
  },
  'heldout-diagnostics': {
    'zh-CN': '按小时与预测区间的留出诊断',
    en: 'Held-out diagnostics by hour and prediction bin',
  },
  'named-cases': {
    'zh-CN': '四个具名留出案例',
    en: 'Four named held-out cases',
  },
  'model-limit-review': {
    'zh-CN': '共线性、正则化与目标变换复盘',
    en: 'Collinearity, regularization, and target-transform review',
  },
}

const { t, locale } = useI18n()
const mobileMenuOpen = ref(false)
const summaryState = ref<SummaryLoadState>({ status: 'loading' })
let activeSummaryController: AbortController | undefined

const copy = computed(() => {
  const zh = locale.value === 'zh-CN'
  return {
    toc: zh ? '章节目录' : 'Contents',
    mobileMenu: zh ? '目录' : 'Contents',
    experiment: zh ? '本章实验台' : 'Chapter workbench',
    results: zh ? '本章结果' : 'Chapter results',
    previous: zh ? '上一页' : 'Previous',
    next: zh ? '下一页' : 'Next',
    chapter: zh ? '章节' : 'Chapter',
    minutes: zh ? '分钟' : 'min',
    current: zh ? '当前' : 'Current',
    unavailable: zh ? '暂无' : 'Unavailable',
    readingGuide: zh ? '阅读提示' : 'Reading guide',
    tryPrompt: zh ? '动手观察' : 'Try this',
    lockedContract: zh ? '本章锁定数据契约' : 'Locked chapter data contract',
    loading: zh ? '正在读取本地锁定结果…' : 'Loading the local locked result…',
    ready: zh ? '本地锁定结果已就绪' : 'Local locked result is ready',
    invalid: zh ? '无法读取本地锁定结果' : 'Local locked result unavailable',
    fallback: zh
      ? '已切换到内置教学样例。你仍可完成概念、实验与测验；完整数值不会由页面临时重算。'
      : 'The built-in teaching fixture is active. You can still complete the concept, lab, and checkpoint; the page will not recompute locked metrics.',
    dataset: zh ? '数据集' : 'Dataset',
    target: zh ? '预测目标' : 'Target',
    features: zh ? '模型特征' : 'Model features',
    outputs: zh ? '本章结果接口' : 'Chapter result interfaces',
    localFiles: zh ? '关联本地文件' : 'Related local files',
    reproducibility: zh ? '离线复现命令' : 'Offline reproduction command',
    reproducibilityTitle: zh
      ? '验证本章共享的九文件发布包'
      : 'Verify the shared nine-file release package',
    copyCode: zh ? '复制命令' : 'Copy command',
    copiedCode: zh ? '已复制' : 'Copied',
    outputLabel: zh ? '本章绑定输出' : 'Chapter-bound outputs',
    nextLesson: zh ? '阶段 28' : 'Phase 28',
    nextTitle: zh ? '继续进入表格回归项目' : 'Continue to the tabular-regression project',
    nextBody: zh
      ? '把本课确认的线性模型边界带入现有房价项目：使用冻结本地数据、防泄漏流水线、诚实基线、受控改进与残差复盘。'
      : "Carry this lesson's linear-model boundary into the existing housing project with frozen local data, a leakage-safe pipeline, an honest baseline, controlled improvement, and residual review.",
    nextCta: zh ? '进入房价预测项目' : 'Open Housing Price Project',
  }
})

const activeLocale = computed(() => locale.value as AppLocale)
const currentIndex = computed(() => {
  const index = props.moduleDefinition.chapters.findIndex(
    (chapter) => chapter.id === props.section.id,
  )
  return index >= 0 ? index : 0
})
const previousSection = computed(
  () => props.moduleDefinition.chapters[currentIndex.value - 1],
)
const nextSection = computed(
  () => props.moduleDefinition.chapters[currentIndex.value + 1],
)
const progressPercent = computed(() =>
  Math.round(
    ((currentIndex.value + 1) /
      Math.max(props.moduleDefinition.chapters.length, 1)) *
      100,
  ),
)
const sectionSummary = computed(
  () => localizedText(props.section.pageSummary) || localizedText(props.section.callout),
)
const activeChapterId = computed<LinearRegressionChapterId>(() =>
  linearRegressionChapterIds.includes(props.section.id as LinearRegressionChapterId)
    ? (props.section.id as LinearRegressionChapterId)
    : 'fit-line',
)
const activeChapterAssetBinding = computed(
  () => linearRegressionChapterAssets[activeChapterId.value],
)
const activeChapterAssets = computed(() =>
  activeChapterAssetBinding.value.assetIds.map((assetId) => {
    const descriptor = linearRegressionAssetById.get(assetId)
    if (!descriptor) throw new TypeError(`Unknown linear-regression asset id: ${assetId}`)
    return descriptor
  }),
)
const activeOutputLabels = computed(() =>
  activeChapterAssetBinding.value.outputIds.map(
    (outputId) => outputLabels[outputId][activeLocale.value],
  ),
)
const loadedSummary = computed(() =>
  summaryState.value.status === 'ready' ? summaryState.value.summary : undefined,
)
const reproducibilityCommand =
  'python3 scripts/linear-regression/build-phase-27-assets.py --check --offline'
const activeAssetPaths = computed(() =>
  activeChapterAssets.value.map((asset) => asset.publicPath).join('\n'),
)

function localizedText(value?: LocalizedCopy) {
  return value?.[activeLocale.value] ?? ''
}

function sectionTitle(section: StorySection) {
  return localizedText(section.title) || t(section.titleKey)
}

function chapterRoute(section: StorySection) {
  return `/learn/linear-regression/${section.id}`
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
}

function abortActiveLoad() {
  activeSummaryController?.abort()
  activeSummaryController = undefined
}

async function loadChapterSummary() {
  abortActiveLoad()
  summaryState.value = { status: 'loading' }

  const controller = new AbortController()
  activeSummaryController = controller
  const descriptor = linearRegressionAssetById.get(
    activeChapterAssetBinding.value.summaryAssetId,
  )

  if (!descriptor) {
    summaryState.value = { status: 'invalid' }
    return
  }

  try {
    const response = await fetch(withPublicBase(descriptor.publicPath), {
      signal: controller.signal,
    })
    if (!response.ok) throw new Error(`summary request failed: ${response.status}`)
    const summary = parseLinearRegressionSummary(await response.json())
    if (activeSummaryController !== controller) return
    summaryState.value = { status: 'ready', summary }
  } catch (error) {
    if (controller.signal.aborted) return
    summaryState.value = { status: 'invalid' }
  } finally {
    if (activeSummaryController === controller) {
      activeSummaryController = undefined
    }
  }
}

function emitApplyPreset(config: Partial<ExperimentConfig>) {
  emit('apply-preset', config)
}

watch(
  () => props.section.id,
  () => {
    mobileMenuOpen.value = false
    void loadChapterSummary()
  },
  { immediate: true },
)

onBeforeUnmount(abortActiveLoad)
</script>

<template>
  <section
    class="linear-course-page"
    data-testid="linear-course-page"
    :style="{ '--linear-accent': props.moduleDefinition.accent }"
  >
    <button
      type="button"
      class="linear-course-page__mobile-toggle"
      data-testid="linear-mobile-toc"
      :aria-expanded="mobileMenuOpen"
      @click="mobileMenuOpen = !mobileMenuOpen"
    >
      <span>{{ copy.mobileMenu }}</span>
      <strong>{{ sectionTitle(props.section) }}</strong>
    </button>

    <div class="linear-course-page__grid">
      <aside
        class="linear-course-page__sidebar"
        :class="{ 'is-open': mobileMenuOpen }"
        data-testid="linear-course-sidebar"
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
                {{ chapter.id === props.section.id ? copy.current : chapter.estimatedMinutes }}
                <template v-if="chapter.id !== props.section.id"> {{ copy.minutes }}</template>
              </small>
            </span>
          </router-link>
        </nav>
      </aside>

      <main class="linear-course-page__main">
        <article
          class="linear-course-page__article"
          data-testid="linear-current-chapter"
          :data-section-id="props.section.id"
        >
          <header class="linear-course-page__header">
            <div class="linear-course-page__meta">
              <span>{{ copy.chapter }} {{ formatIndex(currentIndex) }}</span>
              <strong>{{ progressPercent }}%</strong>
            </div>
            <h2>{{ sectionTitle(props.section) }}</h2>
            <p>{{ sectionSummary }}</p>
          </header>

          <div class="linear-course-page__learning-grid">
            <section class="linear-course-page__narrative">
              <MarkdownMathContent :source="localizedText(props.section.markdown)" />

              <section class="linear-course-page__contract" aria-labelledby="linear-contract-title">
                <div class="linear-course-page__section-heading">
                  <span>{{ copy.dataset }}</span>
                  <strong id="linear-contract-title">{{ copy.lockedContract }}</strong>
                </div>

                <div
                  class="linear-course-page__summary-state"
                  :class="`is-${summaryState.status}`"
                  role="status"
                  aria-live="polite"
                >
                  <template v-if="summaryState.status === 'loading'">
                    <strong>{{ copy.loading }}</strong>
                  </template>
                  <template v-else-if="summaryState.status === 'ready' && loadedSummary">
                    <strong>{{ copy.ready }}</strong>
                    <dl>
                      <div>
                        <dt>{{ copy.dataset }}</dt>
                        <dd>Bike Sharing · {{ loadedSummary.source.rows.toLocaleString() }}</dd>
                      </div>
                      <div>
                        <dt>{{ copy.target }}</dt>
                        <dd>{{ loadedSummary.source.target }}</dd>
                      </div>
                      <div>
                        <dt>{{ copy.features }}</dt>
                        <dd>{{ loadedSummary.features.order.join(' · ') }}</dd>
                      </div>
                    </dl>
                  </template>
                  <template v-else>
                    <strong>{{ copy.invalid }}</strong>
                    <p>{{ copy.fallback }}</p>
                  </template>
                </div>

                <div class="linear-course-page__contract-list">
                  <section>
                    <strong>{{ copy.outputs }}</strong>
                    <ul>
                      <li v-for="output in activeOutputLabels" :key="output">{{ output }}</li>
                    </ul>
                  </section>
                  <section>
                    <strong>{{ copy.localFiles }}</strong>
                    <ul>
                      <li v-for="asset in activeChapterAssets" :key="asset.id">
                        {{ localizedText(asset.label) }}
                      </li>
                    </ul>
                  </section>
                </div>

                <CodeLab
                  :title="copy.reproducibilityTitle"
                  :label="copy.reproducibility"
                  :code="reproducibilityCommand"
                  :output="activeAssetPaths"
                  :copy-label="copy.copyCode"
                  :copied-label="copy.copiedCode"
                  :output-label="copy.outputLabel"
                />
              </section>
            </section>

            <section class="linear-course-page__workbench">
              <div
                class="linear-course-page__lab-block"
                data-testid="linear-course-lab"
              >
                <div class="linear-course-page__section-heading">
                  <span>{{ copy.experiment }}</span>
                  <strong>{{ sectionTitle(props.section) }}</strong>
                </div>
                <LinearRegressionLessonLab
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
              </div>

              <div
                class="linear-course-page__result-block"
                data-testid="linear-course-results"
              >
                <div class="linear-course-page__section-heading">
                  <span>{{ copy.results }}</span>
                  <strong>{{ activeOutputLabels.join(' · ') }}</strong>
                </div>
                <LinearRegressionResults
                  :snapshot="props.snapshot"
                  :snapshots="props.snapshots"
                  :current-step="props.currentStep"
                  :section="props.section"
                />
              </div>
            </section>
          </div>

          <section class="linear-course-page__guide-card">
            <div class="linear-course-page__section-heading">
              <span>{{ copy.readingGuide }}</span>
              <strong>{{ localizedText(props.section.callout) }}</strong>
            </div>
            <p v-if="localizedText(props.section.experimentPrompt)">
              <b>{{ copy.tryPrompt }}：</b>
              {{ localizedText(props.section.experimentPrompt) }}
            </p>
          </section>

          <nav class="linear-course-page__pager" data-testid="linear-course-pager">
            <router-link
              v-if="previousSection"
              class="linear-course-page__pager-link"
              :to="chapterRoute(previousSection)"
            >
              <span>{{ copy.previous }}</span>
              <strong>{{ sectionTitle(previousSection) }}</strong>
            </router-link>
            <span v-else class="linear-course-page__pager-link is-disabled" aria-hidden="true">
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
            <span
              v-else
              class="linear-course-page__pager-link linear-course-page__pager-link--next is-disabled"
              aria-hidden="true"
            >
              <span>{{ copy.next }}</span>
              <strong>{{ copy.unavailable }}</strong>
            </span>
          </nav>

          <router-link
            v-if="!nextSection"
            class="lesson-bridge-card"
            data-testid="linear-phase-28-bridge"
            to="/learn/housing-price-project"
          >
            <span>{{ copy.nextLesson }}</span>
            <strong>{{ copy.nextTitle }}</strong>
            <p>{{ copy.nextBody }}</p>
            <span class="action-button">{{ copy.nextCta }}</span>
          </router-link>
        </article>
      </main>
    </div>
  </section>
</template>
