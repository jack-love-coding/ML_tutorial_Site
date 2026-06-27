# Phase 9 Summary: Curriculum Spine V1

**Status:** Phase 9C implemented and verified.

## Phase 9A - Spine Data Contract

Phase 9A turns the approved Curriculum Spine V1 design into a typed, testable contract without changing routes, progress storage, homepage UI, or lesson body content.

## Phase 9B - Homepage And Navigation Realignment

Phase 9B makes the spine learner-facing without adding a new stage route yet. The homepage, top navigation, core track, and continue-learning fallback now treat the data-first spine as the default path. Math Lab, Data Lab, model, and deep-learning catalogs are presented as support lenses rather than parallel beginner products.

The wide Support Lenses desktop menu is centered under its trigger so the expanded menu remains inside the viewport.

## Phase 9C - Spine Stage Landing View

Phase 9C adds `/spine` as the learner-facing stage view for Curriculum Spine V1. The existing `/tracks/core-learning-path` flat module list remains available, while Default Spine navigation, homepage decision cards, and progress-page route links now point to the stage view first.

The stage view is generated from `curriculumSpineStages` and shows required modules, support lenses, project validation, completion standards, and known gaps without adding progress/backend scope or rewriting lesson bodies.

## Decisions Encoded

- The beginner-facing route is a mixed spiral route, not separate Math Lab, Data Lab, and Algorithm tracks.
- The route is data first: raw tables, numeric features, categorical features, and data quality come before formal linear algebra.
- `optimizer-comparison` is required before deeper neural architecture modules.
- `attention-transformer` is the Spine V1 endpoint.
- `llm-rag` remains an advanced application extension outside the required route.
- `housing-price-project` and `classification-project` are recommended validation capstones, not hard blockers.
- The missing sequence/embedding bridge is documented as a known gap instead of added as a fake module reference.

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
- Playwright `/spine` check: desktop and mobile show 11 stages and 11 stage-nav links, known gaps and project validation are visible, flat module list remains linked, no horizontal overflow, and console errors remain 0.

## Next Step

Phase 9D should either fill the documented sequence/embedding bridge gap or improve stage-level lesson introductions for the highest-friction transitions.
