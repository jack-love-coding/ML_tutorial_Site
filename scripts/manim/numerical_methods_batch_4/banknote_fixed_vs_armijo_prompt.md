# Verbose Manim Production Prompt — Banknote Fixed Step versus Armijo

## Production role and non-negotiable contract

Act as the complete six-stage Math-To-Manim pipeline: ConceptAnalyzer, PrerequisiteExplorer, MathematicalEnricher, VisualDesigner, NarrativeComposer, and CodeGenerator. Produce one deterministic silent Chinese-language Manim Community scene named `BanknoteFixedVsArmijoScene` with canonical scene ID `banknote-fixed-vs-armijo`. The duration is 72 seconds, storyboard cuts are `[0, 8, 18, 30, 43, 55, 65, 72]`, and second 68 is poster-ready. Plan 25-11 owns the final 1920×1080, 30 fps, H.264 MP4 and poster; this package must not render or publish either binary.

The numerical authority is the committed Phase 25 Plan 25-03 output package. At render time the source must load:

- `public/notebooks/numerical-methods/batch-4-outputs/optimization-summary.json`, output ID `banknote-logistic-optimization-summary`;
- `public/notebooks/numerical-methods/batch-4-outputs/banknote-training-traces.json`.

Fail closed unless both files use contract `numerical-methods-batch-4-v1`, dataset and constants hashes agree, and exactly one `standardized-too-large` and one `standardized-armijo` trace exist. The fixed run must remain standardized/fixed with step 32. The Armijo run must remain standardized/Armijo with initial step 32, `c=1e-4`, `rho=0.5`, maximum 30 backtracks, and minimum step `1e-12`. Both runs must share their exact iteration-0 record. The source must verify the summary’s first-trial rejection and first accepted trace row, then verify sufficient decrease for every accepted Armijo row. Missing, malformed, non-finite, or drifting inputs abort before drawing.

## Stage 1 — ConceptAnalyzer

The teaching question is: what changes when a fixed step takes the candidate immediately but Armijo asks whether that same candidate decreases the penalized training objective enough? Build one causal chain:

1. both methods begin from the same standardized Banknote parameters and training gradient;
2. both first consider alpha 32;
3. the fixed method applies 32 without a sufficient-decrease test, so the first penalized objective rises from `0.6931471805599453` to `1.0016959769489993`;
4. Armijo evaluates that same alpha-32 candidate against the sufficient-decrease bound and rejects it;
5. one contraction by rho 0.5 produces alpha 16;
6. the alpha-16 candidate has objective `0.5246184695107567`, passes the bound, and becomes accepted iteration 1 with backtrack count 1;
7. rejected trials never become trace rows;
8. the fixed run eventually stops at iteration 73 by validation patience, while Armijo reaches gradient-norm convergence at iteration 48.

The lesson is step acceptance, not an optimizer-family survey. Do not introduce Momentum, RMSProp, Adam, Newton, IRLS, stochastic batches, threshold tuning, calibration, or a model leaderboard. Do not call the fixed run “invalid”: it is an intentionally locked teaching run whose first update overshoots and whose typed terminal is model selection rather than mathematical convergence.

## Stage 2 — PrerequisiteExplorer

Follow `banknote_fixed_vs_armijo_tree.json` with maximum prerequisite depth three. Introduce only what the comparison requires:

- depth 3: a descent direction, a penalized training objective, and typed terminal semantics;
- depth 2: fixed-step acceptance and the Armijo sufficient-decrease inequality;
- depth 1: the shared first candidate, one backtrack, accepted-state traces, and terminal interpretation;
- depth 0: the bounded conclusion that a line search tests a proposed step before adopting it.

Keep the meanings of data BCE, penalized training objective, and validation BCE separate. Use `惩罚训练目标`, `充分下降`, `拒绝`, `接受`, `一次回溯`, `验证耐心停止`, and `梯度范数收敛` consistently. The line search reads the training objective and training gradient. Validation is consulted only after an accepted update to update the checkpoint/patience state; validation never decides Armijo acceptance.

## Stage 3 — MathematicalEnricher

Use descent direction `d=-g` and the exact condition

`J(theta + alpha*d) <= J(theta) + c*alpha*(g dot d) = J(theta) - c*alpha*||g||^2`.

Here `J` is the penalized training objective: training BCE plus `lambda/2 * ||w||^2`; the intercept is excluded from L2. The first start row has `J0=0.6931471805599453` and gradient norm `0.44123397955093496`. For alpha 32, derive the sufficient-decrease bound at runtime from the loaded start row and `c`; use the iteration-1 `standardized-too-large` row as the exact same alpha-32 candidate. Its objective exceeds the bound, so the summary’s `initialTrialAccepted=false` must agree with the arithmetic.

For alpha 16, derive the bound again from the same start row. The first `standardized-armijo` accepted row records step 16, backtrack count 1, objective `0.5246184695107567`, train BCE `0.5000886180367202`, parameter-step norm `7.059743672814959`, and the exact five parameters. It passes sufficient decrease. Do not compare candidate validation BCE to an Armijo threshold, and do not place rejected trial 32 into the accepted Armijo polyline.

The trajectory panel must read every accepted finite row for both selected runs. Plot `log10(objective)` against the recorded iteration without smoothing, resampling, random points, or schematic replacement numbers. A continuous polyline between adjacent locked rows is only a rendering connection. Fixed uses a dashed path and square terminal; Armijo uses a solid path and circular terminal, so color is supplementary.

Read terminal and best-validation values from the summary. Fixed 32 has `validation-patience` at iteration 73, a model-selection stop. Armijo has `gradient-norm` at iteration 48 and best validation BCE `0.06824699289297452`, a mathematical-convergence terminal. Do not claim Armijo’s terminal proves universal optimizer superiority; it proves the locked run met the locked mathematical criterion.

## Stage 4 — VisualDesigner

Use the Batch 4 `common.py`/`palette.py` interface owned by Plan 25-10: deterministic Chinese font fallback, Unicode formulas, paper cards, title blocks, width fitting, and high-contrast tokens. Use a warm off-white background, navy text, blue structure, amber fixed-step/rejected-trial marks, teal accepted Armijo marks, and restrained red warnings. Never use color alone. The fixed route is labeled with a square and dashed line; Armijo is labeled with a circle and solid line. Rejection uses an explicit × and the word `拒绝`; acceptance uses ✓ and the word `接受`.

The storyboard is fixed:

- **0–8 seconds — controlled question.** State that both methods share one standardized start and gradient. Contrast “fixed 32 applies immediately” with “Armijo first tests 32.”
- **8–18 seconds — objective boundary.** Show the sufficient-decrease equation and `J = training BCE + L2`. State in text that validation BCE is absent from the accept/reject rule and is updated only after an accepted step.
- **18–30 seconds — fixed overshoot.** Show the loaded start objective, an alpha-32 arrow, the loaded fixed first-row objective/train BCE, and the conclusion that the objective rose but the fixed rule still adopted the step.
- **30–43 seconds — reject 32.** Reuse the exact alpha-32 candidate. Show candidate objective, runtime-derived allowed bound, a written `>` comparison, explicit rejection, and “not written to trace.”
- **43–55 seconds — accept 16.** Show one contraction `32 × 0.5 = 16`, backtrack count 1, runtime-derived bound, a written `<=` comparison, explicit acceptance, and accepted iteration 1.
- **55–65 seconds — full accepted trajectories.** Draw all locked accepted-state objectives. Show dashed-square fixed and solid-circle Armijo encodings. State that rejected trials are absent from the Armijo trace.
- **65–72 seconds — poster-ready conclusion.** Retain both terminal cards, the `32 reject -> 16 accept` chain, one-backtrack text, and the statement that only the penalized training objective participates in line search.

Keep labels at roughly 20 Manim font units or above and leave a readable bottom margin. Avoid 3D, particles, gradients, fake terminals, decorative formulas, dense grids, and motion without instructional purpose. The final frame must be fully opaque before poster second 68.

## Stage 5 — NarrativeComposer

The video is silent, so every in-frame statement is short Chinese. Full explanation belongs in `banknote-fixed-vs-armijo-transcript.zh-CN.md`; the English fallback belongs in `banknote-fixed-vs-armijo-summary.en.md`; stable bilingual mappings and JSON paths belong in `banknote-fixed-vs-armijo-labels.json`.

The rhythm is question → define the accept/reject quantity → show fixed overshoot → reject the same full trial → accept one contracted trial → compare complete accepted traces → interpret terminals. Do not use generic learner-facing `证据`; prefer `锁定运行结果`, `候选`, `检查`, `轨迹`, and `停止原因`.

The reduced-motion, video-failure, and non-color paths must independently preserve:

- both methods share the same standardized iteration-0 state;
- fixed applies 32 and the first penalized objective rises;
- Armijo rejects 32 and accepts 16 after exactly one backtrack;
- sufficient decrease reads only the penalized training objective and training gradient;
- rejected trials are not accepted trace rows;
- fixed ends by validation patience at 73 and Armijo by gradient norm at 48;
- the comparison is a bounded statement about this locked run, not universal optimizer ranking.

## Stage 6 — CodeGenerator and quality gates

Implement deterministic Manim primitives only. Resolve JSON paths from `Path(__file__)`; never use a developer-machine absolute path, runtime network request, random number, system time, or TypeScript/browser computation. Learner-visible scalars must be formatted from loaded JSON. Presentation constants such as duration, font size, and layout coordinates are not numerical claims.

The six package roles are exactly:

1. `scripts/manim/numerical_methods_batch_4/banknote_fixed_vs_armijo.py`;
2. `scripts/manim/numerical_methods_batch_4/banknote_fixed_vs_armijo_prompt.md`;
3. `scripts/manim/numerical_methods_batch_4/banknote_fixed_vs_armijo_tree.json`;
4. `docs/curriculum-v3/numerical-methods/manim/banknote-fixed-vs-armijo-transcript.zh-CN.md`;
5. `docs/curriculum-v3/numerical-methods/manim/banknote-fixed-vs-armijo-summary.en.md`;
6. `docs/curriculum-v3/numerical-methods/manim/banknote-fixed-vs-armijo-labels.json`.

Before handoff to Plan 25-10, compile the source; execute `load_locked_inputs()` against the committed JSON; parse tree and labels; verify six non-empty paths; assert pipeline order, exact max depth 3, root-last topological order, unique bilingual label IDs, fallback descriptions, exact scene ID/class, and runtime output/hash checks; then run `git diff --check`. Do not render MP4 or PNG assets.
