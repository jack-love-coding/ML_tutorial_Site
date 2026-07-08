# Optimizer Curve Diagnosis Challenge Design

**Date:** 2026-07-08
**Status:** Draft for review.
**Authoritative refactor design:** `docs/refactor/designs/phase-20-optimizer-curve-diagnosis-challenge.md`

## Problem

`optimizer-comparison` explains training-loop order, SGD noise, Momentum/RMSProp, AdamW, learning-rate schedules, and curve diagnosis. The weak spot is interaction quality: the current lab surface is still mostly a stage switcher, and the checkpoint only covers the simplest "loss spikes means learning rate may be too high" case.

The required-core route needs learners to practice a more realistic diagnostic loop:

```txt
curve pattern -> likely issue -> next controlled experiment -> evidence
```

## Desired Outcome

A learner can answer:

> Given this training curve, what is the likely optimizer issue, which one knob should I change next, and what evidence supports that decision?

## Scope

Build an `OptimizerCurveDiagnosisChallengeLab` in the implementation phase.

The lab will:

- show one of four deterministic curve scenarios;
- ask for the likely issue before revealing evidence;
- ask for the next controlled experiment;
- reveal computed evidence such as volatility, plateau movement, non-finite loss, final losses, and learning-rate changes;
- live in `optimizer-comparison` chapter `curve-diagnosis`;
- keep existing `optimizerStages` explanation available;
- avoid backend, database, durable progress, project readiness, broad route migration, and new course inventory.

## Architecture

Use one deterministic helper:

```txt
src/simulations/optimizerCurveDiagnosisChallenge.ts
```

Render one Vue component:

```txt
src/components/OptimizerCurveDiagnosisChallengeLab.vue
```

Wire it directly in:

```txt
src/components/AppliedWorkflowLessonLab.vue
```

Do not migrate `optimizer-comparison` into `LessonPage` in this phase.

## Requirements

- Support scenarios:
  - `lr-divergence`: loss spikes or becomes non-finite; expected issue `learning-rate-too-high`; next experiment `lower-learning-rate`.
  - `small-batch-noise`: jagged train loss with improving trend; expected issue `batch-noise-too-high`; next experiment `increase-batch-size`.
  - `ravine-zigzag`: alternating slow SGD progress; expected issue `momentum-or-adaptive-needed`; next experiment `add-momentum-or-adam`.
  - `schedule-plateau`: early drop then plateau under constant learning rate; expected issue `schedule-needed`; next experiment `add-or-move-lr-decay`.
- Score learner predictions for likely issue and next experiment.
- Normalize unknown scenario IDs and invalid prediction values without runtime errors.
- Derive evidence from arrays in the helper rather than hard-coding evidence in Vue.
- Use bilingual local component copy.
- Use text labels for correctness; color is not the only signal.

## Rejected Alternatives

- **Persist task evidence now:** useful later, but the user has prioritized content quality over backend/database/progress work.
- **Build a freeform optimizer simulator:** too broad for the current phase and harder to verify.
- **Replace `AppliedWorkflowLessonLab`:** unnecessary; one section-level challenge is enough.
- **Move Math Lab optimizer content into required core:** Phase 16 classified Math Lab optimizer comparison as support/overlap, not the current required-route surface.

## Acceptance Criteria

- Design and implementation stay focused on one challenge component and one deterministic helper.
- The challenge appears only for `optimizer-comparison` `curve-diagnosis`.
- Tests cover helper evidence, invalid predictions, component source tokens, and route wiring.
- Runtime implementation passes targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks.

## Self-Review

- This spec has no backend, database, progress persistence, checklist system, route rewrite, broad renderer migration, or new course inventory.
- The learner action is measurable: diagnose a curve, choose a next controlled experiment, inspect evidence.
- The design complements existing optimizer copy instead of duplicating a second full optimizer course.
