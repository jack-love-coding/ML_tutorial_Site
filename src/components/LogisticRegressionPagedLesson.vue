<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AlgorithmModuleDefinition, AppLocale, ExperimentConfig, StorySection, TrainingSnapshot } from '../types/ml'
import { withPublicBase } from '../utils/publicPath'
import AlgorithmCheckpointQuiz from './AlgorithmCheckpointQuiz.vue'
import ChapteredMediaPlayer from './ChapteredMediaPlayer.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'
import { logisticCourseChapters, logisticCourseDownloads, logisticCourseReferences } from '../modules/logistic-regression/data/course'
import { logisticMediaRegistry, type LogisticMediaId } from '../modules/logistic-regression/data/media'
import LogisticLessonLab from '../modules/logistic-regression/labs/LogisticLessonLab.vue'

const props = defineProps<{
  moduleDefinition: AlgorithmModuleDefinition
  section: StorySection
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  isPlaying: boolean
}>()

defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'toggle-play': []
  step: []
  replay: []
  reset: []
  'apply-preset': [config: Partial<ExperimentConfig>]
}>()

const { locale } = useI18n()
const menuOpen = ref(false)
const copiedCode = ref<string | null>(null)
const copyFailed = ref(false)
const activeLocale = computed(() => locale.value as AppLocale)
const chapter = computed(() => logisticCourseChapters.find((item) => item.id === props.section.id) ?? logisticCourseChapters[0]!)
const index = computed(() => logisticCourseChapters.findIndex((item) => item.id === chapter.value.id))
const previous = computed(() => logisticCourseChapters[index.value - 1])
const next = computed(() => logisticCourseChapters[index.value + 1])
const zh = computed(() => activeLocale.value === 'zh-CN')
const labels = computed(() => zh.value ? {
  toc: '课程目录', open: '展开目录', close: '收起目录', chapter: '章节', current: '当前', minutes: '分钟',
  copy: '复制代码', copied: '已复制', copyFailed: '无法写入剪贴板。请选中下方代码手动复制。',
  resources: '参考与复现下载', references: '公开资料', downloads: '本地下载', lab: '互动实验',
  next: '下一步：分类决策', nextTitle: '进入阈值与分类指标', nextBody: '模型和概率已冻结；下一阶段会在 validation 数据上选择操作阈值，再检查最终结果。',
  previous: '上一章', following: '下一章', unavailable: '暂无', manifest: '资源类型',
} : {
  toc: 'Course contents', open: 'Open contents', close: 'Close contents', chapter: 'Chapter', current: 'Current', minutes: 'min',
  copy: 'Copy code', copied: 'Copied', copyFailed: 'Clipboard copy failed. Select the code below and copy it manually.',
  resources: 'References and reproducible downloads', references: 'Public references', downloads: 'Local downloads', lab: 'Interactive lab',
  next: 'Next: classification decisions', nextTitle: 'Enter thresholds and classification metrics', nextBody: 'The model and probabilities are frozen; the next phase selects an operating threshold on validation data, then checks the final result.',
  previous: 'Previous', following: 'Next', unavailable: 'Unavailable', manifest: 'Resource type',
})

const localized = (value: { 'zh-CN': string; en: string }) => value[activeLocale.value]
const routeFor = (id: string) => `/learn/logistic-regression/${id}`
const mediaFor = (id?: string) => id ? logisticMediaRegistry[id as LogisticMediaId] : undefined

async function copyCode(code: string | undefined, id: string) {
  copiedCode.value = null
  copyFailed.value = false
  if (!code || !navigator.clipboard?.writeText) { copyFailed.value = true; return }
  try {
    await navigator.clipboard.writeText(code)
    copiedCode.value = id
    window.setTimeout(() => { copiedCode.value = null }, 1600)
  } catch {
    copyFailed.value = true
  }
}

watch(() => props.section.id, () => {
  menuOpen.value = false
  copiedCode.value = null
  copyFailed.value = false
})
</script>

<template>
  <section class="logistic-course-page" data-testid="logistic-course-page">
    <button
      type="button"
      class="logistic-course-page__toc-toggle"
      data-testid="logistic-mobile-toc"
      :aria-expanded="menuOpen"
      aria-controls="logistic-course-toc"
      @click="menuOpen = !menuOpen"
    >
      <span>{{ menuOpen ? labels.close : labels.open }}</span>
      <strong>{{ localized(chapter.title) }}</strong>
    </button>

    <div class="logistic-course-page__layout">
      <aside id="logistic-course-toc" class="logistic-course-page__sidebar" :class="{ 'is-open': menuOpen }" data-testid="logistic-course-sidebar">
        <span>{{ labels.toc }}</span>
        <nav :aria-label="labels.toc">
          <router-link v-for="(item, chapterIndex) in logisticCourseChapters" :key="item.id" :to="routeFor(item.id)" :class="{ 'is-active': item.id === chapter.id }" @click="menuOpen = false">
            <small>{{ String(chapterIndex + 1).padStart(2, '0') }}</small>
            <span><strong>{{ localized(item.title) }}</strong><em>{{ item.id === chapter.id ? labels.current : `${props.moduleDefinition.chapters[chapterIndex]?.estimatedMinutes ?? 8} ${labels.minutes}` }}</em></span>
          </router-link>
        </nav>
      </aside>

      <main class="logistic-course-page__main">
        <article data-testid="logistic-current-chapter" :data-section-id="chapter.id">
          <header class="logistic-course-page__header">
            <div><span>{{ labels.chapter }} {{ index + 1 }}/6</span><strong>{{ Math.round(((index + 1) / 6) * 100) }}%</strong></div>
            <h2>{{ localized(chapter.title) }}</h2>
            <p>{{ zh ? '从一条真实记录到冻结的概率合同：每一步先预测，再用代码、运行结果和互动验证。' : 'From one real record to a frozen probability contract: predict first, then check code, runtime output, and interaction.' }}</p>
          </header>

          <div class="logistic-course-page__content" data-testid="logistic-typed-lesson-flow">
            <template v-for="(item, blockIndex) in chapter.blocks" :key="`${item.kind}-${blockIndex}`">
              <section v-if="item.kind === 'observation-lab'" class="logistic-course-page__block logistic-course-page__lab" data-testid="logistic-course-lab" :data-scene-id="chapter.id">
                <header><span>{{ localized(item.title) }}</span><strong>{{ labels.lab }}</strong></header>
                <MarkdownMathContent :source="localized(item.body)" />
                <LogisticLessonLab :scene-id="chapter.id" />
              </section>

              <section v-else-if="item.kind === 'animation' && mediaFor(item.assetId)" class="logistic-course-page__block logistic-course-page__media">
                <header><span>{{ localized(item.title) }}</span></header>
                <MarkdownMathContent :source="localized(item.body)" />
                <ChapteredMediaPlayer v-bind="mediaFor(item.assetId)!" />
              </section>

              <section v-else-if="item.kind === 'code'" class="logistic-course-page__block logistic-course-page__code">
                <header><div><span>{{ localized(item.title) }}</span><MarkdownMathContent :source="localized(item.body)" /></div><button type="button" :aria-label="labels.copy" @click="copyCode(item.code, `${item.kind}-${blockIndex}`)">{{ copiedCode === `${item.kind}-${blockIndex}` ? labels.copied : labels.copy }}</button></header>
                <p v-if="copyFailed" class="logistic-course-page__copy-status" role="status">{{ labels.copyFailed }}</p>
                <pre><code>{{ item.code }}</code></pre>
              </section>

              <section v-else class="logistic-course-page__block" :class="`logistic-course-page__block--${item.kind}`">
                <header><span>{{ localized(item.title) }}</span></header>
                <MarkdownMathContent :source="localized(item.body)" />
              </section>
            </template>
          </div>

          <section v-if="chapter.id === 'linear-limits'" class="logistic-course-page__resources" data-testid="logistic-course-resources">
            <span>{{ labels.resources }}</span>
            <h3>{{ labels.references }}</h3>
            <ol><li v-for="item in logisticCourseReferences" :key="item.href"><a :href="item.href" target="_blank" rel="noopener noreferrer">{{ localized(item.label) }}</a></li></ol>
            <h3>{{ labels.downloads }}</h3>
            <div class="logistic-course-page__downloads"><a v-for="item in logisticCourseDownloads" :key="item.path" :href="withPublicBase(item.path)" download><small>{{ labels.manifest }} · {{ item.kind }}</small><strong>{{ localized(item.label) }}</strong></a></div>
            <router-link class="logistic-course-page__bridge" to="/learn/classification"><span>{{ labels.next }}</span><strong>{{ labels.nextTitle }}</strong><p>{{ labels.nextBody }}</p></router-link>
          </section>

          <AlgorithmCheckpointQuiz v-if="chapter.id === 'linear-limits'" module-slug="logistic-regression" module-route="/learn/logistic-regression" chapter-route-base="/learn/logistic-regression" :checkpoints="props.moduleDefinition.checkpoints" :locale="activeLocale" />

          <nav class="logistic-course-page__pager" data-testid="logistic-course-pager" :aria-label="labels.toc">
            <router-link v-if="previous" :to="routeFor(previous.id)"><span>{{ labels.previous }}</span><strong>{{ localized(previous.title) }}</strong></router-link>
            <span v-else class="is-disabled"><span>{{ labels.previous }}</span><strong>{{ labels.unavailable }}</strong></span>
            <router-link v-if="next" :to="routeFor(next.id)"><span>{{ labels.following }}</span><strong>{{ localized(next.title) }}</strong></router-link>
            <router-link v-else to="/learn/classification"><span>{{ labels.next }}</span><strong>{{ labels.nextTitle }}</strong></router-link>
          </nav>
        </article>
      </main>
    </div>
  </section>
</template>
