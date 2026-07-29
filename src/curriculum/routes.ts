import { curriculumRouteManifestById } from './routeManifest.ts'

export interface CanonicalLearnRedirect {
  path: string
  hash?: string
}

const canonicalLessonIdPattern = /^[A-Za-z][A-Za-z0-9_-]*$/

function canonicalLessonHash(lessonId?: string) {
  return lessonId && canonicalLessonIdPattern.test(lessonId)
    ? `#${lessonId}`
    : undefined
}

export function resolveCanonicalLearnRoute(moduleId: string, lessonId?: string) {
  const moduleDefinition = curriculumRouteManifestById.get(moduleId)
  if (!moduleDefinition) return undefined

  const lessonHash = canonicalLessonHash(lessonId)

  if (moduleDefinition.source === 'algorithm') {
    return lessonHash ? `/learn/${moduleId}/${lessonId}` : `/learn/${moduleId}`
  }

  return `${moduleDefinition.route}${lessonHash ?? ''}`
}

export function resolveCanonicalLearnRedirect(
  moduleId: string,
  lessonId?: string,
): CanonicalLearnRedirect | undefined {
  const moduleDefinition = curriculumRouteManifestById.get(moduleId)
  if (!moduleDefinition) return { path: '/' }

  if (moduleDefinition.source === 'algorithm') return undefined

  const hash = canonicalLessonHash(lessonId)
  return {
    path: moduleDefinition.route,
    ...(hash ? { hash } : {}),
  }
}
