---
gsd_state_version: 1.0
milestone: textbook-pilot
milestone_name: Six-unit companion textbook
status: in_progress
last_updated: "2026-10-12"
current_phase: null
current_plan: null
---

# ML Atlas 当前工作状态

工程整理 #64—#84 已逐项验收、合并并部署，六个单元共 120 节进入小班试用。2026-10-12 完成 #89 → #86 → #87 → #88 的发布后，又按 #90 → #91 → #92 完成函数、矩阵与条件概率课的实际 CI、顺序合并、Pages 部署和真实站点验收。最终运行时代码为 `2b3a68ac26828e80bc685db1a1d2d2092dc330af`，1173 项测试和 418 个教材浏览器场景通过，另有 21 个新课件线上场景通过。三项没有待合并 PR；下一步按课堂反馈修正内容和阅读障碍，逐单元决定正式发布，不继续扩展深度学习主线。发布记录以独立文档提交入库，当前部署 SHA 以线上 release.json 为准。

执行入口是 [交付与后续优先级](../docs/textbook-next-steps.md)；单元状态以 `src/curriculum/reading.ts` 为准；部署 SHA、验证结果和回退点见 [六单元发布记录](../docs/releases/textbook-refactor-release.md)。不要恢复历史阶段；没有设置无人值守自动发布任务。普通测试的 28 项条件跳过在本批未重新验证，不能沿用 10 月 4 日严格套件的通过数代替。

## 当前约束

- 学生界面取消考核和学习行为记录，保留例题讲解与实验。
- 历史存储原样保留，禁止为了退役功能而迁移或清空。
- 继续复用 Phase 28—31 的回归、分类与项目成果，不另建重复课程。
- 每个运行时 PR 检查测试、两种构建及相关浏览器验收。
- 普通 CI 检查冻结产物；重生成必须通过匹配环境的严格套件，不将跳过视为成功。
- 原工作区已有配置和文档改动由用户保有，不覆盖。

旧状态及历次决策完整保留在 [迁移前状态记录](milestones/pre-textbook-2026-10-04/STATE.md)。其中“继续 Part C”“持久保存实验/测验证据”等历史要求不再适用。
