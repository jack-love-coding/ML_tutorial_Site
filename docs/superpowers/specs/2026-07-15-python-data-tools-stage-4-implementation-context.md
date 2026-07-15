# Python 数据分析工具课程 Stage 4：实现上下文

**Gathered:** 2026-07-15
**Status:** Ready for planning

<domain>
## 阶段边界

本阶段把现有 `/learn/python-notebook` 迁移为与 `python-data-tools-v1` 契约一致的八章双语分页课程，并接入 Stage 3 权威输出、中文 Notebook 下载、旧深链兼容和现有 checkpoint/Progress 机制。需求与禁止项以 Stage 4 规格为准；本上下文只锁定实现方式，不扩展到 Stage 5 浏览器收口、数据清洗、模型训练、浏览器 Python、后端或 Progress 重构。

</domain>

<decisions>
## 实现决策

### 阅读结构与学习者语言

- **D-01:** 使用专用的八章分页课程页。桌面端保留常驻目录，移动端使用可展开目录；每章有稳定 URL、上一章/下一章导航，页面只渲染当前章节。
- **D-02:** 教学块按“问题 → 代码 → 运行结果 → 解读 → 限制或误区”就地编排，输出紧跟产生它的代码，不另建章末结果画廊。
- **D-03:** 学习者界面使用“运行结果”“图表解读”“分析发现”“需要注意”。`manifest`、`output`、`evidence` 仅作为内部实现术语，不出现在前端标题或说明中。
- **D-04:** 页面只显示“第 X / 8 章”和章节位置，不显示完成百分比、掌握度、通过状态或章节门槛。

### 双语内容权威来源

- **D-05:** 现有八章中文 Markdown 母版继续作为中文唯一正文来源；新增八个一一对应的英文 Markdown 母版。运行时读取由母版生成或投影得到的 typed 内容，不在 Vue/TypeScript 中手写第二份正文。
- **D-06:** 英文采用自然教学表达，不做逐句直译；章节结构、公式、变量、代码、数值和输出绑定必须与中文完全一致。
- **D-07:** 切换语言时保留当前章节和位置，不跳回课程首页或第一章。
- **D-08:** Stage 3 中文标注 PNG 仍是唯一权威图片。英文模式复用同一图片，并提供英文标题、alt、坐标轴/图例翻译、完整解读和等价数据表；Plotly 的可见界面文案随语言切换。
- **D-09:** 正文只允许修改语言母版；生成的 runtime projection 不手工编辑，生成器提供 `--check` 模式检测漂移。

### 权威输出呈现

- **D-10:** JSON 默认渲染为教学表格、关键值和解释；原始只读 JSON 仅放在可选展开区。
- **D-11:** Plotly 只保留小时范围、工作日/非工作日分组开关、悬停精确值、缩放、重置和当前筛选摘要，隐藏无关 modebar 工具。
- **D-12:** 资源失败只影响对应结果块：图片失败显示 alt、解释和等价数据表；Plotly 失败显示静态筛选说明与表格；单个 JSON 失败显示局部不可用信息；manifest 失败保留正文和代码，并只提供一次手动“重新加载运行结果”。不得出现整页错误或无限自动重试。
- **D-13:** Notebook 下载入口同时出现在课程页头与最终报告章底部，中文标签为“下载完整中文 Notebook”，并明确文件已经执行、包含输出、需要本地 Python 环境，同时链接环境依赖说明；不得暗示网页在线执行 Python。

### 教学提示与课程回顾

- **D-14:** 不实现五套独立交互练习。五个 contract 学习停顿渲染为静态行内教学提示：“想一想”的具体问题后直接展示“参考思路”、相关误区与复看指引。
- **D-15:** 教学提示没有输入、提交、正确/错误、判分、重置、完成状态、门槛、存储或网络请求。
- **D-16:** 保留两个课程末 checkpoint 及现有提交和 Progress 机制，但前端区块命名为“课程回顾”，置于最终报告之后，不强调百分比或通过/失败。
- **D-17:** 两个新 checkpoint 使用新 ID，分别检查分组分析解读和“相关不代表因果”的限制；每题提交后显示参考解释和复看链接。旧 checkpoint attempt 原样保留，但旧问题不再作为当前题目展示。

### 深链与兼容行为

- **D-18:** 旧章节 ID 使用集中、显式、静默映射：`notebook-rhythm → notebook-workflow`、`numpy-arrays → numpy-foundations`、`pandas-tables → pandas-structures`、`sklearn-small-model → pandas-analysis`、`reproducible-handoff → analysis-report`。
- **D-19:** 有效新章节 ID 直接打开原章节；未知 ID 才回退到第一章。旧深链跳转不显示迁移 banner，也不写 Progress。

### the agent's Discretion

- 专用页面、内容投影、输出加载器和教学展示组件的确切文件名及拆分粒度。
- CSS 在现有 module/shared layer 中的具体拆分方式，以及目录在断点处的细节样式。
- 母版到 typed runtime 的序列化格式和生成器内部实现，只要保持母版唯一编辑入口与 `--check` 漂移检测。
- Plotly 的具体 Vue 封装或渲染方式，只要不引入第二套数据、遵守受控交互范围并提供静态 fallback。
- 局部资源错误组件的视觉细节和一次性手动重载的内部状态实现。

</decisions>

<specifics>
## 具体呈现意图

- 这是一门“以教学为主”的课程，不把每个停顿做成任务台或练习系统。
- 运行结果应像教师在 Notebook 中边运行边解释，而不是像开发者查看 manifest 或 JSON 调试器。
- 同一章节在中英文间切换时，学习者应感觉只是语言改变，章节、代码和观察对象没有变化。
- “课程回顾”负责课程末的两次可提交回看；章内“想一想”只负责引导观察和给出参考思路。

</specifics>

<canonical_refs>
## 规范引用

**下游规划或实现前必须阅读以下文件。**

### 范围与前置交付

- `docs/superpowers/specs/2026-07-15-python-data-tools-stage-4-runtime-parity-spec.md` — Stage 4 的需求、验收、边界和禁止项。
- `docs/superpowers/specs/2026-07-14-python-data-tools-stage-3-notebook-assets-design.md` — 已执行 Notebook、八个权威输出、manifest、生成与校验规则。
- `docs/superpowers/specs/2026-07-14-python-data-tools-stage-2-chinese-master-design.md` — 八章中文母版结构、稳定标记和内容边界。

### Typed 内容与当前运行时

- `src/data/pythonNotebookContract.ts` — `python-data-tools-v1` 的章节、教学停顿、输出归属、环境和统计边界。
- `src/data/pythonNotebookModule.ts` — 当前五章旧运行时正文及需要替换的模块注册形态。
- `src/views/AlgorithmView.vue` — 算法课程路由分发、章节 fallback 与 checkpoint 接入位置。

### 可复用页面与基础设施

- `src/components/LinearRegressionPagedLesson.vue` — 专用分页课程、章节目录和上一章/下一章导航的既有模式。
- `src/utils/publicPath.ts` — GitHub Pages `BASE_URL` 下 public 资源路径解析。
- `src/data/algorithmCheckpoints.ts` — 模块级 checkpoint 定义与反馈结构。
- `src/utils/algorithmProgress.ts` — 现有 checkpoint attempt 和 Progress V1 写入/读取语义。

</canonical_refs>

<code_context>
## 现有代码洞察

### 可复用资产

- `LinearRegressionPagedLesson.vue` 已证明专用分页课程可以保持章节深链、目录与逐章渲染；Stage 4 应复用其结构思路而非复制其课程内容。
- `withPublicBase()` 是所有 manifest、PNG、JSON 和 Notebook 下载路径的接入点。
- 现有 Markdown/公式安全渲染封装应继续负责母版投影后的正文，不在组件中输出任意 raw HTML。
- `algorithmCheckpoints.ts` 与 `algorithmProgress.ts` 已提供课程末提交和 attempt 保留机制，只更新当前题目定义与展示语气，不增加新的进度 writer。

### 已建立模式

- 课程数据使用 typed schema 和 `LocalizedCopy`，页面组件只组合状态与展示。
- 大型课程或 lab 通过 lazy route/import 保持初始 bundle 边界。
- public 资源从 `/` 开头的逻辑路径经 base helper 转换，不能使用本机绝对路径或远程运行时图片。
- fallback 需要与交互呈现同样的核心结论，颜色和动画不能成为唯一信息来源。

### 集成点

- 在 `AlgorithmView.vue` 的 `python-notebook` 分支接入专用页面，但规划时应避免继续扩大其大型条件分支，可把解析和页面状态移到独立模块。
- 章节 ID 以 `pythonDataToolsContract.chapters` 为唯一顺序来源；旧 ID 映射集中处理后再进入当前章节解析。
- Stage 3 manifest 是输出文件与归属的权威入口；组件只消费 loader 归一化后的 typed 状态。
- 新 checkpoint ID 接入现有模块 checkpoint 列表，旧 attempt 只由兼容测试确认保留，不在课程页重新展示。

</code_context>

<deferred>
## 延后事项

- 英文 `.ipynb` 与英文专用 PNG。
- Pyodide、Jupyter server、后端 kernel、账号或后端验收系统。
- Stage 5 的完整浏览器矩阵、移动端视觉收口和网页—Notebook—数据端到端一致性审计。
- 更多交互练习、实战任务和练习进度体系。
- Progress V3、多设备同步或现有 Progress 信息架构重构。

</deferred>

---

*Stage: python-data-tools-stage-4*
*Context gathered: 2026-07-15*
