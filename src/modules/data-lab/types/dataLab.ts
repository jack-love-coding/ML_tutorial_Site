export type DataLabLocale = 'zh-CN' | 'en'

export type DataLabModuleId =
  | 'numerical-data'
  | 'categorical-data'
  | 'dataset-quality'
  | 'splits-generalization'
  | 'complexity-regularization'

export type DataCell = string | number | boolean | null

export type DataRow = Record<string, DataCell>

export interface LocalizedCopy {
  'zh-CN': string
  en: string
}

export type ColumnSemanticType =
  | 'numeric'
  | 'categorical'
  | 'ordinal'
  | 'boolean'
  | 'datetime'
  | 'text'
  | 'identifier'
  | 'missing'

export interface DataColumn {
  key: string
  label: LocalizedCopy
  semanticType: ColumnSemanticType
}

export interface DataTable {
  columns: DataColumn[]
  rows: DataRow[]
}

export interface ColumnProfile {
  key: string
  label: LocalizedCopy
  inferredType: ColumnSemanticType
  missingCount: number
  uniqueCount: number
  numericMin?: number
  numericMax?: number
  mean?: number
}

export interface PipelineStep {
  id: string
  label: LocalizedCopy
  pandasCode: string
  description: LocalizedCopy
}

export interface DataLabSection {
  id: string
  title: LocalizedCopy
  content: LocalizedCopy
  visualIds?: string[]
  labIds?: string[]
}

export interface DataConcept {
  id: string
  name: LocalizedCopy
  plainExplanation: LocalizedCopy
  example: LocalizedCopy
  pandasExample?: string
}

export interface VisualOverlayLabel {
  id: string
  x: number
  y: number
  label: LocalizedCopy
}

export interface DataVisualAsset {
  id: string
  type: 'image' | 'manim-video'
  title: LocalizedCopy
  assetPath: string
  posterPath?: string
  alt: LocalizedCopy
  caption: LocalizedCopy
  labels?: VisualOverlayLabel[]
}

export interface DataLabConfig {
  id: string
  title: LocalizedCopy
  componentName:
    | 'ColumnTypeLab'
    | 'CleaningPipelineLab'
    | 'EdaWorkbenchLab'
    | 'PandasPipelineLab'
    | 'DataPipelineTaskLab'
    | 'CategoricalEncodingLab'
  successCriteria: LocalizedCopy[]
}

export interface DataQuizItem {
  id: string
  prompt: LocalizedCopy
  choices: Array<{
    id: string
    label: LocalizedCopy
  }>
  answer: string
  explanation: LocalizedCopy
}

export interface DataQuizAttempt {
  quizId: string
  moduleId: DataLabModuleId
  selected: string
  correct: boolean
  attemptedAt: string
}

export interface DataLabProgress {
  completedModuleIds: DataLabModuleId[]
  quizAttempts: DataQuizAttempt[]
  lastVisitedModuleId?: DataLabModuleId
  updatedAt: string
}

export interface DataMisconception {
  id: string
  statement: LocalizedCopy
  correction: LocalizedCopy
  example: LocalizedCopy
}

export interface SourceReference {
  label: LocalizedCopy
  href: string
  usage: LocalizedCopy
  license?: string
}

export interface DataLabModule {
  id: DataLabModuleId
  order: number
  title: LocalizedCopy
  subtitle: LocalizedCopy
  accent: string
  theme: string
  estimatedMinutes: number
  learningObjectives: LocalizedCopy[]
  concepts: DataConcept[]
  sections: DataLabSection[]
  visuals: DataVisualAsset[]
  labs: DataLabConfig[]
  quizzes: DataQuizItem[]
  misconceptions: DataMisconception[]
  sourceReferences: SourceReference[]
  notebookUrl?: string
}
