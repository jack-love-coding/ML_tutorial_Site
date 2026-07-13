import test from 'node:test'
import assert from 'node:assert/strict'
import { reactive } from 'vue'
import { qLearningEnvironment } from '../src/modules/ai-overview/data/experiments.ts'
import {
  cloneQTable,
  createQTable,
  evaluateGreedyPolicy,
  runEpisode,
  selectAction,
  stateKey,
  stepQLearningSession,
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

  assert.deepEqual(update, {
    oldValue: 0,
    nextBestValue: 4,
    target: 2.6,
    correction: 1.3,
    newValue: 1.3,
  })
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
  assert.equal(Object.keys(qTable).length, 16)
  assert.deepEqual(qTable['1,1'], { up: 0, right: 0, down: 0, left: 0 })
  assert.deepEqual(qTable['2,2'], { up: 0, right: 0, down: 0, left: 0 })
})

test('proxy-safe Q-table cloning deep-clones rows and episode mutation leaves the reactive source unchanged', () => {
  const source = reactive(createQTable(qLearningEnvironment))
  source['3,0'].right = 2
  const before = Object.fromEntries(Object.entries(source).map(([key, values]) => [key, { ...values }]))

  const cloned = cloneQTable(source)
  assert.deepEqual(cloned, before)
  assert.notStrictEqual(cloned['3,0'], source['3,0'])

  runEpisode(qLearningEnvironment, cloned, {
    explorationRate: 0,
    learningRate: 0.5,
    discountFactor: 0.9,
    random: () => 0.99,
  })

  assert.deepEqual(source, before)
})

test('greedy action selection keeps deterministic ties and exploration uses the supplied random source', () => {
  const qTable = createQTable(qLearningEnvironment)
  qTable['3,0'].right = 2
  qTable['3,0'].down = 2

  assert.equal(selectAction(qTable, { row: 3, column: 0 }, 0, () => 0.99), 'right')

  const draws = [0.1, 0.6]
  assert.equal(selectAction(qTable, { row: 3, column: 0 }, 1, () => draws.shift() ?? 0), 'down')
})

test('greedy ties exhaust the full up, right, down, left priority order', () => {
  const qTable = createQTable(qLearningEnvironment)
  const state = { row: 3, column: 0 }
  assert.equal(selectAction(qTable, state, 0, () => 0.99), 'up')
  qTable['3,0'] = { up: -1, right: 3, down: 3, left: 3 }
  assert.equal(selectAction(qTable, state, 0, () => 0.99), 'right')
  qTable['3,0'] = { up: -1, right: -1, down: 3, left: 3 }
  assert.equal(selectAction(qTable, state, 0, () => 0.99), 'down')
  qTable['3,0'] = { up: -1, right: -1, down: -1, left: 3 }
  assert.equal(selectAction(qTable, state, 0, () => 0.99), 'left')
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

test('a goal-directed greedy episode terminates at the goal before the 64-step bound', () => {
  const qTable = createQTable(qLearningEnvironment)
  for (const state of ['3,0', '2,0', '1,0']) qTable[state].up = 1
  for (const state of ['0,0', '0,1', '0,2']) qTable[state].right = 1
  const result = runEpisode(qLearningEnvironment, qTable, {
    explorationRate: 0,
    learningRate: 0,
    discountFactor: 0.9,
    random: () => 0.99,
  })
  assert.equal(result.reachedGoal, true)
  assert.equal(result.steps, 6)
  assert.ok(result.steps < 64)
  assert.deepEqual(result.finalState, qLearningEnvironment.goal)
})

test('rates clamp only after rejecting non-finite numbers', () => {
  const low = updateQValue({ oldValue: 2, reward: 1, nextBestValue: 3, learningRate: -4, discountFactor: -2 })
  const high = updateQValue({ oldValue: 0, reward: 1, nextBestValue: 3, learningRate: 4, discountFactor: 2 })

  assert.deepEqual(low, { oldValue: 2, nextBestValue: 3, target: 1, correction: 0, newValue: 2 })
  assert.deepEqual(high, { oldValue: 0, nextBestValue: 3, target: 4, correction: 4, newValue: 4 })
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

test('two session actions continue from the displayed cell without mutating prior tables', () => {
  const initial = createQTable(qLearningEnvironment)
  const draws = [0.1, 0.3, 0.1, 0.3]
  const random = () => draws.shift() ?? 0.99
  const first = stepQLearningSession({
    environment: qLearningEnvironment,
    currentState: qLearningEnvironment.start,
    qTable: initial,
    explorationRate: 1,
    learningRate: 0.5,
    discountFactor: 0.9,
    random,
  })
  const second = stepQLearningSession({
    environment: qLearningEnvironment,
    currentState: first.nextState,
    qTable: first.qTable,
    explorationRate: 1,
    learningRate: 0.5,
    discountFactor: 0.9,
    random,
  })

  assert.equal(first.update.stateKey, '3,0')
  assert.equal(first.update.nextStateKey, '3,1')
  assert.equal(second.update.stateKey, first.update.nextStateKey)
  assert.equal(second.update.nextStateKey, '3,2')
  assert.equal(initial['3,0'].right, 0)
  assert.equal(first.qTable['3,0'].right, -0.5)
  assert.equal(second.qTable['3,0'].right, -0.5)
})

test('session updates expose every finite desktop teaching term from the shared engine', () => {
  const result = stepQLearningSession({
    environment: qLearningEnvironment,
    currentState: qLearningEnvironment.start,
    qTable: createQTable(qLearningEnvironment),
    explorationRate: 0.3,
    learningRate: 0.5,
    discountFactor: 0.9,
    random: () => 0.99,
  })

  assert.deepEqual(Object.keys(result.update), [
    'stateKey', 'action', 'reward', 'nextStateKey',
    'oldValue', 'nextBestValue', 'target', 'correction', 'newValue',
  ])
  for (const term of ['oldValue', 'reward', 'nextBestValue', 'target', 'correction', 'newValue'] as const) {
    assert.equal(Number.isFinite(result.update[term]), true, `${term} must be finite`)
  }
  assert.equal(result.update.target, result.update.reward + 0.9 * result.update.nextBestValue)
  assert.equal(result.update.correction, result.update.newValue - result.update.oldValue)
})

test('episode training starts at the environment start and preserves existing learned values', () => {
  const existing = createQTable(qLearningEnvironment)
  existing['0,0'].left = 7.25
  existing['3,0'].right = 2
  const trained = runEpisode(qLearningEnvironment, structuredClone(existing), {
    explorationRate: 0,
    learningRate: 0.5,
    discountFactor: 0.9,
    random: () => 0.99,
  })

  assert.equal(trained.updates[0].stateKey, stateKey(qLearningEnvironment.start))
  assert.equal(trained.qTable['0,0'].left, 7.25)
  assert.notEqual(trained.qTable['3,0'].right, 0)
})

test('session stepping rejects an already-terminal cell without mutating the Q table', () => {
  const qTable = createQTable(qLearningEnvironment)
  qTable['0,3'].left = 4.5
  const before = structuredClone(qTable)

  assert.throws(
    () => stepQLearningSession({
      environment: qLearningEnvironment,
      currentState: qLearningEnvironment.goal,
      qTable,
      explorationRate: 0.3,
      learningRate: 0.5,
      discountFactor: 0.9,
      random: () => 0.5,
    }),
    /terminal state/i,
  )
  assert.deepEqual(qTable, before)
})
