import test from 'node:test'
import assert from 'node:assert/strict'
import { qLearningEnvironment } from '../src/modules/ai-overview/data/experiments.ts'
import {
  createQTable,
  evaluateGreedyPolicy,
  runEpisode,
  selectAction,
  stateKey,
  trainEpisodes,
  transition,
  updateQValue,
} from '../src/modules/ai-overview/utils/qLearning.ts'

test('Q update uses reward plus discounted next-state value', () => {
  const update = updateQValue({
    oldValue: 0,
    reward: -1,
    nextBestValue: 4,
    learningRate: 0.5,
    discountFactor: 0.9,
  })

  assert.deepEqual(update, { oldValue: 0, target: 2.6, newValue: 1.3 })
})

test('environment rewards goal, step, and obstacle collision exactly', () => {
  assert.equal(transition(qLearningEnvironment, { row: 0, column: 2 }, 'right').reward, 10)
  assert.equal(transition(qLearningEnvironment, { row: 3, column: 0 }, 'right').reward, -1)
  assert.equal(transition(qLearningEnvironment, { row: 1, column: 0 }, 'right').reward, -3)
})

test('collisions and boundary attempts keep the agent in place', () => {
  assert.deepEqual(transition(qLearningEnvironment, { row: 1, column: 0 }, 'right'), {
    nextState: { row: 1, column: 0 },
    reward: -3,
    reachedGoal: false,
  })
  assert.deepEqual(transition(qLearningEnvironment, { row: 0, column: 0 }, 'up'), {
    nextState: { row: 0, column: 0 },
    reward: -1,
    reachedGoal: false,
  })
})

test('Q table uses deterministic state keys and action order', () => {
  const qTable = createQTable(qLearningEnvironment)

  assert.equal(stateKey({ row: 2, column: 3 }), '2,3')
  assert.deepEqual(Object.keys(qTable['0,0']), ['up', 'right', 'down', 'left'])
  assert.equal(Object.keys(qTable).length, 14)
  assert.equal(qTable['1,1'], undefined)
})

test('greedy action selection keeps deterministic ties and exploration uses the supplied random source', () => {
  const qTable = createQTable(qLearningEnvironment)
  qTable['3,0'].right = 2
  qTable['3,0'].down = 2

  assert.equal(selectAction(qTable, { row: 3, column: 0 }, 0, () => 0.99), 'right')

  const draws = [0.1, 0.6]
  assert.equal(selectAction(qTable, { row: 3, column: 0 }, 1, () => draws.shift() ?? 0), 'down')
})

test('seeded training is replayable and greedy evaluation disables exploration', () => {
  const first = trainEpisodes(qLearningEnvironment, {
    episodes: 50,
    seed: 7107,
    explorationRate: 0.3,
    learningRate: 0.5,
    discountFactor: 0.9,
  })
  const second = trainEpisodes(qLearningEnvironment, {
    episodes: 50,
    seed: 7107,
    explorationRate: 0.3,
    learningRate: 0.5,
    discountFactor: 0.9,
  })

  assert.deepEqual(second, first)
  assert.equal(evaluateGreedyPolicy(qLearningEnvironment, first.qTable, 32).reachedGoal, true)
})

test('episodes stop at the goal or the 64-step teaching bound', () => {
  const qTable = createQTable(qLearningEnvironment)
  const bounded = runEpisode(qLearningEnvironment, qTable, {
    explorationRate: 0,
    learningRate: 0,
    discountFactor: 0.9,
    random: () => 0.99,
  })

  assert.equal(bounded.steps, 64)
  assert.equal(bounded.reachedGoal, false)
})

test('rates clamp only after rejecting non-finite numbers', () => {
  const low = updateQValue({ oldValue: 2, reward: 1, nextBestValue: 3, learningRate: -4, discountFactor: -2 })
  const high = updateQValue({ oldValue: 0, reward: 1, nextBestValue: 3, learningRate: 4, discountFactor: 2 })

  assert.deepEqual(low, { oldValue: 2, target: 1, newValue: 2 })
  assert.deepEqual(high, { oldValue: 0, target: 4, newValue: 4 })
  assert.throws(
    () => updateQValue({ oldValue: 0, reward: 0, nextBestValue: 0, learningRate: Number.NaN, discountFactor: 0.9 }),
    /finite/,
  )
  assert.throws(
    () => selectAction(createQTable(qLearningEnvironment), qLearningEnvironment.start, Number.POSITIVE_INFINITY, () => 0),
    /finite/,
  )
})

test('derived arithmetic never returns NaN or Infinity', () => {
  assert.throws(
    () => updateQValue({ oldValue: Number.MAX_VALUE, reward: -Number.MAX_VALUE, nextBestValue: 0, learningRate: 1, discountFactor: 1 }),
    /finite/,
  )
})

test('greedy evaluation does not mutate its input Q table', () => {
  const trained = trainEpisodes(qLearningEnvironment, {
    episodes: 50,
    seed: 7107,
    explorationRate: 0.3,
    learningRate: 0.5,
    discountFactor: 0.9,
  })
  const before = structuredClone(trained.qTable)

  evaluateGreedyPolicy(qLearningEnvironment, trained.qTable, 32)

  assert.deepEqual(trained.qTable, before)
})
