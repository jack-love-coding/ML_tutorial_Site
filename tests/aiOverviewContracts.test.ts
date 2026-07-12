import test from 'node:test'
import assert from 'node:assert/strict'
import {
  AI_OVERVIEW_CHAPTER_IDS,
  AI_OVERVIEW_SEEDS,
  learnerClusterPoints,
  qLearningEnvironment,
  regressionPresets,
} from '../src/modules/ai-overview/data/experiments.ts'

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
})
