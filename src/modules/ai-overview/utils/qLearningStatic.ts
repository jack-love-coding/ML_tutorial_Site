import { AI_OVERVIEW_SEEDS, qLearningEnvironment } from '../data/experiments.ts'
import { createQTable, stepQLearningSession } from './qLearning.ts'
import { createSeededRandom } from './random.ts'

export type StaticQUpdateFrame = {
  state: string
  action: string
  oldQ: number
  reward: number
  nextBest: number
  target: number
  correction: number
  newQ: number
}

export function buildStaticQUpdateFrame(): StaticQUpdateFrame {
  const discountFactor = 0.9
  const result = stepQLearningSession({
    environment: qLearningEnvironment,
    currentState: qLearningEnvironment.start,
    qTable: createQTable(qLearningEnvironment),
    explorationRate: 0.3,
    learningRate: 0.5,
    discountFactor,
    random: createSeededRandom(AI_OVERVIEW_SEEDS.qLearning),
  })
  const { update } = result
  const frame = {
    state: update.stateKey,
    action: update.action,
    oldQ: update.oldValue,
    reward: update.reward,
    nextBest: (update.target - update.reward) / discountFactor,
    target: update.target,
    correction: update.target - update.oldValue,
    newQ: update.newValue,
  }
  if (Object.values(frame).some((value) => typeof value === 'number' && !Number.isFinite(value))) {
    throw new Error('static Q update terms must be finite')
  }
  return frame
}
