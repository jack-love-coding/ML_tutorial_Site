# MLP Backprop Mechanism Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a compact MLP backpropagation bridge that teaches chain-rule responsibility flow without promoting full matrix calculus into the required route.

**Architecture:** Use one deterministic scalar helper for a one-hidden-unit MLP, then render a narrow prediction/evidence task inside the existing MLP `backprop` lesson section. Keep `matrix-calculus-autodiff` as support-only and keep the existing MLP Playground cockpit unchanged.

**Tech Stack:** Vue 3, TypeScript, Vite, Node test runner, existing algorithm LessonPage shell.

## Global Constraints

- Use TDD: failing tests before production code.
- Do not add backend, database, account, durable progress, or project readiness scope.
- Do not promote `matrix-calculus-autodiff` into required core.
- Do not build a full autodiff engine.
- Do not redesign `lessonLabRegistry` for one bridge lab.
- Keep all bilingual UI copy in existing localized-copy style.
- Keep formula variables consistent: `x`, `z1`, `h`, `yHat`, `loss`, `w1`, `b1`, `w2`, `b2`.

---

### Task 1: Deterministic Scalar Backprop Helper

**Files:**
- Create: `src/simulations/mlpBackpropBridge.ts`
- Test: `tests/mlp-backprop-bridge.test.ts`

**Interfaces:**
- Produces: `evaluateMlpBackpropBridge(input: MlpBackpropBridgeInput): MlpBackpropBridgeSnapshot`
- Consumes: no project runtime dependencies beyond standard TypeScript and `Math`.

- [ ] **Step 1: Write the failing helper test**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateMlpBackpropBridge,
  type MlpBackpropBridgeInput,
} from '../src/simulations/mlpBackpropBridge.ts'

const input: MlpBackpropBridgeInput = {
  x: 1.2,
  target: 0.4,
  w1: 0.7,
  b1: -0.2,
  w2: 1.1,
  b2: 0.05,
  learningRate: 0.1,
  inspectedParameter: 'w1',
  predictedDirection: 'decrease',
}

test('mlp backprop bridge computes scalar chain-rule gradients and updates', () => {
  const snapshot = evaluateMlpBackpropBridge(input)
  const h = Math.tanh(input.w1 * input.x + input.b1)
  const yHat = input.w2 * h + input.b2
  const error = yHat - input.target
  const dLossDZ1 = error * input.w2 * (1 - h ** 2)

  assert.equal(Number(snapshot.forward.h.toFixed(8)), Number(h.toFixed(8)))
  assert.equal(Number(snapshot.forward.yHat.toFixed(8)), Number(yHat.toFixed(8)))
  assert.equal(Number(snapshot.gradients.w1.toFixed(8)), Number((dLossDZ1 * input.x).toFixed(8)))
  assert.equal(Number(snapshot.gradients.b1.toFixed(8)), Number(dLossDZ1.toFixed(8)))
  assert.equal(Number(snapshot.updates.w1.after.toFixed(8)), Number((input.w1 - input.learningRate * snapshot.gradients.w1).toFixed(8)))
})

test('mlp backprop bridge checks predicted update direction', () => {
  const snapshot = evaluateMlpBackpropBridge(input)

  assert.equal(snapshot.updates.w1.direction, 'decrease')
  assert.equal(snapshot.inspected.parameter, 'w1')
  assert.equal(snapshot.inspected.predictedDirection, 'decrease')
  assert.equal(snapshot.inspected.correct, true)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mlp-backprop-bridge.test.ts`

Expected: FAIL with module-not-found for `src/simulations/mlpBackpropBridge.ts`.

- [ ] **Step 3: Implement the helper**

```ts
export type MlpBackpropBridgeParameter = 'w1' | 'b1' | 'w2' | 'b2'
export type MlpBackpropBridgeDirection = 'increase' | 'decrease' | 'flat'

export interface MlpBackpropBridgeInput {
  x: number
  target: number
  w1: number
  b1: number
  w2: number
  b2: number
  learningRate: number
  inspectedParameter: MlpBackpropBridgeParameter
  predictedDirection: MlpBackpropBridgeDirection
}

export interface MlpBackpropBridgeSnapshot {
  forward: { z1: number; h: number; yHat: number; error: number; loss: number }
  localDerivatives: {
    dLossDYHat: number
    dYHatDW2: number
    dYHatDB2: number
    dYHatDH: number
    dHDZ1: number
    dZ1DW1: number
    dZ1DB1: number
  }
  gradients: Record<MlpBackpropBridgeParameter, number>
  updates: Record<MlpBackpropBridgeParameter, {
    before: number
    gradient: number
    after: number
    direction: MlpBackpropBridgeDirection
  }>
  inspected: {
    parameter: MlpBackpropBridgeParameter
    predictedDirection: MlpBackpropBridgeDirection
    actualDirection: MlpBackpropBridgeDirection
    correct: boolean
    explanationKey: 'output-weight' | 'output-bias' | 'hidden-weight' | 'hidden-bias'
  }
}

const defaults: MlpBackpropBridgeInput = {
  x: 1,
  target: 0.5,
  w1: 0.8,
  b1: -0.1,
  w2: 1.2,
  b2: 0,
  learningRate: 0.1,
  inspectedParameter: 'w1',
  predictedDirection: 'decrease',
}

function finite(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback
}

function direction(delta: number): MlpBackpropBridgeDirection {
  if (Math.abs(delta) < 1e-8) return 'flat'
  return delta > 0 ? 'increase' : 'decrease'
}

function explanationKey(parameter: MlpBackpropBridgeParameter): MlpBackpropBridgeSnapshot['inspected']['explanationKey'] {
  if (parameter === 'w2') return 'output-weight'
  if (parameter === 'b2') return 'output-bias'
  if (parameter === 'w1') return 'hidden-weight'
  return 'hidden-bias'
}

export function evaluateMlpBackpropBridge(input: MlpBackpropBridgeInput): MlpBackpropBridgeSnapshot {
  const safe = {
    x: finite(input.x, defaults.x),
    target: finite(input.target, defaults.target),
    w1: finite(input.w1, defaults.w1),
    b1: finite(input.b1, defaults.b1),
    w2: finite(input.w2, defaults.w2),
    b2: finite(input.b2, defaults.b2),
    learningRate: Math.max(0, finite(input.learningRate, defaults.learningRate)),
    inspectedParameter: input.inspectedParameter ?? defaults.inspectedParameter,
    predictedDirection: input.predictedDirection ?? defaults.predictedDirection,
  }

  const z1 = safe.w1 * safe.x + safe.b1
  const h = Math.tanh(z1)
  const yHat = safe.w2 * h + safe.b2
  const error = yHat - safe.target
  const loss = 0.5 * error ** 2
  const dHDZ1 = 1 - h ** 2
  const dLossDZ1 = error * safe.w2 * dHDZ1
  const gradients = {
    w1: dLossDZ1 * safe.x,
    b1: dLossDZ1,
    w2: error * h,
    b2: error,
  }
  const params = { w1: safe.w1, b1: safe.b1, w2: safe.w2, b2: safe.b2 }
  const updates = Object.fromEntries(
    (Object.keys(params) as MlpBackpropBridgeParameter[]).map((parameter) => {
      const before = params[parameter]
      const gradient = gradients[parameter]
      const after = before - safe.learningRate * gradient
      return [parameter, { before, gradient, after, direction: direction(after - before) }]
    }),
  ) as MlpBackpropBridgeSnapshot['updates']

  const actualDirection = updates[safe.inspectedParameter].direction
  return {
    forward: { z1, h, yHat, error, loss },
    localDerivatives: {
      dLossDYHat: error,
      dYHatDW2: h,
      dYHatDB2: 1,
      dYHatDH: safe.w2,
      dHDZ1,
      dZ1DW1: safe.x,
      dZ1DB1: 1,
    },
    gradients,
    updates,
    inspected: {
      parameter: safe.inspectedParameter,
      predictedDirection: safe.predictedDirection,
      actualDirection,
      correct: safe.predictedDirection === actualDirection,
      explanationKey: explanationKey(safe.inspectedParameter),
    },
  }
}
```

- [ ] **Step 4: Run helper tests**

Run: `node --test tests/mlp-backprop-bridge.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/simulations/mlpBackpropBridge.ts tests/mlp-backprop-bridge.test.ts
git commit -m "feat: add mlp backprop bridge helper"
```

### Task 2: Section-Level Bridge Component

**Files:**
- Create: `src/components/MlpBackpropBridgeLab.vue`
- Modify: `src/styles/views/algorithm-shell.css`
- Test: `tests/mlp-backprop-bridge.test.ts`

**Interfaces:**
- Consumes: `evaluateMlpBackpropBridge()`.
- Produces: a component with visible source tokens `MlpBackpropBridgeLab`, `evaluateMlpBackpropBridge`, `predictedDirection`, and `actualDirection`.

- [ ] **Step 1: Add failing component source test**

```ts
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('mlp backprop bridge component renders prediction and evidence controls', () => {
  assert.ok(existsSync(new URL('src/components/MlpBackpropBridgeLab.vue', root)))
  const source = read('src/components/MlpBackpropBridgeLab.vue')

  assert.match(source, /evaluateMlpBackpropBridge/)
  assert.match(source, /predictedDirection/)
  assert.match(source, /actualDirection/)
  assert.match(source, /w1/)
  assert.match(source, /b1/)
  assert.match(source, /w2/)
  assert.match(source, /b2/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mlp-backprop-bridge.test.ts`

Expected: FAIL because `MlpBackpropBridgeLab.vue` does not exist.

- [ ] **Step 3: Create component**

Implement `MlpBackpropBridgeLab.vue` with:
- three fixed scenarios,
- parameter selector,
- direction prediction buttons,
- forward cards,
- chain-rule evidence cards,
- feedback text.

Use localized copy computed from `vue-i18n` locale. Keep all state local to the component.

- [ ] **Step 4: Add styles**

Add classes to `src/styles/views/algorithm-shell.css`:
- `.mlp-backprop-bridge`
- `.mlp-backprop-bridge__controls`
- `.mlp-backprop-bridge__cards`
- `.mlp-backprop-bridge__chain`
- `.mlp-backprop-bridge__feedback`

Use responsive grid/flex patterns and avoid horizontal overflow at 390px.

- [ ] **Step 5: Run component tests**

Run: `node --test tests/mlp-backprop-bridge.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/components/MlpBackpropBridgeLab.vue src/styles/views/algorithm-shell.css tests/mlp-backprop-bridge.test.ts
git commit -m "feat: add mlp backprop bridge lab"
```

### Task 3: MLP Lesson Wiring

**Files:**
- Modify: `src/views/AlgorithmView.vue`
- Modify: `src/data/mlpModule.ts`
- Test: `tests/mlp-backprop-bridge.test.ts`
- Test: `tests/mlp-workbench.test.mjs`

**Interfaces:**
- Consumes: `MlpBackpropBridgeLab.vue`.
- Produces: section-only rendering for `isMlpPage && section.id === 'backprop'`.

- [ ] **Step 1: Add failing wiring test**

```ts
test('mlp backprop bridge is wired only into the backprop lesson section', () => {
  const algorithmViewSource = read('src/views/AlgorithmView.vue')
  const mlpModuleSource = read('src/data/mlpModule.ts')

  assert.match(algorithmViewSource, /import MlpBackpropBridgeLab/)
  assert.match(algorithmViewSource, /isMlpPage && section\.id === 'backprop'/)
  assert.match(algorithmViewSource, /<MlpBackpropBridgeLab/)
  assert.match(mlpModuleSource, /chain rule|链式法则|计算图/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/mlp-backprop-bridge.test.ts`

Expected: FAIL because AlgorithmView is not wired.

- [ ] **Step 3: Wire component**

In `src/views/AlgorithmView.vue`:

```ts
import MlpBackpropBridgeLab from '../components/MlpBackpropBridgeLab.vue'
```

Inside the existing `<template #lab="{ section }">` block:

```vue
<MlpBackpropBridgeLab
  v-else-if="isMlpPage && section.id === 'backprop'"
  :accent="moduleDefinition.accent"
/>
```

- [ ] **Step 4: Adjust one MLP backprop prompt if needed**

In `src/data/mlpModule.ts`, keep the existing backprop chapter and only add a short bridge sentence to the experiment prompt if the component needs a clearer handoff.

- [ ] **Step 5: Run targeted tests**

Run:

```bash
node --test tests/mlp-backprop-bridge.test.ts tests/mlp-workbench.test.mjs tests/lessonPagePilot.test.ts tests/curriculumRoles.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/views/AlgorithmView.vue src/data/mlpModule.ts tests/mlp-backprop-bridge.test.ts tests/mlp-workbench.test.mjs
git commit -m "feat: wire mlp backprop bridge into lesson"
```

### Task 4: Verification And Docs

**Files:**
- Create: `docs/refactor/summaries/phase-17.md`
- Modify: `.planning/STATE.md`
- Test: `tests/curriculumMilestoneAudit.test.ts`

**Interfaces:**
- Consumes: completed helper/component/wiring.
- Produces: phase summary and current-state update.

- [ ] **Step 1: Add failing documentation invariant**

Update `tests/curriculumMilestoneAudit.test.ts` to assert:

```ts
assert.ok(existsSync(new URL('docs/refactor/summaries/phase-17.md', root)))
assert.match(stateSource, /Phase 17 MLP backprop mechanism bridge completed/)
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/curriculumMilestoneAudit.test.ts`

Expected: FAIL because summary/state are not updated.

- [ ] **Step 3: Add summary and state update**

Create `docs/refactor/summaries/phase-17.md` with:
- delivered helper/component/wiring,
- explicit decision that `matrix-calculus-autodiff` remains support,
- verification commands.

Update `.planning/STATE.md` with Phase 17 completion and next direction.

- [ ] **Step 4: Run full verification**

Run:

```bash
node --test tests/mlp-backprop-bridge.test.ts tests/mlp-workbench.test.mjs tests/lessonPagePilot.test.ts tests/curriculumMilestoneAudit.test.ts
npm test
npm run build
npm run build:pages
git diff --check
```

Expected:
- targeted tests pass,
- `npm test` passes,
- builds pass with only existing large-chunk warning,
- `git diff --check` has no output.

- [ ] **Step 5: Browser verification**

Run local dev server and check:
- `/learn/mlp/backprop` desktop renders the bridge,
- 390px mobile has no horizontal overflow,
- changing parameter/prediction updates feedback,
- console errors are 0.

- [ ] **Step 6: Commit**

```bash
git add docs/refactor/summaries/phase-17.md .planning/STATE.md tests/curriculumMilestoneAudit.test.ts
git commit -m "docs: summarize phase 17 backprop bridge"
```
