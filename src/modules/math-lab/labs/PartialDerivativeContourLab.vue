<script setup lang="ts">
import * as d3 from 'd3'
import { computed, reactive, ref, useId, watch } from 'vue'
import DraggablePoint from '../components/interactive/DraggablePoint.vue'
import InteractivePlane from '../components/interactive/InteractivePlane.vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import {
  evaluatePartialDerivativePoint,
  quadraticLoss2D,
  sampleQuadraticSlice,
} from '../utils/calculus'
import { clamp, norm, round, type Vector2 } from '../utils/math'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()

const width = 420
const height = 320
const xMin = -3
const xMax = 3
const yMin = -3
const yMax = 3
const markerPrefix = useId()
const markerIds = {
  gradient: `${markerPrefix}-gradient-arrow`,
  negative: `${markerPrefix}-negative-gradient-arrow`,
  direction: `${markerPrefix}-direction-arrow`,
}

const point = reactive<Vector2>({ x: 1.4, y: -1.1 })
const directionAngle = ref(35)
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
      },
)

const contourPaths = computed(() => {
  const gridSize = 56
  const thresholds = [0.45, 0.9, 1.4, 2.1, 3, 4.2, 5.7, 7.4]
  const values: number[] = []

  for (let yIndex = 0; yIndex < gridSize; yIndex += 1) {
    const y = yMax - (yIndex / (gridSize - 1)) * (yMax - yMin)
    for (let xIndex = 0; xIndex < gridSize; xIndex += 1) {
      const x = xMin + (xIndex / (gridSize - 1)) * (xMax - xMin)
      values.push(quadraticLoss2D({ x, y }))
    }
  }

  const path = d3.geoPath(d3.geoIdentity().scale(width / (gridSize - 1)))
  return d3
    .contours()
    .size([gridSize, gridSize])
    .thresholds(thresholds)(values)
    .map((contour) => ({
      value: contour.value,
      d: path(contour) ?? '',
    }))
})

const xSlice = computed(() => sampleQuadraticSlice({ point, axis: 'x', radius: 1.2, samples: 28 }))
const ySlice = computed(() => sampleQuadraticSlice({ point, axis: 'y', radius: 1.2, samples: 28 }))

function updatePoint(nextPoint: Vector2) {
  point.x = round(clamp(nextPoint.x, xMin, xMax), 2)
  point.y = round(clamp(nextPoint.y, yMin, yMax), 2)
}

function setPointAxis(axis: 'x' | 'y', value: number) {
  if (!Number.isFinite(value)) return
  point[axis] = round(clamp(value, axis === 'x' ? xMin : yMin, axis === 'x' ? xMax : yMax), 2)
}

function vectorEnd(vector: Vector2, scale = 0.72): Vector2 {
  const length = norm(vector)
  if (length === 0) return evaluation.value.point
  return {
    x: evaluation.value.point.x + (vector.x / length) * scale,
    y: evaluation.value.point.y + (vector.y / length) * scale,
  }
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
  point.x = 1.4
  point.y = -1.1
  directionAngle.value = 35
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
          <marker :id="markerIds.gradient" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#3868ff" />
          </marker>
          <marker :id="markerIds.negative" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#d65a31" />
          </marker>
          <marker :id="markerIds.direction" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#0f9f7a" />
          </marker>
        </defs>

        <g class="partial-derivative-lab__contours" aria-hidden="true">
          <path
            v-for="contour in contourPaths"
            :key="contour.value"
            :d="contour.d"
          />
        </g>

        <line
          :x1="toSvg(evaluation.point).x"
          :y1="toSvg(evaluation.point).y"
          :x2="toSvg(vectorEnd(evaluation.gradient)).x"
          :y2="toSvg(vectorEnd(evaluation.gradient)).y"
          class="partial-derivative-lab__vector partial-derivative-lab__vector--gradient"
          :marker-end="`url(#${markerIds.gradient})`"
        />
        <line
          v-if="showNegativeGradient"
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

<style scoped>
.partial-derivative-lab__contours path {
  fill: none;
  stroke: rgba(56, 104, 255, 0.28);
  stroke-width: 2;
}

.partial-derivative-lab__vector {
  stroke-width: 4;
  stroke-linecap: round;
}

.partial-derivative-lab__vector--gradient {
  stroke: #3868ff;
}

.partial-derivative-lab__vector--negative {
  stroke: #d65a31;
  stroke-dasharray: 8 6;
}

.partial-derivative-lab__vector--direction {
  stroke: #0f9f7a;
  stroke-dasharray: 4 5;
}

.partial-derivative-lab__checkbox {
  display: flex;
  grid-template-columns: none;
  align-items: center;
  gap: 10px;
}

.partial-derivative-lab__checkbox input {
  width: 18px;
  min-height: 18px;
}

.partial-derivative-lab__slices {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.partial-derivative-lab__slices figure {
  display: grid;
  gap: 6px;
  margin: 0;
  padding: 12px;
  border: 1px solid rgba(15, 23, 40, 0.12);
  border-radius: 8px;
  background: #ffffff;
}

.partial-derivative-lab__slices span {
  color: var(--muted);
  font-size: 0.82rem;
}

.partial-derivative-lab__slices line {
  stroke: rgba(16, 22, 47, 0.24);
  stroke-width: 2;
}

.partial-derivative-lab__slices polyline {
  fill: none;
  stroke: #0f9f7a;
  stroke-width: 3;
}

@media (max-width: 720px) {
  .partial-derivative-lab__slices {
    grid-template-columns: 1fr;
  }
}
</style>
