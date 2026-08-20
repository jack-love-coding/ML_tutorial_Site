import type { LocalizedCopy } from '../../types/ml.ts'

export type CoursePublicationStatus = 'planned' | 'draft' | 'published'
export type CourseDifficulty = 'beginner' | 'intermediate' | 'advanced'
export type CourseUnitProgressStatus =
  | 'not-started'
  | 'in-progress'
  | 'ready-for-self-check'
  | 'completed'

export type CourseStudyStepKind =
  | 'explanation'
  | 'code'
  | 'resource'
  | 'lab'
  | 'notebook'
  | 'misconception'
  | 'checkpoint'
  | 'deliverable'

export type CourseResourceRef =
  | {
      kind: 'curriculum'
      moduleId: string
      lessonId?: string
      label: LocalizedCopy
    }
  | {
      kind: 'route'
      route: string
      label: LocalizedCopy
    }
  | {
      kind: 'asset'
      path: string
      label: LocalizedCopy
      download?: boolean
    }
  | {
      kind: 'external'
      href: string
      label: LocalizedCopy
    }

export interface CourseCheckpointOption {
  id: string
  label: LocalizedCopy
}

export interface CourseCheckpoint {
  question: LocalizedCopy
  options: CourseCheckpointOption[]
  correctOptionId: string
  correctFeedback: LocalizedCopy
  incorrectFeedback: LocalizedCopy
}

export interface CourseStudyStep {
  id: string
  kind: CourseStudyStepKind
  title: LocalizedCopy
  description: LocalizedCopy
  required: boolean
  content?: LocalizedCopy
  code?: {
    language: string
    source: LocalizedCopy
  }
  resourceRefs?: CourseResourceRef[]
  checkpoint?: CourseCheckpoint
}

export interface CourseAcceptanceCriterion {
  id: string
  label: LocalizedCopy
}

export interface CourseUnit {
  id: string
  order: number
  syllabusIndex: number
  stageId: string
  title: LocalizedCopy
  coreQuestion: LocalizedCopy
  summary: LocalizedCopy
  outcomes: LocalizedCopy[]
  prerequisiteUnitIds: string[]
  difficulty: CourseDifficulty
  estimatedHours: number
  knowledgeAndMethods: LocalizedCopy
  teachingFocus: LocalizedCopy
  practice: LocalizedCopy
  datasets: LocalizedCopy
  tools: LocalizedCopy
  deliverables: LocalizedCopy
  acceptanceCriteria: CourseAcceptanceCriterion[]
  steps: CourseStudyStep[]
  referenceLinks: string[]
  publicationStatus: CoursePublicationStatus
}

export interface CourseStage {
  id: string
  code: 'A' | 'B' | 'C' | 'D' | string
  order: number
  title: LocalizedCopy
  description: LocalizedCopy
  outcomes: LocalizedCopy[]
  unitIds: string[]
  publicationStatus: CoursePublicationStatus
}

export interface CourseDefinition {
  id: string
  title: LocalizedCopy
  subtitle: LocalizedCopy
  description: LocalizedCopy
  totalHours: number
  totalUnits: number
  stageIds: string[]
  stages: CourseStage[]
  units: CourseUnit[]
}

export interface CourseUnitProgressState {
  unitId: string
  completedStepIds: string[]
  confirmedCriterionIds: string[]
  firstOpenedAt?: string
  lastVisitedAt?: string
}

export interface CourseProgressCourseState {
  courseId: string
  lastVisitedUnitId?: string
  units: Record<string, CourseUnitProgressState>
}

export interface CourseProgressV1 {
  schemaVersion: 1
  activeCourseId?: string
  courses: Record<string, CourseProgressCourseState>
  updatedAt: string
}

export interface CourseContinueTarget {
  courseId: string
  unitId: string
  route: string
  reason: 'last-visited' | 'related-module' | 'first-incomplete'
}
