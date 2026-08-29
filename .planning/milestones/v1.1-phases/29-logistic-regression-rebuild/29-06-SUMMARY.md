---
phase: 29-logistic-regression-rebuild
plan: "06"
subsystem: logistic-regression-course
tags: [vue, typescript, bilingual, katex, accessibility, banknote]
dependency_graph:
  requires: [29-02, 29-04, 29-05]
  provides: [six-chapter-logistic-course, final-only-resources, paged-lab-media-integration]
  affects: [29-07-release-validation, phase-30-classification-decisions]
tech_stack:
  added: []
  patterns: [typed-course-block-flow, final-only-resources, route-lazy-observation-labs, public-base-downloads]
key_files:
  created:
    - docs/curriculum-v3/logistic-regression/sources.md
  modified:
    - src/modules/logistic-regression/data/course.ts
    - src/components/LogisticRegressionPagedLesson.vue
    - src/data/logisticRegressionModule.ts
    - src/styles/modules/logistic-regression.css
    - tests/logistic-regression-content.test.mjs
    - tests/logistic-regression-cockpit.test.mjs
decisions:
  - "The course renderer consumes typed chapter blocks and mounts one route-lazy dedicated scene at the observation-lab block, replacing the shared cockpit only in the learner flow."
  - "Only the final linear-limits chapter presents references, whitelisted reproducible downloads, the unchanged checkpoint, and the bridge to classification; frozen prediction handoff records remain private to Phase 30."
metrics:
  duration: "~45 minutes"
  completed_date: "2026-08-20"
status: complete
actuals:
  tokens: 19147
  tasks: 3
  commits: 3
---

# Phase 29 Plan 06: Logistic Regression Course Integration Summary

The six preserved logistic-regression deep links now provide a Banknote-led bilingual teaching flow with safe math, copyable NumPy, locked outputs, route-lazy media and interactive labs.

## Completed Tasks

1. Authored the six typed chapters in the established order: real-row score, stable sigmoid and odds, Bernoulli likelihood, stable BCE and gradient checks, deterministic scratch/sklearn/L2 comparison, and calibration plus linear-capacity limits. Added audited UCI, scikit-learn, D2L, and NIST source records.
2. Replaced the learner page's old generic visuals, results panel, inline video markup, and shared cockpit mount with a content-first block renderer. It loads one `ChapteredMediaPlayer` when assigned and one `LogisticLessonLab` for the active chapter; final-only resources use base-safe local downloads and the unchanged checkpoint remains on `linear-limits`.
3. Added the responsive course shell: wide-screen sticky TOC, compact expandable TOC at smaller widths, single 1040px reading column, full-width labs, copy/focus/overflow rules, mobile wrapping, and reduced-motion safeguards.

## Verification

- Passed: focused course, rendering, cockpit, lab, media, asset, parity, and calibration suites (32 tests).
- Passed: `npm run build`.
- Passed: `npm run build:pages`.
- Passed: `git diff --check`.
- Ran: `npm test`; 1,076 passed, 28 skipped, and two release-matrix tests failed because `scripts/qa/logisticRegressionBrowserMatrix.js` is deliberately scheduled for Plan 29-07 and does not yet exist.
- Ran: `npm run security:audit`; it reports the repository's pre-existing high-severity `nanoid <3.3.18` advisory. This plan made no dependency or lockfile changes.

## Deviations from Plan

### Auto-fixed Issues

1. [Rule 1 - Test precision] Narrowed a prohibited-term test from an unbounded `F1` substring match to a word-boundary match.
   - **Found during:** Task 1 course rendering verification.
   - **Issue:** Python's `f"..."` code syntax falsely triggered the Phase 30 terminology guard.
   - **Fix:** Kept the learner-facing Phase 30 terminology ban while matching metric names as words.
   - **Files modified:** `tests/logistic-regression-content.test.mjs`.
   - **Commit:** `42b975f`.

2. [Rule 1 - Test precision] Measured the lab mount using the final template occurrence instead of the import occurrence.
   - **Found during:** Task 2 course-shell verification.
   - **Issue:** The test treated the component import as if it were the rendered lab position.
   - **Fix:** Asserted that the mounted component occurs after the content-flow template.
   - **Files modified:** `tests/logistic-regression-cockpit.test.mjs`.
   - **Commit:** `14fbbf8`.

## Deferred Issues

- Plan 29-07 owns the deterministic browser matrix script required by `tests/logistic-regression-release.test.mjs`; its absence is the only reason the complete repository suite is not green yet.
- The existing `nanoid` audit advisory remains outside this plan's dependency scope.

## Known Stubs

None.

## Self-Check: PASSED

- Confirmed all seven listed source, page, style, test, and provenance files exist.
- Confirmed task commits `42b975f`, `14fbbf8`, and `d1a33e7` exist on the Phase 29 branch.
- Confirmed the new learner page never imports the legacy `LogisticRegressionLessonLab`, never links `frozen-predictions`, and invokes `withPublicBase` for every downloadable learner resource.

## Next Phase Readiness

Plan 29-07 can run the browser matrix against all six `/learn/logistic-regression/:chapterId` routes and finish the remaining release-only validation without changing the course contract.
