<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'
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

const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()

type ObjectId = 'cat' | 'dog' | 'car' | 'robot'
type DimensionId = 'warmth' | 'independence' | 'mobility'
type AnswerDimensionId = 'concept' | 'evidence' | 'clarity'

interface VectorDimension {
  id: DimensionId
  label: Record<MathLabLocale, string>
}

interface ObjectVector {
  id: ObjectId
  label: Record<MathLabLocale, string>
  description: Record<MathLabLocale, string>
  vector: VectorN
}

interface AnswerDimension {
  id: AnswerDimensionId
  label: Record<MathLabLocale, string>
}

const dimensions: VectorDimension[] = [
  { id: 'warmth', label: { 'zh-CN': '亲近感', en: 'warmth' } },
  { id: 'independence', label: { 'zh-CN': '独立性', en: 'independence' } },
  { id: 'mobility', label: { 'zh-CN': '移动能力', en: 'mobility' } },
]

const objectVectors: ObjectVector[] = [
  {
    id: 'cat',
    label: { 'zh-CN': '猫', en: 'Cat' },
    description: { 'zh-CN': '亲近但更独立，移动能力中等。', en: 'Warm but independent, with moderate mobility.' },
    vector: [0.72, 0.9, 0.52],
  },
  {
    id: 'dog',
    label: { 'zh-CN': '狗', en: 'Dog' },
    description: { 'zh-CN': '很亲近，独立性较低，移动能力高。', en: 'Very warm, less independent, and highly mobile.' },
    vector: [0.95, 0.34, 0.76],
  },
  {
    id: 'car',
    label: { 'zh-CN': '汽车', en: 'Car' },
    description: { 'zh-CN': '不具备亲近感，但移动能力非常高。', en: 'Not socially warm, but extremely mobile.' },
    vector: [0.04, 0.12, 1],
  },
  {
    id: 'robot',
    label: { 'zh-CN': '家用机器人', en: 'Home robot' },
    description: { 'zh-CN': '有服务亲近感，也能移动，独立性较高。', en: 'Service-oriented, mobile, and fairly independent.' },
    vector: [0.62, 0.74, 0.68],
  },
]

const answerDimensions: AnswerDimension[] = [
  { id: 'concept', label: { 'zh-CN': '概念命中', en: 'concept match' } },
  { id: 'evidence', label: { 'zh-CN': '证据/例子', en: 'evidence' } },
  { id: 'clarity', label: { 'zh-CN': '表达清晰', en: 'clarity' } },
]

const studentAnswer = {
  label: { 'zh-CN': '学生答案', en: 'Student answer' },
  text: {
    'zh-CN': 'cosine 看方向，所以两个长度不同但比例接近的向量也可能很像。',
    en: 'Cosine reads direction, so vectors with different lengths can still be similar when their ratios align.',
  },
  scores: [0.86, 0.58, 0.78],
}

const referenceAnswer = {
  label: { 'zh-CN': '参考答案', en: 'Reference answer' },
  text: {
    'zh-CN': 'cosine similarity 比较向量方向；点积还会受长度影响，欧几里得距离比较坐标差。',
    en: 'Cosine similarity compares vector direction; dot product is also affected by length, while Euclidean distance compares coordinate gaps.',
  },
  scores: [1, 1, 1],
}

const selectedLeftId = ref<ObjectId>('cat')
const selectedRightId = ref<ObjectId>('dog')
const dimensionWeights = ref<VectorN>([1, 1, 1])
const answerWeights = ref<VectorN>([1.2, 1.4, 1])

const objectPairs = objectVectors.flatMap((left, leftIndex) =>
  objectVectors.slice(leftIndex + 1).map((right) => ({ left, right })),
)

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        title: '向量相似度实验',
        subtitle: '从 3 个以上对象里选 pair，再调维度权重',
        objectA: '对象 A',
        objectB: '对象 B',
        weights: '维度权重',
        weight: '权重',
        weightedDifference: '加权差向量',
        weightedDistance: '加权欧几里得距离',
        weightedDot: '加权点积',
        weightedCosine: '加权 cosine similarity',
        closestPair: '当前最近 pair',
        mostSimilarPair: '当前最像 pair',
        unavailablePair: '没有有效维度，无法比较最近/最像',
        answerTitle: '学生答案 vs 参考答案',
        answerSubtitle: '把评分维度也看成向量',
        studentScore: '总分',
        answerSimilarity: '答案相似度',
        answerDistance: '答案距离',
        unavailableRubric: '不可评分：请至少打开一个评分权重',
        zeroObject:
          '所有对象维度权重都是 0，没有有效维度，无法比较最近/最像；cosine 用 0 作为安全 fallback，避免 NaN/Infinity。',
        zeroAnswer:
          '所有评分权重都是 0，暂时不可评分。请至少打开一个评分权重，再读取总分、距离和相似度。',
      }
    : {
        title: 'Vector Similarity Lab',
        subtitle: 'Choose a pair from 3+ objects, then tune dimension weights',
        objectA: 'Object A',
        objectB: 'Object B',
        weights: 'Dimension weights',
        weight: 'weight',
        weightedDifference: 'Weighted difference vector',
        weightedDistance: 'Weighted Euclidean distance',
        weightedDot: 'Weighted dot product',
        weightedCosine: 'Weighted cosine similarity',
        closestPair: 'Closest pair now',
        mostSimilarPair: 'Most similar pair now',
        unavailablePair: 'No active dimensions, so closest/most similar cannot be compared',
        answerTitle: 'Student Answer vs Reference Answer',
        answerSubtitle: 'Treat rubric scores as another vector',
        studentScore: 'Total score',
        answerSimilarity: 'Answer similarity',
        answerDistance: 'Answer distance',
        unavailableRubric: 'Not scorable: enable at least one rubric weight',
        zeroObject:
          'All object dimension weights are 0, so there are no active dimensions for closest/most similar comparison; cosine safely falls back to 0 to avoid NaN/Infinity.',
        zeroAnswer:
          'All rubric weights are 0, so this answer is not scorable yet. Enable at least one rubric weight before reading score, distance, and similarity.',
      },
)

function finiteOrZero(value: number) {
  return Number.isFinite(value) ? value : 0
}

function safeWeight(value: number) {
  return Math.max(0, Math.min(2, finiteOrZero(value)))
}

function applyWeights(vector: readonly number[], weights: readonly number[]) {
  return vector.map((value, index) => finiteOrZero(value) * Math.sqrt(safeWeight(weights[index] ?? 0)))
}

function objectFor(id: ObjectId) {
  return objectVectors.find((item) => item.id === id) ?? objectVectors[0]!
}

function firstOtherObjectId(id: ObjectId) {
  return objectVectors.find((item) => item.id !== id)?.id ?? id
}

function weightedDistanceFor(left: readonly number[], right: readonly number[], weights: readonly number[]) {
  return euclideanDistance(applyWeights(left, weights), applyWeights(right, weights))
}

function weightedCosineFor(left: readonly number[], right: readonly number[], weights: readonly number[]) {
  return cosineSimilarityN(applyWeights(left, weights), applyWeights(right, weights))
}

function pairLabel(pair: { left: ObjectVector; right: ObjectVector }) {
  return `${pair.left.label[props.locale]} / ${pair.right.label[props.locale]}`
}

function barWidth(value: number) {
  return `${Math.max(0, Math.min(100, finiteOrZero(value) * 100))}%`
}

const leftObject = computed(() => objectFor(selectedLeftId.value))
const rightObject = computed(() => objectFor(selectedRightId.value))
const weightControls = computed(() =>
  dimensions.map((dimension, index) => ({
    ...dimension,
    value: safeWeight(dimensionWeights.value[index] ?? 0),
  })),
)
const answerWeightControls = computed(() =>
  answerDimensions.map((dimension, index) => ({
    ...dimension,
    value: safeWeight(answerWeights.value[index] ?? 0),
    studentScore: finiteOrZero(studentAnswer.scores[index] ?? 0),
    referenceScore: finiteOrZero(referenceAnswer.scores[index] ?? 0),
  })),
)

const weightedLeftVector = computed(() => applyWeights(leftObject.value.vector, dimensionWeights.value))
const weightedRightVector = computed(() => applyWeights(rightObject.value.vector, dimensionWeights.value))
const weightedDifference = computed(() => vectorDifference(weightedRightVector.value, weightedLeftVector.value))
const weightedDistance = computed(() => euclideanDistance(weightedLeftVector.value, weightedRightVector.value))
const weightedDot = computed(() => dotN(weightedLeftVector.value, weightedRightVector.value))
const weightedCosine = computed(() => cosineSimilarityN(weightedLeftVector.value, weightedRightVector.value))
const hasActiveWeights = computed(() => weightControls.value.some((item) => item.value > 0))
const hasZeroWeightedVector = computed(() => l2NormN(weightedLeftVector.value) === 0 || l2NormN(weightedRightVector.value) === 0)
const zeroVectorNote = computed(() => (hasZeroWeightedVector.value ? copy.value.zeroObject : ''))
const unavailablePairLabel = computed(() => copy.value.unavailablePair)

const closestPair = computed(() => {
  if (!hasActiveWeights.value) return null

  return objectPairs.reduce((best, pair) => {
    const pairDistance = weightedDistanceFor(pair.left.vector, pair.right.vector, dimensionWeights.value)
    const bestDistance = weightedDistanceFor(best.left.vector, best.right.vector, dimensionWeights.value)
    return pairDistance < bestDistance ? pair : best
  }, objectPairs[0]!)
})
const mostSimilarPair = computed(() => {
  if (!hasActiveWeights.value) return null

  return objectPairs.reduce((best, pair) => {
    const pairSimilarity = weightedCosineFor(pair.left.vector, pair.right.vector, dimensionWeights.value)
    const bestSimilarity = weightedCosineFor(best.left.vector, best.right.vector, dimensionWeights.value)
    return pairSimilarity > bestSimilarity ? pair : best
  }, objectPairs[0]!)
})
const closestPairLabel = computed(() => (closestPair.value ? pairLabel(closestPair.value) : unavailablePairLabel.value))
const mostSimilarPairLabel = computed(() => (mostSimilarPair.value ? pairLabel(mostSimilarPair.value) : unavailablePairLabel.value))
const dominantDimension = computed(() =>
  weightControls.value.reduce((best, item) => (item.value > best.value ? item : best), weightControls.value[0]!),
)
const weightedExplanation = computed(() => {
  if (!hasActiveWeights.value || zeroVectorNote.value) return zeroVectorNote.value

  if (props.locale === 'zh-CN') {
    return `现在最重视「${dominantDimension.value.label['zh-CN']}」。权重改变了我们认为哪两个对象更近/更像：加权距离最小的是 ${closestPairLabel.value}，加权 cosine 最高的是 ${mostSimilarPairLabel.value}。`
  }

  return `The strongest weight is "${dominantDimension.value.label.en}". Weights change which objects we call close or similar: the smallest weighted distance is ${closestPairLabel.value}, while the highest weighted cosine is ${mostSimilarPairLabel.value}.`
})

const answerWeightedStudent = computed(() => applyWeights(studentAnswer.scores, answerWeights.value))
const answerWeightedReference = computed(() => applyWeights(referenceAnswer.scores, answerWeights.value))
const answerDistance = computed(() => euclideanDistance(answerWeightedStudent.value, answerWeightedReference.value))
const answerSimilarity = computed(() => cosineSimilarityN(answerWeightedStudent.value, answerWeightedReference.value))
const answerWeightTotal = computed(() => answerWeights.value.reduce((sum, value) => sum + safeWeight(value), 0))
const hasActiveRubricWeights = computed(() => answerWeightTotal.value > 0)
const unavailableRubricLabel = computed(() => copy.value.unavailableRubric)
const scorePercent = computed(() => {
  if (!hasActiveRubricWeights.value) return 0
  const weightedScore = dotN(studentAnswer.scores, answerWeights.value) / answerWeightTotal.value
  return round(Math.max(0, Math.min(1, weightedScore)) * 100, 1)
})
const weakestAnswerDimension = computed(() =>
  answerWeightControls.value.reduce((weakest, item) => {
    const weightedGap = item.value * Math.max(0, item.referenceScore - item.studentScore)
    const weakestGap = weakest.value * Math.max(0, weakest.referenceScore - weakest.studentScore)
    return weightedGap > weakestGap ? item : weakest
  }, answerWeightControls.value[0]!),
)
const answerExplanation = computed(() => {
  if (!hasActiveRubricWeights.value) return copy.value.zeroAnswer

  const weakDimension = weakestAnswerDimension.value.label[props.locale]

  if (props.locale === 'zh-CN') {
    return scorePercent.value >= 85
      ? `分数较高，因为学生答案抓住了主要概念；当前主要扣分来自「${weakDimension}」这个维度。`
      : `分数被「${weakDimension}」拉低：这个维度权重较高，但学生答案和参考答案还有明显差距。`
  }

  return scorePercent.value >= 85
    ? `The score is high because the answer captures the main concept; the main remaining deduction comes from "${weakDimension}".`
    : `The score is pulled down by "${weakDimension}": that dimension has meaningful weight, and the student answer still differs from the reference.`
})

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'linear-algebra-distance-similarity',
  sourceId: 'vector-similarity-lab',
  summary: {
    'zh-CN': '当前 pair 同时给出距离、点积和 cosine 读数。',
    en: 'The current pair exposes distance, dot product, and cosine readouts together.',
  },
  metrics: [
    { label: { 'zh-CN': '对象 A', en: 'Object A' }, value: leftObject.value.label[props.locale] },
    { label: { 'zh-CN': '对象 B', en: 'Object B' }, value: rightObject.value.label[props.locale] },
    { label: { 'zh-CN': '欧氏距离', en: 'Euclidean distance' }, value: round(weightedDistance.value, 3) },
    { label: { 'zh-CN': '点积', en: 'Dot product' }, value: round(weightedDot.value, 3) },
    { label: { 'zh-CN': 'cosine', en: 'cosine' }, value: round(weightedCosine.value, 3) },
  ],
  prompt: {
    'zh-CN': '解释距离和方向相似度是否给出同一种判断。',
    en: 'Explain whether distance and directional similarity give the same judgment.',
  },
}))

watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)

watch(selectedLeftId, (nextId) => {
  if (nextId === selectedRightId.value) {
    selectedRightId.value = firstOtherObjectId(nextId)
  }
})

watch(selectedRightId, (nextId) => {
  if (nextId === selectedLeftId.value) {
    selectedLeftId.value = firstOtherObjectId(nextId)
  }
})
</script>

<template>
  <div class="vector-similarity-stack">
    <section class="math-lab-card vector-similarity-lab">
      <div class="math-lab-card__visual vector-similarity-lab__visual" aria-live="polite">
        <header>
          <span>{{ copy.title }}</span>
          <strong>{{ copy.subtitle }}</strong>
        </header>

        <div class="vector-similarity-pair">
          <article>
            <span>{{ copy.objectA }}</span>
            <strong>{{ leftObject.label[locale] }}</strong>
            <p>{{ leftObject.description[locale] }}</p>
          </article>
          <article>
            <span>{{ copy.objectB }}</span>
            <strong>{{ rightObject.label[locale] }}</strong>
            <p>{{ rightObject.description[locale] }}</p>
          </article>
        </div>

        <div class="vector-similarity-bars">
          <article v-for="(dimension, index) in dimensions" :key="dimension.id">
            <span>{{ dimension.label[locale] }}</span>
            <div>
              <i :style="{ width: barWidth(leftObject.vector[index] ?? 0) }" />
              <b :style="{ width: barWidth(rightObject.vector[index] ?? 0) }" />
            </div>
            <small>{{ copy.weight }} {{ round(dimensionWeights[index] ?? 0, 1) }}</small>
          </article>
        </div>

        <p class="math-lab-note">{{ weightedExplanation }}</p>
      </div>

      <div class="math-lab-card__controls">
        <div class="vector-similarity-object-selectors">
          <label>
            {{ copy.objectA }}
            <select v-model="selectedLeftId">
              <option v-for="item in objectVectors" :key="item.id" :value="item.id" :disabled="item.id === selectedRightId">
                {{ item.label[locale] }}
              </option>
            </select>
          </label>
          <label>
            {{ copy.objectB }}
            <select v-model="selectedRightId">
              <option v-for="item in objectVectors" :key="item.id" :value="item.id" :disabled="item.id === selectedLeftId">
                {{ item.label[locale] }}
              </option>
            </select>
          </label>
        </div>

        <div class="vector-similarity-weights">
          <span>{{ copy.weights }}</span>
          <label v-for="(control, index) in weightControls" :key="control.id">
            {{ control.label[locale] }}: {{ round(control.value, 1) }}
            <input v-model.number="dimensionWeights[index]" type="range" min="0" max="2" step="0.1" />
          </label>
        </div>

        <div class="math-readout-grid">
          <article><span>{{ copy.weightedDifference }}</span><strong>[{{ weightedDifference.map((value) => round(value, 2)).join(', ') }}]</strong></article>
          <article><span>{{ copy.weightedDistance }}</span><strong>{{ round(weightedDistance, 3) }}</strong></article>
          <article><span>{{ copy.weightedDot }}</span><strong>{{ round(weightedDot, 3) }}</strong></article>
          <article><span>{{ copy.weightedCosine }}</span><strong>{{ round(weightedCosine, 3) }}</strong></article>
          <article>
            <span>{{ copy.closestPair }}</span>
            <strong v-if="hasActiveWeights">{{ closestPairLabel }}</strong>
            <strong v-else>{{ unavailablePairLabel }}</strong>
          </article>
          <article>
            <span>{{ copy.mostSimilarPair }}</span>
            <strong v-if="hasActiveWeights">{{ mostSimilarPairLabel }}</strong>
            <strong v-else>{{ unavailablePairLabel }}</strong>
          </article>
        </div>
      </div>
    </section>

    <section class="math-lab-card vector-answer-score-card">
      <div class="math-lab-card__visual vector-answer-score-card__answers">
        <header>
          <span>{{ copy.answerTitle }}</span>
          <strong>{{ copy.answerSubtitle }}</strong>
        </header>

        <div class="vector-answer-copy">
          <article>
            <span>{{ studentAnswer.label[locale] }}</span>
            <p>{{ studentAnswer.text[locale] }}</p>
          </article>
          <article>
            <span>{{ referenceAnswer.label[locale] }}</span>
            <p>{{ referenceAnswer.text[locale] }}</p>
          </article>
        </div>

        <div class="vector-answer-dimensions">
          <article v-for="(control, index) in answerWeightControls" :key="control.id">
            <span>{{ control.label[locale] }}</span>
            <strong>{{ round((studentAnswer.scores[index] ?? 0) * 100, 0) }} / 100</strong>
            <small>{{ copy.weight }} {{ round(control.value, 1) }}</small>
          </article>
        </div>
      </div>

      <div class="math-lab-card__controls">
        <div class="vector-similarity-weights">
          <span>{{ copy.weights }}</span>
          <label v-for="(control, index) in answerWeightControls" :key="control.id">
            {{ control.label[locale] }}: {{ round(control.value, 1) }}
            <input v-model.number="answerWeights[index]" type="range" min="0" max="2" step="0.1" />
          </label>
        </div>

        <div class="math-readout-grid">
          <article>
            <span>{{ copy.studentScore }}</span>
            <strong v-if="hasActiveRubricWeights">{{ scorePercent }}%</strong>
            <strong v-else>{{ unavailableRubricLabel }}</strong>
          </article>
          <article>
            <span>{{ copy.answerSimilarity }}</span>
            <strong v-if="hasActiveRubricWeights">{{ round(answerSimilarity, 3) }}</strong>
            <strong v-else>{{ unavailableRubricLabel }}</strong>
          </article>
          <article>
            <span>{{ copy.answerDistance }}</span>
            <strong v-if="hasActiveRubricWeights">{{ round(answerDistance, 3) }}</strong>
            <strong v-else>{{ unavailableRubricLabel }}</strong>
          </article>
        </div>

        <p class="math-lab-note">{{ answerExplanation }}</p>
      </div>
    </section>
  </div>
</template>
