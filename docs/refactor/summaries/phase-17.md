# Phase 17 Summary: MLP Backprop Mechanism Bridge

**Date:** 2026-07-07
**Status:** Completed.

## Delivered

- Added `src/simulations/mlpBackpropBridge.ts`, a deterministic scalar one-hidden-unit MLP helper for:
  - forward values: `z1`, `h`, `yHat`, `error`, `loss`
  - local derivatives
  - gradients for `w1`, `b1`, `w2`, `b2`
  - parameter updates and update direction feedback
- Added `src/components/MlpBackpropBridgeLab.vue`, a compact prediction/evidence task with:
  - three fixed scenarios: prediction too high, prediction too low, saturated hidden unit
  - parameter selector for `w1`, `b1`, `w2`, `b2`
  - direction prediction controls: increase, decrease, nearly flat
  - forward-value cards, local derivative chain cards, and text feedback
- Wired the bridge into `src/views/AlgorithmView.vue` only for the MLP `backprop` lesson section.
- Added responsive styles in `src/styles/views/algorithm-shell.css`.
- Added `tests/mlp-backprop-bridge.test.ts` for helper math, prediction feedback, component source constraints, and lesson wiring.

## Result

The required MLP route now has a narrow in-lesson bridge that answers the learner question:

> If this tiny MLP prediction is too high or too low, which direction should a selected weight move, and what chain of local derivatives justifies that update?

The existing top-level `MlpPlaygroundCockpit` remains available. The new bridge does not replace the broader playground; it fills the missing required-core step between static backprop explanation and training dynamics.

## Scope Boundaries

- `matrix-calculus-autodiff` remains just-in-time support material.
- No full autodiff engine was added.
- No backend, database, account, or durable progress scope was added.
- No project-readiness checklist or new course inventory was added.
- No broad lab registry redesign or LessonPage bulk migration was added.
- No legacy routes or v1 progress stores were removed.

## Verification

Verification:

- `npm test`: pass, 270 tests before implementation baseline.
- `node --test tests/mlp-backprop-bridge.test.ts`: pass, 4 tests.
- `node --test tests/mlp-backprop-bridge.test.ts tests/mlp-workbench.test.mjs tests/lessonPagePilot.test.ts tests/curriculumRoles.test.ts`: pass, 16 tests.
- `node --test tests/mlp-backprop-bridge.test.ts tests/mlp-workbench.test.mjs tests/lessonPagePilot.test.ts tests/curriculumMilestoneAudit.test.ts`: pass, 18 tests.
- `npm test`: pass, 274 tests.
- `npm run build`: pass with existing Vite large-chunk warning.
- `npm run build:pages`: pass with existing Vite large-chunk warning.
- `git diff --check`: pass.
- Playwright `/learn/mlp/backprop`:
  - desktop 1280px: bridge renders, no horizontal overflow, console errors 0.
  - mobile 390px: no horizontal overflow, console errors 0.
  - changing the direction prediction updates feedback from correct to revision-needed.
