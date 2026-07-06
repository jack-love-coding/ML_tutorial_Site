# Phase 12: Data-first Corridor Audit Design

**Created:** 2026-07-06
**Status:** Draft for review.

**Scope:** Audit the required data-first corridor before adding more lesson interactions: `ai-overview` -> `python-notebook` -> `numerical-data` -> `categorical-data` -> `dataset-quality` -> `housing-price-project`, with `splits-generalization` and `classification-project` checked as downstream boundary modules.

## Context

Phase 9 made the Default Spine start with data-first foundations. Phase 10 proved the narrow task-lab pattern on the sequence bridge. Phase 11 then added the first early data pipeline task lab for split / fit / transform order, leakage detection, and `[B,F]` feature-shape reasoning.

The next risk is not implementation speed. The route now has enough structure that adding another lab too soon could hide a deeper curriculum problem: learners may still be missing the explicit handoffs between orientation, notebook work, feature construction, data quality, and the first project.

The user direction for this phase is clear:

- prioritize route clarity and content coverage;
- pause learning-loop and progress-tracking work until backend/database decisions are ready;
- inspect overdesigned surfaces and missing teaching steps before another implementation phase.

## Problem

The data-first route currently has strong individual modules, but the corridor may still fail as a coherent learner path.

Potential failure modes:

- a module assumes vocabulary introduced only later;
- the same concept appears with inconsistent names across copy, code, quiz, and lab;
- a checkpoint asks for reasoning that the module body or lab does not teach;
- an interaction is polished but does not force prediction, manipulation, evidence, or explanation;
- a project expects a pipeline habit that earlier required modules did not make explicit;
- support modules and projects are visible, but learners cannot tell what validates readiness.

Phase 12 should identify those gaps with evidence instead of jumping straight to fixes.

## Audit Corridor

Primary corridor:

1. `ai-overview`
2. `python-notebook`
3. `numerical-data`
4. `categorical-data`
5. `dataset-quality`
6. `housing-price-project`

Boundary checks:

- `splits-generalization`: verifies whether early data lessons prepare the later evaluation protocol.
- `classification-project`: verifies whether data-quality and categorical-feature ideas transfer to classification.

## Audit Questions

For each module in the corridor, answer:

1. What learner question does this module answer?
2. What prerequisite concept is assumed but not taught earlier in the corridor?
3. What concept is taught twice with different vocabulary?
4. Which checkpoint answer cannot be derived from the body, lab, or visual evidence?
5. Which interaction is decorative, overly broad, or missing a prediction/evidence loop?
6. Where do formula, code, table shape, feature shape, and lab labels diverge?
7. What should the learner be able to do at the next handoff?

## Audit Matrix

The execution phase should produce `docs/refactor/audits/phase-12-data-first-corridor-audit.md` with a matrix using these columns:

| Column | Purpose |
| --- | --- |
| Module | Canonical module ID and source file. |
| Corridor role | Orientation, notebook bridge, feature construction, quality gate, project validation, or boundary check. |
| Learner question | The one question this module must answer. |
| Required concepts | Concepts the next module or project relies on. |
| Current evidence | Sections, labs, quizzes, misconceptions, visuals, and code snippets that already teach the concept. |
| Gap type | `copy`, `concept`, `interaction`, `checkpoint`, `handoff`, `overdesign`, or `none`. |
| Severity | `P0` blocks corridor comprehension, `P1` causes avoidable confusion, `P2` is polish or future improvement. |
| Evidence path | File path and local section/module identifiers. |
| Recommendation | Fix now, defer, remove/simplify, or keep as-is. |
| Candidate phase | The smallest follow-up phase that should handle it. |

## Severity Rules

- **P0:** A required next module or project cannot be completed honestly from earlier taught material.
- **P1:** The learner can continue, but with likely misconception or vocabulary drift.
- **P2:** The content works, but copy, layout, or interaction quality can be improved later.

At least one finding must be recorded for every audited module. If no gap is found, record `none` with evidence.

## Grill Checks Before Fixing

Before selecting Phase 13, stress-test each recommendation:

1. Would removing this surface make the route clearer?
2. Is this actually a missing concept, or just wording that needs a bridge sentence?
3. Can a learner demonstrate the concept with existing labs?
4. Is this issue blocking the required route, or only a project refinement?
5. Can the next phase fix it without creating a new schema, route, or progress store?

## Non-Goals

- Do not rewrite lesson bodies during the audit.
- Do not add backend, database, accounts, or durable progress tracking.
- Do not add new modules, routes, or schemas.
- Do not migrate all Data Lab or Algorithm content into LessonPage.
- Do not implement Phase 13 fixes inside the audit PR.
- Do not expand the audit to the full math, deep-learning, or LLM/RAG route.

## Deliverables

- `docs/refactor/audits/phase-12-data-first-corridor-audit.md`
- Updated `.planning/STATE.md` with the reviewed next implementation recommendation.
- Updated `.planning/ROADMAP.md` if the audit changes Phase 13 ordering.
- Optional targeted test update only if the audit changes documentation invariants already covered by tests.

## Acceptance Criteria

- The audit covers all primary corridor modules and the two downstream boundary checks.
- Every row cites local evidence paths instead of broad impressions.
- Every audited module has at least one explicit gap or an explicit `none` finding.
- The audit identifies at least one overdesign/simplification risk and at least one coverage/handoff risk, unless evidence proves neither exists.
- The audit recommends one narrow Phase 13 implementation target with non-goals and acceptance criteria.
- No runtime code, routes, schemas, or progress storage are changed in Phase 12.
- `git diff --check` passes.
- A targeted documentation/audit test is run if test-covered planning invariants change.

## Recommended Starting Hypothesis

The likely Phase 13 target should come from one of these areas, but the audit must decide with evidence:

- `categorical-data`: vocabulary locking, unknown categories, sparse slots, and column alignment may need a tighter task loop.
- `dataset-quality`: EDA, missingness, labels, and outliers may need a clearer decision record before project work.
- `housing-price-project`: the project may need an explicit "what earlier lessons should you reuse?" bridge instead of more project UI.

The preferred next implementation should be the smallest change that makes the data-first corridor easier to follow.
