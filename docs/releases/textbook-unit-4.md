# 单元 4 试用候选

候选分支：`codex/textbook-13-unit-four`。本批仅将单元 4「理解泛化并复现回归案例」改为 `pilot`，待本 PR 合并后的 Pages 部署成功上线。单元 5—6 仍为 `preview`。

11 节从复杂度、过拟合和正则化进入现有房价项目，保留数据划分、基线、预处理、参考结果、残差与失败解释。上一单元末节已验证进入复杂度首节；本批逐章验证进入房价项目，末节继续进入概率单元。Bike Sharing 的参考案例身份与房价的独立冻结数据边界均有双语说明；数据、Notebook 输出和最终评估结果未重新生成。

`TEXTBOOK_SMOKE_UNITS=unit-4 node scripts/qa/run-textbook-smoke.mjs textbook-route` 通过 22 个场景（11 节 × 中文桌面/英文 390px）。实际点击下一节，核对正文、路径/锚点、公式、无水平溢出、刷新、旧链接和跨课程交接。`npm test`、`npm run build`、`npm run build:pages` 及按开放状态运行的资源/manifest 检查是本 PR 工程门槛。严格离线的 28 项检查仍单独列为未验证，未将跳过视作成功。

本批在单元 3 部署成功后独立合并发布。上一可回退候选为 `codex/textbook-12-unit-three`，它只开放单元 1—3。实际合并 SHA 与部署 run 归入本轮发布总记录。发布状态只改变推荐与标签，不限制预览资源访问；历史学习数据和语言偏好保留。
