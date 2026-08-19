---
phase: 29-logistic-regression-rebuild
plan: "00"
subsystem: testing
tags: [node-test, logistic-regression, numerical-contracts, static-assets, accessibility]
requires:
  - phase: 28B
    provides: shared course, media, and Banknote compatibility patterns
provides:
  - fail-first contracts for Phase 29 numerical, asset, parity, and calibration behavior
  - executable contracts for bilingual lessons, lazy labs, legacy routes, media, and final release scope
affects: [29-01, 29-02, 29-03, 29-04, 29-05, 29-06, 29-07, classification]
actuals:
  tokens: 6420
  tasks: 3
  commits: 3
tech-stack:
  added: []
  patterns: ["Phase-local contracts fail first against a missing production interface", "Static asset contracts bind hashes and provenance before publication"]
key-files:
  created:
    - tests/logistic-regression-math.test.ts
    - tests/logistic-regression-assets.test.ts
    - tests/logistic-regression-parity.test.ts
    - tests/logistic-regression-calibration.test.ts
    - tests/logistic-regression-content.test.mjs
    - tests/logistic-regression-rendering.test.ts
    - tests/logistic-regression-labs.test.mjs
    - tests/logistic-regression-media.test.mjs
    - tests/logistic-regression-release.test.mjs
  modified:
    - tests/logistic-regression-cockpit.test.mjs
key-decisions:
  - "Pin the Wave 0 contracts to the planned phase-local engine.ts/course.ts/media.ts seams rather than legacy cockpit internals."
  - "Treat the expected RED result as the Wave 0 proof: it must name missing Phase 29 production behavior, never a syntax or test-harness failure."
  - "Freeze the 30-case browser matrix and Phase 30 disclosure boundary before course implementation."
patterns-established:
  - "Phase-local test suites describe the target interface and do not hide absent implementation with skip or todo branches."
  - "Asset and release tests keep test labels, test metrics, and Phase 30 decision workflows out of learner-facing Phase 29 surfaces."
requirements-completed: [LOGR-01, LOGR-02, LOGR-03, LOGR-04]
coverage:
  - id: D1
    description: Numerical, asset, parity, and calibration contracts are parseable and intentionally RED against missing Phase 29 production seams.
    requirement: LOGR-01
    verification:
      - kind: unit
        ref: "node --check tests/logistic-regression-{math,assets,parity,calibration}.test.ts && expected RED node --test run"
        status: pass
    human_judgment: false
  - id: D2
    description: Bilingual course, safe rendering, lazy-lab, and preserved-route contracts are parseable and intentionally RED.
    requirement: LOGR-02
    verification:
      - kind: integration
        ref: "node --check tests/logistic-regression-{content,rendering,labs,cockpit}.test.* && expected RED node --test run"
        status: pass
    human_judgment: false
  - id: D3
    description: Media integrity, browser-matrix, and Phase 30 scope contracts are parseable and intentionally RED.
    requirement: LOGR-03
    verification:
      - kind: integration
        ref: "node --check tests/logistic-regression-{media,release}.test.mjs && expected RED node --test run"
        status: pass
    human_judgment: false
status: complete
---

# Phase 29 Plan 00: Logistic regression fail-first contracts Summary

**Ten focused test contracts now lock the numeric, content, interaction, media, and release boundaries that the Logistic Regression rebuild must satisfy.**

## Performance

- **Duration:** 27m
- **Completed:** 2026-08-19
- **Tasks:** 3/3
- **Files modified:** 10

## Accomplishments

- Locked stable score/sigmoid/BCE/gradient validation, the complete eight-step finite-difference sweep, Banknote parity settings, immutable tolerances, and calibration boundaries.
- Defined the six bilingual chapter and lazy-lab requirements while preserving routes, chapter IDs, progress, checkpoint, TOC, and pager compatibility.
- Added four-media integrity checks plus an exact 30-case browser release matrix and a hard Phase 29/30 evaluation-disclosure boundary.

## Task Commits

1. **Task 1: Numerical, asset, parity, and calibration contracts** — `d6b44fb`
2. **Task 2: Content, rendering, lab, and compatibility contracts** — `e248b86`
3. **Task 3: Media integrity and release contracts** — `c0c0e85`

## Verification

- All ten test files pass `node --check`.
- The full focused `node --test` run is intentionally RED on the pre-Phase-29 tree, with named failures for missing production modules, packages, scenes, and browser matrix rather than syntax errors, skipped tests, or todo branches.
- No production source, generated public asset, dependency, external API, or schema changed in this plan.

## Decisions Made

- Use the planned `src/modules/logistic-regression/engine.ts`, `data/course.ts`, and `data/media.ts` interfaces as the test targets so later waves share one authority.
- Retire the shared cockpit from primary mounting while retaining its file, legacy module identity, deep links, Progress surfaces, and checkpoint compatibility.
- Make the final test-set, broad classification metrics, and threshold-selection workflow fail closed until Phase 30.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Contract alignment] Corrected initial test import seams to match the approved Phase 29 implementation plans.**

- **Found during:** Task 2
- **Issue:** Early numerical contracts named provisional files instead of the plan's `engine.ts` authority.
- **Fix:** Rebound math, parity, and calibration contracts to `engine.ts` and pinned the scratch/sklearn limits declared in Plan 29-02.
- **Verification:** The grouped RED command remains parse-clean and fails only on absent Phase 29 production behavior.
- **Committed in:** `d6b44fb`

**Total deviations:** 1 auto-fixed (Rule 1).

## Issues Encountered

- The task runner's first state-update command treated a quoted `node` invocation as one executable path. Re-running the same read/write SDK commands directly completed the required state updates without changing project code.

## Next Phase Readiness

- Plan 29-01 can now implement the one-row tracer, typed course seam, and pure stable engine against a fixed, independently authored contract.
- The expected RED state is intentional and must turn green only as the later Phase 29 plans deliver their owned production files.

## Self-Check: PASSED

- All ten declared test files exist.
- Task commits `d6b44fb`, `e248b86`, and `c0c0e85` exist on the phase branch.
- No test contains a skip or todo escape hatch.

---
*Phase: 29-logistic-regression-rebuild*
*Plan: 00*
