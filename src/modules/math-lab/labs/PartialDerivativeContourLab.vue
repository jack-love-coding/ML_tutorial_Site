<script setup lang="ts">
import { computed, reactive, ref, useId, watch } from 'vue'
import DraggablePoint from '../components/interactive/DraggablePoint.vue'
import InteractivePlane from '../components/interactive/InteractivePlane.vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import {
  evaluatePartialDerivativePoint,
  sampleQuadraticSlice,
} from '../utils/calculus'
import { clamp, round, type Vector2 } from '../utils/math'
import { partialContourPath, partialGradientLevels, partialGradientStart, partialGradientViewport, partialVectorEnd } from '../utils/partialGradientGeometry.ts'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()

const { width, height, xMin, xMax, yMin, yMax } = partialGradientViewport
const markerPrefix = useId()
const markerIds = {
  gradient: `${markerPrefix}-gradient-arrow`,
  negative: `${markerPrefix}-negative-gradient-arrow`,
  direction: `${markerPrefix}-direction-arrow`,
}

const point = reactive<Vector2>({ ...partialGradientStart.point })
const directionAngle = ref(partialGradientStart.directionAngle)
const showNegativeGradient = ref(true)

const direction = computed<Vector2>(() => {
  const radians = (directionAngle.value * Math.PI) / 180
  return {
    x: Math.cos(radians),
    y: Math.sin(radians),
  }
})
const evaluation = computed(() =>
  evaluatePartialDerivativePoint({
    x: point.x,
    y: point.y,
    direction: direction.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '偏导数与梯度等高线',
        subtitle: '拖动当前点，分别读取 x 方向、y 方向和任意方向的局部变化。',
        aria: '偏导数与梯度等高线互动实验',
        x: '参数 x',
        y: '参数 y',
        direction: '方向 u 角度',
        showNegative: '显示负梯度',
        reset: '重置',
        loss: 'Loss',
        partialX: '∂L/∂x',
        partialY: '∂L/∂y',
        gradient: '∇L',
        negativeGradient: '-∇L',
        directionalDerivative: '方向导数 ∇L · u',
        xSlice: '固定 y，只动 x',
        ySlice: '固定 x，只动 y',
        note: '一个偏导数只读一个坐标方向；完整梯度把两个偏导数组成向量，指向最陡上升方向。',
        pointLabel: '当前点',
        model: '示意损失：L = 0.72x² + 0.32xy + 0.52y²；x、y 是参数，不是样本特征。',
        legend: '实线 ∇L：上坡；长虚线 −∇L：下坡；点虚线 u：所选方向。箭头长度归一化，只表示方向。',
        contour: '灰线是相同损失，深色虚线经过当前点。横纵轴单位相同；非零梯度垂直于当前等高线。',
        stationary: '当前位置梯度为零，没有唯一的最陡方向；请移动参数点继续观察。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Partial Derivatives on Contours',
        subtitle: 'Drag the current point and read local change along x, y, and any chosen direction.',
        aria: 'Interactive partial derivative and gradient contour lab',
        x: 'parameter x',
        y: 'parameter y',
        direction: 'direction u angle',
        showNegative: 'show negative gradient',
        reset: 'reset',
        loss: 'Loss',
        partialX: 'partial x',
        partialY: 'partial y',
        gradient: 'gradient',
        negativeGradient: 'negative gradient',
        directionalDerivative: 'directional derivative',
        xSlice: 'hold y, move x',
        ySlice: 'hold x, move y',
        note: 'One partial derivative reads one coordinate direction; the full gradient collects both partials into the steepest-ascent vector.',
        pointLabel: 'current point',
        model: 'Illustrative loss: L = 0.72x² + 0.32xy + 0.52y²; x and y are parameters, not sample features.',
        legend: 'Solid ∇L: uphill; long-dashed −∇L: downhill; dotted u: selected direction. Arrow lengths are normalized to show direction only.',
        contour: 'Gray curves have equal loss; the dark dashed curve passes through the current point. Axes use equal units, so a nonzero gradient is perpendicular to the contour.',
        stationary: 'The gradient is zero here, so there is no unique steepest direction. Move the parameter point to continue.',
      },
)

const contourPaths = partialGradientLevels.map(value => ({ value, d: partialContourPath(value) }))
const currentContour = computed(() => partialContourPath(evaluation.value.loss))

const xSlice = computed(() => sampleQuadraticSlice({ point, axis: 'x', radius: 1.2, samples: 28 }))
const ySlice = computed(() => sampleQuadraticSlice({ point, axis: 'y', radius: 1.2, samples: 28 }))

function updatePoint(nextPoint: Vector2) {
  point.x = round(clamp(nextPoint.x, -3, 3), 2)
  point.y = round(clamp(nextPoint.y, -3, 3), 2)
}

function setPointAxis(axis: 'x' | 'y', value: number) {
  if (!Number.isFinite(value)) return
  point[axis] = round(clamp(value, -3, 3), 2)
}

function vectorEnd(vector: Vector2, scale = 0.72): Vector2 {
  return partialVectorEnd(evaluation.value.point, vector, scale)
}

function format(value: number, digits = 3) {
  return round(value, digits).toFixed(digits)
}

function formatVector(vector: Vector2) {
  return `(${format(vector.x, 2)}, ${format(vector.y, 2)})`
}

function slicePoints(samples: Array<{ offset: number; loss: number }>) {
  const maxLoss = Math.max(...samples.map((sample) => sample.loss), 1)
  return samples
    .map((sample) => {
      const x = 18 + ((sample.offset + 1.2) / 2.4) * 164
      const y = 82 - (sample.loss / maxLoss) * 66
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

function resetLab() {
  Object.assign(point, partialGradientStart.point)
  directionAngle.value = partialGradientStart.directionAngle
  showNegativeGradient.value = true
}

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'calculus-partial-derivatives-gradients',
  sourceId: 'partial-derivative-contour-lab',
  summary: {
    'zh-CN': '当前点同时显示两个偏导数、完整梯度和选定方向导数。',
    en: 'The current point shows both partial derivatives, the full gradient, and a selected directional derivative.',
  },
  metrics: [
    { label: { 'zh-CN': '位置', en: 'position' }, value: formatVector(evaluation.value.point) },
    { label: { 'zh-CN': '∂L/∂x', en: 'partial x' }, value: format(evaluation.value.partialX) },
    { label: { 'zh-CN': '∂L/∂y', en: 'partial y' }, value: format(evaluation.value.partialY) },
    { label: { 'zh-CN': '∇L', en: 'gradient' }, value: formatVector(evaluation.value.gradient) },
    {
      label: { 'zh-CN': '方向导数', en: 'directional derivative' },
      value: format(evaluation.value.directionalDerivative),
    },
  ],
  prompt: {
    'zh-CN': '解释为什么两个偏导数合在一起才给出完整梯度方向。',
    en: 'Explain why the two partial derivatives together form the full gradient direction.',
  },
}))

watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)
</script>

<template>
  <section class="math-lab-card partial-derivative-lab">
    <div class="math-lab-card__visual partial-derivative-lab__visual">
      <p>{{ copy.model }}</p>
      <InteractivePlane
        v-slot="{ toSvg, fromSvg }"
        :label="copy.aria"
        :width="width"
        :height="height"
        :x-min="xMin"
        :x-max="xMax"
        :y-min="yMin"
        :y-max="yMax"
      >
        <defs>
          <marker :id="markerIds.gradient" markerUnits="userSpaceOnUse" viewBox="0 0 10 10" markerWidth="12" markerHeight="12" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#3868ff" />
          </marker>
          <marker :id="markerIds.negative" markerUnits="userSpaceOnUse" viewBox="0 0 10 10" markerWidth="12" markerHeight="12" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#d65a31" />
          </marker>
          <marker :id="markerIds.direction" markerUnits="userSpaceOnUse" viewBox="0 0 10 10" markerWidth="12" markerHeight="12" refX="9" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="#0f9f7a" />
          </marker>
        </defs>

        <g class="partial-derivative-lab__contours" aria-hidden="true">
          <path
            v-for="contour in contourPaths"
            :key="contour.value"
            :d="contour.d"
          />
          <path v-if="currentContour" :d="currentContour" class="partial-derivative-lab__current-contour" />
        </g>

        <g class="partial-derivative-lab__axes-labels" aria-hidden="true">
          <text x="342" y="173">x</text><text x="190" y="18">y</text>
          <text v-for="tick in [-3, 0, 3]" :key="`x-${tick}`" :x="toSvg({ x: tick, y: 0 }).x" y="198">{{ tick }}</text>
          <text v-for="tick in [-3, 3]" :key="`y-${tick}`" x="166" :y="toSvg({ x: 0, y: tick }).y + 4">{{ tick }}</text>
        </g>

        <line
          v-if="evaluation.gradientNorm > 0"
          :x1="toSvg(evaluation.point).x"
          :y1="toSvg(evaluation.point).y"
          :x2="toSvg(vectorEnd(evaluation.gradient)).x"
          :y2="toSvg(vectorEnd(evaluation.gradient)).y"
          class="partial-derivative-lab__vector partial-derivative-lab__vector--gradient"
          :marker-end="`url(#${markerIds.gradient})`"
        />
        <line
          v-if="showNegativeGradient && evaluation.gradientNorm > 0"
          :x1="toSvg(evaluation.point).x"
          :y1="toSvg(evaluation.point).y"
          :x2="toSvg(vectorEnd(evaluation.negativeGradient)).x"
          :y2="toSvg(vectorEnd(evaluation.negativeGradient)).y"
          class="partial-derivative-lab__vector partial-derivative-lab__vector--negative"
          :marker-end="`url(#${markerIds.negative})`"
        />
        <line
          :x1="toSvg(evaluation.point).x"
          :y1="toSvg(evaluation.point).y"
          :x2="toSvg(vectorEnd(evaluation.direction, 0.84)).x"
          :y2="toSvg(vectorEnd(evaluation.direction, 0.84)).y"
          class="partial-derivative-lab__vector partial-derivative-lab__vector--direction"
          :marker-end="`url(#${markerIds.direction})`"
        />

        <DraggablePoint
          :point="evaluation.point"
          :to-svg="toSvg"
          :from-svg="fromSvg"
          :label="copy.pointLabel"
          class-name="partial-derivative-lab__point"
          @update:point="updatePoint"
        />
      </InteractivePlane>
      <p class="partial-derivative-lab__legend">{{ copy.legend }}</p>
      <p class="math-lab-note">{{ copy.contour }}</p>
      <p v-if="evaluation.gradientNorm === 0" role="status">{{ copy.stationary }}</p>
    </div>

    <div class="math-lab-card__controls partial-derivative-lab__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls">
        <label>
          {{ copy.x }}: {{ point.x.toFixed(2) }}
          <input :value="point.x" type="range" min="-3" max="3" step="0.05" @input="setPointAxis('x', Number(($event.target as HTMLInputElement).value))" />
        </label>
        <label>
          {{ copy.y }}: {{ point.y.toFixed(2) }}
          <input :value="point.y" type="range" min="-3" max="3" step="0.05" @input="setPointAxis('y', Number(($event.target as HTMLInputElement).value))" />
        </label>
        <label>
          {{ copy.direction }}: {{ directionAngle }}°
          <input v-model.number="directionAngle" type="range" min="-180" max="180" step="5" />
        </label>
        <label class="partial-derivative-lab__checkbox">
          <input v-model="showNegativeGradient" type="checkbox" />
          <span>{{ copy.showNegative }}</span>
        </label>
      </div>

      <button type="button" class="action-button" @click="resetLab">{{ copy.reset }}</button>

      <div class="math-readout-grid">
        <article><span>{{ copy.loss }}</span><strong>{{ format(evaluation.loss) }}</strong></article>
        <article><span>{{ copy.partialX }}</span><strong>{{ format(evaluation.partialX) }}</strong></article>
        <article><span>{{ copy.partialY }}</span><strong>{{ format(evaluation.partialY) }}</strong></article>
        <article><span>{{ copy.gradient }}</span><strong>{{ formatVector(evaluation.gradient) }}</strong></article>
        <article><span>{{ copy.directionalDerivative }}</span><strong>{{ format(evaluation.directionalDerivative) }}</strong></article>
      </div>

      <div class="partial-derivative-lab__slices">
        <figure>
          <span>{{ copy.xSlice }}</span>
          <svg viewBox="0 0 200 96" role="img" :aria-label="copy.xSlice">
            <line x1="14" y1="82" x2="188" y2="82" />
            <polyline :points="slicePoints(xSlice)" />
          </svg>
        </figure>
        <figure>
          <span>{{ copy.ySlice }}</span>
          <svg viewBox="0 0 200 96" role="img" :aria-label="copy.ySlice">
            <line x1="14" y1="82" x2="188" y2="82" />
            <polyline :points="slicePoints(ySlice)" />
          </svg>
        </figure>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped src="../../../styles/modules/partial-derivative.css"></style>
