# 第四章：Pandas 分组分析

章节 ID：`pandas-analysis`

## 核心问题

怎样按时间、工作日和天气比较需求？

## 本章目标

你将把一个宽泛问题拆成筛选条件、分组键与聚合指标，使用 `groupby()`、`agg()`、命名聚合和 `pivot_table()` 生成可解释的比较表，并始终报告每组样本数。

## 前置连接

第三章已经确认 `hr`、`workingday`、`season` 和 `weathersit` 是分组语义，`cnt`、`casual` 与 `registered` 是计数。现在我们不再只看整列摘要，而是问需求随条件如何变化。

## 概念与直觉

分组分析包含三步：先选择哪些记录参与比较，再定义哪些记录属于同一组，最后决定每组计算什么。顺序不能含糊。平均每小时需求、每组总租车数和每组记录数回答的是不同问题；如果只展示结果而不写聚合口径，读者无法判断差异来自需求还是组大小。

`groupby()` 适合生成长表，`pivot_table()` 适合把一个分组维度展开成便于比较的列。二者都应由同一份明确聚合表派生，而不是维护两套计算。

## 逐步代码

### 1. 添加可读标签但保留原编码

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

`analysis_rides` 增加展示标签，`rides` 与原始编码保持不变。标签用于阅读，编码仍可用于稳定排序。

### 2. 先筛选，再说明筛选后的观察单位

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

筛选后的每一行仍代表某一天的某一个小时。先筛选再聚合意味着结果只解释 6–22 时；这个条件必须随结果一起报告。

### 3. 用命名聚合同时保留样本数与口径

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

`observations` 是参与每个“工作日状态 × 小时”组的小时记录数；`mean_rentals` 是这些记录的平均每小时租车数；`total_rentals` 会随样本数变化，不能与均值互换解释。

### 4. 生成逐小时总体表

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

排序是时间图表的前提。若把小时当普通字符串排序，可能出现 1、10、11、…、2 的错误顺序。

### 5. 用透视表形成可比列

<!-- cell: ch04-workingday-pivot role: compute -->
```python
workingday_pivot = workingday_hourly.pivot(
    index="hr",
    columns="workingday_label",
    values="mean_rentals",
).sort_index()
workingday_pivot.head()
```

透视只改变展示形状，没有改变 `mean_rentals` 的计算。索引仍是小时，两列对应工作日状态。

### 6. 比较季节与天气，同时报告组大小

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

样本稀少的组合需要谨慎解释。极端天气类别的记录数可能远少于常见天气，不能只看均值大小。

### 7. 构建用户构成表

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

`cnt` 是前两类之和，不是第三种用户。第五章绘图时会把总量作为校验或注释，而不是把三者错误堆叠。

## 运行结果与阅读

<!-- result-presentation: workingday-comparison -->
### 运行结果标题

工作日与非工作日的逐小时需求比较

### 无障碍说明

一张按工作日状态和小时排序的比较表。每行给出工作日编码与中文标签、小时、样本数、平均每小时租车数、中位数和总租车数。阅读时先锁定同一个小时，再比较两种工作日状态。

### 坐标轴与图例翻译

[]

### 分析发现

这份结果让相同小时的工作日与非工作日记录可以直接对照。`observations` 说明每个均值和中位数建立在多少条小时记录上；均值描述每条小时记录的平均需求，总量则同时受到需求水平与记录数量影响。

### 需要注意

逐小时分组只描述工作日状态与需求模式的关联，没有同时控制季节、天气和年份。不能把组间差异写成工作日状态造成的因果效果，也不能在样本数不同的情况下把总量直接当作平均需求比较。

### 静态摘要

如果比较表暂时不可用，仍应保留三步读法：确认分组键是 `workingday × hr`，检查每组 `observations`，再在相同小时比较均值与中位数。精确数值由运行时读取的正式结果提供，不在正文重复维护。

## 分析发现

- 观察：需求可以按小时和工作日状态组织为可比组。
- 运行结果：`workingday_hourly` 对每组同时记录样本数与三种聚合值。
- 解释：同一小时的均值差异可描述工作日状态与需求模式的关联。
- 限制：分组比较没有控制季节、天气或年份，不能证明工作日状态造成差异。

## 限制或误区

“先对全表聚合再筛选小时”与“先筛选记录再聚合”回答的问题可能不同。遗漏 `hr` 分组键会把全天压成两个数字；只看 `total_rentals` 则可能把记录数更多误认成每小时需求更高。

<!-- exercise: filter-groupby -->
## 形成性反馈

### 题目

要回答“工作日与非工作日在每个小时的平均租车数是否不同”，最合适的操作是哪一个？

- A. 按 `workingday` 和 `hr` 分组，对 `cnt` 同时计算 `size` 与 `mean`
- B. 只按 `workingday` 分组，对 `cnt` 求总和
- C. 先对全表 `cnt` 求均值，再筛选 `hr`
- D. 按 `cnt` 分组，计算 `workingday` 的均值

### 提示

问题中有两个比较维度和一个统计口径：工作日状态、小时、平均每小时租车数。

### 即时反馈

- 选择 A：正确。两个分组键保留逐小时比较，`size` 让均值的样本基础可见。
- 选择 B：遗漏小时维度，而且总量会受每组记录数影响。
- 选择 C：全表均值已经丢失小时与工作日信息，之后无法靠筛选恢复。
- 选择 D：把结果变量 `cnt` 当成分组键，也把类别编码的均值误作目标。

### 常见误区

常见错误包括先聚合后筛选、遗漏分组键，以及把总量、均值和样本数混为一谈。

### 复看锚点

复看“用命名聚合同时保留样本数与口径”。本练习只提供原因反馈，不计分、不提交、不写入学习进度，也不阻挡下一章。

## 下一步

下一章把 `hourly_demand`、`workingday_hourly` 和 `rider_mix` 转为诚实的静态图表，并专门诊断坐标轴与视觉编码如何误导。
