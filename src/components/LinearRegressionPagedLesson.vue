<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AlgorithmModuleDefinition,
  AppLocale,
  ExperimentConfig,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import { round } from '../utils/math'
import { withPublicBase } from '../utils/publicPath'
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

const { t, locale } = useI18n()
const mobileMenuOpen = ref(false)

const fuelRows = [
  { weight: 3.5, mpg: 18 },
  { weight: 3.69, mpg: 15 },
  { weight: 3.44, mpg: 18 },
  { weight: 3.43, mpg: 16 },
  { weight: 4.34, mpg: 15 },
  { weight: 4.42, mpg: 14 },
  { weight: 2.37, mpg: 24 },
]

const residualRows = [
  { id: 'small-home', x: 55, actual: 118, predicted: 110 },
  { id: 'mid-home', x: 92, actual: 172, predicted: 182 },
  { id: 'large-home', x: 132, actual: 230, predicted: 208 },
]

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        toc: '章节目录',
        mobileMenu: '目录',
        dataVisual: '数据与图解',
        experiment: '交互实验',
        results: '结果复盘',
        previous: '上一页',
        next: '下一页',
        chapter: '章节',
        minutes: '分钟',
        current: '当前',
        unavailable: '暂无',
        readingGuide: '阅读提示',
        tryPrompt: '动手观察',
        nextLesson: '下一课',
        logisticTitle: '从连续值预测走向分类概率',
        logisticBody:
          '线性回归给出连续预测；逻辑回归会把线性打分映射成概率，用来解释分类边界。',
        logisticCta: '进入逻辑回归',
        fuelTableTitle: '汽车重量与燃油效率样本',
        weightLabel: '重量，千磅',
        mpgLabel: '每加仑英里数',
        scatterTitle: '把数据点放到坐标系里',
        equationTitle: "把直线写成 y' = b + w1x1",
        residualTableTitle: '残差到 MSE 的路径',
        residualLabel: '残差',
        squaredLabel: '平方残差',
        mseLabel: 'MSE',
      }
    : {
        toc: 'Contents',
        mobileMenu: 'Contents',
        dataVisual: 'Data and diagram',
        experiment: 'Interactive lab',
        results: 'Results review',
        previous: 'Previous',
        next: 'Next',
        chapter: 'Chapter',
        minutes: 'min',
        current: 'Current',
        unavailable: 'Unavailable',
        readingGuide: 'Reading guide',
        tryPrompt: 'Try this',
        nextLesson: 'Next lesson',
        logisticTitle: 'From continuous prediction to class probability',
        logisticBody:
          'Linear regression predicts continuous values; logistic regression maps a linear score into probability for classification.',
        logisticCta: 'Open Logistic Regression',
        fuelTableTitle: 'Car weight and fuel efficiency samples',
        weightLabel: 'Weight, thousands of pounds',
        mpgLabel: 'Miles per gallon',
        scatterTitle: 'Plot the samples first',
        equationTitle: "Write the line as y' = b + w1x1",
        residualTableTitle: 'From residuals to MSE',
        residualLabel: 'Residual',
        squaredLabel: 'Squared residual',
        mseLabel: 'MSE',
      },
)

const visualCopy = computed(() => {
  const zhCN: Record<string, { title: string; body: string }> = {
    'fit-line': {
      title: '先用汽车数据建立 feature、label、weight 和 bias 的直觉',
      body: '重量是输入特征，MPG 是标签。散点图告诉我们趋势大致向下，拟合线把这种趋势压缩成两个参数。',
    },
    'residual-loss': {
      title: '残差先按方向量距离，MSE 再把误差汇总成训练目标',
      body: '竖线表示预测和真实值的差。平方会消掉正负号，并让大的偏差在总损失里更突出。',
    },
    'training-motion': {
      title: '同一次梯度更新，同时改变数据空间里的线和参数空间里的点',
      body: '训练不是移动样本，而是移动参数。参数改变后，左侧预测线才会旋转和平移。',
    },
    'model-limits': {
      title: '当真实关系弯曲时，一条直线只能找到折中解',
      body: '如果一段区域的残差持续偏向同一方向，问题往往不是训练步数不够，而是模型家族太简单。',
    },
    multivariate: {
      title: '多个特征把一条线扩展成高维空间里的平面',
      body: '面积和房龄各自对应一个权重。平面的倾斜方向就是这些权重共同作用的几何结果。',
    },
    polynomial: {
      title: '把 x 扩展成 x、x^2、x^3 后，线性权重也能画曲线',
      body: '曲率来自特征工程，而不是权重本身变成非线性。训练仍然是在调一组线性相加的参数。',
    },
    overfitting: {
      title: '真实数据上同时看训练点、验证点和曲线摆动',
      body: '复杂曲线可能贴近训练点，却把验证误差抬高。这里要把训练 MSE 和验证 MSE 放在一起读。',
    },
    regularization: {
      title: '正则化给参数一个复杂度预算',
      body: 'L1、L2 和 Elastic Net 会用不同方式限制权重，让曲线不必为了少数训练点剧烈摆动。',
    },
  }

  const en: Record<string, { title: string; body: string }> = {
    'fit-line': {
      title: 'Use car data to ground features, labels, weights, and bias',
      body: 'Weight is the input feature and MPG is the label. The scatter plot shows a downward trend, and the line compresses that trend into two parameters.',
    },
    'residual-loss': {
      title: 'Residuals measure direction; MSE turns them into the training target',
      body: 'Vertical segments show the gap between prediction and reality. Squaring removes signs and makes large misses more prominent.',
    },
    'training-motion': {
      title: 'One gradient update moves the line and the parameter point',
      body: 'Training does not move samples. It moves parameters, and the prediction line rotates or shifts because those parameters changed.',
    },
    'model-limits': {
      title: 'When the real relationship bends, one line can only compromise',
      body: 'If residuals keep leaning in the same direction over a region, the issue is often model capacity, not just too few steps.',
    },
    multivariate: {
      title: 'Several features turn a line into a plane',
      body: 'Area and age each get a weight. The plane tilt is the geometric result of those contributions acting together.',
    },
    polynomial: {
      title: 'Expand x into x, x^2, and x^3 so linear weights can draw curves',
      body: 'Curvature comes from feature engineering, not nonlinear weights. Training still adjusts linearly combined parameters.',
    },
    overfitting: {
      title: 'Read training points, validation points, and curve movement together',
      body: 'A complex curve can hug training data while raising validation error, so train MSE and validation MSE must be compared.',
    },
    regularization: {
      title: 'Regularization gives parameters a complexity budget',
      body: 'L1, L2, and Elastic Net restrain weights differently so the curve does not swing wildly for a few training points.',
    },
  }

  const source = locale.value === 'zh-CN' ? zhCN : en
  return source[props.section.id] ?? source['fit-line']
})

const currentIndex = computed(() => {
  const index = props.moduleDefinition.chapters.findIndex((section) => section.id === props.section.id)
  return index >= 0 ? index : 0
})

const previousSection = computed(() => props.moduleDefinition.chapters[currentIndex.value - 1])
const nextSection = computed(() => props.moduleDefinition.chapters[currentIndex.value + 1])
const progressPercent = computed(() =>
  Math.round(((currentIndex.value + 1) / Math.max(props.moduleDefinition.chapters.length, 1)) * 100),
)

const activeLocale = computed(() => locale.value as AppLocale)
const sectionSummary = computed(
  () => localizedText(props.section.pageSummary) || localizedText(props.section.callout),
)
const residualMse = computed(
  () => residualRows.reduce((total, row) => total + (row.predicted - row.actual) ** 2, 0) / residualRows.length,
)

function emitApplyPreset(config: Partial<ExperimentConfig>) {
  emit('apply-preset', config)
}

function localizedText(copy?: { 'zh-CN': string; en: string }) {
  if (!copy) return ''
  return copy[activeLocale.value]
}

function sectionTitle(section: StorySection) {
  return localizedText(section.title) || t(section.titleKey)
}

function chapterRoute(section: StorySection) {
  return `/learn/linear-regression/${section.id}`
}

function publicAsset(path?: string) {
  return withPublicBase(path)
}

function formatIndex(index: number) {
  return String(index + 1).padStart(2, '0')
}

function fuelX(weight: number) {
  return 64 + (weight / 5) * 390
}

function fuelY(mpg: number) {
  return 252 - (mpg / 35) * 204
}

function residualX(x: number) {
  return 56 + (x / 160) * 396
}

function residualY(value: number) {
  return 252 - (value / 270) * 204
}

function closeMobileMenu() {
  mobileMenuOpen.value = false
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
                {{ chapter.id === props.section.id ? copy.current : `${chapter.estimatedMinutes ?? 7} ${copy.minutes}` }}
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
              <span>{{ copy.chapter }} {{ currentIndex + 1 }}</span>
              <strong>{{ progressPercent }}%</strong>
            </div>
            <h2>{{ sectionTitle(props.section) }}</h2>
            <p>{{ sectionSummary }}</p>
          </header>

          <MarkdownMathContent :source="localizedText(props.section.markdown)" />

          <section class="linear-course-page__visual" data-testid="linear-concept-visual">
            <div class="linear-course-page__section-heading">
              <span>{{ copy.dataVisual }}</span>
              <strong>{{ visualCopy.title }}</strong>
            </div>
            <p>{{ visualCopy.body }}</p>

            <template v-if="props.section.id === 'fit-line'">
              <div class="linear-course-page__fuel-grid">
                <section class="linear-course-page__data-table" :aria-label="copy.fuelTableTitle">
                  <strong>{{ copy.fuelTableTitle }}</strong>
                  <table>
                    <thead>
                      <tr>
                        <th>{{ copy.weightLabel }}</th>
                        <th>{{ copy.mpgLabel }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="row in fuelRows" :key="`${row.weight}-${row.mpg}`">
                        <td>{{ row.weight }}</td>
                        <td>{{ row.mpg }}</td>
                      </tr>
                    </tbody>
                  </table>
                </section>

                <figure class="linear-course-page__figure">
                  <figcaption>{{ copy.scatterTitle }}</figcaption>
                  <svg viewBox="0 0 520 300" role="img" :aria-label="copy.scatterTitle">
                    <line x1="56" x2="474" y1="252" y2="252" class="linear-course-axis" />
                    <line x1="56" x2="56" y1="42" y2="252" class="linear-course-axis" />
                    <g class="linear-course-grid">
                      <line v-for="tick in [1, 2, 3, 4, 5]" :key="`x-${tick}`" :x1="fuelX(tick)" :x2="fuelX(tick)" y1="48" y2="252" />
                      <line v-for="tick in [5, 10, 15, 20, 25, 30, 35]" :key="`y-${tick}`" x1="56" x2="474" :y1="fuelY(tick)" :y2="fuelY(tick)" />
                    </g>
                    <line :x1="fuelX(2.1)" :y1="fuelY(24.4)" :x2="fuelX(4.7)" :y2="fuelY(13.2)" class="linear-course-fit" />
                    <circle
                      v-for="row in fuelRows"
                      :key="`dot-${row.weight}-${row.mpg}`"
                      :cx="fuelX(row.weight)"
                      :cy="fuelY(row.mpg)"
                      r="6"
                      class="linear-course-dot"
                    />
                    <text x="236" y="286" class="linear-course-label">{{ copy.weightLabel }}</text>
                    <text x="18" y="92" class="linear-course-label linear-course-label--vertical">{{ copy.mpgLabel }}</text>
                  </svg>
                </figure>
              </div>

              <figure class="linear-course-page__equation-figure">
                <figcaption>{{ copy.equationTitle }}</figcaption>
                <svg viewBox="0 0 720 260" role="img" :aria-label="copy.equationTitle">
                  <text x="212" y="88" class="linear-equation-main">y' = b + w1x1</text>
                  <g class="linear-equation-callout">
                    <path d="M220 108 L168 150" />
                    <text x="76" y="186">prediction</text>
                  </g>
                  <g class="linear-equation-callout">
                    <path d="M354 108 L314 150" />
                    <text x="286" y="186">bias</text>
                  </g>
                  <g class="linear-equation-callout">
                    <path d="M452 108 L444 150" />
                    <text x="406" y="186">weight</text>
                  </g>
                  <g class="linear-equation-callout">
                    <path d="M510 108 L590 150" />
                    <text x="542" y="186">feature value</text>
                  </g>
                  <path d="M316 204 L316 226 L456 226 L456 204" class="linear-equation-brace" />
                  <text x="248" y="246" class="linear-equation-note">calculated from training</text>
                </svg>
              </figure>
            </template>

            <template v-else-if="props.section.id === 'residual-loss'">
              <div class="linear-course-page__residual-grid">
                <figure class="linear-course-page__figure">
                  <figcaption>{{ copy.residualTableTitle }}</figcaption>
                  <svg viewBox="0 0 520 300" role="img" :aria-label="copy.residualTableTitle">
                    <line x1="56" x2="474" y1="252" y2="252" class="linear-course-axis" />
                    <line x1="56" x2="56" y1="42" y2="252" class="linear-course-axis" />
                    <line :x1="residualX(38)" :y1="residualY(88)" :x2="residualX(148)" :y2="residualY(232)" class="linear-course-fit" />
                    <g v-for="row in residualRows" :key="row.id">
                      <line
                        :x1="residualX(row.x)"
                        :x2="residualX(row.x)"
                        :y1="residualY(row.actual)"
                        :y2="residualY(row.predicted)"
                        class="linear-course-residual"
                      />
                      <circle :cx="residualX(row.x)" :cy="residualY(row.actual)" r="7" class="linear-course-dot" />
                      <circle :cx="residualX(row.x)" :cy="residualY(row.predicted)" r="5" class="linear-course-dot linear-course-dot--prediction" />
                    </g>
                  </svg>
                </figure>

                <section class="linear-course-page__loss-summary">
                  <strong>{{ copy.residualTableTitle }}</strong>
                  <div
                    v-for="row in residualRows"
                    :key="`loss-${row.id}`"
                    class="linear-course-page__loss-row"
                  >
                    <span>{{ copy.residualLabel }} {{ row.predicted - row.actual > 0 ? '+' : '' }}{{ row.predicted - row.actual }}</span>
                    <strong>{{ copy.squaredLabel }} {{ round((row.predicted - row.actual) ** 2, 0) }}</strong>
                  </div>
                  <div class="linear-course-page__mse">
                    <span>{{ copy.mseLabel }}</span>
                    <strong>{{ round(residualMse, 1) }}</strong>
                  </div>
                </section>
              </div>
            </template>

            <template v-else-if="props.section.id === 'training-motion'">
              <figure class="linear-course-page__wide-figure">
                <svg viewBox="0 0 760 300" role="img" :aria-label="visualCopy.title">
                  <rect x="34" y="34" width="310" height="224" rx="10" class="linear-course-panel-bg" />
                  <text x="58" y="68" class="linear-course-label">data space</text>
                  <line x1="66" x2="306" y1="222" y2="222" class="linear-course-axis" />
                  <line x1="66" x2="66" y1="82" y2="222" class="linear-course-axis" />
                  <line x1="82" x2="292" y1="190" y2="150" class="linear-course-fit linear-course-fit--before" />
                  <line x1="82" x2="292" y1="206" y2="104" class="linear-course-fit" />
                  <path d="M194 156 C204 138, 214 126, 230 114" class="linear-course-arrow" />
                  <circle cx="116" cy="178" r="6" class="linear-course-dot" />
                  <circle cx="178" cy="142" r="6" class="linear-course-dot" />
                  <circle cx="254" cy="112" r="6" class="linear-course-dot" />

                  <rect x="416" y="34" width="310" height="224" rx="10" class="linear-course-panel-bg" />
                  <text x="440" y="68" class="linear-course-label">parameter space</text>
                  <line x1="454" x2="686" y1="222" y2="222" class="linear-course-axis" />
                  <line x1="454" x2="454" y1="82" y2="222" class="linear-course-axis" />
                  <polyline points="480,204 520,176 560,146 608,122 660,106" class="linear-course-param-path" />
                  <circle cx="660" cy="106" r="9" class="linear-course-param-dot" />
                  <text x="646" y="92" class="linear-course-label">w,b</text>
                </svg>
              </figure>
            </template>

            <template v-else-if="props.section.media">
              <section class="story-media story-media--linear linear-course-page__media">
                <div class="story-media__frame">
                  <video
                    controls
                    playsinline
                    preload="metadata"
                    :poster="publicAsset(props.section.media.posterPath)"
                    :aria-label="localizedText(props.section.media.title)"
                  >
                    <source :src="publicAsset(props.section.media.assetPath)" type="video/mp4" />
                  </video>
                </div>
                <div class="story-media__copy">
                  <span>{{ localizedText(props.section.media.title) }}</span>
                  <MarkdownMathContent :source="localizedText(props.section.media.body)" />
                </div>
              </section>
            </template>

            <template v-else>
              <figure class="linear-course-page__wide-figure">
                <svg viewBox="0 0 760 300" role="img" :aria-label="visualCopy.title">
                  <template v-if="props.section.id === 'model-limits'">
                    <line x1="72" x2="690" y1="238" y2="238" class="linear-course-axis" />
                    <line x1="72" x2="72" y1="46" y2="238" class="linear-course-axis" />
                    <path d="M96 216 C198 202, 286 126, 376 110 C492 90, 580 56, 664 38" class="linear-course-true-curve" />
                    <line x1="96" x2="664" y1="210" y2="76" class="linear-course-fit" />
                    <line x1="518" x2="518" y1="75" y2="112" class="linear-course-residual" />
                    <line x1="604" x2="604" y1="50" y2="90" class="linear-course-residual" />
                    <text x="438" y="178" class="linear-course-label">systematic residuals</text>
                  </template>

                  <template v-else-if="props.section.id === 'multivariate'">
                    <polygon points="112,218 322,92 662,142 438,252" class="linear-course-plane" />
                    <line x1="112" x2="322" y1="218" y2="92" class="linear-course-axis" />
                    <line x1="112" x2="438" y1="218" y2="252" class="linear-course-axis" />
                    <line x1="112" x2="112" y1="218" y2="62" class="linear-course-axis" />
                    <circle cx="260" cy="94" r="8" class="linear-course-dot" />
                    <circle cx="466" cy="116" r="8" class="linear-course-dot" />
                    <circle cx="538" cy="178" r="8" class="linear-course-dot" />
                    <line x1="260" x2="260" y1="94" y2="130" class="linear-course-residual" />
                    <line x1="466" x2="466" y1="116" y2="154" class="linear-course-residual" />
                    <text x="116" y="52" class="linear-course-label">price</text>
                    <text x="512" y="268" class="linear-course-label">area + age</text>
                  </template>

                  <template v-else>
                    <line x1="72" x2="690" y1="238" y2="238" class="linear-course-axis" />
                    <rect x="110" y="168" width="54" height="70" rx="6" class="linear-course-feature-bar" />
                    <rect x="190" y="126" width="54" height="112" rx="6" class="linear-course-feature-bar linear-course-feature-bar--two" />
                    <rect x="270" y="90" width="54" height="148" rx="6" class="linear-course-feature-bar linear-course-feature-bar--three" />
                    <path d="M396 208 C452 76, 546 76, 654 170" class="linear-course-true-curve" />
                    <path d="M342 142 C364 134, 378 126, 398 118" class="linear-course-arrow" />
                    <text x="120" y="264" class="linear-course-label">x</text>
                    <text x="194" y="264" class="linear-course-label">x^2</text>
                    <text x="274" y="264" class="linear-course-label">x^3</text>
                  </template>
                </svg>
              </figure>
            </template>
          </section>

          <section class="linear-course-page__lab-block" data-testid="linear-course-lab">
            <div class="linear-course-page__section-heading">
              <span>{{ copy.experiment }}</span>
              <strong>{{ localizedText(props.section.experimentPrompt) || sectionTitle(props.section) }}</strong>
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
          </section>

          <section class="linear-course-page__review" data-testid="linear-course-results">
            <LinearRegressionResults
              :section="props.section"
              :snapshot="props.snapshot"
              :snapshots="props.snapshots"
              :current-step="props.currentStep"
            />

            <section class="panel lesson-panel linear-course-page__guide-card">
              <div class="panel__heading">
                <span>{{ copy.readingGuide }}</span>
                <strong>{{ localizedText(props.section.callout) }}</strong>
              </div>
              <p v-if="localizedText(props.section.experimentPrompt)" class="lesson-panel__prompt">
                {{ localizedText(props.section.experimentPrompt) }}
              </p>

              <router-link
                v-if="!nextSection"
                class="lesson-bridge-card"
                to="/learn/logistic-regression"
              >
                <span>{{ copy.nextLesson }}</span>
                <strong>{{ copy.logisticTitle }}</strong>
                <p>{{ copy.logisticBody }}</p>
                <small>{{ copy.logisticCta }}</small>
              </router-link>
            </section>
          </section>

          <nav class="linear-course-page__pager" data-testid="linear-course-pager" :aria-label="copy.toc">
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
              to="/learn/logistic-regression"
            >
              <span>{{ copy.nextLesson }}</span>
              <strong>{{ copy.logisticTitle }}</strong>
            </router-link>
          </nav>
        </article>
      </main>
    </div>
  </section>
</template>
