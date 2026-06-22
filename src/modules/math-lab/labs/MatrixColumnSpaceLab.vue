<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  clamp,
  columnSpaceKind2x2,
  determinant2x2,
  matrixColumns2x2,
  matrixVectorMultiply,
  nullDirection2x2,
  rank2x2,
  round,
  type ColumnSpaceKind,
  type Matrix2x2,
  type Vector2,
} from '../utils/math'

type ControlKey = 'a11' | 'a12' | 'a21' | 'a22' | 'x1' | 'x2'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const size = 380
const center = size / 2
const plotPadding = 34
const matrixLimit = 5
const vectorLimit = 4

const controls = reactive<Record<ControlKey, number>>({
  a11: 2,
  a12: 0.8,
  a21: 1,
  a22: 1.8,
  x1: 1.2,
  x2: -0.7,
})

const controlLimits: Record<ControlKey, number> = {
  a11: matrixLimit,
  a12: matrixLimit,
  a21: matrixLimit,
  a22: matrixLimit,
  x1: vectorLimit,
  x2: vectorLimit,
}

const currentLocale = computed<MathLabLocale>(() => props.locale ?? 'zh-CN')
const matrixValue = computed<Matrix2x2>(() => [
  [controls.a11, controls.a12],
  [controls.a21, controls.a22],
])
const inputVector = computed<Vector2>(() => ({ x: controls.x1, y: controls.x2 }))
const columns = computed(() => matrixColumns2x2(matrixValue.value))
const a1 = computed(() => columns.value[0])
const a2 = computed(() => columns.value[1])
const result = computed(() => matrixVectorMultiply(matrixValue.value, inputVector.value))
const determinant = computed(() => determinant2x2(matrixValue.value))
const rank = computed(() => rank2x2(matrixValue.value))
const columnSpaceKind = computed(() => columnSpaceKind2x2(matrixValue.value))
const nullDirection = computed(() => nullDirection2x2(matrixValue.value))
const nullDirectionResult = computed(() =>
  nullDirection.value ? matrixVectorMultiply(matrixValue.value, nullDirection.value) : null,
)
const firstContribution = computed<Vector2>(() => ({
  x: controls.x1 * a1.value.x,
  y: controls.x1 * a1.value.y,
}))
const secondContribution = computed<Vector2>(() => ({
  x: controls.x2 * a2.value.x,
  y: controls.x2 * a2.value.y,
}))
const secondContributionLabelPoint = computed<Vector2>(() => ({
  x: firstContribution.value.x + secondContribution.value.x / 2,
  y: firstContribution.value.y + secondContribution.value.y / 2,
}))

const plotExtent = computed(() => {
  const points = [
    a1.value,
    a2.value,
    firstContribution.value,
    secondContribution.value,
    result.value,
    { x: firstContribution.value.x + secondContribution.value.x, y: firstContribution.value.y + secondContribution.value.y },
  ]
  const maxCoordinate = Math.max(
    1,
    ...points.flatMap((point) => [Math.abs(point.x), Math.abs(point.y)]),
  )

  return clamp(Math.ceil(maxCoordinate + 1), 4, 28)
})
const plotScale = computed(() => (center - plotPadding) / plotExtent.value)
const gridTicks = computed(() =>
  Array.from({ length: 9 }, (_, index) => -plotExtent.value + (index * plotExtent.value * 2) / 8),
)

const kindLabels: Record<ColumnSpaceKind, Record<MathLabLocale, string>> = {
  plane: {
    'zh-CN': 'plane（平面）',
    en: 'plane',
  },
  line: {
    'zh-CN': 'line（一条直线）',
    en: 'line',
  },
  point: {
    'zh-CN': 'point（原点）',
    en: 'point',
  },
}

const kindNotes: Record<ColumnSpaceKind, Record<MathLabLocale, string>> = {
  plane: {
    'zh-CN': 'rank = 2：两列给出两个独立方向，所有平面点都可以由某个 x 到达。',
    en: 'rank = 2: the two columns give independent directions, so some x can reach every point in the plane.',
  },
  line: {
    'zh-CN': 'rank = 1：两列只给出同一条方向，所有输出都落在一条线上。',
    en: 'rank = 1: the columns only provide one direction, so every output stays on one line.',
  },
  point: {
    'zh-CN': 'rank = 0：两列都是零向量，所有输入都会被压到原点。',
    en: 'rank = 0: both columns are zero vectors, so every input collapses to the origin.',
  },
}

const copy = computed(() =>
  currentLocale.value === 'zh-CN'
    ? {
        aria: '矩阵列空间与秩互动实验',
        title: '列空间实验',
        subtitle: '调节 A 和 x，观察 Ax 怎样由两列向量线性组合得到',
        matrix: '矩阵 A',
        input: '输入向量 x',
        reset: '重置',
        readout: '读数',
        combination: '列组合',
        rank: 'rank（秩）',
        columnSpace: 'column space（列空间）',
        determinant: 'det(A)',
        nullDirection: '零空间方向',
        noNullDirection: 'rank = 2 时，只有零向量会被压到 0。',
        nullPrefix: '存在非零输入方向会被压到 0：',
        explanation: [
          '矩阵乘以向量不是神秘的新运算：A 的第一列 a1 乘上 x1，第二列 a2 乘上 x2，再把两个向量相加。',
          'rank 是可到达维度。rank=2 覆盖平面，rank=1 只到一条线，rank=0 只到原点。',
        ],
        labels: {
          a1: 'a1 第一列',
          a2: 'a2 第二列',
          ax: 'Ax 组合结果',
          x1a1: 'x1 a1',
          x2a2: 'x2 a2',
        },
      }
    : {
        aria: 'Interactive matrix column space and rank lab',
        title: 'Column Space Lab',
        subtitle: 'Adjust A and x to see Ax as a linear combination of the two columns',
        matrix: 'Matrix A',
        input: 'Input vector x',
        reset: 'Reset',
        readout: 'Readout',
        combination: 'Column combination',
        rank: 'rank',
        columnSpace: 'column space',
        determinant: 'det(A)',
        nullDirection: 'null direction',
        noNullDirection: 'When rank = 2, only the zero vector maps to 0.',
        nullPrefix: 'A nonzero input direction is collapsed to 0:',
        explanation: [
          'Matrix-vector multiplication is not a mysterious new operation: multiply the first column a1 by x1, multiply the second column a2 by x2, then add the two vectors.',
          'Rank is the reachable dimension. rank=2 covers the plane, rank=1 reaches only a line, and rank=0 reaches only the origin.',
        ],
        labels: {
          a1: 'a1 first column',
          a2: 'a2 second column',
          ax: 'Ax result',
          x1a1: 'x1 a1',
          x2a2: 'x2 a2',
        },
      },
)

const matrixControls = computed(() => [
  { key: 'a11' as const, label: 'a11', value: controls.a11 },
  { key: 'a12' as const, label: 'a12', value: controls.a12 },
  { key: 'a21' as const, label: 'a21', value: controls.a21 },
  { key: 'a22' as const, label: 'a22', value: controls.a22 },
])
const vectorControls = computed(() => [
  { key: 'x1' as const, label: 'x1', value: controls.x1 },
  { key: 'x2' as const, label: 'x2', value: controls.x2 },
])

const columnSpaceLabel = computed(() => kindLabels[columnSpaceKind.value][currentLocale.value])
const columnSpaceNote = computed(() => kindNotes[columnSpaceKind.value][currentLocale.value])
const combinationExpression = computed(() => {
  const firstTerm = `${formatNumber(controls.x1)} a1 ${formatSignedTerm(controls.x2)} a2`
  return `A x = x1 a1 + x2 a2 = ${firstTerm} = ${formatVector(result.value)}`
})
const nullDirectionCopy = computed(() => {
  if (!nullDirection.value || !nullDirectionResult.value) {
    return copy.value.noNullDirection
  }

  return `${copy.value.nullPrefix} n = ${formatVector(nullDirection.value)}, A n = ${formatVector(nullDirectionResult.value)}`
})

function sanitizeInput(value: number, limit: number) {
  if (!Number.isFinite(value)) return 0
  return round(clamp(value, -limit, limit), 2)
}

function setControl(key: ControlKey, event: Event) {
  const target = event.target as HTMLInputElement
  controls[key] = sanitizeInput(Number(target.value), controlLimits[key])
}

function resetLab() {
  controls.a11 = 2
  controls.a12 = 0.8
  controls.a21 = 1
  controls.a22 = 1.8
  controls.x1 = 1.2
  controls.x2 = -0.7
}

function toSvg(point: Vector2) {
  const x = clamp(point.x, -plotExtent.value, plotExtent.value)
  const y = clamp(point.y, -plotExtent.value, plotExtent.value)

  return {
    x: center + x * plotScale.value,
    y: center - y * plotScale.value,
  }
}

function labelPosition(point: Vector2, dx = 10, dy = -10) {
  const svgPoint = toSvg(point)
  return {
    x: clamp(svgPoint.x + dx, 16, size - 16),
    y: clamp(svgPoint.y + dy, 20, size - 12),
  }
}

function formatNumber(value: number, digits = 2) {
  const normalized = Math.abs(value) < 1e-10 ? 0 : round(value, digits)
  return Number.isInteger(normalized) ? `${normalized}` : normalized.toFixed(digits).replace(/0+$/, '').replace(/\.$/, '')
}

function formatVector(vector: Vector2) {
  return `(${formatNumber(vector.x)}, ${formatNumber(vector.y)})`
}

function formatSignedTerm(value: number) {
  const sign = value < 0 ? '-' : '+'
  return `${sign} ${formatNumber(Math.abs(value))}`
}
</script>

<template>
  <section class="math-lab-card matrix-column-space-lab">
    <div class="math-lab-card__visual matrix-column-space-lab__visual">
      <svg
        viewBox="0 0 380 380"
        class="matrix-column-space-lab__svg"
        role="img"
        :aria-label="copy.aria"
      >
        <defs>
          <marker id="matrix-column-space-arrow-a1" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#3868ff" />
          </marker>
          <marker id="matrix-column-space-arrow-a2" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#0f9f7a" />
          </marker>
          <marker id="matrix-column-space-arrow-ax" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#e26d3d" />
          </marker>
        </defs>

        <g class="matrix-column-space-lab__grid">
          <line
            v-for="tick in gridTicks"
            :key="`h-${tick}`"
            :x1="toSvg({ x: -plotExtent, y: tick }).x"
            :y1="toSvg({ x: -plotExtent, y: tick }).y"
            :x2="toSvg({ x: plotExtent, y: tick }).x"
            :y2="toSvg({ x: plotExtent, y: tick }).y"
          />
          <line
            v-for="tick in gridTicks"
            :key="`v-${tick}`"
            :x1="toSvg({ x: tick, y: -plotExtent }).x"
            :y1="toSvg({ x: tick, y: -plotExtent }).y"
            :x2="toSvg({ x: tick, y: plotExtent }).x"
            :y2="toSvg({ x: tick, y: plotExtent }).y"
          />
          <line :x1="toSvg({ x: -plotExtent, y: 0 }).x" :y1="center" :x2="toSvg({ x: plotExtent, y: 0 }).x" :y2="center" class="matrix-column-space-lab__axis" />
          <line :x1="center" :y1="toSvg({ x: 0, y: -plotExtent }).y" :x2="center" :y2="toSvg({ x: 0, y: plotExtent }).y" class="matrix-column-space-lab__axis" />
        </g>

        <line
          :x1="center"
          :y1="center"
          :x2="toSvg(a1).x"
          :y2="toSvg(a1).y"
          class="matrix-column-space-lab__vector matrix-column-space-lab__vector--a1"
          marker-end="url(#matrix-column-space-arrow-a1)"
        />
        <line
          :x1="center"
          :y1="center"
          :x2="toSvg(a2).x"
          :y2="toSvg(a2).y"
          class="matrix-column-space-lab__vector matrix-column-space-lab__vector--a2"
          marker-end="url(#matrix-column-space-arrow-a2)"
        />
        <line
          :x1="center"
          :y1="center"
          :x2="toSvg(firstContribution).x"
          :y2="toSvg(firstContribution).y"
          class="matrix-column-space-lab__contribution matrix-column-space-lab__contribution--x1"
        />
        <line
          :x1="toSvg(firstContribution).x"
          :y1="toSvg(firstContribution).y"
          :x2="toSvg(result).x"
          :y2="toSvg(result).y"
          class="matrix-column-space-lab__contribution matrix-column-space-lab__contribution--x2"
        />
        <line
          :x1="center"
          :y1="center"
          :x2="toSvg(result).x"
          :y2="toSvg(result).y"
          class="matrix-column-space-lab__vector matrix-column-space-lab__vector--ax"
          marker-end="url(#matrix-column-space-arrow-ax)"
        />

        <circle :cx="center" :cy="center" r="4.5" class="matrix-column-space-lab__origin" />
        <circle :cx="toSvg(result).x" :cy="toSvg(result).y" r="6" class="matrix-column-space-lab__result-dot" />

        <text
          class="matrix-column-space-lab__label matrix-column-space-lab__label--a1"
          :x="labelPosition(a1).x"
          :y="labelPosition(a1).y"
        >
          {{ copy.labels.a1 }}
        </text>
        <text
          class="matrix-column-space-lab__label matrix-column-space-lab__label--a2"
          :x="labelPosition(a2, 10, 18).x"
          :y="labelPosition(a2, 10, 18).y"
        >
          {{ copy.labels.a2 }}
        </text>
        <text
          class="matrix-column-space-lab__label matrix-column-space-lab__label--ax"
          :x="labelPosition(result, 12, -14).x"
          :y="labelPosition(result, 12, -14).y"
        >
          {{ copy.labels.ax }}
        </text>
        <text
          class="matrix-column-space-lab__label matrix-column-space-lab__label--contribution"
          :x="labelPosition(firstContribution, 10, 18).x"
          :y="labelPosition(firstContribution, 10, 18).y"
        >
          {{ copy.labels.x1a1 }}
        </text>
        <text
          class="matrix-column-space-lab__label matrix-column-space-lab__label--contribution"
          :x="labelPosition(secondContributionLabelPoint, 10, -12).x"
          :y="labelPosition(secondContributionLabelPoint, 10, -12).y"
        >
          {{ copy.labels.x2a2 }}
        </text>
      </svg>

      <p class="matrix-column-space-lab__formula">
        {{ combinationExpression }}
      </p>
    </div>

    <div class="math-lab-card__controls matrix-column-space-lab__controls">
      <header>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.subtitle }}</strong>
      </header>

      <section class="matrix-column-space-lab__control-section" :aria-label="copy.matrix">
        <div class="matrix-column-space-lab__section-heading">
          <strong>{{ copy.matrix }}</strong>
          <button type="button" class="matrix-column-space-lab__reset" @click="resetLab">
            {{ copy.reset }}
          </button>
        </div>
        <div class="matrix-column-space-lab__control-grid">
          <label
            v-for="control in matrixControls"
            :key="control.key"
            class="matrix-column-space-lab__control"
          >
            <span><strong>{{ control.label }}</strong><em>{{ formatNumber(control.value) }}</em></span>
            <input
              type="number"
              min="-5"
              max="5"
              step="0.1"
              :value="control.value"
              @input="setControl(control.key, $event)"
            />
          </label>
        </div>
      </section>

      <section class="matrix-column-space-lab__control-section" :aria-label="copy.input">
        <strong>{{ copy.input }}</strong>
        <div class="matrix-column-space-lab__control-grid matrix-column-space-lab__control-grid--vector">
          <label
            v-for="control in vectorControls"
            :key="control.key"
            class="matrix-column-space-lab__control"
          >
            <span><strong>{{ control.label }}</strong><em>{{ formatNumber(control.value) }}</em></span>
            <input
              type="number"
              min="-4"
              max="4"
              step="0.1"
              :value="control.value"
              @input="setControl(control.key, $event)"
            />
          </label>
        </div>
      </section>

      <section class="matrix-column-space-lab__readouts" :aria-label="copy.readout" aria-live="polite">
        <article class="matrix-column-space-lab__readout matrix-column-space-lab__readout--wide">
          <span>{{ copy.combination }}</span>
          <strong>{{ combinationExpression }}</strong>
        </article>
        <article class="matrix-column-space-lab__readout">
          <span>{{ copy.rank }}</span>
          <strong>{{ rank }}</strong>
        </article>
        <article class="matrix-column-space-lab__readout">
          <span>{{ copy.columnSpace }}</span>
          <strong>{{ columnSpaceLabel }}</strong>
        </article>
        <article class="matrix-column-space-lab__readout">
          <span>{{ copy.determinant }}</span>
          <strong>{{ formatNumber(determinant, 3) }}</strong>
        </article>
        <article class="matrix-column-space-lab__readout matrix-column-space-lab__readout--wide">
          <span>{{ copy.nullDirection }}</span>
          <strong>{{ nullDirectionCopy }}</strong>
        </article>
      </section>

      <div class="matrix-column-space-lab__explanation">
        <p>{{ copy.explanation[0] }}</p>
        <p>{{ copy.explanation[1] }}</p>
        <p>{{ columnSpaceNote }}</p>
      </div>
    </div>
  </section>
</template>
