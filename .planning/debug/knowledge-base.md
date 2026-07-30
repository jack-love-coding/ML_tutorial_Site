# GSD Debug Knowledge Base

Resolved debug sessions. Used by `gsd-debugger` to surface known-pattern hypotheses at the start of new investigations.

---

## phase27-mobile-toggle-click — Linear regression toggle overflow and semantic matrix probes
- **Date:** 2026-07-30
- **Error patterns:** toggle-strip button, outside viewport, not stable, locator.click timeout, mobile-390, semanticChecks, nextStepPresent, linearBoundaryVisible
- **Root cause:** A viewport-based desktop cockpit grid overflowed its narrower course container and pushed the intended toggle beyond the clipped viewport; rendered-text QA probes also omitted or transformed valid DOM semantics.
- **Fix:** Contained the nested course cockpit in one column, read semantic hooks and the Phase 28 bridge from DOM text content, accepted approved space-or-hyphen boundary terms, and added regression assertions.
- **Files changed:** src/styles/modules/linear-regression-responsive.css, scripts/qa/linearRegressionBrowserMatrix.js, tests/linear-regression-layout.test.mjs, tests/linear-regression-release.test.mjs
---
