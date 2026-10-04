# ML Atlas 辅助教材维护入口

本轮将网站整理为基础薄弱学生可自主阅读的双语教材。当前交付路线为 AI 与代码入门、数据输入、线性模型、回归案例、分类决策、模型比较。深入数学和深度学习保持可查阅。

## 内容与运行时的权威来源

- 算法正文、章节和路由：`src/data/moduleCatalog.ts` 的 lazy loaders 指向的实际课程定义。
- 算法领域、难度和先修关系：`src/curriculum/algorithmMetadata.ts`。
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
