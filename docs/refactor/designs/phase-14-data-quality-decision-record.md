# Phase 14: Data Quality Decision Record Design

**Created:** 2026-07-07
**Status:** Draft for review.

**Scope:** Design a narrow task interaction for the required `dataset-quality` module. The task should make learners turn EDA and cleaning evidence into one reviewable quality decision: issue, evidence, treatment, risk level, and project impact. This phase should not add backend, database, route migration, progress persistence, project readiness UI, or a broad EDA workbench rewrite.

## Context

The data-first corridor is now:

1. `ai-overview`
2. `python-notebook`
3. `numerical-data`
4. `categorical-data`
5. `dataset-quality`
6. `housing-price-project`

Phase 11 added a narrow split / fit / transform task lab for `numerical-data`.

Phase 13 added a narrow vocabulary-contract task lab for `categorical-data`.

Phase 12 already identified the next P1:

> `dataset-quality` teaches the right quality-report idea, but current labs mostly show observations. They do not force the learner to choose a finding, justify a treatment, or classify risk severity.

Phase 14 should close that gap before adding project readiness checklists. The housing project should receive a learner who can write a small, reviewable data-quality decision, not only click through charts.

## Problem

Current `dataset-quality` content is strong:

- `quality-before-modeling` asks students to list data issues before training.
- `missing-bad-duplicate` distinguishes missing, bad, duplicate, and outlier values.
- `labels-and-leakage` explains label timing and target leakage.
- `imbalance-and-baselines` explains baselines and task cost.
- `quality-report` explicitly asks for a table of check, finding, treatment, and risk.

The interaction gap is narrow:

- `EdaWorkbenchLab` switches chart modes and displays mean, median, and code.
- `CleaningPipelineLab` toggles cleaning steps and shows shape/profile changes.
- Neither lab requires one reviewable decision artifact.
- Learners can observe a missing value or outlier without saying whether to impute, drop, clip, keep, relabel, resample, or collect more data.
- The route handoff into `housing-price-project` still lacks a concrete quality gate.

## Chosen Landing Point

Attach a new narrow task lab near the `quality-report` section in `dataset-quality`.

Recommended structure:

1. Add a new `DataQualityDecisionRecordLab`.
2. Keep `EdaWorkbenchLab` for exploratory chart views.
3. Keep `CleaningPipelineLab` for cleaning-policy consequences.
4. Attach the new lab to the report/decision moment, not to every section.
5. Do not add project readiness checklist work in Phase 14.

This keeps Phase 14 focused on the missing decision artifact and avoids building another broad EDA surface.

## Teaching Contract

The task should answer one learner question:

> Given one data-quality signal, what decision should I record before modeling, and how risky is it if I proceed?

The learner should complete this loop:

- **Inspect:** Review a fixed evidence card from the teaching dataset.
- **Choose:** Select one issue type, one treatment, and one risk level.
- **Compare:** See how the choice affects shape, missingness, label reliability, or baseline interpretation.
- **Explain:** Write or read a compact decision statement that links the evidence to the housing-project handoff.

No durable task answer persistence is added in Phase 14.

## Scenario Set

Use small deterministic scenarios derived from the existing housing teaching table and data-quality concepts.

### 1. Missing Rooms

- Evidence: `rooms` has missing values.
- Risk: dropping all missing rows may shrink or bias the sample.
- Good decision: impute with a train-derived statistic or keep a missingness flag after checking concentration.
- Teaching point: missingness needs a mechanism, not reflexive deletion.

### 2. Duplicate Listing

- Evidence: repeated `id` appears in the table.
- Risk: duplicated rows can overweight one example in statistics and training.
- Good decision: deduplicate by stable record ID and record row-count impact.
- Teaching point: row count changes must be audit-visible.

### 3. Price Outlier

- Evidence: one price is far outside the teaching range.
- Risk: blind clipping or deletion can remove a real luxury segment.
- Good decision: flag, verify source, and only clip/drop with a documented rule.
- Teaching point: outlier is an interpretation problem before it is a cleaning step.

### 4. Label Timing

- Evidence: a feature or label is only known after the prediction moment.
- Risk: validation performance can look high because the model sees future information.
- Good decision: remove post-outcome signals from model inputs and record label availability.
- Teaching point: label and feature timing are data-quality decisions, not only model-evaluation details.

### 5. Imbalance Baseline

- Evidence: positive or target group is rare.
- Risk: accuracy can be dominated by the majority class.
- Good decision: record baseline, minority count, and metric implications before model comparison.
- Teaching point: class proportions change what "good score" means.

## Proposed Helper Contract

Add deterministic logic outside Vue so Node tests can verify the decision behavior.

```ts
export type DataQualityDecisionScenarioId =
  | 'missing-rooms'
  | 'duplicate-listing'
  | 'price-outlier'
  | 'label-timing'
  | 'imbalance-baseline'

export type DataQualityIssueType =
  | 'missingness'
  | 'duplicate'
  | 'outlier'
  | 'label-timing'
  | 'imbalance'

export type DataQualityTreatment =
  | 'impute'
  | 'deduplicate'
  | 'clip-or-flag'
  | 'remove-leaky-signal'
  | 'use-baseline-and-metrics'
  | 'collect-more-data'

export type DataQualityRiskLevel = 'low' | 'medium' | 'high'

export interface DataQualityDecisionConfig {
  scenarioId: DataQualityDecisionScenarioId
  selectedIssue: DataQualityIssueType
  selectedTreatment: DataQualityTreatment
  selectedRisk: DataQualityRiskLevel
}

export interface DataQualityDecisionSnapshot {
  scenarioId: DataQualityDecisionScenarioId
  expectedIssue: DataQualityIssueType
  recommendedTreatments: DataQualityTreatment[]
  recommendedRisk: DataQualityRiskLevel
  safe: boolean
  warnings: string[]
  evidence: {
    check: string
    finding: string
    affectedRows: number
    affectedColumns: string[]
    metric: string
  }
  impact: {
    beforeShape: string
    afterShape: string
    projectRisk: string
  }
  decisionRecord: {
    issue: string
    evidence: string
    treatment: string
    risk: string
    projectImpact: string
  }
  codeLines: string[]
}
```

The helper should normalize invalid configs:

- Unknown scenario falls back to `missing-rooms`.
- Unknown issue/treatment/risk falls back to the scenario recommendation.
- Comparisons are deterministic and independent of DOM, D3, or browser state.
- Shape, row-count, and evidence values should be derived from existing table utilities when practical.

## Implementation Guardrails

- Start with failing Node tests for helper behavior before building the Vue surface.
- Keep decision scoring and evidence derivation in `dataQualityDecisionTask.ts`; the Vue component should only compose state and render readouts.
- Reuse existing `housingTeachingTable`, `profileColumns`, `dropDuplicates`, `clipColumn`, and `tableShape` where useful.
- Do not add free-text persistence, account state, backend storage, or Progress V2 task records.
- Do not make this a general spreadsheet editor or arbitrary EDA query builder.
- Do not duplicate `EdaWorkbenchLab` chart switching or `CleaningPipelineLab` step toggles.
- Keep all options as explicit buttons/controls with readable labels and current state.

## Interaction Layout

Use the existing Data Lab card language and the restrained task style from Phases 11 and 13.

Recommended panels:

- Scenario buttons for missingness, duplicates, outlier, label timing, and imbalance.
- Evidence card showing check, finding, affected rows/columns, and a concrete metric.
- Decision controls for issue type, treatment, and risk level.
- Decision record preview with issue, evidence, treatment, risk, and project impact.
- Shape/impact readout when the treatment changes rows or columns.
- Short code sketch showing the check or treatment.
- Explicit status text: ready to record, under-risked, wrong issue, or risky treatment.

Recommended visual emphasis:

- Use text labels and risk tags, not color alone.
- Keep the table/record compact enough for 390px mobile.
- Prefer deterministic readouts over decorative charts.
- Surface why a wrong decision is risky, not only whether it is wrong.

## Bilingual Copy Boundaries

Add only the minimum new copy required for the task lab.

Suggested lab title:

- zh-CN: `数据质量决策记录`
- en: `Data Quality Decision Record`

Suggested success criteria:

- zh-CN: `能把一个 EDA 发现写成检查、发现、处理建议和风险等级。`
- en: `Turn one EDA finding into a check, finding, treatment, and risk level.`
- zh-CN: `能说明该质量决策如何影响后续房价项目建模。`
- en: `Explain how the quality decision affects the later housing project.`

Avoid rewriting the full `dataset-quality` body in Phase 14. If implementation needs a bridge sentence, add it near `quality-report` only.

## Files To Touch In Implementation

- `src/modules/data-lab/types/dataLab.ts`
  Add `DataQualityDecisionRecordLab` to `DataLabConfig['componentName']` as a minimal typed union extension.

- `src/modules/data-lab/utils/dataQualityDecisionTask.ts`
  Add deterministic scenario, evidence, treatment, risk, shape, warning, and decision-record logic.

- `src/modules/data-lab/labs/DataQualityDecisionRecordLab.vue`
  Render the task interaction and readouts.

- `src/modules/data-lab/pages/DataLabModulePage.vue`
  Register the async component.

- `src/modules/data-lab/data/modules.ts`
  Add the new lab to `dataset-quality`, preferably on the `quality-report` section.

- `src/styles/modules/data-lab.css`
  Add narrow styles for decision controls, evidence cards, risk tags, and mobile stacking.

- `tests/data-quality-decision-record-lab.test.ts`
  Cover scenario recommendations, wrong issue/treatment/risk warnings, shape impact, decision record output, and Data Lab source wiring.

- `docs/refactor/summaries/phase-14.md`
  Add after implementation and verification.

## Non-Goals

- Do not add backend, database, account, or durable progress behavior.
- Do not add new routes or migrate/replace the Data Lab schema.
- Do not rewrite all `dataset-quality` copy.
- Do not remove `EdaWorkbenchLab` or `CleaningPipelineLab`.
- Do not build a general-purpose EDA dashboard, pandas notebook, spreadsheet editor, or report builder.
- Do not add project readiness checklist work in this phase.
- Do not add more 3D or decorative interaction.
- Do not persist learner free text or add Progress V2 task notes in this phase.

## Acceptance Criteria

- `dataset-quality` remains reachable through the existing Data Lab route and canonical curriculum route.
- The new task is attached near the quality-report teaching moment.
- At least four quality scenarios are available, including missingness, duplicates, outlier, and label timing or imbalance.
- Each scenario exposes one evidence card, one recommended treatment set, and one recommended risk level.
- Wrong issue, risky treatment, or under-stated risk produce explicit reason text.
- The decision record preview includes issue, evidence, treatment, risk, and project impact.
- Shape or row-count impact is visible for treatments that change examples.
- Core logic is tested outside Vue.
- Data Lab source wiring tests confirm the lab is registered and lazy-loadable.
- Desktop and 390px mobile browser checks show no horizontal overflow and 0 console errors.
- If runtime code changes, run `npm test`, relevant targeted tests, `npm run build`, `npm run build:pages`, and Pages fallback generation.

## Review Questions

1. Should Phase 14 include five scenarios, or start with four to reduce implementation surface?
2. Should the risk control be `low/medium/high`, or `safe/watch/blocker` to make modeling readiness clearer?
3. Should label timing be included in the first implementation, or should Phase 14 stay with table-quality issues and defer label timing to `splits-generalization`?

## Recommendation

Add a new narrow `DataQualityDecisionRecordLab` with five scenarios, but keep the interaction to one decision record at a time.

Use `low/medium/high` risk labels because they match the report-writing language already present in `dataset-quality`. Include label timing in Phase 14 because the module already teaches label definition and leakage, and because the housing project handoff needs that decision before model training.
