import { teachingUnits } from './reading.ts'
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

export const coreLearningPathModuleIds = [...new Set(teachingUnits.flatMap(unit => unit.readings.map(step => step.moduleId)))]

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
