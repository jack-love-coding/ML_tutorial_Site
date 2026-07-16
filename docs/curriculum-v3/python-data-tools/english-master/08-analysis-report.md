# Chapter 8: Bike Sharing Demand Analysis Report

Chapter ID: `analysis-report`

## Core question

Which analysis results support an explanation of demand patterns?

## Learning goals

You will organize the results from the first seven chapters into a reproducible report. Every claim will state what was observed, which result it refers to, how it is interpreted, and which conclusions the current data cannot support.

## Connection to the previous chapters

We established a reproducible environment, understood arrays and table structures, created grouped summaries, designed static and interactive charts, and limited statistical interpretation to descriptive statistics and correlation. This report chapter introduces no new metric. Instead, it checks whether those findings answer the course question together.

## Concepts and intuition

A data report is not a gallery of charts. A reviewable claim has four parts:

1. **Observation**: the pattern seen within a clearly stated range.
2. **Analysis result**: the referenced result, fields, units, and aggregation rule.
3. **Interpretation**: how the pattern helps answer the question.
4. **Limitation**: the confounding, sample, or method boundaries that prevent a stronger conclusion.

The five analysis dimensions are time, working-day status, season, weather, and rider composition. They may vary together, so no single dimension can be isolated and presented as the sole cause.

## Step-by-step code

### 1. Build a result reference table

<!-- cell: ch08-evidence-register role: compute -->
```python
evidence_register = pd.DataFrame([
    {
        "dimension": "数据结构",
        "output_id": "dataset-shape-schema",
        "metric": "schema 与字段角色",
        "aggregation": "完整快照",
    },
    {
        "dimension": "时间",
        "output_id": "hourly-demand-profile",
        "metric": "mean_rentals",
        "aggregation": "按 hr 的平均每小时需求",
    },
    {
        "dimension": "工作日",
        "output_id": "workingday-comparison",
        "metric": "observations / mean / median",
        "aggregation": "按 workingday 与 hr",
    },
    {
        "dimension": "季节与天气",
        "output_id": "season-weather-distribution",
        "metric": "分布与组样本数",
        "aggregation": "按 season / weathersit",
    },
    {
        "dimension": "用户构成",
        "output_id": "rider-composition",
        "metric": "casual / registered",
        "aggregation": "完整快照累计租车次数",
    },
    {
        "dimension": "变量关系",
        "output_id": "pearson-correlation-matrix",
        "metric": "Pearson r 与有效样本",
        "aggregation": "显式数值字段",
    },
    {
        "dimension": "交互核对",
        "output_id": "plotly-hourly-explorer",
        "metric": "mean / median / observations",
        "aggregation": "固定默认筛选状态",
    },
])
evidence_register
```

The table forces the report to identify where every number comes from. Stage 3 reads precise values from the corresponding generated result rather than copying them into Markdown.

### 2. Generate the final analysis checklist

<!-- cell: ch08-final-evidence role: handoff output: final-analysis-evidence -->
```python
def round6(value):
    return round(float(value), 6)


hourly_peak_value = hourly_demand["mean_rentals"].max()
hourly_peak = (
    hourly_demand.loc[np.isclose(hourly_demand["mean_rentals"], hourly_peak_value)]
    .sort_values("hr")
    .iloc[0]
)

workingday_peaks = []
for workingday, group in workingday_hourly.groupby("workingday", sort=True):
    peak_value = group["mean_rentals"].max()
    peak = group.loc[np.isclose(group["mean_rentals"], peak_value)].sort_values("hr").iloc[0]
    workingday_peaks.append({
        "workingday": int(workingday),
        "workingdayLabel": peak["workingday_label"],
        "peakHour": int(peak["hr"]),
        "meanRentals": round6(peak["mean_rentals"]),
        "medianRentals": round6(peak["median_rentals"]),
        "observations": int(peak["observations"]),
    })

season_evidence = (
    analysis_rides
    .groupby(["season", "season_label"], as_index=False)
    .agg(observations=("cnt", "size"), mean_rentals=("cnt", "mean"), median_rentals=("cnt", "median"))
    .sort_values("season")
)
weather_evidence = (
    analysis_rides
    .groupby(["weathersit", "weather_label"], as_index=False)
    .agg(observations=("cnt", "size"), mean_rentals=("cnt", "mean"), median_rentals=("cnt", "median"))
    .sort_values("weathersit")
)

casual_total = int(analysis_rides["casual"].sum())
registered_total = int(analysis_rides["registered"].sum())
two_group_total = casual_total + registered_total

final_analysis_evidence = {
    "contract_version": "python-data-tools-v1",
    "dataset_sha256": DATA_SHA256,
    "environment": {"python": "3.12.13", "packages": observed_versions},
    "question": "时间、工作日、季节、天气和用户构成怎样共同解释需求变化？",
    "source_outputs": evidence_register["output_id"].tolist(),
    "evidence": {
        "time": {
            "peakHour": int(hourly_peak["hr"]),
            "meanRentals": round6(hourly_peak["mean_rentals"]),
            "observations": int(hourly_peak["observations"]),
            "unit": "每小时租车次数",
            "aggregation": "按 hr 的 cnt 均值",
            "tieRule": "并列时选择较早小时",
            "limitation": "混合了年份、季节、天气和日期类型",
        },
        "workingDay": {
            "groups": workingday_peaks,
            "aggregation": "按 workingday 与 hr 的 cnt 均值/中位数",
            "limitation": "分组关联不能证明工作日状态造成需求差异",
        },
        "season": {
            "groups": [
                {
                    "season": int(row.season),
                    "seasonLabel": row.season_label,
                    "observations": int(row.observations),
                    "meanRentals": round6(row.mean_rentals),
                    "medianRentals": round6(row.median_rentals),
                }
                for row in season_evidence.itertuples(index=False)
            ],
            "limitation": "季节与年份、天气和日期类型共同变化",
        },
        "weather": {
            "groups": [
                {
                    "weathersit": int(row.weathersit),
                    "weatherLabel": row.weather_label,
                    "observations": int(row.observations),
                    "meanRentals": round6(row.mean_rentals),
                    "medianRentals": round6(row.median_rentals),
                }
                for row in weather_evidence.itertuples(index=False)
            ],
            "limitation": "少数组和共同变化变量限制解释，相关不代表因果",
        },
        "riderComposition": {
            "casualRentals": casual_total,
            "registeredRentals": registered_total,
            "casualShare": round6(casual_total / two_group_total),
            "registeredShare": round6(registered_total / two_group_total),
            "unit": "累计租车次数及两类总和份额",
            "limitation": "累计次数不是独立用户人数",
        },
        "relationships": {
            "method": "pearson",
            "withCnt": {
                name: round(float(correlation_matrix.loc[name, "cnt"]), 8)
                for name in ["temp", "hum", "windspeed"]
            },
            "limitation": "Pearson 只描述线性关联；相关不代表因果",
        },
    },
    "claim_template": ["观察", "证据", "解释", "限制"],
    "excludes": ["预测", "因果识别", "显著性判断", "数据清洗"],
    "handoff_route": "/data-lab",
}
final_analysis_evidence
```

Stage 3 adds the metrics, values, units, aggregation definitions, dataset hash, and environment versions used by the report to this JSON. The webpage and Notebook read the same file, avoiding three separately copied sets of numbers.

<!-- result-presentation: final-analysis-evidence -->
### Result title

Summary of bike-sharing demand findings and limitations

### Accessibility description

A set of structured tables organizes findings by time, working-day status, season, weather, rider composition, and relationships among numeric variables. Each dimension includes its metric, unit, grouping or aggregation definition, sample basis, and limitation. The summary also records the dataset snapshot, environment versions, references to earlier results, and the transition to Data Lab.

### Chinese labels and English meanings

[]

### What the report shows

The summary joins the reading chain from the first seven chapters into a reviewable report. Time describes within-day structure; working-day, season, and weather sections describe conditional group differences; rider composition describes how the two rental counts make up the total; and numeric relationships describe Pearson linear association only. Every claim can be traced back to its corresponding result and generating code.

### What to keep in mind

These results come from a prepared data snapshot and support descriptive analysis only. They cannot be used for prediction; group differences and Pearson correlations cannot be written as causal conclusions; and no significance judgment is included. Cumulative rentals are not counts of unique users. Missing values, duplicates, invalid types, invalid categories, and outlier policies remain the responsibility of `/data-lab`.

### Fallback summary

If the structured result is temporarily unavailable, retain the six report sections and the observation–analysis result–interpretation–limitation structure. State explicitly that correlation does not imply causation, that no predictive model is trained, and that cleaning raw, messy data belongs in `/data-lab`. Precise values come from the loaded analysis result.

## Reading the results

The final summary is not a new source of analysis. It references the preceding seven results and fills in their observed values during generation. From any claim, a reader can trace backward to the corresponding result, generating code, dataset snapshot, and environment versions. This chain explains how another person can reproduce the same report from a clean kernel. If the structured result is unavailable, the fallback summary above preserves the scope and limitations.

## Analysis findings

The following writing framework receives observed values during Stage 3; it does not guess a direction or peak in advance.

### Finding 1: Time structure

- Observation: Identify the repeatable within-day structure in `hourly-demand-profile`.
- Analysis result: State `hr`, `mean_rentals`, the unit, and the relevant hour, with the result ID.
- Interpretation: Explain how the structure answers when demand changes.
- Limitation: Hourly aggregation combines different years, seasons, weather conditions, and date types.

### Finding 2: Working-day status

- Observation: Align working days and weekends/holidays at the same hour.
- Analysis result: Refer to the mean, median, and sample size in `workingday-comparison`.
- Interpretation: Describe the association between date type and the within-day pattern.
- Limitation: This is not a randomized experiment and cannot be written as “working days cause demand to change.”

### Finding 3: Season and weather

- Observation: Compare the centers, ranges, and group sizes of the conditional distributions.
- Analysis result: Refer to `season-weather-distribution` and report sample sizes with it.
- Interpretation: Describe how season or weather conditions vary together with the demand distribution.
- Limitation: Small groups, temporal seasonality, and uncontrolled variables restrict the conclusion; correlation does not imply causation.

### Finding 4: Rider composition

- Observation: Compare cumulative rentals by casual and registered riders and connect them with the hourly view.
- Analysis result: Refer to `rider-composition` and the fixed default state of `plotly-hourly-explorer`.
- Interpretation: Explain how the two counts make up total demand and whether their patterns align.
- Limitation: Cumulative quantities depend on the observation period and record count and cannot directly represent individual behavior or unique users.

### Finding 5: Relationships among numeric variables

- Observation: Describe the scatterplot and the linear associations in `pearson-correlation-matrix`.
- Analysis result: State the fields, Pearson coefficient, valid sample count, and relationship shape.
- Interpretation: Use correlation as a clue about co-variation, not proof of a mechanism.
- Limitation: Pearson describes only linear association and is sensitive to outliers and sample selection; correlation does not imply causation.

## Limitations and common misconceptions

The report must not use overreaching language such as “proves,” “causes,” “the only reason,” or “predicts accurately.” Aggregated data cannot establish individual rider behavior, and normalized fields cannot be described as if they were in the original units. If a chart and numeric table use different definitions, repair the generation chain rather than selecting the version that better matches an expectation.

This course has not established policies for missing values, duplicates, invalid types, invalid categories, or outliers. The current snapshot passed the Stage 1 contract validation. When the analysis starts from raw, messy data, continue to `/data-lab` to record cleaning rules, affected row counts, and before/after differences.

## Final report checklist

- [ ] Each of the five analysis dimensions refers to an analysis result rather than presenting only a chart.
- [ ] Every precise value includes a unit, grouping key, aggregation rule, and result ID.
- [ ] Every claim follows observation–analysis result–interpretation–limitation.
- [ ] Working-day, season, weather, and correlation relationships are not described as causal proof.
- [ ] The interactive chart's default state is visible, and important conclusions also have static text.
- [ ] The dataset hash, environment contract, and clean-kernel execution information are traceable.
- [ ] The report does not teach prediction, significance tests, p-values, or confidence intervals.
- [ ] Data-cleaning questions are explicitly handed off to `/data-lab`.

This checklist is not scored, submitted, persisted to learning progress, or used as a course gate. It helps an author find broken links in the analysis chain before publication.

## Next step

After completing this course, continue to `/data-lab` to work with missing values, duplicates, invalid types, and outliers. The executed Chinese Notebook remains the reproducible record of the analysis and its results; this English chapter does not create a separate Notebook or a separate set of values.
