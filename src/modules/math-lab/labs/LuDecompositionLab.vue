<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { estimateLuReuseCost, evaluateLup2x2, type LuMatrix2x2, type LuVector2 } from '../utils/luDecomposition'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const firstPivot = ref(1)
const upperEntry = ref(0.57)
const lowerEntry = ref(0.57)
const lowerRight = ref(1)
const rhsTop = ref(63.93)
const rhsBottom = ref(56.95)
const uiEpsilon = 0.08

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? 'Ames Gram 子系统：LUP 两步求解' : 'Ames Gram subsystem: two-step LUP solve',
    subtitle: zh
      ? '从标准化 Ames 设计矩阵的 2×2 子块开始，调节元素并观察真实换行、消元乘子、Schur 补、解和残差。完整 Notebook 求解同一案例的 6×6 系统。'
      : 'Start from a 2×2 block of the standardized Ames design, then adjust entries to observe real row swaps, the multiplier, Schur complement, solution, and residual. The Notebook solves the full 6×6 system.',
    firstPivot: zh ? '第一主元 a11' : 'First pivot a11',
    upperEntry: zh ? '右上元素 a12' : 'Upper entry a12',
    lowerEntry: zh ? '下方元素 a21' : 'Lower entry a21',
    lowerRight: zh ? '右下元素 a22' : 'Lower-right entry a22',
    rhsTop: zh ? '右端项 b1' : 'Right-hand side b1',
    rhsBottom: zh ? '右端项 b2' : 'Right-hand side b2',
    matrixA: zh ? '原矩阵 A' : 'Original matrix A',
    matrixPA: zh ? '换行后的 PA' : 'Row-permuted PA',
    matrixL: zh ? '下三角 L' : 'Lower triangular L',
    matrixU: zh ? '上三角 U' : 'Upper triangular U',
    factorization: zh ? '分解读法' : 'Factorization view',
    solveFlow: zh ? '求解流' : 'Solve flow',
    rhs: zh ? '置换后 Pb' : 'permuted Pb',
    forward: zh ? '前代得到 y' : 'forward solve gives y',
    back: zh ? '回代得到 x' : 'back solve gives x',
    pivot: zh ? '主元' : 'pivot',
    multiplier: zh ? '消元乘子' : 'multiplier',
    schur: zh ? 'Schur 补' : 'Schur complement',
    determinant: zh ? 'det(A)' : 'det(A)',
    solution: zh ? '解 x' : 'solution x',
    residual: zh ? '残差范数' : 'residual norm',
    reuse: zh ? '2 个 Ames 目标复用收益' : 'reuse gain for 2 Ames targets',
    amesPreset: zh ? 'Ames 子块' : 'Ames block',
    pivotPreset: zh ? '需要换行' : 'Needs row swap',
    singularPreset: zh ? '接近奇异' : 'Near singular',
    reset: zh ? '重置' : 'Reset',
    stableStatus: zh
      ? '当前主元和 Schur 补都远离 0，可以先解 Ly=b，再解 Ux=y。'
      : 'Both the pivot and Schur complement are away from 0, so solve Ly=b first and then Ux=y.',
    pivotStatus: zh
      ? 'a21 比 a11 更大：本实验已经交换两行，并按 PA=LU 与 Pb 完成求解。'
      : 'a21 is larger than a11: this lab has swapped the rows and solved with PA=LU and Pb.',
    singularStatus: zh
      ? '第二个主元接近 0，回代会极度敏感；这时需要换行或判断矩阵是否接近奇异。'
      : 'The second pivot is near 0, so back substitution is highly sensitive; pivoting or a singularity check is needed.',
  }
})

const evaluation = computed(() =>
  evaluateLup2x2({
    a11: firstPivot.value,
    a12: upperEntry.value,
    a21: lowerEntry.value,
    a22: lowerRight.value,
    b1: rhsTop.value,
    b2: rhsBottom.value,
  }, uiEpsilon),
)

const reuseCost = computed(() => estimateLuReuseCost(6, 2))

const matrixPanels = computed<Array<{ label: string, rows: LuMatrix2x2 }>>(() => [
  { label: labels.value.matrixA, rows: evaluation.value.matrix },
  ...(evaluation.value.pivoted ? [{ label: labels.value.matrixPA, rows: evaluation.value.permutedMatrix }] : []),
  { label: labels.value.matrixL, rows: evaluation.value.l },
  { label: labels.value.matrixU, rows: evaluation.value.u },
])

const solveVectors = computed<Array<{ label: string, values: LuVector2 }>>(() => [
  { label: labels.value.rhs, values: evaluation.value.permutedRhs },
  { label: labels.value.forward, values: evaluation.value.y },
  { label: labels.value.back, values: evaluation.value.x },
])

const solveFlowAriaLabel = computed(() => [
  labels.value.solveFlow,
  ...solveVectors.value.map(({ label, values }) => `${label}: ${formatVector(values)}`),
].join('. '))

function matrixAriaLabel(label: string, rows: LuMatrix2x2) {
  return `${label}: ${rows.map((row) => formatVector(row)).join('; ')}`
}

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

function loadAmesPreset() {
  firstPivot.value = 1
  upperEntry.value = 0.57
  lowerEntry.value = 0.57
  lowerRight.value = 1
  rhsTop.value = 63.93
  rhsBottom.value = 56.95
}

function loadPivotPreset() {
  firstPivot.value = 0.2
  upperEntry.value = 1
  lowerEntry.value = 2
  lowerRight.value = 1
  rhsTop.value = 1
  rhsBottom.value = 2
}

function loadSingularPreset() {
  firstPivot.value = 1
  upperEntry.value = 1
  lowerEntry.value = 1
  lowerRight.value = 1.02
  rhsTop.value = 2
  rhsBottom.value = 2.01
}
</script>

<template>
  <section class="math-lab-card lu-decomposition-lab">
    <div class="math-lab-card__visual lu-decomposition-lab__visual">
      <div class="lu-decomposition-lab__factorization" :aria-label="labels.factorization">
        <article v-for="panel in matrixPanels" :key="panel.label" class="lu-matrix-panel">
          <span>{{ panel.label }}</span>
          <div class="lu-matrix" role="table" :aria-label="matrixAriaLabel(panel.label, panel.rows)">
            <span v-for="(row, rowIndex) in panel.rows" :key="`${panel.label}-${rowIndex}`" role="row">
              <strong v-for="(value, columnIndex) in row" :key="`${panel.label}-${rowIndex}-${columnIndex}`" role="cell">
                {{ formatNumber(value, 2) }}
              </strong>
            </span>
          </div>
        </article>
      </div>

      <svg class="lu-decomposition-lab__flow" viewBox="0 0 520 170" role="img" :aria-label="solveFlowAriaLabel">
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

      <div class="math-lab-case-anchor">
        <strong>{{ locale === 'zh-CN' ? '完整 Ames 系统' : 'Full Ames system' }}</strong>
        <span>G: 6 × 6 · ||PG − LU||∞ = 4.547e-13 · ||Gβ − c||∞ = 1.455e-11</span>
      </div>

      <div class="math-lab-preset-actions" :aria-label="locale === 'zh-CN' ? '矩阵预设' : 'Matrix presets'">
        <button type="button" @click="loadAmesPreset">{{ labels.amesPreset }}</button>
        <button type="button" @click="loadPivotPreset">{{ labels.pivotPreset }}</button>
        <button type="button" @click="loadSingularPreset">{{ labels.singularPreset }}</button>
        <button type="button" @click="loadAmesPreset">{{ labels.reset }}</button>
      </div>

      <div class="math-mini-controls lu-decomposition-lab__control-grid">
        <label>
          {{ labels.firstPivot }}: {{ firstPivot.toFixed(2) }}
          <input v-model.number="firstPivot" type="range" min="0.05" max="6" step="0.05" />
        </label>
        <label>
          {{ labels.upperEntry }}: {{ upperEntry.toFixed(2) }}
          <input v-model.number="upperEntry" type="range" min="-2" max="2" step="0.05" />
        </label>
        <label>
          {{ labels.lowerEntry }}: {{ lowerEntry.toFixed(2) }}
          <input v-model.number="lowerEntry" type="range" min="-2" max="6" step="0.05" />
        </label>
        <label>
          {{ labels.lowerRight }}: {{ lowerRight.toFixed(2) }}
          <input v-model.number="lowerRight" type="range" min="-2" max="8" step="0.05" />
        </label>
        <label>
          {{ labels.rhsTop }}: {{ rhsTop.toFixed(2) }}
          <input v-model.number="rhsTop" type="range" min="-80" max="80" step="0.1" />
        </label>
        <label>
          {{ labels.rhsBottom }}: {{ rhsBottom.toFixed(2) }}
          <input v-model.number="rhsBottom" type="range" min="-80" max="80" step="0.1" />
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
