# 辅助教材交付与后续优先级

更新：2026-10-15。P0—P3 已于 10 月 4 日分别通过验收、合并并部署，六个单元进入小班试用；依赖修复及首批插图教学改进 #89、#86—#88，以及函数、矩阵与条件概率 #90—#92 已于 10 月 12 日顺序部署。10 月 15 日继续处理偏导图、类别编码及六单元阅读衔接，交付证据见下文。当前边界见 [维护说明](textbook-maintenance.md)，每个 PR 的合并 SHA、部署证据和回退版本见 [发布记录](releases/textbook-refactor-release.md)。单元发布状态只在 `src/curriculum/reading.ts` 维护，不因工程任务完成而自动升级为 published。

## 本轮已交付

| 顺序 | 独立交付 | 合并 PR |
| --- | --- | --- |
| P0 | 数学选读及必要实验；顺序合并原依赖链 | [#64](https://github.com/jack-love-coding/ML_tutorial_Site/pull/64)—[#70](https://github.com/jack-love-coding/ML_tutorial_Site/pull/70) |
| P1-1 | 统一当前维护入口，保留历史规划 | [#71](https://github.com/jack-love-coding/ML_tutorial_Site/pull/71) |
| P1-2 | Ridge/Lasso 公式、参数尺度与参考案例说明 | [#72](https://github.com/jack-love-coding/ML_tutorial_Site/pull/72) |
| P1-3 | 发布资源与浏览器阅读检查由单元状态派生 | [#73](https://github.com/jack-love-coding/ML_tutorial_Site/pull/73) |
| P1-4 | 数学首页摘要、33 门课程分别异步加载 | [#74](https://github.com/jack-love-coding/ML_tutorial_Site/pull/74)、[#75](https://github.com/jack-love-coding/ML_tutorial_Site/pull/75) |
| P1-5 | 单元 3 的 28 节、单元 4 的 11 节分别验收开放 | [#76](https://github.com/jack-love-coding/ML_tutorial_Site/pull/76)、[#77](https://github.com/jack-love-coding/ML_tutorial_Site/pull/77) |
| P2 | 函数与导数最终 provider，内容和结果保持一致 | [#78](https://github.com/jack-love-coding/ML_tutorial_Site/pull/78)、[#79](https://github.com/jack-love-coding/ML_tutorial_Site/pull/79) |
| P2 | 固定浏览器、严格离线预检与部署元数据 | [#80](https://github.com/jack-love-coding/ML_tutorial_Site/pull/80) |
| P3 | 删除退役考核界面，保留兼容存储工具与旧链接 | [#81](https://github.com/jack-love-coding/ML_tutorial_Site/pull/81) |
| P3 | 单元 5 的 30 节分别验收开放 | [#82](https://github.com/jack-love-coding/ML_tutorial_Site/pull/82) |
| P3 | 补齐既有分类项目参考包，再开放单元 6 的 18 节 | [#83](https://github.com/jack-love-coding/ML_tutorial_Site/pull/83)、[#84](https://github.com/jack-love-coding/ML_tutorial_Site/pull/84) |
| 教学完善 | 修复发布依赖、数据课图文错配、导数图与 AI 入门图 | [#89](https://github.com/jack-love-coding/ML_tutorial_Site/pull/89)、[#86](https://github.com/jack-love-coding/ML_tutorial_Site/pull/86)—[#88](https://github.com/jack-love-coding/ML_tutorial_Site/pull/88) |
| 教学完善 | 函数、矩阵和条件概率的精确插图与双语教案 | [#90](https://github.com/jack-love-coding/ML_tutorial_Site/pull/90)—[#92](https://github.com/jack-love-coding/ML_tutorial_Site/pull/92) |
| 教学完善 | 校准偏导图与实验；统一类别词表、四种编码和参考代码；整理六单元主线与选读衔接 | [#94](https://github.com/jack-love-coding/ML_tutorial_Site/pull/94)—[#96](https://github.com/jack-love-coding/ML_tutorial_Site/pull/96) |

2026-10-04 的独立严格套件曾补齐普通测试的条件跳过：67 项通过、0 跳过，原六份及新增两份 SMS Notebook 均离线重运行。该结果是历史证据；10 月 12 日及 10 月 15 日教学改进批次没有重生成 Notebook，普通测试的 28 项条件跳过明确列作本批未验证。完整环境和验证范围见 [可复现验证](reproducible-validation.md)。修改生成器、合同或冻结数据时必须重跑，不能沿用旧结果。

## 后续优先级

2026-10-11 插图与自学教案复查见 [审查记录](teaching-visual-audit-2026-10-11.md)。导数切线符号错误、数据课图文／实验错配、入门预测图与双语读图说明已修复上线；#89 的依赖修复先于三项教学改动部署。该批次线上最终提交为 `ce84bc71`，真实 Pages 另有 33 个浏览器场景通过。

函数 [#90](https://github.com/jack-love-coding/ML_tutorial_Site/pull/90)、矩阵 [#91](https://github.com/jack-love-coding/ML_tutorial_Site/pull/91)、条件概率 [#92](https://github.com/jack-love-coding/ML_tutorial_Site/pull/92) 已按该顺序完成实际 CI、merge commit 合并、Pages 部署和线上验收。函数与矩阵共用样本、特征语义和预测计算，条件概率由同一假设模型生成图和整数计数，原生双语说明连接读图与操作。本地两种构建与专项检查通过；最终远端 1173 项测试、418 个教材浏览器场景通过，真实 Pages 另有 21 个新课件场景通过。最终运行时代码为 `2b3a68ac`，完整证据见 [10 月 12 日审查](teaching-visual-audit-2026-10-12.md) 和 [发布记录](releases/textbook-refactor-release.md)。

10 月 15 日复查覆盖六单元的 120 节阅读清单，并深读编码、偏导、回归案例出口、概率与模型比较。#94 → #95 → #96 均通过实际 CI、merge commit 合并、Pages 部署和线上验收。#96 修复重复插图整理后暴露的旧锚点兼容问题；最终 1,182 项测试、484 个教材浏览器场景通过，三个 PR 部署后另通过真实 Pages 共 75 场景。最终运行时代码为 `223c3f73`。审查范围、保护的公式／代码／冻结资源及限制见 [10 月 15 日审查](teaching-visual-audit-2026-10-15.md)。

后续优先处理课堂试用中的具体理解障碍，并继续检查尚未逐幅实看的密集长图。工程检查证明已覆盖场景的图文、数值、资源与操作一致，不代替学生理解效果的观察。

| 优先级 | 触发条件与工作 | 完成标准 |
| --- | --- | --- |
| P0 | 小班试用发现阅读中断、错误公式或结果、失效资源、移动端无法操作 | 最小复现、针对性修复与回归检查；涉及正文的中英文同步；保留旧链接和历史数据 |
| P1 | 根据课堂反馈修正前置知识、步骤说明、实验解释及单元衔接；优先实看未覆盖的密集长图及手机读图体验 | 每图有明确问题、单位、变量和操作对应，关键结论有原生双语说明；学生能依教材独立复现。每个单元单独内容验收后再决定是否 published，不以考核或行为统计替代 |
| P2 | 需要实质修改某门数学课时，继续收敛该课的历史 enhancer；有可复现性能问题时再拆分相应资源 | 每课独立 provider/PR，双语正文、资源和数值对比通过；用网络或运行指标证明性能改善 |

继续使用现有 Vue、三套 schema、Catalog adapters、按需加载与 GitHub Pages。不新增账号、后台、云端学习记录，不恢复评分和进度功能，不扩展深度学习主线。后续重构以课堂反馈和具体维护问题为依据，避免再建立平行课程或第二套目录。

每个运行时 PR 运行 `npm test`、`npm run build`、`npm run build:pages` 及相关专项检查。浏览器覆盖双语、390px、键盘、reduced motion、资源失败、旧链接和刷新；存储覆盖空存储及预置历史数据逐字节不变。新开放单元由发布元数据自动加入资源和阅读验收。
