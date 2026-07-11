import type { CurriculumV3Wave } from './types.ts'

const copy = (zhCN: string, en: string) => ({ 'zh-CN': zhCN, en })

export const curriculumV3Waves: CurriculumV3Wave[] = [
  {
    id: 'v3.1-learning-language',
    title: copy('学习系统与变化语言', 'Learning Systems and the Language of Change'),
    moduleIds: ['ai-overview', 'python-notebook', 'calculus-functions-rate-change', 'beginner-linear-algebra', 'calculus-derivatives-local-change'],
    exitCriteria: [copy('能用可复现实验追踪函数、数组与局部变化。', 'Trace functions, arrays, and local change in a reproducible experiment.')],
  },
  {
    id: 'v3.1-vector-probability-language',
    title: copy('向量与概率语言', 'Vector and Probability Language'),
    moduleIds: ['beginner-probability-distributions', 'linear-algebra-feature-space', 'linear-algebra-distance-similarity', 'linear-algebra-matrix-transformations', 'linear-algebra-rank-null-space'],
    exitCriteria: [copy('能检查向量运算、形状与概率分布。', 'Check vector operations, shapes, and probability distributions.')],
  },
  {
    id: 'v3.2-linear-systems',
    title: copy('线性系统与表示', 'Linear Systems and Representations'),
    moduleIds: ['least-squares-fitting', 'eigenvalues-eigenvectors', 'svd-pca-representation', 'numerical-linear-algebra', 'calculus-partial-derivatives-gradients'],
    exitCriteria: [copy('能连接最小二乘、矩阵表示与多变量梯度。', 'Connect least squares, matrix representations, and multivariable gradients.')],
  },
  {
    id: 'v3.2-probability-optimization',
    title: copy('概率与优化基础', 'Probability and Optimization Foundations'),
    moduleIds: ['chain-rule-local-approximation', 'numerical-differentiation-root-finding', 'probability-expectation-variance', 'conditional-probability-markov', 'probability-likelihood-entropy'],
    exitCriteria: [copy('能用链式法则、期望与似然解释优化证据。', 'Use the chain rule, expectation, and likelihood to explain optimization evidence.')],
  },
  {
    id: 'v3.3-math-to-data',
    title: copy('从数学代码到数据', 'From Mathematical Code to Data'),
    moduleIds: ['monte-carlo', 'gradient-descent', 'project-math-to-code', 'numerical-data', 'categorical-data'],
    exitCriteria: [copy('能提交由数值检查支持的公式到代码项目。', 'Submit a formula-to-code project supported by numerical checks.')],
  },
  {
    id: 'v3.3-honest-regression',
    title: copy('诚实的回归流程', 'An Honest Regression Workflow'),
    moduleIds: ['dataset-quality', 'splits-generalization', 'data-exploration-pipelines', 'loss-functions', 'linear-regression', 'project-tabular-regression'],
    exitCriteria: [copy('能建立无泄漏、可复现的回归基线。', 'Build a leakage-safe, reproducible regression baseline.')],
  },
  {
    id: 'v3.4-classification-generalization',
    title: copy('分类与泛化', 'Classification and Generalization'),
    moduleIds: ['logistic-regression', 'classification', 'tree-forest', 'ensemble-learning', 'complexity-regularization'],
    exitCriteria: [copy('能比较分类决策、模型复杂度与泛化表现。', 'Compare classification decisions, model complexity, and generalization performance.')],
  },
  {
    id: 'v3.4-evaluation-to-neurons',
    title: copy('从可靠评估到神经元', 'From Reliable Evaluation to Neurons'),
    moduleIds: ['model-selection', 'training-diagnostics', 'project-classification-evaluation', 'neuron-activation-foundations', 'mlp'],
    exitCriteria: [copy('能提交分类评估证据并追踪多层感知机。', 'Submit classification evaluation evidence and trace an MLP.')],
  },
  {
    id: 'v3.5-neural-training',
    title: copy('神经网络训练诊断', 'Neural Training Diagnostics'),
    moduleIds: ['backpropagation-mechanism', 'matrix-calculus-autodiff', 'initialization-normalization', 'optimizer-comparison', 'deep-architecture-math'],
    exitCriteria: [copy('能用梯度、优化曲线和表示证据诊断训练。', 'Diagnose training with gradients, optimization curves, and representation evidence.')],
  },
  {
    id: 'v3.5-deep-representations',
    title: copy('深度表示与序列', 'Deep Representations and Sequences'),
    moduleIds: ['tensor-shapes-vectorization', 'cnn-visualization', 'sequence-models-rnn', 'sequence-embedding-bridge', 'project-neural-representation'],
    exitCriteria: [copy('能追踪卷积与序列模型中的张量形状。', 'Trace tensor shapes through convolutional and sequence models.')],
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
