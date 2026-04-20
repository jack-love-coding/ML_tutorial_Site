<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type {
  AlgorithmModuleDefinition,
  AppLocale,
  ExperimentConfig,
  ExperimentConfigValue,
  StorySection,
  TeachingInsight,
  TrainingSnapshot,
} from '../types/ml'
import MetricsPanel from './MetricsPanel.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'
import {
  clampPointToLossDomain,
  getGradientLossFunctionDefinition,
  gradientLossFunctions,
} from '../simulations/gradientLossFunctions'

const props = defineProps<{
  slug: AlgorithmModuleDefinition['slug']
  moduleDefinition: AlgorithmModuleDefinition
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  isPlaying: boolean
  activeSection?: StorySection
  insights: TeachingInsight[]
  emphasizedMetrics?: string[]
}>()

const emit = defineEmits<{
  'update-config': [key: string, value: ExperimentConfigValue]
  'patch-config': [config: Partial<ExperimentConfig>]
  'toggle-play': []
  step: []
  replay: []
  reset: []
  'apply-preset': [config: Partial<ExperimentConfig>]
}>()

const { t, locale } = useI18n()
const compactLayout = ref(false)
const openSection = ref('brief')

const orderedCategories = ['optimization', 'data', 'architecture', 'playback'] as const

const groupedControls = computed(() =>
  orderedCategories
    .map((category) => ({
      category,
      controls: props.moduleDefinition.controls.filter((control) => control.category === category),
    }))
    .filter((group) => group.controls.length > 0),
)

const currentGradientFunction = computed(() =>
  props.slug === 'gradient-descent' ? getGradientLossFunctionDefinition(String(props.config.lossFunction)) : undefined,
)

const recommendedGradientFunction = computed(() =>
  props.slug === 'gradient-descent' && props.activeSection?.recommendedFunctionId
    ? getGradientLossFunctionDefinition(props.activeSection.recommendedFunctionId)
    : undefined,
)

const linkedInsightIds = computed(() => props.activeSection?.linkedInsightIds ?? [])

const prioritizedInsights = computed(() => {
  const linkedIds = props.activeSection?.linkedInsightIds ?? []
  if (!linkedIds.length) return props.insights
  const priority = new Set(linkedIds)
  return [...props.insights].sort((left, right) => Number(priority.has(right.id)) - Number(priority.has(left.id)))
})

const activePreset = computed(() =>
  props.moduleDefinition.presets.find((preset) => preset.id === props.activeSection?.presetId),
)

const featuredInsights = computed(() => {
  const linked = prioritizedInsights.value.filter((insight) => linkedInsightIds.value.includes(insight.id))
  return linked.length ? linked : prioritizedInsights.value.slice(0, 2)
})

const supportingInsights = computed(() =>
  prioritizedInsights.value.filter((insight) => !featuredInsights.value.some((featured) => featured.id === insight.id)),
)

const featuredPreset = computed(() => activePreset.value ?? props.moduleDefinition.presets[0])
const secondaryPresets = computed(() =>
  props.moduleDefinition.presets.filter((preset) => preset.id !== featuredPreset.value?.id),
)

const focusLabelKeys = {
  point: 'focus.point',
  gradient: 'focus.gradient',
  trajectory: 'focus.trajectory',
  surface: 'focus.surface',
  contour: 'focus.contour',
  reference: 'focus.reference',
  boundary: 'focus.boundary',
  background: 'focus.background',
  hidden: 'focus.hidden',
} as const

const focusLabelKey = computed(() =>
  props.activeSection?.focusTarget ? focusLabelKeys[props.activeSection.focusTarget] : undefined,
)

const functionFormulaSource = computed(() => {
  if (!currentGradientFunction.value) return ''
  return `${localizedText(currentGradientFunction.value.description)}\n\n$$${currentGradientFunction.value.formula}$$`
})

const domainLabel = computed(() => {
  if (!currentGradientFunction.value) return ''
  const { xMin, xMax, yMin, yMax } = currentGradientFunction.value.domain
  return `x ∈ [${xMin}, ${xMax}], y ∈ [${yMin}, ${yMax}]`
})

function localizedText(copy?: { 'zh-CN': string; en: string }) {
  if (!copy) return ''
  return copy[locale.value as AppLocale]
}

function displayValue(key: string, value: ExperimentConfigValue, format?: string) {
  if (typeof value === 'string') {
    const option = props.moduleDefinition.controls
      .find((control) => control.key === key)
      ?.options?.find((entry) => entry.value === value)

    return option ? t(option.labelKey) : value
  }
  if (format === 'integer') return Math.round(Number(value)).toString()
  if (format === 'speed') return `${Math.round(Number(value))} ms`
  return Number(value).toFixed(Number(value) < 1 ? 2 : 1)
}

function onRangeInput(key: string, event: Event) {
  const target = event.target as HTMLInputElement
  emit('update-config', key, Number(target.value))
}

function onSelectInput(key: string, event: Event) {
  const target = event.target as HTMLSelectElement
  emit('update-config', key, target.value)
}

function onGradientFunctionChange(event: Event) {
  const target = event.target as HTMLSelectElement
  const nextFunction = getGradientLossFunctionDefinition(target.value)
  emit('patch-config', {
    lossFunction: nextFunction.id,
    startX: nextFunction.defaultStart.x,
    startY: nextFunction.defaultStart.y,
  })
}

function updateStartCoordinate(key: 'startX' | 'startY', value: number) {
  if (!currentGradientFunction.value) return
  const nextPoint = clampPointToLossDomain(currentGradientFunction.value, {
    x: key === 'startX' ? value : Number(props.config.startX),
    y: key === 'startY' ? value : Number(props.config.startY),
  })
  if (nextPoint.x === Number(props.config.startX) && nextPoint.y === Number(props.config.startY)) return
  emit('patch-config', { startX: nextPoint.x, startY: nextPoint.y })
}

function onCoordinateInput(key: 'startX' | 'startY', event: Event) {
  const target = event.target as HTMLInputElement
  updateStartCoordinate(key, Number(target.value))
}

function syncCompactLayout() {
  compactLayout.value = window.innerWidth <= 720
  if (!compactLayout.value) {
    openSection.value = 'brief'
  } else if (!openSection.value) {
    openSection.value = 'brief'
  }
}

function isSectionOpen(id: string) {
  return !compactLayout.value || openSection.value === id
}

function toggleSection(id: string) {
  if (!compactLayout.value) return
  openSection.value = openSection.value === id ? '' : id
}

onMounted(() => {
  syncCompactLayout()
  window.addEventListener('resize', syncCompactLayout, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', syncCompactLayout)
})
</script>

<template>
  <section class="dashboard">
    <section class="panel dashboard__brief">
      <div class="panel__heading">
        <span>{{ t('common.readingGuide') }}</span>
        <strong>{{ activeSection ? t(activeSection.titleKey) : t(moduleDefinition.titleKey) }}</strong>
        <button type="button" class="panel__toggle" @click="toggleSection('brief')">
          {{ isSectionOpen('brief') ? t('actions.collapse') : t('actions.expand') }}
        </button>
      </div>

      <div v-show="isSectionOpen('brief')" class="dashboard-brief">
        <div class="dashboard-brief__copy">
          <div class="reading-meta">
            <span class="reading-chip">{{ t('common.chapter') }}</span>
            <span v-if="focusLabelKey" class="reading-chip">{{ t(focusLabelKey) }}</span>
            <span v-if="featuredPreset" class="reading-chip reading-chip--accent">
              {{ localizedText(featuredPreset.label) }}
            </span>
          </div>
          <p>{{ localizedText(activeSection?.callout) }}</p>
        </div>

        <div v-if="localizedText(activeSection?.experimentPrompt)" class="dashboard-brief__prompt guide-prompt">
          {{ localizedText(activeSection?.experimentPrompt) }}
        </div>
      </div>
    </section>

    <section v-if="slug === 'gradient-descent' && currentGradientFunction" class="panel dashboard__gradient-meta">
      <div class="panel__heading">
        <span>{{ t('common.lossFunction') }}</span>
        <strong>{{ localizedText(currentGradientFunction.label) }}</strong>
        <button type="button" class="panel__toggle" @click="toggleSection('function')">
          {{ isSectionOpen('function') ? t('actions.collapse') : t('actions.expand') }}
        </button>
      </div>

      <div v-show="isSectionOpen('function')" class="function-panel">
        <label class="control">
          <span class="control__row">
            <span>{{ t('common.currentFunction') }}</span>
            <strong>{{ localizedText(currentGradientFunction.label) }}</strong>
          </span>
          <select class="control__select" :value="currentGradientFunction.id" @change="onGradientFunctionChange">
            <option
              v-for="definition in gradientLossFunctions"
              :key="definition.id"
              :value="definition.id"
            >
              {{ localizedText(definition.label) }}
            </option>
          </select>
        </label>

        <div class="function-panel__formula">
          <MarkdownMathContent :source="functionFormulaSource" />
        </div>

        <div class="function-panel__meta">
          <article class="function-panel__meta-card">
            <span>{{ t('common.domainRange') }}</span>
            <strong>{{ domainLabel }}</strong>
          </article>
          <article class="function-panel__meta-card">
            <span>{{ t('common.recommendedFunction') }}</span>
            <strong>{{ recommendedGradientFunction ? localizedText(recommendedGradientFunction.label) : localizedText(currentGradientFunction.label) }}</strong>
          </article>
        </div>

        <div class="reading-meta">
          <span v-for="trait in currentGradientFunction.traits" :key="localizedText(trait)" class="reading-chip">
            {{ localizedText(trait) }}
          </span>
        </div>
      </div>
    </section>

    <section v-if="slug === 'gradient-descent' && currentGradientFunction" class="panel dashboard__start-point">
      <div class="panel__heading">
        <span>{{ t('common.startPoint') }}</span>
        <strong>{{ t('common.coordinateInput') }}</strong>
        <button type="button" class="panel__toggle" @click="toggleSection('start-point')">
          {{ isSectionOpen('start-point') ? t('actions.collapse') : t('actions.expand') }}
        </button>
      </div>

      <div v-show="isSectionOpen('start-point')" class="start-point-panel">
        <p class="start-point-panel__hint">{{ t('common.dragHint') }}</p>

        <div class="control-group__grid">
          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.startX') }}</span>
              <strong>{{ displayValue('startX', config.startX, 'number') }}</strong>
            </span>
            <input
              class="control__number"
              type="number"
              :min="currentGradientFunction.domain.xMin"
              :max="currentGradientFunction.domain.xMax"
              step="0.1"
              :value="Number(config.startX)"
              @change="onCoordinateInput('startX', $event)"
            />
            <input
              class="control__range"
              type="range"
              :min="currentGradientFunction.domain.xMin"
              :max="currentGradientFunction.domain.xMax"
              step="0.1"
              :value="Number(config.startX)"
              @input="onCoordinateInput('startX', $event)"
            />
          </label>

          <label class="control">
            <span class="control__row">
              <span>{{ t('controls.startY') }}</span>
              <strong>{{ displayValue('startY', config.startY, 'number') }}</strong>
            </span>
            <input
              class="control__number"
              type="number"
              :min="currentGradientFunction.domain.yMin"
              :max="currentGradientFunction.domain.yMax"
              step="0.1"
              :value="Number(config.startY)"
              @change="onCoordinateInput('startY', $event)"
            />
            <input
              class="control__range"
              type="range"
              :min="currentGradientFunction.domain.yMin"
              :max="currentGradientFunction.domain.yMax"
              step="0.1"
              :value="Number(config.startY)"
              @input="onCoordinateInput('startY', $event)"
            />
          </label>
        </div>

        <div class="guide-prompt">
          {{ t('common.domainRange') }}: {{ domainLabel }}
        </div>
      </div>
    </section>

    <section class="panel dashboard__metrics">
      <div class="panel__heading">
        <span>{{ t('common.liveMetrics') }}</span>
        <strong>{{ t('common.currentState') }}</strong>
        <button type="button" class="panel__toggle" @click="toggleSection('metrics')">
          {{ isSectionOpen('metrics') ? t('actions.collapse') : t('actions.expand') }}
        </button>
      </div>
      <MetricsPanel v-show="isSectionOpen('metrics')" :slug="slug" :snapshot="snapshot" :emphasized-metrics="emphasizedMetrics" />
    </section>

    <section class="panel dashboard__reading">
      <div class="panel__heading">
        <span>{{ t('common.observations') }}</span>
        <strong>{{ t('common.modelSignal') }}</strong>
        <button type="button" class="panel__toggle" @click="toggleSection('signals')">
          {{ isSectionOpen('signals') ? t('actions.collapse') : t('actions.expand') }}
        </button>
      </div>

      <div v-show="isSectionOpen('signals')" class="insight-clusters">
        <div class="insight-cluster">
          <span class="insight-cluster__label">{{ t('common.prioritySignals') }}</span>
          <div class="insight-grid">
            <article
              v-for="insight in featuredInsights"
              :key="insight.id"
              class="insight-card"
              :class="[
                `insight-card--${insight.tone}`,
                { 'is-linked': activeSection?.linkedInsightIds?.includes(insight.id) },
              ]"
            >
              <span>{{ t(insight.titleKey) }}</span>
              <p>{{ t(insight.bodyKey) }}</p>
            </article>
          </div>
        </div>

        <div v-if="supportingInsights.length" class="insight-cluster insight-cluster--secondary">
          <span class="insight-cluster__label">{{ t('common.supportingSignals') }}</span>
          <div class="insight-grid">
            <article
              v-for="insight in supportingInsights"
              :key="insight.id"
              class="insight-card"
              :class="`insight-card--${insight.tone}`"
            >
              <span>{{ t(insight.titleKey) }}</span>
              <p>{{ t(insight.bodyKey) }}</p>
            </article>
          </div>
        </div>
      </div>
    </section>

    <section class="panel dashboard__presets">
      <div class="panel__heading">
        <span>{{ t('common.tryThis') }}</span>
        <strong>{{ t('common.presets') }}</strong>
        <button type="button" class="panel__toggle" @click="toggleSection('presets')">
          {{ isSectionOpen('presets') ? t('actions.collapse') : t('actions.expand') }}
        </button>
      </div>

      <div v-show="isSectionOpen('presets')">
        <button
          v-if="featuredPreset"
          type="button"
          class="preset-card preset-card--featured"
          :class="{ 'is-linked': activeSection?.presetId === featuredPreset.id }"
          @click="emit('apply-preset', featuredPreset.config)"
        >
          <strong>{{ localizedText(featuredPreset.label) }}</strong>
          <p>{{ localizedText(featuredPreset.description) }}</p>
          <span>{{ t('actions.applyPreset') }}</span>
        </button>

        <div class="preset-list preset-list--compact">
          <button
            v-for="preset in secondaryPresets"
            :key="preset.id"
            type="button"
            class="preset-card"
            :class="{ 'is-linked': activeSection?.presetId === preset.id }"
            @click="emit('apply-preset', preset.config)"
          >
            <strong>{{ localizedText(preset.label) }}</strong>
            <p>{{ localizedText(preset.description) }}</p>
            <span>{{ t('actions.applyPreset') }}</span>
          </button>
        </div>
      </div>
    </section>

    <section class="panel dashboard__controls">
      <div class="panel__heading">
        <span>{{ t('common.tuning') }}</span>
        <strong>{{ t('common.playground') }}</strong>
        <button type="button" class="panel__toggle" @click="toggleSection('controls')">
          {{ isSectionOpen('controls') ? t('actions.collapse') : t('actions.expand') }}
        </button>
      </div>

      <div v-show="isSectionOpen('controls')" class="dashboard-controls">
        <section
          v-for="group in groupedControls"
          :key="group.category"
          class="control-group"
        >
          <header>{{ t(`controls.categories.${group.category}`) }}</header>

          <div class="control-group__grid">
            <label
              v-for="control in group.controls"
              :key="control.key"
              class="control"
            >
              <span class="control__row">
                <span>{{ t(control.labelKey) }}</span>
                <strong>{{ displayValue(control.key, config[control.key], control.format) }}</strong>
              </span>

              <input
                v-if="control.type === 'range'"
                class="control__range"
                type="range"
                :min="control.min"
                :max="control.max"
                :step="control.step"
                :value="Number(config[control.key])"
                @input="onRangeInput(control.key, $event)"
              />

              <select
                v-else
                class="control__select"
                :value="String(config[control.key])"
                @change="onSelectInput(control.key, $event)"
              >
                <option
                  v-for="option in control.options"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ t(option.labelKey) }}
                </option>
              </select>
            </label>
          </div>
        </section>
        <div class="controls-panel__actions">
          <button type="button" class="action-button action-button--primary" @click="emit('toggle-play')">
            {{ isPlaying ? t('actions.pause') : t('actions.play') }}
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
      </div>
    </section>
  </section>
</template>
