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
const isPolynomialFamily = computed(() =>
  props.section.id === 'polynomial' ||
  props.section.id === 'overfitting' ||
  props.section.id === 'regularization',
)
const showRegularizationControls = computed(() => props.section.id === 'regularization')
const showValidationControls = computed(() =>
  props.section.id === 'overfitting' || props.section.id === 'regularization',
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
const selectedSummary = computed(() => {
  const rows = [
    {
      label: copy.value.area,
      value: `${round(Number(selectedObservation.value.area ?? 0), 1)} m2`,
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
      value: `${round(Number(selectedObservation.value.actualPrice ?? 0), 1)} w`,
    },
    {
      label: copy.value.predicted,
      value: `${round(Number(selectedObservation.value.predictedPrice ?? 0), 1)} w`,
    },
    {
      label: copy.value.residual,
      value: `${round(Number(selectedObservation.value.residual ?? 0), 1)} w`,
    },
  )

  return rows
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
  <section
    class="linear-regression-lab"
    :style="{ '--linear-accent': props.accent }"
  >
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

          <label class="control">
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

          <label v-if="!isPolynomialFamily && !isMultivariate" class="control">
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

          <label v-if="!isPolynomialFamily && !isMultivariate" class="control control--toggle">
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
            <span>{{ copy.selectedHouse }}</span>
            <strong>{{ copy.predicted }} vs {{ copy.actual }}</strong>
          </div>
          <div class="linear-regression-lab__mini-grid">
            <article v-for="item in selectedSummary" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </section>

        <section class="linear-regression-lab__focus">
          <span>{{ copy.focus }}</span>
          <p>{{ copy.focusText[props.section.id as keyof typeof copy.focusText] }}</p>
        </section>

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
      </div>
    </div>
  </section>
</template>
