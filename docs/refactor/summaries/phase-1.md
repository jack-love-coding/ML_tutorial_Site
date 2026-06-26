# Phase 1 Summary: Unified Curriculum Contract

**Date:** 2026-06-25
**Branch:** `refactor/curriculum-v2`
**Status:** Implemented and verified

## Goal

Create a unified Curriculum Catalog read model over existing Algorithm, Math Lab, and Data Lab content without changing runtime routes, homepage behavior, lesson rendering, or progress storage.

## Delivered

- Added `src/curriculum/types.ts` for canonical curriculum contracts.
- Added adapters:
  - `src/curriculum/adapters/algorithmAdapter.ts`
  - `src/curriculum/adapters/mathLabAdapter.ts`
  - `src/curriculum/adapters/dataLabAdapter.ts`
- Added catalog and lookups:
  - `src/curriculum/catalog.ts`
  - `curriculumCatalog`
  - `curriculumModuleById`
  - `curriculumModulesBySource`
- Added curriculum tracks in `src/curriculum/tracks.ts`.
- Added prerequisite graph helpers in `src/curriculum/prerequisites.ts`.
- Added localization and duplicate-ID validation in `src/curriculum/validation.ts`.
- Added tests for catalog completeness, bilingual copy, source mapping, track IDs, prerequisite existence, and cycle detection.

## Important Implementation Notes

- Algorithm content is represented through a lightweight manifest rather than directly importing `src/data/moduleCatalog.ts`.
- Reason: Node's test runner cannot execute the current algorithm module graph because those files rely on Vite's extensionless import resolution.
- Math Lab and Data Lab are adapted directly from their typed module exports.
- The retired Math Lab prerequisite ID `vectors-matrices-norms` is mapped to `linear-algebra-distance-similarity` in the Math Lab adapter.

## Verification

| Command | Result | Notes |
| --- | --- | --- |
| `npm test` | Pass | 209 tests passed. |
| `npm run build` | Pass | Existing large chunk warning remains. |
| `npm run build:pages` | Pass | Existing large chunk warning remains. |

## Deferred to Phase 2

- No route behavior changed.
- No homepage behavior changed.
- No navigation behavior changed.
- No progress storage changed.
- Catalog is not yet consumed by runtime UI.

## Risks for Phase 2

- The Algorithm manifest should eventually be reconciled with real module exports, or the algorithm modules should be made Node-test-importable through consistent `.ts` import paths.
- Canonical route design must preserve `/math-lab/*`, `/data-lab/*`, and bespoke algorithm chapter URLs.
- Catalog-driven navigation must avoid eagerly pulling all heavy course data into first-load surfaces.
