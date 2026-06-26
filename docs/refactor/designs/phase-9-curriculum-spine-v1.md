# Phase 9: Curriculum Spine V1 - Design Draft

**Created:** 2026-06-26  
**Status:** Phase 9A data contract implemented; Phase 9B navigation realignment pending.  
**Scope:** Teaching-route design, coverage audit, and reordering blueprint only.

## User Decisions Locked

- The default route should be a **mixed spiral route**, not separate Math Lab, Data Lab, and Algorithm tracks.
- The first complete endpoint should be **deep-learning introduction ability**, not only traditional tabular ML and not modern LLM application/productization.
- Progress tracking, task evidence, backend accounts, and database-backed learning records are **not the next priority**. They should wait until the curriculum route is coherent and backend work begins.
- The spine should be **data first**: introduce raw tables and feature columns before requiring linear algebra as formal math.
- `optimizer-comparison` should be **required** in Spine V1, not support-only.
- `attention-transformer` should be the formal Spine V1 endpoint.
- Project capstones should be **recommended validation**, not hard blockers.

## Problem

The current project has strong material, but the learner experience is still confusing in three ways:

1. **Starting point is unclear.** A beginner can see many modules but not a single obvious first path.
2. **Math Lab, Data Lab, and Algorithm content are split into separate islands.** They feel like three products instead of three lenses on one learning journey.
3. **Module depth is uneven.** Some modules are rich experiments with thin route context; others have substantial content but weak placement; several important transitions are implicit.

The result is not a lack of effort or content. The issue is that the course lacks a visible spine that tells a learner:

- why this module exists,
- what it prepares them to understand,
- which math/data/model idea is the main point,
- and where to go next.

## Design Goal

Define a reviewable curriculum spine from zero foundation to deep-learning introduction ability, using existing modules first, and identifying the minimum set of route, content, and coverage changes needed before implementation.

Success means a reviewer can answer:

- What is the default learning path?
- How do Math Lab and Data Lab support each stage?
- Which existing modules stay, move, merge, or become optional?
- What content gaps must be filled before the route feels complete?
- What implementation phases should follow if the design is approved?

## Target Learner

The primary learner is a beginner or weak-foundation learner who wants to understand ML and deep learning through visual, bilingual, reproducible lessons.

They should finish Spine V1 able to:

- explain data, features, labels, model, loss, parameter, training, validation, and prediction;
- run and interpret a tabular ML workflow;
- understand linear regression, logistic regression, classification metrics, tree models, and model selection;
- read training curves and diagnose overfitting or instability;
- understand MLP, CNN, sequence, attention, and Transformer fundamentals at an introductory level;
- connect each model behavior back to a small amount of math and data structure.

## Core Design Principles

1. **One default route, multiple support lenses.**  
   The student follows one main spine. Math Lab, Data Lab, projects, and experiments appear as support lenses at the right moment.

2. **Spiral instead of silo.**  
   Each stage combines a practical question, math intuition, data shape, model behavior, and a small experiment. The learner revisits ideas at greater depth later.

3. **Projects come after prerequisites.**  
   Housing and classification projects should summarize prior stages, not appear before the learner understands the workflow pieces.

4. **Math is just-in-time.**  
   The route should not require all 31 Math Lab modules up front. It should surface vectors before feature space, gradients before optimization, probability before classification, and shapes before CNN/Attention.

5. **Data is part of model behavior.**  
   Data cleaning, feature encoding, splitting, leakage, and regularization must be integrated into model stages, not treated as a separate side curriculum.

6. **Coverage comes before progress.**  
   Until the spine is coherent, progress UI and persistence should stay secondary.

## Proposed Spine

### Stage 0 - Orientation: What Is Learning?

**Learner question:** What does it mean for a model to learn from data?

**Main modules:**
- `ai-overview`
- `python-notebook`

**Support lenses:**
- Math: none required beyond informal notation.
- Data: sample, feature, label, table, train/test idea.
- Experiment: tiny input -> prediction -> error -> adjustment loop.

**Current status:** Partially covered. `ai-overview` exists; `python-notebook` exists but is not in the current core track.

**Design action:** Move `python-notebook` into the default spine immediately after `ai-overview`.

### Stage 1 - Data Becomes Features

**Learner question:** How does raw data become something a model can consume?

**Main modules:**
- `numerical-data`
- `categorical-data`
- `dataset-quality`

**Support lenses:**
- Math: `beginner-linear-algebra`, `linear-algebra-feature-space`
- Data: numeric columns, category vocabulary, missingness, label quality, audit mindset.
- Experiment: convert rows into feature vectors and inspect how choices change model input.

**Current status:** Covered in Data Lab but not placed early enough as the main route foundation.

**Design action:** Promote selected Data Lab modules into the spine before loss/linear models.

### Stage 2 - First Baseline and Loss

**Learner question:** How do we know whether a model is wrong?

**Main modules:**
- `loss-functions`
- first lightweight baseline lesson, either within `loss-functions` or a new bridge lesson.

**Support lenses:**
- Math: `linear-algebra-distance-similarity`
- Data: feature vector vs target, numeric prediction error.
- Experiment: compare absolute error, squared error, and likelihood-style loss.

**Current status:** `loss-functions` exists. The route needs a more explicit bridge from data table to loss reading.

**Design action:** Keep `loss-functions` in the spine, but add a route bridge that frames loss as the first feedback signal.

### Stage 3 - Linear Regression as the First Real Model

**Learner question:** How can a model adjust weights to fit numeric data?

**Main modules:**
- `linear-regression`
- `housing-price-project` as the stage capstone after linear regression.

**Support lenses:**
- Math: `linear-algebra-matrix-transformations`, `least-squares-fitting`
- Data: numeric features, scaling, residual analysis.
- Experiment: residuals, slope/intercept movement, multivariate surface.

**Current status:** Strong content exists, but the project should come after the model concepts.

**Design action:** Move `housing-price-project` after `linear-regression`, not near the beginning of the route.

### Stage 4 - Training Motion and Gradients

**Learner question:** Why does training move in one direction and sometimes fail?

**Main modules:**
- `gradient-descent`
- selected optimization Math Lab modules as just-in-time support:
  - `calculus-derivatives-local-change`
  - `calculus-partial-derivatives-gradients`
  - `calculus-gradient-descent`
  - `calculus-sgd-batch-noise`

**Support lenses:**
- Math: derivative, partial derivative, gradient, learning rate.
- Data: batch vs full dataset, noise from sampling.
- Experiment: learning-rate safety, batch noise, convergence/oscillation.

**Current status:** Strong content exists in both Algorithm and Math Lab, but it is duplicated and split.

**Design action:** Keep Algorithm as the main lesson path; link Math Lab as "math lens" at the exact concepts where needed.

### Stage 5 - Classification and Probabilities

**Learner question:** How does a model make class decisions from scores or probabilities?

**Main modules:**
- `logistic-regression`
- `classification`
- `classification-project` as stage capstone.

**Support lenses:**
- Math: `beginner-probability-distributions`, `probability-likelihood-entropy`
- Data: categorical labels, imbalance, text-to-features for project context.
- Experiment: threshold movement, confusion matrix, precision/recall, ROC, calibration.

**Current status:** Covered. The route should make probability and threshold concepts more explicit before project work.

**Design action:** Place probability support before or alongside classification, and move `classification-project` after `classification`.

### Stage 6 - Generalization and Model Choice

**Learner question:** Why does a model that works on training data fail later?

**Main modules:**
- `splits-generalization`
- `model-selection`
- `complexity-regularization`

**Support lenses:**
- Math: `training-diagnostics`, optional `condition-numbers` for advanced notes.
- Data: leakage, validation protocol, cross-validation, regularization.
- Experiment: split protocol, train/validation curves, regularization strength.

**Current status:** Covered in two domains, but the order is fragmented.

**Design action:** Make this a dedicated stage before tree models and neural networks.

### Stage 7 - Nonlinear Models Without Deep Learning

**Learner question:** What changes when a model learns rules and interactions instead of a line?

**Main modules:**
- `tree-forest`

**Support lenses:**
- Math: not heavy; focus on split criteria and bias/variance.
- Data: feature interactions, categorical/numeric split behavior, importance caveats.
- Experiment: tree depth, overfitting, random forest stability.

**Current status:** Module exists but is not in the current core track.

**Design action:** Add `tree-forest` to the spine before MLP, so neural networks are not the first nonlinear model.

### Stage 8 - Neural Network Foundations

**Learner question:** How do layers, activations, and backpropagation create nonlinear representations?

**Main modules:**
- `mlp`
- `optimizer-comparison`

**Support lenses:**
- Math: `matrix-calculus-autodiff`, `deep-architecture-math`, selected `calculus-training-code-diagnostics`
- Data: input shape, hidden representation, train/validation gap.
- Experiment: XOR, hidden units, activation, optimizer comparison.

**Current status:** Strong MLP module exists. Optimizer content exists and should be required before deeper architectures so learners can read training behavior beyond plain SGD.

**Design action:** Keep `mlp` as the first neural network module and make optimizer comparison a required training-behavior module before CNN/Attention.

### Stage 9 - Visual Deep Learning

**Learner question:** Why do CNNs work differently from dense networks on images?

**Main modules:**
- `cnn-visualization`

**Support lenses:**
- Math: `tensor-shapes-vectorization`, convolution/shape reasoning within the CNN module.
- Data: image tensor layout, channels, augmentation as future optional content.
- Experiment: kernel, stride, padding, pooling, receptive field.

**Current status:** Covered by `cnn-visualization`, but currently not in the default core path.

**Design action:** Add CNN after MLP, with tensor-shape support just before or inside the stage.

### Stage 10 - Sequence, Attention, and Transformer Intro

**Learner question:** How do models handle ordered tokens and use attention to mix context?

**Main modules:**
- a missing sequence/embedding bridge module
- `attention-transformer`

**Support lenses:**
- Math: dot product, softmax, matrix shape, weighted sum.
- Data: token, sequence, embedding, context length.
- Experiment: attention matrix, Q/K/V scores, multi-head shape.

**Current status:** `attention-transformer` exists, but the route lacks an RNN/sequence/embedding bridge. `llm-rag` exists but is too advanced for the Spine V1 endpoint.

**Design action:** Add a new bridge requirement before `attention-transformer`; keep `llm-rag` outside Spine V1 as advanced/application extension.

## Proposed Default Spine Order

```text
0. ai-overview
1. python-notebook
2. numerical-data
3. categorical-data
4. dataset-quality
5. beginner-linear-algebra
6. linear-algebra-feature-space
7. loss-functions
8. linear-regression
9. housing-price-project
10. gradient-descent
11. calculus-derivatives-local-change
12. calculus-partial-derivatives-gradients
13. calculus-gradient-descent
14. calculus-sgd-batch-noise
15. logistic-regression
16. beginner-probability-distributions
17. probability-likelihood-entropy
18. classification
19. classification-project
20. splits-generalization
21. model-selection
22. complexity-regularization
23. tree-forest
24. mlp
25. matrix-calculus-autodiff
26. optimizer-comparison
27. tensor-shapes-vectorization
28. cnn-visualization
29. sequence-embedding-bridge (new)
30. attention-transformer
```

This is intentionally not the exact final implementation order. The implementation should probably represent the spine as stages with required and support modules, not as one flat 31-item list. The flat list above is only a reviewable starting point.

## Content Coverage Matrix

| Area | Current coverage | Spine V1 decision | Gap |
| --- | --- | --- | --- |
| Orientation | `ai-overview`, `python-notebook` | Include both early | Need clearer "what learners can do after this stage" copy |
| Tabular data | Data Lab 5 modules | Promote first 3 early; use split/reg later | Need route-level bridges into model stages |
| Feature vectors | Math Lab linear algebra modules | Use just-in-time | Need avoid requiring full linear algebra route |
| Loss and residuals | `loss-functions`, `linear-regression` | Core | Need data-to-loss bridge |
| Gradient training | `gradient-descent`, calculus route | Core plus math lens | Need de-duplicate narrative between Algorithm and Math Lab |
| Classification | logistic/classification/project | Core | Need probability/threshold support ordered clearly |
| Generalization | Data Lab split/reg, model selection | Core stage | Need unify Data Lab and Algorithm framing |
| Tree models | `tree-forest` | Add before MLP | Need verify module depth fits core path |
| MLP | `mlp` | Core | Mostly covered |
| CNN | `cnn-visualization` | Add after MLP | Need tensor-shape bridge placement |
| Sequence and attention | `attention-transformer` | Add as endpoint | Missing sequence/embedding bridge |
| LLM/RAG | `llm-rag` | Advanced extension, not Spine V1 | Defer |
| Numerical advanced math | SVD, PCA, LU, sparse, condition, Markov, finite difference, nonlinear equations, optimization | Topic library only | Not required for default spine |

## Module Classification

### Promote Into Default Spine

- `python-notebook`
- `categorical-data`
- `dataset-quality`
- `splits-generalization`
- `complexity-regularization`
- `tree-forest`
- `optimizer-comparison`
- `cnn-visualization`
- `attention-transformer`

### Keep As Support Lens

- Most Math Lab modules, especially advanced numerical modules.
- Selected calculus and probability modules near model stages.

### Keep As Project Capstones

- `housing-price-project` after linear regression.
- `classification-project` after classification and metrics.

### Defer From Spine V1

- `llm-rag`, because the chosen endpoint is deep-learning introduction, not modern AI application development.
- Full backend progress/account work.
- Full migration of all Math Lab/Data Lab content into LessonPage blocks.

## Navigation Implications

The implementation should eventually make the top-level product feel like:

```text
Learn
  Default Spine
  Stage map
Library
  Math Lens
  Data Lens
  Model Lens
Projects
  Housing
  Classification
Progress
  Lightweight for now; backend-grade tracking later
```

For this design phase, the important rule is:

- The first entry is the default spine.
- Math Lab and Data Lab are not presented as parallel products for beginners.
- Topic library remains available for exploration and reference.

## Proposed Data Model Direction

Future implementation should add a stage-level spine model rather than forcing everything into `curriculumTracks.moduleIds`.

Draft shape:

```ts
interface CurriculumSpineStage {
  id: string
  title: LocalizedCopy
  learnerQuestion: LocalizedCopy
  requiredModuleIds: string[]
  supportModuleIds: string[]
  projectModuleIds?: string[]
  outcomes: LocalizedCopy[]
  knownGaps?: LocalizedCopy[]
}
```

This keeps the main route human-readable while preserving support lenses.

## Out Of Scope For Phase 9 Design

- No Vue component implementation.
- No router rewrite.
- No new progress persistence.
- No backend, account, or database design.
- No deletion of existing routes or old localStorage keys.
- No bulk rewrite of Math Lab, Data Lab, or Algorithm content.
- No new LLM/RAG curriculum expansion.
- No visual redesign beyond route/navigation implications.

## Acceptance Criteria For This Design

- [x] The design names one default route from zero foundation to deep-learning intro.
- [x] The design shows how Math Lab and Data Lab become support lenses instead of parallel products.
- [x] The design maps existing modules into required, support, project, deferred, or gap categories.
- [x] The design identifies content gaps before implementation begins.
- [x] The design explicitly freezes progress/backend work for this phase.
- [x] The design can be translated into small implementation phases after approval.

## Suggested Implementation Phases After Approval

### Phase 9A - Spine Data Contract

- Add `src/curriculum/spine.ts` or equivalent typed stage model.
- Encode stages, learner questions, required modules, support lenses, and project caps.
- Add validation tests for module IDs, duplicate placement, and stage ordering.
- No page redesign yet.

**Implementation status:** Done in `src/curriculum/spine.ts`, `src/curriculum/types.ts`, and `tests/curriculumSpine.test.ts`.

### Phase 9B - Homepage And Navigation Realignment

- Make homepage first screen point to the default spine, not a mixed catalog.
- Rename or reposition Math/Data Lab as topic lenses.
- Keep legacy routes reachable.

### Phase 9C - Stage Landing View

- Add a route/view that presents the spine as stages with required and support modules.
- Avoid progress-heavy UI. Focus on "where am I in the curriculum?" and "why next?"

### Phase 9D - Content Gap Fill: Sequence Bridge

- Add the missing sequence/embedding bridge before `attention-transformer`.
- Keep it small, bilingual, and tied to existing attention content.

### Phase 9E - Route Copy Harmonization

- Rewrite only stage-level and bridge copy first.
- Do not rewrite every lesson body.

## Resolved Review Decisions

1. **Data first.** `numerical-data`, `categorical-data`, and `dataset-quality` should come before formal linear algebra in the learner-facing route. Linear algebra enters just-in-time when feature vectors need explanation.
2. **Optimizer comparison is required.** `optimizer-comparison` remains in the default spine because training behavior, optimizer state, and curve diagnosis are necessary before CNN/Attention.
3. **Attention/Transformer is the endpoint.** Spine V1 should end at `attention-transformer`; `llm-rag` remains an advanced application extension.
4. **Projects are recommended validation.** `housing-price-project` and `classification-project` should be visible stage capstones, but not hard blockers for continuing the route.

## Implementation Recommendation

Phase 9A has encoded the approved stage model and validation contract. The next implementation step should be **Phase 9B - Homepage And Navigation Realignment**:

- make the default spine the primary learner-facing entry,
- reposition Math Lab and Data Lab as lenses instead of beginner-parallel products,
- preserve legacy routes,
- and continue avoiding backend/progress expansion until the route is coherent.
