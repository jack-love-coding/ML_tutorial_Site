# Numerical Methods Batch 4 Contract

**Contract version:** `numerical-methods-batch-4-v1`

**Status:** Locked for implementation on 2026-07-22

**Modules:** `optimization`, `training-diagnostics`

**Route:** `numerical-deepening-path`

## Continuous teaching case

Both chapters use one binary logistic-regression case over a verified local snapshot of UCI Banknote Authentication. The optimization chapter owns stable binary cross-entropy (BCE), feature scale, fixed-step gradient descent, Armijo backtracking, stopping semantics, and explicit safety exits. The training-diagnostics chapter reads those same locked traces through observation, plausible cause, one changed variable, and an expected next-run result. The existing deterministic synthetic scenarios remain separately labeled support examples.

The source record does not define human-readable meanings for target values. All course surfaces therefore say `class 0` and `class 1`; they do not claim a genuine/forged mapping.

## Approved Python environment

The durable approval record in `25-RESEARCH.md` authorizes only the exact official distribution `scikit-learn==1.9.0`, after checking the official PyPI release, `LogisticRegression` API, and GitHub repository. No alternate name or publisher is authorized. The committed environment has exactly these eight direct pins:

| Distribution | Version | Import |
|---|---:|---|
| `numpy` | `2.4.6` | `numpy` |
| `pandas` | `3.0.3` | `pandas` |
| `scipy` | `1.17.1` | `scipy` |
| `nbformat` | `5.10.4` | `nbformat` |
| `nbclient` | `0.11.0` | `nbclient` |
| `jupyterlab` | `4.6.1` | `jupyterlab` |
| `ipykernel` | `7.3.0` | `ipykernel` |
| `scikit-learn` | `1.9.0` | `sklearn` |

`--bootstrap-environment-cache --wheel-cache .cache/numerical-methods/batch-4-wheelhouse` is the sole package-network operation. It atomically records the requirements hash, Python/platform identity, and every downloaded wheel hash. Every other mode fails closed when that ignored cache is missing or stale, installs with `pip --no-index`, and creates a unique temporary venv plus temp-prefix kernelspec. `JUPYTER_PATH`, `JUPYTER_CONFIG_DIR`, `JUPYTER_RUNTIME_DIR`, and `IPYTHONDIR` are scoped to the same temporary root. The venv, kernelspec, and Jupyter state are removed in `finally`; ambient third-party packages are never authoritative.

## Locked artifacts

- Contract: `docs/curriculum-v3/numerical-methods/batch-4-contract.md`
- Dataset: `public/datasets/numerical-methods/banknote-authentication.csv`
- Dataset manifest: `public/datasets/numerical-methods/banknote-authentication-manifest.json`
- Data dictionary: `public/datasets/numerical-methods/banknote-authentication-data-dictionary.json`
- Shared executed Notebook: `public/notebooks/numerical-methods/banknote-logistic-optimization.zh-CN.ipynb`
- Optimization summary: `public/notebooks/numerical-methods/batch-4-outputs/optimization-summary.json`
- Diagnostics summary: `public/notebooks/numerical-methods/batch-4-outputs/training-diagnostics-summary.json`
- Full traces: `public/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.json` and `.csv`
- Output manifest: `public/notebooks/numerical-methods/batch-4-outputs/manifest.json`
- Shared illustration: `public/math-lab/numerical-methods/banknote-optimization-diagnostics.png`
- Canonical media IDs: `banknote-feature-scaling`, `banknote-fixed-vs-armijo`, `banknote-training-diagnostics`

## Dataset provenance and normalized schema

| Item | Locked value |
|---|---|
| Official page | `https://archive.ics.uci.edu/dataset/267/banknote%2Bauthentication` |
| DOI | `10.24432/C55P57` |
| License | CC BY 4.0 |
| Official ZIP | `https://archive.ics.uci.edu/static/public/267/banknote+authentication.zip` |
| ZIP SHA-256 | `1e2acd9a2085fadf3d8145c12d3d22af853320d52294a6590c2eaf75fdc05227` |
| Raw member | `data_banknote_authentication.txt` |
| Raw member bytes | `46400` |
| Raw member SHA-256 | `d0539aaed2139ba7a587b3e34fb345ce503ff7d5d33dbf9912d8e195ce425cb9` |
| Normalized header | `banknote_id,variance,skewness,curtosis,entropy,class,split` |
| Rows/classes | `1372`; class 0=`762`, class 1=`610` |

The normalized CSV remains in original UCI row order with stable one-based IDs, finite feature values, integer classes, persisted split labels, and the source spelling `curtosis`.

## Split and preprocessing boundary

Python creates the split once with:

1. `train_test_split(ids, test_size=412, stratify=y, random_state=20260725)`;
2. `train_test_split(holdout_ids, test_size=206, stratify=holdout_y, random_state=20260726)`.

The exact counts are train `960=[533,427]`, validation `206=[115,91]`, and test `206=[114,92]`, where each bracket is `[class 0,class 1]`. The Notebook and browser consume the persisted labels and never reproduce scikit-learn RNG behavior.

Mean and population scale (`ddof=0`) are fitted on training rows only:

| Feature | Mean | Population scale |
|---|---:|---:|
| variance | `0.46886307781249986` | `2.8049705227712813` |
| skewness | `1.9775978456250036` | `5.81400805653475` |
| curtosis | `1.3202396866562518` | `4.234924404032209` |
| entropy | `-1.1418097847916664` | `2.0726581960156034` |

## Objective, independent checks, and constants

For `z=Xw+b`, the data BCE is `mean(logaddexp(0,z)-y*z)`. The penalized training objective is

$$J(w,b)=\frac1n\sum_i[\log(1+e^{z_i})-y_i z_i]+\frac{10^{-3}}2\lVert w\rVert_2^2.$$

The intercept is excluded from L2. Validation and test BCE exclude L2. At probe parameters `[0.2,-0.1,0.05,0.15,-0.3]`, centered differences with `h=1e-6` have locked maximum gradient error `9.095135755643469e-11`.

The extreme-logit check is not a sixth run: naive probability-domain BCE is non-finite for the locked `±1000` cases, while logit-domain BCE returns `1000.0` for wrong extreme predictions and `0.0` for correct ones.

Shared constants are zero initialization, `lambda=1e-3`, `maxIterations=500`, `gradientTolerance=1e-5`, `relativeLossTolerance=1e-10`, `parameterStepTolerance=1e-7`, `validationMinDelta=1e-7`, and `validationPatience=60`. Armijo uses initial alpha `32`, `c=1e-4`, `rho=0.5`, `maxBacktracks=30`, and `minimumAlpha=1e-12`.

## Five-run matrix

| Run ID | Space/method/step | Locked terminal |
|---|---|---|
| `raw-fixed` | raw/fixed/`4.0` | `validation-patience` at 112; best iteration 52, validation BCE `0.0319089202`; terminal BCE `0.0369589246`, gradient norm `0.0626808802`, step norm `0.2498883459` |
| `standardized-too-small` | standardized/fixed/`0.02` | `max-iterations` at 500; terminal BCE `0.2883435687`, gradient norm `0.1100622170`, step norm `0.0022037331` |
| `standardized-stable` | standardized/fixed/`4.0` | `gradient-norm` at 484; terminal/best BCE `0.0682559267`, gradient norm `9.9168892e-6`, step norm `4.0221344e-5` |
| `standardized-too-large` | standardized/fixed/`32.0` | `validation-patience` at 73; best iteration 13, BCE `0.0588531562`; terminal BCE `0.0828503987`, gradient norm `0.0346199220`, step norm `1.1069136513` |
| `standardized-armijo` | standardized/Armijo/initial `32.0` | first update accepts `16.0` after one backtrack; `gradient-norm` at 48; terminal/best BCE `0.0682469929`, gradient norm `7.0171734e-6`, step norm `0.0002807796` |

## Trace and terminal contract

Iteration 0 and every accepted finite update are trace rows. Rejected Armijo trials never become rows. Each row records `iteration`, train/validation BCE, penalized objective, gradient norm, parameter-step norm, accepted step size, backtrack count, relative objective change, best-validation state, and parameters in order `[variance,skewness,curtosis,entropy,intercept]`.

After a finite accepted update, the exact priority is: record/update validation checkpoint; `gradient-norm`; conjunctive `loss-and-step`; `validation-patience`; then `max-iterations` after the final allowed update. Terminal records contain `kind`, `reason`, `iteration`, optional `attemptedIteration`, and `messageKey`. Mathematical reasons are `gradient-norm` and `loss-and-step`; model selection is `validation-patience`; safety reasons are `max-iterations`, `non-finite`, and `line-search-failed`. A failed candidate preserves the last finite state.

The normalized trace CSV header is `contract_version,run_id,iteration,feature_space,method,train_bce,validation_bce,objective,gradient_norm,parameter_step_norm,accepted_step_size,backtrack_count,relative_objective_change,is_best_validation,w_variance,w_skewness,w_curtosis,w_entropy,intercept`. JSON uses `null`, never `NaN` or `Infinity`.

## Final selection and baseline

Only mathematically converged runs are eligible; the lowest eligible validation BCE selects `standardized-armijo` and its best checkpoint. The scikit-learn endpoint uses `LogisticRegression(C=25/24, l1_ratio=0.0, solver='lbfgs', fit_intercept=True, tol=1e-12, max_iter=5000)`. It is an endpoint comparison, never a per-iteration alignment claim.

| Result | Manual Armijo | scikit-learn |
|---|---:|---:|
| Test BCE | `0.0551101232` | `0.0550980756` |
| Accuracy | `0.9805825243` | `0.9805825243` |
| ROC-AUC | `0.9994279176` | `0.9994279176` |
| Confusion matrix | `[[110,4],[0,92]]` | `[[110,4],[0,92]]` |

Prediction agreement is `1.0`; max/mean probability difference is `0.0001508618`/`0.0000125171`; coefficient-direction cosine is `0.9999999991`. Only the selected model receives the compact test report; its threshold is fixed at `0.5` and ROC-AUC consumes probabilities.

## Decision clauses D-01 through D-29

- **D-01:** One small logistic-regression model is the continuous teaching case across both chapters.
- **D-02:** The authoritative dataset is the verified local UCI Banknote snapshot, with source, DOI, CC BY 4.0 attribution, byte hashes, schema, and dictionary preserved.
- **D-03:** The persisted stratified train/validation/test split and train-only population statistics above are authoritative; validation and test reuse those values.
- **D-04:** Real Banknote runs cover scale, convergence, stable BCE, Armijo, stopping, and safety exits; existing overfitting/vanishing/exploding scenarios remain explicitly synthetic support examples.
- **D-05:** The five-run matrix above is complete and immutable.
- **D-06:** The extreme-logit comparison is a separate stable-BCE check, never a sixth training run.
- **D-07:** Mathematical convergence, validation checkpoint selection, and safety termination remain distinct and follow the typed priority above.
- **D-08:** Summaries expose start, first applicable backtrack, best validation checkpoint, terminal checkpoint, final test report, and exact stop reason; full traces remain local downloads.
- **D-09:** The seeds, L2 strength, learning rates, tolerances, Armijo constants, patience, and numerical anchors in this contract are locked from clean-kernel execution.
- **D-10:** `optimization` owns stable BCE, scale effects, fixed-step descent, Armijo, stopping, and safety exits; optimizer comparisons remain linked and Newton/IRLS stays off the primary route.
- **D-11:** `training-diagnostics` teaches observation, plausible cause, one changed variable, and an expected next-run result from the same traces.
- **D-12:** Both chapters reference chapter-specific cells and outputs from one shared executed Chinese Notebook.
- **D-13:** The existing `MathGradientLab` and `TrainingDiagnosticsLab` remain the sole primary labs, with prior synthetic modes preserved.
- **D-14:** Manual NumPy is the teaching authority; Pandas loads data and SciPy supplies independent stable-function comparisons.
- **D-15:** Manual code and page snippets follow `stable_bce`, `loss_and_grad`, `armijo_step`, `should_stop`, then `train_logistic`.
- **D-16:** Pinned scikit-learn `LogisticRegression` is an endpoint-only engineering baseline; no per-iteration alignment is claimed.
- **D-17:** A visible finite-difference check precedes training, and tests cover gradients, Armijo, stopping, finite boundaries, and Notebook/browser anchors.
- **D-18:** One fixed L2 term applies to weights but excludes the intercept, consistently across manual and scikit-learn objectives.
- **D-19:** Every run records all trace fields specified above, including validation state and typed terminal reason.
- **D-20:** Only the selected model receives the compact test report; threshold remains `0.5` and ROC-AUC consumes probabilities.
- **D-21:** `optimization` owns the five-run numerical comparison; `training-diagnostics` owns cross-run interpretation and the test-report connection.
- **D-22:** Browser controls are preset-first with bounded advanced controls; primary UI keeps L2, Armijo `c`, contraction `rho`, and validation patience fixed.
- **D-23:** `TrainingDiagnosticsLab` selects primary and comparison runs and may toggle curves; it does not become a quiz or dashboard builder.
- **D-24:** Invalid arithmetic stops at the last finite state with an explicit reason and one single-variable suggestion; learner parameters are never silently replaced.
- **D-25:** Browser labs use deterministic TypeScript over the real local snapshot with the same formulas and constants; browser Python is forbidden and tests enforce anchor parity.
- **D-26:** One shared illustration contains the locked scale, fixed-versus-Armijo, and training-diagnostics panels.
- **D-27:** Exactly three short Notebook-bound Manim packages cover feature scaling, fixed versus Armijo, and training-trace diagnosis.
- **D-28:** Every plotted Manim value and label comes from locked Notebook outputs; pacing may simplify but numbers may not be replaced.
- **D-29:** Illustration/video labels are short Chinese, with bilingual page copy, Chinese transcripts, English summaries, label tables, local posters, reduced-motion fallback, metadata, and hashes.

## Preservation and acceptance

- Preserve `/math-lab/modules/optimization?route=numerical-deepening-path` and `/math-lab/modules/training-diagnostics?route=numerical-deepening-path`, module/lab/checkpoint IDs, route order, course inventory, three V1 Progress stores, Progress V2/migration behavior, and one primary lab per chapter.
- Preserve all five existing synthetic scenario IDs and identify overfitting, vanishing-gradient, and exploding-gradient outputs as synthetic support examples.
- Ordinary generation and `--check` are offline and fail closed on source/cache drift. Refresh may network only for the exact hash-gated UCI ZIP and publishes the CSV/manifest/dictionary atomically after schema/count/statistics validation.
- Dataset, Notebook, JSON, CSV, illustration, poster, video, transcript, summary, prompt, tree, labels, and manifests are finite, deterministic, hash-audited, and base-safe.
- Numeric parity uses absolute tolerance `1e-9` for displayed scalars and `1e-8` for parameters.
- Focused tests, generator checks, `npm test`, standard and Pages builds, security audit, and the Chinese/English desktop plus 390px browser matrix must pass before phase closeout.
