---
phase: 28-tabular-regression-project
plan: "01"
status: complete
completed: 2026-08-04
requirements: [TPRJ-01, TPRJ-02, TPRJ-03, TPRJ-04, TPRJ-05]
---

# Phase 28 Plan 01 Summary

Published the deterministic California Housing data and experiment package that will be the sole numerical authority for the six-chapter project course.

## Delivered

- Frozen all 20,640 California Housing rows as a local CSV with stable row IDs, eight documented features, the target, exact source provenance, and SHA-256 manifests.
- Created a deterministic seed-42 split with 12,384 training rows, 4,128 validation rows, and 4,128 test rows; preprocessing is fitted only on allowed training data.
- Executed matching Chinese and English Notebooks that compare LinearRegression with the declared Ridge path, select only on validation RMSE, refit after freezing the choice, and evaluate the test set once.
- Published seven real Matplotlib figures, six chapter-scoped interaction payloads, validation metrics, coefficient paths, final residuals, named failure cases, pinned environment metadata, source cell IDs, and file hashes.
- Added a repeatable asset builder with atomic publication and a check-only drift mode, plus numerical and provenance regression tests.

## Published Result

- Selected model: `LinearRegression`; Ridge did not improve validation RMSE by the required 1%.
- Validation RMSE / MAE / R²: 0.731391 / 0.540029 / 0.600227.
- Final test RMSE / MAE / R²: 0.724508 / 0.529685 / 0.610048.
- The test result remains absent from the first five interaction payloads and is unlocked only by the final review chapter.

## Verification

- Asset drift check: passed.
- Focused asset tests: 6 passed.
- Complete repository tests: 971 passed, 28 skipped, 0 failed.
- Standard build: passed.
- GitHub Pages build: passed.
- Security audit: passed with zero vulnerabilities.

## Preserved Boundaries

- This plan does not change the current housing-project page, routes, checkpoints, progress stores, or global course schema.
- Runtime course assets are entirely local and require no network access.
- The scikit-learn loader license is documented separately from the dataset's source and attribution record.
- Existing user changes in `.planning/config.json` and `docs/gpt_advice.md` remain outside this branch.
