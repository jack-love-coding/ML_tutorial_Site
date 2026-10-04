import { curriculumCatalogMetadata } from './catalogMetadata.ts'
import { curriculumLessonDirectory } from './generated/lessonDirectory.ts'
import type { LocalizedCopy } from '../types/ml.ts'
import type { CurriculumDomain, CurriculumSourceNamespace } from './types.ts'

export interface CurriculumRouteManifestEntry {
  id: string
  source: CurriculumSourceNamespace
  domain: CurriculumDomain
  route: string
  title: LocalizedCopy
  firstLessonId?: string
}

export const coreLearningPathModuleIds = [
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
  'llm-rag',
]

export const projectPracticeModuleIds = ['housing-price-project', 'classification-project']

export const curriculumRouteManifest: CurriculumRouteManifestEntry[] = [
  ...curriculumCatalogMetadata.map((module) => ({
    id: module.id,
    source: module.source.namespace,
    domain: module.domain,
    route: module.route,
    title: module.title,
    ...(module.source.namespace === 'algorithm'
      ? { firstLessonId: curriculumLessonDirectory.find((entry) => entry.id === module.id)?.lessons[0]?.id }
      : {}),
  })),
]

export const curriculumRouteManifestById = new Map(
  curriculumRouteManifest.map((entry) => [entry.id, entry]),
)

export function curriculumRouteManifestByDomain(domain: CurriculumDomain) {
  return curriculumRouteManifest.filter((entry) => entry.domain === domain)
}
