# Phase 19: CNN Shape/Parameter Challenge Design

**Created:** 2026-07-08
**Status:** Draft for review.
**Branch:** `codex/phase-19-cnn-shape-parameter-challenge-design`

## Decision

Phase 19 should add one narrow required-core task inside `cnn-visualization`:

> Learners predict the output tensor shape and parameter count for a single `Conv2d` configuration, then compare the result with a dense layer that reads the same image.

The task belongs near the CNN `channels-feature-maps` chapter, with formula evidence from `padding-stride-shape`. It should not become a new CNN explainer, a progress checklist, or a route rewrite.

## Context

Phase 18 confirmed the required route is:

```txt
optimizer-comparison -> tensor-shapes-vectorization -> cnn-visualization
```

There is no missing transition module. `tensor-shapes-vectorization` already carries the shape-literacy bridge. The remaining gap is inside CNN itself: current content explains shape and parameter sharing, and checkpoints mention both, but the learner does not complete a compact prediction/evidence task that ties together:

- input image shape;
- kernel size;
- padding;
- stride;
- input channels;
- output filters;
- `Conv2d(...)` code;
- output tensor shape;
- convolution parameter count;
- dense-layer parameter count for the same output tensor.

## Existing Evidence

- `src/data/cnnVisualizationModule.ts` already teaches `H x W x C`, kernel convolution, padding/stride shape, channels, feature maps, pooling, classifier head, and transfer learning.
- `src/utils/cnnExplainer.ts` already exposes `calculateCnnOutputSize()` and `buildCnnHyperparameterSnapshot()`.
- `tests/cnn-explainer.test.ts` verifies output-size helpers, shape summaries, receptive-field tracing, and the rich browser-local CNN explainer.
- `src/views/AlgorithmView.vue` renders `CnnExplainerLab` directly for CNN chapters. The CNN branch inside `AppliedWorkflowLessonLab.vue` is not the active runtime surface for `cnn-visualization`.

## Goals

1. Turn CNN shape and parameter reasoning into an active learner task, not another static explanation.
2. Reuse the existing CNN output-size helper instead of duplicating formula logic in Vue.
3. Keep the task small enough to implement, test, and review independently.
4. Preserve the current CNN explainer and all legacy routes/checkpoints.
5. Avoid backend, database, durable progress, project readiness, new course inventory, route rewrites, and bulk LessonPage migration.

## Non-Goals

- Do not replace or substantially redesign `CnnExplainerLab.vue`.
- Do not move `cnn-visualization` into `LessonPage` in this phase.
- Do not create a general lab registry for every workflow page.
- Do not add persisted scoring, accounts, or progress evidence.
- Do not add a new module between optimizer and CNN.
- Do not teach full convolution arithmetic for dilation, groups, depthwise convolution, or transposed convolution.

## Teaching Contract

The learner question:

> Given this `Conv2d` line, what tensor shape comes out, how many trainable parameters does the convolution use, and why is that much smaller than a dense layer reading the same image?

The task loop:

1. **Inspect:** Read one scenario with input shape and a PyTorch-style `Conv2d` code line.
2. **Predict:** Enter output height, width, channels, and convolution parameter count before seeing the answer.
3. **Compare:** Choose whether convolution or dense has fewer parameters for the same input and output tensor.
4. **Verify:** Reveal formula evidence for spatial size, convolution parameters, and dense-equivalent parameters.
5. **Explain:** Connect the result to local receptive fields and weight sharing.

## Required Math Depth

Spatial output formula for each direction:

```txt
out = floor((input + 2 * padding - kernel) / stride) + 1
```

Convolution parameter count:

```txt
convParams = kernelHeight * kernelWidth * inputChannels * outputChannels + outputChannels
```

Dense comparison for a layer that maps the flattened input image to the same output tensor:

```txt
inputUnits = inputHeight * inputWidth * inputChannels
outputUnits = outputHeight * outputWidth * outputChannels
denseParams = inputUnits * outputUnits + outputUnits
```

Use bias in all first-pass scenarios because the current CNN lesson already explains the `+ outputChannels` bias term.

## Scenarios

| Scenario | Input | Conv2d | Output | Conv params | Dense-equivalent params |
| --- | --- | --- | --- | --- | --- |
| Same padding RGB | `32 x 32 x 3` | `Conv2d(3, 16, kernel_size=3, padding=1, stride=1)` | `32 x 32 x 16` | `448` | `50,348,032` |
| Valid grayscale shrink | `28 x 28 x 1` | `Conv2d(1, 8, kernel_size=5, padding=0, stride=1)` | `24 x 24 x 8` | `208` | `3,617,280` |
| Stride downsample | `64 x 64 x 3` | `Conv2d(3, 32, kernel_size=3, padding=1, stride=2)` | `32 x 32 x 32` | `896` | `402,685,952` |

These three cases cover the learner-facing concepts already in the chapter: same padding, valid convolution shrinkage, stride downsampling, filters as output channels, and parameter sharing.

## Helper Contract

Create a deterministic helper in `src/simulations/cnnShapeParameterChallenge.ts`. It should import `calculateCnnOutputSize()` from `src/utils/cnnExplainer.ts`.

```ts
export type CnnShapeParameterScenarioId = 'same-padding-rgb' | 'valid-grayscale' | 'stride-downsample'
export type CnnParameterComparison = 'conv-fewer' | 'dense-fewer' | 'same'

export interface CnnShapeParameterPrediction {
  outputHeight: number
  outputWidth: number
  outputChannels: number
  convParameterCount: number
  comparison: CnnParameterComparison
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
```

Validation rules:

- Use safe defaults for unknown scenario IDs.
- Clamp learner numeric predictions to finite non-negative integers.
- Do not throw on `NaN`, `Infinity`, negative numbers, or decimal predictions.
- Keep the helper independent of Vue, DOM, D3, Three.js, TensorFlow, and browser APIs.

## Interaction Layout

Create `src/components/CnnShapeParameterChallengeLab.vue`.

Panels:

- Scenario selector with the three fixed cases above.
- Code card showing the `Conv2d(...)` line and input tensor.
- Prediction controls for output height, width, channels, and parameter count.
- Comparison control with three choices: convolution fewer, dense fewer, same.
- Evidence cards for spatial formula, convolution parameter formula, and dense comparison.
- Feedback panel that uses text labels as well as visual state.

The learner can change predictions at any time. There is no persistence and no required completion state in Phase 19.

## Wiring Choice

Do not wire this through `AppliedWorkflowLessonLab.vue`.

Reason: `AlgorithmView.vue` currently renders `CnnExplainerLab` directly for CNN chapters:

```vue
<CnnExplainerLab v-if="isCnnVisualizationPage && section.id === activeChapter" :section="section" />
<AppliedWorkflowLessonLab v-else-if="!isCnnVisualizationPage" :module-slug="slug" :section="section" />
```

Implementation should add the challenge directly beside the CNN explainer only for the `channels-feature-maps` chapter:

```vue
<CnnShapeParameterChallengeLab
  v-if="isCnnVisualizationPage && section.id === 'channels-feature-maps'"
  :accent="moduleDefinition.accent"
/>
<CnnExplainerLab v-if="isCnnVisualizationPage && section.id === activeChapter" :section="section" />
```

Rationale: the previous `padding-stride-shape` chapter teaches the formula, while `channels-feature-maps` introduces output channels and parameter count. The challenge becomes the learner's required application step.

## Styling And Accessibility

- Use existing algorithm shell styling patterns in `src/styles/views/algorithm-shell.css`.
- Keep stable grid dimensions for prediction controls and evidence cards.
- Use labels and explicit text for correctness; color is not the only signal.
- Ensure number inputs have labels and bounded values.
- Verify at desktop and 390px mobile widths.
- Keep reduced-motion behavior simple: no required animation.

## Files To Touch In Implementation

- Create `src/simulations/cnnShapeParameterChallenge.ts`.
- Create `src/components/CnnShapeParameterChallengeLab.vue`.
- Modify `src/views/AlgorithmView.vue`.
- Modify `src/styles/views/algorithm-shell.css`.
- Optionally modify `src/data/cnnVisualizationModule.ts` to make the `channels-feature-maps` experiment prompt point to the new prediction task.
- Add `tests/cnn-shape-parameter-challenge.test.ts`.
- Update `tests/deep-learning-extension-modules.test.mjs` only if source-token coverage should lock the new wiring.
- Update `.planning/STATE.md` and `docs/refactor/summaries/phase-19.md` after implementation.

## Acceptance Criteria

- The CNN `channels-feature-maps` chapter includes a prediction/evidence challenge.
- The task asks for output shape and convolution parameter count before revealing formula evidence.
- The task compares convolution with a dense layer reading the same image and producing the same output tensor.
- Core calculations are tested outside Vue.
- Existing `CnnExplainerLab` remains available and unchanged except for coexisting with the challenge.
- Existing spine, Topic Library roles, legacy routes, and checkpoint submissions remain intact.
- Runtime implementation PR runs targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks for `/learn/cnn-visualization/channels-feature-maps`.

## Self-Review

- **Overdesign check:** This design adds one helper and one component. It rejects a registry redesign, route rewrite, new transition module, persistent progress, and CNN explainer replacement.
- **Quality check:** The task has a concrete learner action and computed evidence. It is not a stage switcher.
- **Coverage check:** It directly addresses Phase 18's P1 gap: formula, code, output shape, convolution parameters, dense comparison, and parameter sharing.
- **Risk check:** The only runtime integration point should be one section-level conditional in `AlgorithmView.vue`; this keeps blast radius small.

## Proposed Implementation Sequence

1. Add failing helper tests for the three scenarios and invalid learner predictions.
2. Implement `cnnShapeParameterChallenge.ts` using `calculateCnnOutputSize()`.
3. Add source tests for component tokens and `AlgorithmView.vue` wiring.
4. Build `CnnShapeParameterChallengeLab.vue` with localized copy and prediction controls.
5. Add responsive styles.
6. Run targeted tests, full tests, builds, and browser checks.
