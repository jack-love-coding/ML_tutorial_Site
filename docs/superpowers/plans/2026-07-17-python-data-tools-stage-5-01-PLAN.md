---
phase: python-data-tools-stage-5
plan: "01"
type: execute
wave: 1
depends_on: []
files_modified:
  - docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
  - docs/curriculum-v3/python-data-tools/english-master/08-analysis-report.md
  - scripts/python-data-tools/build-notebook.py
  - scripts/python-data-tools/generate-authoritative-outputs.py
  - public/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb
  - public/notebooks/python-data-tools/outputs/final-analysis-evidence.json
  - public/notebooks/python-data-tools/outputs/manifest.json
  - src/components/PythonDataToolsPagedLesson.vue
  - src/data/generated/pythonDataToolsRuntime.generated.ts
  - tests/python-data-tools-chinese-master.test.ts
  - tests/python-data-tools-notebook-assets.test.ts
  - tests/python-data-tools-paired-master-preflight.test.ts
  - tests/python-data-tools-runtime-content.test.ts
  - tests/python-data-tools-runtime-page.test.ts
autonomous: true
requirements: [S5-R1, S5-R2, S5-R3]
must_haves:
  truths:
    - "Learner-visible prose, code, code headers, raw JSON, and browser text use analysis/data-basis/result terminology instead of evidence/证据, manifest/output implementation labels, or authoring IDs."
    - "The paired masters remain code-byte aligned, the runtime projection is regenerated, and the executed Notebook/output manifest are regenerated from the same source."
    - "Internal `final-analysis-evidence` identity remains stable but is not exposed as a learner label."
  artifacts:
    - path: docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
      provides: "Authoritative neutral analysis-record code and report template"
    - path: public/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb
      provides: "Re-executed Notebook with matching visible code"
    - path: public/notebooks/python-data-tools/outputs/manifest.json
      provides: "Updated hashes after deterministic regeneration"
  key_links:
    - from: docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
      to: src/data/generated/pythonDataToolsRuntime.generated.ts
      via: scripts/python-data-tools/build-runtime-content.mjs
    - from: docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
      to: public/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb
      via: scripts/python-data-tools/build-notebook.py and clean-kernel execution
    - from: public/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb
      to: public/notebooks/python-data-tools/outputs/final-analysis-evidence.json
      via: scripts/python-data-tools/generate-authoritative-outputs.py
  prohibitions:
    - statement: "Do not rename the `final-analysis-evidence` contract/output ID or public path."
      status: resolved
      verification: "Exact contract and manifest identity tests."
    - statement: "Do not hand-edit generated runtime, Notebook, output JSON, or manifest as the primary fix."
      status: resolved
      verification: "Regeneration and `--check`/hash verification."
    - statement: "Do not weaken visible-terminology tests by excluding fenced code or raw JSON."
      status: resolved
      verification: "Master code assertions plus Stage 5 DOM scan in Plan 03."
---

<objective>
Remove the remaining learner-visible evidence terminology and regenerate every affected artifact from the authoritative masters.

Purpose: Close the only known Stage 4 content-language mismatch before any final consistency or browser record is captured.
Output: Neutral analysis-record code, regenerated runtime/Notebook/output manifest, and exact regression tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-17-python-data-tools-stage-5-consistency-validation-spec.md
@docs/superpowers/specs/2026-07-14-python-data-tools-stage-3-notebook-assets-design.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-implementation-context.md
@docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-validation.md
</context>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Lock the learner-visible terminology migration</name>
  <files>tests/python-data-tools-chinese-master.test.ts, tests/python-data-tools-paired-master-preflight.test.ts, tests/python-data-tools-runtime-content.test.ts, tests/python-data-tools-runtime-page.test.ts</files>
  <read_first>
    - tests/python-data-tools-chinese-master.test.ts
    - tests/python-data-tools-paired-master-preflight.test.ts
    - tests/python-data-tools-runtime-content.test.ts
    - tests/python-data-tools-runtime-page.test.ts
    - docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
    - docs/curriculum-v3/python-data-tools/english-master/08-analysis-report.md
    - src/components/PythonDataToolsPagedLesson.vue
  </read_first>
  <action>Add RED assertions that both chapter-08 code copies use `analysis_register`, `result_id`, `season_summary`, `weather_summary`, `final_analysis_record`, `source_results`, the JSON key `analysis_summary`, and the report sequence “观察 / 数据依据 / 解释 / 限制”. Reject `evidence_register`, `output_id`, `season_evidence`, `weather_evidence`, `final_analysis_evidence`, `source_outputs`, a JSON key named `evidence`, and the Chinese string “证据” in every visible code cell. Assert the page code header no longer renders `block.id`, while internal result/output IDs remain legal in authoring comments, types, contract and manifest.</action>
  <acceptance_criteria>The focused tests fail on the current chapter-08 code and visible code-header ID, while continuing to permit the unchanged internal `final-analysis-evidence` identity outside learner-visible DOM.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-chinese-master.test.ts tests/python-data-tools-paired-master-preflight.test.ts tests/python-data-tools-runtime-content.test.ts tests/python-data-tools-runtime-page.test.ts</automated></verify>
  <done>The terminology target is executable and cannot be satisfied by hiding only prose.</done>
</task>

<task type="auto">
  <name>Task 2: Apply the paired-master and page presentation migration</name>
  <files>docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md, docs/curriculum-v3/python-data-tools/english-master/08-analysis-report.md, src/components/PythonDataToolsPagedLesson.vue, src/data/generated/pythonDataToolsRuntime.generated.ts</files>
  <read_first>
    - docs/curriculum-v3/python-data-tools/chinese-master/08-analysis-report.md
    - docs/curriculum-v3/python-data-tools/english-master/08-analysis-report.md
    - scripts/python-data-tools/check-paired-masters.mjs
    - scripts/python-data-tools/build-runtime-content.mjs
    - src/components/PythonDataToolsPagedLesson.vue
  </read_first>
  <action>Rename only learner-visible chapter-08 Python variables and JSON/report fields to the exact Task 1 target in both masters, keeping Python code bytes identical across locales. Do not rename output markers or `final-analysis-evidence`. Remove the `<code>{{ block.id }}</code>` authoring identifier from the course-code header without replacing it with another internal label. Regenerate `src/data/generated/pythonDataToolsRuntime.generated.ts` with the existing compiler.</action>
  <acceptance_criteria>Both masters pass paired preflight; generated runtime contains the new identifiers and no retired visible identifiers; the code header contains only localized course-code copy.</acceptance_criteria>
  <verify><automated>node scripts/python-data-tools/check-paired-masters.mjs &amp;&amp; node scripts/python-data-tools/build-runtime-content.mjs &amp;&amp; node scripts/python-data-tools/build-runtime-content.mjs --check &amp;&amp; node --test tests/python-data-tools-chinese-master.test.ts tests/python-data-tools-paired-master-preflight.test.ts tests/python-data-tools-runtime-content.test.ts tests/python-data-tools-runtime-page.test.ts</automated></verify>
  <done>Paired authoring sources and runtime projection use the approved learner language.</done>
</task>

<task type="auto">
  <name>Task 3: Regenerate and verify the executed Notebook and output chain</name>
  <files>scripts/python-data-tools/build-notebook.py, scripts/python-data-tools/generate-authoritative-outputs.py, public/notebooks/python-data-tools/python-data-tools-bike-sharing.zh-CN.ipynb, public/notebooks/python-data-tools/outputs/final-analysis-evidence.json, public/notebooks/python-data-tools/outputs/manifest.json, tests/python-data-tools-notebook-assets.test.ts</files>
  <read_first>
    - scripts/python-data-tools/build-notebook.py
    - scripts/python-data-tools/generate-authoritative-outputs.py
    - scripts/python-data-tools/verify-authoritative-outputs.py
    - public/notebooks/python-data-tools/requirements.txt
    - public/notebooks/python-data-tools/environment.json
    - tests/python-data-tools-notebook-assets.test.ts
  </read_first>
  <action>Update generator-side variable references and final JSON schema to `final_analysis_record`/`analysis_summary` while retaining the output ID and filename. Use only `.python-data-tools-venv` after exact environment validation. Rebuild the Notebook from the Chinese master, execute it from a clean kernel, publish the affected output and manifest atomically, then run the existing authoritative verifier. Add assertions for the new JSON field and absence of the retired visible field; do not manually edit serialized Notebook cells or manifest hashes.</action>
  <acceptance_criteria>The executed Notebook contains the new visible code; final JSON has `analysis_summary` and no `evidence`; manifest hashes match current files; all eight outputs still validate.</acceptance_criteria>
  <verify><automated>.python-data-tools-venv/bin/python scripts/python-data-tools/generate-authoritative-outputs.py &amp;&amp; .python-data-tools-venv/bin/python scripts/python-data-tools/verify-authoritative-outputs.py &amp;&amp; node scripts/python-data-tools/verify-bike-sharing.mjs &amp;&amp; node --test tests/python-data-tools-notebook-assets.test.ts tests/python-data-tools-runtime-content.test.ts</automated></verify>
  <done>The terminology change is propagated through the complete authoritative asset chain.</done>
</task>
</tasks>

## Artifacts this phase produces

- Neutral learner-visible chapter-08 identifiers: `analysis_register`, `result_id`, `season_summary`, `weather_summary`, `final_analysis_record`, `source_results`, `analysis_summary`.
- Re-executed `python-data-tools-bike-sharing.zh-CN.ipynb` and updated final JSON/manifest hashes.
- A course-code header that does not expose authoring block IDs.
- Regression assertions distinguishing visible vocabulary from stable internal output IDs.

<verification>Run paired preflight, runtime compiler check, dataset verifier, authoritative-output verifier, all focused content/notebook/page tests, and `git diff --check`. Inspect the diff to ensure no output ID or route identity changed.</verification>
<success_criteria>
- No learner-visible chapter-08 code or raw JSON uses evidence/证据 vocabulary.
- All paired/runtime/Notebook/output identities remain synchronized and verified.
- The stable internal output ID and public filename remain unchanged.
</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-01-SUMMARY.md` when done.</output>
