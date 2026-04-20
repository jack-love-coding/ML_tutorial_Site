<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, ExperimentConfig, StorySection, TrainingSnapshot } from '../types/ml'
import GradientDescentViz from './GradientDescentViz.vue'
import MarkdownMathContent from './MarkdownMathContent.vue'
import {
  clampPointToLossDomain,
  getGradientLossFunctionDefinition,
  gradientLossFunctions,
} from '../simulations/gradientLossFunctions'
import { round } from '../utils/math'

const props = defineProps<{
  config: ExperimentConfig
  snapshot?: TrainingSnapshot
  accent: string
  activeSection?: StorySection
}>()

const emit = defineEmits<{
  'patch-config': [config: Partial<ExperimentConfig>]
  'update-start-point': [point: { startX: number; startY: number }]
}>()

const { locale } = useI18n()

const copy = computed(() =>
  locale.value === 'zh-CN'
    ? {
        posterLab: '开场实验室',
        posterTitle: '先把“损失地形”看成一张可操作的地图',
        posterLead:
          '这里先不追求把所有参数都调完，而是先建立直觉：换地形、换起点，优化路径为什么会马上变样。',
        posterHint:
          '后续章节继续向下滚动时，右侧实验侧栏会保持同步。这里的大实验区只负责建立第一眼直觉。',
        functionSwitcher: '损失函数库',
        overview: '当前地形',
        terrainSignals: '地形信号',
        startPoint: '起点入口',
        startPointHint: '拖拽等高线里的点，或者直接输入坐标。',
        keepReading: '继续阅读时如何使用实验侧栏',
        keepReadingBody:
          '第一章先用大视图建立地形直觉。读到后面的梯度、学习率、鞍点和 batch 噪声章节时，持续调参请直接用右侧紧凑实验侧栏。',
        domain: '定义域',
        recommendedRate: '推荐学习率',
      }
    : {
        posterLab: 'Poster lab',
        posterTitle: 'Treat the loss landscape as a manipulable map first',
        posterLead:
          'The goal here is not to tune every control. It is to build the first visual intuition: change the terrain, change the start, and the path changes immediately.',
        posterHint:
          'The sticky rail stays synced while you keep reading. This larger lab only establishes the first visual intuition.',
        functionSwitcher: 'Loss library',
        overview: 'Current terrain',
        terrainSignals: 'Terrain signals',
        startPoint: 'Start-point access',
        startPointHint: 'Drag the point in the contour map or enter coordinates directly.',
        keepReading: 'How to use the sticky rail next',
        keepReadingBody:
          'Use the large view here to build terrain intuition first. In later chapters, keep experimenting from the compact sticky rail while you read about gradients, learning rates, saddles, and noise.',
        domain: 'Domain',
        recommendedRate: 'Recommended rate',
      },
)

function localizedText(entry?: { 'zh-CN': string; en: string }) {
  if (!entry) return ''
  return entry[locale.value as AppLocale]
}

const currentFunction = computed(() =>
  getGradientLossFunctionDefinition(String(props.config.lossFunction)),
)

const recommendedFunction = computed(() =>
  props.activeSection?.recommendedFunctionId
    ? getGradientLossFunctionDefinition(props.activeSection.recommendedFunctionId)
    : currentFunction.value,
)

const functionFormula = computed(() =>
  `${localizedText(currentFunction.value.description)}\n\n$$${currentFunction.value.formula}$$`,
)

const domainLabel = computed(() => {
  const { xMin, xMax, yMin, yMax } = currentFunction.value.domain
  return `x ∈ [${xMin}, ${xMax}], y ∈ [${yMin}, ${yMax}]`
})

function onFunctionChange(functionId: string) {
  const nextFunction = getGradientLossFunctionDefinition(functionId)
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
</script>

<template>
  <section class="embedded-loss-lab embedded-loss-lab--poster">
    <div class="embedded-loss-lab__story">
      <div class="embedded-loss-lab__lead">
        <span class="story-chip">{{ copy.posterLab }}</span>
        <strong class="embedded-loss-lab__headline">{{ copy.posterTitle }}</strong>
        <p>{{ copy.posterLead }}</p>
      </div>
      <div class="guide-prompt">
        {{ copy.posterHint }}
      </div>
    </div>

    <div class="embedded-loss-lab__switcher">
      <div class="embedded-loss-lab__heading">
        <span>{{ copy.functionSwitcher }}</span>
        <strong>{{ localizedText(currentFunction.label) }}</strong>
      </div>

      <div class="loss-function-switcher">
        <button
          v-for="definition in gradientLossFunctions"
          :key="definition.id"
          type="button"
          class="loss-function-card"
          :class="{
            'is-active': definition.id === currentFunction.id,
            'is-recommended': definition.id === recommendedFunction.id,
          }"
          @click="onFunctionChange(definition.id)"
        >
          <div class="loss-function-card__meta">
            <strong>{{ localizedText(definition.label) }}</strong>
            <span>{{ localizedText(definition.teachingGoal) }}</span>
          </div>
          <div class="loss-function-card__chips">
            <span
              v-for="trait in definition.traits.slice(0, 2)"
              :key="`${definition.id}-${localizedText(trait)}`"
              class="reading-chip"
            >
              {{ localizedText(trait) }}
            </span>
          </div>
        </button>
      </div>
    </div>

    <div class="embedded-loss-lab__overview">
      <article class="loss-overview-card">
        <span>{{ copy.overview }}</span>
        <strong>{{ localizedText(currentFunction.label) }}</strong>
        <MarkdownMathContent :source="functionFormula" />
      </article>

      <article class="loss-overview-card">
        <span>{{ copy.terrainSignals }}</span>
        <p>{{ localizedText(currentFunction.teachingGoal) }}</p>
        <div class="reading-meta">
          <span
            v-for="trait in currentFunction.traits"
            :key="localizedText(trait)"
            class="reading-chip"
          >
            {{ localizedText(trait) }}
          </span>
        </div>
        <div class="loss-overview-card__meta">
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

    <div class="embedded-loss-lab__visuals">
      <GradientDescentViz
        :snapshot="snapshot"
        :config="config"
        :accent="accent"
        :focus-target="activeSection?.focusTarget"
        layout="split"
        @update-start-point="emit('update-start-point', $event)"
      />
    </div>

    <div class="embedded-loss-lab__controls embedded-loss-lab__controls--poster">
      <section class="loss-lab-panel">
        <div class="embedded-loss-lab__heading">
          <span>{{ copy.startPoint }}</span>
          <strong>{{ localizedText(currentFunction.label) }}</strong>
        </div>
        <p class="loss-lab-panel__hint">{{ copy.startPointHint }}</p>
        <div class="control-group__grid">
          <label class="control">
            <span class="control__row">
              <span>x</span>
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
              <span>y</span>
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

      <section class="loss-lab-panel">
        <div class="embedded-loss-lab__heading">
          <span>{{ copy.keepReading }}</span>
          <strong>{{ localizedText(props.activeSection?.callout) }}</strong>
        </div>
        <p>{{ copy.keepReadingBody }}</p>
        <div v-if="localizedText(props.activeSection?.experimentPrompt)" class="guide-prompt">
          {{ localizedText(props.activeSection?.experimentPrompt) }}
        </div>
      </section>
    </div>
  </section>
</template>
