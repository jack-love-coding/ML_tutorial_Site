---
phase: 27-linear-regression-rebuild
plan: "10"
subsystem: linear-regression-workbench
tags:
  - vue
  - typescript
  - package-backed-selectors
  - browser-qa
  - bilingual
requires:
  - phase: 27-09
    provides: Strict four-file workbench package, pure selectors, and audited compact baseline
provides:
  - Six visible, exact package-backed workbench results with stable aria-live hooks
  - Exact bilingual Phase 28 bridge to the existing housing-price project
  - Machine-readable 36-case browser contract with four semantic interaction records and eight failure injections
affects:
  - 27-11
  - phase-28-housing-project
tech-stack:
  added: []
  patterns:
    - One abortable Promise.all load for four registered base-safe local assets
    - Pure selector-driven Vue readouts with fail-closed compact fallback
    - Semantic browser assertions against stable data-testid output hooks
key-files:
  created: []
  modified:
    - src/components/LinearRegressionLessonLab.vue
    - src/components/LinearRegressionPagedLesson.vue
    - scripts/qa/linearRegressionBrowserMatrix.js
    - tests/linear-regression-labs.test.mjs
    - tests/linear-regression-release.test.mjs
key-decisions:
  - Keep Plan 27-09 selectors as the sole numerical authority and render their results without Vue-owned fitting or metric calculations.
  - Disable complete-row controls until all four registered outputs parse and cross-file package validation succeeds.
  - Preserve the existing housing-price-project route while explicitly identifying its V3 target as project-tabular-regression in release contracts.
  - Emit exactly four locale/viewport interaction records, each with the same six semantic booleans, plus exactly eight failure-injection records for Plan 27-11.
requirements-completed:
  - LINR-01
  - LINR-02
  - LINR-03
  - LINR-04
metrics:
  duration: 20m
  completed: 2026-07-30
  tasks: 2
  files: 5
status: complete
---

# Phase 27 Plan 10: Exact Semantic Workbench and Phase 28 Bridge Summary

All six linear-regression controls now change exact visible results selected from the strict published four-file package, with a bilingual housing-project handoff and a machine-readable semantic browser contract ready for Plan 27-11.

## Performance

- **Duration:** 20 minutes
- **Started:** 2026-07-30T08:00:00Z
- **Completed:** 2026-07-30T08:20:03Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments

- Replaced the summary-only lab state with one fail-closed workbench state that concurrently loads the registered summary, GD trace, coefficient table, and held-out residual table through `withPublicBase`, strict parsers, and one abort lifecycle.
- Connected row/batch, GD step, method, coefficient space, named held-out case, and atemp controls to six stable `aria-live` panels backed exclusively by Plan 27-09 selectors.
- Added understandable bilingual loading/invalid states and an audited compact fallback while disabling controls that require unavailable complete rows.
- Replaced the logistic-regression bridge with the exact bilingual Phase 28 handoff to `/learn/housing-price-project`.
- Strengthened the browser matrix to retain 36 route cases while producing exactly four semantic interaction records, six booleans per interaction, and eight fail-closed injection records.

## Task Commits

Each task followed the required RED/GREEN sequence:

1. **Task 27-10-01: Make all six lab controls change exact teaching results**
   - `0b65d19` — `test(27-10): add failing semantic workbench contracts`
   - `83afd7d` — `feat(27-10): wire exact package-backed workbench outputs`
2. **Task 27-10-02: Lock the Phase 28 bridge and semantic browser contract**
   - `aded6b1` — `test(27-10): add failing bridge and semantic matrix contracts`
   - `b073489` — `feat(27-10): lock semantic browser matrix and Phase 28 bridge`

## Files Created/Modified

- `src/components/LinearRegressionLessonLab.vue` — Loads and validates the complete local package, drives all six selector-backed outputs, and renders resettable bilingual results.
- `src/components/LinearRegressionPagedLesson.vue` — Publishes the exact Phase 28 housing-project bridge and copy.
- `scripts/qa/linearRegressionBrowserMatrix.js` — Exercises every control option and emits exact semantic/count contracts for the next QA plan.
- `tests/linear-regression-labs.test.mjs` — Activates the six control/output, package-load, fallback, and accessibility contracts.
- `tests/linear-regression-release.test.mjs` — Locks the bridge, V3 project mapping, semantic hooks, exact record counts, and workbench release scope.

## Decisions Made

- The component owns only state composition and presentation; all numerical selection remains in `linearRegressionWorkbench.ts`.
- A partial asset load never enables the workbench. All four outputs must parse and pass package consistency checks first.
- The compact fallback exposes only cross-authority-tested representative facts, never full metrics or locally invented substitutes.
- The Phase 28 bridge uses the existing canonical route instead of adding a route or module identity.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Bug] Removed duplicated batch-count literals from the component contract**

- **Found during:** Task 27-10-01 GREEN verification
- **Issue:** A new source test required `13,903` and `3,476` to be duplicated literally inside the Vue component, which would create a second numerical authority.
- **Fix:** The test now verifies rendering of `selectedRowBatchResult.trainRows`, `testRows`, and `featureOrder.length`; exact values remain locked by the Plan 27-09 selector tests.
- **Files modified:** `tests/linear-regression-labs.test.mjs`
- **Commit:** `83afd7d`

**2. [Rule 3 - Blocking] Exposed the existing safe scenario computation to the rendered shell**

- **Found during:** Task 27-10-01 production build
- **Issue:** TypeScript rejected the computed scenario as unused after the workbench refactor.
- **Fix:** Added the presentation-only `data-scenario` attribute to the existing workbench root.
- **Files modified:** `src/components/LinearRegressionLessonLab.vue`
- **Commit:** `83afd7d`

## Authentication Gates

None.

## Known Stubs

None. Empty arrays and objects in the browser QA script are runtime result collectors, not learner-facing placeholders.

## Threat Surface

No new endpoint, authentication path, file-write path, schema boundary, remote runtime dependency, or raw HTML surface was introduced. All runtime assets remain registered local public files resolved through the existing base-safe helper.

## Verification

- `node --test tests/linear-regression-labs.test.mjs tests/linear-regression-authority.test.ts tests/linear-regression-assets.test.ts` — 34/34 passed.
- `npm run build` — passed (`vue-tsc -b` and Vite production build); only the repository's existing large-chunk advisory was reported.
- `node --test tests/linear-regression-labs.test.mjs tests/linear-regression-release.test.mjs tests/linear-regression-layout.test.mjs tests/python-and-housing-modules.test.mjs` — 48/48 passed.
- `node --check scripts/qa/linearRegressionBrowserMatrix.js` — passed.
- Protected baseline hashes remained unchanged:
  - `.planning/config.json`: `a30166790b1080df599345c645cd3b38a797d2c8f9ce42bad32075f76d4e958a`
  - `docs/gpt_advice.md`: `31958b9a46fe97c6770228109d47594846ab26b3cdeed4be9bcb3b9d9b729f86`

## TDD Gate Compliance

- RED commit present before Task 1 GREEN: `0b65d19` → `83afd7d`.
- RED commit present before Task 2 GREEN: `aded6b1` → `b073489`.

## Next Phase Readiness

Plan 27-11 can execute the committed browser matrix against a production preview and consume the exact interaction and failure-injection records without inferring semantic success from control labels.

## Self-Check: PASSED

- All five modified implementation/test/QA files and this summary exist.
- All four RED/GREEN task commits are present in git history.
- Summary status and recorded verification totals match the completed checks.
