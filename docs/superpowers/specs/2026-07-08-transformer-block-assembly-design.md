# Transformer Block Assembly Challenge Design

**Date:** 2026-07-08

## Intent

Strengthen the required `attention-transformer` endpoint before moving attention to optional `llm-rag` application content. The learner should actively assemble or diagnose a Transformer block, not only read that attention, residual, LayerNorm, and FFN exist.

## Chosen Direction

Build a narrow `TransformerBlockAssemblyChallengeLab` in `attention-transformer -> transformer-block`.

This is preferred over a RAG challenge because `llm-rag` is an advanced extension, while `attention-transformer` is the last required core module. It is preferred over route-copy work because the gap is behavioral: students need to predict and explain block mechanics.

## Learner Interaction

The lab shows one deterministic block scenario. Before evidence is revealed, the learner predicts:

- the missing or misplaced block part,
- the consequence category.

Then the lab reveals:

- a block trace,
- shape invariants,
- role evidence,
- misconception-specific feedback.

## Component Contract

- Helper: `src/simulations/transformerBlockAssemblyChallenge.ts`
- Component: `src/components/TransformerBlockAssemblyChallengeLab.vue`
- Wiring: `AppliedWorkflowLessonLab.vue`, only when `moduleSlug === 'attention-transformer'` and `section.id === 'transformer-block'`
- Module copy: update the `transformer-block` experiment prompt to name the challenge.

## Scenario Contract

Scenarios should be fixed and deterministic:

- `missing-residual`
- `missing-layernorm`
- `missing-ffn`
- `attention-only`

Each scenario carries:

- block steps,
- expected missing part or order issue,
- expected consequence category,
- evidence labels,
- bilingual teaching copy.

## Guardrails

- No backend, database, durable progress, route, checkpoint, or spine role changes.
- Keep `llm-rag` as `advanced-extension`.
- Do not build full generation, RAG, semantic NLP, or multi-head simulation.
- Keep existing `attentionStages` visible.

## Verification

Design phase:

- `node --test tests/curriculumMilestoneAudit.test.ts`
- `git diff --check`

Implementation phase:

- targeted helper/component tests,
- `npm test`,
- `npm run build`,
- `npm run build:pages`,
- browser check at desktop and mobile widths for `/learn/attention-transformer/transformer-block`.
