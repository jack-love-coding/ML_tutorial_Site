---
phase: python-data-tools-stage-4
plan: "06"
type: execute
wave: 1
depends_on: []
files_modified: []
autonomous: false
requirements: [R4, R8]
must_haves:
  truths:
    - "No dependency installation occurs before explicit human approval of `plotly.js-basic-dist-min@3.7.0`."
    - "The SUS classification is resolved using official registry/repository facts rather than assumed safe."
  artifacts:
    - path: package.json
      provides: "Unchanged during this checkpoint plan; dependency installation is deferred to Plan 07"
  key_links:
    - from: "npm registry metadata"
      to: "Plan 07 installation task"
      via: "blocking approval signal"
  prohibitions:
    - "Do not install, lock, import, or substitute Plotly packages before approval."
---

<objective>
Resolve the required package-legitimacy gate before any Plotly dependency mutation.

Purpose: Enforce the SUS supply-chain checkpoint identified by research.
Output: A recorded explicit approval or a blocked execution requiring replanning.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-research.md
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-validation.md
@package.json
@package-lock.json
</context>

<tasks>
<task type="auto">
  <name>Task 1: Re-run the read-only Plotly package legitimacy audit</name>
  <files>None (read-only audit)</files>
  <read_first>
    - docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-research.md
    - package.json
    - public/notebooks/python-data-tools/outputs/plotly-hourly-explorer.plotly.json
  </read_first>
  <action>Read only: query npm metadata for `plotly.js-basic-dist-min@3.7.0` and `@types/plotly.js@3.0.10`; confirm official repositories, absence of install scripts, exact versions, dist integrity metadata, and that 3.7.0 matches the Stage 3 Plotly.py Figure runtime. Record findings in the execution summary; make no filesystem/package mutation.</action>
  <acceptance_criteria>The audit provides current official provenance and identifies any changed risk signal before the human decision.</acceptance_criteria>
  <verify><automated>npm view plotly.js-basic-dist-min@3.7.0 name version repository scripts dist.integrity && npm view @types/plotly.js@3.0.10 name version repository scripts dist.integrity</automated></verify>
  <done>Current registry facts are available and no package file changed.</done>
</task>
<task type="checkpoint:human-verify" gate="blocking-human">
  <name>Task 2: Approve or reject the exact Plotly packages</name>
  <files>None (human decision)</files>
  <read_first>
    - docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-research.md
  </read_first>
  <action>Present the read-only audit and ask the user to approve installation of exact `plotly.js-basic-dist-min@3.7.0` plus `@types/plotly.js@3.0.10`. Do not treat auto-advance or silence as approval. If rejected, stop before Plan 07 and return for a contract-compatible dependency decision.</action>
  <acceptance_criteria>The user explicitly approves the two exact packages, or execution stops without installing them.</acceptance_criteria>
  <verify><automated>git diff --exit-code -- package.json package-lock.json</automated></verify>
  <done>A blocking, explicit legitimacy decision exists before installation.</done>
</task>
</tasks>

## Artifacts this phase produces

- No source file; the plan produces the explicit package-approval gate consumed by Plan 07.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-SC | Tampering | npm dependency install | high | mitigate | Current registry audit plus blocking human approval before exact-version installation. |
</threat_model>

<verification>Confirm package files are byte-unchanged and the approval/rejection is recorded.</verification>
<success_criteria>No package mutation precedes explicit approval.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-06-SUMMARY.md` when done.</output>
