# Phase 27: Linear Regression Rebuild - Context

**Gathered:** 2026-07-29
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the existing `/learn/linear-regression` course around one reproducible
UCI Bike Sharing regression case. The lesson must connect row-level prediction,
batch matrix prediction, residuals, MSE parameter gradients, NumPy batch
gradient descent, the normal equation, scikit-learn, coefficient
interpretation, held-out residual diagnosis, and coefficient stability without
changing the existing module identity, chapter URLs, checkpoint behavior, or
progress contracts. The phase explains linear-model limitations using the same
case; a full leakage-safe tabular project remains Phase 28.

</domain>

<decisions>
## Implementation Decisions

### One Reproducible Bike Sharing Case

- **D-01:** Use the existing immutable local UCI Bike Sharing hourly snapshot as the sole primary dataset. Do not switch to LaDe or California Housing partway through the lesson.
- **D-02:** Predict raw hourly rental count `cnt` in the main teaching path so predictions, residuals, and errors retain their real unit. Add a concise `log1p(cnt)` comparison only to show how a target transform changes residual shape and coefficient interpretation.
- **D-03:** The canonical feature set is `temp`, `hum`, `windspeed`, `workingday`, and `hr`.
- **D-04:** Use `atemp` only in a controlled collinearity comparison. Explicitly exclude `casual` and `registered` and teach that they leak the target because `casual + registered = cnt`.
- **D-05:** Freeze one chronological split: the first 80% of rows for training and the final 20% for held-out testing. Every fitting method, page-visible result, Notebook result, and diagnostic must use the same membership.
- **D-06:** Preserve the existing UCI source, DOI, CC BY 4.0 attribution, local snapshot, manifest, data dictionary, row order, schema, and checksum contract. Runtime code and ordinary Notebook execution must remain offline.

### Eight-Chapter Teaching Spine

- **D-07:** Preserve all eight existing chapter IDs and deep links, but rewrite their order, titles, and responsibilities into one continuous Bike Sharing teaching path.
- **D-08:** Use a case-driven sequence: real question and row prediction, batch matrix prediction, residuals and MSE, batch gradient descent, three-method comparison, coefficient interpretation, held-out diagnosis, and the boundary of linear models.
- **D-09:** At every stage, show how scikit-learn obtains the corresponding prediction, metric, coefficient, or held-out result. Scikit-learn is a continuous practical counterpart, not a separate API-only chapter.
- **D-10:** Teach every mathematical step using the rhythm “one real row, then a batch”: one prediction to `X @ w + b`, one residual to a residual vector, and one sample’s gradient contribution to the batch mean.
- **D-11:** Keep polynomial behavior, overfitting, and regularization inside the continuous eight-chapter path, but use them as diagnostic extensions of the same Bike Sharing case. Do not introduce a second housing dataset.
- **D-12:** Detailed explanation remains dominant. Checkpoints and formative prompts stay selective and non-blocking; this phase does not add an exercise bank or assessment system.

### Three Fitting Methods

- **D-13:** Give each method one explicit role: NumPy batch gradient descent explains how parameters are learned; the normal equation supplies a non-iterative numerical reference; scikit-learn demonstrates practical fitting and continuously checks predictions, coefficients, and errors.
- **D-14:** Fit preprocessing on the training partition only. Standardize continuous inputs for all three methods with the same stored statistics, leave `workingday` binary, and use the identical transformed design matrix and intercept convention.
- **D-15:** Show coefficients in model space and translate them back into understandable original-unit effects. Formula symbols, TypeScript names, Python names, tables, and bilingual prose must share one notation contract.
- **D-16:** The primary three-method comparison is unregularized ordinary least squares. Ridge and Lasso appear only in the final stability extension, with an explicit statement that their objectives differ from OLS and therefore their coefficients are not expected to match it.
- **D-17:** The page shows representative predictions, coefficients, intercept, train/test metrics, and compact method deltas. The executed Notebook preserves the complete coefficient table, gradient-descent trace, stopping result, documented tolerances, and automated assertions; results outside tolerance must not be published.
- **D-18:** Carry forward the Phase 26 Notebook parity pattern: Chinese and English learner variants must derive from one executable code source, one dataset/split/environment, and identical numerical outputs.

### Residuals and Model Limitations

- **D-19:** Teach all three required limitation patterns with the real case: an hourly residual curve for nonlinearity, increasing residual spread at higher demand for heteroscedasticity, and coefficient instability after adding `atemp` for collinearity.
- **D-20:** Diagnose in two stages. First confirm that optimization has effectively finished using loss behavior, gradient norm, and three-method agreement; only then interpret persistent held-out residual patterns as model limitations.
- **D-21:** After the staged explanation, provide one compact combined diagnostic panel for review. It may aggregate convergence, method agreement, residual, and coefficient-stability signals, but it must not replace the earlier guided sequence.
- **D-22:** Demonstrate coefficient instability with a controlled comparison: keep rows, split, target, and preprocessing fixed; add only `atemp`; compare `temp`/`atemp` coefficients, held-out predictions, and errors; then show how Ridge changes coefficient stability.
- **D-23:** Default page content shows held-out MSE/MAE/R² and residual plots. Place three to five named real held-out records behind an expandable explanation for negative predictions, peak-demand underprediction, and unusually large residuals. Keep the complete residual output in downloadable assets.
- **D-24:** Give `log1p(cnt)` only a concise diagnostic comparison rather than duplicating the complete raw-target lesson.

### Inherited Product and Compatibility Constraints

- **D-25:** Preserve the `linear-regression` module ID, `/learn/linear-regression/*` routes, eight chapter IDs, checkpoint identity, Progress V1/V2 behavior, bilingual parity, safe Markdown/math rendering, code-copy behavior, GitHub Pages base paths, mobile layout, and reduced-motion fallback.
- **D-26:** Learner-facing copy should use plain terms such as “结果”, “观察”, “对照”, and “参考输出”; do not use “证据” as a front-end navigation label or unexplained teaching term.
- **D-27:** Keep fitting, preprocessing, prediction, residual, gradient, metric, coefficient-conversion, and diagnostic calculations outside Vue components and cover them with deterministic tests.
- **D-28:** Existing visual and Manim assets may be reused only when they remain numerically and semantically consistent with the Bike Sharing case. New media is need-driven, not a quota.

### the agent's Discretion

- Map the approved eight-part teaching sequence onto the preserved chapter IDs and choose the final bilingual chapter titles, provided every old deep link remains valid and the sequence is tested.
- Select representative row IDs, the exact chronological boundary timestamp, displayed coefficient units, plot ranges, and the three to five named held-out cases from the locked execution results.
- Select learning rate, epoch cap, stopping rule, condition handling, numerical tolerances, and finite guards after validating agreement among the three methods.
- Choose whether an existing illustration can be adapted or a new static/Manim asset is pedagogically necessary after the data-driven labs and Notebook plots are designed.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Phase Contract

- `AGENTS.md` — Repository-wide architecture, content, compatibility, asset, safety, and validation rules.
- `.planning/PROJECT.md` — v1.1 content-first milestone boundary and inherited product decisions.
- `.planning/REQUIREMENTS.md` — Phase 27 requirements `LINR-01` through `LINR-04` and milestone quality requirements.
- `.planning/ROADMAP.md` — Phase 27 goal, dependency, and observable success criteria.
- `.planning/phases/26-loss-functions-rebuild/26-CONTEXT.md` — Previous-phase notation, real-data, Notebook-parity, and model-gradient handoff decisions.

### Curriculum Scope

- `docs/curriculum-v3/content-audit.md` — Canonical linear-regression rebuild gaps and relationship to the later tabular project.
- `docs/curriculum-v3/module-inventory.md` — Canonical module identity, title, prerequisites, and rebuild status.

### Bike Sharing Data Contract

- `docs/curriculum-v3/python-data-tools/sources.md` — UCI source, license, immutable-snapshot policy, and offline maintenance rules.
- `public/datasets/python-data-tools/manifest.json` — Dataset identity, source revision, row count, byte count, schema version, and checksum.
- `public/datasets/python-data-tools/data-dictionary.json` — Bilingual field meanings, roles, ranges, categories, and target relationships.
- `public/datasets/python-data-tools/bike-sharing-hour.csv` — Immutable local hourly dataset used by all Phase 27 calculations.

### Existing Linear Regression Implementation

- `src/data/linearRegressionModule.ts` — Existing typed eight-chapter definition, controls, presets, media, and bilingual teaching frames.
- `src/simulations/linearRegression.ts` — Existing pure simulation structure for line, multivariate, polynomial, overfit, regularization, residual, and diagnostic states.
- `src/components/LinearRegressionPagedLesson.vue` — Existing chapter routing, sidebar, pager, media, and page assembly.
- `src/components/LinearRegressionLessonLab.vue` — Existing interactive workbench, controls, chapter scenarios, and visual composition.
- `src/components/LinearRegressionResults.vue` — Existing chapter-specific result-card integration.
- `tests/linear-regression-simulation.test.ts` — Existing numerical and scenario behavior contract.
- `tests/linear-regression-layout.test.mjs` — Existing route, eight-chapter, lab, media, layout, and compatibility contract.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/data/linearRegressionModule.ts`: Retains the approved module identity, eight chapter IDs, localized content schema, controls, presets, and checkpoint integration.
- `src/simulations/linearRegression.ts`: Provides deterministic snapshot and pure-calculation patterns, including residual segments, gradient-driven playback, coefficient metrics, fit curves, and regularization diagnostics. Its synthetic and California-specific data authority must be replaced for the primary path.
- `src/components/LinearRegressionPagedLesson.vue`: Already provides single-chapter routing, sticky/mobile navigation, pager behavior, media rendering, and lesson assembly.
- `src/components/LinearRegressionLessonLab.vue`, `LinearRegressionUnivariateView.vue`, and `LinearRegressionMultivariateView.vue`: Existing lab shell and views can host the Bike Sharing row-to-batch, fit, and diagnostic states without introducing a second page system.
- `public/datasets/python-data-tools/` and `public/notebooks/python-data-tools/`: Existing offline UCI Bike Sharing snapshot, data contract, Notebook environment, and output patterns.
- `public/notebooks/loss-functions/`: Recent bilingual Notebook, output-manifest, integrity, and page-visible result precedent from Phase 26.

### Established Patterns

- Algorithm lessons use `AlgorithmModuleDefinition`, bilingual `LocalizedCopy`, deterministic simulations, bespoke labs, and module checkpoints.
- Core math and data transforms live in pure TypeScript utilities or simulations; Vue components compose state and presentation.
- Python assets execute offline, publish locked local outputs, and use manifests/tests to prevent page/Notebook drift.
- Public resources use `/` paths resolved through the shared public-base helpers for GitHub Pages.
- Markdown/math and code-copy behavior remain on the safe shared rendering path.

### Integration Points

- `src/views/AlgorithmView.vue`: Preserve the dedicated linear-regression page branch, requested chapter handling, and preset synchronization guard.
- `src/router/index.ts`: Preserve base-route redirect and all chapter deep links ahead of generic algorithm routes.
- `src/data/moduleCatalog.ts`, `src/data/navigationMenus.ts`, and curriculum adapters: Keep one canonical module identity and existing learning-path position.
- `src/data/algorithmCheckpoints.ts` and progress adapters: Preserve checkpoint and completion identities.
- `scripts/` and `public/notebooks/`: Add an offline, deterministic generation and verification path for the fixed split, fitted models, plots, summaries, and bilingual Notebooks.
- `tests/`: Extend numerical, content, route, asset, Notebook parity, GitHub Pages path, bilingual, mobile, and reduced-motion coverage.

</code_context>

<specifics>
## Specific Ideas

- Let learners follow the same real row from feature values to one prediction, one residual, one loss contribution, and one gradient contribution before expanding each operation to the full matrix.
- Keep sklearn visible throughout the story: every derived result should have an adjacent practical call that produces or checks it.
- Make target leakage concrete by showing why `casual` and `registered` cannot be predictors of `cnt`.
- Make a good optimization result visibly distinct from a good model: three fitting methods can agree while held-out residuals still reveal a curved or widening pattern.
- Use the `temp`/`atemp` controlled comparison to show that coefficients can move substantially while predictions move little, then show Ridge as a different objective that can stabilize the allocation.

</specifics>

<deferred>
## Deferred Ideas

- A full leakage-safe preprocessing pipeline, controlled baseline improvement, and end-to-end housing project belong to Phase 28.
- Broader feature engineering with one-hot seasonal/weather variables and cyclical hour encoding belongs to the project or later model-improvement curriculum.
- Backend assessment, cloud progress, checkpoint persistence, and a large exercise bank remain outside this milestone.

</deferred>

---

*Phase: 27-linear-regression-rebuild*
*Context gathered: 2026-07-29*
