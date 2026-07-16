---
phase: python-data-tools-stage-4
plan: "08"
subsystem: runtime-results
tags: [python-data-tools, plotly, vue, accessibility, lazy-loading, static-fallback]

requires:
  - phase: python-data-tools-stage-4-07
    provides: Exact approved Plotly packages, guarded Figure loader, typed view models, and bilingual ResultBlock
  - phase: python-data-tools-stage-4-05
    provides: Generated bilingual result-presentation blocks sourced from the paired masters
provides:
  - Chapter-local dynamic Plotly basic-bundle lifecycle with serialized react updates and purge cleanup
  - Constrained hour and date-type controls with stable locale-independent filter state
  - Local Plotly failure isolation with generated static explanation and authoritative equivalent-table support
affects: [python-data-tools-stage-4-09, python-data-tools-stage-4-11, lesson-page-session, plotly-rendering]

tech-stack:
  added: []
  patterns:
    - Dynamically import heavy browser libraries only after guarded data and a mounted target exist
    - Clone authoritative figures before localization and filtering
    - Serialize render requests and discard stale work before purging on unmount

key-files:
  created:
    - src/components/PythonDataToolsPlotlyFigure.vue
  modified:
    - src/components/PythonDataToolsResultBlock.vue
    - tests/python-data-tools-runtime-outputs.test.ts

key-decisions:
  - "Only the approved plotly.js-basic-dist-min package is dynamically imported; all Plotly value imports remain out of the eager module graph."
  - "The component owns only ephemeral filters and presentation state; chapter, prompt, checkpoint, Progress, fetch, and page-session state remain outside Plan 08."
  - "Locale changes derive a fresh localized clone from the same immutable Figure and generated presentation block without resetting the hour or visible-group filters."
  - "Legend clicks are disabled in favor of labelled site checkboxes so the visible-group summary stays authoritative."

patterns-established:
  - "Constrained Plotly lifecycle: queue react calls, guard each request ID, resize through ResizeObserver, remove listeners, and purge on unmount."
  - "Equivalent fallback: interactive failure is emitted locally while generated explanation and supplied authoritative tables remain in the same ResultBlock."

requirements-completed: [R4, R8]

coverage:
  - id: D1
    description: The authoritative hourly Figure renders through a lazy basic-bundle lifecycle with 0–23 hour controls, two guarded group toggles, exact hover fields, zoom/reset-only modebar, resize, stale-request protection, and purge cleanup.
    requirement: R4
    verification:
      - kind: unit
        ref: "tests/python-data-tools-runtime-outputs.test.ts#Plotly result renderer owns constrained filters, lazy lifecycle, localization, and cleanup"
        status: pass
      - kind: integration
        ref: "npm run build && npm run build:pages"
        status: pass
    human_judgment: false
  - id: D2
    description: Locale relabels a cloned Figure while preserving filter state, and interactive failures retain the current-filter summary, generated bilingual explanation, interpretation, limitation, and authoritative equivalent tables.
    requirement: R8
    verification:
      - kind: unit
        ref: "tests/python-data-tools-runtime-outputs.test.ts#result block wires one local Plotly renderer and keeps authoritative static equivalence on failure"
        status: pass
      - kind: integration
        ref: "node --test tests/python-data-tools-*.test.ts"
        status: pass
    human_judgment: false

duration: 9 min
completed: 2026-07-16
status: complete
---

# Phase python-data-tools-stage-4 Plan 08: Constrained Plotly Runtime Summary

**A guarded hourly Plotly explorer now localizes an immutable Figure through a queued lazy lifecycle, exposes only the approved filters and zoom/reset interaction, and degrades to the same static teaching result.**

## Performance

- **Duration:** 9 min
- **Started:** 2026-07-16T15:28:34Z
- **Completed:** 2026-07-16T15:37:08Z
- **Tasks:** 2
- **Files modified:** 3

## Accomplishments

- Added `PythonDataToolsPlotlyFigure` with labelled 0–23 range controls, guarded working/non-working group checkboxes, a live current-view summary, localized title/axes/legend/hover text derived from the generated presentation, and a zoom/reset-only modebar.
- Kept the Stage 3 Figure immutable by cloning it for every render, preserved Plotly's own typed-array decoding, serialized `react()` work with stale-request guards, resized through `ResizeObserver`, disabled uncontrolled legend state, and purged the graph on unmount.
- Replaced the temporary Plotly slot in `PythonDataToolsResultBlock` with one typed renderer and local failure signaling so the generated explanation and supplied authoritative fallback table remain visible without timers or Progress/session side effects.

## Task Commits

Each task was committed atomically:

1. **Task 1 RED: Define the constrained renderer contract** - `7b5f2c3` (test)
2. **Task 1 GREEN: Implement constrained Plotly lifecycle and filters** - `206ecdb` (feat)
3. **Task 2: Wire local Plotly failure and static equivalence** - `a37c957` (feat)

## Files Created/Modified

- `src/components/PythonDataToolsPlotlyFigure.vue` - Typed filters, master-derived localization, lazy Plotly lifecycle, accessible summary, and local fallback.
- `src/components/PythonDataToolsResultBlock.vue` - Single Plotly renderer wiring and equivalent-table visibility after local render failure.
- `tests/python-data-tools-runtime-outputs.test.ts` - Lifecycle, controls, modebar, immutable-clone, cleanup, wiring, fallback, and ownership contracts.

## Decisions Made

- Used `modeBarButtons: [['zoom2d', 'resetScale2d']]` instead of maintaining an exclusion list, making the allowed Plotly surface explicit.
- Kept the metric fixed to the authoritative `mean_rentals` view. The site controls expose only hour range and the two committed working-day groups; no unrelated Plotly tools or alternate statistics were introduced.
- Derived learner-facing chart labels from `PythonDataToolsResultPresentationBlock`. Component-local bilingual copy is limited to control labels, loading/error status, and the current-filter summary.
- Preserved the existing `fallbackResults` input as the authoritative table channel rather than decoding Plotly `bdata`, recomputing statistics, or copying numeric values.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The first type-check required Plotly's typed `Transition` object to include an explicit `easing`; adding `linear` with zero duration preserved the intended reduced-motion-safe behavior.
- Context7 was unavailable in this environment. Version-specific signatures for `react`, `purge`, `Plots.resize`, `modeBarButtons`, and Plotly events were verified against the installed approved `@types/plotly.js@3.0.10` declarations.

## Verification

- Task 1 RED: pass as a valid failing gate, 13 tests passed and the new component-missing contract failed.
- `node --test tests/python-data-tools-runtime-outputs.test.ts`: pass, 15 tests.
- `node --test tests/python-data-tools-*.test.ts`: pass, 98 tests.
- `npm test`: pass, 620 tests.
- `npm run build`: pass with the existing large-chunk warning.
- `npm run build:pages`: pass with the existing large-chunk warning.
- `git diff --check`: pass.
- Bundle inspection: no Plotly implementation appears in the current eager emitted chunks. `PythonDataToolsPlotlyFigure` contains the sole runtime import as a function-local dynamic import. Because Plan 09 intentionally has not yet made `PythonDataToolsResultBlock` reachable from the live page, Vite tree-shakes this currently unattached branch; Plan 09's live-page build is the point at which the separate Plotly chunk filename becomes observable.

## Known Stubs

None. The renderer is complete; live page/session ownership is intentionally reserved for Plan 09 rather than represented by mock state.

## User Setup Required

None.

## Next Phase Readiness

- Plan 09 can mount `PythonDataToolsResultBlock` from the paged lesson session, supply the `workingday-comparison` authoritative fallback result, and make the Plotly dynamic chunk reachable only in chapter seven.
- Fetch, abort, single-use manual reload, chapter navigation, prompt, checkpoint, and Progress ownership remain untouched and ready for their planned page-session integration.
- Remaining verification handoff: once Plan 09 makes the component reachable, inspect the Vite manifest/output and confirm `plotly.js-basic-dist-min` is emitted as a separate lazy chunk rather than merged into the lesson entry.

## Self-Check: PASSED

- The new renderer, updated ResultBlock, and focused test file exist.
- Commits `7b5f2c3`, `206ecdb`, and `a37c957` exist in history.
- Focused tests, all Python Data Tools tests, the 620-test suite, both builds, source ownership checks, and diff validation passed.
- No network endpoint, auth path, file-access trust boundary, storage key, route, checkpoint, or Progress behavior was introduced.
- `docs/gpt_advice.md` remains unrelated and was not read, modified, staged, or committed.

---
*Phase: python-data-tools-stage-4*
*Completed: 2026-07-16*
