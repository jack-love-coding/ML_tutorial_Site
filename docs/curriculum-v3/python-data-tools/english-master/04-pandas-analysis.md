# Chapter 4: Pandas Grouped Analysis

Chapter ID: `pandas-analysis`

## Core question

How can we compare demand by time, working-day status, and weather?

## Learning goals

You will break a broad question into selection conditions, grouping keys, and aggregation metrics. Using `groupby()`, `agg()`, named aggregation, and `pivot_table()`, you will create interpretable comparison tables that always report each group's sample count.

## Where this chapter begins

Chapter 3 established that `hr`, `workingday`, `season`, and `weathersit` carry grouping meanings, while `cnt`, `casual`, and `registered` are counts. We now move beyond whole-column summaries to ask how demand varies across conditions.

## Concept and intuition

Grouped analysis has three steps: select which records participate in the comparison, define which records belong to the same group, and choose what to calculate for each group. The order must be explicit. Mean hourly demand, total rentals per group, and the number of records per group answer different questions. If a result omits its aggregation convention, readers cannot tell whether a difference comes from demand or simply from group size.

`groupby()` is well suited to producing a long table, while `pivot_table()` can spread one grouping dimension into columns that are easier to compare. Both should derive from the same explicit aggregation table instead of maintaining two independent calculations.

## Step-by-step code

### 1. Add readable labels while preserving the original codes

<!-- cell: ch04-readable-labels role: data -->
```python
season_labels = {1: "春季", 2: "夏季", 3: "秋季", 4: "冬季"}
weather_labels = {
    1: "晴或少云",
    2: "薄雾或多云",
    3: "小雨雪或雷暴",
    4: "强降水或恶劣天气",
}
workingday_labels = {0: "周末或节假日", 1: "工作日"}

analysis_rides = rides.assign(
    season_label=lambda frame: frame["season"].map(season_labels),
    weather_label=lambda frame: frame["weathersit"].map(weather_labels),
    workingday_label=lambda frame: frame["workingday"].map(workingday_labels),
)
```

`analysis_rides` adds labels for display, while `rides` and its original codes remain unchanged. Labels support reading; codes remain available for stable sorting.

### 2. Filter first, then state the unit of observation

<!-- cell: ch04-filter-daytime role: compute -->
```python
daytime = analysis_rides.loc[
    analysis_rides["hr"].between(6, 22),
    ["dteday", "hr", "workingday", "workingday_label", "cnt"],
]

{
    "rows": len(daytime),
    "hour_min": int(daytime["hr"].min()),
    "hour_max": int(daytime["hr"].max()),
}
```

After filtering, each row still represents one hour on one date. Filtering before aggregation means that the result describes only hours 6–22, and that condition must be reported with the result.

### 3. Preserve sample count and aggregation convention with named aggregation

<!-- cell: ch04-workingday-groups role: compute output: workingday-comparison -->
```python
workingday_hourly = (
    analysis_rides
    .groupby(["workingday", "workingday_label", "hr"], as_index=False)
    .agg(
        observations=("cnt", "size"),
        mean_rentals=("cnt", "mean"),
        median_rentals=("cnt", "median"),
        total_rentals=("cnt", "sum"),
    )
    .sort_values(["workingday", "hr"])
)
workingday_hourly.head()
```

`observations` is the number of hourly records in each “working-day status × hour” group. `mean_rentals` is the average number of rentals per hourly record in that group. `total_rentals` also changes with the sample count, so it cannot be interpreted interchangeably with the mean.

### 4. Build the overall hourly table

<!-- cell: ch04-hourly-demand role: compute -->
```python
hourly_demand = (
    analysis_rides
    .groupby("hr", as_index=False)
    .agg(
        observations=("cnt", "size"),
        mean_rentals=("cnt", "mean"),
        median_rentals=("cnt", "median"),
    )
    .sort_values("hr")
)
hourly_demand.head()
```

Correct time charts require sorting. If hour values are sorted as ordinary strings, they may appear in the incorrect order 1, 10, 11, …, 2.

### 5. Form comparable columns with a pivot

<!-- cell: ch04-workingday-pivot role: compute -->
```python
workingday_pivot = workingday_hourly.pivot(
    index="hr",
    columns="workingday_label",
    values="mean_rentals",
).sort_index()
workingday_pivot.head()
```

The pivot changes only the display shape; it does not alter how `mean_rentals` was calculated. The index remains hour, and the two columns represent the two working-day states.

### 6. Compare season and weather while reporting group size

<!-- cell: ch04-season-weather role: compute -->
```python
season_weather_summary = (
    analysis_rides
    .groupby(["season", "season_label", "weathersit", "weather_label"], as_index=False)
    .agg(
        observations=("cnt", "size"),
        mean_rentals=("cnt", "mean"),
        median_rentals=("cnt", "median"),
    )
    .sort_values(["season", "weathersit"])
)
season_weather_summary
```

Combinations with few records require cautious interpretation. Extreme weather categories may have far fewer observations than common weather, so comparing mean values alone is not enough.

### 7. Build the rider-composition table

<!-- cell: ch04-rider-mix role: compute -->
```python
rider_mix = (
    analysis_rides[["casual", "registered", "cnt"]]
    .sum()
    .rename_axis("rider_type")
    .reset_index(name="rentals")
)
rider_mix
```

`cnt` is the sum of the first two rider types, not a third rider category. When Chapter 5 draws this result, the total will serve as a check or annotation rather than being incorrectly stacked with the two components.

## Runtime result and how to read it

<!-- result-presentation: workingday-comparison -->
### Runtime result

Hourly demand comparison for working and non-working days

### Accessibility description

A comparison table sorted by working-day status and hour. Each row provides the working-day code and Chinese label, hour, sample count, mean rentals per hour, median rentals, and total rentals. Hold the hour constant first, then compare the two working-day states.

### Axis and legend labels

[]

### Analysis finding

This result places working-day and non-working-day records for the same hour side by side. `observations` shows how many hourly records support each mean and median. The mean describes demand per hourly record, while the total is affected by both demand level and the number of records.

### Keep in mind

Hourly grouping describes an association between working-day status and the demand pattern without jointly controlling for season, weather, or year. It cannot establish that working-day status caused the difference. When sample counts differ, total rentals also cannot substitute for a comparison of mean hourly demand.

### Static summary

If the comparison table is temporarily unavailable, retain this three-step reading: confirm that the grouping keys are `workingday × hr`, inspect `observations` for each group, then compare means and medians at the same hour. Exact values come from the current runtime result and are not duplicated in the prose.

## Analysis findings

- Observation: demand can be organized into comparable groups by hour and working-day status.
- Runtime result: `workingday_hourly` records the sample count and three aggregation values for every group.
- Interpretation: differences in means at the same hour describe an association between working-day status and the demand pattern.
- Limitation: this grouped comparison does not control for season, weather, or year and cannot prove that working-day status causes the difference.

## Keep in mind

“Aggregate the full table and then filter hours” may answer a different question from “filter records and then aggregate.” Omitting `hr` as a grouping key collapses an entire day into two numbers. Looking only at `total_rentals` may mistake a larger number of records for higher hourly demand.

<!-- exercise: filter-groupby -->
<!-- teaching-prompt: id=filter-groupby kind=filter-groupby chapter=pandas-analysis scored=false submitted=false persistedToProgress=false gatesChapter=false -->
## Think about it

To answer “Do working and non-working days have different mean rental counts at each hour?”, which grouping keys should you select, which aggregation should be applied to which field, and what additional value should you retain to judge whether the comparison has enough observations?

### Reference reasoning

The question compares working-day status and hour simultaneously, so the grouping keys should be `workingday` and `hr`. The target is mean rentals per hour, so calculate `mean` for `cnt`. Also retain `size` as `observations`, making the number of hourly records behind each mean visible. Each row then represents “one hour under one working-day state.”

### Common misconceptions

Common errors include aggregating before filtering, omitting `hr` from the grouping keys, treating the result variable `cnt` as a grouping key, and confusing totals, means, and sample counts.

### Review

Review “Filter first, then state the unit of observation” and “Preserve sample count and aggregation convention with named aggregation.” Recheck which question each of filtering, grouping, and aggregation answers.

## Next step

The next chapter turns `hourly_demand`, `workingday_hourly`, and `rider_mix` into honest static charts, then diagnoses how axes and visual encodings can mislead.
