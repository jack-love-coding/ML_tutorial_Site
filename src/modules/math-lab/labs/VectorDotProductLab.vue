<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { angleBetween, cosineSimilarity, dot, norm, projection, round, type Vector2 } from '../utils/math'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const size = 360
const center = size / 2
const scale = 38
const dragging = ref<'a' | 'b' | null>(null)
const vectors = reactive<Record<'a' | 'b', Vector2>>({
  a: { x: 2.4, y: 1.2 },
  b: { x: 1.1, y: 2.7 },
})

const projectionOfA = computed(() => projection(vectors.a, vectors.b))
const metrics = computed(() => ({
  dot: dot(vectors.a, vectors.b),
  normA: norm(vectors.a),
  normB: norm(vectors.b),
  cosine: cosineSimilarity(vectors.a, vectors.b),
  angle: angleBetween(vectors.a, vectors.b),
}))

function toSvg(point: Vector2) {
  return {
    x: center + point.x * scale,
    y: center - point.y * scale,
  }
}

function fromPointer(event: PointerEvent): Vector2 {
  const target = event.currentTarget as SVGSVGElement
  const bounds = target.getBoundingClientRect()
  const x = ((event.clientX - bounds.left) / bounds.width) * size
  const y = ((event.clientY - bounds.top) / bounds.height) * size
  return {
    x: Math.max(-4, Math.min(4, (x - center) / scale)),
    y: Math.max(-4, Math.min(4, (center - y) / scale)),
  }
}

function beginDrag(which: 'a' | 'b', event: PointerEvent) {
  dragging.value = which
  ;(event.currentTarget as SVGElement).setPointerCapture?.(event.pointerId)
}

function move(event: PointerEvent) {
  if (!dragging.value) return
  vectors[dragging.value] = fromPointer(event)
}

function stopDrag() {
  dragging.value = null
}

const svgA = computed(() => toSvg(vectors.a))
const svgB = computed(() => toSvg(vectors.b))
const svgProjection = computed(() => toSvg(projectionOfA.value))
const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        aria: '可交互的向量点积可视化',
        title: '向量实验',
        subtitle: '拖动端点改变夹角',
        dot: 'a dot b',
        cosine: '余弦相似度',
        angle: '夹角',
        norms: '向量长度',
      }
    : {
        aria: 'Interactive vector dot product visualization',
        title: 'Vector Lab',
        subtitle: 'Drag the endpoints',
        dot: 'a dot b',
        cosine: 'cosine similarity',
        angle: 'angle',
        norms: 'vector lengths',
      },
)
</script>

<template>
  <section class="math-lab-card vector-dot-product-lab">
    <div class="math-lab-card__visual">
      <svg
        viewBox="0 0 360 360"
        class="math-vector-svg"
        role="img"
        :aria-label="copy.aria"
        @pointermove="move"
        @pointerup="stopDrag"
        @pointerleave="stopDrag"
      >
        <defs>
          <marker id="arrow-a" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#3868ff" />
          </marker>
          <marker id="arrow-b" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#0f9f7a" />
          </marker>
        </defs>

        <g class="math-grid">
          <line v-for="tick in 9" :key="`x-${tick}`" :x1="0" :x2="360" :y1="(tick - 1) * 45" :y2="(tick - 1) * 45" />
          <line v-for="tick in 9" :key="`y-${tick}`" :x1="(tick - 1) * 45" :x2="(tick - 1) * 45" :y1="0" :y2="360" />
          <line x1="0" x2="360" y1="180" y2="180" class="axis" />
          <line x1="180" x2="180" y1="0" y2="360" class="axis" />
        </g>

        <line
          x1="180"
          y1="180"
          :x2="svgB.x"
          :y2="svgB.y"
          class="vector-line vector-line--b"
          marker-end="url(#arrow-b)"
        />
        <line
          x1="180"
          y1="180"
          :x2="svgA.x"
          :y2="svgA.y"
          class="vector-line vector-line--a"
          marker-end="url(#arrow-a)"
        />
        <line
          :x1="svgA.x"
          :y1="svgA.y"
          :x2="svgProjection.x"
          :y2="svgProjection.y"
          class="projection-drop"
        />
        <circle :cx="svgProjection.x" :cy="svgProjection.y" r="5" class="projection-dot" />
        <circle
          :cx="svgA.x"
          :cy="svgA.y"
          r="12"
          class="vector-handle vector-handle--a"
          @pointerdown.stop="beginDrag('a', $event)"
        />
        <circle
          :cx="svgB.x"
          :cy="svgB.y"
          r="12"
          class="vector-handle vector-handle--b"
          @pointerdown.stop="beginDrag('b', $event)"
        />
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.subtitle }}</strong>
      </header>

      <div class="math-readout-grid">
        <article><span>{{ copy.dot }}</span><strong>{{ round(metrics.dot) }}</strong></article>
        <article><span>{{ copy.cosine }}</span><strong>{{ round(metrics.cosine) }}</strong></article>
        <article><span>{{ copy.angle }}</span><strong>{{ round(metrics.angle, 1) }} deg</strong></article>
        <article><span>{{ copy.norms }}</span><strong>{{ round(metrics.normA, 2) }} / {{ round(metrics.normB, 2) }}</strong></article>
      </div>

      <div class="math-mini-controls">
        <label>
          ax
          <input v-model.number="vectors.a.x" type="range" min="-4" max="4" step="0.1" />
        </label>
        <label>
          ay
          <input v-model.number="vectors.a.y" type="range" min="-4" max="4" step="0.1" />
        </label>
        <label>
          bx
          <input v-model.number="vectors.b.x" type="range" min="-4" max="4" step="0.1" />
        </label>
        <label>
          by
          <input v-model.number="vectors.b.y" type="range" min="-4" max="4" step="0.1" />
        </label>
      </div>
    </div>
  </section>
</template>
