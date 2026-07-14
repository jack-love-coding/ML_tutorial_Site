# 第七章：Plotly 交互探索

章节 ID：`plotly-exploration`

## 核心问题

交互编码怎样帮助比较人群与条件？

## 本章目标

你将使用 Plotly Express 把 DataFrame 字段映射到位置、颜色、分面和 hover，构建具有固定默认状态的逐小时探索图，并识别隐藏筛选、比例不一致和过度编码如何让交互结果不可审计。

## 前置连接

Matplotlib 适合发布固定解释视图，Seaborn 帮助理解分布与关系。Plotly 让读者查看精确值和切换条件，但必须沿用同一 `workingday_hourly` 与用户构成口径，不能在交互回调里形成另一套结果。

## 概念与直觉

Plotly Express 接收长表并返回 Figure。`x` 与 `y` 决定位置，`color` 和 `line_dash` 区分类别，`facet` 生成可比小图，`hover_data` 提供按需精确值。每个通道都应承担一个明确任务；把所有字段都塞进颜色、大小、符号和动画只会增加解码负担。

交互是查看证据的方式，不是证据本身。缩放不会让关系变强，hover 不会证明因果，隐藏筛选也不能作为报告前提。最终结论需要一个任何人打开都能复现的默认状态。

## 逐步代码

### 1. 准备长格式交互数据

<!-- cell: ch07-interactive-data role: data -->
```python
plotly_data = workingday_hourly.loc[
    :, [
        "workingday", "workingday_label", "hr",
        "observations", "mean_rentals", "median_rentals",
    ]
].copy()

plotly_data = plotly_data.sort_values(["workingday", "hr"])
plotly_data.head()
```

长表中的每一行代表一个“工作日状态 × 小时”组。hover 将展示同一行的样本数和中位数，不临时重算。

### 2. 建立逐小时交互折线

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

颜色与线型重复编码同一类别。统一 hover 让读者在相同小时比较两组，而不是追逐孤立点。

### 3. 用 facet 比较用户类型

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

分面把两类用户分开，两个面板共享 y 轴范围，避免自动缩放把小幅变化画得和大幅变化一样高。

### 4. 把默认筛选状态写成数据

<!-- cell: ch07-default-filter role: compute -->
```python
default_filter_state = {
    "hours": [0, 23],
    "workingday_values": [0, 1],
    "metric": "mean_rentals",
    "hidden_groups": [],
}
default_filter_state
```

阶段三将 Figure JSON 与这份状态一起保存。默认视图展示全 24 小时和两类日期；如果网页允许筛选，当前条件必须在界面和导出证据中可见。

### 5. 设计够用的 hover，而不是数据倾倒

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

没有解释任务的字段不进入 hover。数据字典仍是理解其他字段的入口。

### 6. 记录静态 fallback

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

如果交互脚本未加载、用户使用键盘或偏好 reduced motion，关键问题、编码、筛选状态和文字摘要仍可读取。

## 输出与阅读

`plotly-hourly-explorer` 在阶段三保存确定性 Figure JSON 和 `default_filter_state`。读取交互图时先确认筛选状态，再对齐同一小时的两组位置，最后用 hover 查看均值、中位数和样本数。用户操作后的临时视图不能覆盖默认权威状态。

## 证据解释

- 观察：交互折线允许在同一小时读取不同日期类型的聚合值。
- 证据：位置、线型、颜色和 hover 都来自 `plotly_data` 的明确字段。
- 解释：交互降低读取精确值的成本，也帮助发现值得写进报告的时间段。
- 限制：缩放、隐藏图例或筛选会改变看到的范围；它们不能自动成为可复现结论。

## 限制或误区

### 误导诊断与修正

误导版本默认只展示工作日却不显示筛选标签，两个 facet 各自缩放 y 轴，同时用颜色、点大小和动画编码无关字段。读者会把过滤后的局部模式当全量结论，也无法直接比较面板。

修正版本默认显示全部组、把筛选写进 `default_filter_state`、共享 y 轴，只用颜色加线型区分日期类型，并把精确值与样本数放进 hover。每次导出证据都附当前筛选状态。

### 中文 alt 草案

交互折线图，横轴为 0–23 时，纵轴为平均每小时租车次数；两条带不同线型的线比较工作日与周末/节假日。默认显示全时段和全部组，hover 提供均值、中位数与样本数；静态文字保留同一比较任务。

<!-- exercise: interactive-encoding -->
## 形成性反馈

### 题目

要让读者比较两类日期的逐小时需求，并可核对样本数，哪套编码最清晰？

- A. `x=hr`、`y=mean_rentals`、颜色加线型表示日期类型，hover 显示样本数，筛选状态始终可见
- B. 颜色表示小时、大小表示日期类型、动画表示均值，并隐藏默认筛选
- C. 两类日期分别使用自动缩放的 facet，且不显示共同单位
- D. hover 塞入全部 17 个原始字段，正文不提供静态摘要

### 提示

每个视觉通道只承担一个任务，并检查另一个人能否知道自己正在看哪些数据。

### 即时反馈

- 选择 A：正确。位置表达主要关系，颜色与线型冗余区分类别，hover 补充样本基础，筛选可审计。
- 选择 B：小时已有自然位置，不需要再占颜色；隐藏筛选会让结论范围不可见。
- 选择 C：独立轴范围破坏面板间幅度比较，缺少单位也无法解释数值。
- 选择 D：hover 数据倾倒增加负担，且关键结论不能只存在于鼠标交互。

### 常见误区

把“交互越多”当成“分析越深”，忽略默认状态、筛选透明度、共享尺度和静态 fallback。

### 复看锚点

复看“建立逐小时交互折线”和“误导诊断与修正”。本练习只提供原因反馈，不计分、不提交、不写入学习进度，也不阻挡下一章。

## 下一步

下一章停止新增探索口径，把 schema、分组表、静态图、分布/相关证据和固定交互视图组织成“观察—证据—解释—限制”的最终报告。
