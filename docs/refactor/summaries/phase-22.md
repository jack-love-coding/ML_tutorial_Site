# Phase 22 Summary: Transformer Block Assembly Challenge

**Date:** 2026-07-08

## What Changed

- Added `src/simulations/transformerBlockAssemblyChallenge.ts` for deterministic Transformer block scenarios, prediction scoring, shape evidence, and role/consequence feedback.
- Added `src/components/TransformerBlockAssemblyChallengeLab.vue` with bilingual scenario controls, prediction radio groups, an evidence gate, block trace evidence, and feedback.
- Wired the challenge into `src/components/AppliedWorkflowLessonLab.vue` only for `attention-transformer` `transformer-block`.
- Updated `src/data/attentionTransformerModule.ts` so the learner prompt points at the block challenge.
- Added `tests/transformer-block-assembly-challenge.test.ts` and extended deep-learning source-token coverage.

## Self-Review

- Overdesign check: one helper, one component, one workflow conditional, no backend/progress/checklist work, no new module, no route or role change, no full Transformer simulator, no RAG surface, no generation demo, no multi-head expansion, and no LessonPage migration.
- Quality check: the learner predicts the missing block part and consequence before seeing block trace, shape invariant, and role evidence.
- Coverage check: scenarios cover residual, LayerNorm, FFN, and attention-only misconceptions.
- Risk check: existing Attention stage explanation remains visible; routes, roles, checkpoints, and `llm-rag` advanced-extension status are unchanged.

## Verification

- `node --test tests/transformer-block-assembly-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 12 tests.
- `npm test`: pass, 288 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- Browser desktop check on `/learn/attention-transformer/transformer-block`: challenge renders, evidence is hidden before the check action and visible afterward, existing Transformer block explanation remains visible, console errors 0, no horizontal overflow.
- Browser 390px mobile check on `/learn/attention-transformer/transformer-block`: challenge renders, evidence is hidden before check, existing Transformer block explanation remains visible, console errors 0, no horizontal overflow.
