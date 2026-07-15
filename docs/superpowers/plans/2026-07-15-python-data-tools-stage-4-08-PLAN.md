---
phase: python-data-tools-stage-4
plan: "08"
type: execute
wave: 6
depends_on: ["07"]
files_modified:
  - src/components/PythonDataToolsPlotlyFigure.vue
  - src/components/PythonDataToolsResultBlock.vue
  - tests/python-data-tools-runtime-outputs.test.ts
autonomous: true
requirements: [R4, R8]
must_haves:
  truths:
    - "D-11: Plotly exposes only hour range, working/non-working group toggle, exact hover, zoom, reset, and current-filter summary."
    - "D-07/D-08: locale changes relabel the same immutable Figure without changing chapter or filter state."
    - "D-12: Plotly failure preserves a static filter explanation and equivalent authoritative table; unmount purges the instance."
  artifacts:
    - path: src/components/PythonDataToolsPlotlyFigure.vue
      provides: "Chapter-local lazy Plotly lifecycle and accessible controls"
      exports: ["default Vue component"]
  key_links:
    - from: src/components/PythonDataToolsPlotlyFigure.vue
      to: plotly.js-basic-dist-min
      via: "dynamic import only after authoritative Figure is ready"
    - from: src/components/PythonDataToolsPlotlyFigure.vue
      to: src/utils/pythonDataToolsOutputs.ts
      via: "immutable Figure and fallback-table view model"
    - from: src/data/generated/pythonDataToolsRuntime.generated.ts
      to: src/components/PythonDataToolsPlotlyFigure.vue
      via: "PagedLesson/ResultBlock passes the master-projected localized presentation block; Plotly defines no parallel learner-copy registry"
  prohibitions:
    - "Do not statically import Plotly, mutate the authoritative Figure, decode bdata by hand, recompute statistics, or expose unrelated modebar tools."
    - "Do not make hover, color, animation, or JavaScript the only carrier of a conclusion."
---

<objective>
Render the committed Plotly Figure as an isolated, constrained, accessible interactive result with a complete static fallback.

Purpose: Satisfy the approved exploration controls without expanding bundle/lifecycle risk.
Output: Lazy Plotly component, ResultBlock wiring, and lifecycle/control tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-research.md
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-patterns.md
@src/utils/cnnExplainer.ts
@src/components/CnnExplainerLab.vue
@src/modules/math-lab/pages/MathLabModulePage.vue
@public/notebooks/python-data-tools/outputs/plotly-hourly-explorer.plotly.json
</context>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Implement constrained Plotly lifecycle and filters</name>
  <files>src/components/PythonDataToolsPlotlyFigure.vue, tests/python-data-tools-runtime-outputs.test.ts</files>
  <read_first>
    - src/utils/cnnExplainer.ts
    - src/components/CnnExplainerLab.vue
    - src/modules/math-lab/pages/MathLabModulePage.vue
    - public/notebooks/python-data-tools/outputs/plotly-hourly-explorer.plotly.json
  </read_first>
  <behavior>
    - Mount-ready Figure dynamically imports the basic bundle and calls `react`; unmount calls `purge`.
    - Hour range clamps to 0–23, group toggle cannot create unknown groups, reset restores manifest defaults, locale relabels without resetting filters.
    - Config is responsive, hides logo/export/select/lasso/cloud tools, and keeps only zoom/reset semantics plus site controls.
  </behavior>
  <action>Write failing lifecycle/filter tests, then implement a `<script setup lang="ts">` component using the same function-local heavy-import pattern as `cnnExplainer.ts` and cleanup pattern as `CnnExplainerLab.vue`. Accept the generated result-presentation block through ResultBlock for localized title/alt/axis-and-legend translations/interpretation/limitation/fallback summary; only ephemeral control labels and the current-filter summary may be component UI copy. Clone/derive localized traces/layout from the immutable loader value, keep visible bilingual labels and a live current-filter text summary, validate finite filter values, and use `Plotly.react()`/`purge()`.</action>
  <acceptance_criteria>All approved controls are keyboard-labelled, filter state is stable across locale, modebar is constrained, and cleanup occurs after every mount lifecycle.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-outputs.test.ts</automated></verify>
  <done>The interactive Figure honors D-07/D-08/D-11 and has no eager bundle or lifecycle leak.</done>
</task>
<task type="auto">
  <name>Task 2: Wire Plotly local failure and static equivalence into ResultBlock</name>
  <files>src/components/PythonDataToolsResultBlock.vue, tests/python-data-tools-runtime-outputs.test.ts</files>
  <read_first>
    - src/components/PythonDataToolsResultBlock.vue
    - src/utils/pythonDataToolsOutputs.ts
    - src/modules/ai-overview/components/OverviewMediaFigure.vue
  </read_first>
  <action>Render the Plotly component only for the ready seventh-chapter Figure. If Figure loading, dynamic import, or rendering fails, keep the bilingual static filter explanation, key interpretation, and equivalent authoritative table in the same block. Ensure repeated/parallel ready emissions do not create duplicate graph containers or change prompt/checkpoint/Progress state.</action>
  <acceptance_criteria>Interactive and failed states communicate the same core result, and the failure remains local with no retry timer.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-outputs.test.ts && npm run build</automated></verify>
  <done>Plotly is isolated behind a lazy, locally recoverable teaching block.</done>
</task>
</tasks>

## Artifacts this phase produces

- `PythonDataToolsPlotlyFigure` with typed props, constrained filters, `react()` rendering, `purge()` cleanup, and static fallback integration.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-11 | Tampering | Plotly Figure | medium | mitigate | Render only committed guarded Figure; clone before localization/filtering; no user Figure input. |
| T-PDT4-12 | Denial of service | Plotly lifecycle | medium | mitigate | Dynamic import, one graph container, `react`, stale-request guard, `purge` on unmount. |
</threat_model>

<verification>As the Wave 6 validation owner, after Plan 08 completes run focused output tests, `node --test tests/python-data-tools-*.test.ts`, `npm test`, and both builds; inspect Vite output to confirm Plotly is a separate lazy chunk.</verification>
<success_criteria>The approved Plotly interaction works from authoritative data, preserves locale/filter state, cleans up, and has equivalent static teaching content.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-08-SUMMARY.md` when done.</output>
