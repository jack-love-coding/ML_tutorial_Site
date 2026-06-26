# Phase 8 Summary: Optimization Evidence and Task Loop

**Date:** 2026-06-26
**Branches:** `codex/phase-8-optimization-learning`, `codex/phase-8b-optimization-tasks`
**Status:** Phase 8A opened for review; Phase 8B implemented on a stacked branch

## Phase 8A Goal

Make the optimization/calculus lab line produce durable learning evidence instead of only live page-level checkpoint context.

## Phase 8A Delivered

- Added Progress V2 lab evidence records with localized summary, metrics, prompt, source, module, lab source, and capture timestamp.
- Added `recordLearningProgressLabEvidence()` to upsert the latest evidence per source/module/lab instead of appending unbounded slider-change records.
- Wired `MathLabModulePage.vue` so `ExperimentEvidence` emitted by labs is saved into Progress V2.
- Added a recent experiment evidence section to `/progress`.
- Kept existing Math Lab checkpoint report drafts and v1 progress stores intact.

## Phase 8B Delivered

- Added optional `LabTaskConfig` with localized prediction and reflection prompts.
- Added Progress V2 task records for prediction, explanation, completion state, and saved timestamp.
- Preserved saved task records when later lab control changes refresh the same evidence metrics.
- Added `LabTaskCard.vue` and wired it into Math Lab module lab placements.
- Added task prompts to:
  - `calculus-partial-derivatives-gradients`
  - `calculus-sgd-batch-noise`
  - `calculus-optimizer-comparison`
- Added `/progress` evidence status chips for observation, explanation, and checkpoint completion.

## Verification

| Command / Check | Result | Notes |
| --- | --- | --- |
| `node --test tests/curriculumProgress.test.ts tests/math-lab-core.test.ts tests/math-lab-layout.test.mjs` | Pass | Progress V2 task persistence, Math Lab task contracts, and page wiring. |
| `npm test` | Pass | 240 tests. |
| `npm run build` | Pass | Existing Vite large-chunk warning remains. |
| `npm run build:pages` | Pass | Existing Vite large-chunk warning remains. |
| Browser walkthrough | Pass | Saved SGD batch-noise task, verified `/progress` task statuses, desktop and 390px mobile overflow checks, 0 console errors. |

## Remaining Risks

- LessonPage pilot protocol evidence is still prompted but not persisted.
- Progress V2 evidence currently stores the latest record per lab, not a full historical timeline.
- Data Lab and Algorithm custom labs are not yet emitting unified Progress V2 evidence in this slice.
- Phase 8B is stacked on Phase 8A until the evidence persistence PR is merged.
