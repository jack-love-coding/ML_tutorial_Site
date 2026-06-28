# Phase 10: Sequence Bridge Shape Lab Design

**Created:** 2026-06-27  
**Status:** Implemented and verified.

**Scope:** Upgrade the `sequence-embedding-bridge` workflow lab from static stage switching into an interactive shape and mask task.

## Problem

Phase 9 made the curriculum route coherent, but several workflow labs still behave like clickable summaries. The `sequence-embedding-bridge` module is the right first lesson-level depth target because its core learning task is concrete and testable:

- token ids have shape `[B,T]`;
- embedding lookup turns ids into `[B,T,H]`;
- position and mask make the sequence safe for attention;
- Q/K/V projections start from the resulting hidden states.

The existing lab explained these ideas with stage buttons, but learners could not manipulate the dimensions or observe mask effects.

## Chosen Design

Add a dedicated `SequenceBridgeShapeLab.vue` used only by the `sequence-embedding-bridge` workflow branch.

The lab exposes:

- controls for `B`, `T`, `H`, padding count, mask mode, and query token;
- shape readouts for `token_ids [B,T]`, `embedding table [V,H]`, `hidden states [B,T,H]`, `Q/K/V`, and attention scores;
- a visible/blocked mask row that changes with padding or causal masking;
- a prediction prompt and explanation prompt without adding progress persistence.

The shape and mask calculations live in `src/simulations/sequenceBridgeLab.ts` so the learning logic is testable outside the Vue component.

## Non-Goals

- Do not migrate every workflow lab.
- Do not add backend, database, or Progress V2 persistence.
- Do not rewrite the Attention/Transformer module.
- Do not add a new lesson-block schema.
- Do not replace the existing chapter text or checkpoints.

## Acceptance Criteria

- The sequence bridge lab is interactive, not only a stage switcher.
- Shape and mask behavior are covered by Node tests.
- Existing deep-learning module reachability and reference tests stay green.
- `/learn/sequence-embedding-bridge/embedding-lookup` renders on desktop and mobile without horizontal overflow.
- Build and Pages build continue to pass with only the existing large-chunk warning.

## Verification Result

- Targeted Node tests cover shape and mask behavior.
- Full project tests, production build, Pages build, and fallback route generation pass.
- Playwright verification on `/learn/sequence-embedding-bridge/embedding-lookup` confirms desktop and 390px mobile render the lab without horizontal overflow; changing `T`, `H`, mask mode, and query index updates the visible readouts; console errors remain 0.
