<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateBackpropBlockStory } from '../utils/beginnerFoundations'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const x = ref(1.2)
const weight = ref(1.4)
const bias = ref(-0.3)
const target = ref(0.8)

const evaluation = computed(() =>
  evaluateBackpropBlockStory({
    x: x.value,
    weight: weight.value,
    bias: bias.value,
    target: target.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '反传积木',
        subtitle: '先前向算预测和 loss，再把上游梯度乘过每个局部导数。',
        x: '输入 x',
        weight: '权重 w',
        bias: '偏置 b',
        target: '目标 y',
        forward: '前向值',
        backward: '反向梯度',
        check: '数值检查',
        note: '反向传播不是神秘黑盒。每条边只做一件事：上游梯度乘以本地导数。',
        local: '局部导数',
        upstream: '上游梯度',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Backprop Blocks',
        subtitle: 'Run prediction and loss forward, then multiply upstream gradients through local derivatives.',
        x: 'input x',
        weight: 'weight w',
        bias: 'bias b',
        target: 'target y',
        forward: 'forward values',
        backward: 'backward gradients',
        check: 'numeric check',
        note: 'Backpropagation is not a black box. Each edge multiplies the upstream gradient by its local derivative.',
        local: 'local derivative',
        upstream: 'upstream gradient',
      },
)

function format(value: number) {
  return value.toFixed(4)
}
</script>

<template>
  <section class="math-lab-card backprop-block-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 520 310" role="img" :aria-label="copy.title">
        <defs>
          <marker id="backprop-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" />
          </marker>
        </defs>
        <g class="backprop-block-lab__forward">
          <rect x="28" y="72" width="82" height="54" rx="8" />
          <text x="69" y="103">x</text>
          <rect x="28" y="174" width="82" height="54" rx="8" />
          <text x="69" y="205">w,b</text>
          <rect x="164" y="120" width="94" height="60" rx="8" />
          <text x="211" y="145">z=wx+b</text>
          <text x="211" y="166">{{ format(evaluation.z) }}</text>
          <rect x="306" y="120" width="88" height="60" rx="8" />
          <text x="350" y="145">sigmoid</text>
          <text x="350" y="166">{{ format(evaluation.prediction) }}</text>
          <rect x="438" y="120" width="62" height="60" rx="8" />
          <text x="469" y="145">loss</text>
          <text x="469" y="166">{{ format(evaluation.loss) }}</text>
          <path d="M110 99 C132 99,142 128,164 142" />
          <path d="M110 201 C132 201,142 172,164 158" />
          <path d="M258 150 H306" />
          <path d="M394 150 H438" />
        </g>
        <g class="backprop-block-lab__backward">
          <path d="M438 214 H394" />
          <path d="M306 214 H258" />
          <path d="M164 214 C136 214,128 210,110 201" />
          <path d="M164 234 C136 234,128 112,110 99" />
          <text x="416" y="236">dL/dp={{ format(evaluation.dLossDPrediction) }}</text>
          <text x="270" y="236">dL/dz={{ format(evaluation.dLossDZ) }}</text>
          <text x="78" y="258">dL/dw={{ format(evaluation.dLossDWeight) }}</text>
        </g>
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls backprop-block-lab__controls">
        <label>
          {{ copy.x }}: {{ x.toFixed(2) }}
          <input v-model.number="x" type="range" min="-2" max="2" step="0.05" />
        </label>
        <label>
          {{ copy.weight }}: {{ weight.toFixed(2) }}
          <input v-model.number="weight" type="range" min="-3" max="3" step="0.05" />
        </label>
        <label>
          {{ copy.bias }}: {{ bias.toFixed(2) }}
          <input v-model.number="bias" type="range" min="-2" max="2" step="0.05" />
        </label>
        <label>
          {{ copy.target }}: {{ target.toFixed(2) }}
          <input v-model.number="target" type="range" min="0" max="1" step="0.05" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article><span>z</span><strong>{{ format(evaluation.z) }}</strong></article>
        <article><span>prediction</span><strong>{{ format(evaluation.prediction) }}</strong></article>
        <article><span>loss</span><strong>{{ format(evaluation.loss) }}</strong></article>
        <article><span>{{ copy.upstream }}</span><strong>{{ format(evaluation.dLossDPrediction) }}</strong></article>
        <article><span>{{ copy.local }}</span><strong>{{ format(evaluation.dPredictionDZ) }}</strong></article>
        <article><span>dL/dw</span><strong>{{ format(evaluation.dLossDWeight) }}</strong></article>
        <article><span>dL/db</span><strong>{{ format(evaluation.dLossDBias) }}</strong></article>
        <article><span>{{ copy.check }}</span><strong>{{ format(evaluation.numericalWeightGradient) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.backprop-block-lab svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.backprop-block-lab rect {
  fill: #ffffff;
  stroke: #10162f;
  stroke-width: 2;
}

.backprop-block-lab path {
  fill: none;
  stroke-width: 3;
  marker-end: url(#backprop-arrow);
}

.backprop-block-lab marker path {
  fill: currentColor;
  stroke: none;
}

.backprop-block-lab__forward path {
  color: #3868ff;
  stroke: #3868ff;
}

.backprop-block-lab__backward path {
  color: #d65a31;
  stroke: #d65a31;
}

.backprop-block-lab text {
  fill: #10162f;
  font-size: 13px;
  font-weight: 900;
  text-anchor: middle;
}

.backprop-block-lab__backward text {
  fill: #8a341f;
  font-size: 12px;
}

.backprop-block-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .backprop-block-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
