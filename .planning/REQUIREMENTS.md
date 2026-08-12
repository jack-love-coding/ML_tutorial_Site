# Requirements: v1.1 Classical Supervised Learning

**Defined:** 2026-07-27  
**Core Value:** Students should always know where they are in the learning path, why the current lesson matters, and what evidence shows they are ready for the next step.

## v1.1 Requirements

Requirements for the Classical Supervised Learning milestone. Each requirement maps to exactly one roadmap phase.

### Loss Functions

- [x] **LOSS-01**: Learners can calculate MSE, MAE, and stable binary cross-entropy on fixed examples and aggregate per-example losses into one objective.
- [x] **LOSS-02**: Learners can use loss scale and gradients to explain how outliers and confident wrong predictions influence training differently.
- [x] **LOSS-03**: Learners can run vectorized NumPy loss implementations and verify the displayed gradients with finite differences.

### Linear Regression

- [x] **LINR-01**: Learners can connect `ŷ = Xw + b`, residuals, MSE gradients, and coefficient interpretation using consistent notation.
- [x] **LINR-02**: Learners can reproduce a locked regression fit using NumPy batch gradient descent.
- [x] **LINR-03**: Learners can compare normal-equation, gradient-descent, and scikit-learn coefficients, predictions, and errors on the same split.
- [x] **LINR-04**: Learners can use held-out residuals and coefficient stability to identify nonlinearity, heteroscedasticity, or collinearity limitations.
- [x] **LINR-05**: Learners can read each linear-regression chapter as a single-column sequence of explanation, code, runtime output, figure interpretation, and a compact full-width observation lab.
- [x] **LINR-06**: Learners can use train-only Bike Sharing exploration to explain why progressively adding numeric, categorical, and cyclical features changes validation fit.
- [x] **LINR-07**: Learners can distinguish target, preprocessing, and evaluation leakage while following a chronological train/validation/test workflow whose test partition is evaluated once.
- [x] **LINR-08**: Learners can download bilingual executed Notebooks and local figures that reproduce the displayed fitting, residual, coefficient, and regularization results, with references collected only at the course end.

### Tabular Regression Project

- [x] **TPRJ-01**: Learners can download a local tabular dataset with provenance, checksum, schema, target definition, and fixed train/validation/test split.
- [x] **TPRJ-02**: Learners can build a leakage-safe pipeline whose preprocessing rules are fitted on training data only.
- [x] **TPRJ-03**: Learners can establish an honest linear baseline and compare one controlled improvement against it.
- [x] **TPRJ-04**: Learners can report metrics, residual plots, named failure examples, formula-to-code connections, and project limitations.
- [x] **TPRJ-05**: Learners can download the dataset, clean-kernel Notebook, and locked outputs that reproduce the reference results shown on the teaching page.

### Gradient Descent Beginner Teaching

- [x] **GRAD-01**: Learners can calculate predictions, residuals, MSE, analytic gradients, and one parameter update on the shared five-row study-hours dataset.
- [x] **GRAD-02**: Learners can connect one-dimensional loss slices, the two-parameter MSE landscape, contours, and the negative-gradient update direction.
- [x] **GRAD-03**: Learners can reproduce the course anchors from bilingual executed NumPy Notebooks and a deterministic TypeScript engine.
- [x] **GRAD-04**: Learners can compare slow, stable, oscillating, and divergent learning-rate paths without hidden clamping, and explain the role of feature scaling.
- [x] **GRAD-05**: Learners can distinguish small gradients, saddle points, local minima, global minima, and true full/mini/SGD sample updates through accessible chapter-specific labs.
- [x] **GRAD-06**: Existing gradient-descent chapter IDs, routes, progress, checkpoint behavior, and Bike training assets remain compatible after the six-page rebuild.

### Logistic Regression

- [ ] **LOGR-01**: Learners can connect linear scores, sigmoid probabilities, log-odds, maximum likelihood, and binary cross-entropy.
- [ ] **LOGR-02**: Learners can implement stable binary cross-entropy, logistic gradients, deterministic training, and finite-difference checks in NumPy.
- [ ] **LOGR-03**: Learners can compare scratch coefficients and probabilities with scikit-learn under aligned preprocessing and regularization settings.
- [ ] **LOGR-04**: Learners can inspect probability calibration and use a nonlinear example to explain the limit of a linear decision boundary.

### Optimizer Principles, State, and MLP Transfer

- [x] **OPT-01**: Learners can follow the training loop and compare full-batch, mini-batch, and stochastic SGD updates on a shared deterministic case.
- [x] **OPT-02**: Learners can trace Momentum and RMSProp state and explain their distinct update behavior on the same loss landscape.
- [x] **OPT-03**: Learners can inspect Adam's raw and bias-corrected moments and distinguish coupled L2 regularization from decoupled AdamW weight decay.
- [x] **OPT-04**: Learners can apply constant, step-decay, and warmup-cosine schedules in the documented optimizer-then-scheduler cadence.
- [x] **OPT-05**: Learners can compare four optimizers on an identical fixed `2→4→1 tanh` circle benchmark without treating a result as a universal winner.
- [x] **OPT-06**: Learners can reproduce a Banknote transfer that uses the existing fixed split and train-only standardization, with the test split evaluated only after selection is frozen.

### Classification Decisions

- [ ] **CLAS-01**: Learners can distinguish model scores, probabilities, thresholds, and final class decisions.
- [ ] **CLAS-02**: Learners can calculate a confusion matrix, precision, recall, and F1 from fixed held-out predictions.
- [ ] **CLAS-03**: Learners can explain that ROC/AUC summarizes ranking across thresholds rather than directly selecting an operating threshold.
- [ ] **CLAS-04**: Learners can choose and justify a validation threshold using false-positive and false-negative costs while reporting result variation.
- [ ] **CLAS-05**: Learners can inspect subgroup errors and named misclassified examples rather than relying on one aggregate score.
- [ ] **CLAS-06**: Learners can still access the existing multiclass and softmax material as supporting content without turning it into the milestone's primary project.

### Content and Quality

- [ ] **QLTY-01**: Learners receive complete Chinese and English teaching for all five milestone modules with consistent formulas, variable names, code, and run outputs.
- [ ] **QLTY-02**: Each module presents a core question, concept explanation, worked example, formula, code, run output, misconception feedback, and next-step connection.
- [ ] **QLTY-03**: Exercises remain selective, formative, and non-blocking so detailed teaching remains the primary page content.
- [ ] **QLTY-04**: Existing module IDs, routes, checkpoints, and Progress V1/V2 behavior remain compatible throughout the rebuild.
- [ ] **QLTY-05**: Core computations remain outside Vue components with automated tests, and every phase passes standard build, Pages build, and bilingual desktop/mobile checks.

## Future Requirements

Deferred to later milestones and excluded from the v1.1 roadmap.

- **FUT-05**: Add decision-tree, random-forest, and ensemble-learning content.
- **FUT-06**: Rebuild regularization, model selection, and the remaining generalization/training-diagnostics route.
- **FUT-07**: Deliver the complete classification-evaluation project after model-selection prerequisites are ready.
- **FUT-08**: Execute Python Data Tools Stage 5 terminology, consistency, browser, and release validation.
- **FUT-09**: Resume Homepage Focus and Spine progressive-disclosure work.
- **FUT-10**: Design backend accounts, synchronized progress ownership, and checkpoint persistence together.

## Out of Scope

| Feature | Reason |
| --- | --- |
| New duplicate course IDs or an alternate route tree | Existing canonical and legacy identities must remain stable during the rebuild. |
| Runtime remote dataset fetching | Teaching data and Notebook execution must remain reproducible and downloadable locally. |
| Browser Python or Pyodide | Deterministic browser examples continue to use TypeScript; Python remains an authored downloadable artifact. |
| Large exercise bank or assessment system | The product remains teaching-first and teacher/backend assessment is deferred. |
| Backend accounts, cloud sync, or checkpoint persistence | These require a later identity, ownership, and database design. |
| Homepage, global navigation, or visual-system redesign | Content depth is the milestone priority. |
| Tree models, ensembles, or the full classification project | These belong to the following generalization and evaluation milestone. |

## Traceability

Roadmap phase assignments are canonical in the approved v1.1 roadmap.

| Requirement | Phase | Status |
| --- | --- | --- |
| LOSS-01 | Phase 26 | Complete |
| LOSS-02 | Phase 26 | Complete |
| LOSS-03 | Phase 26 | Complete |
| LINR-01 | Phase 27 | Complete |
| LINR-02 | Phase 27 | Complete |
| LINR-03 | Phase 27 | Complete |
| LINR-04 | Phase 27 | Complete |
| LINR-05 | Phase 27A | Complete |
| LINR-06 | Phase 27A | Complete |
| LINR-07 | Phase 27A | Complete |
| LINR-08 | Phase 27A | Complete |
| TPRJ-01 | Phase 28 | Complete |
| TPRJ-02 | Phase 28 | Complete |
| TPRJ-03 | Phase 28 | Complete |
| TPRJ-04 | Phase 28 | Complete |
| TPRJ-05 | Phase 28 | Complete |
| GRAD-01 | Phase 28A | Complete |
| GRAD-02 | Phase 28A | Complete |
| GRAD-03 | Phase 28A | Complete |
| GRAD-04 | Phase 28A | Complete |
| GRAD-05 | Phase 28A | Complete |
| GRAD-06 | Phase 28A | Complete |
| OPT-01 | Phase 28B | Complete |
| OPT-02 | Phase 28B | Complete |
| OPT-03 | Phase 28B | Complete |
| OPT-04 | Phase 28B | Complete |
| OPT-05 | Phase 28B | Complete |
| OPT-06 | Phase 28B | Complete |
| LOGR-01 | Phase 29 | Pending |
| LOGR-02 | Phase 29 | Pending |
| LOGR-03 | Phase 29 | Pending |
| LOGR-04 | Phase 29 | Pending |
| CLAS-01 | Phase 30 | Pending |
| CLAS-02 | Phase 30 | Pending |
| CLAS-03 | Phase 30 | Pending |
| CLAS-04 | Phase 30 | Pending |
| CLAS-05 | Phase 30 | Pending |
| CLAS-06 | Phase 30 | Pending |
| QLTY-01 | Phase 31 | Pending |
| QLTY-02 | Phase 31 | Pending |
| QLTY-03 | Phase 31 | Pending |
| QLTY-04 | Phase 31 | Pending |
| QLTY-05 | Phase 31 | Pending |

**Coverage:**

- v1.1 requirements: 43 total
- Mapped to phases: 43
- Unmapped: 0 ✓

---
*Requirements defined: 2026-07-27*
*Last updated: 2026-08-12 after Phase 28/28A reconciliation and Phase 28B registration*
