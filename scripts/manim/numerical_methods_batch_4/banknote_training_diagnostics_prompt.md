# Verbose Manim Production Prompt — Banknote Training Diagnostics

## Production role and non-negotiable contract

Act as the complete six-stage Math-To-Manim pipeline: ConceptAnalyzer, PrerequisiteExplorer, MathematicalEnricher, VisualDesigner, NarrativeComposer, and CodeGenerator. Produce one deterministic silent Chinese-language Manim Community scene named `BanknoteTrainingDiagnosticsScene` with canonical scene ID `banknote-training-diagnostics`. The duration is 72 seconds, storyboard cuts are `[0, 8, 18, 32, 46, 58, 65, 72]`, and second 68 is poster-ready. Plan 25-11 owns the final 1920×1080, 30 fps, H.264 MP4 and poster; this source package must not render or publish either binary.

The numerical and diagnostic authority is the committed Phase 25 Plan 25-03 output package. At render time the source must load:

- `public/notebooks/numerical-methods/batch-4-outputs/training-diagnostics-summary.json`, exact output ID `banknote-training-diagnostics-summary`;
- `public/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.json`.

Fail closed unless both files use `numerical-methods-batch-4-v1`, their dataset and constants hashes agree, the summary preserves the exact five-run order, and every run has exactly one trace. Validate every four-step chain verbatim: `visible`, `plausibleCause`, `changeOneVariable`, and `expectedNextRun`. Validate every diagnostic terminal against the trace terminal. Validate that each best-validation record identifies an exact trace row with matching validation BCE and `isBestValidation=true`, and that each terminal iteration is the last accepted row. Missing, malformed, non-finite, reordered, or drifting input aborts before drawing.

## Stage 1 — ConceptAnalyzer

The teaching question is: after seeing a training curve, how can a learner choose one controlled next experiment rather than changing many settings at once? Teach the locked four-step chain without scoring:

1. describe the visible trace;
2. name one plausible mechanism;
3. change exactly one variable;
4. predict what the next trace should show.

Use two required comparisons from the committed Banknote traces:

- `standardized-too-small` versus `standardized-stable`: the slow run safely descends but reaches iteration 500 with a large gradient. Keep standardized features and the fixed method unchanged; increase only the fixed step from 0.02 to 4.0. The expected next trace reaches the gradient tolerance within 500 updates. The stable run does so at iteration 484.
- `standardized-too-large` versus `standardized-armijo`: the fixed-32 run has a low transient validation point and then deteriorates. Keep standardized features and initial step 32 unchanged; change only immediate fixed acceptance to Armijo backtracking. The expected next trace first accepts 16 after one backtrack and retains mathematical-convergence eligibility. Armijo reaches gradient-norm convergence at iteration 48.

The animation uses only real Banknote runs. Do not import, redraw, rename, or attribute the existing synthetic overfitting, vanishing-gradient, or exploding-gradient examples to Banknote. Those examples remain separate support surfaces in the existing lesson. State that boundary in the opening and final fallback, but do not replace the synthetic content.

## Stage 2 — PrerequisiteExplorer

Follow `banknote_training_diagnostics_tree.json` with maximum prerequisite depth exactly three:

- depth 3: accepted finite trace rows, validation checkpoint semantics, and typed terminal semantics;
- depth 2: curve-shape description, controlled-variable comparison, and eligibility before final selection;
- depth 1: the two four-step comparison chains and endpoint-only report connection;
- depth 0: diagnose first, change one variable, then check the predicted next trace.

Keep best-validation and terminal meanings separate. A best-validation marker selects saved parameters. A terminal `{kind, reason}` explains why the run ended. `validation-patience` is model selection, `max-iterations` is a safety bound, and `gradient-norm` is mathematical convergence. A transient lower validation BCE does not make a non-converged run eligible for the final report.

## Stage 3 — MathematicalEnricher

Plot every accepted finite row's `validationBce` against its recorded `iteration` for the four focus runs. Do not smooth, resample, invent intermediate points, or substitute schematic values. A straight segment between adjacent committed rows is only a rendering connection.

For comparison A, read the exact steps 0.02 and 4.0 from run configs. `standardized-too-small` has 501 rows, a best/terminal validation BCE of `0.288343568660986` at iteration 500, terminal kind `safety`, and reason `max-iterations`. `standardized-stable` has 485 rows, best/terminal validation BCE `0.06825592665802883` at iteration 484, terminal kind `mathematical-convergence`, and reason `gradient-norm`.

For comparison B, read initial step 32 from both configs and the first accepted Armijo row from `firstBacktrack`. `standardized-too-large` has best validation BCE `0.05885315617651155` at iteration 13, but its terminal is `model-selection / validation-patience` at iteration 73 with validation BCE `0.08285039867735675`. `standardized-armijo` first accepts step 16 with backtrack count 1; its best and terminal coincide at iteration 48 with validation BCE `0.06824699289297452` and `mathematical-convergence / gradient-norm`.

The low transient best of fixed 32 is not a final-model winner because final selection predeclares mathematical-convergence eligibility. The selected run is `standardized-armijo`. Its compact manual test report uses checkpoint 48, threshold 0.5, probabilities for ROC-AUC, test BCE `0.055110123229490826`, accuracy `0.9805825242718447`, ROC-AUC `0.9994279176201373`, and confusion matrix `[[110,4],[0,92]]`. The scikit-learn 1.9.0 BCE `0.05509807557568522` and prediction agreement `1.0` are endpoint checks only; do not compare its 17 reported iterations step-for-step with manual Armijo.

## Stage 4 — VisualDesigner

Use the Batch 4 `common.py`/`palette.py` interface owned by Plan 25-10: deterministic Chinese font fallback, Unicode formulas, paper cards, title blocks, width fitting, and high-contrast tokens. Use warm off-white background, navy text, blue structure/best markers, amber original/problem traces, teal controlled-next traces, and restrained red for the single-variable action. Color is supplementary.

Non-color encoding is mandatory:

- original/problem trace: dashed path plus square terminal;
- changed/next trace: solid path plus circular terminal;
- best-validation point: rotated square/diamond plus written `最佳验证`;
- every terminal: written iteration, kind meaning, and reason meaning.

The storyboard is fixed:

- **0–8 seconds — question and provenance.** Ask what one variable should change. Name both required comparisons. State “real Banknote runs,” “not scored,” and “synthetic support examples remain separate.”
- **8–18 seconds — four-step method.** Show visible trace → plausible cause → one variable → expected next trace. State that the chain is instruction, not grading.
- **18–32 seconds — too-small versus stable.** Draw both full validation traces. Show the exact 0.02→4.0 one-variable action, both best-validation markers, and both typed terminals.
- **32–46 seconds — too-large versus Armijo.** Draw both full validation traces. Show fixed acceptance→Armijo as the only change, the first accepted 16/backtrack count 1, both best-validation markers, and both typed terminals.
- **46–58 seconds — marker semantics.** Separate best checkpoint, safety/model-selection terminal, and mathematical-convergence terminal. Do not let marker color carry meaning alone.
- **58–65 seconds — compact selected endpoint.** Show the manual report and endpoint-only scikit-learn agreement. State no per-iteration solver comparison, threshold tuning, or broad evaluation course.
- **65–72 seconds — poster-ready conclusion.** Retain both four-step action mappings, four terminal iterations/reasons, marker legend, real/synthetic boundary, and the statement “one variable at a time.”

Keep Chinese labels short and generally at least 18 Manim font units. Avoid 3D, decorative particles, dense grids, fake loss values, motion-only meaning, and a generic dashboard. The final frame must be fully opaque before poster second 68.

## Stage 5 — NarrativeComposer

The scene is silent, so every in-frame claim is short Chinese. Full details belong in `banknote-training-diagnostics-transcript.zh-CN.md`; the English fallback belongs in `banknote-training-diagnostics-summary.en.md`; stable bilingual mappings and JSON value paths belong in `banknote-training-diagnostics-labels.json`.

Use `可见轨迹`, `可能原因`, `只改一个变量`, `预期下一条轨迹`, `最佳验证`, `终点`, `模型选择`, `安全上限`, and `数学收敛` consistently. Avoid generic learner-facing `证据`. Do not say a lower transient validation point proves convergence. Do not say Armijo universally outperforms fixed steps.

The reduced-motion, video-failure, and non-color paths must independently preserve:

- the complete four-step chain for every one of the five locked diagnostics in the documents;
- the two scene comparisons and their exact single-variable actions;
- both best-validation markers and all four focus terminals;
- best-checkpoint versus terminal semantics;
- the selected Armijo compact report and endpoint-only baseline boundary;
- the Banknote-real versus synthetic-support provenance boundary.

## Stage 6 — CodeGenerator and quality gates

Implement deterministic Manim primitives only. Resolve JSON paths from `Path(__file__)`; never use a developer-machine absolute path, runtime network request, random number, system time, copied synthetic curve, or TypeScript/browser computation. Learner-visible scalar values must be formatted from loaded JSON. Presentation constants such as duration, font size, colors, and layout positions are not numerical claims.

The six package roles are exactly:

1. `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics.py`;
2. `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics_prompt.md`;
3. `scripts/manim/numerical_methods_batch_4/banknote_training_diagnostics_tree.json`;
4. `docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-transcript.zh-CN.md`;
5. `docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-summary.en.md`;
6. `docs/curriculum-v3/numerical-methods/manim/banknote-training-diagnostics-labels.json`.

Before handoff to Plan 25-10, compile the source; execute `load_locked_inputs()` against the committed JSON; parse tree and labels; verify six non-empty paths; assert pipeline order, exact max depth 3, root-last topological order, unique bilingual label IDs, fallback descriptions, exact scene ID/class, and runtime output/hash checks; then run `git diff --check`. Do not render MP4 or PNG assets.
