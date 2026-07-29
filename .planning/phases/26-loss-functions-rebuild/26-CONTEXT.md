# Phase 26: Loss Functions Rebuild - Context

**Gathered:** 2026-07-28
**Status:** Ready for planning

<domain>
## Phase Boundary

Rebuild the existing `/learn/loss-functions` module into a detailed, bilingual, reproducible lesson that lets learners calculate MSE, MAE, and stable BCE; explain outlier and confident-error behavior through loss scale and output-level gradients; and verify vectorized NumPy gradients with finite differences. The phase preserves the existing module identity, route, checkpoints, progress behavior, and six conceptual chapters, then adds one final gradient-verification chapter. Full model fitting, parameter-training derivations, threshold decisions, and full multiclass treatment remain in later phases.

</domain>

<decisions>
## Implementation Decisions

### Teaching Chapter Spine

- **D-01:** Keep all six existing conceptual chapters as core content: error/loss/objective, MSE/MAE, BCE, likelihood, negative log, and the MLE bridge.
- **D-02:** Use the beginner-first order “learn to use the losses, then explain their probabilistic origin.” The final sequence is the six existing chapters followed by one unified analytic-gradient and finite-difference verification chapter.
- **D-03:** Place NumPy code and locked run outputs beside the concepts they implement. Do not isolate all code in a distant appendix or downloadable-only workflow.
- **D-04:** Keep the existing Softmax material accessible as a concise BCE chapter bridge. It is not a Phase 26 Notebook topic, primary gradient target, or primary checkpoint.

### Real-Data Teaching Cases

- **D-05:** Create new Phase 26 cases rather than reusing the earlier `MSE=2.5` mathematics fixture.
- **D-06:** The regression-loss case should use a reproducible real public delivery-time dataset with auditable provenance, license/source notes, schema, checksum, and a frozen local copy. Exact source selection is a research/planning task; synthetic delivery records are not an acceptable silent substitute.
- **D-07:** The binary-loss case should use a reproducible real public manufacturing-defect dataset with the same provenance and local reproducibility contract. Exact source selection is a research/planning task; if no source satisfies the contract, planning must surface the conflict instead of silently changing the domain or using generated data.
- **D-08:** Freeze a small set of representative real rows and model predictions for page-visible, per-example calculations while running each complete dataset in a clean-kernel Notebook.
- **D-09:** Publish full-data metrics, per-example losses, loss distributions, unusual or high-contribution cases, and relevant plots as local auxiliary teaching assets. These outputs support the explanation; they do not replace the page’s worked calculations.
- **D-10:** Keep logits `-1000` and `1000` as explicitly synthetic numerical-stability probes. Do not present them as ordinary outputs observed in the real defect dataset.

### BCE and Gradient Depth

- **D-11:** Introduce BCE in the probability domain for intuition, connect `p = sigmoid(z)`, then use the equivalent logit-domain `softplus(z) - y*z` or `logaddexp` formulation as the canonical stable implementation. Demonstrate agreement on ordinary finite inputs.
- **D-12:** Derive gradients with respect to model outputs, not full model parameters: `∂MSE/∂ŷ`, an explicit MAE subgradient convention, and `∂BCE/∂z = sigmoid(z) - y`, including the batch-mean factor. Use a short chain-rule handoff to later model courses.
- **D-13:** Show per-element analytic and central-difference gradients, absolute or relative errors, explicit tolerances, and a small step-size sweep for MSE, MAE, and BCE.
- **D-14:** Treat zero-residual MAE as a non-differentiable point. Explain the chosen subgradient convention and do not claim a unique derivative or require an invalid central-difference equality at the kink.
- **D-15:** Publish a locked comparison for logits `-1000`, `-20`, `0`, `20`, and `1000` across naive probability BCE, clipped probability BCE, and stable logit BCE. Mark `inf`/`NaN` and objective changes explicitly.
- **D-16:** Keep interactive controls bounded to a readable teaching range. Extreme values belong in deterministic fixed probes rather than an arbitrary free-number input surface.

### Notebook and Visual Materials

- **D-17:** Publish two topic-specific Notebooks: one for real-data MSE/MAE regression analysis and one for real-data BCE plus gradient verification.
- **D-18:** Publish separate Chinese and English variants of each Notebook, for four files total.
- **D-19:** All locale variants must derive from the same code source, dataset versions, environment, execution order, and locked numerical outputs. Add parity/integrity checks so translation cannot change code or results.
- **D-20:** Place selected Notebook results beside the chapter concepts they support: real rows and outlier behavior in MSE/MAE, per-example BCE and confident mistakes in BCE, and finite-difference tables in the final verification chapter. Provide one consolidated download area at the end.
- **D-21:** Use the rebuilt existing interactive labs and deterministic Notebook tables/plots as the primary visuals. Add an image or Manim segment only when an abstract or continuous process cannot be explained clearly by those assets.

### Inherited Product Constraints

- **D-22:** Preserve the `loss-functions` module ID, `/learn/loss-functions` route and deep links, checkpoint submission, Progress V1/V2 behavior, bilingual page parity, safe Markdown/math rendering, GitHub Pages base paths, and mobile/reduced-motion fallbacks.
- **D-23:** Keep exercises selective, formative, and non-blocking. Detailed teaching remains the dominant page content.
- **D-24:** Keep pure loss calculations, numerical guards, gradient logic, and finite-difference checks outside Vue components and cover them with deterministic tests.

### the agent's Discretion

- Select the exact real public datasets within the locked delivery-time and manufacturing-defect domains, provided provenance, license, download stability, local redistribution, schema clarity, and lesson suitability are verified.
- Select the frozen row IDs, baseline model/configuration used to generate predictions, plot designs, finite-difference step values, and numerical tolerances from reproducible results.
- Choose filenames and generation mechanics for the four locale-specific Notebooks, but enforce a single executable source of truth and output parity.
- Decide whether one image or Manim asset is pedagogically necessary after auditing the rebuilt interactions and Notebook plots; no asset quota is required.

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project and Phase Contract

- `AGENTS.md` — Repository-wide content, architecture, compatibility, asset, safety, and validation rules.
- `.planning/PROJECT.md` — Current milestone goal, content-first priority, compatibility boundary, and validated architectural decisions.
- `.planning/REQUIREMENTS.md` — Phase 26 requirements `LOSS-01` through `LOSS-03` and milestone-wide quality constraints.
- `.planning/ROADMAP.md` — Phase 26 goal, dependencies, and observable success criteria.

### Curriculum Scope and Existing Content Intent

- `docs/curriculum-v3/content-audit.md` — Canonical rebuild gap: fixed loss values and gradients, outlier behavior, and overconfident-error explanations.
- `docs/curriculum-v3/module-inventory.md` — Canonical module identity, curriculum role, prerequisites, and rebuild status.
- `docs/ml-content-import-plan.md` — Existing six-chapter loss-function teaching intent and source adaptation history.

### Numerical and Reproducibility Precedents

- `docs/refactor/summaries/numerical-methods-batch-4.md` — Existing stable BCE, extreme-logit, deterministic-output, Notebook, and verification precedent; reuse the numerical discipline, not its banknote teaching case.
- `docs/math-to-code-numpy-sources.md` — Existing NumPy and central-difference terminology/parity precedent; Phase 26 deliberately uses new real-data fixtures instead of copying its `MSE=2.5` values.

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets

- `src/data/lossFunctionsModule.ts`: Existing typed `AlgorithmModuleDefinition` with the six approved chapter identities, bilingual long-form copy, presets, and embedded lab IDs.
- `src/simulations/lossFunctions.ts`: Existing deterministic snapshot pipeline for MSE, MAE, BCE, likelihood, NLL, MLE, outlier behavior, and Softmax. Its probability clipping is not sufficient as the canonical stable BCE implementation, but its simulation structure is reusable.
- `src/components/LossFunctionsLessonLab.vue`: Existing chapter-to-lab registry for the six bespoke loss labs.
- `src/components/WhyLossLab.vue`, `src/components/RegressionLossLab.vue`, `src/components/ClassificationLossLab.vue`, `src/components/LikelihoodIntuitionLab.vue`, `src/components/NegativeLogLab.vue`, `src/components/MleBridgeLab.vue`: Existing interactions to refactor around the locked real-data outputs and notation.
- `src/components/LossFunctionsResults.vue`: Existing section-specific result summaries that can host locked Notebook-derived values.
- `src/data/algorithmCheckpoints.ts`: Existing `loss-functions` checkpoint identity, misconception tags, explanations, and revisit links.
- `public/notebooks/python-data-tools/` and `public/notebooks/numerical-methods/`: Existing local Notebook, environment, manifest, output, and GitHub Pages asset patterns.

### Established Patterns

- Algorithm lessons use `AlgorithmModuleDefinition`, `StorySection`, bilingual `LocalizedCopy`, deterministic simulations, and bespoke labs mounted from the page.
- Core calculations live in pure TypeScript utilities or simulations; Vue components compose state and presentation.
- Public data, Notebooks, outputs, and figures use local `/` paths resolved through the project’s public-base helpers.
- Executed Notebook outputs are locked by manifests and repository tests rather than generated at browser runtime.
- Existing Markdown/math rendering and code-copy behavior must remain on the safe shared rendering path.

### Integration Points

- `src/views/AlgorithmView.vue`: The existing special `loss-functions` page branch, chapter scrolling, lab placement, companion copy, and next-lesson bridges.
- `src/data/moduleCatalog.ts` and `src/data/navigationMenus.ts`: Existing catalog and navigation identity; the phase must not introduce a duplicate module.
- `src/utils/algorithmProgress.ts` and the Curriculum Progress adapters: Existing completion and checkpoint compatibility boundary.
- `src/utils/publicPath.ts`: GitHub Pages-safe paths for datasets, Notebooks, manifests, figures, and optional media.
- `tests/`: Add focused loss utility, content contract, Notebook parity, asset integrity, route/checkpoint, and layout coverage while preserving the full repository gates.

</code_context>

<specifics>
## Specific Ideas

- Real data and executed Notebook results are auxiliary teaching assets: they make the lesson honest and reproducible, while the page still explains every key calculation.
- The page should let learners trace one real row through prediction/label, per-example loss, gradient contribution, and the batch objective before showing full-data distributions.
- “Stable” must be observable: ordinary inputs agree across equivalent formulas, naive extreme inputs fail visibly, clipped results are identified as objective-changing, and the canonical logit formulation remains finite.
- Visual production is need-driven. Existing interactions and reproducible plots come first; image generation or Manim is justified only by a specific explanatory gap.

</specifics>

<deferred>
## Deferred Ideas

- Full `∂L/∂w` and `∂L/∂b` derivations and training loops belong to Phase 27 Linear Regression Rebuild and Phase 29 Logistic Regression Rebuild.
- Equal-depth multiclass Softmax code, gradients, and decision analysis belong to Phase 30 Classification Decisions Rebuild; Phase 26 retains only the existing conceptual bridge.
- Arbitrary numeric-input labs, browser Python/Pyodide, backend assessment, and checkpoint persistence are outside this phase.

</deferred>

---

*Phase: 26-loss-functions-rebuild*
*Context gathered: 2026-07-28*
