import type { AlgorithmCheckpointItem, ModuleSlug } from '../types/ml'

/** Route-only checkpoint resolver, kept pure so feedback links are behavior-tested without a DOM. */
export function resolveCheckpointRevisitRoute(
  moduleSlug: ModuleSlug,
  moduleRoute: string,
  checkpoint: AlgorithmCheckpointItem,
  chapterRouteBase?: string,
) {
  if (['linear-regression', 'logistic-regression', 'python-notebook', 'optimizer-comparison'].includes(moduleSlug)) {
    return `${chapterRouteBase ?? `/learn/${moduleSlug}`}/${checkpoint.revisitChapterId}`
  }
  return { path: moduleRoute, hash: `#${checkpoint.revisitChapterId}` }
}
