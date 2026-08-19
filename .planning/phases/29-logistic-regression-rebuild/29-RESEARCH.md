# Phase 29: Logistic Regression Rebuild - Research

**Researched:** 2026-08-19  
**Domain:** Reproducible binary-classification teaching flow, Vue 3 chapter labs, and static numerical/media assets  
**Confidence:** HIGH for the in-repository seams; MEDIUM for library behavior cited from official documentation.

<!-- DATA_Q7mP2xLv_START -->
<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

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

### Deferred Ideas (OUT OF SCOPE)

- Platt scaling, isotonic regression, and a broader probability-calibration methods comparison are optional future material.
- Threshold sweeps, confusion matrices, precision, recall, F1, ROC/AUC, cost-aware threshold selection, subgroup analysis, and named held-out errors belong to Phase 30.
- A free-form logistic exploration route, full Banknote row browser, full repeated EDA, browser Python, backend assessment, and a larger exercise bank remain outside this phase.
- The first visible final-test evaluation is intentionally deferred to Phase 30 so threshold selection remains leakage-safe.
</user_constraints>
<!-- DATA_Q7mP2xLv_END -->

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|---|---|---|
| LOGR-01 | Learners can connect linear scores, sigmoid probabilities, log-odds, maximum likelihood, and binary cross-entropy. | Use one frozen Banknote row and the six-chapter typed course contract; the likelihood lab must display product underflow beside log-sum stability. |
| LOGR-02 | Learners can implement stable binary cross-entropy, logistic gradients, deterministic training, and finite-difference checks in NumPy. | Reuse/extend the existing stable logistic engine, whose score-domain BCE and analytic gradient are already tested; publish the full train trace rather than train in Vue. |
| LOGR-03 | Learners can compare scratch coefficients and probabilities with scikit-learn under aligned preprocessing and regularization settings. | Generate one executed, version-pinned asset with an explicit no-penalty parity stage and a separate L2 stage; test feature order, intercept, objective, coefficient/probability tolerances, and hashes. |
| LOGR-04 | Learners can inspect probability calibration and use a nonlinear example to explain the limit of a linear decision boundary. | Use frozen validation logits for original/softened/sharpened reliability data, plus isolated XOR and circles diagnostic assets that never enter Banknote fitting or selection. |
</phase_requirements>

## Summary

Phase 29 should be a local, typed course rebuild rather than a new global lesson framework. The repository already has the necessary stable numerical primitive, fixed Banknote split, paged route shell, safe Markdown/KaTeX chain, base-safe asset paths, and a proven lazy scene-loader pattern. The main implementation task is to replace the old synthetic cockpit with six route-lazy scenes and a deterministic logistic asset package while retaining the legacy module identity and Progress/checkpoint boundaries. [VERIFIED: `src/modules/math-lab/utils/banknoteDataset.ts:3-39`, `src/modules/math-lab/utils/banknoteLogistic.ts:245-332`, `src/components/LinearRegressionObservationLab.vue:1-94`]

The most important planning boundary is authority: browser code may calculate a score, stable sigmoid, likelihood contribution, BCE, gradient contribution, or controlled calibration transform, but it must not retrain a Banknote model or create fresh library-parity/calibration output. Those results should be generated once by a pinned notebook/build script, published with a manifest and hashes, then replayed by the chapter labs. This keeps results reproducible and prevents both parameter drift and accidental test-set disclosure. [VERIFIED: `29-CONTEXT.md:76-96`, `src/simulations/linearRegressionInteraction.ts:77-105`, `scripts/linear-regression/build-phase-27a-assets.py:130-163`]

**Primary recommendation:** Implement a phase-local `src/modules/logistic-regression/` contract with one pure numeric engine, six lazy SVG labs, a notebook-derived `public/logistic-regression/phase-29/` package, and an explicit final-only prediction-handoff/manifest contract; use the existing paged course and `ChapteredMediaPlayer` rather than rebuilding routing, progress, media, or Markdown infrastructure.

## Architectural Responsibility Map

| Capability | Primary Tier | Secondary Tier | Rationale |
|---|---|---|---|
| Deep chapter route and legacy redirect | Browser / Client | CDN / Static | Vue Router resolves the preserved paths; Pages only serves the SPA fallback. [VERIFIED: `src/router/index.ts:169-177`] |
| Bilingual narrative, formulas, code, and final resources | Browser / Client | CDN / Static | Typed lesson data is rendered client-side through the existing safe Markdown/KaTeX component; notebooks/CSV/media are static downloads. [VERIFIED: `src/utils/markdownMath.ts:1-151`, `src/modules/optimizer-comparison/OptimizerPagedLesson.vue:50-60`] |
| Exact score/BCE/gradient/finite-difference calculations | Browser / Client | — | Small bounded values can use tested pure TypeScript without any DOM dependency. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:245-332`] |
| Full Banknote fit, sklearn parity, calibration bins, figures, frozen prediction handoff | CDN / Static | Browser / Client | Build-time Notebook/script is the numeric authority; the browser validates/loads and displays published data. [VERIFIED: `29-CONTEXT.md:91-96`, `scripts/linear-regression/build-phase-27a-assets.py:130-163`] |
| Interactive scene chunk loading and abort lifecycle | Browser / Client | CDN / Static | `defineAsyncComponent` keeps each lab out of the initial bundle; `AbortController` prevents obsolete fetch results on chapter changes. [VERIFIED: `src/components/LinearRegressionObservationLab.vue:1-69`] |
| Videos, poster fallbacks, transcript, markers, and reduced motion | Browser / Client | CDN / Static | `ChapteredMediaPlayer` owns base-safe sources, controls, marker seeking, transcript rendering, and fallback behavior. [VERIFIED: `src/components/ChapteredMediaPlayer.vue:1-115`] |
| Reproducible MP4/poster/transcript/hash publication | Build tooling | CDN / Static | Manim renderer validates assets with ffprobe and publishes a metadata package under `public/`. [VERIFIED: `scripts/manim/render_optimizer_comparison.py:34-190`] |

## Project Constraints (from AGENTS.md)

- Use Vue 3, TypeScript, Vite, Pinia/Vue Router, current D3/Three/Manim patterns, KaTeX/markdown-it/sanitize-html, and Node test runner; do not introduce a UI framework. [VERIFIED: `AGENTS.md:15-35`]
- Keep `LocalizedCopy` bilingual parity and use typed course schemas; preserve the algorithm-module interfaces instead of making untyped objects. [VERIFIED: `AGENTS.md:38-56`]
- Keep computation, scoring, data transforms, and simulations outside Vue templates/components; page components compose, display, and handle interaction. [VERIFIED: `AGENTS.md:58-71`]
- Preserve lazy route imports, bounded/keyboard-accessible controls, `withPublicBase` static paths, responsive/fallback behavior, and reduced-motion access. [VERIFIED: `AGENTS.md:66-91`]
- Render formulas/Markdown only through `src/utils/markdownMath.ts` or its existing wrapper; do not bypass `sanitize-html`, add raw executable HTML, inline handlers, or uncontrolled iframes. [VERIFIED: `AGENTS.md:93-103`]
- Validate NaN/Infinity and ranges for user-controlled inputs; color cannot be the only state signal. [VERIFIED: `AGENTS.md:87-103`]
- Add/update tests for numerical, route/layout, resource-path, Markdown/security, and lifecycle work as applicable; run `npm test`, builds, and the security audit at release scope. [VERIFIED: `AGENTS.md:105-125`]
- Preserve legacy routes and all three V1 localStorage sources; every phase remains independently validated, committed, and PR-ready. [VERIFIED: `AGENTS.md:151-160`]

## Standard Stack

### Core

| Library / facility | Locked version or source | Purpose | Why it is the phase standard |
|---|---|---|---|
| Vue 3 + TypeScript + Vite | Existing project dependencies: `"vue": "^3.5.30"`, `"typescript": "~5.9.3"`, `"vite": "^8.0.11"`. [VERIFIED: `package.json:26-44`] | Paged course shell, lazy scene components, typed contracts | Existing course shells and lazy lab patterns already compile and are covered by the Node/Vite suite. [VERIFIED: `src/components/LinearRegressionObservationLab.vue:1-94`] |
| Existing Banknote logistic engine | `stableSigmoid`, `softplus`, `stableBinaryCrossEntropy`, and `lossAndGrad`. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:245-332`] | Exact browser-sized calculations and deterministic scratch reference | Its BCE is logit-domain and its gradient excludes the intercept from L2, matching Phase 29’s scratch-teaching scope. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:294-332`] |
| Existing pinned Python numerical environment | `numpy==2.4.6`, `pandas==3.0.3`, `scikit-learn==1.9.0`. [VERIFIED: `public/notebooks/numerical-methods/requirements.txt:1-8`] | Executed Notebook and published parity/calibration assets | The Banknote manifest records this environment and makes the script/notebook result auditable. [VERIFIED: `public/datasets/numerical-methods/banknote-authentication-manifest.json:88-108`] |
| `ChapteredMediaPlayer` | Existing shared component. [VERIFIED: `src/components/ChapteredMediaPlayer.vue:1-115`] | MP4, poster, markers, transcript, reduced-motion and base-path behavior | It prevents a second hand-rolled media control/fallback implementation. |

### Supporting

| Library / facility | Version | Purpose | When to use |
|---|---|---|---|
| `markdown-it`, KaTeX, `sanitize-html` | Existing dependencies: `"markdown-it": "^14.1.1"`, `"katex": "^0.16.44"`, `"sanitize-html": "^2.17.6"`. [VERIFIED: `package.json:26-36`] | Safe prose, code, Markdown tables, and math | Use only through `renderMarkdownWithMath` / `MarkdownMathContent`; retain `String.raw` for TeX-bearing template literals. [VERIFIED: `src/utils/markdownMath.ts:94-151`] |
| D3/SVG and pure TypeScript | Existing dependency `"d3": "^7.9.0"`. [VERIFIED: `package.json:26-32`] | Deterministic charts and responsive lab scenes | Prefer native SVG with semantic table/text fallback; do not use a new visualization UI framework. [VERIFIED: `AGENTS.md:74-91`] |
| Manim Community + ffprobe | Available as `Manim Community v0.20.1` and `ffprobe version 8.1.2`. [VERIFIED: local environment probe, 2026-08-19] | Four language-neutral media packages and release validation | Render one scene at a time with explicit 1920×1080/30 fps and validate dimensions, duration, markers, hashes, poster, and transcripts. [VERIFIED: `scripts/manim/render_optimizer_comparison.py:97-190`] |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|---|---|---|
| Executed static sklearn assets | Train a model in the browser | Reject: it would duplicate a numerical authority, enlarge the client work, and make scratch/library parity/calibration output harder to reproduce. [VERIFIED: `29-CONTEXT.md:91-96`] |
| Six route-lazy labs | Keep the shared synthetic cockpit | Reject: the cockpit currently exposes synthetic datasets, threshold control, precision/recall, and a single multi-purpose UI, which conflicts with the chapter responsibilities and Phase 30 boundary. [VERIFIED: `src/components/LogisticRegressionLessonLab.vue:105-163`, `src/simulations/logisticRegression.ts:18-112`] |
| Logit-domain BCE | `log(sigmoid(z))` in browser code | Reject: a combined logits+BCE operation is documented as numerically stable because it uses a log-sum-exp technique. [CITED: https://docs.pytorch.org/docs/2.9/generated/torch.nn.BCEWithLogitsLoss.html] |
| Explicit `--resolution 1920,1080 --fps 30` | Manim quality preset | Reject: current Manim quality aliases pair 1920×1080 with 60 fps; the phase contract requires 30 fps. [CITED: https://docs.manim.community/en/stable/guides/configuration.html] |

**Installation:** None. Phase 29 should use existing JavaScript and pinned Python dependencies; no package installation is required.

## Package Legitimacy Audit

No external package is proposed for installation. The phase consumes already committed project dependencies and the existing pinned Notebook environment; package-legitimacy checks are therefore not applicable.

## Architecture Patterns

### System Architecture Diagram

```text
Learner opens preserved /learn/logistic-regression/:chapterId
                         |
                         v
       Vue Router + AlgorithmView compatibility branch
                         |
                         v
  Phase-local typed course contract (six preserved chapter IDs)
       |                  |                     |
       |                  |                     +--> final chapter: refs/downloads/checkpoint/Phase 30 link
       |                  v
       |         MarkdownMathContent --> sanitized KaTeX/Markdown
       v
chapter-scoped lazy lab loader ---------> abortable JSON fetch
       |                                      |
       |                                      v
       |                             hash-bound static asset package
       |                           (Notebook/script + figures + CSV/JSON)
       v
pure TypeScript calculation engine
(score/sigmoid/odds/BCE/gradient/fd/calibration transform)
       |
       v
SVG + keyboard controls + text/table fallback

Manim source + prompt/tree + transcripts --> selective renderer --> MP4/poster/metadata --> ChapteredMediaPlayer
```

### Recommended Project Structure

```text
src/modules/logistic-regression/
├── types.ts                 # phase-local chapter, lab, asset, and manifest contracts
├── data/course.ts           # bilingual six-chapter teaching blocks and final resources
├── data/media.ts            # typed runtime mirror of video metadata/transcripts
├── engine.ts                # pure score/BCE/gradient/fd/calibration/diagnostic helpers
├── assets.ts                # base-safe fetch + schema/hash/finite validation
└── labs/
    ├── LogisticLessonLab.vue # lightweight dynamic scene shell
    ├── LinearScoreScene.vue
    ├── SigmoidProbabilityScene.vue
    ├── LikelihoodScene.vue
    ├── LogLossGradientScene.vue
    ├── TrainingParityScene.vue
    └── CalibrationLimitsScene.vue

scripts/logistic-regression/
├── build-phase-29-assets.py # pure analysis composition, notebook execution, staging/publish
└── phase29_analysis.py      # testable numerical/data helpers

public/logistic-regression/phase-29/
├── manifest.json
├── interactions/*.json
├── figures/*.png
├── banknote-logistic-regression.{zh-CN,en}.ipynb
└── frozen-predictions.{csv,json}
```

The paths above are the recommended new phase-local organization, not an assertion that they already exist. [ASSUMED]

### Pattern 1: Local typed course data plus one explicit block sequence

**What:** Follow the optimizer course’s `CourseBlockKind`/`CourseChapter` pattern, but keep the contract local to logistic regression. It supports a fixed content order and forces bilingual data, code, animation, lab, and conclusion elements to be specified together. [VERIFIED: `src/modules/optimizer-comparison/data/course.ts:1-40`]

**When to use:** For all six rebuilt chapters; render the final-only references/downloads/checkpoint from the `linear-limits` chapter condition rather than duplicating them inside all module chapters. [VERIFIED: `src/modules/optimizer-comparison/OptimizerPagedLesson.vue:55-59`]

### Pattern 2: Dynamic scene shell + validated chapter asset

**What:** Map a discriminated chapter scene ID to `defineAsyncComponent`, fetch only that scene’s JSON using `AbortController`, validate expected scene ID and finite values before rendering, and leave a localized retry/text fallback when unavailable. [VERIFIED: `src/components/LinearRegressionObservationLab.vue:23-93`, `src/simulations/linearRegressionInteraction.ts:17-105`]

**When to use:** The six logistic labs. Each scene should receive typed, already validated data; it should not parse raw CSV, fit sklearn, or contain global course selection logic. [VERIFIED: `AGENTS.md:58-71`]

### Pattern 3: Single numerical authority with browser replay

**What:** Put data loading, feature ordering, model configuration, row selection, parity, calibration, figures, and manifest hashes in the executed asset generator. Keep functions for score/sigmoid/log-likelihood/BCE/gradient/central-difference small and directly testable in TypeScript. [VERIFIED: `29-CONTEXT.md:91-96`, `scripts/linear-regression/build-phase-27a-assets.py:80-109`]

**When to use:** Any output learners are asked to compare across code, figure, video, and lab. The same generated source must supply display anchors and animation numbers. [VERIFIED: `scripts/manim/render_optimizer_comparison.py:46-94`]

### Pattern 4: Explicit parity experiments rather than library defaults

**What:** First generate an unregularized comparison with exact feature order, standardization, intercept convention, solver, stopping criterion, and tolerances declared in the manifest. Then generate the L2 comparison under its separately declared objective. scikit-learn describes no-penalty logistic regression and distinguishes penalties/solvers; the plan must encode the specific setting instead of relying on defaults. [CITED: https://scikit-learn.org/stable/modules/linear_model.html]

**When to use:** `regularization`, where the two-stage lesson needs to make “same objective” and “different objective” visible.

### Pattern 5: Media package integrity gate

**What:** Model the logistic registry after optimizer media: commit source scene, prompt, knowledge tree, bilingual transcripts, poster, MP4 and metadata; assert runtime registry content/hashes against metadata and use `ffprobe` to verify resolution/fps/duration/markers. [VERIFIED: `src/modules/optimizer-comparison/data/media.ts:3-28`, `tests/optimizer-course-media.test.mjs:74-139`, `scripts/manim/render_optimizer_comparison.py:133-190`]

### Anti-Patterns to Avoid

- **Reusing the old synthetic cockpit as the lesson lab:** It still makes synthetic `tilted`, `blobs`, and `xor` data central and displays Phase-30 metrics. Replace it with a compatibility wrapper or stop mounting it from the course shell; do not delete its public component until tests and deep links remain intact. [VERIFIED: `src/components/LogisticRegressionLessonLab.vue:105-163`, `src/simulations/logisticRegression.ts:23-112`]
- **A global Lesson Block Renderer migration:** Context explicitly limits the refactor to a phase-local registry and preserves `AlgorithmModuleDefinition`. [VERIFIED: `29-CONTEXT.md:117-118`]
- **Mixed timing of source-of-truth values:** Do not manually copy output numbers into copy, scene code, figures, and video. Bind them to the published data and validate hashes. [VERIFIED: `scripts/manim/render_optimizer_comparison.py:46-94`]
- **Threshold metrics in this phase:** Remove/avoid threshold sweeps, confusion matrices, precision, recall, F1, ROC/AUC, cost selection, and learner-facing test evaluation. [VERIFIED: `29-CONTEXT.md:83-90`]
- **Raw Markdown/HTML escape hatches:** Keep all narrative/TeX in `String.raw` and the existing sanitizer renderer. [VERIFIED: `src/utils/markdownMath.ts:94-151`, `AGENTS.md:93-103`]

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---|---|---|---|
| Safe rich text and formula rendering | Custom regex-to-HTML rendering or unsafe `v-html` input | `MarkdownMathContent` / `renderMarkdownWithMath` | Existing sanitizer, KaTeX rendering and Pages-safe URL transformation are already centralized. [VERIFIED: `src/utils/markdownMath.ts:13-151`] |
| Video marker, poster, transcript, reduced-motion behavior | A second logistic video player | `ChapteredMediaPlayer` | Existing component handles source failure, media listener cleanup, keyboard-native buttons, poster, and transcript fallback. [VERIFIED: `src/components/ChapteredMediaPlayer.vue:36-115`] |
| Whole-course scene loading | Eagerly import all six labs | `defineAsyncComponent` registry | The existing scene shells prove the route-scoped lazy/abort pattern. [VERIFIED: `src/components/LinearRegressionObservationLab.vue:23-69`] |
| Logistic stable loss/gradient core | A fresh component-local loss function | Extend `banknoteLogistic.ts` or phase-local pure adapter | Existing code already implements stable sigmoid, softplus/logit BCE, finite checks, regularization convention, and analytic gradients. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:245-332`] |
| Calibration methods | Platt scaling/isotonic machinery | Frozen logits plus explicitly controlled temperature-like transforms | The phase teaches calibration reading, not calibration-method selection; fit-based calibration is deferred. [VERIFIED: `29-CONTEXT.md:128-131`] |
| Media integrity verification | Ad hoc “file exists” checks | Existing renderer/metadata/hash/ffprobe pattern | Asset validity includes content, dimensions, timeline, source records, and runtime metadata parity. [VERIFIED: `scripts/manim/render_optimizer_comparison.py:133-190`] |

**Key insight:** this phase is a controlled reconciliation of math, code, live interaction, static assets, and media. The reusable infrastructure already exists; the nontrivial work is maintaining one declared numerical contract everywhere.

## Runtime State Inventory

| Category | Items Found | Action Required |
|---|---|---|
| Stored data | Browser Progress V2 reads pre-existing V1 localStorage and preserves values; source quotes the legacy storage keys as `ml-atlas:algorithm-progress:v1`, `ml-atlas:math-lab-progress:v1`, and `ml-atlas:data-lab-progress:v1`. [VERIFIED: `AGENTS.md:151-160`] | Code edit only: preserve module/route/chapter/checkpoint identities. No storage migration or key rename is authorized. |
| Live service config | GitHub Pages is built from `.github/workflows/deploy-pages.yml`, which runs `npm run test:ci` then `npm run build:pages`; no external runtime course service is declared in this static deploy workflow. [VERIFIED: `.github/workflows/deploy-pages.yml:1-62`] | None for the course refactor; keep Pages-safe public paths and Pages build validation. |
| OS-registered state | None found in repository configuration; no launchd/systemd/pm2/task-scheduler artifacts were located by the repository-file inventory. [VERIFIED: repository file inventory, 2026-08-19] | None. |
| Secrets/env vars | No logistic-specific secret or environment variable is used by the source route, dataset loader, or Pages workflow inspected. [VERIFIED: `src/modules/math-lab/utils/banknoteDataset.ts:263-301`, `.github/workflows/deploy-pages.yml:1-62`] | None. Do not add credentials for static data/media. |
| Build artifacts / installed packages | `dist`, `node_modules`, media scratch output, and local worktrees are ignored; published course assets live deliberately under `public/`. [VERIFIED: `.gitignore:1-31`] | Code/content publish only: do not commit transient render output outside intended `public/` assets; run media verification after publishing. |

## Common Pitfalls

### Pitfall 1: Calling the Banknote labels “genuine” and “forged”

**What goes wrong:** Copy turns an unspecified integer target into a semantic claim.  
**Why it happens:** The dataset description discusses banknote-like specimens, but the public variable table provides `class` without mapping 0/1 to a human meaning. [CITED: https://archive.ics.uci.edu/dataset/267/banknote%2Bauthentication]  
**How to avoid:** Use only `class 0` and `class 1` in bilingual prose, tables, alt text, and code comments.  
**Warning signs:** Any learner-facing `genuine`, `forged`, “真钞”, or “假钞” appears in Phase 29 files.

### Pitfall 2: Silent objective mismatch in scratch/sklearn parity

**What goes wrong:** Coefficients differ and the lesson implies a library is inconsistent.  
**Why it happens:** Penalty, `C`, sample weighting, feature order, intercept policy, solver/tolerance, and stopping rule change the optimized objective or numerical endpoint. scikit-learn documents its objective and solver/penalty support. [CITED: https://scikit-learn.org/stable/modules/linear_model.html]  
**How to avoid:** Persist the exact environment, preprocessing, model config, coefficient ordering, parameter convention, tolerance, and objective label in the parity JSON/manifest; test both coefficient and probability closeness.  
**Warning signs:** A parity comparison calls `LogisticRegression()` with no explicit parameters or shows only accuracy.

### Pitfall 3: Probability underflow hides the likelihood lesson

**What goes wrong:** A product of many correct nonzero probabilities reaches `0` in floating point, so learners cannot see why log-likelihood is used.  
**Why it happens:** Repeated multiplication rapidly moves below representable magnitude; directly evaluating `log(sigmoid(z))` also has unstable extreme-logit branches.  
**How to avoid:** Deliberately show finite per-row probability contributions, the underflowing product, the additive log-likelihood, and `softplus(z) - y*z` for BCE. Existing implementation uses that logit-domain expression. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:245-257`]  
**Warning signs:** Any high-|z| output contains `NaN`, `Infinity`, or claims product likelihood is the production computation.

### Pitfall 4: Calibration result accidentally changes the classification task

**What goes wrong:** “Sharpened/softened” comparison changes ordering or crosses the 0.5 class boundary, so accuracy and calibration are no longer controlled separately.  
**Why it happens:** An arbitrary probability transform can reorder scores or move samples across the threshold.  
**How to avoid:** Transform frozen logits monotonically with positive scale factors, assert ordering equality and `p >= 0.5` label equality before asset publication, and show calibration as bin-level observed versus mean predicted probability. A calibration curve bins probability and can omit empty bins. [CITED: https://scikit-learn.org/stable/modules/generated/sklearn.calibration.calibration_curve.html]  
**Warning signs:** Per-row class predictions differ across the three calibration modes or an empty bin is displayed as measured data.

### Pitfall 5: Test leakage at the Phase 29/30 boundary

**What goes wrong:** The logistic lesson exposes held-out test labels/metrics or chooses parameters/threshold based on test data.  
**Why it happens:** The existing numerical-methods artifact includes final-test material for an earlier optimization lesson. [VERIFIED: `tests/numerical-methods-batch-4.test.ts:473-505`]  
**How to avoid:** Generate a new Phase 29 prediction handoff that makes train/validation rows visible to this course, retains test records only as sealed contract data if needed, and asserts learner-facing teaching assets contain no test labels, metrics, bin outcomes, or selection feedback.  
**Warning signs:** `testBce`, test confusion matrix, ROC/AUC, test bin, or test accuracy appears in Phase 29 learner content.

### Pitfall 6: Mismatch between media metadata and runtime registry

**What goes wrong:** A published video/poster/transcript is replaced but typed runtime values still point to an old hash or marker list.  
**Why it happens:** Media has several representations.  
**How to avoid:** Follow the existing registry-vs-metadata test and renderer `check` command pattern. [VERIFIED: `tests/optimizer-course-media.test.mjs:74-139`, `scripts/manim/render_optimizer_comparison.py:133-190`]  
**Warning signs:** Only file-existence tests pass, or a marker timestamp is outside `ffprobe` duration.

### Pitfall 7: Formula escape drift

**What goes wrong:** `\nabla`, `\frac`, `\hat`, and markdown code delimiters become mangled in JavaScript strings.  
**Why it happens:** Normal template literals process backslashes before KaTeX sees them.  
**How to avoid:** Use `String.raw` for formula-bearing localized strings and test the rendered HTML for raw delimiters and KaTeX errors. The renderer accepts `\[...\]`, `$$...$$`, `\(...\)`, and inline dollar delimiters before sanitization. [VERIFIED: `src/utils/markdownMath.ts:94-151`]  
**Warning signs:** visible `$$`, `\(`, raw `\mathbf`, `katex-error`, or malformed strings such as `haty`.

## Code Examples

### Stable one-row loss and vectorized gradient contract

The current source defines the stable loss and the gradient accumulation as follows:

<!-- DATA_Za4qLm8N_START -->
> `stableSigmoid(value: number)`, `softplus(value: number)`, `stableBinaryCrossEntropy(logit: number, target: BanknoteTarget)`, and `lossAndGrad(features, targets, parameters, l2)`; `stableBinaryCrossEntropy` returns `softplus(logit) - target * logit`, while gradients accumulate `row[featureIndex] * residual` and `residual`, then average by row count. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:245-332`]
<!-- DATA_Za4qLm8N_END -->

```ts
// Keep this pure and testable; Vue scenes consume its returned snapshot.
export function oneRowLogisticTerms(
  features: readonly number[],
  target: 0 | 1,
  weights: readonly number[],
  intercept: number,
) {
  const logit = features.reduce((sum, value, index) => sum + value * weights[index]!, intercept)
  const probability = stableSigmoid(logit)
  const residual = probability - target
  return {
    logit,
    probability,
    bce: stableBinaryCrossEntropy(logit, target),
    weightGradient: features.map((value) => residual * value),
    interceptGradient: residual,
  }
}
```

### Validated chapter asset loader

```ts
// Mirror the linear-regression loader: expected scene identity, finite tree,
// Pages-safe fetch path, and abort support all stay out of the Vue scene.
export async function loadLogisticInteraction(
  sceneId: LogisticObservationSceneId,
  signal?: AbortSignal,
) {
  const response = await fetch(withPublicBase(`/logistic-regression/phase-29/interactions/${sceneId}.json`), {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new Error(`interaction asset request failed: ${response.status}`)
  return parseLogisticInteractionAsset(await response.json(), sceneId)
}
```

The route-level loader pattern is established by the existing scene loader, which calls `fetch(withPublicBase(...))`, rejects non-OK responses, and checks the contract/scene ID/finite tree before rendering. [VERIFIED: `src/simulations/linearRegressionInteraction.ts:17-105`]

### Controlled calibration transform

```ts
// Positive temperature preserves logit ordering and the p=0.5 boundary.
export function temperatureProbability(logit: number, temperature: number): number {
  if (!Number.isFinite(logit) || !Number.isFinite(temperature) || temperature <= 0) {
    throw new RangeError('logit must be finite and temperature must be positive')
  }
  return stableSigmoid(logit / temperature)
}
```

Use only fixed, validated temperature values in the published calibration asset and assert both sorted-logit ordering and default-threshold label equality against the original values before publishing. This transform/validation choice is delegated discretion, not yet an existing runtime API. [ASSUMED]

## State of the Art

| Old approach | Current approach | When changed | Impact |
|---|---|---|---|
| One shared synthetic cockpit with threshold metrics | Chapter-local guided scenes backed by one real-data package | Phase 29 decision | Aligns content with the beginner flow and keeps classification decision analysis in Phase 30. [VERIFIED: `29-CONTEXT.md:53-90`] |
| Direct probability-domain BCE in beginner examples | Logit-domain BCE via softplus | Current stable engine | Keeps extreme logits finite and matches the standard combined-logit loss rationale. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:245-257`; CITED: https://docs.pytorch.org/docs/2.9/generated/torch.nn.BCEWithLogitsLoss.html] |
| Inline `<video>` blocks in old logistic paged lesson | Shared chaptered player with metadata/transcripts/markers/fallback | Existing shared-media migration | Makes the logistic rebuild inherit reduced-motion and failure behavior rather than implement it again. [VERIFIED: `src/components/LogisticRegressionPagedLesson.vue:273-300`, `src/components/ChapteredMediaPlayer.vue:71-115`] |

**Deprecated/outdated:** The old logistic paged lesson’s direct video markup and shared cockpit are not appropriate as the primary Phase 29 experience; preserve the component/identity only where compatibility requires it, but migrate the course mount to dedicated labs and `ChapteredMediaPlayer`. [VERIFIED: `src/components/LogisticRegressionPagedLesson.vue:273-324`, `29-CONTEXT.md:53-75`]

## Assumptions Log

| # | Claim | Section | Risk if Wrong |
|---|---|---|---|
| A1 | `src/modules/logistic-regression/` and `public/logistic-regression/phase-29/` are the best new local paths. | Recommended Project Structure | Low: planner may choose equivalent phase-local paths, but must preserve public-path/manifest contracts. |
| A2 | A positive logit-temperature transform will be the selected sharpen/soften implementation. | Code Examples | Medium: it must be verified against frozen validation outputs and label/order assertions before becoming a content fact. |
| A3 | Phase 29 will add a dedicated asset builder rather than extend the older Batch 4 generator. | Architecture | Medium: the planner needs select after inspecting source ownership and avoiding mutation of prior published contracts. |
| A4 | No runtime service/OS state exists outside repository config. | Runtime State Inventory | Low: static Pages architecture and repository audit indicate none, but deployment settings outside GitHub are not inspectable here. |

## Open Questions

1. **Which scratch optimization path should establish the parity model?**
   - What we know: the existing engine supports fixed and Armijo procedures with L2 and validation stopping; the existing Batch 4 sklearn baseline uses `lbfgs`, `fit_intercept: true`, `tol: 1e-12`, and `max_iter: 5000`. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:172-220`, `tests/numerical-methods-batch-4.test.ts:486-500`]
   - What's unclear: exact unregularized solver/iteration/tolerance settings that achieve a readable, genuinely aligned scratch endpoint under the Phase 29 objective.
   - Recommendation: choose by executed convergence data, persist both objectives/configs in the manifest, and set tolerances only after the generated comparison is reproducible.

2. **Should the existing Batch 4 Notebook be extended or should a Phase 29 Notebook be new?**
   - What we know: Batch 4 includes a final-test report that Phase 29 must not surface. [VERIFIED: `tests/numerical-methods-batch-4.test.ts:473-505`]
   - What's unclear: whether a narrowly scoped extension can provably avoid carrying old test-output references into learner-facing assets.
   - Recommendation: create a Phase 29-specific executed notebook/output package, while importing/reusing only pure data/engine helpers; this minimizes accidental boundary leakage. [ASSUMED]

3. **What finite-difference step sweep best teaches accuracy without cancellation?**
   - What we know: current tests validate `h = 1e-6` with maximum analytic-vs-centered error `<= 2e-9` for one fixed parameter vector. [VERIFIED: `tests/numerical-methods-batch-4.test.ts:650-682`]
   - What's unclear: learner-facing sequence of step sizes that demonstrates both truncation and rounding effects using the Phase 29 selected parameters.
   - Recommendation: generate several steps from the same published analytic gradient, reject non-finite values, and choose a small readable subset only after execution.

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|---|---|---|---|---|
| Node.js / npm | Vue build, Node test runner | ✓ | Node `v24.16.0`; npm `11.13.0` | — |
| Python | executed Notebook/assets | ✓ | Python `3.12.13` | — |
| Existing numerical requirements | NumPy/sklearn parity assets | ✓ in project contract | `scikit-learn==1.9.0`, NumPy `2.4.6`, pandas `3.0.3` | use audited pinned environment, not an online install. [VERIFIED: `public/notebooks/numerical-methods/requirements.txt:1-8`] |
| Manim Community | source-media generation | ✓ | `v0.20.1` | poster/transcript fallback preserves learning if a render cannot be regenerated locally. |
| ffprobe/ffmpeg | media validation | ✓ | `8.1.2` | none for release verification; CI installs ffmpeg. [VERIFIED: `.github/workflows/deploy-pages.yml:31-35`] |

**Missing dependencies with no fallback:** None identified.  
**Missing dependencies with fallback:** None identified.

## Validation Architecture

### Test Framework

| Property | Value |
|---|---|
| Framework | Node test runner through `node --test tests/*.test.*`. [VERIFIED: `package.json:6-17`] |
| Config file | none; project scripts define the invocation. [VERIFIED: `package.json:6-17`] |
| Quick run command | `npm test -- tests/logistic-regression-*.test.*` [ASSUMED: command selection; Node test glob behavior must be confirmed during implementation.] |
| Full suite command | `npm test`; CI command is `npm run test:ci`. [VERIFIED: `package.json:6-17`] |

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|---|---|---|---|---|
| LOGR-01 | Six bilingual chapters maintain score → sigmoid → likelihood → BCE flow and render math/Markdown safely. | content/structure + renderer | `npm test -- tests/logistic-regression-content.test.mjs tests/logistic-regression-rendering.test.ts` | ❌ Wave 0 |
| LOGR-02 | Stable loss, row/batch gradients, central difference, and deterministic traces are finite and match published assets. | unit + asset parity | `npm test -- tests/logistic-regression-math.test.ts tests/logistic-regression-assets.test.ts` | ❌ Wave 0 |
| LOGR-03 | Aligned scratch/sklearn configurations, coefficients, probabilities, and L2 comparison match the executed manifest. | integration/asset parity | `npm test -- tests/logistic-regression-parity.test.ts` | ❌ Wave 0 |
| LOGR-04 | Calibration transforms preserve required order/default labels, bin data is valid, and XOR/circles are isolated from Banknote selection. | unit + structural | `npm test -- tests/logistic-regression-calibration.test.ts tests/logistic-regression-labs.test.mjs` | ❌ Wave 0 |
| Compatibility | Existing six IDs, base redirect, checkpoint/progress/catalog, lazy lab map, base paths, final-only resources, no Phase 30 metrics. | structural | `npm test -- tests/logistic-regression-cockpit.test.mjs` | ✅ must be rewritten/extended |
| Media | Four MP4/poster/transcript/markers/hashes and player failure/reduced-motion behavior are valid. | asset + component | `npm test -- tests/logistic-regression-media.test.mjs` plus renderer `--check` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** focused relevant Node tests plus the applicable asset/media check.
- **Per wave merge:** `npm run test:ci`.
- **Phase gate:** `npm run test:ci`, `npm run build`, `npm run build:pages`, `npm run security:audit`, asset drift/media checks, and specified browser checks before `$gsd-verify-work`.

### Wave 0 Gaps

- [ ] `tests/logistic-regression-math.test.ts` — stable scalar/vectorized math, finite difference, range/finite guards.
- [ ] `tests/logistic-regression-assets.test.ts` — manifest/hash/schema/notebook/figure/prediction-handoff contract and no test-data learner output.
- [ ] `tests/logistic-regression-parity.test.ts` — explicit sklearn alignment and tolerance checks.
- [ ] `tests/logistic-regression-calibration.test.ts` — transform invariants, bins, and synthetic diagnostic separation.
- [ ] `tests/logistic-regression-content.test.mjs` / rendering test — bilingual blocks, safe TeX/Markdown, no chapter citations/Ref ID/Evidence.
- [ ] `tests/logistic-regression-media.test.mjs` — typed media runtime mirror, ffprobe/hash/transcript/marker contract.
- [ ] Update `tests/logistic-regression-cockpit.test.mjs` — replace assertions tied to the retired primary cockpit while retaining route/ID/checkpoint/layout compatibility coverage. [VERIFIED: `tests/logistic-regression-cockpit.test.mjs:10-194`]

## Security Domain

### Applicable ASVS Categories

| ASVS Category | Applies | Standard Control |
|---|---|---|
| V2 Authentication | no | Static educational pages have no authenticated user surface in this phase. [VERIFIED: `.github/workflows/deploy-pages.yml:1-62`] |
| V3 Session Management | no | Progress remains client-side storage; no server session is added. [VERIFIED: `AGENTS.md:151-160`] |
| V4 Access Control | no | No protected backend/API/resource is added. [VERIFIED: `.github/workflows/deploy-pages.yml:1-62`] |
| V5 Input Validation | yes | Clamp or reject non-finite/out-of-range lab input; validate fetched JSON scene ID, contract version, asset hash and all numeric leaves. [VERIFIED: `AGENTS.md:99-103`, `src/simulations/linearRegressionInteraction.ts:17-105`] |
| V6 Cryptography | limited | Use SHA-256 hashes as integrity/drift checks for static assets; do not treat them as authorization or invent cryptography. [VERIFIED: `scripts/manim/render_optimizer_comparison.py:34-43`, `80-94`] |

### Known Threat Patterns for this Stack

| Pattern | STRIDE | Standard Mitigation |
|---|---|---|
| Markdown/TeX XSS or URL injection | Tampering | `renderMarkdownWithMath` sanitizes allowed tags/attributes/schemes after formula handling; never use an uncontrolled raw-HTML rendering path. [VERIFIED: `src/utils/markdownMath.ts:13-151`] |
| NaN/Infinity or extreme values corrupt SVG/math reads | Tampering / DoS | Validate finite values in pure calculations and parsed assets; retain previous valid control state and show an explanatory status. [VERIFIED: `src/modules/math-lab/utils/banknoteLogistic.ts:263-291`, `AGENTS.md:99-103`] |
| Asset substitution/drift | Tampering | Hash manifest/registry/Notebook outputs and test content against hashes; validate HTTP response and expected scene ID. [VERIFIED: `tests/optimizer-course-media.test.mjs:74-99`, `src/simulations/linearRegressionInteraction.ts:77-105`] |
| Test-set information disclosure | Information disclosure | Separate sealed test records from learner-facing Phase 29 assets and assert absence of test labels/metrics/selection outputs. [VERIFIED: `29-CONTEXT.md:83-90`] |
| Stale async fetch mutates a new chapter scene | Tampering / reliability | Abort the prior request on scene change and ignore aborted result. [VERIFIED: `src/components/LinearRegressionObservationLab.vue:53-69`] |

## Sources

### Primary (HIGH confidence)

- `src/modules/math-lab/utils/banknoteDataset.ts` — fixed schema, IDs, split validation, and train-only `ddof: 0` preprocessing. [VERIFIED]
- `src/modules/math-lab/utils/banknoteLogistic.ts` — stable sigmoid/BCE, gradients, finite guards, training contracts. [VERIFIED]
- `src/components/LinearRegressionObservationLab.vue` and `src/simulations/linearRegressionInteraction.ts` — lazy scene and validated asset-loader pattern. [VERIFIED]
- `src/components/ChapteredMediaPlayer.vue`, `tests/optimizer-course-media.test.mjs`, and `scripts/manim/render_optimizer_comparison.py` — media player and package integrity pattern. [VERIFIED]
- `.planning/phases/29-logistic-regression-rebuild/29-CONTEXT.md` — locked scope and compatibility decisions. [VERIFIED]

### Secondary (MEDIUM confidence)

- [scikit-learn linear models](https://scikit-learn.org/stable/modules/linear_model.html) — logistic objective, penalties, solver support, and intercept behavior. [CITED]
- [scikit-learn probability calibration](https://scikit-learn.org/stable/modules/calibration.html) and [calibration_curve API](https://scikit-learn.org/stable/modules/generated/sklearn.calibration.calibration_curve.html) — reliability diagrams, bin semantics, and Brier caveat. [CITED]
- [PyTorch BCEWithLogitsLoss](https://docs.pytorch.org/docs/2.9/generated/torch.nn.BCEWithLogitsLoss.html) — combined-logit numerical-stability rationale. [CITED]
- [Manim configuration](https://docs.manim.community/en/stable/guides/configuration.html) — explicit resolution/fps/output configuration. [CITED]
- [UCI Banknote Authentication](https://archive.ics.uci.edu/dataset/267/banknote%2Bauthentication) — four features, 1,372 rows, no missing values, class target, and CC BY 4.0. [CITED]

### Tertiary (LOW confidence)

- Recommended new phase-local file names and the exact temperature-transform choice are intentionally marked `[ASSUMED]` until the asset generator validates them.

## Metadata

**Confidence breakdown:**

- Standard stack: HIGH — all runtime/build choices are existing, inspected project dependencies or source contracts.
- Architecture: HIGH — comparable Phase 27A/28B loaders, course shells, media contracts, and tests were inspected.
- Pitfalls: MEDIUM — numeric and scope pitfalls are source-backed; library semantics are cited from official docs but must be validated against the fixed Phase 29 generated data.

**Research date:** 2026-08-19  
**Valid until:** 2026-09-18 for project architecture; revalidate external library documentation before changing pinned versions.
