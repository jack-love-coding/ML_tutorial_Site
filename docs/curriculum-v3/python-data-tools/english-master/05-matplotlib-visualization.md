# Chapter 5: Explanatory Charts with Matplotlib

Chapter ID: `matplotlib-visualization`

## Core question

Which chart honestly communicates hourly differences?

## Learning goals

You will use Matplotlib's Figure/Axes object model to turn hourly demand and rider composition into reproducible static charts. You will choose among line, bar, scatter, and histogram charts according to the question, then diagnose how truncated axes, dual axes, and decorative encodings can mislead a reader.

## Connection to the previous chapter

Chapter 4 created `hourly_demand`, ordered from hour 0 through 23, `workingday_hourly`, grouped by working-day status, and the rider composition table `rider_mix`. This chapter only presents those clearly defined summaries; it does not quietly change the aggregation inside plotting code.

## Concepts and intuition

Matplotlib calls the complete canvas a Figure and the plotting region that contains coordinates, titles, and marks an Axes. `fig, ax = plt.subplots()` makes every change target an explicit object, which is easier to maintain and reproduce than relying on whichever chart is currently active globally.

The task determines the chart type. A line chart emphasizes ordered change, a bar chart compares a small number of discrete categories, a scatterplot shows how two numeric variables vary together, and a histogram shows the distribution of one numeric variable. A chart is not merely a way to “beautify” data: axis ranges, aggregation choices, and labels all change the relationship a reader sees.

## Step-by-step code

### 1. Set a consistent style without excessive decoration

<!-- cell: ch05-style-setup role: setup -->
```python
plt.style.use("seaborn-v0_8-whitegrid")
plt.rcParams.update({"font.family": "Noto Sans SC", "font.weight": 400})

COLORS = {
    "total": "#2563eb",
    "casual": "#d97706",
    "registered": "#0f766e",
}
```

Text labels accompany color, so color is never the only way to distinguish categories.

### 2. Use a line to show ordered hourly change

<!-- cell: ch05-hourly-line role: visualize output: hourly-demand-profile -->
```python
fig, ax = plt.subplots(figsize=(9, 4.8))
ax.plot(
    hourly_demand["hr"],
    hourly_demand["mean_rentals"],
    color=COLORS["total"],
    marker="o",
    linewidth=2,
    label="平均每小时租车数",
)
ax.set(
    title="一天 24 小时的平均租车需求",
    xlabel="小时（0–23）",
    ylabel="平均每小时租车次数",
    xticks=range(0, 24, 2),
)
ax.legend()
fig.tight_layout()
```

Point markers and labels keep the chart from depending on color alone. Connecting adjacent hours is appropriate because hours have a natural order; the line does not claim that a continuous curve was measured between integer hours.

<!-- result-presentation: hourly-demand-profile -->
### Result title

Average bike-rental demand across 24 hours

### Accessibility description

A line chart compares mean hourly bike rentals from hour 0 through 23. Every hour has a point marker, and adjacent points are connected in time order. The horizontal axis is hour of day, the vertical axis is mean rentals per hour, and the legend identifies the line as mean demand.

### Chinese labels and English meanings

- `title`: chart text “一天 24 小时的平均租车需求” → “Average bike-rental demand across 24 hours”
- `x-axis`: chart text “小时（0–23）” → “Hour (0–23)”
- `y-axis`: chart text “平均每小时租车次数” → “Mean rentals per hour”
- `legend`: chart text “平均每小时租车数” → “Mean hourly rentals”

### What the chart shows

The point positions compare mean demand by hour, while the connecting line helps trace the order within a day. First confirm that the horizontal axis runs from 0 through 23, then inspect the shape of demand across the day. The peak hour and its mean come from the loaded analysis result, so the prose does not maintain a duplicate value.

### What to keep in mind

This line summarizes records from different years, seasons, weather conditions, and date types. The segments between adjacent points express hourly order only; they do not add measurements between integer hours, and they cannot show that a particular hour causes demand to change.

### Fallback summary

If the image is temporarily unavailable, use the same reading frame: the horizontal axis covers hours 0–23, the vertical axis shows mean rentals for each hour, and points plus connecting lines reveal the within-day demand pattern. Read the precise peak and its sample basis from the loaded analysis result.

### 3. Compare the same hour by working-day status

<!-- cell: ch05-workingday-lines role: visualize -->
```python
fig, ax = plt.subplots(figsize=(9, 4.8))
line_styles = {0: "--", 1: "-"}

for workingday, group in workingday_hourly.groupby("workingday", sort=True):
    ax.plot(
        group["hr"],
        group["mean_rentals"],
        linestyle=line_styles[workingday],
        marker="o",
        label=group["workingday_label"].iloc[0],
    )

ax.set(
    title="工作日状态下的逐小时平均需求",
    xlabel="小时（0–23）",
    ylabel="平均每小时租车次数",
    xticks=range(0, 24, 2),
)
ax.legend(title="日期类型")
fig.tight_layout()
```

Line style and text in the legend distinguish the two groups together, so the comparison remains readable in grayscale and for readers with color-vision differences.

### 4. Represent rider composition correctly

<!-- cell: ch05-rider-bars role: visualize output: rider-composition -->
```python
composition = rider_mix.loc[
    rider_mix["rider_type"].isin(["casual", "registered"])
].copy()

fig, ax = plt.subplots(figsize=(7, 4.8))
bars = ax.bar(
    ["临时用户", "注册用户"],
    composition["rentals"],
    color=[COLORS["casual"], COLORS["registered"]],
)
ax.set(
    title="两类用户的累计租车构成",
    xlabel="用户类型",
    ylabel="累计租车次数",
)
ax.set_ylim(bottom=0)
ax.yaxis.set_major_formatter(matplotlib.ticker.StrMethodFormatter("{x:,.0f}"))
ax.bar_label(bars, fmt="{:,.0f}")
fig.tight_layout()
```

Because `cnt` is the sum of the two rider categories, `casual`, `registered`, and `cnt` must not be treated as three peer categories or stacked together.

<!-- result-presentation: rider-composition -->
### Result title

Cumulative rentals by casual and registered riders

### Accessibility description

A two-bar chart with a zero baseline compares cumulative rentals by casual and registered riders. The horizontal axis contains the two rider categories, the vertical axis shows cumulative rentals, and each bar has an exact integer label above it. Total `cnt` is used only to verify the sum of the two counts and is not drawn as a third rider category.

### Chinese labels and English meanings

- `title`: chart text “两类用户的累计租车构成” → “Cumulative rentals by two rider categories”
- `x-axis`: chart text “用户类型” → “Rider type”
- `y-axis`: chart text “累计租车次数” → “Cumulative rentals”
- `categories`: chart text “临时用户” and “注册用户” → “Casual riders” and “Registered riders”

### What the chart shows

Bar lengths and labels together show cumulative rentals for the two rider categories across the complete snapshot. Starting at zero makes their lengths honestly comparable. The reader should also verify that the two counts add up to `cnt`.

### What to keep in mind

Cumulative rentals are not counts of unique people, and they depend on the length of the observation period. The two bars describe composition within this snapshot only; they do not establish individual behavior, and treating `cnt` as a third category would double-count the total.

### Fallback summary

If the image is temporarily unavailable, preserve this comparison: the result contains only cumulative rentals for casual and registered riders, the bars start at zero, exact integers are supplied by bar labels and the loaded analysis result, and `cnt` is used only as a sum check.

### 5. Match chart types to questions

<!-- cell: ch05-chart-task-map role: interpret -->
```python
chart_task_map = pd.DataFrame([
    {"question": "需求随小时怎样变化", "chart": "line", "reason": "小时有顺序"},
    {"question": "两类用户累计量谁更高", "chart": "bar", "reason": "少量离散类别"},
    {"question": "气温与需求是否共同变化", "chart": "scatter", "reason": "两个数值变量"},
    {"question": "小时需求分布是否偏斜", "chart": "histogram", "reason": "一个数值变量的分布"},
])
chart_task_map
```

The same data can produce many charts, but not every chart is equally well suited to the current question.

### 6. Demonstrate a misleading choice and its correction with the same data

<!-- cell: ch05-misleading-axis role: limit -->
```python
fig, (bad_ax, good_ax) = plt.subplots(1, 2, figsize=(11, 4.4))

values = composition["rentals"].to_numpy()
labels = ["临时用户", "注册用户"]

bad_ax.bar(labels, values, color=[COLORS["casual"], COLORS["registered"]])
bad_ax.set_ylim(values.min() * 0.95, values.max() * 1.02)
bad_ax.set_title("误导：柱状图截断零基线")

good_ax.bar(labels, values, color=[COLORS["casual"], COLORS["registered"]])
good_ax.set_ylim(bottom=0)
good_ax.set_title("修正：柱长从零开始")

for current_ax in (bad_ax, good_ax):
    current_ax.set_ylabel("累计租车次数")

fig.tight_layout()
```

Both panels use the same aggregated values. Truncating a bar chart's zero baseline exaggerates length ratios; the corrected chart starts at zero and keeps the unit visible. A line chart does not always require a zero baseline, but its range must be explicit and must not use a narrow interval to manufacture dramatic swings. Dual-axis charts should also be avoided because two independently scaled axes can manufacture a false sense of synchrony.

## Reading the results

Both charts reuse the aggregation rules established in Chapter 4. For the hourly chart, confirm the time order and unit before reading the within-day shape. For the rider composition chart, confirm the zero baseline and the two category labels before comparing bar lengths and their value labels. If an image is unavailable, the fallback summaries above preserve the same question, units, and interpretation boundaries.

## Analysis findings

- Observation: The line positions and shape reveal the pattern of mean demand across hours; bar length compares cumulative rentals for the two rider categories.
- Analysis result: The charts use the aggregate tables created in Chapter 4 directly, and their axes distinguish hour, mean, and cumulative quantity.
- Interpretation: Ordered hours suit a line chart, while discrete rider categories suit a zero-baseline bar chart.
- Limitation: The charts describe association and composition. They do not explain why demand changes and cannot replace sample counts or the underlying aggregate tables.

## Limitations and common misconceptions

The most common chart problems are not syntax errors but charts that run while answering the question incorrectly: time is out of order, totals are presented as means, a bar chart truncates zero, area or 3D perspective exaggerates differences, categories rely only on color, or two co-varying lines are described as causal.

### English reading support for the Chinese charts

- Hourly profile: A line chart with hour 0–23 on the horizontal axis and mean rentals per hour on the vertical axis. Points and lines reveal the within-day structure; the generated result supplies the precise peak.
- Rider composition: A zero-baseline two-bar chart comparing cumulative casual and registered rentals. Each bar has a value label, and total `cnt` is not drawn as a third rider category.

<!-- exercise: chart-choice -->
<!-- teaching-prompt: id=chart-choice kind=chart-choice chapter=matplotlib-visualization scored=false submitted=false persistedToProgress=false gatesChapter=false -->
## Think it through

To compare demand across hours 0–23 while preserving time order, which chart should you choose? Also identify the horizontal and vertical axes, the unit, and at least one reading cue besides color.

### Suggested reasoning

Hours have a natural order, so an hour-sorted line chart is the clearest choice: the horizontal axis is hour 0–23, and the vertical axis is mean rentals per hour. Point markers, a text legend, and explicit units support the reading together. Truncating the zero baseline of a bar chart exaggerates length ratios, a pie chart weakens the temporal order, and dual axes can manufacture apparent synchrony through arbitrary scales.

### Common misconception

Treating a larger visual difference as a more reliable conclusion, or choosing a chart only because its API is easy to call while ignoring order, units, and scale.

### Review

Revisit “Match chart types to questions” and “Demonstrate a misleading choice and its correction with the same data.” Compare why a line chart preserves sequence with why a bar chart requires a zero baseline.

## Next step

The next chapter uses Seaborn to compare distributions and relationships while keeping interpretation within descriptive statistics, covariance, and Pearson correlation.
