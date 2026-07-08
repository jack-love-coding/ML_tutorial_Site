# Optimizer Curve Diagnosis Challenge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one active optimizer curve-diagnosis task to `optimizer-comparison` so learners predict the likely issue and next controlled experiment from deterministic curve evidence.

**Architecture:** Implement a pure TypeScript helper for deterministic curve scenarios and scoring, then render a local Vue challenge component inside the existing optimizer workflow page. Keep the existing `optimizerStages` explanation available and avoid persistence, route migration, backend, database, and project-readiness scope.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript, Node test runner, existing algorithm shell CSS.

## Global Constraints

- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not add a freeform optimizer simulator or new course module.
- Do not migrate `optimizer-comparison` into `LessonPage`.
- Keep all learner-facing copy bilingual with `'zh-CN'` and `en`.
- Core calculations and scoring must live in `src/simulations/`, not inside Vue templates.
- Existing spine, Topic Library roles, legacy routes, and checkpoint submissions must remain intact.

---

## File Structure

- Create `src/simulations/optimizerCurveDiagnosisChallenge.ts`
  - Owns scenario data, evidence derivation, prediction normalization, and scoring.
- Create `src/components/OptimizerCurveDiagnosisChallengeLab.vue`
  - Owns local UI state, bilingual copy, deterministic SVG rendering, controls, and feedback.
- Modify `src/components/AppliedWorkflowLessonLab.vue`
  - Imports and renders the challenge only for `optimizer-comparison` `curve-diagnosis`.
- Modify `src/styles/views/algorithm-shell.css`
  - Adds scoped styles for `.optimizer-curve-challenge`.
- Modify `src/data/optimizerComparisonModule.ts`
  - Updates the `curve-diagnosis` experiment prompt to point to the prediction task.
- Create `tests/optimizer-curve-diagnosis-challenge.test.ts`
  - Covers helper math, invalid predictions, component source tokens, and wiring source tokens.
- Modify `tests/deep-learning-extension-modules.test.mjs`
  - Adds token coverage for the new challenge only if source-token coverage should lock the wiring.
- Modify `.planning/STATE.md` and add `docs/refactor/summaries/phase-20.md`
  - Summarizes implementation and self-review after runtime work is complete.

---

### Task 1: Helper Tests

**Files:**
- Create: `tests/optimizer-curve-diagnosis-challenge.test.ts`
- Later consumed by: `src/simulations/optimizerCurveDiagnosisChallenge.ts`

**Interfaces:**
- Consumes: `evaluateOptimizerCurveDiagnosisChallenge(input)`
- Consumes: `optimizerCurveDiagnosisScenarios`
- Produces: A failing test contract for helper implementation.

- [ ] **Step 1: Write the failing tests**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  evaluateOptimizerCurveDiagnosisChallenge,
  optimizerCurveDiagnosisScenarios,
} from '../src/simulations/optimizerCurveDiagnosisChallenge.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('optimizer curve diagnosis covers all required scenario causes', () => {
  assert.deepEqual(optimizerCurveDiagnosisScenarios.map((scenario) => scenario.id), [
    'lr-divergence',
    'small-batch-noise',
    'ravine-zigzag',
    'schedule-plateau',
  ])

  const divergence = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'lr-divergence',
    prediction: {
      issue: 'learning-rate-too-high',
      nextExperiment: 'lower-learning-rate',
    },
  })
  assert.equal(divergence.evidence.hasNonFiniteLoss, true)
  assert.equal(divergence.result.allCorrect, true)

  const batchNoise = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'small-batch-noise',
    prediction: {
      issue: 'batch-noise-too-high',
      nextExperiment: 'increase-batch-size',
    },
  })
  assert.ok(batchNoise.evidence.trainVolatility > batchNoise.evidence.validationVolatility)
  assert.equal(batchNoise.result.allCorrect, true)

  const ravine = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'ravine-zigzag',
    prediction: {
      issue: 'momentum-or-adaptive-needed',
      nextExperiment: 'add-momentum-or-adam',
    },
  })
  assert.ok(ravine.evidence.trainVolatility > 0)
  assert.equal(ravine.result.allCorrect, true)

  const schedule = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'schedule-plateau',
    prediction: {
      issue: 'schedule-needed',
      nextExperiment: 'add-or-move-lr-decay',
    },
  })
  assert.equal(schedule.evidence.learningRateChanges, 0)
  assert.ok(schedule.evidence.plateauDelta < 0.05)
  assert.equal(schedule.result.allCorrect, true)
})

test('optimizer curve diagnosis normalizes invalid predictions', () => {
  const snapshot = evaluateOptimizerCurveDiagnosisChallenge({
    scenarioId: 'unknown-scenario',
    prediction: {
      issue: 'not-a-real-issue',
      nextExperiment: 'not-a-real-experiment',
    },
  })

  assert.equal(snapshot.scenario.id, 'lr-divergence')
  assert.equal(snapshot.result.issueCorrect, false)
  assert.equal(snapshot.result.experimentCorrect, false)
  assert.equal(snapshot.result.allCorrect, false)
})

test('optimizer curve challenge component and workflow wiring are present', () => {
  const componentSource = read('src/components/OptimizerCurveDiagnosisChallengeLab.vue')
  assert.match(componentSource, /optimizer-curve-challenge/)
  assert.match(componentSource, /evaluateOptimizerCurveDiagnosisChallenge/)
  assert.match(componentSource, /learning-rate-too-high/)
  assert.match(componentSource, /batch-noise-too-high/)
  assert.match(componentSource, /momentum-or-adaptive-needed/)
  assert.match(componentSource, /schedule-needed/)

  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  assert.match(workflowSource, /OptimizerCurveDiagnosisChallengeLab/)
  assert.match(workflowSource, /section\.id === 'curve-diagnosis'/)
})
```

- [ ] **Step 2: Run tests to verify failure**

Run:

```bash
node --test tests/optimizer-curve-diagnosis-challenge.test.ts
```

Expected: FAIL because `src/simulations/optimizerCurveDiagnosisChallenge.ts` and the component do not exist yet.

- [ ] **Step 3: Commit**

Do not commit this task alone unless the project wants strict red commits. Prefer committing Task 1 with Task 2 when the helper passes.

---

### Task 2: Deterministic Helper

**Files:**
- Create: `src/simulations/optimizerCurveDiagnosisChallenge.ts`
- Test: `tests/optimizer-curve-diagnosis-challenge.test.ts`

**Interfaces:**
- Produces: `optimizerCurveDiagnosisScenarios`
- Produces: `evaluateOptimizerCurveDiagnosisChallenge(input)`
- Consumes: no Vue, DOM, D3, browser, or TensorFlow APIs.

- [ ] **Step 1: Implement the helper**

```ts
export type OptimizerCurveScenarioId =
  | 'lr-divergence'
  | 'small-batch-noise'
  | 'ravine-zigzag'
  | 'schedule-plateau'

export type OptimizerCurveIssue =
  | 'learning-rate-too-high'
  | 'batch-noise-too-high'
  | 'momentum-or-adaptive-needed'
  | 'schedule-needed'

export type OptimizerCurveExperiment =
  | 'lower-learning-rate'
  | 'increase-batch-size'
  | 'add-momentum-or-adam'
  | 'add-or-move-lr-decay'

export interface OptimizerCurvePrediction {
  issue: OptimizerCurveIssue
  nextExperiment: OptimizerCurveExperiment
}

export interface OptimizerCurvePoint {
  step: number
  trainLoss: number
  validationLoss: number
  learningRate: number
}

export interface OptimizerCurveScenario {
  id: OptimizerCurveScenarioId
  optimizer: string
  batchSize: number
  learningRate: number
  note: string
  points: OptimizerCurvePoint[]
  expectedIssue: OptimizerCurveIssue
  expectedExperiment: OptimizerCurveExperiment
}

export interface OptimizerCurveDiagnosisSnapshot {
  scenario: OptimizerCurveScenario
  evidence: {
    finalTrainLoss: number
    finalValidationLoss: number
    trainVolatility: number
    validationVolatility: number
    plateauDelta: number
    hasNonFiniteLoss: boolean
    learningRateChanges: number
  }
  result: {
    issueCorrect: boolean
    experimentCorrect: boolean
    allCorrect: boolean
  }
}

interface OptimizerCurveChallengeInput {
  scenarioId: string
  prediction: {
    issue: string
    nextExperiment: string
  }
}

const issues: OptimizerCurveIssue[] = [
  'learning-rate-too-high',
  'batch-noise-too-high',
  'momentum-or-adaptive-needed',
  'schedule-needed',
]

const experiments: OptimizerCurveExperiment[] = [
  'lower-learning-rate',
  'increase-batch-size',
  'add-momentum-or-adam',
  'add-or-move-lr-decay',
]

export const optimizerCurveDiagnosisScenarios: OptimizerCurveScenario[] = [
  {
    id: 'lr-divergence',
    optimizer: 'SGD',
    batchSize: 64,
    learningRate: 0.8,
    note: 'same model, same seed, only learning rate is aggressive',
    expectedIssue: 'learning-rate-too-high',
    expectedExperiment: 'lower-learning-rate',
    points: [
      { step: 0, trainLoss: 1.2, validationLoss: 1.25, learningRate: 0.8 },
      { step: 1, trainLoss: 1.35, validationLoss: 1.38, learningRate: 0.8 },
      { step: 2, trainLoss: 1.9, validationLoss: 1.95, learningRate: 0.8 },
      { step: 3, trainLoss: Number.POSITIVE_INFINITY, validationLoss: Number.POSITIVE_INFINITY, learningRate: 0.8 },
    ],
  },
  {
    id: 'small-batch-noise',
    optimizer: 'SGD',
    batchSize: 8,
    learningRate: 0.04,
    note: 'same learning rate, very small batch',
    expectedIssue: 'batch-noise-too-high',
    expectedExperiment: 'increase-batch-size',
    points: [
      { step: 0, trainLoss: 1.2, validationLoss: 1.18, learningRate: 0.04 },
      { step: 1, trainLoss: 0.92, validationLoss: 1.05, learningRate: 0.04 },
      { step: 2, trainLoss: 1.08, validationLoss: 0.98, learningRate: 0.04 },
      { step: 3, trainLoss: 0.76, validationLoss: 0.91, learningRate: 0.04 },
      { step: 4, trainLoss: 0.88, validationLoss: 0.84, learningRate: 0.04 },
    ],
  },
  {
    id: 'ravine-zigzag',
    optimizer: 'SGD',
    batchSize: 64,
    learningRate: 0.08,
    note: 'same task, narrow valley, no momentum',
    expectedIssue: 'momentum-or-adaptive-needed',
    expectedExperiment: 'add-momentum-or-adam',
    points: [
      { step: 0, trainLoss: 1.1, validationLoss: 1.12, learningRate: 0.08 },
      { step: 1, trainLoss: 0.98, validationLoss: 1.0, learningRate: 0.08 },
      { step: 2, trainLoss: 1.02, validationLoss: 1.03, learningRate: 0.08 },
      { step: 3, trainLoss: 0.91, validationLoss: 0.94, learningRate: 0.08 },
      { step: 4, trainLoss: 0.94, validationLoss: 0.96, learningRate: 0.08 },
      { step: 5, trainLoss: 0.86, validationLoss: 0.89, learningRate: 0.08 },
    ],
  },
  {
    id: 'schedule-plateau',
    optimizer: 'AdamW',
    batchSize: 64,
    learningRate: 0.003,
    note: 'same optimizer, constant learning rate after early progress',
    expectedIssue: 'schedule-needed',
    expectedExperiment: 'add-or-move-lr-decay',
    points: [
      { step: 0, trainLoss: 1.3, validationLoss: 1.28, learningRate: 0.003 },
      { step: 1, trainLoss: 0.82, validationLoss: 0.86, learningRate: 0.003 },
      { step: 2, trainLoss: 0.66, validationLoss: 0.71, learningRate: 0.003 },
      { step: 3, trainLoss: 0.64, validationLoss: 0.69, learningRate: 0.003 },
      { step: 4, trainLoss: 0.63, validationLoss: 0.68, learningRate: 0.003 },
      { step: 5, trainLoss: 0.625, validationLoss: 0.675, learningRate: 0.003 },
    ],
  },
]

function finiteLosses(points: OptimizerCurvePoint[], key: 'trainLoss' | 'validationLoss') {
  return points.map((point) => point[key]).filter(Number.isFinite)
}

function volatility(values: number[]) {
  if (values.length < 2) return 0
  return values.slice(1).reduce((sum, value, index) => sum + Math.abs(value - values[index]!), 0)
}

function normalizeIssue(value: string): OptimizerCurveIssue {
  return issues.includes(value as OptimizerCurveIssue) ? (value as OptimizerCurveIssue) : 'batch-noise-too-high'
}

function normalizeExperiment(value: string): OptimizerCurveExperiment {
  return experiments.includes(value as OptimizerCurveExperiment)
    ? (value as OptimizerCurveExperiment)
    : 'increase-batch-size'
}

export function evaluateOptimizerCurveDiagnosisChallenge(
  input: OptimizerCurveChallengeInput,
): OptimizerCurveDiagnosisSnapshot {
  const scenario =
    optimizerCurveDiagnosisScenarios.find((item) => item.id === input.scenarioId) ??
    optimizerCurveDiagnosisScenarios[0]!
  const trainLosses = finiteLosses(scenario.points, 'trainLoss')
  const validationLosses = finiteLosses(scenario.points, 'validationLoss')
  const issue = normalizeIssue(input.prediction.issue)
  const nextExperiment = normalizeExperiment(input.prediction.nextExperiment)
  const finalTrainLoss = trainLosses.at(-1) ?? Number.POSITIVE_INFINITY
  const finalValidationLoss = validationLosses.at(-1) ?? Number.POSITIVE_INFINITY
  const tail = trainLosses.slice(Math.max(0, trainLosses.length - 3))
  const plateauDelta = tail.length >= 2 ? Math.abs(tail.at(-1)! - tail[0]!) : 0
  const learningRates = new Set(scenario.points.map((point) => point.learningRate))

  const issueCorrect = issue === scenario.expectedIssue
  const experimentCorrect = nextExperiment === scenario.expectedExperiment

  return {
    scenario,
    evidence: {
      finalTrainLoss,
      finalValidationLoss,
      trainVolatility: volatility(trainLosses),
      validationVolatility: volatility(validationLosses),
      plateauDelta,
      hasNonFiniteLoss: scenario.points.some(
        (point) => !Number.isFinite(point.trainLoss) || !Number.isFinite(point.validationLoss),
      ),
      learningRateChanges: Math.max(0, learningRates.size - 1),
    },
    result: {
      issueCorrect,
      experimentCorrect,
      allCorrect: issueCorrect && experimentCorrect,
    },
  }
}
```

- [ ] **Step 2: Run helper tests**

Run:

```bash
node --test tests/optimizer-curve-diagnosis-challenge.test.ts
```

Expected: helper assertions pass, component/wiring source assertions still fail until later tasks.

- [ ] **Step 3: Commit**

```bash
git add src/simulations/optimizerCurveDiagnosisChallenge.ts tests/optimizer-curve-diagnosis-challenge.test.ts
git commit -m "feat: add optimizer curve diagnosis helper"
```

---

### Task 3: Challenge Component

**Files:**
- Create: `src/components/OptimizerCurveDiagnosisChallengeLab.vue`
- Modify: `src/styles/views/algorithm-shell.css`
- Test: `tests/optimizer-curve-diagnosis-challenge.test.ts`

**Interfaces:**
- Consumes: `evaluateOptimizerCurveDiagnosisChallenge(input)`
- Produces: `.optimizer-curve-challenge` UI with local state only.

- [ ] **Step 1: Build the component**

Implement a Vue component with:

- `scenarioId` local ref defaulting to `lr-divergence`;
- prediction local state defaulting to one intentionally imperfect answer;
- scenario buttons;
- radio or segmented controls for issue and next experiment;
- SVG polyline chart for train and validation loss;
- evidence cards;
- text feedback for issue correctness and experiment correctness.

The component must import:

```ts
import {
  evaluateOptimizerCurveDiagnosisChallenge,
  optimizerCurveDiagnosisScenarios,
  type OptimizerCurveExperiment,
  type OptimizerCurveIssue,
  type OptimizerCurveScenarioId,
} from '../simulations/optimizerCurveDiagnosisChallenge'
```

- [ ] **Step 2: Add responsive styles**

Add `.optimizer-curve-challenge` styles to `src/styles/views/algorithm-shell.css` with:

- stable chart min-height;
- wrapping controls;
- single-column mobile layout under the existing mobile media query;
- visible text labels for correct/incorrect states.

- [ ] **Step 3: Run source/component tests**

Run:

```bash
node --test tests/optimizer-curve-diagnosis-challenge.test.ts
```

Expected: component source assertions pass; workflow wiring assertions still fail until Task 4.

- [ ] **Step 4: Commit**

```bash
git add src/components/OptimizerCurveDiagnosisChallengeLab.vue src/styles/views/algorithm-shell.css tests/optimizer-curve-diagnosis-challenge.test.ts
git commit -m "feat: add optimizer curve diagnosis lab"
```

---

### Task 4: Workflow Wiring And Lesson Prompt

**Files:**
- Modify: `src/components/AppliedWorkflowLessonLab.vue`
- Modify: `src/data/optimizerComparisonModule.ts`
- Test: `tests/optimizer-curve-diagnosis-challenge.test.ts`
- Optional Test: `tests/deep-learning-extension-modules.test.mjs`

**Interfaces:**
- Consumes: `OptimizerCurveDiagnosisChallengeLab`
- Produces: challenge visible only when `moduleSlug === 'optimizer-comparison'` and `section.id === 'curve-diagnosis'`.

- [ ] **Step 1: Wire the component**

Add the import:

```ts
import OptimizerCurveDiagnosisChallengeLab from './OptimizerCurveDiagnosisChallengeLab.vue'
```

Render it inside the optimizer branch before the existing stage list:

```vue
<OptimizerCurveDiagnosisChallengeLab
  v-if="props.moduleSlug === 'optimizer-comparison' && props.section.id === 'curve-diagnosis'"
  :accent="props.accent"
/>
```

- [ ] **Step 2: Update the lesson prompt**

In `src/data/optimizerComparisonModule.ts`, update the `curve-diagnosis` chapter `experimentPrompt` to:

```ts
loc(
  '先在挑战里判断曲线现象、可能原因和下一步单变量实验，再用右侧 diagnose 阶段复盘。',
  'First use the challenge to diagnose the curve pattern, likely cause, and next one-variable experiment, then review with the diagnose stage.',
)
```

- [ ] **Step 3: Run wiring tests**

Run:

```bash
node --test tests/optimizer-curve-diagnosis-challenge.test.ts tests/deep-learning-extension-modules.test.mjs
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/AppliedWorkflowLessonLab.vue src/data/optimizerComparisonModule.ts tests/optimizer-curve-diagnosis-challenge.test.ts tests/deep-learning-extension-modules.test.mjs
git commit -m "feat: wire optimizer curve diagnosis challenge"
```

---

### Task 5: Phase Summary, Verification, And Browser Check

**Files:**
- Create: `docs/refactor/summaries/phase-20.md`
- Modify: `.planning/STATE.md`
- Test: `tests/curriculumMilestoneAudit.test.ts`

**Interfaces:**
- Produces: phase documentation and milestone audit coverage.

- [ ] **Step 1: Add Phase 20 summary**

Create `docs/refactor/summaries/phase-20.md` with:

```md
# Phase 20 Summary: Optimizer Curve Diagnosis Challenge

**Date:** 2026-07-08
**Status:** Completed.

## Delivered

- Added `src/simulations/optimizerCurveDiagnosisChallenge.ts`.
- Added `src/components/OptimizerCurveDiagnosisChallengeLab.vue`.
- Wired the challenge into `optimizer-comparison` `curve-diagnosis`.
- Updated the lesson prompt and tests.

## Self-Review

No backend, database, progress persistence, route rewrite, new course inventory, project-readiness checklist, or broad renderer migration was added.

## Verification

- `node --test tests/optimizer-curve-diagnosis-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`
- `npm test`
- `npm run build`
- `npm run build:pages`
- Playwright desktop and 390px mobile checks on `/learn/optimizer-comparison/curve-diagnosis`
```

- [ ] **Step 2: Update milestone audit test**

Add assertions for `docs/refactor/summaries/phase-20.md`, `OptimizerCurveDiagnosisChallengeLab`, and `optimizer curve diagnosis challenge`.

- [ ] **Step 3: Run full verification**

Run:

```bash
node --test tests/optimizer-curve-diagnosis-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts
npm test
npm run build
npm run build:pages
```

Expected: all tests and builds pass, with only the existing Vite large-chunk warning.

- [ ] **Step 4: Browser check**

Run a local dev server and verify `/learn/optimizer-comparison/curve-diagnosis`:

- challenge renders;
- existing optimizer stage explanation remains present;
- predictions can become all-correct;
- desktop has no horizontal overflow;
- 390px mobile has no horizontal overflow;
- console errors are 0.

- [ ] **Step 5: Commit**

```bash
git add docs/refactor/summaries/phase-20.md .planning/STATE.md tests/curriculumMilestoneAudit.test.ts
git commit -m "docs: summarize phase 20 optimizer challenge"
```

---

## Self-Review

- **Spec coverage:** Tasks cover helper, component, workflow wiring, lesson copy, tests, summary/state, builds, and browser verification.
- **Placeholder scan:** No implementation step depends on an unspecified component, helper, route, or backend service.
- **Type consistency:** Scenario, issue, experiment, prediction, point, and snapshot names match across tests, helper, component, and wiring.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-08-optimizer-curve-diagnosis-challenge.md`.

Two execution options:

1. **Subagent-Driven (recommended)** - Dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Because this plan is intentionally drafted before Phase 19 implementation PR #29 is merged, execute runtime work only after Phase 19 lands on `main`.
