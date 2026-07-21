---
phase: 25
slug: numerical-methods-batch-4-logistic-regression-optimization-a
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-21
---

# Phase 25 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | Node built-in test runner under Node 24.x |
| **Config file** | none — `package.json` runs `node --test tests/*.test.*` |
| **Quick run command** | `node --test tests/numerical-methods-batch-4.test.ts` |
| **Media run command** | `node --test tests/numerical-methods-batch-4-manim.test.ts` |
| **Full suite command** | `npm test` |
| **Estimated runtime** | focused tests under 10 seconds; current full suite about 5 seconds |

---

## Sampling Rate

- **After every task commit:** Run the focused Batch 4 test that covers the changed surface.
- **After every plan wave:** Run `node --test tests/numerical-methods-batch-4.test.ts tests/numerical-methods-batch-4-manim.test.ts` and `git diff --check`.
- **After Notebook/output tasks:** Run `python3 scripts/numerical-methods/generate-batch-4-notebook.py --check`.
- **After media tasks:** Run `python3 scripts/manim/render_numerical_methods_batch_4.py --check`.
- **Before `$gsd-verify-work`:** `npm test`, `npm run build`, `npm run build:pages`, `npm run security:audit`, both generator checks, and the browser matrix must be green.
- **Max automated feedback latency:** 10 seconds for task-level focused tests.

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Threat Ref | Secure Behavior | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|------------|-----------------|-----------|-------------------|-------------|--------|
| 25-01-01 | 01 | 1 | P25-SC2 | T-25-SC | Exact `scikit-learn==1.9.0` identity is approved before requirements/install work. | manual package gate | Human checkpoint | ✅ checkpoint | ⬜ pending |
| 25-02-01 | 02 | 2 | P25-SC1–SC3 | T-25-02 / T-25-SC | Contract locks exact numerical, package, schema, output, and preservation boundaries. | source/drift | `node --test --test-name-pattern='dataset|contract' tests/numerical-methods-batch-4.test.ts` | ❌ W0 | ⬜ pending |
| 25-02-02 | 02 | 2 | P25-SC1 | T-25-01 | Dataset bytes, schema, counts, split labels, attribution, and statistics are hash-checked. | integration/drift | `node --test --test-name-pattern='dataset' tests/numerical-methods-batch-4.test.ts` | ❌ W0 | ⬜ pending |
| 25-02-03 | 02 | 2 | P25-SC1–SC5 | T-25-01–T-25-04 | Focused contract tests exist before Notebook, browser, lesson, and media implementation. | test scaffold | `node --test --test-name-pattern='scaffold' tests/numerical-methods-batch-4.test.ts tests/numerical-methods-batch-4-manim.test.ts` | ❌ W0 | ⬜ pending |
| 25-03-01 | 03 | 3 | P25-SC1–SC3 | T-25-02 | Notebook manual path, checks, five runs, failures, selection, and baseline execute cleanly. | integration | `python3 scripts/numerical-methods/generate-batch-4-notebook.py --check` | ❌ W0 | ⬜ pending |
| 25-03-02 | 03 | 3 | P25-SC1–SC3 | T-25-02 | JSON/CSV/summary publication rejects non-finite values, drift, and partial transactions. | integration/schema | `node --test --test-name-pattern='notebook|output|gradient|Armijo|terminal|baseline' tests/numerical-methods-batch-4.test.ts` | ❌ W0 | ⬜ pending |
| 25-04-01 | 04 | 4 | P25-SC3–SC4 | T-25-01 / T-25-03 | TypeScript parser/loader rejects malformed inputs and recomputes train-only statistics. | unit/integration | `node --test --test-name-pattern='dataset parser|dataset loader|preprocessing' tests/numerical-methods-batch-4.test.ts` | ❌ W0 | ⬜ pending |
| 25-04-02 | 04 | 4 | P25-SC3–SC4 | T-25-02 / T-25-03 | TypeScript trainer matches Notebook anchors, terminal priority, and last-finite behavior. | unit/parity | `node --test --test-name-pattern='stable BCE|gradient|Armijo|stop priority|five run parity' tests/numerical-methods-batch-4.test.ts` | ❌ W0 | ⬜ pending |
| 25-05-01 | 05 | 5 | P25-SC4–SC5 | T-25-04 | Existing content identities, routes, checkpoints, Progress keys, and synthetic modes are preserved. | source/component | `node --test --test-name-pattern='module content|companion|route order|checkpoint|progress|synthetic' tests/numerical-methods-batch-4.test.ts` | ❌ W0 | ⬜ pending |
| 25-05-02 | 05 | 5 | P25-SC4–SC5 | T-25-03 / T-25-04 | Both labs use explicit bounded computation and preserve last-finite/synthetic provenance behavior. | component/source | `node --test --test-name-pattern='MathGradientLab|TrainingDiagnosticsLab|explicit Run|last finite' tests/numerical-methods-batch-4.test.ts` | ❌ W0 | ⬜ pending |
| 25-06-01 | 06 | 6 | P25-SC5 | T-25-04 | Three six-role source packages consume locked output IDs and bilingual fallbacks. | source/media | `node --test --test-name-pattern='scene source|six-role|labels|Notebook anchors' tests/numerical-methods-batch-4-manim.test.ts` | ❌ W0 | ⬜ pending |
| 25-07-01 | 07 | 7 | P25-SC5 | T-25-04 | Shared illustration uses locked outputs and bilingual page fallback. | asset/source | `node --test --test-name-pattern='shared illustration' tests/numerical-methods-batch-4.test.ts` | ❌ W0 | ⬜ pending |
| 25-07-02 | 07 | 7 | P25-SC5 | T-25-07 | Renderer publishes three valid video/poster pairs and complete metadata without removing prior media. | asset/media | `python3 scripts/manim/render_numerical_methods_batch_4.py --check && node --test tests/numerical-methods-batch-4-manim.test.ts` | ❌ W0 | ⬜ pending |
| 25-08-01 | 08 | 8 | P25-SC1–SC5 | T-25-01–T-25-10 | Focused/full/generator/media/build/Pages/security gates pass and scope is clean. | release | `npm test && npm run build && npm run build:pages && npm run security:audit` | ✅ infrastructure | ⬜ pending |
| 25-09-01 | 09 | 9 | P25-SC4–SC5 | T-25-05 / T-25-11 | Eight-state browser, interaction, fallback, route, checkpoint, and Progress matrix passes. | manual browser | Human checkpoint | ✅ checkpoint | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `tests/numerical-methods-batch-4.test.ts` — dataset, stable objective, gradient, stopping, parity, lesson, route, download, and hash contract.
- [ ] `tests/numerical-methods-batch-4-manim.test.ts` — three six-role packages, labels, exact Notebook anchors, media probes, and integrity.
- [ ] `scripts/numerical-methods/generate-batch-4-notebook.py` — clean-kernel generation, transactional publication, standalone rerun, and `--check`.
- [ ] `scripts/manim/render_numerical_methods_batch_4.py` — Notebook-bound rendering, transactional publication, poster/transcript/metadata generation, and `--check`.
- [ ] Human verification checkpoint for the research-flagged `scikit-learn==1.9.0` pin before requirements installation or modification.

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Confirm the new Python package pin is the official scikit-learn distribution | P25-SC2 | The package-legitimacy seam could not resolve download/repository metadata automatically. | Before editing `requirements.txt`, confirm the project name, version, PyPI publisher page, official documentation, and `https://github.com/scikit-learn/scikit-learn`; record approval in the execution checkpoint. |
| Bilingual responsive browser matrix | P25-SC5 | Layout, keyboard flow, video fallback, and teaching readability need browser observation. | Open both routes in Chinese and English at desktop and 390×844; verify no overflow/console errors, all local downloads resolve under default and Pages base paths, checkpoints still submit, and reduced-motion/video-failure fallbacks preserve the teaching content. |

---

## Threat References

- **T-25-01 — malformed or replaced static data:** enforce hash, byte, schema, count, split, and finite-value checks before use.
- **T-25-02 — non-finite numerical output:** use logit-domain BCE, bounded iterations/backtracking, `allow_nan=False`, and last-finite terminal semantics.
- **T-25-03 — unsafe learner input or excessive recomputation:** clamp finite controls, require explicit Run, and never silently substitute invalid parameters.
- **T-25-04 — unsafe or drifting learner content/media:** use typed bilingual copy, sanitized Markdown, base-safe local paths, and metadata/hash checks.

---

## Validation Sign-Off

- [ ] All finalized plan tasks have an automated verification command or a declared Wave 0 dependency.
- [ ] Sampling continuity: no three consecutive implementation tasks lack an automated check.
- [ ] Wave 0 covers every missing test/generator reference.
- [ ] No watch-mode flags are used.
- [ ] Focused feedback latency remains under 10 seconds.
- [ ] Notebook and TypeScript anchors use absolute `1e-9` scalar and `1e-8` parameter tolerances rather than byte equality.
- [ ] `nyquist_compliant: true` and `wave_0_complete: true` are set only after the test/generator files exist and pass.

**Approval:** pending plan-checker verification
