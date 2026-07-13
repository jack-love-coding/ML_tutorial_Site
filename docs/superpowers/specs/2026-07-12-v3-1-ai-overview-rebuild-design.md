# V3.1 Phase 1 AI Overview Rebuild Design

**Date:** 2026-07-12<br>
**Status:** Approved<br>
**Scope:** Rebuild the existing `ai-overview` runtime course in place. Preserve its ID, URL, shared LessonPage shell, and legacy accessibility while replacing its teaching body, formative checkpoints, visuals, and lesson lab.

## 1. Purpose

This phase turns AI Overview into the first course of the V3.1 foundation route. It gives a zero-prerequisite learner a stable map of AI and machine learning before Python, mathematics, NumPy, probability, classical ML, deep learning, Transformers, and large language models.

The course is not an algorithm survey and does not require the learner to implement an algorithm. It must let the learner:

- explain the common machine-learning loop from data to evaluation;
- distinguish supervised, unsupervised, and reinforcement learning by their learning signals and outputs;
- follow one real update mechanism for linear regression, K-means, and Q-learning;
- identify where traditional search, planning, expert systems, and logic fit outside machine learning;
- locate deep learning, generative AI, and large language models in the longer route;
- verify the key ideas through deterministic visualizations, small experiments, and formative feedback.

Target study time is 120–150 minutes across eight medium chapters. The course may be completed in three sittings.

## 2. Decisions and Architecture Choice

Three implementation approaches were considered:

1. **Rebuild `ai-overview` in place using the existing typed algorithm module and LessonPage pilot.** This preserves `/learn/ai-overview`, progress compatibility, lazy routing, shared rendering, and the current Curriculum Catalog adapter while allowing chapter-specific labs and visuals.
2. Add a parallel V3-only AI Overview route and redirect later. This would create duplicate content, progress migration work, and an avoidable temporary split between V2 and V3.
3. Replace the algorithm lesson system with a new V3 renderer before authoring the course. This would expand the work into a platform migration and violate the progressive Curriculum V2 guardrail.

Approach 1 is selected. The implementation will:

- retain `slug: 'ai-overview'` and `route: '/learn/ai-overview'`;
- retain the shared `LessonPage` and lazy route path;
- replace the current five chapter bodies with eight bilingual chapters;
- replace the single scenario-card lab with chapter-specific typed visuals and experiments behind the existing AI Overview lab registration;
- place deterministic math in focused TypeScript utilities, not Vue templates;
- keep formal grading, uploads, teacher acceptance, and backend evidence out of scope;
- prepare the course for the V3.1 route-version integration phase without changing route completion semantics in this phase.

## 3. Learner Contract

### Entry assumptions

The learner may have no Python, calculus, linear-algebra, probability, or machine-learning background. High-school arithmetic and the ability to read a simple chart are sufficient.

### Exit capabilities

After the course, the learner can:

1. explain the roles of data, feature, target, model, parameter, prediction, error, training, and evaluation;
2. distinguish an identifier from a feature and a target in a small learner-data table;
3. explain why training performance does not prove performance on unseen data;
4. classify a problem as supervised, unsupervised, reinforcement, or a combination by identifying its learning signal;
5. read one complete linear-regression parameter search, K-means convergence, and Q-learning strategy-formation sequence;
6. explain that AI includes non-ML methods and that deep learning is a model family rather than a fourth learning-signal category;
7. place generative AI and LLMs on the longer path without claiming to understand their internal mechanisms yet;
8. state the next route: Python, mathematical language and NumPy, probability, classical ML, deep learning, Transformer, LLM.

### Assessment boundary

All four checkpoints are formative. They provide immediate explanations, misconception tags, and a chapter to revisit. They do not produce a score, block navigation, submit evidence, or perform teacher acceptance.

## 4. Narrative Anchor and Stable Vocabulary

The course uses one intelligent learning assistant facing three different questions:

- **supervised learning:** predict the learner’s next exercise score;
- **unsupervised learning:** discover similar learning patterns;
- **reinforcement learning:** choose the learner’s next exercise.

The supervised anchor predicts a continuous score so it is mathematically consistent with the selected representative algorithm, linear regression. Correct/incorrect prediction appears only as a classification contrast.

The three algorithms share the learning context first, then receive one classic transfer example:

- linear regression → house-price prediction;
- K-means → user segmentation;
- Q-learning → grid navigation.

Stable terms and variables:

- `x`: one selected input feature, initially practice duration;
- `y`: observed next-exercise score;
- `ŷ`: predicted score;
- `w`, `b`: linear-model parameters;
- MSE: mean squared error, introduced through one worked calculation;
- `K`: requested cluster count;
- center: the current mean position of a cluster;
- state, action, reward, Q value: the minimum reinforcement-learning vocabulary;
- train data and unseen test data: the only required evaluation split distinction in this course.

Chinese is authored and reviewed first. English is a semantic adaptation with equal teaching depth and the same variables, data, formulas, experiments, and feedback; it is not a literal sentence-by-sentence translation.

## 5. Eight-Chapter Course Design

### Chapter 1 — One Assistant, Three Problems

**Question:** Why can the same intelligent assistant need three different ways to learn?

The chapter directly labels the three tasks as supervised, unsupervised, and reinforcement learning. It does not delay the answer. Each task presents four elements:

- problem;
- available information;
- how it learns;
- output.

The chapter uses three separate 4:3 Chinese information illustrations with a shared layout: context scene above and a four-cell information area below. The English page reuses the Chinese asset with an English explanation and bilingual label table.

### Chapter 2 — A Map of the AI World

**Question:** How are AI, machine learning, deep learning, generative AI, and LLMs related?

The chapter contains:

- a nested concept map showing AI as the widest region, machine learning inside AI, deep learning inside machine learning, and generative AI/LLMs positioned within the deep-learning region;
- a brief route statement that LLM understanding depends on deep learning, neural networks, probability, data, and computation;
- four traditional-AI mechanism cards: search, planning, expert systems, and logic reasoning;
- one switchable step demonstrator that highlights current state, applicable candidate/rule, selected step, and result for each traditional method.

The course does not add AI history, model family catalogs, Transformer mechanics, tokenization, or pretraining here.

### Chapter 3 — The Common Language of Machine Learning

**Question:** What actually happens between a row of data and a useful prediction?

One learner record moves through the entire loop. The fixed table columns are:

- learner ID;
- practice duration;
- historical score;
- next score.

The chapter distinguishes identifier, candidate feature, selected feature, and target. The first model selects practice duration as `x` and next score as `y`. The visual trace proceeds through:

`data → feature/target → model → prediction → error → parameter update → evaluation on unseen data`

The evaluation boundary is limited to training data versus unseen data. Validation sets, cross-validation, metric families, deployment, and monitoring remain later-course topics.

A compact boundary note explains that missing, biased, or privacy-sensitive data can make the result unreliable. Detailed data quality and governance remain in Data Lab.

The first two formative checkpoints appear consecutively:

1. order the training loop;
2. identify the learner ID, feature, and target in the data table.

### Chapter 4 — Supervised Learning and Linear Regression

**Question:** How can a model use examples with answers to learn a numerical prediction?

The chapter uses the learner-score data and the equation:

`ŷ = wx + b`

The learner first changes `w` and `b` manually and observes the line, predictions, residuals, and MSE. One sample is calculated completely:

`x → ŷ → y - ŷ → (y - ŷ)²`

The remaining squared errors are collected in a table and averaged. Automatic training uses a visible small candidate search over `w` and `b`. The text explicitly calls this a teaching simplification and previews gradient descent as a later, more efficient optimizer.

Three deterministic data presets are available:

- clear trend;
- noisy trend;
- one outlier.

Controls are data preset, `w`, `b`, single search step, automatic search, speed, reset, and residual visibility. The page synchronizes line, prediction table, residuals, and MSE.

House-price prediction is one complete numerical transfer example, not a second experiment. A regression-versus-classification table contrasts score/price prediction with correct-answer and spam classification. Logistic regression and classification thresholds remain later topics.

### Chapter 5 — Three Learning Paradigms

**Question:** Which learning signal makes each paradigm different?

The five comparison dimensions are:

- available information;
- learning signal;
- what is learned;
- output;
- typical problem.

Each paradigm adds two application examples:

- supervised: spam detection and electricity-demand prediction;
- unsupervised: news-topic grouping and image color compression;
- reinforcement: robot-arm control and traffic-signal scheduling.

Misconceptions are corrected beside the relevant concept, including:

- AI, ML, and deep learning are not synonyms;
- unsupervised learning does not mean “no objective”;
- a reward is not a supervised answer label;
- an output number is not automatically generative AI;
- low training error does not prove generalization.

The third formative checkpoint gives three new scenarios. The learner chooses a paradigm and identifies where the label, structural signal, or reward comes from.

### Chapter 6 — Unsupervised Learning and K-means

**Question:** How can a model find groups without answer labels?

The main dataset plots accuracy against mean response time for fixed learner records. The experiment permits `K=2–5`, while the guided explanation and Manim video use `K=3` with a fixed seed.

The mechanism is complete:

1. choose initial centers from existing points using the seed;
2. connect a point to every center and choose the nearest;
3. assign all points;
4. calculate one group’s horizontal and vertical mean explicitly;
5. move every center;
6. repeat until assignments/centers stop changing.

Distance begins visually through comparison lines. Euclidean distance is an expandable formula preview and is formally deferred to the vector course.

Controls are `K`, random seed, single step, automatic run, reset, and timeline navigation. The experiment records initialization, assignment, recomputation, and the plain-language metric “within-group distance total” for every iteration. The formal inertia/WCSS formula is an expandable preview.

The user-segmentation transfer example is static and uses visit frequency and average spending. The chapter states that clusters are not human truths and require interpretation; the algorithm does not automatically name people.

### Chapter 7 — Reinforcement Learning and Q-learning

**Question:** How can repeated action and reward produce a strategy?

The classic environment is a fixed 4×4 grid with start, goal, and a small number of obstacles. Rewards are:

- goal: `+10`;
- each step: `-1`;
- obstacle collision: `-3`.

The chapter maps state, action, reward, and Q value before showing the formula. It first states the relationship in words—old experience plus a learning-rate-scaled correction—then substitutes one numerical update into the Q-learning equation without deriving Bellman theory.

Training uses a fixed learning rate and discount factor. Only exploration rate is adjustable. Training keeps exploration fixed; final evaluation disables exploration so the learned policy can be inspected without random actions.

Controls are random seed, exploration rate, single action, run one episode, continuous training, speed, pause, and reset. The main view shows the current state’s four action values, one update, episode count, cumulative reward, and global policy arrows. The full 16×4 Q table is expandable.

The learning-assistant transfer maps mastery state to state, exercise difficulty to action, and later learning improvement to reward. It demonstrates one update but does not create a second simulator.

The fourth formative checkpoint pairs two directional questions:

1. where a K-means center moves after reassignment;
2. whether one Q value rises or falls after a stated reward.

No complex arithmetic is required.

### Chapter 8 — Choose a Learning Approach

**Question:** How can a learner classify a new problem without relying on memorized examples?

The chapter provides a decision tree:

1. Is there an explicit target answer for examples?
2. Is learning driven by sequential actions and delayed reward?
3. Is the goal to discover structure without provided targets?

The decision tree is explicitly described as an entry tool, not a proof that real systems use only one paradigm.

An intelligent-learning-assistant system map recombines the three modules:

- linear regression predicts a score;
- K-means finds learning patterns;
- Q-learning selects practice.

The seven-stage route is:

`Python → mathematics and NumPy → probability → classical ML → deep learning → Transformer → LLM`

The course ends with a printable bilingual one-page knowledge map containing the common loop, paradigm comparison, three representative algorithms, decision tree, and route. It does not create a score or learner report.

## 6. Formative Checkpoint Contract

The four checkpoint groups are:

1. machine-learning loop order;
2. identifier/feature/target identification;
3. paradigm plus learning-signal identification;
4. K-means center direction plus Q-value direction.

Every response must include:

- why the selected answer is correct;
- why each misconception is tempting but wrong;
- a misconception tag;
- a chapter link to revisit.

Checkpoint submission remains local presentation state. It is not completion evidence and is not sent to a backend.

## 7. Visual Language and Accessibility

### Shared rules

- Reuse actual ML Atlas color tokens after inspecting their current values.
- Bind supervised, unsupervised, and reinforcement learning to stable semantic colors throughout the course.
- Pair color with text, shape, and line style; color is never the only signal.
- Use scientific editorial illustration: clear 2D or light 2.5D composition, high contrast, low decoration, and realistic educational data interfaces.
- Do not use a humanoid robot as the definition of AI.
- Preserve readable formulas, alt text, captions, source records, and reduced-motion behavior.
- Desktop receives full algorithm interactions. Mobile and low-performance modes receive static key steps, values, and explanations rather than the complex controls.

### Bilingual generated-media policy

Generated images and Manim video frames may contain Chinese. English pages reuse those assets and provide an English summary plus a bilingual label table. Manim assets also include a complete Chinese transcript and static keyframes.

For generated image text:

1. attempt direct Chinese generation;
2. inspect every character;
3. if text remains wrong after regeneration, retain the illustration and replace the faulty text region deterministically;
4. record the correction in the asset manifest;
5. never publish misspelled, garbled, or mathematically inconsistent text.

## 8. Imagegen Inventory

The course uses one 16:9 hero and eleven 4:3 Chinese information illustrations. The hero is generated and approved first, then becomes the style reference for the remaining assets. Distinct assets use distinct generation calls.

### 8.1 Hero

**Title:** `AI 学习全景`<br>
**Composition:** a real learner and intelligent learning assistant inspect a learning map; a trend line, clusters, and path arrows hint at the three paradigms. No robot character. The only required embedded text is the title.

### 8.2 Shared information-card layout

The top area contains the context scene. The lower area contains four cells labeled:

- 问题
- 已有信息
- 怎么学
- 输出

### 8.3 Exact embedded copy

| Asset | 问题 | 已有信息 | 怎么学 | 输出 |
| --- | --- | --- | --- | --- |
| 得分预测 | 预测下一次练习得分 | 练习时长、历史得分 | 比较预测分数与真实得分 | 一个预测分数 |
| 模式发现 | 发现相似学习模式 | 正确率、平均答题时间 | 把相似的学习者分到一起 | 若干学习者群组 |
| 练习选择 | 选择下一道练习 | 当前掌握状态、可选难度 | 根据奖励调整下一次选择 | 下一步练习策略 |
| 房价预测 | 预测一套房屋的价格 | 房屋面积、历史成交价 | 比较预测与真实价格，寻找更合适的直线 | 预测房价 |
| 用户分群 | 发现行为相似的用户 | 访问频率、平均消费 | 反复分组并更新群组中心 | 若干用户群组 |
| 垃圾邮件识别 | 判断邮件是否为垃圾邮件 | 邮件内容、发件信息、历史标签 | 比较模型判断与人工标签 | 垃圾邮件或正常邮件 |
| 用电量预测 | 预测下一时段的用电量 | 历史用电、时间、天气 | 比较预测值与真实用电量 | 一个用电量预测值 |
| 新闻主题分组 | 把内容相似的新闻放在一起 | 新闻标题、正文关键词 | 比较内容相似性并反复调整分组 | 若干新闻主题群组 |
| 图片颜色压缩 | 用更少的颜色表示图片 | 每个像素的颜色 | 把相近颜色分组并用中心颜色替换 | 颜色更少的压缩图片 |
| 机器人控制 | 让机械臂稳定抓取物体 | 物体位置、机械臂状态、可选动作 | 尝试动作，根据抓取成功或失败获得奖励 | 机械臂控制策略 |
| 交通信号调度 | 减少路口车辆等待时间 | 各方向车流、当前信号、可选切换动作 | 尝试调度方案，根据等待时间变化获得奖励 | 交通信号控制策略 |

Generation review occurs in four gates:

1. hero;
2. three opening tasks;
3. regression and clustering transfer cases;
4. six extended applications.

## 9. Manim Inventory and Storyboards

Each video is silent and 60–90 seconds. Chinese text, mathematical symbols, and pacing carry the explanation. Each asset package contains:

- 1080p MP4;
- poster;
- static keyframes;
- `metadata.json`;
- complete Chinese transcript;
- English summary;
- bilingual label table;
- source knowledge tree, verbose scene prompt, and Manim source file.

All videos reuse the exact data, parameters, seeds, and semantic colors used by the interactive experiment.

### 9.1 Linear-regression parameter search — about 85 seconds

1. `0–8s`: ask whether practice duration can predict the next score.
2. `8–18s`: reveal axes and the shared clear-trend learner data.
3. `18–30s`: reveal a candidate line and `ŷ = wx + b`; isolate the visual roles of `w` and `b`.
4. `30–44s`: calculate one sample through prediction, error, and squared error.
5. `44–55s`: collect remaining squared errors in a small table and calculate MSE.
6. `55–75s`: try multiple `w`, `b` candidates; synchronize line, residuals, MSE, and a current-best leaderboard.
7. `75–85s`: emphasize the current best line and state that this visible search is a teaching simplification before later gradient descent.

### 9.2 K-means convergence — about 88 seconds

1. `0–8s`: reveal unlabeled learner points and ask whether they contain similar patterns.
2. `8–16s`: set `K=3`; select three existing points as centers using the fixed seed.
3. `16–28s`: connect one point to all centers and assign it to the nearest.
4. `28–38s`: assign every point.
5. `38–52s`: calculate one cluster’s horizontal and vertical mean; move the center; update other centers quickly.
6. `52–72s`: repeat assignment and center updates; draw the within-group-distance-total curve falling each iteration.
7. `72–80s`: mark this run converged when movement becomes negligible.
8. `80–88s`: state that results depend on `K` and initialization and require human interpretation.

### 9.3 Q-learning strategy formation — about 90 seconds

1. `0–8s`: reveal the 4×4 grid, start, goal, obstacles, and reward legend.
2. `8–18s`: identify the current state, four actions, and the meaning of a Q value.
3. `18–34s`: execute one action, receive a reward, move from a Chinese relation to the Q-learning formula, and substitute one numerical update.
4. `34–44s`: contrast exploration with choosing the current best action; keep training exploration fixed.
5. `44–70s`: show episode 1, 5, 20, and 50 snapshots with trajectory, cumulative reward, Q-value color, and policy arrows.
6. `70–82s`: disable exploration for evaluation and compare the initial random path with the learned stable path.
7. `82–90s`: map state, action, and reward back to choosing the next exercise.

## 10. Code-Native Visual Inventory

Eight precise visuals are implemented with SVG, D3, HTML, or Canvas according to the existing component patterns:

1. nested AI/ML/deep-learning/generative-AI/LLM map;
2. switchable search/planning/expert-system/logic step demonstrator;
3. one-record machine-learning process tracer;
4. five-dimension learning-paradigm comparison;
5. learning-paradigm decision tree;
6. three-module intelligent-learning-assistant composition map;
7. seven-stage path to LLMs;
8. printable bilingual one-page knowledge map.

Exact text, values, and state labels remain in typed localized data rather than being baked into a bitmap.

## 11. Interactive Experiment State Contracts

The implementation uses focused deterministic utilities and serializable state. Vue components orchestrate controls and presentation; they do not contain the core math.

### 11.1 Linear regression

Required state:

- dataset preset ID;
- samples `{ x, y }[]`;
- current `w`, `b`;
- candidate-search cursor;
- current and best MSE;
- residual visibility;
- playback mode and speed;
- deterministic history.

Required derived values:

- prediction per sample;
- residual and squared residual per sample;
- MSE;
- candidate ranking;
- line endpoints for the plot domain.

### 11.2 K-means

Required state:

- fixed learner points;
- `K` in `2..5`;
- integer random seed;
- current centers;
- assignments;
- current phase: initialization, assignment, recomputation, or converged;
- iteration number;
- within-group distance total;
- complete replayable history.

Invalid `K`, NaN, Infinity, and invalid seeds are rejected or normalized with understandable feedback.

### 11.3 Q-learning

Required state:

- fixed 4×4 environment;
- start, goal, and obstacle cells;
- current state;
- Q table for four actions per state;
- fixed learning rate and discount factor;
- adjustable exploration rate;
- integer seed;
- episode, step, cumulative reward;
- current update terms;
- policy arrows;
- playback mode and speed.

The training path and final no-exploration evaluation are separate operations. Invalid numeric inputs are bounded and cannot produce NaN or Infinity.

## 12. Static Mobile and Reduced-Motion Fallbacks

Complex algorithm controls do not render on mobile. Each experiment instead provides:

- the initial state;
- one complete update;
- an intermediate state;
- the converged or evaluated state;
- the same values and explanations used by the desktop experiment;
- an explicit note that the desktop version is interactive.

Reduced-motion behavior uses posters and keyframes rather than relying on animated transitions. Every video retains a poster, transcript, and readable key-state sequence.

## 13. Asset Reproducibility and Storage

Follow existing repository conventions:

- generated course images under an AI Overview directory in `public/`;
- Manim scene and render sources under `scripts/manim/`;
- rendered video, poster, keyframes, and metadata under `public/manim/ai-overview/`;
- prompt specifications, asset manifest, source notes, transcripts, and correction records under `docs/`.

Every image manifest entry records asset ID, course use, final prompt, version, generated source, embedded text, correction history, and final public path. Every Manim entry records knowledge tree, scene prompt, source script, shared data/seed contract, render command, output files, transcript, labels, and poster/keyframes.

No runtime asset may reference a local absolute path, temporary directory, remote image, or `$CODEX_HOME` location.

## 14. Existing-System Integration

Expected integration points include:

- `src/data/aiOverviewModule.ts` for the bilingual eight-chapter definition and visual asset references;
- `src/data/algorithmCheckpoints.ts` for four formative checkpoint groups;
- `src/components/AiOverviewLessonLab.vue` as a thin compatibility shell for chapter-specific lab routing;
- `src/modules/ai-overview/` as the dedicated home for typed course data, focused visuals, algorithm labs, and static fallbacks;
- deterministic algorithm utilities under `src/modules/ai-overview/utils/`;
- `src/lessons/interactionProtocol.ts` for the revised formative interaction contract;
- `src/styles/modules/ai-overview.css` for course-scoped styling using existing tokens;
- existing safe markdown/KaTeX and `withPublicBase` paths;
- existing LessonPage, Curriculum Catalog adapter, progress, route, and lazy import behavior.

The implementation must not migrate unrelated Math Lab, Data Lab, Gradient Descent, MLP, homepage, or curriculum-navigation code.

## 15. Testing and Verification

Implementation follows test-driven development for deterministic math and behavior.

### Unit tests

- linear predictions, residuals, MSE, and candidate ranking;
- each deterministic regression preset;
- seeded K-means initialization, assignment, mean update, convergence, history, and `K=2..5` bounds;
- seeded Q-learning action selection, reward handling, update terms, episode transitions, final policy evaluation, and numeric bounds;
- bilingual content parity, eight chapter IDs, visual asset paths, checkpoint links, and exact asset-manifest coverage;
- traditional-AI step sequences and route-map nodes.

### Structural tests

- `/learn/ai-overview` remains the canonical route;
- AI Overview remains a LessonPage pilot and lazy-loaded route;
- all four formative checkpoints reference existing chapters;
- public paths work under normal and GitHub Pages bases;
- no complex lab controls render in the mobile-static variant;
- all image, poster, video, transcript, metadata, and keyframe files referenced by runtime content exist.

### Browser checks

- all eight chapters in Chinese and English;
- desktop interactions for regression, K-means, and Q-learning;
- deterministic reset and replay using seeds;
- mobile static fallback readability;
- reduced-motion fallback;
- keyboard labels, current values, pause/reset, and non-color status cues;
- no console errors, missing assets, text overflow, or unsafe HTML.

### Required commands

- targeted tests during each red/green cycle;
- `npm test`;
- `npm run build`;
- `npm run build:pages`;
- `npm run security:audit`;
- production-preview browser QA after the standard build is the final build written to `dist`.

## 16. Delivery and Review Sequence

Phase 1 implementation uses independently reviewable commits:

1. approved design and implementation plan;
2. typed content/data contracts and failing tests;
3. deterministic algorithm utilities and tests;
4. eight bilingual chapters and formative checkpoints;
5. code-native visuals and desktop/static lab shells;
6. imagegen assets and manifest;
7. Manim source, renders, metadata, transcripts, posters, and keyframes;
8. styling, responsive/static fallback, integration, and complete verification;
9. final content and asset audit.

The user reviews Phase 1 after the full AI Overview course is complete. Only then does planning move to Phase 2: Python Basics plus the visible, non-blocking Python Practical Advanced elective.

## 17. Non-Goals

This phase does not:

- create or modify the Python courses;
- modify the V3.1 route order or route-version completion yet;
- add formal grading, uploads, teacher approval, or backend evidence;
- teach gradient descent derivation, Euclidean vector mathematics, Bellman derivation, validation/cross-validation, Transformer internals, or LLM training;
- create a second house-price, user-segmentation, or exercise-selection simulator;
- add a new UI framework;
- rebuild unrelated courses or remove legacy routes/progress stores;
- publish mobile versions of the complex interactive controls.

## 18. Written Review Gate

Implementation may start after this document is reviewed and its status changes from `Awaiting written review` to `Approved`. The next artifact is a task-by-task implementation plan under `docs/superpowers/plans/`, followed by an isolated implementation workspace and baseline verification.
