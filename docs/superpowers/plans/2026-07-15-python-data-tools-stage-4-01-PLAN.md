---
phase: python-data-tools-stage-4
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/curriculum-v3/python-data-tools/chinese-master/01-notebook-workflow.md
  - docs/curriculum-v3/python-data-tools/chinese-master/02-numpy-foundations.md
  - docs/curriculum-v3/python-data-tools/chinese-master/03-pandas-structures.md
  - docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md
  - docs/curriculum-v3/python-data-tools/chinese-master/README.md
  - tests/python-data-tools-chinese-master.test.ts
autonomous: true
requirements: [R1, R5, R7, R8]
must_haves:
  truths:
    - "D-03: chapters 1–4 use learner-facing Chinese labels such as 运行结果、图表解读、分析发现、需要注意 outside code/markers/internal identifiers."
    - "D-08: every chapters 1–4 contract output has one complete master-authored result-presentation section."
    - "D-14/D-15: chapter 2 and chapter 4 pauses are static teaching prompts with immediately visible reference reasoning and no interaction."
  artifacts:
    - path: docs/curriculum-v3/python-data-tools/chinese-master/01-notebook-workflow.md
      provides: "Normalized Chinese authority for notebook workflow"
    - path: docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md
      provides: "Normalized Chinese authority through grouped analysis"
    - path: tests/python-data-tools-chinese-master.test.ts
      provides: "Source-authority, result-presentation, and static-prompt checks for chapters 1–4"
  key_links:
    - from: docs/curriculum-v3/python-data-tools/chinese-master/01-notebook-workflow.md
      to: src/data/pythonNotebookContract.ts
      via: "chapter/cell/output IDs and order remain contract-bound"
    - from: tests/python-data-tools-chinese-master.test.ts
      to: docs/curriculum-v3/python-data-tools/chinese-master
      via: "parser-aware visible-prose checks exclude only code, markers, JSON fields, and internal symbols"
  prohibitions:
    - "Do not alter Python bytes, formulas, IDs, numeric statements, or Stage 3 output bindings."
    - "Do not add prompt input, answer selection, submit, scoring, reset, state, storage, network, or chapter gating."
---

<objective>
Normalize Chinese authority chapters 1–4 and establish their result-presentation and static-prompt structures without changing the executed Notebook contract.

Purpose: Keep the first half of the Chinese source review small enough for exact prose/code auditing.
Output: Four normalized Chinese masters, complete result-presentation sections, two static prompts, README grammar, and focused source tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-runtime-parity-spec.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-implementation-context.md
@docs/superpowers/specs/2026-07-14-python-data-tools-stage-2-chinese-master-design.md
@src/data/pythonNotebookContract.ts
@scripts/python-data-tools/build-notebook.py
@tests/python-data-tools-chinese-master.test.ts
</context>

<tasks>
<task type="auto">
  <name>Task 1: Normalize chapters 1–4 learner prose and result presentation</name>
  <files>docs/curriculum-v3/python-data-tools/chinese-master/01-notebook-workflow.md, docs/curriculum-v3/python-data-tools/chinese-master/02-numpy-foundations.md, docs/curriculum-v3/python-data-tools/chinese-master/03-pandas-structures.md, docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md, tests/python-data-tools-chinese-master.test.ts</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/01-notebook-workflow.md
    - docs/curriculum-v3/python-data-tools/chinese-master/02-numpy-foundations.md
    - docs/curriculum-v3/python-data-tools/chinese-master/03-pandas-structures.md
    - docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md
    - src/data/pythonNotebookContract.ts
    - tests/python-data-tools-chinese-master.test.ts
  </read_first>
  <action>Implement D-03/D-08 across chapters 1–4. Replace learner-visible internal vocabulary with the approved teaching labels while preserving fenced Python, HTML markers, output IDs, JSON keys such as `evidence`, variable names, formulas, and exact numeric statements byte-for-byte. Adjacent to each bound output, author one deterministic `result-presentation` section with title, accessibility description/alt, explicit axis-and-legend translations (an explicit empty list for nonvisual JSON), interpretation, limitation, and fallback summary. Extend parser-aware tests for these four chapters and prove Stage 3 cell/output bindings remain unchanged.</action>
  <acceptance_criteria>Chapters 1–4 have normalized visible wording and one complete result-presentation section per owned output; code and bindings are unchanged.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-chinese-master.test.ts tests/python-data-tools-notebook-assets.test.ts</automated></verify>
  <done>The first four Chinese masters are authoritative, presentation-complete, and Notebook-safe.</done>
</task>

<task type="auto">
  <name>Task 2: Convert chapter 2 and 4 pauses and document the shared grammar</name>
  <files>docs/curriculum-v3/python-data-tools/chinese-master/02-numpy-foundations.md, docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md, docs/curriculum-v3/python-data-tools/chinese-master/README.md, tests/python-data-tools-chinese-master.test.ts</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/02-numpy-foundations.md
    - docs/curriculum-v3/python-data-tools/chinese-master/04-pandas-analysis.md
    - docs/curriculum-v3/python-data-tools/chinese-master/README.md
    - src/data/pythonNotebookContract.ts
  </read_first>
  <action>Per D-14/D-15, convert the NumPy and pandas-analysis marked pauses to “想一想 → 参考思路 → 常见误区 → 复看”. Update README with the complete shared prompt/result-presentation grammar that Plan 02 will apply to chapters 5–8. Require the contract prompt ID/kind/chapter, all localized fields, and the four false policy flags; tests reject interaction, persistence, model training, cleaning implementation, inference, and causal claims.</action>
  <acceptance_criteria>Both first-half prompts are complete, immediately explained, ordered, and stateless; the README defines the same grammar for all eight masters.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-chinese-master.test.ts && git diff --check</automated></verify>
  <done>Chapters 1–4 and the authoring contract express teaching-first static pauses.</done>
</task>
</tasks>

## Artifacts this phase produces

- Normalized Chinese chapters 1–4 with their contract-owned result-presentation sections.
- Static `shape-index` and `filter-groupby` prompts.
- Shared README grammar and parser-aware tests.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-01 | Tampering | Chinese masters 1–4 | medium | mitigate | Preserve and test markers, code bytes, output IDs, formulas, numbers, and R7 boundaries. |
</threat_model>

<verification>Run the focused source/asset tests and `git diff --check`; inspect the four Python fences for zero byte drift. Wave 1 post-wave ownership is assigned to Plan 10 after Plans 01, 06, and 10 are complete.</verification>
<success_criteria>Chapters 1–4 are normalized and complete without changing executable or output contracts.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-01-SUMMARY.md` when done.</output>
