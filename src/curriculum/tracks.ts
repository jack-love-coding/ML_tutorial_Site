import { coreLearningPathModuleIds } from './routeManifest.ts'
import { curriculumCatalogMetadata } from './catalogMetadata.ts'
import type { CurriculumTrack } from './types.ts'

const copy = (zhCN: string, en: string) => ({ 'zh-CN': zhCN, en })

const mathModuleIds = curriculumCatalogMetadata
  .filter((moduleDefinition) => moduleDefinition.domain === 'math')
  .map((moduleDefinition) => moduleDefinition.id)

export const curriculumTracks: CurriculumTrack[] = [
  {
    id: 'core-learning-path',
    kind: 'core',
    title: copy('六单元学习路线', 'Six-unit learning route'),
    description: copy(
      '从 AI 与 Python 出发，学习数据输入、回归、泛化、分类和模型比较；数学按需桥接。',
      'Start with AI and Python, then study data inputs, regression, generalization, classification, and model comparison with short math bridges.',
    ),
    moduleIds: coreLearningPathModuleIds,
  },
  {
    id: 'math-topic-library',
    kind: 'topic-library',
    title: copy('数学专题库', 'Math Topic Library'),
    description: copy(
      '按需补充向量、矩阵、微积分、概率和数值稳定。',
      'Just-in-time support for vectors, matrices, calculus, probability, and numerical stability.',
    ),
    moduleIds: mathModuleIds,
  },
  {
    id: 'data-topic-library',
    kind: 'topic-library',
    title: copy('数据专题库', 'Data Topic Library'),
    description: copy(
      '理解表格、特征、清洗、划分、EDA 和正则化。',
      'Understand tables, features, cleaning, splits, EDA, and regularization.',
    ),
    moduleIds: [
      'numerical-data',
      'categorical-data',
      'dataset-quality',
      'splits-generalization',
      'complexity-regularization',
    ],
  },
  {
    id: 'project-practice',
    kind: 'project',
    title: copy('项目实战', 'Project Practice'),
    description: copy('在阶段总结中完成端到端项目。', 'Complete end-to-end projects as stage summaries.'),
    moduleIds: ['housing-price-project', 'classification-project'],
  },
]
