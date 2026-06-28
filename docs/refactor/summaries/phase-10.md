# Phase 10 Summary: Sequence Bridge Shape Lab

**Status:** Implemented and verified.

## Goal

Upgrade one workflow-style lesson from explanatory stage switching into a real task interaction. The selected pilot is `sequence-embedding-bridge`, because its core learning objective is to trace token ids through embedding lookup, position/mask handling, and the handoff into Q/K/V.

## Delivered

- Added `src/simulations/sequenceBridgeLab.ts` for deterministic sequence shape and mask calculations.
- Added `src/components/SequenceBridgeShapeLab.vue` with controls for `B`, `T`, `H`, padding, mask mode, and query token.
- Replaced the sequence bridge branch in `AppliedWorkflowLessonLab.vue` with the dedicated shape lab.
- Added workflow styles for shape cards, mask visibility cells, controls, and mobile layout.
- Added `tests/sequence-bridge-lab.test.ts`.
- Updated the deep-learning extension module test to expect the dedicated sequence shape lab.
- Added the Phase 10 design record and implementation plan.

## Non-Goals Preserved

- No backend, database, or Progress V2 persistence.
- No migration of every workflow lab.
- No Attention/Transformer content rewrite.
- No new curriculum modules or routes.

## Verification

- `node --test tests/sequence-bridge-lab.test.ts`: pass, 3 tests.
- `node --test tests/sequence-bridge-lab.test.ts tests/deep-learning-extension-modules.test.mjs`: pass, 6 tests.
- `git diff --check`: pass.
- `npm test`: pass, 251 tests.
- `npm run build`: pass with the existing large-chunk warning.
- `npm run build:pages`: pass with the existing large-chunk warning.
- `node scripts/create-pages-fallbacks.mjs`: pass, 46 routes.
- Playwright `/learn/sequence-embedding-bridge/embedding-lookup`: desktop and 390px mobile render the shape lab, changing `T`, `H`, causal mask, and query index updates shapes and mask readouts, horizontal overflow is 0, console errors are 0. Dev-mode console warnings remain the existing Vite externalization warnings.
