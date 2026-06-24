<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import InteractivePlane from '../components/interactive/InteractivePlane.vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import {
  evaluateOptimizerRace,
  optimizerLoss,
  optimizerRacePresets,
  type OptimizerKind,
  type OptimizerPresetId,
} from '../utils/optimizers'
import { clamp, round, type Vector2 } from '../utils/math'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()

const markerPrefix = useId()
const markerIds = {
  sgd: `${markerPrefix}-sgd-arrow`,
  momentum: `${markerPrefix}-momentum-arrow`,
  rmsprop: `${markerPrefix}-rmsprop-arrow`,
  adam: `${markerPrefix}-adam-arrow`,
}
const optimizerColors: Record<OptimizerKind, string> = {
  sgd: '#3868ff',
  momentum: '#0f9f7a',
  rmsprop: '#d65a31',
  adam: '#7c3aed',
}
const optimizerLabels: Record<OptimizerKind, string> = {
  sgd: 'SGD',
  momentum: 'Momentum',
  rmsprop: 'RMSProp',
  adam: 'Adam',
}

const presetId = ref<OptimizerPresetId>('narrow-ravine')
const learningRate = ref(0.08)
const steps = ref(16)
const momentumBeta = ref(0.85)
const beta2 = ref(0.95)
const epsilon = ref(1e-8)
const start = ref<Vector2>({ x: 2.4, y: -1.6 })

const preset = computed(() => optimizerRacePresets.find((item) => item.id === presetId.value) ?? optimizerRacePresets[0]!)
const currentLocale = computed(() => props.locale)
const evaluation = computed(() =>
  evaluateOptimizerRace({
    preset: presetId.value,
    start: start.value,
    learningRate: learningRate.value,
    steps: steps.value,
    momentumBeta: momentumBeta.value,
    beta2: beta2.value,
    epsilon: epsilon.value,
  }),
)
const runsForDisplay = computed(() => evaluation.value.optimizerOrder.map((kind) => evaluation.value.runs[kind]))
const maxLoss = computed(() => Math.max(1, ...runsForDisplay.value.flatMap((run) => run.losses)))

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '优化器赛道',
        subtitle: '在同一个二次 loss 上比较 SGD、Momentum、RMSProp 和 Adam 的路径与状态。',
        aria: '优化器路径比较实验',
        preset: 'loss 形状',
        learningRate: '学习率',
        steps: '步数',
        beta1: 'Momentum / Adam β1',
        beta2: 'RMSProp / Adam β2',
        startX: '起点 x',
        startY: '起点 y',
        reset: '重置起点',
        finalLoss: '最终 loss',
        state: '状态',
        note: 'Momentum 累积速度，RMSProp 累积平方梯度，Adam 同时做一阶与二阶矩的偏差校正。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Optimizer Race',
        subtitle: 'Compare SGD, Momentum, RMSProp, and Adam on the same quadratic loss.',
        aria: 'Optimizer trajectory comparison lab',
        preset: 'loss shape',
        learningRate: 'learning rate',
        steps: 'steps',
        beta1: 'Momentum / Adam beta1',
        beta2: 'RMSProp / Adam beta2',
        startX: 'start x',
        startY: 'start y',
        reset: 'reset start',
        finalLoss: 'final loss',
        state: 'state',
        note: 'Momentum accumulates velocity, RMSProp accumulates squared gradients, and Adam combines first and second moments with bias correction.',
      },
)

watch(presetId, () => {
  start.value = { ...preset.value.start }
})

function setStart(axis: 'x' | 'y', value: number) {
  if (!Number.isFinite(value)) return
  start.value = {
    ...start.value,
    [axis]: round(clamp(value, -3, 3), 2),
  }
}

function resetStart() {
  start.value = { ...preset.value.start }
}

function format(value: number, digits = 3) {
  return round(value, digits).toFixed(digits)
}

function formatVector(vector: Vector2) {
  return `(${format(vector.x, 2)}, ${format(vector.y, 2)})`
}

function pathPoints(path: Vector2[], toSvg: (point: Vector2) => { x: number; y: number }) {
  return path.map((point) => `${toSvg(point).x},${toSvg(point).y}`).join(' ')
}

function contourPoints(level: number, toSvg: (point: Vector2) => { x: number; y: number }) {
  return Array.from({ length: 96 }, (_, index) => {
    const theta = (Math.PI * 2 * index) / 96
    const direction = { x: Math.cos(theta), y: Math.sin(theta) }
    const directionLoss = Math.max(optimizerLoss(direction, preset.value), 1e-8)
    const radius = Math.sqrt(level / directionLoss)
    const point = { x: direction.x * radius, y: direction.y * radius }
    const svgPoint = toSvg(point)
    return `${svgPoint.x},${svgPoint.y}`
  }).join(' ')
}

function lossChartPoints(losses: number[]) {
  return losses.map((loss, index) => {
    const x = 12 + (index / Math.max(1, losses.length - 1)) * 136
    const y = 82 - (loss / maxLoss.value) * 70
    return `${x.toFixed(1)},${y.toFixed(1)}`
  }).join(' ')
}

function stateSummary(kind: OptimizerKind) {
  if (kind === 'sgd') return `g=${formatVector(evaluation.value.runs.sgd.state.currentGradient)}`
  if (kind === 'momentum') return `v=${formatVector(evaluation.value.runs.momentum.state.velocity)}`
  if (kind === 'rmsprop') return `s=${formatVector(evaluation.value.runs.rmsprop.state.squareAverage)}`
  const adam = evaluation.value.runs.adam.state
  return `m=${formatVector(adam.firstMoment)}, v=${formatVector(adam.secondMoment)}, t=${adam.biasCorrection.t}`
}

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'calculus-optimizer-comparison',
  sourceId: 'optimizer-race-lab',
  summary: {
    'zh-CN': '同一个 loss 上四种优化器的路径和内部状态不同。',
    en: 'The four optimizers take different paths and carry different state on the same loss.',
  },
  metrics: [
    { label: { 'zh-CN': 'SGD 最终 loss', en: 'SGD final loss' }, value: format(evaluation.value.runs.sgd.finalLoss) },
    { label: { 'zh-CN': 'Momentum 最终 loss', en: 'Momentum final loss' }, value: format(evaluation.value.runs.momentum.finalLoss) },
    { label: { 'zh-CN': 'RMSProp 最终 loss', en: 'RMSProp final loss' }, value: format(evaluation.value.runs.rmsprop.finalLoss) },
    { label: { 'zh-CN': 'Adam 最终 loss', en: 'Adam final loss' }, value: format(evaluation.value.runs.adam.finalLoss) },
    { label: { 'zh-CN': 'Adam 状态', en: 'Adam state' }, value: stateSummary('adam') },
  ],
  prompt: {
    'zh-CN': '比较四条路径，解释 Adam 为什么不只是“学习率更大”的 SGD。',
    en: 'Compare the four paths and explain why Adam is not just SGD with a larger learning rate.',
  },
}))

watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)
</script>

<template>
  <section class="math-lab-card optimizer-race-lab">
    <div class="math-lab-card__visual optimizer-race-lab__visual">
      <InteractivePlane
        v-slot="{ toSvg }"
        :label="copy.aria"
        :width="420"
        :height="320"
        :x-min="-3"
        :x-max="3"
        :y-min="-3"
        :y-max="3"
      >
        <defs>
          <marker
            v-for="kind in evaluation.optimizerOrder"
            :id="markerIds[kind]"
            :key="kind"
            markerWidth="10"
            markerHeight="10"
            refX="8"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L9,3 z" :fill="optimizerColors[kind]" />
          </marker>
        </defs>

        <g class="optimizer-race-lab__contours" aria-hidden="true">
          <polyline
            v-for="level in [0.9, 2.1, 4.2, 7.5, 12]"
            :key="level"
            :points="contourPoints(level, toSvg)"
          />
        </g>

        <g
          v-for="run in runsForDisplay"
          :key="run.kind"
          class="optimizer-race-lab__run"
        >
          <polyline
            :points="pathPoints(run.path, toSvg)"
            :style="{ stroke: optimizerColors[run.kind] }"
            :marker-end="`url(#${markerIds[run.kind]})`"
          />
          <circle
            v-for="(point, index) in run.path"
            :key="`${run.kind}-${index}`"
            :cx="toSvg(point).x"
            :cy="toSvg(point).y"
            :r="index === 0 ? 5 : 3"
            :style="{ fill: optimizerColors[run.kind] }"
          />
        </g>
      </InteractivePlane>
    </div>

    <div class="math-lab-card__controls optimizer-race-lab__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls">
        <label>
          {{ copy.preset }}
          <select v-model="presetId">
            <option v-for="item in optimizerRacePresets" :key="item.id" :value="item.id">
              {{ item.label[currentLocale] }}
            </option>
          </select>
        </label>
        <label>
          {{ copy.learningRate }}: {{ learningRate.toFixed(3) }}
          <input v-model.number="learningRate" type="range" min="0.01" max="0.18" step="0.005" />
        </label>
        <label>
          {{ copy.steps }}: {{ steps }}
          <input v-model.number="steps" type="range" min="1" max="36" step="1" />
        </label>
        <label>
          {{ copy.beta1 }}: {{ momentumBeta.toFixed(2) }}
          <input v-model.number="momentumBeta" type="range" min="0" max="0.95" step="0.01" />
        </label>
        <label>
          {{ copy.beta2 }}: {{ beta2.toFixed(2) }}
          <input v-model.number="beta2" type="range" min="0" max="0.99" step="0.01" />
        </label>
        <label>
          {{ copy.startX }}: {{ start.x.toFixed(2) }}
          <input :value="start.x" type="range" min="-3" max="3" step="0.05" @input="setStart('x', Number(($event.target as HTMLInputElement).value))" />
        </label>
        <label>
          {{ copy.startY }}: {{ start.y.toFixed(2) }}
          <input :value="start.y" type="range" min="-3" max="3" step="0.05" @input="setStart('y', Number(($event.target as HTMLInputElement).value))" />
        </label>
      </div>

      <button type="button" class="action-button" @click="resetStart">{{ copy.reset }}</button>

      <div class="optimizer-race-lab__legend">
        <article v-for="run in runsForDisplay" :key="run.kind">
          <span :style="{ background: optimizerColors[run.kind] }"></span>
          <strong>{{ optimizerLabels[run.kind] }}</strong>
          <small>{{ copy.finalLoss }} {{ format(run.finalLoss) }}</small>
        </article>
      </div>

      <div class="optimizer-race-lab__charts">
        <figure v-for="run in runsForDisplay" :key="`${run.kind}-chart`">
          <span>{{ optimizerLabels[run.kind] }}</span>
          <svg viewBox="0 0 160 96" role="img" :aria-label="`${optimizerLabels[run.kind]} loss`">
            <line x1="12" y1="82" x2="150" y2="82" />
            <polyline :points="lossChartPoints(run.losses)" :style="{ stroke: optimizerColors[run.kind] }" />
          </svg>
          <small>{{ copy.state }}: {{ stateSummary(run.kind) }}</small>
        </figure>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.optimizer-race-lab__contours polyline {
  fill: none;
  stroke: rgba(16, 22, 47, 0.13);
  stroke-width: 2;
}

.optimizer-race-lab__run polyline {
  fill: none;
  stroke-width: 3.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.optimizer-race-lab__run circle {
  stroke: white;
  stroke-width: 1.5;
}

.optimizer-race-lab__legend {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.optimizer-race-lab__legend article {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 4px 8px;
  align-items: center;
  padding: 10px;
  border: 1px solid rgba(15, 23, 40, 0.08);
  border-radius: 8px;
  background: #ffffff;
}

.optimizer-race-lab__legend span {
  width: 12px;
  height: 12px;
  border-radius: 999px;
}

.optimizer-race-lab__legend small {
  grid-column: 2;
  color: var(--muted);
}

.optimizer-race-lab__charts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.optimizer-race-lab__charts figure {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 10px;
  border: 1px solid rgba(15, 23, 40, 0.1);
  border-radius: 8px;
  background: #ffffff;
}

.optimizer-race-lab__charts span,
.optimizer-race-lab__charts small {
  color: var(--muted);
  font-size: 0.82rem;
}

.optimizer-race-lab__charts line {
  stroke: rgba(16, 22, 47, 0.24);
  stroke-width: 2;
}

.optimizer-race-lab__charts polyline {
  fill: none;
  stroke-width: 3;
}

@media (max-width: 720px) {
  .optimizer-race-lab__legend,
  .optimizer-race-lab__charts {
    grid-template-columns: 1fr;
  }
}
</style>
