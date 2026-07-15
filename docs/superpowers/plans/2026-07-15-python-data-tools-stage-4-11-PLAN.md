---
phase: python-data-tools-stage-4
plan: "11"
type: execute
wave: 8
depends_on: ["09", "10"]
files_modified:
  - src/router/index.ts
  - src/views/AlgorithmView.vue
  - src/data/pythonNotebookModule.ts
  - src/i18n/messages.ts
  - src/data/algorithmCheckpoints.ts
  - src/components/AlgorithmCheckpointQuiz.vue
  - tests/python-data-tools-runtime-integration.test.ts
  - tests/python-data-tools-runtime-progress.test.ts
  - tests/python-data-tools-runtime-routing.test.ts
autonomous: true
requirements: [R1, R2, R3, R4, R5, R6, R7, R8]
must_haves:
  truths:
    - "D-01–D-15: the live Python module selects the generated eight-chapter paged page, page-owned output session, inline generated presentation blocks, static prompts, and unchanged locale/chapter semantics."
    - "D-04: AlgorithmView omits its generic hero, completion/in-progress status, recent-learning badge, and generic hero stats for the dedicated Python page; the page shows only its own chapter location 第 X / 8 章."
    - "The visible `modules.pythonNotebook` metadata in both locales describes the eight-chapter Notebook/NumPy/pandas/Matplotlib/Seaborn/Plotly descriptive-analysis course and contains no stale sklearn/fit/predict/training language."
    - "D-18/D-19: the dedicated guard consumes Plan 10's resolver before AlgorithmView mounts, silently replaces legacy URLs, leaves current URLs unchanged, and safely canonicalizes unknown/root IDs without Progress writes."
    - "D-16/D-17: only analysis-report shows 课程回顾/Course Review with new grouped-analysis and correlation-limit IDs, explanations, valid revisit links, and the existing submit/append writer."
    - "The same atomic commit that switches runtime contains passing redirect and old-attempt fixture coverage; no commit can expose the new runtime without both protections."
  artifacts:
    - path: src/router/index.ts
      provides: "Dedicated pre-mount Python canonicalization guard"
    - path: src/data/pythonNotebookModule.ts
      provides: "Shallow eight-chapter module registration from generated projection"
    - path: src/i18n/messages.ts
      provides: "Current bilingual Python Data Tools catalog/metadata copy and eight current section labels"
    - path: tests/python-data-tools-runtime-progress.test.ts
      provides: "Old-attempt prefix preservation through new review submission"
    - path: tests/python-data-tools-runtime-integration.test.ts
      provides: "Atomic route/module/page/checkpoint integration contract"
  key_links:
    - from: src/router/index.ts
      to: src/utils/pythonDataToolsRoutes.ts
      via: "dedicated route before generic learn route invokes the exact pure resolver and redirects before component mount"
    - from: src/views/AlgorithmView.vue
      to: src/components/PythonDataToolsPagedLesson.vue
      via: "dedicated python-notebook branch passes current generated chapter, bypasses the generic hero/status, and preserves existing checkpoint submit handler"
    - from: src/i18n/messages.ts
      to: src/data/pythonNotebookModule.ts
      via: "title/kicker/intro/summary keys resolve to current descriptive data-tools copy in both locales"
    - from: src/data/pythonNotebookModule.ts
      to: src/data/generated/pythonDataToolsRuntime.generated.ts
      via: "shallow contract-ordered chapter registration without copied body/result copy"
    - from: src/components/AlgorithmCheckpointQuiz.vue
      to: /learn/python-notebook/:chapterId
      via: "course-review revisit URLs for the two new checkpoint IDs"
  prohibitions:
    - "Do not switch the live module unless dedicated pre-mount redirect tests and old-attempt preservation tests pass in this same task/commit."
    - "Do not copy course bodies, result presentation, exact statistics, or public paths into runtime integration files."
    - "Do not add a prompt writer, new Progress key, deleted/filtered attempt, migration banner, causal/model/cleaning/inference content, browser Python, backend, or upload surface."
---

<objective>
Atomically switch `/learn/python-notebook` to the generated eight-chapter page and current bilingual metadata, pre-mount canonical routes, and compatible course review with redirect and historical-attempt protection already passing.

Purpose: Complete the live migration without any commit exposing mismatched content, URLs, checkpoints, or Progress semantics.
Output: Dedicated guard, live module/page selection without generic completion hero, current bilingual i18n metadata, new review questions, focused integration tests, and old-attempt fixture.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-runtime-parity-spec.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-implementation-context.md
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-patterns.md
@src/utils/pythonDataToolsRoutes.ts
@src/components/PythonDataToolsPagedLesson.vue
@src/i18n/messages.ts
@src/utils/algorithmProgress.ts
</context>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Perform the protected atomic route/module/page/checkpoint switch</name>
  <files>src/router/index.ts, src/views/AlgorithmView.vue, src/data/pythonNotebookModule.ts, src/i18n/messages.ts, src/data/algorithmCheckpoints.ts, src/components/AlgorithmCheckpointQuiz.vue, tests/python-data-tools-runtime-integration.test.ts, tests/python-data-tools-runtime-progress.test.ts, tests/python-data-tools-runtime-routing.test.ts</files>
  <read_first>
    - src/utils/pythonDataToolsRoutes.ts
    - src/router/index.ts
    - src/views/AlgorithmView.vue
    - src/data/pythonNotebookModule.ts
    - src/i18n/messages.ts
    - src/data/algorithmCheckpoints.ts
    - src/components/AlgorithmCheckpointQuiz.vue
    - src/utils/algorithmProgress.ts
    - tests/algorithm-progress.test.ts
  </read_first>
  <behavior>
    - Dedicated Python root/chapter routes precede the generic route, consume the exact resolver, use replace semantics for legacy/unknown canonicalization, show no banner, and mount no Progress-writing component before redirect.
    - Live module registers exactly eight generated contract-ordered chapters and selects the dedicated current-chapter-only page with the existing locale/chapter state.
    - The dedicated Python branch does not render AlgorithmView's generic hero/status/stats; `modules.pythonNotebook` exposes current non-modeling title/kicker/intro/summary and eight section labels in zh-CN and en.
    - Current review IDs are `python-data-tools-grouped-analysis-interpretation` and `python-data-tools-correlation-not-causation`; only analysis-report renders them as 课程回顾/Course Review with explanation/revisit after submit and no percent/pass emphasis.
    - A fixture starting with `python-notebook-array-shape` and `python-notebook-sklearn-split` attempts survives resolver navigation plus both new submissions and reload with its old prefix byte-for-byte/deep-equal unchanged.
  </behavior>
  <action>Write the focused integration, i18n-source, routing, and historical-attempt assertions first, then complete the entire GREEN switch before committing. Add the dedicated Python guard before the generic lesson route and call only Plan 10's resolver; legacy and unknown redirects must complete before `AlgorithmView` and its watcher mount. Adapt `pythonNotebookModule.chapters` shallowly from generated runtime content and select `PythonDataToolsPagedLesson` without adding watcher mapping logic. For `isPythonNotebookPage`, omit the entire generic `algorithm-hero` branch so its completion/in-progress status, recent-learning label, and generic chapter/preset/runtime stats never precede the dedicated course page; retain that hero for other modules. Replace `modules.pythonNotebook` with these exact metadata values: zh-CN title `Python 数据分析工具：从 Notebook 到可复现报告`, kicker `Python Data Tools`, intro `使用共享单车数据快照，依次学习 Notebook、NumPy、pandas、Matplotlib、Seaborn 和 Plotly，完成一轮可复现的描述性分析。`, summary `八章课程把数组、表格、分组统计、静态图表、交互探索与分析报告连成一条完整的数据分析路径。`; English title `Python Data Tools: From Notebook to Reproducible Report`, kicker `Python Data Tools`, intro `Use a shared-bike dataset snapshot to learn Notebook workflow, NumPy, pandas, Matplotlib, Seaborn, and Plotly through one reproducible descriptive analysis.`, summary `Eight chapters connect arrays, tables, grouped summaries, static charts, interactive exploration, and an analysis report into one complete data-analysis path.` Replace the five legacy section keys with exactly eight current keys and bilingual labels: `notebookWorkflow` = `Notebook 工作流：让每个 cell 回答一个问题` / `Notebook workflow: make each cell answer a question`; `numpyFoundations` = `NumPy 基础：用 shape、索引和向量化理解数组` / `NumPy foundations: understand arrays through shape, indexing, and vectorization`; `pandasStructures` = `pandas 数据结构：从列、类型到表格语义` / `pandas structures: columns, dtypes, and table meaning`; `pandasAnalysis` = `pandas 分析：筛选、分组与比较` / `pandas analysis: filter, group, and compare`; `matplotlibVisualization` = `Matplotlib：把问题变成清晰图表` / `Matplotlib: turn questions into clear charts`; `seabornStatistics` = `Seaborn：读取分布、关系与相关性` / `Seaborn: read distributions, relationships, and correlation`; `plotlyExploration` = `Plotly：用受控交互探索小时模式` / `Plotly: explore hourly patterns with controlled interaction`; `analysisReport` = `分析报告：整理发现、限制与复现说明` / `Analysis report: organize findings, limits, and reproducibility`. Remove Python metadata references to sklearn, split, fit, predict, metric, model, or training in both locales. Replace only the two current Python checkpoint definitions with the locked new IDs and valid `pandas-analysis` plus `seaborn-statistics`/`analysis-report` revisit targets. Add a Python `course-review` presentation variant titled 课程回顾 / Course Review, rendered only after the final report, with explanation/revisit after submit and no score/pass emphasis; keep evaluation, emit, AlgorithmView submit handler, append-only writer, storage keys, and historical records unchanged. This task is indivisible: do not commit the runtime switch unless redirect ordering, exact current i18n, generic-hero omission, and old-attempt fixture tests are already green.</action>
  <acceptance_criteria>The live switch, exact redirect guard, dedicated-page hero/status omission, bilingual descriptive data-tools metadata, two new review questions, and old-attempt preservation all pass in one atomic task; no visible Python metadata teaches model training.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-routing.test.ts tests/python-data-tools-runtime-integration.test.ts tests/python-data-tools-runtime-progress.test.ts tests/python-data-tools-runtime-page.test.ts tests/python-data-tools-runtime-prompts.test.ts tests/python-data-tools-runtime-outputs.test.ts</automated></verify>
  <done>The first commit that exposes the new runtime already has canonical redirects and historical-attempt protection.</done>
</task>

<task type="auto">
  <name>Task 2: Harden focused integrated boundaries before compatibility closeout</name>
  <files>tests/python-data-tools-runtime-integration.test.ts, tests/python-data-tools-runtime-progress.test.ts, tests/python-data-tools-runtime-routing.test.ts</files>
  <read_first>
    - src/router/index.ts
    - src/views/AlgorithmView.vue
    - src/data/pythonNotebookModule.ts
    - src/i18n/messages.ts
    - src/data/algorithmCheckpoints.ts
    - src/components/AlgorithmCheckpointQuiz.vue
    - tests/python-data-tools-runtime-integration.test.ts
    - tests/python-data-tools-runtime-progress.test.ts
  </read_first>
  <action>Extend focused tests to prove the root module ID/route/curriculum role remain unchanged, all eight current chapter links stay direct, five legacy links silently canonicalize, unknown/root fallback is stable, only final report includes review, revisit URLs are canonical, prompt components remain writer-free, and generated result-presentation blocks reach PagedLesson/ResultBlock without a handwritten learner-copy registry. Parse both `messages.ts` locale branches and assert every exact title/kicker/intro/summary and eight keyed section labels specified in Task 1, while stale sklearn/split/fit/predict/metric/model/training wording is absent from learner-visible Python metadata. Add AlgorithmView source assertions that the dedicated Python page bypasses the complete generic hero/status/stats subtree before rendering PagedLesson while a non-Python module still renders it, that the route guard occurs before generic route/page mount, and that the old-attempt fixture is not filtered by current checkpoint IDs.</action>
  <acceptance_criteria>Focused tests diagnose routing order, live registration, review placement, source ownership, or attempt-history regressions independently.</acceptance_criteria>
  <verify><automated>node scripts/python-data-tools/build-runtime-content.mjs --check && node --test tests/python-data-tools-runtime-*.test.ts</automated></verify>
  <done>The atomic migration is ready for dependent repository-wide compatibility updates.</done>
</task>
</tasks>

## Artifacts this phase produces

- Dedicated pre-mount Python route guard consuming Plan 10's resolver.
- Live generated eight-chapter `pythonNotebookModule` registration and dedicated page branch.
- Current bilingual `modules.pythonNotebook` metadata and dedicated-page omission of AlgorithmView's generic completion hero.
- Two new course-review checkpoint definitions and presentation mode.
- Focused atomic integration and historical-attempt compatibility tests.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-17 | Tampering | Route params | high | mitigate | Resolver-backed guard runs before page/progress side effects and is covered in the switching commit. |
| T-PDT4-18 | Tampering | localStorage history | high | mitigate | Existing append-only writer and old-prefix fixture pass before the switch is committed. |
| T-PDT4-19 | Elevation of privilege | Runtime integration | medium | mitigate | Generated sanitized content/fixed assets only; no execution/upload/new writer. |
</threat_model>

<verification>As the Wave 8 validation owner, after Plan 11 completes run the focused runtime tests, compiler `--check`, `node --test tests/python-data-tools-*.test.ts`, `npm test`, and `git diff --check`; confirm one commit contains route, module, page, review, redirect tests, and old-attempt tests together.</verification>
<success_criteria>The live eight-chapter course is internally consistent, canonical, bilingual, and Progress-compatible at its first integrated commit; its exact current i18n metadata is visible where referenced and its dedicated page never renders the generic completion hero/status.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-11-SUMMARY.md` when done.</output>
