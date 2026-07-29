# Banknote training-trace diagnostics

This 72-second silent scene teaches an unscored diagnostic method over the committed real Banknote training runs: visible trace → plausible cause → exactly one variable change → expected next trace. It loads the Plan 25-03 `numerical-methods-batch-4-v1` diagnostic summary and complete accepted-state trace JSON at render time. Before drawing, it checks the exact output ID, dataset/constants hashes, five-run order, every four-step chain, every best-validation marker, every typed terminal, the selected checkpoint, and the endpoint-only baseline boundary.

The scene never imports or relabels the existing synthetic overfitting, vanishing-gradient, or exploding-gradient curves. Those deterministic examples remain separate support content in the existing lesson. All plotted curves in this package are real Banknote accepted-state traces.

## The four-step reading method

For each run, the learner follows the same non-scored sequence:

1. describe only what is visible in the trace;
2. name one plausible numerical cause;
3. change exactly one variable while holding the comparison controls fixed;
4. predict what the next trace should show.

The prediction makes the next run checkable. It does not claim that a single curve uniquely identifies a cause, and it does not turn the lesson into a diagnosis quiz or model leaderboard.

## Comparison A: fixed step 0.02 to fixed step 4.0

Both runs use standardized features and the fixed-step method. Only the step changes.

For `standardized-too-small`, the visible trace safely descends, but the gradient remains large at the iteration cap. The plausible cause is a fixed step that is too small. The one-variable action is to increase the fixed step from 0.02 to 4.0. The expected next trace should reach the gradient tolerance within 500 accepted updates.

The 0.02 run contains 501 accepted states. Its best validation marker and terminal both occur at iteration 500 with validation BCE `0.288343568660986`. Its terminal is `safety / max-iterations`. This means the run reached a safety bound; it is neither divergence nor mathematical convergence.

The controlled next run, `standardized-stable`, contains 485 accepted states. Its best validation marker and terminal coincide at iteration 484 with validation BCE `0.06825592665802883`. Its terminal is `mathematical-convergence / gradient-norm`. The locked next trace therefore matches the prediction: changing only the fixed step to 4.0 reaches the gradient tolerance inside 500 updates.

This is a bounded conclusion about the committed data, objective, and constants. It is not a general rule that a larger step is always better.

## Comparison B: fixed acceptance at 32 to Armijo from 32

Both runs use standardized features and propose initial step 32. Only the acceptance rule changes.

For `standardized-too-large`, a low transient validation point is followed by deterioration. The plausible cause is fixed-step overshoot. The one-variable action is to use Armijo backtracking instead of directly accepting 32. The expected next trace should first accept 16 and retain mathematical-convergence eligibility.

The fixed-32 run's best validation marker occurs at iteration 13 with BCE `0.05885315617651155`. Its terminal occurs later at iteration 73 with validation BCE `0.08285039867735675` and terminal `model-selection / validation-patience`. A low transient best checkpoint is not a mathematical-convergence terminal. The predeclared selection rule therefore does not let this run win solely because its transient validation BCE is low.

For `standardized-armijo`, the first 32 trial is rejected and one backtrack accepts 16. The first accepted row records `acceptedStepSize=16`, `backtrackCount=1`, and `iteration=1`. Its best validation marker and terminal coincide at iteration 48 with validation BCE `0.06824699289297452`. The terminal is `mathematical-convergence / gradient-norm`, so the controlled next trace matches the prediction.

This comparison explains the mechanism of these locked runs. It does not claim that Armijo universally outperforms every fixed step.

## Best-validation and terminal markers have different meanings

The best-validation marker answers which saved parameters have the lowest validation BCE under the checkpoint rule. It does not prove mathematical convergence.

The terminal `{kind, reason}` answers why training ended:

- `safety / max-iterations` is a bounded safety exit;
- `model-selection / validation-patience` is a validation checkpoint/patience decision;
- `mathematical-convergence / gradient-norm` means the locked gradient tolerance was reached.

The scene encodes original/problem traces with dashed paths and square terminals, controlled-next traces with solid paths and circle terminals, and best validation with diamond markers. Written iteration and terminal labels preserve the distinction without color or motion.

## Selected checkpoint and endpoint-only report

Final selection first requires mathematical-convergence eligibility, then compares best-validation checkpoints among eligible runs. This selects `standardized-armijo` at checkpoint iteration 48.

With fixed threshold 0.5 and probabilities as the ROC-AUC input, the manual NumPy endpoint reports:

- test BCE `0.055110123229490826`;
- accuracy `0.9805825242718447`;
- ROC-AUC `0.9994279176201373`;
- confusion matrix `[[TN,FP],[FN,TP]] = [[110,4],[0,92]]`.

The scikit-learn 1.9.0 endpoint has test BCE `0.05509807557568522` and prediction agreement `1.0`. This is an endpoint-only engineering check. Its 17 reported LBFGS iterations are not compared step-for-step with the 48 accepted manual Armijo updates. The scene does not add threshold tuning, PR-AUC, calibration, or a broad model-evaluation lesson.

## All five locked four-step diagnoses

The source validates all five Plan 25-03 diagnostic records. This table preserves the complete no-motion path even though the animation focuses on two comparisons.

| Run | Visible trace | Plausible cause | Exactly one change | Expected next trace | Terminal |
|---|---|---|---|---|---|
| `raw-fixed` | Validation improves and then degrades while steps remain large. | Raw feature scales make the fixed step poorly conditioned. | Standardize features while keeping step 4.0. | Smoother descent and mathematical convergence. | `model-selection / validation-patience / 112` |
| `standardized-too-small` | Loss falls safely but the gradient remains large at the iteration cap. | The fixed step is too small. | Increase the fixed step from 0.02 to 4.0. | Reach the gradient tolerance within 500 updates. | `safety / max-iterations / 500` |
| `standardized-stable` | Training and validation losses settle with a small gradient. | Standardization makes the fixed step usable. | Replace the fixed step with Armijo from 32.0. | Reject unsafe trials and converge in fewer accepted updates. | `mathematical-convergence / gradient-norm / 484` |
| `standardized-too-large` | A low transient validation point is followed by deterioration. | The fixed step overshoots. | Use Armijo backtracking instead of accepting 32.0. | Accept 16.0 first and retain convergence eligibility. | `model-selection / validation-patience / 73` |
| `standardized-armijo` | The first trial is rejected and the gradient tolerance is reached. | Sufficient decrease adapts the usable step. | Keep the method and inspect the selected test endpoint. | The endpoint agrees closely with the library baseline. | `mathematical-convergence / gradient-norm / 48` |

## Reduced-motion, video-failure, and non-color fallback

The fully composed 65–72 second final frame preserves both one-variable action mappings:

- fixed 0.02 reaches `max-iterations` at 500; fixed 4.0 reaches `gradient-norm` at 484;
- fixed 32 reaches `validation-patience` at 73; Armijo first accepts 16 and reaches `gradient-norm` at 48.

It also preserves the best-marker/terminal distinction and the real-Banknote/synthetic-support boundary. The Chinese transcript, this English summary, and `banknote-training-diagnostics-labels.json` provide the full five-run chains, exact marker bindings, endpoint report, and provenance without motion, audio, or color perception. Plan 25-11 will render the final MP4 and poster; this package contains source and fallback documents only.
