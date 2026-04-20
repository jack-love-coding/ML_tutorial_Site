<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AppLocale,
  ExperimentConfig,
  ExperimentConfigValue,
  ExperimentPreset,
  StorySection,
  TeachingInsight,
  TrainingSnapshot,
} from '../types/ml'
import MarkdownMathContent from './MarkdownMathContent.vue'
import GradientDescentViz from './GradientDescentViz.vue'
import {
  clampPointToLossDomain,
  getGradientLossFunctionDefinition,
  gradientLossFunctions,
} from '../simulations/gradientLossFunctions'
import { round } from '../utils/math'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  isPlaying: boolean
  accent: string
  section: StorySection
  presets: ExperimentPreset[]
  insights: TeachingInsight[]
}>()

const emit = defineEmits<{
  'update-config': [key: string, value: ExperimentConfigValue]
  'patch-config': [config: Partial<ExperimentConfig>]
  'toggle-play': []
  step: []
  replay: []
  reset: []
  'apply-preset': [config: Partial<ExperimentConfig>]
  'update-start-point': [point: { startX: number; startY: number }]
}>()

const { locale, t } = useI18n()

function localizedText(copy?: { 'zh-CN': string; en: string }) {
  if (!copy) return ''
  return copy[locale.value as AppLocale]
}

const currentFunction = computed(() =>
  getGradientLossFunctionDefinition(String(props.config.lossFunction)),
)

const recommendedFunction = computed(() =>
  props.section.recommendedFunctionId
    ? getGradientLossFunctionDefinition(props.section.recommendedFunctionId)
    : currentFunction.value,
)

const recommendedPreset = computed(() =>
  props.presets.find((preset) => preset.id === props.section.presetId),
)

const primaryInsight = computed(() => {
  const linked = props.section.linkedInsightIds ?? []
  if (!linked.length) return props.insights[0]

  const priority = new Set(linked)
  return [...props.insights].sort(
    (left, right) => Number(priority.has(right.id)) - Number(priority.has(left.id)),
  )[0]
})

const metricCards = computed(() => {
  if (!props.snapshot) return []

  const metricMap = {
    loss: {
      id: 'loss',
      label: t('metrics.loss'),
      value: round(props.snapshot.loss),
    },
    gradientNorm: {
      id: 'gradientNorm',
      label: t('metrics.gradientNorm'),
      value: round(props.snapshot.extraMetric ?? 0),
    },
    stepSize: {
      id: 'stepSize',
      label: t('metrics.stepSize'),
      value: round(Number(props.snapshot.derivedMetrics?.stepSize ?? 0)),
    },
    referenceDistance: {
      id: 'referenceDistance',
      label: t('metrics.referenceDistance'),
      value:
        props.snapshot.referenceDistance === undefined ? '-' : round(props.snapshot.referenceDistance),
    },
    status: {
      id: 'status',
      label: t('metrics.status'),
      value: t(String(props.snapshot.derivedMetrics?.statusKey ?? 'observations.gradientStable')),
    },
  } as const

  return ['loss', 'gradientNorm', 'stepSize', 'status', 'referenceDistance']
    .map((id) => metricMap[id as keyof typeof metricMap])
    .filter(Boolean)
})

const functionFormula = computed(() => `$$${currentFunction.value.formula}$$`)

const domainLabel = computed(() => {
  const { xMin, xMax, yMin, yMax } = currentFunction.value.domain
  return `x in [${xMin}, ${xMax}], y in [${yMin}, ${yMax}]`
})

const emphasisMap = computed(() => ({
  terrain: ['loss-function', 'landscape', 'saddle-local-minima'].includes(props.section.id),
  optimization: ['gradient-rule', 'learning-rate', 'noise-and-batch'].includes(props.section.id),
}))

const copy = computed(() => {
  const sectionMap =
    locale.value === 'zh-CN'
      ? {
          'loss-function': {
            badge: '损失地形实验',
            title: '先把参数空间看成一张真正可以操作的地图',
            body: '本章先不追求把所有超参数都调完，而是先建立最核心的直觉：点是参数，高度是损失，路径会被地形本身塑造。',
          },
          landscape: {
            badge: '地形观察实验',
            title: '把 3D 曲面和 2D 等高线真正对上号',
            body: '这一章重点不是机械看轨迹，而是看懂谷地、坡度和等高线密度如何一起决定路径形状。',
          },
          'gradient-rule': {
            badge: '梯度规则实验',
            title: '盯住当前点和梯度箭头，理解“为什么往负梯度走”',
            body: '建议多用单步按钮。每走一步，就看一次当前位置、梯度方向和下一步落点之间的关系。',
          },
          'learning-rate': {
            badge: '学习率实验',
            title: '只改步长，就能看到慢、稳、震荡和发散的区别',
            body: '把函数和起点尽量固定住，只动学习率，你会更容易看出步长究竟在控制什么。',
          },
          'saddle-local-minima': {
            badge: '鞍点与局部极小实验',
            title: '分清“小梯度”与“真正找到好解”不是一回事',
            body: '这一章最值得做的对比，是换不同起点，观察它们是否会落进完全不同的区域。',
          },
          'noise-and-batch': {
            badge: 'Batch 噪声实验',
            title: '同一张地形上，估计梯度的方式会改变路径气质',
            body: '保持函数不变，只切换 full、mini-batch 和 stochastic，比较轨迹的平滑程度和抖动风格。',
          },
        }
      : {
          'loss-function': {
            badge: 'Loss landscape lab',
            title: 'Treat parameter space as a map you can actually manipulate',
            body: 'Do not optimize every hyperparameter yet. First build the core intuition: a point is a parameter setting, height is loss, and the terrain itself shapes the path.',
          },
          landscape: {
            badge: 'Landscape lab',
            title: 'Make the 3D surface and the 2D contour map line up',
            body: 'This chapter is about seeing how valleys, slope, and contour density shape the trajectory rather than just watching a line move.',
          },
          'gradient-rule': {
            badge: 'Gradient rule lab',
            title: 'Watch the point and gradient arrow together',
            body: 'Use single-step mode often here. After each step, compare the current point, the gradient direction, and the next landing point.',
          },
          'learning-rate': {
            badge: 'Learning-rate lab',
            title: 'Change only the step size and compare calm descent with oscillation',
            body: 'Keep the function and the start mostly fixed, then move the learning rate. That makes its role much easier to see.',
          },
          'saddle-local-minima': {
            badge: 'Saddle and local minima lab',
            title: 'Separate small gradients from genuinely good solutions',
            body: 'The most valuable comparison here is start-point dependence: change the start and see whether optimization ends in different places.',
          },
          'noise-and-batch': {
            badge: 'Batch-noise lab',
            title: 'The gradient estimate changes the character of the path',
            body: 'Keep the terrain fixed and switch between full, mini-batch, and stochastic updates to compare smoothness and jitter.',
          },
        }

  return {
    ...sectionMap[props.section.id as keyof typeof sectionMap],
    focus: locale.value === 'zh-CN' ? '本章重点' : 'Chapter focus',
    recommendedSetup: locale.value === 'zh-CN' ? '推荐起手式' : 'Recommended setup',
    recommendedTerrain: locale.value === 'zh-CN' ? '推荐观察地形' : 'Suggested terrain',
    currentTerrain: locale.value === 'zh-CN' ? '当前损失函数' : 'Current loss function',
    terrainTags: locale.value === 'zh-CN' ? '地形标签' : 'Terrain tags',
    domain: locale.value === 'zh-CN' ? '定义域' : 'Domain',
    recommendedRate: locale.value === 'zh-CN' ? '推荐学习率' : 'Suggested rate',
    terrainControls: locale.value === 'zh-CN' ? '函数与起点' : 'Function and start point',
    optimizationControls: locale.value === 'zh-CN' ? '优化与播放' : 'Optimization and playback',
    liveReadout: locale.value === 'zh-CN' ? '实时读数' : 'Live readout',
    watchFor: locale.value === 'zh-CN' ? '现在请重点观察' : 'What to watch now',
    clickPreset: locale.value === 'zh-CN' ? '一键应用本章预设' : 'Apply this chapter preset',
    switchTerrain: locale.value === 'zh-CN' ? '切换到本章推荐函数' : 'Switch to the suggested terrain',
    dragHint:
      locale.value === 'zh-CN'
        ? '可直接拖动下方等高线里的起点，也可在这里输入坐标。'
        : 'You can drag the start point inside the contour map or type coordinates here.',
  }
})

function onRangeInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update-config', key, Number(target.value))
}

function onSelectInput(key: string, event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update-config', key, target.value)
}

function onFunctionChange(functionId: string) {
  const nextFunction = getGradientLossFunctionDefinition(functionId)
  emit('patch-config', {
    lossFunction: nextFunction.id,
    startX: nextFunction.defaultStart.x,
    startY: nextFunction.defaultStart.y,
  })
}

function switchToRecommendedFunction() {
  onFunctionChange(recommendedFunction.value.id)
}

function updateStartCoordinate(key: 'startX' | 'startY', value: number) {
  const nextPoint = clampPointToLossDomain(currentFunction.value, {
    x: key === 'startX' ? value : Number(props.config.startX),
    y: key === 'startY' ? value : Number(props.config.startY),
  })
  emit('update-start-point', { startX: nextPoint.x, startY: nextPoint.y })
}

function onCoordinateInput(key: 'startX' | 'startY', event: Event) {
  const target = event.target as HTMLInputElement
  updateStartCoordinate(key, Number(target.value))
}
</script>

<template>
  <section class="gradient-chapter-lab" :class="`gradient-chapter-lab--${section.id}`">
    <div class="gradient-chapter-lab__hero">
      <div class="gradient-chapter-lab__copy">
        <span class="story-chip">{{ copy.badge }}</span>
        <strong class="gradient-chapter-lab__headline">{{ copy.title }}</strong>
        <p>{{ copy.body }}</p>
      </div>

      <div class="gradient-chapter-lab__hero-grid">
        <article class="gradient-chapter-lab__summary">
          <span>{{ copy.focus }}</span>
          <strong>{{ localizedText(section.callout) }}</strong>
          <p>{{ localizedText(section.experimentPrompt) }}</p>
        </article>

        <article class="gradient-chapter-lab__summary">
          <span>{{ copy.recommendedSetup }}</span>
          <strong>
            {{ recommendedPreset ? localizedText(recommendedPreset.label) : localizedText(recommendedFunction.label) }}
          </strong>
          <p>
            {{
              recommendedPreset
                ? localizedText(recommendedPreset.description)
                : localizedText(recommendedFunction.teachingGoal)
            }}
          </p>
          <button
            v-if="recommendedPreset"
            type="button"
            class="action-button"
            @click="emit('apply-preset', recommendedPreset.config)"
          >
            {{ copy.clickPreset }}
          </button>
          <button
            v-else-if="recommendedFunction.id !== currentFunction.id"
            type="button"
            class="action-button"
            @click="switchToRecommendedFunction"
          >
            {{ copy.switchTerrain }}
          </button>
        </article>
      </div>
    </div>

    <div class="gradient-chapter-lab__terrain">
      <div class="panel gradient-chapter-lab__terrain-panel">
        <div class="panel__heading">
          <span>{{ copy.currentTerrain }}</span>
          <strong>{{ localizedText(currentFunction.label) }}</strong>
        </div>

        <div class="gradient-chapter-lab__terrain-grid">
          <article class="gradient-chapter-lab__formula">
            <MarkdownMathContent :source="functionFormula" />
          </article>

          <article class="gradient-chapter-lab__terrain-meta">
            <span>{{ copy.terrainTags }}</span>
            <div class="reading-meta">
              <span
                v-for="trait in currentFunction.traits"
                :key="localizedText(trait)"
                class="reading-chip"
              >
                {{ localizedText(trait) }}
              </span>
            </div>
            <div class="gradient-chapter-lab__meta-grid">
              <div>
                <span>{{ copy.domain }}</span>
                <strong>{{ domainLabel }}</strong>
              </div>
              <div>
                <span>{{ copy.recommendedRate }}</span>
                <strong>{{ round(currentFunction.recommendedLearningRate) }}</strong>
              </div>
            </div>
          </article>
        </div>
      </div>
    </div>

    <section class="panel gradient-chapter-lab__workspace">
      <div class="panel__heading">
        <span>{{ copy.optimizationControls }}</span>
        <strong>{{ localizedText(section.callout) }}</strong>
      </div>

      <GradientDescentViz
        :snapshot="snapshot"
        :config="config"
        :accent="accent"
        :focus-target="section.focusTarget"
        layout="split"
        @update-start-point="emit('update-start-point', $event)"
      />

      <div class="gradient-chapter-lab__workspace-primary">
        <section
          class="gradient-chapter-lab__control-cluster gradient-chapter-lab__control-cluster--playback"
          :class="{ 'is-emphasis': emphasisMap.optimization }"
        >
          <header>
            <span>{{ copy.optimizationControls }}</span>
            <strong>{{ localizedText(section.callout) }}</strong>
          </header>

          <div class="gradient-chapter-lab__actions">
            <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
              {{ isPlaying ? t('actions.pause') : t('actions.play') }}
            </button>
            <button type="button" class="action-button" @click="emit('step')">{{ t('actions.step') }}</button>
            <button type="button" class="action-button" @click="emit('replay')">{{ t('actions.replay') }}</button>
            <button type="button" class="action-button" @click="emit('reset')">{{ t('actions.reset') }}</button>
          </div>
        </section>

        <div class="gradient-chapter-lab__workspace-grid">
          <section
            class="gradient-chapter-lab__control-cluster"
            :class="{ 'is-emphasis': emphasisMap.optimization }"
          >
            <header>
              <span>{{ copy.optimizationControls }}</span>
              <strong>{{ t('controls.learningRate') }}</strong>
            </header>

            <div class="control-group__grid">
              <label class="control control--wide">
                <span class="control__row">
                  <span>{{ t('controls.learningRate') }}</span>
                  <strong>{{ round(Number(config.learningRate ?? 0)) }}</strong>
                </span>
                <input
                  class="control__range"
                  type="range"
                  min="0.01"
                  max="0.75"
                  step="0.01"
                  :value="Number(config.learningRate ?? 0)"
                  @input="onRangeInput('learningRate', $event)"
                />
              </label>

              <label class="control">
                <span class="control__row">
                  <span>{{ t('controls.animationSpeed') }}</span>
                  <strong>{{ Math.round(Number(config.playbackMs ?? 0)) }} ms</strong>
                </span>
                <input
                  class="control__range"
                  type="range"
                  min="60"
                  max="280"
                  step="10"
                  :value="Number(config.playbackMs ?? 0)"
                  @input="onRangeInput('playbackMs', $event)"
                />
              </label>

              <label class="control">
                <span class="control__row">
                  <span>{{ t('controls.batchMode') }}</span>
                </span>
                <select
                  class="control__select"
                  :value="String(config.batchMode)"
                  @change="onSelectInput('batchMode', $event)"
                >
                  <option value="full">{{ t('controls.options.fullBatch') }}</option>
                  <option value="mini-batch">{{ t('controls.options.miniBatch') }}</option>
                  <option value="stochastic">{{ t('controls.options.stochastic') }}</option>
                </select>
              </label>
            </div>
          </section>

          <section class="gradient-chapter-lab__readout-panel">
            <div class="panel__heading">
              <span>{{ copy.liveReadout }}</span>
              <strong>{{ t('metrics.status') }}</strong>
            </div>

            <div class="gradient-chapter-lab__metrics">
              <article
                v-for="metric in metricCards"
                :key="metric.id"
                class="gradient-chapter-lab__metric"
                :class="{ 'is-emphasis': section.metricEmphasis?.includes(metric.id) }"
              >
                <span>{{ metric.label }}</span>
                <strong>{{ metric.value }}</strong>
              </article>
            </div>

            <article
              v-if="primaryInsight"
              class="insight-card gradient-chapter-lab__insight"
              :class="`insight-card--${primaryInsight.tone}`"
            >
              <span>{{ copy.watchFor }}</span>
              <strong>{{ t(primaryInsight.titleKey) }}</strong>
              <p>{{ t(primaryInsight.bodyKey) }}</p>
            </article>

            <div v-if="localizedText(section.experimentPrompt)" class="guide-prompt">
              {{ localizedText(section.experimentPrompt) }}
            </div>
          </section>
        </div>
      </div>

      <div class="gradient-chapter-lab__workspace-secondary">
        <section
          class="gradient-chapter-lab__control-cluster"
          :class="{ 'is-emphasis': emphasisMap.terrain }"
        >
          <header>
            <span>{{ copy.terrainControls }}</span>
            <strong>{{ copy.dragHint }}</strong>
          </header>

          <div class="gradient-function-pill-strip">
            <button
              v-for="definition in gradientLossFunctions"
              :key="definition.id"
              type="button"
              class="gradient-function-pill"
              :class="{
                'is-active': definition.id === currentFunction.id,
                'is-recommended': definition.id === recommendedFunction.id,
              }"
              @click="onFunctionChange(definition.id)"
            >
              <strong>{{ localizedText(definition.label) }}</strong>
              <span>{{ localizedText(definition.teachingGoal) }}</span>
            </button>
          </div>

          <div class="control-group__grid">
            <label class="control">
              <span class="control__row">
                <span>{{ t('controls.startX') }}</span>
                <strong>{{ round(Number(config.startX ?? 0), 2) }}</strong>
              </span>
              <input
                class="control__number"
                type="number"
                :min="currentFunction.domain.xMin"
                :max="currentFunction.domain.xMax"
                step="0.1"
                :value="Number(config.startX ?? 0)"
                @change="onCoordinateInput('startX', $event)"
              />
            </label>

            <label class="control">
              <span class="control__row">
                <span>{{ t('controls.startY') }}</span>
                <strong>{{ round(Number(config.startY ?? 0), 2) }}</strong>
              </span>
              <input
                class="control__number"
                type="number"
                :min="currentFunction.domain.yMin"
                :max="currentFunction.domain.yMax"
                step="0.1"
                :value="Number(config.startY ?? 0)"
                @change="onCoordinateInput('startY', $event)"
              />
            </label>

            <label class="control">
              <span class="control__row">
                <span>{{ t('controls.iterations') }}</span>
                <strong>{{ Number(config.iterations ?? 0) }}</strong>
              </span>
              <input
                class="control__range"
                type="range"
                min="24"
                max="100"
                step="1"
                :value="Number(config.iterations ?? 0)"
                @input="onRangeInput('iterations', $event)"
              />
            </label>
          </div>
        </section>
      </div>
    </section>
  </section>
</template>
