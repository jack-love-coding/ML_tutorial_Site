# Phase 25: Numerical Methods Batch 4 — Logistic Regression Optimization and Training Diagnostics - Context

**Gathered:** 2026-07-20
**Status:** Ready for planning

<domain>
## Phase Boundary

Deepen the existing `optimization` and `training-diagnostics` Math Lab lessons through one continuous, reproducible logistic-regression case on a local UCI Banknote Authentication snapshot. The phase teaches stable binary cross-entropy, feature scale, fixed-step gradient descent, Armijo backtracking, numerical stopping and safety exits, then carries the same run traces into training-curve diagnosis. It preserves the current routes, checkpoints, Progress storage, course inventory, and one-primary-lab-per-chapter structure.

This phase does not re-teach the optimizer family, Newton/IRLS, classification threshold tuning, full model evaluation, or browser Python.

</domain>

<decisions>
## Implementation Decisions

### Continuous Teaching Case
- **D-01:** Use a small logistic-regression model as the continuous case across both chapters.
- **D-02:** Use a verified local snapshot of UCI Banknote Authentication as the authoritative dataset. Preserve source, DOI, CC BY 4.0 attribution, file hash, schema, and data dictionary.
- **D-03:** Use a deterministic stratified `70% / 15% / 15%` train/validation/test split. Fit mean and scale on training data only, then reuse those values for validation and test data.
- **D-04:** The real Banknote runs cover feature-scale effects, slow convergence, stable convergence, oscillation/divergence, stable BCE, Armijo behavior, stopping, and safety exits. Existing deterministic synthetic diagnostic modes remain as explicitly labeled support examples for overfitting, vanishing gradients, and exploding gradients; they must not be presented as Banknote results.

### Reproducible Run Matrix and Stopping Semantics
- **D-05:** Produce five locked training runs: raw features with a fixed step, standardized features with a too-small step, standardized features with a stable fixed step, standardized features with a too-large step, and standardized features with Armijo backtracking.
- **D-06:** Add a separate extreme-logit check comparing a naive BCE calculation with a numerically stable BCE calculation. Do not invent a sixth training run merely to demonstrate overflow.
- **D-07:** Keep mathematical convergence, validation early stopping, and safety termination separate. Mathematical convergence uses gradient norm, or the conjunction of sufficiently small relative-loss change and parameter-step norm. Validation patience selects a model checkpoint; it does not prove convergence. `max-iterations`, `non-finite`, and `line-search-failed` are explicit safety exit reasons.
- **D-08:** Page summaries show the run start, first backtrack where applicable, best validation checkpoint, terminal checkpoint, final test report, and exact stop reason. Full per-step traces remain downloadable as local JSON/CSV beside the executed Notebook.
- **D-09:** Exact seed, fixed L2 strength, learning rates, tolerances, Armijo constants, validation patience, and rounded anchor values must be chosen by clean-kernel execution during research/planning and then locked in the contract and manifest. Do not choose values from visual preference alone.

### Chapter Boundary
- **D-10:** `optimization` focuses on stable BCE, the effect of feature scale, fixed-step gradient descent, Armijo backtracking, stopping criteria, and explicit failure exits. SGD/Momentum/RMSProp/Adam remain links to the existing optimizer-comparison lesson rather than repeated content. Newton/IRLS remains out of the primary route.
- **D-11:** `training-diagnostics` reads the same locked traces through a four-step teaching chain: what is visible, plausible cause, one variable to change, and what the next run should show. This is detailed instruction, not a scored diagnosis exercise.
- **D-12:** Use one shared, executed Chinese Notebook from data download and integrity checks through the five runs, final library baseline, and diagnostic report. Both pages reference chapter-specific cells and outputs from that one file.
- **D-13:** Upgrade the existing `MathGradientLab` and `TrainingDiagnosticsLab`; do not create parallel replacement labs. Each chapter keeps one primary lab, and prior synthetic modes remain available as comparison surfaces.

### Code Depth and Independent Checks
- **D-14:** The teaching authority is a manual NumPy implementation. Use Pandas for data loading and SciPy for stable mathematical-function comparisons.
- **D-15:** Build the manual path in layers: `stable_bce`, `loss_and_grad`, `armijo_step`, `should_stop`, then `train_logistic`. Page code blocks follow the same order and remain copyable.
- **D-16:** Add a pinned scikit-learn dependency and execute `LogisticRegression` only as a final engineering baseline. Compare final probabilities, test log loss, accuracy, coefficient direction, and prediction agreement. Do not claim per-iteration alignment between different solvers.
- **D-17:** Reuse the previous finite-difference chapter by running a visible gradient check against `loss_and_grad` before training. Repository tests also cover the gradient, Armijo acceptance, stopping state machine, finite-number boundaries, and Notebook/browser anchor agreement.

### Objective and Metric Boundary
- **D-18:** Use one fixed small L2 term in the manual and scikit-learn objectives, with the intercept excluded from regularization. Do not expand into L2 model selection. The exact strength is locked only after the Notebook demonstrates a finite, teachable optimum.
- **D-19:** Every run records train/validation BCE, gradient norm, parameter-step norm, accepted step size, backtrack count, validation checkpoint state, and terminal reason.
- **D-20:** Only the final selected model receives the compact test report: BCE, accuracy, ROC-AUC, and confusion matrix. The classification threshold is fixed at `0.5`; ROC-AUC uses probabilities. Do not add threshold tuning, PR-AUC, calibration analysis, or a complete model-evaluation course.
- **D-21:** `optimization` owns the five-run numerical comparison. `training-diagnostics` owns cross-run curve reading and the final test-report connection.

### Browser Labs and Failure Feedback
- **D-22:** Use preset-first controls that reproduce the five locked Notebook runs, plus bounded advanced controls. `MathGradientLab` may expose feature scale, fixed/Armijo method, learning rate, gradient tolerance, and maximum iterations. Keep L2, Armijo `c`, contraction `rho`, and validation patience fixed in the primary UI.
- **D-23:** `TrainingDiagnosticsLab` selects a primary run and a comparison run and may toggle curve visibility. It should not become a quiz or broad dashboard builder.
- **D-24:** On divergence or invalid arithmetic, stop at the last finite state and display one explicit reason such as `non-finite`, `line-search-failed`, or `max-iterations`, with one suggested single-variable change. Never silently replace the learner's parameters.
- **D-25:** Browser labs recompute the real local snapshot through deterministic TypeScript using the same formula and fixed constants as the Notebook. Do not use Pyodide or another browser Python runtime. Tests compare TypeScript anchors against the Notebook manifest.

### Illustration and Manim
- **D-26:** Create one shared three-panel illustration: raw versus standardized feature scale, fixed step versus Armijo backtracking, and train/validation loss plus gradient norm and terminal markers.
- **D-27:** Produce three short Manim packages rather than one or two longer packages: feature scaling and usable learning rate; fixed step versus Armijo; training traces, best validation point, terminal reason, and next single-variable experiment.
- **D-28:** All plotted values and labels in Manim must come from locked Notebook outputs. Media may simplify pacing and staging but may not introduce schematic replacement numbers.
- **D-29:** Use short Chinese labels inside the shared illustration and videos. Maintain one media set with bilingual page copy, Chinese transcripts, English summaries, label tables, local posters, reduced-motion fallback, metadata, and hashes.

### the agent's Discretion
- Select the exact compatible scikit-learn pin, fixed seed, L2 strength, learning rates, tolerances, Armijo constants, and patience only after reproducibility and teaching-shape checks.
- Choose exact section headings, chart colors, copy length, video timing, and milestone iteration rows within the locked teaching structure and existing design system.
- Choose whether full traces use one CSV per run or one normalized CSV plus JSON manifest, provided downloads are understandable and hash-auditable.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Phase Guardrails
- `AGENTS.md` — repository-wide curriculum, media, safety, testing, Git, and Definition of Done rules.
- `.planning/PROJECT.md` — current content-first product priority and paused Homepage/Spine redesign scope.
- `.planning/ROADMAP.md` — Phase 25 goal, requirements, success criteria, and Numerical Methods Batch sequence.
- `.planning/STATE.md` — completed Batch 3 baseline and current workflow state.

### Existing Numerical Methods Pattern
- `docs/curriculum-v3/numerical-methods/batch-3-contract.md` — latest continuous-case, Notebook, lab, visual, and release contract pattern.
- `docs/refactor/summaries/numerical-methods-batch-3.md` — verified Batch 3 completion and preservation boundaries.
- `src/modules/math-lab/data/numericalBatch3Modules.ts` — companion-section and exact-output integration pattern.
- `src/modules/math-lab/data/numericalBatch3Notebook.ts` — typed Notebook/download/summary record pattern.
- `src/modules/math-lab/components/MathLabNotebookCompanion.vue` — current reusable page companion renderer.
- `scripts/numerical-methods/generate-batch-3-notebook.py` — atomic clean-kernel generation, manifest, and check-mode pattern.
- `scripts/manim/render_numerical_methods_batch_3.py` — Manim package, poster, transcript, label, hash, and check-mode pattern.
- `tests/numerical-methods-batch-3.test.ts` — content, output, asset, formula, and route-boundary test pattern.
- `tests/numerical-methods-batch-3-manim.test.ts` — Manim integrity and media-contract test pattern.

### Existing Phase 25 Runtime Surfaces
- `src/modules/math-lab/data/mathFoundationsModules.ts` — existing canonical `optimization` module identity and baseline content.
- `src/modules/math-lab/data/optimizationModule.ts` — current detailed optimization builder that must be deepened without changing the route.
- `src/modules/math-lab/data/aiBridgeModules.ts` — existing canonical `training-diagnostics` module, synthetic diagnostic sections, media, and lab placement.
- `src/modules/math-lab/data/mathCourseOrder.ts` — numerical-deepening order ending in `optimization` then `training-diagnostics`.
- `src/modules/math-lab/labs/MathGradientLab.vue` — existing optimization lab to upgrade.
- `src/modules/math-lab/labs/TrainingDiagnosticsLab.vue` — existing curve-diagnosis lab and comparison modes to preserve.
- `src/modules/math-lab/utils/aiBridgeMath.ts` — current deterministic synthetic training-scenario engine.
- `src/modules/math-lab/pages/MathLabModulePage.vue` — asynchronous lab registry and module-page assembly.
- `public/notebooks/numerical-methods/requirements.txt` — pinned Numerical Methods environment to extend with a compatible scikit-learn version.

### External Dataset Authority
- UCI Banknote Authentication dataset, DOI `10.24432/C55P57`, official page `https://archive.ics.uci.edu/dataset/267/banknote%2Bauthentication` — 1,372 rows, four continuous features, binary target, no missing values, CC BY 4.0. Planning must create a local source/manifest/data-dictionary record before runtime use.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `MathGradientLab.vue`: reusable gradient-landscape lab shell and current async component identity; extend rather than replace.
- `TrainingDiagnosticsLab.vue`: already renders train/validation loss, gradient norm, validation gap, best-validation marker, and five synthetic scenarios.
- `evaluateTrainingScenario` in `aiBridgeMath.ts`: preserve as the synthetic comparison engine while adding a separate real Banknote computation path.
- `MathLabNotebookCompanion.vue`: already supports base-safe Notebook, fixture, code, result, illustration, and Manim placements for detailed Numerical Methods chapters.
- Batch 3 Notebook/Manim generators: provide deterministic transaction, check mode, poster/transcript/metadata, and hash patterns.

### Established Patterns
- Math Lab content uses typed bilingual `MathLabModule` records and `LocalizedCopy` with both `'zh-CN'` and `en`.
- Public assets use `/` paths resolved through the existing public-base helpers for GitHub Pages.
- Core calculations live in module utilities and have Node tests; page components compose state and presentation.
- Detailed Numerical Methods batches use a real continuous case, a clean-kernel Notebook, exact runtime summaries, one primary lab per chapter, local media, browser checks, and one independent commit/PR.
- Learner-facing copy should use plain terms such as result, observation, or explanation; do not introduce generic “证据” wording into new frontend content.

### Integration Points
- Preserve `/math-lab/modules/optimization?route=numerical-deepening-path` and `/math-lab/modules/training-diagnostics?route=numerical-deepening-path`.
- Extend the `optimization` module override in `src/modules/math-lab/data/modules.ts` and the canonical `training-diagnostics` source without creating alternate IDs such as `numerical-optimization`.
- Register new companion records in `MathLabModulePage.vue` while keeping lab imports lazy.
- Extend the Numerical Methods requirements, dataset, Notebook, output, illustration, and Manim directories with Batch 4 manifests rather than inventing a second asset convention.

</code_context>

<specifics>
## Specific Ideas

- The continuous case should make one causal teaching chain visible: raw feature scales distort a fixed step, standardization makes a stable step possible, Armijo searches for an acceptable step, stop records explain why training ended, and the same traces become the training-diagnosis material.
- A fixed run can be “unsuccessful” and still be a successful teaching artifact if it terminates safely with the intended, reproducible reason.
- The final scikit-learn comparison is a bridge to library usage, not a replacement for the numerical implementation or a claim that solver traces are identical.
- Page content remains detailed and teaching-led; this phase adds no exercise bank, grading, acceptance UI, or backend validation.

</specifics>

<deferred>
## Deferred Ideas

- Full SGD, Momentum, RMSProp, and Adam comparison remains in the existing optimizer-comparison course.
- Newton/IRLS and second-order logistic-regression optimization are deferred to an advanced numerical-optimization extension.
- L2 tuning, threshold selection, PR-AUC, calibration curves, full classification reporting, and experiment tracking are deferred to model-selection/evaluation work.
- Separate Chinese and English media renders are deferred; Phase 25 maintains one auditable media set.
- Browser Python/Pyodide, backend kernels, uploads, accounts, durable progress, Phase 24B Homepage Focus, and Phase 24C Spine progressive disclosure remain out of scope.

</deferred>

---

*Phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a*
*Context gathered: 2026-07-20*
