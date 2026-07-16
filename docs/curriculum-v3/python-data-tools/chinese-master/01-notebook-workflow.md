# 第一章：Notebook 环境与可复现执行

章节 ID：`notebook-workflow`

## 核心问题

怎样让分析从干净内核按顺序重跑？

## 本章目标

你将建立一条可以“Restart Kernel and Run All”的执行链：固定导入、确认版本、定位本地数据、读取表格、检查入口。任何人拿到同一仓库和锁定环境，都能从第一格运行到最后一格，不需要猜测你之前点过什么。

## 前置连接

课程假设你已经会调用函数和库。本章不重讲 Python 语法，而是把这些基础放进一个可复现的数据分析工作流。

## 概念与直觉

Notebook 看起来像文档，实际由一个持续存活的内核（kernel）保存变量。页面上的单元格顺序不一定等于内核的执行顺序：如果先运行第十格再回到第二格，屏幕可能暂时有结果，但干净内核无法复现。

可靠分析遵循一条依赖链：问题决定需要的数据，数据经过显式计算产生运行结果，运行结果支持解释，最后再声明限制。每个变量必须在第一次使用前创建；数据来自仓库内固定快照；版本、路径和输入都能检查。

## 逐步代码

### 1. 固定导入并显示版本

<!-- cell: ch01-imports role: setup -->
```python
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
import plotly
import seaborn as sns

{
    "numpy": np.__version__,
    "pandas": pd.__version__,
    "matplotlib": matplotlib.__version__,
    "seaborn": sns.__version__,
    "plotly": plotly.__version__,
}
```

版本不是装饰信息。图表默认值和 API 行为可能随版本变化；环境清单锁定的版本使阶段三可以重新生成同一运行结果。

### 2. 用相对路径定位数据

<!-- cell: ch01-data-path role: setup -->
```python
DATA_PATH = Path("../../datasets/python-data-tools/bike-sharing-hour.csv")
DATA_PATH
```

相对路径从 Notebook 所在目录出发。不要替换成 `/Users/...` 之类的本机路径，也不要在运行时访问 UCI 网站：前者只能在一台电脑工作，后者会让输入随网络和上游变化。

### 3. 在读取前验证文件存在

<!-- cell: ch01-path-check role: data -->
```python
if not DATA_PATH.is_file():
    raise FileNotFoundError(
        f"找不到课程数据：{DATA_PATH}。请从仓库内的 notebooks 目录运行。"
    )
```

尽早失败比在下游得到含糊错误更有用。错误信息同时指出缺失对象和修复方向。

### 4. 建立唯一的 `rides` 入口

<!-- cell: ch01-load-rides role: data -->
```python
rides = pd.read_csv(DATA_PATH)
rides.shape, rides.columns.tolist()
```

这里先把 `rides` 当作原始表格入口；第三章再解析日期并系统理解列类型。后续章节不重新下载或读取另一份数据。

### 5. 记录最小可复现检查

<!-- cell: ch01-repro-check role: compute -->
```python
repro_check = {
    "rows": len(rides),
    "columns": rides.shape[1],
    "first_record_id": int(rides.loc[0, "instant"]),
    "last_record_id": int(rides.loc[rides.index[-1], "instant"]),
}
repro_check
```

这不是完整数据验证器；阶段一脚本已经负责 hash、schema 和不变量。它只是让学习者快速确认当前 Notebook 读到了预期形状和记录范围。

### 6. 把隐藏状态变成可见风险

<!-- cell: ch01-hidden-state-demo role: limit -->
```python
# 如果在创建 rides 之前先执行 `rides.head()`，干净内核会抛出 NameError。
# 正确做法不是“多点几次”，而是 Restart Kernel and Run All，修复依赖顺序。
hidden_state_rule = "变量必须在首次使用前由上游单元格创建"
hidden_state_rule
```

## 运行结果与阅读

本章不绑定正式运行结果。运行后应看到锁定库版本、本地相对路径、表格形状和有序字段名。真正需要报告的精确 schema 将在第三章由 `dataset-shape-schema` 生成。

## 分析发现

- 观察：干净内核只知道从上到下实际执行过的定义。
- 运行结果：版本字典、存在性检查和 `repro_check` 都由当前输入现场计算。
- 解释：显式环境、路径与顺序减少“只在作者电脑上能跑”的偶然状态。
- 限制：能从头运行不代表分析结论正确；我们仍要检查字段语义、聚合口径和图表表达。

## 限制或误区

常见误区是把单元格左侧出现过的运行结果当成“可复现”。它可能来自旧内核，甚至来自已经修改过的代码。判断标准只有一个：重启内核后，按文档顺序一次运行是否成功并产生同类运行结果。

另一个误区是每章重新读取或复制数据。那会形成多个来源。全课程只维护 `DATA_PATH` 和 `rides` 这一条入口。

## 阅读自检

关闭并重启内核后，如果第三格提示找不到文件，你应该先检查 Notebook 的位置和相对路径，而不是改成绝对路径。若第六格以前引用了尚未创建的变量，应调整依赖顺序，而不是依靠旧内核补救。

## 下一步

下一章从 `rides["cnt"]` 提取一维数组 `demand`，用 NumPy 的形状、索引和向量化统计理解“每小时总租车数”这一列。
