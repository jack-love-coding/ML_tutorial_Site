# Phase 26: Loss Functions Rebuild - Research

**Researched:** 2026-07-28
**Domain:** real-data loss-function teaching, stable binary cross-entropy, output gradients, finite differences, and reproducible bilingual Notebooks
**Confidence:** HIGH for codebase integration and mathematics; MEDIUM-HIGH for external dataset contracts

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Teaching Chapter Spine

- **D-01:** Keep all six existing conceptual chapters as core content: error/loss/objective, MSE/MAE, BCE, likelihood, negative log, and the MLE bridge.
- **D-02:** Use the beginner-first order “learn to use the losses, then explain their probabilistic origin.” The final sequence is the six existing chapters followed by one unified analytic-gradient and finite-difference verification chapter.
- **D-03:** Place NumPy code and locked run outputs beside the concepts they implement. Do not isolate all code in a distant appendix or downloadable-only workflow.
- **D-04:** Keep the existing Softmax material accessible as a concise BCE chapter bridge. It is not a Phase 26 Notebook topic, primary gradient target, or primary checkpoint.

#### Real-Data Teaching Cases

- **D-05:** Create new Phase 26 cases rather than reusing the earlier `MSE=2.5` mathematics fixture.
- **D-06:** The regression-loss case should use a reproducible real public delivery-time dataset with auditable provenance, license/source notes, schema, checksum, and a frozen local copy. Exact source selection is a research/planning task; synthetic delivery records are not an acceptable silent substitute.
- **D-07:** The binary-loss case should use a reproducible real public manufacturing-defect dataset with the same provenance and local reproducibility contract. Exact source selection is a research/planning task; if no source satisfies the contract, planning must surface the conflict instead of silently changing the domain or using generated data.
- **D-08:** Freeze a small set of representative real rows and model predictions for page-visible, per-example calculations while running each complete dataset in a clean-kernel Notebook.
- **D-09:** Publish full-data metrics, per-example losses, loss distributions, unusual or high-contribution cases, and relevant plots as local auxiliary teaching assets. These outputs support the explanation; they do not replace the page’s worked calculations.
- **D-10:** Keep logits `-1000` and `1000` as explicitly synthetic numerical-stability probes. Do not present them as ordinary outputs observed in the real defect dataset.

#### BCE and Gradient Depth

- **D-11:** Introduce BCE in the probability domain for intuition, connect `p = sigmoid(z)`, then use the equivalent logit-domain `softplus(z) - y*z` or `logaddexp` formulation as the canonical stable implementation. Demonstrate agreement on ordinary finite inputs.
- **D-12:** Derive gradients with respect to model outputs, not full model parameters: `∂MSE/∂ŷ`, an explicit MAE subgradient convention, and `∂BCE/∂z = sigmoid(z) - y`, including the batch-mean factor. Use a short chain-rule handoff to later model courses.
- **D-13:** Show per-element analytic and central-difference gradients, absolute or relative errors, explicit tolerances, and a small step-size sweep for MSE, MAE, and BCE.
- **D-14:** Treat zero-residual MAE as a non-differentiable point. Explain the chosen subgradient convention and do not claim a unique derivative or require an invalid central-difference equality at the kink.
- **D-15:** Publish a locked comparison for logits `-1000`, `-20`, `0`, `20`, and `1000` across naive probability BCE, clipped probability BCE, and stable logit BCE. Mark `inf`/`NaN` and objective changes explicitly.
- **D-16:** Keep interactive controls bounded to a readable teaching range. Extreme values belong in deterministic fixed probes rather than an arbitrary free-number input surface.

#### Notebook and Visual Materials

- **D-17:** Publish two topic-specific Notebooks: one for real-data MSE/MAE regression analysis and one for real-data BCE plus gradient verification.
- **D-18:** Publish separate Chinese and English variants of each Notebook, for four files total.
- **D-19:** All locale variants must derive from the same code source, dataset versions, environment, execution order, and locked numerical outputs. Add parity/integrity checks so translation cannot change code or results.
- **D-20:** Place selected Notebook results beside the chapter concepts they support: real rows and outlier behavior in MSE/MAE, per-example BCE and confident mistakes in BCE, and finite-difference tables in the final verification chapter. Provide one consolidated download area at the end.
- **D-21:** Use the rebuilt existing interactive labs and deterministic Notebook tables/plots as the primary visuals. Add an image or Manim segment only when an abstract or continuous process cannot be explained clearly by those assets.

#### Inherited Product Constraints

- **D-22:** Preserve the `loss-functions` module ID, `/learn/loss-functions` route and deep links, checkpoint submission, Progress V1/V2 behavior, bilingual page parity, safe Markdown/math rendering, GitHub Pages base paths, and mobile/reduced-motion fallbacks.
- **D-23:** Keep exercises selective, formative, and non-blocking. Detailed teaching remains the dominant page content.
- **D-24:** Keep pure loss calculations, numerical guards, gradient logic, and finite-difference checks outside Vue components and cover them with deterministic tests.

### the agent's Discretion

- Select the exact real public datasets within the locked delivery-time and manufacturing-defect domains, provided provenance, license, download stability, local redistribution, schema clarity, and lesson suitability are verified.
- Select the frozen row IDs, baseline model/configuration used to generate predictions, plot designs, finite-difference step values, and numerical tolerances from reproducible results.
- Choose filenames and generation mechanics for the four locale-specific Notebooks, but enforce a single executable source of truth and output parity.
- Decide whether one image or Manim asset is pedagogically necessary after auditing the rebuilt interactions and Notebook plots; no asset quota is required.

### Deferred Ideas (OUT OF SCOPE)

- Full `∂L/∂w` and `∂L/∂b` derivations and training loops belong to Phase 27 Linear Regression Rebuild and Phase 29 Logistic Regression Rebuild.
- Equal-depth multiclass Softmax code, gradients, and decision analysis belong to Phase 30 Classification Decisions Rebuild; Phase 26 retains only the existing conceptual bridge.
- Arbitrary numeric-input labs, browser Python/Pyodide, backend assessment, and checkpoint persistence are outside this phase.
</user_constraints>

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|---|---|---|
| LOSS-01 | Learners can calculate MSE, MAE, and stable binary cross-entropy on fixed examples and aggregate per-example losses into one objective. | The mathematical contract below separates per-element losses from the mean objective and requires the same frozen rows and values in page copy, TypeScript, Notebook code, locked JSON, and labs. |
| LOSS-02 | Learners can use loss scale and gradients to explain how outliers and confident wrong predictions influence training differently. | LaDe-D contains authentic long-duration cases for MSE/MAE contribution comparisons; SECOM provides authentic pass/fail labels and out-of-fold logits for confident-error BCE/gradient comparisons. |
| LOSS-03 | Learners can run vectorized NumPy loss implementations and verify the displayed gradients with finite differences. | The recommended NumPy implementation uses `float64`, `np.logaddexp`, central differences, an `h` sweep, explicit error measures, and a special MAE-kink status. |
</phase_requirements>

## Summary

Use two independently frozen, locally redistributed datasets and one fail-closed artifact generator. For regression, use the complete **LaDe-D Jilin city file** from Cainiao's official Hugging Face organization at revision `be2cec02775cafc8d52230303f32134382bcc50b`. The official dataset card declares Apache-2.0, the paper describes LaDe as real industry last-mile delivery data, and the Jilin file is small enough to freeze locally while still containing 31,415 delivery records. Direct retrieval on 2026-07-28 produced source SHA-256 `12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73`. [VERIFIED: direct official Hugging Face download and SHA-256] [CITED: https://huggingface.co/datasets/Cainiao-AI/LaDe] [CITED: https://arxiv.org/abs/2306.10675]

For manufacturing classification, use **UCI SECOM**, a real semiconductor manufacturing process dataset with pass/fail yield labels, missing measurements, DOI `10.24432/C54305`, and CC BY 4.0 redistribution terms. The official archive contains 1,567 rows with 104 fails and 1,463 passes; direct retrieval on 2026-07-28 produced source ZIP SHA-256 `eea568baf3c2229096d7d294cf0b096b5502bd96d92c0b80a65b84714059be8e`. A critical schema discrepancy must be preserved in the manifest: UCI metadata says 591 features, while every inspected raw `secom.data` row has 590 whitespace-separated values. Planning must treat 590 as the observed raw schema and record the upstream metadata discrepancy instead of silently padding or dropping a column. [VERIFIED: direct UCI archive inspection and SHA-256] [CITED: https://archive.ics.uci.edu/dataset/179/secom]

**Primary recommendation:** Build one Phase 26 generator that downloads only during an explicit bootstrap step, verifies pinned upstream revisions/hashes, emits privacy-minimized local course datasets, generates and clean-kernel-executes four locale Notebooks from shared code cells, normalizes outputs, and atomically publishes manifests/JSON/plots only when every dataset, code, locale, and output parity check succeeds.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Dataset acquisition and normalization | Build-time scripts | Static/public assets | Network access and raw-source transformation happen before publication; the browser consumes only frozen local files. |
| Loss, gradient, and finite-difference truth | Pure TypeScript simulation/utilities and Notebook NumPy code | Locked JSON outputs | Both implementations must follow one formula/notation contract and be parity-tested. |
| Bilingual lesson narrative and worked calculations | Typed `src/data/` module definition | Vue labs/results | Content owns the teaching sequence; components compose already-computed values and interaction state. |
| Interactive loss exploration | Browser/client Vue components | Pure TypeScript utilities | Controls and presentation live in Vue; calculations, guards, and gradients do not. |
| Notebook execution and parity | Build-time Python generator | Repository tests | A fresh kernel executes each locale artifact, while tests reject code/output drift. |
| Downloadable datasets, Notebooks, plots, manifests | Static/public assets | `withPublicBase` consumer | GitHub Pages serves immutable local files under the configured base path. |
| Route/checkpoint/progress compatibility | Existing frontend routing and progress adapters | Content tests | Phase 26 preserves identity and stored-state behavior; it does not create a new module or store. |

## Dataset Selection and Freeze Contract

### A. Delivery-time regression: LaDe-D Jilin

**Decision:** Use `delivery/delivery_jl.csv` from `Cainiao-AI/LaDe`, pinned to revision `be2cec02775cafc8d52230303f32134382bcc50b`. The dataset card declares `apache-2.0`; the source paper describes millions of packages from real industry operations, and the Jilin file exposes accept and delivery timestamps needed to derive elapsed delivery minutes. [CITED: https://huggingface.co/datasets/Cainiao-AI/LaDe] [CITED: https://arxiv.org/abs/2306.10675]

**Observed source facts (2026-07-28):**

| Item | Locked source fact |
|---|---|
| Revision | `be2cec02775cafc8d52230303f32134382bcc50b` |
| Source URL | `https://huggingface.co/datasets/Cainiao-AI/LaDe/resolve/be2cec02775cafc8d52230303f32134382bcc50b/delivery/delivery_jl.csv` |
| File bytes | `4,736,342` |
| Source SHA-256 | `12e2cf4664dd5b4475d39dddee8872f5a03b3082f08f0eece7f103baee6c6e73` |
| Rows | `31,415` data rows plus header |
| License | Apache-2.0 from the official dataset card |
| Real target derivation | `delivery_duration_minutes = delivery_time - accept_time`, with month/day rollover handled from the timestamp values |
| Observed duration range | `0` to `3573` minutes; median `175`; 50 zero-duration rows; 8 rows above 24 hours |

[VERIFIED: direct official source download, CSV parsing, and SHA-256 on 2026-07-28]

Do not publish precise stop/GPS coordinates or `courier_id`, because they are unnecessary for loss arithmetic. The local course copy should retain a deterministic course row ID, source row number, city, `aoi_type`, accept timestamp, delivery timestamp, `ds`, and derived duration. Keep the untouched source hash, revision, transformation version, and field-removal list in the manifest so every published row remains auditable without redistributing unnecessary location traces. [RECOMMENDATION]

Use one constant prediction of `175` minutes, the frozen complete-file median, as the **reference arithmetic baseline**. It is intentionally not presented as a deployment model or an evaluation claim. Its purpose is to hold predictions fixed while showing how the same real residuals become MSE, MAE, and output-gradient contributions. Representative candidates observed in the pinned file include source order rows with durations `60`, `120`, `175`, `200`, `469`, `661`, and `3573` minutes; the generator should freeze course IDs after normalization and include at least one zero-residual row and one long-duration row. [VERIFIED: direct pinned-file calculation on 2026-07-28] [RECOMMENDATION]

**License boundary:** the official Hugging Face dataset card explicitly declares Apache-2.0, while its README also says the data “can be used for research purposes” without saying “research use only.” Preserve the downloaded card metadata and Apache attribution file in the repository. If a later legal/policy review treats that sentence as an additional restriction, fail the bootstrap and do not publish the local copy. The fallback is to pause dataset publication and obtain written clarification or choose another clearly licensed delivery dataset; do not substitute synthetic records or the weakly licensed `robustbase::delivery` dataset silently. [CITED: https://huggingface.co/datasets/Cainiao-AI/LaDe] [RECOMMENDATION]

The CRAN `robustbase::delivery` dataset is not the primary choice. It is pedagogically compact (25 vending-machine service-time observations with `n.prod`, `distance`, `delTime`), but its documentation cites a 1982 textbook as the source and provides no dataset-specific open-data grant; the package's GPL metadata is not as clear a dataset redistribution statement as the Phase 26 contract requires. [CITED: https://search.r-project.org/CRAN/refmans/robustbase/html/delivery.html] [CITED: https://cran.r-project.org/package=robustbase]

### B. Manufacturing binary classification: UCI SECOM

**Decision:** Use UCI SECOM from the official static archive. UCI identifies it as semiconductor manufacturing process measurements; each entity has a pass/fail in-house line-test label where `-1` is pass and `1` is fail. The license is CC BY 4.0 and the DOI is `10.24432/C54305`. [CITED: https://archive.ics.uci.edu/dataset/179/secom]

**Observed source facts (2026-07-28):**

| Item | Locked source fact |
|---|---|
| Source URL | `https://archive.ics.uci.edu/static/public/179/secom.zip` |
| Source ZIP SHA-256 | `eea568baf3c2229096d7d294cf0b096b5502bd96d92c0b80a65b84714059be8e` |
| Members | `secom.data`, `secom_labels.data`, `secom.names` |
| Rows | `1,567` |
| Labels | `1,463` pass (`-1`), `104` fail (`1`) |
| Observed feature columns | `590` values per raw `secom.data` row |
| Metadata discrepancy | UCI page and `secom.names` say `591` features |
| Missing values | Raw `NaN` tokens are present |
| License and DOI | CC BY 4.0; `10.24432/C54305` |

[VERIFIED: direct official UCI download, ZIP/member parsing, and SHA-256 on 2026-07-28]

Normalize to course row IDs, `measurement_000` through `measurement_589`, parsed timestamp, and `defect_label` with an explicit mapping `-1 -> 0 (pass)` and `1 -> 1 (fail)`. Preserve missing values as empty CSV fields or JSON `null`; do not impute in the canonical dataset file. Record both upstream-declared and observed feature counts in the manifest. [RECOMMENDATION]

Generate reference logits with a deterministic, pinned, **out-of-fold logistic baseline used only to supply realistic predictions**: 5-fold `StratifiedKFold(shuffle=True, random_state=20260728)`; within each fold use median imputation, constant-feature removal, standardization, then L2 `LogisticRegression(C=1.0, solver="lbfgs", max_iter=5000, tol=1e-10)`. Use the existing pinned scikit-learn `1.9.0`; do not derive or teach parameter gradients in this phase. Store every row's out-of-fold logit and probability in a locked output table, and state that these scores are auxiliary prediction inputs, not the Phase 26 learning objective. [RECOMMENDATION] [VERIFIED: scikit-learn 1.9.0 is already pinned in `public/notebooks/numerical-methods/requirements.txt`]

If this baseline does not yield at least one confidently wrong real row at the page's chosen confidence threshold, do not manufacture a “real” confident mistake. Keep the real-data BCE distribution and use a separately labeled deterministic teaching logit for the confident-error explanation; reserve `±1000` solely for the fixed numerical-stability table. [RECOMMENDATION]

### C. Required manifest fields

Each dataset manifest should be versioned and tested as a closed contract:

```json
{
  "contractVersion": "loss-functions-phase-26-v1",
  "datasetId": "lade-delivery-jilin",
  "source": {
    "pageUrl": "...",
    "downloadUrl": "...",
    "retrievedAt": "2026-07-28",
    "revisionOrDoi": "...",
    "license": "...",
    "attribution": "...",
    "sourceSha256": "...",
    "sourceBytes": 0
  },
  "transform": {
    "generator": "...",
    "generatorSha256": "...",
    "rules": ["..."],
    "targetDefinition": "...",
    "labelMapping": null
  },
  "published": {
    "path": "...",
    "sha256": "...",
    "bytes": 0,
    "rowCount": 0,
    "columns": [],
    "units": {},
    "missingValuePolicy": "...",
    "representativeRowIds": []
  }
}
```

The bootstrap must reject source hash/revision drift, schema drift, row-count drift, invalid timestamps/labels, duplicate course IDs, non-finite derived durations, and missing license/attribution fields. The offline `--check` path must perform no network requests and no writes. [RECOMMENDATION] [VERIFIED: existing Batch 4 generator follows fail-closed hash/schema and offline-check patterns in `scripts/numerical-methods/generate-batch-4-notebook.py`]

## Mathematical and Numerical Contract

### MSE and MAE

Let `r_i = yhat_i - y_i`. Keep per-element and mean-objective quantities visibly distinct:

```text
mse_i = r_i^2
MSE = mean(mse_i)
d(mse_i)/d(yhat_i) = 2 r_i
d(MSE)/d(yhat_i) = 2 r_i / n

mae_i = abs(r_i)
MAE = mean(mae_i)
d(mae_i)/d(yhat_i) = sign(r_i), r_i != 0
d(MAE)/d(yhat_i) = sign(r_i) / n, r_i != 0
```

At `r_i = 0`, the MAE subdifferential is `[-1, 1]`; choose `0` as the implementation convention, label the row `nondifferentiable`, and exclude it from pass/fail central-difference equality. A symmetric central difference returning `0` at the kink is compatible with the convention but is not evidence that a unique derivative exists. [VERIFIED: direct algebra and one-sided derivative check] [RECOMMENDATION]

### Stable binary cross-entropy

Use the probability-domain formula only for intuition and ordinary-input comparison:

```python
-(y * np.log(p) + (1.0 - y) * np.log1p(-p))
```

Use the logit-domain formula as the canonical implementation:

```python
per_element = np.logaddexp(0.0, logits) - labels * logits
objective = np.mean(per_element)
```

`np.logaddexp(a, b)` computes `log(exp(a) + exp(b))` with a representation suitable for very small probabilities, and TensorFlow's official logits-cross-entropy documentation gives the equivalent stable expression `max(z, 0) - y*z + log(1 + exp(-abs(z)))`. [CITED: https://numpy.org/doc/stable/reference/generated/numpy.logaddexp.html] [CITED: https://www.tensorflow.org/api_docs/python/tf/nn/sigmoid_cross_entropy_with_logits]

Use a branch-stable sigmoid:

```python
def sigmoid_stable(z):
    z = np.asarray(z, dtype=np.float64)
    return np.exp(-np.logaddexp(0.0, -z))
```

Then expose both `d(loss_i)/dz_i = sigmoid(z_i) - y_i` and `d(mean_loss)/dz_i = (sigmoid(z_i) - y_i) / n`. Validate nonempty equal shapes, finite logits, and binary labels before computation. Do not “fix” invalid inputs with `nan_to_num`. [RECOMMENDATION] [CITED: https://numpy.org/doc/2.3/reference/generated/numpy.isfinite.html]

### Naive, clipped, and stable comparison

For each logit in `[-1000, -20, 0, 20, 1000]`, emit rows for both `y=0` and `y=1`:

- **naive probability BCE:** run under `np.errstate`; retain the observed status (`finite`, `inf`, or `nan`) rather than suppressing it;
- **clipped probability BCE:** use one manifest-locked epsilon (recommend `1e-12`) and label it “finite but objective-changing”;
- **stable logit BCE:** use `np.logaddexp(0, z) - y*z` and require finite float64 results.

JSON must remain standards-compliant: encode a non-finite result as `{ "status": "inf", "value": null }`, not bare `Infinity` or `NaN`. Ordinary finite logits must show probability-domain/stable agreement within a documented tolerance; extreme logits are synthetic stress probes and must not carry SECOM row IDs. [RECOMMENDATION]

### Central differences and `h` sweep

For vector objective `L(x)`, check coordinate `i` with:

```python
def central_difference(loss_fn, values, index, step):
    plus = values.copy()
    minus = values.copy()
    plus[index] += step
    minus[index] -= step
    return (loss_fn(plus) - loss_fn(minus)) / (2.0 * step)
```

Publish an `h` sweep such as `10**[-1, -2, ..., -9]`, recording analytic gradient, finite-difference gradient, absolute error, and scaled relative error:

```python
abs_error = abs(analytic - numeric)
relative_error = abs_error / max(1.0, abs(analytic), abs(numeric))
```

Use `float64`. A suitable initial smooth-point gate is `h=1e-5` and `abs_error <= 5e-7`, but the generator must first execute the frozen fixtures and lock the smallest justified tolerance that passes MSE, nonzero-residual MAE, and stable BCE across both Python and TypeScript. The plan should never pick a tolerance merely to accept an already observed failure. [RECOMMENDATION]

## Standard Stack

### Core

| Library/runtime | Version | Purpose | Provenance |
|---|---:|---|---|
| Vue | `^3.5.30` | Existing lesson/lab composition | [VERIFIED: `package.json`] |
| TypeScript | `~5.9.3` | Typed content and pure numerical functions | [VERIFIED: `package.json`] |
| Vite | `^8.0.11` | Standard and GitHub Pages builds | [VERIFIED: `package.json`] |
| NumPy | `2.4.6` | Vectorized losses, stable BCE, gradients, finite differences | [VERIFIED: existing pinned requirements] |
| pandas | `3.0.3` | Dataset parsing, table/plot preparation | [VERIFIED: existing pinned requirements] |
| scikit-learn | `1.9.0` | Auxiliary deterministic SECOM out-of-fold logits | [VERIFIED: existing pinned requirements and prior approved Batch 4 contract] |
| nbformat | `5.10.4` | Programmatic Notebook construction | [VERIFIED: existing pinned requirements] |
| nbclient | `0.11.0` | Fresh-kernel execution with errors fatal | [VERIFIED: existing pinned requirements] |

### Supporting

| Tool | Purpose | When to Use |
|---|---|---|
| Node test runner | Pure math, content, route, parity, and asset integrity tests | Every task touching code/content/assets |
| `hashlib` / Node crypto | SHA-256 for source, normalized data, Notebook code/output, and manifests | Generator and repository tests |
| Existing `withPublicBase` | Resolve local public files under GitHub Pages base paths | Every runtime dataset/Notebook/output link |
| Existing safe Markdown/math path | Render bilingual prose and formulas without raw HTML bypass | All chapter content |

No new frontend or Python package is required. Reuse the exact pinned environment and the existing audited Batch 4 wheel cache mechanics; do not add another Notebook framework or browser Python runtime. [VERIFIED: codebase `package.json`, Notebook requirements, and Phase 26 constraints]

## Package Legitimacy Audit

Not applicable: the recommended implementation installs no new external package. All Python packages are already pinned in `public/notebooks/numerical-methods/requirements.txt`, and all frontend dependencies are already present in `package.json`. If planning introduces any additional package, it must run the GSD package-legitimacy gate before execution. [VERIFIED: codebase]

## Architecture Patterns

### System Architecture Diagram

```text
official pinned source
    | explicit online bootstrap + revision/hash/license checks
    v
privacy-minimized frozen CSV + dataset manifest + attribution
    | local-only generator input
    +-----------------------------+
    |                             |
    v                             v
shared Notebook code cells        pure TypeScript loss contract
    |                             |
zh-CN/en markdown shells          existing simulation + labs
    | four fresh kernels          |
    v                             |
executed .ipynb + JSON/PNG outputs|
    | code/output/dataset hashes  |
    +-------------+---------------+
                  | parity and asset tests
                  v
typed bilingual lesson + consolidated downloads
                  |
                  v
/learn/loss-functions via existing route/checkpoint/progress
```

### Recommended Project Structure

```text
scripts/loss-functions/
  build-phase-26-assets.py              # bootstrap, normalize, generate, execute, check
public/datasets/loss-functions/
  lade-delivery-jilin.csv
  lade-delivery-jilin-manifest.json
  secom-manufacturing.csv
  secom-manufacturing-manifest.json
  ATTRIBUTION.md
public/notebooks/loss-functions/
  requirements.txt
  environment.json
  delivery-losses.zh-CN.ipynb
  delivery-losses.en.ipynb
  manufacturing-bce-gradients.zh-CN.ipynb
  manufacturing-bce-gradients.en.ipynb
  outputs/
    regression-loss-summary.json
    bce-gradient-summary.json
    finite-difference-summary.json
    manifest.json
    *.png
src/data/
  lossFunctionsModule.ts                # seven bilingual chapters
  lossFunctionsAssets.ts                # typed local downloads/output descriptors
src/simulations/
  lossFunctionsMath.ts                  # pure guarded math contract
  lossFunctions.ts                      # lesson snapshot composition
src/components/
  LossFunctionsLessonLab.vue
  LossFunctionsResults.vue
  LossGradientVerificationLab.vue
tests/
  loss-functions-math.test.ts
  loss-functions-content.test.mjs
  loss-functions-notebook-assets.test.ts
  loss-functions-compatibility.test.ts
```

Names may be adjusted to nearby conventions, but responsibilities should remain separated. Do not put generator logic in Vue or hard-code Notebook-derived numbers independently in multiple components. [RECOMMENDATION]

### Pattern 1: One numerical authority, multiple verified consumers

The Python generator owns datasets and locked outputs; pure TypeScript independently recomputes the page/lab fixtures from the same manifest inputs. Tests compare both implementations to the locked JSON at explicit tolerances. Lesson prose references typed output IDs, not copied freehand numbers. [RECOMMENDATION] [VERIFIED: analogous patterns exist in Numerical Methods Batch 4]

### Pattern 2: One Notebook source of truth, four executions

Construct each topic from:

1. one ordered list of shared code-cell IDs/sources;
2. one zh-CN markdown dictionary;
3. one English markdown dictionary.

Generate two Notebook objects per topic, then execute all four separately with a new `NotebookClient`, `allow_errors=False`, explicit kernel, explicit working directory, and no widget state. Compare paired locale artifacts for exact cell-ID sequence, exact code-cell sources, exact normalized code outputs, and identical semantic output hashes. Project Jupyter documents that NotebookClient populates outputs, allows explicit kernel/path, and raises on errors by default. [CITED: https://nbclient.readthedocs.io/en/latest/client.html]

### Pattern 3: Atomic staged publication

Write all candidate datasets, notebooks, outputs, figures, and manifests into a temporary staging directory. Validate hashes, schemas, locale parity, clean execution, and output contracts there. Replace the public directories atomically only after the complete validation passes. A `--check` mode recomputes expected bytes/digests without writing and without network. [RECOMMENDATION] [VERIFIED: existing Batch 3/4 generator patterns]

### Anti-Patterns to Avoid

- **Clipping as canonical BCE:** clipping prevents non-finite logs but changes the objective and hides logit-domain stability.
- **`0 * log(0)` in ordinary JSON generation:** it can produce `NaN`; preserve the status explicitly instead of serializing invalid JSON.
- **Per-locale copied code:** translations will drift numerically; locale differences must be markdown only.
- **Copying Notebook outputs into Vue by hand:** it creates multiple numerical authorities.
- **Executing one Notebook and copying outputs to the other locale:** this does not prove each downloadable file runs cleanly.
- **Trusting UCI's declared `591` blindly:** the raw file currently exposes 590 feature tokens per row.
- **Publishing all LaDe coordinates/courier fields:** those fields are unnecessary to teach loss calculations.
- **Turning Phase 26 into logistic-regression training:** the SECOM model supplies frozen logits only; parameter derivation stays deferred.
- **Replacing existing route/checkpoint/progress IDs:** this breaks inherited compatibility.

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Stable log-sum-exp | ad hoc exponent caps | `np.logaddexp` and equivalent `max/log1p` TypeScript formula | Handles extreme logits without changing the objective. |
| Notebook JSON structure | string concatenation | `nbformat` | Maintains valid Notebook schema and cell metadata. |
| Notebook execution | shell-copying outputs | `nbclient.NotebookClient` | Fresh kernel, explicit path/kernel, fatal execution errors. |
| Public base handling | string-prefix conditionals in each component | existing `withPublicBase` | Already handles nested GitHub Pages bases. |
| Markdown/math sanitization | `v-html` with raw course strings | existing `markdownMath` safe path | Preserves sanitizer and formula behavior. |
| Dataset integrity | file-name/version prose only | SHA-256 manifests plus schema/row checks | Detects upstream and local drift deterministically. |

## Runtime State Inventory

| Category | Items Found | Action Required |
|---|---|---|
| Stored data | Algorithm Progress V1 and Curriculum Progress V2 can contain `loss-functions` completion/checkpoint state. | Preserve module slug, route, quiz IDs, checkpoint submission, and all current localStorage keys; code edit only, no data migration. [VERIFIED: `src/utils/algorithmProgress.ts`, Progress adapters, AGENTS.md] |
| Live service config | None required by this phase; data/Notebook assets are repository-hosted static files. | Do not add runtime source downloads or external service configuration. [VERIFIED: project architecture] |
| OS-registered state | None. | No OS registration or migration. [VERIFIED: static frontend/build-time scope] |
| Secrets/env vars | No secret is required. Optional dataset-path/cache environment variables may be build-only. | Do not require tokens at runtime; official sources are public. [VERIFIED: source access audit] |
| Build artifacts / installed packages | `dist/` is generated; an 86 MB audited Batch 4 wheel cache exists locally; host Jupyter lacks `ipykernel`. | Rebuild standard and Pages output; create/execute in the isolated pinned environment rather than relying on host Jupyter. Do not commit cache or `dist/`. [VERIFIED: local environment audit on 2026-07-28] |

## Common Pitfalls

### Pitfall 1: Per-element versus mean gradient mismatch

**What goes wrong:** prose shows `2r` or `sigmoid(z)-y`, but finite differences perturb a mean objective and obtain a value smaller by `n`.
**Avoidance:** publish both per-element and mean-objective gradients and include `n` in every locked table schema.
**Warning sign:** all gradient ratios equal exactly the batch size.

### Pitfall 2: False MAE differentiability at zero

**What goes wrong:** a symmetric difference returns zero at the kink and the lesson claims a unique derivative.
**Avoidance:** status the row as nondifferentiable, show the chosen subgradient `0`, and exclude it from equality acceptance.
**Warning sign:** a “pass” badge appears for the zero-residual MAE row without a kink note.

### Pitfall 3: Objective-changing “stability”

**What goes wrong:** probability clipping is called stable BCE and becomes the reference formula.
**Avoidance:** make logit BCE canonical; present clipping only in the fixed comparison table with epsilon and “changed objective” text.
**Warning sign:** the wrong-class loss at `|z|=1000` is capped near `-log(epsilon)` instead of approximately `1000`.

### Pitfall 4: Dataset schema/licensing drift

**What goes wrong:** upstream content changes or a metadata count is trusted over actual bytes.
**Avoidance:** pin revision/DOI and source hash; record declared and observed schemas; keep attribution/license files; fail closed.
**Warning sign:** a bootstrap succeeds after a source hash changes or silently creates a 591st SECOM column.

### Pitfall 5: Locale parity theater

**What goes wrong:** filenames exist in both languages but code or numerical outputs differ.
**Avoidance:** exact code-cell source hash plus normalized-output hash per topic; execute all four in fresh kernels.
**Warning sign:** paired Notebooks have different code cell IDs, sources, execution order, or JSON output.

### Pitfall 6: Hidden runtime network dependence

**What goes wrong:** learner pages or Notebooks fetch Hugging Face/UCI at runtime and fail offline or under GitHub Pages.
**Avoidance:** local datasets and local outputs only; network is allowed solely in explicit bootstrap mode.
**Warning sign:** a Notebook code cell contains `requests`, `urllib`, Hugging Face, or UCI fetch calls.

## Code Examples

### TypeScript stable primitives

```typescript
export function stableSoftplus(value: number) {
  if (!Number.isFinite(value)) throw new RangeError('logit must be finite')
  return Math.max(value, 0) + Math.log1p(Math.exp(-Math.abs(value)))
}

export function stableSigmoid(value: number) {
  if (!Number.isFinite(value)) throw new RangeError('logit must be finite')
  if (value >= 0) {
    const expNeg = Math.exp(-value)
    return 1 / (1 + expNeg)
  }
  const expPos = Math.exp(value)
  return expPos / (1 + expPos)
}

export function stableBceFromLogit(label: 0 | 1, logit: number) {
  return stableSoftplus(logit) - label * logit
}
```

[CITED: https://www.tensorflow.org/api_docs/python/tf/nn/sigmoid_cross_entropy_with_logits]

### NumPy mean-objective gradients

```python
def mse_mean(y_true, y_pred):
    residual = y_pred - y_true
    return np.mean(residual ** 2)

def mse_mean_gradient(y_true, y_pred):
    return 2.0 * (y_pred - y_true) / y_true.size

def mae_mean_gradient(y_true, y_pred):
    residual = y_pred - y_true
    gradient = np.sign(residual) / y_true.size
    differentiable = residual != 0.0
    return gradient, differentiable

def bce_mean_from_logits(labels, logits):
    return np.mean(np.logaddexp(0.0, logits) - labels * logits)

def bce_mean_gradient(labels, logits):
    probabilities = np.exp(-np.logaddexp(0.0, -logits))
    return (probabilities - labels) / labels.size
```

[CITED: https://numpy.org/doc/stable/reference/generated/numpy.logaddexp.html] [VERIFIED: direct differentiation]

## Project Constraints (from AGENTS.md)

- Keep the teaching loop complete and keep formulas, code, locked outputs, labs, and variable names consistent.
- Use `AlgorithmModuleDefinition`, `StorySection`, `LocalizedCopy`, and existing typed experiment/snapshot types rather than untyped content objects.
- Provide both `'zh-CN'` and `en` for every learner-facing copy.
- Keep mathematical calculations, scoring, data transformations, and finite differences outside Vue components and test them.
- Reuse the current `LossFunctionsLessonLab`, result panel, checkpoint, route, progress, code-copy, safe Markdown/math, and style patterns.
- Keep lazy imports for page/lab code where the existing route does so.
- Bound controls, reject/handle `NaN` and `Infinity`, provide reset/current-value labels, and keep keyboard/mobile/reduced-motion fallbacks.
- Store runtime assets under `public/`, use root paths plus `withPublicBase`, and never reference local absolute paths or remote runtime images/data.
- Do not bypass `sanitize-html`, add raw executable HTML, inline event handlers, scripts, or uncontrolled iframes.
- Preserve old URLs, checkpoint submission, module identity, and all existing Progress V1/V2 stores.
- Do not perform a big-bang Math/Data/Algorithm migration; Phase 26 must be independently verifiable and releasable.
- Update focused math/content/route/asset tests and run `npm test`, `npm run build`, `npm run build:pages`, and risk-appropriate security/browser checks.
- Do not touch unrelated generated images or user changes in `.planning/config.json` and `docs/gpt_advice.md`.

[VERIFIED: repository `AGENTS.md`, read 2026-07-28]

## Recommended File Touchpoints and Task Order

1. **Freeze compatibility and test contracts first.** Update/add tests that lock module slug/route/checkpoint IDs, six existing chapter IDs plus the seventh verification chapter, bilingual requirements, and existing Progress keys. Touch `tests/algorithm-progress.test.ts` only where its exact six-chapter set must become seven; do not loosen unrelated assertions.
2. **Implement the dataset/bootstrap contract.** Add `scripts/loss-functions/build-phase-26-assets.py`, source manifest templates, attribution/license files, and focused dataset tests. Bootstrap from pinned sources once, then make ordinary generation/check paths local-only and write-free in `--check`.
3. **Build pure math functions and tests.** Add `src/simulations/lossFunctionsMath.ts`; refactor `src/simulations/lossFunctions.ts` to consume it. Lock MSE/MAE/BCE values, per-element/mean gradients, input guards, extreme logits, and finite differences before changing Vue.
4. **Generate four clean-kernel Notebooks and shared outputs.** Create two topic builders with paired locale markdown; execute four fresh kernels; publish one numerical output set per topic plus parity/output manifests.
5. **Add typed asset descriptors and rebuild content.** Update `src/data/lossFunctionsModule.ts` to the approved seven-chapter spine and add a typed asset/output companion. Place code/output IDs within their relevant chapters; keep Softmax concise.
6. **Integrate existing labs/results.** Update the six existing labs around real frozen values, add `LossGradientVerificationLab.vue`, update `LossFunctionsLessonLab.vue` explicit routing (never use the current catch-all for an unknown new chapter), and extend `LossFunctionsResults.vue` with Notebook-derived summaries/downloads.
7. **Verify page, assets, and release.** Run focused tests after each task, then full tests/builds/security audit and bilingual desktop/390px browser checks with network disabled for course assets.

[RECOMMENDATION] [VERIFIED: current file/component/test structure]

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | Node 24 built-in test runner; Python generator self-checks |
| Config file | none; `package.json` script |
| Quick run | `node --test tests/loss-functions-*.test.* tests/algorithm-progress.test.ts` |
| Full suite | `npm test` |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| LOSS-01 | Fixed rows yield matching per-element and mean MSE/MAE/BCE across TS, Notebook outputs, and content bindings | unit + contract | `node --test tests/loss-functions-math.test.ts tests/loss-functions-content.test.mjs` | Wave 0 |
| LOSS-02 | Outlier/conﬁdent-error contribution and gradients are locked and explained bilingually | unit + content | `node --test tests/loss-functions-math.test.ts tests/loss-functions-content.test.mjs` | Wave 0 |
| LOSS-03 | NumPy vectorization, extreme stability, central differences, `h` sweep, and locale parity pass | asset/integration | `node --test tests/loss-functions-notebook-assets.test.ts` | Wave 0 |
| Phase SC4 | Existing route/checkpoint/progress and Pages asset paths remain valid | compatibility/build | `node --test tests/loss-functions-compatibility.test.ts tests/algorithm-progress.test.ts && npm run build:pages` | Wave 0 + existing coverage |

### Required assertions

- exact source, normalized dataset, generator, requirements, Notebook code, Notebook file, output, and figure SHA-256 values;
- dataset license/attribution, revision/DOI, schema, row count, target/label mapping, representative row IDs, and observed SECOM 590-column rule;
- code cell IDs/sources and normalized code outputs identical between locale pairs;
- every Notebook executed from count 1 in a new kernel with no error output and no runtime network code;
- ordinary BCE formulas agree; stable BCE remains finite at all fixed logits; clipping is marked objective-changing;
- MSE/MAE/BCE analytic and central differences pass locked tolerances at smooth points;
- zero-residual MAE is marked nondifferentiable and excluded from equality pass;
- module route/slug/checkpoint/progress keys unchanged; seventh chapter deep link works;
- all public paths resolve under `/` and a non-root Pages base.

### Failure injections

At minimum, tests should reject: changed source hash, changed normalized CSV byte, declared/observed SECOM schema mismatch, missing license, changed locale code cell, changed output value, missing Notebook/plot, `NaN` in standards JSON, runtime external URL, and a renamed checkpoint/route. [RECOMMENDATION]

### Sampling Rate

- **Per math/data task:** focused loss tests plus generator `--check`.
- **Per Notebook/content task:** focused math, content, Notebook parity, and asset tests.
- **Per wave merge:** `npm test`.
- **Phase gate:** `npm test && npm run build && npm run build:pages && npm run security:audit`, followed by bilingual desktop and 390px browser checks.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---:|---|---|
| Node.js | tests/builds | yes | `24.16.0` | none needed |
| npm | dependency scripts | yes | `11.13.0` | none needed |
| Python | generator | yes | `3.12.13` | use isolated venv from same interpreter |
| Jupyter CLI | Notebook tooling | partial | core present | do not rely on host; use pinned isolated environment |
| host `ipykernel` | Notebook execution | no | — | install only inside audited isolated environment from existing wheel cache |
| audited wheel cache | offline environment | yes | Batch 4 cache, 86 MB | create a Phase 26 manifest over the reused required subset |
| R | rejected fallback dataset | no | — | not required because LaDe is selected |

[VERIFIED: local command audit on 2026-07-28]

## Security Domain

OWASP ASVS 5.0.0 is the current released ASVS line as of this research date. This static-content phase has no authentication/session/access-control or cryptographic feature, but input validation, safe rendering, supply-chain integrity, and local asset boundaries apply. [CITED: https://owasp.org/www-project-application-security-verification-standard/]

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | no | No accounts or auth changes |
| V3 Session Management | no | No session changes |
| V4 Access Control | no | Public static lesson |
| V5 Validation, Sanitization and Encoding | yes | finite/shape/label/range guards; existing sanitized Markdown/math renderer |
| V6 Stored Cryptography | no | SHA-256 is integrity metadata, not secret storage |

### Known Threat Patterns

| Pattern | STRIDE | Mitigation |
|---|---|---|
| Upstream dataset/file drift | Tampering | pinned revision/DOI, SHA-256, exact schema/row checks, offline ordinary builds |
| Malicious or malformed Notebook/Markdown content | Tampering/XSS | generator-owned cells, no arbitrary HTML/scripts, existing sanitizer, no uncontrolled iframe |
| Path breakage under GitHub Pages | Availability | root public paths resolved with `withPublicBase`, Pages build and non-root base tests |
| Non-finite user/lab inputs | Availability/Integrity | bounded controls, finite checks, explicit error state, no silent coercion |

## Open Questions (RESOLVED)

1. **RESOLVED — Does the product owner accept Apache-2.0 dataset metadata plus the non-exclusive “research purposes” README wording for LaDe redistribution?**
   - What is known: the official Cainiao-AI dataset card declares Apache-2.0 and the public file is downloadable without authentication.
   - Risk: a stricter policy review could interpret the prose as additional use guidance.
   - Decision: on 2026-07-28 the product owner gave the explicit response `approve-lade`.
   - Approval boundary: this authorizes only the pinned LaDe-D Jilin source revision/hash, complete attribution and license evidence, and a privacy-minimized local derivative that removes `courier_id`, GPS coordinates, and precise stop fields. It does not authorize another LaDe version, additional source fields, or another use.
2. **RESOLVED — Which real SECOM rows become the page-visible confident mistakes?**
   - What is known: the dataset has 104 fails and the recommended OOF pipeline produces one prediction per row.
   - Resolution: select row IDs only after deterministic clean execution using the locked contribution ranking and without changing the baseline to force a desired example. If no real row meets the confidence threshold, publish a separately labeled deterministic teaching logit fallback and never present it as a real SECOM output.
3. **RESOLVED — Is an additional image or Manim asset necessary?**
   - What is known: existing labs plus loss distributions, fixed stability tables, and gradient error plots cover the required concepts.
   - Resolution: the initial Phase 26 plan adds no image or Manim asset. Add one only if browser validation identifies a specific explanatory gap that the existing labs and reproducible plots do not cover.

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | On 2026-07-28 the product owner explicitly approved `approve-lade` only for the pinned LaDe-D Jilin revision/hash, complete attribution/license evidence, and the privacy-minimized local derivative that removes `courier_id`, GPS coordinates, and precise stop fields. | Dataset selection | Any other LaDe version, field set, or use remains outside the approval and must fail closed rather than inherit this authorization. |
| A2 | The recommended deterministic SECOM OOF pipeline produces at least one pedagogically useful confident wrong row. | Dataset selection | Keep the real distribution, but use a separately labeled teaching logit; never relabel it as a real model output. |

## Sources

All external sources below were retrieved or checked on **2026-07-28**.

### Primary (HIGH confidence)

- https://huggingface.co/datasets/Cainiao-AI/LaDe — official Cainiao-AI dataset card, Apache-2.0 metadata, schema, and pinned files.
- https://arxiv.org/abs/2306.10675 — original LaDe paper describing the real industry dataset.
- https://archive.ics.uci.edu/dataset/179/secom — official UCI description, label semantics, DOI, and CC BY 4.0.
- https://archive.ics.uci.edu/static/public/179/secom.zip — official source bytes inspected for schema, labels, and checksum.
- https://numpy.org/doc/stable/reference/generated/numpy.logaddexp.html — official stable log-add-exp behavior.
- https://numpy.org/doc/2.3/reference/generated/numpy.isfinite.html — official finite-value checking.
- https://www.tensorflow.org/api_docs/python/tf/nn/sigmoid_cross_entropy_with_logits — official stable logit BCE derivation.
- https://nbclient.readthedocs.io/en/latest/client.html — official fresh-kernel execution/error behavior.
- https://vite.dev/guide/build — official public-base behavior.
- https://owasp.org/www-project-application-security-verification-standard/ — official ASVS release status.

### Secondary (MEDIUM confidence)

- https://search.r-project.org/CRAN/refmans/robustbase/html/delivery.html — official CRAN-rendered dataset documentation for the rejected fallback.
- Local repository sources listed in `26-CONTEXT.md`, especially `src/data/lossFunctionsModule.ts`, `src/simulations/lossFunctions.ts`, `src/views/AlgorithmView.vue`, `src/utils/publicPath.ts`, existing Notebook generators/manifests, and test files.

## Metadata

**Confidence breakdown:**

- Dataset identity/provenance: HIGH — direct official downloads, source pages, DOI/revision, and computed hashes.
- Dataset redistribution: MEDIUM-HIGH — SECOM is explicit CC BY 4.0; LaDe is explicit Apache-2.0 in card metadata with one wording ambiguity documented as A1.
- Mathematics/numerical stability: HIGH — direct algebra plus official NumPy/TensorFlow definitions and existing project precedent.
- Notebook architecture: HIGH — official nbclient behavior plus established repository generator/manifest patterns.
- Vue/route/progress integration: HIGH — verified against the current codebase and AGENTS.md.

**Research date:** 2026-07-28
**Valid until:** 2026-08-27 for external dataset/source checks; codebase findings remain valid until the relevant files change.
