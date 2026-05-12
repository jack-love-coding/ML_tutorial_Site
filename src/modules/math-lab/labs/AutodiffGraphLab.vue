<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateAutodiffGraph } from '../utils/aiBridgeMath'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const w = ref(1.4)
const x = ref(2)
const b = ref(-0.5)
const y = ref(1.2)

const evaluation = computed(() =>
  evaluateAutodiffGraph({
    w: w.value,
    x: x.value,
    b: b.value,
    y: y.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '计算图反向追踪',
        subtitle: '在 L=(wx+b-y)^2 中观察局部导数如何连乘。',
        prediction: '预测值',
        residual: '残差',
        loss: 'loss',
        upstream: '上游梯度',
        gradW: 'dL/dw',
        gradB: 'dL/db',
        gradX: 'dL/dx',
        finite: '有限差分 dL/dw',
        error: '检查误差',
        note: '自动微分保存前向中的局部关系，反向时把上游梯度按链式法则传回每个输入。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Computation Graph Trace',
        subtitle: 'Watch local derivatives multiply through L=(wx+b-y)^2.',
        prediction: 'prediction',
        residual: 'residual',
        loss: 'loss',
        upstream: 'upstream grad',
        gradW: 'dL/dw',
        gradB: 'dL/db',
        gradX: 'dL/dx',
        finite: 'finite diff dL/dw',
        error: 'check error',
        note: 'Automatic differentiation stores local forward relationships, then sends upstream gradients backward by the chain rule.',
      },
)

function format(value: number, digits = 3) {
  return Math.abs(value) >= 1000 || (Math.abs(value) > 0 && Math.abs(value) < 0.001)
    ? value.toExponential(2)
    : value.toFixed(digits)
}
</script>

<template>
  <section class="math-lab-card autodiff-graph-lab">
    <div class="math-lab-card__visual autodiff-graph-lab__visual">
      <svg viewBox="0 0 520 300" role="img" :aria-label="copy.title">
        <defs>
          <marker id="autodiff-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#10162f" />
          </marker>
        </defs>
        <g class="autodiff-graph-lab__edge">
          <line x1="76" y1="84" x2="180" y2="128" marker-end="url(#autodiff-arrow)" />
          <line x1="76" y1="176" x2="180" y2="146" marker-end="url(#autodiff-arrow)" />
          <line x1="244" y1="138" x2="318" y2="138" marker-end="url(#autodiff-arrow)" />
          <line x1="276" y1="218" x2="318" y2="156" marker-end="url(#autodiff-arrow)" />
          <line x1="386" y1="138" x2="444" y2="138" marker-end="url(#autodiff-arrow)" />
        </g>
        <g class="autodiff-graph-lab__node">
          <circle cx="64" cy="74" r="34" />
          <text x="64" y="70">w</text>
          <text x="64" y="90">{{ format(w, 1) }}</text>
        </g>
        <g class="autodiff-graph-lab__node">
          <circle cx="64" cy="184" r="34" />
          <text x="64" y="180">x</text>
          <text x="64" y="200">{{ format(x, 1) }}</text>
        </g>
        <g class="autodiff-graph-lab__node autodiff-graph-lab__node--op">
          <circle cx="214" cy="138" r="38" />
          <text x="214" y="134">wx</text>
          <text x="214" y="154">{{ format(w * x, 2) }}</text>
        </g>
        <g class="autodiff-graph-lab__node">
          <circle cx="266" cy="224" r="34" />
          <text x="266" y="220">b</text>
          <text x="266" y="240">{{ format(b, 1) }}</text>
        </g>
        <g class="autodiff-graph-lab__node autodiff-graph-lab__node--op">
          <circle cx="350" cy="138" r="38" />
          <text x="350" y="134">ŷ</text>
          <text x="350" y="154">{{ format(evaluation.prediction, 2) }}</text>
        </g>
        <g class="autodiff-graph-lab__node autodiff-graph-lab__node--loss">
          <circle cx="476" cy="138" r="38" />
          <text x="476" y="134">L</text>
          <text x="476" y="154">{{ format(evaluation.loss, 2) }}</text>
        </g>
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls autodiff-graph-lab__controls">
        <label>w: {{ w.toFixed(1) }}<input v-model.number="w" type="range" min="-3" max="3" step="0.1" /></label>
        <label>x: {{ x.toFixed(1) }}<input v-model.number="x" type="range" min="-3" max="3" step="0.1" /></label>
        <label>b: {{ b.toFixed(1) }}<input v-model.number="b" type="range" min="-3" max="3" step="0.1" /></label>
        <label>y: {{ y.toFixed(1) }}<input v-model.number="y" type="range" min="-3" max="3" step="0.1" /></label>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.prediction }}</span><strong>{{ format(evaluation.prediction) }}</strong></article>
        <article><span>{{ copy.residual }}</span><strong>{{ format(evaluation.residual) }}</strong></article>
        <article><span>{{ copy.loss }}</span><strong>{{ format(evaluation.loss) }}</strong></article>
        <article><span>{{ copy.upstream }}</span><strong>{{ format(evaluation.dLossDPrediction) }}</strong></article>
        <article><span>{{ copy.gradW }}</span><strong>{{ format(evaluation.gradients.w) }}</strong></article>
        <article><span>{{ copy.gradB }}</span><strong>{{ format(evaluation.gradients.b) }}</strong></article>
        <article><span>{{ copy.gradX }}</span><strong>{{ format(evaluation.gradients.x) }}</strong></article>
        <article><span>{{ copy.error }}</span><strong>{{ format(evaluation.gradientCheckError, 2) }}</strong></article>
      </div>

      <p class="math-lab-note">
        {{ copy.finite }} = {{ format(evaluation.finiteDifferenceW) }}. {{ copy.note }}
      </p>
    </div>
  </section>
</template>

<style scoped>
.autodiff-graph-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.autodiff-graph-lab__edge line {
  stroke: #10162f;
  stroke-width: 2.4;
}

.autodiff-graph-lab__node circle {
  fill: #ffffff;
  stroke: #10162f;
  stroke-width: 2;
}

.autodiff-graph-lab__node--op circle {
  fill: #e7ddff;
}

.autodiff-graph-lab__node--loss circle {
  fill: #ffd84d;
}

.autodiff-graph-lab__node text {
  fill: #10162f;
  font-family: var(--font-display, system-ui);
  font-weight: 900;
  text-anchor: middle;
}

.autodiff-graph-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .autodiff-graph-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
