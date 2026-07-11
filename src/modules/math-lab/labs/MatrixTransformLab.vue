<script setup lang="ts">
import { computed, reactive, watch } from 'vue'
import InteractivePlane from '../components/interactive/InteractivePlane.vue'
import DraggableVector from '../components/interactive/DraggableVector.vue'
import LabReadout from '../components/interactive/LabReadout.vue'
import type { SvgPoint } from '../composables/useCartesianViewport'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import {
  evaluateMatrixTransform,
  matrixTransformPresets,
} from '../utils/linearTransforms'
import {
  clamp,
  matrixVectorMultiply,
  round,
  type Matrix2x2,
  type Vector2,
} from '../utils/math'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
  symbol?: string
  emitEvidence?: boolean
}>(), {
  locale: 'zh-CN',
  symbol: 'W',
  emitEvidence: true,
})

const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()

interface LabReadoutItem {
  id: string
  label: string
  value: string | number
  tone?: 'default' | 'good' | 'warn'
}

const coordinateLimit = 3.6
const matrix = reactive({
  a: 1.2,
  b: 0.6,
  c: -0.3,
  d: 1,
})
const probeVector: Vector2 = { x: 1.5, y: -0.5 }

const matrixValue = computed<Matrix2x2>(() => [
  [finiteOr(matrix.a, 0), finiteOr(matrix.b, 0)],
  [finiteOr(matrix.c, 0), finiteOr(matrix.d, 0)],
])
const currentLocale = computed(() => props.locale)
const matrixSymbol = computed(() => props.symbol.trim() || 'W')
const evaluation = computed(() => evaluateMatrixTransform({
  matrix: matrixValue.value,
  probe: probeVector,
}))
const basisI = computed(() => evaluation.value.basisI)
const basisJ = computed(() => evaluation.value.basisJ)
const transformedProbe = computed(() => evaluation.value.transformedProbe)

const gridLines = computed(() => {
  const lines: Array<{ id: string; start: Vector2; end: Vector2 }> = []
  for (let value = -4; value <= 4; value += 1) {
    lines.push({ id: `h-${value}`, start: { x: -4, y: value }, end: { x: 4, y: value } })
    lines.push({ id: `v-${value}`, start: { x: value, y: -4 }, end: { x: value, y: 4 } })
  }
  return lines
})

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        aria: '矩阵变换可视化',
        title: '矩阵实验',
        subtitle: `拖动 ${matrixSymbol.value} e1 与 ${matrixSymbol.value} e2，观察整张网格如何变形`,
        preset: '预设',
        invertible: '可逆',
        rank: '秩',
        areaScale: '面积倍数',
        orientation: '方向',
        yes: '是',
        nearNo: '否',
        preserved: '保持',
        flipped: '翻转',
        collapsed: '塌缩',
        note: matrixSymbol.value === 'A'
          ? '几何变换 A 先移动基向量；任意输入 x 都由同一组列向量组合得到 A x。'
          : `线性层 y = ${matrixSymbol.value}x + b 先用 ${matrixSymbol.value} 移动基向量；任意输入 x 都会按同一组列向量组合得到 ${matrixSymbol.value}x。`,
      }
    : {
        aria: 'Matrix transform visualization',
        title: 'Matrix Lab',
        subtitle: `Drag ${matrixSymbol.value} e1 and ${matrixSymbol.value} e2 to see how the whole grid deforms`,
        preset: 'preset',
        invertible: 'invertible',
        rank: 'rank',
        areaScale: 'area scale',
        orientation: 'orientation',
        yes: 'yes',
        nearNo: 'no',
        preserved: 'preserved',
        flipped: 'flipped',
        collapsed: 'collapsed',
        note: matrixSymbol.value === 'A'
          ? 'The geometric transform A moves the basis vectors first; any input x is then rebuilt from the same columns as A x.'
          : `A linear layer y = ${matrixSymbol.value}x + b moves basis vectors first; any input x is then rebuilt from the same column vectors.`,
      },
)

const orientationText = computed(() => {
  if (evaluation.value.orientation === 'preserved') return copy.value.preserved
  if (evaluation.value.orientation === 'flipped') return copy.value.flipped
  return copy.value.collapsed
})

const readoutItems = computed<LabReadoutItem[]>(() => [
  { id: 'det', label: `det(${matrixSymbol.value})`, value: round(evaluation.value.determinant, 3) },
  { id: 'area', label: copy.value.areaScale, value: round(evaluation.value.areaScale, 3) },
  { id: 'rank', label: copy.value.rank, value: evaluation.value.rank },
  {
    id: 'orientation',
    label: copy.value.orientation,
    value: orientationText.value,
    tone: evaluation.value.orientation === 'collapsed' ? 'warn' : 'default',
  },
  {
    id: 'invertible',
    label: copy.value.invertible,
    value: evaluation.value.invertible ? copy.value.yes : copy.value.nearNo,
    tone: evaluation.value.invertible ? 'good' : 'warn',
  },
  { id: 'basis-i', label: `${matrixSymbol.value} e1`, value: formatVector2(basisI.value) },
  { id: 'basis-j', label: `${matrixSymbol.value} e2`, value: formatVector2(basisJ.value) },
  { id: 'probe', label: `${matrixSymbol.value} x`, value: formatVector2(transformedProbe.value) },
])

function finiteOr(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

function clampCoordinate(value: number) {
  return clamp(finiteOr(value, 0), -coordinateLimit, coordinateLimit)
}

function formatVector2(vector: Vector2) {
  return `(${round(vector.x, 2)}, ${round(vector.y, 2)})`
}

function formatMatrix(value: Matrix2x2) {
  return value.map((row) => `[${row.map((entry) => round(entry, 2)).join(', ')}]`).join(' ')
}

function applyPreset(preset: Matrix2x2) {
  matrix.a = preset[0][0]
  matrix.b = preset[0][1]
  matrix.c = preset[1][0]
  matrix.d = preset[1][1]
}

function updateBasisI(vector: Vector2) {
  matrix.a = clampCoordinate(vector.x)
  matrix.c = clampCoordinate(vector.y)
}

function updateBasisJ(vector: Vector2) {
  matrix.b = clampCoordinate(vector.x)
  matrix.d = clampCoordinate(vector.y)
}

function transformedSvgPoint(point: Vector2, toSvg: (point: Vector2) => SvgPoint) {
  return toSvg(matrixVectorMultiply(matrixValue.value, point))
}

function unitCirclePoints(toSvg: (point: Vector2) => SvgPoint) {
  return Array.from({ length: 80 }, (_, index) => {
    const theta = (Math.PI * 2 * index) / 80
    const point = transformedSvgPoint({ x: Math.cos(theta), y: Math.sin(theta) }, toSvg)
    return `${point.x},${point.y}`
  }).join(' ')
}

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'linear-algebra-matrix-transformations',
  sourceId: 'matrix-transform-lab',
  summary: {
    'zh-CN': '当前矩阵通过改变 e1、e2 的去向来变形整张网格。',
    en: 'The current matrix deforms the whole grid by moving where e1 and e2 land.',
  },
  metrics: [
    { label: { 'zh-CN': `矩阵 ${matrixSymbol.value}`, en: `Matrix ${matrixSymbol.value}` }, value: formatMatrix(matrixValue.value) },
    { label: { 'zh-CN': `${matrixSymbol.value} e1`, en: `${matrixSymbol.value} e1` }, value: formatVector2(basisI.value) },
    { label: { 'zh-CN': `${matrixSymbol.value} e2`, en: `${matrixSymbol.value} e2` }, value: formatVector2(basisJ.value) },
    { label: { 'zh-CN': '探针 x', en: 'Probe x' }, value: formatVector2(probeVector) },
    { label: { 'zh-CN': `${matrixSymbol.value} x`, en: `${matrixSymbol.value} x` }, value: formatVector2(transformedProbe.value) },
    { label: { 'zh-CN': '列组合', en: 'column combination' }, value: `${probeVector.x} ${matrixSymbol.value} e1 + ${probeVector.y} ${matrixSymbol.value} e2 = ${formatVector2(transformedProbe.value)}` },
    { label: { 'zh-CN': `det(${matrixSymbol.value})`, en: `det(${matrixSymbol.value})` }, value: round(evaluation.value.determinant, 3) },
    { label: { 'zh-CN': '秩', en: 'rank' }, value: evaluation.value.rank },
    { label: { 'zh-CN': '面积倍数', en: 'area scale' }, value: round(evaluation.value.areaScale, 3) },
    { label: { 'zh-CN': '方向', en: 'orientation' }, value: { 'zh-CN': orientationText.value, en: orientationText.value } },
    { label: { 'zh-CN': '可逆', en: 'invertible' }, value: evaluation.value.invertible ? { 'zh-CN': '是', en: 'yes' } : { 'zh-CN': '否', en: 'no' } },
  ],
  prompt: {
    'zh-CN': `解释为什么只看 ${matrixSymbol.value} e1 和 ${matrixSymbol.value} e2 就能预测网格如何变形。`,
    en: `Explain why ${matrixSymbol.value} e1 and ${matrixSymbol.value} e2 are enough to predict how the grid deforms.`,
  },
}))

watch(
  evidence,
  (nextEvidence) => {
    if (props.emitEvidence) emit('evidence-change', nextEvidence)
  },
  { immediate: true },
)
</script>

<template>
  <section class="math-lab-card matrix-transform-lab">
    <div class="math-lab-card__visual">
      <InteractivePlane
        class="math-matrix-svg"
        :label="copy.aria"
        :width="420"
        :height="360"
        :x-min="-4"
        :x-max="4"
        :y-min="-4"
        :y-max="4"
      >
        <template #default="{ toSvg, fromSvg }">
          <defs>
            <marker id="matrix-arrow-i" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#3868ff" />
            </marker>
            <marker id="matrix-arrow-j" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#0f9f7a" />
            </marker>
            <marker id="matrix-arrow-probe" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
              <path d="M0,0 L0,6 L9,3 z" fill="#e26d3d" />
            </marker>
          </defs>

          <g class="math-grid transformed-grid" aria-hidden="true">
            <line
              v-for="line in gridLines"
              :key="line.id"
              :x1="transformedSvgPoint(line.start, toSvg).x"
              :y1="transformedSvgPoint(line.start, toSvg).y"
              :x2="transformedSvgPoint(line.end, toSvg).x"
              :y2="transformedSvgPoint(line.end, toSvg).y"
            />
          </g>
          <polyline :points="unitCirclePoints(toSvg)" class="unit-circle" />
          <line
            :x1="toSvg({ x: 0, y: 0 }).x"
            :y1="toSvg({ x: 0, y: 0 }).y"
            :x2="toSvg(transformedProbe).x"
            :y2="toSvg(transformedProbe).y"
            class="basis matrix-probe-vector"
            marker-end="url(#matrix-arrow-probe)"
          />
          <DraggableVector
            :vector="basisI"
            :label="`${matrixSymbol} e1`"
            :to-svg="toSvg"
            :from-svg="fromSvg"
            marker-id="matrix-arrow-i"
            class-name="basis--i"
            @update:vector="updateBasisI"
          />
          <DraggableVector
            :vector="basisJ"
            :label="`${matrixSymbol} e2`"
            :to-svg="toSvg"
            :from-svg="fromSvg"
            marker-id="matrix-arrow-j"
            class-name="basis--j"
            @update:vector="updateBasisJ"
          />
          <circle
            :cx="toSvg({ x: 0, y: 0 }).x"
            :cy="toSvg({ x: 0, y: 0 }).y"
            r="4"
            class="origin-dot"
          />
        </template>
      </InteractivePlane>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.subtitle }}</strong>
      </header>

      <div class="matrix-preset-row" :aria-label="copy.preset">
        <button
          v-for="preset in matrixTransformPresets"
          :key="preset.id"
          type="button"
          @click="applyPreset(preset.matrix)"
        >
          {{ preset.label[currentLocale] }}
        </button>
      </div>

      <div class="matrix-input-grid">
        <label><span>a</span><input v-model.number="matrix.a" type="number" step="0.1" /></label>
        <label><span>b</span><input v-model.number="matrix.b" type="number" step="0.1" /></label>
        <label><span>c</span><input v-model.number="matrix.c" type="number" step="0.1" /></label>
        <label><span>d</span><input v-model.number="matrix.d" type="number" step="0.1" /></label>
      </div>

      <LabReadout :items="readoutItems" />

      <p class="math-lab-note">
        {{ copy.note }}
      </p>
    </div>
  </section>
</template>
