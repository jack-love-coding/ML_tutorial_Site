---
phase: 25
slug: numerical-methods-batch-4-logistic-regression-optimization-a
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-07-21
---

# Phase 25 — Validation Strategy

> Per-phase validation contract with honest separation between fast feedback and long publication/release gates.

## Test Infrastructure

| Property | Value |
|----------|-------|
| Framework | Node built-in test runner under Node 24.x |
| Quick numerical/content command | `node --test tests/numerical-methods-batch-4.test.ts` |
| Quick media-source command | `node --test --test-name-pattern='scene source|six-role|labels|renderer contract' tests/numerical-methods-batch-4-manim.test.ts` |
| Full suite | `npm test` |
| Fast feedback target | Filtered Node tests, Python compilation, and JSON parsing should finish under 10 seconds. |
| Long-gate expectation | Isolated environment installation, clean Notebook generation/check, three-video rendering, full builds, and security audit may exceed 30 seconds and run only at their declared publication/release boundary. |

## Sampling Rate

- After ordinary source/code tasks: run the narrow filtered Node test, `py_compile`, or `json.tool` check named by the task; target under 10 seconds.
- After Plan 02 Task 1: run the isolated eight-pin environment install/version check once; classify it as a long prerequisite, not task-level fast feedback.
- After Plan 03 publication: run Notebook generation/`--check` once; classify it as a long integration gate.
- After Plans 06–08: run only source compilation and JSON parsing. Plan 10 runs the consolidated fast source-contract test after all three packages exist.
- After Plan 11: run the three-video render once, then renderer `--check` and media tests; classify it as a long publication gate.
- Plan 12 owns the long full suite, builds, Pages build, security audit, and final drift checks.
- Plan 13 owns the manual browser matrix. No watch-mode command is allowed.

## Per-Task Verification Map

| Task ID | Plan/Wave | Requirement | Threat | Latency | Automated command / gate | Status |
|---|---|---|---|---|---|---|
| 25-01-01 | 01/W1 | P25-SC2 | T-25-SC | manual blocker | Human approves exact `scikit-learn==1.9.0` identity before any edit/install | ⬜ pending |
| 25-02-01 | 02/W2 | P25-SC1–SC3 | T-25-02, T-25-SC | long prerequisite | Contract checks plus fresh `mktemp` venv install and eight-version assertion | ⬜ pending |
| 25-02-02 | 02/W2 | P25-SC1 | T-25-01 | long source refresh | `python3 scripts/numerical-methods/generate-batch-4-notebook.py --refresh-source` | ⬜ pending |
| 25-02-03 | 02/W2 | P25-SC1–SC5 | T-25-01–04 | fast | filtered dataset/contract/scaffold Node tests | ⬜ pending |
| 25-03-01 | 03/W3 | P25-SC1–SC3 | T-25-02 | long integration | generate clean Notebook; assert Pandas `read_csv`, schema record, five runs, failures, and baseline | ⬜ pending |
| 25-03-02 | 03/W3 | P25-SC1–SC3 | T-25-02 | long drift | `python3 scripts/numerical-methods/generate-batch-4-notebook.py --check` | ⬜ pending |
| 25-03-03 | 03/W3 | P25-SC1–SC3 | T-25-02 | fast | filtered notebook/output/Pandas/gradient/terminal Node tests | ⬜ pending |
| 25-04-01 | 04/W4 | P25-SC3–SC4 | T-25-01,03 | fast | filtered parser/loader/preprocessing tests | ⬜ pending |
| 25-04-02 | 04/W4 | P25-SC3–SC4 | T-25-02,03 | fast | filtered stable-BCE/Armijo/terminal/parity/non-finite-probe tests | ⬜ pending |
| 25-05-01 | 05/W5 | P25-SC4–SC5 | T-25-04 | fast | filtered module/companion/preservation tests | ⬜ pending |
| 25-05-02 | 05/W5 | P25-SC4–SC5 | T-25-03–05 | fast | filtered download/lazy-lab/public-base tests | ⬜ pending |
| 25-05-03 | 05/W5 | P25-SC4–SC5 | T-25-03,04 | fast | filtered lab/explicit-Run/last-finite/synthetic tests | ⬜ pending |
| 25-06-01 | 06/W4 | P25-SC5 | T-25-04,06 | fast | feature scene `py_compile` plus tree/labels `json.tool` | ⬜ pending |
| 25-07-01 | 07/W4 | P25-SC5 | T-25-04,06 | fast | Armijo scene `py_compile` plus tree/labels `json.tool` | ⬜ pending |
| 25-08-01 | 08/W4 | P25-SC5 | T-25-04,06 | fast | diagnostics scene `py_compile` plus tree/labels `json.tool` | ⬜ pending |
| 25-09-01 | 09/W6 | P25-SC5 | T-25-04,08 | fast | filtered shared-illustration/content test | ⬜ pending |
| 25-10-01 | 10/W5 | P25-SC5 | T-25-04 | fast | compile shared helpers and all scene sources | ⬜ pending |
| 25-10-02 | 10/W5 | P25-SC5 | T-25-04,07 | fast | compile renderer plus consolidated source/renderer-contract test | ⬜ pending |
| 25-11-01 | 11/W6 | P25-SC5 | T-25-07,08 | long publication | render three videos, run `--check`, then full media test | ⬜ pending |
| 25-12-01 | 12/W7 | P25-SC1–SC5 | T-25-01–09 | mixed release | focused tests plus Notebook/media drift checks | ⬜ pending |
| 25-12-02 | 12/W7 | P25-SC1–SC5 | T-25-09,10 | long release | `npm test && npm run build && npm run build:pages && npm run security:audit` | ⬜ pending |
| 25-13-01 | 13/W8 | P25-SC4–SC5 | T-25-05,11 | manual browser | Eight-state matrix plus exact raw/fixed/`Number.MAX_VALUE`/10 non-finite probe | ⬜ pending |

## Wave 0 Requirements

- [ ] `tests/numerical-methods-batch-4.test.ts` — dataset, Pandas-loading proof, objective, gradient, stopping, parity, lesson, route, download, and hash contract.
- [ ] `tests/numerical-methods-batch-4-manim.test.ts` — three six-role packages, labels, exact Notebook anchors, renderer/media probes, and integrity.
- [ ] `scripts/numerical-methods/generate-batch-4-notebook.py` — clean-kernel generation, transactional publication, standalone rerun, and `--check`.
- [ ] `scripts/manim/render_numerical_methods_batch_4.py` — Notebook-bound rendering, transactional publication, poster/metadata generation, and `--check`.
- [ ] Human verification of exact `scikit-learn==1.9.0` identity before requirements modification or installation.

## Manual-Only Verifications

| Behavior | Requirement | Exact procedure |
|---|---|---|
| Package identity | P25-SC2 | Before Plan 02, verify exact version on PyPI, official scikit-learn docs, and official GitHub source; record `approved scikit-learn==1.9.0`. |
| Bilingual responsive matrix | P25-SC5 | Both routes × both locales × desktop/390×844; no overflow/errors; assets/checkpoints/Progress/fallbacks pass. |
| Deterministic D-24 browser failure | P25-SC4 | Advanced controls: raw, fixed, learning rate `1.7976931348623157e308`, gradient tolerance `1e-5`, maximum iterations `10`; Run must show `non-finite`, attempted iteration 1, last-finite iteration 0, and lower-learning-rate suggestion without adding a sixth preset. |

## Validation Sign-Off

- [ ] Every implementation task has an automated command or explicit long-gate owner.
- [ ] Fast task feedback is distinguished from long environment/Notebook/media/release gates.
- [ ] No three consecutive implementation tasks lack an automated check.
- [ ] Notebook/TypeScript anchors use absolute `1e-9` scalar and `1e-8` parameter tolerances.
- [ ] `nyquist_compliant: true` and `wave_0_complete: true` are set only after required files exist and pass.

**Approval:** pending plan-checker verification and the unresolved Plan 01 human package gate.
