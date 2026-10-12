import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { contributions, prediction, residual, motionPoints, projectMotion, functionFigures } from '../scripts/generate-function-figures.ts'
import { evaluatePredictionTask } from '../src/modules/math-lab/utils/mathToCode.ts'

test('function figure and controlled lab share the hand calculation and information boundary', () => {
  assert.deepEqual(contributions, [8, -3])
  assert.equal(prediction, 10)
  assert.equal(residual, 1)
  for (const [w1, expected, mse] of [[4, 10, 1], [5, 12, 9], [3.5, 9, 0]]) {
    const result = evaluatePredictionTask({ samples: [{ features: [2, 3], target: 9 }], parameters: { weights: [w1!, -1], bias: 5 } })
    assert.deepEqual(result.predictions, [expected])
    assert.equal(result.mse, mse)
  }
})

test('motion diagram uses the actual straight line, units and constant positive slope', () => {
  assert.deepEqual(motionPoints.map(p => p.position), [2, 5, 8, 11, 14])
  for (let i = 1; i < motionPoints.length; i++) {
    const previous = motionPoints[i - 1]!, current = motionPoints[i]!
    assert.equal((current.position - previous.position) / (current.time - previous.time), 3)
    assert.ok(projectMotion(current.time, current.position).y < projectMotion(previous.time, previous.position).y)
  }
})

test('function SVGs are reproducible and the retired, mismatched bitmaps leave runtime', () => {
  for (const [name, svg] of functionFigures()) assert.equal(readFileSync(new URL('../public/math-lab/diagrams/functions/' + name, import.meta.url), 'utf8'), svg)
  const source = readFileSync(new URL('../src/modules/math-lab/data/calculusFunctionsModule.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /beginner-(function-machine|average-to-derivative)-longform.png|repeat 1A|重新做 1A/)
})
