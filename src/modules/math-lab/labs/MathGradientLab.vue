<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  gradientDescentStep,
  quadraticGradient,
  quadraticLoss,
  round,
  type Vector2,
} from '../utils/math'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const size = 380
const center = size / 2
const scale = 44
const config = reactive({
  startX: 2.8,
  startY: -2.4,
  learningRate: 0.18,
  steps: 22,
})

function toSvg(point: Vector2) {
  return {
    x: center + point.x * scale,
    y: center - point.y * scale,
  }
}

const trajectory = computed(() => {
  const points: Vector2[] = []
  let point = { x: config.startX, y: config.startY }
  for (let index = 0; index <= config.steps; index += 1) {
    points.push(point)
    const gradient = quadraticGradient(point)
    point = gradientDescentStep(point, gradient, config.learningRate)
  }
  return points
})

const current = computed(() => trajectory.value.at(-1) ?? { x: config.startX, y: config.startY })
const currentGradient = computed(() => quadraticGradient(current.value))
const currentLoss = computed(() => quadraticLoss(current.value))
const pathData = computed(() =>
  trajectory.value
    .map((point, index) => {
      const svgPoint = toSvg(point)
      return `${index === 0 ? 'M' : 'L'} ${svgPoint.x} ${svgPoint.y}`
    })
    .join(' '),
)

const contourRadii = [42, 72, 104, 138, 174]
const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        aria: '梯度下降等高线可视化',
        title: '梯度实验',
        subtitle: '沿梯度的反方向移动',
        loss: '损失',
        gradient: '梯度',
        learningRate: '学习率',
        steps: '步数',
        startX: '起点 x',
        startY: '起点 y',
      }
    : {
        aria: 'Gradient descent contour visualization',
        title: 'Gradient Lab',
        subtitle: 'Move opposite the gradient',
        loss: 'loss',
        gradient: 'gradient',
        learningRate: 'learning rate',
        steps: 'steps',
        startX: 'start x',
        startY: 'start y',
      },
)
</script>

<template>
  <section class="math-lab-card math-gradient-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 380 380" class="math-gradient-svg" role="img" :aria-label="copy.aria">
        <g class="math-gradient-contours">
          <ellipse
            v-for="radius in contourRadii"
            :key="radius"
            cx="190"
            cy="190"
            :rx="radius * 1.18"
            :ry="radius * 0.72"
            transform="rotate(-18 190 190)"
          />
        </g>
        <path :d="pathData" class="gradient-trajectory" />
        <circle :cx="toSvg(trajectory[0]).x" :cy="toSvg(trajectory[0]).y" r="7" class="gradient-start" />
        <circle :cx="toSvg(current).x" :cy="toSvg(current).y" r="8" class="gradient-current" />
        <line
          :x1="toSvg(current).x"
          :y1="toSvg(current).y"
          :x2="toSvg({ x: current.x - currentGradient.x * 0.18, y: current.y - currentGradient.y * 0.18 }).x"
          :y2="toSvg({ x: current.x - currentGradient.x * 0.18, y: current.y - currentGradient.y * 0.18 }).y"
          class="negative-gradient-arrow"
        />
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.subtitle }}</strong>
      </header>

      <div class="math-readout-grid">
        <article><span>{{ copy.loss }}</span><strong>{{ round(currentLoss) }}</strong></article>
        <article><span>{{ copy.gradient }}</span><strong>({{ round(currentGradient.x, 2) }}, {{ round(currentGradient.y, 2) }})</strong></article>
        <article><span>{{ copy.learningRate }}</span><strong>{{ round(config.learningRate, 2) }}</strong></article>
        <article><span>{{ copy.steps }}</span><strong>{{ config.steps }}</strong></article>
      </div>

      <div class="math-mini-controls">
        <label>
          {{ copy.startX }}
          <input v-model.number="config.startX" type="range" min="-3.2" max="3.2" step="0.1" />
        </label>
        <label>
          {{ copy.startY }}
          <input v-model.number="config.startY" type="range" min="-3.2" max="3.2" step="0.1" />
        </label>
        <label>
          {{ copy.learningRate }}
          <input v-model.number="config.learningRate" type="range" min="0.03" max="0.72" step="0.01" />
        </label>
        <label>
          {{ copy.steps }}
          <input v-model.number="config.steps" type="range" min="4" max="45" step="1" />
        </label>
      </div>
    </div>
  </section>
</template>
