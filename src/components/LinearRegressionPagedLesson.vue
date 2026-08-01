<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { linearRegressionLessonFor } from '../data/linearRegressionLesson'
import type {
  AlgorithmModuleDefinition,
  AppLocale,
  ExperimentConfig,
  LocalizedCopy,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import type { LinearRegressionExplanationBlock } from '../types/linearRegressionLesson'
import { withPublicBase } from '../utils/publicPath'
import LinearRegressionLessonBlock from './LinearRegressionLessonBlock.vue'
import LinearRegressionObservationLab from './LinearRegressionObservationLab.vue'

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

const { t, locale } = useI18n()
const mobileMenuOpen = ref(false)
const activeLocale = computed(() => locale.value as AppLocale)
const zh = computed(() => activeLocale.value === 'zh-CN')
const lesson = computed(() => linearRegressionLessonFor(props.section.id))

const copy = computed(() => ({
  toc: zh.value ? '八章目录' : 'Eight chapters',
  mobileMenu: zh.value ? '展开课程目录' : 'Open course contents',
  closeMenu: zh.value ? '收起课程目录' : 'Close course contents',
  previous: zh.value ? '上一章' : 'Previous chapter',
  next: zh.value ? '下一章' : 'Next chapter',
  chapter: zh.value ? '章节' : 'Chapter',
  minutes: zh.value ? '分钟' : 'min',
  current: zh.value ? '正在学习' : 'Current',
  unavailable: zh.value ? '暂无' : 'Unavailable',
  observation: zh.value ? '章节观察台' : 'Chapter observation lab',
  observationResult: zh.value ? '观察结果' : 'Observation result',
  controls: zh.value ? '本章只保留这些控件' : 'Controls kept for this chapter',
  references: zh.value ? '参考资料' : 'References',
  referenceNote: zh.value
    ? '正文为本站重新编写；以下资料用于延伸学习。详细许可证与使用范围记录在项目文档中。'
    : 'The lesson text is original to this site. These sources support further study; detailed licenses and use notes live in the project documentation.',
  downloads: zh.value ? '下载并复现实验' : 'Download and reproduce',
  downloadNote: zh.value
    ? 'Notebook 已执行并保留输出；图表、CSV 与页面数值来自同一资产包。'
    : 'The notebooks are executed with outputs preserved; figures, CSV files, and page values come from the same asset bundle.',
  nextLesson: zh.value ? '阶段 28' : 'Phase 28',
  nextTitle: zh.value ? '继续进入表格回归项目' : 'Continue to the tabular-regression project',
  nextBody: zh.value
    ? '把本课确认的线性模型边界带入现有房价项目：使用冻结本地数据、防泄漏流水线、诚实基线、受控改进与残差复盘。'
    : "Carry this lesson's linear-model boundary into the existing housing project with frozen local data, a leakage-safe pipeline, an honest baseline, controlled improvement, and residual review.",
  nextCta: zh.value ? '进入房价预测项目' : 'Open Housing Price Project',
}))

const currentIndex = computed(() => {
  const index = props.moduleDefinition.chapters.findIndex(
    (chapter) => chapter.id === props.section.id,
  )
  return index >= 0 ? index : 0
})
const previousSection = computed(() => props.moduleDefinition.chapters[currentIndex.value - 1])
const nextSection = computed(() => props.moduleDefinition.chapters[currentIndex.value + 1])
const progressPercent = computed(() => Math.round(
  ((currentIndex.value + 1) / Math.max(props.moduleDefinition.chapters.length, 1)) * 100,
))
const questionBlock = computed(() => lesson.value.blocks.find(
  (block): block is LinearRegressionExplanationBlock =>
    block.kind === 'explanation' && block.tone === 'question',
))
const sectionSummary = computed(() =>
  localizedText(questionBlock.value?.body)
  || localizedText(props.section.pageSummary)
  || localizedText(props.section.callout),
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

watch(() => props.section.id, () => {
  mobileMenuOpen.value = false
})
</script>

<template>
  <section
    class="linear-course-page linear-course-page--phase27a"
    data-testid="linear-course-page"
    :style="{ '--linear-accent': props.moduleDefinition.accent }"
  >
    <button
      type="button"
      class="linear-course-page__mobile-toggle"
      data-testid="linear-mobile-toc"
      :aria-expanded="mobileMenuOpen"
      aria-controls="linear-course-toc"
      @click="mobileMenuOpen = !mobileMenuOpen"
    >
      <span>{{ mobileMenuOpen ? copy.closeMenu : copy.mobileMenu }}</span>
      <strong>{{ sectionTitle(props.section) }}</strong>
    </button>

    <div class="linear-course-page__grid">
      <aside
        id="linear-course-toc"
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
            @click="mobileMenuOpen = false"
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

          <div class="linear-course-page__lesson-flow" data-testid="linear-lesson-flow">
            <template v-for="block in lesson.blocks" :key="block.id">
              <section
                v-if="block.kind === 'observation-lab'"
                class="linear-course-page__observation"
                data-testid="linear-course-lab"
                :data-block-id="block.id"
              >
                <header class="linear-course-page__observation-heading">
                  <span>{{ copy.observation }}</span>
                  <h3>{{ localizedText(block.title) }}</h3>
                  <p>{{ localizedText(block.prompt) }}</p>
                  <div class="linear-course-page__control-summary" :aria-label="copy.controls">
                    <small>{{ copy.controls }}</small>
                    <ul>
                      <li v-for="label in block.controlLabels" :key="localizedText(label)">
                        {{ localizedText(label) }}
                      </li>
                    </ul>
                  </div>
                </header>
                <LinearRegressionObservationLab
                  :chapter-id="props.section.id"
                  :control-labels="block.controlLabels"
                  data-testid="linear-course-results"
                />
              </section>
              <LinearRegressionLessonBlock v-else :block="block" />
            </template>
          </div>

          <section v-if="lesson.references?.length" class="linear-course-page__references">
            <span>{{ copy.references }}</span>
            <h3>{{ copy.references }}</h3>
            <p>{{ copy.referenceNote }}</p>
            <ol>
              <li v-for="reference in lesson.references" :key="reference.href">
                <a :href="reference.href" target="_blank" rel="noopener noreferrer">
                  {{ localizedText(reference.label) }}
                </a>
                <small>{{ localizedText(reference.note) }}</small>
              </li>
            </ol>
          </section>

          <section v-if="lesson.downloads?.length" class="linear-course-page__downloads">
            <span>{{ copy.downloads }}</span>
            <h3>{{ copy.downloads }}</h3>
            <p>{{ copy.downloadNote }}</p>
            <div>
              <a
                v-for="download in lesson.downloads"
                :key="download.publicPath"
                :href="withPublicBase(download.publicPath)"
                download
              >
                <small>{{ download.kind }}</small>
                <strong>{{ localizedText(download.label) }}</strong>
              </a>
            </div>
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
              <span>{{ copy.previous }}</span><strong>{{ copy.unavailable }}</strong>
            </span>

            <router-link
              v-if="nextSection"
              class="linear-course-page__pager-link linear-course-page__pager-link--next"
              :to="chapterRoute(nextSection)"
            >
              <span>{{ copy.next }}</span>
              <strong>{{ sectionTitle(nextSection) }}</strong>
            </router-link>
            <span v-else class="linear-course-page__pager-link linear-course-page__pager-link--next is-disabled" aria-hidden="true">
              <span>{{ copy.next }}</span><strong>{{ copy.unavailable }}</strong>
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
