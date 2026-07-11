import type { LocalizedCopy } from '../types/ml.ts'
import type { CurriculumDomain, CurriculumSourceNamespace } from './types.ts'

export interface CurriculumRouteManifestEntry {
  id: string
  source: CurriculumSourceNamespace
  domain: CurriculumDomain
  route: string
  title: LocalizedCopy
  firstLessonId?: string
}

function copy(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

const algorithmEntries: CurriculumRouteManifestEntry[] = [
  {
    id: 'ai-overview',
    source: 'algorithm',
    domain: 'foundation',
    route: '/learn/ai-overview',
    title: copy('AI 入门总览', 'AI Overview'),
    firstLessonId: 'what-is-ml',
  },
  {
    id: 'python-notebook',
    source: 'algorithm',
    domain: 'foundation',
    route: '/learn/python-notebook',
    title: copy('Python Notebook 入门', 'Python Notebook Basics'),
    firstLessonId: 'notebook-rhythm',
  },
  {
    id: 'housing-price-project',
    source: 'algorithm',
    domain: 'project',
    route: '/learn/housing-price-project',
    title: copy('房价预测项目', 'Housing Price Project'),
    firstLessonId: 'csv-to-frame',
  },
  {
    id: 'classification-project',
    source: 'algorithm',
    domain: 'project',
    route: '/learn/classification-project',
    title: copy('分类项目实战', 'Classification Project'),
    firstLessonId: 'problem-and-costs',
  },
  {
    id: 'model-selection',
    source: 'algorithm',
    domain: 'model',
    route: '/learn/model-selection',
    title: copy('模型选择与验证', 'Model Selection'),
    firstLessonId: 'one-split-risk',
  },
  {
    id: 'tree-forest',
    source: 'algorithm',
    domain: 'model',
    route: '/learn/tree-forest',
    title: copy('决策树与随机森林', 'Trees and Random Forests'),
    firstLessonId: 'non-gradient-model',
  },
  {
    id: 'cnn-visualization',
    source: 'algorithm',
    domain: 'deep-learning',
    route: '/learn/cnn-visualization',
    title: copy('CNN 可视化', 'CNN Visualization'),
    firstLessonId: 'image-volume',
  },
  {
    id: 'sequence-embedding-bridge',
    source: 'algorithm',
    domain: 'deep-learning',
    route: '/learn/sequence-embedding-bridge',
    title: copy('序列与 Embedding 桥接', 'Sequence and Embedding Bridge'),
    firstLessonId: 'why-sequences',
  },
  {
    id: 'attention-transformer',
    source: 'algorithm',
    domain: 'deep-learning',
    route: '/learn/attention-transformer',
    title: copy('Attention 与 Transformer', 'Attention and Transformer'),
    firstLessonId: 'tokens-embeddings',
  },
  {
    id: 'optimizer-comparison',
    source: 'algorithm',
    domain: 'model',
    route: '/learn/optimizer-comparison',
    title: copy('优化器比较', 'Optimizer Comparison'),
    firstLessonId: 'training-loop',
  },
  {
    id: 'llm-rag',
    source: 'algorithm',
    domain: 'deep-learning',
    route: '/learn/llm-rag',
    title: copy('LLM 与 RAG', 'LLM and RAG'),
    firstLessonId: 'tokenization-context',
  },
  {
    id: 'loss-functions',
    source: 'algorithm',
    domain: 'model',
    route: '/learn/loss-functions',
    title: copy('损失函数', 'Loss Functions'),
    firstLessonId: 'why-loss',
  },
  {
    id: 'gradient-descent',
    source: 'algorithm',
    domain: 'model',
    route: '/learn/gradient-descent',
    title: copy('梯度下降', 'Gradient Descent'),
    firstLessonId: 'loss-function',
  },
  {
    id: 'linear-regression',
    source: 'algorithm',
    domain: 'model',
    route: '/learn/linear-regression',
    title: copy('线性回归', 'Linear Regression'),
    firstLessonId: 'fit-line',
  },
  {
    id: 'logistic-regression',
    source: 'algorithm',
    domain: 'model',
    route: '/learn/logistic-regression',
    title: copy('逻辑回归', 'Logistic Regression'),
    firstLessonId: 'linear-score',
  },
  {
    id: 'classification',
    source: 'algorithm',
    domain: 'model',
    route: '/learn/classification',
    title: copy('分类指标与阈值', 'Classification Metrics and Thresholds'),
    firstLessonId: 'scores',
  },
  {
    id: 'mlp',
    source: 'algorithm',
    domain: 'deep-learning',
    route: '/learn/mlp',
    title: copy('多层感知机', 'Multilayer Perceptron'),
    firstLessonId: 'linearLimits',
  },
]

const mathEntries: CurriculumRouteManifestEntry[] = [
  {
    id: 'beginner-linear-algebra',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/beginner-linear-algebra',
    title: copy('AI 零基础线性代数', 'Linear Algebra for AI Beginners'),
  },
  {
    id: 'beginner-probability-distributions',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/beginner-probability-distributions',
    title: copy('AI 零基础概率分布', 'Probability Distributions for AI Beginners'),
  },
  {
    id: 'linear-algebra-feature-space',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/linear-algebra-feature-space',
    title: copy('向量与样本表示', 'Vectors and Sample Representation'),
  },
  {
    id: 'linear-algebra-distance-similarity',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/linear-algebra-distance-similarity',
    title: copy('距离、范数与相似度', 'Distance, Norms, and Similarity'),
  },
  {
    id: 'linear-algebra-matrix-transformations',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/linear-algebra-matrix-transformations',
    title: copy('矩阵与批量计算', 'Matrices and Batch Computation'),
  },
  {
    id: 'linear-algebra-rank-null-space',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/linear-algebra-rank-null-space',
    title: copy('列空间、rank 与 null space', 'Column Space, Rank, and Null Space'),
  },
  {
    id: 'eigenvalues-eigenvectors',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/eigenvalues-eigenvectors',
    title: copy('特征值与特征向量', 'Eigenvalues and Eigenvectors'),
  },
  {
    id: 'svd',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/svd',
    title: copy('奇异值分解（SVD）', 'Singular Value Decomposition (SVD)'),
  },
  {
    id: 'pca',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/pca',
    title: copy('主成分分析（PCA）', 'Principal Component Analysis (PCA)'),
  },
  {
    id: 'tensor-shapes-vectorization',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/tensor-shapes-vectorization',
    title: copy('张量 shape 与向量化', 'Tensor Shapes and Vectorization'),
  },
  {
    id: 'lu-decomposition',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/lu-decomposition',
    title: copy('用 LU 分解求解线性方程', 'LU Decomposition for Solving Linear Equations'),
  },
  {
    id: 'sparse-matrices',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/sparse-matrices',
    title: copy('稀疏矩阵', 'Sparse Matrices'),
  },
  {
    id: 'condition-numbers',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/condition-numbers',
    title: copy('条件数', 'Condition Numbers'),
  },
  {
    id: 'calculus-functions-rate-change',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/calculus-functions-rate-change',
    title: copy('函数与映射：输入怎样变成预测', 'Functions and Mappings: How Inputs Become Predictions'),
  },
  {
    id: 'calculus-derivatives-local-change',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/calculus-derivatives-local-change',
    title: copy('导数与误差敏感度', 'Derivatives and Error Sensitivity'),
  },
  {
    id: 'calculus-partial-derivatives-gradients',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/calculus-partial-derivatives-gradients',
    title: copy('偏导数和梯度', 'Partial Derivatives and Gradients'),
  },
  {
    id: 'calculus-gradient-descent',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/calculus-gradient-descent',
    title: copy('梯度下降', 'Gradient Descent'),
  },
  {
    id: 'calculus-sgd-batch-noise',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/calculus-sgd-batch-noise',
    title: copy('Full Batch、Mini-Batch 和 SGD', 'Full Batch, Mini-Batch, and SGD'),
  },
  {
    id: 'calculus-optimizer-comparison',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/calculus-optimizer-comparison',
    title: copy('优化器比较', 'Optimizer Comparison'),
  },
  {
    id: 'calculus-training-code-diagnostics',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/calculus-training-code-diagnostics',
    title: copy('训练代码和曲线诊断', 'Training Code and Curve Diagnostics'),
  },
  {
    id: 'taylor-series',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/taylor-series',
    title: copy('泰勒级数', 'Taylor Series'),
  },
  {
    id: 'matrix-calculus-autodiff',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/matrix-calculus-autodiff',
    title: copy('矩阵微积分与自动微分', 'Matrix Calculus and Automatic Differentiation'),
  },
  {
    id: 'finite-difference-methods',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/finite-difference-methods',
    title: copy('有限差分方法', 'Finite Difference Methods'),
  },
  {
    id: 'nonlinear-equations',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/nonlinear-equations',
    title: copy('求解非线性方程', 'Solving Nonlinear Equations'),
  },
  {
    id: 'optimization',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/optimization',
    title: copy('优化', 'Optimization'),
  },
  {
    id: 'training-diagnostics',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/training-diagnostics',
    title: copy('训练诊断数学', 'Mathematics of Training Diagnostics'),
  },
  {
    id: 'monte-carlo',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/monte-carlo',
    title: copy('随机数生成器与蒙特卡洛方法', 'Random Number Generators and Monte Carlo Method'),
  },
  {
    id: 'probability-likelihood-entropy',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/probability-likelihood-entropy',
    title: copy('概率、似然与熵', 'Probability, Likelihood, and Entropy'),
  },
  {
    id: 'markov-chains',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/markov-chains',
    title: copy('马尔可夫链', 'Markov chains'),
  },
  {
    id: 'least-squares-fitting',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/least-squares-fitting',
    title: copy('最小二乘拟合', 'Least Squares Fitting'),
  },
  {
    id: 'deep-architecture-math',
    source: 'math-lab',
    domain: 'math',
    route: '/math-lab/modules/deep-architecture-math',
    title: copy('深度结构中的数学', 'Mathematics Inside Deep Architectures'),
  },
]

const dataEntries: CurriculumRouteManifestEntry[] = [
  {
    id: 'numerical-data',
    source: 'data-lab',
    domain: 'data',
    route: '/data-lab/modules/numerical-data',
    title: copy('数值数据：从列到特征向量', 'Numerical Data: From Columns to Feature Vectors'),
  },
  {
    id: 'categorical-data',
    source: 'data-lab',
    domain: 'data',
    route: '/data-lab/modules/categorical-data',
    title: copy('类别数据：词表、one-hot 与特征交叉', 'Categorical Data: Vocabularies, One-hot, and Feature Crosses'),
  },
  {
    id: 'dataset-quality',
    source: 'data-lab',
    domain: 'data',
    route: '/data-lab/modules/dataset-quality',
    title: copy('数据质量：缺失、标签与代表性', 'Data Quality: Missingness, Labels, and Representativeness'),
  },
  {
    id: 'splits-generalization',
    source: 'data-lab',
    domain: 'data',
    route: '/data-lab/modules/splits-generalization',
    title: copy('划分与泛化：让评估像未来一样未知', 'Splits and Generalization: Make Evaluation Look Like the Future'),
  },
  {
    id: 'complexity-regularization',
    source: 'data-lab',
    domain: 'data',
    route: '/data-lab/modules/complexity-regularization',
    title: copy('复杂度、正则化与损失曲线', 'Complexity, Regularization, and Loss Curves'),
  },
]

export const coreLearningPathModuleIds = [
  'ai-overview',
  'python-notebook',
  'numerical-data',
  'categorical-data',
  'dataset-quality',
  'beginner-linear-algebra',
  'linear-algebra-feature-space',
  'loss-functions',
  'linear-regression',
  'gradient-descent',
  'logistic-regression',
  'beginner-probability-distributions',
  'probability-likelihood-entropy',
  'classification',
  'splits-generalization',
  'model-selection',
  'complexity-regularization',
  'tree-forest',
  'mlp',
  'optimizer-comparison',
  'tensor-shapes-vectorization',
  'cnn-visualization',
  'sequence-embedding-bridge',
  'attention-transformer',
]

export const projectPracticeModuleIds = ['housing-price-project', 'classification-project']

export const curriculumRouteManifest: CurriculumRouteManifestEntry[] = [
  ...algorithmEntries,
  ...mathEntries,
  ...dataEntries,
]

export const curriculumRouteManifestById = new Map(
  curriculumRouteManifest.map((entry) => [entry.id, entry]),
)

export function curriculumRouteManifestByDomain(domain: CurriculumDomain) {
  return curriculumRouteManifest.filter((entry) => entry.domain === domain)
}
