# GSD State: ML Atlas Curriculum V2

**Updated:** 2026-07-08
**Status:** Phase 22 Transformer block assembly challenge implementation completed; next work should verify and ship the phase PR.

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-25)

**Core value:** Students should always know where they are in the learning path, why the current lesson matters, and what evidence shows they are ready for the next step.
**Current focus:** Required-core content quality and explicit neural-network learning depth before backend, database, or durable progress scope

## Baseline

- `npm test`: pass, 270 tests.
- `npm run build`: pass with existing Vite large-chunk warning.
- `npm run build:pages`: pass with existing Vite large-chunk warning.
- Baseline details: `docs/refactor/baseline.md`.

## Codebase Map

See `.planning/codebase/`:

- `STACK.md`
- `INTEGRATIONS.md`
- `ARCHITECTURE.md`
- `STRUCTURE.md`
- `CONVENTIONS.md`
- `TESTING.md`
- `CONCERNS.md`

## Current Decisions

- Follow gradual migration, no big-bang rewrite.
- Keep existing content source files during the first milestone.
- Preserve old URLs and v1 progress stores.
- Use adapters before moving content.
- Pilot LessonPage with AI Overview, Gradient Descent, and MLP.
- Treat effective core interactions as prediction, manipulation, evidence, reflection, and success criteria.
- One phase should remain independently reviewable and releasable.
- Lab evidence should persist into Progress V2, not only live inside a page-level checkpoint prompt.
- Selected optimization labs should require prediction and explanation task notes before the learning loop is considered complete.
- Curriculum route clarity and content coverage are higher priority than more progress tracking until backend/database work is ready.
- The default route should be a mixed spiral route from data-first foundations to deep-learning introduction ability.
- `optimizer-comparison` is required in Spine V1 before CNN/Attention.
- `attention-transformer` is the Spine V1 endpoint; `llm-rag` remains an advanced application extension.
- Housing and classification projects are recommended validation capstones, not hard blockers.
- The sequence/embedding bridge is now a required Spine V1 module before Attention.
- Lesson-depth work should prioritize early required data pipeline understanding before adding more progress UI.
- Phase 12 should audit the required data-first corridor before another implementation phase.
- Do not implement Phase 13 fixes inside the Phase 12 audit PR.
- Phase 12 found no P0 corridor blocker; the highest-priority P1 is narrowing `categorical-data` into a vocabulary contract task.
- Phase 13 should prioritize categorical vocabulary, OOV/RARE handling, slot alignment, and `[B,F]` shape before data-quality decision records.
- Phase 13 should add a narrow `CategoricalVocabularyTaskLab` near `vocabulary-contract`, while keeping the existing broad `CategoricalEncodingLab` available as an optional comparison surface.
- Phase 14 should target `dataset-quality` with a narrow decision-record task before project-readiness checklist work.
- Phase 14 design should add a `DataQualityDecisionRecordLab` near `quality-report`, while keeping `EdaWorkbenchLab` and `CleaningPipelineLab` available as observation and cleaning-policy surfaces.
- Phase 14 should not add backend, database, durable progress tracking, route changes, project readiness checklist work, or a general EDA/report builder.
- The `housing-price-project` readiness checklist remains a P2 local improvement, not the next milestone driver.
- Phase 15 should audit and design curriculum architecture, teaching route, module responsibilities, and content coverage before adding more checklist/progress surfaces.
- Phase 15 design should produce a docs-only audit plan first, then an evidence-backed audit before any route or runtime implementation.
- Phase 15 found that route/source-of-truth cleanup and explicit curriculum role metadata should precede project readiness, progress expansion, or more checklist mechanics.
- Phase 16 should make required-core, support, project-validation, advanced-extension, reference-library, and overlap roles explicit, and prevent legacy algorithm order from contradicting the spine.
- Phase 16 completed the role metadata and legacy order cleanup without adding backend, database, durable progress scope, project readiness, or new course inventory.
- Phase 17 should resolve the neural-network foundation depth decision around backpropagation/autodiff before more checklist or project-readiness work.
- Phase 17 design chooses compact MLP chain-rule/computation-graph backprop depth; `matrix-calculus-autodiff` remains just-in-time support rather than required core.
- Phase 17 MLP backprop mechanism bridge completed the compact required-route task without adding backend, database, durable progress scope, project readiness, bulk LessonPage migration, or a new lab registry.
- Phase 18 optimizer-to-CNN handoff audit completed; the route is `optimizer-comparison -> tensor-shapes-vectorization -> cnn-visualization`, and the next implementation slice should be a CNN shape/parameter challenge rather than a new transition module or optimizer task first.
- Phase 19 design chooses a narrow `CnnShapeParameterChallengeLab` in `cnn-visualization` `channels-feature-maps`; it should reuse existing CNN output-size logic, compare convolution parameters with a dense layer reading the same image, and avoid backend, progress persistence, route rewrites, CNN explainer replacement, or `AppliedWorkflowLessonLab` wiring.
- Phase 19 CNN shape/parameter challenge implementation completed the required CNN prediction/evidence task without replacing `CnnExplainerLab`, adding backend/progress persistence, changing routes, or widening the lesson architecture.
- Phase 20 design chooses a narrow `OptimizerCurveDiagnosisChallengeLab` in `optimizer-comparison` `curve-diagnosis`; it should ask for likely issue and next single-variable experiment before showing evidence, and avoid backend, durable progress, route rewrites, project readiness, new optimizer inventory, or `LessonPage` migration.
- Phase 20 runtime implementation should start from updated `main` after Phase 19 PR #29, preserving one independently reviewable phase per PR.
- Phase 20 optimizer curve diagnosis challenge implementation completed the required optimizer prediction/evidence task without adding backend/progress persistence, changing routes, creating a new optimizer module, replacing the existing optimizer stage explanation, or migrating the lesson to `LessonPage`.
- Phase 21 design chooses a narrow `AttentionQkvChallengeLab` in `attention-transformer` `softmax-weighted-sum`; it should ask for top attended key and mask effect before showing Q/K score, row-wise softmax, and weighted V evidence.
- Phase 21 should avoid backend, durable progress, route rewrites, project readiness, new Attention inventory, full Transformer simulation, multi-head expansion, Math Lab migration, semantic NLP tasks, or `LessonPage` migration.
- Phase 21 Attention Q/K/V softmax task implementation completed the required Attention prediction/evidence task without adding backend/progress persistence, changing routes, creating a new Attention module, replacing the existing Attention stage explanation, or migrating the lesson to `LessonPage`.
- Phase 22 audit keeps `llm-rag` as an advanced extension and chooses required-core Transformer block reasoning before optional RAG diagnostics or route-copy-only work.
- Phase 22 design chooses a narrow `TransformerBlockAssemblyChallengeLab` in `attention-transformer` `transformer-block`; it should ask learners to predict block order or missing sublayer before showing deterministic block-trace evidence.
- Phase 22 Transformer block assembly challenge implementation completed the required Attention block prediction/evidence task without changing routes, roles, checkpoints, durable progress, or `llm-rag` advanced-extension status.

## Completed Work

### Phase 1 - Unified Curriculum Contract

- Added `src/curriculum/` read model with canonical module, lesson, track, source, domain, level, prerequisite, and validation contracts.
- Added adapters for Algorithm, Math Lab, and Data Lab content.
- Added a compatibility mapping from retired Math Lab prerequisite `vectors-matrices-norms` to `linear-algebra-distance-similarity`.
- Added curriculum catalog, source lookup maps, tracks, prerequisite validation, and localization validation.
- Added tests:
  - `tests/curriculumCatalog.test.ts`
  - `tests/curriculumLocalization.test.ts`
  - `tests/curriculumPrerequisites.test.ts`
- Verified:
  - `npm test`: pass, 209 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.

### Phase 2 - Routing and Navigation Unification

- Added `src/curriculum/routes.ts` to resolve canonical `/learn/:moduleId` and `/learn/:moduleId/:lessonId` paths while preserving current Math Lab and Data Lab runtime URLs.
- Added `src/curriculum/routeManifest.ts` as a lightweight route/navigation manifest aligned with the full catalog.
- Added catalog-driven `curriculumNavigationMenus` with Learning Path, Topic Library, Projects, and Progress top-level IA.
- Updated `AppShell.vue` to render the curriculum navigation model instead of directly importing the old Algorithm/Math/Data menu groups.
- Added canonical router entries for:
  - `/learn/:moduleId`
  - `/learn/:moduleId/:lessonId`
  - `/tracks/:trackId`
  - `/library/:domain`
  - `/progress`
- Preserved legacy Math Lab, Data Lab, linear regression, logistic regression, and CNN routes.
- Added lightweight curriculum route pages:
  - `src/views/CurriculumTrackView.vue`
  - `src/views/CurriculumLibraryView.vue`
  - `src/views/CurriculumProgressView.vue`
- Added/updated tests for route order, legacy route presence, catalog-derived navigation, and AppShell migration.
- Verified:
  - `npm test -- tests/curriculumRoutingNavigation.test.ts`: pass, 215 tests.
  - `npm test`: pass, 215 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.

### Phase 3 - Progress V2

- Added `src/curriculum/progress.ts` with:
  - `LearningProgressV2`
  - source-aware module progress states
  - source-aware quiz attempt records
  - V2 storage key `ml-atlas:learning-progress:v2`
  - migration marker key `ml-atlas:learning-progress:v2:migration`
  - idempotent v1-to-v2 migration
  - continue-learning selector using canonical module and lesson IDs
- Migration reads and preserves:
  - `ml-atlas:algorithm-progress:v1`
  - `ml-atlas:math-lab-progress:v1`
  - `ml-atlas:data-lab-progress:v1`
- Existing v1 keys are not deleted, renamed, or rewritten.
- `/progress` now reads Progress V2, migrates idempotently on mount, and shows continue-learning, completed module count, and checkpoint count.
- Added tests in `tests/curriculumProgress.test.ts` for missing stores, corrupted JSON, idempotence, conflict merging, v1 preservation, continue-learning, and route wiring.
- Verified:
  - `npm test -- tests/curriculumProgress.test.ts`: pass, 224 tests.
  - `npm test`: pass, 224 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.

### Phase 4 - Homepage and Information Architecture

- Added `docs/refactor/decisions/phase-4.md`.
- Refactored `src/views/HomeView.vue` from a full mixed catalog into a curriculum decision surface.
- Home now uses Progress V2 migration and `selectContinueLearning()` for global continue/start state.
- Home now uses lightweight curriculum navigation/route manifests for entry cards and labels.
- Removed homepage dependencies on:
  - `moduleOrder`
  - Math Lab-only `LearningRouteSummary`
  - Math Lab-only route summary modules
  - Math Lab-only progress loading
- Replaced the module gallery and duplicate long path section with:
  - a continue-learning panel
  - four route decision cards
  - preserved beginner roadmap and readiness checks
- Updated `src/styles/views/home.css` for the new decision surface and mobile layout.
- Fixed roadmap numbering for stages 10+.
- Added `tests/homeCurriculumIA.test.ts`.
- Updated stale module/layout tests so module registration is validated through catalogs/manifests rather than homepage source strings.
- Browser-checked desktop and mobile first viewports with Playwright.
- Verified:
  - `npm test`: pass, 227 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Playwright console: 0 warnings, 0 errors.
  - Playwright mobile overflow check: no horizontal overflow.

### Phase 5 - LessonPage and Block Renderer

- Added `docs/refactor/decisions/phase-5.md`.
- Added `src/lessons/LessonPage.vue` as the shared story-scroller lesson shell.
- Added `src/lessons/LessonBlockRenderer.vue` for localized section titles, markdown/math content, guide panels, optional visual/source blocks, and lab insertion slots.
- Added `src/lessons/labRegistry.ts` to keep pilot lab placement and render modes explicit.
- Routed these pilots through the shared lesson shell:
  - `ai-overview`
  - `gradient-descent`
  - `mlp`
- Preserved specialized lab behavior through the registry and named slots:
  - AI Overview task lab remains in-section.
  - Gradient Descent chapter lab remains in-section with Gradient-specific teaching blocks.
  - MLP cockpit remains before the story and receives active-section context.
- Removed duplicate explicit AI Overview, Gradient Descent, and MLP branches from `AlgorithmView.vue`.
- Fixed the generic results-grid panel title fallback so literal MLP section titles do not trigger missing i18n warnings.
- Added `tests/lessonPagePilot.test.ts`.
- Browser-checked the three pilot canonical lesson URLs with Playwright.
- Verified:
  - `npm test`: pass, 230 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Playwright pilot selector checks: pass.
  - Playwright pilot overflow checks: no horizontal overflow.
  - Playwright pilot console after the MLP fallback fix: existing Vite dev-mode externalization warnings only.

### Phase 6 - Teaching Interaction Protocol

- Added `docs/refactor/decisions/phase-6.md`.
- Added `src/lessons/interactionProtocol.ts` with typed protocol fields for:
  - learning goal
  - prediction prompt
  - manipulable variables
  - observable metrics
  - success criteria
  - reflection prompt
  - evidence
- Added pilot protocols for:
  - AI Overview task decomposition.
  - Gradient Descent safe learning-rate search.
  - MLP XOR capacity and generalization reading.
- Added `src/lessons/LessonInteractionProtocolPanel.vue`.
- Updated `src/lessons/LessonPage.vue` and `src/lessons/LessonBlockRenderer.vue` to resolve and render protocol guidance before pilot labs.
- Added responsive protocol styles in `src/styles/views/algorithm-shell.css`.
- Kept each pilot to one protocol anchor so the story scroller does not repeat identical task panels.
- Added `tests/teachingInteractionProtocol.test.ts`.
- Browser-checked the three pilot protocol URLs with Playwright at desktop and mobile widths.
- Verified:
  - `npm test`: pass, 232 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Playwright pilot protocol selector checks: pass.
  - Playwright pilot lab selector checks: pass.
  - Playwright pilot overflow checks: no horizontal overflow at 1280px or 390px widths.
  - Playwright pilot console: 0 errors; existing Vite dev-mode externalized module warnings only.

### Phase 7 - Milestone Audit

- Added `tests/curriculumMilestoneAudit.test.ts`.
- Added `docs/refactor/audits/curriculum-v2-milestone-audit.md`.
- Added `docs/refactor/summaries/phase-7.md`.
- Audited:
  - catalog and route manifest reachability
  - canonical route resolver coverage
  - legacy Math Lab, Data Lab, and bespoke algorithm chapter route support
  - GitHub Pages fallback script coverage
  - Progress V2 migration while retaining v1 storage values
  - bilingual catalog validation
  - LessonPage pilot protocol coverage
  - phase documentation presence
- Verified:
  - `npm test`: pass, 237 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.

### Phase 8A - Optimization Evidence Persistence

- Added Progress V2 lab evidence records for localized summary, metrics, prompt, source, module, source lab, and capture time.
- Added source-aware evidence upsert behavior so repeated lab control changes update the latest module/lab evidence record.
- Wired Math Lab `ExperimentEvidence` emissions into Progress V2.
- Added recent experiment evidence to `/progress`.
- Opened draft PR #8 from `codex/phase-8-optimization-learning`.
- Verified:
  - `npm test`: pass, 239 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Browser walkthrough for `/math-lab/modules/calculus-sgd-batch-noise` to `/progress`: pass.

### Phase 8B - Optimization Task Loop

- Added optional Math Lab `LabTaskConfig` for prediction and reflection prompts.
- Added Progress V2 task state for prediction, explanation, completion, and saved timestamp.
- Preserved saved task state when later evidence metrics refresh the same lab record.
- Added `LabTaskCard.vue` and rendered it next to selected task-enabled labs.
- Added task prompts to partial derivatives, SGD batch noise, and optimizer comparison.
- Added `/progress` status labels for observed evidence, explanation completion, and checkpoint completion.
- Verified:
  - `node --test tests/curriculumProgress.test.ts tests/math-lab-core.test.ts tests/math-lab-layout.test.mjs`: pass.
  - `npm test`: pass, 240 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Browser walkthrough with local Chrome: task save persisted, `/progress` showed task statuses, desktop and 390px mobile overflow checks passed, 0 console errors.

### Phase 9A - Curriculum Spine Data Contract

- Added `CurriculumSpineStage` to the shared curriculum contract.
- Added `src/curriculum/spine.ts` with a stage-level default route from orientation to `attention-transformer`.
- Encoded approved decisions:
  - data modules come before formal linear algebra,
  - `optimizer-comparison` is required before CNN/Attention,
  - `attention-transformer` is the endpoint,
  - `housing-price-project` and `classification-project` are project capstones rather than required blockers,
  - `llm-rag` stays outside Spine V1.
- Captured the missing sequence/embedding bridge as a known gap instead of inventing a fake catalog module.
- Added `tests/curriculumSpine.test.ts`.
- Updated Phase 9 design documentation.
- Verified:
  - `node --test tests/curriculumSpine.test.ts`: pass.
  - `node --test tests/curriculumSpine.test.ts tests/curriculumMilestoneAudit.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumCatalog.test.ts`: pass.
  - `npm test`: pass, 244 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.

### Phase 9B - Homepage And Navigation Realignment

- Aligned `coreLearningPathModuleIds` and `core-learning-path` with `curriculumSpineRequiredModuleIds()`.
- Updated top navigation labels to make Default Spine the first entry and Support Lenses the second entry.
- Rebuilt the homepage roadmap from `curriculumSpineStages` instead of a hard-coded old beginner route.
- Kept Math Lab, Data Lab, model, deep-learning, projects, and progress as reachable support surfaces.
- Updated continue-learning fallback tests so the first incomplete recommendation follows the data-first spine order.
- Centered the wide Support Lenses desktop menu so it remains inside the viewport when opened.
- Verified:
  - `node --test tests/curriculumRoutingNavigation.test.ts tests/homeCurriculumIA.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumProgress.test.ts tests/curriculumMilestoneAudit.test.ts tests/data-lab-layout.test.mjs`: pass.
  - `npm test`: pass, 245 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Playwright homepage check: desktop and mobile show Default Spine / Support Lenses, 11 spine stages render, desktop Support Lenses menu stays in viewport, no horizontal overflow, 0 console errors.

### Phase 9C - Spine Stage Landing View

- Added `/spine` as the dedicated Default Spine stage landing route.
- Added `CurriculumSpineView.vue` to render `curriculumSpineStages` as 11 stage cards with:
  - required modules,
  - support lenses,
  - recommended project validation,
  - completion standards,
  - known coverage gaps.
- Kept `/tracks/core-learning-path` as the flat module list and linked it from the stage landing view and progress page.
- Updated homepage, top navigation, and progress-page route entry points so Default Spine opens `/spine` first.
- Added GitHub Pages fallback coverage for `/spine`.
- Added tests for stage landing route wiring, source wiring, fallback generation, and legacy flat-track preservation.
- Verified:
  - `node --test tests/curriculumSpineLanding.test.ts tests/curriculumRoutingNavigation.test.ts tests/homeCurriculumIA.test.ts tests/data-lab-layout.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 25 tests.
  - `node --test tests/curriculumSpine.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumProgress.test.ts tests/curriculumSpineLanding.test.ts tests/curriculumRoutingNavigation.test.ts`: pass, 28 tests.
  - `npm test`: pass, 248 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Playwright `/spine` check: desktop and mobile show 11 stages and 11 stage-nav links, known gaps and project validation are visible, flat module list remains linked, no horizontal overflow, 0 console errors.

### Phase 9D - Sequence Embedding Bridge Module

- Added `sequence-embedding-bridge` as a compact required module before Attention/Transformer.
- Covered token sequence framing, token ids, embedding lookup, position/mask, and `[B,T,H]` handoff into Q/K/V.
- Inserted the module between `cnn-visualization` and `attention-transformer` in the default spine.
- Registered the module in the core track and legacy advanced-architecture navigation group.
- Added bilingual checkpoints, algorithm progress support, catalog coverage, and GitHub Pages fallback coverage.
- Verified:
  - `node --test tests/deep-learning-extension-modules.test.mjs tests/curriculumSpine.test.ts tests/curriculumRoutingNavigation.test.ts tests/curriculumCatalog.test.ts tests/algorithm-progress.test.ts tests/site-navigation.test.ts`: pass, 23 tests.
  - `git diff --check`: pass.
  - `npm test`: pass, 248 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - `node scripts/create-pages-fallbacks.mjs`: pass, 46 GitHub Pages SPA fallback routes.
  - Playwright `/learn/sequence-embedding-bridge` check: desktop and mobile show 5 chapter buttons, sequence-bridge workflow lab, 2 checkpoints, no horizontal overflow, and 0 console errors.

### Phase 9E - Route Copy Harmonization

- Added bilingual `bridge` copy to every `CurriculumSpineStage`.
- Rendered route bridge copy under each `/spine` stage learner question.
- Updated `/spine` hero copy so it reads as route guidance rather than gap tracking.
- Tightened selected completion standards into action-shaped outcomes.
- Verified:
  - `node --test tests/curriculumSpine.test.ts tests/curriculumSpineLanding.test.ts`: pass, 6 tests.
  - `node --test tests/curriculumSpine.test.ts tests/curriculumSpineLanding.test.ts tests/curriculumRoutingNavigation.test.ts tests/curriculumCatalog.test.ts tests/homeCurriculumIA.test.ts`: pass, 18 tests.
  - `git diff --check`: pass.
  - `npm test`: pass, 248 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - `node scripts/create-pages-fallbacks.mjs`: pass, 46 GitHub Pages SPA fallback routes.
  - Playwright `/spine` Phase 9E check: desktop and 390px mobile both show 11 stages and 11 bridge paragraphs, no horizontal overflow, 0 console errors.

### Phase 9F - Support Lens Guidance

- Added optional bilingual `supportNote` to `CurriculumSpineStage`.
- Added stage-specific support-lens notes for stages with support modules.
- Rendered support notes inside the existing `/spine` support-lens section while keeping the old generic copy as fallback.
- Verified:
  - `node --test tests/curriculumSpine.test.ts tests/curriculumSpineLanding.test.ts`: pass, 6 tests.
  - `node --test tests/curriculumSpine.test.ts tests/curriculumSpineLanding.test.ts tests/curriculumRoutingNavigation.test.ts tests/curriculumCatalog.test.ts tests/homeCurriculumIA.test.ts`: pass, 18 tests.
  - `git diff --check`: pass.
  - `npm test`: pass, 248 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - `node scripts/create-pages-fallbacks.mjs`: pass, 46 GitHub Pages SPA fallback routes.
  - Playwright `/spine` Phase 9F check: desktop and 390px mobile both show 11 stages, 11 bridge paragraphs, and 7 stage-specific support notes; no horizontal overflow; 0 console errors.

### Phase 10 - Sequence Bridge Shape Lab

- Added `src/simulations/sequenceBridgeLab.ts` for deterministic sequence shape and mask calculations.
- Added `src/components/SequenceBridgeShapeLab.vue` with controls for `B`, `T`, `H`, padding, mask mode, and query token.
- Replaced the sequence bridge workflow branch in `AppliedWorkflowLessonLab.vue` with the dedicated task lab.
- Added workflow styles for shape cards, mask visibility cells, controls, and mobile layout.
- Added `tests/sequence-bridge-lab.test.ts` and updated deep-learning extension module wiring tests.
- Added Phase 10 design, summary, and implementation plan docs.
- Verified:
  - `node --test tests/sequence-bridge-lab.test.ts tests/deep-learning-extension-modules.test.mjs`: pass, 6 tests.
  - `git diff --check`: pass.
  - `npm test`: pass, 251 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - `node scripts/create-pages-fallbacks.mjs`: pass, 46 routes.
  - Playwright `/learn/sequence-embedding-bridge/embedding-lookup`: desktop and 390px mobile render the shape lab, shape/mask controls update readouts, horizontal overflow is 0, console errors are 0.

### Phase 11 - Data Pipeline Task Lab

- Added `src/modules/data-lab/utils/pipelineTask.ts` for deterministic split/fit/transform, leakage, feature-count, and `[B,F]` matrix-shape calculations.
- Added `src/modules/data-lab/labs/DataPipelineTaskLab.vue` with scenario buttons for safe pipeline, leaky scaler, and leaky category vocabulary.
- Registered `DataPipelineTaskLab` in the typed Data Lab schema and lazy lab registry.
- Attached the task lab to the required `numerical-data` module near the existing pandas numeric pipeline.
- Added responsive Data Lab styles and source-wiring tests.
- Preserved non-goals: no backend, database, durable progress tracking, new route, full Data Lab migration, or general sklearn/pandas workflow editor.
- Verified:
  - `node --test tests/data-pipeline-task-lab.test.ts tests/data-lab.test.ts tests/data-lab-layout.test.mjs`: pass, 18 tests.
  - `git diff --check`: pass.
  - `npm test`: pass, 255 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - `node scripts/create-pages-fallbacks.mjs`: pass, 46 routes.
  - Playwright `/data-lab/modules/numerical-data`: desktop task lab renders, leaky scaler and vocabulary scenarios update readouts, feature toggles update `[B,F]`, 390px mobile has no horizontal overflow, console errors are 0.

### Phase 12 - Data-first Corridor Audit

- Added the Phase 12 design and completed audit for the required data-first corridor.
- Audited `ai-overview`, `python-notebook`, `numerical-data`, `categorical-data`, `dataset-quality`, and `housing-price-project`.
- Checked `splits-generalization` and `classification-project` as downstream boundaries.
- Found no P0 corridor blocker.
- Identified `categorical-data` as the highest-priority P1 because the existing broad lab did not force the vocabulary-contract decision.
- Recommended Phase 13 as the narrow categorical vocabulary contract task lab.
- Verified:
  - `git diff --check`: pass.
  - `node --test tests/curriculumMilestoneAudit.test.ts`: pass.

### Phase 13 - Categorical Vocabulary Contract Task Lab

- Added `src/modules/data-lab/utils/categoricalVocabularyTask.ts` for deterministic train-vocabulary, validation-recompute, all-data-vocabulary, and high-cardinality ID scenarios.
- Added `src/modules/data-lab/labs/CategoricalVocabularyTaskLab.vue` with scenario controls, feature toggles, rare threshold, slot alignment, OOV/RARE mapping, warnings, and `[B,F]` readouts.
- Registered `CategoricalVocabularyTaskLab` in the typed Data Lab schema and lazy lab registry.
- Attached the task lab to `categorical-data` near `vocabulary-contract` while keeping `CategoricalEncodingLab` reachable.
- Added responsive Data Lab styles and source-wiring tests.
- Preserved non-goals: no backend, database, durable progress tracking, new route, Data Lab schema migration, broad Data Lab rewrite, or extra Three.js interaction.
- Verified:
  - `node --test tests/categorical-vocabulary-task-lab.test.ts tests/data-lab.test.ts tests/data-lab-layout.test.mjs`: pass, 19 tests.
  - `git diff --check`: pass.
  - `npm test`: pass, 260 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - `node scripts/create-pages-fallbacks.mjs`: pass, 46 routes.
  - Playwright `/data-lab/modules/categorical-data`: desktop and 390px mobile render the task lab; safe scenario has no slot drift; validation recompute shows slot drift; horizontal overflow is false; console errors are 0.

### Phase 14 - Data Quality Decision Record

- Added `src/modules/data-lab/utils/dataQualityDecisionTask.ts` for deterministic missingness, duplicate, outlier, label-timing, and imbalance decision scenarios.
- Added `src/modules/data-lab/labs/DataQualityDecisionRecordLab.vue` with scenario controls, issue/treatment/risk selection, evidence card, shape impact, status feedback, code sketch, and decision-record preview.
- Registered `DataQualityDecisionRecordLab` in the typed Data Lab schema and lazy lab registry.
- Attached the task lab to `dataset-quality` near `quality-report` while keeping `EdaWorkbenchLab` and `CleaningPipelineLab` reachable.
- Added responsive Data Lab styles and source-wiring tests.
- Preserved non-goals: no backend, database, durable progress tracking, new route, Data Lab schema migration, project readiness checklist, general EDA/report builder, or extra Three.js interaction.
- Verified:
  - `node --test tests/data-quality-decision-record-lab.test.ts tests/data-lab.test.ts tests/data-lab-layout.test.mjs`: pass, 20 tests.
  - `git diff --check`: pass.
  - `npm test`: pass, 266 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - `node scripts/create-pages-fallbacks.mjs`: pass, 46 routes.
  - Playwright `/data-lab/modules/dataset-quality`: desktop and 390px mobile render the task lab; 5 scenarios are visible; default scenario is ready to record; under-stated duplicate risk shows review warning; horizontal overflow is false; console errors are 0.

### Phase 15 - Curriculum Architecture and Teaching Route Audit

- Added `docs/refactor/audits/phase-15-curriculum-architecture-teaching-route-audit.md`.
- Added `docs/refactor/summaries/phase-15.md`.
- Classified all 53 catalog modules by primary curriculum responsibility.
- Scored all 24 required-core modules with teaching quality classifications.
- Audited capability coverage across orientation, data-to-features, feature/loss, linear models, training mechanics, generalization, neural networks, vision, sequence/attention, projects, and advanced applications.
- Findings:
  - P0: legacy algorithm order can still contradict the approved spine.
  - P1: curriculum role is implicit outside the spine page.
  - P1: neural-network foundation depth needs a backprop/autodiff decision.
  - P1: required-core interaction quality is uneven.
  - P1: homepage readiness/progress framing should not become the next milestone driver.
  - P2: project readiness is useful but should wait.
- Verified:
  - `git diff --check`: pass.

### Phase 16 - Curriculum Role Metadata and Legacy Order Cleanup

- Added `src/curriculum/roles.ts` to derive one primary curriculum role for every catalog module.
- Classified modules as required core, just-in-time support, project validation, advanced extension, reference library, or duplicate/overlap.
- Rendered localized role badges on Topic Library cards.
- Realigned legacy algorithm `moduleOrder` so projects and advanced modules no longer appear before required foundations.
- Updated old order tests that still encoded pre-spine migration assumptions.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new inventory, bulk LessonPage migration, or legacy route removal.
- Verified:
  - `node --test tests/curriculumRoles.test.ts tests/curriculumRoutingNavigation.test.ts tests/curriculumCatalog.test.ts tests/curriculumSpine.test.ts tests/curriculumMilestoneAudit.test.ts tests/linear-regression-layout.test.mjs tests/deep-learning-extension-modules.test.mjs tests/logistic-regression-cockpit.test.mjs`: pass, 44 tests.
  - `node --test tests/classification-project-module.test.mjs tests/mlp-workbench.test.mjs tests/model-selection-module.test.mjs tests/python-and-housing-modules.test.mjs tests/tree-forest-module.test.mjs`: pass, 18 tests.
  - `npm test`: pass, 270 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Playwright Topic Library check: `/library/math` desktop and `/library/deep-learning` at 390px render role badges, have no horizontal overflow, and report 0 console errors.

### Phase 17 - MLP Backprop Mechanism Bridge

- Added `src/simulations/mlpBackpropBridge.ts` as a deterministic scalar one-hidden-unit MLP helper.
- Added `src/components/MlpBackpropBridgeLab.vue` as a narrow prediction/evidence task for the MLP `backprop` lesson.
- Wired the bridge directly in `src/views/AlgorithmView.vue` only for `isMlpPage && section.id === 'backprop'`.
- Kept the existing top-level `MlpPlaygroundCockpit` intact.
- Kept `matrix-calculus-autodiff` as just-in-time support instead of promoting it into required core.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new course inventory, broad lab registry redesign, or legacy route removal.
- Verification is tracked in `docs/refactor/summaries/phase-17.md`.

### Phase 18 - Optimizer To CNN Handoff Audit

- Added `docs/refactor/audits/phase-18-optimizer-cnn-handoff-audit.md`.
- Added `docs/refactor/summaries/phase-18.md`.
- Confirmed the required route is `optimizer-comparison -> tensor-shapes-vectorization -> cnn-visualization`, not a direct optimizer-to-CNN jump.
- Classified `tensor-shapes-vectorization` as the existing required bridge for shape literacy.
- Chose the next implementation direction: a CNN shape/parameter challenge that connects formula, code, output shape, convolution parameter count, and dense-layer comparison.
- Kept optimizer comparison as a later interaction-upgrade candidate; it is weak but not the immediate handoff blocker.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new inventory, route rewrite, runtime lab code, or broad LessonPage migration.
- Verified:
  - `node --test tests/curriculumMilestoneAudit.test.ts`: pass.
  - `git diff --check`: pass.

### Phase 19 - CNN Shape/Parameter Challenge

- Added `docs/refactor/designs/phase-19-cnn-shape-parameter-challenge.md`.
- Added `docs/superpowers/specs/2026-07-08-cnn-shape-parameter-challenge-design.md`.
- Added `docs/superpowers/plans/2026-07-08-cnn-shape-parameter-challenge.md`.
- Chose a narrow `CnnShapeParameterChallengeLab` for `cnn-visualization` `channels-feature-maps`.
- Confirmed the implementation should wire directly in `src/views/AlgorithmView.vue`, because the active CNN runtime uses `CnnExplainerLab` rather than the CNN branch in `AppliedWorkflowLessonLab.vue`.
- Added `src/simulations/cnnShapeParameterChallenge.ts`.
- Added `src/components/CnnShapeParameterChallengeLab.vue`.
- Wired the challenge directly into `src/views/AlgorithmView.vue` for `channels-feature-maps`.
- Updated `src/data/cnnVisualizationModule.ts` to point the learner prompt at the prediction task.
- Added `tests/cnn-shape-parameter-challenge.test.ts`.
- Added `docs/refactor/summaries/phase-19.md`.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new transition module, route rewrite, CNN explainer replacement, inactive `AppliedWorkflowLessonLab` CNN wiring, or bulk LessonPage migration.
- Verified:
  - `node --test tests/cnn-shape-parameter-challenge.test.ts`: pass, 5 tests.
  - `node --test tests/cnn-shape-parameter-challenge.test.ts tests/cnn-explainer.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 18 tests.
  - `npm test`: pass, 279 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Playwright desktop and 390px mobile checks on `/learn/cnn-visualization/channels-feature-maps`: no horizontal overflow, console errors 0, challenge and `CnnExplainerLab` both render.

### Phase 20 - Optimizer Curve Diagnosis Challenge Design

- Added `docs/refactor/designs/phase-20-optimizer-curve-diagnosis-challenge.md`.
- Added `docs/superpowers/specs/2026-07-08-optimizer-curve-diagnosis-design.md`.
- Added `docs/superpowers/plans/2026-07-08-optimizer-curve-diagnosis-challenge.md`.
- Chose a narrow `OptimizerCurveDiagnosisChallengeLab` for `optimizer-comparison` `curve-diagnosis`.
- Confirmed the implementation should wire directly in `src/components/AppliedWorkflowLessonLab.vue`, because the active optimizer runtime uses `optimizerStages` inside that shared workflow component.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new optimizer module, route rewrite, broad simulator, Math Lab migration, `LessonPage` migration, or existing optimizer stage replacement.
- Verified:
  - `node --test tests/curriculumMilestoneAudit.test.ts`: pass.
  - `git diff --check`: pass.

### Phase 20 - Optimizer Curve Diagnosis Challenge Implementation

- Added `src/simulations/optimizerCurveDiagnosisChallenge.ts`.
- Added `src/components/OptimizerCurveDiagnosisChallengeLab.vue`.
- Wired the challenge directly into `src/components/AppliedWorkflowLessonLab.vue` for `optimizer-comparison` `curve-diagnosis`.
- Updated `src/data/optimizerComparisonModule.ts` to point the learner prompt at the prediction task.
- Added `tests/optimizer-curve-diagnosis-challenge.test.ts`.
- Added `docs/refactor/summaries/phase-20.md`.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new optimizer module, route rewrite, broad simulator, Math Lab migration, `LessonPage` migration, or existing optimizer stage replacement.
- Verified:
  - `node --test tests/optimizer-curve-diagnosis-challenge.test.ts`: pass, 3 tests.
  - `node --test tests/optimizer-curve-diagnosis-challenge.test.ts tests/deep-learning-extension-modules.test.mjs`: pass, 6 tests.
  - `node --test tests/optimizer-curve-diagnosis-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 12 tests.
  - `npm test`: pass, 282 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Playwright desktop and 390px mobile checks on `/learn/optimizer-comparison/curve-diagnosis`: no horizontal overflow, console errors 0, challenge and existing optimizer stage explanation both render.

### Phase 21 - Attention Q/K/V Softmax Task Design

- Added `docs/refactor/designs/phase-21-attention-qkv-softmax-task.md`.
- Added `docs/superpowers/specs/2026-07-08-attention-qkv-softmax-task-design.md`.
- Chose a narrow `AttentionQkvChallengeLab` for `attention-transformer` `softmax-weighted-sum`.
- Confirmed the implementation should wire directly in `src/components/AppliedWorkflowLessonLab.vue`, because the active Attention runtime uses `attentionStages` inside that shared workflow component.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new Attention module, route rewrite, broad Transformer simulator, multi-head expansion, semantic NLP task, Math Lab migration, `LessonPage` migration, or existing Attention stage replacement.
- Design review should happen before creating the formal implementation plan or runtime code.

### Phase 21 - Attention Q/K/V Softmax Task Implementation

- Added `src/simulations/attentionQkvChallenge.ts`.
- Added `src/components/AttentionQkvChallengeLab.vue`.
- Wired the challenge directly into `src/components/AppliedWorkflowLessonLab.vue` for `attention-transformer` `softmax-weighted-sum`.
- Updated `src/data/attentionTransformerModule.ts` to point the learner prompt at the prediction task.
- Added `tests/attention-qkv-challenge.test.ts`.
- Added `docs/refactor/summaries/phase-21.md`.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new Attention module, route rewrite, broad Transformer simulator, multi-head expansion, semantic NLP task, Math Lab migration, `LessonPage` migration, or existing Attention stage replacement.
- Verified:
  - `node --test tests/attention-qkv-challenge.test.ts`: pass, 3 tests.
  - `node --test tests/attention-qkv-challenge.test.ts tests/deep-learning-extension-modules.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 12 tests.
  - `npm test`: pass, 285 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Browser desktop and 390px mobile checks on `/learn/attention-transformer/softmax-weighted-sum`: no horizontal overflow, console errors 0, challenge and existing Attention stage explanation both render.

### Phase 22 - Transformer Block Assembly Challenge Design

- Added `docs/refactor/designs/phase-22-transformer-block-assembly-challenge.md`.
- Added `docs/superpowers/specs/2026-07-08-transformer-block-assembly-design.md`.
- Transformer block assembly challenge design recorded the chosen narrow task, non-goals, and implementation handoff.
- Audited the `attention-transformer -> llm-rag` handoff and confirmed `llm-rag` remains an advanced extension, not a required Spine V1 module.
- Chose a narrow `TransformerBlockAssemblyChallengeLab` for `attention-transformer` `transformer-block`.
- Rejected route-copy-only work as too weak and deferred RAG grounding diagnostics until the required Attention endpoint has active block-level reasoning.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new Attention/Transformer/LLM/RAG module, route rewrite, curriculum role change, full Transformer simulator, generation demo, RAG surface, semantic NLP task, multi-head visualization, `LessonPage` migration, or existing Attention stage replacement.
- Design review should happen before creating the formal implementation plan or runtime code.

### Phase 22 - Transformer Block Assembly Challenge Implementation

- Added `src/simulations/transformerBlockAssemblyChallenge.ts`.
- Added `src/components/TransformerBlockAssemblyChallengeLab.vue`.
- Wired the challenge directly into `src/components/AppliedWorkflowLessonLab.vue` for `attention-transformer` `transformer-block`.
- Updated `src/data/attentionTransformerModule.ts` to point the learner prompt at the block challenge.
- Added `tests/transformer-block-assembly-challenge.test.ts`.
- Added `docs/refactor/summaries/phase-22.md`.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new Attention/Transformer/LLM/RAG module, route rewrite, curriculum role change, full Transformer simulator, generation demo, RAG surface, semantic NLP task, multi-head visualization, `LessonPage` migration, or existing Attention stage replacement.

## Next Recommended Command

Verify and ship the Phase 22 implementation PR:

- `src/simulations/transformerBlockAssemblyChallenge.ts`
- `src/components/TransformerBlockAssemblyChallengeLab.vue`
- `src/components/AppliedWorkflowLessonLab.vue`
- `src/styles/views/algorithm-shell.css`
- `src/data/attentionTransformerModule.ts`
- `tests/transformer-block-assembly-challenge.test.ts`
- `tests/deep-learning-extension-modules.test.mjs`
- `docs/refactor/summaries/phase-22.md`
- `.planning/STATE.md`
- `tests/curriculumMilestoneAudit.test.ts`

Suggested next direction after Phase 22 lands: decide whether the next content-quality slice should strengthen `architecture-to-tools` LLM tooling handoff or move into optional `llm-rag` grounding diagnostics. Continue avoiding backend, database, account, durable progress scope, project readiness checklists, broad route migration, new course inventory, full Transformer simulation, generation demos, RAG surfaces, semantic NLP tasks, and multi-head expansion unless a later design explicitly chooses it.
