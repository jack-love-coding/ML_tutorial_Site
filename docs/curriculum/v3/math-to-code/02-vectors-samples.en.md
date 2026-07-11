# Lesson 2: Vectors and Sample Representation

## 1. Opening: How Can Two Values Represent One Sample? {#vectors-opening}

The previous lesson treated `x = [2, 3]` as an ordered list: two base tasks and three hint requests. This lesson asks why those values may be handled as one sample vector, what changes when their order changes, and why `[4, -1] * [2, 3]` is not yet a prediction. A representation contract fixes the meaning of every position, the dimension, the pairing rule, and the required scalar output. In the prediction task, `w` is not another geometric sample. It is a unit-bearing linear functional: 4 minutes/base task and -1 minute/hint request. We reserve Euclidean length, angle, and projection for a separate dimensionless geometry example. Before calculating, predict the unit of `w^T x` and explain which values are data and which are model parameters. The exercises are formative, not graded.

## 2. Recap: Ordered Lists, Coordinates, and Squared Error {#vectors-recap}

Three prior ideas are enough. Lists are ordered, so index 0 remains base-task count and index 1 remains hint-request count. A coordinate pair can be drawn as an arrow, but the drawing does not change its data meaning. Error is computed only after prediction: $L=(\hat y-y)^2$, so $\hat y=10$ and $y=9$ give $L=1$. Also separate scalars from vectors: 5, 9, and 10 are scalars, while [2,3] and [4,-1] have shape (2,). Shape counts positions; a Euclidean norm is a different quantity and only has a direct geometric interpretation when coordinate units and scales are compatible.

## 3. Shared Task: A Vector Binds One Sample’s Features {#vectors-shared-task}

The shared vocabulary is fixed: `x = [2, 3]` is one sample with shape (2,), `w = [4, -1]` is a coefficient rule with shape (2,), `b = 5` is a scalar bias, `y_hat = 10` is the predicted duration, `y = 9` is the observed target, and `L = 1` is squared error. The compact contract is `y_hat = w^T x + b`. Here $w$ is a **unit-bearing linear functional**, not a geometric arrow: $w_1$ has minutes/base-task units and $w_2$ has minutes/hint-request units. Pairing and summing produce minutes. Target $y$ never enters the forward calculation; it appears only in the later comparison.

## 4. Intuition: Coefficients Convert Features into Minutes {#vectors-intuition}

Read $w$ as a conversion rule. The first coordinate converts 2 base tasks through 4 minutes/base task into +8 minutes. The second converts 3 hint requests through -1 minute/request into -3 minutes. Compatible minute contributions can be summed to 5, and bias adds another 5. Thus the main-line map is $x\mapsto w^T x$, a vector-to-scalar linear functional. The affine prediction adds $b$. Increasing only $x_1$ by one changes the weighted contribution by +4 minutes; increasing only $x_2$ by one changes it by -1 minute. These signed effects require no angle story. Bias is added after aggregation and is not a hidden feature contribution.

## 5. Formal Contract: Dimension, Linear Functionals, and Units {#vectors-formal}

For $x,w\in\mathbb R^d$, $w^T x=\sum_{j=1}^d w_jx_j\in\mathbb R$. Both inputs need the same dimension; [2,3,1] and [4,-1] are an invalid contract and must not be truncated or padded silently. With fixed $w$, $f_w(x)=w^Tx$ preserves addition and scalar multiplication; adding $b$ makes the map affine.

### Deeper 1: Order, units, and two dot-product readings

Coordinate order is an interface. A common permutation preserves value: [4,-1]^T[2,3]=[-1,4]^T[3,2]=5, but permuting only x gives 10. Scaling 2 individual tasks to 0.2 groups of ten requires changing 4 minutes/task to 40 minutes/group, preserving contribution 8. The same dot product can be audited as paired contributions or as (1,2)@(2,1)->(1,1); scalar 5 and [[5]] are different return interfaces.

### Deeper 2: Code shape and transparent baseline

NumPy shapes (2,), (1,2), and (2,1) expose different contracts. The checked loop rejects unequal dimensions, prints each index/feature/weight/contribution, returns 5 from 8 and -3, and independently checks @. Finite-value checks reject NaN or Infinity before prediction and loss become uninterpretable.

## 6. Example One: Dot Product, Prediction, and Error {#vectors-worked-shared}

Worked example one expands every contribution: `w^T x = 4*2 + (-1)*3 = 5`; then `y_hat = 5 + 5 = 10`; finally `L = (10 - 9)^2 = 1`. The contribution ledger records feature 2, weight 4, contribution 8; feature 3, weight -1, contribution -3; total 5. The elementwise result [8,-3] still has shape (2,), so it cannot be the promised scalar prediction. Summing changes the shape contract to a scalar, bias preserves it, and target is revealed only afterward. This staged calculation localizes order, sign, reduction, bias, and target-leakage bugs.

## 7. Example Two: Projection in a Dimensionless Geometry {#vectors-worked-auxiliary}

Worked example two is deliberately independent and dimensionless. On a same-scale grid let `u = [3, 4]` and `v = [4, 0]`. Then $\|u\|=5$, $\|v\|=4$, $u^Tv=12$, and $\operatorname{proj}_v(u)=(12/16)[4,0]=[3,0]$. The remainder [0,4] is orthogonal to v, and cosine is 0.6. Length, angle, and projection are meaningful because both coordinates share compatible dimensionless units and scale. This auxiliary geometry must never be used to claim that the prediction coefficients w—with minutes-per-feature units—form an ordinary spatial arrow.

## 8. Code Translation: Preserve Shapes and Contributions {#vectors-code}

The checked implementation creates finite NumPy arrays `x = np.array([2.0, 3.0])` and `w = np.array([4.0, -1.0])`, asserts `x.shape == w.shape == (2,)`, computes `contributions = w * x`, `weighted_sum = w @ x`, `y_hat = weighted_sum + b`, and `L = (y_hat - y) ** 2`. Expected outputs are [8,-3], 5.0, 10.0, and 1.0. The transparent loop and NumPy route should agree. Explicitly reject mismatched dimensions and non-finite inputs; Python `zip` alone is unsafe because it silently truncates the longer sequence. Geometry variables remain u and v and never replace x and w.

## 9. Controlled Experiment: Change Contribution Coefficients {#vectors-experiment}

Controlled experiment: hold x=[2,3], b=5, and y=9 fixed. Compare w=[4,-1], [8,-2], [-4,1], and [3,-1]. Their dot products are 5, 10, -5, and 3; predictions are 10, 15, 0, and 8; squared errors are 1, 36, 81, and 1. A larger coefficient or prediction is not automatically better.

### Experiment records, variable isolation, and formative feedback

Every run records changed factor, fixed factors, dot product, prediction, target, and loss. For 2w: only w doubles; x,b,y stay fixed; dot product 5->10, prediction 10->15, loss 1->36. Prediction 20 reveals an incorrectly doubled bias; -10 after sign reversal reveals lost +5 bias; unchanged dot product after changing w1 reveals the wrong index. In separate probes x1 2->3 raises prediction by 4, while x2 3->4 lowers it by 1. Do not change both together or infer causality. Contribution bars require labels and a numeric table; colour is not sole evidence and bars do not make w geometric.

## 10. Misconceptions: Plausible Vector Errors {#vectors-misconceptions}

Before the diagnoses, reconstruct the coordinate schema, both shapes, expanded dot product, and scalar output. Minimal counterexamples separate shape from meaning and restore units to every contribution.

### Misconception 1: Dimension is vector length

Everyday “length” is ambiguous. In the independent geometry u=[3,4] has dimension 2 and norm 5; main-task features have unlike units. Repair with separate dimension/shape and norm/magnitude ledger entries.

### Misconception 2: Elementwise product is the dot product

w*x gives [8,-3], whereas w@x gives scalar 5. A vector where a scalar is required is the symptom. Print contributions, explicitly sum, and inspect output shape.

### Misconception 3: Prediction coefficients are a geometric direction

Dot products also occur in projection, which hides unit conditions. Main w coordinates produce minute contributions; only dimensionless same-scale u,v support norm, angle, and projection. Keep w_jx_j, w^Tx, and bias separate from the geometry example.

## 11. Three-Layer Practice: Representation to Observation {#vectors-practice}

These exercises provide formative feedback and no formal assessment.

### Layer one: concept distinctions

Exercise 1A Do [3,2] and [2,3] represent the same level?

Hint: Recall the feature meaning assigned to each position.

Reference reasoning: Usually not. The former swaps base tasks and hint requests; unless the column schema and weight order are rewritten together, the dot-product semantics change. [Review](#vectors-shared-task)

Exercise 1B Does the same dimension guarantee that two vectors can be compared directly?

Hint: Shape is not the only contract; inspect meaning and units.

Reference reasoning: No. Two two-dimensional vectors with different coordinate meanings or units can be multiplied mechanically while the result has no useful meaning. [Review](#vectors-formal)

Exercise 1C On a dimensionless, same-scale geometric grid, does a dot product of zero imply that at least one displacement is zero?

Hint: Consider nonzero u=[1,0] and v=[0,2] on the same grid.

Reference reasoning: No. Two nonzero orthogonal displacements can have zero dot product. This is the independent u,v geometry example, not the unit-bearing prediction functional. [Review](#vectors-worked-auxiliary)

### Layer two: hand calculation and code reading

Exercise 2A Calculate [2,3] dot [3,-1], the prediction, and the loss.

Hint: Keep b=5 and y=9.

Reference reasoning: The dot product is 6-3=3, prediction is 8, residual is -1, and L=1. [Review](#vectors-worked-shared)

Exercise 2B What value and shape does w*x+b produce?

Hint: Adding a scalar acts on every array entry.

Reference reasoning: It produces [13,2] with shape (2,), not a scalar prediction; bias was added to each contribution before the missing reduction. [Review](#vectors-code)

Exercise 2C On a dimensionless same-scale grid, project u=[2,0] onto v=[1,1].

Hint: The denominator is v^Tv=2.

Reference reasoning: The coefficient is 2/2=1, the projection is [1,1], and remainder [1,-1] is orthogonal to v. [Review](#vectors-worked-auxiliary)

### Layer three: open observation

Exercise 3A Hold x,b,y fixed; multiply w by 0.5, 1, and 2 and record dot product, prediction, and loss.

Hint: Scaling weights does not scale bias.

Reference reasoning: The dot product scales linearly, the affine prediction does not scale by the same ratio because bias does not scale, and loss still depends on the target. [Review](#vectors-experiment)

Exercise 3B Change the first feature unit from individual tasks to groups of ten and determine how its coefficient compensates.

Hint: The feature changes from 2 to 0.2, divided by 10; its coefficient changes from 4 to 40, multiplied by 10.

Reference reasoning: 0.2 groups times 40 minutes/group remains 8 minutes. This is a unit conversion and needs no geometric-length interpretation. [Review](#vectors-formal)

Exercise 3C Design a debug log that locates order mismatch and missing reduction.

Hint: Record semantic labels, shape, per-coordinate contributions, and the scalar output.

Reference reasoning: Print (name,value,weight,contribution) rows, then contribution shape, weighted sum, and prediction. Mislabelled pairing and a nonscalar output become separate symptoms. [Review](#vectors-code)

## 12. Summary and Matrix Handoff {#vectors-handoff}

The lesson leaves a stable matrix handoff. One sample is an ordered vector; w is a unit-bearing linear functional; only dimensionless same-scale u and v support the geometry example. The shared calculation remains `w^T x = 4*2 + (-1)*3 = 5`, `y_hat = 10`, and `L = 1`. The next lesson stacks samples into `X = [[2, 3], [1, 4]]` with shape (2,2), keeps `w = [4, -1]` and `b = 5`, and expects predictions [10,5] for targets [9,7]. Adding a third row must not alter earlier forward results. Carry forward the feature-order ledger, shape checks, finite checks, and the rule that target enters only after prediction.
