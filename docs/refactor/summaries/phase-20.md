# Phase 20 Summary: Optimizer Curve Diagnosis Challenge

**Date:** 2026-07-08
**Status:** Completed.

## Delivered

- Added `src/simulations/optimizerCurveDiagnosisChallenge.ts` with deterministic curve scenarios, evidence metrics, prediction normalization, and scoring.
- Added `src/components/OptimizerCurveDiagnosisChallengeLab.vue`.
- Wired the challenge into `optimizer-comparison` `curve-diagnosis` through `src/components/AppliedWorkflowLessonLab.vue`.
- Updated the optimizer curve-diagnosis lesson prompt to point learners at the challenge before reviewing the diagnose stage.
- Added `tests/optimizer-curve-diagnosis-challenge.test.ts`.
- Updated `tests/curriculumMilestoneAudit.test.ts`.

## Teaching Outcome

Learners now inspect a fixed training curve, choose the most likely optimizer issue, choose the next single-variable experiment, and explicitly reveal computed evidence before reading feedback.

Covered scenarios:

- learning-rate divergence;
- small-batch gradient noise;
- ravine zig-zag that benefits from momentum or adaptive state;
- schedule plateau under constant learning rate.

## Self-Review

- **Overdesign check:** The implementation stayed at one helper, one component, one section-level wiring point, and focused tests.
- **Scope check:** No backend, database, account, durable progress behavior, project-readiness checklist, new optimizer module, broad simulator, route rewrite, or `LessonPage` migration was added.
- **Teaching quality check:** Evidence is gated behind an explicit check action so learners predict before seeing computed metrics and feedback.
- **Bilingual check:** A final self-review fixed the challenge setup note so the Chinese UI no longer exposes English-only scenario metadata.
- **Maintainability check:** Evidence calculations live in `src/simulations/`, while Vue only manages local state and presentation.

## Verification

- `node --test tests/optimizer-curve-diagnosis-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 12 tests.
- `npm test`: pass, 282 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- Playwright desktop and 390px mobile checks on `/learn/optimizer-comparison/curve-diagnosis`: no horizontal overflow, console errors 0, challenge and existing optimizer stage explanation both render.
