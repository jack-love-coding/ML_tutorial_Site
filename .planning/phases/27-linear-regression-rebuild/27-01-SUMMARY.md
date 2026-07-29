---
phase: 27-linear-regression-rebuild
plan: "01"
subsystem: simulation
tags: [typescript, linear-regression, bike-sharing, gradient-descent, diagnostics]

requires:
  - phase: 26-loss-functions-rebuild
    provides: finite-input guards, immutable numerical results, and residual/loss conventions
provides:
  - Pure Bike Sharing regression authority for prediction, metrics, gradients, bounded GD, coefficient conversion, and diagnostics
  - Locked Phase 27 split, preprocessing, method-agreement, fit, and held-out diagnostic anchors
  - Stable simulation facade that stages optimizer completion before model-limit diagnosis
affects: [27-linear-regression-rebuild, linear-regression-content, linear-regression-labs, linear-regression-assets]

tech-stack:
  added: []
  patterns:
    - DOM-free numerical authority with strict finite/order/size guards and immutable outputs
    - Stable facade delegates calculation and flattens chart-ready diagnostics into TrainingSnapshot metrics

key-files:
  created:
    - src/simulations/linearRegressionBike.ts
    - tests/linear-regression-math.test.ts
  modified:
    - src/simulations/linearRegression.ts
    - tests/linear-regression-simulation.test.ts

key-decisions:
  - "Represent every model row with an explicit featureOrder plus values so wrong order and leakage columns fail closed at runtime."
  - "Keep generic bounded batch GD separate from the locked full-data Bike fit constants; browser replay does not pretend to refit the full dataset."
  - "Expose staged diagnostics as typed scalar and array fields compatible with the existing TrainingSnapshot contract."
  - "Preserve fitDiagnostics as a Bike-only same-case compatibility adapter while removing California authority and the custom linear solver."

patterns-established:
  - "Numerical authority: calculations, finite guards, immutable copies, and locked anchors live in linearRegressionBike.ts."
  - "Facade composition: simulateLinearRegression preserves scenario IDs and snapshot shapes without duplicating formulas."

requirements-completed: [LINR-01, LINR-02, LINR-03, LINR-04]

coverage:
  - id: D1
    description: "Canonical Bike regression math connects row and batch prediction, prediction-minus-actual residuals, MSE/MAE/R2, analytical gradients, finite differences, and coefficient conversion."
    requirement: LINR-01
    verification:
      - kind: unit
        ref: "node --test tests/linear-regression-math.test.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: "Zero-initialized bounded batch GD and locked 772-update Bike fit/method-agreement anchors are deterministic and finite."
    requirement: LINR-02
    verification:
      - kind: unit
        ref: "tests/linear-regression-math.test.ts#GD and locked Bike anchors"
        status: pass
    human_judgment: false
  - id: D3
    description: "Normal-equation, gradient-descent, and scikit-learn results share a 1e-6 agreement gate and one feature/intercept contract."
    requirement: LINR-03
    verification:
      - kind: unit
        ref: "tests/linear-regression-math.test.ts#split and locked Bike GD anchors"
        status: pass
    human_judgment: false
  - id: D4
    description: "Stable facade presents optimizer completion before hourly residual, prediction-spread, coefficient-stability, named-case, log1p, and combined-review stages."
    requirement: LINR-04
    verification:
      - kind: integration
        ref: "tests/linear-regression-simulation.test.ts#optimizer completion precedes Bike diagnostic interpretation"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false

duration: 17min
completed: 2026-07-29
status: complete
---

# Phase 27 Plan 01: Bike Regression Numerical Authority Summary

**A guarded Bike Sharing numerical authority now drives deterministic fitting and staged held-out diagnostics through the existing linear-regression simulation facade.**

## Performance

- **Duration:** 17 min
- **Started:** 2026-07-29T10:29:24Z
- **Completed:** 2026-07-29T10:46:03Z
- **Tasks:** 3
- **Files modified:** 4

## Accomplishments

- Locked the exact five-feature order, chronological 13,903/3,476 split, train-only population statistics, residual sign, model coefficients, metrics, 772-update stop, and 1e-6 method tolerance.
- Added pure guarded row/batch prediction, MSE/MAE/R2, analytical gradients, batch steps, bounded GD, coefficient conversion, method comparison, and held-out diagnostic composition.
- Replaced the synthetic/California calculation facade with one Bike Sharing adapter while preserving `simulateLinearRegression`, all six scenario IDs, snapshot shapes, and legacy fit-diagnostic rendering.
- Added staged same-case diagnostics for hourly residual shape, demand-dependent spread, `atemp` coefficient instability, Ridge/Lasso objective separation, named held-out cases, and log1p scale meaning.

## Task Commits

Each task was committed atomically:

1. **Task 27-01-01: Establish Wave 0 numerical and Bike diagnostic contracts** - `14c3787` (test)
2. **Task 27-01-02: Implement guarded row-to-batch regression math and deterministic fitting** - `a62cf2e` (feat)
3. **Task 27-01-03: Compose Bike diagnostics behind the stable simulation facade** - `fa9ae5e` (feat)
4. **Task 27-01-03 compatibility fix: Preserve Bike fit diagnostic shape** - `846c495` (fix)

## Files Created/Modified

- `src/simulations/linearRegressionBike.ts` - Pure Bike regression types, constants, guards, calculations, fitting replay, and diagnostics.
- `src/simulations/linearRegression.ts` - Stable Bike-backed snapshot facade and compatibility adapters.
- `tests/linear-regression-math.test.ts` - Formula, finite-difference, guard, split, anchor, fitting, conversion, and diagnostic contracts.
- `tests/linear-regression-simulation.test.ts` - Facade compatibility, Bike-only authority, and staged-diagnostic assertions.

## Decisions Made

- Explicit row feature-order metadata is required at every pure-math boundary; width alone cannot detect reordered or leaked columns.
- The browser owns bounded generic calculation and locked-result replay, while later executed assets remain responsible for the complete full-data fit.
- `workingday` remains binary in both transformation and coefficient conversion; only `temp`, `hum`, `windspeed`, and `hr` use stored training statistics.
- Diagnostic arrays are flattened into number/string arrays on `TrainingSnapshot`, preserving the existing type boundary without widening the global lesson schema.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Bug] Corrected two hand-fixture expectations**
- **Found during:** Task 27-01-02
- **Issue:** The RED test miscomputed R2 as `-9` instead of `-19` and the original-space intercept as `-180` instead of `-100`.
- **Fix:** Recomputed both directly from the declared fixtures and corrected only the expected values.
- **Files modified:** `tests/linear-regression-math.test.ts`
- **Verification:** Focused math tests passed 11/11.
- **Committed in:** `a62cf2e`

**2. [Rule 1 - Compatibility Bug] Restored Bike-only fit diagnostic shape**
- **Found during:** Plan-level `npm test`
- **Issue:** The narrowed facade removed the `fitDiagnostics` field still required by the existing univariate renderer/layout contract.
- **Fix:** Added an immutable Bike-only same-case capacity adapter without restoring California data or a custom solver.
- **Files modified:** `src/simulations/linearRegression.ts`
- **Verification:** Linear regression layout/math/simulation tests passed 26/26; full suite passed 847/847; production build passed.
- **Committed in:** `846c495`

---

**Total deviations:** 2 auto-fixed (2 Rule 1 bugs).
**Impact on plan:** Both corrections were required for numerical and consumer compatibility; neither widened scope or changed the locked Bike contract.

## Issues Encountered

- A callback index was initially referenced as `hr` rather than `hour`; focused tests caught it before the Task 3 commit.
- The readonly legacy diagnostic adapter required an explicit compatibility cast because the existing global `FitDiagnostics` interface uses mutable array types. Runtime objects remain frozen.

## Verification

- `node --test tests/linear-regression-math.test.ts tests/linear-regression-simulation.test.ts` — pass, 15 tests.
- `node --test tests/linear-regression-math.test.ts tests/linear-regression-simulation.test.ts tests/linear-regression-layout.test.mjs` — pass, 26 tests.
- `npm test` — pass, 847 tests.
- `npm run build` — pass; existing chunks-larger-than-1400-kB warning only.
- `git diff --check` — pass.
- Protected `.planning/config.json` and `docs/gpt_advice.md` hashes — unchanged; neither staged nor committed.

## User Setup Required

None - no external service configuration required.

## Known Stubs

None. The empty arrays and default option objects in the numerical module are internal accumulators/defaults, not learner-visible placeholder data.

## Next Phase Readiness

- Plans 27-02 onward can consume one authoritative feature/split/preprocessing contract and one stable simulation facade.
- Full-data Notebook execution and publication remain correctly deferred to the asset plans; no blocker exists for the next plan.

## Self-Check: PASSED

- All four production/test files and this summary exist.
- Task commits `14c3787`, `a62cf2e`, `fa9ae5e`, and `846c495` are present in git history.
- Plan-level tests, build, diff check, and protected-file checks passed.

---
*Phase: 27-linear-regression-rebuild*
*Completed: 2026-07-29*
