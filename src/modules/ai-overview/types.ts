import type { AppLocale, LocalizedCopy } from '../../types/ml'

export type Localized<T> = Record<AppLocale, T>
export type AiOverviewChapterId =
  | 'three-problems'
  | 'ai-world-map'
  | 'ml-common-language'
  | 'supervised-linear-regression'
  | 'learning-paradigms'
  | 'unsupervised-kmeans'
  | 'reinforcement-q-learning'
  | 'choose-learning-approach'
export type LearningParadigm = 'supervised' | 'unsupervised' | 'reinforcement'
export type Point2D = { id: string; x: number; y: number }
export type RegressionSample = Point2D
export type RegressionPresetId = 'clear-trend' | 'noisy-trend' | 'outlier'
export type RegressionPreset = { id: RegressionPresetId; label: LocalizedCopy; samples: RegressionSample[] }
export type KMeansPhase = 'initialization' | 'assignment' | 'recomputation' | 'converged'
export type KMeansSnapshot = { iteration: number; phase: KMeansPhase; centers: Point2D[]; assignments: number[]; withinGroupDistanceTotal: number }
export type GridAction = 'up' | 'right' | 'down' | 'left'
export type GridCell = { row: number; column: number }
export type QTable = Record<string, Record<GridAction, number>>
export type QUpdate = { stateKey: string; action: GridAction; reward: number; nextStateKey: string; oldValue: number; target: number; newValue: number }
export type QLearningEnvironment = { width: 4; height: 4; start: GridCell; goal: GridCell; obstacles: GridCell[]; goalReward: 10; stepReward: -1; collisionReward: -3 }
export type StaticAlgorithmFrame = { id: string; title: LocalizedCopy; explanation: LocalizedCopy; values: Record<string, string | number> }
