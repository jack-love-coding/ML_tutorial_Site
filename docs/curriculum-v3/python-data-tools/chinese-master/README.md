# Python 数据分析工具：八章中文课程母版

本目录是 `python-notebook` 课程的中文权威母版。它描述从本地数据读取到最终分析报告的完整教学顺序；阶段三据此生成 Notebook 与真实运行结果，阶段四再迁移到 `/learn/python-notebook` 并补齐英文。

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

已执行的中文 Notebook 位于 `public/notebooks/python-data-tools/`，所以代码统一使用：

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
- 文档中的排列顺序就是 Notebook 的运行顺序。

## 正式运行结果与呈现标记

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

正文不重复维护均值、峰值、相关系数或图像中的精确数值。结构性事实可以写入正文，但精确值必须来自绑定的正式运行结果。

每个绑定结果必须紧跟产生它的代码，并声明一个唯一呈现标记：

```markdown
<!-- result-presentation: workingday-comparison -->
### 运行结果标题
...
### 无障碍说明
...
### 坐标轴与图例翻译
[]
### 分析发现
...
### 需要注意
...
### 静态摘要
...
```

- 六个字段都必须非空，并按上述顺序出现。
- JSON 表格没有坐标轴或图例时，`坐标轴与图例翻译` 必须明确写成 `[]`。
- PNG 或 Plotly 图必须逐行写出坐标轴与图例文字的页面翻译，例如 ``- `x-axis`：原图“小时” → 页面“小时”``。
- `分析发现` 说明如何阅读结果，`需要注意` 守住解释边界，`静态摘要` 在资源不可用时保留同一核心结论。
- 呈现文字只存在于中英文母版，后续 typed projection 与组件不得再手写第二份。

## 静态教学提示

五个 contract 学习停顿固定挂载在 NumPy、Pandas 分析、Matplotlib、Seaborn 和 Plotly 章节。保留原有 `exercise` 标记作为稳定 kind，再紧跟一个完整的教学提示标记：

```markdown
<!-- exercise: shape-index -->
<!-- teaching-prompt: id=shape-index kind=shape-index chapter=numpy-foundations scored=false submitted=false persistedToProgress=false gatesChapter=false -->
## 想一想
...
### 参考思路
...
### 常见误区
...
### 复看
...
```

- `id`、`kind` 与 `chapter` 必须逐项匹配 `python-data-tools-v1` 的挂载顺序；V1 中提示 ID 与 kind 使用同一个稳定值。
- `想一想`、`参考思路`、`常见误区` 与 `复看` 都必须有当前语言的完整内容，不能是占位符或只给结论。
- `scored`、`submitted`、`persistedToProgress` 与 `gatesChapter` 四个策略必须全部为 `false`。
- 提示是紧邻正文的静态讲解，不包含答案输入、选项选择、提交、判分、重置、完成状态、存储或网络行为。

## 八章完整性门槛

- 八个章节文件必须按本索引顺序存在并保持 UTF-8；乱码、空字段和未完成标记都会使检查失败。
- 五个静态教学提示必须依次挂载到 `shape-index`、`filter-groupby`、`chart-choice`、`interpret-correlation`、`interactive-encoding`，不能重复或改序。
- 八个正式运行结果必须各有一个完整呈现标记；JSON 使用显式空翻译列表，PNG 与 Plotly 必须提供坐标轴、图例或 hover 的页面翻译。
- Python 代码、公式、来源单元格、结果 ID 和资源绑定与 Stage 3 保持一致；本阶段只补充网页教学所需的双语呈现结构。
- 内容始终停留在描述性分析：不实现清洗、模型训练、推断统计、因果识别或浏览器 Python；清洗继续衔接 `/data-lab`。

## 写作与分析规则

- 首次出现的术语采用“中文名（英文名）”，API 和字段名保留英文。
- 结论使用“观察—运行结果—解释—限制”；相关不代表因果。
- 聚合结果必须写明单位、分组键、样本数和统计口径。
- 颜色不能是唯一信息来源；图表同时提供标签和中文 alt 草案。
- 每章末尾明确把当前产物交给下一章。
