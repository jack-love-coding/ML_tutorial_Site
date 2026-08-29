---
phase: 26-loss-functions-rebuild
plan: "06"
subsystem: curriculum
tags: [vue, typescript, bilingual-content, loss-functions, safe-markdown, tdd]

requires:
  - phase: 26-loss-functions-rebuild
    plan: "05"
    provides: Published loss-function datasets, executed bilingual Notebooks, locked summaries, plots, and complete output manifest
provides:
  - Typed registry for all 16 published loss-function assets, topic/code identities, chapter bindings, and strict runtime output validators
  - Seven-chapter bilingual loss-functions lesson from practical error rules through likelihood, NLL, MLE, and output-gradient verification
  - Compatibility protection for routes, checkpoints, Progress V1/V2 identities, public-base paths, safe rendering, and deferred training scope
affects: [26-07, phase-27-linear-regression, phase-29-logistic-regression, loss-functions]

tech-stack:
  added: []
  patterns:
    - Module-local typed asset and output registry backed by strict pure JSON validators
    - TDD content contracts that bind bilingual prose to locked output, code-cell, asset, lab, and compatibility identities

key-files:
  created:
    - src/data/lossFunctionsAssets.ts
    - tests/loss-functions-compatibility.test.ts
    - tests/loss-functions-content.test.mjs
  modified:
    - src/data/lossFunctionsModule.ts
    - tests/algorithm-progress.test.ts

key-decisions:
  - "Keep loss asset descriptors and chapter bindings module-local instead of extending the global StorySection contract."
  - "Treat published Notebook outputs as the numerical authority: lesson prose states formulas and interpretations but binds visible values through typed output IDs."
  - "Limit Phase 26 gradient verification to dL/dyhat and dL/dz, handing parameter gradients and training to Phase 27 and Phase 29."

patterns-established:
  - "Locked-output teaching: chapter bindings enumerate exact topic, output, asset, and code-cell IDs."
  - "Compatibility by proof: add the seventh deep link through the existing generic lazy route without editing router, catalog, checkpoint, navigation, or progress authorities."

requirements-completed: [LOSS-01, LOSS-02, LOSS-03]

coverage:
  - id: D1
    description: Typed 16-member local asset registry and strict output validation with base-safe paths and preserved public identities
    requirement: LOSS-01
    verification:
      - kind: integration
        ref: "tests/loss-functions-compatibility.test.ts#asset registry, output validator, route, checkpoint, progress, and base-path contracts"
        status: pass
    human_judgment: false
  - id: D2
    description: Complete bilingual practical loss and probability-origin teaching from error/MSE/MAE/BCE through likelihood, NLL, and MLE
    requirement: LOSS-02
    verification:
      - kind: integration
        ref: "tests/loss-functions-content.test.mjs#seven-chapter bilingual teaching and locked-output bindings"
        status: pass
    human_judgment: false
  - id: D3
    description: Output-gradient verification with analytic/central-difference comparisons, h sweep, error diagnostics, MAE kink, and Phase 27/29 handoff
    requirement: LOSS-03
    verification:
      - kind: integration
        ref: "node --test tests/loss-functions-content.test.mjs tests/loss-functions-compatibility.test.ts tests/algorithm-progress.test.ts"
        status: pass
      - kind: other
        ref: "npm run build"
        status: pass
    human_judgment: false

duration: 25m
completed: 2026-07-28
status: complete
---

# Phase 26 Plan 06: Typed Bilingual Loss Lesson Contract Summary

**A typed 16-asset contract now drives a safe seven-chapter bilingual loss lesson from real MSE/MAE/BCE rows through likelihood, stable NLL, MLE, and output-gradient verification.**

## Performance

- **Duration:** 25m
- **Started:** 2026-07-28T15:31:14Z
- **Completed:** 2026-07-28T15:56:36Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- Added exact topic, Notebook, dataset, manifest, attribution, environment, summary, and plot descriptors for all 16 published local assets, plus strict validators for locked JSON outputs.
- Rebuilt all seven chapters as complete `zh-CN`/`en` teaching loops whose formulas, variable names, code-cell IDs, output IDs, lab IDs, misconceptions, and next steps agree.
- Preserved the module slug, root and deep-link routes, checkpoint/revisit identities, Progress V1/V2 storage keys, safe Markdown path, and deferred parameter-training boundary without changing their production authorities.

## Task Commits

Each TDD task was committed atomically as RED then GREEN:

1. **Task 1: Lock compatibility and create the typed output/download contract**
   - `9ae87d2` — test RED: lock loss content compatibility contract
   - `a5b97ef` — feature GREEN: add typed loss asset contract
2. **Task 2: Rebuild the error, regression-loss, and BCE teaching chapters**
   - `eb0dc3e` — test RED: specify practical loss teaching chapters
   - `c95cd34` — feature GREEN: rebuild practical loss teaching chapters
3. **Task 3: Complete the likelihood-origin bridge and seven-chapter teaching loop**
   - `5737268` — test RED: specify likelihood and gradient teaching loop
   - `e65a56b` — feature GREEN: complete likelihood and gradient teaching loop

## Files Created/Modified

- `src/data/lossFunctionsAssets.ts` — Module-local asset/topic/output unions, exact descriptors, chapter bindings, and pure runtime output validators.
- `src/data/lossFunctionsModule.ts` — Seven ordered bilingual chapters with typed bindings and the final gradient-verification chapter.
- `tests/loss-functions-compatibility.test.ts` — Identity, deep-link, checkpoint, Progress, asset inventory, validator, safe-render, and public-base contracts.
- `tests/loss-functions-content.test.mjs` — Complete teaching-loop, locked-output, formula/code, safe-render, and deferred-scope contracts.
- `tests/algorithm-progress.test.ts` — Exact loss module completion set updated from six to seven chapters, with storage behavior unchanged.

## Decisions Made

- Kept the loss registry and chapter binding types local to this module so one course does not widen the global `StorySection` schema.
- Used locked output IDs and Notebook code identities as the page-visible numerical authority; prose contains formulas and interpretation, not copied summary values.
- Kept Softmax as a concise BCE-to-multiclass bridge and limited gradient verification to output/logit derivatives; chain-rule parameter training remains in Phase 27 and Phase 29.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking Issue] Made direct Node test imports explicit**

- **Found during:** Task 1 (typed output/download contract)
- **Issue:** The direct Node test runner could not resolve newly imported TypeScript modules through extensionless runtime imports.
- **Fix:** Used explicit `.ts` imports in the loss module so the focused Node tests and the Vite/TypeScript build share a resolvable module graph.
- **Files modified:** `src/data/lossFunctionsModule.ts`
- **Verification:** Focused Node tests, all 825 repository tests, and `npm run build` pass.
- **Committed in:** `a5b97ef`

---

**Total deviations:** 1 auto-fixed (1 Rule 3)
**Impact on plan:** The fix was required for the planned direct Node verification and did not expand product scope.

## Issues Encountered

- The registered state handler advanced the body and roadmap to Plan 7, reported 6/7 summaries and 86%, and `state.patch` aligned `current_plan` to `26-07`; its known nested-frontmatter limitation leaves `progress.percent` at `0`, so that tooling limitation was recorded rather than bypassed with a direct edit.
- No issue remained beyond the resolved import-resolution deviation. The production build retains the repository's existing large-chunk warning but completes successfully.

## Known Stubs

None. Vue presentation integration is intentionally owned by Plan 26-07 rather than represented by placeholder content here.

## Verification

- `node --test tests/loss-functions-content.test.mjs tests/loss-functions-compatibility.test.ts tests/algorithm-progress.test.ts` — 26/26 passed.
- `npm test` — 825/825 passed.
- `npm run build` — passed; existing chunk-size warning only.
- Plan diff confirmed no production edit to router, catalog, navigation, checkpoint, or Progress implementations.
- Stub scan found no learner-facing placeholder, TODO, or empty-data wiring in plan-owned files.
- Threat-surface scan found no new network endpoint, authentication path, filesystem access, or schema trust boundary beyond the plan's validated local JSON and sanitized Markdown boundaries.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Plan 26-07 can consume the typed chapter bindings and runtime validators to render the published output tables, plots, downloads, and labs.
- Phase 27 and Phase 29 have explicit chain-rule handoffs for linear- and logistic-regression parameter training.
- No blockers.

## Self-Check: PASSED

- All five plan files exist.
- All six TDD task commits exist in Git history.
- Summary claims match the focused suite, full test suite, build, stub scan, and changed-file audit.

---
*Phase: 26-loss-functions-rebuild*
*Completed: 2026-07-28*
