# Phase 15 Audit: Curriculum Architecture and Teaching Route

**Date:** 2026-07-07
**Status:** Completed.
**Scope:** Curriculum architecture, teaching route, module responsibility, coverage, and next implementation sequence. No runtime code changes.

## Executive Result

Phase 15 confirms the user's concern: the next valuable work is not another checklist or progress loop. The site now has a workable Curriculum V2 structure, but the remaining risk is curriculum governance:

- One legacy algorithm order still contradicts the approved spine.
- Topic Library modules are discoverable, but their route role is mostly implicit.
- Required-core interactions are uneven: Data-first and selected pilots are strong, while several workflow modules still behave like stage switchers.
- Neural-network foundations need a clearer required-depth decision for backpropagation and autodiff.
- Project readiness is a real improvement, but it is P2 behind route/source-of-truth and required-core content quality.

Recommended next direction: **Phase 16 should clean up route/source-of-truth conflicts and add explicit curriculum role metadata before adding new course material.**

## Evidence Base

- The approved core path is explicit in `src/curriculum/tracks.ts:10` and lists 24 module IDs in `src/curriculum/tracks.ts:19`.
- The learner-facing spine has 11 stages in `src/curriculum/spine.ts:7`, with stage-level questions, bridges, required modules, support lenses, project validation, and outcomes.
- The legacy algorithm module order still puts projects and advanced modules before loss, regression, classification, and MLP in `src/data/moduleCatalog.ts:21`.
- The homepage now presents route entries and support lenses in `src/views/HomeView.vue:176`, but it also still includes readiness checks in `src/views/HomeView.vue:349`.
- Only three algorithm modules are LessonPage pilots: AI Overview, Gradient Descent, and MLP in `src/lessons/labRegistry.ts:15`.
- Many workflow modules still use selectable stage buttons that show explanatory copy, for example housing in `src/components/AppliedWorkflowLessonLab.vue:454`, model selection in `src/components/AppliedWorkflowLessonLab.vue:498`, tree/forest in `src/components/AppliedWorkflowLessonLab.vue:520`, attention in `src/components/AppliedWorkflowLessonLab.vue:568`, and optimizer comparison in `src/components/AppliedWorkflowLessonLab.vue:590`.
- The sequence bridge is the positive counterexample: it asks for prediction, exposes controls, shows shapes/masks, and asks for reflection in `src/components/SequenceBridgeShapeLab.vue:151`.
- Data-first task depth has improved: split/fit/transform task wiring is in `src/modules/data-lab/data/modules.ts:307`, categorical vocabulary task wiring is in `src/modules/data-lab/data/modules.ts:438`, and data-quality decision-record wiring is in `src/modules/data-lab/data/modules.ts:577`.

## Catalog Facts

The current Curriculum V2 catalog has:

| Metric | Count |
| --- | ---: |
| Total modules | 53 |
| Algorithm modules | 17 |
| Math Lab modules | 31 |
| Data Lab modules | 5 |
| Required spine modules | 24 |
| Support-lens modules referenced by spine | 15 |
| Project-validation modules | 2 |
| Modules outside required/support/project relations | 16 |

The current tracks are:

| Track | Kind | Count | Source |
| --- | --- | ---: | --- |
| `core-learning-path` | `core` | 24 | `src/curriculum/tracks.ts:10` |
| `math-topic-library` | `topic-library` | 31 | `src/curriculum/tracks.ts:46` |
| `data-topic-library` | `topic-library` | 5 | `src/curriculum/tracks.ts:56` |
| `project-practice` | `project` | 2 | `src/curriculum/tracks.ts:72` |

## Module Responsibility Table

Each current catalog module is classified exactly once by primary responsibility.

| Module | Source | Primary responsibility | Notes |
| --- | --- | --- | --- |
| `ai-overview` | Algorithm | `required-core` | First shared language module. |
| `python-notebook` | Algorithm | `required-core` | Required orientation-to-code bridge; interaction can improve. |
| `numerical-data` | Data Lab | `required-core` | Data-to-feature start; includes Phase 11 task lab. |
| `categorical-data` | Data Lab | `required-core` | Required data-first module; also supports classification. |
| `dataset-quality` | Data Lab | `required-core` | Required data-first module; also supports classification and project work. |
| `beginner-linear-algebra` | Math Lab | `required-core` | Required math bridge before feature-space/loss. |
| `linear-algebra-feature-space` | Math Lab | `required-core` | Required feature-vector geometry. |
| `loss-functions` | Algorithm | `required-core` | Required model feedback contract. |
| `linear-regression` | Algorithm | `required-core` | First interpretable model. |
| `gradient-descent` | Algorithm | `required-core` | Training motion anchor and LessonPage pilot. |
| `logistic-regression` | Algorithm | `required-core` | Score-to-probability bridge. |
| `beginner-probability-distributions` | Math Lab | `required-core` | Required probability bridge before classification. |
| `probability-likelihood-entropy` | Math Lab | `required-core` | Required probability/loss/attention support. |
| `classification` | Algorithm | `required-core` | Thresholds and metrics. |
| `splits-generalization` | Data Lab | `required-core` | Evaluation protocol and leakage prevention. |
| `model-selection` | Algorithm | `required-core` | CV/model-selection workflow; interaction can improve. |
| `complexity-regularization` | Data Lab | `required-core` | Bias/variance and regularization bridge. |
| `tree-forest` | Algorithm | `required-core` | Nonlinear tabular model before neural networks. |
| `mlp` | Algorithm | `required-core` | Neural-network flagship and LessonPage pilot. |
| `optimizer-comparison` | Algorithm | `required-core` | Required before CNN/Attention; interaction can improve. |
| `tensor-shapes-vectorization` | Math Lab | `required-core` | Required for CNN and sequence/attention shape literacy. |
| `cnn-visualization` | Algorithm | `required-core` | Vision route entry. |
| `sequence-embedding-bridge` | Algorithm | `required-core` | Strong task lab before Attention. |
| `attention-transformer` | Algorithm | `required-core` | Spine endpoint; interaction is still weaker than sequence bridge. |
| `linear-algebra-distance-similarity` | Math Lab | `just-in-time-support` | Supports feature-space/loss and attention. |
| `linear-algebra-matrix-transformations` | Math Lab | `just-in-time-support` | Supports linear regression. |
| `least-squares-fitting` | Math Lab | `just-in-time-support` | Supports linear regression baseline explanation. |
| `calculus-derivatives-local-change` | Math Lab | `just-in-time-support` | Supports training motion. |
| `calculus-partial-derivatives-gradients` | Math Lab | `just-in-time-support` | Supports training motion. |
| `calculus-gradient-descent` | Math Lab | `just-in-time-support` | Supports training motion. |
| `calculus-sgd-batch-noise` | Math Lab | `just-in-time-support` | Supports training motion. |
| `training-diagnostics` | Math Lab | `just-in-time-support` | Supports generalization-selection. |
| `matrix-calculus-autodiff` | Math Lab | `just-in-time-support` | Supports neural-network foundations; may need promotion or route bridge. |
| `calculus-training-code-diagnostics` | Math Lab | `just-in-time-support` | Supports neural-network foundations. |
| `deep-architecture-math` | Math Lab | `just-in-time-support` | Supports neural-network foundations. |
| `housing-price-project` | Algorithm | `project-validation` | Linear-regression project validation; not a hard blocker. |
| `classification-project` | Algorithm | `project-validation` | Classification project validation; not a hard blocker. |
| `llm-rag` | Algorithm | `advanced-extension` | Keep outside required spine. |
| `svd` | Math Lab | `advanced-extension` | Useful for math deepening, PCA, numerical intuition. |
| `pca` | Math Lab | `advanced-extension` | Useful for dimensionality-reduction path. |
| `lu-decomposition` | Math Lab | `advanced-extension` | Numerical linear algebra extension. |
| `sparse-matrices` | Math Lab | `advanced-extension` | Implementation/numerical extension. |
| `condition-numbers` | Math Lab | `advanced-extension` | Numerical stability extension. |
| `markov-chains` | Math Lab | `advanced-extension` | Stochastic process extension. |
| `finite-difference-methods` | Math Lab | `advanced-extension` | Numerical methods extension. |
| `nonlinear-equations` | Math Lab | `advanced-extension` | Numerical methods extension. |
| `optimization` | Math Lab | `advanced-extension` | Deeper optimization beyond required training motion. |
| `linear-algebra-rank-null-space` | Math Lab | `reference-library` | Strong standalone LA topic; not currently route-bound. |
| `eigenvalues-eigenvectors` | Math Lab | `reference-library` | Strong standalone LA topic; not currently route-bound. |
| `calculus-functions-rate-change` | Math Lab | `reference-library` | Good precursor, but not attached to the spine. |
| `taylor-series` | Math Lab | `reference-library` | Useful deepening; not default-route required. |
| `monte-carlo` | Math Lab | `reference-library` | Useful sampling topic; not default-route required. |
| `calculus-optimizer-comparison` | Math Lab | `duplicate-or-overlap` | Overlaps required `optimizer-comparison`; needs role clarification. |

No existing catalog module is classified as `gap-placeholder`; gaps are represented in the coverage matrix because they describe missing or ambiguous capability depth rather than existing modules.

## Required-Core Teaching Quality

| Required module | Quality classification | Reason |
| --- | --- | --- |
| `ai-overview` | `solid` | LessonPage pilot plus protocol coverage. |
| `python-notebook` | `needs-interaction-upgrade` | Mostly notebook/cell workflow; useful but closer to guided walkthrough. |
| `numerical-data` | `solid` | Phase 11 task lab covers split/fit/transform and `[B,F]`. |
| `categorical-data` | `solid` | Phase 13 task lab covers vocabulary contract, OOV/RARE, slot alignment. |
| `dataset-quality` | `solid` | Phase 14 task lab covers decision records and risk feedback. |
| `beginner-linear-algebra` | `needs-copy-clarity` | Required role is correct, but route context should be explicit for beginners. |
| `linear-algebra-feature-space` | `needs-copy-clarity` | Strong topic, but needs route-aware framing into loss/model behavior. |
| `loss-functions` | `solid` | Strong required model-feedback module. |
| `linear-regression` | `solid` | Complete first-model anchor. |
| `gradient-descent` | `solid` | LessonPage pilot and interaction protocol. |
| `logistic-regression` | `needs-interaction-upgrade` | Good content, but threshold/probability task could be stronger. |
| `beginner-probability-distributions` | `needs-copy-clarity` | Needs tighter bridge from classical distribution to classifier outputs. |
| `probability-likelihood-entropy` | `needs-copy-clarity` | Strong support topic; required route placement should be justified in-page. |
| `classification` | `needs-interaction-upgrade` | Threshold/metric content should become a constrained challenge. |
| `splits-generalization` | `solid` | Required protocol is clear and Data Lab structure is consistent. |
| `model-selection` | `needs-interaction-upgrade` | Workflow currently uses stage switching rather than a selection challenge. |
| `complexity-regularization` | `needs-interaction-upgrade` | Needs clearer prediction/evidence task around overfit/underfit/regularization. |
| `tree-forest` | `needs-interaction-upgrade` | Stage cards teach concepts, but do not yet force split/depth/importance reasoning. |
| `mlp` | `solid` | LessonPage pilot with cockpit context. |
| `optimizer-comparison` | `needs-interaction-upgrade` | Required module still mostly workflow-stage explanation. |
| `tensor-shapes-vectorization` | `solid` | Required shape literacy is supported by a dedicated shape lab. |
| `cnn-visualization` | `needs-interaction-upgrade` | Rich visualization exists, but a required shape/parameter-count challenge should be explicit. |
| `sequence-embedding-bridge` | `solid` | Phase 10 task lab is a good model for required-core interaction. |
| `attention-transformer` | `needs-interaction-upgrade` | Still weaker than the sequence bridge; needs Q/K/V or attention-weight prediction task. |

## Coverage Matrix

| Band | Status | Coverage judgment | Highest priority action |
| --- | --- | --- | --- |
| A. Orientation | Adequate with P1 improvement | `ai-overview` is strong; `python-notebook` should become less walkthrough-like. | Upgrade notebook workflow later, not before route cleanup. |
| B. Data to features | Adequate | Phases 11-14 now cover pipeline order, vocabulary, quality decisions, and data-first reasoning. | Stop adding checklist surfaces here for now. |
| C. Feature space and loss | Adequate with P1 copy work | Required math/loss modules exist; need clearer route-aware copy for math support. | Add role/context metadata and page copy. |
| D. Linear models | Adequate with P1 interaction | Regression is strong; logistic/classification threshold work can be more task-like. | Schedule classification threshold challenge. |
| E. Training mechanics | Partial | Gradient descent is strong; optimizer comparison remains more explanatory. | Upgrade optimizer comparison into an experiment task. |
| F. Generalization | Partial | Split/generalization is acceptable; model selection and regularization need stronger challenges. | Add model-selection challenge after route cleanup. |
| G. Neural networks | Partial | MLP is strong; backprop/autodiff are support lenses while the stage wording claims they are central. | Decide whether to promote/autobridge `matrix-calculus-autodiff`. |
| H. Vision | Partial | CNN content is present; shape/parameter reasoning should become a constrained learner task. | Add CNN shape/parameter challenge. |
| I. Sequence and attention | Partial | Sequence bridge is strong; attention remains stage-switch explanation. | Add attention Q/K/V prediction task. |
| J. Projects | Adequate | Housing and classification projects are correctly treated as project validation. | Keep readiness checklist as P2. |
| K. Advanced applications | Adequate but implicit | LLM/RAG and advanced math are discoverable but need explicit "advanced extension" labeling. | Add route-aware role metadata before expanding. |

## Findings

### P0: Legacy algorithm order still contradicts the spine

The approved core route starts data-first and reaches Attention only after feature, loss, training, generalization, MLP, optimizer, tensor shape, CNN, and sequence bridge modules in `src/curriculum/tracks.ts:19`. However, the legacy algorithm order still places `housing-price-project`, `classification-project`, `cnn-visualization`, `attention-transformer`, `optimizer-comparison`, and `llm-rag` before `loss-functions`, `gradient-descent`, `linear-regression`, `logistic-regression`, `classification`, and `mlp` in `src/data/moduleCatalog.ts:21`.

Impact: any surface still consuming legacy `moduleOrder` can reintroduce the old route confusion even after `/spine` and `/tracks/core-learning-path` are correct.

Action: Phase 16 should make the curriculum spine/order the canonical source for learner-facing order and either realign or quarantine legacy `moduleOrder`.

### P1: Curriculum role is implicit outside the spine page

The spine has explicit required/support/project relationships in `src/curriculum/spine.ts:7`, but the Topic Library is mostly domain-filtered browsing. A learner opening a Math or Model library cannot reliably tell whether a module is required-core, just-in-time support, advanced, reference, or overlapping. `src/views/CurriculumLibraryView.vue` filters modules by domain but does not expose route role context.

Impact: Math Lab and Data Lab no longer dominate the top-level navigation, but individual library pages can still feel like parallel course products.

Action: add explicit `curriculumRole`/`spineUsage` metadata and render it in library/module cards.

### P1: Neural-network foundation depth is ambiguous

The neural-network stage question names backpropagation in `src/curriculum/spine.ts:201`, but only `mlp` and `optimizer-comparison` are required modules in `src/curriculum/spine.ts:211`. `matrix-calculus-autodiff` remains support in `src/curriculum/spine.ts:212`.

Impact: if the learning outcome is "understand how neural networks learn", backprop/autodiff may be under-specified unless MLP carries enough of that load. The route needs to decide whether autodiff is required, support, or a compact bridge inside MLP.

Action: Phase 17 should either promote `matrix-calculus-autodiff`, add a compact required backprop/autodiff bridge, or rewrite the neural-network stage outcome to match support-only depth.

### P1: Required-core interaction quality is uneven

Data-first modules now have task labs, and sequence bridge has a strong shape/mask lab. But several required algorithm modules still use the stage-switch pattern in `AppliedWorkflowLessonLab`: model selection, tree/forest, attention, optimizer, and some project/workflow surfaces. The stage-switch pattern is useful for explanation, but it is not enough for mastery evidence under the Phase 15 rubric.

Impact: learners may click through explanations without making a prediction, manipulating a causal variable, or explaining evidence.

Action: prioritize one required weak interaction at a time. Attention and optimizer comparison are higher leverage than project readiness.

### P1: Homepage still mixes route decision and readiness/progress framing

The homepage decision cards now correctly direct learners to spine, support lenses, projects, and progress in `src/views/HomeView.vue:176`. The readiness check section in `src/views/HomeView.vue:349` is not wrong, but it should not become the next major implementation direction.

Impact: if future phases keep expanding readiness mechanics, the homepage can drift back into meta-learning controls rather than course content.

Action: keep the current checks as lightweight copy for now. Do not expand them until route/source-of-truth and required-core content gaps are resolved.

### P2: Project readiness is useful but not a milestone driver

Housing and classification projects are correctly placed as project validation in `src/curriculum/spine.ts:89` and `src/curriculum/spine.ts:148`. Phase 12 already treated housing readiness as non-blocking. After Phases 13 and 14, a project readiness gate would be clearer, but it is still local polish compared with route governance and required-core quality.

Action: defer project readiness until after Phase 16 route metadata and at least one required-core interaction upgrade.

## Overdesign And Missing-Design Checks

| Area | Judgment | Detail |
| --- | --- | --- |
| Progress/checklist mechanics | Overdesign risk | They are useful supports, but not the next primary curriculum work. |
| Curriculum catalog | Appropriate | The adapter/read-model approach is still the right migration boundary. |
| Topic Library | Missing design | Needs route-role labels and stage relation context. |
| Legacy algorithm order | Missing cleanup | Still contradicts the canonical route. |
| Math Lab breadth | Appropriate but under-labeled | Broad content is valuable if clearly marked as support/reference/advanced. |
| Data-first corridor | Recently strengthened | Stop adding local data-first gates unless tied to a bigger route decision. |
| LessonPage migration | Appropriate restraint | Only three pilots are migrated; do not bulk migrate before weak modules have protocols. |

## Recommended Implementation Sequence

### Phase 16: Curriculum Role Metadata and Legacy Order Cleanup

Goal: make curriculum role and learner-facing order explicit everywhere.

Deliverables:

- Add typed curriculum role metadata or derived role helper.
- Realign or quarantine legacy algorithm `moduleOrder`.
- Render role badges/context in Topic Library cards and relevant route pages.
- Add tests proving spine order, project validation, advanced extensions, and library role labels stay consistent.

Why first: it removes the remaining structural contradiction before more content is added.

### Phase 17: Neural-Network Learning Mechanism Bridge

Goal: resolve the backprop/autodiff depth ambiguity in the required route.

Options to decide during design:

- Promote `matrix-calculus-autodiff` into required core.
- Add a compact backprop/autodiff bridge lesson inside `mlp`.
- Keep it support-only, but rewrite the neural-network stage outcome to avoid overclaiming.

Recommended default: add a compact required bridge inside the MLP/neural-network stage and keep the full Math Lab module as support.

### Phase 18: Attention Q/K/V Task Lab

Goal: upgrade the spine endpoint from stage explanation to a prediction/manipulation/evidence task.

Expected learner task:

- Predict which token attends to which token.
- Manipulate score scale, mask, or query token.
- Inspect softmax weights and output mixture.
- Explain one attention failure mode.

Why before RAG: Attention is the current spine endpoint; RAG remains advanced.

### Phase 19: Optimizer Or Model-Selection Challenge

Goal: upgrade one required workflow module that affects training/evaluation judgment.

Recommended choice: optimizer comparison if neural-network route quality remains the priority; model selection if generalization route quality becomes the priority.

### Phase 20: Project Readiness Gate

Goal: after the route and required-core weak points are addressed, add a narrow readiness gate to housing/classification projects.

Keep it local, front-end only, and explicitly tied to route prerequisites.

## Acceptance Check

- Every catalog module is classified once in the responsibility table.
- Every required-core module has a teaching quality classification.
- Every capability band A-K has adequate coverage, explicit gap, or deliberate non-goal.
- Findings cite local files.
- P0/P1/P2 priorities separate route/content blockers from local polish.
- No runtime code changed.
