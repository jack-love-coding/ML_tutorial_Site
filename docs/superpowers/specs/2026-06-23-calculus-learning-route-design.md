# Calculus Learning Route Design

Date: 2026-06-23
Branch: `codex/linear-algebra-route-chapterization`
Status: Draft for user review

## Goal

Turn the current calculus-related material into a beginner-friendly multi-chapter route. The route should serve learners with zero or high-school-level calculus background, so it must begin with everyday change before introducing derivative notation, gradients, gradient descent, optimizer families, and training-code diagnostics.

The teaching line is:

1. Start from concrete input-output change.
2. Shrink the observation window to reach derivatives.
3. Expand from one variable to many parameters through partial derivatives and gradients.
4. Use the negative gradient and learning rate to update parameters.
5. Compare full-batch, mini-batch, and stochastic updates.
6. Explain optimizer variants as fixes for specific gradient-descent problems.
7. Translate the math into `loss.backward()`, `optimizer.step()`, and training-curve diagnosis.

Each chapter should close the loop from a familiar situation to a machine-learning loss landscape. The route should not become a list of formulas or an optimizer API catalogue.

## Target Learner Experience

The route is designed for learners who may not yet know calculus vocabulary. They should first feel that calculus is a language for answering "if one thing changes, how does another thing respond?"

Learners should be able to say:

- A function is an input-output rule, not just a symbolic expression.
- Average rate of change compares two positions; a derivative describes the current neighborhood.
- A tangent slope is local and can change from point to point.
- A partial derivative isolates one parameter direction while holding others fixed.
- A gradient collects many local rates and points toward fastest loss increase.
- Gradient descent subtracts the gradient to reduce loss; it does not simply make every parameter smaller.
- Learning rate controls step length, so the same direction can produce slow, stable, oscillating, or divergent behavior.
- SGD is a noisy gradient estimate, not a broken version of gradient descent.
- Momentum, RMSProp, and Adam are easier to understand when each is tied to the problem it fixes.
- Training code is the operational form of the same story: forward, loss, backward, optimizer step, and diagnostics.

## Route Structure

### Chapter 1: Functions and Rate of Change

Core question: when an input changes, how does the output change?

Teaching cases:

- Grocery price as weight changes.
- A car's position as time changes.
- A model's loss as one parameter changes.

Teaching arc:

1. Introduce a function as an input-output machine.
2. Show the same function through a table, graph, and sentence.
3. Introduce average rate of change as \((f(x+h)-f(x))/h\).
4. Use a secant line between two points to make the ratio visible.
5. End by asking why a whole-interval average cannot answer "what is happening right here?"

Expected lab:

- Reuse or lightly adapt `LocalChangeStoryLab`.
- In this chapter, keep the task narrow: drag two points, read the output change, input change, and average slope.

Expected checkpoint:

- Distinguish "average over an interval" from "current-point behavior."
- Explain why changing \(h\) changes the story told by the average rate.

### Chapter 2: Derivatives as Local Change

Core question: why is "this moment's rate" different from an interval average?

Teaching cases:

- A speedometer reading versus whole-trip average speed.
- A curved price or cost function where the slope changes by location.

Teaching arc:

1. Shrink the secant window: \(h=2,1,0.5,0.1\).
2. Show the secant line approaching the tangent line.
3. Define the derivative as the limit of shrinking average rates.
4. Interpret positive, negative, and near-zero slopes.
5. Emphasize locality: a derivative describes the current neighborhood, not the whole function.

Expected lab:

- Reuse `LocalChangeStoryLab` with derivative-window framing.
- Add chapter-level prompts that focus on window size and tangent approximation.

Expected checkpoint:

- Explain why a derivative is not the global average of a curve.
- Predict whether output rises, falls, or stays nearly flat from the local slope.

### Chapter 3: Partial Derivatives and Gradients

Core question: if a model has many parameters, how do we know what each one should do?

Teaching cases:

- A small model with weight \(w\) and bias \(b\).
- A control panel where each knob changes the loss dial.
- A two-parameter loss contour map.

Teaching arc:

1. Move from one input variable to multiple parameter knobs.
2. Define a partial derivative as moving one knob while holding the others fixed.
3. Show \(\partial L/\partial w\) and \(\partial L/\partial b\) as separate local readings.
4. Collect partial derivatives into the gradient vector.
5. Show the gradient arrow on contours and clarify that it points uphill.

Expected lab:

- Reuse existing gradient and local-change assets where possible.
- If a new lab is needed later, keep it small: two sliders for \(w,b\), a loss readout, and an arrow for the gradient.

Expected checkpoint:

- Distinguish a partial derivative from a gradient.
- Explain why the gradient points toward fastest increase and why training uses the opposite direction.

### Chapter 4: Gradient Descent

Core question: once the direction is known, how does a model lower loss step by step?

Teaching cases:

- Walking down a loss valley.
- A parameter update on a simple quadratic loss.
- Three learning-rate paths: too small, suitable, too large.

Teaching arc:

1. Start from the update \(\theta_{new}=\theta-\eta\nabla L(\theta)\).
2. Read the minus sign as "move opposite the uphill direction."
3. Read \(\eta\) as step length, not intelligence or guaranteed speed.
4. Compare small, suitable, and large learning rates.
5. Introduce oscillation, overshooting, and divergence using visible trajectories.

Expected lab:

- Reuse `MathGradientLab` and existing gradient-descent visual assets.
- Wrap the lab in more beginner-oriented prompts than the current optimization chapter.

Expected checkpoint:

- Explain why subtracting a negative gradient component can increase that parameter.
- Identify learning-rate-too-large behavior from a path or loss curve.

### Chapter 5: Full Batch, Mini-Batch, and SGD

Core question: why does real training often use only part of the data for one update?

Teaching cases:

- Estimating the average direction from a sample of examples.
- Comparing smooth full-batch paths to noisy mini-batch paths.
- Interpreting iteration versus epoch.

Teaching arc:

1. Explain full-batch gradient as the average direction over the whole dataset.
2. Explain mini-batch gradient as an estimate from a subset.
3. Show that stochastic updates can wobble while still trending downward.
4. Separate batch size, update frequency, iteration, and epoch.
5. Connect gradient noise to both instability and possible escape from poor local structure.

Expected lab:

- Reuse the top-level `gradient-descent` simulation ideas where possible.
- Add route-level prompts that compare batch modes with the same loss surface and learning rate.

Expected checkpoint:

- Explain why SGD is noisy rather than automatically wrong.
- Describe how changing batch size affects loss-curve smoothness and updates per epoch.

### Chapter 6: Optimizer Comparison

Core question: what practical problem does each optimizer fix?

Teaching cases:

- A narrow ravine where plain SGD zig-zags.
- Parameters whose gradient magnitudes differ by direction.
- Noisy mini-batch updates with useful direction history.

Teaching arc:

1. Start with plain SGD as the baseline.
2. Introduce Momentum as direction memory that damps zig-zagging.
3. Introduce RMSProp as per-parameter step-size adaptation from squared-gradient history.
4. Introduce Adam as combining direction memory with scale adaptation.
5. Keep formulas secondary to the problem map: noise, ravines, unequal scales, and step-size sensitivity.

Expected lab:

- Reuse the existing `optimizer-comparison` material.
- Add a beginner-facing optimizer family map before formulas and code snippets.

Expected checkpoint:

- Match each optimizer to the problem it mainly addresses.
- Explain why switching optimizers does not remove the need to tune learning rate and inspect curves.

### Chapter 7: Training Code and Curve Diagnostics

Core question: how do the math ideas appear in training code and training behavior?

Teaching cases:

- A minimal training loop with `zero_grad()`, `loss.backward()`, and `optimizer.step()`.
- Healthy convergence versus high learning rate, overfitting, vanishing gradients, and exploding gradients.

Teaching arc:

1. Read the training loop as forward, loss, backward, optimizer step.
2. Explain why gradients must be cleared before the next backward pass.
3. Connect `loss.backward()` to computing gradients through the computation graph.
4. Connect `optimizer.step()` to the optimizer-specific update rule.
5. Read train loss, validation loss, and gradient norm together.
6. Choose interventions from the diagnosis rather than only training longer.

Expected lab:

- Reuse `TrainingDiagnosticsLab`.
- Use `BackpropBlockLab` here as either a recap or a bridge from chain rule to code.

Expected checkpoint:

- Put `zero_grad()`, `loss.backward()`, and `optimizer.step()` in the correct order.
- Diagnose common curve patterns and connect them to likely interventions.

## Existing Material Reuse

The route should reuse existing content as a material library instead of rewriting everything from scratch:

- `beginner-calculus`: source material for Chapters 1-3, including functions, average change, derivative windows, partial derivatives, gradients, chain rule, and numerical checks.
- `LocalChangeStoryLab`: main lab for Chapters 1-2, with chapter-specific prompts.
- `BackpropBlockLab`: move later in the route or use as a light preview only after gradients are introduced.
- `finite-difference-methods`: keep as an optional extension for numerical gradient checking, not as an early required chapter.
- `optimization` and `MathGradientLab`: source for Chapter 4, with a simpler beginner wrapper.
- `gradient-descent`: source for Chapters 4-5 and for batch-mode behavior.
- `optimizer-comparison`: source for Chapter 6, especially training loop and optimizer variants.
- `training-diagnostics`: source for Chapter 7 and the final ML training bridge.

## New Content Needed

The first implementation pass should prioritize route glue over complex new visualization work.

Needed additions:

- A route-level chapter registry for the calculus learning route.
- Seven chapter definitions with `LocalizedCopy` in `zh-CN` and `en`.
- Chapter-specific learning objectives, concepts, misconceptions, quizzes, and next-step links.
- Route-level navigation that presents calculus as a sequence, not one large module.
- Beginner-friendly introductions for reused labs so each lab serves the chapter's current learning goal.
- A problem-driven optimizer family map for SGD, Momentum, RMSProp, and Adam.
- Checkpoints that explain reasoning and point back to relevant visuals or labs.

Possible later additions:

- A dedicated two-parameter gradient lab if existing labs cannot make partial derivatives concrete enough.
- A compact optimizer-path comparison lab if the current top-level optimizer content is too code-heavy.
- A small training-loop ordering interaction for Chapter 7 if existing checkpoints are not visible enough.

## Out of Scope for the First Pass

- Replacing all calculus, optimization, and optimizer components.
- Adding a new UI framework or unrelated page redesign.
- Making finite differences a required early chapter.
- Introducing full Jacobian, Hessian, VJP, JVP, or matrix calculus before learners finish the beginner route.
- Covering every optimizer in PyTorch. The required comparison set is plain GD/SGD, Momentum, RMSProp, and Adam.
- Treating code as the starting point for the route. Code appears after learners understand the change-and-update story.

## Testing and Acceptance

Implementation should satisfy the project rules in `AGENTS.md`:

- Content uses the existing typed math-lab schema and bilingual `LocalizedCopy`.
- Each chapter has a learning loop: core question, visual or lab, formula or numerical example, ML connection, misconception, checkpoint, and next step.
- Route and navigation changes preserve lazy-loading patterns.
- Reused public assets use public paths compatible with the existing base-path helpers or adjacent patterns.
- Quiz feedback explains the reason and references the misconception or visual.
- Any new utility logic, scoring logic, route registration behavior, or simulation change receives focused tests.
- If only docs are changed, no full build is required; verify the spec path, scope, and commands are current.

## Implementation Direction

The first implementation should create a dedicated calculus route data file with seven typed chapter modules. Existing assets, labs, and long-form content should be reused as source material, but the learner-facing route should present the seven chapters as independent stops rather than one enlarged `beginner-calculus` page.

`beginner-calculus` can remain as a compatibility source while the new route is introduced, but primary navigation should move learners through the new sequence. The implementation plan should decide exact filenames, migration order, and test coverage, but not reopen the route shape.

Remaining planning details:

- Which existing tests need to be expanded for navigation and chapter registry coverage.
- Whether Chapter 6 needs a new visual family map asset or can ship first with structured text and existing optimizer visuals.
- Whether Chapter 7 needs a small training-loop ordering interaction or can rely on existing checkpoint UI in the first pass.
