---
phase: python-data-tools-stage-4
plan: "07"
type: execute
wave: 5
depends_on: ["05", "06"]
files_modified:
  - package.json
  - package-lock.json
  - src/types/plotly-basic.d.ts
  - src/utils/pythonDataToolsOutputs.ts
  - src/components/PythonDataToolsResultBlock.vue
  - tests/python-data-tools-runtime-outputs.test.ts
autonomous: true
requirements: [R4, R8]
must_haves:
  truths:
    - "D-10/D-12: canonical JSON appears as teaching tables/key values with optional raw disclosure and local failure states."
    - "D-08: Chinese PNGs are reused with localized alt/label translations, full interpretation, and authoritative equivalent tables."
    - "Manifest/output paths are resolved with `withPublicBase`; duplicate IDs, empty resources, wrong order/schema, and concurrent reads cannot duplicate UI or mutate learning state."
    - "D-12 session ownership remains outside this pure loader; Plan 09's page-owned composable performs the sole automatic manifest request and one single-use manual reload transition."
  artifacts:
    - path: src/utils/pythonDataToolsOutputs.ts
      provides: "Typed manifest guards, load states, output adapters, fallback dependencies"
      exports: ["loadPythonDataToolsManifest", "loadPythonDataToolsOutput", "pythonDataToolsOutputRegistry"]
    - path: src/components/PythonDataToolsResultBlock.vue
      provides: "Localized JSON/PNG teaching result and local fallback rendering"
  key_links:
    - from: src/utils/pythonDataToolsOutputs.ts
      to: public/notebooks/python-data-tools/outputs/manifest.json
      via: "one-shot fetch of unknown data, typed guards, contract ownership"
    - from: src/components/PythonDataToolsResultBlock.vue
      to: src/components/MarkdownMathContent.vue
      via: "existing safe prose/formula rendering"
    - from: src/data/generated/pythonDataToolsRuntime.generated.ts
      to: src/components/PythonDataToolsResultBlock.vue
      via: "typed result-presentation prop supplies every localized learner-facing title/alt/translation/interpretation/limitation/fallback string"
  prohibitions:
    - "Do not copy Stage 3 exact statistics, public output paths, or learner-facing result presentation into components or a handwritten registry."
    - "Do not fetch CSV/recompute statistics, auto-retry indefinitely, block the page, write storage, or add upload/code execution."
---

<objective>
Install the approved Plotly boundary and implement typed, locally failing authoritative-output loading and teaching presentation.

Purpose: Make Stage 3 artifacts the sole runtime result source without turning the page into a JSON debugger.
Output: Exact dependencies, typed loader/adapters, result component, and output tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-patterns.md
@public/notebooks/python-data-tools/outputs/manifest.json
@tests/python-data-tools-notebook-assets.test.ts
@src/utils/publicPath.ts
@src/components/CnnExplainerLab.vue
@src/modules/ai-overview/components/OverviewMediaFigure.vue
@src/components/MarkdownMathContent.vue
</context>

<tasks>
<task type="auto">
  <name>Task 1: Install only the approved exact Plotly packages</name>
  <files>package.json, package-lock.json, src/types/plotly-basic.d.ts</files>
  <read_first>
    - docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-06-SUMMARY.md
    - package.json
    - package-lock.json
  </read_first>
  <action>After verifying Plan 06 recorded explicit approval, install runtime `plotly.js-basic-dist-min@3.7.0` with `--save-exact` and development type package `@types/plotly.js@3.0.10` with `--save-dev --save-exact`. Add the smallest ambient module alias needed for the basic dist import; do not add a CDN, full Plotly bundle, UI framework, schema library, or install scripts. Verify both root manifests and resolved lock entries so semver ranges or lock drift cannot pass merely because `npm ls` currently resolves the desired versions.</action>
  <acceptance_criteria>`package.json`, the root lock package entry, and both resolved package-lock entries contain the exact literal versions with no range prefixes; the ambient declaration exposes official Plotly types.</acceptance_criteria>
  <verify><automated>node --input-type=module -e "import{readFileSync}from'node:fs';const p=JSON.parse(readFileSync('package.json','utf8'));const l=JSON.parse(readFileSync('package-lock.json','utf8'));const root=l.packages?.['']??{};const checks=[p.dependencies?.['plotly.js-basic-dist-min']==='3.7.0',p.devDependencies?.['@types/plotly.js']==='3.0.10',root.dependencies?.['plotly.js-basic-dist-min']==='3.7.0',root.devDependencies?.['@types/plotly.js']==='3.0.10',l.packages?.['node_modules/plotly.js-basic-dist-min']?.version==='3.7.0',l.packages?.['node_modules/@types/plotly.js']?.version==='3.0.10'];if(checks.some(v=>!v))throw new Error('Plotly package.json/package-lock exact-version assertion failed')" &amp;&amp; npm ls plotly.js-basic-dist-min@3.7.0 @types/plotly.js@3.0.10</automated></verify>
  <done>The approved packages are exact-pinned and type-checkable.</done>
</task>
<task type="auto" tdd="true">
  <name>Task 2: Build the typed manifest/output loader and adapters</name>
  <files>src/utils/pythonDataToolsOutputs.ts, tests/python-data-tools-runtime-outputs.test.ts</files>
  <read_first>
    - src/utils/publicPath.ts
    - tests/python-data-tools-notebook-assets.test.ts
    - src/components/CnnExplainerLab.vue
    - public/notebooks/python-data-tools/outputs/manifest.json
  </read_first>
  <behavior>
    - Correct manifest and each fixed payload produce typed ready states and contract-ordered primary placements.
    - Wrong version/schema, duplicate/unknown output ID, HTTP/JSON failure, and missing resource produce localized local errors.
    - Repeat/concurrent request functions remain abortable/idempotent and never call Progress/storage; they do not mount, auto-start, schedule, or own a retry loop.
  </behavior>
  <action>Implement R4 and the pure loader half of R8: write RED tests, then implement `unknown` parsing, explicit guards, discriminated `idle/loading/ready/error` states, abort-signal support, typed manifest lookup, and independent per-result fetch/adapters. Do not place lifecycle hooks, automatic invocation, retry counters, timers, or page-session ownership in this utility; Plan 09 will own the single automatic call and one single-use user-triggered reload allowance. Define output registry and PNG `fallbackSourceIds` so equivalent tables derive only from `workingday-comparison` and `final-analysis-evidence`; distinguish primary consumption from fallback dependencies. Resolve every dynamic URL through `withPublicBase()` under `/` and `/ML_tutorial_Site/`.</action>
  <acceptance_criteria>All eight output IDs have one ordered primary placement; all 18-relevant R4 edge cases are observable and local; no numeric constant or storage/progress import substitutes for authoritative payloads.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-outputs.test.ts</automated></verify>
  <done>Manifest and per-resource loading/adaptation are typed, deterministic, base-safe, and locally recoverable.</done>
</task>
<task type="auto">
  <name>Task 3: Render JSON and PNG results as bilingual teaching blocks</name>
  <files>src/components/PythonDataToolsResultBlock.vue, tests/python-data-tools-runtime-outputs.test.ts</files>
  <read_first>
    - src/modules/ai-overview/components/OverviewMediaFigure.vue
    - src/components/MarkdownMathContent.vue
    - src/utils/pythonDataToolsOutputs.ts
  </read_first>
  <action>Per D-03/D-08/D-10/D-12, require a generated `PythonDataToolsResultPresentationBlock` prop and render its localized title, alt, axis/legend translations, interpretation, limitation, and fallback summary; do not define a component-level copy map. Default JSON to semantic tables/key values plus the generated interpretation; place raw read-only JSON in optional disclosure. For PNG error, hide the broken image and keep generated localized accessibility copy plus authoritative equivalent data table. Single JSON failure remains inside that result block. Source tests must reject handwritten presentation registries and parser-aware learner-visible internal terminology while allowing internal prop/type/output identifiers.</action>
  <acceptance_criteria>Every result has non-empty bilingual title/alt/fallback; status is not color-only; resource errors never replace chapter prose or other results.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-outputs.test.ts</automated></verify>
  <done>JSON and PNG output blocks teach from authoritative data and degrade locally.</done>
</task>
</tasks>

## Artifacts this phase produces

- `PythonDataToolsManifest`, per-output payload guards/view models, `PythonDataToolsLoadState`, loader/reload functions, and `PythonDataToolsResultBlock`.
- Exact Plotly dependency/type boundary approved by Plan 06.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-09 | Tampering | Manifest/JSON | medium | mitigate | Parse as unknown, strict guards, contract allowlist, local errors, no payload execution. |
| T-PDT4-10 | Denial of service | Resource loader | medium | mitigate | One-shot automatic fetch, abort/stale-request handling, explicit manual reload only. |
| T-PDT4-SC | Tampering | npm packages | high | mitigate | Exact approved pins and lockfile; Plan 06 blocks installation. |
</threat_model>

<verification>As the Wave 5 validation owner, after Plan 07 completes run output tests, `node --test tests/python-data-tools-*.test.ts`, `npm test`, `npm run build`, `npm run build:pages`, and `git diff --check`; inspect that Plotly is not statically imported yet.</verification>
<success_criteria>Authoritative JSON/PNG resources load once, render pedagogically, and fail locally under both public bases.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-07-SUMMARY.md` when done.</output>
