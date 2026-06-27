# Phase 9 Summary: Curriculum Spine V1

**Status:** Phase 9D implemented and targeted tests pass.

## Phase 9A - Spine Data Contract

Phase 9A turns the approved Curriculum Spine V1 design into a typed, testable contract without changing routes, progress storage, homepage UI, or lesson body content.

## Phase 9B - Homepage And Navigation Realignment

Phase 9B makes the spine learner-facing without adding a new stage route yet. The homepage, top navigation, core track, and continue-learning fallback now treat the data-first spine as the default path. Math Lab, Data Lab, model, and deep-learning catalogs are presented as support lenses rather than parallel beginner products.

The wide Support Lenses desktop menu is centered under its trigger so the expanded menu remains inside the viewport.

## Phase 9C - Spine Stage Landing View

Phase 9C adds `/spine` as the learner-facing stage view for Curriculum Spine V1. The existing `/tracks/core-learning-path` flat module list remains available, while Default Spine navigation, homepage decision cards, and progress-page route links now point to the stage view first.

The stage view is generated from `curriculumSpineStages` and shows required modules, support lenses, project validation, completion standards, and known gaps without adding progress/backend scope or rewriting lesson bodies.

## Phase 9D - Content Gap Fill: Sequence Bridge

Phase 9D fills the documented sequence/embedding bridge gap before Attention/Transformer. The new `sequence-embedding-bridge` module stays intentionally small: token sequence framing, token ids, embedding lookup, position/mask, and the `[B,T,H]` handoff into Q/K/V.

The module is now part of the required Default Spine between `cnn-visualization` and `attention-transformer`, appears in the core track and legacy advanced-architecture navigation group, and includes bilingual checkpoints plus the existing workflow-lab interaction pattern.

## Decisions Encoded

- The beginner-facing route is a mixed spiral route, not separate Math Lab, Data Lab, and Algorithm tracks.
- The route is data first: raw tables, numeric features, categorical features, and data quality come before formal linear algebra.
- `optimizer-comparison` is required before deeper neural architecture modules.
- `attention-transformer` is the Spine V1 endpoint.
- `llm-rag` remains an advanced application extension outside the required route.
- `housing-price-project` and `classification-project` are recommended validation capstones, not hard blockers.
- The sequence/embedding bridge is now a real required module instead of a known gap.

## Files

- `src/curriculum/types.ts`
- `src/curriculum/spine.ts`
- `tests/curriculumSpine.test.ts`
- `docs/refactor/designs/phase-9-curriculum-spine-v1.md`
- `src/views/HomeView.vue`
- `src/data/navigationMenus.ts`
- `src/curriculum/routeManifest.ts`
- `src/curriculum/tracks.ts`
- `src/views/CurriculumProgressView.vue`
- `tests/curriculumRoutingNavigation.test.ts`
- `tests/homeCurriculumIA.test.ts`
- `tests/curriculumPrerequisites.test.ts`
- `tests/curriculumProgress.test.ts`
- `tests/data-lab-layout.test.mjs`
- `src/styles/views/home.css`
- `src/styles/themes/pixel-redesign.css`
- `src/views/CurriculumSpineView.vue`
- `src/router/index.ts`
- `src/styles/views/curriculum.css`
- `scripts/create-pages-fallbacks.mjs`
- `tests/curriculumSpineLanding.test.ts`
- `src/data/sequenceEmbeddingBridgeModule.ts`
- `src/components/AppliedWorkflowLessonLab.vue`
- `src/curriculum/adapters/algorithmAdapter.ts`
- `src/data/algorithmCheckpoints.ts`
- `src/i18n/messages.ts`
- `src/types/ml.ts`
- `src/views/AlgorithmView.vue`
- `tests/deep-learning-extension-modules.test.mjs`
- `tests/algorithm-progress.test.ts`
- `tests/curriculumCatalog.test.ts`
- `tests/site-navigation.test.ts`

## Verification

- `node --test tests/curriculumSpine.test.ts`: pass.
- `node --test tests/curriculumSpine.test.ts tests/curriculumMilestoneAudit.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumCatalog.test.ts`: pass.
- `npm test`: pass, 244 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- `node --test tests/curriculumRoutingNavigation.test.ts tests/homeCurriculumIA.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumProgress.test.ts tests/curriculumMilestoneAudit.test.ts tests/data-lab-layout.test.mjs`: pass.
- `npm test`: pass, 245 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- Playwright homepage check: desktop and mobile show Default Spine / Support Lenses, 11 spine stages render, the expanded Support Lenses menu stays within the desktop viewport, no horizontal overflow, and console errors remain 0.
- `node --test tests/curriculumSpineLanding.test.ts tests/curriculumRoutingNavigation.test.ts tests/homeCurriculumIA.test.ts tests/data-lab-layout.test.mjs tests/curriculumMilestoneAudit.test.ts`: pass, 25 tests.
- `node --test tests/curriculumSpine.test.ts tests/curriculumPrerequisites.test.ts tests/curriculumProgress.test.ts tests/curriculumSpineLanding.test.ts tests/curriculumRoutingNavigation.test.ts`: pass, 28 tests.
- `npm test`: pass, 248 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- Playwright `/spine` check: desktop and mobile show 11 stages and 11 stage-nav links, project validation is visible, flat module list remains linked, no horizontal overflow, and console errors remain 0.
- `node --test tests/deep-learning-extension-modules.test.mjs tests/curriculumSpine.test.ts tests/curriculumRoutingNavigation.test.ts tests/curriculumCatalog.test.ts tests/algorithm-progress.test.ts tests/site-navigation.test.ts`: pass, 23 tests.
- `git diff --check`: pass.
- `npm test`: pass, 248 tests.
- `npm run build`: pass with existing large-chunk warning.
- `npm run build:pages`: pass with existing large-chunk warning.
- `node scripts/create-pages-fallbacks.mjs`: pass, 46 GitHub Pages SPA fallback routes including `/learn/sequence-embedding-bridge`.
- Playwright `/learn/sequence-embedding-bridge` check: desktop and mobile show 5 chapter buttons, sequence-bridge workflow lab, 2 checkpoints, no horizontal overflow, and no console errors.
- Playwright `/spine` check after Phase 9D: desktop and mobile show 11 stages; `sequence-embedding-bridge` is visible between CNN and Attention; no horizontal overflow.

## Next Step

Phase 9E should harmonize stage-level and bridge copy for the highest-friction transitions without rewriting every lesson body.

Design draft for review: `docs/refactor/designs/phase-9e-route-copy-harmonization.md`.
