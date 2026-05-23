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
        subtitle: '切换分布和样本数，观察频率怎样形成长期形状。',
        distribution: '分布',
        samples: '样本数',
        seed: '随机种子',
        target: '目标分桶',
        mean: '均值',
        variance: '方差',
        frequency: '目标频率',
        uniform: '均匀',
        normal: '正态',
        binomial: '二项',
        note: '一次样本不能说明整体分布。样本越多，直方图越能显示长期频率形状。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Distribution Builder',
        subtitle: 'Switch distribution and sample count to see frequency become a long-run shape.',
        distribution: 'distribution',
        samples: 'samples',
        seed: 'random seed',
        target: 'target bin',
        mean: 'mean',
        variance: 'variance',
        frequency: 'target frequency',
        uniform: 'uniform',
        normal: 'normal',
        binomial: 'binomial',
        note: 'One sample cannot explain the whole distribution. More samples make the histogram reveal the long-run frequency shape.',
      },
)

const maxCount = computed(() => Math.max(...evaluation.value.bins.map((bin) => bin.count), 1))
const bars = computed(() =>
  evaluation.value.bins.map((bin, index) => ({
    ...bin,
    x: 48 + index * (312 / evaluation.value.bins.length),
    width: Math.max(18, 250 / evaluation.value.bins.length),
    height: (bin.count / maxCount.value) * 170,
    target: bin.value === evaluation.value.targetBin,
  })),
)

function format(value: number) {
  return value.toFixed(3)
}
</script>

<template>
  <section class="math-lab-card distribution-builder-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 420 280" role="img" :aria-label="copy.title">
        <line x1="38" y1="236" x2="382" y2="236" class="distribution-builder-lab__axis" />
        <g v-for="bar in bars" :key="bar.value">
          <rect
            :x="bar.x"
            :y="236 - bar.height"
            :width="bar.width"
            :height="bar.height"
            :class="{ 'is-target': bar.target }"
          />
          <text :x="bar.x + bar.width / 2" y="258">{{ bar.value }}</text>
          <text :x="bar.x + bar.width / 2" :y="Math.max(28, 226 - bar.height)">{{ bar.count }}</text>
        </g>
        <path
          v-if="kind === 'normal'"
          d="M52 226 C120 226 126 74 210 74 C294 74 300 226 368 226"
          class="distribution-builder-lab__shape"
        />
        <path
          v-else-if="kind === 'binomial'"
          d="M52 226 C120 226 154 178 192 136 C238 84 292 114 368 196"
          class="distribution-builder-lab__shape"
        />
        <line v-else x1="52" y1="132" x2="368" y2="132" class="distribution-builder-lab__shape" />
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
          {{ copy.target }}: {{ targetBin }}
          <input v-model.number="targetBin" type="range" min="0" :max="kind === 'binomial' ? 8 : 5" step="1" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.mean }}</span><strong>{{ format(evaluation.mean) }}</strong></article>
        <article><span>{{ copy.variance }}</span><strong>{{ format(evaluation.variance) }}</strong></article>
        <article><span>{{ copy.frequency }}</span><strong>{{ format(evaluation.targetFrequency) }}</strong></article>
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

.distribution-builder-lab__shape {
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

@media (max-width: 720px) {
  .distribution-builder-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
