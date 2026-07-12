import type {
  GridAction,
  GridCell,
  QLearningEnvironment,
  QTable,
  QUpdate,
} from '../types.ts'
import { createSeededRandom } from './random.ts'

export const Q_LEARNING_ACTIONS: readonly GridAction[] = ['up', 'right', 'down', 'left']

const MAX_EPISODE_STEPS = 64

type TransitionResult = {
  nextState: GridCell
  reward: number
  reachedGoal: boolean
}

type QValueUpdateInput = {
  oldValue: number
  reward: number
  nextBestValue: number
  learningRate: number
  discountFactor: number
}

type QValueUpdateResult = {
  oldValue: number
  target: number
  newValue: number
}

type EpisodeOptions = {
  explorationRate: number
  learningRate: number
  discountFactor: number
  random: () => number
}

export type QLearningSessionStepInput = EpisodeOptions & {
  environment: QLearningEnvironment
  currentState: GridCell
  qTable: QTable
}

export type QLearningSessionStepResult = {
  nextState: GridCell
  qTable: QTable
  update: QUpdate
  reward: number
  reachedGoal: boolean
}

export type EpisodeResult = {
  qTable: QTable
  updates: QUpdate[]
  steps: number
  cumulativeReward: number
  reachedGoal: boolean
  finalState: GridCell
}

type TrainingOptions = {
  episodes: number
  seed: number
  explorationRate: number
  learningRate: number
  discountFactor: number
}

export type TrainingResult = {
  qTable: QTable
  episodes: Array<Omit<EpisodeResult, 'qTable'>>
}

export type PolicyEvaluation = {
  path: GridCell[]
  actions: GridAction[]
  steps: number
  cumulativeReward: number
  reachedGoal: boolean
  finalState: GridCell
}

function requireFinite(value: number, name: string) {
  if (!Number.isFinite(value)) throw new Error(`${name} must be finite`)
  return value
}

function requireInteger(value: number, name: string) {
  requireFinite(value, name)
  if (!Number.isInteger(value)) throw new Error(`${name} must be an integer`)
  return value
}

function requirePositiveInteger(value: number, name: string) {
  requireInteger(value, name)
  if (value <= 0) throw new Error(`${name} must be a positive integer`)
  return value
}

function clampRate(value: number, name: string) {
  requireFinite(value, name)
  return Math.min(1, Math.max(0, value))
}

function sameCell(a: GridCell, b: GridCell) {
  return a.row === b.row && a.column === b.column
}

function validateCell(cell: GridCell, name: string) {
  requireInteger(cell.row, `${name}.row`)
  requireInteger(cell.column, `${name}.column`)
}

function isInside(environment: QLearningEnvironment, cell: GridCell) {
  return cell.row >= 0 && cell.row < environment.height && cell.column >= 0 && cell.column < environment.width
}

function validateEnvironment(environment: QLearningEnvironment) {
  requirePositiveInteger(environment.width, 'environment.width')
  requirePositiveInteger(environment.height, 'environment.height')
  requireFinite(environment.goalReward, 'environment.goalReward')
  requireFinite(environment.stepReward, 'environment.stepReward')
  requireFinite(environment.collisionReward, 'environment.collisionReward')
  validateCell(environment.start, 'environment.start')
  validateCell(environment.goal, 'environment.goal')
  if (!isInside(environment, environment.start) || !isInside(environment, environment.goal)) {
    throw new Error('environment start and goal must be inside the grid')
  }
  for (const obstacle of environment.obstacles) {
    validateCell(obstacle, 'environment.obstacle')
    if (!isInside(environment, obstacle)) throw new Error('environment obstacles must be inside the grid')
  }
}

function validateAction(action: GridAction) {
  if (!Q_LEARNING_ACTIONS.includes(action)) throw new Error('action must be up, right, down, or left')
}

function requireStateValues(qTable: QTable, cell: GridCell) {
  const values = qTable[stateKey(cell)]
  if (!values) throw new Error(`Q table does not contain state ${stateKey(cell)}`)
  for (const action of Q_LEARNING_ACTIONS) requireFinite(values[action], `Q value for ${action}`)
  return values
}

function bestAction(qTable: QTable, cell: GridCell) {
  const values = requireStateValues(qTable, cell)
  let best = Q_LEARNING_ACTIONS[0]
  for (const action of Q_LEARNING_ACTIONS.slice(1)) {
    if (values[action] > values[best]) best = action
  }
  return best
}

function randomUnit(random: () => number) {
  const value = random()
  requireFinite(value, 'random value')
  if (value < 0 || value >= 1) throw new Error('random value must be in [0, 1)')
  return value
}

function checkedSum(a: number, b: number, name: string) {
  const value = a + b
  requireFinite(value, name)
  return value
}

export function stateKey(cell: GridCell) {
  validateCell(cell, 'cell')
  return `${cell.row},${cell.column}`
}

export function createQTable(environment: QLearningEnvironment): QTable {
  validateEnvironment(environment)
  const qTable: QTable = {}

  for (let row = 0; row < environment.height; row += 1) {
    for (let column = 0; column < environment.width; column += 1) {
      const cell = { row, column }
      if (environment.obstacles.some((obstacle) => sameCell(obstacle, cell))) continue
      qTable[stateKey(cell)] = { up: 0, right: 0, down: 0, left: 0 }
    }
  }

  return qTable
}

export function transition(
  environment: QLearningEnvironment,
  cell: GridCell,
  action: GridAction,
): TransitionResult {
  validateEnvironment(environment)
  validateCell(cell, 'cell')
  validateAction(action)
  if (!isInside(environment, cell)) throw new Error('cell must be inside the grid')

  const offsets: Record<GridAction, GridCell> = {
    up: { row: -1, column: 0 },
    right: { row: 0, column: 1 },
    down: { row: 1, column: 0 },
    left: { row: 0, column: -1 },
  }
  const offset = offsets[action]
  const candidate = { row: cell.row + offset.row, column: cell.column + offset.column }

  if (!isInside(environment, candidate)) {
    return { nextState: { ...cell }, reward: environment.stepReward, reachedGoal: false }
  }
  if (environment.obstacles.some((obstacle) => sameCell(obstacle, candidate))) {
    return { nextState: { ...cell }, reward: environment.collisionReward, reachedGoal: false }
  }
  if (sameCell(candidate, environment.goal)) {
    return { nextState: candidate, reward: environment.goalReward, reachedGoal: true }
  }
  return { nextState: candidate, reward: environment.stepReward, reachedGoal: false }
}

export function updateQValue(input: QValueUpdateInput): QValueUpdateResult {
  const oldValue = requireFinite(input.oldValue, 'oldValue')
  const reward = requireFinite(input.reward, 'reward')
  const nextBestValue = requireFinite(input.nextBestValue, 'nextBestValue')
  const learningRate = clampRate(input.learningRate, 'learningRate')
  const discountFactor = clampRate(input.discountFactor, 'discountFactor')
  const discountedNextValue = discountFactor * nextBestValue
  requireFinite(discountedNextValue, 'discounted next-state value')
  const target = checkedSum(reward, discountedNextValue, 'target')
  const correction = learningRate * (target - oldValue)
  requireFinite(correction, 'Q-value correction')
  const newValue = checkedSum(oldValue, correction, 'newValue')

  return { oldValue, target, newValue }
}

export function selectAction(
  qTable: QTable,
  cell: GridCell,
  explorationRate: number,
  random: () => number,
): GridAction {
  const rate = clampRate(explorationRate, 'explorationRate')
  const greedyAction = bestAction(qTable, cell)
  if (rate === 0 || randomUnit(random) >= rate) return greedyAction
  return Q_LEARNING_ACTIONS[Math.floor(randomUnit(random) * Q_LEARNING_ACTIONS.length)]
}

function cloneQTable(qTable: QTable): QTable {
  return Object.fromEntries(Object.entries(qTable).map(([key, values]) => [key, { ...values }]))
}

export function stepQLearningSession(input: QLearningSessionStepInput): QLearningSessionStepResult {
  validateEnvironment(input.environment)
  validateCell(input.currentState, 'currentState')
  const qTable = cloneQTable(input.qTable)
  const currentValues = requireStateValues(qTable, input.currentState)
  const action = selectAction(qTable, input.currentState, input.explorationRate, input.random)
  const result = transition(input.environment, input.currentState, action)
  const nextValues = requireStateValues(qTable, result.nextState)
  const nextBestValue = Math.max(...Q_LEARNING_ACTIONS.map((nextAction) => nextValues[nextAction]))
  const value = updateQValue({
    oldValue: currentValues[action],
    reward: result.reward,
    nextBestValue,
    learningRate: input.learningRate,
    discountFactor: input.discountFactor,
  })
  currentValues[action] = value.newValue
  const update: QUpdate = {
    stateKey: stateKey(input.currentState),
    action,
    reward: result.reward,
    nextStateKey: stateKey(result.nextState),
    ...value,
  }
  return { nextState: { ...result.nextState }, qTable, update, reward: result.reward, reachedGoal: result.reachedGoal }
}

export function runEpisode(
  environment: QLearningEnvironment,
  qTable: QTable,
  options: EpisodeOptions,
): EpisodeResult {
  validateEnvironment(environment)
  const explorationRate = clampRate(options.explorationRate, 'explorationRate')
  const learningRate = clampRate(options.learningRate, 'learningRate')
  const discountFactor = clampRate(options.discountFactor, 'discountFactor')
  let currentState = { ...environment.start }
  let cumulativeReward = 0
  const updates: QUpdate[] = []

  if (sameCell(currentState, environment.goal)) {
    return { qTable, updates, steps: 0, cumulativeReward, reachedGoal: true, finalState: currentState }
  }

  for (let step = 1; step <= MAX_EPISODE_STEPS; step += 1) {
    const action = selectAction(qTable, currentState, explorationRate, options.random)
    const result = transition(environment, currentState, action)
    const currentValues = requireStateValues(qTable, currentState)
    const nextValues = requireStateValues(qTable, result.nextState)
    const nextBestValue = Math.max(...Q_LEARNING_ACTIONS.map((nextAction) => nextValues[nextAction]))
    const update = updateQValue({
      oldValue: currentValues[action],
      reward: result.reward,
      nextBestValue,
      learningRate,
      discountFactor,
    })

    currentValues[action] = update.newValue
    cumulativeReward = checkedSum(cumulativeReward, result.reward, 'cumulativeReward')
    updates.push({
      stateKey: stateKey(currentState),
      action,
      reward: result.reward,
      nextStateKey: stateKey(result.nextState),
      ...update,
    })
    currentState = result.nextState

    if (result.reachedGoal) {
      return { qTable, updates, steps: step, cumulativeReward, reachedGoal: true, finalState: { ...currentState } }
    }
  }

  return {
    qTable,
    updates,
    steps: MAX_EPISODE_STEPS,
    cumulativeReward,
    reachedGoal: false,
    finalState: { ...currentState },
  }
}

export function trainEpisodes(environment: QLearningEnvironment, options: TrainingOptions): TrainingResult {
  requirePositiveInteger(options.episodes, 'episodes')
  requireInteger(options.seed, 'seed')
  const explorationRate = clampRate(options.explorationRate, 'explorationRate')
  const learningRate = clampRate(options.learningRate, 'learningRate')
  const discountFactor = clampRate(options.discountFactor, 'discountFactor')
  const random = createSeededRandom(options.seed)
  const qTable = createQTable(environment)
  const episodes: TrainingResult['episodes'] = []

  for (let episode = 0; episode < options.episodes; episode += 1) {
    const { qTable: _qTable, ...result } = runEpisode(environment, qTable, {
      explorationRate,
      learningRate,
      discountFactor,
      random,
    })
    episodes.push(result)
  }

  return { qTable, episodes }
}

export function evaluateGreedyPolicy(
  environment: QLearningEnvironment,
  qTable: QTable,
  maxSteps: number,
): PolicyEvaluation {
  validateEnvironment(environment)
  requirePositiveInteger(maxSteps, 'maxSteps')
  let currentState = { ...environment.start }
  let cumulativeReward = 0
  const path = [{ ...currentState }]
  const actions: GridAction[] = []

  if (sameCell(currentState, environment.goal)) {
    return { path, actions, steps: 0, cumulativeReward, reachedGoal: true, finalState: currentState }
  }

  for (let step = 1; step <= maxSteps; step += 1) {
    const action = selectAction(qTable, currentState, 0, () => {
      throw new Error('greedy evaluation must not consume randomness')
    })
    const result = transition(environment, currentState, action)
    actions.push(action)
    cumulativeReward = checkedSum(cumulativeReward, result.reward, 'cumulativeReward')
    currentState = result.nextState
    path.push({ ...currentState })

    if (result.reachedGoal) {
      return { path, actions, steps: step, cumulativeReward, reachedGoal: true, finalState: { ...currentState } }
    }
  }

  return {
    path,
    actions,
    steps: maxSteps,
    cumulativeReward,
    reachedGoal: false,
    finalState: { ...currentState },
  }
}
