# Phase 26: Loss Functions Rebuild - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-07-28
**Phase:** 26-loss-functions-rebuild
**Areas discussed:** Teaching chapter spine, Fixed numerical cases, BCE and gradient depth, Notebook and visual materials

---

## Teaching Chapter Spine

### Core lesson structure

| Option | Description | Selected |
|--------|-------------|----------|
| Five core chapters plus two supporting topics | Make the implementation spine primary and demote likelihood/MLE and Softmax to supporting material. | |
| Keep all six existing chapters as core | Preserve error/objective, MSE/MAE, BCE, likelihood, negative log, and MLE as complete core teaching. | ✓ |
| Compress into four larger chapters | Merge concepts, formulas, code, and verification into fewer long chapters. | |

**User's choice:** Keep all six existing chapters as core, then add the missing code and gradient teaching.

### Placement of NumPy code and gradient verification

| Option | Description | Selected |
|--------|-------------|----------|
| Interleave code with concepts and end with unified verification | Put code and outputs beside MSE/MAE and BCE, then add one final gradient-check chapter. | ✓ |
| Add two standalone core chapters | Put all NumPy implementation and gradient verification after the six existing chapters. | |
| Keep most code in the Notebook | Keep the page conceptual and move implementation depth to downloads. | |

**User's choice:** Interleave code and locked outputs with the concepts, then finish with one unified verification chapter.

### Cognitive order

| Option | Description | Selected |
|--------|-------------|----------|
| Use first, then explain the origin | Teach error/objective, MSE/MAE, and BCE before likelihood, negative log, and MLE. | ✓ |
| Probability model first, then derive losses | Start from likelihood and MLE before introducing familiar losses. | |
| Two-pass explanation | Survey all losses, then repeat them through their probabilistic origin. | |

**User's choice:** Use first, then explain the probabilistic origin.

### Role of Softmax

| Option | Description | Selected |
|--------|-------------|----------|
| Keep as a BCE chapter bridge | Preserve access to the existing Softmax interaction without making it a Phase 26 implementation target. | ✓ |
| Give BCE and Softmax equal depth | Add full Softmax code, gradients, Notebook outputs, and checkpoint coverage. | |
| Move Softmax to the later classification phase | Remove it from the loss lesson and restore it later. | |

**User's choice:** Keep Softmax as a concise BCE chapter bridge.

**Notes:** The user prioritized curriculum completeness while keeping Phase 26 focused on MSE, MAE, and stable binary cross-entropy.

---

## Fixed Numerical Cases

### Relationship to earlier mathematics fixtures

| Option | Description | Selected |
|--------|-------------|----------|
| Reuse the existing mathematics fixture | Carry the earlier `MSE=2.5` values into Phase 26. | |
| Force one dataset across regression and classification | Give each row both a continuous target and a binary label. | |
| Create new Phase 26 cases | Establish independent loss-course examples. | ✓ |

**User's choice:** Create new cases rather than reusing the existing mathematics fixture.

### Regression frame

| Option | Description | Selected |
|--------|-------------|----------|
| Delivery-time prediction | Use minutes and severe delay behavior to make MAE units and MSE outlier amplification concrete. | ✓ |
| House-price prediction | Reuse the housing context and high-price outliers. | |
| Dimensionless abstract values | Optimize for short hand calculations without a real unit. | |

**User's choice:** Delivery-time prediction.

### Binary-classification frame

| Option | Description | Selected |
|--------|-------------|----------|
| Manufacturing defect detection | Use defect versus normal labels to compare correct, hesitant, and confidently wrong predictions. | ✓ |
| Severe delivery-delay classification | Keep regression and classification inside one delivery domain. | |
| Spam detection | Use a familiar classification example that also supports threshold discussion. | |

**User's choice:** Manufacturing defect detection.

### Scale and Notebook relationship

| Option | Description | Selected |
|--------|-------------|----------|
| Small synthetic tables plus separate pressure tests | Use four or five authored rows for hand calculations. | |
| Extreme values inside the main aggregate | Include numerical stress cases in the normal batch objective. | |
| Larger synthetic mini-datasets | Use ten to twelve authored rows. | |
| Real-data Notebook workflow | Use real public data, freeze representative real rows for the page, and publish full clean-kernel Notebook outputs as auxiliary assets. | ✓ |

**User's choice:** Real-data Notebook workflow.

**Notes:** The user clarified that both main cases should use real public data. Full-data Notebook results are auxiliary teaching assets, while a small frozen subset remains visible for calculation. Logits `±1000` remain separately labelled numerical probes.

---

## BCE and Gradient Depth

### BCE representation

| Option | Description | Selected |
|--------|-------------|----------|
| Probability intuition followed by stable logits | Teach the familiar probability formula, connect to sigmoid logits, and implement `softplus`/`logaddexp`. | ✓ |
| Probability formula with clipping only | Avoid `log(0)` through epsilon clipping. | |
| Logit formulation from the start | Teach only the stable formula. | |

**User's choice:** Probability-domain intuition followed by a canonical stable logit implementation.

### Gradient depth

| Option | Description | Selected |
|--------|-------------|----------|
| Output-level gradients plus chain-rule bridge | Derive MSE/MAE with respect to predictions and BCE with respect to logits; defer model parameters. | ✓ |
| Full model-parameter gradients | Derive linear- and logistic-model parameter gradients now. | |
| MSE and BCE gradients only | Omit MAE non-differentiability and subgradients. | |

**User's choice:** Output-level gradients plus a short chain-rule bridge.

### Visible finite-difference verification

| Option | Description | Selected |
|--------|-------------|----------|
| Per-element table plus step-size sensitivity | Compare analytic and numerical gradients with tolerances and a small `h` sweep. | ✓ |
| One scalar check per loss | Show only one minimal gradient check for each loss. | |
| Verification only in tests and Notebook | Tell readers checks passed without displaying the process. | |

**User's choice:** Per-element verification with error/tolerance columns and step-size sensitivity.

### Extreme-logit presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Locked comparison table plus bounded interaction | Compare naive, clipped, and stable BCE at fixed extreme logits; keep controls within a teaching range. | ✓ |
| Stable finite results only | Hide the naive and clipped failure modes. | |
| Arbitrary numeric input | Let readers enter any logit and handle runtime errors interactively. | |

**User's choice:** Locked failure comparison plus bounded interaction.

**Notes:** MAE at zero residual must be presented as non-differentiable, and clipped BCE must be distinguished from an equivalent stable formulation.

---

## Notebook and Visual Materials

### Notebook packaging

| Option | Description | Selected |
|--------|-------------|----------|
| One integrated Notebook | Put both datasets and all loss topics in one long workflow. | |
| Two topic-specific Notebooks | Separate real-data MSE/MAE from real-data BCE and gradient verification. | ✓ |
| Main Notebook plus pressure-test script | Move extreme logits and finite differences to a standalone script. | |

**User's choice:** Two topic-specific Notebooks.

### Notebook localization

| Option | Description | Selected |
|--------|-------------|----------|
| Two bilingual Notebooks | Put Chinese and English prose inside each topic Notebook. | |
| Separate Chinese and English variants | Publish four locale-specific files while locking shared code and outputs. | ✓ |
| Chinese-only Notebooks | Keep English teaching on the web page only. | |

**User's choice:** Separate Chinese and English variants for each topic.

### Placement of executed outputs

| Option | Description | Selected |
|--------|-------------|----------|
| Show results in context | Place the selected tables and plots beside the formulas and explanations they support. | ✓ |
| Collect results in one final chapter | Put all executed outputs after the conceptual chapters. | |
| Summary cards only | Show only final metrics and move details to downloads. | |

**User's choice:** Show selected locked results in context, with a unified download area at the end.

### Visual-asset mix

| Option | Description | Selected |
|--------|-------------|----------|
| Existing interactive labs plus Notebook plots | Rebuild the current labs, add deterministic real-data figures, and use Manim/images only for a specific explanatory gap. | ✓ |
| Dedicated visual for every chapter | Produce a separate illustration or Manim segment for all six conceptual chapters. | |
| Notebook plots only | Add no new illustration or animation. | |

**User's choice:** Existing interactive labs and Notebook plots are primary; image or Manim work is need-driven.

**Notes:** Visual production must serve the teaching sequence and numerical contract rather than becoming an asset quota.

---

## the agent's Discretion

- Select exact public datasets that satisfy the preferred real delivery-time and manufacturing-defect domains and the project’s provenance/licensing rules.
- Select representative rows, deterministic model configurations, plot forms, finite-difference steps, and tolerances from the reproducible outputs.
- Choose whether one additional image or Manim asset is necessary after the existing labs and Notebook plots are evaluated.

## Deferred Ideas

- Full model-parameter gradients and training loops move to the linear- and logistic-regression phases.
- Full Softmax implementation and multiclass decision analysis move to the classification phase.
- Arbitrary numeric input, browser Python, backend assessment, and checkpoint persistence remain outside Phase 26.
