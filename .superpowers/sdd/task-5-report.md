# Task 5 Report — Functions and Mappings Gold Lesson

## Scope

- Added the bilingual runtime replacement for `calculus-functions-rate-change` while preserving its ID, URL, route position, prerequisite, and next-module wiring.
- Added `PredictionMappingLab` and one lazy registration in `MathLabModulePage.vue`.
- Kept the existing `calculusRouteModules` source intact; `data/modules.ts` performs a narrow same-ID override after loading the legacy calculus collection.
- Did not read or modify any `gpt_advice` file.

## Content contract

- Twelve stable sections follow the approved Chinese master in order.
- Chinese and English preserve the same formulas, variables, fixed values, two worked examples, controlled experiment, formative feedback, four misconceptions, layered practice, and vector/dot-product handoff.
- The approved master is retained as the internal authoring artifact; runtime provenance uses the canonical calculus source note plus deployable HTTPS references to the external authorities actually used.
- Markdown is rendered through the existing safe renderer in tests; all 24 localized section bodies reject unsafe output, raw display delimiters, KaTeX errors, and malformed inline-code escapes.

## Lab contract

- The only controlled value is `w1`, bounded to `[2, 6]` with step `0.5`; `x = [2, 3]`, `w2 = -1`, `bias = 5`, and `target = 9` remain fixed.
- Prediction and one-sample MSE come from Task 1 `evaluatePredictionTask`; residual is derived from the same finite output and target.
- The range has a visible label/current value, native keyboard operation, reset button, and localized ARIA value text.
- Prediction, residual, and MSE remain visible in text, and an always-rendered table provides a static/reduced-motion fallback.
- The lab is deliberately local-only: it emits no `ExperimentEvidence`, exposes no progress-writing path, and its readouts do not imply completion or grading.

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

## Follow-up root-cause repair

After explicit approval to minimally extend Task 5 scope, the three full-suite failures were repaired at their sources:

- `sourceNoteFile` was restored to the calculus route's canonical `math-lab-calculus-route-sources.md`; `sourceReferences` contains only deployable external authorities with specific usage notes. The approved Chinese master remains an internal authoring artifact rather than a broken runtime `/docs` link. The Task 5 test locks this distinction.
- `tests/math-lab-core.test.ts` had two duplicated generic `Review Questions` assumptions plus old module-specific expectations for `LocalChangeStoryLab` and grocery/rate copy. Only the `calculus-functions-rate-change` branches were migrated to the gold lesson's `Three-Layer Practice`, `PredictionMappingLab`, and actual Chinese anchors (`输入`, `参数`, `控制变量实验`). All other module contracts remain unchanged.
- `docs/curriculum-v3/content-audit.md` was regenerated with `node scripts/generateCurriculumV3Docs.ts`; this was the only generated document changed, and docs parity now passes.

The expanded scope is limited to the two explicitly approved files above plus the original Task 5 module, test, and report. The old lesson and old lab were not reintroduced.

Final follow-up verification:

- PASS — the three previously failing focused cases (3/3)
- PASS — `node --test tests/math-to-code-functions.test.ts` (5/5)
- PASS — `npm test` (368/368)
- PASS — `npm run build`
- PASS — generated-doc parity and `git diff --check`

## Review-anchor and coverage follow-up

- Added one unique DOM anchor for every inline and supplemental image/Manim visual at the `MathLabModulePage` wrapper layer. The first section reference keeps the canonical review ID and later references receive section-suffixed IDs, so a real page SSR test verifies quiz targets resolve exactly once without suppressing repeated teaching visuals or giving child media duplicate IDs.
- Added the semantic misconceptions `parameter-change-one-to-one` and `larger-is-better`, restored the corresponding quiz tags, and locked their bilingual mathematical meaning in tests.
- Generated the static experiment rows from the same `[2, 6]`, step `0.5` control contract, covering all nine legal settings. Client-mount tests now exercise 2.5, 4.5, 5.5, below/above bounds, invalid input, and reset while requiring one visible/ARIA current row.
- Expanded both NumPy examples to define `bias = 5.0` and `target = 9.0`, then expose `weighted_sum`, `prediction = weighted_sum + bias`, and `residual = prediction - target` as a test-locked variable chain.
- Updated the canonical calculus source record with the new lesson title, `PredictionMappingLab`, local-only interaction boundary, and actual authority usage.

Review follow-up verification: related tests 125/125, full repository suite 376/376, standard build, GitHub Pages build, docs parity, and diff-check all pass.

## Content-integrity and interaction hardening

The final review expanded scope only to direct dependencies and their tests:

- Migrated the full teaching depth of all 12 approved sections into runtime copy, including shape contracts, `zip` truncation, complete Python/NumPy code, worked tables, four cause-diagnosis-repair misconceptions, and all nine exercises with bilingual hints, reference reasoning, and section links.
- Changed `PredictionMappingLab` from emitted evidence to local formative state. A real client mount now drives lower/upper bounds, invalid normalization, reset, visible current value, prediction/residual/MSE, current-row semantics, zero evidence events, and zero storage writes.
- Made quiz misconception tags referentially valid, added real section/lab review anchors, and rendered those anchors in checkpoint feedback.
- Added an accessible table caption, visible “current setting” label, and `aria-current`; the current state is no longer communicated by color alone.
- Updated the V3 audit to describe the actual prediction/shape/Python/w1/residual lesson and its remaining multi-sample/generalization/derivative gap, then regenerated only `content-audit.md`.
- Synchronized the new bilingual title in navigation menus, the route manifest, and learning-route summaries.

Final content-integrity verification:

- PASS — Task 5 plus related Math Lab core, catalog, audit, docs, navigation, SSR, and client-mount tests (127/127)
- PASS — complete repository suite (368/368)
- PASS — `npm run build`
- PASS — `npm run build:pages`
- PASS — generated-doc parity and `git diff --check`
