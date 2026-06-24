<script setup lang="ts">
import * as d3 from 'd3'
import { computed, ref, useId, watch } from 'vue'
import InteractivePlane from '../components/interactive/InteractivePlane.vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import { evaluateBatchGradientNoise } from '../utils/stochasticGradients'
import { clamp, norm, round, type Vector2 } from '../utils/math'

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
  full: `${markerPrefix}-full-gradient-arrow`,
  batch: `${markerPrefix}-batch-gradient-arrow`,
}

const datasetSize = ref(32)
const batchSize = ref(4)
const seed = ref(17)
const learningRate = ref(0.08)
const includeOutlier = ref(true)
const shuffle = ref(true)
const theta = ref<Vector2>({ x: 0.25, y: -0.2 })

const effectiveBatchSize = computed(() => Math.min(batchSize.value, datasetSize.value))
const evaluation = computed(() =>
  evaluateBatchGradientNoise({
    datasetSize: datasetSize.value,
    batchSize: effectiveBatchSize.value,
    seed: seed.value,
    learningRate: learningRate.value,
    includeOutlier: includeOutlier.value,
    shuffle: shuffle.value,
    theta: theta.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: 'Mini-batch 梯度噪声',
        subtitle: '同一组参数下比较全数据梯度和当前 batch 梯度。',
        aria: 'Mini-batch 梯度噪声互动实验',
        datasetSize: '数据集大小',
        batchSize: 'batch size',
        seed: '随机种子',
        learningRate: '学习率',
        outlier: '包含异常样本',
        shuffle: '每次抽样打乱',
        reset: '重置',
        presets: 'batch preset',
        fullGradient: '全数据梯度',
        batchGradient: '当前 batch 梯度',
        gradientError: '梯度误差',
        directionAngle: '方向夹角',
        nextTheta: '下一步参数',
        distribution: '多次抽样的 batch 梯度分布',
        note: 'batch 越小，单步方向越容易抖；但噪声来自抽样，不自动代表梯度公式错误。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Mini-Batch Gradient Noise',
        subtitle: 'Compare the full-data gradient and the current batch gradient at the same parameters.',
        aria: 'Interactive mini-batch gradient noise lab',
        datasetSize: 'dataset size',
        batchSize: 'batch size',
        seed: 'random seed',
        learningRate: 'learning rate',
        outlier: 'include outlier',
        shuffle: 'shuffle samples',
        reset: 'reset',
        presets: 'batch preset',
        fullGradient: 'full gradient',
        batchGradient: 'current batch gradient',
        gradientError: 'gradient error',
        directionAngle: 'direction angle',
        nextTheta: 'next theta',
        distribution: 'batch-gradient distribution across samples',
        note: 'Smaller batches make each step direction noisier; the noise comes from sampling and does not automatically mean the formula is wrong.',
      },
)

const gradientDistribution = computed(() => {
  const gradients = evaluation.value.gradientSamples
  const maxMagnitude = Math.max(1, ...gradients.flatMap((gradient) => [Math.abs(gradient.x), Math.abs(gradient.y)]))
  const xScale = d3.scaleLinear().domain([-maxMagnitude, maxMagnitude]).range([20, 220])
  const yScale = d3.scaleLinear().domain([-maxMagnitude, maxMagnitude]).range([140, 12])
  return gradients.map((gradient, index) => ({
    id: index,
    x: xScale(gradient.x),
    y: yScale(gradient.y),
  }))
})

function vectorEnd(origin: Vector2, gradient: Vector2, scale = 0.36): Vector2 {
  const length = norm(gradient)
  if (length === 0) return origin
  return {
    x: origin.x - (gradient.x / length) * scale,
    y: origin.y - (gradient.y / length) * scale,
  }
}

function setBatchPreset(value: number | 'full') {
  batchSize.value = value === 'full' ? datasetSize.value : Math.min(value, datasetSize.value)
}

function setTheta(axis: 'x' | 'y', value: number) {
  if (!Number.isFinite(value)) return
  theta.value = {
    ...theta.value,
    [axis]: round(clamp(value, -1.5, 2.5), 2),
  }
}

function resetLab() {
  datasetSize.value = 32
  batchSize.value = 4
  seed.value = 17
  learningRate.value = 0.08
  includeOutlier.value = true
  shuffle.value = true
  theta.value = { x: 0.25, y: -0.2 }
}

function format(value: number, digits = 3) {
  return round(value, digits).toFixed(digits)
}

function formatVector(vector: Vector2) {
  return `(${format(vector.x, 2)}, ${format(vector.y, 2)})`
}

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'calculus-sgd-batch-noise',
  sourceId: 'batch-gradient-noise-lab',
  summary: {
    'zh-CN': '当前实验比较了全数据梯度和 mini-batch 梯度。',
    en: 'The experiment compares the full-data gradient with a mini-batch gradient.',
  },
  metrics: [
    { label: { 'zh-CN': 'batch size', en: 'batch size' }, value: effectiveBatchSize.value },
    { label: { 'zh-CN': '随机种子', en: 'seed' }, value: seed.value },
    { label: { 'zh-CN': '梯度误差', en: 'gradient error' }, value: format(evaluation.value.gradientError) },
    {
      label: { 'zh-CN': '方向夹角', en: 'direction angle' },
      value: format(evaluation.value.gradientAngle, 1),
      unit: { 'zh-CN': '度', en: 'degrees' },
    },
    { label: { 'zh-CN': '全数据梯度', en: 'full gradient' }, value: formatVector(evaluation.value.fullGradient) },
    { label: { 'zh-CN': 'batch 梯度', en: 'batch gradient' }, value: formatVector(evaluation.value.batchGradient) },
  ],
  prompt: {
    'zh-CN': '解释 batch size 增大时梯度估计为什么更稳定。',
    en: 'Explain why the gradient estimate becomes more stable as batch size grows.',
  },
}))

watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)
</script>

<template>
  <section class="math-lab-card batch-gradient-noise-lab">
    <div class="math-lab-card__visual batch-gradient-noise-lab__visual">
      <InteractivePlane
        v-slot="{ toSvg }"
        :label="copy.aria"
        :width="420"
        :height="300"
        :x-min="-1.5"
        :x-max="2.5"
        :y-min="-1.5"
        :y-max="1.8"
      >
        <defs>
          <marker :id="markerIds.full" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#3868ff" />
          </marker>
          <marker :id="markerIds.batch" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#d65a31" />
          </marker>
        </defs>

        <polyline
          :points="evaluation.path.map((point) => `${toSvg(point).x},${toSvg(point).y}`).join(' ')"
          class="batch-gradient-noise-lab__path"
        />
        <circle
          v-for="(pathPoint, index) in evaluation.path"
          :key="index"
          :cx="toSvg(pathPoint).x"
          :cy="toSvg(pathPoint).y"
          :r="index === 0 ? 6 : 4"
          :class="['batch-gradient-noise-lab__path-point', { 'is-start': index === 0 }]"
        />
        <line
          :x1="toSvg(evaluation.theta).x"
          :y1="toSvg(evaluation.theta).y"
          :x2="toSvg(vectorEnd(evaluation.theta, evaluation.fullGradient)).x"
          :y2="toSvg(vectorEnd(evaluation.theta, evaluation.fullGradient)).y"
          class="batch-gradient-noise-lab__gradient batch-gradient-noise-lab__gradient--full"
          :marker-end="`url(#${markerIds.full})`"
        />
        <line
          :x1="toSvg(evaluation.theta).x"
          :y1="toSvg(evaluation.theta).y"
          :x2="toSvg(vectorEnd(evaluation.theta, evaluation.batchGradient)).x"
          :y2="toSvg(vectorEnd(evaluation.theta, evaluation.batchGradient)).y"
          class="batch-gradient-noise-lab__gradient batch-gradient-noise-lab__gradient--batch"
          :marker-end="`url(#${markerIds.batch})`"
        />
      </InteractivePlane>

      <figure class="batch-gradient-noise-lab__distribution">
        <span>{{ copy.distribution }}</span>
        <svg viewBox="0 0 240 154" role="img" :aria-label="copy.distribution">
          <line x1="20" y1="76" x2="220" y2="76" />
          <line x1="120" y1="12" x2="120" y2="140" />
          <circle
            v-for="sample in gradientDistribution"
            :key="sample.id"
            :cx="sample.x"
            :cy="sample.y"
            r="4"
          />
        </svg>
      </figure>
    </div>

    <div class="math-lab-card__controls batch-gradient-noise-lab__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="batch-gradient-noise-lab__preset-row" :aria-label="copy.presets">
        <button type="button" class="action-button" @click="setBatchPreset(1)">1</button>
        <button type="button" class="action-button" @click="setBatchPreset(4)">4</button>
        <button type="button" class="action-button" @click="setBatchPreset(16)">16</button>
        <button type="button" class="action-button" @click="setBatchPreset('full')">full</button>
      </div>

      <div class="math-mini-controls">
        <label>
          {{ copy.datasetSize }}: {{ datasetSize }}
          <input v-model.number="datasetSize" type="range" min="8" max="80" step="4" />
        </label>
        <label>
          {{ copy.batchSize }}: {{ effectiveBatchSize }}
          <input v-model.number="batchSize" type="range" min="1" :max="datasetSize" step="1" />
        </label>
        <label>
          {{ copy.seed }}: {{ seed }}
          <input v-model.number="seed" type="range" min="1" max="99" step="1" />
        </label>
        <label>
          {{ copy.learningRate }}: {{ learningRate.toFixed(3) }}
          <input v-model.number="learningRate" type="range" min="0.005" max="0.18" step="0.005" />
        </label>
        <label>
          θ₁: {{ theta.x.toFixed(2) }}
          <input :value="theta.x" type="range" min="-1.5" max="2.5" step="0.05" @input="setTheta('x', Number(($event.target as HTMLInputElement).value))" />
        </label>
        <label>
          θ₀: {{ theta.y.toFixed(2) }}
          <input :value="theta.y" type="range" min="-1.5" max="1.8" step="0.05" @input="setTheta('y', Number(($event.target as HTMLInputElement).value))" />
        </label>
        <label class="batch-gradient-noise-lab__checkbox">
          <input v-model="includeOutlier" type="checkbox" />
          <span>{{ copy.outlier }}</span>
        </label>
        <label class="batch-gradient-noise-lab__checkbox">
          <input v-model="shuffle" type="checkbox" />
          <span>{{ copy.shuffle }}</span>
        </label>
      </div>

      <button type="button" class="action-button" @click="resetLab">{{ copy.reset }}</button>

      <div class="math-readout-grid">
        <article><span>{{ copy.fullGradient }}</span><strong>{{ formatVector(evaluation.fullGradient) }}</strong></article>
        <article><span>{{ copy.batchGradient }}</span><strong>{{ formatVector(evaluation.batchGradient) }}</strong></article>
        <article><span>{{ copy.gradientError }}</span><strong>{{ format(evaluation.gradientError) }}</strong></article>
        <article><span>{{ copy.directionAngle }}</span><strong>{{ format(evaluation.gradientAngle, 1) }}°</strong></article>
        <article><span>{{ copy.nextTheta }}</span><strong>{{ formatVector(evaluation.nextTheta) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.batch-gradient-noise-lab__visual {
  display: grid;
  gap: 14px;
}

.batch-gradient-noise-lab__path {
  fill: none;
  stroke: rgba(15, 159, 122, 0.55);
  stroke-width: 3;
}

.batch-gradient-noise-lab__path-point {
  fill: #b6f2d2;
  stroke: #10162f;
  stroke-width: 1.5;
}

.batch-gradient-noise-lab__path-point.is-start {
  fill: #ffd84d;
}

.batch-gradient-noise-lab__gradient {
  stroke-width: 4;
  stroke-linecap: round;
}

.batch-gradient-noise-lab__gradient--full {
  stroke: #3868ff;
}

.batch-gradient-noise-lab__gradient--batch {
  stroke: #d65a31;
  stroke-dasharray: 7 5;
}

.batch-gradient-noise-lab__distribution {
  display: grid;
  gap: 8px;
  margin: 0;
  padding: 12px;
  border: 1px solid rgba(15, 23, 40, 0.12);
  border-radius: 8px;
  background: #ffffff;
}

.batch-gradient-noise-lab__distribution span {
  color: var(--muted);
  font-size: 0.84rem;
}

.batch-gradient-noise-lab__distribution line {
  stroke: rgba(16, 22, 47, 0.18);
  stroke-width: 2;
}

.batch-gradient-noise-lab__distribution circle {
  fill: #9ee6ff;
  stroke: #10162f;
  stroke-width: 1.5;
}

.batch-gradient-noise-lab__preset-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.batch-gradient-noise-lab__checkbox {
  display: flex;
  grid-template-columns: none;
  align-items: center;
  gap: 10px;
}

.batch-gradient-noise-lab__checkbox input {
  width: 18px;
  min-height: 18px;
}
</style>
