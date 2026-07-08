# Phase 19 Summary: CNN Shape/Parameter Challenge

**Date:** 2026-07-08
**Status:** Completed.

## Delivered

- Added `src/simulations/cnnShapeParameterChallenge.ts`.
  - Computes CNN output shape through the existing `calculateCnnOutputSize()` helper.
  - Computes convolution parameter count and dense-equivalent parameter count.
  - Scores learner predictions for output shape, output channels, parameter count, and comparison.
- Added `src/components/CnnShapeParameterChallengeLab.vue`.
  - Presents three fixed scenarios: same-padding RGB, valid grayscale shrink, and stride downsampling.
  - Asks learners to predict output shape and parameter count before reading formula evidence.
  - Shows dense-vs-convolution comparison evidence and text feedback.
- Wired the challenge into `src/views/AlgorithmView.vue` only for:
  - `cnn-visualization`
  - `channels-feature-maps`
- Updated `src/data/cnnVisualizationModule.ts` so the feature-map prompt points to the prediction task.
- Added `tests/cnn-shape-parameter-challenge.test.ts`.

## Decision

Phase 19 stayed narrow:

- one deterministic helper;
- one local component;
- one section-level wiring point;
- one focused source/math test file.

It did not replace `CnnExplainerLab`, did not add a new route, and did not use the inactive CNN branch inside `AppliedWorkflowLessonLab.vue`.

## Self-Review

### Overdesign Check

No broad lab registry, backend, progress persistence, route rewrite, new course inventory, or CNN explainer redesign was added. The implementation is scoped to the exact content gap from Phase 18.

### Quality Check

The task is not another stage switcher. Learners must enter predictions, compare against computed evidence, and connect the result to local receptive fields and parameter sharing.

### Residual Risk

The component is intentionally local-state only. When the project later returns to backend/database-backed progress evidence, this lab can emit evidence into Progress V2, but that was deliberately outside Phase 19.

## Verification

- `node --test tests/cnn-shape-parameter-challenge.test.ts`: pass, 5 tests.
- `node --test tests/cnn-shape-parameter-challenge.test.ts tests/cnn-explainer.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 18 tests.
- `npm test`: pass, 279 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- Playwright desktop check on `/learn/cnn-visualization/channels-feature-maps`:
  - challenge renders;
  - existing `CnnExplainerLab` remains present;
  - prediction edits update feedback to all-correct;
  - `scrollWidth === clientWidth`;
  - console errors: 0.
- Playwright 390px mobile check:
  - challenge renders;
  - existing `CnnExplainerLab` remains present;
  - scenario cards stack to one column;
  - `scrollWidth === clientWidth`;
  - console errors: 0.

## Next Direction

The next required-core teaching-quality slice should likely return to `optimizer-comparison` with a narrow curve-diagnosis challenge:

- show one controlled training curve pattern;
- ask learners to predict the likely issue;
- choose the next single-variable experiment;
- reveal evidence tied to learning rate, batch noise, momentum/adaptive behavior, or schedule.

Keep backend, database, durable progress, project readiness, and broad route migration out of that phase unless explicitly requested.
