# Curriculum V3.1 AI Overview — Browser Evidence

Date: 2026-07-13

Preview: `http://127.0.0.1:4173/learn/ai-overview`

Runner: bundled Playwright CLI, named Chromium sessions under `task11-ai-overview*`

Browser screenshots, snapshots, request logs, and PDFs were written only to ignored `output/playwright/task-11-ai-overview*` directories and are not part of the commit.

## Desktop bilingual matrix

At 1280 px desktop width, Chinese and English both rendered all eight chapters in the approved order:

1. `three-problems` — 一个助手，三个问题 / One Assistant, Three Problems
2. `ai-world-map` — AI 世界地图 / A Map of the AI World
3. `ml-common-language` — 机器学习的共同语言 / The Common Language of Machine Learning
4. `supervised-linear-regression` — 监督学习与线性回归 / Supervised Learning and Linear Regression
5. `learning-paradigms` — 三种学习范式 / Three Learning Paradigms
6. `unsupervised-kmeans` — 无监督学习与 K-means / Unsupervised Learning and K-means
7. `reinforcement-q-learning` — 强化学习与 Q-learning / Reinforcement Learning and Q-learning
8. `choose-learning-approach` — 选择学习方法 / Choose a Learning Approach

The English page reported `html lang="en"`, all eight localized headings, substantive English chapter content, and all 15 visible companion/media figures. Switching back restored `zh-CN` without losing lab access.

### Traditional AI stepper

All four modes were selected and advanced through all 4/4 steps:

- Search reached the robot's correct rightward move and continuation.
- Planning produced the prerequisite → deep learning → Transformer plan.
- Expert system produced the fan/power-off recommendation.
- Logic derived the prerequisite conclusion.

### Linear regression

- Clear trend default: `w=4`, `b=48`, MSE `39.60`.
- Noisy trend selected: MSE `47.80`.
- Outlier selected, one step: `w=5`, `b=48`, MSE `129.40`.
- Auto play/pause reached `w=6.6`, `b=45.8`, MSE `73.84`.
- Reset restored clear trend exactly: `w=4`, `b=48`, MSE `39.60`.

### K-means

- `K=2`, one step: iteration 1, assignment phase, within-group distance `13074.0`, history `2/12`.
- Reset, reselect `K=2`, replay one step: the same `13074.0` and `2/12`, proving deterministic replay.
- `K=5`, auto-run: converged at iteration 2, within-group distance `1228.2`, history `6/6`.

### Q-learning

After the RED/GREEN repair recorded in `QA.md`:

- Single action then **Train one episode** completed episode 1, cumulative reward `-9`, reset current state to row 3/column 0, and displayed the last numeric update (`1,3`, up, `5.00`).
- Continuous training was paused at episode 28; the learned policy evaluated to a 6-step route and the Q values were populated.
- The full Q table opened with its header and 14 navigable-state rows.
- Reset restored the initial state.
- The post-repair sequence produced 0 console errors and 0 warnings.

### Formative checkpoint and keyboard behavior

Selecting an incorrect first-checkpoint option immediately showed:

- the revisit link `/learn/ai-overview#ml-common-language`;
- an explanation of the correct reasoning;
- why the tempting choices were wrong;
- misconception tags including `test-data-as-training-feedback` and `prediction-as-answer-copy`.

Selecting the correct option retained explanatory feedback. No score, submission, or backend request was created. Keyboard Tab focus landed on an anchor with a computed solid 3 px outline.

## Video, transcript, and generated-media evidence

The page exposed 3 labeled Manim videos with matching MP4/poster pairs:

- 线性回归参数搜索 / Linear-regression parameter search
- K-means 收敛 / K-means convergence
- Q-learning 策略形成 / Q-learning strategy formation

All 3 Chinese transcript bodies were present (829, 791, and 1,238 characters), with matching English summary labels. In the full scroll pass, all 11 available generated PNGs loaded successfully with non-empty localized alt text and fit their containers. The only deferred notice was localized as `插图稍后补充。` / `Illustration deferred.` The DOM contained no `traffic-signals` image source.

A final fresh browser session reached network idle with **0 console messages (0 errors, 0 warnings)**. Its request log contained only successful 200 static responses and expected 206 video range responses. It contained no failed request and no request for `traffic-signals`.

## Mobile matrix: 390 × 844

- Document `clientWidth` and `scrollWidth` were both 390 px: no page-level horizontal overflow.
- Visible desktop lab controls: 0.
- Static fallbacks: 3, each with exactly 4 labeled frames.
- Generated media overflow failures: 0; overlap pairs: 0.
- All 11 generated images loaded during the scroll pass; each measured 304 px inside a 330 px container.
- The two wide tables measured 608 px within 330/294 px wrappers; both wrappers used `overflow-x: auto`, so they scroll safely instead of clipping the document.

The four static states preserved these exact teaching values:

| Lab | Initial | One update | Intermediate | Converged/evaluated |
| --- | --- | --- | --- | --- |
| Regression | `w=4, b=48, MSE=39.6` | `w=5, b=48, MSE=9.4` | `w=6, b=47, MSE=0.6` | `w=6.5, b=46, MSE=0.15` |
| K-means | iteration 0, initialize, 0 | iteration 1, recompute, 1293.5 | iteration 2, assign, 1293.5 | iteration 2, converged, 1293.5 |
| Q-learning | 0 episodes, 32 steps, reward -32, no policy | 1, 32, -32, no policy | 12, 6, +5, policy | 40, 6, +5, policy |

State names, numeric labels, symbols, and text accompany color, so the lesson does not rely on color alone.

## Reduced-motion matrix

With a 1280 × 900 viewport and `prefers-reduced-motion: reduce`:

- `matchMedia('(prefers-reduced-motion: reduce)')` was true.
- Visible desktop labs: 0; fallback frame counts remained `[4, 4, 4]`.
- All 3 videos were paused, had `autoplay=false`, and remained at `currentTime=0` with their correct posters.
- All 3 transcript bodies remained readable.
- Computed animation was `none`; scroll behavior was `auto`.

Thus key information is available through static state frames, poster/keyframe media, labels, and transcripts rather than motion.

## Print map

Under print media:

- the site header, algorithm hero, other story cards, and print button were hidden;
- only `choose-learning-approach` and the knowledge map remained visible;
- the map contained `common-loop`, `paradigm-comparison`, `representative-algorithms`, `decision-tree`, and `llm-route` sections;
- print root/body backgrounds became white and the fixed decorative body pseudo-element was hidden.

The first A4 landscape render exposed an extra blank/decorative second page, which was fixed with the RED/GREEN print contract recorded in `QA.md`. The post-fix render completed as exactly **1 page** at 842.88 × 595.92 pt, unencrypted, with no embedded JavaScript. Visual inspection confirmed all five map sections and all seven route labels are readable and unclipped. This verifies the approved one-page map independently of the interactive page chrome.

## Browser disposition

Desktop Chinese/English, all requested interaction branches, mobile, reduced motion, print, keyboard focus, media/transcripts, and a fresh console/network pass all succeed. The only visible missing-media state is the approved `traffic-signals` deferral; it does not generate a broken request.
