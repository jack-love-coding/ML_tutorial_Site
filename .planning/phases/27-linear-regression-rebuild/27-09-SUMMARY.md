---
phase: 27-linear-regression-rebuild
plan: "09"
subsystem: simulation
tags: [typescript, linear-regression, bike-sharing, selectors, cross-authority]

# Dependency graph
requires:
  - phase: 27-03
    provides: Published full-precision Bike regression summary, trace, coefficient, and residual outputs
  - phase: 27-05
    provides: Strict immutable production parsers for the complete local output package
  - phase: 27-07
    provides: Existing seven-stage synchronous lesson facade and Bike workbench presentation contract
provides:
  - Strict cross-file workbench package constructor with six frozen bounded selectors
  - Compact full-precision baseline audited against source CSV and all four published result files
  - Existing synchronous simulation facade backed exclusively by the audited baseline
affects: [27-10, 27-11, phase-28-tabular-regression]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Production parsers establish file shape while a second pure constructor enforces cross-file consistency
    - Compact synchronous baselines are accepted only when field-by-field tests trace them to committed source and published outputs

key-files:
  created:
    - src/simulations/linearRegressionWorkbench.ts
    - tests/linear-regression-authority.test.ts
  modified:
    - src/simulations/linearRegression.ts
    - src/simulations/linearRegressionBike.ts
    - tests/linear-regression-simulation.test.ts
    - tests/linear-regression-math.test.ts

key-decisions:
  - "Revalidate counts, order, keys, finite bounds, residual identities, final trace state, method coefficients, and named cases when assembling the workbench package, even after strict per-file parsing."
  - "Keep the synchronous facade compact by storing only exact source/public values it displays; never derive a second rounded diagnostic or handwritten Bike record table."
  - "Retain reusable pure regression math APIs while replacing approximate exported authorities with builders that read the audited baseline."

patterns-established:
  - "Cross-authority gate: source CSV → production parsers → strict package → pure selectors → compact baseline → synchronous facade."
  - "Selector contract: finite integer bounds, exhaustive literal choices, frozen detached results, and no fitting, preprocessing, metric recomputation, DOM, or network access."

requirements-completed: [LINR-01, LINR-02, LINR-03, LINR-04]

coverage:
  - id: D1
    description: "The complete strict published package assembles only when all trace, coefficient, residual, summary, and cross-file contracts agree."
    requirement: LINR-02
    verification:
      - kind: integration
        ref: "tests/linear-regression-authority.test.ts#strict workbench constructor accepts only the complete cross-file-consistent package"
        status: pass
      - kind: integration
        ref: "tests/linear-regression-assets.test.ts#strict CSV parsers accept complete published trace coefficients and held-out residuals"
        status: pass
    human_judgment: false
  - id: D2
    description: "Six pure selectors expose exact row/batch, GD, method, coefficient, named-case, and atemp contracts with deterministic bounds."
    requirement: LINR-03
    verification:
      - kind: unit
        ref: "tests/linear-regression-authority.test.ts#six pure selectors expose exact bounded published rows methods coefficients cases and atemp comparison"
        status: pass
    human_judgment: false
  - id: D3
    description: "Source rows and all published outputs drive one full-precision baseline and every Bike-specific field in all seven facade snapshots."
    requirement: LINR-04
    verification:
      - kind: integration
        ref: "tests/linear-regression-authority.test.ts#source CSV strict outputs selectors and compact baseline form one audited equality chain"
        status: pass
      - kind: integration
        ref: "tests/linear-regression-authority.test.ts#all seven synchronous facade snapshots remain numerically identical to the audited baseline"
        status: pass
      - kind: unit
        ref: "tests/linear-regression-simulation.test.ts#optimizer completion precedes exact package-backed Bike diagnostic interpretation"
        status: pass
    human_judgment: false

# Metrics
duration: 18 min
completed: 2026-07-30
status: complete
---

# Phase 27 Plan 09: Published Regression Authority and Facade Summary

**One audited full-precision chain now connects the Bike source CSV and complete published package to six pure selectors and the existing seven-stage simulation facade.**

## Performance

- **Duration:** 18 min
- **Started:** 2026-07-30T07:43:15Z
- **Completed:** 2026-07-30T08:01:19Z
- **Tasks:** 2
- **Files modified:** 6 implementation/test files, plus this summary

## Accomplishments

- Added a dependency-free workbench package that rejects incomplete, duplicated, non-finite, out-of-order, out-of-range, or mutually inconsistent summary/trace/coefficient/residual inputs.
- Added six frozen pure selectors for row/batch state, bounded GD trace points, three published methods, coefficient spaces, four named held-out cases, and the controlled atemp comparison.
- Audited every compact baseline field against the real source CSV and production-parsed public outputs, including all 24 hourly residual summaries, all four 869-row prediction bins, all method deltas, all coefficient keys, trace anchors 0/100/386/772, and all named cases.
- Removed the invented Bike display-record table and rounded held-out fixture; the synchronous facade preserves its six scenarios, seven stages, and callback shape while emitting exact published predictions, residuals, metrics, coefficients, bins, cases, and diagnostics.
- Retained all reusable pure prediction, metric, gradient, coefficient-conversion, validation, and diagnostic APIs outside Vue.

## Task Commits

1. **Task 27-09-01 RED: Add failing regression authority contract** — `5123d73` (test)
2. **Task 27-09-01 GREEN: Add strict published regression workbench** — `5e7af83` (feat)
3. **Task 27-09-02 RED: Add failing facade parity gates** — `2a67a29` (test)
4. **Task 27-09-02 GREEN: Align regression facade with published baseline** — `b069fd3` (feat)

## Files Created/Modified

- `src/simulations/linearRegressionWorkbench.ts` — Strict package assembly, six pure selectors, and exact compact baseline.
- `tests/linear-regression-authority.test.ts` — Real-file source/public/package/selector/baseline/facade drift gate plus malformed-input and immutability coverage.
- `src/simulations/linearRegression.ts` — Seven-stage synchronous facade driven only by exact baseline values.
- `src/simulations/linearRegressionBike.ts` — Preserved pure math and validation functions with exact baseline-derived result/diagnostic builders.
- `tests/linear-regression-simulation.test.ts` — Full-precision facade parity across rows, metrics, trace diagnostics, bins, cases, and atemp comparison.
- `tests/linear-regression-math.test.ts` — Pure math coverage now consumes exact baseline-derived fit, method, preprocessing, and diagnostic inputs.

## Decisions Made

- Per-file parsing and package assembly remain separate trust gates: parsing checks each artifact, while construction catches valid-looking files that drift from one another.
- The compact baseline is a runtime adapter, not a second numerical authority; tests compare every field it stores to source or production-parsed output.
- The facade plots only published representative/named rows and predictions. Its per-row loss breakdown uses the sole published representative-row loss contribution rather than recomputing new display values.
- NaN, Infinity, fractional GD indices, unsupported method/space choices, and malformed packages fail explicitly; finite integer GD indices clamp to updates 0–772.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Preserved TypeScript narrowing across snapshot construction**

- **Found during:** Task 27-09-02 production build
- **Issue:** TypeScript did not preserve the module-initialization undefined check for the published original-unit intercept and hour coefficient inside the later snapshot-builder closure.
- **Fix:** Captured the already-validated values in explicitly typed constants before the closure.
- **Files modified:** `src/simulations/linearRegression.ts`
- **Verification:** Focused tests and `npm run build` pass.
- **Committed in:** `b069fd3`

---

**Total deviations:** 1 auto-fixed (1 Rule 3 blocking TypeScript issue).
**Impact on plan:** The fix only made the existing fail-fast publication check visible to TypeScript; runtime behavior and architecture did not change.

## Issues Encountered

- The plan-level linear-regression glob includes the independent offline Notebook rerun and transactional publication suites, so the complete 112-test command took about 85 seconds. It passed with 108 tests and the four already-declared Plan 27-08 deferred skips.
- Vite reports the repository's existing large-chunk advisory after a successful build; this plan added no dependency or eager route.

## Validation

- Task 27-09-01 RED — failed only because `linearRegressionWorkbench.ts` did not yet exist.
- `node --test tests/linear-regression-authority.test.ts tests/linear-regression-assets.test.ts` — passed 14/14.
- Task 27-09-02 RED — failed on rounded facade coefficients/gradient norm and missing baseline-derived builder APIs.
- `node --test tests/linear-regression-authority.test.ts tests/linear-regression-simulation.test.ts tests/linear-regression-math.test.ts` — passed 19/19.
- `node --test tests/linear-regression-*.test.*` — passed 108/108 active tests; 4 existing Plan 27-08 deferred tests skipped.
- `npm run build` — passed; existing Vite large-chunk advisory only.
- `git diff --check`, prohibited independent-authority scan, stub scan, and protected-file SHA-256 checks — passed.

## Known Stubs

None. Empty arrays and null checks found by the mechanical scan are bounded local accumulators or explicit validation branches, not learner-visible placeholder data.

## Authentication Gates

None.

## User Setup Required

None - the implementation consumes committed local files and existing project tooling.

## Next Phase Readiness

- Plan 27-10 can bind UI controls directly to the six exact selector contracts without fitting, preprocessing, metric recomputation, network access, or Vue-owned numerical truth.
- Plan 27-11 can audit release behavior against a facade whose Bike-specific values are now traceable to committed source/public authority.
- No blocker or deferred correctness issue remains.

## Self-Check: PASSED

- Both created files and all four modified implementation/test files exist.
- TDD commits `5123d73`, `5e7af83`, `2a67a29`, and `b069fd3` exist in Git history in RED/GREEN order.
- Both focused task gates, the complete linear-regression test glob, and the production build pass.
- `.planning/config.json` remains SHA-256 `a30166790b1080df599345c645cd3b38a797d2c8f9ce42bad32075f76d4e958a`.
- `docs/gpt_advice.md` remains SHA-256 `31958b9a46fe97c6770228109d47594846ab26b3cdeed4be9bcb3b9d9b729f86`.

---
*Phase: 27-linear-regression-rebuild*
*Completed: 2026-07-30*
