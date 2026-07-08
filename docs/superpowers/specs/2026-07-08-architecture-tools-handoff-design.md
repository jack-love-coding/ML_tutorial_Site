# Architecture-to-Tools Handoff Challenge Design

**Date:** 2026-07-08
**Phase:** 23
**Status:** Approved direction, design ready for review.

## Goal

Turn the final required `attention-transformer` chapter, `architecture-to-tools`, into a compact prediction/evidence task. Learners should connect common LLM tooling words back to the Transformer computation chain they just studied.

The task should answer:

> When a trace mentions tokenizer, attention mask, model blocks, or logits, which earlier architecture concept explains what happened?

## User-Facing Learning Loop

1. Choose a fixed trace scenario.
2. Predict the responsible tool object.
3. Predict the matching architecture concept.
4. Reveal deterministic evidence.
5. Read feedback that names the misconception.

## Scenario Set

| Scenario | Expected tool | Expected concept | Teaching point |
| --- | --- | --- | --- |
| `tokenizer-boundary` | tokenizer | token ids | Tokenization creates ids; it is not semantic understanding. |
| `mask-visibility` | attention mask | visibility | A mask blocks positions before attention probabilities form. |
| `block-hidden-state` | Transformer blocks/model | hidden-state update | Blocks update `[B,T,H]` representations while preserving shape. |
| `logits-ranking` | output head/logits | next-token scores | Logits are raw vocabulary scores used for next-token choice. |

## Architecture

Add a deterministic helper:

- `src/simulations/architectureToolsHandoffChallenge.ts`
- owns scenario records, safe input normalization, scoring, and evidence output.
- no Vue, DOM, network, tokenizer package, model call, or browser dependency.

Add one component:

- `src/components/ArchitectureToolsHandoffChallengeLab.vue`
- renders scenarios, prediction controls, evidence gate, trace evidence, and feedback.
- uses localized copy and follows the recent challenge component pattern.

Wire once:

```vue
<ArchitectureToolsHandoffChallengeLab
  v-if="props.moduleSlug === 'attention-transformer' && props.section.id === 'architecture-to-tools'"
/>
```

Keep `attentionStages` visible so the previous orientation card remains available.

## Data Contract

The helper should expose:

- scenario id union,
- tool part union,
- architecture concept union,
- localized trace rows,
- misconception copy,
- `evaluateArchitectureToolsHandoffChallenge(input)`.

Unknown scenario or prediction values must not throw; they should fall back to a default scenario and safe incorrect predictions.

## Files Expected In Runtime Implementation

- `src/simulations/architectureToolsHandoffChallenge.ts`
- `src/components/ArchitectureToolsHandoffChallengeLab.vue`
- `src/components/AppliedWorkflowLessonLab.vue`
- `src/styles/views/algorithm-shell.css`
- `src/data/attentionTransformerModule.ts`
- `tests/architecture-tools-handoff-challenge.test.ts`
- `tests/deep-learning-extension-modules.test.mjs`
- `docs/refactor/summaries/phase-23.md`
- `.planning/STATE.md`
- `tests/curriculumMilestoneAudit.test.ts`

## Non-Goals

- No backend, database, account, durable progress, or checkpoint persistence.
- No real tokenizer integration, model call, generation demo, RAG surface, chat UI, semantic NLP task, or full Transformer simulator.
- No route, curriculum role, checkpoint, or `llm-rag` placement changes.
- No `LessonPage` migration.
- No broad rewrite of `AppliedWorkflowLessonLab.vue`.

## Acceptance Criteria

- Learners predict both tool object and architecture concept before evidence is shown.
- Four scenarios cover tokenizer, attention mask, Transformer blocks/model, and logits.
- Evidence is deterministic and helper-derived.
- Existing Attention tools stage explanation remains visible.
- Routes, roles, checkpoints, and `llm-rag` advanced-extension status remain unchanged.
- Design PR passes `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check`.
- Runtime PR later passes targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks for `/learn/attention-transformer/architecture-to-tools`.

## Self-Review

- **Overdesign:** The design avoids real model/tool integration and keeps one helper, one component, one wiring point.
- **Quality:** It converts a static concept bridge into a prediction/evidence loop.
- **Coverage:** It targets the exact final required chapter gap identified after Phase 22.
- **Scope:** It preserves `llm-rag` as an advanced extension and does not add progress/backend work.
