# Phase 28 Context: Tabular Regression Project

## Locked decisions

- Keep the existing `housing-price-project` module identity, six chapter IDs, checkpoints, progress data, and canonical routes.
- Use the complete scikit-learn California Housing dataset as a frozen local asset. Each row is a 1990 census block group; the target is median block-group house value in units of $100,000.
- Split all 20,640 rows deterministically with `numpy.random.default_rng(42).permutation`: 12,384 train, 4,128 validation, and 4,128 test.
- Perform EDA and fit preprocessing on training data only. The source data has no missing values, so the lesson must not invent an imputation story.
- Keep all eight published features. Use `StandardScaler + LinearRegression` as the honest baseline and compare only `StandardScaler + Ridge(solver="svd")` with alpha candidates `0.01, 0.1, 1, 10, 100`.
- Select by validation RMSE, with MAE and R² as supporting metrics. If the best Ridge RMSE improves by less than 1%, retain the simpler linear baseline.
- Refit the frozen choice on train+validation and evaluate the test partition once. Test data never participates in EDA, alpha selection, or model selection.
- Deliver detailed bilingual teaching, copyable code, executed Notebook outputs, local figures, and one real-result interaction scene per chapter. Do not add a scored exercise bank, backend, browser Python, tree models, or runtime remote fetching.
- Use learner-facing terms such as “运行结果”, “观察重点”, and “项目结论”. Do not show `Ref ID`, inline citations, or “证据/Evidence” in the lesson body. References and downloads appear only in the final chapter.
- Deliver through two sequential PRs: data/Notebook assets first, then the six-chapter page and interactions.

## User-owned files excluded from both PRs

- `.planning/config.json`
- `docs/gpt_advice.md`
