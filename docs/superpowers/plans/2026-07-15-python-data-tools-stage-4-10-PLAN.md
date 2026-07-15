---
phase: python-data-tools-stage-4
plan: "10"
type: execute
wave: 1
depends_on: []
files_modified:
  - src/utils/pythonDataToolsRoutes.ts
  - tests/python-data-tools-runtime-routing.test.ts
autonomous: true
requirements: [R3]
must_haves:
  truths:
    - "D-18: the five exact legacy IDs resolve through one readonly centralized map."
    - "D-19: all eight current IDs resolve to themselves; empty/unknown resolves to notebook-workflow; resolution is stable and side-effect free."
    - "The pure resolver lands before any router/module/page switch and introduces no Progress, storage, Vue, router, or navigation side effect."
  artifacts:
    - path: src/utils/pythonDataToolsRoutes.ts
      provides: "Pure legacy/current/unknown chapter resolution"
      exports: ["legacyPythonDataToolsChapterMap", "resolvePythonDataToolsChapter"]
    - path: tests/python-data-tools-runtime-routing.test.ts
      provides: "Exact mapping, current-ID, unknown, idempotency, concurrency, and purity contract"
  key_links:
    - from: src/utils/pythonDataToolsRoutes.ts
      to: src/data/pythonNotebookContract.ts
      via: "current-ID allowlist and fallback derive from contract chapter order"
    - from: tests/python-data-tools-runtime-routing.test.ts
      to: src/utils/pythonDataToolsRoutes.ts
      via: "5 legacy + 8 current + empty/unknown + repeated/parallel pure-call assertions"
  prohibitions:
    - "Do not register a route, mount a page, switch the module, write Progress/storage, or change checkpoints in this plan."
    - "Do not scatter duplicate legacy maps into Vue, router, module, or test fixtures."
---

<objective>
Land and validate the pure Python Data Tools chapter resolver as an independent prerequisite.

Purpose: Make the compatibility policy executable and reviewable before the atomic runtime switch.
Output: One readonly resolver module and its focused unit/purity tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-implementation-context.md
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-patterns.md
@src/data/pythonNotebookContract.ts
@src/curriculum/routes.ts
@src/router/index.ts
</context>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Implement the exact pure legacy/current/unknown resolver</name>
  <files>src/utils/pythonDataToolsRoutes.ts, tests/python-data-tools-runtime-routing.test.ts</files>
  <read_first>
    - src/data/pythonNotebookContract.ts
    - src/curriculum/routes.ts
    - src/router/index.ts
    - tests/linear-regression-layout.test.mjs
  </read_first>
  <behavior>
    - `notebook-rhythm → notebook-workflow`; `numpy-arrays → numpy-foundations`; `pandas-tables → pandas-structures`; `sklearn-small-model → pandas-analysis`; `reproducible-handoff → analysis-report`.
    - Every current contract ID resolves to itself; empty/unknown resolves to the first contract chapter; repeated resolution is stable and non-looping.
    - Concurrent calls are deterministic and the module imports/calls no Progress, storage, Vue, router, or navigation API.
  </behavior>
  <action>Implement R3 per D-18/D-19 with RED-first tests, one readonly exact legacy map, a contract-derived current-ID set, and a discriminated `legacy | current | unknown` result. Return the canonical ID and redirect kind without performing navigation. Keep all mapping policy in this file; future router integration consumes the export rather than re-declaring keys.</action>
  <acceptance_criteria>All legacy/current/unknown cases are deterministic, typed, canonical, non-looping, and side-effect free.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-routing.test.ts</automated></verify>
  <done>The compatibility resolver is GREEN without changing the live route or module.</done>
</task>

<task type="auto">
  <name>Task 2: Harden resolver purity and integration-ready diagnostics</name>
  <files>tests/python-data-tools-runtime-routing.test.ts</files>
  <read_first>
    - src/utils/pythonDataToolsRoutes.ts
    - src/utils/algorithmProgress.ts
    - src/router/index.ts
    - tests/curriculumRoutingNavigation.test.ts
  </read_first>
  <action>Extend the focused test to verify exact own keys/values, current contract order, unknown fallback, repeated and `Promise.all` calls, and source-level absence of Progress/storage/router imports or writes. Add diagnostics that distinguish a missing legacy key, wrong canonical target, current-ID rewrite, and accidental side effect so Plan 11 can depend on this resolver without interpreting failures.</action>
  <acceptance_criteria>The test fails with a named diagnostic for every mapping/purity regression and the worktree still has no route/module/page/checkpoint mutation.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-routing.test.ts && git diff --check</automated></verify>
  <done>Plan 11 has a stable, exact, independently validated resolver prerequisite.</done>
</task>
</tasks>

## Artifacts this phase produces

- `legacyPythonDataToolsChapterMap` with the five locked mappings.
- `resolvePythonDataToolsChapter` with contract-derived current/unknown behavior.
- Focused resolver and purity tests.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-15 | Tampering | Route ID policy | medium | mitigate | Exact readonly map plus contract allowlist and exhaustive pure tests. |
| T-PDT4-16 | Tampering | Progress/storage | medium | mitigate | Resolver has no writer/import and tests enforce zero side effects. |
</threat_model>

<verification>Run the focused routing test and inspect that only the resolver and test changed. As the Wave 1 validation owner, after Plans 01, 06, and 10 are complete run `node --test tests/python-data-tools-*.test.ts`, `npm test`, and `git diff --check`.</verification>
<success_criteria>The exact resolver is independently shippable and the live runtime remains untouched.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-10-SUMMARY.md` when done.</output>
