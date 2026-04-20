<script setup lang="ts">
import { computed, ref } from 'vue'
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
  activeSection?: StorySection
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
const mobileOpen = ref(false)

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        openLab: '展开实验坞',
        closeLab: '收起实验坞',
        chapterGuide: '章节导览',
        liveWorkspace: '实时实验',
        functionGroup: '函数与起点',
        optimizationGroup: '优化与播放',
        keyMetrics: '关键读数',
        chapterNote: '本章提示',
        keepExploring: '继续往下阅读时，这里的实验状态会保持同步，不需要翻回第一章。',
      }
    : {
        openLab: 'Open lab dock',
        closeLab: 'Hide lab dock',
        chapterGuide: 'Chapter guide',
        liveWorkspace: 'Live workspace',
        functionGroup: 'Function and start',
        optimizationGroup: 'Optimization and playback',
        keyMetrics: 'Key readouts',
        chapterNote: 'Chapter note',
        keepExploring: 'The experiment state stays synced while you keep reading, so you do not need to jump back to chapter one.',
      },
)

function localizedText(entry?: { 'zh-CN': string; en: string }) {
  if (!entry) return ''
  return entry[locale.value as AppLocale]
}

const currentSectionId = computed(() => props.activeSection?.id ?? 'loss-function')

const currentFunction = computed(() =>
  getGradientLossFunctionDefinition(String(props.config.lossFunction)),
)

const recommendedPreset = computed(() =>
  props.presets.find((preset) => preset.id === props.activeSection?.presetId),
)

const primaryInsight = computed(() => {
  const linked = props.activeSection?.linkedInsightIds ?? []
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
        props.snapshot.referenceDistance === undefined ? '—' : round(props.snapshot.referenceDistance),
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

const compactMetrics = computed(() => metricCards.value.slice(0, 2))

const emphasisMap = computed(() => ({
  functionGroup: ['loss-function', 'landscape', 'gradient-rule', 'saddle-local-minima'].includes(
    currentSectionId.value,
  ),
  optimizationGroup: ['gradient-rule', 'learning-rate', 'noise-and-batch'].includes(
    currentSectionId.value,
  ),
}))

function onRangeInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update-config', key, Number(target.value))
}

function onSelectInput(key: string, event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update-config', key, target.value)
}

function onFunctionChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const nextFunction = getGradientLossFunctionDefinition(target.value)
  emit('patch-config', {
    lossFunction: nextFunction.id,
    startX: nextFunction.defaultStart.x,
    startY: nextFunction.defaultStart.y,
  })
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

function toggleMobileOpen() {
  mobileOpen.value = !mobileOpen.value
}
</script>

<template>
  <section class="gradient-sticky-rail" :class="{ 'is-mobile-open': mobileOpen }">
    <div class="gradient-sticky-rail__mobile-bar">
      <div class="gradient-sticky-rail__mobile-copy">
        <span>{{ t(activeSection?.titleKey ?? 'modules.gradientDescent.title') }}</span>
        <strong>{{ recommendedPreset ? localizedText(recommendedPreset.label) : copy.keepExploring }}</strong>
      </div>
      <div class="gradient-sticky-rail__mobile-metrics">
        <article v-for="metric in compactMetrics" :key="metric.id">
          <span>{{ metric.label }}</span>
          <strong>{{ metric.value }}</strong>
        </article>
      </div>
      <button type="button" class="action-button" @click="toggleMobileOpen">
        {{ mobileOpen ? copy.closeLab : copy.openLab }}
      </button>
    </div>

    <div class="gradient-sticky-rail__body">
      <section class="panel gradient-sticky-rail__panel gradient-sticky-rail__panel--summary">
        <div class="panel__heading">
          <span>{{ copy.chapterGuide }}</span>
          <strong>{{ t(activeSection?.titleKey ?? 'modules.gradientDescent.title') }}</strong>
        </div>
        <p class="gradient-sticky-rail__lead">{{ localizedText(activeSection?.callout) }}</p>

        <div class="gradient-sticky-rail__summary-grid">
          <button
            v-if="recommendedPreset"
            type="button"
            class="gradient-sticky-rail__preset"
            @click="emit('apply-preset', recommendedPreset.config)"
          >
            <span>{{ t('common.tryThis') }}</span>
            <strong>{{ localizedText(recommendedPreset.label) }}</strong>
            <p>{{ localizedText(recommendedPreset.description) }}</p>
          </button>

          <article
            v-if="primaryInsight"
            class="gradient-sticky-rail__note insight-card"
            :class="`insight-card--${primaryInsight.tone}`"
          >
            <span>{{ t(primaryInsight.titleKey) }}</span>
            <p>{{ t(primaryInsight.bodyKey) }}</p>
          </article>
        </div>

        <div v-if="localizedText(activeSection?.experimentPrompt)" class="guide-prompt">
          {{ localizedText(activeSection?.experimentPrompt) }}
        </div>
      </section>

      <section class="panel gradient-sticky-rail__panel gradient-sticky-rail__panel--workspace">
        <div class="panel__heading">
          <span>{{ copy.liveWorkspace }}</span>
          <strong>{{ localizedText(currentFunction.label) }}</strong>
        </div>

        <GradientDescentViz
          :snapshot="snapshot"
          :config="config"
          :accent="accent"
          :focus-target="activeSection?.focusTarget"
          layout="stacked"
          @update-start-point="emit('update-start-point', $event)"
        />

        <div class="gradient-sticky-rail__actions">
          <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
            {{ isPlaying ? t('actions.pause') : t('actions.play') }}
          </button>
          <button type="button" class="action-button" @click="emit('step')">{{ t('actions.step') }}</button>
          <button type="button" class="action-button" @click="emit('replay')">{{ t('actions.replay') }}</button>
          <button type="button" class="action-button" @click="emit('reset')">{{ t('actions.reset') }}</button>
        </div>

        <div class="gradient-sticky-rail__control-sections">
          <section
            class="gradient-sticky-rail__control-group"
            :class="{ 'is-emphasis': emphasisMap.functionGroup }"
          >
            <header>
              <span>{{ copy.functionGroup }}</span>
              <strong>{{ t('common.lossFunction') }}</strong>
            </header>

            <div class="control-group__grid">
              <label class="control control--wide">
                <span class="control__row">
                  <span>{{ t('common.lossFunction') }}</span>
                </span>
                <select class="control__select" :value="String(config.lossFunction)" @change="onFunctionChange">
                  <option
                    v-for="definition in gradientLossFunctions"
                    :key="definition.id"
                    :value="definition.id"
                  >
                    {{ localizedText(definition.label) }}
                  </option>
                </select>
              </label>

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
            </div>
          </section>

          <section
            class="gradient-sticky-rail__control-group"
            :class="{ 'is-emphasis': emphasisMap.optimizationGroup }"
          >
            <header>
              <span>{{ copy.optimizationGroup }}</span>
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
                <select class="control__select" :value="String(config.batchMode)" @change="onSelectInput('batchMode', $event)">
                  <option value="full">{{ t('controls.options.fullBatch') }}</option>
                  <option value="mini-batch">{{ t('controls.options.miniBatch') }}</option>
                  <option value="stochastic">{{ t('controls.options.stochastic') }}</option>
                </select>
              </label>
            </div>
          </section>
        </div>

        <div class="gradient-sticky-rail__metrics-block">
          <div class="panel__heading gradient-sticky-rail__metrics-heading">
            <span>{{ copy.keyMetrics }}</span>
            <strong>{{ t('metrics.status') }}</strong>
          </div>

          <div class="gradient-sticky-rail__metrics">
            <article
              v-for="metric in metricCards"
              :key="metric.id"
              class="gradient-sticky-rail__metric"
              :class="{ 'is-emphasis': activeSection?.metricEmphasis?.includes(metric.id) }"
            >
              <span>{{ metric.label }}</span>
              <strong>{{ metric.value }}</strong>
            </article>
          </div>
        </div>

        <p class="gradient-sticky-rail__hint">{{ copy.keepExploring }}</p>
      </section>
    </div>
  </section>
</template>
