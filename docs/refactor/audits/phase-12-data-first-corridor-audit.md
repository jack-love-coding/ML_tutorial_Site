# Phase 12 Audit: Data-first Corridor

**Date:** 2026-07-06
**Status:** Audit complete.
**Scope:** `ai-overview` -> `python-notebook` -> `numerical-data` -> `categorical-data` -> `dataset-quality` -> `housing-price-project`, with `splits-generalization` and `classification-project` as downstream boundary checks.

## Executive Finding

The corridor has no P0 content blocker. The required route now teaches the core data-first ideas: task framing, notebook reproducibility, row/column/feature vocabulary, split-before-fit discipline, fixed category vocabularies, data-quality checks, and project review.

The main weakness is not missing pages. It is the shape of the middle route:

- `categorical-data` is conceptually strong, but its current lab is too broad for a required early module.
- `dataset-quality` teaches the right report idea, but its labs are still mostly observation surfaces rather than a data-quality decision record.
- `housing-price-project` is a good capstone, but it should more explicitly name which previous data-first skills the learner is expected to reuse.

Recommended Phase 13 target: **Categorical Vocabulary Contract Task Lab**.

## Severity Rules

- **P0:** Blocks honest completion of the next required module or project.
- **P1:** Learner can continue, but with likely confusion, vocabulary drift, or weak transfer.
- **P2:** Works today, but should be simplified, clarified, or deferred.

## Audit Matrix

| Module | Corridor role | Learner question | Current evidence | Gap type | Severity | Recommendation |
| --- | --- | --- | --- | --- | --- | --- |
| `ai-overview` | Orientation | What does it mean for a model to learn from data? | Training flow names problem, data, split, baseline, training, validation, testing, review in `src/data/aiOverviewModule.ts:356`; spine positions it before `python-notebook` in `src/curriculum/spine.ts:8`. | handoff | P1 | Keep content. Later add a short route bridge that says the next two modules turn "data" into concrete rows, columns, and notebook cells. Not Phase 13. |
| `python-notebook` | Notebook bridge | Can a learner run a small, reproducible split / fit / predict / metric workflow? | The sklearn mini-model uses `train_test_split`, `fit`, `predict`, and `mean_absolute_error` in `src/data/pythonNotebookModule.ts:281`; the handoff checklist names data source, `random_state`, features, target, training-only fit, metric meaning, and markdown observations in `src/data/pythonNotebookModule.ts:365`. | none | P2 | Keep. The module is a good bridge; no implementation needed now. |
| `numerical-data` | Feature construction | How does a table row become a stable numeric feature vector? | Objectives cover row/column/feature/label, semantic column typing, transforms, pandas shape audits, and prediction-time availability in `src/modules/data-lab/data/modules.ts:170`; the Phase 11 task lab is registered in `src/modules/data-lab/data/modules.ts:307` and renders leakage/shape decisions in `src/modules/data-lab/labs/DataPipelineTaskLab.vue:38`. | none | P2 | Keep as the current anchor. Avoid another numeric pipeline lab until categorical and quality close their task gaps. |
| `categorical-data` | Feature input contract | How do categories become fixed slots that survive validation, test, and serving? | Concepts cover category identity, vocabulary, one-hot, and feature crosses in `src/modules/data-lab/data/modules.ts:325`; quizzes ask about ID memorization, validation one-hot alignment, and cross dimensionality in `src/modules/data-lab/data/modules.ts:443`. | interaction, overdesign | P1 | Phase 13 should narrow the required interaction around vocabulary source, OOV/RARE handling, slot alignment, and `[B,F]` shape. Move cross/hash/multi-hot comparison to optional or advanced mode. |
| `dataset-quality` | Quality gate before projects | Can a learner turn EDA into a reviewable quality decision? | Objectives include representativeness, missingness, labels, imbalance, and quality reports in `src/modules/data-lab/data/modules.ts:456`; the quality-report section asks for a table of check, finding, treatment, and risk in `src/modules/data-lab/data/modules.ts:530`. | interaction | P1 | Next after categorical: add a decision-record task for one data issue. Current labs show risks, but do not force a written quality conclusion. |
| `housing-price-project` | First project validation | Can a learner reuse data-first skills in an end-to-end regression project? | The project route is explicit in `src/data/housingPriceProjectModule.ts:58`; split/fit/transform leakage is taught in `src/data/housingPriceProjectModule.ts:192`; evaluation and review require MAE, R2, error cases, and next experiments in `src/data/housingPriceProjectModule.ts:356`. | handoff | P2 | Keep. Later add a readiness checklist that maps project steps back to `python-notebook`, `numerical-data`, `categorical-data`, and `dataset-quality`. |
| `splits-generalization` | Downstream boundary | Does the later evaluation stage duplicate or extend early split/fit lessons? | The module formalizes train/validation/test roles, split strategies, fit-on-train rules, generalization gaps, and protocols in `src/modules/data-lab/data/modules.ts:591`. | none | P2 | Keep as later consolidation. Do not move Phase 13 here; Phase 11 already gave the early leakage task. |
| `classification-project` | Transfer boundary | Do categorical and quality ideas transfer to a classification project? | Text vectorization explicitly asks where the vocabulary was learned in `src/data/classificationProjectModule.ts:107`; the Pipeline baseline keeps `TfidfVectorizer.fit` inside training folds in `src/data/classificationProjectModule.ts:175`; threshold/cost review is covered in `src/data/classificationProjectModule.ts:259`. | none | P2 | Keep as transfer proof. It strengthens the case that Phase 13 should fix categorical vocabulary understanding first. |

## Overdesign And Simplification Risks

### P1: `CategoricalEncodingLab` teaches too many ideas at once

Evidence:

- The required lab exposes four modes: `one-hot`, `multi-hot`, `cross`, and `hash` in `src/modules/data-lab/labs/CategoricalEncodingLab.vue:23`.
- It carries three independent controls plus sample/readout panels in `src/modules/data-lab/labs/CategoricalEncodingLab.vue:323`.
- It also mounts a Three.js strip for sparse-vector bars in `src/modules/data-lab/labs/CategoricalEncodingLab.vue:214`, while the core learner question is not 3D.

Judgment: the content is useful, but as a required early module the lab asks learners to compare too many encoding families before proving the core contract: train vocabulary -> fixed slots -> unknown category policy -> aligned validation/test matrix.

Recommended change: keep the existing lab available, but Phase 13 should add or reshape a task-first path that starts with one required decision:

> Given train, validation, and new rows, where should the vocabulary come from and how should unknown categories be encoded?

### P1: `dataset-quality` needs a decision artifact, not only plot switching

Evidence:

- The module asks learners to write a quality report with checks, findings, treatment, and risk in `src/modules/data-lab/data/modules.ts:530`.
- `CleaningPipelineLab` toggles cleaning steps and displays shape/code/readouts in `src/modules/data-lab/labs/CleaningPipelineLab.vue:27`.
- `EdaWorkbenchLab` switches among chart modes and shows mean/median/code in `src/modules/data-lab/labs/EdaWorkbenchLab.vue:13`.

Judgment: the current labs visualize risks, but they do not require the learner to choose a finding, justify a treatment, or classify risk severity. That is acceptable after Phase 13, but it should be the next data-quality implementation slice.

### P2: project readiness is implicit

Evidence:

- `project-practice` lists housing and classification projects together in `src/curriculum/tracks.ts:73`.
- `housing-price-project` clearly presents the project route in `src/data/housingPriceProjectModule.ts:62`, but it does not open with a compact "reuse these prior skills" checklist.

Judgment: not blocking. The project chapters are strong, but a readiness checklist would reduce route confusion after the categorical and quality task gaps are addressed.

## Coverage Risks

No P0 coverage gap was found.

The highest-risk coverage area is categorical vocabulary transfer:

- `categorical-data` teaches fixed vocabularies and OOV handling.
- `housing-price-project` needs category vocabulary discipline for future project expansion.
- `classification-project` directly depends on the same idea for `TfidfVectorizer` vocabulary leakage.

If a learner leaves `categorical-data` thinking `get_dummies` or vectorization can be recomputed independently for each split, both project paths become fragile. This makes `categorical-data` the best Phase 13 target.

## Checkpoint Coverage

Spot check:

- `ai-overview-training-flow` asks why test-set tuning is invalid, and the training-flow chapter teaches the separation in `src/data/aiOverviewModule.ts:366`.
- `python-notebook-sklearn-split` asks split-before-fit, and the sklearn chapter teaches it in `src/data/pythonNotebookModule.ts:299`.
- `housing-project-leakage` asks why test uses `transform`, and the project chapter teaches it in `src/data/housingPriceProjectModule.ts:210`.
- `classification-project-vectorizer-leakage` asks why `TfidfVectorizer` belongs in `Pipeline`, and the project teaches it in `src/data/classificationProjectModule.ts:209`.
- Data Lab quizzes for numeric scaling, vocabulary source, label timing, and fit/transform all point back to taught sections in `src/modules/data-lab/data/modules.ts`.

Result: checkpoint coverage is acceptable. The next work should focus on task interaction shape, not quiz rewrites.

## Recommended Phase 13

**Name:** Categorical Vocabulary Contract Task Lab

**Target module:** `categorical-data`

**Goal:** Turn the required categorical lesson into a narrow task where learners predict and verify how training vocabulary, unknown categories, rare buckets, and fixed slot order determine the final feature matrix.

**Likely deliverables:**

- Deterministic categorical vocabulary task helper.
- Task lab or task-first branch in the existing categorical lab.
- Safe and unsafe scenarios:
  - train vocabulary with OOV handling;
  - validation/test recompute their own columns;
  - all-data vocabulary leakage;
  - high-cardinality ID expansion warning.
- Readouts for vocabulary source, OOV/RARE mapping, column alignment, sparse active slots, and `[B,F]`.
- Tests for vocabulary source, slot order, unknown handling, feature counts, and source wiring.

**Non-goals:**

- No backend, database, account, or durable progress work.
- No new route or schema migration.
- No broad rewrite of Data Lab.
- No general-purpose sklearn encoder simulator.
- No extra 3D work; the task should be clearer, not more decorative.

**Acceptance criteria:**

- Learner can distinguish training vocabulary from recomputed validation/test vocabulary.
- At least two unsafe scenarios produce explicit reasons.
- Unknown and rare categories map to stable slots.
- `[B,F]` changes are visible and consistent with selected categories.
- Existing `categorical-data` route remains available and bilingual.
- Core logic is tested outside Vue.

## Phase 14 Candidate

After categorical vocabulary is tightened, the next likely target is:

**Data Quality Decision Record**

Target: `dataset-quality`.

Goal: make learners choose one quality finding, one treatment, and one risk level from EDA/cleaning evidence before entering the housing project.

This should wait until Phase 13 because categorical vocabulary is earlier in the required corridor and directly affects both project boundaries.
