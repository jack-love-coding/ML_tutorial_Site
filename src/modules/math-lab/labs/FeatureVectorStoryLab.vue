<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
import { evaluateFeatureVectorStory } from '../utils/beginnerFoundations'

const props = withDefaults(defineProps<{
  locale?: MathLabLocale
}>(), {
  locale: 'zh-CN',
})

const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()

const practice = ref(2)
const mistakes = ref(5)
const score = ref(1)
const otherPractice = ref(3)
const otherMistakes = ref(4)
const otherScore = ref(1)

const evaluation = computed(() =>
  evaluateFeatureVectorStory({
    left: [practice.value, mistakes.value, score.value],
    right: [otherPractice.value, otherMistakes.value, otherScore.value],
    matrix: [[1, 0.5], [0.2, 1]],
  }),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        eyebrow: '互动实验',
        title: '特征向量故事',
        subtitle: '拖动两个学习记录，观察向量差、距离、方向相似度和矩阵投影。',
        learnerA: '样本 A',
        learnerB: '样本 B',
        practice: '练习次数',
        mistakes: '错题数',
        score: '分数强度',
        distance: '距离',
        cosine: 'cosine',
        dot: '点积',
        projected: '矩阵后 A',
        note: '距离读位置差，cosine 读方向相似。矩阵把前两个特征混合成新坐标。',
      }
    : {
        eyebrow: 'Interactive lab',
        title: 'Feature Vector Story',
        subtitle: 'Drag two learner records and watch vector difference, distance, directional similarity, and matrix projection.',
        learnerA: 'Sample A',
        learnerB: 'Sample B',
        practice: 'practice',
        mistakes: 'mistakes',
        score: 'score scale',
        distance: 'distance',
        cosine: 'cosine',
        dot: 'dot',
        projected: 'A after matrix',
        note: 'Distance reads position gap, while cosine reads directional similarity. The matrix mixes the first two features into new coordinates.',
      },
)

function format(value: number) {
  return value.toFixed(2)
}

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'linear-algebra-feature-space',
  sourceId: 'feature-vector-story-lab',
  summary: {
    'zh-CN': '两个学习记录被读取为三维特征向量，并可比较距离、方向和投影。',
    en: 'Two learner records are read as 3D feature vectors, then compared by distance, direction, and projection.',
  },
  metrics: [
    { label: { 'zh-CN': '样本 A 向量', en: 'Sample A vector' }, value: [practice.value, mistakes.value, score.value].map(format).join(', ') },
    { label: { 'zh-CN': '样本 B 向量', en: 'Sample B vector' }, value: [otherPractice.value, otherMistakes.value, otherScore.value].map(format).join(', ') },
    { label: { 'zh-CN': '距离', en: 'distance' }, value: format(evaluation.value.distance) },
    { label: { 'zh-CN': 'cosine', en: 'cosine' }, value: format(evaluation.value.cosine) },
    { label: { 'zh-CN': '矩阵后 A', en: 'A after matrix' }, value: evaluation.value.projectedLeft.map(format).join(', ') },
  ],
  prompt: {
    'zh-CN': '解释为什么练习次数、错题数和分数强度要作为一个整体描述学习状态。',
    en: 'Explain why practice count, mistakes, and score scale should describe the learning state as one whole.',
  },
}))

watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)

function pointX(values: number[]) {
  return 56 + (values[0] ?? 0) * 28
}

function pointY(values: number[]) {
  return 250 - (values[1] ?? 0) * 28
}
</script>

<template>
  <section class="math-lab-card feature-vector-story-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 360 300" role="img" :aria-label="copy.title">
        <path d="M56 250 H304 M56 250 V36" class="feature-vector-story-lab__axis" />
        <path
          v-for="tick in 8"
          :key="tick"
          :d="`M ${56 + tick * 28} 250 V246 M56 ${250 - tick * 28} H60`"
          class="feature-vector-story-lab__tick"
        />
        <line x1="56" y1="250" :x2="pointX([practice, mistakes])" :y2="pointY([practice, mistakes])" class="feature-vector-story-lab__vector-a" />
        <line x1="56" y1="250" :x2="pointX([otherPractice, otherMistakes])" :y2="pointY([otherPractice, otherMistakes])" class="feature-vector-story-lab__vector-b" />
        <line
          :x1="pointX([practice, mistakes])"
          :y1="pointY([practice, mistakes])"
          :x2="pointX([otherPractice, otherMistakes])"
          :y2="pointY([otherPractice, otherMistakes])"
          class="feature-vector-story-lab__difference"
        />
        <circle :cx="pointX([practice, mistakes])" :cy="pointY([practice, mistakes])" r="8" class="feature-vector-story-lab__point-a" />
        <circle :cx="pointX([otherPractice, otherMistakes])" :cy="pointY([otherPractice, otherMistakes])" r="8" class="feature-vector-story-lab__point-b" />
        <rect x="225" y="52" width="74" height="54" rx="8" class="feature-vector-story-lab__matrix" />
        <text x="262" y="84">W</text>
        <path
          :d="`M ${pointX([practice, mistakes])} ${pointY([practice, mistakes])} C220 180 218 110 225 82`"
          class="feature-vector-story-lab__project-path"
        />
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.eyebrow }}</span>
        <strong>{{ copy.title }}</strong>
        <p>{{ copy.subtitle }}</p>
      </header>

      <div class="math-mini-controls feature-vector-story-lab__controls">
        <label>
          {{ copy.learnerA }} {{ copy.practice }}: {{ practice }}
          <input v-model.number="practice" type="range" min="0" max="8" step="1" />
        </label>
        <label>
          {{ copy.learnerA }} {{ copy.mistakes }}: {{ mistakes }}
          <input v-model.number="mistakes" type="range" min="0" max="8" step="1" />
        </label>
        <label>
          {{ copy.learnerA }} {{ copy.score }}: {{ score }}
          <input v-model.number="score" type="range" min="0" max="4" step="1" />
        </label>
        <label>
          {{ copy.learnerB }} {{ copy.practice }}: {{ otherPractice }}
          <input v-model.number="otherPractice" type="range" min="0" max="8" step="1" />
        </label>
        <label>
          {{ copy.learnerB }} {{ copy.mistakes }}: {{ otherMistakes }}
          <input v-model.number="otherMistakes" type="range" min="0" max="8" step="1" />
        </label>
        <label>
          {{ copy.learnerB }} {{ copy.score }}: {{ otherScore }}
          <input v-model.number="otherScore" type="range" min="0" max="4" step="1" />
        </label>
      </div>

      <div class="math-readout-grid">
        <article><span>{{ copy.distance }}</span><strong>{{ format(evaluation.distance) }}</strong></article>
        <article><span>{{ copy.cosine }}</span><strong>{{ format(evaluation.cosine) }}</strong></article>
        <article><span>{{ copy.dot }}</span><strong>{{ format(evaluation.dot) }}</strong></article>
        <article><span>{{ copy.projected }}</span><strong>[{{ evaluation.projectedLeft.map(format).join(', ') }}]</strong></article>
      </div>

      <p class="math-lab-note">{{ copy.note }}</p>
    </div>
  </section>
</template>

<style scoped>
.feature-vector-story-lab svg {
  display: block;
  width: 100%;
  min-height: 300px;
  border: 2px solid var(--pixel-line, #10162f);
  border-radius: 8px;
  background: #fffef7;
}

.feature-vector-story-lab__axis,
.feature-vector-story-lab__tick {
  fill: none;
  stroke: #10162f;
  stroke-width: 2;
}

.feature-vector-story-lab__tick {
  opacity: 0.28;
}

.feature-vector-story-lab__vector-a,
.feature-vector-story-lab__vector-b,
.feature-vector-story-lab__difference,
.feature-vector-story-lab__project-path {
  fill: none;
  stroke-width: 3;
}

.feature-vector-story-lab__vector-a,
.feature-vector-story-lab__point-a {
  stroke: #10162f;
  fill: #ffd84d;
}

.feature-vector-story-lab__vector-b,
.feature-vector-story-lab__point-b {
  stroke: #10162f;
  fill: #9ee6ff;
}

.feature-vector-story-lab__difference {
  stroke: #ef6f6c;
  stroke-dasharray: 6 6;
}

.feature-vector-story-lab__project-path {
  stroke: #0f9f7a;
}

.feature-vector-story-lab__matrix {
  fill: #e9f8f5;
  stroke: #10162f;
  stroke-width: 2;
}

.feature-vector-story-lab text {
  fill: #10162f;
  font-weight: 900;
  text-anchor: middle;
}

.feature-vector-story-lab__controls {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (max-width: 720px) {
  .feature-vector-story-lab__controls {
    grid-template-columns: 1fr;
  }
}
</style>
