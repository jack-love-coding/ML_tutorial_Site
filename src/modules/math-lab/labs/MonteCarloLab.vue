<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  estimatePiMonteCarlo,
  findLcgPeriod,
  lcgConfigForKind,
  lcgSequence,
  type MonteCarloGeneratorKind,
} from '../utils/monteCarlo'

const props = defineProps<{
  locale: MathLabLocale
}>()

const sampleCount = ref(1200)
const seed = ref(17)
const generatorKind = ref<MonteCarloGeneratorKind>('stable')

const labels = computed(() => {
  const zh = props.locale === 'zh-CN'
  return {
    eyebrow: zh ? '互动实验' : 'Interactive lab',
    title: zh ? '采样估计 π' : 'Sampling estimate of pi',
    subtitle: zh
      ? '用可复现的伪随机点估计四分之一圆面积，并观察样本数、seed 和周期对误差的影响。'
      : 'Estimate a quarter-circle area with reproducible pseudorandom points and watch how samples, seed, and period affect error.',
    samples: zh ? '样本数' : 'Samples',
    seed: zh ? 'Seed' : 'Seed',
    generator: zh ? '生成器' : 'Generator',
    stableGenerator: zh ? '长周期 LCG' : 'Long-period LCG',
    shortGenerator: zh ? '短周期 LCG' : 'Short-period LCG',
    piEstimate: zh ? 'π 估计' : 'pi estimate',
    absoluteError: zh ? '绝对误差' : 'absolute error',
    insideRatio: zh ? '圆内比例' : 'inside ratio',
    scaledError: zh ? '误差 × √N' : 'error × √N',
    period: zh ? '观测周期' : 'observed period',
    sequence: zh ? '序列片段' : 'sequence preview',
    convergence: zh ? '误差随样本数变化' : 'Error as samples grow',
    inside: zh ? '圆内' : 'inside',
    outside: zh ? '圆外' : 'outside',
    stableNote: zh
      ? '长周期生成器让点云覆盖更均匀。改变 seed 会换一条可复现路径；增加样本数时，误差整体按 1/√N 缩小。'
      : 'The long-period generator covers the square more evenly. Changing the seed chooses a reproducible path; increasing samples reduces error roughly like 1/sqrt(N).',
    shortNote: zh
      ? '短周期生成器很快重复。即使样本数继续增加，散点图也会出现重复条纹，有效信息没有同步增加。'
      : 'The short-period generator repeats quickly. Even as the sample count grows, the scatter plot shows repeated bands, so effective information does not grow at the same pace.',
    periodLong: zh ? '超过 5000 步未重复' : 'no repeat within 5000 steps',
  }
})

const estimate = computed(() =>
  estimatePiMonteCarlo({
    samples: sampleCount.value,
    seed: seed.value,
    generatorKind: generatorKind.value,
    visiblePoints: sampleCount.value,
  }),
)

const generatorConfig = computed(() => lcgConfigForKind(generatorKind.value, seed.value))

const period = computed(() => findLcgPeriod(generatorConfig.value, 5000))

const sequencePreview = computed(() =>
  lcgSequence(generatorConfig.value, 8).map((value) => (value / generatorConfig.value.modulus).toFixed(3)),
)

const errorBars = computed(() => {
  const counts = [100, 250, 500, 1000, 2000, 4000]
  const errors = counts.map((samples) =>
    estimatePiMonteCarlo({
      samples,
      seed: seed.value,
      generatorKind: generatorKind.value,
      visiblePoints: 0,
    }).absoluteError,
  )
  const maxError = Math.max(...errors, 0.001)

  return counts.map((samples, index) => {
    const height = Math.max(5, (errors[index] / maxError) * 86)
    return {
      samples,
      error: errors[index],
      x: 34 + index * 42,
      y: 112 - height,
      height,
    }
  })
})

const periodText = computed(() => period.value?.toString() ?? labels.value.periodLong)
const statusNote = computed(() =>
  generatorKind.value === 'stable' ? labels.value.stableNote : labels.value.shortNote,
)
const pointRadius = computed(() => {
  if (sampleCount.value >= 3500) return 1.45
  if (sampleCount.value >= 1800) return 1.75
  if (sampleCount.value >= 900) return 2.2
  return 3
})
</script>

<template>
  <section class="math-lab-card monte-carlo-lab">
    <div class="math-lab-card__visual monte-carlo-lab__visual">
      <svg class="monte-carlo-lab__plot" viewBox="0 0 320 320" role="img" :aria-label="labels.title">
        <title>{{ labels.title }}</title>
        <rect x="36" y="36" width="228" height="228" rx="8" />
        <path d="M36 36 A228 228 0 0 1 264 264" />
        <line x1="36" y1="264" x2="264" y2="264" />
        <line x1="36" y1="36" x2="36" y2="264" />
        <circle
          v-for="(point, index) in estimate.points"
          :key="index"
          :cx="36 + point.x * 228"
          :cy="264 - point.y * 228"
          :r="pointRadius"
          :class="{ 'is-inside': point.inside }"
        />
      </svg>

      <div class="monte-carlo-lab__legend" aria-hidden="true">
        <span><i class="is-inside"></i>{{ labels.inside }}</span>
        <span><i></i>{{ labels.outside }}</span>
      </div>

      <div class="monte-carlo-lab__sequence">
        <span>{{ labels.sequence }}</span>
        <strong>{{ sequencePreview.join(' · ') }}</strong>
      </div>

      <svg class="monte-carlo-lab__bars" viewBox="0 0 300 134" role="img" :aria-label="labels.convergence">
        <title>{{ labels.convergence }}</title>
        <line x1="24" y1="112" x2="286" y2="112" />
        <rect
          v-for="bar in errorBars"
          :key="bar.samples"
          :x="bar.x"
          :y="bar.y"
          width="24"
          :height="bar.height"
        />
        <text
          v-for="bar in errorBars"
          :key="`${bar.samples}-label`"
          :x="bar.x + 12"
          y="128"
          text-anchor="middle"
        >
          {{ bar.samples >= 1000 ? `${bar.samples / 1000}k` : bar.samples }}
        </text>
      </svg>
    </div>

    <div class="math-lab-card__controls monte-carlo-lab__controls">
      <header>
        <span>{{ labels.eyebrow }}</span>
        <strong>{{ labels.title }}</strong>
        <p>{{ labels.subtitle }}</p>
      </header>

      <div class="math-mini-controls">
        <label>
          {{ labels.samples }}: {{ sampleCount }}
          <input v-model.number="sampleCount" type="range" min="100" max="5000" step="100" />
        </label>

        <label>
          {{ labels.seed }}: {{ seed }}
          <input v-model.number="seed" type="range" min="1" max="97" step="1" />
        </label>

        <label>
          {{ labels.generator }}
          <select v-model="generatorKind">
            <option value="stable">{{ labels.stableGenerator }}</option>
            <option value="short-cycle">{{ labels.shortGenerator }}</option>
          </select>
        </label>
      </div>

      <div class="math-readout-grid">
        <article>
          <span>{{ labels.piEstimate }}</span>
          <strong>{{ estimate.estimate.toFixed(5) }}</strong>
        </article>
        <article>
          <span>{{ labels.absoluteError }}</span>
          <strong>{{ estimate.absoluteError.toFixed(5) }}</strong>
        </article>
        <article>
          <span>{{ labels.insideRatio }}</span>
          <strong>{{ (estimate.insideRatio * 100).toFixed(1) }}%</strong>
        </article>
        <article>
          <span>{{ labels.scaledError }}</span>
          <strong>{{ estimate.scaledError.toFixed(3) }}</strong>
        </article>
        <article>
          <span>{{ labels.period }}</span>
          <strong>{{ periodText }}</strong>
        </article>
        <article>
          <span>SE</span>
          <strong>{{ estimate.standardError.toFixed(4) }}</strong>
        </article>
      </div>

      <p class="math-lab-note">{{ statusNote }}</p>
    </div>
  </section>
</template>
