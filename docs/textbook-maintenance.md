# ML Atlas 辅助教材维护入口

本轮将网站整理为基础薄弱学生可自主阅读的双语教材。当前交付路线为 AI 与代码入门、数据输入、线性模型、回归案例、分类决策、模型比较。深入数学和深度学习保持可查阅。

## 内容与运行时的权威来源

- 算法正文、章节和路由：`src/data/moduleCatalog.ts` 的 lazy loaders 指向的实际课程定义。
- 算法领域、难度和先修关系：`src/curriculum/algorithmMetadata.ts`。
- 算法教学模式：`src/lessons/algorithmTeaching.ts`；分页组件的 lazy import 位于 `algorithmRenderers.ts`。历史 pilot 清单仅供交互协议兼容，不决定页面分发。
- Math/Data 正文：各模块原有 typed providers，继续通过 adapters 接入。
- `src/curriculum/generated/`：构建期投影，不手工编辑；`npm run curriculum:generate` 更新，`npm run curriculum:check` 验证。
- V3 blueprint 和旧阶段文档记录历史或未来设想，不用于判定当前页面已发布。

## 当前实施顺序

| 阶段 | 内容 | 验收 |
| --- | --- | --- |
| 1 | 课程事实来源 | 实际章节、目录、首章和路由一致，overview 不引入全文 |
| 2 | 学习记录退出 | 无学生评分/报告，旧存储字节不变，实验正常 |
| 3 | 六单元阅读路线 | 章节选读、回访、上下节与分享链接一致 |
| 4 | 试用发布 | Pages 深链接、双语浏览器、资源与数据一致性通过 |
| 5 | 算法页面分工 | 加载、导航和教学模式独立，保留 lazy boundaries |
| 6 | 数学 provider | 每门试点课只有一个正文入口，内容与计算一致 |

每阶段独立提交和 PR。未通过验收的阶段不进入后续阶段。PR 可按依赖堆叠，合并仍按顺序；公开部署沿用 main 的 GitHub Pages workflow。

## 学生界面与数据边界

学生阅读、实验和参考讲解均可自由访问，不通过答题或完成状态解锁。保留参数、数值结果、图表、模型评估、数据质量比较和 Notebook 分析报告。学习报告、答题评分、完成标记、诊断和个人进度退出界面。

历史 V1/V2、course-progress、迁移标记和 checkpoint-report 数据不清空、不迁移。实验只用当前页面内存，语言设置可持久保存。存储工具暂留兼容测试，但学生界面不调用。

## 验证与发布

执行 `npm test`、`npm run build`、`npm run build:pages` 和 `npm run curriculum:check`。浏览器验证 zh-CN/en、桌面/390px、键盘、reduced motion、旧链接和 Pages base。发布包完整性与离线 Notebook 重生成分层验证；离线重生成需要对应的 Python 与 wheel 环境，跳过项必须列明。

首批试用入门与数据单元，其余按课程内容和工程验收逐批标记。发布记录必须包含 commit、课程范围、已执行检查、已知限制及上一可回退版本。阶段完成不自动视为公开上线。

## 阶段 2 验证记录

2026-10-03：移除学生运行时的进度、报告和自动记录调用，例题直接显示参考结论。历史存储工具仅供兼容测试。`npm test` 1122 通过、28 个离线资源检查跳过；另增参考结论测试 1 项通过。两种生产构建通过。Pages 浏览器覆盖 20 个入口 × 空/已有存储（桌面中文、390px 英文），刷新、语言切换、键盘调参后历史存储逐字节不变，无溢出或控制台错误。静态产物不包含学习存储 keys。大包警告留待阶段 4 拆分。

## 阶段 3 验证记录

2026-10-03：`src/curriculum/reading.ts` 维护六单元及章节选读；路线页、平铺章节和前后导航均从同一序列生成。首两个单元暂标 preview，阶段 4 通过发布检查后标 pilot。Python 首章的网页语法桥接位于 `src/data/pythonSyntaxBridge.ts`，不改变已执行 Notebook 的分析单元或八章 ID。

`npm test` 1125 通过、28 项离线检查跳过；两种生产构建与专项路由测试通过。Pages 浏览器连续点击 33 节 × 中文桌面/英文 390px，共 66 个场景，验证选读边界、刷新、旧锚点、无溢出及控制台错误。所有章节的上一节/下一节还经过 canonical 转换 round-trip 测试。

## 阶段 4 验证记录

2026-10-03：统一目录生成 650 个 Pages 静态入口，按章节生成损失函数展示数据，发布资源与浏览器 smoke 接入 CI。单元 1—2 标为 pilot。`npm test` 1129 通过、28 项离线检查跳过；两种构建、111 个浏览器场景与全部静态入口检查通过，安全审计 0 个漏洞。完整范围、限制和回退提交见 [本批发布记录](releases/textbook-pilot-2026-10-03.md)。

## 阶段 5 验证记录

2026-10-03：AlgorithmView 从 875 行缩至 496 行。`useAlgorithmCourse` 管理懒加载、选读与失效请求；`useAlgorithmChapterNavigation` 管理章节锁、滚动与清理；`algorithmTeaching.ts` 是 17 门算法课程的教学模式来源，分页组件由 lazy registry 分发。MLP 改为如实登记逐节指导实验，并保留独立探索入口。损失课提示文案移入 `lossReadingNotes.ts`。

样式继续由 `src/styles/views/algorithm-shell.css` 负责页面壳、各 `src/styles/modules/` 课程文件负责实验布局；本阶段不新增全局覆盖规则。数值模拟和课程公式未修改。

`npm test` 1132 通过、28 项离线检查跳过；两种构建与目录漂移检查通过。浏览器原有 111 个场景与 650 个静态入口通过，另有 22 个教学模式场景通过，覆盖分页、滚动、指导实验、MLP/CNN 独立探索、调参/重置、双语/390px 与公式渲染。新增生命周期测试验证旧请求不覆盖新课程，卸载会取消未执行的滚动回调。可通过 `node scripts/qa/run-textbook-smoke.mjs algorithm-modes` 单独复查教学模式。

## 阶段 6a 验证记录

梯度下降最终正文改为独立 provider，九组 Notebook 关联进入课程元数据。1136 项测试通过、28 项离线检查跳过，两种构建与目录检查通过，24 个数学浏览器场景通过。内容一致性指纹、维护方式和两处历史公式转义修复见 [数学 provider 迁移记录](math-provider-migrations.md)。

阶段 6b：优化器比较也已使用独立最终 provider，正文完整指纹不变。1136 项测试、两种构建、目录检查和 24 个数学浏览器场景通过；28 项离线检查跳过。

阶段 6c：训练代码和曲线诊断改为独立最终 provider，三门试点课均绕过历史 enhancer 链。完整内容指纹与数值测试通过。最终测试 1136 通过、28 项离线检查跳过；两种构建、目录/展示数据、发布资源与哈希检查通过；完整浏览器 smoke 157 场景 + 650 静态入口通过；安全审计 0 漏洞。试用单元仍为 1—2，其他单元保持自由预览。本轮未合并 PR 或部署。
