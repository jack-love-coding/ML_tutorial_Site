---
gsd_state_version: 1.0
milestone: textbook-pilot
milestone_name: Six-unit companion textbook
status: in_progress
last_updated: "2026-10-04"
current_phase: null
current_plan: null
---

# ML Atlas 当前工作状态

当前任务：合并分阶段教材重构，按试用价值改善主线阅读与维护结构。

执行入口是 [后续重构清单](../docs/textbook-next-steps.md)；已发布范围以课程单元元数据为准；部署 SHA、验证结果和回退点以 `docs/releases/` 中的发布记录为准。

## 当前约束

- 学生界面取消考核和学习行为记录，保留例题讲解与实验。
- 历史存储原样保留，禁止为了退役功能而迁移或清空。
- 继续复用 Phase 28—31 的回归、分类与项目成果，不另建重复课程。
- 每个运行时 PR 检查测试、两种构建及相关浏览器验收。
- 严格离线环境缺失时明确记录跳过项，不视为验证成功。
- 原工作区已有配置和文档改动由用户保有，不覆盖。

旧状态及历次决策完整保留在 [迁移前状态记录](milestones/pre-textbook-2026-10-04/STATE.md)。其中“继续 Part C”“持久保存实验/测验证据”等历史要求不再适用。
