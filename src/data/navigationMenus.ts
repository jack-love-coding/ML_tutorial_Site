import type { DataLabModuleId } from '../modules/data-lab/types/dataLab'
import {
  coreLearningPathModuleIds,
  curriculumRouteManifestByDomain,
  curriculumRouteManifestById,
  projectPracticeModuleIds,
} from '../curriculum/routeManifest.ts'
import { resolveCanonicalLearnRoute } from '../curriculum/routes.ts'
import type { CurriculumDomain } from '../curriculum/types.ts'
import type { LocalizedCopy, ModuleSlug } from '../types/ml'

export type SiteNavigationMenuId = 'learning-path' | 'topic-library' | 'projects' | 'progress'

export interface NavigationLink<TId extends string = string> {
  id: TId
  route: string
  label: LocalizedCopy
}

export interface NavigationGroup<TItemId extends string = string> {
  id: string
  label: LocalizedCopy
  items: Array<NavigationLink<TItemId>>
}

export interface CoreExperimentNavigationGroup {
  id: string
  label: LocalizedCopy
  moduleSlugs: ModuleSlug[]
}

export interface CurriculumNavigationMenu {
  id: SiteNavigationMenuId
  label: LocalizedCopy
  overviewLink?: NavigationLink
  utilityLinks: NavigationLink[]
  groups: NavigationGroup[]
  activePrefixes: string[]
}

function copy(zhCN: string, en: string): LocalizedCopy {
  return { 'zh-CN': zhCN, en }
}

function mathModule(id: string, zhCN: string, en: string): NavigationLink {
  return {
    id,
    route: `/math-lab/modules/${id}`,
    label: copy(zhCN, en),
  }
}

function dataModule(id: DataLabModuleId, zhCN: string, en: string): NavigationLink<DataLabModuleId> {
  return {
    id,
    route: `/data-lab/modules/${id}`,
    label: copy(zhCN, en),
  }
}

function moduleLink(moduleId: string): NavigationLink {
  const moduleDefinition = curriculumRouteManifestById.get(moduleId)
  const fallbackLabel = copy(moduleId, moduleId)

  return {
    id: moduleId,
    route: resolveCanonicalLearnRoute(moduleId) ?? `/learn/${moduleId}`,
    label: moduleDefinition?.title ?? fallbackLabel,
  }
}

function domainModules(domain: CurriculumDomain) {
  return curriculumRouteManifestByDomain(domain).map((moduleDefinition) => moduleDefinition.id)
}

export const mathLabOverviewLink: NavigationLink<'math-lab-overview'> = {
  id: 'math-lab-overview',
  route: '/math-lab',
  label: copy('实验室总览', 'Lab Overview'),
}

export const mathLabUtilityLinks: Array<NavigationLink<'math-lab-diagnostic'>> = [
  {
    id: 'math-lab-diagnostic',
    route: '/math-lab/diagnostic',
    label: copy('学习诊断', 'Learning Diagnostic'),
  },
]

export const dataLabOverviewLink: NavigationLink<'data-lab-overview'> = {
  id: 'data-lab-overview',
  route: '/data-lab',
  label: copy('实验室总览', 'Lab Overview'),
}

export const coreExperimentNavigationGroups: CoreExperimentNavigationGroup[] = [
  {
    id: 'orientation',
    label: copy('入门路线', 'Orientation'),
    moduleSlugs: ['ai-overview', 'python-notebook'],
  },
  {
    id: 'projects',
    label: copy('项目实战', 'Projects'),
    moduleSlugs: ['housing-price-project', 'classification-project'],
  },
  {
    id: 'model-foundations',
    label: copy('模型基础', 'Model Foundations'),
    moduleSlugs: ['loss-functions', 'linear-regression', 'logistic-regression', 'classification'],
  },
  {
    id: 'training-selection',
    label: copy('训练与选择', 'Training and Selection'),
    moduleSlugs: ['gradient-descent', 'model-selection', 'optimizer-comparison'],
  },
  {
    id: 'advanced-architectures',
    label: copy('树模型、深度与生成', 'Trees, Deep Learning, and Generative AI'),
    moduleSlugs: ['tree-forest', 'mlp', 'cnn-visualization', 'attention-transformer', 'llm-rag'],
  },
]

export const mathLabNavigationGroups: NavigationGroup[] = [
  {
    id: 'zero-foundation',
    label: copy('零基础桥接', 'Beginner Bridge'),
    items: [
      mathModule('beginner-linear-algebra', 'AI 零基础线性代数', 'Linear Algebra for AI Beginners'),
      mathModule('beginner-probability-distributions', 'AI 零基础概率分布', 'Probability Distributions for AI Beginners'),
    ],
  },
  {
    id: 'linear-algebra',
    label: copy('线性代数与数值稳定', 'Linear Algebra and Stability'),
    items: [
      mathModule('linear-algebra-feature-space', '向量与特征空间', 'Vectors and Feature Space'),
      mathModule('linear-algebra-distance-similarity', '距离、范数与相似度', 'Distance, Norms, and Similarity'),
      mathModule('linear-algebra-matrix-transformations', '矩阵与线性变换', 'Matrices and Linear Transformations'),
      mathModule('linear-algebra-rank-null-space', '列空间、rank 与 null space', 'Column Space, Rank, and Null Space'),
      mathModule('eigenvalues-eigenvectors', '特征值与特征向量', 'Eigenvalues and Eigenvectors'),
      mathModule('svd', '奇异值分解（SVD）', 'Singular Value Decomposition (SVD)'),
      mathModule('pca', '主成分分析（PCA）', 'Principal Component Analysis (PCA)'),
    ],
  },
  {
    id: 'linear-algebra-tools',
    label: copy('线性代数工具与稳定性', 'Linear Algebra Tools and Stability'),
    items: [
      mathModule('tensor-shapes-vectorization', '张量 shape 与向量化', 'Tensor Shapes and Vectorization'),
      mathModule('lu-decomposition', '用 LU 分解求解线性方程', 'LU Decomposition for Solving Linear Equations'),
      mathModule('sparse-matrices', '稀疏矩阵', 'Sparse Matrices'),
      mathModule('condition-numbers', '条件数', 'Condition Numbers'),
    ],
  },
  {
    id: 'calculus-route',
    label: copy('微积分学习路线', 'Calculus Learning Route'),
    items: [
      mathModule('calculus-functions-rate-change', '函数和变化率', 'Functions and Rate of Change'),
      mathModule('calculus-derivatives-local-change', '导数：当前点附近的变化', 'Derivatives as Local Change'),
      mathModule('calculus-partial-derivatives-gradients', '偏导数和梯度', 'Partial Derivatives and Gradients'),
      mathModule('calculus-gradient-descent', '梯度下降', 'Gradient Descent'),
      mathModule('calculus-sgd-batch-noise', 'Full Batch、Mini-Batch 和 SGD', 'Full Batch, Mini-Batch, and SGD'),
      mathModule('calculus-optimizer-comparison', '优化器比较', 'Optimizer Comparison'),
      mathModule('calculus-training-code-diagnostics', '训练代码和曲线诊断', 'Training Code and Curve Diagnostics'),
    ],
  },
  {
    id: 'calculus-optimization',
    label: copy('微积分、方程与优化', 'Calculus, Equations, and Optimization'),
    items: [
      mathModule('taylor-series', '泰勒级数', 'Taylor Series'),
      mathModule('matrix-calculus-autodiff', '矩阵微积分与自动微分', 'Matrix Calculus and Automatic Differentiation'),
      mathModule('finite-difference-methods', '有限差分方法', 'Finite Difference Methods'),
      mathModule('nonlinear-equations', '求解非线性方程', 'Solving Nonlinear Equations'),
      mathModule('optimization', '优化', 'Optimization'),
      mathModule('training-diagnostics', '训练诊断数学', 'Mathematics of Training Diagnostics'),
    ],
  },
  {
    id: 'probability-sampling',
    label: copy('概率、采样与随机过程', 'Probability, Sampling, and Stochastic Processes'),
    items: [
      mathModule('monte-carlo', '随机数生成器与蒙特卡洛方法', 'Random Number Generators and Monte Carlo Method'),
      mathModule('probability-likelihood-entropy', '概率、似然与熵', 'Probability, Likelihood, and Entropy'),
      mathModule('markov-chains', '马尔可夫链', 'Markov chains'),
    ],
  },
  {
    id: 'data-geometry-architectures',
    label: copy('数据几何与深度结构', 'Data Geometry and Deep Architectures'),
    items: [
      mathModule('least-squares-fitting', '最小二乘拟合', 'Least Squares Fitting'),
      mathModule('deep-architecture-math', '深度结构中的数学', 'Mathematics Inside Deep Architectures'),
    ],
  },
]

export const dataLabNavigationGroups: Array<NavigationGroup<DataLabModuleId>> = [
  {
    id: 'feature-inputs',
    label: copy('模型输入协议', 'Model Input Contract'),
    items: [
      dataModule('numerical-data', '数值数据：从列到特征向量', 'Numerical Data: From Columns to Feature Vectors'),
      dataModule('categorical-data', '类别数据：词表、one-hot 与特征交叉', 'Categorical Data: Vocabularies, One-hot, and Feature Crosses'),
    ],
  },
  {
    id: 'quality-analysis',
    label: copy('质量、标签与探索分析', 'Quality, Labels, and EDA'),
    items: [
      dataModule('dataset-quality', '数据质量：缺失、标签与代表性', 'Data Quality: Missingness, Labels, and Representativeness'),
    ],
  },
  {
    id: 'generalization',
    label: copy('评估、泛化与正则化', 'Evaluation, Generalization, and Regularization'),
    items: [
      dataModule('splits-generalization', '划分与泛化：让评估像未来一样未知', 'Splits and Generalization: Make Evaluation Look Like the Future'),
      dataModule('complexity-regularization', '复杂度、正则化与损失曲线', 'Complexity, Regularization, and Loss Curves'),
    ],
  },
]

export const curriculumNavigationMenus: CurriculumNavigationMenu[] = [
  {
    id: 'learning-path',
    label: copy('默认学习主线', 'Default Spine'),
    overviewLink: {
      id: 'core-learning-path',
      route: '/spine',
      label: copy('默认学习主线', 'Default Spine'),
    },
    utilityLinks: [],
    activePrefixes: ['/spine', '/tracks/core-learning-path', '/learn'],
    groups: [
      {
        id: 'default-spine',
        label: copy('Spine V1 主线', 'Spine V1'),
        items: coreLearningPathModuleIds.map(moduleLink),
      },
    ],
  },
  {
    id: 'topic-library',
    label: copy('支持镜头', 'Support Lenses'),
    overviewLink: {
      id: 'library-math',
      route: '/library/math',
      label: copy('数学镜头', 'Math Lens'),
    },
    utilityLinks: [],
    activePrefixes: ['/library', '/math-lab', '/data-lab'],
    groups: [
      {
        id: 'math-lens',
        label: copy('数学镜头', 'Math Lens'),
        items: domainModules('math').map(moduleLink),
      },
      {
        id: 'data-lens',
        label: copy('数据镜头', 'Data Lens'),
        items: domainModules('data').map(moduleLink),
      },
      {
        id: 'model-lens',
        label: copy('模型与训练镜头', 'Model Lens'),
        items: domainModules('model').map(moduleLink),
      },
      {
        id: 'deep-learning-lens',
        label: copy('深度学习镜头', 'Deep Learning Lens'),
        items: domainModules('deep-learning').map(moduleLink),
      },
    ],
  },
  {
    id: 'projects',
    label: copy('项目实战', 'Projects'),
    overviewLink: {
      id: 'project-practice',
      route: '/tracks/project-practice',
      label: copy('项目实战', 'Project Practice'),
    },
    utilityLinks: [],
    activePrefixes: ['/tracks/project-practice', '/projects'],
    groups: [
      {
        id: 'project-practice',
        label: copy('项目实战', 'Project Practice'),
        items: projectPracticeModuleIds.map(moduleLink),
      },
    ],
  },
  {
    id: 'progress',
    label: copy('我的进度', 'Progress'),
    overviewLink: {
      id: 'progress-overview',
      route: '/progress',
      label: copy('学习进度', 'Learning Progress'),
    },
    utilityLinks: [],
    activePrefixes: ['/progress'],
    groups: [],
  },
]
