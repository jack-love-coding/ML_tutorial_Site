# Manim Animation: Aligned parity, then L2 changes the objective

## Overview

**Estimated Duration:** 38 seconds

**Progression:** fixed train-only data contract → declared unregularized BCE → aligned scratch/library parity → separate L2 objective → coefficient shrinkage and confidence-field comparison → poster-complete caution. The film is language-neutral: only equations, numbers, bars, lines, arrows, and solid/dashed geometry appear; the paired transcripts carry prose.

## Global visual contract

- Use Manim Community Edition and raw `MathTex(r"...")` for all formulae. Load `phase29-regularization` from the Phase 29 manifest; never use a library default as an unexplained comparison.
- Baseline is BLUE with a solid field boundary. Aligned agreement is GREEN with paired bars. The changed L2 objective is ORANGE with a dashed field boundary. Coefficient shrinkage is shown by bar length; solid/dashed geometry and numeric cards duplicate color semantics.
- First show the shared unregularized target: scratch terminal BCE `0.011867429046995634`, gradient-norm stopping at iteration `90542`, and aligned `lbfgs`, `C=\infty`, `tol=10^{-12}`. Then reveal the observed differences `|\Delta_\theta|_{max}=0.00015996734427758952` and `|\Delta_p|_{max}=8.860994619164231\times10^{-7}`.
- Only after parity is visible, show the separate L2 target `L_{L2}=L_{BCE}+0.05\lVert w\rVert_2^2/2`, its objective `0.3463182734496942`, and the fact that the intercept is not penalized. Do not assert causation or a universal best model.

## Scene sequence

### Scene 1: Fix the baseline before comparing implementations

**Timestamp:** 0:00–0:10

Write `MathTex(r"L_{BCE}=\operatorname{mean}(\operatorname{softplus}(z)-yz)")` in BLUE across the top. Create one neutral data card, then one BLUE solid confidence-field rectangle beneath it. Add a compact BLUE card `MathTex(r"L_{BCE}=0.0118674, t=90542")`. The one input card and solid boundary say the data and baseline objective are fixed before any implementation comparison.

### Scene 2: Align scratch and library before reading a difference

**Timestamp:** 0:10–0:20

Split the lower area into two matching BLUE/WHITE parameter-bar groups. Fade in a GREEN equality bridge between them, then the numeric cards `MathTex(r"C=\infty,\ \mathrm{tol}=10^{-12}")`, `MathTex(r"|\Delta_\theta|_{max}=1.60\times10^{-4}")`, and `MathTex(r"|\Delta_p|_{max}=8.86\times10^{-7}")`. The paired bars, equality bridge, and tolerances make it clear that this is deliberately aligned unregularized parity, not an undocumented default.

### Scene 3: Change the objective explicitly

**Timestamp:** 0:20–0:29

Keep the baseline formula in the upper-left. Write `MathTex(r"L_{L2}=L_{BCE}+\lambda\lVert w\rVert_2^2/2")` in ORANGE on the upper-right, then `MathTex(r"\lambda=0.05")` and `MathTex(r"L_{L2}=0.3463183")`. Transform the right solid field into an ORANGE dashed field and shorten its four coefficient bars. Put a small neutral label `MathTex(r"b\ \mathrm{not\ penalized}")` under the intercept marker. The visual change must occur after the new objective appears.

### Scene 4: Static conclusion

**Timestamp:** 0:29–0:38

Leave both objective equations, the parity tolerance card, solid/dashed fields, paired coefficient bars, and intercept-exclusion label visible. Add `MathTex(r"\mathrm{same\ data}\not\Rightarrow\mathrm{same\ objective}")` in WHITE along the bottom. Hold this arrangement without further motion through 0:38, making it the complete SVG poster and the reduced-motion explanation.

## Accessibility and interpretation notes

The transcript repeats every formula and anchor in Chinese and English. Bar length, paired placement, field stroke style, equality bridge, and labels are always present with color. The result only compares predeclared configurations; it neither makes a causal claim about a feature nor ranks an optimizer or regularizer as universally best.
