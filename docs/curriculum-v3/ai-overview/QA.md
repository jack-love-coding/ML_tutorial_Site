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
| `npm test` | PASS | 510 tests passed; 0 failed, skipped, cancelled, or todo |
| `npm run build` | PASS | Vite 8.0.16; 2,463 modules transformed |
| `npm run build:pages` | PASS | Vite 8.0.16; 2,463 modules transformed |
| `npm run security:audit` | PASS | `found 0 vulnerabilities` |
| `npm run build` (last) | PASS | Standard-base production output rebuilt after the Pages build; 2,463 modules transformed |
| `python scripts/manim/render_ai_overview.py --check` | PASS | AI Overview Manim assets and integrity metadata are in sync |

Both production builds emitted the same existing warning: `Some chunks are larger than 1400 kB after minification.` No new build error or security finding was produced.

## Failures found and RED/GREEN closure

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
| 12. Mobile/reduced-motion fallbacks | PASS | Each of the 3 complex labs becomes 4 labeled static states; controls are absent at 390 px and under reduced motion; posters/keyframes/transcripts retain the lesson. |
| 13. Reproducibility/storage | PASS | Assets use local public paths; Imagegen and Manim manifests are auditable; Manim integrity check passes; no temporary or absolute runtime asset path is used. |
| 14. Existing-system integration | PASS | `/learn/ai-overview` remains canonical and lazy-loaded through the existing LessonPage/AlgorithmView path. The algorithm, Math Lab, and Data Lab v1 localStorage keys remain present. No old URL or progress store was removed. |
| 15. Testing/verification | PASS | 510 automated tests plus desktop, mobile, reduced-motion, print, keyboard, console, network, and asset checks pass. |
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
