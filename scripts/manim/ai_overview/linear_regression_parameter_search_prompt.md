# Manim Animation: Linear-regression parameter search

## Overview

Build linear-regression parameter search from the high-school foundations in `linear_regression_parameter_search_tree.json`: coordinate points, a linear function, signed differences, squares, and an arithmetic mean. The target learner is a beginner. The exact learning goal is to connect a visible candidate line to prediction, residual, squared error, MSE, and comparison of parameter pairs without implying that finite candidate search is gradient descent.

**Total concepts:** 7
**Progression:** coordinate graph → linear function → difference and square → arithmetic mean → prediction residual → mean squared error → linear-regression parameter search
**Exact duration:** 85 seconds
**Data contract:** preset `clear-trend`; `(1,52),(2,59),(3,65),(4,72),(5,78)`; the seven committed candidates; current worked candidate `w=6,b=47`; displayed best candidate `w=6.5,b=46,MSE=0.15`.

## Animation Requirements

- Use Manim Community Edition and one explicit `LinearRegressionParameterSearch(Scene)` class.
- Use a 1920×1080, 30 fps, silent render with background `#FFF7DF`.
- Use `PingFang SC` for every embedded Chinese label. Mathematical expressions use `MathTex()` with raw strings.
- Preserve the ML Atlas semantic palette: ink `#10162F`, muted `#3F4A6B`, data PINK `#FF7AB6`, candidate BLUE `#536DFE`, residual RED `#E34B5F`, squared-error ORANGE `#FF9F43`, success GREEN `#2FD27F`, highlight YELLOW `#FFD84D`.
- Keep all content within the 16:9 title/action safe area. At every cut, leave at least two seconds of readable hold after the last important label appears.
- The formula, table, line, residuals, and leaderboard must use the same values at the same time. Never decorate with a number that is not derived from the fixture.

## Scene Sequence

### Scene 1: The prediction question
**Timestamp:** 0:00–0:08

Open on the warm ML Atlas background. Fade in the BLUE category label `监督学习 · 线性回归` near the top, then write the centered question `练习时长能预测下一次得分吗？` in large INK text. Under it, fade in `输入 x：练习时长（小时）   输出 ŷ：预测得分` in MUTED. The point of this opening is not to explain regression yet; it establishes one input, one numerical output, and the exact practical question. Keep the characters large and do not use a bitmap title. Hold long enough to read, then fade all three text objects as a group. The next scene must begin exactly at eight seconds.

### Scene 2: Coordinate graph and shared observations
**Timestamp:** 0:08–0:18

Create axes with x from 0 to 6 and y from 45 to 85. Label them `练习时长 x（小时）` and `下一次得分 y`. Fade in the exact heading `共享数据：清晰趋势 clear-trend`. Reveal the five PINK points in order at `(1,52),(2,59),(3,65),(4,72),(5,78)`, while the exact coordinate list remains visible along the lower safe margin. The dots represent observations, not predictions. Do not connect them and do not invent uncertainty. The upward arrangement should make the trend intuitive before a line exists. Preserve the axes and points across the cut at eighteen seconds so that the candidate line is built directly on the same coordinate system.

### Scene 3: Candidate line, slope, and intercept
**Timestamp:** 0:18–0:30

Create the BLUE candidate line for `w=6,b=47`, then write raw LaTeX `r"\hat{y}=wx+b"` in the upper-right. Display `w=6, b=47` immediately beneath it. On the upper-left, fade in two Chinese explanations: `w：斜率，控制每多练 1 小时提高多少分` in BLUE and `b：截距，控制整条直线的上下位置` in ORANGE. Briefly change the line to ORANGE and back to BLUE to distinguish vertical placement from tilt without shifting to a second graph. The line must pass through predictions 53, 59, 65, 71, and 77 at x values one through five. Finish with the line stable and the first observed point still visible, preparing a literal vertical residual.

### Scene 4: One complete sample calculation
**Timestamp:** 0:30–0:44

Remove the role labels and coordinate footer to clear the right side. Focus the observed first sample and draw a RED dashed segment from observed `y=52` to predicted `ŷ=53`. Write the calculation one line at a time: `取第 1 个样本：x=1，y=52`; raw `r"\hat y=6\times1+47=53"`; raw `r"y-\hat y=52-53=-1"`; raw `r"(y-\hat y)^2=(-1)^2=1"`. Use BLUE for prediction, RED for signed residual, and ORANGE for the square. The negative residual says the observation lies one point below the candidate prediction. Squaring makes the contribution non-negative. Do not reverse the residual convention; throughout this package it is `y-ŷ`. Hold the four-line chain together, then remove it and the focus marks before forty-four seconds.

### Scene 5: From five squared errors to MSE
**Timestamp:** 0:44–0:55

Replace the plot with a compact table. Show x values `1,2,3,4,5`, predictions `53,59,65,71,77`, and ORANGE squared errors `1,0,0,1,1`. Under the table write raw `r"\mathrm{MSE}=\frac{1+0+0+1+1}{5}=0.6"`. Add a YELLOW surrounding rectangle after the formula is complete. The table and formula must stay synchronized: there are exactly five samples and their squared-error total is three. Explain visually that MSE is one scalar summary of the candidate, not a percentage and not the signed residual. Fade the full table group before the next parameter comparison.

### Scene 6: Visible parameter search and leaderboard
**Timestamp:** 0:55–1:15

Restore the axes and PINK observations. Add the heading `可见参数搜索：同步比较直线、残差与 MSE`. On the right create a current-best leaderboard. Visit every committed candidate in this order, changing the same line object and revealing its exact MSE: `(4,48)→39.60`, `(5,48)→9.40`, `(6,47)→0.60`, `(6.5,46)→0.15`, `(6.6,45.8)→0.24`, `(7,45)→1.20`, `(5.5,50)→3.75`. For every candidate, transform the candidate line, all five red residual segments, the current MSE readout, the newly revealed leaderboard row, the best-so-far text, and the GREEN best-row marker in the same animation. Keep the best-so-far meaning distinct from the current candidate: after the sequence, the GREEN marker remains around `w=6.5,b=46,0.15` even when later candidates are being tried. Do not claim continuous optimization; this scene enumerates only the provided teaching candidates.

### Scene 7: Current best and gradient-descent handoff
**Timestamp:** 1:15–1:25

Clear the leaderboard and redraw the shared points with the GREEN best candidate line. Display `当前最优：w=6.5，b=46，MSE=0.15` prominently. Under the plot place two separate statements: `这里逐个尝试候选参数，是教学简化。` and `后续：用梯度下降更系统地寻找更小的误差。` Highlight the first statement as a limitation and the second in BLUE as the learning-path handoff. The final frame must keep the best line, exact parameters, and teaching-simplification sentence visible. Do not say global optimum, because the comparison is limited to the committed candidate list.

## Final Notes

The animation is silent, so every calculation must be visually self-contained. The Chinese transcript follows the exact cuts above. The English record is a summary, not a claim that an English-language video exists. Poster extraction uses the final best-line frame; keyframes use the shared-data, one-sample-error, and leaderboard-best moments from the approved render.

## Foundation-to-target directing notes

Treat the coordinate graph as a semantic object, not a decorative chart. The x coordinate always means hours and the y coordinate always means score. The observed dots therefore stay PINK in every scene in which they appear. Never reuse PINK for a prediction. When the learner first sees the points, allow the upward pattern to be perceived without a fitted line; this establishes why a straight-line model is plausible but does not assert that it is already correct. Axis ticks need not print every number because the coordinate footer provides the exact values, but the position mapping must be the same mapping later used for the candidate line.

Introduce the linear function as a mapping. `x` enters, multiplication by `w` changes scale, and addition of `b` changes baseline. The animation can indicate these roles through color changes, yet it must not suggest that `w` and `b` are independent of the loss. Their roles are geometric before their quality is judged numerically. Keep `ŷ` visually distinct from observed `y`; the hat is essential because the course uses the same variable vocabulary in formulas, code, tables, and labs.

When the residual appears, align its endpoints at the same x coordinate. A diagonal segment would imply a different distance definition. The signed residual is `y−ŷ`, so an observed point below the line produces a negative number. Only after that direction is visible should the square appear. Explain through sequencing rather than extra prose: prediction first, signed difference second, square third. The square must not be called absolute error. Preserve the exact arithmetic signs even though both `−1` and `+1` would square to one.

The arithmetic-mean foundation becomes MSE only after the five comparable squared errors are collected. The numerator is a sum of five squared residuals, and the denominator is the sample count five. Do not divide each table entry again. Visually group the five values before drawing the fraction bar. The highlighted `0.6` belongs specifically to candidate `w=6,b=47`, so remove it before showing a different candidate line.

During parameter comparison, use one line identity and one residual-group identity that transform rather than seven simultaneously drawn sets. This prevents the learner from confusing candidate identity with a permanent model ensemble. Each leaderboard row, current MSE, and set of five residuals is evidence tied to one state of that line. Reveal rows in committed order, even though the MSE sequence is not monotonic after the best candidate. That non-monotonic sequence helps show why the current candidate and current best are different notions. Move the GREEN marker as soon as a new best appears and retain it on the best-so-far row while later candidates update the blue line and red residuals.

The concluding best line is “current best among the displayed candidates.” Avoid `optimal` without qualification, avoid a derivative symbol, and avoid an arrow that resembles a gradient update. The gradient-descent handoff is verbal and curricular: finite enumeration made the objective visible; a later lesson will introduce a systematic update rule. The final hold should give enough time to read both the simplification and the next-step statement without requiring audio.

For accessibility, never rely only on the PINK/BLUE/RED/GREEN distinctions. Observations are dots, the model is a solid line, the residual is dashed, and the best candidate has an explicit numerical title. All Chinese text is embedded as vector glyphs from the declared font. The transcript must retain the same residual convention and the same candidate ordering, while the English summary describes the mechanism without claiming that these Chinese frames have been localized.
