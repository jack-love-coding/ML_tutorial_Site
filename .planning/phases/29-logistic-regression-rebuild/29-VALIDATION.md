---
phase: 29
slug: logistic-regression-rebuild
status: complete
nyquist_compliant: true
wave_0_complete: true
created: 2026-08-19
---

# Phase 29 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node test runner through `node --test`; Python/Jupyter and ffprobe for generated assets |
| **Config file** | `package.json` scripts; no separate Node test config |
| **Quick run command** | `npm test -- tests/logistic-regression-*.test.*` |
| **Full suite command** | `npm run test:ci` |
| **Estimated runtime** | Focused suite under 30 seconds; full suite several minutes |

---

## Sampling Rate

- **After every task commit:** Run the focused logistic-regression tests and the applicable asset or media check.
- **After every plan wave:** Run `npm run test:ci`.
- **Before `$gsd-verify-work`:** Run the full suite, both production builds, asset/media drift checks, security audit, and the specified browser matrix.
- **Max feedback latency:** 30 seconds for ordinary source tasks; asset-generation tasks may use their deterministic drift check immediately after generation.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Depends on | Requirement | Threat Ref | Secure Behavior | Automated Command | Contract Source | Status |
|---------|------|------|------------|-------------|------------|-----------------|-------------------|-----------------|--------|
| 29-00-01 | 00 | 0 | — | LOGR-01..04 | T-29-00-01,02 | Numerical/static contracts are literal, fail-first, finite, hash-bound, and exclude learner test disclosure | `sh -c 'node --check tests/logistic-regression-math.test.ts && node --check tests/logistic-regression-assets.test.ts && node --check tests/logistic-regression-parity.test.ts && node --check tests/logistic-regression-calibration.test.ts && ! node --test tests/logistic-regression-math.test.ts tests/logistic-regression-assets.test.ts tests/logistic-regression-parity.test.ts tests/logistic-regression-calibration.test.ts'` | ❌ created by this task | ✅ green |
| 29-00-02 | 00 | 0 | 29-00-01 | LOGR-01..04 | T-29-00-01,02 | Bilingual content, safe rendering, bounded lazy labs, and legacy compatibility fail first | `sh -c 'node --check tests/logistic-regression-content.test.mjs && node --check tests/logistic-regression-rendering.test.ts && node --check tests/logistic-regression-labs.test.mjs && node --check tests/logistic-regression-cockpit.test.mjs && ! node --test tests/logistic-regression-content.test.mjs tests/logistic-regression-rendering.test.ts tests/logistic-regression-labs.test.mjs tests/logistic-regression-cockpit.test.mjs'` | ❌ three new; cockpit revised | ✅ green |
| 29-00-03 | 00 | 0 | 29-00-02 | LOGR-01,02 | T-29-00-01,03 | Media/release integrity, browser matrix, and Phase 30 exclusion fail first without binary placeholders | `sh -c 'node --check tests/logistic-regression-media.test.mjs && node --check tests/logistic-regression-release.test.mjs && ! node --test tests/logistic-regression-media.test.mjs tests/logistic-regression-release.test.mjs'` | ❌ created by this task | ✅ green |
| 29-01-01 | 01 | 1 | 29-00 | LOGR-01 | T-29-01-01,03,04 | One audited row reaches the preserved route through sanitized bilingual typed content | `npm test -- tests/logistic-regression-math.test.ts tests/logistic-regression-cockpit.test.mjs` | 29-00 | ✅ green |
| 29-01-02 | 01 | 1 | 29-01-01 | LOGR-01,02 | T-29-01-02 | Stable score/BCE/gradient/calibration helpers reject invalid/non-finite values | `npm test -- tests/logistic-regression-math.test.ts` | 29-00 | ✅ green |
| 29-02-01 | 02 | 2 | 29-01 | LOGR-02..04 | T-29-02-02,05 | Exact scratch/sklearn/finite-difference/calibration analysis stays train/validation-only | `npm test -- tests/logistic-regression-parity.test.ts tests/logistic-regression-calibration.test.ts` | 29-00 | ✅ green |
| 29-02-02 | 02 | 2 | 29-02-01 | LOGR-02..04 | T-29-02-01,02,05 | New bilingual package is atomic, reproducible, hash-bound, fixed-tolerance, and test-sealed | `python3 scripts/logistic-regression/build-phase-29-assets.py --check && npm test -- tests/logistic-regression-assets.test.ts tests/logistic-regression-parity.test.ts tests/logistic-regression-calibration.test.ts` | 29-00 | ✅ green |
| 29-02-03 | 02 | 2 | 29-02-02 | LOGR-02..04 | T-29-02-02,03,04 | Runtime parser is finite, immutable, abortable, Pages-safe, and cannot expose reserved test records | `npm test -- tests/logistic-regression-assets.test.ts` | 29-00 | ✅ green |
| 29-03-01 | 03 | 3 | 29-02 | LOGR-01,02 | T-29-03-01,02,05 | Four scene sources and typed registry reject numerical/source/argument drift | `python3 scripts/manim/render_logistic_regression.py --validate-sources && npm test -- tests/logistic-regression-media.test.mjs` | 29-00 | ✅ green |
| 29-03-02 | 03 | 3 | 29-03-01 | LOGR-01 | T-29-03-01,03,05 | Score/sigmoid prompt, tree, transcript, markers, and static conclusion share one authority | `python3 scripts/manim/render_logistic_regression.py --validate-sources --scene linear-score-to-sigmoid` | 29-00 media contract | ✅ green |
| 29-03-03 | 03 | 3 | 29-03-02 | LOGR-01,02 | T-29-03-01,03,05 | Likelihood/BCE/gradient package is exact, accessible without color, and manifest-bound | `python3 scripts/manim/render_logistic_regression.py --validate-sources --scene likelihood-to-bce-gradient` | 29-00 media contract | ✅ green |
| 29-04-01 | 04 | 4 | 29-03 | LOGR-01,02 | T-29-04-01,04 | Confident-mistake package remains stable at extreme scores and reveals no test output | `python3 scripts/manim/render_logistic_regression.py --validate-sources --scene log-loss-confident-mistake` | 29-00 media contract | ✅ green |
| 29-04-02 | 04 | 4 | 29-04-01 | LOGR-01,02 | T-29-04-01,04 | Regularization package separates aligned parity from changed-objective L2 | `python3 scripts/manim/render_logistic_regression.py --validate-sources --scene regularization-confidence-field` | 29-00 media contract | ✅ green |
| 29-04-03 | 04 | 4 | 29-04-02 | LOGR-01,02 | T-29-04-01..03 | Four media packages pass ffprobe/hash/metadata/player/fallback and atomic rollback checks | `python3 scripts/manim/render_logistic_regression.py --check && npm test -- tests/logistic-regression-media.test.mjs` | 29-00 | ✅ green |
| 29-05-01 | 05 | 3 | 29-02 | LOGR-01..04 | T-29-05-01..04 | Lazy shell aborts stale loads and pure scene models validate bounds/finite values | `npm test -- tests/logistic-regression-labs.test.mjs tests/logistic-regression-assets.test.ts tests/logistic-regression-math.test.ts` | 29-00 | ✅ green |
| 29-05-02 | 05 | 3 | 29-05-01 | LOGR-01 | T-29-05-01,02 | Score/sigmoid/likelihood scenes support keyboard, reduced motion, non-color cues, and tables | `npm test -- tests/logistic-regression-labs.test.mjs tests/logistic-regression-math.test.ts` | 29-00 | ✅ green |
| 29-05-03 | 05 | 3 | 29-05-02 | LOGR-02..04 | T-29-05-01,02,04,05 | Gradient/parity/calibration/limits replay authoritative results and preserve synthetic provenance | `npm test -- tests/logistic-regression-labs.test.mjs tests/logistic-regression-parity.test.ts tests/logistic-regression-calibration.test.ts` | 29-00 | ✅ green |
| 29-06-01 | 06 | 5 | 29-02,04,05 | LOGR-01..04 | T-29-06-01,03,05 | Six bilingual chapters render safe formulas, final-only sources/downloads, and no test disclosure | `npm test -- tests/logistic-regression-content.test.mjs tests/logistic-regression-rendering.test.ts tests/logistic-regression-cockpit.test.mjs` | 29-00 | ✅ green |
| 29-06-02 | 06 | 5 | 29-06-01 | LOGR-01..04 | T-29-06-02..04 | Paged route preserves IDs/progress/checkpoint and mounts one current lazy lab/media package | `npm test -- tests/logistic-regression-cockpit.test.mjs tests/logistic-regression-content.test.mjs tests/logistic-regression-media.test.mjs tests/logistic-regression-labs.test.mjs` | 29-00 | ✅ green |
| 29-06-03 | 06 | 5 | 29-06-02 | LOGR-01..04 | T-29-06-01,04 | Single-column responsive layout has safe overflow, focus, fallback, and Pages paths | `npm test -- tests/logistic-regression-cockpit.test.mjs tests/logistic-regression-rendering.test.ts && npm run build && npm run build:pages` | 29-00 | ✅ green |
| 29-07-01 | 07 | 6 | 29-06 | LOGR-01..04 | T-29-07-01,03,04 | Exact browser matrix returns strict local, responsive, accessible, failure-injected records | `node --check scripts/qa/logisticRegressionBrowserMatrix.js && npm test -- tests/logistic-regression-release.test.mjs tests/logistic-regression-cockpit.test.mjs tests/logistic-regression-labs.test.mjs` | 29-00 | ✅ green |
| 29-07-02 | 07 | 6 | 29-07-01 | LOGR-01..04 | T-29-07-02,03,05 | Same-HEAD drift/tests/builds/security/browser gates seal only Phase 29-owned files | `python3 scripts/logistic-regression/build-phase-29-assets.py --check && python3 scripts/manim/render_logistic_regression.py --check && npm run test:ci && npm run build && npm run build:pages && npm run test:phase29:browser && npm run security:audit` | 29-00 plus all production plans | ✅ green |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [x] `tests/logistic-regression-math.test.ts` — stable scalar/vectorized math, finite differences, range and finite guards.
- [x] `tests/logistic-regression-assets.test.ts` — manifest, hash, schema, Notebook, figure and prediction-handoff contract.
- [x] `tests/logistic-regression-parity.test.ts` — explicit scratch/sklearn alignment and tolerances.
- [x] `tests/logistic-regression-calibration.test.ts` — transform invariants, bins and synthetic diagnostic separation.
- [x] `tests/logistic-regression-content.test.mjs` and `tests/logistic-regression-rendering.test.ts` — bilingual structure and safe TeX/Markdown.
- [x] `tests/logistic-regression-labs.test.mjs` — dedicated lazy scene mapping, controls and fallbacks.
- [x] `tests/logistic-regression-media.test.mjs` — media registry, ffprobe, hash, transcript and chapter-marker contracts.
- [x] `tests/logistic-regression-release.test.mjs` — exact browser-matrix result, Phase 30 exclusion, route/progress/checkpoint and final release contracts.
- [x] Update `tests/logistic-regression-cockpit.test.mjs` for the retired shared cockpit while preserving route, ID, checkpoint and layout compatibility.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bilingual responsive teaching flow and lab usability | LOGR-01, LOGR-04 | Visual hierarchy, touch comfort and instructional pacing need browser judgment | Check all six Chinese chapters at 1200px; check key chapters in both locales at 1440/768/390px, including keyboard use, reduced motion and no horizontal overflow. |
| Video teaching fallback quality | LOGR-01 | Poster/transcript readability and chapter seeking are perceptual | Exercise normal playback, forced media failure, chapter seeking and reduced-motion state for all four videos. |

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verification or Wave 0 dependencies.
- [x] Sampling continuity: no three consecutive tasks without automated verification.
- [x] Wave 0 covers all missing references.
- [x] No watch-mode flags.
- [x] Feedback latency is below 30 seconds for ordinary source tasks.
- [x] `nyquist_compliant: true` is set in frontmatter after implementation validation.

## Executed Same-HEAD Release Gate — 2026-08-20

- ✅ 44 Phase 29 math, asset, parity, calibration, content, rendering, lab, media, cockpit, and release tests.
- ✅ `python3 scripts/logistic-regression/build-phase-29-assets.py --check` and `python3 scripts/manim/render_logistic_regression.py --check`.
- ✅ `npm run test:ci`: 1,084 passed, 28 skipped, 0 failed; `npm run build`; and `npm run build:pages`.
- ✅ `npm run test:phase29:browser` now builds the Pages artifact and is required by the Pages workflow. Its real-browser Playwright matrix returned 30 exact route/locale/viewport records, six scene interactions, and four injected failure fallbacks; no overflow, browser errors, cross-origin assets, eager unrelated interaction requests, or learner-visible reserved test records.
- ⚠️ `npm run security:audit` completed while reporting the pre-existing `nanoid <3.3.18` advisory (GHSA-2v37-7h3g-55p8). This phase changed no dependencies and deliberately does not mask it with an unrelated upgrade.

**Approval:** automated release gate complete; representative visual pacing remains available for optional human PR review.
