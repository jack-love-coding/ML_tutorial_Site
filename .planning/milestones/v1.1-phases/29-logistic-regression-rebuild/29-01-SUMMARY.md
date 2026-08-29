---
phase: 29-logistic-regression-rebuild
plan: "01"
subsystem: logistic-regression
tags: [typescript, vue, banknote, logistic-regression, numerical-stability, bilingual]
requires:
  - phase: 29
    plan: "00"
    provides: fail-first logistic numerical and compatibility contracts
provides:
  - audited Banknote linear-score teaching tracer at the preserved deep link
  - phase-local typed course and asset contracts
  - pure stable score, likelihood, gradient, calibration, and capacity-diagnostic engine
affects: [29-02, 29-03, 29-04, 29-05, 29-06, 29-07]
tech-stack:
  added: []
  patterns:
    - one frozen real row drives score, probability, BCE, and gradient explanation
    - all learner-entered numerical paths validate finite values and dimensions before arithmetic
key-files:
  created:
    - src/modules/logistic-regression/types.ts
    - src/modules/logistic-regression/engine.ts
    - src/modules/logistic-regression/data/course.ts
  modified:
    - src/components/LogisticRegressionPagedLesson.vue
    - src/styles/modules/linear-regression.css
    - src/styles/modules/linear-regression-responsive.css
    - tests/logistic-regression-math.test.ts
decisions:
  - Use Banknote row 1 with train-only ddof=0 standardized values and the committed standardized-Armijo best-validation vector as the initial audited tracer.
  - Keep class labels non-semantic and treat p >= 0.5 as only a one-sample default bridge.
  - Keep exact browser calculations in the pure engine; richer executed assets and six dedicated labs remain for later plans.
metrics:
  duration: 36m
  completed: 2026-08-19
actuals:
  tokens: 10200
  tasks: 2
  commits: 3
status: complete
---

# Phase 29 Plan 01: Audited logistic score tracer Summary

**The preserved `linear-score` route now teaches one source-audited Banknote row from standardized features to score, probability, log-odds, loss, and gradients using a shared, finite-guarded engine.**

## Accomplishments

- Added phase-local bilingual course contracts and a production `linear-score` flow with safe Markdown/KaTeX rendering and copyable NumPy code.
- Locked the canonical row to committed local data and the committed standardized-Armijo parameter vector; every displayed contribution, logit, probability, BCE, and row gradient derives from the same calculation.
- Added stable, DOM-free operations for linear scores, sigmoid/odds, Bernoulli log-likelihood, mean BCE, batch gradients, central differences, temperature transforms, calibration bins, XOR, and circle diagnostics.
- Preserved legacy chapter routes, Progress inputs/emits, TOC, pager, and checkpoint behavior while the remaining five chapters retain their existing presentation pending expansion plans.

## Task Commits

1. **Task 1: Ship one audited Banknote row through the preserved linear-score route** — `71f550f`
2. **Task 2: Complete the pure score-to-calibration numerical engine** — `45e4e1e`
3. **Task 2 follow-up: Harden invalid numerical input coverage** — `2cffbf8`

## Verification

- `node --test tests/logistic-regression-math.test.ts` — pass (8 tests).
- `node --test tests/logistic-regression-cockpit.test.mjs` — pass (3 tests).
- `npm run build` — pass.
- `git diff --check` — pass.

The package-level `npm test -- …` script intentionally expands to every test file. Its remaining Phase 29 asset/media/lab/content/release failures are Wave 0 contracts for later plans and are not hidden or weakened by this plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking test compatibility] Added explicit logistic CSS aliases and a preserved checkpoint mount.**

- **Found during:** Task 1 compatibility verification.
- **Issue:** The new typed lesson flow lacked the route-specific sidebar selector and checkpoint reference required by the existing preserved-route contract.
- **Fix:** Added minimal route selectors, the 1439px TOC fallback, and retained the existing checkpoint on the final legacy chapter.
- **Files modified:** `src/components/LogisticRegressionPagedLesson.vue`, `src/styles/modules/linear-regression.css`, `src/styles/modules/linear-regression-responsive.css`.
- **Commit:** `71f550f`.

**2. [Rule 1 - Bug] Corrected module-relative TypeScript imports and tuple construction.**

- **Found during:** Task 1 build verification.
- **Issue:** Initial phase-local imports and array-to-tuple casts did not type-check under the project’s strict build.
- **Fix:** Used explicit `.ts` module paths and constructed finite tuples directly.
- **Files modified:** `src/modules/logistic-regression/engine.ts`, `src/modules/logistic-regression/data/course.ts`.
- **Commit:** `71f550f`.

## Known Stubs

None. The remaining five chapter bodies, six route-lazy labs, executed asset package, and media registry are intentionally owned by subsequent Phase 29 plans rather than partially mocked here.

## Self-Check: PASSED

- Confirmed all three new phase-local source files exist.
- Confirmed task commits `71f550f`, `45e4e1e`, and `2cffbf8` exist on the phase branch.
- Re-ran focused numerical, compatibility, and build checks after the final test hardening commit.

## Next Phase Readiness

- Plan 29-02 can generate the independent executed Banknote package against the frozen engine contracts.
- Plan 29-03 can replace the compatibility lab alias with the six route-lazy, dedicated interaction scenes.
