# 第三章：Pandas 表格结构

章节 ID：`pandas-structures`

## 核心问题

怎样保留共享单车字段的名称、类型和语义？

## 本章目标

你将区分 Series 与 DataFrame，使用 `shape`、`columns`、`dtypes`、`info()` 和 `describe()` 检查表格，并借助数据字典判断哪些数字是计数、连续测量或类别编码。

## 前置连接

NumPy 让我们高效计算 `cnt` 数组，却主动放下了其他列的语义。pandas 用列标签和类型把时间、天气、日历与用户构成重新组织到同一张表中。

## 概念与直觉

DataFrame 是带行索引与列标签的二维表；选取一列通常得到 Series。字段存储类型只说明计算机如何保存值，不足以说明业务语义。例如 `season` 是整数类别，不应因为 dtype 是整数就计算“平均季节”；`temp` 是归一化连续变量，也不能直接报告成摄氏度。

检查表格要回答不同问题：`head()` 看样例，`shape` 看规模，`columns` 看 schema，`dtypes` 和 `info()` 看存储与非空概况，`describe()` 看数值分布。它们互补，任何一个都不是完整数据理解。

## 逐步代码

### 1. 显式解析日期并保持唯一 `rides`

<!-- cell: ch03-parse-date role: data -->
```python
rides = pd.read_csv(DATA_PATH).assign(
    dteday=lambda frame: pd.to_datetime(frame["dteday"], format="%Y-%m-%d")
)
rides.head(3)
```

`.assign()` 返回新 DataFrame，并让 `dteday` 从文本变成日期时间。其他 16 个原始字段保持原名和原值。

### 2. 检查规模、索引和列顺序

<!-- cell: ch03-shape-columns role: compute -->
```python
table_structure = {
    "shape": rides.shape,
    "index_type": type(rides.index).__name__,
    "columns": rides.columns.tolist(),
}
table_structure
```

列顺序来自阶段一 schema。行索引只是当前表格的定位工具，业务上的唯一记录编号是 `instant`。

### 3. 比较 DataFrame 与 Series

<!-- cell: ch03-series-dataframe role: compute -->
```python
count_series = rides["cnt"]
count_frame = rides[["cnt"]]

{
    "series_type": type(count_series).__name__,
    "series_shape": count_series.shape,
    "frame_type": type(count_frame).__name__,
    "frame_shape": count_frame.shape,
}
```

单中括号选一列得到一维 Series；列名列表保留二维 DataFrame。二者的形状不同，后续 API 返回值也可能不同。

### 4. 用 dtype 和非空计数检查存储

<!-- cell: ch03-dtypes-info role: compute -->
```python
rides.info()
rides.dtypes.astype(str).to_dict()
```

`info()` 的非空计数是快照检查，不是清洗练习。如果以后发现缺失，应进入 Data Lab 定义处理策略，而不是在本课程静默删除记录。

### 5. 分角色描述字段

<!-- cell: ch03-field-roles role: interpret -->
```python
field_roles = {
    "identifier_time": ["instant", "dteday", "yr", "mnth", "hr", "weekday"],
    "calendar_category": ["season", "holiday", "workingday"],
    "weather_category": ["weathersit"],
    "normalized_continuous": ["temp", "atemp", "hum", "windspeed"],
    "count": ["casual", "registered", "cnt"],
}
field_roles
```

这份角色表来自数据字典。它决定哪些列适合求均值、哪些列需要映射标签、哪些列只能作为标识或分组键。

### 6. 用 `describe()` 比较数值摘要

<!-- cell: ch03-describe-counts role: compute -->
```python
rides[["casual", "registered", "cnt"]].describe(
    percentiles=[0.25, 0.5, 0.75]
)
```

这里主动只选计数字段，避免把 `season`、`workingday` 等整数类别的均值误当成有意义测量。

### 7. 验证用户构成不变量

<!-- cell: ch03-schema-output role: compute output: dataset-shape-schema -->
```python
composition_matches = rides["cnt"].eq(
    rides["casual"] + rides["registered"]
)

dataset_shape_schema = {
    "rows": int(rides.shape[0]),
    "columns": int(rides.shape[1]),
    "column_order": rides.columns.tolist(),
    "dtypes": rides.dtypes.astype(str).to_dict(),
    "field_roles": field_roles,
    "all_counts_reconcile": bool(composition_matches.all()),
}
dataset_shape_schema
```

## 输出与阅读

`dataset-shape-schema` 在阶段三保存为 JSON。它应包含实际行列规模、列顺序、主要 dtype、字段角色和 `cnt = casual + registered` 的全表检查结果。正文不手抄精确规模；生成脚本绑定数据 hash 后，它才成为网页和报告共同引用的权威值。

## 证据解释

- 观察：表中同时存在时间、类别、归一化连续量和计数。
- 证据：schema 输出把存储结构与数据字典角色并列记录。
- 解释：字段角色决定合适的筛选、聚合和图表，而 dtype 本身不能替代语义。
- 限制：schema 正确只表示结构与不变量通过，不表示每种分析口径都合理。

## 限制或误区

不要把 `weathersit=4` 理解成“天气是 `weathersit=2` 的两倍”，也不要把 `temp=0.5` 直接写成 0.5 摄氏度。类别编码表达等级标签；归一化字段需要依据数据字典换算后才有原始单位。

## 阅读自检

如果你想比较注册用户和临时用户的租车次数，选择 `registered` 与 `casual` 是因为它们是计数字段；如果你想按季节比较，应把 `season` 当分组键并映射标签，而不是计算它的平均值。

## 下一步

下一章保留这些字段语义，使用筛选、`groupby()`、命名聚合和 `pivot_table()` 比较不同小时与工作日状态。
