// Generated from src/curriculum/catalog.ts. Do not edit by hand.

import type { CurriculumModuleMetadata } from '../types.ts'

export const curriculumCatalogMetadata = [
  {
    "id": "ai-overview",
    "source": {
      "namespace": "algorithm",
      "id": "ai-overview"
    },
    "domain": "foundation",
    "level": "beginner",
    "title": {
      "zh-CN": "AI 入门总览",
      "en": "AI Overview"
    },
    "summary": {
      "zh-CN": "用房价、垃圾邮件、用户分组和 RAG 问答这些具体例子，帮零基础学生先看懂 AI 到底在替人做什么判断。",
      "en": "Use house prices, spam detection, user grouping, and RAG QA to show beginners what AI is doing on behalf of people."
    },
    "route": "/learn/ai-overview",
    "estimatedMinutes": 60,
    "prerequisiteIds": [],
    "outcomeIds": [
      "ai-overview-training-loop-order",
      "ai-overview-field-roles",
      "ai-overview-paradigm-signal",
      "ai-overview-kmeans-direction",
      "ai-overview-q-value-direction"
    ],
    "relatedModuleIds": [
      "beginner-linear-algebra",
      "numerical-data"
    ],
    "legacyRoute": "/learn/ai-overview"
  },
  {
    "id": "python-notebook",
    "source": {
      "namespace": "algorithm",
      "id": "python-notebook"
    },
    "domain": "foundation",
    "level": "beginner",
    "title": {
      "zh-CN": "Python 数据分析工具：从 Notebook 到可复现报告",
      "en": "Python Data Tools: From Notebook to Reproducible Report"
    },
    "summary": {
      "zh-CN": "八章课程把数组、表格、分组统计、静态图表、交互探索与分析报告连成一条完整的数据分析路径。",
      "en": "Eight chapters connect arrays, tables, grouped summaries, static charts, interactive exploration, and an analysis report into one complete data-analysis path."
    },
    "route": "/learn/python-notebook",
    "estimatedMinutes": 60,
    "prerequisiteIds": [],
    "outcomeIds": [
      "python-data-tools-grouped-analysis-interpretation",
      "python-data-tools-correlation-not-causation"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/python-notebook"
  },
  {
    "id": "housing-price-project",
    "source": {
      "namespace": "algorithm",
      "id": "housing-price-project"
    },
    "domain": "project",
    "level": "beginner",
    "title": {
      "zh-CN": "第一个端到端项目：房价预测",
      "en": "First End-to-End Project: Housing Price Prediction"
    },
    "summary": {
      "zh-CN": "用 California housing 风格数据把 Data Lab、线性回归和 sklearn Pipeline 接起来，重点讲清数据泄漏、baseline、MAE、R² 和下一轮迭代。",
      "en": "Use California-housing-style data to connect Data Lab, linear regression, and sklearn Pipeline, focusing on leakage, baseline, MAE, R², and iteration."
    },
    "route": "/learn/housing-price-project",
    "estimatedMinutes": 72,
    "prerequisiteIds": [],
    "outcomeIds": [
      "housing-project-leakage",
      "housing-project-evaluation"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/housing-price-project"
  },
  {
    "id": "classification-project",
    "source": {
      "namespace": "algorithm",
      "id": "classification-project"
    },
    "domain": "project",
    "level": "intermediate",
    "title": {
      "zh-CN": "分类项目：垃圾邮件筛查",
      "en": "Classification Project: Spam Screening"
    },
    "summary": {
      "zh-CN": "用 spam/ham 项目连接文本向量化、LogisticRegression、precision、recall、ROC/AUC 和 false positive / false negative 取舍。",
      "en": "Use a spam/ham project to connect text vectorization, LogisticRegression, precision, recall, ROC/AUC, and false positive / false negative tradeoffs."
    },
    "route": "/learn/classification-project",
    "estimatedMinutes": 72,
    "prerequisiteIds": [],
    "outcomeIds": [
      "classification-project-vectorizer-leakage",
      "classification-project-threshold-cost"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/classification-project"
  },
  {
    "id": "model-selection",
    "source": {
      "namespace": "algorithm",
      "id": "model-selection"
    },
    "domain": "model",
    "level": "intermediate",
    "title": {
      "zh-CN": "模型选择与交叉验证",
      "en": "Model Selection and Cross-Validation"
    },
    "summary": {
      "zh-CN": "把 train/validation/test、K-fold CV、预处理泄漏、param_grid、mean_test_score 和最终 test 复盘串成可复现调参流程。",
      "en": "Connect train/validation/test, K-fold CV, preprocessing leakage, param_grid, mean_test_score, and final test review into a reproducible tuning workflow."
    },
    "route": "/learn/model-selection",
    "estimatedMinutes": 72,
    "prerequisiteIds": [],
    "outcomeIds": [
      "model-selection-test-peeking",
      "model-selection-pipeline-cv"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/model-selection"
  },
  {
    "id": "tree-forest",
    "source": {
      "namespace": "algorithm",
      "id": "tree-forest"
    },
    "domain": "model",
    "level": "intermediate",
    "title": {
      "zh-CN": "决策树与随机森林",
      "en": "Decision Trees and Random Forests"
    },
    "summary": {
      "zh-CN": "从二维矩形 split、Gini/entropy/MSE、max_depth 过拟合到 bagging、随机特征和 feature importance 误区，补齐树模型直觉。",
      "en": "Build tree intuition from 2D rectangular splits, Gini/entropy/MSE, max_depth overfitting, bagging, random features, and feature-importance pitfalls."
    },
    "route": "/learn/tree-forest",
    "estimatedMinutes": 72,
    "prerequisiteIds": [],
    "outcomeIds": [
      "tree-forest-depth-overfit",
      "tree-forest-importance-causality"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/tree-forest"
  },
  {
    "id": "cnn-visualization",
    "source": {
      "namespace": "algorithm",
      "id": "cnn-visualization"
    },
    "domain": "deep-learning",
    "level": "intermediate",
    "title": {
      "zh-CN": "CNN 可视化入门",
      "en": "CNN Visualization Primer"
    },
    "summary": {
      "zh-CN": "从局部连接、参数共享、输出尺寸公式、channel 变化到迁移学习复盘，让 CNN 从“图片魔法”变成可算、可解释的视觉模型。",
      "en": "Turn CNNs from image magic into computable visual models through local connectivity, weight sharing, output-size formulas, channel changes, and transfer-learning review."
    },
    "route": "/learn/cnn-visualization",
    "estimatedMinutes": 72,
    "prerequisiteIds": [],
    "outcomeIds": [
      "cnn-visualization-parameter-sharing",
      "cnn-visualization-shape"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/cnn-visualization"
  },
  {
    "id": "sequence-embedding-bridge",
    "source": {
      "namespace": "algorithm",
      "id": "sequence-embedding-bridge"
    },
    "domain": "deep-learning",
    "level": "intermediate",
    "title": {
      "zh-CN": "序列与 Embedding 桥接",
      "en": "Sequence and Embedding Bridge"
    },
    "summary": {
      "zh-CN": "用一个小型桥接课说明 token id 不是连续特征，embedding 是可训练查表，position 和 mask 如何让序列安全交给 attention。",
      "en": "Use one small bridge lesson to show that token ids are not continuous features, embeddings are trainable lookup, and position plus mask prepare sequences for attention."
    },
    "route": "/learn/sequence-embedding-bridge",
    "estimatedMinutes": 60,
    "prerequisiteIds": [],
    "outcomeIds": [
      "sequence-embedding-token-axis",
      "sequence-embedding-position-role"
    ],
    "relatedModuleIds": [
      "tensor-shapes-vectorization",
      "attention-transformer"
    ],
    "legacyRoute": "/learn/sequence-embedding-bridge"
  },
  {
    "id": "attention-transformer",
    "source": {
      "namespace": "algorithm",
      "id": "attention-transformer"
    },
    "domain": "deep-learning",
    "level": "advanced",
    "title": {
      "zh-CN": "Attention 与 Transformer 入门",
      "en": "Attention and Transformer Primer"
    },
    "summary": {
      "zh-CN": "用 4 个 token 的注意力矩阵、[B,T,H] 到 [B,heads,T,d_head] 的形状拆分和 block 流程，建立 Transformer 的可计算直觉。",
      "en": "Build computable Transformer intuition with a 4-token attention matrix, [B,T,H] to [B,heads,T,d_head] shape splits, and the full block flow."
    },
    "route": "/learn/attention-transformer",
    "estimatedMinutes": 72,
    "prerequisiteIds": [],
    "outcomeIds": [
      "attention-transformer-softmax-dimension",
      "attention-transformer-qkv-role"
    ],
    "relatedModuleIds": [
      "sequence-embedding-bridge",
      "llm-rag"
    ],
    "legacyRoute": "/learn/attention-transformer"
  },
  {
    "id": "optimizer-comparison",
    "source": {
      "namespace": "algorithm",
      "id": "optimizer-comparison"
    },
    "domain": "model",
    "level": "intermediate",
    "title": {
      "zh-CN": "优化器对比",
      "en": "Optimizer Comparison"
    },
    "summary": {
      "zh-CN": "用同一训练循环和曲线诊断方法，解释优化器为何影响下降速度、震荡、稳定性、泛化和下一步调参。",
      "en": "Use one training loop and curve-diagnosis method to explain why optimizers affect descent speed, oscillation, stability, generalization, and next-step tuning."
    },
    "route": "/learn/optimizer-comparison",
    "estimatedMinutes": 72,
    "prerequisiteIds": [],
    "outcomeIds": [
      "optimizer-comparison-loop-order",
      "optimizer-comparison-learning-rate"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/optimizer-comparison"
  },
  {
    "id": "llm-rag",
    "source": {
      "namespace": "algorithm",
      "id": "llm-rag"
    },
    "domain": "deep-learning",
    "level": "advanced",
    "title": {
      "zh-CN": "LLM 与 RAG 基础",
      "en": "LLM and RAG Basics"
    },
    "summary": {
      "zh-CN": "串起 Transformer 输出、next-token 生成与 RAG，并说明 RAG 是回答时组织外部资料，不是让模型重新训练。",
      "en": "Connect Transformer outputs to next-token generation and RAG, while showing that RAG organizes external material at answer time rather than retraining the model."
    },
    "route": "/learn/llm-rag",
    "estimatedMinutes": 96,
    "prerequisiteIds": [
      "attention-transformer"
    ],
    "outcomeIds": [
      "llm-rag-not-training",
      "llm-rag-failure-source"
    ],
    "relatedModuleIds": [
      "attention-transformer",
      "linear-algebra-distance-similarity"
    ],
    "legacyRoute": "/learn/llm-rag"
  },
  {
    "id": "loss-functions",
    "source": {
      "namespace": "algorithm",
      "id": "loss-functions"
    },
    "domain": "model",
    "level": "beginner",
    "title": {
      "zh-CN": "损失函数与似然",
      "en": "Loss Functions & Likelihood"
    },
    "summary": {
      "zh-CN": "先理解误差、损失、目标，再理解回归损失、分类损失、似然和负对数似然，最后把它们和 MLE 连成一条完整教学链。",
      "en": "Move from error and objectives to regression losses, classification losses, likelihood, negative log-likelihood, and finally the MLE view behind familiar losses."
    },
    "route": "/learn/loss-functions",
    "estimatedMinutes": 72,
    "prerequisiteIds": [],
    "outcomeIds": [
      "loss-error-rule",
      "loss-nll-scale"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/loss-functions"
  },
  {
    "id": "gradient-descent",
    "source": {
      "namespace": "algorithm",
      "id": "gradient-descent"
    },
    "domain": "model",
    "level": "beginner",
    "title": {
      "zh-CN": "梯度下降",
      "en": "Gradient Descent"
    },
    "summary": {
      "zh-CN": "从损失函数开始，再到梯度、步长、鞍点和局部极小值，把优化过程讲成可实验的地形探索。",
      "en": "Start from the loss function itself, then connect gradients, step sizes, saddle points, and local minima through a single interactive lab."
    },
    "route": "/learn/gradient-descent",
    "estimatedMinutes": 72,
    "prerequisiteIds": [
      "loss-functions"
    ],
    "outcomeIds": [
      "gd-learning-rate-stability",
      "gd-nonconvex-start"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/gradient-descent"
  },
  {
    "id": "linear-regression",
    "source": {
      "namespace": "algorithm",
      "id": "linear-regression"
    },
    "domain": "model",
    "level": "beginner",
    "title": {
      "zh-CN": "线性回归",
      "en": "Linear Regression"
    },
    "summary": {
      "zh-CN": "从拟合一条线开始，逐步走到残差、损失、参数更新和模型边界，让线性回归成为一门完整独立的教学页。",
      "en": "Start by fitting a line, then move through residuals, loss, parameter updates, and model limits so linear regression stands on its own."
    },
    "route": "/learn/linear-regression",
    "estimatedMinutes": 96,
    "prerequisiteIds": [
      "loss-functions"
    ],
    "outcomeIds": [
      "linear-residual-mse",
      "linear-regularization-validation"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/linear-regression"
  },
  {
    "id": "logistic-regression",
    "source": {
      "namespace": "algorithm",
      "id": "logistic-regression"
    },
    "domain": "model",
    "level": "beginner",
    "title": {
      "zh-CN": "逻辑回归",
      "en": "Logistic Regression"
    },
    "summary": {
      "zh-CN": "在学过损失函数之后，再看交叉熵如何实际推动线性边界移动，并理解线性模型的能力边界。",
      "en": "After learning loss functions, revisit how cross-entropy actually moves a linear boundary and where linear models hit their limit."
    },
    "route": "/learn/logistic-regression",
    "estimatedMinutes": 72,
    "prerequisiteIds": [
      "loss-functions"
    ],
    "outcomeIds": [
      "logistic-score-sigmoid",
      "logistic-threshold-confidence"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/logistic-regression"
  },
  {
    "id": "classification",
    "source": {
      "namespace": "algorithm",
      "id": "classification"
    },
    "domain": "model",
    "level": "intermediate",
    "title": {
      "zh-CN": "分类评估",
      "en": "Classification"
    },
    "summary": {
      "zh-CN": "独立补全分类教学：学生可以拖动阈值、改变类别比例和错误成本，并观察指标、ROC 曲线、校准分箱和 softmax 单纯形如何同步变化。",
      "en": "A complete classification module where students drag thresholds, change prevalence and error costs, and watch metrics, ROC, calibration bins, and the softmax simplex update together."
    },
    "route": "/learn/classification",
    "estimatedMinutes": 96,
    "prerequisiteIds": [
      "logistic-regression"
    ],
    "outcomeIds": [
      "classification-precision-recall",
      "classification-roc-calibration"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/classification"
  },
  {
    "id": "mlp",
    "source": {
      "namespace": "algorithm",
      "id": "mlp"
    },
    "domain": "deep-learning",
    "level": "intermediate",
    "title": {
      "zh-CN": "浅层 MLP",
      "en": "Shallow MLP"
    },
    "summary": {
      "zh-CN": "从“隐藏层在做什么”出发，让学生看到神经网络不是魔法，而是空间重构。",
      "en": "Show students that neural networks are not magic: they create new feature spaces and classify inside them."
    },
    "route": "/learn/mlp",
    "estimatedMinutes": 96,
    "prerequisiteIds": [
      "classification"
    ],
    "outcomeIds": [
      "mlp-hidden-representation",
      "mlp-capacity-generalization"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/learn/mlp"
  },
  {
    "id": "beginner-linear-algebra",
    "source": {
      "namespace": "math-lab",
      "id": "beginner-linear-algebra"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "AI 零基础线性代数",
      "en": "Linear Algebra for AI Beginners"
    },
    "summary": {
      "zh-CN": "从一个样本向量走到批量矩阵、shape 账本和可复现的 NumPy 预测。",
      "en": "Move from one example vector to a batch matrix, a shape ledger, and a reproducible NumPy prediction."
    },
    "route": "/math-lab/modules/beginner-linear-algebra",
    "estimatedMinutes": 60,
    "prerequisiteIds": [],
    "outcomeIds": [
      "beginner-linear-algebra:objective-1",
      "beginner-linear-algebra:objective-2",
      "beginner-linear-algebra:objective-3",
      "beginner-linear-algebra:objective-4"
    ],
    "relatedModuleIds": [
      "linear-algebra-feature-space"
    ],
    "legacyRoute": "/math-lab/modules/beginner-linear-algebra"
  },
  {
    "id": "linear-algebra-feature-space",
    "source": {
      "namespace": "math-lab",
      "id": "linear-algebra-feature-space"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "向量与样本表示：一次预测如何读懂多个特征",
      "en": "Vectors and Sample Representation: Reading Multiple Features in One Prediction"
    },
    "summary": {
      "zh-CN": "用统一学习画像连接特征轴、单位、shape、差向量与高维表示。",
      "en": "Use shared learning profiles to connect feature axes, units, shapes, difference vectors, and high-dimensional representations."
    },
    "route": "/math-lab/modules/linear-algebra-feature-space",
    "estimatedMinutes": 70,
    "prerequisiteIds": [
      "beginner-linear-algebra"
    ],
    "outcomeIds": [
      "linear-algebra-feature-space:objective-1",
      "linear-algebra-feature-space:objective-2",
      "linear-algebra-feature-space:objective-3",
      "linear-algebra-feature-space:objective-4"
    ],
    "relatedModuleIds": [
      "linear-algebra-distance-similarity"
    ],
    "legacyRoute": "/math-lab/modules/linear-algebra-feature-space"
  },
  {
    "id": "linear-algebra-distance-similarity",
    "source": {
      "namespace": "math-lab",
      "id": "linear-algebra-distance-similarity"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "距离、范数与相似度",
      "en": "Distance, Norms, and Similarity"
    },
    "summary": {
      "zh-CN": "用同一组画像比较 norm、欧氏距离、点积与 cosine，并说明指标选择怎样改变排序。",
      "en": "Compare norms, Euclidean distance, dot products, and cosine on one profile set, then explain how metric choice changes ranking."
    },
    "route": "/math-lab/modules/linear-algebra-distance-similarity",
    "estimatedMinutes": 60,
    "prerequisiteIds": [
      "linear-algebra-feature-space"
    ],
    "outcomeIds": [
      "linear-algebra-distance-similarity:objective-1",
      "linear-algebra-distance-similarity:objective-2",
      "linear-algebra-distance-similarity:objective-3"
    ],
    "relatedModuleIds": [
      "linear-algebra-matrix-transformations"
    ],
    "legacyRoute": "/math-lab/modules/linear-algebra-distance-similarity"
  },
  {
    "id": "linear-algebra-matrix-transformations",
    "source": {
      "namespace": "math-lab",
      "id": "linear-algebra-matrix-transformations"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "矩阵与批量计算：从一个样本到一批预测",
      "en": "Matrices and Batch Computation: From One Sample to Many Predictions"
    },
    "summary": {
      "zh-CN": "从三行画像的批量打分走到行列双重读法、广播边界与空间变换。",
      "en": "Move from batch scoring of three profile rows to row/column readings, broadcasting boundaries, and spatial transforms."
    },
    "route": "/math-lab/modules/linear-algebra-matrix-transformations",
    "estimatedMinutes": 75,
    "prerequisiteIds": [
      "beginner-linear-algebra"
    ],
    "outcomeIds": [
      "linear-algebra-matrix-transformations:objective-1",
      "linear-algebra-matrix-transformations:objective-2",
      "linear-algebra-matrix-transformations:objective-3",
      "linear-algebra-matrix-transformations:objective-4"
    ],
    "relatedModuleIds": [
      "linear-algebra-rank-null-space"
    ],
    "legacyRoute": "/math-lab/modules/linear-algebra-matrix-transformations"
  },
  {
    "id": "linear-algebra-rank-null-space",
    "source": {
      "namespace": "math-lab",
      "id": "linear-algebra-rank-null-space"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "列空间、rank 与 null space",
      "en": "Column Space, Rank, and Null Space"
    },
    "summary": {
      "zh-CN": "用一个三维到二维映射手算 column space、rank、null direction 和模型盲区。",
      "en": "Use one three-to-two-dimensional map to calculate column space, rank, a null direction, and a model blind spot."
    },
    "route": "/math-lab/modules/linear-algebra-rank-null-space",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "linear-algebra-matrix-transformations"
    ],
    "outcomeIds": [
      "linear-algebra-rank-null-space:objective-1",
      "linear-algebra-rank-null-space:objective-2",
      "linear-algebra-rank-null-space:objective-3"
    ],
    "relatedModuleIds": [
      "eigenvalues-eigenvectors"
    ],
    "legacyRoute": "/math-lab/modules/linear-algebra-rank-null-space"
  },
  {
    "id": "eigenvalues-eigenvectors",
    "source": {
      "namespace": "math-lab",
      "id": "eigenvalues-eigenvectors"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "特征值与特征向量",
      "en": "Eigenvalues and Eigenvectors"
    },
    "summary": {
      "zh-CN": "寻找在线性变换下只缩放、不改变方向的特殊结构。",
      "en": "Find the special directions that are only scaled under a linear transformation."
    },
    "route": "/math-lab/modules/eigenvalues-eigenvectors",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "linear-algebra-rank-null-space"
    ],
    "outcomeIds": [
      "eigenvalues-eigenvectors:objective-1",
      "eigenvalues-eigenvectors:objective-2",
      "eigenvalues-eigenvectors:objective-3",
      "eigenvalues-eigenvectors:objective-4",
      "eigenvalues-eigenvectors:objective-5"
    ],
    "relatedModuleIds": [
      "svd"
    ],
    "legacyRoute": "/math-lab/modules/eigenvalues-eigenvectors"
  },
  {
    "id": "svd",
    "source": {
      "namespace": "math-lab",
      "id": "svd"
    },
    "domain": "math",
    "level": "advanced",
    "title": {
      "zh-CN": "奇异值分解（SVD）",
      "en": "Singular Value Decomposition (SVD)"
    },
    "summary": {
      "zh-CN": "把任意矩阵拆成输入方向、非负尺度和输出方向。",
      "en": "Decompose any matrix into input directions, nonnegative scales, and output directions."
    },
    "route": "/math-lab/modules/svd",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "least-squares-fitting",
      "eigenvalues-eigenvectors",
      "linear-algebra-rank-null-space"
    ],
    "outcomeIds": [
      "svd:objective-1",
      "svd:objective-2",
      "svd:objective-3",
      "svd:objective-4",
      "svd:objective-5"
    ],
    "relatedModuleIds": [
      "tensor-shapes-vectorization"
    ],
    "legacyRoute": "/math-lab/modules/svd"
  },
  {
    "id": "tensor-shapes-vectorization",
    "source": {
      "namespace": "math-lab",
      "id": "tensor-shapes-vectorization"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "张量 shape 与向量化",
      "en": "Tensor Shapes and Vectorization"
    },
    "summary": {
      "zh-CN": "把 AI 代码中的数组读成维度合同、广播规则和计算成本。",
      "en": "Read AI arrays as shape contracts, broadcasting rules, and compute cost."
    },
    "route": "/math-lab/modules/tensor-shapes-vectorization",
    "estimatedMinutes": 30,
    "prerequisiteIds": [],
    "outcomeIds": [
      "tensor-shapes-vectorization:objective-1",
      "tensor-shapes-vectorization:objective-2",
      "tensor-shapes-vectorization:objective-3"
    ],
    "relatedModuleIds": [
      "calculus-functions-rate-change"
    ],
    "legacyRoute": "/math-lab/modules/tensor-shapes-vectorization"
  },
  {
    "id": "calculus-functions-rate-change",
    "source": {
      "namespace": "math-lab",
      "id": "calculus-functions-rate-change"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "函数与映射：输入怎样变成预测",
      "en": "Functions and Mappings: How Inputs Become Predictions"
    },
    "summary": {
      "zh-CN": "从一个可手算的关卡时长预测，连接公式、代码、残差与控制变量实验。",
      "en": "Use one hand-checkable level-duration prediction to connect formulas, code, residuals, and a controlled experiment."
    },
    "route": "/math-lab/modules/calculus-functions-rate-change",
    "estimatedMinutes": 60,
    "prerequisiteIds": [
      "tensor-shapes-vectorization"
    ],
    "outcomeIds": [
      "calculus-functions-rate-change:objective-1",
      "calculus-functions-rate-change:objective-2",
      "calculus-functions-rate-change:objective-3",
      "calculus-functions-rate-change:objective-4"
    ],
    "relatedModuleIds": [
      "calculus-derivatives-local-change"
    ],
    "legacyRoute": "/math-lab/modules/calculus-functions-rate-change"
  },
  {
    "id": "calculus-derivatives-local-change",
    "source": {
      "namespace": "math-lab",
      "id": "calculus-derivatives-local-change"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "导数与误差敏感度：当前参数附近怎样变化",
      "en": "Derivatives and Error Sensitivity: Change Near the Current Parameters"
    },
    "summary": {
      "zh-CN": "用解析结果与中央差分核对局部损失敏感度，并严格区分估计与更新。",
      "en": "Check local loss sensitivity with analytic results and central difference while separating estimation from updating."
    },
    "route": "/math-lab/modules/calculus-derivatives-local-change",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "calculus-functions-rate-change"
    ],
    "outcomeIds": [
      "calculus-derivatives-local-change:objective-1",
      "calculus-derivatives-local-change:objective-2",
      "calculus-derivatives-local-change:objective-3",
      "calculus-derivatives-local-change:objective-4"
    ],
    "relatedModuleIds": [
      "calculus-partial-derivatives-gradients"
    ],
    "legacyRoute": "/math-lab/modules/calculus-derivatives-local-change"
  },
  {
    "id": "calculus-partial-derivatives-gradients",
    "source": {
      "namespace": "math-lab",
      "id": "calculus-partial-derivatives-gradients"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "偏导数和梯度",
      "en": "Partial Derivatives and Gradients"
    },
    "summary": {
      "zh-CN": "一次读一个参数方向，再把所有方向收集成梯度。",
      "en": "Read one parameter direction at a time, then collect every direction into a gradient."
    },
    "route": "/math-lab/modules/calculus-partial-derivatives-gradients",
    "estimatedMinutes": 60,
    "prerequisiteIds": [
      "calculus-derivatives-local-change"
    ],
    "outcomeIds": [
      "calculus-partial-derivatives-gradients:objective-1",
      "calculus-partial-derivatives-gradients:objective-2",
      "calculus-partial-derivatives-gradients:objective-3"
    ],
    "relatedModuleIds": [
      "calculus-gradient-descent"
    ],
    "legacyRoute": "/math-lab/modules/calculus-partial-derivatives-gradients"
  },
  {
    "id": "calculus-gradient-descent",
    "source": {
      "namespace": "math-lab",
      "id": "calculus-gradient-descent"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "梯度下降",
      "en": "Gradient Descent"
    },
    "summary": {
      "zh-CN": "沿负梯度方向走，用学习率控制每一步长度。",
      "en": "Walk along the negative gradient and use learning rate to control step length."
    },
    "route": "/math-lab/modules/calculus-gradient-descent",
    "estimatedMinutes": 60,
    "prerequisiteIds": [
      "calculus-partial-derivatives-gradients"
    ],
    "outcomeIds": [
      "calculus-gradient-descent:objective-1",
      "calculus-gradient-descent:objective-2",
      "calculus-gradient-descent:objective-3"
    ],
    "relatedModuleIds": [
      "calculus-sgd-batch-noise"
    ],
    "legacyRoute": "/math-lab/modules/calculus-gradient-descent"
  },
  {
    "id": "calculus-sgd-batch-noise",
    "source": {
      "namespace": "math-lab",
      "id": "calculus-sgd-batch-noise"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "Full Batch、Mini-Batch 和 SGD",
      "en": "Full Batch, Mini-Batch, and SGD"
    },
    "summary": {
      "zh-CN": "用抽样平均理解 mini-batch 梯度噪声。",
      "en": "Use sample averages to understand mini-batch gradient noise."
    },
    "route": "/math-lab/modules/calculus-sgd-batch-noise",
    "estimatedMinutes": 60,
    "prerequisiteIds": [
      "calculus-gradient-descent"
    ],
    "outcomeIds": [
      "calculus-sgd-batch-noise:objective-1",
      "calculus-sgd-batch-noise:objective-2",
      "calculus-sgd-batch-noise:objective-3"
    ],
    "relatedModuleIds": [
      "calculus-optimizer-comparison"
    ],
    "legacyRoute": "/math-lab/modules/calculus-sgd-batch-noise"
  },
  {
    "id": "calculus-optimizer-comparison",
    "source": {
      "namespace": "math-lab",
      "id": "calculus-optimizer-comparison"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "优化器比较",
      "en": "Optimizer Comparison"
    },
    "summary": {
      "zh-CN": "比较 plain SGD、Momentum、RMSProp 和 Adam 各自解决的问题。",
      "en": "Compare the problem addressed by plain SGD, Momentum, RMSProp, and Adam."
    },
    "route": "/math-lab/modules/calculus-optimizer-comparison",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "calculus-sgd-batch-noise"
    ],
    "outcomeIds": [
      "calculus-optimizer-comparison:objective-1",
      "calculus-optimizer-comparison:objective-2",
      "calculus-optimizer-comparison:objective-3"
    ],
    "relatedModuleIds": [
      "calculus-training-code-diagnostics"
    ],
    "legacyRoute": "/math-lab/modules/calculus-optimizer-comparison"
  },
  {
    "id": "calculus-training-code-diagnostics",
    "source": {
      "namespace": "math-lab",
      "id": "calculus-training-code-diagnostics"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "训练代码和曲线诊断",
      "en": "Training Code and Curve Diagnostics"
    },
    "summary": {
      "zh-CN": "把梯度公式落到训练循环代码，再用曲线诊断训练状态。",
      "en": "Connect gradient formulas to training-loop code, then diagnose training state with curves."
    },
    "route": "/math-lab/modules/calculus-training-code-diagnostics",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "calculus-optimizer-comparison"
    ],
    "outcomeIds": [
      "calculus-training-code-diagnostics:objective-1",
      "calculus-training-code-diagnostics:objective-2",
      "calculus-training-code-diagnostics:objective-3"
    ],
    "relatedModuleIds": [
      "taylor-series"
    ],
    "legacyRoute": "/math-lab/modules/calculus-training-code-diagnostics"
  },
  {
    "id": "taylor-series",
    "source": {
      "namespace": "math-lab",
      "id": "taylor-series"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "泰勒级数",
      "en": "Taylor Series"
    },
    "summary": {
      "zh-CN": "围绕一个中心点，用函数值、导数和误差界构造可计算的局部近似。",
      "en": "Build computable local approximations from a center point, derivatives, and error bounds."
    },
    "route": "/math-lab/modules/taylor-series",
    "estimatedMinutes": 38,
    "prerequisiteIds": [],
    "outcomeIds": [
      "taylor-series:objective-1",
      "taylor-series:objective-2",
      "taylor-series:objective-3",
      "taylor-series:objective-4"
    ],
    "relatedModuleIds": [
      "matrix-calculus-autodiff"
    ],
    "legacyRoute": "/math-lab/modules/taylor-series"
  },
  {
    "id": "matrix-calculus-autodiff",
    "source": {
      "namespace": "math-lab",
      "id": "matrix-calculus-autodiff"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "矩阵微积分与自动微分",
      "en": "Matrix Calculus and Automatic Differentiation"
    },
    "summary": {
      "zh-CN": "把局部线性化、Jacobian 乘积和计算图反向传播连成一条链。",
      "en": "Connect local linearization, Jacobian products, and computation-graph backpropagation."
    },
    "route": "/math-lab/modules/matrix-calculus-autodiff",
    "estimatedMinutes": 34,
    "prerequisiteIds": [],
    "outcomeIds": [
      "matrix-calculus-autodiff:objective-1",
      "matrix-calculus-autodiff:objective-2",
      "matrix-calculus-autodiff:objective-3"
    ],
    "relatedModuleIds": [
      "beginner-probability-distributions"
    ],
    "legacyRoute": "/math-lab/modules/matrix-calculus-autodiff"
  },
  {
    "id": "beginner-probability-distributions",
    "source": {
      "namespace": "math-lab",
      "id": "beginner-probability-distributions"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "AI 零基础概率分布",
      "en": "Probability Distributions for AI Beginners"
    },
    "summary": {
      "zh-CN": "从样本空间、随机变量和离散分布走到可复现采样与模型概率。",
      "en": "Move from sample spaces, random variables, and discrete distributions to reproducible sampling and model probabilities."
    },
    "route": "/math-lab/modules/beginner-probability-distributions",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "calculus-training-code-diagnostics"
    ],
    "outcomeIds": [
      "beginner-probability-distributions:objective-1",
      "beginner-probability-distributions:objective-2",
      "beginner-probability-distributions:objective-3",
      "beginner-probability-distributions:objective-4"
    ],
    "relatedModuleIds": [
      "monte-carlo"
    ],
    "legacyRoute": "/math-lab/modules/beginner-probability-distributions"
  },
  {
    "id": "monte-carlo",
    "source": {
      "namespace": "math-lab",
      "id": "monte-carlo"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "随机数生成器与蒙特卡洛方法",
      "en": "Random Number Generators and Monte Carlo Methods"
    },
    "summary": {
      "zh-CN": "用可复现的随机采样，把面积、积分和模型期望变成可计算的平均值。",
      "en": "Use reproducible random sampling to turn areas, integrals, and model expectations into computable averages."
    },
    "route": "/math-lab/modules/monte-carlo",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "taylor-series"
    ],
    "outcomeIds": [
      "monte-carlo:objective-1",
      "monte-carlo:objective-2",
      "monte-carlo:objective-3",
      "monte-carlo:objective-4"
    ],
    "relatedModuleIds": [
      "probability-likelihood-entropy"
    ],
    "legacyRoute": "/math-lab/modules/monte-carlo"
  },
  {
    "id": "probability-likelihood-entropy",
    "source": {
      "namespace": "math-lab",
      "id": "probability-likelihood-entropy"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "概率、似然与熵",
      "en": "Probability, Likelihood, and Entropy"
    },
    "summary": {
      "zh-CN": "把模型输出读成分布，并理解交叉熵、KL 和校准。",
      "en": "Read model outputs as distributions and understand cross entropy, KL, and calibration."
    },
    "route": "/math-lab/modules/probability-likelihood-entropy",
    "estimatedMinutes": 65,
    "prerequisiteIds": [],
    "outcomeIds": [
      "probability-likelihood-entropy:objective-1",
      "probability-likelihood-entropy:objective-2",
      "probability-likelihood-entropy:objective-3"
    ],
    "relatedModuleIds": [
      "markov-chains"
    ],
    "legacyRoute": "/math-lab/modules/probability-likelihood-entropy"
  },
  {
    "id": "markov-chains",
    "source": {
      "namespace": "math-lab",
      "id": "markov-chains"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "马尔可夫链",
      "en": "Markov chains"
    },
    "summary": {
      "zh-CN": "把随机游走、天气预测和 PageRank 统一为转移矩阵与稳定分布问题。",
      "en": "Unify random walks, weather prediction, and PageRank as transition-matrix and stationary-distribution problems."
    },
    "route": "/math-lab/modules/markov-chains",
    "estimatedMinutes": 65,
    "prerequisiteIds": [
      "monte-carlo",
      "eigenvalues-eigenvectors"
    ],
    "outcomeIds": [
      "markov-chains:objective-1",
      "markov-chains:objective-2",
      "markov-chains:objective-3",
      "markov-chains:objective-4",
      "markov-chains:objective-5"
    ],
    "relatedModuleIds": [
      "least-squares-fitting"
    ],
    "legacyRoute": "/math-lab/modules/markov-chains"
  },
  {
    "id": "least-squares-fitting",
    "source": {
      "namespace": "math-lab",
      "id": "least-squares-fitting"
    },
    "domain": "math",
    "level": "advanced",
    "title": {
      "zh-CN": "最小二乘拟合",
      "en": "Least Squares Fitting"
    },
    "summary": {
      "zh-CN": "把有噪声的数据拟合成残差最小的投影问题，并比较正规方程与 SVD 解法。",
      "en": "Turn noisy data fitting into a minimum-residual projection problem, then compare normal equations with the SVD solution."
    },
    "route": "/math-lab/modules/least-squares-fitting",
    "estimatedMinutes": 70,
    "prerequisiteIds": [
      "linear-algebra-feature-space",
      "linear-algebra-matrix-transformations"
    ],
    "outcomeIds": [
      "least-squares-fitting:objective-1",
      "least-squares-fitting:objective-2",
      "least-squares-fitting:objective-3",
      "least-squares-fitting:objective-4",
      "least-squares-fitting:objective-5",
      "least-squares-fitting:objective-6",
      "least-squares-fitting:objective-7"
    ],
    "relatedModuleIds": [
      "lu-decomposition"
    ],
    "legacyRoute": "/math-lab/modules/least-squares-fitting"
  },
  {
    "id": "lu-decomposition",
    "source": {
      "namespace": "math-lab",
      "id": "lu-decomposition"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "用 LU 分解求解线性方程",
      "en": "LU Decomposition for Solving Linear Equations"
    },
    "summary": {
      "zh-CN": "把一般线性系统拆成可复用的前代和回代步骤，并理解主元为什么决定稳定性。",
      "en": "Split a general linear system into reusable forward and back substitution, and see why pivots control stability."
    },
    "route": "/math-lab/modules/lu-decomposition",
    "estimatedMinutes": 70,
    "prerequisiteIds": [
      "linear-algebra-distance-similarity"
    ],
    "outcomeIds": [
      "lu-decomposition:objective-1",
      "lu-decomposition:objective-2",
      "lu-decomposition:objective-3",
      "lu-decomposition:objective-4",
      "lu-decomposition:objective-5",
      "lu-decomposition:objective-6"
    ],
    "relatedModuleIds": [
      "condition-numbers"
    ],
    "legacyRoute": "/math-lab/modules/lu-decomposition"
  },
  {
    "id": "condition-numbers",
    "source": {
      "namespace": "math-lab",
      "id": "condition-numbers"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "条件数与敏感性",
      "en": "Condition Numbers"
    },
    "summary": {
      "zh-CN": "判断输入中的微小误差会在解中被放大多少，并理解为什么小残差不总是好答案。",
      "en": "Measure how much tiny input errors can be amplified in the solution, and why a small residual is not always a good answer."
    },
    "route": "/math-lab/modules/condition-numbers",
    "estimatedMinutes": 70,
    "prerequisiteIds": [
      "linear-algebra-distance-similarity",
      "lu-decomposition"
    ],
    "outcomeIds": [
      "condition-numbers:objective-1",
      "condition-numbers:objective-2",
      "condition-numbers:objective-3",
      "condition-numbers:objective-4",
      "condition-numbers:objective-5",
      "condition-numbers:objective-6"
    ],
    "relatedModuleIds": [
      "sparse-matrices"
    ],
    "legacyRoute": "/math-lab/modules/condition-numbers"
  },
  {
    "id": "sparse-matrices",
    "source": {
      "namespace": "math-lab",
      "id": "sparse-matrices"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "稀疏矩阵",
      "en": "Sparse Matrices"
    },
    "summary": {
      "zh-CN": "用 nnz、COO 和 CSR 理解如何只存非零项，并让大规模线性代数真正可计算。",
      "en": "Use nnz, COO, and CSR to store only nonzeros and make large-scale linear algebra computable."
    },
    "route": "/math-lab/modules/sparse-matrices",
    "estimatedMinutes": 70,
    "prerequisiteIds": [
      "lu-decomposition"
    ],
    "outcomeIds": [
      "sparse-matrices:objective-1",
      "sparse-matrices:objective-2",
      "sparse-matrices:objective-3",
      "sparse-matrices:objective-4",
      "sparse-matrices:objective-5",
      "sparse-matrices:objective-6",
      "sparse-matrices:objective-7"
    ],
    "relatedModuleIds": [
      "pca"
    ],
    "legacyRoute": "/math-lab/modules/sparse-matrices"
  },
  {
    "id": "pca",
    "source": {
      "namespace": "math-lab",
      "id": "pca"
    },
    "domain": "math",
    "level": "advanced",
    "title": {
      "zh-CN": "主成分分析（PCA）",
      "en": "Principal Component Analysis (PCA)"
    },
    "summary": {
      "zh-CN": "把中心化数据转到最大方差方向，用更少坐标保留主要结构。",
      "en": "Rotate centered data into maximum-variance directions and keep the main structure with fewer coordinates."
    },
    "route": "/math-lab/modules/pca",
    "estimatedMinutes": 75,
    "prerequisiteIds": [
      "svd",
      "least-squares-fitting",
      "eigenvalues-eigenvectors",
      "linear-algebra-rank-null-space"
    ],
    "outcomeIds": [
      "pca:objective-1",
      "pca:objective-2",
      "pca:objective-3",
      "pca:objective-4",
      "pca:objective-5",
      "pca:objective-6",
      "pca:objective-7",
      "pca:objective-8"
    ],
    "relatedModuleIds": [
      "finite-difference-methods"
    ],
    "legacyRoute": "/math-lab/modules/pca"
  },
  {
    "id": "finite-difference-methods",
    "source": {
      "namespace": "math-lab",
      "id": "finite-difference-methods"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "有限差分方法",
      "en": "Finite Difference Methods"
    },
    "summary": {
      "zh-CN": "用相邻函数值近似导数，并理解步长、误差和梯度检查之间的关系。",
      "en": "Approximate derivatives from nearby function values, and connect step size, error, and gradient checking."
    },
    "route": "/math-lab/modules/finite-difference-methods",
    "estimatedMinutes": 75,
    "prerequisiteIds": [
      "taylor-series",
      "linear-algebra-distance-similarity"
    ],
    "outcomeIds": [
      "finite-difference-methods:objective-1",
      "finite-difference-methods:objective-2",
      "finite-difference-methods:objective-3",
      "finite-difference-methods:objective-4",
      "finite-difference-methods:objective-5",
      "finite-difference-methods:objective-6",
      "finite-difference-methods:objective-7"
    ],
    "relatedModuleIds": [
      "nonlinear-equations"
    ],
    "legacyRoute": "/math-lab/modules/finite-difference-methods"
  },
  {
    "id": "nonlinear-equations",
    "source": {
      "namespace": "math-lab",
      "id": "nonlinear-equations"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "求解非线性方程",
      "en": "Solving Nonlinear Equations"
    },
    "summary": {
      "zh-CN": "用二分法、Newton 法、割线法和 Jacobian 线性化把非线性残差压到零。",
      "en": "Drive nonlinear residuals to zero with bisection, Newton, secant, and Jacobian linearization."
    },
    "route": "/math-lab/modules/nonlinear-equations",
    "estimatedMinutes": 80,
    "prerequisiteIds": [
      "taylor-series",
      "finite-difference-methods",
      "lu-decomposition"
    ],
    "outcomeIds": [
      "nonlinear-equations:objective-1",
      "nonlinear-equations:objective-2",
      "nonlinear-equations:objective-3",
      "nonlinear-equations:objective-4",
      "nonlinear-equations:objective-5",
      "nonlinear-equations:objective-6",
      "nonlinear-equations:objective-7"
    ],
    "relatedModuleIds": [
      "optimization"
    ],
    "legacyRoute": "/math-lab/modules/nonlinear-equations"
  },
  {
    "id": "optimization",
    "source": {
      "namespace": "math-lab",
      "id": "optimization"
    },
    "domain": "math",
    "level": "advanced",
    "title": {
      "zh-CN": "优化",
      "en": "Optimization"
    },
    "summary": {
      "zh-CN": "从最小值、导数判据和线搜索，走到梯度下降与 Newton 法。",
      "en": "Move from minima, derivative tests, and line search to gradient descent and Newton methods."
    },
    "route": "/math-lab/modules/optimization",
    "estimatedMinutes": 38,
    "prerequisiteIds": [
      "taylor-series",
      "linear-algebra-distance-similarity",
      "finite-difference-methods"
    ],
    "outcomeIds": [
      "optimization:objective-1",
      "optimization:objective-2",
      "optimization:objective-3",
      "optimization:objective-4",
      "optimization:objective-5",
      "optimization:objective-6"
    ],
    "relatedModuleIds": [
      "training-diagnostics"
    ],
    "legacyRoute": "/math-lab/modules/optimization"
  },
  {
    "id": "training-diagnostics",
    "source": {
      "namespace": "math-lab",
      "id": "training-diagnostics"
    },
    "domain": "math",
    "level": "intermediate",
    "title": {
      "zh-CN": "训练诊断数学",
      "en": "Mathematics of Training Diagnostics"
    },
    "summary": {
      "zh-CN": "把 loss 曲线、梯度范数和泛化差距读成可行动的训练信号。",
      "en": "Read loss curves, gradient norms, and generalization gaps as actionable training signals."
    },
    "route": "/math-lab/modules/training-diagnostics",
    "estimatedMinutes": 32,
    "prerequisiteIds": [],
    "outcomeIds": [
      "training-diagnostics:objective-1",
      "training-diagnostics:objective-2",
      "training-diagnostics:objective-3"
    ],
    "relatedModuleIds": [
      "deep-architecture-math"
    ],
    "legacyRoute": "/math-lab/modules/training-diagnostics"
  },
  {
    "id": "deep-architecture-math",
    "source": {
      "namespace": "math-lab",
      "id": "deep-architecture-math"
    },
    "domain": "math",
    "level": "advanced",
    "title": {
      "zh-CN": "深度结构中的数学",
      "en": "Mathematics Inside Deep Architectures"
    },
    "summary": {
      "zh-CN": "用线性代数、概率权重和尺度控制读懂 CNN、Attention 与 Transformer。",
      "en": "Use linear algebra, probability weights, and scale control to read CNNs, Attention, and Transformers."
    },
    "route": "/math-lab/modules/deep-architecture-math",
    "estimatedMinutes": 36,
    "prerequisiteIds": [],
    "outcomeIds": [
      "deep-architecture-math:objective-1",
      "deep-architecture-math:objective-2",
      "deep-architecture-math:objective-3"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/math-lab/modules/deep-architecture-math"
  },
  {
    "id": "numpy-mathematics-implementation",
    "source": {
      "namespace": "math-lab",
      "id": "numpy-mathematics-implementation"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "NumPy 数学实现：让公式、shape 与失败一致",
      "en": "NumPy Mathematics Implementation: Align Formulas, Shapes, and Failures"
    },
    "summary": {
      "zh-CN": "用真实输出、循环 oracle、广播诊断与安全失败复现完整预测任务。",
      "en": "Reproduce the full prediction task with real outputs, a loop oracle, broadcasting diagnostics, and safe failures."
    },
    "route": "/math-lab/modules/numpy-mathematics-implementation",
    "estimatedMinutes": 80,
    "prerequisiteIds": [
      "calculus-derivatives-local-change"
    ],
    "outcomeIds": [
      "numpy-mathematics-implementation:objective-1",
      "numpy-mathematics-implementation:objective-2",
      "numpy-mathematics-implementation:objective-3",
      "numpy-mathematics-implementation:objective-4"
    ],
    "relatedModuleIds": [
      "math-to-code-guided-studio"
    ],
    "legacyRoute": "/math-lab/modules/numpy-mathematics-implementation"
  },
  {
    "id": "math-to-code-guided-studio",
    "source": {
      "namespace": "math-lab",
      "id": "math-to-code-guided-studio"
    },
    "domain": "math",
    "level": "beginner",
    "title": {
      "zh-CN": "引导式实践：从数学到可复现代码",
      "en": "Guided Studio: From Mathematics to Reproducible Code"
    },
    "summary": {
      "zh-CN": "按同一 notebook 顺序重建标量、向量、批量预测、MSE、数值敏感度、概率预告与失败诊断。",
      "en": "Rebuild scalar, vector, batch, MSE, numerical-sensitivity, probability-preview, and failure-diagnosis evidence in one ordered notebook."
    },
    "route": "/math-lab/modules/math-to-code-guided-studio",
    "estimatedMinutes": 80,
    "prerequisiteIds": [
      "numpy-mathematics-implementation"
    ],
    "outcomeIds": [
      "math-to-code-guided-studio:objective-1",
      "math-to-code-guided-studio:objective-2",
      "math-to-code-guided-studio:objective-3",
      "math-to-code-guided-studio:objective-4"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/math-lab/modules/math-to-code-guided-studio"
  },
  {
    "id": "numerical-data",
    "source": {
      "namespace": "data-lab",
      "id": "numerical-data"
    },
    "domain": "data",
    "level": "beginner",
    "title": {
      "zh-CN": "数值数据：从列到特征向量",
      "en": "Numerical Data: From Columns to Feature Vectors"
    },
    "summary": {
      "zh-CN": "理解模型为什么只读取数字，以及原始表格如何经过选择、清洗、缩放和变换成为稳定输入。",
      "en": "Understand why models read numbers and how raw tables become stable inputs through selection, cleaning, scaling, and transforms."
    },
    "route": "/data-lab/modules/numerical-data",
    "estimatedMinutes": 85,
    "prerequisiteIds": [],
    "outcomeIds": [
      "numerical-data:objective-1",
      "numerical-data:objective-2",
      "numerical-data:objective-3",
      "numerical-data:objective-4",
      "numerical-data:objective-5"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/data-lab/modules/numerical-data"
  },
  {
    "id": "categorical-data",
    "source": {
      "namespace": "data-lab",
      "id": "categorical-data"
    },
    "domain": "data",
    "level": "beginner",
    "title": {
      "zh-CN": "类别数据：词表、one-hot 与特征交叉",
      "en": "Categorical Data: Vocabularies, One-hot, and Feature Crosses"
    },
    "summary": {
      "zh-CN": "学习模型如何读取“属于哪一类”的信息，以及类别编码为什么必须有固定词表和未知值策略。",
      "en": "Learn how models read membership information and why categorical encoding needs fixed vocabularies and unknown-value policies."
    },
    "route": "/data-lab/modules/categorical-data",
    "estimatedMinutes": 80,
    "prerequisiteIds": [],
    "outcomeIds": [
      "categorical-data:objective-1",
      "categorical-data:objective-2",
      "categorical-data:objective-3",
      "categorical-data:objective-4",
      "categorical-data:objective-5"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/data-lab/modules/categorical-data"
  },
  {
    "id": "dataset-quality",
    "source": {
      "namespace": "data-lab",
      "id": "dataset-quality"
    },
    "domain": "data",
    "level": "intermediate",
    "title": {
      "zh-CN": "数据质量：缺失、标签与代表性",
      "en": "Data Quality: Missingness, Labels, and Representativeness"
    },
    "summary": {
      "zh-CN": "在建模前审计样本、列、标签和分布，判断这批数据是否足以支持可靠训练。",
      "en": "Audit examples, columns, labels, and distributions before modeling to decide whether data can support reliable training."
    },
    "route": "/data-lab/modules/dataset-quality",
    "estimatedMinutes": 82,
    "prerequisiteIds": [],
    "outcomeIds": [
      "dataset-quality:objective-1",
      "dataset-quality:objective-2",
      "dataset-quality:objective-3",
      "dataset-quality:objective-4",
      "dataset-quality:objective-5"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/data-lab/modules/dataset-quality"
  },
  {
    "id": "splits-generalization",
    "source": {
      "namespace": "data-lab",
      "id": "splits-generalization"
    },
    "domain": "data",
    "level": "intermediate",
    "title": {
      "zh-CN": "划分与泛化：让评估像未来一样未知",
      "en": "Splits and Generalization: Make Evaluation Look Like the Future"
    },
    "summary": {
      "zh-CN": "理解训练集、验证集和测试集各自的职责，并学会把变换参数只从训练集学习。",
      "en": "Understand the roles of training, validation, and test sets, and learn to fit transform parameters only from training data."
    },
    "route": "/data-lab/modules/splits-generalization",
    "estimatedMinutes": 78,
    "prerequisiteIds": [],
    "outcomeIds": [
      "splits-generalization:objective-1",
      "splits-generalization:objective-2",
      "splits-generalization:objective-3",
      "splits-generalization:objective-4",
      "splits-generalization:objective-5"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/data-lab/modules/splits-generalization"
  },
  {
    "id": "complexity-regularization",
    "source": {
      "namespace": "data-lab",
      "id": "complexity-regularization"
    },
    "domain": "data",
    "level": "intermediate",
    "title": {
      "zh-CN": "复杂度、正则化与损失曲线",
      "en": "Complexity, Regularization, and Loss Curves"
    },
    "summary": {
      "zh-CN": "把特征工程和训练诊断连接起来，理解为什么更复杂的输入需要验证集、正则化和曲线判断。",
      "en": "Connect feature engineering to training diagnostics and understand why more complex inputs need validation, regularization, and curve reading."
    },
    "route": "/data-lab/modules/complexity-regularization",
    "estimatedMinutes": 82,
    "prerequisiteIds": [],
    "outcomeIds": [
      "complexity-regularization:objective-1",
      "complexity-regularization:objective-2",
      "complexity-regularization:objective-3",
      "complexity-regularization:objective-4",
      "complexity-regularization:objective-5"
    ],
    "relatedModuleIds": [],
    "legacyRoute": "/data-lab/modules/complexity-regularization"
  }
] satisfies CurriculumModuleMetadata[]
