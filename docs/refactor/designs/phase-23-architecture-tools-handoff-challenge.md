# Phase 23 Design: Architecture-to-Tools Handoff Challenge

**Date:** 2026-07-08

## Problem

Phase 21 and Phase 22 made the required `attention-transformer` endpoint more active:

- `softmax-weighted-sum` now asks learners to predict a query row before seeing Q/K, mask, softmax, and V evidence.
- `transformer-block` now asks learners to identify missing block roles before seeing deterministic block-trace evidence.

The final required chapter, `architecture-to-tools`, is still mostly a static bridge. It names tokenizer, model, attention mask, and logits, but learners do not have to connect those tool objects back to the computation chain they just learned.

`llm-rag` remains an advanced extension, so Phase 23 should strengthen this required endpoint before moving into optional RAG diagnostics.

## Current-State Audit

- `attention-transformer` is still the last required Spine V1 module.
- `llm-rag` remains outside Spine V1 and has role `advanced-extension`.
- `attention-transformer -> architecture-to-tools` currently uses the shared `attentionStages` static focus card.
- The chapter already teaches the right objects: tokenizer, model, attention mask, and logits.
- The missing learning action is a concrete prediction/evidence loop that asks: "which tool object explains this trace, and which architecture concept does it correspond to?"

## Approaches Considered

### A. Architecture-to-tools mapping challenge

Add a narrow `ArchitectureToolsHandoffChallengeLab` to `attention-transformer -> architecture-to-tools`.

**Chosen.** This finishes the required Attention/Transformer spine endpoint with an active handoff task while preserving `llm-rag` as optional advanced content.

### B. RAG grounding diagnosis first

Add a `RagFailureDiagnosisChallengeLab` to `llm-rag -> rag-evaluation`.

**Deferred.** This remains valuable, but it improves advanced extension content before the required endpoint is solid.

### C. Route copy only

Rewrite the final chapter copy to clarify tokenizer, mask, logits, and model roles.

**Rejected for now.** Clearer copy helps, but it does not make the learner demonstrate the mapping from architecture evidence to tooling.

## Proposed Learning Task

Learners choose a fixed scenario and predict:

1. Which LLM tooling object is responsible: tokenizer, attention mask, Transformer blocks/model, or logits/output head.
2. Which architecture concept explains the evidence: token ids, visibility constraint, hidden-state update, or next-token scores.

After checking, the lab shows deterministic evidence:

- a compact request trace,
- shape or value evidence,
- the matching architecture concept,
- a misconception explanation.

The task should feel like reading a trace from a real LLM stack, not operating a real model.

## Scenarios

- `tokenizer-boundary`: the same human-visible word can produce multiple token ids; tokenizer is doing segmentation and id lookup, not semantic understanding.
- `mask-visibility`: a padding or future token is present in the sequence but blocked before attention weights are formed.
- `block-hidden-state`: `[B,T,H]` stays the same shape while Transformer blocks update token representations.
- `logits-ranking`: logits are raw vocabulary scores; next-token choice comes from ranking or softmax over those scores, not from Q/K/V directly.

## Runtime Scope

Create a deterministic helper in `src/simulations/architectureToolsHandoffChallenge.ts`.

Create `src/components/ArchitectureToolsHandoffChallengeLab.vue`.

Wire it into `src/components/AppliedWorkflowLessonLab.vue` only for:

```vue
props.moduleSlug === 'attention-transformer' && props.section.id === 'architecture-to-tools'
```

Update `src/data/attentionTransformerModule.ts` experiment prompt for `architecture-to-tools`.

Add focused tests:

- helper scenario coverage and scoring,
- invalid input normalization,
- component source tokens and wiring,
- milestone audit discoverability.

## Helper Contract

The helper should export stable scenario data and one evaluation function. Suggested public shape:

```ts
export type ArchitectureToolScenarioId =
  | 'tokenizer-boundary'
  | 'mask-visibility'
  | 'block-hidden-state'
  | 'logits-ranking'

export type ArchitectureToolPart =
  | 'tokenizer'
  | 'attention-mask'
  | 'transformer-blocks'
  | 'output-head-logits'

export type ArchitectureConcept =
  | 'token-ids'
  | 'visibility'
  | 'hidden-state-update'
  | 'next-token-scores'

export interface ArchitectureToolsPrediction {
  toolPart: string
  concept: string
}

export interface ArchitectureToolsScenario {
  id: ArchitectureToolScenarioId
  expectedToolPart: ArchitectureToolPart
  expectedConcept: ArchitectureConcept
  trace: Array<{ label: LocalizedText; value: string; role: LocalizedText }>
  misconception: LocalizedText
}
```

Validation rules:

- Unknown scenario IDs fall back to `tokenizer-boundary`.
- Unknown prediction values become safe incorrect values rather than throwing.
- Evidence is fixed and deterministic.
- No real model call, tokenizer package, network request, backend, database, or generation API is used.
- The helper is independent of Vue, DOM, D3, Three.js, TensorFlow, and browser APIs.

## Interaction Layout

Create `ArchitectureToolsHandoffChallengeLab.vue` with:

- scenario selector,
- request/tool trace cards,
- prediction radio groups for tool object and architecture concept,
- gated evidence reveal,
- feedback panel for the two predictions.

Keep the existing `attentionStages` stage list visible below or beside the challenge. The challenge should strengthen the final chapter without replacing the existing orientation card.

## Styling And Accessibility

- Use existing `algorithm-shell.css` and the recent challenge component styling pattern.
- Keep the UI as compact cards/tables, not animated canvas or a mock chat UI.
- Use labels and text feedback; color cannot be the only correctness signal.
- Use keyboard-usable scenario and prediction controls.
- Preserve mobile readability at 390px without horizontal overflow.
- Do not use viewport-scaled font sizes or negative letter spacing.

## Non-Goals

- No backend, database, account, durable progress, or checkpoint persistence work.
- No new route, new module inventory, or spine role change.
- Do not promote `llm-rag` into required core.
- Do not build a real tokenizer integration, model call, generation demo, RAG surface, chat UI, semantic NLP task, or full Transformer simulator.
- Do not migrate `attention-transformer` or `llm-rag` into `LessonPage`.
- Do not replace existing `attentionStages`; the challenge should sit before the existing stage explanation.

## Acceptance Criteria

- The task asks learners to predict the tooling object and architecture concept before evidence is shown.
- Scenarios cover tokenizer segmentation, attention mask visibility, block hidden-state updates, and logits/next-token scores.
- Evidence is deterministic and derived outside Vue.
- Existing Attention stage explanation remains visible.
- Routes, curriculum roles, checkpoints, and `llm-rag` advanced-extension status are unchanged.
- Design phase: `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check` pass.
- Runtime implementation phase: targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks for `/learn/attention-transformer/architecture-to-tools` pass.

## Self-Review

- **Overdesign check:** This remains one helper, one component, and one section-level wiring point. It rejects real model calls, tokenizer packages, RAG surfaces, chat UI, backend, progress persistence, and route changes.
- **Quality check:** The learner must map concrete trace evidence to both a tooling object and an architecture concept, which is stronger than clicking the tools stage card.
- **Coverage check:** The four scenarios map directly to the current chapter's tokenizer, attention mask, model/block, and logits claims.
- **Risk check:** The work stays in the required `attention-transformer` endpoint and does not change `llm-rag` role or curriculum placement.
