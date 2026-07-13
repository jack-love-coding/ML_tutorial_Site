# Python 数据分析工具课程：阶段一数据与执行契约设计

- 日期：2026-07-14
- 状态：待用户审阅
- 范围：阶段一——数据与执行契约
- 现有模块：`python-notebook`
- 现有路由：`/learn/python-notebook`

## 1. 目的

阶段一为现有 `python-notebook` 模块建立唯一、可验证的数据与执行基线。后续八章中文课程、英文内容、真实图表和可下载 Notebook 都必须由这套基线派生，不能各自维护数据副本、环境版本或输出口径。

本阶段不改写课程页面，不删除现有章节，也不改变运行时行为。它只交付可审查的数据快照、来源记录、环境锁定、类型化课程骨架、Notebook 执行约束和自动验证。

## 2. 已确认的课程方向

现有模块保留 `python-notebook` ID 与 `/learn/python-notebook` URL，并逐步重构为“使用数据分析工具完成一次可复现分析”。课程假设学习者已经能够阅读和编写基础 Python，知道如何调用库和函数，因此不再教授 Python 语法基础。

课程使用同一份 UCI Bike Sharing 小时级数据贯穿八章：

1. `notebook-workflow`：Notebook 环境与可复现执行
2. `numpy-foundations`：NumPy 数组、`dtype`、`shape`、索引与向量化统计
3. `pandas-structures`：Series、DataFrame、读取数据与列语义
4. `pandas-analysis`：筛选、日期时间、`groupby`、聚合、透视与派生列
5. `matplotlib-visualization`：Matplotlib 基础图表、编码选择与误导性图表修正
6. `seaborn-statistics`：Seaborn 分布/关系图、描述统计、协方差与 Pearson 相关
7. `plotly-exploration`：Plotly 的 hover、颜色、facet 与筛选
8. `analysis-report`：解释共享单车需求规律并交接到 Data Lab

最终任务是解释需求规律，不训练或评估预测模型。`scikit-learn`、模型训练、数据清洗和脏数据修复不属于该模块；清洗案例继续由 Data Lab 承担。

## 3. 权威数据契约

### 3.1 来源与许可

唯一上游来源为 UCI Machine Learning Repository 的 Bike Sharing Dataset：

- 数据集页面：`https://archive.ics.uci.edu/dataset/275/bike+sharing+dataset`
- DOI：`10.24432/C5W894`
- 许可：Creative Commons Attribution 4.0 International（CC BY 4.0）
- 权威文件：上游压缩包中的 `hour.csv`

实现阶段将 `hour.csv` 复制为仓库内不可变快照：

`public/datasets/python-data-tools/bike-sharing-hour.csv`

课程、Notebook、测试和图表生成均读取这个本地快照。浏览器运行时与 Notebook 执行时不得从 UCI 或其他远程地址取数。

### 3.2 来源清单

`public/datasets/python-data-tools/manifest.json` 必须记录：

- 数据集名称、UCI 页面、直接下载来源和 DOI
- 许可证标识及许可证 URL
- 上游文件名与本地公开路径
- 获取日期
- UTF-8 编码和逗号分隔格式
- SHA-256、字节数、数据行数和列数
- 完整列顺序
- 数据字典版本

SHA-256、字节数和实际行数必须从下载后的快照计算，不能手工抄写 UCI 页面上的概览数字。任何上游更新都必须通过显式更新流程生成新清单，不能静默替换快照。

### 3.3 列与语义

数据快照必须严格包含以下有序列：

`instant, dteday, season, yr, mnth, hr, holiday, weekday, workingday, weathersit, temp, atemp, hum, windspeed, casual, registered, cnt`

数据字典必须为每列记录英文原名、中文名称、类型、取值范围或类别映射、单位/归一化说明和教学角色。至少区分：

- 标识与时间：`instant`、`dteday`、`yr`、`mnth`、`hr`、`weekday`
- 日历类别：`season`、`holiday`、`workingday`
- 天气类别：`weathersit`
- 归一化连续变量：`temp`、`atemp`、`hum`、`windspeed`
- 计数：`casual`、`registered`、`cnt`

本课程不得向快照注入缺失值、重复记录、错误类别或离群点来模拟清洗任务。

### 3.4 数据不变量

离线验证器必须检查并在失败时以可操作信息退出：

- 列名与列顺序完全一致
- `instant` 非空且唯一
- `dteday` 可解析为日期，`hr` 位于 0–23
- `season`、`yr`、`mnth`、`holiday`、`weekday`、`workingday`、`weathersit` 均落在数据字典允许范围
- `temp`、`atemp`、`hum`、`windspeed` 为有限数值且落在声明的归一化范围
- `casual`、`registered`、`cnt` 为非负整数
- 每行满足 `cnt = casual + registered`
- 实际 SHA-256、字节数、行数、列数和清单一致

阶段一不“修复”失败数据；验证失败即阻止后续权威输出生成。

## 4. 环境与复现契约

### 4.1 锁定版本

权威输出环境锁定为：

| 组件 | 版本 |
| --- | --- |
| Python | 3.12.13 |
| NumPy | 2.4.6 |
| pandas | 3.0.3 |
| Matplotlib | 3.10.9 |
| Seaborn | 0.13.2 |
| Plotly | 6.9.0 |
| nbformat | 5.10.4 |
| JupyterLab | 4.6.1 |

Python 版本写入环境清单，Python 包以严格等号写入可安装的 `requirements.txt`。环境清单同时记录生成平台、生成时间、数据 SHA-256 和输出契约版本。后续若升级任一版本，必须重新生成并验证所有权威输出。

公开位置固定为：

- `public/notebooks/python-data-tools/environment.json`
- `public/notebooks/python-data-tools/requirements.txt`

### 4.2 执行原则

后续正式 Notebook 必须满足：

- 从干净 kernel 按单元格顺序一次运行成功
- 不依赖隐藏变量、交互历史或本机绝对路径
- 仅通过项目内相对路径读取数据，不访问网络
- 随机操作必须声明固定种子；课程主分析原则上使用确定性全量计算
- 数值 JSON 不得含 `NaN` 或 `Infinity`
- 图表不得进行未写入清单的隐藏抽样
- 每个权威单元格具有稳定 ID 和声明的输出类型

单元格角色限定为 `question`、`setup`、`data`、`compute`、`visualize`、`interpret`、`limit`、`handoff`。阶段一只定义结构和验证规则，不交付完整教学 Notebook。

## 5. 类型化课程与输出契约

### 5.1 代码边界

阶段一拟新增以下职责边界：

- `src/data/pythonNotebookContract.ts`：类型化模块元数据、八章顺序、Notebook 单元格角色和权威输出 ID
- `scripts/python-data-tools/`：获取/更新、数据校验和契约生成脚本
- `public/datasets/python-data-tools/`：CSV 快照、数据字典和来源清单
- `public/notebooks/python-data-tools/`：环境清单与依赖锁定
- `docs/curriculum-v3/python-data-tools/sources.md`：来源、许可、归因和更新方法
- `tests/python-data-tools-contract.test.mjs`：静态资源、类型化契约和脚本行为测试

所有学习者可见的标题、说明和标签使用项目现有 `LocalizedCopy`，同时提供 `zh-CN` 与 `en`。脚本内部诊断信息不要求进入课程翻译结构。

阶段一不会把现有 `src/data/pythonNotebookModule.ts` 切换到新契约；运行时接线留到后续内容与运行时重构阶段。

### 5.2 权威输出 ID

契约至少声明以下确定性输出，供后续 Notebook、网页代码块和真实图表共同引用：

- `dataset-shape-schema`：行列规模、类型与字段角色
- `hourly-demand-profile`：每小时总需求分布/聚合
- `workingday-comparison`：工作日与非工作日的时段差异
- `season-weather-distribution`：季节、天气与需求分布
- `rider-composition`：临时用户与注册用户构成
- `pearson-correlation-matrix`：声明变量上的 Pearson 相关矩阵
- `plotly-hourly-explorer`：带 hover、颜色、facet 与筛选状态的交互图
- `final-analysis-evidence`：最终报告使用的关键数值证据

每项输出需声明 ID、所属章节、输出类型、输入数据 SHA-256、环境契约版本和生成脚本入口。Plotly 产物后续保存为 figure JSON，并另外保存可测试的确定性筛选状态；Matplotlib 和 Seaborn 产物后续必须由真实代码生成，不能用手工绘图替代。

## 6. 教学边界与 Data Lab 交接

可视化章节必须把“选择合适编码、识别误导、解释限制”作为核心能力，而不只是展示 API。Matplotlib、Seaborn 和 Plotly 各自都要包含误导性图表诊断与修正。

Seaborn 章节允许即时补充描述统计、协方差、Pearson 相关、缺失值/样本量/离群点对解释的影响，以及“相关不等于因果”。置信区间、显著性检验和 p 值不在本模块范围。

八章最终产出是对 Bike Sharing 需求规律的证据化解释，并明确说明本课程使用的是已准备好的分析快照。需要处理缺失、重复、异常类型和离群值时，学习路径跳转到 Data Lab；本阶段不复制 Data Lab 的清洗流程。

后续五个章节内形成性练习分别覆盖 NumPy、Pandas、Matplotlib、Seaborn 和 Plotly。它们提供即时原因反馈，但不计分、不提交、不写进度，也不作为章节门槛。阶段一只在契约中预留练习挂载点，不实现练习。

## 7. 错误处理与维护

- 获取脚本必须使用固定上游来源，并验证压缩包内存在预期文件。
- 快照、清单、数据字典或环境文件缺失时，验证命令必须失败。
- 上游 hash、schema 或数据不变量漂移时，更新流程必须要求人工审查新差异。
- 验证信息需指出具体文件、列、规则和观测值，不能只返回通用失败。
- 浏览器端不承担数据契约验证，也不远程补取缺失文件。
- GitHub Pages 的 `BASE_URL` 兼容由后续运行时接线阶段通过现有 public-path 工具处理。

## 8. 规划状态校准

当前 `.planning/STATE.md` 与 `.planning/ROADMAP.md` 落后于已经交付的 AI Overview 与 Math-to-Code 工作。阶段一实现时需要：

- 把已交付项目标记为已完成，但不把整个 Curriculum V3.1 错标为完成
- 将 Python Data Tools 的阶段一标为当前工作
- 写明五阶段边界，避免阶段一实现提前混入课程正文或运行时重构

规划文件只记录事实和下一步，不改写既有历史决策。

## 9. 阶段一明确不做

- 不改写课程页面、路由或导航
- 不删除现有五节内容和 `scikit-learn` 段落
- 不撰写八章完整中文或英文正文
- 不生成正式 Matplotlib、Seaborn、Plotly 图表资产
- 不交付完整可下载 `.ipynb`
- 不实现五个形成性练习
- 不修改 checkpoint、进度或后端验收系统
- 不修改 Data Lab，不引入清洗数据集
- 不引入 Pyodide 或浏览器 Python
- 不使用 Imagegen 或 Manim

这些内容分别属于后续四个实施阶段，不能为了“顺手完成”而进入阶段一提交。

## 10. 阶段一验收条件

阶段一仅在以下条件全部满足后完成：

1. 本地 Bike Sharing `hour.csv` 快照、来源清单和双语数据字典齐全。
2. 清单中的 SHA-256、字节数、行列数和列顺序由脚本计算，并与快照一致。
3. 离线验证器覆盖全部 schema、范围、有限数值、非负计数和 `cnt` 加和不变量。
4. Python 与全部依赖具有上述精确版本，环境清单绑定数据 hash 和契约版本。
5. 类型化契约以固定顺序声明八章、单元格角色、练习挂载点和全部权威输出 ID；学习者可见元数据中英文齐全。
6. 契约明确最终报告问题、Data Lab 交接和统计边界，不包含模型训练或数据清洗。
7. 自动测试先证明缺失/错误契约会失败，再验证实现通过；相关单测与完整 `npm test` 通过。
8. 因为新增源码和脚本，`npm run build` 通过；若 public-path 结构测试受影响，则同时运行 `npm run build:pages`。
9. `.planning/STATE.md` 与 `.planning/ROADMAP.md` 如实反映已交付工作和当前五阶段计划。
10. `/learn/python-notebook` 的现有访问、双语和 checkpoint 行为不变。
11. 阶段一形成独立提交，diff 不包含 `docs/gpt_advice.md`、generated 图片或其他无关工作。

## 11. 后续阶段接口

阶段一完成后，阶段二以本契约撰写八章中文母版；阶段三从同一数据与环境生成 Notebook 和真实图表；阶段四补齐英文并将现有页面接入新运行时；阶段五进行数据、代码、输出、双语、浏览器与构建一致性验证。任何阶段若需要改变本契约，必须先更新本设计、测试与契约版本，再重新生成受影响产物。
