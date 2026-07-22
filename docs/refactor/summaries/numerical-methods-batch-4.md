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

The full repository test/build/security gates are owned by Plan 25-12 Task 2 and are not claimed by this first release-gate commit.

## Preserved Boundaries

- No new route, backend, browser Python runtime, account, durable Progress store, scoring gate, optimizer-family repetition, Newton/IRLS path, L2/threshold-tuning surface, or broader evaluation workflow was added.
- The `optimization` and `training-diagnostics` IDs, routes, quizzes, checkpoints, Progress behavior, and existing primary lab IDs remain unchanged.
- Runtime computation remains deterministic TypeScript; Python is limited to the published offline Notebook pipeline.
- `docs/gpt_advice.md`, `.planning/config.json`, caches, builds, temporary media, virtual environments, unrelated images, and generated runtime directories remain outside the delivery diff.
- Browser acceptance is explicitly pending for Plan 25-13; this record makes no Chinese/English desktop or 390×844 browser claim.
