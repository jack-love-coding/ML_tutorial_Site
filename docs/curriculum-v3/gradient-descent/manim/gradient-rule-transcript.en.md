# One Gradient-Descent Update — Transcript

## 0:00 — Data and model

We begin with five study-hour and score samples. The current model is `ŷ = wx+b`, with `w=6` and `b=47`. This stage is only a forward pass: every study-hour value goes through the same line to produce a predicted score.

## 0:12 — Prediction, residual, and loss

Blue marks the predictions; orange dashed segments connect them to the targets. Residual is defined as `target−prediction`, giving `[-1,0,0,1,1]`. Squaring and averaging produces an MSE of `0.6`.

## 0:24 — One-dimensional loss slice

Hold `b=47` fixed and change only `w`. Every point on the curve is one candidate slope and its MSE. The current parameter is not the minimum; the least-squares reference sits lower.

## 0:36 — Uphill gradient

The gradient collects the sensitivity of loss to slope and intercept. Here it is `(-3.2,-0.4)`. The purple arrow points toward the fastest local increase, so the gradient itself is not the descent direction.

## 0:48 — Negative-gradient direction

The minus sign in the update rule reverses the purple direction into the green one. The negative gradient chooses the locally steepest decrease, but it does not yet choose the travel distance.

## 1:00 — Learning-rate scaling

The learning rate `0.02` scales the negative gradient into a parameter change of `(0.064,0.008)`. It changes step length, not the direction supplied by the current gradient.

## 1:12 — Update and verify again

The parameters become `(6.064,47.008)`. Recomputing all five predictions lowers MSE from `0.600000` to `0.440192`. This is only one update; `0.060000` is the least-squares reference and shows that more descent remains.
