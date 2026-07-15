# Python 数据分析工具课程 Stage 4：讨论记录

> **仅作决策审计。** 不应作为规划、研究或执行代理的输入。
> 实现决策已整理到 implementation context；本文件只保留曾考虑的选项与用户选择。

**Date:** 2026-07-15
**Stage:** python-data-tools-stage-4
**Areas discussed:** 阅读结构与学习者语言、双语内容权威来源、权威输出呈现、教学提示与课程回顾、旧深链与 checkpoint 兼容

---

## 阅读结构与学习者语言

| 议题 | 选项 | Selected |
| --- | --- | --- |
| 八章页面结构 | 专用分页课程；桌面常驻目录、移动端展开目录、稳定章节 URL、上一章/下一章 | ✓ |
| 八章页面结构 | 沿用长篇 `StoryScroller` | |
| 输出位置 | 问题、代码、真实输出、解读、限制就地组成教学节奏 | ✓ |
| 输出位置 | 章末集中结果画廊 | |
| 前端术语 | “运行结果”“图表解读”“分析发现”“需要注意” | ✓ |
| 前端术语 | 直接使用 manifest/output/evidence 等内部术语 | |
| 位置状态 | 只显示“第 X / 8 章”与导航 | ✓ |
| 位置状态 | 显示完成百分比、掌握度或通过状态 | |

**User's choice:** 选择专用分页课程和就地输出节奏；明确要求前端不要使用“证据”等用户难理解的内部词汇，也不需要进度百分比或掌握门槛。

**Notes:** 用户当前优先重构完整教学内容，教师与后续后端负责更强的验收机制。

---

## 双语内容权威来源

| 议题 | 选项 | Selected |
| --- | --- | --- |
| 英文正文来源 | 新增八个与中文一一对应的英文 Markdown 母版，并生成/投影 typed runtime | ✓ |
| 英文正文来源 | 在 Vue/TypeScript 中手写一套英文正文 | |
| 英文风格 | 自然教学英文，同时严格对齐结构、公式、代码、变量、数值和输出 | ✓ |
| 英文风格 | 逐句直译 | |
| 英文图片 | 复用中文 PNG，补英文标题、alt、坐标轴/图例翻译、解读和等价表格 | ✓ |
| 英文图片 | 生成第二套英文 PNG | |
| 防漂移 | 只编辑母版，生成物不可手改，提供 `--check` | ✓ |
| 防漂移 | 允许直接修改 runtime copy | |

**User's choice:** 选择双语 Markdown 母版和生成式 typed projection；英文自然表达但结构与可复现内容完全等价。

**Notes:** 切换语言必须保留当前章节。Stage 3 中文 PNG 保持唯一权威图，不增加英文图片生成范围。

---

## 权威输出呈现

| 议题 | 选项 | Selected |
| --- | --- | --- |
| JSON 展示 | 教学表格/关键值/解释优先，原始只读 JSON 可选展开 | ✓ |
| JSON 展示 | 默认显示原始 JSON | |
| Plotly | 只保留小时范围、工作日分组、hover、zoom、reset 和筛选摘要 | ✓ |
| Plotly | 暴露完整 modebar | |
| 失败处理 | 单个结果块局部降级，保留文字/表格；manifest 允许一次手动重载 | ✓ |
| 失败处理 | 整页报错或无限自动重试 | |
| Notebook 下载 | 页头和最终报告章底部各一个明确入口 | ✓ |
| Notebook 下载 | 只在隐蔽位置提供单个链接 | |

**User's choice:** 选择面向教学的结果呈现、受控 Plotly 和局部 fallback。

**Notes:** 下载文案必须说明这是已执行且包含输出的中文 Notebook，需要本地 Python 环境，不能暗示网页在线执行。

---

## 教学提示与课程回顾

| 议题 | 选项 | Selected |
| --- | --- | --- |
| 五个学习停顿 | 五套可输入、提交或重置的形成性练习 | |
| 五个学习停顿 | 静态“想一想”问题，紧接直接可见的“参考思路”、误区和复看指引 | ✓ |
| 课程末回看 | 保留两个现有机制的 checkpoint，以“课程回顾”呈现 | ✓ |
| 课程末回看 | 删除 checkpoint 或增加更多练习 | |
| 回顾语气 | 参考解释与复看链接，不强调百分比、通过或失败 | ✓ |
| 回顾语气 | 考试/验收式通过判定 | |

**User's choice:** 用户先明确“不需要那么多练习，我目前网站的设计以教学为主”，随后确认静态教学提示方案。

**Notes:** 五个提示没有任何输入、提交、判分、重置、状态、存储或网络行为；只有课程末两个 checkpoint 继续使用现有提交与 Progress。

---

## 旧深链与 checkpoint 兼容

| 议题 | 选项 | Selected |
| --- | --- | --- |
| 旧章节 | 五个旧 ID 分别做显式语义映射 | ✓ |
| 旧章节 | 所有旧 ID 一律回退第一章 | |
| 跳转反馈 | 静默跳转 | ✓ |
| 跳转反馈 | 显示迁移 banner | |
| checkpoint ID | 为两个新问题使用新 ID，旧 attempts 仅保留 | ✓ |
| checkpoint ID | 复用旧 ID 并改变题目含义 | |

**User's choice:** 明确选择以下映射：`notebook-rhythm → notebook-workflow`、`numpy-arrays → numpy-foundations`、`pandas-tables → pandas-structures`、`sklearn-small-model → pandas-analysis`、`reproducible-handoff → analysis-report`。

**Notes:** 新 checkpoint 分别覆盖分组分析解读和相关性限制；未知 ID 才回退第一章。旧 attempt 不删除，也不作为当前题目展示。

---

## the agent's Discretion

- 组件和 loader 的具体文件拆分。
- CSS 细节、typed projection 的序列化格式和生成器实现。
- Plotly 的 Vue 封装方式与局部错误状态的具体视觉样式。

## Deferred Ideas

- 英文 Notebook、英文 PNG、浏览器 Python 或后端 kernel。
- Stage 5 浏览器/移动端/端到端一致性收口。
- 更多交互练习、实战任务和 Progress 重构。

---

*Stage: python-data-tools-stage-4*
*Discussion log generated: 2026-07-15*
