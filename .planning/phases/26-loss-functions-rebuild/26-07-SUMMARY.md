---
phase: 26-loss-functions-rebuild
plan: "07"
subsystem: curriculum-ui
tags: [vue, typescript, loss-functions, playwright, accessibility, github-pages]

requires:
  - phase: 26-loss-functions-rebuild
    plan: "06"
    provides: Typed 16-asset registry, strict locked-output validators, and the seven-chapter bilingual lesson contract
provides:
  - Seven explicit chapter labs backed by validated local summaries and the pure loss-math authority
  - Real-row MSE, MAE, and stable BCE teaching loops with locked aggregate tables, plots, code, and output-gradient verification
  - One base-safe bilingual download area and a 32-case desktop/mobile browser release matrix
affects: [phase-27-linear-regression, phase-29-logistic-regression, loss-functions, browser-release]

tech-stack:
  added: []
  patterns:
    - Abortable base-safe loading of small validated summaries with visible teaching fallbacks
    - Real-row interaction state recomputed through a pure TypeScript numerical authority
    - Committed Playwright-CLI route and interaction matrix for bilingual root/deep-link release checks

key-files:
  created:
    - src/components/LossGradientVerificationLab.vue
    - src/components/LossFunctionsDownloads.vue
    - scripts/qa/lossFunctionsBrowserMatrix.js
    - tests/loss-functions-labs.test.mjs
  modified:
    - src/components/LossFunctionsLessonLab.vue
    - src/components/LossFunctionsResults.vue
    - src/components/WhyLossLab.vue
    - src/components/RegressionLossLab.vue
    - src/components/ClassificationLossLab.vue
    - src/views/AlgorithmView.vue
    - src/styles/modules/loss-functions-visuals.css

key-decisions:
  - "Place one chapter-keyed locked-results surface inside each StoryScroller chapter and render the consolidated downloads once after the unchanged checkpoint."
  - "Keep fixed extreme BCE probes read-only while all learner-controlled loss, row, and h choices remain bounded and finite."
  - "Use validated local summary rows when available and label built-in teaching fallbacks explicitly without blanking formulas or interactions."

patterns-established:
  - "One numerical authority: Vue labs compose selected rows and controls, while src/simulations/lossFunctionsMath.ts owns all loss and gradient calculations."
  - "Release matrix: root and seven deep links are checked in both locales at desktop and 390x844 with reduced motion, interaction, layout, console, and request assertions."

requirements-completed: [LOSS-01, LOSS-02, LOSS-03]

coverage:
  - id: D1
    description: Real delivery rows flow through target, prediction, residual, per-example MSE or MAE, output gradient, and the locked full-data mean
    requirement: LOSS-01
    verification:
      - kind: integration
        ref: "tests/loss-functions-labs.test.mjs#primary real-row labs and chapter-keyed results"
        status: pass
      - kind: automated_ui
        ref: "scripts/qa/lossFunctionsBrowserMatrix.js#32-case bilingual desktop/mobile matrix"
        status: pass
    human_judgment: false
  - id: D2
    description: MSE versus MAE outlier influence and real confident-error BCE remain visible through bounded accessible controls
    requirement: LOSS-02
    verification:
      - kind: unit
        ref: "tests/loss-functions-math.test.ts#MSE MAE and stable BCE loss-gradient contracts"
        status: pass
      - kind: automated_ui
        ref: "scripts/qa/lossFunctionsBrowserMatrix.js#outlier confident-error reset and 390px interaction checks"
        status: pass
    human_judgment: false
  - id: D3
    description: Analytic and central-difference MSE, smooth MAE, MAE kink, and BCE diagnostics ship with local outputs, code copy, and downloads
    requirement: LOSS-03
    verification:
      - kind: integration
        ref: "python3 scripts/loss-functions/build-phase-26-assets.py --check --offline"
        status: pass
      - kind: automated_ui
        ref: "scripts/qa/lossFunctionsBrowserMatrix.js#gradient h sweep kink fixed probes code copy and 16 downloads"
        status: pass
      - kind: other
        ref: "npm run build && npm run build:pages"
        status: pass
    human_judgment: false

duration: 34m
completed: 2026-07-29
status: complete
---

# Phase 26 Plan 07: Interactive Loss Learning Surface Summary

**Validated local delivery and manufacturing rows now drive seven bilingual loss labs, locked result tables, output-gradient checks, and a base-safe reproducibility package across desktop and mobile.**

## Performance

- **Duration:** 34m
- **Started:** 2026-07-28T16:02:42Z
- **Completed:** 2026-07-28T16:36:49Z
- **Tasks:** 3
- **Files modified:** 11

## Accomplishments

- Replaced synthetic-only primary interactions with real LaDe-D and SECOM representative rows while keeping every calculation on the tested pure TypeScript authority.
- Added explicit seven-way lab routing, abortable validated summary loading, locked aggregate/row/probe/h-sweep presentation, code copy, and all 16 localized downloads.
- Preserved the StoryScroller, checkpoint, routes, Progress stores, sanitizer, and lazy loading while proving bilingual desktop/390px behavior over the root route and all seven deep links.

## Task Commits

Each task was committed atomically:

1. **Task 1: Wire typed locked results, explicit lab routing, gradient checks, and downloads**
   - `e8fd872` — test RED: add failing loss lab integration contracts
   - `d705cf4` — feature GREEN: wire locked loss results and gradient checks
2. **Task 2: Rebuild the primary real-row loss interactions and responsive visuals**
   - `6118e63` — test RED: add failing real-row loss lab contracts
   - `15fd0dc` — feature GREEN: rebuild primary loss learning labs
3. **Task 3: Complete page composition and run the full release/browser matrix**
   - `3f9b94e` — feature: compose loss release learning surface

## Files Created/Modified

- `src/components/LossGradientVerificationLab.vue` — Bounded loss/row/h selection with analytic, central-difference, tolerance, sweep, and honest MAE-kink status.
- `src/components/LossFunctionsDownloads.vue` — One localized, base-safe download surface for the exact 16-member course package.
- `src/components/LossFunctionsLessonLab.vue` — Explicit seven-chapter registry with abortable validated local-summary loading.
- `src/components/LossFunctionsResults.vue` — Chapter-keyed aggregate, real-row, confident-error, fixed-probe, h-sweep, plot, and code output.
- `src/components/WhyLossLab.vue` — Selected delivery row traced from target and prediction to row loss, output gradient, and mean objective.
- `src/components/RegressionLossLab.vue` — Typical, zero-residual, and long-duration row comparison for MSE, MAE, and their gradients.
- `src/components/ClassificationLossLab.vue` — Real SECOM OOF label/logit/probability/BCE/gradient loop plus the existing concise Softmax bridge.
- `src/views/AlgorithmView.vue` — Results placed beside each loss chapter and downloads rendered once after the unchanged checkpoint.
- `src/styles/modules/loss-functions-visuals.css` — Focus, scroll, text-plus-shape status, 390px stacking, and reduced-motion behavior.
- `scripts/qa/lossFunctionsBrowserMatrix.js` — Committed 32-case bilingual root/deep-link, interaction, layout, console, and local-request probe.
- `tests/loss-functions-labs.test.mjs` — Registry, loading, pure-math wiring, accessibility, placement, and browser-matrix source contracts.

## Decisions Made

- Placed locked results inside each chapter rather than retaining one detached global panel, so formulas, interaction, real output, and code remain one learning loop.
- Kept the fixed ±1000 stability probes as locked read-only output; free learner inputs remain small bounded enums/ranges with finite guards and reset.
- Preserved conceptual likelihood, negative-log, MLE, and Softmax interactions while limiting the new real-row state to the labs that own fixed loss, outlier, and confident-error calculations.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Made local-request inspection compatible with the Playwright CLI sandbox**

- **Found during:** Task 3 browser matrix
- **Issue:** `URL` exists inside the page but was unavailable in the CLI's outer `run-code` sandbox, stopping the matrix before it could report cases.
- **Fix:** Kept `new URL` for in-page link validation and changed the outer request-origin check to an exact local-origin string prefix.
- **Files modified:** `scripts/qa/lossFunctionsBrowserMatrix.js`
- **Verification:** The complete 32-case matrix passed with zero external course-asset requests.
- **Committed in:** `3f9b94e`

**2. [Rule 1 - Bug] Selected the available MAE-kink fixture in both locked and fallback states**

- **Found during:** Task 3 browser matrix
- **Issue:** The gradient chapter intentionally loads only its BCE summary, so the MAE zero-residual choice uses the lab's labeled teaching fallback rather than a delivery-summary role.
- **Fix:** The probe accepts either the locked `typical-zero-residual` option or the explicit target-equals-prediction teaching kink, then asserts the rendered nondifferentiable state.
- **Files modified:** `scripts/qa/lossFunctionsBrowserMatrix.js`
- **Verification:** MAE kink, h change, reset, and all 32 route/viewport/locale cases passed.
- **Committed in:** `3f9b94e`

---

**Total deviations:** 2 auto-fixed (2 Rule 1)
**Impact on plan:** Both fixes corrected release-probe behavior without changing product scope or weakening the learner-facing assertions.

## Issues Encountered

- The first optional static Pages inspection incorrectly expected minified JavaScript to contain fully concatenated asset URLs. `withPublicBase` composes those paths at runtime, so the valid static check instead verifies the Pages HTML/helper base and existence of all 16 registered files in `dist`.
- `npm run security:audit` exits nonzero because the existing lockfile resolves transitive `postcss@8.5.15`, which is covered by current high advisory GHSA-r28c-9q8g-f849. This plan changed no dependency and did not run an unreviewed package-manager repair; the item is recorded in `deferred-items.md`.
- The production builds retain the repository's existing large-chunk warning and complete successfully.

## Known Stubs

None. Empty arrays in the browser matrix are transient assertion collectors, and every learner-facing summary failure keeps a clearly labeled built-in calculation rather than an unfinished placeholder.

## Verification

- `python3 scripts/loss-functions/build-phase-26-assets.py --check --offline` — passed; 16 exact members, four independently rerun Notebooks, and 1320 repository entries remained byte/mtime clean.
- `node --test tests/loss-functions-*.test.* tests/algorithm-progress.test.ts` — 88/88 passed.
- `npm test` — 837/837 passed.
- `npm run build` — passed; existing chunk-size warning only.
- Playwright CLI root preview matrix — 32/32 passed across `zh-CN`/`en`, desktop/390px, root plus all seven deep links; no overflow, overlap, dead fragment, console error, warning, or external course-asset request.
- `npm run build:pages` and focused base/Pages/asset tests — passed; all 16 registered local files exist in `dist` and the built helper carries `/ML_tutorial_Site/`.
- `npm run security:audit` — did not pass because of the pre-existing transitive PostCSS advisory documented above.
- `git diff --check` — passed.
- Stub and threat-surface scans found no learner-facing unfinished wiring and no security surface beyond the plan's validated local JSON, bounded controls, safe code/Markdown rendering, and base-safe public assets.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

- Phase 27 and Phase 29 can reuse the locked row and output-gradient patterns for parameter-training lessons without changing Phase 26's route or Progress identities.
- The loss-functions learning objective is complete; a dedicated dependency maintenance change is still required for a clean security-audit exit.

## Self-Check: PASSED

- All 11 product/test files and this summary exist.
- All five Task 1–3 commits exist in Git history.
- Summary claims match the latest offline, focused, full-suite, build, browser, Pages, audit, stub, threat, and diff results.

---
*Phase: 26-loss-functions-rebuild*
*Completed: 2026-07-29*
