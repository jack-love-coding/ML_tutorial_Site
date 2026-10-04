import { curriculumLessonDirectory } from './generated/lessonDirectory.ts'
import type { LocalizedCopy } from '../types/ml.ts'
import type { CurriculumReadingStep } from './types.ts'

export const textbookRouteId = 'core-learning-path'
const copy = (zh: string, en: string): LocalizedCopy => ({ 'zh-CN': zh, en })
export interface TeachingUnit {
  id: string
  title: LocalizedCopy
  question: LocalizedCopy
  prerequisites: LocalizedCopy
  instructions: LocalizedCopy
  explanation: LocalizedCopy
  publicationStatus: 'preview' | 'pilot' | 'published'
  readings: CurriculumReadingStep[]
  optional?: CurriculumReadingStep[]
}

export const teachingUnits: TeachingUnit[] = [
  {
    id: 'unit-1', title: copy('AI 与代码入门', 'AI and code foundations'), publicationStatus: 'pilot',
    question: copy('模型怎样从数据中学习？代码如何表达这些步骤？', 'How do models learn from data, and how does code express the steps?'),
    prerequisites: copy('无需编程经验；准备一个可以运行 Notebook 的环境。', 'No programming experience required; prepare a Notebook environment.'),
    instructions: copy('先读 AI 总览，再从 Python 首章开始逐格运行代码，比较输入与输出。', 'Read the AI overview, then run Python cells in order and compare inputs with outputs.'),
    explanation: copy('变量保存数据，函数描述变换；图表把程序输出变成可解释的证据。', 'Variables hold data and functions transform it; charts make the output interpretable.'),
    readings: [{ moduleId: 'ai-overview' }, { moduleId: 'python-notebook', lessonIds: ['notebook-workflow', 'numpy-foundations', 'pandas-structures', 'pandas-analysis', 'matplotlib-visualization'] }],
    optional: [{ moduleId: 'python-notebook', lessonIds: ['seaborn-statistics', 'plotly-exploration', 'analysis-report'] }],
  },
  {
    id: 'unit-2', title: copy('从数据到模型输入', 'From data to model inputs'), publicationStatus: 'pilot',
    question: copy('怎样处理数据，才能诚实地评估未来表现？', 'How can data preparation support an honest estimate of future performance?'),
    prerequisites: copy('能够读取 DataFrame 的行、列与基本图表。', 'Read DataFrame rows, columns, and basic charts.'),
    instructions: copy('先固定训练、验证、测试职责，再比较清洗、缩放与编码的结果。', 'Fix train, validation, and test roles before comparing cleaning, scaling, and encoding.'),
    explanation: copy('填充值、缩放参数和类别词表只从训练集拟合；测试集用于最后一次评估。', 'Fit imputation, scaling, and category vocabularies only on training data; reserve test data for final evaluation.'),
    readings: ['splits-generalization', 'dataset-quality', 'numerical-data', 'categorical-data'].map(moduleId => ({ moduleId })),
  },
  {
    id: 'unit-3', title: copy('第一个可解释模型', 'Your first interpretable model'), publicationStatus: 'pilot',
    question: copy('模型、目标函数和参数更新分别负责什么？', 'What are the separate roles of the model, objective, and parameter update?'),
    prerequisites: copy('理解特征、标签和训练集边界。', 'Understand features, labels, and the training-data boundary.'),
    instructions: copy('用短篇数学桥接读懂公式；在损失课比较目标，在梯度下降课改变更新步长，在回归课解释权重。', 'Use the short math bridges; compare objectives in loss, step sizes in gradient descent, and weights in regression.'),
    explanation: copy('损失衡量误差，梯度决定局部方向，回归模型把特征变成预测；三者各有主讲位置。', 'Loss measures error, gradients define a local direction, and regression maps features to predictions.'),
    readings: [
      { moduleId: 'calculus-functions-rate-change', lessonIds: ['mapping-intuition', 'worked-prediction', 'python-translation'], supplementalLabIds: ['prediction-mapping-lab'] },
      { moduleId: 'beginner-linear-algebra', lessonIds: ['beginner-linear-data-vector', 'minimum-linear-shape-ledger', 'beginner-linear-matrix-machine', 'minimum-linear-batch-output'] },
      { moduleId: 'loss-functions', lessonIds: ['why-loss', 'regression-losses'] },
      { moduleId: 'calculus-derivatives-local-change', lessonIds: ['derivatives-intuition', 'derivatives-worked-shared', 'minimum-derivative-local-approximation'] },
      { moduleId: 'calculus-partial-derivatives-gradients', lessonIds: ['partial-one-direction', 'gradient-collects-partials'], supplementalLabIds: ['calculus-partial-derivative-lab'] },
      { moduleId: 'gradient-descent' }, { moduleId: 'linear-regression' },
    ],
  },
  {
    id: 'unit-4', title: copy('理解泛化并复现回归案例', 'Generalization and a regression project'), publicationStatus: 'pilot',
    question: copy('训练误差下降，为什么未来误差仍可能变大？', 'Why can future error grow while training error falls?'),
    prerequisites: copy('理解回归模型、损失与参数更新。', 'Understand regression, loss, and parameter updates.'),
    instructions: copy('比较复杂度和正则化，再按项目步骤复现数据划分、基线、参考结果与失败解释。', 'Compare complexity and regularization, then reproduce the project split, baseline, results, and failure analysis.'),
    explanation: copy('Python 与回归共用的 Bike Sharing 是已分析的参考案例；房价项目使用独立冻结数据说明最终评估。', 'Bike Sharing is a previously analyzed reference shared by Python and regression. The housing project uses independently frozen data for final evaluation.'),
    readings: [{ moduleId: 'complexity-regularization' }, { moduleId: 'housing-price-project' }],
  },
  {
    id: 'unit-5', title: copy('从概率到分类决策', 'From probability to classification decisions'), publicationStatus: 'preview',
    question: copy('概率如何转化为预测决策，错误成本又如何影响阈值？', 'How do probabilities become decisions, and how do error costs affect thresholds?'),
    prerequisites: copy('能够区分模型输出、损失函数与训练更新。', 'Distinguish model outputs, objectives, and training updates.'),
    instructions: copy('先理解概率和逻辑回归，再回访分类损失与似然，最后比较阈值和指标。', 'Read probability and logistic regression, revisit classification loss and likelihood, then compare thresholds and metrics.'),
    explanation: copy('BCE 评价概率；阈值将概率变成决策。改变阈值不会重新训练模型。', 'BCE evaluates probabilities; a threshold turns probabilities into decisions without retraining the model.'),
    readings: [{ moduleId: 'beginner-probability-distributions' }, { moduleId: 'logistic-regression' }, { moduleId: 'loss-functions', lessonIds: ['classification-losses', 'likelihood-intuition', 'negative-log', 'mle-bridge'] }, { moduleId: 'classification' }],
  },
  {
    id: 'unit-6', title: copy('比较模型与分类案例', 'Model comparison and a classification project'), publicationStatus: 'preview',
    question: copy('如何在相同评估协议下比较不同模型？', 'How can different models be compared under the same evaluation protocol?'),
    prerequisites: copy('理解概率、分类指标、阈值与错误成本。', 'Understand probabilities, metrics, thresholds, and error costs.'),
    instructions: copy('观察树与森林，再固定交叉验证协议，复现分类案例及其参考结果。', 'Explore trees and forests, fix the cross-validation protocol, and reproduce the classification project.'),
    explanation: copy('用验证结果选择模型；独立冻结测试数据只用于最终评估。', 'Use validation results to select models and independently frozen test data for final evaluation.'),
    readings: [{ moduleId: 'tree-forest' }, { moduleId: 'model-selection' }, { moduleId: 'classification-project' }],
  },
]

export const legacySpineUnitIds: Record<string, string> = {
  orientation: 'unit-1', 'data-to-features': 'unit-2', 'feature-space-and-loss': 'unit-3', 'linear-regression': 'unit-3', 'training-motion': 'unit-3',
  'classification-probability': 'unit-5', 'generalization-selection': 'unit-4', 'trees-and-interactions': 'unit-6',
  'neural-network-foundations': 'unit-6', 'visual-deep-learning': 'unit-6', 'sequence-attention': 'unit-6', 'language-models-rag': 'unit-6',
}
export interface ReadingLesson { unitId: string; moduleId: string; lessonId: string; title: LocalizedCopy; path: string; hash?: string }
export function expandReadingStep(step: CurriculumReadingStep, unitId: string): ReadingLesson[] {
  const module = curriculumLessonDirectory.find(entry => entry.id === step.moduleId)
  if (!module) throw new Error(`Unknown reading module: ${step.moduleId}`)
  return (step.lessonIds ?? module.lessons.map(lesson => lesson.id)).map(lessonId => {
    const lesson = module.lessons.find(entry => entry.id === lessonId)
    if (!lesson) throw new Error(`Unknown reading lesson: ${step.moduleId}/${lessonId}`)
    return { unitId, moduleId: step.moduleId, lessonId, title: lesson.title,
      path: module.source === 'algorithm' ? `${module.route}/${lessonId}` : module.route,
      ...(module.source === 'algorithm' ? {} : { hash: `#${lessonId}` }),
    }
  })
}
export const textbookReadings = teachingUnits.flatMap(unit => unit.readings.flatMap(step => expandReadingStep(step, unit.id)))
export function readingLocation(lesson: ReadingLesson) { return { path: lesson.path, hash: lesson.hash, query: { route: textbookRouteId } } }
export function identifyReadingLocation(path: string, hash = '') {
  const module = curriculumLessonDirectory.find(entry => path === entry.route || path.startsWith(entry.route + '/'))
    ?? (path === '/python' || path.startsWith('/python/') ? curriculumLessonDirectory.find(entry => entry.id === 'python-notebook') : undefined)
  if (!module) return undefined
  const lessonId = module.source === 'algorithm' ? path.split('/').at(-1) : hash.slice(1)
  return { moduleId: module.id, lessonId: module.lessons.some(lesson => lesson.id === lessonId) ? lessonId! : '' }
}
export function readingContext(query: unknown, path: string, hash = '') {
  if (query !== textbookRouteId) return undefined
  const current = identifyReadingLocation(path, hash)
  if (!current) return undefined
  const index = textbookReadings.findIndex(entry => entry.moduleId === current.moduleId && (!current.lessonId || current.lessonId === entry.lessonId))
  if (index < 0) return undefined
  const lesson = textbookReadings[index]!
  const unit = teachingUnits.find(entry => entry.id === lesson.unitId)!
  return { lesson, unit, index, previous: textbookReadings[index - 1], next: textbookReadings[index + 1] }
}
export function selectedReadingLessonIds(query: unknown, moduleId: string, lessonId: string) {
  return selectedReadingStep(query, moduleId, lessonId)?.lessonIds
}
export function selectedReadingStep(query: unknown, moduleId: string, lessonId: string) {
  if (query !== textbookRouteId) return undefined
  return teachingUnits.flatMap(unit => unit.readings).find(entry => entry.moduleId === moduleId && (!entry.lessonIds || entry.lessonIds.includes(lessonId) || !lessonId))
}
