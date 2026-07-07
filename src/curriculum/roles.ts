import { curriculumCatalog } from './catalog.ts'
import { curriculumSpineRequiredModuleIds, curriculumSpineStages } from './spine.ts'
import type { LocalizedCopy } from '../types/ml.ts'

export type CurriculumRole =
  | 'required-core'
  | 'just-in-time-support'
  | 'project-validation'
  | 'advanced-extension'
  | 'reference-library'
  | 'duplicate-or-overlap'

export interface CurriculumRoleEntry {
  moduleId: string
  role: CurriculumRole
  label: LocalizedCopy
  description: LocalizedCopy
  stageIds: string[]
}

const copy = (zhCN: string, en: string): LocalizedCopy => ({ 'zh-CN': zhCN, en })

const roleCopy: Record<CurriculumRole, { label: LocalizedCopy; description: LocalizedCopy }> = {
  'required-core': {
    label: copy('必修主线', 'Required core'),
    description: copy('默认学习主线中的必修模块。', 'Required in the default learning spine.'),
  },
  'just-in-time-support': {
    label: copy('即时支持', 'Just-in-time support'),
    description: copy(
      '用于补足某个主线阶段需要的数学、数据或模型直觉。',
      'Supports a specific spine stage with math, data, or model intuition.',
    ),
  },
  'project-validation': {
    label: copy('项目验证', 'Project validation'),
    description: copy(
      '阶段总结项目，用来验证已学能力，不是硬阻塞。',
      'A capstone project that validates learned skills without blocking the spine.',
    ),
  },
  'advanced-extension': {
    label: copy('进阶扩展', 'Advanced extension'),
    description: copy('主线完成后的进阶或专项内容。', 'Advanced or specialized material after the default spine.'),
  },
  'reference-library': {
    label: copy('参考专题', 'Reference topic'),
    description: copy(
      '可查阅的独立专题，当前不承担主线推进职责。',
      'Standalone reference material that does not currently drive the spine.',
    ),
  },
  'duplicate-or-overlap': {
    label: copy('重叠内容', 'Overlap'),
    description: copy(
      '与已有主线或支持模块有明显重叠，需要明确边界。',
      'Overlaps another core or support module and needs a clearer boundary.',
    ),
  },
}

const duplicateOrOverlapIds = new Set(['calculus-optimizer-comparison'])

const advancedExtensionIds = new Set([
  'llm-rag',
  'svd',
  'pca',
  'lu-decomposition',
  'sparse-matrices',
  'condition-numbers',
  'markov-chains',
  'finite-difference-methods',
  'nonlinear-equations',
  'optimization',
])

const requiredModuleIds = curriculumSpineRequiredModuleIds()
const requiredModuleIdSet = new Set(requiredModuleIds)

const supportStageIdsByModule = new Map<string, string[]>()
const projectStageIdsByModule = new Map<string, string[]>()

for (const stage of curriculumSpineStages) {
  for (const moduleId of stage.supportModuleIds) {
    supportStageIdsByModule.set(moduleId, [...(supportStageIdsByModule.get(moduleId) ?? []), stage.id])
  }
  for (const moduleId of stage.projectModuleIds ?? []) {
    projectStageIdsByModule.set(moduleId, [...(projectStageIdsByModule.get(moduleId) ?? []), stage.id])
  }
}

function primaryRoleForModule(moduleId: string): CurriculumRole {
  if (requiredModuleIdSet.has(moduleId)) return 'required-core'
  if (projectStageIdsByModule.has(moduleId)) return 'project-validation'
  if (supportStageIdsByModule.has(moduleId)) return 'just-in-time-support'
  if (duplicateOrOverlapIds.has(moduleId)) return 'duplicate-or-overlap'
  if (advancedExtensionIds.has(moduleId)) return 'advanced-extension'
  return 'reference-library'
}

function stageIdsForRole(moduleId: string, role: CurriculumRole) {
  if (role === 'required-core') {
    return curriculumSpineStages
      .filter((stage) => stage.requiredModuleIds.includes(moduleId))
      .map((stage) => stage.id)
  }
  if (role === 'just-in-time-support') return supportStageIdsByModule.get(moduleId) ?? []
  if (role === 'project-validation') return projectStageIdsByModule.get(moduleId) ?? []
  return []
}

function roleEntry(moduleId: string): CurriculumRoleEntry {
  const role = primaryRoleForModule(moduleId)
  return {
    moduleId,
    role,
    label: roleCopy[role].label,
    description: roleCopy[role].description,
    stageIds: stageIdsForRole(moduleId, role),
  }
}

const catalogModuleIds = new Set(curriculumCatalog.map((moduleDefinition) => moduleDefinition.id))
const orderedRoleModuleIds = [
  ...requiredModuleIds,
  ...curriculumCatalog
    .map((moduleDefinition) => moduleDefinition.id)
    .filter((moduleId) => !requiredModuleIdSet.has(moduleId)),
].filter((moduleId) => catalogModuleIds.has(moduleId))

export const curriculumRoles = orderedRoleModuleIds.map(roleEntry)

export const curriculumRoleByModuleId = new Map(curriculumRoles.map((entry) => [entry.moduleId, entry]))

export function curriculumRoleForModule(moduleId: string) {
  return curriculumRoleByModuleId.get(moduleId)
}

export function validateCurriculumRoleCoverage() {
  const issues: string[] = []
  const seen = new Set<string>()

  for (const entry of curriculumRoles) {
    if (!catalogModuleIds.has(entry.moduleId)) {
      issues.push(`${entry.moduleId} has a curriculum role but is missing from the catalog`)
    }
    if (seen.has(entry.moduleId)) {
      issues.push(`${entry.moduleId} has more than one primary curriculum role`)
    }
    seen.add(entry.moduleId)
  }

  for (const moduleDefinition of curriculumCatalog) {
    if (!seen.has(moduleDefinition.id)) {
      issues.push(`${moduleDefinition.id} is missing a primary curriculum role`)
    }
  }

  return issues
}
