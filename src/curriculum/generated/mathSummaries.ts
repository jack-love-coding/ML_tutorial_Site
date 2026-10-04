// Generated from final math course definitions. Do not edit by hand.
import type { MathLabModuleSummary } from '../../modules/math-lab/types/mathLab.ts'
export const mathLabModuleSummaries = [
  {
    "id": "beginner-linear-algebra",
    "order": 1,
    "title": {
      "zh-CN": "AI 零基础线性代数",
      "en": "Linear Algebra for AI Beginners"
    },
    "subtitle": {
      "zh-CN": "从一个样本向量走到批量矩阵、shape 账本和可复现的 NumPy 预测。",
      "en": "Move from one example vector to a batch matrix, a shape ledger, and a reproducible NumPy prediction."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 60,
    "prerequisites": [],
    "nextModuleIds": [
      "linear-algebra-feature-space"
    ],
    "accent": "#3868ff",
    "theme": "#eef3ff"
  },
  {
    "id": "linear-algebra-feature-space",
    "order": 2,
    "title": {
      "zh-CN": "向量与样本表示：一次预测如何读懂多个特征",
      "en": "Vectors and Sample Representation: Reading Multiple Features in One Prediction"
    },
    "subtitle": {
      "zh-CN": "用统一学习画像连接特征轴、单位、shape、差向量与高维表示。",
      "en": "Use shared learning profiles to connect feature axes, units, shapes, difference vectors, and high-dimensional representations."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 70,
    "prerequisites": [
      "beginner-linear-algebra"
    ],
    "nextModuleIds": [
      "linear-algebra-distance-similarity"
    ],
    "accent": "#2457d6",
    "theme": "#edf3ff"
  },
  {
    "id": "linear-algebra-distance-similarity",
    "order": 3,
    "title": {
      "zh-CN": "距离、范数与相似度",
      "en": "Distance, Norms, and Similarity"
    },
    "subtitle": {
      "zh-CN": "用同一组画像比较 norm、欧氏距离、点积与 cosine，并说明指标选择怎样改变排序。",
      "en": "Compare norms, Euclidean distance, dot products, and cosine on one profile set, then explain how metric choice changes ranking."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 60,
    "prerequisites": [
      "linear-algebra-feature-space"
    ],
    "nextModuleIds": [
      "linear-algebra-matrix-transformations"
    ],
    "accent": "#0f9f7a",
    "theme": "#ecfdf7"
  },
  {
    "id": "linear-algebra-matrix-transformations",
    "order": 4,
    "title": {
      "zh-CN": "矩阵与批量计算：从一个样本到一批预测",
      "en": "Matrices and Batch Computation: From One Sample to Many Predictions"
    },
    "subtitle": {
      "zh-CN": "从三行画像的批量打分走到行列双重读法、广播边界与空间变换。",
      "en": "Move from batch scoring of three profile rows to row/column readings, broadcasting boundaries, and spatial transforms."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 75,
    "prerequisites": [
      "beginner-linear-algebra"
    ],
    "nextModuleIds": [
      "linear-algebra-rank-null-space"
    ],
    "accent": "#0f766e",
    "theme": "#ecfdf5"
  },
  {
    "id": "linear-algebra-rank-null-space",
    "order": 5,
    "title": {
      "zh-CN": "列空间、rank 与 null space",
      "en": "Column Space, Rank, and Null Space"
    },
    "subtitle": {
      "zh-CN": "用一个三维到二维映射手算 column space、rank、null direction 和模型盲区。",
      "en": "Use one three-to-two-dimensional map to calculate column space, rank, a null direction, and a model blind spot."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 65,
    "prerequisites": [
      "linear-algebra-matrix-transformations"
    ],
    "nextModuleIds": [
      "eigenvalues-eigenvectors"
    ],
    "accent": "#6f42c1",
    "theme": "#f3eefc"
  },
  {
    "id": "eigenvalues-eigenvectors",
    "order": 6,
    "title": {
      "zh-CN": "特征值与特征向量",
      "en": "Eigenvalues and Eigenvectors"
    },
    "subtitle": {
      "zh-CN": "寻找在线性变换下只缩放、不改变方向的特殊结构。",
      "en": "Find the special directions that are only scaled under a linear transformation."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 65,
    "prerequisites": [
      "linear-algebra-rank-null-space"
    ],
    "nextModuleIds": [
      "svd"
    ],
    "accent": "#c026d3",
    "theme": "#fdf0ff"
  },
  {
    "id": "svd",
    "order": 7,
    "title": {
      "zh-CN": "奇异值分解（SVD）",
      "en": "Singular Value Decomposition (SVD)"
    },
    "subtitle": {
      "zh-CN": "把任意矩阵拆成输入方向、非负尺度和输出方向。",
      "en": "Decompose any matrix into input directions, nonnegative scales, and output directions."
    },
    "difficulty": "advanced",
    "estimatedMinutes": 65,
    "prerequisites": [
      "least-squares-fitting",
      "eigenvalues-eigenvectors",
      "linear-algebra-rank-null-space"
    ],
    "nextModuleIds": [
      "tensor-shapes-vectorization"
    ],
    "accent": "#7048e8",
    "theme": "#f1edff"
  },
  {
    "id": "tensor-shapes-vectorization",
    "order": 8,
    "title": {
      "zh-CN": "张量 shape 与向量化",
      "en": "Tensor Shapes and Vectorization"
    },
    "subtitle": {
      "zh-CN": "把 AI 代码中的数组读成维度合同、广播规则和计算成本。",
      "en": "Read AI arrays as shape contracts, broadcasting rules, and compute cost."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 30,
    "prerequisites": [],
    "nextModuleIds": [
      "calculus-functions-rate-change"
    ],
    "accent": "#3868ff",
    "theme": "#eef3ff"
  },
  {
    "id": "calculus-functions-rate-change",
    "order": 9,
    "title": {
      "zh-CN": "函数与映射：输入怎样变成预测",
      "en": "Functions and Mappings: How Inputs Become Predictions"
    },
    "subtitle": {
      "zh-CN": "从一个可手算的关卡时长预测，连接公式、代码、残差与控制变量实验。",
      "en": "Use one hand-checkable level-duration prediction to connect formulas, code, residuals, and a controlled experiment."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 60,
    "prerequisites": [
      "tensor-shapes-vectorization"
    ],
    "nextModuleIds": [
      "calculus-derivatives-local-change"
    ],
    "accent": "#d65a31",
    "theme": "#fff1e8"
  },
  {
    "id": "calculus-derivatives-local-change",
    "order": 10,
    "title": {
      "zh-CN": "导数与误差敏感度：当前参数附近怎样变化",
      "en": "Derivatives and Error Sensitivity: Change Near the Current Parameters"
    },
    "subtitle": {
      "zh-CN": "用解析结果与中央差分核对局部损失敏感度，并严格区分估计与更新。",
      "en": "Check local loss sensitivity with analytic results and central difference while separating estimation from updating."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 65,
    "prerequisites": [
      "calculus-functions-rate-change"
    ],
    "nextModuleIds": [
      "calculus-partial-derivatives-gradients"
    ],
    "accent": "#c2410c",
    "theme": "#fff7ed"
  },
  {
    "id": "calculus-partial-derivatives-gradients",
    "order": 11,
    "title": {
      "zh-CN": "偏导数和梯度",
      "en": "Partial Derivatives and Gradients"
    },
    "subtitle": {
      "zh-CN": "一次读一个参数方向，再把所有方向收集成梯度。",
      "en": "Read one parameter direction at a time, then collect every direction into a gradient."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 60,
    "prerequisites": [
      "calculus-derivatives-local-change"
    ],
    "nextModuleIds": [
      "calculus-gradient-descent"
    ],
    "accent": "#7c3aed",
    "theme": "#f5f3ff"
  },
  {
    "id": "calculus-gradient-descent",
    "order": 12,
    "title": {
      "zh-CN": "梯度下降",
      "en": "Gradient Descent"
    },
    "subtitle": {
      "zh-CN": "沿负梯度方向走，用学习率控制每一步长度。",
      "en": "Walk along the negative gradient and use learning rate to control step length."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 60,
    "prerequisites": [
      "calculus-partial-derivatives-gradients"
    ],
    "nextModuleIds": [
      "calculus-sgd-batch-noise"
    ],
    "accent": "#ea580c",
    "theme": "#fff7ed"
  },
  {
    "id": "calculus-sgd-batch-noise",
    "order": 13,
    "title": {
      "zh-CN": "Full Batch、Mini-Batch 和 SGD",
      "en": "Full Batch, Mini-Batch, and SGD"
    },
    "subtitle": {
      "zh-CN": "用抽样平均理解 mini-batch 梯度噪声。",
      "en": "Use sample averages to understand mini-batch gradient noise."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 60,
    "prerequisites": [
      "calculus-gradient-descent"
    ],
    "nextModuleIds": [
      "calculus-optimizer-comparison"
    ],
    "accent": "#0f766e",
    "theme": "#ecfdf5"
  },
  {
    "id": "calculus-optimizer-comparison",
    "order": 14,
    "title": {
      "zh-CN": "优化器比较",
      "en": "Optimizer Comparison"
    },
    "subtitle": {
      "zh-CN": "比较 plain SGD、Momentum、RMSProp 和 Adam 各自解决的问题。",
      "en": "Compare the problem addressed by plain SGD, Momentum, RMSProp, and Adam."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 65,
    "prerequisites": [
      "calculus-sgd-batch-noise"
    ],
    "nextModuleIds": [
      "calculus-training-code-diagnostics"
    ],
    "accent": "#2563eb",
    "theme": "#eff6ff"
  },
  {
    "id": "calculus-training-code-diagnostics",
    "order": 15,
    "title": {
      "zh-CN": "训练代码和曲线诊断",
      "en": "Training Code and Curve Diagnostics"
    },
    "subtitle": {
      "zh-CN": "把梯度公式落到训练循环代码，再用曲线诊断训练状态。",
      "en": "Connect gradient formulas to training-loop code, then diagnose training state with curves."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 65,
    "prerequisites": [
      "calculus-optimizer-comparison"
    ],
    "nextModuleIds": [
      "taylor-series"
    ],
    "accent": "#334155",
    "theme": "#f8fafc"
  },
  {
    "id": "taylor-series",
    "order": 16,
    "title": {
      "zh-CN": "泰勒级数",
      "en": "Taylor Series"
    },
    "subtitle": {
      "zh-CN": "围绕一个中心点，用函数值、导数和误差界构造可计算的局部近似。",
      "en": "Build computable local approximations from a center point, derivatives, and error bounds."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 38,
    "prerequisites": [],
    "nextModuleIds": [
      "matrix-calculus-autodiff"
    ],
    "accent": "#d65a31",
    "theme": "#fff1e8"
  },
  {
    "id": "matrix-calculus-autodiff",
    "order": 17,
    "title": {
      "zh-CN": "矩阵微积分与自动微分",
      "en": "Matrix Calculus and Automatic Differentiation"
    },
    "subtitle": {
      "zh-CN": "把局部线性化、Jacobian 乘积和计算图反向传播连成一条链。",
      "en": "Connect local linearization, Jacobian products, and computation-graph backpropagation."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 34,
    "prerequisites": [],
    "nextModuleIds": [
      "beginner-probability-distributions"
    ],
    "accent": "#7c3aed",
    "theme": "#f3e8ff"
  },
  {
    "id": "beginner-probability-distributions",
    "order": 18,
    "title": {
      "zh-CN": "AI 零基础概率分布",
      "en": "Probability Distributions for AI Beginners"
    },
    "subtitle": {
      "zh-CN": "从样本空间、随机变量和离散分布走到可复现采样与模型概率。",
      "en": "Move from sample spaces, random variables, and discrete distributions to reproducible sampling and model probabilities."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 65,
    "prerequisites": [
      "calculus-training-code-diagnostics"
    ],
    "nextModuleIds": [
      "monte-carlo"
    ],
    "accent": "#247a73",
    "theme": "#e9f8f5"
  },
  {
    "id": "monte-carlo",
    "order": 19,
    "title": {
      "zh-CN": "随机数生成器与蒙特卡洛方法",
      "en": "Random Number Generators and Monte Carlo Methods"
    },
    "subtitle": {
      "zh-CN": "用可复现的随机采样，把面积、积分和模型期望变成可计算的平均值。",
      "en": "Use reproducible random sampling to turn areas, integrals, and model expectations into computable averages."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 65,
    "prerequisites": [
      "taylor-series"
    ],
    "nextModuleIds": [
      "probability-likelihood-entropy"
    ],
    "accent": "#247a73",
    "theme": "#e9f8f5"
  },
  {
    "id": "probability-likelihood-entropy",
    "order": 20,
    "title": {
      "zh-CN": "概率、似然与熵",
      "en": "Probability, Likelihood, and Entropy"
    },
    "subtitle": {
      "zh-CN": "把模型输出读成分布，并理解交叉熵、KL 和校准。",
      "en": "Read model outputs as distributions and understand cross entropy, KL, and calibration."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 65,
    "prerequisites": [],
    "nextModuleIds": [
      "markov-chains"
    ],
    "accent": "#247a73",
    "theme": "#e9f8f5"
  },
  {
    "id": "markov-chains",
    "order": 21,
    "title": {
      "zh-CN": "马尔可夫链",
      "en": "Markov chains"
    },
    "subtitle": {
      "zh-CN": "把随机游走、天气预测和 PageRank 统一为转移矩阵与稳定分布问题。",
      "en": "Unify random walks, weather prediction, and PageRank as transition-matrix and stationary-distribution problems."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 65,
    "prerequisites": [
      "monte-carlo",
      "eigenvalues-eigenvectors"
    ],
    "nextModuleIds": [
      "least-squares-fitting"
    ],
    "accent": "#0891b2",
    "theme": "#e5f8fd"
  },
  {
    "id": "least-squares-fitting",
    "order": 22,
    "title": {
      "zh-CN": "最小二乘拟合",
      "en": "Least Squares Fitting"
    },
    "subtitle": {
      "zh-CN": "把有噪声的数据拟合成残差最小的投影问题，并比较正规方程与 SVD 解法。",
      "en": "Turn noisy data fitting into a minimum-residual projection problem, then compare normal equations with the SVD solution."
    },
    "difficulty": "advanced",
    "estimatedMinutes": 70,
    "prerequisites": [
      "linear-algebra-feature-space",
      "linear-algebra-matrix-transformations"
    ],
    "nextModuleIds": [
      "lu-decomposition"
    ],
    "accent": "#2563eb",
    "theme": "#edf4ff"
  },
  {
    "id": "lu-decomposition",
    "order": 23,
    "title": {
      "zh-CN": "用 LU 分解求解线性方程",
      "en": "LU Decomposition for Solving Linear Equations"
    },
    "subtitle": {
      "zh-CN": "把一般线性系统拆成可复用的前代和回代步骤，并理解主元为什么决定稳定性。",
      "en": "Split a general linear system into reusable forward and back substitution, and see why pivots control stability."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 70,
    "prerequisites": [
      "vectors-matrices-norms"
    ],
    "nextModuleIds": [
      "condition-numbers"
    ],
    "accent": "#7c5cff",
    "theme": "#f0edff"
  },
  {
    "id": "condition-numbers",
    "order": 24,
    "title": {
      "zh-CN": "条件数与敏感性",
      "en": "Condition Numbers"
    },
    "subtitle": {
      "zh-CN": "判断输入中的微小误差会在解中被放大多少，并理解为什么小残差不总是好答案。",
      "en": "Measure how much tiny input errors can be amplified in the solution, and why a small residual is not always a good answer."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 70,
    "prerequisites": [
      "vectors-matrices-norms",
      "lu-decomposition"
    ],
    "nextModuleIds": [
      "sparse-matrices"
    ],
    "accent": "#b45309",
    "theme": "#fff4dd"
  },
  {
    "id": "sparse-matrices",
    "order": 25,
    "title": {
      "zh-CN": "稀疏矩阵",
      "en": "Sparse Matrices"
    },
    "subtitle": {
      "zh-CN": "用 nnz、COO 和 CSR 理解如何只存非零项，并让大规模线性代数真正可计算。",
      "en": "Use nnz, COO, and CSR to store only nonzeros and make large-scale linear algebra computable."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 70,
    "prerequisites": [
      "lu-decomposition"
    ],
    "nextModuleIds": [
      "pca"
    ],
    "accent": "#6d7b00",
    "theme": "#f4f7dd"
  },
  {
    "id": "pca",
    "order": 26,
    "title": {
      "zh-CN": "主成分分析（PCA）",
      "en": "Principal Component Analysis (PCA)"
    },
    "subtitle": {
      "zh-CN": "把中心化数据转到最大方差方向，用更少坐标保留主要结构。",
      "en": "Rotate centered data into maximum-variance directions and keep the main structure with fewer coordinates."
    },
    "difficulty": "advanced",
    "estimatedMinutes": 75,
    "prerequisites": [
      "svd",
      "least-squares-fitting",
      "eigenvalues-eigenvectors",
      "linear-algebra-rank-null-space"
    ],
    "nextModuleIds": [
      "finite-difference-methods"
    ],
    "accent": "#0f766e",
    "theme": "#e6fbf6"
  },
  {
    "id": "finite-difference-methods",
    "order": 27,
    "title": {
      "zh-CN": "有限差分方法",
      "en": "Finite Difference Methods"
    },
    "subtitle": {
      "zh-CN": "用相邻函数值近似导数，并理解步长、误差和梯度检查之间的关系。",
      "en": "Approximate derivatives from nearby function values, and connect step size, error, and gradient checking."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 75,
    "prerequisites": [
      "taylor-series",
      "vectors-matrices-norms"
    ],
    "nextModuleIds": [
      "nonlinear-equations"
    ],
    "accent": "#15803d",
    "theme": "#eaf8ef"
  },
  {
    "id": "nonlinear-equations",
    "order": 28,
    "title": {
      "zh-CN": "求解非线性方程",
      "en": "Solving Nonlinear Equations"
    },
    "subtitle": {
      "zh-CN": "用二分法、Newton 法、割线法和 Jacobian 线性化把非线性残差压到零。",
      "en": "Drive nonlinear residuals to zero with bisection, Newton, secant, and Jacobian linearization."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 80,
    "prerequisites": [
      "taylor-series",
      "finite-difference-methods",
      "lu-decomposition"
    ],
    "nextModuleIds": [
      "optimization"
    ],
    "accent": "#be123c",
    "theme": "#fff0f3"
  },
  {
    "id": "optimization",
    "order": 29,
    "title": {
      "zh-CN": "优化",
      "en": "Optimization"
    },
    "subtitle": {
      "zh-CN": "从最小值、导数判据和线搜索，走到梯度下降与 Newton 法。",
      "en": "Move from minima, derivative tests, and line search to gradient descent and Newton methods."
    },
    "difficulty": "advanced",
    "estimatedMinutes": 90,
    "prerequisites": [
      "taylor-series",
      "vectors-matrices-norms",
      "finite-difference-methods"
    ],
    "nextModuleIds": [
      "training-diagnostics"
    ],
    "accent": "#f59e0b",
    "theme": "#fff7df"
  },
  {
    "id": "training-diagnostics",
    "order": 30,
    "title": {
      "zh-CN": "训练诊断数学",
      "en": "Mathematics of Training Diagnostics"
    },
    "subtitle": {
      "zh-CN": "把 loss 曲线、梯度范数和泛化差距读成可行动的训练信号。",
      "en": "Read loss curves, gradient norms, and generalization gaps as actionable training signals."
    },
    "difficulty": "intermediate",
    "estimatedMinutes": 75,
    "prerequisites": [],
    "nextModuleIds": [
      "deep-architecture-math"
    ],
    "accent": "#d65a31",
    "theme": "#fff1e8"
  },
  {
    "id": "deep-architecture-math",
    "order": 31,
    "title": {
      "zh-CN": "深度结构中的数学",
      "en": "Mathematics Inside Deep Architectures"
    },
    "subtitle": {
      "zh-CN": "用线性代数、概率权重和尺度控制读懂 CNN、Attention 与 Transformer。",
      "en": "Use linear algebra, probability weights, and scale control to read CNNs, Attention, and Transformers."
    },
    "difficulty": "advanced",
    "estimatedMinutes": 36,
    "prerequisites": [],
    "nextModuleIds": [],
    "accent": "#0f9f7a",
    "theme": "#e9f8f5"
  },
  {
    "id": "numpy-mathematics-implementation",
    "order": 32,
    "title": {
      "zh-CN": "NumPy 数学实现：让公式、shape 与失败一致",
      "en": "NumPy Mathematics Implementation: Align Formulas, Shapes, and Failures"
    },
    "subtitle": {
      "zh-CN": "用真实输出、循环 oracle、广播诊断与安全失败复现完整预测任务。",
      "en": "Reproduce the full prediction task with real outputs, a loop oracle, broadcasting diagnostics, and safe failures."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 80,
    "prerequisites": [
      "calculus-derivatives-local-change"
    ],
    "nextModuleIds": [
      "math-to-code-guided-studio"
    ],
    "accent": "#6d28d9",
    "theme": "#f5f3ff"
  },
  {
    "id": "math-to-code-guided-studio",
    "order": 33,
    "title": {
      "zh-CN": "引导式实践：从数学到可复现代码",
      "en": "Guided Studio: From Mathematics to Reproducible Code"
    },
    "subtitle": {
      "zh-CN": "按同一 notebook 顺序重建标量、向量、批量预测、MSE、数值敏感度、概率预告与失败诊断。",
      "en": "Rebuild scalar, vector, batch, MSE, numerical-sensitivity, probability-preview, and failure-diagnosis evidence in one ordered notebook."
    },
    "difficulty": "foundation",
    "estimatedMinutes": 80,
    "prerequisites": [
      "numpy-mathematics-implementation"
    ],
    "nextModuleIds": [],
    "accent": "#0f766e",
    "theme": "#ecfdf5"
  }
] satisfies MathLabModuleSummary[]
