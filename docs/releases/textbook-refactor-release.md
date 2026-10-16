# 六单元辅助教材发布记录

更新：2026-10-16。10 月 4 日从 #64—#70 依赖链开始，随后按教材试用价值完成 #71—#84；10 月 12 日完成首批插图与教案改进，以及函数、矩阵和条件概率三课。10 月 15 日整理偏导梯度图、类别编码和六单元阅读衔接；10 月 16 日继续处理手机密集图，按独立 PR 验收与顺序发布。#63 的课程事实来源重构在上述批次开始前已合并。

## 发布范围

六个单元均为 pilot，主线共 120 节：入门 13、数据输入 20、可解释模型 28、泛化与回归案例 11、分类决策 30、模型比较与分类案例 18。数学和深度学习专题继续可访问；没有扩展深度学习主线，也没有将试用状态改成 published。

保留三套课程 schema、Catalog adapters、双语讲解、公式、实验、代码与 Notebook。学生评分、学习报告和自动记录已退出运行时；旧链接保留兼容，历史数据不清空、不迁移，实验状态留在页面内存，语言偏好继续保存。

## 2026-10-16 手机密集图

| PR | 交付 | PR CI | 合并 SHA | Pages Actions | 通过：测试 / 教材浏览器 / 线上抽查 |
| --- | --- | --- | --- | --- | --- |
| [#98](https://github.com/jack-love-coding/ML_tutorial_Site/pull/98) | 六张窄幅概率图、精确数表与同例教案、旧锚点兼容 | [成功 / 38855862343](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38855862343) | [22e19778](https://github.com/jack-love-coding/ML_tutorial_Site/commit/22e1977874510886d06b72476d883c0f9bb80fa7) | [成功 / 38857369474](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38857369474) | 1185 / 493 / 9 |
| [#99](https://github.com/jack-love-coding/ML_tutorial_Site/pull/99) | 清洗中位数与 pandas 一致、清洗／缩放窄幅图、训练边界与重置 | [成功 / 38860643403](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38860643403) | [beb9a2b9](https://github.com/jack-love-coding/ML_tutorial_Site/commit/beb9a2b98e1639aa941c875a82f51410045fefe0) | [成功 / 38862188769](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38862188769) | 1188 / 511 / 18 |
| [#100](https://github.com/jack-love-coding/ML_tutorial_Site/pull/100) | 向量／shape 窄幅图、统一特征语义、图片锚点选读导航与原代码展示 | [成功 / 38863867098](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38863867098) | [df3fac88](https://github.com/jack-love-coding/ML_tutorial_Site/commit/df3fac880420ec81faec57b111704a86b49c51aa) | [成功 / 38865580374](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38865580374) | 1191 / 521 / 10 |

#98 最终提交 `d1a24dba963681587fb2e0f510aae0f9a92f530f` 的实际 CI 成功后使用 merge commit。旧提交的检查被更新提交取代并取消，不作为通过证据。Pages build/deploy 均成功，线上 `release.json` 的 sha 为 `22e1977874510886d06b72476d883c0f9bb80fa7`、previousSha 为 `fe13e26aac192cda3acd932a516c78fd55a619fa`、runId 为 `38857369474`，随后真实站点九个新图场景通过。

#99 最终提交 `1fdd4c1c430c082c997efdd9f48e1587d0857513` 的实际 CI 成功后使用 merge commit。Pages build/deploy 均成功，线上 sha 为 `beb9a2b98e1639aa941c875a82f51410045fefe0`、previousSha 为 `22e1977874510886d06b72476d883c0f9bb80fa7`、runId 为 `38862188769`；真实站点 18 个清洗／缩放场景通过，包括键盘开关、3.5 中位数、重置、图片失败、刷新及历史存储。该阶段的回退版本为已验证的 `22e19778`。

#100 最终提交 `22ce5db7ed993d21497eeab293d6a13afa629993` 的实际 CI 成功后使用 merge commit。Pages build/deploy 均成功，线上 sha 为 `df3fac880420ec81faec57b111704a86b49c51aa`、previousSha 为 `beb9a2b98e1639aa941c875a82f51410045fefe0`、runId 为 `38865580374`；真实站点 10 个向量场景通过。两张新图、原生双语解释、四节选读、三个旧图片锚点及其下一节、NumPy 代码／输出、完整专题、图片失败和历史存储均受检。

三项运行时 PR 严格依次完成 CI、合并、Pages 和线上检查，随后才创建下一项 PR。最终运行时版本为 `df3fac88`；PR 与合并后的构建均通过 1,191 项测试、521 个教材浏览器场景和 8 项发布资源检查，三个部署后的线上场景共 37 个。各运行时 PR 的本地 `npm test`、`npm run build`、`npm run build:pages` 及相关专项检查也已分别执行。发布记录随后通过文档 PR 入库，文档发布后的最终 SHA、previousSha 和 runId 以在线 [release.json](https://jack-love-coding.github.io/ML_tutorial_Site/release.json) 为准；文档不改变上述运行时内容。

只撤回最后的向量课可使用已验证的 `beb9a2b9`；撤回本批三项改动可使用基线 `fe13e26a`。需要单独撤回中间改动时，通过独立回退 PR 验收，避免直接部署较早版本而同时撤回后续改进。依赖分支保留，原工作区已有文件不覆盖。

本批基线与整批回退点为已验证的 `fe13e26aac192cda3acd932a516c78fd55a619fa`。概率课改用的六个 SVG 合计 8,690 bytes，替代的七张正文 PNG 合计 10,045,440 bytes；旧文件保留，此处比较所替换资源而非首页总流量。六单元仍为 pilot，28 项条件跳过仍属本批未验证，冻结 Notebook 未重生成。审查范围和后续小刻度问题见 [10 月 16 日记录](../teaching-visual-audit-2026-10-16.md)。

## 2026-10-15 偏导图、类别编码与六单元阅读衔接

| PR | 交付 | PR CI | 合并 SHA | Pages Actions | 通过：测试 / 教材浏览器 / 线上抽查 |
| --- | --- | --- | --- | --- | --- |
| [#94](https://github.com/jack-love-coding/ML_tutorial_Site/pull/94) | 偏导梯度图与等高线同一数学模型、主线操作教案 | [成功 / 38724397438](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38724397438) | [72b51a8d](https://github.com/jack-love-coding/ML_tutorial_Site/commit/72b51a8d3effbe81b3d6cadeab74adf5dd189cd1) | [成功 / 38726195914](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38726195914) | 1176 / 427 / 9 |
| [#95](https://github.com/jack-love-coding/ML_tutorial_Site/pull/95) | 统一类别词表、四种编码、精确插图及 Python 参考代码 | [成功 / 38729066752](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38729066752) | [126ec1d5](https://github.com/jack-love-coding/ML_tutorial_Site/commit/126ec1d5f4181846af6e7decd0c7dd0c8e46ff76) | [成功 / 38730820806](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38730820806) | 1179 / 440 / 13 |
| [#96](https://github.com/jack-love-coding/ML_tutorial_Site/pull/96) | 九个主线衔接、两个选读入口、概率去重、CV 指标与正文链接 | [成功 / 38735233391](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38735233391) | [223c3f73](https://github.com/jack-love-coding/ML_tutorial_Site/commit/223c3f73bdf5e8eccd92094742d556825ba7fee4) | [成功 / 38737421414](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38737421414) | 1182 / 484 / 53 |

按 #94 → #95 → #96 顺序交付；每项实际 CI 通过后使用 merge commit，确认对应 Pages 的 build/deploy 成功、在线 release.json 匹配并通过该项真实站点检查后，再创建下一份 PR。本地准备下一批内容不提前改变线上版本。依赖分支保留。

#96 首次 CI [38732801334](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38732801334) 检出重复插图整理后旧图片锚点缺失。修复在课程资源元数据保留三条历史锚点，定位到唯一对应图片；原有验收断言保留，并增加旧链接刷新和路线参数检查。上表列出修复后实际通过的 CI，不将首次失败或简单重跑当作成功。

偏导图和类别图由共享计算生成 SVG，分别校准等高线／梯度方向与词表／组合槽位；源 PNG 保留。类别编码的 597 组 Python 配置逐项匹配网页向量。六单元仍有 120 节，按顺序连续阅读的 240 个双语场景保留；九个主线出口和两个选读入口另交叉验证双语、桌面／390px、键盘、刷新和存储。概率重复图分别归到一个主讲位置，回归课回链目标函数和参数更新的主讲课；CV 示例显式使用负 MAE，并区分回归 dev 内 CV 与短信项目 train 内 CV、validation 选阈值。

每个运行时 PR 本地通过 npm test、npm run build、npm run build:pages、目录及资源检查；远端重新运行完整测试、Pages 构建、Phase 29 矩阵、教材 smoke、8 项资源检查和安全审计。最终 1182 项测试通过、484 个教材浏览器场景通过，另有 75 个本批真实 Pages 场景通过。公式、代码、参考输出与冻结资源的保护范围见 [审查记录](../teaching-visual-audit-2026-10-15.md)。该记录区分实际查看的重点图片与资源清单检查，不表示已逐幅实看所有插图，也不替代学生理解效果的观察。

最终运行时 SHA 为 `223c3f73bdf5e8eccd92094742d556825ba7fee4`，直接前驱为 `126ec1d5f4181846af6e7decd0c7dd0c8e46ff76`，部署 runId 为 `38737421414`。本发布记录随后通过独立文档与验收脚本 PR 入库；该 PR 发布后的最终 sha、previousSha 和 runId 由在线 [release.json](https://jack-love-coding.github.io/ML_tutorial_Site/release.json) 提供，不改变上述运行时内容。

线上阅读衔接检查首次遇到 Pages 为静态目录补尾斜杠，页面实际正常而精确 URL 断言超时。共享检查只归一化路径尾斜杠，继续逐字比较 route 查询和锚点；同一脚本重新通过本地及真实 Pages 各 44 场景。该修正随发布记录入库，不修改学生运行时。

28 项普通套件条件跳过仍为本批未验证；本批没有重生成冻结 Notebook，不能沿用 10 月 4 日严格套件的历史结果。六单元均保持 pilot。用户原工作区的 .planning/config.json 与 docs/gpt_advice.md 保持原样。

撤回最后一项阅读衔接可回到 #95 的 `126ec1d5f4181846af6e7decd0c7dd0c8e46ff76`；撤回本次三项运行时改动可回到批次前已验证的 #93 `8fc685e17f6ed6f85ac17ba3d0ca68e7bfbcdc24`。通过独立回退 PR 或重部署已验证提交执行，保留旧链接和历史数据。

## 2026-10-12 函数、矩阵与条件概率发布

| PR | 交付 | PR CI | 合并 SHA | Pages Actions | 通过：测试 / 教材浏览器 / 线上抽查 |
| --- | --- | --- | --- | --- | --- |
| [#90](https://github.com/jack-love-coding/ML_tutorial_Site/pull/90) | 函数预测与匀速运动图、操作说明 | [成功 / 38227585402](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38227585402) | [39180951](https://github.com/jack-love-coding/ML_tutorial_Site/commit/3918095173d06d722cf9447766443d8148f6c41e) | [成功 / 38232669961](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38232669961) | 1168 / 405 / 8 |
| [#91](https://github.com/jack-love-coding/ML_tutorial_Site/pull/91) | 矩阵批量预测与函数课衔接 | [成功 / 38234242331](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38234242331) | [0901b8f2](https://github.com/jack-love-coding/ML_tutorial_Site/commit/0901b8f252697546c672832f360df766882b1999) | [成功 / 38235645850](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38235645850) | 1170 / 409 / 4 |
| [#92](https://github.com/jack-love-coding/ML_tutorial_Site/pull/92) | 条件概率精确计数、图与实验 | [成功 / 38237166894](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38237166894) | [2b3a68ac](https://github.com/jack-love-coding/ML_tutorial_Site/commit/2b3a68ac26828e80bc685db1a1d2d2092dc330af) | [成功 / 38238386707](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38238386707) | 1173 / 418 / 9 |

严格按 #90 → #91 → #92 推进：前一个部署成功、线上 release.json 匹配并通过该课真实站点检查后，才处理下一个 PR。#91、#92 改为指向 main，同步前序合并提交后确认文件树不变，再等待新 head 的实际 CI，通过后使用 merge commit 合并。依赖分支保留。

最终运行时线上版本为 `2b3a68ac26828e80bc685db1a1d2d2092dc330af`，直接前驱为 `0901b8f252697546c672832f360df766882b1999`，部署 runId 为 `38238386707`；三项均与 GitHub main 和 Actions 核对。六个单元仍为 pilot。发布记录随后通过独立文档 PR 入库，文档发布后的最终 SHA、previousSha 和 runId 由在线 [release.json](https://jack-love-coding.github.io/ML_tutorial_Site/release.json) 记录；文档提交不会改变上述运行时内容。

提交前各课已分别通过 npm test、npm run build、npm run build:pages 及相关专项检查。本轮实际 PR CI 和合并后的部署流程重新执行 npm run test:ci、Pages 构建、Phase 29 浏览器矩阵、完整教材 smoke、8 项发布资源检查、目录／损失展示数据漂移检查及安全审计。最终教材 smoke 共 418 场景，含六单元 120 节的双语连续阅读、历史存储、异步数学加载和三课新图。另在每次真实 Pages 部署后通过函数 8、矩阵 4、条件概率 9，共 21 个场景，包括中英文、1280px／390px、键盘、刷新、自然比例和条件概率图片失败提示。条件概率线上检查确认空存储不新增学习记录、预置历史 keys 逐字节不变。

本轮没有 CI 失败项，未新增运行时代码修复；同步分支只改变合并关系。本批未重生成冻结 Notebook，普通套件的 28 项条件跳过继续列为未验证，不能沿用 10 月 4 日严格套件的结果。用户原工作区的 .planning/config.json 和 docs/gpt_advice.md 保持原样。

撤回条件概率一课可回到已验证的 #91 提交 `0901b8f252697546c672832f360df766882b1999`；撤回本次三课改动可回到 #88 的 `ce84bc71571e4d46e76eda50c6891a952f2a72b3`，保留此前依赖安全修复和数据／导数／入门教学改进。通过独立 PR 或重部署已验证提交回退，保持旧链接及历史存储。

## 2026-10-12 首批插图与教案

| 顺序与 PR | 交付 | PR CI | 合并 SHA | Pages Actions |
| --- | --- | --- | --- | --- |
| [#89](https://github.com/jack-love-coding/ML_tutorial_Site/pull/89) | 修复阻塞发布的依赖漏洞，保留安全审计门槛 | [成功 / 38129732861](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38129732861) | [d880fb22](https://github.com/jack-love-coding/ML_tutorial_Site/commit/d880fb22215f4d4a4ee931ed0d74606cad48eb53) | [成功 / 38216295558](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38216295558) |
| [#86](https://github.com/jack-love-coding/ML_tutorial_Site/pull/86) | 数据划分、泛化图与实验一致，移动端原生图例 | [成功 / 38129735520](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38129735520) | [74f45148](https://github.com/jack-love-coding/ML_tutorial_Site/commit/74f45148e0fd3f507dc1d67bb5f550aba27e64d6) | [成功 / 38218264889](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38218264889) |
| [#87](https://github.com/jack-love-coding/ML_tutorial_Site/pull/87) | 导数切线与差分图由实际 MSE 生成 | [成功 / 38220072911](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38220072911) | [85085963](https://github.com/jack-love-coding/ML_tutorial_Site/commit/85085963b070932c5a7bc29d060989d2b6012fdc) | [成功 / 38221994454](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38221994454) |
| [#88](https://github.com/jack-love-coding/ML_tutorial_Site/pull/88) | AI 入门预测图与双语读图说明 | [成功 / 38224219422](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38224219422) | [ce84bc71](https://github.com/jack-love-coding/ML_tutorial_Site/commit/ce84bc71571e4d46e76eda50c6891a952f2a72b3) | [成功 / 38225519810](https://github.com/jack-love-coding/ML_tutorial_Site/actions/runs/38225519810) |

每次均核对真实站点的 `release.json`。该批次最后一次线上 `sha=ce84bc71571e4d46e76eda50c6891a952f2a72b3`、`previousSha=85085963b070932c5a7bc29d060989d2b6012fdc`、`runId=38225519810` 与当时的 main 及部署一致。六个单元仍为 pilot。依赖分支保留，#87、#88 同步前一个已部署 main 时，分别确认文件树未变化。

在各自部署后的真实 Pages 子路径上，另通过数据课 20、导数图 8、入门图 5 个场景，共 33 个，覆盖中文／英文、1280px／390px、图片与原生说明、实验、刷新及入门图片失败提示。CI 执行完整测试、构建、浏览器矩阵、资源／目录检查和安全审计。普通套件仍有 28 项条件跳过；本批没有重新生成冻结 Notebook，10 月 4 日的严格离线结果不能替代本批重运行证据。

撤回该批次最后一项可采用已验证的 #87 合并提交 `85085963b070932c5a7bc29d060989d2b6012fdc`；撤回该批次全部教学改动而保留依赖修复可采用 #89 的 `d880fb22215f4d4a4ee931ed0d74606cad48eb53`。回退使用独立 PR 或重部署已验证提交，保留旧链接及历史存储。

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
