# Guided Studio: From Mathematics to Reproducible Code

> **Suggested time: 90–120 minutes**
>
> This page connects the first five lessons into one independent practice notebook. Work from scalar calculations through vectors, batch prediction, MSE, and numerical sensitivity evidence. In every stage, write an expectation before running code and retain values, shapes, and explanations.
>
> **Run order:** Complete stages 1 through 9 in one notebook. Each later stage inherits checked variables from earlier cells. Do not jump to an isolated code block or recreate the environment per stage.
>
> This page performs no parameter iteration. The probability simulation is only a preview; the core chain remains `x, X, w, b -> y_hat -> y -> L`.

## Stage 1: Reproduce the Task and Input Contract {#studio-reproduce-task}

### Stage goal

Establish one source of truth for the data before calculating anything. The two rows are two small-game levels. Columns stay in the fixed order “base-task count, hint-request count.” `X,w,b` generate predictions; `targets` enter only afterward for comparison. At the end of this stage, every number should have a named origin instead of looking like one of four unexplained arrays.

### Prior inputs

Use Python 3 and NumPy. The shared notebook starts from `X = [[2.0, 3.0], [1.0, 4.0]]`, `w = [4.0, -1.0]`, `b = 5.0`, and `targets = [9.0, 7.0]`. Their expected shapes are (2,2), (2,), scalar, and (2,). On paper, label the sample axis and feature axis first. All nine stages belong to one notebook in order; later cells inherit variables checked by earlier cells.

### Starter code and steps

```python
import numpy as np

X = np.asarray([[2.0, 3.0], [1.0, 4.0]], dtype=float).copy()
w = np.asarray([4.0, -1.0], dtype=float).copy()
b = float(5.0)
targets = np.asarray([9.0, 7.0], dtype=float).copy()

if X.ndim != 2 or X.shape[0] == 0 or X.shape[1] == 0:
    raise ValueError("X must be a nonempty 2D matrix")
if w.ndim != 1 or w.size == 0:
    raise ValueError("w must be a nonempty 1D vector")
if targets.ndim != 1 or targets.size == 0:
    raise ValueError("targets must be a nonempty 1D vector")
if not np.isfinite(X).all() or not np.isfinite(w).all():
    raise ValueError("X and w must be finite")
if not np.isfinite(targets).all() or not np.isfinite(b):
    raise ValueError("targets and b must be finite")
print(X.shape, w.shape, targets.shape)
```

### Expected intermediate results

The output is `(2, 2) (2,) (2,)`. The data ledger says row 0 [2,3] has target 9 and row 1 [1,4] has target 7. Weight item 0 pairs only with column 0; item 1 pairs only with column 1. No prediction exists yet.

### Observation prompt

`.copy()` breaks mutable aliases with caller arrays, and `dtype=float` permits small decimal perturbations. Shape validates structure, while the column ledger validates meaning; neither replaces the other.

### Common failures and repairs

If X is flattened to [2,3,1,4], recover the “one sample per row” source instead of guessing a reshape. If NaN or Infinity appears, locate the producing step before loss. If columns are swapped, swap their names and the two entries of w together.

### Reflection

Why can target not be a column of X? A new level must receive a prediction before its outcome is known. Write one sentence separating “information available at prediction time” from “information revealed afterward for comparison,” then continue to the scalar baseline.

## Stage 2: Build a Transparent Scalar Baseline {#studio-scalar-baseline}

### Stage goal

Rebuild the first-row prediction term by term without NumPy matrix multiplication. This slower transparent implementation is independent evidence for later vectorization. If a compact expression disagrees with the hand ledger, inspect axes and broadcasting against the auditable contributions before trusting brevity.

### Prior inputs

Complete stage 1 in the same notebook and keep its checked `X,w,b,targets`. Take only the first row as x; do not recreate weights or bias. The formula is `y_hat = w^T x + b`. The loop must work for any valid feature dimension d rather than hard-coding two terms.

### Starter code and steps

```python
x = X[0].copy()
if x.ndim != 1 or x.shape != w.shape:
    raise ValueError("x and w must have the same length")

scalar_contributions = []
weighted_sum_scalar = 0.0
for index in range(w.size):
    contribution = float(x[index] * w[index])
    scalar_contributions.append(contribution)
    weighted_sum_scalar += x[index] * w[index]
prediction_scalar = weighted_sum_scalar + b
print(scalar_contributions, weighted_sum_scalar, prediction_scalar)
```

Align the output cell by cell with `4*2=8`, `(-1)*3=-3`, and therefore `8 + (-3) + 5 = 10`. Preserve the intermediate names rather than collapsing the expression early.

### Expected intermediate results

The output contains `scalar_contributions = [8.0, -3.0]`, `weighted_sum_scalar = 5.0`, and `prediction_scalar = 10.0`. Contributions, weighted sum, and bias all use minutes. Target 9 still has no role in this forward calculation.

### Observation prompt

A negative weight does not delete the second feature; it creates a -3 contribution. A scalar output confirms that pairing, aggregation, and bias addition are complete. Stopping at [8,-3] leaves a contribution vector rather than a prediction.

### Common failures and repairs

A result of 16 often changes -1*3 into +3. A result of 5 often omits bias. A result of 13 often discards the negative contribution. Repair the first divergent step by printing index, feature, weight, and product rather than editing the final number.

### Reflection

Why preserve a long scalar expansion when `@` is shorter? Name two errors it can detect independently. Optional extension: repeat the expansion for row [1,4] and expect 5; this extension does not block the main notebook.

## Stage 3: Translate the Scalar Chain into a Vector Prediction {#studio-vector-prediction}

### Stage goal

Translate the two first-row contributions into a vector operation while preserving shapes and visible intermediates. The point is not saving two lines; it is demonstrating that elementwise multiplication plus reduction and `@` describe the same dot product, with a scalar final output.

### Prior inputs

Complete stage 2 in the same notebook. Reuse its checked x and the stage-1 `X,w,b,targets`. Expect `x.shape == w.shape == (2,)`. The scalar oracle provides contributions [8,-3], weighted sum 5, and prediction 10.

### Starter code and steps

```python
if x.ndim != 1 or x.shape != w.shape:
    raise ValueError("x and w must share one vector shape")

contributions = x * w
weighted_sum = float(contributions.sum())
weighted_sum_at = float(x @ w)
prediction = weighted_sum + b

if not np.isfinite(contributions).all() or not np.isfinite(prediction):
    raise ValueError("vector prediction must be finite")
np.testing.assert_allclose(weighted_sum, weighted_sum_at)
print(contributions, weighted_sum, prediction)
```

### Expected intermediate results

`contributions` is [8.0,-3.0] with shape (2,). Both `weighted_sum` and `weighted_sum_at` are scalar 5.0. `prediction` is scalar 10.0, exactly matching stage 2.

### Observation prompt

`x*w` preserves the feature axis; `.sum()` removes that axis. `x@w` expresses the same contraction in one operation. Numerical equality proves the implementation paths agree, but the stage-1 schema is still required to prove column meaning.

### Common failures and repairs

If prediction is a length-two array, inspect an accidental `x*w+b`. If x has shape (1,2), the result container follows a different contract. Repair the source slice rather than squeezing unknown data indiscriminately.

### Reflection

Explain why “the program can calculate” is weaker than “formula, shape, and values agree.” Optional extension: print `contributions.dtype` and the Python type of prediction to distinguish ndarray, NumPy scalar, and Python scalar; it does not block batch prediction.

## Stage 4: Extend to Batch Prediction {#studio-batch-prediction}

### Stage goal

Apply one parameter set to two sample rows while preserving the contract “one row, one prediction.” Keep both vectorized output and a row-wise oracle so that adding samples cannot silently rewrite existing forward results.

### Prior inputs

Complete stage 3 in the same notebook and retain checked `X,w,b,targets` plus the single-row result. The shape contract is (n,d)@(d,)->(n,); here n=2 and d=2. The two occurrences of 2 have different meanings: sample count versus feature count.

### Starter code and steps

```python
if X.shape[1] != w.shape[0]:
    raise ValueError("X feature count must equal w length")

weighted_batch = X @ w
predictions = weighted_batch + b
if predictions.shape != targets.shape:
    raise ValueError("predictions and targets must share shape")
if not np.isfinite(predictions).all():
    raise ValueError("predictions must be finite")

loop_predictions = []
for row in X:
    if row.ndim != 1 or row.shape != w.shape:
        raise ValueError("each row must share w shape")
    row_prediction = float(b)
    for index in range(w.size):
        row_prediction += row[index] * w[index]
    if not np.isfinite(row_prediction):
        raise ValueError("loop prediction must be finite")
    loop_predictions.append(row_prediction)
loop_predictions = np.asarray(loop_predictions, dtype=float)
if loop_predictions.shape != predictions.shape or not np.isfinite(loop_predictions).all():
    raise ValueError("loop predictions must match finite vectorized predictions")
np.testing.assert_allclose(predictions, loop_predictions)
print(weighted_batch, predictions)
```

### Expected intermediate results

`weighted_batch = [5.0, 0.0]` and `predictions = [10.0, 5.0]`, both with shape (2,). The first item reproduces earlier stages; the second is `1*4 + 4*(-1) + 5 = 5`.

### Observation prompt

Matrix multiplication removes the feature axis and preserves the sample axis. Scalar bias is reused only after each dot product. Loop/vector equality compares independent execution routes, not duplicate prints of one expression.

### Common failures and repairs

A (2,2) result often means w became (2,1) and then crossed another vector through broadcasting. If the first item is not 10, expand row 0. If outputs reverse, inspect whether row IDs moved together.

### Reflection

Why does a third row not require changing w, while a third column does? Optional extension: append [3,2], keep old predictions unchanged, and expect new prediction 15.

## Stage 5: Compare Errors and Rebuild MSE {#studio-error-comparison}

### Stage goal

Introduce targets only after prediction and preserve residuals, squared errors, and their mean as separate layers. If the final scalar is surprising, this lets you walk upstream without allowing positive and negative residuals to cancel too early.

### Prior inputs

Complete stage 4 in the same notebook. Keep its `predictions = [10.0, 5.0]` and stage-1 `targets = [9.0, 7.0]`. Both must be finite, nonempty one-dimensional arrays with identical shape.

### Starter code and steps

```python
if predictions.ndim != 1 or targets.ndim != 1:
    raise ValueError("predictions and targets must be vectors")
if predictions.size == 0 or predictions.shape != targets.shape:
    raise ValueError("prediction and target shapes must match and be nonempty")

residuals = predictions - targets
squared_errors = residuals ** 2
MSE = float(np.mean(squared_errors))
if not np.isfinite(MSE):
    raise ValueError("MSE must be finite")
print(residuals, squared_errors, MSE)
```

### Expected intermediate results

`residuals = [1.0, -2.0]`, `squared_errors = [1.0, 4.0]`, and `MSE = 2.5`. The second sample contributes 4 and the first contributes 1; averaging yields a scalar measured in squared minutes.

### Observation prompt

Targets first appear here. Squaring each residual before averaging retains each sample distance. Averaging residuals first and then squaring gives 0.25 because signs cancel. MSE cannot reveal which row had the larger error, so diagnosis keeps both arrays.

### Common failures and repairs

Do not accept target shape (2,1): subtraction with predictions (2,) creates a cross-residual matrix. Reject shape mismatch before subtraction. MSE 1.5 often squares -2 incorrectly; MSE 5 often forgets division by sample count.

### Reflection

What information is lost when only 2.5 is saved? Write the backward inspection order MSE → squared errors → residuals → predictions. Optional extension: targets [8,8] produce MSE 6.5; it does not alter the sensitivity stage.

## Stage 6: Estimate Numerical Sensitivity {#studio-numerical-sensitivity}

### Stage goal

Estimate local loss sensitivity to `w_1,w_2,b` with central differences. Every perturbation starts from the same parameter copy. This stage reads local behavior near the current point and performs no parameter update: numerical differentiation is not gradient descent.

### Prior inputs

Complete stage 5 in the same notebook and reuse `X,targets,w,b` plus the MSE definition. Choose h=1e-4. Expected values are dL/dw1=0, dL/dw2=-5, and dL/db=-1. h, center, left/right probe points, denominator, and function results must all be finite; h must be positive.

### Starter code and steps

```python
def mse_for(candidate_w, candidate_b):
    candidate_predictions = X @ candidate_w + candidate_b
    return float(np.mean((candidate_predictions - targets) ** 2))

def central_difference_safe(fn, theta, h=1e-4):
    if not np.isfinite(theta) or not np.isfinite(h) or h <= 0:
        raise ValueError("theta and positive h must be finite")
    left_theta = theta - h
    right_theta = theta + h
    denominator = 2 * h
    if not np.isfinite(left_theta) or not np.isfinite(right_theta) or not np.isfinite(denominator):
        raise ValueError("perturbation points and denominator must be finite")
    left = float(fn(left_theta))
    right = float(fn(right_theta))
    if not np.isfinite(left) or not np.isfinite(right):
        raise ValueError("difference results must be finite")
    result = (right - left) / denominator
    if not np.isfinite(result):
        raise ValueError("central difference must be finite")
    return result

gradient_w = []
for j in range(w.size):
    def loss_for_weight(candidate, j=j):
        candidate_w = w.copy()
        candidate_w[j] = candidate
        return mse_for(candidate_w, b)
    gradient_w.append(central_difference_safe(loss_for_weight, w[j], h=1e-4))
gradient_b = central_difference_safe(lambda candidate: mse_for(w, candidate), b, h=1e-4)
print(gradient_w, gradient_b)
```

### Expected intermediate results

The output is approximately `[0.0, -5.0] -1.0`, with tiny floating tails allowed. A negative sign says that a small move to the right currently trends toward lower loss; zero says only that this one first-order slice is locally flat.

### Observation prompt

`candidate_w = w.copy()` prevents one probe from changing the next. Try h=0.1 and h=0.0001: this quadratic example remains close, but it does not support a general claim that smaller h is always better.

### Common failures and repairs

Positive 5 suggests reversed subtraction; -10 suggests a missing factor 2; identical coordinates suggest a closure-index bug; drift across repeat runs suggests in-place mutation. Repair contracts before discussing precision.

### Reflection

Why does dL/dw2=-5 not promise that increasing the parameter by 1 always lowers loss by 5? Include all three qualifiers: current point, local, small change.

## Stage 7: Probability Preview (Not a Complete Probability Course) {#studio-probability-preview}

### Stage goal

Explicitly separate deterministic prediction from a random repeated experiment. This probability preview observes how finite coin-flip frequencies vary, using a fixed seed for reproducibility. It does not teach probability axioms, distribution derivations, estimation theory, or Monte Carlo systematically.

### Prior inputs

Complete stage 6 and retain deterministic predictions [10,5], MSE 2.5, and sensitivity records. Create separate random variables; do not inject them into `X,w,b,targets`. Use `n_values=[10,100,1000]` and theoretical reference 0.5.

### Starter code and steps

```python
rng = np.random.default_rng(2026)
n_values = [10, 100, 1000]
frequency_rows = []
for n in n_values:
    draws = rng.integers(0, 2, size=n)
    frequency = float(draws.mean())
    frequency_rows.append((n, frequency, frequency - 0.5))
print(frequency_rows)
```

Record seed, sample size, frequency, and deviation from 0.5. Then create a fresh generator with the same seed and verify the complete table again. Do not call one observed frequency a permanent fact.

### Expected intermediate results

The table has three finite rows and every frequency lies from 0 to 1. The same seed and NumPy version reproduce the sequence; another seed usually changes it. Larger samples often lie closer to 0.5, but one table does not prove monotonic improvement.

### Observation prompt

Fixed inputs and parameters determine one prediction. A random simulation additionally needs its generator and seed recorded. Reproducibility recreates one pseudorandom sequence; it does not remove randomness from the phenomenon. The later Monte Carlo lesson develops the probability ideas systematically.

### Common failures and repairs

If every run changes, check for a missing fixed generator. Reusing one generator for a second pass consumes the next part of the sequence; recreate the same seed for a repeat check. If frequency deviation is fed into MSE, split the dataflows immediately.

### Reflection

Which reproducibility problem does a fixed seed solve, and which probability questions does it leave unanswered? Optional extension: compare five seeds or make a static frequency table; neither blocks the core notebook.

## Stage 8: Failure Analysis and Minimal Repairs {#studio-failure-analysis}

### Stage goal

Reduce common “runs successfully but means the wrong thing” bugs to minimal counterexamples and diagnose them from upstream to downstream. The habit is input and shape first, then contributions, predictions, residuals, and only finally the aggregate.

### Prior inputs

Complete stage 7 and retain the correct snapshot: weighted sums [5,0], predictions [10,5], residuals [1,-2], squared errors [1,4], and MSE 2.5. Manufacture exactly one fault at a time and restore correct inputs before the next experiment.

### Starter code and steps

```python
target_column = targets[:, None]       # (2, 1)
cross_residuals = predictions - target_column
print(target_column.shape, cross_residuals.shape)  # (2, 1) -> (2, 2)

wrong_axis = (X * w).sum(axis=0)
right_axis = (X * w).sum(axis=1)
print(wrong_axis, right_axis)

try:
    bad_X = np.asarray([[2.0, np.nan]], dtype=float)
    if not np.isfinite(bad_X).all():
        raise ValueError("X must be finite")
except ValueError as error:
    print(type(error).__name__, str(error))
```

### Expected intermediate results

Target column (2,1) and predictions (2,) broadcast to cross residuals (2,2), not two aligned residuals. `wrong_axis = [12.0, -7.0]` sums columns, while `right_axis = [5.0, 0.0]` sums feature contributions for each row. Non-finite input is rejected before matrix multiplication.

### Observation prompt

Broadcasting is dangerous because it may raise no exception. Even correct shape may hide wrong meaning, such as swapping X columns without swapping w. Diagnostic logs therefore need axis names, shapes, first rows, per-column contributions, and finite status.

### Common failures and repairs

Do not use `squeeze()` as a universal repair; first decide whether the intended target is a vector or a multi-output matrix. Do not stop because final MSE happens to be close; different errors can cancel after aggregation. Change one variable per probe so the cause remains identifiable.

### Reflection

Write your shortest diagnostic path: input contract → contributions → dot product → prediction → residual → square → mean. Optional extension: swap sample rows and targets together and observe unchanged MSE.

## Stage 9: Evidence Review and Learning Reflection {#studio-reflection}

### Stage goal

Organize all nine stages into one explainable formula–code–behavior chain. State both the abilities now established and the material reserved for later. This guided studio connects the first five lessons; it is not the formal `project-math-to-code`.

### Prior inputs

Complete stage 8 in the same notebook and retain `predictions,targets,MSE,gradient_w,gradient_b`. Also keep the input/shape ledger, scalar contributions, vector dot product, residual table, probability preview table, and at least one symptom–cause–repair failure record.

### Starter code and steps

```python
evidence = {
    "predictions": predictions.tolist(),
    "targets": targets.tolist(),
    "mse": MSE,
    "gradient_w": [float(value) for value in gradient_w],
    "gradient_b": float(gradient_b),
}
print(evidence)
```

Explain in order: how `X,w,b` produce predictions; when targets enter; how MSE aggregates; which parameter a central difference changes and which values remain fixed; why the random simulation is separate from the core chain.

### Expected intermediate results

The review contains predictions [10.0,5.0], targets [9.0,7.0], MSE 2.5, weight sensitivities approximately [0.0,-5.0], and bias sensitivity approximately -1. Every number points back to one formula, one code variable, and one observable behavior.

### Observation prompt

If the final dictionary is visible but [1,-2] and [1,4] cannot be explained, pre-aggregation evidence is incomplete. If a negative sensitivity is explained without the word “local,” its scope is too broad. The probability table supports only a finite observation under a recorded seed.

### Common failures and repairs

A screenshot alone loses inputs, versions, and seed; keep runnable cells and environment notes. Success-only records hide safety boundaries; retain one shape or non-finite failure. Calling numerical sensitivity “training” is incorrect because no learning rate, iteration, or parameter assignment exists.

### Reflection

Answer in three paragraphs: Which intermediate value best exposes a formula-translation error? Which safety check best prevents a silent error? Which observation warns against extending a local conclusion too far?

Keep the route boundary explicit. Formal `project-math-to-code` comes only after Gradient Descent and Monte Carlo, once optimization and random-simulation foundations are complete. This guided studio only makes the first five lessons reproducible and does not occupy the formal project position. Optional extension: make a Markdown evidence table or add a third sample and rebuild the whole chain; neither changes the core result.
