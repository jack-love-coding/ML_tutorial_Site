import type { LocalizedCopy } from '../../types/ml.ts'
import type { CurriculumV3Arc } from './types.ts'

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const curriculumV3Arcs: CurriculumV3Arc[] = [
  {
    id: 'math-language',
    order: 1,
    title: copy('数学语言与计算起点', 'Mathematical Language and Computational Starting Point'),
    purpose: copy(
      '建立函数、图像、变量、向量、矩阵、导数与概率直觉，并开始使用 Python 数值计算、NumPy 数组和张量形状阅读。这是最小可行基础，而不是前置一整套数学学位课程。',
      'Build intuition for functions, graphs, variables, vectors, matrices, derivatives, and probability while beginning Python numerical work, NumPy arrays, and tensor-shape reading. This is a minimum viable foundation, not a front-loaded mathematics degree.',
    ),
  },
  {
    id: 'linear-algebra',
    order: 2,
    title: copy('线性代数与特征空间', 'Linear Algebra and Feature Space'),
    purpose: copy(
      '学习向量几何、点积、范数、距离、矩阵乘法、线性映射、方程组、最小二乘、投影、特征方向、SVD 与 PCA。必修内容支撑特征和线性模型，更深入的分解可保留为拓展主题。',
      'Study vector geometry, dot products, norms, distance, matrix multiplication, linear maps, systems, least squares, projections, eigen directions, SVD, and PCA. Required items support features and linear models; deeper decompositions may remain depth topics.',
    ),
  },
  {
    id: 'calculus-probability-optimization',
    order: 3,
    title: copy('微积分、概率、信息与优化', 'Calculus, Probability, Information, and Optimization'),
    purpose: copy(
      '理解局部变化、偏导数、梯度、链式法则、数值梯度、概率分布、条件概率、期望、方差、似然、熵、交叉熵与优化行为，并在使用这些概念的模型中再次回顾它们。',
      'Understand local change, partial derivatives, gradients, the chain rule, numerical gradients, probability distributions, conditional probability, expectation, variance, likelihood, entropy, cross-entropy, and optimization behavior, revisiting each concept in the model that consumes it.',
    ),
  },
  {
    id: 'data-to-features',
    order: 4,
    title: copy('从数据到模型输入', 'Data Becomes Model Input'),
    purpose: copy(
      '掌握表格、数值与类别特征、缺失值、重复数据、标签质量、EDA、训练/验证/测试划分、数据泄漏、预处理 fit/transform 边界与可复现流水线。',
      'Master tables, numeric and categorical features, missing values, duplicates, label quality, EDA, train/validation/test separation, leakage, preprocessing fit/transform boundaries, and reproducible pipelines.',
    ),
  },
  {
    id: 'classical-supervised-learning',
    order: 5,
    title: copy('经典监督学习', 'Classical Supervised Learning'),
    purpose: copy(
      '学习损失函数、线性回归、逻辑回归、决策边界、分类指标、阈值、决策树、集成方法与诚实的基线。',
      'Learn loss functions, linear regression, logistic regression, decision boundaries, classification metrics, thresholds, decision trees, ensembles, and honest baselines.',
    ),
  },
  {
    id: 'generalization-evaluation',
    order: 6,
    title: copy('泛化与可靠评估', 'Generalization and Reliable Evaluation'),
    purpose: copy(
      '理解偏差与方差、欠拟合与过拟合、正则化、交叉验证、模型选择、错误分析、类别不平衡、校准、鲁棒性与实验报告。',
      'Understand bias and variance, underfitting and overfitting, regularization, cross-validation, model selection, error analysis, class imbalance, calibration, robustness, and experiment reporting.',
    ),
  },
  {
    id: 'neural-network-foundations',
    order: 7,
    title: copy('神经网络基础', 'Neural-Network Foundations'),
    purpose: copy(
      '学习感知机、MLP、激活函数、计算图、反向传播、自动微分、初始化、归一化、批次行为、SGD 变体、动量、Adam、模型容量、正则化与训练诊断。',
      'Learn perceptrons, MLPs, activations, computation graphs, backpropagation, automatic differentiation, initialization, normalization, batch behavior, SGD variants, momentum, Adam, capacity, regularization, and training diagnostics.',
    ),
  },
  {
    id: 'deep-learning-structures',
    order: 8,
    title: copy('深度学习结构与表征', 'Deep-Learning Structures and Representation'),
    purpose: copy(
      '探索图像张量、卷积、池化、感受野、表征学习、序列表征、词嵌入、作为历史与概念桥梁的循环模型直觉，以及序列张量形状。',
      'Explore image tensors, convolutions, pooling, receptive fields, representation learning, sequence representation, embeddings, recurrent-model intuition as a historical and conceptual bridge, and sequence tensor shapes.',
    ),
  },
  {
    id: 'transformers-language-models',
    order: 9,
    title: copy('注意力、Transformer 与语言模型', 'Attention, Transformers, and Language Models'),
    purpose: copy(
      '掌握分词、嵌入、位置、掩码、Q/K/V、缩放点积注意力、多头注意力、Transformer 块、残差路径、归一化、因果语言模型目标、批处理、小型 Transformer 训练循环、解码与采样。',
      'Master tokenization, embeddings, position, masks, Q/K/V, scaled dot-product Attention, multi-head Attention, Transformer blocks, residual paths, normalization, causal language-model objectives, batching, a small Transformer training loop, decoding, and sampling.',
    ),
  },
  {
    id: 'llm-adaptation-retrieval',
    order: 10,
    title: copy('大语言模型适配、检索与毕业项目', 'LLM Adaptation, Retrieval, and Graduation Work'),
    purpose: copy(
      '实践推理约束、提示与上下文组合、嵌入检索、分块、RAG 组装、评估数据集、检索与生成失败诊断、参数高效微调、幻觉分析，以及最终的 LLM 或 RAG 应用。',
      'Practice inference constraints, prompt/context composition, embedding retrieval, chunking, RAG assembly, evaluation datasets, retrieval and generation failure diagnosis, parameter-efficient fine-tuning, hallucination analysis, and a final LLM or RAG application.',
    ),
  },
]
