# Sequence Bridge Shape Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Upgrade the `sequence-embedding-bridge` workflow lab from static stage switching into an interactive shape and mask task.

**Architecture:** Add a deterministic simulation helper for token/embedding/mask shape calculations, then render it through a dedicated Vue component used only by the sequence bridge workflow branch. Keep existing workflow labs unchanged and avoid progress/backend scope.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript, Node test runner, existing workflow lesson CSS.

---

### Task 1: Sequence Shape Simulation

**Files:**
- Create: `src/simulations/sequenceBridgeLab.ts`
- Test: `tests/sequence-bridge-lab.test.ts`

- [x] **Step 1: Write the failing test**

Create `tests/sequence-bridge-lab.test.ts` with tests that import `buildSequenceBridgeSnapshot()` from `src/simulations/sequenceBridgeLab.ts` and assert:

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSequenceBridgeSnapshot } from '../src/simulations/sequenceBridgeLab.ts'

test('sequence bridge snapshot traces token ids to hidden states and qkv shapes', () => {
  const snapshot = buildSequenceBridgeSnapshot({
    batchSize: 2,
    tokenLength: 5,
    hiddenSize: 8,
    paddingTokens: 1,
    maskMode: 'padding',
    queryIndex: 2,
  })

  assert.equal(snapshot.tokenIdsShape, '[2,5]')
  assert.equal(snapshot.embeddingTableShape, '[V,8]')
  assert.equal(snapshot.hiddenStatesShape, '[2,5,8]')
  assert.equal(snapshot.qkvShape, '[2,5,8]')
  assert.equal(snapshot.attentionScoreShape, '[2,5,5]')
  assert.equal(snapshot.visibleTokenCount, 4)
  assert.equal(snapshot.blockedTokenCount, 1)
})

test('sequence bridge causal mask only exposes tokens up to the query position', () => {
  const snapshot = buildSequenceBridgeSnapshot({
    batchSize: 1,
    tokenLength: 6,
    hiddenSize: 16,
    paddingTokens: 0,
    maskMode: 'causal',
    queryIndex: 3,
  })

  assert.equal(snapshot.visibleTokenCount, 4)
  assert.equal(snapshot.blockedTokenCount, 2)
  assert.deepEqual(
    snapshot.maskCells.map((cell) => cell.state),
    ['visible', 'visible', 'visible', 'query', 'blocked', 'blocked'],
  )
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/sequence-bridge-lab.test.ts`

Expected: FAIL because `src/simulations/sequenceBridgeLab.ts` does not exist.

- [x] **Step 3: Implement the simulation helper**

Create `src/simulations/sequenceBridgeLab.ts` with:

```ts
export type SequenceMaskMode = 'none' | 'padding' | 'causal'

export interface SequenceBridgeLabConfig {
  batchSize: number
  tokenLength: number
  hiddenSize: number
  paddingTokens: number
  maskMode: SequenceMaskMode
  queryIndex: number
}

export interface SequenceBridgeMaskCell {
  index: number
  label: string
  state: 'visible' | 'query' | 'blocked'
}

export interface SequenceBridgeSnapshot {
  config: SequenceBridgeLabConfig
  tokenIdsShape: string
  embeddingTableShape: string
  hiddenStatesShape: string
  qkvShape: string
  attentionScoreShape: string
  visibleTokenCount: number
  blockedTokenCount: number
  effectiveTokenCount: number
  maskCells: SequenceBridgeMaskCell[]
}

export function buildSequenceBridgeSnapshot(config: SequenceBridgeLabConfig): SequenceBridgeSnapshot
```

The implementation clamps numeric fields into safe ranges, computes shape strings, and marks mask cells as `visible`, `query`, or `blocked`.

- [x] **Step 4: Run test to verify it passes**

Run: `node --test tests/sequence-bridge-lab.test.ts`

Expected: PASS.

### Task 2: Dedicated Vue Lab And Wiring

**Files:**
- Create: `src/components/SequenceBridgeShapeLab.vue`
- Modify: `src/components/AppliedWorkflowLessonLab.vue`
- Modify: `src/styles/modules/workflow-lessons.css`
- Test: `tests/sequence-bridge-lab.test.ts`

- [x] **Step 1: Add failing source-wiring assertions**

Extend `tests/sequence-bridge-lab.test.ts` to read source files and assert:

```ts
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')

test('sequence bridge workflow uses the dedicated shape lab component', () => {
  assert.ok(existsSync(new URL('src/components/SequenceBridgeShapeLab.vue', root)))

  const componentSource = read('src/components/SequenceBridgeShapeLab.vue')
  const workflowSource = read('src/components/AppliedWorkflowLessonLab.vue')
  const styleSource = read('src/styles/modules/workflow-lessons.css')

  assert.match(componentSource, /buildSequenceBridgeSnapshot/)
  assert.match(componentSource, /sequence-shape-lab__controls/)
  assert.match(componentSource, /token_ids \\[B,T\\]/)
  assert.match(componentSource, /hidden states \\[B,T,H\\]/)
  assert.match(componentSource, /Q\\/K\\/V/)
  assert.match(componentSource, /Predict first/)
  assert.match(workflowSource, /import SequenceBridgeShapeLab/)
  assert.match(workflowSource, /<SequenceBridgeShapeLab/)
  assert.match(styleSource, /sequence-shape-lab/)
})
```

- [x] **Step 2: Run test to verify it fails**

Run: `node --test tests/sequence-bridge-lab.test.ts`

Expected: FAIL because the component and wiring do not exist yet.

- [x] **Step 3: Implement the component and wiring**

Create `SequenceBridgeShapeLab.vue` with localized controls for `B`, `T`, `H`, padding, mask mode, and query token. Use `buildSequenceBridgeSnapshot()` for all derived readouts. Render:

- prediction prompt,
- shape pipeline cards,
- mask visibility cells,
- Q/K/V handoff readout,
- explanation prompt.

Modify `AppliedWorkflowLessonLab.vue` so the `sequence-bridge` branch renders `<SequenceBridgeShapeLab />` instead of the generic pipeline card list. Add minimal `.sequence-shape-lab*` styles to `workflow-lessons.css`.

- [x] **Step 4: Run targeted tests**

Run: `node --test tests/sequence-bridge-lab.test.ts tests/deep-learning-extension-modules.test.mjs`

Expected: PASS.

### Task 3: Verification And Documentation

**Files:**
- Create: `docs/refactor/designs/phase-10-sequence-bridge-shape-lab.md`
- Create or update: `docs/refactor/summaries/phase-10.md`

- [x] **Step 1: Add Phase 10 docs**

Document the goal, non-goals, files changed, and verification checklist. State explicitly that Phase 10 upgrades only `sequence-embedding-bridge` and does not add progress persistence.

- [x] **Step 2: Run final verification**

Run:

```bash
node --test tests/sequence-bridge-lab.test.ts tests/deep-learning-extension-modules.test.mjs
git diff --check
npm test
npm run build
npm run build:pages
node scripts/create-pages-fallbacks.mjs
```

Expected: all tests pass, builds pass with only the existing large-chunk warning, and fallback generation reports 46 routes.

- [x] **Step 3: Browser verification**

Start `npm run dev -- --host 127.0.0.1`, open `/learn/sequence-embedding-bridge/embedding-lookup`, and verify:

- the sequence shape lab renders,
- changing `T`, `H`, mask mode, and query index updates shape and visibility readouts,
- desktop and 390px mobile have no horizontal overflow,
- console errors remain 0.
