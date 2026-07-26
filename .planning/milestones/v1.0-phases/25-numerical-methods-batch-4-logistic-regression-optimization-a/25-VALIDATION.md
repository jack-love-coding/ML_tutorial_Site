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
| Long-gate expectation | One approved network bootstrap of the local wheel cache, cache-only isolated environment creation, clean Notebook generation/check, three-video rendering, full builds, and security audit may exceed 30 seconds and run only at their declared boundary. |

## Sampling Rate

- After ordinary source/code tasks: run the narrow filtered Node test, `py_compile`, or `json.tool` check named by the task; target under 10 seconds.
- After Plan 02 Task 1: verify the durable Plan 01 approval, run `--bootstrap-environment-cache` once, then cache-only `--verify-environment`; the ignored cache is `.cache/numerical-methods/batch-4-wheelhouse`.
- Plan 02 Task 2 may network only for the hash-gated UCI source; `--refresh-source --wheel-cache .cache/numerical-methods/batch-4-wheelhouse` must create a fresh cache-only eight-pin environment and clean it afterward.
- After Plan 03 publication: run normal generation and `--check` with that wheel cache; both create fresh temp venvs/kernels, use `--no-index`, verify all eight pins/imports, standalone-rerun, and clean up.
- After Plans 06–08: run only source compilation and JSON parsing. Plan 10 runs the consolidated fast source-contract test after all three packages exist.
- After Plan 11: run the three-video render once, then renderer `--check` and media tests; classify it as a long publication gate.
- Plan 12 owns offline cache-only environment/Notebook drift checks plus the long full suite, builds, Pages build, security audit, and final drift checks; it must not bootstrap or download.
- Plan 13 owns the manual browser matrix. No watch-mode command is allowed.

## Per-Task Verification Map

| Task ID | Plan/Wave | Requirement | Threat | Latency | Automated command / gate | Status |
|---|---|---|---|---|---|---|
| 25-01-01 | 01/W1 | P25-SC2 | T-25-SC | fast prerequisite | Machine-check the durable 2026-07-22 `approved scikit-learn==1.9.0` record and three official anchors; do not prompt again | ⬜ pending |
| 25-02-01 | 02/W2 | P25-SC1–SC3 | T-25-02, T-25-SC | long prerequisite | Approved cache bootstrap, then cache-only `--verify-environment` with `pip --no-index`, eight-version/import checks, temp kernel selection, and cleanup | ⬜ pending |
| 25-02-02 | 02/W2 | P25-SC1 | T-25-01,02 | long source refresh | `python3 scripts/numerical-methods/generate-batch-4-notebook.py --refresh-source --wheel-cache .cache/numerical-methods/batch-4-wheelhouse`; network only for hash-gated UCI bytes, cache-only fresh eight-pin environment, cleanup | ⬜ pending |
| 25-02-03 | 02/W2 | P25-SC1–SC5 | T-25-01–04 | fast | filtered dataset/contract/scaffold Node tests | ⬜ pending |
| 25-03-01 | 03/W3 | P25-SC1–SC3 | T-25-02 | long integration | normal generation with `--wheel-cache .cache/numerical-methods/batch-4-wheelhouse`; isolated kernel, standalone rerun, Pandas/schema/five runs/baseline, cleanup | ⬜ pending |
| 25-03-02 | 03/W3 | P25-SC1–SC3 | T-25-02 | long drift | cache-only/write-free `--check --wheel-cache .cache/numerical-methods/batch-4-wheelhouse`, standalone rerun, cleanup | ⬜ pending |
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
| 25-12-01 | 12/W7 | P25-SC1–SC5 | T-25-01–09 | mixed release | focused tests plus cache-only environment verification, isolated Notebook/media drift, and cleanup checks; no bootstrap/download | ⬜ pending |
| 25-12-02 | 12/W7 | P25-SC1–SC5 | T-25-09,10 | long release | `npm test && npm run build && npm run build:pages && npm run security:audit` | ⬜ pending |
| 25-13-01 | 13/W8 | P25-SC4–SC5 | T-25-05,11 | manual browser | Eight-state matrix plus exact raw/fixed/`Number.MAX_VALUE`/10 non-finite probe | ⬜ pending |

## Wave 0 Requirements

- [ ] `tests/numerical-methods-batch-4.test.ts` — dataset, Pandas-loading proof, objective, gradient, stopping, parity, lesson, route, download, and hash contract.
- [ ] `tests/numerical-methods-batch-4-manim.test.ts` — three six-role packages, labels, exact Notebook anchors, renderer/media probes, and integrity.
- [ ] `scripts/numerical-methods/generate-batch-4-notebook.py` — explicit cache bootstrap, cache-only per-invocation temp venv/kernel, eight-version/import checks, generation, standalone rerun, `finally` cleanup, and write-free `--check`.
- [ ] `scripts/manim/render_numerical_methods_batch_4.py` — Notebook-bound rendering, transactional publication, poster/metadata generation, and `--check`.
- [x] Human verification of exact `scikit-learn==1.9.0` identity recorded in `25-RESEARCH.md` on 2026-07-22 before requirements modification or installation.

## Isolated Environment and Offline Contract

1. Plan 01 verifies the completed 2026-07-22 human approval record and fails closed if its exact text or official anchors are missing; it must not prompt again.
2. Plan 02 then runs the only network-enabled command: `python3 scripts/numerical-methods/generate-batch-4-notebook.py --bootstrap-environment-cache --wheel-cache .cache/numerical-methods/batch-4-wheelhouse`. The ignored cache records requirements, Python/platform, and wheel hashes.
3. `--verify-environment`, `--refresh-source`, normal generation, and `--check` never bootstrap package dependencies. Missing/stale cache fails with the exact command above. Installs use `pip --no-index --find-links=.cache/numerical-methods/batch-4-wheelhouse` and `PIP_NO_INDEX=1`; only `--refresh-source` may access the network, exclusively for hash-gated UCI source bytes.
4. Each invocation creates a new temp venv, verifies exact versions/imports for all eight pins, registers that venv's ipykernel under a temp prefix, scopes all Jupyter directories there, and selects that kernel; ambient third-party packages never execute cells.
5. Normal generation and `--check` execute both generated and copied standalone/download-form Notebooks through the isolated kernel. `--check` regenerates and byte-compares only in temp directories and writes nothing.
6. One outer `finally` removes temp venv, kernelspec, Jupyter/IPython state, worker output, and standalone-rerun directory on every exit. The wheel cache remains ignored for later offline gates.

## Manual-Only Verifications

| Behavior | Requirement | Exact procedure |
|---|---|---|
| Package identity | P25-SC2 | Completed 2026-07-22: `25-RESEARCH.md` records `approved scikit-learn==1.9.0` plus exact official PyPI, docs, and GitHub anchors; Plan 01 machine-checks it without prompting. |
| Bilingual responsive matrix | P25-SC5 | Both routes × both locales × desktop/390×844; no overflow/errors; assets/checkpoints/Progress/fallbacks pass. |
| Deterministic D-24 browser failure | P25-SC4 | Advanced controls: raw, fixed, learning rate `1.7976931348623157e308`, gradient tolerance `1e-5`, maximum iterations `10`; Run must show `non-finite`, attempted iteration 1, last-finite iteration 0, and lower-learning-rate suggestion without adding a sixth preset. |

## Validation Sign-Off

- [ ] Every implementation task has an automated command or explicit long-gate owner.
- [ ] Fast task feedback is distinguished from long environment/Notebook/media/release gates.
- [ ] No three consecutive implementation tasks lack an automated check.
- [ ] Notebook/TypeScript anchors use absolute `1e-9` scalar and `1e-8` parameter tolerances.
- [ ] `nyquist_compliant: true` and `wave_0_complete: true` are set only after required files exist and pass.

**Approval:** package identity resolved by explicit human approval on 2026-07-22; pending plan-checker verification only.
