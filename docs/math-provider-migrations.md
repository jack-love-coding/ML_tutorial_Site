# 数学课程 provider 迁移记录

按课迁移最终正文，每课独立提交和 PR。最初三课基线为实际运行时定义（`c1cb70a`），函数/导数桥接以各自迁移前的最终运行对象为基线；不以尚未增强的旧正文为基线。

## 内容维护方式

最终正文放在 `src/modules/math-lab/data/calculus*Module.ts`，由 `calculusLessonProviders.ts` 显式登记。总目录根据该登记绕过历史增强器。章节 TOC 由当前 sections 派生，导航顺序仍来自 `mathCourseOrder.ts`；不用重复维护章节清单或下一课关系。

`calculusOptimizationRouteModules.ts` 仅保留尚未迁移课程的增强逻辑，以及完整七课路线的兼容集合。迁移一课后删除它的旧基础正文、专用 lab 配置副本、增强正文和 enhancer 分发项。实验组件与计算函数不随正文迁移改写。

## 函数桥接

`calculusFunctionsModule.ts` 直接提供最终 11 节正文及两个视觉资源、预测映射实验、概念代码输出和例题解释。删除旧 calculus 基础正文、Math-to-Code 内联正文及 minimum-foundation 的函数 enhancer；旧内部 Math-to-Code 集合引用同一个 provider，不再维护另一份正文。完整运行对象 SHA-256 为 `106ba59402424e5450162986b3a5e7ee6fd0893a08c82f4c855311fb910c439b`，迁移前后不变；33 课生成文件逐字节无漂移。

已退出学生页面的旧分层习题双语正文移入 `docs/curriculum/v3/math-to-code/archive/`，保留历史资料。相应测试改为检查当前运行时的概念代码与图片，以及历史练习的归档完整性；没有把旧练习重新放回学生课程。

验证：1147 项测试通过、28 项离线检查跳过；两种构建及生成目录检查通过；26 个 provider/Notebook 浏览器场景和 8 个选读场景通过。

## 6a：梯度下降

- 唯一正文：`calculusGradientDescentModule.ts`。
- 迁移前后均为 7 节，双语解释、公式、变量、代码、数值输出、视觉资产、实验、参考题讲解和章节导航逐字段一致。
- 对排序后的完整运行对象计算 SHA-256：`d61a000aca097eb260854e7e8918c3f49643f01083e9b3fd84bb92ceffcfe704`，迁移前后相同。
- `tests/mathLessonProviders.test.ts` 保存迁移基线指纹。未来有意修改课程内容时，在独立内容提交中说明差异并更新指纹，正文仍只维护一份。

## Notebook 与媒体元数据

九组历史 Notebook 通过 `mathNotebookCompanions.ts` 转为统一的 `MathNotebookCompanion`，在课程注册时附加到 module。页面只读 `moduleDefinition.notebookCompanion`，不识别 Ames 或 numerical batch 编号。媒体继续由课程的 visuals、section visualIds 和 importedAssetPaths 管理。所有公开下载地址、代码和输出保持原样。

扩展浏览器检查发现有限差分与非线性方程两处原有公式字符串把 LaTeX 的反斜线解释成 JavaScript 转义字符。`numericalBatch3Modules.ts` 中两处字符串改用已有 `String.raw` 模式，新增 KaTeX 与控制字符检查。三门试点课的内容指纹不受此修复影响，计算方法和数值结果未变。

6a 验证：`npm test` 1136 通过、28 项离线检查跳过；普通构建、Pages 构建与目录漂移检查通过。`math-providers` 浏览器矩阵通过 24 个场景（三课 + 九组 Notebook，中文桌面/英文 390px），并实际请求下载文件。迁移基线与全部数值测试通过。

## 6b：优化器比较

唯一正文改为 `calculusOptimizerComparisonModule.ts`，删除旧基础正文、optimizerRaceLab 配置副本与 optimize 相关覆盖常量/函数。八节内容、代码结果、例题与实验配置保持一致，完整内容 SHA-256 仍为 `6f76a77f6150c331902f27af90636c34a2a309017dbf9c6f4d4815e885a2921f`。

验证：`npm test` 1136 通过、28 项离线检查跳过；普通/Pages 构建、目录漂移检查通过；24 个数学与 Notebook 浏览器场景通过。可回退到上一课已验证提交 `b324be5`。

## 6c：训练代码和曲线诊断

唯一正文改为 `calculusTrainingCodeDiagnosticsModule.ts`，删除旧基础正文、两份专用 lab 配置副本、训练增强器及不再使用的旧来源条目。八节正文、训练循环顺序、反向传播解释、曲线诊断、代码结果与两个实验配置保持一致。完整内容 SHA-256 仍为 `100ea3ecc74c72a2133c4b28c180db7a517379e66936b455fe6cf6abffac4982`。

验证：`npm test` 1136 通过、28 项离线检查跳过；普通/Pages 构建、目录和展示数据漂移检查、发布资源与哈希检查通过；安全审计 0 漏洞。最终完整浏览器 smoke 157 个场景和 650 个静态入口全部通过，其中数学/Notebook 24 个场景。可回退到上一课已验证提交 `3baf9c3`。
