# Transformer Block Assembly Challenge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add one prediction/evidence challenge for Transformer block assembly inside `attention-transformer -> transformer-block`.

**Architecture:** Keep the phase narrow: deterministic scoring and evidence live in `src/simulations/transformerBlockAssemblyChallenge.ts`; Vue only manages localized copy, selection state, prediction controls, evidence reveal, and feedback. The component is wired into `AppliedWorkflowLessonLab.vue` only for the existing `transformer-block` section, before the existing `attentionStages` explanation.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript pure helper, Node test runner, existing `algorithm-shell.css` module styles.

## Global Constraints

- No backend, database, durable progress, route, checkpoint, or curriculum role changes.
- Keep `llm-rag` as `advanced-extension`.
- Do not build full generation, RAG, semantic NLP, full Transformer simulation, or multi-head simulation.
- Keep existing `attentionStages` visible.
- Follow TDD: write failing tests before production code.
- Run targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks before shipping.

---

## File Structure

- Create `src/simulations/transformerBlockAssemblyChallenge.ts` for deterministic scenarios, normalization, scoring, and evidence.
- Create `src/components/TransformerBlockAssemblyChallengeLab.vue` for bilingual interaction and evidence reveal.
- Modify `src/components/AppliedWorkflowLessonLab.vue` to import and conditionally render the challenge.
- Modify `src/styles/views/algorithm-shell.css` with scoped `.transformer-block-challenge*` styles near the existing Attention challenge styles.
- Modify `src/data/attentionTransformerModule.ts` to point the `transformer-block` experiment prompt at the challenge.
- Create `tests/transformer-block-assembly-challenge.test.ts`.
- Modify `tests/deep-learning-extension-modules.test.mjs` for wiring/source-token coverage.
- Modify `docs/refactor/summaries/phase-22.md`, `.planning/STATE.md`, and `tests/curriculumMilestoneAudit.test.ts` after runtime implementation.

---

### Task 1: Helper Test And Deterministic Evidence

**Files:**
- Create: `tests/transformer-block-assembly-challenge.test.ts`
- Create: `src/simulations/transformerBlockAssemblyChallenge.ts`

**Interfaces:**
- Produces:
  - `transformerBlockScenarios: TransformerBlockScenario[]`
  - `evaluateTransformerBlockAssemblyChallenge(input: TransformerBlockChallengeInput): TransformerBlockChallengeSnapshot`
  - `TransformerBlockScenarioId = 'missing-residual' | 'missing-layernorm' | 'missing-ffn' | 'attention-only'`
  - `TransformerBlockPart = 'self-attention' | 'residual' | 'layernorm' | 'ffn' | 'complete-block'`
  - `TransformerConsequence = 'token-mixing' | 'signal-path' | 'normalization' | 'per-token-processing'`

- [ ] **Step 1: Write failing helper tests**

Add `tests/transformer-block-assembly-challenge.test.ts`:

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateTransformerBlockAssemblyChallenge,
  transformerBlockScenarios,
} from '../src/simulations/transformerBlockAssemblyChallenge.ts'

test('transformer block challenge covers required deterministic scenarios', () => {
  assert.deepEqual(transformerBlockScenarios.map((scenario) => scenario.id), [
    'missing-residual',
    'missing-layernorm',
    'missing-ffn',
    'attention-only',
  ])

  const residual = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'missing-residual',
    prediction: { part: 'residual', consequence: 'signal-path' },
  })
  assert.equal(residual.result.allCorrect, true)
  assert.equal(residual.evidence.shapeInvariant, '[B,T,H] -> [B,T,H]')
  assert.match(residual.evidence.failureConsequence.en, /direct signal path/i)

  const norm = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'missing-layernorm',
    prediction: { part: 'layernorm', consequence: 'normalization' },
  })
  assert.equal(norm.result.allCorrect, true)
  assert.match(norm.evidence.failureConsequence.en, /scale/i)

  const ffn = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'missing-ffn',
    prediction: { part: 'ffn', consequence: 'per-token-processing' },
  })
  assert.equal(ffn.result.allCorrect, true)
  assert.match(ffn.evidence.failureConsequence.en, /nonlinear/i)

  const attentionOnly = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'attention-only',
    prediction: { part: 'complete-block', consequence: 'token-mixing' },
  })
  assert.equal(attentionOnly.result.allCorrect, true)
  assert.ok(attentionOnly.evidence.blockTrace.some((step) => step.part === 'self-attention'))
})

test('transformer block challenge normalizes invalid inputs without throwing', () => {
  const snapshot = evaluateTransformerBlockAssemblyChallenge({
    scenarioId: 'unknown',
    prediction: { part: 'unknown-part', consequence: 'unknown-consequence' },
  })

  assert.equal(snapshot.scenario.id, 'missing-residual')
  assert.equal(snapshot.result.partCorrect, false)
  assert.equal(snapshot.result.consequenceCorrect, false)
  assert.equal(snapshot.result.allCorrect, false)
})
```

- [ ] **Step 2: Run RED**

Run:

```bash
node --test tests/transformer-block-assembly-challenge.test.ts
```

Expected: FAIL because `src/simulations/transformerBlockAssemblyChallenge.ts` does not exist.

- [ ] **Step 3: Implement helper**

Create `src/simulations/transformerBlockAssemblyChallenge.ts` with fixed scenario data, `scenarioById`, prediction normalization, and evidence assembly. Keep all copy bilingual through `{ 'zh-CN': string; en: string }`.

- [ ] **Step 4: Run GREEN**

Run:

```bash
node --test tests/transformer-block-assembly-challenge.test.ts
```

Expected: PASS, 2 tests.

---

### Task 2: Vue Challenge Component And Wiring Tests

**Files:**
- Modify: `tests/transformer-block-assembly-challenge.test.ts`
- Create: `src/components/TransformerBlockAssemblyChallengeLab.vue`
- Modify: `src/components/AppliedWorkflowLessonLab.vue`
- Modify: `src/data/attentionTransformerModule.ts`

**Interfaces:**
- Consumes:
  - `transformerBlockScenarios`
  - `evaluateTransformerBlockAssemblyChallenge`

- [ ] **Step 1: Extend failing source-token test**

Append to `tests/transformer-block-assembly-challenge.test.ts`:

```ts
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('transformer block challenge component gates evidence behind a check action', () => {
  const componentSource = read('src/components/TransformerBlockAssemblyChallengeLab.vue')
  assert.match(componentSource, /transformer-block-challenge/)
  assert.match(componentSource, /evaluateTransformerBlockAssemblyChallenge/)
  assert.match(componentSource, /missing-residual/)
  assert.match(componentSource, /missing-layernorm/)
  assert.match(componentSource, /missing-ffn/)
  assert.match(componentSource, /attention-only/)
  assert.match(componentSource, /hasChecked/)
  assert.match(componentSource, /revealEvidence/)
  assert.match(componentSource, /v-if="hasChecked"/)

  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  assert.match(workflowSource, /TransformerBlockAssemblyChallengeLab/)
  assert.match(workflowSource, /moduleSlug === 'attention-transformer'/)
  assert.match(workflowSource, /section\.id === 'transformer-block'/)

  const moduleSource = read('src/data/attentionTransformerModule.ts')
  assert.match(moduleSource, /block.*challenge|挑战.*block|assembly/i)
})
```

- [ ] **Step 2: Run RED**

Run:

```bash
node --test tests/transformer-block-assembly-challenge.test.ts
```

Expected: helper tests pass, component source-token test fails because the component/wiring do not exist.

- [ ] **Step 3: Implement component and wiring**

Create `TransformerBlockAssemblyChallengeLab.vue` following the recent `AttentionQkvChallengeLab.vue` pattern:

- scenario buttons,
- prediction radio groups for part and consequence,
- evidence gate,
- block trace list/table,
- shape invariant,
- role/consequence evidence,
- bilingual feedback.

Modify `AppliedWorkflowLessonLab.vue`:

```vue
<TransformerBlockAssemblyChallengeLab
  v-if="props.moduleSlug === 'attention-transformer' && props.section.id === 'transformer-block'"
/>
```

Modify the `transformer-block` experiment prompt in `attentionTransformerModule.ts` so learners use the challenge before reading evidence.

- [ ] **Step 4: Run GREEN**

Run:

```bash
node --test tests/transformer-block-assembly-challenge.test.ts
```

Expected: PASS, 3 tests.

---

### Task 3: Structure Coverage, Styles, And Phase Summary

**Files:**
- Modify: `tests/deep-learning-extension-modules.test.mjs`
- Modify: `tests/curriculumMilestoneAudit.test.ts`
- Modify: `src/styles/views/algorithm-shell.css`
- Create: `docs/refactor/summaries/phase-22.md`
- Modify: `.planning/STATE.md`

**Interfaces:**
- Consumes:
  - component root class `transformer-block-challenge`
  - workflow conditional `section.id === 'transformer-block'`

- [ ] **Step 1: Write failing structure/doc assertions**

Update `tests/deep-learning-extension-modules.test.mjs` Attention `labTokens` to include:

```js
'import TransformerBlockAssemblyChallengeLab',
'<TransformerBlockAssemblyChallengeLab',
"section.id === 'transformer-block'",
```

Update `tests/curriculumMilestoneAudit.test.ts` to assert:

```ts
assert.ok(existsSync(new URL('docs/refactor/summaries/phase-22.md', root)))
assert.match(stateSource, /Phase 22 Transformer block assembly challenge implementation completed/)
assert.match(stateSource, /TransformerBlockAssemblyChallengeLab/)
```

- [ ] **Step 2: Run RED**

Run:

```bash
node --test tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts
```

Expected: FAIL because source tokens and phase summary are not present yet.

- [ ] **Step 3: Add local styles and summary/state docs**

Add scoped `.transformer-block-challenge*` styles in `src/styles/views/algorithm-shell.css` near `.attention-qkv-challenge*`, plus mobile rules in the existing media block.

Create `docs/refactor/summaries/phase-22.md` with:

- what changed,
- overdesign check,
- quality check,
- coverage check,
- verification list.

Update `.planning/STATE.md` completed work and next recommended command.

- [ ] **Step 4: Run GREEN**

Run:

```bash
node --test tests/transformer-block-assembly-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts
```

Expected: PASS.

---

### Task 4: Runtime Verification And Browser Check

**Files:**
- No new files unless verification reveals a bug.

- [ ] **Step 1: Run full automated checks**

Run:

```bash
npm test
npm run build
npm run build:pages
```

Expected:

- `npm test`: all tests pass.
- `npm run build`: pass, with only existing large-chunk warning if present.
- `npm run build:pages`: pass, with only existing large-chunk warning if present.

- [ ] **Step 2: Run browser checks**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Open `/learn/attention-transformer/transformer-block`.

Verify:

- `.transformer-block-challenge` renders.
- evidence is hidden before check and visible after clicking check.
- existing Attention stage explanation remains visible.
- desktop viewport has no horizontal overflow.
- 390px mobile viewport has no horizontal overflow.
- console error count is 0.

- [ ] **Step 3: Final diff/self-review**

Run:

```bash
git diff --check
git status --short --branch
rg -n "TODO|TBD|FIXME|backend|database|localStorage|sessionStorage|LessonPage|llm-rag|RAG|multi-head|full Transformer|generation demo" src/simulations/transformerBlockAssemblyChallenge.ts src/components/TransformerBlockAssemblyChallengeLab.vue src/components/AppliedWorkflowLessonLab.vue src/data/attentionTransformerModule.ts tests/transformer-block-assembly-challenge.test.ts docs/refactor/summaries/phase-22.md .planning/STATE.md
```

Expected:

- whitespace check passes,
- only intended files are modified,
- keyword hits are either absent from runtime files or only appear in docs as explicit non-goals.

---

## Self-Review

- Spec coverage: helper, component, wiring, module prompt, styles, tests, docs, browser checks, and non-goals are all covered.
- Scope check: no backend, database, durable progress, route, role, LessonPage, RAG, generation, full Transformer, or multi-head work.
- Type consistency: helper names and scenario ids match across tests, component, and design docs.
- Overdesign check: implementation stays at one helper, one component, one conditional wiring point, one style block, and focused tests.
