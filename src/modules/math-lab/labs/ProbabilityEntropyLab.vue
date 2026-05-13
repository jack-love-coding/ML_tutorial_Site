<script setup lang="ts">
import * as d3 from 'd3'
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { calibrationBins, evaluateKLDirections, evaluateProbabilityLab } from '../utils/aiBridgeMath'

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

const referenceDistribution = [0.62, 0.26, 0.12]

const klDirections = computed(() => evaluateKLDirections(evaluation.value.probabilities, referenceDistribution))

const calibration = computed(() =>
  calibrationBins([
    { confidence: 0.18, correct: false },
    { confidence: 0.34, correct: true },
    { confidence: 0.46, correct: false },
    { confidence: 0.58, correct: true },
    { confidence: 0.67, correct: true },
    { confidence: 0.75, correct: false },
    { confidence: 0.84, correct: true },
    { confidence: 0.91, correct: true },
    { confidence: Math.max(...evaluation.value.probabilities), correct: targetIndex.value === 0 },
  ], 5),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: 'Softmax、熵与校准',
        subtitle: '联动 logits、温度、目标类别、概率单纯形、KL 方向和校准曲线。',
        temperature: 'temperature',
        target: '正确类别',
        ce: '交叉熵',
        entropy: 'entropy',
        klForward: 'KL(p||q)',
        klReverse: 'KL(q||p)',
        calibrationGap: '校准 gap',
        targetProb: '正确类概率',
        note: '交叉熵只读取目标类别概率；温度改变分布尖锐程度；KL 的方向不同会得到不同惩罚。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Softmax, Entropy, and Calibration',
        subtitle: 'Link logits, temperature, target class, simplex position, KL direction, and calibration.',
        temperature: 'temperature',
        target: 'target class',
        ce: 'cross entropy',
        entropy: 'entropy',
        klForward: 'KL(p||q)',
        klReverse: 'KL(q||p)',
        calibrationGap: 'calibration gap',
        targetProb: 'target probability',
        note: 'Cross entropy reads the target probability; temperature changes sharpness; KL direction changes the penalty.',
      },
)

const simplexVertices = [
  { x: 112, y: 248 },
  { x: 216, y: 70 },
  { x: 320, y: 248 },
] as const

const simplexPoint = computed(() => {
  const [p0 = 0, p1 = 0, p2 = 0] = evaluation.value.probabilities
  return {
    x: p0 * simplexVertices[0].x + p1 * simplexVertices[1].x + p2 * simplexVertices[2].x,
    y: p0 * simplexVertices[0].y + p1 * simplexVertices[1].y + p2 * simplexVertices[2].y,
  }
})

const barData = computed(() => {
  const yScale = d3.scaleLinear().domain([0, 1]).range([0, 168])
  return evaluation.value.probabilities.map((probability, index) => ({
    id: `c${index}`,
    x: 376 + index * 48,
    y: 248 - yScale(probability),
    height: yScale(probability),
    probability,
    target: index === targetIndex.value,
  }))
})

const calibrationPath = computed(() => {
  const x = d3.scaleLinear().domain([0, 1]).range([376, 508])
  const y = d3.scaleLinear().domain([0, 1]).range([336, 264])
  const line = d3.line<{ averageConfidence: number; accuracy: number }>()
    .x((point) => x(point.averageConfidence))
    .y((point) => y(point.accuracy))
    .curve(d3.curveMonotoneX)
  return line(calibration.value) ?? ''
})

const calibrationBars = computed(() => {
  const x = d3.scaleBand<number>().domain(calibration.value.map((point) => point.bin)).range([376, 508]).padding(0.24)
  const y = d3.scaleLinear().domain([0, 1]).range([336, 264])
  return calibration.value.map((point) => ({
    ...point,
    x: x(point.bin) ?? 376,
    y: y(point.accuracy),
    width: x.bandwidth(),
    height: 336 - y(point.accuracy),
  }))
})

const meanCalibrationGap = computed(() =>
  calibration.value.reduce((sum, point) => sum + point.gap, 0) / calibration.value.length,
)

function format(value: number, digits = 3) {
  return value.toFixed(digits)
}
</script>

<template>
  <section class="math-lab-card probability-entropy-lab">
    <div class="math-lab-card__visual probability-entropy-lab__visual">
      <svg viewBox="0 0 540 360" role="img" :aria-label="copy.title">
        <path
          :d="`M ${simplexVertices[0].x} ${simplexVertices[0].y} L ${simplexVertices[1].x} ${simplexVertices[1].y} L ${simplexVertices[2].x} ${simplexVertices[2].y} Z`"
          class="probability-entropy-lab__simplex"
        />
        <line
          v-for="(vertex, index) in simplexVertices"
          :key="`simplex-ray-${index}`"
          :x1="simplexPoint.x"
          :y1="simplexPoint.y"
          :x2="vertex.x"
          :y2="vertex.y"
          class="probability-entropy-lab__simplex-ray"
        />
        <circle :cx="simplexPoint.x" :cy="simplexPoint.y" r="12" class="probability-entropy-lab__simplex-point" />

        <line x1="360" y1="248" x2="520" y2="248" class="probability-entropy-lab__axis" />
        <g v-for="bar in barData" :key="bar.id">
          <rect
            :x="bar.x"
            :y="bar.y"
            width="28"
            :height="bar.height"
            :class="{ 'is-target': bar.target }"
          />
          <text :x="bar.x + 14" y="272">{{ bar.id }}</text>
          <text :x="bar.x + 14" :y="Math.max(32, bar.y - 8)">{{ format(bar.probability, 2) }}</text>
        </g>

        <line x1="376" y1="336" x2="508" y2="336" class="probability-entropy-lab__axis" />
        <line x1="376" y1="336" x2="376" y2="264" class="probability-entropy-lab__axis" />
        <line x1="376" y1="336" x2="508" y2="264" class="probability-entropy-lab__calibration-reference" />
        <rect
          v-for="bin in calibrationBars"
          :key="bin.bin"
          :x="bin.x"
          :y="bin.y"
          :width="bin.width"
          :height="bin.height"
          class="probability-entropy-lab__calibration-bin"
        />
        <path :d="calibrationPath" class="probability-entropy-lab__calibration-line" />
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
        <article><span>{{ copy.klForward }}</span><strong>{{ format(klDirections.leftToRight) }}</strong></article>
        <article><span>{{ copy.klReverse }}</span><strong>{{ format(klDirections.rightToLeft) }}</strong></article>
        <article><span>{{ copy.targetProb }}</span><strong>{{ format(evaluation.targetProbability) }}</strong></article>
        <article><span>{{ copy.calibrationGap }}</span><strong>{{ format(meanCalibrationGap) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.probability-entropy-lab__visual svg {
  display: block;
  width: 100%;
  min-height: 340px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.probability-entropy-lab__simplex {
  fill: #ffffff;
  stroke: #10162f;
  stroke-width: 2.4;
}

.probability-entropy-lab__simplex-ray {
  stroke: rgba(16, 22, 47, 0.16);
  stroke-width: 2;
}

.probability-entropy-lab__simplex-point {
  fill: #ffd84d;
  stroke: #10162f;
  stroke-width: 2.5;
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

.probability-entropy-lab__calibration-bin {
  fill: rgba(15, 159, 122, 0.32);
}

.probability-entropy-lab__calibration-line,
.probability-entropy-lab__calibration-reference {
  fill: none;
  stroke-width: 2.5;
}

.probability-entropy-lab__calibration-line {
  stroke: #0f9f7a;
}

.probability-entropy-lab__calibration-reference {
  stroke: rgba(16, 22, 47, 0.28);
  stroke-dasharray: 5 5;
}

.probability-entropy-lab text {
  fill: #10162f;
  font-family: var(--font-display, system-ui);
  font-size: 11px;
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
