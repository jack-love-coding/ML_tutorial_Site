# Math Lab Calculus Learning Route Sources

Date: 2026-06-23

## Route Chapters

- `calculus-functions-rate-change`: Functions and Mappings: How Inputs Become Predictions.
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

## Implemented Interaction Boundary

The route keeps the existing public image and Manim assets, while using focused interactive labs where the original reuse caused teaching mismatch:

- `calculus-functions-rate-change`: `PredictionMappingLab` changes only bounded `w1`, keeps `x = [2, 3]`, `w2 = -1`, `bias = 5`, and `target = 9` fixed, and shows local-only formative readouts for prediction, residual, and MSE without emitting progress evidence.
- `calculus-partial-derivatives-gradients`: `PartialDerivativeContourLab`.
- `calculus-gradient-descent`: `MathGradientLab`.
- `calculus-sgd-batch-noise`: `BatchGradientNoiseLab`.
- `calculus-optimizer-comparison`: `OptimizerRaceLab`.
- `calculus-training-code-diagnostics`: `TrainingDiagnosticsLab` and `BackpropBlockLab`.

The functions-and-mappings lesson uses 3Blue1Brown for function-graph intuition and Mathematics for Machine Learning for function, vector, and linear-prediction notation. The approved internal manuscript supplies the lesson sequence and examples but is not exposed as a runtime `/docs` link.
