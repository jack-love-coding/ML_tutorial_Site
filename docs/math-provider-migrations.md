# 数学课程 provider 迁移记录

本轮只迁移梯度下降、优化器比较、训练代码和曲线诊断三课，每课独立提交和 PR。基线为实际运行时定义（`c1cb70a`），而不是某一层尚未增强的旧正文。

## 内容维护方式

最终正文放在 `src/modules/math-lab/data/calculus*Module.ts`，由 `calculusLessonProviders.ts` 显式登记。总目录根据该登记绕过历史增强器。章节 TOC 由当前 sections 派生，导航顺序仍来自 `mathCourseOrder.ts`；不用重复维护章节清单或下一课关系。

`calculusOptimizationRouteModules.ts` 仅保留尚未迁移课程的增强逻辑，以及完整七课路线的兼容集合。迁移一课后删除它的旧基础正文、专用 lab 配置副本、增强正文和 enhancer 分发项。实验组件与计算函数不随正文迁移改写。

## 6a：梯度下降

- 唯一正文：`calculusGradientDescentModule.ts`。
- 迁移前后均为 7 节，双语解释、公式、变量、代码、数值输出、视觉资产、实验、参考题讲解和章节导航逐字段一致。
- 对排序后的完整运行对象计算 SHA-256：`d61a000aca097eb260854e7e8918c3f49643f01083e9b3fd84bb92ceffcfe704`，迁移前后相同。
- `tests/mathLessonProviders.test.ts` 保存迁移基线指纹。未来有意修改课程内容时，在独立内容提交中说明差异并更新指纹，正文仍只维护一份。

## Notebook 与媒体元数据

九组历史 Notebook 通过 `mathNotebookCompanions.ts` 转为统一的 `MathNotebookCompanion`，在课程注册时附加到 module。页面只读 `moduleDefinition.notebookCompanion`，不识别 Ames 或 numerical batch 编号。媒体继续由课程的 visuals、section visualIds 和 importedAssetPaths 管理。所有公开下载地址、代码和输出保持原样。

扩展浏览器检查发现有限差分与非线性方程两处原有公式字符串把 LaTeX 的反斜线解释成 JavaScript 转义字符。`numericalBatch3Modules.ts` 中两处字符串改用已有 `String.raw` 模式，新增 KaTeX 与控制字符检查。三门试点课的内容指纹不受此修复影响，计算方法和数值结果未变。

6a 验证：`npm test` 1136 通过、28 项离线检查跳过；普通构建、Pages 构建与目录漂移检查通过。`math-providers` 浏览器矩阵通过 24 个场景（三课 + 九组 Notebook，中文桌面/英文 390px），并实际请求下载文件。迁移基线与全部数值测试通过。
