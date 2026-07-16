# Roadmap: ML Atlas Curriculum V2

**Created:** 2026-06-25
**Milestone Goal:** Build a unified curriculum model, routes, progress, homepage IA, and lesson-rendering path without breaking existing content, URLs, or local progress.

## Phase 1: Unified Curriculum Contract

**Goal:** Create a catalog read model that adapts Algorithm, Math Lab, and Data Lab content into one typed curriculum contract.

**Deliverables:**
- `src/curriculum/types.ts`
- `src/curriculum/catalog.ts`
- `src/curriculum/tracks.ts`
- `src/curriculum/prerequisites.ts`
- `src/curriculum/validation.ts`
- `src/curriculum/adapters/algorithmAdapter.ts`
- `src/curriculum/adapters/mathLabAdapter.ts`
- `src/curriculum/adapters/dataLabAdapter.ts`
- `tests/curriculumCatalog.test.ts`
- `tests/curriculumPrerequisites.test.ts`
- `tests/curriculumLocalization.test.ts`

**Must Not Do:**
- Do not change homepage behavior.
- Do not move all lesson body content.
- Do not change routes or progress storage.

**Exit Criteria:**
- Catalog lists current modules with unique canonical IDs, source mappings, domains, levels, localized title/summary, estimated minutes, prerequisites, outcomes, and lesson references.
- Prerequisite validation catches missing IDs and cycles.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Phase 2: Routing and Navigation Unification

**Goal:** Introduce canonical curriculum routes and catalog-derived navigation while preserving legacy URLs.

**Deliverables:**
- Canonical `/learn/:moduleId` and `/learn/:moduleId/:lessonId` route support.
- Legacy redirect or direct-support table for `/math-lab/*`, `/data-lab/*`, and bespoke chapter routes.
- Navigation groups derived from curriculum track/domain/project metadata.
- Route and navigation tests.

**Must Not Do:**
- Do not modify progress storage.
- Do not delete legacy route handlers until tests prove compatibility.

**Exit Criteria:**
- Existing deep links remain reachable.
- Navigation presents Learning Path, Topic Library, Projects, and Progress structure.
- GitHub Pages build passes.

## Phase 3: Progress V2

**Goal:** Merge three v1 progress stores into an idempotent unified progress model.

**Deliverables:**
- `LearningProgressV2` type and storage wrapper.
- v1 reader/normalizer/merger/migration marker.
- Continue-learning selector using canonical lesson IDs.
- Migration tests for missing stores, corrupted JSON, duplicate runs, and conflict behavior.

**Must Not Do:**
- Do not delete v1 storage keys.
- Do not require backend storage.

**Exit Criteria:**
- Same v1 input always produces the same v2 output.
- v1 data remains intact after migration.
- Continue-learning can cross Algorithm, Math Lab, and Data Lab.

## Phase 4: Homepage and Information Architecture

**Goal:** Turn homepage into a decision surface instead of a full mixed catalog.

**Deliverables:**
- First screen with start, continue, and recommended next lesson.
- Route choices for core path, deep-learning path, math deepening, projects, and topic library.
- Unified progress summary.
- Mobile and bilingual layout checks.

**Must Not Do:**
- Do not rewrite lesson body content.
- Do not change lab internals.

**Exit Criteria:**
- A new student can identify first step, current stage, and why the next lesson matters.
- Homepage no longer duplicates a contradictory long learning path.

## Phase 5: LessonPage and Block Renderer

**Goal:** Create a generic lesson skeleton and renderer proven by three pilot modules.

**Deliverables:**
- `src/lessons/LessonPage.vue`
- `src/lessons/LessonBlockRenderer.vue`
- Lab registry for complex existing components.
- Adapter blocks for AI Overview, Gradient Descent, and MLP.
- Parity tests for pilot modules and route behavior.

**Must Not Do:**
- Do not migrate every course.
- Do not force complex labs into weak generic blocks.

**Exit Criteria:**
- Pilot modules follow "problem -> prediction -> intuition -> example -> formula -> lab -> reflection -> checkpoint -> next step".
- Old module pages remain usable for non-pilot modules.

## Phase 6: Teaching Interaction Protocol

**Goal:** Standardize what counts as an effective core-course interaction.

**Deliverables:**
- Protocol fields for learning goal, prediction prompt, manipulable variables, observable metrics, success criteria, reflection prompt, and evidence.
- Pilot upgrades for selected labs such as Gradient Descent, data split/fit/transform, classification threshold, CNN shape, Attention, or RAG.
- Tests for protocol completeness and evidence shape.

**Must Not Do:**
- Do not bulk-redesign all labs.
- Do not promote static tab switches as mastery evidence.

**Exit Criteria:**
- Core pilot interactions require prediction and explanation, not only clicking tabs.
- Checkpoints can point back to evidence and misconceptions.

## Phase 7: Milestone Audit

**Goal:** Verify Curriculum V2 is safe to ship and ready for later content migration.

**Deliverables:**
- Reachability audit for current modules and lessons.
- Legacy URL audit.
- Progress retention audit.
- Bilingual completeness audit.
- Build and GitHub Pages audit.
- UI/mobile fallback review for changed surfaces.

**Must Not Do:**
- Do not add new courses.
- Do not broaden scope beyond audit fixes.

**Exit Criteria:**
- No current content is unreachable.
- Old progress is retained.
- Tests and builds pass.
- Remaining risks are documented for the next milestone.

## Phase 8A: Optimization Learning Evidence

**Goal:** Turn the optimization/calculus lab line into the first durable evidence slice by saving experiment evidence into Progress V2 and surfacing recent evidence on the progress page.

**Deliverables:**
- `LearningProgressV2.labEvidence` with source-aware, module-aware evidence records.
- `recordLearningProgressLabEvidence()` helper that upserts the latest evidence per module/lab source.
- Math Lab module page integration so dynamic lab evidence writes to Progress V2.
- `/progress` recent experiment evidence display.
- Tests for evidence persistence, malformed evidence tolerance, page integration, and progress page wiring.

**Must Not Do:**
- Do not rewrite the existing optimization labs from scratch.
- Do not delete v1 progress stores or checkpoint report drafts.
- Do not turn every lab into Progress V2 evidence in this slice.

**Exit Criteria:**
- Optimization/math lab evidence survives reload via Progress V2.
- Repeated slider or control changes update the latest evidence record instead of appending unbounded duplicates.
- Recent evidence is visible from `/progress`.
- `npm test` and `npm run build` pass.

## Phase 8B: Optimization Task Loop

**Goal:** Turn selected optimization/calculus labs from observation-only evidence into a full prediction, experiment, explanation, and checkpoint loop.

**Deliverables:**
- Optional typed `LabTaskConfig` for Math Lab labs.
- Progress V2 task payload for prediction, explanation, completion state, and save timestamp.
- Task card UI rendered next to selected Math Lab labs.
- Task prompts for partial derivatives, batch-gradient noise, and optimizer comparison.
- `/progress` evidence status labels for observed evidence, explanation completion, and checkpoint completion.
- Tests for task schema, persistence merge behavior, Math Lab task wiring, and progress-page statuses.

**Must Not Do:**
- Do not convert every Math Lab lab in one phase.
- Do not remove checkpoint report drafts or v1 progress storage.
- Do not require a backend account or remote persistence for task notes.

**Exit Criteria:**
- A learner can run one selected optimization lab, save a prediction and explanation, reload, and see the task state preserved.
- Later lab metric updates do not erase the saved task text.
- `/progress` distinguishes observed evidence, missing/completed explanation, and missing/completed checkpoint.
- Desktop and mobile layouts have no horizontal overflow.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Phase 9A: Curriculum Spine Data Contract

**Goal:** Encode the approved Curriculum Spine V1 route as a typed stage contract before changing homepage, navigation, progress, backend, or lesson bodies.

**Deliverables:**
- `src/curriculum/spine.ts`
- `CurriculumSpineStage` in `src/curriculum/types.ts`
- `tests/curriculumSpine.test.ts`
- Phase 9 design notes in `docs/refactor/designs/phase-9-curriculum-spine-v1.md`
- Phase summary in `docs/refactor/summaries/phase-9.md`

**Must Not Do:**
- Do not redesign homepage or navigation in this phase.
- Do not delete or redirect legacy routes.
- Do not add backend, account, database, or new progress tracking behavior.
- Do not add fake module IDs for known content gaps.
- Do not bulk rewrite Math Lab, Data Lab, or Algorithm lesson body content.

**Exit Criteria:**
- The default spine starts data-first: `ai-overview`, `python-notebook`, `numerical-data`, `categorical-data`, and `dataset-quality`.
- `optimizer-comparison` is required before CNN and Attention.
- `attention-transformer` is the Spine V1 endpoint; `llm-rag` remains outside the required route.
- Housing and classification projects are represented as recommended validation capstones, not hard blockers.
- All required, support, and project IDs resolve to existing catalog modules.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Phase 9B: Homepage And Navigation Realignment

**Goal:** Make the approved Curriculum Spine V1 the first learner-facing entry across homepage, top navigation, core track, and continue-learning fallback order without adding new routes or progress/backend behavior.

**Deliverables:**
- Homepage decision cards and roadmap generated from the spine contract.
- Navigation labels that present Default Spine, Support Lenses, Projects, and Progress.
- `coreLearningPathModuleIds` and the `core-learning-path` track aligned with `curriculumSpineRequiredModuleIds()`.
- Tests for navigation labels, spine order, homepage source wiring, progress fallback order, and prerequisite safety.

**Must Not Do:**
- Do not create the dedicated stage landing view yet.
- Do not delete or redirect legacy routes.
- Do not add backend, account, database, or new progress tracking behavior.
- Do not rewrite lesson body content.

**Exit Criteria:**
- Homepage presents Default Spine as the primary path and Math/Data/Model/Deep Learning as support lenses.
- `/tracks/core-learning-path` follows the required Spine V1 order.
- Continue-learning fallback uses the data-first spine order.
- Legacy Math Lab, Data Lab, Algorithm, project, library, and progress routes remain reachable.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Phase 9C: Spine Stage Landing View

**Goal:** Add a dedicated stage-oriented Default Spine route that explains Curriculum Spine V1 as learner stages while preserving `/tracks/core-learning-path` as the flat module list.

**Deliverables:**
- `/spine` lazy route and `CurriculumSpineView.vue`.
- Stage cards generated from `curriculumSpineStages`, including required modules, support lenses, project validation, outcomes, and known gaps.
- Navigation, homepage, and progress-page entry links that send learners to `/spine` first.
- GitHub Pages fallback coverage for `/spine`.
- Tests for route wiring, stage source wiring, fallback generation, and preservation of the flat core track.

**Must Not Do:**
- Do not delete or redirect `/tracks/core-learning-path`.
- Do not add backend, account, database, or new progress tracking behavior.
- Do not rewrite lesson body content or move module source files.
- Do not hide known content gaps such as the sequence/embedding bridge.

**Exit Criteria:**
- Default Spine opens a stage landing page.
- `/tracks/core-learning-path` remains reachable as a flat module list.
- Stage cards expose required modules, support lenses, project validation, completion standards, and known gaps.
- Legacy Math Lab, Data Lab, Algorithm, project, library, progress, and canonical learn routes remain reachable.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Phase 9D: Sequence Embedding Bridge Module

**Goal:** Fill the required sequence/embedding bridge gap before Attention and Transformer without broadening into a full LLM/RAG rewrite.

**Deliverables:**
- `sequence-embedding-bridge` algorithm module.
- Spine insertion between CNN and Attention.
- Core track and advanced architecture navigation coverage.
- Bilingual checkpoints and workflow-lab coverage.
- Route, catalog, progress, navigation, and Pages fallback tests.

**Must Not Do:**
- Do not add backend, account, database, or new progress tracking behavior.
- Do not rewrite Attention, Transformer, or RAG content.
- Do not make LLM/RAG part of the required Spine V1 endpoint.

**Exit Criteria:**
- A learner can reach the sequence bridge from `/spine`, `/tracks/core-learning-path`, and `/learn/sequence-embedding-bridge`.
- The module explains token ids, embedding lookup, position/mask, and `[B,T,H]` handoff before Attention.
- Existing deep-learning, catalog, progress, navigation, build, and Pages checks pass.

## Phase 9E: Route Copy Harmonization

**Goal:** Make `/spine` read like a guided learner route by explaining why each stage comes next.

**Deliverables:**
- Bilingual `bridge` copy on every `CurriculumSpineStage`.
- `/spine` rendering for stage bridge copy.
- Hero copy that frames the page around route guidance instead of gap tracking.
- Action-shaped completion standards where the previous copy read like topic lists.
- Contract and landing-page tests for bridge copy.

**Must Not Do:**
- Do not rewrite lesson bodies.
- Do not add new modules, routes, progress tracking, backend, or layout concepts.
- Do not turn support lenses into hard prerequisites.

**Exit Criteria:**
- Every spine stage has non-empty bilingual bridge copy.
- `/spine` renders stage bridge paragraphs on desktop and mobile without horizontal overflow.
- Existing flat track, required module order, and legacy routes remain reachable.

## Phase 9F: Support Lens Guidance

**Goal:** Make support lenses stage-specific and just-in-time, without turning them into hard blockers.

**Deliverables:**
- Optional bilingual `supportNote` on `CurriculumSpineStage`.
- Stage-specific support note copy for each stage with support modules.
- `/spine` rendering for `supportNote` in the existing support-lens section.
- Tests for support note completeness and landing-page rendering.

**Must Not Do:**
- Do not add a per-module relationship schema.
- Do not add new modules, routes, progress tracking, backend, or layout redesign.
- Do not convert support lenses into prerequisites.

**Exit Criteria:**
- Every stage with support modules has bilingual support guidance.
- Stages without support modules do not carry unused support-copy fields.
- `/spine` keeps required modules, project validation, and flat-track behavior unchanged.

## Phase 10: Sequence Bridge Shape Lab

**Goal:** Upgrade the sequence bridge workflow lab from static stage switching into an interactive shape and mask task.

**Deliverables:**
- `src/simulations/sequenceBridgeLab.ts` for deterministic sequence shape and mask calculations.
- `src/components/SequenceBridgeShapeLab.vue`.
- Sequence bridge branch wiring in `AppliedWorkflowLessonLab.vue`.
- Shape-card, mask-cell, control, and mobile styles.
- Targeted sequence bridge tests and deep-learning module wiring updates.
- Phase 10 design and summary docs.

**Must Not Do:**
- Do not migrate every workflow lab.
- Do not add backend, database, or Progress V2 persistence.
- Do not rewrite Attention/Transformer content.
- Do not introduce a new lesson-block schema.

**Exit Criteria:**
- The lab lets learners manipulate `B`, `T`, `H`, padding, mask mode, and query token.
- Shape and mask behavior are covered by Node tests.
- `/learn/sequence-embedding-bridge/embedding-lookup` renders on desktop and mobile without horizontal overflow.
- `npm test`, `npm run build`, `npm run build:pages`, and Pages fallback generation pass.

## Phase 11: Data Pipeline Task Lab

**Goal:** Turn the early data-first route into a task interaction where learners identify split/fit/transform order, leakage risk, and the final `[B,F]` feature matrix handed to a model.

**Deliverables:**
- A small deterministic pipeline simulation for train/validation/test split, fit-only-on-train transforms, numeric scaling, category vocabulary, and leakage warnings.
- A dedicated Vue task lab for one required data-first module.
- Integration into the selected Data Lab or workflow lesson without changing backend/progress scope.
- Tests for pipeline order, leakage detection, feature-shape readouts, and component wiring.
- Phase 11 design, summary, and verification notes.

**Must Not Do:**
- Do not add backend, database, accounts, or durable progress tracking.
- Do not migrate every Data Lab module.
- Do not replace the full Data Lab schema or route system.
- Do not make this a broad pandas/sklearn project rewrite.

**Exit Criteria:**
- A learner can distinguish split, fit, transform, and evaluate responsibilities.
- The lab exposes at least one leakage state and one safe pipeline state.
- The final feature matrix shape is visible and consistent with selected numeric/category columns.
- Desktop and mobile layouts have no horizontal overflow.
- `npm test`, relevant targeted tests, `npm run build`, and `npm run build:pages` pass.

## Phase 12: Data-first Corridor Audit

**Goal:** Audit the required data-first corridor from orientation through the first project handoff before adding more lesson interactions.

**Deliverables:**
- `docs/refactor/designs/phase-12-data-first-corridor-audit.md`.
- `docs/refactor/audits/phase-12-data-first-corridor-audit.md`.
- Evidence matrix covering `ai-overview`, `python-notebook`, `numerical-data`, `categorical-data`, `dataset-quality`, and `housing-price-project`.
- Boundary checks for `splits-generalization` and `classification-project`.
- One recommended narrow Phase 13 implementation target with scope, non-goals, and acceptance criteria.

**Must Not Do:**
- Do not rewrite lesson bodies during the audit phase.
- Do not add backend, database, account, or durable progress behavior.
- Do not add new routes, schemas, modules, or LessonPage migrations.
- Do not implement Phase 13 fixes inside the audit PR.
- Do not broaden the audit to the full math, deep-learning, or LLM/RAG route.

**Exit Criteria:**
- Every audited module has cited local evidence for gaps or an explicit no-gap finding.
- Findings classify gap type and severity as `P0`, `P1`, or `P2`.
- The audit identifies overdesign/simplification risks and coverage/handoff risks, or documents why evidence shows none.
- The next implementation phase is small enough to review and ship independently.
- `git diff --check` passes, and targeted documentation/audit tests run if test-covered planning invariants change.

## Phase 13: Categorical Vocabulary Contract Task Lab

**Goal:** Turn the required categorical lesson into a narrow task interaction where learners predict and verify how training vocabulary, unknown categories, rare buckets, and fixed slot order determine the final feature matrix.

**Deliverables:**
- Deterministic categorical vocabulary task helper.
- Task lab or task-first branch in the existing `categorical-data` lab surface.
- Safe and unsafe scenarios for train vocabulary, validation/test recomputed columns, all-data vocabulary leakage, and high-cardinality ID expansion.
- Readouts for vocabulary source, OOV/RARE mapping, column alignment, sparse active slots, and `[B,F]`.
- Tests for vocabulary source, slot order, unknown handling, feature counts, and Data Lab source wiring.
- Phase 13 design and summary docs.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add new routes or migrate the Data Lab schema.
- Do not rewrite all Data Lab modules.
- Do not build a general-purpose sklearn encoder simulator.
- Do not add more 3D or decorative interaction; the task should make the required concept clearer.

**Exit Criteria:**
- A learner can distinguish training vocabulary from recomputed validation/test vocabulary.
- At least two unsafe scenarios report explicit reasons.
- Unknown and rare categories map to stable slots.
- `[B,F]` changes are visible and consistent with selected categories.
- Existing `categorical-data` route remains available and bilingual.
- Core logic is tested outside Vue, and source wiring tests confirm the lab is reachable.
- `npm test`, relevant targeted tests, `npm run build`, and `npm run build:pages` pass if runtime code changes.

## Phase 14: Data Quality Decision Record

**Goal:** Turn the required `dataset-quality` lesson into a narrow task interaction where learners convert one EDA/cleaning signal into a reviewable quality decision before the housing project handoff.

**Deliverables:**
- Deterministic data-quality decision helper.
- Task lab or task-first branch in the existing `dataset-quality` lab surface.
- Scenarios for missingness, duplicate rows, outliers, label timing, and imbalance baseline.
- Readouts for evidence, affected rows/columns, treatment choice, risk level, project impact, and compact decision record.
- Tests for scenario recommendations, wrong issue/treatment/risk warnings, shape impact, decision-record output, and Data Lab source wiring.
- Phase 14 design and summary docs.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add new routes or migrate the Data Lab schema.
- Do not rewrite all Data Lab modules or all `dataset-quality` copy.
- Do not build a general-purpose EDA dashboard, spreadsheet editor, pandas notebook, or report builder.
- Do not add project readiness checklist work in this phase.
- Do not remove `EdaWorkbenchLab` or `CleaningPipelineLab`.

**Exit Criteria:**
- A learner can turn one quality signal into issue, evidence, treatment, risk, and project impact.
- At least four quality scenarios are available.
- Wrong issue, risky treatment, or under-stated risk report explicit reasons.
- Shape or row-count impact is visible when a treatment changes examples.
- Existing `dataset-quality` route remains available and bilingual.
- Core logic is tested outside Vue, and source wiring tests confirm the lab is reachable.
- `npm test`, relevant targeted tests, `npm run build`, and `npm run build:pages` pass if runtime code changes.

## Phase 15: Curriculum Architecture and Teaching Route Audit

**Goal:** Return the refactor to curriculum architecture, teaching route clarity, module responsibility, and content coverage before adding more checklist or progress surfaces.

**Deliverables:**
- `docs/refactor/designs/phase-15-curriculum-architecture-teaching-route-audit.md`.
- `docs/refactor/audits/phase-15-curriculum-architecture-teaching-route-audit.md`.
- A full catalog responsibility table covering every current Curriculum V2 module.
- A coverage matrix for the default spine, topic library, project validation, advanced extensions, and known gaps.
- Findings for route conflicts, duplicated or misplaced content, weak interactions, overdesigned surfaces, and missing high-value teaching content.
- A prioritized implementation sequence for the next 3 to 5 phases.
- `.planning/STATE.md` update with the approved next direction.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add a project readiness checklist in this phase.
- Do not rewrite lesson bodies or migrate all modules into `LessonPage`.
- Do not delete, redirect, or deprecate legacy routes.
- Do not add new course inventory before the audit proves the gap.
- Do not make checklist/progress mechanics the primary next milestone.

**Exit Criteria:**
- Every catalog module is classified exactly once by primary responsibility.
- Every required-core module receives a teaching quality classification.
- Every capability band has adequate coverage, an explicit gap, or a deliberate non-goal.
- Findings cite local files or prior phase docs.
- P0 route/content blockers are separated from P1 quality improvements and P2 polish.
- The proposed next phases prioritize route clarity and teaching content quality.
- `git diff --check` passes.

## Phase 16: Curriculum Role Metadata and Legacy Order Cleanup

**Goal:** Make curriculum role and learner-facing order explicit across the catalog, library, and legacy algorithm surfaces.

**Deliverables:**
- Typed role metadata or a derived role helper for required core, just-in-time support, project validation, advanced extension, reference library, and duplicate/overlap modules.
- Legacy algorithm `moduleOrder` alignment or quarantine so it cannot contradict the approved spine.
- Route-role context on Topic Library/module cards.
- Tests for role classification, spine order, project validation, advanced extension placement, and legacy order safety.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not rewrite lesson bodies.
- Do not bulk migrate modules into `LessonPage`.
- Do not add new course inventory.

**Exit Criteria:**
- Learner-facing route order cannot place projects or advanced modules before their required foundations.
- Every catalog module exposes or derives exactly one primary curriculum role.
- Topic Library pages indicate whether a module is required, support, project validation, advanced, reference, or overlap.
- Tests protect role classification and route order.
- `npm test`, `npm run build`, and `npm run build:pages` pass if runtime code changes.

## Phase 17: Neural-Network Learning Mechanism Bridge

**Goal:** Resolve the required-route ambiguity around how much backpropagation and autodiff a learner must understand before CNN, optimizer comparison, and Attention.

**Deliverables:**
- Design decision: use a compact MLP bridge for chain-rule/computation-graph backprop depth; keep `matrix-calculus-autodiff` as a just-in-time support lens.
- Updated route copy or required module wiring that makes the chosen neural-network learning depth explicit.
- A narrow MLP `backprop` interaction that connects forward pass, loss, local derivatives, gradients, and parameter update evidence.
- Tests for role/order consistency, route copy, and any new deterministic learning-mechanism helper.
- Phase 17 design and summary docs.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not bulk migrate MLP, optimizer, CNN, or Attention into a new lesson architecture.
- Do not turn advanced matrix calculus into a long required detour unless the design explicitly chooses that route.
- Do not add new course inventory before deciding whether existing MLP/autodiff material can carry the outcome.

**Exit Criteria:**
- The neural-network stage no longer overclaims backprop/autodiff depth.
- Learners can tell that full autodiff is support material while the required MLP route teaches chain-rule responsibility flow.
- Any new interaction asks for prediction/evidence rather than another static stage switch.
- Existing spine, Topic Library roles, legacy routes, and checkpoint submissions remain intact.
- `npm test`, `npm run build`, and `npm run build:pages` pass if runtime code changes.

## Phase 18: Optimizer To CNN Handoff Audit

**Goal:** Audit the required-route handoff from neural-network foundations into visual deep learning and choose the narrowest next content-quality slice.

**Deliverables:**
- Evidence-backed audit of `optimizer-comparison`, `tensor-shapes-vectorization`, and `cnn-visualization`.
- Decision on whether the next slice should be optimizer diagnosis, CNN shape/parameter reasoning, or route-copy cleanup.
- Phase 18 summary and state update.
- Tests that keep completed phase documentation discoverable.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not add a new transition module between optimizer and CNN.
- Do not bulk migrate optimizer, CNN, or Attention into a new lesson architecture.
- Do not implement runtime lab code inside this audit phase.

**Exit Criteria:**
- The route is correctly described as `optimizer-comparison -> tensor-shapes-vectorization -> cnn-visualization`.
- The next implementation direction is a single content-quality task.
- Any recommendation is grounded in current module content, checkpoints, and lab surfaces.
- `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check` pass.

## Phase 19: CNN Shape/Parameter Challenge

**Goal:** Turn CNN output-shape and parameter-sharing content into one active prediction/evidence task inside the required `cnn-visualization` route.

**Deliverables:**
- Design contract for `CnnShapeParameterChallengeLab`.
- Deterministic helper contract for output shape, convolution parameters, dense-equivalent parameters, and learner prediction scoring.
- Implementation plan that wires the task directly into the CNN `channels-feature-maps` chapter without replacing `CnnExplainerLab`.
- Tests that keep Phase 19 design artifacts discoverable before runtime implementation.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not add a new transition module between optimizer and CNN.
- Do not rewrite or replace `CnnExplainerLab`.
- Do not wire the task through `AppliedWorkflowLessonLab`, because CNN currently renders through `AlgorithmView.vue`.
- Do not bulk migrate CNN or other algorithm modules into a new lesson architecture.

**Exit Criteria:**
- The task asks learners to predict output shape and parameter count before computed evidence is shown.
- The dense-layer comparison maps the same flattened input image to the same output tensor.
- The design reuses existing CNN output-size logic instead of duplicating formula math in Vue.
- The implementation scope remains one helper, one component, one section-level wiring point, focused tests, and summary/state docs.
- Design phase: `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check` pass.
- Runtime implementation phase: targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks pass.

## Phase 20: Optimizer Curve Diagnosis Challenge

**Goal:** Turn optimizer curve diagnosis into one active prediction/evidence task inside the required `optimizer-comparison` route.

**Deliverables:**
- Design contract for `OptimizerCurveDiagnosisChallengeLab`.
- Deterministic helper contract for fixed training-curve scenarios, evidence metrics, likely-issue scoring, and next-experiment scoring.
- Implementation plan that wires the task directly into the optimizer `curve-diagnosis` chapter while keeping the existing `optimizerStages` explanation available.
- Tests that keep Phase 20 design artifacts discoverable before runtime implementation.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not add a new optimizer course module or freeform training simulator.
- Do not migrate `optimizer-comparison` into `LessonPage`.
- Do not rewrite `AppliedWorkflowLessonLab` beyond one section-level conditional.
- Do not migrate Math Lab `calculus-optimizer-comparison` into required core.

**Exit Criteria:**
- The task asks learners to predict likely issue and next controlled experiment before computed evidence is shown.
- The scenarios cover learning-rate divergence, batch noise, momentum/adaptive behavior, and schedule plateau.
- Evidence is derived from deterministic curve arrays outside Vue.
- The implementation scope remains one helper, one component, one section-level wiring point, focused tests, and summary/state docs.
- Design phase: `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check` pass.
- Runtime implementation phase: targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks pass.

## Phase 21: Attention Q/K/V Softmax Task

**Goal:** Turn row-wise Attention Q/K/V and softmax content into one active prediction/evidence task inside the required `attention-transformer` route.

**Deliverables:**
- Design contract for `AttentionQkvChallengeLab`.
- Deterministic helper contract for fixed token scenarios, Q/K dot scores, optional masks, row-wise softmax, top-key scoring, and weighted-value evidence.
- Implementation plan, after design review, that wires the task directly into the Attention `softmax-weighted-sum` chapter while keeping the existing `attentionStages` explanation available.
- Tests that keep Phase 21 design artifacts discoverable before runtime implementation.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not add a new Attention or Transformer course module.
- Do not migrate `attention-transformer` into `LessonPage`.
- Do not rewrite `AppliedWorkflowLessonLab` beyond one section-level conditional.
- Do not migrate Math Lab AI bridge content into required core.
- Do not build a full Transformer simulator, LLM demo, RAG surface, semantic NLP task, or multi-head visualization in the first implementation slice.

**Exit Criteria:**
- The task asks learners to predict the top attended key and mask effect before computed evidence is shown.
- The scenarios cover clean Q/K alignment, causal masking, padding masking, and weighted V mixture.
- Evidence is derived from deterministic token/vector rows outside Vue.
- The implementation scope remains one helper, one component, one section-level wiring point, focused tests, and summary/state docs.
- Design phase: `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check` pass.
- Runtime implementation phase: targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks pass.

## Phase 22: Transformer Block Assembly Challenge

**Goal:** Turn Transformer block structure into one active prediction/evidence task inside the required `attention-transformer` route before moving into optional `llm-rag` application content.

**Deliverables:**
- Design contract for `TransformerBlockAssemblyChallengeLab`.
- Deterministic helper contract for fixed block scenarios, missing/misplaced sublayer scoring, consequence scoring, shape invariants, and evidence labels.
- Implementation plan, after design review, that wires the task directly into the Attention `transformer-block` chapter while keeping the existing `attentionStages` explanation available.
- Tests that keep Phase 22 design artifacts discoverable before runtime implementation.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not add a new Attention, Transformer, LLM, or RAG course module.
- Do not promote `llm-rag` into required core or change curriculum roles.
- Do not migrate `attention-transformer` or `llm-rag` into `LessonPage`.
- Do not rewrite `AppliedWorkflowLessonLab` beyond one section-level conditional.
- Do not build a full Transformer simulator, generation demo, RAG surface, semantic NLP task, or multi-head visualization.

**Exit Criteria:**
- The task asks learners to predict block order or missing sublayer before computed evidence is shown.
- The scenarios cover residual, LayerNorm, FFN, and attention-only misconceptions.
- Evidence is derived from deterministic block traces outside Vue.
- The existing Attention stage explanation remains visible; routes, roles, and checkpoints remain unchanged.
- The implementation scope remains one helper, one component, one section-level wiring point, focused tests, and summary/state docs.
- Design phase: `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check` pass.
- Runtime implementation phase: targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks pass.

## Phase 23: Architecture-to-Tools Handoff Challenge

**Status:** Implemented 2026-07-09.

**Goal:** Turn the final required `attention-transformer` `architecture-to-tools` chapter into one active prediction/evidence task before moving into optional `llm-rag` application content.

**Deliverables:**
- Design contract for `ArchitectureToolsHandoffChallengeLab`.
- Deterministic helper contract for fixed tooling trace scenarios, tool-object scoring, architecture-concept scoring, trace evidence, and misconception feedback.
- Runtime implementation of `ArchitectureToolsHandoffChallengeLab` in the Attention `architecture-to-tools` chapter while keeping the existing `attentionStages` explanation available.
- Focused helper/source tests, milestone audit coverage, and Phase 23 summary/state docs.

**Must Not Do:**
- Do not add backend, database, account, or durable progress behavior.
- Do not add project readiness checklist work.
- Do not add a new Attention, Transformer, LLM, tooling, or RAG course module.
- Do not promote `llm-rag` into required core or change curriculum roles.
- Do not migrate `attention-transformer` or `llm-rag` into `LessonPage`.
- Do not rewrite `AppliedWorkflowLessonLab` beyond one section-level conditional.
- Do not build a real tokenizer integration, model call, generation demo, RAG surface, chat UI, semantic NLP task, full Transformer simulator, or multi-head visualization.

**Exit Criteria:**
- The task asks learners to predict the tooling object and architecture concept before computed evidence is shown.
- The scenarios cover tokenizer segmentation, attention mask visibility, Transformer block hidden-state updates, and logits/next-token scores.
- Evidence is derived from deterministic trace records outside Vue.
- The existing Attention stage explanation remains visible; routes, roles, checkpoints, and `llm-rag` advanced-extension status remain unchanged.
- The implementation scope remains one helper, one component, one section-level wiring point, focused tests, and summary/state docs.
- Design phase: `node --test tests/curriculumMilestoneAudit.test.ts` and `git diff --check` pass.
- Runtime implementation phase: targeted tests, `npm test`, `npm run build`, `npm run build:pages`, and browser checks pass.

## Phase 24A: Navigation and Topic Library

**Status:** Implemented 2026-07-10.

**Goal:** Make the Default Spine, Topic Library, Projects, and Progress hierarchy explicit while removing the full module inventory from the global header.

**Deliverables:**
- Typed bilingual Topic Library domain contract and invalid-domain redirect to `/library/math`.
- Direct Default Spine, Projects, and Progress links plus one four-domain Topic Library menu using “专题学习” / “Topic Library”.
- Extracted header and shared desktop/mobile navigation renderer with Escape, focus-return, route-change closure, and ARIA behavior.
- One stylesheet owner for header, dropdown, mobile navigation, and locale-switch layout selectors.
- Focused navigation/layout tests, milestone audit coverage, and Phase 24A summary/state records.

**Must Not Do:**
- Do not begin the Phase 24B homepage focus redesign or Phase 24C Spine progressive disclosure.
- Do not change course bodies, checkpoints, curriculum roles, Spine order, Progress V1/V2 storage, or canonical and legacy course routes.
- Do not expose individual course modules in the global Topic Library menu.
- Do not broaden CSS cleanup beyond the header/navigation selectors touched by this phase.
- Do not add backend, database, account, or durable-progress behavior.

**Exit Criteria:**
- Global navigation presents Home, Default Spine, Topic Library, Projects, and Progress; only Topic Library opens a category menu.
- Topic Library exposes exactly Math, Data, Models and Training, and Deep Learning domains in Chinese and English.
- Invalid Topic Library domains redirect to `/library/math`.
- Desktop and mobile navigation consume one rendered model and preserve keyboard focus, Escape closing, route-change closure, and ARIA semantics.
- Desktop and 390px browser checks cover the five primary routes with no horizontal overflow or console errors.
- `npm test`, `npm run build`, `npm run build:pages`, and `git diff --check` pass with only the existing Vite large-chunk warning.

## Curriculum V3.0 Blueprint and Content Audit

**Status:** Completed 2026-07-11.

**Deliverables:**
- Typed blueprint for exactly 56 instructional modules, 6 projects, 10 learning arcs, and 7 exit capabilities.
- Classification audit covering all 53 current curriculum modules.
- Deterministic generated records under `docs/curriculum-v3/` for the blueprint overview, module inventory, content audit, project map, capability coverage, and implementation backlog.
- Completion traceability in `docs/refactor/summaries/curriculum-v3-0.md` and milestone audit coverage.

**Runtime boundary:**
- No runtime lesson, route, or Progress data changed.
- Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure remain paused.

## V3.1 Minimum Mathematical Foundation

**Status:** In progress; AI Overview rebuild, Math-to-Code pilot, and Python Data Tools Stages 1–4 completed; Python Data Tools Stage 5 consistency and browser validation remains planned.

**Decision boundary:**
- Start only from separately reviewed acceptance criteria for the V3.1 waves declared in the generated implementation backlog.
- Preserve current lessons, routes, checkpoints, and Progress V1/V2 storage until an explicitly scoped implementation phase changes them.
- Keep Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure paused while V3.1 work proceeds.

### Python Data Tools Course Rebuild

This rebuild preserves the existing `python-notebook` ID and `/learn/python-notebook` route throughout all five stages. Stage 1 excludes data cleaning, model training, Pyodide, and backend work.

1. **Data and execution contract** — Completed — verified UCI snapshot, typed chapter/output contract, environment pins, offline validation; no runtime lesson changes.
2. **Eight-chapter Chinese master** — Completed — complete Chinese teaching flow Notebook/NumPy/Pandas/Matplotlib/Seaborn/Plotly/final report; no runtime lesson changes.
3. **Notebook and real chart assets** — Completed — clean-kernel ipynb, exact outputs, real Matplotlib/Seaborn assets, deterministic Plotly JSON.
4. **English parity and runtime refactor** — Completed — eight paired chapters, dedicated paged runtime, manifest-driven JSON/PNG/Plotly results, static teaching prompts, legacy redirects, course review, Progress compatibility, both builds, and bounded browser smoke verified.
5. **Consistency, browser, and build validation** — Planned — data/code/output parity, bilingual, responsive browser, production/Pages.

---
*Roadmap created: 2026-06-25*
