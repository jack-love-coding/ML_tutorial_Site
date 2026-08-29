# Phase 29: Logistic Regression Rebuild - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-08-19
**Phase:** 29-logistic-regression-rebuild
**Areas discussed:** Data teaching spine, six chapter responsibilities, chapter interactions and media, boundary with Phase 30

---

## Data Teaching Spine

### Real and Controlled Cases

| Option | Description | Selected |
|---|---|---|
| Banknote spine plus bounded diagnostics | Banknote owns all real training; calibration and nonlinear limitations receive controlled views. | ✓ |
| Banknote only | Keep every visual on real rows, with a less direct nonlinear-boundary explanation. | |
| Two equal dataset spines | Treat Banknote and a synthetic dataset as coequal teaching cases. | |

**User's choice:** Banknote spine plus bounded diagnostics.

### Calibration Demonstration

| Option | Description | Selected |
|---|---|---|
| Real predictions plus controlled distortion | Compare raw validation probabilities with sharpened and softened transforms of the same logits. | ✓ |
| Raw calibration bins only | Show only the model's original calibration. | |
| Platt and isotonic calibration | Add fitted post-processing methods. | |

**User's choice:** Real predictions plus controlled distortion.

### Nonlinear Diagnostic

| Option | Description | Selected |
|---|---|---|
| XOR only | Preserve the current compact nonlinear example. | |
| Circles only | Use a continuous geometric boundary failure. | |
| XOR plus circles | Use XOR for hand reasoning, then circles for a point-cloud diagnosis. | ✓ |

**User's choice:** XOR plus circles.

### EDA Depth

| Option | Description | Selected |
|---|---|---|
| Necessary data contract | Explain features, balance, split, missingness, train-only scaling, and a projection. | ✓ |
| Full EDA | Repeat detailed distribution, correlation, and outlier exploration. | |
| Summary and downloads only | Hide preparation details from the reading flow. | |

**User's choice:** Necessary data contract.

**Notes:** The source does not define human semantics for class 0/1, so the course retains numeric class names.

---

## Six Chapter Responsibilities

### Chapter Mapping

| Option | Description | Selected |
|---|---|---|
| Reassign all six responsibilities | Form one score → probability → likelihood → loss/gradient → training/parity → calibration/limits sequence. | ✓ |
| Keep themes and add material | Preserve current chapter themes and fit new requirements around them. | |
| Keep a full threshold chapter | Continue teaching threshold metrics in Phase 29. | |

**User's choice:** Reassign all six responsibilities.

### Likelihood and BCE Depth

| Option | Description | Selected |
|---|---|---|
| Complete layered derivation | Derive Bernoulli likelihood, log-likelihood, NLL, and mean BCE using the same rows. | ✓ |
| Abbreviated formulas | Keep only probability-loss intuition. | |
| Add entropy and KL | Expand into information-theory derivations. | |

**User's choice:** Complete layered derivation.

### Gradient Teaching

| Option | Description | Selected |
|---|---|---|
| Scalar → vectorized → finite difference | Derive one row, batch the result, and verify each parameter numerically. | ✓ |
| Vectorized only | Present only the compact NumPy implementation. | |
| Add autodiff | Include a framework-based backward pass. | |

**User's choice:** Scalar → vectorized → finite difference.

### Library Comparison

| Option | Description | Selected |
|---|---|---|
| Two-stage aligned comparison | Verify unregularized parity, then add L2 as a distinct objective. | ✓ |
| Unregularized only | Stop after strict parity. | |
| Library defaults | Compare directly with scikit-learn defaults. | |

**User's choice:** Two-stage aligned comparison.

---

## Chapter Interactions and Media

### Lab Structure

| Option | Description | Selected |
|---|---|---|
| Six dedicated labs | Give each chapter one lazy, focused interactive scene. | ✓ |
| One shared cockpit | Reuse one stateful workbench across chapters. | |
| Dedicated labs plus exploration route | Add both guided scenes and a new full workbench route. | |

**User's choice:** Six dedicated labs.

### Manim Scope

| Option | Description | Selected |
|---|---|---|
| Rebuild three and add one | Upgrade existing media packages and add a likelihood-to-gradient animation. | ✓ |
| Repair three only | Keep the current animation inventory. | |
| Six animations | Produce one animation for every chapter. | |

**User's choice:** Rebuild three and add one.

### Control Density

| Option | Description | Selected |
|---|---|---|
| Guided controls plus details | Keep 2–3 primary controls and place full numbers in expandable tables. | ✓ |
| All parameters visible | Expose a free-form tuning surface. | |
| Preset playback only | Remove direct numerical manipulation. | |

**User's choice:** Guided controls plus expandable numeric detail.

### Real Sample Selection

| Option | Description | Selected |
|---|---|---|
| One canonical plus three comparisons | Follow one row in prose and offer three named frozen comparison rows. | ✓ |
| Browse all rows | Add search/pagination for all 1,372 rows. | |
| One fixed row | Remove comparison-row selection. | |

**User's choice:** One canonical row plus three named comparisons.

---

## Boundary with Phase 30

### Threshold Content

| Option | Description | Selected |
|---|---|---|
| Concept bridge only | Explain the default threshold on one sample and defer decision analysis. | ✓ |
| Remove threshold | Omit thresholding entirely. | |
| Full threshold trade-off | Retain threshold sweeps and classification metrics. | |

**User's choice:** Concept bridge only.

### Accuracy and Calibration

| Option | Description | Selected |
|---|---|---|
| Fixed accuracy as comparison | Show that calibration can change while default classes and accuracy remain fixed. | ✓ |
| Calibration without accuracy | Avoid a direct contrast with class correctness. | |
| Full metrics | Include the complete classification metric suite. | |

**User's choice:** Fixed 0.5 accuracy as a comparison only.

### Prediction Handoff

| Option | Description | Selected |
|---|---|---|
| One frozen prediction table | Share one hash-bound model-output authority between Phases 29 and 30. | ✓ |
| Retrain in Phase 30 | Generate a new logistic model for classification decisions. | |
| Different dataset | Use a separate Phase 30 classification case. | |

**User's choice:** One frozen prediction table.

### Test Reveal

| Option | Description | Selected |
|---|---|---|
| Reveal in Phase 30 | Freeze the model in Phase 29 and first inspect test results after validation threshold selection. | ✓ |
| Split test uses | Show test BCE in Phase 29 and threshold metrics later. | |
| Separate test partitions | Give each phase its own final test evaluation. | |

**User's choice:** Reveal test results only in Phase 30.

---

## the agent's Discretion

- Exact frozen row IDs, numerical tolerances, stopping configuration, calibration transforms/bin count, plot ranges, and animation timing.
- Whether the XOR lab introduces exact points before a jittered view and whether the circle generator is adapted from an existing deterministic fixture.

## Deferred Ideas

- Platt scaling and isotonic calibration.
- Full Banknote EDA, a 1,372-row browser, and a separate free-form logistic exploration route.
- Threshold sweeps, confusion metrics, ROC/AUC, cost selection, subgroup analysis, and final test reveal in Phase 30.
