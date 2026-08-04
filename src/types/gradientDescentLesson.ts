import type { LocalizedCopy } from './ml'

export type GradientDescentSceneId =
  | 'loss-function'
  | 'landscape'
  | 'gradient-rule'
  | 'learning-rate'
  | 'saddle-local-minima'
  | 'noise-and-batch'

export type GradientDescentLessonBlock =
  | {
      id: string
      kind: 'explanation'
      role: 'question' | 'concept' | 'example' | 'prediction' | 'observation' | 'misconception' | 'conclusion'
      title: LocalizedCopy
      body: LocalizedCopy
    }
  | {
      id: string
      kind: 'formula'
      title: LocalizedCopy
      formula: LocalizedCopy
      explanation: LocalizedCopy
    }
  | {
      id: string
      kind: 'code'
      title: LocalizedCopy
      code: string
      note: LocalizedCopy
    }
  | {
      id: string
      kind: 'runtime-output'
      title: LocalizedCopy
      output: string
      interpretation: LocalizedCopy
    }
  | {
      id: string
      kind: 'media'
      title: LocalizedCopy
      assetPath: string
      posterPath: string
      transcript: LocalizedCopy
      chapterMarkers: Array<{ id: string; startSeconds: number; title: LocalizedCopy }>
    }
  | {
      id: string
      kind: 'observation-lab'
      title: LocalizedCopy
      prompt: LocalizedCopy
      sceneId: GradientDescentSceneId
    }

export interface GradientDescentChapterLesson {
  id: GradientDescentSceneId
  blocks: GradientDescentLessonBlock[]
  references?: Array<{ label: LocalizedCopy; href: string; note: LocalizedCopy }>
  downloads?: Array<{ label: LocalizedCopy; publicPath: string; kind: 'notebook' | 'csv' | 'json' | 'video' }>
}

export interface GradientSample {
  id: string
  x: number
  y: number
}

export interface GradientEvaluation {
  weight: number
  bias: number
  predictions: number[]
  residuals: number[]
  mse: number
  gradient: { weight: number; bias: number }
  gradientNorm: number
}

export interface GradientUpdateFrame {
  update: number
  epoch: number
  batchIndex: number
  processedSamples: number
  sampleIds: string[]
  before: { weight: number; bias: number }
  gradient: { weight: number; bias: number }
  after: { weight: number; bias: number }
  fullMse: number
  status: string
}

export type GradientDescentInteractionPayload =
  | {
      scene: 'loss-function'
      notebookCellId: string
      samples: GradientSample[]
      anchor: GradientEvaluation
      lossCurve: Array<{ weight: number; mse: number }>
    }
  | {
      scene: 'landscape'
      notebookCellId: string
      weightValues: number[]
      biasValues: number[]
      lossGrid: number[][]
      optimum: { weight: number; bias: number; mse: number }
      start: { weight: number; bias: number }
    }
  | {
      scene: 'gradient-rule'
      notebookCellId: string
      anchor: GradientEvaluation
      rowContributions: Array<GradientSample & {
        prediction: number
        residual: number
        weightGradientContribution: number
        biasGradientContribution: number
      }>
      learningRate: number
      updated: GradientEvaluation
    }
  | {
      scene: 'learning-rate'
      notebookCellId: string
      scaling: { mean: number; scale: number }
      paths: Array<{
        scale: 'raw' | 'standardized'
        id: 'slow' | 'stable' | 'oscillating' | 'divergent'
        rate: number
        trajectory: { status: string; updates: GradientUpdateFrame[] }
      }>
    }
  | {
      scene: 'saddle-local-minima'
      notebookCellId: string
      terrains: Array<{
        id: string
        domain: [number, number, number, number]
        x: number[]
        y: number[]
        loss: number[][]
      }>
    }
  | {
      scene: 'noise-and-batch'
      notebookCellId: string
      seed: number
      miniBatchSize: number
      paths: Array<{
        mode: 'full' | 'mini-batch' | 'stochastic'
        trajectory: { status: string; updates: GradientUpdateFrame[] }
      }>
      bikeTrace: {
        path: string
        sha256: string
        preview: Array<{ update: number; mse: number; gradientNorm: number }>
      }
    }
