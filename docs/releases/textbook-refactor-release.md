# 六单元辅助教材发布记录

更新：2026-10-12。10 月 4 日从 #64—#70 依赖链开始，随后按教材试用价值完成 #71—#84；10 月 12 日完成依赖修复及首批插图与教案改进。所有运行时 PR 均通过实际 CI 后以 merge commit 合并，确认前一个 Pages 部署后再进入下一项。#63 的课程事实来源重构在上述批次开始前已合并。

## 发布范围

六个单元均为 pilot，主线共 120 节：入门 13、数据输入 20、可解释模型 28、泛化与回归案例 11、分类决策 30、模型比较与分类案例 18。数学和深度学习专题继续可访问；没有扩展深度学习主线，也没有将试用状态改成 published。

保留三套课程 schema、Catalog adapters、双语讲解、公式、实验、代码与 Notebook。学生评分、学习报告和自动记录已退出运行时；旧链接保留兼容，历史数据不清空、不迁移，实验状态留在页面内存，语言偏好继续保存。

## 2026-10-12 插图与教案批次

| 顺序与 PR | 交付 | PR CI | 合并 SHA | Pages Actions |
| --- | --- | --- | --- | --- |
| [#89](https://github.com/jack-love-coding/ML_tutorial_Site/pull/89) | 修复阻塞发布的依赖漏洞，保留安全审计门槛 | [成功 / 38129732861](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38129732861) | [d880fb22](https://github.com/jack-love-coding/ML_tutorial_Site/commit/d880fb22215f4d4a4ee931ed0d74606cad48eb53) | [成功 / 38216295558](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38216295558) |
| [#86](https://github.com/jack-love-coding/ML_tutorial_Site/pull/86) | 数据划分、泛化图与实验一致，移动端原生图例 | [成功 / 38129735520](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38129735520) | [74f45148](https://github.com/jack-love-coding/ML_tutorial_Site/commit/74f45148e0fd3f507dc1d67bb5f550aba27e64d6) | [成功 / 38218264889](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38218264889) |
| [#87](https://github.com/jack-love-coding/ML_tutorial_Site/pull/87) | 导数切线与差分图由实际 MSE 生成 | [成功 / 38220072911](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38220072911) | [85085963](https://github.com/jack-love-coding/ML_tutorial_Site/commit/85085963b070932c5a7bc29d060989d2b6012fdc) | [成功 / 38221994454](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38221994454) |
| [#88](https://github.com/jack-love-coding/ML_tutorial_Site/pull/88) | AI 入门预测图与双语读图说明 | [成功 / 38224219422](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38224219422) | [ce84bc71](https://github.com/jack-love-coding/ML_tutorial_Site/commit/ce84bc71571e4d46e76eda50c6891a952f2a72b3) | [成功 / 38225519810](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38225519810) |

每次均核对真实站点的 `release.json`。最后一次线上 `sha=ce84bc71571e4d46e76eda50c6891a952f2a72b3`、`previousSha=85085963b070932c5a7bc29d060989d2b6012fdc`、`runId=38225519810` 与 main 及部署一致。六个单元仍为 pilot。依赖分支保留，#87、#88 同步前一个已部署 main 时，分别确认文件树未变化。

在各自部署后的真实 Pages 子路径上，另通过数据课 20、导数图 8、入门图 5 个场景，共 33 个，覆盖中文／英文、1280px／390px、图片与原生说明、实验、刷新及入门图片失败提示。CI 执行完整测试、构建、浏览器矩阵、资源／目录检查和安全审计。普通套件仍有 28 项条件跳过；本批没有重新生成冻结 Notebook，10 月 4 日的严格离线结果不能替代本批重运行证据。

撤回最后一项可采用已验证的 #87 合并提交 `85085963b070932c5a7bc29d060989d2b6012fdc`；撤回整批教学改动而保留依赖修复可采用 #89 的 `d880fb22215f4d4a4ee931ed0d74606cad48eb53`。回退使用独立 PR 或重部署已验证提交，保留旧链接及历史存储。

后续函数 [#90](https://github.com/jack-love-coding/ML_tutorial_Site/pull/90)、矩阵 [#91](https://github.com/jack-love-coding/ML_tutorial_Site/pull/91)、条件概率 [#92](https://github.com/jack-love-coding/ML_tutorial_Site/pull/92) 已分别提交，尚未合并或上线。三者的本地内容与浏览器验证见 [本批审查](../teaching-visual-audit-2026-10-12.md)；沿依赖顺序完成远端验收后再发布，不把本地通过或无冲突当作 CI 通过。

## 2026-10-04 合并与部署

| PR | 独立交付 | 合并 SHA | Pages Actions |
| --- | --- | --- | --- |
| [#64](https://github.com/jack-love-coding/ML_tutorial_Site/pull/64) | 退出学生考核与学习记录 | [57938700](https://github.com/jack-love-coding/ML_tutorial_Site/commit/57938700e85aad666913d615ccca80b9ae79a27e) | [成功 / 37180563422](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37180563422) |
| [#65](https://github.com/jack-love-coding/ML_tutorial_Site/pull/65) | 六单元路线、数学选读与必要实验 | [0df23f8b](https://github.com/jack-love-coding/ML_tutorial_Site/commit/0df23f8b42beba60f9c767566691d8e99717896a) | [成功 / 37181052754](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37181052754) |
| [#66](https://github.com/jack-love-coding/ML_tutorial_Site/pull/66) | Pages、资源与浏览器发布门槛 | [5500cb88](https://github.com/jack-love-coding/ML_tutorial_Site/commit/5500cb88e9bda883eda795d2827e6ce896f33b3b) | [成功 / 37181730999](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37181730999) |
| [#67](https://github.com/jack-love-coding/ML_tutorial_Site/pull/67) | 算法课程加载、导航与教学模式分工 | [45aa56dd](https://github.com/jack-love-coding/ML_tutorial_Site/commit/45aa56dd243acfce9d7a94e71a6d7fa44aa1d6d5) | [成功 / 37183283363](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37183283363) |
| [#68](https://github.com/jack-love-coding/ML_tutorial_Site/pull/68) | 梯度下降数学课最终 provider | [383d4b5f](https://github.com/jack-love-coding/ML_tutorial_Site/commit/383d4b5f5e52dd647a2f90d886d573d64fe48eba) | [成功 / 37184291080](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37184291080) |
| [#69](https://github.com/jack-love-coding/ML_tutorial_Site/pull/69) | 优化器比较数学课最终 provider | [f52a4b79](https://github.com/jack-love-coding/ML_tutorial_Site/commit/f52a4b792b3d358ce1617cfc9866d2a07080148e) | [成功 / 37185337737](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37185337737) |
| [#70](https://github.com/jack-love-coding/ML_tutorial_Site/pull/70) | 训练诊断数学课最终 provider | [370cb86a](https://github.com/jack-love-coding/ML_tutorial_Site/commit/370cb86ab15b4e3f8fb9591dc967fab6132c5093) | [成功 / 37186379263](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37186379263) |
| [#71](https://github.com/jack-love-coding/ML_tutorial_Site/pull/71) | 统一当前维护方向与历史规划边界 | [041e2796](https://github.com/jack-love-coding/ML_tutorial_Site/commit/041e279657b79b8344575c608d905cbf3d5a98b6) | [成功 / 37187455581](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37187455581) |
| [#72](https://github.com/jack-love-coding/ML_tutorial_Site/pull/72) | Ridge/Lasso 目标函数与参考案例说明 | [debff17c](https://github.com/jack-love-coding/ML_tutorial_Site/commit/debff17c5d70630c978e84bdb9e536fc9a2bf868) | [成功 / 37188525649](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37188525649) |
| [#73](https://github.com/jack-love-coding/ML_tutorial_Site/pull/73) | 按单元开放状态派生资源和阅读验收 | [fa18dea6](https://github.com/jack-love-coding/ML_tutorial_Site/commit/fa18dea68c6b27313fc274bb9bdcdebf1ddada88) | [成功 / 37189679839](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37189679839) |
| [#74](https://github.com/jack-love-coding/ML_tutorial_Site/pull/74) | 数学资源首页只加载摘要 | [9eddeb27](https://github.com/jack-love-coding/ML_tutorial_Site/commit/9eddeb27236013db104b752906c98d2db4d3a0db) | [成功 / 37190851023](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37190851023) |
| [#75](https://github.com/jack-love-coding/ML_tutorial_Site/pull/75) | 33 门数学课程分别异步加载 | [1976d99e](https://github.com/jack-love-coding/ML_tutorial_Site/commit/1976d99e0a9a9190e5d1b313963cf1084a584d40) | [成功 / 37191954052](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37191954052) |
| [#76](https://github.com/jack-love-coding/ML_tutorial_Site/pull/76) | 单元 3 试用：28 节 | [5a58247d](https://github.com/jack-love-coding/ML_tutorial_Site/commit/5a58247d86722825ecfdcf294658005608bf9972) | [成功 / 37193126481](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37193126481) |
| [#77](https://github.com/jack-love-coding/ML_tutorial_Site/pull/77) | 单元 4 试用：11 节 | [c254e70d](https://github.com/jack-love-coding/ML_tutorial_Site/commit/c254e70d1100806d41e1799bbf3accc110f8a34d) | [成功 / 37194428049](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37194428049) |
| [#78](https://github.com/jack-love-coding/ML_tutorial_Site/pull/78) | 函数桥接最终 provider | [652d7dbb](https://github.com/jack-love-coding/ML_tutorial_Site/commit/652d7dbb745506ea9de62d36317d6b58ab007022) | [成功 / 37195727570](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37195727570) |
| [#79](https://github.com/jack-love-coding/ML_tutorial_Site/pull/79) | 导数桥接最终 provider | [e9d31cd6](https://github.com/jack-love-coding/ML_tutorial_Site/commit/e9d31cd6d9cdf7f590368218aee447b68c2b3662) | [成功 / 37197124396](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37197124396) |
| [#80](https://github.com/jack-love-coding/ML_tutorial_Site/pull/80) | 固定浏览器、严格离线环境与部署元数据 | [865c85be](https://github.com/jack-love-coding/ML_tutorial_Site/commit/865c85be22e18bdf9e09ddf57e154a4e945c5973) | [成功 / 37198623060](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37198623060) |
| [#81](https://github.com/jack-love-coding/ML_tutorial_Site/pull/81) | 删除退役考核界面和专属样式/测试 | [64355fe2](https://github.com/jack-love-coding/ML_tutorial_Site/commit/64355fe223e3fb3d8a4294f63ae181228c792d4e) | [成功 / 37200149265](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37200149265) |
| [#82](https://github.com/jack-love-coding/ML_tutorial_Site/pull/82) | 单元 5 试用：30 节 | [acf7e7b6](https://github.com/jack-love-coding/ML_tutorial_Site/commit/acf7e7b61c79ebe352a1eb17dafc55f81340ed1f) | [成功 / 37201822937](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37201822937) |
| [#83](https://github.com/jack-love-coding/ML_tutorial_Site/pull/83) | 既有分类项目的独立冻结参考包 | [c89e647f](https://github.com/jack-love-coding/ML_tutorial_Site/commit/c89e647f78da3eee5355f13f8022358e320c22a0) | [成功 / 37203771662](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37203771662) |
| [#84](https://github.com/jack-love-coding/ML_tutorial_Site/pull/84) | 单元 6 试用：18 节与模型比较边界 | [3e64217e](https://github.com/jack-love-coding/ML_tutorial_Site/commit/3e64217eb8fa3286679583fe6adadfd2ec7d7cb8) | [成功 / 37205842498](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37205842498) |

10 月 4 日批次最后运行时代码的合并 SHA 为 [3e64217eb8fa3286679583fe6adadfd2ec7d7cb8](https://github.com/jack-love-coding/ML_tutorial_Site/commit/3e64217eb8fa3286679583fe6adadfd2ec7d7cb8)。当时的记录随后以独立文档 PR 入库；当前最终部署 SHA 与 push 前版本由在线 [release.json](https://jack-love-coding.github.io/ML_tutorial_Site/release.json) 记录。检查该文件的 sha、previousSha、runId 与 GitHub main / Actions 对应，不用本地构建的空 SHA 证明上线。

## 2026-10-04 验证结果

- 最终运行时本地 npm test：1155 通过，28 项常规条件跳过；没有失败。各中间运行时阶段也分别执行测试和两种构建。
- npm run build、npm run build:pages、npm run curriculum:check、npm run loss:display:check 通过；8 项发布资源检查覆盖开放单元的 Algorithm、Math、Data 正文、文件存在、来源与 manifest 哈希。
- 完整浏览器验收 364 场景通过，另核对 650 个静态入口。包括 120 节 × 中文桌面/英文 390px 的 240 个连续阅读场景，以及旧链接、刷新、键盘、reduced motion、资源失败提示、实验与公式。
- #84 部署后，真实 Pages 站点另通过 22 个中文桌面/英文 390px 场景：六单元入口直接访问与刷新、分类案例展开代码和下载、数学选读与完整专题、旧进度与诊断链接跳转。路线参数保留，没有公式错误、页面溢出或学习存储改写；在线 release.json 的 sha、previousSha、runId 与本次合并和部署记录一致。
- 40 个全站访问/操作/刷新场景及 12 个分类项目场景验证空存储不新增记录、预置 V1/V2/迁移标记/报告等历史数据逐字节不变。移动端路线、案例正文与展开代码另有实看。
- 数学首页只用摘要；单课请求、重试与快速切课通过 9 个浏览器场景。33 门生成正文逐字段一致；本次测量的单课示例为 61,390 bytes，不再随一课请求整套约 2.1 MB 正文。
- 严格离线套件 67/67 通过、0 跳过，覆盖原六份损失/回归 Notebook、边界及发布事务；随后两份新增 SMS Notebook 使用独立内核重运行，完整包与网页数据逐字节一致，Git 可见文件的 bytes/mtime 不变。普通 CI 的 28 项条件跳过由本轮独立严格验收补齐，详见 [环境与记录](../reproducible-validation.md)。
- 依赖安全审计 0 个漏洞。原工作区 .planning/config.json 与 docs/gpt_advice.md 未被覆盖；没有改动无关 generated PNG。

## 数据与维护入口

Python 与回归的 Bike Sharing 明确标为已分析参考案例；房价使用原独立冻结数据。分类项目复用已有 SMS 原始 CSV，独立冻结规范化去重后的 train/validation/test 编号，训练内选 C、验证集选阈值，锁定后报告 test。新增网页代码、参考数值和两份 Notebook 由一份 Python 流程生成，详见 [分类项目参考包](../classification-project-reference.md)。原有冻结包和数学结果保持不变。

当前维护方向见 [维护入口](../textbook-maintenance.md) 与 [优先级](../textbook-next-steps.md)。单元状态和阅读序列在 src/curriculum/reading.ts；异步数学课程由生成目录和 loadMathLabModule 管理；五门已迁移数学课的 provider 比较见 [迁移记录](../math-provider-migrations.md)。历史规划保留，不再指导恢复考核、后台或进度功能。

## 已知限制与回退

这些单元面向小班试用，尚未升级为正式 published；后续以课堂反馈和内容验收决定。普通 CI 不在不匹配的 Linux 环境中重新冻结 Darwin arm64 合同产物，严格重生成需要匹配缓存。Plotly/Three.js 等既有懒加载大包仍有构建警告；首页轻量和数学按课网络请求已独立验证。

10 月 4 日记录的单元 6 回退版本为 [c89e647f78da3eee5355f13f8022358e320c22a0](https://github.com/jack-love-coding/ML_tutorial_Site/commit/c89e647f78da3eee5355f13f8022358e320c22a0)（#83，单元 1—5 试用、单元 6 预览，[部署成功](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/37203771662)）；该历史版本不含 10 月 12 日依赖修复，不是本次插图改动的回退点。在线 release.json 的 previousSha 是每次部署的直接前驱，文档发布前驱与功能回退版本可能不同。回退通过独立 PR 或重部署已验证提交处理，保留旧 URL 和全部浏览器学习数据，不回写或清除历史 keys。
