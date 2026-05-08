<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
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
        subtitle: 'W 会变换整张网格',
        invertible: '可逆',
        yes: '是',
        nearNo: '接近不可逆',
        note: 'y = Wx + b 先做这个线性变换，再用 b 平移变换后的特征。',
      }
    : {
        aria: 'Matrix transform visualization',
        title: 'Matrix Lab',
        subtitle: 'W transforms the whole grid',
        invertible: 'invertible',
        yes: 'yes',
        nearNo: 'near no',
        note: 'y = Wx + b uses this same transform first, then shifts the transformed features by b.',
      },
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
