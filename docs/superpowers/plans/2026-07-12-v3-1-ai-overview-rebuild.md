# V3.1 Phase 1 AI Overview Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `/learn/ai-overview` into the approved eight-chapter, bilingual, deterministic V3.1 foundation course with formative checkpoints, traditional-AI visuals, three algorithm labs, twelve generated information illustrations, and three Manim teaching packages.

**Architecture:** Keep the existing `ai-overview` module ID, route, Curriculum Catalog adapter, and shared LessonPage pilot. Move course-specific typed data, deterministic math, chapter visuals, algorithm labs, media metadata, and static fallbacks into `src/modules/ai-overview/`; leave `src/data/aiOverviewModule.ts` and `src/components/AiOverviewLessonLab.vue` as thin integration surfaces. Generate runtime assets under existing `public/` conventions and keep their reproducibility records under `docs/` and `scripts/manim/`.

**Tech Stack:** Vue 3, TypeScript 5.9, Vite 8, D3 7, Pinia/Vue Router integration, markdown-it/KaTeX safe rendering, Node test runner, Manim Community Edition, built-in image generation, CSS tokens.

## Global Constraints

- Preserve `slug: 'ai-overview'`, route `/learn/ai-overview`, lazy routing, legacy progress access, and the shared LessonPage renderer.
- Runtime content must contain complete `'zh-CN'` and `en` copy with the same variables, data, formulas, experiments, and feedback.
- The eight chapter IDs are `three-problems`, `ai-world-map`, `ml-common-language`, `supervised-linear-regression`, `learning-paradigms`, `unsupervised-kmeans`, `reinforcement-q-learning`, and `choose-learning-approach`.
- Checkpoints are local formative feedback only: no score, navigation gate, upload, backend evidence, or teacher acceptance.
- Core math belongs in deterministic TypeScript utilities with tests; Vue templates only orchestrate state and presentation.
- All stochastic behavior records an integer seed and produces replayable results; invalid numeric input cannot produce NaN or Infinity.
- Desktop renders full algorithm labs. Mobile and low-performance modes render static key states and explanations.
- Reuse existing CSS tokens and assign stable semantic colors plus text/shape/line cues; do not add a UI framework.
- Generated images may contain Chinese but must be checked character by character; deterministic text replacement is mandatory when generation remains wrong.
- Every Manim package contains 1080p MP4, poster, keyframes, metadata, Chinese transcript, English summary, bilingual label table, knowledge tree, verbose prompt, and source.
- Runtime public paths use `withPublicBase` or the existing adjacent pattern and never reference local absolute paths, temporary output, remote images, or `$CODEX_HOME`.
- Do not read, stage, modify, or commit `docs/gpt_advice.md`.

---

## File Structure

Create the following focused module:

```text
src/modules/ai-overview/
├── types.ts
├── data/
│   ├── course.ts
│   ├── media.ts
│   └── experiments.ts
├── utils/
│   ├── random.ts
│   ├── regression.ts
│   ├── kmeans.ts
│   └── qLearning.ts
├── components/
│   ├── AiWorldMap.vue
│   ├── TraditionalAiStepper.vue
│   ├── MlProcessTracer.vue
│   ├── ParadigmComparison.vue
│   ├── ParadigmDecisionTree.vue
│   ├── LearningAssistantMap.vue
│   ├── LlmRouteMap.vue
│   ├── CourseKnowledgeMap.vue
│   └── OverviewMediaFigure.vue
└── labs/
    ├── AiOverviewChapterLab.vue
    ├── RegressionOverviewLab.vue
    ├── KMeansOverviewLab.vue
    ├── QLearningOverviewLab.vue
    └── AlgorithmStaticFallback.vue
```

Keep these existing files as integration surfaces:

- `src/data/aiOverviewModule.ts`: construct the typed `AlgorithmModuleDefinition` from module exports.
- `src/components/AiOverviewLessonLab.vue`: delegate the active section to `AiOverviewChapterLab`.
- `src/views/AlgorithmView.vue`: retain the current lazy/shared lab branch.
- `src/lessons/labRegistry.ts`: retain `ai-overview-task-lab` unless a failing integration test proves a rename is necessary.

---

### Task 1: Typed Course and Experiment Contracts

**Files:**
- Create: `src/modules/ai-overview/types.ts`
- Create: `src/modules/ai-overview/data/experiments.ts`
- Create: `tests/aiOverviewContracts.test.ts`

**Interfaces:**
- Produces: `AiOverviewChapterId`, `LearningParadigm`, `Localized<T>`, `RegressionState`, `KMeansState`, `QLearningState`, and deterministic fixture constants consumed by every later task.
- Produces: `regressionPresets`, `learnerClusterPoints`, `qLearningEnvironment`, `AI_OVERVIEW_SEEDS`.

- [ ] **Step 1: Write the failing contract test**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AI_OVERVIEW_CHAPTER_IDS,
  AI_OVERVIEW_SEEDS,
  learnerClusterPoints,
  qLearningEnvironment,
  regressionPresets,
} from '../src/modules/ai-overview/data/experiments.ts'

test('AI Overview exposes the approved deterministic course contract', () => {
  assert.deepEqual(AI_OVERVIEW_CHAPTER_IDS, [
    'three-problems',
    'ai-world-map',
    'ml-common-language',
    'supervised-linear-regression',
    'learning-paradigms',
    'unsupervised-kmeans',
    'reinforcement-q-learning',
    'choose-learning-approach',
  ])
  assert.deepEqual(Object.keys(regressionPresets), ['clear-trend', 'noisy-trend', 'outlier'])
  assert.equal(learnerClusterPoints.length, 12)
  assert.equal(qLearningEnvironment.width, 4)
  assert.equal(qLearningEnvironment.height, 4)
  assert.equal(qLearningEnvironment.goalReward, 10)
  assert.equal(qLearningEnvironment.stepReward, -1)
  assert.equal(qLearningEnvironment.collisionReward, -3)
  assert.deepEqual(AI_OVERVIEW_SEEDS, { kmeans: 3103, qLearning: 7107 })
})
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node --test tests/aiOverviewContracts.test.ts`<br>
Expected: FAIL because `src/modules/ai-overview/data/experiments.ts` does not exist.

- [ ] **Step 3: Implement exact contracts and fixtures**

```ts
// src/modules/ai-overview/types.ts
import type { AppLocale, LocalizedCopy } from '../../types/ml'

export type Localized<T> = Record<AppLocale, T>
export type AiOverviewChapterId =
  | 'three-problems'
  | 'ai-world-map'
  | 'ml-common-language'
  | 'supervised-linear-regression'
  | 'learning-paradigms'
  | 'unsupervised-kmeans'
  | 'reinforcement-q-learning'
  | 'choose-learning-approach'
export type LearningParadigm = 'supervised' | 'unsupervised' | 'reinforcement'
export type Point2D = { id: string; x: number; y: number }
export type RegressionSample = Point2D
export type RegressionPresetId = 'clear-trend' | 'noisy-trend' | 'outlier'
export type RegressionPreset = { id: RegressionPresetId; label: LocalizedCopy; samples: RegressionSample[] }
export type KMeansPhase = 'initialization' | 'assignment' | 'recomputation' | 'converged'
export type KMeansSnapshot = { iteration: number; phase: KMeansPhase; centers: Point2D[]; assignments: number[]; withinGroupDistanceTotal: number }
export type GridAction = 'up' | 'right' | 'down' | 'left'
export type GridCell = { row: number; column: number }
export type QTable = Record<string, Record<GridAction, number>>
export type QUpdate = { stateKey: string; action: GridAction; reward: number; nextStateKey: string; oldValue: number; target: number; newValue: number }
export type QLearningEnvironment = { width: 4; height: 4; start: GridCell; goal: GridCell; obstacles: GridCell[]; goalReward: 10; stepReward: -1; collisionReward: -3 }
export type StaticAlgorithmFrame = { id: string; title: LocalizedCopy; explanation: LocalizedCopy; values: Record<string, string | number> }
```

```ts
// src/modules/ai-overview/data/experiments.ts
import type { AiOverviewChapterId, Point2D, QLearningEnvironment, RegressionPreset } from '../types'

export const AI_OVERVIEW_CHAPTER_IDS: readonly AiOverviewChapterId[] = [
  'three-problems', 'ai-world-map', 'ml-common-language', 'supervised-linear-regression',
  'learning-paradigms', 'unsupervised-kmeans', 'reinforcement-q-learning', 'choose-learning-approach',
]
export const AI_OVERVIEW_SEEDS = { kmeans: 3103, qLearning: 7107 } as const
export const regressionPresets: Record<RegressionPreset['id'], RegressionPreset> = {
  'clear-trend': { id: 'clear-trend', label: { 'zh-CN': '清晰趋势', en: 'Clear trend' }, samples: [{ id: 's1', x: 1, y: 52 }, { id: 's2', x: 2, y: 59 }, { id: 's3', x: 3, y: 65 }, { id: 's4', x: 4, y: 72 }, { id: 's5', x: 5, y: 78 }] },
  'noisy-trend': { id: 'noisy-trend', label: { 'zh-CN': '带噪声', en: 'Noisy trend' }, samples: [{ id: 's1', x: 1, y: 50 }, { id: 's2', x: 2, y: 63 }, { id: 's3', x: 3, y: 61 }, { id: 's4', x: 4, y: 75 }, { id: 's5', x: 5, y: 76 }] },
  outlier: { id: 'outlier', label: { 'zh-CN': '含异常点', en: 'With outlier' }, samples: [{ id: 's1', x: 1, y: 52 }, { id: 's2', x: 2, y: 59 }, { id: 's3', x: 3, y: 65 }, { id: 's4', x: 4, y: 72 }, { id: 's5', x: 5, y: 98 }] },
}
export const learnerClusterPoints: Point2D[] = [
  { id: 'l1', x: 92, y: 28 }, { id: 'l2', x: 88, y: 33 }, { id: 'l3', x: 95, y: 37 }, { id: 'l4', x: 76, y: 64 },
  { id: 'l5', x: 72, y: 71 }, { id: 'l6', x: 81, y: 68 }, { id: 'l7', x: 48, y: 31 }, { id: 'l8', x: 43, y: 37 },
  { id: 'l9', x: 51, y: 42 }, { id: 'l10', x: 61, y: 88 }, { id: 'l11', x: 56, y: 82 }, { id: 'l12', x: 65, y: 93 },
]
export const qLearningEnvironment: QLearningEnvironment = {
  width: 4, height: 4, start: { row: 3, column: 0 }, goal: { row: 0, column: 3 },
  obstacles: [{ row: 1, column: 1 }, { row: 2, column: 2 }], goalReward: 10, stepReward: -1, collisionReward: -3,
}
```

- [ ] **Step 4: Run contract test and full type build**

Run: `node --test tests/aiOverviewContracts.test.ts && npm run build`<br>
Expected: PASS and build exit 0.

- [ ] **Step 5: Commit contracts**

```bash
git add src/modules/ai-overview/types.ts src/modules/ai-overview/data/experiments.ts tests/aiOverviewContracts.test.ts
git commit -m "feat: define AI overview experiment contracts"
```

### Task 2: Deterministic Random Source and Linear Regression Math

**Files:**
- Create: `src/modules/ai-overview/utils/random.ts`
- Create: `src/modules/ai-overview/utils/regression.ts`
- Create: `tests/aiOverviewRegression.test.ts`

**Interfaces:**
- Produces: `createSeededRandom(seed)`, `predict(sample, w, b)`, `regressionRows(samples, w, b)`, `meanSquaredError(samples, w, b)`, `rankRegressionCandidates(samples, candidates)`.

- [ ] **Step 1: Write failing regression tests**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { meanSquaredError, predict, rankRegressionCandidates, regressionRows } from '../src/modules/ai-overview/utils/regression.ts'

const samples = [{ id: 'a', x: 1, y: 3 }, { id: 'b', x: 2, y: 5 }]
test('regression keeps prediction, residual, squared residual, and MSE consistent', () => {
  assert.equal(predict(samples[0], 2, 1), 3)
  assert.deepEqual(regressionRows(samples, 1, 1), [
    { id: 'a', x: 1, y: 3, predicted: 2, residual: 1, squaredResidual: 1 },
    { id: 'b', x: 2, y: 5, predicted: 3, residual: 2, squaredResidual: 4 },
  ])
  assert.equal(meanSquaredError(samples, 1, 1), 2.5)
})
test('candidate ranking is stable and rejects non-finite parameters', () => {
  assert.deepEqual(rankRegressionCandidates(samples, [{ w: 1, b: 1 }, { w: 2, b: 1 }]).map(({ w, b }) => [w, b]), [[2, 1], [1, 1]])
  assert.throws(() => meanSquaredError(samples, Number.NaN, 0), /finite/)
})
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/aiOverviewRegression.test.ts`<br>
Expected: FAIL because `regression.ts` does not exist.

- [ ] **Step 3: Implement minimal regression utilities**

```ts
import type { RegressionSample } from '../types'
export function predict(sample: RegressionSample, w: number, b: number) { assertFinite(w, b); return w * sample.x + b }
export function regressionRows(samples: RegressionSample[], w: number, b: number) {
  return samples.map((sample) => { const predicted = predict(sample, w, b); const residual = sample.y - predicted; return { ...sample, predicted, residual, squaredResidual: residual ** 2 } })
}
export function meanSquaredError(samples: RegressionSample[], w: number, b: number) {
  if (!samples.length) throw new Error('samples must not be empty')
  return regressionRows(samples, w, b).reduce((sum, row) => sum + row.squaredResidual, 0) / samples.length
}
export function rankRegressionCandidates(samples: RegressionSample[], candidates: Array<{ w: number; b: number }>) {
  return candidates.map((item, index) => ({ ...item, index, mse: meanSquaredError(samples, item.w, item.b) })).sort((a, b) => a.mse - b.mse || a.index - b.index)
}
function assertFinite(...values: number[]) { if (values.some((value) => !Number.isFinite(value))) throw new Error('parameters must be finite') }
```

- [ ] **Step 4: Add and test the seeded random generator**

```ts
export function createSeededRandom(seed: number) {
  if (!Number.isInteger(seed)) throw new Error('seed must be an integer')
  let state = seed >>> 0
  return () => { state = (1664525 * state + 1013904223) >>> 0; return state / 0x100000000 }
}
```

Add a test asserting two generators with seed `3103` return identical first five values and a non-integer seed throws.

- [ ] **Step 5: Run targeted and full tests**

Run: `node --test tests/aiOverviewRegression.test.ts && npm test`<br>
Expected: all tests pass.

- [ ] **Step 6: Commit regression math**

```bash
git add src/modules/ai-overview/utils/random.ts src/modules/ai-overview/utils/regression.ts tests/aiOverviewRegression.test.ts
git commit -m "feat: add deterministic AI overview regression math"
```

### Task 3: Seeded K-means Iteration and Replay History

**Files:**
- Create: `src/modules/ai-overview/utils/kmeans.ts`
- Create: `tests/aiOverviewKMeans.test.ts`

**Interfaces:**
- Produces: `initializeCenters(points, k, seed)`, `assignPoints(points, centers)`, `recomputeCenters(points, assignments, previousCenters)`, `withinGroupDistanceTotal(...)`, `runKMeans(points, k, seed, maxIterations)`.

- [ ] **Step 1: Write failing K-means tests**

```ts
test('K-means records initialization, assignment, recomputation, and convergence', () => {
  const result = runKMeans(learnerClusterPoints, 3, 3103, 50)
  assert.equal(result.history[0].phase, 'initialization')
  assert.ok(result.history.some((item) => item.phase === 'assignment'))
  assert.ok(result.history.some((item) => item.phase === 'recomputation'))
  assert.equal(result.history.at(-1)?.phase, 'converged')
  assert.equal(result.assignments.length, learnerClusterPoints.length)
  assert.deepEqual(runKMeans(learnerClusterPoints, 3, 3103, 50), result)
})
test('K-means supports K=2..5 and rejects invalid values', () => {
  for (const k of [2, 3, 4, 5]) assert.equal(runKMeans(learnerClusterPoints, k, 3103, 50).centers.length, k)
  assert.throws(() => runKMeans(learnerClusterPoints, 1, 3103, 50), /between 2 and 5/)
})
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/aiOverviewKMeans.test.ts`<br>
Expected: FAIL because `kmeans.ts` does not exist.

- [ ] **Step 3: Implement assignment, update, metric, and convergence**

Use squared Euclidean distance for comparisons, arithmetic means for center updates, stable point-order tie breaking, and the seeded shuffle from Task 2. Empty clusters retain their previous center. Stop when assignments do not change or `maxIterations` is reached; append a final `converged` snapshot only when stable.

```ts
export function squaredDistance(a: Point2D, b: Point2D) { return (a.x - b.x) ** 2 + (a.y - b.y) ** 2 }
export function assignPoints(points: Point2D[], centers: Point2D[]) {
  return points.map((point) => centers.reduce((best, center, index) => squaredDistance(point, center) < squaredDistance(point, centers[best]) ? index : best, 0))
}
export function withinGroupDistanceTotal(points: Point2D[], assignments: number[], centers: Point2D[]) {
  return points.reduce((sum, point, index) => sum + squaredDistance(point, centers[assignments[index]]), 0)
}
```

- [ ] **Step 4: Run targeted and full tests**

Run: `node --test tests/aiOverviewKMeans.test.ts && npm test`<br>
Expected: all tests pass.

- [ ] **Step 5: Commit K-means math**

```bash
git add src/modules/ai-overview/utils/kmeans.ts tests/aiOverviewKMeans.test.ts
git commit -m "feat: add replayable K-means teaching engine"
```

### Task 4: Seeded Q-learning Episodes and Policy Evaluation

**Files:**
- Create: `src/modules/ai-overview/utils/qLearning.ts`
- Create: `tests/aiOverviewQLearning.test.ts`

**Interfaces:**
- Produces: `stateKey(cell)`, `createQTable(environment)`, `transition(environment, cell, action)`, `updateQValue(...)`, `selectAction(...)`, `runEpisode(...)`, `trainEpisodes(...)`, `evaluateGreedyPolicy(...)`.

- [ ] **Step 1: Write failing Q-learning tests**

```ts
test('Q update uses reward plus discounted next-state value', () => {
  const update = updateQValue({ oldValue: 0, reward: -1, nextBestValue: 4, learningRate: 0.5, discountFactor: 0.9 })
  assert.deepEqual(update, { oldValue: 0, target: 2.6, newValue: 1.3 })
})
test('environment rewards goal, step, and obstacle collision exactly', () => {
  assert.equal(transition(qLearningEnvironment, { row: 0, column: 2 }, 'right').reward, 10)
  assert.equal(transition(qLearningEnvironment, { row: 3, column: 0 }, 'right').reward, -1)
  assert.equal(transition(qLearningEnvironment, { row: 1, column: 0 }, 'right').reward, -3)
})
test('seeded training is replayable and greedy evaluation disables exploration', () => {
  const first = trainEpisodes(qLearningEnvironment, { episodes: 50, seed: 7107, explorationRate: 0.3, learningRate: 0.5, discountFactor: 0.9 })
  const second = trainEpisodes(qLearningEnvironment, { episodes: 50, seed: 7107, explorationRate: 0.3, learningRate: 0.5, discountFactor: 0.9 })
  assert.deepEqual(second, first)
  assert.equal(evaluateGreedyPolicy(qLearningEnvironment, first.qTable, 32).reachedGoal, true)
})
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/aiOverviewQLearning.test.ts`<br>
Expected: FAIL because `qLearning.ts` does not exist.

- [ ] **Step 3: Implement exact state, transition, update, and seeded action rules**

Use action order `['up', 'right', 'down', 'left']` for deterministic ties. An obstacle collision keeps the agent in the same cell and returns `-3`. A boundary attempt keeps the agent in place and returns the normal step reward `-1`. Q update is:

```ts
const target = reward + discountFactor * nextBestValue
const newValue = oldValue + learningRate * (target - oldValue)
```

Clamp exploration rate, learning rate, and discount factor to `[0, 1]`; reject NaN/Infinity before clamping. End an episode at the goal or after 64 steps. Evaluation always uses exploration rate `0` and never mutates the input Q table.

- [ ] **Step 4: Run targeted and full tests**

Run: `node --test tests/aiOverviewQLearning.test.ts && npm test`<br>
Expected: all tests pass.

- [ ] **Step 5: Commit Q-learning math**

```bash
git add src/modules/ai-overview/utils/qLearning.ts tests/aiOverviewQLearning.test.ts
git commit -m "feat: add deterministic Q-learning teaching engine"
```

### Task 5: Eight Bilingual Chapters and Four Formative Checkpoints

**Files:**
- Create: `src/modules/ai-overview/data/course.ts`
- Modify: `src/data/aiOverviewModule.ts`
- Modify: `src/data/algorithmCheckpoints.ts`
- Modify: `src/lessons/interactionProtocol.ts`
- Modify: `tests/ai-overview-module.test.mjs`
- Create: `tests/aiOverviewContent.test.ts`

**Interfaces:**
- Produces: `aiOverviewChapters`, `aiOverviewScenarioCards`, `traditionalAiMethods`, `learningParadigmRows`, `llmRouteStages`.
- Consumes deterministic fixtures and chapter IDs from Task 1.

- [ ] **Step 1: Replace the five-chapter assertion with failing eight-chapter/parity tests**

```ts
test('AI Overview contains the approved eight bilingual chapters', () => {
  assert.deepEqual(aiOverviewModule.chapters.map((chapter) => chapter.id), AI_OVERVIEW_CHAPTER_IDS)
  assert.equal(aiOverviewModule.chapters.reduce((sum, chapter) => sum + (chapter.estimatedMinutes ?? 0), 0), 135)
  for (const chapter of aiOverviewModule.chapters) {
    assert.ok(chapter.title?.['zh-CN'] && chapter.title.en)
    assert.ok(chapter.markdown['zh-CN'].length > 800)
    assert.ok(chapter.markdown.en.length > 800)
    assert.ok(chapter.callout['zh-CN'] && chapter.callout.en)
  }
})
test('AI Overview checkpoints are formative and revisit real chapters', () => {
  assert.equal(aiOverviewModule.checkpoints.length, 5)
  const ids = new Set(aiOverviewModule.chapters.map((chapter) => chapter.id))
  for (const item of aiOverviewModule.checkpoints) assert.ok(ids.has(item.revisitChapterId))
})
```

Use five `AlgorithmCheckpointItem` records to express the four groups because the final algorithm-update group contains separate K-means and Q-learning questions.

- [ ] **Step 2: Run and verify RED against the current five chapters**

Run: `node --test tests/aiOverviewContent.test.ts tests/ai-overview-module.test.mjs`<br>
Expected: FAIL because the module still has the five legacy chapter IDs and two checkpoints.

- [ ] **Step 3: Author the Chinese master for all eight chapters**

Each Chinese chapter must contain the approved question, exact examples, worked numeric step where required, local misconception corrections, media/lab transition, and next-chapter bridge from the design spec. Use `title` localized copy rather than adding eight new global i18n keys. Assign estimated minutes `[12, 18, 18, 22, 15, 18, 20, 12]`, totaling 135.

- [ ] **Step 4: Author English semantic parity and run content test**

Use the same `x`, `y`, `ŷ`, `w`, `b`, MSE values, `K`, seeds, grid rewards, examples, controls, and misconceptions. Run `node --test tests/aiOverviewContent.test.ts`; expected PASS.

- [ ] **Step 5: Implement five formative checkpoint records**

IDs and revisit chapters:

```ts
[
  ['ai-overview-training-loop-order', 'ml-common-language'],
  ['ai-overview-field-roles', 'ml-common-language'],
  ['ai-overview-paradigm-signal', 'learning-paradigms'],
  ['ai-overview-kmeans-direction', 'unsupervised-kmeans'],
  ['ai-overview-q-value-direction', 'reinforcement-q-learning'],
]
```

Every distractor explanation names its misconception, and `interactionProtocol.ts` describes configuration/observation/explanation only, not submission evidence.

- [ ] **Step 6: Run content and existing pilot tests**

Run: `node --test tests/aiOverviewContent.test.ts tests/ai-overview-module.test.mjs tests/lessonPagePilot.test.ts`<br>
Expected: all tests pass.

- [ ] **Step 7: Commit course content**

```bash
git add src/modules/ai-overview/data/course.ts src/data/aiOverviewModule.ts src/data/algorithmCheckpoints.ts src/lessons/interactionProtocol.ts tests/aiOverviewContent.test.ts tests/ai-overview-module.test.mjs
git commit -m "feat: rebuild AI overview teaching sequence"
```

### Task 6: Eight Code-Native Visuals and Traditional-AI Stepper

**Files:**
- Create: the nine component files under `src/modules/ai-overview/components/` listed in File Structure
- Create: `tests/aiOverviewVisualContracts.test.ts`

**Interfaces:**
- Each component consumes typed localized data from `course.ts` and emits no persisted state.
- `TraditionalAiStepper.vue` owns only the current method and current step index.
- `OverviewMediaFigure.vue` consumes an `AiOverviewMediaAsset` from Task 8.

- [ ] **Step 1: Write failing structural tests for all visuals**

Assert all nine files exist and contain these accessible/state tokens:

```ts
const contracts = {
  'AiWorldMap.vue': ['aria-label', 'generative-ai', 'llm'],
  'TraditionalAiStepper.vue': ['type="button"', 'currentStep', 'reset'],
  'MlProcessTracer.vue': ['learner-id', 'feature', 'target', 'unseen-data'],
  'ParadigmComparison.vue': ['<table', '<th', 'scope="col"'],
  'ParadigmDecisionTree.vue': ['decision-tree', 'learning-signal'],
  'LearningAssistantMap.vue': ['linear-regression', 'k-means', 'q-learning'],
  'LlmRouteMap.vue': ['Python', 'Transformer', 'LLM'],
  'CourseKnowledgeMap.vue': ['print', 'knowledge-map'],
  'OverviewMediaFigure.vue': ['withPublicBase', 'figcaption'],
}
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/aiOverviewVisualContracts.test.ts`<br>
Expected: FAIL because the visual files do not exist.

- [ ] **Step 3: Implement the visuals with native semantic structure**

Use SVG only for exact nodes/edges that need geometry. Use HTML lists/tables for content that must wrap or print. Every SVG has a localized accessible name and every state uses label plus shape. `TraditionalAiStepper` exposes previous, next, and reset buttons and a visible `current/total` readout.

- [ ] **Step 4: Add the printable knowledge-map stylesheet hook and test**

`CourseKnowledgeMap.vue` must expose `.ai-overview-knowledge-map` and a print button that calls `window.print()` only from the user event. CSS implementation occurs in Task 10.

- [ ] **Step 5: Run tests and build**

Run: `node --test tests/aiOverviewVisualContracts.test.ts && npm run build`<br>
Expected: PASS and build exit 0.

- [ ] **Step 6: Commit code-native visuals**

```bash
git add src/modules/ai-overview/components tests/aiOverviewVisualContracts.test.ts
git commit -m "feat: add AI overview concept visuals"
```

### Task 7: Desktop Algorithm Labs and Mobile Static Fallbacks

**Files:**
- Create: the five files under `src/modules/ai-overview/labs/` listed in File Structure
- Modify: `src/components/AiOverviewLessonLab.vue`
- Create: `tests/aiOverviewLabs.test.ts`

**Interfaces:**
- `AiOverviewChapterLab` accepts `{ section: StorySection }` and routes chapter IDs to the correct visual/lab.
- Regression lab consumes Task 2 functions and Task 1 presets.
- K-means lab consumes Task 3 history.
- Q-learning lab consumes Task 4 episode operations.
- Static fallback consumes `StaticAlgorithmFrame[]` generated from the exact deterministic utilities.

- [ ] **Step 1: Write failing lab contract tests**

Assert the compatibility shell imports `AiOverviewChapterLab`, all three labs import their utility module, desktop controls include reset/pause/current value labels, and `AlgorithmStaticFallback` exposes four key states without range inputs.

```ts
assert.match(regressionSource, /meanSquaredError/)
assert.match(regressionSource, /clear-trend/)
assert.match(kmeansSource, /runKMeans/)
assert.match(kmeansSource, /history/)
assert.match(qLearningSource, /trainEpisodes/)
assert.match(qLearningSource, /explorationRate/)
assert.doesNotMatch(staticSource, /type="range"/)
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/aiOverviewLabs.test.ts`<br>
Expected: FAIL because the lab files do not exist.

- [ ] **Step 3: Implement chapter routing and regression lab**

Regression controls: preset, `w`, `b`, single candidate step, auto search, speed, reset, residual toggle. Keep play timers in the component and clear them in `onBeforeUnmount`. Use derived values from Task 2 only.

- [ ] **Step 4: Implement K-means lab**

Controls: `K=2..5`, integer seed, single step, auto run, history previous/next, reset. Plot fixed points and centers in SVG; display assignments with color plus cluster number; show the plain-language metric and current phase.

- [ ] **Step 5: Implement Q-learning lab**

Controls: integer seed, exploration rate, one action, one episode, continuous training, speed, pause, reset. Keep learning rate `0.5` and discount factor `0.9` visible but disabled. Main view shows four current action values and policy arrows; full Q table is in `<details>`.

- [ ] **Step 6: Implement exact static fallbacks**

Create four frames per algorithm: initial, one complete update, intermediate, converged/evaluated. Derive values by running the utility functions at module initialization, not by duplicating numbers in Vue templates. Route the static version with a CSS media query plus `matchMedia('(max-width: 760px)')`/reduced-motion guard that is safe when `window` is unavailable.

- [ ] **Step 7: Run lab tests, all tests, and build**

Run: `node --test tests/aiOverviewLabs.test.ts && npm test && npm run build`<br>
Expected: all tests pass and build exits 0.

- [ ] **Step 8: Commit labs**

```bash
git add src/modules/ai-overview/labs src/components/AiOverviewLessonLab.vue src/views/AlgorithmView.vue tests/aiOverviewLabs.test.ts
git commit -m "feat: add AI overview algorithm labs"
```

### Task 8: Twelve Imagegen Assets and Reproducibility Manifest

**Files:**
- Create: `docs/curriculum-v3/ai-overview/imagegen-prompts.md`
- Create: `docs/curriculum-v3/ai-overview/assets.json`
- Create: `public/ai-overview/generated/` with 12 approved PNG/WebP files
- Create: `src/modules/ai-overview/data/media.ts`
- Create: `tests/aiOverviewAssets.test.ts`

**Interfaces:**
- Produces: `aiOverviewMediaAssets` with asset ID, type, public path, localized title/caption, English summary, bilingual labels, and chapter placement.

- [ ] **Step 1: Write failing manifest and file-existence tests**

```ts
test('AI Overview image manifest covers twelve project-local assets', () => {
  const manifest = JSON.parse(readFileSync(new URL('../docs/curriculum-v3/ai-overview/assets.json', import.meta.url), 'utf8'))
  const images = manifest.assets.filter((asset) => asset.kind === 'imagegen')
  assert.equal(images.length, 12)
  for (const asset of images) {
    assert.ok(asset.prompt.length > 200)
    assert.ok(asset.embeddedChinese.length > 0)
    assert.ok(existsSync(new URL(`../public${asset.publicPath}`, import.meta.url)))
    assert.ok(asset.correction === 'none' || asset.correction === 'deterministic-text-replacement')
  }
})
```

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/aiOverviewAssets.test.ts`<br>
Expected: FAIL because the manifest and assets do not exist.

- [ ] **Step 3: Write exact prompt records before generation**

Use the `scientific-educational` taxonomy, current ML Atlas token colors, 16:9 hero, 4:3 information cards, shared top-scene/bottom-four-cell layout, exact Chinese copy from the approved spec, no watermark, no logo imitation, and generous safe zones. Record one distinct prompt per asset.

- [ ] **Step 4: Generate and approve the hero using the built-in image tool**

Generate the learner-and-intelligent-assistant hero first. Inspect composition, token alignment, title characters, safe zones, and absence of robot imagery. Copy the approved project-bound output from `$CODEX_HOME/generated_images/` into `public/ai-overview/generated/ai-learning-overview-hero.png`.

- [ ] **Step 5: Generate the remaining assets in four review batches**

Use the approved hero as style reference, with separate calls for each distinct asset. Batch order is opening three tasks; house/user cases; six extensions. Inspect every Chinese character and mathematical/data implication. If regeneration does not correct text, replace only the faulty text region deterministically and record `deterministic-text-replacement`.

- [ ] **Step 6: Complete typed media registry and manifest**

The 12 IDs are:

```ts
[
  'ai-overview-hero', 'score-prediction', 'pattern-discovery', 'exercise-selection',
  'house-price', 'user-segmentation', 'spam-detection', 'electricity-demand',
  'news-topics', 'color-compression', 'robot-control', 'traffic-signals',
]
```

- [ ] **Step 7: Run asset tests and build**

Run: `node --test tests/aiOverviewAssets.test.ts && npm run build && npm run build:pages`<br>
Expected: PASS, both builds exit 0, and every public path resolves under both bases.

- [ ] **Step 8: Commit generated images and records**

```bash
git add docs/curriculum-v3/ai-overview public/ai-overview/generated src/modules/ai-overview/data/media.ts tests/aiOverviewAssets.test.ts
git commit -m "feat: add AI overview teaching illustrations"
```

### Task 9: Three Math-To-Manim Teaching Packages

**Files:**
- Create: `scripts/manim/ai_overview/linear_regression_parameter_search.py`
- Create: `scripts/manim/ai_overview/kmeans_convergence.py`
- Create: `scripts/manim/ai_overview/q_learning_strategy.py`
- Create: knowledge-tree and verbose-prompt files beside each scene
- Create: `scripts/manim/render_ai_overview.py`
- Create: `public/manim/ai-overview/metadata.json`
- Create: three MP4s, three posters, and named keyframes under `public/manim/ai-overview/`
- Create: three Chinese transcript Markdown files and bilingual label/English-summary records under `docs/curriculum-v3/ai-overview/manim/`
- Extend: `tests/aiOverviewAssets.test.ts`

**Interfaces:**
- Consumes the exact fixtures/seeds/rewards from Tasks 1–4, duplicated into metadata only through a checked JSON fixture generated by `render_ai_overview.py`.

- [ ] **Step 1: Extend asset test and verify RED**

Assert metadata has exactly three scenes, each scene has duration 60–90 seconds, and all MP4/poster/keyframe/transcript/prompt/tree/source paths exist. Assert metadata records regression preset `clear-trend`, K-means seed `3103`, and Q-learning seed `7107` with rewards `10/-1/-3`.

- [ ] **Step 2: Build reverse knowledge trees and verbose prompts**

Follow Math-To-Manim in this order for each concept: analyze target/level, recursively list prerequisites until high-school foundation, add exact formulas/values, specify semantic colors and scene timing, write a complete scene prompt, then generate Manim CE source. Use the three approved storyboards verbatim.

- [ ] **Step 3: Implement the three Manim scenes and renderer**

Use raw strings for LaTeX, a shared palette module, deterministic data, and explicit scene classes. The renderer produces MP4, poster frame, named keyframes, and metadata in one command:

```bash
python scripts/manim/render_ai_overview.py
```

- [ ] **Step 4: Render and inspect every output**

Check Chinese glyphs, formulas, timing, no clipping, correct data values, and visual agreement with desktop labs. Regenerate on any mismatch. Extract posters/keyframes only from approved renders.

- [ ] **Step 5: Write transcript, English summary, and bilingual labels**

Chinese transcript follows every timed scene. English summary explains the whole mechanism without pretending the Chinese video is localized. Bilingual labels map every embedded Chinese title, variable explanation, status, and reward legend.

- [ ] **Step 6: Run asset tests and rendering check**

Run: `node --test tests/aiOverviewAssets.test.ts && python scripts/manim/render_ai_overview.py --check`<br>
Expected: PASS; check mode reports no source/metadata/output drift.

- [ ] **Step 7: Commit Manim packages**

```bash
git add scripts/manim/ai_overview scripts/manim/render_ai_overview.py public/manim/ai-overview docs/curriculum-v3/ai-overview/manim tests/aiOverviewAssets.test.ts
git commit -m "feat: add AI overview Manim teaching packages"
```

### Task 10: Runtime Media, Styling, Responsive Behavior, and Integration

**Files:**
- Modify: `src/data/aiOverviewModule.ts`
- Modify: `src/modules/ai-overview/data/media.ts`
- Modify: `src/modules/ai-overview/components/OverviewMediaFigure.vue`
- Modify: `src/modules/ai-overview/labs/AiOverviewChapterLab.vue`
- Modify: `src/styles/modules/ai-overview.css`
- Modify: `tests/ai-overview-module.test.mjs`
- Create: `tests/aiOverviewResponsive.test.ts`

**Interfaces:**
- `AiOverviewChapterLab` maps each chapter to its code visual, generated media, Manim asset, desktop lab, or static fallback.
- `OverviewMediaFigure` uses `withPublicBase`, renders localized captions, English summary/bilingual label table when locale is `en`, and Chinese transcript disclosure for videos.

- [ ] **Step 1: Write failing integration/responsive tests**

Assert all eight chapter IDs map to at least one primary visual, video media includes poster and transcript, CSS includes `@media (max-width: 760px)`, `@media (prefers-reduced-motion: reduce)`, and `@media print`, and no color token is the only status selector.

- [ ] **Step 2: Run and verify RED**

Run: `node --test tests/aiOverviewResponsive.test.ts tests/ai-overview-module.test.mjs`<br>
Expected: FAIL until media mapping and responsive styles are complete.

- [ ] **Step 3: Wire exact chapter media/lab mapping**

```ts
export const chapterCompanionKinds = {
  'three-problems': ['imagegen-task-cards'],
  'ai-world-map': ['ai-world-map', 'traditional-ai-stepper'],
  'ml-common-language': ['ml-process-tracer'],
  'supervised-linear-regression': ['linear-regression-video', 'regression-lab', 'house-price-card'],
  'learning-paradigms': ['paradigm-comparison', 'application-cards'],
  'unsupervised-kmeans': ['kmeans-video', 'kmeans-lab', 'user-segmentation-card'],
  'reinforcement-q-learning': ['q-learning-video', 'q-learning-lab'],
  'choose-learning-approach': ['decision-tree', 'assistant-map', 'llm-route', 'knowledge-map'],
} as const
```

- [ ] **Step 4: Implement course-scoped desktop, mobile, reduced-motion, and print styles**

Use existing token variables for ink, muted text, surface, borders, and accent. Preserve 44px minimum interactive targets, visible focus, non-overlapping controls, table horizontal fallback, hidden desktop lab controls below 760px, static fallback visibility below 760px, disabled nonessential transitions under reduced motion, and a clean one-page print layout.

- [ ] **Step 5: Run targeted tests, all tests, and both builds**

Run: `node --test tests/aiOverviewResponsive.test.ts tests/ai-overview-module.test.mjs && npm test && npm run build && npm run build:pages`<br>
Expected: all tests pass; both builds exit 0 with no new warnings beyond the existing large-chunk warning.

- [ ] **Step 6: Commit runtime integration**

```bash
git add src/data/aiOverviewModule.ts src/modules/ai-overview src/styles/modules/ai-overview.css tests/ai-overview-module.test.mjs tests/aiOverviewResponsive.test.ts
git commit -m "feat: integrate V3.1 AI overview experience"
```

### Task 11: Complete Verification and Content/Asset Audit

**Files:**
- Create: `docs/curriculum-v3/ai-overview/QA.md`
- Create: `docs/curriculum-v3/ai-overview/browser-evidence.md`

**Interfaces:**
- Produces auditable verification evidence for the complete Phase 1 course.

- [ ] **Step 1: Run fresh automated verification**

```bash
npm test
npm run build
npm run build:pages
npm run security:audit
```

Expected: all tests pass, both builds exit 0, audit reports 0 vulnerabilities. Record the exact test count and any existing chunk warning in `QA.md`.

- [ ] **Step 2: Rebuild the standard production output last and start preview**

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

Expected: preview serves the standard base at the reported local URL. Do not run `build:pages` after this standard build before browser QA.

- [ ] **Step 3: Run desktop browser matrix**

Verify Chinese and English across all eight chapters, all traditional-AI steps, all regression presets, K values 2 and 5 with reset replay, Q-learning single update/episode/training/evaluation, checkpoint feedback, print map, video poster/transcript/labels, keyboard controls, and zero console errors.

- [ ] **Step 4: Run mobile/reduced-motion matrix**

At representative narrow width, confirm complex controls are absent, all four static states per algorithm are readable, Chinese text does not overflow generated-asset containers, tables scroll or stack safely, and key information does not depend on animation or color. Emulate reduced motion and confirm posters/keyframes replace motion-dependent teaching.

- [ ] **Step 5: Audit requirement coverage**

Check every section of `2026-07-12-v3-1-ai-overview-rebuild-design.md` against runtime content and manifest. Confirm no old URL removal, no progress-store removal, no backend grading, complete English parity, exact data/formula/code agreement, 12 image records, three Manim packages, eight code visuals, and mobile static fallbacks.

- [ ] **Step 6: Fix any failure with RED/GREEN evidence**

For each failure: add or extend one targeted test, run it and observe the expected failure, apply the minimal fix, rerun targeted and full verification, then record the evidence.

- [ ] **Step 7: Commit final audit evidence**

```bash
git add docs/curriculum-v3/ai-overview/QA.md docs/curriculum-v3/ai-overview/browser-evidence.md
git commit -m "docs: record V3.1 AI overview verification"
```

## Plan Self-Review Checklist

- Spec sections 1–18 map to Tasks 1–11.
- Eight chapters and 135 minutes are asserted in Task 5.
- Four formative groups are represented by five independently explainable checkpoint items.
- Twelve imagegen assets and all exact IDs are asserted in Task 8.
- Three Manim storyboards and asset packages are asserted in Task 9.
- Eight code-native visuals are implemented in Task 6.
- Deterministic regression, K-means, and Q-learning math are isolated and tested in Tasks 2–4.
- Desktop labs and mobile static fallbacks are implemented in Task 7.
- Existing route, LessonPage, progress, and public-path behavior are verified in Tasks 5, 10, and 11.
- No task requires reading or staging `docs/gpt_advice.md`.
