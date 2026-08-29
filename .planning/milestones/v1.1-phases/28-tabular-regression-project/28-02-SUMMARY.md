---
phase: 28-tabular-regression-project
plan: "02"
status: complete
completed: 2026-08-04
requirements: [TPRJ-01, TPRJ-02, TPRJ-03, TPRJ-04, TPRJ-05]
---

# Phase 28 Plan 02 Summary

Replaced the legacy housing workflow page with a six-chapter bilingual, single-column project course backed exclusively by the published California Housing package.

## Delivered

- Preserved the `housing-price-project` module, all six chapter IDs, existing checkpoints, progress storage, and deep-link behavior.
- Added a housing-specific typed lesson-block contract covering explanations, formulas, copyable Python, runtime output, figures, tables, and observation labs.
- Rewrote all six chapters around one complete project loop: data contract, training-only EDA, leakage-safe preprocessing, inspectable linear baseline, validation-only Ridge selection, and one final test review.
- Added six route-lazy real-result scenes for schema inspection, training EDA, scaler boundaries, row contributions, Ridge selection, and named residual failures.
- Kept final test metrics unavailable in the first five chapters and centralized references, limitations, dataset attribution, and eight downloads in the final chapter.
- Added dedicated housing routes and six generated GitHub Pages deep-link fallbacks.
- Added a responsive 1040px reading flow, a sidebar only from 1440px, collapsible contents below that breakpoint, mobile single-column controls, and text/table fallbacks.

## Verification

- Housing project and asset tests: 17 passed.
- Complete repository tests: 982 passed, 28 skipped, 0 failed.
- CI low-concurrency suite: 982 passed, 28 skipped, 0 failed.
- Standard build and GitHub Pages build: passed.
- Six direct Pages fallback files: verified.
- Asset drift check: passed.
- Security audit: zero vulnerabilities.
- Browser: all six Chinese routes at 1200px; representative Chinese/English checks at 1440px, 768px, and 390px; no horizontal overflow, KaTeX errors, console errors, or broken loaded figures.
- Pages-base browser check loaded the direct evaluation URL, interaction JSON, KaTeX fonts, and lazy figure successfully under `/ML_tutorial_Site/`.

## Notable Fixes from Browser Review

- Changed mobile metric cards from three squeezed columns to one column at 390px.
- Replaced dollar-prefixed prose amounts with `USD` wording so Markdown does not mistake currency for inline TeX.

## Preserved Boundaries

- No browser-side sklearn fitting, new backend, exercise bank, global Lesson renderer migration, or UI framework was added.
- Existing user changes in `.planning/config.json` and `docs/gpt_advice.md` remain outside this branch.
