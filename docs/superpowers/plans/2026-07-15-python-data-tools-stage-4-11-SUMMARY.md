---
phase: python-data-tools-stage-4
plan: "11"
subsystem: runtime-integration
tags: [python-data-tools, vue-router, generated-content, progress-compatibility, i18n, tdd]

requires:
  - phase: python-data-tools-stage-4
    plan: "10"
    provides: Pure legacy-current-unknown chapter resolver
  - phase: python-data-tools-stage-4
    plans: ["07", "08", "09"]
    provides: Generated runtime projection, paged lesson renderer, typed output presentation, and lazy Plotly branch
provides:
  - Atomic live switch from the retired five-section Python lesson to the generated eight-chapter Python Data Tools course
  - Pre-mount canonical redirects for root, five legacy chapter IDs, and unknown chapter IDs
  - Exact bilingual catalog metadata and eight current section labels
  - Final-report-only Course Review with two descriptive-analysis checkpoints and canonical revisit links
  - Historical V1 algorithm-attempt preservation across redirects, new submissions, and reload
affects: [python-data-tools-stage-4-12, live-course-runtime, github-pages]

tech-stack:
  added: []
  patterns:
    - Resolver-backed route guards before generic lesson mounting
    - Shallow live module adapter over generated runtime chapters
    - Dedicated course page branch that omits generic algorithm completion UI
    - Presentation-only course review over the existing append-only attempt writer

key-files:
  created:
    - tests/python-data-tools-runtime-integration.test.ts
    - tests/python-data-tools-runtime-progress.test.ts
  modified:
    - src/router/index.ts
    - src/views/AlgorithmView.vue
    - src/data/pythonNotebookModule.ts
    - src/i18n/messages.ts
    - src/data/algorithmCheckpoints.ts
    - src/components/AlgorithmCheckpointQuiz.vue
    - tests/python-data-tools-runtime-routing.test.ts

key-decisions:
  - "Canonicalize Python root, legacy, and unknown chapter URLs in dedicated guards before AlgorithmView and its progress watcher mount."
  - "Keep python-notebook and /learn/python-notebook stable while adapting its chapter list directly from the generated runtime projection."
  - "Render the two descriptive-analysis questions as a final Course Review with explanations and revisit links, while retaining the existing submit and append-only persistence behavior."
  - "Omit the complete generic hero/status/stats subtree for Python Data Tools; all other algorithm modules retain it."

requirements-completed: [R1, R2, R3, R4, R5, R6, R7, R8]

coverage:
  - id: D1
    description: Current, legacy, root, and unknown URLs resolve to stable canonical eight-chapter routes before page mount.
    requirement: R3
    verification:
      - kind: integration
        ref: tests/python-data-tools-runtime-routing.test.ts
        status: pass
    human_judgment: false
  - id: D2
    description: The live course uses the generated chapters, exact bilingual metadata, dedicated page branch, and final-report-only Course Review.
    requirement: R1
    verification:
      - kind: integration
        ref: tests/python-data-tools-runtime-integration.test.ts
        status: pass
    human_judgment: false
  - id: D3
    description: Historical Python attempts remain an unchanged prefix and the V1 loader applies no current-checkpoint allowlist.
    requirement: R3
    verification:
      - kind: integration
        ref: tests/python-data-tools-runtime-progress.test.ts
        status: pass
    human_judgment: false

completed: 2026-07-16
status: complete
---

# Phase python-data-tools-stage-4 Plan 11: Atomic Live Runtime Migration Summary

**The existing `python-notebook` entry now serves the generated eight-chapter descriptive Python Data Tools course, with canonical pre-mount redirects, exact bilingual copy, and preserved historical progress.**

## Accomplishments

- Replaced the handwritten five-section live module body with a shallow adapter over the generated eight-chapter runtime while preserving the module ID, root route, and required-core curriculum role.
- Added dedicated root and chapter routes before the generic lesson route. Five legacy IDs and unknown/root requests redirect with `replace: true` before `AlgorithmView` can mount or write last-visited progress.
- Routed Python learners directly into `PythonDataToolsPagedLesson` and omitted the generic algorithm hero, completion status, recent-learning marker, and runtime statistics for this course only.
- Installed the approved Chinese and English module metadata plus all eight exact section labels, without retired model-training language in the Python learner metadata.
- Replaced the two retired Python checkpoints with grouped-summary and correlation interpretation questions. They appear only after `analysis-report` as 课程回顾 / Course Review, with explanations and canonical revisit links but no visible score or pass emphasis.
- Proved that old `python-notebook-array-shape` and `python-notebook-sklearn-split` attempts survive redirects, two new submissions, persistence, and reload unchanged.

## Task Commits

1. **Task 1 RED: Define the atomic runtime migration contract** - `e6a9c07` (test)
2. **Task 1 GREEN: Switch the live course with redirects, i18n, review, and compatibility updates** - `a72b369` (feat)
3. **Task 2: Harden integrated migration boundaries** - `9a3c203` (test)

## Files Created/Modified

- `src/router/index.ts` - Registers resolver-backed Python root/chapter guards ahead of the generic lesson route.
- `src/views/AlgorithmView.vue` - Selects the generated current chapter, renders the dedicated page, and limits Course Review to the final report.
- `src/data/pythonNotebookModule.ts` - Adapts the live module shallowly from generated runtime chapters.
- `src/i18n/messages.ts` - Publishes the exact current bilingual module and eight-section metadata.
- `src/data/algorithmCheckpoints.ts` - Defines the two descriptive-analysis Course Review questions and canonical revisit chapters.
- `src/components/AlgorithmCheckpointQuiz.vue` - Adds the Course Review presentation variant without adding a persistence writer.
- `tests/python-data-tools-runtime-integration.test.ts` - Locks live registration, curriculum role, i18n, page ownership, review placement, and presentation paths.
- `tests/python-data-tools-runtime-progress.test.ts` - Locks historical-attempt prefix preservation and V1 loader behavior.
- `tests/python-data-tools-runtime-routing.test.ts` - Locks route order, current direct links, legacy mappings, and stable fallback.
- Repository compatibility assertions and the deterministic Curriculum V3 content audit were updated to reflect the atomic live switch.

## Decisions Made

- Used Plan 10's pure resolver as the sole redirect policy instead of introducing route-specific mapping logic in the page or watcher.
- Kept the existing progress storage key, attempt shape, append writer, evaluation function, and submit handler. Course Review changes presentation and checkpoint content, not persistence semantics.
- Kept result-presentation ownership in generated content and `PythonDataToolsResultBlock`; no handwritten learner-copy or asset-path registry was added.
- Kept Plotly's basic distribution behind its existing dynamic result renderer. Both production builds emitted it as a separate `plotly-basic.min-*.js` chunk referenced by the lazy `AlgorithmView` branch.

## Deviations from Plan

- The first full repository run exposed seven assertions tied to the retired five-section Python lesson. They were directly caused compatibility failures, so they were updated in the same indivisible GREEN commit. The deterministic Curriculum V3 content-audit title was regenerated from the now-current catalog metadata.
- No Phase 12 closeout state, roadmap status, browser smoke artifact, or remote branch was changed; those remain intentionally outside Plan 11.

## Issues Encountered

- One compatibility test initially sliced the first `mode === 'formative'` occurrence from the submit function rather than the quiz header. Its source assertion was anchored to the header subtree so it continues to test the intended learner-visible behavior.
- Vite reports the repository's existing large-chunk warning. Both builds still succeed, and Plotly remains a separate dynamically referenced chunk.

## Verification

- Runtime compiler: `node scripts/python-data-tools/build-runtime-content.mjs --check` - pass; committed generated projection is current.
- Focused runtime boundary suite: `node --test tests/python-data-tools-runtime-*.test.ts` - pass, 44 tests.
- Python Data Tools suite: `node --test tests/python-data-tools-*.test.ts` - pass, 114 tests.
- Complete repository suite: `npm test` - pass, 636 tests.
- Production type-check/build: `npm run build` - pass (`vue-tsc -b` and Vite).
- GitHub Pages type-check/build: `npm run build:pages` - pass (`vue-tsc -b` and Pages-mode Vite).
- Plotly bundle inspection: one separate `dist/assets/plotly-basic.min-*.js` chunk, referenced from the lazy `AlgorithmView` chunk.
- Whitespace gate: `git diff --check` - pass.
- No new learner-facing use of “证据” was introduced by the Python Data Tools runtime switch.

## TDD Gate Compliance

- RED commit `e6a9c07` preceded GREEN commit `a72b369`.
- The RED suite failed through the missing dedicated route, old checkpoint IDs, and retired live registration, then passed after the indivisible runtime switch.
- Task 2 added independent diagnostics for identity/role, direct links, route ordering, generic-hero omission, canonical revisit URLs, and unfiltered historical attempts.

## Known Stubs

None.

## User Setup Required

None - the course uses committed local assets and generated runtime content.

## Next Phase Readiness

- Plan 12 can perform its bounded browser smoke and Stage 4 closeout against a fully green live runtime.
- Existing V1 Progress stores remain in place; this plan neither migrates nor deletes them.
- The separate large-chunk warning may be considered in a future performance phase, but it does not block this migration or Pages deployment.

## Self-Check: PASSED

- All three Plan 11 commits exist in RED-before-GREEN-before-hardening order.
- Focused, Python-specific, repository-wide, production, Pages, bundle, and whitespace gates pass.
- Only the unrelated untracked `docs/gpt_advice.md` remains in the worktree; it was not read, modified, staged, or committed.

---
*Phase: python-data-tools-stage-4*
*Completed: 2026-07-16*
