# ML Atlas 改进项开发准备

本文把上一轮教学评估中的 6 个改进方向整理成后续开发可直接拆任务的准备稿。它不是最终实现计划，而是用于对齐范围、验收口径、内容边界和代码落点。

## 总体判断

当前站点已经具备较强的概念教学能力：`Math Lab`、`Data Lab`、`ML Models` 和 `MLP` 能把公式、图像、实验和训练行为连接起来。下一阶段的核心目标不是继续堆章节数量，而是补齐三类学习闭环：

- 从局部概念实验走向端到端项目。
- 从浏览器交互走向 Python notebook 可复现代码。
- 从选择题自测走向任务型复盘和实验记录。

项目定位是个人自用学习网站，后续开发可以直接摘录、翻译、整理和搬运公开教程中的讲解结构、代码练习、图示思路和实验流程。所有外部资料统一登记到 `docs/ml-atlas-references.md`，课程开发文档和章节设计只引用对应 `Ref ID`。

## 1. 增加端到端项目闭环

### 当前问题

站点已经有很多高质量局部实验，例如 loss、gradient descent、线性回归、分类阈值、数据清洗和 MLP 隐藏表征。但零基础学生还缺一条完整路径：拿到一个原始数据集后，如何一步步完成问题定义、EDA、清洗、划分、建模、评估、调参和复盘。

### 学生卡点

- 学生会理解单个概念，但不知道这些概念在真实项目中按什么顺序出现。
- 学生容易把 Data Lab 和 ML Models 看成两个分离区域，而不是同一条工程流水线。
- 学生无法判断一次模型表现变化来自数据处理、特征工程、模型能力、阈值还是评估方式。

### 建议交付

新增一个 `Project Lab` 或 `End-to-End Lab` 主线，首个项目建议使用房价预测或泰坦尼克生还预测。第一版只做一个项目即可，重点是把完整链条做清楚。

推荐章节结构：

1. 问题定义：输入、目标、评价指标、不可用信息。
2. EDA：列类型、缺失、分布、异常值、相关性和初步假设。
3. 数据划分：train/validation/test，避免泄漏。
4. 预处理流水线：数值缩放、类别编码、缺失处理、列顺序。
5. 基线模型：dummy baseline、线性模型或逻辑回归。
6. 评估与误差分析：残差、混淆矩阵、阈值、错误样本。
7. 改进迭代：特征工程、正则化、模型替换。
8. 复盘报告：设置、观察、解释、下一步。

### 可能落点

- `src/modules/project-lab/`：新模块，避免挤进 Data Lab 或 AlgorithmView。
- `src/router/index.ts`：新增 lazy route，例如 `/project-lab` 和 `/project-lab/modules/:moduleId`。
- `src/styles/`：复用现有 module page 和 lab panel 样式。
- `tests/`：新增 project-lab route、schema、资源路径和核心计算测试。
- `docs/ml-atlas-references.md`：统一登记数据来源、字段含义和可搬运资料。

### 验收标准

- 学生能从站点首页进入一个完整项目，而不是只进入局部概念页。
- 项目页至少包含一个真实或拟真的表格数据集、可视化 EDA、预处理流水线、模型训练结果和复盘报告。
- 每一步都能说明“为什么做”和“改变了什么”。
- 有一个明确的最终 checkpoint：学生能用 5-8 句话复述完整 ML 工作流。
- 核心变换和评分逻辑有测试覆盖。

## 2. 增加 Python / notebook 对照练习

### 当前问题

站内 TypeScript 交互实验适合课堂演示和浏览器学习，但学生最终需要把概念迁移到 Python、NumPy、pandas、scikit-learn 或 PyTorch。当前内容中虽然有零散 pandas 片段和 CodeLab，但还不足以形成可复现实验。

### 学生卡点

- 看懂网页实验后，不知道如何在 notebook 中复现。
- 不清楚 `fit`、`transform`、`predict`、`score`、`loss.backward()`、`optimizer.step()` 等代码动作对应站内哪个概念。
- 容易把代码当 API 背诵，而不是把代码和数学/数据流对应起来。

### 建议交付

为每个核心学习段增加 notebook companion：

- `Math Lab`：NumPy 复现向量、矩阵、点积、softmax、梯度数值检查。
- `Data Lab`：pandas 复现列选择、缺失处理、one-hot、train/test split、ColumnTransformer。
- `ML Models`：scikit-learn 复现线性回归、逻辑回归、分类指标、交叉验证。
- `MLP / Deep Learning`：PyTorch 复现张量、Dataset/DataLoader、训练循环、autograd、optimizer。

### 可能落点

- `notebooks/`：如果未来引入 `.ipynb`，建议单独目录并加入测试/渲染策略。
- `docs/notebook-companions/`：第一阶段可先放 `.md` 教程和代码块，后续再生成 notebook。
- `src/modules/*/data/*`：在 typed schema 中增加 `notebookUrl`、`codeCompanion` 或 `practiceTask` 字段。
- `tests/`：检查每个核心模块的 companion 链接存在，代码片段不包含本机路径。

### 验收标准

- 每个核心模块至少有一个“网页实验 -> Python 代码”的映射。
- 代码练习必须包含输入、运行步骤、预期输出和解释任务。
- 代码不能只展示 API，必须标注它对应的公式、变量或实验控件。
- 所有外部 notebook 或 Colab 链接应登记到统一 reference 页面，并在章节设计中使用对应 `Ref ID`。

## 3. 对主线难度做分层

### 当前问题

`Math Lab` 当前覆盖非常广，从零基础线代、微积分、概率，一直到 LU、稀疏矩阵、条件数、有限差分、非线性方程、SVD、PCA 和深度结构数学。内容本身有价值，但零基础学生容易误以为每章都是进入 AI 的必修门槛。

### 学生卡点

- 不知道哪些章节必须先学，哪些可以跳过。
- 在 LU、有限差分、非线性方程等数值计算主题上耗尽耐心，反而推迟进入模型训练。
- 无法根据自己的目标选择路径：理解 AI、做项目、补数学、深挖数值计算需要不同顺序。

### 建议交付

在首页和 `Math Lab` 首页明确提供三条路径：

1. AI 必学主线：向量、矩阵、shape、微积分、Taylor、自动微分、概率、loss、优化、训练诊断、PCA、深度结构。
2. 项目实战主线：Data Lab、loss、线性/逻辑回归、分类、模型选择、端到端项目。
3. 数学加深支线：LU、稀疏矩阵、条件数、特征值、Markov、有限差分、非线性方程、SVD。

每个模块增加难度和路径标签：

- `required-for-ai`
- `project-practical`
- `math-deepening`
- `optional-extension`

### 可能落点

- `src/modules/math-lab/types/mathLab.ts`：确认或扩展 `difficulty`、`enhancementTier`、path tags。
- `src/modules/math-lab/data/modules.ts`：为模块补路径标签。
- `src/modules/math-lab/components/LearningPathMap.vue`：增加筛选或分组显示。
- `src/views/HomeView.vue`：把 roadmap 改成可选路径，而不是单一路线。
- `tests/math-lab-layout.test.mjs`：检查路径标签和首页入口。

### 验收标准

- 零基础学生能一眼看到“先学哪些，哪些可以晚点学”。
- 每个模块能说明它属于必学、项目、加深还是扩展。
- 路径切换不会改变已有模块内容，只改变导航组织和学习建议。
- 首页、Math Lab 首页和模块页的下一步推荐保持一致。

## 4. 将 checkpoint 升级为任务型检查

### 当前问题

当前 checkpoint 主要是选择题，已经能检查概念误区，但不足以验证学生能否独立复现实验和解释现象。真正的学习闭环需要学生完成“设置 -> 观察 -> 解释 -> 下一步”的任务型输出。

### 学生卡点

- 选择题答对后仍可能不会操作实验。
- 学生无法形成自己的实验记录，学完后难以复盘。
- 对 loss 曲线、阈值变化、过拟合等现象只停留在识别层面，缺少解释和行动建议。

### 建议交付

新增 `ExperimentJournal` 或 `LabTaskCheckpoint` 组件，作为选择题后的任务型检查。任务型检查第一版不需要复杂评分，可以先做结构化输入和本地保存。

建议任务模板：

- 实验设置：选择了哪个 preset，改了哪个控件。
- 观察结果：哪个图、指标或样本发生变化。
- 原因解释：用本章变量语言解释为什么。
- 下一步：如果要改进模型或验证猜想，下一步做什么。

### 可能落点

- `src/components/` 或 `src/modules/*/components/`：新增通用任务型 checkpoint。
- `src/utils/progressStorage.ts`：扩展保存结构，注意版本迁移。
- `src/types/ml.ts`、`src/modules/math-lab/types/mathLab.ts`、`src/modules/data-lab/types/dataLab.ts`：增加任务型 checkpoint schema。
- `tests/`：覆盖本地保存、空值处理、完成状态和移动端结构。

### 验收标准

- 至少 3 个核心页面试点：Data Lab 一章、loss 或 linear regression 一章、MLP 一章。
- 学生必须能保存一条实验记录，并在章节页面看到最近记录。
- 任务型 checkpoint 的提示必须引用本章实验控件或图表，不允许泛泛提问。
- 选择题仍保留，用于误区反馈；任务型检查用于复现实验能力。

## 5. 扩展深度学习为完整章节群

### 当前问题

当前 MLP 和 `deep-architecture-math` 已经建立了从隐藏层、反向传播、容量到 CNN/Attention/Transformer 数学结构的桥。但 CNN、Attention、Transformer 还没有形成像线性回归、分类、MLP 那样完整的教学模块。

### 学生卡点

- 能看到 attention 公式，但不知道 token、embedding、Q/K/V、mask、head、context window 在真实模型里如何串起来。
- 能知道 CNN 是卷积窗口，但不知道卷积核、padding、stride、feature map、pooling、分类头如何形成图像分类模型。
- 不了解优化器、batch norm、dropout、residual、scheduler 这些训练技巧如何影响深层网络。

### 建议交付

新增 `Deep Learning` 模块群，不要全部塞进 `Math Lab`：

1. CNN 可视化入门。
2. Attention 与 Transformer 入门。
3. 优化器与训练技巧。
4. LLM 与 RAG 基础。

首批实现建议从 CNN 和 Attention 任选一个做完整模块，另一个先保留资源和章节设计。

这些深度学习章节可以直接整理公开教程中的最小代码、shape 图、训练曲线对比和图示结构；每个外部资料入口统一用 `Ref ID` 追踪。

### 可能落点

- `src/modules/deep-lab/`：如果内容会超过 2 个模块，建议独立模块。
- 或先在 `src/data/` 顶层算法模块新增 `cnnModule.ts`、`attentionModule.ts`。
- `public/deep-lab/generated/`：用于本地生成图和动画 poster。
- `scripts/manim/scenes/`：维护卷积、attention、token flow 的动画。
- `tests/`：覆盖 shape 计算、attention 权重、卷积输出尺寸、资源存在。

### 验收标准

- 每个深度学习模块都要有核心问题、最小例子、公式、交互实验、误区、checkpoint 和统一 reference 记录。
- CNN 模块能让学生手算输出尺寸并解释 feature map。
- Attention 模块能让学生解释 Q/K/V、softmax 权重和 multi-head shape。
- 优化器模块能让学生比较 SGD、Momentum、RMSProp、Adam 的训练曲线差异。

## 6. 修复体验和工程细节

### 当前问题

浏览器抽查时发现两个需要后续处理的问题：

- 开发环境 console 出现 `modules.mlp.sections.linearLimits.title` 缺失的 i18n warning。
- 生产构建中数学渲染和内容 chunk 较大，例如 `MarkdownMathContent` 和 math progress/content chunk，可能影响低端设备首次进入数学章节的体验。

此外，部分桌面导航在移动宽度下会显示大量链接，虽然未观察到横向溢出，但首屏认知负担偏高。

### 建议交付

短期：

- 修复 MLP 章节 key 与 i18n messages 不一致的问题。
- 增加测试，确保 `StorySection.titleKey` 在当前 locale 中存在或有明确 fallback。
- 抽查移动端导航首屏，只保留关键入口，次级模块进入菜单。

中期：

- 分析大 chunk 的来源，优先拆分数学内容数据、KaTeX/markdown 渲染和模块页面。
- 对长章节图片和 Manim 视频继续使用 lazy loading。
- 保持 GitHub Pages base path 测试。

### 可能落点

- `src/i18n/messages.ts`
- `src/data/mlpModule.ts`
- `src/components/AppShell.vue`
- `src/router/index.ts`
- `vite.config.ts`
- `tests/*layout*.test.mjs`
- `tests/build-config.test.mjs`

### 验收标准

- 打开 `/learn/mlp` 不再出现缺失 i18n key warning。
- 新测试能捕捉类似章节 key 缺失。
- 移动端 390px 宽度核心页面无横向溢出，导航不遮挡正文。
- 生产构建仍通过；若做 chunk 拆分，应记录构建前后主要 chunk 变化。

## 推荐开发顺序

1. 先修体验和工程细节，成本低、风险低，能消除明显 warning。
2. 做主线难度分层，让现有内容更容易被零基础学生使用。
3. 试点任务型 checkpoint，先覆盖 3 个核心页面。
4. 增加 notebook companion，先从 Data Lab 和 linear/logistic regression 开始。
5. 做第一个端到端项目闭环。
6. 扩展深度学习章节群。

## Definition of Done

后续真正执行这些改进时，每个改动至少满足：

- 有 typed schema 或明确的数据结构。
- 中英文文案完整。
- public 资源使用本地路径，外部资料入口已登记到 `docs/ml-atlas-references.md`。
- 涉及计算、评分、数据变换和模拟逻辑时有测试。
- 页面级改动有结构测试或浏览器抽查。
- `npm test` 按风险执行，必要时补 `npm run build`。
