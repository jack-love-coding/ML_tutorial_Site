# Phase 2 Summary: Routing and Navigation Unification

**Date:** 2026-06-25
**Branch:** `refactor/curriculum-v2`
**Status:** Implemented and verified

## Goal

Introduce canonical curriculum routes and catalog-derived navigation while preserving the legacy URLs that current lessons, labs, tests, and saved links depend on.

## Delivered

- Added `src/curriculum/routes.ts` with canonical route resolution for:
  - Algorithm modules: `/learn/:moduleId` and `/learn/:moduleId/:lessonId`
  - Math Lab modules: existing `/math-lab/modules/:moduleId`
  - Data Lab modules: existing `/data-lab/modules/:moduleId`
- Added `src/curriculum/routeManifest.ts` as the lightweight route/navigation manifest for AppShell and router guards.
- Updated `src/router/index.ts` with canonical learn routes plus curriculum hub routes:
  - `/tracks/:trackId`
  - `/library/:domain`
  - `/progress`
- Preserved legacy routes for Math Lab, Data Lab, linear regression, logistic regression, and CNN visualization.
- Updated `src/data/navigationMenus.ts` to export `curriculumNavigationMenus` derived from Curriculum V2 tracks and domains.
- Kept legacy navigation exports during migration:
  - `coreExperimentNavigationGroups`
  - `mathLabNavigationGroups`
  - `dataLabNavigationGroups`
- Updated `src/components/AppShell.vue` to render the new top-level IA:
  - Learning Path
  - Topic Library
  - Projects
  - Progress
- Added lightweight route pages:
  - `src/views/CurriculumTrackView.vue`
  - `src/views/CurriculumLibraryView.vue`
  - `src/views/CurriculumProgressView.vue`
- Added shared route-page styles in `src/styles/views/curriculum.css`.
- Updated structure tests to validate the new IA and legacy route compatibility.

## Important Implementation Notes

- Progress V2 is intentionally not implemented in this phase.
- The `/progress` route is a migration placeholder and does not read, write, migrate, or delete v1 localStorage data.
- Math Lab and Data Lab keep their current runtime pages in Phase 2. Canonical `/learn/:moduleId` inputs redirect to those runtime routes for non-algorithm modules.
- Algorithm lesson IDs are now accepted through `route.params.lessonId`, while existing bespoke `:chapterId` routes still work.
- AppShell and route guards use the lightweight manifest rather than importing the full `curriculumCatalog`, keeping full course data in lazy route chunks.

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm test -- tests/curriculumRoutingNavigation.test.ts` | Pass | 215 tests passed because the npm script also runs `tests/*.test.*`. |
| `npm test` | Pass | 215 tests passed. |
| `npm run build` | Pass | Existing large chunk warning remains. |
| `npm run build:pages` | Pass | Existing large chunk warning remains. |

## Deferred to Phase 3

- Unified progress type and storage wrapper.
- v1 progress reader, normalizer, merger, and idempotent migration marker.
- Continue-learning selector across Algorithm, Math Lab, and Data Lab.
- `/progress` route backed by real unified progress data.

## Risks for Phase 3

- v1 Algorithm, Math Lab, and Data Lab progress stores have different shapes and completion semantics.
- Migration must be idempotent and must not delete or rewrite v1 keys.
- Continue-learning should use canonical curriculum IDs without losing module-specific lesson/chapter context.
