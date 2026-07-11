# Lesson 3: Matrices and Batch Computation

## 1. Opening: Why Not Repeat the Dot Product? {#matrices-opening}

Two samples could be predicted by copying the same dot-product code twice, but duplication hides the shared structure. Stack rows into `X = [[2, 3], [1, 4]]`; rows are samples and columns are features. The opening prediction asks which axis is preserved by `X @ w`, why adding a row should not change existing rows, and how a program can run while its batch semantics are wrong. The lesson uses a complete shape ledger, a transparent nested-loop baseline, and a vectorized implementation. A separate grid-mirror example explains a transformation matrix without confusing it with the data matrix X. Exercises remain formative and not graded.

## 2. Recap: Dot Products and Reading Rows and Columns {#matrices-recap}

Recall that one row x has shape (2,), w has shape (2,), and w^T x is scalar. A matrix is not merely a nested list: its two axes have named roles. In this course X uses rows for samples and columns for features. Reading row i holds the sample fixed while reading column j follows one feature across samples. Bias b is scalar and broadcasts to each sample prediction; target y is now a length-n vector used after prediction. The vector result [10,5] should reproduce each independently checked scalar calculation.

## 3. Shared Task: The Xw+b Shape Ledger {#matrices-shared-task}

The shared shape ledger is `X: (2,2)`, `w: (2,)`, `X @ w: (2,)`, scalar `b`, `y_hat: (2,)`, and `y: (2,)`. In compact form `y_hat = Xw+b`. The contraction is `(Xw)_i = sum_j X_ij w_j`: feature axis j disappears after pairing with w, while sample axis i remains. For the first row, 4*2-1*3+5=10; for the second, 4*1-1*4+5=5. Targets [9,7] produce residuals [1,-2], squares [1,4], and MSE 2.5.

## 4. Intuition: Tables, Pipelines, and Image Grids {#matrices-intuition}

Think of X as a labeled table passing through one shared prediction pipeline. Each row follows the same coefficient rule; vectorization changes execution expression, not the mathematics. Adding one row adds one output. Adding or reordering a feature column requires the corresponding w entry to be added or reordered. A matrix used as a geometric transformation plays a different role: its columns say where basis directions land. Always determine a matrix role from provenance, axes, formula position, and output shape rather than from the fact that it is two-dimensional.

## 5. Formal Contract: Rows, Columns, Multiplication, and Broadcasting {#matrices-formal}

For $X\in\mathbb R^{n\times d}$ and $w\in\mathbb R^d$, $Xw\in\mathbb R^n$, with $(Xw)_i=\sum_jX_{ij}w_j$. n counts samples and d features; n=d=2 is accidental. Scalar b is added after each dot product, and MSE is $L=(1/n)\sum_i(\hat y_i-y_i)^2$.

### Deeper 1: Inner dimensions, bias, and the loss axis

For this batch, (2,2) @ (2,) -> (2,). The general contract is (n,d)@(d,)->(n,). Adding a sample makes (3,2)@(2,)->(3,), while adding a feature requires both X and w to grow. Bias broadcasts after the dot product. The wrong (X+b)@w makes first row [7,8]@[4,-1]=20 because it adds b*sum(w), not b. Residuals [1,-2] square to [1,4], then average across samples to 2.5; preserve per-sample squares for diagnosis.

### Deeper 2: Row/column semantic audit table

Row 1 contributions 8 and -3 give dot 5, prediction 10, target 9, square 1. Row 2 contributions 4 and -4 give dot 0, prediction 5, target 7, square 4. If row 1 no longer reproduces the vector lesson, inspect migration and column order; correct dot but wrong prediction points to bias; correct prediction but wrong loss points to target alignment or square/mean order. Total contribution sum and dot-product sum are both 5 as an auxiliary checksum. Sample IDs must move with X and y.

## 6. Example One: Expand the Whole Batch with Shapes {#matrices-worked-shared}

Worked batch prediction expands all shapes and values. X rows [2,3] and [1,4] pair with w=[4,-1]. The contribution matrix is [[8,-3],[4,-4]] with shape (2,2). Reducing across axis 1 yields weighted sums [5,0] with shape (2,). Adding scalar b=5 yields predictions [10,5]. Comparing with targets [9,7] gives residuals [1,-2], squared errors [1,4], and MSE 2.5. A row-by-row loop must reproduce the same values. If it returns only one scalar, the sample axis was collapsed; if it returns a 2x2 array, reduction or broadcasting is wrong.

## 7. Example Two: A Linear Mirror of Grid Points {#matrices-worked-auxiliary}

The independent geometry example mirrors grid points with `A = [[1, 0], [0, -1]]`. As a column-vector transform it maps (u,v) to (u,-v), so the concrete evidence is `[2, 3] -> [2, -3]`. With several points stored as rows, the equivalent batch convention is `P @ A.T`. The four corners [[1,1],[-1,1],[-1,-1],[1,-1]] become [[1,-1],[-1,-1],[-1,1],[1,1]], a reflection across the horizontal axis. A encodes a coordinate transform, whereas X encodes sample rows. A's columns describe transformed basis vectors; X's columns describe feature fields. The declared row/column convention prevents a silent switch between PA^T and AP.

## 8. Code Translation: Vectorize but Keep a Row Oracle {#matrices-code}

The executable vectorized path creates X=[[2,3],[1,4]], w=[4,-1], b=5, y=[9,7], asserts X.ndim==2, w.ndim==1 and X.shape[1]==w.shape[0], then computes weighted=X@w, y_hat=weighted+b, residuals=y_hat-y, and L=mean(residuals**2). It prints [5,0], [10,5], and 2.5. X*w exposes contributions; summing axis=0 is wrong because it crosses rows.

### Loop baseline and shape symptoms

The loop baseline iterates rows outside and paired features inside, asserts x.shape==w.shape, accumulates weighted_sum, adds b, and requires allclose(loop_predictions,y_hat). Inner-dimension errors check X.shape[1]==w.shape[0]; residual (2,2) checks y_hat.shape==y.shape; swapped values require sample IDs and targets to move together; correct shape but first result not 10 requires expanded first-row contributions. Shape is necessary, while column semantics is separate necessary evidence.

## 9. Controlled Experiment: Add or Reorder One Row {#matrices-experiment}

Controlled experiment: append only row [3,2]. X changes (2,2)->(3,2), the new dot is 12-2=10 and prediction 15, while old predictions remain [10,5]. Separately swap the first two rows: output becomes [5,10]. Swapping columns without w makes first prediction 15 despite valid shape.

### Experiment extension: Why row and column operations differ

A row permutation applied to X, y, and sample IDs only reorders predictions and squared errors, so MSE stays fixed; moving X alone mispairs supervision. A column permutation must also move w entries and names. A new row reuses the schema, but a new column needs a feature and coefficient. In notation P(Xw+b) describes row permutation, while (XQ)(Q^Tw)=Xw describes a shared column permutation. Report which axis changed, which companion arrays moved, and which outputs stayed fixed or merely reordered.

## 10. Misconceptions: Executable Is Not Necessarily Correct {#matrices-misconceptions}

### Before misconceptions: Explain the two reductions with indices

In $(Xw)_i=\sum_jX_{ij}w_j$, i stays fixed and j traverses features, preserving one output per sample. Only later does MSE sum over i. A premature sample-axis reduction destroys predictions and target alignment. Vectorization delegates execution but does not change this index contract.

### Boundary of the image-grid example

Rows of P use PA^T; column vectors use AP. Declare the convention. A's columns move basis vectors and map (u,v)->(u,-v); X's rows are samples. Role depends on provenance, formula position, and output shape.

### Binary strategy for batch debugging

Compare loop and vectorized results to locate the first mismatched row, then print only that row's names, values, weights, and contributions. Uniform proportional errors suggest bias or units; column-specific errors suggest cleaning/order; correct prediction but wrong loss suggests target alignment. Log shapes, finite counts, first rows, anomaly index, and contributions rather than dumping a huge matrix.

### Reading checkpoint

A new row does not change w; a new column must. Row swaps move targets; column swaps move weights. Because MSE reduces the sample axis, scalar 2.5 cannot recover [1,4]; early aggregation loses diagnostic information.

### Misconception 1: The two 2s in a square matrix mean the same thing

One 2 counts samples and the other features. Repair notation to (n_samples,n_features).

### Misconception 2: If transpose still runs, it is still correct

Square transpose keeps shape but turns feature collections into rows; X.T@w no longer predicts per sample. Check axis meaning and the first row.

### Misconception 3: Square the average residual to get MSE

Correct residual->square->mean gives 2.5; mean residual then square gives 0.25 through cancellation. Preserve all three intermediate arrays.

## 11. Three-Layer Practice: Shapes and Batch Observation {#matrices-practice}

These exercises are formative and not formally assessed.

### Layer one: concept distinctions

Exercise 1A What shape results from (5,2) @ (2,)?

Hint: Preserve the outer sample dimension.

Reference reasoning: The output is (5,), one scalar dot product per sample. [Review](#matrices-formal)

Exercise 1B Why must target not be placed inside X?

Hint: The target is unknown when deploying on a new sample.

Reference reasoning: X contains only features available at prediction time; y is supervisory feedback used afterward to calculate error. [Review](#matrices-shared-task)

Exercise 1C How do the roles of the sample matrix X and the mirror matrix differ?

Hint: State the meaning of rows and the matrix's position in multiplication.

Reference reasoning: Rows of sample matrix X are samples; the mirror matrix is a coordinate transform. Equal shape does not imply equal semantics. [Review](#matrices-intuition)

### Layer two: hand calculation and code reading

Exercise 2A Calculate the prediction for third row [3,2].

Hint: Use 3*4 + 2*(-1) + 5.

Reference reasoning: The dot product is 10 and prediction 15. [Review](#matrices-experiment)

Exercise 2B What does np.sum(X*w, axis=0) represent?

Hint: axis=0 reduces across rows.

Reference reasoning: It sums each feature's contributions across all samples, not one prediction per sample; the required reduction is axis 1. [Review](#matrices-code)

Exercise 2C Calculate the MSE of predictions [10,5] against targets [8,8].

Hint: First obtain residuals [2,-3].

Reference reasoning: Squares are [4,9] and their mean is 6.5. [Review](#matrices-worked-shared)

### Layer three: open observation

Exercise 3A Randomly permute rows and verify that predictions undergo the same permutation.

Hint: Save the original indices.

Reference reasoning: Row rules are independent, so permutation changes only order. Changed values suggest an accidental reduction across the sample axis. [Review](#matrices-experiment)

Exercise 3B Feed the mirror matrix four corners and draw the before/after grid.

Hint: Verify point by point that the horizontal coordinate stays fixed.

Reference reasoning: The vertical sign reverses, so the grid flips across the horizontal axis; a static table provides the same evidence. [Review](#matrices-worked-auxiliary)

Exercise 3C Design a batch shape-debug checklist.

Hint: Cover ndim, sample count, feature count, target length, and finite values.

Reference reasoning: Assert X.ndim=2 and w.ndim=1; compare X.shape[1] with w.shape[0] and X.shape[0] with y.shape[0]; then check finite values and output (n,). [Review](#matrices-code)

## 12. Summary and Derivative Handoff {#matrices-handoff}

The matrix lesson hands the derivative lesson a verified batch: X=[[2,3],[1,4]], w=[4,-1], b=5, predictions=[10,5], targets=[9,7], residuals=[1,-2], and MSE=2.5. Every array has an explicit role and shape. The derivative lesson will hold X and targets fixed, treat the scalar batch loss as a function of one probed parameter at a time, and estimate local sensitivity. It must not confuse estimating a derivative with taking a gradient-descent update. Preserve the loop oracle, exact finite checks, and the requirement that targets reorder with samples.
