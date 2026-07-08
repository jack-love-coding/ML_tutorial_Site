# Phase 18 Audit: Optimizer To CNN Handoff

**Date:** 2026-07-07
**Status:** Completed.
**Branch:** `codex/phase-18-optimizer-cnn-handoff-audit`

## Scope

Audit the required-core handoff after Phase 17:

`mlp -> optimizer-comparison -> tensor-shapes-vectorization -> cnn-visualization`

The working question was whether the next teaching-content slice should improve optimizer comparison, CNN, or the transition between them.

## Evidence

### Route Evidence

- `src/curriculum/tracks.ts` places `optimizer-comparison` before `tensor-shapes-vectorization` and `cnn-visualization`.
- `src/curriculum/spine.ts` separates this into two stages:
  - `neural-network-foundations`: `mlp`, `optimizer-comparison`
  - `visual-deep-learning`: `tensor-shapes-vectorization`, `cnn-visualization`
- `.planning/STATE.md` after Phase 17 says the next work should continue required-core teaching depth and route clarity, especially the `optimizer-comparison -> cnn-visualization` area.

### Optimizer Evidence

- `src/data/optimizerComparisonModule.ts` covers:
  - training loop order
  - SGD mini-batch noise
  - Momentum and RMSProp
  - AdamW and weight decay
  - learning-rate schedules
  - curve diagnosis
- `src/data/algorithmCheckpoints.ts` has optimizer checkpoints for:
  - PyTorch loop order
  - learning-rate diagnosis
- `src/components/AppliedWorkflowLessonLab.vue` renders optimizer as stage-switch explanation through `optimizerStages`, not a constrained prediction/evidence task.

### Tensor Shape Evidence

- `src/curriculum/tracks.ts` includes `tensor-shapes-vectorization` between optimizer and CNN in the core path.
- `src/modules/math-lab/data/aiBridgeModules.ts` includes the `tensor-shapes-vectorization` module.
- `src/modules/math-lab/labs/TensorShapeLab.vue` and `src/modules/math-lab/utils/aiBridgeMath.ts` already provide deterministic shape reasoning.
- Phase 15 classified `tensor-shapes-vectorization` as solid required shape literacy.

### CNN Evidence

- `src/data/cnnVisualizationModule.ts` covers:
  - images as `H × W × C`
  - kernel convolution
  - padding/stride output shape
  - channels and feature maps
  - pooling and classifier head
  - transfer learning review
- `src/data/algorithmCheckpoints.ts` already checks:
  - parameter sharing
  - convolution output width
- `src/components/AppliedWorkflowLessonLab.vue` renders CNN as stage-switch explanation through `cnnStages`.
- `tests/cnn-explainer.test.ts` verifies a rich browser-local CNN explainer exists.
- Phase 15 specifically classified `cnn-visualization` as needing an explicit shape/parameter-count challenge.

## Findings

### P0: No Route-Order Blocker

There is no direct missing module between optimizer and CNN. The approved route already inserts `tensor-shapes-vectorization` before `cnn-visualization`.

Impact: the next fix should not create a new transition module or move large lesson bodies. The existing route shape is defensible.

### P1: CNN Shape And Parameter Reasoning Exists, But Is Not Yet A Required Task

CNN content and checkpoints mention output shape and parameter sharing, but the learner does not yet perform one compact task that connects:

- input shape
- kernel size
- padding
- stride
- input channels
- output filters
- convolution parameter count
- equivalent dense parameter count
- the relevant `Conv2d(...)` code line

Impact: learners can read the formula and answer a multiple-choice checkpoint, but may still fail to connect shape arithmetic, parameter-count arithmetic, and code.

Recommended action: Phase 19 should design and implement a `CnnShapeParameterChallengeLab` near `padding-stride-shape` or `channels-feature-maps`.

### P2: Optimizer Comparison Still Needs A Task, But It Is Not The Handoff Blocker

Optimizer comparison remains mostly stage-switch explanation. A later task should ask learners to diagnose a curve pattern and choose a next experiment under controlled variables.

Impact: optimizer learning evidence is still weaker than gradient descent and MLP, but it does not block the CNN transition as strongly as the CNN shape/parameter gap.

Recommended action: keep optimizer upgrade as a later required-core interaction slice after the CNN shape/parameter challenge.

### P2: Route Copy Should Avoid Implying Optimizer Jumps Directly Into CNN

The real handoff is `optimizer-comparison -> tensor-shapes-vectorization -> cnn-visualization`, not optimizer directly to CNN.

Impact: planning language should preserve the tensor-shape bridge so future work does not invent unnecessary transition content.

Recommended action: mention `tensor-shapes-vectorization` explicitly in Phase 19 design.

## Recommended Next Phase

Phase 19 should be a narrow CNN shape/parameter challenge:

- deterministic helper for convolution output shape and parameter count
- one compact learner task near the CNN `padding-stride-shape` or `channels-feature-maps` section
- compare Conv2d parameter count against a dense layer reading the same image
- require a prediction before showing computed evidence
- keep existing CNN explainer intact

Do not add backend, database, account, durable progress, project readiness checklists, new course inventory, route rewrites, or broad LessonPage migration.

## Acceptance For This Audit

- The approved route order is checked against source.
- Optimizer, tensor-shape, and CNN current teaching surfaces are classified.
- The next implementation direction is one narrow content-quality task, not a progress/checklist feature.
- The audit preserves the Phase 17 decision that full autodiff remains support while required MLP teaches chain-rule responsibility flow.

## Verification

- `node --test tests/curriculumMilestoneAudit.test.ts`
- `git diff --check`
