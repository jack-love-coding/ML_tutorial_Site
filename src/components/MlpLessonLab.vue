<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AppLocale,
  ExperimentConfig,
  ExperimentPreset,
  StorySection,
  TrainingSnapshot,
} from '../types/ml'
import { round } from '../utils/math'
import ClassificationViz from './ClassificationViz.vue'
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
const width = 520
const height = 210
const padding = 28

type MlpControlDefinition = {
  key: string
  type: 'range' | 'select'
  labelKey: string
  min?: number
  max?: number
  step?: number
  format?: 'integer' | 'number' | 'percent' | 'speed'
}

const controlCatalog: Record<string, MlpControlDefinition> = {
  hiddenUnits: { key: 'hiddenUnits', type: 'range', labelKey: 'controls.hiddenUnits', min: 2, max: 12, step: 1, format: 'integer' },
  activation: { key: 'activation', type: 'select', labelKey: 'controls.activation' },
  learningRate: { key: 'learningRate', type: 'range', labelKey: 'controls.learningRate', min: 0.02, max: 0.4, step: 0.01, format: 'number' },
  epochs: { key: 'epochs', type: 'range', labelKey: 'controls.epochs', min: 20, max: 120, step: 2, format: 'integer' },
  noise: { key: 'noise', type: 'range', labelKey: 'controls.noise', min: 0.03, max: 0.34, step: 0.01, format: 'number' },
  validationSplit: { key: 'validationSplit', type: 'range', labelKey: 'controls.validationSplit', min: 0.15, max: 0.45, step: 0.01, format: 'percent' },
  datasetKind: { key: 'datasetKind', type: 'select', labelKey: 'controls.dataset' },
  playbackMs: { key: 'playbackMs', type: 'range', labelKey: 'controls.animationSpeed', min: 70, max: 300, step: 10, format: 'speed' },
}

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        task: '当前实验任务',
        controls: '实验控制',
        metrics: '训练与泛化读数',
        curves: '训练曲线',
        presets: '章节预设',
        visualTitle: '输入空间与隐藏空间',
        trainAcc: '训练准确率',
        validationAcc: '验证准确率',
        gap: '泛化差距',
        hiddenSeparation: '隐藏分离度',
        activationSaturation: '激活饱和/死亡',
        weightNorm: '权重范数',
        gradientNorm: '梯度强度',
        hiddenUnits: '隐藏单元',
        loss: '训练损失',
        validationLoss: '验证损失',
        focusText: {
          features: '先确认隐藏层是在把输入坐标改写成新的特征，而不是直接“记答案”。',
          activations: '只切换激活函数，观察隐藏点云、边界和饱和比例如何改变。',
          reconfigure: '把输入空间和隐藏空间对照起来看：隐藏空间越可分，输出层越容易工作。',
          backprop: '播放或单步训练，观察 loss、gradient norm 和边界是否同步变化。',
          capacity: '改变 hiddenUnits，区分“能画出更弯边界”和“验证集更好”这两个判断。',
          generalization: '同时看训练准确率、验证准确率和 gap，不要只看训练集表现。',
        },
      }
    : {
        task: 'Current lab task',
        controls: 'Experiment controls',
        metrics: 'Training and generalization readout',
        curves: 'Training curves',
        presets: 'Chapter presets',
        visualTitle: 'Input space and hidden space',
        trainAcc: 'Train accuracy',
        validationAcc: 'Validation accuracy',
        gap: 'Generalization gap',
        hiddenSeparation: 'Hidden separation',
        activationSaturation: 'Activation saturation/dead',
        weightNorm: 'Weight norm',
        gradientNorm: 'Gradient norm',
        hiddenUnits: 'Hidden units',
        loss: 'Train loss',
        validationLoss: 'Validation loss',
        focusText: {
          features: 'First verify that the hidden layer rewrites coordinates into features instead of simply memorizing answers.',
          activations: 'Change only the activation and compare the hidden cloud, boundary, and saturation ratio.',
          reconfigure: 'Read input space and hidden space together: when hidden space separates, the output layer has an easier job.',
          backprop: 'Play or step training and watch loss, gradient norm, and boundary movement together.',
          capacity: 'Change hiddenUnits and separate richer boundaries from better validation behavior.',
          generalization: 'Read train accuracy, validation accuracy, and gap together instead of trusting train accuracy alone.',
        },
      },
)

function localizedText(copyValue?: { 'zh-CN': string; en: string }) {
  if (!copyValue) return ''
  return copyValue[locale.value as AppLocale]
}

const visibleControlKeys = computed(() => {
  const controlsBySection: Record<string, string[]> = {
    features: ['hiddenUnits', 'datasetKind', 'noise'],
    activations: ['activation', 'hiddenUnits', 'datasetKind'],
    reconfigure: ['datasetKind', 'hiddenUnits', 'learningRate'],
    backprop: ['learningRate', 'epochs', 'playbackMs'],
    capacity: ['hiddenUnits', 'epochs', 'learningRate'],
    generalization: ['hiddenUnits', 'epochs', 'noise', 'validationSplit'],
  }

  return controlsBySection[props.section.id] ?? ['hiddenUnits', 'activation', 'learningRate']
})

const controlDefinitions = computed(() =>
  visibleControlKeys.value
    .map((key) => controlCatalog[key])
    .filter((control): control is MlpControlDefinition => Boolean(control)),
)

const activationOptions = ['tanh', 'relu', 'sigmoid']
const datasetOptions = ['moons', 'circles', 'spiral']

function formatConfigValue(key: string, format?: string) {
  const value = props.config[key]
  if (format === 'integer') return Math.round(Number(value ?? 0)).toString()
  if (format === 'percent') return `${Math.round(Number(value ?? 0) * 100)}%`
  if (format === 'speed') return `${Math.round(Number(value ?? 0))}ms`
  if (typeof value === 'number') return round(value, value < 1 ? 2 : 1)
  return String(value ?? '')
}

function onRangeInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('patch-config', { [key]: Number(target.value) })
}

function onSelectInput(key: string, event: Event) {
  const target = event.target as HTMLSelectElement
  emit('patch-config', { [key]: target.value })
}

const metricCards = computed(() => {
  const metrics = props.snapshot?.derivedMetrics ?? {}
  return [
    { id: 'loss', label: copy.value.loss, value: round(props.snapshot?.loss ?? 0, 3) },
    { id: 'trainAccuracy', label: copy.value.trainAcc, value: `${Math.round(Number(metrics.trainAccuracy ?? props.snapshot?.accuracy ?? 0) * 100)}%` },
    { id: 'validationAccuracy', label: copy.value.validationAcc, value: `${Math.round(Number(metrics.validationAccuracy ?? 0) * 100)}%` },
    { id: 'generalizationGap', label: copy.value.gap, value: `${Math.round(Number(metrics.generalizationGap ?? 0) * 100)} pp` },
    { id: 'hiddenSeparation', label: copy.value.hiddenSeparation, value: round(Number(metrics.hiddenSeparation ?? 0), 3) },
    { id: 'activationSaturation', label: copy.value.activationSaturation, value: `${Math.round(Number(metrics.activationSaturation ?? 0) * 100)}%` },
    { id: 'weightNorm', label: copy.value.weightNorm, value: round(Number(metrics.weightNorm ?? 0), 3) },
    { id: 'gradientNorm', label: copy.value.gradientNorm, value: round(Number(metrics.gradientNorm ?? 0), 3) },
    { id: 'hiddenUnits', label: copy.value.hiddenUnits, value: Number(metrics.hiddenUnits ?? props.config.hiddenUnits ?? 0) },
  ]
})

function curvePoints(values: number[]) {
  if (!values.length) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  return values
    .map((value, index) => {
      const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2)
      const y = height - padding - ((value - min) / range) * (height - padding * 2)
      return `${x},${y}`
    })
    .join(' ')
}

const trainLossPoints = computed(() => curvePoints(props.snapshots.map((snapshot) => snapshot.loss)))
const validationLossPoints = computed(() =>
  curvePoints(props.snapshots.map((snapshot) => Number(snapshot.derivedMetrics?.validationLoss ?? snapshot.loss))),
)
const trainAccuracyPoints = computed(() =>
  curvePoints(props.snapshots.map((snapshot) => Number(snapshot.derivedMetrics?.trainAccuracy ?? snapshot.accuracy ?? 0))),
)
const validationAccuracyPoints = computed(() =>
  curvePoints(props.snapshots.map((snapshot) => Number(snapshot.derivedMetrics?.validationAccuracy ?? 0))),
)
const cursorX = computed(() =>
  padding + (props.currentStep / Math.max(props.snapshots.length - 1, 1)) * (width - padding * 2),
)
</script>

<template>
  <LessonWorkbench
    class="mlp-lesson-lab"
    :accent="props.accent"
    :section-id="props.section.id"
  >
    <template #task>
      <section class="mlp-lesson-lab__task">
        <span>{{ copy.task }}</span>
        <strong>{{ localizedText(props.section.callout) }}</strong>
        <p>{{ copy.focusText[props.section.id as keyof typeof copy.focusText] }}</p>
        <div v-if="localizedText(props.section.experimentPrompt)" class="guide-prompt">
          {{ localizedText(props.section.experimentPrompt) }}
        </div>
      </section>
    </template>

    <template #visual>
      <section class="mlp-lesson-lab__visual">
        <div class="mlp-lesson-lab__heading">
          <span>{{ copy.visualTitle }}</span>
          <strong>{{ t(props.section.titleKey) }}</strong>
        </div>
        <ClassificationViz
          slug="mlp"
          :snapshot="props.snapshot"
          :accent="props.accent"
          :focus-target="props.section.focusTarget"
          :size="460"
        />
      </section>
    </template>

    <template #controls>
      <section class="mlp-lesson-lab__controls">
        <div class="mlp-lesson-lab__heading">
          <span>{{ copy.controls }}</span>
          <strong>{{ localizedText(props.presets.find((preset) => preset.id === props.section.presetId)?.label) }}</strong>
        </div>

        <div class="mlp-lesson-lab__actions">
          <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
            {{ props.isPlaying ? t('actions.pause') : t('actions.play') }}
          </button>
          <button type="button" class="action-button" @click="emit('step')">{{ t('actions.step') }}</button>
          <button type="button" class="action-button" @click="emit('replay')">{{ t('actions.replay') }}</button>
          <button type="button" class="action-button" @click="emit('reset')">{{ t('actions.reset') }}</button>
        </div>

        <div class="mlp-lesson-lab__control-grid">
          <label
            v-for="control in controlDefinitions"
            :key="control.key"
            class="control"
          >
            <span class="control__row">
              <span>{{ t(control.labelKey) }}</span>
              <strong>{{ formatConfigValue(control.key, control.format) }}</strong>
            </span>

            <select
              v-if="control.type === 'select'"
              class="control__select"
              :value="String(props.config[control.key])"
              @change="onSelectInput(control.key, $event)"
            >
              <option
                v-for="option in control.key === 'activation' ? activationOptions : datasetOptions"
                :key="option"
                :value="option"
              >
                {{ t(`controls.options.${option}`) }}
              </option>
            </select>

            <input
              v-else
              class="control__range"
              type="range"
              :min="control.min"
              :max="control.max"
              :step="control.step"
              :value="Number(props.config[control.key] ?? 0)"
              @input="onRangeInput(control.key, $event)"
            />
          </label>
        </div>
      </section>
    </template>

    <template #metrics>
      <section class="mlp-lesson-lab__metrics">
        <div class="mlp-lesson-lab__heading">
          <span>{{ copy.metrics }}</span>
          <strong>{{ copy.validationAcc }}</strong>
        </div>

        <div class="mlp-lesson-lab__metric-grid">
          <article
            v-for="metric in metricCards"
            :key="metric.id"
            class="mlp-lesson-lab__metric"
            :class="{ 'is-emphasis': props.section.metricEmphasis?.includes(metric.id) }"
          >
            <span>{{ metric.label }}</span>
            <strong>{{ metric.value }}</strong>
          </article>
        </div>
      </section>
    </template>

    <template #timeline>
      <section class="mlp-lesson-lab__curves">
        <div class="mlp-lesson-lab__heading">
          <span>{{ copy.curves }}</span>
          <strong>{{ copy.loss }} / {{ copy.validationAcc }}</strong>
        </div>

        <svg :viewBox="`0 0 ${width} ${height}`" class="mlp-lesson-lab__chart" role="img" aria-label="MLP training curves">
          <line :x1="padding" :x2="width - padding" :y1="height - padding" :y2="height - padding" class="chart-axis" />
          <line :x1="padding" :x2="padding" :y1="padding" :y2="height - padding" class="chart-axis" />
          <polyline :points="trainLossPoints" class="chart-line chart-line--loss" />
          <polyline :points="validationLossPoints" class="chart-line chart-line--validation" />
          <polyline :points="trainAccuracyPoints" class="chart-line chart-line--accuracy" />
          <polyline :points="validationAccuracyPoints" class="chart-line chart-line--generalization" />
          <line :x1="cursorX" :x2="cursorX" :y1="padding" :y2="height - padding" class="chart-cursor" />
        </svg>

        <div class="mlp-lesson-lab__legend">
          <span><i class="legend-dot legend-dot--loss" />{{ copy.loss }}</span>
          <span><i class="legend-dot legend-dot--validation" />{{ copy.validationLoss }}</span>
          <span><i class="legend-dot legend-dot--accuracy" />{{ copy.trainAcc }}</span>
          <span><i class="legend-dot legend-dot--generalization" />{{ copy.validationAcc }}</span>
        </div>
      </section>
    </template>

    <template #presets>
      <section class="mlp-lesson-lab__presets">
        <div class="mlp-lesson-lab__heading">
          <span>{{ copy.presets }}</span>
          <strong>{{ t('common.presets') }}</strong>
        </div>

        <div class="mlp-lesson-lab__preset-list">
          <button
            v-for="preset in props.presets"
            :key="preset.id"
            type="button"
            class="preset-card"
            :class="{ 'is-linked': preset.id === props.section.presetId }"
            @click="emit('apply-preset', preset.config)"
          >
            <span>{{ preset.id === props.section.presetId ? t('common.tryThis') : t('actions.applyPreset') }}</span>
            <strong>{{ localizedText(preset.label) }}</strong>
            <p>{{ localizedText(preset.description) }}</p>
          </button>
        </div>
      </section>
    </template>
  </LessonWorkbench>
</template>
