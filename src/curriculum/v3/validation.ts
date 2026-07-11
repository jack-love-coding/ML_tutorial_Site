import { curriculumCatalog } from '../catalog.ts'
import { curriculumV3AuditEntries } from './audit.ts'
import {
  curriculumV3CapabilityEndpoints,
  curriculumV3EntryConcepts,
  curriculumV3EntryAssumptions,
  curriculumV3ExitCapabilities,
} from './coverage.ts'
import {
  curriculumV3ModuleById,
  curriculumV3Modules,
} from './inventory.ts'
import {
  curriculumV3ProjectPrerequisites,
  curriculumV3Projects,
} from './projects.ts'
import { curriculumV3Waves } from './waves.ts'
import type { CurriculumV3ModuleBlueprint, CurriculumV3ProjectBlueprint, CurriculumV3Wave } from './types.ts'

export type V3ValidationPrefix =
  | 'duplicate-module'
  | 'unknown-prerequisite'
  | 'prerequisite-after-consumer'
  | 'dependency-cycle'
  | 'required-depends-on-depth'
  | 'unknown-project-reference'
  | 'concept-revisit-before-introduction'
  | 'project-revisit-module-id'
  | 'missing-bilingual-metadata'
  | 'missing-content-evidence'
  | 'audit-current-coverage'
  | 'unknown-audit-target'
  | 'project-count'
  | 'project-prerequisite'
  | 'exit-capability-coverage'
  | 'wave-size'
  | 'wave-required-coverage'
  | 'wave-stage-responsibility'

const issue = (prefix: V3ValidationPrefix, detail: string) => `${prefix}:${detail}`

const hasBilingualCopy = (value: { 'zh-CN': string; en: string } | undefined) =>
  Boolean(value?.['zh-CN'].trim() && value.en.trim())

export function curriculumV3DependencyIssues(
  modules: readonly (CurriculumV3ModuleBlueprint | CurriculumV3ProjectBlueprint)[] = curriculumV3Modules,
  entryConcepts: readonly string[] = curriculumV3EntryConcepts,
): string[] {
  const issues: string[] = []
  const counts = new Map<string, number>()
  const indexById = new Map<string, number>()
  const moduleById = new Map(modules.map((module) => [module.id, module]))
  modules.forEach((module, index) => {
    counts.set(module.id, (counts.get(module.id) ?? 0) + 1)
    if (!indexById.has(module.id)) indexById.set(module.id, index)
  })

  for (const [id, count] of counts) {
    if (count > 1) issues.push(issue('duplicate-module', id))
  }

  const depthIds = new Set(modules.filter((module) => module.role === 'depth-topic').map((module) => module.id))
  const projectIds = new Set(modules.filter((module) => module.role === 'project').map((module) => module.id))
  const introducedConcepts = new Set(entryConcepts)
  for (const [consumerIndex, module] of modules.entries()) {
    for (const prerequisiteId of module.prerequisiteIds) {
      const prerequisiteIndex = indexById.get(prerequisiteId)
      if (prerequisiteIndex === undefined) {
        issues.push(issue('unknown-prerequisite', `${module.id}:${prerequisiteId}`))
      } else if (prerequisiteIndex >= consumerIndex) {
        issues.push(issue('prerequisite-after-consumer', `${module.id}:${prerequisiteId}`))
      }
      if (module.role === 'required-core' && depthIds.has(prerequisiteId)) {
        issues.push(issue('required-depends-on-depth', `${module.id}:${prerequisiteId}`))
      }
    }

    for (const projectId of module.projectIds) {
      if (!projectIds.has(projectId)) {
        issues.push(issue('unknown-project-reference', `${module.id}:${projectId}`))
      }
    }

    for (const conceptId of module.revisits) {
      if (module.role === 'project' && indexById.has(conceptId)) {
        issues.push(issue('project-revisit-module-id', `${module.id}:${conceptId}`))
      }
      if (!introducedConcepts.has(conceptId)) {
        issues.push(issue('concept-revisit-before-introduction', `${module.id}:${conceptId}`))
      }
    }
    for (const conceptId of module.introduces) introducedConcepts.add(conceptId)

    if (!hasBilingualCopy(module.title) || !hasBilingualCopy(module.learnerQuestion) ||
      module.outcomes.length === 0 || module.outcomes.some((outcome) => !hasBilingualCopy(outcome))) {
      issues.push(issue('missing-bilingual-metadata', module.id))
    }

    if (module.role === 'project') {
      if (module.deliverables.length === 0 || module.evidenceRequirements.length === 0) {
        issues.push(issue('missing-content-evidence', module.id))
      }
    } else {
      const evidence = module.contentEvidence
      if (!evidence.intuitionId || evidence.formulaVocabulary.length === 0 ||
        !evidence.workedExampleId || !evidence.experimentId || !evidence.failureCaseId ||
        evidence.exerciseKinds.length === 0) {
        issues.push(issue('missing-content-evidence', module.id))
      }
    }
  }

  const visited = new Set<string>()
  const visiting = new Set<string>()
  const cyclic = new Set<string>()
  const visit = (id: string) => {
    if (visited.has(id)) return
    if (visiting.has(id)) {
      cyclic.add(id)
      return
    }
    visiting.add(id)
    const module = moduleById.get(id)
    for (const prerequisiteId of module?.prerequisiteIds ?? []) visit(prerequisiteId)
    visiting.delete(id)
    visited.add(id)
  }
  for (const module of modules) visit(module.id)
  for (const id of [...cyclic].sort()) issues.push(issue('dependency-cycle', id))

  return issues
}

const stageForWave = (wave: CurriculumV3Wave) => Number(wave.id.slice(3, 4))

const stageAllowsModule = (
  stage: number,
  module: CurriculumV3ModuleBlueprint | CurriculumV3ProjectBlueprint,
) => {
  if (stage === 1) return module.arcId === 'math-language'
  if (stage === 2) {
    return ['linear-algebra', 'calculus-probability-optimization', 'data-to-features'].includes(module.arcId) ||
      module.id === 'splits-generalization' || module.id === 'project-math-to-code'
  }
  if (stage === 3) {
    return (['classical-supervised-learning', 'generalization-evaluation'].includes(module.arcId) &&
      module.id !== 'splits-generalization') ||
      ['project-tabular-regression', 'project-classification-evaluation'].includes(module.id)
  }
  if (stage === 4) return module.arcId === 'neural-network-foundations'
  if (stage === 5) return module.arcId === 'deep-learning-structures'
  if (stage === 6) return module.arcId === 'transformers-language-models'
  if (stage === 7) return module.arcId === 'llm-adaptation-retrieval'
  return false
}

export function curriculumV3AuditIssues(): string[] {
  const issues: string[] = []
  const currentIds = new Set(curriculumCatalog.map((module) => module.id))
  const counts = new Map<string, number>()
  for (const entry of curriculumV3AuditEntries) {
    counts.set(entry.currentModuleId, (counts.get(entry.currentModuleId) ?? 0) + 1)
    for (const targetId of entry.targetModuleIds) {
      if (!curriculumV3ModuleById.has(targetId)) {
        issues.push(issue('unknown-audit-target', `${entry.currentModuleId}:${targetId}`))
      }
    }
  }
  for (const id of [...currentIds].sort()) {
    if (counts.get(id) !== 1) issues.push(issue('audit-current-coverage', id))
  }
  for (const id of [...counts.keys()].sort()) {
    if (!currentIds.has(id)) issues.push(issue('audit-current-coverage', id))
  }
  return issues
}

export function curriculumV3CoverageIssues(): string[] {
  const issues: string[] = []
  if (curriculumV3Projects.length !== 6) {
    issues.push(issue('project-count', String(curriculumV3Projects.length)))
  }
  for (const project of curriculumV3Projects) {
    const projectId = project.id as keyof typeof curriculumV3ProjectPrerequisites
    const expected = curriculumV3ProjectPrerequisites[projectId]
    if (!expected || JSON.stringify(project.prerequisiteIds) !== JSON.stringify(expected)) {
      issues.push(issue('project-prerequisite', project.id))
    }
  }

  const expectedAssumptions = ['high-school-algebra-functions', 'basic-python-reading-editing']
  if (JSON.stringify(curriculumV3EntryAssumptions) !== JSON.stringify(expectedAssumptions)) {
    issues.push(issue('exit-capability-coverage', 'entry-assumptions'))
  }
  const capabilitiesById = new Map(curriculumV3ExitCapabilities.map((capability) => [capability.id, capability]))
  for (const [id, endpoints] of Object.entries(curriculumV3CapabilityEndpoints)) {
    const capability = capabilitiesById.get(id)
    const actual = capability ? [...capability.moduleIds, ...capability.projectIds] : []
    if (!capability || !hasBilingualCopy(capability.description) ||
      JSON.stringify(actual) !== JSON.stringify(endpoints) ||
      endpoints.some((endpointId) => !curriculumV3ModuleById.has(endpointId))) {
      issues.push(issue('exit-capability-coverage', id))
    }
  }
  if (curriculumV3ExitCapabilities.length !== Object.keys(curriculumV3CapabilityEndpoints).length) {
    issues.push(issue('exit-capability-coverage', 'capability-count'))
  }
  return issues
}

export function curriculumV3WaveIssues(
  waves: readonly CurriculumV3Wave[] = curriculumV3Waves,
  modules: readonly (CurriculumV3ModuleBlueprint | CurriculumV3ProjectBlueprint)[] = curriculumV3Modules,
): string[] {
  const issues: string[] = []
  const moduleById = new Map(modules.map((module) => [module.id, module]))
  const requiredIds = new Set(modules.filter((module) => module.role === 'required-core').map((module) => module.id))
  const projectIds = new Set(modules.filter((module) => module.role === 'project').map((module) => module.id))
  const depthIds = new Set(modules.filter((module) => module.role === 'depth-topic').map((module) => module.id))
  const counts = new Map<string, number>()
  const firstWaveIndexByModuleId = new Map<string, number>()

  if (waves.length < 12) issues.push(issue('wave-size', `wave-count:${waves.length}`))
  for (let stage = 1; stage <= 7; stage += 1) {
    if (!waves.some((wave) => wave.id.startsWith(`v3.${stage}-`))) {
      issues.push(issue('wave-required-coverage', `missing-stage:v3.${stage}`))
    }
  }

  for (const [waveIndex, wave] of waves.entries()) {
    if (wave.moduleIds.length < 4 || wave.moduleIds.length > 6) {
      issues.push(issue('wave-size', wave.id))
    }
    if (!hasBilingualCopy(wave.title) || wave.exitCriteria.length === 0 ||
      wave.exitCriteria.some((criterion) => !hasBilingualCopy(criterion))) {
      issues.push(issue('missing-bilingual-metadata', wave.id))
    }
    for (const moduleId of wave.moduleIds) {
      const module = moduleById.get(moduleId)
      if (!module) {
        issues.push(issue('wave-required-coverage', `unknown-module:${moduleId}`))
      } else if (!stageAllowsModule(stageForWave(wave), module)) {
        issues.push(issue('wave-stage-responsibility', `${wave.id}:${moduleId}`))
      }
      counts.set(moduleId, (counts.get(moduleId) ?? 0) + 1)
      if (!firstWaveIndexByModuleId.has(moduleId)) {
        firstWaveIndexByModuleId.set(moduleId, waveIndex)
      }
    }
  }
  for (const id of [...requiredIds, ...projectIds].sort()) {
    if (counts.get(id) !== 1) issues.push(issue('wave-required-coverage', id))
  }
  for (const id of [...depthIds].sort()) {
    if ((counts.get(id) ?? 0) > 1) issues.push(issue('wave-required-coverage', `duplicate:${id}`))
  }

  for (const module of modules) {
    const consumerWaveIndex = firstWaveIndexByModuleId.get(module.id)
    if (consumerWaveIndex === undefined) continue
    for (const prerequisiteId of module.prerequisiteIds) {
      const prerequisiteWaveIndex = firstWaveIndexByModuleId.get(prerequisiteId)
      if (prerequisiteWaveIndex !== undefined && prerequisiteWaveIndex > consumerWaveIndex) {
        issues.push(issue('prerequisite-after-consumer', `wave:${module.id}:${prerequisiteId}`))
      }
    }
  }
  return issues
}

export function validateCurriculumV3Blueprint(): string[] {
  return [
    ...curriculumV3DependencyIssues(),
    ...curriculumV3AuditIssues(),
    ...curriculumV3CoverageIssues(),
    ...curriculumV3WaveIssues(),
  ]
}
