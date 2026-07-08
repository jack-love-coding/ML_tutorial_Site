# Phase 21 Summary: Attention Q/K/V Softmax Task

**Date:** 2026-07-08

## What Changed

- Added `src/simulations/attentionQkvChallenge.ts` for deterministic Q/K scaled dot-product scores, causal/padding masks, row-wise softmax, and weighted-value output.
- Added `src/components/AttentionQkvChallengeLab.vue` with bilingual prediction controls, an evidence gate, score/weight tables, weighted-value evidence, and feedback.
- Wired the challenge into `src/components/AppliedWorkflowLessonLab.vue` only for `attention-transformer` `softmax-weighted-sum`.
- Updated `src/data/attentionTransformerModule.ts` so the learner prompt points at the prediction/evidence task.
- Added `tests/attention-qkv-challenge.test.ts` and extended deep-learning source-token coverage.

## Self-Review

- Overdesign check: one helper, one component, one workflow conditional, no backend/progress/checklist work, no new module, no full Transformer simulator, no multi-head expansion, and no LessonPage migration.
- Quality check: the learner predicts top key and mask effect before seeing Q/K scores, row-wise softmax weights, and weighted V output.
- Coverage check: scenarios cover clean Q/K alignment, causal masking, padding masking, and weighted V mixture.
- Risk check: existing Attention stage explanation remains visible; routes and checkpoints are unchanged.

## Verification

- `node --test tests/attention-qkv-challenge.test.ts`: pass, 3 tests.
- `node --test tests/attention-qkv-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 12 tests.
- `npm test`: pass, 285 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- Browser check for `/learn/attention-transformer/softmax-weighted-sum`: pass with no horizontal overflow at 1280px or 390px, console errors 0, challenge renders, evidence reveal works, and existing Attention stage explanation remains visible.
