# Roadmap: ML Atlas Curriculum V3 Content Delivery

## Milestones

- ✅ **v1.0 Curriculum Foundation** — 31 recorded phase entries; canonical Phase 25 archive includes 13/13 plans (shipped 2026-07-26 with accepted gaps). See [archived roadmap](milestones/v1.0-ROADMAP.md).
- 🚧 **v1.1 Classical Supervised Learning** — Phases 26–31 (Phase 26 planned; ready to execute).

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

**Plans:** 1/2 plans complete

- [x] 28-01-PLAN.md — Frozen dataset, executed Notebooks, figures, interaction payloads, and numerical verification
- [ ] 28-02-PLAN.md — Six-chapter paged teaching flow, real-result interactions, routing, and release validation

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
| 26. Loss Functions Rebuild | 7/7 | Complete    | 2026-07-28 |
| 27. Linear Regression Rebuild | 12/12 | Complete    | 2026-07-30 |
| 27A. Linear Regression Teaching Experience Redesign | v1.1 | 4 | Complete — 2026-08-01 |
| 28. Tabular Regression Project | v1.1 | 5 | In progress |
| 29. Logistic Regression Rebuild | v1.1 | 4 | Not started |
| 30. Classification Decisions Rebuild | v1.1 | 6 | Not started |
| 31. Corridor Integration and Release | v1.1 | 5 | Not started |

---
*Roadmap approved: 2026-07-27*
