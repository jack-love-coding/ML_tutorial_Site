import { aiFoundationCourse } from './data/aiFoundation.ts'
import type { CourseDefinition, CourseStage, CourseUnit } from './types.ts'

export const courseCatalog: readonly CourseDefinition[] = [aiFoundationCourse]

export const courseById = new Map<string, CourseDefinition>(
  courseCatalog.map((course) => [course.id, course]),
)

export function courseStageById(course: CourseDefinition, stageId: string): CourseStage | undefined {
  return course.stages.find((stage) => stage.id === stageId)
}

export function courseUnitById(course: CourseDefinition, unitId: string): CourseUnit | undefined {
  return course.units.find((unit) => unit.id === unitId)
}

export function publishedCourseUnits(course: CourseDefinition): CourseUnit[] {
  return course.units
    .filter((unit) => unit.publicationStatus === 'published')
    .sort((left, right) => left.order - right.order)
}

export function courseUnitsForStage(course: CourseDefinition, stageId: string): CourseUnit[] {
  const stage = courseStageById(course, stageId)
  if (!stage) return []
  const ids = new Set(stage.unitIds)
  return course.units
    .filter((unit) => ids.has(unit.id))
    .sort((left, right) => left.order - right.order)
}
