# Manim Animation: Confident mistake, stable BCE, and gradient signal

## Overview

**Estimated Duration:** 38 seconds

**Progression:** binary label and logit → stable softplus BCE → frozen high-loss Banknote row → residual and row-gradient contribution → central-difference agreement → poster-complete conclusion. The movie is language-neutral. Transcripts carry prose; visible movie labels are formulas, values, line styles, arrows, and neutral symbols only.

## Global visual contract

- Use Manim Community Edition and raw `MathTex(r"...")` expressions. Read anchors from `phase29-linear-score` and `phase29-log-loss`; do not copy numerical authority into scene code.
- Score is BLUE, probability is GREEN, loss is RED, and gradients are ORANGE. A solid curve means the loss function, a solid circular point is the evaluated row, a dashed vertical guide shows the distance from the score axis, and an arrowed ORANGE line is the corrective contribution. Every cue also has a shape, stroke, or numeric label.
- The frozen high-loss comparison is validation row `919`: `y=1`, `z=-4.166471588903541`, `p=0.01527008697005507`, and `\ell=4.181859464282873`. The finite-difference batch check has `L(\theta)=0.7455450279170539`, `h=10^{-6}`, first analytic component `0.40722679415570556`, and maximum component error `7.450942640652158e-11`.
- Never clip probabilities in the derivation or imply that the high-loss row changes training or selects a model. Display the stable logit formula `MathTex(r"\ell(z,y)=\operatorname{softplus}(z)-yz")` before its numeric example.

## Scene sequence

### Scene 1: Stable row loss

**Timestamp:** 0:00–0:10

Open with `MathTex(r"\ell(z,y)=\operatorname{softplus}(z)-yz")` in RED at the top center. Beneath it write `MathTex(r"\partial\ell/\partial z=p-y")` in ORANGE. Fade in a WHITE score axis and a RED solid softplus loss curve. Add two small neutral outcome boxes labeled `y=0` and `y=1` with no semantic class names. Hold the formula long enough to establish that the loss is evaluated directly from the logit and stays finite for finite `z`.

### Scene 2: A frozen confident mistake

**Timestamp:** 0:10–0:20

Create a RED solid point on the wrong side of the curve’s logit axis. Draw a RED dashed vertical guide to the score axis. Reveal, one line at a time, `MathTex(r"y=1")`, `MathTex(r"z=-4.1665")`, `MathTex(r"p=0.01527")`, and `MathTex(r"\ell=4.1819")`. The probability is small for the observed class, so the number is a large loss. Let the solid point, dashed guide, and four numeric labels remain together; do not depend on the red color to communicate the mismatch.

### Scene 3: From residual to parameter contribution

**Timestamp:** 0:20–0:29

Keep the high-loss row visible. Transform the second formula into `MathTex(r"\nabla_w\ell=(p-y)x")`. Draw an ORANGE arrow from a parenthesized `MathTex(r"p-y")` token to a compact `MathTex(r"x")` vector, ending at `MathTex(r"\nabla_w\ell")`. Place a minus-direction update arrow below: `MathTex(r"w\leftarrow w-\eta\nabla_wL")`. The direction arrow is arrowheaded and the loss point stays solid, preserving non-color distinction.

### Scene 4: Check the derivation and hold the conclusion

**Timestamp:** 0:29–0:38

Fade in a lower agreement card with `MathTex(r"[L(\theta+h e_j)-L(\theta-h e_j)]/(2h)\approx\partial L/\partial\theta_j")`, followed by `MathTex(r"h=10^{-6},\ |\Delta|=7.45\times10^{-11}")`. Pulse the card once, then leave the stable BCE formula, high-loss point and dashed guide, residual-to-gradient arrow, update arrow, and agreement card unchanged through 0:38. This final still is the SVG poster: it must explain the mechanism even when motion cannot play.

## Accessibility and transition notes

The transcript gives the ordered explanation in Chinese and English. Solid/dashed strokes, arrows, equation labels, and numerical cards duplicate all color semantics. There is no voiceover, autoplay, class-semantic claim, causal interpretation, or learner-editable data inside the video.
