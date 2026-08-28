import type { LearningProgressV2 } from '../progress.ts'
import type { StorageLike } from '../../utils/progressStorage.ts'
import { courseById, publishedCourseUnits } from './catalog.ts'
import { courseUnitRoute } from './routes.ts'
import type {
  CourseContinueTarget,
  CourseDefinition,
  CourseProgressCourseState,
  CourseProgressV1,
  CourseStudyStep,
  CourseUnit,
  CourseUnitProgressState,
  CourseUnitProgressStatus,
} from './types.ts'

export const courseProgressV1StorageKey = 'ml-atlas:course-progress:v1'

function storageFor(storage?: StorageLike) {
  if (storage) return storage
  if (typeof window === 'undefined') return undefined
  return window.localStorage
}

function stringArray(value: unknown) {
  return Array.isArray(value) ? [...new Set(value.filter((item): item is string => typeof item === 'string'))] : []
}

function objectRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined
}

export function createDefaultCourseProgress(now = new Date().toISOString()): CourseProgressV1 {
  return { schemaVersion: 1, courses: {}, updatedAt: now }
}

function normalizeUnitState(unitId: string, value: unknown): CourseUnitProgressState {
  const record = objectRecord(value)
  return {
    unitId,
    completedStepIds: stringArray(record?.completedStepIds),
    confirmedCriterionIds: stringArray(record?.confirmedCriterionIds),
    ...(typeof record?.firstOpenedAt === 'string' ? { firstOpenedAt: record.firstOpenedAt } : {}),
    ...(typeof record?.lastVisitedAt === 'string' ? { lastVisitedAt: record.lastVisitedAt } : {}),
  }
}

function normalizeCourseState(courseId: string, value: unknown): CourseProgressCourseState {
  const record = objectRecord(value)
  const units = objectRecord(record?.units) ?? {}
  return {
    courseId,
    ...(typeof record?.lastVisitedUnitId === 'string' ? { lastVisitedUnitId: record.lastVisitedUnitId } : {}),
    units: Object.fromEntries(
      Object.entries(units).map(([unitId, unitState]) => [unitId, normalizeUnitState(unitId, unitState)]),
    ),
  }
}

export function loadCourseProgress(
  storage?: StorageLike,
  now = new Date().toISOString(),
): CourseProgressV1 {
  const resolved = storageFor(storage)
  if (!resolved) return createDefaultCourseProgress(now)

  try {
    const parsed = objectRecord(JSON.parse(resolved.getItem(courseProgressV1StorageKey) ?? 'null'))
    if (!parsed) return createDefaultCourseProgress(now)
    const courses = objectRecord(parsed.courses) ?? {}
    return {
      schemaVersion: 1,
      ...(typeof parsed.activeCourseId === 'string' ? { activeCourseId: parsed.activeCourseId } : {}),
      courses: Object.fromEntries(
        Object.entries(courses).map(([courseId, state]) => [courseId, normalizeCourseState(courseId, state)]),
      ),
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : now,
    }
  } catch {
    return createDefaultCourseProgress(now)
  }
}

export function saveCourseProgress(
  progress: CourseProgressV1,
  storage?: StorageLike,
  now = new Date().toISOString(),
): CourseProgressV1 {
  const next = { ...progress, updatedAt: now }
  try {
    storageFor(storage)?.setItem(courseProgressV1StorageKey, JSON.stringify(next))
  } catch {
    // Browsers may deny localStorage in private or embedded contexts. Learning remains available.
  }
  return next
}

function cloneProgress(progress: CourseProgressV1): CourseProgressV1 {
  return {
    ...progress,
    courses: Object.fromEntries(
      Object.entries(progress.courses).map(([courseId, state]) => [courseId, {
        ...state,
        units: Object.fromEntries(
          Object.entries(state.units).map(([unitId, unit]) => [unitId, {
            ...unit,
            completedStepIds: [...unit.completedStepIds],
            confirmedCriterionIds: [...unit.confirmedCriterionIds],
          }]),
        ),
      }]),
    ),
  }
}

function ensureUnitState(
  progress: CourseProgressV1,
  courseId: string,
  unitId: string,
  now: string,
) {
  const courseState = progress.courses[courseId] ?? { courseId, units: {} }
  progress.courses[courseId] = courseState
  const unitState = courseState.units[unitId] ?? {
    unitId,
    completedStepIds: [],
    confirmedCriterionIds: [],
    firstOpenedAt: now,
  }
  courseState.units[unitId] = unitState
  courseState.lastVisitedUnitId = unitId
  unitState.lastVisitedAt = now
  progress.activeCourseId = courseId
  return unitState
}

export function visitCourseUnit(
  progress: CourseProgressV1,
  courseId: string,
  unitId: string,
  storage?: StorageLike,
  now = new Date().toISOString(),
) {
  const next = cloneProgress(progress)
  ensureUnitState(next, courseId, unitId, now)
  return saveCourseProgress(next, storage, now)
}

function toggleId(values: string[], id: string, checked: boolean) {
  const next = new Set(values)
  if (checked) next.add(id)
  else next.delete(id)
  return [...next]
}

export function setCourseStepComplete(
  progress: CourseProgressV1,
  courseId: string,
  unitId: string,
  stepId: string,
  completed: boolean,
  storage?: StorageLike,
  now = new Date().toISOString(),
) {
  const next = cloneProgress(progress)
  const unit = ensureUnitState(next, courseId, unitId, now)
  unit.completedStepIds = toggleId(unit.completedStepIds, stepId, completed)
  return saveCourseProgress(next, storage, now)
}

export function setCourseCriterionConfirmed(
  progress: CourseProgressV1,
  courseId: string,
  unitId: string,
  criterionId: string,
  confirmed: boolean,
  storage?: StorageLike,
  now = new Date().toISOString(),
) {
  const next = cloneProgress(progress)
  const unit = ensureUnitState(next, courseId, unitId, now)
  unit.confirmedCriterionIds = toggleId(unit.confirmedCriterionIds, criterionId, confirmed)
  return saveCourseProgress(next, storage, now)
}

function resourceModuleIds(unit: CourseUnit) {
  return [...new Set(
    unit.steps.flatMap((step) => step.resourceRefs ?? [])
      .flatMap((resource) => resource.kind === 'curriculum' ? [resource.moduleId] : []),
  )]
}

function legacyEvidenceForStep(step: CourseStudyStep, unit: CourseUnit, legacy?: LearningProgressV2) {
  if (!legacy) return false
  const directModules = (step.resourceRefs ?? []).flatMap((resource) =>
    resource.kind === 'curriculum' ? [resource.moduleId] : [],
  )
  const unitModules = resourceModuleIds(unit)
  const relevantModules = directModules.length ? directModules : unitModules

  if (step.kind === 'resource') {
    return relevantModules.some((moduleId) => legacy.modules[moduleId]?.completed)
  }
  if (step.kind === 'lab' || step.kind === 'notebook') {
    return relevantModules.some((moduleId) => legacy.labEvidence.some((item) => item.moduleId === moduleId))
  }
  if (step.kind === 'checkpoint') {
    return relevantModules.some((moduleId) => legacy.modules[moduleId]?.attempts.some((attempt) => attempt.correct))
  }
  return false
}

export interface CourseUnitProgressSummary {
  status: CourseUnitProgressStatus
  completedStepIds: Set<string>
  completedStepCount: number
  requiredStepCount: number
  confirmedCriterionCount: number
  criterionCount: number
  legacyModuleCount: number
  correctCheckpointCount: number
  labEvidenceCount: number
}

export function summarizeCourseUnitProgress(
  unit: CourseUnit,
  courseProgress: CourseProgressV1,
  legacy?: LearningProgressV2,
  courseId?: string,
): CourseUnitProgressSummary {
  const ownerCourse = (courseId ? courseById.get(courseId) : undefined)
    ?? [...courseById.values()].find((course) => course.units.some((candidate) => candidate === unit))
  const state = ownerCourse ? courseProgress.courses[ownerCourse.id]?.units[unit.id] : undefined
  const completedStepIds = new Set(state?.completedStepIds ?? [])
  for (const step of unit.steps) {
    if (legacyEvidenceForStep(step, unit, legacy)) completedStepIds.add(step.id)
  }
  const requiredSteps = unit.steps.filter((step) => step.required)
  const completedStepCount = requiredSteps.filter((step) => completedStepIds.has(step.id)).length
  const confirmedCriterionCount = unit.acceptanceCriteria.filter((criterion) =>
    state?.confirmedCriterionIds.includes(criterion.id),
  ).length
  const moduleIds = resourceModuleIds(unit)
  const legacyModuleCount = moduleIds.filter((moduleId) => legacy?.modules[moduleId]?.completed).length
  const correctCheckpointCount = moduleIds.reduce(
    (total, moduleId) => total + (legacy?.modules[moduleId]?.attempts.filter((attempt) => attempt.correct).length ?? 0),
    0,
  )
  const labEvidenceCount = legacy?.labEvidence.filter((item) => moduleIds.includes(item.moduleId)).length ?? 0
  const hasActivity = Boolean(state?.firstOpenedAt || completedStepCount || confirmedCriterionCount || legacyModuleCount || correctCheckpointCount || labEvidenceCount)
  const allSteps = completedStepCount === requiredSteps.length
  const allCriteria = confirmedCriterionCount === unit.acceptanceCriteria.length
  const status: CourseUnitProgressStatus = allSteps && allCriteria
    ? 'completed'
    : allSteps
      ? 'ready-for-self-check'
      : hasActivity
        ? 'in-progress'
        : 'not-started'

  return {
    status,
    completedStepIds,
    completedStepCount,
    requiredStepCount: requiredSteps.length,
    confirmedCriterionCount,
    criterionCount: unit.acceptanceCriteria.length,
    legacyModuleCount,
    correctCheckpointCount,
    labEvidenceCount,
  }
}

export function selectCourseContinueTarget(
  courseProgress: CourseProgressV1,
  legacy?: LearningProgressV2,
  courseId = 'ai-foundation',
): CourseContinueTarget | undefined {
  const course = courseById.get(courseId)
  if (!course) return undefined
  const units = publishedCourseUnits(course)
  const courseState = courseProgress.courses[courseId]
  const lastUnit = units.find((unit) => unit.id === courseState?.lastVisitedUnitId)
  if (lastUnit && summarizeCourseUnitProgress(lastUnit, courseProgress, legacy, courseId).status !== 'completed') {
    return { courseId, unitId: lastUnit.id, route: courseUnitRoute(courseId, lastUnit.id), reason: 'last-visited' }
  }

  const relatedUnit = legacy?.lastVisited?.moduleId
    ? units.find((unit) => resourceModuleIds(unit).includes(legacy.lastVisited!.moduleId)
      && summarizeCourseUnitProgress(unit, courseProgress, legacy, courseId).status !== 'completed')
    : undefined
  if (relatedUnit) {
    return { courseId, unitId: relatedUnit.id, route: courseUnitRoute(courseId, relatedUnit.id), reason: 'related-module' }
  }

  const firstIncomplete = units.find((unit) => summarizeCourseUnitProgress(unit, courseProgress, legacy, courseId).status !== 'completed')
  return firstIncomplete
    ? { courseId, unitId: firstIncomplete.id, route: courseUnitRoute(courseId, firstIncomplete.id), reason: 'first-incomplete' }
    : undefined
}

export function summarizeCourseCompletion(
  course: CourseDefinition,
  courseProgress: CourseProgressV1,
  legacy?: LearningProgressV2,
) {
  const publishedUnits = publishedCourseUnits(course)
  const completedUnits = publishedUnits.filter(
    (unit) => summarizeCourseUnitProgress(unit, courseProgress, legacy, course.id).status === 'completed',
  )
  return { published: publishedUnits.length, completed: completedUnits.length }
}
