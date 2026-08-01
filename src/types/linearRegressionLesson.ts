import type { LocalizedCopy } from './ml'

export type LinearRegressionLessonBlockKind =
  | 'explanation'
  | 'formula'
  | 'code'
  | 'runtime-output'
  | 'figure'
  | 'table'
  | 'observation-lab'

interface LinearRegressionLessonBlockBase {
  id: string
  kind: LinearRegressionLessonBlockKind
  title: LocalizedCopy
}

export interface LinearRegressionExplanationBlock extends LinearRegressionLessonBlockBase {
  kind: 'explanation'
  eyebrow: LocalizedCopy
  body: LocalizedCopy
  tone?: 'default' | 'question' | 'misconception' | 'conclusion' | 'leakage'
}

export interface LinearRegressionFormulaBlock extends LinearRegressionLessonBlockBase {
  kind: 'formula'
  formula: string
  explanation: LocalizedCopy
  variables: Array<{ symbol: string; meaning: LocalizedCopy }>
}

export interface LinearRegressionCodeBlock extends LinearRegressionLessonBlockBase {
  kind: 'code'
  language: 'python'
  code: string
  note?: LocalizedCopy
}

export interface LinearRegressionRuntimeOutputBlock extends LinearRegressionLessonBlockBase {
  kind: 'runtime-output'
  output: string
  interpretation: LocalizedCopy
}

export interface LinearRegressionFigureBlock extends LinearRegressionLessonBlockBase {
  kind: 'figure'
  figureId: LinearRegressionFigureId
}

export interface LinearRegressionTableBlock extends LinearRegressionLessonBlockBase {
  kind: 'table'
  columns: LocalizedCopy[]
  rows: Array<{ id: string; cells: LocalizedCopy[] }>
  caption: LocalizedCopy
}

export interface LinearRegressionObservationLabBlock extends LinearRegressionLessonBlockBase {
  kind: 'observation-lab'
  prompt: LocalizedCopy
  controlLabels: LocalizedCopy[]
}

export type LinearRegressionLessonBlock =
  | LinearRegressionExplanationBlock
  | LinearRegressionFormulaBlock
  | LinearRegressionCodeBlock
  | LinearRegressionRuntimeOutputBlock
  | LinearRegressionFigureBlock
  | LinearRegressionTableBlock
  | LinearRegressionObservationLabBlock

export type LinearRegressionFigureId =
  | 'fit-line-temp'
  | 'split-and-target'
  | 'train-feature-relations'
  | 'residual-loss'
  | 'gradient-descent'
  | 'hour-and-polynomial'
  | 'feature-stages'
  | 'coefficients'
  | 'validation-diagnostics'
  | 'regularization'
  | 'final-test'

export interface LinearRegressionFigureDefinition {
  id: LinearRegressionFigureId
  chapterId: string
  publicPath: string
  sourceCellId: string
  title: LocalizedCopy
  alt: LocalizedCopy
  caption: LocalizedCopy
  readingHint: LocalizedCopy
  fallback: LocalizedCopy
}

export interface LinearRegressionReference {
  label: LocalizedCopy
  href: string
  note: LocalizedCopy
}

export interface LinearRegressionDownload {
  label: LocalizedCopy
  publicPath: string
  kind: 'notebook' | 'csv' | 'json' | 'image-package' | 'dataset'
}

export interface LinearRegressionChapterLesson {
  id: string
  blocks: LinearRegressionLessonBlock[]
  references?: LinearRegressionReference[]
  downloads?: LinearRegressionDownload[]
}
