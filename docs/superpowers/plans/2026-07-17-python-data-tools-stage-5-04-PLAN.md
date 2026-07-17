---
phase: python-data-tools-stage-5
plan: "04"
type: execute
wave: 4
depends_on: ["03"]
files_modified:
  - tests/github-pages-workflow.test.mjs
  - tests/python-data-tools-runtime-routing.test.ts
  - tests/curriculumMilestoneAudit.test.ts
  - .planning/ROADMAP.md
  - .planning/STATE.md
  - docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-04-SUMMARY.md
autonomous: true
requirements: [S5-R1, S5-R2, S5-R3, S5-R4, S5-R5, S5-R6, S5-R7, S5-R8]
must_haves:
  truths:
    - "The full repository suite, standard build, Pages build, SPA fallback generation, security audit, and diff/scope gates pass after all Stage 5 fixes."
    - "Standard and Pages artifacts serve Python root, canonical, legacy, output, Notebook, font, and Plotly paths from their correct bases without 404 or console/page errors."
    - "Roadmap and state mark Stage 5 complete only after the final release record contains every command and browser gate result."
  artifacts:
    - path: docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-04-SUMMARY.md
      provides: "Final auditable release, Pages, scope, warning, and residual-risk record"
    - path: tests/github-pages-workflow.test.mjs
      provides: "Python root/canonical SPA fallback and workflow base-path coverage"
    - path: .planning/ROADMAP.md
      provides: "Stage 5 completion state after verified closeout"
  key_links:
    - from: .github/workflows/deploy-pages.yml
      to: scripts/create-pages-fallbacks.mjs
      via: "build with VITE_BASE_PATH followed by static SPA fallback generation"
    - from: vite.config.ts
      to: src/utils/publicPath.ts
      via: "shared `/` or `/ML_tutorial_Site/` base semantics"
    - from: docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md
      to: docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-04-SUMMARY.md
      via: "final browser matrix roll-up without losing failed/retest history"
  prohibitions:
    - statement: "Do not mark Stage 5 complete when any required command, matrix row, failure injection, or Pages request is missing or failed."
      status: resolved
      verification: "Summary checklist and milestone-state assertions."
    - statement: "Do not push, deploy, merge, or modify GitHub settings as part of local release validation."
      status: resolved
      verification: "Git log/status and no remote mutation."
    - statement: "Do not stage `docs/gpt_advice.md`, dist, browser cache, screenshots, or unrelated generated images."
      status: resolved
      verification: "Explicit `git status --short` and staged diff scope audit."
---

<objective>
Prove the completed course from clean release commands and close Stage 5 with an auditable standard/Pages record.

Purpose: Turn the consistency and browser work into a release-quality conclusion without performing a remote deployment.
Output: Green repository/build/security gates, two-base artifact smoke, final summary, and accurate planning state.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@AGENTS.md
@docs/superpowers/specs/2026-07-17-python-data-tools-stage-5-consistency-validation-spec.md
@docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-validation.md
@docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md
@.github/workflows/deploy-pages.yml
@scripts/create-pages-fallbacks.mjs
@vite.config.ts
</context>

<tasks>
<task type="auto" tdd="true">
  <name>Task 1: Lock Python Data Tools into the Pages fallback contract</name>
  <files>tests/github-pages-workflow.test.mjs, tests/python-data-tools-runtime-routing.test.ts</files>
  <read_first>
    - tests/github-pages-workflow.test.mjs
    - tests/python-data-tools-runtime-routing.test.ts
    - scripts/create-pages-fallbacks.mjs
    - .github/workflows/deploy-pages.yml
    - src/utils/pythonDataToolsRoutes.ts
  </read_first>
  <action>Assert the Pages workflow uses Node 24, `npm ci`, tests, `VITE_BASE_PATH=/ML_tutorial_Site/`, build, fallback generation and artifact upload in that order. Assert fallback generation produces `404.html`, `/learn/python-notebook/index.html` and one file for each of the eight canonical chapter paths; legacy URLs may resolve through the app guard after a copied fallback but their exact mappings must remain covered by routing tests. If the script does not currently enumerate Python canonical chapter routes, add them from the existing static route source without introducing a second chapter-order policy.</action>
  <acceptance_criteria>A temporary dist fixture receives root, 404, Python course root and all eight canonical chapter fallback files; workflow ordering and exact route mappings pass.</acceptance_criteria>
  <verify><automated>node --test tests/github-pages-workflow.test.mjs tests/python-data-tools-runtime-routing.test.ts</automated></verify>
  <done>Direct Pages refreshes for every current Python chapter have deterministic local coverage.</done>
</task>

<task type="auto">
  <name>Task 2: Run clean final commands and two-base artifact smoke</name>
  <files>docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-04-SUMMARY.md</files>
  <read_first>
    - /Users/jackky/.codex/skills/playwright/SKILL.md
    - docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-validation.md
    - docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md
    - package.json
    - vite.config.ts
    - scripts/create-pages-fallbacks.mjs
  </read_first>
  <action>Run the complete final command list from the validation document. After `npm run build`, serve standard dist and browser-check root course, chapter 1, chapter 7 Plotly, chapter 8 review and one legacy route from `/`. Stop that server. Run `npm run build:pages`, generate fallbacks, serve the Pages artifact, and check the equivalent paths under `/ML_tutorial_Site/`, including a direct canonical refresh. Record console/page errors, failed requests and exact asset URLs for JS, CSS, output manifest, Notebook/environment, JSON/PNG/font and Plotly chunk. Stop the server, then rerun `npm run build` so the final local `dist` is not left in Pages mode.</action>
  <acceptance_criteria>Every final command exits 0; both base smokes have 0 console/page errors and 0 unexpected failed requests; all inspected Pages asset URLs begin `/ML_tutorial_Site/`; final dist is rebuilt in standard mode.</acceptance_criteria>
  <verify><automated>node scripts/python-data-tools/check-paired-masters.mjs &amp;&amp; node scripts/python-data-tools/build-runtime-content.mjs --check &amp;&amp; node scripts/python-data-tools/verify-bike-sharing.mjs &amp;&amp; .python-data-tools-venv/bin/python scripts/python-data-tools/verify-authoritative-outputs.py &amp;&amp; .python-data-tools-venv/bin/python scripts/python-data-tools/generate-authoritative-outputs.py --check &amp;&amp; node --test tests/python-data-tools-*.test.ts &amp;&amp; npm test &amp;&amp; npm run build &amp;&amp; npm run build:pages &amp;&amp; node scripts/create-pages-fallbacks.mjs &amp;&amp; npm run security:audit &amp;&amp; git diff --check</automated></verify>
  <done>The exact local artifacts that correspond to standard and Pages deployment both pass.</done>
</task>

<task type="auto">
  <name>Task 3: Audit scope and close planning state</name>
  <files>tests/curriculumMilestoneAudit.test.ts, .planning/ROADMAP.md, .planning/STATE.md, docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-04-SUMMARY.md</files>
  <read_first>
    - tests/curriculumMilestoneAudit.test.ts
    - .planning/ROADMAP.md
    - .planning/STATE.md
    - docs/superpowers/specs/2026-07-17-python-data-tools-stage-5-consistency-validation-spec.md
    - docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-03-SUMMARY.md
  </read_first>
  <action>Complete the final summary with terminology mapping, internal IDs retained, artifact/hash commands, 36-cell matrix totals, accessibility/failure cells, two-base results, test/build/security counts, large-chunk warning disposition, fixes and retests, unrun checks and remaining risks. Run `git status --short`, `git diff --stat`, `git diff --check` and staged-scope inspection; exclude `docs/gpt_advice.md`, dist, caches, screenshots and unrelated images. Only after every required row/command is green, change Roadmap Stage 5 from Designed/Ready to Completed and State current focus to the next explicitly planned V3.1 decision; update milestone audit assertions to match. Do not invent or start that next implementation phase.</action>
  <acceptance_criteria>The summary has no unchecked required item; Roadmap/State/tests agree Stage 5 is complete; diff scope contains only Stage 5 paths and the user-owned untracked file remains untouched.</acceptance_criteria>
  <verify><automated>node --test tests/curriculumMilestoneAudit.test.ts tests/python-data-tools-*.test.ts &amp;&amp; npm test &amp;&amp; git diff --check &amp;&amp; git status --short</automated></verify>
  <done>Stage 5 is closed only from complete evidence, with no remote or unrelated mutation.</done>
</task>
</tasks>

## Artifacts this phase produces

- Pages fallback coverage for the Python course root and all eight canonical chapters.
- `2026-07-17-python-data-tools-stage-5-04-SUMMARY.md` final release record.
- Updated milestone audit, Roadmap and State after all release gates pass.
- No remote deployment, PR, push or merge artifact.

<verification>Repeat the final command list after any Task 3 state-test change, confirm both browser servers are stopped, inspect final git scope, and ensure `docs/gpt_advice.md` was neither read nor staged.</verification>
<success_criteria>
- Full test/build/Pages/security and browser gates are green.
- Pages deep links and all course assets work from the configured base.
- Stage 5 status and final summary are complete, accurate and independently reviewable.
</success_criteria>
<output>Create/finalize `docs/superpowers/plans/2026-07-17-python-data-tools-stage-5-04-SUMMARY.md` when done.</output>
