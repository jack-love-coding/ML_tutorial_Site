import { curriculumCatalog } from '../catalog.ts'
import type { CurriculumV3AuditEntry, CurriculumV3MigrationAction } from './types.ts'

const auditTargets: Record<string, string[]> = {
  'ai-overview': ['ai-overview'], 'python-notebook': ['python-notebook'],
  'housing-price-project': ['project-tabular-regression'], 'classification-project': ['project-classification-evaluation'],
  'model-selection': ['model-selection'], 'tree-forest': ['tree-forest'], 'cnn-visualization': ['cnn-visualization'],
  'sequence-embedding-bridge': ['sequence-embedding-bridge'],
  'attention-transformer': ['attention-qkv-multihead', 'transformer-blocks', 'small-transformer-training', 'decoding-sampling'],
  'optimizer-comparison': ['optimizer-comparison'],
  'llm-rag': ['llm-inference-context', 'peft-lora', 'retrieval-rag-systems', 'llm-evaluation-reliability'],
  'loss-functions': ['loss-functions'], 'gradient-descent': ['gradient-descent'], 'linear-regression': ['linear-regression'],
  'logistic-regression': ['logistic-regression'], classification: ['classification'], mlp: ['mlp'],
  'beginner-linear-algebra': ['beginner-linear-algebra'], 'linear-algebra-feature-space': ['linear-algebra-feature-space'],
  'linear-algebra-distance-similarity': ['linear-algebra-distance-similarity'],
  'linear-algebra-matrix-transformations': ['linear-algebra-matrix-transformations'],
  'linear-algebra-rank-null-space': ['linear-algebra-rank-null-space'], 'eigenvalues-eigenvectors': ['eigenvalues-eigenvectors'],
  svd: ['svd-pca-representation'], pca: ['svd-pca-representation'],
  'tensor-shapes-vectorization': ['tensor-shapes-vectorization'],
  'calculus-functions-rate-change': ['calculus-functions-rate-change'],
  'calculus-derivatives-local-change': ['calculus-derivatives-local-change'],
  'calculus-partial-derivatives-gradients': ['calculus-partial-derivatives-gradients'],
  'calculus-gradient-descent': ['gradient-descent'],
  'calculus-sgd-batch-noise': ['gradient-descent', 'optimizer-comparison'],
  'calculus-optimizer-comparison': ['optimizer-comparison'],
  'calculus-training-code-diagnostics': ['training-diagnostics'],
  'taylor-series': ['chain-rule-local-approximation'], 'matrix-calculus-autodiff': ['matrix-calculus-autodiff'],
  'beginner-probability-distributions': ['beginner-probability-distributions'], 'monte-carlo': ['monte-carlo'],
  'probability-likelihood-entropy': ['probability-likelihood-entropy'],
  'lu-decomposition': ['numerical-linear-algebra'], 'sparse-matrices': ['numerical-linear-algebra'],
  'condition-numbers': ['numerical-linear-algebra'], 'markov-chains': ['conditional-probability-markov'],
  'finite-difference-methods': ['numerical-differentiation-root-finding'],
  'nonlinear-equations': ['numerical-differentiation-root-finding'], optimization: ['gradient-descent'],
  'training-diagnostics': ['training-diagnostics'], 'least-squares-fitting': ['least-squares-fitting'],
  'deep-architecture-math': ['deep-architecture-math'], 'numerical-data': ['numerical-data'],
  'categorical-data': ['categorical-data'], 'dataset-quality': ['dataset-quality'],
  'splits-generalization': ['splits-generalization'], 'complexity-regularization': ['complexity-regularization'],
}

const splitIds = new Set(['attention-transformer', 'llm-rag'])
const keepIds = new Set([
  'numerical-data', 'categorical-data', 'dataset-quality', 'splits-generalization',
  'complexity-regularization', 'sequence-embedding-bridge',
])
const depthIds = new Set([
  'lu-decomposition', 'sparse-matrices', 'condition-numbers', 'finite-difference-methods',
  'nonlinear-equations', 'taylor-series', 'markov-chains', 'deep-architecture-math',
])
const targetUseCounts = Object.values(auditTargets).flat().reduce<Record<string, number>>((counts, id) => {
  counts[id] = (counts[id] ?? 0) + 1
  return counts
}, {})

function actionFor(currentId: string, targetIds: string[]): CurriculumV3AuditEntry['action'] {
  if (splitIds.has(currentId)) return 'split'
  if (keepIds.has(currentId)) return 'keep'
  if (targetIds.some((id) => targetUseCounts[id] > 1)) return 'merge'
  if (depthIds.has(currentId)) return 'demote-to-depth'
  return 'rebuild'
}

export const curriculumV3AuditEntries: CurriculumV3AuditEntry[] = curriculumCatalog.map((module) => {
  const targetModuleIds = auditTargets[module.id]
  if (!targetModuleIds) throw new Error(`Missing Curriculum V3 audit target for ${module.id}`)
  const action = actionFor(module.id, targetModuleIds)
  const actionLabel: Record<Exclude<CurriculumV3MigrationAction, 'add'>, string> = {
    keep: '保留', rebuild: '重建', merge: '合并', split: '拆分',
    'demote-to-depth': '下沉为深度主题', 'retire-with-redirect': '重定向后退役',
  }
  return {
    currentModuleId: module.id,
    action,
    targetModuleIds,
    strengths: [
      `The current ${module.title.en} module already provides ${module.lessons.length} bilingual lesson${module.lessons.length === 1 ? '' : 's'} on a stable route.`,
    ],
    contractGaps: [
      `It does not yet require the V3 formula-to-code, controlled-experiment, failure-case, and checkpoint evidence contract for ${targetModuleIds.join(', ')}.`,
    ],
    rationale: {
      'zh-CN': `${actionLabel[action]}现有“${module.title['zh-CN']}”内容，使其对齐 ${targetModuleIds.join('、')} 的证据闭环。`,
      en: `${action} the current ${module.title.en} material into the evidence loop defined by ${targetModuleIds.join(', ')}.`,
    },
  }
})

export const curriculumV3AuditByCurrentModuleId = new Map(
  curriculumV3AuditEntries.map((entry) => [entry.currentModuleId, entry]),
)
