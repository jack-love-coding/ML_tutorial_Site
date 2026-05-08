<script setup lang="ts">
import { computed, ref } from 'vue'
import MarkdownMathContent from '../../../components/MarkdownMathContent.vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  evaluateTaylorApproximation,
  evaluateTaylorFunction,
  evaluateTaylorPolynomial,
  taylorFunctionDefinitions,
  type TaylorFunctionKey,
} from '../utils/taylorSeries'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const functionKey = ref<TaylorFunctionKey>('sin')
const degree = ref(5)
const center = ref(0)
const xValue = ref(0.9)
const showError = ref(true)
const showRemainder = ref(true)

const plot = {
  width: 560,
  height: 320,
  paddingX: 44,
  paddingY: 30,
  xMin: -2.5,
  xMax: 2.5,
}

const copy = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    kicker: zh ? '交互实验' : 'Interactive lab',
    title: zh ? 'Taylor 局部近似实验' : 'Taylor local approximation lab',
    body: zh
      ? '切换函数、中心点和阶数，观察近似最可靠的区域如何围绕中心移动。'
      : 'Switch the function, center, and degree to see where the approximation is most reliable.',
    function: zh ? '函数' : 'Function',
    center: zh ? '中心 a' : 'Center a',
    degree: zh ? '阶数 n' : 'Degree n',
    point: zh ? '观察点 x' : 'Point x',
    actual: zh ? 'f(x)' : 'f(x)',
    approximation: zh ? 'Tn(x)' : 'Tn(x)',
    absoluteError: zh ? '绝对误差' : 'Absolute error',
    nextTerm: zh ? '下一项估计' : 'Next-term estimate',
    errorBound: zh ? '可用误差界' : 'Available bound',
    originalCurve: zh ? '原函数' : 'Function',
    taylorCurve: zh ? 'Taylor 多项式' : 'Taylor polynomial',
    centerMarker: zh ? '中心' : 'Center',
    errorLine: zh ? '误差线' : 'Error line',
    showError: zh ? '显示误差线' : 'Show error line',
    showRemainder: zh ? '显示余项读数' : 'Show remainder readout',
    formulaIntro: zh ? '当前多项式' : 'Current polynomial',
  }
})

const functionOptions = computed(() =>
  taylorFunctionDefinitions.map((definition) => ({
    ...definition,
    label: props.locale === 'zh-CN'
      ? definition.key === 'exp'
        ? '指数函数 exp(x)'
        : definition.key === 'sin'
          ? '正弦函数 sin(x)'
          : '余弦函数 cos(x)'
      : definition.label,
  })),
)

const evaluation = computed(() =>
  evaluateTaylorApproximation(functionKey.value, xValue.value, center.value, degree.value),
)

const sampleValues = computed(() => {
  const count = 140
  return Array.from({ length: count + 1 }, (_, index) => {
    const x = plot.xMin + ((plot.xMax - plot.xMin) * index) / count
    return {
      x,
      actual: evaluateTaylorFunction(functionKey.value, x),
      approximation: evaluateTaylorPolynomial(functionKey.value, x, center.value, degree.value),
    }
  })
})

const yRange = computed(() => {
  const values = sampleValues.value.flatMap((point) => [point.actual, point.approximation]).filter(Number.isFinite)
  values.push(0, evaluation.value.actual, evaluation.value.approximation)
  const rawMin = Math.min(...values)
  const rawMax = Math.max(...values)
  const span = Math.max(rawMax - rawMin, 1.5)
  const padding = span * 0.12
  return {
    min: rawMin - padding,
    max: rawMax + padding,
  }
})

function mapX(x: number) {
  const innerWidth = plot.width - plot.paddingX * 2
  return plot.paddingX + ((x - plot.xMin) / (plot.xMax - plot.xMin)) * innerWidth
}

function mapY(y: number) {
  const innerHeight = plot.height - plot.paddingY * 2
  return plot.paddingY + ((yRange.value.max - y) / (yRange.value.max - yRange.value.min)) * innerHeight
}

function pointString(kind: 'actual' | 'approximation') {
  return sampleValues.value
    .map((point) => `${mapX(point.x).toFixed(2)},${mapY(point[kind]).toFixed(2)}`)
    .join(' ')
}

function formatNumber(value: number) {
  const absolute = Math.abs(value)
  if (absolute === 0) return '0'
  if (absolute < 0.001 || absolute >= 10000) return value.toExponential(2)
  return value.toFixed(5)
}

const centerWindow = computed(() => {
  const radius = 0.65
  const left = Math.max(plot.xMin, center.value - radius)
  const right = Math.min(plot.xMax, center.value + radius)
  return {
    x: mapX(left),
    width: Math.max(0, mapX(right) - mapX(left)),
  }
})

const xMarker = computed(() => ({
  x: mapX(xValue.value),
  actualY: mapY(evaluation.value.actual),
  approximationY: mapY(evaluation.value.approximation),
}))

const centerMarker = computed(() => ({
  x: mapX(center.value),
  y: mapY(evaluateTaylorFunction(functionKey.value, center.value)),
}))

const axis = computed(() => ({
  y: mapY(0),
  x: mapX(0),
}))

const formula = computed(() => {
  const centerLabel = center.value < 0 ? `+${Math.abs(center.value).toFixed(2)}` : `-${center.value.toFixed(2)}`
  return `$$T_${degree.value}(x)=\\sum_{k=0}^{${degree.value}}\\frac{f^{(k)}(${center.value.toFixed(2)})}{k!}(x${centerLabel})^k$$`
})
</script>

<template>
  <section class="math-lab-card taylor-series-lab">
    <div class="taylor-series-lab__visual">
      <svg class="taylor-series-lab__plot" :viewBox="`0 0 ${plot.width} ${plot.height}`" role="img">
        <rect
          class="taylor-series-lab__local-window"
          :x="centerWindow.x"
          :width="centerWindow.width"
          :y="plot.paddingY"
          :height="plot.height - plot.paddingY * 2"
        />
        <line
          class="taylor-series-lab__axis"
          :x1="plot.paddingX"
          :x2="plot.width - plot.paddingX"
          :y1="axis.y"
          :y2="axis.y"
        />
        <line
          class="taylor-series-lab__axis"
          :x1="axis.x"
          :x2="axis.x"
          :y1="plot.paddingY"
          :y2="plot.height - plot.paddingY"
        />
        <polyline class="taylor-series-lab__curve taylor-series-lab__curve--actual" :points="pointString('actual')" />
        <polyline
          class="taylor-series-lab__curve taylor-series-lab__curve--approximation"
          :points="pointString('approximation')"
        />
        <line
          v-if="showError"
          class="taylor-series-lab__error-line"
          :x1="xMarker.x"
          :x2="xMarker.x"
          :y1="xMarker.actualY"
          :y2="xMarker.approximationY"
        />
        <circle class="taylor-series-lab__center-dot" :cx="centerMarker.x" :cy="centerMarker.y" r="6" />
        <circle class="taylor-series-lab__sample-dot" :cx="xMarker.x" :cy="xMarker.actualY" r="5" />
        <circle class="taylor-series-lab__approx-dot" :cx="xMarker.x" :cy="xMarker.approximationY" r="5" />
      </svg>

      <div class="taylor-series-lab__legend" aria-hidden="true">
        <span><i class="is-actual" />{{ copy.originalCurve }}</span>
        <span><i class="is-approximation" />{{ copy.taylorCurve }}</span>
        <span><i class="is-center" />{{ copy.centerMarker }}</span>
        <span v-if="showError"><i class="is-error" />{{ copy.errorLine }}</span>
      </div>
    </div>

    <div class="math-lab-card__controls taylor-series-lab__controls">
      <header>
        <span>{{ copy.kicker }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.body }}</p>
      </header>

      <div class="taylor-series-lab__control-grid">
        <label>
          {{ copy.function }}
          <select v-model="functionKey">
            <option v-for="option in functionOptions" :key="option.key" :value="option.key">
              {{ option.label }}
            </option>
          </select>
        </label>

        <label>
          {{ copy.center }}: {{ center.toFixed(2) }}
          <input v-model.number="center" type="range" min="-1.5" max="1.5" step="0.05" />
        </label>

        <label>
          {{ copy.degree }}: {{ degree }}
          <input v-model.number="degree" type="range" min="0" max="9" step="1" />
        </label>

        <label>
          {{ copy.point }}: {{ xValue.toFixed(2) }}
          <input v-model.number="xValue" type="range" min="-2.25" max="2.25" step="0.05" />
        </label>
      </div>

      <div class="taylor-series-lab__toggles">
        <label>
          <input v-model="showError" type="checkbox" />
          {{ copy.showError }}
        </label>
        <label>
          <input v-model="showRemainder" type="checkbox" />
          {{ copy.showRemainder }}
        </label>
      </div>

      <div class="math-readout-grid taylor-series-lab__readouts">
        <article>
          <span>{{ copy.actual }}</span>
          <strong>{{ formatNumber(evaluation.actual) }}</strong>
        </article>
        <article>
          <span>{{ copy.approximation }}</span>
          <strong>{{ formatNumber(evaluation.approximation) }}</strong>
        </article>
        <article>
          <span>{{ copy.absoluteError }}</span>
          <strong>{{ formatNumber(evaluation.error) }}</strong>
        </article>
        <article v-if="showRemainder">
          <span>{{ copy.nextTerm }}</span>
          <strong>{{ formatNumber(evaluation.nextTermEstimate) }}</strong>
        </article>
        <article v-if="showRemainder">
          <span>{{ copy.errorBound }}</span>
          <strong>{{ formatNumber(evaluation.remainderBound) }}</strong>
        </article>
      </div>

      <div class="taylor-series-lab__formula">
        <span>{{ copy.formulaIntro }}</span>
        <MarkdownMathContent :source="formula" />
      </div>
    </div>
  </section>
</template>
