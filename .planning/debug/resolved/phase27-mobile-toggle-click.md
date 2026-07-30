---
status: resolved
trigger: "继续推进工作"
created: 2026-07-30T08:41:00+08:00
updated: 2026-07-30T12:15:00+08:00
---

## Current Focus

hypothesis: "The combined scoped layout and QA semantic-probe fixes resolve the reported timeout and every previously masked matrix failure."
test: "Completed."
expecting: "Verified."
next_action: "Archive this resolved session, append the knowledge-base entry, and commit only the four fix files plus resolved debug records."
reasoning_checkpoint:
  hypothesis: "The exact matrix had one UI layout blocker and one QA semantic-probe family: cockpit overflow made the toggle physically unreachable, while rendered `innerText`/space-only matching discarded or transformed valid DOM semantics."
  confirming_evidence:
    - "The failed matrix page was 1440px wide, but the unique intended toggle was at x=1451.96875..1573.96875 and its center had no hit-test target."
    - "Injecting only a scoped one-column grid rule moved the same toggle to x=821.96875 and a normal Playwright trial click passed."
    - "Isolated actions produced the exact GD and method values immediately; `innerText` omitted `更新步 772` and the method ID headings because cockpit CSS hides those headings, while `textContent` included them."
    - "The English bridge had the correct `lang`, href, and approved DOM copy, but `innerText` uppercased two literals and the plain-space boundary regex rejected the approved hyphenated terms."
  falsification_test: "If the scoped CSS and DOM-semantic probes still leave the exact 36-case matrix failing, the combined diagnosis is incomplete."
  fix_rationale: "The CSS rule restores physical actionability; DOM `textContent` preserves exact authored semantics, and accepting either a space or hyphen matches the two approved spellings without removing any assertion."
  blind_spots: "No remaining in-scope blind spot after the exact production matrix, focused suites, build, protected-hash check, and process cleanup all passed."
tdd_checkpoint: null

## Symptoms

expected: "The committed 36-case browser matrix clicks every linear-regression workbench control in Chinese and English at desktop and 390px widths, reports 36 cases and zero failures, and leaves no preview or browser session."
actual: "The matrix times out on its first mobile toggle click because the resolved button remains outside the viewport after Playwright scroll attempts."
errors: "TimeoutError: locator.click: Timeout 30000ms exceeded; locator('.linear-regression-lab .toggle-strip__button') resolved to the Chinese 关闭 button and repeatedly reported element is outside of the viewport or not stable."
reproduction: "Build the site, start Vite preview on 127.0.0.1:4173 with strict port, run scripts/qa/linearRegressionBrowserMatrix.js through the Playwright CLI; offline checks, 143 focused tests, full npm test, and standard build pass before the browser failure."
started: "First observed during Phase 27 Plan 27-11 Task 2 after Plan 27-10 added the semantic mobile browser matrix on 2026-07-30."

## Eliminated

- hypothesis: "The GD and method semantic failures were caused by reading before Vue completed an asynchronous render flush."
  evidence: "The exact settled GD and method strings were already present on the first immediate read; the missing tokens were exclusively in headings hidden by compact-cockpit CSS and therefore excluded by `innerText`."
  timestamp: 2026-07-30T11:25:00+08:00

## Evidence

- timestamp: 2026-07-30T08:41:00+08:00
  checked: "Plan 27-11 release gate before browser execution"
  found: "Offline immutable package check, 143 focused tests, full npm test, and standard production build all passed."
  implication: "The blocker is isolated to real browser interaction/layout or QA targeting rather than numerical assets, unit contracts, TypeScript, or build output."

- timestamp: 2026-07-30T08:41:00+08:00
  checked: "Failed browser process cleanup"
  found: "The exact preview/session trap removed the listener and temporary gate directory; protected hashes remained unchanged."
  implication: "The failure is reproducible from a clean browser/server state and did not contaminate the worktree."

- timestamp: 2026-07-30T10:10:00+08:00
  checked: "Complete matrix runner and atemp control render path"
  found: "The matrix changes the second regularization select to `coefficient-stability`, then locates `.linear-regression-lab .toggle-strip__button`; the component renders exactly one such button in that lab only while this diagnostic stage is active."
  implication: "The selector is semantically broad but is not inherently ambiguous in the expected regularization DOM; geometry and post-select reflow must be observed before blaming targeting."

- timestamp: 2026-07-30T10:10:00+08:00
  checked: "Relevant responsive cascade"
  found: "At 390px the workbench and advanced controls collapse to one column, while the generic toggle rule expands `.toggle-strip` containers but the atemp button is not wrapped in `.toggle-strip`; no static rule alone proves clipping."
  implication: "Computed runtime geometry is required because the failure may arise from the composed workbench/page layout rather than the toggle's own rule."

- timestamp: 2026-07-30T10:20:00+08:00
  checked: "Isolated strict-port production preview at exactly 390x844 after selecting `coefficient-stability`"
  found: "The lab locator count was 1 and resolved to the Chinese `关闭` button at x=63, width=304.1875, y=6090.6875. All vertical ancestors had visible overflow, the document was 390px wide, and Playwright's normal trial click scrolled and passed."
  implication: "The static mobile layout does not make the intended toggle unclickable; the reported timeout depends on the preceding matrix sequence or the matrix action strategy."

- timestamp: 2026-07-30T10:30:00+08:00
  checked: "Committed 36-case matrix unchanged in a fresh browser session"
  found: "The failure reproduced exactly: the unique Chinese `关闭` toggle was visible/enabled/stable, Playwright reported scrolling completed, then repeatedly classified it outside the viewport and alternated with `element is not stable` until the 30-second timeout."
  implication: "The bug is deterministic and sequence-dependent. The locator resolves to the intended element, so simple wrong-target ambiguity is eliminated."

- timestamp: 2026-07-30T10:40:00+08:00
  checked: "Post-timeout geometry in the unchanged matrix session"
  found: "The failing viewport was actually 1440x1000. The intended toggle occupied x=1451.96875..1573.96875 and hit-testing its center returned null. Its 320px side panel began at x=1428.96875 because the cockpit grid computed to 950px inside a linear-course workbench column only 577.03125px wide; the page clips horizontal overflow."
  implication: "The failure is a desktop container/viewport breakpoint layout defect. It is not caused by mobile scrolling, selector ambiguity, animation, or Playwright choosing the wrong toggle."

- timestamp: 2026-07-30T10:50:00+08:00
  checked: "Single-variable counterfactual in the failed browser page"
  found: "A temporary scoped one-column cockpit rule moved the same toggle to x=821.96875 and its normal Playwright trial click passed at 1440x1000; document width remained 1440."
  implication: "The grid/container mismatch is causally confirmed and the minimum fix can remain CSS-only and linear-course scoped."

- timestamp: 2026-07-30T10:55:00+08:00
  checked: "New focused regression assertion before source fix"
  found: "`node --test tests/linear-regression-layout.test.mjs` failed only the new cockpit containment test (11 passed, 1 failed)."
  implication: "The regression test demonstrably detects the missing scoped containment rule before implementation."

- timestamp: 2026-07-30T11:00:00+08:00
  checked: "Focused regression assertion after the scoped CSS fix"
  found: "`node --test tests/linear-regression-layout.test.mjs` passed all 12 tests, including the new containment contract."
  implication: "The source fix satisfies the deterministic regression guard; real production browser verification remains."

- timestamp: 2026-07-30T11:05:00+08:00
  checked: "Focused linear-regression suite after the fix"
  found: "`node --test tests/linear-regression*.test.*` passed all 116 tests with zero failures."
  implication: "The scoped layout correction preserves the complete Phase 27 numerical, content, asset, release, and component contracts."

- timestamp: 2026-07-30T11:15:00+08:00
  checked: "First unchanged production matrix run after the layout fix"
  found: "The toggle click and atemp semantic comparison passed, but the interaction result failed later with `gdTrace:false` and `method:false`; their native controls reported changed/reset correctly and every other exact semantic check passed."
  implication: "The click/layout root cause is fixed. A second runner synchronization defect, previously masked by the toggle timeout, must be confirmed without weakening numerical assertions."

- timestamp: 2026-07-30T11:25:00+08:00
  checked: "Immediate versus animation-frame semantic output around GD and method actions"
  found: "Immediate and next-frame values were identical and exact. `innerText` contained GD MSE/gradient/intercept/weights and method metrics, but omitted the CSS-hidden headings that carry `更新步 772` and `numpy-batch-gradient-descent` / `numpy-lstsq` / `sklearn-linear-regression`; `textContent` included the hidden GD heading."
  implication: "The secondary failure is semantic probe targeting, not Vue timing or wrong numerical output. Reading the hook's full DOM text preserves every existing exact assertion."

- timestamp: 2026-07-30T11:30:00+08:00
  checked: "New semantic-hook release regression before runner fix"
  found: "`node --test tests/linear-regression-release.test.mjs` failed only the new requirement that `readSemanticOutput` use `textContent()` (12 passed, 1 failed)."
  implication: "The second regression guard is demonstrably red before implementation."

- timestamp: 2026-07-30T11:35:00+08:00
  checked: "Semantic-hook release regression after the one-line runner fix"
  found: "`node --test tests/linear-regression-release.test.mjs` passed all 13 tests."
  implication: "The runner now exposes CSS-hidden semantic metadata to the unchanged exact assertions and the source contract prevents regression."

- timestamp: 2026-07-30T11:45:00+08:00
  checked: "Second full production matrix attempt after both confirmed fixes"
  found: "Chinese desktop/mobile passed far enough to enter the English pass. English desktop reported all six semantic checks true and every interaction flag true, but failed only `nextStepPresent:false` and `linearBoundaryVisible:false`."
  implication: "The layout and semantic-hook fixes are effective. The remaining blocker is isolated to English Phase 28 handoff text detection, not controls, data, console, assets, or downloads."

- timestamp: 2026-07-30T11:50:00+08:00
  checked: "English Phase 28 bridge predicates on the failed page"
  found: "The page language was `en`, href was correct, and the approved English sentence matched exactly. `innerText` rendered `PHASE 28` and `OPEN HOUSING PRICE PROJECT`, so case-sensitive literal checks failed; the existing boundary regex failed on `linear-model` / `tabular-regression`, while a space-or-hyphen regex passed."
  implication: "The final failures are QA text-extraction/matching defects. No application copy, route, or locale change is needed."

- timestamp: 2026-07-30T11:55:00+08:00
  checked: "New Phase 28 runner-contract assertions before fix"
  found: "`node --test tests/linear-regression-release.test.mjs` failed only the new Phase 28 DOM-text/hyphen-aware contract (12 passed, 1 failed)."
  implication: "The final regression guard is demonstrably red before implementation."

- timestamp: 2026-07-30T12:00:00+08:00
  checked: "Phase 28 runner-contract assertions after the two probe edits"
  found: "`node --test tests/linear-regression-release.test.mjs` passed all 13 tests."
  implication: "The approved English bridge copy now feeds the unchanged exact literals and boundary requirement through DOM semantics."

- timestamp: 2026-07-30T12:10:00+08:00
  checked: "Fresh strict-port production proof matrix with final source"
  found: "The matrix returned exactly `cases: 36`, `failures: 0`; all 4 interaction records had all six semantic checks and every behavior flag true, and all 8 failure injections passed across zh-CN/en and desktop/mobile-390 with no console errors, warnings, remote asset violations, overflow, overlaps, dead fragments, or empty links."
  implication: "Automated end-to-end verification conclusively proves the original control is actionable and the full semantic release contract is restored; no manual visual checkpoint is needed under the task instructions."

- timestamp: 2026-07-30T12:15:00+08:00
  checked: "Final focused regression, diff, protected baseline, and process cleanup gate"
  found: "The final 44 layout/lab/release tests passed, `git diff --check` passed, protected hashes exactly matched the supplied values, port 4173 was closed, and all named browser sessions were closed."
  implication: "The worktree contains only the four intended fix files plus debug records; it is safe to archive and commit without the protected or generated files."

## Resolution

root_cause: "Both UI layout and QA semantic targeting blocked the exact matrix. The viewport-based desktop cockpit rule selected a 950px internal grid inside a ~577px course column, pushing the correct atemp toggle past x=1440 into clipped content. After that was fixed, rendered `innerText()` excluded hidden control headings and uppercased Phase 28 labels, while a space-only regex rejected approved hyphenated English terms, causing false semantic failures despite correct DOM values."
fix: "Added a linear-course-scoped one-column override for the nested cockpit grid. Changed semantic hook and Phase 28 bridge reads from rendered `innerText()` to DOM `textContent()`, accepted the approved space-or-hyphen English boundary terms, and added RED-to-GREEN layout and runner regression assertions."
verification: "Passed 116 focused Phase 27 tests, 44 final layout/lab/release tests, `npm run build`, `git diff --check`, and the exact strict-port production browser matrix with 36 cases, zero failures, 4 all-true interaction passes, and 8 successful failure injections. Protected hashes remained exact and port 4173/browser sessions were closed."
files_changed:
  - src/styles/modules/linear-regression-responsive.css
  - scripts/qa/linearRegressionBrowserMatrix.js
  - tests/linear-regression-layout.test.mjs
  - tests/linear-regression-release.test.mjs
