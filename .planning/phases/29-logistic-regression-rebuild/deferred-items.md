# Deferred items discovered while executing Plan 29-02

- `tests/logistic-regression-release.test.mjs` currently rejects the legacy precision/recall UI in `src/components/LogisticRegressionPagedLesson.vue`. This is course-shell work owned by later Phase 29 lesson/lab plans, not numerical asset generation.
- `npm run security:audit` reports one existing high-severity transitive `nanoid` advisory. No package was added or changed by Plan 29-02.
