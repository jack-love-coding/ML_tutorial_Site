---
phase: python-data-tools-stage-4
plan: "04"
type: execute
wave: 3
depends_on: ["02"]
files_modified:
  - docs/curriculum-v3/python-data-tools/english-master/05-matplotlib-visualization.md
  - docs/curriculum-v3/python-data-tools/english-master/06-seaborn-statistics.md
  - docs/curriculum-v3/python-data-tools/english-master/07-plotly-exploration.md
  - docs/curriculum-v3/python-data-tools/english-master/08-analysis-report.md
autonomous: true
requirements: [R1, R5, R7, R8]
must_haves:
  truths:
    - "D-05/D-06/D-08: chapters 5–8 have complete English semantics while reusing the same Chinese-labelled PNG/output bindings."
    - "The English text supplies titles, alt intent, label translations, interpretation, equivalent-table explanations, and correlation limitations."
    - "D-03: learner-visible English uses natural teaching vocabulary; internal terms remain confined to paired code, markers, IDs, JSON fields, and internal symbols."
  artifacts:
    - path: docs/curriculum-v3/python-data-tools/english-master/05-matplotlib-visualization.md
      provides: "English visualization teaching authority"
    - path: docs/curriculum-v3/python-data-tools/english-master/08-analysis-report.md
      provides: "English final-report authority"
  key_links:
    - from: docs/curriculum-v3/python-data-tools/english-master/08-analysis-report.md
      to: /data-lab
      via: "explicit handoff after descriptive report limits"
    - from: docs/curriculum-v3/python-data-tools/english-master
      to: docs/curriculum-v3/python-data-tools/chinese-master
      via: "matching filenames and stable markers prepared for the full Plan 05 paired-master preflight"
  prohibitions:
    - "Do not create English PNGs or an English Notebook."
    - "Do not imply correlation is causation or introduce inference/modeling/cleaning execution."
---

<objective>
Create the final four English Markdown authorities, including complete visual interpretation and report limitations.

Purpose: Finish R1 parity and R8 fallback semantics for the visualization half of the course.
Output: Four paired English master files.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-implementation-context.md
@docs/superpowers/specs/2026-07-14-python-data-tools-stage-3-notebook-assets-design.md
@src/data/pythonNotebookContract.ts
@src/modules/ai-overview/components/OverviewMediaFigure.vue
</context>

<tasks>
<task type="auto">
  <name>Task 1: Author English Matplotlib and Seaborn chapters</name>
  <files>docs/curriculum-v3/python-data-tools/english-master/05-matplotlib-visualization.md, docs/curriculum-v3/python-data-tools/english-master/06-seaborn-statistics.md</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/05-matplotlib-visualization.md
    - docs/curriculum-v3/python-data-tools/chinese-master/06-seaborn-statistics.md
    - src/modules/ai-overview/components/OverviewMediaFigure.vue
    - tests/python-data-tools-notebook-assets.test.ts
  </read_first>
  <action>Per D-03/D-06/D-08, translate the full teaching flow while preserving code/formulas/markers, result-presentation markers/fields, and the three PNG bindings. Add natural English titles, accessibility descriptions, Chinese axis/legend translations, interpretations, limitations, and fallback summaries without creating replacement assets or copied statistics. Keep learner-visible headings and prose in natural teaching language rather than internal manifest/output/evidence terminology; parser-excluded code, IDs, JSON fields, and internal symbols remain byte-identical. Preserve chart-integrity, sample-size, covariance/Pearson, non-causal limitations, and both static prompts, then perform a semantic prose review against the Chinese blocks. Plan 05 runs the paired signature preflight after all eight files exist.</action>
  <acceptance_criteria>Both files are complete paired masters and provide accessible English interpretation for the unchanged authoritative PNGs.</acceptance_criteria>
  <verify><automated>node --input-type=module -e "import{readFileSync}from'node:fs';for(const f of ['05-matplotlib-visualization.md','06-seaborn-statistics.md']){const s=readFileSync('docs/curriculum-v3/python-data-tools/english-master/'+f,'utf8');if(!s.trim()||/TODO|TBD|PLACEHOLDER|�/.test(s))throw new Error(f+' is incomplete')}"</automated></verify>
  <done>English chapters 5–6 preserve exact visual/output structure and statistical boundaries.</done>
</task>
<task type="auto">
  <name>Task 2: Author English Plotly and final-report chapters</name>
  <files>docs/curriculum-v3/python-data-tools/english-master/07-plotly-exploration.md, docs/curriculum-v3/python-data-tools/english-master/08-analysis-report.md</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/07-plotly-exploration.md
    - docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
    - public/notebooks/python-data-tools/outputs/manifest.json
    - public/notebooks/python-data-tools/outputs/final-analysis-evidence.json
  </read_first>
  <action>Complete chapters 7–8 with exact Plotly/internal-output signatures, current-filter/static-fallback semantics, paired result-presentation fields, the chapter-7 static prompt, reproducibility explanation, five analysis dimensions, explicit “correlation does not imply causation” limitation, and `/data-lab` handoff. Normalize every learner-visible internal term to natural teaching English while preserving paired code identifiers and JSON keys exactly. Keep all precise values sourced from the bound results rather than duplicating them in new runtime constants, and perform a full semantic prose review after the automated preflight.</action>
  <acceptance_criteria>Both files contain full teaching prose, exact stable signatures, limitations, and the Data Lab handoff, with no model/causal/inference/browser-execution expansion.</acceptance_criteria>
  <verify><automated>node --input-type=module -e "import{readFileSync}from'node:fs';for(const f of ['05-matplotlib-visualization.md','06-seaborn-statistics.md','07-plotly-exploration.md','08-analysis-report.md']){const s=readFileSync('docs/curriculum-v3/python-data-tools/english-master/'+f,'utf8');if(!s.trim()||/TODO|TBD|PLACEHOLDER|�/.test(s))throw new Error(f+' is incomplete')}" &amp;&amp; git diff --check</automated></verify>
  <done>English chapters 7–8 complete the paired course and final-report boundary.</done>
</task>
</tasks>

## Artifacts this phase produces

- `english-master/05-matplotlib-visualization.md` through `08-analysis-report.md` as editable English authorities.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-05 | Tampering | Visual interpretation | medium | mitigate | Bind prose to existing output IDs and later compiler/adapter checks; do not copy numeric payloads. |
| T-PDT4-06 | Repudiation | Causal claims | low | accept | Static content is source-reviewed and tests enforce the explicit non-causal guardrail. |
</threat_model>

<verification>Run the non-empty/placeholder scan, semantically review every English prose/result/prompt block against the Chinese teaching intent, and scan for prohibited scope. As the Wave 3 validation owner, after Plan 04 completes run `node --test tests/python-data-tools-*.test.ts`, `npm test`, and `git diff --check`; Plan 05 performs the complete paired signature preflight.</verification>
<success_criteria>All eight English master chapters now exist with semantic and structural parity.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-04-SUMMARY.md` when done.</output>
