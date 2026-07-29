# Numerical Methods Batch 4 Completion

**Completed:** 2026-07-22

**Branch:** `codex/numerical-methods-batch-4-design`

**Scope:** `optimization` and `training-diagnostics`

## Delivered

- Rebuilt the two existing Math Lab lessons around one local UCI Banknote Authentication logistic-regression case while preserving their URLs, checkpoints, Progress storage, and one-primary-lab-per-chapter structure.
- Published the verified 1,372-row local snapshot with a fixed stratified `960/206/206` train/validation/test split and train-only population standardization.
- Published one shared executed Chinese Notebook, four locked JSON/CSV outputs, the exact eight-pin requirements file, and local downloads used by both lessons.
- Added deterministic TypeScript dataset and logistic-training engines that independently reproduce the five accepted-state traces, terminal meanings, finite-difference gradient check, fixed-step behavior, and Armijo behavior.
- Retained the five earlier deterministic synthetic training scenarios as explicitly labeled support examples rather than Banknote results.
- Published one shared 1664×936 illustration and three local silent 1920×1080@30fps Manim videos with posters, bilingual page fallbacks, transcripts, summaries, labels, and integrity metadata.

## Locked Results

### Data and numerical contract

- Dataset SHA-256: `04c25b8d1ffaada3c392682185a94b089b7fd214ac82eabeb07faaa3d9a1efaf`.
- Split counts: train `960`, validation `206`, test `206`; standardization is fit on train only with `ddof=0`.
- Stable BCE remains finite for logits `+1000` and `-1000` where the isolated naive probability-domain probe does not.
- Centered finite-difference maximum gradient error: `8.32334340339358e-11`; L2 excludes the intercept.
- Armijo rejects the initial trial `32`, accepts `16` after one backtrack, and every accepted row satisfies sufficient decrease.

### Five accepted-state traces

| Run | Step/method | Trace rows | Best validation | Terminal |
| --- | --- | ---: | --- | --- |
| `raw-fixed` | fixed `4` | 113 | iter `52`, BCE `0.031908920166439064` | model selection: `validation-patience`, iter `112` |
| `standardized-too-small` | fixed `0.02` | 501 | iter `500`, BCE `0.288343568660986` | safety: `max-iterations`, iter `500` |
| `standardized-stable` | fixed `4` | 485 | iter `484`, BCE `0.06825592665802883` | mathematical convergence: `gradient-norm`, iter `484` |
| `standardized-too-large` | fixed `32` | 74 | iter `13`, BCE `0.05885315617651155` | model selection: `validation-patience`, iter `73` |
| `standardized-armijo` | Armijo from `32` | 49 | iter `48`, BCE `0.06824699289297452` | mathematical convergence: `gradient-norm`, iter `48` |

The unstable transient minimum cannot win final selection. The selected `standardized-armijo` checkpoint is iteration `48` and reports test BCE `0.055110123229490826`, accuracy `0.9805825242718447`, ROC-AUC `0.9994279176201373`, and confusion matrix `[[110,4],[0,92]]` at threshold `0.5`. The pinned scikit-learn `1.9.0` LBFGS endpoint reports test BCE `0.05509807557568522`, identical accuracy/ROC-AUC/confusion matrix, prediction agreement `1`, and coefficient-direction cosine `0.9999999991335304`; it is an endpoint check, not a per-iteration comparison.

## Offline Cache and Isolated-Kernel Audit

- Declared cache: `.cache/numerical-methods/batch-4-wheelhouse`.
- Cache contract: `numerical-methods-batch-4-v1`; cache manifest SHA-256 `95ca3095110658363933ecfa7c64dc5935e03c09119a612603c38fec30bc78e1`.
- Committed requirements and manifest requirements identity both equal SHA-256 `6aa97ceaa992923a5543e778113fb12bb87144f1e082d9a38457a5f55c1c1530`.
- Audited cache inventory: `99/99` wheels, `90,141,839` declared bytes, all names, sizes, and SHA-256 values matched; no unexpected wheel file was present.
- Host identity matched the manifest: CPython `3.12.13` (`cpython-312`) on Darwin arm64, platform `macosx-11.0-arm64`.
- A fresh venv installed only through `pip --no-index --find-links=<audited-wheel-cache>` with `PIP_NO_INDEX=1`; no bootstrap, package-index request, or dependency download command was run in this release task.
- Exact imports and versions passed for all eight pins: `numpy==2.4.6`, `pandas==3.0.3`, `scipy==1.17.1`, `nbformat==5.10.4`, `nbclient==0.11.0`, `jupyterlab==4.6.1`, `ipykernel==7.3.0`, and `scikit-learn==1.9.0`.
- The generated Notebook and copied standalone/download-form Notebook both executed through the unique temp-prefix kernelspec backed by that fresh venv; the standalone outputs matched the generated outputs byte-for-byte.
- Both isolated invocations completed cleanup. The verifier confirmed removal of its venv, kernelspec, and scoped Jupyter/IPython state; a post-gate scan found `0` `ml-atlas-batch4-environment-*` or `ml-atlas-batch4-notebook-*` temp directories.

## Automated Validation

### Focused reproducibility and integrity gates

- `node --test tests/numerical-methods-batch-4.test.ts tests/numerical-methods-batch-4-manim.test.ts`: pass, `37/37` tests, `0` failures.
- `python3 scripts/numerical-methods/generate-batch-4-notebook.py --verify-environment --wheel-cache .cache/numerical-methods/batch-4-wheelhouse`: pass; fresh cache-only eight-pin environment, exact imports, selected temporary kernel, and complete cleanup verified.
- `python3 scripts/numerical-methods/generate-batch-4-notebook.py --check --wheel-cache .cache/numerical-methods/batch-4-wheelhouse`: pass; generated and standalone executions are current, finite, cache-only, and byte-identical to committed artifacts.
- `python3 scripts/manim/render_numerical_methods_batch_4.py --check`: pass; all three scenes, documents, Notebook anchors, media probes, and hashes are in sync.
- `git diff --check`: pass, no whitespace errors.

### Full repository release gates

- `npm test`: final pass, `755/755` tests, `0` failures.
- `npm run build`: pass under Vite `8.0.16`; the existing chunks-larger-than-`1400 kB` advisory remains.
- `npm run build:pages`: pass under Vite `8.0.16` with the same existing advisory.
- `npm run security:audit`: final pass, `0 vulnerabilities`.
- Final `git diff --check`: pass, no whitespace errors.

The first post-security-patch full test run reported file-worker failures for `tests/math-to-code-functions.test.ts` and `tests/math-to-code-route.test.ts` (`753/755`). The exact two-file reproduction immediately passed `23/23`, and the next complete `npm test` passed `755/755` without a code change. This transient runner result is recorded rather than hidden; no deterministic product regression reproduced.

### Security remediation observed during release

The first planned audit exited `1` with one high-severity advisory, `GHSA-v245-v573-v5vm`, because the lock and installed tree contained `linkify-it@5.0.1`. The affected range is `<=5.0.1`; the patched `5.0.2` remains compatible with `markdown-it@14.2.0`'s existing `^5.0.1` constraint. Commit `4733e43` made the minimal transitive lockfile update, after which the lock and installed tree both reported `linkify-it@5.0.2`, the focused/full regressions and both builds passed, and the exact audit returned `0 vulnerabilities`.

## Decision and Requirement Ownership Audit

Every decision has a passing automated owner in the final Phase 25 state. The browser-only observations remain explicitly assigned to Plan 25-13.

| Decision | Passing automated owner |
| --- | --- |
| D-01 | `module content and companions form two complete bilingual Banknote teaching loops` |
| D-02 | `Batch 4 dataset provenance, schema, hashes, split counts, and train statistics are locked` |
| D-03 | Dataset provenance test plus `train-only preprocessing is recomputed from parsed rows` |
| D-04 | Preservation scaffold and `one primary lab, route order, checkpoints, progress, and synthetic provenance stay exact` |
| D-05 | Executed Notebook/finite-trace publication test plus five-run TypeScript parity |
| D-06 | Extreme BCE/gradient fixture test plus exact five-run inventory assertions |
| D-07 | Notebook Armijo/terminal-priority test plus typed six-terminal TypeScript test |
| D-08 | Output-manifest, JSON/CSV parity, explicit optimization-lab milestone, and local-download tests |
| D-09 | Isolated-environment boundary test plus cache-only Notebook `--check` |
| D-10 | Bilingual module-content test locks optimization ownership and the linked optimizer-comparison handoff |
| D-11 | Bilingual module-content and real-trace diagnostics-lab tests lock the four-step diagnosis |
| D-12 | Shared companion identity, executed Notebook, and chapter-specific output-ID tests |
| D-13 | Preservation and one-primary-lab tests lock both existing lab IDs and synthetic modes |
| D-14 | Schema-first Pandas/clean-kernel test plus Notebook stable-function and manual numerical cells |
| D-15 | Clean Notebook test asserts the exact five-function definition order; module content asserts the same names |
| D-16 | Endpoint-only baseline test locks scikit-learn `1.9.0` and rejects per-iteration claims |
| D-17 | Notebook and TypeScript centered-gradient, Armijo, terminal, non-finite, and anchor tests |
| D-18 | Notebook and TypeScript gradient tests prove that L2 excludes the intercept |
| D-19 | JSON/CSV accepted-row parity and five-run TypeScript trace-parity tests |
| D-20 | Endpoint report test locks selected run, threshold `0.5`, probability ROC-AUC, and compact metrics |
| D-21 | Module-content and output-ownership tests separate five-run comparison from cross-run interpretation |
| D-22 | Explicit draft/run-state optimization-lab test plus bounded invalid-control validation test |
| D-23 | Real preset trace comparison/curve-toggle diagnostics-lab source contract |
| D-24 | Exact `Number.MAX_VALUE`, last-finite, failed-line-search, validation, and one-variable-suggestion tests; Plan 25-13 still owns browser interaction observation |
| D-25 | Full five-run TypeScript/Notebook parity and both no-browser-Python lab contracts |
| D-26 | Shared illustration PNG/provenance and reference-identical bilingual fallback tests |
| D-27 | Three-scene source, metadata, H.264/ffprobe, route-binding, and renderer `--check` tests |
| D-28 | Notebook-anchor/hash binding test plus offline write-free renderer `--check` |
| D-29 | Bilingual label/static fallback, shared illustration fallback, metadata, media hash, and route-binding tests |

| Requirement | Passing automated owner | Browser status |
| --- | --- | --- |
| P25-SC1 | Dataset/split tests, clean executed Notebook, exact five-run traces, cache-only environment and Notebook checks | No additional browser claim required |
| P25-SC2 | Stable BCE, centered gradient, exact eight-pin imports, manual/scikit endpoint tests | No additional browser claim required |
| P25-SC3 | Armijo, typed terminal priority, full finite traces, CSV/JSON parity, final-selection tests | No additional browser claim required |
| P25-SC4 | Dataset/logistic TypeScript tests, all-five-run parity, explicit-run/last-finite lab contracts | Exact desktop/mobile and `Number.MAX_VALUE` interaction remains pending Plan 25-13 |
| P25-SC5 | Bilingual content, local downloads, shared illustration, three Manim packages, `755/755`, both builds, and `0 vulnerabilities` | Chinese/English desktop and 390×844 matrix remains pending Plan 25-13 |

## Preserved Boundaries

- No new route, backend, browser Python runtime, account, durable Progress store, scoring gate, optimizer-family repetition, Newton/IRLS path, L2/threshold-tuning surface, or broader evaluation workflow was added.
- The `optimization` and `training-diagnostics` IDs, routes, quizzes, checkpoints, Progress behavior, and existing primary lab IDs remain unchanged.
- Runtime computation remains deterministic TypeScript; Python is limited to the published offline Notebook pipeline.
- `docs/gpt_advice.md`, `.planning/config.json`, caches, builds, temporary media, virtual environments, unrelated images, and generated runtime directories remain outside the delivery diff.
- Browser acceptance is explicitly pending for Plan 25-13; this record makes no Chinese/English desktop or 390×844 browser claim.
