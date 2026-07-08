# Phase 22 Design: Transformer Block Assembly Challenge

**Date:** 2026-07-08

## Problem

Phase 21 made Attention row-wise softmax active, but the required `attention-transformer` endpoint still ends with two mostly static stages:

- `transformer-block`: attention, residual, LayerNorm, and FFN are described, but learners do not have to place them in the block or reason about failure modes.
- `architecture-to-tools`: tokenizer, model, attention mask, and logits are mapped to tooling, but the bridge into optional `llm-rag` remains conceptual.

`llm-rag` is correctly classified as `advanced-extension`, so the next phase should not promote it into the required spine. The stronger required-core move is to make the final Transformer block concept testable before learners optionally continue into RAG.

## Current-State Audit

- `attention-transformer` is the last required Spine V1 module.
- `llm-rag` remains outside Spine V1 and has role `advanced-extension`.
- `attention-transformer -> softmax-weighted-sum` now has `AttentionQkvChallengeLab`.
- `attention-transformer -> transformer-block` still uses the shared `attentionStages` static focus card.
- `llm-rag -> rag-evaluation` also uses static stage cards, but changing that first would improve optional content before the required endpoint is solid.

## Approaches Considered

### A. Route copy only

Add clearer text between Attention and LLM/RAG.

**Rejected for now.** It is low-risk but does not fix the core issue: learners still do not demonstrate that they understand how attention, residual, norm, and FFN form a block.

### B. RAG grounding diagnosis first

Add a `RagFailureDiagnosisChallengeLab` to `llm-rag -> rag-evaluation`.

**Deferred.** This is valuable, but `llm-rag` is an advanced extension. It should come after the required `attention-transformer` endpoint can verify block-level reasoning.

### C. Transformer block assembly first

Add a narrow `TransformerBlockAssemblyChallengeLab` to `attention-transformer -> transformer-block`.

**Chosen.** This keeps work inside the required core, strengthens the endpoint before optional RAG, and follows the recent successful pattern: one deterministic helper, one focused component, one section-level wiring point, no route or progress expansion.

## Proposed Learning Task

Learners choose a fixed scenario and predict:

1. The correct block order or missing sublayer.
2. Which role is affected: token mixing, stable residual path, per-token nonlinear processing, or normalization.

After checking, the lab shows deterministic evidence:

- ordered block trace,
- input/output shape invariants,
- role labels for self-attention, residual, LayerNorm, and FFN,
- failure consequence,
- feedback explaining the misconception.

## Scenarios

- `missing-residual`: output still has shape `[B,T,H]`, but the direct signal path is gone and deep training becomes harder.
- `missing-layernorm`: shape remains valid, but activation scale is less controlled and training stability weakens.
- `missing-ffn`: tokens can exchange information, but each token lacks the shared nonlinear processing step.
- `attention-only`: attention is present, but a full Transformer block is not just Q/K/V and softmax.

## Runtime Scope

Create a deterministic helper in `src/simulations/transformerBlockAssemblyChallenge.ts`.

Create `src/components/TransformerBlockAssemblyChallengeLab.vue`.

Wire it into `src/components/AppliedWorkflowLessonLab.vue` only for:

```vue
props.moduleSlug === 'attention-transformer' && props.section.id === 'transformer-block'
```

Update `src/data/attentionTransformerModule.ts` experiment prompt for `transformer-block`.

Add focused tests:

- helper scenario coverage and scoring,
- invalid input normalization,
- component source tokens and wiring,
- milestone audit discoverability.

## Non-Goals

- No backend, database, account, durable progress, or checkpoint persistence work.
- No new route, new module inventory, or spine role change.
- Do not promote `llm-rag` into required core.
- Do not build a full Transformer simulator, generation demo, RAG surface, semantic NLP task, or multi-head visualization.
- Do not migrate `attention-transformer` or `llm-rag` into `LessonPage`.
- Do not replace existing `attentionStages`; the challenge should sit before the existing stage explanation.

## Acceptance Criteria

- The task asks learners to predict block order or missing sublayer before evidence is shown.
- Scenarios cover residual, LayerNorm, FFN, and attention-only misconceptions.
- Evidence is deterministic and derived outside Vue.
- Existing Attention stage explanation remains visible.
- Routes, curriculum roles, and checkpoints are unchanged.
- Design phase: `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check` pass.
- Runtime implementation phase: targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks for `/learn/attention-transformer/transformer-block` pass.
