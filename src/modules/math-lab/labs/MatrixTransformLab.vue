<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import {
  determinant2x2,
  isInvertible2x2,
  matrixVectorMultiply,
  round,
  type Matrix2x2,
  type Vector2,
} from '../utils/math'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()

const size = 380
const center = size / 2
const scale = 34
const matrix = reactive({
  a: 1.2,
  b: 0.6,
  c: -0.3,
  d: 1,
})

const matrixValue = computed<Matrix2x2>(() => [
  [matrix.a, matrix.b],
  [matrix.c, matrix.d],
])

const determinant = computed(() => determinant2x2(matrixValue.value))
const invertible = computed(() => isInvertible2x2(matrixValue.value, 0.05))
const basisI = computed(() => matrixVectorMultiply(matrixValue.value, { x: 1, y: 0 }))
const basisJ = computed(() => matrixVectorMultiply(matrixValue.value, { x: 0, y: 1 }))
const probeVector: Vector2 = { x: 1.5, y: -0.5 }
const transformedProbe = computed(() => matrixVectorMultiply(matrixValue.value, probeVector))

function formatVector2(vector: { x: number; y: number }) {
  return `(${round(vector.x, 2)}, ${round(vector.y, 2)})`
}

function toSvg(point: Vector2) {
  return {
    x: center + point.x * scale,
    y: center - point.y * scale,
  }
}

function transform(point: Vector2) {
  return toSvg(matrixVectorMultiply(matrixValue.value, point))
}

const gridLines = computed(() => {
  const lines: Array<{ id: string; start: Vector2; end: Vector2 }> = []
  for (let value = -4; value <= 4; value += 1) {
    lines.push({ id: `h-${value}`, start: { x: -4, y: value }, end: { x: 4, y: value } })
    lines.push({ id: `v-${value}`, start: { x: value, y: -4 }, end: { x: value, y: 4 } })
  }
  return lines
})

const unitCircle = computed(() =>
  Array.from({ length: 80 }, (_, index) => {
    const theta = (Math.PI * 2 * index) / 80
    return transform({ x: Math.cos(theta), y: Math.sin(theta) })
  })
    .map((point) => `${point.x},${point.y}`)
    .join(' '),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        aria: '矩阵变换可视化',
        title: '矩阵实验',
        subtitle: '修改 W，观察整张网格如何变形',
        invertible: '可逆',
        yes: '是',
        nearNo: '接近不可逆',
        note: '线性层 y = Wx + b 先用 W 变换特征，再用 b 平移变换后的结果。',
      }
    : {
        aria: 'Matrix transform visualization',
        title: 'Matrix Lab',
        subtitle: 'Edit W and watch the whole grid transform',
        invertible: 'invertible',
        yes: 'yes',
        nearNo: 'near no',
        note: 'A linear layer y = Wx + b uses W to transform features first, then shifts the result by b.',
      },
)

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'linear-algebra-matrix-transformations',
  sourceId: 'matrix-transform-lab',
  summary: {
    'zh-CN': '当前矩阵通过改变 e1、e2 的去向来变形整张网格。',
    en: 'The current matrix deforms the whole grid by moving where e1 and e2 land.',
  },
  metrics: [
    { label: { 'zh-CN': '矩阵 W', en: 'Matrix W' }, value: matrixValue.value.map((row) => `[${row.map((value) => round(value, 2)).join(', ')}]`).join(' ') },
    { label: { 'zh-CN': 'W e1', en: 'W e1' }, value: formatVector2(basisI.value) },
    { label: { 'zh-CN': 'W e2', en: 'W e2' }, value: formatVector2(basisJ.value) },
    { label: { 'zh-CN': '探针 x', en: 'Probe x' }, value: formatVector2(probeVector) },
    { label: { 'zh-CN': 'W x', en: 'W x' }, value: formatVector2(transformedProbe.value) },
    { label: { 'zh-CN': '列组合', en: 'column combination' }, value: `${probeVector.x} W e1 + ${probeVector.y} W e2 = ${formatVector2(transformedProbe.value)}` },
    { label: { 'zh-CN': 'det(W)', en: 'det(W)' }, value: round(determinant.value, 3) },
    { label: { 'zh-CN': '可逆', en: 'invertible' }, value: invertible.value ? { 'zh-CN': '是', en: 'yes' } : { 'zh-CN': '接近不可逆', en: 'near no' } },
  ],
  prompt: {
    'zh-CN': '解释为什么只看 W e1 和 W e2 就能预测网格如何变形。',
    en: 'Explain why W e1 and W e2 are enough to predict how the grid deforms.',
  },
}))

watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)
</script>

<template>
  <section class="math-lab-card matrix-transform-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 380 380" class="math-matrix-svg" role="img" :aria-label="copy.aria">
        <defs>
          <marker id="matrix-arrow-i" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#3868ff" />
          </marker>
          <marker id="matrix-arrow-j" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#0f9f7a" />
          </marker>
        </defs>

        <g class="math-grid transformed-grid">
          <line
            v-for="line in gridLines"
            :key="line.id"
            :x1="transform(line.start).x"
            :y1="transform(line.start).y"
            :x2="transform(line.end).x"
            :y2="transform(line.end).y"
          />
        </g>
        <polyline :points="unitCircle" class="unit-circle" />
        <line x1="190" y1="190" :x2="toSvg(basisI).x" :y2="toSvg(basisI).y" class="basis basis--i" marker-end="url(#matrix-arrow-i)" />
        <line x1="190" y1="190" :x2="toSvg(basisJ).x" :y2="toSvg(basisJ).y" class="basis basis--j" marker-end="url(#matrix-arrow-j)" />
        <circle cx="190" cy="190" r="4" class="origin-dot" />
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.subtitle }}</strong>
      </header>

      <div class="matrix-input-grid">
        <label><span>a</span><input v-model.number="matrix.a" type="number" step="0.1" /></label>
        <label><span>b</span><input v-model.number="matrix.b" type="number" step="0.1" /></label>
        <label><span>c</span><input v-model.number="matrix.c" type="number" step="0.1" /></label>
        <label><span>d</span><input v-model.number="matrix.d" type="number" step="0.1" /></label>
      </div>

      <div class="math-readout-grid">
        <article><span>det(W)</span><strong>{{ round(determinant, 3) }}</strong></article>
        <article><span>{{ copy.invertible }}</span><strong>{{ invertible ? copy.yes : copy.nearNo }}</strong></article>
        <article><span>W e1</span><strong>({{ round(basisI.x, 2) }}, {{ round(basisI.y, 2) }})</strong></article>
        <article><span>W e2</span><strong>({{ round(basisJ.x, 2) }}, {{ round(basisJ.y, 2) }})</strong></article>
      </div>

      <p class="math-lab-note">
        {{ copy.note }}
      </p>
    </div>
  </section>
</template>
