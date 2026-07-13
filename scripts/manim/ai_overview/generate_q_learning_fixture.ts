import { qLearningEnvironment } from '../../../src/modules/ai-overview/data/experiments.ts'
import {
  Q_LEARNING_ACTIONS,
  createQTable,
  runEpisode,
} from '../../../src/modules/ai-overview/utils/qLearning.ts'
import { createSeededRandom } from '../../../src/modules/ai-overview/utils/random.ts'

const SNAPSHOT_EPISODES = new Set([1, 5, 20, 50])
const random = createSeededRandom(7107)
const qTable = createQTable(qLearningEnvironment)
const snapshots = []
const nonNavigableStates = new Set([
  qLearningEnvironment.goal,
  ...qLearningEnvironment.obstacles,
].map(({ row, column }) => `${row},${column}`))

for (let episode = 1; episode <= 50; episode += 1) {
  const result = runEpisode(qLearningEnvironment, qTable, {
    explorationRate: 0.3,
    learningRate: 0.5,
    discountFactor: 0.9,
    random,
  })
  if (!SNAPSHOT_EPISODES.has(episode)) continue

  const trajectory = [
    { ...qLearningEnvironment.start },
    ...result.updates.map(({ nextStateKey }) => {
      const [row, column] = nextStateKey.split(',').map(Number)
      return { row, column }
    }),
  ]
  const policy = Object.fromEntries(Object.entries(qTable)
    .filter(([state]) => !nonNavigableStates.has(state))
    .map(([state, values]) => [
      state,
      Q_LEARNING_ACTIONS.reduce((best, action) => values[action] > values[best] ? action : best, Q_LEARNING_ACTIONS[0]),
    ]))

  snapshots.push({
    episode,
    trajectory,
    cumulativeReward: result.cumulativeReward,
    reachedGoal: result.reachedGoal,
    qTable: structuredClone(qTable),
    policy,
  })
}

console.log(JSON.stringify(snapshots))
