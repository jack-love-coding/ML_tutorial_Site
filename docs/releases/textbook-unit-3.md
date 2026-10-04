# 单元 3 试用候选

候选分支：`codex/textbook-12-unit-three`。本批仅将单元 3「第一个可解释模型」改为 `pilot`；实际上线以本 PR 合并后的 Pages 部署成功为准。单元 4—6 仍为 `preview`。

## 内容范围与验收证据

按函数 3 节、线性代数 4 节、回归损失 2 节、导数 3 节、偏导/梯度 2 节，再到完整梯度下降与线性回归课程，共 28 节。函数的预测映射实验和偏导的等高线实验随选读保留；完整专题链接可退出选读。公式、代码、图像与实验使用现有冻结结果，未重新生成数据。

本节问题、前置知识、操作步骤、现象解释和下一步来自同一双语阅读路线。回归入口与最终评估明确 Bike Sharing 是已分析参考案例；Ridge/Lasso 目标函数及教学 λ 与 sklearn α 的尺度说明已经修正。单元最后一节进入复杂度与正则化，继续为房价项目准备评估边界。

执行 `TEXTBOOK_SMOKE_UNITS=unit-3 node scripts/qa/run-textbook-smoke.mjs textbook-route`：28 节 × 中文桌面/英文 390px，共 56 个连续阅读场景通过，逐步核对正文、路径、锚点、下一节、公式、刷新及溢出。数学专项另覆盖选读资源、键盘调参、重置、完整专题和按课加载。40 个存储场景确认空存储不创建学习记录、历史数据逐字节不变。

资源与 manifest 检查由 `pilot/published` 状态推导，包含本批 Math、Algorithm 的实际正文和相关 Notebook 下载。工程门槛为 `npm test`、`npm run build`、`npm run build:pages`、`npm run curriculum:check` 和 `npm run test:published-assets`。本候选普通测试仍有 28 项严格离线环境相关检查未执行；不得据此宣称重生成已验证。

## 发布与回退

本批依赖按课加载 PR，前序 PR 部署通过后才合并。上一可回退候选为 `codex/textbook-11-math-loading`，单元 1—2 试用且单元 3 保持预览。各分支保留到依赖链完成；实际合并 SHA、Pages run 和部署核对记录归入本轮发布总记录。
