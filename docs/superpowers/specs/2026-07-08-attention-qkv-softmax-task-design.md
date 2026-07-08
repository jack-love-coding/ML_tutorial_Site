# Attention Q/K/V Softmax Task Design

**Date:** 2026-07-08
**Status:** Draft for review.
**Authoritative refactor design:** `docs/refactor/designs/phase-21-attention-qkv-softmax-task.md`

## Problem

`attention-transformer` explains tokens, Q/K/V, row-wise softmax, multi-head shapes, Transformer blocks, and LLM tooling. The weak spot is interaction quality: the current lab surface is still mostly a stage switcher, and the `softmax-weighted-sum` chapter does not require a learner to predict an attention row before seeing evidence.

The required-core route needs learners to practice this loop:

```txt
query/key scores -> mask -> row-wise softmax -> weighted V output
```

## Desired Outcome

A learner can answer:

> Given this query row, which key receives the highest attention after masking, does the mask change the answer, and what value mixture becomes the output?

## Scope

Build an `AttentionQkvChallengeLab` in the implementation phase.

The lab will:

- show one of four deterministic Q/K/V scenarios;
- ask for the top attended key before revealing evidence;
- ask whether a mask changes the top key;
- reveal computed Q/K scores, masked scores, softmax weights, and weighted-value output;
- live in `attention-transformer` chapter `softmax-weighted-sum`;
- keep existing `attentionStages` explanation available;
- avoid backend, database, durable progress, project readiness, broad route migration, and new course inventory.

## Architecture

Use one deterministic helper:

```txt
src/simulations/attentionQkvChallenge.ts
```

Render one Vue component:

```txt
src/components/AttentionQkvChallengeLab.vue
```

Wire it directly in:

```txt
src/components/AppliedWorkflowLessonLab.vue
```

Do not migrate `attention-transformer` into `LessonPage` in this phase.

## Requirements

- Support scenarios:
  - `matching-key`: clear Q/K alignment; no mask effect.
  - `causal-mask`: a future key has the largest raw score; the mask removes it before softmax.
  - `padding-mask`: a padding key has a tempting raw score; the mask removes it before softmax.
  - `value-mixture`: two allowed keys split the probability mass; the output is a weighted V mixture.
- Score learner predictions for top key and mask effect.
- Normalize unknown scenario IDs and invalid prediction values without runtime errors.
- Derive raw scores, masked scores, softmax weights, and weighted-value output in the helper rather than hard-coding evidence in Vue.
- Use bilingual local component copy.
- Use text labels for correctness; color is not the only signal.
- Preserve existing Attention chapter content, checkpoint behavior, and legacy/canonical routes.

## Rejected Alternatives

- **Persist task evidence now:** useful later, but the user has prioritized content quality over backend/database/progress work.
- **Build a full Transformer simulator:** too broad for the current phase and harder to verify.
- **Add multi-head visualization first:** the current teaching gap is one row of Q/K -> softmax -> V, not head splitting.
- **Replace `AppliedWorkflowLessonLab`:** unnecessary; one section-level challenge is enough.
- **Move Math Lab AI bridge content into required core:** support material can remain support material while this phase strengthens the required route.

## Acceptance Criteria

- Design and implementation stay focused on one challenge component and one deterministic helper.
- The challenge appears only for `attention-transformer` `softmax-weighted-sum`.
- Tests cover helper evidence, invalid predictions, component source tokens, and route wiring.
- Runtime implementation passes targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks.

## Self-Review

- This spec has no backend, database, progress persistence, checklist system, route rewrite, broad renderer migration, or new course inventory.
- The learner action is measurable: predict a top key, judge mask impact, inspect row-wise softmax and weighted-value evidence.
- The design complements existing Attention copy instead of duplicating a second Transformer course.
