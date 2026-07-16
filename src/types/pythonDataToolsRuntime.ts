import type {
  NotebookCellRole,
  PythonDataToolsChapterId,
  PythonDataToolsExerciseKind,
  PythonDataToolsOutputId,
} from '../data/pythonNotebookContract.ts'
import type { LocalizedCopy } from './ml.ts'

export interface PythonDataToolsMarkdownBlock {
  kind: 'markdown'
  id: string
  markdown: LocalizedCopy
}

export interface PythonDataToolsCodeBlock {
  kind: 'code'
  id: `ch${number}-${string}`
  role: NotebookCellRole
  code: string
  outputId?: PythonDataToolsOutputId
}

export interface PythonDataToolsAxisLegendTranslation {
  source: string
  label: LocalizedCopy
}

export interface PythonDataToolsResultPresentationBlock {
  kind: 'result-presentation'
  id: `result-${PythonDataToolsOutputId}`
  outputId: PythonDataToolsOutputId
  outputKind: 'json' | 'png' | 'plotly-json'
  title: LocalizedCopy
  alt: LocalizedCopy
  axisLegendTranslations: readonly PythonDataToolsAxisLegendTranslation[]
  interpretation: LocalizedCopy
  limitation: LocalizedCopy
  fallbackSummary: LocalizedCopy
}

export interface PythonDataToolsTeachingPromptBlock {
  kind: 'teaching-prompt'
  id: PythonDataToolsExerciseKind
  promptKind: PythonDataToolsExerciseKind
  chapterId: PythonDataToolsChapterId
  question: LocalizedCopy
  referenceReasoning: LocalizedCopy
  misconception: LocalizedCopy
  revisit: LocalizedCopy
  scored: false
  submitted: false
  persistedToProgress: false
  gatesChapter: false
}

export type PythonDataToolsRuntimeBlock =
  | PythonDataToolsMarkdownBlock
  | PythonDataToolsCodeBlock
  | PythonDataToolsResultPresentationBlock
  | PythonDataToolsTeachingPromptBlock

export interface PythonDataToolsRuntimeChapter {
  id: PythonDataToolsChapterId
  title: LocalizedCopy
  question: LocalizedCopy
  blocks: readonly PythonDataToolsRuntimeBlock[]
}
