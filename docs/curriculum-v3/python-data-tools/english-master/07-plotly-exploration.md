# Chapter 7: Interactive Exploration with Plotly

Chapter ID: `plotly-exploration`

## Core question

How can interactive encodings compare rider groups and conditions?

## Learning goals

You will use Plotly Express to map DataFrame fields to position, color, facets, and hover details. You will build an hourly exploration chart with a fixed default state, then identify how hidden filters, inconsistent scales, and excessive encodings can make an interactive view impossible to audit.

## Connection to the previous chapters

Matplotlib is well suited to a fixed explanatory view, while Seaborn helps examine distributions and relationships. Plotly lets a reader inspect precise values and switch conditions, but it must reuse the same `workingday_hourly` table and rider-composition definitions. An interaction callback must not create a second set of calculations.

## Concepts and intuition

Plotly Express accepts a long-form table and returns a Figure. `x` and `y` determine position, `color` and `line_dash` distinguish categories, `facet` creates comparable small multiples, and `hover_data` reveals precise values on demand. Every channel should have one clear job. Packing every field into color, size, symbol, and animation only increases the work required to decode the chart.

Interaction changes how a result is viewed, not the result itself. Zooming does not strengthen a relationship, hover does not prove causation, and a hidden filter cannot be an unstated premise in a report. A final conclusion needs a default state that anyone can open and reproduce.

## Step-by-step code

### 1. Prepare long-form data for interaction

<!-- cell: ch07-interactive-data role: data -->
```python
plotly_data = workingday_hourly.loc[
    :, [
        "workingday", "workingday_label", "hr",
        "observations", "mean_rentals", "median_rentals",
    ]
].copy()

plotly_data = plotly_data.sort_values(["workingday", "hr"])
default_filter_state = {
    "hours": [0, 23],
    "workingday_values": [0, 1],
    "metric": "mean_rentals",
    "hidden_groups": [],
}
plotly_data.head()
```

Each row in the long table represents one working-day-status × hour group. Hover details read the row's sample size and median rather than recalculating them temporarily.

### 2. Build an interactive hourly line chart

<!-- cell: ch07-hourly-explorer role: visualize output: plotly-hourly-explorer -->
```python
import plotly.express as px

interactive_fig = px.line(
    plotly_data,
    x="hr",
    y="mean_rentals",
    color="workingday_label",
    line_dash="workingday_label",
    markers=True,
    hover_data={
        "workingday_label": True,
        "hr": ":.0f",
        "observations": ":,.0f",
        "median_rentals": ":.1f",
        "mean_rentals": ":.1f",
    },
    labels={
        "hr": "小时（0–23）",
        "mean_rentals": "平均每小时租车次数",
        "workingday_label": "日期类型",
        "observations": "小时记录数",
        "median_rentals": "中位数",
    },
    title="工作日状态下的逐小时平均需求",
)
interactive_fig.update_xaxes(dtick=2)
interactive_fig.update_layout(hovermode="x unified", legend_title_text="日期类型")
interactive_fig
```

Color and line style redundantly encode the same category. Unified hover lets the reader compare both groups at the same hour instead of chasing isolated points.

<!-- result-presentation: plotly-hourly-explorer -->
### Result title

Interactive hourly comparison of working and non-working days

### Accessibility description

An interactive line chart uses hours 0–23 on the horizontal axis and mean rentals per hour on the vertical axis. Color and line style together distinguish working days from weekends or holidays. The default view contains every hour and both date types; unified hover lists the group, mean, median, and sample size for the same hour.

### Chinese labels and English meanings

- `title`: chart text “工作日状态下的逐小时平均需求” → “Mean hourly demand by working-day status”
- `x-axis`: chart text “小时（0–23）” → “Hour (0–23)”
- `y-axis`: chart text “平均每小时租车次数” → “Mean rentals per hour”
- `legend`: chart text “日期类型” with two Chinese group labels → “Date type,” “Working day,” and “Weekend or holiday”
- `hover`: source fields `hr`, `mean_rentals`, `median_rentals`, and `observations` → “Hour,” “Mean rentals per hour,” “Median,” and “Hourly record count”
- `line-style`: solid and dashed lines repeat the two date categories so grouping does not depend on color alone

### What the chart shows

The default view aligns both groups at the same hour, while unified hover checks their mean, median, and sample size. The hour range, visible groups, and metric must always remain visible in the current-view summary. Temporary zooming or hiding a group changes only the current view and never overwrites the default state.

### What to keep in mind

Interaction reduces the effort of reading precise values, but it adds no causal information. Zooming, hiding legend items, and filtering change the visible range. A report cannot treat an undocumented temporary view as a reproducible conclusion, nor infer that date type caused a demand difference merely because two lines vary differently.

### Fallback summary

If the chart script or interactive resource is temporarily unavailable, retain the default conditions: hours 0–23, both working-day and weekend/holiday groups, mean rentals per hour as the metric, and no hidden groups. An equivalent table lists mean, median, and sample size for both groups by hour and keeps the same interpretation boundaries.

### 3. Compare rider types with facets

<!-- cell: ch07-rider-facets role: visualize -->
```python
rider_hourly = (
    analysis_rides
    .groupby(["workingday", "workingday_label", "hr"], as_index=False)
    .agg(casual=("casual", "mean"), registered=("registered", "mean"))
    .melt(
        id_vars=["workingday", "workingday_label", "hr"],
        value_vars=["casual", "registered"],
        var_name="rider_type",
        value_name="mean_rentals",
    )
)

rider_fig = px.line(
    rider_hourly,
    x="hr",
    y="mean_rentals",
    color="workingday_label",
    line_dash="workingday_label",
    facet_row="rider_type",
    labels={
        "hr": "小时（0–23）",
        "mean_rentals": "平均每小时租车次数",
        "workingday_label": "日期类型",
        "rider_type": "用户类型",
    },
)
rider_fig.update_yaxes(matches="y")
rider_fig
```

Facets separate the two rider categories, while a shared vertical range prevents automatic scaling from making a small variation look as tall as a large one.

### 4. Express the default filter state as data

<!-- cell: ch07-default-filter role: compute -->
```python
default_filter_state
```

Stage 3 saves the Figure JSON together with this state. The default view contains all 24 hours and both date types. If the webpage allows filtering, the current conditions must remain visible in the interface and whenever the view is cited.

### 5. Design useful hover details rather than dumping fields

<!-- cell: ch07-hover-contract role: interpret -->
```python
hover_contract = pd.DataFrame([
    {"field": "hr", "purpose": "定位同一小时"},
    {"field": "mean_rentals", "purpose": "读取主要指标"},
    {"field": "median_rentals", "purpose": "对照中心口径"},
    {"field": "observations", "purpose": "检查样本基础"},
    {"field": "workingday_label", "purpose": "确认当前组"},
])
hover_contract
```

Fields without an interpretation task do not belong in hover. The data dictionary remains the place to understand the other fields.

### 6. Record a static fallback

<!-- cell: ch07-static-fallback role: handoff -->
```python
plotly_static_fallback = {
    "source_output": "plotly-hourly-explorer",
    "x": "hr",
    "y": "mean_rentals",
    "groups": workingday_labels,
    "text_summary": "逐小时比较工作日与周末/节假日的平均需求；精确模式由权威输出生成。",
}
plotly_static_fallback
```

If the interactive script does not load, or if a learner uses a keyboard or prefers reduced motion, the core question, encodings, filter state, and text summary remain available.

## Reading the results

First confirm the hour range, visible groups, and current metric. Then align both groups at the same hour and use hover to inspect mean, median, and sample size. A temporary view produced by user actions never replaces the default state. When interaction is unavailable, the current-view summary and equivalent table answer the same comparison question.

## Analysis findings

- Observation: The interactive lines make it possible to read aggregated values for different date types at the same hour.
- Analysis result: Position, line style, color, and hover details all come from explicit fields in `plotly_data`.
- Interpretation: Interaction lowers the cost of reading precise values and helps identify time periods worth describing in a report.
- Limitation: Zooming, hiding a legend item, or filtering changes the visible range; those actions do not automatically create a reproducible conclusion.

## Limitations and common misconceptions

### Diagnosing and correcting a misleading version

A misleading version might show only working days by default without a filter label, scale each facet's vertical axis independently, and encode unrelated fields with color, point size, and animation. A reader could mistake a filtered local pattern for the full result and could not compare panels directly.

The corrected version displays all groups by default, records the conditions in `default_filter_state`, shares the vertical scale, uses only color plus line style for date type, and places precise values and sample sizes in hover. Every citation of the current view includes its filter state.

### English reading support for the Chinese chart

An interactive line chart places hours 0–23 on the horizontal axis and mean rentals per hour on the vertical axis. Two lines with different styles compare working days with weekends or holidays. The default shows every hour and both groups; hover supplies mean, median, and sample size. Static text preserves the same comparison task.

<!-- exercise: interactive-encoding -->
<!-- teaching-prompt: id=interactive-encoding kind=interactive-encoding chapter=plotly-exploration scored=false submitted=false persistedToProgress=false gatesChapter=false -->
## Think it through

To help a reader compare hourly demand for two date types and check sample sizes, what jobs should position, grouping, hover, and the current-view summary each perform? If the interactive chart is temporarily unavailable, which information must the page preserve?

### Suggested reasoning

Use `hr` and `mean_rentals` for horizontal and vertical position, repeat the date-type grouping through color and line style, retain mean, median, and sample size in hover, and continuously show the hour range and visible groups. If interaction is unavailable, a static summary and equivalent table must still state the default range, groups, metric, and interpretation boundaries.

### Common misconception

Assuming that more interaction means deeper analysis while ignoring the default state, filter transparency, shared scales, and a static fallback.

### Review

Revisit “Build an interactive hourly line chart,” “Express the default filter state as data,” and “Record a static fallback” to distinguish the current view from the default view.

## Next step

The final chapter stops adding exploratory definitions. It organizes the schema, grouped tables, static charts, distribution and correlation results, and fixed interactive view into a report structured as observation, analysis result, interpretation, and limitation.
