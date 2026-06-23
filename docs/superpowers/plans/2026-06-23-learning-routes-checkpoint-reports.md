# Learning Routes and Checkpoint Reports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add route-level learning dashboards and task-style checkpoint reports for the seven linear algebra route chapters.

**Architecture:** Add route metadata and checkpoint-report data beside existing Math Lab course data, then reuse current progress-storage patterns for local drafts. Home and Math Lab home render route summaries, module pages render final report cards and short observation prompts, and selected labs emit evidence snapshots that the report card can cite.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript, Vue Router, Vue I18n, Node test runner, existing Math Lab typed schema, existing localStorage progress helpers, existing CSS modules in `src/styles/modules/math-lab.css` and `src/styles/views/home.css`.

---

## File Structure

Create:

- `src/modules/math-lab/data/learningRoutes.ts`
  - Owns route metadata for `linear-algebra-route`, `ai-math-main-path`, and `numerical-deepening-path`.
  - Exports `linearAlgebraRouteModuleIds`, `learningRoutes`, `learningRouteById`, `nextModuleForRoute`, and `routeProgressSummary`.

- `src/modules/math-lab/data/checkpointReports.ts`
  - Owns the seven linear algebra checkpoint report prompts.
  - Owns static fallback evidence and short observation prompts.
  - Exports `linearAlgebraCheckpointReportPrompts`, `checkpointReportByModuleId`, `checkpointReportForModule`, and `observationPromptForModule`.

- `src/modules/math-lab/utils/checkpointReports.ts`
  - Owns localStorage load/save helpers for report drafts.
  - Owns report completion checks and Markdown export.
  - Reuses `StorageLike` from `src/utils/progressStorage.ts`.

- `src/modules/math-lab/components/LearningRouteSummary.vue`
  - Compact home-page route card.

- `src/modules/math-lab/components/LearningRouteDashboard.vue`
  - Full Math Lab home route dashboard.

- `src/modules/math-lab/components/CheckpointReportCard.vue`
  - Final per-chapter report card with evidence, four fields, save status, and export trigger.

- `src/modules/math-lab/components/ObservationPrompt.vue`
  - Short in-chapter prompt for selected lab-heavy chapters.

Modify:

- `src/modules/math-lab/types/mathLab.ts`
  - Add route, report, field, evidence, saved draft, and observation-prompt interfaces.

- `src/views/HomeView.vue`
  - Import and render `LearningRouteSummary` in the existing learning path area.

- `src/modules/math-lab/pages/MathLabHome.vue`
  - Import and render `LearningRouteDashboard` above or near the existing `LearningPathMap`.

- `src/modules/math-lab/pages/MathLabModulePage.vue`
  - Wire static/dynamic evidence.
  - Render `ObservationPrompt` near selected sections/labs.
  - Render `CheckpointReportCard` after misconceptions and before `CheckpointQuiz`.

- `src/modules/math-lab/labs/FeatureVectorStoryLab.vue`
- `src/modules/math-lab/labs/VectorSimilarityLab.vue`
- `src/modules/math-lab/labs/MatrixTransformLab.vue`
- `src/modules/math-lab/labs/MatrixColumnSpaceLab.vue`
- `src/modules/math-lab/labs/NumericalMiniLab.vue`
- `src/modules/math-lab/labs/PcaProjectionLab.vue`
  - Emit typed experiment evidence snapshots. `NumericalMiniLab.vue` should emit only for `power` and `svd` report contexts in this iteration.

- `src/styles/modules/math-lab.css`
  - Add route dashboard, report card, observation prompt, and export styles.

- `src/styles/views/home.css`
  - Add compact home-page route summary layout.

- `tests/math-lab-core.test.ts`
  - Add route metadata, checkpoint prompt, storage, and export tests.

- `tests/math-lab-layout.test.mjs`
  - Add component existence and page wiring tests.

- `tests/site-navigation.test.ts`
  - Keep existing route coverage; add assertions that route metadata agrees with the linear algebra navigation group.

---

### Task 1: Add Route Metadata and Next-Step Utilities

**Files:**
- Modify: `src/modules/math-lab/types/mathLab.ts`
- Create: `src/modules/math-lab/data/learningRoutes.ts`
- Modify: `tests/math-lab-core.test.ts`
- Modify: `tests/site-navigation.test.ts`

- [ ] **Step 1: Write failing route metadata tests**

In `tests/math-lab-core.test.ts`, add imports:

```ts
import {
  learningRoutes,
  linearAlgebraRouteModuleIds,
  nextModuleForRoute,
  routeProgressSummary,
} from '../src/modules/math-lab/data/learningRoutes.ts'
```

Add this test after the existing `linear algebra route split exposes seven ordered case-driven chapters` test:

```ts
test('learning routes expose a linear algebra route with next-step progress', () => {
  assert.deepEqual(linearAlgebraRouteModuleIds, [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
    'linear-algebra-matrix-transformations',
    'linear-algebra-rank-null-space',
    'eigenvalues-eigenvectors',
    'svd',
    'pca',
  ])

  const route = learningRoutes.find((candidate) => candidate.id === 'linear-algebra-route')
  assert.ok(route)
  assert.equal(route.title['zh-CN'], '线性代数路线')
  assert.equal(route.title.en, 'Linear Algebra Route')
  assert.deepEqual(route.chapterModuleIds, linearAlgebraRouteModuleIds)

  const summary = routeProgressSummary(route, [
    'linear-algebra-feature-space',
    'linear-algebra-distance-similarity',
  ])
  assert.equal(summary.completedCount, 2)
  assert.equal(summary.totalCount, 7)
  assert.equal(summary.nextModuleId, 'linear-algebra-matrix-transformations')
  assert.equal(summary.completedModuleId, 'linear-algebra-distance-similarity')

  assert.equal(nextModuleForRoute(route, linearAlgebraRouteModuleIds), undefined)
})
```

In `tests/site-navigation.test.ts`, add this import:

```ts
import { learningRouteById } from '../src/modules/math-lab/data/learningRoutes.ts'
```

Add this assertion inside the `math lab navigation menu covers all lab module routes with localized labels` test, after the `linearAlgebraGroup` assertion:

```ts
assert.deepEqual(
  learningRouteById['linear-algebra-route'].chapterModuleIds,
  linearAlgebraGroup.items.map((item) => item.id),
)
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/site-navigation.test.ts
```

Expected: FAIL with a module resolution error for `src/modules/math-lab/data/learningRoutes.ts`.

- [ ] **Step 3: Add route interfaces**

Append these interfaces to `src/modules/math-lab/types/mathLab.ts` after `MathLabProgress`:

```ts
export interface LearningRoute {
  id: string
  title: LocalizedCopy
  description: LocalizedCopy
  audience: LocalizedCopy
  chapterModuleIds: MathLabModuleId[]
  nextStepRule: 'first-incomplete'
}

export interface LearningRouteProgressSummary {
  routeId: string
  completedCount: number
  totalCount: number
  completedModuleId?: MathLabModuleId
  nextModuleId?: MathLabModuleId
}
```

- [ ] **Step 4: Implement route metadata**

Create `src/modules/math-lab/data/learningRoutes.ts` with:

```ts
import type {
  LearningRoute,
  LearningRouteProgressSummary,
  LocalizedCopy,
  MathLabModuleId,
} from '../types/mathLab'

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

export const linearAlgebraRouteModuleIds: MathLabModuleId[] = [
  'linear-algebra-feature-space',
  'linear-algebra-distance-similarity',
  'linear-algebra-matrix-transformations',
  'linear-algebra-rank-null-space',
  'eigenvalues-eigenvectors',
  'svd',
  'pca',
]

export const learningRoutes: LearningRoute[] = [
  {
    id: 'ai-math-main-path',
    title: copy('AI 数学主线', 'AI Math Main Path'),
    description: copy(
      '从零基础数学直觉进入 shape、自动微分、概率损失、优化、PCA 和深度结构。',
      'Move from beginner math intuition into shape, autodiff, probabilistic loss, optimization, PCA, and deep architecture math.',
    ),
    audience: copy('想为机器学习建数学地基的初学者。', 'Beginners building the math foundation for machine learning.'),
    chapterModuleIds: [
      'beginner-linear-algebra',
      'linear-algebra-feature-space',
      'linear-algebra-distance-similarity',
      'linear-algebra-matrix-transformations',
      'linear-algebra-rank-null-space',
      'tensor-shapes-vectorization',
      'beginner-calculus',
      'taylor-series',
      'matrix-calculus-autodiff',
      'beginner-probability-distributions',
      'probability-likelihood-entropy',
      'optimization',
      'training-diagnostics',
      'pca',
      'deep-architecture-math',
    ],
    nextStepRule: 'first-incomplete',
  },
  {
    id: 'linear-algebra-route',
    title: copy('线性代数路线', 'Linear Algebra Route'),
    description: copy(
      '从特征向量、距离和矩阵变换走到 rank、eigen、SVD 和 PCA。',
      'Move from feature vectors, distance, and matrix transformations to rank, eigenvectors, SVD, and PCA.',
    ),
    audience: copy('想把线性代数和 AI 表示学习连起来的学习者。', 'Learners connecting linear algebra with AI representation learning.'),
    chapterModuleIds: linearAlgebraRouteModuleIds,
    nextStepRule: 'first-incomplete',
  },
  {
    id: 'numerical-deepening-path',
    title: copy('数值计算加深', 'Numerical Deepening Path'),
    description: copy(
      '把线性系统、稀疏结构、条件数、有限差分和非线性求解放进工程稳定性视角。',
      'Study linear systems, sparse structure, conditioning, finite differences, and nonlinear solving through engineering stability.',
    ),
    audience: copy('想理解数值稳定性和科学计算边界的学习者。', 'Learners who want numerical stability and scientific-computing boundaries.'),
    chapterModuleIds: [
      'lu-decomposition',
      'sparse-matrices',
      'condition-numbers',
      'markov-chains',
      'finite-difference-methods',
      'nonlinear-equations',
      'least-squares-fitting',
    ],
    nextStepRule: 'first-incomplete',
  },
]

export const learningRouteById = Object.fromEntries(
  learningRoutes.map((route) => [route.id, route]),
) as Record<string, LearningRoute>

export function nextModuleForRoute(
  route: LearningRoute,
  completedModuleIds: readonly MathLabModuleId[],
) {
  const completed = new Set(completedModuleIds)
  return route.chapterModuleIds.find((moduleId) => !completed.has(moduleId))
}

export function routeProgressSummary(
  route: LearningRoute,
  completedModuleIds: readonly MathLabModuleId[],
): LearningRouteProgressSummary {
  const completed = new Set(completedModuleIds)
  const completedInRoute = route.chapterModuleIds.filter((moduleId) => completed.has(moduleId))

  return {
    routeId: route.id,
    completedCount: completedInRoute.length,
    totalCount: route.chapterModuleIds.length,
    completedModuleId: completedInRoute.at(-1),
    nextModuleId: nextModuleForRoute(route, completedModuleIds),
  }
}
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/site-navigation.test.ts
```

Expected: PASS for the new route metadata tests and existing navigation tests.

- [ ] **Step 6: Commit**

```bash
git add src/modules/math-lab/types/mathLab.ts src/modules/math-lab/data/learningRoutes.ts tests/math-lab-core.test.ts tests/site-navigation.test.ts
git commit -m "Add math lab learning route metadata"
```

---

### Task 2: Add Checkpoint Report Data, Storage, and Markdown Export

**Files:**
- Modify: `src/modules/math-lab/types/mathLab.ts`
- Create: `src/modules/math-lab/data/checkpointReports.ts`
- Create: `src/modules/math-lab/utils/checkpointReports.ts`
- Modify: `tests/math-lab-core.test.ts`

- [ ] **Step 1: Write failing report data and utility tests**

Add these imports to `tests/math-lab-core.test.ts`:

```ts
import {
  checkpointReportForModule,
  linearAlgebraCheckpointReportPrompts,
  observationPromptForModule,
} from '../src/modules/math-lab/data/checkpointReports.ts'
import {
  buildCheckpointReportMarkdown,
  createDefaultCheckpointReport,
  isCheckpointReportComplete,
  loadCheckpointReport,
  saveCheckpointReport,
} from '../src/modules/math-lab/utils/checkpointReports.ts'
```

Add this helper near the other test helpers:

```ts
function createMemoryStorage(initial: Record<string, string> = {}) {
  const store = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value)
    },
    removeItem: (key: string) => {
      store.delete(key)
    },
    dump: () => Object.fromEntries(store),
  }
}
```

Add tests:

```ts
test('linear algebra checkpoint report prompts cover every route chapter', () => {
  assert.deepEqual(
    linearAlgebraCheckpointReportPrompts.map((prompt) => prompt.moduleId),
    linearAlgebraRouteModuleIds,
  )

  for (const prompt of linearAlgebraCheckpointReportPrompts) {
    assert.equal(prompt.fields.length, 4, `${prompt.moduleId} should have four report fields`)
    assert.deepEqual(
      prompt.fields.map((field) => field.key),
      ['setup', 'observation', 'explanation', 'nextStep'],
    )
    assert.ok(prompt.staticEvidence.metrics.length >= 2, `${prompt.moduleId} needs static evidence`)
    assert.ok(prompt.staticEvidence.summary['zh-CN'])
    assert.ok(prompt.staticEvidence.summary.en)
    assert.ok(prompt.task['zh-CN'])
    assert.ok(prompt.task.en)
  }

  for (const moduleId of [
    'linear-algebra-distance-similarity',
    'linear-algebra-rank-null-space',
    'svd',
    'pca',
  ]) {
    assert.ok(observationPromptForModule(moduleId), `${moduleId} should have an observation prompt`)
  }
})

test('checkpoint report storage handles drafts, completion, and malformed records', () => {
  const storage = createMemoryStorage()
  const report = createDefaultCheckpointReport('linear-algebra-route', 'svd', '2026-06-23T00:00:00.000Z')

  assert.equal(isCheckpointReportComplete(report), false)

  const saved = saveCheckpointReport({
    ...report,
    answers: {
      setup: 'I kept rank k = 2.',
      observation: 'Retained energy stayed high while fine detail faded.',
      explanation: 'The first singular layers carry the main structure.',
      nextStep: 'I would compare validation quality across k values.',
    },
  }, storage)

  assert.equal(isCheckpointReportComplete(saved), true)

  const loaded = loadCheckpointReport('svd', storage)
  assert.equal(loaded?.answers.setup, 'I kept rank k = 2.')
  assert.equal(loaded?.moduleId, 'svd')

  const brokenStorage = createMemoryStorage({
    'ml-atlas:checkpoint-report:svd': '{bad json',
  })
  assert.equal(loadCheckpointReport('svd', brokenStorage), undefined)
})

test('checkpoint report markdown export includes evidence and missing answer markers', () => {
  const complete = {
    ...createDefaultCheckpointReport('linear-algebra-route', 'svd', '2026-06-23T00:00:00.000Z'),
    evidence: checkpointReportForModule('svd')!.staticEvidence,
    answers: {
      setup: 'I kept rank k = 2.',
      observation: 'Energy stayed high.',
      explanation: 'Large singular values carry the dominant layers.',
      nextStep: 'Try k = 3 and compare downstream quality.',
    },
  }
  const partial = createDefaultCheckpointReport('linear-algebra-route', 'pca', '2026-06-23T00:00:00.000Z')

  const markdown = buildCheckpointReportMarkdown(
    'linear-algebra-route',
    [complete, partial],
    mathLabModules,
    'en',
    '2026-06-23T12:00:00.000Z',
  )

  assert.match(markdown, /# Linear Algebra Route Report/)
  assert.match(markdown, /## Singular Value Decomposition/)
  assert.match(markdown, /I kept rank k = 2/)
  assert.match(markdown, /Kept rank/)
  assert.match(markdown, /## Principal Component Analysis/)
  assert.match(markdown, /Not answered yet/)
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: FAIL with module resolution errors for `checkpointReports.ts`.

- [ ] **Step 3: Add report and evidence types**

Append these types to `src/modules/math-lab/types/mathLab.ts` after the route interfaces:

```ts
export type CheckpointReportFieldKey = 'setup' | 'observation' | 'explanation' | 'nextStep'

export interface ExperimentEvidenceMetric {
  label: LocalizedCopy
  value: string | number | LocalizedCopy
  unit?: LocalizedCopy
}

export interface ExperimentEvidence {
  moduleId: MathLabModuleId
  sourceId: string
  summary: LocalizedCopy
  metrics: ExperimentEvidenceMetric[]
  prompt: LocalizedCopy
}

export interface CheckpointReportField {
  key: CheckpointReportFieldKey
  label: LocalizedCopy
  guidingPrompt: LocalizedCopy
  minLength?: number
}

export interface CheckpointReportPrompt {
  id: string
  routeId: string
  moduleId: MathLabModuleId
  title: LocalizedCopy
  task: LocalizedCopy
  staticEvidence: ExperimentEvidence
  fields: CheckpointReportField[]
  exportTitle: LocalizedCopy
}

export interface ObservationPromptConfig {
  id: string
  moduleId: MathLabModuleId
  title: LocalizedCopy
  body: LocalizedCopy
  targetLabId: string
}

export interface SavedCheckpointReport {
  routeId: string
  moduleId: MathLabModuleId
  answers: Record<CheckpointReportFieldKey, string>
  evidence?: ExperimentEvidence
  completed: boolean
  updatedAt: string
}
```

- [ ] **Step 4: Implement checkpoint prompt data**

Create `src/modules/math-lab/data/checkpointReports.ts`. Define:

```ts
import type {
  CheckpointReportField,
  CheckpointReportPrompt,
  ExperimentEvidence,
  LocalizedCopy,
  MathLabModuleId,
  ObservationPromptConfig,
} from '../types/mathLab'
import { linearAlgebraRouteModuleIds } from './learningRoutes'

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

function fields(setup: LocalizedCopy, observation: LocalizedCopy, explanation: LocalizedCopy, nextStep: LocalizedCopy): CheckpointReportField[] {
  return [
    { key: 'setup', label: copy('设置', 'Setup'), guidingPrompt: setup, minLength: 8 },
    { key: 'observation', label: copy('观察', 'Observation'), guidingPrompt: observation, minLength: 8 },
    { key: 'explanation', label: copy('解释', 'Explanation'), guidingPrompt: explanation, minLength: 12 },
    { key: 'nextStep', label: copy('下一步', 'Next Step'), guidingPrompt: nextStep, minLength: 8 },
  ]
}

function evidence(
  moduleId: MathLabModuleId,
  sourceId: string,
  summary: LocalizedCopy,
  metrics: ExperimentEvidence['metrics'],
  prompt: LocalizedCopy,
): ExperimentEvidence {
  return { moduleId, sourceId, summary, metrics, prompt }
}
```

Then create seven prompt objects with these IDs and evidence metrics:

```ts
export const linearAlgebraCheckpointReportPrompts: CheckpointReportPrompt[] = [
  {
    id: 'feature-space-report',
    routeId: 'linear-algebra-route',
    moduleId: 'linear-algebra-feature-space',
    title: copy('对象如何变成向量？', 'How does an object become a vector?'),
    task: copy('调整一组学习记录，说明它的特征坐标如何形成一个向量。', 'Adjust one learner record and explain how its feature coordinates form a vector.'),
    staticEvidence: evidence(
      'linear-algebra-feature-space',
      'feature-vector-story-lab',
      copy('特征值共同描述一个对象在共享空间中的位置。', 'Feature values jointly locate one object in a shared space.'),
      [
        { label: copy('对象', 'Object'), value: copy('学习状态 / 商品 / 用户', 'learner state / product / user') },
        { label: copy('坐标数量', 'Coordinate count'), value: 3 },
      ],
      copy('解释为什么这些数字应该作为一个整体读取。', 'Explain why these numbers should be read as one object.'),
    ),
    fields: fields(
      copy('你调整了哪条学习记录和哪些特征？', 'Which learner record and features did you adjust?'),
      copy('向量位置或差向量显示了什么变化？', 'What did the vector position or difference vector show?'),
      copy('为什么这是一整个向量，而不是分散的表格数字？', 'Why is this one vector rather than disconnected table cells?'),
      copy('如果这是推荐或学习分析，你下一步会检查哪个特征？', 'If this were recommendation or learning analytics, which feature would you inspect next?'),
    ),
    exportTitle: copy('向量与特征空间报告', 'Vectors and Feature Space Report'),
  },
  {
    id: 'distance-similarity-report',
    routeId: 'linear-algebra-route',
    moduleId: 'linear-algebra-distance-similarity',
    title: copy('为什么近不一定更像？', 'Why can near and similar disagree?'),
    task: copy('比较 Euclidean distance 和 cosine similarity 下的排序变化。', 'Compare ranking changes under Euclidean distance and cosine similarity.'),
    staticEvidence: evidence(
      'linear-algebra-distance-similarity',
      'vector-similarity-lab',
      copy('同一组对象可以在距离和方向相似度下得到不同排序。', 'The same objects can rank differently by distance and directional similarity.'),
      [
        { label: copy('指标 1', 'Metric 1'), value: 'Euclidean distance' },
        { label: copy('指标 2', 'Metric 2'), value: 'cosine similarity' },
      ],
      copy('解释哪个指标更适合语义检索，哪个指标更像坐标差距。', 'Explain which metric fits semantic retrieval and which reads coordinate gaps.'),
    ),
    fields: fields(
      copy('你比较了哪两个对象或 embedding？', 'Which two objects or embeddings did you compare?'),
      copy('距离、点积、cosine 或排序发生了什么变化？', 'What changed in distance, dot product, cosine, or ranking?'),
      copy('为什么长度变化会影响距离，但方向仍可能相似？', 'Why can length change distance while direction stays similar?'),
      copy('真实搜索系统里你会怎样选择或校准相似度指标？', 'How would you choose or calibrate a similarity metric in a real search system?'),
    ),
    exportTitle: copy('距离与相似度报告', 'Distance and Similarity Report'),
  },
  {
    id: 'matrix-transform-report',
    routeId: 'linear-algebra-route',
    moduleId: 'linear-algebra-matrix-transformations',
    title: copy('矩阵怎样混合输入特征？', 'How does a matrix mix input features?'),
    task: copy('用列向量线性组合解释一次矩阵乘向量。', 'Explain one matrix-vector product as a linear combination of columns.'),
    staticEvidence: evidence(
      'linear-algebra-matrix-transformations',
      'matrix-transform-lab',
      copy('输入坐标决定矩阵列向量被加入多少。', 'Input coordinates decide how much each matrix column is added.'),
      [
        { label: copy('读法', 'Reading'), value: 'Ax = x1 a1 + x2 a2' },
        { label: copy('输出', 'Output'), value: 'weighted column mixture' },
      ],
      copy('解释输出向量如何由矩阵列组合得到。', 'Explain how the output vector comes from matrix columns.'),
    ),
    fields: fields(
      copy('你设置了怎样的矩阵列和输入坐标？', 'What matrix columns and input coordinates did you set?'),
      copy('输出向量或网格变形怎样变化？', 'How did the output vector or grid transform?'),
      copy('为什么 Ax 可以按列读成线性组合？', 'Why can Ax be read by columns as a linear combination?'),
      copy('如果这是线性层，你会检查哪些特征是否被过度混合？', 'If this were a linear layer, which features would you inspect for over-mixing?'),
    ),
    exportTitle: copy('矩阵变换报告', 'Matrix Transformation Report'),
  },
  {
    id: 'rank-null-space-report',
    routeId: 'linear-algebra-route',
    moduleId: 'linear-algebra-rank-null-space',
    title: copy('模型能看见什么，又看不见什么？', 'What can the model see, and what disappears?'),
    task: copy('把列空间、rank 和 null space 连接到模型盲区。', 'Connect column space, rank, and null space to model blind spots.'),
    staticEvidence: evidence(
      'linear-algebra-rank-null-space',
      'matrix-column-space-lab',
      copy('列相关会让可达输出从平面压成线，null direction 会被矩阵压到零。', 'Dependent columns flatten reachable outputs from a plane to a line, and a null direction collapses to zero.'),
      [
        { label: copy('rank 状态', 'Rank state'), value: 'rank 1 / rank 2' },
        { label: copy('空间读法', 'Space reading'), value: 'column space vs null space' },
      ],
      copy('解释为什么更多列不一定带来更多独立信息。', 'Explain why more columns do not always add independent information.'),
    ),
    fields: fields(
      copy('你把矩阵调到了怎样的 rank 或列空间状态？', 'What rank or column-space state did you set?'),
      copy('可达输出空间和 null direction 怎样变化？', 'How did the reachable output space and null direction change?'),
      copy('这说明模型能看见哪些变化，又看不见哪些变化？', 'What changes can the model see, and what changes disappear?'),
      copy('真实特征工程中你会怎样发现重复或无效特征？', 'How would you find duplicated or ineffective features in real feature engineering?'),
    ),
    exportTitle: copy('Rank 与 Null Space 报告', 'Rank and Null Space Report'),
  },
  {
    id: 'eigen-stable-direction-report',
    routeId: 'linear-algebra-route',
    moduleId: 'eigenvalues-eigenvectors',
    title: copy('为什么有些方向会留下来？', 'Why do some directions survive?'),
    task: copy('用 power iteration 或网络重要性解释稳定方向。', 'Use power iteration or network importance to explain a stable direction.'),
    staticEvidence: evidence(
      'eigenvalues-eigenvectors',
      'eigen-power-iteration-lab',
      copy('反复乘矩阵并归一化后，方向可能靠近主特征向量。', 'Repeated matrix multiplication and normalization can approach the dominant eigenvector.'),
      [
        { label: copy('方法', 'Method'), value: 'power iteration' },
        { label: copy('读数', 'Readout'), value: 'Rayleigh quotient / residual' },
      ],
      copy('解释稳定方向为什么不是普通的坐标不变。', 'Explain why a stable direction is not the same as unchanged coordinates.'),
    ),
    fields: fields(
      copy('你选择了哪种矩阵或迭代设置？', 'Which matrix or iteration setting did you choose?'),
      copy('方向、Rayleigh quotient 或 residual 怎样变化？', 'How did the direction, Rayleigh quotient, or residual change?'),
      copy('为什么这个方向在反复作用后会保留下来？', 'Why does this direction remain after repeated transformation?'),
      copy('如果这是 PageRank 或影响传播，你会怎样验证稳定结果可信？', 'If this were PageRank or influence propagation, how would you validate the stable result?'),
    ),
    exportTitle: copy('特征向量稳定方向报告', 'Eigenvector Stable Direction Report'),
  },
  {
    id: 'svd-low-rank-report',
    routeId: 'linear-algebra-route',
    moduleId: 'svd',
    title: copy('低秩近似保留了什么？', 'What does low-rank approximation keep?'),
    task: copy('选择 rank k，解释保留能量和误差怎样影响重建。', 'Choose rank k and explain how retained energy and error affect reconstruction.'),
    staticEvidence: evidence(
      'svd',
      'svd-low-rank-lab',
      copy('保留前 k 个奇异方向会保留主要结构，剩余误差由后续奇异值控制。', 'Keeping the first k singular directions preserves main structure, while later singular values control the remaining error.'),
      [
        { label: copy('保留秩', 'Kept rank'), value: 'k' },
        { label: copy('误差读数', 'Error readout'), value: 'sigma_{k+1}' },
      ],
      copy('解释为什么主体结构仍在，但细节可能消失。', 'Explain why the main structure remains while details can disappear.'),
    ),
    fields: fields(
      copy('你保留了几个奇异方向？', 'How many singular directions did you keep?'),
      copy('保留能量、误差或重建图案发生了什么？', 'What happened to retained energy, error, or reconstruction pattern?'),
      copy('为什么大奇异值方向先保留主体结构？', 'Why do large-singular-value directions preserve the main structure first?'),
      copy('如果这是压缩、去噪或推荐系统，你会怎样判断 k 是否够用？', 'If this were compression, denoising, or recommendation, how would you decide whether k is enough?'),
    ),
    exportTitle: copy('SVD 低秩近似报告', 'SVD Low-Rank Report'),
  },
  {
    id: 'pca-centered-projection-report',
    routeId: 'linear-algebra-route',
    moduleId: 'pca',
    title: copy('PCA 为什么先中心化？', 'Why does PCA center first?'),
    task: copy('调平移、缩放和保留维度，解释 PCA 的收益与边界。', 'Adjust shift, scale, and kept dimension to explain PCA benefits and boundaries.'),
    staticEvidence: evidence(
      'pca',
      'pca-projection-lab',
      copy('中心化去掉整体平移，主方向按解释方差排序，重建误差显示丢掉的正交信息。', 'Centering removes global shift, principal directions are ordered by explained variance, and reconstruction error shows discarded orthogonal information.'),
      [
        { label: copy('关键步骤', 'Key step'), value: 'center first' },
        { label: copy('风险', 'Risk'), value: 'not a classifier' },
      ],
      copy('解释为什么 PCA 图可用于诊断，但不能直接证明分类效果。', 'Explain why a PCA plot can diagnose structure but not prove classification quality.'),
    ),
    fields: fields(
      copy('你调整了平移、缩放还是保留维度？', 'Did you adjust shift, scale, or kept dimension?'),
      copy('解释方差、重建误差或投影图怎样变化？', 'How did explained variance, reconstruction error, or the projection plot change?'),
      copy('为什么 PCA 必须先中心化？为什么它不是分类器？', 'Why must PCA center first, and why is it not a classifier?'),
      copy('真实 embedding 可视化中你会怎样检查离群点、批次效应或标签方向？', 'In real embedding visualization, how would you check outliers, batch effects, or label direction?'),
    ),
    exportTitle: copy('PCA 中心化投影报告', 'PCA Centered Projection Report'),
  },
]
```

At the end of `checkpointReports.ts`, add:

```ts
const promptByModuleId = new Map(linearAlgebraCheckpointReportPrompts.map((prompt) => [prompt.moduleId, prompt]))

export const checkpointReportByModuleId = Object.fromEntries(promptByModuleId) as Record<MathLabModuleId, CheckpointReportPrompt>

export function checkpointReportForModule(moduleId: MathLabModuleId) {
  return promptByModuleId.get(moduleId)
}

export const observationPrompts: ObservationPromptConfig[] = [
  {
    id: 'distance-observe-metric-change',
    moduleId: 'linear-algebra-distance-similarity',
    title: copy('先制造一次排序变化', 'Create one ranking change first'),
    body: copy('调节维度权重，观察最近 pair 和最像 pair 是否一致。', 'Adjust dimension weights and observe whether the closest pair and most similar pair agree.'),
    targetLabId: 'vector-similarity-lab',
  },
  {
    id: 'rank-observe-collapse',
    moduleId: 'linear-algebra-rank-null-space',
    title: copy('把平面压成线', 'Flatten a plane to a line'),
    body: copy('让两列接近共线，观察 rank、列空间和 null direction。', 'Make two columns nearly collinear and observe rank, column space, and null direction.'),
    targetLabId: 'matrix-column-space-lab',
  },
  {
    id: 'svd-observe-k',
    moduleId: 'svd',
    title: copy('改变保留秩 k', 'Change kept rank k'),
    body: copy('把 k 从 1 调到 3，比较保留能量和误差。', 'Move k from 1 to 3 and compare retained energy with error.'),
    targetLabId: 'svd-low-rank-lab',
  },
  {
    id: 'pca-observe-centering',
    moduleId: 'pca',
    title: copy('先看中心化再看投影', 'Check centering before projection'),
    body: copy('调整体平移和保留维度，观察主方向和重建误差。', 'Adjust common shift and kept dimension, then observe principal directions and reconstruction error.'),
    targetLabId: 'pca-projection-lab',
  },
]

const observationPromptByModuleId = new Map(observationPrompts.map((prompt) => [prompt.moduleId, prompt]))

export function observationPromptForModule(moduleId: MathLabModuleId) {
  return observationPromptByModuleId.get(moduleId)
}

for (const moduleId of linearAlgebraRouteModuleIds) {
  if (!promptByModuleId.has(moduleId)) {
    throw new Error(`Missing checkpoint report prompt for ${moduleId}`)
  }
}
```

- [ ] **Step 5: Implement storage and export utilities**

Create `src/modules/math-lab/utils/checkpointReports.ts` with:

```ts
import type {
  CheckpointReportFieldKey,
  ExperimentEvidence,
  LocalizedCopy,
  MathLabLocale,
  MathLabModule,
  MathLabModuleId,
  SavedCheckpointReport,
} from '../types/mathLab'
import type { StorageLike } from '../../../utils/progressStorage'

const fieldKeys: CheckpointReportFieldKey[] = ['setup', 'observation', 'explanation', 'nextStep']

function storageFor(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

export function checkpointReportStorageKey(moduleId: MathLabModuleId) {
  return `ml-atlas:checkpoint-report:${moduleId}`
}

export function createDefaultCheckpointReport(
  routeId: string,
  moduleId: MathLabModuleId,
  now = new Date().toISOString(),
): SavedCheckpointReport {
  return {
    routeId,
    moduleId,
    answers: {
      setup: '',
      observation: '',
      explanation: '',
      nextStep: '',
    },
    completed: false,
    updatedAt: now,
  }
}

export function isCheckpointReportComplete(report: SavedCheckpointReport) {
  return fieldKeys.every((key) => report.answers[key]?.trim().length > 0)
}

export function loadCheckpointReport(moduleId: MathLabModuleId, storage?: StorageLike) {
  const resolvedStorage = storageFor(storage)
  if (!resolvedStorage) return undefined

  try {
    const raw = resolvedStorage.getItem(checkpointReportStorageKey(moduleId))
    if (!raw) return undefined
    const parsed = JSON.parse(raw) as Partial<SavedCheckpointReport> | null
    if (!parsed || typeof parsed !== 'object' || parsed.moduleId !== moduleId || !parsed.routeId) return undefined
    return {
      routeId: parsed.routeId,
      moduleId,
      answers: {
        setup: parsed.answers?.setup ?? '',
        observation: parsed.answers?.observation ?? '',
        explanation: parsed.answers?.explanation ?? '',
        nextStep: parsed.answers?.nextStep ?? '',
      },
      evidence: parsed.evidence,
      completed: Boolean(parsed.completed),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
    } satisfies SavedCheckpointReport
  } catch {
    return undefined
  }
}

export function saveCheckpointReport(report: SavedCheckpointReport, storage?: StorageLike) {
  const resolvedStorage = storageFor(storage)
  const nextReport = {
    ...report,
    completed: isCheckpointReportComplete(report),
    updatedAt: new Date().toISOString(),
  }
  resolvedStorage?.setItem(checkpointReportStorageKey(report.moduleId), JSON.stringify(nextReport))
  return nextReport
}

function valueText(value: string | number | LocalizedCopy, locale: MathLabLocale) {
  if (typeof value === 'object') return value[locale]
  return String(value)
}

function evidenceMarkdown(evidence: ExperimentEvidence | undefined, locale: MathLabLocale) {
  if (!evidence) return '- Evidence: Not captured yet'
  const lines = [`- Evidence: ${evidence.summary[locale]}`]
  for (const metric of evidence.metrics) {
    const unit = metric.unit ? ` ${metric.unit[locale]}` : ''
    lines.push(`- ${metric.label[locale]}: ${valueText(metric.value, locale)}${unit}`)
  }
  lines.push(`- Prompt: ${evidence.prompt[locale]}`)
  return lines.join('\n')
}

export function buildCheckpointReportMarkdown(
  routeId: string,
  reports: SavedCheckpointReport[],
  modules: MathLabModule[],
  locale: MathLabLocale,
  generatedAt = new Date().toISOString(),
) {
  const moduleById = new Map(modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  const routeTitle = routeId === 'linear-algebra-route'
    ? locale === 'zh-CN' ? '线性代数路线报告' : 'Linear Algebra Route Report'
    : routeId
  const sections = reports.map((report) => {
    const moduleDefinition = moduleById.get(report.moduleId)
    const title = moduleDefinition?.title[locale] ?? report.moduleId
    const answer = (key: CheckpointReportFieldKey) => report.answers[key]?.trim() || (locale === 'zh-CN' ? '尚未作答' : 'Not answered yet')

    return [
      `## ${title}`,
      '',
      evidenceMarkdown(report.evidence, locale),
      '',
      `### ${locale === 'zh-CN' ? '设置' : 'Setup'}`,
      answer('setup'),
      '',
      `### ${locale === 'zh-CN' ? '观察' : 'Observation'}`,
      answer('observation'),
      '',
      `### ${locale === 'zh-CN' ? '解释' : 'Explanation'}`,
      answer('explanation'),
      '',
      `### ${locale === 'zh-CN' ? '下一步' : 'Next Step'}`,
      answer('nextStep'),
    ].join('\n')
  })

  return [`# ${routeTitle}`, '', `Generated: ${generatedAt}`, '', ...sections].join('\n')
}
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts
```

Expected: PASS for checkpoint report prompt, storage, and export tests.

- [ ] **Step 7: Commit**

```bash
git add src/modules/math-lab/types/mathLab.ts src/modules/math-lab/data/checkpointReports.ts src/modules/math-lab/utils/checkpointReports.ts tests/math-lab-core.test.ts
git commit -m "Add linear algebra checkpoint report data"
```

---

### Task 3: Render Route Summaries on Home and Math Lab Home

**Files:**
- Create: `src/modules/math-lab/components/LearningRouteSummary.vue`
- Create: `src/modules/math-lab/components/LearningRouteDashboard.vue`
- Modify: `src/views/HomeView.vue`
- Modify: `src/modules/math-lab/pages/MathLabHome.vue`
- Modify: `src/styles/views/home.css`
- Modify: `src/styles/modules/math-lab.css`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Write failing component and page wiring tests**

In `tests/math-lab-layout.test.mjs`, add component paths to `componentPaths`:

```js
'src/modules/math-lab/components/LearningRouteSummary.vue',
'src/modules/math-lab/components/LearningRouteDashboard.vue',
```

In the `math lab components and labs exist with expected contracts` test, after `homeSource` is read, add:

```js
const homeViewSource = read('src/views/HomeView.vue')
const mathLabHomeSource = read('src/modules/math-lab/pages/MathLabHome.vue')
const routeSummarySource = read('src/modules/math-lab/components/LearningRouteSummary.vue')
const routeDashboardSource = read('src/modules/math-lab/components/LearningRouteDashboard.vue')

assert.match(homeViewSource, /LearningRouteSummary/)
assert.match(homeViewSource, /learningRoutes/)
assert.match(mathLabHomeSource, /LearningRouteDashboard/)
assert.match(mathLabHomeSource, /linear-algebra-route/)
assert.match(routeSummarySource, /completedCount/)
assert.match(routeSummarySource, /nextModuleId/)
assert.match(routeDashboardSource, /reportStatus/)
assert.match(routeDashboardSource, /checkpointReportForModule/)
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: FAIL because the route components do not exist and pages do not import them.

- [ ] **Step 3: Create `LearningRouteSummary.vue`**

Create `src/modules/math-lab/components/LearningRouteSummary.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { LearningRoute, MathLabLocale, MathLabModule, MathLabModuleId } from '../types/mathLab'
import { routeProgressSummary } from '../data/learningRoutes'

const props = defineProps<{
  route: LearningRoute
  modules: MathLabModule[]
  completedModuleIds: MathLabModuleId[]
  locale: MathLabLocale
}>()

const moduleById = computed(() => new Map(props.modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition])))
const summary = computed(() => routeProgressSummary(props.route, props.completedModuleIds))
const nextModule = computed(() => summary.value.nextModuleId ? moduleById.value.get(summary.value.nextModuleId) : undefined)
const actionRoute = computed(() => nextModule.value ? `/math-lab/modules/${nextModule.value.id}` : '/math-lab')
const actionLabel = computed(() => {
  if (!nextModule.value) return props.locale === 'zh-CN' ? '回到路线' : 'Back to route'
  return props.locale === 'zh-CN' ? '继续下一章' : 'Continue next chapter'
})
</script>

<template>
  <article class="learning-route-summary">
    <span class="eyebrow">{{ locale === 'zh-CN' ? '学习路线' : 'Learning route' }}</span>
    <h3>{{ route.title[locale] }}</h3>
    <p>{{ route.description[locale] }}</p>
    <div class="learning-route-summary__meta">
      <strong>{{ summary.completedCount }} / {{ summary.totalCount }}</strong>
      <span>{{ locale === 'zh-CN' ? '已完成' : 'completed' }}</span>
    </div>
    <p v-if="nextModule" class="learning-route-summary__next">
      {{ locale === 'zh-CN' ? '下一章：' : 'Next: ' }}{{ nextModule.title[locale] }}
    </p>
    <p v-else class="learning-route-summary__next">
      {{ locale === 'zh-CN' ? '这条路线已完成。' : 'This route is complete.' }}
    </p>
    <router-link class="action-button action-button--primary" :to="actionRoute">
      {{ actionLabel }}
    </router-link>
  </article>
</template>
```

- [ ] **Step 4: Create `LearningRouteDashboard.vue`**

Create `src/modules/math-lab/components/LearningRouteDashboard.vue`:

```vue
<script setup lang="ts">
import { computed } from 'vue'
import type { LearningRoute, MathLabLocale, MathLabModule, MathLabModuleId } from '../types/mathLab'
import { checkpointReportForModule } from '../data/checkpointReports'
import { loadCheckpointReport } from '../utils/checkpointReports'
import { routeProgressSummary } from '../data/learningRoutes'

const props = defineProps<{
  route: LearningRoute
  modules: MathLabModule[]
  completedModuleIds: MathLabModuleId[]
  locale: MathLabLocale
}>()

const moduleById = computed(() => new Map(props.modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition])))
const summary = computed(() => routeProgressSummary(props.route, props.completedModuleIds))
const routeModules = computed(() => props.route.chapterModuleIds.map((id) => moduleById.value.get(id)).filter((moduleDefinition): moduleDefinition is MathLabModule => Boolean(moduleDefinition)))

function reportStatus(moduleId: MathLabModuleId) {
  const prompt = checkpointReportForModule(moduleId)
  if (!prompt) return props.locale === 'zh-CN' ? '无报告卡' : 'No report'
  const saved = loadCheckpointReport(moduleId)
  if (saved?.completed) return props.locale === 'zh-CN' ? '报告完成' : 'Report complete'
  if (saved) return props.locale === 'zh-CN' ? '报告草稿' : 'Report draft'
  return props.locale === 'zh-CN' ? '待填写' : 'Not started'
}
</script>

<template>
  <section class="learning-route-dashboard">
    <header>
      <span class="eyebrow">{{ locale === 'zh-CN' ? '路线地图' : 'Route map' }}</span>
      <h2>{{ route.title[locale] }}</h2>
      <p>{{ route.description[locale] }}</p>
      <strong>{{ summary.completedCount }} / {{ summary.totalCount }} {{ locale === 'zh-CN' ? '已完成' : 'completed' }}</strong>
    </header>

    <ol class="learning-route-dashboard__list">
      <li
        v-for="moduleDefinition in routeModules"
        :key="moduleDefinition.id"
        :class="{ 'is-complete': completedModuleIds.includes(moduleDefinition.id), 'is-next': summary.nextModuleId === moduleDefinition.id }"
      >
        <router-link :to="`/math-lab/modules/${moduleDefinition.id}`">
          <span>{{ moduleDefinition.order }}</span>
          <strong>{{ moduleDefinition.title[locale] }}</strong>
          <small>{{ reportStatus(moduleDefinition.id) }}</small>
        </router-link>
      </li>
    </ol>
  </section>
</template>
```

- [ ] **Step 5: Wire route summary into `HomeView.vue`**

In `src/views/HomeView.vue`, add imports:

```ts
import LearningRouteSummary from '../modules/math-lab/components/LearningRouteSummary.vue'
import { learningRoutes } from '../modules/math-lab/data/learningRoutes'
import { mathLabModules } from '../modules/math-lab/data/modules'
import { loadMathLabProgress } from '../modules/math-lab/utils/progress'
```

Add:

```ts
const mathLabProgress = computed(() => loadMathLabProgress())
const currentMathLocale = computed(() => locale.value === 'zh-CN' ? 'zh-CN' : 'en')
const highlightedLearningRoutes = computed(() =>
  learningRoutes.filter((route) => ['ai-math-main-path', 'linear-algebra-route', 'numerical-deepening-path'].includes(route.id)),
)
```

In the template, inside the existing learning path area before `beginner-roadmap`, add:

```vue
<section class="home-learning-routes" aria-labelledby="home-learning-routes-title">
  <div class="section-header">
    <span class="eyebrow">{{ locale === 'zh-CN' ? '路线入口' : 'Route entry' }}</span>
    <h2 id="home-learning-routes-title">{{ locale === 'zh-CN' ? '按路线继续学习' : 'Continue by route' }}</h2>
  </div>
  <div class="home-learning-routes__grid">
    <LearningRouteSummary
      v-for="routeDefinition in highlightedLearningRoutes"
      :key="routeDefinition.id"
      :route="routeDefinition"
      :modules="mathLabModules"
      :completed-module-ids="mathLabProgress.completedModuleIds"
      :locale="currentMathLocale"
    />
  </div>
</section>
```

- [ ] **Step 6: Wire dashboard into `MathLabHome.vue`**

In `src/modules/math-lab/pages/MathLabHome.vue`, import:

```ts
import LearningRouteDashboard from '../components/LearningRouteDashboard.vue'
import { learningRouteById } from '../data/learningRoutes'
```

Add:

```ts
const linearAlgebraRoute = computed(() => learningRouteById['linear-algebra-route'])
```

In the template, after the beginner bridge section and before the existing dashboard, add:

```vue
<LearningRouteDashboard
  :route="linearAlgebraRoute"
  :modules="mathLabModules"
  :completed-module-ids="progress.completedModuleIds"
  :locale="currentLocale"
/>
```

- [ ] **Step 7: Add route styles**

In `src/styles/views/home.css`, add:

```css
.home-learning-routes {
  display: grid;
  gap: 1rem;
  margin: 2rem auto;
  max-width: 1180px;
}

.home-learning-routes__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1rem;
}
```

In `src/styles/modules/math-lab.css`, add:

```css
.learning-route-summary,
.learning-route-dashboard {
  border: 1px solid var(--color-border, #d8dfeb);
  background: var(--color-surface, #ffffff);
  border-radius: 8px;
  padding: 1rem;
}

.learning-route-summary {
  display: grid;
  gap: 0.75rem;
}

.learning-route-summary__meta,
.learning-route-summary__next {
  display: flex;
  align-items: baseline;
  gap: 0.45rem;
}

.learning-route-dashboard {
  display: grid;
  gap: 1rem;
}

.learning-route-dashboard__list {
  display: grid;
  gap: 0.65rem;
  list-style: none;
  margin: 0;
  padding: 0;
}

.learning-route-dashboard__list a {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.75rem;
  align-items: center;
  min-width: 0;
  text-decoration: none;
}

.learning-route-dashboard__list strong,
.learning-route-dashboard__list small {
  min-width: 0;
}

.learning-route-dashboard__list .is-next a {
  outline: 2px solid var(--math-accent, #3868ff);
  outline-offset: 3px;
}
```

- [ ] **Step 8: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs tests/site-navigation.test.ts
```

Expected: PASS for component existence and page wiring tests.

- [ ] **Step 9: Commit**

```bash
git add src/modules/math-lab/components/LearningRouteSummary.vue src/modules/math-lab/components/LearningRouteDashboard.vue src/views/HomeView.vue src/modules/math-lab/pages/MathLabHome.vue src/styles/views/home.css src/styles/modules/math-lab.css tests/math-lab-layout.test.mjs
git commit -m "Show learning routes on home pages"
```

---

### Task 4: Render Static Checkpoint Reports and Observation Prompts on Module Pages

**Files:**
- Create: `src/modules/math-lab/components/CheckpointReportCard.vue`
- Create: `src/modules/math-lab/components/ObservationPrompt.vue`
- Modify: `src/modules/math-lab/pages/MathLabModulePage.vue`
- Modify: `src/styles/modules/math-lab.css`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Write failing module page wiring tests**

In `tests/math-lab-layout.test.mjs`, add to `componentPaths`:

```js
'src/modules/math-lab/components/CheckpointReportCard.vue',
'src/modules/math-lab/components/ObservationPrompt.vue',
```

In the module page assertions, add:

```js
assert.match(modulePageSource, /CheckpointReportCard/)
assert.match(modulePageSource, /ObservationPrompt/)
assert.match(modulePageSource, /checkpointReportForModule/)
assert.match(modulePageSource, /observationPromptForModule/)
assert.match(modulePageSource, /onExperimentEvidence/)
assert.match(modulePageSource, /@evidence-change="onExperimentEvidence"/)
```

Also add component source checks:

```js
const reportCardSource = read('src/modules/math-lab/components/CheckpointReportCard.vue')
const observationPromptSource = read('src/modules/math-lab/components/ObservationPrompt.vue')
assert.match(reportCardSource, /saveCheckpointReport/)
assert.match(reportCardSource, /buildCheckpointReportMarkdown/)
assert.match(reportCardSource, /textarea/)
assert.match(reportCardSource, /download/)
assert.match(observationPromptSource, /targetLabId/)
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: FAIL because report components do not exist and the module page is not wired.

- [ ] **Step 3: Create `ObservationPrompt.vue`**

Create `src/modules/math-lab/components/ObservationPrompt.vue`:

```vue
<script setup lang="ts">
import type { MathLabLocale, ObservationPromptConfig } from '../types/mathLab'

defineProps<{
  prompt: ObservationPromptConfig
  locale: MathLabLocale
}>()
</script>

<template>
  <aside class="math-observation-prompt">
    <span>{{ locale === 'zh-CN' ? '观察任务' : 'Observation task' }}</span>
    <strong>{{ prompt.title[locale] }}</strong>
    <p>{{ prompt.body[locale] }}</p>
    <a :href="`#${prompt.targetLabId}`">
      {{ locale === 'zh-CN' ? '跳到对应实验' : 'Jump to the lab' }}
    </a>
  </aside>
</template>
```

- [ ] **Step 4: Create `CheckpointReportCard.vue`**

Create `src/modules/math-lab/components/CheckpointReportCard.vue`:

```vue
<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import type {
  CheckpointReportFieldKey,
  CheckpointReportPrompt,
  ExperimentEvidence,
  MathLabLocale,
  MathLabModule,
  SavedCheckpointReport,
} from '../types/mathLab'
import {
  buildCheckpointReportMarkdown,
  createDefaultCheckpointReport,
  isCheckpointReportComplete,
  loadCheckpointReport,
  saveCheckpointReport,
} from '../utils/checkpointReports'

const props = defineProps<{
  prompt: CheckpointReportPrompt
  evidence?: ExperimentEvidence
  modules: MathLabModule[]
  locale: MathLabLocale
}>()

const saveMessage = ref('')
const saved = loadCheckpointReport(props.prompt.moduleId)
const report = reactive<SavedCheckpointReport>(saved ?? createDefaultCheckpointReport(props.prompt.routeId, props.prompt.moduleId))

watch(
  () => props.evidence,
  (nextEvidence) => {
    if (nextEvidence) report.evidence = nextEvidence
  },
  { immediate: true },
)

const activeEvidence = computed(() => report.evidence ?? props.prompt.staticEvidence)
const completed = computed(() => isCheckpointReportComplete(report))

function updateField(key: CheckpointReportFieldKey, value: string) {
  report.answers[key] = value
  saveMessage.value = ''
}

function saveDraft() {
  const nextReport = saveCheckpointReport(report)
  Object.assign(report, nextReport)
  saveMessage.value = props.locale === 'zh-CN' ? '已保存到本机。' : 'Saved locally.'
}

function downloadMarkdown() {
  saveDraft()
  const markdown = buildCheckpointReportMarkdown(props.prompt.routeId, [report], props.modules, props.locale)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.prompt.moduleId}-checkpoint-report.md`
  link.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <section class="math-checkpoint-report">
    <header>
      <span>{{ locale === 'zh-CN' ? '任务型 checkpoint' : 'Task checkpoint' }}</span>
      <h2>{{ prompt.title[locale] }}</h2>
      <p>{{ prompt.task[locale] }}</p>
    </header>

    <div class="math-checkpoint-report__evidence">
      <strong>{{ locale === 'zh-CN' ? '实验证据' : 'Experiment evidence' }}</strong>
      <p>{{ activeEvidence.summary[locale] }}</p>
      <ul>
        <li v-for="metric in activeEvidence.metrics" :key="metric.label.en">
          <span>{{ metric.label[locale] }}</span>
          <strong>{{ typeof metric.value === 'object' ? metric.value[locale] : metric.value }}{{ metric.unit ? ` ${metric.unit[locale]}` : '' }}</strong>
        </li>
      </ul>
      <p>{{ activeEvidence.prompt[locale] }}</p>
    </div>

    <label
      v-for="field in prompt.fields"
      :key="field.key"
      class="math-checkpoint-report__field"
    >
      <span>{{ field.label[locale] }}</span>
      <small>{{ field.guidingPrompt[locale] }}</small>
      <textarea
        :value="report.answers[field.key]"
        rows="4"
        @input="updateField(field.key, ($event.target as HTMLTextAreaElement).value)"
      />
    </label>

    <div class="math-checkpoint-report__actions">
      <button class="action-button action-button--primary" type="button" @click="saveDraft">
        {{ locale === 'zh-CN' ? '保存报告' : 'Save report' }}
      </button>
      <button class="action-button" type="button" @click="downloadMarkdown">
        {{ locale === 'zh-CN' ? '导出 Markdown' : 'Export Markdown' }}
      </button>
      <span>{{ completed ? (locale === 'zh-CN' ? '四段已填写' : 'All four fields filled') : (locale === 'zh-CN' ? '继续补全四段' : 'Keep filling the four fields') }}</span>
      <span v-if="saveMessage">{{ saveMessage }}</span>
    </div>
  </section>
</template>
```

- [ ] **Step 5: Wire components into `MathLabModulePage.vue`**

Add imports:

```ts
import CheckpointReportCard from '../components/CheckpointReportCard.vue'
import ObservationPrompt from '../components/ObservationPrompt.vue'
import { checkpointReportForModule, observationPromptForModule } from '../data/checkpointReports'
import type { ExperimentEvidence } from '../types/mathLab'
```

Add state and computed values:

```ts
const latestEvidence = ref<Record<string, ExperimentEvidence>>({})
const checkpointReportPrompt = computed(() => checkpointReportForModule(moduleDefinition.value?.id ?? moduleId.value))
const observationPrompt = computed(() => observationPromptForModule(moduleDefinition.value?.id ?? moduleId.value))
const activeReportEvidence = computed(() => {
  const prompt = checkpointReportPrompt.value
  if (!prompt) return undefined
  return latestEvidence.value[prompt.moduleId] ?? prompt.staticEvidence
})

function onExperimentEvidence(evidence: ExperimentEvidence) {
  latestEvidence.value = {
    ...latestEvidence.value,
    [evidence.moduleId]: evidence,
  }
}
```

In both dynamic lab component loops, add:

```vue
@evidence-change="onExperimentEvidence"
```

For each inline lab wrapper, add stable IDs so prompt links work:

```vue
<section v-if="labsForSection(section).length" class="math-module-labs">
  <div
    v-for="lab in labsForSection(section)"
    :id="lab.id"
    :key="lab.id"
  >
    <component
      :is="labComponentFor(lab.componentName)"
      v-bind="labPropsFor(lab)"
      @evidence-change="onExperimentEvidence"
    />
  </div>
</section>
```

Keep the component for remaining labs equivalent:

```vue
<div
  v-for="lab in remainingLabs"
  :id="lab.id"
  :key="lab.id"
>
  <component
    :is="labComponentFor(lab.componentName)"
    v-bind="labPropsFor(lab)"
    @evidence-change="onExperimentEvidence"
  />
</div>
```

Render observation prompt before the final report card:

```vue
<ObservationPrompt
  v-if="observationPrompt"
  :key="observationPrompt.id"
  :prompt="observationPrompt"
  :locale="currentLocale"
/>

<CheckpointReportCard
  v-if="checkpointReportPrompt"
  :key="checkpointReportPrompt.id"
  :prompt="checkpointReportPrompt"
  :evidence="activeReportEvidence"
  :modules="mathLabModules"
  :locale="currentLocale"
/>
```

Place these after misconceptions and before `CheckpointQuiz`.

- [ ] **Step 6: Add report and prompt styles**

In `src/styles/modules/math-lab.css`, add:

```css
.math-observation-prompt,
.math-checkpoint-report {
  border: 1px solid var(--color-border, #d8dfeb);
  border-radius: 8px;
  background: var(--color-surface, #ffffff);
  padding: 1rem;
}

.math-observation-prompt {
  display: grid;
  gap: 0.45rem;
}

.math-checkpoint-report {
  display: grid;
  gap: 1rem;
}

.math-checkpoint-report__evidence {
  display: grid;
  gap: 0.5rem;
  border-radius: 8px;
  background: var(--color-surface-muted, #f7f9fc);
  padding: 0.85rem;
}

.math-checkpoint-report__evidence ul {
  display: grid;
  gap: 0.35rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.math-checkpoint-report__evidence li,
.math-checkpoint-report__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  align-items: center;
  justify-content: space-between;
}

.math-checkpoint-report__field {
  display: grid;
  gap: 0.4rem;
}

.math-checkpoint-report__field textarea {
  width: 100%;
  min-height: 7rem;
  resize: vertical;
  border: 1px solid var(--color-border, #d8dfeb);
  border-radius: 8px;
  padding: 0.75rem;
  font: inherit;
}
```

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs tests/math-lab-core.test.ts
```

Expected: PASS for layout wiring and existing route/report utility tests.

- [ ] **Step 8: Commit**

```bash
git add src/modules/math-lab/components/CheckpointReportCard.vue src/modules/math-lab/components/ObservationPrompt.vue src/modules/math-lab/pages/MathLabModulePage.vue src/styles/modules/math-lab.css tests/math-lab-layout.test.mjs
git commit -m "Render linear algebra checkpoint reports"
```

---

### Task 5: Emit Dynamic Experiment Evidence from Linear Algebra Labs

**Files:**
- Modify: `src/modules/math-lab/labs/FeatureVectorStoryLab.vue`
- Modify: `src/modules/math-lab/labs/VectorSimilarityLab.vue`
- Modify: `src/modules/math-lab/labs/MatrixTransformLab.vue`
- Modify: `src/modules/math-lab/labs/MatrixColumnSpaceLab.vue`
- Modify: `src/modules/math-lab/labs/NumericalMiniLab.vue`
- Modify: `src/modules/math-lab/labs/PcaProjectionLab.vue`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Write failing evidence emit tests**

In `tests/math-lab-layout.test.mjs`, inside the existing `math lab components and labs exist with expected contracts` test, add:

```js
for (const labPath of [
  'src/modules/math-lab/labs/FeatureVectorStoryLab.vue',
  'src/modules/math-lab/labs/VectorSimilarityLab.vue',
  'src/modules/math-lab/labs/MatrixTransformLab.vue',
  'src/modules/math-lab/labs/MatrixColumnSpaceLab.vue',
  'src/modules/math-lab/labs/NumericalMiniLab.vue',
  'src/modules/math-lab/labs/PcaProjectionLab.vue',
]) {
  const labSource = read(labPath)
  assert.match(labSource, /defineEmits/)
  assert.match(labSource, /evidence-change/)
  assert.match(labSource, /ExperimentEvidence/)
}

const numericalMiniLabSource = read('src/modules/math-lab/labs/NumericalMiniLab.vue')
assert.match(numericalMiniLabSource, /retainedEnergy/)
assert.match(numericalMiniLabSource, /spectralError/)
assert.match(numericalMiniLabSource, /rayleighQuotient/)
assert.match(numericalMiniLabSource, /residualNorm/)

const pcaProjectionLabSource = read('src/modules/math-lab/labs/PcaProjectionLab.vue')
assert.match(pcaProjectionLabSource, /retainedVariance/)
assert.match(pcaProjectionLabSource, /reconstructionRmse/)
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs
```

Expected: FAIL because labs do not emit `evidence-change`.

- [ ] **Step 3: Add a common emit pattern to each lab**

In each lab file, add `watch` to the Vue import when it is not already present, and add `ExperimentEvidence` to the existing type import. Use these file-specific import targets:

```ts
// FeatureVectorStoryLab.vue, NumericalMiniLab.vue, PcaProjectionLab.vue
import { computed, ref, watch } from 'vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'

// MatrixTransformLab.vue
import { computed, reactive, watch } from 'vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'

// MatrixColumnSpaceLab.vue
import { computed, reactive, useId, watch } from 'vue'
import type { ExperimentEvidence, MathLabLocale } from '../types/mathLab'

// VectorSimilarityLab.vue already imports watch; only add ExperimentEvidence to the type import.
```

Add emits after props:

```ts
const emit = defineEmits<{
  'evidence-change': [evidence: ExperimentEvidence]
}>()
```

In `FeatureVectorStoryLab.vue`, `VectorSimilarityLab.vue`, `MatrixTransformLab.vue`, `MatrixColumnSpaceLab.vue`, and `PcaProjectionLab.vue`, define a computed `evidence` and watch it:

```ts
watch(
  evidence,
  (nextEvidence) => emit('evidence-change', nextEvidence),
  { immediate: true },
)
```

- [ ] **Step 4: Emit feature-vector evidence**

In `FeatureVectorStoryLab.vue`, build evidence from the existing learner A/B sliders and `evaluation`. The computed should have:

```ts
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
```

- [ ] **Step 5: Emit distance/similarity evidence**

In `VectorSimilarityLab.vue`, define:

```ts
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
```

- [ ] **Step 6: Emit matrix transform evidence**

In `MatrixTransformLab.vue`, emit current matrix, transformed basis vectors, determinant, and invertibility using the existing `matrixValue`, `basisI`, `basisJ`, `determinant`, and `invertible` computed values:

```ts
function formatVector2(vector: { x: number; y: number }) {
  return `(${round(vector.x, 2)}, ${round(vector.y, 2)})`
}

const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'linear-algebra-matrix-transformations',
  sourceId: 'matrix-transform-lab',
  summary: {
    'zh-CN': '当前矩阵通过改变 e1、e2 的去向来变形整张网格。',
    en: 'The current matrix deforms the whole grid by moving where e1 and e2 land.',
  },
  metrics: [
    { label: { 'zh-CN': '矩阵 W', en: 'Matrix W' }, value: matrixValue.value.map((row) => `[${row.map((value) => round(value, 2)).join(', ')}]`).join(' ') },
    { label: { 'zh-CN': 'W e1', en: 'W e1' }, value: formatVector2(basisI.value) },
    { label: { 'zh-CN': 'W e2', en: 'W e2' }, value: formatVector2(basisJ.value) },
    { label: { 'zh-CN': 'det(W)', en: 'det(W)' }, value: round(determinant.value, 3) },
    { label: { 'zh-CN': '可逆', en: 'invertible' }, value: invertible.value ? { 'zh-CN': '是', en: 'yes' } : { 'zh-CN': '接近不可逆', en: 'near no' } },
  ],
  prompt: {
    'zh-CN': '解释为什么只看 W e1 和 W e2 就能预测网格如何变形。',
    en: 'Explain why W e1 and W e2 are enough to predict how the grid deforms.',
  },
}))
```

- [ ] **Step 7: Emit rank/null-space evidence**

In `MatrixColumnSpaceLab.vue`, emit:

```ts
const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'linear-algebra-rank-null-space',
  sourceId: 'matrix-column-space-lab',
  summary: {
    'zh-CN': '当前矩阵显示 rank、列空间状态和 null direction。',
    en: 'The current matrix shows rank, column-space state, and null direction.',
  },
  metrics: [
    { label: { 'zh-CN': 'rank', en: 'rank' }, value: rank.value },
    { label: { 'zh-CN': '列空间', en: 'column space' }, value: columnSpaceLabel.value },
    { label: { 'zh-CN': 'det(A)', en: 'det(A)' }, value: determinant.value.toFixed(3) },
    { label: { 'zh-CN': 'null direction', en: 'null direction' }, value: nullDirection.value ? formatVector(nullDirection.value) : (currentLocale.value === 'zh-CN' ? '只有零向量' : 'zero vector only') },
  ],
  prompt: {
    'zh-CN': '解释这些读数怎样说明模型能看见或看不见的输入变化。',
    en: 'Explain how these readouts show input changes the model can or cannot see.',
  },
}))
```

- [ ] **Step 8: Emit eigen and SVD evidence from `NumericalMiniLab.vue`**

In `NumericalMiniLab.vue`, create:

```ts
const evidence = computed<ExperimentEvidence | undefined>(() => {
  if (labKind.value === 'power') {
    return {
      moduleId: 'eigenvalues-eigenvectors',
      sourceId: 'eigen-power-iteration-lab',
      summary: {
        'zh-CN': 'power iteration 显示当前方向、Rayleigh quotient 和 residual。',
        en: 'Power iteration shows the current direction, Rayleigh quotient, and residual.',
      },
      metrics: [
        { label: { 'zh-CN': '矩阵类型', en: 'Matrix kind' }, value: eigenMatrixKind.value },
        { label: { 'zh-CN': 'Rayleigh quotient', en: 'Rayleigh quotient' }, value: powerIteration.value.rayleighQuotient.toFixed(4) },
        { label: { 'zh-CN': 'residual', en: 'residual' }, value: powerIteration.value.residualNorm.toExponential(2) },
        { label: { 'zh-CN': 'spectral ratio', en: 'spectral ratio' }, value: powerIteration.value.spectralRatio.toFixed(3) },
      ],
      prompt: {
        'zh-CN': '解释为什么 residual 变小时，方向更接近稳定方向。',
        en: 'Explain why a smaller residual means the direction is closer to a stable direction.',
      },
    }
  }

  if (labKind.value === 'svd') {
    return {
      moduleId: 'svd',
      sourceId: 'svd-low-rank-lab',
      summary: {
        'zh-CN': 'SVD 低秩实验显示保留能量、谱误差和重建残差。',
        en: 'The SVD low-rank lab shows retained energy, spectral error, and reconstruction residual.',
      },
      metrics: [
        { label: { 'zh-CN': '保留秩 k', en: 'Kept rank k' }, value: svd.value.keptRank },
        { label: { 'zh-CN': 'retainedEnergy', en: 'retainedEnergy' }, value: `${(svd.value.retainedEnergy * 100).toFixed(1)}%` },
        { label: { 'zh-CN': 'spectralError', en: 'spectralError' }, value: svd.value.spectralError.toFixed(3) },
        { label: { 'zh-CN': 'frobeniusError', en: 'frobeniusError' }, value: svd.value.frobeniusError.toFixed(3) },
      ],
      prompt: {
        'zh-CN': '解释保留能量高时，为什么仍可能丢掉小细节。',
        en: 'Explain why small details may still be lost even when retained energy is high.',
      },
    }
  }

  return undefined
})

watch(
  evidence,
  (nextEvidence) => {
    if (nextEvidence) emit('evidence-change', nextEvidence)
  },
  { immediate: true },
)
```

- [ ] **Step 9: Emit PCA evidence**

In `PcaProjectionLab.vue`, emit:

```ts
const evidence = computed<ExperimentEvidence>(() => ({
  moduleId: 'pca',
  sourceId: 'pca-projection-lab',
  summary: {
    'zh-CN': 'PCA 实验显示中心化后投影、解释方差和重建误差。',
    en: 'The PCA lab shows centered projection, explained variance, and reconstruction error.',
  },
  metrics: [
    { label: { 'zh-CN': '保留主成分', en: 'Kept components' }, value: keptComponents.value },
    { label: { 'zh-CN': 'explainedVariance', en: 'explainedVariance' }, value: `${(evaluation.value.retainedVariance * 100).toFixed(1)}%` },
    { label: { 'zh-CN': 'reconstructionError', en: 'reconstructionError' }, value: evaluation.value.reconstructionRmse.toFixed(3) },
    { label: { 'zh-CN': '整体平移', en: 'Common shift' }, value: meanShift.value.toFixed(2) },
    { label: { 'zh-CN': '点云类型', en: 'Point cloud' }, value: datasetKind.value },
  ],
  prompt: {
    'zh-CN': '解释中心化、解释方差和重建误差如何共同说明 PCA 投影。',
    en: 'Explain how centering, explained variance, and reconstruction error together explain PCA projection.',
  },
}))
```

- [ ] **Step 10: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-layout.test.mjs tests/math-lab-core.test.ts
```

Expected: PASS for evidence emit textual checks and utility tests.

- [ ] **Step 11: Commit**

```bash
git add src/modules/math-lab/labs/FeatureVectorStoryLab.vue src/modules/math-lab/labs/VectorSimilarityLab.vue src/modules/math-lab/labs/MatrixTransformLab.vue src/modules/math-lab/labs/MatrixColumnSpaceLab.vue src/modules/math-lab/labs/NumericalMiniLab.vue src/modules/math-lab/labs/PcaProjectionLab.vue tests/math-lab-layout.test.mjs
git commit -m "Emit checkpoint evidence from linear algebra labs"
```

---

### Task 6: Route Export Polish, Accessibility Checks, and Final Verification

**Files:**
- Modify: `src/modules/math-lab/components/LearningRouteDashboard.vue`
- Modify: `src/modules/math-lab/components/CheckpointReportCard.vue`
- Modify: `src/modules/math-lab/utils/checkpointReports.ts`
- Modify: `src/styles/modules/math-lab.css`
- Modify: `tests/math-lab-core.test.ts`
- Modify: `tests/math-lab-layout.test.mjs`

- [ ] **Step 1: Write final export and accessibility guard tests**

In `tests/math-lab-layout.test.mjs`, extend the same `math lab components and labs exist with expected contracts` test. Reuse the `reportCardSource` constant from Task 4, then add:

```js
const dashboardSource = read('src/modules/math-lab/components/LearningRouteDashboard.vue')
const mathLabStyles = read('src/styles/modules/math-lab.css')

assert.match(reportCardSource, /aria-live/)
assert.match(reportCardSource, /type="button"/)
assert.match(reportCardSource, /textarea/)
assert.match(dashboardSource, /aria-label/)
assert.match(mathLabStyles, /grid-template-columns:\s*repeat\(auto-fit/)
assert.match(mathLabStyles, /@media \(max-width: 720px\)/)
```

In `tests/math-lab-core.test.ts`, extend the Markdown export test so it exports all seven route reports:

```ts
const allReports = linearAlgebraRouteModuleIds.map((moduleId) => ({
  ...createDefaultCheckpointReport('linear-algebra-route', moduleId, '2026-06-23T00:00:00.000Z'),
  evidence: checkpointReportForModule(moduleId)!.staticEvidence,
}))
const fullMarkdown = buildCheckpointReportMarkdown('linear-algebra-route', allReports, mathLabModules, 'zh-CN', '2026-06-23T12:00:00.000Z')
for (const moduleId of linearAlgebraRouteModuleIds) {
  const moduleDefinition = mathLabModules.find((candidate) => candidate.id === moduleId)!
  const escapedTitle = moduleDefinition.title['zh-CN'].replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  assert.match(fullMarkdown, new RegExp(escapedTitle))
}
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/math-lab-layout.test.mjs
```

Expected: FAIL until aria-live, aria labels, mobile styles, and full-route export behavior are complete.

- [ ] **Step 3: Add dashboard route export action**

In `LearningRouteDashboard.vue`, extend the existing checkpoint-report utility import so it includes:

```ts
import { buildCheckpointReportMarkdown, createDefaultCheckpointReport, loadCheckpointReport } from '../utils/checkpointReports'
```

Add:

```ts
function exportRouteMarkdown() {
  const reports = props.route.chapterModuleIds.map((moduleId) =>
    loadCheckpointReport(moduleId) ?? createDefaultCheckpointReport(props.route.id, moduleId),
  )
  const markdown = buildCheckpointReportMarkdown(props.route.id, reports, props.modules, props.locale)
  const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${props.route.id}-checkpoint-reports.md`
  link.click()
  URL.revokeObjectURL(url)
}
```

Add a dashboard button:

```vue
<button class="action-button" type="button" @click="exportRouteMarkdown">
  {{ locale === 'zh-CN' ? '导出整条路线报告' : 'Export route report' }}
</button>
```

Add `aria-label` to the section:

```vue
<section class="learning-route-dashboard" :aria-label="route.title[locale]">
```

- [ ] **Step 4: Add live save feedback to report card**

In `CheckpointReportCard.vue`, change the save feedback span to:

```vue
<span v-if="saveMessage" aria-live="polite">{{ saveMessage }}</span>
```

Ensure both buttons already have `type="button"`.

- [ ] **Step 5: Add mobile route styles**

In `src/styles/modules/math-lab.css`, extend dashboard styles:

```css
.learning-route-dashboard__list {
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

@media (max-width: 720px) {
  .learning-route-dashboard__list a {
    grid-template-columns: auto 1fr;
  }

  .learning-route-dashboard__list small {
    grid-column: 2;
  }

  .math-checkpoint-report__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .math-checkpoint-report__actions .action-button {
    width: 100%;
  }
}
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm test -- tests/math-lab-core.test.ts tests/math-lab-layout.test.mjs
```

Expected: PASS.

- [ ] **Step 7: Run full verification**

Run:

```bash
npm test
npm run build
npm run build:pages
```

Expected:

- `npm test`: all tests pass.
- `npm run build`: exits 0. Existing large chunk warnings are acceptable if unchanged.
- `npm run build:pages`: exits 0. Existing large chunk warnings are acceptable if unchanged.

- [ ] **Step 8: Commit**

```bash
git add src/modules/math-lab/components/LearningRouteDashboard.vue src/modules/math-lab/components/CheckpointReportCard.vue src/modules/math-lab/utils/checkpointReports.ts src/styles/modules/math-lab.css tests/math-lab-core.test.ts tests/math-lab-layout.test.mjs
git commit -m "Polish checkpoint report export and accessibility"
```

---

## Execution Notes

- Keep report cards scoped to the seven linear algebra route chapters.
- Do not rewrite existing quiz behavior.
- Do not add a backend, account system, teacher dashboard, or AI grading.
- Do not convert every Math Lab module to report cards in this plan.
- Use existing `LocalizedCopy` fields for every user-facing string.
- Keep public paths and generated assets untouched; this plan does not require new image or Manim assets.

## Final Verification Checklist

After all tasks are complete:

- [ ] `npm test`
- [ ] `npm run build`
- [ ] `npm run build:pages`
- [ ] Check `git status --short` contains no uncommitted files.
- [ ] Confirm the open PR branch contains the new implementation commits.
