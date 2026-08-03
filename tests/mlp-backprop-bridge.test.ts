import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { registerHooks } from 'node:module'
import {
  createMlpBackpropGraphState,
  evaluateMlpBackpropGraph,
  normalizeMlpBackpropValues,
  type MlpBackpropGraphState,
  type MlpBackpropParameterId,
} from '../src/simulations/mlpBackpropGraph.ts'

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

const root = new URL('../', import.meta.url)
const read = (path: string) => readFileSync(new URL(path, root), 'utf8')
const close = (actual: number, expected: number, tolerance = 1e-10) => {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} should be within ${tolerance} of ${expected}`)
}

test('scalar graph uses tanh output, squared loss, and exact chain-rule gradients', () => {
  const snapshot = evaluateMlpBackpropGraph(createMlpBackpropGraphState('normal', 'scalar'))
  const { values } = snapshot.state
  const z1 = values.w1[0][0] * values.inputs[0] + values.b1[0]
  const hidden = Math.tanh(z1)
  const z2 = values.w2[0] * hidden + values.b2
  const prediction = Math.tanh(z2)
  const error = prediction - values.target
  const outputDelta = error * (1 - prediction ** 2)
  const hiddenDelta = values.w2[0] * outputDelta * (1 - hidden ** 2)

  close(snapshot.forward.z1[0], z1)
  close(snapshot.forward.hidden[0], hidden)
  close(snapshot.forward.prediction, prediction)
  close(snapshot.forward.loss, 0.5 * error ** 2)
  close(snapshot.reverse.outputDelta, outputDelta)
  close(snapshot.updates.find((item) => item.id === 'w2_1')!.gradient, outputDelta * hidden)
  close(snapshot.updates.find((item) => item.id === 'w1_11')!.gradient, hiddenDelta * values.inputs[0])
})

test('expanded graph matches matrix outer products and sums shared-input branches', () => {
  const snapshot = evaluateMlpBackpropGraph(createMlpBackpropGraphState('branching', 'expanded'))
  assert.equal(snapshot.nodes.filter((node) => node.kind === 'input').length, 2)
  assert.equal(snapshot.nodes.filter((node) => node.kind === 'activation').length, 2)
  assert.equal(snapshot.updates.length, 9)

  const x1Edges = snapshot.edges.filter((edge) => edge.sourceId === 'x1')
  assert.equal(x1Edges.length, 2)
  close(
    snapshot.reverse.inputAdjoints[0],
    x1Edges.reduce((sum, edge) => sum + edge.backwardContribution, 0),
  )

  for (let hiddenIndex = 0; hiddenIndex < 2; hiddenIndex += 1) {
    for (let inputIndex = 0; inputIndex < 2; inputIndex += 1) {
      const id = `w1_${hiddenIndex + 1}${inputIndex + 1}` as MlpBackpropParameterId
      const gradient = snapshot.reverse.hiddenDeltas[hiddenIndex] * snapshot.state.values.inputs[inputIndex]
      close(snapshot.updates.find((item) => item.id === id)!.gradient, gradient)
    }
  }
})

test('reverse-mode analytic gradients agree with central differences', () => {
  for (const preset of ['normal', 'saturated', 'branching'] as const) {
    const mode = preset === 'branching' ? 'expanded' : 'scalar'
    const snapshot = evaluateMlpBackpropGraph(createMlpBackpropGraphState(preset, mode))
    for (const check of snapshot.gradientChecks) {
      assert.ok(Number.isFinite(check.analytic))
      assert.ok(Number.isFinite(check.numerical))
      assert.ok(check.relativeError < 1e-8, `${preset}/${check.parameterId} has relative error ${check.relativeError}`)
    }
  }
})

test('parameter updates use minus learning-rate times gradient and recompute loss', () => {
  const snapshot = evaluateMlpBackpropGraph(createMlpBackpropGraphState('normal', 'scalar'))
  for (const update of snapshot.updates) {
    close(update.delta, -snapshot.state.values.learningRate * update.gradient)
    close(update.after, update.before + update.delta)
  }
  assert.ok(snapshot.lossAfterUpdate < snapshot.forward.loss)
  close(snapshot.forward.loss, 0.017278132792237614)
  close(snapshot.lossAfterUpdate, 0.013424677176003498)
})

test('preset normalization clamps ranges and rejects NaN or Infinity', () => {
  const state = createMlpBackpropGraphState()
  const values = normalizeMlpBackpropValues({
    ...state.values,
    inputs: [Infinity, -20],
    target: Number.NaN,
    learningRate: 8,
    w2: [99, -99],
  }, state.values)

  assert.equal(values.inputs[0], state.values.inputs[0])
  assert.equal(values.inputs[1], -2)
  assert.equal(values.target, state.values.target)
  assert.equal(values.learningRate, 1)
  assert.deepEqual(values.w2, [5, -5])

  const malformed: MlpBackpropGraphState = { ...state, phase: 'forward', cursor: Number.POSITIVE_INFINITY, values }
  const snapshot = evaluateMlpBackpropGraph(malformed)
  assert.equal(snapshot.state.cursor, -1)
  assert.ok(snapshot.nodes.every((node) => Number.isFinite(node.value) && Number.isFinite(node.adjoint)))
})

test('the dedicated graph is lazy, keyboard-ready, and is the only backprop course lab', () => {
  assert.ok(existsSync(new URL('src/components/mlp/MlpBackpropGraphLab.vue', root)))
  const component = read('src/components/mlp/MlpBackpropGraphLab.vue')
  const algorithmView = read('src/views/AlgorithmView.vue')

  assert.match(component, /evaluateMlpBackpropGraph/)
  assert.match(component, /prefers-reduced-motion/)
  assert.match(component, /ArrowLeft/)
  assert.match(component, /aria-label/)
  assert.match(component, /gradientChecks/)
  assert.match(algorithmView, /defineAsyncComponent\([\s\S]*components\/mlp\/MlpBackpropGraphLab\.vue/)
  assert.match(algorithmView, /MlpBackpropGraphLab[\s\S]*section\.id === 'backprop'/)
  assert.match(algorithmView, /<section v-else class="mlp-playground-stage">/)
  assert.doesNotMatch(algorithmView, /MlpBackpropBridgeLab/)
})

test('backprop lesson publishes one primary video with chapters and safe transcripts', async () => {
  const { mlpModule } = await import('../src/data/mlpModule.ts')
  const chapter = mlpModule.chapters.find((item) => item.id === 'backprop')!
  assert.deepEqual(chapter.visualIds, ['mlp-backprop-video'])
  for (const language of ['zh-CN', 'en'] as const) {
    assert.match(chapter.markdown[language], /reverse-mode|Reverse-mode|自动微分/)
    assert.match(chapter.markdown[language], /2\\to2\\to1/)
    assert.match(chapter.markdown[language], /中心差分|central difference/)
    assert.doesNotMatch(chapter.markdown[language], /来源参考|### Ref ID/)
  }

  const visual = mlpModule.visuals!.find((item) => item.id === 'mlp-backprop-video')!
  assert.equal(visual.type, 'manim-video')
  assert.equal(visual.chapterMarkers?.length, 6)
  assert.ok(visual.transcript?.['zh-CN'] && visual.transcript.en)
})
