import type { ModuleSlug } from '../types/ml.ts'
import type { CurriculumDomain, CurriculumLevel } from './types.ts'

export interface AlgorithmCurriculumMetadata {
  domain: CurriculumDomain
  level: CurriculumLevel
  prerequisites?: string[]
  related?: string[]
}

// Only curriculum-specific facts belong here; chapters and routes come from the course.
export const algorithmCurriculumMetadata: Record<ModuleSlug, AlgorithmCurriculumMetadata> = {
  'ai-overview': {
    domain: 'foundation',
    level: 'beginner',
    related: ['beginner-linear-algebra', 'numerical-data'],
  },
  'python-notebook': {
    domain: 'foundation',
    level: 'beginner',
  },
  'housing-price-project': {
    domain: 'project',
    level: 'beginner',
    prerequisites: ['linear-regression'],
  },
  'classification-project': {
    domain: 'project',
    level: 'intermediate',
  },
  'model-selection': {
    domain: 'model',
    level: 'intermediate',
  },
  'tree-forest': {
    domain: 'model',
    level: 'intermediate',
  },
  'cnn-visualization': {
    domain: 'deep-learning',
    level: 'intermediate',
  },
  'sequence-embedding-bridge': {
    domain: 'deep-learning',
    level: 'intermediate',
    related: ['tensor-shapes-vectorization', 'attention-transformer'],
  },
  'attention-transformer': {
    domain: 'deep-learning',
    level: 'advanced',
    related: ['sequence-embedding-bridge', 'llm-rag'],
  },
  'optimizer-comparison': {
    domain: 'model',
    level: 'intermediate',
  },
  'llm-rag': {
    domain: 'deep-learning',
    level: 'advanced',
    prerequisites: ['attention-transformer'],
    related: ['attention-transformer', 'linear-algebra-distance-similarity'],
  },
  'loss-functions': {
    domain: 'model',
    level: 'beginner',
  },
  'gradient-descent': {
    domain: 'model',
    level: 'beginner',
    prerequisites: ['loss-functions'],
  },
  'linear-regression': {
    domain: 'model',
    level: 'beginner',
    prerequisites: ['loss-functions'],
  },
  'logistic-regression': {
    domain: 'model',
    level: 'beginner',
    prerequisites: ['loss-functions', 'linear-regression', 'housing-price-project'],
  },
  'classification': {
    domain: 'model',
    level: 'intermediate',
    prerequisites: ['logistic-regression'],
  },
  'mlp': {
    domain: 'deep-learning',
    level: 'intermediate',
    prerequisites: ['classification'],
  },
}
