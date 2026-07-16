# 第二章：NumPy 数组与向量化统计

章节 ID：`numpy-foundations`

## 核心问题

怎样用形状、索引和向量化计算读懂一列需求数据？

## 本章目标

你将把 `cnt` 列转换为一维 NumPy 数组，读懂 `dtype`、`shape` 和 `ndim`，用位置、切片与布尔掩码选择数据，并用向量化统计描述已经观察到的每小时需求。

## 前置连接

第一章已经从唯一的本地快照创建 `rides`。本章不重新读数据，只关注表格中语义明确的一列：`cnt` 表示每条小时记录的总租车次数。

## 概念与直觉

NumPy 的数组（array）把同一种数据类型按形状组织起来。一维数组的 `shape` 是 `(记录数,)`，不是“记录数乘一列”的二维表。`ndim` 告诉我们有多少条轴；索引或聚合沿哪条轴进行，会决定结果保留什么形状。

向量化（vectorization）是把操作直接表达为“对数组应用规则”。`demand[demand >= 500]` 清楚地说明筛选条件，而不需要手写循环、维护临时列表。它既贴近分析意图，也减少索引和累加器错误。

## 逐步代码

### 1. 从有名称的列得到一维数组

<!-- cell: ch02-demand-array role: data -->
```python
demand = rides["cnt"].to_numpy()
{
    "dtype": str(demand.dtype),
    "shape": demand.shape,
    "ndim": demand.ndim,
    "size": demand.size,
}
```

`dtype` 说明元素存储类型；`shape` 说明每条轴的长度；`size` 是元素总数。这里名称 `demand` 继承了 `cnt` 的语义，避免把整个 DataFrame 转成失去列名的矩阵。

### 2. 位置索引与切片

<!-- cell: ch02-index-slice role: compute -->
```python
first_value = demand[0]
first_six_values = demand[:6]
last_value = demand[-1]

first_value, first_six_values, last_value
```

单个整数索引得到标量；切片得到新的数组，因此 `demand[0].shape` 不存在，而 `demand[:6].shape` 是 `(6,)`。

### 3. 布尔掩码保留满足条件的记录

<!-- cell: ch02-boolean-mask role: compute -->
```python
high_demand_mask = demand >= 500
high_demand = demand[high_demand_mask]

{
    "mask_shape": high_demand_mask.shape,
    "selected_shape": high_demand.shape,
    "selected_count": int(high_demand_mask.sum()),
}
```

掩码与原数组形状相同，每个位置只有 `True` 或 `False`。筛选结果仍是一维，但长度由满足条件的记录数决定。

### 4. 用向量化统计描述已观察数据

<!-- cell: ch02-vectorized-summary role: compute -->
```python
demand_summary = {
    "minimum": int(demand.min()),
    "maximum": int(demand.max()),
    "mean": float(demand.mean()),
    "median": float(np.median(demand)),
    "p25": float(np.percentile(demand, 25)),
    "p75": float(np.percentile(demand, 75)),
    "population_std": float(demand.std(ddof=0)),
}
demand_summary
```

均值概括总量平衡点，中位数抗极端值影响更强，四分位数描述中间一半记录的范围，标准差描述围绕均值的离散程度。本课程在描述完整快照时固定使用 `ddof=0`；`ddof=1` 对应不同的样本估计口径，不在这里展开推断。

### 5. 用小矩阵理解 `axis`

<!-- cell: ch02-axis-demo role: compute -->
```python
axis_demo = np.array([
    [10, 20, 30],
    [40, 50, 60],
])

{
    "shape": axis_demo.shape,
    "sum_axis_0": axis_demo.sum(axis=0).tolist(),
    "sum_axis_1": axis_demo.sum(axis=1).tolist(),
}
```

`axis=0` 压缩行轴，为每一列留下结果；`axis=1` 压缩列轴，为每一行留下结果。这个小矩阵只用于理解形状，不替代保留字段语义的 pandas 表格。

### 6. 比较向量化表达与手写循环

<!-- cell: ch02-vectorization-check role: interpret -->
```python
vectorized_count = int((demand >= 500).sum())
same_result = vectorized_count == len(high_demand)
same_result
```

一个布尔表达式同时给出筛选和计数依据。我们验证两种向量化表达得到一致结果，而不是再维护一套循环实现。

## 运行结果与阅读

本章不绑定权威输出，也不把当前统计值写进正文。阶段三运行时会保留这些单元格的真实结果。阅读任何数组输出时，先确认变量语义，再看 `shape` 和统计口径；不要只盯一个均值。

## 分析发现

- 观察：`cnt` 是每条小时记录的非负计数。
- 运行结果：`demand_summary` 同时展示范围、中心与离散，不依赖人工抄写。
- 解释：分位数与标准差帮助识别需求分布并非由一个“典型值”完整代表。
- 限制：一维数组没有时间、天气或用户类别上下文，不能解释需求为什么变化。

## 限制或误区

把 `shape`、`size` 和 `ndim` 混为一谈会导致索引错误；把类别编码一起转成数值矩阵再求均值，会制造没有语义的结果。NumPy 擅长同类型数值计算，但字段名称和类别含义要由 pandas 与数据字典保留。

<!-- exercise: shape-index -->
<!-- teaching-prompt: id=shape-index kind=shape-index chapter=numpy-foundations scored=false submitted=false persistedToProgress=false gatesChapter=false -->
## 想一想

已知 `window = demand[24:48]`，并且 `mask = window >= 500`。在不运行代码的情况下，依次判断 `window`、`mask` 与 `window[mask]` 的维数和形状分别由什么决定。

### 参考思路

`demand` 是一维数组，切片不会增加新的轴，所以 `window.shape` 是 `(24,)`。比较运算逐元素执行，`mask` 与 `window` 同形状，也是 `(24,)`。布尔筛选会保留 `True` 对应的元素，因此 `window[mask]` 仍是一维，形状写作 `(k,)`；`k` 由满足条件的元素数量决定，范围是 0 到 24。

### 常见误区

“一列数据必然是二维”混淆了表格列与数组维度；“切片不改变形状”混淆了维数与轴长度；“掩码筛选保留原长度”则混淆了条件数组和筛选结果。

### 复看

复看本章“位置索引与切片”和“布尔掩码保留满足条件的记录”，对照 `shape`、维数与筛选后元素数量的区别。

## 下一步

下一章回到 pandas，用 Series、DataFrame、列标签和数据字典恢复时间、类别、天气与用户构成语义，并生成第一个权威 schema 输出。
