import { curriculumCatalog } from './catalog.ts'
import type { CurriculumTrack } from './types.ts'

const copy = (zhCN: string, en: string) => ({ 'zh-CN': zhCN, en })

const mathModuleIds = curriculumCatalog
  .filter((moduleDefinition) => moduleDefinition.domain === 'math')
  .map((moduleDefinition) => moduleDefinition.id)

export const curriculumTracks: CurriculumTrack[] = [
  {
    id: 'core-learning-path',
    kind: 'core',
    title: copy('默认学习主线', 'Default Spine'),
    description: copy(
      '从 AI 地图和数据表开始，穿过特征、损失、训练、泛化、非线性模型、CNN 和序列桥接，最后到 Attention/Transformer 入门。',
      'The data-first main route from the AI map and tables through features, loss, training, generalization, nonlinear models, CNNs, a sequence bridge, and Attention/Transformer basics.',
    ),
    moduleIds: [
      'ai-overview',
      'python-notebook',
      'numerical-data',
      'categorical-data',
      'dataset-quality',
      'beginner-linear-algebra',
      'linear-algebra-feature-space',
      'loss-functions',
      'linear-regression',
      'gradient-descent',
      'logistic-regression',
      'beginner-probability-distributions',
      'probability-likelihood-entropy',
      'classification',
      'splits-generalization',
      'model-selection',
      'complexity-regularization',
      'tree-forest',
      'mlp',
      'optimizer-comparison',
      'tensor-shapes-vectorization',
      'cnn-visualization',
      'sequence-embedding-bridge',
      'attention-transformer',
    ],
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
