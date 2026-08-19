# Manim Animation: Likelihood to stable BCE and gradient

## Overview

**Estimated Duration:** 48 seconds

**Progression:** one Bernoulli outcome → four-row likelihood product → additive log-likelihood → stable negative log loss → row and batch gradient → negative-gradient update. The movie is language-neutral and uses equations, indexed symbols, product/sum symbols, arrows, line styles, and number cards. Bilingual transcripts provide prose.

## Global visual contract

- Use Manim Community Edition and raw `MathTex(r"...")` strings for every equation. Keep natural-language narration out of the video.
- Semantic palette: probability `GREEN`, log-sum / score `BLUE`, loss `RED`, gradient/update `ORANGE`, structure `WHITE`. Indexed q terms, product versus sum operators, and a solid update arrow repeat every color distinction as a shape or label.
- Load `phase29-threshold-decisions` and `phase29-log-loss` from the Phase 29 manifest. Format the visible anchors from loaded data: product `0.008289470886818511`, log-likelihood `-4.79276913734611`, fixed-check objective `0.7455450279170539`, `g_1=0.40722679415570556`, and `h=10^{-6}`.
- The ending is a poster-complete frame: Bernoulli formula, probability terms, product/log-sum relation, stable loss equation, batch gradient, and descent direction remain readable for 2 seconds.

## Scene sequence

### Scene 1: One observed outcome

**Timestamp:** 0:00–0:12

Open with `MathTex(r"P(y\\mid p)=p^y(1-p)^{1-y}")` in GREEN at the upper center. Below it, write four GREEN indexed cards `q_1` through `q_4`, using the manifest values `1.0000`, `0.5429`, `1.0000`, and `0.0153`. Use small solid squares around the cards and a product operator that is initially absent. Write the formula over 1.5 seconds, reveal the cards sequentially over 3 seconds, then hold 1 second.

### Scene 2: Product becomes a log-sum

**Timestamp:** 0:12–0:24

Fade in a RED product expression `MathTex(r"\\prod_i q_i=0.008289")` at center. Transform a copy of it into the BLUE `MathTex(r"\\sum_i\\log q_i=-4.7928")` directly below. The product sign and sum sign must be visibly different shapes; use no explanatory natural-language text. Leave the four q cards on screen while the product turns into the sum, showing that the same row contributions are being represented differently. Hold 1 second before the next transition.

### Scene 3: Negative mean BCE in logit space

**Timestamp:** 0:24–0:36

Write `MathTex(r"\\ell(z,y)=\\operatorname{softplus}(z)-yz")` in RED in the lower middle, followed by `MathTex(r"L(\\theta)=0.7455")` at 65% scale. Shift the log-sum upward rather than removing it: this visual continuity makes the negative-log-likelihood connection clear. Animate a short RED underline under `softplus(z)` and keep it solid; it marks the stable logit-domain expression rather than a probability-domain calculation. Pause 1 second.

### Scene 4: From one contribution to a descent update

**Timestamp:** 0:36–0:48

Write the row rule `MathTex(r"\\nabla_w\\ell_i=(p_i-y_i)x_i")` in ORANGE, then transform a copy into `MathTex(r"\\nabla_wL=X^\\top(p-y)/n")`. Under it, draw one thick solid ORANGE arrow from left to right and write `MathTex(r"\\theta\\leftarrow\\theta-\\eta\\nabla L")` below it. Add a compact numeric card `MathTex(r"g_1=0.4072,\\ h=10^{-6}")` from the loaded gradient-check asset. Keep all equations, cards, and arrow visible through 0:48; do not fade out the poster frame.

## Transition and accessibility notes

The same q cards persist while a product becomes a sum, so the transformation communicates the algebraic connection. The arrow’s direction, product/sum shapes, indexed terms, solid/dashed structure, numeric cards, and transcripts preserve all information if color or motion is unavailable. The final frame is intentionally static and learner-controlled video playback is handled by `ChapteredMediaPlayer`.
