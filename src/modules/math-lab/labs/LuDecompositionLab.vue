<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { estimateLuReuseCost, evaluateLu2x2, type LuMatrix2x2, type LuVector2 } from '../utils/luDecomposition'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const firstPivot = ref(4)
const lowerEntry = ref(3)
const lowerRight = ref(5)
const rhsBottom = ref(7)

const fixedA12 = 2
const fixedB1 = 6
const uiEpsilon = 0.08

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? 'LU 两步求解实验' : 'Two-step LU solve lab',
    subtitle: zh
      ? '调节矩阵主元和右端项，观察消元乘子、Schur 补、解和残差如何变化。'
      : 'Adjust the pivot and right-hand side to watch the elimination multiplier, Schur complement, solution, and residual change.',
    firstPivot: zh ? '第一主元 a11' : 'First pivot a11',
    lowerEntry: zh ? '下方元素 a21' : 'Lower entry a21',
    lowerRight: zh ? '右下元素 a22' : 'Lower-right entry a22',
    rhsBottom: zh ? '右端项 b2' : 'Right-hand side b2',
    matrixA: zh ? '原矩阵 A' : 'Original matrix A',
    matrixL: zh ? '下三角 L' : 'Lower triangular L',
    matrixU: zh ? '上三角 U' : 'Upper triangular U',
    factorization: zh ? '分解读法' : 'Factorization view',
    solveFlow: zh ? '求解流' : 'Solve flow',
    rhs: zh ? '右端 b' : 'right side b',
    forward: zh ? '前代得到 y' : 'forward solve gives y',
    back: zh ? '回代得到 x' : 'back solve gives x',
    pivot: zh ? '主元' : 'pivot',
    multiplier: zh ? '消元乘子' : 'multiplier',
    schur: zh ? 'Schur 补' : 'Schur complement',
    determinant: zh ? 'det(A)' : 'det(A)',
    solution: zh ? '解 x' : 'solution x',
    residual: zh ? '残差范数' : 'residual norm',
    reuse: zh ? '6 个右端项复用收益' : 'reuse gain for 6 RHS',
    stableStatus: zh
      ? '当前主元和 Schur 补都远离 0，可以先解 Ly=b，再解 Ux=y。'
      : 'Both the pivot and Schur complement are away from 0, so solve Ly=b first and then Ux=y.',
    pivotStatus: zh
      ? 'a21 比 a11 更大，实际数值库通常会先换行做部分主元 pivoting。'
      : 'a21 is larger than a11, so numerical libraries would usually swap rows by partial pivoting first.',
    singularStatus: zh
      ? '第二个主元接近 0，回代会极度敏感；这时需要换行或判断矩阵是否接近奇异。'
      : 'The second pivot is near 0, so back substitution is highly sensitive; pivoting or a singularity check is needed.',
  }
})

const evaluation = computed(() =>
  evaluateLu2x2({
    a11: firstPivot.value,
    a12: fixedA12,
    a21: lowerEntry.value,
    a22: lowerRight.value,
    b1: fixedB1,
    b2: rhsBottom.value,
  }, uiEpsilon),
)

const reuseCost = computed(() => estimateLuReuseCost(160, 6))

const matrixPanels = computed<Array<{ label: string, rows: LuMatrix2x2 }>>(() => [
  { label: labels.value.matrixA, rows: evaluation.value.matrix },
  { label: labels.value.matrixL, rows: evaluation.value.l },
  { label: labels.value.matrixU, rows: evaluation.value.u },
])

const solveVectors = computed<Array<{ label: string, values: LuVector2 }>>(() => [
  { label: labels.value.rhs, values: evaluation.value.rhs },
  { label: labels.value.forward, values: evaluation.value.y },
  { label: labels.value.back, values: evaluation.value.x },
])

const statusText = computed(() => {
  if (evaluation.value.singular) return labels.value.singularStatus
  if (evaluation.value.needsPivot) return labels.value.pivotStatus
  return labels.value.stableStatus
})

const statusClass = computed(() => {
  if (evaluation.value.singular) return 'is-singular'
  if (evaluation.value.needsPivot) return 'needs-pivot'
  return 'is-stable'
})

function formatNumber(value: number, digits = 3) {
  if (!Number.isFinite(value)) return 'unstable'
  if (Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) return value.toExponential(2)
  return value.toFixed(digits)
}

function formatVector(vector: LuVector2) {
  return `(${formatNumber(vector[0], 2)}, ${formatNumber(vector[1], 2)})`
}
</script>

<template>
  <section class="math-lab-card lu-decomposition-lab">
    <div class="math-lab-card__visual lu-decomposition-lab__visual">
      <div class="lu-decomposition-lab__factorization" :aria-label="labels.factorization">
        <article v-for="panel in matrixPanels" :key="panel.label" class="lu-matrix-panel">
          <span>{{ panel.label }}</span>
          <div class="lu-matrix" aria-hidden="true">
            <span v-for="(row, rowIndex) in panel.rows" :key="`${panel.label}-${rowIndex}`">
              <strong v-for="(value, columnIndex) in row" :key="`${panel.label}-${rowIndex}-${columnIndex}`">
                {{ formatNumber(value, 2) }}
              </strong>
            </span>
          </div>
        </article>
      </div>

      <svg class="lu-decomposition-lab__flow" viewBox="0 0 520 170" role="img" :aria-label="labels.solveFlow">
        <defs>
          <marker id="lu-lab-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" />
          </marker>
        </defs>
        <g v-for="(vector, index) in solveVectors" :key="vector.label">
          <rect :x="26 + index * 172" y="36" width="118" height="80" rx="14" />
          <text :x="85 + index * 172" y="63" text-anchor="middle">{{ vector.label }}</text>
          <text :x="85 + index * 172" y="94" text-anchor="middle">{{ formatVector(vector.values) }}</text>
        </g>
        <line x1="150" y1="76" x2="188" y2="76" marker-end="url(#lu-lab-arrow)" />
        <line x1="322" y1="76" x2="360" y2="76" marker-end="url(#lu-lab-arrow)" />
        <text x="169" y="116" text-anchor="middle">L</text>
        <text x="341" y="116" text-anchor="middle">U</text>
      </svg>
    </div>

    <div class="math-lab-card__controls lu-decomposition-lab__controls">
      <header>
        <span>{{ labels.eyebrow }}</span>
        <strong>{{ labels.title }}</strong>
        <p>{{ labels.subtitle }}</p>
      </header>

      <div class="math-mini-controls lu-decomposition-lab__control-grid">
        <label>
          {{ labels.firstPivot }}: {{ firstPivot.toFixed(2) }}
          <input v-model.number="firstPivot" type="range" min="0.2" max="6" step="0.1" />
        </label>
        <label>
          {{ labels.lowerEntry }}: {{ lowerEntry.toFixed(2) }}
          <input v-model.number="lowerEntry" type="range" min="0" max="6" step="0.1" />
        </label>
        <label>
          {{ labels.lowerRight }}: {{ lowerRight.toFixed(2) }}
          <input v-model.number="lowerRight" type="range" min="1" max="8" step="0.1" />
        </label>
        <label>
          {{ labels.rhsBottom }}: {{ rhsBottom.toFixed(2) }}
          <input v-model.number="rhsBottom" type="range" min="1" max="12" step="0.1" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ labels.pivot }}</span>
          <strong>{{ formatNumber(evaluation.u[0][0]) }}</strong>
        </article>
        <article>
          <span>{{ labels.multiplier }}</span>
          <strong>{{ formatNumber(evaluation.multiplier) }}</strong>
        </article>
        <article>
          <span>{{ labels.schur }}</span>
          <strong>{{ formatNumber(evaluation.schurComplement) }}</strong>
        </article>
        <article>
          <span>{{ labels.determinant }}</span>
          <strong>{{ formatNumber(evaluation.determinant) }}</strong>
        </article>
        <article>
          <span>{{ labels.solution }}</span>
          <strong>{{ formatVector(evaluation.x) }}</strong>
        </article>
        <article>
          <span>{{ labels.residual }}</span>
          <strong>{{ formatNumber(evaluation.residualNorm, 2) }}</strong>
        </article>
        <article>
          <span>{{ labels.reuse }}</span>
          <strong>{{ reuseCost.speedup.toFixed(1) }}x</strong>
        </article>
      </div>

      <p class="math-lab-note lu-decomposition-lab__status" :class="statusClass">
        {{ statusText }}
      </p>
    </div>
  </section>
</template>
