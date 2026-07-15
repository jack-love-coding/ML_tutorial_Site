---
phase: python-data-tools-stage-4
plan: "09"
type: execute
wave: 7
depends_on: ["05", "07", "08"]
files_modified:
  - src/components/PythonDataToolsTeachingPrompt.vue
  - src/components/PythonDataToolsPagedLesson.vue
  - src/composables/usePythonDataToolsOutputSession.ts
  - src/styles/modules/python-data-tools.css
  - src/styles/index.css
  - tests/python-data-tools-runtime-prompts.test.ts
  - tests/python-data-tools-runtime-page.test.ts
  - tests/python-data-tools-runtime-outputs.test.ts
autonomous: true
requirements: [R1, R2, R4, R5, R7, R8]
must_haves:
  truths:
    - "D-01/D-04: a dedicated current-chapter-only page has desktop sticky TOC, mobile expandable TOC, stable pager, and only 第 X / 8 章—not percentage/mastery/pass/gating."
    - "D-02/D-03: question → code → 运行结果 → 图表解读/分析发现 → 需要注意 is rendered inline with no result gallery or internal terminology."
    - "D-07/D-13: locale keeps chapter/location; header and final-report bottom offer 下载完整中文 Notebook with executed/output/local-environment disclosure and environment link."
    - "D-14/D-15: five static prompt components show immediate reasoning and have no stateful/interactive surface."
    - "D-12: the page-owned output-session composable performs one automatic manifest load, aborts/stales cleanup on replacement/unmount, distributes typed state by result ID, and exposes one single-use manual 重新加载运行结果 action only after the initial manifest failure."
  artifacts:
    - path: src/components/PythonDataToolsPagedLesson.vue
      provides: "Eight-chapter current-only teaching page"
    - path: src/components/PythonDataToolsTeachingPrompt.vue
      provides: "Pure static prompt presentation"
    - path: src/composables/usePythonDataToolsOutputSession.ts
      provides: "One-shot page-session manifest ownership and typed per-result state distribution"
    - path: src/styles/modules/python-data-tools.css
      provides: "Scoped responsive/sticky/fallback styles"
  key_links:
    - from: src/components/PythonDataToolsPagedLesson.vue
      to: src/data/generated/pythonDataToolsRuntime.generated.ts
      via: "typed localized current chapter blocks"
    - from: src/components/PythonDataToolsPagedLesson.vue
      to: src/components/PythonDataToolsResultBlock.vue
      via: "generated presentation block plus page-session typed result state rendered immediately after bound code"
    - from: src/components/PythonDataToolsPagedLesson.vue
      to: src/composables/usePythonDataToolsOutputSession.ts
      via: "one composable instance per page session; one automatic load and one bilingual single-use manual reload control after the initial manifest failure"
    - from: src/composables/usePythonDataToolsOutputSession.ts
      to: src/utils/pythonDataToolsOutputs.ts
      via: "AbortController/request-token lifecycle invokes pure loader functions and distributes readonly state keyed by contract result ID"
  prohibitions:
    - "Do not copy the LinearRegression progress percentage, render all chapters, add a result gallery, or expose learner-facing 证据/manifest/output terminology."
    - "Do not add prompt form controls/events/state/network/storage, online-Python claims, manifest retry timers/watch loops, or per-result manifest reload buttons."
---

<objective>
Build the dedicated teaching-first paged course surface from the generated content and authoritative result components.

Purpose: Make the eight-chapter bilingual course readable before the final atomic route switch.
Output: Paged page, static prompt component, responsive module CSS, and page/prompt tests.
</objective>

<execution_context>@/Users/jackky/.codex/gsd-core/workflows/execute-plan.md</execution_context>

<context>
@docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-patterns.md
@src/components/LinearRegressionPagedLesson.vue
@src/components/LogisticRegressionPagedLesson.vue
@src/styles/modules/linear-regression.css
@src/styles/modules/linear-regression-responsive.css
@src/components/MarkdownMathContent.vue
@src/utils/publicPath.ts
</context>

<tasks>
<task type="auto">
  <name>Task 1: Render static teaching prompts with no side effects</name>
  <files>src/components/PythonDataToolsTeachingPrompt.vue, tests/python-data-tools-runtime-prompts.test.ts</files>
  <read_first>
    - src/components/MarkdownMathContent.vue
    - src/types/pythonDataToolsRuntime.ts
    - tests/algorithm-checkpoints-layout.test.mjs
  </read_first>
  <action>Implement R5 per D-14/D-15 by rendering a semantic article/section containing localized “想一想”, immediately visible “参考思路”, misconception, and canonical revisit link. Use `MarkdownMathContent` for prose/formulas. Keep the component prop-only: no form/input/answer controls, emit, local completion ref, storage/progress/network import, score, reset, or gate. Tests must verify exactly five unique ordered mounts and both locales/UTF-8.</action>
  <acceptance_criteria>The component is readable without interaction and source assertions prove it cannot submit, persist, score, or block learning.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-prompts.test.ts</automated></verify>
  <done>All five teaching pauses are static, accessible, and contract-bound.</done>
</task>
<task type="auto">
  <name>Task 2: Build the page-owned output session, bilingual current-chapter page, downloads, and responsive layout</name>
  <files>src/composables/usePythonDataToolsOutputSession.ts, src/components/PythonDataToolsPagedLesson.vue, src/styles/modules/python-data-tools.css, src/styles/index.css, tests/python-data-tools-runtime-page.test.ts, tests/python-data-tools-runtime-outputs.test.ts</files>
  <read_first>
    - src/components/LinearRegressionPagedLesson.vue
    - src/components/LogisticRegressionPagedLesson.vue
    - src/styles/modules/linear-regression.css
    - src/styles/modules/linear-regression-responsive.css
    - src/components/PythonDataToolsResultBlock.vue
    - src/components/PythonDataToolsTeachingPrompt.vue
    - src/utils/publicPath.ts
    - src/utils/pythonDataToolsOutputs.ts
    - src/data/generated/pythonDataToolsRuntime.generated.ts
  </read_first>
  <action>Reuse the proven paged structure, excluding its percentage. Create one `usePythonDataToolsOutputSession` instance owned by `PythonDataToolsPagedLesson.vue`: on page-session mount it issues exactly one automatic manifest request, uses AbortController plus monotonically increasing request tokens to abort/invalidate replacement or unmounted requests, and distributes readonly typed states by contract result ID. After the initial manifest failure, body/code/prompts remain rendered and the page shows exactly one bilingual manual action labelled “重新加载运行结果” / “Reload runtime results”. Its click atomically consumes a `manualReloadAvailable` allowance and begins one final request; the control disappears while loading and never reappears in that page session, even if the manual request also fails. Do not use timers, automatic retry, watchEffect loops, per-result reloads, or more than one manual control/request allowance. Render only the supplied current chapter; derive TOC/pager from contract order; close mobile TOC after navigation and preserve chapter/location when locale changes. For every bound result, pass both the generated `PythonDataToolsResultPresentationBlock` and the session state through PagedLesson → ResultBlock/Plotly; tests reject a handwritten runtime copy registry. Add both Notebook downloads using manifest/base-resolved paths, exact Chinese label, executed/contains outputs/local Python disclosure, and environment dependency link. Import module-scoped CSS through `styles/index.css`; include keyboard focus, non-color state labels, long-text containment, and reduced-motion rules while leaving the complete viewport matrix to Stage 5.</action>
  <acceptance_criteria>Page/output tests prove one automatic manifest request per page session, stale/abort cleanup, typed state distribution, exactly one bilingual single-use manual reload after the initial failure, no second manual request/control after success or repeated failure, no timers/retry loop, 8-entry TOC, current-only article, pager, two download placements, generated presentation forwarding, no handwritten copy registry, no percent/pass UI, and safe renderer/base helper use.</acceptance_criteria>
  <verify><automated>node --test tests/python-data-tools-runtime-page.test.ts tests/python-data-tools-runtime-prompts.test.ts && npm run build:pages</automated></verify>
  <done>The dedicated page is ready to be atomically selected by the runtime integration plan.</done>
</task>
</tasks>

## Artifacts this phase produces

- `PythonDataToolsTeachingPrompt` and `PythonDataToolsPagedLesson` Vue components plus `usePythonDataToolsOutputSession` session owner.
- `.python-data-tools-*` scoped responsive/sticky/pager/result/fallback style rules.

<threat_model>
| Threat ID | Category | Component | Severity | Disposition | Mitigation Plan |
|---|---|---|---|---|---|
| T-PDT4-13 | Elevation of privilege | Generated Markdown render | medium | mitigate | Only `MarkdownMathContent`/sanitizer renders prose; no raw component `v-html`. |
| T-PDT4-14 | Tampering | Download/resource paths | medium | mitigate | Fixed manifest-owned paths through `withPublicBase`; no user-controlled path. |
</threat_model>

<verification>As the Wave 7 validation owner, after Plan 09 completes run page/prompt/output tests, `node --test tests/python-data-tools-*.test.ts`, `npm test`, `npm run build:pages`, and `git diff --check`.</verification>
<success_criteria>The page teaches exactly one of eight chapters at a time, remains bilingual/base-safe, and exposes no prompt or mastery machinery.</success_criteria>
<output>Create `docs/superpowers/plans/2026-07-15-python-data-tools-stage-4-09-SUMMARY.md` when done.</output>
