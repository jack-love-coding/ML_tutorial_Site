---
phase: 27-linear-regression-rebuild
plan: "07"
subsystem: ui
tags: [vue, typescript, linear-regression, bike-sharing, accessibility, svg]

# Dependency graph
requires:
  - phase: 27-01
    provides: Pure Bike regression math, simulation facade, and locked diagnostic sequence
  - phase: 27-05
    provides: Strict local result registry, parsers, and published Bike output package
  - phase: 27-06
    provides: Eight-chapter bilingual Bike regression teaching corridor
provides:
  - Eight-state Bike regression workbench with bounded row, batch, optimizer, method, coefficient, and diagnostic controls
  - Strict locked-result presentation with explicit loading, invalid, and built-in teaching-fixture states
  - Deterministic Bike SVG and table visuals with text, shape, and line-pattern fallbacks instead of regression-specific WebGL
affects: [27-08, phase-28-tabular-regression]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Vue components consume strict parsed summaries and pure simulation snapshots without owning fit or preprocessing math
    - Deterministic SVG plus equivalent tables preserve teaching meaning without color, motion, or WebGL

key-files:
  created:
    - tests/linear-regression-labs.test.mjs
  modified:
    - src/components/LinearRegressionLessonLab.vue
    - src/components/LinearRegressionResults.vue
    - src/components/LinearRegressionUnivariateView.vue
    - src/components/LinearRegressionMultivariateView.vue

key-decisions:
  - "Keep each sibling result/workbench component on an independent abortable strict-summary load lifecycle rather than introducing shared mutable state."
  - "Treat pure simulation snapshots and strict parsed outputs as the only numerical authority; Vue performs presentation formatting and coordinate mapping only."
  - "Remove regression-specific Three.js rendering and encode the Bike case through deterministic SVG, tables, text labels, shapes, and line patterns."
  - "Retain the collapsed bilingual teaching diagram and cockpit semantic markers while rebuilding their content around the Bike contract."

patterns-established:
  - "Convergence gate: held-out diagnosis stays locked until the published optimizer and three-method agreement checks pass."
  - "Presentation-only visual: chart-ready snapshot arrays enter Vue; fit, residual, coefficient conversion, and metric calculations remain in pure TypeScript."
  - "Safe unavailable state: formulas and a clearly labeled hand fixture remain, while full-data metrics stay hidden."

requirements-completed: [LINR-01, LINR-02, LINR-03, LINR-04]

coverage:
  - id: D1
    description: "Learners can move from one locked Bike row through prediction, residual, loss contribution, batch state, and bounded optimizer replay."
    requirement: LINR-01
    verification:
      - kind: integration
        ref: "tests/linear-regression-labs.test.mjs#registry, controls, row-to-batch, and reset contracts"
        status: pass
      - kind: unit
        ref: "tests/linear-regression-simulation.test.ts#pure Bike snapshot facade"
        status: pass
    human_judgment: false
  - id: D2
    description: "The workbench and result panel compare three OLS methods and both coefficient spaces only after optimization completion."
    requirement: LINR-02
    verification:
      - kind: integration
        ref: "tests/linear-regression-labs.test.mjs#method comparison and coefficient presentation"
        status: pass
      - kind: integration
        ref: "tests/linear-regression-assets.test.ts#strict locked summary and method evidence"
        status: pass
    human_judgment: false
  - id: D3
    description: "The guided result sequence exposes hourly residual shape, prediction-bin spread, named cases, atemp instability, Ridge/Lasso boundaries, log1p, and combined review."
    requirement: LINR-03
    verification:
      - kind: integration
        ref: "tests/linear-regression-labs.test.mjs#staged diagnosis and named held-out cases"
        status: pass
      - kind: unit
        ref: "tests/linear-regression-math.test.ts#diagnostic reducers and coefficient conversion"
        status: pass
    human_judgment: false
  - id: D4
    description: "All eight chapters retain labeled, bounded, keyboard-operable controls and deterministic Bike visuals with non-color and motion-free fallbacks."
    requirement: LINR-04
    verification:
      - kind: integration
        ref: "tests/linear-regression-labs.test.mjs#accessibility and deterministic Bike visual contracts"
        status: pass
      - kind: integration
        ref: "tests/linear-regression-layout.test.mjs#cockpit and collapsed teaching layout contracts"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false

# Metrics
duration: 23min
completed: 2026-07-29
status: complete
---

# Phase 27 Plan 07: Bike Regression Workbench and Deterministic Visuals Summary

**A strict Bike Sharing workbench now carries one real row through batch fitting, three-method agreement, coefficient meaning, and staged held-out diagnosis using accessible deterministic SVG and tables.**

## Performance

- **Duration:** 23 min
- **Started:** 2026-07-29T13:05:45Z
- **Completed:** 2026-07-29T13:28:38Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Rebuilt the eight-chapter workbench around typed chapter states, bounded controls, reset and keyboard behavior, the pure Bike simulation facade, and an optimization-first diagnostic gate.
- Added strict abortable loading for the registered local summary in both workbench and result contexts, with explicit loading, invalid, unknown-chapter, and teaching-fixture behavior.
- Presented the locked representative row, training/held-out metrics, three-method agreement, both coefficient spaces, residual diagnostics, named cases, atemp stability, Ridge/Lasso boundaries, and log1p scope.
- Replaced the old synthetic/house and regression-specific Three.js visuals with deterministic Bike SVG projections, tables, bilingual labels, shape cues, dashed-line cues, and static explanations.

## Task Commits

Each task was committed atomically:

1. **Task 1: Establish Wave 0 lab, loading, and accessibility contracts** - `c1c8d32` (test)
2. **Task 2: Rebuild the typed Bike workbench and locked result panel** - `774cfd5` (feat)
3. **Task 3: Rebuild deterministic Bike views around chart-ready snapshots** - `0fc2c20` (feat)

Additional corrective commit:

- **Preserve existing cockpit layout and collapsed teaching contracts** - `a08b2a4` (fix)

## Files Created/Modified

- `tests/linear-regression-labs.test.mjs` - Locks chapter registry, trusted loading, fallback, pure-math boundaries, controls, method/coefficient evidence, diagnosis, named cases, and deterministic visuals.
- `src/components/LinearRegressionLessonLab.vue` - Composes the eight chapter states, strict summary lifecycle, bounded controls, pure simulation snapshots, safe fallback, and collapsed teaching evidence.
- `src/components/LinearRegressionResults.vue` - Presents validated optimizer, method, metric, coefficient, residual, named-case, collinearity, regularization, and log1p evidence.
- `src/components/LinearRegressionUnivariateView.vue` - Renders Bike hourly rental evidence and stage-specific snapshot values as deterministic SVG plus tables.
- `src/components/LinearRegressionMultivariateView.vue` - Renders temperature/humidity Bike evidence as shape-coded SVG plus an equivalent table without WebGL.

## Decisions Made

- Both sibling consumers load the registered summary through their own short-lived `AbortController`, strict parser, and safe state so neither depends on undocumented parent timing or mutable shared state.
- Vue components are allowed to format numbers and map trusted values to pixels, but all fitting, prediction, residual, coefficient conversion, and diagnostic reduction remain in the pure math/simulation layer.
- The regression-specific Three.js path was removed because deterministic SVG and tables better satisfy the locked Bike case, reduced-motion, mobile, and accessibility requirements.
- The established cockpit shell, collapsed teaching disclosure, and presets disclosure remain intact while their primary evidence is now the Bike contract.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Test Bug] Narrowed source assertions to the intended architecture boundaries**

- **Found during:** Tasks 2 and 3
- **Issue:** Initial RED assertions treated child-owned visual roles, unquoted object keys, method labels/property names, and named-role ownership as prohibited runtime math or missing behavior.
- **Fix:** Pointed assertions at the child visual contract, actual solver-call syntax, exact registry keys, and the combined workbench/result ownership boundary.
- **Files modified:** `tests/linear-regression-labs.test.mjs`
- **Verification:** All 14 active lab contracts pass; the four page/style/browser contracts remain explicitly deferred to Plan 27-08.
- **Committed in:** `774cfd5`, `0fc2c20`

**2. [Rule 1 - Layout Regression] Restored established cockpit semantics after the workbench rewrite**

- **Found during:** Overall `npm test`
- **Issue:** The rebuilt workbench had dropped semantic class markers and the collapsed teaching disclosure still required by the existing layout contract.
- **Fix:** Restored the exact unified/advanced-control markers and added a collapsed bilingual Bike residual/optimizer diagram without restoring the removed Three.js or synthetic calculation path.
- **Files modified:** `src/components/LinearRegressionLessonLab.vue`
- **Verification:** `tests/linear-regression-layout.test.mjs`, the lab contract, full suite, and production build pass.
- **Committed in:** `a08b2a4`

---

**Total deviations:** 2 auto-fixed (2 Rule 1)
**Impact on plan:** The fixes corrected test precision and preserved established cockpit behavior; no new route, store, result authority, dependency, or architectural scope was introduced.

## Issues Encountered

- The first full-suite run exposed four stale cockpit/layout expectations after the rewrite. The still-valid semantic and disclosure contracts were restored around Bike evidence, and the second full run passed.
- Vite continues to report the repository's existing large-chunk warning after a successful build; this plan did not change global bundle architecture.

## Known Stubs

None. The built-in `ŷ = 3`, `y = 4` fixture is an intentional, labeled safe fallback and never substitutes for full-data metrics.

## Threat Flags

None. The only trust-boundary reads are the planned registered local summary fetches, both protected by base-safe paths, abort handling, response checks, strict parsing, and non-metric fallback states.

## Authentication Gates

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 27-08 can compose the final page, downloads, responsive/reduced-motion styling, and bilingual browser matrix against stable workbench/result contracts.
- Phase 28 can reuse the explicit linear-model limits and tabular-regression handoff without changing the Bike numerical authority.
- No blockers remain.

## Validation

- `node --test tests/linear-regression-labs.test.mjs tests/linear-regression-math.test.ts tests/linear-regression-simulation.test.ts tests/linear-regression-assets.test.ts` - 40 passed, 4 explicitly deferred to Plan 27-08.
- `node --test tests/linear-regression-layout.test.mjs tests/linear-regression-labs.test.mjs` - 25 passed, 4 explicitly deferred to Plan 27-08.
- `npm test` - passed, including the repository's offline Notebook reproduction checks.
- `npm run build` - passed.
- `git diff --check` - passed.
- Protected pre-existing `.planning/config.json` and `docs/gpt_advice.md` retained their original SHA-256 values.

## Self-Check: PASSED

- All five created or modified implementation/test files and this summary exist.
- Task commits `c1c8d32`, `774cfd5`, `0fc2c20`, and corrective commit `a08b2a4` exist in history.
- Coverage metadata parses successfully with all four deliverables automatically covered by passing tests.

---
*Phase: 27-linear-regression-rebuild*
*Completed: 2026-07-29*
