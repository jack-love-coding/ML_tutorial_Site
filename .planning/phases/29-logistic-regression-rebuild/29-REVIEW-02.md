---
phase: 29-logistic-regression-rebuild
reviewed: 2026-08-19T18:26:44Z
depth: standard
files_reviewed: 32
files_reviewed_list:
  - .github/workflows/deploy-pages.yml
  - package.json
  - public/logistic-regression/phase-29/interactions/linear-limits.json
  - public/logistic-regression/phase-29/interactions/linear-score.json
  - public/logistic-regression/phase-29/interactions/log-loss.json
  - public/logistic-regression/phase-29/interactions/regularization.json
  - public/logistic-regression/phase-29/manifest.json
  - public/logistic-regression/phase-29/outputs/calibration.json
  - public/logistic-regression/phase-29/outputs/parity.json
  - public/manim/logistic-regression/log-loss-confident-mistake.mp4
  - public/manim/logistic-regression/metadata.json
  - scripts/logistic-regression/build-phase-29-assets.py
  - scripts/logistic-regression/phase29_analysis.py
  - scripts/manim/logistic_regression/log-loss-confident-mistake-tree.json
  - scripts/manim/render_logistic_regression.py
  - scripts/manim/scenes/logistic_regression.py
  - scripts/qa/logisticRegressionBrowserMatrix.js
  - scripts/qa/run-logistic-regression-browser-matrix.mjs
  - src/modules/logistic-regression/assets.ts
  - src/modules/logistic-regression/data/media.ts
  - src/modules/logistic-regression/engine.ts
  - src/modules/logistic-regression/labs/CalibrationLimitsScene.vue
  - src/modules/logistic-regression/labs/LikelihoodScene.vue
  - src/modules/logistic-regression/labs/LinearScoreScene.vue
  - src/modules/logistic-regression/labs/LogLossGradientScene.vue
  - src/modules/logistic-regression/labs/SigmoidProbabilityScene.vue
  - src/modules/logistic-regression/labs/TrainingParityScene.vue
  - src/modules/logistic-regression/labs/sceneModels.ts
  - tests/logistic-regression-assets.test.ts
  - tests/logistic-regression-labs.test.mjs
  - tests/logistic-regression-parity.test.ts
  - tests/logistic-regression-release.test.mjs
findings:
  critical: 0
  warning: 3
  info: 0
  total: 3
status: issues_found
---

# Phase 29: Remediation Re-review

**Reviewed:** 2026-08-19T18:26:44Z
**Depth:** standard
**Files Reviewed:** 32
**Status:** issues_found

## Summary

The original numerical and media blockers are fixed. I independently verified every selectable score-row trace: contributions plus intercept equal the published logit, and sigmoid(logit) equals the published probability. Scratch replay now uses paired state records; sklearn and L2 carry their own terminal objectives. All three calibration modes retain ten boundary-positioned bins with null values for empty bins. The XOR/circles marker CSS now matches the emitted class names. The Manim source, interaction anchor, video hash, and metadata all agree on `y=1`, `z=-4.166471588903541`, and the corresponding BCE.

Focused Phase 29 tests, asset drift checking, media checking, and a real `npm run test:phase29:browser` run passed. The browser run completed its 30 Pages-base cases, six interactions, and four injected fallbacks. No Phase 30 learner-page leakage, numeric regression, Pages-base regression, test weakening, or unrelated dependency change was found.

Three release-quality issues remain: the new mandatory browser gate is neither version-pinned nor bounded, and the newly required Chinese synthetic-data fallback is still English-only.

## Narrative Findings (AI reviewer)

## Warnings

### WR-01: Mandatory browser gate downloads an unpinned executable on every CI run

**File:** `scripts/qa/run-logistic-regression-browser-matrix.mjs:19-27`

**Issue:** When `PLAYWRIGHT_CLI` is unset, the release gate runs `npx --yes --package @playwright/cli playwright-cli`. No version is specified and the package is not pinned in `package.json`/the lockfile. Consequently a new upstream CLI release (or a registry availability/change) can alter or break the deployment gate without a reviewed repository change. This contradicts the reproducible, mandatory-release-gate intent.

**Fix:** Pin the CLI to an audited version, preferably as a dev dependency committed with the lockfile, and invoke the local binary. If an ephemeral package remains necessary, include an explicit exact version and validate its expected browser runtime in CI.

### WR-02: Browser-matrix subprocess can leave the deployment job hanging indefinitely

**File:** `scripts/qa/run-logistic-regression-browser-matrix.mjs:23-27`

**Issue:** `execute()` waits only for the child process `exit` event. It has neither an `error` listener nor a timeout. A failed spawn can therefore reject nowhere, and a stuck Playwright command can hold the required Pages deployment job until GitHub Actions' global job timeout. The Vite startup has a ten-second readiness bound, but the two Playwright invocations do not.

**Fix:** Race `exit`, `error`, and a finite timeout for each child; kill the child/process group on timeout and include captured stderr in the error. Apply the same cleanup discipline to the preview server so a failed gate is deterministic and bounded.

### WR-03: XOR/circles semantic fallback is not localized for Chinese learners

**File:** `src/modules/logistic-regression/labs/sceneModels.ts:225,233`
**File:** `src/modules/logistic-regression/labs/CalibrationLimitsScene.vue:20`

**Issue:** The repair correctly changes emitted marker classes to `class-one`/`class-zero`, but it builds accessible point labels and all synthetic-data table rows only in English (`synthetic point …`, `solid marker / class 1`, `striped marker / class 0`). The SVG legend is also hard-coded English. The Chinese page therefore exposes an English-only marker explanation to screen-reader and table-fallback users, despite this remediation specifically requiring a localized semantic fallback.

**Fix:** Pass the active locale into the calibration scene-model (or localize rows in the component) and produce both Chinese and English point labels, marker descriptions, and SVG legend text. Add a rendered Chinese XOR/circles assertion that checks the table and accessible labels contain localized solid/striped marker meanings.

---

_Reviewed: 2026-08-19T18:26:44Z_
_Reviewer: the agent (independent remediation re-review)_
_Depth: standard_
