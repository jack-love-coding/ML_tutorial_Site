import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AI_OVERVIEW_CHAPTER_IDS,
  AI_OVERVIEW_SEEDS,
  learnerClusterPoints,
  qLearningEnvironment,
  regressionPresets,
} from '../src/modules/ai-overview/data/experiments.ts'
import type { KMeansState, QLearningState, RegressionState } from '../src/modules/ai-overview/types.ts'

const regressionState: RegressionState = {
  presetId: 'clear-trend',
  samples: regressionPresets['clear-trend'].samples,
  w: 0,
  b: 0,
  candidateCursor: 0,
  currentMse: 0,
  bestMse: 0,
  residualsVisible: false,
  playbackMode: 'idle',
  speed: 1,
  history: [],
}

const kMeansState: KMeansState = {
  points: learnerClusterPoints,
  k: 3,
  seed: AI_OVERVIEW_SEEDS.kmeans,
  centers: [],
  assignments: [],
  phase: 'initialization',
  iteration: 0,
  withinGroupDistanceTotal: 0,
  history: [],
  playbackMode: 'idle',
  speed: 1,
}

const qLearningState: QLearningState = {
  environment: qLearningEnvironment,
  currentState: qLearningEnvironment.start,
  qTable: {},
  learningRate: 0.5,
  discountFactor: 0.9,
  explorationRate: 0.3,
  seed: AI_OVERVIEW_SEEDS.qLearning,
  episode: 0,
  step: 0,
  cumulativeReward: 0,
  lastUpdate: null,
  policy: {},
  playbackMode: 'idle',
  speed: 1,
}

test('AI Overview exposes the approved deterministic course contract', () => {
  assert.deepEqual(AI_OVERVIEW_CHAPTER_IDS, [
    'three-problems',
    'ai-world-map',
    'ml-common-language',
    'supervised-linear-regression',
    'learning-paradigms',
    'unsupervised-kmeans',
    'reinforcement-q-learning',
    'choose-learning-approach',
  ])
  assert.deepEqual(Object.keys(regressionPresets), ['clear-trend', 'noisy-trend', 'outlier'])
  assert.equal(learnerClusterPoints.length, 12)
  assert.equal(qLearningEnvironment.width, 4)
  assert.equal(qLearningEnvironment.height, 4)
  assert.equal(qLearningEnvironment.goalReward, 10)
  assert.equal(qLearningEnvironment.stepReward, -1)
  assert.equal(qLearningEnvironment.collisionReward, -3)
  assert.deepEqual(AI_OVERVIEW_SEEDS, { kmeans: 3103, qLearning: 7107 })
  assert.equal(regressionState.presetId, 'clear-trend')
  assert.equal(kMeansState.k, 3)
  assert.equal(qLearningState.episode, 0)
})
