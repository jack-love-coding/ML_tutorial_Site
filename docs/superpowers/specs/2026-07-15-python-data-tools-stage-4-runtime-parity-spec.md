# Python 数据分析工具课程：阶段四英文对齐与运行时迁移规格

- 日期：2026-07-15
- 状态：已确认，待制定实施计划
- 范围：阶段四——英文语义对齐、八章网页迁移、权威输出接线与静态教学提示
- 前置契约：`python-data-tools-v1`
- 前置交付：八章中文母版、已执行中文 Notebook、8 个权威输出及 manifest
- 现有模块：`python-notebook`
- 现有路由：`/learn/python-notebook`
- 歧义分数：`0.07`（门槛：不高于 `0.20`）
- 锁定需求：8 项

## 1. 目标

把 `/learn/python-notebook` 从当前 5 章旧课程迁移为与 `python-data-tools-v1` 一致的 8 章双语共享单车数据分析课程，使中文、英文、代码、权威输出、Notebook 下载、5 个静态教学提示和模块 checkpoint 在同一页面闭环中可用，同时保留旧深链与既有 Progress 数据。

## 2. 当前基线

当前运行时仍由 `src/data/pythonNotebookModule.ts` 维护 5 章正文：`notebook-rhythm`、`numpy-arrays`、`pandas-tables`、`sklearn-small-model` 和 `reproducible-handoff`。`AppliedWorkflowLessonLab.vue` 只展示 5 张通用 Notebook 卡片，未读取 Stage 3 manifest、真实 PNG、Plotly Figure JSON 或已执行 Notebook。

阶段一至三已经提供：

- 8 个稳定章节 ID、5 个教学停顿挂载点、8 个权威输出 ID 和描述性统计边界；
- 8 章中文母版与 48 个稳定来源 code cell；
- 经过干净 kernel 执行的中文 Notebook；
- 3 个真实 PNG、4 个 JSON 和 1 个确定性 Plotly Figure JSON；
- 绑定数据、环境、字体、Notebook、输出、cell 与生成器 hash 的 manifest。

阶段四只迁移网页内容、权威输出展示和受控 Plotly 交互。阶段五仍负责完整浏览器矩阵、移动端视觉收口和网页—Notebook—数据的端到端一致性审计。

## 3. 锁定需求

### R1. 八章英文语义对齐

阶段四必须为 8 章中文课程提供完整英文语义对齐。英文必须覆盖核心问题、概念解释、所有代码块、代码前后解释、数值结果、误区、限制、5 个教学提示及其参考思路和 Data Lab 衔接；不能只翻译标题或压缩成摘要。

- 当前：typed contract 只有英文标题与核心问题，完整正文只有中文母版；旧 5 章运行时英文与新课程不等价。
- 目标：8 章每个可见教学块都有非空 `LocalizedCopy`，中英文使用相同章节、代码、变量、输出 ID 和学习顺序。
- 验收：静态测试逐章逐块验证 `'zh-CN'` 与 `en` 非空、结构一一对应、代码块一致，并拒绝缺章、空英文、占位符和乱码。

### R2. 现有路由迁移为八章课程

`python-notebook` 模块 ID 与 `/learn/python-notebook` 保持不变，运行时章节替换为契约中的 8 个唯一 ID，并严格按照 `notebook-workflow` 到 `analysis-report` 的顺序展示。

- 当前：运行时模块包含 5 个旧章节，且其中 `sklearn-small-model` 与新课程“不训练模型”的边界冲突。
- 目标：模块目录、章节导航、直接章节链接和当前章节状态全部使用 8 个 `PythonDataToolsChapterId`；旧 sklearn 正文不再作为现行课程内容出现。
- 验收：运行时注册测试确认恰好 8 个唯一章节，ID 和顺序与 `pythonDataToolsContract.chapters` 完全相同，模块 ID 与根路由未改变。

### R3. 旧章节深链兼容

5 个旧章节 URL 必须各自映射到一个有效的新章节 URL。重复导航、刷新或同时打开多个旧深链都不能产生重定向循环、404、根路由误跳或 Progress 写入。

- 当前：通用 `/learn/:moduleId/:lessonId` 接受旧 ID；删除旧章节后，`AlgorithmView.vue` 会把未知章节替换到首章，但没有显式、可审计的旧 ID 映射。
- 目标：5 个旧 ID 有集中记录的兼容映射；有效新 ID 直达原章节；未知 ID 使用现有安全 fallback，不伪装成旧 ID 迁移。
- 验收：路由测试逐一覆盖 5 个旧 ID、8 个新 ID 和 1 个未知 ID，并验证结果确定、无循环、无 404、无存储副作用。

### R4. manifest 驱动的网页证据与下载

网页中的代码输出、3 个 PNG、4 个 JSON 派生证据、Plotly 探索图和中文 Notebook 下载必须以 Stage 3 manifest 及其 public path 为权威来源。GitHub Pages base path 必须通过现有 public-path 机制处理。

- 当前：运行时未读取 manifest；现有 Python lab 卡片维护另一组手写说明，页面也没有 Notebook 下载入口。
- 目标：每个输出只在契约所属章节出现；网页显示的精确数值可追溯到 manifest 绑定的文件；Plotly 使用已提交 Figure JSON；Notebook 下载指向已执行中文文件。
- 验收：结构测试确认 8 个输出 ID 唯一消费、所属章节正确、所有路径经 base-path helper 解析，且页面源码没有手抄 Stage 3 精确统计值或另一组输出路径。

当 manifest 或单个资源加载失败时，课程正文仍可阅读：相关面板显示双语错误说明和已有文字/表格 fallback，不显示无限加载、空白面板或损坏图片图标。重复或并行的只读资源加载不得改变教学提示、checkpoint 或 Progress 状态。

### R5. 五个静态教学提示

在 `numpy-foundations`、`pandas-analysis`、`matplotlib-visualization`、`seaborn-statistics` 和 `plotly-exploration` 各展示一个与 contract kind 对应的双语教学提示。

- 当前：contract 和中文母版定义了 5 个学习停顿，但旧规格曾把它们描述为交互练习；用户已明确课程以教学为主，不需要五套专门练习控件。
- 目标：每个停顿显示“想一想”的具体问题，并紧接着直接展示“参考思路”、相关误区和应复看的章节或视觉；不提供输入、提交、判分、重置或完成状态。
- 验收：测试确认 5 个提示 ID、kind、章节挂载、问题、参考思路、误区和 revisit 完整，且保留 `scored=false`、`submitted=false`、`persistedToProgress=false`、`gatesChapter=false`；页面不为这些提示绑定输入控件、提交事件、网络请求或 localStorage 写入。

### R6. checkpoint 与 Progress 兼容

保留现有模块级 checkpoint 组件、提交方式和 Progress 存储机制；把当前两个 checkpoint 的可见问题与反馈更新为可由新 8 章正文推导的内容，但不删除或重写已有尝试。

- 当前：两个 checkpoint 分别回看旧 `numpy-arrays` 和已移除的 `sklearn-small-model`；历史尝试已可能存储在 `ml-atlas:algorithm-progress:v1` 并迁移到 Progress V2。
- 目标：仍有两个可提交的双语模块级 checkpoint，revisit 目标指向有效新章节；读取旧 Progress 时保留全部旧 attempt 记录，新的提交继续使用现有存储路径。
- 验收：迁移测试使用包含旧 checkpoint attempt 的 fixture，加载、浏览、提交新 checkpoint 后旧记录仍存在；三个现有 v1 localStorage 数据源和 V2 key 均未删除、重命名或批量重写。

本阶段不扩展多标签页并发写入语义，因为没有新增进度 writer；并发行为继续由现有 Progress 实现负责，阶段四只验证没有引入新的写入路径。

### R7. 内容与执行边界

运行时课程必须保持“使用已准备快照做描述性分析”的边界：教授 Notebook、NumPy、pandas、Matplotlib、Seaborn 和 Plotly，但不实现数据清洗、模型训练、推断统计、因果识别或浏览器 Python 执行。

- 当前：旧运行时包含 sklearn 小模型；新 contract 已明确排除建模、显著性检验、p 值和置信区间，并把清洗交给 Data Lab。
- 目标：网页正文、教学提示、checkpoint 和可视化都不越过 `statisticsBoundary`；最终报告保留 `/data-lab` 衔接并明确“相关不代表因果”。
- 验收：内容测试拒绝 sklearn/模型训练、清洗实现、p 值/显著性结论、因果结论、Pyodide 或后端执行入口，同时确认 Data Lab 链接与限制说明存在。

### R8. 双语无障碍与静态 fallback

迁移后的每个图、交互和下载入口都必须有中英文可访问名称；PNG 有 manifest alt，Plotly 有等价文字或表格，状态不能只靠颜色表达，控件可用键盘操作，关键结论不只存在于动画或交互中。

- 当前：Stage 3 manifest 已为 PNG 提供中文 alt，但旧运行时没有消费这些资产，也没有 Plotly fallback。
- 目标：静态正文在脚本、动画或资源不可用时仍能传达核心结论；语言切换后标签、反馈和 fallback 同步更新。
- 验收：组件结构测试确认所有视觉与控件的 label/alt/fallback 绑定完整，中英文均非空且无 mojibake；reduced-motion 模式不隐藏任何唯一教学证据。

## 4. 范围边界

### 4.1 本阶段包含

- 8 章完整英文语义对齐及双语 typed runtime 内容。
- `/learn/python-notebook` 从 5 章迁移为 8 章。
- 5 个旧章节深链的显式兼容映射和测试。
- manifest 驱动的 PNG、JSON、Plotly 和中文 Notebook 下载。
- 5 个静态“想一想”教学提示及直接可见的参考思路。
- 两个现有模块级 checkpoint 的内容校准与历史 Progress 兼容。
- 双语资源错误状态、静态 fallback、键盘标签和 reduced-motion 信息保留。
- 与本阶段变化相称的 typed contract、内容、路由、组件和结构测试。

### 4.2 本阶段不包含

- 英文 `.ipynb`——阶段四只补网页英文语义对齐。
- 数据清洗课程或清洗交互——继续由 Data Lab 负责。
- sklearn、预测模型、训练或模型评估——不属于本课程的新目标。
- 置信区间、显著性检验、p 值或因果识别——超出描述性统计契约。
- Pyodide、Jupyter server、后端 kernel、代码上传或任意用户代码执行——当前站点仍为静态前端。
- 新的评分、练习提交、章节门槛或教学提示进度——验收交由具体教师和后续后端系统。
- Progress V3、账号、数据库或多设备同步——本阶段只保持现有兼容。
- Phase 24B Homepage Focus、Phase 24C Spine progressive disclosure 或其他课程页面重构。
- Stage 5 的完整浏览器矩阵、移动端视觉收口和端到端一致性审计。
- 重生成 Stage 3 Notebook 或输出——除非先修订前置契约和 Stage 3 设计并重新执行其全部验证。

## 5. 约束

- 继续使用 Vue 3、TypeScript、现有 Router、Pinia、i18n、Markdown 安全渲染和样式 tokens，不引入 UI 框架。
- 运行时章节与教学提示必须使用 typed schema，不拼接无类型对象。
- 双语正文必须同时存在 `'zh-CN'` 与 `en`，公式、变量、代码和输出 ID 跨语言一致。
- public 资源路径必须以 `/` 开头并通过 `withPublicBase` 或相邻既有模式兼容 GitHub Pages。
- 页面不得在浏览器重新计算一套权威统计值；精确证据读取已提交输出。
- 旧路由删除前必须有 redirect 和测试；现有 Progress 数据源不得删除。
- 资源失败、无 JavaScript/低性能或 reduced-motion 情况下，关键教学信息必须有文字或表格 fallback。

## 6. 验收清单

- [ ] 8 个运行时章节 ID 唯一且顺序与 `pythonDataToolsContract.chapters` 完全相同。
- [ ] 8 章每个教学块都有结构对齐的中文与英文，代码、变量、输出 ID 和数值证据一致。
- [ ] 中英文内容不存在空字符串、未完成标记、乱码或仅英文摘要替代完整正文。
- [ ] 5 个旧章节深链全部确定性跳转到有效新章节；8 个新深链直达；未知 ID 使用安全 fallback。
- [ ] 根路由仍为 `/learn/python-notebook`，模块 ID、导航归属和 curriculum role 不变。
- [ ] manifest 的 8 个唯一输出均在约定章节消费，public path 兼容 GitHub Pages。
- [ ] manifest 或单个资源缺失时显示双语错误和文字/表格 fallback，不出现空白或损坏资源占位。
- [ ] Plotly Figure JSON 提供本地交互视图及等价静态说明；中文 Notebook 可从页面下载。
- [ ] 5 个静态教学提示唯一挂载，均展示“想一想”、直接可见的“参考思路”、相关误区与 revisit。
- [ ] 5 个教学提示不提供输入、提交、判分、重置或完成状态，不写 Progress、不阻挡章节且不发网络请求。
- [ ] 两个模块级 checkpoint 的答案可由新正文推导，revisit 指向有效新章节。
- [ ] 含旧 checkpoint attempt 的 Progress fixture 在迁移和新提交后仍保留旧记录。
- [ ] 三个 v1 localStorage 数据源与 V2 key 未删除、重命名或批量重写。
- [ ] 页面不存在 sklearn/模型训练、数据清洗实现、推断统计、因果结论、Pyodide、后端或上传入口。
- [ ] 最终报告明确相关不代表因果并链接 `/data-lab`。
- [ ] 所有视觉和控件具有非空双语 label/alt/fallback，状态不只依赖颜色，键盘可操作。
- [ ] reduced-motion 或交互不可用时，关键教学证据仍在静态内容中可读。
- [ ] 页面源码不维护第二套中文正文、精确统计数值或输出 public path。
- [ ] 阶段四新增结构/内容/路由/教学提示/兼容测试与完整 `npm test` 通过。
- [ ] `npm run build` 与 `npm run build:pages` 通过；完整浏览器矩阵仍留给 Stage 5。
- [ ] 阶段四形成独立提交，不包含 `docs/gpt_advice.md`、Data Lab generated 图片或其他无关文件。

## 7. Edge Coverage

**Coverage：18/18 个适用边界已处理，0 个未解决。**

| 类别 | 需求 | 状态 | 处理结果 |
| --- | --- | --- | --- |
| Empty | R1 | 已覆盖 | 任一语言、章节或教学块为空即验收失败。 |
| Encoding | R1 | 已覆盖 | UTF-8 中文/英文必须无 mojibake，代码与公式按原文本比较。 |
| Adjacency | R2 | 已覆盖 | 重复章节 ID 被拒绝，不能合并或覆盖前项。 |
| Empty | R2 | 已覆盖 | 运行时必须恰好包含 8 章，空目录或缺章失败。 |
| Ordering | R2 | 已覆盖 | 顺序必须逐项等于 typed contract。 |
| Idempotency | R3 | 已覆盖 | 同一旧深链重复导航产生同一最终 URL，不形成循环。 |
| Concurrency | R3 | 已覆盖 | 多个旧深链并行打开只读解析，不写 Progress 或共享状态。 |
| Adjacency | R4 | 已覆盖 | manifest 重复 output ID 被拒绝，每个 ID 只消费一次。 |
| Empty | R4 | 已覆盖 | manifest/资源缺失进入双语 fallback，不产生空白教学区。 |
| Ordering | R4 | 已覆盖 | 输出按契约章节归属展示，不依赖对象枚举偶然顺序。 |
| Concurrency | R4 | 已覆盖 | 重复或并行只读资源加载不复制 UI、不改变学习状态。 |
| Adjacency | R5 | 已覆盖 | 每个 contract mount 只对应一个教学提示，重复挂载失败。 |
| Empty | R5 | 已覆盖 | 必须恰好交付 5 个完整提示，缺少问题、参考思路、误区或 revisit 即失败。 |
| Ordering | R5 | 已覆盖 | 教学提示跟随 contract mount 顺序和章节归属。 |
| Idempotency | R6 | 已覆盖 | 重复加载与提交不删除或覆盖历史 attempt。 |
| Concurrency | R6 | 已驳回 | 阶段四不新增 Progress writer，多标签页合并语义沿用现有实现；只验证没有新增写入路径。 |
| Empty | R8 | 已覆盖 | 每个视觉、控件和 fallback 的双语可访问名称都必须非空。 |
| Encoding | R8 | 已覆盖 | 中文 alt/label/fallback 必须按 UTF-8 正确显示且无乱码。 |

## 8. Prohibitions（必须不做）

**Coverage：5/5 条禁止项已处理，0 条未解决。**

| 禁止项 | 关联需求 | 状态 | 验证方式 |
| --- | --- | --- | --- |
| 不得在运行时模块、组件或教学提示中手抄第二份中文正文、Stage 3 精确数值或输出路径。 | R1、R4 | 已解决 / test | 静态来源与唯一消费测试；具体检查文件在实现计划中落定。 |
| 不得把 5 个教学提示变成输入、计分、提交、Progress 写入、完成状态或章节门槛。 | R5 | 已解决 / test | 提示结构、组件事件、网络与存储副作用测试。 |
| 不得把描述性相关写成因果结论，也不得引入模型训练、清洗实现或推断统计。 | R7 | 已解决 / judgment | 内容边界静态测试加语义审阅；因果措辞由人工/模型复核。 |
| 不得删除、重命名或批量重写现有 Progress/localStorage key 或历史 attempts。 | R6 | 已解决 / test | 带历史 fixture 的兼容测试及存储 key 静态断言。 |
| 不得引入 Pyodide、后端 kernel、文件上传或任意用户代码执行。 | R7 | 已解决 / test | 依赖、源码、网络入口和上传控件的负向断言。 |

安全渲染、XSS、路径注入等通用安全事项继续由项目现有 sanitizer 测试与后续 `$gsd-secure-phase` 负责，本规格不重复创建通用安全禁止项。

## 9. 歧义报告

| 维度 | 分数 | 最低要求 | 状态 | 说明 |
| --- | ---: | ---: | --- | --- |
| Goal Clarity | 0.93 | 0.75 | 通过 | 已锁定 8 章双语网页迁移与权威输出消费。 |
| Boundary Clarity | 0.95 | 0.70 | 通过 | Stage 4、Stage 5、Data Lab、后端与 Progress 边界明确。 |
| Constraint Clarity | 0.90 | 0.65 | 通过 | 路由、manifest、typed schema、public base 和存储兼容已锁定。 |
| Acceptance Criteria | 0.92 | 0.70 | 通过 | 21 条可判定验收项，18 个边界和 5 条禁止项已处理。 |
| **Ambiguity** | **0.07** | **不高于 0.20** | **通过** | 可以进入实现方案讨论。 |

## 10. 访谈记录

| 轮次 | 视角 | 问题 | 已锁定决策 |
| --- | --- | --- | --- |
| 1 | Researcher | 英文对齐、8 章迁移、旧深链、教学停顿与 checkpoint 的目标边界是什么？ | 完整英文语义对齐；8 章替换；5 个旧深链兼容；5 个静态教学提示；checkpoint 机制与历史 Progress 保留。 |
| 2 | Boundary Keeper | 哪些相邻工作必须排除？ | 不生成英文 Notebook；不做清洗、建模、Pyodide、后端、Progress 扩展、Phase 24B/24C 或 Stage 5 浏览器收口。 |
| Edge probe | Failure Analyst | 缺语言、重复章节、资源缺失、重复访问和历史 attempt 会怎样？ | 18 个适用边界全部明确覆盖或有理由驳回。 |
| Prohibition probe | Failure Analyst | 本阶段可能悄悄变成哪些用户不希望的功能？ | 5 条禁止项全部锁定；不得出现第二来源、评分门槛、越界分析、存储破坏或浏览器代码执行。 |

## 11. 下一步

实现方案讨论已经完成。下一步根据实现上下文制定实施计划，覆盖英文内容母版与 typed projection、专用分页页面、manifest loader、受控 Plotly renderer、5 个静态教学提示、旧深链映射和 checkpoint 兼容；实施计划确认前不修改运行时。

---

*Stage: Python Data Tools Stage 4 — English Parity and Runtime Refactor*
*Spec created: 2026-07-15*
*Next step: create the implementation plan, then execute after explicit acceptance*
