# CNN Shape/Parameter Challenge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a narrow CNN prediction/evidence task that connects `Conv2d` code, output shape, convolution parameter count, and dense-layer comparison.

**Architecture:** Add one deterministic helper in `src/simulations/`, one Vue lab component, and one direct CNN section-level wiring point in `AlgorithmView.vue`. Reuse `calculateCnnOutputSize()` from `src/utils/cnnExplainer.ts`; keep `CnnExplainerLab` intact.

**Tech Stack:** Vue 3, TypeScript, Vite, Node test runner, existing algorithm shell styles.

## Global Constraints

- Use TDD: failing tests before production code.
- Do not add backend, database, account, durable progress, or project readiness scope.
- Do not create a new optimizer-to-CNN transition module.
- Do not rewrite or replace `CnnExplainerLab.vue`.
- Do not wire through `AppliedWorkflowLessonLab.vue`; CNN currently renders through `AlgorithmView.vue`.
- Keep all UI copy bilingual in existing localized-copy style.
- Keep formula variables consistent: `input`, `padding`, `kernel`, `stride`, `inputChannels`, `outputChannels`.

---

### Task 1: Deterministic CNN Shape/Parameter Helper

**Files:**
- Create: `src/simulations/cnnShapeParameterChallenge.ts`
- Test: `tests/cnn-shape-parameter-challenge.test.ts`

**Interfaces:**
- Consumes: `calculateCnnOutputSize(inputSize: number, kernelSize: number, stride: number, padding: number)` from `src/utils/cnnExplainer.ts`.
- Produces: `evaluateCnnShapeParameterChallenge(input: CnnShapeParameterChallengeInput): CnnShapeParameterSnapshot`.

- [ ] **Step 1: Write the failing helper tests**

```ts
import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cnnShapeParameterScenarios,
  evaluateCnnShapeParameterChallenge,
  type CnnShapeParameterChallengeInput,
} from '../src/simulations/cnnShapeParameterChallenge.ts'

test('cnn shape parameter challenge computes same-padding RGB scenario', () => {
  const snapshot = evaluateCnnShapeParameterChallenge({
    scenarioId: 'same-padding-rgb',
    prediction: {
      outputHeight: 32,
      outputWidth: 32,
      outputChannels: 16,
      convParameterCount: 448,
      comparison: 'conv-fewer',
    },
  })

  assert.equal(snapshot.expected.outputHeight, 32)
  assert.equal(snapshot.expected.outputWidth, 32)
  assert.equal(snapshot.expected.outputChannels, 16)
  assert.equal(snapshot.expected.convParameterCount, 448)
  assert.equal(snapshot.expected.denseParameterCount, 50348032)
  assert.equal(snapshot.expected.denseToConvRatio, 112384)
  assert.equal(snapshot.result.allCorrect, true)
})

test('cnn shape parameter challenge covers valid and stride scenarios', () => {
  const valid = evaluateCnnShapeParameterChallenge({
    scenarioId: 'valid-grayscale',
    prediction: {
      outputHeight: 24,
      outputWidth: 24,
      outputChannels: 8,
      convParameterCount: 208,
      comparison: 'conv-fewer',
    },
  })
  const stride = evaluateCnnShapeParameterChallenge({
    scenarioId: 'stride-downsample',
    prediction: {
      outputHeight: 32,
      outputWidth: 32,
      outputChannels: 32,
      convParameterCount: 896,
      comparison: 'conv-fewer',
    },
  })

  assert.equal(valid.expected.denseParameterCount, 3617280)
  assert.equal(valid.result.allCorrect, true)
  assert.equal(stride.expected.denseParameterCount, 402685952)
  assert.equal(stride.result.allCorrect, true)
})

test('cnn shape parameter challenge normalizes invalid learner predictions', () => {
  const input: CnnShapeParameterChallengeInput = {
    scenarioId: 'missing-id',
    prediction: {
      outputHeight: Number.NaN,
      outputWidth: Number.POSITIVE_INFINITY,
      outputChannels: -2,
      convParameterCount: 447.8,
      comparison: 'dense-fewer',
    },
  }
  const snapshot = evaluateCnnShapeParameterChallenge(input)

  assert.equal(snapshot.scenario.id, cnnShapeParameterScenarios[0].id)
  assert.equal(snapshot.result.outputShapeCorrect, false)
  assert.equal(snapshot.result.outputChannelsCorrect, false)
  assert.equal(snapshot.result.convParameterCountCorrect, true)
  assert.equal(snapshot.result.comparisonCorrect, false)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/cnn-shape-parameter-challenge.test.ts`

Expected: FAIL with module-not-found for `src/simulations/cnnShapeParameterChallenge.ts`.

- [ ] **Step 3: Implement the helper**

```ts
import { calculateCnnOutputSize } from '../utils/cnnExplainer'

export type CnnShapeParameterScenarioId = 'same-padding-rgb' | 'valid-grayscale' | 'stride-downsample'
export type CnnParameterComparison = 'conv-fewer' | 'dense-fewer' | 'same'

export interface CnnShapeParameterPrediction {
  outputHeight: number
  outputWidth: number
  outputChannels: number
  convParameterCount: number
  comparison: CnnParameterComparison
}

export interface CnnShapeParameterChallengeInput {
  scenarioId: CnnShapeParameterScenarioId | string
  prediction: CnnShapeParameterPrediction
}

export interface CnnShapeParameterScenario {
  id: CnnShapeParameterScenarioId
  inputHeight: number
  inputWidth: number
  inputChannels: number
  kernelHeight: number
  kernelWidth: number
  stride: number
  padding: number
  outputChannels: number
  bias: boolean
  code: string
}

export interface CnnShapeParameterSnapshot {
  scenario: CnnShapeParameterScenario
  prediction: CnnShapeParameterPrediction
  expected: {
    outputHeight: number
    outputWidth: number
    outputChannels: number
    convParameterCount: number
    denseParameterCount: number
    denseToConvRatio: number
  }
  evidence: {
    heightNumerator: number
    widthNumerator: number
    convWeights: number
    convBiases: number
    denseInputUnits: number
    denseOutputUnits: number
    denseWeights: number
    denseBiases: number
  }
  result: {
    outputShapeCorrect: boolean
    outputChannelsCorrect: boolean
    convParameterCountCorrect: boolean
    comparisonCorrect: boolean
    allCorrect: boolean
  }
}

export const cnnShapeParameterScenarios: CnnShapeParameterScenario[] = [
  {
    id: 'same-padding-rgb',
    inputHeight: 32,
    inputWidth: 32,
    inputChannels: 3,
    kernelHeight: 3,
    kernelWidth: 3,
    stride: 1,
    padding: 1,
    outputChannels: 16,
    bias: true,
    code: 'nn.Conv2d(3, 16, kernel_size=3, padding=1, stride=1)',
  },
  {
    id: 'valid-grayscale',
    inputHeight: 28,
    inputWidth: 28,
    inputChannels: 1,
    kernelHeight: 5,
    kernelWidth: 5,
    stride: 1,
    padding: 0,
    outputChannels: 8,
    bias: true,
    code: 'nn.Conv2d(1, 8, kernel_size=5, padding=0, stride=1)',
  },
  {
    id: 'stride-downsample',
    inputHeight: 64,
    inputWidth: 64,
    inputChannels: 3,
    kernelHeight: 3,
    kernelWidth: 3,
    stride: 2,
    padding: 1,
    outputChannels: 32,
    bias: true,
    code: 'nn.Conv2d(3, 32, kernel_size=3, padding=1, stride=2)',
  },
]

function safeInteger(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.max(0, Math.round(value))
}

function safeComparison(value: CnnParameterComparison): CnnParameterComparison {
  return value === 'dense-fewer' || value === 'same' ? value : 'conv-fewer'
}

function findScenario(id: string) {
  return cnnShapeParameterScenarios.find((scenario) => scenario.id === id) ?? cnnShapeParameterScenarios[0]
}

function expectedComparison(convParameterCount: number, denseParameterCount: number): CnnParameterComparison {
  if (convParameterCount === denseParameterCount) return 'same'
  return convParameterCount < denseParameterCount ? 'conv-fewer' : 'dense-fewer'
}

export function evaluateCnnShapeParameterChallenge(input: CnnShapeParameterChallengeInput): CnnShapeParameterSnapshot {
  const scenario = findScenario(input.scenarioId)
  const prediction = {
    outputHeight: safeInteger(input.prediction.outputHeight),
    outputWidth: safeInteger(input.prediction.outputWidth),
    outputChannels: safeInteger(input.prediction.outputChannels),
    convParameterCount: safeInteger(input.prediction.convParameterCount),
    comparison: safeComparison(input.prediction.comparison),
  }
  const outputHeight = calculateCnnOutputSize(scenario.inputHeight, scenario.kernelHeight, scenario.stride, scenario.padding)
  const outputWidth = calculateCnnOutputSize(scenario.inputWidth, scenario.kernelWidth, scenario.stride, scenario.padding)
  const convWeights = scenario.kernelHeight * scenario.kernelWidth * scenario.inputChannels * scenario.outputChannels
  const convBiases = scenario.bias ? scenario.outputChannels : 0
  const convParameterCount = convWeights + convBiases
  const denseInputUnits = scenario.inputHeight * scenario.inputWidth * scenario.inputChannels
  const denseOutputUnits = outputHeight * outputWidth * scenario.outputChannels
  const denseWeights = denseInputUnits * denseOutputUnits
  const denseBiases = scenario.bias ? denseOutputUnits : 0
  const denseParameterCount = denseWeights + denseBiases
  const comparison = expectedComparison(convParameterCount, denseParameterCount)
  const outputShapeCorrect = prediction.outputHeight === outputHeight && prediction.outputWidth === outputWidth
  const outputChannelsCorrect = prediction.outputChannels === scenario.outputChannels
  const convParameterCountCorrect = prediction.convParameterCount === convParameterCount
  const comparisonCorrect = prediction.comparison === comparison

  return {
    scenario,
    prediction,
    expected: {
      outputHeight,
      outputWidth,
      outputChannels: scenario.outputChannels,
      convParameterCount,
      denseParameterCount,
      denseToConvRatio: convParameterCount > 0 ? denseParameterCount / convParameterCount : 0,
    },
    evidence: {
      heightNumerator: scenario.inputHeight + 2 * scenario.padding - scenario.kernelHeight,
      widthNumerator: scenario.inputWidth + 2 * scenario.padding - scenario.kernelWidth,
      convWeights,
      convBiases,
      denseInputUnits,
      denseOutputUnits,
      denseWeights,
      denseBiases,
    },
    result: {
      outputShapeCorrect,
      outputChannelsCorrect,
      convParameterCountCorrect,
      comparisonCorrect,
      allCorrect: outputShapeCorrect && outputChannelsCorrect && convParameterCountCorrect && comparisonCorrect,
    },
  }
}
```

- [ ] **Step 4: Run helper tests**

Run: `node --test tests/cnn-shape-parameter-challenge.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/simulations/cnnShapeParameterChallenge.ts tests/cnn-shape-parameter-challenge.test.ts
git commit -m "feat: add cnn shape parameter helper"
```

### Task 2: Challenge Component And Styles

**Files:**
- Create: `src/components/CnnShapeParameterChallengeLab.vue`
- Modify: `src/styles/views/algorithm-shell.css`
- Test: `tests/cnn-shape-parameter-challenge.test.ts`

**Interfaces:**
- Consumes: `evaluateCnnShapeParameterChallenge()`.
- Produces: a component with visible source tokens `CnnShapeParameterChallengeLab`, `evaluateCnnShapeParameterChallenge`, `convParameterCount`, and `denseParameterCount`.

- [ ] **Step 1: Add failing component source test**

```ts
import { existsSync, readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)
function read(path: string) {
  return readFileSync(new URL(path, root), 'utf8')
}

test('cnn shape parameter challenge component renders prediction and evidence controls', () => {
  assert.ok(existsSync(new URL('src/components/CnnShapeParameterChallengeLab.vue', root)))
  const source = read('src/components/CnnShapeParameterChallengeLab.vue')

  assert.match(source, /evaluateCnnShapeParameterChallenge/)
  assert.match(source, /cnnShapeParameterScenarios/)
  assert.match(source, /convParameterCount/)
  assert.match(source, /denseParameterCount/)
  assert.match(source, /outputHeight/)
  assert.match(source, /comparison/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/cnn-shape-parameter-challenge.test.ts`

Expected: FAIL because `src/components/CnnShapeParameterChallengeLab.vue` does not exist.

- [ ] **Step 3: Create the component**

Use `<script setup lang="ts">`, local bilingual copy, scenario buttons, labeled number inputs, comparison radio buttons, evidence cards, and feedback text. The component should keep state local:

```ts
const selectedScenarioId = ref<CnnShapeParameterScenarioId>('same-padding-rgb')
const prediction = ref<CnnShapeParameterPrediction>({
  outputHeight: 32,
  outputWidth: 32,
  outputChannels: 16,
  convParameterCount: 448,
  comparison: 'conv-fewer',
})
const snapshot = computed(() =>
  evaluateCnnShapeParameterChallenge({
    scenarioId: selectedScenarioId.value,
    prediction: prediction.value,
  }),
)
```

Reset prediction values when the scenario changes to a deliberately imperfect default for the selected scenario. Keep the learner action alive; do not auto-fill every correct answer after scenario changes.

- [ ] **Step 4: Add styles**

Add compact styles to `src/styles/views/algorithm-shell.css` using a `.cnn-shape-challenge` prefix. Include responsive rules under the existing mobile media query so controls stack cleanly at 390px.

- [ ] **Step 5: Run component source test**

Run: `node --test tests/cnn-shape-parameter-challenge.test.ts`

Expected: PASS for helper and component source assertions.

- [ ] **Step 6: Commit**

```bash
git add src/components/CnnShapeParameterChallengeLab.vue src/styles/views/algorithm-shell.css tests/cnn-shape-parameter-challenge.test.ts
git commit -m "feat: add cnn shape parameter challenge lab"
```

### Task 3: CNN Chapter Wiring

**Files:**
- Modify: `src/views/AlgorithmView.vue`
- Optionally modify: `src/data/cnnVisualizationModule.ts`
- Test: `tests/cnn-shape-parameter-challenge.test.ts`

**Interfaces:**
- Consumes: `CnnShapeParameterChallengeLab`.
- Produces: rendering only when `isCnnVisualizationPage && section.id === 'channels-feature-maps'`.

- [ ] **Step 1: Add failing wiring test**

```ts
test('cnn shape parameter challenge is wired only into the CNN feature-map chapter', () => {
  const algorithmViewSource = read('src/views/AlgorithmView.vue')

  assert.match(algorithmViewSource, /import CnnShapeParameterChallengeLab/)
  assert.match(algorithmViewSource, /<CnnShapeParameterChallengeLab/)
  assert.match(algorithmViewSource, /section\.id === 'channels-feature-maps'/)
  assert.match(algorithmViewSource, /<CnnExplainerLab/)
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/cnn-shape-parameter-challenge.test.ts`

Expected: FAIL because the component is not imported or rendered.

- [ ] **Step 3: Wire the component**

In `src/views/AlgorithmView.vue`, import the component near the other algorithm components:

```ts
import CnnShapeParameterChallengeLab from '../components/CnnShapeParameterChallengeLab.vue'
```

Render it before `CnnExplainerLab` in the workflow-story section:

```vue
<CnnShapeParameterChallengeLab
  v-if="isCnnVisualizationPage && section.id === 'channels-feature-maps'"
  :accent="moduleDefinition.accent"
/>
<CnnExplainerLab v-if="isCnnVisualizationPage && section.id === activeChapter" :section="section" />
```

- [ ] **Step 4: Optionally tune chapter prompt**

If the implementation feels disconnected from the chapter copy, edit only the `channels-feature-maps` experiment prompt in `src/data/cnnVisualizationModule.ts` to mention predicting output shape and parameter count before checking the lab.

- [ ] **Step 5: Run wiring test**

Run: `node --test tests/cnn-shape-parameter-challenge.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/views/AlgorithmView.vue src/data/cnnVisualizationModule.ts tests/cnn-shape-parameter-challenge.test.ts
git commit -m "feat: wire cnn shape challenge into lesson"
```

### Task 4: Verification, Browser Check, And Summary

**Files:**
- Create: `docs/refactor/summaries/phase-19.md`
- Modify: `.planning/STATE.md`

**Interfaces:**
- Produces: implementation summary and current-state update.

- [ ] **Step 1: Run targeted tests**

Run:

```bash
node --test tests/cnn-shape-parameter-challenge.test.ts tests/cnn-explainer.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full tests and builds**

Run:

```bash
npm test
npm run build
npm run build:pages
```

Expected: PASS, with only the existing Vite large-chunk warning if it still appears.

- [ ] **Step 3: Run browser checks**

Start dev server:

```bash
npm run dev -- --host 127.0.0.1
```

Check `/learn/cnn-visualization/channels-feature-maps` at desktop and 390px mobile. Expected:

- no console errors;
- no horizontal overflow;
- challenge appears before or alongside the existing CNN explainer without hiding it;
- changing scenario and prediction inputs updates formula evidence and feedback.

- [ ] **Step 4: Write summary**

Create `docs/refactor/summaries/phase-19.md` with:

- delivered helper/component/wiring;
- verification commands;
- self-review on overdesign and implementation quality;
- explicit non-goals preserved.

- [ ] **Step 5: Commit**

```bash
git add docs/refactor/summaries/phase-19.md .planning/STATE.md
git commit -m "docs: summarize phase 19 cnn challenge"
```
