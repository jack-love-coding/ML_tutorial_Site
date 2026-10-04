import type { ModuleSlug } from '../types/ml'

export type AlgorithmRenderer = 'blocks' | 'gradient' | 'optimizer' | 'housing' | 'linear' | 'logistic' | 'neural' | 'workflow' | 'loss' | 'classification' | 'notebook'
export interface AlgorithmTeachingDefinition {
  mode: 'paged' | 'scrolling' | 'guided' | 'notebook'
  renderer: AlgorithmRenderer
  experimentPager?: boolean
  labId?: string
  explorationRoute?: string
}

// Teaching mode is independent of course identity and正文. Keep all rendering choices here.
export const algorithmTeachingRegistry = {
  'ai-overview': { mode: 'scrolling', renderer: 'blocks', labId: 'ai-overview-task-lab' },
  'python-notebook': { mode: 'notebook', renderer: 'notebook' },
  'loss-functions': { mode: 'scrolling', renderer: 'loss' },
  'gradient-descent': { mode: 'paged', renderer: 'gradient', labId: 'gradient-chapter-lab' },
  'linear-regression': { mode: 'paged', renderer: 'linear', experimentPager: true },
  'logistic-regression': { mode: 'paged', renderer: 'logistic', experimentPager: true },
  classification: { mode: 'scrolling', renderer: 'classification' },
  'housing-price-project': { mode: 'paged', renderer: 'housing' },
  'classification-project': { mode: 'scrolling', renderer: 'workflow' },
  'model-selection': { mode: 'scrolling', renderer: 'workflow' },
  'tree-forest': { mode: 'scrolling', renderer: 'workflow' },
  mlp: { mode: 'guided', renderer: 'neural', labId: 'mlp-guided-lab', explorationRoute: '/learn/mlp/explore' },
  'optimizer-comparison': { mode: 'paged', renderer: 'optimizer' },
  'cnn-visualization': { mode: 'guided', renderer: 'neural', explorationRoute: '/learn/cnn-visualization/explore' },
  'sequence-embedding-bridge': { mode: 'scrolling', renderer: 'workflow' },
  'attention-transformer': { mode: 'scrolling', renderer: 'workflow' },
  'llm-rag': { mode: 'scrolling', renderer: 'workflow' },
} as const satisfies Record<ModuleSlug, AlgorithmTeachingDefinition>

export function algorithmTeaching(slug: ModuleSlug): AlgorithmTeachingDefinition {
  return algorithmTeachingRegistry[slug]
}
