import test from 'node:test'
import assert from 'node:assert/strict'
import {
  evaluateMlpBackpropBridge,
  type MlpBackpropBridgeInput,
} from '../src/simulations/mlpBackpropBridge.ts'

const input: MlpBackpropBridgeInput = {
  x: 1.2,
  target: 0.4,
  w1: 0.7,
  b1: -0.2,
  w2: 1.1,
  b2: 0.05,
  learningRate: 0.1,
  inspectedParameter: 'w1',
  predictedDirection: 'decrease',
}

test('mlp backprop bridge computes scalar chain-rule gradients and updates', () => {
  const snapshot = evaluateMlpBackpropBridge(input)
  const h = Math.tanh(input.w1 * input.x + input.b1)
  const yHat = input.w2 * h + input.b2
  const error = yHat - input.target
  const dLossDZ1 = error * input.w2 * (1 - h ** 2)

  assert.equal(Number(snapshot.forward.h.toFixed(8)), Number(h.toFixed(8)))
  assert.equal(Number(snapshot.forward.yHat.toFixed(8)), Number(yHat.toFixed(8)))
  assert.equal(Number(snapshot.gradients.w1.toFixed(8)), Number((dLossDZ1 * input.x).toFixed(8)))
  assert.equal(Number(snapshot.gradients.b1.toFixed(8)), Number(dLossDZ1.toFixed(8)))
  assert.equal(Number(snapshot.updates.w1.after.toFixed(8)), Number((input.w1 - input.learningRate * snapshot.gradients.w1).toFixed(8)))
})

test('mlp backprop bridge checks predicted update direction', () => {
  const snapshot = evaluateMlpBackpropBridge(input)

  assert.equal(snapshot.updates.w1.direction, 'decrease')
  assert.equal(snapshot.inspected.parameter, 'w1')
  assert.equal(snapshot.inspected.predictedDirection, 'decrease')
  assert.equal(snapshot.inspected.correct, true)
})
