---
phase: python-data-tools-stage-4
plan: "05"
type: execute
wave: 4
depends_on: ["02", "03", "04"]
files_modified:
  - scripts/python-data-tools/check-paired-masters.mjs
  - tests/python-data-tools-paired-master-preflight.test.ts
  - src/types/pythonDataToolsRuntime.ts
  - scripts/python-data-tools/build-runtime-content.mjs
  - src/data/generated/pythonDataToolsRuntime.generated.ts
  - tests/python-data-tools-runtime-content.test.ts
  - tests/python-data-tools-runtime-prompts.test.ts
autonomous: true
requirements: [R1, R2, R5, R7, R8]
must_haves:
  truths:
    - "D-05/D-06/D-09: paired masters are the only editable body sources and generated runtime content is deterministic and drift-checked."
    - "The compiler rejects empty locale/block content, mojibake, duplicate IDs, changed code/formulas/output bindings, and scope violations."
    - "D-14/D-15 prompt projections are typed, complete, static, and ordered by the contract."
    - "D-03/D-08: generated result-presentation blocks carry localized title, alt, axis/legend translations, interpretation, limitation, and fallback summary from masters; runtime files contain no handwritten learner-copy registry."
  artifacts:
    - path: scripts/python-data-tools/check-paired-masters.mjs
      provides: "Complete eight-pair read-only authoring preflight"
    - path: src/types/pythonDataToolsRuntime.ts
      provides: "Discriminated runtime chapter/block/prompt contracts"
      exports: ["PythonDataToolsRuntimeChapter", "PythonDataToolsRuntimeBlock", "PythonDataToolsTeachingPromptBlock", "PythonDataToolsResultPresentationBlock"]
    - path: scripts/python-data-tools/build-runtime-content.mjs
      provides: "Paired-master deterministic compiler and --check mode"
    - path: src/data/generated/pythonDataToolsRuntime.generated.ts
      provides: "Read-only eight-chapter runtime projection"
  key_links:
    - from: scripts/python-data-tools/build-runtime-content.mjs
      to: src/data/pythonNotebookContract.ts
      via: "contract-derived chapter, prompt, and output order"
    - from: docs/curriculum-v3/python-data-tools/english-master
      to: src/data/generated/pythonDataToolsRuntime.generated.ts
      via: "deterministic generation; never manual edits"
    - from: src/data/generated/pythonDataToolsRuntime.generated.ts
      to: src/components/PythonDataToolsPagedLesson.vue
      via: "typed result-presentation blocks later pass unchanged by output ID to ResultBlock/Plotly"
  prohibitions:
    - "Do not place a second Chinese body, learner-facing result copy registry, exact Stage 3 values, or public output paths in Vue/handwritten TypeScript."
    - "Do not project executable HTML, interactive prompt state, model training, cleaning, inference, causality, Pyodide, backend, or upload behavior."
---

<objective>
Compile the paired Markdown authorities into a typed, deterministic runtime projection with strict parity and boundary tests.

Purpose: Make content drift and hidden duplicate sources impossible to merge silently.
Output: Runtime types, compiler, generated projection, and content/prompt tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-patterns.md
@src/data/pythonNotebookContract.ts
@scripts/generateMathToCodeRuntimeContent.mjs
@scripts/python-data-tools/build-notebook.py
@tests/math-to-code-semantic-parity.test.ts
@tests/python-data-tools-chinese-master.test.ts
</context>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Build and run the complete paired-master preflight</name>
  <files>scripts/python-data-tools/check-paired-masters.mjs, tests/python-data-tools-paired-master-preflight.test.ts</files>
  <read_first>
    - scripts/generateMathToCodeRuntimeContent.mjs
    - scripts/python-data-tools/build-notebook.py
    - tests/math-to-code-semantic-parity.test.ts
    - docs/curriculum-v3/python-data-tools/chinese-master/README.md
  </read_first>
  <behavior>
    - All eight Chinese/English filename pairs match chapter number/ID and decode as UTF-8 without mojibake or placeholders.
    - Cell, prompt, and result-presentation markers; code bytes; formulas; exact numeric statements; output bindings; and field shapes match in order.
    - Diagnostics name locale, file, chapter, marker, and first mismatch while leaving every source file unchanged.
  </behavior>
  <action>Only after Plans 01–04 have completed, implement the read-only full-course preflight modeled on the Math-to-Code paired parser and Notebook marker grammar. It must validate all eight pairs together; do not offer selected-chapter authoring mode that lets an incomplete course be treated as ready. Write temporary-fixture tests for missing/renamed files, reordered markers, changed Python/formulas/output IDs, incomplete prompt/result-presentation fields, invalid UTF-8/mojibake/placeholders, and learner-visible internal terminology. The checker never generates runtime output or edits a master.</action>
  <acceptance_criteria>The full eight-pair check succeeds only after both Chinese groups and both English groups are complete, and every malformed fixture fails for its named reason.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-paired-master-preflight.test.ts &amp;&amp; node scripts/python-data-tools/check-paired-masters.mjs</automated></verify>
  <done>The complete paired authorities pass one read-only structural and visible-prose gate.</done>
</task>
<task type="auto" tdd="true">
  <name>Task 2: Define runtime contracts and failing paired-compiler behaviors</name>
  <files>src/types/pythonDataToolsRuntime.ts, tests/python-data-tools-runtime-content.test.ts, tests/python-data-tools-runtime-prompts.test.ts</files>
  <read_first>
    - src/data/pythonNotebookContract.ts
    - src/types/ml.ts
    - tests/math-to-code-semantic-parity.test.ts
    - tests/python-data-tools-chinese-master.test.ts
  </read_first>
  <behavior>
    - Eight paired chapters in contract order compile to localized blocks with byte-identical code and equivalent formula/output signatures.
    - Missing locale/block, duplicate chapter/cell/output/prompt, mojibake, placeholder text, or reordered markers fails with file/chapter/marker diagnostics.
    - Exactly five prompts expose localized question/referenceReasoning/misconception/revisit and the four false policy flags.
    - Exactly eight result-presentation blocks expose localized title/alt/axisLegendTranslations/interpretation/limitation/fallbackSummary and are keyed to their contract result.
    - Parser-aware D-03 checks reject internal learner-visible terminology while allowing paired code, markers, JSON fields, IDs, and internal symbols.
  </behavior>
  <action>Write the public discriminated unions and RED tests first. `PythonDataToolsResultPresentationBlock` must carry output ID plus localized title, alt/accessibility description, axis/legend translation rows, full interpretation, limitation, and fallback summary; JSON may have an explicit empty translation array, while PNG/Plotly require populated translations. Use repository `LocalizedCopy`, chapter/result/prompt unions, and safe Markdown-string boundaries. Add named failing assertions `paired compiler implementation is missing` and `generated result presentation projection is missing`; fixture seams use temporary roots/targets and never mutate committed masters or generated output.</action>
  <acceptance_criteria>The diagnostic harness observes a nonzero test run containing both exact missing-implementation diagnostics, with no syntax, fixture, module-resolution, or unrelated failure.</acceptance_criteria>
  <verify><automated>node --input-type=module -e "import{spawnSync}from'node:child_process';const r=spawnSync(process.execPath,['--test','tests/python-data-tools-runtime-content.test.ts','tests/python-data-tools-runtime-prompts.test.ts'],{encoding:'utf8'});const log=(r.stdout||'')+(r.stderr||'');if(r.status===0||!log.includes('paired compiler implementation is missing')||!log.includes('generated result presentation projection is missing')){process.stderr.write(log);process.exit(1)}"</automated></verify>
  <done>Typed interfaces and behavior-first parity/prompt tests define R1/R5/R7/R8 precisely.</done>
</task>
<task type="auto" tdd="true">
  <name>Task 3: Implement deterministic paired-master compilation and check mode</name>
  <files>scripts/python-data-tools/build-runtime-content.mjs, src/data/generated/pythonDataToolsRuntime.generated.ts</files>
  <read_first>
    - scripts/generateMathToCodeRuntimeContent.mjs
    - scripts/python-data-tools/build-notebook.py
    - docs/curriculum-v3/python-data-tools/chinese-master/README.md
    - src/types/pythonDataToolsRuntime.ts
  </read_first>
  <action>Implement parse/validate/serialize using the exact `generateMathToCodeRuntimeContent.mjs` generate-versus-`--check` pattern, the early preflight grammar, and the Python Notebook marker grammar. Derive chapter/result/prompt order from the contract; deterministically parse paired master result-presentation sections into `PythonDataToolsResultPresentationBlock` rather than creating a handwritten TS/Vue copy registry. Compare block kind, cell ID/role, Python bytes, formula sequence, numeric statements, output IDs, result-presentation field shape, and prompt structure across locales. Serialize stable UTF-8 LF output with a generated-file header. `--check` is read-only and reports the first drift; source-ownership tests scan handwritten runtime files to reject learner copy, precise values, and output paths.</action>
  <acceptance_criteria>Normal generation creates the eight-chapter projection; repeated generation is byte-identical; `--check` succeeds on current sources and fails read-only on stale/malformed fixtures.</acceptance_criteria>
  <verify><automated>node scripts/python-data-tools/build-runtime-content.mjs --check && node --test tests/python-data-tools-runtime-content.test.ts tests/python-data-tools-runtime-prompts.test.ts</automated></verify>
  <done>The paired compiler is GREEN, deterministic, diagnostic, and source-authority safe.</done>
</task>
</tasks>

## Artifacts this phase produces

- `PythonDataToolsRuntimeBlock`, `PythonDataToolsTeachingPromptBlock`, `PythonDataToolsResultPresentationBlock`, and `PythonDataToolsRuntimeChapter`.
- `build-runtime-content.mjs` generate/`--check` commands.
- `pythonDataToolsRuntimeChapters` (or equivalently named) generated projection.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-07 | Tampering | Generated projection | medium | mitigate | Deterministic regeneration, read-only `--check`, generated header, structural parity tests. |
| T-PDT4-08 | Elevation of privilege | Markdown content | medium | mitigate | Projection remains inert strings consumed later only by the existing sanitized renderer. |
</threat_model>

<verification>As the Wave 4 validation owner, after Plan 05 completes run the full paired preflight, both focused compiler tests, compiler `--check`, `node --test tests/python-data-tools-*.test.ts`, `npm test`, and `git diff --check`.</verification>
<success_criteria>Eight paired chapters and five prompts compile deterministically; every negative fixture fails for the intended reason.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-05-SUMMARY.md` when done.</output>
