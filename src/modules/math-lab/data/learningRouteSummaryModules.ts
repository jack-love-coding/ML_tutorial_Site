import type { LocalizedCopy, MathLabModuleId } from '../types/mathLab'

export interface LearningRouteSummaryModule {
  id: MathLabModuleId
  title: LocalizedCopy
}

function title(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

export const learningRouteSummaryModules: readonly LearningRouteSummaryModule[] = [
  { id: 'beginner-linear-algebra', title: title('AI 零基础线性代数', 'Linear Algebra for AI Beginners') },
  { id: 'linear-algebra-feature-space', title: title('向量与特征空间', 'Vectors and Feature Space') },
  { id: 'linear-algebra-distance-similarity', title: title('距离、范数与相似度', 'Distance, Norms, and Similarity') },
  { id: 'linear-algebra-matrix-transformations', title: title('矩阵与线性变换', 'Matrices and Linear Transformations') },
  { id: 'linear-algebra-rank-null-space', title: title('列空间、rank 与 null space', 'Column Space, Rank, and Null Space') },
  { id: 'tensor-shapes-vectorization', title: title('张量 shape 与向量化', 'Tensor Shapes and Vectorization') },
  { id: 'calculus-functions-rate-change', title: title('函数与映射：输入怎样变成预测', 'Functions and Mappings: How Inputs Become Predictions') },
  { id: 'calculus-derivatives-local-change', title: title('导数：当前点附近的变化', 'Derivatives as Local Change') },
  { id: 'calculus-partial-derivatives-gradients', title: title('偏导数和梯度', 'Partial Derivatives and Gradients') },
  { id: 'calculus-gradient-descent', title: title('梯度下降', 'Gradient Descent') },
  { id: 'calculus-sgd-batch-noise', title: title('Full Batch、Mini-Batch 和 SGD', 'Full Batch, Mini-Batch, and SGD') },
  { id: 'calculus-optimizer-comparison', title: title('优化器比较', 'Optimizer Comparison') },
  { id: 'calculus-training-code-diagnostics', title: title('训练代码和曲线诊断', 'Training Code and Curve Diagnostics') },
  { id: 'taylor-series', title: title('泰勒级数', 'Taylor Series') },
  { id: 'matrix-calculus-autodiff', title: title('矩阵微积分与自动微分', 'Matrix Calculus and Automatic Differentiation') },
  { id: 'beginner-probability-distributions', title: title('AI 零基础概率分布', 'Probability Distributions for AI Beginners') },
  { id: 'probability-likelihood-entropy', title: title('概率、似然与熵', 'Probability, Likelihood, and Entropy') },
  { id: 'optimization', title: title('优化', 'Optimization') },
  { id: 'training-diagnostics', title: title('训练诊断数学', 'Mathematics of Training Diagnostics') },
  { id: 'pca', title: title('主成分分析（PCA）', 'Principal Component Analysis (PCA)') },
  { id: 'deep-architecture-math', title: title('深度结构中的数学', 'Mathematics Inside Deep Architectures') },
  { id: 'eigenvalues-eigenvectors', title: title('特征值与特征向量', 'Eigenvalues and Eigenvectors') },
  { id: 'svd', title: title('奇异值分解（SVD）', 'Singular Value Decomposition (SVD)') },
  { id: 'lu-decomposition', title: title('用 LU 分解求解线性方程', 'LU Decomposition for Solving Linear Equations') },
  { id: 'sparse-matrices', title: title('稀疏矩阵', 'Sparse Matrices') },
  { id: 'condition-numbers', title: title('条件数与敏感性', 'Condition Numbers') },
  { id: 'markov-chains', title: title('马尔可夫链', 'Markov chains') },
  { id: 'finite-difference-methods', title: title('有限差分方法', 'Finite Difference Methods') },
  { id: 'nonlinear-equations', title: title('求解非线性方程', 'Solving Nonlinear Equations') },
  { id: 'least-squares-fitting', title: title('最小二乘拟合', 'Least Squares Fitting') },
]
