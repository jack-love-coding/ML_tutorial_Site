<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  evaluateConditioning,
  formatConditionAngleDegrees,
  type ConditionVector2,
} from '../utils/conditionNumbers'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const columnAngle = ref(35)
const secondColumnScale = ref(1)
const perturbationPower = ref(-5)
const perturbationDirection = ref(90)
const inputDigits = ref(16)

const origin = { x: 112, y: 238 }

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? '条件数误差放大实验' : 'Condition Number Error Amplification Lab',
    subtitle: zh
      ? '用二维代理观察 Ames 设计矩阵的稳定、警告与近重复特征场景；完整条件数仍由 6 列设计矩阵计算。'
      : 'Use a 2D proxy for the stable, warning, and near-duplicate Ames design scenarios; the full condition numbers still come from the six-column design.',
    columnAngle: zh ? '两列夹角' : 'Column angle',
    secondColumnScale: zh ? '第二列尺度' : 'Second column scale',
    perturbationPower: zh ? '相对输入扰动' : 'Relative input perturbation',
    perturbationDirection: zh ? '扰动方向' : 'Perturbation direction',
    inputDigits: zh ? '输入有效数字' : 'Input digits',
    visualLabel: zh ? '矩阵把单位方形变成平行四边形，输入扰动在病态矩阵中被逆变换放大' : 'The matrix maps a unit square to a parallelogram; input perturbation is amplified by the inverse when conditioning is poor',
    columnOne: zh ? '第一列' : 'column 1',
    columnTwo: zh ? '第二列' : 'column 2',
    exactB: zh ? '原右端 b' : 'original b',
    perturbedB: zh ? '扰动后 b' : 'perturbed b',
    condition: zh ? '条件数 κ₂(A)' : 'condition κ₂(A)',
    determinant: zh ? 'det(A)' : 'det(A)',
    inputError: zh ? '相对输入误差' : 'relative input error',
    outputError: zh ? '相对解误差' : 'relative solution error',
    bound: zh ? '误差上界 κ·输入误差' : 'bound κ · input error',
    residual: zh ? '当前方程求解残差' : 'current-system solve residual',
    digits: zh ? '预计保留位数' : 'expected kept digits',
    sigmaMax: zh ? '最大奇异值' : 'largest singular value',
    sigmaMin: zh ? '最小奇异值' : 'smallest singular value',
    stablePreset: zh ? '标准化代理' : 'Standardized proxy',
    warningPreset: zh ? '警告场景' : 'Warning case',
    severePreset: zh ? '近重复列' : 'Near duplicate',
    reset: zh ? '重置' : 'Reset',
    stableNote: zh
      ? '两列方向分开，逆变换没有明显拉长扰动；小残差通常也对应较可信的解。'
      : 'The two columns are well separated, so the inverse does not stretch perturbations much; a small residual is usually more trustworthy.',
    warningNote: zh
      ? '列向量开始接近平行或尺度差异较大，右端中的小扰动已经能造成明显解误差。'
      : 'The columns are becoming nearly parallel or differently scaled; a small right-hand-side perturbation can already cause visible solution error.',
    severeNote: zh
      ? '矩阵接近奇异。残差仍可很小，但解可能已经丢失多位有效数字。'
      : 'The matrix is close to singular. The residual may remain small while the solution has already lost many useful digits.',
  }
})

const evaluation = computed(() =>
  evaluateConditioning({
    columnAngleDegrees: columnAngle.value,
    secondColumnScale: secondColumnScale.value,
    perturbationPower: perturbationPower.value,
    perturbationAngleDegrees: perturbationDirection.value,
    inputDigits: inputDigits.value,
  }),
)

const outputVectors = computed<ConditionVector2[]>(() => {
  const matrix = evaluation.value.matrix
  const columnOne: ConditionVector2 = [matrix[0][0], matrix[1][0]]
  const columnTwo: ConditionVector2 = [matrix[0][1], matrix[1][1]]
  return [
    [0, 0],
    columnOne,
    columnTwo,
    [columnOne[0] + columnTwo[0], columnOne[1] + columnTwo[1]],
    evaluation.value.exactB,
    evaluation.value.perturbedB,
  ]
})

const plotScale = computed(() => {
  const maxExtent = outputVectors.value.reduce(
    (largest, vector) => Math.max(largest, Math.abs(vector[0]), Math.abs(vector[1])),
    1,
  )
  return 104 / Math.max(1, maxExtent)
})

function point(vector: ConditionVector2) {
  return {
    x: origin.x + vector[0] * plotScale.value,
    y: origin.y - vector[1] * plotScale.value,
  }
}

const columnOnePoint = computed(() => point([evaluation.value.matrix[0][0], evaluation.value.matrix[1][0]]))
const columnTwoPoint = computed(() => point([evaluation.value.matrix[0][1], evaluation.value.matrix[1][1]]))
const exactBPoint = computed(() => point(evaluation.value.exactB))
const perturbedBPoint = computed(() => point(evaluation.value.perturbedB))
const parallelogramPoints = computed(() => {
  const [zero, columnOne, columnTwo, sum] = outputVectors.value
  return [zero, columnOne, sum, columnTwo].map((vector) => {
    const plotted = point(vector)
    return `${plotted.x},${plotted.y}`
  }).join(' ')
})

const statusClass = computed(() => {
  if (evaluation.value.conditionNumber >= 10000) return 'is-severe'
  if (evaluation.value.conditionNumber >= 100) return 'is-warning'
  return 'is-stable'
})

const statusNote = computed(() => {
  if (statusClass.value === 'is-severe') return labels.value.severeNote
  if (statusClass.value === 'is-warning') return labels.value.warningNote
  return labels.value.stableNote
})

function formatNumber(value: number, digits = 3) {
  if (!Number.isFinite(value)) return '∞'
  if (Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2)
  }
  return value.toFixed(digits)
}

function formatPercent(value: number) {
  if (value === 0) return '0%'
  if (Math.abs(value) < 0.001) return `${value.toExponential(2)}`
  return `${(value * 100).toFixed(3)}%`
}

function loadStablePreset() {
  columnAngle.value = 35
  secondColumnScale.value = 1
  perturbationPower.value = -5
  perturbationDirection.value = 90
}

function loadWarningPreset() {
  columnAngle.value = 1
  secondColumnScale.value = 1
  perturbationPower.value = -5
  perturbationDirection.value = 90
}

function loadSeverePreset() {
  columnAngle.value = 0.005
  secondColumnScale.value = 1
  perturbationPower.value = -5
  perturbationDirection.value = 90
}
</script>

<template>
  <section class="math-lab-card condition-number-lab">
    <div class="math-lab-card__visual condition-number-lab__visual">
      <svg class="condition-number-lab__plot" viewBox="0 0 420 320" role="img" :aria-label="labels.visualLabel">
        <defs>
          <marker id="condition-lab-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
          </marker>
        </defs>
        <line x1="38" :y1="origin.y" x2="374" :y2="origin.y" class="condition-number-lab__axis" />
        <line :x1="origin.x" y1="48" :x2="origin.x" y2="276" class="condition-number-lab__axis" />
        <polygon :points="parallelogramPoints" class="condition-number-lab__parallelogram" />
        <line
          :x1="origin.x"
          :y1="origin.y"
          :x2="columnOnePoint.x"
          :y2="columnOnePoint.y"
          class="condition-number-lab__vector condition-number-lab__vector--first"
          marker-end="url(#condition-lab-arrow)"
        />
        <line
          :x1="origin.x"
          :y1="origin.y"
          :x2="columnTwoPoint.x"
          :y2="columnTwoPoint.y"
          class="condition-number-lab__vector condition-number-lab__vector--second"
          marker-end="url(#condition-lab-arrow)"
        />
        <line
          :x1="origin.x"
          :y1="origin.y"
          :x2="exactBPoint.x"
          :y2="exactBPoint.y"
          class="condition-number-lab__vector condition-number-lab__vector--b"
          marker-end="url(#condition-lab-arrow)"
        />
        <line
          :x1="exactBPoint.x"
          :y1="exactBPoint.y"
          :x2="perturbedBPoint.x"
          :y2="perturbedBPoint.y"
          class="condition-number-lab__perturbation"
          marker-end="url(#condition-lab-arrow)"
        />
        <circle :cx="exactBPoint.x" :cy="exactBPoint.y" r="5.5" class="condition-number-lab__point condition-number-lab__point--exact" />
        <circle :cx="perturbedBPoint.x" :cy="perturbedBPoint.y" r="5.5" class="condition-number-lab__point condition-number-lab__point--perturbed" />
      </svg>

      <div class="condition-number-lab__legend" aria-hidden="true">
        <span><i class="is-first" />{{ labels.columnOne }}</span>
        <span><i class="is-second" />{{ labels.columnTwo }}</span>
        <span><i class="is-b" />{{ labels.exactB }}</span>
        <span><i class="is-perturbation" />{{ labels.perturbedB }}</span>
      </div>

      <div class="condition-number-lab__singular-values">
        <article>
          <span>{{ labels.sigmaMax }}</span>
          <strong>{{ formatNumber(evaluation.singularValues[0], 4) }}</strong>
        </article>
        <article>
          <span>{{ labels.sigmaMin }}</span>
          <strong>{{ formatNumber(evaluation.singularValues[1], 4) }}</strong>
        </article>
      </div>
    </div>

    <div class="math-lab-card__controls condition-number-lab__controls">
      <header>
        <span>{{ labels.eyebrow }}</span>
        <strong>{{ labels.title }}</strong>
        <p>{{ labels.subtitle }}</p>
      </header>

      <div class="math-lab-case-anchor">
        <strong>{{ locale === 'zh-CN' ? '完整 Ames 条件数' : 'Full Ames condition numbers' }}</strong>
        <span>raw X: 13044.220 · scaled X: 3.223 · near-duplicate X: 26644.503</span>
      </div>

      <div class="math-lab-preset-actions" :aria-label="locale === 'zh-CN' ? '条件数预设' : 'Conditioning presets'">
        <button type="button" @click="loadStablePreset">{{ labels.stablePreset }}</button>
        <button type="button" @click="loadWarningPreset">{{ labels.warningPreset }}</button>
        <button type="button" @click="loadSeverePreset">{{ labels.severePreset }}</button>
        <button type="button" @click="loadStablePreset">{{ labels.reset }}</button>
      </div>

      <div class="math-mini-controls condition-number-lab__control-grid">
        <label>
          {{ labels.columnAngle }}: {{ formatConditionAngleDegrees(columnAngle) }}°
          <input v-model.number="columnAngle" type="range" min="0.005" max="88" step="0.005" />
        </label>
        <label>
          {{ labels.secondColumnScale }}: {{ secondColumnScale.toFixed(2) }}
          <input v-model.number="secondColumnScale" type="range" min="0.35" max="2.4" step="0.05" />
        </label>
        <label>
          {{ labels.perturbationPower }}: 1e{{ perturbationPower }}
          <input v-model.number="perturbationPower" type="range" min="-8" max="-2" step="1" />
        </label>
        <label>
          {{ labels.perturbationDirection }}: {{ perturbationDirection.toFixed(0) }}°
          <input v-model.number="perturbationDirection" type="range" min="0" max="360" step="5" />
        </label>
        <label>
          {{ labels.inputDigits }}: {{ inputDigits }}
          <input v-model.number="inputDigits" type="range" min="6" max="16" step="1" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ labels.condition }}</span>
          <strong>{{ formatNumber(evaluation.conditionNumber, 2) }}</strong>
        </article>
        <article>
          <span>{{ labels.determinant }}</span>
          <strong>{{ formatNumber(evaluation.determinant, 4) }}</strong>
        </article>
        <article>
          <span>{{ labels.inputError }}</span>
          <strong>{{ formatPercent(evaluation.relativeInputError) }}</strong>
        </article>
        <article>
          <span>{{ labels.outputError }}</span>
          <strong>{{ formatPercent(evaluation.relativeOutputError) }}</strong>
        </article>
        <article>
          <span>{{ labels.bound }}</span>
          <strong>{{ formatPercent(evaluation.errorBound) }}</strong>
        </article>
        <article>
          <span>{{ labels.residual }}</span>
          <strong>{{ formatPercent(evaluation.relativeSolveResidual) }}</strong>
        </article>
        <article>
          <span>{{ labels.digits }}</span>
          <strong>{{ formatNumber(evaluation.expectedDigits, 1) }}</strong>
        </article>
      </div>

      <p class="math-lab-note condition-number-lab__status" :class="statusClass">
        {{ statusNote }}
      </p>
    </div>
  </section>
</template>
