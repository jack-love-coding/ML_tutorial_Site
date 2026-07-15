---
phase: python-data-tools-stage-4
plan: "03"
type: execute
wave: 2
depends_on: ["01"]
files_modified:
  - docs/curriculum-v3/python-data-tools/english-master/01-notebook-workflow.md
  - docs/curriculum-v3/python-data-tools/english-master/02-numpy-foundations.md
  - docs/curriculum-v3/python-data-tools/english-master/03-pandas-structures.md
  - docs/curriculum-v3/python-data-tools/english-master/04-pandas-analysis.md
autonomous: true
requirements: [R1, R5, R7, R8]
must_haves:
  truths:
    - "D-05/D-06: chapters 1–4 have natural English teaching prose with exact structural, formula, code, variable, number, and binding parity."
    - "D-03/D-08: English learner-visible prose uses natural teaching labels and supplies paired result-presentation fields without exposing internal implementation terms."
    - "D-14/D-15: English static prompts in chapters 2 and 4 mirror the Chinese teaching-prompt shape without interaction."
  artifacts:
    - path: docs/curriculum-v3/python-data-tools/english-master/01-notebook-workflow.md
      provides: "English authority for chapter 1"
    - path: docs/curriculum-v3/python-data-tools/english-master/04-pandas-analysis.md
      provides: "English authority through grouped analysis"
  key_links:
    - from: docs/curriculum-v3/python-data-tools/english-master
      to: docs/curriculum-v3/python-data-tools/chinese-master
      via: "one-to-one filenames and stable marker/code signatures"
    - from: docs/curriculum-v3/python-data-tools/english-master
      to: docs/curriculum-v3/python-data-tools/chinese-master
      via: "matching filenames and stable markers prepared for the full Plan 05 paired-master preflight"
  prohibitions:
    - "Do not summarize or literally translate at the expense of complete teaching meaning."
    - "Do not alter Python code, formulas, variables, exact numbers, output IDs, or prompt IDs."
---

<objective>
Create the first four English Markdown authorities with exact semantic/structural parity.

Purpose: Deliver full bilingual teaching content rather than title-only localization.
Output: Four paired English master files.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-implementation-context.md
@docs/curriculum-v3/python-data-tools/chinese-master/README.md
@src/data/pythonNotebookContract.ts
@scripts/generateMathToCodeRuntimeContent.mjs
</context>

<tasks>
<task type="auto">
  <name>Task 1: Author English Notebook and NumPy chapters</name>
  <files>docs/curriculum-v3/python-data-tools/english-master/01-notebook-workflow.md, docs/curriculum-v3/python-data-tools/english-master/02-numpy-foundations.md</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/01-notebook-workflow.md
    - docs/curriculum-v3/python-data-tools/chinese-master/02-numpy-foundations.md
    - scripts/generateMathToCodeRuntimeContent.mjs
    - tests/math-to-code-semantic-parity.test.ts
  </read_first>
  <action>Implement R1 per D-03/D-05/D-06/D-08 by creating matching English files as complete, natural teaching prose. Preserve heading/block order, all HTML markers, Python fences byte-for-byte, formulas, variable meanings, exact numerical statements, output bindings, result-presentation shape, and the chapter-2 static prompt shape. Use natural labels such as Runtime result, Chart reading, Analysis finding, and Keep in mind in visible prose; internal manifest/output/evidence terms may remain only inside paired code, markers, JSON fields, IDs, or explicitly formatted internal symbols. Translate every result title, accessibility description, applicable axis/legend labels, interpretation, limitation, fallback summary, and Data Lab boundary. Perform a semantic prose review against each Chinese block; Plan 05 runs the paired-master preflight only after all eight English files exist. Do not reduce any teaching block to a title or summary.</action>
  <acceptance_criteria>Both files are non-empty UTF-8, contain no TODO/placeholder/mojibake, and have the same stable marker/code/formula sequence as their Chinese pair.</acceptance_criteria>
  <verify><automated>node --input-type=module -e "import{readFileSync}from'node:fs';for(const f of ['01-notebook-workflow.md','02-numpy-foundations.md']){const s=readFileSync('docs/curriculum-v3/python-data-tools/english-master/'+f,'utf8');if(!s.trim()||/TODO|TBD|PLACEHOLDER|�/.test(s))throw new Error(f+' is incomplete')}"</automated></verify>
  <done>English chapters 1–2 are complete paired masters, including the static NumPy prompt.</done>
</task>
<task type="auto">
  <name>Task 2: Author English pandas structure and analysis chapters</name>
  <files>docs/curriculum-v3/python-data-tools/english-master/03-pandas-structures.md, docs/curriculum-v3/python-data-tools/english-master/04-pandas-analysis.md</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/03-pandas-structures.md
    - docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md
    - src/data/pythonNotebookContract.ts
    - scripts/python-data-tools/build-notebook.py
  </read_first>
  <action>Apply the same D-03/D-05/D-06/D-08 paired-master and result-presentation rules to chapters 3–4. Preserve `dataset-shape-schema` and `workingday-comparison` ownership, grouping terminology, sample-count/aggregation limitations, and the chapter-4 static prompt. Complete a natural-English semantic review against the Chinese blocks; defer the complete paired signature gate to Plan 05 after chapters 5–8 also exist. Do not introduce cleaning steps, model content, or learner-facing internal implementation vocabulary.</action>
  <acceptance_criteria>Chapters 3–4 fully explain every visible teaching block and maintain exact marker/code/formula/output signatures.</acceptance_criteria>
  <verify><automated>node --input-type=module -e "import{readFileSync}from'node:fs';for(const f of ['01-notebook-workflow.md','02-numpy-foundations.md','03-pandas-structures.md','04-pandas-analysis.md']){const s=readFileSync('docs/curriculum-v3/python-data-tools/english-master/'+f,'utf8');if(!s.trim()||/TODO|TBD|PLACEHOLDER|�/.test(s))throw new Error(f+' is incomplete')}" &amp;&amp; git diff --check</automated></verify>
  <done>English chapters 3–4 are complete and respect the descriptive-analysis boundary.</done>
</task>
</tasks>

## Artifacts this phase produces

- `english-master/01-notebook-workflow.md` through `04-pandas-analysis.md` as editable English authorities.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-03 | Tampering | Paired masters | medium | mitigate | Preserve exact stable signatures and later enforce them with compiler tests. |
| T-PDT4-04 | Information disclosure | Course Markdown | low | accept | Static public educational content contains no secrets or user data. |
</threat_model>

<verification>After both tasks, run the non-empty/placeholder scan and semantically review every English prose/result/prompt block against its Chinese teaching intent. As the Wave 2 validation owner, after Plans 02 and 03 complete run `node --test tests/python-data-tools-*.test.ts`, `npm test`, and `git diff --check`; Plan 05 performs the paired signature preflight after all eight files exist.</verification>
<success_criteria>Four complete English chapters exist and no executable or output contract has drifted.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-03-SUMMARY.md` when done.</output>
