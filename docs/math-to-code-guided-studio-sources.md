# Math-to-Code Guided Studio Sources

## Runtime ownership

- The approved Chinese master is `docs/curriculum/v3/math-to-code/06-guided-studio.zh-CN.md`.
- The reviewed equivalent English source is `docs/curriculum/v3/math-to-code/06-guided-studio.en.md`.
- `scripts/generateMathToCodeRuntimeContent.mjs` projects both sources into `runtimeLessonContent.generated.ts`; `--check` is the drift gate.
- `MathToCodeStudioLab.vue` uses the Task 1 utilities in `src/modules/math-lab/utils/mathToCode.ts` and keeps interaction local to the component.

## Teaching and route boundary

- The shared values are `X=[[2,3],[1,4]]`, `w=[4,-1]`, `b=5`, and `targets=[9,7]`.
- The studio keeps matrix, targets, predictions `[10,5]`, residuals `[1,-2]`, squared errors `[1,4]`, MSE `2.5`, and numerical sensitivities `[0,-5,-1]` visible.
- The probability stage is a fixed-seed preview, not a complete probability or Monte Carlo course.
- The guided studio is not `project-math-to-code`. The formal project prerequisites remain exactly Gradient Descent and Monte Carlo.

## External authorities

- [NumPy broadcasting](https://numpy.org/doc/stable/user/basics.broadcasting.html) — used to verify trailing-axis behavior and the `(2,)` versus `(2,1)` cross-residual failure.
- [NumPy matrix multiplication](https://numpy.org/doc/stable/reference/generated/numpy.matmul.html) — used to verify `(n,d) @ (d,) -> (n,)`.
- [NumPy random Generator](https://numpy.org/doc/stable/reference/random/generator.html) — used to verify the fixed-generator and fixed-seed preview contract.
