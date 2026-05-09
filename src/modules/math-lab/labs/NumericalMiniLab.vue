<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale, MathLabModuleId } from '../types/mathLab'
import { evaluatePowerIteration, type EigenPowerMatrixKind } from '../utils/eigenPower'

const props = defineProps<{
  moduleId: MathLabModuleId
  locale: MathLabLocale
}>()

type LabKind = 'taylor' | 'monteCarlo' | 'lu' | 'power' | 'leastSquares' | 'pca' | 'generic'

const degree = ref(5)
const xValue = ref(0.9)
const sampleCount = ref(600)
const luA22 = ref(5)
const iterations = ref(6)
const eigenMatrixKind = ref<EigenPowerMatrixKind>('well-separated')
const initialAngle = ref(35)
const slope = ref(0.72)
const componentCount = ref(1)

const labKind = computed<LabKind>(() => {
  if (props.moduleId === 'taylor-series') return 'taylor'
  if (props.moduleId === 'monte-carlo') return 'monteCarlo'
  if (props.moduleId === 'lu-decomposition') return 'lu'
  if (props.moduleId === 'eigenvalues-eigenvectors') return 'power'
  if (props.moduleId === 'least-squares-fitting') return 'leastSquares'
  if (props.moduleId === 'svd' || props.moduleId === 'pca') return 'pca'
  return 'generic'
})

const copy = computed(() => {
  const zh = props.locale === 'zh-CN'
  const labels = {
    taylor: [
      zh ? '泰勒近似阶数' : 'Taylor degree',
      zh ? '用有限项近似 sin(x)，观察误差如何随阶数和位置变化。' : 'Approximate sin(x) with finite terms and watch the error change with degree and position.',
    ],
    monteCarlo: [
      zh ? '蒙特卡洛采样' : 'Monte Carlo sampling',
      zh ? '用单位正方形里的随机点估计 pi，样本越多波动越小。' : 'Estimate pi with points in a unit square; more samples reduce variance.',
    ],
    lu: [
      zh ? 'LU 两步求解' : 'Two-step LU solve',
      zh ? '固定矩阵的三个元素，改变 a22，观察主元和解如何变化。' : 'Hold three entries fixed, change a22, and watch the pivot and solution move.',
    ],
    power: [
      zh ? '幂迭代主方向' : 'Power iteration direction',
      zh ? '反复乘矩阵并归一化，逐步靠近主特征向量。' : 'Repeatedly multiply by a matrix and normalize to approach the dominant eigenvector.',
    ],
    leastSquares: [
      zh ? '最小二乘残差' : 'Least-squares residual',
      zh ? '移动斜率，观察残差平方和如何变化。' : 'Move the slope and watch the sum of squared residuals change.',
    ],
    pca: [
      zh ? '主方向保留信息' : 'Principal directions retain information',
      zh ? '保留更多奇异值或主成分时，解释方差会上升。' : 'Explained variance rises as more singular values or principal components are kept.',
    ],
    generic: [
      zh ? '数值直觉检查' : 'Numerical intuition check',
      zh ? '用一个短实验把公式、代码和模型直觉连起来。' : 'Use a short lab to connect formulas, code, and model intuition.',
    ],
  } satisfies Record<LabKind, [string, string]>
  return labels[labKind.value]
})

function factorial(n: number) {
  return Array.from({ length: Math.max(n, 1) }, (_, index) => index + 1).reduce((acc, value) => acc * value, 1)
}

function taylorSin(x: number, maxDegree: number) {
  let total = 0
  for (let k = 0; k <= Math.floor(maxDegree / 2); k += 1) {
    const power = 2 * k + 1
    if (power > maxDegree) break
    total += ((-1) ** k * x ** power) / factorial(power)
  }
  return total
}

const taylor = computed(() => {
  const approx = taylorSin(xValue.value, degree.value)
  const actual = Math.sin(xValue.value)
  return {
    approx,
    actual,
    error: Math.abs(actual - approx),
    points: Array.from({ length: 11 }, (_, index) => {
      const x = -1.5 + index * 0.3
      return {
        x: 40 + index * 26,
        actualY: 90 - Math.sin(x) * 54,
        approxY: 90 - taylorSin(x, degree.value) * 54,
      }
    }),
  }
})

function pseudoRandom(index: number) {
  const value = Math.sin(index * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

const monteCarlo = computed(() => {
  const visible = 90
  let inside = 0
  const points = Array.from({ length: visible }, (_, index) => {
    const x = pseudoRandom(index + 1)
    const y = pseudoRandom(index + 101)
    if (x * x + y * y <= 1) inside += 1
    return { x: 28 + x * 220, y: 248 - y * 220, inside: x * x + y * y <= 1 }
  })

  let totalInside = 0
  for (let index = 0; index < sampleCount.value; index += 1) {
    const x = pseudoRandom(index + 1)
    const y = pseudoRandom(index + 101)
    if (x * x + y * y <= 1) totalInside += 1
  }

  return {
    points,
    estimate: (4 * totalInside) / sampleCount.value,
    error: Math.abs(Math.PI - (4 * totalInside) / sampleCount.value),
  }
})

const lu = computed(() => {
  const l21 = 3 / 4
  const u22 = luA22.value - l21 * 2
  const y2 = 7 - l21 * 6
  const x2 = y2 / u22
  const x1 = (6 - 2 * x2) / 4
  return {
    u22,
    det: 4 * luA22.value - 6,
    x1,
    x2,
  }
})

const powerIteration = computed(() => {
  const evaluation = evaluatePowerIteration({
    matrixKind: eigenMatrixKind.value,
    iterations: iterations.value,
    initialAngleRadians: (initialAngle.value * Math.PI) / 180,
  })

  return {
    ...evaluation,
    path: evaluation.iterates.map((vector) => ({
      x: 140 + vector[0] * 82,
      y: 140 - vector[1] * 82,
    })),
    dominantLine: {
      x1: 140 - evaluation.dominantEigenvector[0] * 92,
      y1: 140 + evaluation.dominantEigenvector[1] * 92,
      x2: 140 + evaluation.dominantEigenvector[0] * 92,
      y2: 140 - evaluation.dominantEigenvector[1] * 92,
    },
  }
})

const leastSquares = computed(() => {
  const points = [
    { x: 42, y: 188, dataX: 0, dataY: 1.2 },
    { x: 96, y: 146, dataX: 1, dataY: 1.95 },
    { x: 150, y: 122, dataX: 2, dataY: 2.35 },
    { x: 204, y: 78, dataX: 3, dataY: 3.25 },
  ]
  const intercept = 1.12
  const residual = points.reduce((acc, point) => {
    const prediction = intercept + slope.value * point.dataX
    return acc + (point.dataY - prediction) ** 2
  }, 0)
  return {
    points,
    residual,
    lineStart: { x: 32, y: 220 - intercept * 42 },
    lineEnd: { x: 236, y: 220 - (intercept + slope.value * 3.8) * 42 },
  }
})

const pca = computed(() => {
  const singularValues = props.moduleId === 'svd' ? [8.4, 3.2, 0.9] : [6.2, 2.1, 0.55]
  const total = singularValues.reduce((acc, value) => acc + value ** 2, 0)
  const retained = singularValues
    .slice(0, componentCount.value)
    .reduce((acc, value) => acc + value ** 2, 0)
  return {
    singularValues,
    explained: retained / total,
  }
})
</script>

<template>
  <section class="math-lab-card numerical-mini-lab">
    <div class="math-lab-card__visual">
      <svg v-if="labKind === 'taylor'" class="numerical-lab-svg" viewBox="0 0 320 180" role="img">
        <polyline
          fill="none"
          stroke="#3868ff"
          stroke-width="4"
          :points="taylor.points.map((point) => `${point.x},${point.actualY}`).join(' ')"
        />
        <polyline
          fill="none"
          stroke="#e26d3d"
          stroke-width="4"
          stroke-dasharray="8 7"
          :points="taylor.points.map((point) => `${point.x},${point.approxY}`).join(' ')"
        />
        <line x1="34" y1="90" x2="286" y2="90" />
      </svg>

      <svg v-else-if="labKind === 'monteCarlo'" class="numerical-lab-svg" viewBox="0 0 280 280" role="img">
        <rect x="28" y="28" width="220" height="220" rx="10" />
        <path d="M28 248 A220 220 0 0 1 248 28" />
        <circle
          v-for="(point, index) in monteCarlo.points"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="3.3"
          :class="{ 'is-inside': point.inside }"
        />
      </svg>

      <svg v-else-if="labKind === 'power'" class="numerical-lab-svg" viewBox="0 0 280 280" role="img">
        <line x1="24" y1="140" x2="256" y2="140" class="power-axis" />
        <line x1="140" y1="24" x2="140" y2="256" class="power-axis" />
        <circle cx="140" cy="140" r="88" />
        <line
          :x1="powerIteration.dominantLine.x1"
          :y1="powerIteration.dominantLine.y1"
          :x2="powerIteration.dominantLine.x2"
          :y2="powerIteration.dominantLine.y2"
          class="power-dominant-line"
        />
        <polyline
          fill="none"
          stroke="#3868ff"
          stroke-width="4"
          :points="powerIteration.path.map((point) => `${point.x},${point.y}`).join(' ')"
        />
        <line
          x1="140"
          y1="140"
          :x2="140 + powerIteration.vector[0] * 90"
          :y2="140 - powerIteration.vector[1] * 90"
          class="power-current-vector"
        />
      </svg>

      <svg v-else-if="labKind === 'leastSquares'" class="numerical-lab-svg" viewBox="0 0 280 240" role="img">
        <line
          :x1="leastSquares.lineStart.x"
          :y1="leastSquares.lineStart.y"
          :x2="leastSquares.lineEnd.x"
          :y2="leastSquares.lineEnd.y"
        />
        <circle v-for="point in leastSquares.points" :key="point.x" :cx="point.x" :cy="point.y" r="7" />
      </svg>

      <svg v-else-if="labKind === 'pca'" class="numerical-lab-svg" viewBox="0 0 300 210" role="img">
        <rect
          v-for="(value, index) in pca.singularValues"
          :key="value"
          :x="54 + index * 68"
          :y="170 - value * 14"
          width="42"
          :height="value * 14"
          :class="{ 'is-retained': index < componentCount }"
        />
      </svg>

      <div v-else class="numerical-lab-generic">
        <span>{{ locale === 'zh-CN' ? '直觉实验' : 'Intuition lab' }}</span>
        <strong>{{ locale === 'zh-CN' ? '公式 + 代码 + 模型连接' : 'Formula + code + model link' }}</strong>
      </div>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ locale === 'zh-CN' ? '互动实验' : 'Interactive lab' }}</span>
        <strong>{{ copy[0] }}</strong>
        <p>{{ copy[1] }}</p>
      </header>

      <div v-if="labKind === 'taylor'" class="math-mini-controls">
        <label>
          {{ locale === 'zh-CN' ? '阶数' : 'Degree' }}: {{ degree }}
          <input v-model.number="degree" type="range" min="1" max="11" step="2" />
        </label>
        <label>
          x: {{ xValue.toFixed(2) }}
          <input v-model.number="xValue" type="range" min="-1.5" max="1.5" step="0.05" />
        </label>
        <div class="math-readout-grid">
          <article><span>approx</span><strong>{{ taylor.approx.toFixed(5) }}</strong></article>
          <article><span>error</span><strong>{{ taylor.error.toExponential(2) }}</strong></article>
        </div>
      </div>

      <div v-else-if="labKind === 'monteCarlo'" class="math-mini-controls">
        <label>
          {{ locale === 'zh-CN' ? '样本数' : 'Samples' }}: {{ sampleCount }}
          <input v-model.number="sampleCount" type="range" min="100" max="4000" step="100" />
        </label>
        <div class="math-readout-grid">
          <article><span>pi</span><strong>{{ monteCarlo.estimate.toFixed(4) }}</strong></article>
          <article><span>error</span><strong>{{ monteCarlo.error.toFixed(4) }}</strong></article>
        </div>
      </div>

      <div v-else-if="labKind === 'lu'" class="math-mini-controls">
        <label>
          a22: {{ luA22.toFixed(2) }}
          <input v-model.number="luA22" type="range" min="2" max="8" step="0.1" />
        </label>
        <div class="math-readout-grid">
          <article><span>U22</span><strong>{{ lu.u22.toFixed(3) }}</strong></article>
          <article><span>x</span><strong>({{ lu.x1.toFixed(2) }}, {{ lu.x2.toFixed(2) }})</strong></article>
        </div>
      </div>

      <div v-else-if="labKind === 'power'" class="math-mini-controls">
        <label>
          {{ locale === 'zh-CN' ? '矩阵类型' : 'Matrix type' }}
          <select v-model="eigenMatrixKind">
            <option value="well-separated">
              {{ locale === 'zh-CN' ? '谱间隔清晰' : 'Clear spectral gap' }}
            </option>
            <option value="slow-gap">
              {{ locale === 'zh-CN' ? '谱间隔较小' : 'Small spectral gap' }}
            </option>
            <option value="sign-flip">
              {{ locale === 'zh-CN' ? '负主特征值' : 'Negative dominant value' }}
            </option>
          </select>
        </label>
        <label>
          {{ locale === 'zh-CN' ? '迭代次数' : 'Iterations' }}: {{ iterations }}
          <input v-model.number="iterations" type="range" min="1" max="14" />
        </label>
        <label>
          {{ locale === 'zh-CN' ? '初始方向' : 'Initial direction' }}:
          {{ initialAngle }}{{ locale === 'zh-CN' ? ' 度' : ' deg' }}
          <input v-model.number="initialAngle" type="range" min="-170" max="170" step="5" />
        </label>
        <div class="math-readout-grid">
          <article><span>lambda</span><strong>{{ powerIteration.rayleighQuotient.toFixed(4) }}</strong></article>
          <article><span>vector</span><strong>{{ powerIteration.vector.map((value) => value.toFixed(2)).join(', ') }}</strong></article>
          <article><span>ratio</span><strong>{{ powerIteration.spectralRatio.toFixed(3) }}</strong></article>
          <article><span>residual</span><strong>{{ powerIteration.residualNorm.toExponential(2) }}</strong></article>
        </div>
      </div>

      <div v-else-if="labKind === 'leastSquares'" class="math-mini-controls">
        <label>
          {{ locale === 'zh-CN' ? '斜率' : 'Slope' }}: {{ slope.toFixed(2) }}
          <input v-model.number="slope" type="range" min="0.2" max="1.2" step="0.02" />
        </label>
        <div class="math-readout-grid">
          <article><span>residual</span><strong>{{ leastSquares.residual.toFixed(4) }}</strong></article>
        </div>
      </div>

      <div v-else-if="labKind === 'pca'" class="math-mini-controls">
        <label>
          {{ locale === 'zh-CN' ? '保留成分' : 'Kept components' }}: {{ componentCount }}
          <input v-model.number="componentCount" type="range" min="1" max="3" />
        </label>
        <div class="math-readout-grid">
          <article><span>explained</span><strong>{{ (pca.explained * 100).toFixed(1) }}%</strong></article>
        </div>
      </div>
    </div>
  </section>
</template>
