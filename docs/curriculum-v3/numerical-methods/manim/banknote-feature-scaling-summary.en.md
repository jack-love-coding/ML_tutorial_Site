# Banknote feature scaling and a usable fixed step

This 72-second silent scene asks why the same fixed gradient-descent step behaves differently in raw and standardized coordinates. It loads the committed `numerical-methods-batch-4-v1` dataset manifest, optimization summary with output ID `banknote-logistic-optimization-summary`, and accepted-state trace file at render time. Contract, dataset, constants, run IDs, preprocessing statistics, and trace terminals are checked before any frame is drawn. No network source, random value, schematic replacement number, or TypeScript/UI implementation participates.

## Raw scale and the D-03 boundary

The four Banknote columns have different training-set population scales: `variance` 2.8049705227712813, `skewness` 5.81400805653475, source-spelled `curtosis` 4.234924404032209, and `entropy` 2.0726581960156034. A common coefficient-space step therefore encounters uneven coordinate sensitivity.

The persisted split contains 960 training rows, 206 validation rows, and 206 test rows. Mean and population scale (`ddof=0`) are fit only on the training rows. Validation and test rows reuse those training statistics; they never refit them. The scene communicates the boundary with arrows and explicit “fit” versus “reuse” text, not motion or color alone.

## Same step, locked trajectories

The controlled pair is `raw-fixed` versus `standardized-stable`. Both use the exact fixed step 4.0. Every polyline coordinate comes from the accepted finite rows in `banknote-training-traces.json`; the plot shows log10 training BCE against the recorded iteration without smoothing or invented points.

The raw path jumps and continues to oscillate. Its best validation checkpoint is iteration 52 with BCE 0.031908920166439064, and its terminal is iteration 112 with reason `validation-patience`. That is a model-selection stop: validation improvement exhausted the patience rule. It is not mathematical convergence.

The standardized path descends stably. Its best validation checkpoint and terminal are both iteration 484 with validation BCE 0.06825592665802883, and its terminal reason is `gradient-norm`. That is mathematical convergence under the locked tolerance. A square marks the raw terminal and a circle marks the standardized terminal, while text states both feature space and stop meaning.

## The penalty-geometry caveat

This pair teaches conditioning and whether a fixed step is usable; it is not a final model-quality ranking. Both runs apply coefficient-space L2 with lambda 0.001, but changing feature units changes how a coefficient norm maps back to the original-input function. The regularization geometry is therefore not equivalent across the two coordinate systems.

For that reason, the lower transient/best validation BCE of the raw run does not establish that raw features produce a universally better final model. Conversely, stable gradient-norm convergence does not establish that standardization always improves every final metric. Final test reporting remains reserved for a predeclared mathematically converged candidate under the wider Batch 4 selection rule.

## Reduced-motion and video-failure fallback

The final frame is deliberately poster-ready and self-contained:

- square/raw: fixed step 4.0, oscillatory trajectory, validation-patience stop at iteration 112;
- circle/train-only standardized: fixed step 4.0, stable trajectory, gradient-norm convergence at iteration 484;
- written caveat: changing feature units changes the geometry of the same coefficient-space L2 penalty, so the pair does not rank final quality.

The Chinese transcript, this English summary, and `banknote-feature-scaling-labels.json` preserve the same causal chain and terminal semantics without requiring motion, audio, or color perception. The later Plan 25-11 renderer will publish the local MP4/poster and integrity metadata; this source package intentionally contains no final binary media.
