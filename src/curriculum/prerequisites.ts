import type { CurriculumModule } from './types.ts'

export function findMissingPrerequisites(modules: CurriculumModule[]) {
  const ids = new Set(modules.map((moduleDefinition) => moduleDefinition.id))
  const missing: string[] = []

  for (const moduleDefinition of modules) {
    for (const prerequisiteId of moduleDefinition.prerequisiteIds) {
      if (!ids.has(prerequisiteId)) missing.push(`${moduleDefinition.id}->${prerequisiteId}`)
    }
  }

  return missing
}

export function findPrerequisiteCycles(modules: CurriculumModule[]) {
  const byId = new Map(modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  const visiting = new Set<string>()
  const visited = new Set<string>()
  const cycles: string[] = []

  function visit(id: string, trail: string[]) {
    if (visiting.has(id)) {
      cycles.push([...trail, id].join(' -> '))
      return
    }

    if (visited.has(id)) return

    const moduleDefinition = byId.get(id)
    if (!moduleDefinition) return

    visiting.add(id)
    for (const prerequisiteId of moduleDefinition.prerequisiteIds) {
      visit(prerequisiteId, [...trail, id])
    }
    visiting.delete(id)
    visited.add(id)
  }

  for (const moduleDefinition of modules) {
    visit(moduleDefinition.id, [])
  }

  return cycles
}

export function trackRespectsPrerequisites(modules: CurriculumModule[], moduleIds: string[]) {
  const position = new Map(moduleIds.map((id, index) => [id, index]))
  const byId = new Map(modules.map((moduleDefinition) => [moduleDefinition.id, moduleDefinition]))
  const violations: string[] = []

  for (const moduleId of moduleIds) {
    const moduleDefinition = byId.get(moduleId)
    if (!moduleDefinition) continue

    const modulePosition = position.get(moduleId) ?? -1

    for (const prerequisiteId of moduleDefinition.prerequisiteIds) {
      const prerequisitePosition = position.get(prerequisiteId)
      if (prerequisitePosition !== undefined && prerequisitePosition > modulePosition) {
        violations.push(`${moduleId} appears before ${prerequisiteId}`)
      }
    }
  }

  return violations
}
