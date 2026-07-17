import type {
  LearningRoute,
  LearningRouteId,
  LearningRouteProgressSummary,
  LocalizedCopy,
  MathLabProgress,
  MathLabModuleId,
} from '../types/mathLab'
import {
  aiMathPathModuleIds,
  calculusRouteModuleIds,
  linearAlgebraRouteModuleIds,
  mathToCodePilotModuleIds,
  numericalDeepeningModuleIds,
} from './mathCourseOrder.ts'

export {
  aiMathPathModuleIds,
  calculusRouteModuleIds,
  linearAlgebraRouteModuleIds,
  mathToCodePilotModuleIds,
} from './mathCourseOrder.ts'

function copy(zh: string, en: string): LocalizedCopy {
  return { 'zh-CN': zh, en }
}

const aiMathMainPathRoute: LearningRoute = {
  id: 'ai-math-main-path',
  title: copy('AI 数学主线', 'AI Math Main Path'),
  description: copy(
    '从零基础数学直觉进入 shape、自动微分、概率损失、优化、PCA 和深度结构。',
    'Move from beginner math intuition into shape, autodiff, probabilistic loss, optimization, PCA, and deep architecture math.',
  ),
  audience: copy('想为机器学习建数学地基的初学者。', 'Beginners building the math foundation for machine learning.'),
  chapterModuleIds: aiMathPathModuleIds,
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
  chapterModuleIds: numericalDeepeningModuleIds,
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
  entryAssumptions: [
    { id: 'high-school-algebra', label: copy('高中代数与基础函数', 'High-school algebra and basic functions') },
    { id: 'basic-python', label: copy('基础 Python', 'Basic Python') },
  ],
  prerequisiteOverrides: Object.fromEntries(mathToCodePilotModuleIds.map((moduleId, index) => [
    moduleId,
    index === 0 ? [] : [mathToCodePilotModuleIds[index - 1]],
  ])),
  completionVersion: 'math-to-code-v1',
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

export function completedModuleIdsForRoute(
  route: LearningRoute,
  progress: Pick<MathLabProgress, 'completedModuleIds' | 'routeCompletions'>,
): readonly MathLabModuleId[] {
  if (!route.completionVersion) return progress.completedModuleIds
  const routeProgress = progress.routeCompletions?.[route.id]
  return routeProgress?.version === route.completionVersion ? routeProgress.completedModuleIds : []
}

export function validateLearningRoutes(routes: readonly LearningRoute[]): string[] {
  const issues: string[] = []
  for (const route of routes) {
    const routeModuleIds = new Set(route.chapterModuleIds)
    const assumptionIds = new Set(route.entryAssumptions?.map(({ id }) => id) ?? [])
    const overrides = route.prerequisiteOverrides
    if (!overrides) continue

    for (const moduleId of route.chapterModuleIds) {
      if (!(moduleId in overrides)) {
        issues.push(`route-prerequisite-override-missing:${route.id}:${moduleId}`)
        continue
      }
      const moduleIndex = route.chapterModuleIds.indexOf(moduleId)
      for (const prerequisiteId of overrides[moduleId] ?? []) {
        if (assumptionIds.has(prerequisiteId)) continue
        if (!routeModuleIds.has(prerequisiteId)) {
          issues.push(`route-prerequisite-unknown:${route.id}:${moduleId}:${prerequisiteId}`)
          continue
        }
        if (route.chapterModuleIds.indexOf(prerequisiteId) >= moduleIndex) {
          issues.push(`route-prerequisite-not-earlier:${route.id}:${moduleId}:${prerequisiteId}`)
        }
      }
    }
  }
  return issues
}

export interface RouteModuleNavigation {
  routeId: LearningRouteId
  displayOrder: number
  effectivePrerequisiteIds?: readonly string[]
  entryAssumptions: LearningRoute['entryAssumptions']
  previousModuleId?: MathLabModuleId
  nextModuleId?: MathLabModuleId
}

export function routeNavigationForModule(
  routeId: unknown,
  moduleId: MathLabModuleId,
): RouteModuleNavigation | undefined {
  if (typeof routeId !== 'string' || !(routeId in learningRouteById)) return undefined
  const typedRouteId = routeId as LearningRouteId
  const route = learningRouteById[typedRouteId]
  const index = route.chapterModuleIds.indexOf(moduleId)
  if (index < 0) return undefined
  return {
    routeId: typedRouteId,
    displayOrder: index + 1,
    effectivePrerequisiteIds: route.prerequisiteOverrides?.[moduleId],
    entryAssumptions: route.entryAssumptions,
    previousModuleId: route.chapterModuleIds[index - 1],
    nextModuleId: route.chapterModuleIds[index + 1],
  }
}
