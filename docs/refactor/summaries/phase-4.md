# Phase 4 Summary: Homepage and Information Architecture

**Date:** 2026-06-25
**Branch:** `refactor/curriculum-v2`
**Status:** Implemented and verified

## Goal

Turn the homepage into a concise curriculum decision surface instead of a full mixed catalog. The first screen should answer where to start, how to continue, and which route surface to use next.

## Delivered

- Refactored `src/views/HomeView.vue` so the first screen now uses:
  - Progress V2 migration and continue-learning selection.
  - lightweight curriculum route manifest titles.
  - unified navigation menu labels for Learning Path, Topic Library, Projects, and Progress.
- Removed homepage dependencies on:
  - `moduleOrder`
  - Math Lab-only `LearningRouteSummary`
  - Math Lab-only `learningRoutes`
  - Math Lab-only `learningRouteSummaryModules`
  - Math Lab-only progress loading
- Replaced the full module gallery and duplicate long path list with:
  - a continue-learning panel
  - four decision cards
  - preserved beginner roadmap and readiness checks
- Updated homepage styles in `src/styles/views/home.css` for desktop and mobile decision-card layouts.
- Fixed roadmap numbering so stages 10+ display as `10`, `11`, etc. instead of `010`.
- Added `tests/homeCurriculumIA.test.ts`.
- Updated stale tests that treated `HomeView.vue` as the source of module registration truth.
- Added the decision record `docs/refactor/decisions/phase-4.md`.

## Verification

| Command / Check | Result | Notes |
| --- | --- | --- |
| `npm test` | Pass | 227 tests passed. |
| `npm run build` | Pass | Existing large-chunk warning remains. |
| `npm run build:pages` | Pass | Existing large-chunk warning remains. |
| Playwright desktop screenshot | Pass | Home first screen shows value copy, continue panel, route chips, and next decision section without overlap. |
| Playwright mobile screenshot | Pass | No visible overlap in mobile first viewport. |
| Playwright console check | Pass | 0 warnings, 0 errors. |
| Playwright overflow check | Pass | `scrollWidth`, `clientWidth`, and `bodyScrollWidth` all equal `390` at mobile viewport. |

## Important Implementation Notes

- Home now runs `migrateLearningProgressV2()` on mount and listens for all v1/v2 progress storage keys, but writes only through the V2 migration path.
- The homepage uses `curriculumNavigationMenus` for high-level IA labels, not full content modules.
- Detailed catalog browsing is intentionally delegated to `/tracks/:trackId`, `/library/:domain`, and `/progress`.

## Deferred to Phase 5

- Generic LessonPage and block renderer.
- Pilot conversion for AI Overview, Gradient Descent, and MLP.
- Lab registry/parity tests for reusable lesson rendering.

## Risks for Phase 5

- The homepage now points learners toward canonical route surfaces, so LessonPage pilot work needs to make canonical `/learn/:moduleId/:lessonId` experiences feel coherent.
- Existing specialized module pages remain large and varied; the renderer should be piloted narrowly before any broader migration.
