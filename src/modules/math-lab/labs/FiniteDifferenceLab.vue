<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  evaluateFiniteDifference,
  evaluateLectureGradient,
  type FiniteDifferenceFunctionKind,
  type FiniteDifferenceMethod,
} from '../utils/finiteDifference'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const method = ref<FiniteDifferenceMethod>('central')
const functionKind = ref<FiniteDifferenceFunctionKind>('calibration')
const xValue = ref(0.35)
const hPower = ref(-5)

const width = 420
const height = 300
const padding = 34

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? '有限差分步长实验' : 'Finite Difference Step-Size Lab',
    subtitle: functionKind.value === 'calibration'
      ? (zh
          ? '在固定偏置残差上调节模板、b 和 h，观察割线斜率与真实误差如何变化。'
          : 'Adjust the stencil, b, and h on the fixed bias residual to watch the secant slope and true error move.')
      : (zh
          ? '调节模板、位置和步长，观察割线斜率、真实误差和梯度检查误差如何变化。'
          : 'Adjust the stencil, position, and step size to watch the secant slope, true error, and gradient-check error move.'),
    aria: zh ? '有限差分割线和切线可视化' : 'Finite difference secant and tangent visualization',
    method: zh ? '差分模板' : 'Difference stencil',
    function: zh ? '函数' : 'Function',
    x: zh ? '位置 x' : 'Position x',
    h: zh ? '步长 h' : 'Step h',
    forward: zh ? '前向差分' : 'Forward',
    backward: zh ? '后向差分' : 'Backward',
    central: zh ? '中心差分' : 'Central',
    expShift: zh ? 'f(x)=exp(x)-2' : 'f(x)=exp(x)-2',
    quadratic: zh ? 'f(x)=2x²+15x+1' : 'f(x)=2x²+15x+1',
    calibration: zh ? '偏置残差 F(b)' : 'Bias residual F(b)',
    curve: zh ? '函数曲线' : 'function curve',
    secant: zh ? '差分割线' : 'difference secant',
    tangent: zh ? '真实切线' : 'true tangent',
    approximation: zh ? '差分斜率' : 'difference slope',
    exact: zh ? '真实导数' : 'exact derivative',
    error: zh ? '绝对误差' : 'absolute error',
    roundoff: zh ? '舍入估计' : 'roundoff estimate',
    calls: zh ? '额外调用' : 'extra calls',
    gradError: zh ? '梯度检查误差' : 'gradient-check error',
    order: zh ? '截断阶' : 'truncation order',
    truncationNote: zh
      ? '步长偏大，割线窗口过宽；误差主要来自 Taylor 截断。'
      : 'The step is large, so the secant window is wide; Taylor truncation dominates.',
    balancedNote: zh
      ? '步长处在较稳定区域；比较差分梯度和自动微分结果时，可以在附近再试几档 h。'
      : 'The step is in a stable region; when comparing against autodiff, try a few neighboring h values too.',
    roundoffNote: zh
      ? '步长很小，两个函数值过于接近；相消和舍入误差可能被 1/h 放大。'
      : 'The step is tiny, so the two function values are very close; cancellation and roundoff can be amplified by 1/h.',
  }
})

const h = computed(() => 10 ** hPower.value)
const positionLabel = computed(() => functionKind.value === 'calibration'
  ? (props.locale === 'zh-CN' ? '偏置 b' : 'Bias b')
  : labels.value.x)
const positionRange = computed(() => functionKind.value === 'calibration'
  ? { min: -4, max: 4 }
  : { min: -0.8, max: 1.2 })

const evaluation = computed(() =>
  evaluateFiniteDifference({
    functionKind: functionKind.value,
    method: method.value,
    x: xValue.value,
    h: h.value,
  }),
)

const gradient = computed(() => evaluateLectureGradient(h.value, method.value))

const yBounds = computed(() => {
  const allValues = [
    ...evaluation.value.curve.map((point) => point.y),
    ...evaluation.value.stencil.map((point) => point.y),
    evaluation.value.functionValue,
    evaluation.value.functionValue - evaluation.value.exactDerivative * 0.8,
    evaluation.value.functionValue + evaluation.value.exactDerivative * 0.8,
  ]
  const min = Math.min(...allValues)
  const max = Math.max(...allValues)
  const pad = Math.max(0.2, (max - min) * 0.16)
  return { min: min - pad, max: max + pad }
})

function plotX(x: number) {
  const min = xValue.value - 1.2
  const max = xValue.value + 1.2
  return padding + ((x - min) / (max - min)) * (width - padding * 2)
}

function plotY(y: number) {
  return height - padding - ((y - yBounds.value.min) / (yBounds.value.max - yBounds.value.min)) * (height - padding * 2)
}

const curvePath = computed(() =>
  evaluation.value.curve
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${plotX(point.x)} ${plotY(point.y)}`)
    .join(' '),
)

const stencilLine = computed(() => {
  const [left, right] = evaluation.value.stencil
  if (!left || !right) return ''
  return `M ${plotX(left.x)} ${plotY(left.y)} L ${plotX(right.x)} ${plotY(right.y)}`
})

const tangentLine = computed(() => {
  const leftX = xValue.value - 0.72
  const rightX = xValue.value + 0.72
  const leftY = evaluation.value.functionValue + evaluation.value.exactDerivative * (leftX - xValue.value)
  const rightY = evaluation.value.functionValue + evaluation.value.exactDerivative * (rightX - xValue.value)
  return `M ${plotX(leftX)} ${plotY(leftY)} L ${plotX(rightX)} ${plotY(rightY)}`
})

const statusNote = computed(() => {
  if (hPower.value <= -9) return labels.value.roundoffNote
  if (hPower.value >= -2) return labels.value.truncationNote
  return labels.value.balancedNote
})

function formatNumber(value: number, digits = 4) {
  if (!Number.isFinite(value)) return 'NaN'
  if (Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)) {
    return value.toExponential(2)
  }
  return value.toFixed(digits)
}
</script>

<template>
  <section class="math-lab-card finite-difference-lab">
    <div class="math-lab-card__visual finite-difference-lab__visual">
      <svg class="finite-difference-lab__plot" viewBox="0 0 420 300" role="img" :aria-label="labels.aria">
        <line x1="34" :y1="plotY(0)" x2="386" :y2="plotY(0)" class="finite-difference-lab__axis" />
        <line :x1="plotX(xValue)" y1="34" :x2="plotX(xValue)" y2="266" class="finite-difference-lab__axis finite-difference-lab__axis--x" />
        <path :d="curvePath" class="finite-difference-lab__curve" />
        <path :d="tangentLine" class="finite-difference-lab__tangent" />
        <path :d="stencilLine" class="finite-difference-lab__secant" />
        <circle
          v-for="point in evaluation.stencil"
          :key="`${point.x}-${point.y}`"
          :cx="plotX(point.x)"
          :cy="plotY(point.y)"
          r="6.5"
          class="finite-difference-lab__sample"
        />
        <circle :cx="plotX(xValue)" :cy="plotY(evaluation.functionValue)" r="7" class="finite-difference-lab__current" />
      </svg>

      <div class="finite-difference-lab__legend" aria-hidden="true">
        <span><i class="is-curve" />{{ labels.curve }}</span>
        <span><i class="is-secant" />{{ labels.secant }}</span>
        <span><i class="is-tangent" />{{ labels.tangent }}</span>
      </div>
    </div>

    <div class="math-lab-card__controls finite-difference-lab__controls">
      <header>
        <span>{{ labels.eyebrow }}</span>
        <strong>{{ labels.title }}</strong>
        <p>{{ labels.subtitle }}</p>
      </header>

      <div class="math-mini-controls finite-difference-lab__control-grid">
        <label>
          {{ labels.method }}
          <select v-model="method">
            <option value="forward">{{ labels.forward }}</option>
            <option value="backward">{{ labels.backward }}</option>
            <option value="central">{{ labels.central }}</option>
          </select>
        </label>
        <label>
          {{ labels.function }}
          <select v-model="functionKind">
            <option value="calibration">{{ labels.calibration }}</option>
            <option value="exp-shift">{{ labels.expShift }}</option>
            <option value="quadratic">{{ labels.quadratic }}</option>
          </select>
        </label>
        <label>
          {{ positionLabel }}: {{ xValue.toFixed(2) }}
          <input v-model.number="xValue" type="range" :min="positionRange.min" :max="positionRange.max" step="0.05" />
        </label>
        <label>
          {{ labels.h }}: 1e{{ hPower }}
          <input v-model.number="hPower" type="range" min="-12" max="-1" step="1" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ labels.approximation }}</span>
          <strong>{{ formatNumber(evaluation.approximation) }}</strong>
        </article>
        <article>
          <span>{{ labels.exact }}</span>
          <strong>{{ formatNumber(evaluation.exactDerivative) }}</strong>
        </article>
        <article>
          <span>{{ labels.error }}</span>
          <strong>{{ formatNumber(evaluation.absoluteError, 5) }}</strong>
        </article>
        <article>
          <span>{{ labels.roundoff }}</span>
          <strong>{{ formatNumber(evaluation.roundingEstimate, 3) }}</strong>
        </article>
        <article>
          <span>{{ labels.calls }}</span>
          <strong>{{ evaluation.functionEvaluations }}</strong>
        </article>
        <article>
          <span>{{ labels.order }}</span>
          <strong>O(h{{ evaluation.truncationOrder === 2 ? '²' : '' }})</strong>
        </article>
        <article v-if="functionKind !== 'calibration'">
          <span>{{ labels.gradError }}</span>
          <strong>{{ formatNumber(gradient.errorNorm, 5) }}</strong>
        </article>
      </div>

      <p class="math-lab-note finite-difference-lab__status">
        {{ statusNote }}
      </p>
    </div>
  </section>
</template>
