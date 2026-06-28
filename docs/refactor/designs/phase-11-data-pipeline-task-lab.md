# Phase 11: Data Pipeline Task Lab Design

**Created:** 2026-06-28  
**Status:** Implemented and verified.

**Scope:** Upgrade one early data-first lesson into a task interaction for split/fit/transform order, leakage detection, and feature matrix shape.

## Context

Phase 9 made the Default Spine data-first:

1. `ai-overview`
2. `python-notebook`
3. `numerical-data`
4. `categorical-data`
5. `dataset-quality`

Phase 10 proved the right lesson-depth pattern on the sequence bridge: a narrow dedicated lab with deterministic simulation logic, targeted tests, and no backend/progress scope.

The next weak point is earlier in the route. Learners see feature vectors, scaling, categorical vocabularies, and data quality, but the most important evaluation boundary is still spread across several places:

- split before fitting;
- fit preprocessing rules only on training data;
- transform validation/test/new data with training rules;
- avoid target leakage and test-set feedback;
- understand the final model input shape `[B,F]`.

## Problem

The current Data Lab content explains these ideas, but the first data-first modules still make learners infer the workflow. Existing labs are useful but each focuses on one piece:

- `CleaningPipelineLab` toggles cleaning operations and table shape.
- `CategoricalEncodingLab` shows vocabulary and sparse vectors.
- `PandasPipelineLab` maps table operations to pandas-like transforms.

What is missing is a single task where the learner must choose a pipeline order and see whether the order is safe.

Without this, a learner can memorize "scale columns" and "one-hot categories" without understanding why `fit_transform` on all data is leakage.

## Chosen Landing Point

Use the existing required `numerical-data` module as the first implementation target.

Reasoning:

- It already introduces feature vectors and scaling.
- It appears before `categorical-data` and `dataset-quality` in the Default Spine.
- Its current concepts already say scaling parameters must be estimated from training data.
- Adding the task here gives later `categorical-data`, `dataset-quality`, `splits-generalization`, housing project, and classification project a shared foundation.

The lab should be attached to the `pandas-numeric-recipe` section or a small new `split-fit-transform` section inside `numerical-data`.

## Chosen Design

Add a dedicated `DataPipelineTaskLab.vue` backed by a deterministic helper such as `src/modules/data-lab/utils/pipelineTask.ts`.

The learner manipulates a small fixed workflow:

1. split rows into train/validation/test;
2. select allowed feature columns;
3. fit numeric scaler;
4. fit category vocabulary;
5. transform train/validation/test;
6. hand the final `[B,F]` matrix to the model.

The lab exposes two or three scenario presets rather than arbitrary drag-and-drop in the first version:

- **safe pipeline:** split first, fit preprocessing on train only, transform validation/test.
- **leaky scaler:** fit scaler before split or on all rows.
- **leaky vocabulary:** fit category vocabulary before split or include validation/test categories.

Each scenario displays:

- current step order;
- where each parameter was fit (`train` vs `all`);
- leakage status with a short reason;
- train/validation/test row counts;
- numeric feature count, categorical slot count, and final `[B,F]` matrix shapes;
- small code sketch showing the safe mental model.

## Interaction Shape

The task should be framed as:

**Predict first**  
If validation rows help compute the scaler mean, will validation score become more honest or more optimistic?

**Operate**  
Switch between safe pipeline, leaky scaler, and leaky vocabulary. Optionally toggle numeric columns and one categorical column.

**Observe**  
Read fit source, leakage warning, and final matrix shape.

**Explain**  
Explain why validation/test rows may be transformed but must not define preprocessing rules.

No durable progress persistence is added in Phase 11.

## Proposed Simulation Contract

```ts
export type PipelineScenarioId = 'safe' | 'fit-before-split' | 'vocab-on-all'

export interface DataPipelineTaskConfig {
  scenarioId: PipelineScenarioId
  includeRooms: boolean
  includePrice: boolean
  includeDistrict: boolean
}

export interface DataPipelineTaskSnapshot {
  scenarioId: PipelineScenarioId
  safe: boolean
  leakageReasons: string[]
  splitCounts: {
    train: number
    validation: number
    test: number
  }
  fitSources: {
    scaler: 'train' | 'all' | 'none'
    vocabulary: 'train' | 'all' | 'none'
  }
  featureCounts: {
    numeric: number
    categoricalSlots: number
    total: number
  }
  matrixShapes: {
    train: string
    validation: string
    test: string
  }
  codeLines: string[]
}
```

The helper should clamp/normalize config values and avoid DOM dependence so Node tests can cover all leakage states.

## Content Copy Boundaries

Add only the minimum required teaching copy:

- one new lab title and success criteria;
- a short section bridge if the existing `pandas-numeric-recipe` section is too broad;
- no broad rewrite of `numerical-data`;
- no new Data Lab module;
- no changes to `categorical-data` beyond optional future references.

Recommended bilingual lab title:

- zh-CN: `split / fit / transform 任务实验`
- en: `Split / Fit / Transform Task Lab`

Recommended success criteria:

- zh-CN: `能说明哪些步骤可以看验证/测试数据，哪些步骤只能从训练集学习。`
- en: `Explain which steps may see validation/test rows and which steps must learn from training only.`
- zh-CN: `能从最终 [B,F] shape 解释行数 B 和特征数 F 分别来自哪里。`
- en: `Explain where B and F in the final [B,F] shape come from.`

## Non-Goals

- Do not add backend, accounts, database, or durable progress tracking.
- Do not migrate all Data Lab modules.
- Do not replace the existing Data Lab schema.
- Do not build a general-purpose drag-and-drop workflow editor.
- Do not rewrite housing/classification projects.
- Do not add a new route.
- Do not treat this as a full sklearn Pipeline simulator.

## Acceptance Criteria

- The lab is available in `numerical-data` without breaking existing Data Lab routes.
- The safe scenario reports no leakage and shows train/validation/test matrix shapes.
- At least two unsafe scenarios report explicit leakage reasons.
- Feature shape counts change when numeric/category feature toggles change.
- The leakage and shape logic is tested outside Vue.
- Data Lab source wiring tests confirm the new lab is registered and rendered.
- Desktop and 390px mobile browser checks show no horizontal overflow and 0 console errors.
- `npm test`, `npm run build`, `npm run build:pages`, and Pages fallback generation pass.

## Files To Touch In Implementation

- `src/modules/data-lab/types/dataLab.ts`  
  Add `DataPipelineTaskLab` to `DataLabConfig['componentName']`.

- `src/modules/data-lab/utils/pipelineTask.ts`  
  Add deterministic scenario and shape calculation logic.

- `src/modules/data-lab/labs/DataPipelineTaskLab.vue`  
  Render the task interaction and readouts.

- `src/modules/data-lab/pages/DataLabModulePage.vue`  
  Register the async component.

- `src/modules/data-lab/data/modules.ts`  
  Add the lab to `numerical-data`, preferably near `pandas-numeric-recipe`.

- `src/styles/modules/data-lab.css` or the existing Data Lab style location  
  Add scoped class rules for the new lab surface.

- `tests/data-pipeline-task-lab.test.ts`  
  Cover safe/leaky scenarios, feature shape counts, and source wiring.

- `docs/refactor/summaries/phase-11.md`  
  Add after implementation and verification.

## Review Questions

1. Should Phase 11 land in `numerical-data` as the first feature-vector protocol, or in `splits-generalization` as the evaluation protocol?
2. Should the first version use scenario buttons, or do we want drag-and-drop ordering immediately?
3. Should category vocabulary be included in Phase 11, or should this phase focus only on numeric scaling leakage?

## Recommendation

Use `numerical-data`, scenario buttons, and include one categorical vocabulary toggle.

This gives learners the full mental model without overbuilding a workflow editor. It also creates a reusable pattern for a later `splits-generalization` or `classification-project` leakage lab.
