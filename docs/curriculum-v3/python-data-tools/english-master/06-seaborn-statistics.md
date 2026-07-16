# Chapter 6: Distributions, Relationships, and Correlation with Seaborn

Chapter ID: `seaborn-statistics`

## Core question

What does co-variation show, and what can it not show?

## Learning goals

You will use Seaborn to compare conditional distributions and numeric relationships. You will interpret co-variation through descriptive statistics, covariance, and Pearson correlation, then check how missing values, sample size, and outliers affect an interpretation. You will also explicitly reject causal conclusions drawn from correlation alone.

## Connection to the previous chapter

Chapter 5 addressed how to present an aggregated result honestly. This chapter looks more closely at record distributions and relationships between two numeric variables, while retaining the field meanings and sample basis established in Chapters 3 and 4.

## Concepts and intuition

Seaborn accepts pandas data in long form and maps semantics such as `x`, `y`, and `hue` to a Matplotlib Axes. Box plots or violin plots compare conditional distributions, scatterplots show how two numeric variables vary together, and heatmaps encode a matrix.

Descriptive statistics summarize only the data that was observed. The sign of covariance indicates the direction of joint variation, but its magnitude depends on variable scale. Pearson's correlation coefficient standardizes scale to a range from -1 to 1 and describes the direction and strength of a linear association. It is sensitive to nonlinear relationships, outliers, and sample selection, and correlation does not imply causation.

## Step-by-step code

### 1. Prepare ordered labels for distribution charts

<!-- cell: ch06-distribution-data role: data -->
```python
distribution_data = analysis_rides.loc[
    :, ["season", "season_label", "weathersit", "weather_label", "cnt"]
].copy()

season_order = ["春季", "夏季", "秋季", "冬季"]
weather_order = ["晴或少云", "薄雾或多云", "小雨雪或雷暴", "强降水或恶劣天气"]
```

An explicit order prevents a chart from sorting categories arbitrarily as strings. The original codes remain available so that the mapping can be verified.

### 2. Read each distribution together with its group size

<!-- cell: ch06-season-boxplot role: visualize output: season-weather-distribution -->
```python
season_counts = (
    distribution_data
    .groupby(["season", "season_label"], as_index=False)
    .agg(observations=("cnt", "size"))
    .sort_values("season")
)

fig, (season_ax, weather_ax) = plt.subplots(1, 2, figsize=(14, 5))
sns.boxplot(
    data=distribution_data,
    x="season_label",
    y="cnt",
    order=season_order,
    color="#93c5fd",
    ax=season_ax,
)
season_ax.set(
    title="按季节比较需求分布",
    xlabel="季节",
    ylabel="每小时租车次数",
)

sns.boxplot(
    data=distribution_data,
    x="weather_label",
    y="cnt",
    order=weather_order,
    color="#99f6e4",
    ax=weather_ax,
)
weather_ax.set(
    title="按天气比较需求分布",
    xlabel="天气状况",
    ylabel="每小时租车次数",
)
weather_ax.tick_params(axis="x", rotation=25)
fig.tight_layout()

season_counts
```

Boxes, whiskers, and outliers show distribution structure; they are not a “prediction interval.” The sample-count table must be read alongside the figure. This course does not use the chart to introduce confidence intervals or significance testing.

<!-- result-presentation: season-weather-distribution -->
### Result title

Hourly demand distributions by season and weather

### Accessibility description

A two-panel box plot compares hourly bike-rental demand distributions across four seasons and across weather conditions. The left panel orders spring, summer, autumn, and winter; the right panel follows the weather categories. Each box shows the median, interquartile range, whiskers, and outliers, while an accompanying table provides each group's sample size.

### Chinese labels and English meanings

- `left-title`: chart text “按季节比较需求分布” → “Compare demand distributions by season”
- `left-x-axis`: chart text “季节” → “Season”
- `left-y-axis`: chart text “每小时租车次数” → “Rentals per hour”
- `right-title`: chart text “按天气比较需求分布” → “Compare demand distributions by weather”
- `right-x-axis`: chart text “天气状况” → “Weather condition”
- `right-y-axis`: chart text “每小时租车次数” → “Rentals per hour”
- `categories`: Chinese season and weather labels in the chart → “Spring,” “Summer,” “Autumn,” “Winter,” “Clear or partly cloudy,” “Mist or cloudy,” “Light rain/snow or thunderstorm,” and “Heavy precipitation or severe weather”; the accompanying table lists group sizes.

### What the chart shows

Box positions and heights compare each group's center and middle half, while whiskers and outliers indicate tail structure. Always read the figure with the group sizes. Even a visually prominent box requires cautious language when its sample basis is small.

### What to keep in mind

The box plots describe observed conditional distributions. They are not prediction intervals and do not provide a significance judgment. Season, weather, year, and date type may change together, so differences between groups cannot be written as proof that one condition caused demand to change.

### Fallback summary

If the image is temporarily unavailable, preserve the comparison frame: in a fixed order, compare medians, interquartile ranges, whiskers, outliers, and group sizes for the seasons and weather categories. Read precise differences from the loaded analysis result and its accompanying table.

### 3. Calculate descriptive statistics instead of reading only the chart

<!-- cell: ch06-descriptive-summary role: compute -->
```python
distribution_summary = (
    distribution_data
    .groupby(["weathersit", "weather_label"], as_index=False)
    .agg(
        observations=("cnt", "size"),
        mean_rentals=("cnt", "mean"),
        median_rentals=("cnt", "median"),
        q25=("cnt", lambda values: values.quantile(0.25)),
        q75=("cnt", lambda values: values.quantile(0.75)),
    )
    .sort_values("weathersit")
)
distribution_summary
```

A difference between mean and median can signal skew or the influence of extreme values, while the quartiles describe the middle half of the records. A weather group with very few observations requires cautious interpretation even if its mean stands out.

### 4. Use a scatterplot to inspect joint variation

<!-- cell: ch06-temperature-scatter role: visualize -->
```python
fig, ax = plt.subplots(figsize=(8, 5))
sns.scatterplot(
    data=analysis_rides,
    x="temp",
    y="cnt",
    hue="workingday_label",
    style="workingday_label",
    alpha=0.35,
    ax=ax,
)
ax.set(
    title="归一化气温与每小时需求",
    xlabel="归一化气温（摄氏气温 / 41）",
    ylabel="每小时租车次数",
)
fig.tight_layout()
```

Transparency reduces point overlap, while shapes and legend text keep grouping from relying on color alone. The point cloud can reveal relationship shape and outlier positions, but it cannot provide a causal explanation by itself.

### 5. Distinguish covariance from Pearson correlation

<!-- cell: ch06-covariance-correlation role: compute -->
```python
relationship_pair = analysis_rides[["temp", "cnt"]]

covariance = float(relationship_pair.cov().loc["temp", "cnt"])
pearson_r = float(relationship_pair.corr(method="pearson").loc["temp", "cnt"])

{"covariance": covariance, "pearson_r": pearson_r}
```

A positive covariance means that the two columns tend to vary in the same direction, but its magnitude changes with the units. Pearson's formula is

\[
r = \frac{\operatorname{cov}(X,Y)}{s_X s_Y}
\]

where \(X\) and \(Y\) are two numeric variables, \(\operatorname{cov}\) is covariance, and \(s_X\) and \(s_Y\) are their standard deviations. A value of \(r\) near 1 or -1 indicates only a strong linear association; it does not prove that one variable causes the other.

### 6. Select correlation fields explicitly

<!-- cell: ch06-correlation-matrix role: compute output: pearson-correlation-matrix -->
```python
correlation_columns = [
    "temp", "atemp", "hum", "windspeed", "casual", "registered", "cnt"
]
correlation_matrix = analysis_rides[correlation_columns].corr(method="pearson")
correlation_matrix
```

`season`, `weathersit`, and `workingday` are not inserted mechanically. Their integer values primarily represent categories rather than evenly spaced continuous measurements.

<!-- result-presentation: pearson-correlation-matrix -->
### Result title

Pearson correlation matrix for seven numeric fields

### Accessibility description

A symmetric table whose rows and columns follow `temp`, `atemp`, `hum`, `windspeed`, `casual`, `registered`, and `cnt`. Each intersecting cell gives the Pearson correlation coefficient for a pair of fields, the main diagonal is 1, and the presentation also provides valid sample counts and a reminder that correlation does not imply causation.

### Chinese labels and English meanings

[]

### What the table shows

The matrix checks the direction and strength of linear co-variation among several explicitly selected numeric fields at once. Read one row-column pair at a time, then interpret its sign and magnitude together with the scatterplot shape and valid sample count. Symmetric positions repeat the same variable pair; they are not two independent findings.

### What to keep in mind

Pearson correlation describes linear association only and is sensitive to outliers, nonlinear relationships, missingness patterns, and sample selection. Category codes are excluded. The coefficient is neither a regression slope nor proof that one variable causes another. This course does not calculate or interpret confidence intervals, significance tests, or p-values.

### Fallback summary

If the structured table is temporarily unavailable, preserve these facts: the matrix covers only seven explicitly selected numeric fields, coefficients range from -1 to 1, and the diagonal is 1. Every coefficient must be read with the scatterplot, valid sample size, and the limitation that correlation does not imply causation.

### 7. Draw a heatmap with a color scale centered at zero

<!-- cell: ch06-correlation-heatmap role: visualize -->
```python
fig, ax = plt.subplots(figsize=(8, 6))
sns.heatmap(
    correlation_matrix,
    vmin=-1,
    vmax=1,
    center=0,
    cmap="vlag",
    annot=True,
    fmt=".2f",
    square=True,
    ax=ax,
)
ax.set_title("显式数值字段的 Pearson 相关矩阵")
fig.tight_layout()
```

Fixing the range from -1 to 1 and centering it at zero makes the colors for positive and negative correlations comparable. Numeric annotations provide information beyond color.

### 8. Check missingness, sample size, and outlier influence

<!-- cell: ch06-interpretation-effects role: limit -->
```python
interpretation_checks = {
    "pairwise_non_missing": analysis_rides[correlation_columns].notna().sum().to_dict(),
    "group_sizes": distribution_summary.set_index("weather_label")["observations"].to_dict(),
    "largest_cnt_rows": analysis_rides.nlargest(5, "cnt")[
        ["dteday", "hr", "workingday_label", "temp", "cnt"]
    ].to_dict(orient="records"),
}
interpretation_checks
```

The current snapshot has passed contract validation, but an analysis must still inspect available sample counts and extreme records. If future input contains missing values, different variable pairs may use different samples. Small groups or outliers may also change means and Pearson correlations substantially.

## Reading the results

The distribution chart answers, “How do center, spread, and outliers differ across condition groups?” The correlation matrix answers, “How do the selected numeric fields vary together linearly?” Both require their sample basis. If the image or table is unavailable, the fallback summaries above still preserve the comparison, statistical definition, and limitations.

## Analysis findings

- Observation: Conditional distributions may differ in center, spread, and outliers; numeric variables may vary together.
- Analysis result: Distribution charts, descriptive statistics, covariance, the Pearson matrix, and sample checks are calculated from the same snapshot.
- Interpretation: Correlation coefficients describe the direction and strength of linear association, while conditional distributions describe group patterns.
- Limitation: Year, season, time, and weather may change together. There is no experimental design here, and correlation does not imply causation.

## Limitations and common misconceptions

### Diagnosing and correcting a misleading version

A misleading heatmap might scale colors only from the current minimum to maximum, use a one-direction lightness scale, include category codes such as `season`, and call the darkest cell the variable with the “largest impact.” The corrected version fixes the range at `[-1, 1]`, centers it at zero, annotates values, explicitly selects continuous and count fields, and uses “correlation” rather than “impact” in its title and explanation.

This chapter does not calculate or interpret confidence intervals, significance tests, or p-values, and it does not use estimation plots with default confidence intervals. A correlation matrix is symmetric and its diagonal is always 1; repeated colors do not represent multiple independent findings.

### English reading support for the Chinese charts

- Season distribution: Four box plots compare medians, interquartile ranges, whiskers, and outliers for hourly rentals. A separate table provides each season's sample size, and the generated result supplies precise differences.
- Correlation heatmap: A symmetric Pearson matrix for seven explicitly selected numeric fields, with a color scale from -1 to 1 centered at zero and coefficients written in the cells. Color represents linear association, not causal influence.

<!-- exercise: interpret-correlation -->
<!-- teaching-prompt: id=interpret-correlation kind=interpret-correlation chapter=seaborn-statistics scored=false submitted=false persistedToProgress=false gatesChapter=false -->
## Think it through

If the loaded analysis result shows a positive Pearson correlation between `temp` and `cnt`, how could you describe that finding accurately in one sentence? Before writing it in a report, which chart and sample details should you check to make the interpretation responsible?

### Suggested reasoning

You could write: “In this snapshot, `temp` and `cnt` tend to vary together in a positive linear direction, but correlation does not imply causation.” Then inspect the scatterplot shape, valid sample count, outliers, and time, season, and weather conditions that may vary together. Pearson's coefficient is not a regression slope and does not prove that temperature change is the sole cause of demand change.

### Common misconception

Treating correlation as a slope, treating strong correlation as causation, or reading only the coefficient's magnitude while ignoring relationship shape and sample basis.

### Review

Revisit “Distinguish covariance from Pearson correlation” and “Check missingness, sample size, and outlier influence” to separate a description of co-variation from a causal explanation.

## Next step

The next chapter places the same aggregate tables and field meanings in Plotly. Hover, redundant group encodings, and explicit filters support exploration, while a fixed default view remains available for reporting.
