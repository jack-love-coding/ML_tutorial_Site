# Chapter 3: Pandas Table Structures

Chapter ID: `pandas-structures`

## Core question

How do we preserve the names, types, and meanings of the bike-sharing fields?

## Learning goals

You will distinguish a Series from a DataFrame, inspect a table with `shape`, `columns`, `dtypes`, `info()`, and `describe()`, and use the data dictionary to decide which numbers are counts, continuous measurements, or category codes.

## Where this chapter begins

NumPy let us calculate efficiently with the `cnt` array, but it deliberately set aside the meanings of the other columns. pandas uses column labels and types to organize time, weather, calendar, and rider-composition data in one table again.

## Concept and intuition

A DataFrame is a two-dimensional table with a row index and column labels; selecting one column usually returns a Series. A field's storage type tells us how the computer stores its values, but not what those values mean in the domain. For example, `season` is an integer-coded category, so an “average season” is not meaningful simply because its dtype is integer. Likewise, `temp` is a normalized continuous variable and cannot be reported directly in degrees Celsius.

Different table inspections answer different questions: `head()` shows examples, `shape` shows scale, `columns` shows the schema, `dtypes` and `info()` show storage and non-null counts, and `describe()` summarizes numerical distributions. These views complement one another; none provides a complete understanding by itself.

## Step-by-step code

### 1. Parse the date explicitly while preserving the single `rides` table

<!-- cell: ch03-parse-date role: data -->
```python
rides = pd.read_csv(DATA_PATH).assign(
    dteday=lambda frame: pd.to_datetime(frame["dteday"], format="%Y-%m-%d")
)
rides.head(3)
```

`.assign()` returns a new DataFrame and changes `dteday` from text into a datetime value. The other 16 original fields keep their original names and values.

### 2. Inspect scale, index, and column order

<!-- cell: ch03-shape-columns role: compute -->
```python
table_structure = {
    "shape": rides.shape,
    "index_type": type(rides.index).__name__,
    "columns": rides.columns.tolist(),
}
table_structure
```

The column order comes from the Stage 1 schema. The row index is only a locator within the current table; the domain's unique record identifier is `instant`.

### 3. Compare a DataFrame with a Series

<!-- cell: ch03-series-dataframe role: compute -->
```python
count_series = rides["cnt"]
count_frame = rides[["cnt"]]

{
    "series_type": type(count_series).__name__,
    "series_shape": count_series.shape,
    "frame_type": type(count_frame).__name__,
    "frame_shape": count_frame.shape,
}
```

Selecting one column with a single pair of brackets returns a one-dimensional Series. Selecting with a list of column names preserves a two-dimensional DataFrame. Their shapes differ, and later APIs may return different kinds of values for each.

### 4. Inspect storage with dtype and non-null counts

<!-- cell: ch03-dtypes-info role: compute -->
```python
rides.info()
rides.dtypes.astype(str).to_dict()
```

The non-null counts from `info()` are a snapshot check, not a data-cleaning exercise. If missing values appear in a future dataset, use Data Lab to define a handling policy instead of silently deleting records in this course.

### 5. Describe fields by role

<!-- cell: ch03-field-roles role: interpret -->
```python
field_roles = {
    "identifier_time": ["instant", "dteday", "yr", "mnth", "hr", "weekday"],
    "calendar_category": ["season", "holiday", "workingday"],
    "weather_category": ["weathersit"],
    "normalized_continuous": ["temp", "atemp", "hum", "windspeed"],
    "count": ["casual", "registered", "cnt"],
}
field_roles
```

This role map comes from the data dictionary. It determines which columns can be averaged, which require readable labels, and which should be used only as identifiers or grouping keys.

### 6. Compare numerical summaries with `describe()`

<!-- cell: ch03-describe-counts role: compute -->
```python
rides[["casual", "registered", "cnt"]].describe(
    percentiles=[0.25, 0.5, 0.75]
)
```

We deliberately select only count fields, preventing the means of integer-coded categories such as `season` and `workingday` from being mistaken for meaningful measurements.

### 7. Check the rider-composition invariant

<!-- cell: ch03-schema-output role: compute output: dataset-shape-schema -->
```python
composition_matches = rides["cnt"].eq(
    rides["casual"] + rides["registered"]
)

dataset_shape_schema = {
    "rows": int(rides.shape[0]),
    "columns": int(rides.shape[1]),
    "column_order": rides.columns.tolist(),
    "dtypes": rides.dtypes.astype(str).to_dict(),
    "field_roles": field_roles,
    "all_counts_reconcile": bool(composition_matches.all()),
}
dataset_shape_schema
```

## Runtime result and how to read it

<!-- result-presentation: dataset-shape-schema -->
### Runtime result

Table structure, field roles, and rider-composition check

### Accessibility description

A structured table lists, in order, the bike-sharing dataset's row and column dimensions, ordered fields, principal dtypes, field roles, and whether `cnt = casual + registered` holds for every record. Read the field names and roles first, then inspect the rider-composition relationship.

### Axis and legend labels

[]

### Analysis finding

This result brings together “how the data is stored” and “what each field represents.” The table dimensions and column order identify the loaded object; dtypes describe storage; field roles determine which columns later serve as grouping keys, continuous measurements, or counts; and the rider-composition check confirms that the total rental count agrees with the two rider-type counts.

### Keep in mind

Passing the structural and rider-composition checks does not make every analysis method appropriate. An integer dtype does not turn a category code into a continuous measurement, and a normalized field cannot be interpreted in its original unit without consulting the data dictionary.

### Static summary

If the structured table is temporarily unavailable, keep the same reading order: confirm dimensions and field order, identify each field's role with the data dictionary, then check whether `cnt` always equals `casual` plus `registered`. Exact dimensions come from the current runtime result and are not duplicated in the prose.

## Analysis findings

- Observation: the table contains time fields, categories, normalized continuous values, and counts.
- Runtime result: the schema table records storage structure alongside roles from the data dictionary.
- Interpretation: field roles determine suitable filters, aggregations, and charts; dtype alone cannot replace meaning.
- Limitation: a valid schema and invariant show that structure and composition are consistent, not that every analytical convention is sound.

## Keep in mind

Do not interpret `weathersit=4` as “twice the weather” of `weathersit=2`, and do not report `temp=0.5` as 0.5 degrees Celsius. Category codes represent labeled levels. Normalized fields require the data dictionary before they can be converted to original units.

## Reading check

To compare rental counts for registered and casual riders, choose `registered` and `casual` because they are count fields. To compare seasons, use `season` as a grouping key and map it to labels rather than calculating its average.

## Next step

The next chapter preserves these field meanings while using filters, `groupby()`, named aggregation, and `pivot_table()` to compare hours and working-day states.
