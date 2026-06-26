# GSD State: ML Atlas Curriculum V2

**Updated:** 2026-06-26
**Status:** Phase 9C spine stage landing implemented and verified

## Project Reference

See: `.planning/PROJECT.md` (updated 2026-06-25)

**Core value:** Students should always know where they are in the learning path, why the current lesson matters, and what evidence shows they are ready for the next step.
**Current focus:** Curriculum Spine V1 route clarity and content coverage

## Baseline

- `npm test`: pass, 240 tests.
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

## Next Recommended Command

Review the Phase 9C spine stage landing PR, then decide whether Phase 9D should fill the sequence/embedding bridge gap or improve stage-level lesson introductions:

- `docs/refactor/curriculum-v2-brief.md`
- `.planning/ROADMAP.md`
- `.planning/codebase/*`
- `docs/refactor/summaries/phase-1.md`
- `docs/refactor/summaries/phase-2.md`
- `docs/refactor/summaries/phase-3.md`
- `docs/refactor/summaries/phase-4.md`
- `docs/refactor/summaries/phase-5.md`
- `docs/refactor/summaries/phase-6.md`
- `docs/refactor/summaries/phase-7.md`
- `docs/refactor/summaries/phase-8.md`
- `docs/refactor/summaries/phase-9.md`
- `docs/refactor/designs/phase-9-curriculum-spine-v1.md`
- `docs/refactor/audits/curriculum-v2-milestone-audit.md`

Suggested next direction: turn the most visible Stage 10 known gap into a small sequence/embedding bridge module or stage introduction, still without adding progress/backend scope.
