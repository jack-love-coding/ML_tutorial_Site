import type { LocalizedCopy } from '../types/ml.ts'

export type CurriculumSourceNamespace = 'algorithm' | 'math-lab' | 'data-lab'

export type CurriculumDomain =
  | 'foundation'
  | 'math'
  | 'data'
  | 'model'
  | 'deep-learning'
  | 'project'

export type CurriculumLevel = 'beginner' | 'intermediate' | 'advanced'

export interface CurriculumSourceRef {
  namespace: CurriculumSourceNamespace
  id: string
}

export interface CurriculumLesson {
  id: string
  sourceId: string
  title: LocalizedCopy
  summary: LocalizedCopy
  route?: string
  estimatedMinutes?: number
}

export interface CurriculumModule {
  id: string
  source: CurriculumSourceRef
  domain: CurriculumDomain
  level: CurriculumLevel
  title: LocalizedCopy
  summary: LocalizedCopy
  route: string
  estimatedMinutes: number
  prerequisiteIds: string[]
  outcomeIds: string[]
  lessons: CurriculumLesson[]
  relatedModuleIds: string[]
  legacyRoute?: string
}

export interface CurriculumTrack {
  id: string
  title: LocalizedCopy
  description: LocalizedCopy
  moduleIds: string[]
  kind: 'core' | 'topic-library' | 'project' | 'advanced'
}

export interface CurriculumSpineStage {
  id: string
  title: LocalizedCopy
  learnerQuestion: LocalizedCopy
  requiredModuleIds: string[]
  supportModuleIds: string[]
  projectModuleIds?: string[]
  outcomes: LocalizedCopy[]
  knownGaps?: LocalizedCopy[]
}
