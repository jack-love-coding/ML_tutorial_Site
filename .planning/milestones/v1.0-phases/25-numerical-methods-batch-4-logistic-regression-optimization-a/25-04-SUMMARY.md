---
phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a
plan: "04"
subsystem: numerical-methods
tags: [typescript, csv, logistic-regression, stable-bce, gradient-descent, armijo, state-machine]

requires:
  - phase: 25-03
    provides: Executed Banknote Notebook, locked five-run traces, terminal fixtures, constants, and cross-runtime tolerance anchors
provides:
  - Strict base-safe Banknote CSV parser and loader with typed line-column diagnostics
  - Train-only standardization recomputed from the local 1,372-row snapshot
  - Pure TypeScript stable logistic objective, gradient descent, Armijo, stop machine, and last-finite safety semantics
  - Five browser-computable runs matching every accepted Notebook trace row within locked tolerances
affects: [25-05, 25-12, 25-13, optimization, training-diagnostics]

tech-stack:
  added: []
  patterns:
    - Narrow exact-schema CSV boundary with injectable fetch, AbortSignal, and public-base resolution
    - Accepted-state-only iterative traces with attemptedIteration reserved for rejected safety attempts
    - Explicit invalid-config results instead of clamping or silently replacing learner values

key-files:
  created:
    - src/modules/math-lab/utils/banknoteDataset.ts
    - src/modules/math-lab/utils/banknoteLogistic.ts
  modified:
    - tests/numerical-methods-batch-4.test.ts

key-decisions:
  - "Keep fetching and CSV validation in banknoteDataset.ts while passing typed rows explicitly into the DOM-free logistic engine."
  - "Return typed invalid-config results without clamping, while allowing Number.MAX_VALUE as the exact learner-reachable fixed-step safety probe."
  - "Compare every accepted state across all five runs at 1e-9 scalar and 1e-8 parameter tolerances, not only terminal summaries."

patterns-established:
  - "Dataset boundary: exact header, ordered IDs, finite features, target/split domains, and locked split/class counts are validated before training."
  - "Trainer boundary: iteration 0 and accepted finite updates are trace rows; rejected or non-finite attempts leave the last finite row unchanged."
  - "Selection boundary: only mathematical-convergence runs are eligible, then lowest best-validation BCE wins."

requirements-completed: [P25-SC3, P25-SC4]

coverage:
  - id: D1
    description: The browser boundary independently parses the local Banknote snapshot under default and Pages bases and recomputes training-only population statistics.
    requirement: P25-SC3
    verification:
      - kind: unit
        ref: "tests/numerical-methods-batch-4.test.ts#dataset parser, dataset loader, and train-only preprocessing"
        status: pass
      - kind: integration
        ref: "node --test --test-name-pattern='dataset parser|dataset loader|train-only preprocessing|public base' tests/numerical-methods-batch-4.test.ts"
        status: pass
    human_judgment: false
  - id: D2
    description: The pure TypeScript logistic engine reproduces stable arithmetic, five locked runs, Armijo acceptance, terminal priority, final selection, and last-finite failure semantics.
    requirement: P25-SC4
    verification:
      - kind: unit
        ref: "tests/numerical-methods-batch-4.test.ts#stable BCE, gradient, Armijo, stop priority, last finite, five run parity, and final selection"
        status: pass
      - kind: integration
        ref: "npm run build"
        status: pass
    human_judgment: false

duration: 11 min
completed: 2026-07-22
status: complete
---

# Phase 25 Plan 04: Deterministic Banknote TypeScript Engine Summary

**Strict local Banknote loading plus a DOM-free stable logistic optimizer that reproduces all 1,222 accepted Notebook trace rows and exact terminal semantics**

## Performance

- **Duration:** 11 min
- **Started:** 2026-07-22T09:35:13Z
- **Completed:** 2026-07-22T09:46:46Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added a strict seven-column Banknote parser/loader that supports LF, CRLF, BOM, default and GitHub Pages bases, injected fetch, `AbortSignal`, typed HTTP/parse/schema errors, and line-column diagnostics.
- Recomputed the four population means/scales exclusively from the 960 parsed training rows and proved that validation/test perturbations cannot affect preprocessing.
- Added stable logit-domain BCE, analytic gradients with intercept-excluded L2, fixed-step and Armijo training, six-reason stop priority, accepted-state-only tracing, exact `Number.MAX_VALUE` last-finite behavior, and convergence-gated final selection.
- Matched all five Notebook runs across every accepted trace row at absolute `1e-9` scalar and `1e-8` parameter tolerances while leaving later Plan 25-05 and 25-09 RED owners intact.

## Task Commits

Each TDD task was committed as a RED/GREEN pair:

1. **Task 1 RED: strict local dataset boundary tests** - `add4dd1` (test)
2. **Task 1 GREEN: strict parser, preprocessing, and loader** - `b1eea58` (feat)
3. **Task 2 RED: stable logistic arithmetic, state, failure, and parity tests** - `bfd47e5` (test)
4. **Task 2 GREEN: deterministic logistic optimization engine** - `943555b` (feat)

## Files Created/Modified

- `src/modules/math-lab/utils/banknoteDataset.ts` - Exact snapshot schema, typed rows/errors/load states, public-base loader, and train-only population statistics.
- `src/modules/math-lab/utils/banknoteLogistic.ts` - Stable sigmoid/softplus/BCE, objective and gradient, data preparation, bounded configuration validation, fixed and Armijo steps, terminal state machine, five presets, traces, failure suggestions, and final selection.
- `tests/numerical-methods-batch-4.test.ts` - Dataset boundary, preprocessing, stable arithmetic, centered-gradient, Armijo, terminal priority, last-finite, invalid-control, full five-run trace parity, and selection coverage.

## Decisions Made

- Kept asset loading out of the logistic engine. `banknoteDataset.ts` owns fetch/public-base/CSV trust boundaries; `banknoteLogistic.ts` accepts already typed rows and remains free of DOM, Vue, D3, fetch, Python, and synthetic scenario logic.
- Returned `{ status: 'invalid-config', issues }` for invalid advanced controls rather than applying fallback values. `Number.MAX_VALUE` remains a valid positive step so the exact D-24 safety probe reaches `non-finite` at attempted iteration 1.
- Tested every accepted trace point rather than only five terminal anchors, making cross-runtime drift visible anywhere in the training trajectory.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The first production type check exposed two TypeScript inference issues: the `as const` default narrowed `l2` to literal `0.001`, and `Array.isArray` widened validated rows to `any[]`. Explicit numeric and row types fixed both before the GREEN commit; the subsequent build passed.
- A first attempt at the plan-level test filter over-escaped square brackets and Node rejected the regular expression. The corrected owner filter passed 21/21 current Batch 4 tests.
- Running the unfiltered file intentionally leaves only the downstream Plan 25-05 and Plan 25-09 RED owners failing; no later-plan implementation was pulled into this plan.

## TDD Gate Compliance

- Task 1 RED commit `add4dd1` failed on the absent `banknoteDataset.ts`; GREEN commit `b1eea58` passed all parser/loader/preprocessing owners.
- Task 2 RED commit `bfd47e5` failed on the absent `banknoteLogistic.ts`; GREEN commit `943555b` passed stable arithmetic, gradient, Armijo, stop, failure, five-run parity, and final-selection owners.
- No separate refactor commit was needed; production build and focused tests passed after GREEN.

## Known Stubs

None. Empty objects/arrays and nullable backtrack/relative-change fields are bounded accumulators or explicit contract states; no placeholder or mock data flows to a learner surface.

## Threat Flags

None. The static CSV and learner-control trust boundaries are both declared in the plan threat model and are covered by exact schema/count/finite checks, bounded iteration/backtracking, explicit invalid-config results, and last-finite exits.

## User Setup Required

None - no external service configuration or browser Python runtime is required.

## Next Phase Readiness

- Plan 25-05 can wire the two existing primary labs to the public loader and pure engine without moving mathematical logic into Vue.
- Plan 25-12 can reuse the owner filter and production build gate; Plan 25-13 can exercise the exact raw/fixed/`Number.MAX_VALUE`/10-iteration browser probe.
- No blocker remains. `.planning/config.json` and `docs/gpt_advice.md` remain untouched and unstaged.

## Self-Check: PASSED

- `banknoteDataset.ts`, `banknoteLogistic.ts`, and the updated Batch 4 test file exist.
- Task commits `add4dd1`, `b1eea58`, `bfd47e5`, and `943555b` exist in Git history.
- The 21 current Batch 4/Plan 25-03/Plan 25-04 tests pass; every five-run trace row meets locked tolerances.
- `npm run build` and `git diff --check` pass with only the pre-existing Vite large-chunk warning.
- Full-file execution fails only the intentionally preserved Plan 25-05 and Plan 25-09 RED owners.

---
*Phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a*
*Completed: 2026-07-22*
