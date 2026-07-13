# Curriculum V3.1 AI Overview — QA Record

Date: 2026-07-13

Branch: `codex/v3-1-ai-overview-rebuild`

Route under test: `/learn/ai-overview`

Overall result: **DONE_WITH_CONCERNS**

The Phase 1 AI Overview course passes its automated, content, asset, integration, and browser gates. The two recorded concerns are non-blocking: `traffic-signals` is the single explicitly approved deferred image record, and Vite reports the pre-existing warning that some minified chunks exceed 1400 kB.

## Automated verification

The required commands were run from a clean standard build sequence. `build:pages` was completed before the final standard build; browser QA used the output from the final `npm run build`.

| Command | Result | Exact evidence |
| --- | --- | --- |
| `npm test` | PASS | 517 tests passed; 0 failed, skipped, cancelled, or todo |
| `npm run build` | PASS | Vite 8.0.16; 2,464 modules transformed |
| `npm run build:pages` | PASS | Vite 8.0.16; 2,464 modules transformed |
| `npm run security:audit` | PASS | `found 0 vulnerabilities` |
| `npm run build` (last) | PASS | Standard-base production output rebuilt after the Pages build; 2,464 modules transformed |
| `python scripts/manim/render_ai_overview.py --check` | PASS | AI Overview Manim assets and integrity metadata are in sync |

Both production builds emitted the same existing warning: `Some chunks are larger than 1400 kB after minification.` No new build error or security finding was produced.

### Final whole-branch review closure

The final review package identified eight connected teaching-contract gaps. They are closed as follows:

1. The five existing AI Overview checkpoint items now render beside their owning chapters in groups of 2/1/2. The former page-bottom duplicate is absent only on AI Overview; other algorithm modules retain their scored module checkpoint.
2. The learning-paradigm checkpoint now uses three unseen scenarios: labeled defect inspection, unlabeled music grouping, and reward-driven notification scheduling.
3. The ML process tracer uses one fixed record consistently: learner identifier `L-07`, candidate historical score `62`, selected feature `x = 3 h`, target `y = 68`, and a separate unseen evaluation record that does not update parameters.
4. Regression exposes synchronized five-row prediction/residual/squared-error detail, seven ranked candidate lines, current-candidate/current-best readouts, and a two-row regression/classification comparison. All calculations reuse the lab's shared deterministic utilities.
5. The mobile/reduced-motion Q-learning fallback's second frame is a real single action update from seed 7107: state `3,0`, action `up`, old Q `0`, reward `-1`, next maximum `0`, target `-1`, correction `-1`, and new Q `-0.5`. It has exactly four frames and no range controls.
6. The interaction protocol names only the three mounted labs and their real controls/readouts. Stale scenario-card and highlight interactions were removed.
7. The Q-learning tests now cover the complete greedy tie order `up → right → down → left` and deterministic goal termination in 6 steps, below the 64-step cap.
8. The Q-learning Manim checked labels now state the authoritative first actual exploration result: 26 steps and reward -25. Runtime labels, checked JSON, and integrity metadata match. The MP4, poster, and keyframes were checked but not rerendered; only the checked label payload and its integrity hash changed.

Assessment adjudication: these chapter-local checkpoints are immediate formative explanation only. They create no score, submit action, quiz attempt, completion/progress write, navigation gate, teacher-acceptance workflow, or backend request. Existing stored completions and route access remain untouched.

TDD evidence for this closure:

- RED: the initial eight-file focused run produced 70 tests, 60 passes, and the expected 10 semantic failures covering placement, scenarios, tracer roles, regression surfaces, static Q terms, protocols, Manim labels, and responsive styling.
- GREEN: the same focused run passed 73/73 after implementation.
- Expanded AI Overview regression set passed 97/97.
- The first full suite exposed two generic protocol-registration compatibility failures; after retaining the registered `ai-overview-task-lab` compatibility ID, the focused protocol set passed 12/12.
- Final complete suite passed 517/517.
- Fresh-browser verification of the final standard build passed at desktop and 390 × 844, with 0 console errors, 0 warnings, no failed request, and only successful static responses plus expected 206 video range responses.

## Failures found and RED/GREEN closure

### Review closure: keyframes, full Q table, scoped print, and real keyboard operation

The written review found four verification gaps after the first QA pass. They are closed in one follow-up change:

1. Manim metadata keyframes are now part of the typed runtime media contract. Reduced motion hides each video and renders its localized poster plus the exact metadata sequence: regression 3 frames, K-means 3 frames, and Q-learning 4 frames. Every runtime path is passed through `withPublicBase`.
2. `createQTable` now retains all 16 grid states, including the two obstacle states as explicit four-action zero rows. A direct `Vue reactive(...)` clone regression test proves that `cloneQTable` accepts the proxy, creates independent row objects, and leaves the source unchanged after training the clone.
3. Print uses the named page `ai-overview`; the route-scoped `.algorithm-view--ai-overview` alone selects it. No unqualified `@page { ... }` rule remains.
4. Browser evidence now operates the controls with real keyboard events, rather than checking focus styling alone.

RED/GREEN evidence:

- RED: `node --test tests/aiOverviewResponsive.test.ts tests/aiOverviewQLearning.test.ts` reported 17 passes and the expected 4 failures: the missing 16-state table, typed keyframe sequence, reduced-motion keyframe DOM/CSS, and named print page.
- GREEN: the same command passed 21/21.
- Expanded AI Overview regression set passed 41/41: Q-learning, labs, responsive behavior, assets, and Manim assets.
- `python scripts/manim/render_ai_overview.py --check` passed after mechanically regenerating the integrity-bound Q-learning fixture and metadata hashes.
- Chromium reduced-motion inspection showed all 3 videos at `display: none`, fallback grids at `display: grid`, exact frame counts `[3, 3, 4]`, loaded local poster/keyframe images, localized captions, and readable transcripts.
- Chromium opened the full Q table by pressing Enter on its summary and observed 16 state rows, each with 4 action values; obstacle states `1,1` and `2,2` each contained four `0.00` values.
- Chromium PDF with `preferCSSPageSize` produced one 841.92 × 594.96 pt A4 landscape page for AI Overview. `/learn/gradient-descent` had `page: auto`, no named-page element, and retained the browser default Letter page size.

### Second review closure: obstacle-safe Manim snapshots

The second written review caught an important reproducibility regression at the fixture-to-renderer boundary. Expanding the audit Q table to all 16 states also put the obstacle rows into each generated policy. The existing Manim renderer had assumed those rows were absent, so a future render would recolor the red obstacle cells and draw policy arrows over them.

- RED: the new focused Manim contract failed because policy state `1,1` was present as `up`.
- GREEN: the fixture generator now retains all 16 Q-table rows but omits the goal and both obstacles from the 13 navigable policy states. The renderer independently skips `OBSTACLES` as well as `GOAL` when recoloring cells and drawing arrows.
- The actual obstacle coordinates are `1,1` and `2,2`; the prior `2,1` QA reference was a transcription error and is corrected in tests and browser evidence.
- The fixture and integrity metadata were regenerated through the official renderer module's deterministic fixture/metadata functions. `python scripts/manim/render_ai_overview.py --check` then passed. The MP4, poster, and keyframe assets were verified but were not rerendered during this repair.
- The focused Q-learning/labs/responsive/assets/Manim set passed 42/42 at that review stage; the final complete suite now passes 517/517.

### Q-learning reactive-proxy clone

Browser QA found one real failure in **Train one episode**: Chromium raised `DataCloneError: Failed to execute 'structuredClone' on 'Window': #<Object> could not be cloned.` A fresh reload reproduced it without requiring any prior interaction.

Root cause: Vue exposes `qTable.value` as a reactive proxy. `structuredClone(qTable.value)` cannot clone that proxy. The single-action path already used the row-by-row table clone in the Q-learning utility, so the minimal repair exported and reused that clone for full episodes.

RED/GREEN evidence:

1. Extended `tests/aiOverviewLabs.test.ts` to require `cloneQTable(qTable.value)` and reject `structuredClone(qTable.value)`.
2. RED: `node --test tests/aiOverviewLabs.test.ts` produced 6 passes and the expected 1 failure.
3. Applied the minimal utility/component repair.
4. GREEN: `node --test tests/aiOverviewLabs.test.ts tests/aiOverviewQLearning.test.ts` passed 20/20.
5. Updated the integrity-bound Q-learning source hash and fixture hash, then ran the Manim sync check.
6. Related Manim/Q-learning verification passed 29/29; the complete suite passed 510/510; both builds and the security audit passed again.
7. Browser retest passed single action, one episode, continuous training, pause, evaluation/policy display, full Q table, and reset with 0 console errors and 0 warnings.

### One-page print contract

The first real A4 landscape render correctly isolated the knowledge map but produced 2 pages: all teaching content fit on page 1 after compacting, while inherited root/app minimum-height and decorative backgrounds forced an otherwise empty page 2.

RED/GREEN evidence:

1. Extended `tests/aiOverviewResponsive.test.ts` to require A4 landscape, print-only map compaction, removal of the fixed decorative pseudo-element, and reset of app-shell minimum height.
2. RED: `node --test tests/aiOverviewResponsive.test.ts` produced 6 passes and the expected 1 failure for each newly introduced missing print contract during diagnosis.
3. Applied print-only CSS: 0.9 map zoom, white print root/body, hidden body pseudo-element, zero app-shell minimum height, and zero site-main padding.
4. GREEN: the targeted file passed 7/7.
5. A fresh standard build and Chromium PDF render produced exactly **1 A4 landscape page** at 842.88 × 595.92 pt. Visual inspection confirmed all five knowledge-map sections and the seven route labels remain readable and unclipped.

## Requirement coverage: design sections 1–18

| Design section | Result | Runtime or artifact evidence |
| --- | --- | --- |
| 1. Purpose | PASS | The page closes the loop from problem framing through model feedback, deterministic experiments, misconception feedback, and next-route guidance. |
| 2. Decisions and architecture | PASS | Typed course data remains in `src/modules/ai-overview/data`; Vue components compose presentation; deterministic math remains in utilities. No broad Math/Data/Algorithm rewrite occurred. |
| 3. Learner contract | PASS | Entry/exit framing is bilingual; checkpoints are local formative feedback and create no score, learner report, or backend grading request. |
| 4. Narrative and vocabulary | PASS | Stable `x`, `y`, `ŷ`, residual/MSE, center/assignment, state/action/reward/Q-value terms agree across prose, labels, labs, and fixtures. |
| 5. Eight chapters | PASS | Exactly 8 ordered bilingual chapters; minutes are 12, 18, 18, 22, 15, 18, 20, 12 = **135 minutes**. Each chapter has at least one declared primary companion. |
| 6. Formative checkpoints | PASS | Exactly 5 explainable items represent the approved 4 formative groups; every item has bilingual reasoning, misconception feedback, and a valid revisit chapter. |
| 7. Visual language/accessibility | PASS | Generated media has audited alt text; color is supplemented by labels/shapes; focus outline is 3 px; mobile/reduced-motion/print alternatives preserve teaching information. |
| 8. Imagegen inventory | PASS WITH APPROVED EXCEPTION | Manifest has exactly 12 records: 11 available local PNGs and one approved deferred record, `traffic-signals`, with no runtime path/source and a localized deferred notice. |
| 9. Manim inventory | PASS | Exactly 3 packages at 85/88/90 seconds, with 3 MP4s, 3 posters, 10 keyframes, Chinese transcripts, English summaries, localized labels, fixture contracts, and integrity hashes. |
| 10. Code-native visuals | PASS | All 8 are present: AI world map, traditional-AI stepper, ML process tracer, paradigm comparison, decision tree, assistant composition map, seven-stage LLM route, and a verified one-page printable knowledge map. |
| 11. Experiment contracts | PASS | Regression, K-means, and Q-learning state/math are deterministic and utility-owned; reset/replay and invalid-input normalization are covered by tests and browser checks. |
| 12. Mobile/reduced-motion fallbacks | PASS | Each of the 3 complex labs becomes 4 labeled static states; controls are absent at 390 px and under reduced motion; videos are replaced by typed poster/keyframe sequences of 3/3/4 frames with localized captions and readable transcripts. |
| 13. Reproducibility/storage | PASS | Assets use local public paths; Imagegen and Manim manifests are auditable; Manim integrity check passes; no temporary or absolute runtime asset path is used. |
| 14. Existing-system integration | PASS | `/learn/ai-overview` remains canonical and lazy-loaded through the existing LessonPage/AlgorithmView path. The algorithm, Math Lab, and Data Lab v1 localStorage keys remain present. No old URL or progress store was removed. |
| 15. Testing/verification | PASS | 517 automated tests plus desktop, mobile, reduced-motion, print, keyboard, console, network, and asset checks pass. |
| 16. Delivery sequence | PASS | Task reports/manifests from the preceding content, visual, lab, asset, and responsive stages were checked before this final audit. |
| 17. Non-goals | PASS | No backend grading, learner-report generation, AI-history expansion, Transformer mechanics, or wholesale curriculum migration was introduced. |
| 18. Written review gate | PASS | This QA record and `browser-evidence.md` provide the final auditable review evidence. |

## Exact inventory evidence

- Course: 8 chapters, 135 minutes, complete `zh-CN` and `en` titles/content/callouts.
- Checkpoints: 5 items across 4 formative groups; local explanatory feedback only.
- Image manifest: 12 exact records, 11 available, 1 approved deferred (`traffic-signals`).
- Runtime media: 12 generated-media records plus 3 Manim video records.
- Manim: 3 scenes, 263 total seconds, 10 keyframes, matching transcripts/summaries/labels/posters/MP4s.
- Code-native visuals: 8/8 present and mounted in their specified chapters.
- Interactive labs: regression has 3 presets; K-means supports `K=2..5` and seed 3103; Q-learning uses a 4×4 environment, seed 7107, and rewards +10/-1/-3.
- Compatibility: all three v1 progress stores remain: `ml-atlas:algorithm-progress:v1`, `ml-atlas:math-lab-progress:v1`, and `ml-atlas:data-lab-progress:v1`.

## Final concerns and disposition

1. **Approved content exception:** `traffic-signals` is intentionally deferred. The manifest and runtime both expose it as unavailable without a placeholder URL; the page shows bilingual deferred copy. This is not a broken request or hidden missing file.
2. **Existing bundle warning:** Vite still reports chunks over 1400 kB. Both production variants complete successfully, and the AI Overview route remains lazy-loaded. Bundle splitting is outside this audit's scope.

No blocking issue remains.
