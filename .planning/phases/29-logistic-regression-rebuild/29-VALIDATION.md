---
phase: 29
slug: logistic-regression-rebuild
status: draft
nyquist_compliant: false
wave_0_complete: false
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

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 29-01-01 | 01 | 1 | LOGR-01 | T-29-01 | Markdown/KaTeX uses the sanitized renderer | content/rendering | `npm test -- tests/logistic-regression-content.test.mjs tests/logistic-regression-rendering.test.ts` | ❌ W0 | ⬜ pending |
| 29-01-02 | 01 | 1 | LOGR-02 | T-29-02 | Numeric inputs and outputs remain finite and bounded | unit | `npm test -- tests/logistic-regression-math.test.ts` | ❌ W0 | ⬜ pending |
| 29-02-01 | 02 | 2 | LOGR-02, LOGR-03 | T-29-03 | Published assets are schema-validated and hash-bound | asset parity | `npm test -- tests/logistic-regression-assets.test.ts tests/logistic-regression-parity.test.ts` | ❌ W0 | ⬜ pending |
| 29-02-02 | 02 | 2 | LOGR-04 | T-29-04 | Phase 30 test/threshold selection data is absent from learner assets | unit/structural | `npm test -- tests/logistic-regression-calibration.test.ts` | ❌ W0 | ⬜ pending |
| 29-03-01 | 03 | 3 | LOGR-01, LOGR-04 | T-29-01, T-29-02 | Labs reject invalid state and retain semantic fallbacks | component/structure | `npm test -- tests/logistic-regression-labs.test.mjs tests/logistic-regression-cockpit.test.mjs` | ⚠️ existing cockpit test requires update | ⬜ pending |
| 29-04-01 | 04 | 3 | LOGR-01 | T-29-03 | Media packages verify hashes, markers, transcripts, and fallback behavior | asset/component | `npm test -- tests/logistic-regression-media.test.mjs` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/logistic-regression-math.test.ts` — stable scalar/vectorized math, finite differences, range and finite guards.
- [ ] `tests/logistic-regression-assets.test.ts` — manifest, hash, schema, Notebook, figure and prediction-handoff contract.
- [ ] `tests/logistic-regression-parity.test.ts` — explicit scratch/sklearn alignment and tolerances.
- [ ] `tests/logistic-regression-calibration.test.ts` — transform invariants, bins and synthetic diagnostic separation.
- [ ] `tests/logistic-regression-content.test.mjs` and `tests/logistic-regression-rendering.test.ts` — bilingual structure and safe TeX/Markdown.
- [ ] `tests/logistic-regression-labs.test.mjs` — dedicated lazy scene mapping, controls and fallbacks.
- [ ] `tests/logistic-regression-media.test.mjs` — media registry, ffprobe, hash, transcript and chapter-marker contracts.
- [ ] Update `tests/logistic-regression-cockpit.test.mjs` for the retired shared cockpit while preserving route, ID, checkpoint and layout compatibility.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Bilingual responsive teaching flow and lab usability | LOGR-01, LOGR-04 | Visual hierarchy, touch comfort and instructional pacing need browser judgment | Check all six Chinese chapters at 1200px; check key chapters in both locales at 1440/768/390px, including keyboard use, reduced motion and no horizontal overflow. |
| Video teaching fallback quality | LOGR-01 | Poster/transcript readability and chapter seeking are perceptual | Exercise normal playback, forced media failure, chapter seeking and reduced-motion state for all four videos. |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verification or Wave 0 dependencies.
- [ ] Sampling continuity: no three consecutive tasks without automated verification.
- [ ] Wave 0 covers all missing references.
- [ ] No watch-mode flags.
- [ ] Feedback latency is below 30 seconds for ordinary source tasks.
- [ ] `nyquist_compliant: true` is set in frontmatter after implementation validation.

**Approval:** pending
