import type { LocalizedCopy, ModuleSlug } from '../../types/ml.ts'
import { resolveCanonicalLearnRoute } from '../routes.ts'

export type ClassicalSupervisedCorridorModuleId = Extract<
  ModuleSlug,
  | 'loss-functions'
  | 'linear-regression'
  | 'housing-price-project'
  | 'logistic-regression'
  | 'classification'
>

export interface ClassicalSupervisedCorridorStep {
  id: ClassicalSupervisedCorridorModuleId
  blueprintId: string
  order: number
  title: LocalizedCopy
  role: LocalizedCopy
  route: string
  prerequisiteModuleIds: ClassicalSupervisedCorridorModuleId[]
  previousModuleId?: ClassicalSupervisedCorridorModuleId
  nextModuleId?: ClassicalSupervisedCorridorModuleId
  courseUnitIds: string[]
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const routeFor = (moduleId: ClassicalSupervisedCorridorModuleId) => {
  const route = resolveCanonicalLearnRoute(moduleId)
  if (!route) throw new Error(`Missing canonical route for corridor module: ${moduleId}`)
  return route
}

export const classicalSupervisedCorridor: ClassicalSupervisedCorridorStep[] = [
  {
    id: 'loss-functions',
    blueprintId: 'loss-functions',
    order: 1,
    title: copy('损失函数', 'Loss Functions'),
    role: copy('先定义模型究竟在优化什么', 'Define what the model is optimizing'),
    route: routeFor('loss-functions'),
    prerequisiteModuleIds: [],
    nextModuleId: 'linear-regression',
    courseUnitIds: ['08-linear-regression-optimization'],
  },
  {
    id: 'linear-regression',
    blueprintId: 'linear-regression',
    order: 2,
    title: copy('线性回归', 'Linear Regression'),
    role: copy('把损失、梯度与参数更新连成训练闭环', 'Connect loss, gradients, and parameter updates'),
    route: routeFor('linear-regression'),
    prerequisiteModuleIds: ['loss-functions'],
    previousModuleId: 'loss-functions',
    nextModuleId: 'housing-price-project',
    courseUnitIds: ['08-linear-regression-optimization'],
  },
  {
    id: 'housing-price-project',
    blueprintId: 'project-tabular-regression',
    order: 3,
    title: copy('表格回归项目', 'Tabular Regression Project'),
    role: copy('在固定划分上建立可复现的诚实基线', 'Build a reproducible honest baseline on fixed splits'),
    route: routeFor('housing-price-project'),
    prerequisiteModuleIds: ['linear-regression'],
    previousModuleId: 'linear-regression',
    nextModuleId: 'logistic-regression',
    courseUnitIds: ['14-tabular-pipeline'],
  },
  {
    id: 'logistic-regression',
    blueprintId: 'logistic-regression',
    order: 4,
    title: copy('逻辑回归', 'Logistic Regression'),
    role: copy('把线性分数变成概率，并保持训练可审计', 'Turn linear scores into auditable probabilities'),
    route: routeFor('logistic-regression'),
    prerequisiteModuleIds: ['loss-functions', 'linear-regression', 'housing-price-project'],
    previousModuleId: 'housing-price-project',
    nextModuleId: 'classification',
    courseUnitIds: ['09-logistic-regression-thresholds'],
  },
  {
    id: 'classification',
    blueprintId: 'classification',
    order: 5,
    title: copy('分类决策', 'Classification Decisions'),
    role: copy('用验证成本把概率转换为可解释行动', 'Turn probabilities into explainable actions using validation costs'),
    route: routeFor('classification'),
    prerequisiteModuleIds: ['logistic-regression'],
    previousModuleId: 'logistic-regression',
    courseUnitIds: ['09-logistic-regression-thresholds'],
  },
]

export const classicalSupervisedCorridorById = new Map(
  classicalSupervisedCorridor.map((step) => [step.id, step]),
)

export function isClassicalSupervisedCorridorModule(
  moduleId: string,
): moduleId is ClassicalSupervisedCorridorModuleId {
  return classicalSupervisedCorridorById.has(moduleId as ClassicalSupervisedCorridorModuleId)
}
