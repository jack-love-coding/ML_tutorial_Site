# Python 数据分析工具：八章中文课程母版

本目录是 `python-notebook` 课程的中文权威母版。它描述从本地数据读取到最终分析报告的完整教学顺序；阶段三据此生成 Notebook 与真实输出，阶段四再迁移到 `/learn/python-notebook` 并补齐英文。

## 固定学习问题

时间、工作日、季节、天气和用户构成怎样共同解释共享单车需求变化？

课程只做描述性分析，不训练预测模型，不作因果识别，不教授数据清洗。清洗任务交接到 `/data-lab`。

## 章节顺序

1. [`notebook-workflow`](./01-notebook-workflow.md)：Notebook 环境与可复现执行
2. [`numpy-foundations`](./02-numpy-foundations.md)：NumPy 数组与向量化统计
3. [`pandas-structures`](./03-pandas-structures.md)：Pandas 表格结构
4. [`pandas-analysis`](./04-pandas-analysis.md)：Pandas 分组分析
5. [`matplotlib-visualization`](./05-matplotlib-visualization.md)：Matplotlib 解释型图表
6. [`seaborn-statistics`](./06-seaborn-statistics.md)：Seaborn 分布、关系与相关
7. [`plotly-exploration`](./07-plotly-exploration.md)：Plotly 交互探索
8. [`analysis-report`](./08-analysis-report.md)：共享单车需求分析报告

## 数据与环境

- 数据快照：`public/datasets/python-data-tools/bike-sharing-hour.csv`
- 数据清单：`public/datasets/python-data-tools/manifest.json`
- 数据字典：`public/datasets/python-data-tools/data-dictionary.json`
- 环境清单：`public/notebooks/python-data-tools/environment.json`
- 契约版本：`python-data-tools-v1`

未来 Notebook 位于 `public/notebooks/python-data-tools/`，所以代码统一使用：

```python
DATA_PATH = Path("../../datasets/python-data-tools/bike-sharing-hour.csv")
```

不得改成远程 URL、本机绝对路径或站点根路径。

## 公共变量

| 变量 | 固定含义 |
| --- | --- |
| `DATA_PATH` | 本地 CSV 的 `Path` |
| `rides` | 完整 Bike Sharing DataFrame，`dteday` 已解析为日期 |
| `demand` | `cnt` 列的一维 NumPy 数组 |
| `hourly_demand` | 按小时汇总的需求表 |
| `workingday_hourly` | 按工作日状态与小时汇总的需求表 |
| `rider_mix` | 临时用户、注册用户及总量构成表 |
| `correlation_columns` | Pearson 相关使用的显式连续/计数字段 |
| `correlation_matrix` | Pearson 相关矩阵 |
| `fig`、`ax` | Matplotlib/Seaborn 图形对象 |
| `interactive_fig` | Plotly Figure |

派生分析使用新变量或 `.assign()` 返回值，不把 `rides` 原地改成另一种含义。

## 单元格标记

每个 Python 代码块前必须有稳定标记：

```markdown
<!-- cell: ch04-workingday-groups role: compute output: workingday-comparison -->
```

- `cell` 在全课程唯一，格式为 `chNN-kebab-case`。
- `role` 只能为 `question`、`setup`、`data`、`compute`、`visualize`、`interpret`、`limit`、`handoff`。
- `output` 只能使用 `python-data-tools-v1` 声明的权威输出 ID。
- 文档中的排列顺序就是未来 Notebook 的运行顺序。

## 权威输出

| 输出 ID | 章节 |
| --- | --- |
| `dataset-shape-schema` | `pandas-structures` |
| `workingday-comparison` | `pandas-analysis` |
| `hourly-demand-profile` | `matplotlib-visualization` |
| `rider-composition` | `matplotlib-visualization` |
| `season-weather-distribution` | `seaborn-statistics` |
| `pearson-correlation-matrix` | `seaborn-statistics` |
| `plotly-hourly-explorer` | `plotly-exploration` |
| `final-analysis-evidence` | `analysis-report` |

本阶段不写死尚未由阶段三生成的均值、峰值、相关系数或图像。结构性事实可以写入正文，但精确值必须来自权威输出。

## 形成性练习

五个练习固定挂载在 NumPy、Pandas 分析、Matplotlib、Seaborn 和 Plotly 章节。它们提供即时原因反馈，但不计分、不提交、不写入 Progress V1/V2，也不阻挡章节学习。其他章节只有阅读自检。

## 写作与证据规则

- 首次出现的术语采用“中文名（英文名）”，API 和字段名保留英文。
- 结论使用“观察—证据—解释—限制”；相关不代表因果。
- 聚合结果必须写明单位、分组键、样本数和统计口径。
- 颜色不能是唯一信息来源；图表同时提供标签和中文 alt 草案。
- 每章末尾明确把当前产物交给下一章。
