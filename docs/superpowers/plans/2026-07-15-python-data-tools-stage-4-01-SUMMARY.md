---
phase: python-data-tools-stage-4
plan: "01"
subsystem: curriculum-content
tags: [python-data-tools, chinese-master, static-prompts, accessibility, notebook-parity]

requires:
  - phase: python-data-tools-stage-3
    provides: Executed Chinese Notebook, eight authoritative results, and stable source/output bindings
provides:
  - Normalized Chinese authority for chapters 1–4 using learner-facing result language
  - Complete master-authored presentation metadata for the two first-half JSON results
  - Stateless teaching prompts for shape-index and filter-groupby
  - Shared result-presentation and teaching-prompt authoring grammar for chapters 5–8
affects: [python-data-tools-stage-4-02, python-data-tools-stage-4-03, python-data-tools-stage-4-05]

tech-stack:
  added: []
  patterns:
    - Deterministic Markdown result-presentation blocks with six required fields
    - Contract-bound teaching-prompt markers with four explicit false policy flags

key-files:
  created: []
  modified:
    - docs/curriculum-v3/python-data-tools/chinese-master/README.md
    - docs/curriculum-v3/python-data-tools/chinese-master/01-notebook-workflow.md
    - docs/curriculum-v3/python-data-tools/chinese-master/02-numpy-foundations.md
    - docs/curriculum-v3/python-data-tools/chinese-master/03-pandas-structures.md
    - docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md
    - tests/python-data-tools-chinese-master.test.ts

key-decisions:
  - "JSON result presentations declare axisLegendTranslations as the explicit empty list [] rather than omitting the field."
  - "Existing exercise markers remain stable; a second teaching-prompt marker records prompt ownership and non-interactive policy."
  - "Stage 3 Python source bytes are compared cell-by-cell against the executed Notebook before content changes can pass."

patterns-established:
  - "Result presentation: title, accessibility description, axis/legend translations, interpretation, limitation, and fallback summary follow the bound cell."
  - "Static prompt: 想一想, 参考思路, 常见误区, and 复看 are immediately visible with no answer-selection flow."

requirements-completed: [R1, R5, R7, R8]

coverage:
  - id: D1
    description: Chapters 1–4 use learner-facing Chinese result language and the two owned JSON results have complete presentation metadata.
    requirement: R1
    verification:
      - kind: unit
        ref: tests/python-data-tools-chinese-master.test.ts#chapters one through four use learner-facing result language and complete result presentations
        status: pass
    human_judgment: false
  - id: D2
    description: NumPy and pandas-analysis pauses are complete stateless teaching prompts, and README defines the shared eight-chapter grammar.
    requirement: R5
    verification:
      - kind: unit
        ref: tests/python-data-tools-chinese-master.test.ts#the five contract mounts remain stable while first-half pauses are stateless teaching prompts
        status: pass
    human_judgment: false
  - id: D3
    description: First-half Python bytes and source/output bindings remain identical to the executed Stage 3 Notebook.
    requirement: R7
    verification:
      - kind: integration
        ref: tests/python-data-tools-chinese-master.test.ts#chapters one through four preserve Stage 3 Python bytes and source/output bindings
        status: pass
      - kind: integration
        ref: node --test tests/python-data-tools-chinese-master.test.ts tests/python-data-tools-notebook-assets.test.ts
        status: pass
    human_judgment: false
  - id: D4
    description: Result blocks include accessibility descriptions, explicit translation fields, limitations, and static fallback summaries.
    requirement: R8
    verification:
      - kind: unit
        ref: tests/python-data-tools-chinese-master.test.ts#chapters one through four use learner-facing result language and complete result presentations
        status: pass
    human_judgment: false

duration: 7 min
completed: 2026-07-16
status: complete
---

# Phase python-data-tools-stage-4 Plan 01: Chinese First-Half Authority Summary

**Chapters 1–4 now provide learner-facing result explanations, deterministic accessibility metadata, and two stateless teaching prompts without changing any Stage 3 Python cell or result binding.**

## Performance

- **Duration:** 7 min
- **Started:** 2026-07-16T04:39:00Z
- **Completed:** 2026-07-16T04:46:03Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Replaced learner-visible implementation vocabulary in chapters 1–4 with “运行结果”“分析发现”“需要注意”等教学用语。
- Added complete six-field presentation blocks for `dataset-shape-schema` and `workingday-comparison`, including local fallback summaries and explicit empty axis/legend lists.
- Converted `shape-index` and `filter-groupby` from answer-selection exercises into immediately explained static prompts, and documented the grammar Plans 02–05 will consume.

## Task Commits

Each task was committed atomically:

1. **Task 1: Normalize chapters 1–4 learner prose and result presentation** - `7571bd5` (feat)
2. **Task 2: Convert chapter 2 and 4 pauses and document the shared grammar** - `d69d6b4` (feat)

## Files Created/Modified

- `docs/curriculum-v3/python-data-tools/chinese-master/01-notebook-workflow.md` - Uses natural result language for the reproducible Notebook workflow.
- `docs/curriculum-v3/python-data-tools/chinese-master/02-numpy-foundations.md` - Adds the static `shape-index` teaching prompt.
- `docs/curriculum-v3/python-data-tools/chinese-master/03-pandas-structures.md` - Adds the complete `dataset-shape-schema` presentation block.
- `docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md` - Adds the `workingday-comparison` presentation block and static `filter-groupby` prompt.
- `docs/curriculum-v3/python-data-tools/chinese-master/README.md` - Defines the shared result and prompt authoring grammar.
- `tests/python-data-tools-chinese-master.test.ts` - Locks visible vocabulary, presentation completeness, stateless policy, grammar, and Notebook byte parity.

## Decisions Made

- Kept every existing `exercise` marker unchanged for contract compatibility and added a separate deterministic `teaching-prompt` marker.
- Used `[]` as the required axis/legend translation value for nonvisual JSON results so absence is explicit and machine-checkable.
- Compared master Python prefixes against the executed Notebook, allowing only the known Stage 3 setup/publication suffixes added by the builder.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Corrected the teaching-prompt parser section boundary**
- **Found during:** Task 2 verification
- **Issue:** The first parser implementation treated the prompt's own `## 想一想` heading as the end of the block.
- **Fix:** Anchored parsing at `## 想一想` and searched for the following second-level section instead.
- **Files modified:** `tests/python-data-tools-chinese-master.test.ts`
- **Verification:** `node --test tests/python-data-tools-chinese-master.test.ts`
- **Committed in:** `d69d6b4`

---

**Total deviations:** 1 auto-fixed (1 Rule 1 bug)
**Impact on plan:** The correction only fixed the planned test parser and did not expand scope.

## Issues Encountered

- The first Task 2 verification exposed the parser boundary bug above; the corrected run passed all focused tests.

## Verification

- `node --test tests/python-data-tools-chinese-master.test.ts tests/python-data-tools-notebook-assets.test.ts`: pass, 15 tests.
- `npm test`: pass, 585 tests.
- `git diff --check`: pass.
- `npm run build`: not run; this plan changed Markdown masters and static tests only.
- `npm run build:pages`: not run; no runtime, route, generated asset, or public-path source changed.

## Known Stubs

None.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 02 can apply the documented result-presentation and teaching-prompt grammar to chapters 5–8.
- Plan 03 can translate chapters 1–4 while preserving the markers and Python signatures established here.
- No package, runtime, route, checkpoint, Progress, or Stage 5 work was started.

## Self-Check: PASSED

- All six task-owned files exist.
- Task commits `7571bd5` and `d69d6b4` exist in repository history.
- Focused and complete test suites pass.
- The only unrelated untracked file is `docs/gpt_advice.md`; it was not read, modified, staged, or committed.

---
*Phase: python-data-tools-stage-4*
*Completed: 2026-07-16*
