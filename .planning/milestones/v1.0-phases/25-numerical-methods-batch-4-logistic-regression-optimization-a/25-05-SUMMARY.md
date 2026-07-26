---
phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a
plan: "05"
subsystem: numerical-methods-ui
tags: [vue, typescript, d3, logistic-regression, banknote, bilingual, accessibility]

requires:
  - phase: 25-04
    provides: Strict local Banknote loader plus deterministic TypeScript logistic engine, presets, traces, terminal metadata, and failure suggestions
  - phase: 25-03
    provides: Executed Notebook, local dataset and requirements, chapter summaries, complete JSON/CSV traces, and data dictionary
provides:
  - Outermost bilingual Banknote teaching enhancer for the existing optimization and training-diagnostics modules
  - Shared base-safe Notebook companion plus chapter-specific executed-output and audit downloads
  - Explicit draft-to-run optimization workbench with five presets, bounded controls, milestones, last-finite safety, and reset
  - Cached real-run D3 diagnostics comparison with four-step diagnosis chains and a separate five-mode synthetic support section
affects: [25-09, 25-11, 25-12, 25-13, optimization, training-diagnostics]

tech-stack:
  added: []
  patterns:
    - Outermost narrow module enhancer that preserves prior content identities and deduplicates primary lab placement
    - Optional companion assets resolved through withPublicBase without changing legacy companion records
    - Preset selection edits draft state; explicit Run alone commits engine results
    - Real traces compute once after abortable local loading while selectors only change presentation

key-files:
  created:
    - src/modules/math-lab/data/numericalBatch4Modules.ts
    - src/modules/math-lab/data/numericalBatch4Notebook.ts
  modified:
    - src/modules/math-lab/data/modules.ts
    - src/modules/math-lab/components/MathLabNotebookCompanion.vue
    - src/modules/math-lab/pages/MathLabModulePage.vue
    - src/styles/modules/math-lab.css
    - src/modules/math-lab/labs/MathGradientLab.vue
    - src/modules/math-lab/labs/TrainingDiagnosticsLab.vue
    - tests/numerical-methods-batch-4.test.ts

key-decisions:
  - "Apply the Batch 4 enhancer and companion resolver after Batches 1–3, touching only optimization and training-diagnostics while retaining every existing ID, quiz, route, checkpoint, and progress key."
  - "Keep preset selection and advanced controls as editable draft state; only an explicit Run calls trainLogistic and replaces the committed result."
  - "Compute all five real diagnostic runs once after local data load, use selectors only for cached presentation, and isolate evaluateTrainingScenario in a plainly labeled synthetic support section."
  - "Expose chapter summary, full trace JSON/CSV, and data dictionary as optional companion downloads, resolving every path through withPublicBase."

patterns-established:
  - "Teaching enhancer: add the real case around preserved module content, then deduplicate a registered lab to exactly one section placement."
  - "Lab state: loading/error/ready dataset state feeds pure engine calls; result state is separate from editable controls and remains finite on rejected attempts."
  - "Diagnostic provenance: real engine traces and deterministic synthetic recognition examples occupy separate labeled surfaces."

requirements-completed: [P25-SC4, P25-SC5]

coverage:
  - id: D1
    description: The two existing chapters provide complete bilingual Banknote optimization and four-step diagnosis loops while preserving routes, primary labs, quizzes, checkpoints, and progress storage.
    requirement: P25-SC4
    verification:
      - kind: integration
        ref: "tests/numerical-methods-batch-4.test.ts#[Plan 25-05] module content and preservation contracts"
        status: pass
    human_judgment: false
  - id: D2
    description: One shared Notebook plus local dataset, requirements, chapter summary, full trace, and dictionary downloads resolve under root and GitHub Pages bases.
    requirement: P25-SC5
    verification:
      - kind: integration
        ref: "tests/numerical-methods-batch-4.test.ts#[Plan 25-05] supporting downloads are localized, base-safe, and rendered"
        status: pass
      - kind: integration
        ref: "npm run build:pages"
        status: pass
    human_judgment: false
  - id: D3
    description: The optimization lab exposes five presets, explicit Run/Reset, bounded advanced controls, terminal milestones, and the exact last-finite failure path through the shared engine.
    requirement: P25-SC4
    verification:
      - kind: unit
        ref: "tests/numerical-methods-batch-4.test.ts#[Plan 25-04] last finite and invalid training controls"
        status: pass
      - kind: integration
        ref: "tests/numerical-methods-batch-4.test.ts#[Plan 25-05] optimization lab source contract"
        status: pass
      - kind: integration
        ref: "npm run build"
        status: pass
    human_judgment: true
    rationale: "Automated source and engine contracts prove behavior wiring, but final keyboard flow, responsive legibility, and non-color comprehension merit conversational UAT."
  - id: D4
    description: The diagnostics lab compares cached real preset traces with curve toggles and four-step diagnoses while retaining all five synthetic modes in a separate support surface.
    requirement: P25-SC5
    verification:
      - kind: integration
        ref: "tests/numerical-methods-batch-4.test.ts#[Plan 25-05] diagnostics lab source contract"
        status: pass
      - kind: integration
        ref: "npm run build"
        status: pass
    human_judgment: true
    rationale: "The deterministic data sources and separation are automated, while D3 curve readability and mobile comparison ergonomics benefit from visual UAT."

duration: 19 min
completed: 2026-07-22
status: complete
---

# Phase 25 Plan 05: Banknote Lessons, Companions, and Primary Labs Summary

**Two preserved Math Lab chapters now teach one reproducible Banknote case through explicit deterministic optimization, cached real-trace diagnosis, and base-safe executed artifacts**

## Performance

- **Duration:** 19 min
- **Started:** 2026-07-22T11:26:05Z
- **Completed:** 2026-07-22T11:44:45Z
- **Tasks:** 3
- **Files modified:** 9

## Accomplishments

- Added an outermost enhancer for only `optimization` and `training-diagnostics`, connecting stable BCE, conditioning, five runs, Armijo, stop/failure semantics, four-step diagnoses, compact final results, and the existing next-learning path without changing public identities.
- Published one shared executed Notebook, dataset, and requirements record plus localized chapter-summary, full JSON/CSV trace, and data-dictionary downloads under both root and GitHub Pages bases.
- Replaced the quadratic optimization authority with a thin, abortable Banknote engine consumer whose presets edit a draft and whose explicit Run commits start/backtrack/best/terminal/last-finite/suggestion results.
- Converted training diagnostics into a cached comparison of the five real engine traces with D3 curve toggles and bilingual diagnosis chains, while preserving all five deterministic synthetic modes in a separate, explicit support section.

## Task Commits

Each task was committed atomically; the TDD task has separate RED and GREEN commits:

1. **Task 1: Detailed bilingual enhancer and shared companions** - `2966e47` (feat)
2. **Task 2: Base-safe supporting downloads and page composition** - `d80a578` (feat)
3. **Task 3 RED: Banknote lab behavior/source contracts** - `eb66f0e` (test)
4. **Task 3 GREEN: Engine-powered optimization and diagnostics labs** - `196e630` (feat)

## Files Created/Modified

- `src/modules/math-lab/data/numericalBatch4Modules.ts` - Bilingual real-case sections, concepts, lab deduplication, exact five-run teaching, diagnoses, and next-step connection.
- `src/modules/math-lab/data/numericalBatch4Notebook.ts` - Two typed companion records sharing one Notebook/dataset/requirements and owning localized supporting artifacts.
- `src/modules/math-lab/data/modules.ts` - Applies the Batch 4 enhancer outermost after prior numerical batches.
- `src/modules/math-lab/components/MathLabNotebookCompanion.vue` - Renders optional supporting downloads with safe public-base URLs while leaving legacy records valid.
- `src/modules/math-lab/pages/MathLabModulePage.vue` - Appends the Batch 4 companion resolver without changing lazy lab imports or progress composition.
- `src/styles/modules/math-lab.css` - Adds scoped companion supporting-list layout and a one-column 390px fallback.
- `src/modules/math-lab/labs/MathGradientLab.vue` - Explicit-run workbench over the local loader and deterministic optimizer.
- `src/modules/math-lab/labs/TrainingDiagnosticsLab.vue` - Cached real-run D3 comparison, four-step diagnoses, and separate synthetic support practice.
- `tests/numerical-methods-batch-4.test.ts` - Content, preservation, companion, base, lazy-loading, explicit-run, real-trace, and provenance contracts.

## Decisions Made

- Batch 4 is an outer enhancer rather than a content migration: prior chapter material remains reachable, and each registered primary lab is normalized to exactly one section placement.
- The optimization workbench keeps L2, Armijo constants, validation patience, and other contract constants fixed. Learners can edit only feature space, method, learning rate/initial step, gradient tolerance, and maximum iterations.
- The exact raw/fixed/`Number.MAX_VALUE`/10 configuration reaches the engine unchanged; invalid inputs show issues rather than clamping, and safety failure retains the last accepted finite state.
- Real diagnostic traces are computed only once after the exact local snapshot loads. Synthetic curves remain available solely as clearly marked recognition practice and never stand in for a Banknote result.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

- The first GREEN build reported an unused `BANKNOTE_TRAINING_PRESETS` import in the diagnostics lab. Using the engine registry itself as the ordered preset source removed duplicate authority and the subsequent build passed.
- The complete Batch 4 test file still fails only the deliberately preserved Plan 25-09 illustration RED owner. The current Batch 4, Plans 25-03/04, and all six Plan 25-05 contracts pass 27/27 under the owner filter.

## TDD Gate Compliance

- RED commit `eb66f0e` failed both new lab contracts against the previous quadratic/synthetic-only components.
- GREEN commit `196e630` passed both new contracts, all six Plan 25-05 tests, the 27-test current-owner suite, `npm run build`, and `npm run build:pages`.
- No refactor commit was necessary after GREEN.

## Known Stubs

None. Loading values, nullable first-backtrack state, empty pre-load run maps, and initial empty validation issues are bounded runtime states rather than placeholder learner data.

## Threat Flags

None. The planned local-asset and learner-control trust surfaces use typed copy, existing sanitized rendering, `withPublicBase`, abortable loading, bounded explicit computation, validation issues, and last-finite exits.

## User Setup Required

None - no remote service, secret, or browser-side runtime is required.

## Next Phase Readiness

- Plan 25-09 can add its shared illustration to both preserved module visual registries without changing these teaching sections or labs.
- Plan 25-11 can bind its diagnostic video independently; this plan intentionally added no final image/video asset references.
- Plans 25-12/13 can validate the two routes, downloads, explicit failure probe, real/synthetic provenance, accessibility, and responsive behavior.
- No implementation blocker remains. `.planning/config.json` and `docs/gpt_advice.md` remain untouched and unstaged.

## Self-Check: PASSED

- All nine planned source/test files and this summary exist.
- Task commits `2966e47`, `d80a578`, `eb66f0e`, and `196e630` exist in Git history.
- All six Plan 25-05 contracts and all 27 current Batch 4/Plans 25-03/04/05 tests pass.
- `npm run build`, `npm run build:pages`, and `git diff --check` pass with only the existing Vite large-chunk warning.
- Full-file execution leaves only the intentionally preserved Plan 25-09 RED owner failing; Plan 25-09/11 final media assets remain unbound.

---
*Phase: 25-numerical-methods-batch-4-logistic-regression-optimization-a*
*Completed: 2026-07-22*
