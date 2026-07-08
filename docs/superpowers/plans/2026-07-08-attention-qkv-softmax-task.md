# Attention Q/K/V Softmax Task Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a narrow prediction/evidence lab to the required `attention-transformer` `softmax-weighted-sum` chapter so learners predict the top attended key, mask effect, row-wise softmax weights, and weighted-value output.

**Architecture:** Follow the Phase 20 pattern: deterministic helper in `src/simulations/`, local Vue component in `src/components/`, one conditional in `AppliedWorkflowLessonLab.vue`, and focused Node tests. The helper owns all score, mask, softmax, and weighted-value math; Vue owns localized state, controls, display, and feedback gating.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript, Vite, Node test runner, existing `algorithm-shell.css` workflow-lab styles.

## Global Constraints

- Do not add backend, database, account, durable progress behavior, or project readiness checklist work.
- Do not add a new Attention or Transformer module, route, or full Transformer simulator.
- Do not migrate `attention-transformer` into `LessonPage`.
- Do not rewrite `AppliedWorkflowLessonLab.vue` beyond one section-level conditional and one import.
- Do not migrate Math Lab AI bridge content into required core.
- Do not introduce multi-head visualization in this implementation slice.
- Keep bilingual local copy for all component-facing text.
- Keep core math outside Vue and covered by tests.
- Keep existing Attention stage-switch explanation visible after the challenge.
- Preserve existing routes, checkpoint submission behavior, and v1/V2 progress stores.

---

## File Structure

- Create `src/simulations/attentionQkvChallenge.ts`
  - Owns scenario data, Q/K scaled dot-product scores, causal/padding masks, row-wise softmax, weighted-value output, input normalization, and prediction scoring.
- Create `src/components/AttentionQkvChallengeLab.vue`
  - Owns localized scenario copy, selected scenario state, learner prediction controls, evidence gate, tables, weighted-value display, and feedback.
- Modify `src/components/AppliedWorkflowLessonLab.vue`
  - Import `AttentionQkvChallengeLab` and render it only for `attention-transformer` section `softmax-weighted-sum`.
- Modify `src/styles/views/algorithm-shell.css`
  - Add `attention-qkv-challenge` styles near existing optimizer challenge styles, with stable table/control layout and mobile fallback.
- Modify `src/data/attentionTransformerModule.ts`
  - Point the `softmax-weighted-sum` experiment prompt at the new prediction/evidence task.
- Create `tests/attention-qkv-challenge.test.ts`
  - Cover helper math, invalid input normalization, component source tokens, workflow wiring, and prompt source token.
- Modify `tests/deep-learning-extension-modules.test.mjs`
  - Add lab tokens for `AttentionQkvChallengeLab` and the `softmax-weighted-sum` conditional.
- Create `docs/refactor/summaries/phase-21.md`
  - Summarize the implementation and verification evidence after runtime work is complete.
- Modify `.planning/STATE.md`
  - Record Phase 21 implementation completion and next direction after verification.

---

### Task 1: Helper Tests

**Files:**
- Create: `tests/attention-qkv-challenge.test.ts`

**Interfaces:**
- Consumes: planned `evaluateAttentionQkvChallenge(input)` and `attentionQkvScenarios` from `src/simulations/attentionQkvChallenge.ts`.
- Produces: failing coverage for all helper requirements before implementation.

- [ ] **Step 1: Create the failing helper and source-token tests**

Create `tests/attention-qkv-challenge.test.ts` with this content:

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import {
  attentionQkvScenarios,
  evaluateAttentionQkvChallenge,
} from '../src/simulations/attentionQkvChallenge.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

function closeTo(actual: number, expected: number, tolerance = 1e-6) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be close to ${expected}`)
}

test('attention qkv challenge covers required deterministic scenarios', () => {
  assert.deepEqual(attentionQkvScenarios.map((scenario) => scenario.id), [
    'matching-key',
    'causal-mask',
    'padding-mask',
    'value-mixture',
  ])

  const matching = evaluateAttentionQkvChallenge({
    scenarioId: 'matching-key',
    prediction: { topKeyId: 'alpha', maskChangesTopKey: false },
  })
  assert.equal(matching.evidence.rawTopKeyId, 'alpha')
  assert.equal(matching.evidence.topKeyId, 'alpha')
  assert.equal(matching.result.allCorrect, true)
  closeTo(matching.evidence.rowWeightSum, 1)

  const causal = evaluateAttentionQkvChallenge({
    scenarioId: 'causal-mask',
    prediction: { topKeyId: 'current', maskChangesTopKey: true },
  })
  assert.equal(causal.evidence.rawTopKeyId, 'future')
  assert.equal(causal.evidence.topKeyId, 'current')
  assert.equal(causal.result.allCorrect, true)
  assert.equal(causal.evidence.maskedScores.find((score) => score.keyId === 'future')?.score, null)
  assert.equal(causal.evidence.weights.find((weight) => weight.keyId === 'future')?.weight, 0)
  closeTo(causal.evidence.rowWeightSum, 1)

  const padding = evaluateAttentionQkvChallenge({
    scenarioId: 'padding-mask',
    prediction: { topKeyId: 'real-a', maskChangesTopKey: true },
  })
  assert.equal(padding.evidence.rawTopKeyId, 'pad')
  assert.equal(padding.evidence.topKeyId, 'real-a')
  assert.equal(padding.result.allCorrect, true)
  assert.equal(padding.evidence.maskedScores.find((score) => score.keyId === 'pad')?.score, null)
  assert.equal(padding.evidence.weights.find((weight) => weight.keyId === 'pad')?.weight, 0)

  const mixture = evaluateAttentionQkvChallenge({
    scenarioId: 'value-mixture',
    prediction: { topKeyId: 'right-value', maskChangesTopKey: false },
  })
  const leftWeight = mixture.evidence.weights.find((weight) => weight.keyId === 'left-value')?.weight ?? 0
  const rightWeight = mixture.evidence.weights.find((weight) => weight.keyId === 'right-value')?.weight ?? 0
  assert.ok(leftWeight > 0.25)
  assert.ok(rightWeight > 0.25)
  assert.ok(mixture.evidence.weightedValue[0]! > 0.25)
  assert.ok(mixture.evidence.weightedValue[1]! > 0.25)
  assert.equal(mixture.result.allCorrect, true)
})

test('attention qkv challenge normalizes invalid inputs without throwing', () => {
  const snapshot = evaluateAttentionQkvChallenge({
    scenarioId: 'unknown-scenario',
    prediction: {
      topKeyId: 'not-a-token',
      maskChangesTopKey: 'not-a-boolean' as unknown as boolean,
    },
  })

  assert.equal(snapshot.scenario.id, 'matching-key')
  assert.equal(snapshot.result.topKeyCorrect, false)
  assert.equal(snapshot.result.maskEffectCorrect, true)
  assert.equal(snapshot.result.allCorrect, false)
  closeTo(snapshot.evidence.rowWeightSum, 1)
})

test('attention qkv challenge component gates evidence behind a check action', () => {
  const componentSource = read('src/components/AttentionQkvChallengeLab.vue')
  assert.match(componentSource, /attention-qkv-challenge/)
  assert.match(componentSource, /evaluateAttentionQkvChallenge/)
  assert.match(componentSource, /matching-key/)
  assert.match(componentSource, /causal-mask/)
  assert.match(componentSource, /padding-mask/)
  assert.match(componentSource, /value-mixture/)
  assert.match(componentSource, /hasChecked/)
  assert.match(componentSource, /revealEvidence/)
  assert.match(componentSource, /v-if="hasChecked"/)
  assert.match(componentSource, /maskChangesTopKey/)
  assert.match(componentSource, /weightedValue/)

  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  assert.match(workflowSource, /AttentionQkvChallengeLab/)
  assert.match(workflowSource, /moduleSlug === 'attention-transformer'/)
  assert.match(workflowSource, /section\.id === 'softmax-weighted-sum'/)

  const moduleSource = read('src/data/attentionTransformerModule.ts')
  assert.match(moduleSource, /预测.*key/)
  assert.match(moduleSource, /weighted value|value 加权|加权 value/)
})
```

- [ ] **Step 2: Run test to verify it fails for missing implementation**

Run:

```bash
node --test tests/attention-qkv-challenge.test.ts
```

Expected: fail because `src/simulations/attentionQkvChallenge.ts` and `src/components/AttentionQkvChallengeLab.vue` do not exist.

- [ ] **Step 3: Commit only if this task is reviewed separately**

If committing this task independently:

```bash
git add tests/attention-qkv-challenge.test.ts
git commit -m "test: add attention qkv challenge coverage"
```

Expected: commit succeeds with only the test file staged.

---

### Task 2: Deterministic Attention Helper

**Files:**
- Create: `src/simulations/attentionQkvChallenge.ts`
- Test: `tests/attention-qkv-challenge.test.ts`

**Interfaces:**
- Consumes: no app runtime dependencies.
- Produces:
  - `attentionQkvScenarios: AttentionQkvScenario[]`
  - `evaluateAttentionQkvChallenge(input: AttentionQkvChallengeInput): AttentionQkvChallengeSnapshot`

- [ ] **Step 1: Implement the helper**

Create `src/simulations/attentionQkvChallenge.ts` with this content:

```ts
export type AttentionQkvScenarioId =
  | 'matching-key'
  | 'causal-mask'
  | 'padding-mask'
  | 'value-mixture'

export type AttentionMaskKind = 'none' | 'causal' | 'padding'

export interface AttentionQkvPrediction {
  topKeyId: string
  maskChangesTopKey: boolean
}

export interface AttentionQkvToken {
  id: string
  label: string
  query: number[]
  key: number[]
  value: number[]
  masked?: boolean
}

export interface AttentionQkvScenario {
  id: AttentionQkvScenarioId
  queryTokenId: string
  maskKind: AttentionMaskKind
  tokens: AttentionQkvToken[]
  expectedTopKeyId: string
  expectedMaskChangesTopKey: boolean
}

export interface AttentionQkvChallengeSnapshot {
  scenario: AttentionQkvScenario
  evidence: {
    rawScores: Array<{ keyId: string; score: number }>
    maskedScores: Array<{ keyId: string; score: number | null; masked: boolean }>
    weights: Array<{ keyId: string; weight: number; masked: boolean }>
    topKeyId: string
    rawTopKeyId: string
    rowWeightSum: number
    weightedValue: number[]
    valueContributions: Array<{ keyId: string; contribution: number[] }>
  }
  result: {
    topKeyCorrect: boolean
    maskEffectCorrect: boolean
    allCorrect: boolean
  }
}

export interface AttentionQkvChallengeInput {
  scenarioId: string
  prediction: AttentionQkvPrediction
}

export const attentionQkvScenarios: AttentionQkvScenario[] = [
  {
    id: 'matching-key',
    queryTokenId: 'alpha',
    maskKind: 'none',
    expectedTopKeyId: 'alpha',
    expectedMaskChangesTopKey: false,
    tokens: [
      { id: 'alpha', label: 'alpha', query: [1, 0], key: [1, 0], value: [1, 0] },
      { id: 'beta', label: 'beta', query: [0, 1], key: [0, 1], value: [0, 1] },
      { id: 'blend', label: 'blend', query: [0.4, 0.4], key: [0.3, 0.3], value: [0.5, 0.5] },
    ],
  },
  {
    id: 'causal-mask',
    queryTokenId: 'current',
    maskKind: 'causal',
    expectedTopKeyId: 'current',
    expectedMaskChangesTopKey: true,
    tokens: [
      { id: 'prompt', label: 'prompt', query: [0.1, 0.7], key: [0.6, 0.4], value: [0.9, 0.1] },
      { id: 'current', label: 'current', query: [1, 0], key: [0.8, 0.1], value: [0.2, 0.8] },
      { id: 'future', label: 'future', query: [0.2, 0.8], key: [2, 0], value: [0, 1] },
    ],
  },
  {
    id: 'padding-mask',
    queryTokenId: 'real-a',
    maskKind: 'padding',
    expectedTopKeyId: 'real-a',
    expectedMaskChangesTopKey: true,
    tokens: [
      { id: 'real-a', label: 'real A', query: [0.8, 0.2], key: [0.8, 0.2], value: [0.7, 0.3] },
      { id: 'real-b', label: 'real B', query: [0.2, 0.8], key: [0.3, 0.9], value: [0.2, 0.8] },
      { id: 'pad', label: '[PAD]', query: [0, 0], key: [1.6, 0.4], value: [1, 1], masked: true },
    ],
  },
  {
    id: 'value-mixture',
    queryTokenId: 'query',
    maskKind: 'none',
    expectedTopKeyId: 'right-value',
    expectedMaskChangesTopKey: false,
    tokens: [
      { id: 'query', label: 'query', query: [1, 1], key: [0.2, 0.2], value: [0.5, 0.5] },
      { id: 'left-value', label: 'left value', query: [0.3, 0.5], key: [1, 0.8], value: [1, 0] },
      { id: 'right-value', label: 'right value', query: [0.5, 0.3], key: [0.9, 1], value: [0, 1] },
    ],
  },
]

function dot(left: number[], right: number[]) {
  return left.reduce((sum, value, index) => sum + value * (right[index] ?? 0), 0)
}

function round(value: number) {
  return Number(value.toFixed(6))
}

function softmax(scores: number[]) {
  if (scores.length === 0) return []
  const maxScore = Math.max(...scores)
  const exps = scores.map((score) => Math.exp(score - maxScore))
  const total = exps.reduce((sum, value) => sum + value, 0)
  return exps.map((value) => value / total)
}

function scenarioById(id: string) {
  return attentionQkvScenarios.find((scenario) => scenario.id === id) ?? attentionQkvScenarios[0]!
}

function isMasked(scenario: AttentionQkvScenario, keyIndex: number) {
  if (scenario.maskKind === 'none') return false
  if (scenario.maskKind === 'padding') return Boolean(scenario.tokens[keyIndex]?.masked)

  const queryIndex = scenario.tokens.findIndex((token) => token.id === scenario.queryTokenId)
  return keyIndex > queryIndex
}

function topKeyFromScores(scores: Array<{ keyId: string; score: number }>) {
  return scores.reduce((best, item) => (item.score > best.score ? item : best), scores[0]!).keyId
}

function normalizedPrediction(prediction: AttentionQkvPrediction, scenario: AttentionQkvScenario) {
  const tokenIds = new Set(scenario.tokens.map((token) => token.id))
  return {
    topKeyId: tokenIds.has(prediction.topKeyId) ? prediction.topKeyId : '',
    maskChangesTopKey: prediction.maskChangesTopKey === true,
  }
}

export function evaluateAttentionQkvChallenge(input: AttentionQkvChallengeInput): AttentionQkvChallengeSnapshot {
  const scenario = scenarioById(input.scenarioId)
  const queryToken = scenario.tokens.find((token) => token.id === scenario.queryTokenId) ?? scenario.tokens[0]!
  const scale = Math.sqrt(Math.max(1, queryToken.query.length))
  const rawScores = scenario.tokens.map((token) => ({
    keyId: token.id,
    score: round(dot(queryToken.query, token.key) / scale),
  }))
  const rawTopKeyId = topKeyFromScores(rawScores)
  const maskedScores = rawScores.map((score, index) => {
    const masked = isMasked(scenario, index)
    return { keyId: score.keyId, score: masked ? null : score.score, masked }
  })
  const unmaskedScores = maskedScores.filter((score) => !score.masked).map((score) => score.score ?? 0)
  const unmaskedWeights = softmax(unmaskedScores)
  let unmaskedIndex = 0
  const weights = maskedScores.map((score) => {
    if (score.masked) return { keyId: score.keyId, weight: 0, masked: true }
    const weight = unmaskedWeights[unmaskedIndex++] ?? 0
    return { keyId: score.keyId, weight: round(weight), masked: false }
  })
  const topKeyId = topKeyFromScores(weights.map((weight) => ({ keyId: weight.keyId, score: weight.weight })))
  const valueLength = Math.max(...scenario.tokens.map((token) => token.value.length))
  const valueContributions = scenario.tokens.map((token) => {
    const weight = weights.find((item) => item.keyId === token.id)?.weight ?? 0
    return {
      keyId: token.id,
      contribution: Array.from({ length: valueLength }, (_, index) => round((token.value[index] ?? 0) * weight)),
    }
  })
  const weightedValue = Array.from({ length: valueLength }, (_, index) =>
    round(valueContributions.reduce((sum, item) => sum + (item.contribution[index] ?? 0), 0)),
  )
  const prediction = normalizedPrediction(input.prediction, scenario)
  const topKeyCorrect = prediction.topKeyId === scenario.expectedTopKeyId
  const maskEffectCorrect = prediction.maskChangesTopKey === scenario.expectedMaskChangesTopKey

  return {
    scenario,
    evidence: {
      rawScores,
      maskedScores,
      weights,
      topKeyId,
      rawTopKeyId,
      rowWeightSum: round(weights.reduce((sum, item) => sum + item.weight, 0)),
      weightedValue,
      valueContributions,
    },
    result: {
      topKeyCorrect,
      maskEffectCorrect,
      allCorrect: topKeyCorrect && maskEffectCorrect,
    },
  }
}
```

- [ ] **Step 2: Run helper tests**

Run:

```bash
node --test tests/attention-qkv-challenge.test.ts
```

Expected: helper tests pass and source-token test still fails because the Vue component and workflow import do not exist.

- [ ] **Step 3: Commit helper if this task is reviewed separately**

```bash
git add src/simulations/attentionQkvChallenge.ts tests/attention-qkv-challenge.test.ts
git commit -m "feat: add attention qkv challenge helper"
```

Expected: commit succeeds with helper and tests staged.

---

### Task 3: Challenge Component

**Files:**
- Create: `src/components/AttentionQkvChallengeLab.vue`
- Modify: `src/styles/views/algorithm-shell.css`
- Test: `tests/attention-qkv-challenge.test.ts`

**Interfaces:**
- Consumes:
  - `attentionQkvScenarios`
  - `evaluateAttentionQkvChallenge(input)`
  - `AttentionQkvPrediction`
  - `AttentionQkvScenarioId`
- Produces: `AttentionQkvChallengeLab.vue`, used by `AppliedWorkflowLessonLab.vue`.

- [ ] **Step 1: Create component with localized state and evidence gate**

Create `src/components/AttentionQkvChallengeLab.vue` with these implementation requirements:

```ts
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import type { AppLocale, LocalizedCopy } from '../types/ml'
import {
  attentionQkvScenarios,
  evaluateAttentionQkvChallenge,
  type AttentionQkvPrediction,
  type AttentionQkvScenarioId,
} from '../simulations/attentionQkvChallenge'
```

The component state must use these exact names so tests and future maintainers can find the teaching loop:

```ts
const selectedScenarioId = ref<AttentionQkvScenarioId>('matching-key')
const prediction = ref<AttentionQkvPrediction>({
  topKeyId: 'beta',
  maskChangesTopKey: true,
})
const hasChecked = ref(false)
```

The component must define scenario copy for all four IDs:

```ts
const scenarioCopy = [
  { id: 'matching-key', title: loc('Q/K 对齐', 'Q/K alignment') },
  { id: 'causal-mask', title: loc('causal mask', 'Causal mask') },
  { id: 'padding-mask', title: loc('padding mask', 'Padding mask') },
  { id: 'value-mixture', title: loc('V 加权混合', 'Weighted V mixture') },
]
```

The component must use `hasChecked` and `revealEvidence()` exactly:

```ts
function revealEvidence() {
  hasChecked.value = true
}
```

The template root class must be:

```vue
<section class="attention-qkv-challenge">
```

The template must include:

- scenario buttons for all four scenarios;
- a token table with `Q`, `K`, and `V` values for each token;
- radio controls named `attention-qkv-top-key` for `prediction.topKeyId`;
- radio controls named `attention-qkv-mask-effect` for `prediction.maskChangesTopKey`;
- a pre-evidence gate section with `v-if="!hasChecked"`;
- an evidence section with `v-if="hasChecked"` that renders raw score, masked score, and weight;
- a weighted-value section that renders `snapshot.evidence.weightedValue`;
- a feedback section with `v-if="hasChecked"` and `.is-correct` when `snapshot.result.allCorrect`.

- [ ] **Step 2: Add responsive styles**

Append styles near the optimizer challenge styles in `src/styles/views/algorithm-shell.css`:

```css
.attention-qkv-challenge {
  display: grid;
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(124, 58, 237, 0.18);
  border-radius: 1rem;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.94), rgba(245, 243, 255, 0.9));
}

.attention-qkv-challenge__header,
.attention-qkv-challenge__gate,
.attention-qkv-challenge__feedback > div {
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  align-items: flex-start;
}

.attention-qkv-challenge__scenarios,
.attention-qkv-challenge__workspace,
.attention-qkv-challenge__evidence,
.attention-qkv-challenge__feedback dl {
  display: grid;
  gap: 0.75rem;
}

.attention-qkv-challenge__scenarios {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.attention-qkv-challenge__workspace {
  grid-template-columns: minmax(0, 1fr) minmax(18rem, 0.8fr);
}

.attention-qkv-challenge__matrix,
.attention-qkv-challenge__prediction,
.attention-qkv-challenge__gate,
.attention-qkv-challenge__evidence article,
.attention-qkv-challenge__feedback {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 0.85rem;
  background: rgba(255, 255, 255, 0.88);
  padding: 0.85rem;
}

.attention-qkv-challenge table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.82rem;
}

.attention-qkv-challenge th,
.attention-qkv-challenge td {
  padding: 0.45rem;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  text-align: left;
  vertical-align: top;
}

.attention-qkv-challenge__prediction fieldset {
  display: grid;
  gap: 0.45rem;
  border: 0;
  padding: 0;
  margin: 0 0 0.85rem;
}

.attention-qkv-challenge__prediction label {
  display: flex;
  gap: 0.5rem;
  align-items: flex-start;
}

.attention-qkv-challenge__evidence {
  grid-template-columns: minmax(0, 1.2fr) minmax(14rem, 0.8fr);
}

.attention-qkv-challenge__feedback.is-correct {
  border-color: rgba(22, 163, 74, 0.35);
  background: rgba(240, 253, 244, 0.9);
}
```

Inside the existing mobile media block, add:

```css
.attention-qkv-challenge__header,
.attention-qkv-challenge__gate,
.attention-qkv-challenge__feedback > div {
  display: grid;
}

.attention-qkv-challenge__scenarios,
.attention-qkv-challenge__workspace,
.attention-qkv-challenge__evidence {
  grid-template-columns: 1fr;
}

.attention-qkv-challenge table {
  font-size: 0.78rem;
}
```

- [ ] **Step 3: Run component source test**

Run:

```bash
node --test tests/attention-qkv-challenge.test.ts
```

Expected: source-token assertions for the component pass and workflow/module prompt assertions still fail until Task 4.

- [ ] **Step 4: Commit component if this task is reviewed separately**

```bash
git add src/components/AttentionQkvChallengeLab.vue src/styles/views/algorithm-shell.css tests/attention-qkv-challenge.test.ts
git commit -m "feat: add attention qkv challenge component"
```

Expected: commit succeeds with component, styles, and tests staged.

---

### Task 4: Workflow Wiring And Lesson Prompt

**Files:**
- Modify: `src/components/AppliedWorkflowLessonLab.vue`
- Modify: `src/data/attentionTransformerModule.ts`
- Modify: `tests/deep-learning-extension-modules.test.mjs`
- Test: `tests/attention-qkv-challenge.test.ts`

**Interfaces:**
- Consumes: `AttentionQkvChallengeLab.vue`.
- Produces: runtime rendering for `/learn/attention-transformer/softmax-weighted-sum`.

- [ ] **Step 1: Wire component into the Attention branch**

In `src/components/AppliedWorkflowLessonLab.vue`, add this import next to the optimizer and sequence imports:

```ts
import AttentionQkvChallengeLab from './AttentionQkvChallengeLab.vue'
```

Inside the `activeWorkflow === 'attention'` section, render the component before the stage list:

```vue
<AttentionQkvChallengeLab
  v-if="props.moduleSlug === 'attention-transformer' && props.section.id === 'softmax-weighted-sum'"
/>
```

Do not remove the existing `attentionStages`, `selectedAttentionStage`, or `workflow-lab__focus--attention` block.

- [ ] **Step 2: Update the `softmax-weighted-sum` learner prompt**

In `src/data/attentionTransformerModule.ts`, replace the chapter's `experimentPrompt` copy for `softmax-weighted-sum` with:

```ts
loc(
  '在右侧 softmax 挑战中，先预测当前 query 最会看向哪个 key、mask 是否会改变答案，再查看 Q/K score、softmax 权重和 value 加权结果。',
  'Use the softmax challenge to predict the top key for the current query and whether the mask changes the answer, then inspect Q/K scores, softmax weights, and weighted value output.',
),
```

- [ ] **Step 3: Lock the new wiring in module source tests**

In `tests/deep-learning-extension-modules.test.mjs`, add these tokens to the `attention-transformer` `labTokens` array:

```js
'import AttentionQkvChallengeLab',
'<AttentionQkvChallengeLab',
"section.id === 'softmax-weighted-sum'",
```

- [ ] **Step 4: Run targeted tests**

Run:

```bash
node --test tests/attention-qkv-challenge.test.ts tests/deep-learning-extension-modules.test.mjs
```

Expected: pass with the new helper, component, workflow wiring, and module prompt.

- [ ] **Step 5: Commit wiring if this task is reviewed separately**

```bash
git add src/components/AppliedWorkflowLessonLab.vue src/data/attentionTransformerModule.ts tests/deep-learning-extension-modules.test.mjs tests/attention-qkv-challenge.test.ts
git commit -m "feat: wire attention qkv challenge"
```

Expected: commit succeeds with only wiring, prompt, and tests staged.

---

### Task 5: Phase Summary And State Update

**Files:**
- Create: `docs/refactor/summaries/phase-21.md`
- Modify: `.planning/STATE.md`
- Modify: `tests/curriculumMilestoneAudit.test.ts`

**Interfaces:**
- Consumes: runtime implementation evidence from Tasks 1-4.
- Produces: project state and milestone audit coverage for Phase 21 implementation completion.

- [ ] **Step 1: Add Phase 21 summary**

Create `docs/refactor/summaries/phase-21.md` with this structure. Keep the listed verification commands exactly as written, and update only pass counts or browser-check details after Task 6 produces evidence:

```md
# Phase 21 Summary: Attention Q/K/V Softmax Task

**Date:** 2026-07-08

## What Changed

- Added `src/simulations/attentionQkvChallenge.ts` for deterministic Q/K scaled dot-product scores, causal/padding masks, row-wise softmax, and weighted-value output.
- Added `src/components/AttentionQkvChallengeLab.vue` with bilingual prediction controls, an evidence gate, score/weight tables, weighted-value evidence, and feedback.
- Wired the challenge into `src/components/AppliedWorkflowLessonLab.vue` only for `attention-transformer` `softmax-weighted-sum`.
- Updated `src/data/attentionTransformerModule.ts` so the learner prompt points at the prediction/evidence task.
- Added `tests/attention-qkv-challenge.test.ts` and extended deep-learning source-token coverage.

## Self-Review

- Overdesign check: one helper, one component, one workflow conditional, no backend/progress/checklist work, no new module, no full Transformer simulator, no multi-head expansion, and no LessonPage migration.
- Quality check: the learner predicts top key and mask effect before seeing Q/K scores, row-wise softmax weights, and weighted V output.
- Coverage check: scenarios cover clean Q/K alignment, causal masking, padding masking, and weighted V mixture.
- Risk check: existing Attention stage explanation remains visible; routes and checkpoints are unchanged.

## Verification

- `node --test tests/attention-qkv-challenge.test.ts`: pass.
- `node --test tests/attention-qkv-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass.
- `npm test`: pass.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- Browser check for `/learn/attention-transformer/softmax-weighted-sum`: pass with no horizontal overflow and no console errors.
```

- [ ] **Step 2: Update `.planning/STATE.md`**

Add a current decision bullet:

```md
- Phase 21 Attention Q/K/V softmax task implementation completed the required Attention prediction/evidence task without adding backend/progress persistence, changing routes, creating a new Attention module, replacing the existing Attention stage explanation, or migrating the lesson to `LessonPage`.
```

Add a completed work section after the Phase 21 design section:

```md
### Phase 21 - Attention Q/K/V Softmax Task Implementation

- Added `src/simulations/attentionQkvChallenge.ts`.
- Added `src/components/AttentionQkvChallengeLab.vue`.
- Wired the challenge directly into `src/components/AppliedWorkflowLessonLab.vue` for `attention-transformer` `softmax-weighted-sum`.
- Updated `src/data/attentionTransformerModule.ts` to point the learner prompt at the prediction task.
- Added `tests/attention-qkv-challenge.test.ts`.
- Added `docs/refactor/summaries/phase-21.md`.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new Attention module, route rewrite, broad Transformer simulator, multi-head expansion, semantic NLP task, Math Lab migration, `LessonPage` migration, or existing Attention stage replacement.
- Verified:
  - `node --test tests/attention-qkv-challenge.test.ts`: pass.
  - `node --test tests/attention-qkv-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass.
  - `npm test`: pass.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Browser desktop and 390px mobile checks on `/learn/attention-transformer/softmax-weighted-sum`: no horizontal overflow, console errors 0, challenge and existing Attention stage explanation both render.
```

- [ ] **Step 3: Update milestone audit**

In `tests/curriculumMilestoneAudit.test.ts`, add:

```ts
assert.ok(existsSync(new URL('docs/refactor/summaries/phase-21.md', root)))
assert.match(stateSource, /Phase 21 Attention Q\/K\/V softmax task implementation completed/)
assert.match(stateSource, /AttentionQkvChallengeLab/)
```

- [ ] **Step 4: Run audit test**

Run:

```bash
node --test tests/curriculumMilestoneAudit.test.ts
```

Expected: pass after the summary and state update.

- [ ] **Step 5: Commit docs/state if this task is reviewed separately**

```bash
git add docs/refactor/summaries/phase-21.md .planning/STATE.md tests/curriculumMilestoneAudit.test.ts
git commit -m "docs: summarize phase 21 attention challenge"
```

Expected: commit succeeds with summary, state, and audit changes staged.

---

### Task 6: Verification, Browser Check, And Final Self-Review

**Files:**
- No planned source changes unless verification reveals defects.

**Interfaces:**
- Consumes: all implemented Phase 21 artifacts.
- Produces: final evidence for PR description and merge readiness.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
node --test tests/attention-qkv-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts
```

Expected: pass.

- [ ] **Step 2: Run full test suite**

Run:

```bash
npm test
```

Expected: pass with all current tests.

- [ ] **Step 3: Run production build**

Run:

```bash
npm run build
```

Expected: pass; existing Vite large-chunk warning is acceptable.

- [ ] **Step 4: Run GitHub Pages build**

Run:

```bash
npm run build:pages
```

Expected: pass; existing Vite large-chunk warning is acceptable.

- [ ] **Step 5: Browser-check the target lesson**

Start the dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Open `/learn/attention-transformer/softmax-weighted-sum` and verify:

- `.attention-qkv-challenge` renders.
- `.workflow-lab__pipeline--attention` still renders.
- Clicking "check evidence" reveals `.attention-qkv-challenge__evidence`.
- Desktop width has no horizontal overflow.
- 390px mobile width has no horizontal overflow.
- Console errors count is 0.

- [ ] **Step 6: Run self-review checklist**

Inspect the final diff and confirm:

- No backend, database, account, progress persistence, project readiness, route rewrite, new module, full Transformer simulator, multi-head expansion, Math Lab migration, or `LessonPage` migration was added.
- The helper owns all math and is tested outside Vue.
- Component copy is bilingual and uses text labels for correctness.
- Existing Attention stage explanation remains visible.
- `docs/gpt_advice.md` remains untracked and untouched.

Run:

```bash
git diff --check
git status --short --branch
```

Expected: `git diff --check` exits 0; `git status` shows only intended Phase 21 files plus the pre-existing untracked `docs/gpt_advice.md`.

- [ ] **Step 7: Commit final implementation if not already committed by task**

```bash
git add src/simulations/attentionQkvChallenge.ts src/components/AttentionQkvChallengeLab.vue src/components/AppliedWorkflowLessonLab.vue src/styles/views/algorithm-shell.css src/data/attentionTransformerModule.ts tests/attention-qkv-challenge.test.ts tests/deep-learning-extension-modules.test.mjs docs/refactor/summaries/phase-21.md .planning/STATE.md tests/curriculumMilestoneAudit.test.ts
git commit -m "feat: add attention qkv softmax challenge"
```

Expected: commit succeeds with the complete Phase 21 implementation.

---

## Self-Review

- **Spec coverage:** Tasks cover the helper, four scenarios, invalid prediction normalization, gated evidence component, workflow conditional, lesson prompt, tests, summary, state update, and browser/build verification.
- **Red-flag scan:** This plan contains no banned marker text and every test, command, interface name, file path, and copy replacement is concrete.
- **Type consistency:** `AttentionQkvScenarioId`, `AttentionMaskKind`, `AttentionQkvPrediction`, `AttentionQkvScenario`, `AttentionQkvChallengeSnapshot`, `attentionQkvScenarios`, and `evaluateAttentionQkvChallenge` are used consistently across tasks.
- **Overdesign check:** The plan stays inside one helper, one component, one workflow conditional, and focused docs/tests. It rejects backend/progress/checklist work, broad route migration, full Transformer simulation, multi-head expansion, and a new module.
- **Quality check:** The learner must make a prediction before evidence appears, and the evidence connects Q/K scores, masks, row-wise softmax, and weighted V output.

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-07-08-attention-qkv-softmax-task.md`. Two execution options:

1. **Subagent-Driven (recommended)** - dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Inline Execution** - execute tasks in this session using executing-plans, batch execution with checkpoints.
