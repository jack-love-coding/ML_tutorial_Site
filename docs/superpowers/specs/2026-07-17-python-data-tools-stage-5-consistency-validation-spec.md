# Python 数据分析工具课程：Stage 5 一致性与浏览器验证规格

- 日期：2026-07-17
- 状态：设计完成，等待执行
- 范围：Stage 5——可见术语收口、网页—母版—Notebook—输出一致性、真实浏览器矩阵、标准构建与 GitHub Pages 验证
- 前置契约：`python-data-tools-v1`
- 前置交付：Python Data Tools Stages 1–4
- 现有模块：`python-notebook`
- 现有路由：`/learn/python-notebook`

## 1. 目标

Stage 5 不再增加课程章节、练习或交互功能，而是证明当前八章课程可以作为一个完整、可发布的教学单元交付：学习者看到的中英文内容、代码、数值、图表、Notebook 和下载资源来自同一条权威链路；八章在桌面与移动浏览器中可读；资源失败时核心教学内容仍然成立；标准构建与 GitHub Pages base path 都能正确运行。

Stage 5 结束时，应能用文件级校验、自动化测试、真实浏览器记录和构建产物四类结果回答以下问题：

1. 网页代码与下载 Notebook 是否来自同一组母版？
2. Notebook 中的计算是否确实产生当前提交的 JSON、PNG 与 Plotly 结果？
3. 中文与英文是否在章节、代码、变量、输出和限制说明上保持语义对齐？
4. 桌面、平板和手机是否都能完整阅读课程，而不是只“通过构建”？
5. manifest、单个 JSON、PNG 或 Plotly 失败时，页面是否局部降级且不污染其他章节？
6. `/ML_tutorial_Site/` base path、深链 fallback 和本地资源是否可用于 GitHub Pages？

## 2. 已知基线

Stage 4 已完成八章双语母版、generated runtime projection、专用分页页面、当前章按需输出、PNG 失败后按需表格 fallback、Plotly 动态加载、五个静态教学提示、五个旧深链映射、课程回顾和 Progress 兼容。

当前验证基线：

- `npm test`：645/645 通过。
- `npm run build`：通过，保留现有 large-chunk warning。
- `npm run build:pages`：通过，保留现有 large-chunk warning。
- `npm run security:audit`：0 vulnerabilities。
- Stage 4 后续质量修正提交：`69dca50`。

Stage 5 已知需要主动关闭的一项内容债务：第八章可见 Python 代码仍使用 `evidence_register`、`season_evidence`、`weather_evidence`、`final_analysis_evidence`、`"evidence"` 和“证据”等命名。它们虽然属于代码或内部产物结构，但仍会被学习者直接看到，与已确认的“运行结果 / 分析发现 / 数据依据 / 需要注意”语言不一致。

## 3. 锁定需求

### S5-R1. 学习者可见术语统一

所有真实页面可见区域，包括正文、代码、代码标题、原始 JSON 展开区、图表标签、fallback、课程回顾与下载说明，都不得把内部工程词 `manifest`、`output`、`evidence` 或中文“证据”当作学习者概念展示。

- 第八章可见代码统一使用 `analysis_register`、`result_id`、`season_summary`、`weather_summary`、`final_analysis_record`、`source_results` 和 `analysis_summary` 等分析语义命名。
- 报告模板使用“观察 / 数据依据 / 解释 / 限制”，英文使用 “Observation / Data basis / Interpretation / Limitation”。
- `final-analysis-evidence` 等既有 output ID、文件名和 contract ID 可以作为内部兼容标识保留，但不得在页面标题、代码标题或可见说明中泄露。
- `PythonDataToolsPagedLesson.vue` 不再显示面向作者的 code block ID；代码标题只表达“课程代码 / Course code”。

验收必须扫描真实 DOM 文本，而不只扫描剔除代码后的 Markdown prose。

### S5-R2. 单一权威链路与可复现结果

八组中英母版、generated runtime、已执行中文 Notebook、8 个输出、output manifest 和数据快照必须保持同一契约与同一 hash 链路。

- 中英母版的 48 个代码单元字节、公式、章节顺序、result/prompt 绑定一致。
- runtime projection 由 16 个母版确定性生成，`--check` 不产生写入。
- Notebook 由中文母版生成并在锁定环境中从干净 kernel 顺序执行。
- JSON、PNG 和 Plotly 资产来自该 Notebook 执行状态，不在验证脚本或网页中另算一套统计。
- manifest 中数据、字体、环境、Notebook、母版、生成器和输出 hash 与当前文件一致。
- 重复生成必须字节稳定；如 PNG 因合法图形库 metadata 产生不可避免差异，必须在执行前先修复确定性来源，不能放宽为“肉眼相同”。

### S5-R3. 双语内容与教学边界一致

八章中英文必须保持相同章节顺序、代码、变量、输出归属、统计口径、限制说明和 Data Lab 衔接。英文不能压缩成中文摘要，也不能增加中文没有的模型训练、清洗实现、推断统计或因果结论。

真实浏览器中切换语言必须：

- 保留当前章节 URL 和当前位置；
- 更新目录、正文、运行结果、Plotly 控件、fallback、教学提示和课程回顾；
- 不重新写入学习 Progress；
- 不发起当前章节以外的输出请求。

### S5-R4. 响应式真实浏览器矩阵

浏览器验证采用“全章节桌面覆盖 + 高风险章节多尺寸覆盖”，避免无意义的全排列：

| 覆盖组 | 视口 | 语言 | 章节 | 必查行为 |
|---|---|---|---|---|
| A | 1440×1000 | 中、英 | 全部 8 章 | 路由、唯一当前 article、正文/代码/结果、无横向溢出、无 console/page error |
| B | 768×1024 | 中、英 | 01、05、07、08 | 目录切换、长代码、PNG、Plotly、最终报告与课程回顾 |
| C | 390×844 | 中、英 | 01、05、07、08 | 移动目录、触控目标、表格/代码滚动、pager、下载与回顾 |
| D | 1440×1000、390×844 | 中、英 | 07 | Plotly 键盘控件、筛选摘要、缩放/重置、静态等价说明 |
| E | 1440×1000 | 中、英 | 07 | `prefers-reduced-motion: reduce` 下无信息丢失 |

每个矩阵单元必须记录 URL、locale、viewport、当前章节 ID、console error、page error、失败请求、水平 overflow 和关键断言；不得只保留截图作为证明。

### S5-R5. 资源失败与请求边界

使用浏览器路由拦截分别验证：

1. manifest 404：正文、代码、目录和 pager 可读；下载入口显示不可用；只提供一次手动重载。
2. 当前 JSON 500 或非法 JSON：只有对应结果块失败，其他结果与正文不受影响。
3. PNG 加载失败：不显示破损图片；文字解释保留；只有发生图像失败后才请求该图片的 fallback JSON。
4. Plotly Figure JSON 失败：显示静态说明或等价表格，不加载 Plotly chunk。
5. Plotly chunk/渲染失败：显示静态 fallback，console 不出现未处理异常。
6. 章节快速切换造成慢请求或 abort：旧章节结果不写入新章节，卸载后无 stale UI 更新。

正常路径的请求预算是“manifest + 当前章节主输出”；不允许预取其他七章 PNG/JSON，也不允许在图片成功时提前请求 fallback JSON。

### S5-R6. 路由、课程回顾与 Progress 回归

- 根路由、8 个 canonical chapter、5 个 legacy chapter 和未知 chapter 保持 Stage 4 行为。
- locale 切换、目录、pager、静态教学提示、结果加载和失败重试都不得写 Progress。
- 只有课程回顾提交继续使用现有 checkpoint writer；旧 attempt、3 个 V1 key、V2 key 与 migration key 保留。
- 课程回顾不展示 Progress、得分百分比、通过/失败或完成门槛。

### S5-R7. 标准构建与 GitHub Pages 发布产物

- `npm test`、`npm run build`、`npm run build:pages`、`npm run security:audit` 全部通过。
- 标准构建从 `/learn/python-notebook/...` 工作；Pages 构建从 `/ML_tutorial_Site/learn/python-notebook/...` 工作。
- 运行 `scripts/create-pages-fallbacks.mjs` 后，`404.html`、Python 根路由和 8 个 canonical chapter fallback 均存在。
- Pages artifact 的 JS、CSS、manifest、Notebook、环境、JSON、PNG、字体和 Plotly chunk 均从 `/ML_tutorial_Site/` 读取且无 404。
- Plotly 保持独立按需 chunk；不为 Stage 5 引入新的 UI、浏览器测试或截图回归框架。

### S5-R8. 发布记录可审计

Stage 5 最终总结必须记录：

- 术语迁移映射和保留的内部兼容 ID；
- 生成/验证命令及实际结果；
- 浏览器矩阵每个单元的通过/失败；
- 发现并修复的问题；
- 未运行的检查与原因（若有）；
- 构建警告与是否阻塞发布；
- 明确说明未触碰 `docs/gpt_advice.md` 和无关 generated 图片。

## 4. 实现决策

### D-01. 先一致性、后浏览器

术语与权威资产变更必须先完成并重新生成 Notebook/output/runtime，再启动浏览器矩阵。浏览器记录不得基于随后会变化的产物。

### D-02. 保留内部 output ID

Stage 5 不重命名 `PythonDataToolsOutputId` 或 public 文件路径。内部 ID 是 contract、Notebook cell、manifest、runtime loader 和历史文档之间的稳定连接；学习者可见命名通过代码内容、表格字段、标题和组件呈现层收口。

### D-03. 不建立第二套 E2E 产品框架

本阶段使用现有 Node tests、现有生成/验证脚本和 Codex Playwright 浏览器能力。矩阵记录写入 Stage 5 summary；不安装 Playwright/Cypress、视觉截图 diff 服务或 CI 浏览器网格。

### D-04. 失败注入只在本地浏览器

资源失败通过请求拦截实现，不修改或删除正式 public 资产，不提交损坏 fixture，不让失败态测试写 localStorage。

### D-05. 只修复矩阵发现的阻塞问题

允许修改 Python Data Tools 母版、生成器、Notebook/output、专用组件、loader、CSS、路由和对应测试。不得借机重做全站 header、Homepage、Data Lab、Progress 信息架构或其他课程。

## 5. 范围边界

### 本阶段包含

- 第八章可见 `evidence/证据` 术语迁移与同源资产再生成。
- paired master、runtime、Notebook、output、manifest、dataset 的端到端一致性审计。
- 双语、响应式、键盘、reduced-motion、失败注入和请求预算浏览器矩阵。
- 标准构建、Pages base path、SPA fallback 和资源可达性验证。
- 由上述矩阵直接发现的 Python Data Tools 局部缺陷修复。

### 本阶段不包含

- 新章节、更多实战练习、章节验收或教师后台。
- 数据清洗课程、模型训练、推断统计或因果分析。
- 英文 `.ipynb` 或英文专用 PNG。
- Pyodide、Jupyter server、后端 kernel、账号、数据库或上传。
- Progress V3、多设备同步或现有 Progress 重构。
- Phase 24B Homepage Focus、Phase 24C Spine progressive disclosure 或其他课程重构。
- 全站性能优化或既有 large-chunk warning 的泛化治理。

## 6. Edge Coverage

| 边界 | 预期结果 | 验证层 |
|---|---|---|
| 空 locale、缺章节或空 block | 编译/测试失败 | paired preflight + runtime tests |
| 中文乱码、英文占位符 | 编译/测试失败 | content tests + DOM scan |
| 可见代码仍含 evidence/证据 | Stage 5 失败 | master/code/DOM scan |
| 内部 output ID 含 evidence | 允许但不得进入可见 DOM | contract assertion + DOM scan |
| 重复生成 | 文件 hash 不变 | clean generation twice |
| manifest 缺失 | 局部降级、一次 reload | browser failure injection |
| 单个 JSON 非法 | 单块失败 | browser failure injection |
| PNG 失败 | 无 broken image，按需 fallback | request log + DOM |
| Plotly 失败 | 静态等价信息保留 | browser failure injection |
| 快速章节切换 | stale 请求不污染新章 | delayed route interception |
| 390px 长代码/表格 | 局部横向滚动，页面不横溢 | browser overflow check |
| locale 切换 | URL/章节保留，无 Progress 写入 | browser storage snapshot |
| legacy/unknown route | 单次 canonical redirect | route/browser tests |
| Pages 根路径误用 | 失败；正确 base 路径通过 | Pages preview matrix |
| 直接深链刷新 | fallback 文件加载 app | generated route artifact + browser |

## 7. Prohibitions

| 禁止项 | 验证方式 |
|---|---|
| 不得新增课程内容、练习系统、完成门槛或后端验收。 | diff scope + dependency/source negative assertions |
| 不得在网页或验证脚本中重算另一套权威统计。 | source ownership test + generator review |
| 不得删除或重命名既有 output ID、路由、checkpoint 或 Progress key。 | exact identity tests |
| 不得通过忽略 hash、放宽 schema 或删除测试让一致性检查通过。 | negative fixtures + committed manifest audit |
| 不得安装新的 UI、E2E 或截图回归框架。 | package diff audit |
| 不得把截图当作唯一浏览器验收结果。 | matrix record schema requires text assertions |
| 不得触碰 `docs/gpt_advice.md` 或无关 Data Lab generated 图片。 | explicit git scope audit |

## 8. 完成定义

- [ ] S5-R1–R8 均有自动或真实浏览器结果。
- [ ] 第八章可见代码与 raw JSON 不再出现 `evidence` 或“证据”，内部兼容 ID 未改变。
- [ ] 中英母版、runtime、Notebook、8 个输出与 manifest 通过同源/hash 审计。
- [ ] 规定的 36 个核心浏览器单元全部通过，或每个失败都有修复后复测记录。
- [ ] 六类资源失败/请求边界均通过。
- [ ] 标准与 Pages 产物在各自 base path 下无 Python Data Tools 资源 404。
- [ ] Progress 与路由兼容测试通过。
- [ ] full test、两个 build、安全审计和 diff scope 全部通过。
- [ ] Stage 5 summary、Roadmap 与 State 只在全部 gate 通过后标记完成。

---

*Stage: Python Data Tools Stage 5 — Consistency, Browser, and Build Validation*
*Spec created: 2026-07-17*
*Next step: execute Plans 01–04 in order*
