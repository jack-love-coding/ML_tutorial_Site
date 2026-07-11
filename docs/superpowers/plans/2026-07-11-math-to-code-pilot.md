# Mathematics-to-Code Pilot Unit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a bilingual, high-detail five-lesson Math Lab pilot plus a guided Mathematics-to-Code studio, while leaving formal V3 Project 1 after Gradient Descent and Monte Carlo.

**Architecture:** Author and review Chinese manuscripts before runtime promotion. Runtime lessons remain typed `MathLabModule` records, share deterministic prediction utilities, reuse the existing Math Lab renderer, and lazy-load two focused labs. A dedicated pilot learning route links the five lessons and guided studio; the formal `project-math-to-code` blueprint and its prerequisites remain unchanged.

**Tech Stack:** Vue 3, TypeScript, Vite, Node test runner, Markdown-it/KaTeX safe rendering, SVG/Canvas through existing Math Lab patterns.

## Global Constraints

- Default learner: high-school algebra/functions and basic Python; no university calculus or linear algebra assumed.
- Lesson order: functions, vectors, matrices, derivatives, NumPy, guided studio.
- Every lesson is designed for 60–90 minutes and follows the eleven-part gold-standard teaching loop.
- One small prediction task is shared across all lessons; each lesson also has one concept-specific auxiliary example.
- Author Chinese masters first; runtime promotion requires complete `'zh-CN'` and `en` copies with equivalent formulas, variables, examples, controls, exercises, and feedback.
- The guided studio is `math-to-code-guided-studio`, not the formal `project-math-to-code`; do not change the formal project's `['gradient-descent', 'monte-carlo']` prerequisites.
- Checkpoints are formative only. Do not add uploads, grading, certificates, teacher dashboards, backend state, or project pass/fail decisions.
- Use safe Markdown rendering; reject uncontrolled raw HTML and invalid numeric input.
- Preserve old URLs and current localStorage sources. Do not delete or rewrite unrelated Math Lab content.
- Interactive conclusions require text/table/static fallback, keyboard labels, reset controls, and reduced-motion support.
- Do not touch `docs/gpt_advice.md` or generated Data Lab images.

---

## File Map

- `docs/curriculum/v3/math-to-code/*.zh-CN.md`: reviewable Chinese masters; never imported by runtime.
- `src/modules/math-lab/data/mathToCode/sharedTask.ts`: stable task constants and bilingual vocabulary.
- `src/modules/math-lab/utils/mathToCode.ts`: deterministic prediction, batch, error, and numerical-derivative calculations.
- `src/modules/math-lab/data/mathToCode/modules.ts`: six promoted bilingual `MathLabModule` definitions.
- `src/modules/math-lab/labs/PredictionMappingLab.vue`: function/parameter/error experiment.
- `src/modules/math-lab/labs/MathToCodeStudioLab.vue`: integrated guided studio.
- Existing vector, matrix, local-change, and code-display labs are reused where their contracts match.
- `src/modules/math-lab/data/modules.ts` and `learningRoutes.ts`: registration and pilot sequence.
- `src/curriculum/v3/audit.ts`: add mappings only for genuinely new runtime module IDs.

### Task 1: Shared prediction model and numerical contract

**Files:**
- Create: `src/modules/math-lab/data/mathToCode/sharedTask.ts`
- Create: `src/modules/math-lab/utils/mathToCode.ts`
- Test: `tests/math-to-code-utils.test.ts`

**Interfaces:**
- Produces: `MATH_TO_CODE_SAMPLES: readonly PredictionSample[]`, `DEFAULT_PARAMETERS: PredictionParameters`, `predictOne(features: readonly number[], weights: readonly number[], bias: number): number`, `predictBatch(matrix: readonly (readonly number[])[], weights: readonly number[], bias: number): number[]`, `meanSquaredError(predictions: readonly number[], targets: readonly number[]): number`, `centralDifference(fn: (value: number) => number, value: number, step: number): number`, and `evaluatePredictionTask(input: PredictionTaskInput): PredictionTaskEvaluation`.

- [ ] **Step 1: Write failing deterministic and invalid-input tests**

```ts
test('shared task preserves formula-code-shape agreement', () => {
  assert.equal(predictOne([2, 3], [4, -1], 5), 10)
  assert.deepEqual(predictBatch([[2, 3], [1, 4]], [4, -1], 5), [10, 5])
  assert.equal(meanSquaredError([10, 5], [9, 7]), 2.5)
  assert.ok(Math.abs(centralDifference(x => x * x, 3, 1e-4) - 6) < 1e-6)
})

test('shared task rejects non-finite and incompatible shapes', () => {
  assert.throws(() => predictOne([1], [1, 2], 0), /same length/)
  assert.throws(() => centralDifference(x => x, 1, 0), /positive/)
  assert.throws(() => meanSquaredError([Number.NaN], [1]), /finite/)
})
```

- [ ] **Step 2: Run `node --test tests/math-to-code-utils.test.ts`; expect missing-module failure.**
- [ ] **Step 3: Implement finite-number guards, exact shape checks, immutable task constants, and the six exports.**
- [ ] **Step 4: Run the focused test; expect all cases to pass.**
- [ ] **Step 5: Run `npm test` and commit `feat: define math-to-code shared prediction model`.**

### Task 2: Chinese gold-standard manuscript for Functions and Mappings

**Files:**
- Create: `docs/curriculum/v3/math-to-code/01-functions-mappings.zh-CN.md`
- Create: `tests/math-to-code-manuscripts.test.ts`

**Interfaces:**
- Produces stable section IDs: `opening-question`, `prerequisite-recap`, `shared-prediction-task`, `mapping-intuition`, `formal-definition`, `worked-prediction`, `worked-motion-example`, `python-translation`, `controlled-experiment`, `misconceptions`, `layered-practice`, `lesson-handoff`.

- [ ] **Step 1: Write a failing manuscript structure test** that loads the Markdown, asserts all twelve IDs in order, rejects unfinished authoring markers, requires `y_hat = w^T x + b`, the numeric result `10`, two misconception headings, three exercise levels, and a handoff to vectors.
- [ ] **Step 2: Run `node --test tests/math-to-code-manuscripts.test.ts`; expect missing-file failure.**
- [ ] **Step 3: Author the complete Chinese 60–90 minute manuscript**, including both the shared prediction and motion-graph examples, line-by-line formula-to-Python mapping, one-variable experiment, feedback, and reference reasoning.
- [ ] **Step 4: Run the focused test and manually verify every displayed calculation against Task 1 utilities.**
- [ ] **Step 5: Commit `docs: author functions and mappings gold lesson`.**

### Task 3: Remaining Chinese lesson masters

**Files:**
- Create: `docs/curriculum/v3/math-to-code/02-vectors-samples.zh-CN.md`
- Create: `docs/curriculum/v3/math-to-code/03-matrices-batches.zh-CN.md`
- Create: `docs/curriculum/v3/math-to-code/04-derivatives-error.zh-CN.md`
- Create: `docs/curriculum/v3/math-to-code/05-numpy-implementation.zh-CN.md`
- Modify: `tests/math-to-code-manuscripts.test.ts`

**Interfaces:**
- Each manuscript uses the same `x`, `w`, `b`, `y_hat`, `y`, and `L` vocabulary and ends with the next lesson's input contract.

- [ ] **Step 1: Extend the test with exact ordered file names, required formulas (`w^T x+b`, `Xw+b`, MSE, central difference), two worked examples per file, three exercise levels, misconceptions, and handoff IDs.**
- [ ] **Step 2: Run the focused test; expect four missing-file failures.**
- [ ] **Step 3: Author vectors and matrices**, using projection/geometry and grid/image transforms as auxiliary examples; show every dimension in the batch calculation.
- [ ] **Step 4: Author derivatives and NumPy**, using motion/local slope and array-shape debugging as auxiliary examples; distinguish derivative estimation from gradient descent.
- [ ] **Step 5: Run manuscript tests and `git diff --check`; commit `docs: author math-to-code pilot lessons`.**

### Task 4: Chinese guided-studio master

**Files:**
- Create: `docs/curriculum/v3/math-to-code/06-guided-studio.zh-CN.md`
- Modify: `tests/math-to-code-manuscripts.test.ts`

**Interfaces:**
- Produces studio stages: reproduce task, scalar baseline, vector prediction, batch prediction, error comparison, numerical sensitivity, probability preview, failure analysis, reflection.

- [ ] **Step 1: Add a failing test** requiring all nine stages, reproducible values, intermediate outputs `[10, 5]`, expected MSE `2.5`, a clearly labelled probability preview, and the sentence that formal Project 1 follows Gradient Descent and Monte Carlo.
- [ ] **Step 2: Run the focused test; expect missing-file failure.**
- [ ] **Step 3: Author the guided studio** with starter code, expected observations, hints, common failures, optional extensions, and no submission/grading language.
- [ ] **Step 4: Run focused tests; commit `docs: author math-to-code guided studio`.**

### Task 5: Promote the gold lesson with a focused experiment

**Files:**
- Create: `src/modules/math-lab/data/mathToCode/modules.ts`
- Create: `src/modules/math-lab/labs/PredictionMappingLab.vue`
- Modify: `src/modules/math-lab/pages/MathLabModulePage.vue`
- Modify: `src/modules/math-lab/data/modules.ts`
- Test: `tests/math-to-code-functions.test.ts`

**Interfaces:**
- Produces runtime module `calculus-functions-rate-change` and lab component name `PredictionMappingLab`.

- [ ] **Step 1: Write failing tests** for complete localized fields, stable section order, two worked examples, formative feedback, lab registration, parameter/reset labels, and SSR text fallback.
- [ ] **Step 2: Run `node --test tests/math-to-code-functions.test.ts`; expect new data/lab assertions to fail.**
- [ ] **Step 3: Convert the approved Chinese master into a complete bilingual `MathLabModule`**, preserving all numbers/formulas and replacing the existing runtime definition without changing its URL.
- [ ] **Step 4: Implement the lab with bounded finite inputs**, one controlled parameter change, prediction/error readouts, an SVG or table fallback, keyboard-operable controls, and evidence emitted only for formative display.
- [ ] **Step 5: Run focused tests, `npm test`, and `npm run build`; commit `feat: publish functions and mappings gold lesson`.**

### Task 6: Promote vectors, matrices, derivatives, and NumPy

**Files:**
- Modify: `src/modules/math-lab/data/mathToCode/modules.ts`
- Modify: `src/modules/math-lab/data/modules.ts`
- Test: `tests/math-to-code-unit.test.ts`

**Interfaces:**
- Produces modules `linear-algebra-feature-space`, `linear-algebra-matrix-transformations`, `calculus-derivatives-local-change`, and new `numpy-mathematics-implementation`.

- [ ] **Step 1: Write failing table-driven tests** for exact IDs/order, bilingual parity, shared vocabulary, formulas, two examples, experiments/labs, misconceptions, exercises, and handoffs.
- [ ] **Step 2: Run the focused test; expect missing/incomplete module failures.**
- [ ] **Step 3: Promote vectors and matrices**, reusing `FeatureVectorStoryLab` and `MatrixTransformLab` only where their variables and success criteria match the manuscripts.
- [ ] **Step 4: Promote derivatives and NumPy**, reusing `LocalChangeStoryLab` and `CodeLab`; ensure displayed code reproduces Task 1 outputs and shape failures.
- [ ] **Step 5: Run focused tests, full tests, and build; commit `feat: publish math-to-code pilot lessons`.**

### Task 7: Publish the guided studio and pilot route

**Files:**
- Modify: `src/modules/math-lab/data/mathToCode/modules.ts`
- Create: `src/modules/math-lab/labs/MathToCodeStudioLab.vue`
- Modify: `src/modules/math-lab/pages/MathLabModulePage.vue`
- Modify: `src/modules/math-lab/data/modules.ts`
- Modify: `src/modules/math-lab/data/learningRoutes.ts`
- Modify: `src/modules/math-lab/types/mathLab.ts`
- Modify: `src/curriculum/v3/audit.ts`
- Test: `tests/math-to-code-route.test.ts`
- Modify: `tests/curriculumV3Audit.test.ts`

**Interfaces:**
- Produces route `math-to-code-pilot` and module `math-to-code-guided-studio`; does not modify `project-math-to-code`.

- [ ] **Step 1: Write failing tests** asserting exact six-module route order, first-incomplete behavior, lazy lab registration, bilingual studio stages, no grading/upload tokens, and unchanged formal project prerequisites.
- [ ] **Step 2: Run focused route and audit tests; expect missing route/module/audit failures.**
- [ ] **Step 3: Implement the bilingual guided studio and lab**, using Task 1 utilities and showing every intermediate value with reset and text fallback.
- [ ] **Step 4: Register the route and add audit entries for only the two new runtime IDs** (`numpy-mathematics-implementation`, `math-to-code-guided-studio`) with valid V3 targets; keep legacy URLs and all existing routes.
- [ ] **Step 5: Run focused tests, full tests, `npm run build`, and `npm run build:pages`; commit `feat: publish math-to-code guided route`.**

### Task 8: Cross-unit teaching and accessibility verification

**Files:**
- Create: `tests/math-to-code-content-contract.test.ts`
- Modify only files implicated by failures from this task.

**Interfaces:**
- Consumes all six promoted modules; produces no new runtime API.

- [ ] **Step 1: Add cross-unit tests** for unique IDs, valid references, formula/code vocabulary, exact worked outputs, safe Markdown sanitization, public paths, bilingual section parity, experiment bounds, and static fallbacks.
- [ ] **Step 2: Run `node --test tests/math-to-code-*.test.ts`; fix only evidenced contract failures.**
- [ ] **Step 3: Run `npm test`, `npm run build`, `npm run build:pages`, and `git diff --check`; all must pass.**
- [ ] **Step 4: Start the preview and inspect both locales at desktop and mobile widths**, including keyboard controls and reduced-motion mode; record findings in `docs/curriculum/v3/math-to-code/QA.md`.
- [ ] **Step 5: Commit `test: verify math-to-code teaching contract`.**

## Execution Notes

- Execute only after the Curriculum V3 blueprint branch has completed its own review and integration decision.
- Each task receives an independent review gate. Critical and important findings must be fixed and re-reviewed before the next task.
- Content review is evidence-based: recalculate every numeric example and compare code output with formulas; page length alone is not acceptance evidence.
- If an existing lab cannot preserve the shared variables or controlled-change requirement, create a focused lab instead of silently changing the manuscript.
