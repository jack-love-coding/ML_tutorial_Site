# Data Pipeline Task Lab Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Phase 11 task lab that teaches split / fit / transform safety, leakage detection, and final `[B,F]` feature matrix shape inside the required `numerical-data` module.

**Architecture:** Add a deterministic `pipelineTask.ts` helper for scenario, leakage, and shape calculations, then render it through a dedicated Data Lab component registered in the existing `DataLabModulePage` async lab registry. Keep the change scoped to `numerical-data`; do not add backend, persistent progress, routes, or a general workflow editor.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, TypeScript, existing Data Lab typed schema, Node test runner, existing `src/styles/modules/data-lab.css`.

---

### Task 1: Pipeline Task Simulation

**Files:**
- Create: `src/modules/data-lab/utils/pipelineTask.ts`
- Test: `tests/data-pipeline-task-lab.test.ts`

- [x] **Step 1: Write the failing simulation tests**

Create `tests/data-pipeline-task-lab.test.ts` with:

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { buildDataPipelineTaskSnapshot } from '../src/modules/data-lab/utils/pipelineTask.ts'

const root = new URL('../', import.meta.url)

function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('safe data pipeline fits preprocessing on train only and exposes matrix shapes', () => {
  const snapshot = buildDataPipelineTaskSnapshot({
    scenarioId: 'safe',
    includeRooms: true,
    includePrice: true,
    includeDistrict: true,
  })

  assert.equal(snapshot.safe, true)
  assert.deepEqual(snapshot.leakageReasons, [])
  assert.deepEqual(snapshot.splitCounts, { train: 4, validation: 1, test: 1 })
  assert.deepEqual(snapshot.fitSources, { scaler: 'train', vocabulary: 'train' })
  assert.deepEqual(snapshot.featureCounts, { numeric: 2, categoricalSlots: 3, total: 5 })
  assert.deepEqual(snapshot.matrixShapes, {
    train: '[4,5]',
    validation: '[1,5]',
    test: '[1,5]',
  })
  assert.ok(snapshot.codeLines.some((line) => line.includes('fit(X_train')))
})

test('unsafe scaler scenario reports leakage and keeps feature shape visible', () => {
  const snapshot = buildDataPipelineTaskSnapshot({
    scenarioId: 'fit-before-split',
    includeRooms: true,
    includePrice: false,
    includeDistrict: false,
  })

  assert.equal(snapshot.safe, false)
  assert.equal(snapshot.fitSources.scaler, 'all')
  assert.equal(snapshot.fitSources.vocabulary, 'none')
  assert.equal(snapshot.featureCounts.total, 1)
  assert.deepEqual(snapshot.matrixShapes, {
    train: '[4,1]',
    validation: '[1,1]',
    test: '[1,1]',
  })
  assert.ok(snapshot.leakageReasons.some((reason) => reason.includes('scaler')))
})

test('unsafe vocabulary scenario reports category leakage', () => {
  const snapshot = buildDataPipelineTaskSnapshot({
    scenarioId: 'vocab-on-all',
    includeRooms: false,
    includePrice: false,
    includeDistrict: true,
  })

  assert.equal(snapshot.safe, false)
  assert.equal(snapshot.fitSources.scaler, 'none')
  assert.equal(snapshot.fitSources.vocabulary, 'all')
  assert.equal(snapshot.featureCounts.numeric, 0)
  assert.equal(snapshot.featureCounts.categoricalSlots, 4)
  assert.equal(snapshot.featureCounts.total, 4)
  assert.ok(snapshot.leakageReasons.some((reason) => reason.includes('vocabulary')))
})
```

- [x] **Step 2: Run the test to verify RED**

Run: `node --test tests/data-pipeline-task-lab.test.ts`

Expected: FAIL because `src/modules/data-lab/utils/pipelineTask.ts` does not exist.

- [x] **Step 3: Implement the helper**

Create `src/modules/data-lab/utils/pipelineTask.ts` exporting:

```ts
export type PipelineScenarioId = 'safe' | 'fit-before-split' | 'vocab-on-all'
export type PipelineFitSource = 'train' | 'all' | 'none'

export interface DataPipelineTaskConfig {
  scenarioId: PipelineScenarioId
  includeRooms: boolean
  includePrice: boolean
  includeDistrict: boolean
}

export interface DataPipelineTaskSnapshot {
  scenarioId: PipelineScenarioId
  safe: boolean
  leakageReasons: string[]
  splitCounts: { train: number; validation: number; test: number }
  fitSources: { scaler: PipelineFitSource; vocabulary: PipelineFitSource }
  featureCounts: { numeric: number; categoricalSlots: number; total: number }
  matrixShapes: { train: string; validation: string; test: string }
  codeLines: string[]
}
```

Use a fixed six-row teaching dataset with four train rows, one validation row, and one test row. Count selected numeric columns from `includeRooms` and `includePrice`. Count district slots from training categories for safe mode and all categories for `vocab-on-all`.

- [x] **Step 4: Run targeted test to verify GREEN**

Run: `node --test tests/data-pipeline-task-lab.test.ts`

Expected: PASS.

### Task 2: Data Lab Component And Wiring

**Files:**
- Create: `src/modules/data-lab/labs/DataPipelineTaskLab.vue`
- Modify: `src/modules/data-lab/types/dataLab.ts`
- Modify: `src/modules/data-lab/pages/DataLabModulePage.vue`
- Modify: `src/modules/data-lab/data/modules.ts`
- Modify: `src/styles/modules/data-lab.css`
- Test: `tests/data-pipeline-task-lab.test.ts`

- [x] **Step 1: Add failing source-wiring assertions**

Append this test to `tests/data-pipeline-task-lab.test.ts`:

```ts
test('numerical data module wires the split fit transform task lab', () => {
  assert.ok(existsSync(new URL('src/modules/data-lab/labs/DataPipelineTaskLab.vue', root)))

  const componentSource = read('src/modules/data-lab/labs/DataPipelineTaskLab.vue')
  const pageSource = read('src/modules/data-lab/pages/DataLabModulePage.vue')
  const typeSource = read('src/modules/data-lab/types/dataLab.ts')
  const moduleSource = read('src/modules/data-lab/data/modules.ts')
  const styleSource = read('src/styles/modules/data-lab.css')

  assert.match(componentSource, /buildDataPipelineTaskSnapshot/)
  assert.match(componentSource, /split \\/ fit \\/ transform/i)
  assert.match(componentSource, /\\[B,F\\]/)
  assert.match(componentSource, /data-pipeline-task-lab__scenario/)
  assert.match(pageSource, /DataPipelineTaskLab/)
  assert.match(typeSource, /DataPipelineTaskLab/)
  assert.match(moduleSource, /data-pipeline-task-lab/)
  assert.match(moduleSource, /split \\/ fit \\/ transform 任务实验/)
  assert.match(styleSource, /data-pipeline-task-lab/)
})
```

- [x] **Step 2: Run the test to verify RED**

Run: `node --test tests/data-pipeline-task-lab.test.ts`

Expected: FAIL because the Vue component and wiring do not exist yet.

- [x] **Step 3: Implement the component and wiring**

Implement `DataPipelineTaskLab.vue` with localized copy and controls:

- three scenario buttons: safe pipeline, leaky scaler, leaky vocabulary;
- three feature toggles: `rooms`, `price`, `district`;
- readouts for fit source, leakage status, split counts, feature counts, and matrix shapes;
- code lines from the helper;
- a prediction prompt and an explanation prompt.

Update:

- `DataLabConfig['componentName']` union with `DataPipelineTaskLab`;
- `DataLabModulePage.vue` async registry;
- `numerical-data` lab list and `pandas-numeric-recipe` `labIds`;
- `data-lab.css` with responsive `.data-pipeline-task-lab*` rules.

- [x] **Step 4: Run targeted tests**

Run: `node --test tests/data-pipeline-task-lab.test.ts tests/data-lab-layout.test.mjs`

Expected: PASS.

### Task 3: Documentation And Verification

**Files:**
- Modify: `docs/refactor/designs/phase-11-data-pipeline-task-lab.md`
- Create: `docs/refactor/summaries/phase-11.md`
- Modify: `docs/superpowers/plans/2026-06-28-data-pipeline-task-lab.md`

- [x] **Step 1: Add Phase 11 summary**

Create `docs/refactor/summaries/phase-11.md` with delivered files, non-goals preserved, and verification commands.

- [x] **Step 2: Mark design status**

Update `docs/refactor/designs/phase-11-data-pipeline-task-lab.md` from `Draft for review` to `Implemented and verified` after tests and browser verification pass.

- [x] **Step 3: Run final verification**

Run:

```bash
node --test tests/data-pipeline-task-lab.test.ts tests/data-lab-layout.test.mjs
git diff --check
npm test
npm run build
npm run build:pages
node scripts/create-pages-fallbacks.mjs
```

Expected:

- targeted tests pass;
- full tests pass;
- builds pass with only the existing large-chunk warning;
- fallback generation reports 46 routes.

- [x] **Step 4: Browser verification**

Start `npm run dev -- --host 127.0.0.1`, open `/data-lab/modules/numerical-data`, and verify:

- the split / fit / transform task lab renders;
- changing scenario updates leakage and fit-source readouts;
- toggling numeric/category features updates `[B,F]` shapes;
- desktop and 390px mobile have no horizontal overflow;
- console errors remain 0.
