# 辅助教材交付与后续优先级

更新：2026-10-04。本轮 P0—P3 已分别通过验收、合并并部署，六个单元进入小班试用。当前边界见 [维护说明](textbook-maintenance.md)，每个 PR 的合并 SHA、部署证据和回退版本见 [发布记录](releases/textbook-refactor-release.md)。单元发布状态只在 `src/curriculum/reading.ts` 维护，不因工程任务完成而自动升级为 published。

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

普通测试保留的 28 项条件跳过已通过独立严格套件补齐：67 项通过、0 跳过，原六份及新增两份 SMS Notebook 均离线重运行。完整环境和验证范围见 [可复现验证](reproducible-validation.md)。修改生成器、合同或冻结数据时必须重跑，不能沿用旧结果。

## 后续优先级

| 优先级 | 触发条件与工作 | 完成标准 |
| --- | --- | --- |
| P0 | 小班试用发现阅读中断、错误公式或结果、失效资源、移动端无法操作 | 最小复现、针对性修复与回归检查；涉及正文的中英文同步；保留旧链接和历史数据 |
| P1 | 根据课堂反馈修正前置知识、步骤说明、实验解释及单元衔接 | 学生能依教材独立复现；每个单元单独内容验收后再决定是否 published，不以考核或行为统计替代 |
| P2 | 需要实质修改某门数学课时，继续收敛该课的历史 enhancer；有可复现性能问题时再拆分相应资源 | 每课独立 provider/PR，双语正文、资源和数值对比通过；用网络或运行指标证明性能改善 |

继续使用现有 Vue、三套 schema、Catalog adapters、按需加载与 GitHub Pages。不新增账号、后台、云端学习记录，不恢复评分和进度功能，不扩展深度学习主线。后续重构以课堂反馈和具体维护问题为依据，避免再建立平行课程或第二套目录。

每个运行时 PR 运行 `npm test`、`npm run build`、`npm run build:pages` 及相关专项检查。浏览器覆盖双语、390px、键盘、reduced motion、资源失败、旧链接和刷新；存储覆盖空存储及预置历史数据逐字节不变。新开放单元由发布元数据自动加入资源和阅读验收。
