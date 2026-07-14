# 第五章：Matplotlib 解释型图表

章节 ID：`matplotlib-visualization`

## 核心问题

哪种图表能诚实地表达时段差异？

## 本章目标

你将使用 Matplotlib 的 Figure/Axes 对象模型，把逐小时需求与用户构成变成可复现静态图；根据问题选择折线、柱状、散点或直方图，并诊断截断坐标轴、双轴和装饰性编码造成的误导。

## 前置连接

第四章已经创建按 0–23 时排序的 `hourly_demand`、按工作日状态分组的 `workingday_hourly` 和用户构成表 `rider_mix`。本章只负责表达这些明确口径，不在绘图代码里偷偷改聚合。

## 概念与直觉

Matplotlib 把完整画布称为 Figure，把包含坐标、标题和图形标记的绘图区称为 Axes。`fig, ax = plt.subplots()` 让每一步修改都指向明确对象，比依赖全局当前图更容易维护和复现。

图表类型由任务决定：折线强调有顺序的变化，柱状比较少量离散类别，散点观察两个数值变量的共同变化，直方图展示一个数值变量的分布。图表不是数据的“美化”；轴范围、聚合和标签都会改变读者看到的关系。

## 逐步代码

### 1. 设置一致但不过度装饰的默认样式

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

颜色同时配合文字标签；颜色不是区分类别的唯一方式。

### 2. 用折线表达有序的小时变化

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

点标记和标签使信息不只依赖颜色。折线连接相邻小时，是因为小时有自然顺序；它不表示两个整数小时之间测量了连续曲线。

### 3. 比较工作日状态下的同一小时

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

线型与文字图例共同区分两组，即使灰度打印或存在色觉差异也能阅读。

### 4. 正确表达用户构成

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

`cnt` 是两类用户之和，所以不能把 `casual`、`registered`、`cnt` 当成三个并列用户类别，更不能三者一起堆叠。

### 5. 认识不同问题对应的图形

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

同一数据可以画很多图，但不是每种图都同样适合当前问题。

### 6. 用同一数据演示误导与修正

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

两图使用同一聚合值。截断柱状图基线会夸大长度比例；修正图从零开始，并保留单位。折线图不总要求零基线，但必须明确范围且不能利用窄区间制造巨大波动。双轴图也应避免，因为两套可任意缩放的轴很容易制造虚假同步。

## 输出与阅读

`hourly-demand-profile` 和 `rider-composition` 在阶段三由同一脚本生成 PNG。前者输入固定为 `hourly_demand` 的小时与平均值；后者只比较两类真实用户并从零开始。生成时还要保存数据 hash、环境版本和 alt 文本。

## 证据解释

- 观察：折线的位置和形状显示不同小时的平均需求模式；柱长显示两类用户累计量。
- 证据：图表直接使用第四章生成的聚合表，轴标签写明小时、平均值或累计量。
- 解释：有序小时适合折线，离散用户类别适合零基线柱状图。
- 限制：图表描述关联与构成，不能解释变化原因，也不能代替样本数和聚合表。

## 限制或误区

图表最常见的问题不是代码报错，而是“能画出来但问题表达错了”：时间顺序打乱、总量冒充平均值、柱状图截断零点、用面积或三维透视夸大差异、只靠颜色区分，以及把两条共变曲线当成因果。

### 中文 alt 草案

- 逐小时图：折线图，横轴为 0–23 时，纵轴为平均每小时租车次数；点和连线展示日内需求结构，精确峰值由生成输出确定。
- 用户构成图：从零开始的双柱图，比较临时用户与注册用户累计租车次数；柱顶有数值标签，总量 `cnt` 未作为第三类用户。

<!-- exercise: chart-choice -->
## 形成性反馈

### 题目

要比较 0–23 时需求变化并让读者看出时间顺序，哪项设计最合适？

- A. 按小时排序的折线图，标注单位，并用点标记辅助颜色
- B. 对小时类别做饼图，扇区按数值大小重新排序
- C. 使用截断零基线的柱状图放大相邻小时差异
- D. 用双轴叠加天气编码和需求，让两条曲线看起来同步

### 提示

先问“哪个编码保留了时间顺序”，再检查轴和视觉差异是否诚实。

### 即时反馈

- 选择 A：正确。位置与连线保留小时顺序，点标记和标签提供非颜色线索。
- 选择 B：饼图不适合 24 个有序类别，重新排序还破坏时间结构。
- 选择 C：柱状图截断零点会夸大长度比例，而且 24 根柱不如折线直接表达顺序。
- 选择 D：类别编码不是连续测量；双轴尺度可任意调整，视觉同步不能证明关系。

### 常见误区

把“视觉差异大”当成“证据强”，或只根据能否调用 API 选择图表，而忽略顺序、单位和比例。

### 复看锚点

复看“认识不同问题对应的图形”和“用同一数据演示误导与修正”。本练习只提供原因反馈，不计分、不提交、不写入学习进度，也不阻挡下一章。

## 下一步

下一章使用 Seaborn 比较分布和变量关系，并在描述统计、协方差和 Pearson 相关的范围内解释共同变化。
