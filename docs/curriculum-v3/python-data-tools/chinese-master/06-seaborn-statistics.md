# 第六章：Seaborn 分布、关系与相关

章节 ID：`seaborn-statistics`

## 核心问题

变量共同变化说明了什么，又不能说明什么？

## 本章目标

你将用 Seaborn 比较条件分布与数值关系，结合描述性统计、协方差和 Pearson 相关解释共同变化，并检查缺失值、样本量和离群值如何影响结论。你也要明确拒绝从相关直接推导因果。

## 前置连接

第五章解决了“如何诚实表达已聚合结果”。本章进一步观察记录分布和两个数值变量的关系，但仍使用第三、四章确定的字段语义与样本口径。

## 概念与直觉

Seaborn 接受 pandas 长表，通过 `x`、`y`、`hue` 等语义映射生成 Matplotlib Axes。箱线图或小提琴图比较条件分布，散点图观察两个数值变量的共同变化，热力图编码矩阵。

描述性统计只概括已经观察到的数据。协方差的正负表示共同变化方向，但数值大小依赖变量尺度；Pearson 相关系数把尺度标准化到 -1 至 1，描述线性关联方向和强度。它对非线性关系、离群值和样本选择敏感，且相关不代表因果。

## 逐步代码

### 1. 为分布图准备有序标签

<!-- cell: ch06-distribution-data role: data -->
```python
distribution_data = analysis_rides.loc[
    :, ["season", "season_label", "weathersit", "weather_label", "cnt"]
].copy()

season_order = ["春季", "夏季", "秋季", "冬季"]
weather_order = ["晴或少云", "薄雾或多云", "小雨雪或雷暴", "强降水或恶劣天气"]
```

显式顺序避免图表按字符串任意排列。原编码仍保留，便于验证映射。

### 2. 同时查看分布与组样本数

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

箱体、须和离群点展示分布结构，不等于“预测区间”。样本数表必须随图一起读；本课程不借此教授置信区间或显著性检验。

<!-- result-presentation: season-weather-distribution -->
### 运行结果标题

季节与天气条件下的每小时需求分布

### 无障碍说明

双面板箱线图分别比较四季和天气状况下的每小时租车需求分布。左面板按春、夏、秋、冬排列，右面板按天气类别排列；每个箱体展示中位数、四分位范围、须和离群点，组样本数由配套表格提供。

### 坐标轴与图例翻译

- `left-title`：原图“按季节比较需求分布” → 页面“按季节比较需求分布”
- `left-x-axis`：原图“季节” → 页面“季节”
- `left-y-axis`：原图“每小时租车次数” → 页面“每小时租车次数”
- `right-title`：原图“按天气比较需求分布” → 页面“按天气比较需求分布”
- `right-x-axis`：原图“天气状况” → 页面“天气状况”
- `right-y-axis`：原图“每小时租车次数” → 页面“每小时租车次数”
- `categories`：原图中文季节与天气标签 → 页面沿用相同中文标签，并用配套表格列出各组样本数

### 分析发现

箱体的位置和高度帮助比较各组分布的中心与中间一半范围，须和离群点提示尾部结构。图形必须与组样本数一起阅读：样本基础很小的类别即使箱体位置突出，也需要更保守地描述。

### 需要注意

箱线图描述已经观察到的条件分布，不是预测区间，也不提供显著性判断。季节、天气、年份和日期类型可能共同变化，组间差异不能写成某种条件造成需求改变。

### 静态摘要

如果图片暂时不可用，仍应保留以下比较框架：按固定顺序比较四季与天气类别的中位数、四分位范围、须、离群点和组样本数；精确差异由正式运行结果与配套表格提供。

### 3. 计算描述性统计而不只看图形

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

均值与中位数差异可提示偏斜或极端值影响；四分位数描述中间一半记录。样本很少的天气组即使均值突出，也需要保守解释。

### 4. 用散点观察共同变化

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

透明度缓解点重叠；形状与图例让分组不只依赖颜色。点云能提示关系形状与离群位置，但不能单独给出因果解释。

### 5. 区分协方差与 Pearson 相关

<!-- cell: ch06-covariance-correlation role: compute -->
```python
relationship_pair = analysis_rides[["temp", "cnt"]]

covariance = float(relationship_pair.cov().loc["temp", "cnt"])
pearson_r = float(relationship_pair.corr(method="pearson").loc["temp", "cnt"])

{"covariance": covariance, "pearson_r": pearson_r}
```

协方差为正表示两列倾向同向变化，但它的大小随单位变化。Pearson 的公式是

\[
r = \frac{\operatorname{cov}(X,Y)}{s_X s_Y}
\]

其中 \(X\) 与 \(Y\) 是两个数值变量，\(\operatorname{cov}\) 是协方差，\(s_X\) 与 \(s_Y\) 是各自标准差。\(r\) 接近 1 或 -1 只表示强线性关联，不能证明一个变量导致另一个变量。

### 6. 显式选择相关字段

<!-- cell: ch06-correlation-matrix role: compute output: pearson-correlation-matrix -->
```python
correlation_columns = [
    "temp", "atemp", "hum", "windspeed", "casual", "registered", "cnt"
]
correlation_matrix = analysis_rides[correlation_columns].corr(method="pearson")
correlation_matrix
```

`season`、`weathersit` 和 `workingday` 没有机械放入矩阵：它们的整数值主要表达类别，而不是等距连续测量。

<!-- result-presentation: pearson-correlation-matrix -->
### 运行结果标题

七个数值字段的 Pearson 相关矩阵

### 无障碍说明

一张对称表格，行列都按 `temp`、`atemp`、`hum`、`windspeed`、`casual`、`registered`、`cnt` 排列。每个交叉单元格给出两个字段的 Pearson 相关系数，主对角线为 1，并同时提供各字段的有效样本数与“相关不代表因果”说明。

### 坐标轴与图例翻译

[]

### 分析发现

矩阵用于同时检查多个显式数值字段的线性共同变化方向与强度。阅读时先锁定一对行列字段，再结合系数符号、绝对值、散点形状和有效样本数判断；对称位置是同一对变量的重复表示，不是两份独立发现。

### 需要注意

Pearson 只描述线性关联，对离群值、非线性关系、缺失模式和样本选择敏感。类别编码没有加入矩阵；系数既不是回归斜率，也不能证明一个变量导致另一个变量。本课程不计算或解释置信区间、显著性检验和 p 值。

### 静态摘要

如果结构化表格暂时不可用，仍应说明：矩阵只覆盖七个明确选定的数值字段，系数范围为 -1 到 1，对角线为 1；任何系数都必须结合散点、有效样本和“相关不代表因果”的限制阅读。

### 7. 用以零为中心的色阶画热力图

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

固定 -1 到 1 且以 0 为中心，正负相关才具有可比颜色。数值标注提供非颜色信息。

### 8. 检查缺失、样本量与离群值影响

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

当前快照经过契约验证，但分析仍要显式查看可用样本和极端记录。若未来输入含缺失，不同变量对可能基于不同样本；少数组或离群点也可能显著改变均值和 Pearson 相关。

## 运行结果与阅读

分布图回答“各条件组的中心、范围和离群点怎样不同”，相关矩阵回答“选定数值字段怎样线性共同变化”。两者都必须连同样本基础阅读；图片或表格暂时不可用时，上方静态摘要仍保留比较对象、统计口径和限制。

## 分析发现

- 观察：条件分布可能在中心、范围和离群点上不同；数值变量可能共同变化。
- 运行结果：分布图、描述统计、协方差、Pearson 矩阵和样本检查从同一快照计算。
- 解释：相关系数用于描述线性关联方向与强度，条件分布用于描述组间模式。
- 限制：年份、季节、时间与天气可能共同变化；这里没有实验设计，相关不代表因果。

## 限制或误区

### 误导诊断与修正

误导版本会把热力图色阶设为当前最小值到最大值、只用单向深浅色、加入 `season` 等类别编码，并把最深颜色写成“影响最大”。修正版本固定 `[-1, 1]`、以 0 为中心、标注数值、显式选择连续/计数字段，并在标题和正文中使用“相关”而不是“影响”。

本章不计算或解释置信区间、显著性检验和 p 值，也不使用带默认置信区间的估计图。相关矩阵对称、对角线恒为 1；重复颜色不代表多份独立发现。

### 中文 alt 草案

- 季节分布图：四组箱线图比较每小时租车次数的中位数、四分位范围、须与离群点；各季节样本数另表提供，精确差异由生成输出确定。
- 相关热力图：七个显式数值字段的对称 Pearson 矩阵，色阶从 -1 到 1 并以 0 为中心，单元格有系数标签；颜色表示线性相关而非因果影响。

<!-- exercise: interpret-correlation -->
## 形成性反馈

### 题目

若阶段三输出显示 `temp` 与 `cnt` 的 Pearson 相关为正，哪项解释符合本章边界？

- A. 在这份快照中，两者倾向同向线性变化，但不能据此证明升温导致需求上升
- B. 温度每上升一个单位，一定造成固定数量的租车增长
- C. 正相关证明天气是需求变化的唯一原因
- D. 只要相关为正，就不需要检查散点、样本量和离群值

### 提示

Pearson 描述线性共同变化；再问它是否包含时间控制、实验操纵或因果识别。

### 即时反馈

- 选择 A：正确。它描述样本内线性关联，同时明确拒绝因果越界。
- 选择 B：相关系数不是回归斜率，也不证明固定增量或因果关系。
- 选择 C：时间、季节和用户构成等变量可能共同变化，相关无法证明唯一原因。
- 选择 D：离群值、非线性、缺失与样本选择都可能改变解释，系数不能脱离图形和样本检查。

### 常见误区

把相关当斜率、把强相关当因果、只看系数绝对值而忽略关系形状与样本基础。

### 复看锚点

复看“区分协方差与 Pearson 相关”和“检查缺失、样本量与离群值影响”。本练习只提供原因反馈，不计分、不提交、不写入学习进度，也不阻挡下一章。

## 下一步

下一章把这些聚合表和字段语义放进 Plotly，用 hover、颜色、分面与显式筛选支持探索，同时保留固定默认视图供报告引用。
