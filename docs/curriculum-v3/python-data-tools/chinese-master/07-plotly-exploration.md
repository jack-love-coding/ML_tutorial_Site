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

交互是查看运行结果的方式，不会改变结果本身。缩放不会让关系变强，hover 不会证明因果，隐藏筛选也不能作为报告前提。最终结论需要一个任何人打开都能复现的默认状态。

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
default_filter_state = {
    "hours": [0, 23],
    "workingday_values": [0, 1],
    "metric": "mean_rentals",
    "hidden_groups": [],
}
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

<!-- result-presentation: plotly-hourly-explorer -->
### 运行结果标题

工作日与非工作日的逐小时交互比较

### 无障碍说明

交互折线图以 0–23 时为横轴、平均每小时租车次数为纵轴，用颜色和线型共同区分工作日与周末/节假日。默认显示全部小时和两组日期类型；统一 hover 在同一小时列出组别、均值、中位数与样本数。

### 坐标轴与图例翻译

- `title`：工作日状态下的逐小时平均需求
- `x-axis`：小时（0–23）
- `y-axis`：平均每小时租车次数
- `legend-title`：日期类型
- `group-0`：周末或节假日
- `group-1`：工作日
- `hover-hour`：小时
- `hover-mean`：平均每小时租车次数
- `hover-median`：中位数
- `hover-observations`：小时记录数
- `line-style`：实线与虚线重复表示两类日期，让分组不只依赖颜色

### 分析发现

默认视图用于对齐同一小时的两组位置，统一 hover 用于核对均值、中位数与样本数。小时范围、可见组别和指标必须始终显示在筛选摘要中；临时缩放或隐藏组别只改变当前视图，不覆盖默认状态。

### 需要注意

交互降低读取精确值的成本，但不会增加因果信息。缩放、隐藏图例和筛选会改变可见范围，报告不能把未经说明的临时视图当成可复现结论，也不能从两条共同变化的线推出日期类型造成需求差异。

### 静态摘要

如果交互脚本或图形资源暂时不可用，页面仍应显示默认筛选：小时范围 0–23、工作日与周末/节假日两组、指标为平均每小时租车次数、没有隐藏组；等价表格按小时列出两组的均值、中位数和样本数，并保留相同解释边界。

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
default_filter_state
```

阶段三将 Figure JSON 与这份状态一起保存。默认视图展示全 24 小时和两类日期；如果网页允许筛选，当前条件必须在界面和引用结果时可见。

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

## 运行结果与阅读

读取交互图时先确认小时范围、可见组别和当前指标，再对齐同一小时的两组位置，最后用 hover 查看均值、中位数和样本数。用户操作后的临时视图不能覆盖默认状态；交互不可用时，筛选摘要与等价表格继续回答同一个比较问题。

## 分析发现

- 观察：交互折线允许在同一小时读取不同日期类型的聚合值。
- 运行结果：位置、线型、颜色和 hover 都来自 `plotly_data` 的明确字段。
- 解释：交互降低读取精确值的成本，也帮助发现值得写进报告的时间段。
- 限制：缩放、隐藏图例或筛选会改变看到的范围；它们不能自动成为可复现结论。

## 限制或误区

### 误导诊断与修正

误导版本默认只展示工作日却不显示筛选标签，两个 facet 各自缩放 y 轴，同时用颜色、点大小和动画编码无关字段。读者会把过滤后的局部模式当全量结论，也无法直接比较面板。

修正版本默认显示全部组、把筛选写进 `default_filter_state`、共享 y 轴，只用颜色加线型区分日期类型，并把精确值与样本数放进 hover。每次引用当前视图都附筛选状态。

### 中文 alt 草案

交互折线图，横轴为 0–23 时，纵轴为平均每小时租车次数；两条带不同线型的线比较工作日与周末/节假日。默认显示全时段和全部组，hover 提供均值、中位数与样本数；静态文字保留同一比较任务。

<!-- exercise: interactive-encoding -->
<!-- teaching-prompt: id=interactive-encoding kind=interactive-encoding chapter=plotly-exploration scored=false submitted=false persistedToProgress=false gatesChapter=false -->
## 想一想

要让读者比较两类日期的逐小时需求并核对样本数，位置、分组、hover 和筛选摘要各自应该承担什么任务？如果交互图暂时不可用，页面还必须保留哪些信息？

### 参考思路

用 `hr` 和 `mean_rentals` 决定横纵位置，用颜色加线型重复区分日期类型，在 hover 中保留均值、中位数和样本数，并持续显示小时范围与可见组别。交互不可用时，静态摘要和等价表格仍要写明默认范围、分组、指标与同一解释边界。

### 常见误区

把“交互越多”当成“分析越深”，忽略默认状态、筛选透明度、共享尺度和静态 fallback。

### 复看

复看本章“建立逐小时交互折线”“把默认筛选状态写成数据”和“记录静态 fallback”，确认当前视图与默认视图的区别。

## 下一步

下一章停止新增探索口径，把 schema、分组表、静态图、分布/相关结果和固定交互视图组织成“观察—运行结果—解释—限制”的最终报告。
