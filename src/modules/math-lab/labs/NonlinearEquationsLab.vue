<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  evaluateNonlinearRootFinding,
  nonlinearFunctionDefinitions,
  type NonlinearFunctionKind,
  type RootIterationPoint,
} from '../utils/nonlinearEquations'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const functionKind = ref<NonlinearFunctionKind>('cubic')
const iterations = ref(5)
const newtonStart = ref(1)
const secantPrevious = ref(2)

const plot = {
  left: 36,
  right: 384,
  top: 30,
  bottom: 256,
}

const functionOptions: NonlinearFunctionKind[] = ['cubic', 'cosine', 'flat']

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? '一维求根方法对比' : '1D Root-Finding Comparison',
    subtitle: zh
      ? '切换函数并调节初始点，比较二分法、Newton 法和割线法的收敛速度、残差和失败风险。'
      : 'Switch functions and adjust starting points to compare bisection, Newton, and secant convergence speed, residuals, and failure risks.',
    function: zh ? '函数' : 'Function',
    iterations: zh ? '迭代次数' : 'Iterations',
    newtonStart: zh ? 'Newton / 割线当前点' : 'Newton / secant current point',
    secantPrevious: zh ? '割线前一点' : 'Secant previous point',
    trueRoot: zh ? '参考根' : 'reference root',
    bisection: zh ? '二分法' : 'Bisection',
    newton: zh ? 'Newton 法' : 'Newton',
    secant: zh ? '割线法' : 'Secant',
    residual: zh ? '残差' : 'residual',
    intervalWidth: zh ? '区间宽度' : 'interval width',
    evaluations: zh ? '函数求值' : 'function evals',
    lastStep: zh ? '上一步长度' : 'last step',
    approximation: zh ? '近似根' : 'approximation',
    bisectionLegend: zh ? '二分区间' : 'bisection interval',
    newtonLegend: zh ? 'Newton 迭代' : 'Newton iterates',
    secantLegend: zh ? '割线迭代' : 'secant iterates',
    curveLegend: zh ? '函数曲线' : 'function curve',
    stableNote: zh
      ? '二分法只要初始区间两端异号就会稳定缩小区间；Newton 和割线法通常更快，但依赖局部形状和初始点。'
      : 'Bisection steadily shrinks a sign-changing bracket; Newton and secant are usually faster, but depend on local shape and starting points.',
    flatNote: zh
      ? '这个函数在根附近导数趋近 0。Newton 法不再表现出典型二次收敛，残差下降会明显变慢。'
      : 'This function has a derivative tending to zero near the root. Newton no longer shows typical quadratic convergence, and residuals fall slowly.',
    failureNote: zh
      ? '当前初始点让某个开放方法停滞或发散。实际数值库常把 Newton / 割线法与区间保护或阻尼策略结合。'
      : 'The current starting points make an open method stall or diverge. Production solvers often combine Newton or secant steps with bracketing or damping.',
  }
})

const definition = computed(() => nonlinearFunctionDefinitions[functionKind.value])

const evaluation = computed(() =>
  evaluateNonlinearRootFinding({
    functionKind: functionKind.value,
    iterations: iterations.value,
    newtonStart: newtonStart.value,
    secantPrevious: secantPrevious.value,
  }),
)

const curveSamples = computed(() => {
  const [xmin, xmax] = definition.value.domain
  return Array.from({ length: 150 }, (_, index) => {
    const x = xmin + ((xmax - xmin) * index) / 149
    return { x, y: definition.value.f(x) }
  })
})

const yRange = computed(() => {
  const ys = [
    ...curveSamples.value.map((point) => point.y),
    ...evaluation.value.newton.points.map((point) => point.fx),
    ...evaluation.value.secant.points.map((point) => point.fx),
    0,
  ].filter(Number.isFinite)
  const maxAbs = Math.max(0.5, ...ys.map((value) => Math.abs(value)))
  return [-maxAbs * 1.08, maxAbs * 1.08] as [number, number]
})

function plotPoint(x: number, y: number) {
  const [xmin, xmax] = definition.value.domain
  const [ymin, ymax] = yRange.value
  return {
    x: plot.left + ((x - xmin) / (xmax - xmin)) * (plot.right - plot.left),
    y: plot.bottom - ((y - ymin) / (ymax - ymin)) * (plot.bottom - plot.top),
  }
}

const curvePath = computed(() =>
  curveSamples.value
    .map((point, index) => {
      const plotted = plotPoint(point.x, point.y)
      return `${index === 0 ? 'M' : 'L'} ${plotted.x.toFixed(2)} ${plotted.y.toFixed(2)}`
    })
    .join(' '),
)

const xAxisY = computed(() => plotPoint(definition.value.domain[0], 0).y)
const rootPoint = computed(() => plotPoint(evaluation.value.trueRoot, 0))
const bisectionLeft = computed(() => plotPoint(evaluation.value.bisection.interval[0], 0))
const bisectionRight = computed(() => plotPoint(evaluation.value.bisection.interval[1], 0))
const bisectionMid = computed(() => plotPoint(evaluation.value.bisection.approximation, definition.value.f(evaluation.value.bisection.approximation)))

function plottedPoints(points: RootIterationPoint[]) {
  return points
    .filter((point) => Number.isFinite(point.x) && Number.isFinite(point.fx))
    .map((point) => ({
      ...point,
      plot: plotPoint(point.x, point.fx),
      axis: plotPoint(point.x, 0),
    }))
}

const newtonPoints = computed(() => plottedPoints(evaluation.value.newton.points))
const secantPoints = computed(() => plottedPoints(evaluation.value.secant.points))
const secantPolyline = computed(() => secantPoints.value.map((point) => `${point.plot.x},${point.plot.y}`).join(' '))

const statusNote = computed(() => {
  if (evaluation.value.newton.status === 'diverged' || evaluation.value.secant.status === 'diverged') {
    return labels.value.failureNote
  }
  if (functionKind.value === 'flat') return labels.value.flatNote
  return labels.value.stableNote
})

const methodSummaries = computed(() => [
  {
    id: 'bisection',
    label: labels.value.bisection,
    approximation: evaluation.value.bisection.approximation,
    residual: evaluation.value.bisection.residual,
    extraLabel: labels.value.intervalWidth,
    extraValue: evaluation.value.bisection.intervalWidth,
  },
  {
    id: 'newton',
    label: labels.value.newton,
    approximation: evaluation.value.newton.approximation,
    residual: evaluation.value.newton.residual,
    extraLabel: labels.value.lastStep,
    extraValue: Math.abs(evaluation.value.newton.lastStep),
  },
  {
    id: 'secant',
    label: labels.value.secant,
    approximation: evaluation.value.secant.approximation,
    residual: evaluation.value.secant.residual,
    extraLabel: labels.value.lastStep,
    extraValue: Math.abs(evaluation.value.secant.lastStep),
  },
])

function functionLabel(kind: NonlinearFunctionKind) {
  const zh = props.locale === 'zh-CN'
  if (kind === 'cubic') return zh ? '三次方程' : 'Cubic equation'
  if (kind === 'cosine') return zh ? '余弦不动点' : 'Cosine fixed point'
  return zh ? '平坦重根' : 'Flat multiple root'
}

function formatNumber(value: number, digits = 5) {
  if (!Number.isFinite(value)) return '∞'
  if (Math.abs(value) >= 10000 || (Math.abs(value) > 0 && Math.abs(value) < 0.0001)) {
    return value.toExponential(2)
  }
  return value.toFixed(digits)
}
</script>

<template>
  <section class="math-lab-card nonlinear-equations-lab">
    <div class="math-lab-card__visual nonlinear-equations-lab__visual">
      <svg class="nonlinear-equations-lab__plot" viewBox="0 0 420 290" role="img" :aria-label="labels.title">
        <defs>
          <marker id="nonlinear-lab-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="context-stroke" />
          </marker>
        </defs>
        <line :x1="plot.left" :y1="xAxisY" :x2="plot.right" :y2="xAxisY" class="nonlinear-equations-lab__axis" />
        <line :x1="plot.left" :y1="plot.top" :x2="plot.left" :y2="plot.bottom" class="nonlinear-equations-lab__axis" />
        <path :d="curvePath" class="nonlinear-equations-lab__curve" />

        <line
          :x1="bisectionLeft.x"
          :y1="xAxisY"
          :x2="bisectionRight.x"
          :y2="xAxisY"
          class="nonlinear-equations-lab__bracket"
        />
        <circle :cx="rootPoint.x" :cy="rootPoint.y" r="6" class="nonlinear-equations-lab__root" />
        <circle :cx="bisectionMid.x" :cy="bisectionMid.y" r="5" class="nonlinear-equations-lab__bisection-point" />

        <polyline
          v-if="secantPoints.length > 1"
          :points="secantPolyline"
          class="nonlinear-equations-lab__secant-path"
        />

        <g v-for="point in newtonPoints" :key="`newton-${point.iteration}`">
          <line
            :x1="point.plot.x"
            :y1="point.plot.y"
            :x2="point.axis.x"
            :y2="point.axis.y"
            class="nonlinear-equations-lab__drop-line"
          />
          <circle :cx="point.plot.x" :cy="point.plot.y" r="4.5" class="nonlinear-equations-lab__newton-point" />
        </g>

        <circle
          v-for="point in secantPoints"
          :key="`secant-${point.iteration}`"
          :cx="point.plot.x"
          :cy="point.plot.y"
          r="4.5"
          class="nonlinear-equations-lab__secant-point"
        />
      </svg>

      <div class="nonlinear-equations-lab__legend" aria-hidden="true">
        <span><i class="is-curve" />{{ labels.curveLegend }}</span>
        <span><i class="is-bracket" />{{ labels.bisectionLegend }}</span>
        <span><i class="is-newton" />{{ labels.newtonLegend }}</span>
        <span><i class="is-secant" />{{ labels.secantLegend }}</span>
      </div>

      <div class="nonlinear-equations-lab__method-grid">
        <article v-for="summary in methodSummaries" :key="summary.id">
          <span>{{ summary.label }}</span>
          <strong>{{ labels.approximation }} {{ formatNumber(summary.approximation, 6) }}</strong>
          <small>{{ labels.residual }} {{ formatNumber(summary.residual, 2) }} · {{ summary.extraLabel }} {{ formatNumber(summary.extraValue, 3) }}</small>
        </article>
      </div>
    </div>

    <div class="math-lab-card__controls nonlinear-equations-lab__controls">
      <header>
        <span>{{ labels.eyebrow }}</span>
        <strong>{{ labels.title }}</strong>
        <p>{{ labels.subtitle }}</p>
      </header>

      <div class="math-mini-controls nonlinear-equations-lab__control-grid">
        <label>
          {{ labels.function }}
          <select v-model="functionKind">
            <option v-for="kind in functionOptions" :key="kind" :value="kind">
              {{ functionLabel(kind) }} · {{ nonlinearFunctionDefinitions[kind].label }}
            </option>
          </select>
        </label>

        <label>
          {{ labels.iterations }}: {{ iterations }}
          <input v-model.number="iterations" type="range" min="0" max="12" step="1" />
        </label>

        <label>
          {{ labels.newtonStart }}: {{ newtonStart.toFixed(2) }}
          <input v-model.number="newtonStart" type="range" min="-1.2" max="2.2" step="0.05" />
        </label>

        <label>
          {{ labels.secantPrevious }}: {{ secantPrevious.toFixed(2) }}
          <input v-model.number="secantPrevious" type="range" min="-1.2" max="2.2" step="0.05" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ labels.trueRoot }}</span>
          <strong>{{ formatNumber(evaluation.trueRoot, 6) }}</strong>
        </article>
        <article>
          <span>{{ labels.bisection }} {{ labels.evaluations }}</span>
          <strong>{{ evaluation.bisection.functionEvaluations }}</strong>
        </article>
        <article>
          <span>{{ labels.newton }} {{ labels.evaluations }}</span>
          <strong>{{ evaluation.newton.functionEvaluations }}</strong>
        </article>
        <article>
          <span>{{ labels.secant }} {{ labels.evaluations }}</span>
          <strong>{{ evaluation.secant.functionEvaluations }}</strong>
        </article>
      </div>

      <p class="math-lab-note nonlinear-equations-lab__status">{{ statusNote }}</p>
    </div>
  </section>
</template>
