# CNN Shape/Parameter Challenge Design

**Date:** 2026-07-08
**Status:** Draft for review.
**Authoritative refactor design:** `docs/refactor/designs/phase-19-cnn-shape-parameter-challenge.md`

## Problem

`cnn-visualization` explains output shapes, feature maps, and parameter sharing, but it does not yet require the learner to complete one active task that connects a `Conv2d(...)` code line to output tensor shape, convolution parameter count, and dense-layer comparison.

Phase 18 confirmed that the route is already coherent:

```txt
optimizer-comparison -> tensor-shapes-vectorization -> cnn-visualization
```

So the next step is not a new transition module. It is a narrow CNN content-quality task.

## Desired Outcome

A learner can answer:

> Given this `Conv2d` configuration, what shape comes out, how many parameters are trained, and why does convolution use far fewer parameters than a dense layer reading the same image?

## Scope

Build a `CnnShapeParameterChallengeLab` in the implementation phase.

The lab will:

- show one of three fixed scenarios;
- ask for output height, width, channels, and convolution parameter count before revealing evidence;
- compare convolution parameters with a dense layer that maps the flattened input image to the same output tensor;
- reveal formula evidence and short bilingual feedback;
- live near `cnn-visualization` chapter `channels-feature-maps`;
- avoid persistence, backend, database, project-readiness, route rewrites, and broad lesson migration.

## Architecture

Use one deterministic helper:

```txt
src/simulations/cnnShapeParameterChallenge.ts
```

The helper imports the existing CNN output-size logic from:

```txt
src/utils/cnnExplainer.ts
```

Render one Vue component:

```txt
src/components/CnnShapeParameterChallengeLab.vue
```

Wire it directly in:

```txt
src/views/AlgorithmView.vue
```

Do not wire this through `AppliedWorkflowLessonLab.vue`; CNN currently uses `CnnExplainerLab` directly.

## Requirements

- Support scenarios:
  - `32 x 32 x 3`, `Conv2d(3, 16, kernel_size=3, padding=1, stride=1)`, output `32 x 32 x 16`, conv params `448`, dense params `50,348,032`.
  - `28 x 28 x 1`, `Conv2d(1, 8, kernel_size=5, padding=0, stride=1)`, output `24 x 24 x 8`, conv params `208`, dense params `3,617,280`.
  - `64 x 64 x 3`, `Conv2d(3, 32, kernel_size=3, padding=1, stride=2)`, output `32 x 32 x 32`, conv params `896`, dense params `402,685,952`.
- Check learner predictions against exact integer output shape and parameter count.
- Treat invalid prediction input as finite non-negative integers, not runtime errors.
- Use text labels for correctness and comparison results.
- Keep all UI copy bilingual in local component copy.
- Keep the existing CNN explainer intact.

## Rejected Alternatives

- **Upgrade `CnnExplainerLab` itself:** too risky and unnecessary; it is already large and well-covered.
- **Use `AppliedWorkflowLessonLab` CNN tabs:** not the active CNN runtime path.
- **Add durable progress evidence:** useful later, but the user explicitly wants teaching content quality first.
- **Create a new optimizer-to-CNN module:** Phase 18 showed the route already has `tensor-shapes-vectorization`.

## Acceptance Criteria

- Design and implementation stay focused on one challenge component and one deterministic helper.
- The challenge appears only for `cnn-visualization` `channels-feature-maps`.
- Tests cover helper math, invalid predictions, component source tokens, and route wiring.
- Runtime implementation passes targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks.

## Self-Review

- This spec has no backend, database, progress persistence, checklist system, route rewrite, or broad renderer migration.
- The learner action is measurable: predict shape, predict parameters, compare dense versus convolution, inspect evidence.
- The design reuses existing `calculateCnnOutputSize()` instead of duplicating shape math in Vue.
