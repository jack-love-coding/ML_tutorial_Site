# Lesson 5: Implementing the Mathematics with NumPy

## 1. Opening: How Can One Line Silently Be Wrong? {#numpy-opening}

A one-line NumPy expression can execute and still compute the wrong object. Broadcasting, accidental transposes, integer dtype, mutation, or non-finite values may all produce legal arrays with invalid lesson semantics. This lesson turns the previous mathematics into a safe numerical contract: values, roles, shapes, dtypes, axes, finite checks, expected outputs, and failure messages are all observable. The shared batch must reproduce predictions [10,5], MSE 2.5, and central-difference sensitivities [0,-5,-1]. A separate sensor-grid example practices axis debugging. Exercises are formative and not graded.

## 2. Recap: Scalar-to-Batch Contracts {#numpy-recap}

The scalar, vector, matrix, and derivative contracts now join one pipeline. x has shape (d,), X has shape (n,d), w has shape (d,), predictions and targets have shape (n,), and MSE is scalar. `*` is elementwise, `@` contracts the shared feature axis, and a scalar bias broadcasts across samples. Target comparison happens after prediction. Central difference calls the loss with copied perturbed parameters and returns sensitivity, not an updated model. NumPy should make these contracts shorter to express, never less explicit to verify.

## 3. Shared Task: Map Every Code Variable to Mathematics {#numpy-shared-task}

Names map one-to-one to mathematics: `X` is the sample matrix, `w` is the coefficient vector, `b` is scalar bias, `predictions = X @ w + b`, `residuals = predictions - targets`, `squared_errors = residuals ** 2`, and `MSE = squared_errors.mean()`. With X=[[2,3],[1,4]], w=[4,-1], b=5, and targets=[9,7], the expected values are weighted sums [5,0], predictions [10,5], residuals [1,-2], squares [1,4], and MSE 2.5. Every name preserves the course vocabulary rather than hiding several stages in an anonymous expression.

## 4. Intuition: Shape as a Data-Flow Type {#numpy-intuition}

Treat shape as a runtime type description. It tells how many axes exist and what each axis is expected to mean. Shape alone is necessary but insufficient: a (2,2) transpose can keep the same dimensions while swapping semantic roles, and two (2,) arrays can refer to samples versus features. Therefore checks pair shapes with an axis ledger and known-value oracles. Intermediate arrays are not clutter: they make contribution, reduction, broadcasting, residual alignment, and failure localization visible. Compactness is earned only after equivalence has been demonstrated.

## 5. Formal Contract: Arrays, Broadcasting, and Axes {#numpy-formal}

An ndarray has dtype, ndim, shape, and elements. Use floating arrays so later decimal updates cannot be rejected or truncated. @ aligns inner dimensions; * follows broadcasting. For X*w, (2,2) and (2,) align on the trailing feature axis and produce contributions (2,2); only sum(axis=1) gives one dot product per sample. Broadcasting is mechanical: predictions (2,) minus mistaken y (2,1) creates four cross residuals (2,2), so loss requires exact shape equality.

### Deeper 1: dtype, axis names, and broadcasting semantics

Convert with np.asarray(...,dtype=float) and check np.isfinite. Axis 0 is samples and axis 1 features. Saying “sum axis 1” means eliminate feature contributions and keep one value per sample, which generalizes to (batch,time,features). The dataflow is X(samples=2,features=2)*w(features=2)->contributions(samples=2,features=2)->sum features->weighted(samples=2). Before broadcasting ask which mechanical axis expands and whether the quantity should be shared. Repeating one w across samples and one scalar b across predictions matches the model; adding an (n,) sample-specific bias is a different model even if it runs. Never reshape merely to silence an exception without stating semantic target shape.

## 6. Example One: Reproduce Every Task 1 Output {#numpy-worked-shared}

Worked example one reproduces Task 1 exactly. After validation, `weighted_sums = X @ w` gives [5.0,0.0], `predictions = weighted_sums + b` gives `predictions = [10.0, 5.0]`, residuals are [1.0,-2.0], squared errors are [1.0,4.0], and `MSE = 2.5`. A checked nested-loop oracle computes the same values. The derivative wrapper copies w for each perturbation and obtains approximately [0.0,-5.0] with bias sensitivity -1.0. Assertions use tolerances for finite differences, but exact shapes and finite status remain non-negotiable.

## 7. Example Two: Debug a Sensor Grid by Shape {#numpy-worked-auxiliary}

The independent shape-debugging example uses a two-row, three-column sensor grid and one calibration value per column:

```python
sensor_grid = np.array([
    [10.0, 20.0, 30.0],
    [40.0, 50.0, 60.0],
])
column_bias = np.array([1.0, 2.0, 3.0])
print(sensor_grid.shape)  # (2, 3)

wrong_column_bias = column_bias[:, None]  # shape (3, 1)
wrong = sensor_grid[0] + wrong_column_bias
print(wrong.shape)  # (3, 3), legal broadcasting but not the target

fixed_column_bias = column_bias            # shape (3,)
fixed = sensor_grid + fixed_column_bias
print(fixed)
# [[11. 22. 33.]
#  [41. 52. 63.]]
```

The task is to add calibrations [1,2,3] to every row, so (2,3)+(3,)->(2,3): trailing axes align and one column bias vector is reused across the two rows. Artificially changing it to `wrong_column_bias` with shape (3,1) and adding it to one row of shape (3,) broadcasts to (3,3), creating an outer-addition grid. The diagnostic evidence is the actual shape, not merely that numbers were returned. The repair follows the declared column-calibration contract (3,), rather than applying an unexplained squeeze. NumPy prints the real ndarray output without commas and puts the second row on a new line, as shown.

## 8. Implementation: Validation, Vectorization, and Pure Differences {#numpy-code}

This is the lesson's single complete copyable reference implementation. BEGIN/END markers make the contract independently auditable.

```python
# MATH_TO_CODE_REFERENCE_BEGIN
import numpy as np

def _matrix(X):
    X = np.asarray(X, dtype=float).copy()
    if X.ndim != 2 or X.shape[0] == 0 or X.shape[1] == 0:
        raise ValueError("X must be a nonempty 2D matrix")
    if not np.isfinite(X).all():
        raise ValueError("X must contain only finite values")
    return X

def _vector(values, name):
    values = np.asarray(values, dtype=float).copy()
    if values.ndim != 1 or values.size == 0:
        raise ValueError(f"{name} must be a nonempty 1D vector")
    if not np.isfinite(values).all():
        raise ValueError(f"{name} must contain only finite values")
    return values

def _scalar(value, name):
    value = np.asarray(value, dtype=float).copy()
    if value.ndim != 0:
        raise ValueError(f"{name} must be a scalar")
    result = float(value)
    if not np.isfinite(result):
        raise ValueError(f"{name} must be finite")
    return result

def predict_batch(X, w, b):
    X = np.asarray(X, dtype=float).copy()
    w = np.asarray(w, dtype=float).copy()
    if X.ndim != 2 or X.shape[0] == 0 or X.shape[1] == 0:
        raise ValueError("X must be a nonempty 2D matrix")
    if w.ndim != 1 or w.size == 0:
        raise ValueError("w must be a nonempty 1D vector")
    if X.shape[1] != w.shape[0]:
        raise ValueError("X feature count must equal w length")
    if not np.isfinite(X).all() or not np.isfinite(w).all():
        raise ValueError("X and w must contain only finite values")
    b = _scalar(b, "b")
    if not np.isfinite(b):
        raise ValueError("b must be finite")
    result = X @ w + b
    if not np.isfinite(result).all():
        raise ValueError("predictions must be finite")
    return result

def mse_loss(predictions, targets):
    predictions = np.asarray(predictions, dtype=float).copy()
    targets = np.asarray(targets, dtype=float).copy()
    if predictions.ndim != 1 or targets.ndim != 1:
        raise ValueError("predictions and targets must be 1D")
    if predictions.size == 0 or targets.size == 0:
        raise ValueError("predictions and targets must be nonempty")
    if predictions.shape != targets.shape:
        raise ValueError("prediction and target shapes must match")
    if not np.isfinite(predictions).all() or not np.isfinite(targets).all():
        raise ValueError("predictions and targets must be finite")
    result = float(np.mean((predictions - targets) ** 2))
    if not np.isfinite(result):
        raise ValueError("MSE must be finite")
    return result

def central_difference(fn, theta, h=1e-4):
    theta = _scalar(theta, "theta")
    h = _scalar(h, "h")
    if not np.isfinite(theta) or not np.isfinite(h) or h <= 0:
        raise ValueError("theta and positive h must be finite")
    left_theta = theta - h
    right_theta = theta + h
    denominator = 2 * h
    if (
        not np.isfinite(left_theta)
        or not np.isfinite(right_theta)
        or not np.isfinite(denominator)
    ):
        raise ValueError("difference inputs and denominator must be finite")
    left = _scalar(fn(left_theta), "left function result")
    right = _scalar(fn(right_theta), "right function result")
    if not np.isfinite(left) or not np.isfinite(right):
        raise ValueError("left and right function results must be finite")
    result = (right - left) / denominator
    if not np.isfinite(result):
        raise ValueError("central difference must be finite")
    return result

def evaluate(X, y, w, b, h=1e-4):
    normalized_X = _matrix(X)
    normalized_y = _vector(y, "y")
    normalized_w = _vector(w, "w")
    normalized_b = _scalar(b, "b")
    normalized_h = _scalar(h, "h")
    if normalized_X.shape[1] != normalized_w.shape[0]:
        raise ValueError("X feature count must equal w length")
    if normalized_X.shape[0] != normalized_y.shape[0]:
        raise ValueError("X row count must equal y length")
    if normalized_h <= 0:
        raise ValueError("h must be positive")

    predictions = predict_batch(normalized_X, normalized_w, normalized_b)
    L = mse_loss(predictions, normalized_y)
    gradient_w = np.empty_like(normalized_w, dtype=float)
    for j in range(normalized_w.size):
        def loss_for(candidate, j=j):
            candidate_w = normalized_w.copy()
            candidate_w[j] = candidate
            candidate_predictions = predict_batch(
                normalized_X, candidate_w, normalized_b
            )
            return mse_loss(candidate_predictions, normalized_y)
        gradient_w[j] = central_difference(
            loss_for, normalized_w[j], normalized_h
        )
    gradient_b = central_difference(
        lambda candidate: mse_loss(
            predict_batch(normalized_X, normalized_w, candidate), normalized_y
        ),
        normalized_b,
        normalized_h,
    )
    if not np.isfinite(gradient_w).all() or not np.isfinite(gradient_b):
        raise ValueError("gradient must be finite")
    return predictions, L, gradient_w, gradient_b
# MATH_TO_CODE_REFERENCE_END
```

Inputs first pass through `np.asarray(..., dtype=float).copy()`, which accepts lists and integer arrays while breaking mutable aliases. Exact ndim, nonempty, shape, and finite-value checks follow. No `zip` can silently truncate extra features, and results are checked before return. `evaluate` passes normalized copies onward and makes a new candidate copy for every parameter probe. It returns [10,5], 2.5, [0,-5], and -1 without changing caller inputs.

### Complete evaluation and regression check

```python
w_before = w.copy()
predictions, L, gradient_w, gradient_b = evaluate(X, y, w, b)
np.testing.assert_allclose(predictions, [10., 5.])
np.testing.assert_allclose(L, 2.5)
np.testing.assert_allclose(gradient_w, [0., -5.], atol=1e-6)
np.testing.assert_allclose(gradient_b, -1., atol=1e-6)
np.testing.assert_array_equal(w, w_before)
```

`allclose` permits finite-difference tail error; `array_equal` requires parameters to remain exactly unchanged. Failure tests also cover mismatched features, empty targets, NaN, Infinity, target shape (2,1), and nonpositive h. Error messages should report expected and actual shapes.

## 9. Controlled Experiment: Loop and Vectorized Outputs Must Match {#numpy-experiment}

Controlled experiment compares a transparent nested-loop implementation with `X @ w + b` while holding all inputs fixed. First compare values and shape on the two-row baseline; then add a third row and compare again. The vectorized route may be more compact or faster, but output equality is the success criterion. Formative feedback asks for both results, an `allclose` assertion, named shapes, and a description of what changed in execution versus what stayed mathematically identical. Timing, if measured, uses repeated runs and is secondary to correctness.

## 10. Misconceptions: NumPy’s Legal Errors {#numpy-misconceptions}

Start with a backward diagnostic procedure. If final MSE is not 2.5, inspect residuals [1,-2]; if those differ, inspect predictions [10,5]; then weighted sums [5,0]; then the contribution matrix. Move exactly one layer upstream at a time to locate the smallest transformation that first diverges. Also check arrays are finite, inputs were not modified, and repeat calls return the same values. Candidate parameters use copies; public constants remain read-only. Comments should explain intent: `sum(axis=1)  # sum feature contributions, keep one value per sample` preserves axis semantics better than “# sum.” Integer dtype, views, and NaN are additional guardrails, not replacements for the approved diagnoses below.

### Misconception 1: No error means the shape is correct

Broadcasting searches for a legal operation, so (2,)-(2,1) produces cross residuals (2,2). Exact prediction-target shape assertion before loss is the repair.

### Misconception 2: Vectorization means deleting all intermediate values

A one-line expression can look professional while hiding an axis error. During development preserve contribution matrix, weighted sum, prediction, residual, and squared error, then encapsulate only after the chain is stable. Shorter code is not automatically clearer.

### Misconception 3: Numerical derivatives may modify w in place

Changing one index in place seems convenient, but an unrestored theta+h state means theta-h no longer starts at the same center and repeated calls differ. Every candidate uses w.copy(); compare before and after with array_equal and require unchanged input.

## 11. Three-Layer Practice: Read, Calculate, and Debug Shapes {#numpy-practice}

These exercises are formative and not formally assessed.

### Layer one: concept distinctions

Exercise 1A Can shape (2,) alone tell whether an array is a feature vector or predictions?

Hint: Consider axis semantics.

Reference reasoning: No. Combine variable role, formula, and production step. Shape is necessary evidence but not complete semantics. [Review](#numpy-intuition)

Exercise 1B Why is X*w not a batch prediction?

Hint: Count the axes that remain in the output.

Reference reasoning: It preserves both sample and feature axes and only creates a contribution table; sum across the feature axis and add bias. [Review](#numpy-formal)

Exercise 1C Does a vectorized result still need a hand-check of individual samples?

Hint: Independent evidence can find an error shared by the implementation.

Reference reasoning: Yes. Verify at least one or two rows so formula and program do not rely on the same code to prove itself. [Review](#numpy-worked-shared)

### Layer two: code reading and debugging

Exercise 2A In the sensor example, predict the shape of sensor_grid[0] + column_bias[:, None].

Hint: Compare (3,) with (3,1) from their trailing axes.

Reference reasoning: The result is (3,3). The 1D row behaves as (1,3), and (3,1) expands the other axis, creating an outer-addition grid rather than one calibrated row. [Review](#numpy-worked-auxiliary)

Exercise 2B Find the error in np.mean(predictions-y)**2.

Hint: Does squaring happen before or after averaging?

Reference reasoning: It averages residuals before squaring, allowing positive and negative errors to cancel. Use np.mean((predictions-y)**2). [Review](#numpy-worked-shared)

Exercise 2C Design the expected behavior for h=0.

Hint: Inspect the denominator and input contract.

Reference reasoning: Raise a clear ValueError before calculation instead of producing division-by-zero Infinity or NaN. [Review](#numpy-code)

### Layer three: open observation

Exercise 3A Compare loop and vectorized results for 2 and 1000 repeated samples.

Hint: Compare values before timing.

Reference reasoning: Numerical values must agree. Performance depends on environment, and faster execution cannot replace correctness evidence. [Review](#numpy-experiment)

Exercise 3B Construct targets with shape (2,1) and record the incorrect broadcast table.

Hint: Label which two indices produced every cell.

Reference reasoning: Four cross combinations appear; strict shape check must reject them before loss calculation. [Review](#numpy-misconceptions)

Exercise 3C Write a minimal regression check that reproduces Task 1.

Hint: Lock prediction, MSE, gradient, and parameter unchanged behavior.

Reference reasoning: Assert predictions [10,5], MSE 2.5, gradient approximately [0,-5,-1], and unchanged w,b before adding invalid-shape and non-finite failures. [Review](#numpy-code)

## 12. Summary and Studio Handoff {#numpy-handoff}

This lesson hands a reproducible artifact to the guided studio: checked float arrays, exact axis semantics, predictions [10,5], targets [9,7], residuals [1,-2], MSE 2.5, numerical sensitivities [0,-5,-1], loop/vectorized equivalence, and real ValueError examples for bad shapes and non-finite input. The studio can now assemble these stages without changing vocabulary or hiding intermediate values. Formal Project 1 still follows Gradient Descent and Monte Carlo; this pilot handoff remains local formative practice and creates no new evidence-persistence path.
