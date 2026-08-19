# Roadmap: ML Atlas Curriculum V3 Content Delivery

## Milestones

- ✅ **v1.0 Curriculum Foundation** — 31 recorded phase entries; canonical Phase 25 archive includes 13/13 plans (shipped 2026-07-26 with accepted gaps). See [archived roadmap](milestones/v1.0-ROADMAP.md).
- 🚧 **v1.1 Classical Supervised Learning** — Phases 26–31, including the 28A Gradient Descent and 28B Optimizer Principles rebuilds.

## Phases

<details>
<summary>✅ v1.0 Curriculum Foundation — SHIPPED 2026-07-26</summary>

- Historical roadmap records Phases 1–24A in project state and implementation summaries.
- Phase 25 is preserved under `milestones/v1.0-phases/` with 13 plans, 13 summaries, and complete verification artifacts.
- The override closeout and accepted technical debt are documented in `MILESTONES.md`, `milestones/v1.0-REQUIREMENTS.md`, and `milestones/v1.0-MILESTONE-AUDIT.md`.

</details>

### 🚧 v1.1 Classical Supervised Learning

**Milestone goal:** Build one coherent, reproducible teaching corridor from loss values through fitted regression baselines to explainable classification decisions.

## Phase 26: Loss Functions Rebuild

**Goal:** Rebuild `loss-functions` so learners can move from fixed prediction errors to numerically verified MSE, MAE, stable BCE, gradients, and training-objective intuition.

**Depends on:** v1.0 Curriculum Foundation

**Requirements:** LOSS-01, LOSS-02, LOSS-03

**Success Criteria:**

1. Fixed bilingual examples produce matching per-example and aggregate MSE, MAE, and stable BCE values across lesson text, NumPy code, locked outputs, and the primary lab.
2. Learners can explain how an outlier changes MSE versus MAE and how a confident wrong probability changes BCE and its gradient.
3. Vectorized implementations remain finite for extreme logits and pass deterministic finite-difference gradient checks.
4. The rebuilt lesson preserves its route and checkpoint while passing focused content, calculation, and GitHub Pages asset tests.

**Plans:** 7/7 plans complete

- [x] 26-01-PLAN.md
- [x] 26-02-PLAN.md
- [x] 26-03-PLAN.md
- [x] 26-04-PLAN.md
- [x] 26-05-PLAN.md
- [x] 26-06-PLAN.md
- [x] 26-07-PLAN.md

- **Wave 1:** `26-01` real-data authorization/source contract; `26-02` pure TypeScript loss, gradient, and finite-difference authority.
- **Wave 2** *(blocked on Wave 1 completion)*: `26-03` shared bilingual Notebook, isolated environment, and indivisible candidate-pipeline contract.
- **Wave 3** *(blocked on Wave 2 completion)*: `26-04` full LaDe/SECOM transformations and four independently executed Notebook candidates in ignored staging.
- **Wave 4** *(blocked on Wave 3 completion)*: `26-05` one complete public-asset transaction, offline reruns, parity, hashes, and rollback proof.
- **Wave 5** *(blocked on Wave 4 completion)*: `26-06` seven-chapter bilingual typed content, output registry, and compatibility contracts.
- **Wave 6** *(blocked on Wave 5 completion)*: `26-07` lab/page integration and full release/browser verification.

**Cross-cutting constraints:**

- Page formulas, TypeScript calculations, NumPy code, locked outputs, Notebooks, and labs share one audited numerical contract.
- Runtime course assets remain local and base-safe; both datasets, four Notebooks, summaries, plots, and manifests publish only as one complete atomic package.
- The existing module/route, six chapter IDs, checkpoints, Progress V1/V2 identities, sanitized rendering, bilingual parity, mobile layout, and reduced-motion fallbacks remain compatible.

## Phase 27: Linear Regression Rebuild

**Goal:** Rebuild `linear-regression` around one reproducible regression case that connects matrix prediction, MSE gradients, three fitting methods, coefficient meaning, and held-out residual diagnosis.

**Depends on:** Phase 26

**Requirements:** LINR-01, LINR-02, LINR-03, LINR-04

**Success Criteria:**

1. One notation contract links `ŷ = Xw + b`, residuals, MSE, gradients, coefficients, and code variable names in both languages.
2. A clean-kernel Notebook reproduces the locked NumPy batch-gradient fit and compares it with the normal equation and scikit-learn on the same fixed split.
3. Coefficients, predictions, and metrics agree within documented tolerances, with algorithm and regularization differences stated explicitly.
4. Held-out residual and coefficient-stability views expose nonlinearity, heteroscedasticity, or collinearity as model limitations rather than optimization failures.
5. The existing route, checkpoint, interactive lab, downloadable assets, tests, and both production builds remain valid.

## Phase 27A: Linear Regression Teaching Experience Redesign

**Internal phase number:** 27.1

**Goal:** Turn the completed Bike Sharing linear-regression implementation into a single-column, data-driven teaching course whose code, plots, runtime outputs, compact observation labs, and final references form one readable eight-chapter flow.

**Depends on:** Phase 27

**Requirements:** LINR-05, LINR-06, LINR-07, LINR-08

**Success Criteria:**

1. All eight existing deep links render a single-column teaching flow; the chapter lab follows the explanation and never competes with it horizontally.
2. A deterministic 60/20/20 chronological split drives train-only exploration, validation-based feature selection, and exactly one final test evaluation.
3. Executed bilingual Notebooks and local Matplotlib figures connect Bike data exploration, feature stages, fitting behavior, residual diagnosis, coefficient interpretation, and regularization to page-visible code and results.
4. Every chapter uses typed bilingual lesson blocks, copyable code, accessible figure fallbacks, and at most three observation controls without adding an exercise bank.
5. Existing routes, checkpoints, progress stores, downloads, base-safe paths, tests, and production builds remain compatible; public references appear only at the end of the final chapter.

**Plans:** 1/1 plan complete

- [x] 27.1-01-PLAN.md

## Phase 28: Tabular Regression Project

**Goal:** Rebuild the existing housing-price project into the `project-tabular-regression` capability loop with a frozen local dataset, leakage-safe pipeline, honest baseline, controlled improvement, and reviewable limitations.

**Depends on:** Phase 27A and the existing data-pipeline lessons

**Requirements:** TPRJ-01, TPRJ-02, TPRJ-03, TPRJ-04, TPRJ-05

**Success Criteria:**

1. A local dataset package records provenance, license/source notes, checksum, schema, target meaning, and deterministic train/validation/test membership without runtime network access.
2. The executed Notebook fits preprocessing only on training data and reproduces one locked linear baseline from a clean kernel.
3. One predeclared change is compared against the baseline without silently changing the split, metric, preprocessing boundary, or multiple variables.
4. The project reports metrics, residual plots, named failure examples, formula-to-code connections, and limitations using page-visible reference results.
5. The existing `housing-price-project` identity remains reachable while dataset, Notebook, outputs, and relevant figures are downloadable through base-safe local paths.

**Plans:** 2/2 plans complete

- [x] 28-01-PLAN.md — Frozen dataset, executed Notebooks, figures, interaction payloads, and numerical verification
- [x] 28-02-PLAN.md — Six-chapter paged teaching flow, real-result interactions, routing, and release validation

## Phase 28A: Gradient Descent Beginner Teaching Rebuild

**Goal:** Rebuild `gradient-descent` into six focused beginner pages that connect one transparent dataset to MSE, the parameter landscape, exact gradients, learning-rate behavior, advanced terrain, and true sample-based batching.

**Depends on:** Phase 26 loss functions, Phase 27 linear regression, and the existing AI Overview regression dataset

**Requirements:** GRAD-01, GRAD-02, GRAD-03, GRAD-04, GRAD-05, GRAD-06

**Success Criteria:**

1. The five-row study-hours dataset, formulas, TypeScript engine, executed NumPy Notebooks, and visible chapter outputs reproduce the same locked numerical anchors.
2. Six existing chapter IDs become independent bilingual pages with one chapter-specific lazy lab, at most three control groups, mobile-safe layouts, and keyboard/reduced-motion fallbacks.
3. Full, mini-batch, and SGD paths use actual deterministic sample subsets; unstable learning rates stop at the last finite state and are labeled without path clamping.
4. A language-neutral 75–90 second 1080p30 Manim animation explains one exact update and is published with poster, transcripts, markers, source records, and hashes.
5. Existing route identity, deep links, Progress stores, checkpoint behavior, Bike trace, downloads, tests, and Pages builds remain compatible.

**Plans:** 2/2 plans complete

- [x] 28.1-01-PLAN.md — Shared numerical engine, executed assets, and gradient-rule Manim package
- [x] 28.1-02-PLAN.md — Six paged lessons, dedicated labs, routing, accessibility, and release validation

## Phase 28B: Optimizer Principles, State, and MLP Transfer

**Internal phase number:** 28.2

**Goal:** Rebuild `optimizer-comparison` from deterministic optimizer state machines through a controlled `2→4→1 tanh` MLP comparison and a leakage-safe Banknote transfer, while preserving existing course identity and Math Lab entry points.

**Depends on:** Phase 28A, the existing MLP Playground, and the existing local Banknote fixed split

**Requirements:** OPT-01, OPT-02, OPT-03, OPT-04, OPT-05, OPT-06

**Success Criteria:**

1. One pure TypeScript engine reproduces documented PyTorch-compatible SGD, Momentum, RMSProp, Adam, L2, AdamW, and scheduler state transitions with finite guards.
2. Existing Math Lab Optimizer Race imports and default MLP Playground SGD snapshots remain numerically compatible.
3. The controlled circle `2→4→1 tanh` benchmark and Banknote transfer publish deterministic, hash-bound local outputs; fitting and selection use training/validation only and the fixed test partition is evaluated once after freeze.
4. The existing six optimizer lesson IDs, routes, checkpoints, Progress stores, and Math Lab entry points remain available throughout the staged rebuild.

**Plans:** 3/3 plans complete

- [x] 28.2-01-PLAN.md — Planning reconciliation, shared numerical engine, MLP strategy seam, and executed benchmark authority
- [x] 28.2-02-PLAN.md — Optimizer media packages and shared chaptered media player
- [x] 28.2-03-PLAN.md — Six paged lessons, lazy labs, route bridges, and release validation

## Phase 29: Logistic Regression Rebuild

**Goal:** Rebuild `logistic-regression` so learners can trace linear scores through sigmoid probabilities, likelihood, stable BCE, scratch gradients, library parity, calibration, and linear-boundary failure.

**Depends on:** Phase 27 and the existing probability/optimization foundations

**Requirements:** LOGR-01, LOGR-02, LOGR-03, LOGR-04

**Success Criteria:**

1. Bilingual teaching and one fixed case consistently connect scores, sigmoid probabilities, log-odds, maximum likelihood, BCE, and gradient notation.
2. A NumPy implementation remains stable at extreme logits, passes finite-difference checks, and reproduces a locked deterministic training trace.
3. Scratch and scikit-learn coefficients and probabilities are compared under documented preprocessing, intercept, regularization, and stopping settings.
4. Calibration bins distinguish probability quality from class accuracy, while a nonlinear example shows the limit of one linear decision boundary.
5. The existing route, checkpoint, lab behavior, downloadable Notebook/output package, focused tests, and both builds remain valid.

**Plans:** 5/8 plans executed
**Wave 1**

- [x] 29-00-PLAN.md — Wave 0 fail-first contracts for every numerical, asset, content, lab, media, compatibility, and release surface
- [x] 29-01-PLAN.md — One-row tracer, phase-local contracts, and pure stable logistic engine

**Wave 2** *(blocked on Wave 1 completion)*

- [x] 29-02-PLAN.md — Executed Banknote analysis, atomic asset package, strict loader, and Phase 30 handoff

**Wave 3** *(blocked on Wave 2 completion)*

- [x] 29-03-PLAN.md — Shared Manim source contract plus score/sigmoid and likelihood/BCE/gradient teaching packages
- [x] 29-05-PLAN.md — Six route-lazy guided SVG labs with pure scene models and accessible fallbacks

**Wave 4** *(blocked on Wave 3 completion)*

- [ ] 29-04-PLAN.md — Two diagnostic teaching packages plus production rendering, publication, hashes, and shared-player fallbacks

**Wave 5** *(blocked on Wave 4 completion)*

- [ ] 29-06-PLAN.md — Complete bilingual six-chapter course, final resources, checkpoint, and responsive integration

**Wave 6** *(blocked on Wave 5 completion)*

- [ ] 29-07-PLAN.md — Real-browser matrix, full release gate, source audit, and Nyquist validation closure

## Phase 30: Classification Decisions Rebuild

**Goal:** Rebuild `classification` around held-out probability scores so learners can calculate metrics, interpret ranking, select a cost-aware threshold, and inspect subgroup and example-level errors.

**Depends on:** Phase 29

**Requirements:** CLAS-01, CLAS-02, CLAS-03, CLAS-04, CLAS-05, CLAS-06

**Success Criteria:**

1. The lesson and primary lab keep model score, probability, threshold, predicted class, and actual label visually and numerically distinct.
2. Fixed held-out predictions reproduce confusion counts, precision, recall, F1, and the corresponding threshold sweep in TypeScript and the executed Notebook.
3. ROC/AUC is explained as ranking across thresholds and is not presented as an automatic operating-threshold selector.
4. A validation threshold is justified from false-positive/false-negative costs with interval or fold variation, then applied once to the locked test set.
5. Subgroup and named misclassification analysis remains visible, while existing multiclass/softmax content stays available as a supporting chapter.

## Phase 31: Corridor Integration and Release

**Goal:** Verify that all five rebuilt modules form one bilingual, content-first, reproducible learning corridor without route, Progress, asset, rendering, or release regressions.

**Depends on:** Phases 26–30

**Requirements:** QLTY-01, QLTY-02, QLTY-03, QLTY-04, QLTY-05

**Success Criteria:**

1. The canonical sequence is `loss-functions → linear-regression → project-tabular-regression/housing-price-project → logistic-regression → classification`, with explicit prerequisite and next-step handoffs.
2. Chinese and English pages contain matching core questions, explanations, examples, formulas, code, run outputs, misconception feedback, and selective non-blocking exercises.
3. Formula symbols, code names, locked outputs, labs, Notebooks, downloadable datasets, and local media agree under automated parity and asset-integrity checks.
4. Existing module IDs, legacy/canonical routes, checkpoints, Progress V1/V2 storage, safe Markdown rendering, and GitHub Pages base paths remain compatible.
5. Full tests, standard build, Pages build, security audit, and bilingual desktop plus 390px browser checks pass with accessible static/reduced-motion fallbacks.

## Progress

| Phase | Milestone | Requirements | Status |
| --- | --- | --- | --- |
| 26. Loss Functions Rebuild | v1.1 | 3 | Complete — 2026-07-28 |
| 27. Linear Regression Rebuild | v1.1 | 4 | Complete — 2026-07-30 |
| 27A. Linear Regression Teaching Experience Redesign | v1.1 | 4 | Complete — 2026-08-01 |
| 28. Tabular Regression Project | v1.1 | 5 | Complete — 2026-08-04 |
| 28A. Gradient Descent Beginner Teaching Rebuild | v1.1 | 6 | Complete — 2026-08-11 |
| 28B. Optimizer Principles, State, and MLP Transfer | v1.1 | 6 | Complete — 2026-08-13 |
| 29. Logistic Regression Rebuild | v1.1 | 4 | In Progress|
| 30. Classification Decisions Rebuild | v1.1 | 6 | Not started |
| 31. Corridor Integration and Release | v1.1 | 5 | Not started |

---
*Roadmap approved: 2026-07-27*
