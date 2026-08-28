---
gsd_state_version: 1.0
milestone: v1.1
milestone_name: Classical Supervised Learning
current_phase: 31
current_phase_name: corridor-integration-and-release
status: completed
stopped_at: Phase 31 corridor integration and release verification passed
last_updated: "2026-08-29T02:45:41+08:00"
last_activity: 2026-08-29
last_activity_desc: Phase 31 closed the five-module loss-to-decision corridor after full release and browser verification
progress:
  total_phases: 9
  completed_phases: 9
  total_plans: 37
  completed_plans: 37
  percent: 100
current_plan: null
---

# GSD State: ML Atlas Curriculum V3 Content Delivery

**Updated:** 2026-08-29
**Status:** Phase 31 complete; v1.1 is ready for milestone audit and closeout

## Current Position

Phase: 31 (corridor-integration-and-release) — COMPLETE
Plan: 31-PLAN.md complete
Status: The five classical supervised modules and AI Foundations B-stage now form one verified route
Last activity: 2026-08-29 — Phase 31 passed typed-contract, compatibility, full-suite, build, security, and 20-case real-browser gates

## Deferred Items

Items acknowledged and deferred at the v1.0 override closeout on 2026-07-26:

| Category | Item | Status |
| --- | --- | --- |
| progress | Checkpoint completion and quiz-attempt persistence | Deferred to backend/database milestone |
| curriculum | CURR-04 catalog-derived prerequisite ordering | Partial; deferred |
| homepage | HOME-01 and HOME-02 decision-surface hierarchy | Partial; paused |
| renderer | LESSON-01 full typed block/checkpoint contract | Partial; deferred |
| interaction | LAB-02 static workflow labeling cleanup | Partial; deferred |
| validation | VAL-04 clean milestone provenance and gap-free audit | Accepted technical debt |
| planning | Historical Phases 1–24A canonical verification/summary provenance | Accepted technical debt |

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-07-26)

**Core value:** Students should always know where they are in the learning path, why the current lesson matters, and what evidence shows they are ready for the next step.
**Current focus:** Phase 31 — complete; audit and close the v1.1 milestone while keeping AI Foundations C and D planned until their stage-level teaching gates pass

## Baseline

- `npm test`: pass, 1148 tests (1120 pass, 28 skip) after Phase 31 corridor integration.
- `npm run build`: pass with existing Vite large-chunk warning.
- `npm run build:pages`: pass with existing Vite large-chunk warning.
- `npm run security:audit`: pass, 0 vulnerabilities.
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
- Phase 23 design chooses a narrow `ArchitectureToolsHandoffChallengeLab` in `attention-transformer` `architecture-to-tools`; it should ask learners to map tokenizer, attention mask, Transformer blocks/model, and logits back to architecture evidence before optional RAG content.
- Phase 23 Architecture-to-tools handoff challenge implementation completed the required Attention endpoint tooling-mapping task without changing routes, roles, checkpoints, durable progress, or `llm-rag` advanced-extension status.
- The post-Phase-23 content direction remains an optional `llm-rag` diagnostic task after the required Attention endpoint audit; Phase 24A does not implement or reprioritize that content work.
- Phase 24A navigation and Topic Library implementation completed the typed domain contract, invalid-domain redirect, simplified five-destination global IA, shared desktop/mobile renderer, keyboard/focus repairs, and scoped navigation-style consolidation.
- Phase 24A preserves course bodies, checkpoints, curriculum roles, Spine order, Progress V1/V2 storage, and canonical and legacy course routes; Phase 24B Homepage Focus remains planned and has not started.
- Curriculum V3.0 completed a typed blueprint of exactly 56 instructional modules, 6 projects, 10 learning arcs, and 7 exit capabilities, plus a classification audit of all 53 current modules.
- The completed AI Overview rebuild and Math-to-Code pilot are slices of V3.1; V3.1 as a whole remains in progress.
- Rebuild the existing `python-notebook` ID and `/learn/python-notebook` route in five separately verified stages.
- Python Data Tools Stage 1 completed the verified snapshot, typed contract, exact environment pins, and offline verifier without changing runtime lesson content.
- Python Data Tools Stage 2 completed the eight-chapter Chinese master, stable cell/output/exercise markers, and static structure tests without changing runtime lesson content.
- Python Data Tools Stage 3 completed the clean-kernel Chinese Notebook, eight authoritative outputs, bundled Chinese chart font, deterministic generation, offline verification, and atomic rollback coverage without changing runtime lesson content.
- Python Data Tools Stage 4 specification and implementation context approved eight falsifiable requirements, 18 resolved edge cases, five must-NOT constraints, a paged teaching structure, bilingual master authority, static teaching prompts, explicit legacy redirects, and checkpoint compatibility.
- Python Data Tools Stage 4 completed all 12 plans across 9 waves: eight paired bilingual chapters, manifest-driven JSON/PNG/Plotly results, five static teaching prompts, exact legacy redirects, course-review compatibility, and preserved Progress V1/V2 storage all passed focused/full/build/browser gates.
- Python Data Tools Stage 4 quality consolidation completed in `69dca50`: current-chapter output loading, on-demand PNG fallbacks, structured Plotly labels, a dedicated course route view, and Course Review presentation without visible Progress state all passed 645 tests, both builds, security audit, and focused browser checks.
- Python Data Tools Stage 5 design is complete in four ordered plans. Execution must first remove learner-visible evidence/证据 code terminology while preserving internal output IDs, then verify the full authority/hash chain, run the 36-cell bilingual responsive matrix plus six failure injections, and close with standard/Pages release gates.
- Numerical Methods Batch 2 completed the UCI SMS TF-IDF/CSR and standardized Ames PCA teaching route with two standalone executed Notebooks, locked outputs, one shared illustration, two Manim videos, real-case lab alignment, exact route-order reconciliation, and full release/browser validation.
- Numerical Methods Batch 3 completed the finite-difference and nonlinear-equation route through one deterministic logit-bias calibration case, a shared executed Notebook, locked step-size and solver traces, two upgraded existing labs, one shared illustration, two Manim videos, and full release/browser validation.
- Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure remain paused.
- Curriculum V3.0 changed no runtime lesson, route, or Progress V1/V2 data or storage behavior.

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

### Phase 23 - Architecture-to-Tools Handoff Challenge Design

- Added `docs/refactor/designs/phase-23-architecture-tools-handoff-challenge.md`.
- Added `docs/superpowers/specs/2026-07-08-architecture-tools-handoff-design.md`.
- Architecture-to-tools handoff challenge design recorded the chosen narrow task, non-goals, and implementation handoff.
- Audited the final `attention-transformer` chapter and confirmed `llm-rag` remains an advanced extension, not a required Spine V1 module.
- Chose a narrow `ArchitectureToolsHandoffChallengeLab` for `attention-transformer` `architecture-to-tools`.
- Rejected route-copy-only work as too weak and deferred RAG grounding diagnostics until the required Attention endpoint has active tooling-mapping evidence.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new Attention/Transformer/LLM/tooling/RAG module, route rewrite, curriculum role change, real tokenizer integration, model call, generation demo, RAG surface, chat UI, semantic NLP task, full Transformer simulator, multi-head visualization, `LessonPage` migration, or existing Attention stage replacement.
- Design review should happen before creating the formal implementation plan or runtime code.

### Phase 23 - Architecture-to-Tools Handoff Challenge Implementation

- Added `src/simulations/architectureToolsHandoffChallenge.ts`.
- Added `src/components/ArchitectureToolsHandoffChallengeLab.vue`.
- Wired the challenge directly into `src/components/AppliedWorkflowLessonLab.vue` for `attention-transformer` `architecture-to-tools`.
- Updated `src/data/attentionTransformerModule.ts` to point the learner prompt at the tools handoff challenge.
- Added `tests/architecture-tools-handoff-challenge.test.ts`.
- Added `docs/refactor/summaries/phase-23.md`.
- Preserved non-goals: no backend, database, durable progress expansion, project readiness checklist, new Attention/Transformer/LLM/tooling/RAG module, route rewrite, curriculum role change, real tokenizer integration, model call, generation demo, RAG surface, chat UI, semantic NLP task, full Transformer simulator, multi-head visualization, `LessonPage` migration, or existing Attention stage replacement.
- Verified:
  - `node --test tests/architecture-tools-handoff-challenge.test.ts`: pass, 3 tests.
  - `node --test tests/deep-learning-extension-modules.test.mjs tests/attention-qkv-challenge.test.ts tests/transformer-block-assembly-challenge.test.ts`: pass, 9 tests.
  - `npm test`: pass, 291 tests.
  - `npm run build`: pass with existing large-chunk warning.
  - `npm run build:pages`: pass with existing large-chunk warning.
  - Browser desktop and 390px mobile checks on `/learn/attention-transformer/architecture-to-tools`: console errors 0, no horizontal overflow, challenge/evidence/feedback and existing Attention stage explanation render.

### Phase 24A - Navigation and Topic Library

- Added the typed bilingual Topic Library domain contract and redirected invalid `/library/:domain` values to `/library/math`.
- Simplified global navigation to Home, Default Spine, Topic Library, Projects, and Progress; Topic Library now contains only four domain links and no module inventory.
- Extracted `SiteHeader.vue` and `SiteNavigation.vue` so desktop and mobile navigation consume the same rendered model.
- Preserved Escape closing, focus return, route-change menu closure, ARIA state, English/Chinese labels, and 390px readability.
- Consolidated header/navigation layout selectors under `src/styles/layout/site-header.css` while keeping Progress secondary styling transparent at 390px.
- Added `docs/refactor/summaries/phase-24a.md` and milestone audit coverage.
- Preserved non-goals: no Phase 24B homepage implementation, Phase 24C Spine implementation, course-body/checkpoint changes, curriculum role or Spine-order changes, Progress V1/V2 changes, backend/database/account scope, or broad CSS cleanup.
- Browser acceptance was supplied by the main agent from local Vite at `http://127.0.0.1:5174`: the five primary routes had no overflow or console errors at 1280×900 and 390×844; invalid-domain redirect, four-domain menus, Escape/focus return, mobile route closure, transparent mobile Progress styling, and English labels passed.
- Verified:
  - `npm test`: pass, 295 tests, 0 failures.
  - `npm run build`: pass; Vite 8.0.16 transformed 2399 modules with the existing chunks-larger-than-1400-kB warning.
  - `npm run build:pages`: pass; Vite 8.0.16 transformed 2399 modules with the same existing warning.
  - `git diff --check`: pass, no whitespace errors.

### Curriculum V3.0 - Blueprint and 53-Module Content Audit

- Completed the typed Curriculum V3.0 blueprint for exactly 56 instructional modules and 6 projects.
- Classified all 53 current modules against the target inventory.
- Defined exactly 10 learning arcs and 7 exit capabilities.
- Generated deterministic documentation under `docs/curriculum-v3/` and recorded completion in `docs/refactor/summaries/curriculum-v3-0.md`.
- Preserved the runtime boundary: no runtime lesson, route, or Progress data changed.
- At V3.0 closeout, the V3.1 phase was recorded as the next unstarted phase; subsequent independently verified slices supersede that current-state description.

### Curriculum V3.1 - Completed Slices and Current Python Data Tools Work

- V3.1 AI Overview rebuild and Math-to-Code pilot are completed slices; they do not complete V3.1 as a whole.
- Completed the AI Overview rebuild and Math-to-Code pilot as independently verified V3.1 slices; they do not complete V3.1 as a whole.
- Python Data Tools Stage 1 is complete: the verified dataset snapshot, typed chapter/output contract, exact environment pins, offline validation, tests, production build, and GitHub Pages build passed without changing current runtime lesson content.
- Python Data Tools Stage 2 is complete: it delivered the eight-chapter Chinese master, stable cell/output/exercise markers, planning calibration, and static tests without runtime changes.
- Python Data Tools Stage 3 delivered an executed 48-code-cell Chinese Notebook, eight authoritative outputs, a pinned local Chinese chart font, deterministic regeneration, and atomic rollback coverage without runtime changes.
- Stage 3 verification passed the static Notebook/output contract, clean regeneration and byte-equality checks, failure-injection rollback, the complete 571-test suite, and production and GitHub Pages builds.
- Python Data Tools Stage 4 is complete. It delivered complete eight-chapter English semantic parity, a dedicated current-chapter-only paged runtime, five exact legacy redirects, manifest-driven JSON/PNG/Plotly results, two base-safe Notebook download placements, five static teaching prompts, two new course-review checkpoint IDs, and local bilingual fallbacks.
- Stage 4 preserved the three V1 Progress stores, V2/migration keys, historical attempt prefix, existing append writer, module identity, root route, and required-core curriculum role. It added no browser Python, backend kernel, upload, cleaning implementation, model training, inference statistics, causal claims, or prompt scoring/gating.
- Stage 4 closeout passed the eight-pair preflight, generated-content compiler check, 117 Python Data Tools tests, 644 repository tests, standard and Pages builds, security audit, diff/scope audit, and a bounded root/canonical/legacy/next/previous browser smoke with zero final console errors.
- Stage 4 quality consolidation `69dca50` then narrowed output requests to the current chapter, made PNG fallback data demand-driven, moved the course to a dedicated route view, and removed visible Progress state from Course Review; 645 repository tests, both builds, security audit, and focused browser checks passed.
- Python Data Tools Stage 5 design is complete: four ordered plans cover learner-visible terminology and deterministic asset regeneration, authority/request/Progress gates, a 36-cell bilingual responsive matrix plus six failure injections, and standard/Pages release closeout.
- Phase 24B Homepage Focus and Phase 24C Spine progressive disclosure remain paused.

### Numerical Methods Batch 2 - Sparse Matrices and PCA

- Completed detailed bilingual `sparse-matrices` and `pca` lessons while preserving their existing URLs, checkpoints, and Progress behavior.
- Added a verified 5,574-row UCI SMS snapshot and deterministic TF-IDF/CSR Notebook; fixed output is `5574×1881`, `nnz=69798`, density `0.66571%`, and about `97.55x` dense/CSR storage ratio.
- Added a standalone Ames PCA Notebook over `2927×8` standardized features; two components retain `71.7312%`, four retain `92.1506%`, and four-component reconstruction RMSE is `0.280168`.
- Added one shared generated illustration, two 1080p Manim videos with local posters/transcripts/metadata, and upgraded the existing sparse/PCA labs to state their real-data versus schematic boundaries.
- Reconciled the Numerical Methods route order and regenerated catalog documentation.
- Verified both standalone Notebook reruns, both Manim asset checks, 708 tests, standard and Pages builds, a 0-vulnerability audit, and Chinese/English desktop plus 390px browser checks with zero console errors and no horizontal overflow.
- Completion record: `docs/refactor/summaries/numerical-methods-batch-2.md`.

### Numerical Methods Batch 3 - Finite Differences and Nonlinear Equations

- Completed detailed bilingual `finite-difference-methods` and `nonlinear-equations` lessons while preserving their existing URLs, checkpoints, and Progress behavior.
- Added one deterministic 12-logit calibration fixture and a shared executed Notebook that connects finite-difference derivative checks directly to solving the same residual equation.
- Locked the complete `h=10^-1` through `10^-12` error sweep and the bisection, Newton, and secant traces, including explicit invalid-bracket and saturated-derivative failure cases.
- Upgraded the two existing labs with the real calibration preset while retaining their earlier comparison functions and teaching modes.
- Added one shared generated illustration and two 1080p Manim videos with local posters, transcripts, English summaries, labels, prompts, and hash metadata.
- Verified the shared Notebook rerun, Manim asset checks, 718 tests, standard and Pages builds, a 0-vulnerability audit, and Chinese/English desktop plus 390px browser checks with zero console errors and no horizontal overflow.
- Completion record: `docs/refactor/summaries/numerical-methods-batch-3.md`.

## Next Recommended Command

Complete and publish AI Foundations B units 07–14 as one teaching-closed stage, then run Phase 31 corridor integration and release verification.

## Accumulated Context

### Roadmap Evolution

- Phase 25 added: Numerical Methods Batch 4: Logistic Regression Optimization and Training Diagnostics

## Session

**Last session:** 2026-08-29T02:09:26+08:00
**Stopped at:** Phase 30 implementation and release verification passed
**Resume file:** None

## Performance Metrics

| Phase | Plan | Duration | Notes |
|-------|------|----------|-------|
| 25 | 01 | 1 min | 1 task, 0 files |
| Phase 25 P03 | 23 min | 3 tasks | 8 files |
| Phase 25 P04 | 11 min | 2 tasks | 3 files |
| Phase 25 P06 | 43 min | 1 tasks | 6 files |
| Phase 25 P07 | 15 min | 1 tasks | 6 files |
| Phase 25 P08 | 13 min | 1 tasks | 6 files |
| Phase 25 P05 | 19 min | 3 tasks | 9 files |
| Phase 25 P10 | 15 min | 2 tasks | 7 files |
| Phase 25 P09 | 14 min | 1 tasks | 4 files |
| Phase 25 P11 | 8 min | 1 tasks | 9 files |
| Phase 25 P12 | 15 min | 2 tasks | 2 files |
| Phase 25 P13 | 14h 35m | 1 tasks | 3 files |
| Phase 26 P01 | 18 min | 3 tasks | 5 files |
| Phase 26 P02 | 12 min | 2 tasks | 5 files |
| Phase 26 P03 | 15 min | 2 tasks | 5 files |
| Phase 26 P04 | 41 min | 2 tasks | 3 files |
| Phase 26 P05 | 26 min | 2 tasks | 19 files |
| Phase 26 P06 | 25m | 3 tasks | 5 files |
| Phase 26 P07 | 34m | 3 tasks | 11 files |
| Phase 27 P01 | 17min | 3 tasks | 4 files |
| Phase 27 P02 | 15 min | 2 tasks | 6 files |
| Phase 27 P03 | 24 min | 2 tasks | 2 files |
| Phase 27 P04 | 22 min | 3 tasks | 11 files |
| Phase 27 P05 | 23 min | 2 tasks | 2 files |
| Phase 27 P06 | 20m | 3 tasks | 8 files |
| Phase 27 P07 | 23min | 3 tasks | 5 files |
| Phase 27 P08 | 33m | 3 tasks | 8 files |
**Per-Plan Metrics:**

| Plan | Duration | Tasks | Files |
|------|----------|-------|-------|
| Phase 28.2 P01 | 0m | 3 tasks | 18 files |
| Phase 28.2 P02 | 12m | 2 tasks | 33 files |
| Phase 28.2 P03 | 20min | 3 tasks | 20 files |
| Phase 29 P00 | 27m | 3 tasks | 10 files |
| Phase 29-logistic-regression-rebuild P01 | 36m | 2 tasks | 7 files |
| Phase 29 P02 | 2h | 3 tasks | 26 files |

## Decisions

- [Phase 25]: Validate normalized CSV round-trip statistics at 1e-12 — CSV decimal parsing introduces only a few floating-point ulps while retaining a tolerance one thousand times stricter than the scalar output contract.
- [Phase 25]: Record isolated-kernel and standalone-rerun proofs without temp identities — Deterministic published artifacts must prove their clean execution environment without persisting machine-specific temporary paths or kernelspec names.
- [Phase 25]: Keep Plan 25-04 RED owners aligned with its future stable-BCE and state-machine filters — Plan 25-03 broad verification stays green while the next plan retains its intentionally failing ownership tests.
- [Phase 25]: Keep the Banknote loader and logistic engine separated — The loader owns fetch/public-base/CSV trust boundaries while the engine accepts typed rows and remains DOM-free.
- [Phase 25]: Return explicit invalid-config results while allowing Number.MAX_VALUE — Advanced controls are never silently clamped, and the exact D-24 safety probe remains learner-reachable.
- [Phase 25]: Verify all accepted states across all five TypeScript runs — Per-row 1e-9 scalar and 1e-8 parameter checks catch drift hidden by terminal-only assertions.
- [Phase 25]: Plot full accepted-state traces while binding printed scene anchors to the manifest and optimization summary — This satisfies D-28 without schematic replacement values and keeps learner-visible numbers auditable.
- [Phase 25]: Use square/raw and circle/standardized terminal markers with written terminal semantics — The source remains understandable without color or motion and distinguishes model selection from mathematical convergence.
- [Phase 25]: Limit the scaling comparison to conditioning and fixed-step usability — Changing feature units changes coefficient-space L2 geometry, so the paired validation BCE values cannot rank final model quality.
- [Phase 25]: Reconstruct the rejected alpha=32 candidate from the fixed-step run and verify it shares the accepted alpha=16 direction. — The locked trace stores accepted states only, so a rejected trial must remain an audited annotation rather than a fabricated trace row.
- [Phase 25]: Use the penalized training objective and gradient only for Armijo acceptance. — Validation is evaluated after acceptance and must not leak into sufficient-decrease decisions.
- [Phase 25]: Encode fixed-step and Armijo traces with dashed-square versus solid-circle semantics. — The comparison must remain readable without color or motion.
- [Phase 25]: Validate all five locked diagnostic chains at render time — The animation focuses on two controlled comparisons while the source fails closed on every Plan 25-03 diagnosis.
- [Phase 25]: Format learner-visible scene numbers from loaded JSON — Expected constants remain drift assertions only, preserving D-28 auditability.
- [Phase 25]: Separate best-validation and terminal meanings with text and shape — Diamond best markers, square or circle terminals, and dashed or solid paths preserve non-color fallback.
- [Phase 25]: Keep Batch 4 as an outer enhancer for only optimization and training-diagnostics, preserving existing IDs, quizzes, checkpoints, routes, and progress state. — A narrow adapter delivers the real Banknote case without violating the progressive-migration guardrails.
- [Phase 25]: Preset selection edits draft state; only explicit Run commits a deterministic engine result. — Separating learner intent from computation prevents reactive retraining and makes invalid or last-finite outcomes auditable.
- [Phase 25]: Compute the five real diagnostic traces once after local loading and isolate synthetic scenarios in a labeled support section. — Selectors remain responsive without duplicating math, and real versus synthetic provenance stays honest.
- [Phase 25]: Validate one exact three-scene Batch 4 renderer manifest before any render — Scene IDs/classes, six roles, depth-three trees, bilingual labels, output IDs, anchors, dependencies, and hashes are one fail-closed contract.
- [Phase 25]: Hash-preserve every pre-existing non-Batch-4 media file across publication — The temporary copy, published directory, and rollback state must keep Batches 1-3 byte-identical.
- [Phase 25]: Keep the Batch 4 renderer --check path offline and write-free — Check mode only validates local sources, dependencies, ffprobe output, metadata bytes, and hashes.
- [Phase 25]: Share one VisualAsset object and one local public path across both target modules. — Reference-identical bindings prevent the generated pixels, bilingual transcript, non-color marker semantics, and locked numerical anchors from drifting independently.
- [Phase 25]: Normalize the selected built-in ImageGen output once to exact 1664x936 publication dimensions. — The first generated composition met the scientific visual contract; a dimensions-only resize preserved it while satisfying exact 16:9 publication and retaining source and final integrity provenance.
- [Phase 25]: Treat only the verified temporary-package swap as the successful publication — The failed pre-publication Manim attempt left public media and Notebook outputs byte-identical.
- [Phase 25]: Bind all three Batch 4 videos through typed bilingual VisualAsset records — Local posters and transcripts must carry the lesson when motion is reduced or video fails.
- [Phase 25]: Use Manim 0.20.1 stretch_to_fit_width for non-proportional label sizing — The set_width stretch keyword is unsupported in the installed renderer API.
- [Phase 25]: Apply the exact compatible linkify-it 5.0.2 transitive security patch — A gate-changing dependency fix invalidates earlier release evidence, so every final release gate was rerun on the patched HEAD.
- [Phase 25]: Keep the bilingual desktop/mobile and exact Number.MAX_VALUE browser acceptance pending for Plan 25-13 — Automated source and parity tests do not substitute for the declared browser interaction matrix.
- [Phase 25]: Record the transient Math-to-Code file-worker failure without changing unrelated code — The exact two files passed 23/23 and the next complete run passed 755/755 with no code change.
- [Phase 25]: Accept Plan 25-13 only after explicit user approval; automated gates and Playwright observations do not substitute for the blocking human checkpoint.
- [Phase 25]: Treat missing lower-learning-rate direction as a correctness bug and require full tests, both builds, and bilingual Number.MAX_VALUE browser retesting after the fix.
- [Phase 25]: Preserve both routes, existing checkpoints and Progress identities, standard/Pages assets, reduced-motion behavior, and video-failure teaching fallbacks.
- [Phase 26]: Authorize only the pinned LaDe-D Jilin revision/hash and privacy-minimized eight-field derivative. — The 2026-07-28 approve-lade decision does not transfer to another version, field set, or use.
- [Phase 26]: Preserve SECOM declared 591 versus observed 590 measurements without repair. — Padding, truncation, or imputation would silently rewrite the official raw schema.
- [Phase 26]: Keep stable logit-domain BCE as the only canonical binary-loss path — Probability clipping remains comparison-only metadata so extreme confident errors retain the original objective.
- [Phase 26]: Report MAE zero residual as a kink with subgradient convention 0 — A symmetric finite difference near zero is not evidence of a unique derivative and can never receive pass status.
- [Phase 26]: Lock the loss-gradient sweep to h=10^-1 through 10^-9 with tolerance 5e-7 — The fixed range shows truncation and rounding behavior while h=1e-5 passes MSE, smooth MAE, and stable BCE.
- [Phase 26]: Treat the exact 16 candidate paths as one package — Rejecting topic and locale subset selectors makes partial publication structurally unavailable.
- [Phase 26]: Reuse the Numerical Methods eight-pin environment byte-for-byte — The existing audited 99-wheel cache supplies every required package, so Phase 26 adds no dependency or download path.
- [Phase 26]: Keep isolated kernelspec names runtime-only — Stable proof IDs distinguish four executions without recording temporary machine identities.
- [Phase 26]: Reserve public asset publication for Plan 26-05 — Plans 26-03 and 26-04 can target only the exact ignored staging transaction.
- [Phase 26]: Preserve SECOM canonical missing values and 590 observed fields — Fold-local imputation, scaling, and OOF scores remain auxiliary teaching inputs rather than repairs to the published derivative.
- [Phase 26]: Match TypeScript diagnostic arithmetic explicitly — Left-fold means and the shared branch sigmoid eliminate Python 3.12 aggregation and one-ULP probability drift while stable BCE stays in the logit domain.
- [Phase 26]: Keep deterministic plots inside the audited environment — A standard-library 960x540 PNG writer supplies labels, patterns, and metadata without adding packages or widening the wheel audit.
- [Phase 26]: Keep Plan 26-04 staging-only and indivisible — All 16 members and four execution proofs verify together; Plan 26-05 remains the only public publication boundary.
- [Phase 26]: Plan 26-05: Publish only the byte-identical Plan 26-04 staging package: exactly 16 members totaling 22,011,681 bytes.
- [Phase 26]: Plan 26-05: Treat datasets/loss-functions and notebooks/loss-functions as one lock-scoped transaction with two-group rollback.
- [Phase 26]: Plan 26-05: Preserve the frozen Plan 26-04 candidate generator hash while evolving publication code independently.
- [Phase 26]: Plan 26-05: Rerun each public Notebook in its own external temporary package and fresh network-blocked kernel using only the pinned offline wheelhouse.
- [Phase 26]: Keep loss asset descriptors and chapter bindings module-local instead of extending the global StorySection contract. — Avoid widening the global lesson schema for one module.
- [Phase 26]: Treat published Notebook outputs as the numerical authority; lesson prose binds visible values through typed output IDs. — Prevent copied numerical values from drifting away from published artifacts.
- [Phase 26]: Limit Phase 26 gradient verification to dL/dyhat and dL/dz, with parameter training handed to Phase 27 and Phase 29. — Preserve the approved curriculum boundary while completing the output-gradient loop.
- [Phase 26]: Place one chapter-keyed locked-results surface inside each StoryScroller chapter and render consolidated downloads once after the unchanged checkpoint. — Keep formula, interaction, real output, and code in one learning loop.
- [Phase 26]: Keep fixed extreme BCE probes read-only while learner-controlled loss, row, and h choices remain bounded and finite. — Preserve stability teaching without exposing arbitrary extreme inputs.
- [Phase 26]: Use validated local summary rows when available and label built-in teaching fallbacks explicitly. — Missing local summaries must not blank formulas or interactions.
- [Phase 27]: Represent every model row with an explicit featureOrder plus values so wrong order and leakage columns fail closed at runtime. — Width alone cannot detect reordered or leaked columns at the pure-math boundary.
- [Phase 27]: Keep generic bounded batch GD separate from the locked full-data Bike fit constants; browser replay does not pretend to refit the full dataset. — The browser owns deterministic calculation and replay while later asset plans own the complete dataset execution.
- [Phase 27]: Expose staged diagnostics as typed scalar and array fields compatible with the existing TrainingSnapshot contract. — This preserves the global lesson schema while supporting Bike-specific diagnostics.
- [Phase 27]: Preserve fitDiagnostics as a Bike-only same-case compatibility adapter while removing California authority and the custom linear solver. — Existing renderers keep their contract without reviving superseded numerical authority.
- [Phase 27]: Reuse the Phase 25 Bike Sharing authority through bikeSharingContract.mjs instead of introducing a second CSV parser or hash convention. — This preserves one auditable schema, ordering, boundary, and checksum authority across the data preparation and linear-regression phases.
- [Phase 27]: Keep the Phase 27 Python environment byte-identical to Phase 26 and install exclusively from the audited local wheelhouse with --no-index. — Reusing the proven 99-wheel offline contract avoids environment drift and preserves deterministic two-locale Notebook execution.
- [Phase 27]: Limit --prepare-candidates to validating the source and isolated environment before creating a fresh empty ignored transaction. — Plan 27-02 establishes the safe transaction boundary while Plan 27-03 remains the sole owner of candidate materialization and Notebook execution.
- [Phase 27]: Keep every public mutation and standalone public verification path out of the Phase 27 candidate builder. — Plan 27-04 owns atomic publication, rollback, standalone reruns, and GitHub Pages base-path verification as a separate auditable boundary.
- [Phase 27]: Use the augmented pseudoinverse relation for teaching and numpy.linalg.lstsq as the stable numerical authority. — Avoids explicit Gram-matrix inversion while keeping theta[0] and theta[1:] mapped to intercept and weights.
- [Phase 27]: Freeze deterministic teaching-row selection at instants 11550, 17213, 15628, 14965, and 15604. — Versioned filters, exclusions, and lowest-instant tie-breaks make reruns auditable.
- [Phase 27]: Keep all generated regression assets in ignored staging until Plan 27-04. — Maintains a separate atomic publication and rollback boundary with no public mutation in Plan 27-03.
- [Phase 27]: Preserve the frozen Plan 27-03 candidate bytes and environment.json naming as the publication authority. — The completed 27-03 manifest is the verified immutable candidate; stale 27-04 path examples must not rewrite its content.
- [Phase 27]: Use one complete-directory transaction with exact absence, byte, and mode rollback. — The public package must never expose mixed generations and every failure must restore the prior target exactly.
- [Phase 27]: Prove each locale in an external network-blocked package and enforce repository hash, size, and mtime cleanliness. — Public reproducibility must not depend on repository execution state or mutate tracked learner assets.
- [Phase 27]: Treat the published linear-regression manifest as exact cross-generation identity while validating summary and CSV structures independently and fail-closed.
- [Phase 27]: Deep-copy and recursively freeze every accepted generated regression result before course consumers receive it.
- [Phase 27]: Dispatch only registered summary, manifest, and numerical CSV output IDs; keep public path resolution outside parsers and owned by withPublicBase.
- [Phase 27]: Preserve all eight literal linear-regression lesson IDs while assigning the locked Bike corridor responsibilities and order.
- [Phase 27]: Teach the normal equation conceptually but use numpy.linalg.lstsq as the stable executable implementation.
- [Phase 27]: Keep full-precision regression result authority in the typed local registry.
- [Phase 27]: Keep strict-summary consumers independently abortable — Avoids undocumented parent timing and shared mutable state while preserving the registered parser boundary.
- [Phase 27]: Keep regression Vue views presentation-only — Pure simulation snapshots and strict parsed outputs remain the only numerical authority; Vue only formats and maps coordinates.
- [Phase 27]: Use deterministic Bike SVG and tables instead of regression-specific Three.js — Text, shapes, and line patterns preserve Bike evidence across reduced-motion, mobile, and non-WebGL contexts.
- [Phase 27]: Keep the typed nine-file asset registry as the sole authority for chapter outputs and downloads.
- [Phase 27]: Treat malformed or unavailable summary data as a quiet fail-closed state backed by labeled bilingual teaching fixtures.
- [Phase 27]: Place one consolidated download surface after the unchanged checkpoint and keep chapter-local code reproduction beside each workbench.
- [Phase 28B]: Keep historical MLP SGD default; explicit optimizer choices use the shared pure engine.
- [Phase 28B]: Keep existing Banknote split and train-only standardization; defer final test display to Plan 03.
- [Phase 28B]: Keep optimizer media anchors sourced from the PR1 trajectory JSON instead of copied constants.
- [Phase 28B]: Use poster-first reduced-motion media with an explicit user-controlled video option.
- [Phase 28B]: Keep existing optimizer routes while rendering detailed typed course content in a targeted shell.
- [Phase 28B]: Use shared optimizer trajectories and supplied media instead of duplicating numerical fitting.
- [Phase ?]: Phase 29 Wave 0 locks fail-first numerical, asset, media, course, lab, compatibility, and release contracts before production work.
- [Phase ?]: Phase 29 linear-score uses one source-audited standardized Banknote row with a pure stable logistics engine.
- [Phase ?]: Phase 29 assets use one deterministic Banknote authority with strict scratch/sklearn parity and a redacted Phase 30 handoff.

## Operator Next Steps

- Run the v1.1 milestone audit, then close the milestone if no cross-phase gap is found.
- Keep C and D stages planned until each whole-stage teaching loop passes its own publication gates.

### Blockers

- None.
