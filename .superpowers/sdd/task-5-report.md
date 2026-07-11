# Task 5 Report — Functions and Mappings Gold Lesson

## Scope

- Added the bilingual runtime replacement for `calculus-functions-rate-change` while preserving its ID, URL, route position, prerequisite, and next-module wiring.
- Added `PredictionMappingLab` and one lazy registration in `MathLabModulePage.vue`.
- Kept the existing `calculusRouteModules` source intact; `data/modules.ts` performs a narrow same-ID override after loading the legacy calculus collection.
- Did not read or modify any `gpt_advice` file.

## Content contract

- Twelve stable sections follow the approved Chinese master in order.
- Chinese and English preserve the same formulas, variables, fixed values, two worked examples, controlled experiment, formative feedback, four misconceptions, layered practice, and vector/dot-product handoff.
- The approved master remains auditable through `sourceNoteFile` and `sourceReferences`.
- Markdown is rendered through the existing safe renderer in tests; all 24 localized section bodies reject unsafe output, raw display delimiters, KaTeX errors, and malformed inline-code escapes.

## Lab contract

- The only controlled value is `w1`, bounded to `[2, 6]` with step `0.5`; `x = [2, 3]`, `w2 = -1`, `bias = 5`, and `target = 9` remain fixed.
- Prediction and one-sample MSE come from Task 1 `evaluatePredictionTask`; residual is derived from the same finite output and target.
- The range has a visible label/current value, native keyboard operation, reset button, and localized ARIA value text.
- Prediction, residual, and MSE remain visible in text, and an always-rendered table provides a static/reduced-motion fallback.
- `ExperimentEvidence` is emitted for formative display only and contains no completion or grading state.

## TDD evidence

1. RED: `node --test tests/math-to-code-functions.test.ts` failed with `ERR_MODULE_NOT_FOUND` for the missing Task 5 module.
2. GREEN: the focused suite passes 5/5, including a real Vite SSR render of the lab.
3. Self-review found and fixed escaped backticks/doubled LaTeX slashes; the focused renderer assertions now reject `katex-error` and malformed code output.

## Verification

- PASS — `node --test tests/math-to-code-functions.test.ts` (5/5)
- PASS — `node --test tests/math-to-code-utils.test.ts tests/math-to-code-manuscripts.test.ts tests/math-lab-layout.test.mjs`
- PASS — `npm run build`
- PASS — `git diff --check`
- PARTIAL — `npm test` has three failures:
  - pre-existing generated Curriculum V3 docs mismatch (`checked-in V3 docs match deterministic rendering`), outside Task 5 scope;
  - two legacy `tests/math-lab-core.test.ts` assertions still require the replaced lesson's `Review Questions`, old source note, old Chinese grocery/rate anchors, and `LocalChangeStoryLab`.

The two Math Lab failures directly conflict with the approved Task 5 runtime replacement and focused `PredictionMappingLab`. They were not changed because the task explicitly restricts edits to the Task 5 brief files. No legacy lab or obsolete copy was reintroduced merely to satisfy stale assertions.
