<script setup lang="ts">
import { computed, reactive, useId, watch } from 'vue'
import DraggableVector from '../components/interactive/DraggableVector.vue'
import InteractivePlane from '../components/interactive/InteractivePlane.vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import {
  evaluateEigenDirection,
} from '../utils/eigenDirections'
import type { EigenPowerMatrixKind } from '../utils/eigenPower'
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
  vector: `${markerPrefix}-eigen-vector-arrow`,
  image: `${markerPrefix}-eigen-image-arrow`,
}
const matrixOptions: Array<{
  id: EigenPowerMatrixKind
  label: {
    'zh-CN': string
    en: string
  }
}> = [
  { id: 'well-separated', label: { 'zh-CN': '谱间隔明显', en: 'well separated' } },
  { id: 'slow-gap', label: { 'zh-CN': '谱间隔较小', en: 'small spectral gap' } },
  { id: 'sign-flip', label: { 'zh-CN': '符号翻转', en: 'sign flip' } },
]

const matrixKind = reactive<{ value: EigenPowerMatrixKind }>({ value: 'well-separated' })
const vector = reactive<Vector2>({ x: 1, y: 0.25 })
const iterations = reactive({ value: 4 })

const evaluation = computed(() =>
  evaluateEigenDirection({
    matrixKind: matrixKind.value,
    vector,
    iterations: iterations.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '特征方向探针',
        subtitle: '拖动候选方向 v，看 Av 是否仍停留在同一条方向线上。',
        aria: '特征方向与 Rayleigh quotient 实验',
        matrix: '矩阵类型',
        iterations: '幂迭代步数',
        reset: '重置方向',
        rayleigh: 'Rayleigh quotient',
        residual: 'residual',
        angle: 'Av 夹角',
        near: '接近特征方向',
        yes: '是',
        no: '还不是',
        v: '当前 v',
        av: 'Av',
        note: '特征向量不是坐标不变，而是方向线不变；residual 越小，Av 越接近 λv。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Eigen Direction Probe',
        subtitle: 'Drag a candidate direction v and see whether Av stays on the same line.',
        aria: 'Eigen direction and Rayleigh quotient lab',
        matrix: 'matrix kind',
        iterations: 'power steps',
        reset: 'reset direction',
        rayleigh: 'Rayleigh quotient',
        residual: 'residual',
        angle: 'angle to Av',
        near: 'near eigen direction',
        yes: 'yes',
        no: 'not yet',
        v: 'current v',
        av: 'Av',
        note: 'An eigenvector does not keep its coordinates fixed; it keeps its direction line. A smaller residual means Av is closer to λv.',
      },
)
const currentLocale = computed(() => props.locale)

function updateVector(nextVector: Vector2) {
  vector.x = round(clamp(nextVector.x, -2.5, 2.5), 2)
  vector.y = round(clamp(nextVector.y, -2.5, 2.5), 2)
}

function resetDirection() {
  vector.x = 1
  vector.y = 0.25
  iterations.value = 4
}

function format(value: number, digits = 3) {
  return round(value, digits).toFixed(digits)
}

function formatVector(value: Vector2) {
  return `(${format(value.x, 2)}, ${format(value.y, 2)})`
}

function displayImageVector(): Vector2 {
  const image = evaluation.value.imageVector
  const length = norm(image)
  if (length <= 1e-12) return { x: 0, y: 0 }
  const scale = Math.min(2.7, length) / length
  return {
    x: image.x * scale,
    y: image.y * scale,
  }
}

function pathPoints(toSvg: (point: Vector2) => { x: number; y: number }) {
  return evaluation.value.powerPath
    .map((point) => `${toSvg(point).x},${toSvg(point).y}`)
    .join(' ')
}

function unitCirclePoints(toSvg: (point: Vector2) => { x: number; y: number }) {
  return Array.from({ length: 96 }, (_, index) => {
    const theta = (Math.PI * 2 * index) / 96
    const point = toSvg({ x: Math.cos(theta), y: Math.sin(theta) })
    return `${point.x},${point.y}`
  }).join(' ')
}

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'eigenvalues-eigenvectors',
  sourceId: 'eigen-direction-lab',
  summary: {
    'zh-CN': '当前方向用 Rayleigh quotient 与 residual 判断是否接近特征方向。',
    en: 'The current direction uses the Rayleigh quotient and residual to judge eigen-direction alignment.',
  },
  metrics: [
    { label: { 'zh-CN': 'Rayleigh quotient', en: 'Rayleigh quotient' }, value: format(evaluation.value.rayleighQuotient) },
    { label: { 'zh-CN': 'residual', en: 'residual' }, value: format(evaluation.value.residualNorm) },
    {
      label: { 'zh-CN': 'Av 夹角', en: 'angle to Av' },
      value: format(evaluation.value.angleToImage, 1),
      unit: { 'zh-CN': '度', en: 'degrees' },
    },
    { label: { 'zh-CN': '当前 v', en: 'current v' }, value: formatVector(evaluation.value.normalizedVector) },
    { label: { 'zh-CN': 'Av', en: 'Av' }, value: formatVector(evaluation.value.imageVector) },
  ],
  prompt: {
    'zh-CN': '解释为什么 residual 接近 0 时，当前方向可视为近似特征向量。',
    en: 'Explain why a residual near 0 means the current direction is an approximate eigenvector.',
  },
}))

watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)
</script>

<template>
  <section class="math-lab-card eigen-direction-lab">
    <div class="math-lab-card__visual eigen-direction-lab__visual">
      <InteractivePlane
        v-slot="{ toSvg, fromSvg }"
        :label="copy.aria"
        :width="420"
        :height="320"
        :x-min="-3"
        :x-max="3"
        :y-min="-3"
        :y-max="3"
      >
        <defs>
          <marker :id="markerIds.vector" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#3868ff" />
          </marker>
          <marker :id="markerIds.image" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#d65a31" />
          </marker>
        </defs>

        <polyline :points="unitCirclePoints(toSvg)" class="eigen-direction-lab__unit" />
        <polyline :points="pathPoints(toSvg)" class="eigen-direction-lab__path" />
        <circle
          v-for="(point, index) in evaluation.powerPath"
          :key="index"
          :cx="toSvg(point).x"
          :cy="toSvg(point).y"
          :r="index === evaluation.powerPath.length - 1 ? 5 : 3"
          class="eigen-direction-lab__iterate"
        />
        <line
          :x1="toSvg({ x: 0, y: 0 }).x"
          :y1="toSvg({ x: 0, y: 0 }).y"
          :x2="toSvg(displayImageVector()).x"
          :y2="toSvg(displayImageVector()).y"
          class="eigen-direction-lab__image"
          :marker-end="`url(#${markerIds.image})`"
        />
        <DraggableVector
          :vector="evaluation.normalizedVector"
          :label="copy.v"
          :to-svg="toSvg"
          :from-svg="fromSvg"
          :marker-id="markerIds.vector"
          class-name="eigen-direction-lab__vector"
          @update:vector="updateVector"
        />
      </InteractivePlane>
    </div>

    <div class="math-lab-card__controls eigen-direction-lab__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls">
        <label>
          {{ copy.matrix }}
          <select v-model="matrixKind.value">
            <option v-for="option in matrixOptions" :key="option.id" :value="option.id">
              {{ option.label[currentLocale] }}
            </option>
          </select>
        </label>
        <label>
          {{ copy.iterations }}: {{ iterations.value }}
          <input v-model.number="iterations.value" type="range" min="0" max="18" step="1" />
        </label>
      </div>

      <button type="button" class="action-button" @click="resetDirection">{{ copy.reset }}</button>

      <div class="math-readout-grid">
        <article><span>{{ copy.rayleigh }}</span><strong>{{ format(evaluation.rayleighQuotient) }}</strong></article>
        <article><span>{{ copy.residual }}</span><strong>{{ format(evaluation.residualNorm) }}</strong></article>
        <article><span>{{ copy.angle }}</span><strong>{{ format(evaluation.angleToImage, 1) }}°</strong></article>
        <article><span>{{ copy.near }}</span><strong>{{ evaluation.nearEigenDirection ? copy.yes : copy.no }}</strong></article>
        <article><span>{{ copy.v }}</span><strong>{{ formatVector(evaluation.normalizedVector) }}</strong></article>
        <article><span>{{ copy.av }}</span><strong>{{ formatVector(evaluation.imageVector) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.eigen-direction-lab__unit {
  fill: rgba(56, 104, 255, 0.06);
  stroke: rgba(56, 104, 255, 0.22);
  stroke-width: 2;
}

.eigen-direction-lab__path {
  fill: none;
  stroke: #0f9f7a;
  stroke-width: 3;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.eigen-direction-lab__iterate {
  fill: #0f9f7a;
  stroke: #ffffff;
  stroke-width: 1.5;
}

.eigen-direction-lab__image {
  stroke: #d65a31;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-dasharray: 8 6;
}

.eigen-direction-lab :deep(.eigen-direction-lab__vector) {
  color: #3868ff;
}
</style>
