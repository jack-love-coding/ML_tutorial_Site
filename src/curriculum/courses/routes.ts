import { courseById, courseStageById, courseUnitById } from './catalog.ts'
import type { CourseDefinition, CourseResourceRef, CourseUnit } from './types.ts'
import { resolveCanonicalLearnRoute } from '../routes.ts'

export const defaultCourseId = 'ai-foundation'

export interface CourseRouteResolution {
  kind: 'current' | 'redirect'
  path?: string
  hash?: string
  query?: Record<string, string>
  course: CourseDefinition
  unit?: CourseUnit
}

export function courseOverviewRoute(courseId: string) {
  return `/courses/${courseId}`
}

export function courseUnitRoute(courseId: string, unitId: string) {
  return `${courseOverviewRoute(courseId)}/units/${unitId}`
}

export function resolveCourseOverview(courseId: string): CourseRouteResolution {
  const course = courseById.get(courseId)
  if (course) return { kind: 'current', course }

  const fallback = courseById.get(defaultCourseId)
  if (!fallback) throw new Error(`Missing default course: ${defaultCourseId}`)
  return {
    kind: 'redirect',
    course: fallback,
    path: courseOverviewRoute(fallback.id),
    query: { notice: 'unknown-course' },
  }
}

export function resolveCourseUnit(courseId: string, unitId: string): CourseRouteResolution {
  const overview = resolveCourseOverview(courseId)
  if (overview.kind === 'redirect') return overview

  const unit = courseUnitById(overview.course, unitId)
  if (unit?.publicationStatus === 'published') {
    return { kind: 'current', course: overview.course, unit }
  }

  const stage = unit ? courseStageById(overview.course, unit.stageId) : undefined
  return {
    kind: 'redirect',
    course: overview.course,
    unit,
    path: courseOverviewRoute(overview.course.id),
    ...(stage ? { hash: `#stage-${stage.id}` } : {}),
    query: { notice: unit ? 'planned-unit' : 'unknown-unit' },
  }
}

export function resolveCourseResourceRoute(resource: CourseResourceRef): string | undefined {
  if (resource.kind === 'curriculum') {
    return resolveCanonicalLearnRoute(resource.moduleId, resource.lessonId)
  }
  if (resource.kind === 'route') return resource.route
  return undefined
}
