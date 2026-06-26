import { curriculumRouteManifestById } from './routeManifest.ts'

export function resolveCanonicalLearnRoute(moduleId: string, lessonId?: string) {
  const moduleDefinition = curriculumRouteManifestById.get(moduleId)
  if (!moduleDefinition) return undefined

  if (moduleDefinition.source === 'algorithm') {
    return lessonId ? `/learn/${moduleId}/${lessonId}` : `/learn/${moduleId}`
  }

  return moduleDefinition.route
}

export function resolveCanonicalLearnRedirect(moduleId: string, lessonId?: string) {
  const moduleDefinition = curriculumRouteManifestById.get(moduleId)
  if (!moduleDefinition) return '/'

  if (moduleDefinition.source === 'algorithm') return undefined

  return resolveCanonicalLearnRoute(moduleId, lessonId)
}
