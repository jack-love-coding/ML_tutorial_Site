<script setup lang="ts">
import { computed, ref } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  cosineSimilarityN,
  dotN,
  euclideanDistance,
  l2NormN,
  round,
  vectorDifference,
  type VectorN,
} from '../utils/math'

const props = withDefaults(defineProps<{ locale?: MathLabLocale }>(), {
  locale: 'zh-CN',
})

type ScenarioId = 'student' | 'recommendation' | 'embedding'

interface Scenario {
  id: ScenarioId
  label: Record<MathLabLocale, string>
  dimensions: Record<MathLabLocale, string[]>
  aLabel: Record<MathLabLocale, string>
  bLabel: Record<MathLabLocale, string>
  a: VectorN
  b: VectorN
}

const scenarios: Scenario[] = [
  {
    id: 'student',
    label: { 'zh-CN': '学生学习记录', en: 'Learner record' },
    dimensions: { 'zh-CN': ['练习次数', '错题数', '测验分'], en: ['practice', 'mistakes', 'score'] },
    aLabel: { 'zh-CN': '小林', en: 'Lin' },
    bLabel: { 'zh-CN': '小周', en: 'Zhou' },
    a: [2, 5, 80],
    b: [3, 4, 82],
  },
  {
    id: 'recommendation',
    label: { 'zh-CN': '电影偏好', en: 'Movie preference' },
    dimensions: { 'zh-CN': ['动作片', '喜剧片', '科幻片'], en: ['action', 'comedy', 'sci-fi'] },
    aLabel: { 'zh-CN': '用户 A', en: 'User A' },
    bLabel: { 'zh-CN': '用户 B', en: 'User B' },
    a: [0.8, 0.2, 0.9],
    b: [0.7, 0.3, 0.95],
  },
  {
    id: 'embedding',
    label: { 'zh-CN': '句子 embedding', en: 'Sentence embedding' },
    dimensions: { 'zh-CN': ['学习', 'AI', '电影'], en: ['learning', 'AI', 'movie'] },
    aLabel: { 'zh-CN': '我想学机器学习', en: 'I want to learn ML' },
    bLabel: { 'zh-CN': '我想了解人工智能', en: 'I want to understand AI' },
    a: [0.92, 0.88, 0.05],
    b: [0.86, 0.9, 0.08],
  },
]

const selectedScenarioId = ref<ScenarioId>('student')
const scenario = computed(() => scenarios.find((item) => item.id === selectedScenarioId.value) ?? scenarios[0]!)
const diff = computed(() => vectorDifference(scenario.value.b, scenario.value.a))
const distance = computed(() => euclideanDistance(scenario.value.a, scenario.value.b))
const normA = computed(() => l2NormN(scenario.value.a))
const normB = computed(() => l2NormN(scenario.value.b))
const dot = computed(() => dotN(scenario.value.a, scenario.value.b))
const cosine = computed(() => cosineSimilarityN(scenario.value.a, scenario.value.b))

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        title: '距离和方向实验',
        subtitle: '同一套计算，换三个场景看一遍',
        scenario: '案例',
        difference: '差向量',
        distance: '欧几里得距离',
        norm: '向量长度',
        dot: '点积',
        cosine: 'cosine',
        reset: '重置案例',
        explanation: cosine.value > 0.95
          ? '方向非常接近。即使长度不同，这两个对象的模式也很像。'
          : '方向没有完全对齐。这里要分开看距离和方向。',
      }
    : {
        title: 'Distance and Direction Lab',
        subtitle: 'Use the same calculations across three contexts',
        scenario: 'Scenario',
        difference: 'Difference vector',
        distance: 'Euclidean distance',
        norm: 'Vector length',
        dot: 'dot product',
        cosine: 'cosine',
        reset: 'Reset scenario',
        explanation: cosine.value > 0.95
          ? 'The directions are very close. Even with different lengths, the patterns are similar.'
          : 'The directions are not fully aligned. Read distance and direction separately.',
      },
)
</script>

<template>
  <section class="math-lab-card vector-similarity-lab">
    <div class="math-lab-card__visual vector-similarity-lab__visual" aria-live="polite">
      <header>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.subtitle }}</strong>
      </header>
      <div class="vector-similarity-bars">
        <article v-for="(_, index) in scenario.a" :key="scenario.dimensions[locale][index]">
          <span>{{ scenario.dimensions[locale][index] }}</span>
          <div>
            <i :style="{ width: `${Math.min(100, Math.abs(scenario.a[index]!) * 100)}%` }" />
            <b :style="{ width: `${Math.min(100, Math.abs(scenario.b[index]!) * 100)}%` }" />
          </div>
        </article>
      </div>
      <p>{{ copy.explanation }}</p>
    </div>

    <div class="math-lab-card__controls">
      <label>
        {{ copy.scenario }}
        <select v-model="selectedScenarioId">
          <option v-for="item in scenarios" :key="item.id" :value="item.id">
            {{ item.label[locale] }}
          </option>
        </select>
      </label>

      <div class="math-readout-grid">
        <article><span>{{ copy.difference }}</span><strong>[{{ diff.map((value) => round(value, 2)).join(', ') }}]</strong></article>
        <article><span>{{ copy.distance }}</span><strong>{{ round(distance, 3) }}</strong></article>
        <article><span>{{ copy.norm }}</span><strong>{{ round(normA, 2) }} / {{ round(normB, 2) }}</strong></article>
        <article><span>{{ copy.dot }}</span><strong>{{ round(dot, 3) }}</strong></article>
        <article><span>{{ copy.cosine }}</span><strong>{{ round(cosine, 3) }}</strong></article>
      </div>
    </div>
  </section>
</template>
