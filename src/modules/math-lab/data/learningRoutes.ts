import type {
  LearningRoute,
  LearningRouteId,
  LearningRouteProgressSummary,
  LocalizedCopy,
  MathLabModuleId,
} from '../types/mathLab'

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

export const linearAlgebraRouteModuleIds: readonly MathLabModuleId[] = [
  'linear-algebra-feature-space',
  'linear-algebra-distance-similarity',
  'linear-algebra-matrix-transformations',
  'linear-algebra-rank-null-space',
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

export const mathToCodePilotModuleIds: readonly MathLabModuleId[] = [
  'calculus-functions-rate-change',
  'linear-algebra-feature-space',
  'linear-algebra-matrix-transformations',
  'calculus-derivatives-local-change',
  'numpy-mathematics-implementation',
  'math-to-code-guided-studio',
]

const aiMathMainPathRoute: LearningRoute = {
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
}

const linearAlgebraRoute: LearningRoute = {
  id: 'linear-algebra-route',
  title: copy('线性代数路线', 'Linear Algebra Route'),
  description: copy(
    '从特征向量、距离和矩阵变换走到 rank、eigen、SVD 和 PCA。',
    'Move from feature vectors, distance, and matrix transformations to rank, eigenvectors, SVD, and PCA.',
  ),
  audience: copy('想把线性代数和 AI 表示学习连起来的学习者。', 'Learners connecting linear algebra with AI representation learning.'),
  chapterModuleIds: linearAlgebraRouteModuleIds,
  nextStepRule: 'first-incomplete',
}

const calculusRoute: LearningRoute = {
  id: 'calculus-route',
  title: copy('微积分学习路线', 'Calculus Learning Route'),
  description: copy(
    '从函数和局部变化走到梯度下降、随机批量、优化器和训练曲线诊断。',
    'Move from functions and local change to gradient descent, stochastic batches, optimizers, and training-curve diagnostics.',
  ),
  audience: copy('想把微积分直接连接到机器学习训练循环的学习者。', 'Learners who want to connect calculus directly to machine-learning training loops.'),
  chapterModuleIds: calculusRouteModuleIds,
  nextStepRule: 'first-incomplete',
}

const numericalDeepeningRoute: LearningRoute = {
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
}

const mathToCodePilotRoute: LearningRoute = {
  id: 'math-to-code-pilot',
  title: copy('数学到代码试学路线', 'Math-to-Code Pilot Route'),
  description: copy(
    '按函数、向量、矩阵、导数、NumPy 与引导式实践的顺序，把公式翻译成可复现中间值。',
    'Translate formulas into reproducible intermediates through functions, vectors, matrices, derivatives, NumPy, and a guided studio.',
  ),
  audience: copy('想用一条短路线核验数学、shape、代码与行为一致性的学习者。', 'Learners seeking a short route that aligns mathematics, shapes, code, and behavior.'),
  chapterModuleIds: mathToCodePilotModuleIds,
  nextStepRule: 'first-incomplete',
}

export const learningRoutes: readonly LearningRoute[] = [
  aiMathMainPathRoute,
  linearAlgebraRoute,
  calculusRoute,
  numericalDeepeningRoute,
  mathToCodePilotRoute,
]

export const learningRouteById: Record<LearningRouteId, LearningRoute> = {
  'ai-math-main-path': aiMathMainPathRoute,
  'linear-algebra-route': linearAlgebraRoute,
  'calculus-route': calculusRoute,
  'numerical-deepening-path': numericalDeepeningRoute,
  'math-to-code-pilot': mathToCodePilotRoute,
}

export function nextModuleForRoute(
  route: LearningRoute,
  completedModuleIds: readonly MathLabModuleId[],
): MathLabModuleId | undefined {
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
