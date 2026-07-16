---
phase: python-data-tools-stage-4
plan: "07"
subsystem: runtime-results
tags: [python-data-tools, plotly, typed-loader, github-pages, bilingual-fallback]

requires:
  - phase: python-data-tools-stage-4-05
    provides: Generated bilingual runtime chapters and result-presentation blocks
  - phase: python-data-tools-stage-4-06
    provides: Explicit human approval for the two exact Plotly package versions
  - phase: python-data-tools-stage-3
    provides: Authoritative manifest, four JSON results, three PNGs, and one Plotly Figure JSON
provides:
  - Exact approved Plotly runtime and type dependency boundary
  - Strict typed manifest and per-result loaders with local discriminated states
  - Semantic JSON adapters and authoritative PNG fallback dependencies
  - Bilingual result presentation driven by generated course copy
affects: [python-data-tools-stage-4-08, python-data-tools-stage-4-09, plotly-rendering, lesson-page-session]

tech-stack:
  added: [plotly.js-basic-dist-min@3.7.0, "@types/plotly.js@3.0.10"]
  patterns:
    - Parse static runtime data as unknown before typed adaptation
    - Keep manifest and resource errors inside the affected result state
    - Pass learner-facing result copy from generated bilingual authorities

key-files:
  created:
    - src/types/plotly-basic.d.ts
    - src/utils/pythonDataToolsOutputs.ts
    - src/components/PythonDataToolsResultBlock.vue
    - tests/python-data-tools-runtime-outputs.test.ts
  modified:
    - package.json
    - package-lock.json

key-decisions:
  - "The user explicitly approved exactly plotly.js-basic-dist-min@3.7.0 and @types/plotly.js@3.0.10; no alternative package or version was installed."
  - "The pure loader owns no mount lifecycle, automatic invocation, retry timer, storage, or Progress behavior; Plan 09 remains the sole page-session owner."
  - "PNG fallback tables depend only on workingday-comparison and final-analysis-evidence, never copied statistics, CSV recomputation, or image extraction."
  - "PythonDataToolsResultBlock requires the generated PythonDataToolsResultPresentationBlock instead of maintaining learner copy by output ID."

patterns-established:
  - "Authoritative output boundary: manifest order and contract IDs are checked before any resource is adapted."
  - "Local teaching fallback: result errors preserve generated alt, interpretation, limitation, fallback summary, and supplied authoritative equivalent tables."

requirements-completed: [R4, R8]

coverage:
  - id: D1
    description: The two human-approved Plotly packages are exact-pinned in package.json, the root lock entry, and resolved lock entries with an official-type ambient alias.
    requirement: R4
    verification:
      - kind: integration
        ref: "exact-version node assertion && npm ls plotly.js-basic-dist-min@3.7.0 @types/plotly.js@3.0.10"
        status: pass
    human_judgment: false
  - id: D2
    description: All eight authoritative results load through strict unknown guards, contract order, both public bases, abort support, and local error states without Progress or storage ownership.
    requirement: R4
    verification:
      - kind: unit
        ref: "tests/python-data-tools-runtime-outputs.test.ts#manifest and output loader contracts"
        status: pass
    human_judgment: false
  - id: D3
    description: Generated bilingual result copy surrounds semantic key values, tables, images, raw-data disclosure, and accessible local fallbacks.
    requirement: R8
    verification:
      - kind: unit
        ref: "tests/python-data-tools-runtime-outputs.test.ts#result block presentation contract"
        status: pass
      - kind: integration
        ref: "npm run build && npm run build:pages"
        status: pass
    human_judgment: false

duration: 10 min
completed: 2026-07-16
status: complete
---

# Phase python-data-tools-stage-4 Plan 07: Authoritative Result Loading Summary

**Exact-approved Plotly dependencies, strict base-safe result adapters, and generated bilingual teaching blocks now form the runtime boundary for all eight Stage 3 artifacts.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-16T15:14:20Z
- **Completed:** 2026-07-16T15:24:48Z
- **Tasks:** 3
- **Files modified:** 6

## Accomplishments

- Installed only `plotly.js-basic-dist-min@3.7.0` and `@types/plotly.js@3.0.10`, with exact package and lock roots plus a minimal alias to the official Plotly declarations.
- Added strict manifest and payload guards, typed semantic adapters, abort-aware local states, `withPublicBase()` handling, and explicit PNG fallback dependencies for all eight result IDs.
- Added a bilingual `PythonDataToolsResultBlock` that consumes generated presentation copy, renders JSON as key values/tables by default, keeps raw JSON optional, hides broken images, and preserves local text/table fallbacks.

## Approval Reference

- Plan 06 recorded the current registry provenance, integrity, install-script surface, and Stage 3 runtime-version match.
- The user replied `批准` on 2026-07-16 for exactly `plotly.js-basic-dist-min@3.7.0` and `@types/plotly.js@3.0.10`.
- No alternative package, version, CDN, full Plotly bundle, install script, or UI/schema framework was introduced.

## Task Commits

Each task was committed atomically:

1. **Task 1: Install only the approved exact Plotly packages** - `a3d118f` (chore)
2. **Task 2 RED: Define the failing typed loader contract** - `30b3a16` (test)
3. **Task 2 GREEN: Build the typed manifest/output loader and adapters** - `c8d3543` (feat)
4. **Task 3: Render JSON and PNG results as bilingual teaching blocks** - `6b03117` (feat)

## Files Created/Modified

- `package.json` - Exact runtime and development dependency pins.
- `package-lock.json` - Exact root and resolved package entries with registry integrity.
- `src/types/plotly-basic.d.ts` - Minimal basic-distribution alias to official Plotly types.
- `src/utils/pythonDataToolsOutputs.ts` - Strict manifest/payload guards, typed load states, semantic adapters, base-safe URLs, and fallback dependencies.
- `src/components/PythonDataToolsResultBlock.vue` - Generated-copy result presentation with semantic data, accessibility, and local fallback rendering.
- `tests/python-data-tools-runtime-outputs.test.ts` - Loader, schema, base-path, concurrency, abort, fallback, generated-copy, and source-ownership coverage.

## Decisions Made

- Kept all automatic fetch, stale-request ownership, and single-use manual reload behavior out of the utility and component; Plan 09 will own that page-session transition.
- Fetched PNG bytes only to establish resource availability while retaining the manifest-owned public URL for image rendering.
- Converted mixed Stage 3 schemas to typed teaching view models before rendering, so templates do not enumerate arbitrary payload objects.
- Preserved Plotly rendering as a named local boundary for Plan 08; no implementation import of `plotly.js-basic-dist-min` exists yet.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The dataset schema records field roles as role-to-column arrays rather than column-to-role strings. The adapter inverts that authoritative structure during guarded parsing; no schema or source artifact was changed.
- Initial type checking exposed several `unknown` narrowing gaps. They were corrected before the Task 2 GREEN commit, and both builds pass.

## Verification

- Exact package/lock literal assertion: pass.
- `npm ls plotly.js-basic-dist-min@3.7.0 @types/plotly.js@3.0.10`: pass.
- `node --test tests/python-data-tools-runtime-outputs.test.ts`: pass, 13 tests.
- `node --test tests/python-data-tools-*.test.ts`: pass, 96 tests.
- `npm test`: pass, 618 tests.
- `npm run build`: pass with the existing large-chunk warning.
- `npm run build:pages`: pass with the existing large-chunk warning.
- `git diff --check`: pass.
- Static-import inspection: pass; no Plotly implementation import exists before Plan 08.

## Known Stubs

None. The named Plotly slot is an intentional Plan 08 extension boundary and already has generated static fallback content; it does not leave a blank result.

## User Setup Required

None.

## Next Phase Readiness

- Plan 08 can dynamically import the exact basic Plotly bundle and wire `react()`/`purge()` into the existing result boundary.
- Plan 09 can own the one automatic manifest request, stale/abort cleanup, typed per-result state distribution, and one single-use manual reload after initial failure.
- The loader has no storage, Progress, mount lifecycle, retry counter, or timer behavior to conflict with those downstream owners.

## Self-Check: PASSED

- All six planned source/config/test files exist.
- Commits `a3d118f`, `30b3a16`, `c8d3543`, and `6b03117` exist in history.
- The exact human approval reference and package versions match Plan 06.
- Focused tests, the Python Data Tools group, the 618-test suite, both builds, diff validation, and lazy-import inspection passed.
- `docs/gpt_advice.md` remains unrelated and was not read, modified, staged, or committed.

---
*Phase: python-data-tools-stage-4*
*Completed: 2026-07-16*
