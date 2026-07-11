# NumPy Mathematics-to-Code Lesson Sources

Date: 2026-07-11

## Approved Internal Teaching Source

- `docs/curriculum/v3/math-to-code/05-numpy-implementation.zh-CN.md` is the approved Chinese master for the twelve-section lesson, both worked examples, the complete reference implementation, controlled experiments, misconceptions, exercises, and guided-studio handoff.
- `scripts/generateMathToCodeRuntimeContent.mjs` owns the bilingual runtime generation. It copies each approved Chinese section exactly and pairs it with the reviewed English section source. `--check` compares the expected bytes with `runtimeLessonContent.generated.ts` without writing.

## Task 1 Numerical Contract

- `src/modules/math-lab/data/mathToCode/sharedTask.ts` owns the immutable two-sample inputs and default parameters.
- `src/modules/math-lab/utils/mathToCode.ts` owns the Task 1 finite-number, shape, prediction, MSE, copying, and central-difference behavior.
- The lesson reproduces predictions `[10, 5]`, MSE `2.5`, weight sensitivities `[0, -5]`, and bias sensitivity `-1`. Runtime prose and code must remain consistent with these executable results.

## External Authority

- NumPy broadcasting: https://numpy.org/doc/stable/user/basics.broadcasting.html
- NumPy matrix multiplication (`matmul` / `@`): https://numpy.org/doc/stable/reference/generated/numpy.matmul.html
- NumPy finite-value checking (`isfinite`): https://numpy.org/doc/stable/reference/generated/numpy.isfinite.html
- NumPy array conversion (`asarray`): https://numpy.org/doc/stable/reference/generated/numpy.asarray.html
- NumPy testing helpers: https://numpy.org/doc/stable/reference/routines.testing.html

These links are used to verify API semantics and failure boundaries. The lesson's teaching sequence, fixed numbers, examples, and exercises come from the approved internal manuscript rather than being copied from NumPy documentation.

## Reuse Boundary

- `CodeLab` renders the checked reference code as local static teaching content. This lesson adds no executable remote notebook, iframe, upload, grading, or evidence-persistence channel.
- The `(2,3)` sensor-grid and `column_bias` example is independent of the prediction task; it teaches trailing-axis broadcasting and a legal-but-wrong `(3,3)` result.
- The lesson reuses Task 1 utilities as the numerical oracle but does not change their API or move NumPy execution into the browser.
- `numpy-mathematics-implementation` remains exported-only in Task 6. Task 7 owns pilot-route registration.
