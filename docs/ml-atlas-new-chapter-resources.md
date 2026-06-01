# ML Atlas 新增章节公开教学资源整理

本文为 10 个建议新增章节整理公开可参考资源。筛选标准不是“能看懂概念简介”，而是优先选择能跟着学习、能跑代码、能支撑教材级章节设计的开放教材、官方文档、大学课程笔记和 notebook 化教程。

使用这些资源时应遵守项目规则：

- 本项目是个人自用学习网站，可以直接摘录、翻译、整理和搬运公开教程中的讲解结构、代码练习、图示思路和实验流程。
- 所有外部资料统一登记在 `docs/ml-atlas-references.md`，本文件只使用 `Ref ID` 指向来源。
- 课程资产优先迁入 `public/`，运行时不要依赖远程图片。
- 代码练习应保留变量解释、预期输出和复盘问题。

## 1. AI 入门总览

### 章节目标

帮助零基础学生先建立全局地图：什么是机器学习，监督学习、无监督学习、深度学习和生成式 AI 各自解决什么问题；一次 ML 项目从问题定义到评估复盘经历哪些步骤。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| Google Machine Learning Crash Course | REF-GOOGLE-MLCC | Google 的自包含 ML 入门课程，包含 videos、interactive visualizations 和 hands-on exercises。适合提取监督学习、loss、泛化、分类和训练诊断的入门顺序。 | 作为“AI 入门总览”的主参考，拆成问题、数据、模型、loss、评估和泛化六个板块。 |
| Inria scikit-learn MOOC | REF-INRIA-SKLEARN-MOOC | 面向 scikit-learn 的完整开放课程，强调 tabular data、pipeline、model evaluation 和 supervised learning。 | 用作“从概念到 sklearn 工作流”的桥接资源。 |
| Dive into Deep Learning | REF-D2L | 开放深度学习教材，覆盖预备数学、线性模型、MLP、CNN、RNN、Attention、Transformer 和优化算法，配套代码。 | 用作 AI 全局路线图中的“后续深度学习路径”参考。 |
| scikit-learn User Guide | REF-SKLEARN-USER-GUIDE | 官方用户指南，覆盖监督学习、无监督学习、模型选择、数据预处理和 common pitfalls。 | 用于校准术语和 sklearn API，不作为初学者正文主讲。 |

### 章节落地建议

- 第一屏给出“输入数据 -> 模型 -> 预测 -> loss/metric -> 迭代”的流程图。
- 加一个“任务类型分拣器”：回归、二分类、多分类、聚类、生成、检索增强。
- 用同一个小表格展示不同任务如何改变 label、metric 和模型选择。
- checkpoint 不问定义，而让学生判断 5 个应用场景分别属于哪类 ML 问题。

## 2. Python 与 notebook 复现实验

### 章节目标

让学生把站内浏览器实验迁移到 Python notebook：NumPy 表达向量和矩阵，pandas 表达表格处理，matplotlib/seaborn 表达图形，scikit-learn 表达训练与评估。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| NumPy: the absolute basics for beginners | REF-NUMPY-BEGINNER | 官方 NumPy 入门，覆盖数组创建、索引、基本运算、聚合、保存 CSV 和 Matplotlib 绘图。 | 作为“向量/矩阵在 Python 中是什么”的主线。 |
| pandas Getting started | REF-PANDAS-GETTING-STARTED | 官方 pandas 入门，包含 DataFrame、列选择、过滤、缺失、聚合和可视化入口。 | 作为 Data Lab notebook companion 的主资源。 |
| Python Data Science Handbook | REF-PYTHON-DS-HANDBOOK | 在线开放书，系统讲 NumPy、pandas、Matplotlib 和 scikit-learn。 | 用作 notebook 章节的教材级补充，尤其适合把数组、表格、图和 ML 统一起来。 |
| scikit-learn Getting Started | REF-SKLEARN-GETTING-STARTED | 官方快速入门，展示 estimator、fit、predict 和最小训练流程。 | 用作“第一个 sklearn 小模型”的 API 校准。 |
| PyTorch Learn the Basics | REF-PYTORCH-BASICS | 官方 PyTorch step-by-step 工作流，包含 tensors、datasets、model、autograd、optimization 和 save/load。 | 用于后续 MLP / deep learning notebook companion。 |

### 章节落地建议

- 每个 notebook cell 后面配一个“网页实验对应关系”说明。
- 第一版不要追求大量 API，重点覆盖 `array`、`DataFrame`、`fit`、`transform`、`predict`、`loss.backward()`。
- 设计一个小练习：用 NumPy 手算 MSE，再用 sklearn 训练线性回归，再比较两者输出。

## 3. 第一个端到端项目：房价预测

### 章节目标

用一个回归问题完整串起数据读取、EDA、清洗、划分、预处理、线性模型、评估、误差分析和复盘报告。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| Inria scikit-learn MOOC: Working with numerical data | REF-INRIA-NUMERICAL-PIPELINE | 用 `train_test_split`、数值 pipeline 和模型评估处理表格数据。 | 作为“数值特征 -> pipeline -> 训练”的主参考。 |
| scikit-learn California housing dataset | REF-SKLEARN-CALIFORNIA-HOUSING | 官方数据集 API，说明 `fetch_california_housing(as_frame=True)`、字段和房价回归目标。 | 用于校准房价预测项目的数据来源和字段命名。 |
| scikit-learn Column Transformer with Mixed Types | REF-SKLEARN-COLUMN-TRANSFORMER | 官方例子，展示数值列 impute/scale、类别列 one-hot、`ColumnTransformer`、`Pipeline` 和 `train_test_split`。 | 用于端到端项目的工程骨架。 |
| scikit-learn common pitfalls | REF-SKLEARN-COMMON-PITFALLS | 官方说明数据泄漏、test/train 分离、不要在 test data 上 `fit`。 | 用作项目中的“泄漏风险检查”章节。 |
| scikit-learn linear models guide | REF-SKLEARN-LINEAR-MODELS | 官方线性模型文档，覆盖 LinearRegression、Ridge、Lasso 等。 | 用作线性基线、正则化和系数解释参考。 |

### 章节落地建议

- 数据可以使用项目已有 California Housing 子集，避免远程依赖。
- 必须包含 baseline：均值预测或 dummy regressor。
- 实验台应同时显示训练/验证误差、残差图、特征变换流水线。
- 最终产出一份“项目复盘卡”：目标、数据、处理、模型、指标、错误样本、下一步。

## 4. 分类项目：垃圾邮件或疾病筛查

### 章节目标

用一个二分类项目把概率、阈值、混淆矩阵、precision/recall、ROC/AUC、校准和错误成本连接起来。垃圾邮件适合文本向量化；疾病筛查适合类别不平衡和错误成本。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| scikit-learn text feature extraction | REF-SKLEARN-TEXT-FEATURES | 官方讲 Bag of Words、tokenizing、counting、TF-IDF 和 sparse text vectors。 | 若选垃圾邮件项目，用作文本变成特征向量的主参考。 |
| scikit-learn sample pipeline for text feature extraction and evaluation | REF-SKLEARN-TEXT-GRID-SEARCH | 文本特征提取、分类器、pipeline、grid search 和评估的完整官方例子。 | 用作垃圾邮件项目的代码骨架。 |
| scikit-learn classification metrics | REF-SKLEARN-CLASSIFICATION-METRICS | 官方指标说明，覆盖 accuracy、precision、recall、F1、ROC AUC 等。 | 用于校准站内分类指标定义。 |
| Google MLCC: Classification | REF-GOOGLE-MLCC-CLASSIFICATION | 初学者友好的分类、阈值和指标解释。 | 用作交互文案和误区反馈参考。 |

### 章节落地建议

- 若做垃圾邮件：展示文本 -> token -> sparse vector -> score -> threshold。
- 若做疾病筛查：展示 prevalence、false negative cost、threshold 移动和 recall tradeoff。
- 必须让学生看到“模型分数没变，阈值一变，预测类别和指标会变”。
- checkpoint 让学生根据业务成本选择阈值，而不是只追求 accuracy。

## 5. 模型选择与交叉验证

### 章节目标

解释为什么不能只看一次 train/test split，如何用 validation、cross-validation、grid search 和 pipeline 做更可靠的模型选择，同时避免数据泄漏。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| scikit-learn Cross-validation | REF-SKLEARN-CV | 官方交叉验证章节，解释 holdout、CV workflow、`train_test_split`、`cross_val_score` 等。 | 作为本章主参考。 |
| scikit-learn GridSearchCV | REF-SKLEARN-GRIDSEARCHCV | 官方 API 和概念，说明通过 cross-validated grid search 优化 estimator parameters。 | 用于超参数搜索实验。 |
| scikit-learn common pitfalls | REF-SKLEARN-COMMON-PITFALLS | 官方泄漏和反模式说明，特别是 preprocessing 必须只从训练数据学习。 | 用作“为什么 pipeline 很重要”的证据。 |
| Inria scikit-learn MOOC | REF-INRIA-SKLEARN-MOOC | MOOC 中有模型评估、调参和 pipeline 练习。 | 用作练习顺序参考。 |

### 章节落地建议

- 交互实验显示同一模型在不同 split 下分数波动。
- 展示错误流程：先全量缩放再切分；正确流程：split 后 pipeline 内部 fit。
- 加一个 grid search 热力图，横轴一个超参数、纵轴另一个超参数，颜色表示 CV 分数。
- checkpoint 要求学生判断某个调参流程是否污染 test set。

## 6. 决策树与随机森林

### 章节目标

补一个非梯度模型，让学生知道并非所有 ML 都靠 loss landscape 和反向传播。重点是树如何用 if-then split 做局部规则，随机森林如何通过 bagging 和 feature randomness 降低单棵树的高方差。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| scikit-learn Decision Trees | REF-SKLEARN-TREES | 官方树模型说明，覆盖分类/回归树、可解释性、过拟合风险、复杂度和例子。 | 作为决策树章节主参考。 |
| scikit-learn Ensembles: Random Forests | REF-SKLEARN-RANDOM-FOREST | 官方 ensemble 说明，解释 bootstrap sample、随机特征子集、概率平均和降方差。 | 作为随机森林章节主参考。 |
| scikit-learn ensemble examples | REF-SKLEARN-ENSEMBLE-EXAMPLES | 官方示例集合，包含 forest feature importances、bagging、boosting 等。 | 用于实验和图形设计。 |
| ISLR: Tree-Based Methods | REF-ISLR | 开放教材 An Introduction to Statistical Learning，包含树、bagging、random forests、boosting。 | 用作教材级理论结构参考。 |

### 章节落地建议

- 可视化从一个二维数据集开始：每次 split 把平面切成矩形区域。
- 显示 Gini / entropy / MSE split 的目标，但先讲直觉，再给公式。
- 对比 shallow tree、deep tree 和 random forest 的边界。
- 加 feature importance 的误区：重要性不等于因果。

## 7. CNN 可视化入门

### 章节目标

让学生理解 CNN 不是“图片魔法”，而是局部共享线性变换、非线性激活、池化和分类头组成的可训练视觉模型。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| CS231n CNN notes | REF-CS231N-CNN | Stanford CS231n 经典 CNN 笔记，覆盖 convolution layer、pooling、architectures、shape 和参数。 | 作为 CNN 章节主理论参考。 |
| Dive into Deep Learning: Convolutional Neural Networks | REF-D2L-CNN | 开放教材章节，配代码，覆盖卷积、padding、stride、channels、LeNet。 | 作为可运行代码和渐进章节结构参考。 |
| PyTorch Transfer Learning for Computer Vision | REF-PYTORCH-CV-TRANSFER | 官方 PyTorch 图像分类迁移学习教程。 | 用于后续项目型 CNN 练习。 |
| A guide to convolution arithmetic for deep learning | REF-CONV-ARITHMETIC | 卷积输出尺寸、padding、stride、transposed convolution 的系统图解论文。 | 用于校准卷积尺寸图和公式。 |

### 章节落地建议

- 第一实验台：输入尺寸、kernel、padding、stride，实时计算输出尺寸。
- 第二实验台：用一个 5x5 小图和 3x3 kernel 手算一次卷积。
- 第三实验台：feature map 叠层，说明 channel 数如何变化。
- checkpoint 要求学生解释为什么卷积参数少于全连接层。

## 8. Attention 与 Transformer 入门

### 章节目标

把 token、embedding、Q/K/V、attention score、softmax、value weighted sum、multi-head、positional encoding 和 residual/norm 串成完整 Transformer block。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| Dive into Deep Learning: Attention Mechanisms and Transformers | REF-D2L-ATTENTION | 从 Q/K/V、attention pooling、scoring functions、自注意力到 Transformer architecture 的完整开放教材，配 PyTorch 等实现。 | 作为主教材。 |
| D2L Transformer Architecture | REF-D2L-TRANSFORMER | 具体实现 Transformer encoder/decoder、multi-head attention 和 position-wise FFN。 | 用于形状和代码参考。 |
| The Annotated Transformer | REF-ANNOTATED-TRANSFORMER | 逐段实现原始 Transformer 的经典教程，包含代码和解释。 | 用作“从公式到代码”的高级参考。 |
| Hugging Face LLM Course | REF-HF-LLM-COURSE | 免费课程，覆盖 Transformer models、tokenizers、datasets、fine-tuning 和分享模型。 | 用作从架构走向现代 LLM 工具链的桥。 |

### 章节落地建议

- 第一实验台：4 个 token 的 Q/K 点积矩阵和 softmax attention heatmap。
- 第二实验台：改变 query 向量，看 attention 权重如何变化。
- 第三实验台：multi-head shape 拆分 `[B, T, H] -> [B, heads, T, d_head]`。
- checkpoint 要求学生指出 softmax 作用在 score matrix 的哪个维度。

## 9. 优化器对比

### 章节目标

在已有 gradient descent 章节上扩展：比较 SGD、Momentum、RMSProp、Adam、weight decay、learning rate schedule 和 batch size 对训练曲线的影响。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| D2L Optimization Algorithms | REF-D2L-OPTIMIZATION | 系统讲深度学习优化挑战、SGD、Momentum、AdaGrad、RMSProp、Adam 和 learning rate scheduling。 | 作为优化器对比主教材。 |
| PyTorch Optimizing Model Parameters | REF-PYTORCH-OPTIMIZATION | 官方 PyTorch 训练循环，展示 loss、backward、optimizer step 和 evaluation loop。 | 用于代码 companion。 |
| PyTorch `torch.optim` docs | REF-PYTORCH-OPTIM | 官方 optimizer API，包括学习率、weight decay 和 optimizer-specific options。 | 用于 API 校准，不作为正文主讲。 |
| CS231n Neural Networks Part 3 | REF-CS231N-NN3 | 讲 evaluation、hyperparameter search、learning rate、regularization 和训练实践。 | 用作训练诊断和调参策略参考。 |

### 章节落地建议

- 用同一 loss landscape 展示 SGD、Momentum 和 Adam 的轨迹差异。
- 用同一 MLP 训练任务展示 learning rate 太小、太大、合适和 schedule 的曲线。
- 增加 batch size 控件，解释噪声梯度和泛化之间的取舍。
- checkpoint 要求学生根据 loss 曲线选择可能的优化器/学习率调整。

## 10. LLM 与 RAG 基础

### 章节目标

让学生理解现代 LLM 应用不只是“调用模型”：需要 tokenization、embedding、检索、chunking、reranking、prompt assembly、grounded answer 和评估。

### 核心资源

| 资源 | Ref ID | 可跟学内容 | 建议用法 |
| --- | --- | --- | --- |
| Hugging Face LLM Course | REF-HF-LLM-COURSE | 免费课程，覆盖 Transformer 使用、tokenizers、datasets、fine-tuning 和 LLM 技术。 | 用作 LLM 基础主线。 |
| Hugging Face Open-Source AI Cookbook: RAG with Hugging Face and Milvus | REF-HF-RAG-MILVUS | 实作 RAG pipeline：embedding、Milvus 检索和 LLM 生成。 | 用作 RAG 项目实践主参考。 |
| Hugging Face Cookbook: Simple RAG using Zephyr and LangChain | REF-HF-RAG-ZEPHYR | 用 Zephyr、embedding、FAISS 和 LangChain 构建 GitHub issues RAG，包含 chunking、retriever 和生成链。 | 用作第二个 RAG 实作参考；第一版可只抽取 chunking、embedding、retrieval 和 context assembly 流程。 |
| Microsoft Generative AI for Beginners | REF-MS-GENAI-BEGINNERS | 公开仓库，包含生成式 AI、prompt、RAG、agents 等多课时材料和代码。 | 用作生成式 AI 章节群的项目式参考。 |

### 章节落地建议

- 第一实验台：把一句话切成 token，展示 token count 和 context window。
- 第二实验台：文档 chunking，展示 chunk size、overlap 和召回片段。
- 第三实验台：RAG pipeline 图，显示 query -> embedding -> retrieval -> context -> answer。
- 增加误区卡：RAG 不等于让模型“学会”新知识；它是在回答时提供外部上下文。
- checkpoint 让学生判断一个失败回答是 retrieval 问题、prompt 问题、generation 问题还是 evaluation 问题。

## 跨章节 Ref ID 索引

以下资源可跨多个新增章节复用；完整链接和搬运范围统一见 `docs/ml-atlas-references.md`。

- REF-GOOGLE-MLCC
- REF-INRIA-SKLEARN-MOOC
- REF-SKLEARN-USER-GUIDE
- REF-SKLEARN-EXAMPLES
- REF-NUMPY-BEGINNER
- REF-PANDAS-GETTING-STARTED
- REF-PYTHON-DS-HANDBOOK
- REF-D2L
- REF-PYTORCH-TUTORIALS
- REF-CS231N-CNN
- REF-HF-LLM-COURSE
- REF-HF-COOKBOOK

## 推荐开发顺序

1. AI 入门总览：先把新路线解释清楚。
2. Python 与 notebook 复现实验：让后续章节都有代码 companion 规范。
3. 房价预测端到端项目：复用现有线性回归和 Data Lab 资产。
4. 分类项目：复用现有 classification 模块和指标实验。
5. 模型选择与交叉验证：补齐评估和调参方法。
6. 决策树与随机森林：引入非梯度模型。
7. CNN、Attention、优化器、LLM/RAG：作为 Deep Learning 扩展阶段逐步实现。

## 资料使用注意事项

- 本站作为个人自用学习网站，后续课程可以直接摘录、翻译、整理和搬运公开资料中的教学结构、代码练习、图示思路和实验流程。
- 每次新增或替换资料时，先更新 `docs/ml-atlas-references.md`，再在章节文档中使用对应 `Ref ID`。
- scikit-learn、NumPy、pandas、PyTorch 官方文档适合 API 和工作流校准；Google MLCC、D2L、Inria MOOC、CS231n 和 Hugging Face 适合作为章节主线。
- Hugging Face 课程和 cookbook 更新较快；实现前应再次确认当前章节路径和依赖。
- 非官方博客可以作为灵感，不应替代 reference 页面中的主资料。
