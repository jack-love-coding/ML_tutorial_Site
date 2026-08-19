---
phase: 29-logistic-regression-rebuild
reviewed: 2026-08-19T18:38:04Z
depth: standard
files_reviewed: 38
findings:
  critical: 0
  warning: 0
  info: 0
  total: 0
status: clean
---

# Phase 29: Remediation Re-review

**Reviewed:** 2026-08-19T18:38:04Z
**Depth:** standard
**Files reviewed:** 38
**Status:** clean

## Summary

The prior numerical and media fixes remain valid. The three release-quality warnings from this re-review are now resolved at commit `b68e4b4` and were verified on the same Phase 29 worktree HEAD.

- **WR-01 — reproducible browser CLI:** `@playwright/cli` is now the exact dev dependency `0.1.18`, recorded in `package-lock.json`. The required matrix invokes the local binary through `npm exec --no -- playwright-cli`; it no longer downloads a floating `npx --package` executable.
- **WR-02 — bounded browser processes:** preview readiness and each Playwright command have finite time limits. The runner captures stderr, handles spawn and child errors, terminates detached POSIX process groups (with a child fallback), escalates to `SIGKILL`, and performs bounded preview cleanup in `finally`. Deterministic tests cover spawn error, child error, timeout, hard cleanup, and preview readiness failure without long waits.
- **WR-03 — bilingual synthetic fallback:** the calibration scene passes `AppLocale` to its typed model. XOR and circles now provide localized accessible point labels, table marker descriptions, provenance, geometry, legend text, and table headings for both Chinese and English. Structural/model assertions cover both locales and both synthetic datasets.

## Same-HEAD Verification

- Focused runner, lab, and release tests: **18 passed, 0 failed**.
- `npm run test:ci`: **1,090 passed, 28 skipped, 0 failed**.
- `npm run build` and `npm run build:pages`: passed.
- `npm run test:phase29:browser`: passed with **30 exact Pages-base cases**, **6 interactions**, **4 injected fallbacks**, and **0 failures**.
- `python3 scripts/logistic-regression/build-phase-29-assets.py --check`: passed.
- `python3 scripts/manim/render_logistic_regression.py --check`: passed.
- `npm run security:audit`: completed and still reports the documented pre-existing `nanoid <3.3.18` advisory; it was neither suppressed nor auto-fixed.

No Phase 30 learner-page boundary, browser-matrix coverage, Pages-base, numeric asset, or media contract was weakened during the remediation.

---

_Reviewed: 2026-08-19T18:38:04Z_
_Reviewer: the agent (independent remediation re-review)_
_Depth: standard_
