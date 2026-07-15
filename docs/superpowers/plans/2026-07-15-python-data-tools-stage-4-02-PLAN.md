---
phase: python-data-tools-stage-4
plan: "02"
type: execute
wave: 2
depends_on: ["01"]
files_modified:
  - docs/curriculum-v3/python-data-tools/chinese-master/05-matplotlib-visualization.md
  - docs/curriculum-v3/python-data-tools/chinese-master/06-seaborn-statistics.md
  - docs/curriculum-v3/python-data-tools/chinese-master/07-plotly-exploration.md
  - docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
  - docs/curriculum-v3/python-data-tools/chinese-master/README.md
  - tests/python-data-tools-chinese-master.test.ts
autonomous: true
requirements: [R1, R5, R7, R8]
must_haves:
  truths:
    - "D-03: chapters 5–8 use approved learner-facing Chinese labels outside code/markers/internal identifiers."
    - "D-08: every chapters 5–8 output has one complete result-presentation section, including PNG label translations and Plotly fallback semantics."
    - "D-14/D-15: chapter 5, 6, and 7 pauses are static teaching prompts with visible reasoning and no interaction."
  artifacts:
    - path: docs/curriculum-v3/python-data-tools/chinese-master/05-matplotlib-visualization.md
      provides: "Normalized Chinese visual-analysis authority"
    - path: docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
      provides: "Normalized final-report authority and limitations"
    - path: tests/python-data-tools-chinese-master.test.ts
      provides: "Complete eight-master Chinese authority checks"
  key_links:
    - from: docs/curriculum-v3/python-data-tools/chinese-master/05-matplotlib-visualization.md
      to: public/notebooks/python-data-tools/outputs/manifest.json
      via: "existing output IDs and visual bindings remain byte-stable"
    - from: docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
      to: /data-lab
      via: "descriptive-analysis limitation and explicit cleaning handoff"
  prohibitions:
    - "Do not create new PNGs, copy statistics, or alter Stage 3 assets/bindings."
    - "Do not add interaction to prompts or expand into cleaning, modeling, inference, or causality."
---

<objective>
Normalize Chinese authority chapters 5–8 and finish all eight result-presentation and five static-prompt source structures.

Purpose: Complete the Chinese authority in a second reviewable content slice before English pairing.
Output: Four normalized visual/report masters, three static prompts, complete eight-master README/tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-runtime-parity-spec.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-implementation-context.md
@docs/superpowers/specs/2026-07-14-python-data-tools-stage-3-notebook-assets-design.md
@docs/curriculum-v3/python-data-tools/chinese-master/README.md
@src/data/pythonNotebookContract.ts
@tests/python-data-tools-chinese-master.test.ts
</context>

<tasks>
<task type="auto">
  <name>Task 1: Normalize chapters 5–8 visual/report prose and result presentation</name>
  <files>docs/curriculum-v3/python-data-tools/chinese-master/05-matplotlib-visualization.md, docs/curriculum-v3/python-data-tools/chinese-master/06-seaborn-statistics.md, docs/curriculum-v3/python-data-tools/chinese-master/07-plotly-exploration.md, docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md, tests/python-data-tools-chinese-master.test.ts</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/05-matplotlib-visualization.md
    - docs/curriculum-v3/python-data-tools/chinese-master/06-seaborn-statistics.md
    - docs/curriculum-v3/python-data-tools/chinese-master/07-plotly-exploration.md
    - docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
    - public/notebooks/python-data-tools/outputs/manifest.json
  </read_first>
  <action>Apply D-03/D-08 to chapters 5–8 using Plan 01's README grammar. Normalize visible teaching language and author exactly one complete result-presentation section for every owned PNG/JSON/Plotly output, including accessibility copy, Chinese-axis/legend translation rows where applicable, interpretation, limitations, and authoritative fallback summary. Preserve code, markers, formulas, exact values, IDs, and asset bindings. Keep sample-size/correlation limits, explicit non-causal wording, and `/data-lab` handoff.</action>
  <acceptance_criteria>Chapters 5–8 have normalized visible wording and complete result presentation while every Stage 3 binding stays unchanged.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-chinese-master.test.ts tests/python-data-tools-notebook-assets.test.ts</automated></verify>
  <done>All eight Chinese masters now provide the runtime presentation authority.</done>
</task>

<task type="auto">
  <name>Task 2: Convert chapters 5–7 pauses and close the eight-master source tests</name>
  <files>docs/curriculum-v3/python-data-tools/chinese-master/05-matplotlib-visualization.md, docs/curriculum-v3/python-data-tools/chinese-master/06-seaborn-statistics.md, docs/curriculum-v3/python-data-tools/chinese-master/07-plotly-exploration.md, docs/curriculum-v3/python-data-tools/chinese-master/README.md, tests/python-data-tools-chinese-master.test.ts</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/05-matplotlib-visualization.md
    - docs/curriculum-v3/python-data-tools/chinese-master/06-seaborn-statistics.md
    - docs/curriculum-v3/python-data-tools/chinese-master/07-plotly-exploration.md
    - docs/curriculum-v3/python-data-tools/chinese-master/README.md
    - tests/python-data-tools-chinese-master.test.ts
  </read_first>
  <action>Per D-14/D-15, convert the Matplotlib, Seaborn, and Plotly pauses to the shared static teaching shape. Extend the test across all eight Chinese masters: exactly five ordered prompt mounts, eight complete result-presentation blocks, parser-aware D-03 wording, UTF-8, no placeholders, unchanged cell/output signatures, and R7 scope boundaries. Do not create the paired-master preflight here; Plan 05 schedules that gate only after both Chinese groups and both English groups are complete.</action>
  <acceptance_criteria>All eight Chinese masters pass source tests; five prompts and eight result presentations are complete and ordered.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-chinese-master.test.ts tests/python-data-tools-notebook-assets.test.ts && git diff --check</automated></verify>
  <done>The Chinese authority is complete and ready for one-to-one English authoring.</done>
</task>
</tasks>

## Artifacts this phase produces

- Normalized Chinese chapters 5–8 and complete eight-chapter source checks.
- Static `chart-choice`, `interpret-correlation`, and `interactive-encoding` prompts.
- Visual/report result-presentation authority with non-causal/Data Lab limits.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-02 | Tampering | Chinese masters 5–8 | medium | mitigate | Preserve committed asset IDs/code/formulas and test descriptive-analysis boundaries. |
</threat_model>

<verification>Run focused source/asset tests and `git diff --check`; inspect the four Python fences and all output markers.</verification>
<success_criteria>All eight Chinese masters are normalized, presentation-complete, and prompt-complete without scope or binding drift.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-02-SUMMARY.md` when done.</output>
