import { curriculumV3ModuleById } from './inventory.ts'
import type { CurriculumV3ExitCapability } from './types.ts'

export const curriculumV3EntryAssumptions = [
  'high-school-algebra-functions',
  'basic-python-reading-editing',
] as const

export const curriculumV3EntryConcepts = [
  'high-school-algebra',
  'basic-python',
] as const

export const curriculumV3EntryRequirements = {
  'ai-overview': curriculumV3EntryAssumptions,
} as const

export const curriculumV3CapabilityEndpoints = {
  'mathematics-to-computation': ['gradient-descent', 'project-math-to-code'],
  'data-to-honest-model': ['linear-regression', 'project-tabular-regression'],
  'classification-and-evaluation': ['model-selection', 'project-classification-evaluation'],
  'neural-training-diagnosis': ['optimizer-comparison', 'project-neural-representation'],
  'deep-representation-shapes': ['cnn-visualization', 'sequence-embedding-bridge'],
  'small-transformer-language-model': ['decoding-sampling', 'project-small-transformer'],
  'llm-adaptation-and-rag': ['llm-evaluation-reliability', 'project-llm-application'],
} as const

const capabilityDescriptions: Record<keyof typeof curriculumV3CapabilityEndpoints, CurriculumV3ExitCapability['description']> = {
  'mathematics-to-computation': { 'zh-CN': '把数学定义转换为可验证的数值代码。', en: 'Translate mathematical definitions into verifiable numerical code.' },
  'data-to-honest-model': { 'zh-CN': '从数据处理建立诚实、可复现的模型基线。', en: 'Build an honest, reproducible model baseline from data processing.' },
  'classification-and-evaluation': { 'zh-CN': '依据验证证据做出分类与评估决策。', en: 'Make classification and evaluation decisions from validation evidence.' },
  'neural-training-diagnosis': { 'zh-CN': '诊断神经网络训练与中间表示。', en: 'Diagnose neural-network training and intermediate representations.' },
  'deep-representation-shapes': { 'zh-CN': '追踪深度表示、张量形状与序列嵌入。', en: 'Trace deep representations, tensor shapes, and sequence embeddings.' },
  'small-transformer-language-model': { 'zh-CN': '训练、评估并采样小型语言模型。', en: 'Train, evaluate, and sample from a small language model.' },
  'llm-adaptation-and-rag': { 'zh-CN': '用证据评估 LLM 适配、检索与可靠性。', en: 'Evaluate LLM adaptation, retrieval, and reliability with evidence.' },
}

export const curriculumV3ExitCapabilities: CurriculumV3ExitCapability[] = Object.entries(
  curriculumV3CapabilityEndpoints,
).map(([id, endpointIds]) => ({
  id,
  description: capabilityDescriptions[id as keyof typeof curriculumV3CapabilityEndpoints],
  moduleIds: endpointIds.filter((endpointId) => !endpointId.startsWith('project-')),
  projectIds: endpointIds.filter((endpointId) => endpointId.startsWith('project-')),
}))

interface ReachableModule {
  prerequisiteIds: readonly string[]
}

export function reachableFromEntry(
  moduleId: string,
  moduleById: ReadonlyMap<string, ReachableModule> = curriculumV3ModuleById,
  entryAssumptions: readonly string[] = curriculumV3EntryAssumptions,
  entryRequirements: Readonly<Record<string, readonly string[]>> = curriculumV3EntryRequirements,
): boolean {
  const visited = new Set<string>()
  const visiting = new Set<string>()
  const entryCapabilityIds = new Set(entryAssumptions)

  const visit = (id: string): boolean => {
    if (visited.has(id)) return true
    if (visiting.has(id)) return false
    const module = moduleById.get(id)
    if (!module) return false
    visiting.add(id)
    const entryCapabilityRequirements = entryRequirements[id]
    const reachable = module.prerequisiteIds.length === 0
      ? entryCapabilityRequirements !== undefined &&
        entryCapabilityRequirements.every((capabilityId) => entryCapabilityIds.has(capabilityId))
      : module.prerequisiteIds.every(visit)
    visiting.delete(id)
    if (reachable) visited.add(id)
    return reachable
  }

  return visit(moduleId)
}
