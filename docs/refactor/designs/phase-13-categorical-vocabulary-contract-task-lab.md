# Phase 13: Categorical Vocabulary Contract Task Lab Design

**Created:** 2026-07-06
**Status:** Draft for review.

**Scope:** Design a narrow task interaction for the required `categorical-data` module. The task should teach training vocabulary, unknown and rare category handling, fixed slot order, sparse active slots, and final `[B,F]` matrix shape. This phase should not add backend, database, route migration, progress persistence, or a broad Data Lab rewrite.

## Context

Phase 12 audited the data-first corridor:

1. `ai-overview`
2. `python-notebook`
3. `numerical-data`
4. `categorical-data`
5. `dataset-quality`
6. `housing-price-project`

The audit found no P0 blocker. It also found that `numerical-data` is now a strong anchor after the Phase 11 split / fit / transform task lab.

The highest-priority P1 is `categorical-data`. The module already teaches the right concepts and has good checkpoint coverage, but the current required lab asks learners to compare one-hot, multi-hot, feature crosses, hashing, rare buckets, OOV behavior, and sparse vectors all at once. That is useful as a broad comparison surface, but too wide for the first required categorical task.

Phase 13 should make one idea impossible to miss:

> The model input contract is learned from training data. Validation, test, and serving rows must transform into the same slots, with stable OOV and RARE behavior.

## Problem

Current `categorical-data` content has the core material:

- `vocabulary-contract` says the category set and slot order must be fixed during training.
- `one-hot-and-sparsity` says `get_dummies` infers columns from the current data by default and real workflows must align later rows.
- Quizzes ask whether validation should regenerate one-hot columns.
- Misconceptions warn that `get_dummies` alone is not enough.

The interaction gap is narrower:

- `CategoricalEncodingLab` starts as a mode-comparison lab, not a prediction task.
- The learner can click through one-hot, multi-hot, crosses, and hashing without first proving the train-vocabulary contract.
- The Three.js sparse strip makes the lab visually richer, but does not make the validation/test slot-alignment failure clearer.
- The required route needs a task that asks the learner to predict whether the same column index still means the same category.

## Chosen Landing Point

Attach the new task near the existing `vocabulary-contract` section in `categorical-data`.

Recommended structure:

1. Add a new narrow lab, `CategoricalVocabularyTaskLab`, attached to `vocabulary-contract`.
2. Keep `CategoricalEncodingLab` as the broader comparison lab for one-hot, multi-hot, crosses, and hashing.
3. Do not move or delete existing sections in Phase 13 unless implementation proves duplication is confusing.

This keeps the required concept first and avoids turning Phase 13 into a broad redesign of categorical feature engineering.

## Teaching Contract

The task should answer one learner question:

> If validation builds its own one-hot columns, does column 2 still mean the same thing the model learned during training?

The learner should complete this loop:

- **Predict:** Decide whether a scenario is safe before reading the answer.
- **Operate:** Switch scenarios and adjust a rare-category threshold or feature inclusion.
- **Observe:** Compare vocabulary source, slot map, OOV/RARE mapping, active sparse slots, and `[B,F]`.
- **Explain:** State why validation/test rows may be transformed but must not define the vocabulary or slot order.

No durable task answer persistence is added in Phase 13.

## Scenario Set

Use small deterministic rows rather than arbitrary uploaded data.

### 1. Safe Train Vocabulary

- Vocabulary source: train rows only.
- Validation/test/serving rows reuse the saved train slot order.
- Known categories map to their fixed slots.
- Low-frequency train categories map to `<RARE>`.
- Post-training categories map to `<OOV>`.
- The scenario is safe.

### 2. Validation Recomputed

- Validation rows build their own dummy columns.
- Slot names or order differ from training.
- The same column index may point to a different category.
- The scenario is unsafe because slot alignment is broken.

### 3. All-data Vocabulary

- Vocabulary is built from train + validation + test rows.
- Future categories appear in the schema during training.
- The scenario is unsafe because validation/test information leaks into preprocessing rules.

### 4. High-cardinality ID

- A record ID or similar identifier is included as a categorical feature.
- Feature count grows with little repeated evidence per category.
- The scenario is unsafe or warning-level depending on implementation wording.
- The point is memorization risk, not leakage.

## Proposed Helper Contract

Add deterministic logic outside Vue so Node tests can verify the teaching behavior.

Reuse the existing category helpers from `src/modules/data-lab/utils/tableTransforms.ts` where possible:

- `buildCategoryVocabulary`
- `resolveCategoryToken`
- `encodeOneHot`
- `activeSparseIndices`

Phase 13 should not duplicate the vocabulary sorting, rare bucket, OOV, or prototype-safe map behavior that is already tested for `CategoricalEncodingLab`.

```ts
export type CategoricalVocabularyScenarioId =
  | 'safe-train-vocab'
  | 'validation-recomputed'
  | 'all-data-vocab'
  | 'id-high-cardinality'

export interface CategoricalVocabularyTaskConfig {
  scenarioId: CategoricalVocabularyScenarioId
  includeDistrict: boolean
  includePropertyType: boolean
  includeRecordId: boolean
  rareThreshold: number
}

export interface CategoricalVocabularyTaskSnapshot {
  scenarioId: CategoricalVocabularyScenarioId
  safe: boolean
  warnings: string[]
  fitSource: 'train' | 'validation' | 'all'
  trainVocabulary: Array<{
    feature: 'district' | 'propertyType' | 'recordId'
    tokens: string[]
    rareValues: string[]
  }>
  transformRows: Array<{
    split: 'train' | 'validation' | 'test' | 'serving'
    raw: Record<string, string>
    mapped: Record<string, string>
    activeSlots: string[]
  }>
  featureCounts: {
    selectedFeatures: number
    categoricalSlots: number
    total: number
  }
  matrixShapes: {
    train: string
    validation: string
    test: string
    serving: string
  }
  slotAlignment: Array<{
    index: number
    trainSlot: string
    validationSlot: string
    aligned: boolean
  }>
  codeLines: string[]
}
```

The helper should normalize invalid configs:

- Clamp `rareThreshold` to a small integer range such as `1..3`.
- If all feature toggles are off, keep `district` on.
- Keep token maps safe for strings like `__proto__` and `constructor`, following existing category utility tests.
- Avoid DOM, browser, D3, or Three.js dependencies.

## Implementation Guardrails

- Start with failing Node tests for the helper contract before building the Vue surface.
- Keep feature logic in `categoricalVocabularyTask.ts`; the Vue component should only compose state and render readouts.
- Use a small fixed teaching dataset that contains at least one train rare category, one validation-only category, one test-only category, and one serving-only category.
- Treat `recordId` as an optional warning feature, not a default feature.
- Add only the smallest typed schema extension needed to register the lab component; do not replace or migrate the Data Lab module schema.
- Keep `CategoricalEncodingLab` reachable so cross/hash/multi-hot remain available as comparison material after the required vocabulary task.

## Interaction Layout

Use the existing Data Lab card language and restrained task style from Phase 11.

Recommended panels:

- Scenario buttons with explicit safety status.
- A compact train/validation/test/serving table.
- Vocabulary source and slot map.
- OOV/RARE mapping readout.
- Matrix shape readout for `[B,F]`.
- Short code sketch contrasting safe transform with unsafe recompute.

Recommended visual emphasis:

- Use text labels and slot names, not color alone.
- Mark unsafe scenarios with explicit reason text.
- Keep the primary graphic as a deterministic table or SVG strip; do not add more Three.js.
- Preserve mobile readability by stacking readouts and avoiding wide matrices.

## Bilingual Copy Boundaries

Add only the minimum new copy required for the task lab.

Suggested lab title:

- zh-CN: `词表契约任务实验`
- en: `Vocabulary Contract Task Lab`

Suggested success criteria:

- zh-CN: `能说明为什么验证、测试和线上样本必须复用训练词表与槽位顺序。`
- en: `Explain why validation, test, and serving examples must reuse the training vocabulary and slot order.`
- zh-CN: `能判断 OOV、RARE 和高基数 ID 对最终 [B,F] 的影响。`
- en: `Judge how OOV, RARE, and high-cardinality IDs affect the final [B,F] matrix.`

Avoid rewriting the full `categorical-data` body in Phase 13. If implementation needs a bridge sentence, add it near `vocabulary-contract` only.

## Files To Touch In Implementation

- `src/modules/data-lab/types/dataLab.ts`
  Add `CategoricalVocabularyTaskLab` to `DataLabConfig['componentName']` as a minimal typed union extension.

- `src/modules/data-lab/utils/categoricalVocabularyTask.ts`
  Add deterministic scenario, vocabulary, slot-alignment, warning, and shape logic while reusing existing category helpers.

- `src/modules/data-lab/labs/CategoricalVocabularyTaskLab.vue`
  Render the task interaction and readouts.

- `src/modules/data-lab/pages/DataLabModulePage.vue`
  Register the async component.

- `src/modules/data-lab/data/modules.ts`
  Add the new lab to `categorical-data`, preferably on the `vocabulary-contract` section.

- `src/styles/modules/data-lab.css`
  Add narrow styles for task controls, slot-map readouts, and mobile stacking.

- `tests/categorical-vocabulary-task-lab.test.ts`
  Cover safe/unsafe scenarios, OOV/RARE mapping, slot order, feature counts, matrix shapes, and source wiring.

- `docs/refactor/summaries/phase-13.md`
  Add after implementation and verification.

## Non-Goals

- Do not add backend, database, account, or durable progress behavior.
- Do not add routes or migrate/replace the Data Lab schema.
- Do not rewrite all Data Lab modules.
- Do not remove `CategoricalEncodingLab` in this phase.
- Do not duplicate existing vocabulary utility behavior unless a test proves the current utility cannot support the task.
- Do not build a general-purpose sklearn `OneHotEncoder` simulator.
- Do not add more 3D or decorative interaction.
- Do not implement the later `dataset-quality` decision record in this phase.

## Acceptance Criteria

- `categorical-data` remains reachable through the existing Data Lab route and canonical curriculum route.
- The new task is attached near the vocabulary-contract teaching moment.
- The safe scenario reports no leakage or alignment warning.
- At least two unsafe scenarios report explicit reasons.
- Unknown and rare categories map to stable slots.
- Validation recompute shows slot drift or missing/extra columns clearly.
- All-data vocabulary reports leakage from validation/test into preprocessing rules.
- High-cardinality ID inclusion reports memorization or sparsity risk.
- `[B,F]` changes are visible and consistent with selected categorical features.
- Core logic is tested outside Vue.
- Tests cover reuse of rare/OOV behavior rather than reimplementing a divergent vocabulary order.
- Data Lab source wiring tests confirm the lab is registered and lazy-loadable.
- Desktop and 390px mobile browser checks show no horizontal overflow and 0 console errors.
- If runtime code changes, run `npm test`, `npm run build`, `npm run build:pages`, and Pages fallback generation.

## Review Questions

1. Should Phase 13 add a new `CategoricalVocabularyTaskLab`, or fold the task-first path into `CategoricalEncodingLab`?
2. Should high-cardinality ID be an unsafe scenario in Phase 13, or a warning row deferred to the broader encoding lab?
3. Should rare-category threshold be the only numeric control, or should feature toggles be included in the first version?

## Recommendation

Add a new narrow `CategoricalVocabularyTaskLab` and keep the existing `CategoricalEncodingLab` as the optional broader comparison surface.

The first implementation should include scenario buttons, `district` / `propertyType` / `recordId` toggles, and a small `rareThreshold` control. That is enough to prove the categorical input contract without overbuilding another workflow editor.
