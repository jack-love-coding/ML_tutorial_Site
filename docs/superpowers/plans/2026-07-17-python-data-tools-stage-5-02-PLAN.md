---
phase: python-data-tools-stage-5
plan: "02"
type: execute
wave: 2
depends_on: ["01"]
files_modified:
  - tests/python-data-tools-notebook-assets.test.ts
  - tests/python-data-tools-runtime-content.test.ts
  - tests/python-data-tools-runtime-outputs.test.ts
  - tests/python-data-tools-runtime-routing.test.ts
  - tests/python-data-tools-runtime-progress.test.ts
  - tests/python-data-tools-runtime-integration.test.ts
autonomous: true
requirements: [S5-R2, S5-R3, S5-R5, S5-R6]
must_haves:
  truths:
    - "The committed dataset, paired masters, runtime projection, Notebook, eight outputs, and manifest form one verified hash and ownership chain."
    - "A normal chapter session requests only the manifest and current chapter primary outputs; fallback dependencies load only after their visual fails."
    - "Routes, locale changes, static prompts, output loading, aborts, and retries do not mutate Progress; only the existing Course Review writer does."
  artifacts:
    - path: tests/python-data-tools-notebook-assets.test.ts
      provides: "Cross-artifact hash, schema, and reproducibility assertions"
    - path: tests/python-data-tools-runtime-outputs.test.ts
      provides: "Request-budget, lazy-fallback, failure, and stale-request behavior"
    - path: tests/python-data-tools-runtime-integration.test.ts
      provides: "Route/locale/runtime/Progress boundary audit"
  key_links:
    - from: public/notebooks/python-data-tools/outputs/manifest.json
      to: public/notebooks/python-data-tools/outputs
      via: "exact file hashes and typed output registry order"
    - from: src/components/PythonDataToolsPagedLesson.vue
      to: src/composables/usePythonDataToolsOutputSession.ts
      via: "current chapter outputIds and on-demand fallback request"
    - from: src/router/index.ts
      to: src/utils/pythonDataToolsRoutes.ts
      via: "pre-mount pure canonicalization without Progress side effects"
  prohibitions:
    - statement: "Do not add a second statistics implementation to tests, the browser, or runtime."
      status: resolved
      verification: "Tests validate committed values/schema/hash rather than recomputing alternate results."
    - statement: "Do not rename or filter routes, output IDs, checkpoint IDs, storage keys, or historical attempts."
      status: resolved
      verification: "Exact identity and old-attempt fixture assertions."
    - statement: "Do not increase normal-path prefetching to simplify failure tests."
      status: resolved
      verification: "Exact request-set tests per chapter and lazy fallback tests."
---

<objective>
Convert the Stage 5 consistency and side-effect rules into deterministic automated gates before the browser matrix.

Purpose: Catch data/runtime/request/Progress drift cheaply and make the later browser run focus on rendering and integration rather than rediscovering contract errors.
Output: Strengthened cross-artifact, request-budget, failure, route, locale, and Progress tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-17-python-data-tools-stage-5-consistency-validation-spec.md
@docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-validation.md
@docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-01-SUMMARY.md
@public/notebooks/python-data-tools/outputs/manifest.json
</context>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Lock the complete authority and hash chain</name>
  <files>tests/python-data-tools-notebook-assets.test.ts, tests/python-data-tools-runtime-content.test.ts</files>
  <read_first>
    - tests/python-data-tools-notebook-assets.test.ts
    - tests/python-data-tools-runtime-content.test.ts
    - scripts/python-data-tools/build-notebook.py
    - scripts/python-data-tools/generate-authoritative-outputs.py
    - scripts/python-data-tools/verify-authoritative-outputs.py
    - public/notebooks/python-data-tools/outputs/manifest.json
    - public/notebooks/python-data-tools/environment.json
  </read_first>
  <action>Extend existing tests rather than creating a parallel verifier. Assert the manifest's dataset, environment, font, Notebook, eight output paths/hashes and source-cell bindings match current committed files; assert the Notebook contract version, ordered chapters, 48 source cells, output cells and no error outputs; assert generated runtime still matches the paired-master compiler. Add a repeatability gate that runs the existing check/verify commands twice and compares tracked-file hashes before/after, without rewriting committed artifacts in the test process.</action>
  <acceptance_criteria>Any stale master/runtime/Notebook/output/manifest link fails with a specific path or ID; two read-only verification passes leave all tracked artifact hashes unchanged.</acceptance_criteria>
  <verify><automated>node scripts/python-data-tools/check-paired-masters.mjs &amp;&amp; node scripts/python-data-tools/build-runtime-content.mjs --check &amp;&amp; node scripts/python-data-tools/verify-bike-sharing.mjs &amp;&amp; .python-data-tools-venv/bin/python scripts/python-data-tools/verify-authoritative-outputs.py &amp;&amp; .python-data-tools-venv/bin/python scripts/python-data-tools/generate-authoritative-outputs.py --check &amp;&amp; node --test tests/python-data-tools-notebook-assets.test.ts tests/python-data-tools-runtime-content.test.ts</automated></verify>
  <done>The complete committed course authority chain has deterministic diagnostics.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Lock current-chapter request budgets and local failure behavior</name>
  <files>tests/python-data-tools-runtime-outputs.test.ts, tests/python-data-tools-runtime-integration.test.ts</files>
  <read_first>
    - tests/python-data-tools-runtime-outputs.test.ts
    - tests/python-data-tools-runtime-integration.test.ts
    - src/composables/usePythonDataToolsOutputSession.ts
    - src/utils/pythonDataToolsOutputs.ts
    - src/components/PythonDataToolsPagedLesson.vue
    - src/components/PythonDataToolsResultBlock.vue
    - src/components/PythonDataToolsPlotlyFigure.vue
  </read_first>
  <action>Add exact request-set tests for all eight chapter output-ID sets. On success, require manifest plus only the supplied primary IDs. For PNG fallback sources, assert no fallback JSON request before `loadOutputs(fallbackSourceIds)` is explicitly triggered and no duplicate request after repeated triggers. Cover manifest 404 plus one manual reload, invalid/HTTP JSON, aborted PNG, invalid Plotly Figure, disposed/stale request tokens, and repeated load calls. Assert each failure remains local and no loader/session imports or calls algorithm progress, localStorage, fetch beyond declared assets, timers, or automatic retry loops.</action>
  <acceptance_criteria>All normal and failure request sets are exact; fallback requests are demand-driven and idempotent; stale or aborted reads cannot update the active session.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-outputs.test.ts tests/python-data-tools-runtime-integration.test.ts</automated></verify>
  <done>Stage 5 browser request expectations are backed by deterministic unit behavior.</done>
</task>

<task type="auto">
  <name>Task 3: Reassert route, locale, Course Review, and Progress boundaries</name>
  <files>tests/python-data-tools-runtime-routing.test.ts, tests/python-data-tools-runtime-progress.test.ts, tests/python-data-tools-runtime-integration.test.ts</files>
  <read_first>
    - tests/python-data-tools-runtime-routing.test.ts
    - tests/python-data-tools-runtime-progress.test.ts
    - tests/python-data-tools-runtime-integration.test.ts
    - src/router/index.ts
    - src/utils/pythonDataToolsRoutes.ts
    - src/i18n/index.ts
    - src/views/PythonDataToolsCourseView.vue
    - src/components/AlgorithmCheckpointQuiz.vue
    - src/utils/algorithmProgress.ts
  </read_first>
  <action>Keep exact assertions for root, 8 current IDs, 5 legacy mappings and unknown fallback. Add an integration fixture proving locale changes, directory/pager navigation, static teaching prompts, output start/failure/reload and route redirects do not change the four Progress storage identities or attempt arrays. Retain the existing Course Review submit path as the sole Python course writer and prove historical attempts remain an unchanged prefix after two current submissions and reload.</action>
  <acceptance_criteria>Every non-review interaction is storage-neutral; Course Review append behavior and all legacy identities remain unchanged.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-routing.test.ts tests/python-data-tools-runtime-progress.test.ts tests/python-data-tools-runtime-integration.test.ts tests/algorithm-progress.test.ts tests/algorithm-checkpoints-layout.test.mjs</automated></verify>
  <done>Browser matrix failures cannot be masked by route or Progress regressions.</done>
</task>
</tasks>

## Artifacts this phase produces

- Cross-artifact manifest/hash/source-cell assertions in existing Python Data Tools tests.
- Exact per-chapter request-budget and on-demand fallback tests.
- Failure, abort, stale-request and single-reload diagnostics.
- Storage-neutral locale/navigation/resource behavior and preserved Course Review writer tests.

<verification>Run every Python Data Tools test, the paired/runtime/data/output check commands, the route/Progress compatibility tests, and `git diff --check`. Do not run the real browser matrix until this wave is green.</verification>
<success_criteria>
- Authority-chain drift and request-budget drift fail automatically.
- Six failure categories have deterministic lower-level coverage.
- Route, locale and Progress contracts remain identical to Stage 4.
</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-02-SUMMARY.md` when done.</output>
