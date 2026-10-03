import { teachingUnits } from './reading.ts'
import { curriculumMetadataById } from './catalogMetadata.ts'
import type { CurriculumSpineStage } from './types.ts'


export const curriculumSpineStages: CurriculumSpineStage[] = teachingUnits.map(unit => ({
  id: unit.id, title: unit.title, learnerQuestion: unit.question, bridge: unit.instructions,
  requiredModuleIds: unit.readings.map(step => step.moduleId), supportModuleIds: unit.optional?.map(step => step.moduleId) ?? [],
  projectModuleIds: unit.readings.filter(step => step.moduleId.endsWith('-project')).map(step => step.moduleId), outcomes: [unit.explanation],
  ...(unit.optional ? { supportNote: unit.explanation } : {}),
}))

export function curriculumSpineRequiredModuleIds() {
  return [...new Set(curriculumSpineStages.flatMap((stage) => stage.requiredModuleIds))]
}

export function curriculumSpineValidationIssues() {
  const issues: string[] = []

  for (const stage of curriculumSpineStages) {
    const referencedModuleIds = [
      ...stage.requiredModuleIds,
      ...stage.supportModuleIds,
      ...(stage.projectModuleIds ?? []),
    ]

    for (const moduleId of referencedModuleIds) {
      if (!curriculumMetadataById.has(moduleId)) {
        issues.push(`${stage.id} references unknown module ${moduleId}`)
      }
    }

  }

  return issues
}
