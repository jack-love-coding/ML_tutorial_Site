import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { center, curveSamples, derivativeFigures, forwardSlopes, lossAt, project, slopeAt, tangentAt } from '../scripts/generate-derivative-figures.ts'
import { centralDifference } from '../src/modules/math-lab/utils/mathToCode.ts'

test('derivative figure matches the course batch, slope direction and local approximation', () => {
  assert.equal(center, -1)
  assert.equal(lossAt(center), 2.5)
  assert.equal(slopeAt(center), -5)
  assert.ok(Math.abs(centralDifference(lossAt, center, .0001) - slopeAt(center)) < 1e-9)
  assert.equal(tangentAt(center), lossAt(center))
  assert.ok(Math.abs(lossAt(-.99) - 2.45125) < 1e-10)
  assert.ok(Math.abs(tangentAt(-.99) - 2.45) < 1e-10)
  // SVG y is inverted: both actual loss and tangent must go down on the screen when x moves right.
  const start = project(center, lossAt(center))
  for (const fn of [lossAt, tangentAt]) assert.ok(project(-.99, fn(-.99)).y > start.y)
  for (const p of curveSamples) assert.ok(Math.abs(p.y - (12.5 * (p.x + 1) ** 2 - 5 * (p.x + 1) + 2.5)) < 1e-10)
})

test('forward secants converge and every displayed endpoint lies on the curve', () => {
  let previousError = Infinity
  for (const { h, slope } of forwardSlopes) {
    assert.ok(Math.abs(lossAt(center) + slope * h - lossAt(center + h)) < 1e-12)
    const error = Math.abs(slope - slopeAt(center))
    assert.ok(error < previousError)
    previousError = error
  }
  for (const h of [.2, .1, .02]) assert.ok(Math.abs(centralDifference(lossAt, center, h) + 5) < 1e-10, 'central difference is exact for this quadratic in real arithmetic')
})

test('committed derivative SVGs are generated from the checked mathematics', () => {
  for (const [name, svg] of derivativeFigures()) assert.equal(readFileSync(new URL('../public/math-lab/diagrams/derivatives/' + name, import.meta.url), 'utf8'), svg)
  const source = readFileSync(new URL('../src/modules/math-lab/data/calculusDerivativesModule.ts', import.meta.url), 'utf8')
  assert.doesNotMatch(source, /beginner-derivative-(tangent|window)-longform.png/)
  assert.match(source, /loss-tangent.svg/)
  assert.match(source, /loss-secants.svg/)
})
