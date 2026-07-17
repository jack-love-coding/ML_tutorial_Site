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
import { round, sigmoid } from '../utils/math'
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

type LabCopy = {
  badge: string
  task: string
  dataset: string
  recommended: string
  probabilityMap: string
  probabilityMapCaption: string
  trainingTrace: string
  loss: string
  accuracy: string
  boundaryStrength: string
  weightNorm: string
  confidence: string
  status: string
  nearBoundary: string
  label: string
  probability: string
  sampleLoss: string
  margin: string
  presets: string
  details: string
  formula: string
  commonMistake: string
  controls: string
  statusText: Record<string, string>
  datasetOptions: Record<string, string>
  presetsById: Record<string, { label: string; description: string }>
  chapters: Record<
    string,
    {
      title: string
      prompt: string
      detail: string
      formula: string
      mistake: string
    }
  >
}

const zhCopy: LabCopy = {
  badge: '逻辑回归实验',
  task: '当前实验任务',
  dataset: '当前数据',
  recommended: '应用本章预设',
  probabilityMap: '输入空间决策边界',
  probabilityMapCaption: '背景色表示正类概率，虚线是 z = 0 的线性边界。',
  trainingTrace: '训练轨迹',
  loss: '交叉熵',
  accuracy: '准确率',
  boundaryStrength: '边界强度',
  weightNorm: '权重范数',
  confidence: '平均置信度',
  status: '状态',
  nearBoundary: '边界附近样本',
  label: '标签',
  probability: '正类概率',
  sampleLoss: '样本损失',
  margin: '边界距离',
  presets: '章节预设',
  details: '公式与观察细节',
  formula: '关键公式',
  commonMistake: '常见误解',
  controls: '核心控制',
  statusText: {
    starting: '正在建立边界',
    calibrating: '概率校准中',
    stable: '边界基本稳定',
    conservative: '正则约束偏强',
    limited: '线性表达受限',
  },
  datasetOptions: {
    tilted: '倾斜可分',
    blobs: '双团簇',
    xor: 'XOR 结构',
  },
  presetsById: {
    'linearly-separable': {
      label: '线性可分',
      description: '用清晰的线性结构观察边界旋转、平移和概率场变化。',
    },
    'over-regularized': {
      label: '正则过强',
      description: '提高正则项，观察边界如何变保守、概率场如何变平滑。',
    },
    'xor-failure': {
      label: 'XOR 失败',
      description: '切到非线性结构，验证单条直线边界的表达上限。',
    },
  },
  chapters: {
    boundary: {
      title: '一组线性参数同时决定边界位置和概率背景。',
      prompt: '观察虚线如何贴近两类样本之间的分界区，而不是只看最后分类对错。',
      detail:
        '逻辑回归先计算线性打分 z，再用 z = 0 这条线作为分类阈值。权重控制方向，偏置控制平移。',
      formula: 'z = w^T x + b；决策边界满足 w^T x + b = 0',
      mistake: '不要把逻辑回归理解成直接输出 0 或 1；它先输出线性分数。',
    },
    sigmoid: {
      title: 'sigmoid 把无界线性打分压缩成 0 到 1 的概率。',
      prompt: '重点看边界附近为何接近 0.5，以及远离边界后概率如何迅速饱和。',
      detail:
        'sigmoid 保留打分大小顺序，但把输出限制在概率区间内。z = 0 对应 p = 0.5。',
      formula: 'p(y=1|x) = sigmoid(z) = 1 / (1 + e^-z)',
      mistake: '0.5 阈值只是默认选择，真实任务会根据误报和漏报成本调整。',
    },
    confidence: {
      title: '交叉熵惩罚的不是“错了”本身，而是错得多自信。',
      prompt: '播放到中间步骤，比较 loss 下降时概率背景是否也更诚实。',
      detail:
        '当真实类别拿到的概率接近 0 时，交叉熵会急剧增大；这让模型避免高置信错误。',
      formula: 'BCE = -mean[y log(p) + (1-y) log(1-p)]',
      mistake: '交叉熵不是分类版 MSE；它衡量真实类别获得的概率质量。',
    },
    regularization: {
      title: '正则化限制权重过大，防止边界为了少数点过度激进。',
      prompt: '先使用正则过强预设，再降低正则强度，看边界和概率场的响应。',
      detail:
        'L2 正则给权重大小加成本。边界位置可能变化不大，但概率背景会明显变得更平滑。',
      formula: 'J(w,b) = BCE(w,b) + lambda ||w||^2',
      mistake: '正则化不是让模型不学习，而是让模型少用过大的权重解释噪声。',
    },
    limits: {
      title: '如果数据需要弯曲边界，继续训练也无法让直线学会转弯。',
      prompt: '切到 XOR 数据，观察准确率和 loss 是否进入平台期。',
      detail:
        '逻辑回归的决策边界是一条直线。XOR 需要非线性分割，因此失败来自模型族本身。',
      formula: 'w^T x + b = 0 只能给出 one straight split',
      mistake: '不要把 XOR 上的失败归因于训练不够久；模型表达能力不包含正确形状。',
    },
  },
}

const enCopy: LabCopy = {
  badge: 'Logistic lab',
  task: 'Current task',
  dataset: 'Dataset',
  recommended: 'Apply chapter preset',
  probabilityMap: 'Input-space boundary',
  probabilityMapCaption: 'The background is positive-class probability; the dashed line is z = 0.',
  trainingTrace: 'Training trace',
  loss: 'Cross-entropy',
  accuracy: 'Accuracy',
  boundaryStrength: 'Boundary strength',
  weightNorm: 'Weight norm',
  confidence: 'Mean confidence',
  status: 'Status',
  nearBoundary: 'Near-boundary sample',
  label: 'Label',
  probability: 'Positive prob.',
  sampleLoss: 'Sample loss',
  margin: 'Margin',
  presets: 'Chapter presets',
  details: 'Formula and observations',
  formula: 'Key formula',
  commonMistake: 'Common mistake',
  controls: 'Core controls',
  statusText: {
    starting: 'Building boundary',
    calibrating: 'Calibrating probability',
    stable: 'Boundary stable',
    conservative: 'Regularization is strong',
    limited: 'Linear capacity limit',
  },
  datasetOptions: {
    tilted: 'Tilted separable',
    blobs: 'Two blobs',
    xor: 'XOR structure',
  },
  presetsById: {
    'linearly-separable': {
      label: 'Linearly separable',
      description: 'Use a clean linear structure to inspect boundary rotation, shift, and probability.',
    },
    'over-regularized': {
      label: 'Over-regularized',
      description: 'Increase the penalty and watch the boundary become conservative and smooth.',
    },
    'xor-failure': {
      label: 'XOR failure',
      description: 'Switch to nonlinear structure and verify the limit of one straight boundary.',
    },
  },
  chapters: {
    boundary: {
      title: 'One linear parameter set controls both boundary position and probability.',
      prompt: 'Watch where the dashed line settles between classes instead of reading only right or wrong.',
      detail:
        'Logistic regression first computes a linear score z, then uses z = 0 as the classification threshold. Weights control orientation; bias controls shift.',
      formula: 'z = w^T x + b; the boundary satisfies w^T x + b = 0',
      mistake: 'Do not read logistic regression as directly outputting 0 or 1; it first outputs linear evidence.',
    },
    sigmoid: {
      title: 'Sigmoid compresses an unbounded score into a probability from 0 to 1.',
      prompt: 'Focus on why points near the boundary stay close to 0.5 and distant regions saturate.',
      detail:
        'Sigmoid preserves score ordering while restricting the output to a probability interval. z = 0 maps to p = 0.5.',
      formula: 'p(y=1|x) = sigmoid(z) = 1 / (1 + e^-z)',
      mistake: 'A 0.5 threshold is only a default; real tasks tune it around false-positive and false-negative costs.',
    },
    confidence: {
      title: 'Cross-entropy punishes confident mistakes, not just mistakes.',
      prompt: 'Pause midway and compare whether lower loss also makes the probability map more honest.',
      detail:
        'When the true class receives probability near 0, cross-entropy grows sharply. This discourages high-confidence errors.',
      formula: 'BCE = -mean[y log(p) + (1-y) log(1-p)]',
      mistake: 'Cross-entropy is not classification-flavored MSE; it measures probability assigned to the true class.',
    },
    regularization: {
      title: 'Regularization limits large weights so the boundary does not overreact to a few points.',
      prompt: 'Use the over-regularized preset, then lower the penalty and compare boundary movement.',
      detail:
        'L2 regularization adds a cost to weight magnitude. Boundary position may shift only a little, while the probability field gets smoother.',
      formula: 'J(w,b) = BCE(w,b) + lambda ||w||^2',
      mistake: 'Regularization does not stop learning; it discourages using oversized weights to explain noise.',
    },
    limits: {
      title: 'If the data needs a curved boundary, more training cannot make a line bend.',
      prompt: 'Switch to XOR data and watch accuracy and loss plateau.',
      detail:
        'The decision boundary of logistic regression is one straight line. XOR needs nonlinear separation, so the failure comes from the model family.',
      formula: 'w^T x + b = 0 gives only one straight split',
      mistake: 'Do not blame XOR failure on not training long enough; the model class lacks the right shape.',
    },
  },
}

const { t, locale } = useI18n()

const copy = computed(() => (locale.value === 'zh-CN' ? zhCopy : enCopy))

const chapterKey = computed(
  () =>
    ({
      'linear-score': 'boundary',
      'sigmoid-probability': 'sigmoid',
      'threshold-decisions': 'sigmoid',
      'log-loss': 'confidence',
      'linear-limits': 'limits',
    })[props.section.id] ?? props.section.id,
)

const chapterCopy = computed(
  () => copy.value.chapters[chapterKey.value] ?? copy.value.chapters.boundary,
)

const recommendedPreset = computed(() =>
  props.presets.find((preset) => preset.id === props.section.presetId),
)

const datasetLabel = computed(
  () => copy.value.datasetOptions[configString('datasetKind', 'tilted')] ?? configString('datasetKind', 'tilted'),
)

const weightNorm = computed(() => {
  const weights = props.snapshot?.params?.weights ?? [0, 0]
  return Math.sqrt(weights.reduce((sum, weight) => sum + weight ** 2, 0))
})

const confidenceSpread = computed(() => {
  const grid = props.snapshot?.boundaryGrid ?? []
  if (!grid.length) return 0
  return grid.reduce((sum, value) => sum + Math.abs(value - 0.5) * 2, 0) / grid.length
})

const statusKey = computed(() => {
  if (configString('datasetKind', 'tilted') === 'xor' || props.section.id === 'limits' || props.section.id === 'linear-limits') return 'limited'
  if (configNumber('regularization', 0.03) >= 0.13) return 'conservative'
  if ((props.snapshot?.accuracy ?? 0) >= 0.86 && props.snapshot?.loss && props.snapshot.loss < 0.5) return 'stable'
  if (props.currentStep <= 4) return 'starting'
  return 'calibrating'
})

const boundaryEquation = computed(() => {
  const weights = props.snapshot?.params?.weights ?? [0, 0]
  const bias = props.snapshot?.params?.bias ?? 0
  const thresholdLogit = Number(props.snapshot?.derivedMetrics?.thresholdLogit ?? 0)
  const sign = bias >= 0 ? '+' : '-'
  return `${round(weights[0], 2)} x1 + ${round(weights[1], 2)} x2 ${sign} ${round(Math.abs(bias), 2)} = ${round(thresholdLogit, 2)}`
})

const metricCards = computed(() => [
  {
    id: 'loss',
    label: copy.value.loss,
    value: round(props.snapshot?.loss ?? 0, 3),
  },
  {
    id: 'accuracy',
    label: copy.value.accuracy,
    value: `${round((props.snapshot?.accuracy ?? 0) * 100, 1)}%`,
  },
  {
    id: 'boundaryStrength',
    label: copy.value.boundaryStrength,
    value: round(Number(props.snapshot?.extraMetric ?? 0), 3),
  },
  {
    id: 'weightNorm',
    label: copy.value.weightNorm,
    value: round(Number(props.snapshot?.derivedMetrics?.weightNorm ?? weightNorm.value), 3),
  },
  {
    id: 'precision',
    label: locale.value === 'zh-CN' ? '精确率' : 'Precision',
    value: `${round(Number(props.snapshot?.derivedMetrics?.precision ?? 0) * 100, 1)}%`,
  },
  {
    id: 'recall',
    label: locale.value === 'zh-CN' ? '召回率' : 'Recall',
    value: `${round(Number(props.snapshot?.derivedMetrics?.recall ?? 0) * 100, 1)}%`,
  },
  {
    id: 'meanTrueClassProbability',
    label: locale.value === 'zh-CN' ? '真实类概率' : 'True-class prob.',
    value: round(Number(props.snapshot?.derivedMetrics?.meanTrueClassProbability ?? 0), 3),
  },
  {
    id: 'regularizationPenalty',
    label: locale.value === 'zh-CN' ? '正则项' : 'Reg. penalty',
    value: round(Number(props.snapshot?.derivedMetrics?.regularizationPenalty ?? 0), 3),
  },
  {
    id: 'confidence',
    label: copy.value.confidence,
    value: `${round(confidenceSpread.value * 100, 0)}%`,
  },
  {
    id: 'status',
    label: copy.value.status,
    value: copy.value.statusText[statusKey.value],
  },
])

const nearBoundarySample = computed(() => {
  const dataset = props.snapshot?.dataset ?? []
  const params = props.snapshot?.params
  if (!dataset.length || !params) return undefined

  return dataset
    .map((point) => {
      const score = params.weights[0] * point.x + params.weights[1] * point.y + params.bias
      const probability = sigmoid(score)
      const label = point.label ?? 0
      const safeProbability = Math.min(1 - 1e-6, Math.max(1e-6, probability))
      const loss =
        -(label * Math.log(safeProbability) + (1 - label) * Math.log(1 - safeProbability))

      return {
        point,
        probability,
        margin: Math.abs(score),
        loss,
      }
    })
    .sort((left, right) => left.margin - right.margin)[0]
})

const sampleSummary = computed(() => {
  const sample = nearBoundarySample.value
  if (!sample) return []

  return [
    { label: 'x1', value: round(sample.point.x, 2) },
    { label: 'x2', value: round(sample.point.y, 2) },
    { label: copy.value.label, value: sample.point.label ?? 0 },
    { label: copy.value.probability, value: round(sample.probability, 3) },
    { label: copy.value.sampleLoss, value: round(sample.loss, 3) },
    { label: copy.value.margin, value: round(sample.margin, 3) },
  ]
})

const controlCards = computed(() => {
  const sectionControls: Record<string, string[]> = {
    boundary: ['datasetKind', 'learningRate', 'epochs', 'playbackMs'],
    'linear-score': ['datasetKind', 'learningRate', 'epochs', 'playbackMs'],
    sigmoid: ['learningRate', 'epochs', 'noise', 'playbackMs'],
    'sigmoid-probability': ['learningRate', 'epochs', 'noise', 'playbackMs'],
    'threshold-decisions': ['threshold', 'datasetKind', 'epochs', 'playbackMs'],
    confidence: ['learningRate', 'epochs', 'datasetKind', 'playbackMs'],
    'log-loss': ['learningRate', 'epochs', 'datasetKind', 'playbackMs'],
    regularization: ['regularization', 'learningRate', 'epochs', 'datasetKind'],
    limits: ['datasetKind', 'noise', 'epochs', 'playbackMs'],
    'linear-limits': ['datasetKind', 'noise', 'epochs', 'playbackMs'],
  }

  return (sectionControls[props.section.id] ?? sectionControls.boundary).map((key) => {
    if (key === 'datasetKind') {
      return {
        type: 'select' as const,
        key,
        label: t('controls.dataset'),
        value: configString('datasetKind', 'tilted'),
        options: Object.entries(copy.value.datasetOptions).map(([value, label]) => ({ value, label })),
      }
    }

    const ranges: Record<
      string,
      { label: string; min: number; max: number; step: number; fallback: number; display: (value: number) => string }
    > = {
      learningRate: {
        label: t('controls.learningRate'),
        min: 0.02,
        max: 0.75,
        step: 0.01,
        fallback: 0.16,
        display: (value) => String(round(value, 2)),
      },
      regularization: {
        label: t('controls.regularization'),
        min: 0,
        max: 0.18,
        step: 0.01,
        fallback: 0.03,
        display: (value) => String(round(value, 2)),
      },
      threshold: {
        label: t('controls.threshold'),
        min: 0.1,
        max: 0.9,
        step: 0.01,
        fallback: 0.5,
        display: (value) => `${round(value * 100, 0)}%`,
      },
      epochs: {
        label: t('controls.epochs'),
        min: 20,
        max: 120,
        step: 2,
        fallback: 70,
        display: (value) => String(round(value, 0)),
      },
      noise: {
        label: t('controls.noise'),
        min: 0.03,
        max: 0.45,
        step: 0.01,
        fallback: 0.12,
        display: (value) => String(round(value, 2)),
      },
      playbackMs: {
        label: t('controls.animationSpeed'),
        min: 70,
        max: 300,
        step: 10,
        fallback: 120,
        display: (value) => `${round(value, 0)}ms`,
      },
    }
    const range = ranges[key]
    const value = configNumber(key, range.fallback)

    return {
      type: 'range' as const,
      key,
      label: range.label,
      min: range.min,
      max: range.max,
      step: range.step,
      value,
      display: range.display(value),
    }
  })
})

const lossPath = computed(() => sparklinePath(props.snapshots.map((snapshot) => snapshot.loss)))
const accuracyPath = computed(() =>
  sparklinePath(props.snapshots.map((snapshot) => snapshot.accuracy ?? 0)),
)
const cursorX = computed(() => {
  const maxIndex = Math.max(1, props.snapshots.length - 1)
  return 14 + (props.currentStep / maxIndex) * 172
})

function localizedPreset(preset: ExperimentPreset) {
  return (
    copy.value.presetsById[preset.id] ?? {
      label: preset.label[locale.value as AppLocale],
      description: preset.description[locale.value as AppLocale],
    }
  )
}

function sparklinePath(values: number[]) {
  if (values.length < 2) return ''
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = Math.max(1e-6, max - min)
  const width = 172
  const height = 62

  return values
    .map((value, index) => {
      const x = 14 + (index / (values.length - 1)) * width
      const y = 10 + (1 - (value - min) / range) * height
      return `${index === 0 ? 'M' : 'L'} ${round(x, 2)} ${round(y, 2)}`
    })
    .join(' ')
}

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

function onSelectInput(key: string, event: Event) {
  const target = event.target as HTMLSelectElement
  emit('patch-config', { [key]: target.value })
}
</script>

<template>
  <LessonWorkbench
    class="logistic-regression-lab"
    :accent="props.accent"
    :section-id="props.section.id"
    variant="cockpit"
    :style="{ '--logistic-accent': props.accent }"
  >
    <template #task>
      <div class="logistic-regression-lab__taskbar">
        <div class="logistic-regression-lab__task-main">
          <span class="story-chip">{{ copy.badge }}</span>
          <strong>{{ chapterCopy.title }}</strong>
          <p>{{ chapterCopy.prompt }}</p>
        </div>

        <div class="logistic-regression-lab__task-meta">
          <span>{{ copy.dataset }}</span>
          <strong>{{ datasetLabel }}</strong>
          <small>{{ boundaryEquation }}</small>
        </div>

        <button
          v-if="recommendedPreset"
          type="button"
          class="action-button"
          @click="emit('apply-preset', recommendedPreset.config)"
        >
          {{ copy.recommended }}
        </button>
      </div>
    </template>

    <template #visual>
      <section class="logistic-regression-lab__visual">
        <article class="logistic-regression-lab__boundary">
          <div class="logistic-regression-lab__heading">
            <span>{{ copy.probabilityMap }}</span>
            <strong>{{ datasetLabel }}</strong>
          </div>
          <ClassificationViz
            slug="logistic-regression"
            :snapshot="props.snapshot"
            :accent="props.accent"
            :focus-target="props.section.focusTarget"
            :size="440"
          />
          <p>{{ copy.probabilityMapCaption }}</p>
        </article>

        <article class="logistic-regression-lab__trace">
          <div class="logistic-regression-lab__heading">
            <span>{{ copy.trainingTrace }}</span>
            <strong>{{ copy.statusText[statusKey] }}</strong>
          </div>
          <svg viewBox="0 0 200 92" class="logistic-regression-lab__curve" role="img">
            <line x1="14" x2="186" y1="72" y2="72" class="logistic-curve-axis" />
            <path :d="lossPath" class="logistic-curve-line logistic-curve-line--loss" />
            <path :d="accuracyPath" class="logistic-curve-line logistic-curve-line--accuracy" />
            <line
              :x1="cursorX"
              :x2="cursorX"
              y1="8"
              y2="78"
              class="logistic-curve-cursor"
            />
          </svg>
          <div class="logistic-regression-lab__legend">
            <span>{{ copy.loss }}</span>
            <span>{{ copy.accuracy }}</span>
          </div>
        </article>
      </section>
    </template>

    <template #controls>
      <section class="logistic-regression-lab__controls">
        <div class="logistic-regression-lab__actions">
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

        <div class="logistic-regression-lab__control-grid">
          <label
            v-for="control in controlCards"
            :key="control.key"
            class="control"
            :class="`control--${control.key}`"
          >
            <span class="control__row">
              <span>{{ control.label }}</span>
              <strong v-if="control.type === 'range'">{{ control.display }}</strong>
            </span>

            <input
              v-if="control.type === 'range'"
              class="control__range"
              type="range"
              :min="control.min"
              :max="control.max"
              :step="control.step"
              :value="control.value"
              @input="onRangeInput(control.key, $event)"
            />

            <select
              v-else
              class="control__select"
              :value="control.value"
              @change="onSelectInput(control.key, $event)"
            >
              <option v-for="option in control.options" :key="option.value" :value="option.value">
                {{ option.label }}
              </option>
            </select>
          </label>
        </div>
      </section>
    </template>

    <template #metrics>
      <section class="logistic-regression-lab__readout">
        <article
          v-for="card in metricCards"
          :key="card.id"
          class="logistic-regression-lab__metric"
          :class="{ 'is-emphasis': props.section.metricEmphasis?.includes(card.id) }"
        >
          <span>{{ card.label }}</span>
          <strong>{{ card.value }}</strong>
        </article>

        <section class="logistic-regression-lab__sample">
          <div class="logistic-regression-lab__heading">
            <span>{{ copy.nearBoundary }}</span>
            <strong>{{ copy.statusText[statusKey] }}</strong>
          </div>
          <div class="logistic-regression-lab__sample-grid">
            <article v-for="item in sampleSummary" :key="item.label">
              <span>{{ item.label }}</span>
              <strong>{{ item.value }}</strong>
            </article>
          </div>
        </section>

        <details class="logistic-regression-lab__details logistic-regression-lab__details--teaching">
          <summary>
            <span>{{ copy.details }}</span>
            <strong>{{ chapterCopy.title }}</strong>
          </summary>
          <div class="logistic-regression-lab__detail-grid">
            <article>
              <span>{{ copy.task }}</span>
              <p>{{ chapterCopy.detail }}</p>
            </article>
            <article>
              <span>{{ copy.formula }}</span>
              <strong>{{ chapterCopy.formula }}</strong>
            </article>
            <article>
              <span>{{ copy.commonMistake }}</span>
              <p>{{ chapterCopy.mistake }}</p>
            </article>
          </div>
        </details>
      </section>
    </template>

    <template #presets>
      <details class="logistic-regression-lab__details logistic-regression-lab__details--presets">
        <summary>
          <span>{{ copy.presets }}</span>
          <strong>{{ t('common.presets') }}</strong>
        </summary>

        <section class="logistic-regression-lab__presets">
          <button
            v-for="preset in props.presets"
            :key="preset.id"
            type="button"
            class="preset-card"
            :class="{ 'is-linked': preset.id === props.section.presetId }"
            @click="emit('apply-preset', preset.config)"
          >
            <span>{{ preset.id === props.section.presetId ? t('common.tryThis') : t('actions.applyPreset') }}</span>
            <strong>{{ localizedPreset(preset).label }}</strong>
            <p>{{ localizedPreset(preset).description }}</p>
          </button>
        </section>
      </details>
    </template>
  </LessonWorkbench>
</template>
