---
phase: 29-logistic-regression-rebuild
reviewed: 2026-08-20T03:05:00Z
depth: standard
files_reviewed: 107
files_reviewed_list:
  - .planning/REQUIREMENTS.md
  - .planning/ROADMAP.md
  - .planning/STATE.md
  - .planning/WINDOWS.md
  - .planning/phases/29-logistic-regression-rebuild/29-00-PLAN.md
  - .planning/phases/29-logistic-regression-rebuild/29-00-SUMMARY.md
  - .planning/phases/29-logistic-regression-rebuild/29-01-PLAN.md
  - .planning/phases/29-logistic-regression-rebuild/29-01-SUMMARY.md
  - .planning/phases/29-logistic-regression-rebuild/29-02-PLAN.md
  - .planning/phases/29-logistic-regression-rebuild/29-02-SUMMARY.md
  - .planning/phases/29-logistic-regression-rebuild/29-03-PLAN.md
  - .planning/phases/29-logistic-regression-rebuild/29-03-SUMMARY.md
  - .planning/phases/29-logistic-regression-rebuild/29-04-PLAN.md
  - .planning/phases/29-logistic-regression-rebuild/29-04-SUMMARY.md
  - .planning/phases/29-logistic-regression-rebuild/29-05-PLAN.md
  - .planning/phases/29-logistic-regression-rebuild/29-05-SUMMARY.md
  - .planning/phases/29-logistic-regression-rebuild/29-06-PLAN.md
  - .planning/phases/29-logistic-regression-rebuild/29-06-SUMMARY.md
  - .planning/phases/29-logistic-regression-rebuild/29-07-PLAN.md
  - .planning/phases/29-logistic-regression-rebuild/29-07-SUMMARY.md
  - .planning/phases/29-logistic-regression-rebuild/29-CONTEXT.md
  - .planning/phases/29-logistic-regression-rebuild/29-DISCUSSION-LOG.md
  - .planning/phases/29-logistic-regression-rebuild/29-PATTERNS.md
  - .planning/phases/29-logistic-regression-rebuild/29-RESEARCH.md
  - .planning/phases/29-logistic-regression-rebuild/29-VALIDATION.md
  - .planning/phases/29-logistic-regression-rebuild/deferred-items.md
  - docs/curriculum-v3/logistic-regression/manim/likelihood-to-bce-gradient-transcript.en.md
  - docs/curriculum-v3/logistic-regression/manim/likelihood-to-bce-gradient-transcript.zh-CN.md
  - docs/curriculum-v3/logistic-regression/manim/linear-score-to-sigmoid-transcript.en.md
  - docs/curriculum-v3/logistic-regression/manim/linear-score-to-sigmoid-transcript.zh-CN.md
  - docs/curriculum-v3/logistic-regression/manim/log-loss-confident-mistake-transcript.en.md
  - docs/curriculum-v3/logistic-regression/manim/log-loss-confident-mistake-transcript.zh-CN.md
  - docs/curriculum-v3/logistic-regression/manim/regularization-confidence-field-transcript.en.md
  - docs/curriculum-v3/logistic-regression/manim/regularization-confidence-field-transcript.zh-CN.md
  - docs/curriculum-v3/logistic-regression/sources.md
  - public/logistic-regression/phase-29/banknote-logistic-regression.en.ipynb
  - public/logistic-regression/phase-29/banknote-logistic-regression.zh-CN.ipynb
  - public/logistic-regression/phase-29/figures/banknote-projection.png
  - public/logistic-regression/phase-29/figures/calibration-reliability.png
  - public/logistic-regression/phase-29/figures/linear-boundary-limits.png
  - public/logistic-regression/phase-29/figures/parity-probabilities.png
  - public/logistic-regression/phase-29/figures/training-trace.png
  - public/logistic-regression/phase-29/frozen-predictions.csv
  - public/logistic-regression/phase-29/frozen-predictions.json
  - public/logistic-regression/phase-29/interactions/linear-limits.json
  - public/logistic-regression/phase-29/interactions/linear-score.json
  - public/logistic-regression/phase-29/interactions/log-loss.json
  - public/logistic-regression/phase-29/interactions/regularization.json
  - public/logistic-regression/phase-29/interactions/sigmoid-probability.json
  - public/logistic-regression/phase-29/interactions/threshold-decisions.json
  - public/logistic-regression/phase-29/manifest.json
  - public/logistic-regression/phase-29/outputs/calibration.json
  - public/logistic-regression/phase-29/outputs/gradient-check.json
  - public/logistic-regression/phase-29/outputs/parity.json
  - public/logistic-regression/phase-29/outputs/training-trace.csv
  - public/manim/logistic-regression/likelihood-to-bce-gradient.mp4
  - public/manim/logistic-regression/likelihood-to-bce-gradient.svg
  - public/manim/logistic-regression/linear-score-to-sigmoid.mp4
  - public/manim/logistic-regression/linear-score-to-sigmoid.svg
  - public/manim/logistic-regression/log-loss-confident-mistake.mp4
  - public/manim/logistic-regression/log-loss-confident-mistake.svg
  - public/manim/logistic-regression/metadata.json
  - public/manim/logistic-regression/regularization-confidence-field.mp4
  - public/manim/logistic-regression/regularization-confidence-field.svg
  - scripts/logistic-regression/build-phase-29-assets.py
  - scripts/logistic-regression/phase29_analysis.py
  - scripts/manim/logistic_regression/likelihood-to-bce-gradient-prompt.md
  - scripts/manim/logistic_regression/likelihood-to-bce-gradient-tree.json
  - scripts/manim/logistic_regression/linear-score-to-sigmoid-prompt.md
  - scripts/manim/logistic_regression/linear-score-to-sigmoid-tree.json
  - scripts/manim/logistic_regression/log-loss-confident-mistake-prompt.md
  - scripts/manim/logistic_regression/log-loss-confident-mistake-tree.json
  - scripts/manim/logistic_regression/regularization-confidence-field-prompt.md
  - scripts/manim/logistic_regression/regularization-confidence-field-tree.json
  - scripts/manim/render_logistic_regression.py
  - scripts/manim/scenes/logistic_regression.py
  - scripts/qa/logisticRegressionBrowserMatrix.js
  - src/components/LogisticRegressionPagedLesson.vue
  - src/data/logisticRegressionModule.ts
  - src/modules/logistic-regression/assets.ts
  - src/modules/logistic-regression/data/course.ts
  - src/modules/logistic-regression/data/media.ts
  - src/modules/logistic-regression/engine.ts
  - src/modules/logistic-regression/labs/CalibrationLimitsScene.vue
  - src/modules/logistic-regression/labs/LikelihoodScene.vue
  - src/modules/logistic-regression/labs/LinearScoreScene.vue
  - src/modules/logistic-regression/labs/LogLossGradientScene.vue
  - src/modules/logistic-regression/labs/LogisticLessonLab.vue
  - src/modules/logistic-regression/labs/SigmoidProbabilityScene.vue
  - src/modules/logistic-regression/labs/TrainingParityScene.vue
  - src/modules/logistic-regression/labs/scene.css
  - src/modules/logistic-regression/labs/sceneModels.ts
  - src/modules/logistic-regression/types.ts
  - src/styles/modules/linear-regression-responsive.css
  - src/styles/modules/linear-regression.css
  - src/styles/modules/logistic-regression.css
  - src/views/AlgorithmView.vue
  - tests/logistic-regression-assets.test.ts
  - tests/logistic-regression-calibration.test.ts
  - tests/logistic-regression-cockpit.test.mjs
  - tests/logistic-regression-content.test.mjs
  - tests/logistic-regression-labs.test.mjs
  - tests/logistic-regression-math.test.ts
  - tests/logistic-regression-media.test.mjs
  - tests/logistic-regression-parity.test.ts
  - tests/logistic-regression-release.test.mjs
  - tests/logistic-regression-rendering.test.ts
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
status: clean
resolved_from: 2026-08-19T17:46:51Z
---

# Phase 29: Code Review Report

**Reviewed:** 2026-08-20T03:05:00Z
**Depth:** standard
**Files Reviewed:** 107
**Status:** clean

## Summary

The nine findings in the original 2026-08-19 review have been remediated and independently revalidated on the final Phase 29 HEAD. The historical descriptions remain below for traceability; none is currently open. The pre-existing nanoid advisory is not Phase 29-owned and is not counted here.

## Resolution Evidence

- **CR-01:** Every selectable score row now carries a published row-local trace. `92db368` and `tests/logistic-regression-assets.test.ts` check contribution plus intercept against its logit and sigmoid probability.
- **CR-02:** Scratch replay reads one parameter/objective state at a time; sklearn and L2 publish their own terminal objectives. `92db368` covers initial, intermediate, terminal, sklearn, and L2 values.
- **CR-03:** All ten calibration bins are published, empty bins retain null rates, and the SVG uses bin boundaries. `92db368` and `e224139` add the strict nullable-rate parser rule and runtime test.
- **CR-04:** XOR/circles use matching `class-one`/`class-zero` identifiers with localized marker labels and a semantic table fallback (`92db368`).
- **CR-05:** The confident-mistake Manim scene reads the y=1, z=-4.1665 high-loss anchor, evaluates `softplus(z)-yz`, and was actually rerendered (`56b4ae4`); source/hash/ffprobe checks pass.
- **WR-01 / WR-02:** Non-functional detail toggles were removed while tables remain visible; changing replay mode stops its interval before resetting state (`8c371f3`).
- **WR-03:** `npm run test:phase29:browser` builds the Pages artifact then runs the strict JSON browser matrix. Pages deployment now invokes it (`9a9e1d2`).
- **WR-04:** Python fails for every captured sklearn warning, and TypeScript, manifest, and tests declare `fail-on-every-captured-warning` (`92db368`, `8c371f3`).

Final same-HEAD gates passed: focused Phase 29 tests; `python3 scripts/logistic-regression/build-phase-29-assets.py --check`; `python3 scripts/manim/render_logistic_regression.py --check`; `npm run test:ci` (1,084 passed, 28 skipped, 0 failed); `npm run build`; `npm run build:pages`; and `npm run test:phase29:browser` (30 cases, six interactions, four injected fallbacks, zero failures). `npm run security:audit` exits successfully while reporting only the documented pre-existing `nanoid <3.3.18` advisory.

## Narrative Findings (AI reviewer)

### RESOLVED CR-01: Alternate linear-score rows retain canonical contribution terms

**Classification:** BLOCKER
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/sceneModels.ts:47-57,81-106
**Issue:** buildLinearScoreSceneModel changes only the selected row standardized values, label, logit, probability, and BCE at line 88. oneRow still derives weights from canonical data.oneRow.contributions (lines 50-55), so every selectable row shows canonical contribution bars and intercept. Lines 97 and 100 then show the selected row logit and probability. Canonical terms plus intercept sum to -54.3378, while the near-boundary option displays z = 0.171849 and high-loss displays z = -4.16647 alongside those same terms.
**Fix:** Publish a full contribution trace for each teaching row, or publish fixed parameters and derive every selected row contributions, logit, and probability from them. Test every option for sum(contributions) + intercept approximately equal to logit and sigmoid(logit) approximately equal to probability.

### RESOLVED CR-02: Training replay combines terminal parameters with another iteration loss

**Classification:** BLOCKER
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/sceneModels.ts:185-205
**Issue:** The scene always selects terminal selected.parameters at line 193, but selects selected.objectiveValue or the current scratch trace objective at line 194. sklearn has no objectiveValue, so the sklearn view shows terminal sklearn parameters beside the scratch initial 0.693147181 loss. Scratch state zero similarly shows terminal scratch parameters beside the initial loss.
**Fix:** Represent scratch replay as paired parameters/objective records and use the active record for both. Publish or calculate a named sklearn terminal objective instead of borrowing a scratch value. Test initial, intermediate, terminal, sklearn, and L2 states.

### RESOLVED CR-03: Calibration generator removes bins while the SVG plots by array index

**Classification:** BLOCKER
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/scripts/logistic-regression/phase29_analysis.py:330-345
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/CalibrationLimitsScene.vue:18
**Issue:** The generator skips empty deciles at lines 338-339 despite the exported engine contract declaring emptyBinBehavior as retain-with-null-observed-rate (engine.ts:48-60). The view positions surviving bins as 42 + index times 35, not from bin.lower/bin.upper. Published sharpened lower bounds are 0.0, 0.3, 0.5, 0.9, therefore 0.9 is drawn as the fourth adjacent bin after 0.5 rather than at 0.9.
**Fix:** Emit all ten declared bins, using count zero and null rates for empty bins. Scale x coordinates from bin boundaries, render empty bins distinctly, then update interaction assets, hashes, and tests.

### RESOLVED CR-04: Capacity class styles never match generated class names

**Classification:** BLOCKER
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/sceneModels.ts:217-218
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/CalibrationLimitsScene.vue:18,22
**Issue:** The model emits class-1 and class-0. The scoped CSS defines only class-one and class-zero. Neither selector matches, so the stated solid-circle/striped-circle class distinction is absent and every point receives browser defaults. Per-point accessibility labels also do not recover the class.
**Fix:** Make emitted classes and selectors match, add localized point labels and a text/table fallback preserving the marker, and test both variants for XOR and circles.

### RESOLVED CR-05: Confident-mistake animation plots the loss for the opposite target

**Classification:** BLOCKER
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/scripts/manim/scenes/logistic_regression.py:160-176
**Issue:** The course high-loss example is y = 1, z = -4.1665, p = 0.01527, L = 4.1819. This scene never loads that row; it hard-codes z = 4.5 (lines 171-172) and plots softplus(z) at line 167, which is BCE for y = 0. The y = 1 loss is softplus(-z). Asset hashes and ffprobe only verify the wrong animation is consistently published.
**Fix:** Put the high-loss teaching row in a validated Manim anchor, use softplus(z) - y*z from that target, and place the marker at the published logit. Add an asset test checking animation anchor z, y, and loss against interaction data.

### RESOLVED WR-01: Numeric-detail disclosure buttons change only ARIA state

**Classification:** WARNING
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/LinearScoreScene.vue:38-39
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/SigmoidProbabilityScene.vue:22-23
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/LikelihoodScene.vue:21
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/LogLossGradientScene.vue:18
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/TrainingParityScene.vue:20
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/CalibrationLimitsScene.vue:18
**Issue:** detailsOpen changes aria-expanded, but each table is unconditional. Assistive technology is told details are collapsed while the content remains present, and the visual control does nothing.
**Fix:** Attach aria-controls and conditionally show the table, or remove the disclosure control and aria-expanded state. Test both expanded and collapsed semantics.

### RESOLVED WR-02: Switching away from scratch mode leaves an unpausable interval alive

**Classification:** WARNING
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/labs/TrainingParityScene.vue:12-16,20
**Issue:** If playback is running, the radio change only resets traceIndex. The interval stays live, calls a no-op step outside scratch, never reaches its cleanup condition, and the pause button becomes disabled. It is cleaned only by reset or unmount.
**Fix:** Stop the timer before changing mode and add a fake-timer test for mode switching during playback.

### RESOLVED WR-03: The claimed browser matrix is not executed by CI

**Classification:** WARNING
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/scripts/qa/logisticRegressionBrowserMatrix.js:1-156
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/tests/logistic-regression-release.test.mjs:13-48
**Issue:** test:ci runs Node test files but does not serve an artifact or execute the browser matrix. The release test checks source strings only. Viewport, keyboard, fallback, and Pages-base regressions can therefore pass CI.
**Fix:** Add a required CI job/command that builds and serves the Pages artifact, executes the matrix, and fails from machine-readable results. Retain source-contract checks only as supplemental coverage.

### RESOLVED WR-04: Published warning policy is broader than Python enforcement

**Classification:** WARNING
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/src/modules/logistic-regression/engine.ts:39-40
**File:** /Users/jackky/Desktop/ML_tutorial_Site/.worktrees/phase29-logistic/scripts/logistic-regression/phase29_analysis.py:260-282
**Issue:** The TypeScript contract promises fail-on-warning, but Python raises only on ConvergenceWarning and persists other warnings. A future sklearn warning could therefore pass asset generation despite the stated contract.
**Fix:** Either fail on every captured warning or publish the exact fail-on-ConvergenceWarning policy in engine, manifest, and tests as one source of truth.

---

_Original review: 2026-08-19T17:46:51Z_
_Resolved and revalidated: 2026-08-20T03:05:00Z_
_Reviewer/fixer: gsd-code-reviewer / gsd-code-fixer_
_Depth: standard_
