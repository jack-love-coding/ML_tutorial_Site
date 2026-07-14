# Python 数据分析工具课程：阶段三 Notebook 与权威输出设计

- 日期：2026-07-14
- 状态：待确认
- 范围：阶段三——可执行 Notebook 与真实输出资产
- 前置契约：`python-data-tools-v1`
- 前置内容：八章中文课程母版
- 现有模块：`python-notebook`
- 现有路由：`/learn/python-notebook`

## 1. 目的

阶段三把已确认的八章中文母版转换为一份可以从干净 kernel 按顺序执行的 Notebook，并从同一次执行中发布 8 个权威输出：4 个 JSON、3 个真实 Matplotlib/Seaborn PNG 和 1 个 Plotly Figure JSON。Notebook、输出文件和清单必须绑定同一份 Bike Sharing 数据 hash、同一套 Python 环境和同一组稳定单元格。

本阶段解决“代码是否真的能跑、图和数值是否真的来自代码、重新生成是否一致”。它不迁移当前网页内容、不补英文、不实现 Vue 练习，也不改路由、checkpoint 或进度。运行时接线仍属于阶段四。

## 2. 已知现状与设计结论

阶段一已经交付：

- 本地 Bike Sharing 快照、数据清单和数据字典；
- Python 3.12.13 与分析库直接依赖版本；
- 8 个权威输出 ID、输出种类、章节归属和 `output-*` 单元格 ID；
- 离线数据验证器。

阶段二已经交付：

- `README.md` 与八章中文母版；
- 47 个 `chNN-*` 来源单元格标记；
- 每个权威输出到具体来源代码块的一对一绑定；
- 五个练习规范和完整中文解释。

当前尚无正式 `.ipynb`、输出目录、输出生成器或 Notebook 执行器。当前系统 Python 版本与核心数值库恰好匹配锁定版本，但 Seaborn、Plotly 和 kernel 依赖未完整安装，因此不能把本机全局环境当成验收环境。

## 3. 交付文件

阶段三实现新增或更新：

```text
scripts/python-data-tools/
├── build-notebook.py
├── generate-authoritative-outputs.py
└── verify-authoritative-outputs.py

public/notebooks/python-data-tools/
├── python-data-tools-bike-sharing.zh-CN.ipynb
├── environment.json
├── requirements.txt
└── outputs/
    ├── dataset-shape-schema.json
    ├── workingday-comparison.json
    ├── hourly-demand-profile.png
    ├── rider-composition.png
    ├── season-weather-distribution.png
    ├── pearson-correlation-matrix.json
    ├── plotly-hourly-explorer.plotly.json
    ├── final-analysis-evidence.json
    └── manifest.json

public/fonts/python-data-tools/
├── NotoSansSC-Regular.ttf
├── OFL.txt
└── metadata.json

tests/
└── python-data-tools-notebook-assets.test.ts
```

若执行验证发现母版代码需要修正，允许同步修改 `docs/curriculum-v3/python-data-tools/chinese-master/**` 及其静态测试，但不能在生成器中偷偷维护第二套分析逻辑。

## 4. 执行环境补全

### 4.1 直接依赖

现有分析版本保持不变：

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

Notebook 执行链另外把两个此前仅可能作为间接依赖出现的包提升为直接锁定依赖：

| 组件 | 版本 | 用途 |
| --- | --- | --- |
| nbclient | 0.11.0 | 从干净 kernel 执行 Notebook |
| ipykernel | 7.3.0 | 提供受控 `python3` kernel |

`requirements.txt` 使用严格 `==`。`environment.json` 新增 `executionPackages`，记录上述两项，并继续保留数据 hash 与 `python-data-tools-v1`。这是对 V1 执行实现的补全，不改变章节、输出或统计语义，因此不创建 V2；阶段一环境测试必须同步更新。

### 4.2 隔离环境

推荐生成环境固定为仓库根目录下 `.python-data-tools-venv/`，并把该目录加入 `.gitignore`。标准命令为：

```bash
python3 -m venv .python-data-tools-venv
.python-data-tools-venv/bin/python -m pip install -r public/notebooks/python-data-tools/requirements.txt
```

生成器启动时必须检查 Python 与全部直接依赖版本，任何不一致都在读取或覆盖正式产物前失败。它不得静默使用本机其他 kernel。

Windows 路径不写入 Notebook 或输出；脚本内部使用 `pathlib.Path`。本阶段验收环境为项目当前的 macOS/Python 3.12.13，但生成产物不能依赖 macOS 专有字体或绝对路径。

## 5. 中文字体与图像可复现

静态图包含中文标题、轴标签和图例。为避免不同机器使用 PingFang、黑体或缺字 fallback 导致图像变化，阶段三提交一份本地 Noto Sans SC Regular TTF，并随附 SIL Open Font License 与来源元数据。

`metadata.json` 至少记录：

- 字体名称、上游项目与固定下载 URL；
- 许可证标识和许可证文件路径；
- 上游版本或提交标识；
- 本地 public 路径、SHA-256 和字节数；
- 获取日期；
- 本课程仅用于生成中文图表的说明。

Matplotlib 通过 `font_manager.FontProperties(fname=...)` 显式加载该文件；不得按系统字体名搜索。PNG 使用固定尺寸、DPI、颜色、布局、字体文件和 metadata，禁止写入当前时间。图像在浏览器运行时不需要再下载字体。

## 6. 母版到 Notebook 的转换

### 6.1 唯一内容来源

`build-notebook.py` 读取索引和八章 Markdown，不在 Python 脚本里复制中文正文。转换规则：

- 普通 Markdown 变成 markdown cell；
- `<!-- cell: ... -->` 后的 Python fence 变成 code cell；
- 章节标题、练习、公式、表格和解释保持原顺序；
- 来源标记注释不显示在正文 cell 中，但写入 cell metadata；
- 未带合法标记的 Python fence、重复来源 ID、未知角色或未知输出立即失败；
- 任何母版章节缺失、顺序漂移或核心问题不匹配类型契约立即失败。

Notebook 顶层 metadata 固定包含：

- `kernelspec.name = "python3"`；
- Python 3.12.13；
- `contractVersion = "python-data-tools-v1"`；
- 数据 public path 与 SHA-256；
- 8 个母版文件及其 SHA-256；
- 输出清单相对路径；
- 生成脚本相对路径。

### 6.2 双 ID 映射

阶段二的 `chNN-*` 表示母版来源单元格；阶段一输出契约的 `output-*` 表示发布权威输出的 Notebook 单元格。两者都保留：

- 普通 code cell：Notebook `cell.id` 等于 `chNN-*`。
- 带 `output` 的 code cell：Notebook `cell.id` 等于类型契约中的 `output-<output-id>`。
- 所有 code cell 的 `metadata.mlAtlas.sourceCellId` 保存原 `chNN-*`。
- `metadata.mlAtlas.role` 保存阶段一合法角色。
- 输出 cell 另存 `metadata.mlAtlas.outputId`。

这样 `output.cellId` 仍然是可直接定位的真实 Notebook ID，同时母版来源 ID 没有丢失。阶段三实现同步把阶段二 README 中“未来 Notebook cell ID”的措辞校准为“母版来源单元格 ID”，不改变其值或顺序。

### 6.3 执行与清理

`generate-authoritative-outputs.py` 使用 nbclient 0.11.0：

- 从无变量的全新 `python3` kernel 开始；
- 工作目录固定为 `public/notebooks/python-data-tools/`；
- 按 cell 顺序执行，不跳过错误；
- 每个 cell 最长 120 秒，总流程失败即退出；
- `allow_errors = false`，最终 Notebook 不得含 error output；
- `record_timing = false`，移除执行时长、kernel 临时信息和其他非确定 metadata；
- execution count 从 1 连续递增；
- 不允许网络访问；代码扫描和运行时防线共同阻止 HTTP URL；
- 不允许随机抽样；若未来增加随机步骤必须固定种子并进入 manifest。

Notebook 提交已执行版本，保留教学需要的数值表、文本和图表输出。不得保存 widget state、外部 iframe、远程图片或本机路径。

## 7. 输出生成方式

母版中的 output-bound code cell 必须显式创建用于发布的变量或 Figure。生成器只负责序列化当前 Notebook 状态，不重新计算一套分析。

阶段三允许对母版做以下窄幅代码补全：

- 第一章增加 `json`、输出目录和有限 JSON 写入 helper；
- PNG 输出 cell 使用显式本地字体和 `fig.savefig()`；
- Plotly 输出 cell 使用 `remove_uids=True` 的确定性 JSON；
- 最终报告 cell 从前章表格读取精确证据；
- 输出后通过 Notebook 本地显示，不引用远程 CDN。

所有 JSON 使用 UTF-8、LF、2 空格缩进、排序键、末尾换行并设置 `allow_nan=False`。浮点数在分析口径层固定精度，而不是依赖 UI 格式：

- 原始计数与样本数保存整数；
- 均值、中位数和份额保存到小数点后 6 位；
- Pearson 与协方差保存到小数点后 8 位；
- Plotly Figure 数据保留生成库序列化精度，但清除 UID 与运行时状态。

## 8. 八个输出的精确 schema

### 8.1 `dataset-shape-schema.json`

必须包含：

- `contractVersion`、数据 SHA-256；
- `rows`、`columns`、有序 `columnOrder`；
- 每列 dtype；
- 数据字典字段角色映射；
- `cnt = casual + registered` 的全表布尔结果。

### 8.2 `workingday-comparison.json`

必须包含 48 条按 `workingday`、`hr` 排序的记录，每条有：

- 原编码与中文标签；
- `hr`；
- `observations`；
- `meanRentals`、`medianRentals`、`totalRentals`；
- 聚合口径说明。

### 8.3 `hourly-demand-profile.png`

- 固定 9 × 4.8 英寸、160 DPI，即 1440 × 768 像素；
- 24 个按小时排序的点；
- 中文标题、轴标签、单位、点标记和图例；
- 输入绑定 `hourly_demand`；
- 不写生成时间。

### 8.4 `rider-composition.png`

- 固定 7 × 4.8 英寸、160 DPI，即 1120 × 768 像素；
- 只比较 `casual` 与 `registered` 两类用户；
- y 轴从 0 开始，柱顶有精确整数标签；
- `cnt` 只作加和校验，不作为第三类用户。

### 8.5 `season-weather-distribution.png`

- 固定 14 × 5 英寸、160 DPI，即 2240 × 800 像素；
- 左面板为四季箱线图，右面板为天气状况箱线图；
- 类别顺序来自数据字典；
- 中文标签使用本地字体；
- 样本数写入图旁 metadata/manifest 和 JSON 证据，不仅靠箱体视觉。

### 8.6 `pearson-correlation-matrix.json`

固定字段顺序：

`temp, atemp, hum, windspeed, casual, registered, cnt`

必须包含：

- 方法 `pearson`；
- 字段顺序；
- 对称 7 × 7 有限矩阵；
- 对角线为 1；
- 每列非空样本数；
- “相关不代表因果”的中英文 guardrail；
- 不包含类别编码、p 值、置信区间或显著性结果。

### 8.7 `plotly-hourly-explorer.plotly.json`

必须包含：

- Plotly Figure 的 `data`、`layout`；
- 全 24 小时与工作日/非工作日两组；
- 颜色加线型的冗余类别编码；
- hover 中的均值、中位数与样本数；
- `defaultFilterState`：小时 `[0, 23]`、工作日值 `[0, 1]`、指标 `mean_rentals`、空隐藏组；
- 无 trace UID、widget state、远程模板 URL 或当前交互选择。

### 8.8 `final-analysis-evidence.json`

在阶段二结构骨架上补全可复现数值证据：

- `contractVersion`、数据 SHA-256、环境版本；
- 7 个前置来源输出 ID；
- 时间：总体平均需求峰值小时、峰值均值及对应样本数；
- 工作日：两种日期类型各自峰值小时、均值、中位数与样本数；
- 季节：四组样本数、均值与中位数；
- 天气：各实际出现类别的样本数、均值与中位数；
- 用户构成：临时/注册累计次数及各自在两类总和中的份额；
- 变量关系：`temp`、`hum`、`windspeed` 分别与 `cnt` 的 Pearson 值；
- 每类证据的单位、分组键、聚合口径和限制；
- 排除项：预测、因果识别、显著性判断、数据清洗；
- `/data-lab` 交接。

“峰值”若有并列，固定选择较早小时并在 schema 中记录 tie rule；不得由 `idxmax()` 的隐式行为决定而不说明。

## 9. 输出清单与原子发布

`outputs/manifest.json` 是阶段三资产索引，至少包含：

- 契约版本、数据 hash、环境文件 hash；
- Notebook 路径与 hash；
- 8 个输出的 ID、类型、相对 public 路径、SHA-256、字节数；
- PNG 宽高、DPI、字体路径和 alt 文本；
- JSON schema 版本和记录数/矩阵维度；
- 对应 Notebook `cellId` 与母版 `sourceCellId`；
- 生成器路径与 hash；
- 确定性生成日期，取自环境清单而非当前时钟。

生成流程在同一父目录创建 transaction 临时目录，先完成 Notebook 执行、8 个输出、清单与全部验证，再逐项原子替换。任何数据、环境、字体、输出或执行错误都必须保留旧正式产物，并清理临时文件。

`--check` 模式生成到临时目录并与已提交的 Notebook、输出和 manifest 做字节比较，不写正式文件。连续两次生成必须得到完全相同的字节；若只有 PNG ancillary chunk 或 Notebook metadata 漂移，也视为失败，不能放宽成“看起来一样”。

## 10. 验证器与测试

### 10.1 Python 验证器

`verify-authoritative-outputs.py` 负责：

- 先调用阶段一数据/环境验证；
- 检查 Python 与依赖版本；
- 检查字体 hash 与许可证；
- 解析 Notebook，核对章节、来源 cell、输出 cell、角色与执行顺序；
- 拒绝 error output、缺失输出、远程 URL、绝对路径、widget state 和非有限 JSON；
- 验证 8 个 schema、PNG signature/尺寸、Plotly 默认状态和最终证据；
- 验证所有文件 hash、字节数、manifest 映射与数据绑定；
- 支持 `--check` 重生成比对。

### 10.2 Node 静态测试

`tests/python-data-tools-notebook-assets.test.ts` 不要求 CI 现场安装 Python 分析环境，但必须静态验证：

1. Notebook 与 8 个输出、manifest、字体和许可证存在。
2. Notebook 是 nbformat 4，八章顺序、核心问题和代码来源标记完整。
3. 普通/输出 cell 的双 ID 映射符合类型契约，所有 code cell 有合法角色。
4. execution count 连续且无 error output、远程 URL、本机路径或 widget metadata。
5. 8 个输出 schema、记录数、矩阵维度和 Plotly 默认状态正确。
6. PNG signature、固定像素尺寸与 manifest 一致。
7. 全部 SHA-256、字节数、数据 hash、环境 hash 和字体 hash 一致。
8. 最终证据引用前 7 个输出，包含五个证据维度、限制和 Data Lab 交接。
9. 生成器具有 `--check`、临时目录、失败清理和原子替换路径。
10. 当前 `src/data/pythonNotebookModule.ts`、路由、checkpoint 和进度行为仍未改变。

Python 执行验证是阶段三本地验收命令；Node 静态验证进入现有 `npm test`，让 GitHub Pages CI 验证提交资产没有被手工篡改。

## 11. 错误处理

- 缺少依赖、kernel 或字体：在写临时 Notebook 前失败，并列出实际/期望版本或路径。
- 母版解析失败：指出文件、行号、重复 ID 或未知标记。
- Notebook cell 失败：指出 chapter、source cell、Notebook cell 和异常摘要；不发布部分输出。
- JSON 含 NaN/Infinity：指出输出 ID 与字段路径。
- PNG 尺寸或字体不符：指出实际值、期望值与文件。
- Plotly 含 UID/远程 URL/隐藏筛选：指出 trace 或 layout 路径。
- 第二次生成漂移：列出文件和首个不同字节/结构路径。
- 原子替换失败：尽力恢复原文件并清理 transaction 文件，测试覆盖失败注入。

## 12. 规划状态

阶段三实现开始时：

- `.planning/ROADMAP.md`：阶段三从 Planned 改为 Current；
- `.planning/STATE.md`：当前焦点改为 Notebook 与权威输出生成；
- 阶段一、二保持 Completed；阶段四、五保持 Planned。

全部验收通过并形成独立提交后，阶段三改为 Completed，阶段四仍为 Planned。不得因为 Notebook 已有中文正文而把英文或网页迁移写成完成。

## 13. 阶段三明确不做

- 不修改 `/learn/python-notebook` 当前运行时页面或课程正文来源；
- 不补英文课程；
- 不实现 Vue 形成性练习；
- 不修改路由、导航、checkpoint、Progress V1/V2 或 localStorage；
- 不添加 Pyodide、浏览器 Python、后端、提交或评分；
- 不训练模型，不引入 `scikit-learn`；
- 不复制 Data Lab 清洗流程；
- 不生成 Plotly PNG，不引入 Kaleido；
- 不使用 Imagegen 或 Manim；
- 不修改 `public/data-lab/generated/*.png` 或其他课程生成资产；
- 不把 `.python-data-tools-venv/`、临时 kernel 文件或 transaction 目录加入 Git。

## 14. 阶段三验收条件

阶段三仅在以下条件全部满足后完成：

1. 锁定环境增加 nbclient 0.11.0 与 ipykernel 7.3.0，隔离环境安装与版本预检通过。
2. 本地 Noto Sans SC 字体、许可证、来源元数据和 hash 齐全，三张 PNG 不依赖系统字体。
3. Notebook 从八章母版生成，章节/正文/47 个来源 code cell 完整，双 ID 映射与类型契约一致。
4. Notebook 从干净 kernel 自上而下一次执行成功，execution count 连续，无 error、隐藏状态、网络、绝对路径或 widget 输出。
5. 8 个权威输出全部由绑定 cell 的同一次执行生成，schema、排序、精度、图像尺寸与统计边界符合本设计。
6. `final-analysis-evidence.json` 提供时间、工作日、季节、天气、用户构成和相关关系的可追溯精确证据，不包含预测、因果或显著性结论。
7. manifest 完整绑定数据、环境、字体、Notebook、输出、cell 与生成器 hash。
8. 正式生成后连续运行两次 `--check` 均字节一致；失败注入证明旧产物保留且临时文件清理。
9. Python 验证器与生成器 `--check` 通过。
10. `tests/python-data-tools-notebook-assets.test.ts`、阶段一/二相关测试和完整 `npm test` 通过。
11. 因 public 资产发生变化，`npm run build` 与 `npm run build:pages` 均通过。
12. `/learn/python-notebook` 现有页面、双语、checkpoint 和进度行为不变。
13. 规划状态如实收口为阶段三 Completed、阶段四 Planned。
14. 阶段三形成独立提交，diff 不包含 `docs/gpt_advice.md`、Data Lab generated 图片或其他无关文件。

## 15. 后续阶段接口

阶段四把中文母版与权威输出接入现有 `python-notebook` 路由，补齐英文 `LocalizedCopy`，并实现五个本地形成性练习。网页代码块、静态图、Plotly 图和下载 Notebook 必须读取本阶段 manifest，不得重新手抄数值或维护另一份输出路径。

阶段五再做网页、Notebook、数据、双语、输出、移动端和 GitHub Pages 的端到端一致性验证。若阶段四发现输出不足，应先更新本设计、生成器、Notebook 和 manifest，再重新生成；不得只在 Vue 页面中计算一份新答案。
