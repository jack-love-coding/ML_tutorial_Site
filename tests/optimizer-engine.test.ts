import assert from 'node:assert/strict'
import test from 'node:test'
import { registerHooks } from 'node:module'
import {
  createOptimizerState,
  learningRateForStep,
  stepOptimizer,
} from '../src/simulations/optimizers/index.ts'
import {
  evaluateOptimizerRace,
  optimizerGradient,
} from '../src/modules/math-lab/utils/optimizers.ts'

registerHooks({
  resolve(specifier, context, nextResolve) {
    try {
      return nextResolve(specifier, context)
    } catch (error) {
      if ((specifier.startsWith('.') || specifier.startsWith('/')) && !/\.[cm]?[jt]sx?$/.test(specifier)) {
        return nextResolve(`${specifier}.ts`, context)
      }
      throw error
    }
  },
})

const { createMlpPlaygroundSession, DEFAULT_MLP_PLAYGROUND_STATE } = await import('../src/simulations/mlpPlayground.ts')

const near = (actual: number, expected: number, tolerance = 1e-10) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`)
}

test('shared optimizer engine locks the first two SGD, Momentum, RMSProp, and Adam updates', () => {
  const cases = [
    { config: { kind: 'sgd', learningRate: 0.1 } as const, expected: [0.75] },
    { config: { kind: 'momentum', learningRate: 0.1, momentum: 0.9, dampening: 0.1 } as const, expected: [0.575] },
    { config: { kind: 'rmsprop', learningRate: 0.1, alpha: 0.9, epsilon: 1e-8 } as const, expected: [0.6031899439] },
    { config: { kind: 'adam', learningRate: 0.1, beta1: 0.9, beta2: 0.999, epsilon: 1e-8 } as const, expected: [0.8169402477] },
  ]

  for (const { config, expected } of cases) {
    const first = stepOptimizer([1], [2], config, createOptimizerState(config, 1))
    const second = stepOptimizer(first.parametersAfter, [0.5], config, first.state)
    near(second.parametersAfter[0]!, expected[0]!, 1e-8)
    assert.equal(second.state.step, 2)
  }
})

test('Momentum first buffer, Adam bias correction, and AdamW decoupling follow their declared state recurrences', () => {
  const momentum = { kind: 'momentum', learningRate: 0.1, momentum: 0.9, dampening: 0.5 } as const
  const momentumFirst = stepOptimizer([1], [2], momentum, createOptimizerState(momentum, 1))
  assert.deepEqual(momentumFirst.state, { kind: 'momentum', step: 1, velocity: [2], hasVelocity: true })
  const momentumSecond = stepOptimizer(momentumFirst.parametersAfter, [2], momentum, momentumFirst.state)
  near(momentumSecond.state.kind === 'momentum' ? momentumSecond.state.velocity[0]! : 0, 2.8)

  const adam = { kind: 'adam', learningRate: 0.1, beta1: 0.9, beta2: 0.999, epsilon: 1e-8 } as const
  const adamFirst = stepOptimizer([1], [2], adam, createOptimizerState(adam, 1))
  assert.equal(adamFirst.state.kind, 'adam')
  if (adamFirst.state.kind === 'adam') {
    near(adamFirst.state.firstMoment[0]!, 0.2)
    near(adamFirst.state.secondMoment[0]!, 0.004)
    near(adamFirst.parametersAfter[0]!, 0.9, 1e-8)
  }

  const l2 = stepOptimizer([1], [0], { ...adam, weightDecay: { kind: 'l2', coefficient: 0.1 } }, createOptimizerState({ ...adam, weightDecay: { kind: 'l2', coefficient: 0.1 } }, 1))
  const adamwConfig = { ...adam, weightDecay: { kind: 'adamw', coefficient: 0.1 } } as const
  const adamw = stepOptimizer([1], [0], adamwConfig, createOptimizerState(adamwConfig, 1))
  near(l2.parametersAfter[0]!, 0.9, 1e-8)
  near(adamw.parametersAfter[0]!, 0.99)
})

test('scheduler values use optimizer-before-scheduler cadence and reject invalid inputs', () => {
  assert.deepEqual(
    [0, 1, 2, 3].map((step) => learningRateForStep(1, { kind: 'step', stepSize: 2, gamma: 0.1 }, step)),
    [1, 1, 0.1, 0.1],
  )
  assert.deepEqual(
    [0, 1, 2, 3, 4].map((step) => learningRateForStep(1, { kind: 'warmup-cosine', warmupSteps: 2, totalSteps: 4 }, step)),
    [0.5, 1, 1, 0.5, 0],
  )
  assert.throws(() => createOptimizerState({ kind: 'adam', learningRate: 0, beta1: 0.9, beta2: 0.999, epsilon: 1e-8 }, 1), /learning rate/)
  assert.throws(() => stepOptimizer([1], [Number.NaN], { kind: 'sgd', learningRate: 0.1 }, createOptimizerState({ kind: 'sgd', learningRate: 0.1 }, 1)), /gradients/)
  assert.throws(() => stepOptimizer([1], [1], { kind: 'sgd', learningRate: 0.1, weightDecay: { kind: 'adamw', coefficient: 0.1 } }, createOptimizerState({ kind: 'sgd', learningRate: 0.1 }, 1)), /AdamW/)
})

test('legacy Math Lab optimizer paths match the shared engine recurrences', () => {
  const legacy = evaluateOptimizerRace({ preset: 'narrow-ravine', learningRate: 0.08, steps: 2, momentumBeta: 0.85, beta2: 0.95, epsilon: 1e-8 })
  const start = [legacy.preset.start.x, legacy.preset.start.y]
  const configs = {
    sgd: { kind: 'sgd', learningRate: 0.08 },
    momentum: { kind: 'momentum', learningRate: 0.08, momentum: 0.85 },
    rmsprop: { kind: 'rmsprop', learningRate: 0.08, alpha: 0.95, epsilon: 1e-8 },
    adam: { kind: 'adam', learningRate: 0.08, beta1: 0.85, beta2: 0.95, epsilon: 1e-8 },
  } as const

  for (const kind of legacy.optimizerOrder) {
    const config = configs[kind]
    let parameters = [...start]
    let state = createOptimizerState(config, 2)
    for (let step = 0; step < 2; step += 1) {
      const gradient = optimizerGradient({ x: parameters[0]!, y: parameters[1]! }, legacy.preset)
      const trace = stepOptimizer(parameters, [gradient.x, gradient.y], config, state)
      parameters = trace.parametersAfter
      state = trace.state
    }
    const expected = legacy.runs[kind].path.at(-1)!
    near(parameters[0]!, expected.x)
    near(parameters[1]!, expected.y)
  }
})

test('MLP playground keeps its historical default SGD path and exposes an explicit optimizer seam', () => {
  const legacy = createMlpPlaygroundSession(DEFAULT_MLP_PLAYGROUND_STATE).step(2)
  const explicitSgd = createMlpPlaygroundSession({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    optimizer: { kind: 'sgd', learningRate: DEFAULT_MLP_PLAYGROUND_STATE.learningRate },
  }).step(2)
  const adam = createMlpPlaygroundSession({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    optimizer: { kind: 'adam', learningRate: 0.01, beta1: 0.9, beta2: 0.999, epsilon: 1e-8 },
  }).step(2)

  near(legacy.trainLoss, explicitSgd.trainLoss, 1e-12)
  assert.ok(Number.isFinite(adam.trainLoss) && Number.isFinite(adam.testLoss))
  assert.notEqual(adam.trainLoss, legacy.trainLoss)
})

test('MLP optimizer changes establish deterministic state boundaries and removal restores the legacy update path', () => {
  const adamConfig = { kind: 'adam', learningRate: 0.01, beta1: 0.9, beta2: 0.999, epsilon: 1e-8 } as const
  const momentumConfig = { kind: 'momentum', learningRate: 0.02, momentum: 0.9 } as const
  const changedFromLegacy = createMlpPlaygroundSession(DEFAULT_MLP_PLAYGROUND_STATE)
  changedFromLegacy.updateState({ optimizer: adamConfig })
  const directAdam = createMlpPlaygroundSession({ ...DEFAULT_MLP_PLAYGROUND_STATE, optimizer: adamConfig })
  near(changedFromLegacy.step(1).trainLoss, directAdam.step(1).trainLoss, 1e-12)

  const changedKind = createMlpPlaygroundSession({ ...DEFAULT_MLP_PLAYGROUND_STATE, optimizer: adamConfig })
  changedKind.step(1)
  changedKind.updateState({ optimizer: momentumConfig })
  assert.doesNotThrow(() => changedKind.step(1))

  changedKind.updateState({ optimizer: undefined })
  assert.equal(changedKind.snapshot().state.optimizer, undefined)
  assert.doesNotThrow(() => changedKind.step(1))
})

test('MLP explicit optimizers preserve link-only Playground L1/L2 controls and keep optimizer decay off biases', () => {
  const sgd = { kind: 'sgd', learningRate: DEFAULT_MLP_PLAYGROUND_STATE.learningRate } as const
  const baseline = createMlpPlaygroundSession({ ...DEFAULT_MLP_PLAYGROUND_STATE, optimizer: sgd }).step(1)
  const l2 = createMlpPlaygroundSession({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    optimizer: sgd,
    regularizationType: 'l2',
    regularizationRate: 1,
  }).step(1)
  assert.notDeepEqual(l2.links.map((link) => link.weight), baseline.links.map((link) => link.weight))

  const l1 = createMlpPlaygroundSession({
    ...DEFAULT_MLP_PLAYGROUND_STATE,
    optimizer: sgd,
    regularizationType: 'l1',
    regularizationRate: 10,
  }).step(1)
  assert.ok(l1.links.some((link) => link.isDead))

  const adam = { kind: 'adam', learningRate: 0.01, beta1: 0.9, beta2: 0.999, epsilon: 1e-8 } as const
  const adamW = { ...adam, weightDecay: { kind: 'adamw', coefficient: 0.1 } } as const
  // A 50-point train split with one 50-point batch isolates one optimizer update:
  // differing links must not feed back into a later bias gradient in this assertion.
  const singleUpdate = { ...DEFAULT_MLP_PLAYGROUND_STATE, trainRatio: 0.1, batchSize: 50 }
  const plainAdam = createMlpPlaygroundSession({ ...singleUpdate, optimizer: adam }).step(1)
  const decayedAdam = createMlpPlaygroundSession({ ...singleUpdate, optimizer: adamW }).step(1)
  assert.deepEqual(
    decayedAdam.layers.slice(1).flat().map((node) => node.bias),
    plainAdam.layers.slice(1).flat().map((node) => node.bias),
  )
  assert.notDeepEqual(decayedAdam.links.map((link) => link.weight), plainAdam.links.map((link) => link.weight))
})
