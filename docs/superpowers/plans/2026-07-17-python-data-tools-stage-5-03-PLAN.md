---
phase: python-data-tools-stage-5
plan: "03"
type: execute
wave: 3
depends_on: ["02"]
files_modified:
  - src/components/PythonDataToolsPagedLesson.vue
  - src/components/PythonDataToolsResultBlock.vue
  - src/components/PythonDataToolsPlotlyFigure.vue
  - src/composables/usePythonDataToolsOutputSession.ts
  - src/styles/modules/python-data-tools.css
  - tests/python-data-tools-runtime-outputs.test.ts
  - tests/python-data-tools-runtime-page.test.ts
  - tests/python-data-tools-runtime-integration.test.ts
  - docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md
autonomous: true
requirements: [S5-R1, S5-R3, S5-R4, S5-R5, S5-R6]
must_haves:
  truths:
    - "All 36 core browser cells render one correct chapter without console/page errors, failed requests, page-level horizontal overflow, visible internal terminology, or unintended Progress mutation."
    - "Keyboard, reduced-motion, PNG/JSON/Plotly fallbacks, manifest retry, and stale-request behavior remain understandable in both locales."
    - "Any defect found by a matrix cell receives a focused regression test, the smallest Python Data Tools fix, and a rerun of the original failed cell."
  artifacts:
    - path: docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md
      provides: "Structured 36-cell, reduced-motion, keyboard, request, and failure-injection record"
    - path: src/styles/modules/python-data-tools.css
      provides: "Only scoped responsive fixes proven necessary by the matrix"
    - path: tests/python-data-tools-runtime-integration.test.ts
      provides: "Regression coverage for any browser-discovered behavior defect"
  key_links:
    - from: docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-validation.md
      to: docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md
      via: "one record row per required matrix/failure cell"
    - from: src/components/PythonDataToolsPagedLesson.vue
      to: src/styles/modules/python-data-tools.css
      via: "module-scoped responsive and overflow behavior"
    - from: src/components/PythonDataToolsPlotlyFigure.vue
      to: src/components/PythonDataToolsResultBlock.vue
      via: "interactive branch with static localized fallback"
  prohibitions:
    - statement: "Do not install an E2E, UI, screenshot, or visual-regression framework."
      status: resolved
      verification: "package.json/package-lock diff remains unchanged in this plan."
    - statement: "Do not fix unrelated global layout or other courses while closing a Python matrix cell."
      status: resolved
      verification: "Component/style scope and git diff audit."
    - statement: "Do not accept screenshots as the only evidence of a pass."
      status: resolved
      verification: "Summary rows require DOM, console, request, overflow and storage fields."
---

<objective>
Run the complete Stage 5 real-browser matrix and close only defects that prevent the Python Data Tools course from being reliably read.

Purpose: Validate the learner-facing course under real layout, language, interaction and resource-failure conditions that source tests cannot prove.
Output: A complete browser matrix record, focused regression fixes if needed, and every failed cell retested.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-17-python-data-tools-stage-5-consistency-validation-spec.md
@docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-validation.md
@docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-02-SUMMARY.md
@src/components/PythonDataToolsPagedLesson.vue
@src/styles/modules/python-data-tools.css
</context>

<tasks>
<task type="auto">
  <name>Task 1: Run the 36-cell bilingual responsive matrix</name>
  <files>docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md</files>
  <read_first>
    - /Users/jackky/.codex/skills/playwright/SKILL.md
    - docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-validation.md
    - src/components/LanguageToggle.vue
    - src/components/PythonDataToolsPagedLesson.vue
    - src/components/PythonDataToolsResultBlock.vue
    - src/components/PythonDataToolsPlotlyFigure.vue
  </read_first>
  <action>Run `npm run build`, serve the standard artifact on 127.0.0.1, and use the Playwright skill. Execute group A for all eight canonical chapter URLs in both locales at 1440×1000; groups B and C for `notebook-workflow`, `matplotlib-visualization`, `plotly-exploration`, and `analysis-report` in both locales at 768×1024 and 390×844; group D for Plotly in both locales at 1440×1000 and 390×844. For every cell record the exact validation fields in the Stage 5 validation document. Before each locale/storage check snapshot all Progress keys and after the cell require byte equality unless that cell explicitly submits Course Review. Use actual language-toggle buttons and require current URL/chapter preservation.</action>
  <acceptance_criteria>The summary contains exactly 36 uniquely keyed core rows and every row reports articleCount=1, matching chapterId, consoleErrors=0, pageErrors=0, failedRequests=0, overflowX=false, visibleInternalTerms=0 and progressMutation=false.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-page.test.ts tests/python-data-tools-runtime-routing.test.ts tests/python-data-tools-runtime-integration.test.ts</automated></verify>
  <done>The complete core matrix has structured pass/fail results rather than screenshot-only observations.</done>
</task>

<task type="auto">
  <name>Task 2: Run keyboard, reduced-motion, request-budget, and failure-injection cells</name>
  <files>docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md</files>
  <read_first>
    - docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-validation.md
    - src/composables/usePythonDataToolsOutputSession.ts
    - src/utils/pythonDataToolsOutputs.ts
    - src/components/PythonDataToolsPlotlyFigure.vue
    - src/components/AlgorithmCheckpointQuiz.vue
  </read_first>
  <action>On chapter 7 in both locales, traverse the mobile directory, pager, Plotly hour inputs, group toggles and reset using keyboard only; require visible focus, localized current values and no trapped focus. Emulate `prefers-reduced-motion: reduce` and require the same core conclusion/fallback text. Capture normal requests for all eight chapters and compare them to manifest plus current primary outputs. Then run F1–F6 exactly as defined in the validation document using request interception, including no Plotly chunk after Figure JSON failure and fallback JSON only after PNG failure. Run one final-report Course Review submit cell to prove the existing writer still appends while the UI shows no score/pass/Progress language.</action>
  <acceptance_criteria>Both locale keyboard/reduced-motion checks, all eight normal request budgets, F1–F6, and the Course Review writer cell have explicit passing rows with request and storage observations.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-outputs.test.ts tests/python-data-tools-runtime-progress.test.ts tests/algorithm-checkpoints-layout.test.mjs</automated></verify>
  <done>Accessibility, fallback, request, stale-state, and sole-writer behavior are proven in a real browser.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 3: Close browser-discovered defects without widening scope</name>
  <files>src/components/PythonDataToolsPagedLesson.vue, src/components/PythonDataToolsResultBlock.vue, src/components/PythonDataToolsPlotlyFigure.vue, src/composables/usePythonDataToolsOutputSession.ts, src/styles/modules/python-data-tools.css, tests/python-data-tools-runtime-outputs.test.ts, tests/python-data-tools-runtime-page.test.ts, tests/python-data-tools-runtime-integration.test.ts, docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md</files>
  <read_first>
    - docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md
    - each source file named by a failed matrix assertion
    - the nearest existing Python Data Tools test file for that behavior
  </read_first>
  <action>If every cell already passes, record “No browser-discovered source fix” and make no source edit. For each failed cell, first add one focused RED assertion to the nearest existing test, then make the smallest change inside the listed Python Data Tools component/composable/CSS boundary. Do not change global navigation, another course, package manifests or product scope. Rebuild and rerun the exact failed browser cell plus all cells sharing its component/viewport/locale risk. Update the original row with initial failure, commit/fix reference and final pass; never replace or delete the failure history.</action>
  <acceptance_criteria>No matrix row remains failed; every source change has a focused automated regression and a recorded browser retest; unrelated files and dependencies are unchanged.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-outputs.test.ts tests/python-data-tools-runtime-page.test.ts tests/python-data-tools-runtime-integration.test.ts &amp;&amp; node --test tests/python-data-tools-*.test.ts &amp;&amp; npm run build &amp;&amp; git diff --check</automated></verify>
  <done>The browser matrix is fully green with defect history preserved and no scope expansion.</done>
</task>
</tasks>

## Artifacts this phase produces

- `2026-07-17-python-data-tools-stage-5-03-SUMMARY.md` containing 36 core cells, accessibility/request/failure cells, and retest history.
- Focused Python Data Tools regression tests for any discovered defect.
- Only the smallest necessary component/composable/module-CSS repairs, if the matrix finds a failure.

<verification>Confirm the browser server is stopped, no screenshots/cache/test artifacts are staged, all matrix rows pass, focused and full Python tests pass, and package manifests are unchanged.</verification>
<success_criteria>
- All core, keyboard, reduced-motion, request, failure and Course Review browser checks pass.
- No page-level mobile overflow or untranslated/internal learner wording remains.
- Any defects are reproducibly covered and locally fixed.
</success_criteria>
<output>Create/finalize `docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md` when done.</output>
