# Chapter 2: NumPy Arrays and Vectorized Statistics

Chapter ID: `numpy-foundations`

## Core question

How do shape, indexing, and vectorized operations help us understand a demand column?

## Learning goals

You will convert the `cnt` column into a one-dimensional NumPy array, interpret its `dtype`, `shape`, and `ndim`, select values with positions, slices, and Boolean masks, and use vectorized statistics to describe the observed hourly demand.

## Where this chapter begins

Chapter 1 created `rides` from the single local snapshot. This chapter does not read the data again. It focuses on one column with a clear meaning: `cnt` is the total number of rentals in each hourly record.

## Concept and intuition

A NumPy array organizes values of one data type into a particular shape. The `shape` of a one-dimensional array is `(number of records,)`, not a two-dimensional “records by one column” table. `ndim` tells us how many axes exist. The axis used for indexing or aggregation determines which shape the result retains.

Vectorization expresses an operation as a rule applied directly to an array. `demand[demand >= 500]` states the selection condition clearly without a handwritten loop or a temporary list. It mirrors the analysis intent and reduces indexing and accumulator errors.

## Step-by-step code

### 1. Turn a named column into a one-dimensional array

<!-- cell: ch02-demand-array role: data -->
```python
demand = rides["cnt"].to_numpy()
{
    "dtype": str(demand.dtype),
    "shape": demand.shape,
    "ndim": demand.ndim,
    "size": demand.size,
}
```

`dtype` describes how the elements are stored; `shape` gives the length of each axis; and `size` is the total number of elements. The name `demand` preserves the meaning of `cnt`, avoiding a conversion of the entire DataFrame into a matrix with no column labels.

### 2. Positional indexing and slicing

<!-- cell: ch02-index-slice role: compute -->
```python
first_value = demand[0]
first_six_values = demand[:6]
last_value = demand[-1]

first_value, first_six_values, last_value
```

An integer index returns a scalar, while a slice returns another array. Consequently, `demand[0].shape` does not exist, whereas `demand[:6].shape` is `(6,)`.

### 3. Keep matching records with a Boolean mask

<!-- cell: ch02-boolean-mask role: compute -->
```python
high_demand_mask = demand >= 500
high_demand = demand[high_demand_mask]

{
    "mask_shape": high_demand_mask.shape,
    "selected_shape": high_demand.shape,
    "selected_count": int(high_demand_mask.sum()),
}
```

The mask has the same shape as the original array, with one `True` or `False` at each position. The selected result remains one-dimensional, but its length is determined by the number of records that meet the condition.

### 4. Describe the observed data with vectorized statistics

<!-- cell: ch02-vectorized-summary role: compute -->
```python
demand_summary = {
    "minimum": int(demand.min()),
    "maximum": int(demand.max()),
    "mean": float(demand.mean()),
    "median": float(np.median(demand)),
    "p25": float(np.percentile(demand, 25)),
    "p75": float(np.percentile(demand, 75)),
    "population_std": float(demand.std(ddof=0)),
}
demand_summary
```

The mean summarizes the distribution's balance point, while the median is less affected by extreme values. The quartiles describe the range of the middle half of the records, and the standard deviation describes spread around the mean. This course uses `ddof=0` when describing the complete snapshot. `ddof=1` belongs to a different sample-estimation convention, and inferential statistics are outside this chapter's scope.

### 5. Use a small matrix to understand `axis`

<!-- cell: ch02-axis-demo role: compute -->
```python
axis_demo = np.array([
    [10, 20, 30],
    [40, 50, 60],
])

{
    "shape": axis_demo.shape,
    "sum_axis_0": axis_demo.sum(axis=0).tolist(),
    "sum_axis_1": axis_demo.sum(axis=1).tolist(),
}
```

`axis=0` collapses the row axis and leaves one result for each column. `axis=1` collapses the column axis and leaves one result for each row. This small matrix exists only to clarify shape; it does not replace a pandas table that preserves field meanings.

### 6. Compare vectorized expressions

<!-- cell: ch02-vectorization-check role: interpret -->
```python
vectorized_count = int((demand >= 500).sum())
same_result = vectorized_count == len(high_demand)
same_result
```

One Boolean expression provides both the basis for selection and the basis for counting. We verify that two vectorized expressions give the same result instead of maintaining a separate loop implementation.

## Runtime result and how to read it

This chapter does not bind an authoritative runtime result, and it does not copy current statistics into the prose. Stage 3 execution preserves the cells' actual results. When reading any array result, confirm the variable's meaning first, then inspect its `shape` and statistical convention; do not focus on the mean alone.

## Analysis findings

- Observation: `cnt` is a non-negative count for each hourly record.
- Runtime result: `demand_summary` presents range, center, and spread together without manually copied values.
- Interpretation: quartiles and standard deviation show why a single “typical value” cannot fully represent the demand distribution.
- Limitation: a one-dimensional array contains no time, weather, or rider-category context, so it cannot explain why demand changes.

## Keep in mind

Confusing `shape`, `size`, and `ndim` leads to indexing errors. Converting categorical codes into a numeric matrix and averaging them can create results with no valid meaning. NumPy is well suited to same-type numerical computation, but pandas and the data dictionary must preserve field names and category meanings.

<!-- exercise: shape-index -->
<!-- teaching-prompt: id=shape-index kind=shape-index chapter=numpy-foundations scored=false submitted=false persistedToProgress=false gatesChapter=false -->
## Think about it

Suppose `window = demand[24:48]` and `mask = window >= 500`. Without running the code, determine in order what controls the dimensionality and shape of `window`, `mask`, and `window[mask]`.

### Reference reasoning

`demand` is a one-dimensional array, and slicing does not introduce a new axis, so `window.shape` is `(24,)`. The comparison runs element by element, which makes `mask` the same shape as `window`: `(24,)`. Boolean selection keeps the elements whose mask values are `True`, so `window[mask]` is still one-dimensional and has shape `(k,)`. The number `k` depends on how many elements meet the condition and may range from 0 to 24.

### Common misconceptions

“One column must be two-dimensional” confuses a table column with an array dimension. “Slicing does not change shape” confuses the number of dimensions with an axis length. “Masking preserves the original length” confuses the condition array with the selected result.

### Review

Review “Positional indexing and slicing” and “Keep matching records with a Boolean mask.” Compare the roles of `shape`, dimensionality, and the number of elements left after selection.

## Next step

The next chapter returns to pandas. Series, DataFrames, column labels, and the data dictionary restore the meanings of time, categories, weather, and rider composition, then produce the first authoritative schema result.
