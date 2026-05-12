<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  ExperimentConfig,
  ExperimentPreset,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import { round } from '../utils/math'
import LinearRegressionMultivariateView from './LinearRegressionMultivariateView.vue'
import LinearRegressionUnivariateView from './LinearRegressionUnivariateView.vue'
import LessonWorkbench from './LessonWorkbench.vue'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  snapshots: TrainingSnapshot[]
  currentStep: number
  isPlaying: boolean
  accent: string
  section: StorySection
  presets: ExperimentPreset[]
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

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        controls: '实验控制',
        advanced: '进阶调参',
        presets: '章节预设',
        focus: '本章看什么',
        selectedHouse: '当前样本',
        predicted: '预测',
        actual: '真实',
        residual: '残差',
        area: '面积',
        age: '房龄',
        price: '房价',
        loss: 'MSE',
        trainMse: '训练 MSE',
        validationMse: '验证 MSE',
        mae: 'MAE',
        slope: '斜率',
        intercept: '截距',
        gradient: '梯度强度',
        status: '状态',
        degree: '阶数',
        weightNorm: '权重范数',
        activeWeights: '有效权重',
        penalty: '正则惩罚',
        areaWeight: '面积权重',
        ageWeight: '房龄权重',
        outlierOn: '离群点开启',
        outlierOff: '离群点关闭',
        regularizationLabels: {
          none: '无正则',
          l1: 'L1',
          l2: 'L2',
        },
        statusText: {
          initializing: '初始模型',
          'coarse-search': '大步校正',
          settling: '快速下降',
          refining: '细调参数',
          'capacity-limit': '表达受限',
          plateau: '接近收敛',
          overfitting: '正在过拟合',
          regularized: '正则约束中',
        },
        focusText: {
          'fit-line': '先看散点和直线的相对位置，把斜率和截距理解成模型语言。',
          'residual-loss': '重点看竖直残差线，以及少数大误差如何影响 MSE。',
          'training-motion': '把左侧直线移动和右侧参数轨迹连起来读。',
          'model-limits': '观察弯曲趋势和离群点如何暴露“一条线”的表达边界。',
          multivariate: '看 3D 平面如何同时解释面积、房龄和房价。',
          polynomial: '看多项式特征如何让线性权重画出曲线。',
          overfitting: '盯住训练 MSE 和验证 MSE 是否开始分叉。',
          regularization: '比较 L1 / L2 如何压小权重并让曲线更克制。',
        },
      }
    : {
        controls: 'Experiment controls',
        advanced: 'Advanced tuning',
        presets: 'Chapter presets',
        focus: 'What to watch',
        selectedHouse: 'Selected house',
        predicted: 'Predicted',
        actual: 'Actual',
        residual: 'Residual',
        area: 'Area',
        age: 'Age',
        price: 'Price',
        loss: 'MSE',
        trainMse: 'Train MSE',
        validationMse: 'Validation MSE',
        mae: 'MAE',
        slope: 'Slope',
        intercept: 'Intercept',
        gradient: 'Gradient norm',
        status: 'Status',
        degree: 'Degree',
        weightNorm: 'Weight norm',
        activeWeights: 'Active weights',
        penalty: 'Penalty',
        areaWeight: 'Area weight',
        ageWeight: 'Age weight',
        outlierOn: 'Outlier on',
        outlierOff: 'Outlier off',
        regularizationLabels: {
          none: 'None',
          l1: 'L1',
          l2: 'L2',
        },
        statusText: {
          initializing: 'Initial model',
          'coarse-search': 'Coarse correction',
          settling: 'Falling quickly',
          refining: 'Fine tuning',
          'capacity-limit': 'Capacity limit',
          plateau: 'Near convergence',
          overfitting: 'Overfitting',
          regularized: 'Regularized',
        },
        focusText: {
          'fit-line': 'Read the scatter and line first, then connect slope and intercept to model language.',
          'residual-loss': 'Watch the vertical residuals and how a few large errors influence MSE.',
          'training-motion': 'Connect the moving line on the left to the parameter path on the right.',
          'model-limits': 'Use curvature and outliers to see the expressive limit of one line.',
          multivariate: 'Watch a 3D plane explain area, age, and price at the same time.',
          polynomial: 'See how polynomial features let linear weights draw a curve.',
          overfitting: 'Watch train MSE and validation MSE split apart.',
          regularization: 'Compare how L1 / L2 shrink weights and restrain the curve.',
        },
      },
)

const isMultivariate = computed(() => props.section.id === 'multivariate')
const isRealCaliforniaFamily = computed(() =>
  props.section.id === 'overfitting' || props.section.id === 'regularization',
)
const isPolynomialFamily = computed(() =>
  props.section.id === 'polynomial' ||
  props.section.id === 'overfitting' ||
  props.section.id === 'regularization',
)
const showRegularizationControls = computed(() => props.section.id === 'regularization')
const showValidationControls = computed(() => !isRealCaliforniaFamily.value && props.section.id === 'polynomial')
const showOutlierControls = computed(() =>
  !isPolynomialFamily.value &&
  !isMultivariate.value &&
  ['residual-loss', 'model-limits'].includes(props.section.id),
)

const readoutCards = computed(() => {
  const metrics = props.snapshot?.derivedMetrics ?? {}
  const statusKey = String(metrics.statusKey ?? 'initializing') as keyof typeof copy.value.statusText
  const weights = Array.isArray(metrics.weights) ? metrics.weights : []

  if (isMultivariate.value) {
    return [
      { id: 'loss', label: copy.value.loss, value: round(Number(metrics.mse ?? props.snapshot?.loss ?? 0), 2) },
      { id: 'area-weight', label: copy.value.areaWeight, value: round(Number(weights[0] ?? 0), 3) },
      { id: 'age-weight', label: copy.value.ageWeight, value: round(Number(weights[1] ?? 0), 3) },
      { id: 'intercept', label: copy.value.intercept, value: round(Number(metrics.intercept ?? 0), 2) },
      { id: 'gradient', label: copy.value.gradient, value: round(Number(metrics.gradientNorm ?? 0), 3) },
      { id: 'status', label: copy.value.status, value: copy.value.statusText[statusKey] ?? statusKey },
    ]
  }

  if (isPolynomialFamily.value) {
    return [
      { id: 'train', label: copy.value.trainMse, value: round(Number(metrics.trainMse ?? 0), 2) },
      { id: 'validation', label: copy.value.validationMse, value: round(Number(metrics.validationMse ?? 0), 2) },
      { id: 'degree', label: copy.value.degree, value: Number(metrics.polynomialDegree ?? props.config.polynomialDegree ?? 1) },
      { id: 'norm', label: copy.value.weightNorm, value: round(Number(metrics.weightNorm ?? 0), 3) },
      { id: 'active', label: copy.value.activeWeights, value: Number(metrics.activeWeights ?? 0) },
      {
        id: 'penalty',
        label: showRegularizationControls.value ? copy.value.penalty : copy.value.status,
        value: showRegularizationControls.value
          ? round(Number(metrics.regularizationPenalty ?? 0), 3)
          : copy.value.statusText[statusKey] ?? statusKey,
      },
    ]
  }

  return [
    { id: 'loss', label: copy.value.loss, value: round(Number(metrics.mse ?? props.snapshot?.loss ?? 0), 2) },
    { id: 'mae', label: copy.value.mae, value: round(Number(metrics.mae ?? 0), 2) },
    { id: 'slope', label: copy.value.slope, value: round(Number(metrics.slope ?? props.snapshot?.regressionFit?.slope ?? 0), 3) },
    { id: 'intercept', label: copy.value.intercept, value: round(Number(metrics.intercept ?? props.snapshot?.regressionFit?.intercept ?? 0), 2) },
    { id: 'gradient', label: copy.value.gradient, value: round(Number(metrics.gradientNorm ?? 0), 3) },
    { id: 'status', label: copy.value.status, value: copy.value.statusText[statusKey] ?? statusKey },
  ]
})

const selectedObservation = computed(() => props.snapshot?.selectedObservation ?? {})
const regressionMeta = computed(() => props.snapshot?.regressionMeta)
const selectedSampleLabel = computed(
  () => regressionMeta.value?.sampleLabel[locale.value as 'zh-CN' | 'en'] ?? copy.value.selectedHouse,
)
const selectedXAxisLabel = computed(
  () => regressionMeta.value?.xLabel[locale.value as 'zh-CN' | 'en'] ?? copy.value.area,
)
const selectedXUnit = computed(
  () => regressionMeta.value?.xUnit[locale.value as 'zh-CN' | 'en'] ?? 'm2',
)
const selectedYUnit = computed(
  () => regressionMeta.value?.yUnit[locale.value as 'zh-CN' | 'en'] ?? 'w',
)
const selectedSummary = computed(() => {
  const rows = [
    {
      label: selectedXAxisLabel.value,
      value: `${round(Number(selectedObservation.value.area ?? 0), 2)} ${selectedXUnit.value}`,
    },
  ]

  if (isMultivariate.value) {
    rows.push({
      label: copy.value.age,
      value: `${round(Number(selectedObservation.value.age ?? 0), 1)} y`,
    })
  }

  rows.push(
    {
      label: copy.value.actual,
      value: `${round(Number(selectedObservation.value.actualPrice ?? 0), 2)} ${selectedYUnit.value}`,
    },
    {
      label: copy.value.predicted,
      value: `${round(Number(selectedObservation.value.predictedPrice ?? 0), 2)} ${selectedYUnit.value}`,
    },
    {
      label: copy.value.residual,
      value: `${round(Number(selectedObservation.value.residual ?? 0), 2)} ${selectedYUnit.value}`,
    },
  )

  return rows
})

const teachingVisual = computed(() => {
  const visuals =
    locale.value === 'zh-CN'
      ? {
          'fit-line': {
            label: '章节插图',
            title: '斜率旋转，截距平移',
            caption: '直线的角度由斜率控制，整体高度由截距控制；训练动画会同时调整这两个量。',
          },
          'residual-loss': {
            label: '残差动画',
            title: '误差先竖直量，再平方汇总',
            caption: '残差线保留方向，MSE 把它平方后平均；大残差会在动效里更突出。',
          },
          'training-motion': {
            label: '参数路径',
            title: '一轮更新对应两个空间',
            caption: '左侧直线在数据空间移动，右侧点在参数空间移动，二者由同一次梯度更新连接。',
          },
          'model-limits': {
            label: '模型边界',
            title: '直线无法追随弯曲趋势',
            caption: '当残差在一端连续偏向同一方向，问题通常不只是训练轮数不够。',
          },
          multivariate: {
            label: '3D 示意',
            title: '多个特征把线扩展成平面',
            caption: '面积和房龄分别改变平面在两个方向上的倾斜，残差变成点到平面的距离。',
          },
          polynomial: {
            label: '特征扩展',
            title: 'x、x²、x³ 合成曲线',
            caption: '曲线来自输入特征扩展；权重仍然是线性相加的参数。',
          },
          overfitting: {
            label: '泛化诊断',
            title: '训练与验证曲线分叉',
            caption: '训练误差下降但验证误差抬头时，模型可能开始记住噪声。',
          },
          regularization: {
            label: '正则动画',
            title: '惩罚大权重，让曲线收敛',
            caption: '增大 λ 会压小权重，牺牲少量训练贴合度来换取更稳定的曲线。',
          },
        }
      : {
          'fit-line': {
            label: 'Chapter diagram',
            title: 'Slope rotates, intercept shifts',
            caption: 'Slope controls the line angle and intercept controls its height; playback adjusts both together.',
          },
          'residual-loss': {
            label: 'Residual animation',
            title: 'Measure vertically, then square',
            caption: 'Residuals keep direction while MSE squares and averages them; large residuals become visually dominant.',
          },
          'training-motion': {
            label: 'Parameter path',
            title: 'One update, two spaces',
            caption: 'The line moves in data space while the point moves in parameter space under the same gradient update.',
          },
          'model-limits': {
            label: 'Model limit',
            title: 'One line cannot follow curvature',
            caption: 'When residuals lean the same way at one end, the issue is often model capacity, not just more epochs.',
          },
          multivariate: {
            label: '3D sketch',
            title: 'Several features become a plane',
            caption: 'Area and age tilt the plane in different directions; residuals become distances to that plane.',
          },
          polynomial: {
            label: 'Feature expansion',
            title: 'x, x², x³ combine into a curve',
            caption: 'Curvature comes from expanded input features; weights are still linearly added parameters.',
          },
          overfitting: {
            label: 'Generalization check',
            title: 'Train and validation split apart',
            caption: 'When train error falls but validation error rises, the model may be memorizing noise.',
          },
          regularization: {
            label: 'Regularization animation',
            title: 'Penalize large weights',
            caption: 'Increasing λ shrinks weights and trades a little training fit for a steadier curve.',
          },
        }

  return visuals[props.section.id as keyof typeof visuals] ?? visuals['fit-line']
})

function configNumber(key: string, fallback: number) {
  return Number(props.config[key] ?? fallback)
}

function configString(key: string, fallback: string) {
  return String(props.config[key] ?? fallback)
}

function onRangeInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('patch-config', { [key]: Number(target.value) })
}

function toggleOutlier() {
  emit('patch-config', { includeOutlier: !Boolean(props.config.includeOutlier) })
}

function setRegularizationType(value: string) {
  emit('patch-config', { regularizationType: value })
}
</script>

<template>
  <LessonWorkbench
    class="linear-regression-lab"
    :accent="props.accent"
    :section-id="props.section.id"
    variant="cockpit"
    :style="{ '--linear-accent': props.accent }"
  >
    <template #task>
      <section class="linear-regression-lab__focus linear-regression-lab__focus--task">
        <span>{{ copy.focus }}</span>
        <p>{{ copy.focusText[props.section.id as keyof typeof copy.focusText] }}</p>
      </section>
    </template>

    <template #visual>
    <div class="linear-regression-lab__workspace">
      <div class="linear-regression-lab__viz" :class="'linear-regression-lab__viz-shell'">
        <LinearRegressionMultivariateView
          v-if="isMultivariate"
          :snapshot="props.snapshot"
          :snapshots="props.snapshots"
          :current-step="props.currentStep"
          :accent="props.accent"
        />
        <LinearRegressionUnivariateView
          v-else
          :snapshot="props.snapshot"
          :snapshots="props.snapshots"
          :current-step="props.currentStep"
          :section-id="props.section.id"
        />
      </div>
    </div>
    </template>

    <template #controls>
      <div class="linear-regression-lab__controls">
        <div class="linear-regression-lab__actions">
          <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
            {{ props.isPlaying ? t('actions.pause') : t('actions.play') }}
          </button>
          <button type="button" class="action-button" @click="emit('step')">
            {{ t('actions.step') }}
          </button>
          <button type="button" class="action-button" @click="emit('replay')">
            {{ t('actions.replay') }}
          </button>
          <button type="button" class="action-button" @click="emit('reset')">
            {{ t('actions.reset') }}
          </button>
        </div>

        <div class="linear-regression-lab__control-grid">
          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.learningRate') }}</span>
              <strong>{{ round(configNumber('learningRate', 0.11), 2) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0.02"
              max="0.24"
              step="0.01"
              :value="configNumber('learningRate', 0.11)"
              @input="onRangeInput('learningRate', $event)"
            />
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.epochs') }}</span>
              <strong>{{ configNumber('epochs', 36) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="16"
              max="80"
              step="2"
              :value="configNumber('epochs', 36)"
              @input="onRangeInput('epochs', $event)"
            />
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.animationSpeed') }}</span>
              <strong>{{ configNumber('playbackMs', 120) }}ms</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="70"
              max="260"
              step="10"
              :value="configNumber('playbackMs', 120)"
              @input="onRangeInput('playbackMs', $event)"
            />
          </label>

          <label v-if="!isRealCaliforniaFamily" class="control">
            <span class="control__row">
              <span>{{ isMultivariate ? t('controls.featureNoise') : t('controls.datasetNoise') }}</span>
              <strong>{{ round(configNumber(isMultivariate ? 'featureNoise' : 'datasetNoise', 0.08), 2) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0"
              :max="isMultivariate ? 0.45 : 0.42"
              step="0.01"
              :value="configNumber(isMultivariate ? 'featureNoise' : 'datasetNoise', 0.08)"
              @input="onRangeInput(isMultivariate ? 'featureNoise' : 'datasetNoise', $event)"
            />
          </label>

          <label v-if="showOutlierControls" class="control">
            <span class="control__row">
              <span>{{ t('controls.outlierStrength') }}</span>
              <strong>{{ round(configNumber('outlierStrength', 36), 0) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0"
              max="120"
              step="2"
              :value="configNumber('outlierStrength', 36)"
              @input="onRangeInput('outlierStrength', $event)"
            />
          </label>

          <label v-if="showOutlierControls" class="control control--toggle">
            <span class="control__row">
              <span>{{ t('controls.includeOutlier') }}</span>
              <strong>{{ Boolean(props.config.includeOutlier) ? copy.outlierOn : copy.outlierOff }}</strong>
            </span>
            <button type="button" class="toggle-strip__button is-active" @click="toggleOutlier">
              {{ Boolean(props.config.includeOutlier) ? t('controls.options.on') : t('controls.options.off') }}
            </button>
          </label>
        </div>

        <div v-if="isPolynomialFamily" class="linear-regression-lab__advanced-controls">
          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.polynomialDegree') }}</span>
              <strong>{{ configNumber('polynomialDegree', 2) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="1"
              max="7"
              step="1"
              :value="configNumber('polynomialDegree', 2)"
              @input="onRangeInput('polynomialDegree', $event)"
            />
          </label>

          <label v-if="showValidationControls" class="control">
            <span class="control__row">
              <span>{{ t('controls.validationSplit') }}</span>
              <strong>{{ round(configNumber('validationSplit', 0.32) * 100, 0) }}%</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0.18"
              max="0.48"
              step="0.01"
              :value="configNumber('validationSplit', 0.32)"
              @input="onRangeInput('validationSplit', $event)"
            />
          </label>

          <label v-if="showRegularizationControls" class="control">
            <span class="control__row">
              <span>{{ t('controls.lambda') }}</span>
              <strong>{{ round(configNumber('lambda', 0.28), 2) }}</strong>
            </span>
            <input
              class="control__range"
              type="range"
              min="0"
              max="0.8"
              step="0.01"
              :value="configNumber('lambda', 0.28)"
              @input="onRangeInput('lambda', $event)"
            />
          </label>

          <div v-if="showRegularizationControls" class="control control--toggle">
            <span class="control__row">
              <span>{{ t('controls.regularizationType') }}</span>
              <strong>{{ copy.regularizationLabels[configString('regularizationType', 'l2') as 'none' | 'l1' | 'l2'] }}</strong>
            </span>
            <div class="regularization-switch">
              <button
                v-for="option in ['none', 'l1', 'l2']"
                :key="option"
                type="button"
                class="toggle-strip__button"
                :class="{ 'is-active': configString('regularizationType', 'l2') === option }"
                @click="setRegularizationType(option)"
              >
                {{ copy.regularizationLabels[option as 'none' | 'l1' | 'l2'] }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #metrics>
      <div class="linear-regression-lab__readout">
        <article
          v-for="card in readoutCards"
          :key="card.id"
          class="linear-regression-lab__metric"
        >
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>

        <section class="linear-regression-lab__selected">
          <div class="linear-regression-lab__heading">
            <span>{{ selectedSampleLabel }}</span>
            <strong>{{ copy.predicted }} vs {{ copy.actual }}</strong>
          </div>
          <div class="linear-regression-lab__mini-grid">
            <article v-for="item in selectedSummary" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </section>

        <details class="linear-regression-lab__details linear-regression-lab__details--teaching">
          <summary>
            <span>{{ teachingVisual.label }}</span>
            <strong>{{ teachingVisual.title }}</strong>
          </summary>

          <section
            class="linear-regression-lab__teaching-visual"
            :class="`linear-regression-lab__teaching-visual--${props.section.id}`"
          >
          <div class="linear-regression-lab__heading">
            <span>{{ teachingVisual.label }}</span>
            <strong>{{ teachingVisual.title }}</strong>
          </div>

          <svg
            viewBox="0 0 360 180"
            class="linear-regression-lab__teaching-svg"
            role="img"
            :aria-label="teachingVisual.title"
          >
            <defs>
              <marker
                id="linear-visual-arrow"
                markerWidth="8"
                markerHeight="8"
                refX="6"
                refY="4"
                orient="auto"
              >
                <path d="M1,1 L7,4 L1,7 Z" class="linear-visual-marker" />
              </marker>
            </defs>

            <template v-if="props.section.id === 'fit-line'">
              <line x1="42" x2="318" y1="144" y2="144" class="linear-visual-axis" />
              <line x1="42" x2="42" y1="30" y2="144" class="linear-visual-axis" />
              <circle cx="80" cy="120" r="6" class="linear-visual-dot" />
              <circle cx="132" cy="98" r="6" class="linear-visual-dot" />
              <circle cx="188" cy="76" r="6" class="linear-visual-dot" />
              <circle cx="250" cy="52" r="6" class="linear-visual-dot" />
              <line x1="58" x2="304" y1="132" y2="38" class="linear-visual-fit" />
              <line x1="254" x2="305" y1="58" y2="38" class="linear-visual-arrow" marker-end="url(#linear-visual-arrow)" />
              <line x1="42" x2="70" y1="132" y2="132" class="linear-visual-intercept" />
              <text x="268" y="86" class="linear-visual-label">w</text>
              <text x="74" y="126" class="linear-visual-label">b</text>
            </template>

            <template v-else-if="props.section.id === 'residual-loss'">
              <line x1="44" x2="318" y1="142" y2="142" class="linear-visual-axis" />
              <line x1="44" x2="44" y1="30" y2="142" class="linear-visual-axis" />
              <line x1="58" x2="306" y1="126" y2="52" class="linear-visual-fit" />
              <circle cx="192" cy="62" r="7" class="linear-visual-dot is-actual" />
              <circle cx="192" cy="86" r="5.5" class="linear-visual-dot is-predicted" />
              <line x1="192" x2="192" y1="62" y2="86" class="linear-visual-residual" />
              <rect x="232" y="58" width="72" height="46" rx="5" class="linear-visual-loss-box" />
              <text x="244" y="77" class="linear-visual-label">e</text>
              <text x="260" y="77" class="linear-visual-label">-></text>
              <text x="282" y="77" class="linear-visual-label">e²</text>
              <path d="M198 75 C216 68, 220 68, 232 76" class="linear-visual-arrow" marker-end="url(#linear-visual-arrow)" />
            </template>

            <template v-else-if="props.section.id === 'training-motion'">
              <line x1="38" x2="158" y1="138" y2="138" class="linear-visual-axis" />
              <line x1="38" x2="38" y1="42" y2="138" class="linear-visual-axis" />
              <line x1="46" x2="150" y1="120" y2="84" class="linear-visual-fit is-before" />
              <line x1="46" x2="150" y1="124" y2="54" class="linear-visual-fit is-after" />
              <path d="M166 88 C184 78, 190 74, 202 70" class="linear-visual-arrow" marker-end="url(#linear-visual-arrow)" />
              <rect x="210" y="38" width="112" height="104" rx="6" class="linear-visual-plane" />
              <polyline points="232,118 246,100 260,86 280,70 302,58" class="linear-visual-param-path" />
              <circle cx="280" cy="70" r="7" class="linear-visual-param-dot" />
              <text x="220" y="56" class="linear-visual-label">w / b</text>
            </template>

            <template v-else-if="props.section.id === 'model-limits'">
              <line x1="40" x2="320" y1="142" y2="142" class="linear-visual-axis" />
              <line x1="40" x2="40" y1="34" y2="142" class="linear-visual-axis" />
              <path d="M58 126 C120 116, 164 86, 212 70 C254 56, 284 40, 310 28" class="linear-visual-true-curve" />
              <line x1="58" x2="310" y1="128" y2="50" class="linear-visual-fit" />
              <line x1="230" x2="230" y1="64" y2="75" class="linear-visual-residual" />
              <line x1="272" x2="272" y1="44" y2="62" class="linear-visual-residual" />
              <line x1="304" x2="304" y1="31" y2="52" class="linear-visual-residual" />
              <text x="210" y="116" class="linear-visual-label">capacity limit</text>
            </template>

            <template v-else-if="props.section.id === 'multivariate'">
              <polygon points="72,126 176,76 296,102 184,150" class="linear-visual-plane-surface" />
              <line x1="72" x2="176" y1="126" y2="76" class="linear-visual-axis" />
              <line x1="72" x2="184" y1="126" y2="150" class="linear-visual-axis" />
              <line x1="72" x2="72" y1="126" y2="44" class="linear-visual-axis" />
              <line x1="150" x2="150" y1="68" y2="92" class="linear-visual-residual" />
              <line x1="230" x2="230" y1="82" y2="108" class="linear-visual-residual" />
              <circle cx="150" cy="68" r="6" class="linear-visual-dot" />
              <circle cx="230" cy="82" r="6" class="linear-visual-dot" />
              <circle cx="258" cy="120" r="6" class="linear-visual-dot" />
              <text x="76" y="40" class="linear-visual-label">price</text>
              <text x="242" y="150" class="linear-visual-label">area + age</text>
            </template>

            <template v-else-if="props.section.id === 'polynomial'">
              <line x1="40" x2="320" y1="142" y2="142" class="linear-visual-axis" />
              <rect x="62" y="104" width="30" height="38" rx="4" class="linear-visual-feature-bar" />
              <rect x="104" y="82" width="30" height="60" rx="4" class="linear-visual-feature-bar is-square" />
              <rect x="146" y="60" width="30" height="82" rx="4" class="linear-visual-feature-bar is-cube" />
              <path d="M198 124 C222 62, 258 58, 302 96" class="linear-visual-curve" />
              <path d="M178 92 C190 88, 194 88, 202 86" class="linear-visual-arrow" marker-end="url(#linear-visual-arrow)" />
              <text x="67" y="158" class="linear-visual-label">x</text>
              <text x="105" y="158" class="linear-visual-label">x²</text>
              <text x="146" y="158" class="linear-visual-label">x³</text>
            </template>

            <template v-else-if="props.section.id === 'overfitting'">
              <line x1="44" x2="318" y1="142" y2="142" class="linear-visual-axis" />
              <line x1="44" x2="44" y1="34" y2="142" class="linear-visual-axis" />
              <path d="M58 122 C98 80, 120 144, 158 76 C196 14, 232 142, 300 58" class="linear-visual-overfit-curve" />
              <polyline points="60,118 116,94 172,76 228,64 296,54" class="linear-visual-train-line" />
              <polyline points="60,122 116,104 172,86 228,96 296,118" class="linear-visual-validation-line" />
              <text x="210" y="56" class="linear-visual-label">train</text>
              <text x="210" y="114" class="linear-visual-label">val</text>
            </template>

            <template v-else>
              <line x1="40" x2="320" y1="142" y2="142" class="linear-visual-axis" />
              <rect x="64" y="54" width="30" height="88" rx="4" class="linear-visual-weight-bar is-large" />
              <rect x="112" y="84" width="30" height="58" rx="4" class="linear-visual-weight-bar is-medium" />
              <rect x="160" y="112" width="30" height="30" rx="4" class="linear-visual-weight-bar is-small" />
              <path d="M210 122 C232 62, 258 66, 302 104" class="linear-visual-overfit-curve is-muted" />
              <path d="M210 116 C238 88, 270 82, 306 96" class="linear-visual-curve" />
              <path d="M196 66 C208 66, 210 66, 220 68" class="linear-visual-arrow" marker-end="url(#linear-visual-arrow)" />
              <text x="72" y="158" class="linear-visual-label">|w|</text>
              <text x="238" y="140" class="linear-visual-label">smooth</text>
            </template>
          </svg>

          <p>{{ teachingVisual.caption }}</p>
          </section>
        </details>
      </div>
    </template>

    <template #presets>
      <details class="linear-regression-lab__details linear-regression-lab__details--presets">
        <summary>
          <span>{{ copy.presets }}</span>
          <strong>{{ t('common.presets') }}</strong>
        </summary>
        <section class="linear-regression-lab__presets">
          <div class="linear-regression-lab__heading">
            <span>{{ copy.presets }}</span>
            <strong>{{ t('common.presets') }}</strong>
          </div>
          <div class="linear-regression-lab__preset-list">
            <button
              v-for="preset in props.presets"
              :key="preset.id"
              type="button"
              class="preset-card"
              :class="{ 'is-linked': preset.id === props.section.presetId }"
              @click="emit('apply-preset', preset.config)"
            >
              <span>{{ preset.id === props.section.presetId ? t('common.tryThis') : t('actions.applyPreset') }}</span>
              <strong>{{ preset.label[locale as 'zh-CN' | 'en'] }}</strong>
              <p>{{ preset.description[locale as 'zh-CN' | 'en'] }}</p>
            </button>
          </div>
        </section>
      </details>
    </template>
  </LessonWorkbench>
</template>
