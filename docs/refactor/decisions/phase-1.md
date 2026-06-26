# Phase 1 Decision Record: Curriculum Catalog

**Date:** 2026-06-25
**Phase:** 1 - Unified Curriculum Contract
**Source Brief:** `docs/refactor/curriculum-v2-brief.md`

## Scope Boundary

Phase 1 introduces a unified curriculum read model. It does not change the homepage, route table, progress writes, lesson rendering, or original course files except for import-safe adapter references.

## Settled Decisions

| Topic | Decision | Risk Resolved |
| --- | --- | --- |
| Catalog role | Catalog is a read model, not the new content source of truth. | Avoids mass content migration before validation. |
| Original content | Algorithm, Math Lab, and Data Lab modules remain in their current files. | Keeps current lessons, labs, and tests stable. |
| ID namespace | Canonical module IDs are globally unique across all domains. | Prevents progress and route collisions. |
| Legacy IDs | Every adapted record stores source namespace and source ID. | Enables redirect, migration, and rollback mapping. |
| Track model | Tracks and prerequisites are separate structures. | Allows modules to appear in multiple tracks without corrupting dependency logic. |
| Prerequisites | Prerequisites form a DAG of canonical module IDs. | Enables validation and next-step recommendations. |
| Multi-track membership | A module may belong to multiple tracks. | Allows Math topics to be just-in-time support and library content. |
| Localization | Catalog-facing title and summary require `'zh-CN'` and `en`. | Preserves bilingual guarantees. |
| Asset validation | Phase 1 validates referenced public assets only where adapters expose assets. | Prevents broken media without moving assets. |
| Legacy module order | Existing `moduleOrder` remains runtime behavior until Phase 2. | Avoids untested navigation/routing changes in Phase 1. |

## Rejected Options

- Make `src/curriculum/catalog.ts` the only source of lesson body content in Phase 1.
- Rename all existing module IDs immediately.
- Merge Math Lab and Data Lab type definitions into `src/types/ml.ts`.
- Encode prerequisite order only through arrays in each source module.
- Change `/math-lab` or `/data-lab` routes while catalog tests are still new.

## Invariants

- Existing pages render with current data modules after Phase 1.
- No old route is removed.
- No progress key is added, modified, or removed.
- `npm test`, `npm run build`, and `npm run build:pages` pass after the phase.
- Catalog validation tests fail if a canonical ID is duplicated, a prerequisite is missing, a prerequisite cycle exists, or bilingual catalog copy is incomplete.

## Acceptance Criteria

- `src/curriculum/types.ts` defines canonical module, lesson, track, domain, level, source namespace, prerequisite, and outcome contracts.
- `src/curriculum/adapters/algorithmAdapter.ts` adapts `AlgorithmModuleDefinition` modules without changing source module files.
- `src/curriculum/adapters/mathLabAdapter.ts` adapts `MathLabModule` records.
- `src/curriculum/adapters/dataLabAdapter.ts` adapts `DataLabModule` records.
- `src/curriculum/catalog.ts` exports a combined catalog and lookup helpers.
- `src/curriculum/tracks.ts` defines the core learning path and topic-library groupings.
- `src/curriculum/prerequisites.ts` exposes cycle and missing-ID validation helpers.
- `src/curriculum/validation.ts` exposes reusable assertions for tests.
- Tests cover ID uniqueness, localization completeness, source mapping, track membership, prerequisite existence, and DAG behavior.

## Migration Behavior

Phase 1 performs no data migration. It only records mappings needed by later route and progress phases.

## Rollback Behavior

Rollback is simple: remove `src/curriculum/**` and the Phase 1 tests. Existing runtime behavior should not depend on Phase 1 outputs until Phase 2.

## Remaining Risks

- Mapping all Math Lab modules may reveal ambiguous canonical IDs because Math Lab IDs are already user-facing.
- Some algorithm modules may not expose lesson-level stable IDs beyond chapter IDs.
- Keeping catalog as read model can duplicate some metadata temporarily.
- If adapters import all source modules eagerly, build chunks may stay large; Phase 1 must avoid adding catalog imports to first-load code.

## Implementation-Readiness Verdict

Ready for detailed planning after confirming exact canonical ID naming rules. Recommended default: reuse existing slugs/IDs when globally unique, prefix only when a collision appears, and store legacy source metadata for every record.
