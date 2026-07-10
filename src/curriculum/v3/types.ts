import type { LocalizedCopy } from '../../types/ml.ts'

export type CurriculumV3ArcId =
  | 'math-language'
  | 'linear-algebra'
  | 'calculus-probability-optimization'
  | 'data-to-features'
  | 'classical-supervised-learning'
  | 'generalization-evaluation'
  | 'neural-network-foundations'
  | 'deep-learning-structures'
  | 'transformers-language-models'
  | 'llm-adaptation-retrieval'

export type CurriculumV3Role = 'required-core' | 'depth-topic' | 'project' | 'reference'
export type CurriculumV3MigrationAction =
  | 'keep'
  | 'rebuild'
  | 'merge'
  | 'split'
  | 'add'
  | 'demote-to-depth'
  | 'retire-with-redirect'
export type CurriculumV3AuthoringStatus = 'planned' | 'drafted' | 'reviewed' | 'parity-complete' | 'promoted'
export type CurriculumV3ExerciseKind = 'concept' | 'calculation-code' | 'open-experiment'

export interface CurriculumV3Arc {
  id: CurriculumV3ArcId
  order: number
  title: LocalizedCopy
  purpose: LocalizedCopy
}

export interface CurriculumV3ContentEvidence {
  intuitionId: string
  formulaVocabulary: string[]
  workedExampleId: string
  scratchCodeId?: string
  frameworkCodeId?: string
  experimentId: string
  failureCaseId: string
  exerciseKinds: CurriculumV3ExerciseKind[]
  checkpointEvidence: 'explanation' | 'calculation' | 'code' | 'experiment'
}

export interface CurriculumV3ModuleBlueprint {
  id: string
  arcId: CurriculumV3ArcId
  order: number
  role: Exclude<CurriculumV3Role, 'project'>
  title: LocalizedCopy
  learnerQuestion: LocalizedCopy
  outcomes: LocalizedCopy[]
  prerequisiteIds: string[]
  introduces: string[]
  revisits: string[]
  mathCapabilities: string[]
  pythonCapabilities: string[]
  contentEvidence: CurriculumV3ContentEvidence
  projectIds: string[]
  sourceModuleIds: string[]
  migrationAction: CurriculumV3MigrationAction
  authoring: {
    zhCN: CurriculumV3AuthoringStatus
    review: CurriculumV3AuthoringStatus
    en: CurriculumV3AuthoringStatus
    runtime: CurriculumV3AuthoringStatus
  }
}

export interface CurriculumV3ProjectBlueprint
  extends Omit<CurriculumV3ModuleBlueprint, 'role' | 'contentEvidence'> {
  role: 'project'
  capabilityIds: string[]
  deliverables: string[]
  evidenceRequirements: string[]
}

export interface CurriculumV3AuditEntry {
  currentModuleId: string
  action: Exclude<CurriculumV3MigrationAction, 'add'>
  targetModuleIds: string[]
  strengths: string[]
  contractGaps: string[]
  rationale: LocalizedCopy
}

export interface CurriculumV3ExitCapability {
  id: string
  description: LocalizedCopy
  moduleIds: string[]
  projectIds: string[]
}

export interface CurriculumV3Wave {
  id: `v3.${1 | 2 | 3 | 4 | 5 | 6 | 7}-${string}`
  title: LocalizedCopy
  moduleIds: string[]
  exitCriteria: LocalizedCopy[]
}
