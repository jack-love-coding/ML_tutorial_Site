# Python 数据分析工具课程：阶段二八章中文母版设计

- 日期：2026-07-14
- 状态：待确认
- 范围：阶段二——八章中文课程母版
- 前置契约：`python-data-tools-v1`
- 现有模块：`python-notebook`
- 现有路由：`/learn/python-notebook`

## 1. 目的

阶段二为现有 `python-notebook` 模块编写一套可审查、可执行转换的八章中文课程母版。母版是后续 Notebook、网页双语内容和真实图表的共同内容来源，必须把学习问题、代码步骤、输出证据、解释、限制、误区反馈和章节衔接组织成完整教学闭环。

本阶段只交付文档与静态验证，不切换运行时页面，不生成正式 `.ipynb`，不生成 Matplotlib、Seaborn 或 Plotly 资产，也不补英文正文。这样可以先独立审查教学深度、变量一致性和课程边界，再由阶段三生成权威输出，由阶段四完成英文与运行时迁移。

## 2. 学习者、起点与终点

### 2.1 学习者起点

课程假设学习者已经能够：

- 阅读和编写基础 Python 代码；
- 调用库、函数与对象方法；
- 理解变量、列表、条件表达式和函数参数；
- 在 Notebook 中运行一个代码单元格。

课程不再讲解 Python 语法、安装 Python、创建虚拟环境或通用 Jupyter 入门。第一章只教授本课程所需的可复现 Notebook 工作流。

### 2.2 学习终点

完成八章后，学习者应能使用 NumPy、pandas、Matplotlib、Seaborn 和 Plotly，从本地准备好的 Bike Sharing 数据快照中提取证据，回答：

> 时间、工作日、季节、天气和用户构成怎样共同解释共享单车需求变化？

最终成果是描述性、证据化的数据分析报告，不是预测模型。学习者需要明确区分观察、数值或图表证据、合理解释与解释限制。

## 3. 权威来源与固定边界

阶段二必须直接引用阶段一已实现的 `src/data/pythonNotebookContract.ts`，不得另行定义章节、输出或练习 ID。

- 契约版本：`python-data-tools-v1`
- 数据集：`/datasets/python-data-tools/bike-sharing-hour.csv`
- 数据清单：`/datasets/python-data-tools/manifest.json`
- 数据字典：`/datasets/python-data-tools/data-dictionary.json`
- 环境清单：`/notebooks/python-data-tools/environment.json`
- 最终交接：`/data-lab`

母版中的代码只使用阶段一锁定的 Python、NumPy、pandas、Matplotlib、Seaborn 和 Plotly 版本所支持的 API。不得访问网络，不得使用本机绝对路径，不得依赖隐藏 Notebook 状态，也不得引入 `scikit-learn`、Pyodide 或额外分析库。

本课程使用已准备好的分析快照。缺失值、重复记录、异常类型、无效类别和离群值的清洗流程属于 Data Lab；阶段二可以解释这些问题会如何影响统计结果，但不得在本课程中复制清洗教程。

## 4. 文档交付结构

阶段二实现时新增以下文件：

```text
docs/curriculum-v3/python-data-tools/chinese-master/
├── README.md
├── 01-notebook-workflow.md
├── 02-numpy-foundations.md
├── 03-pandas-structures.md
├── 04-pandas-analysis.md
├── 05-matplotlib-visualization.md
├── 06-seaborn-statistics.md
├── 07-plotly-exploration.md
└── 08-analysis-report.md
```

`README.md` 是母版索引与维护契约，记录固定章节顺序、公共变量、代码单元格标记法、权威输出映射、练习策略和边界。八个章节文件承载完整中文正文，且其文件名、章节 ID 与类型化契约一一对应。

本阶段不创建第二份 JSON 课程契约。可机器验证的信息继续以 TypeScript 契约为唯一来源，Markdown 使用稳定标记与其建立引用关系。

## 5. 章节通用模板

每章必须按以下顺序形成教学闭环：

1. **核心问题**：逐字采用契约中的中文 `question`。
2. **本章目标**：说明学完后能做出的可观察行为。
3. **前置连接**：指出使用上一章的哪个对象、表或证据。
4. **概念与直觉**：先解释“为什么”，再介绍 API；首次出现的库、对象和 API 保留英文名称。
5. **逐步代码**：提供可复制的 Python 代码块，并为每个未来 Notebook 代码单元格声明稳定单元格 ID 和合法角色。
6. **输出与阅读**：引用本章绑定的权威输出 ID；在阶段三生成前只描述输出的字段、形状和应如何解读，不手写伪造精确数值。
7. **证据解释**：明确区分观察、证据和解释。
8. **限制或误区**：说明当前方法不能回答什么，以及常见错误如何识别。
9. **形成性反馈或自检**：只有契约指定的五章挂载交互练习；其余章节使用不计分的阅读自检，不伪装成第六个练习。
10. **下一步**：说明当前产物如何成为下一章输入。

每章至少包含一处具体数据切片或字段例子，不能只讲抽象 API。第 1–7 章每章至少包含 5 个按顺序可运行的 Python 代码单元格；第 8 章至少包含 2 个用于汇总证据的代码单元格。

## 6. 稳定单元格与变量约定

### 6.1 单元格标记

每个 Python 代码块前使用单独一行 HTML 注释：

```markdown
<!-- cell: ch02-demand-array role: compute -->
```

- `cell` 在整套母版中唯一，格式为 `chNN-kebab-case`。
- `role` 只能是 `question`、`setup`、`data`、`compute`、`visualize`、`interpret`、`limit`、`handoff`。
- 代码块顺序就是未来 Notebook 的执行顺序。
- 需要绑定权威输出时，在同一标记中增加 `output: <output-id>`。
- 不产生权威输出的示例不得冒用 `output-*` ID。

示例：

```markdown
<!-- cell: ch05-hourly-line role: visualize output: hourly-demand-profile -->
```

阶段二测试只验证标记、顺序和引用；阶段三负责把它们转换为真正的 Notebook cell ID 与输出文件。

### 6.2 公共变量

以下名称在八章中保持一致：

| 名称 | 含义 |
| --- | --- |
| `DATA_PATH` | 指向本地 Bike Sharing CSV 的 `pathlib.Path` |
| `rides` | 读取并解析后的完整 `pandas.DataFrame` |
| `demand` | `rides["cnt"]` 对应的一维 `numpy.ndarray` |
| `hourly_demand` | 按 `hr` 聚合的总需求表 |
| `workingday_hourly` | 按 `workingday` 与 `hr` 聚合的需求表 |
| `rider_mix` | `casual`、`registered` 与总量的用户构成表 |
| `correlation_columns` | Pearson 相关矩阵使用的显式数值列清单 |
| `correlation_matrix` | 由上述列计算的 Pearson 相关矩阵 |
| `fig`、`ax` | Matplotlib/Seaborn 静态图的 Figure 与 Axes |
| `interactive_fig` | Plotly 交互图对象 |

`rides` 不得在章节之间被原地改写成含义不同的对象。需要派生列时使用 `.assign()` 返回新对象，或为派生表使用清晰的新变量。所有展示与计算都使用原始字段名，例如 `cnt`、`casual`、`registered` 和 `workingday`；中文解释同步给出字段语义。

未来 Notebook 位于 `public/notebooks/python-data-tools/` 时，数据读取使用相对路径：

```python
DATA_PATH = Path("../../datasets/python-data-tools/bike-sharing-hour.csv")
```

网页文案可以展示公开 URL，但可执行 Notebook 代码不得使用站点根路径或远程 URL。

## 7. 八章内容设计

### 7.1 第一章：`notebook-workflow`

核心问题：怎样让分析从干净内核按顺序重跑？

必须覆盖：

- 一个问题对应一条从输入到证据再到解释的执行链；
- clean kernel、Restart and Run All、按顺序执行和隐藏状态风险；
- `Path`、固定导入、显示版本、本地数据路径；
- 读取 `rides`，检查行列规模与列名，但不提前展开 pandas 教学；
- 解释为什么禁止网络取数、绝对路径和依赖交互历史；
- 用“故意先运行下游单元格”的反例说明 `NameError` 与隐藏状态。

本章不绑定权威输出，不设置交互练习。结尾交付一个从干净内核可重复得到相同 `rides.shape` 的分析入口。

### 7.2 第二章：`numpy-foundations`

核心问题：怎样用形状、索引和向量化计算读懂一列需求数据？

必须覆盖：

- 从 `rides["cnt"]` 得到一维 `demand` 数组；
- `dtype`、`shape`、`ndim`、长度与轴的直觉；
- 位置索引、切片、布尔掩码和掩码结果形状；
- 向量化的 `min`、`max`、`mean`、`median`、百分位数与标准差；
- `axis` 如何改变结果形状，用小型二维示例解释，而不是直接把全表转成无语义矩阵；
- 为什么向量化计算比课程中的手写 Python 循环更能表达数据操作意图；
- 总体标准差与样本标准差的 `ddof` 口径差异，只说明本课程固定使用哪种描述口径，不展开统计推断。

挂载唯一的 `shape-index` 形成性练习：学习者根据数组形状和索引表达式预测输出形状或选中值。反馈必须解释轴、切片或掩码原因，并关联“把行数、列数和元素数混为一谈”的误区。

### 7.3 第三章：`pandas-structures`

核心问题：怎样保留共享单车字段的名称、类型和语义？

必须覆盖：

- `pd.read_csv`、DataFrame、Series、行索引与列标签；
- `head()`、`shape`、`columns`、`dtypes`、`info()` 与 `describe()` 各自回答的问题；
- 依据数据字典解释 17 个原始字段的角色，不把类别编码误读成连续测量；
- 使用 `pd.to_datetime` 解析 `dteday`，并用 `.assign()` 得到含明确日期类型的 `rides`；
- `cnt = casual + registered` 是数据语义不变量，不是需要学习者“清洗”的错误；
- 归一化天气字段的值不能直接当摄氏度、百分比或原始风速报告。

本章绑定 `dataset-shape-schema`。输出必须在阶段三包含行列规模、列顺序、主要 dtype 与字段角色，可由数据清单和数据字典验证。本章不设置交互练习。

### 7.4 第四章：`pandas-analysis`

核心问题：怎样按时间、工作日和天气比较需求？

必须覆盖：

- 使用布尔条件筛选但不丢失原始语义；
- 使用 `groupby()`、`agg()` 和命名聚合计算计数、均值、中位数与总量；
- 使用 `pivot_table()` 比较工作日与非工作日的逐小时需求；
- 创建可读的季节、天气和工作日标签，保留原始编码列；
- 对 `hr`、`workingday`、`season` 和 `weathersit` 做分组比较；
- 区分“每条小时记录的平均需求”与“跨记录总需求”，不得只写 `groupby` 而不解释聚合口径；
- 检查分组后的样本数，避免把组大小差异误认为需求差异。

本章绑定 `workingday-comparison`。输出应包含逐小时、工作日状态、样本数和固定聚合指标。本章挂载唯一的 `filter-groupby` 形成性练习：学习者为明确问题选择筛选条件和分组键，并解释聚合结果每一行代表什么。反馈需指出“先聚合后筛选”“遗漏分组键”或“混淆均值与总量”等误区。

### 7.5 第五章：`matplotlib-visualization`

核心问题：哪种图表能诚实地表达时段差异？

必须覆盖：

- Figure/Axes 对象模型与 `fig, ax = plt.subplots()`；
- 折线图、柱状图、散点图和直方图各自适合的比较任务；
- 使用 `hourly_demand` 绘制时间顺序明确的逐小时需求折线；
- 使用 `rider_mix` 比较临时用户和注册用户构成；
- 标题、轴标签、单位、图例、刻度和颜色之外的文本区分；
- 在相关柱状图中讨论零基线，在所有图中检查截断坐标、过密类别、双轴和装饰元素；
- reduced-motion 与静态图可读性不依赖动画。

本章绑定 `hourly-demand-profile` 和 `rider-composition` 两个 PNG 输出。阶段二只定义代码、数据输入、图表语义和检查点；阶段三必须用代码生成真实资产。本章必须并排解释一个误导性设计与修正设计，且两者使用同一数据。

挂载唯一的 `chart-choice` 形成性练习：学习者根据分析问题选择图表与编码，并诊断一个坐标轴或比例问题。反馈必须说明选择理由，而非只返回图表名称。

### 7.6 第六章：`seaborn-statistics`

核心问题：变量共同变化说明了什么，又不能说明什么？

必须覆盖：

- Seaborn 与 pandas 长表的关系，以及它对 Matplotlib Axes 的复用；
- 分布图、箱线图或小提琴图、关系图和热力图分别回答的问题；
- 用季节、天气和工作日条件比较 `cnt` 分布，同时显示或报告各组样本数；
- 描述性统计的计数、均值、中位数、分位数和离散程度；
- 协方差的方向与尺度依赖；
- Pearson 相关系数的范围、方向、强度与线性关系边界；
- 显式声明 `correlation_columns`，避免把任意类别编码机械放进相关矩阵；
- 缺失值、样本量和离群值如何改变可用样本或统计解释；
- “相关不代表因果”，不能从天气相关性证明天气导致某个精确需求变化；
- 相关矩阵的对称性、对角线与重复信息。

本章不得教授或计算置信区间、显著性检验和 p 值。若 Seaborn API 默认显示置信区间，示例必须明确关闭或避免该估计图，不能无解释地展示推断性带状区域。

本章绑定 `season-weather-distribution` PNG 和 `pearson-correlation-matrix` JSON。必须包含一个误导性相关图或热力图诊断，例如不当色阶、缺失零中心、塞入类别编码或用相关暗示因果，并给出修正。

挂载唯一的 `interpret-correlation` 形成性练习：学习者解释相关方向和强度，同时选择不能从结果推出的因果结论。反馈要同时解释正确解释与越界推断。

### 7.7 第七章：`plotly-exploration`

核心问题：交互编码怎样帮助比较人群与条件？

必须覆盖：

- Plotly Express 的 DataFrame 输入和返回 Figure；
- `x`、`y`、`color`、`facet`、`hover_data` 等视觉与交互编码；
- 用同一份聚合数据比较逐小时、工作日状态和用户构成；
- hover 用于读取精确值，facet 用于可比小图，筛选用于聚焦问题；
- 明确展示当前筛选状态，避免隐藏过滤条件改变结论；
- 控制颜色、facet 和 hover 字段数量，避免过度编码；
- 交互探索可以帮助提出问题，但悬停和缩放本身不是证据；最终报告仍引用固定可复现视图与数值；
- 关键结论必须有静态文字 fallback，不能只存在于交互操作中。

本章绑定 `plotly-hourly-explorer`，阶段三生成确定性的 Plotly figure JSON 与默认筛选状态。必须包含一个误导性或不可审计的交互设计诊断，例如隐藏筛选、颜色含义不清或 facet 比例不一致，并给出修正。

挂载唯一的 `interactive-encoding` 形成性练习：学习者为给定比较任务选择颜色、facet、hover 与筛选字段，并识别过度编码。反馈说明每个通道承担的任务。

### 7.8 第八章：`analysis-report`

核心问题：哪些证据可以支持对需求规律的解释？

必须覆盖：

- 重述最终问题，并列出时间、工作日、季节、天气和用户构成五个证据维度；
- 汇总前七章的权威输出，不在报告章偷偷引入新的分析口径；
- 每条结论使用“观察—证据—解释—限制”四段结构；
- 数值证据明确单位、聚合口径和对应输出 ID；
- 图表证据说明视觉编码与可观察模式，不用“图中显然”替代解释；
- 至少指出季节/天气与时间/用户构成可能共同变化，避免单变量因果结论；
- 给出可复现性说明：数据 hash、环境契约和从干净内核执行；
- 明确说明本报告不做预测、不做因果识别、不做统计显著性判断；
- 将缺失、重复、类型异常和离群值处理交接到 `/data-lab`。

本章绑定 `final-analysis-evidence` JSON。它应在阶段三汇总报告实际引用的输出 ID、指标名称、聚合口径和值，避免网页、Notebook 和报告三处手抄数值。本章不设置交互练习，使用最终报告自检清单。

## 8. 权威输出映射

阶段二必须保持以下唯一映射：

| 输出 ID | 章节 | 类型 | 母版职责 |
| --- | --- | --- | --- |
| `dataset-shape-schema` | `pandas-structures` | JSON | 定义 schema 输出与阅读方法 |
| `workingday-comparison` | `pandas-analysis` | JSON | 定义分组字段、样本数与聚合口径 |
| `hourly-demand-profile` | `matplotlib-visualization` | PNG | 定义逐小时静态图的代码与语义 |
| `rider-composition` | `matplotlib-visualization` | PNG | 定义用户构成图的代码与语义 |
| `season-weather-distribution` | `seaborn-statistics` | PNG | 定义条件分布图的代码与语义 |
| `pearson-correlation-matrix` | `seaborn-statistics` | JSON | 定义变量清单、相关方法与解释边界 |
| `plotly-hourly-explorer` | `plotly-exploration` | Plotly JSON | 定义交互编码与默认筛选状态 |
| `final-analysis-evidence` | `analysis-report` | JSON | 定义最终报告的证据引用清单 |

阶段二不得提交手绘占位 PNG、伪 Plotly JSON 或未经生成脚本计算的精确结果。正文可以使用“输出应包含 24 个小时类别”这类由 schema 推导的结构约束，但不得猜测均值、峰值小时或相关系数。

## 9. 五个形成性练习

只有以下章节含交互练习规范：

| 章节 | 练习 kind | 核心能力 |
| --- | --- | --- |
| `numpy-foundations` | `shape-index` | 预测形状、索引和掩码结果 |
| `pandas-analysis` | `filter-groupby` | 选择筛选、分组键和聚合口径 |
| `matplotlib-visualization` | `chart-choice` | 选择诚实图表并诊断误导 |
| `seaborn-statistics` | `interpret-correlation` | 解释相关并拒绝因果越界 |
| `plotly-exploration` | `interactive-encoding` | 选择交互编码并避免过度编码 |

每个练习规范必须提供：题目、可选答案或可判断输入、正确依据、每个错误选项对应的误区、提示、即时反馈和返回复看章节锚点。练习不计分、不提交、不写入 Progress V1/V2、不阻挡下一章，也不使用“通过”“不及格”或累计正确率等验收语言。

阶段二只写清练习内容与反馈分支，不实现 Vue 组件。

## 10. 图表诚信与无障碍要求

Matplotlib、Seaborn 和 Plotly 三章都必须包含“误导诊断—同数据修正—修正理由”的完整小节。检查项至少包括：

- 坐标轴范围、比例与单位；
- 聚合口径与样本量；
- 分类顺序与时间顺序；
- 颜色之外的标签、线型、形状或分面信息；
- 图例、标题和筛选状态；
- 不能从图表推出的因果或总体结论；
- 静态 alt 文本、关键结论文字和 reduced-motion fallback。

母版为每个权威图表提供中文 alt 文本草案。alt 描述图表类型、变量、主要可观察结构和必要限制，不堆砌全部数据点，也不把未经输出验证的峰值写死。

## 11. 中文写作与数学一致性

- 正文以自然中文讲解，API、类名、函数名和参数名保留英文原文。
- 首次出现术语时采用“中文名（英文名）”，后续保持同一译法。
- 不使用“非常简单”“显而易见”“一键”等弱化学习困难的措辞。
- 公式、代码和文字使用同一变量含义；Pearson 相关可给出公式，但符号必须逐一解释。
- 所有结论先给证据，再给解释；不使用空泛的“数据告诉我们”。
- 代码注释解释分析意图，不逐行复述 Python 语法。
- 测验反馈说明原因、关联误区并指向可复看小节。

## 12. 静态验证设计

阶段二新增 `tests/python-data-tools-chinese-master.test.mjs`，至少验证：

1. 索引和八个章节文件存在，文件顺序和章节 ID 与 TypeScript 契约一致。
2. 每章包含十项通用结构中适用的标题，并逐字包含契约核心问题。
3. 所有 Python 代码块都有唯一 `cell` ID 和合法 `role`，且满足章节最低代码单元格数。
4. 八个权威输出 ID 各出现于唯一允许章节，没有未知输出或重复绑定。
5. 恰好五个练习 kind 出现在指定章节；每个都有提示、原因反馈、误区和复看锚点。
6. Matplotlib、Seaborn、Plotly 三章都有误导诊断、修正和无障碍 fallback。
7. Seaborn 章包含描述性统计、协方差、Pearson、缺失值/样本量/离群值影响与相关非因果边界。
8. 正文不包含 `sklearn`、模型训练、远程取数、Pyodide、p 值计算、显著性检验教学或置信区间教学代码。
9. 所有数据路径、公共变量和字段名与阶段一契约及数据字典一致。
10. 第八章引用前面全部证据维度、`final-analysis-evidence` 和 `/data-lab` 交接。

测试应读取并解析现有 TypeScript 契约或其稳定源码模式，避免在测试中复制第二份章节数组。测试错误信息需指出文件、缺失标记或冲突 ID。

## 13. 规划状态校准

阶段二实现的第一笔改动需要如实更新 `.planning/ROADMAP.md` 与 `.planning/STATE.md`：

- 阶段一改为 Completed；
- 阶段二改为 Current；
- 当前焦点改为八章中文母版；
- 记录阶段一实际验证结果，不沿用旧的 270 tests 基线；
- 阶段三至五继续保持 Planned。

状态更新不能把中文母版误写为已接入运行时，也不能把 Curriculum V3.1 整体标记完成。

## 14. 阶段二明确不做

- 不修改 `src/data/pythonNotebookModule.ts` 或现有课程页面；
- 不改变 `/learn/python-notebook` 路由、导航、checkpoint 或进度行为；
- 不撰写完整英文正文；
- 不生成或提交正式 `.ipynb`；
- 不生成 PNG、Plotly JSON 或精确数值输出；
- 不实现五个练习的 Vue 组件；
- 不添加 Pyodide、浏览器 Python、后端或提交评分；
- 不教授 Python 基础、数据清洗、模型训练或预测；
- 不修改 Data Lab 或 `public/data-lab/generated/*.png`；
- 不使用 Imagegen 或 Manim。

## 15. 阶段二验收条件

阶段二仅在以下条件全部满足后完成：

1. `README.md` 与八章中文母版文件齐全，章节 ID、顺序和核心问题与 `python-data-tools-v1` 一致。
2. 每章具备核心问题、目标、前置连接、概念、逐步代码、输出阅读、证据解释、限制/误区、自检/练习和下一步组成的教学闭环。
3. 公共变量、字段语义、相对数据路径和代码执行顺序一致；代码不依赖网络、绝对路径或隐藏状态。
4. 八个权威输出各绑定到唯一指定章节，母版未伪造阶段三尚未生成的精确结果。
5. 五个形成性练习内容与反馈分支完整，且明确不计分、不提交、不持久化、不设门槛。
6. 三个可视化章节都包含同数据的误导诊断与修正，并提供 alt/fallback 草案。
7. Seaborn 统计深度严格包含允许主题、排除推断主题，并反复守住“相关不代表因果”。
8. 最终报告使用“观察—证据—解释—限制”结构，引用前章输出并交接 Data Lab，不包含预测、因果或显著性结论。
9. `tests/python-data-tools-chinese-master.test.mjs` 通过，且完整 `npm test` 通过。
10. 由于本阶段仅新增文档与静态测试，不强制运行生产构建；若实施中意外触及源码、路由或 public 资源，则必须追加 `npm run build` 和 `npm run build:pages`。
11. 规划状态准确，现有 `/learn/python-notebook` 运行时未变化。
12. 阶段二形成独立提交，diff 不包含 `docs/gpt_advice.md`、generated 图片或其他无关工作。

## 16. 后续阶段接口

阶段三以本母版的代码顺序、单元格 ID、输出绑定和中文解释为输入，生成可从干净 kernel 执行的 `.ipynb`、精确 JSON、真实 Matplotlib/Seaborn PNG 与确定性 Plotly figure JSON。阶段三若发现代码无法执行或输出无法支撑正文，应先回改母版和静态测试，再生成资产，不能只在 Notebook 中形成第二套逻辑。

阶段四将中文母版转换为完整 `LocalizedCopy` 并迁移现有运行时；阶段五验证数据、代码、Notebook、输出、网页、双语、移动端和 GitHub Pages 的一致性。任何阶段若改变章节、练习、统计边界或权威输出，都必须先更新 `python-data-tools-v1` 契约及相应测试。
