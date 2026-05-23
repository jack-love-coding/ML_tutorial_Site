<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateLocalChangeStory } from '../utils/beginnerFoundations'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const x = ref(1)
const h = ref(0.45)
const learningRate = ref(0.2)

const evaluation = computed(() =>
  evaluateLocalChangeStory({
    x: x.value,
    h: h.value,
    learningRate: learningRate.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '局部变化故事',
        subtitle: '缩小观察窗口，看平均斜率怎样接近导数，再把导数变成一次训练更新。',
        x: '当前位置 x',
        h: '窗口 h',
        lr: '学习率',
        secant: '平均变化率',
        derivative: '导数',
        error: '差距',
        nextX: '下一步 x',
        loss: 'loss 变化',
        note: 'h 越小，割线斜率越像切线斜率；学习率控制沿负梯度走多远。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Local Change Story',
        subtitle: 'Shrink the observation window, watch average slope approach the derivative, then turn the derivative into one training update.',
        x: 'position x',
        h: 'window h',
        lr: 'learning rate',
        secant: 'average change',
        derivative: 'derivative',
        error: 'gap',
        nextX: 'next x',
        loss: 'loss change',
        note: 'Smaller h makes the secant slope behave more like tangent slope; learning rate controls how far the negative-gradient step moves.',
      },
)

const plot = {
  width: 420,
  height: 280,
  xMin: -2.4,
  xMax: 2.4,
  yMin: -2.5,
  yMax: 5.5,
}

function curve(value: number) {
  return value ** 3 - 2 * value + 1
}

function mapX(value: number) {
  return ((value - plot.xMin) / (plot.xMax - plot.xMin)) * plot.width
}

function mapY(value: number) {
  return plot.height - ((value - plot.yMin) / (plot.yMax - plot.yMin)) * plot.height
}

const curvePoints = computed(() =>
  Array.from({ length: 121 }, (_, index) => {
    const value = plot.xMin + (index / 120) * (plot.xMax - plot.xMin)
    return `${mapX(value).toFixed(1)},${mapY(curve(value)).toFixed(1)}`
  }).join(' '),
)

const xPoint = computed(() => ({ x: mapX(evaluation.value.x), y: mapY(evaluation.value.y) }))
const hPoint = computed(() => ({ x: mapX(evaluation.value.x + evaluation.value.h), y: mapY(evaluation.value.nextY) }))
const tangent = computed(() => {
  const left = evaluation.value.x - 0.55
  const right = evaluation.value.x + 0.55
  return {
    x1: mapX(left),
    y1: mapY(evaluation.value.y + evaluation.value.derivative * (left - evaluation.value.x)),
    x2: mapX(right),
    y2: mapY(evaluation.value.y + evaluation.value.derivative * (right - evaluation.value.x)),
  }
})

function format(value: number) {
  return value.toFixed(3)
}
</script>

<template>
  <section class="math-lab-card local-change-story-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 420 280" role="img" :aria-label="copy.title">
        <line x1="0" :y1="mapY(0)" x2="420" :y2="mapY(0)" class="local-change-story-lab__axis" />
        <line :x1="mapX(0)" y1="0" :x2="mapX(0)" y2="280" class="local-change-story-lab__axis" />
        <polyline :points="curvePoints" class="local-change-story-lab__curve" />
        <line :x1="xPoint.x" :y1="xPoint.y" :x2="hPoint.x" :y2="hPoint.y" class="local-change-story-lab__secant" />
        <line :x1="tangent.x1" :y1="tangent.y1" :x2="tangent.x2" :y2="tangent.y2" class="local-change-story-lab__tangent" />
        <path
          :d="`M ${xPoint.x} ${xPoint.y} C ${xPoint.x - 36} ${xPoint.y + 38}, ${mapX(evaluation.nextX) + 36} ${mapY(curve(evaluation.nextX)) + 38}, ${mapX(evaluation.nextX)} ${mapY(curve(evaluation.nextX))}`"
          class="local-change-story-lab__step"
        />
        <circle :cx="xPoint.x" :cy="xPoint.y" r="7" class="local-change-story-lab__point" />
        <circle :cx="hPoint.x" :cy="hPoint.y" r="6" class="local-change-story-lab__window-point" />
        <circle :cx="mapX(evaluation.nextX)" :cy="mapY(curve(evaluation.nextX))" r="6" class="local-change-story-lab__next-point" />
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls local-change-story-lab__controls">
        <label>
          {{ copy.x }}: {{ x.toFixed(2) }}
          <input v-model.number="x" type="range" min="-2" max="2" step="0.05" />
        </label>
        <label>
          {{ copy.h }}: {{ h.toFixed(2) }}
          <input v-model.number="h" type="range" min="0.05" max="1.2" step="0.05" />
        </label>
        <label>
          {{ copy.lr }}: {{ learningRate.toFixed(2) }}
          <input v-model.number="learningRate" type="range" min="0.02" max="0.42" step="0.02" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.secant }}</span><strong>{{ format(evaluation.secantSlope) }}</strong></article>
        <article><span>{{ copy.derivative }}</span><strong>{{ format(evaluation.derivative) }}</strong></article>
        <article><span>{{ copy.error }}</span><strong>{{ format(evaluation.secantError) }}</strong></article>
        <article><span>{{ copy.nextX }}</span><strong>{{ format(evaluation.nextX) }}</strong></article>
        <article><span>{{ copy.loss }}</span><strong>{{ format(evaluation.currentLoss) }} -> {{ format(evaluation.nextLoss) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.local-change-story-lab svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.local-change-story-lab__axis {
  stroke: rgba(16, 22, 47, 0.25);
  stroke-width: 2;
}

.local-change-story-lab__curve,
.local-change-story-lab__secant,
.local-change-story-lab__tangent,
.local-change-story-lab__step {
  fill: none;
  stroke-width: 3;
}

.local-change-story-lab__curve {
  stroke: #3868ff;
}

.local-change-story-lab__secant {
  stroke: #ef6f6c;
  stroke-dasharray: 7 6;
}

.local-change-story-lab__tangent {
  stroke: #0f9f7a;
}

.local-change-story-lab__step {
  stroke: #d65a31;
}

.local-change-story-lab__point,
.local-change-story-lab__window-point,
.local-change-story-lab__next-point {
  stroke: #10162f;
  stroke-width: 2;
}

.local-change-story-lab__point {
  fill: #ffd84d;
}

.local-change-story-lab__window-point {
  fill: #9ee6ff;
}

.local-change-story-lab__next-point {
  fill: #b6f2d2;
}

.local-change-story-lab__controls {
  grid-template-columns: 1fr;
}
</style>
