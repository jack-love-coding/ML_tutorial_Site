# ML Atlas 统一 Reference 页面

本文统一记录 ML Atlas 后续新增章节会用到的公开学习资料。项目定位为个人自用学习网站，课程内容可以直接摘录、翻译、整理和搬运公开教程中的讲解结构、代码练习、图示思路和实验流程。本文的作用不是限制使用，而是让后续开发能追踪资料来源、复用资料编号，并把引用入口集中到一个页面。

## 使用规则

- 章节设计文档只写 `Ref ID`，不重复放外部链接。
- 新增资料时先在本文登记，再在章节文档中引用对应 `Ref ID`。
- 同一个资源可服务多个章节，不需要为每章重复登记。
- 未来如果要做站内 `/references` 页面，以本文为内容来源，再决定是否转成 typed data。

## Reference 索引

| Ref ID | 标题 | URL | 适用章节 | 可直接搬运 / 摘录范围 | 建议学习顺序 | 备注 |
| --- | --- | --- | --- | --- | --- | --- |
| REF-GOOGLE-MLCC | Google Machine Learning Crash Course | https://developers.google.com/machine-learning/crash-course | AI 入门总览、分类项目、loss/训练诊断补充 | 课程顺序、术语解释、交互练习思路、分类和泛化案例 | 先看 Foundational ML concepts，再看 Classification 和 Production ML Systems 相关内容 | 适合零基础总览和交互文案参考 |
| REF-INRIA-SKLEARN-MOOC | Inria scikit-learn MOOC | https://inria.github.io/scikit-learn-mooc/ | AI 入门总览、端到端项目、模型选择 | tabular data 工作流、pipeline、model evaluation、notebook 练习结构 | 先看 tabular predictive modeling，再看 model evaluation 和 hyperparameter tuning | 很适合作为 sklearn 项目主线 |
| REF-D2L | Dive into Deep Learning | https://d2l.ai/ | AI 入门总览、深度学习章节群 | 章节结构、公式推导、PyTorch/JAX/MXNet/TensorFlow 代码、训练曲线解释 | 先读 linear neural networks 和 MLP，再进入 CNN、Attention、Optimization | 深度学习主教材 |
| REF-SKLEARN-USER-GUIDE | scikit-learn User Guide | https://scikit-learn.org/stable/user_guide.html | AI 入门总览、端到端项目、模型选择 | API 术语、模型族说明、preprocessing/model selection 结构 | 作为术语和 API 校准资料，不建议作为第一阅读材料 | 适合开发时查实现细节 |
| REF-NUMPY-BEGINNER | NumPy: the absolute basics for beginners | https://numpy.org/doc/stable/user/absolute_beginners.html | Python 与 notebook 复现实验 | 数组创建、索引、shape、聚合、CSV、绘图示例 | 先学 array/shape，再学 indexing 和 basic operations | 用于把站内向量/矩阵迁移到 Python |
| REF-PANDAS-GETTING-STARTED | pandas Getting started | https://pandas.pydata.org/docs/getting_started/index.html | Python 与 notebook 复现实验、Data Lab companion | DataFrame、列选择、过滤、缺失、聚合、可视化入口 | 先看 10 minutes to pandas，再看 user guide 中 missing data 和 groupby | 用于表格数据处理主线 |
| REF-PYTHON-DS-HANDBOOK | Python Data Science Handbook | https://jakevdp.github.io/PythonDataScienceHandbook/ | Python 与 notebook 复现实验 | NumPy、pandas、Matplotlib、scikit-learn 的连贯教材式讲解 | 先读 NumPy 与 pandas，再读机器学习章节 | 适合补充 notebook 长教程 |
| REF-PYTORCH-BASICS | PyTorch Learn the Basics | https://docs.pytorch.org/tutorials/beginner/basics/intro | Python 与 notebook 复现实验、MLP/深度学习 companion | tensors、datasets、model、autograd、optimization、save/load | 从 tensors 开始，按官方 basics 顺序读完 | 适合构建 PyTorch 入门 companion |
| REF-INRIA-NUMERICAL-PIPELINE | Inria MOOC: Working with numerical data | https://inria.github.io/scikit-learn-mooc/python_scripts/02_numerical_pipeline_hands_on.html | 第一个端到端项目 | 数值特征 pipeline、train/test split、模型评估 notebook | 在 pandas 基础后阅读 | 房价预测项目的数值特征骨架 |
| REF-SKLEARN-COLUMN-TRANSFORMER | scikit-learn Column Transformer with Mixed Types | https://scikit-learn.org/stable/auto_examples/compose/plot_column_transformer_mixed_types.html | 第一个端到端项目 | ColumnTransformer、Pipeline、数值/类别列并行处理 | 在理解 train/test split 后阅读 | 端到端项目的工程骨架 |
| REF-SKLEARN-COMMON-PITFALLS | scikit-learn common pitfalls | https://scikit-learn.org/stable/common_pitfalls.html | 端到端项目、模型选择 | 数据泄漏、错误 preprocessing、test/train 分离案例 | 做完第一个 pipeline 后阅读 | 可搬运为“泄漏风险检查”小节 |
| REF-SKLEARN-LINEAR-MODELS | scikit-learn linear models guide | https://scikit-learn.org/stable/modules/linear_model.html | 第一个端到端项目、线性模型复习 | LinearRegression、Ridge、Lasso、LogisticRegression 的 API 和解释 | 项目中训练 baseline 前后查阅 | 用于校准模型名和参数 |
| REF-SKLEARN-TEXT-FEATURES | scikit-learn text feature extraction | https://scikit-learn.org/stable/modules/feature_extraction.html#text-feature-extraction | 分类项目 | Bag of Words、tokenizing、counting、TF-IDF、sparse vectors | 做垃圾邮件项目前阅读 | 适合把文本转换为特征向量 |
| REF-SKLEARN-TEXT-GRID-SEARCH | scikit-learn text pipeline and grid search example | https://scikit-learn.org/stable/auto_examples/model_selection/grid_search_text_feature_extraction.html | 分类项目、模型选择 | 文本特征提取、pipeline、分类器、grid search、评估 | 先读 text feature extraction，再读本例 | 垃圾邮件项目代码骨架 |
| REF-SKLEARN-CLASSIFICATION-METRICS | scikit-learn classification metrics | https://scikit-learn.org/stable/modules/model_evaluation.html#classification-metrics | 分类项目 | accuracy、precision、recall、F1、ROC AUC 等指标定义 | 分类实验前后反复查阅 | 用于校准指标定义 |
| REF-GOOGLE-MLCC-CLASSIFICATION | Google MLCC: Classification | https://developers.google.com/machine-learning/crash-course/classification | 分类项目 | 分类输出、阈值、混淆矩阵、指标直觉 | 先读 Classification，再结合 sklearn metrics | 适合转成初学者友好的误区反馈 |
| REF-SKLEARN-CV | scikit-learn Cross-validation | https://scikit-learn.org/stable/modules/cross_validation.html | 模型选择与交叉验证 | holdout、cross_val_score、CV workflow、splitter 说明 | 先理解 train/test split，再读 CV | 模型选择章节主参考 |
| REF-SKLEARN-GRIDSEARCHCV | scikit-learn GridSearchCV | https://scikit-learn.org/stable/modules/generated/sklearn.model_selection.GridSearchCV.html | 模型选择与交叉验证 | grid search 参数、cross-validated search、结果字段 | 在 CV 基础后阅读 | 用于超参数搜索实验 |
| REF-SKLEARN-TREES | scikit-learn Decision Trees | https://scikit-learn.org/stable/modules/tree.html | 决策树与随机森林 | 分类树、回归树、可解释性、过拟合、复杂度 | 先学 split 直觉，再查本页公式和 API | 决策树主参考 |
| REF-SKLEARN-RANDOM-FOREST | scikit-learn Ensembles: Random Forests | https://scikit-learn.org/stable/modules/ensemble.html#forest | 决策树与随机森林 | bootstrap sample、随机特征子集、概率平均、降方差 | 先学单棵树，再学 forest | 随机森林主参考 |
| REF-SKLEARN-ENSEMBLE-EXAMPLES | scikit-learn ensemble examples | https://scikit-learn.org/stable/auto_examples/ensemble/index.html | 决策树与随机森林 | feature importance、bagging、boosting、forest 示例图 | 学完 tree/forest 后挑例子 | 用于实验和图形设计 |
| REF-ISLR | An Introduction to Statistical Learning | https://www.statlearning.com/ | 决策树与随机森林、模型评估 | 树、bagging、random forests、boosting、统计学习框架 | 作为进阶教材阅读 Tree-Based Methods | 理论结构更系统 |
| REF-CS231N-CNN | CS231n CNN notes | https://cs231n.github.io/convolutional-networks/ | CNN 可视化入门 | convolution layer、pooling、architecture、shape、参数计算 | 先读 Conv layer，再读 pooling 和 architectures | CNN 章节主理论参考 |
| REF-D2L-CNN | D2L: Convolutional Neural Networks | https://d2l.ai/chapter_convolutional-neural-networks/index.html | CNN 可视化入门 | 卷积、padding、stride、channels、LeNet、代码 | 与 CS231n 配合阅读 | 可直接搬运为可运行 notebook 结构 |
| REF-PYTORCH-CV-TRANSFER | PyTorch Transfer Learning for Computer Vision | https://docs.pytorch.org/tutorials/beginner/transfer_learning_tutorial.html | CNN 可视化入门、项目型 CNN 练习 | 数据集加载、预训练模型、训练循环、评估 | CNN 基础后阅读 | 用于后续项目型图像分类 |
| REF-CONV-ARITHMETIC | A guide to convolution arithmetic for deep learning | https://arxiv.org/abs/1603.07285 | CNN 可视化入门 | 卷积输出尺寸、padding、stride、transposed convolution 图解 | 做输出尺寸实验前查阅 | 用于校准公式和图示 |
| REF-D2L-ATTENTION | D2L: Attention Mechanisms and Transformers | https://d2l.ai/chapter_attention-mechanisms-and-transformers/index.html | Attention 与 Transformer 入门 | Q/K/V、attention pooling、scoring functions、自注意力、Transformer | 先读 attention pooling，再读 self-attention | Attention 章节主教材 |
| REF-D2L-TRANSFORMER | D2L: Transformer Architecture | https://d2l.ai/chapter_attention-mechanisms-and-transformers/transformer.html | Attention 与 Transformer 入门 | encoder/decoder、multi-head attention、position-wise FFN | 学完 self-attention 后阅读 | 用于 shape 和代码参考 |
| REF-ANNOTATED-TRANSFORMER | The Annotated Transformer | https://nlp.seas.harvard.edu/annotated-transformer/ | Attention 与 Transformer 入门 | 原始 Transformer 的逐段代码实现和解释 | 作为高级参考，不作为零基础第一入口 | 适合“公式到代码” companion |
| REF-HF-LLM-COURSE | Hugging Face LLM Course | https://huggingface.co/learn/llm-course/chapter1/1 | Attention 与 Transformer 入门、LLM 与 RAG 基础 | transformers、tokenizers、datasets、fine-tuning、sharing models | 先看前两章，再进入任务章节 | 连接架构和现代工具链 |
| REF-D2L-OPTIMIZATION | D2L Optimization Algorithms | https://classic.d2l.ai/chapter_optimization/index.html | 优化器对比 | SGD、Momentum、AdaGrad、RMSProp、Adam、learning rate scheduling | 学完 gradient descent 后阅读 | 优化器章节主教材 |
| REF-PYTORCH-OPTIMIZATION | PyTorch Optimizing Model Parameters | https://docs.pytorch.org/tutorials/beginner/basics/optimization_tutorial.html | 优化器对比、PyTorch companion | loss、backward、optimizer step、evaluation loop | PyTorch basics 后阅读 | 用于训练循环代码 |
| REF-PYTORCH-OPTIM | PyTorch torch.optim docs | https://docs.pytorch.org/docs/stable/optim.html | 优化器对比 | optimizer API、学习率、weight decay、optimizer-specific options | 做实现时查阅 | API 校准资料 |
| REF-CS231N-NN3 | CS231n Neural Networks Part 3 | https://cs231n.github.io/neural-networks-3/ | 优化器对比 | evaluation、hyperparameter search、learning rate、regularization、训练实践 | 优化器实验后阅读 | 用于训练诊断和调参策略 |
| REF-HF-RAG-MILVUS | Hugging Face Cookbook: RAG with Hugging Face and Milvus | https://huggingface.co/learn/cookbook/rag_with_hf_and_milvus | LLM 与 RAG 基础 | embedding、Milvus 检索、LLM 生成、RAG pipeline | LLM course 基础后阅读 | RAG 项目实践主参考 |
| REF-HF-RAG-ZEPHYR | Hugging Face Cookbook: Simple RAG using Zephyr and LangChain | https://huggingface.co/learn/cookbook/rag_zephyr_langchain | LLM 与 RAG 基础 | Zephyr、embedding、FAISS、LangChain、GitHub issues RAG | 作为第二个 RAG 实作参考 | 第一版可只抽取 chunking/retrieval/context 流程 |
| REF-MS-GENAI-BEGINNERS | Microsoft Generative AI for Beginners | https://github.com/microsoft/generative-ai-for-beginners | LLM 与 RAG 基础、生成式 AI 扩展 | prompt、RAG、agents、多课时项目和代码 | 作为项目式补充阅读 | 适合后续生成式 AI 章节群 |
| REF-SKLEARN-EXAMPLES | scikit-learn Examples | https://scikit-learn.org/stable/auto_examples/index.html | 多个 sklearn 章节 | 官方示例代码、图表和参数对比 | 按具体章节挑示例 | 跨章节补充资料 |
| REF-PYTORCH-TUTORIALS | PyTorch Tutorials | https://docs.pytorch.org/tutorials/ | PyTorch companion、深度学习章节群 | 官方 tutorials 索引、训练循环、CV/NLP 示例 | 按任务查阅 | 跨章节补充资料 |
| REF-HF-COOKBOOK | Hugging Face Open-Source AI Cookbook | https://huggingface.co/learn/cookbook/index | LLM/RAG 扩展 | RAG、agents、inference、deployment cookbook | LLM 基础后按任务选择 | 跨章节补充资料 |

## 后续站内 Reference 页面规划

- 未来可新增 `/references` lazy route，作为学生和维护者都能访问的资料入口。
- 第一版页面可以直接把本文内容转成静态 typed data，再用表格和章节筛选展示。
- 页面应支持按章节、主题和 `Ref ID` 搜索。
- 当前任务不修改 Vue 路由或组件；站内页面实现放到后续开发。
