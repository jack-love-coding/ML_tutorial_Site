# Math Lab Beginner Bridge Sources And Image Prompts

Date: 2026-05-22

## Purpose

This record documents the beginner-friendly Math Lab bridge added for linear algebra, calculus, and probability distributions. The goal is to make the first encounter visual and intuitive enough for zero-base middle-school learners before they meet formal notation.

## External Teaching References

- 3Blue1Brown, Essence of Linear Algebra: https://www.3blue1brown.com/eola
- 3Blue1Brown, Linear transformations and matrices: https://www.3blue1brown.com/lessons/linear-transformations/
- 3Blue1Brown, Essence of Calculus: https://www.3blue1brown.com/calculus
- 3Blue1Brown, The paradox of the derivative: https://www.3blue1brown.com/lessons/derivatives
- Seeing Theory, Probability Distributions: https://seeing-theory.brown.edu/probability-distributions/index.html
- StatQuest, video index for statistics fundamentals and probability distributions: https://statquest.org/video_index.html
- BetterExplained, math intuition reference style: https://betterexplained.com/

These references informed the teaching style only. Runtime course text and generated images are local project content.

## Generated Assets

- `/math-lab/generated/beginner-linear-algebra-story.png`
- `/math-lab/generated/beginner-calculus-story.png`
- `/math-lab/generated/beginner-probability-story.png`
- `/math-lab/generated/beginner-derivative-window-longform.png`
- `/math-lab/generated/beginner-partial-gradient-longform.png`
- `/math-lab/generated/beginner-chain-rule-backprop-longform.png`
- `/math-lab/generated/beginner-learning-rate-behavior-longform.png`
- `/math-lab/generated/beginner-probability-why-longform.png`
- `/math-lab/generated/beginner-conditional-probability-longform.png`
- `/math-lab/generated/beginner-bayes-update-longform.png`
- `/math-lab/generated/beginner-calibration-confidence-longform.png`
- `/manim/math-lab/beginner-derivative-window.mp4`
- `/manim/math-lab/beginner-chain-rule-backprop.mp4`
- `/manim/math-lab/beginner-learning-rate-behavior.mp4`
- `/manim/math-lab/beginner-probability-frequency.mp4`
- `/manim/math-lab/beginner-conditional-bayes.mp4`
- `/manim/math-lab/beginner-calibration-cross-entropy.mp4`

The original three bridge images were generated with the built-in `imagegen` tool and copied from the Codex generated-images directory into `public/math-lab/generated/`.

2026-06-17 expansion note: four calculus deepening images were first drafted with the built-in `imagegen` workflow using the prompts below. The generated previews rendered correctly in-chat, but no accessible filesystem output was exposed in this desktop session. To guarantee exact Chinese title text and reproducibility, the final PNG assets were regenerated locally with `scripts/generate_beginner_calculus_assets.py` using the same visual intent.

The three beginner-calculus video scenes are authored in `scripts/manim/scenes/math_lab_basics.py` and registered by `scripts/manim/render_math_lab.py`. If `manim` is unavailable, the render script writes lightweight fallback MP4 previews for missing files; a full Manim environment can rerender the same scene names. On 2026-06-19, `Manim Community v0.20.1` and `ffmpeg 8.1.2` were installed in the `ml-tutorial-manim` conda environment, exposed through `~/.local/bin`, and used to render the public MP4 assets. Math-To-Manim was considered only as optional external inspiration: https://github.com/HarleyCoops/Math-To-Manim.

2026-06-19 symbol polish note: the local Manim environment does not include a compatible LaTeX toolchain, so beginner videos use Unicode mathematical labels instead of `MathTex`. Code-like labels such as `dyhat` and `eta` were replaced with learner-facing symbols such as `ŷ`, `σ`, `∂L/∂ŷ`, and `η`.

2026-06-19 teaching-copy polish note: the beginner-calculus Chinese copy was revised with the local `humanizer-zh` editing guide. The rewrite keeps the same typed module schema and formulas, but uses more teacher-like prompts, everyday examples such as grocery pricing, and clearer bridges between functions, slope, rate of change, gradients, and loss updates.

2026-06-19 probability expansion note: the beginner probability chapter was expanded into a teacher-like path covering why AI needs probability, sample spaces, repeated frequency, conditional probability, Bayes update, expectation/variance, calibration, and cross entropy. Four Chinese longform probability images were first generated locally with `scripts/generate_beginner_probability_assets.py`, then visually polished with the built-in `imagegen` tool so the final PNGs include richer illustrated teaching scenes and baked-in Chinese text. Three new Manim scenes were added to `scripts/manim/scenes/math_lab_basics.py` and registered in `scripts/manim/render_math_lab.py`; the render script now skips existing public MP4 files by default unless `--force` is provided, so adding one scene does not churn older assets.

## Prompt Set

### Linear Algebra

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner illustration, project-bound course asset
Primary request: a visual-first courseware illustration that explains linear algebra for zero-base middle-school learners: ordinary data cards turning into arrows, arrows combining to reach a point, then a coordinate grid being gently stretched and rotated by a matrix, with a distance ruler showing vector length.
Scene/backdrop: clean light math-lab canvas with subtle coordinate grid and classroom-friendly visual metaphors.
Subject: feature cards, 2D arrows from one origin, span region, transformed grid, length/distance marker, small AI model input blocks.
Style/medium: polished vector-like educational infographic, raster PNG, high contrast, friendly but scientific.
Composition/framing: 16:9 wide layout, left-to-right learning story, readable at course page width.
Color palette: deep ink, cyan, amber, mint, coral, white; restrained and not one-note.
Text: no text, no letters, no numbers, no formulas.
Constraints: information-rich diagram; avoid decorative filler; no logo, watermark, chalkboard, classroom people, or unreadable labels.
```

### Calculus

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner illustration, project-bound course asset
Primary request: a visual-first courseware illustration that explains calculus for zero-base middle-school learners: a toy car moving along a smooth road, nearby positions forming a slope arrow, tiny change boxes showing input change to output change, a tangent line becoming a gradient step down a small loss valley.
Scene/backdrop: clean light scientific canvas with subtle graph grid and gentle terrain contour.
Subject: motion path, local zoom bubble, tangent/slope arrow, small dx-to-dy change blocks, downhill gradient step toward an AI training loss minimum.
Style/medium: polished vector-like educational infographic, raster PNG, friendly but rigorous.
Composition/framing: 16:9 wide layout, left-to-right story from change rate to training update, readable at course page width.
Color palette: deep ink, teal, amber, violet, coral, white; restrained and not one-note.
Text: no text, no letters, no numbers, no formulas.
Constraints: information-rich diagram; key idea must be local change not global magic; no logo, watermark, chalkboard, classroom people, or unreadable labels.
```

### Calculus Deepening Images

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner calculus longform illustration, 16:9 course image
Primary request: Create a clean Chinese educational infographic about derivative windows for zero-base middle-school learners.
Text (verbatim): "导数：把观察窗口缩到当前点"
Constraints: show a smooth curve, shrinking secant windows, tangent slope, and h table; keep text short and legible.
```

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner calculus longform illustration, 16:9 course image
Primary request: Create a clean Chinese educational infographic about partial derivatives and gradients for AI beginners.
Text (verbatim): "梯度：很多方向的局部变化率"
Constraints: show parameter knobs, partial derivatives, a loss contour map, and one gradient vector.
```

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner calculus longform illustration, 16:9 course image
Primary request: Create a clean Chinese educational infographic about the chain rule and backpropagation for AI beginners.
Text (verbatim): "链式法则：把责任沿计算图传回去"
Constraints: show forward arrows, backward gradient arrows, local derivative chips, and a small computation graph.
```

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner calculus longform illustration, 16:9 course image
Primary request: Create a clean Chinese educational infographic about learning rate behavior for AI beginners.
Text (verbatim): "学习率：同一个坡度，不同步长"
Constraints: show the same loss valley in three panels: small step, steady step, and too-large oscillation.
```

### Calculus Deepening Manim Scenes

- `BeginnerDerivativeWindowScene`: secant window shrinks into a tangent slope.
- `BeginnerChainRuleBackpropScene`: forward graph values and backward gradient flow.
- `BeginnerLearningRateBehaviorScene`: small, steady, and too-large learning-rate paths.

Rendered durations:

- `/manim/math-lab/beginner-derivative-window.mp4`: 48.2 seconds.
- `/manim/math-lab/beginner-chain-rule-backprop.mp4`: 44.1 seconds.
- `/manim/math-lab/beginner-learning-rate-behavior.mp4`: 45.3 seconds.

### Probability

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner illustration, project-bound course asset
Primary request: a visual-first courseware illustration that explains probability distributions for zero-base middle-school learners: many repeated trials as colored beads falling into bins, a smooth probability hill forming above the bins, sample dots becoming class probability bars, and uncertainty shrinking as more samples arrive.
Scene/backdrop: clean light statistics lab canvas with subtle axes but no text.
Subject: random samples, histogram-like bins, smooth distribution curve, classifier probability bars, confidence and uncertainty cues, accepted/rejected sample markers.
Style/medium: polished vector-like educational infographic, raster PNG, friendly but scientific.
Composition/framing: 16:9 wide layout, left-to-right story from repeated chance to model probabilities, readable at course page width.
Color palette: deep ink, cyan, amber, mint, violet, coral, white; restrained and not one-note.
Text: no text, no letters, no numbers, no formulas.
Constraints: information-rich diagram; show distribution as accumulated pattern not one lucky result; no casino imagery, dice, logo, watermark, chalkboard, classroom people, or unreadable labels.
```

### Probability Deepening Images

These four current PNG assets were generated with the built-in `imagegen` tool and copied into `public/math-lab/generated/`. The Chinese text is part of each generated image rather than a local overlay. `scripts/generate_beginner_probability_assets.py` remains a deterministic fallback for simpler exact-text diagrams, but it is not the source of the current polished images.

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner probability longform illustration, 16:9 course image
Primary request: Create a clean Chinese educational infographic explaining why AI needs probability as uncertainty language.
Text (verbatim): "为什么 AI 要学概率？"
Constraints: show not-one-guess framing, sample space, model probability bars, and AI uses such as classification, generation, risk, and calibration.
```

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner probability longform illustration, 16:9 course image
Primary request: Create a clean Chinese educational infographic about conditional probability as evidence filtering the sample space.
Text (verbatim): "条件概率：证据筛选样本空间"
Constraints: show an original sample space, a highlighted condition subset, and the denominator changing to the conditioned set.
```

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner probability longform illustration, 16:9 course image
Primary request: Create a clean Chinese educational infographic about Bayes update with spam base rate, signal hit rate, false alarms, and posterior probability.
Text (verbatim): "贝叶斯更新：先验 + 证据 = 后验"
Constraints: show prior, likelihood, false alarm, evidence counts, posterior formula, and base-rate warning.
```

```text
Use case: scientific-educational
Asset type: ML Atlas Math Lab beginner probability longform illustration, 16:9 course image
Primary request: Create a clean Chinese educational infographic about calibration by comparing model confidence bins with real accuracy.
Text (verbatim): "校准：高置信度也要看真实频率"
Constraints: show confidence bars, actual accuracy bars, ideal calibration line, and the statement that probabilities should be readable as frequencies.
```

### Probability Deepening Manim Scenes

- `BeginnerProbabilityFrequencyScene`: one noisy result vs repeated trials forming a distribution.
- `BeginnerConditionalBayesScene`: evidence filters the sample space; base rate, likelihood, evidence, and posterior are connected.
- `BeginnerCalibrationCrossEntropyScene`: probability bars connect to calibration bins and `-log(p_true)`.

Rendered durations:

- `/manim/math-lab/beginner-probability-frequency.mp4`: 51.9 seconds.
- `/manim/math-lab/beginner-conditional-bayes.mp4`: 44.7 seconds.
- `/manim/math-lab/beginner-calibration-cross-entropy.mp4`: 44.1 seconds.

## Linear algebra vector-matrix route assets

These images were generated for this repository with Codex's built-in `imagegen` workflow. The prompts requested Chinese-primary scientific teaching infographics for zero-base linear algebra, with sparse labels, no logos, no watermark, and no runtime remote assets.

Generated files:

- `public/math-lab/generated/linear-algebra-feature-cards.png`
- `public/math-lab/generated/vector-distance-norm-intuition.png`
- `public/math-lab/generated/cosine-vs-distance-intuition.png`
- `public/math-lab/generated/high-dimensional-embedding-search.png`
- `public/math-lab/generated/matrix-column-combination.png`
- `public/math-lab/generated/column-space-rank-intuition.png`
- `public/math-lab/generated/null-space-invisible-direction.png`
