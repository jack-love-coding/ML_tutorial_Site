# Phase 29: Logistic Regression Rebuild - Context

**Gathered:** 2026-08-19
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the existing `/learn/logistic-regression` course into a detailed bilingual path that follows one reproducible UCI Banknote case from linear scores through sigmoid probabilities, odds and log-odds, likelihood and maximum likelihood, stable binary cross-entropy, scratch NumPy gradients, deterministic training, scikit-learn parity, probability calibration, and the limits of one linear decision boundary. Preserve the existing module identity, six chapter IDs, deep links, checkpoint, Progress stores, and downloadable asset behavior. Threshold selection, confusion metrics, ROC/AUC, cost decisions, subgroup errors, and the first visible final-test evaluation belong to Phase 30.

</domain>

<decisions>
## Implementation Decisions

### One Real Banknote Teaching Spine

- **D-01:** Use the existing local UCI Banknote Authentication snapshot as the sole real-data teaching case. Core formulas, code, training, library comparison, calibration, and page-visible outputs must use this authority rather than introducing another real dataset.
- **D-02:** Preserve the existing fixed `960/206/206` train/validation/test split, stable row IDs, train-only `ddof=0` standardization, schema, source, license, and checksum contract.
- **D-03:** Call the target `class 0` and `class 1`. The UCI source does not define human-readable class semantics, so learner copy must not assert a genuine/forged mapping.
- **D-04:** Teach only the necessary data contract: four wavelet-derived features, class balance, missing-value check, fixed split, train-only standardization, and a clearly labeled two-dimensional projection. Do not repeat a full EDA course.
- **D-05:** Thread one frozen real row through score, sigmoid, likelihood contribution, BCE, gradient contribution, and update calculations. Each relevant lab may also switch among three frozen named comparisons: near-boundary, correct-and-confident, and high-loss.
- **D-06:** Build calibration from the frozen Banknote validation logits. Compare the original probabilities with explicitly controlled sharpened and softened transformations of the same logits so learners can see calibration change while ordering and fixed-threshold class predictions can remain unchanged.
- **D-07:** Use two clearly labeled synthetic diagnostics only for model capacity: four-point or lightly jittered XOR for a hand-worked contradiction, then concentric circles for a continuous point-cloud failure. Neither diagnostic participates in Banknote training, model selection, or evaluation.

### Six Preserved Chapters, New Responsibilities

- **D-08:** Preserve the six legacy IDs and base redirect, but rewrite their bilingual titles and responsibilities:
  1. `linear-score` — Banknote data contract, one-row and batch scores, design-matrix notation, and log-odds.
  2. `sigmoid-probability` — stable sigmoid, probability, odds, log-odds, and extreme-score behavior.
  3. `threshold-decisions` — Bernoulli probabilities, dataset likelihood, log-likelihood, maximum likelihood, and only a short default-threshold handoff.
  4. `log-loss` — negative log-likelihood, stable logit-domain BCE, scalar and vectorized parameter gradients, and central finite-difference checks.
  5. `regularization` — deterministic scratch training, convergence/stopping, aligned scratch-versus-scikit-learn parity, then L2 as a deliberately different objective.
  6. `linear-limits` — probability calibration, XOR and circle failures, frozen handoff assets, references/downloads, checkpoint, and the bridge to Phase 30.
- **D-09:** Use the established beginner rhythm “one real row, then the batch.” Likelihood receives a complete layered derivation from one Bernoulli outcome to a product, log-sum, negative log-likelihood, and mean BCE; entropy and KL derivations are not added here.
- **D-10:** Derive a row contribution `(p-y)x`, then the vectorized gradients `X.T @ (p-y) / n` and `mean(p-y)`. Verify every parameter with central differences before those gradients drive the deterministic training trace. Do not add an automatic-differentiation framework.
- **D-11:** Compare scratch and scikit-learn in two stages. First align preprocessing, feature order, intercept handling, unregularized objective, stopping rule, and tolerance so coefficients and probabilities agree within declared tolerances. Then add L2 as an explicitly different objective; do not compare scratch against undocumented library defaults.
- **D-12:** Each chapter follows the content-first sequence: question → intuition/data observation → notation and mathematics → copyable NumPy code → locked real output → experiment prediction → animation where assigned → dedicated interaction → observation result → misconception → conclusion. References and consolidated downloads appear only in the final chapter.

### Dedicated Interactions and Media

- **D-13:** Replace the shared logistic cockpit with six chapter-specific, route-lazy labs backed by shared pure calculations and published assets. Do not add a separate free-form exploration route in this phase.
- **D-14:** Assign one focused interaction to each chapter: row-level score contributions; sigmoid/probability/odds; likelihood accumulation and probability-product underflow versus log-sum stability; stable BCE/gradient/finite differences; training plus scratch/scikit-learn/L2 comparison; and calibration plus XOR/circle capacity diagnosis.
- **D-15:** Each lab exposes at most two or three guided primary control groups. Full row contributions, parameter vectors, gradient checks, and training traces belong in expandable numeric detail rather than an always-visible tuning cockpit.
- **D-16:** Simple row, sigmoid, likelihood, BCE, gradient, and controlled out-of-distribution calculations may run exactly in the browser. Full Banknote training, scikit-learn results, calibration summaries, and figure data come from deterministic executed assets; the browser replays rather than fabricates complex fits.
- **D-17:** Rebuild the existing score-to-sigmoid, confident-mistake, and regularization animations as language-neutral 1920×1080, 30fps packages. Add one new likelihood → log-likelihood → BCE → gradient animation. Each package includes a Pages-safe MP4, poster, bilingual transcript, chapter markers, source/prompt records, version, duration, and hashes, and uses the shared `ChapteredMediaPlayer`.
- **D-18:** Animation starts only by learner action. Every lab and video keeps keyboard access, reduced-motion behavior, bounded finite inputs, mobile-safe layout, and a complete static SVG/table/transcript fallback in which color is not the only state signal.

### Phase 30 Handoff and Evaluation Boundary

- **D-19:** Phase 29 retains only a one-sample default-threshold bridge: `p >= 0.5` becomes a class, and thresholding is separate from fitting a probability model. Threshold sweeps, confusion matrices, precision, recall, F1, ROC/AUC, cost selection, and subgroup error analysis remain Phase 30.
- **D-20:** Fixed-threshold validation accuracy may appear only to contrast class correctness with probability calibration. The sharpened and softened validation probabilities should demonstrate that accuracy can stay unchanged while calibration error changes; no wider metric suite is introduced.
- **D-21:** Publish one hash-bound local prediction handoff in CSV and JSON with at least stable row ID, split, label, logit, probability, feature/model contract version, and generating-model/config hashes. Phase 29 uses its training and validation records; Phase 30 consumes the same frozen authority rather than retraining.
- **D-22:** Phase 29 freezes the model and prediction-generation contract but does not reveal test labels, test metrics, or test-bin outcomes in learner-facing content. Phase 30 selects the operating threshold from validation data and reveals the frozen test result once.

### Inherited Compatibility and Content Rules

- **D-23:** Preserve the `logistic-regression` module ID, `/learn/logistic-regression/*` routes, all six chapter IDs, checkpoint identity, Progress V1/V2 behavior, catalog position, safe Markdown/KaTeX and code-copy paths, GitHub Pages base paths, and bilingual parity.
- **D-24:** Remove chapter-level source blocks, `Ref ID`, and learner-facing “证据/Evidence” labels. Use plain terms such as “观察重点”, “运行结果”, and “对照结果”; list deduplicated public references, data attribution, licenses, and downloads only in the final chapter.
- **D-25:** Pure score, sigmoid, odds, stable BCE, likelihood, gradient, finite-difference, training, calibration, and diagnostic calculations stay outside Vue components and receive deterministic tests.

### the agent's Discretion

- Select the canonical and three comparison row IDs from frozen train/validation outputs, provided each label is mathematically accurate and non-semantic class wording is preserved.
- Choose the controlled sharpening/softening transforms, calibration-bin count, error summary, and finite-difference step sweep after validating that the comparison keeps the intended class predictions fixed.
- Choose learning rate, maximum iterations, stopping rule, L2 strength, solver, coefficient/probability tolerances, plot ranges, and exact animation durations from reproducible execution results.
- Choose whether the XOR diagnostic uses four exact points before a jittered view and whether the circle view reuses an existing deterministic generator, provided both are clearly separated from the Banknote authority.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Phase Contract

- `AGENTS.md` — Repository-wide architecture, content, media, safety, testing, Git, and Curriculum V2 compatibility rules.
- `.planning/PROJECT.md` — v1.1 content-first milestone, compatibility boundaries, and reproducible-asset goals.
- `.planning/REQUIREMENTS.md` — Phase 29 requirements `LOGR-01` through `LOGR-04` and milestone quality constraints.
- `.planning/ROADMAP.md` — Phase 29 and Phase 30 goals, dependencies, success criteria, and the classification-decision boundary.
- `.planning/STATE.md` — Current phase state and inherited phase decisions.

### Prior Teaching and Numerical Contracts

- `.planning/phases/26-loss-functions-rebuild/26-CONTEXT.md` — Stable BCE, output-gradient, real-data, Notebook parity, and final-only reference decisions.
- `.planning/phases/27-linear-regression-rebuild/27-CONTEXT.md` — One-row-to-batch teaching rhythm, aligned scratch/library comparison, and leakage-safe preprocessing precedent.
- `.planning/phases/27.1-linear-regression-teaching-redesign/27.1-CONTEXT.md` — Single-column detailed teaching, chapter-specific labs, real Notebook figures, and learner-facing wording rules.
- `.planning/phases/28.2-optimizer-principles-mlp-transfer/28.2-CONTEXT.md` — Shared optimizer/media patterns, fixed Banknote transfer, guided chapter labs, and `ChapteredMediaPlayer` contract.
- `.planning/milestones/v1.0-phases/25-numerical-methods-batch-4-logistic-regression-optimization-a/25-CONTEXT.md` — Canonical Banknote split, train-only scaling, stable logistic objective, deterministic training, and offline publication rules.

### Curriculum Intent

- `docs/curriculum-v3/content-audit.md` — Canonical logistic-regression gaps and the separate classification-evaluation rebuild.
- `docs/curriculum-v3/module-inventory.md` — Canonical module identity, prerequisites, and rebuild status.

### Banknote Data and Execution Authority

- `public/datasets/numerical-methods/banknote-authentication.csv` — Immutable local normalized data with persisted split labels.
- `public/datasets/numerical-methods/banknote-authentication-manifest.json` — Source, license, checksums, split counts, schema, and train-only statistics.
- `public/datasets/numerical-methods/banknote-authentication-data-dictionary.json` — Bilingual field definitions and the explicit unknown class semantics.
- `public/notebooks/numerical-methods/banknote-logistic-optimization.zh-CN.ipynb` — Existing executed logistic-optimization precedent to reuse or extend without drifting its published contract.

### Existing Runtime and Compatibility Surface

- `src/data/logisticRegressionModule.ts` — Existing six chapter IDs, route identity, visuals, presets, controls, and checkpoint binding.
- `src/simulations/logisticRegression.ts` — Current synthetic simulation to replace or adapt behind a compatibility boundary.
- `src/components/LogisticRegressionPagedLesson.vue` — Existing paged shell, route navigation, content assembly, result surface, and final handoff.
- `src/components/LogisticRegressionLessonLab.vue` — Existing shared cockpit whose public behavior must remain compatible while the teaching UI moves to dedicated scenes.
- `src/modules/math-lab/utils/banknoteDataset.ts` — Typed local dataset loader, fixed split, validation, preprocessing, and Pages-safe fetch authority.
- `src/modules/math-lab/utils/banknoteLogistic.ts` — Stable sigmoid/BCE, objective, gradient, training, and finite-guard precedent.
- `src/components/ChapteredMediaPlayer.vue` — Shared media player for markers, transcripts, reduced motion, failure fallback, and public base paths.
- `tests/logistic-regression-cockpit.test.mjs` — Existing route, ID, asset, layout, and compatibility assertions to update without losing coverage.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `banknoteDataset.ts` already parses and validates all 1,372 local rows, fixed split membership, class counts, and train-only means/scales.
- `banknoteLogistic.ts` already provides numerically stable sigmoid, logit-domain BCE, an aligned parameter vector, gradients, L2 behavior, fixed/Armijo traces, and finite guards.
- `LogisticRegressionPagedLesson.vue` already provides six-chapter routing, sticky/mobile contents, progress, pager, media placement, and next-course bridges.
- The existing logistic D3 figures, loss-surface view, three MP4/SVG assets, and XOR preset can be audited and selectively rebuilt instead of inventing unrelated visuals.
- `ChapteredMediaPlayer.vue` and the Phase 28B media registry/package checks provide the target transcript, marker, poster, hash, failure, and reduced-motion pattern.

### Established Patterns

- Recent algorithm rebuilds keep legacy `AlgorithmModuleDefinition` identities but move detailed chapter content into phase-specific typed contracts and lazy dedicated labs.
- Executed bilingual Notebooks derive from one code authority, publish local JSON/CSV/figures with hashes, and fail asset checks when page-visible numbers drift.
- Simple interactive math runs through tested pure TypeScript functions; complex sklearn results are precomputed and replayed with semantic table fallbacks.
- Single-column detailed teaching, final-only references/downloads/checkpoint, at most three main controls, and no exercise bank are established user preferences.

### Integration Points

- `AlgorithmView.vue` must continue selecting the dedicated logistic course branch without duplicating generic results or checkpoints.
- `src/router/index.ts`, module catalog, curriculum adapters, checkpoint route resolver, and algorithm progress wrappers must keep all existing IDs and deep links.
- A Phase 29 typed course/lab registry can remain local to `src/modules/logistic-regression/`; this phase does not require a global Lesson Block Renderer migration.
- The new frozen prediction asset is both a Phase 29 output and the input contract for Phase 30, so its schema and hashes must be tested before either course consumes it.

</code_context>

<specifics>
## Specific Ideas

- Let the same real row progress through `z`, odds, probability, likelihood contribution, BCE, `(p-y)x`, and the first update before expanding each calculation to the batch.
- Make numerical stability visible twice: stable sigmoid at extreme logits and likelihood-product underflow versus log-likelihood addition.
- Use the calibration lab to hold sample ordering and the default class predictions fixed while changing probability sharpness, so “same accuracy, different probability quality” is directly observable.
- Present XOR first as a small logical contradiction and circles second as a continuous geometric failure; show that longer training and a different optimizer cannot bend a linear boundary.
- End Phase 29 with a sealed/frozen handoff explanation: the model and probabilities are fixed, while threshold selection and final test inspection wait for Phase 30.

</specifics>

<deferred>
## Deferred Ideas

- Platt scaling, isotonic regression, and a broader probability-calibration methods comparison are optional future material.
- Threshold sweeps, confusion matrices, precision, recall, F1, ROC/AUC, cost-aware threshold selection, subgroup analysis, and named held-out errors belong to Phase 30.
- A free-form logistic exploration route, full Banknote row browser, full repeated EDA, browser Python, backend assessment, and a larger exercise bank remain outside this phase.
- The first visible final-test evaluation is intentionally deferred to Phase 30 so threshold selection remains leakage-safe.

</deferred>

---

*Phase: 29-logistic-regression-rebuild*
*Context gathered: 2026-08-19*
