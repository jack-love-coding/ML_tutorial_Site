---
phase: python-data-tools-stage-4
plan: "09"
subsystem: ui
tags: [vue, typescript, bilingual, paged-lessons, output-session, accessibility]
requires:
  - phase: python-data-tools-stage-4-05
    provides: generated bilingual eight-chapter runtime projection
  - phase: python-data-tools-stage-4-07
    provides: typed authoritative result loaders and teaching result block
  - phase: python-data-tools-stage-4-08
    provides: lazy constrained Plotly renderer with local fallback
provides:
  - current-chapter-only Python Data Tools paged teaching surface
  - five stateless bilingual teaching prompt presentations
  - page-owned one-shot output session with abort/stale cleanup and one manual reload allowance
  - responsive sticky/mobile navigation, inline results, and base-safe Notebook downloads
affects: [python-data-tools-stage-4-11, runtime-integration, algorithm-view]
tech-stack:
  added: []
  patterns: [page-owned async session controller, generated-block renderer, current-only course pagination]
key-files:
  created:
    - src/components/PythonDataToolsTeachingPrompt.vue
    - src/components/PythonDataToolsPagedLesson.vue
    - src/composables/usePythonDataToolsOutputSession.ts
    - src/styles/modules/python-data-tools.css
    - tests/python-data-tools-runtime-page.test.ts
  modified:
    - src/styles/index.css
    - tests/python-data-tools-runtime-prompts.test.ts
    - tests/python-data-tools-runtime-outputs.test.ts
key-decisions:
  - "The page receives the current generated chapter and locale from the later live integration, while the generated projection remains the single source for TOC and pager order."
  - "A testable session controller owns request tokens and AbortController lifecycle; the Vue composable only binds start/dispose to mount and unmount."
  - "A manifest failure never hides lesson content and grants exactly one session-level manual reload, consumed before the retry begins."
patterns-established:
  - "Inline block flow: localized Markdown or code is followed by the generated result presentation and typed session state, with static prompts rendered in source order."
  - "Download paths are accepted only from the validated manifest and resolved through withPublicBase."
requirements-completed: [R1, R2, R4, R5, R7, R8]
coverage:
  - id: D1
    description: "Five bilingual teaching pauses expose immediate reasoning, misconception guidance, and revisit links without interaction or progress state."
    requirement: R5
    verification:
      - kind: unit
        ref: "tests/python-data-tools-runtime-prompts.test.ts#teaching prompt component renders localized reasoning immediately without interaction state"
        status: pass
    human_judgment: false
  - id: D2
    description: "The dedicated course page renders one supplied chapter with an eight-entry TOC, stable pager, inline generated blocks, and no percentage or mastery surface."
    requirement: R1
    verification:
      - kind: integration
        ref: "tests/python-data-tools-runtime-page.test.ts#dedicated page renders one supplied chapter with an eight-entry bilingual navigation"
        status: pass
    human_judgment: false
  - id: D3
    description: "The output session loads automatically once, distributes typed result states, aborts stale work, and permits one manual reload only after the initial manifest failure."
    requirement: R4
    verification:
      - kind: integration
        ref: "tests/python-data-tools-runtime-outputs.test.ts#page output session owns one automatic load, abort cleanup, typed distribution, and one manual allowance"
        status: pass
      - kind: integration
        ref: "tests/python-data-tools-runtime-outputs.test.ts#session offers exactly one manual reload only after initial manifest failure"
        status: pass
    human_judgment: false
  - id: D4
    description: "Header and final-report placements provide the executed Chinese Notebook and local environment disclosure through base-safe manifest paths."
    requirement: R7
    verification:
      - kind: integration
        ref: "tests/python-data-tools-runtime-page.test.ts#page exposes two base-safe Notebook placements and one session-level reload action"
        status: pass
      - kind: other
        ref: "npm run build:pages"
        status: pass
    human_judgment: false
duration: 10min
completed: 2026-07-16
status: complete
---

# Python Data Tools Stage 4 Plan 09: Paged Teaching Surface Summary

**An eight-chapter bilingual current-only reader now presents generated prose, code, authoritative results, and static teaching pauses through one abort-safe page session.**

## Performance

- **Duration:** 10 min
- **Started:** 2026-07-16T15:39:40Z
- **Completed:** 2026-07-16T15:49:52Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Added a teaching-first paged component with a sticky desktop TOC, expandable mobile TOC, chapter location, current-only article, previous/next navigation, and responsive accessible fallbacks.
- Rendered generated Markdown, immutable Python code, generated result presentations, typed output states, and all five stateless teaching prompts inline in authoritative order.
- Added a page-owned session that performs one automatic manifest load, isolates per-result failures, invalidates stale requests, aborts on disposal, and consumes one optional manual reload after initial failure.
- Added two manifest-backed Chinese Notebook download placements with executed-result and local-environment disclosure, while keeping body content readable during loading or failure.

## Task Commits

Each task was committed through RED then GREEN:

1. **Task 1 RED: static prompt contract** - `c0d974e`
2. **Task 1 GREEN: static teaching prompt presentation** - `d171d63`
3. **Task 2 RED: paged page and output-session contract** - `dc7c029`
4. **Task 2 GREEN: page, session, downloads, and responsive layout** - `338ab16`

## Files Created/Modified

- `src/components/PythonDataToolsTeachingPrompt.vue` - Static semantic question, reasoning, misconception, and revisit presentation.
- `src/components/PythonDataToolsPagedLesson.vue` - Current-only generated chapter renderer with TOC, pager, inline results, prompts, downloads, and local reload action.
- `src/composables/usePythonDataToolsOutputSession.ts` - Testable request-token/AbortController session plus mount/unmount composable wrapper.
- `src/styles/modules/python-data-tools.css` - Module-scoped desktop, mobile, focus, overflow, table, fallback, and reduced-motion rules.
- `src/styles/index.css` - Registers the Python Data Tools module stylesheet.
- `tests/python-data-tools-runtime-page.test.ts` - Page structure, source authority, download, reload, and responsive contract coverage.
- `tests/python-data-tools-runtime-prompts.test.ts` - Static prompt component and no-side-effect assertions.
- `tests/python-data-tools-runtime-outputs.test.ts` - Session success, single reload, abort, and stale-state tests.

## Decisions Made

- Kept page routing/progress integration out of this plan. Plan 11 will pass the current generated chapter and locale atomically with redirect and historical-progress protection.
- Loaded all eight small authoritative result states in one page session so current result rendering and declared equivalent-table fallbacks share one validated manifest and one lifecycle.
- Left Plotly's heavy library behind Plan 08's dynamic import; the Plotly component mounts only when the current chapter contains the Plotly result block. The live route bundle boundary is verified after Plan 11 makes this page reachable.

## Verification

- `node --test tests/python-data-tools-runtime-page.test.ts tests/python-data-tools-runtime-prompts.test.ts tests/python-data-tools-runtime-outputs.test.ts` — 25/25 passed.
- `node --test tests/python-data-tools-*.test.ts` — 105/105 passed.
- `npm test` — 627/627 passed.
- `node scripts/python-data-tools/build-runtime-content.mjs --check` — generated projection current.
- `npm run build` — passed.
- `npm run build:pages` — passed.
- `git diff --check` — passed.

Both builds retain the repository's existing large-chunk warning; no new build failure was introduced.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The first Pages type check identified that the generic manifest load state union also includes idle/loading variants. The failure branch now checks `status === 'error'` before reading its error code; focused tests and both builds then passed.

## Known Stubs

None. Empty arrays in the session and tests are transient typed collections or optional fallback results, not learner-facing placeholder content.

## Threat Flags

None. Markdown stays behind `MarkdownMathContent`; Notebook and environment paths come only from the validated manifest and `withPublicBase`.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 11 can select `PythonDataToolsPagedLesson` with the current generated chapter and locale without moving course prose into `AlgorithmView`.
- Route, i18n, checkpoint, and Progress V1 compatibility remain intentionally untouched for the atomic Plan 11 switch.
- No blocker remains. The live build after Plan 11 should confirm the Plotly library is emitted as a separate on-demand chunk from the dedicated route.

## Self-Check: PASSED

- All created files exist.
- Commits `c0d974e`, `d171d63`, `dc7c029`, and `338ab16` exist.
- The only untracked workspace file is the untouched user-owned `docs/gpt_advice.md`.

---
*Phase: python-data-tools-stage-4*
*Completed: 2026-07-16*
