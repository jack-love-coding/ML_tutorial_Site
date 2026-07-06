# Phase 15 Design: Curriculum Architecture and Teaching Route Audit

**Status:** Draft for review.
**Scope:** Documentation and curriculum audit design only.
**Branch:** `codex/phase-15-curriculum-architecture-design`

## Problem

The next risk is not another readiness checklist. The project has already unified a large amount of structure through Curriculum V2: catalog adapters, routes, navigation, Progress V2, the homepage decision surface, the spine page, LessonPage pilots, and several data-first task labs.

The remaining problem is higher level:

- The site still needs one defensible teaching route, not a sequence of local fixes.
- Each domain needs a clear teaching responsibility: core route, support lens, project validation, advanced extension, or archive candidate.
- Content coverage must be judged against the intended ML learning outcome, not against whichever module currently has the newest lab.
- Checklist and progress mechanics must support the route, not become the route.

## Current Evidence

Local code and planning docs already show the issue:

- `docs/refactor.md` classifies the original route confusion as P0: parallel Math Lab, Data Lab, and Algorithm information architectures plus conflicting module order.
- `src/curriculum/tracks.ts` now defines a 24-module `core-learning-path`.
- `src/curriculum/spine.ts` expands that path into 11 learner-facing stages.
- `src/data/moduleCatalog.ts` still keeps a legacy algorithm order where projects and advanced deep-learning modules can appear before loss, regression, classification, and MLP.
- `src/views/HomeView.vue` now acts as a decision surface, but still contains readiness/progress framing that should be checked against the higher-level teaching route.
- The current catalog has 53 modules:
  - 17 Algorithm modules.
  - 31 Math Lab modules.
  - 5 Data Lab modules.
  - 24 required spine modules.
  - 16 modules outside required spine, support lenses, and project validation.

This means the next phase should audit architecture and content responsibility before adding another task surface.

## Goals

1. Define the intended teaching route in terms of learner capability, not UI sections.
2. Classify every current module by responsibility.
3. Identify missing, duplicated, shallow, or misplaced content.
4. Decide which interactions deserve upgrade because they affect core understanding.
5. Produce a prioritized implementation sequence for the next content-quality phases.

## Non-Goals

- Do not implement new runtime UI.
- Do not add Progress V2 fields, backend, database, accounts, or cloud sync.
- Do not add a housing-project readiness checklist in this phase.
- Do not rewrite all Math Lab, Data Lab, or Algorithm lesson bodies.
- Do not delete, redirect, or deprecate old routes.
- Do not migrate all modules into `LessonPage`.
- Do not add new course inventory before the audit proves the gap.

## Audit Inputs

Required inputs:

- `docs/refactor.md`
- `docs/refactor/curriculum-v2-brief.md`
- `.planning/PROJECT.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/codebase/*`
- `src/curriculum/catalog.ts`
- `src/curriculum/tracks.ts`
- `src/curriculum/spine.ts`
- `src/curriculum/routeManifest.ts`
- `src/data/navigationMenus.ts`
- `src/views/HomeView.vue`
- `src/views/CurriculumSpineView.vue`
- `src/views/CurriculumLibraryView.vue`
- `src/views/CurriculumTrackView.vue`
- `src/data/moduleCatalog.ts`
- `src/data/*Module.ts`
- `src/modules/math-lab/data/modules.ts`
- `src/modules/math-lab/data/*Module.ts`
- `src/modules/data-lab/data/modules.ts`
- Phase summaries and audits from Phases 1 through 14.

## Module Responsibility Model

Classify every catalog module into exactly one primary responsibility:

| Responsibility | Definition |
| --- | --- |
| `required-core` | Required to complete the default ML learning route. |
| `just-in-time-support` | Optional support lens attached to a specific core stage. |
| `project-validation` | Capstone or applied validation after prerequisite concepts. |
| `advanced-extension` | Useful after the spine endpoint, not required for the first complete route. |
| `reference-library` | Good standalone topic, but not currently tied to route progression. |
| `duplicate-or-overlap` | Overlaps another module enough that learners may see the same concept twice without a clear reason. |
| `gap-placeholder` | A required capability is named by the route, but no adequate teaching module exists yet. |

The audit should not treat `reference-library` as a failure. It becomes a failure only when a reference module is presented as required without a clear learner outcome.

## Coverage Matrix

Audit the route against these capability bands:

| Band | Learner capability | Current likely sources |
| --- | --- | --- |
| A. Orientation | Explain input, target, prediction, error, model, feedback, and generalization. | `ai-overview`, `python-notebook` |
| B. Data to features | Turn rows and columns into numeric/category features with safe split, fit, transform behavior. | `numerical-data`, `categorical-data`, `dataset-quality`, `splits-generalization` |
| C. Feature space and loss | Connect vectors, distance, residuals, and loss to model feedback. | `beginner-linear-algebra`, `linear-algebra-feature-space`, `loss-functions` |
| D. Linear models | Explain linear regression, logistic regression, thresholds, and first baselines. | `linear-regression`, `logistic-regression`, `classification` |
| E. Training mechanics | Explain gradients, learning rate, batch noise, optimizer state, and training diagnostics. | `gradient-descent`, `optimizer-comparison`, selected calculus/math modules |
| F. Generalization | Diagnose leakage, overfitting, underfitting, regularization, validation, and model selection. | `splits-generalization`, `model-selection`, `complexity-regularization`, `training-diagnostics` |
| G. Neural networks | Explain MLP forward pass, hidden representation, activation, backprop, and autodiff at the required depth. | `mlp`, `matrix-calculus-autodiff`, `deep-architecture-math` |
| H. Vision | Trace image tensors, convolution, pooling, receptive field, and CNN behavior. | `tensor-shapes-vectorization`, `cnn-visualization` |
| I. Sequence and attention | Trace token ids, embeddings, masks, Q/K/V, attention weights, and Transformer blocks. | `sequence-embedding-bridge`, `attention-transformer` |
| J. Projects | Apply the route in housing and classification projects after prerequisites are available. | `housing-price-project`, `classification-project` |
| K. Advanced applications | Keep LLM/RAG and advanced math discoverable without making them default-route blockers. | `llm-rag`, SVD/PCA/stability/sampling modules |

For each band, record:

- Required concepts.
- Current modules.
- Missing concepts.
- Duplicated or conflicting teaching.
- Interaction quality.
- Checkpoint quality.
- Recommended next action.

## Teaching Quality Rubric

For each required-core module, inspect whether it has:

1. A concrete learner question.
2. Clear prerequisites and next step.
3. A prediction prompt before the main lab or example.
4. A manipulable experiment or worked example tied to the concept.
5. Consistent variables across formula, code, visual, lab, and checkpoint.
6. Feedback that explains cause, not only correct or incorrect.
7. A misconception or failure-mode section.
8. Bilingual copy that preserves terms and variables.
9. Mobile-readable layout or a fallback.
10. A reason why the module sits at its current point in the route.

Classify each module as:

- `solid`
- `needs-copy-clarity`
- `needs-interaction-upgrade`
- `needs-route-repositioning`
- `needs-content-expansion`
- `candidate-for-support-only`

## Interaction Quality Levels

Use the existing `docs/refactor.md` interaction ladder:

| Level | Meaning | Core-course suitability |
| --- | --- | --- |
| 1 | Toggle, tab, expand, or switch explanation. | Navigation only. |
| 2 | Animation or video playback. | Intuition support. |
| 3 | Manipulate variables and observe result changes. | Basic lab. |
| 4 | Complete a constrained challenge with success criteria. | Core learning activity. |
| 5 | Submit explanation/evidence and receive diagnosis. | Mastery assessment. |

The audit should flag any required-core module whose main interaction stays at Level 1 or 2 without a stronger worked example, challenge, or checkpoint.

## Seed Findings to Verify

These are hypotheses, not final audit conclusions:

1. The legacy algorithm `moduleOrder` still conflicts with the approved spine order.
2. Backpropagation and autodiff may be underweighted if they remain only support material while the route claims to teach neural-network foundations.
3. Math Lab contains strong advanced material, but many modules need clearer "when to use this" placement.
4. Data-first route depth improved in Phases 11 through 14, but project readiness should remain a later local enhancement.
5. Topic Library pages are useful catalogs, but may need route-aware context so learners know whether a topic is required, support, or advanced.
6. Some workflow-style labs may still be explanation switchers rather than causal experiments.
7. LLM/RAG should remain an advanced extension unless the route goal changes.

## Deliverables

Phase 15 execution should produce:

- `docs/refactor/audits/phase-15-curriculum-architecture-teaching-route-audit.md`
- A full 53-module responsibility table.
- A coverage matrix for capability bands A through K.
- A prioritized list of content gaps, route conflicts, weak interactions, and overdesigned surfaces.
- A proposed implementation sequence for the next 3 to 5 phases.
- Updates to `.planning/STATE.md` and `.planning/ROADMAP.md` with the approved next direction.

## Acceptance Criteria

- Every catalog module is classified exactly once by primary responsibility.
- Every required-core module is scored with the teaching quality rubric.
- Every capability band has at least one of: adequate coverage, explicit gap, or deliberate non-goal.
- Findings cite local files or prior phase docs as evidence.
- The audit distinguishes P0 route/content blockers from P1 quality improvements and P2 local polish.
- The next implementation sequence prioritizes teaching route clarity and content quality over checklist/progress mechanics.
- No runtime code changes are included.
- `git diff --check` passes.

## Proposed Next Implementation Order

The audit should decide the final order, but the likely follow-up sequence is:

1. Fix P0 route/order conflicts if any current navigation or module order still contradicts the approved spine.
2. Strengthen missing required-core teaching content, especially if backprop/autodiff or model diagnostics are under-specified.
3. Upgrade weak required-core interactions from explanation switching to prediction/manipulation/evidence tasks.
4. Add route-aware context to Topic Library modules so support and advanced modules do not look like parallel starting points.
5. Revisit project readiness only after the route and core content gaps are resolved.
