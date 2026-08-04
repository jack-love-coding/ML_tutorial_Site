# Gradient Rule Animation — Verbose Production Prompt

## Teaching objective

Animate one exact gradient-descent update on the shared five-row study-hours dataset. The learner must be able to pause at any segment and reconcile every visible number with the downloadable Notebook and the interactive chapter lab.

## Function composition and numerical authority

The animation follows this exact dependency chain:

`(x_i, y_i), (w,b) → y_hat_i = w x_i + b → r_i = y_i-y_hat_i → L = mean(r_i^2) → (dL/dw,dL/db) → -(gradient) → eta scaling → updated (w,b) → new predictions → new MSE`.

Use only the locked values:

- `x=[1,2,3,4,5]`, `y=[52,59,65,72,78]`
- start `w=6`, `b=47`
- predictions `[53,59,65,71,77]`
- residuals `[-1,0,0,1,1]`
- `MSE=0.6`, gradient `(-3.2,-0.4)`
- `eta=0.02`, update `(6.064,47.008)`
- updated MSE `0.440192`
- least-squares reference `(6.5,45.7)`, MSE `0.06`

## Storyboard and timing

1. `data-model` (0–12s): reveal the five `(x,y)` pairs, then `y_hat=wx+b` and `(w,b)=(6,47)`.
2. `prediction-error` (12–24s): transform each x into its prediction; orange residual marks connect prediction to target; collect `r=[-1,0,0,1,1]` and `L=0.6`.
3. `loss-slice` (24–36s): move to the one-dimensional slice `L(w,47)`, mark the current point and the lower least-squares reference.
4. `uphill-gradient` (36–48s): draw the tangent and a purple arrow labelled with `gradient=(-3.2,-0.4)`; explicitly show that this arrow is the uphill sensitivity vector.
5. `negative-direction` (48–60s): reverse the arrow in green; show the minus sign in the update rule without prose.
6. `learning-rate` (60–72s): scale the green arrow with `eta=0.02` and calculate `-eta gradient=(0.064,0.008)`.
7. `update-verify` (72–82s): transform parameters to `(6.064,47.008)`, recompute predictions, and transform `0.600000` into `0.440192`; keep the least-squares `0.060000` visible as a reference, not as the result of this single step.

## Visual grammar

- Neutral off-white background and dark ink for structure.
- Blue only for the prediction line and predicted values.
- Orange only for residual/error and loss.
- Purple only for the uphill gradient.
- Green only for negative-gradient direction and parameter updates.
- Never rely on color alone: prediction is solid, residuals are dashed vertical segments, gradient uses a triangular arrowhead and `∇`, update uses the opposite arrow plus `−η∇`.
- Use `MathTex` for formulas and numbers. Do not place English or Chinese prose on screen.
- Camera remains stable; transitions are transformations between representations, not decorative movement.
- Reduced-motion support is supplied by the web player's poster and chapter markers, so the video itself may use smooth transforms but no rapid flashes.

## Asset package

Publish MP4, SVG poster, this prompt, the reverse knowledge tree, bilingual segmented transcripts, chapter markers, Manim version, ffprobe data, and SHA-256 hashes. The selective renderer must support one scene, preview/publish quality, and read-only drift checking.
