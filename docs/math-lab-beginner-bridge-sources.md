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

The images were generated with the built-in `imagegen` tool and copied from the Codex generated-images directory into `public/math-lab/generated/`.

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
