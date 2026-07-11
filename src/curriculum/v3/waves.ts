import type { CurriculumV3Wave } from './types.ts'

const copy = (zhCN: string, en: string) => ({ 'zh-CN': zhCN, en })

export const curriculumV3Waves: CurriculumV3Wave[] = [
  {
    id: 'v3.1-minimum-foundation',
    title: copy('最低数学与计算基础', 'Minimum Mathematical and Computational Foundation'),
    moduleIds: ['ai-overview', 'python-notebook', 'calculus-functions-rate-change', 'beginner-linear-algebra', 'calculus-derivatives-local-change', 'beginner-probability-distributions'],
    exitCriteria: [copy('能用函数、向量、矩阵、导数与概率语言追踪可复现计算。', 'Trace reproducible computations using functions, vectors, matrices, derivatives, and probability language.')],
  },
  {
    id: 'v3.2-vector-matrix-language',
    title: copy('向量与矩阵语言', 'Vector and Matrix Language'),
    moduleIds: ['linear-algebra-feature-space', 'linear-algebra-distance-similarity', 'linear-algebra-matrix-transformations', 'linear-algebra-rank-null-space'],
    exitCriteria: [copy('能检查特征空间、相似度、矩阵变换与秩。', 'Check feature spaces, similarity, matrix transformations, and rank.')],
  },
  {
    id: 'v3.2-linear-systems',
    title: copy('线性系统与表示', 'Linear Systems and Representations'),
    moduleIds: ['least-squares-fitting', 'eigenvalues-eigenvectors', 'svd-pca-representation', 'numerical-linear-algebra'],
    exitCriteria: [copy('能连接最小二乘、谱分解与数值稳定性。', 'Connect least squares, spectral decompositions, and numerical stability.')],
  },
  {
    id: 'v3.2-calculus-probability-foundations',
    title: copy('微积分与概率基础', 'Calculus and Probability Foundations'),
    moduleIds: ['calculus-partial-derivatives-gradients', 'chain-rule-local-approximation', 'numerical-differentiation-root-finding', 'probability-expectation-variance', 'conditional-probability-markov'],
    exitCriteria: [copy('能用偏导数、链式法则、数值检查与条件概率分析模型计算。', 'Analyze model computations with partial derivatives, the chain rule, numerical checks, and conditional probability.')],
  },
  {
    id: 'v3.2-probability-optimization-project',
    title: copy('概率、优化与数学代码项目', 'Probability, Optimization, and the Mathematics-to-Code Project'),
    moduleIds: ['probability-likelihood-entropy', 'monte-carlo', 'gradient-descent', 'project-math-to-code'],
    exitCriteria: [copy('能提交由概率模拟与数值梯度检查支持的公式到代码项目。', 'Submit a formula-to-code project supported by probability simulation and numerical gradient checks.')],
  },
  {
    id: 'v3.2-data-pipeline',
    title: copy('完整数据到特征管线', 'Complete Data-to-Feature Pipeline'),
    moduleIds: ['numerical-data', 'categorical-data', 'dataset-quality', 'splits-generalization', 'data-exploration-pipelines'],
    exitCriteria: [copy('能建立从原始表格到无泄漏特征矩阵的完整可复现管线。', 'Build a complete reproducible pipeline from raw tables to leakage-safe feature matrices.')],
  },
  {
    id: 'v3.3-regression-classification',
    title: copy('回归与分类基线', 'Regression and Classification Baselines'),
    moduleIds: ['loss-functions', 'linear-regression', 'project-tabular-regression', 'logistic-regression', 'classification'],
    exitCriteria: [copy('能建立诚实回归基线，并把分类分数转换为可解释决策。', 'Build an honest regression baseline and turn classification scores into explainable decisions.')],
  },
  {
    id: 'v3.3-generalization-evaluation',
    title: copy('经典模型的泛化与评估', 'Generalization and Evaluation for Classical Models'),
    moduleIds: ['tree-forest', 'ensemble-learning', 'complexity-regularization', 'model-selection', 'training-diagnostics', 'project-classification-evaluation'],
    exitCriteria: [copy('能用复杂度、模型选择与诊断证据提交可靠分类评估。', 'Submit a reliable classification evaluation using complexity, model-selection, and diagnostic evidence.')],
  },
  {
    id: 'v3.4-neural-foundations',
    title: copy('神经网络基础', 'Neural-Network Foundations'),
    moduleIds: ['neuron-activation-foundations', 'mlp', 'backpropagation-mechanism', 'matrix-calculus-autodiff', 'initialization-normalization', 'optimizer-comparison'],
    exitCriteria: [copy('能追踪 MLP 前后向传播并比较初始化、归一化与优化器。', 'Trace MLP forward and backward passes and compare initialization, normalization, and optimizers.')],
  },
  {
    id: 'v3.5-deep-structures',
    title: copy('深度学习结构与表示', 'Deep-Learning Structures and Representations'),
    moduleIds: ['deep-architecture-math', 'tensor-shapes-vectorization', 'cnn-visualization', 'sequence-models-rnn', 'sequence-embedding-bridge', 'project-neural-representation'],
    exitCriteria: [copy('能追踪卷积与序列结构中的形状、共享参数和表示证据。', 'Trace shapes, shared parameters, and representation evidence through convolutional and sequence structures.')],
  },
  {
    id: 'v3.6-small-transformer',
    title: copy('小型 Transformer', 'A Small Transformer'),
    moduleIds: ['tokenization-language-modeling', 'attention-qkv-multihead', 'transformer-blocks', 'small-transformer-training', 'decoding-sampling', 'project-small-transformer'],
    exitCriteria: [copy('能训练、验证并采样一个小型 Transformer。', 'Train, validate, and sample from a small Transformer.')],
  },
  {
    id: 'v3.7-reliable-llm-systems',
    title: copy('可靠的 LLM 系统', 'Reliable LLM Systems'),
    moduleIds: ['llm-inference-context', 'peft-lora', 'retrieval-rag-systems', 'llm-evaluation-reliability', 'project-llm-application'],
    exitCriteria: [copy('能用锁定评估证据审计适配与 RAG 系统。', 'Audit adaptation and RAG systems with locked evaluation evidence.')],
  },
]
