---
phase: python-data-tools-stage-4
plan: "10"
subsystem: routing
tags: [python-data-tools, route-resolution, compatibility, tdd, purity]

requires:
  - phase: python-data-tools-stage-1
    provides: Typed python-data-tools-v1 contract and ordered eight-chapter registry
provides:
  - Pure discriminated resolver for five legacy, eight current, and unknown Python Data Tools chapter IDs
  - Exact readonly legacy mapping derived into canonical chapter IDs without navigation or Progress side effects
  - Focused routing diagnostics covering idempotency, concurrency, fallback, and source purity
affects: [python-data-tools-stage-4-11, runtime-routing, legacy-deep-links]

tech-stack:
  added: []
  patterns:
    - Contract-derived current-ID allowlist and first-chapter fallback
    - Pure legacy-current-unknown discriminated route resolution before live router integration

key-files:
  created:
    - src/utils/pythonDataToolsRoutes.ts
    - tests/python-data-tools-runtime-routing.test.ts
  modified: []

key-decisions:
  - "Resolver results use the compact discriminated shape { kind, id }, where id is always canonical and kind records legacy, current, or unknown input handling."
  - "The exported legacy map is frozen at runtime as well as readonly in TypeScript; current IDs and fallback remain derived from pythonDataToolsContract."
  - "Plan 10 does not import or modify Vue, the live router, AlgorithmView, checkpoints, or Progress; Plan 11 consumes the pure resolver."

patterns-established:
  - "Route compatibility policy lives in one pure utility and is tested independently before any page can mount or write progress."
  - "Canonicalizing a resolver result a second time always yields one current result, preventing redirect loops."

requirements-completed: [R3]

coverage:
  - id: D1
    description: The five locked legacy IDs, all eight contract IDs, and empty or unknown IDs resolve to deterministic canonical IDs with an explicit redirect kind.
    requirement: R3
    verification:
      - kind: unit
        ref: tests/python-data-tools-runtime-routing.test.ts#Python Data Tools resolves the five legacy chapter IDs to locked canonical IDs
        status: pass
      - kind: unit
        ref: tests/python-data-tools-runtime-routing.test.ts#Python Data Tools keeps every current contract chapter ID unchanged
        status: pass
      - kind: unit
        ref: tests/python-data-tools-runtime-routing.test.ts#Python Data Tools falls back from empty and unknown IDs to the first contract chapter
        status: pass
    human_judgment: false
  - id: D2
    description: Resolution remains idempotent and deterministic under repeated and concurrent calls, with no route, Progress, storage, or network side effects.
    requirement: R3
    verification:
      - kind: unit
        ref: tests/python-data-tools-runtime-routing.test.ts#Python Data Tools resolution is stable for repeated and concurrent calls
        status: pass
      - kind: unit
        ref: tests/python-data-tools-runtime-routing.test.ts#Python Data Tools resolver source stays independent from routing and Progress side effects
        status: pass
      - kind: integration
        ref: node --test tests/python-data-tools-*.test.ts
        status: pass
    human_judgment: false

duration: 5 min
completed: 2026-07-16
status: complete
---

# Phase python-data-tools-stage-4 Plan 10: Pure Chapter Resolver Summary

**A contract-derived, side-effect-free resolver now canonicalizes five legacy and eight current Python Data Tools chapter IDs before the live router or Progress system becomes involved.**

## Performance

- **Duration:** 5 min
- **Started:** 2026-07-16T04:48:54Z
- **Completed:** 2026-07-16T04:53:41Z
- **Tasks:** 2
- **Files modified:** 2

## Accomplishments

- Added one frozen readonly map with the five D-18 legacy redirects and a typed `legacy | current | unknown` resolver result.
- Derived the current-ID allowlist and unknown fallback directly from `pythonDataToolsContract.chapters`, avoiding a second current chapter registry.
- Locked exact mappings, contract order, fallback, idempotency, concurrent determinism, and absence of route/Progress/storage/network side effects with named diagnostics.

## Task Commits

Each task was committed atomically, with Task 1 following the required RED-to-GREEN cycle:

1. **Task 1 RED: Add failing route resolver contract** - `c90bc2a` (test)
2. **Task 1 GREEN: Implement pure chapter resolver** - `950b987` (feat)
3. **Task 2: Harden resolver purity and integration-ready diagnostics** - `419f843` (test)

## Files Created/Modified

- `src/utils/pythonDataToolsRoutes.ts` - Centralizes legacy mappings and resolves legacy, current, and unknown chapter IDs without navigation.
- `tests/python-data-tools-runtime-routing.test.ts` - Proves exact mapping, contract order, fallback, repeatability, concurrency, idempotency, and purity.

## Decisions Made

- Kept the research-approved `{ kind, id }` result shape so future route guards receive both the canonical ID and redirect classification without performing navigation.
- Froze the legacy map at runtime to reinforce the exported readonly TypeScript contract.
- Kept the resolver's only dependency on the typed Python Data Tools contract; no route registration or Progress writer moved into this prerequisite plan.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None.

## Verification

- RED gate: `node --test tests/python-data-tools-runtime-routing.test.ts` failed 5/5 because the planned resolver did not yet exist.
- GREEN and Task 2 gate: `node --test tests/python-data-tools-runtime-routing.test.ts`: pass, 5 tests.
- Wave 1 Python gate: `node --test tests/python-data-tools-*.test.ts`: pass, 68 tests.
- Repository gate: `npm test`: pass, 590 tests.
- Type check: `npx tsc --noEmit --pretty false`: pass.
- `git diff --check`: pass.
- `npm run build`: not run; this plan adds a pure TypeScript utility that passed the repository type check and does not change the live route or bundle entry.
- `npm run build:pages`: not run; no router registration, page, public path, or public asset changed.

## TDD Gate Compliance

- RED commit `c90bc2a` precedes GREEN commit `950b987`.
- The RED suite failed through explicit missing-feature assertions rather than a module-loader crash.
- The focused suite remained green after Task 2 diagnostic hardening.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 11 can import `resolvePythonDataToolsChapter` into its protected atomic route switch instead of repeating compatibility policy.
- Live router, page, checkpoint, and Progress behavior remain unchanged and ready for Plan 11's indivisible migration.
- Plan 06's separate package-legitimacy checkpoint remains outside this plan; no package was installed here.

## Self-Check: PASSED

- Both task-owned files exist.
- Task commits `c90bc2a`, `950b987`, and `419f843` exist in repository history in RED-before-GREEN order.
- Focused, Python Data Tools, complete repository, type-check, and whitespace gates pass.
- The only unrelated untracked file is `docs/gpt_advice.md`; it was not read, modified, staged, or committed.

---
*Phase: python-data-tools-stage-4*
*Completed: 2026-07-16*
