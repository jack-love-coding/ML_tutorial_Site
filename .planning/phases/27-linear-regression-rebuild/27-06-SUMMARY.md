---
phase: 27-linear-regression-rebuild
plan: "06"
subsystem: curriculum
tags: [vue, typescript, bilingual-content, linear-regression, progress-compatibility]

# Dependency graph
requires:
  - phase: 27-05
    provides: Strict local regression asset registry, validated outputs, and chapter bindings
provides:
  - Eight-chapter bilingual Bike Sharing regression teaching corridor
  - Stable normal-equation lesson using augmented design and numpy.linalg.lstsq
  - Progress-safe Curriculum V2 lesson reorder with preserved routes, checkpoints, and IDs
affects: [27-07, 27-08, phase-28-tabular-regression]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Typed chapter copy binds to the strict local result registry instead of duplicating result authority
    - Existing lesson identities can be reordered only with explicit V1/V2 progress-preservation tests

key-files:
  created:
    - tests/linear-regression-content.test.mjs
  modified:
    - src/data/linearRegressionModule.ts
    - src/i18n/messages.ts
    - src/curriculum/adapters/algorithmAdapter.ts
    - src/curriculum/generated/catalogMetadata.ts
    - tests/linear-regression-layout.test.mjs
    - tests/algorithm-progress.test.ts
    - tests/curriculumProgress.test.ts

key-decisions:
  - "Preserve all eight literal lesson IDs while assigning them the locked one-case Bike regression responsibilities and order."
  - "Teach the normal equation as the conceptual augmented-design relation, but use numpy.linalg.lstsq as the stable executable implementation instead of forming an inverse."
  - "Keep full-precision result authority in the typed local registry and use prose only for derived, readable interpretation."

patterns-established:
  - "One-case corridor: every chapter advances the same chronological Bike split and canonical feature vector."
  - "Compatibility-first reorder: route, checkpoint, and storage identities are locked before manifest order changes."

requirements-completed: [LINR-01, LINR-02, LINR-03, LINR-04]

coverage:
  - id: D1
    description: "Eight preserved chapter IDs now form one complete bilingual Bike Sharing regression corridor."
    requirement: LINR-01
    verification:
      - kind: integration
        ref: "tests/linear-regression-content.test.mjs#bilingual chapter order and eight chapter contracts"
        status: pass
    human_judgment: false
  - id: D2
    description: "Formula, NumPy, sklearn, and typed result bindings share one notation and numerical method contract."
    requirement: LINR-02
    verification:
      - kind: unit
        ref: "tests/linear-regression-content.test.mjs#normal equation, augmented design, lstsq, and three-method agreement"
        status: pass
      - kind: integration
        ref: "tests/linear-regression-assets.test.ts#strict local result registry and chapter bindings"
        status: pass
    human_judgment: false
  - id: D3
    description: "Held-out diagnosis covers metric interpretation, nonlinear residual shape, named cases, feature instability, and regularization boundaries."
    requirement: LINR-03
    verification:
      - kind: integration
        ref: "tests/linear-regression-content.test.mjs#model-limits, overfitting, and regularization contracts"
        status: pass
    human_judgment: false
  - id: D4
    description: "Routes, checkpoints, deep links, and Progress V1/V2 records remain compatible after lesson reordering."
    requirement: LINR-04
    verification:
      - kind: integration
        ref: "tests/linear-regression-layout.test.mjs#route preservation"
        status: pass
      - kind: integration
        ref: "tests/algorithm-progress.test.ts#linear regression checkpoint preservation"
        status: pass
      - kind: integration
        ref: "tests/curriculumProgress.test.ts#linear regression progress preservation and reorder"
        status: pass
    human_judgment: false

# Metrics
duration: 20min
completed: 2026-07-29
status: complete
---

# Phase 27 Plan 06: Bilingual Bike Regression Teaching Corridor Summary

**Eight preserved lessons now teach one chronological Bike Sharing regression case from affine prediction through stable solvers, held-out diagnosis, and regularization without losing learner progress.**

## Performance

- **Duration:** 20 min
- **Started:** 2026-07-29T12:39:44Z
- **Completed:** 2026-07-29T12:59:37Z
- **Tasks:** 3
- **Files modified:** 8

## Accomplishments

- Rebuilt all eight typed chapters in paired Chinese and English around raw `cnt`, a canonical five-feature order, one chronological split, and one result registry.
- Connected row-level prediction and residual arithmetic to batch gradients, NumPy gradient descent, the augmented normal equation, stable `numpy.linalg.lstsq`, and sklearn comparisons.
- Added held-out residual diagnosis, coefficient interpretation, atemp instability, distinct OLS/Ridge/Lasso objectives, and the Phase 28 handoff.
- Preserved every module, route, lesson, checkpoint, revisit, and storage identity while reordering Curriculum V2 and proving non-mutating V1-to-V2 migration.

## Task Commits

Each task was committed atomically:

1. **Task 1: Establish Wave 0 content, route, checkpoint, and progress contracts** - `744dc21` (test)
2. **Task 2: Rebuild all eight bilingual chapters around one row-to-batch case** - `4e6d527` (feat)
3. **Task 3: Reorder the curriculum adapter and prove progress-safe compatibility** - `322bea6` (feat)

Additional corrective commit:

- **Regenerate lightweight curriculum metadata after the localized summary changed** - `cf82f1c` (fix)

## Files Created/Modified

- `tests/linear-regression-content.test.mjs` - Locks the eight-chapter bilingual teaching, notation, method, result-binding, identity, and adapter contracts.
- `tests/linear-regression-layout.test.mjs` - Preserves lazy routes and records the explicit UI ownership of Plans 27-07/08.
- `tests/algorithm-progress.test.ts` - Proves both linear-regression checkpoint attempt identities survive.
- `tests/curriculumProgress.test.ts` - Proves reordered lesson IDs merge into V2 without mutating raw V1 bytes.
- `src/data/linearRegressionModule.ts` - Defines the complete typed Bike Sharing teaching corridor.
- `src/i18n/messages.ts` - Updates both locale shells and chapter titles to the new responsibilities.
- `src/curriculum/adapters/algorithmAdapter.ts` - Aligns Curriculum V2 order and localized title keys with the module.
- `src/curriculum/generated/catalogMetadata.ts` - Refreshes lightweight runtime metadata from the canonical typed catalog.

## Decisions Made

- Existing chapter IDs were treated as durable learner identities; responsibilities and order changed without aliases or renames.
- The normal equation is shown with `X_tilde`, a pseudoinverse relation, and explicit intercept/weight mapping, while executable code uses `numpy.linalg.lstsq` for numerical stability.
- All chapters reuse the local typed asset registry and only show readable derived values in prose, avoiding a second result authority.
- UI components, routes, checkpoints, progress implementations, and public assets remained outside this content-focused plan.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Bug] Fixed escaped code-fence detection**

- **Found during:** Task 2 (Rebuild all eight bilingual chapters)
- **Issue:** The static source assertion searched for literal Markdown backticks, but TypeScript template literals store those fences escaped.
- **Fix:** Updated the matcher to recognize the escaped source representation while retaining the required Python-code contract.
- **Files modified:** `tests/linear-regression-content.test.mjs`
- **Verification:** Focused content and asset tests passed.
- **Committed in:** `4e6d527`

**2. [Rule 3 - Blocking Generated Metadata Drift] Refreshed the canonical catalog projection**

- **Found during:** Overall `npm test`
- **Issue:** The localized module summary changed, leaving `src/curriculum/generated/catalogMetadata.ts` behind the typed catalog.
- **Fix:** Ran the repository generator to update only the corresponding bilingual summary projection.
- **Files modified:** `src/curriculum/generated/catalogMetadata.ts`
- **Verification:** `tests/curriculumMetadata.test.ts`, the full 903-test suite, production build, and Pages build passed.
- **Committed in:** `cf82f1c`

---

**Total deviations:** 2 auto-fixed (1 Rule 1, 1 Rule 3)
**Impact on plan:** Both fixes were required for correct source validation and deterministic generated metadata; no feature or architectural scope was added.

## Issues Encountered

- The first full test run exposed only the stale generated catalog summary. Regeneration resolved it; the second full run passed all 903 tests.
- Vite continues to report the repository's existing large-chunk warning after successful builds; this plan did not change chunking architecture.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plans 27-07 and 27-08 can render and polish the locked chapter/result contracts without changing lesson identity or result authority.
- Phase 28 can consume the explicit linear-model boundary and tabular-regression handoff.
- No blockers remain.

## Validation

- `node --test tests/linear-regression-content.test.mjs tests/linear-regression-layout.test.mjs tests/linear-regression-assets.test.ts tests/algorithm-progress.test.ts tests/curriculumProgress.test.ts` - 57 passed.
- `node --test tests/curriculumMetadata.test.ts tests/linear-regression-content.test.mjs tests/curriculumProgress.test.ts` - 29 passed.
- `npm test` - 903 passed.
- `npm run build` - passed.
- `npm run build:pages` - passed.
- `git diff --check` - passed.
- Protected pre-existing work retained its original SHA-256 values.

## Self-Check: PASSED

- All eight created or modified implementation/test files and this summary exist.
- Task commits `744dc21`, `4e6d527`, `322bea6`, and corrective commit `cf82f1c` exist in history.
- Coverage metadata parses successfully with all four deliverables automatically covered by passing tests.

---
*Phase: 27-linear-regression-rebuild*
*Completed: 2026-07-29*
