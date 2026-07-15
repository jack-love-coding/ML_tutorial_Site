---
phase: python-data-tools-stage-4
plan: "12"
type: execute
wave: 9
depends_on: ["11"]
files_modified:
  - tests/algorithm-progress.test.ts
  - tests/python-and-housing-modules.test.mjs
  - tests/curriculumRoutingNavigation.test.ts
  - tests/algorithm-checkpoints-layout.test.mjs
  - tests/python-data-tools-chinese-master.test.ts
  - tests/python-data-tools-runtime-content.test.ts
  - tests/python-data-tools-runtime-integration.test.ts
autonomous: true
requirements: [R1, R2, R3, R4, R5, R6, R7, R8]
must_haves:
  truths:
    - "Repository compatibility suites expect the new eight-chapter runtime while retaining exact legacy maps, existing storage keys, historical attempts, and writer separation."
    - "Authority-level parser-aware D-03 checks cover all eight Chinese and eight English masters plus generated visible prose, excluding only code/markers/IDs/JSON/internal symbols."
    - "R1–R8, D-01–D-19, all 18 edge rows, and all five prohibitions pass focused, full-suite, standard-build, and Pages-build gates."
  artifacts:
    - path: tests/python-and-housing-modules.test.mjs
      provides: "Updated eight-chapter module registry compatibility"
    - path: tests/algorithm-progress.test.ts
      provides: "Existing storage-key and append-only compatibility retained"
    - path: tests/python-data-tools-runtime-integration.test.ts
      provides: "Final cross-artifact Stage 4 coverage and prohibition audit"
  key_links:
    - from: tests/curriculumRoutingNavigation.test.ts
      to: src/router/index.ts
      via: "dedicated Python route ordering plus exact legacy/current behavior"
    - from: tests/algorithm-checkpoints-layout.test.mjs
      to: src/components/AlgorithmCheckpointQuiz.vue
      via: "course-review presentation remains separated from the existing writer"
    - from: tests/python-data-tools-runtime-content.test.ts
      to: docs/curriculum-v3/python-data-tools/chinese-master
      via: "parser-aware authority/projection terminology and source-ownership checks"
  prohibitions:
    - "No handwritten second body/result-presentation/exact-statistic/output-path source."
    - "No input, scoring, submission, Progress, completion, gating, network, or storage behavior for the five teaching prompts."
    - "No causal claim, model training, cleaning implementation, or inference statistics."
    - "No deleted, renamed, filtered, or bulk-rewritten Progress/localStorage key or historical attempt."
    - "No Pyodide, backend kernel, upload, or arbitrary code execution."
---

<objective>
Update the remaining repository compatibility suites and close Stage 4 through cross-artifact coverage, full tests, both builds, and scope audit.

Purpose: Finish the phase without leaving old five-chapter expectations or unverified source-ownership/compatibility seams.
Output: Updated compatibility suites, final cross-artifact audit, and all release gates green.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-runtime-parity-spec.md
@docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-implementation-context.md
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-validation.md
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-11-SUMMARY.md
</context>

<tasks>
<task type="auto">
  <name>Task 1: Update dependent compatibility suites after the atomic switch</name>
  <files>tests/algorithm-progress.test.ts, tests/python-and-housing-modules.test.mjs, tests/curriculumRoutingNavigation.test.ts, tests/algorithm-checkpoints-layout.test.mjs</files>
  <read_first>
    - tests/algorithm-progress.test.ts
    - tests/python-and-housing-modules.test.mjs
    - tests/curriculumRoutingNavigation.test.ts
    - tests/algorithm-checkpoints-layout.test.mjs
    - tests/python-data-tools-runtime-routing.test.ts
    - tests/python-data-tools-runtime-progress.test.ts
  </read_first>
  <action>Replace remaining assumptions that the live Python module has five current chapters or old current checkpoint questions with the exact eight-chapter contract and new review IDs. Preserve and strengthen exact legacy map/route ordering, algorithm/math/data V1 keys, V2/migration keys, old-attempt prefix, component-to-writer separation, canonical revisit URLs, and root module/route/curriculum role. Do not duplicate the resolver map as production logic; compatibility tests may assert the exported exact values.</action>
  <acceptance_criteria>All dependent suites agree with the atomic runtime while retaining every legacy URL, key, attempt, and writer boundary.</acceptance_criteria>
  <verify><automated>node --test tests/algorithm-progress.test.ts tests/python-and-housing-modules.test.mjs tests/curriculumRoutingNavigation.test.ts tests/algorithm-checkpoints-layout.test.mjs tests/python-data-tools-runtime-routing.test.ts tests/python-data-tools-runtime-progress.test.ts</automated></verify>
  <done>No repository test still treats the old five chapters/questions as current content.</done>
</task>

<task type="auto">
  <name>Task 2: Complete cross-artifact terminology, prohibition, and release gates</name>
  <files>tests/python-data-tools-chinese-master.test.ts, tests/python-data-tools-runtime-content.test.ts, tests/python-data-tools-runtime-integration.test.ts</files>
  <read_first>
    - tests/python-data-tools-chinese-master.test.ts
    - tests/python-data-tools-runtime-content.test.ts
    - tests/python-data-tools-runtime-integration.test.ts
    - scripts/python-data-tools/check-paired-masters.mjs
    - scripts/python-data-tools/build-runtime-content.mjs
    - docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-runtime-parity-spec.md
  </read_first>
  <action>Finalize the cross-artifact gate for R1–R8 and D-01–D-19. Scan all 16 masters and generated learner prose with parser-aware exclusion of fenced code, comments/markers, inline internal symbols, output IDs, JSON fields, and variable names; reject learner-visible 证据/evidence/manifest/output wording and require natural approved labels. Assert every result-presentation block originates in paired masters and travels generated projection → PagedLesson → ResultBlock/Plotly with no handwritten copy registry. Reassert both exact `modules.pythonNotebook` locale metadata objects and their eight current section labels, absence of stale model-training vocabulary, and AlgorithmView's Python-only omission of the complete generic hero/completion/status/stats subtree. Cover all five prohibition families, all 18 edge rows, exact downloads/base paths, the page-owned one-shot manifest session plus one single-use manual reload allowance, Plotly lifecycle/fallback, static prompts, current-only page, route mapping, review placement, and old attempts. Then run the unconditional full-eight-pair preflight, compiler check, Stage 4 focused suite, full suite, standard build, Pages build, and diff/scope audit; do not include `docs/gpt_advice.md`, generated Data Lab images, dist, caches, screenshots, or unrelated files.</action>
  <acceptance_criteria>All focused/full/build gates pass; parser-aware terminology and source-ownership checks cover both locales and generated runtime; final diff contains only Stage 4 files.</acceptance_criteria>
  <verify><automated>node scripts/python-data-tools/check-paired-masters.mjs && node scripts/python-data-tools/build-runtime-content.mjs --check && node --test tests/python-data-tools-*.test.ts && npm test && npm run build && npm run build:pages && git diff --check</automated></verify>
  <done>Stage 4 is fully validated and ready for its independent submission without Stage 5 scope.</done>
</task>

<task type="auto">
  <name>Task 3: Run the bounded Stage 4 browser smoke</name>
  <files>None (read-only browser verification; record observations in the plan summary)</files>
  <read_first>
    - docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-validation.md
    - src/router/index.ts
    - src/components/PythonDataToolsPagedLesson.vue
  </read_first>
  <action>After the Wave 8 runtime integration and Task 2 release gates are green, run `npm run build`, start the built site with `npm run preview -- --host 127.0.0.1`, and use the `browser:control-in-app-browser` skill for one bounded smoke only. Open `/learn/python-notebook`, confirm the course renders, then open the canonical `/learn/python-notebook/notebook-workflow` chapter and confirm exactly that chapter's article is visible. Verify the browser console has no errors, use the page's next navigation to reach `/learn/python-notebook/numpy-foundations`, then use previous navigation to return to `notebook-workflow`. Stop the preview server and record the checked URLs, navigation result, and console result in the Plan 12 summary. Do not run test watch mode and do not expand this smoke into desktop/mobile, reduced-motion, keyboard, resource-failure, or cross-locale matrices; those remain Stage 5.</action>
  <acceptance_criteria>The root course URL and one canonical chapter render without console errors, and basic next/previous navigation reaches the expected canonical chapter URLs.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-page.test.ts tests/python-data-tools-runtime-routing.test.ts tests/python-data-tools-runtime-integration.test.ts</automated></verify>
  <done>One recorded Stage 4 browser smoke confirms root/canonical rendering, a clean console, and basic chapter navigation without taking on the Stage 5 matrix.</done>
</task>
</tasks>

## Artifacts this phase produces

- Updated dependent registry, routing, checkpoint, and Progress compatibility tests.
- Final parser-aware bilingual terminology/source-ownership audit.
- Full Stage 4 release-gate record through tests and both builds.
- Bounded browser-smoke record for the root course, one canonical chapter, console, and next/previous navigation.

## Edge Coverage — all 18 resolved rows

| Edge | Requirement | Planned proof |
|---|---|---|
| Empty locale/chapter/block | R1 | Plans 01–05/12 preflight/compiler fixtures reject it. |
| Encoding/mojibake and code/formula text | R1 | Plans 01–05/12 UTF-8 and exact-signature tests. |
| Duplicate chapter adjacency | R2 | Plan 05 compiler and Plans 11–12 registration tests reject it. |
| Empty/not-exactly-eight runtime | R2 | Plans 11–12 registration assertions. |
| Chapter ordering | R2 | Contract-by-index projection/page/integration tests. |
| Legacy redirect idempotency | R3 | Plans 10–12 repeated resolver/navigation tests. |
| Parallel legacy resolution | R3 | Plan 10 concurrent pure-call/no-storage test. |
| Duplicate manifest output adjacency | R4 | Plan 07 typed guard test. |
| Empty manifest/resource | R4 | Plans 07/09 local bilingual fallback and page-owned reload tests. |
| Output ordering/ownership | R4 | Plans 05/07/09 generated presentation and contract registry tests. |
| Concurrent/repeat resource loads | R4 | Plans 07–09 abort/stale/no-duplicate/no-state tests. |
| Duplicate prompt mount adjacency | R5 | Plans 01–02/05/09 uniqueness tests. |
| Missing prompt part/exactly five | R5 | Plans 01–02/05 prompt schema tests. |
| Prompt ordering/ownership | R5 | Contract mount order tests in Plans 05/09. |
| Historical attempt idempotency | R6 | Plans 11–12 old-prefix load/append/reload fixture. |
| Multi-tab attempt merging rejected for this stage | R6 | Plans 11–12 prove no new writer; existing concurrency semantics stay untouched. |
| Empty accessible labels/fallback | R8 | Plans 01–05/07–09/12 typed bilingual presentation tests. |
| UTF-8 Chinese labels/alt/fallback | R8 | Plans 01–02/05/07/09/12 parser-aware localized-copy tests. |

## Multi-Source Coverage Audit

| Source | ID | Feature | Plan(s) | Status |
|---|---|---|---|---|
| GOAL | — | Eight-chapter bilingual paged runtime with authoritative results and compatible review | 01–12 | COVERED |
| REQ | R1 | English semantic parity | 01–05, 09, 11–12 | COVERED |
| REQ | R2 | Eight current chapters | 05, 09, 11–12 | COVERED |
| REQ | R3 | Legacy deep-link compatibility | 10–12 | COVERED |
| REQ | R4 | Manifest results/download | 05–09, 11–12 | COVERED |
| REQ | R5 | Five static prompts | 01–05, 09, 11–12 | COVERED |
| REQ | R6 | Checkpoint/Progress compatibility | 11–12 | COVERED |
| REQ | R7 | Descriptive-analysis boundary | 01–05, 11–12 | COVERED |
| REQ | R8 | Bilingual accessibility/fallback | 01–09, 11–12 | COVERED |
| RESEARCH | — | Paired preflight/compiler, pure resolver, typed local-failure loader, page-owned one-shot session, official lazy Plotly, existing Progress writer | 01–12 | COVERED |
| CONTEXT | D-01–D-04 | Paged/current-only/inline labels/no mastery | 01–05, 09, 11–12 | COVERED |
| CONTEXT | D-05–D-09 | Paired masters/projection/locale/PNG/check | 01–05, 07–09, 11–12 | COVERED |
| CONTEXT | D-10–D-13 | Teaching result views/Plotly/local failure/download | 05, 07–09, 11–12 | COVERED |
| CONTEXT | D-14–D-17 | Static prompts/course review/new IDs | 01–05, 09, 11–12 | COVERED |
| CONTEXT | D-18–D-19 | Exact silent mappings/current/unknown behavior | 10–12 | COVERED |

Deferred English Notebook/PNG, browser Python/backend, more exercises, Progress redesign, and Stage 5 full browser matrix remain explicitly excluded rather than missing.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-20 | Tampering | Compatibility suites | medium | mitigate | Exact eight-current/five-legacy/new-review/old-attempt assertions. |
| T-PDT4-21 | Tampering | Learner-visible prose authority | medium | mitigate | Parser-aware 16-master plus generated-projection checks and no-copy-registry assertion. |
| T-PDT4-22 | Repudiation | Release validation | medium | mitigate | Full tests, both builds, compiler/preflight checks, and diff scope audit. |
</threat_model>

<verification>As the Wave 9 validation owner, after Plan 12 completes run `node --test tests/python-data-tools-*.test.ts` and `npm test` in addition to every release command in Task 2, complete the bounded Task 3 browser smoke, and inspect `git status --short`/diff without reading or touching `docs/gpt_advice.md`.</verification>
<success_criteria>
- All R1–R8, D-01–D-19, 18 edge rows, and five prohibitions have passing gates.
- The eight canonical and five legacy URLs, generated results/downloads, static prompts, course review, and historical Progress are compatible.
- Full tests and both builds pass; Stage 5 browser matrix remains deferred.
</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-12-SUMMARY.md` when done.</output>
