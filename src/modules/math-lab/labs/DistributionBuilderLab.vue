<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import { evaluateDistributionBuilder, type DistributionKind } from '../utils/beginnerFoundations'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const kind = ref<DistributionKind>('uniform')
const sampleCount = ref(300)
const seed = ref(11)
const targetBin = ref(2)

const samplePresets = [60, 300, 900]

const evaluation = computed(() =>
  evaluateDistributionBuilder({
    kind: kind.value,
    sampleCount: sampleCount.value,
    seed: seed.value,
    targetBin: targetBin.value,
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '分布构造器',
        subtitle: '先看一次样本的波动，再看很多样本怎样靠近长期概率。',
        distribution: '分布',
        samples: '样本数',
        seed: '随机种子',
        target: '目标分桶',
        mean: '样本均值',
        expectedMean: '理论均值',
        variance: '样本方差',
        targetFrequency: '目标频率',
        targetProbability: '理论概率',
        maxError: '最大误差',
        stability: '稳定度',
        uniform: '均匀',
        normal: '正态',
        binomial: '二项',
        theory: '虚线是理论概率',
        reset: '重置',
        note: '样本少时，柱子可能很不听话；样本多时，频率会更像背后的概率分布。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Distribution Builder',
        subtitle: 'Compare one noisy sample with the long-run probability it approaches.',
        distribution: 'distribution',
        samples: 'samples',
        seed: 'random seed',
        target: 'target bin',
        mean: 'sample mean',
        expectedMean: 'theory mean',
        variance: 'sample variance',
        targetFrequency: 'target frequency',
        targetProbability: 'theory probability',
        maxError: 'max error',
        stability: 'stability',
        uniform: 'uniform',
        normal: 'normal',
        binomial: 'binomial',
        theory: 'dashed line is theory',
        reset: 'reset',
        note: 'With few samples, bars can wander; with many samples, frequencies look more like the underlying distribution.',
      },
)

const maxCount = computed(() => Math.max(...evaluation.value.bins.map((bin) => bin.count), 1))
const bars = computed(() =>
  evaluation.value.bins.map((bin, index) => {
    const x = 48 + index * (312 / evaluation.value.bins.length)
    const width = Math.max(18, 250 / evaluation.value.bins.length)
    return {
      ...bin,
      x,
      width,
      center: x + width / 2,
      height: (bin.count / maxCount.value) * 170,
      probability: evaluation.value.probabilities[index] ?? 0,
      theory: evaluation.value.theoreticalProbabilities[index] ?? 0,
      target: bin.value === evaluation.value.targetBin,
    }
  }),
)

const theoryPath = computed(() => {
  const points = bars.value.map((bar) => {
    const expectedCount = bar.theory * evaluation.value.sampleCount
    return `${bar.center},${236 - (expectedCount / maxCount.value) * 170}`
  })
  return points.length ? `M ${points.join(' L ')}` : ''
})

function format(value: number, digits = 3) {
  return value.toFixed(digits)
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`
}

function setSamples(value: number) {
  sampleCount.value = value
}

function reset() {
  kind.value = 'uniform'
  sampleCount.value = 300
  seed.value = 11
  targetBin.value = 2
}
</script>

<template>
  <section class="math-lab-card distribution-builder-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 420 300" role="img" :aria-label="copy.title">
        <line x1="38" y1="236" x2="382" y2="236" class="distribution-builder-lab__axis" />
        <g v-for="bar in bars" :key="bar.value">
          <rect
            :x="bar.x"
            :y="236 - bar.height"
            :width="bar.width"
            :height="bar.height"
            :class="{ 'is-target': bar.target }"
          />
          <text :x="bar.center" y="258">{{ bar.value }}</text>
          <text :x="bar.center" :y="Math.max(28, 226 - bar.height)">{{ bar.count }}</text>
        </g>
        <path :d="theoryPath" class="distribution-builder-lab__theory" />
        <text x="222" y="292">{{ copy.theory }}</text>
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls distribution-builder-lab__controls">
        <label>
          {{ copy.distribution }}
          <select v-model="kind">
            <option value="uniform">{{ copy.uniform }}</option>
            <option value="normal">{{ copy.normal }}</option>
            <option value="binomial">{{ copy.binomial }}</option>
          </select>
        </label>
        <label>
          {{ copy.samples }}: {{ sampleCount }}
          <input v-model.number="sampleCount" type="range" min="30" max="900" step="30" />
        </label>
        <label>
          {{ copy.seed }}: {{ seed }}
          <input v-model.number="seed" type="range" min="1" max="40" step="1" />
        </label>
        <label>
          {{ copy.target }}: {{ evaluation.targetBin }}
          <input v-model.number="targetBin" type="range" min="0" :max="kind === 'binomial' ? 8 : 5" step="1" />
        </label>
      </div>

      <div class="distribution-builder-lab__quick-actions" :aria-label="copy.samples">
        <button v-for="preset in samplePresets" :key="preset" type="button" @click="setSamples(preset)">
          {{ preset }}
        </button>
        <button type="button" @click="reset">{{ copy.reset }}</button>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.mean }}</span><strong>{{ format(evaluation.mean) }}</strong></article>
        <article><span>{{ copy.expectedMean }}</span><strong>{{ format(evaluation.expectedMean) }}</strong></article>
        <article><span>{{ copy.variance }}</span><strong>{{ format(evaluation.variance) }}</strong></article>
        <article><span>{{ copy.targetFrequency }}</span><strong>{{ format(evaluation.targetFrequency) }}</strong></article>
        <article><span>{{ copy.targetProbability }}</span><strong>{{ format(evaluation.targetProbability) }}</strong></article>
        <article><span>{{ copy.maxError }}</span><strong>{{ format(evaluation.maxFrequencyError) }}</strong></article>
        <article><span>{{ copy.stability }}</span><strong>{{ formatPercent(evaluation.stabilityScore) }}</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.distribution-builder-lab svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.distribution-builder-lab__axis {
  stroke: #10162f;
  stroke-width: 2;
}

.distribution-builder-lab rect {
  fill: #9ee6ff;
  stroke: #10162f;
  stroke-width: 2;
}

.distribution-builder-lab rect.is-target {
  fill: #ffd84d;
}

.distribution-builder-lab__theory {
  fill: none;
  stroke: #ef6f6c;
  stroke-width: 3;
  stroke-dasharray: 7 6;
}

.distribution-builder-lab text {
  fill: #10162f;
  font-size: 11px;
  font-weight: 900;
  text-anchor: middle;
}

.distribution-builder-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.distribution-builder-lab__quick-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.distribution-builder-lab__quick-actions button {
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 6px;
  background: #fffef7;
  color: #10162f;
  cursor: pointer;
  font: inherit;
  font-weight: 900;
  padding: 0.38rem 0.65rem;
}

.distribution-builder-lab__quick-actions button:hover {
  background: #ffd84d;
}

@media (max-width: 720px) {
  .distribution-builder-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
