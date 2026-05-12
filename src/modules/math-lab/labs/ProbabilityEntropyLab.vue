<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateProbabilityLab } from '../utils/aiBridgeMath'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const logits = ref([1.5, 0.3, -0.8])
const temperature = ref(1)
const targetIndex = ref(0)

const evaluation = computed(() =>
  evaluateProbabilityLab({
    logits: logits.value,
    temperature: temperature.value,
    targetIndex: targetIndex.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: 'Softmax 与交叉熵',
        subtitle: '调节 logits、温度和正确类别，观察概率语言如何形成 loss。',
        temperature: 'temperature',
        target: '正确类别',
        ce: '交叉熵',
        entropy: 'entropy',
        kl: 'KL 到均匀分布',
        targetProb: '正确类概率',
        note: '交叉熵只看正确类概率；softmax 温度会改变分布尖锐程度，但不会改变 logits 的排序。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Softmax and Cross Entropy',
        subtitle: 'Adjust logits, temperature, and target class to see probability language turn into loss.',
        temperature: 'temperature',
        target: 'target class',
        ce: 'cross entropy',
        entropy: 'entropy',
        kl: 'KL to uniform',
        targetProb: 'target probability',
        note: 'Cross entropy reads the target probability only; softmax temperature changes sharpness without changing the logit ranking.',
      },
)

function format(value: number, digits = 3) {
  return value.toFixed(digits)
}
</script>

<template>
  <section class="math-lab-card probability-entropy-lab">
    <div class="math-lab-card__visual probability-entropy-lab__visual">
      <svg viewBox="0 0 420 300" role="img" :aria-label="copy.title">
        <line x1="56" y1="248" x2="372" y2="248" class="probability-entropy-lab__axis" />
        <g v-for="(probability, index) in evaluation.probabilities" :key="index">
          <rect
            :x="88 + index * 96"
            :y="248 - probability * 190"
            width="54"
            :height="probability * 190"
            :class="{ 'is-target': index === targetIndex }"
          />
          <text :x="115 + index * 96" y="274">c{{ index }}</text>
          <text :x="115 + index * 96" :y="238 - probability * 190">{{ format(probability, 2) }}</text>
        </g>
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls probability-entropy-lab__controls">
        <label v-for="(_, index) in logits" :key="index">
          logit {{ index }}: {{ logits[index].toFixed(1) }}
          <input v-model.number="logits[index]" type="range" min="-4" max="4" step="0.1" />
        </label>
        <label>
          {{ copy.temperature }}: {{ temperature.toFixed(2) }}
          <input v-model.number="temperature" type="range" min="0.2" max="3" step="0.05" />
        </label>
        <label>
          {{ copy.target }}
          <select v-model.number="targetIndex">
            <option :value="0">class 0</option>
            <option :value="1">class 1</option>
            <option :value="2">class 2</option>
          </select>
        </label>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.ce }}</span><strong>{{ format(evaluation.crossEntropy) }}</strong></article>
        <article><span>{{ copy.entropy }}</span><strong>{{ format(evaluation.entropy) }}</strong></article>
        <article><span>{{ copy.kl }}</span><strong>{{ format(evaluation.klToUniform) }}</strong></article>
        <article><span>{{ copy.targetProb }}</span><strong>{{ format(evaluation.targetProbability) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.probability-entropy-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.probability-entropy-lab__axis {
  stroke: #10162f;
  stroke-width: 2;
}

.probability-entropy-lab rect {
  fill: #d8f6ff;
  stroke: #10162f;
  stroke-width: 2;
}

.probability-entropy-lab rect.is-target {
  fill: #ffd84d;
}

.probability-entropy-lab text {
  fill: #10162f;
  font-family: var(--font-display, system-ui);
  font-weight: 900;
  text-anchor: middle;
}

.probability-entropy-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .probability-entropy-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
