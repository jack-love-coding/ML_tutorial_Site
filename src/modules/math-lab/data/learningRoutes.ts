import type {
  LearningRoute,
  LearningRouteProgressSummary,
  LocalizedCopy,
  MathLabModuleId,
} from '../types/mathLab'

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

export const linearAlgebraRouteModuleIds: MathLabModuleId[] = [
  'linear-algebra-feature-space',
  'linear-algebra-distance-similarity',
  'linear-algebra-matrix-transformations',
  'linear-algebra-rank-null-space',
  'eigenvalues-eigenvectors',
  'svd',
  'pca',
]

export const calculusRouteModuleIds: MathLabModuleId[] = [
  'calculus-functions-rate-change',
  'calculus-derivatives-local-change',
  'calculus-partial-derivatives-gradients',
  'calculus-gradient-descent',
  'calculus-sgd-batch-noise',
  'calculus-optimizer-comparison',
  'calculus-training-code-diagnostics',
]

export const learningRoutes: LearningRoute[] = [
  {
    id: 'ai-math-main-path',
    title: copy('AI 数学主线', 'AI Math Main Path'),
    description: copy(
      '从零基础数学直觉进入 shape、自动微分、概率损失、优化、PCA 和深度结构。',
      'Move from beginner math intuition into shape, autodiff, probabilistic loss, optimization, PCA, and deep architecture math.',
    ),
    audience: copy('想为机器学习建数学地基的初学者。', 'Beginners building the math foundation for machine learning.'),
    chapterModuleIds: [
      'beginner-linear-algebra',
      'linear-algebra-feature-space',
      'linear-algebra-distance-similarity',
      'linear-algebra-matrix-transformations',
      'linear-algebra-rank-null-space',
      'tensor-shapes-vectorization',
      ...calculusRouteModuleIds,
      'taylor-series',
      'matrix-calculus-autodiff',
      'beginner-probability-distributions',
      'probability-likelihood-entropy',
      'optimization',
      'training-diagnostics',
      'pca',
      'deep-architecture-math',
    ],
    nextStepRule: 'first-incomplete',
  },
  {
    id: 'linear-algebra-route',
    title: copy('线性代数路线', 'Linear Algebra Route'),
    description: copy(
      '从特征向量、距离和矩阵变换走到 rank、eigen、SVD 和 PCA。',
      'Move from feature vectors, distance, and matrix transformations to rank, eigenvectors, SVD, and PCA.',
    ),
    audience: copy('想把线性代数和 AI 表示学习连起来的学习者。', 'Learners connecting linear algebra with AI representation learning.'),
    chapterModuleIds: linearAlgebraRouteModuleIds,
    nextStepRule: 'first-incomplete',
  },
  {
    id: 'calculus-route',
    title: copy('微积分路线', 'Calculus Route'),
    description: copy(
      '从函数和局部变化走到梯度下降、随机批量、优化器和训练曲线诊断。',
      'Move from functions and local change to gradient descent, stochastic batches, optimizers, and training-curve diagnostics.',
    ),
    audience: copy('想把微积分直接连接到机器学习训练循环的学习者。', 'Learners who want to connect calculus directly to machine-learning training loops.'),
    chapterModuleIds: calculusRouteModuleIds,
    nextStepRule: 'first-incomplete',
  },
  {
    id: 'numerical-deepening-path',
    title: copy('数值计算加深', 'Numerical Deepening Path'),
    description: copy(
      '把线性系统、稀疏结构、条件数、有限差分和非线性求解放进工程稳定性视角。',
      'Study linear systems, sparse structure, conditioning, finite differences, and nonlinear solving through engineering stability.',
    ),
    audience: copy('想理解数值稳定性和科学计算边界的学习者。', 'Learners who want numerical stability and scientific-computing boundaries.'),
    chapterModuleIds: [
      'lu-decomposition',
      'sparse-matrices',
      'condition-numbers',
      'markov-chains',
      'finite-difference-methods',
      'nonlinear-equations',
      'least-squares-fitting',
    ],
    nextStepRule: 'first-incomplete',
  },
]

export const learningRouteById = Object.fromEntries(
  learningRoutes.map((route) => [route.id, route]),
) as Record<string, LearningRoute>

export function nextModuleForRoute(
  route: LearningRoute,
  completedModuleIds: readonly MathLabModuleId[],
) {
  const completed = new Set(completedModuleIds)
  return route.chapterModuleIds.find((moduleId) => !completed.has(moduleId))
}

export function routeProgressSummary(
  route: LearningRoute,
  completedModuleIds: readonly MathLabModuleId[],
): LearningRouteProgressSummary {
  const completed = new Set(completedModuleIds)
  const completedInRoute = route.chapterModuleIds.filter((moduleId) => completed.has(moduleId))

  return {
    routeId: route.id,
    completedCount: completedInRoute.length,
    totalCount: route.chapterModuleIds.length,
    completedModuleId: completedInRoute.at(-1),
    nextModuleId: nextModuleForRoute(route, completedModuleIds),
  }
}
