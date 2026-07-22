# Verbose Manim Production Prompt — Banknote Feature Scaling

## Production role and non-negotiable contract

Act as the six-stage Math-To-Manim pipeline: ConceptAnalyzer, PrerequisiteExplorer, MathematicalEnricher, VisualDesigner, NarrativeComposer, and CodeGenerator. Produce one deterministic silent Chinese-language Manim Community scene named `BanknoteFeatureScalingScene` with canonical scene ID `banknote-feature-scaling`. Its duration is 72 seconds, its storyboard cuts are `[0, 8, 18, 29, 45, 57, 65, 72]`, and its poster-ready second is 68. The later shared renderer owns 1920×1080, 30 fps, H.264 output and poster extraction; this package must not render or publish those binaries.

The only numerical authority is the committed Phase 25 Plan 25-03 output package. At render time the source must load:

- `public/datasets/numerical-methods/banknote-authentication-manifest.json`;
- `public/notebooks/numerical-methods/batch-4-outputs/optimization-summary.json`;
- `public/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.json`.

Fail closed unless all three inputs use `numerical-methods-batch-4-v1`; the optimization summary has output ID `banknote-logistic-optimization-summary`; dataset and constants hashes agree; the feature order is exactly `variance, skewness, curtosis, entropy`; preprocessing is fitted on `train` with `ddof=0`; all four means/scales exist and are finite; split counts agree; and both `raw-fixed` and `standardized-stable` are fixed-step runs with step `4.0`. Full trajectory coordinates must come from the committed trace rows. Learner-visible scalar anchors must be formatted from the loaded manifest or optimization summary rather than copied into drawing code.

The lesson is about conditioning and usable step size. It is not a model leaderboard. Because the same coefficient-space L2 penalty is applied after changing feature units, raw and standardized terminal validation BCE values do not isolate conditioning alone. The scene must say that explicitly and must not call the smaller raw transient/best validation BCE proof of universally better final quality.

## Stage 1 — ConceptAnalyzer

The root question is: why can the same fixed gradient-descent step behave erratically on raw features and remain usable after train-only standardization? Build one causal chain:

1. the four raw columns have different training-set population scales;
2. a single coefficient-space step therefore produces updates with uneven coordinate sensitivity;
3. D-03 fits means and population scales on training rows only and reuses them for validation/test rows;
4. both comparison runs keep fixed step `4.0`;
5. the raw trace oscillates and stops by validation patience, while the standardized trace descends stably to the gradient-norm terminal;
6. those terminal reasons support different claims;
7. changed L2 geometry prevents reading the paired BCE values as a final-quality ranking.

Keep feature scale, optimizer step, and model quality separate. Standardization does not guarantee that every learning rate is safe, every model improves, or every feature is useful. The bounded conclusion is that it makes this locked fixed step usable for this locked run and makes coordinate updates better conditioned.

## Stage 2 — PrerequisiteExplorer

Use `banknote_feature_scaling_tree.json` and keep maximum depth three. Introduce only prerequisites that unblock the causal chain:

- at depth 3: units/population scale, gradient coordinates, and validation-versus-convergence semantics;
- at depth 2: train-only standardization and a fixed-step update;
- at depth 1: paired locked trajectories and typed terminal reasons;
- at depth 0: the bounded usable-step conclusion.

Do not detour into threshold tuning, ROC-AUC, calibration, optimizer families, second-order methods, or the later Armijo animation. Say `验证耐心停止` for the model-selection stop and `梯度范数收敛` for mathematical convergence. Use `训练集拟合`, `验证 / 测试复用`, `原始坐标`, `标准化坐标`, and `固定步长` consistently.

The source dataset retains the UCI-spelled feature name `curtosis`. Chinese may display the short label `峰度`, but the source spelling must remain visible beside it. Do not assign real-world meanings to class 0 or class 1 because the source record does not define them.

## Stage 3 — MathematicalEnricher

The raw-scale panel must take the four `trainScales` values from the dataset manifest. Bar length and printed value both encode magnitude, so color is supplementary. The standardization panel uses

`x' = (x - training_mean) / training_scale`

with mean and population scale fitted only on the persisted training split. Read train, validation, and test counts from the locked manifest. State that held-out rows reuse training statistics. Do not compute statistics from screen-friendly sample rows and do not fit on all 1,372 rows.

For the trajectory panel, read every accepted finite row for `raw-fixed` and `standardized-stable` from the locked full trace. Plot `log10(trainBce)` against the recorded iteration without inventing interpolation points, smoothing, resampling values, or schematic replacement numbers. It is acceptable to use a continuous polyline between adjacent locked rows for rendering. The axis range may be derived from the loaded rows, but the scene must not display made-up tick labels. Mark terminal points with different shapes as well as different colors.

Use the summary for terminal and best-validation labels. The raw run terminates by `validation-patience`, a model-selection stop that does not establish gradient convergence. The standardized run terminates by `gradient-norm`, a mathematical convergence criterion. Both use fixed step `4.0`. Display the two best-validation anchors only in the caveat beat and immediately explain that they are not a fair isolated comparison of model quality.

The L2 caveat is mandatory. With objective `data BCE + lambda/2 * ||w||^2`, changing feature units changes the relationship between the same coefficient norm and the original-input function. The animation may show the loaded lambda, but it must not imply that an identical scalar lambda makes the regularization equivalent across coordinate systems.

## Stage 4 — VisualDesigner

Use the shared Batch 4 `common.py` and `palette.py` interfaces anticipated by Plan 25-10: Chinese font fallback, Unicode equations, title blocks, cards, width fitting, and high-contrast colors. The visual language is calm scientific paper: warm off-white background, navy text, blue structure, amber raw-feature path, teal standardized path, and restrained red warnings. Never use color alone. Raw uses a square terminal marker and the visible word `原始`; standardized uses a circular terminal marker and the visible word `标准化`.

The storyboard is fixed:

- **0–8 seconds — question.** Show the local dataset row count and both loaded fixed-step values. Ask why identical alpha produces different paths.
- **8–18 seconds — raw feature scale.** Four labeled bars use locked training population scales. Printed values and lengths communicate the mismatch. State that a common alpha is dominated by large-scale directions.
- **18–29 seconds — D-03 boundary.** Show the train split as the only fitting source, a central transformation card, then validation/test as reuse-only destinations. Show locked split counts and `ddof=0` from JSON. A bottom card shows equalized training scales.
- **29–45 seconds — paired trajectories.** Plot all locked raw and standardized training-BCE rows on one derived log scale. Include a text legend, square/circle terminal shapes, and the loaded common alpha. Do not show arbitrary numeric axis ticks.
- **45–57 seconds — terminal meaning.** Side-by-side text cards show best-validation iteration/BCE and terminal iteration/reason from the summary. Say explicitly that validation patience is model selection and gradient norm is mathematical convergence.
- **57–65 seconds — penalty geometry caveat.** Show both best-validation values, the loaded L2 strength, and the statement that feature-unit changes alter the coefficient-penalty geometry. Reserve final test claims for an eligible final run.
- **65–72 seconds — poster-ready conclusion.** Keep one static, readable frame: raw square → oscillatory path → validation-patience stop; train-only standardized circle → stable path → gradient-norm convergence. Repeat that this demonstrates usable-step conditioning, not a final-quality ranking.

Keep a clear top title band and bottom safety margin. Text must remain above about 20 Manim font units. Avoid decorative icons, 3D, particles, fake terminals, random jitter, or dense grids. The poster second must land after all final elements are fully opaque.

## Stage 5 — NarrativeComposer

This is a silent video, so labels inside the scene are short Chinese and must remain readable without narration. Use the exact terminology registered in `banknote-feature-scaling-labels.json`. The full Chinese explanation belongs in `banknote-feature-scaling-transcript.zh-CN.md`; the complete English explanation belongs in `banknote-feature-scaling-summary.en.md`; stable bilingual mappings and value bindings belong in the label table.

The narrative rhythm is question → measure scale → enforce the data boundary → controlled same-step comparison → interpret stop semantics → constrain the claim → summarize. Avoid the generic learner-facing word `证据`; prefer `运行结果`, `固定输出`, `轨迹`, and `停止原因`. Do not say “standardization always improves performance,” “the raw run converged,” or “lower validation BCE wins.” Do say that the two stopping reasons answer different questions.

Reduced-motion and video-failure fallbacks are first-class. The transcript, English summary, bilingual label table, and final poster-ready beat must each preserve these facts without relying on animation or color:

- the exact source dependencies and train-only fit boundary;
- the same fixed step in both runs;
- the raw and standardized terminal reason/kind distinction;
- the coefficient-space L2 geometry caveat;
- the bounded usable-step conclusion.

## Stage 6 — CodeGenerator and quality gates

Implement deterministic Manim primitives only. Resolve JSON paths from `Path(__file__)`, never from a developer machine absolute path. Do not access the network, use random values, read system time, recalculate the training runs, or import the TypeScript engine. Validate all trust-boundary objects before drawing. Missing JSON, malformed JSON, absent dataset statistics, a mismatched contract/output ID/hash, a missing trace, a non-finite plotted field, or a step other than the locked `4.0` must abort rendering with a clear error.

Use `_advance_to(timestamp)` based on `self.renderer.time` so cuts are deterministic and the final frame reaches 72 seconds. Use only loaded values for data bars, plot coordinates, split labels, best-validation labels, terminal labels, and lambda. Layout dimensions, font sizes, and storyboard timestamps are presentation controls rather than numerical claims.

The six package roles are exactly:

1. `scripts/manim/numerical_methods_batch_4/banknote_feature_scaling.py`;
2. `scripts/manim/numerical_methods_batch_4/banknote_feature_scaling_prompt.md`;
3. `scripts/manim/numerical_methods_batch_4/banknote_feature_scaling_tree.json`;
4. `docs/curriculum-v3/numerical-methods/manim/banknote-feature-scaling-transcript.zh-CN.md`;
5. `docs/curriculum-v3/numerical-methods/manim/banknote-feature-scaling-summary.en.md`;
6. `docs/curriculum-v3/numerical-methods/manim/banknote-feature-scaling-labels.json`.

Before handing the package to Plan 25-10, compile the scene source, parse both JSON documents, verify all six paths are non-empty, confirm tree `maxDepth` is 3 and the root closes the topological order, confirm every label has a stable ID plus `zh-CN` and `en`, confirm the source contains runtime reads and exact output-ID checks, and run `git diff --check`. Do not render MP4 or PNG assets; those belong to Plan 25-11.
