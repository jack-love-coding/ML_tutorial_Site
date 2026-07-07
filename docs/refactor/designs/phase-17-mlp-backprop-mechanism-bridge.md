# Phase 17: MLP Backprop Mechanism Bridge Design

**Created:** 2026-07-07
**Status:** Draft for review.
**Branch:** `codex/phase-17-mlp-backprop-bridge-design`

## Decision

Phase 17 uses the user's selected depth **B**:

> Learners should understand chain rule and computation-graph backpropagation, but should not be required to hand-derive complex matrix calculus.

This means `matrix-calculus-autodiff` remains a just-in-time support lens. It is not promoted into the required spine as a long mandatory math detour. The required route will instead add a compact MLP bridge that makes one small computation graph visible:

`input -> hidden preactivation -> hidden activation -> output -> loss -> local gradients -> parameter update`

## Problem

Phase 15 found that the neural-network stage currently names backpropagation and optimizer state, but required modules are only `mlp` and `optimizer-comparison`. Phase 16 made roles explicit, but it did not resolve the teaching-depth question.

Current MLP content is good but still leaves a route-level ambiguity:

- `src/data/mlpModule.ts` already has a `backprop` chapter, source references, visual assets, and a Manim video.
- `src/components/MlpPlaygroundCockpit.vue` exposes loss, gradient norm, weights, and training dynamics.
- `src/modules/math-lab/data/aiBridgeModules.ts` has the deeper `matrix-calculus-autodiff` support module.
- The missing piece is a constrained required-core task where the learner predicts and verifies why one weight increases or decreases.

## Goals

1. Make the required MLP route explain how a loss signal reaches earlier weights through local derivatives.
2. Keep full autodiff, VJP/JVP, Jacobian, and gradient checking in the Math Lab support module.
3. Add one narrow prediction/evidence task near the MLP `backprop` chapter.
4. Use deterministic helper logic so formula, UI, and tests agree.
5. Avoid adding backend, database, durable progress scope, project readiness mechanics, new modules, or bulk LessonPage migration.

## Non-Goals

- Do not promote `matrix-calculus-autodiff` into required core in Phase 17.
- Do not build a full autodiff engine.
- Do not teach Jacobian matrices, Hessians, VJP/JVP internals, or framework implementation details in the required path.
- Do not replace the existing MLP Playground cockpit.
- Do not add Progress V2 task persistence or checklist state.
- Do not migrate all algorithm lessons into a new renderer pattern.

## Teaching Contract

The learner question:

> If this tiny MLP prediction is too high or too low, which direction should a selected weight move, and what chain of local derivatives justifies that update?

The task loop:

1. **Inspect:** See one scalar example with fixed `x`, `target`, `w1`, `b1`, `w2`, `b2`, and `learningRate`.
2. **Predict:** Choose whether `w1`, `b1`, `w2`, or `b2` should increase, decrease, or stay nearly unchanged.
3. **Trace:** Read the forward values and local derivatives.
4. **Verify:** Compare the predicted sign with the computed gradient and update.
5. **Explain:** Connect `loss -> output error -> hidden signal -> activation derivative -> earlier weight update`.

## Required Depth

Use a scalar one-hidden-unit network:

```txt
z1 = w1 * x + b1
h = tanh(z1)
yHat = w2 * h + b2
loss = 0.5 * (yHat - target)^2
```

Backprop chain:

```txt
dLoss/dYHat = yHat - target
dLoss/dW2 = dLoss/dYHat * h
dLoss/dB2 = dLoss/dYHat
dLoss/dH = dLoss/dYHat * w2
dH/dZ1 = 1 - h^2
dLoss/dZ1 = dLoss/dH * dH/dZ1
dLoss/dW1 = dLoss/dZ1 * x
dLoss/dB1 = dLoss/dZ1
nextParam = param - learningRate * gradient
```

This is enough for the required route. The Math Lab support module remains responsible for local linearization, vector-Jacobian products, finite-difference checks, and numerical/autodiff failure modes.

## Proposed Helper Contract

Create a deterministic helper in the implementation phase.

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
  forward: {
    z1: number
    h: number
    yHat: number
    error: number
    loss: number
  }
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
```

Validation rules:

- Clamp or normalize NaN/Infinity inputs to safe defaults.
- Treat `Math.abs(updateDelta) < 1e-8` as `flat`.
- Keep all calculations independent of DOM, D3, Three.js, and Vue.

## Interaction Layout

Add `MlpBackpropBridgeLab.vue` near the MLP `backprop` chapter.

Panels:

- Scenario selector with 3 fixed cases:
  - prediction too high
  - prediction too low
  - saturated hidden unit
- Parameter selector: `w1`, `b1`, `w2`, `b2`.
- Prediction buttons: increase, decrease, flat.
- Forward-pass cards: `z1`, `h`, `yHat`, `loss`.
- Backward-chain strip: upstream error, local derivative, gradient, update.
- Feedback panel explaining why the predicted sign matches or fails.

UI constraints:

- Use text labels for direction and correctness; do not rely on color alone.
- Keep formula tokens consistent with `src/data/mlpModule.ts`: `x`, `z1`, `h`, `yHat`, `loss`, `w1`, `b1`, `w2`, `b2`.
- Use existing algorithm/lesson styling patterns. Add narrow styles to `src/styles/views/algorithm-shell.css` unless a more local MLP style section already exists.
- Verify at 390px mobile width.

## Wiring Choice

Do not introduce a multi-lab registry system in Phase 17.

Implementation should keep the existing top-level MLP Playground cockpit and add one direct section-level conditional in `AlgorithmView.vue`:

```vue
<MlpBackpropBridgeLab
  v-if="isMlpPage && section.id === 'backprop'"
  :accent="moduleDefinition.accent"
/>
```

Rationale: this is one narrow bridge for one existing LessonPage pilot. A registry redesign would be premature.

## Files To Touch In Implementation

- Create `src/simulations/mlpBackpropBridge.ts`
  - Deterministic scalar forward/backward/update helper.
- Create `src/components/MlpBackpropBridgeLab.vue`
  - Narrow prediction/evidence task.
- Modify `src/views/AlgorithmView.vue`
  - Import and render the bridge only for MLP `backprop`.
- Modify `src/styles/views/algorithm-shell.css`
  - Add compact responsive styles for the bridge.
- Modify `src/data/mlpModule.ts`
  - Add one bridge sentence in the `backprop` experiment prompt only if needed.
- Test `tests/mlp-backprop-bridge.test.ts`
  - Helper math, prediction feedback, source wiring, and no broad route regression.
- Update docs:
  - `docs/refactor/summaries/phase-17.md`
  - `.planning/STATE.md`

## Acceptance Criteria

- The required neural-network stage no longer depends on support-only Math Lab material to explain basic backprop.
- `matrix-calculus-autodiff` remains `just-in-time-support`.
- The MLP backprop chapter includes one prediction/evidence task.
- Learner can inspect a wrong prediction and see which local derivative changes the update direction.
- Core logic is tested outside Vue.
- Existing MLP cockpit remains available.
- Existing spine, Topic Library roles, legacy routes, and checkpoint submissions remain intact.
- `npm test`, `npm run build`, and `npm run build:pages` pass for the implementation PR.

## Proposed Implementation Sequence

1. Add failing helper tests for scalar forward/backward/update values.
2. Implement `mlpBackpropBridge.ts`.
3. Add failing tests for `AlgorithmView.vue` wiring and component source tokens.
4. Create `MlpBackpropBridgeLab.vue` and render it in the MLP `backprop` section.
5. Add responsive styles.
6. Run targeted tests, full tests, builds, and browser checks.

## Verification For This Design PR

This design PR is docs-only except planning/test invariants. Required checks:

- `node --test tests/curriculumMilestoneAudit.test.ts`
- `git diff --check`
