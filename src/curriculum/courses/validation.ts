import { curriculumModuleById } from '../catalog.ts'
import type { CourseDefinition, CourseResourceRef } from './types.ts'

export interface CourseValidationIssue {
  code: string
  message: string
  unitId?: string
}

function localizedComplete(value: { 'zh-CN': string; en: string } | undefined) {
  return Boolean(value?.['zh-CN']?.trim() && value.en?.trim())
}

function validatePublishedResource(resource: CourseResourceRef, unitId: string) {
  const issues: CourseValidationIssue[] = []
  if (resource.kind !== 'curriculum') return issues

  const moduleDefinition = curriculumModuleById.get(resource.moduleId)
  if (!moduleDefinition) {
    issues.push({ code: 'missing-resource-module', unitId, message: `Missing curriculum module ${resource.moduleId}` })
    return issues
  }

  if (resource.lessonId && !moduleDefinition.lessons.some((lesson) => lesson.id === resource.lessonId)) {
    issues.push({ code: 'missing-resource-lesson', unitId, message: `Missing lesson ${resource.lessonId} in ${resource.moduleId}` })
  }
  return issues
}

export function validateCourseDefinition(course: CourseDefinition): CourseValidationIssue[] {
  const issues: CourseValidationIssue[] = []
  const unitIds = new Set<string>()
  const orders = new Set<number>()
  const unitsById = new Map(course.units.map((unit) => [unit.id, unit]))

  if (!localizedComplete(course.title) || !localizedComplete(course.description)) {
    issues.push({ code: 'course-localization', message: 'Course title and description require zh-CN and en.' })
  }
  if (course.stages.length !== course.stageIds.length || new Set(course.stageIds).size !== course.stageIds.length) {
    issues.push({ code: 'stage-index', message: 'stageIds must uniquely cover every stage.' })
  }
  if (course.units.length !== course.totalUnits) {
    issues.push({ code: 'unit-count', message: `Expected ${course.totalUnits} units, found ${course.units.length}.` })
  }
  const hours = course.units.reduce((total, unit) => total + unit.estimatedHours, 0)
  if (hours !== course.totalHours) {
    issues.push({ code: 'hour-total', message: `Expected ${course.totalHours} hours, found ${hours}.` })
  }

  for (const stage of course.stages) {
    if (!course.stageIds.includes(stage.id)) {
      issues.push({ code: 'unindexed-stage', message: `Stage ${stage.id} is absent from stageIds.` })
    }
    if (!localizedComplete(stage.title) || !localizedComplete(stage.description) || !stage.outcomes.every(localizedComplete)) {
      issues.push({ code: 'stage-localization', message: `Stage ${stage.id} has incomplete localized copy.` })
    }
    for (const unitId of stage.unitIds) {
      if (unitsById.get(unitId)?.stageId !== stage.id) {
        issues.push({ code: 'stage-unit-index', unitId, message: `Stage ${stage.id} does not match unit metadata.` })
      }
    }
  }

  for (const unit of course.units) {
    if (unitIds.has(unit.id)) issues.push({ code: 'duplicate-unit-id', unitId: unit.id, message: `Duplicate unit ID ${unit.id}.` })
    if (orders.has(unit.order)) issues.push({ code: 'duplicate-unit-order', unitId: unit.id, message: `Duplicate unit order ${unit.order}.` })
    unitIds.add(unit.id)
    orders.add(unit.order)

    const localizedFields = [
      unit.title,
      unit.coreQuestion,
      unit.summary,
      unit.knowledgeAndMethods,
      unit.teachingFocus,
      unit.practice,
      unit.datasets,
      unit.tools,
      unit.deliverables,
      ...unit.outcomes,
      ...unit.acceptanceCriteria.map((criterion) => criterion.label),
      ...unit.steps.flatMap((step) => [step.title, step.description, ...(step.content ? [step.content] : [])]),
    ]
    if (!localizedFields.every(localizedComplete)) {
      issues.push({ code: 'unit-localization', unitId: unit.id, message: 'Unit has incomplete zh-CN or en copy.' })
    }

    const stepKinds = new Set(unit.steps.map((step) => step.kind))
    for (const requiredKind of ['explanation', 'code', 'lab', 'misconception', 'checkpoint', 'deliverable']) {
      if (requiredKind === 'lab' && (stepKinds.has('lab') || stepKinds.has('notebook'))) continue
      if (!stepKinds.has(requiredKind as never)) {
        issues.push({ code: 'missing-study-step', unitId: unit.id, message: `Unit lacks ${requiredKind} evidence.` })
      }
    }
    if (!unit.acceptanceCriteria.length) {
      issues.push({ code: 'missing-acceptance', unitId: unit.id, message: 'Unit requires acceptance criteria.' })
    }
    if (unit.publicationStatus === 'published') {
      for (const step of unit.steps) {
        for (const resource of step.resourceRefs ?? []) {
          issues.push(...validatePublishedResource(resource, unit.id))
        }
      }
    }
  }

  for (let order = 1; order <= course.totalUnits; order += 1) {
    if (!orders.has(order)) issues.push({ code: 'unit-order-gap', message: `Missing unit order ${order}.` })
  }

  const visiting = new Set<string>()
  const visited = new Set<string>()
  const visit = (unitId: string) => {
    if (visiting.has(unitId)) {
      issues.push({ code: 'prerequisite-cycle', unitId, message: `Prerequisite cycle reaches ${unitId}.` })
      return
    }
    if (visited.has(unitId)) return
    const unit = unitsById.get(unitId)
    if (!unit) return
    visiting.add(unitId)
    for (const prerequisiteId of unit.prerequisiteUnitIds) {
      if (!unitsById.has(prerequisiteId)) {
        issues.push({ code: 'missing-prerequisite', unitId, message: `Missing prerequisite ${prerequisiteId}.` })
      } else {
        visit(prerequisiteId)
      }
    }
    visiting.delete(unitId)
    visited.add(unitId)
  }
  course.units.forEach((unit) => visit(unit.id))

  return issues
}
