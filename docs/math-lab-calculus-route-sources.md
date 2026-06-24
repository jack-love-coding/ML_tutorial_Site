# Math Lab Calculus Learning Route Sources

Date: 2026-06-23

## Route Chapters

- `calculus-functions-rate-change`: Functions and Rate of Change.
- `calculus-derivatives-local-change`: Derivatives as Local Change.
- `calculus-partial-derivatives-gradients`: Partial Derivatives and Gradients.
- `calculus-gradient-descent`: Gradient Descent.
- `calculus-sgd-batch-noise`: Full Batch, Mini-Batch, and SGD.
- `calculus-optimizer-comparison`: Optimizer Comparison.
- `calculus-training-code-diagnostics`: Training Code and Curve Diagnostics.

## Teaching Sources

- 3Blue1Brown Essence of Calculus: https://www.3blue1brown.com/topics/calculus
- Dive into Deep Learning Optimization Algorithms: https://d2l.ai/chapter_optimization/index.html, CC BY-SA 4.0.
- PyTorch Optimizing Model Parameters: https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html
- Mathematics for Machine Learning: https://mml-book.github.io/

## Reused Source Modules

- `src/modules/math-lab/data/beginnerFoundationModules.ts`
- `src/modules/math-lab/data/optimizationModule.ts`
- `src/data/gradientDescentModule.ts`
- `src/data/optimizerComparisonModule.ts`
- `src/modules/math-lab/data/aiBridgeModules.ts`

## Reused Public Assets

- `/math-lab/generated/beginner-calculus-story.png`
- `/math-lab/generated/beginner-derivative-window-longform.png`
- `/math-lab/generated/beginner-partial-gradient-longform.png`
- `/math-lab/generated/beginner-learning-rate-behavior-longform.png`
- `/manim/math-lab/beginner-derivative-window.mp4`
- `/manim/math-lab/beginner-derivative-window.svg`
- `/manim/math-lab/beginner-learning-rate-behavior.mp4`
- `/manim/math-lab/beginner-learning-rate-behavior.svg`

## First-Pass Boundary

This first pass reuses existing labs and public assets, including `LocalChangeStoryLab`, `MathGradientLab`, `TrainingDiagnosticsLab`, and `BackpropBlockLab`. It does not add new optimizer visualization, new Manim scenes, or a new training-loop component.
