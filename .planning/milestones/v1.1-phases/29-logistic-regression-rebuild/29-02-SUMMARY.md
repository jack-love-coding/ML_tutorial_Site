---
phase: 29-logistic-regression-rebuild
plan: "02"
subsystem: logistic-regression
tags: [python, sklearn, notebook, static-assets, integrity, github-pages]
requires:
  - phase: 29
    plan: "01"
    provides: phase-local numerical contracts and typed logistic identities
provides:
  - deterministic Banknote scratch/sklearn/calibration numerical authority
  - atomic bilingual Phase 29 asset package and sealed Phase 30 prediction handoff
  - fail-closed Pages-safe manifest and interaction loader
affects: [29-03, 29-04, 29-05, 29-06, 29-07]
tech-stack:
  added: []
  patterns:
    - train-only source verification before any logistic fitting
    - complete-tree static publication with hash validation and rollback probes
    - learner-safe manifest projection that excludes the reserved Phase 30 handoff
key-files:
  created:
    - scripts/logistic-regression/phase29_analysis.py
    - scripts/logistic-regression/build-phase-29-assets.py
    - src/modules/logistic-regression/assets.ts
    - public/logistic-regression/phase-29/manifest.json
  modified:
    - src/modules/logistic-regression/types.ts
    - tests/logistic-regression-assets.test.ts
    - tests/logistic-regression-parity.test.ts
    - tests/logistic-regression-calibration.test.ts
decisions:
  - Keep the fixed scratch/sklearn thresholds hard-failing rather than relaxing numerical tolerances.
  - Keep the frozen all-split prediction handoff published for Phase 30 while redacting it from Phase 29 learner loaders.
  - Bound replay traces to 800 states and retain exact total accepted-state counts for lightweight browser delivery.
metrics:
  completed: 2026-08-20
  tasks: 3
  commits: 7
status: complete
coverage:
  - id: D1
    description: Deterministic scratch, sklearn parity, finite-difference, calibration, and synthetic capacity analyses.
    requirement: LOGR-02
    verification:
      - kind: unit
        ref: tests/logistic-regression-parity.test.ts + tests/logistic-regression-calibration.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: Hash-bound, atomic bilingual Phase 29 static package with no learner-facing held-out records.
    requirement: LOGR-03
    verification:
      - kind: integration
        ref: python3 scripts/logistic-regression/build-phase-29-assets.py --check
        status: pass
      - kind: unit
        ref: tests/logistic-regression-assets.test.ts
        status: pass
    human_judgment: false
  - id: D3
    description: Pages-safe runtime asset parser and loader with integrity, schema, cancellation, and immutable-result guards.
    requirement: LOGR-04
    verification:
      - kind: unit
        ref: tests/logistic-regression-assets.test.ts#runtime asset boundary
        status: pass
      - kind: integration
        ref: npm run build:pages
        status: pass
    human_judgment: false
---

# Phase 29 Plan 02: Reproducible logistic asset authority Summary

**A deterministic, train-only Banknote analysis now publishes the same scratch, sklearn, finite-difference, calibration, figure, Notebook, and chapter-scene results through one hash-bound static package.**

## Accomplishments

- Added strict source validation for the committed Banknote CSV, fixed train/validation/test counts, stable row IDs, feature order, source hash, and train-only `ddof=0` preprocessing.
- Implemented zero-initialized Armijo scratch training, the exact scikit-learn 1.9 parity configuration, hard coefficient/probability tolerance checks, L2 as a separate objective, all eight centered-difference steps, controlled positive-temperature calibration, and isolated XOR/circle diagnostics.
- Generated two clean-kernel bilingual Notebooks, six bounded chapter payloads, five local figures, replayable CSV/JSON outputs, and a full frozen prediction handoff. The latter is reserved for Phase 30 and is not reachable through Phase 29 learner loaders.
- Added atomic complete-tree publication, deterministic read-only drift checking, and injected rollback probes for absent and seeded targets.
- Added strict runtime parsing, finite-tree bounds, scene identity checks, SHA-256 verification, abort/HTTP/schema/integrity failure categories, deep immutability, and GitHub Pages base-path support.

## Task Commits

1. **Task 1: Derive deterministic scratch, parity, calibration, and capacity analysis** — `02f4ddd`, `8d379ba`
2. **Task 2: Build and atomically publish the bilingual asset package** — `137a1bd`, `9ce9eda`
3. **Task 3: Add the fail-closed Pages-safe runtime asset boundary** — `4662062`, `de02896`, `c3d4cd6`

## Verification

- `python3 scripts/logistic-regression/build-phase-29-assets.py --check` — pass; package regeneration matched committed bytes without changing public assets.
- `python3 scripts/logistic-regression/build-phase-29-assets.py --rollback-probe` — pass; pre/mid/post failure injection restored both absent and seeded targets.
- `node --test tests/logistic-regression-assets.test.ts tests/logistic-regression-parity.test.ts tests/logistic-regression-calibration.test.ts` — pass (13 tests).
- `npm run build` and `npm run build:pages` — pass, with the pre-existing large-chunk advisory.
- `git diff --check` — pass.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Restored seeded publication targets after failures before the swap.**

- **Found during:** Task 2 rollback injection.
- **Issue:** A pre-swap injected failure removed a pre-existing target because rollback did not distinguish it from a completed swap.
- **Fix:** Tracked original-move and publish states independently, then restored only the operation actually performed.
- **Files modified:** `scripts/logistic-regression/build-phase-29-assets.py`.
- **Commit:** `137a1bd` (with final hardened implementation in `9ce9eda`).

**2. [Rule 2 - Information disclosure] Redacted the Phase 30 handoff from learner manifest results.**

- **Found during:** Task 3 boundary review.
- **Issue:** The raw manifest correctly contains the sealed frozen handoff, but returning that raw tree to a Phase 29 learner loader would disclose its reserved path.
- **Fix:** Validate the raw handoff, then return a frozen learner manifest containing only locale and six approved scene entries.
- **Files modified:** `src/modules/logistic-regression/assets.ts`, `src/modules/logistic-regression/types.ts`, `tests/logistic-regression-assets.test.ts`.
- **Commit:** `c3d4cd6`.

**3. [Rule 2 - Performance] Bounded browser replay trace payloads.**

- **Found during:** Task 2 package inspection.
- **Issue:** Publishing every accepted Armijo state produced oversized CSV and scene JSON files.
- **Fix:** Publish deterministic samples capped at 800 states while preserving exact accepted-state counts and terminal state.
- **Files modified:** `scripts/logistic-regression/build-phase-29-assets.py`, generated trace assets, tests.
- **Commit:** `9ce9eda`.

## Deferred Issues

- The complete `npm test` run reaches an existing Phase 29 release-contract failure in `tests/logistic-regression-release.test.mjs`: the current paged lesson still contains legacy precision/recall UI. That course-shell migration is owned by later Phase 29 lesson/lab plans, not this static asset plan.
- `npm run security:audit` reports one existing high-severity transitive `nanoid` advisory. This plan added no dependency; dependency remediation is out of scope.

## Known Stubs

None.

## Self-Check: PASSED

- Confirmed all three new implementation entry points and the published `public/logistic-regression/phase-29/manifest.json` exist.
- Confirmed task commits `02f4ddd`, `8d379ba`, `137a1bd`, `9ce9eda`, `4662062`, `de02896`, and `c3d4cd6` exist on the phase branch.
- Re-ran focused numerical and asset tests, asset drift checking, both production builds, and whitespace validation after the final boundary fix.

## Next Phase Readiness

- Plan 29-03 can mount six lazy scene components using `loadLogisticInteraction` without accessing held-out predictions.
- Plans 29-04 through 29-07 can bind copy, media, and visual surfaces to manifest source-cell and asset hashes rather than copying numerical values.
