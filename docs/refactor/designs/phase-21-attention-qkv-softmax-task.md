# Phase 21: Attention Q/K/V Softmax Task Design

**Created:** 2026-07-08
**Status:** Draft for review.
**Branch:** `codex/phase-21-attention-qkv-softmax-design`

## Decision

Phase 21 should add one narrow required-core task inside `attention-transformer`:

> Learners inspect a fixed query/key/value setup, predict which key a query will attend to, decide whether a mask changes the answer, and then compare their prediction with row-wise softmax and weighted-value evidence.

The task belongs in the existing `softmax-weighted-sum` chapter. It should improve Attention teaching depth without adding backend, database, durable progress, project readiness, new route inventory, or a broad `LessonPage` migration.

## Context

The required deep-learning route now ends at `attention-transformer`. Recent phases upgraded CNN and optimizer from stage-switch explanation into prediction/evidence tasks. Attention is the next weak point:

- `src/data/attentionTransformerModule.ts` already teaches token embeddings, Q/K/V projections, row-wise softmax, multi-head shapes, Transformer blocks, and LLM tooling.
- The `softmax-weighted-sum` chapter states the important formula, `A = softmax(S, dim=-1)` and `O = AV`, but the learner does not yet have to predict a row result.
- `src/components/AppliedWorkflowLessonLab.vue` renders Attention through `attentionStages` and `selectedAttentionStage`, which is useful orientation but not sufficient evidence of understanding.
- `src/modules/math-lab/utils/aiBridgeMath.ts` already includes attention-oriented math helpers for support material, but the required-core task should keep its deterministic challenge helper independent and testable.

## Goals

1. Make row-wise attention an active prediction task, not another stage switch.
2. Keep Q/K score, softmax weight, and V weighted sum connected in one small loop.
3. Teach masks as score-row constraints before softmax, not as a UI afterthought.
4. Make the distinction explicit: Q/K decide weights; V is the content being mixed.
5. Keep implementation narrow enough for one helper, one local component, one wiring point, focused tests, and summary/state docs.

## Non-Goals

- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not build a full Transformer simulator, LLM demo, RAG surface, or semantic NLP task.
- Do not model real language understanding; use fixed synthetic vectors and transparent token labels.
- Do not migrate `attention-transformer` into `LessonPage`.
- Do not rewrite `AppliedWorkflowLessonLab.vue` beyond one section-level conditional.
- Do not migrate Math Lab AI bridge content into required core.
- Do not introduce multi-head visualization in the first implementation slice.

## Teaching Contract

The learner question:

> For this query row, which key receives the highest attention after masking and softmax, and what value mixture becomes the output?

The task loop:

1. **Inspect:** Read one fixed scenario with visible token labels, selected query, keys, values, optional mask, and compact Q/K vectors.
2. **Predict:** Choose the top attended key before seeing the computed row.
3. **Mask Check:** Predict whether the mask changes the top key or removes a tempting key.
4. **Verify:** Reveal Q/K dot scores, masked scores, row-wise softmax weights, and the weighted value output.
5. **Explain:** Connect the evidence to "Q/K scores choose weights" and "V is mixed by those weights."

## Scenario Set

| Scenario | Visible Pattern | Expected Top Key | Mask Effect | Teaching Point |
| --- | --- | --- | --- | --- |
| `matching-key` | The query vector aligns most strongly with one key. | The aligned key. | No mask effect. | Q/K dot products create the attention ranking. |
| `causal-mask` | A future key has the largest raw score. | The best allowed past/current key. | The future key is removed before softmax. | Causal masks constrain the row before probabilities are formed. |
| `padding-mask` | A padding key has a tempting raw score. | The best non-padding key. | Padding is removed before softmax. | Masked tokens should not receive probability mass. |
| `value-mixture` | Two allowed keys split most of the probability. | The larger of the two weights. | No mask effect. | The output is a weighted sum of V rows, not a copy of Q or K. |

The first implementation should keep these scenarios deterministic and small, using two-dimensional or three-dimensional vectors that can be shown in a compact table.

## Helper Contract

Create a deterministic helper in `src/simulations/attentionQkvChallenge.ts`.

```ts
export type AttentionQkvScenarioId =
  | 'matching-key'
  | 'causal-mask'
  | 'padding-mask'
  | 'value-mixture'

export type AttentionMaskKind = 'none' | 'causal' | 'padding'

export interface AttentionQkvPrediction {
  topKeyId: string
  maskChangesTopKey: boolean
}

export interface AttentionQkvToken {
  id: string
  label: string
  query: number[]
  key: number[]
  value: number[]
  masked?: boolean
}

export interface AttentionQkvScenario {
  id: AttentionQkvScenarioId
  queryTokenId: string
  maskKind: AttentionMaskKind
  tokens: AttentionQkvToken[]
  expectedTopKeyId: string
  expectedMaskChangesTopKey: boolean
}

export interface AttentionQkvChallengeSnapshot {
  scenario: AttentionQkvScenario
  evidence: {
    rawScores: Array<{ keyId: string; score: number }>
    maskedScores: Array<{ keyId: string; score: number | null; masked: boolean }>
    weights: Array<{ keyId: string; weight: number; masked: boolean }>
    topKeyId: string
    rawTopKeyId: string
    rowWeightSum: number
    weightedValue: number[]
    valueContributions: Array<{ keyId: string; contribution: number[] }>
  }
  result: {
    topKeyCorrect: boolean
    maskEffectCorrect: boolean
    allCorrect: boolean
  }
}
```

Validation rules:

- Unknown scenario IDs fall back to `matching-key`.
- Unknown prediction values are normalized to safe incorrect defaults rather than throwing.
- Raw scores come from Q/K dot products scaled by `sqrt(d_k)`, matching the chapter formula.
- Masked scores use `null` for masked entries in public evidence instead of exposing `-Infinity` to the component.
- Softmax is computed row-wise over unmasked scores only.
- `rowWeightSum` should be approximately 1 for valid scenarios.
- `weightedValue` is derived from weights and value rows, not hard-coded in Vue.
- The helper is independent of Vue, DOM, D3, Three.js, TensorFlow, and browser APIs.

## Interaction Layout

Create `src/components/AttentionQkvChallengeLab.vue`.

Panels:

- Scenario selector with the four fixed patterns.
- Query/key/value table for the selected query row.
- Prediction controls for top key and mask effect.
- Evidence table for raw score, masked score, and softmax weight.
- Weighted-value panel showing the contribution of each unmasked V row.
- Feedback panel that explains why the selected top key and mask effect are correct or not.

The learner can change predictions at any time. There is no persistence and no required completion state in Phase 21.

## Wiring Choice

`attention-transformer` is currently rendered through `AppliedWorkflowLessonLab.vue`. The implementation should add one conditional inside the Attention branch:

```vue
<AttentionQkvChallengeLab
  v-if="props.moduleSlug === 'attention-transformer' && props.section.id === 'softmax-weighted-sum'"
/>
```

Keep the existing `attentionStages` stage list visible below or beside the challenge so the old explanatory surface remains available.

## Styling And Accessibility

- Use existing `algorithm-shell.css` and `workflow-lab` styling conventions.
- Keep visuals deterministic tables or SVG, not animated canvas.
- Use labels, legends, symbols, and text feedback; color cannot be the only signal.
- Use stable dimensions for matrices/tables and controls at desktop and 390px mobile widths.
- Add keyboard-usable scenario and prediction controls.
- Avoid negative letter spacing and viewport-scaled font sizes.
- Keep reduced-motion behavior simple: no required animation.

## Files To Touch In Implementation

- Create `src/simulations/attentionQkvChallenge.ts`.
- Create `src/components/AttentionQkvChallengeLab.vue`.
- Modify `src/components/AppliedWorkflowLessonLab.vue`.
- Modify `src/styles/views/algorithm-shell.css`.
- Optionally modify `src/data/attentionTransformerModule.ts` to make the `softmax-weighted-sum` experiment prompt point to the new prediction task.
- Add `tests/attention-qkv-challenge.test.ts`.
- Update `tests/deep-learning-extension-modules.test.mjs` only if source-token coverage should lock the new wiring.
- Update `.planning/STATE.md` and `docs/refactor/summaries/phase-21.md` after implementation.

## Acceptance Criteria

- The Attention `softmax-weighted-sum` chapter includes a prediction/evidence challenge.
- The task asks learners to choose the top key and mask effect before revealing evidence.
- Scenarios cover clean Q/K alignment, causal masking, padding masking, and weighted V mixture.
- Core score, softmax, mask, and weighted-value calculations are tested outside Vue.
- Existing Attention stage-switch explanation remains available.
- Existing spine, Topic Library roles, legacy routes, and checkpoint submissions remain intact.
- Runtime implementation PR runs targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks for `/learn/attention-transformer/softmax-weighted-sum`.

## Self-Review

- **Overdesign check:** This design adds one helper and one component. It rejects backend, durable progress, broad simulator work, route rewrites, new inventory, multi-head expansion, and `LessonPage` migration.
- **Quality check:** The learner must predict a concrete attention row and inspect computed evidence. This is stronger than clicking Attention stage tabs.
- **Coverage check:** The four scenarios map to the current module's Q/K/V, row-wise softmax, masking, and weighted-sum claims.
- **Risk check:** The only runtime integration point should be one conditional in `AppliedWorkflowLessonLab.vue`; this keeps blast radius smaller than moving the module architecture.

## Proposed Implementation Sequence

1. Add failing helper tests for the four scenarios and invalid learner predictions.
2. Implement `attentionQkvChallenge.ts`.
3. Add source tests for component tokens and `AppliedWorkflowLessonLab.vue` wiring.
4. Build `AttentionQkvChallengeLab.vue` with localized copy, tables/SVG evidence, prediction controls, and feedback.
5. Add responsive styles.
6. Update the `softmax-weighted-sum` experiment prompt.
7. Run targeted tests, full tests, builds, and browser checks.
