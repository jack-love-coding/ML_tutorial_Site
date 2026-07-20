import type { LocalizedCopy, MathLabModuleId } from '../types/mathLab'

export interface MathLearningPhase {
  id: string
  title: LocalizedCopy
  moduleIds: readonly MathLabModuleId[]
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

export const linearAlgebraRouteModuleIds: readonly MathLabModuleId[] = [
  'linear-algebra-feature-space',
  'linear-algebra-distance-similarity',
  'linear-algebra-matrix-transformations',
  'linear-algebra-rank-null-space',
  'least-squares-fitting',
  'eigenvalues-eigenvectors',
  'svd',
  'pca',
]

export const calculusRouteModuleIds: readonly MathLabModuleId[] = [
  'calculus-functions-rate-change',
  'calculus-derivatives-local-change',
  'calculus-partial-derivatives-gradients',
  'calculus-gradient-descent',
  'calculus-sgd-batch-noise',
  'calculus-optimizer-comparison',
  'calculus-training-code-diagnostics',
]

export const probabilityRouteModuleIds: readonly MathLabModuleId[] = [
  'beginner-probability-distributions',
  'monte-carlo',
  'probability-likelihood-entropy',
  'markov-chains',
]

export const numericalDeepeningModuleIds: readonly MathLabModuleId[] = [
  'least-squares-fitting',
  'lu-decomposition',
  'condition-numbers',
  'sparse-matrices',
  'pca',
  'finite-difference-methods',
  'nonlinear-equations',
  'optimization',
  'training-diagnostics',
]

export const mathToCodePilotModuleIds: readonly MathLabModuleId[] = [
  'calculus-functions-rate-change',
  'linear-algebra-feature-space',
  'linear-algebra-matrix-transformations',
  'calculus-derivatives-local-change',
  'numpy-mathematics-implementation',
  'math-to-code-guided-studio',
]

export const minimumFoundationModuleIds: readonly MathLabModuleId[] = [
  'calculus-functions-rate-change',
  'beginner-linear-algebra',
  'calculus-derivatives-local-change',
  'beginner-probability-distributions',
]

export const mathLearningPhases: readonly MathLearningPhase[] = [
  {
    id: 'representation-geometry',
    title: copy('阶段一：表示、向量与矩阵', 'Phase 1: Representations, Vectors, and Matrices'),
    moduleIds: [
      'beginner-linear-algebra',
      'linear-algebra-feature-space',
      'linear-algebra-distance-similarity',
      'linear-algebra-matrix-transformations',
      'linear-algebra-rank-null-space',
      'eigenvalues-eigenvectors',
      'svd',
      'tensor-shapes-vectorization',
    ],
  },
  {
    id: 'change-training',
    title: copy('阶段二：变化率与模型训练', 'Phase 2: Rates of Change and Model Training'),
    moduleIds: [
      ...calculusRouteModuleIds,
      'taylor-series',
      'matrix-calculus-autodiff',
    ],
  },
  {
    id: 'uncertainty-probability',
    title: copy('阶段三：概率与不确定性', 'Phase 3: Probability and Uncertainty'),
    moduleIds: probabilityRouteModuleIds,
  },
  {
    id: 'data-geometry-numerics',
    title: copy('阶段四：数据几何与数值稳定', 'Phase 4: Data Geometry and Numerical Stability'),
    moduleIds: numericalDeepeningModuleIds,
  },
  {
    id: 'deep-architecture',
    title: copy('阶段五：深度架构中的数学', 'Phase 5: Mathematics Inside Deep Architectures'),
    moduleIds: ['deep-architecture-math'],
  },
]

export const aiMathPathModuleIds: readonly MathLabModuleId[] =
  mathLearningPhases.flatMap((phase) => phase.moduleIds)
