# Phase 3 Summary: Progress V2

**Date:** 2026-06-25
**Branch:** `refactor/curriculum-v2`
**Status:** Implemented and verified

## Goal

Add a unified, source-aware progress model that can safely read Algorithm, Math Lab, and Data Lab v1 localStorage data, write a separate V2 record, and recommend the next canonical curriculum step.

## Delivered

- Added `src/curriculum/progress.ts` with:
  - `LearningProgressV2`
  - source-aware module states
  - source-aware quiz attempt summaries
  - `learningProgressV2StorageKey`
  - `learningProgressV2MigrationKey`
  - `migrateLearningProgressV2`
  - `loadLearningProgressV2`
  - `saveLearningProgressV2`
  - `selectContinueLearning`
- Added idempotent migration from:
  - `ml-atlas:algorithm-progress:v1`
  - `ml-atlas:math-lab-progress:v1`
  - `ml-atlas:data-lab-progress:v1`
- Preserved v1 stores exactly as-is during migration.
- Added conflict behavior: completion is retained if any source or existing V2 record marks the module complete.
- Added attempt de-duplication by source, module ID, quiz ID, and timestamp.
- Added continue-learning selection:
  - unfinished last visited module first
  - otherwise first incomplete module in the core learning path
- Updated `/progress` to read V2, run the idempotent migration on mount, and render:
  - continue-learning target
  - completed module count
  - checkpoint attempt count
  - route entrypoints
- Added `tests/curriculumProgress.test.ts`.

## Important Implementation Notes

- Progress V2 writes only to `ml-atlas:learning-progress:v2` and `ml-atlas:learning-progress:v2:migration`.
- The migration marker fingerprints raw v1 contents, so corrupted JSON and missing stores remain deterministic.
- The selector returns canonical module and lesson IDs. Algorithm lessons route to `/learn/:moduleId/:lessonId`; Math Lab and Data Lab currently keep their existing module routes.
- The `/progress` page is lazy-loaded, so the full catalog used for lesson lookup does not move into the AppShell bundle.

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm test -- tests/curriculumProgress.test.ts` | Pass | 224 tests passed because the npm script also runs `tests/*.test.*`. |
| `npm test` | Pass | 224 tests passed. |
| `npm run build` | Pass | Existing large chunk warning remains. |
| `npm run build:pages` | Pass | Existing large chunk warning remains. |

## Deferred to Phase 4

- Homepage first-screen IA that consumes Progress V2.
- Continue/start/recommended next lesson surfaces on home.
- Mobile/bilingual layout checks for the new homepage decision surface.
- Removing contradictory long-path duplication from the homepage.

## Risks for Phase 4

- Homepage currently imports Math Lab progress directly and still carries older route narrative copy.
- Continue-learning should be presented without hiding topic-library options for students who need remediation.
- The first screen needs to stay concise on mobile while still explaining start, continue, and route choices.
