import type { AiOverviewChapterId, Point2D, QLearningEnvironment, RegressionPreset } from '../types'

export const AI_OVERVIEW_CHAPTER_IDS: readonly AiOverviewChapterId[] = [
  'three-problems', 'ai-world-map', 'ml-common-language', 'supervised-linear-regression',
  'learning-paradigms', 'unsupervised-kmeans', 'reinforcement-q-learning', 'choose-learning-approach',
]
export const AI_OVERVIEW_SEEDS = { kmeans: 3103, qLearning: 7107 } as const
export const regressionPresets: Record<RegressionPreset['id'], RegressionPreset> = {
  'clear-trend': { id: 'clear-trend', label: { 'zh-CN': '清晰趋势', en: 'Clear trend' }, samples: [{ id: 's1', x: 1, y: 52 }, { id: 's2', x: 2, y: 59 }, { id: 's3', x: 3, y: 65 }, { id: 's4', x: 4, y: 72 }, { id: 's5', x: 5, y: 78 }] },
  'noisy-trend': { id: 'noisy-trend', label: { 'zh-CN': '带噪声', en: 'Noisy trend' }, samples: [{ id: 's1', x: 1, y: 50 }, { id: 's2', x: 2, y: 63 }, { id: 's3', x: 3, y: 61 }, { id: 's4', x: 4, y: 75 }, { id: 's5', x: 5, y: 76 }] },
  outlier: { id: 'outlier', label: { 'zh-CN': '含异常点', en: 'With outlier' }, samples: [{ id: 's1', x: 1, y: 52 }, { id: 's2', x: 2, y: 59 }, { id: 's3', x: 3, y: 65 }, { id: 's4', x: 4, y: 72 }, { id: 's5', x: 5, y: 98 }] },
}
export const learnerClusterPoints: Point2D[] = [
  { id: 'l1', x: 92, y: 28 }, { id: 'l2', x: 88, y: 33 }, { id: 'l3', x: 95, y: 37 }, { id: 'l4', x: 76, y: 64 },
  { id: 'l5', x: 72, y: 71 }, { id: 'l6', x: 81, y: 68 }, { id: 'l7', x: 48, y: 31 }, { id: 'l8', x: 43, y: 37 },
  { id: 'l9', x: 51, y: 42 }, { id: 'l10', x: 61, y: 88 }, { id: 'l11', x: 56, y: 82 }, { id: 'l12', x: 65, y: 93 },
]
export const qLearningEnvironment: QLearningEnvironment = {
  width: 4, height: 4, start: { row: 3, column: 0 }, goal: { row: 0, column: 3 },
  obstacles: [{ row: 1, column: 1 }, { row: 2, column: 2 }], goalReward: 10, stepReward: -1, collisionReward: -3,
}
