export type MathLabLocale = 'zh-CN' | 'en'

export type MathLabModuleId = string

export type MathLabDifficulty = 'foundation' | 'intermediate' | 'advanced'

export type EnhancementTier = 'core' | 'interactive' | 'video'

export interface LocalizedCopy {
  'zh-CN': string
  en: string
}

export interface SourceReference {
  label: LocalizedCopy
  href: string
  license?: string
  usage: LocalizedCopy
}

export interface MathLabTocItem {
  id: string
  level: 2 | 3
  title: LocalizedCopy
}

export interface MathLabSection {
  id: string
  level: 2 | 3
  title: LocalizedCopy
  content: LocalizedCopy
  visualIds?: string[]
  labIds?: string[]
}

export interface MathConcept {
  id: string
  name: LocalizedCopy
  formulaLatex: string
  variables: Array<{
    symbol: string
    description: LocalizedCopy
  }>
  plainExplanation: LocalizedCopy
  geometricIntuition: LocalizedCopy
  numericalExample: LocalizedCopy
  codeExample?: string
  modelConnection: LocalizedCopy
}

export interface VisualAsset {
  id: string
  type: 'manim-video' | 'three-scene' | 'svg' | 'canvas' | 'image'
  title: LocalizedCopy
  assetPath?: string
  posterPath?: string
  componentName?: string
  transcript: LocalizedCopy
  learningPurpose: LocalizedCopy
  alt?: LocalizedCopy
  caption?: LocalizedCopy
}

export interface LabConfig {
  id: string
  title: LocalizedCopy
  type: 'interactive-visual' | 'code' | 'hybrid'
  componentName: string
  successCriteria: LocalizedCopy[]
}

export interface QuizChoice {
  id: string
  label: LocalizedCopy
}

export interface QuizItem {
  id: string
  type: 'single-choice' | 'multi-choice' | 'numeric' | 'free-text'
  prompt: LocalizedCopy
  choices?: QuizChoice[]
  answer: string | string[] | number
  tolerance?: number
  explanation: LocalizedCopy
  misconceptionTags: string[]
  revisitVisualId?: string
}

export interface Misconception {
  id: string
  statement: LocalizedCopy
  correction: LocalizedCopy
  example: LocalizedCopy
}

export interface MathLabModule {
  id: MathLabModuleId
  enhancementTier: EnhancementTier
  order: number
  title: LocalizedCopy
  subtitle: LocalizedCopy
  difficulty: MathLabDifficulty
  estimatedMinutes: number
  prerequisites: MathLabModuleId[]
  aiModelConnections: LocalizedCopy[]
  learningObjectives: LocalizedCopy[]
  concepts: MathConcept[]
  sections: MathLabSection[]
  toc: MathLabTocItem[]
  visuals: VisualAsset[]
  labs: LabConfig[]
  quizzes: QuizItem[]
  misconceptions: Misconception[]
  nextModuleIds: MathLabModuleId[]
  accent: string
  theme: string
  sourceNoteFile?: string
  originalSort?: number
  importedAssetPaths?: string[]
  sourceReferences?: SourceReference[]
}

export interface DiagnosticQuestion {
  id: string
  dimension: DiagnosticDimension
  prompt: LocalizedCopy
  choices: QuizChoice[]
  answer: string
  weakConceptTag: string
  explanation: LocalizedCopy
}

export type DiagnosticDimension = 'linearAlgebra' | 'calculus' | 'probability' | 'optimization'

export interface DiagnosticResult {
  linearAlgebra: number
  calculus: number
  probability: number
  optimization: number
  recommendedStartModuleId: MathLabModuleId
  weakConcepts: string[]
}

export interface MasteryScore {
  conceptId: string
  formula: number
  intuition: number
  numerical: number
  code: number
  modelConnection: number
  lastPracticedAt: string
}

export interface QuizAttempt {
  quizId: string
  moduleId: MathLabModuleId
  selected: string | string[] | number
  correct: boolean
  misconceptionTags: string[]
  attemptedAt: string
}

export interface MathLabProgress {
  diagnosticResult?: DiagnosticResult
  completedModuleIds: MathLabModuleId[]
  quizAttempts: QuizAttempt[]
  weakConceptTags: string[]
  lastVisitedModuleId?: MathLabModuleId
  mastery: MasteryScore[]
  updatedAt: string
}

export interface ThreeSceneController<TParams = unknown> {
  mount: (el: HTMLElement) => void
  update?: (params: TParams) => void
  dispose: () => void
}
