# Phase 3 Decision Record: Progress V2

**Date:** 2026-06-25
**Phase:** 3 - Progress V2
**Source Brief:** `docs/refactor/curriculum-v2-brief.md`
**Previous Phase:** `docs/refactor/summaries/phase-2.md`

## Scope Boundary

Phase 3 adds a unified progress read model and idempotent migration from existing v1 stores. It does not delete, rename, or rewrite v1 storage keys. It does not add authentication, backend sync, or cross-device storage.

## Settled Decisions

| Topic | Decision | Risk Resolved |
| --- | --- | --- |
| V2 key | Store unified progress at `ml-atlas:learning-progress:v2`. | Keeps V2 separate from existing module stores. |
| Migration marker | Store marker at `ml-atlas:learning-progress:v2:migration`. | Lets migration short-circuit when source inputs have not changed. |
| Source fingerprint | Fingerprint raw v1 key contents, not normalized data. | Corrupted JSON and missing stores remain deterministic. |
| Completion conflict | If any source marks a module complete, V2 keeps it complete. | Avoids losing user progress when merging old and new records. |
| Attempts | Preserve attempt source namespace, module ID, quiz ID, correctness, timestamp, and misconception tags where available. | Keeps later review and misconception surfaces source-aware. |
| Last visited | Use the newest v1 `updatedAt` among last-visited records. | Gives continue-learning a deterministic cross-store tie-breaker. |
| Continue selector | Prefer unfinished last-visited module, then first incomplete module in the core learning path. | Keeps the recommendation understandable before richer scoring exists. |

## Invariants

- `ml-atlas:algorithm-progress:v1`, `ml-atlas:math-lab-progress:v1`, and `ml-atlas:data-lab-progress:v1` remain untouched.
- Running migration twice with unchanged v1 inputs returns the same stored V2 object.
- Missing stores and corrupted JSON do not throw.
- Continue-learning output uses canonical curriculum module and lesson IDs.
- `npm test`, `npm run build`, and `npm run build:pages` pass.

## Acceptance Criteria

- `LearningProgressV2` type exists.
- V1 stores normalize into a source-aware V2 module map.
- Existing V2 data merges with V1 without losing completed status or attempts.
- Migration writes a schema-versioned marker and is idempotent.
- `/progress` reads V2 and displays a real continue-learning target without mutating v1 keys.

## Rollback Behavior

Remove Progress V2 files and the `/progress` read wiring. Existing v1 stores remain untouched and existing Algorithm, Math Lab, and Data Lab pages keep their current progress behavior.
