# Linear Algebra Vector Matrix Learning Path Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the approved zero-base linear algebra learning path: vector distance and embedding similarity first, then matrix column combinations, column space, rank, and null space.

**Architecture:** Keep the existing Math Lab module architecture. Put reusable calculations in `src/modules/math-lab/utils/math.ts`, interactive Vue labs in `src/modules/math-lab/labs/`, content in the two existing module data builders, generated images under `public/math-lab/generated/`, and Manim outputs under `public/manim/math-lab/`.

**Tech Stack:** Vue 3, TypeScript, Vite, Node test runner, KaTeX markdown rendering, project-local CSS, built-in `imagegen`, Manim Community Edition.

---

## Scope Check

This is one vertical Math Lab feature, not separate products. It has several work streams, but each task below leaves the app in a testable state:

- deterministic math utilities,
- two interactive labs,
- content wiring,
- generated raster images,
- Manim scenes,
- final verification.

Do not start by creating a new route or new UI framework. The work belongs in the existing `beginner-linear-algebra` and `vectors-matrices-norms` modules.

## File Structure

- Modify `src/modules/math-lab/utils/math.ts`: generalized vector metrics plus 2x2 column-space helpers.
- Modify `tests/math-lab-core.test.ts`: numerical tests for vector metrics, rank, and null direction.
- Create `src/modules/math-lab/labs/VectorSimilarityLab.vue`: phase-one lab for student records, recommendation vectors, and sentence embeddings.
- Create `src/modules/math-lab/labs/MatrixColumnSpaceLab.vue`: phase-two lab for column combinations, rank, and null space.
- Modify `src/modules/math-lab/pages/MathLabModulePage.vue`: lazy-register the two new labs.
- Modify `src/styles/modules/math-lab.css`: scoped lab styles following the existing `math-lab-card` pattern.
- Modify `tests/math-lab-layout.test.mjs`: verify lazy registration, lab files, assets, and Manim scenes.
- Modify `src/modules/math-lab/data/beginnerFoundationModules.ts`: phase-one content, visuals, lab config, quizzes, misconceptions.
- Modify `src/modules/math-lab/data/vectorMatrixNormsModule.ts`: phase-two sections, concept coverage, visuals, lab config, quizzes, misconceptions.
- Modify `scripts/manim/scenes/math_lab_basics.py`: add five Manim scenes.
- Modify `scripts/manim/render_math_lab.py`: register five scene filenames and static posters.
- Add generated assets under `public/math-lab/generated/`.
- Add or update source records in `docs/math-lab-beginner-bridge-sources.md`.

## Task 1: Math Utilities For Vectors, Rank, And Null Space

**Files:**
- Modify: `tests/math-lab-core.test.ts`
- Modify: `src/modules/math-lab/utils/math.ts`

- [ ] **Step 1: Write failing tests for generalized vector metrics**

Append this test near the existing vector utility test in `tests/math-lab-core.test.ts`, and add the new imports listed here.

```ts
import {
  columnSpaceKind2x2,
  cosineSimilarityN,
  dotN,
  euclideanDistance,
  l1Norm,
  l2NormN,
  infinityNorm,
  matrixColumns2x2,
  nullDirection2x2,
  rank2x2,
  vectorDifference,
} from '../src/modules/math-lab/utils/math.ts'

test('linear algebra vector metrics handle distance, norms, dot, cosine, and zero-vector fallback', () => {
  const studentA = [2, 5, 80]
  const studentB = [3, 4, 82]

  assert.deepEqual(vectorDifference(studentB, studentA), [1, -1, 2])
  assert.equal(Math.abs(euclideanDistance(studentA, studentB) - Math.sqrt(6)) < 1e-12, true)
  assert.equal(l1Norm([1, -1, 2]), 4)
  assert.equal(l2NormN([3, 4, 12]), 13)
  assert.equal(infinityNorm([1, -7, 4]), 7)
  assert.equal(dotN([1, 2, 3], [4, 5, 6]), 32)
  assert.equal(cosineSimilarityN([1, 0, 0], [10, 0, 0]), 1)
  assert.equal(cosineSimilarityN([0, 0, 0], [1, 2, 3]), 0)
})
```

- [ ] **Step 2: Write failing tests for 2x2 rank and null direction**

Append this test after the matrix utility test in `tests/math-lab-core.test.ts`.

```ts
test('linear algebra matrix helpers expose column combinations, rank, and null directions', () => {
  const fullRank = [
    [1, 0],
    [0, 1],
  ] as const
  const rankOne = [
    [2, 4],
    [1, 2],
  ] as const
  const zero = [
    [0, 0],
    [0, 0],
  ] as const

  assert.deepEqual(matrixColumns2x2(rankOne), [{ x: 2, y: 1 }, { x: 4, y: 2 }])
  assert.equal(rank2x2(fullRank), 2)
  assert.equal(rank2x2(rankOne), 1)
  assert.equal(rank2x2(zero), 0)
  assert.equal(columnSpaceKind2x2(fullRank), 'plane')
  assert.equal(columnSpaceKind2x2(rankOne), 'line')
  assert.equal(columnSpaceKind2x2(zero), 'point')

  const nullDirection = nullDirection2x2(rankOne)
  assert.ok(nullDirection)
  const collapsed = matrixVectorMultiply(rankOne, nullDirection!)
  assert.equal(Math.abs(collapsed.x) < 1e-8, true)
  assert.equal(Math.abs(collapsed.y) < 1e-8, true)
  assert.equal(nullDirection2x2(fullRank), null)
})
```

- [ ] **Step 3: Run tests to verify they fail**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: fail with missing exports such as `vectorDifference` or `rank2x2`.

- [ ] **Step 4: Add utility implementations**

Append these exports to `src/modules/math-lab/utils/math.ts` after `Matrix2x2`.

```ts
export type VectorN = number[]
export type ColumnSpaceKind = 'point' | 'line' | 'plane'

function finiteOrZero(value: number) {
  return Number.isFinite(value) ? value : 0
}

export function sanitizeVector(values: readonly number[]): VectorN {
  return values.map(finiteOrZero)
}

export function vectorDifference(left: readonly number[], right: readonly number[]): VectorN {
  const length = Math.max(left.length, right.length)
  return Array.from({ length }, (_, index) => finiteOrZero(left[index] ?? 0) - finiteOrZero(right[index] ?? 0))
}

export function dotN(left: readonly number[], right: readonly number[]) {
  const length = Math.max(left.length, right.length)
  return Array.from({ length }, (_, index) => finiteOrZero(left[index] ?? 0) * finiteOrZero(right[index] ?? 0))
    .reduce((sum, value) => sum + value, 0)
}

export function l1Norm(values: readonly number[]) {
  return sanitizeVector(values).reduce((sum, value) => sum + Math.abs(value), 0)
}

export function l2NormN(values: readonly number[]) {
  return Math.hypot(...sanitizeVector(values))
}

export function infinityNorm(values: readonly number[]) {
  return sanitizeVector(values).reduce((maxValue, value) => Math.max(maxValue, Math.abs(value)), 0)
}

export function euclideanDistance(left: readonly number[], right: readonly number[]) {
  return l2NormN(vectorDifference(left, right))
}

export function cosineSimilarityN(left: readonly number[], right: readonly number[]) {
  const denominator = l2NormN(left) * l2NormN(right)
  if (denominator === 0) return 0
  return dotN(left, right) / denominator
}

export function matrixColumns2x2(matrix: Matrix2x2): [Vector2, Vector2] {
  return [
    { x: matrix[0][0], y: matrix[1][0] },
    { x: matrix[0][1], y: matrix[1][1] },
  ]
}

export function rank2x2(matrix: Matrix2x2, epsilon = 1e-8): 0 | 1 | 2 {
  if (Math.abs(determinant2x2(matrix)) > epsilon) return 2
  const hasNonZeroEntry = matrix.some((row) => row.some((value) => Math.abs(value) > epsilon))
  return hasNonZeroEntry ? 1 : 0
}

export function columnSpaceKind2x2(matrix: Matrix2x2, epsilon = 1e-8): ColumnSpaceKind {
  const rank = rank2x2(matrix, epsilon)
  if (rank === 2) return 'plane'
  if (rank === 1) return 'line'
  return 'point'
}

export function nullDirection2x2(matrix: Matrix2x2, epsilon = 1e-8): Vector2 | null {
  const rank = rank2x2(matrix, epsilon)
  if (rank === 2) return null
  if (rank === 0) return { x: 1, y: 0 }

  const firstRowNorm = Math.hypot(matrix[0][0], matrix[0][1])
  const secondRowNorm = Math.hypot(matrix[1][0], matrix[1][1])
  const row = firstRowNorm >= secondRowNorm ? matrix[0] : matrix[1]
  const direction = { x: -row[1], y: row[0] }
  const length = norm(direction)

  if (length <= epsilon) return { x: 1, y: 0 }
  return { x: direction.x / length, y: direction.y / length }
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: pass for the new tests and existing Math Lab core tests.

- [ ] **Step 6: Commit**

```bash
git add src/modules/math-lab/utils/math.ts tests/math-lab-core.test.ts
git commit -m "Add linear algebra vector and rank utilities"
```

## Task 2: Vector Similarity Lab

**Files:**
- Create: `src/modules/math-lab/labs/VectorSimilarityLab.vue`
- Modify: `src/modules/math-lab/pages/MathLabModulePage.vue`
- Modify: `src/styles/modules/math-lab.css`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Write failing layout checks**

In `tests/math-lab-layout.test.mjs`, add `src/modules/math-lab/labs/VectorSimilarityLab.vue` to the `componentPaths` array, and add this registry assertion near the existing lab import checks.

```js
assert.match(modulePageSource, /import\('\.\.\/labs\/VectorSimilarityLab\.vue'\)/)
```

- [ ] **Step 2: Run layout test to verify it fails**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: fail because the new lab file and registry import do not exist.

- [ ] **Step 3: Create the lab component**

Create `src/modules/math-lab/labs/VectorSimilarityLab.vue` with this structure.

```vue
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
```

- [ ] **Step 4: Register the component lazily**

In `src/modules/math-lab/pages/MathLabModulePage.vue`, add this to `labComponentRegistry`.

```ts
VectorSimilarityLab: defineAsyncComponent(() => import('../labs/VectorSimilarityLab.vue')),
```

- [ ] **Step 5: Add styles**

Append to `src/styles/modules/math-lab.css`.

```css
.vector-similarity-lab__visual {
  display: grid;
  gap: 18px;
}

.vector-similarity-bars {
  display: grid;
  gap: 12px;
}

.vector-similarity-bars article {
  display: grid;
  gap: 7px;
}

.vector-similarity-bars article > span {
  color: var(--muted);
  font-size: 0.86rem;
  font-weight: 700;
}

.vector-similarity-bars article > div {
  position: relative;
  min-height: 32px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(56, 104, 255, 0.1);
}

.vector-similarity-bars i,
.vector-similarity-bars b {
  position: absolute;
  inset-block: 0;
  left: 0;
  border-radius: inherit;
}

.vector-similarity-bars i {
  background: rgba(56, 104, 255, 0.58);
}

.vector-similarity-bars b {
  background: rgba(15, 159, 122, 0.55);
  transform: translateY(50%);
  min-height: 50%;
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/math-lab/labs/VectorSimilarityLab.vue src/modules/math-lab/pages/MathLabModulePage.vue src/styles/modules/math-lab.css tests/math-lab-layout.test.mjs
git commit -m "Add vector similarity lab"
```

## Task 3: Phase-One Beginner Content

**Files:**
- Modify: `src/modules/math-lab/data/beginnerFoundationModules.ts`
- Modify: `tests/math-lab-core.test.ts`

- [ ] **Step 1: Write failing content checks**

In the `beginner-linear-algebra` branch of the long module body assertion in `tests/math-lab-core.test.ts`, replace the current assertion with this stronger one.

```ts
} else if (moduleDefinition.id === 'beginner-linear-algebra') {
  assert.match(englishBody, /Euclidean distance|cosine similarity|high-dimensional embedding/i)
  assert.match(englishBody, /distance and direction/i)
  assert.match(moduleDefinition.labs.map((lab) => lab.componentName).join('\n'), /VectorSimilarityLab/)
  assert.match(moduleDefinition.quizzes.map((quiz) => quiz.id).join('\n'), /beginner-linear-distance-vs-direction/)
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: fail because `VectorSimilarityLab` is not wired into the module content.

- [ ] **Step 3: Add phase-one section ids and lab placement**

In `src/modules/math-lab/data/beginnerFoundationModules.ts`, add these section ids to `linearSections`, keeping existing helper functions and style. Use Chinese copy in a teacherly voice and English copy as clear instructional text.

```ts
section(
  'beginner-linear-distance-first',
  copy('先问两个对象有多远', 'First Ask How Far Two Objects Are'),
  copy(
    md`先别急着画箭头。我们先拿两个学生记录算一遍距离。小林是 \([2,5,80]\)，小周是 \([3,4,82]\)。差向量是 \([1,-1,2]\)：多练一次、少错一题、分数高两分。欧几里得距离把这三个变化合成一个数。这个数回答的是"差多远"，还没有回答"方向像不像"。`,
    md`Do not rush to arrows first. Start with two learner records: Lin is \([2,5,80]\), Zhou is \([3,4,82]\). The difference vector is \([1,-1,2]\): one more practice session, one fewer mistake, two more score points. Euclidean distance combines those changes into one number. It answers "how far apart," not yet "how similar in direction."`,
  ),
  { labIds: ['beginner-vector-similarity-lab'] },
),
section(
  'beginner-linear-norm-cosine',
  copy('长度和方向要分开看', 'Read Length and Direction Separately'),
  copy(
    md`norm 是向量自己的长度。cosine similarity 会把长度除掉，只看方向。这个区别在 embedding 里很常见：两句话的向量可能长度不同，但方向很接近，检索系统仍然会把它们排在一起。`,
    md`A norm is the vector's own length. Cosine similarity divides away length and reads direction. This distinction is common in embeddings: two sentence vectors may have different lengths but very close directions, so a retrieval system may still rank them together.`,
  ),
  { visualIds: ['beginner-vector-distance-similarity-longform'] },
),
section(
  'beginner-linear-embedding-search',
  copy('高维看不见，但规则没变', 'High Dimensions Are Hidden, Not Different'),
  copy(
    md`二维和三维方便画图。embedding 往往有几百维，图画不下，但距离、norm、点积和 cosine 的计算规则没有换。我们只是从"能画出来的箭头"走到了"只能算出来的方向"。`,
    md`Two and three dimensions are easy to draw. Embeddings often have hundreds of dimensions, so the picture no longer fits on the page. The rules for distance, norm, dot product, and cosine do not change. We move from arrows we can draw to directions we can compute.`,
  ),
),
```

- [ ] **Step 4: Add lab config**

In the `labs` array for `beginner-linear-algebra`, add:

```ts
lab('beginner-vector-similarity-lab', copy('距离和方向相似度实验', 'Distance and Direction Similarity Lab'), 'VectorSimilarityLab', [
  copy('能解释欧几里得距离回答的是位置差多少。', 'Explain that Euclidean distance answers how far positions differ.'),
  copy('能解释 cosine similarity 更关注方向是否接近。', 'Explain that cosine similarity focuses on direction alignment.'),
]),
```

- [ ] **Step 5: Add a checkpoint quiz**

Add this quiz to the `quizzes` array for `beginner-linear-algebra`.

```ts
quiz(
  'beginner-linear-distance-vs-direction',
  copy('embedding 检索为什么常用 cosine similarity？', 'Why does embedding retrieval often use cosine similarity?'),
  'direction',
  copy('因为它更关注方向是否接近，而不是向量长度本身。', 'Because it focuses on directional alignment rather than vector length itself.'),
  copy('因为它会忽略所有坐标，只比较句子长度。', 'Because it ignores all coordinates and only compares sentence length.'),
  copy('cosine 会除以两个向量长度，把重点放到夹角上。回看距离和方向实验，比较距离排序和 cosine 排名。', 'Cosine divides by both vector lengths and puts the focus on angle. Revisit the distance and direction lab and compare distance ranking with cosine ranking.'),
  'distance-vs-direction',
  'beginner-vector-distance-similarity-longform',
),
```

- [ ] **Step 6: Add misconception**

Add this misconception to the `misconceptions` array.

```ts
misconception(
  'distance-vs-direction',
  copy('距离近就一定语义相似。', 'Nearby distance always means similar meaning.'),
  copy('距离和方向回答的是两个问题。embedding 检索经常更看重方向。', 'Distance and direction answer different questions. Embedding retrieval often cares more about direction.'),
  copy('两个向量长度差很多时，位置距离可能变大，但它们仍可能朝向相近。', 'If two vectors have very different lengths, their position distance can grow while their directions remain close.'),
),
```

- [ ] **Step 7: Humanize the Chinese copy**

Review the Chinese paragraphs added in this task with `humanizer-zh`. Keep:

```text
先别急着画箭头。
图画不下，但计算规则没有换。
```

Remove any wording that reads like promotion, especially "至关重要", "深刻理解", "彰显", and "不仅...而且..." if introduced during edits.

- [ ] **Step 8: Run tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add src/modules/math-lab/data/beginnerFoundationModules.ts tests/math-lab-core.test.ts
git commit -m "Refine beginner vector similarity path"
```

## Task 4: Matrix Column Space Lab

**Files:**
- Create: `src/modules/math-lab/labs/MatrixColumnSpaceLab.vue`
- Modify: `src/modules/math-lab/pages/MathLabModulePage.vue`
- Modify: `src/styles/modules/math-lab.css`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Write failing layout checks**

Add `src/modules/math-lab/labs/MatrixColumnSpaceLab.vue` to the `componentPaths` array in `tests/math-lab-layout.test.mjs`, and add:

```js
assert.match(modulePageSource, /import\('\.\.\/labs\/MatrixColumnSpaceLab\.vue'\)/)
```

- [ ] **Step 2: Run layout test to verify it fails**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: fail because the component is not created or registered.

- [ ] **Step 3: Create the lab component**

Create `src/modules/math-lab/labs/MatrixColumnSpaceLab.vue`. Use this script and template structure.

```vue
<script setup lang="ts">
import { computed, reactive } from 'vue'
import type { MathLabLocale } from '../types/mathLab'
import {
  columnSpaceKind2x2,
  matrixColumns2x2,
  matrixVectorMultiply,
  nullDirection2x2,
  rank2x2,
  round,
  type Matrix2x2,
  type Vector2,
} from '../utils/math'

const props = withDefaults(defineProps<{ locale?: MathLabLocale }>(), {
  locale: 'zh-CN',
})

const size = 380
const center = size / 2
const scale = 42
const matrix = reactive({ a: 1.4, b: 0.7, c: 0.2, d: 1.1 })
const input = reactive<Vector2>({ x: 1.2, y: 0.8 })

const matrixValue = computed<Matrix2x2>(() => [
  [matrix.a, matrix.b],
  [matrix.c, matrix.d],
])
const columns = computed(() => matrixColumns2x2(matrixValue.value))
const output = computed(() => matrixVectorMultiply(matrixValue.value, input))
const rank = computed(() => rank2x2(matrixValue.value, 0.05))
const kind = computed(() => columnSpaceKind2x2(matrixValue.value, 0.05))
const nullDirection = computed(() => nullDirection2x2(matrixValue.value, 0.05))

function toSvg(point: Vector2) {
  return {
    x: center + point.x * scale,
    y: center - point.y * scale,
  }
}

const copy = computed(() =>
  props.locale === 'zh-CN'
    ? {
        aria: '列空间、rank 和 null space 可视化',
        title: '列空间实验',
        subtitle: '拖动输入坐标，看它怎样混合矩阵的两列',
        rank: 'rank',
        columnSpace: 'column space',
        nullSpace: 'null direction',
        explanation: kind.value === 'plane'
          ? '两列不共线，输出可以铺开一个平面。'
          : kind.value === 'line'
            ? '两列方向重复，输出被压到一条线上。'
            : '两列都是零，所有输入都被压成原点。',
      }
    : {
        aria: 'Column space, rank, and null space visualization',
        title: 'Column Space Lab',
        subtitle: 'Move input coordinates and watch them mix the matrix columns',
        rank: 'rank',
        columnSpace: 'column space',
        nullSpace: 'null direction',
        explanation: kind.value === 'plane'
          ? 'The columns are independent, so outputs can cover a plane.'
          : kind.value === 'line'
            ? 'The columns repeat one direction, so outputs collapse onto a line.'
            : 'Both columns are zero, so every input maps to the origin.',
      },
)

const svgA1 = computed(() => toSvg(columns.value[0]))
const svgA2 = computed(() => toSvg(columns.value[1]))
const svgOutput = computed(() => toSvg(output.value))
const svgNullEnd = computed(() => nullDirection.value ? toSvg(nullDirection.value) : null)
</script>

<template>
  <section class="math-lab-card matrix-column-space-lab">
    <div class="math-lab-card__visual">
      <svg viewBox="0 0 380 380" class="math-matrix-svg matrix-column-space-svg" role="img" :aria-label="copy.aria">
        <defs>
          <marker id="column-a1-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#3868ff" />
          </marker>
          <marker id="column-a2-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L9,3 z" fill="#0f9f7a" />
          </marker>
        </defs>
        <g class="math-grid">
          <line v-for="tick in 9" :key="`h-${tick}`" x1="0" x2="380" :y1="(tick - 1) * 47.5" :y2="(tick - 1) * 47.5" />
          <line v-for="tick in 9" :key="`v-${tick}`" :x1="(tick - 1) * 47.5" :x2="(tick - 1) * 47.5" y1="0" y2="380" />
          <line x1="0" x2="380" y1="190" y2="190" class="axis" />
          <line x1="190" x2="190" y1="0" y2="380" class="axis" />
        </g>
        <line x1="190" y1="190" :x2="svgA1.x" :y2="svgA1.y" class="basis basis--i" marker-end="url(#column-a1-arrow)" />
        <line x1="190" y1="190" :x2="svgA2.x" :y2="svgA2.y" class="basis basis--j" marker-end="url(#column-a2-arrow)" />
        <line x1="190" y1="190" :x2="svgOutput.x" :y2="svgOutput.y" class="column-output-vector" />
        <line v-if="svgNullEnd" x1="190" y1="190" :x2="svgNullEnd.x" :y2="svgNullEnd.y" class="null-direction-line" />
        <circle :cx="svgOutput.x" :cy="svgOutput.y" r="8" class="projection-dot" />
      </svg>
    </div>

    <div class="math-lab-card__controls">
      <header>
        <span>{{ copy.title }}</span>
        <strong>{{ copy.subtitle }}</strong>
      </header>
      <div class="matrix-input-grid">
        <label><span>a</span><input v-model.number="matrix.a" type="number" step="0.1" /></label>
        <label><span>b</span><input v-model.number="matrix.b" type="number" step="0.1" /></label>
        <label><span>c</span><input v-model.number="matrix.c" type="number" step="0.1" /></label>
        <label><span>d</span><input v-model.number="matrix.d" type="number" step="0.1" /></label>
        <label><span>x1</span><input v-model.number="input.x" type="range" min="-3" max="3" step="0.1" /></label>
        <label><span>x2</span><input v-model.number="input.y" type="range" min="-3" max="3" step="0.1" /></label>
      </div>
      <div class="math-readout-grid">
        <article><span>{{ copy.rank }}</span><strong>{{ rank }}</strong></article>
        <article><span>{{ copy.columnSpace }}</span><strong>{{ kind }}</strong></article>
        <article><span>A x</span><strong>({{ round(output.x, 2) }}, {{ round(output.y, 2) }})</strong></article>
        <article><span>{{ copy.nullSpace }}</span><strong>{{ nullDirection ? `(${round(nullDirection.x, 2)}, ${round(nullDirection.y, 2)})` : 'none' }}</strong></article>
      </div>
      <p class="math-lab-note">{{ copy.explanation }}</p>
    </div>
  </section>
</template>
```

- [ ] **Step 4: Register the component lazily**

In `src/modules/math-lab/pages/MathLabModulePage.vue`, add:

```ts
MatrixColumnSpaceLab: defineAsyncComponent(() => import('../labs/MatrixColumnSpaceLab.vue')),
```

- [ ] **Step 5: Add styles**

Append to `src/styles/modules/math-lab.css`.

```css
.column-output-vector {
  stroke: #d65a31;
  stroke-width: 5;
  stroke-linecap: round;
}

.null-direction-line {
  stroke: rgba(190, 18, 60, 0.72);
  stroke-width: 4;
  stroke-dasharray: 8 8;
  stroke-linecap: round;
}

.matrix-column-space-svg .basis {
  opacity: 0.92;
}
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/math-lab/labs/MatrixColumnSpaceLab.vue src/modules/math-lab/pages/MathLabModulePage.vue src/styles/modules/math-lab.css tests/math-lab-layout.test.mjs
git commit -m "Add matrix column space lab"
```

## Task 5: Phase-Two Matrix Content

**Files:**
- Modify: `src/modules/math-lab/data/vectorMatrixNormsModule.ts`
- Modify: `tests/math-lab-core.test.ts`

- [ ] **Step 1: Write failing content checks**

In `tests/math-lab-core.test.ts`, add this branch in the module body assertions.

```ts
else if (moduleDefinition.id === 'vectors-matrices-norms') {
  assert.match(englishBody, /column space|rank|null space/i)
  assert.match(englishBody, /matrix columns/i)
  assert.match(moduleDefinition.labs.map((lab) => lab.componentName).join('\n'), /MatrixColumnSpaceLab/)
  assert.match(moduleDefinition.quizzes.map((quiz) => quiz.id).join('\n'), /vectors-matrices-norms-null-space/)
}
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: fail because phase-two content is not present yet.

- [ ] **Step 3: Add sections after the current matrix-transform discussion**

In `src/modules/math-lab/data/vectorMatrixNormsModule.ts`, add these sections to `sections`, close to the matrix section that currently places `matrix-transform-lab`.

```ts
section(
  'vectors-matrices-norms-column-space-rank',
  copy('列空间和 rank：输出能去哪里', 'Column Space and Rank: Where Outputs Can Go'),
  copy(
    md`按列读矩阵乘法时，\(A\mathbf{x}\) 就是用输入坐标混合矩阵列向量。所有可能混出来的位置叫 column space。rank 先别急着用消元算，先把它读成 column space 里真正独立的方向数。两列不共线，二维输出能铺开一个平面；两列共线，输出只能落在一条线上。`,
    md`In the column reading, \(A\mathbf{x}\) mixes the columns of \(A\) using input coordinates. All reachable outputs form the column space. Before computing rank by elimination, read it as the number of genuinely independent directions in that column space. Two non-collinear columns cover a plane in 2D; collinear columns restrict outputs to a line.`,
  ),
  { visualIds: ['matrix-column-combination-video'], labIds: ['matrix-column-space-lab'] },
),
section(
  'vectors-matrices-norms-null-space',
  copy('null space：矩阵看不见的输入方向', 'Null Space: Input Directions the Matrix Cannot See'),
  copy(
    md`null space 收集所有满足 \(A\mathbf{x}=0\) 的输入方向。它的直觉很朴素：有些输入变化经过矩阵后被抵消了，输出看不见这部分变化。模型里如果某个方向落进 null space，后面的线性输出就不会因为这个方向改变。`,
    md`The null space collects every input direction satisfying \(A\mathbf{x}=0\). The intuition is simple: some input changes cancel out after the matrix, so the output cannot see them. If a model's input direction falls into the null space, the following linear output does not change along that direction.`,
  ),
),
```

- [ ] **Step 4: Add concept entry**

Add this concept to the `concepts` array after `matrix-as-linear-transform`.

```ts
{
  id: 'column-space-rank-null-space',
  name: copy('列空间、rank 与 null space', 'Column Space, Rank, and Null Space'),
  formulaLatex: '\\operatorname{Col}(A)=\\{A\\mathbf{x}:\\mathbf{x}\\in\\mathbb{R}^n\\},\\quad \\operatorname{rank}(A)=\\dim \\operatorname{Col}(A),\\quad \\operatorname{Null}(A)=\\{\\mathbf{x}:A\\mathbf{x}=\\mathbf{0}\\}',
  variables: [
    {
      symbol: '\\operatorname{Col}(A)',
      description: copy('矩阵所有可能输出组成的空间。', 'The space of every output the matrix can produce.'),
    },
    {
      symbol: '\\operatorname{rank}(A)',
      description: copy('列空间里独立方向的数量。', 'The number of independent directions in the column space.'),
    },
    {
      symbol: '\\operatorname{Null}(A)',
      description: copy('被矩阵送到零向量的输入方向集合。', 'The set of input directions sent to the zero vector.'),
    },
  ],
  plainExplanation: copy(
    '列空间问输出能去哪里，rank 问有几个独立输出方向，null space 问哪些输入变化会被压没。',
    'Column space asks where outputs can go, rank asks how many independent output directions exist, and null space asks which input changes collapse away.',
  ),
  geometricIntuition: copy(
    'rank 低时，平面可能被压成线；null space 指向那些被压到零的输入方向。',
    'When rank is low, a plane may collapse to a line; the null space points along input directions collapsed to zero.',
  ),
  numericalExample: copy(
    md`若 \(A=\begin{bmatrix}2&4\\1&2\end{bmatrix}\)，第二列是第一列的 \(2\) 倍，rank 为 \(1\)。向量 \((2,-1)\) 满足 \(A(2,-1)^\top=\mathbf{0}\)。`,
    md`If \(A=\begin{bmatrix}2&4\\1&2\end{bmatrix}\), the second column is \(2\) times the first, so rank is \(1\). The vector \((2,-1)\) satisfies \(A(2,-1)^\top=\mathbf{0}\).`,
  ),
  codeExample:
    'const A = [[2, 4], [1, 2]]\nconst x = [2, -1]\nconst output = [\n  A[0][0] * x[0] + A[0][1] * x[1],\n  A[1][0] * x[0] + A[1][1] * x[1],\n]\nconsole.log(output) // [0, 0]',
  modelConnection: copy(
    'rank 和 null space 帮助解释特征冗余、投影降维和线性层丢失哪些方向的信息。',
    'Rank and null space help explain feature redundancy, projection, dimensionality reduction, and which directions a linear layer loses.',
  ),
},
```

- [ ] **Step 5: Add lab config**

Add this entry to `labs`.

```ts
{
  id: 'matrix-column-space-lab',
  title: copy('列空间、rank 与 null space 实验', 'Column Space, Rank, and Null Space Lab'),
  type: 'interactive-visual',
  componentName: 'MatrixColumnSpaceLab',
  successCriteria: [
    copy('能把 \(A\\mathbf{x}\) 解释成输入坐标对矩阵列向量的混合。', 'Explain \(A\\mathbf{x}\) as input coordinates mixing matrix columns.'),
    copy('能说出 rank 低时输出空间怎样被压扁。', 'Describe how low rank flattens the output space.'),
    copy('能指出 null space 表示哪些输入方向被矩阵送到零。', 'Identify null space as input directions sent to zero.'),
  ],
},
```

- [ ] **Step 6: Add quiz and misconception**

Add this quiz to `quizzes`.

```ts
{
  id: 'vectors-matrices-norms-null-space',
  type: 'single-choice',
  prompt: copy('null space 最适合先理解成什么？', 'What is the best first intuition for null space?'),
  choices: [
    {
      id: 'invisible-input',
      label: copy('会被矩阵压成零、输出看不见的输入方向。', 'Input directions collapsed to zero, invisible to the output.'),
    },
    {
      id: 'all-outputs',
      label: copy('矩阵所有可能输出的位置。', 'Every possible output position of the matrix.'),
    },
    {
      id: 'entrywise-product',
      label: copy('矩阵和向量逐项相乘后的结果。', 'The result of multiplying matching entries element by element.'),
    },
  ],
  answer: 'invisible-input',
  explanation: copy(
    md`null space 由满足 \(A\mathbf{x}=0\) 的输入组成。column space 才是所有可能输出。`,
    md`The null space contains inputs satisfying \(A\mathbf{x}=0\). The column space is the set of possible outputs.`,
  ),
  misconceptionTags: ['null-space-is-output-space'],
  revisitVisualId: 'matrix-column-combination-video',
},
```

Add this misconception to `misconceptions`.

```ts
{
  id: 'null-space-is-output-space',
  statement: copy('null space 是矩阵输出所在的空间。', 'The null space is where matrix outputs live.'),
  correction: copy('column space 描述输出在哪里；null space 描述哪些输入方向被送到零。', 'The column space describes where outputs live; the null space describes which input directions map to zero.'),
  example: copy('二维矩阵把平面压成线时，被压没的输入方向属于 null space。', 'When a 2D matrix collapses the plane to a line, the vanished input direction belongs to the null space.'),
},
```

- [ ] **Step 7: Humanize Chinese copy**

Review the Chinese additions with `humanizer-zh`. Keep the exact teaching sentence:

```text
列空间问输出能去哪里，rank 问有几个独立输出方向，null space 问哪些输入变化会被压没。
```

Remove ornate phrasing if it appears. The final copy should read like a patient teacher, not a brochure.

- [ ] **Step 8: Run tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add src/modules/math-lab/data/vectorMatrixNormsModule.ts tests/math-lab-core.test.ts
git commit -m "Add column space rank and null space lesson"
```

## Task 6: Teaching Image Assets

**Files:**
- Add images under: `public/math-lab/generated/`
- Modify: `src/modules/math-lab/data/beginnerFoundationModules.ts`
- Modify: `src/modules/math-lab/data/vectorMatrixNormsModule.ts`
- Modify: `docs/math-lab-beginner-bridge-sources.md`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Write failing asset checks**

In `tests/math-lab-layout.test.mjs`, add these paths to `keyAssets`.

```js
'public/math-lab/generated/linear-algebra-feature-cards.png',
'public/math-lab/generated/vector-distance-norm-intuition.png',
'public/math-lab/generated/cosine-vs-distance-intuition.png',
'public/math-lab/generated/high-dimensional-embedding-search.png',
'public/math-lab/generated/matrix-column-combination.png',
'public/math-lab/generated/column-space-rank-intuition.png',
'public/math-lab/generated/null-space-invisible-direction.png',
```

- [ ] **Step 2: Run layout test to verify it fails**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: fail because the images are not in `public/math-lab/generated/`.

- [ ] **Step 3: Generate images with `imagegen`**

Use the built-in `image_gen` workflow. Generate one asset per prompt, inspect results, and move the accepted PNGs into `public/math-lab/generated/` with the filenames from Step 1.

Use this prompt pattern for each:

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab teaching infographic
Style/medium: clean vector-like educational raster illustration, high contrast, readable in a course page
Composition/framing: 16:9, centered, no decorative filler
Constraints: no watermark, no logo, no photorealistic classroom, no tiny unreadable text
```

Prompts:

```text
Primary request: Chinese-primary infographic showing three object cards becoming feature vectors: learner record [practice, mistakes, score], movie preference [action, comedy, sci-fi], and sentence embedding as a row of semantic bars. Include sparse, large Chinese labels only: "对象", "特征", "向量".
```

```text
Primary request: Chinese-primary infographic contrasting vector norm and Euclidean distance. Show one arrow from origin with a length ruler, and two vector endpoints connected by a distance segment. Include sparse labels: "norm", "distance", "差向量".
```

```text
Primary request: Chinese-primary infographic showing why distance and direction similarity differ. Left panel: nearby endpoints with noticeably different angle. Right panel: longer vectors with similar direction. Include sparse labels: "距离近", "方向近", "cosine".
```

```text
Primary request: Chinese-primary infographic showing high-dimensional embedding search. Show several sentence cards mapped into a hidden high-dimensional bar space, then ranked by cosine similarity. Include sparse labels: "句子", "embedding", "相似检索".
```

```text
Primary request: Chinese-primary infographic showing matrix-vector multiplication as column combination. Show two matrix column arrows a1 and a2, sliders x1 and x2, and the output arrow x1 a1 + x2 a2. Include sparse labels: "列向量", "混合", "输出".
```

```text
Primary request: Chinese-primary infographic showing column space and rank. Show a full-rank pair of independent column arrows spreading a plane, and a rank-one pair collapsing outputs onto a line. Include sparse labels: "column space", "rank 2", "rank 1".
```

```text
Primary request: Chinese-primary infographic showing null space as invisible input direction. Show input arrows entering a matrix gate; one direction collapses to zero output, another produces visible output. Include sparse labels: "null space", "看不见的方向", "A x = 0".
```

- [ ] **Step 4: Wire images into module visuals**

Add image assets in `beginnerFoundationModules.ts` for:

```ts
imageAsset('linear-algebra-feature-cards', 'linear-algebra-feature-cards.png', copy('对象怎样变成向量', 'How Objects Become Vectors'), copy('学习记录、推荐偏好和句子 embedding 被放进同一套向量语言。', 'Learner records, recommendation preferences, and sentence embeddings enter the same vector language.')),
imageAsset('vector-distance-norm-intuition', 'vector-distance-norm-intuition.png', copy('距离和向量长度', 'Distance and Vector Length'), copy('一条线读向量自己的长度，另一条线读两个对象之间的距离。', 'One segment reads a vector length, and another reads the distance between two objects.')),
imageAsset('cosine-vs-distance-intuition', 'cosine-vs-distance-intuition.png', copy('距离近和方向近', 'Nearby Distance and Nearby Direction'), copy('图中对比位置距离和方向相似度，帮助区分 Euclidean distance 与 cosine similarity。', 'The image contrasts position distance and directional similarity to separate Euclidean distance from cosine similarity.')),
imageAsset('high-dimensional-embedding-search', 'high-dimensional-embedding-search.png', copy('高维 embedding 检索', 'High-Dimensional Embedding Search'), copy('句子进入高维表示后，仍然可以用 cosine similarity 做相似检索。', 'Sentences become high-dimensional representations and can still be retrieved with cosine similarity.')),
```

Add image assets in `vectorMatrixNormsModule.ts` for:

```ts
{
  id: 'matrix-column-combination-image',
  type: 'image',
  title: copy('矩阵列向量的线性组合', 'Matrix Columns as a Linear Combination'),
  assetPath: '/math-lab/generated/matrix-column-combination.png',
  transcript: copy('输入坐标作为比例，混合矩阵列向量得到输出。', 'Input coordinates act as weights that mix matrix columns into the output.'),
  alt: copy('矩阵列向量按输入坐标混合成输出向量的示意图。', 'Diagram of matrix columns mixed by input coordinates into an output vector.'),
  caption: copy('矩阵乘向量可以按列读成线性组合。', 'Matrix-vector multiplication can be read by columns as a linear combination.'),
  learningPurpose: copy('帮助学生把矩阵乘法从表格计算转成列空间直觉。', 'Help learners turn matrix multiplication from table arithmetic into column-space intuition.'),
},
{
  id: 'column-space-rank-image',
  type: 'image',
  title: copy('列空间和 rank', 'Column Space and Rank'),
  assetPath: '/math-lab/generated/column-space-rank-intuition.png',
  transcript: copy('两列独立时输出可以铺开平面；两列共线时输出被压到一条线上。', 'Independent columns can spread outputs across a plane; collinear columns collapse outputs onto a line.'),
  alt: copy('rank 2 的列空间铺开平面，rank 1 的列空间压成线的对比图。', 'Comparison of a rank-2 column space spreading across a plane and a rank-1 column space collapsed to a line.'),
  caption: copy('rank 可以先读成列空间里的有效独立方向数。', 'Rank can first be read as the number of effective independent directions in the column space.'),
  learningPurpose: copy('帮助学生把 rank 从抽象数字连接到空间是否被压扁。', 'Help learners connect rank to whether space is flattened.'),
},
{
  id: 'null-space-invisible-direction-image',
  type: 'image',
  title: copy('null space：看不见的输入方向', 'Null Space: Input Directions the Matrix Cannot See'),
  assetPath: '/math-lab/generated/null-space-invisible-direction.png',
  transcript: copy('一个输入方向经过矩阵后变成零输出，另一个方向产生可见输出。', 'One input direction becomes zero output after the matrix, while another produces a visible output.'),
  alt: copy('输入方向进入矩阵后，一个方向被压成零输出的 null space 示意图。', 'Diagram of an input direction entering a matrix and collapsing to zero output as null space.'),
  caption: copy('null space 描述哪些输入变化会被矩阵压没。', 'Null space describes which input changes collapse away under the matrix.'),
  learningPurpose: copy('帮助学生区分 column space 是输出空间，null space 是输入方向。', 'Help learners distinguish column space as output space from null space as input directions.'),
},
```

- [ ] **Step 5: Update source record**

Append a section to `docs/math-lab-beginner-bridge-sources.md`:

```md
## Linear algebra vector-matrix route assets

These images were generated for this repository with Codex's built-in `imagegen` workflow. The prompts requested Chinese-primary scientific teaching infographics for zero-base linear algebra, with sparse labels, no logos, no watermark, and no runtime remote assets.

Generated files:

- `public/math-lab/generated/linear-algebra-feature-cards.png`
- `public/math-lab/generated/vector-distance-norm-intuition.png`
- `public/math-lab/generated/cosine-vs-distance-intuition.png`
- `public/math-lab/generated/high-dimensional-embedding-search.png`
- `public/math-lab/generated/matrix-column-combination.png`
- `public/math-lab/generated/column-space-rank-intuition.png`
- `public/math-lab/generated/null-space-invisible-direction.png`
```

- [ ] **Step 6: Run layout test**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add public/math-lab/generated/linear-algebra-feature-cards.png public/math-lab/generated/vector-distance-norm-intuition.png public/math-lab/generated/cosine-vs-distance-intuition.png public/math-lab/generated/high-dimensional-embedding-search.png public/math-lab/generated/matrix-column-combination.png public/math-lab/generated/column-space-rank-intuition.png public/math-lab/generated/null-space-invisible-direction.png src/modules/math-lab/data/beginnerFoundationModules.ts src/modules/math-lab/data/vectorMatrixNormsModule.ts docs/math-lab-beginner-bridge-sources.md tests/math-lab-layout.test.mjs
git commit -m "Add linear algebra teaching image assets"
```

## Task 7: Manim Scenes For Vector And Matrix Intuition

**Files:**
- Modify: `scripts/manim/scenes/math_lab_basics.py`
- Modify: `scripts/manim/render_math_lab.py`
- Add generated outputs under: `public/manim/math-lab/`
- Modify: `src/modules/math-lab/data/beginnerFoundationModules.ts`
- Modify: `src/modules/math-lab/data/vectorMatrixNormsModule.ts`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Write failing Manim registration tests**

In `tests/math-lab-layout.test.mjs`, add this test after the existing Manim asset tests.

```js
test('linear algebra route Manim scenes are registered', () => {
  const sceneSource = read('scripts/manim/scenes/math_lab_basics.py')
  const renderSource = read('scripts/manim/render_math_lab.py')

  for (const sceneName of [
    'VectorDistanceNormScene',
    'CosineSimilarityAngleScene',
    'MatrixColumnCombinationScene',
    'RankFlatteningScene',
    'NullSpaceCollapseScene',
  ]) {
    assert.match(sceneSource, new RegExp(`class ${sceneName}`))
    assert.match(renderSource, new RegExp(sceneName))
  }

  for (const assetPath of [
    'public/manim/math-lab/vector-distance-norm.mp4',
    'public/manim/math-lab/vector-distance-norm.svg',
    'public/manim/math-lab/cosine-similarity-angle.mp4',
    'public/manim/math-lab/cosine-similarity-angle.svg',
    'public/manim/math-lab/matrix-column-combination.mp4',
    'public/manim/math-lab/matrix-column-combination.svg',
    'public/manim/math-lab/rank-flattening.mp4',
    'public/manim/math-lab/rank-flattening.svg',
    'public/manim/math-lab/null-space-collapse.mp4',
    'public/manim/math-lab/null-space-collapse.svg',
  ]) {
    assert.ok(existsSync(new URL(assetPath, root)), `${assetPath} should exist`)
  }
})
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: fail because scenes and assets are not registered.

- [ ] **Step 3: Add Manim scene classes**

Use `Math-To-Manim` to check the prerequisite flow for each scene. Then append five classes to `scripts/manim/scenes/math_lab_basics.py` using existing imports and visual style.

Each scene must include a clear title and a short caption:

```python
class VectorDistanceNormScene(Scene):
    def construct(self):
        plane = NumberPlane(x_range=[-4, 4, 1], y_range=[-3, 3, 1], background_line_style={"stroke_opacity": 0.2})
        title = Text("Distance compares two endpoints", font_size=30).to_edge(UP)
        caption = Text("norm: origin to vector; distance: vector to vector", font_size=24).to_edge(DOWN)
        a = Arrow(plane.c2p(0, 0), plane.c2p(2.4, 1.2), color=BLUE, buff=0)
        b = Arrow(plane.c2p(0, 0), plane.c2p(1.0, 2.6), color=GREEN, buff=0)
        distance = Line(plane.c2p(2.4, 1.2), plane.c2p(1.0, 2.6), color=ORANGE, stroke_width=7)
        self.play(FadeIn(plane), FadeIn(title), Create(a), FadeIn(caption), run_time=2)
        self.play(Create(b), Create(distance), run_time=2)
        self.wait(1)
```

```python
class CosineSimilarityAngleScene(Scene):
    def construct(self):
        plane = NumberPlane(x_range=[-4, 4, 1], y_range=[-3, 3, 1], background_line_style={"stroke_opacity": 0.2})
        title = Text("Cosine reads direction after length is removed", font_size=28).to_edge(UP)
        a = Arrow(plane.c2p(0, 0), plane.c2p(2.7, 1.0), color=BLUE, buff=0)
        b = Arrow(plane.c2p(0, 0), plane.c2p(1.3, 0.5), color=GREEN, buff=0)
        caption = Text("same direction can have different length", font_size=24).to_edge(DOWN)
        self.play(FadeIn(plane), FadeIn(title), Create(a), Create(b), FadeIn(caption), run_time=2)
        b_rotated = Arrow(plane.c2p(0, 0), plane.c2p(-0.6, 2.4), color=GREEN, buff=0)
        caption_rotated = Text("larger angle lowers cosine", font_size=24).to_edge(DOWN)
        self.play(Transform(b, b_rotated), Transform(caption, caption_rotated), run_time=2)
        self.wait(1)
```

```python
class MatrixColumnCombinationScene(Scene):
    def construct(self):
        plane = NumberPlane(x_range=[-4, 4, 1], y_range=[-3, 3, 1], background_line_style={"stroke_opacity": 0.2})
        title = Text("A x mixes the columns of A", font_size=30).to_edge(UP)
        a1 = Arrow(plane.c2p(0, 0), plane.c2p(2, 1), color=BLUE, buff=0)
        a2 = Arrow(plane.c2p(0, 0), plane.c2p(-0.5, 1.8), color=GREEN, buff=0)
        output = Arrow(plane.c2p(0, 0), plane.c2p(1.5, 2.8), color=ORANGE, buff=0)
        caption = Text("x1 copies of column 1 plus x2 copies of column 2", font_size=23).to_edge(DOWN)
        self.play(FadeIn(plane), FadeIn(title), Create(a1), Create(a2), FadeIn(caption), run_time=2)
        self.play(Create(output), run_time=2)
        self.wait(1)
```

```python
class RankFlatteningScene(Scene):
    def construct(self):
        plane = NumberPlane(x_range=[-4, 4, 1], y_range=[-3, 3, 1], background_line_style={"stroke_opacity": 0.22})
        title = Text("Rank tells how many independent output directions remain", font_size=26).to_edge(UP)
        caption = Text("rank 2: plane remains open", font_size=24).to_edge(DOWN)
        self.play(FadeIn(plane), FadeIn(title), FadeIn(caption), run_time=2)
        collapsed = plane.copy()
        collapsed.apply_matrix([[1.2, 2.4], [0.4, 0.8]])
        caption_rank_one = Text("rank 1: plane collapses to a line", font_size=24).to_edge(DOWN)
        self.play(Transform(plane, collapsed), Transform(caption, caption_rank_one), run_time=2)
        self.wait(1)
```

```python
class NullSpaceCollapseScene(Scene):
    def construct(self):
        plane = NumberPlane(x_range=[-4, 4, 1], y_range=[-3, 3, 1], background_line_style={"stroke_opacity": 0.2})
        title = Text("Null space is the direction A cannot see", font_size=29).to_edge(UP)
        visible = Arrow(plane.c2p(0, 0), plane.c2p(2.0, 1.0), color=BLUE, buff=0)
        invisible = Arrow(plane.c2p(0, 0), plane.c2p(1.0, -2.0), color=RED, buff=0)
        zero = Dot(plane.c2p(0, 0), color=YELLOW)
        caption = Text("one input direction collapses to zero output", font_size=24).to_edge(DOWN)
        self.play(FadeIn(plane), FadeIn(title), Create(visible), Create(invisible), FadeIn(caption), run_time=2)
        self.play(Transform(invisible, zero), run_time=2)
        self.wait(1)
```

- [ ] **Step 4: Register scenes in render script**

In `scripts/manim/render_math_lab.py`, add these entries to `SCENES`.

```python
"VectorDistanceNormScene": "vector-distance-norm.mp4",
"CosineSimilarityAngleScene": "cosine-similarity-angle.mp4",
"MatrixColumnCombinationScene": "matrix-column-combination.mp4",
"RankFlatteningScene": "rank-flattening.mp4",
"NullSpaceCollapseScene": "null-space-collapse.mp4",
```

Add static poster SVGs to `POSTER_SVGS` for all five scenes. Use the same poster dimensions and color style as existing poster strings. Each poster must include the same title text as the scene title.

Use these exact poster title strings:

```python
"VectorDistanceNormScene": "Distance compares two endpoints",
"CosineSimilarityAngleScene": "Cosine reads direction after length is removed",
"MatrixColumnCombinationScene": "A x mixes the columns of A",
"RankFlatteningScene": "Rank counts independent output directions",
"NullSpaceCollapseScene": "Null space is the direction A cannot see",
```

- [ ] **Step 5: Generate metadata and render assets**

Run metadata first:

```bash
python scripts/manim/render_math_lab.py --skip-render
```

Then render the new scenes:

```bash
python scripts/manim/render_math_lab.py --scene VectorDistanceNormScene --scene CosineSimilarityAngleScene --scene MatrixColumnCombinationScene --scene RankFlatteningScene --scene NullSpaceCollapseScene --force
```

Expected: the five MP4s and five SVG posters exist under `public/manim/math-lab/`, and `public/manim/math-lab/metadata.json` includes the five scenes.

- [ ] **Step 6: Wire videos into module data**

In `beginnerFoundationModules.ts`, add these `manimAsset` calls to `beginner-linear-algebra` visuals:

```ts
manimAsset('vector-distance-norm-video', 'vector-distance-norm', copy('距离和向量长度', 'Distance and Vector Length'), copy('动画展示 norm 是从原点到向量终点的长度，distance 是两个向量终点之间的距离。', 'The animation shows norm as length from the origin to one vector endpoint and distance as the segment between two vector endpoints.')),
manimAsset('cosine-similarity-angle-video', 'cosine-similarity-angle', copy('cosine 怎样读取方向', 'How Cosine Reads Direction'), copy('动画展示长度不同但方向接近的向量，以及夹角变大时 cosine 怎样下降。', 'The animation shows vectors with different lengths but similar direction, then shows cosine falling as the angle grows.')),
```

In `vectorMatrixNormsModule.ts`, add visual entries for:

```ts
{
  id: 'matrix-column-combination-video',
  type: 'manim-video',
  title: copy('矩阵列向量怎样混合', 'How Matrix Columns Mix'),
  assetPath: '/manim/math-lab/matrix-column-combination.mp4',
  posterPath: '/manim/math-lab/matrix-column-combination.svg',
  transcript: copy('动画展示输入坐标怎样按比例混合矩阵的两列，得到输出向量。', 'The animation shows input coordinates mixing two matrix columns into an output vector.'),
  learningPurpose: copy('把矩阵乘法从行内积补充为列空间直觉。', 'Add column-space intuition to the row-dot-product view of matrix multiplication.'),
},
{
  id: 'rank-flattening-video',
  type: 'manim-video',
  title: copy('rank 怎样压扁空间', 'How Rank Flattens Space'),
  assetPath: '/manim/math-lab/rank-flattening.mp4',
  posterPath: '/manim/math-lab/rank-flattening.svg',
  transcript: copy('动画展示 rank 2 时平面保持展开，rank 1 时整张网格被压成一条线。', 'The animation shows the plane staying open at rank 2 and the grid collapsing to a line at rank 1.'),
  learningPurpose: copy('帮助学生把 rank 低和信息方向被合并联系起来。', 'Help learners connect low rank with merged information directions.'),
},
{
  id: 'null-space-collapse-video',
  type: 'manim-video',
  title: copy('null space 怎样被压成零', 'How Null Space Collapses to Zero'),
  assetPath: '/manim/math-lab/null-space-collapse.mp4',
  posterPath: '/manim/math-lab/null-space-collapse.svg',
  transcript: copy('动画展示一个输入方向经过矩阵后被压到零输出，因此输出看不见这条方向。', 'The animation shows one input direction collapsing to zero output after the matrix, so the output cannot see that direction.'),
  learningPurpose: copy('帮助学生把 null space 理解成矩阵看不见的输入方向。', 'Help learners read null space as input directions the matrix cannot see.'),
},
```

- [ ] **Step 7: Run layout test**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: pass.

- [ ] **Step 8: Commit**

```bash
git add scripts/manim/scenes/math_lab_basics.py scripts/manim/render_math_lab.py public/manim/math-lab/vector-distance-norm.mp4 public/manim/math-lab/vector-distance-norm.svg public/manim/math-lab/cosine-similarity-angle.mp4 public/manim/math-lab/cosine-similarity-angle.svg public/manim/math-lab/matrix-column-combination.mp4 public/manim/math-lab/matrix-column-combination.svg public/manim/math-lab/rank-flattening.mp4 public/manim/math-lab/rank-flattening.svg public/manim/math-lab/null-space-collapse.mp4 public/manim/math-lab/null-space-collapse.svg public/manim/math-lab/metadata.json src/modules/math-lab/data/beginnerFoundationModules.ts src/modules/math-lab/data/vectorMatrixNormsModule.ts tests/math-lab-layout.test.mjs
git commit -m "Add linear algebra Manim scenes"
```

## Task 8: Final Integration Verification

**Files:**
- Modify only if verification finds a scoped issue in files touched by Tasks 1-7.

- [ ] **Step 1: Run full test suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run:

```bash
npm run build
```

Expected: TypeScript and Vite build complete successfully.

- [ ] **Step 3: Audit changed files**

Run:

```bash
git status --short
git diff --stat HEAD
```

Expected: only files from this plan are modified.

- [ ] **Step 4: Manual content audit**

Open the two module data files and verify:

```text
beginner-linear-algebra includes distance, norm, cosine, 2D/3D bridge, and high-dimensional embedding.
vectors-matrices-norms includes column combination, column space, rank, null space, and matrix transform.
Every new Chinese section has matching English copy.
Every new quiz explanation points to a visual or lab by concept.
No runtime asset path uses a local absolute path or remote URL.
```

- [ ] **Step 5: Commit any verification fixes**

If Step 1 or Step 2 required scoped fixes, commit them:

```bash
git add src/modules/math-lab tests scripts public docs
git commit -m "Polish linear algebra learning path integration"
```

If there were no fixes, do not create an empty commit.
